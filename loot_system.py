import random
from enum import Enum, auto
from typing import Dict, List, Any

class RarityTier(Enum):
    COMMON = auto()
    RARE = auto()
    EPIC = auto()
    LEGENDARY = auto()
    MYTHIC = auto()
    GOD = auto()

rarity_weights = {
    'Common': 70,
    'Uncommon': 20,
    'Rare': 8,
    'Legendary': 2,
    'Mythic': 0.5,
    'God': 0.1
}

rarity_modifiers = {
    'Common': 1.0,
    'Uncommon': 1.2,
    'Rare': 1.5,
    'Legendary': 2.0,
    'Mythic': 2.5,
    'God': 3.0
}

item_types = ['weapon', 'armor', 'consumable', 'jewelry', 'artifact', 'shield', 'ring', 'amulet']
item_subtypes = {
    'weapon': ['sword', 'axe', 'bow', 'staff', 'dagger', 'mace', 'spear'],
    'armor': ['helmet', 'chestplate', 'leggings', 'boots', 'gauntlets'],
    'consumable': ['potion', 'scroll', 'food'],
    'jewelry': ['necklace', 'bracelet', 'earrings'],
    'artifact': ['orb', 'relic', 'totem'],
    'shield': ['buckler', 'kite shield', 'tower shield'],
    'ring': ['ring'],
    'amulet': ['amulet']
}

class LootSystem:
    def __init__(self):
        self.affix_prefixes = ['Fiery', 'Icy', 'Poisonous', 'Electric', 'Shadowy', 'Blazing', 'Ethereal', 'Vampiric']
        self.affix_suffixes = ['of the Bear', 'of the Dragon', 'of the Void', 'of the Storm', 'of the Phoenix', 'of the Titan']

    def generate_random_rarity(self):
        total_weight = sum(rarity_weights.values())
        rand_value = random.uniform(0, total_weight)
        cumulative_weight = 0
        for rarity, weight in rarity_weights.items():
            cumulative_weight += weight
            if rand_value <= cumulative_weight:
                return rarity
        return 'Common'

    def generate_item(self, item_level):
        item_type = random.choice(item_types)
        item_subtype = random.choice(item_subtypes[item_type])
        rarity = self.generate_random_rarity()
        
        name = self._generate_item_name(item_subtype, rarity)
        effects = self._generate_item_effects(item_type, rarity, item_level)
        
        return {
            'name': name,
            'type': item_type,
            'subtype': item_subtype,
            'rarity': rarity,
            'level': item_level,
            'effects': effects,
            'power': self._calculate_power(effects, rarity, item_level)
        }

    def _generate_item_name(self, subtype, rarity):
        if rarity in ['Rare', 'Legendary', 'Mythic', 'God']:
            return f"{random.choice(self.affix_prefixes)} {subtype.capitalize()} {random.choice(self.affix_suffixes)}"
        elif rarity == 'Uncommon':
            return f"{random.choice(self.affix_prefixes)} {subtype.capitalize()}"
        return subtype.capitalize()

    def _generate_item_effects(self, item_type, rarity, level):
        base_val = random.randint(5, 15) * rarity_modifiers[rarity] * level
        effects = {item_type: round(base_val, 2)}
        if rarity in ['Rare', 'Legendary', 'Mythic', 'God']:
            for _ in range(random.randint(1, 3)):
                stat = random.choice(['strength', 'dexterity', 'intelligence', 'vitality'])
                effects[stat] = round(random.randint(1, 5) * level * rarity_modifiers[rarity], 2)
        return effects

    def _calculate_power(self, effects, rarity, level):
        return round(sum(effects.values()) * rarity_modifiers[rarity], 2)

class Inventory:
    def __init__(self, max_weight=100):
        self.items = {}
        self.max_weight = max_weight

    def add_item(self, item, quantity=1):
        # In a real game we'd check weight
        name = item['name']
        if name in self.items:
            self.items[name]['quantity'] += quantity
        else:
            self.items[name] = {'item': item, 'quantity': quantity}
        return True
