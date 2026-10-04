export type StrumDirection = 'down' | 'up';

export interface PlayNoteOptions {
  startDelay?: number;
  duration?: number;
  isBass?: boolean;
  gain?: number;
}

export interface StrumConfig {
  direction?: StrumDirection;
  speedMs?: number;
}

const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

export function noteNameToFrequency(noteName: string): number {
  const match = /^([A-Ga-g][#b]?)(-?\d)$/.exec(noteName.trim());
  if (!match) {
    return 440;
  }

  const [, letter, octaveText] = match;
  const octave = Number(octaveText);
  const semitone = NOTE_SEMITONES[letter] ?? 0;
  const midiNote = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export function fretToFrequency(baseFrequency: number, fret: number, capoFret = 0): number {
  const semitones = (fret + capoFret) || 0;
  if (semitones <= 0) {
    return baseFrequency;
  }
  return baseFrequency * Math.pow(2, semitones / 12);
}

export class ChordGridAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private masterVolume = 0.8;

  private getOrCreateContext(): AudioContext {
    if (typeof window === 'undefined') {
      throw new Error('Audio is only supported in the browser');
    }

    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!this.context) {
      this.context = new AudioCtor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }

    return this.context;
  }

  public ensureStarted(): AudioContext {
    return this.getOrCreateContext();
  }

  public setVolume(value: number) {
    this.masterVolume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.getOrCreateContext().currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.masterVolume);
    return this.isMuted;
  }

  public playNote(frequency: number, options: PlayNoteOptions = {}) {
    const {
      startDelay = 0,
      duration = 0.22,
      isBass = false,
      gain = 0.65,
    } = options;

    const ctx = this.getOrCreateContext();
    if (!this.masterGain || this.isMuted) {
      return;
    }

    const startTime = ctx.currentTime + startDelay;
    const voiceGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const oscillator = ctx.createOscillator();
    const harmonic = ctx.createOscillator();

    oscillator.type = isBass ? 'triangle' : 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(frequency * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(9000, frequency * 10), startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    voiceGain.gain.setValueAtTime(0.0001, startTime);
    voiceGain.gain.exponentialRampToValueAtTime(gain, startTime + 0.01);
    voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(filter);
    harmonic.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(this.masterGain);

    oscillator.start(startTime);
    harmonic.start(startTime);
    oscillator.stop(startTime + duration);
    harmonic.stop(startTime + duration);
  }

  public strumChord(frequencies: number[], config: StrumConfig = {}) {
    const { direction = 'down', speedMs = 35 } = config;
    const playable = frequencies.filter((freq) => Number.isFinite(freq) && freq > 0);
    const ordered = direction === 'down' ? playable : [...playable].reverse();

    ordered.forEach((frequency, index) => {
      const isBass = index < Math.ceil(ordered.length / 2);
      this.playNote(frequency, {
        startDelay: (index * speedMs) / 1000,
        isBass,
        duration: 0.18,
        gain: isBass ? 0.72 : 0.6,
      });
    });
  }
}

export const audioEngine = new ChordGridAudioEngine();
