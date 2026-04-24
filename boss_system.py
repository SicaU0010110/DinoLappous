import random
import math
from enum import Enum, auto
from typing import List, Dict, Any, Tuple

class ElementType(Enum):
    PHYSICAL = auto()
    FIRE = auto()
    WATER = auto()
    EARTH = auto()
    WIND = auto()
    LIGHTNING = auto()
    DARK = auto()
    LIGHT = auto()

class BossMonsterGenerator:
    def __init__(self, difficulty_scale=1.0):
        self.difficulty_scale = difficulty_scale
        self.name_prefixes = [
            "Ancient", "Legendary", "Corrupted", "Primordial", "Ethereal", 
            "Shadowy", "Radiant", "Abyssal", "Celestial", "Infernal"
        ]
        self.name_suffixes = [
            "Destroyer", "Nightmare", "Guardian", "Harbinger", "Titan", 
            "Doom", "Wrath", "Sovereign", "Behemoth", "Colossus"
        ]
        self.attack_patterns = [
            "Cyclical", "Telegraphed", "Random", "Phase-Shifting", 
            "Adaptive", "Momentum-Based", "Elemental-Surge"
        ]
        self.unique_traits = [
            "Regeneration", "Split Personality", "Time Manipulation", 
            "Element Absorption", "Shapeshifting", "Mirror Reflection", 
            "Curse Infliction", "Dimensional Shift"
        ]

    def generate_boss_monster(self, player_level: int) -> Dict[str, Any]:
        base_hp = 100 * player_level * self.difficulty_scale
        base_attack = 10 * player_level * self.difficulty_scale
        base_defense = 5 * player_level * self.difficulty_scale
        
        boss_name = self._generate_boss_name()
        primary_element = random.choice(list(ElementType))
        unique_trait = random.choice(self.unique_traits)
        
        stats = self._generate_boss_stats(
            base_hp, base_attack, base_defense, 
            primary_element, unique_trait
        )
        
        attacks = self._generate_attack_patterns(player_level)
        weaknesses, resistances = self._generate_elemental_interactions(primary_element)
        
        return {
            "name": boss_name,
            "level": math.ceil(player_level * self.difficulty_scale),
            "element": primary_element.name,
            "unique_trait": unique_trait,
            "stats": stats,
            "attacks": attacks,
            "weaknesses": [w.name for w in weaknesses],
            "resistances": [r.name for r in resistances],
            "special_mechanics": self._generate_special_mechanics(unique_trait)
        }

    def _generate_boss_name(self) -> str:
        prefix = random.choice(self.name_prefixes)
        suffix = random.choice(self.name_suffixes)
        return f"{prefix} {suffix}"

    def _generate_boss_stats(self, base_hp, base_attack, base_defense, element, unique_trait) -> Dict[str, float]:
        element_multipliers = {
            ElementType.FIRE: (1.2, 1.1, 0.9),
            ElementType.WATER: (1.0, 0.9, 1.2),
            ElementType.EARTH: (1.3, 0.8, 1.1),
            ElementType.WIND: (0.9, 1.2, 1.0),
            ElementType.LIGHTNING: (1.1, 1.3, 0.8),
            ElementType.DARK: (1.2, 1.0, 1.0),
            ElementType.LIGHT: (1.0, 1.1, 1.1),
            ElementType.PHYSICAL: (1.0, 1.0, 1.0)
        }
        trait_multipliers = {
            "Regeneration": (1.3, 0.9, 1.1),
            "Split Personality": (1.2, 1.2, 0.9),
            "Time Manipulation": (1.0, 1.3, 1.1),
            "Element Absorption": (1.1, 1.0, 1.2),
            "Shapeshifting": (1.2, 1.1, 1.0),
            "Mirror Reflection": (0.9, 1.2, 1.1),
            "Curse Infliction": (1.0, 1.1, 1.2),
            "Dimensional Shift": (1.1, 1.2, 0.9)
        }
        elem_mult = element_multipliers.get(element, (1.0, 1.0, 1.0))
        trait_mult = trait_multipliers.get(unique_trait, (1.0, 1.0, 1.0))
        hp = base_hp * elem_mult[0] * trait_mult[0] * random.uniform(0.9, 1.1)
        attack = base_attack * elem_mult[1] * trait_mult[1] * random.uniform(0.9, 1.1)
        defense = base_defense * elem_mult[2] * trait_mult[2] * random.uniform(0.9, 1.1)
        return {
            "max_hp": round(hp, 2),
            "current_hp": round(hp, 2),
            "attack": round(attack, 2),
            "defense": round(defense, 2),
            "speed": round(random.uniform(5, 15), 2),
            "critical_chance": round(random.uniform(0.05, 0.2), 2)
        }

    def _generate_attack_patterns(self, player_level: int) -> List[Dict[str, Any]]:
        num_attacks = random.randint(3, 6)
        attacks = []
        for _ in range(num_attacks):
            attack = {
                "name": self._generate_attack_name(),
                "type": random.choice(self.attack_patterns),
                "element": random.choice(list(ElementType)).name,
                "damage_multiplier": random.uniform(0.8, 1.5),
                "cooldown": random.uniform(2, 10),
                "special_effect": self._generate_special_attack_effect()
            }
            attacks.append(attack)
        return attacks

    def _generate_attack_name(self) -> str:
        adjectives = ["Devastating", "Chaotic", "Ethereal", "Crushing", "Mystic", "Temporal", "Primal", "Resonating"]
        types = ["Strike", "Surge", "Blast", "Wave", "Eruption", "Cascade", "Vortex", "Judgment"]
        return f"{random.choice(adjectives)} {random.choice(types)}"

    def _generate_special_attack_effect(self) -> Dict[str, Any]:
        effects = [
            {"type": "Stun", "duration": random.uniform(1, 3)},
            {"type": "Damage Over Time", "damage_percent": random.uniform(0.05, 0.2)},
            {"type": "Vulnerability", "defense_reduction": random.uniform(0.1, 0.3)},
            {"type": "Energy Drain", "energy_percent": random.uniform(0.1, 0.4)},
            {"type": "Elemental Conversion", "conversion_chance": random.uniform(0.1, 0.3)}
        ]
        return random.choice(effects)

    def _generate_elemental_interactions(self, primary_element: ElementType) -> Tuple[List[ElementType], List[ElementType]]:
        elemental_chart = {
            ElementType.FIRE: {"weak_to": [ElementType.WATER, ElementType.EARTH], "resistant_to": [ElementType.FIRE, ElementType.LIGHTNING]},
            ElementType.WATER: {"weak_to": [ElementType.LIGHTNING, ElementType.WIND], "resistant_to": [ElementType.FIRE, ElementType.WATER]},
        }
        interactions = elemental_chart.get(primary_element, {"weak_to": [], "resistant_to": []})
        return interactions["weak_to"], interactions["resistant_to"]

    def _generate_special_mechanics(self, unique_trait: str) -> Dict[str, Any]:
        complex_mechanics = [
            {
                "name": "Environmental Resonance",
                "description": "The boss is tethered to 3 surrounding energy pylons. It is invulnerable until all pylons are destroyed.",
                "triggers": ["Pylon Destruction", "Vulnerability Window"],
                "phase_shift": "True"
            },
            {
                "name": "Shattered Equilibrium",
                "description": "At 50% health, the boss splits into two smaller entities with shared health but different elemental affinities.",
                "triggers": ["HP Threshold 50%"],
                "phase_shift": "True"
            },
            {
                "name": "Reactive Adaptation",
                "description": "Every time the boss takes 10% damage, it adapts its resistance to the last element it was hit with for 15 seconds.",
                "triggers": ["Damage Threshold"],
                "phase_shift": "False"
            },
            {
                "name": "Gravity Well",
                "description": "The boss periodically creates a localized black hole. Players must dash out of its radius or be pulled in for massive physical damage.",
                "triggers": ["Timed Interval (20s)"],
                "phase_shift": "False"
            }
        ]
        
        base_mechanics = {
            "Regeneration": {
                "name": "Eternal Pulse",
                "description": "Recover 5% HP every 10 seconds unless hit by a Fire-based attack.",
                "triggers": ["Time", "Elemental Vulnerability"]
            },
            "Split Personality": {
                "name": "Dual Consciousness",
                "description": "Boss toggles between Aggressive (High ATK/Low DEF) and Sentinel (Low ATK/High DEF) forms every 15 seconds.",
                "triggers": ["Timed Interval (15s)"]
            }
        }
        
        return base_mechanics.get(unique_trait, random.choice(complex_mechanics))
