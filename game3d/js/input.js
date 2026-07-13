// Raw key state only — camera-relative transformation happens in main.js,
// since that's where both the camera and the character controller meet.
export function createKeyboardState() {
  const keys = new Set();
  let jumpJustPressed = false;
  let jumpWasDown = false;

  window.addEventListener("keydown", (e) => keys.add(e.code));
  window.addEventListener("keyup", (e) => keys.delete(e.code));

  return {
    poll() {
      const jumpDown = keys.has("Space");
      jumpJustPressed = jumpDown && !jumpWasDown;
      jumpWasDown = jumpDown;

      const forward = (keys.has("KeyW") || keys.has("ArrowUp")) ? 1 : 0;
      const back = (keys.has("KeyS") || keys.has("ArrowDown")) ? 1 : 0;
      const left = (keys.has("KeyA") || keys.has("ArrowLeft")) ? 1 : 0;
      const right = (keys.has("KeyD") || keys.has("ArrowRight")) ? 1 : 0;

      return {
        forwardAxis: forward - back,
        strafeAxis: right - left,
        run: keys.has("ShiftLeft") || keys.has("ShiftRight"),
        jumpPressed: jumpJustPressed,
      };
    },
  };
}
