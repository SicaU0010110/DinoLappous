import random
import logging
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum

# Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Biome(Enum):
    FOREST = "forest"
    DESERT = "desert"
    MOUNTAIN = "mountain"
    TUNDRA = "tundra"
    SWAMP = "swamp"

@dataclass
class Position:
    x: float
    y: float
    z: float

@dataclass
class CharacterStats:
    strength: int = 10
    agility: int = 10
    intelligence: int = 10
    vitality: int = 10

@dataclass
class Item:
    id: str
    name: str
    value: int
    weight: float
    effects: Dict[str, Any] = field(default_factory=dict)

class CharacterClass(Enum):
    WARRIOR = "Warrior"
    MAGE = "Mage"
    ROGUE = "Rogue"
    CLERIC = "Cleric"
    ARCHER = "Archer"
    SPELLCASTER = "Spellcaster"
    SUMMONER = "Summoner"

@dataclass
class Stats:
    strength: int = 10
    dexterity: int = 10
    intelligence: int = 10
    constitution: int = 10
    wisdom: int = 10
    charisma: int = 10

@dataclass
class Equipment:
    weapon: str = "None"
    armor: str = "None"
    accessories: List[str] = field(default_factory=list)

@dataclass
class Character:
    name: str
    char_class: CharacterClass
    level: int = 1
    stats: Stats = field(default_factory=Stats)
    equipment: Equipment = field(default_factory=Equipment)
    skills: List[str] = field(default_factory=list)
    inventory: Dict[str, int] = field(default_factory=dict)
    xp: int = 0
    xp_to_next_level: int = 100
    
    def level_up(self):
        self.level += 1
        self.xp_to_next_level = int(self.xp_to_next_level * 1.5)
        # Add stat increases based on class
        if self.char_class == CharacterClass.WARRIOR:
            self.stats.strength += 2
            self.stats.constitution += 1
        elif self.char_class == CharacterClass.MAGE:
            self.stats.intelligence += 2
            self.stats.wisdom += 1
        elif self.char_class == CharacterClass.ROGUE:
            self.stats.dexterity += 2
            self.stats.strength += 1
        elif self.char_class == CharacterClass.ARCHER:
            self.stats.dexterity += 2
            self.stats.wisdom += 1
            
        logger.info(f"{self.name} reached level {self.level}!")
    
    def add_xp(self, amount: int):
        self.xp += amount
        if self.xp >= self.xp_to_next_level:
            self.level_up()
    
    def add_item(self, item: str, quantity: int = 1):
        self.inventory[item] = self.inventory.get(item, 0) + quantity

class Sylvan(Character):
    def __init__(self, bow_type: str):
        super().__init__(name="Sylvan", char_class=CharacterClass.ARCHER, inventory={"bow": 1})

class Brute(Character):
    def __init__(self, weapon_type: str):
        super().__init__(name="Brute", char_class=CharacterClass.WARRIOR, inventory={weapon_type: 1})

class MageClass(Character):
    def __init__(self, affinity: str):
        super().__init__(name="Mage", char_class=CharacterClass.SPELLCASTER, skills=[affinity])

class Tinkerer(Character):
    def __init__(self, gadget_type: str):
        super().__init__(name="Tinkerer", char_class=CharacterClass.SUMMONER, inventory={gadget_type: 1})

class Level:
    def __init__(self, level_number: int):
        self.level_number = level_number
        self.objectives = self.generate_objectives()

    def generate_objectives(self):
        objectives = [
            "Eliminate enemies",
            "Collect resources",
            "Reach specific locations",
            "Defeat mini-bosses",
            "Free captured allies"
        ]
        return random.sample(objectives, min(5, len(objectives)))

class GameWorld:
    def __init__(self):
        self.biomes: Dict[tuple, Biome] = {}
        self.points_of_interest: List[Dict] = []
        self.landmarks: List[str] = []
        self.current_weather: str = "sunny"
        self.time_of_day: float = 0.0 
        self.lore: Dict[str, Any] = {}

class GameEngine:
    def __init__(self):
        self.world = GameWorld()
        self.characters: List[Character] = []
        self.levels = [Level(i) for i in range(1, 101)]
        self.running = True

    def initialize(self, seed: int = 42):
        random.seed(seed)
        logger.info(f"Engine initialized with seed {seed}")
        self.world.lore = {
            "history": "The Era of Shattered Moons.",
            "factions": ["Solar Technocrats", "Void Cultists"]
        }

    def add_character(self, character: Character):
        if len(self.characters) < 4:
            self.characters.append(character)
            logger.info(f"Added character: {character.name}")
        else:
            logger.warning("Character roster is full.")

class CharacterCreator:
    @staticmethod
    def create_character(name: str, char_class: CharacterClass):
        stats = Stats()
        # Initial stat bias
        if char_class == CharacterClass.WARRIOR:
            stats.strength += 5
        elif char_class == CharacterClass.MAGE:
            stats.intelligence += 5
        
        return Character(name=name, char_class=char_class, stats=stats)
