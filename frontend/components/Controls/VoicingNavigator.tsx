'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { ChordFingering } from '@/lib/types';

interface VoicingNavigatorProps {
  voicings: ChordFingering[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export const VoicingNavigator: React.FC<VoicingNavigatorProps> = ({
  voicings,
  currentIndex,
  onSelectIndex,
}) => {
  const total = voicings.length;
  if (total <= 1) return null;

  const handlePrev = () => {
    onSelectIndex((currentIndex - 1 + total) % total);
  };

  const handleNext = () => {
    onSelectIndex((currentIndex + 1) % total);
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-900/80 rounded-xl border border-slate-800">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
        <Layers className="w-3.5 h-3.5 text-amber-500" />
        <span>
          Voicing <strong className="text-amber-400">{currentIndex + 1}</strong> of {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Previous Voicing"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Next Voicing"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
