# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is
[Semantic Versioning](https://semver.org/).

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
