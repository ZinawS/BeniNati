// All sound is synthesized with the Web Audio API — no audio asset files, so the
// game runs from a static folder with zero downloads. This module also owns the
// autoplay-restriction workaround: browsers (especially mobile Safari) start every
// AudioContext "suspended" until a real user gesture unlocks it, which is the most
// common reason web-game audio silently does nothing on a phone.
import { Save } from "./save.js";

let audioCtx = null;

export function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

/**
 * Attaches one-time listeners for the first pointer/touch/key event anywhere on
 * the page and uses it to create + resume the AudioContext, plus play a silent
 * buffer (the standard iOS Safari unlock trick — resume() alone isn't always
 * enough on iOS unless a sound is actually started inside the gesture handler).
 * Call this once at startup; it doesn't depend on any particular menu button.
 */
export function initAudioUnlock() {
  const unlock = () => {
    if (isUnlocked()) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (e) {}
  };
  // Listen on both document AND the game container directly: some mobile
  // browsers' touch handling on a canvas doesn't reliably bubble the way a
  // plain page click does, so this isn't attached in just one place. Not
  // `{ once: true }` — a suspended context can re-suspend on mobile (e.g.
  // backgrounding the tab), so every subsequent gesture retries too.
  const targets = [document, document.getElementById("game-container")].filter(Boolean);
  targets.forEach((target) => {
    ["pointerdown", "touchstart", "keydown"].forEach((evt) => {
      target.addEventListener(evt, unlock, { passive: true });
    });
  });
}

/** True once the AudioContext has actually reached the "running" state. */
export function isUnlocked() {
  return !!audioCtx && audioCtx.state === "running";
}

/** 0-1 volume level for "sfx" or "music", independently controllable in Settings. */
function getVolume(kind) {
  try {
    const v = Save.current().settings[kind + "Volume"];
    return typeof v === "number" ? v : 1;
  } catch (e) {
    return 1; // no active profile yet (e.g. main menu) — default to full volume
  }
}

function beep(freq, duration, type = "square", volume = 0.15, delay = 0) {
  const level = getVolume("sfx");
  if (level <= 0) return;
  try {
    const ctx = getAudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t0 = ctx.currentTime + delay;
    gain.gain.setValueAtTime(volume * level, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration);
  } catch (e) {}
}

export const SFX = {
  jump: () => beep(520, 0.12, "square", 0.12),
  ring: () => beep(1200, 0.08, "sine", 0.1),
  hurt: () => beep(150, 0.3, "sawtooth", 0.15),
  spring: () => beep(300, 0.15, "triangle", 0.15),
  dash: () => beep(700, 0.1, "sawtooth", 0.12),
  enemyDefeat: () => beep(900, 0.15, "square", 0.15),
  bossHit: () => { beep(200, 0.2, "square", 0.2); beep(100, 0.25, "sawtooth", 0.2, 0.05); },
  bossDefeat: () => [400, 600, 800, 1000, 1300].forEach((f, i) => beep(f, 0.2, "square", 0.15, i * 0.1)),
  goal: () => [500, 700, 900].forEach((f, i) => beep(f, 0.15, "sine", 0.15, i * 0.08)),
  fire: () => { beep(80, 0.4, "sawtooth", 0.18); beep(55, 0.45, "square", 0.14, 0.08); },
  transform: () => [600, 900, 1200, 1600, 2000].forEach((f, i) => beep(f, 0.25, "sine", 0.18, i * 0.09)),
  achievement: () => [700, 1000, 1400].forEach((f, i) => beep(f, 0.18, "triangle", 0.16, i * 0.07)),
  uiClick: () => beep(440, 0.05, "triangle", 0.08),
  uiHover: () => beep(660, 0.03, "sine", 0.04),
  land: () => beep(110, 0.08, "sine", 0.1),
};

export function vibrate(duration = 200, weak = 0.4, strong = 0.6) {
  try {
    const pad = navigator.getGamepads && navigator.getGamepads()[0];
    if (pad && pad.vibrationActuator) {
      pad.vibrationActuator.playEffect("dual-rumble", { duration, weakMagnitude: weak, strongMagnitude: strong });
    }
  } catch (e) {}
}

// ----------------------- Adaptive soundtrack -----------------------
// A real generative loop per world (no audio files) instead of a static pad:
// a plucked arpeggio (melody), a pulsing bass note, and light percussion
// (noise "hat" + synthesized "kick"), all precision-scheduled against the
// AudioContext clock rather than setTimeout'd individually (the standard
// technique for drift-free Web Audio rhythm — see Chris Wilson's "A Tale of
// Two Clocks"). Each world has its own root note, scale, and tempo so it
// sounds distinct; setBossIntensity(true) speeds the tempo up and thickens
// the percussion for boss fights, picked up at the start of the next loop
// rather than jarring the timing mid-bar.
function semitoneToFreq(root, semitones) {
  return root * Math.pow(2, semitones / 12);
}

const MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
const MINOR_PENTATONIC = [0, 3, 5, 7, 10];
const NATURAL_MINOR = [0, 2, 3, 5, 7, 8, 10];

const THEME_CONFIGS = [
  { root: 261.63, scale: MAJOR_PENTATONIC, tempo: 128 }, // Green Hills
  { root: 293.66, scale: MAJOR_PENTATONIC, tempo: 118 }, // Ocean Kingdom
  { root: 220.0, scale: MINOR_PENTATONIC, tempo: 110 }, // Snow Mountains
  { root: 329.63, scale: MAJOR_PENTATONIC, tempo: 142 }, // Sky Kingdom
  { root: 174.61, scale: MINOR_PENTATONIC, tempo: 132 }, // Volcano World
  { root: 246.94, scale: NATURAL_MINOR, tempo: 100 }, // Crystal Cave
  { root: 196.0, scale: NATURAL_MINOR, tempo: 92 }, // Haunted Forest
  { root: 233.08, scale: MINOR_PENTATONIC, tempo: 136 }, // Cyber City
  { root: 164.81, scale: NATURAL_MINOR, tempo: 124 }, // Cogsworth's Fortress
];

const ARP_PATTERN = [0, 2, 4, 2, 1, 4, 3, 2];
const BASS_PATTERN = [0, -1, -1, -1, 0, -1, 2, -1]; // -1 = rest

class MusicSystem {
  constructor() {
    this.master = null;
    this.config = null;
    this.playing = false;
    this.intense = false;
    this.timer = null;
    this.noiseBuffer = null;
  }

  playTheme(themeIndex) {
    this.stop(0.4);
    const level = getVolume("music");
    if (level <= 0) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      this.config = THEME_CONFIGS[themeIndex % THEME_CONFIGS.length];
      this.master = ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(ctx.destination);
      this.master.gain.setTargetAtTime(0.55 * level, ctx.currentTime, 1.0);
      this.playing = true;
      this._scheduleLoop();
    } catch (e) {}
  }

  /** Picked up at the start of the next loop, not forced mid-bar — avoids an audible timing jump. */
  setBossIntensity(active) {
    this.intense = active;
    if (this.master) {
      const ctx = getAudioCtx();
      const level = getVolume("music");
      this.master.gain.setTargetAtTime((active ? 0.68 : 0.55) * level, ctx.currentTime, 0.8);
    }
  }

  _noise(ctx) {
    if (this.noiseBuffer) return this.noiseBuffer;
    const len = Math.floor(ctx.sampleRate * 0.2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
    return buf;
  }

  _pluck(ctx, freq, time, dur, vol, type) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain).connect(this.master);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  _hat(ctx, time, vol) {
    const noise = ctx.createBufferSource();
    noise.buffer = this._noise(ctx);
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 6000;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    noise.connect(filter).connect(gain).connect(this.master);
    noise.start(time);
    noise.stop(time + 0.06);
  }

  _kick(ctx, time) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain).connect(this.master);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  _scheduleLoop() {
    if (!this.playing || !this.master || !this.config) return;
    const ctx = getAudioCtx();
    const cfg = this.config;
    const bpm = cfg.tempo * (this.intense ? 1.15 : 1);
    const stepDur = 60 / bpm / 2; // 8th notes
    const steps = ARP_PATTERN.length;
    const startTime = ctx.currentTime + 0.05;

    for (let i = 0; i < steps; i++) {
      const t = startTime + i * stepDur;

      const leadDeg = cfg.scale[ARP_PATTERN[i] % cfg.scale.length];
      this._pluck(ctx, semitoneToFreq(cfg.root * 2, leadDeg), t, stepDur * 0.85, 0.09, "sine");

      const bassStep = BASS_PATTERN[i];
      if (bassStep >= 0) {
        const bassDeg = cfg.scale[bassStep % cfg.scale.length];
        this._pluck(ctx, semitoneToFreq(cfg.root / 2, bassDeg), t, stepDur * 1.6, 0.13, "triangle");
      }

      if (this.intense || i % 2 === 0) this._hat(ctx, t, this.intense ? 0.05 : 0.03);
      if (i === 0 || (this.intense && i === 4)) this._kick(ctx, t);
    }

    const loopMs = steps * stepDur * 1000;
    this.timer = setTimeout(() => this._scheduleLoop(), Math.max(50, loopMs - 30));
  }

  stop(fadeSeconds = 0.6) {
    this.playing = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.master) return;
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const master = this.master;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, fadeSeconds / 3);
      setTimeout(() => { try { master.disconnect(); } catch (e) {} }, (fadeSeconds + 0.5) * 1000);
    } catch (e) {}
    this.master = null;
  }
}

export const Music = new MusicSystem();
