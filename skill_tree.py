import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class SkillNode:
    def __init__(self, skill_id: str, name: str, effects: Dict[str, Any]):
        self.id = skill_id
        self.name = name
        self.effects = effects
        self.unlocked = False

class SkillTree:
    def __init__(self):
        self.nodes: Dict[str, SkillNode] = {}
        self.available_points = 0

    def add_node(self, node: SkillNode):
        self.nodes[node.id] = node

    def unlock_skill(self, node_id: str):
        if node_id in self.nodes and self.available_points > 0:
            self.nodes[node_id].unlocked = True
            self.available_points -= 1
            return True
        return False
