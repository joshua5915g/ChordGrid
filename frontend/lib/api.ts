import { ChordFingering, Tuning, InstrumentType, IdentifyCandidate } from './types';
import { DEFAULT_TUNINGS, getClientChords } from './defaultChords';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchTunings(instrument?: InstrumentType): Promise<Tuning[]> {
  try {
    const url = instrument
      ? `${API_BASE_URL}/api/tunings?instrument=${instrument}`
      : `${API_BASE_URL}/api/tunings`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Offline client fallback
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
    // Zero-latency fallback
    return getClientChords(instrument, root, quality);
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
