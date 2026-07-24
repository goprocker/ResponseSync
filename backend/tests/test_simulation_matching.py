"""Unit tests for disaster simulation and scenario matching."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_disaster_simulation(async_client: AsyncClient) -> None:
    """Test POST /simulate and GET /simulations endpoints."""
    sim_payload = {
        "name": "Velachery 200mm Heavy Downpour Run",
        "description": "Simulate extreme monsoon downpour",
        "input_parameters": {
            "rainfall_mm": 200.0,
            "river_level_m": 4.5,
            "dam_discharge_cumecs": 600.0,
        },
    }

    # 1. Run Simulation
    response = await async_client.post("/simulate", json=sim_payload)
    assert response.status_code == 201
    sim_data = response.json()
    assert sim_data["name"] == sim_payload["name"]
    assert sim_data["status"] == "COMPLETED"
    assert len(sim_data["results"]) > 0

    # 2. List Simulations
    list_resp = await async_client.get("/simulations")
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
