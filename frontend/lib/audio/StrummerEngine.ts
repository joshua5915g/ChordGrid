/**
 * Studio Acoustic Web Audio Strummer Engine
 * Uses physical-modeled pluck synthesis with harmonic decay, body resonance,
 * and realistic micro-delay strumming dynamics.
 */

// Note to frequency map for standard tuning base references
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export function pitchToFrequency(noteWithOctave: string): number {
  const match = noteWithOctave.match(/^([A-Ga-g][#b]?)([0-9])$/);
  if (!match) return 440;
  const note = match[1];
  const octave = parseInt(match[2], 10);
  const semitone = NOTE_SEMITONES[note] ?? 0;
  // A4 = 440 Hz is octave 4, semitone 9
  const a4Index = 4 * 12 + 9;
  const targetIndex = octave * 12 + semitone;
  return 440 * Math.pow(2, (targetIndex - a4Index) / 12);
}

export function fretToFrequency(baseFreq: number, fret: number): number {
  if (fret <= 0) return baseFreq;
  return baseFreq * Math.pow(2, fret / 12);
}

class AcousticStrummerEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  /**
   * Synthesize a single realistic plucked string using dual-oscillator
   * harmonic timbre + resonant lowpass acoustic body filter.
   */
  public pluckString(frequency: number, delaySeconds: number = 0, isBassString: boolean = false) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const startTime = this.ctx.currentTime + Math.max(0, delaySeconds);
    const duration = isBassString ? 2.8 : 2.0;

    // Pluck pick noise impulse
    const bufferSize = this.ctx.sampleRate * 0.008; // 8ms transient click
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2500, startTime);
    noiseFilter.Q.setValueAtTime(3.0, startTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.015);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start(startTime);
    noiseSource.stop(startTime + 0.02);

    // Primary String Oscillator (Sawtooth with body filter)
    const osc1 = this.ctx.createOscillator();
    osc1.type = isBassString ? 'triangle' : 'sawtooth';
    osc1.frequency.setValueAtTime(frequency, startTime);

    // Secondary slight-detune oscillator for warm wood resonance
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(frequency * 2, startTime); // 1st harmonic octave

    // Resonant Acoustic Body Filter
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    const cutoff = Math.min(8000, frequency * 4.5);
    bodyFilter.frequency.setValueAtTime(cutoff, startTime);
    bodyFilter.frequency.exponentialRampToValueAtTime(frequency * 1.5, startTime + duration * 0.6);
    bodyFilter.Q.setValueAtTime(2.5, startTime);

    // Envelope
    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.45, startTime + 0.004); // Fast pluck attack
    noteGain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.12);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Connect chain
    osc1.connect(bodyFilter);
    osc2.connect(bodyFilter);
    bodyFilter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
  }

  /**
   * Strum a chord with micro-delays between strings.
   * @param frequencies Array of string frequencies in order from lowest string to highest string
   * @param frets Array of frets (-1 indicates muted string)
   * @param direction 'down' (low to high string) or 'up' (high to low string)
   * @param staggerMs Milliseconds between consecutive strings (e.g. 24ms)
   */
  public strumChord(
    frequencies: number[],
    frets: number[],
    direction: 'down' | 'up' = 'down',
    staggerMs: number = 24
  ) {
    const stringIndices = frequencies.map((_, i) => i);
    if (direction === 'up') {
      stringIndices.reverse();
    }

    let delayIndex = 0;
    stringIndices.forEach((strIdx) => {
      const fret = frets[strIdx];
      if (fret === -1) return; // Skip muted string

      const freq = frequencies[strIdx];
      const delay = (delayIndex * staggerMs) / 1000;
      const isBass = strIdx < frequencies.length / 2;
      this.pluckString(freq, delay, isBass);
      delayIndex++;
    });
  }

  /**
   * Arpeggio: play each active string sequentially at a steady musical tempo
   */
  public arpeggiateChord(frequencies: number[], frets: number[], bpm: number = 100) {
    const beatSec = 60 / bpm / 2; // Eighth note arpeggio
    let delayIndex = 0;

    frequencies.forEach((freq, strIdx) => {
      const fret = frets[strIdx];
      if (fret === -1) return;

      const delay = delayIndex * beatSec;
      const isBass = strIdx < frequencies.length / 2;
      this.pluckString(freq, delay, isBass);
      delayIndex++;
    });
  }
}

export const audioStrummer = new AcousticStrummerEngine();
