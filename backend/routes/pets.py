from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from datetime import date

from database import get_db
from models import Pet, User, Record, RecordVetVisit, RecordWeight, RecordMedication
import schemas

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=schemas.PetList)
def get_pets(db: Session = Depends(get_db)):
    """Get all pets (not deleted)"""
    pets = db.query(Pet).filter(Pet.is_deleted == 0).all()
    return {"items": pets}


@router.post("", response_model=schemas.ItemResponse, status_code=201)
def create_pet(pet_data: schemas.PetCreate, db: Session = Depends(get_db)):
    """Create a new pet"""
    # Get default user (MVP: single user)
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=500, detail="No user found in system")

    pet = Pet(
        user_id=user.id,
        name=pet_data.name,
        species=pet_data.species,
        sex=pet_data.sex,
        birth_date=pet_data.birth_date,
        photo_url=pet_data.photo_url,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)

    return {
        "item": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "sex": pet.sex,
            "birth_date": pet.birth_date,
            "photo_url": pet.photo_url,
            "created_at": pet.created_at,
            "updated_at": pet.updated_at,
        }
    }


@router.get("/{pet_id}", response_model=schemas.ItemResponse)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    """Get pet by ID"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    return {
        "item": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "sex": pet.sex,
            "birth_date": pet.birth_date,
            "photo_url": pet.photo_url,
            "created_at": pet.created_at,
            "updated_at": pet.updated_at,
        }
    }


@router.get("/{pet_id}/summary")
def get_pet_summary(pet_id: int, db: Session = Depends(get_db)):
    """Get pet summary (dashboard data)"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    # Get latest vet visit
    latest_visit = (
        db.query(RecordVetVisit)
        .join(Record, RecordVetVisit.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordVetVisit.is_deleted == 0,
        )
        .order_by(RecordVetVisit.visited_on.desc())
        .first()
    )

    vet_visit_last = None
    if latest_visit:
        vet_visit_last = {
            "visit_id": latest_visit.id,
            "visited_on": latest_visit.visited_on,
            "hospital_name": latest_visit.hospital_name,
            "diagnosis": latest_visit.diagnosis,
            "cost_yen": latest_visit.cost_yen,
        }

    # Get latest weight
    latest_weight = (
        db.query(RecordWeight)
        .join(Record, RecordWeight.record_id == Record.id)
        .filter(
            Record.pet_id == pet_id,
            Record.is_deleted == 0,
            RecordWeight.is_deleted == 0,
        )
        .order_by(RecordWeight.measured_on.desc())
        .first()
    )

    weight_last = None
    if latest_weight:
        weight_last = {
            "weight_id": latest_weight.id,
            "measured_on": latest_weight.measured_on,
            "weight_kg": float(latest_weight.weight_kg),
        }

    # Get active medications
    today = date.today()
    active_medications = (
        db.query(RecordMedication)
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
        .order_by(RecordMedication.start_on.desc())
        .all()
    )

    medication_items = []
    for med in active_medications:
        medication_items.append({
            "med_id": med.id,
            "name": med.name,
            "start_on": med.start_on,
            "end_on": med.end_on,
        })

    medication_active = {
        "count": len(medication_items),
        "items": medication_items,
    }

    return {
        "item": {
            "pet_id": pet_id,
            "vet_visit_last": vet_visit_last,
            "weight_last": weight_last,
            "medication_active": medication_active,
        }
    }


@router.put("/{pet_id}", response_model=schemas.ItemResponse)
def update_pet(
    pet_id: int, pet_data: schemas.PetUpdate, db: Session = Depends(get_db)
):
    """Update pet"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    pet.name = pet_data.name
    pet.species = pet_data.species
    pet.sex = pet_data.sex
    pet.birth_date = pet_data.birth_date
    pet.photo_url = pet_data.photo_url

    db.commit()
    db.refresh(pet)

    return {
        "item": {
            "id": pet.id,
            "name": pet.name,
            "species": pet.species,
            "sex": pet.sex,
            "birth_date": pet.birth_date,
            "photo_url": pet.photo_url,
            "created_at": pet.created_at,
            "updated_at": pet.updated_at,
        }
    }


@router.delete("/{pet_id}", status_code=204)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    """Logical delete of pet"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    pet.is_deleted = 1
    db.commit()

    return None
