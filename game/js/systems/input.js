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
    if (isTouchDevice) this._buildTouchButtons(scene);
  }

  /**
   * On-screen D-pad (up/down/left/right, drawn as real triangle arrows —
   * not font glyphs, which render inconsistently across mobile browsers) plus
   * a separate star-shaped action button, each backed by its own rounded
   * "window" panel so they read as a real control pad, not floating icons.
   */
  _buildTouchButtons(scene) {
    const DPAD_COLOR = 0x66ccff;
    const ACTION_COLOR = 0xffee66;

    const panel = (cx, cy, w, h, strokeColor) => {
      const g = scene.add.graphics().setScrollFactor(0).setDepth(996);
      g.fillStyle(0x0a0a1a, 0.4);
      g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
      g.lineStyle(2, strokeColor, 0.5);
      g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
      return g;
    };

    const pressFeedback = (parts, pressed) => {
      scene.tweens.add({ targets: parts, scale: pressed ? 0.86 : 1, duration: 90, ease: "Sine.easeOut" });
    };

    // angle 0 = arrow points right; rotate for the other three directions.
    const arrowButton = (x, y, angleDeg, key, color) => {
      const r = 30;
      const backdrop = scene.add.circle(x, y, r, color, 0.18).setStrokeStyle(2, color, 0.7).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true });
      const arrow = scene.add.triangle(x, y, -12, -13, 15, 0, -12, 13, 0xffffff, 0.95).setAngle(angleDeg).setScrollFactor(0).setDepth(999);
      const parts = [backdrop, arrow];
      backdrop.on("pointerdown", () => { this.touch[key] = true; pressFeedback(parts, true); backdrop.setFillStyle(color, 0.4); });
      const release = () => { this.touch[key] = false; pressFeedback(parts, false); backdrop.setFillStyle(color, 0.18); };
      backdrop.on("pointerup", release);
      backdrop.on("pointerout", release);
      return parts;
    };

    // ---- Movement D-pad, bottom-left ----
    const dpadCx = 118, dpadCy = 498, gap = 56;
    panel(dpadCx, dpadCy, 172, 172, DPAD_COLOR);
    arrowButton(dpadCx, dpadCy - gap, 270, "jump", DPAD_COLOR); // up = jump
    arrowButton(dpadCx, dpadCy + gap, 90, "down", DPAD_COLOR); // down = crouch/spin-dash/ground-pound
    arrowButton(dpadCx - gap, dpadCy, 180, "left", DPAD_COLOR);
    arrowButton(dpadCx + gap, dpadCy, 0, "right", DPAD_COLOR);

    // ---- Action button, bottom-right, visually distinct from movement ----
    const actionCx = 706, actionCy = 500;
    panel(actionCx, actionCy, 110, 110, ACTION_COLOR);
    const actionBackdrop = scene.add.circle(actionCx, actionCy, 34, ACTION_COLOR, 0.2).setStrokeStyle(2, ACTION_COLOR, 0.8).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true });
    const actionStar = scene.add.star(actionCx, actionCy, 5, 9, 18, 0xffffff, 0.95).setScrollFactor(0).setDepth(999);
    const actionParts = [actionBackdrop, actionStar];
    actionBackdrop.on("pointerdown", () => { this.touch.action = true; pressFeedback(actionParts, true); actionBackdrop.setFillStyle(ACTION_COLOR, 0.45); });
    const releaseAction = () => { this.touch.action = false; pressFeedback(actionParts, false); actionBackdrop.setFillStyle(ACTION_COLOR, 0.2); };
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
