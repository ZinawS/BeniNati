# QA Notes

This is an honest account of what was actually checked before this project was
committed — not a formal test report, because no automated or manual browser testing
was run against a live page on real devices. Treat "Verified" as real, and
"Not verified" as an explicit to-do before you'd call this release-ready.

## Verified (automated, reproducible)

- **JS syntax** — every file under `js/` parses cleanly as an ES module
  (`node --input-type=module --check`).
- **Import graph resolves** — every `import`/`export` across all modules resolves to
  a real, correctly-named export, re-verified after the UI/audio/mobile rework.
  Verified by loading `main.js` under Node with a minimal `Phaser`/DOM stub (command
  below) — this would fail loudly on a typo'd import or a missing export.
- **Level data structural integrity** — for all 9 worlds × 3 stages: every row in a
  stage's ASCII map has the same length, every character used is a recognized tile
  type, every non-boss stage has exactly one player start (`P`) and at least one
  goal (`G`).
- **Extraction fidelity** — `config/worlds.js` was diffed structurally against the
  original monolithic file's level data to confirm no tile was dropped or corrupted
  during the file-split refactor.

Reproduce the import-graph check:

```bash
cd js
cat > /tmp/phaser_stub.mjs << 'EOF'
globalThis.Phaser = {
  Scene: class Scene {},
  Math: { Distance: { Between: () => 0 }, Angle: { Between: () => 0 }, Between: () => 0, Clamp: (v) => v },
  Input: { Keyboard: { JustDown: () => false } },
  Utils: { Array: { GetRandom: (a) => a[0] } },
  AUTO: 1,
  Game: class Game {},
  Scale: { FIT: 1, CENTER_BOTH: 1, RESIZE: 1 },
};
globalThis.navigator = { getGamepads: () => [], maxTouchPoints: 0 };
globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => ({ classList: { add(){}, remove(){}, toggle(){} }, addEventListener(){} }),
  createElement: () => ({ getContext: () => ({}) }),
  addEventListener: () => {},
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
EOF
node -e "import('/tmp/phaser_stub.mjs').then(() => import('./main.js')).then(() => console.log('OK'))"
```

## Not verified (needs a real browser / real device)

No shell command substitutes for these — they need an actual person on an actual
screen:

- **Audio unlock on mobile Safari specifically** — `systems/audio.js` implements the
  standard fix (create + resume the `AudioContext` and play a silent buffer inside
  the very first `pointerdown`/`touchstart`/`keydown`), which is the documented
  workaround for iOS's stricter-than-Chrome autoplay policy. This is the correct
  *pattern*, but it was not confirmed on an actual iPhone.
- **Music crossfade across stage transitions** — `Music.playTheme()` is called from
  the new `GameScene.create()`, and the old scene's `Music.stop()` runs from its
  `shutdown` handler. Phaser's documented scene lifecycle shuts down the outgoing
  scene before the incoming one's `create()` runs, which is the ordering this code
  depends on for a clean crossfade instead of the new track getting cut short — this
  matches Phaser's documented behavior but wasn't watched happening live. If a stage
  transition ever sounds like the music cuts out right after starting, this ordering
  is the first place to look.
- **Scale.FIT on real mobile viewports** — `main.js` now configures Phaser's Scale
  Manager (`FIT` + `CENTER_BOTH`) and `main.css` was reworked to be full-bleed on
  small screens with a decorative bordered window only above 900×700, plus a
  portrait-orientation guard overlay. The logic is standard Phaser/CSS, but actual
  letterboxing/touch-button placement on an iPhone/Android in the browser's
  responsive-design-mode is not the same as on physical hardware (real safe-area
  insets, real on-screen-keyboard behavior, real notch/dynamic-island).
- **Gamepad mapping** — button/axis indices follow the standard Gamepad API mapping,
  not tested against physical hardware (Xbox/PlayStation/generic controllers can
  differ), and Safari/iOS has historically had partial/inconsistent Gamepad API
  support — the code degrades gracefully (no gamepad detected → keyboard/touch still
  work) but that fallback path wasn't exercised on Safari specifically.
- **Vibration API** — `vibrate()` uses the Gamepad `vibrationActuator`, which has no
  iOS implementation at all (Apple doesn't expose it to web content) — the code
  already no-ops safely via try/catch, this is just a known platform gap, not a bug
  to fix.
- **Gameplay feel** — jump/gap distances, the Sky Kingdom wall-jump shaft, the
  Haunted Forest wind-current crossings, and the final-boss transformation timing
  were tuned by calculation, not by playing them.
- **Save migration** — `migrateSave()` (old save shape → new fields defaulted in)
  wasn't re-tested end-to-end against a real pre-profile-system localStorage blob.
- **Performance** — no frame-rate profiling was done on any device. Particle counts
  and physics group sizes are modest, so 60fps on a normal laptop/phone is expected
  but not measured; "no lag" and "60+ FPS on mobile" specifically have not been
  confirmed.

## Known issue history: mobile audio

A previous release attempted the standard "unlock AudioContext on first
gesture" fix and it was reported as still not working on a real phone. Rather
than assume that fix was sufficient, this release adds a second, independent
layer: listeners on both `document` and `#game-container` (not just one), no
longer `{ once: true }` (a context can re-suspend), and a visible, manually
tappable sound icon that triggers a resume attempt from directly inside a
Phaser pointer event — about as close to "guaranteed to work" as this can get
without access to the actual device. If sound is still silent after this
change, the next things to check, in order:

1. **The phone's hardware mute/silent switch (iOS).** Web Audio API sound
   (unlike some categories of HTML5 `<audio>`) is generally subject to this
   switch — this has nothing to do with the code and is worth ruling out
   first.
2. Whether the 🔇 icon in the corner ever changes to 🔊/🔈 — if it stays 🔇
   even after tapping it directly, the `AudioContext` itself is failing to
   reach `"running"` state on that device, which would need the browser's
   remote-debugging console (e.g. `chrome://inspect` from a desktop connected
   to the phone) to see the actual error.
3. Whether the device is in Low Power Mode or has a restrictive "Prevent
   Cross-Site Tracking"/content-blocker setup that could affect page scripts.

## Per-feature browser/platform support (by API, not by testing)

This documents what each feature *depends on*, so you know what's actually at risk
if something breaks on a specific device — it's a support matrix, not a test result:

| Feature | Depends on | Known gaps |
|---|---|---|
| Core game | ES modules, Canvas 2D/WebGL | Needs a static server (not `file://`) — see README |
| Audio (SFX + music) | Web Audio API | Universally supported in current browsers; mobile requires the gesture-unlock this project implements |
| Gamepad input | Gamepad API | Not supported the same way on iOS Safari; falls back to keyboard/touch |
| Vibration | Gamepad `vibrationActuator` | No iOS support at all (silently no-ops) |
| Touch controls | Pointer Events | Broadly supported; on-screen buttons only render when `ontouchstart`/`maxTouchPoints` indicates a touch device |
| Save/profiles | `localStorage` | Unavailable in some private-browsing modes (notably older iOS Safari private tabs) — the code catches the exception but progress simply won't persist in that case |

## Recommendation

Before treating this as "done," have Nati and Beniyas (or whoever) actually play
through on both a laptop and a phone: each world once, the wind-current and
wall-jump sections specifically, the final boss fight through the transformation,
and — specifically for this round of changes — confirm sound is audible from the
very first tap on a phone, and that rotating a phone to portrait actually shows the
rotate-prompt. Report anything that feels unfair, silent, or visually broken.
