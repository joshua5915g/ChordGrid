export type InstrumentName = 'ukulele' | 'guitar';
export type RootNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type ChordQuality = 'major' | 'minor' | '7';

export interface InstrumentTuning {
  id: InstrumentName;
  name: string;
  strings: string[];
  fretCount: number;
}

export interface ChordVoicing {
  root: RootNote;
  quality: ChordQuality;
  instrument: InstrumentName;
  frets: number[];
  label: string;
}

export interface FretMarker {
  fret: number;
  stringIndex: number;
  x: number;
  y: number;
  radius: number;
}
