from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from database import get_db
from models import Pet, Record, RecordWeight, RecordMedication, RecordVetVisit
import schemas

router = APIRouter(prefix="/pets/{pet_id}/records", tags=["records"])


def verify_pet_exists(pet_id: int, db: Session) -> Pet:
    """Verify pet exists and is not deleted"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.get("", response_model=schemas.RecordList)
def get_records(
    pet_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Get records for a pet"""
    verify_pet_exists(pet_id, db)

    query = db.query(Record).filter(Record.pet_id == pet_id, Record.is_deleted == 0)

    if from_date:
        query = query.filter(Record.recorded_on >= from_date)
    if to_date:
        query = query.filter(Record.recorded_on <= to_date)

    total = query.count()
    records = query.order_by(Record.recorded_on.desc()).limit(limit).offset(offset).all()

    items = []
    for record in records:
        items.append(
            schemas.RecordListItem(
                id=record.id,
                pet_id=record.pet_id,
                recorded_on=record.recorded_on,
                condition=record.condition,
                has_weights=len(record.weights) > 0,
                has_medications=len(record.medications) > 0,
                has_vet_visits=len(record.vet_visits) > 0,
                updated_at=record.updated_at,
            )
        )

    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post("", response_model=schemas.IdResponse, status_code=201)
def create_record(
    pet_id: int, record_data: schemas.RecordCreate, db: Session = Depends(get_db)
):
    """Create a new record with child elements"""
    verify_pet_exists(pet_id, db)

    try:
        # Create parent record
        record = Record(
            pet_id=pet_id,
            recorded_on=record_data.recorded_on,
            condition=record_data.condition,
            note=record_data.note,
        )
        db.add(record)
        db.flush()

        # Create child weights
        for weight_data in record_data.weights:
            weight = RecordWeight(
                record_id=record.id,
                measured_on=weight_data.measured_on,
                weight_kg=weight_data.weight_kg,
                note=weight_data.note,
            )
            db.add(weight)

        # Create child medications
        for med_data in record_data.medications:
            medication = RecordMedication(
                record_id=record.id,
                name=med_data.name,
                dosage=med_data.dosage,
                frequency=med_data.frequency,
                start_on=med_data.start_on,
                end_on=med_data.end_on,
                note=med_data.note,
            )
            db.add(medication)

        # Create child vet visits
        for visit_data in record_data.vet_visits:
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
        db.refresh(record)

        return {"id": record.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{record_id}", response_model=schemas.Record)
def get_record(pet_id: int, record_id: int, db: Session = Depends(get_db)):
    """Get record detail with child elements"""
    verify_pet_exists(pet_id, db)

    record = (
        db.query(Record)
        .filter(
            Record.id == record_id, Record.pet_id == pet_id, Record.is_deleted == 0
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    return record


@router.put("/{record_id}", response_model=schemas.IdResponse)
def update_record(
    pet_id: int,
    record_id: int,
    record_data: schemas.RecordUpdate,
    db: Session = Depends(get_db),
):
    """Update record with child elements (replacement strategy)"""
    verify_pet_exists(pet_id, db)

    record = (
        db.query(Record)
        .filter(
            Record.id == record_id, Record.pet_id == pet_id, Record.is_deleted == 0
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        # Update parent record
        record.recorded_on = record_data.recorded_on
        record.condition = record_data.condition
        record.note = record_data.note

        # Update weights (replacement strategy)
        existing_weight_ids = {w.id for w in record.weights}
        incoming_weight_ids = {w.id for w in record_data.weights if w.id}

        # Delete weights not in incoming data
        for weight in record.weights:
            if weight.id not in incoming_weight_ids:
                db.delete(weight)

        # Update or create weights
        for weight_data in record_data.weights:
            if weight_data.id and weight_data.id in existing_weight_ids:
                # Update existing
                weight = (
                    db.query(RecordWeight).filter(RecordWeight.id == weight_data.id).first()
                )
                weight.measured_on = weight_data.measured_on
                weight.weight_kg = weight_data.weight_kg
                weight.note = weight_data.note
            else:
                # Create new
                weight = RecordWeight(
                    record_id=record.id,
                    measured_on=weight_data.measured_on,
                    weight_kg=weight_data.weight_kg,
                    note=weight_data.note,
                )
                db.add(weight)

        # Update medications (replacement strategy)
        existing_med_ids = {m.id for m in record.medications}
        incoming_med_ids = {m.id for m in record_data.medications if m.id}

        for medication in record.medications:
            if medication.id not in incoming_med_ids:
                db.delete(medication)

        for med_data in record_data.medications:
            if med_data.id and med_data.id in existing_med_ids:
                medication = (
                    db.query(RecordMedication)
                    .filter(RecordMedication.id == med_data.id)
                    .first()
                )
                medication.name = med_data.name
                medication.dosage = med_data.dosage
                medication.frequency = med_data.frequency
                medication.start_on = med_data.start_on
                medication.end_on = med_data.end_on
                medication.note = med_data.note
            else:
                medication = RecordMedication(
                    record_id=record.id,
                    name=med_data.name,
                    dosage=med_data.dosage,
                    frequency=med_data.frequency,
                    start_on=med_data.start_on,
                    end_on=med_data.end_on,
                    note=med_data.note,
                )
                db.add(medication)

        # Update vet visits (replacement strategy)
        existing_visit_ids = {v.id for v in record.vet_visits}
        incoming_visit_ids = {v.id for v in record_data.vet_visits if v.id}

        for visit in record.vet_visits:
            if visit.id not in incoming_visit_ids:
                db.delete(visit)

        for visit_data in record_data.vet_visits:
            if visit_data.id and visit_data.id in existing_visit_ids:
                visit = (
                    db.query(RecordVetVisit)
                    .filter(RecordVetVisit.id == visit_data.id)
                    .first()
                )
                visit.visited_on = visit_data.visited_on
                visit.hospital_name = visit_data.hospital_name
                visit.doctor_name = visit_data.doctor_name
                visit.chief_complaint = visit_data.chief_complaint
                visit.diagnosis = visit_data.diagnosis
                visit.cost_yen = visit_data.cost_yen
                visit.note = visit_data.note
            else:
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

        return {"id": record.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{record_id}", status_code=204)
def delete_record(pet_id: int, record_id: int, db: Session = Depends(get_db)):
    """Logical delete of record"""
    verify_pet_exists(pet_id, db)

    record = (
        db.query(Record)
        .filter(
            Record.id == record_id, Record.pet_id == pet_id, Record.is_deleted == 0
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.is_deleted = 1
    db.commit()

    return None
