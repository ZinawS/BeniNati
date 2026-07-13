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
   * lays them out: LEFT thumb = forward/backward, RIGHT thumb = down/up
   * (up doubles as jump) + the action button. Both clusters sit on the same
   * horizontal baseline in same-height panels, buttons evenly spaced within
   * each — one aligned control strip, not mismatched floating pieces (an
   * earlier version stacked up/down vertically with the action button
   * floating separately above, which read as misaligned). Real drawn
   * triangle arrows (not font glyphs, which render inconsistently across
   * mobile browsers). Rebuilt on every resize/rotate so it stays correctly
   * anchored to the actual screen edges.
   */
  _buildTouchButtons(scene) {
    this._touchParts.forEach((o) => o.destroy());
    this._touchParts = [];
    const track = (obj) => { this._touchParts.push(obj); return obj; };

    const width = scene.scale.width;
    const height = scene.scale.height;
    const DPAD_COLOR = 0x66ccff;
    const ACTION_COLOR = 0xffee66;
    const BTN_RADIUS = 30;
    const PANEL_H = 92;

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
      const backdrop = track(scene.add.circle(x, y, BTN_RADIUS, color, 0.2).setStrokeStyle(2, color, 0.75).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
      // Points must be symmetric around (0,0) — Phaser centers a Triangle
      // shape on its points' bounding box, so an apex at +12 paired with a
      // base at -12 (not -12 mirrored to +12) renders visibly off-center.
      const arrow = track(scene.add.triangle(x, y, -12, -11, 12, 0, -12, 11, 0xffffff, 0.95).setAngle(angleDeg).setScrollFactor(0).setDepth(999));
      const parts = [backdrop, arrow];
      backdrop.on("pointerdown", () => { this.touch[key] = true; pressFeedback(parts, true); backdrop.setFillStyle(color, 0.45); });
      const release = () => { this.touch[key] = false; pressFeedback(parts, false); backdrop.setFillStyle(color, 0.2); };
      backdrop.on("pointerup", release);
      backdrop.on("pointerout", release);
      return parts;
    };

    const actionButton = (x, y) => {
      const backdrop = track(scene.add.circle(x, y, BTN_RADIUS + 2, ACTION_COLOR, 0.22).setStrokeStyle(2, ACTION_COLOR, 0.85).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
      const star = track(scene.add.star(x, y, 5, 9, 18, 0xffffff, 0.95).setScrollFactor(0).setDepth(999));
      const parts = [backdrop, star];
      backdrop.on("pointerdown", () => { this.touch.action = true; pressFeedback(parts, true); backdrop.setFillStyle(ACTION_COLOR, 0.5); });
      const release = () => { this.touch.action = false; pressFeedback(parts, false); backdrop.setFillStyle(ACTION_COLOR, 0.22); };
      backdrop.on("pointerup", release);
      backdrop.on("pointerout", release);
    };

    const bottomY = height - Math.min(70, height * 0.15);

    // ---- LEFT thumb: forward/backward, anchored to the left edge ----
    const moveCx = 105;
    const moveGap = 44;
    panel(moveCx, bottomY, moveGap * 2 + 70, PANEL_H, DPAD_COLOR);
    arrowButton(moveCx - moveGap, bottomY, 180, "left", DPAD_COLOR);
    arrowButton(moveCx + moveGap, bottomY, 0, "right", DPAD_COLOR);

    // ---- RIGHT thumb: down / up / action, same row, evenly spaced ----
    const rightCx = width - 150;
    const rightGap = 72;
    panel(rightCx, bottomY, rightGap * 2 + 74, PANEL_H, DPAD_COLOR);
    arrowButton(rightCx - rightGap, bottomY, 90, "down", DPAD_COLOR);
    arrowButton(rightCx, bottomY, 270, "jump", DPAD_COLOR); // up = jump
    actionButton(rightCx + rightGap, bottomY);
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
