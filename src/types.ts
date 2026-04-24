
export type GenerationCategory = 'story' | 'scene' | 'character' | 'item' | 'timeline' | 'flavor' | 'world' | 'combat';

export interface GeneratedContent {
  id: string;
  category: GenerationCategory;
  title: string;
  description: string;
  aiPrompt: string;
  timestamp: number;
}

export interface GeneratorParams {
  category: GenerationCategory;
  theme: string;
  setting: string;
  extraDetails?: string;
}
