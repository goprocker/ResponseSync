"""Stage 2 Resource Allocation and Evacuation Planner Agent."""

from typing import Any, Dict, List


class ResourcePlannerAgent:
    """Computes optimized resource deployments and shelter evacuation routes."""

    @classmethod
    def plan(
        cls,
        threat_assessment: Dict[str, Any],
        shelters: List[Dict[str, Any]],
        resources: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        threat_level = threat_assessment.get("threat_level", "MODERATE")

        # Select primary active shelter with available capacity
        selected_shelter = "Velachery MRTS Relief Station"
        for s in shelters:
            cap = s.get("total_capacity", 0)
            occ = s.get("current_occupancy", 0)
            if cap - occ > 50:
                selected_shelter = s.get("name", selected_shelter)
                break

        # Select available rescue assets
        recommended_resources = []
        for r in resources:
            if r.get("status") == "AVAILABLE":
                recommended_resources.append(
                    {
                        "id": str(r.get("id")),
                        "name": r.get("name"),
                        "type": r.get("resource_type"),
                        "assignment": f"Deploy to Velachery Lake Surroundings ({threat_level} Priority)",
                    }
                )

        return {
            "recommended_shelter": selected_shelter,
            "recommended_resources": recommended_resources,
            "evacuation_corridor": "Taramani-Velachery Safe Corridor A",
            "estimated_evacuation_time_mins": 15.0 if threat_level == "CRITICAL" else 10.0,
        }
