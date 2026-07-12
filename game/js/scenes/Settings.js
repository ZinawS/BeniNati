import { Save } from "../systems/save.js";

export class Settings extends Phaser.Scene {
  constructor() { super("Settings"); }

  create() {
    const save = Save.current();
    this.add.text(400, 60, "SETTINGS", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const encLabel = () => `Encouraging Messages: ${save.settings.encouragement ? "ON" : "OFF"}`;
    const encText = this.add.text(400, 180, encLabel(), { fontSize: "20px", fill: "#fff" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    encText.on("pointerdown", () => {
      save.settings.encouragement = !save.settings.encouragement;
      Save.persist();
      encText.setText(encLabel());
    });
    this.add.text(400, 210, "Friendly tips shown when you respawn after a mistake.", { fontSize: "13px", fill: "#aaa" }).setOrigin(0.5);

    if (save.gameCompleted) {
      const nmLabel = () => `Nightmare Mode: ${save.nightmareMode ? "ON" : "OFF"}`;
      const nmText = this.add.text(400, 280, nmLabel(), { fontSize: "20px", fill: "#ff6666" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      nmText.on("pointerdown", () => {
        save.nightmareMode = !save.nightmareMode;
        Save.persist();
        nmText.setText(nmLabel());
      });
      this.add.text(400, 310, "Faster enemies and tougher bosses. Unlocked by finishing the story!", { fontSize: "13px", fill: "#aaa" }).setOrigin(0.5);
    } else {
      this.add.text(400, 280, "Nightmare Mode unlocks after you complete the whole story!", { fontSize: "14px", fill: "#666" }).setOrigin(0.5);
    }

    this.add.text(400, 560, "Back", { fontSize: "16px", fill: "#00ff00" }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("WorldMap"));
  }
}
