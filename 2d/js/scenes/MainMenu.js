import { VILLAIN, WORLDS } from "../config/worlds.js";
import { getAudioCtx, initAudioUnlock } from "../systems/audio.js";
import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";
import { addSoundIndicator } from "../ui/soundIndicator.js";
import { maybeShowSoundSetup } from "../ui/soundSetupModal.js";

export class MainMenu extends Phaser.Scene {
  constructor() { super("MainMenu"); }

  create() {
    initAudioUnlock();
    fadeInScene(this);
    addSoundIndicator(this);
    autoRelayoutOnResize(this);

    const { cx, height } = screenAnchors(this);

    this.add.text(cx, height * 0.18, "NATI & BENIYAS'S", { fontSize: "26px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    const title = this.add.text(cx, height * 0.26, "SPEEDY ADVENTURE!", { fontSize: "40px", fill: "#0066ff", fontStyle: "bold", stroke: "#fff", strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: title, scale: { from: 0.9, to: 1 }, duration: 900, ease: "Bounce.easeOut" });

    this.add.text(cx, height * 0.35, `${VILLAIN} has captured your friends across ${WORLDS.length} worlds!`, { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);
    this.add.text(cx, height * 0.39, "Rescue them all and stop his ultimate machine!", { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);

    makeButton(this, cx, height * 0.57, "[ PLAY ]", () => {
      getAudioCtx().resume();
      sceneTransition(this, "ProfileSelect");
    }, { fontSize: "34px", color: "#00ff00" });

    makeButton(this, cx, height * 0.68, "[ How To Play ]", () => sceneTransition(this, "HowToPlay"), { fontSize: "16px" });

    this.add.text(cx, height * 0.8, "Pick or create your player on the next screen.", { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);

    maybeShowSoundSetup(this);
  }
}
