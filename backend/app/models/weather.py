"""Weather cache model storing environmental parameters and PostGIS coordinates."""

import uuid
from datetime import datetime, timezone
from geoalchemy2 import Geometry
from sqlalchemy import Float, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WeatherCache(Base):
    """Cached weather and environmental sensor readings for a location."""

    __tablename__ = "weather_cache"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    location_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    
    # GeoAlchemy2 PostGIS Point (EPSG:4326)
    location: Mapped[Geometry] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326), nullable=False
    )

    rainfall_mm: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    river_level_m: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    dam_level_m: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    dam_discharge_cumecs: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    wind_speed_kmh: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    humidity_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    raw_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    cached_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )

    def __repr__(self) -> str:
        return f"<WeatherCache {self.location_name} - {self.rainfall_mm}mm rain>"
