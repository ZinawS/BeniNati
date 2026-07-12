import { Save } from "../systems/save.js";
import { Music } from "../systems/audio.js";
import { makeButton, sceneTransition, fadeInScene, screenAnchors } from "../ui/uiHelpers.js";
import { showSoundSetupModal } from "../ui/soundSetupModal.js";

export class Settings extends Phaser.Scene {
  constructor() { super("Settings"); }

  create() {
    fadeInScene(this);
    const save = Save.current();
    const { cx, height } = screenAnchors(this);
    this.add.text(cx, height * 0.09, "SETTINGS", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const toggle = (y, key, label, desc, color = "#fff") => {
      const text = () => `${label}: ${save.settings[key] ? "ON" : "OFF"}`;
      const btn = makeButton(this, cx, y, text(), () => {
        save.settings[key] = !save.settings[key];
        Save.persist();
        btn.setText(text());
        if (key === "music" && !save.settings.music) Music.stop();
        if (key === "music" && save.settings.music) Music.playTheme(0);
      }, { fontSize: "20px", color });
      this.add.text(cx, y + 24, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
    };

    toggle(height * 0.27, "encouragement", "Encouraging Messages", "Friendly tips shown when you respawn after a mistake.");
    toggle(height * 0.42, "sfx", "Sound Effects", "Jump, rings, hits, boss cues.");
    toggle(height * 0.57, "music", "Music", "Ambient background music while playing.");

    makeButton(this, cx, height * 0.7, "[ Sound Setup ]", () => showSoundSetupModal(this), { fontSize: "15px", color: "#66ccff" });

    if (save.gameCompleted) {
      const nmLabel = () => `Nightmare Mode: ${save.nightmareMode ? "ON" : "OFF"}`;
      const nmBtn = makeButton(this, cx, height * 0.82, nmLabel(), () => {
        save.nightmareMode = !save.nightmareMode;
        Save.persist();
        nmBtn.setText(nmLabel());
      }, { fontSize: "18px", color: "#ff6666" });
    }

    makeButton(this, cx, height - 30, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
  }
}
