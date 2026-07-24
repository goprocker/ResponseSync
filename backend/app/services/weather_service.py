"""Weather & environmental telemetry ingestion service."""

import logging
from datetime import datetime, timezone
from typing import Optional
import httpx
from geoalchemy2.elements import WKTElement
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.weather import WeatherCache
from app.schemas.weather import WeatherCreate, WeatherResponse

logger = logging.getLogger("responsync")


class WeatherService:
    """Service handling environmental data fetching, caching, and threshold evaluation."""

    OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

    @classmethod
    async def get_latest_weather(cls, session: AsyncSession) -> Optional[WeatherCache]:
        """Fetch the most recent weather cache record from the database."""
        result = await session.execute(
            select(WeatherCache).order_by(WeatherCache.cached_at.desc()).limit(1)
        )
        return result.scalars().first()

    @classmethod
    async def ingest_weather_telemetry(
        cls,
        session: AsyncSession,
        location_name: str = "Velachery, Chennai",
        lat: float = 12.9785,
        lon: float = 80.2208,
    ) -> WeatherCache:
        """Fetch weather telemetry from OpenWeather API with mock fallback for hydrology data."""
        rainfall_mm = 45.0
        wind_speed_kmh = 18.5
        humidity_pct = 75.0
        raw_telemetry = {}

        if settings.OPENWEATHER_API_KEY and settings.OPENWEATHER_API_KEY != "your-openweather-api-key":
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        cls.OPENWEATHER_URL,
                        params={
                            "lat": lat,
                            "lon": lon,
                            "appid": settings.OPENWEATHER_API_KEY,
                            "units": "metric",
                        },
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_telemetry = data
                        rainfall_mm = data.get("rain", {}).get("1h", 0.0)
                        wind_speed_kmh = data.get("wind", {}).get("speed", 0.0) * 3.6
                        humidity_pct = data.get("main", {}).get("humidity", 0.0)
            except Exception as e:
                logger.warning(f"Failed to fetch live OpenWeather data: {e}. Utilizing fallback telemetry.")

        # Hydrology telemetry fallback / simulation values for Velachery, Chennai
        river_level_m = 3.50 + (rainfall_mm * 0.02)
        dam_level_m = 13.80 + (rainfall_mm * 0.01)
        dam_discharge_cumecs = 300.0 + (rainfall_mm * 2.5)

        weather_entry = WeatherCache(
            location_name=location_name,
            location=f"SRID=4326;POINT({lon} {lat})",
            rainfall_mm=rainfall_mm,
            river_level_m=river_level_m,
            dam_level_m=dam_level_m,
            dam_discharge_cumecs=dam_discharge_cumecs,
            wind_speed_kmh=wind_speed_kmh,
            humidity_pct=humidity_pct,
            raw_data=raw_telemetry or {"telemetry": "Simulated Hydrology Feed"},
            cached_at=datetime.now(timezone.utc),
        )

        session.add(weather_entry)
        await session.commit()
        await session.refresh(weather_entry)
        return weather_entry
