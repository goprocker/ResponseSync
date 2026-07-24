"""Citizen report model with PostGIS spatial point location."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from geoalchemy2 import Geometry
from sqlalchemy import Enum as SQLEnum, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ReportCategory, ReportStatus, SeverityLevel

if TYPE_CHECKING:
    from app.models.user import User


class CitizenReport(Base):
    """Citizen hazard / incident report with spatial coordinates."""

    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[ReportCategory] = mapped_column(
        SQLEnum(ReportCategory), nullable=False, index=True
    )
    severity: Mapped[SeverityLevel] = mapped_column(
        SQLEnum(SeverityLevel), default=SeverityLevel.MEDIUM, nullable=False
    )
    status: Mapped[ReportStatus] = mapped_column(
        SQLEnum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True
    )
    
    # GeoAlchemy2 PostGIS Point (Longitude, Latitude) EPSG:4326
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False, from_text=None), nullable=False
    )
    
    media_urls: Mapped[dict] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    reporter: Mapped[Optional["User"]] = relationship("User", back_populates="reports")

    def __repr__(self) -> str:
        return f"<CitizenReport {self.title} [{self.category}] - {self.status}>"
