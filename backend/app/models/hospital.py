"""Hospital model for emergency medical bed and ICU capacity tracking."""

import uuid
from datetime import datetime, timezone
from geoalchemy2 import Geometry
from sqlalchemy import Enum as SQLEnum, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.enums import EmergencyStatus


class Hospital(Base):
    """Medical facility with real-time bed capacity and location."""

    __tablename__ = "hospitals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # GeoAlchemy2 PostGIS Point location (EPSG:4326)
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False, from_text=None), nullable=False
    )

    icu_beds_available: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_beds_available: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    emergency_status: Mapped[EmergencyStatus] = mapped_column(
        SQLEnum(EmergencyStatus), default=EmergencyStatus.NORMAL, nullable=False
    )
    contact_number: Mapped[str] = mapped_column(String(50), default="", nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Hospital {self.name} [{self.total_beds_available} beds available]>"
