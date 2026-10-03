export type InstrumentType = 'guitar' | 'ukulele';

export interface Tuning {
  id: string;
  instrument: InstrumentType;
  name: string;
  notes: string[];
  frequencies: number[];
  description?: string;
}

export interface ChordFingering {
  chord_name: string;
  instrument: InstrumentType;
  root: string;
  quality: string;
  frets: number[]; // -1 = muted, 0 = open, >0 = fret position
  fingers?: number[]; // 0 = none, 1 = index, 2 = middle, 3 = ring, 4 = pinky
  base_fret: number;
  barres?: number[];
  voicing_index: number;
  tuning_id?: string;
}

export interface IdentifyCandidate {
  chord_name: string;
  root: string;
  quality: string;
  notes: string[];
  confidence: number;
}
