/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { playSynthSound } from '../utils/audio';

// Feedable snacks
export interface SnackItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  effect: 'joy' | 'blush' | 'talk' | 'squeak';
}

export const SNACKS: SnackItem[] = [
  { id: 'acorn', name: 'Acorn Crunch', emoji: '🌰', color: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800', description: "Piggy's absolute favorite food. Sparks absolute joy!", effect: 'joy' },
  { id: 'corn', name: 'Golden Corn', emoji: '🌽', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800', description: "Rich, sweet corn. Gives Piggy immediate high energy!", effect: 'talk' },
  { id: 'strawberry', name: 'Sweet Berry', emoji: '🍓', color: 'bg-red-100 hover:bg-red-200 border-red-300 text-red-800', description: "Fresh garden strawberry. Extremely sweet!", effect: 'blush' },
  { id: 'soda', name: 'Fizzy Soda', emoji: '🥤', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800', description: "Sparkling sweet soda. Triggers funny giggling squeaks!", effect: 'squeak' },
];

export interface TreasureItem {
  name: string;
  emoji: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  points: number;
}

const TREASURES: TreasureItem[] = [
  { name: 'Lucky Piggy Coin', emoji: '🪙', rarity: 'Common', points: 50 },
  { name: 'Four-Leaf Clover', emoji: '🍀', rarity: 'Rare', points: 150 },
  { name: 'Golden Acorn', emoji: '🏆', rarity: 'Legendary', points: 500 },
  { name: 'Secret Diary Note', emoji: '✉️', rarity: 'Common', points: 30 },
  { name: 'Super Shiny Diamond', emoji: '💎', rarity: 'Legendary', points: 1000 },
  { name: 'Sweet Farm Flower', emoji: '🌸', rarity: 'Common', points: 20 },
];

interface BackpackCabinetProps {
  onFeed: (snack: SnackItem) => void;
  onRummage: (treasure: TreasureItem) => void;
  isRummaging: boolean;
}

export const BackpackCabinet: React.FC<BackpackCabinetProps> = ({
  onFeed,
  onRummage,
  isRummaging,
}) => {
  const [backpackLogs, setBackpackLogs] = useState<TreasureItem[]>([]);
  const [activeTab, setActiveTab] = useState<'snacks' | 'pockets'>('snacks');

  const handleRummageClick = () => {
    if (isRummaging) return;
    playSynthSound('bag');
    
    // Choose a random treasure item
    const rand = Math.floor(Math.random() * TREASURES.length);
    const item = TREASURES[rand];
    
    setTimeout(() => {
      setBackpackLogs(prev => [item, ...prev].slice(0, 5));
      onRummage(item);
      playSynthSound('success');
    }, 600);
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-pink-200 shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-pink-100 pb-2 mb-3 gap-2">
        <button
          onClick={() => setActiveTab('snacks')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'snacks'
              ? 'bg-pink-100 text-pink-700 font-semibold'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          🍛 Feed Snacks
        </button>
        <button
          onClick={() => setActiveTab('pockets')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pockets'
              ? 'bg-pink-100 text-pink-700 font-semibold'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          🎒 Backpack Pocket
        </button>
      </div>

      {/* Tabs panels */}
      {activeTab === 'snacks' ? (
        <div>
          <p className="text-xs text-pink-600/70 mb-3 text-center">
            Click is snack to feed Piggy! Watch their visual expression react.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SNACKS.map((snack) => (
              <button
                key={snack.id}
                onClick={() => onFeed(snack)}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${snack.color}`}
              >
                <span className="text-2xl mb-1 filter drop-shadow-sm">{snack.emoji}</span>
                <span className="text-xs font-semibold">{snack.name}</span>
                <span className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{snack.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-center">
            <button
              onClick={handleRummageClick}
              disabled={isRummaging}
              className={`w-full py-2 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm cursor-pointer
                ${isRummaging
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-white border border-amber-500 hover:brightness-105 active:scale-98'
                }`}
            >
              {isRummaging ? '🎒 Rummaging Bag...' : '🔍 Pull Random Bag Treasure'}
            </button>
            <p className="text-[10px] text-amber-600/70 mt-1">
              Piggy travels around the farm and puts special findings in their small crossbody bag.
            </p>
          </div>

          {/* Treasure Logs */}
          <div className="bg-amber-50/50 rounded-xl p-2 border border-amber-100 min-h-[90px] flex flex-col justify-center">
            {backpackLogs.length === 0 ? (
              <span className="text-xs text-amber-700/50 text-center block my-4">
                No items pulled today! Pull a search treasure above.
              </span>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                <span className="text-[9px] text-amber-800/60 font-semibold uppercase tracking-wider block border-b border-amber-100 pb-0.5 mb-1 text-center">
                  Recent Discoveries
                </span>
                {backpackLogs.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-amber-100 text-xs text-amber-900 shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-[8px] font-bold px-1 py-0.2 rounded border
                        ${item.rarity === 'Legendary'
                          ? 'bg-purple-100 text- purple-700 border-purple-200'
                          : item.rarity === 'Rare'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {item.rarity}
                      </span>
                      <span className="font-mono text-[10px] text-amber-600">+{item.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
