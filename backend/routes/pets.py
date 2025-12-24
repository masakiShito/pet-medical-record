from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Pet, User
import schemas

router = APIRouter(prefix="/pets", tags=["pets"])


@router.get("", response_model=schemas.PetList)
def get_pets(db: Session = Depends(get_db)):
    """Get all pets (not deleted)"""
    pets = db.query(Pet).filter(Pet.is_deleted == 0).all()
    return {"items": pets}


@router.post("", response_model=schemas.IdResponse, status_code=201)
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
        breed=pet_data.breed,
        sex=pet_data.sex,
        birthday=pet_data.birthday,
        notes=pet_data.notes,
    )
    db.add(pet)
    db.commit()
    db.refresh(pet)

    return {"id": pet.id}


@router.get("/{pet_id}", response_model=schemas.Pet)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    """Get pet by ID"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.put("/{pet_id}", response_model=schemas.IdResponse)
def update_pet(
    pet_id: int, pet_data: schemas.PetUpdate, db: Session = Depends(get_db)
):
    """Update pet"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    pet.name = pet_data.name
    pet.species = pet_data.species
    pet.breed = pet_data.breed
    pet.sex = pet_data.sex
    pet.birthday = pet_data.birthday
    pet.notes = pet_data.notes

    db.commit()

    return {"id": pet.id}


@router.delete("/{pet_id}", status_code=204)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    """Logical delete of pet"""
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.is_deleted == 0).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    pet.is_deleted = 1
    db.commit()

    return None
