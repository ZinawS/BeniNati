// Lightweight progress persistence for the 3D prototype. Unlike the 2D
// game, there's no player-profile system here — just one shared save per
// browser, tracking the furthest level reached (so a reload resumes there
// instead of always restarting from Level 1) and the best ring count per
// level (so replaying an earlier level with fewer rings doesn't erase a
// better previous run).
const SAVE_KEY = "beninati_3d_save_v1";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function defaults() {
  return { unlockedLevel: 0, bestRingsPerLevel: {} };
}

export function loadProgress() {
  const parsed = safeParse(localStorage.getItem(SAVE_KEY), null);
  if (!parsed || typeof parsed.unlockedLevel !== "number") return defaults();
  return { ...defaults(), ...parsed, bestRingsPerLevel: { ...(parsed.bestRingsPerLevel || {}) } };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

// Called when a level's goal is reached. Returns the updated progress
// (the caller should keep using this returned object, not the one it
// passed in) plus whether this run beat the previous best for the level.
export function recordLevelClear(progress, levelIndex, ringsCollected, totalLevels) {
  const prevBest = progress.bestRingsPerLevel[levelIndex] || 0;
  const next = {
    unlockedLevel: Math.max(progress.unlockedLevel, Math.min(levelIndex + 1, totalLevels - 1)),
    bestRingsPerLevel: { ...progress.bestRingsPerLevel, [levelIndex]: Math.max(prevBest, ringsCollected) },
  };
  saveProgress(next);
  return { progress: next, isNewBest: ringsCollected > prevBest };
}
