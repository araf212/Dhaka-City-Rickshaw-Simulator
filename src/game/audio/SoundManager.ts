/**
 * 100% Procedural Web Audio API sound generator for Dhaka Rickshaw Simulator.
 * Zero external audio files; pure synthesis with low latency & authentic soundscape.
 */

export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private tireNoiseNode: AudioBufferSourceNode | null = null;
  private tireGain: GainNode | null = null;
  private rainNoiseNode: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private lastPedalTime: number = 0;

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
      this.startContinuousAmbience();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startContinuousAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Procedural tire road noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const tireFilter = this.ctx.createBiquadFilter();
    tireFilter.type = 'lowpass';
    tireFilter.frequency.value = 350;

    this.tireGain = this.ctx.createGain();
    this.tireGain.gain.value = 0.0;

    const tireSource = this.ctx.createBufferSource();
    tireSource.buffer = noiseBuffer;
    tireSource.loop = true;
    tireSource.connect(tireFilter);
    tireFilter.connect(this.tireGain);
    this.tireGain.connect(this.masterGain);
    tireSource.start();
    this.tireNoiseNode = tireSource;

    // 2. Procedural rain buffer
    const rainBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const rainData = rainBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      rainData[i] = (lastOut + 0.02 * white) / 1.02; // Pink-like noise
      lastOut = rainData[i];
    }

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 1200;
    rainFilter.Q.value = 0.7;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = rainBuffer;
    rainSource.loop = true;
    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();
    this.rainNoiseNode = rainSource;
  }

  /**
   * Authentic Dhaka Rickshaw Bell: "Tring-tring!"
   * High-pitched resonant brass clapper chime with quick double ring
   */
  public ringRickshawBell(bellType: 'classic_brass' | 'double_ding' | 'electric_horn' = 'classic_brass') {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    if (bellType === 'electric_horn') {
      // Modern electric buzzer horn
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.setValueAtTime(460, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.26);
      return;
    }

    // Classic brass rickshaw bell with rapid double ding
    const strikes = bellType === 'double_ding' ? [0, 0.08, 0.16] : [0, 0.09];
    const freqs = [2400, 2800, 3300];

    strikes.forEach((delay, idx) => {
      const strikeTime = now + delay;
      freqs.forEach((f, fIdx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const pitchJitter = (idx % 2 === 0 ? 1 : 1.05) * (1 + fIdx * 0.02);
        osc.frequency.setValueAtTime(f * pitchJitter, strikeTime);

        gain.gain.setValueAtTime(0.22 / (fIdx + 1), strikeTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(strikeTime);
        osc.stop(strikeTime + 0.3);
      });
    });
  }

  /**
   * Pedal sprocket / chain click when pedaling
   */
  public triggerPedalClick(speedFactor: number) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const interval = Math.max(0.12, 0.35 - speedFactor * 0.2);
    if (now - this.lastPedalTime < interval) return;
    this.lastPedalTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.025);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Update rolling wheel sounds based on vehicle speed (0 to 1)
   */
  public updateSpeedSound(speedRatio: number) {
    if (!this.tireGain || !this.ctx || this.isMuted) return;
    const targetGain = Math.min(0.25, speedRatio * 0.2);
    this.tireGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  /**
   * Dhaka traffic horn (CNG baby-taxi or bus)
   */
  public playTrafficHorn(type: 'cng' | 'bus' | 'car') {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    if (type === 'cng') {
      // High-pitched 2-stroke buzzer horn
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.setValueAtTime(510, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'bus') {
      // Deep pneumatic air horn
      [220, 275].forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.42);
      });
    } else {
      // Standard car dual tone
      [440, 554].forEach((freq) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.22);
      });
    }
  }

  /**
   * Metro rail train passing rumble
   */
  public playMetroRumble() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 1.5);
    osc.frequency.exponentialRampToValueAtTime(50, now + 3.0);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.3);
  }

  /**
   * Update rain sound intensity (0 = none, 1 = heavy monsoon)
   */
  public setRainIntensity(intensity: number) {
    if (!this.rainGain || !this.ctx || this.isMuted) return;
    this.rainGain.gain.setTargetAtTime(intensity * 0.2, this.ctx.currentTime, 0.2);
  }

  /**
   * Fare collected / mission success coin chime
   */
  public playCashEarned() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.32);
    });
  }

  /**
   * Collision thud
   */
  public playCollisionSound(intensity: number = 1.0) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    gain.gain.setValueAtTime(Math.min(0.4, 0.2 * intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export const soundManager = new SoundManager();
