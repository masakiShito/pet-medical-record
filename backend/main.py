import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from contextlib import asynccontextmanager

from database import engine, init_db
from routes import pets, records


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    print("Initializing database...")
    init_db()
    print("Database initialized")
    yield


app = FastAPI(lifespan=lifespan)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pets.router, prefix="/api")
app.include_router(records.router, prefix="/api")


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/api/db/health")
def db_health_check() -> dict:
    if engine is None:
        return {"status": "error", "detail": "DATABASE_URL is not set"}
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as exc:
        return {"detail": "Database connection failed"}
