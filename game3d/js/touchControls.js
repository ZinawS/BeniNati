// On-screen touch controls — a draggable virtual joystick for movement (one
// stick naturally supports diagonal movement, unlike four separate D-pad
// buttons) plus Jump and Run buttons, mirroring the 2D game's touch-control
// pattern (systems/input.js there) for a consistent feel across both games.
// Builds nothing on non-touch devices — desktop keeps keyboard-only.
export const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

const JOYSTICK_RADIUS = 55; // px, how far the knob can travel from center

export function createTouchControls() {
  const state = { forwardAxis: 0, strafeAxis: 0, run: false, jumpPressed: false };
  if (!isTouchDevice) {
    return { poll: () => ({ forwardAxis: 0, strafeAxis: 0, run: false, jumpPressed: false }) };
  }

  const hud = document.getElementById("hud");

  const container = document.createElement("div");
  container.id = "touch-controls";
  container.innerHTML = `
    <div id="touch-joystick-zone">
      <div id="touch-joystick-base">
        <div id="touch-joystick-ring"></div>
        <div id="touch-joystick-knob"></div>
      </div>
    </div>
    <div id="touch-action-zone">
      <button id="touch-run-btn" type="button" aria-label="Run">
        <span class="touch-btn-icon">⚡</span><span class="touch-btn-label">RUN</span>
      </button>
      <button id="touch-jump-btn" type="button" aria-label="Jump">
        <span class="touch-btn-icon">⬆</span><span class="touch-btn-label">JUMP</span>
      </button>
    </div>
  `;
  hud.appendChild(container);

  const vibrate = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };

  const zone = container.querySelector("#touch-joystick-zone");
  const knob = container.querySelector("#touch-joystick-knob");
  const runBtn = container.querySelector("#touch-run-btn");
  const jumpBtn = container.querySelector("#touch-jump-btn");

  let joystickPointerId = null;
  let originX = 0, originY = 0;

  function resetKnob() {
    knob.style.transform = "translate(-50%, -50%)";
    knob.classList.remove("active");
    zone.classList.remove("active");
    state.forwardAxis = 0;
    state.strafeAxis = 0;
  }

  zone.addEventListener("pointerdown", (e) => {
    if (joystickPointerId !== null) return;
    joystickPointerId = e.pointerId;
    const rect = zone.getBoundingClientRect();
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
    zone.setPointerCapture(e.pointerId);
    knob.classList.add("active");
    zone.classList.add("active");
  });

  zone.addEventListener("pointermove", (e) => {
    if (e.pointerId !== joystickPointerId) return;
    let dx = e.clientX - originX;
    let dy = e.clientY - originY;
    const dist = Math.min(Math.hypot(dx, dy), JOYSTICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * dist;
    const ky = Math.sin(angle) * dist;
    knob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
    // Screen-down (positive Y) should mean "backward", matching W/S convention.
    state.forwardAxis = -ky / JOYSTICK_RADIUS;
    state.strafeAxis = kx / JOYSTICK_RADIUS;
  });

  function endJoystick(e) {
    if (e.pointerId !== joystickPointerId) return;
    joystickPointerId = null;
    resetKnob();
  }
  zone.addEventListener("pointerup", endJoystick);
  zone.addEventListener("pointercancel", endJoystick);

  runBtn.addEventListener("pointerdown", () => { state.run = true; runBtn.classList.add("active"); });
  const releaseRun = () => { state.run = false; runBtn.classList.remove("active"); };
  runBtn.addEventListener("pointerup", releaseRun);
  runBtn.addEventListener("pointercancel", releaseRun);
  runBtn.addEventListener("pointerout", releaseRun);

  let jumpHeld = false;
  jumpBtn.addEventListener("pointerdown", () => { jumpHeld = true; jumpBtn.classList.add("active"); vibrate(12); });
  const releaseJump = () => { jumpHeld = false; jumpBtn.classList.remove("active"); };
  jumpBtn.addEventListener("pointerup", releaseJump);
  jumpBtn.addEventListener("pointercancel", releaseJump);
  jumpBtn.addEventListener("pointerout", releaseJump);

  let jumpWasHeld = false;

  return {
    poll() {
      const jumpJustPressed = jumpHeld && !jumpWasHeld;
      jumpWasHeld = jumpHeld;
      return {
        forwardAxis: state.forwardAxis,
        strafeAxis: state.strafeAxis,
        run: state.run,
        jumpPressed: jumpJustPressed,
      };
    },
  };
}
