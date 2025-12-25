"""
Database migration script
Drops all tables and recreates them with the new schema
"""

from database import engine, Base
from models import User, Pet, Record, RecordWeight, RecordMedication, RecordVetVisit


def migrate_database():
    """Drop all tables and recreate with new schema"""
    print("Starting database migration...")

    # Drop all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("All tables dropped")

    # Create all tables with new schema
    print("Creating tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("All tables created")

    print("Database migration completed successfully!")


if __name__ == "__main__":
    migrate_database()
