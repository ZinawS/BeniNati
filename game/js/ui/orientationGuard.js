// This is a landscape-oriented platformer (800x600). On a touch device held in
// portrait, Phaser's Scale.FIT would still "work" but shrink the playable area
// down to a narrow strip — actively prompting a rotate is a better experience
// than letting that happen silently. Desktop/laptop (mouse-driven, no touch)
// never sees this, since it can't physically rotate anyway.
import { isTouchDevice } from "../systems/platform.js";

export function initOrientationGuard() {
  if (!isTouchDevice) return;
  const el = document.getElementById("orientation-guard");
  if (!el) return;

  const check = () => {
    const portrait = window.innerHeight > window.innerWidth;
    el.classList.toggle("visible", portrait);
  };

  check();
  window.addEventListener("resize", check);
  window.addEventListener("orientationchange", check);
}
