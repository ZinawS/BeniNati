# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is
[Semantic Versioning](https://semver.org/).

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
