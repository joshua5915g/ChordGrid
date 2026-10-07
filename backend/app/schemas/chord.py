from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class FretPosition(BaseModel):
    string_index: int = Field(..., ge=0)
    fret: int = Field(..., ge=-1)
    is_open: bool = False
    is_muted: bool = False
    note: Optional[str] = None
    frequency_hz: Optional[float] = None


class ChordVoicing(BaseModel):
    chord_name: str = Field(..., description="Display name like C, Am, or Cmaj7")
    instrument: Literal["guitar", "ukulele"]
    root: str = Field(..., min_length=1, max_length=3)
    quality: str = Field(..., description="maj, min, 7, maj7, m7, sus4, etc.")
    frets: list[int] = Field(..., description="Per-string fret values; -1 = muted")
    fingers: Optional[list[int]] = Field(None, description="Optional fingering map")
    base_fret: int = Field(1, ge=0)
    voicing_index: int = Field(0, ge=0)
    tuning_id: Optional[str] = None
    notes: Optional[list[str]] = Field(None, description="Resolved note names by string")


class TuningProfile(BaseModel):
    id: str
    instrument: Literal["guitar", "ukulele"]
    name: str
    notes: list[str]
    frequencies: list[float]
    description: Optional[str] = None


class SongbookPresetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    instrument: Literal["guitar", "ukulele"]
    chords: list[str] = Field(..., min_length=1)
    tempo_bpm: Optional[int] = Field(None, ge=40, le=220)
    notes: Optional[str] = None


class SongbookPreset(BaseModel):
    id: str
    name: str
    instrument: Literal["guitar", "ukulele"]
    chords: list[str]
    tempo_bpm: Optional[int] = None
    created_at: datetime
    notes: Optional[str] = None
