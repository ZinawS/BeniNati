# QA Notes

This is an honest account of what was actually checked before this project was
committed — not a formal test report, because no automated or manual browser testing
was run against a live page. Treat the "Verified" section as real, and the
"Not verified" section as an explicit to-do before you'd call this release-ready.

## Verified (automated, reproducible)

- **JS syntax** — every file under `game/js/` parses cleanly as an ES module
  (`node --input-type=module --check`).
- **Import graph resolves** — every `import`/`export` across all 13 modules resolves
  to a real, correctly-named export. Verified by loading `main.js` under Node with a
  minimal `Phaser` global stub (see the command below) — this would fail loudly on a
  typo'd import or a missing export.
- **Level data structural integrity** — for all 9 worlds × 3 stages: every row in a
  stage's ASCII map has the same length (no silently-misaligned tiles), every
  character used is a recognized tile type, every non-boss stage has exactly one
  player start (`P`) and at least one goal (`G`).
- **Extraction fidelity** — the modular `config/worlds.js` was diffed structurally
  against the original monolithic file's level data (same check, same result) to
  confirm the file split didn't silently drop or corrupt a tile during the manual
  extraction.

Reproduce the import-graph and level-data checks:

```bash
cd game/js
cat > /tmp/phaser_stub.mjs << 'EOF'
globalThis.Phaser = {
  Scene: class Scene {},
  Math: { Distance: { Between: () => 0 }, Angle: { Between: () => 0 }, Between: () => 0, Clamp: (v) => v },
  Input: { Keyboard: { JustDown: () => false } },
  Utils: { Array: { GetRandom: (a) => a[0] } },
  AUTO: 1,
  Game: class Game {},
};
globalThis.navigator = { getGamepads: () => [], maxTouchPoints: 0 };
globalThis.document = { getElementById: () => null, createElement: () => ({ getContext: () => ({}) }) };
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
EOF
node -e "import('/tmp/phaser_stub.mjs').then(() => import('./main.js')).then(() => console.log('OK'))"
```

## Not verified (needs a real browser)

These require actually clicking through the game — no shell command can substitute:

- **Gameplay feel** — jump/gap distances, the Sky Kingdom wall-jump shaft, the
  Haunted Forest wind-current crossings, and the final-boss transformation timing
  were tuned by calculation, not by playing them.
- **Touch controls** — the on-screen buttons in `systems/input.js` have never been
  tapped on an actual touchscreen; button placement/size may need adjustment.
  particularly at different aspect ratios (the buttons use fixed 800×600-space
  coordinates).
- **Gamepad mapping** — button/axis indices follow the standard Gamepad API mapping,
  but were not tested against physical hardware (Xbox/PlayStation/generic
  controllers can differ).
- **Cross-browser behavior** — only checked for syntax/module compatibility, not
  actually loaded in Chrome/Firefox/Safari. ES modules and the Web Audio /
  Vibration APIs used are all broadly supported in current browsers, but "should
  work" isn't the same as "was seen working."
- **Save migration** — the `migrateSave()` upgrade path (old save shape → new fields
  defaulted in) was written carefully and mirrors a version that was validated
  earlier in this project's history, but wasn't re-tested end-to-end against a real
  pre-profile-system localStorage blob.
- **Performance** — no frame-rate profiling was done. The particle counts and
  physics group sizes are modest (this is not a graphically heavy game), so 60fps on
  a normal laptop is expected but not measured.

## Recommendation

Before treating this as "done," have Nati and Beniyas (or whoever) actually play
through: each world once, the wind-current and wall-jump sections specifically, and
the final boss fight through the transformation. Report anything that feels
unfair or broken and it can be tuned quickly — the level data lives in one file
(`config/levels.js`) specifically to make that easy.
