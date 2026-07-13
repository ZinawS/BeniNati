// A persistent, always-tappable speaker icon. Two jobs:
//  1. A guaranteed-fresh unlock attempt on every tap — tapping a Phaser game
//     object's pointerdown handler directly, synchronously, inside the
//     browser's own gesture-handling stack is about as reliable a place as
//     exists to resume a suspended AudioContext, so this acts as a manual
//     fallback if the passive document-level listeners in systems/audio.js
//     didn't catch the very first interaction for some reason.
//  2. A visible mute/unmute toggle, so sound state is never a silent mystery.
import { isUnlocked, initAudioUnlock, getAudioCtx, SFX } from "../systems/audio.js";
import { Save } from "../systems/save.js";

export function addSoundIndicator(scene, x = 764, y = 24) {
  const icon = scene.add.text(x, y, "🔈", { fontSize: "22px" })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(2000)
    .setInteractive({ useHandCursor: true });

  const muted = () => {
    try {
      const s = Save.current().settings;
      return (s.sfxVolume || 0) <= 0 && (s.musicVolume || 0) <= 0;
    } catch (e) {
      return false;
    }
  };

  const refresh = () => {
    if (!isUnlocked()) icon.setText("🔇");
    else icon.setText(muted() ? "🔈" : "🔊");
  };

  icon.on("pointerdown", () => {
    initAudioUnlock();
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
    } catch (e) {}
    try {
      const save = Save.current();
      const nowMuted = !muted();
      save.settings.sfxVolume = nowMuted ? 0 : 1;
      save.settings.musicVolume = nowMuted ? 0 : 0.75;
      Save.persist();
      if (!nowMuted) SFX.uiClick();
    } catch (e) {}
    scene.tweens.add({ targets: icon, scale: 1.3, duration: 90, yoyo: true });
    refresh();
  });

  refresh();
  const timer = scene.time.addEvent({ delay: 800, loop: true, callback: refresh });
  scene.events.once("shutdown", () => timer.remove());

  return icon;
}
