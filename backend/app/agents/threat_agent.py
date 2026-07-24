"""Stage 1 Threat Assessment Agent."""

from typing import Any, Dict, List


class ThreatAssessmentAgent:
    """Evaluates live telemetry and matched scenario history to establish current flood threat status."""

    @classmethod
    def evaluate(
        cls, live_weather: Dict[str, Any], matched_scenarios: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        rainfall = live_weather.get("rainfall_mm", 0.0)
        river_level = live_weather.get("river_level_m", 0.0)
        dam_discharge = live_weather.get("dam_discharge_cumecs", 0.0)

        if rainfall > 100 or river_level > 4.0 or dam_discharge > 500:
            threat_level = "CRITICAL"
        elif rainfall > 50 or river_level > 3.0 or dam_discharge > 300:
            threat_level = "HIGH"
        else:
            threat_level = "MODERATE"

        top_match = matched_scenarios[0] if matched_scenarios else {}

        return {
            "threat_level": threat_level,
            "current_rainfall_mm": rainfall,
            "current_river_level_m": river_level,
            "current_dam_discharge_cumecs": dam_discharge,
            "top_matched_scenario": top_match.get("matched_vector", {}),
            "match_confidence_pct": top_match.get("similarity_score_pct", 85.0),
        }
