from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.session import engine

app = FastAPI(title="AICoach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        database_status = "ok"
    except Exception as exc:
        database_status = f"error: {exc}"

    return {"status": "ok", "database": database_status}
