import { PreloadScene } from "./scenes/PreloadScene.js";
import { MainMenu } from "./scenes/MainMenu.js";
import { ProfileSelect } from "./scenes/ProfileSelect.js";
import { HowToPlay } from "./scenes/HowToPlay.js";
import { Settings } from "./scenes/Settings.js";
import { WorldMap } from "./scenes/WorldMap.js";
import { StatsScene } from "./scenes/StatsScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { initOrientationGuard } from "./ui/orientationGuard.js";

// `window.innerWidth/innerHeight` is *not* the actually-visible area on a
// mobile browser — it reports the layout viewport, which stays a fixed size
// regardless of whether the address bar/toolbar is currently showing or has
// collapsed away, so it can be taller than what's really on screen. Content
// anchored to the top edge (score/pause/sound icons) sized against that
// inflated height can end up rendered partly *underneath* the browser's own
// chrome — invisible, not actually cropped by our own CSS. `visualViewport`
// (iOS Safari 13+/Chrome Android, both real targets here) reports the
// genuinely visible area and fires its own resize event when the chrome
// shows/hides, which `window`'s resize event does not reliably do.
function currentViewportSize() {
  const vv = window.visualViewport;
  return vv ? { width: vv.width, height: vv.height } : { width: window.innerWidth, height: window.innerHeight };
}

const initialSize = currentViewportSize();

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
  //
  // Using the *real* current viewport size (not the 800x600 fallback) as the
  // starting size matters: RESIZE mode is supposed to immediately measure its
  // parent and correct itself, but on some mobile browsers that first
  // measurement can be stale (e.g. mid-layout while the address bar is still
  // collapsing), leaving the game rendered at 800px wide well past what a
  // ~380px-wide phone screen can show — which pushes the right-anchored
  // controls (up/down, action, pause, sound icon) off-screen entirely, with
  // no way to reach them. Seeding it with the actual visible size up front
  // avoids depending on that first auto-correction firing correctly at all.
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: initialSize.width,
    height: initialSize.height,
  },
};

const game = new Phaser.Game(config);
initOrientationGuard();

// Re-sync whenever the *actually visible* area changes — not just window
// resize/orientation, but also the mobile browser's own address bar
// collapsing or expanding mid-session, which changes visualViewport without
// necessarily firing a window resize event at all.
//
// visualViewport can fire its own resize event very early — before Phaser's
// Scale Manager has finished booting — and calling game.scale.resize() that
// early throws (confirmed: "Cannot set properties of undefined (setting
// 'width')" from inside Phaser's own resize()). game.isBooted guards against
// that; RESIZE mode already seeds from the correct initial size anyway, so
// skipping a too-early resize call here loses nothing.
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    if (!game.isBooted) return;
    const size = currentViewportSize();
    game.scale.resize(size.width, size.height);
  });
}
