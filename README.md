# Nati & Beniyas's Speedy Adventure

A browser-based 2D platform-adventure game built with [Phaser 3](https://phaser.io/). No
external art or audio assets — every sprite and sound effect is generated procedurally
at runtime. The deployed site is static HTML/CSS/JS with no server-side anything; a
small bundling step (see "Development" below) exists purely for browser compatibility,
not because the game needs a backend.

Rescue your friends from **Professor Cogsworth** across 9 themed worlds, unlocking a new
movement ability every time you beat a world's boss, and power up into a Super
Transformation for the final fight.

## Play it

The repository root `index.html` is a small **dashboard** — pick a game and it links
you to the right subfolder. No server required for the dashboard itself, and no
server required for the 2D game either (it works straight from `file://`); the 3D
prototype needs to be served (WASM/ES modules generally require `http(s)://`, not
`file://`).

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

- **2D Platformer** — `2d/index.html`. The full game: 9 worlds, boss fights, Boss
  Rush, achievements, mobile/TV support. This is the one described in the rest of
  this README.
- **3D Platformer** — `game3d/index.html`. An experimental Babylon.js game — real
  physics, a rigged character, dynamic shadows, post-processing, across 4 goal-based
  platforming levels. Small and early, not as polished/tested as the 2D game — see
  [`docs/3D_PROTOTYPE.md`](docs/3D_PROTOTYPE.md) for honest scope and limitations.

> A legacy single-file version from earlier in this project's history is kept at
> [`2d/legacy/game-classic.html`](2d/legacy/game-classic.html) for reference, but
> it's missing everything from the profile system onward — not needed for normal
> use, since `2d/index.html` now works standalone the same way.

## Development

The 2D game's source lives in `2d/js/` as ES modules (see `docs/ARCHITECTURE.md`) —
that's what you edit. `2d/index.html` doesn't load it directly, though: it loads
`2d/dist/bundle.js`, a single classic script produced from `2d/js/main.js` by
[esbuild](https://esbuild.github.io/).

**Why bundle instead of loading the ES modules directly**, like earlier versions of
this project did: `<script type="module">` isn't reliably supported on older/embedded
browser engines — notably smart TV browsers (this surfaced as the game not loading at
all, with no visible error, on a Samsung TV browser). A bundled classic script has no
such dependency and works essentially everywhere, as a bonus also removing the need for
a local server during development (no more CORS-on-`import` restriction to work around).

If you change anything under `2d/js/`, rebuild before testing or deploying:

```bash
npm install   # once
npm run build # regenerates 2d/dist/bundle.js — commit it along with your source changes
```

`2d/dist/bundle.js` is committed to the repo (not `.gitignore`d) specifically so that
deploying never requires anyone — including a shared host with no build pipeline,
like Hostinger — to run a build step themselves.

## Deploying to shared/static hosting (Hostinger, etc.)

Upload the contents of this repository to your host's public web folder (on
Hostinger, that's `public_html`) — the root `index.html` (the dashboard), `2d/`,
`game3d/`, and everything else can go straight in, no extra subfolder. Because
`index.html` sits at the root, the site loads automatically at your domain's root URL.

If you get a **403 Forbidden** on the root URL, it almost always means `index.html`
isn't actually sitting directly in the folder your domain points at — a common
mistake is uploading this repo as a nested folder (e.g. `public_html/project-name/`)
instead of uploading its *contents* into `public_html/` directly. A `.htaccess` is
included with an explicit `DirectoryIndex index.html` and directory-listing disabled
as extra insurance, but it can't fix files being in the wrong folder.

Netlify/Vercel/Cloudflare Pages/GitHub Pages all work the same way — point them at
the repo root with no build command. `netlify.toml` makes that explicit for Netlify,
but since `index.html` is at the root now, it isn't strictly required.

## Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | ← / → | Left stick / D-pad | On-screen ◀ ▶ |
| Jump / Double Jump | ↑ or Space | A / Cross | On-screen ● |
| Spin Dash | Hold ↓, release | D-pad down | On-screen ▼ |
| Ground Pound | ↓ in mid-air | D-pad down (mid-air) | On-screen ▼ |
| Homing Attack / Air Dash | X or Z | B or X | On-screen ✕ |
| Pause | Esc | — | — |

Touch buttons appear automatically on touch-capable devices.

## Players & Profiles

The first screen after the main menu is a player picker, not a fixed two-name choice.
**Nati** and **Beniyas** are seeded as defaults, but anyone can tap **+ New Player** to
add their own name — each profile keeps fully independent save data (unlocked
abilities, cleared worlds, settings, and stats), stored in the browser's
`localStorage`. Profiles can be renamed or deleted from the same screen.

## The Worlds

| # | World | Ability Unlocked | Boss |
|---|---|---|---|
| 1 | Green Hills | Double Jump | Crusher Claw |
| 2 | Ocean Kingdom | Spin Dash | Leviathan Mk.I |
| 3 | Snow Mountains | Wall Jump | Ice Titan |
| 4 | Sky Kingdom | Homing Attack | Sky Dragon Mk.II |
| 5 | Volcano World | Air Dash | Overlord Prime |
| 6 | Crystal Cave | Ground Pound | Gemstone Golem |
| 7 | Haunted Forest | Ring Magnet | The Hollow Reaper |
| 8 | Cyber City | Shield | AI Overmind |
| 9 | Cogsworth's Fortress | Super Transformation | Cogsworth's Ultimate Titan |

Each world has 2 normal stages and 1 boss stage. The final boss transforms your
character partway through the fight — abilities and story context for that beat are
described in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

Fighting isn't the only way through a boss stage: every boss arena has an exit past
the boss's patrol range — get past it (skill-based, since it still hits you like
normal if you're not careful) and you skip the fight, still freeing the friend and
unlocking the next world. Actually defeating the boss is still the only way to get
credit toward the boss-related achievements and Boss Rush readiness.

## Achievements & Stats

Every profile tracks lifetime stats (rings collected, enemies defeated, bosses
defeated, times respawned) and a small set of achievements, viewable from the
**Stats** button on the world map.

## Boss Rush

Unlocked once you've completed the whole story (same gating as Nightmare Mode):
fight all 9 bosses back-to-back, in order, with your rings carrying over between
fights rather than refilling — one long gauntlet, not 9 isolated fights. Timed,
with your best clear time saved and shown on the World Map and Stats screen. It
reuses each world's existing boss arena, so it's pure replay value with no new
level content required.

## Accessibility & options

- **Sound Effects** and **Music** each have an independent, tappable volume
  control in Settings (100% → 75% → 50% → 25% → off, with a level bar), not
  just an on/off switch — adjust either one without affecting the other.
  Every world has its own generated melodic theme (arpeggio + bass + light
  percussion, distinct scale and tempo per world) that speeds up and thickens
  for boss fights — see `docs/ARCHITECTURE.md` for how it's built.
- **Encouraging messages** (on by default) show a short, friendly tip whenever you
  respawn after a mistake — can be turned off in Settings.
- **Nightmare Mode** unlocks after finishing the whole story: faster enemies and
  tougher bosses, for a second playthrough.

## Mobile & responsive play

The canvas scales and centers itself to fit any screen (phone, tablet, laptop,
desktop) via Phaser's Scale Manager, going full-bleed edge-to-edge on small screens.
It plays best in landscape (holding a phone in portrait shows a dismissible
"rotate for a better view" suggestion), but portrait is fully playable too —
every menu and the gameplay HUD adapt their layout and font sizing to whatever
width is actually available, verified down to a 390px-wide screen. Audio unlocks
automatically on your first tap/keypress, working around mobile browsers' autoplay
restrictions rather than requiring a specific button.

## Project structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full module map. Short
version:

```
index.html              entry point (repository root — see "Deploying" above)
css/main.css             layout + boss-fight glow effect
js/
├── main.js               Phaser game config, scene registration
├── config/               world/level/theme/ability data (no game logic)
├── systems/              save/profiles, audio, input, achievements (no Phaser Scene code)
├── ui/                    shared button/modal/layout helpers (no game logic)
└── scenes/               one file per Phaser.Scene
```

## What this project intentionally does NOT include

To keep this an honest, maintainable static-site project rather than an over-scoped
promise:

- No real network leaderboards (would need a backend); "Stats" are local per-profile.
- No day/night lighting pipeline or full weather simulation — worlds have ambient
  particle effects (snow, embers, bubbles, etc.) instead.
- No recorded/licensed music or voice-acted sound effects — everything audible is
  synthesized live with the Web Audio API. The generative soundtrack is a genuine
  step up from a single ambient pad (real melody, bass, and percussion per world),
  but it is not a substitute for a composed/recorded score; if you have licensed
  or commissioned audio tracks you'd like used instead, that's a straightforward
  swap in `systems/audio.js`.
- No server-side anything, no framework — a small esbuild bundling step exists
  purely to turn the ES module source into a classic script for old/embedded
  browser compatibility (see "Development" above), not because the game needs
  a backend. The *deployed* site is still just static files you host anywhere
  by uploading them as-is — the build output is committed, so nobody deploying
  the site ever needs to run a build step themselves.
- Original characters throughout (Professor Cogsworth, Momo, Coral, Frost, Gale,
  Ember, Pip, Wisp, Byte) — no Sega-owned names or likenesses, so this is safe to
  share even though it's inspired by classic high-speed platformers.

## License

MIT — see [`LICENSE`](LICENSE).
