import random
import logging
from typing import List, Tuple
from enum import Enum

logger = logging.getLogger(__name__)

class TileType(Enum):
    WALL = 0
    FLOOR = 1
    DOOR = 2
    CHEST = 3
    ENEMY = 4
    EXIT = 5

class DungeonGenerator:
    def __init__(self, seed: int = None):
        self.seed = seed or random.randint(0, 999999)
        random.seed(self.seed)
        self.width = 40
        self.height = 40
        self.rooms: List[Tuple[int, int, int, int]] = []

    def generate(self) -> List[List[TileType]]:
        dungeon = [[TileType.WALL for _ in range(self.width)] for _ in range(self.height)]
        self._generate_rooms(dungeon)
        self._connect_rooms(dungeon)
        self._place_features(dungeon)
        return dungeon

    def _generate_rooms(self, dungeon):
        num_rooms = random.randint(6, 12)
        for _ in range(num_rooms):
            w = random.randint(5, 12)
            h = random.randint(5, 12)
            x = random.randint(1, self.width - w - 1)
            y = random.randint(1, self.height - h - 1)
            overlap = False
            for (rx, ry, rw, rh) in self.rooms:
                if not (x + w < rx or rx + rw < x or y + h < ry or ry + rh < y):
                    overlap = True
                    break
            if not overlap:
                self.rooms.append((x, y, w, h))
                for i in range(x, x + w):
                    for j in range(y, y + h):
                        dungeon[j][i] = TileType.FLOOR

    def _connect_rooms(self, dungeon):
        self.rooms.sort(key=lambda r: (r[0], r[1]))
        for i in range(len(self.rooms) - 1):
            x1, y1, w1, h1 = self.rooms[i]
            x2, y2, w2, h2 = self.rooms[i+1]
            cx1, cy1 = x1 + w1 // 2, y1 + h1 // 2
            cx2, cy2 = x2 + w2 // 2, y2 + h2 // 2
            self._carve_line(dungeon, cx1, cy1, cx2, cy1)
            self._carve_line(dungeon, cx2, cy1, cx2, cy2)

    def _carve_line(self, dungeon, x1, y1, x2, y2):
        for x in range(min(x1, x2), max(x1, x2) + 1):
            if 0 <= y1 < self.height and 0 <= x < self.width:
                dungeon[y1][x] = TileType.FLOOR
        for y in range(min(y1, y2), max(y1, y2) + 1):
            if 0 <= y < self.height and 0 <= x2 < self.width:
                dungeon[y][x2] = TileType.FLOOR

    def _place_features(self, dungeon):
        for (x, y, w, h) in self.rooms:
            if random.random() < 0.4:
                cx, cy = x + random.randint(1, w-2), y + random.randint(1, h-2)
                dungeon[cy][cx] = TileType.CHEST
            num_enemies = random.randint(0, 3)
            for _ in range(num_enemies):
                ex, ey = x + random.randint(1, w-2), y + random.randint(1, h-2)
                dungeon[ey][ex] = TileType.ENEMY
        last_room = self.rooms[-1]
        ex, ey = last_room[0] + last_room[2] // 2, last_room[1] + last_room[3] // 2
        dungeon[ey][ex] = TileType.EXIT
