import logging
import threading
from typing import Any, Callable, Dict, List, Optional, Set, Union
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger("info_relay")

class InfoRelay:
    _instance = None
    def __init__(self, auto_discover: bool = False, async_mode: bool = True, max_workers: int = 4):
        self._consumers = defaultdict(list)
        self._async_mode = async_mode
        self._executor = ThreadPoolExecutor(max_workers=max_workers) if async_mode else None
        self._running = False
        InfoRelay._instance = self

    @classmethod
    def get_instance(cls):
        return cls._instance

    def register_consumer(self, func, topics):
        if isinstance(topics, str): topics = [topics]
        for topic in topics:
            self._consumers[topic].append(func)

    def send(self, topic: str, data: Any, source: str = "unknown"):
        if not self._running: return
        consumers = []
        for t, c in self._consumers.items():
            if t == topic or (t.endswith('.*') and topic.startswith(t[:-2])):
                consumers.extend(c)
        for consumer in consumers:
            if self._async_mode:
                self._executor.submit(consumer, data, topic)
            else:
                consumer(data, topic)

    def start(self):
        self._running = True
        logger.info("InfoRelay started")

    def stop(self):
        self._running = False
        if self._executor: self._executor.shutdown()
