# Architecture

## Module map

```
game/js/
├── main.js                  Phaser.Game config; imports and registers every scene.
├── config/                  Pure data. No Phaser references, no side effects beyond
│   │                        building the exported constants. Safe to import from
│   │                        Node or a test runner.
│   ├── themes.js            TILE size, row() ASCII-map builder, per-world color/ambient theme.
│   ├── levels.js            All 27 stage maps (9 worlds × 3 stages), keyed W<world><stage>.
│   ├── worlds.js            WORLDS array (name, boss stats, reward ability, hint text,
│   │                        stage list), VILLAIN name, FINAL_WORLD_INDEX, ENCOURAGEMENTS.
│   └── abilities.js         ABILITY_KEYS / ABILITY_LABELS / defaultAbilities().
├── systems/                 Stateful services a Scene talks to. No level/world data
│   │                        baked in — they only know about save shape, audio, input.
│   ├── save.js               Profiles (registry) + Save (active profile's mutable
│   │                        state + persistence). See "Save system" below.
│   ├── audio.js              Procedural SFX via Web Audio oscillators + gamepad vibration.
│   ├── input.js              InputController: merges keyboard/gamepad/touch into one
│   │                        per-frame snapshot {left, right, downHeld, downJustPressed,
│   │                        jumpJustPressed, actionJustPressed}.
│   └── achievements.js       Achievement definitions + checkAchievements(save).
└── scenes/                  One Phaser.Scene subclass per file. This is the only layer
    ├── PreloadScene.js       that imports Phaser features (Scene, Math, Input, Utils).
    ├── MainMenu.js
    ├── ProfileSelect.js
    ├── HowToPlay.js
    ├── Settings.js
    ├── WorldMap.js
    ├── StatsScene.js
    └── GameScene.js          The core gameplay controller — movement, physics
                               colliders, boss AI, hazards. Deliberately the largest
                               file; a Phaser "Play scene" naturally owns most of a
                               platformer's runtime logic.
```

**Dependency direction is one-way:** `scenes` → `systems` → `config`. Nothing in
`config/` or `systems/` imports from `scenes/`, which is what makes the import-graph
and level-data checks in `docs/QA_NOTES.md` possible to run under plain Node (no
browser, no DOM) — `config/` and most of `systems/` have zero DOM/Phaser
dependencies at module-evaluation time.

## Scene flow

```
PreloadScene → MainMenu → ProfileSelect → WorldMap ⇄ GameScene
                    │           │            │  │
                    │           │            │  └→ Settings
                    │           │            └→ StatsScene
                    └───────────┴──────────────→ HowToPlay
```

`GameScene` is re-started (not pushed) for every stage transition — `scene.start()`
with fresh `init(data)` payload (`worldIndex`, `stageIndex`, carried-over ring `score`,
display name, tint). This mirrors classic Sonic-style level flow: stage 1 → stage 2 →
boss → back to WorldMap.

## Save system

Two localStorage layers, both JSON:

1. **Registry** (`nati_beni_profiles_v1`) — the list of players who exist on this
   browser: `{ profiles: [{id, name, tint, createdAt}], activeProfileId }`.
2. **Per-profile save** (`nati_beni_save_v1_<profileId>`) — one independent blob per
   profile: unlocked abilities, cleared worlds, settings, nightmare-mode flag,
   lifetime stats, and unlocked achievement ids. Shape is produced by
   `defaultProfileSave()` in `systems/save.js` and migrated forward (`migrateSave`)
   so old saves gain new fields without resetting existing progress.

`Save.activate(profileId)` (called from `ProfileSelect`) loads that profile's blob
into a module-level cache; every other scene reads/writes it via `Save.current()` and
persists with `Save.persist()`. This keeps scenes from passing a mutable save object
through every `scene.start()` call — only the *identity* of the active profile needs
to travel between scenes (and even that has a fallback: `WorldMap.init()` re-derives
it from `Save.currentProfileId()` if the caller didn't pass it explicitly).

## Level data format

Levels are ASCII grids built with `row(width, ...[col, string])` from
`config/themes.js` — this avoids hand-aligning long strings character-by-character.
Legend (also duplicated as a comment at the top of `config/levels.js`):

| Char | Meaning |
|---|---|
| `x` | Ground/platform |
| `R` | Ring |
| `E` | Spike hazard |
| `N` | Patrol enemy (defeat by stomping, spin-dashing, homing-attacking, or ground-pounding nearby) |
| `S` | Spring (bounce) |
| `>` | Speed pad (dash) |
| `M` | Horizontal moving platform |
| `O` | Vertical hover platform (bobs up/down) |
| `W` | Wall-jump wall (visual only — any solid tile supports wall-jump once unlocked) |
| `D` | Breakable wall (destroyed by spin-dashing into it) |
| `L` | Lava (fire hazard — burns, respawns you at the last checkpoint) |
| `I` | Ice (low friction) |
| `U` | Mud (slows movement) |
| `F` | Wind current (pushes the player up/forward while overlapping) |
| `K` | Crumbling platform (collapses ~0.5s after first touch) |
| `C` | Checkpoint |
| `G` | Goal (not used on boss stages — boss defeat *is* the goal) |
| `P` | Player start |

### Adding a new world

1. Add three maps (`WxS1`, `WxS2`, `WxBOSS`) to `config/levels.js`, importing `row`
   from `./themes.js`.
2. Add a matching theme entry (sky/ground colors + ambient particle preset) to
   `config/themes.js`.
3. Add a `WORLDS` entry in `config/worlds.js` — pick an unused `rewardKey` (add it to
   `config/abilities.js` first if it's a new ability) and wire up the new ability in
   `GameScene.js`'s `update()`/`buildLevel()` if it needs new mechanics.
4. Re-run the structural validator described in `docs/QA_NOTES.md` before playtesting.

## Boss fights & the Super Transformation

Bosses are plain sprites driven by a small state machine inside `GameScene`
(`bossPhase`, `bossVulnerable`, a repeating `bossAttackTimer`). They telegraph an
attack, flash yellow (vulnerable window), and take damage from a stomp / spin-dash /
homing-attack / ground-pound during that window. HP thresholds bump `bossPhase`,
which increases attack frequency and patrol speed.

The final world's boss (`FINAL_WORLD_INDEX`, i.e. the last entry in `WORLDS`) is a
two-part fight: at 50% HP, `triggerSuperTransformation()` pauses the fight for a short
cutscene, then sets `this.superMode = true` — the player gets a speed/velocity boost,
becomes immune to the boss's non-vulnerable contact damage, and the boss enters a
faster final phase. This intentionally mirrors the classic "power up mid-fight" beat
(a Super Sonic-style transformation) rather than treating that form as a separate
final boss.
