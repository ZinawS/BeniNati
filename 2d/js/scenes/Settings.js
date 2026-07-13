import { Save } from "../systems/save.js";
import { Music } from "../systems/audio.js";
import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";
import { showSoundSetupModal } from "../ui/soundSetupModal.js";

const VOLUME_STEPS = [1, 0.75, 0.5, 0.25, 0];
function volumeBar(level) {
  const filled = Math.round(level * 5);
  return "■".repeat(filled) + "□".repeat(5 - filled);
}

export class Settings extends Phaser.Scene {
  constructor() { super("Settings"); }

  create() {
    fadeInScene(this);
    autoRelayoutOnResize(this);
    const save = Save.current();
    const { cx, height, safeBottom } = screenAnchors(this);
    this.add.text(cx, height * 0.09, "SETTINGS", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const toggle = (y, key, label, desc, color = "#fff") => {
      const text = () => `${label}: ${save.settings[key] ? "ON" : "OFF"}`;
      const btn = makeButton(this, cx, y, text(), () => {
        save.settings[key] = !save.settings[key];
        Save.persist();
        btn.setText(text());
      }, { fontSize: "20px", color });
      this.add.text(cx, y + 24, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
    };

    /** Tap to cycle 100% -> 75% -> 50% -> 25% -> 0% -> 100%, with a filled/empty block bar for an at-a-glance level. */
    const volumeControl = (y, settingsKey, label, desc, color = "#fff") => {
      const text = () => `${label}: ${volumeBar(save.settings[settingsKey])} ${Math.round(save.settings[settingsKey] * 100)}%`;
      const btn = makeButton(this, cx, y, text(), () => {
        const idx = VOLUME_STEPS.indexOf(save.settings[settingsKey]);
        const next = VOLUME_STEPS[(idx === -1 ? 0 : idx + 1) % VOLUME_STEPS.length];
        save.settings[settingsKey] = next;
        Save.persist();
        btn.setText(text());
        if (settingsKey === "musicVolume") {
          if (next <= 0) Music.stop();
          else Music.playTheme(0);
        }
      }, { fontSize: "18px", color });
      this.add.text(cx, y + 24, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
    };

    volumeControl(height * 0.24, "sfxVolume", "Sound Effects", "Jump, rings, hits, boss cues — tap to cycle the volume.");
    volumeControl(height * 0.39, "musicVolume", "Music", "Background soundtrack — tap to cycle the volume, independent of sound effects.");
    toggle(height * 0.54, "encouragement", "Encouraging Messages", "Friendly tips shown when you respawn after a mistake.");

    makeButton(this, cx, height * 0.67, "[ Sound Setup ]", () => showSoundSetupModal(this), { fontSize: "15px", color: "#66ccff" });

    if (save.gameCompleted) {
      const nmLabel = () => `Nightmare Mode: ${save.nightmareMode ? "ON" : "OFF"}`;
      const nmBtn = makeButton(this, cx, height * 0.8, nmLabel(), () => {
        save.nightmareMode = !save.nightmareMode;
        Save.persist();
        nmBtn.setText(nmLabel());
      }, { fontSize: "18px", color: "#ff6666" });
    }

    makeButton(this, cx, safeBottom - 30, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
  }
}
