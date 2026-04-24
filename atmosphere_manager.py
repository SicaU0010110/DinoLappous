import logging
import random
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum

logger = logging.getLogger(__name__)

class AtmosphereArchetype(Enum):
    MYSTERIOUS = 0
    ADVENTUROUS = 1
    MYSTICAL = 2
    SERENE = 3
    EPIC = 4

class StorylineArchetype(Enum):
    MYSTERY = 0
    HEROIC_QUEST = 1
    TRAGIC_LOVE = 2
    ACTION = 3
    POLITICAL = 4

ATMOSPHERE_TEXT = {
    AtmosphereArchetype.MYSTERIOUS: "Mysterious and suspenseful atmosphere.",
    AtmosphereArchetype.ADVENTUROUS: "Thrilling and adventurous atmosphere.",
    AtmosphereArchetype.MYSTICAL: "Enigmatic and mystical atmosphere.",
    AtmosphereArchetype.SERENE: "Serene and peaceful atmosphere.",
    AtmosphereArchetype.EPIC: "Epic and grand atmosphere.",
}

STORYLINE_TEXT = {
    StorylineArchetype.MYSTERY: "Intriguing mystery unfolding.",
    StorylineArchetype.HEROIC_QUEST: "Epic quest to save the world.",
    StorylineArchetype.TRAGIC_LOVE: "Heart-wrenching tale of love and loss.",
    StorylineArchetype.ACTION: "Action-packed adventure.",
    StorylineArchetype.POLITICAL: "Intricate political intrigue.",
}

class AtmosphereManager:
    def __init__(self, initial_atmosphere=AtmosphereArchetype.ADVENTUROUS, 
                 initial_storyline=StorylineArchetype.HEROIC_QUEST):
        self.current_atmosphere = initial_atmosphere
        self.current_storyline = initial_storyline
        self.karma = 0

    def get_current_atmosphere_text(self):
        return ATMOSPHERE_TEXT[self.current_atmosphere]

    def get_current_storyline_text(self):
        return STORYLINE_TEXT[self.current_storyline]

    def adjust_for_action(self, action_type: str):
        if action_type == "dark":
            self.karma -= 1
            if self.karma < -5:
                self.current_atmosphere = AtmosphereArchetype.MYSTERIOUS
        elif action_type == "heroic":
            self.karma += 1
            if self.karma > 5:
                self.current_atmosphere = AtmosphereArchetype.EPIC
