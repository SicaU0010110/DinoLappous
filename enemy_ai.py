import logging
import math
import random
from enum import Enum
from typing import Tuple, List, Optional

logger = logging.getLogger(__name__)

class AIState(Enum):
    IDLE = "idle"
    PATROL = "patrol"
    CHASE = "chase"
    ATTACK = "attack"
    RETREAT = "retreat"

class EnemyAI:
    def __init__(self, enemy_id: str, detection_range: float = 150, attack_range: float = 40):
        self.enemy_id = enemy_id
        self.state = AIState.IDLE
        self.detection_range = detection_range
        self.attack_range = attack_range
        self.patrol_points: List[Tuple[float, float]] = []
        self.current_patrol_index = 0
        self.state_timer = 0.0
        self.attack_cooldown = 0.0

    def update(self, player_pos: Tuple[float, float], enemy_pos: Tuple[float, float], delta_time: float):
        if self.attack_cooldown > 0:
            self.attack_cooldown -= delta_time

        dx = player_pos[0] - enemy_pos[0]
        dy = player_pos[1] - enemy_pos[1]
        dist = math.hypot(dx, dy)

        if dist < self.detection_range:
            if dist < self.attack_range:
                self.state = AIState.ATTACK
            else:
                self.state = AIState.CHASE
        else:
            self.state = AIState.IDLE

        return self.state
