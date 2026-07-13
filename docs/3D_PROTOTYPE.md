# 3D Prototype (Babylon.js)

## What this is

A separate, standalone 3D platformer under `game3d/`. It started as a "vertical
slice" (one scene, no goal, just proving the toolchain worked) and has since grown
into a small but genuinely complete, finishable game: **4 hand-built levels**, each
a run of platforms across gaps to a goal marker, with real physics the whole way.
It does not touch or depend on the live 2D Phaser game at the repo root — different
engine (Babylon.js instead of Phaser), different physics (Havok instead of Arcade
Physics), different bundle (`game3d/dist/bundle.js`, built by `npm run build:3d`),
different entry point (`game3d/index.html`).

## What it actually has

- **4 playable levels** (`game3d/js/levels.js`) — First Steps, Stepping Up, The
  Gauntlet, Sky Course, increasing in height/gap difficulty. Reach the glowing
  spinning goal marker to complete a level; a "Level Complete" overlay shows the
  next level's name and a button to continue, and the last level shows a finish
  message with a "Play Again" button that loops back to Level 1.
- **Moving-platform hazards** (Levels 2–4, `moving: {axis, range, speed}` in level
  data) — real Havok `ANIMATED`-motion physics bodies sliding back and forth, not a
  visual-only fake, correctly carrying the player if they're standing on one. Faster
  and more numerous by Level 4, as one concrete way difficulty ramps up beyond just
  bigger gaps.
- **A lives system** — 3 lives per run (❤ icons, top-right). Falling into a gap
  costs a life and respawns you at the level start; running out shows a "Game Over"
  overlay with a "Retry from Level 1" button, instead of infinite free respawns.
  Lives carry across levels within a run and reset to 3 on a fresh run.
- **5 selectable jumper outfits** (`game3d/js/personas.js`) — a character-select
  screen before the game starts, recoloring only the T-shirt/shorts materials
  (never skin/hair/eyes). Not 5 different character *models* — see "What it
  deliberately does not have" for why.
- **Touch controls** (`game3d/js/touchControls.js`) — a draggable virtual joystick
  plus Run/Jump buttons, shown only on touch-capable devices (mirrors the 2D game's
  `isTouchDevice` pattern), merged with keyboard input so both work simultaneously.
- **Real physics** (Havok, WASM) — a capsule character controller with gravity,
  platform collision, and jumping, not simple AABB overlap checks.
- **A real rigged, animated character** — Babylon's official free glTF demo asset
  (`HVGirl.glb`, loaded from `assets.babylonjs.com`, Babylon's own CDN for this
  exact purpose), with idle/walk/run/jump animation groups cross-faded by keyword
  match (not hardcoded exact names, since the asset's animation naming isn't
  guaranteed stable across exports).
- **Dynamic lighting and shadows** — a directional "sun" casting real shadow maps
  (`ShadowGenerator`, blurred exponential shadow map) plus ambient fill light, PBR
  materials on every platform.
- **A post-processing pipeline** — bloom, FXAA, ACES-ish tone mapping, film grain,
  sharpen (`DefaultRenderingPipeline`), and screen-space ambient occlusion
  (`SSAO2RenderingPipeline`). These are Babylon's own built-in pipelines, not custom
  render-engine work.
- **Camera-relative WASD/arrow movement, Shift-to-run, Space-to-jump, mouse-drag
  orbit camera, touch-equivalents of all three.**

## What it deliberately does not have

Contrasted against the original "AAA" feature ask, these are out of scope for a
browser engine like this and were not attempted: motion capture pipelines, ragdoll
physics, global illumination, volumetric fog, cloth simulation, 30–100 designed
levels (this has 4), a skill tree, leaderboards, or cloud save. Bloom/SSAO/shadows
are the realistic subset of "AAA visual quality" that a browser engine can actually
deliver; the rest would require either a custom native engine or scope no browser
game reasonably takes on.

**5 different character models, not just 5 outfit colors on one model**: this
project has no free, rigged, animation-compatible library of humanoid glTF assets
to draw from, and sourcing even the one character it does use (HVGirl.glb) already
surfaced several real bugs (see "Verified" below). Recoloring the same rig is the
same idea most platformers use for cheap, low-risk character variety, without the
asset-sourcing/rigging risk of swapping the actual mesh per option.

There's also no enemies (moving platforms are the only hazard so far), no
collectibles, and no save system (progress and lives don't persist across a page
reload) — reasonable next steps if this grows further, but out of scope for this
pass.

## Verified (automated, via headless browser — Playwright/Chromium)

Static syntax checking cannot catch WASM-loading or glTF-plugin-registration bugs —
those only surface at runtime in an actual browser. Playwright was used specifically
for that reason, and it caught four real, non-obvious runtime bugs that no static
check would have found:

1. **Havok WASM 404** — esbuild's `file` loader produces a path that resolves
   relative to the *page* URL, not the bundle's own URL, so the `.wasm` 404'd one
   directory up from where it actually was. Fixed by resolving it with
   `new URL(asset, import.meta.url).href` in `game3d/js/physics.js`.
2. **glTF loader silently not registered** — importing
   `@babylonjs/loaders/glTF/2.0/glTFLoader.js` alone does not register the `.glb`
   file extension with Babylon's `SceneLoader`, nor does it wire in the actual 2.0
   parser; both are side effects of importing `@babylonjs/loaders` (or its
   `glTF/index.js`) as a whole, which is what's used in `game3d/js/main.js`.
3. **Character fell through the ground forever** — this asset's skinned-mesh
   hierarchy bounding box comes back wildly inflated (~23m tall skeleton bind-pose
   artifact) rather than the ~1.8m the character visually renders at. Auto-fitting
   the physics capsule from that bounding box produced a degenerate shape with no
   real collision volume, so the character free-fell through a flat ground plane with
   zero deceleration, confirmed by sampling velocity/position every few hundred
   milliseconds. Fixed by giving the capsule explicit, hand-picked dimensions instead
   of relying on mesh auto-fit (`game3d/js/character.js`).
4. **Character rendered upside down and 13x too large** — the imported root carries
   a baked 180° rotation and is ~23 units tall rather than human scale. Fixed by
   resetting `rotationQuaternion` to identity and parenting the (scaled-down 1/13)
   visual mesh to a separate scale-1 physics anchor node — the standard "physics
   proxy + visual child" pattern for exactly this mismatch.

After all four fixes: character loads, stands upright at correct human scale, rests
stably on the ground (`grounded: true`, vertical velocity settles to exactly `0`),
responds to WASD movement (confirmed position actually changes), jumps (confirmed
upward velocity and a visibly different jump animation pose), and no console errors
or failed requests occur through a full load-and-interact pass.

Building the level system (going from one scene to four, with fall-recovery
respawn) surfaced a fifth real bug, caught the same way — by checking actual
position/velocity numbers over time, not by reading the code and assuming it worked:

5. **Respawn teleport caused runaway upward drift instead of a clean snap** — the
   first respawn implementation used `PhysicsBody.setTargetTransform()`, which
   despite the name is not a teleport — Havok's own docs describe it as making the
   body *seek toward* a target by adjusting velocity over time. Combined with the
   character controller's own per-frame `setLinearVelocity()` calls, the two fought
   each other: sampled position every 200ms after a respawn call and watched Y climb
   unbounded (1.15 → 1.69 → 2.13 → 2.71...) while X/Z froze mid-air, instead of
   settling at the target. Fixed by using the actual documented teleport mechanism —
   flipping `body.disablePreStep` off for exactly one physics step (via
   `scene.onAfterRenderObservable.addOnce()`) so the body pulls its transform from
   the node once, then flipping it back — confirmed by re-sampling position, which
   now snaps to the exact target and settles under normal gravity afterward.

Level progression itself (goal detection, the "Level Complete" overlay with correct
per-level text, the next-level button, the final "all complete" message, and looping
back to Level 1) was driven through all 4 levels via real button clicks (not direct
function calls) with zero errors. Level 1's actual platforming was also attempted
with genuine simulated keyboard input (not teleporting) — a scripted bot holding
forward and jumping reactively (jump when grounded) cleared 4 of its 5 platforms
before missing the final jump on its own crude timing; a human with real-time visual
feedback should reasonably do better, but **this does not constitute proof a human
can complete any given level** — see "Not verified" below.

**Moving platforms, lives/game-over, touch controls, and personas** were each
verified with real numbers/events, not by reading the code:

- Sampled each moving platform's actual world position every 500ms across Levels
  2–4 and confirmed genuine oscillation within the configured range on the
  configured axis (e.g. Level 2's platform: 2.6 → 0.9 → -2.4 → -2.9 around a base
  x=0 with range 3) — not just that the code "looks right."
- Forced three falls in a row via the same code path a real fall takes and confirmed
  lives went 3→2→1→0, the Game Over overlay appeared exactly at 0, and clicking the
  real "Retry" button (a real click, not a direct call) reset lives to 3 and reloaded
  Level 1.
- Confirmed `#touch-controls` renders on a touch-emulated page and does **not**
  render on a plain desktop page (same conditional both games use). Dragged the
  joystick knob with real pointer events and confirmed both its visual position and
  the character's actual world position changed; held the Jump button and confirmed
  its `active` CSS state toggled correctly.
- Clicked each of the 5 persona swatches for real (not by calling `loadCharacter()`
  with a hardcoded persona) and screenshotted the result — Coral and Golden both
  show the correct recolored T-shirt/shorts with skin/hair untouched, confirming the
  material-name-based tinting actually targets the right meshes on this asset.

## Not verified

- **Real device/browser testing** — everything above ran under headless Chromium
  with the `swiftshader` software GL renderer, not a real GPU, real mobile browser,
  or a smart TV browser (WebGL2 + WASM support is far less universal than the 2D
  game's plain 2D canvas, so this should not be assumed to work as broadly as the
  live game does).
- **Performance** — no frame-rate profiling was done on real hardware; the bundle is
  ~15.3MB (full, non-tree-shaken `@babylonjs/core` — see below) plus a ~2MB Havok
  WASM payload, both far heavier than the 2D game's bundle.
- **Touch controls on a real touch device** — verified via Playwright's touch
  *emulation* (synthetic pointer events, `hasTouch: true`), not an actual phone or
  tablet. The joystick and Jump/Run buttons use native browser Pointer Events on
  separate DOM elements (each touch gets its own `pointerId`, tracked
  independently) rather than Phaser's input system, which architecturally should
  support holding the joystick with one thumb while tapping Jump with the other
  without the single-touch-point limitation the 2D game had to work around
  (`activePointers: 3`) — but genuine simultaneous multi-touch specifically wasn't
  exercised in testing, only one touch point at a time.
- **Actual human completability/difficulty of Levels 2–4** — only Level 1 was
  attempted with a scripted "real input" bot (see above), and even that didn't
  cleanly finish. Levels 2–4's gap sizes are derived from the same jump-range math
  as Level 1 but were only confirmed reachable via the teleport-based goal-detection
  test, not via genuine platforming — this now also includes timing a jump onto a
  *moving* platform in Levels 2–4, which is harder to get right by feel than a
  static gap and wasn't tuned against real play at all. Real human playtesting is
  the actual next step before treating the difficulty curve as finished/tuned.

## A deliberate size/reliability trade-off

`game3d/js/*.js` import from the bare `@babylonjs/core` and `@babylonjs/loaders`
package entry points rather than individual tree-shakable deep paths
(`@babylonjs/core/Meshes/meshBuilder.js` etc.). The deep-path approach was tried
first and produced a real, reproducible bug — `Bone is not a constructor` — caused by
a circular-dependency initialization-order issue between hand-picked submodules that
isn't present when going through Babylon's own officially-tested main entry point.
Switching to the bare imports fixed it immediately and reproducibly. The cost is
bundle size (6.6MB tree-shaken vs. 15.3MB full); correctness won that trade-off.
Revisiting tree-shaking would be reasonable before this ships more broadly.

## Running it locally

```bash
npm run build:3d          # bundles game3d/js/main.js -> game3d/dist/bundle.js
python3 -m http.server 8000   # or any static file server, from the repo root
# open http://localhost:8000/game3d/
```
