"""Evacuation route model with LineString PostGIS geometry."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from geoalchemy2 import Geometry
from sqlalchemy import Boolean, Float, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.shelter import Shelter


class EvacuationRoute(Base):
    """Calculated evacuation path to shelter with safety scoring."""

    __tablename__ = "evacuation_routes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    route_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # GeoAlchemy2 PostGIS Point (Origin)
    start_location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False, from_text=None), nullable=False
    )

    destination_shelter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("shelters.id", ondelete="SET NULL"), nullable=True
    )

    # GeoAlchemy2 PostGIS LineString geometry for full route path
    route_geometry: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="LINESTRING", srid=4326, spatial_index=False, from_text=None), nullable=False
    )

    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    estimated_travel_time_mins: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    safety_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)  # 0.0 (dangerous) to 1.0 (safe)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    destination_shelter: Mapped[Optional["Shelter"]] = relationship(
        "Shelter", back_populates="incoming_routes"
    )

    def __repr__(self) -> str:
        return f"<EvacuationRoute {self.route_name} - Blocked: {self.is_blocked}>"
