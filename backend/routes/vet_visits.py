from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from datetime import date

from database import get_db
from models import Pet, Record, RecordVetVisit
import schemas

router = APIRouter(prefix="/pets/{pet_id}/vet-visits", tags=["vet_visits"])


def verify_pet_exists(pet_id: int, db: Session) -> Pet:
    """Verify pet exists and is not deleted"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


def get_or_create_record(pet_id: int, visited_on: date, db: Session) -> Record:
    """Get or create a record for the given date"""
    record = (
        db.query(Record)
        .filter(
            Record.pet_id == pet_id,
            Record.recorded_on == visited_on,
            Record.is_deleted == 0,
        )
        .first()
    )

    if not record:
        record = Record(pet_id=pet_id, recorded_on=visited_on)
        db.add(record)
        db.flush()

    return record


@router.get("", response_model=schemas.VetVisitList)
def get_vet_visits(
    pet_id: int,
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Get vet visits for a pet"""
    verify_pet_exists(pet_id, db)

    # Join with records to filter by pet_id
    query = (
        db.query(RecordVetVisit, Record.pet_id)
        .join(Record, RecordVetVisit.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordVetVisit.is_deleted == 0,
        )
    )

    if from_date:
        query = query.filter(RecordVetVisit.visited_on >= from_date)
    if to_date:
        query = query.filter(RecordVetVisit.visited_on <= to_date)
    if q:
        query = query.filter(
            (RecordVetVisit.hospital_name.ilike(f"%{q}%"))
            | (RecordVetVisit.diagnosis.ilike(f"%{q}%"))
            | (RecordVetVisit.chief_complaint.ilike(f"%{q}%"))
        )

    total = query.count()
    results = query.order_by(RecordVetVisit.visited_on.desc()).limit(limit).offset(offset).all()

    items = []
    for visit, pet_id_from_record in results:
        items.append(
            schemas.VetVisit(
                id=visit.id,
                pet_id=pet_id,
                visited_on=visit.visited_on,
                hospital_name=visit.hospital_name,
                doctor_name=visit.doctor_name,
                chief_complaint=visit.chief_complaint,
                diagnosis=visit.diagnosis,
                cost_yen=visit.cost_yen,
                note=visit.note,
                created_at=visit.created_at,
                updated_at=visit.updated_at,
            )
        )

    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=schemas.ItemResponse, status_code=201)
def create_vet_visit(
    pet_id: int, visit_data: schemas.VetVisitCreate, db: Session = Depends(get_db)
):
    """Create a new vet visit"""
    verify_pet_exists(pet_id, db)

    try:
        # Get or create record for the visit date
        record = get_or_create_record(pet_id, visit_data.visited_on, db)

        visit = RecordVetVisit(
            record_id=record.id,
            visited_on=visit_data.visited_on,
            hospital_name=visit_data.hospital_name,
            doctor_name=visit_data.doctor_name,
            chief_complaint=visit_data.chief_complaint,
            diagnosis=visit_data.diagnosis,
            cost_yen=visit_data.cost_yen,
            note=visit_data.note,
        )
        db.add(visit)
        db.commit()
        db.refresh(visit)

        return {
            "item": {
                "id": visit.id,
                "pet_id": pet_id,
                "visited_on": visit.visited_on,
                "hospital_name": visit.hospital_name,
                "doctor_name": visit.doctor_name,
                "chief_complaint": visit.chief_complaint,
                "diagnosis": visit.diagnosis,
                "cost_yen": visit.cost_yen,
                "note": visit.note,
                "created_at": visit.created_at,
                "updated_at": visit.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{visit_id}", response_model=schemas.ItemResponse)
def get_vet_visit(pet_id: int, visit_id: int, db: Session = Depends(get_db)):
    """Get vet visit detail"""
    verify_pet_exists(pet_id, db)

    visit = (
        db.query(RecordVetVisit)
        .join(Record, RecordVetVisit.record_id == Record.id)
        .filter(
            RecordVetVisit.id == visit_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordVetVisit.is_deleted == 0,
        )
        .first()
    )

    if not visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    return {
        "item": {
            "id": visit.id,
            "pet_id": pet_id,
            "visited_on": visit.visited_on,
            "hospital_name": visit.hospital_name,
            "doctor_name": visit.doctor_name,
            "chief_complaint": visit.chief_complaint,
            "diagnosis": visit.diagnosis,
            "cost_yen": visit.cost_yen,
            "note": visit.note,
            "created_at": visit.created_at,
            "updated_at": visit.updated_at,
        }
    }


@router.put("/{visit_id}", response_model=schemas.ItemResponse)
def update_vet_visit(
    pet_id: int,
    visit_id: int,
    visit_data: schemas.VetVisitUpdate,
    db: Session = Depends(get_db),
):
    """Update vet visit"""
    verify_pet_exists(pet_id, db)

    visit = (
        db.query(RecordVetVisit)
        .join(Record, RecordVetVisit.record_id == Record.id)
        .filter(
            RecordVetVisit.id == visit_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordVetVisit.is_deleted == 0,
        )
        .first()
    )

    if not visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    try:
        visit.visited_on = visit_data.visited_on
        visit.hospital_name = visit_data.hospital_name
        visit.doctor_name = visit_data.doctor_name
        visit.chief_complaint = visit_data.chief_complaint
        visit.diagnosis = visit_data.diagnosis
        visit.cost_yen = visit_data.cost_yen
        visit.note = visit_data.note

        db.commit()
        db.refresh(visit)

        return {
            "item": {
                "id": visit.id,
                "pet_id": pet_id,
                "visited_on": visit.visited_on,
                "hospital_name": visit.hospital_name,
                "doctor_name": visit.doctor_name,
                "chief_complaint": visit.chief_complaint,
                "diagnosis": visit.diagnosis,
                "cost_yen": visit.cost_yen,
                "note": visit.note,
                "created_at": visit.created_at,
                "updated_at": visit.updated_at,
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{visit_id}", status_code=204)
def delete_vet_visit(pet_id: int, visit_id: int, db: Session = Depends(get_db)):
    """Logical delete of vet visit"""
    verify_pet_exists(pet_id, db)

    visit = (
        db.query(RecordVetVisit)
        .join(Record, RecordVetVisit.record_id == Record.id)
        .filter(
            RecordVetVisit.id == visit_id,
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordVetVisit.is_deleted == 0,
        )
        .first()
    )

    if not visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    visit.is_deleted = 1
    db.commit()

    return None
