import { PreloadScene } from "./scenes/PreloadScene.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { ProfileSelect } from "./scenes/ProfileSelect.js";
import { HowToPlay } from "./scenes/HowToPlay.js";
import { Settings } from "./scenes/Settings.js";
import { WorldMap } from "./scenes/WorldMap.js";
import { StatsScene } from "./scenes/StatsScene.js";
import { GameScene } from "./scenes/GameScene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  physics: { default: "arcade", arcade: { gravity: { y: 1200 }, debug: false } },
  scene: [PreloadScene, MainMenu, ProfileSelect, HowToPlay, Settings, WorldMap, StatsScene, GameScene],
};

new Phaser.Game(config);
