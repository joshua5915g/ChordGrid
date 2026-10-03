from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

class InstrumentType(str, Enum):
    GUITAR = "guitar"
    UKULELE = "ukulele"

class Tuning(BaseModel):
    id: str
    instrument: InstrumentType
    name: str
    notes: List[str]
    frequencies: List[float] = Field(default_factory=list)
    description: Optional[str] = None

class ChordFingering(BaseModel):
    chord_name: str
    instrument: InstrumentType
    root: str
    quality: str
    frets: List[int]  # -1 means muted, 0 means open string, >0 means fret number
    fingers: Optional[List[int]] = None  # 0: none/open, 1: index, 2: middle, 3: ring, 4: pinky, -1: thumb
    base_fret: int = 1
    barres: Optional[List[int]] = None
    voicing_index: int = 0
    tuning_id: str = "standard"

class ChordResponse(BaseModel):
    chord_name: str
    instrument: InstrumentType
    root: str
    quality: str
    voicings: List[ChordFingering]

class IdentifyRequest(BaseModel):
    instrument: InstrumentType
    frets: List[int]
    tuning_notes: Optional[List[str]] = None

class IdentifyCandidate(BaseModel):
    chord_name: str
    root: str
    quality: str
    notes: List[str]
    confidence: float

class IdentifyResponse(BaseModel):
    input_frets: List[int]
    notes: List[str]
    candidates: List[IdentifyCandidate]
