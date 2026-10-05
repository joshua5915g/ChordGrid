'use client';

import React from 'react';
import { SCALES, ScaleOverlayMode, CHROMATIC_NOTES } from '@/lib/scales';
import { Sparkles, Layers, Info } from 'lucide-react';

interface ScaleExplorerProps {
  scaleRoot: string;
  scaleId: string;
  scaleMode: ScaleOverlayMode;
  onScaleRootChange: (root: string) => void;
  onScaleIdChange: (scaleId: string) => void;
  onScaleModeChange: (mode: ScaleOverlayMode) => void;
}

export const ScaleExplorer: React.FC<ScaleExplorerProps> = ({
  scaleRoot,
  scaleId,
  scaleMode,
  onScaleRootChange,
  onScaleIdChange,
  onScaleModeChange,
}) => {
  const currentScale = SCALES.find((s) => s.id === scaleId) || SCALES[0];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-studio-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Scale &amp; Mode Explorer
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                Interactive Neck
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Overlay scale degrees and soloing notes across the fretboard
            </p>
          </div>
        </div>

        {/* Mode Toggle Pills */}
        <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
          {(
            [
              { id: 'off', label: 'Off' },
              { id: 'notes', label: 'Notes' },
              { id: 'degrees', label: 'Degrees' },
              { id: 'chord-tones', label: 'Chord Tones' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onScaleModeChange(mode.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                scaleMode === mode.id
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {scaleMode !== 'off' && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scale Root Picker */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">Key:</span>
              <select
                value={scaleRoot}
                onChange={(e) => onScaleRootChange(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-bold text-amber-400 outline-none focus:border-amber-500"
              >
                {CHROMATIC_NOTES.map((note) => (
                  <option key={note} value={note}>
                    {note}
                  </option>
                ))}
              </select>
            </div>

            {/* Scale Pattern Picker */}
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-400">Scale:</span>
              <select
                value={scaleId}
                onChange={(e) => onScaleIdChange(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-medium text-slate-200 outline-none focus:border-amber-500"
              >
                {SCALES.map((scale) => (
                  <option key={scale.id} value={scale.id}>
                    {scale.name} ({scale.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scale info badge */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-950/90 px-3 py-1.5 border border-slate-800 text-slate-300">
            <Info className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="truncate max-w-xs text-[11px] text-slate-400">
              <strong className="text-slate-200">{scaleRoot} {currentScale.name}:</strong>{' '}
              {currentScale.description}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
