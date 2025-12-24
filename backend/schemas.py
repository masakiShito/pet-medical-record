from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator
from models import SpeciesEnum, SexEnum


# Pet Schemas
class PetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    species: SpeciesEnum
    breed: Optional[str] = Field(None, max_length=50)
    sex: Optional[SexEnum] = None
    birthday: Optional[date] = None
    notes: Optional[str] = None


class PetCreate(PetBase):
    pass


class PetUpdate(PetBase):
    pass


class Pet(PetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PetList(BaseModel):
    items: List[Pet]

    class Config:
        from_attributes = True


# Record Weight Schemas
class RecordWeightBase(BaseModel):
    weight_kg: Decimal = Field(..., ge=0, le=999.99)
    measured_at: Optional[datetime] = None
    note: Optional[str] = Field(None, max_length=200)


class RecordWeightCreate(RecordWeightBase):
    pass


class RecordWeightUpdate(RecordWeightBase):
    id: Optional[int] = None


class RecordWeight(RecordWeightBase):
    id: int

    class Config:
        from_attributes = True


# Record Medication Schemas
class RecordMedicationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    dosage: Optional[str] = Field(None, max_length=100)
    frequency: Optional[str] = Field(None, max_length=100)
    started_on: Optional[date] = None
    ended_on: Optional[date] = None
    note: Optional[str] = Field(None, max_length=200)


class RecordMedicationCreate(RecordMedicationBase):
    pass


class RecordMedicationUpdate(RecordMedicationBase):
    id: Optional[int] = None


class RecordMedication(RecordMedicationBase):
    id: int

    class Config:
        from_attributes = True


# Record Vet Visit Schemas
class RecordVetVisitBase(BaseModel):
    hospital_name: Optional[str] = Field(None, max_length=100)
    doctor: Optional[str] = Field(None, max_length=50)
    reason: Optional[str] = Field(None, max_length=200)
    diagnosis: Optional[str] = Field(None, max_length=200)
    cost_yen: Optional[int] = Field(None, ge=0)
    note: Optional[str] = None


class RecordVetVisitCreate(RecordVetVisitBase):
    pass


class RecordVetVisitUpdate(RecordVetVisitBase):
    id: Optional[int] = None


class RecordVetVisit(RecordVetVisitBase):
    id: int

    class Config:
        from_attributes = True


# Record Schemas
class RecordBase(BaseModel):
    recorded_on: date
    title: Optional[str] = Field(None, max_length=100)
    condition_level: Optional[int] = Field(None, ge=1, le=5)
    appetite_level: Optional[int] = Field(None, ge=1, le=5)
    stool_level: Optional[int] = Field(None, ge=1, le=5)
    memo: Optional[str] = None


class RecordCreate(RecordBase):
    weights: List[RecordWeightCreate] = []
    medications: List[RecordMedicationCreate] = []
    vet_visits: List[RecordVetVisitCreate] = []


class RecordUpdate(RecordBase):
    weights: List[RecordWeightUpdate] = []
    medications: List[RecordMedicationUpdate] = []
    vet_visits: List[RecordVetVisitUpdate] = []


class Record(RecordBase):
    id: int
    pet_id: int
    weights: List[RecordWeight] = []
    medications: List[RecordMedication] = []
    vet_visits: List[RecordVetVisit] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RecordListItem(BaseModel):
    id: int
    pet_id: int
    recorded_on: date
    title: Optional[str]
    condition_level: Optional[int]
    appetite_level: Optional[int]
    stool_level: Optional[int]
    has_weights: bool
    has_medications: bool
    has_vet_visits: bool
    updated_at: datetime

    class Config:
        from_attributes = True


class RecordList(BaseModel):
    items: List[RecordListItem]
    total: int
    limit: int
    offset: int

    class Config:
        from_attributes = True


# Response Schemas
class IdResponse(BaseModel):
    id: int
