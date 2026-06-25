import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, User, IntakeLog

router = APIRouter()
security = HTTPBearer()

SECRET_KEY = "deit-tracker-secret-key-change-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = 72


class RegisterRequest(BaseModel):
    username: str
    password: str
    weight_kg: float | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UpdateProfileRequest(BaseModel):
    weight_kg: float | None = None
    password: str | None = None


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRY_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        weight_kg=req.weight_kg,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "weight_kg": user.weight_kg,
        },
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_token(user.id)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "weight_kg": user.weight_kg,
        },
    }


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "weight_kg": user.weight_kg,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/profile")
def update_profile(req: UpdateProfileRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.weight_kg is not None:
        user.weight_kg = req.weight_kg
    if req.password:
        user.password_hash = hash_password(req.password)
    db.commit()
    return {"message": "Profile updated"}


@router.post("/intake/log")
def log_intake(data: dict, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = IntakeLog(
        user_id=user.id,
        food=data.get("food", "Unknown"),
        calories=data.get("calories", 0),
        protein=data.get("protein", 0),
        carbs=data.get("carbs", 0),
        fat=data.get("fat", 0),
        confidence=data.get("confidence", 0),
    )
    db.add(log)
    db.commit()
    return {"message": "Intake logged"}


@router.get("/intake/today")
def get_today_intake(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    logs = (
        db.query(IntakeLog)
        .filter(IntakeLog.user_id == user.id, IntakeLog.created_at >= str(today))
        .order_by(IntakeLog.created_at.desc())
        .all()
    )

    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    history = []
    for log in logs:
        totals["calories"] += log.calories
        totals["protein"] += log.protein
        totals["carbs"] += log.carbs
        totals["fat"] += log.fat
        history.append({
            "food": log.food,
            "calories": log.calories,
            "protein": log.protein,
            "carbs": log.carbs,
            "fat": log.fat,
            "confidence": log.confidence,
            "time": log.created_at.isoformat() if log.created_at else None,
        })

    return {"totals": totals, "history": history}


@router.get("/intake/history")
def get_intake_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = (
        db.query(IntakeLog)
        .filter(IntakeLog.user_id == user.id)
        .order_by(IntakeLog.created_at.desc())
        .all()
    )

    days = {}
    for log in logs:
        day_key = log.created_at.date().isoformat() if log.created_at else None
        if not day_key:
            continue
        if day_key not in days:
            days[day_key] = {"date": day_key, "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "count": 0, "foods": []}
        days[day_key]["calories"] += log.calories
        days[day_key]["protein"] += log.protein
        days[day_key]["carbs"] += log.carbs
        days[day_key]["fat"] += log.fat
        days[day_key]["count"] += 1
        days[day_key]["foods"].append({
            "food": log.food,
            "calories": log.calories,
            "protein": log.protein,
            "carbs": log.carbs,
            "fat": log.fat,
            "time": log.created_at.isoformat() if log.created_at else None,
        })

    return {"days": list(days.values()), "weight_kg": user.weight_kg}


@router.get("/intake/day/{date}")
def get_day_intake(date: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = (
        db.query(IntakeLog)
        .filter(IntakeLog.user_id == user.id, IntakeLog.created_at >= date, IntakeLog.created_at < f"{date}T23:59:59")
        .order_by(IntakeLog.created_at.desc())
        .all()
    )

    totals = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    history = []
    for log in logs:
        totals["calories"] += log.calories
        totals["protein"] += log.protein
        totals["carbs"] += log.carbs
        totals["fat"] += log.fat
        history.append({
            "food": log.food,
            "calories": log.calories,
            "protein": log.protein,
            "carbs": log.carbs,
            "fat": log.fat,
            "time": log.created_at.isoformat() if log.created_at else None,
        })

    return {"date": date, "totals": totals, "history": history}


@router.delete("/intake/clear")
def clear_today_intake(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    db.query(IntakeLog).filter(
        IntakeLog.user_id == user.id, IntakeLog.created_at >= str(today)
    ).delete()
    db.commit()
    return {"message": "Today's intake cleared"}
