"""Pydantic schemas for Resource entity validation."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.enums import ResourceStatus, ResourceType
from app.schemas.common import GeoJSONPoint


class ResourceCreate(BaseModel):
    name: str
    resource_type: ResourceType
    latitude: float
    longitude: float
    capacity: int = 1


class ResourceResponse(BaseModel):
    id: uuid.UUID
    name: str
    resource_type: ResourceType
    status: ResourceStatus
    current_location: GeoJSONPoint
    assigned_zone_id: Optional[uuid.UUID] = None
    capacity: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
