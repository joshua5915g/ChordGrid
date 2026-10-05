'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { metronome, TimeSignature } from '@/lib/audio/MetronomeEngine';
import { Play, Square, Volume2, VolumeX, Activity, Minus, Plus } from 'lucide-react';

interface MetronomeStudioProps {
  onBpmChange?: (bpm: number) => void;
}

export const MetronomeStudio: React.FC<MetronomeStudioProps> = ({ onBpmChange }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(100);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [tapFeedback, setTapFeedback] = useState<boolean>(false);

  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const unsubscribe = metronome.subscribeBeat((beat) => {
      setCurrentBeat(beat);
    });
    return () => {
      unsubscribe();
      metronome.stop();
    };
  }, []);

  const handleTogglePlay = () => {
    const running = metronome.toggle();
    setIsPlaying(running);
  };

  const updateBpm = useCallback((nextBpm: number) => {
    const clamped = Math.max(30, Math.min(260, Math.round(nextBpm)));
    setBpm(clamped);
    metronome.setBpm(clamped);
    if (onBpmChange) onBpmChange(clamped);
  }, [onBpmChange]);

  const handleTimeSigChange = (sig: TimeSignature) => {
    setTimeSignature(sig);
    metronome.setTimeSignature(sig);
    setCurrentBeat(0);
  };

  const handleTapTempo = () => {
    const now = performance.now();
    setTapFeedback(true);
    setTimeout(() => setTapFeedback(false), 120);

    const taps = tapTimesRef.current;
    // Clear history if user paused longer than 2.5 seconds
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 5) {
      taps.shift();
    }

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      if (avgInterval > 0) {
        const calculatedBpm = 60000 / avgInterval;
        updateBpm(calculatedBpm);
      }
    }
  };

  const getTempoLabel = (val: number): string => {
    if (val < 60) return 'Largo (Slow)';
    if (val < 76) return 'Adagio (Slow & Stately)';
    if (val < 108) return 'Andante (Walking Pace)';
    if (val < 120) return 'Moderato (Moderate)';
    if (val < 168) return 'Allegro (Fast & Bright)';
    return 'Presto (Very Fast)';
  };

  const beatsCount = timeSignature === '4/4' ? 4 : timeSignature === '3/4' ? 3 : timeSignature === '2/4' ? 2 : 6;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-studio-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
            isPlaying ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-800 text-amber-400 border-slate-700'
          }`}>
            <Activity className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Precision Metronome
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                Web Audio
              </span>
            </h3>
            <p className="text-xs text-slate-400">{getTempoLabel(bpm)}</p>
          </div>
        </div>

        {/* Play / Stop Button */}
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/30'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Metronome</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Beats Display */}
      <div className="my-3 flex items-center justify-center gap-2 py-1">
        {Array.from({ length: beatsCount }).map((_, idx) => {
          const isCurrent = isPlaying && currentBeat === idx;
          const isAccent = idx === 0;

          return (
            <div
              key={idx}
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold transition-all duration-75 ${
                isCurrent
                  ? isAccent
                    ? 'scale-110 bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.8)]'
                    : 'scale-105 bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                  : 'bg-slate-950/70 text-slate-500 border border-slate-800'
              }`}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {/* Main Controls: BPM and Tap Tempo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* BPM Number and Quick Steps */}
        <div className="flex items-center justify-between md:justify-start gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
          <button
            onClick={() => updateBpm(bpm - 5)}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
            title="Minus 5 BPM"
          >
            -5
          </button>
          <button
            onClick={() => updateBpm(bpm - 1)}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
            title="Minus 1 BPM"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <div className="px-3 text-center min-w-[70px]">
            <span className="text-xl font-black text-amber-400 font-mono tracking-tight">{bpm}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 block -mt-1">BPM</span>
          </div>

          <button
            onClick={() => updateBpm(bpm + 1)}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs"
            title="Plus 1 BPM"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => updateBpm(bpm + 5)}
            className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs"
            title="Plus 5 BPM"
          >
            +5
          </button>
        </div>

        {/* BPM Slider & Time Signature */}
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="40"
            max="240"
            value={bpm}
            onChange={(e) => updateBpm(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-500"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>40</span>
            <div className="flex gap-1">
              {(['4/4', '3/4', '2/4', '6/8'] as TimeSignature[]).map((sig) => (
                <button
                  key={sig}
                  onClick={() => handleTimeSigChange(sig)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                    timeSignature === sig ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sig}
                </button>
              ))}
            </div>
            <span>240</span>
          </div>
        </div>

        {/* Tap Tempo & Volume Control */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleTapTempo}
            className={`h-11 flex-1 md:flex-initial px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
              tapFeedback
                ? 'scale-95 bg-amber-400 text-slate-950 border-amber-300 shadow-glow-amber'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Tap Tempo
          </button>

          <button
            onClick={() => {
              const muted = metronome.toggleMute();
              setIsMuted(muted);
            }}
            className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </div>
  );
};
