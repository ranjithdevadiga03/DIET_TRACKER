# DEIT Tracker

AI-powered food nutrition tracker with image recognition and daily intake tracking.

## Features

- **Food Recognition** — Upload food photos, get instant nutrition data using DeiT vision model
- **Daily Tracking** — Color-coded progress bars for calories, protein, carbs, and fat
- **History Calendar** — Visual calendar showing daily intake completion (red → green)
- **User Profiles** — Body weight-based daily goals with persistent storage

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite, PyTorch (DeiT model)
- **Frontend:** React 18, Vite 5, Tailwind CSS 3
- **Model:** DeiT fine-tuned on Food-101 dataset

## Run

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update weight |
| POST | `/analyze` | Analyze food image |
| POST | `/api/intake/log` | Log food intake |
| GET | `/api/intake/today` | Get today's intake |
| DELETE | `/api/intake/clear` | Clear today's intake |
| GET | `/api/intake/history` | Get intake history |
| GET | `/api/intake/day/{date}` | Get specific day intake |
