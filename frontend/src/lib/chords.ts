import { ChordQuality, ChordVoicing, InstrumentName, InstrumentTuning, RootNote } from '@/src/types/chord';

export const INSTRUMENT_TUNINGS: Record<InstrumentName, InstrumentTuning> = {
  ukulele: {
    id: 'ukulele',
    name: 'Standard High-G',
    strings: ['G4', 'C4', 'E4', 'A4'],
    fretCount: 15,
  },
  guitar: {
    id: 'guitar',
    name: 'Standard EADGBE',
    strings: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    fretCount: 15,
  },
};

export const CHORD_LIBRARY: Record<
  InstrumentName,
  Record<RootNote, Record<ChordQuality, number[]>>
> = {
  ukulele: {
    C: {
      major: [0, 0, 0, 3],
      minor: [0, 3, 3, 3],
      7: [0, 0, 0, 1],
    },
    D: {
      major: [2, 2, 2, 0],
      minor: [2, 2, 1, 0],
      7: [2, 0, 2, 0],
    },
    E: {
      major: [4, 4, 4, 2],
      minor: [0, 4, 3, 2],
      7: [1, 2, 0, 2],
    },
    F: {
      major: [2, 0, 1, 0],
      minor: [1, 0, 1, 3],
      7: [2, 3, 1, 0],
    },
    G: {
      major: [0, 2, 3, 2],
      minor: [0, 2, 3, 1],
      7: [0, 2, 1, 2],
    },
    A: {
      major: [2, 1, 0, 0],
      minor: [2, 0, 0, 0],
      7: [0, 1, 0, 0],
    },
    B: {
      major: [4, 3, 2, 2],
      minor: [4, 2, 2, 2],
      7: [2, 1, 2, 0],
    },
  },
  guitar: {
    C: {
      major: [-1, 3, 2, 0, 1, 0],
      minor: [-1, 3, 5, 5, 4, 3],
      7: [-1, 3, 2, 3, 1, 0],
    },
    D: {
      major: [-1, -1, 0, 2, 3, 2],
      minor: [-1, -1, 0, 2, 3, 1],
      7: [-1, -1, 0, 2, 1, 2],
    },
    E: {
      major: [0, 2, 2, 1, 0, 0],
      minor: [0, 2, 2, 0, 0, 0],
      7: [0, 2, 0, 1, 0, 0],
    },
    F: {
      major: [1, 3, 3, 2, 1, 1],
      minor: [1, 3, 3, 1, 1, 1],
      7: [1, 3, 1, 2, 1, 1],
    },
    G: {
      major: [3, 2, 0, 0, 0, 3],
      minor: [3, 5, 5, 3, 3, 3],
      7: [3, 2, 0, 0, 0, 1],
    },
    A: {
      major: [-1, 0, 2, 2, 2, 0],
      minor: [-1, 0, 2, 2, 1, 0],
      7: [-1, 0, 2, 0, 2, 0],
    },
    B: {
      major: [-1, 2, 4, 4, 4, 2],
      minor: [-1, 2, 4, 4, 3, 2],
      7: [-1, 2, 1, 2, 0, 2],
    },
  },
};

export const ROOT_ORDER: RootNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export function getChordLabel(root: RootNote, quality: ChordQuality): string {
  if (quality === 'major') return root;
  if (quality === 'minor') return `${root}m`;
  return `${root}7`;
}

export function getChordVoicing(
  instrument: InstrumentName,
  root: RootNote,
  quality: ChordQuality
): ChordVoicing {
  const tuning = INSTRUMENT_TUNINGS[instrument];
  const frets = CHORD_LIBRARY[instrument]?.[root]?.[quality] ?? CHORD_LIBRARY[instrument].C[quality];

  return {
    root,
    quality,
    instrument,
    frets: frets.slice(0, tuning.strings.length),
    label: getChordLabel(root, quality),
  };
}

export function getAllChordVoicings(instrument: InstrumentName): ChordVoicing[] {
  return ROOT_ORDER.flatMap((root) =>
    (['major', 'minor', '7'] as ChordQuality[]).map((quality) => getChordVoicing(instrument, root, quality))
  );
}
