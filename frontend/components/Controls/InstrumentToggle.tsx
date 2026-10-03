'use client';

import React from 'react';
import { InstrumentType } from '@/lib/types';
import { Music, Radio } from 'lucide-react';

interface InstrumentToggleProps {
  instrument: InstrumentType;
  onChange: (inst: InstrumentType) => void;
}

export const InstrumentToggle: React.FC<InstrumentToggleProps> = ({ instrument, onChange }) => {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 shadow-inner">
      <button
        onClick={() => onChange('guitar')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          instrument === 'guitar'
            ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Music className="w-4 h-4" />
        <span>Guitar (6-String)</span>
      </button>

      <button
        onClick={() => onChange('ukulele')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          instrument === 'ukulele'
            ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Radio className="w-4 h-4" />
        <span>Ukulele (4-String)</span>
      </button>
    </div>
  );
};
