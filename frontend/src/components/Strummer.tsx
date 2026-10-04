'use client';

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { audioEngine, StrumDirection } from '@/src/lib/audio';

interface StrummerProps {
  frequencies: number[];
  frets: number[];
  onStringPlay?: (stringIndex: number) => void;
}

export const Strummer: React.FC<StrummerProps> = ({ frequencies, frets, onStringPlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [speedMs, setSpeedMs] = useState(35);
  const [activeString, setActiveString] = useState<number | null>(null);

  const activeIndices = useMemo(
    () => frequencies.map((_, index) => index).filter((index) => frets[index] !== -1),
    [frequencies, frets]
  );

  const triggerStrum = (direction: StrumDirection) => {
    audioEngine.ensureStarted();
    audioEngine.strumChord(frequencies, { direction, speedMs });
    setIsPlaying(true);

    const ordered = direction === 'down' ? activeIndices : [...activeIndices].reverse();
    ordered.forEach((index, step) => {
      if (onStringPlay) {
        window.setTimeout(() => {
          onStringPlay(index);
          setActiveString(index);
          window.setTimeout(() => setActiveString((current) => (current === index ? null : current)), 180);
        }, step * speedMs);
      }
    });

    window.setTimeout(() => setIsPlaying(false), activeIndices.length * speedMs + 400);
  };

  const handleManualTrigger = (index: number) => {
    if (frets[index] === -1) return;
    audioEngine.ensureStarted();
    audioEngine.playNote(frequencies[index], {
      startDelay: 0,
      duration: 0.22,
      isBass: index < frequencies.length / 2,
      gain: 0.7,
    });
    setActiveString(index);
    window.setTimeout(() => setActiveString((current) => (current === index ? null : current)), 180);
    if (onStringPlay) onStringPlay(index);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-[0_0_30px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerStrum('down')}
            disabled={isPlaying}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.35)] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowDown className="h-4 w-4" />
            Strum Down
          </button>

          <button
            onClick={() => triggerStrum('up')}
            disabled={isPlaying}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowUp className="h-4 w-4" />
            Strum Up
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Speed</span>
          <input
            type="range"
            min={12}
            max={80}
            value={speedMs}
            onChange={(event) => setSpeedMs(Number(event.target.value))}
            className="accent-amber-500"
          />
          <span className="font-mono text-amber-400">{speedMs}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = audioEngine.toggleMute();
              setIsMuted(muted);
            }}
            className="rounded-lg bg-slate-800 p-2 text-slate-200 transition hover:bg-slate-700"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              audioEngine.setVolume(next);
            }}
            className="accent-amber-500"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {frequencies.map((frequency, index) => {
          const active = frets[index] !== -1;
          const isCurrent = activeString === index;

          return (
            <button
              key={`string-${index}`}
              onClick={() => handleManualTrigger(index)}
              disabled={!active || isPlaying}
              className={[
                'flex h-9 min-w-[3.25rem] items-center justify-center rounded-xl border px-2 text-xs font-bold transition',
                active
                  ? isCurrent
                    ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'border-slate-700 bg-slate-800 text-slate-100 hover:border-amber-500 hover:text-amber-300'
                  : 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600',
              ].join(' ')}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span>Studio acoustic playback</span>
      </div>
    </div>
  );
};

export default Strummer;
