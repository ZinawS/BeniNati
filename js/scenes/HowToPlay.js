import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";

export class HowToPlay extends Phaser.Scene {
  constructor() { super("HowToPlay"); }

  init(data) {
    this.returnTo = (data && data.returnTo) || "MainMenu";
  }

  create() {
    fadeInScene(this);
    autoRelayoutOnResize(this);
    const { cx, width, height } = screenAnchors(this);
    this.add.text(cx, height * 0.08, "HOW TO PLAY", { fontSize: "26px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const lines = [
      ["Move", "Left/Right arrows, gamepad, or the on-screen ◀▶ buttons on your left thumb."],
      ["Jump / Double Jump", "UP, SPACE, gamepad A, or the on-screen ▲ button on your right thumb. Press again in mid-air to double jump (once unlocked)."],
      ["Wall Jump", "Jump while touching a wall, then press Jump again to bounce off (once unlocked)."],
      ["Spin Dash", "Hold DOWN then release to launch forward (once unlocked)."],
      ["Ground Pound", "Press DOWN in mid-air to slam down and shock nearby enemies (once unlocked)."],
      ["Homing / Air Dash", "X, Z, gamepad B/X, or the on-screen ★ button — snaps to the nearest enemy, or dashes forward if none is close."],
      ["Rings", "Collect them! They protect you — lose them instead of dying when hit."],
      ["Checkpoints", "Touching a flag saves your spot in the stage."],
      ["Boss Fights", "Wait for the boss to flash YELLOW, then jump on it, spin-dash it, or homing-attack it."],
      ["Lava", "Never touch it — it burns! You respawn at your last checkpoint."],
      ["Pause", "ESC any time during a stage."],
      ["Sound", "Tap the speaker icon (top-right) any time to enable/mute audio."],
    ];

    // Two columns on wide screens so this fits comfortably even on a short
    // landscape phone; one column on anything narrower.
    const twoCol = width >= 640;
    const colWidth = twoCol ? width / 2 - 40 : width - 80;
    const startY = height * 0.18;
    const rowH = Math.max(30, Math.min(34, (height * 0.72) / Math.ceil(lines.length / (twoCol ? 2 : 1))));

    lines.forEach(([title, desc], i) => {
      const col = twoCol ? i % 2 : 0;
      const row = twoCol ? Math.floor(i / 2) : i;
      const colX = twoCol ? 40 + col * (width / 2) : 40;
      const y = startY + row * rowH;
      this.add.text(colX, y, title + ":", { fontSize: "13px", fill: "#66ccff", fontStyle: "bold" });
      this.add.text(colX, y + 15, desc, { fontSize: "11px", fill: "#eee", wordWrap: { width: colWidth } });
    });

    makeButton(this, cx, height - 26, "Back", () => sceneTransition(this, this.returnTo), { color: "#00ff00" });
  }
}
