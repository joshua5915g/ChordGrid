'use client';

import React from 'react';
import { ROOT_NOTES, CHORD_QUALITIES } from '@/lib/defaultChords';

interface ChordSelectorProps {
  root: string;
  quality: string;
  onRootChange: (root: string) => void;
  onQualityChange: (quality: string) => void;
}

export const ChordSelector: React.FC<ChordSelectorProps> = ({
  root,
  quality,
  onRootChange,
  onQualityChange,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Root Notes Grid */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">
          Root Note
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {ROOT_NOTES.map((note) => {
            const isSelected = note === root;
            return (
              <button
                key={note}
                onClick={() => onRootChange(note)}
                className={`py-2 px-1 text-center font-bold text-sm rounded-lg transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-black shadow-glow-amber scale-105'
                    : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white border border-slate-700/40'
                }`}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Chips */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">
          Chord Quality
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CHORD_QUALITIES.map((q) => {
            const isSelected = q.id === quality;
            return (
              <button
                key={q.id}
                onClick={() => onQualityChange(q.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-glow-amber font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/40'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
