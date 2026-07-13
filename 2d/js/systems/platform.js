export const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// Phone notches/rounded corners/home indicators commonly sit on a *side* in
// landscape, not just the top — and HUD elements anchored flush to an edge
// (score text, pause/sound icons, touch controls) can end up partly behind
// one. `env(safe-area-inset-*)` reports how much to keep clear, but only
// resolves through actual computed CSS, not a plain JS API — a hidden probe
// element is the standard way to read it as a real pixel number. Needs
// `viewport-fit=cover` in the page's meta viewport tag (already set) for
// these to ever be non-zero; on everything else this safely returns all 0s.
export function safeAreaInsets() {
  if (typeof document === "undefined") return { top: 0, right: 0, bottom: 0, left: 0 };
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
    "padding-top:env(safe-area-inset-top);padding-right:env(safe-area-inset-right);" +
    "padding-bottom:env(safe-area-inset-bottom);padding-left:env(safe-area-inset-left);";
  document.body.appendChild(probe);
  const cs = getComputedStyle(probe);
  const insets = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  };
  probe.remove();
  return insets;
}
