// Shared UI building blocks so every menu screen gets the same premium feel
// (hover/press feedback, click sound, fade transitions) instead of each scene
// re-implementing its own interactive-text boilerplate.
import { SFX } from "../systems/audio.js";

/**
 * A clickable text "button" with hover scale-up, press squash, and click sound.
 * Returns the Phaser.GameObjects.Text so callers can still reposition/restyle it.
 */
export function makeButton(scene, x, y, label, onClick, opts = {}) {
  const color = opts.color || "#ffcc00";
  const hoverColor = opts.hoverColor || "#ffffff";
  const style = {
    fontSize: opts.fontSize || "18px",
    fill: color,
    fontStyle: opts.bold === false ? "normal" : "bold",
  };
  if (opts.backgroundColor) style.backgroundColor = opts.backgroundColor;
  if (opts.padding) style.padding = opts.padding;
  if (opts.align) style.align = opts.align;
  if (opts.wordWrap) style.wordWrap = opts.wordWrap;

  const text = scene.add.text(x, y, label, style).setOrigin(opts.originX ?? 0.5, opts.originY ?? 0.5);
  text.setInteractive({ useHandCursor: true });

  text.on("pointerover", () => {
    scene.tweens.add({ targets: text, scale: 1.08, duration: 120, ease: "Sine.easeOut" });
    text.setColor(hoverColor);
    SFX.uiHover();
  });
  text.on("pointerout", () => {
    scene.tweens.add({ targets: text, scale: 1, duration: 120, ease: "Sine.easeOut" });
    text.setColor(color);
  });
  text.on("pointerdown", (pointer, lx, ly, event) => {
    if (event) event.stopPropagation();
    SFX.uiClick();
    scene.tweens.add({ targets: text, scale: 0.92, duration: 60, yoyo: true });
    onClick(pointer, lx, ly, event);
  });

  return text;
}

/** Adds hover/press feedback + click sound to an arbitrary interactive game object (a card, a world tile, etc.) without dictating its click behavior — callers attach their own "pointerdown" for the actual action. */
export function addHoverFeedback(scene, gameObject) {
  const baseScale = gameObject.scale || 1;
  gameObject.setInteractive({ useHandCursor: true });
  gameObject.on("pointerover", () => scene.tweens.add({ targets: gameObject, scale: baseScale * 1.05, duration: 120, ease: "Sine.easeOut" }));
  gameObject.on("pointerout", () => scene.tweens.add({ targets: gameObject, scale: baseScale, duration: 120, ease: "Sine.easeOut" }));
  gameObject.on("pointerdown", () => SFX.uiClick());
  return gameObject;
}

/** Fades the camera out, then starts the target scene — the "cinematic cut" between screens. */
export function sceneTransition(scene, key, data) {
  scene.cameras.main.fadeOut(220, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => scene.scene.start(key, data));
}

/** Call from a scene's create() to fade in from black instead of popping in instantly. */
export function fadeInScene(scene) {
  scene.cameras.main.fadeIn(260, 0, 0, 0);
}

/**
 * The game runs in Phaser's RESIZE scale mode (fills the real viewport
 * instead of letterboxing a fixed 800x600), so screens are never a fixed
 * size — a wide landscape phone is much wider than 800, a short one is
 * shorter than 600. Scenes use this instead of hardcoded numbers so content
 * stays centered/edge-anchored on any device.
 */
export function screenAnchors(scene) {
  const width = scene.scale.width;
  const height = scene.scale.height;
  return { width, height, cx: width / 2, cy: height / 2, right: width, bottom: height, left: 0, top: 0 };
}
