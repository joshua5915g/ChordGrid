from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
import json
from pathlib import Path
from ..models.chord import ChordFingering, ChordResponse, InstrumentType

router = APIRouter(prefix="/api/chords", tags=["chords"])

DATA_DIR = Path(__file__).parent.parent / "data"

def load_chords(instrument: InstrumentType) -> List[ChordFingering]:
    filename = "guitar_chords.json" if instrument == InstrumentType.GUITAR else "ukulele_chords.json"
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        return [ChordFingering(**item) for item in data]

# Semitone scale for transposition calculation
SEMITONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
ENHARMONIC_MAP = {"Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#"}

def normalize_note(note: str) -> str:
    note = note.strip()
    return ENHARMONIC_MAP.get(note, note)

@router.get("", response_model=List[ChordFingering])
async def get_chords(
    instrument: InstrumentType = Query(InstrumentType.GUITAR, description="Instrument type"),
    root: Optional[str] = Query(None, description="Root note (e.g. C, D#, F)"),
    quality: Optional[str] = Query(None, description="Chord quality (e.g. maj, min, 7)")
):
    all_chords = load_chords(instrument)
    results = all_chords

    if root:
        normalized_root = normalize_note(root)
        results = [c for c in results if normalize_note(c.root) == normalized_root]

    if quality:
        results = [c for c in results if c.quality.lower() == quality.lower()]

    # If no direct match in dataset, transpose from nearest root if available
    if not results and root and quality:
        results = generate_transposed_chords(all_chords, instrument, root, quality)

    return results

def generate_transposed_chords(all_chords: List[ChordFingering], instrument: InstrumentType, target_root: str, quality: str) -> List[ChordFingering]:
    target_norm = normalize_note(target_root)
    if target_norm not in SEMITONES:
        return []
    target_idx = SEMITONES.index(target_norm)

    # Find matching quality in other roots to barre/transpose
    transposed = []
    for chord in all_chords:
        if chord.quality.lower() == quality.lower():
            src_norm = normalize_note(chord.root)
            if src_norm in SEMITONES:
                src_idx = SEMITONES.index(src_norm)
                semitone_shift = (target_idx - src_idx) % 12
                if semitone_shift == 0:
                    continue
                # Shift non-muted, non-open frets or create a movable shape
                new_frets = []
                valid = True
                for f in chord.frets:
                    if f < 0:
                        new_frets.append(-1)
                    else:
                        shifted_fret = f + semitone_shift
                        if shifted_fret > 15:
                            valid = False
                            break
                        new_frets.append(shifted_fret)
                
                if valid:
                    base = max(1, min([f for f in new_frets if f > 0], default=1))
                    transposed.append(ChordFingering(
                        chord_name=f"{target_root}{quality if quality != 'maj' else ''}",
                        instrument=instrument,
                        root=target_root,
                        quality=quality,
                        frets=new_frets,
                        fingers=chord.fingers,
                        base_fret=base,
                        voicing_index=len(transposed)
                    ))
                if len(transposed) >= 2:
                    break
    return transposed

@router.get("/detail", response_model=ChordResponse)
async def get_chord_detail(
    instrument: InstrumentType = Query(InstrumentType.GUITAR),
    root: str = Query(..., description="Root note"),
    quality: str = Query("maj", description="Chord quality")
):
    chords = await get_chords(instrument=instrument, root=root, quality=quality)
    if not chords:
        raise HTTPException(status_code=404, detail=f"No voicings found for {root} {quality}")
    
    chord_name = f"{root}{quality if quality != 'maj' else ''}"
    return ChordResponse(
        chord_name=chord_name,
        instrument=instrument,
        root=root,
        quality=quality,
        voicings=chords
    )
