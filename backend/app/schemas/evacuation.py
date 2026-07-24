"""Pydantic schemas for EvacuationRoute entity validation."""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.common import GeoJSONLineString, GeoJSONPoint


class EvacuationRouteCreate(BaseModel):
    route_name: str
    start_location: GeoJSONPoint
    destination_shelter_id: Optional[uuid.UUID] = None
    route_geometry: GeoJSONLineString
    estimated_travel_time_mins: float = 0.0
    safety_score: float = 1.0


class EvacuationRouteResponse(BaseModel):
    id: uuid.UUID
    route_name: str
    start_location: GeoJSONPoint
    destination_shelter_id: Optional[uuid.UUID] = None
    route_geometry: GeoJSONLineString
    is_blocked: bool
    estimated_travel_time_mins: float
    safety_score: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
