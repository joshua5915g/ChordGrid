import { ChordFingering, Tuning } from './types';

export const DEFAULT_TUNINGS: Tuning[] = [
  {
    id: 'guitar-standard',
    instrument: 'guitar',
    name: 'Standard (EADGBE)',
    notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    frequencies: [82.41, 110.00, 146.83, 196.00, 246.94, 329.63],
    description: 'Standard modern 6-string guitar tuning.'
  },
  {
    id: 'guitar-drop-d',
    instrument: 'guitar',
    name: 'Drop D (DADGBE)',
    notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    frequencies: [73.42, 110.00, 146.83, 196.00, 246.94, 329.63],
    description: 'Lowest E dropped to D.'
  },
  {
    id: 'ukulele-standard',
    instrument: 'ukulele',
    name: 'Standard High-G (GCEA)',
    notes: ['G4', 'C4', 'E4', 'A4'],
    frequencies: [392.00, 261.63, 329.63, 440.00],
    description: 'Standard re-entrant ukulele tuning.'
  },
  {
    id: 'ukulele-low-g',
    instrument: 'ukulele',
    name: 'Low-G Linear (GCEA)',
    notes: ['G3', 'C4', 'E4', 'A4'],
    frequencies: [196.00, 261.63, 329.63, 440.00],
    description: 'Linear low-G ukulele tuning.'
  }
];

export const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHORD_QUALITIES = [
  { id: 'maj', label: 'Major', suffix: '' },
  { id: 'min', label: 'Minor', suffix: 'm' },
  { id: '7', label: 'Dominant 7th', suffix: '7' },
  { id: 'maj7', label: 'Major 7th', suffix: 'maj7' },
  { id: 'm7', label: 'Minor 7th', suffix: 'm7' },
  { id: 'sus4', label: 'Suspended 4th', suffix: 'sus4' },
  { id: 'sus2', label: 'Suspended 2nd', suffix: 'sus2' },
  { id: 'dim', label: 'Diminished', suffix: 'dim' },
  { id: 'aug', label: 'Augmented', suffix: 'aug' },
  { id: '9', label: '9th', suffix: '9' }
];

export const FALLBACK_CHORDS: ChordFingering[] = [
  // Guitar C
  { chord_name: 'C', instrument: 'guitar', root: 'C', quality: 'maj', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'C', instrument: 'guitar', root: 'C', quality: 'maj', frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], base_fret: 8, barres: [8], voicing_index: 1 },
  { chord_name: 'Cm', instrument: 'guitar', root: 'C', quality: 'min', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], base_fret: 3, barres: [3], voicing_index: 0 },
  { chord_name: 'C7', instrument: 'guitar', root: 'C', quality: '7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Cmaj7', instrument: 'guitar', root: 'C', quality: 'maj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Cm7', instrument: 'guitar', root: 'C', quality: 'm7', frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], base_fret: 3, barres: [3], voicing_index: 0 },
  { chord_name: 'Csus4', instrument: 'guitar', root: 'C', quality: 'sus4', frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 2], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Csus2', instrument: 'guitar', root: 'C', quality: 'sus2', frets: [-1, 3, 0, 0, 1, 0], fingers: [0, 3, 0, 0, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Cdim', instrument: 'guitar', root: 'C', quality: 'dim', frets: [-1, 3, 4, 2, 4, -1], fingers: [0, 2, 3, 1, 4, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Caug', instrument: 'guitar', root: 'C', quality: 'aug', frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 3, 2, 1, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'C9', instrument: 'guitar', root: 'C', quality: '9', frets: [-1, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3], base_fret: 1, barres: [3], voicing_index: 0 },

  // Guitar D
  { chord_name: 'D', instrument: 'guitar', root: 'D', quality: 'maj', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], base_fret: 1, voicing_index: 0 },
  { chord_name: 'D', instrument: 'guitar', root: 'D', quality: 'maj', frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], base_fret: 5, barres: [5], voicing_index: 1 },
  { chord_name: 'Dm', instrument: 'guitar', root: 'D', quality: 'min', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'D7', instrument: 'guitar', root: 'D', quality: '7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Dmaj7', instrument: 'guitar', root: 'D', quality: 'maj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Dm7', instrument: 'guitar', root: 'D', quality: 'm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], base_fret: 1, barres: [1], voicing_index: 0 },
  { chord_name: 'Dsus4', instrument: 'guitar', root: 'D', quality: 'sus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Dsus2', instrument: 'guitar', root: 'D', quality: 'sus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], base_fret: 1, voicing_index: 0 },

  // Guitar E
  { chord_name: 'E', instrument: 'guitar', root: 'E', quality: 'maj', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Em', instrument: 'guitar', root: 'E', quality: 'min', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'E7', instrument: 'guitar', root: 'E', quality: '7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Emaj7', instrument: 'guitar', root: 'E', quality: 'maj7', frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Em7', instrument: 'guitar', root: 'E', quality: 'm7', frets: [0, 2, 2, 0, 3, 0], fingers: [0, 1, 2, 0, 3, 0], base_fret: 1, voicing_index: 0 },

  // Guitar F
  { chord_name: 'F', instrument: 'guitar', root: 'F', quality: 'maj', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], base_fret: 1, barres: [1], voicing_index: 0 },
  { chord_name: 'Fm', instrument: 'guitar', root: 'F', quality: 'min', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], base_fret: 1, barres: [1], voicing_index: 0 },
  { chord_name: 'F7', instrument: 'guitar', root: 'F', quality: '7', frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], base_fret: 1, barres: [1], voicing_index: 0 },
  { chord_name: 'Fmaj7', instrument: 'guitar', root: 'F', quality: 'maj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], base_fret: 1, voicing_index: 0 },

  // Guitar G
  { chord_name: 'G', instrument: 'guitar', root: 'G', quality: 'maj', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Gm', instrument: 'guitar', root: 'G', quality: 'min', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], base_fret: 3, barres: [3], voicing_index: 0 },
  { chord_name: 'G7', instrument: 'guitar', root: 'G', quality: '7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Gmaj7', instrument: 'guitar', root: 'G', quality: 'maj7', frets: [3, -1, 0, 0, 0, 2], fingers: [2, 0, 0, 0, 0, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Gsus4', instrument: 'guitar', root: 'G', quality: 'sus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], base_fret: 1, voicing_index: 0 },

  // Guitar A
  { chord_name: 'A', instrument: 'guitar', root: 'A', quality: 'maj', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Am', instrument: 'guitar', root: 'A', quality: 'min', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'A7', instrument: 'guitar', root: 'A', quality: '7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Amaj7', instrument: 'guitar', root: 'A', quality: 'maj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Am7', instrument: 'guitar', root: 'A', quality: 'm7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], base_fret: 1, voicing_index: 0 },

  // Guitar B
  { chord_name: 'B', instrument: 'guitar', root: 'B', quality: 'maj', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], base_fret: 2, barres: [2], voicing_index: 0 },
  { chord_name: 'Bm', instrument: 'guitar', root: 'B', quality: 'min', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], base_fret: 2, barres: [2], voicing_index: 0 },
  { chord_name: 'B7', instrument: 'guitar', root: 'B', quality: '7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], base_fret: 1, voicing_index: 0 },

  // Ukulele C
  { chord_name: 'C', instrument: 'ukulele', root: 'C', quality: 'maj', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'C', instrument: 'ukulele', root: 'C', quality: 'maj', frets: [5, 4, 3, 3], fingers: [3, 2, 1, 1], base_fret: 3, barres: [3], voicing_index: 1 },
  { chord_name: 'Cm', instrument: 'ukulele', root: 'C', quality: 'min', frets: [0, 3, 3, 3], fingers: [0, 1, 2, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'C7', instrument: 'ukulele', root: 'C', quality: '7', frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Cmaj7', instrument: 'ukulele', root: 'C', quality: 'maj7', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 2], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Cm7', instrument: 'ukulele', root: 'C', quality: 'm7', frets: [3, 3, 3, 3], fingers: [1, 1, 1, 1], base_fret: 3, barres: [3], voicing_index: 0 },
  { chord_name: 'Csus4', instrument: 'ukulele', root: 'C', quality: 'sus4', frets: [0, 0, 1, 3], fingers: [0, 0, 1, 3], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Csus2', instrument: 'ukulele', root: 'C', quality: 'sus2', frets: [0, 2, 3, 3], fingers: [0, 1, 2, 3], base_fret: 1, voicing_index: 0 },

  // Ukulele D
  { chord_name: 'D', instrument: 'ukulele', root: 'D', quality: 'maj', frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Dm', instrument: 'ukulele', root: 'D', quality: 'min', frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'D7', instrument: 'ukulele', root: 'D', quality: '7', frets: [2, 0, 2, 0], fingers: [2, 0, 3, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Dmaj7', instrument: 'ukulele', root: 'D', quality: 'maj7', frets: [2, 2, 2, 4], fingers: [1, 1, 1, 3], base_fret: 1, barres: [2], voicing_index: 0 },

  // Ukulele E
  { chord_name: 'E', instrument: 'ukulele', root: 'E', quality: 'maj', frets: [4, 4, 4, 2], fingers: [2, 3, 4, 1], base_fret: 2, voicing_index: 0 },
  { chord_name: 'Em', instrument: 'ukulele', root: 'E', quality: 'min', frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'E7', instrument: 'ukulele', root: 'E', quality: '7', frets: [1, 2, 0, 2], fingers: [1, 2, 0, 3], base_fret: 1, voicing_index: 0 },

  // Ukulele F
  { chord_name: 'F', instrument: 'ukulele', root: 'F', quality: 'maj', frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Fm', instrument: 'ukulele', root: 'F', quality: 'min', frets: [1, 0, 1, 3], fingers: [1, 0, 2, 4], base_fret: 1, voicing_index: 0 },
  { chord_name: 'F7', instrument: 'ukulele', root: 'F', quality: '7', frets: [2, 3, 1, 0], fingers: [2, 3, 1, 0], base_fret: 1, voicing_index: 0 },

  // Ukulele G
  { chord_name: 'G', instrument: 'ukulele', root: 'G', quality: 'maj', frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Gm', instrument: 'ukulele', root: 'G', quality: 'min', frets: [0, 2, 3, 1], fingers: [0, 2, 3, 1], base_fret: 1, voicing_index: 0 },
  { chord_name: 'G7', instrument: 'ukulele', root: 'G', quality: '7', frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3], base_fret: 1, voicing_index: 0 },

  // Ukulele A
  { chord_name: 'A', instrument: 'ukulele', root: 'A', quality: 'maj', frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'Am', instrument: 'ukulele', root: 'A', quality: 'min', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0], base_fret: 1, voicing_index: 0 },
  { chord_name: 'A7', instrument: 'ukulele', root: 'A', quality: '7', frets: [0, 1, 0, 0], fingers: [0, 1, 0, 0], base_fret: 1, voicing_index: 0 },

  // Ukulele B
  { chord_name: 'B', instrument: 'ukulele', root: 'B', quality: 'maj', frets: [4, 3, 2, 2], fingers: [3, 2, 1, 1], base_fret: 2, barres: [2], voicing_index: 0 },
  { chord_name: 'Bm', instrument: 'ukulele', root: 'B', quality: 'min', frets: [4, 2, 2, 2], fingers: [3, 1, 1, 1], base_fret: 2, barres: [2], voicing_index: 0 }
];

export function getClientChords(instrument: 'guitar' | 'ukulele', root: string, quality: string): ChordFingering[] {
  const matches = FALLBACK_CHORDS.filter(
    (c) => c.instrument === instrument && c.root === root && c.quality === quality
  );
  if (matches.length > 0) return matches;

  // Movable shape transposition fallback
  const semitones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const targetIdx = semitones.indexOf(root);
  if (targetIdx === -1) return [];

  const candidates = FALLBACK_CHORDS.filter((c) => c.instrument === instrument && c.quality === quality);
  const results: ChordFingering[] = [];

  for (const template of candidates) {
    const srcIdx = semitones.indexOf(template.root);
    if (srcIdx === -1) continue;
    const diff = (targetIdx - srcIdx + 12) % 12;
    if (diff === 0) continue;

    const shiftedFrets = template.frets.map((f) => (f < 0 ? -1 : f + diff));
    if (shiftedFrets.every((f) => f <= 15)) {
      const activeFrets = shiftedFrets.filter((f) => f > 0);
      const base = activeFrets.length > 0 ? Math.min(...activeFrets) : 1;
      results.push({
        chord_name: `${root}${quality === 'maj' ? '' : quality}`,
        instrument,
        root,
        quality,
        frets: shiftedFrets,
        fingers: template.fingers,
        base_fret: base,
        voicing_index: results.length
      });
      if (results.length >= 2) break;
    }
  }

  return results.length > 0 ? results : [
    {
      chord_name: `${root}${quality === 'maj' ? '' : quality}`,
      instrument,
      root,
      quality,
      frets: instrument === 'guitar' ? [-1, 0, 2, 2, 2, 0] : [0, 0, 0, 0],
      base_fret: 1,
      voicing_index: 0
    }
  ];
}
