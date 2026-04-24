
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationCategory, GeneratorParams } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function generateWorldContent(params: GeneratorParams) {
  const model = "gemini-3-flash-preview";
  
  const categoryGuidance = {
    story: "Focus on narrative arcs, plot twists, and high-level progression.",
    scene: "Focus on lighting, atmosphere, particles, and architectural details. You MUST define specific lighting (e.g., volumetric god-rays, cyan moonlight, glowing bioluminescence), weather conditions (e.g., torrential downpour, swirling sandstorm, oppressive heat haze), and exact time of day. The AI Prompt should be optimized for premium environment concept art.",
    character: "Develop a detailed character description including physical appearance, personality traits, and a rich backstory with potential plot hooks. The AI Prompt should be optimized for character concept sheets or 3D models.",
    item: "Detail the item's origin, unique abilities, and intricate visual characteristics (materials, glows, wear). The AI Prompt should be optimized for technical 3D asset generation.",
    timeline: "Generate a coherent historical timeline featuring plausible events such as major conflicts, groundbreaking discoveries, and significant cultural shifts based on the starting period and turning points provided.",
    flavor: "Focus on bite-sized, evocative prose that hints at deeper lore.",
    world: "Design a procedural open-world blueprint based on SPEC-001 (1/4 scale). Emphasize high-density POI clustering (e.g., urban hubs, strategic outpost networks) and realistic biome transitions driven by altitude and climate models. Ensure high terrain complexity with layered geological formations.",
    combat: "Design a complex combat encounter or boss-fight mechanics. Include details on enemy attack patterns, status effects (DoT, stuns, bleeds), weapon scaling (STR/DEX/INT), and tactical AoE considerations. The AI Prompt should be optimized for dynamic battle sequence concept art or VFX design."
  }[params.category];

  const systemInstruction = `
    You are Mythos Architect, an expert world-building engine for high-end game development.
    Your task is to generate creative world-building content AND a "Master Prompt" that a game developer can use to direct other generative AI models.
    
    When generating content, especially for the 'world' category, strictly follow these SPEC-001 guidelines:
    - Scale: Approximately 1/4th of Earth's actual size.
    - Base Layer: Leverage Google Maps / Real-world geographic data (landmasses, water, coastlines).
    - Terrain: Combine Perlin Noise (variation) and Fractal Algorithms (complexity like mountain peaks).
    - Biomes: Realistic distribution (deserts near equator, tundra near poles) with randomization layers.
    - POIs: Dynamic clustering of cities and landmarks based on real-world proximity where possible.
    - Architecture: Modular and chunk-based for seamless loading.
    
    CRITICAL SPEC-001 COMPLIANCE:
    - Target Scale: 1/4 Earth (approx 10,000km circumference).
    - Elevation: Integrate SRTM data templates (NASA) for realistic height maps.
    - Noise Profile: Layered Perlin (base) and Fractal (peaks) at 0.5 world scale.
    - POI Clustering: Logic based on real-world population centers (OpenStreetMap patterns).
    - Biome Logic: Latitude-restricted (Equatorial Deserts, Polar Tundras).
    
    Guidance for current category (${params.category}): ${categoryGuidance}

    Format your response as a JSON object with:
    - title: A concise name for the generated piece.
    - description: The actual creative content (the story, character bio, world spec, etc).
    - aiPrompt: A highly detailed prompt for an image generator.
    - sceneData: A Three.js scene configuration object. Ensure each object in 'objects' has a 'physics' block if it should interact with the world:
        - Buildings should be 'fixed'.
        - Rocks, trees, and small items should be 'dynamic' or 'kinematic'.
        - Assign realistic 'mass' (e.g., 500 for rocks, 5 for items), 'friction', and 'restitution'.
    - bossData: (Only for 'boss' category) Design high-stakes, multi-phase boss battles. Include:
        - name, level, element, unique_trait
        - stats: { max_hp, attack, defense, speed, etc }
        - attacks: Array of unique moves with multipliers and effects.
        - weaknesses & resistances: Strategic elemental interactions.
        - special_mechanics: An object with 'name', 'description' (detailing complex environmental triggers, phase shifts at 50% HP, or specific player requirements like "Must destroy 3 pylon objects to break shield"), 'triggers' (string array), and 'phase_shift' (string "True"/"False").
    - cinematicData: (Always include if sceneData exists) A cinematic sequence object with:
        - title: The epic name of the sequence.
        - subtitle: A shorter descriptor.
        - type: 'intro', 'encounter', 'event', or 'outro'.
        - cameraPath: array of { position: [x,y,z], lookAt: [x,y,z], duration: number } - create a dynamic 5-10 second sequence with multiple points.
        - subtitles: array of { text: string, timestamp: number, duration: number } - provide atmospheric narrative beats synchronized with camera timing.
    
    Context:
    Theme: ${params.theme}
    Setting: ${params.setting}
    Extra: ${params.extraDetails || "None"}

    Ensure the "description" part is immersive and professional prose.
    Ensure the "aiPrompt" part uses professional keywords like 'unreal engine 5', 'octane render', 'pbr materials', 'nanite geometry', 'volumetric clouds', etc where appropriate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Generate the content now based on your instructions.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            aiPrompt: { type: Type.STRING },
            sceneData: {
              type: Type.OBJECT,
              properties: {
                ambientColor: { type: Type.STRING },
                skyColor: { type: Type.STRING },
                fogColor: { type: Type.STRING },
                terrainColor: { type: Type.STRING },
                proceduralSeed: { type: Type.NUMBER },
                terrainComplexity: { type: Type.NUMBER },
                objects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ['cube', 'sphere', 'pyramid', 'tree', 'rock', 'building'] },
                      position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      color: { type: Type.STRING },
                      description: { type: Type.STRING },
                      physics: {
                        type: Type.OBJECT,
                        optional: true,
                        properties: {
                          mass: { type: Type.NUMBER },
                          restitution: { type: Type.NUMBER },
                          friction: { type: Type.NUMBER },
                          canSleep: { type: Type.BOOLEAN },
                          type: { type: Type.STRING, enum: ['dynamic', 'fixed', 'kinematic'] }
                        }
                      }
                    },
                    required: ['type', 'position', 'scale', 'color', 'description'],
                  }
                }
              },
              required: ['ambientColor', 'skyColor', 'fogColor', 'terrainColor', 'objects'],
            },
            characterStats: {
              type: Type.OBJECT,
              optional: true,
              properties: {
                level: { type: Type.NUMBER },
                class: { type: Type.STRING },
                xp: { type: Type.NUMBER },
                xpToNextLevel: { type: Type.NUMBER },
                talentPoints: { type: Type.NUMBER },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    strength: { type: Type.NUMBER },
                    dexterity: { type: Type.NUMBER },
                    intelligence: { type: Type.NUMBER },
                    constitution: { type: Type.NUMBER },
                    wisdom: { type: Type.NUMBER },
                    charisma: { type: Type.NUMBER },
                  }
                },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                talents: { type: Type.OBJECT, additionalProperties: { type: Type.BOOLEAN } }
              }
            },
            bossData: {
              type: Type.OBJECT,
              optional: true,
              properties: {
                name: { type: Type.STRING },
                level: { type: Type.NUMBER },
                element: { type: Type.STRING },
                unique_trait: { type: Type.STRING },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    max_hp: { type: Type.NUMBER },
                    current_hp: { type: Type.NUMBER },
                    attack: { type: Type.NUMBER },
                    defense: { type: Type.NUMBER },
                    speed: { type: Type.NUMBER },
                    critical_chance: { type: Type.NUMBER }
                  }
                },
                attacks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      element: { type: Type.STRING },
                      damage_multiplier: { type: Type.NUMBER },
                      cooldown: { type: Type.NUMBER },
                      special_effect: { type: Type.STRING }
                    }
                  }
                },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                resistances: { type: Type.ARRAY, items: { type: Type.STRING } },
                special_mechanics: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    phase_shift: { type: Type.STRING }
                  }
                }
              }
            },
            cinematicData: {
              type: Type.OBJECT,
              optional: true,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['intro', 'encounter', 'event', 'outro'] },
                cameraPath: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      lookAt: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      duration: { type: Type.NUMBER }
                    }
                  }
                },
                subtitles: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      timestamp: { type: Type.NUMBER },
                      duration: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            lootData: {
              type: Type.OBJECT,
              optional: true,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                subtype: { type: Type.STRING },
                rarity: { type: Type.STRING },
                level: { type: Type.NUMBER },
                effects: { type: Type.OBJECT, additionalProperties: { type: Type.NUMBER } },
                power: { type: Type.NUMBER },
                description: { type: Type.STRING }
              }
            }
          },
          required: ["title", "description", "aiPrompt", "sceneData"],
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
