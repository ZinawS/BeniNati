import { PreloadScene } from "./scenes/PreloadScene.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { ProfileSelect } from "./scenes/ProfileSelect.js";
import { HowToPlay } from "./scenes/HowToPlay.js";
import { Settings } from "./scenes/Settings.js";
import { WorldMap } from "./scenes/WorldMap.js";
import { StatsScene } from "./scenes/StatsScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { initOrientationGuard } from "./ui/orientationGuard.js";

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  physics: { default: "arcade", arcade: { gravity: { y: 1200 }, debug: false } },
  scene: [PreloadScene, MainMenu, ProfileSelect, HowToPlay, Settings, WorldMap, StatsScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
};

new Phaser.Game(config);
initOrientationGuard();
