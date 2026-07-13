// A blocking modal asking the player to confirm/adjust sound before they
// start playing. Two purposes at once:
//  1. UX — sound state is an explicit choice, not a silent guess.
//  2. Technical — tapping ANY button in this modal is a direct, synchronous
//     user gesture on a real DOM event, which is the most reliable place to
//     resume a suspended AudioContext (more reliable than a passive
//     document-level listener that might not catch the very first tap).
import { isTouchDevice } from "../systems/platform.js";
import { initAudioUnlock, getAudioCtx, SFX } from "../systems/audio.js";
import { Save } from "../systems/save.js";

const SEEN_KEY = "nati_beni_sound_intro_seen_v1";

/** Call from a scene's create(). Shows once ever, per browser, and only on touch devices (desktop's click-to-play already reliably unlocks audio). */
export function maybeShowSoundSetup(scene) {
  if (!isTouchDevice) return;
  try {
    if (localStorage.getItem(SEEN_KEY)) return;
  } catch (e) {}
  showSoundSetupModal(scene);
}

/** Shows the modal unconditionally — used by the "Sound Setup" button in Settings to let players reopen it any time. */
export function showSoundSetupModal(scene) {
  const width = scene.scale.width;
  const height = scene.scale.height;
  const cx = width / 2;
  const cy = height / 2;
  const depth = 5000;

  let save;
  try {
    save = Save.current();
  } catch (e) {
    save = { settings: { sfxVolume: 1, musicVolume: 0.75 } };
  }

  const elements = [];
  const add = (obj) => { elements.push(obj); return obj; };

  add(scene.add.rectangle(cx, cy, width, height, 0x000000, 0.72).setScrollFactor(0).setDepth(depth).setInteractive());

  const cardW = Math.min(420, width - 40);
  const cardH = Math.min(260, height - 40);
  const card = scene.add.graphics().setScrollFactor(0).setDepth(depth + 1);
  card.fillStyle(0x101025, 0.98);
  card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 18);
  card.lineStyle(2, 0x66ccff, 0.85);
  card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 18);
  add(card);

  add(scene.add.text(cx, cy - cardH / 2 + 34, "🔊 Sound Settings", { fontSize: "22px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2));
  add(scene.add.text(cx, cy - cardH / 2 + 66, "This game has music and sound effects.\nTap below to turn them on or off — you can fine-tune\nthe volume of each separately in Settings later.", { fontSize: "13px", fill: "#ddd", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2));

  const unlock = () => {
    initAudioUnlock();
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) {}
  };

  const isOn = () => save.settings.sfxVolume > 0 || save.settings.musicVolume > 0;
  const toggleLabel = () => `Sound: ${isOn() ? "ON" : "OFF"}`;
  const toggleBtn = add(
    scene.add.text(cx, cy - 4, toggleLabel(), { fontSize: "20px", fill: "#fff", backgroundColor: "#222244", padding: { x: 16, y: 8 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true })
  );
  toggleBtn.on("pointerdown", () => {
    unlock();
    const turningOn = !isOn();
    save.settings.sfxVolume = turningOn ? 1 : 0;
    save.settings.musicVolume = turningOn ? 0.75 : 0;
    try { Save.persist(); } catch (e) {}
    toggleBtn.setText(toggleLabel());
    if (turningOn) SFX.uiClick();
  });

  const close = () => {
    unlock();
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    elements.forEach((el) => el.destroy());
  };

  const closeBtn = add(
    scene.add.text(cx, cy + cardH / 2 - 36, "[ Continue ]", { fontSize: "18px", fill: "#00ff88", fontStyle: "bold" })
      .setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true })
  );
  closeBtn.on("pointerdown", close);

  return elements;
}
