/**
 * Web Audio API synthesizer for tactile lunar key clicks and calculation chimes
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Sound enabled by default, user can mute
    try {
      const saved = localStorage.getItem('lunar_calc_sound');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      // LocalStorage might be restricted
    }
  }

  public setEnabled(value: boolean) {
    this.enabled = value;
    try {
      localStorage.setItem('lunar_calc_sound', String(value));
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Subtle soft tactile click for numbers and operators
   */
  public playClick(type: 'digit' | 'operator' | 'action' | 'equals' = 'digit') {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      let freq = 600;
      let duration = 0.04;

      if (type === 'operator') {
        freq = 820;
        duration = 0.05;
      } else if (type === 'action') {
        freq = 420;
        duration = 0.06;
      } else if (type === 'equals') {
        this.playSuccessChime();
        return;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + duration);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // audio fail-safe
    }
  }

  /**
   * Ethereal starry harmonic chime when calculation completes successfully
   */
  public playSuccessChime() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = now + idx * 0.04;
        const duration = 0.22;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.035, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // audio fail-safe
    }
  }

  /**
   * Low soft chime when an error occurs
   */
  public playError() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // fail-safe
    }
  }
}

export const soundEffects = new SoundEffectsManager();
