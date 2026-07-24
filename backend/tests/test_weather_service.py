"""Unit tests for weather ingestion and telemetry endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_weather_endpoint(async_client: AsyncClient) -> None:
    """Test GET /weather returns valid environmental telemetry."""
    response = await async_client.get("/weather")
    assert response.status_code == 200
    data = response.json()
    assert "rainfall_mm" in data
    assert "river_level_m" in data
    assert "dam_discharge_cumecs" in data
    assert data["location_name"] == "Velachery, Chennai"


@pytest.mark.asyncio
async def test_refresh_weather_endpoint(async_client: AsyncClient) -> None:
    """Test POST /weather/refresh triggers new telemetry ingestion."""
    response = await async_client.post("/weather/refresh")
    assert response.status_code == 201
    data = response.json()
    assert data["location_name"] == "Velachery, Chennai"
