# Architecture

## Module map

`index.html` and `css/` sit at the repository root alongside this `js/` tree — see
the README's "Deploying" section for why (it fixed a real 403 on shared hosting).

**This `js/` tree is source, not what ships.** `index.html` loads `dist/bundle.js` —
`js/main.js` and everything it imports, bundled into one classic (non-module) script
by esbuild (`npm run build`). The module structure below is for maintainability
only; browsers never load these files directly. See the README's "Development"
section for why (smart TV / old embedded browser compatibility) and the rebuild
step you need after editing anything here.

```
js/
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
│   ├── audio.js              Procedural SFX + adaptive ambient Music (Web Audio
│   │                        oscillators, no audio files), gamepad vibration, and
│   │                        initAudioUnlock() — the cross-browser/mobile autoplay
│   │                        workaround. See "Audio system" below.
│   ├── input.js              InputController: merges keyboard/gamepad/touch into one
│   │                        per-frame snapshot {left, right, downHeld, downJustPressed,
│   │                        jumpJustPressed, actionJustPressed}.
│   ├── achievements.js       Achievement definitions + checkAchievements(save).
│   └── platform.js           isTouchDevice — the one runtime feature-detect shared
│                              by input.js and ui/orientationGuard.js.
├── ui/                      Presentation helpers with no game-rule knowledge — reused
│   │                        by every menu scene so they share one visual language.
│   ├── uiHelpers.js           makeButton() (hover/press feedback + click sound),
│   │                        addHoverFeedback() (same, for non-text game objects),
│   │                        sceneTransition()/fadeInScene() (camera fade cuts),
│   │                        screenAnchors() (layout relative to real screen size),
│   │                        autoRelayoutOnResize() (restarts a menu scene if the
│   │                        real viewport size changes after it's already showing).
│   ├── orientationGuard.js    Shows a DOM "please rotate" overlay when a touch
│   │                        device is held in portrait — lives outside the Phaser
│   │                        canvas entirely, so it works regardless of which scene
│   │                        is active.
│   ├── soundIndicator.js      Persistent tappable 🔊/🔈/🔇 HUD icon — a guaranteed
│   │                        manual audio-unlock fallback plus a visible mute toggle.
│   └── soundSetupModal.js     Blocking "enable sound" modal shown once on first
│                              touch-device launch; reachable again from Settings.
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

Every boss fight also opens with a short camera flourish (`setupBoss()`): the player
is frozen (`body.moves = false`, not just `inputLocked`, so they don't drift during
the cut), the camera pans/zooms to the boss and back, then hands control back. This
is the "cinematic boss intro" — a scripted camera move, not a pre-rendered cutscene.

The health bar (`drawBossBar()`/`updateBossBar()`/`drainBossBarToZero()`) sits on
its own solid dark panel with a bright border (`bossBarPanel`, depth 1499, just
below the bar itself at 1500-1501) specifically so it can't visually blend into a
similarly-dark world background (Volcano, Haunted Forest, the final Fortress all
have dark skies) — a plain semi-transparent bar risked reading as "hidden." The fill
tweens (scaleX from a left-anchored origin) rather than snapping on every hit, with
a white damage flash, so the reduction reads as motion, not a jump-cut.

### Escaping a boss

Every boss stage map (`config/levels.js`, `W*BOSS`) was extended ~8-12 tiles past
the boss's patrol range (`bossBaseX ± 160px`, i.e. ±4 tiles — see `update()`'s
boss-patrol block) with a `G` goal placed near the new far end. `reachGoal()`
checks `this.stageData.type === "boss"` and routes there to `bossEscaped()` instead
of the normal next-stage transition. Reaching it is skill-based, not free — the
boss still deals contact damage on non-vulnerable touch exactly like normal, you
just never have to actually fight it to reach the exit, since the arena is wide
enough that the boss's patrol never reaches the goal itself.

`bossEscaped()` deliberately mirrors `bossDefeated()`'s save writes (world cleared,
ability granted, next world unlocked) so escaping can never soft-lock a later
world that assumes you have that ability — but it does **not** increment
`stats.bossesDefeated`, so the boss-related achievements (`boss_slayer`,
`friend_finder`) and "was this a real win" bookkeeping still require actually
beating the boss. Disabled during Boss Rush (`reachGoal()` no-ops on the boss
goal when `this.bossRush` is true) — the entire point of that mode is fighting
every boss, so a shortcut there would defeat its purpose.

### Boss Rush mode

`GameScene.init()` accepts `{ bossRush: true, bossRushIndex, bossRushStartTime }`
instead of `{ worldIndex, stageIndex }` — it forces `stageIndex` to `2` (every
world's boss stage) and uses `bossRushIndex` as the world index, so it reuses each
world's *existing* boss arena with no new level data. `bossDefeated()` branches on
`this.bossRush`: mid-run, it advances to `bossRushIndex + 1` instead of returning to
`WorldMap`; on the last boss, `bossRushDefeated()` computes elapsed time from
`bossRushStartTime`, updates `save.stats.bestBossRushSeconds` if it's a new best, and
shows a completion summary. Rings (`score`) carry over between fights via the same
scene-data threading normal stage-to-stage transitions already use — Boss Rush is
one continuous run, not 9 isolated fights with a full ring refill between each.
Unlocked from `WorldMap` once `save.gameCompleted` is true (same gating as Nightmare
Mode).

## Audio system

Everything audible is generated at runtime with the Web Audio API in
`systems/audio.js` — there are no `.mp3`/`.wav` files anywhere in the project:

- **SFX** — short oscillator "beeps" with per-action frequency/envelope (jump, ring,
  hurt, boss-hit, achievement, UI click/hover, etc.).
- **Music** (`Music`, a module-level singleton) — a generative loop per world: a
  plucked arpeggio (melody), a pulsing bass note, and light percussion (filtered
  noise "hat" + a synthesized sine-sweep "kick"), scheduled precisely against the
  `AudioContext` clock rather than with individual `setTimeout`s (drift-free —
  see Chris Wilson's "A Tale of Two Clocks" for why that matters for anything
  rhythmic in Web Audio). Each world has its own root note / scale
  (`THEME_CONFIGS` — major or minor pentatonic, or natural minor) and tempo, so
  worlds sound distinct rather than just transposed. `Music.playTheme(themeIndex)`
  starts the loop on `GameScene.create()`; `Music.setBossIntensity(true)` raises
  the tempo ~15% and thickens the percussion, picked up at the start of the next
  loop iteration rather than jarring the timing mid-bar; `Music.stop()` fades out
  on scene `shutdown`. This is a genuine step up from a static ambient pad, but
  it's still generated, not composed/recorded — see the README's "What this
  project intentionally does NOT include" for that tradeoff.
- **Autoplay/mobile unlock** — `initAudioUnlock()` (called once from `main.js`)
  attaches one-time `pointerdown`/`touchstart`/`keydown` listeners that create and
  resume the shared `AudioContext` and play a one-sample silent buffer, which is the
  standard cross-browser fix for browsers (especially iOS Safari) that start every
  `AudioContext` suspended until a genuine user gesture unlocks it. This is the fix
  for "the sound system doesn't reliably work" — it no longer depends on the user
  happening to click a specific button first.
- **Settings** — `save.settings.sfxVolume` / `save.settings.musicVolume` (0-1,
  independently adjustable — a 5-step tappable cycle in the Settings scene, not
  just on/off) scale `SFX.*` and `Music.*` volume respectively via a small
  `getVolume()` check in `audio.js`. Older saves that had boolean
  `settings.sfx`/`settings.music` are migrated forward (true→1, false→0) rather
  than silently losing the player's preference — see `systems/save.js`'s
  `migrateSave()`.

## Responsive design & mobile

`main.js` configures Phaser's Scale Manager as `Phaser.Scale.RESIZE`, seeded with
the *actual* `window.innerWidth`/`innerHeight` rather than a fixed fallback —
Phaser needs to own the scale calculation for pointer/touch coordinates to map
back to game-space correctly, and seeding it with the real size (instead of
letting RESIZE mode's own first auto-correction be the only thing that gets it
right) closed a real bug where a stale initial measurement on some mobile
browsers left the canvas rendered wider than the actual screen, pushing every
right-anchored control off-screen with no way to reach it (see
`docs/QA_NOTES.md`'s "Known issue history" for the full writeup). `css/main.css`
also has a hard safety net independent of that fix — `max-width`/`max-height:
100%` on the canvas — so it can never visually overflow the viewport regardless
of what Phaser computes internally.

`css/main.css` is mobile-first: the game fills the viewport edge-to-edge on small
screens, and only above `900×700` does the decorative bordered "floating window"
look (border, glow, rounded corners) reappear, via a media query — there's no reason
to eat screen space with a border on a phone.

Menu scenes compute their whole layout once from `screenAnchors()` at `create()`
time; `autoRelayoutOnResize()` restarts a scene if the real size changes while
it's already showing (rotation, a mobile browser's address bar collapsing
mid-visit). `GameScene` doesn't use this — restarting mid-stage would lose
progress — and instead repositions its own HUD/boss-bar/touch-controls directly
on the `resize` event.

`ui/orientationGuard.js` is intentionally *not* a Phaser scene — it's a plain DOM
overlay (`#orientation-guard` in `index.html`) toggled by a `resize`/`orientationchange`
listener, so it works no matter which scene is active, including mid-transition.
This is a landscape platformer; there's no attempt to make it "work" in portrait,
only to ask the player to rotate.
