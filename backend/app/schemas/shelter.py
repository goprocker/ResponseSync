"""Pydantic schemas for Shelter entity validation."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.common import GeoJSONPoint


class ShelterCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    total_capacity: int = 100
    contact_number: str = ""


class ShelterResponse(BaseModel):
    id: uuid.UUID
    name: str
    location: GeoJSONPoint
    total_capacity: int
    current_occupancy: int
    contact_number: str
    is_active: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
