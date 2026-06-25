import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "app.db")

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    echo=False,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    weight_kg = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    logs = relationship("IntakeLog", back_populates="user")


class IntakeLog(Base):
    __tablename__ = "intake_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food = Column(String(100), nullable=False)
    calories = Column(Float, default=0)
    protein = Column(Float, default=0)
    carbs = Column(Float, default=0)
    fat = Column(Float, default=0)
    confidence = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="logs")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
