"""Scenario Matching Engine comparing live state against Decision Knowledge Base."""

import logging
import math
from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.knowledge import DecisionKnowledge

logger = logging.getLogger("responsync")


class ScenarioMatchingService:
    """Service executing multi-factor weighted scenario matching against pre-computed simulations."""

    WEIGHT_RAINFALL = 0.35
    WEIGHT_RIVER_LEVEL = 0.25
    WEIGHT_DAM_DISCHARGE = 0.20
    WEIGHT_INUNDATION = 0.20

    @classmethod
    async def match_scenarios(
        cls, session: AsyncSession, live_conditions: Dict[str, float], top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Compute telemetry distance between live conditions and Decision Knowledge Base scenarios."""
        result = await session.execute(select(DecisionKnowledge))
        scenarios = list(result.scalars().all())

        if not scenarios:
            logger.warning("No DecisionKnowledge records found in database for scenario matching.")
            return []

        live_rain = live_conditions.get("rainfall_mm", 0.0)
        live_river = live_conditions.get("river_level_m", 0.0)
        live_dam = live_conditions.get("dam_discharge_cumecs", 0.0)

        scored_scenarios = []
        for entry in scenarios:
            vec = entry.scenario_vector or {}
            target_rain = vec.get("rainfall_mm", 0.0)
            target_river = vec.get("river_level_m", 0.0)
            target_dam = vec.get("dam_discharge_cumecs", 0.0)

            # Calculate normalized parameter differences
            rain_diff = abs(live_rain - target_rain) / max(live_rain, target_rain, 1.0)
            river_diff = abs(live_river - target_river) / max(live_river, target_river, 1.0)
            dam_diff = abs(live_dam - target_dam) / max(live_dam, target_dam, 1.0)

            # Weighted similarity score (0.0 = perfect match, higher = more distant)
            distance = (
                (cls.WEIGHT_RAINFALL * rain_diff)
                + (cls.WEIGHT_RIVER_LEVEL * river_diff)
                + (cls.WEIGHT_DAM_DISCHARGE * dam_diff)
            )

            similarity_pct = round(max(0.0, (1.0 - distance) * 100.0), 2)

            scored_scenarios.append(
                {
                    "knowledge_id": str(entry.id),
                    "simulation_id": str(entry.simulation_id) if entry.simulation_id else None,
                    "similarity_score_pct": similarity_pct,
                    "matched_vector": vec,
                    "recommended_actions": entry.recommended_actions,
                    "lessons_learned": entry.lessons_learned,
                }
            )

        # Sort by highest similarity percentage
        scored_scenarios.sort(key=lambda x: x["similarity_score_pct"], reverse=True)
        return scored_scenarios[:top_k]
