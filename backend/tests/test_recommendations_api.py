"""Unit tests for AI decision recommendations pipeline."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_recommendations_pipeline(async_client: AsyncClient) -> None:
    """Test GET /recommendations runs 3-stage agent pipeline and returns explainable rationale."""
    response = await async_client.get("/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert "threat_assessment" in data
    assert "response_plan" in data
    assert "explainability" in data
    assert "executive_rationale" in data["explainability"]
    assert "public_advisory" in data["explainability"]
