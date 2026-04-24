import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class ReputationSystem:
    def __init__(self):
        self.faction_standings: Dict[str, int] = {}
        self.thresholds = {"hostile": -50, "neutral": 0, "friendly": 50}

    def modify_reputation(self, faction: str, delta: int):
        self.faction_standings[faction] = max(-100, min(100, self.faction_standings.get(faction, 0) + delta))
        logger.info(f"Reputation with {faction}: {self.faction_standings[faction]}")

    def get_standing_level(self, faction: str) -> str:
        val = self.faction_standings.get(faction, 0)
        if val <= self.thresholds["hostile"]: return "hostile"
        if val >= self.thresholds["friendly"]: return "friendly"
        return "neutral"
