from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import uvicorn
from rpg_engine import GameEngine, CharacterCreator
from atmosphere_manager import AtmosphereManager, AtmosphereArchetype, StorylineArchetype
from info_relay import InfoRelay
from dungeon_gen import DungeonGenerator
from day_night_system import DayNightCycle
from reputation_system import ReputationSystem
from loot_generation import LootGenerator
from boss_system import BossMonsterGenerator
from loot_system import LootSystem, Inventory
import os

app = FastAPI()
engine = GameEngine()
atmo = AtmosphereManager()
relay = InfoRelay(auto_discover=False)
relay.start()

# Environmental Systems
day_night = DayNightCycle()
reputation = ReputationSystem()
loot_gen = LootGenerator()
boss_gen = BossMonsterGenerator()
loot_sys = LootSystem()

from mythos_orchestrator import MythosOrchestrator
orchestrator = MythosOrchestrator(relay, atmo)
orchestrator.start()

class GenerateRequest(BaseModel):
    category: str
    params: Dict[str, Any]

@app.on_event("startup")
async def startup():
    engine.initialize()

from combat_system import CombatManager, Combatant, Vector3, Weapon, DamageType
import random

@app.post("/api/generate")
async def handle_generate(req: GenerateRequest):
    # Bridge to specialized modules
    
    if req.category == "character":
        from rpg_engine import CharacterClass
        try:
            c_class = CharacterClass[req.params.get("char_class", "Warrior").upper()]
        except KeyError:
            c_class = CharacterClass.WARRIOR
            
        char = CharacterCreator.create_character(
            req.params.get("name", "Unknown"),
            c_class
        )
        relay.send("world.character_created", char)
        return char
    
    if req.category == "boss":
        boss = boss_gen.generate_boss_monster(req.params.get("level", 1))
        relay.send("world.boss_spawned", boss)
        return boss

    if req.category == "atmosphere":
        return {
            "atmosphere": atmo.get_current_atmosphere_text(),
            "storyline": atmo.get_current_storyline_text(),
            "time_of_day": day_night.current_time_of_day.name,
            "karma": atmo.karma
        }

    if req.category == "world":
        # Check current environment context
        return {
            "scale": "1:4",
            "generation_seed": engine.world.lore.get("seed", 42),
            "modules_active": ["Perlin_Base", "Fractal_Peaks", "POI_Clustering", "Dungeon_Gen_Entry"],
            "day_cycle": day_night.current_time_of_day.name,
            "bounds": "Earth_Scale_Scaled_0.25"
        }

    if req.category == "combat":
        manager = CombatManager()
        player = Combatant(req.params.get("theme", "Hero"), position=Vector3(0,0,0), strength=15)
        enemy = Combatant(req.params.get("setting", "Villain"), position=Vector3(1,0,0), strength=10)
        
        manager.register(player)
        manager.register(enemy)
        
        log = []
        player.on_damaged = lambda e: log.append(f"{player.name} took {e.final_damage:.1f} damage")
        enemy.on_damaged = lambda e: log.append(f"{enemy.name} took {e.final_damage:.1f} damage")
        
        for i in range(3):
            if player.is_alive() and enemy.is_alive(): manager.perform_attack(player, enemy)
            if player.is_alive() and enemy.is_alive(): manager.perform_attack(enemy, player)
        
        return {
            "simulation_log": log,
            "loot_potential": loot_gen.generate_loot(5),
            "player_status": {"hp": player.current_hp, "alive": player.is_alive()},
            "ruleset": "SPEC_COMBAT_v1.0"
        }

        
    return {"status": "unsupported_category_in_python_bridge"}

@app.get("/api/status")
async def get_status():
    return {
        "engine_running": engine.running,
        "active_atmosphere": atmo.current_atmosphere.name,
        "active_storyline": atmo.current_storyline.name
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
