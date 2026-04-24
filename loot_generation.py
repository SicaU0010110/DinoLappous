import logging
import random
from typing import List, Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)

class Rarity(Enum):
    COMMON = 1
    UNCOMMON = 2
    RARE = 3
    EPIC = 4
    LEGENDARY = 5

class LootGenerator:
    def generate_loot(self, enemy_level: int) -> List[Dict[str, Any]]:
        num_drops = random.randint(0, 2)
        loot = []
        for _ in range(num_drops):
            rarity = random.choice(list(Rarity))
            loot.append({
                "name": f"{rarity.name} Item",
                "rarity": rarity.name,
                "value": enemy_level * rarity.value * 10
            })
        return loot
