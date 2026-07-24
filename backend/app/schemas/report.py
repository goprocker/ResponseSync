"""Pydantic schemas for CitizenReport entity validation."""

import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import ReportCategory, ReportStatus, SeverityLevel
from app.schemas.common import GeoJSONPoint


class ReportCreate(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    category: ReportCategory
    severity: SeverityLevel = SeverityLevel.MEDIUM
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    media_urls: List[str] = Field(default_factory=list)


class ReportStatusUpdate(BaseModel):
    status: ReportStatus


class ReportResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    title: str
    description: str
    category: ReportCategory
    severity: SeverityLevel
    status: ReportStatus
    location: GeoJSONPoint
    media_urls: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
