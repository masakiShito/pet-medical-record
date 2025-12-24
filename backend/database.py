import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Database session dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from models import Base, User

    Base.metadata.create_all(bind=engine)

    # Create default user for MVP
    db = SessionLocal()
    try:
        existing_user = db.query(User).first()
        if not existing_user:
            default_user = User(name="Default User")
            db.add(default_user)
            db.commit()
            print("Default user created")
    finally:
        db.close()
