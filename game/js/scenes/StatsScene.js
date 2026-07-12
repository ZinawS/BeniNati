import { Save } from "../systems/save.js";
import { ACHIEVEMENTS } from "../systems/achievements.js";
import { makeButton, sceneTransition, fadeInScene } from "../ui/uiHelpers.js";

export class StatsScene extends Phaser.Scene {
  constructor() { super("StatsScene"); }

  create() {
    fadeInScene(this);
    const save = Save.current();
    this.add.text(400, 30, "STATS & ACHIEVEMENTS", { fontSize: "24px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const stats = [
      `Rings collected (lifetime): ${save.stats.totalRings}`,
      `Enemies defeated: ${save.stats.enemiesDefeated}`,
      `Bosses defeated: ${save.stats.bossesDefeated}`,
      `Times respawned: ${save.stats.deaths}`,
      `Worlds cleared: ${save.clearedWorlds.filter(Boolean).length} / ${save.clearedWorlds.length}`,
    ];
    let y = 80;
    stats.forEach((line) => {
      this.add.text(60, y, line, { fontSize: "15px", fill: "#eee" });
      y += 26;
    });

    this.add.text(60, y + 10, "Achievements:", { fontSize: "17px", fill: "#66ccff", fontStyle: "bold" });
    y += 44;
    const unlocked = new Set(save.stats.achievements || []);
    ACHIEVEMENTS.forEach((ach) => {
      const got = unlocked.has(ach.id);
      const label = got ? `★ ${ach.name}` : `☆ ???`;
      const desc = got ? ach.description : "Keep playing to unlock this one!";
      this.add.text(60, y, label, { fontSize: "14px", fill: got ? "#ffcc00" : "#666", fontStyle: "bold" });
      this.add.text(300, y, desc, { fontSize: "12px", fill: got ? "#ccc" : "#555", wordWrap: { width: 420 } });
      y += 26;
    });

    makeButton(this, 400, 566, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
  }
}
