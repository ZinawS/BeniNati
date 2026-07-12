export class HowToPlay extends Phaser.Scene {
  constructor() { super("HowToPlay"); }

  init(data) {
    this.returnTo = (data && data.returnTo) || "MainMenu";
  }

  create() {
    this.add.text(400, 30, "HOW TO PLAY", { fontSize: "28px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    const lines = [
      ["Move", "Left & Right arrow keys, gamepad stick/d-pad, or the on-screen arrows on touch devices."],
      ["Jump", "UP arrow, SPACE, gamepad A, or the on-screen ● button. Press again in mid-air for Double Jump (once unlocked)."],
      ["Wall Jump", "Jump while touching a wall, then press Jump again to bounce off (once unlocked)."],
      ["Spin Dash", "Hold DOWN while standing still, then release to launch forward (once unlocked)."],
      ["Ground Pound", "Press DOWN while in mid-air to slam down and shock nearby enemies (once unlocked)."],
      ["Homing / Air Dash", "Press X, Z, gamepad B/X, or the on-screen ✕ button in mid-air — snaps to the nearest enemy, or dashes forward if none is close."],
      ["Rings", "Collect them! They protect you — lose them instead of dying when hit. 0 rings + 1 hit = respawn."],
      ["Checkpoints", "Touching a flag saves your spot in the stage."],
      ["Boss Fights", "Wait for the boss to flash YELLOW, then jump on it, spin-dash it, or homing-attack it."],
      ["Lava", "Never touch it — it burns! You'll respawn at your last checkpoint."],
      ["Pause", "ESC any time during a stage."],
    ];
    let y = 78;
    lines.forEach(([title, desc]) => {
      this.add.text(50, y, title + ":", { fontSize: "14px", fill: "#66ccff", fontStyle: "bold" });
      this.add.text(210, y, desc, { fontSize: "13px", fill: "#eee", wordWrap: { width: 540 } });
      y += 34;
    });
    this.add.text(400, 566, "Back", { fontSize: "16px", fill: "#00ff00" }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start(this.returnTo));
  }
}
