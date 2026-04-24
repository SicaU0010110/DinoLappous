
export type GenerationCategory = 'story' | 'scene' | 'character' | 'item' | 'timeline' | 'flavor' | 'world' | 'combat' | 'boss';

export interface SceneData {
  ambientColor: string;
  skyColor: string;
  fogColor: string;
  terrainColor: string;
  proceduralSeed?: number;
  terrainComplexity?: number;
  objects: Array<{
    type: 'cube' | 'sphere' | 'pyramid' | 'tree' | 'rock' | 'building';
    position: [number, number, number];
    scale: [number, number, number];
    color: string;
    description: string;
    physics?: {
      mass?: number;
      restitution?: number;
      friction?: number;
      canSleep?: boolean;
      type?: 'dynamic' | 'fixed' | 'kinematic';
    };
  }>;
}

export interface CharacterStats {
  level: number;
  class: string;
  xp: number;
  xpToNextLevel: number;
  talentPoints: number;
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
    constitution: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  talents: Record<string, boolean>;
}

export interface BossData {
  name: string;
  level: number;
  element: string;
  unique_trait: string;
  stats: {
    max_hp: number;
    current_hp: number;
    attack: number;
    defense: number;
    speed: number;
    critical_chance: number;
  };
  attacks: Array<{
    name: string;
    type: string;
    element: string;
    damage_multiplier: number;
    cooldown: number;
    special_effect: any;
  }>;
  weaknesses: string[];
  resistances: string[];
  special_mechanics: any;
}

export interface CinematicSequence {
  id: string;
  type: 'intro' | 'encounter' | 'event' | 'outro';
  cameraPath: Array<{
    position: [number, number, number];
    lookAt: [number, number, number];
    duration: number;
  }>;
  subtitles: Array<{
    text: string;
    timestamp: number;
    duration: number;
  }>;
  title?: string;
  subtitle?: string;
}

export interface GeneratedContent {
  id: string;
  category: GenerationCategory;
  title: string;
  description: string;
  aiPrompt: string;
  timestamp: number;
  sceneData?: SceneData;
  characterStats?: CharacterStats;
  bossData?: BossData;
  cinematicData?: CinematicSequence;
}

export interface GeneratorParams {
  category: GenerationCategory;
  theme: string;
  setting: string;
  extraDetails?: string;
}
