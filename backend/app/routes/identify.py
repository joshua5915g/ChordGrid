from fastapi import APIRouter
from typing import List, Dict, Set
from ..models.chord import IdentifyRequest, IdentifyResponse, IdentifyCandidate, InstrumentType

router = APIRouter(prefix="/api/identify", tags=["identify"])

SEMITONES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

DEFAULT_OPEN_NOTES = {
    InstrumentType.GUITAR: ["E", "A", "D", "G", "B", "E"],
    InstrumentType.UKULELE: ["G", "C", "E", "A"]
}

CHORD_FORMULAS: Dict[str, Dict[str, Set[int]]] = {
    "maj": {0, 4, 7},
    "min": {0, 3, 7},
    "7": {0, 4, 7, 10},
    "maj7": {0, 4, 7, 11},
    "m7": {0, 3, 7, 10},
    "sus4": {0, 5, 7},
    "sus2": {0, 2, 7},
    "dim": {0, 3, 6},
    "aug": {0, 4, 8},
    "5": {0, 7}
}

@router.post("", response_model=IdentifyResponse)
async def identify_chord(req: IdentifyRequest):
    open_notes = req.tuning_notes or DEFAULT_OPEN_NOTES.get(req.instrument, [])
    if len(open_notes) != len(req.frets):
        open_notes = DEFAULT_OPEN_NOTES.get(req.instrument, [])

    played_notes: List[str] = []
    unique_note_indices: Set[int] = set()

    for string_idx, fret in enumerate(req.frets):
        if fret < 0:
            continue  # Muted string
        open_note = open_notes[string_idx % len(open_notes)].rstrip("0123456789")
        if open_note in SEMITONES:
            open_idx = SEMITONES.index(open_note)
            note_idx = (open_idx + fret) % 12
            note_name = SEMITONES[note_idx]
            played_notes.append(note_name)
            unique_note_indices.add(note_idx)

    candidates: List[IdentifyCandidate] = []

    if unique_note_indices:
        # Check against every root
        for root_idx, root_name in enumerate(SEMITONES):
            for quality, intervals in CHORD_FORMULAS.items():
                expected_indices = {(root_idx + iv) % 12 for iv in intervals}
                
                # Check overlap
                intersection = unique_note_indices.intersection(expected_indices)
                if not intersection:
                    continue

                precision = len(intersection) / len(unique_note_indices)
                recall = len(intersection) / len(expected_indices)
                confidence = round((precision * 0.6) + (recall * 0.4), 2)

                # Root bonus
                if root_idx in unique_note_indices:
                    confidence = min(1.0, confidence + 0.15)

                if confidence >= 0.65:
                    chord_name = f"{root_name}{quality if quality != 'maj' else ''}"
                    candidates.append(IdentifyCandidate(
                        chord_name=chord_name,
                        root=root_name,
                        quality=quality,
                        notes=[SEMITONES[i] for i in sorted(unique_note_indices)],
                        confidence=round(confidence, 2)
                    ))

        candidates.sort(key=lambda c: c.confidence, reverse=True)

    return IdentifyResponse(
        input_frets=req.frets,
        notes=played_notes,
        candidates=candidates[:5]
    )
