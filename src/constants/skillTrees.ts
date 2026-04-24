import { Sword, Shield, Zap, Target, Book, Brain, Heart, Crosshair } from 'lucide-react';

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: any;
  cost: number;
  requiredLevel: number;
  prerequisites?: string[];
  bonuses: {
    stat?: string;
    value?: number;
    effect?: string;
  };
}

export interface SkillTree {
  id: string;
  className: string;
  talents: Talent[];
}

export const SKILL_TREES: Record<string, SkillTree> = {
  'Warrior': {
    id: 'warrior-tree',
    className: 'Warrior',
    talents: [
      { id: 'bash', name: 'Heavy Bash', description: 'Strong melee attack that stuns.', icon: Sword, cost: 1, requiredLevel: 1, bonuses: { effect: 'Stun +2s' } },
      { id: 'toughness', name: 'Iron Skin', description: 'Passive +5 Constitution.', icon: Shield, cost: 1, requiredLevel: 2, bonuses: { stat: 'constitution', value: 5 } },
      { id: 'cleave', name: 'Cleaving Strike', description: 'Attack multiple enemies.', icon: Sword, cost: 2, requiredLevel: 5, prerequisites: ['bash'], bonuses: { effect: 'AoE Damage' } },
      { id: 'warcry', name: 'Battle Cry', description: 'Buff allies and debuff enemies.', icon: Heart, cost: 1, requiredLevel: 3, bonuses: { effect: 'Party ATK Up' } },
    ]
  },
  'Mage': {
    id: 'mage-tree',
    className: 'Mage',
    talents: [
      { id: 'fireball', name: 'Fireball', description: 'Classic fire projectile.', icon: Zap, cost: 1, requiredLevel: 1, bonuses: { effect: 'Burn' } },
      { id: 'intellect', name: 'Arcane Wisdom', description: 'Passive +5 Intelligence.', icon: Brain, cost: 1, requiredLevel: 2, bonuses: { stat: 'intelligence', value: 5 } },
      { id: 'teleport', name: 'Blink', description: 'Short range teleport.', icon: Target, cost: 2, requiredLevel: 4, bonuses: { effect: 'Mobility' } },
      { id: 'manaflow', name: 'Mana Flow', description: 'Increases mana regeneration.', icon: Zap, cost: 1, requiredLevel: 3, bonuses: { effect: 'Mana Regen' } },
    ]
  },
  'Rogue': {
    id: 'rogue-tree',
    className: 'Rogue',
    talents: [
      { id: 'backstab', name: 'Backstab', description: 'Extra damage from behind.', icon: Sword, cost: 1, requiredLevel: 1, bonuses: { effect: 'Crit Multiplier' } },
      { id: 'stealth', name: 'Invisibility', description: 'Become invisible for a duration.', icon: Crosshair, cost: 2, requiredLevel: 3, bonuses: { effect: 'No Aggro' } },
      { id: 'reflexes', name: 'Fast Reflexes', description: 'Passive +5 Dexterity.', icon: Zap, cost: 1, requiredLevel: 2, bonuses: { stat: 'dexterity', value: 5 } },
      { id: 'poison', name: 'Toxic Coating', description: 'Attacks apply poison.', icon: Zap, cost: 1, requiredLevel: 4, bonuses: { effect: 'Poison DOT' } },
    ]
  }
};
