# ChordGrid

Interactive guitar and ukulele chord explorer with a live fretboard, alternate tunings, capo controls, and browser-based audio playback.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?logo=opensourceinitiative&logoColor=white)](LICENSE)

## Overview

ChordGrid is a full-stack music practice app for guitar and ukulele players. It renders interactive chord diagrams, supports alternate tunings and capo settings, and plays strings with a browser audio engine that simulates realistic plucked-string motion.

The app is built around a Next.js frontend and a FastAPI backend. The frontend handles the visual fretboard, controls, and sound engine, while the backend serves chord data, tuning presets, and reverse-chord identification based on a selected finger pattern.

## Features

- Dual instrument support for guitar and ukulele
- Interactive SVG fretboard with accurate fret spacing and note layout
- Alternate tunings including Drop D, DADGAD, Open G, and more
- Capo and left-handed viewing options
- Multiple voicing navigation for each chord
- Strum, arpeggio, and rhythm control
- Reverse chord detection from custom fret input
- Offline fallback chord data for a smoother local experience
- Dark, studio-inspired UI optimized for practice and learning

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Web Audio API

### Backend

- FastAPI
- Python 3.11+
- Pydantic
- Uvicorn

## Project Structure

```text
ChordGrid/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── data/
│   │   │   ├── guitar_chords.json
│   │   │   ├── tunings.json
│   │   │   └── ukulele_chords.json
│   │   ├── models/
│   │   │   └── chord.py
│   │   └── routes/
│   │       ├── chords.py
│   │       ├── identify.py
│   │       └── tunings.py
│   ├── generate_data.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .gitignore
├── README.md
└── LICENSE
```

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend exposes Swagger and Redoc docs at:

- http://localhost:8000/docs
- http://localhost:8000/redoc

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:

- http://localhost:3000

## API Overview

The backend includes a few core endpoints:

- `GET /api/health` — health status
- `GET /api/instruments` — available instruments
- `GET /api/chords` — fetch chord voicings by instrument, root, and quality
- `GET /api/tunings` — tuning presets
- `POST /api/identify` — reverse identification from a fret pattern

## Why This Project Exists

ChordGrid is designed to help musicians learn and explore chord shapes more intuitively. Rather than relying on static chord charts, it offers a dynamic fretboard that updates instantly as you change instruments, tunings, voicings, and capo settings.

It blends visual learning with real-time playback so users can both see and hear how chords are formed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your edits
4. Commit with a clear message
5. Open a pull request

## License

This project is licensed under the MIT License.

## Built With

Next.js • React • TypeScript • Tailwind CSS • FastAPI • Python
