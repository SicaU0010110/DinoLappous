
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationCategory, GeneratorParams } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function generateWorldContent(params: GeneratorParams) {
  const model = "gemini-3-flash-preview";
  
  const categoryGuidance = {
    story: "Focus on narrative arcs, plot twists, and high-level progression.",
    scene: "Focus on lighting, atmosphere, particles, and architectural details. The AI Prompt should be optimized for environment concept art.",
    character: "Develop a detailed character description including physical appearance, personality traits, and a rich backstory with potential plot hooks. The AI Prompt should be optimized for character concept sheets or 3D models.",
    item: "Detail the item's origin, unique abilities, and intricate visual characteristics (materials, glows, wear). The AI Prompt should be optimized for technical 3D asset generation.",
    timeline: "Generate a coherent historical timeline featuring plausible events such as major conflicts, groundbreaking discoveries, and significant cultural shifts based on the starting period and turning points provided.",
    flavor: "Focus on bite-sized, evocative prose that hints at deeper lore.",
    world: "Design a procedural open-world blueprint based on SPEC-001. This includes a 1/4 scale Earth model, Google Maps data integration for landmasses, terrain modules (Perlin/Fractal noise), biome classification, and POI clustering (cities/landmarks) based on real-world geography.",
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
    - aiPrompt: A highly detailed, technical, and artistic prompt designed to be used in a generative AI model (e.g. "Cinematic shot of...", "8k height map texture for...", "3D modular asset of...").
    
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
          },
          required: ["title", "description", "aiPrompt"],
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
