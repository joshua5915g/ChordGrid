'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InstrumentType, ChordFingering, Tuning, IdentifyCandidate } from '@/lib/types';
import { DEFAULT_TUNINGS, ROOT_NOTES, CHORD_QUALITIES } from '@/lib/defaultChords';
import { fetchChords, fetchTunings, identifyChord } from '@/lib/api';
import { audioStrummer, fretToFrequency } from '@/lib/audio/StrummerEngine';

import { Header } from '@/components/UI/Header';
import { InstrumentToggle } from '@/components/Controls/InstrumentToggle';
import { ChordSelector } from '@/components/Controls/ChordSelector';
import { VoicingNavigator } from '@/components/Controls/VoicingNavigator';
import { FretboardOptions } from '@/components/Controls/FretboardOptions';
import { AudioToolbar } from '@/components/Audio/AudioToolbar';
import { ChordInspector } from '@/components/UI/ChordInspector';
import { SvgFretboard } from '@/components/Fretboard/SvgFretboard';
import { ScaleExplorer } from '@/components/Controls/ScaleExplorer';
import { ScaleOverlayMode } from '@/lib/scales';
import { MetronomeStudio } from '@/components/Audio/MetronomeStudio';

export default function Home() {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [root, setRoot] = useState<string>('C');
  const [quality, setQuality] = useState<string>('maj');
  const [scaleRoot, setScaleRoot] = useState<string>('C');
  const [scaleId, setScaleId] = useState<string>('major');
  const [scaleMode, setScaleMode] = useState<ScaleOverlayMode>('off');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [progression, setProgression] = useState<Array<[string, string]>>([
    ['C', 'maj'],
    ['G', 'maj'],
    ['A', 'min'],
    ['F', 'maj'],
  ]);
  const [progressionIndex, setProgressionIndex] = useState<number>(0);
  const [customTuningText, setCustomTuningText] = useState<string>('E A D G B E');
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

  useEffect(() => {
    const saved = window.localStorage.getItem('chordgrid-favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('chordgrid-favorites', JSON.stringify(favorites));
  }, [favorites]);

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

  const applyChordSelection = useCallback((nextRoot: string, nextQuality: string) => {
    setRoot(nextRoot);
    setQuality(nextQuality);
  }, []);

  const toggleFavorite = useCallback(() => {
    const key = `${root}-${quality}`;
    setFavorites((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }, [root, quality]);

  const searchResults = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return ROOT_NOTES.slice(0, 7);
    }

    return ROOT_NOTES.filter((note) => note.toLowerCase().includes(normalized));
  }, [searchTerm]);

  const favoriteChords = useMemo(
    () => favorites
      .map((entry) => {
        const [favoriteRoot, favoriteQuality] = entry.split('-');
        return { root: favoriteRoot, quality: favoriteQuality || 'maj' };
      })
      .filter((item) => item.root && item.quality),
    [favorites]
  );

  const progressionLabels = useMemo(
    () => progression.map(([progRoot, progQuality]) => `${progRoot}${progQuality === 'maj' ? '' : progQuality}`),
    [progression]
  );

  useEffect(() => {
    if (!practiceMode) return;

    const intervalId = window.setInterval(() => {
      setProgressionIndex((prev) => {
        const nextIndex = prev + 1 >= progression.length ? 0 : prev + 1;
        const [nextRoot, nextQuality] = progression[nextIndex] || progression[0];
        if (nextRoot && nextQuality) {
          setRoot(nextRoot);
          setQuality(nextQuality);
        }
        return nextIndex;
      });
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [practiceMode, progression]);

  const addToProgression = useCallback(() => {
    setProgression((prev) => {
      const next = [...prev, [root, quality] as [string, string]];
      return next.length > 8 ? next.slice(-8) : next;
    });
  }, [root, quality]);

  const applyCustomTuning = useCallback(() => {
    const notes = customTuningText
      .split(/[\s,]+/)
      .map((note) => note.trim())
      .filter(Boolean);

    if (notes.length === 0) return;

    const tuningId = `custom-${instrument}-${Date.now()}`;
    const customTuning: Tuning = {
      id: tuningId,
      instrument,
      name: `Custom ${instrument === 'guitar' ? 'Guitar' : 'Ukulele'} ${notes.join('-')}`,
      notes,
      frequencies: notes.map((note) => {
        const normalized = note.toUpperCase();
        const noteMap: Record<string, number> = {
          C: 261.63,
          'C#': 277.18,
          D: 293.66,
          'D#': 311.13,
          E: 329.63,
          F: 349.23,
          'F#': 369.99,
          G: 392.00,
          'G#': 415.30,
          A: 440.00,
          'A#': 466.16,
          B: 493.88,
        };
        return noteMap[normalized] || 220;
      }),
      description: 'User generated custom tuning.',
    };

    setTunings((prev) => [customTuning, ...prev.filter((t) => t.instrument !== instrument)]);
    setSelectedTuning(customTuning);
  }, [customTuningText, instrument]);

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

  const qualityOptions = CHORD_QUALITIES; // keep available for UI rendering if needed

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

        {/* Feature 1: Scale & Mode Explorer */}
        <ScaleExplorer
          scaleRoot={scaleRoot}
          scaleId={scaleId}
          scaleMode={scaleMode}
          onScaleRootChange={setScaleRoot}
          onScaleIdChange={setScaleId}
          onScaleModeChange={setScaleMode}
        />

        {/* Interactive SVG Fretboard Visualizer */}
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
            scaleRoot={scaleRoot}
            scaleId={scaleId}
            scaleMode={scaleMode}
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

        {/* Feature 2: Studio Audio Metronome */}
        <MetronomeStudio />

        {/* Chord Selector & Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-studio-panel">
            <div className="mb-4 flex items-center justify-between gap-2">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-400">Chord Search</label>
              <button
                onClick={toggleFavorite}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${favorites.includes(`${root}-${quality}`)
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-200'} transition-colors`}
              >
                {favorites.includes(`${root}-${quality}`) ? 'Saved' : 'Save Favorite'}
              </button>
            </div>

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search root note..."
              className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
            />

            <div className="mb-4 flex flex-wrap gap-2">
              {searchResults.map((note) => (
                <button
                  key={note}
                  onClick={() => applyChordSelection(note, quality)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${root === note ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  {note}
                </button>
              ))}
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {favoriteChords.length === 0 ? (
                <span className="text-xs text-slate-500">No saved favorites yet.</span>
              ) : (
                favoriteChords.slice(0, 6).map((favorite, index) => (
                  <button
                    key={`${favorite.root}-${favorite.quality}-${index}`}
                    onClick={() => applyChordSelection(favorite.root, favorite.quality)}
                    className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
                  >
                    {favorite.root}{favorite.quality === 'maj' ? '' : favorite.quality}
                  </button>
                ))
              )}
            </div>

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
                            setPracticeMode(false);
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

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Practice Mode</span>
                  <button
                    onClick={() => setPracticeMode((prev) => !prev)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      practiceMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {practiceMode ? 'Pause' : 'Start'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {progressionLabels.map((label, idx) => (
                    <button
                      key={`${label}-${idx}`}
                      onClick={() => {
                        setProgressionIndex(idx);
                        const [nextRoot, nextQuality] = progression[idx] || ['C', 'maj'];
                        setRoot(nextRoot);
                        setQuality(nextQuality);
                      }}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                        progressionIndex === idx ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={addToProgression}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200"
                  >
                    Add Current Chord
                  </button>
                  <button
                    onClick={() => {
                      setProgression([
                        ['C', 'maj'],
                        ['G', 'maj'],
                        ['A', 'min'],
                        ['F', 'maj'],
                      ]);
                      setProgressionIndex(0);
                      setPracticeMode(false);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Custom Tuning</span>
                  <button
                    onClick={applyCustomTuning}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Save
                  </button>
                </div>

                <input
                  value={customTuningText}
                  onChange={(event) => setCustomTuningText(event.target.value)}
                  placeholder="E A D G B E"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
                />

                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  {['E A D G B E', 'D A D G B E', 'G C E A', 'D A D F# A D'].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCustomTuningText(preset)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
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
