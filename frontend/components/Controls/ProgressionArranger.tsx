'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InstrumentType, ChordFingering, Tuning } from '@/lib/types';
import { audioStrummer, fretToFrequency } from '@/lib/audio/StrummerEngine';
import { fetchChords } from '@/lib/api';
import {
  Play,
  Square,
  Repeat,
  Plus,
  Trash2,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Music,
  Disc3,
} from 'lucide-react';

export type StrumPatternId = 'down-4' | 'folk-pop' | 'arpeggio' | 'waltz' | 'reggae';

interface StrumPattern {
  id: StrumPatternId;
  name: string;
  description: string;
  beatsPerChord: number;
}

const STRUM_PATTERNS: StrumPattern[] = [
  { id: 'down-4', name: 'Straight 4/4', description: 'Classic steady downstrums on every quarter note', beatsPerChord: 4 },
  { id: 'folk-pop', name: 'Folk / Pop (D-DU-UDU)', description: 'Universal acoustic campfire groove with syncopated upstrokes', beatsPerChord: 4 },
  { id: 'arpeggio', name: 'Ballad Arpeggio', description: 'Rolling fingerpicked sequence across the strings', beatsPerChord: 4 },
  { id: 'waltz', name: 'Waltz 3/4', description: 'Root bass note followed by two light treble strums', beatsPerChord: 3 },
  { id: 'reggae', name: 'Reggae / Ska Upbeat', description: 'Staccato upbeat chops on beats 2 and 4', beatsPerChord: 4 },
];

const PRESET_PROGRESSIONS: Array<{ name: string; chords: Array<[string, string]> }> = [
  { name: 'Pop Hits (I-V-vi-IV)', chords: [['C', 'maj'], ['G', 'maj'], ['A', 'min'], ['F', 'maj']] },
  { name: '50s Doo-Wop (I-vi-IV-V)', chords: [['C', 'maj'], ['A', 'min'], ['F', 'maj'], ['G', 'maj']] },
  { name: '12-Bar Blues in G', chords: [['G', '7'], ['C', '7'], ['G', '7'], ['D', '7']] },
  { name: 'Jazz ii-V-I-VI', chords: [['D', 'm7'], ['G', '7'], ['C', 'maj7'], ['A', '7']] },
  { name: 'Andalusian Flamenco', chords: [['A', 'min'], ['G', 'maj'], ['F', 'maj'], ['E', 'maj']] },
  { name: 'Emotional Ballad', chords: [['E', 'min'], ['C', 'maj'], ['G', 'maj'], ['D', 'maj']] },
];

interface ProgressionArrangerProps {
  instrument: InstrumentType;
  currentRoot: string;
  currentQuality: string;
  selectedTuning: Tuning;
  capoFret: number;
  onSelectChord: (root: string, quality: string) => void;
  onStringPluckVisual?: (strIdx: number) => void;
}

export const ProgressionArranger: React.FC<ProgressionArrangerProps> = ({
  instrument,
  currentRoot,
  currentQuality,
  selectedTuning,
  capoFret,
  onSelectChord,
  onStringPluckVisual,
}) => {
  const [chords, setChords] = useState<Array<[string, string]>>([
    ['C', 'maj'],
    ['G', 'maj'],
    ['A', 'min'],
    ['F', 'maj'],
  ]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [patternId, setPatternId] = useState<StrumPatternId>('folk-pop');
  const [bpm, setBpm] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  // Cached chord voicings for playback
  const voicingsCacheRef = useRef<Map<string, ChordFingering>>(new Map());
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  // Fetch voicing helper
  const getFingering = useCallback(async (r: string, q: string): Promise<ChordFingering> => {
    const key = `${instrument}-${r}-${q}`;
    if (voicingsCacheRef.current.has(key)) {
      return voicingsCacheRef.current.get(key)!;
    }
    const fetched = await fetchChords(instrument, r, q);
    const chosen = fetched && fetched.length > 0 ? fetched[0] : {
      chord_name: `${r}${q === 'maj' ? '' : q}`,
      instrument,
      root: r,
      quality: q,
      frets: instrument === 'guitar' ? [-1, 3, 2, 0, 1, 0] : [0, 0, 0, 3],
      base_fret: 1,
      voicing_index: 0,
    };
    voicingsCacheRef.current.set(key, chosen);
    return chosen;
  }, [instrument]);

  // Preload current progression voicings
  useEffect(() => {
    chords.forEach(([r, q]) => {
      getFingering(r, q);
    });
  }, [chords, getFingering]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stepRef.current = 0;
  }, []);

  const playChordWithPattern = useCallback(
    async (chordIndex: number, currentPattern: StrumPatternId) => {
      const [r, q] = chords[chordIndex] || ['C', 'maj'];
      onSelectChord(r, q);
      setActiveIndex(chordIndex);

      const fingering = await getFingering(r, q);
      const frequencies = fingering.frets.map((fret, strIdx) => {
        if (fret === -1) return 0;
        const base = selectedTuning.frequencies[strIdx] || 220;
        return fretToFrequency(base, fret + capoFret);
      });

      const beatDurationMs = (60 / bpm) * 1000;

      if (currentPattern === 'down-4') {
        // 4 straight downstrums
        for (let b = 0; b < 4; b++) {
          setTimeout(() => {
            audioStrummer.strumChord(frequencies, fingering.frets, 'down', 22);
          }, b * beatDurationMs);
        }
      } else if (currentPattern === 'folk-pop') {
        // D (beat 1), D-U (beat 2), -U (beat 3), D-U (beat 4)
        audioStrummer.strumChord(frequencies, fingering.frets, 'down', 20);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'down', 18), beatDurationMs);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 16), beatDurationMs * 1.5);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 16), beatDurationMs * 2.5);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'down', 18), beatDurationMs * 3);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 16), beatDurationMs * 3.5);
      } else if (currentPattern === 'arpeggio') {
        audioStrummer.arpeggiateChord(frequencies, fingering.frets, bpm);
      } else if (currentPattern === 'waltz') {
        // Root bass pluck on beat 1, treble strums on 2 and 3
        const activeIdx = fingering.frets.findIndex((f) => f !== -1);
        if (activeIdx !== -1) {
          audioStrummer.pluckString(frequencies[activeIdx], 0, true);
        }
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'down', 18), beatDurationMs);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 16), beatDurationMs * 2);
      } else if (currentPattern === 'reggae') {
        // Chops on 2 and 4
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 12), beatDurationMs);
        setTimeout(() => audioStrummer.strumChord(frequencies, fingering.frets, 'up', 12), beatDurationMs * 3);
      }
    },
    [chords, onSelectChord, getFingering, selectedTuning.frequencies, capoFret, bpm]
  );

  const startPlayback = useCallback(() => {
    if (chords.length === 0) return;
    setIsPlaying(true);

    const pattern = STRUM_PATTERNS.find((p) => p.id === patternId) || STRUM_PATTERNS[0];
    const measureDurationMs = (60 / bpm) * 1000 * pattern.beatsPerChord;

    stepRef.current = 0;
    playChordWithPattern(0, patternId);

    timerRef.current = window.setInterval(() => {
      stepRef.current += 1;
      if (stepRef.current >= chords.length) {
        if (!isLooping) {
          stopPlayback();
          return;
        }
        stepRef.current = 0;
      }
      playChordWithPattern(stepRef.current, patternId);
    }, measureDurationMs);
  }, [chords.length, patternId, bpm, isLooping, playChordWithPattern, stopPlayback]);

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const addCurrentChord = () => {
    setChords((prev) => {
      const next = [...prev, [currentRoot, currentQuality] as [string, string]];
      return next.length > 12 ? next.slice(-12) : next;
    });
  };

  const removeChord = (index: number) => {
    if (chords.length <= 1) return;
    setChords((prev) => prev.filter((_, i) => i !== index));
    if (activeIndex >= chords.length - 1) {
      setActiveIndex(Math.max(0, chords.length - 2));
    }
  };

  const moveChord = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chords.length) return;

    setChords((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setActiveIndex(targetIndex);
  };

  const handleCopyChordPro = () => {
    const formatted = chords
      .map(([r, q]) => `[${r}${q === 'maj' ? '' : q}]`)
      .join(' ');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSheet = () => {
    const title = `ChordGrid Progression (${instrument.toUpperCase()})`;
    const dateStr = new Date().toLocaleDateString();
    const activePattern = STRUM_PATTERNS.find((p) => p.id === patternId)?.name || 'Standard';

    const measures = chords
      .map(([r, q]) => `| ${r}${q === 'maj' ? '' : q} `)
      .join('') + '|';

    const content = [
      `============================================================`,
      `  ${title}`,
      `  Generated on: ${dateStr}`,
      `============================================================`,
      ``,
      `Tuning:     ${selectedTuning.name} (${selectedTuning.notes.join(' ')})`,
      `Capo:       Fret ${capoFret}`,
      `Tempo:      ${bpm} BPM`,
      `Rhythm:     ${activePattern}`,
      ``,
      `CHORD PROGRESSION:`,
      `------------------------------------------------------------`,
      measures,
      ``,
      `CHORDPRO FORMAT:`,
      chords.map(([r, q]) => `[${r}${q === 'maj' ? '' : q}]`).join(' '),
      ``,
      `Practice notes: Play through in continuous loop with steady meter.`,
      `============================================================`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chordgrid-progression-${chords.map(([r, q]) => r + q).join('-')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-studio-panel">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Progression Arranger &amp; Rhythm Strummer
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50">
                Auto Player
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Build custom song loops, play realistic acoustic strumming patterns, and export chord sheets
            </p>
          </div>
        </div>

        {/* Playback & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
              isLooping
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={isLooping ? 'Looping enabled' : 'Play once'}
          >
            <Repeat className="h-3.5 w-3.5" />
            <span>Loop</span>
          </button>

          <button
            onClick={togglePlayback}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-900/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop Strummer</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Play Progression</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pattern & Tempo Toolbar */}
      <div className="my-3 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-400">Rhythm Pattern:</span>
          <select
            value={patternId}
            onChange={(e) => {
              const newId = e.target.value as StrumPatternId;
              setPatternId(newId);
              if (isPlaying) {
                stopPlayback();
              }
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-medium text-slate-200 outline-none focus:border-amber-500"
          >
            {STRUM_PATTERNS.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Tempo:</span>
            <input
              type="range"
              min="50"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-24 cursor-pointer accent-amber-500"
            />
            <span className="font-mono font-bold text-amber-400">{bpm} BPM</span>
          </div>

          <button
            onClick={addCurrentChord}
            className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 font-bold text-slate-200 border border-slate-700 transition"
          >
            <Plus className="h-3.5 w-3.5 text-amber-400" />
            <span>Add {currentRoot}{currentQuality === 'maj' ? '' : currentQuality}</span>
          </button>
        </div>
      </div>

      {/* Interactive Chord Sequence Measures */}
      <div className="my-4 flex flex-wrap items-center gap-2.5">
        {chords.map(([r, q], idx) => {
          const isActive = activeIndex === idx;
          const label = `${r}${q === 'maj' ? '' : q}`;

          return (
            <div
              key={`${r}-${q}-${idx}`}
              className={`group relative flex flex-col items-center justify-between rounded-xl border p-2.5 min-w-[76px] transition-all duration-150 ${
                isActive
                  ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-105'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              }`}
            >
              {/* Measure index badge */}
              <span className="text-[10px] font-mono text-slate-500 font-bold mb-1">
                Bar {idx + 1}
              </span>

              {/* Chord Button */}
              <button
                onClick={() => {
                  setActiveIndex(idx);
                  onSelectChord(r, q);
                }}
                className={`text-sm font-black font-mono transition ${
                  isActive ? 'text-amber-400' : 'text-slate-200 hover:text-white'
                }`}
              >
                {label}
              </button>

              {/* Action Buttons (Hover or active) */}
              <div className="mt-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveChord(idx, 'left')}
                  disabled={idx === 0}
                  className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 flex items-center justify-center text-[10px]"
                  title="Move left"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>

                <button
                  onClick={() => removeChord(idx)}
                  className="h-5 w-5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 flex items-center justify-center text-[10px]"
                  title="Remove chord"
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </button>

                <button
                  onClick={() => moveChord(idx, 'right')}
                  disabled={idx === chords.length - 1}
                  className="h-5 w-5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400 flex items-center justify-center text-[10px]"
                  title="Move right"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preset Progressions & Export Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Disc3 className="h-3.5 w-3.5 text-amber-500" /> Presets:
          </span>
          {PRESET_PROGRESSIONS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setChords(preset.chords);
                setActiveIndex(0);
                const [firstR, firstQ] = preset.chords[0];
                onSelectChord(firstR, firstQ);
                if (isPlaying) stopPlayback();
              }}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-300 transition"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyChordPro}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 transition hover:bg-slate-700"
            title="Copy [C] [G] [Am] [F] format to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy ChordPro'}</span>
          </button>

          <button
            onClick={handleDownloadSheet}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 transition hover:bg-slate-700"
            title="Download song progression sheet as .txt"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Download Chart (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
