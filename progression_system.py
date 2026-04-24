import random
from enum import Enum, auto
from typing import Dict, List, Any, Tuple

class RarityTier(Enum):
    COMMON = auto()
    RARE = auto()
    EPIC = auto()
    LEGENDARY = auto()
    MYTHIC = auto()

class SecretAcquisitionSystem:
    def __init__(self):
        self.skill_requirements = {
            "Elemental Mastery": "Defeat bosses of multiple elemental types",
            "Legendary Hunter": "Defeat high-level unique boss monsters",
            "Tactical Supremacy": "Defeat bosses using specific combat strategies",
            "Ancient Knowledge": "Collect boss unique traits across encounters"
        }
        self.secret_skills = {
            RarityTier.COMMON: ["Quick Strike", "Elemental Burst"],
            RarityTier.RARE: ["Elemental Conversion", "Time Warp Strike"],
            RarityTier.EPIC: ["Dimensional Slash", "Elemental Fusion"],
            RarityTier.LEGENDARY: ["Cosmic Judgment", "Eternal Blade"],
            RarityTier.MYTHIC: ["Universe Manipulation", "Absolute Dominion"]
        }
        self.player_progression = {
            "defeated_bosses": [],
            "unique_traits_encountered": set(),
            "elemental_encounters": set()
        }

    def track_boss_encounter(self, boss: Dict[str, Any]):
        self.player_progression['defeated_bosses'].append(boss)
        self.player_progression['unique_traits_encountered'].add(boss['unique_trait'])
        self.player_progression['elemental_encounters'].add(boss['element'])

    def check_unlocks(self):
        unlocked = []
        if len(self.player_progression['elemental_encounters']) >= 3:
            unlocked.append({"name": random.choice(self.secret_skills[RarityTier.RARE]), "rarity": "RARE"})
        return unlocked

class WorldLevelSystem:
    def __init__(self, max_level=100):
        self.level = 1
        self.exp = 0
        self.max_level = max_level
        self.exp_curve = {lvl: int(100 * (lvl ** 1.5)) for lvl in range(1, max_level + 1)}

    def add_exp(self, amount):
        self.exp += amount
        leveled = False
        while self.level < self.max_level and self.exp >= self.exp_curve[self.level + 1]:
            self.level += 1
            leveled = True
        return leveled
