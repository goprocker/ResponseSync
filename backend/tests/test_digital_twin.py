"""Unit tests for Digital Twin spatial query endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_digital_twin_spatial_endpoints(async_client: AsyncClient) -> None:
    """Test GET /risk, /resources, /shelters, /hospitals, and /evacuation endpoints."""
    # 1. Test /risk
    risk_resp = await async_client.get("/risk")
    assert risk_resp.status_code == 200
    assert isinstance(risk_resp.json(), list)

    # 2. Test /resources
    res_resp = await async_client.get("/resources")
    assert res_resp.status_code == 200
    assert isinstance(res_resp.json(), list)

    # 3. Test /shelters
    shelter_resp = await async_client.get("/shelters")
    assert shelter_resp.status_code == 200
    assert isinstance(shelter_resp.json(), list)

    # 4. Test /hospitals
    hosp_resp = await async_client.get("/hospitals")
    assert hosp_resp.status_code == 200
    assert isinstance(hosp_resp.json(), list)

    # 5. Test /evacuation
    evac_resp = await async_client.get("/evacuation")
    assert evac_resp.status_code == 200
    assert isinstance(evac_resp.json(), list)
