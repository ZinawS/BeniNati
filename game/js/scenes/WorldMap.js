import { WORLDS, VILLAIN } from "../config/worlds.js";
import { THEMES } from "../config/themes.js";
import { Save, Profiles } from "../systems/save.js";
import { makeButton, addHoverFeedback, sceneTransition, fadeInScene, screenAnchors } from "../ui/uiHelpers.js";

export class WorldMap extends Phaser.Scene {
  constructor() { super("WorldMap"); }

  init(data) {
    // Scenes that return here (Settings, HowToPlay) don't always pass the
    // profile back through — fall back to whichever profile is active.
    const activeId = Save.currentProfileId() || (data && data.profileId);
    const profile = Profiles.list().find((p) => p.id === activeId);
    this.profileId = activeId;
    this.playerName = (data && data.profileName) || (profile && profile.name) || "Player";
    this.profileTint = (data && data.profileTint) || (profile && profile.tint) || 0xffffff;
  }

  create() {
    fadeInScene(this);
    const save = Save.current();
    const { cx, width, height } = screenAnchors(this);
    this.add.text(cx, height * 0.05, `${this.playerName}'s Journey`, { fontSize: "20px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.resetArmed = false;

    // Wider screens fit more worlds per row instead of wasting the extra
    // horizontal space — up to one row of all 9 on a very wide display.
    const cellW = 150, cellH = height * 0.2;
    const cols = Math.max(5, Math.min(WORLDS.length, Math.floor(width / cellW)));
    const rows = Math.ceil(WORLDS.length / cols);
    const gridWidth = cols * cellW;
    const startX = (width - gridWidth) / 2 + cellW / 2;
    const startY = height * 0.22;

    WORLDS.forEach((world, i) => {
      const x = startX + (i % cols) * cellW;
      const y = startY + Math.floor(i / cols) * cellH;
      const unlocked = i <= save.unlockedWorld;
      const cleared = save.clearedWorlds[i];
      const color = cleared ? "#00ff88" : unlocked ? "#ffffff" : "#555555";
      const box = this.add.rectangle(x, y, 130, cellH * 0.72, THEMES[world.theme].sky, unlocked ? 1 : 0.3).setStrokeStyle(3, cleared ? 0x00ff88 : 0xffffff);
      this.add.text(x, y - cellH * 0.32, world.name, { fontSize: "12px", fill: color, fontStyle: "bold", align: "center", wordWrap: { width: 130 } }).setOrigin(0.5);
      this.add.text(x, y + cellH * 0.32, cleared ? "CLEARED" : unlocked ? "PLAY" : "LOCKED", { fontSize: "12px", fill: color }).setOrigin(0.5);
      if (unlocked) {
        addHoverFeedback(this, box);
        box.on("pointerdown", () => {
          sceneTransition(this, "GameScene", { worldIndex: i, stageIndex: 0, score: 0, playerName: this.playerName, profileTint: this.profileTint });
        });
      }
    });

    const gridBottom = startY + (rows - 1) * cellH + cellH * 0.5;
    const infoY = Math.min(gridBottom + 22, height - 120);
    this.add.text(cx, infoY, `Abilities: ${Save.abilityListText()}`, { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);

    if (save.gameCompleted) {
      this.add.text(cx, infoY + 22, `You defeated ${VILLAIN} and rescued everyone! THE END.`, { fontSize: "14px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(cx, infoY + 42, "New Game+ and Nightmare Mode are available in Settings!", { fontSize: "12px", fill: "#aaddff" }).setOrigin(0.5);
    }

    const btnRowY = height - 55;
    const btnGap = Math.min(140, width / 6);
    const btnStartX = cx - btnGap * 2;
    makeButton(this, btnStartX, btnRowY, "[ How To Play ]", () => sceneTransition(this, "HowToPlay", { returnTo: "WorldMap" }), { fontSize: "12px" });
    makeButton(this, btnStartX + btnGap, btnRowY, "[ Settings ]", () => sceneTransition(this, "Settings"), { fontSize: "12px" });
    makeButton(this, btnStartX + btnGap * 2, btnRowY, "[ Stats ]", () => sceneTransition(this, "StatsScene"), { fontSize: "12px" });
    makeButton(this, btnStartX + btnGap * 3, btnRowY, "[ Switch Player ]", () => sceneTransition(this, "ProfileSelect"), { fontSize: "12px" });

    const resetText = makeButton(this, btnStartX + btnGap * 4, btnRowY, "Reset Progress", () => {
      if (!this.resetArmed) {
        this.resetArmed = true;
        resetText.setText("Click again to confirm!");
        this.time.delayedCall(3000, () => { this.resetArmed = false; resetText.setText("Reset Progress"); });
      } else {
        Save.reset();
        this.scene.restart();
      }
    }, { fontSize: "12px", color: "#884444" });

    makeButton(this, cx, height - 24, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "13px", color: "#aaaaaa" });
  }
}
