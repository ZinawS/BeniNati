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

  _buildTouchButtons(scene) {
    const make = (x, y, label, key, radius = 34) => {
      const circle = scene.add.circle(x, y, radius, 0xffffff, 0.15).setStrokeStyle(2, 0xffffff, 0.4).setScrollFactor(0).setDepth(999).setInteractive();
      scene.add.text(x, y, label, { fontSize: "14px", fill: "#fff" }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
      circle.on("pointerdown", () => (this.touch[key] = true));
      circle.on("pointerup", () => (this.touch[key] = false));
      circle.on("pointerout", () => (this.touch[key] = false));
      return circle;
    };
    make(50, 520, "◀", "left");
    make(130, 520, "▶", "right");
    make(210, 555, "▼", "down", 26);
    make(700, 540, "●", "jump");
    make(760, 480, "✕", "action", 26);
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
