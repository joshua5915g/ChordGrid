'use client';

import React, { useMemo } from 'react';
import { ChordVoicing, FretMarker, InstrumentTuning } from '@/src/types/chord';

interface FretboardProps {
  tuning: InstrumentTuning;
  voicing: ChordVoicing;
  width?: number;
  height?: number;
  activeColor?: string;
  fretRange?: number;
}

export function buildFretboardGeometry(
  tuning: InstrumentTuning,
  width: number,
  height: number,
  fretRange = tuning.fretCount
) {
  const padding = { top: 20, right: 24, bottom: 20, left: 28 };
  const boardWidth = width - padding.left - padding.right;
  const boardHeight = height - padding.top - padding.bottom;
  const stringStep = boardHeight / Math.max(tuning.strings.length - 1, 1);
  const fretStep = boardWidth / fretRange;

  const stringYs = tuning.strings.map((_, index) => padding.top + index * stringStep);
  const fretXs = Array.from({ length: fretRange + 1 }, (_, index) => padding.left + index * fretStep);

  return { padding, boardWidth, boardHeight, stringStep, fretStep, stringYs, fretXs };
}

export function mapVoicingToMarkers(
  tuning: InstrumentTuning,
  voicing: ChordVoicing,
  width: number,
  height: number
): FretMarker[] {
  const { stringYs, fretStep, padding } = buildFretboardGeometry(tuning, width, height);

  return voicing.frets
    .map((fret, stringIndex) => {
      if (fret === -1) return null;

      const x = padding.left + fret * fretStep + fretStep / 2;
      const y = stringYs[stringIndex];

      return {
        fret,
        stringIndex,
        x,
        y,
        radius: fret === 0 ? 9 : 10,
      };
    })
    .filter((value): value is FretMarker => Boolean(value));
}

export const Fretboard: React.FC<FretboardProps> = ({
  tuning,
  voicing,
  width = 820,
  height = 260,
  activeColor = '#F59E0B',
  fretRange = 15,
}) => {
  const geometry = useMemo(
    () => buildFretboardGeometry(tuning, width, height, fretRange),
    [tuning, width, height, fretRange]
  );

  const markers = useMemo(
    () => mapVoicingToMarkers(tuning, voicing, width, height),
    [tuning, voicing, width, height]
  );

  const dotFretPositions = [3, 5, 7, 9, 12];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/90 p-3 shadow-[0_0_30px_rgba(15,23,42,0.35)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={`${voicing.label} fretboard`}>
        <defs>
          <linearGradient id="fretboard-surface" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="50%" stopColor="#172033" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <radialGradient id="active-note-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
            <stop offset="75%" stopColor={activeColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.7" />
          </radialGradient>
        </defs>

        <rect
          x={geometry.padding.left}
          y={geometry.padding.top}
          width={geometry.boardWidth}
          height={geometry.boardHeight}
          rx={8}
          fill="url(#fretboard-surface)"
          stroke="#334155"
          strokeWidth={1.5}
        />

        {geometry.fretXs.map((x, index) => {
          const isNut = index === 0;
          return (
            <line
              key={`fret-${index}`}
              x1={x}
              x2={x}
              y1={geometry.padding.top}
              y2={geometry.padding.top + geometry.boardHeight}
              stroke={isNut ? '#E2E8F0' : '#64748B'}
              strokeWidth={isNut ? 5 : 2}
              opacity={isNut ? 1 : 0.8}
            />
          );
        })}

        {geometry.stringYs.map((y, index) => (
          <line
            key={`string-${index}`}
            x1={geometry.padding.left}
            x2={geometry.padding.left + geometry.boardWidth}
            y1={y}
            y2={y}
            stroke="#94A3B8"
            strokeWidth={index === 0 ? 2.5 : 1.8}
            opacity={0.9}
          />
        ))}

        {dotFretPositions.map((fret) => {
          const x = geometry.padding.left + (fret * geometry.fretStep) + geometry.fretStep / 2;
          const centerY = geometry.padding.top + geometry.boardHeight / 2;

          return (
            <g key={`dot-${fret}`}>
              <circle cx={x} cy={centerY} r={5} fill="#CBD5E1" opacity={0.4} />
              <circle cx={x} cy={centerY} r={2.5} fill="#E2E8F0" opacity={0.6} />
            </g>
          );
        })}

        <g aria-label="active chord notes">
          {markers.map(({ x, y, radius, stringIndex, fret }) => (
            <g key={`${voicing.label}-${stringIndex}-${fret}`} className="transition-all duration-200 ease-out">
              <circle
                cx={x}
                cy={y}
                r={radius + 7}
                fill="url(#active-note-glow)"
                opacity={0.18}
              />
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={activeColor}
                stroke="#FEF3C7"
                strokeWidth={1.5}
                style={{ transition: 'all 180ms ease' }}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#0F172A"
                fontSize="11"
                fontWeight={700}
                fontFamily="monospace"
              >
                {fret > 9 ? fret : String(fret)}
              </text>
            </g>
          ))}
        </g>

        <text
          x={geometry.padding.left}
          y={geometry.padding.top - 8}
          fill="#E2E8F0"
          fontSize="12"
          fontWeight={600}
          fontFamily="monospace"
        >
          {voicing.label}
        </text>
      </svg>
    </div>
  );
};

export default Fretboard;
