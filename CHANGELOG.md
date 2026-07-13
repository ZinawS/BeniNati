# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is
[Semantic Versioning](https://semver.org/).

## [1.13.0] — Mobile viewport/HUD fixes (2D game)

### Fixed
- **Root cause of persistent top-HUD cropping on real mobile browsers**:
  `window.innerWidth/innerHeight` reports the *layout* viewport, which stays
  a fixed size regardless of whether the browser's address bar/toolbar is
  currently showing — it does not shrink to match the actually-visible area.
  Content sized/anchored against that inflated height (score text, pause/
  sound icons) could end up rendered partly underneath the browser's own
  chrome — genuinely invisible, not just a CSS clipping issue. Switched to
  `window.visualViewport`, which reports the real visible area and fires its
  own resize event when the chrome shows/hides mid-session (which `window`'s
  own resize event does not reliably do). Guarded against a real crash this
  surfaced during testing: `visualViewport` can fire its first resize event
  before Phaser's Scale Manager finishes booting, and calling
  `game.scale.resize()` that early threw — now gated on `game.isBooted`.
- **"Back" button anchored below the visible area on short/notched phones**
  across Settings, How To Play, Stats, Profile Select, and World Map — all
  five used to anchor at `screenHeight - N`, which (combined with the above
  inflated-height issue) could push the button below the fold. Added
  `safeAreaInsets()`-aware `safeBottom` to `screenAnchors()` and switched all
  five to it, so on a phone with a bottom safe-area inset (home indicator,
  rounded corners in landscape) the button also clears that.

## [1.12.0] — 3D game: 4 real levels (was a single-scene prototype)

The `game3d/` Babylon.js prototype is now a small, genuinely playable game
instead of one static scene: 4 levels (`game3d/js/levels.js`), each a run of
platforms across gaps to a glowing goal marker, with a "Level Complete"
overlay between levels and a finish screen with "Play Again" on the last one.
Falling into a gap respawns you at the level's start instead of being a dead
end. See `docs/3D_PROTOTYPE.md` for what's verified and what still needs real
human playtesting before the difficulty curve is considered final.

### Added
- 4 levels: First Steps, Stepping Up, The Gauntlet, Sky Course.
- Fall-threshold respawn per level.
- Level-complete / game-complete UI overlay with a real "Next Level"/"Play
  Again" button.

### Fixed
- The first respawn implementation used `PhysicsBody.setTargetTransform()`,
  which — despite the name — makes a physics body *seek toward* a target by
  adjusting velocity over time, not teleport to it. Combined with the
  character controller's own per-frame velocity writes, this produced
  runaway upward drift instead of a clean respawn (caught via headless
  position sampling, not by reading the code). Fixed using Havok's actual
  teleport mechanism (`body.disablePreStep` toggled for one physics step).

## [1.11.0] — Mobile HUD visibility fix

### Fixed
- The sound icon (top-right, in gameplay and the main menu) had no background
  panel behind it — just a bare emoji glyph. On short mobile-landscape
  viewports, the level's own ground geometry can visually sit right behind it,
  making it hard to see or read as HUD at all rather than part of the world.
  Gave it the same solid backdrop the pause icon already had, right next to it.
- The main menu's sound icon used a hardcoded `x=764` position rather than one
  computed from the actual screen width, so on any screen not exactly that
  wide it wasn't actually anchored to the corner the way it looked on the
  screen it was built against.
- Added safe-area-inset awareness (`env(safe-area-inset-*)`, needs the
  already-set `viewport-fit=cover`) to every screen-edge-anchored gameplay HUD
  element (score text, pause icon, sound icon) — phone notches/rounded
  corners commonly sit on a *side* in landscape, not just the top, and edge-
  flush UI can end up partly behind one. Resolves to 0 (no change) on
  anything without a notch, so this can't regress existing layouts — it can
  only add clearance where a real device needs it.

## [1.10.0] — Ring combo, more juice, Photo Mode

Backported the realistically-achievable subset of a much larger "AAA feature"
wishlist into the 2D game — the rest (motion capture, ragdoll physics, global
illumination, volumetric fog, 30-100 designed levels, etc.) isn't feasible in a
2D Phaser browser game and wasn't attempted; see `docs/3D_PROTOTYPE.md` for
where that ambition actually went instead.

### Added
- **Ring combo multiplier**: collecting rings within 2.5s of each other builds
  a combo counter (shown in the HUD once it reaches x2); every 5th ring in a
  row grants a +5 bonus and a toast. Resets on taking damage.
- **More particle juice**: a sparkle burst on every ring collected, and a dust
  puff on ground jumps — filling gaps next to the existing landing/ground-pound/
  lava-hit/boss-defeat effects, using the same emitter pattern.
- **Photo Mode**: a new pause-menu button that hides all HUD/menu chrome for one
  frame, captures a clean PNG of just the game world (`game.renderer.snapshot()`),
  and downloads it.

## [1.9.0] — Landing dashboard, 3D prototype

### Added
- A small landing dashboard at the repository root (`index.html`) linking to the
  2D game and a new experimental 3D prototype, so both are reachable from one
  entry point instead of only the 2D game living at the root URL.
- `game3d/` — a standalone Babylon.js vertical-slice prototype (physics-driven
  character controller, a rigged/animated glTF character, dynamic shadows,
  bloom/SSAO post-processing). Not a game — see `docs/3D_PROTOTYPE.md` for
  honest scope, what's verified, and the real runtime bugs found and fixed
  while building it (WASM path resolution, glTF loader plugin registration, a
  degenerate physics capsule, and a 13x mesh scale/orientation mismatch).

### Changed
- The 2D game moved from the repository root into `2d/` (`2d/index.html`,
  `2d/js/`, `2d/css/`, `2d/dist/`, `2d/legacy/`) so the root `index.html` could
  become the dashboard instead. Purely a location change — re-verified via
  headless browser that the game renders identically from its new path, and
  `npm run build` was updated to point at the new `2d/js/main.js` →
  `2d/dist/bundle.js` paths. `.htaccess` stays at the true repository root,
  since it configures the actual server document root (now the dashboard's
  directory), not the 2D game specifically.

## [1.8.0] — Boss escape routes

### Added
- Every boss arena now has an alternate way through: an exit past the boss's
  patrol range (extended ~8-12 tiles past its `±160px` patrol boundary) lets
  you skip the fight entirely by running/jumping past it, still risking a
  hit like normal if you're not careful. Reaching it still frees the
  world's friend, grants the ability, and unlocks the next world — exactly
  like defeating the boss — so it can never block progress into a later
  world that assumes you have that ability. It does *not* count toward the
  `bossesDefeated` stat or its achievements, so actually winning the fight
  still means something. Disabled during Boss Rush, where fighting every
  boss is the entire point.

## [1.7.0] — Boss Rush mode, boss bar visibility fix

### Fixed
- The boss health bar's plain dark-gray fill could blend into similarly dark
  world backgrounds (Volcano, Haunted Forest, the final Fortress), reading as
  "hidden." Gave it its own solid backdrop panel with a bright border so it's
  always clearly visible regardless of what world it's over.

### Added
- **Boss Rush mode**: fight all 9 bosses back-to-back, in order, rings
  carrying over between fights instead of refilling. Unlocked from the World
  Map once the story is complete (same gating as Nightmare Mode). Timed, with
  your best clear time saved and shown on the World Map and Stats screen, and
  a new "Boss Rush Champion" achievement for finishing a run. Reuses each
  world's existing boss arena — no new level content needed, which is why
  this was the fast option.

## [1.6.0] — Bundled build (fixes Samsung TV / old-browser loading), touch layout cleanup

### Fixed
- **Wouldn't load at all on a Samsung TV browser, no visible error.** Root
  cause: the site's entry point was `<script type="module">`, and smart TV
  browsers run embedded, infrequently-updated engines that frequently have
  partial-to-no support for ES modules. Fixed by bundling `js/main.js` and
  everything it imports into a single classic script (`dist/bundle.js`, via
  esbuild) — `index.html` now loads that instead. This is a strictly more
  broadly compatible way to ship JavaScript; bonus side effect: the game now
  also opens directly from `file://` with no local server needed, since a
  classic script has none of `type="module"`'s CORS restriction on `import`.
  See `docs/QA_NOTES.md` for the full writeup.
- Touch controls: the arrow triangles were rendering visibly off-center
  within their circles (asymmetric point coordinates — apex at +15, base at
  -12, not mirrored). Fixed with symmetric points.
- Touch controls redesigned into one aligned bottom strip: both button
  clusters now share the same Y baseline and panel height, with buttons
  evenly spaced within each — replacing an earlier layout that stacked
  up/down vertically with the action button floating separately above,
  which read as misaligned.

### Added
- `npm run build` (esbuild) — see the README's new "Development" section.
  `dist/bundle.js` is committed to the repo, so deploying never requires
  anyone, including a shared host with no build pipeline, to run a build
  step themselves; only editing `js/` source requires rebuilding.

## [1.5.0] — Fixed mobile display cutoff, real volume control

### Fixed
- **Game content was cut off / shifted left on mobile, controls unreachable.**
  Root cause: `Phaser.Scale.RESIZE` was seeded with a hardcoded 800x600
  fallback instead of the real viewport size, and on some mobile browsers
  RESIZE mode's own first auto-correction can be stale (e.g. mid-layout while
  the address bar is still collapsing) — leaving the canvas rendered at the
  800px fallback width on screens far narrower than that, with the overflow
  silently clipped (not scrollable) by `overflow: hidden`. Visible on the
  left where it happened to start; every right-anchored control (up/down,
  action, pause, sound icon) was off-screen with no way to reach it. Fixed
  two ways: seeded the Scale Manager with the actual `window.innerWidth`/
  `innerHeight`, and added `max-width`/`max-height: 100%` on the canvas as a
  hard CSS safety net so it can never visually overflow the viewport again
  regardless of what Phaser computes internally — see `docs/QA_NOTES.md` for
  the full writeup.
- Menu scenes (World Map, Settings, Profile Select, etc.) now restart
  themselves via a new `autoRelayoutOnResize()` helper if the real screen
  size changes while they're already showing — previously they only laid
  out correctly once, at first load.

### Changed
- Sound Effects and Music each got a real, independently-adjustable volume
  level (100/75/50/25/0%, tap to cycle, with a level bar) in Settings instead
  of just an on/off toggle, so both are genuinely controllable together from
  the same screen rather than being all-or-nothing. Older saves with the
  previous boolean on/off settings are migrated forward automatically.

## [1.4.0] — Fixed Hostinger 403, real melodic soundtrack

### Fixed
- **403 Forbidden on Hostinger (and any Apache/LiteSpeed shared host).** Root
  cause: `index.html` lived in `game/`, not the repository root, so the
  actual server document root had no index file — Apache's standard,
  secure-by-default behavior for a directory with no index and directory
  listing disabled is exactly a 403, not a 404. Fixed by moving `index.html`,
  `css/`, and `js/` to the repository root, so any static host (Hostinger,
  Netlify, GitHub Pages, a plain nginx/Apache box) serves the site correctly
  by just hosting the repo contents as-is, no publish-directory
  configuration required. Also added a `.htaccess` with an explicit
  `DirectoryIndex index.html` and disabled directory listings as extra
  insurance on shared hosting.
- `netlify.toml` updated accordingly (`publish = "."` — the repo root already
  works with Netlify's default, this just makes it explicit).

### Changed
- Replaced the ambient-pad-only background music with a real generative loop
  per world: plucked melodic arpeggio, pulsing bass, and light percussion
  (noise "hat" + synth "kick"), precision-scheduled against the AudioContext
  clock instead of individual timers. Each world has its own scale and tempo
  (bright major pentatonic for Green Hills/Ocean/Sky, darker minor for
  Volcano/Crystal Cave/Haunted Forest/Cogsworth's Fortress) so worlds are
  musically distinct, not just transposed copies of one pad. Boss fights
  raise the tempo and thicken the percussion instead of just adding a pulse
  layer. See `docs/ARCHITECTURE.md` for the implementation details and the
  README for the honest scope tradeoff (generated, not composed/recorded).

## [1.3.0] — True edge-to-edge landscape fill, split thumb controls, sound modal

### Changed
- Switched Phaser's Scale Manager from `FIT` (letterboxed, preserves 800x600's
  4:3 aspect ratio with black bars on most phone aspect ratios) to `RESIZE`
  (fills the actual viewport exactly). Every scene now computes its layout
  from `this.scale.width`/`height` via a new `screenAnchors()` helper instead
  of assuming a fixed 800x600 canvas, so menus stay centered and gameplay HUD
  (score, boss bar, hints, sound icon) stays correctly anchored to the real
  screen edges on any device — narrow phone or wide tablet.
- Touch controls reorganized by thumb instead of a single D-pad cluster:
  **left thumb** = forward/backward (left/right arrows) anchored to the left
  edge, **right thumb** = up/down (up doubles as jump) anchored to the right
  edge, with the action (homing attack / air dash) star button in its own
  cluster above. Rebuilds automatically on resize/rotate.
- The world-select and stats screens now use extra horizontal space instead
  of wasting it: more world tiles per row on wide screens, stats/achievements
  laid out side-by-side instead of one long scrolling column.

### Fixed
- **Multi-touch was silently broken.** Phaser only tracks a single touch
  point unless configured otherwise, which is fatal for a two-thumb control
  scheme — holding a movement direction with one thumb while tapping
  jump/action with the other simply wouldn't register the second touch.
  Set `input.activePointers: 3` in the game config.
- **No way to pause on mobile at all.** Pause was wired to the keyboard ESC
  key only, which doesn't exist on a touchscreen. Added a tappable ⏸ icon in
  the HUD, and the pause screen itself is now real buttons (Resume, Quit to
  World Map) instead of static "(ESC to resume)" text.

### Added
- A blocking "Sound Settings" modal shown once (per browser) on first launch
  on touch devices — lets players explicitly turn sound on/off before
  playing, and the tap to dismiss it doubles as a direct, synchronous
  AudioContext-unlock gesture (a third, even more reliable layer on top of
  the previous two audio-unlock fixes). Reachable again any time from
  Settings → "Sound Setup".
- The portrait-orientation overlay is now a proper modal card (bordered,
  dimmed backdrop) instead of plain full-bleed text.

## [1.2.0] — Real touch controls, guaranteed audio unlock fallback, more juice

### Fixed
- Mobile audio: `initAudioUnlock()` previously attached one-time listeners only
  to `document`. It now also listens on `#game-container` directly (in case a
  mobile browser's touch handling on a canvas doesn't reliably bubble a plain
  page click) and keeps retrying on every gesture instead of only the first
  one, since a context can re-suspend (e.g. after backgrounding the tab).
- Added a persistent, always-tappable sound indicator (🔊/🔈/🔇) in the HUD —
  tapping it triggers a fresh, guaranteed-synchronous unlock attempt directly
  from a Phaser pointer event, as a fallback if the passive listeners still
  don't catch it on a specific device, and doubles as a visible mute toggle.

### Changed
- On-screen touch controls completely rebuilt: real drawn triangle arrows (not
  font glyphs, which render inconsistently across mobile browsers) in a
  proper D-pad cross (up/down/left/right — up is jump), backed by its own
  rounded semi-transparent panel so it reads as a real control pad, not
  floating icons on bare game art. The action button (homing attack / air
  dash) is a distinct star icon in its own panel, color-coded differently
  from movement. All buttons now show a pressed state (scale + fill change).

### Added
- Landing-impact juice: a dust-particle puff + soft thud sound when the
  player lands from a fall of meaningful height.

## [1.1.0] — Audio reliability, mobile responsiveness, UI/cinematic polish

### Fixed
- Audio no longer depends on a specific button click to work: `initAudioUnlock()`
  unlocks the shared `AudioContext` on the very first tap/click/keypress anywhere on
  the page, which is the standard fix for browsers (especially mobile Safari) that
  start audio suspended until a genuine user gesture.
- Mobile responsiveness: replaced manual CSS-only canvas scaling with Phaser's Scale
  Manager (`FIT` + `CENTER_BOTH`), which is what correctly maps touch/pointer
  coordinates back to game space — the old approach could work visually while
  silently mis-registering touch input.

### Added
- Continuous adaptive background music (procedural, Web Audio — no audio files), one
  ambient theme per world, intensifying during boss fights, with independent
  Music/SFX on/off toggles in Settings.
- Portrait-orientation guard: a DOM overlay prompts touch users to rotate to
  landscape instead of squeezing the game into a narrow strip.
- `js/ui/` layer: a shared `makeButton()`/`addHoverFeedback()` component (hover
  scale, press squash, click sound) and `sceneTransition()`/`fadeInScene()` camera
  fades, applied across every menu scene for a consistent, more premium feel.
- Cinematic per-world title cards on stage 1, and a scripted camera pan/zoom
  flourish when a boss fight begins.
- CSS is now mobile-first: full-bleed on small screens, with the decorative
  bordered "floating window" look reserved for screens with room to spare
  (≥900×700).

### Changed
- Minor perf cleanup: `GameScene.update()` no longer calls `enemies.getChildren()`
  twice per frame.

### Notes
- `docs/QA_NOTES.md` now includes a per-feature browser/platform support matrix and
  is explicit about what's code-reviewed vs. what needs real-device testing
  (physical iOS/Android hardware, real gamepads) — this release improves the code
  paths that were most likely causing "sound doesn't work" and "mobile feels bad,"
  but wasn't validated on physical devices.

## [1.0.0] — Modular release

### Added
- Full project restructure from a single HTML file into a modular ES module project
  (`game/js/config`, `systems`, `scenes`).
- Multi-profile player system: create, rename, and delete players from a new
  Profile Select screen; each profile has fully independent save data. Replaces the
  old hardcoded "Nati or Beniyas" choice.
- Gamepad input support (standard mapping) and on-screen touch controls for
  touch-capable devices, unified with keyboard input through a single
  `InputController`.
- Achievements system (8 criteria-based achievements) and a Stats screen showing
  lifetime rings/enemies/bosses/deaths per profile.
- `README.md`, `docs/ARCHITECTURE.md`, and `docs/QA_NOTES.md`.
- MIT license.

### Changed
- Boss fights now toggle a `.boss-mode` CSS class on the game container for a red
  glow effect (ported from the earlier `game2.html` prototype's visual polish).

### Notes
- This release supersedes both original prototypes, which are kept for reference in
  `legacy/` (`game-classic.html`, `game2-reference.html`).

## [Unreleased, prior to 1.0.0] — single-file prototype history

These entries describe the single-file `game.html` prototype before the modular
restructure, preserved here for context:

- 9 worlds (Green Hills, Ocean Kingdom, Snow Mountains, Sky Kingdom, Volcano World,
  Crystal Cave, Haunted Forest, Cyber City, Cogsworth's Fortress), each with 2 normal
  stages + 1 boss stage.
- Ability-gated progression: Double Jump, Spin Dash, Wall Jump, Homing Attack,
  Air Dash, Ground Pound, Ring Magnet, Shield — one unlocked per world boss.
- Lava, ice, mud, wind currents, and crumbling platforms as new hazard/physics tile
  types.
- A two-phase final boss with a mid-fight "Super Transformation" power-up.
- Procedural Web Audio sound effects, ambient weather particles per world,
  localStorage save/progress, a How-To-Play tutorial, and a Settings screen
  (encouragement-message toggle, Nightmare Mode).
- Started from an original 3-level prototype with basic ring/spike/spring/speed-pad
  mechanics.
