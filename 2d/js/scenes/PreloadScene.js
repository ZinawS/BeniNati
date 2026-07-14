import { THEMES } from "../config/themes.js";

// Every sprite in the game is drawn procedurally at boot time (canvas /
// Phaser.Graphics), so the project ships with zero image asset files.
export class PreloadScene extends Phaser.Scene {
  constructor() { super("Preload"); }

  preload() {
    let canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    let ctx = canvas.getContext("2d");
    const colors = { 0: null, 1: "#0033cc", 2: "#ffcc99", 3: "#cc0000", 4: "#ffffff", 5: "#000000" };
    const pixels = [
      "0000011110000000", "0000111111100000", "0001111111110000", "0011111122210000",
      "0111112222221000", "0111122452245000", "0011122222222000", "0001112222220000",
      "0011111222211000", "0111111111111100", "0111111111111100", "0011111111111000",
      "0001100000011000", "0004400000044000", "0033330000333300", "0033330000333300",
    ];
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        if (colors[pixels[y][x]]) {
          ctx.fillStyle = colors[pixels[y][x]];
          ctx.fillRect(x * 2, y * 2, 2, 2);
        }
      }
    }
    this.textures.addCanvas("hero", canvas);

    let g = this.make.graphics({ x: 0, y: 0, add: false });
    THEMES.forEach((t, i) => {
      g.fillStyle(t.groundBody, 1); g.fillRect(0, 0, 40, 40);
      g.fillStyle(t.groundTop, 1); g.fillRect(0, 0, 40, 10);
      g.generateTexture("ground" + i, 40, 40); g.clear();
    });
    g.lineStyle(4, 0xffcc00, 1); g.strokeCircle(10, 10, 8);
    g.generateTexture("ring", 20, 20); g.clear();
    g.fillStyle(0xaaaaaa, 1); g.fillTriangle(20, 0, 0, 40, 40, 40);
    g.generateTexture("spike", 40, 40); g.clear();
    g.fillStyle(0xff5500, 1); g.fillRect(0, 20, 40, 20);
    g.fillStyle(0xaaaaaa, 1); g.fillRect(10, 0, 20, 20);
    g.generateTexture("spring", 40, 40); g.clear();
    g.fillStyle(0xffaa00, 1); g.fillTriangle(0, 10, 40, 20, 0, 30);
    g.generateTexture("speedpad", 40, 40); g.clear();
    // Level-end door — two textures for the same frame, swapped at runtime
    // (GameScene#buildLevel / #update) as the player approaches: dark
    // doorway while closed, warm glow once opened.
    g.fillStyle(0xf2f2f2, 1); g.fillRoundedRect(0, 0, 40, 80, 10);
    g.fillStyle(0x14141c, 1); g.fillRoundedRect(8, 10, 24, 62, 8);
    g.generateTexture("door_closed", 40, 80); g.clear();
    g.fillStyle(0xf2f2f2, 1); g.fillRoundedRect(0, 0, 40, 80, 10);
    g.fillStyle(0xffe9a3, 1); g.fillRoundedRect(8, 10, 24, 62, 8);
    g.generateTexture("door_open", 40, 80); g.clear();
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(4, 8, 32, 28, 6);
    g.fillStyle(0x222222, 1); g.fillCircle(14, 20, 4); g.fillCircle(26, 20, 4);
    g.generateTexture("enemy", 40, 40); g.clear();
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(10, 10, 100, 100, 16);
    g.fillStyle(0x222222, 1); g.fillCircle(40, 55, 10); g.fillCircle(80, 55, 10);
    g.fillStyle(0xff0000, 1); g.fillCircle(60, 90, 14);
    g.generateTexture("boss", 120, 120); g.clear();
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x000000, 0.18); g.fillRect(0, 0, 8, 40); g.fillRect(32, 0, 8, 40);
    g.generateTexture("wall", 40, 40); g.clear();
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 40, 40);
    g.lineStyle(3, 0x000000, 0.3); g.strokeRect(2, 2, 36, 36);
    g.generateTexture("breakable", 40, 40); g.clear();
    g.fillStyle(0x888888, 1); g.fillRect(18, 0, 4, 60);
    g.fillStyle(0xff0000, 1); g.fillTriangle(22, 5, 22, 25, 42, 15);
    g.generateTexture("checkpoint", 44, 60); g.clear();
    g.fillStyle(0xffffff, 1); g.fillCircle(4, 4, 4);
    g.generateTexture("particle", 8, 8); g.clear();
    g.fillStyle(0xff2222, 1); g.fillCircle(8, 8, 8);
    g.generateTexture("projectile", 16, 16); g.clear();
    g.fillStyle(0xff3300, 1); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0xffaa00, 1); g.fillRect(2, 2, 36, 10);
    g.generateTexture("lava", 40, 40); g.clear();
    g.fillStyle(0xbbe7ff, 0.9); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0xffffff, 0.5); g.fillRect(0, 0, 40, 6);
    g.generateTexture("ice", 40, 40); g.clear();
    g.fillStyle(0x6b4a2a, 1); g.fillRect(0, 0, 40, 40);
    g.fillStyle(0x4a3218, 1); g.fillCircle(12, 14, 5); g.fillCircle(28, 26, 6);
    g.generateTexture("mud", 40, 40); g.clear();
    g.fillStyle(0xaee7ff, 0.18); g.fillRect(0, 0, 40, 40);
    g.lineStyle(2, 0xffffff, 0.5); g.lineBetween(8, 34, 20, 10); g.lineBetween(22, 34, 34, 10);
    g.generateTexture("windzone", 40, 40); g.clear();
    g.fillStyle(0x999999, 1); g.fillRect(0, 0, 40, 40);
    g.lineStyle(2, 0x444444, 1); g.lineBetween(4, 4, 36, 36); g.lineBetween(36, 4, 4, 36);
    g.generateTexture("crumble", 40, 40); g.clear();
    g.fillStyle(0x00ffcc, 1); g.fillRoundedRect(0, 0, 40, 16, 4);
    g.generateTexture("hover", 40, 16);
  }

  create() {
    this.scene.start("MainMenu");
  }
}
