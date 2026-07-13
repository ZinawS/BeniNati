import { makeButton, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";

export class HowToPlay extends Phaser.Scene {
  constructor() { super("HowToPlay"); }

  init(data) {
    this.returnTo = (data && data.returnTo) || "MainMenu";
  }

  create() {
    fadeInScene(this);
    autoRelayoutOnResize(this);
    const { cx, width, height, safeBottom } = screenAnchors(this);
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
      ["Escaping a Boss", "Don't want to fight? Every boss arena has a way past — run/jump beyond it to the exit and you'll skip the fight (still counts as clearing the world)."],
      ["Lava", "Never touch it — it burns! You respawn at your last checkpoint."],
      ["Pause", "ESC any time during a stage."],
      ["Sound", "Tap the speaker icon (top-right) any time to enable/mute audio."],
    ];

    // Two columns on wide screens so this fits comfortably even on a short
    // landscape phone; one column on anything narrower.
    const twoCol = width >= 640;
    const colWidth = twoCol ? width / 2 - 40 : width - 80;
    const startY = height * 0.18;
    const descFontSize = width < 500 ? 10 : 11;

    // Row height used to be a single fixed guess applied to every row
    // uniformly — but a description's wordWrap can spill onto 2-3 lines on a
    // narrow column, and a fixed slot has no way to know that in advance.
    // Confirmed via screenshot on a 667px-wide phone: several rows visibly
    // overlapped the next row's title. Fixed by creating each row's text
    // first (so Phaser has already computed the *actual* wrapped height),
    // measuring it, and only then computing each row's Y from real
    // cumulative heights instead of a guess.
    const numRows = Math.ceil(lines.length / (twoCol ? 2 : 1));
    const rowHeights = new Array(numRows).fill(0);
    const created = lines.map(([title, desc], i) => {
      const col = twoCol ? i % 2 : 0;
      const row = twoCol ? Math.floor(i / 2) : i;
      const colX = twoCol ? 40 + col * (width / 2) : 40;
      const titleText = this.add.text(colX, 0, title + ":", { fontSize: "13px", fill: "#66ccff", fontStyle: "bold" });
      const descText = this.add.text(colX, 0, desc, { fontSize: `${descFontSize}px`, fill: "#eee", wordWrap: { width: colWidth } });
      const entryHeight = titleText.height + 3 + descText.height;
      rowHeights[row] = Math.max(rowHeights[row], entryHeight);
      return { row, titleText, descText };
    });

    // Positions here are relative to 0, not startY — the whole block gets
    // parented under a container anchored at startY below, so if it needs to
    // shrink to fit (see below), it scales around that anchor instead of
    // toward the top-left corner of the screen.
    const rowGap = 6;
    const rowY = [];
    let cursor = 0;
    for (let r = 0; r < numRows; r++) {
      rowY[r] = cursor;
      cursor += rowHeights[r] + rowGap;
    }

    const container = this.add.container(0, startY);
    created.forEach(({ row, titleText, descText }) => {
      titleText.setY(rowY[row]);
      descText.setY(rowY[row] + titleText.height + 3);
      container.add([titleText, descText]);
    });

    // Row heights are now real (measured), which fixed the overlap — but on
    // a genuinely short screen the *total* content can still be taller than
    // the space available before the Back button. Rather than let it run
    // off-screen (confirmed via screenshot: the last entry was pushed below
    // the visible area on a 375px-tall viewport), scale the whole block down
    // uniformly to fit, floored so it never becomes illegibly tiny.
    const availableHeight = safeBottom - 40 - startY;
    if (cursor > availableHeight) {
      const scale = Math.max(0.55, availableHeight / cursor);
      container.setScale(scale);
    }

    makeButton(this, cx, safeBottom - 26, "Back", () => sceneTransition(this, this.returnTo), { color: "#00ff00" });
  }
}
