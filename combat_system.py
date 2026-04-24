"""
Combat System Module for 3D Open-World RPG
------------------------------------------
Provides classes for combatants, weapons, armour, status effects and a central
CombatManager that handles real-time attack resolution, cooldowns, area-of-effect
targeting and effect processing.
"""

from __future__ import annotations
import math
import time
import random
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Callable, Dict, List, Optional, Set, Tuple, Union

# ----------------------------- 3D Math Helper -----------------------------

@dataclass
class Vector3:
    """Simple 3D vector class to avoid external dependencies."""
    x: float = 0.0
    y: float = 0.0
    z: float = 0.0

    def __add__(self, other: Vector3) -> Vector3:
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other: Vector3) -> Vector3:
        return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)

    def __mul__(self, scalar: float) -> Vector3:
        return Vector3(self.x * scalar, self.y * scalar, self.z * scalar)

    def length(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2 + self.z ** 2)

    def normalized(self) -> Vector3:
        l = self.length()
        if l == 0:
            return Vector3(0, 0, 0)
        return Vector3(self.x / l, self.y / l, self.z / l)

    def distance_to(self, other: Vector3) -> float:
        return (self - other).length()

# ----------------------------- Enums & Constants --------------------------

class DamageType(Enum):
    PHYSICAL = auto()
    FIRE = auto()
    ICE = auto()
    LIGHTNING = auto()
    POISON = auto()
    HOLY = auto()
    SHADOW = auto()

class EffectType(Enum):
    DAMAGE_OVER_TIME = auto()
    HEAL_OVER_TIME = auto()
    STAT_MODIFIER = auto()
    STUN = auto()
    SLOW = auto()
    BLEED = auto()

# ----------------------------- Items & Equipment --------------------------

@dataclass
class Weapon:
    """Represents an equippable weapon."""
    name: str
    base_damage: float
    damage_type: DamageType = DamageType.PHYSICAL
    attack_range: float = 2.0
    attack_cooldown: float = 1.0
    aoe_radius: float = 0.0
    critical_chance: float = 0.05
    critical_multiplier: float = 1.5
    scaling_strength: float = 1.0
    scaling_dexterity: float = 0.5
    scaling_intelligence: float = 0.2

@dataclass
class Armor:
    """Represents a piece of armour."""
    name: str
    defense: float = 0.0
    resistances: Dict[DamageType, float] = field(default_factory=dict)

# ----------------------------- Status Effects -----------------------------

@dataclass
class StatusEffect:
    """Temporary effect applied to a combatant."""
    name: str
    effect_type: EffectType
    duration: float
    tick_interval: float = 1.0
    damage_per_tick: float = 0.0
    damage_type: DamageType = DamageType.PHYSICAL
    stat_modifiers: Dict[str, float] = field(default_factory=dict)
    source_id: Optional[int] = None
    elapsed: float = 0.0
    tick_timer: float = 0.0

# ----------------------------- Combatant ----------------------------------

class Combatant:
    _id_counter = 0

    def __init__(
        self,
        name: str,
        position: Vector3 = Vector3(),
        rotation: Vector3 = Vector3(),
        level: int = 1,
        max_hp: float = 100.0,
        max_mana: float = 50.0,
        strength: float = 10.0,
        dexterity: float = 10.0,
        intelligence: float = 10.0,
        move_speed: float = 5.0,
        weapon: Optional[Weapon] = None,
        armor_pieces: Optional[List[Armor]] = None
    ):
        self.id = Combatant._id_counter
        Combatant._id_counter += 1
        self.name = name
        self.position = position
        self.rotation = rotation
        self.level = level
        self.base_strength = strength
        self.base_dexterity = dexterity
        self.base_intelligence = intelligence
        self.base_move_speed = move_speed
        self.strength = strength
        self.dexterity = dexterity
        self.intelligence = intelligence
        self.move_speed = move_speed
        self.max_hp = max_hp
        self.current_hp = max_hp
        self.max_mana = max_mana
        self.current_mana = max_mana
        self.weapon = weapon
        self.armor_pieces = armor_pieces if armor_pieces else []
        self.status_effects: List[StatusEffect] = []
        self._last_attack_time: Dict[int, float] = {}
        self.is_dead = False
        self.on_damaged: Optional[Callable[[DamageEvent], None]] = None
        self.on_healed: Optional[Callable[[HealEvent], None]] = None
        self.on_death: Optional[Callable[[Combatant], None]] = None

    @property
    def attack_power(self) -> float:
        if not self.weapon:
            return self.strength * 0.5
        return (self.weapon.base_damage +
                self.strength * self.weapon.scaling_strength +
                self.dexterity * self.weapon.scaling_dexterity +
                self.intelligence * self.weapon.scaling_intelligence)

    @property
    def total_defense(self) -> float:
        return sum(armor.defense for armor in self.armor_pieces)

    def get_resistance(self, damage_type: DamageType) -> float:
        res = 0.0
        for armor in self.armor_pieces:
            res += armor.resistances.get(damage_type, 0.0)
        return min(res, 0.75)

    def is_alive(self) -> bool:
        return not self.is_dead and self.current_hp > 0

    def take_damage(self, damage_event: DamageEvent) -> None:
        if self.is_dead: return
        self.current_hp -= damage_event.final_damage
        if self.on_damaged: self.on_damaged(damage_event)
        if self.current_hp <= 0:
            self.current_hp = 0
            self.is_dead = True
            if self.on_death: self.on_death(self)

    def update_effects(self, delta_time: float, manager: CombatManager) -> None:
        to_remove = []
        for effect in self.status_effects:
            effect.elapsed += delta_time
            if effect.elapsed >= effect.duration:
                to_remove.append(effect)
                continue
            effect.tick_timer += delta_time
            while effect.tick_timer >= effect.tick_interval:
                effect.tick_timer -= effect.tick_interval
                if effect.effect_type in (EffectType.DAMAGE_OVER_TIME, EffectType.BLEED):
                    dmg = effect.damage_per_tick
                    self.current_hp -= dmg
                    if self.on_damaged:
                        self.on_damaged(DamageEvent(effect.source_id, self, dmg, effect.damage_type, dmg, False))
                    if self.current_hp <= 0:
                        self.current_hp = 0
                        self.is_dead = True
                        if self.on_death: self.on_death(self)
        for effect in to_remove:
            self.status_effects.remove(effect)

@dataclass
class DamageEvent:
    source_id: Optional[int]
    target: Combatant
    original_damage: float
    damage_type: DamageType
    final_damage: float
    is_critical: bool

@dataclass
class HealEvent:
    target: Combatant
    amount: float

class CombatManager:
    def __init__(self):
        self.combatants: Dict[int, Combatant] = {}

    def register(self, combatant: Combatant) -> None:
        self.combatants[combatant.id] = combatant

    def update(self, delta_time: float) -> None:
        for combatant in list(self.combatants.values()):
            if combatant.is_alive():
                combatant.update_effects(delta_time, self)

    def perform_attack(self, attacker: Combatant, target: Combatant) -> bool:
        if not attacker.is_alive() or not target.is_alive(): return False
        weapon = attacker.weapon or Weapon("Unarmed", 2.0, attack_range=1.5)
        
        now = time.time()
        last_time = attacker._last_attack_time.get(target.id, 0.0)
        if now - last_time < weapon.attack_cooldown: return False
        
        distance = attacker.position.distance_to(target.position)
        if distance > weapon.attack_range: return False

        attacker._last_attack_time[target.id] = now
        
        base_dmg = attacker.attack_power
        crit = random.random() < weapon.critical_chance
        if crit: base_dmg *= weapon.critical_multiplier

        defense = target.total_defense
        resistance = target.get_resistance(weapon.damage_type)
        mitigated_dmg = base_dmg * (1.0 - defense / (defense + 100))
        final_dmg = max(1.0, mitigated_dmg * (1.0 - resistance))

        event = DamageEvent(attacker.id, target, base_dmg, weapon.damage_type, final_dmg, crit)
        target.take_damage(event)
        return True
