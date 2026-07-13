# 3D Prototype (Babylon.js)

## What this is

A separate, standalone vertical-slice prototype under `game3d/`, built to answer one
question honestly: can a real "AAA-style" 3D character controller (physics-driven
movement, a rigged/animated character, dynamic lighting and shadows, a post-processing
pipeline) actually run in-browser without a custom engine? It does not touch or depend
on the live 2D Phaser game at the repo root — different engine (Babylon.js instead of
Phaser), different physics (Havok instead of Arcade Physics), different bundle
(`game3d/dist/bundle.js`, built by `npm run build:3d`), different entry point
(`game3d/index.html`).

This is **not** a game. There are no levels, no goals, no UI beyond a loading
indicator and a one-line control hint, and the "world" is five gray boxes on a green
plane. It exists to prove the toolchain works, not to be played.

## What it actually has

- **Real physics** (Havok, WASM) — a capsule character controller with gravity,
  ground collision, and jumping, not simple AABB overlap checks.
- **A real rigged, animated character** — Babylon's official free glTF demo asset
  (`HVGirl.glb`, loaded from `assets.babylonjs.com`, Babylon's own CDN for this
  exact purpose), with idle/walk/run/jump animation groups cross-faded by keyword
  match (not hardcoded exact names, since the asset's animation naming isn't
  guaranteed stable across exports).
- **Dynamic lighting and shadows** — a directional "sun" casting real shadow maps
  (`ShadowGenerator`, blurred exponential shadow map) plus ambient fill light, PBR
  materials on the ground and platforms.
- **A post-processing pipeline** — bloom, FXAA, ACES-ish tone mapping, film grain,
  sharpen (`DefaultRenderingPipeline`), and screen-space ambient occlusion
  (`SSAO2RenderingPipeline`). These are Babylon's own built-in pipelines, not custom
  render-engine work.
- **Camera-relative WASD/arrow movement, Shift-to-run, Space-to-jump, mouse-drag
  orbit camera.**

## What it deliberately does not have

Contrasted against the original "AAA" feature ask, these are out of scope for a
browser engine like this and were not attempted: motion capture pipelines, ragdoll
physics, global illumination, volumetric fog, cloth simulation, 30–100 designed
levels, a skill tree, photo mode, leaderboards, or cloud save. Bloom/SSAO/shadows are
the realistic subset of "AAA visual quality" that a browser engine can actually
deliver; the rest would require either a custom native engine or scope no browser
game reasonably takes on.

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

## Not verified

- **Real device/browser testing** — everything above ran under headless Chromium
  with the `swiftshader` software GL renderer, not a real GPU, real mobile browser,
  or a smart TV browser (WebGL2 + WASM support is far less universal than the 2D
  game's plain 2D canvas, so this should not be assumed to work as broadly as the
  live game does).
- **Performance** — no frame-rate profiling was done on real hardware; the bundle is
  ~15.3MB (full, non-tree-shaken `@babylonjs/core` — see below) plus a ~2MB Havok
  WASM payload, both far heavier than the 2D game's bundle.
- **Mobile/touch controls** — keyboard-only; no on-screen touch controls exist for
  this prototype.

## A deliberate size/reliability trade-off

`game3d/js/*.js` import from the bare `@babylonjs/core` and `@babylonjs/loaders`
package entry points rather than individual tree-shakable deep paths
(`@babylonjs/core/Meshes/meshBuilder.js` etc.). The deep-path approach was tried
first and produced a real, reproducible bug — `Bone is not a constructor` — caused by
a circular-dependency initialization-order issue between hand-picked submodules that
isn't present when going through Babylon's own officially-tested main entry point.
Switching to the bare imports fixed it immediately and reproducibly. The cost is
bundle size (6.6MB tree-shaken vs. 15.3MB full); for a vertical-slice prototype,
correctness won that trade-off. Revisiting tree-shaking would be reasonable before
this became a real shipped game.

## Running it locally

```bash
npm run build:3d          # bundles game3d/js/main.js -> game3d/dist/bundle.js
python3 -m http.server 8000   # or any static file server, from the repo root
# open http://localhost:8000/game3d/
```
