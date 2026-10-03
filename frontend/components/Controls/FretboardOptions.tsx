'use client';

import React from 'react';
import { Tuning, InstrumentType } from '@/lib/types';
import { Sliders, RotateCw, ArrowLeftRight, Bookmark } from 'lucide-react';

interface FretboardOptionsProps {
  orientation: 'horizontal' | 'vertical';
  isLefty: boolean;
  capoFret: number;
  selectedTuning: Tuning;
  tunings: Tuning[];
  instrument: InstrumentType;
  onOrientationToggle: () => void;
  onLeftyToggle: () => void;
  onCapoChange: (capo: number) => void;
  onTuningChange: (tuning: Tuning) => void;
}

export const FretboardOptions: React.FC<FretboardOptionsProps> = ({
  orientation,
  isLefty,
  capoFret,
  selectedTuning,
  tunings,
  instrument,
  onOrientationToggle,
  onLeftyToggle,
  onCapoChange,
  onTuningChange,
}) => {
  const filteredTunings = tunings.filter((t) => t.instrument === instrument);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
      {/* Tuning Picker */}
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold text-slate-400">Tuning:</span>
        <select
          value={selectedTuning.id}
          onChange={(e) => {
            const found = tunings.find((t) => t.id === e.target.value);
            if (found) onTuningChange(found);
          }}
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-amber-500"
        >
          {filteredTunings.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Capo Selector */}
      <div className="flex items-center gap-2">
        <Bookmark className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-semibold text-slate-400">Capo:</span>
        <select
          value={capoFret}
          onChange={(e) => onCapoChange(parseInt(e.target.value, 10))}
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 font-medium outline-none focus:border-amber-500"
        >
          <option value={0}>No Capo</option>
          {[1, 2, 3, 4, 5, 6, 7].map((f) => (
            <option key={f} value={f}>
              Fret {f}
            </option>
          ))}
        </select>
      </div>

      {/* Orientation and Lefty toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOrientationToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            orientation === 'vertical'
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Toggle Horizontal Studio / Vertical Box layout"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{orientation === 'horizontal' ? 'Vertical Box' : 'Horizontal'}</span>
        </button>

        <button
          onClick={onLeftyToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
            isLefty
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title="Mirror fretboard for left-handed players"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{isLefty ? 'Lefty (On)' : 'Lefty'}</span>
        </button>
      </div>
    </div>
  );
};
