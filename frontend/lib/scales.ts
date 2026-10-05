export interface ScaleDefinition {
  id: string;
  name: string;
  category: 'Major / Minor' | 'Pentatonic & Blues' | 'Modes';
  intervals: number[]; // semitone offsets from root
  degrees: string[]; // degree labels, e.g. 1, b3, 4, b5, 5, b7
  description: string;
}

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const ENHARMONIC_MAP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'B#': 'C',
  'Cb': 'B',
  'E#': 'F',
  'Fb': 'E',
};

export function normalizeNote(note: string): string {
  if (!note) return 'C';
  const clean = note.trim();
  // If note has octave like E2, strip octave
  const withoutOctave = clean.replace(/[0-9]/g, '');
  return ENHARMONIC_MAP[withoutOctave] || withoutOctave;
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    category: 'Major / Minor',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    description: 'Bright, uplifting, the foundation of modern Western music harmony.',
  },
  {
    id: 'minor',
    name: 'Natural Minor (Aeolian)',
    category: 'Major / Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    description: 'Melancholic, emotive, widely used in rock, metal, pop, and classical.',
  },
  {
    id: 'pentatonic-minor',
    name: 'Minor Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    description: 'Essential soloing scale for rock, blues, and guitar improvisation.',
  },
  {
    id: 'pentatonic-major',
    name: 'Major Pentatonic',
    category: 'Pentatonic & Blues',
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    description: 'Sweet, soulful, popular in country, gospel, and classic R&B.',
  },
  {
    id: 'blues',
    name: 'Blues Scale',
    category: 'Pentatonic & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
    description: 'Adds the gritty diminished fifth "blue note" for expressive bends and riffs.',
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    description: 'Smooth minor mode with a raised 6th, famous in Santana and jazz funk.',
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    description: 'Major scale with flat 7th, ideal for dominant chords and Southern rock.',
  },
  {
    id: 'harmonic-minor',
    name: 'Harmonic Minor',
    category: 'Major / Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    description: 'Exotic Middle-Eastern and neoclassical sound with a dramatic leading tone.',
  },
];

export function getNoteIndex(note: string): number {
  const norm = normalizeNote(note);
  const idx = CHROMATIC_NOTES.indexOf(norm as typeof CHROMATIC_NOTES[number]);
  return idx === -1 ? 0 : idx;
}

export function getFretNote(openStringNote: string, fret: number): string {
  const baseIndex = getNoteIndex(openStringNote);
  const noteIndex = (baseIndex + fret) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

export function getScaleNotesAndDegrees(root: string, scaleId: string): Map<string, string> {
  const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const rootIndex = getNoteIndex(root);
  const result = new Map<string, string>(); // Note -> Degree (e.g. 'C' -> '1')

  scale.intervals.forEach((interval, idx) => {
    const note = CHROMATIC_NOTES[(rootIndex + interval) % 12];
    result.set(note, scale.degrees[idx]);
  });

  return result;
}

// Chord quality to semitone intervals
export const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '5': [0, 7],
  '9': [0, 4, 7, 10, 14],
  add9: [0, 4, 7, 14],
};

export function getChordNotes(root: string, quality: string): Set<string> {
  const rootIndex = getNoteIndex(root);
  const intervals = CHORD_INTERVALS[quality] || [0, 4, 7];
  const notes = new Set<string>();

  intervals.forEach((interval) => {
    const note = CHROMATIC_NOTES[(rootIndex + (interval % 12)) % 12];
    notes.add(note);
  });

  return notes;
}

export type ScaleOverlayMode = 'off' | 'notes' | 'degrees' | 'chord-tones';
