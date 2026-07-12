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
  // Phaser only tracks 1 touch point by default. The split two-thumb touch
  // controls (movement on one hand, jump/action on the other) fundamentally
  // need simultaneous multi-touch — left thumb holding a direction while the
  // right thumb taps jump — or half the control scheme silently stops
  // responding on a real touchscreen.
  input: {
    activePointers: 3,
  },
  // RESIZE (not FIT) so the canvas actually fills the viewport edge to edge
  // on a landscape phone/tablet instead of letterboxing to preserve 800x600's
  // 4:3 aspect ratio. Every scene reads its real size from this.scale.width/
  // height rather than assuming 800x600, so this is safe to fill dynamically.
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: 800,
    height: 600,
  },
};

new Phaser.Game(config);
initOrientationGuard();
