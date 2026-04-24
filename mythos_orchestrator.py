import random
import logging
from typing import Dict, List, Optional, Any, Callable
import time
import threading

logger = logging.getLogger("mythos_orchestrator")

class MythosOrchestrator:
    """
    Autonomous orchestrator that monitors game state via InfoRelay 
    and automatically triggers refinements or events.
    """
    def __init__(self, relay, atmo_mgr):
        self.relay = relay
        self.atmo_mgr = atmo_mgr
        self.running = False
        self._thread = None

    def start(self):
        self.running = True
        self.relay.register_consumer(self.on_world_event, topics=["world.*"])
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()
        logger.info("Mythos Orchestrator active")

    def _loop(self):
        while self.running:
            # Autonomous pulse: check if atmosphere needs a nudge
            time.sleep(10)
            if random.random() < 0.1:
                logger.info("Autonomous Pulse: Scanning world consistency...")

    def on_world_event(self, data, topic):
        logger.info(f"Orchestrator handled {topic}: {data}")
        if "character_created" in topic:
            # Maybe adjust atmosphere based on character traits
            if "dark" in str(data.get('traits', '')).lower():
                self.atmo_mgr.adjust_for_action("dark")
