from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from ..schemas.chord import SongbookPreset, SongbookPresetCreate

router = APIRouter(prefix="/api/presets", tags=["songbook-presets"])
DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "presets.json"


def _ensure_store():
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        DATA_FILE.write_text("[]", encoding="utf-8")


def _load_presets() -> list[SongbookPreset]:
    _ensure_store()
    with DATA_FILE.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    return [SongbookPreset(**item) for item in payload]


def _save_presets(presets: list[SongbookPreset]) -> None:
    _ensure_store()
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump([preset.model_dump(mode="json") for preset in presets], handle, indent=2)


@router.get("", response_model=list[SongbookPreset])
async def list_presets():
    return _load_presets()


@router.post("", response_model=SongbookPreset, status_code=status.HTTP_201_CREATED)
async def create_preset(payload: SongbookPresetCreate):
    presets = _load_presets()
    preset_id = f"preset-{len(presets) + 1:04d}"
    new_preset = SongbookPreset(
        id=preset_id,
        name=payload.name,
        instrument=payload.instrument,
        chords=payload.chords,
        tempo_bpm=payload.tempo_bpm,
        created_at=datetime.now(timezone.utc),
        notes=payload.notes,
    )
    presets.append(new_preset)
    _save_presets(presets)
    return new_preset


@router.get("/{preset_id}", response_model=SongbookPreset)
async def get_preset(preset_id: str):
    presets = _load_presets()
    for preset in presets:
        if preset.id == preset_id:
            return preset
    raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' was not found")


@router.delete("/{preset_id}")
async def delete_preset(preset_id: str):
    presets = _load_presets()
    filtered = [preset for preset in presets if preset.id != preset_id]
    if len(filtered) == len(presets):
        raise HTTPException(status_code=404, detail=f"Preset '{preset_id}' was not found")
    _save_presets(filtered)
    return {"deleted": True, "id": preset_id}
