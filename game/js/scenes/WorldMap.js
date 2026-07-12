import { WORLDS, VILLAIN } from "../config/worlds.js";
import { THEMES } from "../config/themes.js";
import { Save, Profiles } from "../systems/save.js";
import { makeButton, addHoverFeedback, sceneTransition, fadeInScene } from "../ui/uiHelpers.js";

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
    this.add.text(400, 22, `${this.playerName}'s Journey`, { fontSize: "22px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.resetArmed = false;

    const cols = 5;
    WORLDS.forEach((world, i) => {
      const x = 95 + (i % cols) * 150;
      const y = 100 + Math.floor(i / cols) * 130;
      const unlocked = i <= save.unlockedWorld;
      const cleared = save.clearedWorlds[i];
      const color = cleared ? "#00ff88" : unlocked ? "#ffffff" : "#555555";
      const box = this.add.rectangle(x, y, 130, 100, THEMES[world.theme].sky, unlocked ? 1 : 0.3).setStrokeStyle(3, cleared ? 0x00ff88 : 0xffffff);
      this.add.text(x, y - 36, world.name, { fontSize: "12px", fill: color, fontStyle: "bold", align: "center", wordWrap: { width: 130 } }).setOrigin(0.5);
      this.add.text(x, y + 36, cleared ? "CLEARED" : unlocked ? "PLAY" : "LOCKED", { fontSize: "12px", fill: color }).setOrigin(0.5);
      if (unlocked) {
        addHoverFeedback(this, box);
        box.on("pointerdown", () => {
          sceneTransition(this, "GameScene", { worldIndex: i, stageIndex: 0, score: 0, playerName: this.playerName, profileTint: this.profileTint });
        });
      }
    });

    this.add.text(400, 355, `Abilities: ${Save.abilityListText()}`, { fontSize: "14px", fill: "#66ccff" }).setOrigin(0.5);

    if (save.gameCompleted) {
      this.add.text(400, 385, `You defeated ${VILLAIN} and rescued everyone! THE END.`, { fontSize: "15px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      this.add.text(400, 407, "New Game+ and Nightmare Mode are available in Settings!", { fontSize: "13px", fill: "#aaddff" }).setOrigin(0.5);
    }

    makeButton(this, 150, 445, "[ How To Play ]", () => sceneTransition(this, "HowToPlay", { returnTo: "WorldMap" }), { fontSize: "12px" });
    makeButton(this, 290, 445, "[ Settings ]", () => sceneTransition(this, "Settings"), { fontSize: "12px" });
    makeButton(this, 420, 445, "[ Stats ]", () => sceneTransition(this, "StatsScene"), { fontSize: "12px" });
    makeButton(this, 560, 445, "[ Switch Player ]", () => sceneTransition(this, "ProfileSelect"), { fontSize: "12px" });

    const resetText = makeButton(this, 700, 445, "Reset Progress", () => {
      if (!this.resetArmed) {
        this.resetArmed = true;
        resetText.setText("Click again to confirm!");
        this.time.delayedCall(3000, () => { this.resetArmed = false; resetText.setText("Reset Progress"); });
      } else {
        Save.reset();
        this.scene.restart();
      }
    }, { fontSize: "12px", color: "#884444" });

    makeButton(this, 400, 480, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "13px", color: "#aaaaaa" });
  }
}
