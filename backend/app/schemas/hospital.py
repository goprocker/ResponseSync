"""Pydantic schemas for Hospital entity validation."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import EmergencyStatus
from app.schemas.common import GeoJSONPoint


class HospitalCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    icu_beds_available: int = 0
    total_beds_available: int = 0
    emergency_status: EmergencyStatus = EmergencyStatus.NORMAL
    contact_number: str = ""


class HospitalResponse(BaseModel):
    id: uuid.UUID
    name: str
    location: GeoJSONPoint
    icu_beds_available: int
    total_beds_available: int
    emergency_status: EmergencyStatus
    contact_number: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
