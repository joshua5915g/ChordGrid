'use client';

import React, { useMemo, useId } from 'react';
import { ChordFingering, Tuning } from '@/lib/types';
import { fretToFrequency } from '@/lib/audio/StrummerEngine';
import { ScaleOverlayMode, getScaleNotesAndDegrees, getFretNote, getChordNotes } from '@/lib/scales';

interface SvgFretboardProps {
  chord: ChordFingering;
  tuning: Tuning;
  orientation?: 'horizontal' | 'vertical';
  isLefty?: boolean;
  capoFret?: number;
  activeStringIndex?: number | null;
  onFretClick?: (stringIndex: number, fret: number) => void;
  onPluckNote?: (stringIndex: number, fret: number, freq: number) => void;
  scaleRoot?: string;
  scaleId?: string;
  scaleMode?: ScaleOverlayMode;
}

export const SvgFretboard: React.FC<SvgFretboardProps> = ({
  chord,
  tuning,
  orientation = 'horizontal',
  isLefty = false,
  capoFret = 0,
  activeStringIndex = null,
  onFretClick,
  onPluckNote,
  scaleRoot = 'C',
  scaleId = 'major',
  scaleMode = 'off',
}) => {
  const uid = useId().replace(/:/g, '');
  const numStrings = chord.instrument === 'guitar' ? 6 : 4;
  const numFrets = 15; // Realistic fret count

  // Calculate logarithmic fret x positions (0 to 1 scale)
  const fretPositions = useMemo(() => {
    const scaleLength = 1.0;
    const positions: number[] = [0];
    for (let f = 1; f <= numFrets; f++) {
      // Acoustic 12th root of 2 formula
      const dist = scaleLength * (1 - Math.pow(0.5, f / 12));
      positions.push(dist);
    }
    // Normalize to 0 .. 100% of board width
    const maxDist = positions[numFrets];
    return positions.map((p) => p / maxDist);
  }, [numFrets]);

  // Dimensions
  const isHorizontal = orientation === 'horizontal';
  const width = isHorizontal ? 820 : 340;
  const height = isHorizontal ? 260 : 640;

  const boardMargin = {
    top: isHorizontal ? 40 : 60,
    bottom: isHorizontal ? 40 : 40,
    left: isHorizontal ? 60 : 40,
    right: isHorizontal ? 30 : 40
  };

  const boardWidth = width - boardMargin.left - boardMargin.right;
  const boardHeight = height - boardMargin.top - boardMargin.bottom;

  // Inlay fret dots
  const singleDotFrets = [3, 5, 7, 9, 15];
  const doubleDotFret = 12;

  // String thicknesses
  const stringGauges = useMemo(() => {
    if (chord.instrument === 'guitar') {
      return [3.0, 2.5, 2.0, 1.6, 1.2, 0.9]; // E2 -> E4
    } else {
      // Ukulele: G, C, E, A
      return [1.8, 2.4, 1.8, 1.2];
    }
  }, [chord.instrument]);

  const strings = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < numStrings; i++) {
      list.push(i);
    }
    return isLefty ? [...list].reverse() : list;
  }, [numStrings, isLefty]);

  // Helper coordinate getters
  const getStringY = (index: number) => {
    return boardMargin.top + (index * boardHeight) / (numStrings - 1);
  };

  const getFretX = (fretNum: number) => {
    if (fretNum === 0) return boardMargin.left;
    const ratio = fretPositions[fretNum];
    if (isLefty) {
      return boardMargin.left + boardWidth - ratio * boardWidth;
    }
    return boardMargin.left + ratio * boardWidth;
  };

  // Center between fret n-1 and fret n
  const getFretCenterX = (fretNum: number) => {
    if (fretNum === 0) return boardMargin.left;
    const xPrev = getFretX(fretNum - 1);
    const xCurr = getFretX(fretNum);
    return (xPrev + xCurr) / 2;
  };

  // Vertical orientation coordinate helpers
  const getVerticalStringX = (index: number) => {
    return boardMargin.left + (index * boardWidth) / (numStrings - 1);
  };

  const getVerticalFretY = (fretNum: number) => {
    if (fretNum === 0) return boardMargin.top;
    const ratio = fretPositions[fretNum];
    return boardMargin.top + ratio * boardHeight;
  };

  const getVerticalFretCenterY = (fretNum: number) => {
    if (fretNum === 0) return boardMargin.top;
    const yPrev = getVerticalFretY(fretNum - 1);
    const yCurr = getVerticalFretY(fretNum);
    return (yPrev + yCurr) / 2;
  };

  const handlePluck = (stringIdx: number, fret: number) => {
    if (fret === -1) return;
    const baseFreq = tuning.frequencies[stringIdx] || 220;
    const freq = fretToFrequency(baseFreq, fret + capoFret);
    if (onPluckNote) {
      onPluckNote(stringIdx, fret, freq);
    }
  };

  const scaleMap = useMemo(() => {
    if (scaleMode === 'off') return new Map<string, string>();
    return getScaleNotesAndDegrees(scaleRoot, scaleId);
  }, [scaleRoot, scaleId, scaleMode]);

  const chordNotes = useMemo(() => {
    return getChordNotes(chord.root, chord.quality);
  }, [chord.root, chord.quality]);

  const scaleMarkers = useMemo(() => {
    if (scaleMode === 'off') return [];
    const list: Array<{
      stringIndex: number;
      fret: number;
      note: string;
      degree: string;
      isRoot: boolean;
      isChordTone: boolean;
      isFrettedByChord: boolean;
    }> = [];

    strings.forEach((strIdx) => {
      const openNote = tuning.notes[strIdx] || 'E';
      for (let f = 1; f <= numFrets; f++) {
        const note = getFretNote(openNote, f + capoFret);
        if (scaleMap.has(note)) {
          list.push({
            stringIndex: strIdx,
            fret: f,
            note,
            degree: scaleMap.get(note) || '',
            isRoot: note === scaleRoot,
            isChordTone: chordNotes.has(note),
            isFrettedByChord: chord.frets[strIdx] === f,
          });
        }
      }
    });

    return list;
  }, [scaleMode, strings, tuning.notes, numFrets, capoFret, scaleMap, scaleRoot, chordNotes, chord.frets]);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl bg-studio-card border border-slate-700/60 shadow-studio-panel p-4 select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto drop-shadow-xl"
        style={{ touchAction: 'manipulation' }}
      >
        <defs>
          <linearGradient id={`fretboardWood-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#141e2e" />
            <stop offset="100%" stopColor="#1c2738" />
          </linearGradient>

          <linearGradient id={`nutGradient-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <radialGradient id={`inlayDot-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.3" />
          </radialGradient>

          <filter id={`amberGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fretboard Wooden Base */}
        <rect
          x={boardMargin.left}
          y={boardMargin.top}
          width={boardWidth}
          height={boardHeight}
          rx="4"
          fill={`url(#fretboardWood-${uid})`}
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Fretboard Inlay Dots (Horizontal) */}
        {isHorizontal && (
          <g id="inlays">
            {singleDotFrets.map((fretNum) => (
              <circle
                key={`inlay-${fretNum}`}
                cx={getFretCenterX(fretNum)}
                cy={boardMargin.top + boardHeight / 2}
                r="5.5"
                fill={`url(#inlayDot-${uid})`}
                className="opacity-70 pointer-events-none"
              />
            ))}
            {/* 12th Fret Double Dots */}
            <circle
              cx={getFretCenterX(doubleDotFret)}
              cy={boardMargin.top + boardHeight * 0.3}
              r="5"
              fill={`url(#inlayDot-${uid})`}
              className="opacity-70 pointer-events-none"
            />
            <circle
              cx={getFretCenterX(doubleDotFret)}
              cy={boardMargin.top + boardHeight * 0.7}
              r="5"
              fill={`url(#inlayDot-${uid})`}
              className="opacity-70 pointer-events-none"
            />
          </g>
        )}

        {/* Fretboard Inlay Dots (Vertical) */}
        {!isHorizontal && (
          <g id="inlays-vert">
            {singleDotFrets.map((fretNum) => (
              <circle
                key={`inlay-v-${fretNum}`}
                cx={boardMargin.left + boardWidth / 2}
                cy={getVerticalFretCenterY(fretNum)}
                r="5.5"
              fill={`url(#inlayDot-${uid})`}
                className="opacity-70 pointer-events-none"
              />
            ))}
            <circle
              cx={boardMargin.left + boardWidth * 0.3}
              cy={getVerticalFretCenterY(doubleDotFret)}
              r="5"
              fill={`url(#inlayDot-${uid})`}
              className="opacity-70 pointer-events-none"
            />
            <circle
              cx={boardMargin.left + boardWidth * 0.7}
              cy={getVerticalFretCenterY(doubleDotFret)}
              r="5"
              fill={`url(#inlayDot-${uid})`}
              className="opacity-70 pointer-events-none"
            />
          </g>
        )}

        {/* Frets Lines */}
        {isHorizontal ? (
          <g id="frets-horizontal">
            {Array.from({ length: numFrets + 1 }).map((_, f) => {
              const x = getFretX(f);
              const isNut = f === 0;
              return (
                <g key={`fret-${f}`}>
                  <line
                    x1={x}
                    y1={boardMargin.top}
                    x2={x}
                    y2={boardMargin.top + boardHeight}
                    stroke={isNut ? `url(#nutGradient-${uid})` : '#64748b'}
                    strokeWidth={isNut ? 6 : 2}
                    strokeLinecap="round"
                  />
                  {f > 0 && (
                    <text
                      x={getFretCenterX(f)}
                      y={boardMargin.top + boardHeight + 20}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {f}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ) : (
          <g id="frets-vertical">
            {Array.from({ length: numFrets + 1 }).map((_, f) => {
              const y = getVerticalFretY(f);
              const isNut = f === 0;
              return (
                <g key={`fret-v-${f}`}>
                  <line
                    x1={boardMargin.left}
                    y1={y}
                    x2={boardMargin.left + boardWidth}
                    y2={y}
                    stroke={isNut ? `url(#nutGradient-${uid})` : '#64748b'}
                    strokeWidth={isNut ? 6 : 2}
                    strokeLinecap="round"
                  />
                  {f > 0 && (
                    <text
                      x={boardMargin.left - 18}
                      y={getVerticalFretCenterY(f) + 4}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {f}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Capo Indicator */}
        {capoFret > 0 && isHorizontal && (
          <rect
            x={getFretX(capoFret) - 6}
            y={boardMargin.top - 6}
            width="12"
            height={boardHeight + 12}
            rx="4"
            fill="#d97706"
            stroke="#fbbf24"
            strokeWidth="1.5"
            className="shadow-glow-amber opacity-95"
          />
        )}

        {/* Strings */}
        <g id="strings">
          {strings.map((strIdx) => {
            const gauge = stringGauges[strIdx] || 1.5;
            const fret = chord.frets[strIdx] ?? -1;
            const isVibrating = activeStringIndex === strIdx;

            if (isHorizontal) {
              const y = getStringY(strIdx);
              return (
                <g key={`string-${strIdx}`} className={isVibrating ? 'animate-vibrate' : ''}>
                  {/* Invisible broad hit-area for touch/click */}
                  <line
                    x1={boardMargin.left}
                    y1={y}
                    x2={boardMargin.left + boardWidth}
                    y2={y}
                    stroke="transparent"
                    strokeWidth="24"
                    className="cursor-pointer"
                    onClick={() => handlePluck(strIdx, fret)}
                  />
                  {/* Visible string line */}
                  <line
                    x1={boardMargin.left}
                    y1={y}
                    x2={boardMargin.left + boardWidth}
                    y2={y}
                    stroke={isVibrating ? '#fbbf24' : '#94a3b8'}
                    strokeWidth={gauge}
                    className="transition-colors duration-150 pointer-events-none"
                  />
                  {/* String tuning note label */}
                  <text
                    x={boardMargin.left - 24}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {tuning.notes[strIdx] || ''}
                  </text>
                </g>
              );
            } else {
              const x = getVerticalStringX(strIdx);
              return (
                <g key={`string-v-${strIdx}`} className={isVibrating ? 'animate-vibrate' : ''}>
                  <line
                    x1={x}
                    y1={boardMargin.top}
                    x2={x}
                    y2={boardMargin.top + boardHeight}
                    stroke="transparent"
                    strokeWidth="24"
                    className="cursor-pointer"
                    onClick={() => handlePluck(strIdx, fret)}
                  />
                  <line
                    x1={x}
                    y1={boardMargin.top}
                    x2={x}
                    y2={boardMargin.top + boardHeight}
                    stroke={isVibrating ? '#fbbf24' : '#94a3b8'}
                    strokeWidth={gauge}
                    className="transition-colors duration-150 pointer-events-none"
                  />
                  <text
                    x={x}
                    y={boardMargin.top - 20}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {tuning.notes[strIdx] || ''}
                  </text>
                </g>
              );
            }
          })}
        </g>

        {/* Nut Status Badges: Open (O) / Muted (X) */}
        <g id="nut-status">
          {strings.map((strIdx) => {
            const fret = chord.frets[strIdx] ?? -1;
            const isOpen = fret === 0;
            const isMuted = fret === -1;

            if (!isOpen && !isMuted) return null;

            const label = isOpen ? 'O' : 'X';
            const color = isOpen ? '#10b981' : '#ef4444';

            if (isHorizontal) {
              const y = getStringY(strIdx);
              return (
                <g
                  key={`nut-${strIdx}`}
                  className="cursor-pointer"
                  onClick={() => onFretClick && onFretClick(strIdx, isOpen ? -1 : 0)}
                >
                  <circle cx={boardMargin.left - 42} cy={y} r="10" fill="#0f172a" stroke={color} strokeWidth="1.5" />
                  <text
                    x={boardMargin.left - 42}
                    y={y + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                </g>
              );
            } else {
              const x = getVerticalStringX(strIdx);
              return (
                <g
                  key={`nut-v-${strIdx}`}
                  className="cursor-pointer"
                  onClick={() => onFretClick && onFretClick(strIdx, isOpen ? -1 : 0)}
                >
                  <circle cx={x} cy={boardMargin.top - 40} r="10" fill="#0f172a" stroke={color} strokeWidth="1.5" />
                  <text
                    x={x}
                    y={boardMargin.top - 36}
                    textAnchor="middle"
                    fill={color}
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {label}
                  </text>
                </g>
              );
            }
          })}
        </g>

        {/* Scale Overlay Markers */}
        {scaleMode !== 'off' && (
          <g id="scale-overlay-markers">
            {scaleMarkers.map((marker) => {
              if (marker.isFrettedByChord) return null;

              const isHoriz = isHorizontal;
              const cx = isHoriz ? getFretCenterX(marker.fret) : getVerticalStringX(marker.stringIndex);
              const cy = isHoriz ? getStringY(marker.stringIndex) : getVerticalFretCenterY(marker.fret);

              let fillColor = '#334155';
              let strokeColor = '#64748b';
              let textColor = '#e2e8f0';

              if (marker.isRoot) {
                fillColor = '#0891b2'; // cyan-600 root
                strokeColor = '#38bdf8';
                textColor = '#ffffff';
              } else if (scaleMode === 'chord-tones' && marker.isChordTone) {
                fillColor = '#059669'; // emerald chord tone
                strokeColor = '#34d399';
                textColor = '#ffffff';
              }

              const displayLabel = scaleMode === 'degrees' ? marker.degree : marker.note;

              return (
                <g
                  key={`scale-${marker.stringIndex}-${marker.fret}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => handlePluck(marker.stringIndex, marker.fret)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8.5"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="1.2"
                    opacity={marker.isRoot || (scaleMode === 'chord-tones' && marker.isChordTone) ? 0.95 : 0.75}
                  />
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {displayLabel}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Active Note Markers (Amber Dots with Finger Numbers) */}
        <g id="active-markers">
          {strings.map((strIdx) => {
            const fret = chord.frets[strIdx] ?? -1;
            if (fret <= 0) return null; // Only render dots on fretted notes

            const finger = chord.fingers ? chord.fingers[strIdx] : 0;
            const fingerText = finger && finger > 0 ? `${finger}` : '';

            if (isHorizontal) {
              const cx = getFretCenterX(fret);
              const cy = getStringY(strIdx);
              return (
                <g
                  key={`marker-${strIdx}`}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => handlePluck(strIdx, fret)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="#f59e0b"
                    filter={`url(#amberGlow-${uid})`}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {fingerText && (
                    <text
                      x={cx}
                      y={cy + 4.5}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {fingerText}
                    </text>
                  )}
                </g>
              );
            } else {
              const cx = getVerticalStringX(strIdx);
              const cy = getVerticalFretCenterY(fret);
              return (
                <g
                  key={`marker-v-${strIdx}`}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => handlePluck(strIdx, fret)}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="#f59e0b"
                    filter={`url(#amberGlow-${uid})`}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {fingerText && (
                    <text
                      x={cx}
                      y={cy + 4.5}
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {fingerText}
                    </text>
                  )}
                </g>
              );
            }
          })}
        </g>
      </svg>
    </div>
  );
};
