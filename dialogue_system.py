import json
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class DialogueNode:
    def __init__(self, node_id: str, text: str, choices: List['DialogueChoice'] = None):
        self.id = node_id
        self.text = text
        self.choices = choices or []

class DialogueChoice:
    def __init__(self, text: str, next_node_id: str, conditions: Dict[str, Any] = None, actions: Dict[str, Any] = None):
        self.text = text
        self.next_node_id = next_node_id
        self.conditions = conditions or {}
        self.actions = actions or {}

class DialogueSystem:
    def __init__(self):
        self.dialogues: Dict[str, DialogueNode] = {}
        self.current_node: Optional[DialogueNode] = None
        self.active = False

    def start_dialogue(self, start_node_id: str):
        if start_node_id in self.dialogues:
            self.current_node = self.dialogues[start_node_id]
            self.active = True
            return self.current_node.text
        return "..."

    def choose_option(self, choice_index: int):
        if not self.active or not self.current_node or choice_index >= len(self.current_node.choices):
            return "", False
        choice = self.current_node.choices[choice_index]
        if choice.next_node_id == "__END__":
            self.active = False
            return "", True
        self.current_node = self.dialogues.get(choice.next_node_id)
        if self.current_node:
            return self.current_node.text, False
        return "Dialogue ended.", True
