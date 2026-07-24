"""Unit tests for SQLAlchemy models and Pydantic schema validation."""

import pytest
from app.models.enums import (
    ReportCategory,
    ReportStatus,
    ResourceStatus,
    ResourceType,
    RiskLevel,
    SeverityLevel,
    UserRole,
)
from app.models.user import User
from app.models.report import CitizenReport
from app.schemas.report import ReportCreate, ReportResponse
from app.schemas.common import GeoJSONPoint


def test_user_model_instantiation():
    """Verify User model attributes."""
    user = User(
        email="test@responsync.org",
        hashed_password="secret_hash",
        full_name="Emergency Officer",
        role=UserRole.AUTHORITY,
    )
    assert user.email == "test@responsync.org"
    assert user.role == UserRole.AUTHORITY


def test_report_schema_validation():
    """Verify ReportCreate and ReportResponse validation."""
    report_in = ReportCreate(
        title="Velachery Road Inundation",
        description="Water depth exceeds 2 feet near railway station.",
        category=ReportCategory.FLOOD,
        severity=SeverityLevel.HIGH,
        latitude=12.9785,
        longitude=80.2208,
    )
    assert report_in.latitude == 12.9785
    assert report_in.longitude == 80.2208
    assert report_in.category == ReportCategory.FLOOD
