# AICoach

An AI-powered fitness and health tracking application.

## Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Python + FastAPI
- **Database:** PostgreSQL

## Local development

### 1. Database

Start Postgres via Docker:

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` — should return `{"status": "ok", "database": "ok"}`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` — should show the backend health status.

## Project status

**Phase 0: scaffolding** — backend, frontend, and database are wired together with a health check. No product features yet.
