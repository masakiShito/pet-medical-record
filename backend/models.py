from datetime import datetime
from sqlalchemy import (
    Column,
    BigInteger,
    String,
    Date,
    DateTime,
    Text,
    Integer,
    ForeignKey,
    DECIMAL,
    SmallInteger,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    pets = relationship("Pet", back_populates="user")


class Pet(Base):
    __tablename__ = "pets"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=True)
    sex = Column(String(20), nullable=True)
    birth_date = Column(Date, nullable=True)
    photo_url = Column(String(500), nullable=True)
    is_deleted = Column(SmallInteger, nullable=False, default=0)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="pets")
    records = relationship("Record", back_populates="pet")


class Record(Base):
    __tablename__ = "records"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    pet_id = Column(BigInteger, ForeignKey("pets.id"), nullable=False)
    recorded_on = Column(Date, nullable=False)
    condition = Column(String(20), nullable=True)
    note = Column(Text, nullable=True)
    is_deleted = Column(SmallInteger, nullable=False, default=0)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    pet = relationship("Pet", back_populates="records")
    weights = relationship("RecordWeight", back_populates="record")
    medications = relationship("RecordMedication", back_populates="record")
    vet_visits = relationship("RecordVetVisit", back_populates="record")


class RecordWeight(Base):
    __tablename__ = "record_weights"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    record_id = Column(BigInteger, ForeignKey("records.id"), nullable=False)
    measured_on = Column(Date, nullable=False)
    weight_kg = Column(DECIMAL(5, 2), nullable=False)
    note = Column(String(500), nullable=True)
    is_deleted = Column(SmallInteger, nullable=False, default=0)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    record = relationship("Record", back_populates="weights")


class RecordMedication(Base):
    __tablename__ = "record_medications"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    record_id = Column(BigInteger, ForeignKey("records.id"), nullable=False)
    name = Column(String(200), nullable=False)
    dosage = Column(String(200), nullable=True)
    frequency = Column(String(200), nullable=True)
    start_on = Column(Date, nullable=False)
    end_on = Column(Date, nullable=True)
    note = Column(Text, nullable=True)
    is_deleted = Column(SmallInteger, nullable=False, default=0)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    record = relationship("Record", back_populates="medications")


class RecordVetVisit(Base):
    __tablename__ = "record_vet_visits"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    record_id = Column(BigInteger, ForeignKey("records.id"), nullable=False)
    visited_on = Column(Date, nullable=False)
    hospital_name = Column(String(200), nullable=True)
    doctor_name = Column(String(200), nullable=True)
    chief_complaint = Column(String(500), nullable=True)
    diagnosis = Column(String(500), nullable=True)
    cost_yen = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)
    is_deleted = Column(SmallInteger, nullable=False, default=0)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    record = relationship("Record", back_populates="vet_visits")
