import { Profiles, Save, sanitizeName } from "../systems/save.js";

// Lets any number of players share the same browser, each with their own
// save (abilities, cleared worlds, stats, achievements). "Nati" and
// "Beniyas" are seeded as defaults; anyone else can add their own name.
export class ProfileSelect extends Phaser.Scene {
  constructor() { super("ProfileSelect"); }

  create() {
    Profiles.ensureDefaults();
    this.add.text(400, 40, "Who's Playing?", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
    this.renderProfiles();

    this.add.text(400, 560, "Back to Menu", { fontSize: "14px", fill: "#aaaaaa" }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on("pointerdown", () => this.scene.start("MainMenu"));
  }

  renderProfiles() {
    if (this.profileContainer) this.profileContainer.forEach((o) => o.destroy());
    this.profileContainer = [];
    const add = (obj) => { this.profileContainer.push(obj); return obj; };

    const profiles = Profiles.list();
    const cols = 4;
    profiles.forEach((p, i) => {
      const x = 130 + (i % cols) * 180;
      const y = 160 + Math.floor(i / cols) * 170;

      const card = add(this.add.rectangle(x, y, 150, 130, 0x222244, 0.9).setStrokeStyle(2, p.tint || 0xffffff));
      add(this.add.circle(x, y - 35, 22, p.tint || 0xffffff));
      add(this.add.text(x, y + 5, p.name, { fontSize: "16px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5));
      card.setInteractive({ useHandCursor: true });
      card.on("pointerdown", () => this.selectProfile(p));

      const renameBtn = add(this.add.text(x - 30, y + 45, "Rename", { fontSize: "11px", fill: "#66ccff" }).setOrigin(0.5).setInteractive({ useHandCursor: true }));
      renameBtn.on("pointerdown", (pointer, lx, ly, event) => {
        event.stopPropagation();
        const next = window.prompt("New name:", p.name);
        if (next && next.trim()) {
          Profiles.rename(p.id, sanitizeName(next));
          this.renderProfiles();
        }
      });

      const deleteBtn = add(this.add.text(x + 40, y + 45, "Delete", { fontSize: "11px", fill: "#ff6666" }).setOrigin(0.5).setInteractive({ useHandCursor: true }));
      deleteBtn.on("pointerdown", (pointer, lx, ly, event) => {
        event.stopPropagation();
        if (window.confirm(`Delete ${p.name} and all their progress? This can't be undone.`)) {
          Profiles.delete(p.id);
          this.renderProfiles();
        }
      });
    });

    const newX = 130 + (profiles.length % cols) * 180;
    const newY = 160 + Math.floor(profiles.length / cols) * 170;
    const newCard = add(this.add.rectangle(newX, newY, 150, 130, 0x1a1a2a, 0.9).setStrokeStyle(2, 0x00ff88));
    add(this.add.text(newX, newY, "+ New\nPlayer", { fontSize: "16px", fill: "#00ff88", align: "center" }).setOrigin(0.5));
    newCard.setInteractive({ useHandCursor: true });
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
    this.scene.start("WorldMap", { profileId: profile.id, profileName: profile.name, profileTint: profile.tint });
  }
}
