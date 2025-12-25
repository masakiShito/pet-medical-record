from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from database import get_db
from models import Pet, Record, RecordWeight
import schemas

router = APIRouter(prefix="/pets/{pet_id}/weights", tags=["weights"])


def verify_pet_exists(pet_id: int, db: Session) -> Pet:
    """Verify pet exists and is not deleted"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


def get_or_create_record(pet_id: int, measured_on: date, db: Session) -> Record:
    """Get or create a record for the given date"""
    record = (
        db.query(Record)
        .filter(
            Record.pet_id == pet_id,
            Record.recorded_on == measured_on,
            Record.is_deleted == 0,
        )
        .first()
    )

    if not record:
        record = Record(pet_id=pet_id, recorded_on=measured_on)
        db.add(record)
        db.flush()

    return record


@router.get("", response_model=schemas.WeightList)
def get_weights(
    pet_id: int,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    limit: int = 200,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Get weights for a pet"""
    verify_pet_exists(pet_id, db)

    # Join with records to filter by pet_id
    query = (
        db.query(RecordWeight, Record.pet_id)
        .join(Record, RecordWeight.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordWeight.is_deleted == 0,
        )
    )

    if from_date:
        query = query.filter(RecordWeight.measured_on >= from_date)
    if to_date:
        query = query.filter(RecordWeight.measured_on <= to_date)

    total = query.count()
    results = query.order_by(RecordWeight.measured_on.desc()).limit(limit).offset(offset).all()

    items = []
    for weight, pet_id_from_record in results:
        items.append(
            schemas.Weight(
                id=weight.id,
                pet_id=pet_id,
                measured_on=weight.measured_on,
                weight_kg=weight.weight_kg,
                note=weight.note,
                created_at=weight.created_at,
                updated_at=weight.updated_at,
            )
        )

    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=schemas.ItemResponse, status_code=201)
def create_weight(
    pet_id: int, weight_data: schemas.WeightCreate, db: Session = Depends(get_db)
):
    """Create a new weight"""
    verify_pet_exists(pet_id, db)

    try:
        # Get or create record for the measured date
        record = get_or_create_record(pet_id, weight_data.measured_on, db)

        weight = RecordWeight(
            record_id=record.id,
            measured_on=weight_data.measured_on,
            weight_kg=weight_data.weight_kg,
            note=weight_data.note,
        )
        db.add(weight)
        db.commit()
        db.refresh(weight)

        return {
            "item": {
                "id": weight.id,
                "pet_id": pet_id,
                "measured_on": weight.measured_on,
                "weight_kg": float(weight.weight_kg),
                "note": weight.note,
                "created_at": weight.created_at,
                "updated_at": weight.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{weight_id}", response_model=schemas.ItemResponse)
def get_weight(pet_id: int, weight_id: int, db: Session = Depends(get_db)):
    """Get weight detail"""
    verify_pet_exists(pet_id, db)

    weight = (
        db.query(RecordWeight)
        .join(Record, RecordWeight.record_id == Record.id)
        .filter(
            RecordWeight.id == weight_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordWeight.is_deleted == 0,
        )
        .first()
    )

    if not weight:
        raise HTTPException(status_code=404, detail="Weight not found")

    return {
        "item": {
            "id": weight.id,
            "pet_id": pet_id,
            "measured_on": weight.measured_on,
            "weight_kg": float(weight.weight_kg),
            "note": weight.note,
            "created_at": weight.created_at,
            "updated_at": weight.updated_at,
        }
    }


@router.put("/{weight_id}", response_model=schemas.ItemResponse)
def update_weight(
    pet_id: int,
    weight_id: int,
    weight_data: schemas.WeightUpdate,
    db: Session = Depends(get_db),
):
    """Update weight"""
    verify_pet_exists(pet_id, db)

    weight = (
        db.query(RecordWeight)
        .join(Record, RecordWeight.record_id == Record.id)
        .filter(
            RecordWeight.id == weight_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordWeight.is_deleted == 0,
        )
        .first()
    )

    if not weight:
        raise HTTPException(status_code=404, detail="Weight not found")

    try:
        weight.measured_on = weight_data.measured_on
        weight.weight_kg = weight_data.weight_kg
        weight.note = weight_data.note

        db.commit()
        db.refresh(weight)

        return {
            "item": {
                "id": weight.id,
                "pet_id": pet_id,
                "measured_on": weight.measured_on,
                "weight_kg": float(weight.weight_kg),
                "note": weight.note,
                "created_at": weight.created_at,
                "updated_at": weight.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{weight_id}", status_code=204)
def delete_weight(pet_id: int, weight_id: int, db: Session = Depends(get_db)):
    """Logical delete of weight"""
    verify_pet_exists(pet_id, db)

    weight = (
        db.query(RecordWeight)
        .join(Record, RecordWeight.record_id == Record.id)
        .filter(
            RecordWeight.id == weight_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordWeight.is_deleted == 0,
        )
        .first()
    )

    if not weight:
        raise HTTPException(status_code=404, detail="Weight not found")

    weight.is_deleted = 1
    db.commit()

    return None
