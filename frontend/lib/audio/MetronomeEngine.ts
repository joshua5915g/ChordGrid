/**
 * Studio Precision Web Audio Metronome Engine
 * Uses lookahead audio clock scheduling for sample-accurate timing
 * with zero drift and realistic acoustic woodblock click synthesis.
 */

export type TimeSignature = '4/4' | '3/4' | '2/4' | '6/8';

export interface TimeSignatureConfig {
  beatsPerMeasure: number;
  beatUnit: number;
}

export const TIME_SIGNATURE_CONFIGS: Record<TimeSignature, TimeSignatureConfig> = {
  '4/4': { beatsPerMeasure: 4, beatUnit: 4 },
  '3/4': { beatsPerMeasure: 3, beatUnit: 4 },
  '2/4': { beatsPerMeasure: 2, beatUnit: 4 },
  '6/8': { beatsPerMeasure: 6, beatUnit: 8 },
};

export class MetronomeEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 100;
  private timeSignature: TimeSignature = '4/4';
  private currentBeatInMeasure: number = 0;
  private nextBeatTime: number = 0;
  private timerId: number | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  private onBeatCallbacks: Set<(beat: number, totalBeats: number) => void> = new Set();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribeBeat(cb: (beat: number, totalBeats: number) => void) {
    this.onBeatCallbacks.add(cb);
    return () => this.onBeatCallbacks.delete(cb);
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(30, Math.min(260, Math.round(newBpm)));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setTimeSignature(sig: TimeSignature) {
    this.timeSignature = sig;
    this.currentBeatInMeasure = 0;
  }

  public getTimeSignature(): TimeSignature {
    return this.timeSignature;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private scheduleClick(time: number, isAccent: boolean) {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High woodblock tick on accent (1600 Hz), regular tick on subordinate beats (800 Hz)
    osc.frequency.setValueAtTime(isAccent ? 1600 : 800, time);
    osc.type = 'triangle';

    const peakGain = isAccent ? this.volume : this.volume * 0.65;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peakGain, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private nextNote() {
    const config = TIME_SIGNATURE_CONFIGS[this.timeSignature];
    // Calculate seconds per beat
    const secondsPerBeat = (60.0 / this.bpm) * (4.0 / config.beatUnit);
    this.nextBeatTime += secondsPerBeat;
    this.currentBeatInMeasure = (this.currentBeatInMeasure + 1) % config.beatsPerMeasure;
  }

  private scheduler = () => {
    if (!this.ctx || !this.isRunning) return;

    const scheduleAheadTime = 0.1; // Schedule 100ms in advance
    const config = TIME_SIGNATURE_CONFIGS[this.timeSignature];

    while (this.nextBeatTime < this.ctx.currentTime + scheduleAheadTime) {
      const isAccent = this.currentBeatInMeasure === 0;
      const scheduledBeat = this.currentBeatInMeasure;
      const scheduledTime = this.nextBeatTime;

      this.scheduleClick(scheduledTime, isAccent);

      // Trigger UI callback when beat hits
      const timeUntilBeat = Math.max(0, (scheduledTime - this.ctx.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.isRunning) {
          this.onBeatCallbacks.forEach((cb) => cb(scheduledBeat, config.beatsPerMeasure));
        }
      }, timeUntilBeat);

      this.nextNote();
    }

    if (this.isRunning) {
      this.timerId = window.setTimeout(this.scheduler, 25);
    }
  };

  public start() {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.isRunning = true;
    this.currentBeatInMeasure = 0;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBeatInMeasure = 0;
    const config = TIME_SIGNATURE_CONFIGS[this.timeSignature];
    this.onBeatCallbacks.forEach((cb) => cb(0, config.beatsPerMeasure));
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
    } else {
      this.start();
    }
    return this.isRunning;
  }
}

export const metronome = new MetronomeEngine();
