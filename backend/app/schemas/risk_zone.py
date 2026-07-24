"""Pydantic schemas for RiskZone entity validation."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import RiskLevel
from app.schemas.common import GeoJSONPolygon


class RiskZoneCreate(BaseModel):
    zone_name: str
    risk_level: RiskLevel = RiskLevel.SAFE
    boundary: GeoJSONPolygon
    flood_depth_m: float = 0.0
    affected_population: int = 0


class RiskZoneResponse(BaseModel):
    id: uuid.UUID
    zone_name: str
    risk_level: RiskLevel
    boundary: GeoJSONPolygon
    flood_depth_m: float
    affected_population: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
