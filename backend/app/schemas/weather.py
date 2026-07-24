"""Pydantic schemas for WeatherCache entity validation."""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.common import GeoJSONPoint


class WeatherCreate(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    rainfall_mm: float = 0.0
    river_level_m: float = 0.0
    dam_level_m: float = 0.0
    dam_discharge_cumecs: float = 0.0
    wind_speed_kmh: float = 0.0
    humidity_pct: float = 0.0
    raw_data: dict = {}


class WeatherResponse(BaseModel):
    id: uuid.UUID
    location_name: str
    location: GeoJSONPoint
    rainfall_mm: float
    river_level_m: float
    dam_level_m: float
    dam_discharge_cumecs: float
    wind_speed_kmh: float
    humidity_pct: float
    raw_data: dict
    cached_at: datetime

    model_config = ConfigDict(from_attributes=True)
