import {HZ, BPM} from './engine.js';
import {INTRO_SECONDS, arrangementAtStep, voicesForEvent} from './music-score.js';

/**
 * Original procedural soundtrack for FERCHODOGGS DASH 3. No samples, third-party
 * melodies or level audio. A beat is exactly HZ * 60 / BPM simulation ticks.
 * The synth is silent until unlocked by UI Play or ♪. UI defaults to sound on after Play; remembered mute is respected. Listening/device QA is still pending.
 */
export const AUDIO_BPM = BPM;
export const BEAT_TICKS = HZ * 60 / BPM;
const STEP_TICKS = BEAT_TICKS / 4;
export {INTRO_SECONDS};
const EFFECTS = new Set(['jump','land','coin','pad','orb','portal','death']);
const validTick = tick => Number.isSafeInteger(tick) && tick >= 0 ? tick : 0;

export class PulseMusic {
  constructor(options = {}) {
    this.enabled = false;
    this.running = false;
    this.paused = false;
    this.disposed = false;
    this.tick = 0;
    this.context = null;
    this.master = null;
    this.noise = null;
    this.timer = null;
    this.anchor = 0;
    this.nextStep = 0;
    this.transportOffsetTicks = 0;
    this.hasStarted = false;
    this.voices = new Set();
    this.Context = Object.hasOwn(options, 'AudioContext') ? options.AudioContext : globalThis.AudioContext || globalThis.webkitAudioContext;
    this.interval = options.setInterval || globalThis.setInterval.bind(globalThis);
    this.clearInterval = options.clearInterval || globalThis.clearInterval.bind(globalThis);
  }

  get bpm() { return BPM; }

  /** Call inside the Play or ♪ user gesture. A blocked audio device never blocks play. */
  async setEnabled(value) {
    if (this.disposed) return false;
    this.enabled = Boolean(value);
    if (!this.enabled) { this._silence(); return false; }
    try {
      if (!this.Context) return false;
      if (!this.context) {
        this.context = new this.Context();
        this.master = this.context.createGain();
        this.master.gain.value = .22;
        this.master.connect(this.context.destination);
        if (this.context.createBuffer) {
          this.noise = this.context.createBuffer(1, Math.round(this.context.sampleRate * .24), this.context.sampleRate);
          const data = this.noise.getChannelData(0);
          let seed = 104729;
          for (let i = 0; i < data.length; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            data[i] = seed / 2147483648 - 1;
          }
        }
      }
      const context = this.context;
      if (context.state === 'suspended') await context.resume();
      if (this.disposed || !this.enabled || context !== this.context) return false;
      if (this._ready() && this.running && !this.paused) this._align(this.tick);
      return this._ready();
    } catch { return false; }
  }

  start(tick = 0) {
    if (this.disposed) return;
    const nextTick=validTick(tick),resume=this.paused;
    // Intro belongs to the first attempt of this open session. Rapid retries
    // enter the mix immediately, while pause/resume retains the current phase.
    if(this.hasStarted&&!resume&&nextTick===0)this.transportOffsetTicks=INTRO_SECONDS*HZ;
    this._silence();
    this.tick = nextTick;
    this.hasStarted = true;
    this.running = true;
    this.paused = false;
    if (this._ready()) this._align(this.tick);
  }

  /** Keep beat phase attached to the fixed-step clock, never the render frame rate. */
  sync(tick) {
    this.tick = validTick(tick);
    if (!this._ready() || !this.running || this.paused) return;
    const drift = this.context.currentTime - this.anchor - (this.tick+this.transportOffsetTicks) / HZ;
    if (Math.abs(drift) > .075) this._align(this.tick);
  }

  pause() {
    if (this.disposed) return;
    this.paused = true;
    this._silence();
  }

  stop({resetTransport=true}={}) {
    this.running = false;
    this.paused = false;
    this.tick = 0;
    this._silence();
    if(resetTransport)this.resetTransport();
  }

  resetTransport(){this.transportOffsetTicks=0;this.hasStarted=false;}

  /** Effects are feedback for real engine events; they do not influence physics. */
  effect(type) {
    if (!EFFECTS.has(type)) return;
    if (type === 'death') this.stop({resetTransport:false});
    if(!this._ready())return;
    const t = this.context.currentTime + .003;
    if (type === 'jump') this._tone(280, 610, t, .095, .08, 'sine', 'effect');
    if (type === 'land') this._noise(t, .035, .045, 1300, 'effect');
    if (type === 'coin') {
      this._tone(987.766603, 987.766603, t, .055, .065, 'sine', 'effect');
      this._tone(1480, 1480, t + .055, .10, .045, 'sine', 'effect');
    }
    if (type === 'pad') this._tone(180, 880, t, .15, .095, 'triangle', 'effect');
    if (type === 'orb') {
      this._tone(440, 880, t, .10, .06, 'sine', 'effect');
      this._tone(659.255114, 1318.510228, t + .025, .13, .04, 'sine', 'effect');
    }
    if (type === 'portal') {
      this._tone(220, 660, t, .18, .07, 'triangle', 'effect');
      this._tone(329.627557, 987.766603, t + .04, .16, .045, 'sine', 'effect');
    }
    if (type === 'death') {
      this._tone(260, 45, t, .25, .12, 'triangle', 'effect');
      this._noise(t, .075, .07, 900, 'effect');
    }
  }

  async dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    this.enabled = false;
    const context = this.context;
    this.master?.disconnect();
    this.master = null;
    this.noise = null;
    this.context = null;
    try { if (context && context.state !== 'closed') await context.close(); } catch { /* Device removed. */ }
  }

  _ready() { return this.enabled && !this.disposed && this.context?.state === 'running' && !!this.master; }

  _align(tick) {
    this._clearTimer();
    this._stopVoices('music');
    const songTick=tick+this.transportOffsetTicks;
    this.anchor = this.context.currentTime - songTick / HZ;
    this.nextStep = Math.ceil(songTick / STEP_TICKS);
    this._pump();
    if (this._ready() && this.running && !this.paused) this.timer = this.interval(() => this._pump(), 25);
  }

  _pump() {
    if (!this._ready() || !this.running || this.paused) return;
    const now = this.context.currentTime;
    const logicalStep = (now - this.anchor) * HZ / STEP_TICKS;
    if (this.anchor + this.nextStep * STEP_TICKS / HZ < now - .035) this.nextStep = Math.ceil(logicalStep);
    let budget = 8;
    while (budget-- > 0) {
      const time = this.anchor + this.nextStep * STEP_TICKS / HZ;
      if (time > now + .12) break;
      this._beat(this.nextStep++, Math.max(time, now + .003));
    }
  }

  _beat(step, t) {
    for(const event of arrangementAtStep(step))for(const voice of voicesForEvent(event)){
      const at=t+(event.offset||0)+(voice.offset||0);
      if(voice.type==='noise')this._noise(at,voice.duration,voice.volume,voice.cutoff);
      else this._tone(voice.from,voice.to,at,voice.duration,voice.volume,voice.waveform,'music',voice.attack,voice.cutoff);
    }
  }

  _track(source, nodes, kind) {
    const voice = {source, nodes, kind};
    this.voices.add(voice);
    source.onended = () => {
      this.voices.delete(voice);
      try { source.disconnect(); nodes.forEach(node => node.disconnect()); } catch { /* Already disconnected. */ }
    };
    return voice;
  }

  _tone(from, to, t, duration, volume, type, kind = 'music',attack=.005,cutoff) {
    if (!this._ready() || this.voices.size >= 64) return;
    try {
      const source = this.context.createOscillator(), gain = this.context.createGain();
      source.type = type;
      source.frequency.setValueAtTime(from, t);
      source.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.min(.3, volume), t + Math.min(attack,duration*.5));
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      const nodes=[gain];
      if(cutoff&&this.context.createBiquadFilter){const filter=this.context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=cutoff;source.connect(filter);filter.connect(gain);nodes.push(filter);}else source.connect(gain);
      gain.connect(this.master);
      this._track(source, nodes, kind);
      source.start(t); source.stop(t + duration + .012);
    } catch { /* A failing device must not interrupt a jump. */ }
  }

  _noise(t, duration, volume, cutoff, kind = 'music') {
    if (!this._ready() || this.voices.size >= 64) return;
    if (!this.noise || !this.context.createBufferSource || !this.context.createBiquadFilter) {
      this._tone(cutoff, cutoff * .6, t, duration, volume * .35, 'triangle', kind);
      return;
    }
    try {
      const source = this.context.createBufferSource(), filter = this.context.createBiquadFilter(), gain = this.context.createGain();
      source.buffer = this.noise; filter.type = 'highpass'; filter.frequency.value = cutoff;
      gain.gain.setValueAtTime(Math.min(.3, volume), t);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      source.connect(filter); filter.connect(gain); gain.connect(this.master);
      this._track(source, [filter, gain], kind);
      source.start(t); source.stop(t + duration + .012);
    } catch { /* Optional percussion can fail without stopping music/play. */ }
  }

  _clearTimer() {
    if (this.timer !== null) this.clearInterval(this.timer);
    this.timer = null;
  }

  _stopVoices(kind) {
    for (const voice of this.voices) {
      if (kind && voice.kind !== kind) continue;
      voice.source.onended = null;
      try { voice.source.stop(); } catch { /* Already ended. */ }
      try { voice.source.disconnect(); voice.nodes.forEach(node => node.disconnect()); } catch { /* Already disconnected. */ }
      this.voices.delete(voice);
    }
  }

  _silence() { this._clearTimer(); this._stopVoices(); }
}
