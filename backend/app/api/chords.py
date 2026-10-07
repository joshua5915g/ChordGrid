from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from ..schemas.chord import ChordVoicing, TuningProfile

router = APIRouter(prefix="/api", tags=["extended-chords"])
DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _load_json_file(filename: str):
    file_path = DATA_DIR / filename
    if not file_path.exists():
        return []
    with file_path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _load_chords(instrument: Literal["guitar", "ukulele"]) -> list[ChordVoicing]:
    file_name = "guitar_chords.json" if instrument == "guitar" else "ukulele_chords.json"
    raw_data = _load_json_file(file_name)
    return [ChordVoicing(**item) for item in raw_data]


def _load_tunings() -> list[TuningProfile]:
    raw_data = _load_json_file("tunings.json")
    return [TuningProfile(**item) for item in raw_data]


@router.get("/chords/extended", response_model=list[ChordVoicing])
async def get_extended_chords(
    instrument: Literal["guitar", "ukulele"] = Query("guitar"),
    root: str | None = Query(None),
    quality: str | None = Query(None),
):
    chords = _load_chords(instrument)

    if root:
        chords = [chord for chord in chords if chord.root.lower() == root.lower()]
    if quality:
        chords = [chord for chord in chords if chord.quality.lower() == quality.lower()]

    return chords


@router.get("/chords/extended/{instrument}", response_model=list[ChordVoicing])
async def get_extended_chords_by_instrument(
    instrument: Literal["guitar", "ukulele"],
):
    return _load_chords(instrument)


@router.get("/tunings/alternate", response_model=list[TuningProfile])
async def get_alternate_tunings(
    instrument: Literal["guitar", "ukulele"] | None = Query(None),
):
    tunings = _load_tunings()
    if instrument:
        tunings = [item for item in tunings if item.instrument == instrument]
    return tunings


@router.get("/tunings/alternate/{instrument}", response_model=list[TuningProfile])
async def get_alternate_tunings_by_instrument(
    instrument: Literal["guitar", "ukulele"],
):
    tunings = _load_tunings()
    filtered = [item for item in tunings if item.instrument == instrument]
    if not filtered:
        raise HTTPException(status_code=404, detail=f"No alternate tunings found for {instrument}")
    return filtered
