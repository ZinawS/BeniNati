// This game was originally designed landscape-first, and still plays best
// that way — the camera shows more of the level side-to-side, which matters
// for a side-scroller. But RESIZE mode and every scene's layout already
// adapt to whatever the actual viewport is (verified across a wide range of
// aspect ratios), so portrait isn't actually broken, just a narrower slice
// of the world — a real, playable trade-off the player should get to choose
// rather than being hard-blocked from. This nudges toward landscape once per
// session and lets them dismiss it and keep playing in portrait.
import { isTouchDevice } from "../systems/platform.js";

const DISMISSED_KEY = "nati_beni_portrait_ok_v1";

export function initOrientationGuard() {
  if (!isTouchDevice) return;
  const el = document.getElementById("orientation-guard");
  const continueBtn = document.getElementById("orientation-continue-btn");
  if (!el) return;

  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch (e) {}

  const check = () => {
    const portrait = window.innerHeight > window.innerWidth;
    el.classList.toggle("visible", portrait && !dismissed);
  };

  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      dismissed = true;
      try {
        sessionStorage.setItem(DISMISSED_KEY, "1");
      } catch (e) {}
      check();
    });
  }

  check();
  window.addEventListener("resize", check);
  window.addEventListener("orientationchange", check);
}
