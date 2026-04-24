import logging
from enum import Enum
from typing import Callable

logger = logging.getLogger(__name__)

class TimeOfDay(Enum):
    DAWN = 0
    DAY = 1
    DUSK = 2
    NIGHT = 3

class DayNightCycle:
    def __init__(self, day_duration_seconds: float = 600.0):
        self.day_duration = day_duration_seconds
        self.elapsed = 0.0
        self.current_time_of_day = TimeOfDay.DAY

    def update(self, delta_time: float):
        self.elapsed += delta_time
        if self.elapsed >= self.day_duration:
            self.elapsed = 0.0
        
        t = self.elapsed / self.day_duration
        if t < 0.2:
            self.current_time_of_day = TimeOfDay.DAWN
        elif t < 0.5:
            self.current_time_of_day = TimeOfDay.DAY
        elif t < 0.7:
            self.current_time_of_day = TimeOfDay.DUSK
        else:
            self.current_time_of_day = TimeOfDay.NIGHT
        
        return self.current_time_of_day
