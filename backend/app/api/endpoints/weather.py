"""Weather and telemetry API endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.weather import WeatherResponse
from app.services.weather_service import WeatherService

router = APIRouter()


@router.get(
    "/weather",
    response_model=WeatherResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Telemetry & Weather",
    description="Returns current cached environmental telemetry (rainfall, river level, dam discharge) for Velachery.",
)
async def get_weather(db: AsyncSession = Depends(get_db)) -> WeatherResponse:
    """Fetch latest weather cache entry or ingest fresh data if none exists."""
    weather = await WeatherService.get_latest_weather(db)
    if not weather:
        weather = await WeatherService.ingest_weather_telemetry(db)
    return weather


@router.post(
    "/weather/refresh",
    response_model=WeatherResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger Weather Ingestion",
    description="Forces a refresh of environmental telemetry from OpenWeather and hydrology sensors.",
)
async def refresh_weather(db: AsyncSession = Depends(get_db)) -> WeatherResponse:
    """Ingest new environmental telemetry snapshot."""
    return await WeatherService.ingest_weather_telemetry(db)
