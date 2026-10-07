'use client';

import React, { useEffect, useState } from 'react';
import { Music4, Wifi, WifiOff, Github, Hand } from 'lucide-react';

interface HeaderProps {
  isBackendConnected: boolean;
  onOpenQuiz?: () => void;
  isLeftHanded?: boolean;
  onToggleLeftHanded?: () => void;
}

const LEFT_HANDED_STORAGE_KEY = 'chordgrid-left-handed';

export const Header: React.FC<HeaderProps> = ({
  isBackendConnected,
  onOpenQuiz,
  isLeftHanded,
  onToggleLeftHanded,
}) => {
  const [internalLeftHanded, setInternalLeftHanded] = useState<boolean>(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(LEFT_HANDED_STORAGE_KEY);
    if (saved !== null) {
      setInternalLeftHanded(saved === 'true');
    }
  }, []);

  const leftHanded = isLeftHanded ?? internalLeftHanded;

  useEffect(() => {
    window.localStorage.setItem(LEFT_HANDED_STORAGE_KEY, String(leftHanded));
  }, [leftHanded]);

  const handleToggleLeftHanded = () => {
    if (onToggleLeftHanded) {
      onToggleLeftHanded();
      return;
    }

    setInternalLeftHanded((prev) => !prev);
  };

  return (
    <header className="flex items-center justify-between py-4 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-glow-amber">
          <Music4 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>ChordGrid</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Studio Pro
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Interactive Ukulele & Guitar Fretboard Synthesizer
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleToggleLeftHanded}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
            leftHanded
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle left-handed fretboard"
        >
          <Hand className="w-3.5 h-3.5" />
          <span>{leftHanded ? 'Left-Handed' : 'Right-Handed'}</span>
        </button>

        {onOpenQuiz && (
          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold shadow-glow-amber transition-all transform active:scale-95"
            title="Launch Chord Quiz & Ear Training Challenge"
          >
            <span>🏆 Quiz Mode</span>
          </button>
        )}

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isBackendConnected
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80'
              : 'bg-amber-950/60 text-amber-400 border-amber-800/80'
          }`}
          title={isBackendConnected ? 'Connected to FastAPI backend' : 'Running in local client offline fallback'}
        >
          {isBackendConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isBackendConnected ? 'Backend Live' : 'Client Mode'}</span>
        </div>

        <a
          href="https://github.com/joshua5915g/ChordGrid"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="GitHub Repository"
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </header>
  );
};
