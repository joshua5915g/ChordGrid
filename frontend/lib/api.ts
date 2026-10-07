import { ChordFingering, Tuning, InstrumentType, IdentifyCandidate } from './types';
import { DEFAULT_TUNINGS, getClientChords } from './defaultChords';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface TuningProfile {
  id: string;
  instrument: InstrumentType;
  name: string;
  notes: string[];
  frequencies: number[];
  description?: string;
}

export interface SongbookPreset {
  id: string;
  name: string;
  instrument: InstrumentType;
  chords: string[];
  tempo_bpm?: number;
  notes?: string;
  created_at: string;
}

export interface SongbookPresetInput {
  name: string;
  instrument: InstrumentType;
  chords: string[];
  tempo_bpm?: number;
  notes?: string;
}

export async function fetchTunings(instrument?: InstrumentType): Promise<Tuning[]> {
  try {
    const url = instrument
      ? `${API_BASE_URL}/api/tunings?instrument=${instrument}`
      : `${API_BASE_URL}/api/tunings`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return instrument
      ? DEFAULT_TUNINGS.filter((t) => t.instrument === instrument)
      : DEFAULT_TUNINGS;
  }
}

export async function fetchChords(
  instrument: InstrumentType,
  root: string,
  quality: string
): Promise<ChordFingering[]> {
  try {
    const url = `${API_BASE_URL}/api/chords?instrument=${instrument}&root=${encodeURIComponent(root)}&quality=${encodeURIComponent(quality)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return getClientChords(instrument, root, quality);
  } catch {
    return getClientChords(instrument, root, quality);
  }
}

export async function fetchExtendedChords(
  instrument: InstrumentType,
  root?: string,
  quality?: string
): Promise<ChordFingering[]> {
  try {
    const params = new URLSearchParams({ instrument });
    if (root) params.set('root', root);
    if (quality) params.set('quality', quality);

    const res = await fetch(`${API_BASE_URL}/api/chords/extended?${params.toString()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : getClientChords(instrument, root || 'C', quality || 'maj');
  } catch {
    return getClientChords(instrument, root || 'C', quality || 'maj');
  }
}

export async function fetchAlternateTunings(
  instrument?: InstrumentType
): Promise<TuningProfile[]> {
  try {
    const path = instrument
      ? `${API_BASE_URL}/api/tunings/alternate/${instrument}`
      : `${API_BASE_URL}/api/tunings/alternate`;
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return DEFAULT_TUNINGS.map((tuning) => ({
      id: tuning.id,
      instrument: tuning.instrument,
      name: tuning.name,
      notes: tuning.notes,
      frequencies: tuning.frequencies,
      description: tuning.description,
    }));
  }
}

export async function fetchPresets(): Promise<SongbookPreset[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/presets`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createPreset(payload: SongbookPresetInput): Promise<SongbookPreset> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/presets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      id: `local-${Date.now()}`,
      name: payload.name,
      instrument: payload.instrument,
      chords: payload.chords,
      tempo_bpm: payload.tempo_bpm,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };
  }
}

export async function deletePreset(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/presets/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return { deleted: true, id };
  }
}

export async function identifyChord(
  instrument: InstrumentType,
  frets: number[],
  tuningNotes?: string[]
): Promise<IdentifyCandidate[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instrument,
        frets,
        tuning_notes: tuningNotes
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.candidates || [];
  } catch {
    return [];
  }
}
