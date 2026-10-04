'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioStrummer } from '@/lib/audio/StrummerEngine';

interface AudioToolbarProps {
  frequencies: number[];
  frets: number[];
  onPlayString?: (strIdx: number) => void;
}

export const AudioToolbar: React.FC<AudioToolbarProps> = ({ frequencies, frets, onPlayString }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [speedMs, setSpeedMs] = useState(24);

  const handleStrum = (dir: 'down' | 'up') => {
    setIsPlaying(true);
    audioStrummer.strumChord(frequencies, frets, dir, speedMs);

    // Trigger visual string vibration sequentially
    const order = dir === 'down' ? frequencies.map((_, i) => i) : frequencies.map((_, i) => i).reverse();
    order.forEach((idx, i) => {
      if (frets[idx] !== -1 && onPlayString) {
        setTimeout(() => {
          onPlayString(idx);
        }, i * speedMs);
      }
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, frequencies.length * speedMs + 500);
  };

  const handleArpeggio = () => {
    setIsPlaying(true);
    audioStrummer.arpeggiateChord(frequencies, frets, 110);

    const activeIndices = frequencies.map((_, i) => i).filter((i) => frets[i] !== -1);
    const intervalMs = (60 / 110 / 2) * 1000;
    activeIndices.forEach((idx, i) => {
      if (onPlayString) {
        setTimeout(() => {
          onPlayString(idx);
        }, i * intervalMs);
      }
    });

    setTimeout(() => {
      setIsPlaying(false);
    }, activeIndices.length * intervalMs + 600);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioStrummer.setVolume(val);
  };

  const handleToggleMute = () => {
    const muted = audioStrummer.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-studio-panel">
      {/* Playback Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleStrum('down')}
          disabled={isPlaying}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-glow-amber transition-all active:scale-95 disabled:opacity-50"
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
          <span>Strum Down</span>
        </button>

        <button
          onClick={() => handleStrum('up')}
          disabled={isPlaying}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          <span>Strum Up</span>
        </button>

        <button
          onClick={handleArpeggio}
          disabled={isPlaying}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-sm border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Arpeggio</span>
        </button>
      </div>

      {/* Speed & Volume Controls */}
      <div className="flex items-center gap-6 text-xs text-slate-300">
        {/* Strum Speed Slider */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Speed:</span>
          <input
            type="range"
            min="12"
            max="60"
            value={speedMs}
            onChange={(e) => setSpeedMs(parseInt(e.target.value, 10))}
            className="w-20 accent-amber-500 cursor-pointer"
            title={`${speedMs}ms inter-string delay`}
          />
          <span className="font-mono text-amber-400">{speedMs}ms</span>
        </div>

        {/* Volume Slider & Mute */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-slate-200" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
