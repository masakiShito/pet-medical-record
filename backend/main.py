import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import create_engine

app = FastAPI()

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

database_url = os.getenv("DATABASE_URL")
engine = create_engine(database_url, pool_pre_ping=True) if database_url else None


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/db/health")
def db_health_check() -> dict:
    if engine is None:
        return {"status": "error", "detail": "DATABASE_URL is not set"}
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as exc:  # pragma: no cover - runtime check
        return {"status": "error", "detail": str(exc)}
