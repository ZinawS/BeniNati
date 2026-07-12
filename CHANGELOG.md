# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/); versioning is
[Semantic Versioning](https://semver.org/).

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
