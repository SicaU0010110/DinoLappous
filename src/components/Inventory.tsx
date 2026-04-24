import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Trash2, Shield, Sword, FlaskConical, CircleChevronRight } from 'lucide-react';
import { LootItem } from '../types';

interface InventoryProps {
  items: LootItem[];
  onRemove?: (itemId: string) => void;
  onUse?: (item: LootItem) => void;
}

const RARITY_COLORS: Record<string, string> = {
  'Common': 'border-white/10 text-white/60',
  'Uncommon': 'border-green-500/30 text-green-400',
  'Rare': 'border-blue-500/30 text-blue-400',
  'Legendary': 'border-orange-500/30 text-orange-400',
  'Mythic': 'border-purple-500/30 text-purple-400',
  'God': 'border-red-500/30 text-red-400',
};

const TYPE_ICONS: Record<string, any> = {
  'weapon': Sword,
  'armor': Shield,
  'consumable': FlaskConical,
  'jewelry': CircleChevronRight,
  'artifact': Package,
};

export default function Inventory({ items, onRemove, onUse }: InventoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="text-accent" size={18} />
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Inventory ({items.length})</h3>
      </div>

      {items.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
          <p className="text-xs text-white/30 italic font-mono uppercase tracking-widest">No items in cargo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {items.map((item) => {
              const Icon = TYPE_ICONS[item.type.toLowerCase()] || Package;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 bg-black/40 border ${RARITY_COLORS[item.rarity] || 'border-white/10'} rounded-lg group hover:bg-white/5 transition-all`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${RARITY_COLORS[item.rarity]?.replace('text', 'bg').replace('border', 'bg-opacity-10') || 'bg-white/5'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white mb-0.5">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase tracking-wider opacity-50 font-mono">
                            {item.rarity} {item.type}
                          </span>
                          <span className="text-[9px] text-accent font-bold px-1 py-0.5 bg-accent/10 border border-accent/20 rounded">
                            LVL {item.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onUse && (
                        <button
                          onClick={() => onUse(item)}
                          className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                          title="Equip/Use"
                        >
                          <CircleChevronRight size={14} />
                        </button>
                      )}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          title="Discard"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {Object.keys(item.effects).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(item.effects).map(([stat, val]) => (
                        <div key={stat} className="px-1.5 py-0.5 bg-white/5 rounded text-[8px] text-white/40 uppercase tracking-tighter">
                          {stat}: <span className="text-white/80">+{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
