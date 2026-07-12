# Nati & Beniyas's Speedy Adventure

A browser-based 2D platform-adventure game built with [Phaser 3](https://phaser.io/). No
build step, no external art or audio assets — every sprite and sound effect is generated
procedurally at runtime, so the whole game is just static HTML/CSS/JS.

Rescue your friends from **Professor Cogsworth** across 9 themed worlds, unlocking a new
movement ability every time you beat a world's boss, and power up into a Super
Transformation for the final fight.

## Play it

The game lives in [`game/`](game/) and uses ES modules, which browsers refuse to load
over the `file://` protocol (a CORS restriction on `import`). Serve the folder with any
static file server:

```bash
cd game
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

or, if you have Node installed:

```bash
npx serve game
```

or, in VS Code, right-click `game/index.html` and choose **Open with Live Server** (if
you have that extension installed).

> A legacy single-file version that runs by double-clicking the HTML file (no server
> needed) is kept at [`legacy/game-classic.html`](legacy/game-classic.html) for
> reference, but it does not have the profile system, gamepad/touch input, or
> achievements described below.

### Deploying (Netlify, or any static host)

The repo root itself isn't the site — the game lives in `game/`. `netlify.toml` at
the repo root already sets `publish = "game"`, so connecting this repo to Netlify
(or Vercel/Cloudflare Pages/GitHub Pages with an equivalent "publish directory"
setting) should work with no build command. If you're using a host that doesn't
read `netlify.toml`, just point its publish/base directory at `game/` manually.

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

## Achievements & Stats

Every profile tracks lifetime stats (rings collected, enemies defeated, bosses
defeated, times respawned) and a small set of achievements, viewable from the
**Stats** button on the world map.

## Accessibility & options

- **Encouraging messages** (on by default) show a short, friendly tip whenever you
  respawn after a mistake — can be turned off in Settings.
- **Nightmare Mode** unlocks after finishing the whole story: faster enemies and
  tougher bosses, for a second playthrough.

## Project structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full module map. Short
version:

```
game/
├── index.html          entry point
├── css/main.css         layout + boss-fight glow effect
└── js/
    ├── main.js           Phaser game config, scene registration
    ├── config/           world/level/theme/ability data (no game logic)
    ├── systems/          save/profiles, audio, input, achievements (no Phaser Scene code)
    └── scenes/           one file per Phaser.Scene
```

## What this project intentionally does NOT include

To keep this an honest, maintainable static-site project rather than an over-scoped
promise:

- No real network leaderboards (would need a backend); "Stats" are local per-profile.
- No day/night lighting pipeline or full weather simulation — worlds have ambient
  particle effects (snow, embers, bubbles, etc.) instead.
- No music score or recorded sound effects — all audio is synthesized with the Web
  Audio API.
- No bundler/build step — plain ES modules, intentionally, so `game/` stays a static
  folder you can host anywhere.
- Original characters throughout (Professor Cogsworth, Momo, Coral, Frost, Gale,
  Ember, Pip, Wisp, Byte) — no Sega-owned names or likenesses, so this is safe to
  share even though it's inspired by classic high-speed platformers.

## License

MIT — see [`LICENSE`](LICENSE).
