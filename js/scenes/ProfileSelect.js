import { Profiles, Save, sanitizeName } from "../systems/save.js";
import { makeButton, addHoverFeedback, sceneTransition, fadeInScene, screenAnchors, autoRelayoutOnResize } from "../ui/uiHelpers.js";

// Lets any number of players share the same browser, each with their own
// save (abilities, cleared worlds, stats, achievements). "Nati" and
// "Beniyas" are seeded as defaults; anyone else can add their own name.
export class ProfileSelect extends Phaser.Scene {
  constructor() { super("ProfileSelect"); }

  create() {
    fadeInScene(this);
    autoRelayoutOnResize(this);
    Profiles.ensureDefaults();
    const { cx, height } = screenAnchors(this);
    this.add.text(cx, height * 0.09, "Who's Playing?", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.renderProfiles();

    makeButton(this, cx, height - 24, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "14px", color: "#aaaaaa" });
  }

  renderProfiles() {
    if (this.profileContainer) this.profileContainer.forEach((o) => o.destroy());
    this.profileContainer = [];
    const add = (obj) => { this.profileContainer.push(obj); return obj; };

    const { width, height } = screenAnchors(this);
    const cellW = 180, cellH = 170;
    const cols = Math.max(3, Math.min(6, Math.floor(width / cellW)));
    const gridWidth = cols * cellW;
    const startX = (width - gridWidth) / 2 + cellW / 2;
    const startY = Math.min(160, height * 0.35);

    const profiles = Profiles.list();
    profiles.forEach((p, i) => {
      const x = startX + (i % cols) * cellW;
      const y = startY + Math.floor(i / cols) * cellH;

      const card = add(this.add.rectangle(x, y, 150, 130, 0x222244, 0.9).setStrokeStyle(2, p.tint || 0xffffff));
      addHoverFeedback(this, card);
      add(this.add.circle(x, y - 35, 22, p.tint || 0xffffff));
      add(this.add.text(x, y + 5, p.name, { fontSize: "16px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5));
      card.on("pointerdown", () => this.selectProfile(p));

      add(makeButton(this, x - 30, y + 45, "Rename", (pointer, lx, ly, event) => {
        const next = window.prompt("New name:", p.name);
        if (next && next.trim()) {
          Profiles.rename(p.id, sanitizeName(next));
          this.renderProfiles();
        }
      }, { fontSize: "11px", color: "#66ccff" }));

      add(makeButton(this, x + 40, y + 45, "Delete", (pointer, lx, ly, event) => {
        if (window.confirm(`Delete ${p.name} and all their progress? This can't be undone.`)) {
          Profiles.delete(p.id);
          this.renderProfiles();
        }
      }, { fontSize: "11px", color: "#ff6666" }));
    });

    const newX = startX + (profiles.length % cols) * cellW;
    const newY = startY + Math.floor(profiles.length / cols) * cellH;
    const newCard = add(this.add.rectangle(newX, newY, 150, 130, 0x1a1a2a, 0.9).setStrokeStyle(2, 0x00ff88));
    addHoverFeedback(this, newCard);
    add(this.add.text(newX, newY, "+ New\nPlayer", { fontSize: "16px", fill: "#00ff88", align: "center" }).setOrigin(0.5));
    newCard.on("pointerdown", () => {
      const name = window.prompt("Enter your name:", "");
      if (name && name.trim()) {
        const profile = Profiles.create(sanitizeName(name));
        this.selectProfile(profile);
      }
    });
  }

  selectProfile(profile) {
    Save.activate(profile.id);
    sceneTransition(this, "WorldMap", { profileId: profile.id, profileName: profile.name, profileTint: profile.tint });
  }
}
