import { VILLAIN, WORLDS } from "../config/worlds.js";
import { getAudioCtx, initAudioUnlock } from "../systems/audio.js";
import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";
import { addSoundIndicator } from "../ui/soundIndicator.js";
import { maybeShowSoundSetup } from "../ui/soundSetupModal.js";
import { safeAreaInsets } from "../systems/platform.js";

export class MainMenu extends Phaser.Scene {
  constructor() { super("MainMenu"); }

  create() {
    initAudioUnlock();
    fadeInScene(this);
    autoRelayoutOnResize(this);

    const { cx, height, width } = screenAnchors(this);
    const inset = safeAreaInsets();
    addSoundIndicator(this, width - 36 - inset.right, 24 + inset.top);

    // Every font size here used to be a fixed pixel value tuned for a
    // landscape-width screen (~800px+) — fine there, but "SPEEDY ADVENTURE!"
    // at a flat 40px is wider than an entire portrait phone screen (390px),
    // overflowing both edges (confirmed via screenshot after enabling
    // portrait play). Scales every size down together on narrower screens,
    // floored so text never becomes illegibly tiny.
    const fs = Math.max(0.55, Math.min(1, width / 700));
    const wrapWidth = width - 40;

    this.add.text(cx, height * 0.18, "NATI & BENIYAS'S", { fontSize: `${26 * fs}px`, fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    const title = this.add.text(cx, height * 0.26, "SPEEDY ADVENTURE!", { fontSize: `${40 * fs}px`, fill: "#0066ff", fontStyle: "bold", stroke: "#fff", strokeThickness: 4 }).setOrigin(0.5);
    this.tweens.add({ targets: title, scale: { from: 0.9, to: 1 }, duration: 900, ease: "Bounce.easeOut" });

    this.add.text(cx, height * 0.35, `${VILLAIN} has captured your friends across ${WORLDS.length} worlds!`, { fontSize: `${16 * fs}px`, fill: "#ddd", align: "center", wordWrap: { width: wrapWidth } }).setOrigin(0.5);
    this.add.text(cx, height * 0.41, "Rescue them all and stop his ultimate machine!", { fontSize: `${16 * fs}px`, fill: "#ddd", align: "center", wordWrap: { width: wrapWidth } }).setOrigin(0.5);

    makeButton(this, cx, height * 0.58, "[ PLAY ]", () => {
      getAudioCtx().resume();
      sceneTransition(this, "ProfileSelect");
    }, { fontSize: `${34 * fs}px`, color: "#00ff00" });

    makeButton(this, cx, height * 0.7, "[ How To Play ]", () => sceneTransition(this, "HowToPlay"), { fontSize: `${16 * fs}px` });

    this.add.text(cx, height * 0.8, "Pick or create your player on the next screen.", { fontSize: `${13 * fs}px`, fill: "#66ccff", align: "center", wordWrap: { width: wrapWidth } }).setOrigin(0.5);

    maybeShowSoundSetup(this);
  }
}
