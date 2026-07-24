"""Stage 3 Explainable AI (XAI) Agent utilizing Google Gemini SDK."""

import logging
from typing import Any, Dict
from app.core.config import settings

logger = logging.getLogger("responsync")


class ExplainabilityAgent:
    """Generates natural language executive rationale and public advisories using Google Gemini."""

    @classmethod
    async def generate_explanation(
        cls, threat_info: Dict[str, Any], plan_info: Dict[str, Any]
    ) -> Dict[str, str]:
        threat_level = threat_info.get("threat_level", "MODERATE")
        rainfall = threat_info.get("current_rainfall_mm", 0.0)
        shelter = plan_info.get("recommended_shelter", "Velachery MRTS Relief Station")
        corridor = plan_info.get("evacuation_corridor", "Taramani-Velachery Safe Corridor A")

        # Default structured explanation rationale
        executive_rationale = (
            f"RECOMMENDATION RATIONALE: Current rainfall is {rainfall}mm with a threat rating of {threat_level}. "
            f"Based on historical scenario matching (Confidence: {threat_info.get('match_confidence_pct', 85.0)}%), "
            f"evacuees should be routed via '{corridor}' to '{shelter}'. "
            f"This corridor preserves 12m travel time while avoiding inundated bypass choke points."
        )

        public_advisory = (
            f"EMERGENCY ADVISORY [{threat_level} FLOOD RISK]: Residents in Velachery Lake surroundings are advised "
            f"to proceed calmly towards {shelter} via {corridor}. Emergency rescue boats have been dispatched."
        )

        # Optional Gemini Live Generation if API key is provided
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
            try:
                from google import genai
                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = (
                    f"You are the ResponSync Disaster AI Commander for Velachery, Chennai. "
                    f"Threat Level: {threat_level}, Rainfall: {rainfall}mm, Recommended Shelter: {shelter}, "
                    f"Route: {corridor}. Generate 2 short paragraphs: "
                    f"1) Executive Rationale for Authorities, 2) Public Advisory for Citizens."
                )
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                )
                if response and response.text:
                    executive_rationale = response.text
            except Exception as e:
                logger.warning(f"Gemini API call skipped/fallback used: {e}")

        return {
            "executive_rationale": executive_rationale,
            "public_advisory": public_advisory,
        }
