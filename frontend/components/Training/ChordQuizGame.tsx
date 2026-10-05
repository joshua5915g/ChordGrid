'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { InstrumentType, ChordFingering, Tuning } from '@/lib/types';
import { audioStrummer, fretToFrequency } from '@/lib/audio/StrummerEngine';
import { fetchChords } from '@/lib/api';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Volume2,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Headphones,
} from 'lucide-react';

interface QuizChord {
  root: string;
  quality: string;
  label: string;
  frets: number[];
}

const BEGINNER_CHORDS: Array<{ root: string; quality: string }> = [
  { root: 'C', quality: 'maj' },
  { root: 'G', quality: 'maj' },
  { root: 'D', quality: 'maj' },
  { root: 'A', quality: 'maj' },
  { root: 'E', quality: 'maj' },
  { root: 'A', quality: 'min' },
  { root: 'E', quality: 'min' },
  { root: 'D', quality: 'min' },
];

const INTERMEDIATE_CHORDS: Array<{ root: string; quality: string }> = [
  ...BEGINNER_CHORDS,
  { root: 'C', quality: '7' },
  { root: 'G', quality: '7' },
  { root: 'D', quality: '7' },
  { root: 'E', quality: '7' },
  { root: 'A', quality: '7' },
  { root: 'A', quality: 'm7' },
  { root: 'D', quality: 'm7' },
  { root: 'C', quality: 'maj7' },
];

const ADVANCED_CHORDS: Array<{ root: string; quality: string }> = [
  ...INTERMEDIATE_CHORDS,
  { root: 'F', quality: 'maj7' },
  { root: 'D', quality: 'sus4' },
  { root: 'A', quality: 'sus2' },
  { root: 'B', quality: '7' },
  { root: 'F', quality: 'maj' },
  { root: 'B', quality: 'dim' },
];

type QuizMode = 'ear' | 'visual';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface ChordQuizGameProps {
  instrument: InstrumentType;
  selectedTuning: Tuning;
  capoFret: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChordQuizGame: React.FC<ChordQuizGameProps> = ({
  instrument,
  selectedTuning,
  capoFret,
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<QuizMode>('ear');
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [currentQuestion, setCurrentQuestion] = useState<{
    target: QuizChord;
    options: QuizChord[];
  } | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Audio feedback synthesizer for success / fail chimes
  const playFeedbackChime = (isSuccess: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (isSuccess) {
        // High cheery ascending notes: G5 -> C6
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(783.99, ctx.currentTime);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Low woodblock thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const playMysteryChordAudio = useCallback(
    (chord: QuizChord) => {
      setIsPlayingAudio(true);
      const frequencies = chord.frets.map((fret, strIdx) => {
        if (fret === -1) return 0;
        const base = selectedTuning.frequencies[strIdx] || 220;
        return fretToFrequency(base, fret + capoFret);
      });

      audioStrummer.strumChord(frequencies, chord.frets, 'down', 28);
      setTimeout(() => setIsPlayingAudio(false), 800);
    },
    [selectedTuning.frequencies, capoFret]
  );

  // Generate next question
  const generateQuestion = useCallback(async () => {
    setSelectedAnswer(null);

    const pool =
      difficulty === 'beginner'
        ? BEGINNER_CHORDS
        : difficulty === 'intermediate'
        ? INTERMEDIATE_CHORDS
        : ADVANCED_CHORDS;

    // Pick 1 target and 3 distractors
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const chosenRaw = shuffledPool.slice(0, 4);

    const fullChords: QuizChord[] = await Promise.all(
      chosenRaw.map(async ({ root, quality }) => {
        const data = await fetchChords(instrument, root, quality);
        const fingering = data && data.length > 0 ? data[0] : null;
        return {
          root,
          quality,
          label: `${root}${quality === 'maj' ? '' : quality}`,
          frets: fingering ? fingering.frets : instrument === 'guitar' ? [-1, 3, 2, 0, 1, 0] : [0, 0, 0, 3],
        };
      })
    );

    const targetChord = fullChords[0];
    const randomizedOptions = [...fullChords].sort(() => 0.5 - Math.random());

    setCurrentQuestion({
      target: targetChord,
      options: randomizedOptions,
    });

    if (mode === 'ear') {
      setTimeout(() => {
        playMysteryChordAudio(targetChord);
      }, 200);
    }
  }, [difficulty, instrument, mode, playMysteryChordAudio]);

  useEffect(() => {
    if (isOpen) {
      generateQuestion();
    }
  }, [isOpen, generateQuestion]);

  const handleAnswer = (optionLabel: string) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(optionLabel);
    setTotalQuestions((prev) => prev + 1);

    const isCorrect = optionLabel === currentQuestion.target.label;

    if (isCorrect) {
      playFeedbackChime(true);
      const nextStreak = streak + 1;
      setScore((prev) => prev + 10 + nextStreak * 2);
      setStreak(nextStreak);
      setCorrectCount((prev) => prev + 1);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }

      // Fire celebratory confetti on 3, 5, 10 streak milestones
      if (nextStreak === 3 || nextStreak === 5 || nextStreak === 10 || nextStreak % 5 === 0) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      }
    } else {
      playFeedbackChime(false);
      setStreak(0);
    }
  };

  const handleNext = () => {
    generateQuestion();
  };

  const handleResetGame = () => {
    setScore(0);
    setStreak(0);
    setTotalQuestions(0);
    setCorrectCount(0);
    generateQuestion();
  };

  if (!isOpen) return null;

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-6 text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-100 flex items-center gap-1.5">
                Chord Mastery Challenge
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  Game
                </span>
              </h2>
              <p className="text-xs text-slate-400">Train your ear and fretboard recognition skills</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Mode & Difficulty Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs">
          {/* Mode Switch */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => {
                setMode('ear');
                setSelectedAnswer(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
                mode === 'ear'
                  ? 'bg-amber-500 text-slate-950 shadow-glow-amber'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="h-3.5 w-3.5" />
              <span>Ear Training</span>
            </button>

            <button
              onClick={() => {
                setMode('visual');
                setSelectedAnswer(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all ${
                mode === 'visual'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Fretboard Reading</span>
            </button>
          </div>

          {/* Difficulty Switch */}
          <div className="flex items-center gap-1.5">
            {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  setSelectedAnswer(null);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                  difficulty === diff
                    ? 'bg-slate-700 text-slate-100 border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-xl bg-slate-950/50 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Score</span>
            <span className="text-base font-black text-amber-400 font-mono">{score}</span>
          </div>

          <div className="rounded-xl bg-slate-950/50 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center justify-center gap-0.5">
              <Flame className="h-3 w-3 text-orange-500" /> Streak
            </span>
            <span className="text-base font-black text-orange-400 font-mono">{streak}</span>
          </div>

          <div className="rounded-xl bg-slate-950/50 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Best</span>
            <span className="text-base font-black text-slate-300 font-mono">{bestStreak}</span>
          </div>

          <div className="rounded-xl bg-slate-950/50 p-2 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Accuracy</span>
            <span className="text-base font-black text-emerald-400 font-mono">{accuracy}%</span>
          </div>
        </div>

        {/* Question Area */}
        {currentQuestion && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-950/90 border border-slate-800 p-6 min-h-[170px] text-center">
            {mode === 'ear' ? (
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <Headphones className="h-4 w-4 text-amber-400" />
                  Listen carefully and identify the chord
                </span>

                <button
                  onClick={() => playMysteryChordAudio(currentQuestion.target)}
                  className={`flex items-center gap-2.5 rounded-2xl px-6 py-3 font-bold text-sm transition-all shadow-lg ${
                    isPlayingAudio
                      ? 'scale-105 bg-amber-400 text-slate-950 shadow-glow-amber'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-900/30'
                  }`}
                >
                  <Volume2 className={`h-5 w-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingAudio ? 'Playing Chord...' : 'Replay Chord Audio'}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  What chord is this finger shape?
                </span>

                {/* Mini SVG Fretboard Diagram */}
                <div className="w-full max-w-sm py-2">
                  <svg viewBox="0 0 320 90" className="w-full h-auto drop-shadow-md">
                    <rect x="20" y="10" width="280" height="70" rx="4" fill="#1e293b" stroke="#334155" />
                    {/* Frets */}
                    {[0, 1, 2, 3, 4, 5].map((f) => (
                      <line
                        key={`fret-${f}`}
                        x1={20 + f * 56}
                        y1="10"
                        x2={20 + f * 56}
                        y2="80"
                        stroke={f === 0 ? '#f8fafc' : '#64748b'}
                        strokeWidth={f === 0 ? 4 : 1.5}
                      />
                    ))}
                    {/* Strings */}
                    {currentQuestion.target.frets.map((_, sIdx) => {
                      const numStr = currentQuestion.target.frets.length;
                      const y = 15 + (sIdx * 60) / (numStr - 1);
                      return (
                        <line
                          key={`str-${sIdx}`}
                          x1="20"
                          y1={y}
                          x2="300"
                          y2={y}
                          stroke="#94a3b8"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                    {/* Dots */}
                    {currentQuestion.target.frets.map((fret, sIdx) => {
                      const numStr = currentQuestion.target.frets.length;
                      const y = 15 + (sIdx * 60) / (numStr - 1);
                      if (fret === -1) {
                        return (
                          <text key={`nut-${sIdx}`} x="10" y={y + 3.5} fill="#ef4444" fontSize="10" fontWeight="bold">
                            X
                          </text>
                        );
                      }
                      if (fret === 0) {
                        return (
                          <circle key={`nut-${sIdx}`} cx="10" cy={y} r="3.5" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        );
                      }
                      const cx = 20 + fret * 56 - 28;
                      return (
                        <circle
                          key={`dot-${sIdx}`}
                          cx={cx}
                          cy={y}
                          r="6.5"
                          fill="#f59e0b"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Multiple Choice Answers */}
        {currentQuestion && (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option.label;
              const isTarget = option.label === currentQuestion.target.label;

              let style = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700';

              if (selectedAnswer !== null) {
                if (isTarget) {
                  style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-black shadow-[0_0_12px_rgba(16,185,129,0.3)]';
                } else if (isSelected) {
                  style = 'bg-rose-500/20 text-rose-300 border-rose-500 font-black';
                } else {
                  style = 'opacity-40 border-slate-800 bg-slate-900 text-slate-400';
                }
              }

              return (
                <button
                  key={option.label}
                  onClick={() => handleAnswer(option.label)}
                  disabled={selectedAnswer !== null}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-base font-black font-mono transition-all duration-150 ${style}`}
                >
                  <span>{option.label}</span>
                  {selectedAnswer !== null && (
                    <span>
                      {isTarget ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={handleResetGame}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Stats</span>
          </button>

          {selectedAnswer !== null && (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-glow-amber transition"
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
