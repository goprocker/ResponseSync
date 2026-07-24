"""Emergency shelter model with location coordinates and capacity tracking."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.evacuation import EvacuationRoute


class Shelter(Base):
    """Emergency shelter location and live occupancy tracker."""

    __tablename__ = "shelters"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # GeoAlchemy2 PostGIS Point location (EPSG:4326)
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False, index=True
    )

    total_capacity: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    incoming_routes: Mapped[List["EvacuationRoute"]] = relationship(
        "EvacuationRoute", back_populates="destination_shelter"
    )

    def __repr__(self) -> str:
        return f"<Shelter {self.name} [{self.current_occupancy}/{self.total_capacity}]>"
