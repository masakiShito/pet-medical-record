from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, validator


# Pet Schemas
class PetBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    species: Optional[str] = Field(None, max_length=50)
    sex: Optional[str] = Field(None, max_length=20)
    birth_date: Optional[date] = None
    photo_url: Optional[str] = Field(None, max_length=500)


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
    measured_on: date
    weight_kg: Decimal = Field(..., ge=0, le=999.99)
    note: Optional[str] = Field(None, max_length=500)


class RecordWeightCreate(RecordWeightBase):
    pass


class RecordWeightUpdate(RecordWeightBase):
    id: Optional[int] = None


class RecordWeight(RecordWeightBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Weight for domain API
class WeightBase(BaseModel):
    measured_on: date
    weight_kg: Decimal = Field(..., ge=0, le=999.99)
    note: Optional[str] = Field(None, max_length=500)


class WeightCreate(WeightBase):
    pass


class WeightUpdate(WeightBase):
    pass


class Weight(WeightBase):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WeightList(BaseModel):
    items: List[Weight]
    total: int
    limit: int
    offset: int

    class Config:
        from_attributes = True


# Record Medication Schemas
class RecordMedicationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    dosage: Optional[str] = Field(None, max_length=200)
    frequency: Optional[str] = Field(None, max_length=200)
    start_on: date
    end_on: Optional[date] = None
    note: Optional[str] = None


class RecordMedicationCreate(RecordMedicationBase):
    pass


class RecordMedicationUpdate(RecordMedicationBase):
    id: Optional[int] = None


class RecordMedication(RecordMedicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Medication for domain API
class MedicationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    dosage: Optional[str] = Field(None, max_length=200)
    frequency: Optional[str] = Field(None, max_length=200)
    start_on: date
    end_on: Optional[date] = None
    note: Optional[str] = None


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(MedicationBase):
    pass


class Medication(MedicationBase):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MedicationList(BaseModel):
    items: List[Medication]
    total: int
    limit: int
    offset: int

    class Config:
        from_attributes = True


# Record Vet Visit Schemas
class RecordVetVisitBase(BaseModel):
    visited_on: date
    hospital_name: Optional[str] = Field(None, max_length=200)
    doctor_name: Optional[str] = Field(None, max_length=200)
    chief_complaint: Optional[str] = Field(None, max_length=500)
    diagnosis: Optional[str] = Field(None, max_length=500)
    cost_yen: Optional[int] = Field(None, ge=0)
    note: Optional[str] = None


class RecordVetVisitCreate(RecordVetVisitBase):
    pass


class RecordVetVisitUpdate(RecordVetVisitBase):
    id: Optional[int] = None


class RecordVetVisit(RecordVetVisitBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# VetVisit for domain API
class VetVisitBase(BaseModel):
    visited_on: date
    hospital_name: Optional[str] = Field(None, max_length=200)
    doctor_name: Optional[str] = Field(None, max_length=200)
    chief_complaint: Optional[str] = Field(None, max_length=500)
    diagnosis: Optional[str] = Field(None, max_length=500)
    cost_yen: Optional[int] = Field(None, ge=0)
    note: Optional[str] = None


class VetVisitCreate(VetVisitBase):
    pass


class VetVisitUpdate(VetVisitBase):
    pass


class VetVisit(VetVisitBase):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VetVisitList(BaseModel):
    items: List[VetVisit]
    total: int
    limit: int
    offset: int

    class Config:
        from_attributes = True


# Record Schemas
class RecordBase(BaseModel):
    recorded_on: date
    condition: Optional[str] = Field(None, max_length=20)
    note: Optional[str] = None


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
    condition: Optional[str]
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


# PetSummary Schemas
class VetVisitLastSummary(BaseModel):
    visit_id: int
    visited_on: date
    hospital_name: Optional[str]
    diagnosis: Optional[str]
    cost_yen: Optional[int]


class WeightLastSummary(BaseModel):
    weight_id: int
    measured_on: date
    weight_kg: Decimal


class MedicationActiveSummary(BaseModel):
    count: int
    items: List[dict]


class PetSummary(BaseModel):
    pet_id: int
    vet_visit_last: Optional[VetVisitLastSummary]
    weight_last: Optional[WeightLastSummary]
    medication_active: MedicationActiveSummary


# Response Schemas
class ItemResponse(BaseModel):
    item: dict


class IdResponse(BaseModel):
    id: int
