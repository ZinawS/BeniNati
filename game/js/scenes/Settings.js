import { Save } from "../systems/save.js";
import { Music } from "../systems/audio.js";
import { makeButton, sceneTransition, fadeInScene } from "../ui/uiHelpers.js";

export class Settings extends Phaser.Scene {
  constructor() { super("Settings"); }

  create() {
    fadeInScene(this);
    const save = Save.current();
    this.add.text(400, 50, "SETTINGS", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const toggle = (y, key, label, desc, color = "#fff") => {
      const text = () => `${label}: ${save.settings[key] ? "ON" : "OFF"}`;
      const btn = makeButton(this, 400, y, text(), () => {
        save.settings[key] = !save.settings[key];
        Save.persist();
        btn.setText(text());
        if (key === "music" && !save.settings.music) Music.stop();
        if (key === "music" && save.settings.music) Music.playTheme(0);
      }, { fontSize: "20px", color });
      this.add.text(400, y + 26, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
    };

    toggle(150, "encouragement", "Encouraging Messages", "Friendly tips shown when you respawn after a mistake.");
    toggle(230, "sfx", "Sound Effects", "Jump, rings, hits, boss cues.");
    toggle(310, "music", "Music", "Ambient background music while playing.");

    if (save.gameCompleted) {
      const nmLabel = () => `Nightmare Mode: ${save.nightmareMode ? "ON" : "OFF"}`;
      const nmBtn = makeButton(this, 400, 400, nmLabel(), () => {
        save.nightmareMode = !save.nightmareMode;
        Save.persist();
        nmBtn.setText(nmLabel());
      }, { fontSize: "20px", color: "#ff6666" });
      this.add.text(400, 426, "Faster enemies and tougher bosses. Unlocked by finishing the story!", { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
    } else {
      this.add.text(400, 400, "Nightmare Mode unlocks after you complete the whole story!", { fontSize: "13px", fill: "#666" }).setOrigin(0.5);
    }

    makeButton(this, 400, 560, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
  }
}
