'use client';

import React from 'react';
import { ChordFingering, Tuning, IdentifyCandidate } from '@/lib/types';
import { Sparkles } from 'lucide-react';
import { fretToFrequency } from '@/lib/audio/StrummerEngine';

interface ChordInspectorProps {
  chord: ChordFingering;
  tuning: Tuning;
  capoFret: number;
  identifiedCandidates?: IdentifyCandidate[];
  onSelectCandidate?: (candidate: IdentifyCandidate) => void;
  onPluckString?: (strIdx: number, fret: number, freq: number) => void;
}

export const ChordInspector: React.FC<ChordInspectorProps> = ({
  chord,
  tuning,
  capoFret,
  identifiedCandidates = [],
  onSelectCandidate,
  onPluckString,
}) => {
  const numStrings = chord.instrument === 'guitar' ? 6 : 4;

  return (
    <div className="flex flex-col gap-4 p-5 bg-slate-900/70 rounded-2xl border border-slate-800 shadow-inner">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Chord</span>
          <h2 className="text-3xl font-black text-amber-400 tracking-tight flex items-baseline gap-2">
            <span>{chord.chord_name}</span>
            <span className="text-xs font-mono font-normal text-slate-400">
              (Root: {chord.root}, {chord.quality})
            </span>
          </h2>
        </div>

        {capoFret > 0 && (
          <div className="text-right">
            <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Capo Fret {capoFret}</span>
            <p className="text-[11px] text-slate-400">Pitches transposed +{capoFret} st</p>
          </div>
        )}
      </div>

      {/* String-by-string breakdown pill cards */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 block">
          String Pluck Inspector (Click to audition)
        </label>
        <div className={`grid gap-2 ${numStrings === 6 ? 'grid-cols-6' : 'grid-cols-4'}`}>
          {Array.from({ length: numStrings }).map((_, idx) => {
            const fret = chord.frets[idx] ?? -1;
            const openNote = tuning.notes[idx] || '';
            const baseFreq = tuning.frequencies[idx] || 220;
            const activeFreq = fret >= 0 ? fretToFrequency(baseFreq, fret + capoFret) : 0;
            const isMuted = fret === -1;
            const isOpen = fret === 0;

            return (
              <button
                key={`inspect-str-${idx}`}
                disabled={isMuted}
                onClick={() => onPluckString && onPluckString(idx, fret, activeFreq)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isMuted
                    ? 'bg-slate-900/60 border-slate-800/50 text-slate-600 opacity-60 cursor-not-allowed'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 hover:border-amber-500/50 text-white active:scale-95 shadow-sm'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400">Str {idx + 1}</div>
                <div className="text-base font-black my-0.5 text-amber-400 font-mono">
                  {isMuted ? 'X' : isOpen ? '0' : fret}
                </div>
                <div className="text-[11px] font-semibold text-slate-300">
                  {openNote}
                </div>
                {!isMuted && (
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    {Math.round(activeFreq)}Hz
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reverse Candidate Suggestions */}
      {identifiedCandidates.length > 0 && (
        <div className="mt-2 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harmonic Candidates Detected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {identifiedCandidates.map((c, i) => (
              <button
                key={`cand-${i}`}
                onClick={() => onSelectCandidate && onSelectCandidate(c)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-amber-500 transition-colors"
              >
                <span className="font-bold text-amber-400">{c.chord_name}</span>
                <span className="text-[10px] text-slate-400">({Math.round(c.confidence * 100)}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
