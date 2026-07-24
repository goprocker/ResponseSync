"""Risk zone model with PostGIS polygon spatial boundaries."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List
from geoalchemy2 import Geometry
from sqlalchemy import Enum as SQLEnum, Float, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import RiskLevel

if TYPE_CHECKING:
    from app.models.resource import Resource


class RiskZone(Base):
    """Geospatial risk zone polygon with calculated flood impact metrics."""

    __tablename__ = "risk_zones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    zone_name: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(
        SQLEnum(RiskLevel), default=RiskLevel.SAFE, nullable=False, index=True
    )
    
    # GeoAlchemy2 PostGIS Polygon boundary (EPSG:4326)
    boundary: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326), nullable=False, index=True
    )

    flood_depth_m: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    affected_population: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    assigned_resources: Mapped[List["Resource"]] = relationship(
        "Resource", back_populates="assigned_zone"
    )

    def __repr__(self) -> str:
        return f"<RiskZone {self.zone_name} [{self.risk_level}]>"
