import os
from fastapi import FastAPI, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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


BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BACKEND_DIR, "..", "frontend", "dist")
FRONTEND_DIR = os.path.abspath(FRONTEND_DIR)

ASSETS_DIR = os.path.join(FRONTEND_DIR, "assets")

if os.path.isdir(FRONTEND_DIR) and os.path.isfile(os.path.join(FRONTEND_DIR, "index.html")):
    if os.path.isdir(ASSETS_DIR):
        app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
