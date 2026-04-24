import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Map, 
  Users, 
  Sword, 
  History, 
  Quote, 
  Plus, 
  Copy, 
  Sparkles, 
  Trash2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { GenerationCategory, GeneratedContent, GeneratorParams } from './types';
import { generateWorldContent } from './lib/gemini';

const CATEGORIES: { id: GenerationCategory; label: string; icon: any; description: string }[] = [
  { id: 'story', label: 'Story Arc', icon: BookOpen, description: 'Narrative foundations and plot points.' },
  { id: 'scene', label: 'Atmospheric Scene', icon: Map, description: 'Environmental and sensory descriptions.' },
  { id: 'character', label: 'Character Profile', icon: Users, description: 'Biographies, traits, and motivations.' },
  { id: 'item', label: 'Mystic Item', icon: Sword, description: 'Artifacts, gear, and lore-items.' },
  { id: 'timeline', label: 'Timeline Event', icon: History, description: 'Historical milestones and lore events.' },
  { id: 'flavor', label: 'Flavor Text', icon: Quote, description: 'Short atmospheric snippets and world flavor.' },
  { id: 'world', label: 'World Blueprint', icon: Map, description: 'SPEC-001: 1/4 Scale Procedural Open World Specs.' },
  { id: 'combat', label: 'Combat Encounter', icon: Sword, description: 'Simulated battle mechanics and encounter design.' },
];

const RANDOM_STARTERS: Record<GenerationCategory, { theme: string[], setting: string[], extra: string[] }> = {
  story: {
    theme: ["The Last Alchemist", "Shattered Suns", "Clockwork Rebellion", "Neon Samurai"],
    setting: ["A city built inside a dying dragon", "Floating islands above a toxic cloud", "Underground bunkers of a forgotten age"],
    extra: ["Include a betrayal", "Focus on a lost technology", "The primary conflict is resource scarcity"]
  },
  scene: {
    theme: ["Cyberpunk Rain", "Overgrown Cathedral", "Crystal Desert", "Volcanic Observatory"],
    setting: ["Deep in the subterranean data centers", "The edge of an event horizon", "A forest made of glass and sound"],
    extra: ["Cinematic wide shot", "Focus on bioluminescence", "Moody lighting, heavy fog"]
  },
  character: {
    theme: ["Kaelen the Blind Monk", "Detective Unit 7", "The Rogue Empress", "Wraith of the Wasteland"],
    setting: ["High-tech slums", "Ancient celestial palace", "Deep-sea research station"],
    extra: ["Seeking redemption", "Motivated by revenge", "Wields a weapon made of pure light"]
  },
  item: {
    theme: ["The Void Blade", "Amulet of Time", "Cursed Cog", "Solar Battery"],
    setting: ["Forged in the heart of a star", "Found in an ancient tomb", "Artifact of a lost civilization"],
    extra: ["Glows when danger is near", "Drains the sanity of the wielder", "Allows communication with ghosts"]
  },
  timeline: {
    theme: ["The Great Convergence", "Rise of the Machine Lords", "The Shattering", "The Silent War"],
    setting: ["A period of 1000 years of peace", "The dawn of space travel", "The collapse of the magical weave"],
    extra: ["Focus on cultural shifts", "End with a catastrophic discovery", "Include the fall of a major dynasty"]
  },
  flavor: {
    theme: ["Whispers in the Dark", "Lessons of the Elders", "Prophecies of Code", "Dying Breath"],
    setting: ["A scratched inscription on a city wall", "A page from a torn diary", "A voice recorded in a data-cube"],
    extra: ["Short and evocative", "Philosophical in nature", "Hints at a hidden history"]
  },
  world: {
    theme: ["Euro-Atlantic Archipelago", "Neo-Pangea Continent", "Shattered Pacific Rim", "Submerged Eurasia"],
    setting: ["1/4 Scale Earth Simulation", "Procedural Height Maps", "Dense POI Clustering"],
    extra: ["High biome concentration", "Google Maps data overlay", "Modular chunk boundary optimization"]
  },
  combat: {
    theme: ["The Dread Knight's Last Stand", "Ambush in the Neon Slums", "Siege of the Crystal Palace", "Duel on the Event Horizon"],
    setting: ["Tactical Battle Simulation", "Real-time Action Mechanics", "AoE Hazard Integration"],
    extra: ["Include critical hit multipliers", "Environmental damage effects", "Targeted limb damage"]
  }
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState<GenerationCategory>('story');
  const [theme, setTheme] = useState('');
  const [setting, setSetting] = useState('');
  const [extra, setExtra] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mythos-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('mythos-history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!theme || !setting) return;
    setIsGenerating(true);
    try {
      // Parallel call to Python autonomous engine to sync state
      fetch('/api/python/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory,
          params: { theme, setting, extra }
        })
      }).catch(err => console.warn('Python bridge sync failed', err));

      const result = await generateWorldContent({
        category: activeCategory,
        theme,
        setting,
        extraDetails: extra
      });

      const newContent: GeneratedContent = {
        id: Math.random().toString(36).substring(7),
        category: activeCategory,
        title: result.title,
        description: result.description,
        aiPrompt: result.aiPrompt,
        timestamp: Date.now()
      };

      setHistory([newContent, ...history]);
      setSelectedContent(newContent);
      setExtra('');
    } catch (error) {
      alert("Failed to generate content. Please check your AI connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(history.filter(h => h.id !== id));
    if (selectedContent?.id === id) setSelectedContent(null);
  };

  const getLabels = (cat: GenerationCategory) => {
    switch (cat) {
      case 'character':
        return { 
          theme: "Name & Race", 
          setting: "Occupation & Traits", 
          extra: "Personality & Plot Hooks",
          themePlaceholder: "e.g. Elara, Wood Elf",
          settingPlaceholder: "e.g. Rogue, adept archer, wary of outsiders",
          extraPlaceholder: "e.g. Seeking her missing twin, loves rare birds"
        };
      case 'item':
        return { 
          theme: "Item Type", 
          setting: "Keywords & Features", 
          extra: "Origin & Abilities",
          themePlaceholder: "e.g. Relic Weapon",
          settingPlaceholder: "e.g. Ancient, glowing, cursed, obsidian",
          extraPlaceholder: "e.g. Forged in dragon fire, drains life on hit"
        };
      case 'timeline':
        return { 
          theme: "Starting Period", 
          setting: "Key Turning Points", 
          extra: "Event Scope",
          themePlaceholder: "e.g. The Age of Shattered Moons",
          settingPlaceholder: "e.g. The Void Collision, Rise of the Technocrats",
          extraPlaceholder: "e.g. Focus on conflicts and scientific breakthroughs"
        };
      case 'scene':
        return { 
          theme: "Visual Theme", 
          setting: "Location/Setting", 
          extra: "Atmospheric Details",
          themePlaceholder: "e.g. Bioluminescent Gothic",
          settingPlaceholder: "e.g. Sunken cathedral, interior",
          extraPlaceholder: "e.g. Floating dust particles, emerald light, high humidity"
        };
      case 'story':
        return { 
          theme: "Narrative Theme", 
          setting: "World Context", 
          extra: "Specific Plot Seeds",
          themePlaceholder: "e.g. Revenge through Alchemy",
          settingPlaceholder: "e.g. A world where stars are dying",
          extraPlaceholder: "e.g. Include a secret society and a betrayal"
        };
      case 'flavor':
        return {
          theme: "Snippet Style",
          setting: "Context/Origin",
          extra: "Atmospheric Tone",
          themePlaceholder: "e.g. Ancient Proverb, Loading Screen Quote",
          settingPlaceholder: "e.g. Inscribed on a rusted blast door",
          extraPlaceholder: "e.g. Melancholic, warning of future disaster"
        };
      case 'world':
        return {
          theme: "Geographic Base",
          setting: "Generation Parameters",
          extra: "Module Overrides",
          themePlaceholder: "e.g. Nordic Highlands (srce: Norway SRTM)",
          settingPlaceholder: "e.g. 1:4 Scale, High Perlin Detail, Fractal Peaks",
          extraPlaceholder: "e.g. Include major landmasses from Google Maps, POI density: High"
        };
      case 'combat':
        return {
          theme: "Encounter Archetype",
          setting: "Combat Ruleset",
          extra: "Status & Mechanics",
          themePlaceholder: "e.g. High-Stakes Duel, Horde Defense",
          settingPlaceholder: "e.g. Real-time resolution, Permadeath active",
          extraPlaceholder: "e.g. Damage Over Time (Poison), Critical scaling: 2.0x"
        };
      default:
        return { 
          theme: "Primary Theme", 
          setting: "World Setting", 
          extra: "Refinement Notes",
          themePlaceholder: "e.g. High Fantasy",
          settingPlaceholder: "e.g. Continental empire",
          extraPlaceholder: "Additional details..."
        };
    }
  };

  const labels = getLabels(activeCategory);

  const handleSurpriseMe = () => {
    const starters = RANDOM_STARTERS[activeCategory];
    setTheme(starters.theme[Math.floor(Math.random() * starters.theme.length)]);
    setSetting(starters.setting[Math.floor(Math.random() * starters.setting.length)]);
    setExtra(starters.extra[Math.floor(Math.random() * starters.extra.length)]);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-ink font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-line flex flex-col bg-bg">
        <div className="p-6 border-b border-line-dim flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 border border-accent/40 rounded flex items-center justify-center">
            <Sparkles className="text-accent w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-medium tracking-tight">World Forge</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Architect Engine</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="px-2 mb-4">
            <p className="col-header">Generators</p>
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-all duration-200 ${
                activeCategory === cat.id 
                ? 'bg-white/5 border border-white/10 text-white' 
                : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                activeCategory === cat.id 
                ? 'bg-accent shadow-[0_0_8px_var(--color-accent-glow)]' 
                : 'border border-white/20'
              }`}></div>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}

          <div className="px-2 mt-8 mb-4">
            <p className="col-header">Archives</p>
          </div>
          <div className="space-y-1">
            {history.length === 0 ? (
              <p className="px-3 py-4 text-[11px] text-white/20 italic">No historical records</p>
            ) : (
              history.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`data-row p-3 rounded-md group relative border-none ${
                    selectedContent?.id === item.id ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="text-[9px] text-white/30 font-mono tracking-tighter">
                      [{new Date(item.timestamp).toLocaleDateString()}]
                    </p>
                    <button 
                      onClick={(e) => deleteFromHistory(item.id, e)}
                      className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-accent transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  <p className="text-xs font-medium truncate pr-4 text-white/80">{item.title}</p>
                </div>
              ))
            )}
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-line-dim">
          <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Runtime Engine</div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400">Stable-v4</div>
            <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400">Aether-v2</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-surface">
        {/* Header */}
        <header className="h-16 border-b border-line flex items-center justify-between px-8 bg-surface/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Active Blueprint:</div>
            <div className="text-xs font-mono px-2 py-1 bg-white/5 border border-white/10 rounded cursor-pointer hover:border-accent/40 transition-colors">
              {selectedContent ? `PROJ_${selectedContent.id.toUpperCase()}` : "UNNAMED_PROJECT"}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {setTheme(''); setSetting(''); setExtra('');}}
              className="btn-secondary"
            >
              Clear Workspace
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !theme || !setting}
              className={`px-6 py-1.5 text-xs font-semibold rounded-full shadow-lg transition-all ${
                isGenerating || !theme || !setting 
                ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
                : 'bg-accent text-black shadow-accent/20 hover:scale-[1.02]'
              }`}
            >
              {isGenerating ? 'Synthesizing...' : 'Run Generator'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex">
          {/* Scrollable Container for split panes */}
          <div className="flex-1 flex gap-8 p-8 overflow-hidden">
            
            {/* Editor Pane (Controls) */}
            <div className="w-[420px] flex flex-col gap-6 overflow-y-auto">
              <header className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-accent">
                    <Plus size={14} />
                    <span className="text-[10px] uppercase font-mono tracking-[0.3em]">Sequence Initialization</span>
                  </div>
                  <button 
                    onClick={handleSurpriseMe}
                    className="text-[10px] uppercase font-mono tracking-widest text-white/40 hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={10} />
                    Auto-Seed
                  </button>
                </div>
                <h2 className="text-3xl font-medium tracking-tight mb-3">
                  {CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h2>
                <p className="text-xs text-white/50 leading-relaxed max-w-sm">
                  {CATEGORIES.find(c => c.id === activeCategory)?.description}
                </p>
              </header>

              <div className="space-y-6">
              <div className="space-y-2">
                <label className="col-header block">{labels.theme}</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={labels.themePlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all font-mono placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="col-header block">{labels.setting}</label>
                <textarea
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  placeholder={labels.settingPlaceholder}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-accent/50 outline-none transition-all placeholder:text-white/20 resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="col-header block">{labels.extra}</label>
                  <span className="text-[9px] text-white/20 font-mono">OPTIONAL_LAYER</span>
                </div>
                <textarea
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  placeholder={labels.extraPlaceholder}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[13px] focus:border-accent/50 outline-none transition-all placeholder:text-white/20 resize-none italic"
                />
                </div>

                <div className="p-4 bg-accent/[0.03] border border-accent/20 rounded-xl">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-accent/80 mb-2">Architect Constraints</h3>
                  <p className="text-[11px] text-white/40 italic leading-relaxed">
                    "Transitions between physical states are governed by entropy coefficients. Ensure high polygonal density for key semantic vertices."
                  </p>
                </div>
              </div>
            </div>

            {/* Output Pane (Viewer) */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedContent ? (
                  <motion.div
                    key={selectedContent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col gap-6 overflow-hidden"
                  >
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl p-8 relative flex flex-col overflow-hidden group">
                      <div className="absolute top-6 right-8 flex items-center gap-3">
                         <span className="text-[10px] text-white/30 font-mono tracking-widest">PROMPT_EXECUTION_STABLE</span>
                         <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--color-accent-glow)]"></div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="text-[10px] text-accent/50 font-mono uppercase tracking-[0.4em] mb-2">Subject Header</div>
                        <h3 className="text-2xl font-medium text-white mb-4">{selectedContent.title}</h3>
                        <div className="w-12 h-0.5 bg-accent/30 mb-6"></div>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-4 font-mono text-sm leading-relaxed text-accent/80 whitespace-pre-wrap scrollbar-hide">
                        {selectedContent.description}
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 font-mono">
                        <div className="flex items-center gap-4">
                          <span>DATA_HASH: {selectedContent.id.toUpperCase()}</span>
                            <div className="flex items-center gap-1 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                              <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"></div>
                              <span className="text-[8px] tracking-widest">
                                {selectedContent.category === 'world' ? 'SPEC-001_COMPLIANT_MODEL_v1.0' : 
                                 selectedContent.category === 'combat' ? 'COMBAT_SIM_SYNC_v1.0' :
                                 'SYNCHRONIZED_WITH_AUTONOMOUS_ENGINE'}
                              </span>
                            </div>
                        </div>
                        <span>COMPILED: {new Date(selectedContent.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Master Prompt Display */}
                    <div className="h-56 bg-black/20 border border-white/5 rounded-xl p-6 relative group overflow-hidden">
                      <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-4 flex justify-between items-center">
                        <span>Master Rendering Instruction</span>
                        <button 
                          onClick={() => copyPrompt(selectedContent.aiPrompt)}
                          className="text-accent/60 hover:text-accent flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Copy size={12} />
                          <span className="tracking-widest">EXTRACT_PROMPT</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs text-white/40 leading-relaxed italic line-clamp-5 overflow-y-auto h-24 scrollbar-hide">
                        {selectedContent.aiPrompt}
                      </div>
                      
                      {/* Decorative Graph */}
                      <div className="mt-4 flex items-end gap-1.5 h-6 opacity-30">
                        {Array.from({length: 12}).map((_, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-accent/40 rounded-t-sm" 
                            style={{ height: `${Math.random() * 100}%` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 card-dark flex flex-col items-center justify-center text-center opacity-30 border-dashed border-white/5">
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6">
                      <Sparkles size={24} className="text-white/40" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 tracking-wide">Awaiting Sequence</h3>
                    <p className="text-xs max-w-[200px] leading-relaxed">Initialize architectural parameters to synthesize world-building blueprints.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </main>
    </div>
  );}
