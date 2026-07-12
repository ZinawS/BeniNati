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

function isEnabled(kind) {
  try {
    return Save.current().settings[kind] !== false;
  } catch (e) {
    return true; // no active profile yet (e.g. main menu) — default to on
  }
}

function beep(freq, duration, type = "square", volume = 0.15, delay = 0) {
  if (!isEnabled("sfx")) return;
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
    gain.gain.setValueAtTime(volume, t0);
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

// ----------------------- Adaptive ambient music -----------------------
// A continuous generative pad (no audio files): two detuned sine oscillators a
// fifth apart, slow LFO on the master gain for movement, one root frequency per
// world theme so each world sounds distinct. setBossIntensity(true) layers in a
// rhythmic pulse for boss fights; everything crossfades rather than cutting.
const THEME_ROOTS = [130.81, 196.0, 174.61, 220.0, 98.0, 146.83, 110.0, 164.81, 87.31];

class MusicSystem {
  constructor() {
    this.nodes = null;
    this.pulse = null;
  }

  playTheme(themeIndex) {
    this.stop(0.4);
    if (!isEnabled("music")) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const root = THEME_ROOTS[themeIndex % THEME_ROOTS.length];

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = root;
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = root * 1.5;
      osc2.detune.value = 4;

      const g1 = ctx.createGain(); g1.gain.value = 0.05;
      const g2 = ctx.createGain(); g2.gain.value = 0.035;
      osc1.connect(g1).connect(master);
      osc2.connect(g2).connect(master);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain).connect(master.gain);

      osc1.start(); osc2.start(); lfo.start();
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2);

      this.nodes = { ctx, master, osc1, osc2, lfo };
    } catch (e) {}
  }

  setBossIntensity(active) {
    if (!this.nodes) return;
    const { ctx, master, osc1 } = this.nodes;
    try {
      if (active && !this.pulse) {
        const pulseOsc = ctx.createOscillator();
        pulseOsc.type = "sawtooth";
        pulseOsc.frequency.value = osc1.frequency.value / 2;
        const pulseGain = ctx.createGain();
        pulseGain.gain.value = 0;
        pulseOsc.connect(pulseGain).connect(master);

        const gate = ctx.createOscillator();
        gate.type = "square";
        gate.frequency.value = 2;
        const gateGain = ctx.createGain();
        gateGain.gain.value = 0.04;
        gate.connect(gateGain).connect(pulseGain.gain);

        pulseOsc.start();
        gate.start();
        this.pulse = { pulseOsc, gate };
      } else if (!active && this.pulse) {
        const stopAt = ctx.currentTime + 0.3;
        this.pulse.pulseOsc.stop(stopAt);
        this.pulse.gate.stop(stopAt);
        this.pulse = null;
      }
    } catch (e) {}
  }

  stop(fadeSeconds = 0.6) {
    if (!this.nodes) return;
    const { ctx, master, osc1, osc2, lfo } = this.nodes;
    try {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, fadeSeconds / 3);
      const stopAt = now + fadeSeconds;
      [osc1, osc2, lfo].forEach((o) => { try { o.stop(stopAt); } catch (e) {} });
      if (this.pulse) {
        try { this.pulse.pulseOsc.stop(stopAt); this.pulse.gate.stop(stopAt); } catch (e) {}
        this.pulse = null;
      }
    } catch (e) {}
    this.nodes = null;
  }
}

export const Music = new MusicSystem();
