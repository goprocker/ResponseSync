"""Multi-Agent Decision Orchestrator linking the 3-stage decision graph."""

from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.explainability_agent import ExplainabilityAgent
from app.agents.planner_agent import ResourcePlannerAgent
from app.agents.threat_agent import ThreatAssessmentAgent
from app.models.hospital import Hospital
from app.models.resource import Resource
from app.models.shelter import Shelter
from app.services.matching_service import ScenarioMatchingService
from app.services.weather_service import WeatherService


class DecisionOrchestrator:
    """Orchestrates live telemetry ingestion, scenario matching, and multi-agent AI execution."""

    @classmethod
    async def run_pipeline(cls, session: AsyncSession) -> Dict[str, Any]:
        """Execute full 3-stage decision pipeline."""
        # 1. Fetch live telemetry
        weather = await WeatherService.get_latest_weather(session)
        if not weather:
            weather = await WeatherService.ingest_weather_telemetry(session)

        live_telemetry = {
            "rainfall_mm": weather.rainfall_mm,
            "river_level_m": weather.river_level_m,
            "dam_discharge_cumecs": weather.dam_discharge_cumecs,
        }

        # 2. Match scenarios against Decision Knowledge Base
        matched_scenarios = await ScenarioMatchingService.match_scenarios(
            session, live_telemetry, top_k=3
        )

        # 3. Stage 1: Threat Assessment
        threat_assessment = ThreatAssessmentAgent.evaluate(live_telemetry, matched_scenarios)

        # 4. Fetch Digital Twin entity context for planner
        shelters_res = await session.execute(select(Shelter))
        shelters = [{"id": s.id, "name": s.name, "total_capacity": s.total_capacity, "current_occupancy": s.current_occupancy} for s in shelters_res.scalars().all()]

        resources_res = await session.execute(select(Resource))
        resources = [{"id": r.id, "name": r.name, "resource_type": r.resource_type, "status": r.status} for r in resources_res.scalars().all()]

        # 5. Stage 2: Resource & Evacuation Planner
        plan_info = ResourcePlannerAgent.plan(threat_assessment, shelters, resources)

        # 6. Stage 3: Gemini Explainability (XAI)
        explanations = await ExplainabilityAgent.generate_explanation(threat_assessment, plan_info)

        return {
            "threat_assessment": threat_assessment,
            "matched_scenarios": matched_scenarios,
            "response_plan": plan_info,
            "explainability": explanations,
        }
