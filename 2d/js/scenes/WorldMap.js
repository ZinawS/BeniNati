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
    const { cx, width, height, safeBottom } = screenAnchors(this);
    const titleY = height * 0.05;
    this.add.text(cx, titleY, `${this.playerName}'s Journey`, { fontSize: "20px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.resetArmed = false;

    // Wider screens fit more worlds per row instead of wasting the extra
    // horizontal space — up to one row of all 9 on a very wide display.
    // Never fewer than 1, but critically never MORE than what actually fits:
    // this used to force a minimum of 5 columns unconditionally, which on a
    // narrow mobile-landscape screen (e.g. 667px wide, 5*150=750px needed)
    // overflowed both edges and clipped the outermost world tiles — caught
    // by an actual screenshot, not just reading the math.
    const cellW = 150;
    const cols = Math.max(1, Math.min(WORLDS.length, Math.floor(width / cellW)));
    const rows = Math.ceil(WORLDS.length / cols);

    // Reserved vertical space below the grid: abilities line, up to two
    // button rows (see the wrapping logic further down), and the Back
    // button, plus margins. A portrait phone with only 1-2 grid columns
    // needs up to 9 rows, and this used to assume the grid was always
    // short (a landscape-only assumption) — cellH was a flat height*0.2
    // regardless of row count, so on portrait the grid ran straight through
    // the abilities text, the button row, and off the bottom of the screen
    // entirely (confirmed via screenshot). Shrinking cellH to whatever
    // actually fits in the leftover space fixes that at the source.
    //
    // gridTopY is the grid's actual top *edge*, not the first row's tile
    // center — computing cellH before establishing that distinction let a
    // large cellH's own half-height push the first row up into the title
    // text above it (also confirmed via screenshot: "Nati's Journey"
    // overlapped "Green Hills" once cellH grew past ~120px on a tall
    // portrait screen). startY (row-0 center) is derived *from* gridTopY,
    // not the other way around, so the grid's top edge is fixed regardless
    // of how tall cellH ends up being.
    const gridTopY = titleY + 30;
    const reservedBelowGrid = 150;
    const availableGridHeight = Math.max(rows * 60, height - gridTopY - reservedBelowGrid);
    const cellH = Math.min(height * 0.2, availableGridHeight / rows);
    const startY = gridTopY + cellH * 0.5;
    const gridWidth = cols * cellW;
    const startX = (width - gridWidth) / 2 + cellW / 2;

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
    const infoY = gridBottom + 18;
    this.add.text(cx, infoY, `Abilities: ${Save.abilityListText()}`, { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);

    if (save.gameCompleted) {
      // Combined onto one line (was two) to keep the reserved-space budget
      // below the grid predictable regardless of how many rows the grid
      // itself needs on a given screen — still conveys both the "THE END"
      // beat and the practical "where do I find New Game+" pointer.
      this.add.text(cx, infoY + 18, `You defeated ${VILLAIN}! New Game+ & Nightmare Mode are in Settings.`, { fontSize: "12px", fill: "#ffcc00", fontStyle: "bold", align: "center", wordWrap: { width: width - 40 } }).setOrigin(0.5);
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
    const allButtons = [...buttons, ["Reset Progress", null, "#884444"]];

    // Font size (and, if that still isn't enough, row count) picked from
    // *measured* label width, not a guessed pixel-per-character threshold —
    // a guessed threshold missed a real overlap case earlier (a gap of
    // ~111px landed just past a "< 110 ? 10 : 12" cutoff and kept the larger
    // size). On a narrow portrait phone (390px, 5 buttons), even the
    // smallest readable font still doesn't fit 5 labels in one row — wrap to
    // two rows instead of shrinking text into illegibility.
    const probe = this.add.text(0, 0, "", { fontStyle: "bold" }).setVisible(false);
    function widestLabelAt(labels, size) {
      probe.setFontSize(size);
      return Math.max(...labels.map((label) => { probe.setText(label); return probe.width; }));
    }
    function fits(labels, size, gap) {
      return widestLabelAt(labels, size) <= gap - 6;
    }

    const oneRowLabels = allButtons.map(([label]) => label);
    let btnRows = [allButtons];
    let btnFontSize = 8;
    let oneRowGap = Math.min(130, width / (oneRowLabels.length + 1));
    let picked = [12, 11, 10, 9, 8].find((size) => fits(oneRowLabels, size, oneRowGap));
    if (picked) {
      btnFontSize = picked;
    } else {
      // Doesn't fit even at 8px in one row — split into two rows instead.
      const half = Math.ceil(allButtons.length / 2);
      btnRows = [allButtons.slice(0, half), allButtons.slice(half)];
      const maxRowLabels = Math.max(...btnRows.map((r) => r.length));
      const twoRowGap = Math.min(130, width / (maxRowLabels + 1));
      btnFontSize = [10, 9, 8].find((size) => btnRows.every((r) => fits(r.map(([l]) => l), size, twoRowGap))) || 8;
    }
    probe.destroy();

    const rowSpacing = btnFontSize + 20;
    const btnBaseY = safeBottom - 55 - (btnRows.length - 1) * rowSpacing;
    let resetText = null;
    btnRows.forEach((rowButtons, rowIndex) => {
      const gap = Math.min(130, width / (rowButtons.length + 1));
      const rowStartX = cx - (gap * (rowButtons.length - 1)) / 2;
      const rowY = btnBaseY + rowIndex * rowSpacing;
      rowButtons.forEach(([label, onClick, color], i) => {
        if (onClick) {
          makeButton(this, rowStartX + gap * i, rowY, label, onClick, { fontSize: `${btnFontSize}px`, color });
        } else {
          // The "Reset Progress" placeholder — needs its own confirm-click
          // state, so it's built here instead of via the generic onClick.
          resetText = makeButton(this, rowStartX + gap * i, rowY, label, () => {
            if (!this.resetArmed) {
              this.resetArmed = true;
              resetText.setText("Click again to confirm!");
              this.time.delayedCall(3000, () => { this.resetArmed = false; resetText.setText("Reset Progress"); });
            } else {
              Save.reset();
              this.scene.restart();
            }
          }, { fontSize: `${btnFontSize}px`, color });
        }
      });
    });

    makeButton(this, cx, safeBottom - 24, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "13px", color: "#aaaaaa" });
  }
}
