# ChordGrid 🎸

> An interactive Ukulele & Guitar Fretboard Visualizer and Physical-Modeling Audio Synthesizer built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **FastAPI**.

![ChordGrid Preview](https://img.shields.io/badge/Studio-Acoustic-amber)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.14-yellow?logo=python)

---

## 🌟 Key Features

- **Dual Instrument Engine:** Instant toggle between Acoustic/Electric Guitar (6-string `EADGBE`) and Ukulele (4-string `GCEA`).
- **Mathematical SVG Fretboard:** Parametric fret spacing calculated using the physical acoustic 12th-root-of-2 logarithmic rule ($d_n = L \cdot (1 - 2^{-n/12})$).
- **Physical Pluck & Strummer Engine:** Zero-latency Web Audio API synthesizers simulating staggered downstrokes ($15\text{ms}-40\text{ms}$ delay), upstrokes, arpeggios, and per-string plucking with acoustic body resonance.
- **Dynamic Alternate Tunings:**
  - Guitar: Standard, Drop D, DADGAD, Open D, Open G, Half Step Down.
  - Ukulele: Standard High-G, Low-G Linear, Baritone, D-Tuning.
- **Multiple Voicings:** Navigate through alternate fingerings and movable barre shapes for any chord.
- **Visual Capo Engine:** Snap a capo across Frets 1–7 with real-time automatic pitch and audio transposition.
- **Dual Layouts & Lefty Mode:** Toggle between Horizontal Studio view and Vertical Chord-Sheet Box view, plus instant left-handed mirroring.
- **Reverse Chord Detection:** Click on custom frets to audition notes; the backend harmonically identifies chord candidates in real-time.
- **Zero-Latency Offline Fallback:** Complete embedded client-side dataset ensures 100% interactive usability even when offline.

---

## 🚀 Quick Start

### 1. Backend (`/backend`)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/api/health`

### 2. Frontend (`/frontend`)
```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
- Application: `http://localhost:3000`

---

## 📂 Architecture

```text
ChordGrid/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI application entry & CORS
│   │   ├── models/                  # Pydantic schemas (Chord, Tuning, Identify)
│   │   ├── routes/                  # API routers (/chords, /tunings, /identify)
│   │   └── data/                    # JSON datasets for guitar, ukulele, & tunings
│   ├── requirements.txt
│   └── generate_data.py
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # Studio Acoustic dark layout shell
│   │   ├── page.tsx                 # Main visualizer page
│   │   └── globals.css              # Custom studio gradients & Tailwind directives
│   ├── components/
│   │   ├── Fretboard/SvgFretboard   # Parametric SVG fretboard renderer
│   │   ├── Controls/                # InstrumentToggle, ChordSelector, VoicingNavigator, FretboardOptions
│   │   ├── Audio/AudioToolbar       # Strum down/up, arpeggio, tempo & volume controls
│   │   └── UI/                      # Header and ChordInspector components
│   ├── lib/
│   │   ├── audio/StrummerEngine.ts  # Web Audio physical pluck synthesis
│   │   ├── defaultChords.ts         # Embedded offline fallback dictionary
│   │   └── api.ts                   # Backend client
│   └── package.json
└── README.md
```

---

## 📄 License
MIT License. Created by [joshua5915g](https://github.com/joshua5915g).
