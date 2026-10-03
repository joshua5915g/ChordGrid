from fastapi import APIRouter, Query
from typing import List, Optional
import json
from pathlib import Path
from ..models.chord import Tuning, InstrumentType

router = APIRouter(prefix="/api/tunings", tags=["tunings"])

DATA_PATH = Path(__file__).parent.parent / "data" / "tunings.json"

def load_tunings() -> List[Tuning]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return [Tuning(**item) for item in data]

@router.get("", response_model=List[Tuning])
async def get_tunings(instrument: Optional[InstrumentType] = Query(None, description="Filter by instrument")):
    tunings = load_tunings()
    if instrument:
        tunings = [t for t in tunings if t.instrument == instrument]
    return tunings

@router.get("/{tuning_id}", response_model=Optional[Tuning])
async def get_tuning_by_id(tuning_id: str):
    tunings = load_tunings()
    for t in tunings:
        if t.id == tuning_id:
            return t
    return None
