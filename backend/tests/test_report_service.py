"""Unit tests for citizen reporting endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_reports(async_client: AsyncClient) -> None:
    """Test POST /reports and GET /reports lifecycle."""
    report_payload = {
        "title": "Velachery Bypass Inundation",
        "description": "Flood water level reaching 0.5m near Bypass road.",
        "category": "FLOOD",
        "severity": "HIGH",
        "latitude": 12.9785,
        "longitude": 80.2208,
        "media_urls": [],
    }

    # 1. Create Report
    response = await async_client.post("/reports", json=report_payload)
    assert response.status_code == 201
    created_report = response.json()
    assert created_report["title"] == report_payload["title"]
    assert created_report["status"] == "PENDING"
    report_id = created_report["id"]

    # 2. Get Specific Report
    get_resp = await async_client.get(f"/reports/{report_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == report_id

    # 3. Verify Report Status (Authority Action)
    patch_resp = await async_client.patch(
        f"/reports/{report_id}/status", json={"status": "VERIFIED"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "VERIFIED"

    # 4. List Reports
    list_resp = await async_client.get("/reports?category=FLOOD")
    assert list_resp.status_code == 200
    assert isinstance(list_resp.json(), list)
