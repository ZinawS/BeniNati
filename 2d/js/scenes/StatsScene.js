import { Save } from "../systems/save.js";
import { ACHIEVEMENTS } from "../systems/achievements.js";
import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";

export class StatsScene extends Phaser.Scene {
  constructor() { super("StatsScene"); }

  create() {
    fadeInScene(this);
    autoRelayoutOnResize(this);
    const save = Save.current();
    const { cx, width, height } = screenAnchors(this);
    this.add.text(cx, height * 0.08, "STATS & ACHIEVEMENTS", { fontSize: "22px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);

    const bestRush = save.stats.bestBossRushSeconds;
    const bestRushLabel = bestRush !== null && bestRush !== undefined
      ? `${Math.floor(bestRush / 60)}:${String(bestRush % 60).padStart(2, "0")}`
      : "not run yet";

    const stats = [
      `Rings collected (lifetime): ${save.stats.totalRings}`,
      `Enemies defeated: ${save.stats.enemiesDefeated}`,
      `Bosses defeated: ${save.stats.bossesDefeated}`,
      `Times respawned: ${save.stats.deaths}`,
      `Worlds cleared: ${save.clearedWorlds.filter(Boolean).length} / ${save.clearedWorlds.length}`,
      `Best Boss Rush time: ${bestRushLabel}`,
    ];

    // Side-by-side on wide screens (stats left, achievements right); stacked
    // on anything narrower so nothing gets cramped.
    const sideBySide = width >= 640;
    const leftX = sideBySide ? 40 : 40;
    const rightX = sideBySide ? width / 2 + 20 : 40;
    let y = height * 0.2;

    stats.forEach((line) => {
      this.add.text(leftX, y, line, { fontSize: "14px", fill: "#eee" });
      y += 26;
    });

    let ay = sideBySide ? height * 0.2 : y + 20;
    this.add.text(rightX, ay, "Achievements:", { fontSize: "15px", fill: "#66ccff", fontStyle: "bold" });
    ay += 30;
    const unlocked = new Set(save.stats.achievements || []);
    const achWrap = sideBySide ? width / 2 - 60 : width - 80;
    ACHIEVEMENTS.forEach((ach) => {
      const got = unlocked.has(ach.id);
      const label = got ? `★ ${ach.name}` : `☆ ???`;
      const desc = got ? ach.description : "Keep playing to unlock this one!";
      this.add.text(rightX, ay, label, { fontSize: "13px", fill: got ? "#ffcc00" : "#666", fontStyle: "bold" });
      this.add.text(rightX, ay + 14, desc, { fontSize: "11px", fill: got ? "#ccc" : "#555", wordWrap: { width: achWrap } });
      ay += 32;
    });

    makeButton(this, cx, height - 26, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
  }
}
