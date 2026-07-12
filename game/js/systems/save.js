// Multi-profile save system. Two localStorage layers:
//   1. A small "registry" listing every profile (id/name/tint/createdAt).
//   2. One independent save blob per profile, keyed by profile id.
// This is what lets more than the two default players (Nati/Beniyas) play
// with their own progress, abilities, and stats on the same browser.
import { WORLDS } from "../config/worlds.js";
import { ABILITY_KEYS, ABILITY_LABELS, defaultAbilities } from "../config/abilities.js";

const REGISTRY_KEY = "nati_beni_profiles_v1";
const SAVE_KEY_PREFIX = "nati_beni_save_v1_";
const DEFAULT_TINTS = [0xffffff, 0xff9933, 0x66ff99, 0xff66cc, 0x66ccff, 0xffee66];

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function readRegistry() {
  const parsed = safeParse(localStorage.getItem(REGISTRY_KEY), null);
  if (parsed && Array.isArray(parsed.profiles)) return parsed;
  return { profiles: [], activeProfileId: null };
}

function writeRegistry(registry) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {}
}

function makeId() {
  return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

export function sanitizeName(raw) {
  const trimmed = (raw || "").trim().replace(/[<>]/g, "");
  return trimmed.slice(0, 16) || "Player";
}

export function defaultProfileSave() {
  return {
    unlockedWorld: 0,
    clearedWorlds: new Array(WORLDS.length).fill(false),
    abilities: defaultAbilities(),
    settings: { encouragement: true },
    nightmareMode: false,
    gameCompleted: false,
    stats: {
      totalRings: 0,
      deaths: 0,
      enemiesDefeated: 0,
      bossesDefeated: 0,
      playtimeSeconds: 0,
      bestRingsPerStage: {},
      achievements: [],
    },
  };
}

function migrateSave(parsed) {
  const defaults = defaultProfileSave();
  const clearedWorlds = defaults.clearedWorlds.slice();
  (parsed.clearedWorlds || []).forEach((v, i) => {
    if (i < clearedWorlds.length) clearedWorlds[i] = v;
  });
  return {
    ...defaults,
    ...parsed,
    clearedWorlds,
    abilities: { ...defaults.abilities, ...(parsed.abilities || {}) },
    settings: { ...defaults.settings, ...(parsed.settings || {}) },
    stats: { ...defaults.stats, ...(parsed.stats || {}), bestRingsPerStage: { ...(parsed.stats && parsed.stats.bestRingsPerStage) || {} } },
  };
}

/** Registry-level operations (who can play). */
export const Profiles = {
  list() {
    return readRegistry().profiles;
  },
  ensureDefaults() {
    const registry = readRegistry();
    if (registry.profiles.length === 0) {
      ["Nati", "Beniyas"].forEach((name, i) => {
        const id = makeId();
        registry.profiles.push({ id, name, tint: DEFAULT_TINTS[i], createdAt: Date.now() });
        writeSave(id, defaultProfileSave());
      });
      writeRegistry(registry);
    }
    return registry.profiles;
  },
  create(name) {
    const registry = readRegistry();
    const id = makeId();
    const tint = DEFAULT_TINTS[registry.profiles.length % DEFAULT_TINTS.length];
    const profile = { id, name: sanitizeName(name), tint, createdAt: Date.now() };
    registry.profiles.push(profile);
    writeRegistry(registry);
    writeSave(id, defaultProfileSave());
    return profile;
  },
  rename(id, newName) {
    const registry = readRegistry();
    const p = registry.profiles.find((p) => p.id === id);
    if (p) {
      p.name = sanitizeName(newName);
      writeRegistry(registry);
    }
    return p;
  },
  delete(id) {
    const registry = readRegistry();
    registry.profiles = registry.profiles.filter((p) => p.id !== id);
    if (registry.activeProfileId === id) registry.activeProfileId = null;
    writeRegistry(registry);
    try {
      localStorage.removeItem(SAVE_KEY_PREFIX + id);
    } catch (e) {}
  },
  setActive(id) {
    const registry = readRegistry();
    registry.activeProfileId = id;
    writeRegistry(registry);
  },
  getActiveId() {
    return readRegistry().activeProfileId;
  },
};

function writeSave(profileId, save) {
  try {
    localStorage.setItem(SAVE_KEY_PREFIX + profileId, JSON.stringify(save));
  } catch (e) {}
}

function readSave(profileId) {
  const parsed = safeParse(localStorage.getItem(SAVE_KEY_PREFIX + profileId), null);
  return parsed ? migrateSave(parsed) : defaultProfileSave();
}

/** Active-session save state — the module a scene actually talks to. */
let currentProfileId = null;
let currentSave = null;

export const Save = {
  activate(profileId) {
    currentProfileId = profileId;
    currentSave = readSave(profileId);
    Profiles.setActive(profileId);
    return currentSave;
  },
  current() {
    if (!currentSave) throw new Error("Save.activate(profileId) must be called before Save.current()");
    return currentSave;
  },
  currentProfileId() {
    return currentProfileId;
  },
  persist() {
    if (currentProfileId && currentSave) writeSave(currentProfileId, currentSave);
  },
  reset() {
    currentSave = defaultProfileSave();
    Save.persist();
    return currentSave;
  },
  abilityListText() {
    const got = ABILITY_KEYS.filter((k) => currentSave.abilities[k]).map((k) => ABILITY_LABELS[k]);
    return got.length ? got.join(", ") : "None yet";
  },
};
