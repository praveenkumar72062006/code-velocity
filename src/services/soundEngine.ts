// Web Audio API Procedural Sound Engine
// Zero external sound files needed, 0ms latency, 0 bandwidth, 100% free

export type SwitchSoundProfile = 'cherry_blue' | 'alpaca_linear' | 'typewriter' | 'lofi_synth' | 'off';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.5;
  private profile: SwitchSoundProfile = 'cherry_blue';
  private synthNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C major pentatonic
  private noteIndex = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setProfile(profile: SwitchSoundProfile) {
    this.profile = profile;
  }

  public getProfile(): SwitchSoundProfile {
    return this.profile;
  }

  public playKeystroke() {
    if (this.profile === 'off' || this.volume === 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    switch (this.profile) {
      case 'cherry_blue': {
        // High click + tactile bottom out
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);

        gain.gain.setValueAtTime(0.35 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.035);
        break;
      }

      case 'alpaca_linear': {
        // Deeper, smooth tactile "thump"
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.05);

        gain.gain.setValueAtTime(0.4 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }

      case 'typewriter': {
        // Mechanical clack with short noise burst
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.03);

        gain.gain.setValueAtTime(0.25 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
        break;
      }

      case 'lofi_synth': {
        // Melodic ambient pentatonic scale
        const freq = this.synthNotes[this.noteIndex % this.synthNotes.length];
        this.noteIndex = (this.noteIndex + 1) % this.synthNotes.length;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2 * this.volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }
    }
  }

  public playError() {
    if (this.volume === 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.setValueAtTime(95, t + 0.05);

    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playCountdown(isFinal: boolean = false) {
    if (this.volume === 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = isFinal ? 880 : 440; // High pitch for GO!
    osc.frequency.setValueAtTime(freq, t);

    const duration = isFinal ? 0.35 : 0.15;
    gain.gain.setValueAtTime(0.4 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  public playNitro() {
    if (this.volume === 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.45);

    gain.gain.setValueAtTime(0.35 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  public playVictory() {
    if (this.volume === 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }
}

export const soundEngine = new SoundEngine();
