from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.detector import FoodDetector
from app.auth import router as auth_router, get_current_user

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")

detector = FoodDetector()


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": not detector.use_mock}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...), _user=Depends(get_current_user)):
    image_bytes = await file.read()
    result = detector.detect(image_bytes)
    return result
