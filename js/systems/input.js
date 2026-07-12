// Unifies keyboard, gamepad, and on-screen touch buttons into one snapshot
// GameScene reads once per frame, so gameplay code never checks input
// sources individually. Standard gamepad mapping: dpad = buttons 12-15,
// left stick = axis 0/1, jump = button 0 (A/Cross), action = button 1/2.
import { isTouchDevice } from "./platform.js";

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey("SPACE");
    this.actionKeys = [scene.input.keyboard.addKey("X"), scene.input.keyboard.addKey("Z")];

    this._prevDown = false;
    this._prevJump = false;
    this._prevAction = false;
    this._padPrevJump = false;
    this._padPrevAction = false;

    this.touch = { left: false, right: false, down: false, jump: false, action: false };
    this._touchParts = [];
    if (isTouchDevice) {
      this._buildTouchButtons(scene);
      this._resizeHandler = () => this._buildTouchButtons(scene);
      scene.scale.on("resize", this._resizeHandler);
      scene.events.once("shutdown", () => scene.scale.off("resize", this._resizeHandler));
    }
  }

  /**
   * On-screen controls, split by thumb the way a real mobile platformer
   * lays them out: LEFT thumb = forward/backward movement (left/right arrows
   * side by side), RIGHT thumb = up/down (up doubles as jump) stacked
   * vertically, plus a separate star-shaped action button above them. Real
   * drawn triangle arrows (not font glyphs, which render inconsistently
   * across mobile browsers), each cluster backed by its own rounded "window"
   * panel so it reads as a real control pad. Rebuilt on every resize/rotate
   * so it stays correctly anchored to the actual screen edges.
   */
  _buildTouchButtons(scene) {
    this._touchParts.forEach((o) => o.destroy());
    this._touchParts = [];
    const track = (obj) => { this._touchParts.push(obj); return obj; };

    const width = scene.scale.width;
    const height = scene.scale.height;
    const DPAD_COLOR = 0x66ccff;
    const ACTION_COLOR = 0xffee66;

    const panel = (cx, cy, w, h, strokeColor) => {
      const g = track(scene.add.graphics().setScrollFactor(0).setDepth(996));
      g.fillStyle(0x0a0a1a, 0.42);
      g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
      g.lineStyle(2, strokeColor, 0.55);
      g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
      return g;
    };

    const pressFeedback = (parts, pressed) => {
      scene.tweens.add({ targets: parts, scale: pressed ? 0.86 : 1, duration: 90, ease: "Sine.easeOut" });
    };

    // angle 0 = arrow points right; rotate for the other three directions.
    const arrowButton = (x, y, angleDeg, key, color) => {
      const backdrop = track(scene.add.circle(x, y, 30, color, 0.2).setStrokeStyle(2, color, 0.75).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
      const arrow = track(scene.add.triangle(x, y, -12, -13, 15, 0, -12, 13, 0xffffff, 0.95).setAngle(angleDeg).setScrollFactor(0).setDepth(999));
      const parts = [backdrop, arrow];
      backdrop.on("pointerdown", () => { this.touch[key] = true; pressFeedback(parts, true); backdrop.setFillStyle(color, 0.45); });
      const release = () => { this.touch[key] = false; pressFeedback(parts, false); backdrop.setFillStyle(color, 0.2); };
      backdrop.on("pointerup", release);
      backdrop.on("pointerout", release);
      return parts;
    };

    const bottomY = height - Math.min(90, height * 0.18);

    // ---- LEFT thumb: forward/backward, anchored to the left edge ----
    const moveCx = 108;
    panel(moveCx, bottomY, 190, 96, DPAD_COLOR);
    arrowButton(moveCx - 48, bottomY, 180, "left", DPAD_COLOR);
    arrowButton(moveCx + 48, bottomY, 0, "right", DPAD_COLOR);

    // ---- RIGHT thumb: up/down, anchored to the right edge ----
    const vertCx = width - 108;
    panel(vertCx, bottomY, 96, 190, DPAD_COLOR);
    arrowButton(vertCx, bottomY - 48, 270, "jump", DPAD_COLOR); // up = jump
    arrowButton(vertCx, bottomY + 48, 90, "down", DPAD_COLOR); // down = crouch/spin-dash/ground-pound

    // ---- Action button: its own cluster, above the up/down stack ----
    const actionCx = vertCx;
    const actionCy = bottomY - 140;
    panel(actionCx, actionCy, 96, 96, ACTION_COLOR);
    const actionBackdrop = track(scene.add.circle(actionCx, actionCy, 32, ACTION_COLOR, 0.22).setStrokeStyle(2, ACTION_COLOR, 0.85).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
    const actionStar = track(scene.add.star(actionCx, actionCy, 5, 9, 18, 0xffffff, 0.95).setScrollFactor(0).setDepth(999));
    const actionParts = [actionBackdrop, actionStar];
    actionBackdrop.on("pointerdown", () => { this.touch.action = true; pressFeedback(actionParts, true); actionBackdrop.setFillStyle(ACTION_COLOR, 0.5); });
    const releaseAction = () => { this.touch.action = false; pressFeedback(actionParts, false); actionBackdrop.setFillStyle(ACTION_COLOR, 0.22); };
    actionBackdrop.on("pointerup", releaseAction);
    actionBackdrop.on("pointerout", releaseAction);
  }

  _padButtonPressed(pad, index) {
    return !!(pad && pad.buttons[index] && pad.buttons[index].pressed);
  }

  /** Returns a fresh snapshot for this frame. Call once per GameScene.update(). */
  poll() {
    const pad = navigator.getGamepads ? navigator.getGamepads()[0] : null;
    const padAxisX = pad ? pad.axes[0] || 0 : 0;
    const padLeft = this._padButtonPressed(pad, 14) || padAxisX < -0.4;
    const padRight = this._padButtonPressed(pad, 15) || padAxisX > 0.4;
    const padDown = this._padButtonPressed(pad, 13) || (pad ? (pad.axes[1] || 0) > 0.5 : false);
    const padJump = this._padButtonPressed(pad, 0);
    const padAction = this._padButtonPressed(pad, 1) || this._padButtonPressed(pad, 2);

    const left = this.cursors.left.isDown || this.touch.left || padLeft;
    const right = this.cursors.right.isDown || this.touch.right || padRight;
    const downHeld = this.cursors.down.isDown || this.touch.down || padDown;

    const kbJump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey);
    const kbAction = this.actionKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
    const kbDownJust = Phaser.Input.Keyboard.JustDown(this.cursors.down);

    const touchJumpEdge = this.touch.jump && !this._prevJump;
    const touchActionEdge = this.touch.action && !this._prevAction;
    const touchDownEdge = this.touch.down && !this._prevDown;
    const padJumpEdge = padJump && !this._padPrevJump;
    const padActionEdge = padAction && !this._padPrevAction;

    const snapshot = {
      left,
      right,
      downHeld,
      downJustPressed: kbDownJust || touchDownEdge,
      jumpJustPressed: kbJump || touchJumpEdge || padJumpEdge,
      actionJustPressed: kbAction || touchActionEdge || padActionEdge,
    };

    this._prevDown = this.touch.down;
    this._prevJump = this.touch.jump;
    this._prevAction = this.touch.action;
    this._padPrevJump = padJump;
    this._padPrevAction = padAction;

    return snapshot;
  }
}
