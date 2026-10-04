'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InstrumentType, ChordFingering, Tuning, IdentifyCandidate } from '@/lib/types';
import { DEFAULT_TUNINGS } from '@/lib/defaultChords';
import { fetchChords, fetchTunings, identifyChord } from '@/lib/api';
import { audioStrummer, fretToFrequency } from '@/lib/audio/StrummerEngine';

import { Header } from '@/components/UI/Header';
import { InstrumentToggle } from '@/components/Controls/InstrumentToggle';
import { ChordSelector } from '@/components/Controls/ChordSelector';
import { VoicingNavigator } from '@/components/Controls/VoicingNavigator';
import { FretboardOptions } from '@/components/Controls/FretboardOptions';
import { SvgFretboard } from '@/components/Fretboard/SvgFretboard';
import { AudioToolbar } from '@/components/Audio/AudioToolbar';
import { ChordInspector } from '@/components/UI/ChordInspector';

export default function Home() {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [root, setRoot] = useState<string>('C');
  const [quality, setQuality] = useState<string>('maj');
  const [voicings, setVoicings] = useState<ChordFingering[]>([]);
  const [voicingIndex, setVoicingIndex] = useState<number>(0);

  const [tunings, setTunings] = useState<Tuning[]>(DEFAULT_TUNINGS);
  const [selectedTuning, setSelectedTuning] = useState<Tuning>(DEFAULT_TUNINGS[0]);

  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isLefty, setIsLefty] = useState<boolean>(false);
  const [capoFret, setCapoFret] = useState<number>(0);

  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [identifiedCandidates, setIdentifiedCandidates] = useState<IdentifyCandidate[]>([]);

  // Load tunings from backend on mount (instrument intentionally excluded —
  // the instrument-change effect below handles tuning selection after fetch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const fetched = await fetchTunings();
        if (fetched && fetched.length > 0 && isMounted) {
          setTunings(fetched);
          setIsBackendConnected(true);
        }
      } catch {
        if (isMounted) setIsBackendConnected(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, []);

  // Update selected tuning when instrument changes
  useEffect(() => {
    const defaultTuning = tunings.find((t) => t.instrument === instrument) || DEFAULT_TUNINGS[0];
    setSelectedTuning(defaultTuning);
  }, [instrument, tunings]);

  // Load chords whenever instrument, root, or quality changes
  useEffect(() => {
    let isMounted = true;
    async function loadChords() {
      const data = await fetchChords(instrument, root, quality);
      if (isMounted) {
        setVoicings(data);
        setVoicingIndex(0);
      }
    }
    loadChords();
    return () => {
      isMounted = false;
    };
  }, [instrument, root, quality]);

  // Current active fingering
  const currentChord: ChordFingering = useMemo(() => {
    if (voicings.length > 0 && voicings[voicingIndex]) {
      return voicings[voicingIndex];
    }
    return {
      chord_name: `${root}${quality === 'maj' ? '' : quality}`,
      instrument,
      root,
      quality,
      frets: instrument === 'guitar' ? [-1, 3, 2, 0, 1, 0] : [0, 0, 0, 3],
      base_fret: 1,
      voicing_index: 0
    };
  }, [voicings, voicingIndex, root, quality, instrument]);

  // Compute live frequencies based on tuning + capo
  const activeFrequencies = useMemo(() => {
    return currentChord.frets.map((fret, strIdx) => {
      if (fret === -1) return 0;
      const base = selectedTuning.frequencies[strIdx] || 220;
      return fretToFrequency(base, fret + capoFret);
    });
  }, [currentChord.frets, selectedTuning.frequencies, capoFret]);

  // Check reverse chord candidates
  useEffect(() => {
    let isMounted = true;
    async function checkCandidates() {
      const candidates = await identifyChord(
        instrument,
        currentChord.frets,
        selectedTuning.notes
      );
      if (isMounted) {
        setIdentifiedCandidates(candidates);
      }
    }
    checkCandidates();
    return () => {
      isMounted = false;
    };
  }, [instrument, currentChord.frets, selectedTuning.notes]);

  // Interactive plucking note handler
  const handlePluckNote = useCallback((strIdx: number, fret: number, freq: number) => {
    setActiveStringIndex(strIdx);
    const isBass = strIdx < currentChord.frets.length / 2;
    audioStrummer.pluckString(freq, 0, isBass);

    setTimeout(() => {
      setActiveStringIndex((prev) => (prev === strIdx ? null : prev));
    }, 250);
  }, [currentChord.frets.length]);

  // Interactive custom fret editing
  const handleFretClick = useCallback((stringIndex: number, newFret: number) => {
    setVoicings((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const target = { ...updated[voicingIndex] };
      const newFrets = [...target.frets];
      newFrets[stringIndex] = newFret;
      target.frets = newFrets;
      updated[voicingIndex] = target;
      return updated;
    });
  }, [voicingIndex]);

  // Common quick progression buttons
  const quickProgressions = [
    { name: 'Pop Progression (I-V-vi-IV in C)', chords: [['C', 'maj'], ['G', 'maj'], ['A', 'min'], ['F', 'maj']] },
    { name: 'Blues Turnaround (in G)', chords: [['G', '7'], ['C', '7'], ['G', '7'], ['D', '7']] },
    { name: 'Jazz 2-5-1 (in C)', chords: [['D', 'm7'], ['G', '7'], ['C', 'maj7']] }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header isBackendConnected={isBackendConnected} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Top Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <InstrumentToggle instrument={instrument} onChange={setInstrument} />

          <VoicingNavigator
            voicings={voicings}
            currentIndex={voicingIndex}
            onSelectIndex={setVoicingIndex}
          />
        </div>

        {/* Fretboard Control Options (Tuning, Capo, Orientation, Lefty) */}
        <FretboardOptions
          orientation={orientation}
          isLefty={isLefty}
          capoFret={capoFret}
          selectedTuning={selectedTuning}
          tunings={tunings}
          instrument={instrument}
          onOrientationToggle={() => setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')}
          onLeftyToggle={() => setIsLefty(!isLefty)}
          onCapoChange={setCapoFret}
          onTuningChange={setSelectedTuning}
        />

        {/* Dynamic SVG Fretboard Visualizer */}
        <div className="w-full flex justify-center py-2">
          <SvgFretboard
            chord={currentChord}
            tuning={selectedTuning}
            orientation={orientation}
            isLefty={isLefty}
            capoFret={capoFret}
            activeStringIndex={activeStringIndex}
            onFretClick={handleFretClick}
            onPluckNote={handlePluckNote}
          />
        </div>

        {/* Audio Strummer Toolbar */}
        <AudioToolbar
          frequencies={activeFrequencies}
          frets={currentChord.frets}
          onPlayString={(idx) => {
            setActiveStringIndex(idx);
            setTimeout(() => {
              setActiveStringIndex((prev) => (prev === idx ? null : prev));
            }, 250);
          }}
        />

        {/* Chord Selector & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-studio-panel">
            <ChordSelector
              root={root}
              quality={quality}
              onRootChange={setRoot}
              onQualityChange={setQuality}
            />

            {/* Quick Progression Presets */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2.5 block">
                Quick Chord Progressions
              </label>
              <div className="flex flex-col gap-2">
                {quickProgressions.map((prog) => (
                  <div key={prog.name} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium w-full sm:w-auto sm:min-w-[190px]">
                      {prog.name}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.chords.map(([r, q], chordIndex) => (
                        <button
                          key={`${prog.name}-${r}-${q}-${chordIndex}`}
                          onClick={() => {
                            setRoot(r);
                            setQuality(q);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            root === r && quality === q
                              ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          {r}{q === 'maj' ? '' : q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ChordInspector
            chord={currentChord}
            tuning={selectedTuning}
            capoFret={capoFret}
            identifiedCandidates={identifiedCandidates}
            onSelectCandidate={(cand) => {
              setRoot(cand.root);
              setQuality(cand.quality);
            }}
            onPluckString={(idx, fret, freq) => {
              handlePluckNote(idx, fret, freq);
            }}
          />
        </div>
      </main>

      <footer className="mt-auto py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>ChordGrid Studio Acoustic &bull; Built with Next.js 15, React 19, Web Audio API &amp; FastAPI</p>
      </footer>
    </div>
  );
}
