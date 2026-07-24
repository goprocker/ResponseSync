"""Emergency resource model with current PostGIS location and risk zone assignment."""

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from geoalchemy2 import Geometry
from sqlalchemy import Enum as SQLEnum, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ResourceStatus, ResourceType

if TYPE_CHECKING:
    from app.models.risk_zone import RiskZone


class Resource(Base):
    """Emergency response team or asset (boat, ambulance, personnel)."""

    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    resource_type: Mapped[ResourceType] = mapped_column(
        SQLEnum(ResourceType), nullable=False, index=True
    )
    status: Mapped[ResourceStatus] = mapped_column(
        SQLEnum(ResourceStatus), default=ResourceStatus.AVAILABLE, nullable=False, index=True
    )

    # GeoAlchemy2 PostGIS Point location (EPSG:4326)
    current_location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False, index=True
    )

    assigned_zone_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("risk_zones.id", ondelete="SET NULL"), nullable=True
    )
    capacity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    assigned_zone: Mapped[Optional["RiskZone"]] = relationship(
        "RiskZone", back_populates="assigned_resources"
    )

    def __repr__(self) -> str:
        return f"<Resource {self.name} ({self.resource_type}) - {self.status}>"
