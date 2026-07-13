import { WORLDS, VILLAIN } from "../config/worlds.js";
import { THEMES } from "../config/themes.js";
import { Save, Profiles } from "../systems/save.js";
import { makeButton, addHoverFeedback, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";

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
    autoRelayoutOnResize(this);
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

    // Boss Rush joins the main button row (rather than stacking below the
    // "THE END" text) so it can't collide with anything on a short screen —
    // the row's own spacing is computed from how many buttons are actually shown.
    const buttons = [
      ["[ How To Play ]", () => sceneTransition(this, "HowToPlay", { returnTo: "WorldMap" }), "#ffcc00"],
      ["[ Settings ]", () => sceneTransition(this, "Settings"), "#ffcc00"],
      ["[ Stats ]", () => sceneTransition(this, "StatsScene"), "#ffcc00"],
      ["[ Switch Player ]", () => sceneTransition(this, "ProfileSelect"), "#ffcc00"],
    ];
    if (save.gameCompleted) {
      const bestTime = save.stats.bestBossRushSeconds;
      const bestLabel = bestTime !== null && bestTime !== undefined
        ? `[ ★ Boss Rush ${Math.floor(bestTime / 60)}:${String(bestTime % 60).padStart(2, "0")} ]`
        : "[ ★ Boss Rush ]";
      buttons.push([bestLabel, () => {
        sceneTransition(this, "GameScene", {
          bossRush: true,
          bossRushIndex: 0,
          bossRushStartTime: Date.now(),
          score: 0,
          playerName: this.playerName,
          profileTint: this.profileTint,
        });
      }, "#ffee66"]);
    }

    const totalButtons = buttons.length + 1; // + Reset Progress
    const btnRowY = height - 55;
    const btnGap = Math.min(130, width / (totalButtons + 1));
    const btnStartX = cx - (btnGap * (totalButtons - 1)) / 2;
    buttons.forEach(([label, onClick, color], i) => {
      makeButton(this, btnStartX + btnGap * i, btnRowY, label, onClick, { fontSize: "12px", color });
    });

    const resetText = makeButton(this, btnStartX + btnGap * buttons.length, btnRowY, "Reset Progress", () => {
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
