from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import date, datetime

from database import get_db
from models import Pet, Record, RecordMedication
import schemas

router = APIRouter(prefix="/pets/{pet_id}/medications", tags=["medications"])


def verify_pet_exists(pet_id: int, db: Session) -> Pet:
    """Verify pet exists and is not deleted"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


def get_or_create_record(pet_id: int, start_on: date, db: Session) -> Record:
    """Get or create a record for the given date"""
    record = (
        db.query(Record)
        .filter(
            Record.pet_id == pet_id,
            Record.recorded_on == start_on,
            Record.is_deleted == 0,
        )
        .first()
    )

    if not record:
        record = Record(pet_id=pet_id, recorded_on=start_on)
        db.add(record)
        db.flush()

    return record


@router.get("", response_model=schemas.MedicationList)
def get_medications(
    pet_id: int,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Get medications for a pet"""
    verify_pet_exists(pet_id, db)

    # Join with records to filter by pet_id
    query = (
        db.query(RecordMedication, Record.pet_id)
        .join(Record, RecordMedication.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordMedication.is_deleted == 0,
        )
    )

    if from_date:
        query = query.filter(
            or_(
                RecordMedication.end_on >= from_date,
                RecordMedication.end_on.is_(None),
            )
        )
    if to_date:
        query = query.filter(RecordMedication.start_on <= to_date)

    total = query.count()
    results = query.order_by(RecordMedication.start_on.desc()).limit(limit).offset(offset).all()

    items = []
    for medication, pet_id_from_record in results:
        items.append(
            schemas.Medication(
                id=medication.id,
                pet_id=pet_id,
                name=medication.name,
                dosage=medication.dosage,
                frequency=medication.frequency,
                start_on=medication.start_on,
                end_on=medication.end_on,
                note=medication.note,
                created_at=medication.created_at,
                updated_at=medication.updated_at,
            )
        )

    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.get("/active", response_model=schemas.MedicationList)
def get_active_medications(
    pet_id: int,
    db: Session = Depends(get_db),
):
    """Get active (ongoing) medications for a pet"""
    verify_pet_exists(pet_id, db)

    today = date.today()

    query = (
        db.query(RecordMedication, Record.pet_id)
        .join(Record, RecordMedication.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordMedication.is_deleted == 0,
            or_(
                RecordMedication.end_on >= today,
                RecordMedication.end_on.is_(None),
            ),
        )
    )

    results = query.order_by(RecordMedication.start_on.desc()).all()

    items = []
    for medication, pet_id_from_record in results:
        items.append(
            schemas.Medication(
                id=medication.id,
                pet_id=pet_id,
                name=medication.name,
                dosage=medication.dosage,
                frequency=medication.frequency,
                start_on=medication.start_on,
                end_on=medication.end_on,
                note=medication.note,
                created_at=medication.created_at,
                updated_at=medication.updated_at,
            )
        )

    return {"items": items, "total": len(items), "limit": len(items), "offset": 0}


@router.post("", response_model=schemas.ItemResponse, status_code=201)
def create_medication(
    pet_id: int, medication_data: schemas.MedicationCreate, db: Session = Depends(get_db)
):
    """Create a new medication"""
    verify_pet_exists(pet_id, db)

    try:
        # Get or create record for the start date
        record = get_or_create_record(pet_id, medication_data.start_on, db)

        medication = RecordMedication(
            record_id=record.id,
            name=medication_data.name,
            dosage=medication_data.dosage,
            frequency=medication_data.frequency,
            start_on=medication_data.start_on,
            end_on=medication_data.end_on,
            note=medication_data.note,
        )
        db.add(medication)
        db.commit()
        db.refresh(medication)

        return {
            "item": {
                "id": medication.id,
                "pet_id": pet_id,
                "name": medication.name,
                "dosage": medication.dosage,
                "frequency": medication.frequency,
                "start_on": medication.start_on,
                "end_on": medication.end_on,
                "note": medication.note,
                "created_at": medication.created_at,
                "updated_at": medication.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{med_id}", response_model=schemas.ItemResponse)
def get_medication(pet_id: int, med_id: int, db: Session = Depends(get_db)):
    """Get medication detail"""
    verify_pet_exists(pet_id, db)

    medication = (
        db.query(RecordMedication)
        .join(Record, RecordMedication.record_id == Record.id)
        .filter(
            RecordMedication.id == med_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordMedication.is_deleted == 0,
        )
        .first()
    )

    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")

    return {
        "item": {
            "id": medication.id,
            "pet_id": pet_id,
            "name": medication.name,
            "dosage": medication.dosage,
            "frequency": medication.frequency,
            "start_on": medication.start_on,
            "end_on": medication.end_on,
            "note": medication.note,
            "created_at": medication.created_at,
            "updated_at": medication.updated_at,
        }
    }


@router.put("/{med_id}", response_model=schemas.ItemResponse)
def update_medication(
    pet_id: int,
    med_id: int,
    medication_data: schemas.MedicationUpdate,
    db: Session = Depends(get_db),
):
    """Update medication"""
    verify_pet_exists(pet_id, db)

    medication = (
        db.query(RecordMedication)
        .join(Record, RecordMedication.record_id == Record.id)
        .filter(
            RecordMedication.id == med_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordMedication.is_deleted == 0,
        )
        .first()
    )

    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")

    try:
        medication.name = medication_data.name
        medication.dosage = medication_data.dosage
        medication.frequency = medication_data.frequency
        medication.start_on = medication_data.start_on
        medication.end_on = medication_data.end_on
        medication.note = medication_data.note

        db.commit()
        db.refresh(medication)

        return {
            "item": {
                "id": medication.id,
                "pet_id": pet_id,
                "name": medication.name,
                "dosage": medication.dosage,
                "frequency": medication.frequency,
                "start_on": medication.start_on,
                "end_on": medication.end_on,
                "note": medication.note,
                "created_at": medication.created_at,
                "updated_at": medication.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{med_id}", status_code=204)
def delete_medication(pet_id: int, med_id: int, db: Session = Depends(get_db)):
    """Logical delete of medication"""
    verify_pet_exists(pet_id, db)

    medication = (
        db.query(RecordMedication)
        .join(Record, RecordMedication.record_id == Record.id)
        .filter(
            RecordMedication.id == med_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordMedication.is_deleted == 0,
        )
        .first()
    )

    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")

    medication.is_deleted = 1
    db.commit()

    return None
