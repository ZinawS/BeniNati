// All sound is synthesized with the Web Audio API — no audio asset files,
// so the game runs from a single static folder with zero downloads.
let audioCtx = null;

export function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep(freq, duration, type = "square", volume = 0.15, delay = 0) {
  try {
    const ctx = getAudioCtx();
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
};

export function vibrate(duration = 200, weak = 0.4, strong = 0.6) {
  try {
    const pad = navigator.getGamepads && navigator.getGamepads()[0];
    if (pad && pad.vibrationActuator) {
      pad.vibrationActuator.playEffect("dual-rumble", { duration, weakMagnitude: weak, strongMagnitude: strong });
    }
  } catch (e) {}
}
