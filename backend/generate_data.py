import json
from pathlib import Path

# Music Theory notes
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Guitar Base Voicings across roots
GUITAR_DATA = [
    # C Chords
    {"chord_name": "C", "instrument": "guitar", "root": "C", "quality": "maj", "frets": [-1, 3, 2, 0, 1, 0], "fingers": [0, 3, 2, 0, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "C", "instrument": "guitar", "root": "C", "quality": "maj", "frets": [8, 10, 10, 9, 8, 8], "fingers": [1, 3, 4, 2, 1, 1], "base_fret": 8, "barres": [8], "voicing_index": 1},
    {"chord_name": "C", "instrument": "guitar", "root": "C", "quality": "maj", "frets": [-1, -1, 10, 9, 8, 8], "fingers": [0, 0, 3, 2, 1, 1], "base_fret": 8, "voicing_index": 2},
    {"chord_name": "Cm", "instrument": "guitar", "root": "C", "quality": "min", "frets": [-1, 3, 5, 5, 4, 3], "fingers": [0, 1, 3, 4, 2, 1], "base_fret": 3, "barres": [3], "voicing_index": 0},
    {"chord_name": "Cm", "instrument": "guitar", "root": "C", "quality": "min", "frets": [8, 10, 10, 8, 8, 8], "fingers": [1, 3, 4, 1, 1, 1], "base_fret": 8, "barres": [8], "voicing_index": 1},
    {"chord_name": "C7", "instrument": "guitar", "root": "C", "quality": "7", "frets": [-1, 3, 2, 3, 1, 0], "fingers": [0, 3, 2, 4, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cmaj7", "instrument": "guitar", "root": "C", "quality": "maj7", "frets": [-1, 3, 2, 0, 0, 0], "fingers": [0, 3, 2, 0, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cm7", "instrument": "guitar", "root": "C", "quality": "m7", "frets": [-1, 3, 5, 3, 4, 3], "fingers": [0, 1, 3, 1, 2, 1], "base_fret": 3, "barres": [3], "voicing_index": 0},
    {"chord_name": "Csus4", "instrument": "guitar", "root": "C", "quality": "sus4", "frets": [-1, 3, 3, 0, 1, 1], "fingers": [0, 3, 4, 0, 1, 2], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Csus2", "instrument": "guitar", "root": "C", "quality": "sus2", "frets": [-1, 3, 0, 0, 1, 0], "fingers": [0, 3, 0, 0, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cdim", "instrument": "guitar", "root": "C", "quality": "dim", "frets": [-1, 3, 4, 2, 4, -1], "fingers": [0, 2, 3, 1, 4, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Caug", "instrument": "guitar", "root": "C", "quality": "aug", "frets": [-1, 3, 2, 1, 1, 0], "fingers": [0, 3, 2, 1, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "C9", "instrument": "guitar", "root": "C", "quality": "9", "frets": [-1, 3, 2, 3, 3, 3], "fingers": [0, 2, 1, 3, 3, 3], "base_fret": 1, "barres": [3], "voicing_index": 0},

    # D Chords
    {"chord_name": "D", "instrument": "guitar", "root": "D", "quality": "maj", "frets": [-1, -1, 0, 2, 3, 2], "fingers": [0, 0, 0, 1, 3, 2], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "D", "instrument": "guitar", "root": "D", "quality": "maj", "frets": [-1, 5, 7, 7, 7, 5], "fingers": [0, 1, 2, 3, 4, 1], "base_fret": 5, "barres": [5], "voicing_index": 1},
    {"chord_name": "Dm", "instrument": "guitar", "root": "D", "quality": "min", "frets": [-1, -1, 0, 2, 3, 1], "fingers": [0, 0, 0, 2, 3, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "D7", "instrument": "guitar", "root": "D", "quality": "7", "frets": [-1, -1, 0, 2, 1, 2], "fingers": [0, 0, 0, 2, 1, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dmaj7", "instrument": "guitar", "root": "D", "quality": "maj7", "frets": [-1, -1, 0, 2, 2, 2], "fingers": [0, 0, 0, 1, 2, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dm7", "instrument": "guitar", "root": "D", "quality": "m7", "frets": [-1, -1, 0, 2, 1, 1], "fingers": [0, 0, 0, 2, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},
    {"chord_name": "Dsus4", "instrument": "guitar", "root": "D", "quality": "sus4", "frets": [-1, -1, 0, 2, 3, 3], "fingers": [0, 0, 0, 1, 2, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dsus2", "instrument": "guitar", "root": "D", "quality": "sus2", "frets": [-1, -1, 0, 2, 3, 0], "fingers": [0, 0, 0, 1, 2, 0], "base_fret": 1, "voicing_index": 0},

    # E Chords
    {"chord_name": "E", "instrument": "guitar", "root": "E", "quality": "maj", "frets": [0, 2, 2, 1, 0, 0], "fingers": [0, 2, 3, 1, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "E", "instrument": "guitar", "root": "E", "quality": "maj", "frets": [-1, 7, 9, 9, 9, 7], "fingers": [0, 1, 2, 3, 4, 1], "base_fret": 7, "barres": [7], "voicing_index": 1},
    {"chord_name": "Em", "instrument": "guitar", "root": "E", "quality": "min", "frets": [0, 2, 2, 0, 0, 0], "fingers": [0, 2, 3, 0, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "E7", "instrument": "guitar", "root": "E", "quality": "7", "frets": [0, 2, 0, 1, 0, 0], "fingers": [0, 2, 0, 1, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Emaj7", "instrument": "guitar", "root": "E", "quality": "maj7", "frets": [0, 2, 1, 1, 0, 0], "fingers": [0, 3, 1, 2, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Em7", "instrument": "guitar", "root": "E", "quality": "m7", "frets": [0, 2, 2, 0, 3, 0], "fingers": [0, 1, 2, 0, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Esus4", "instrument": "guitar", "root": "E", "quality": "sus4", "frets": [0, 2, 2, 2, 0, 0], "fingers": [0, 1, 2, 3, 0, 0], "base_fret": 1, "voicing_index": 0},

    # F Chords
    {"chord_name": "F", "instrument": "guitar", "root": "F", "quality": "maj", "frets": [1, 3, 3, 2, 1, 1], "fingers": [1, 3, 4, 2, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},
    {"chord_name": "F", "instrument": "guitar", "root": "F", "quality": "maj", "frets": [-1, -1, 3, 2, 1, 1], "fingers": [0, 0, 3, 2, 1, 1], "base_fret": 1, "voicing_index": 1},
    {"chord_name": "Fm", "instrument": "guitar", "root": "F", "quality": "min", "frets": [1, 3, 3, 1, 1, 1], "fingers": [1, 3, 4, 1, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},
    {"chord_name": "F7", "instrument": "guitar", "root": "F", "quality": "7", "frets": [1, 3, 1, 2, 1, 1], "fingers": [1, 3, 1, 2, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},
    {"chord_name": "Fmaj7", "instrument": "guitar", "root": "F", "quality": "maj7", "frets": [-1, -1, 3, 2, 1, 0], "fingers": [0, 0, 3, 2, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Fm7", "instrument": "guitar", "root": "F", "quality": "m7", "frets": [1, 3, 1, 1, 1, 1], "fingers": [1, 3, 1, 1, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},

    # G Chords
    {"chord_name": "G", "instrument": "guitar", "root": "G", "quality": "maj", "frets": [3, 2, 0, 0, 0, 3], "fingers": [2, 1, 0, 0, 0, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "G", "instrument": "guitar", "root": "G", "quality": "maj", "frets": [3, 5, 5, 4, 3, 3], "fingers": [1, 3, 4, 2, 1, 1], "base_fret": 3, "barres": [3], "voicing_index": 1},
    {"chord_name": "Gm", "instrument": "guitar", "root": "G", "quality": "min", "frets": [3, 5, 5, 3, 3, 3], "fingers": [1, 3, 4, 1, 1, 1], "base_fret": 3, "barres": [3], "voicing_index": 0},
    {"chord_name": "G7", "instrument": "guitar", "root": "G", "quality": "7", "frets": [3, 2, 0, 0, 0, 1], "fingers": [3, 2, 0, 0, 0, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Gmaj7", "instrument": "guitar", "root": "G", "quality": "maj7", "frets": [3, -1, 0, 0, 0, 2], "fingers": [2, 0, 0, 0, 0, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Gm7", "instrument": "guitar", "root": "G", "quality": "m7", "frets": [3, 5, 3, 3, 3, 3], "fingers": [1, 3, 1, 1, 1, 1], "base_fret": 3, "barres": [3], "voicing_index": 0},
    {"chord_name": "Gsus4", "instrument": "guitar", "root": "G", "quality": "sus4", "frets": [3, 3, 0, 0, 1, 3], "fingers": [2, 3, 0, 0, 1, 4], "base_fret": 1, "voicing_index": 0},

    # A Chords
    {"chord_name": "A", "instrument": "guitar", "root": "A", "quality": "maj", "frets": [-1, 0, 2, 2, 2, 0], "fingers": [0, 0, 1, 2, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "A", "instrument": "guitar", "root": "A", "quality": "maj", "frets": [5, 7, 7, 6, 5, 5], "fingers": [1, 3, 4, 2, 1, 1], "base_fret": 5, "barres": [5], "voicing_index": 1},
    {"chord_name": "Am", "instrument": "guitar", "root": "A", "quality": "min", "frets": [-1, 0, 2, 2, 1, 0], "fingers": [0, 0, 2, 3, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "A7", "instrument": "guitar", "root": "A", "quality": "7", "frets": [-1, 0, 2, 0, 2, 0], "fingers": [0, 0, 2, 0, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Amaj7", "instrument": "guitar", "root": "A", "quality": "maj7", "frets": [-1, 0, 2, 1, 2, 0], "fingers": [0, 0, 2, 1, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Am7", "instrument": "guitar", "root": "A", "quality": "m7", "frets": [-1, 0, 2, 0, 1, 0], "fingers": [0, 0, 2, 0, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Asus4", "instrument": "guitar", "root": "A", "quality": "sus4", "frets": [-1, 0, 2, 2, 3, 0], "fingers": [0, 0, 1, 2, 4, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Asus2", "instrument": "guitar", "root": "A", "quality": "sus2", "frets": [-1, 0, 2, 2, 0, 0], "fingers": [0, 0, 1, 2, 0, 0], "base_fret": 1, "voicing_index": 0},

    # B Chords
    {"chord_name": "B", "instrument": "guitar", "root": "B", "quality": "maj", "frets": [-1, 2, 4, 4, 4, 2], "fingers": [0, 1, 2, 3, 4, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "Bm", "instrument": "guitar", "root": "B", "quality": "min", "frets": [-1, 2, 4, 4, 3, 2], "fingers": [0, 1, 3, 4, 2, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "B7", "instrument": "guitar", "root": "B", "quality": "7", "frets": [-1, 2, 1, 2, 0, 2], "fingers": [0, 2, 1, 3, 0, 4], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Bmaj7", "instrument": "guitar", "root": "B", "quality": "maj7", "frets": [-1, 2, 4, 3, 4, 2], "fingers": [0, 1, 3, 2, 4, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "Bm7", "instrument": "guitar", "root": "B", "quality": "m7", "frets": [-1, 2, 4, 2, 3, 2], "fingers": [0, 1, 3, 1, 2, 1], "base_fret": 2, "barres": [2], "voicing_index": 0}
]

# Ukulele Base Voicings across roots
UKULELE_DATA = [
    # C Chords
    {"chord_name": "C", "instrument": "ukulele", "root": "C", "quality": "maj", "frets": [0, 0, 0, 3], "fingers": [0, 0, 0, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "C", "instrument": "ukulele", "root": "C", "quality": "maj", "frets": [5, 4, 3, 3], "fingers": [3, 2, 1, 1], "base_fret": 3, "barres": [3], "voicing_index": 1},
    {"chord_name": "Cm", "instrument": "ukulele", "root": "C", "quality": "min", "frets": [0, 3, 3, 3], "fingers": [0, 1, 2, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "C7", "instrument": "ukulele", "root": "C", "quality": "7", "frets": [0, 0, 0, 1], "fingers": [0, 0, 0, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cmaj7", "instrument": "ukulele", "root": "C", "quality": "maj7", "frets": [0, 0, 0, 2], "fingers": [0, 0, 0, 2], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cm7", "instrument": "ukulele", "root": "C", "quality": "m7", "frets": [3, 3, 3, 3], "fingers": [1, 1, 1, 1], "base_fret": 3, "barres": [3], "voicing_index": 0},
    {"chord_name": "Csus4", "instrument": "ukulele", "root": "C", "quality": "sus4", "frets": [0, 0, 1, 3], "fingers": [0, 0, 1, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Csus2", "instrument": "ukulele", "root": "C", "quality": "sus2", "frets": [0, 2, 3, 3], "fingers": [0, 1, 2, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Cdim", "instrument": "ukulele", "root": "C", "quality": "dim", "frets": [2, 3, 2, 3], "fingers": [1, 3, 2, 4], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Caug", "instrument": "ukulele", "root": "C", "quality": "aug", "frets": [1, 0, 0, 3], "fingers": [1, 0, 0, 4], "base_fret": 1, "voicing_index": 0},

    # D Chords
    {"chord_name": "D", "instrument": "ukulele", "root": "D", "quality": "maj", "frets": [2, 2, 2, 0], "fingers": [1, 2, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dm", "instrument": "ukulele", "root": "D", "quality": "min", "frets": [2, 2, 1, 0], "fingers": [2, 3, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "D7", "instrument": "ukulele", "root": "D", "quality": "7", "frets": [2, 0, 2, 0], "fingers": [2, 0, 3, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dmaj7", "instrument": "ukulele", "root": "D", "quality": "maj7", "frets": [2, 2, 2, 4], "fingers": [1, 1, 1, 3], "base_fret": 1, "barres": [2], "voicing_index": 0},
    {"chord_name": "Dm7", "instrument": "ukulele", "root": "D", "quality": "m7", "frets": [2, 2, 1, 3], "fingers": [2, 3, 1, 4], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Dsus4", "instrument": "ukulele", "root": "D", "quality": "sus4", "frets": [0, 2, 3, 0], "fingers": [0, 1, 2, 0], "base_fret": 1, "voicing_index": 0},

    # E Chords
    {"chord_name": "E", "instrument": "ukulele", "root": "E", "quality": "maj", "frets": [4, 4, 4, 2], "fingers": [2, 3, 4, 1], "base_fret": 2, "voicing_index": 0},
    {"chord_name": "Em", "instrument": "ukulele", "root": "E", "quality": "min", "frets": [0, 4, 3, 2], "fingers": [0, 3, 2, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "E7", "instrument": "ukulele", "root": "E", "quality": "7", "frets": [1, 2, 0, 2], "fingers": [1, 2, 0, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Emaj7", "instrument": "ukulele", "root": "E", "quality": "maj7", "frets": [1, 3, 0, 2], "fingers": [1, 3, 0, 2], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Em7", "instrument": "ukulele", "root": "E", "quality": "m7", "frets": [0, 2, 0, 2], "fingers": [0, 1, 0, 2], "base_fret": 1, "voicing_index": 0},

    # F Chords
    {"chord_name": "F", "instrument": "ukulele", "root": "F", "quality": "maj", "frets": [2, 0, 1, 0], "fingers": [2, 0, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Fm", "instrument": "ukulele", "root": "F", "quality": "min", "frets": [1, 0, 1, 3], "fingers": [1, 0, 2, 4], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "F7", "instrument": "ukulele", "root": "F", "quality": "7", "frets": [2, 3, 1, 0], "fingers": [2, 3, 1, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Fmaj7", "instrument": "ukulele", "root": "F", "quality": "maj7", "frets": [2, 4, 1, 3], "fingers": [2, 4, 1, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Fm7", "instrument": "ukulele", "root": "F", "quality": "m7", "frets": [1, 3, 1, 3], "fingers": [1, 3, 2, 4], "base_fret": 1, "voicing_index": 0},

    # G Chords
    {"chord_name": "G", "instrument": "ukulele", "root": "G", "quality": "maj", "frets": [0, 2, 3, 2], "fingers": [0, 1, 3, 2], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Gm", "instrument": "ukulele", "root": "G", "quality": "min", "frets": [0, 2, 3, 1], "fingers": [0, 2, 3, 1], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "G7", "instrument": "ukulele", "root": "G", "quality": "7", "frets": [0, 2, 1, 2], "fingers": [0, 2, 1, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Gmaj7", "instrument": "ukulele", "root": "G", "quality": "maj7", "frets": [0, 2, 2, 2], "fingers": [0, 1, 2, 3], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Gm7", "instrument": "ukulele", "root": "G", "quality": "m7", "frets": [0, 2, 1, 1], "fingers": [0, 2, 1, 1], "base_fret": 1, "barres": [1], "voicing_index": 0},

    # A Chords
    {"chord_name": "A", "instrument": "ukulele", "root": "A", "quality": "maj", "frets": [2, 1, 0, 0], "fingers": [2, 1, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Am", "instrument": "ukulele", "root": "A", "quality": "min", "frets": [2, 0, 0, 0], "fingers": [2, 0, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "A7", "instrument": "ukulele", "root": "A", "quality": "7", "frets": [0, 1, 0, 0], "fingers": [0, 1, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Amaj7", "instrument": "ukulele", "root": "A", "quality": "maj7", "frets": [1, 1, 0, 0], "fingers": [1, 2, 0, 0], "base_fret": 1, "voicing_index": 0},
    {"chord_name": "Am7", "instrument": "ukulele", "root": "A", "quality": "m7", "frets": [0, 0, 0, 0], "fingers": [0, 0, 0, 0], "base_fret": 1, "voicing_index": 0},

    # B Chords
    {"chord_name": "B", "instrument": "ukulele", "root": "B", "quality": "maj", "frets": [4, 3, 2, 2], "fingers": [3, 2, 1, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "Bm", "instrument": "ukulele", "root": "B", "quality": "min", "frets": [4, 2, 2, 2], "fingers": [3, 1, 1, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "B7", "instrument": "ukulele", "root": "B", "quality": "7", "frets": [2, 3, 2, 2], "fingers": [1, 2, 1, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "Bmaj7", "instrument": "ukulele", "root": "B", "quality": "maj7", "frets": [3, 3, 2, 2], "fingers": [2, 3, 1, 1], "base_fret": 2, "barres": [2], "voicing_index": 0},
    {"chord_name": "Bm7", "instrument": "ukulele", "root": "B", "quality": "m7", "frets": [2, 2, 2, 2], "fingers": [1, 1, 1, 1], "base_fret": 2, "barres": [2], "voicing_index": 0}
]

# Generate transposition logic for all other semitones (C#, D#, F#, G#, A#)
SEMITONE_MAP = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}

# Save JSON datasets
backend_data = Path("d:/APP JOSH/ChordGrid/backend/app/data")
with open(backend_data / "guitar_chords.json", "w", encoding="utf-8") as f:
    json.dump(GUITAR_DATA, f, indent=2)

with open(backend_data / "ukulele_chords.json", "w", encoding="utf-8") as f:
    json.dump(UKULELE_DATA, f, indent=2)

print("Saved chord databases successfully!")
