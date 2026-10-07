from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import chords as extended_chords, presets
from .routes import chords, tunings, identify

app = FastAPI(
    title="ChordGrid API",
    description="Studio-grade chord library and audio visualizer backend for Guitar & Ukulele",
    version="1.0.0"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(chords.router)
app.include_router(tunings.router)
app.include_router(identify.router)
app.include_router(extended_chords.router)
app.include_router(presets.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ChordGrid API",
        "version": "1.0.0"
    }

@app.get("/api/instruments")
async def get_instruments():
    return [
        {
            "id": "guitar",
            "name": "Acoustic / Electric Guitar",
            "strings": 6,
            "default_tuning": "guitar-standard"
        },
        {
            "id": "ukulele",
            "name": "Concert / Soprano Ukulele",
            "strings": 4,
            "default_tuning": "ukulele-standard"
        }
    ]
