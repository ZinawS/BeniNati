import { VILLAIN } from "../config/worlds.js";
import { WORLDS } from "../config/worlds.js";
import { getAudioCtx } from "../systems/audio.js";

export class MainMenu extends Phaser.Scene {
  constructor() { super("MainMenu"); }

  create() {
    this.add.text(400, 110, "NATI & BENIYAS'S", { fontSize: "26px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(400, 155, "SPEEDY ADVENTURE!", { fontSize: "40px", fill: "#0066ff", fontStyle: "bold", stroke: "#fff", strokeThickness: 4 }).setOrigin(0.5);
    this.add.text(400, 210, `${VILLAIN} has captured your friends across ${WORLDS.length} worlds!`, { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);
    this.add.text(400, 232, "Rescue them all and stop his ultimate machine!", { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);

    const playBtn = this.add.text(400, 340, "[ PLAY ]", { fontSize: "34px", fill: "#00ff00", fontStyle: "bold" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    playBtn.on("pointerdown", () => {
      getAudioCtx().resume();
      this.scene.start("ProfileSelect");
    });

    const howTo = this.add.text(400, 410, "[ How To Play ]", { fontSize: "16px", fill: "#ffcc00" }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    howTo.on("pointerdown", () => this.scene.start("HowToPlay"));

    this.add.text(400, 480, "Pick or create your player on the next screen.", { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);
  }
}
