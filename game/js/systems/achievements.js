// Criteria-based achievements checked against a profile's stats. Call
// checkAchievements(save) after any stat-changing event (ring collected,
// enemy defeated, boss defeated, death, world cleared) — it mutates
// save.stats.achievements in place and returns the newly unlocked ones so
// the caller can show a toast.
export const ACHIEVEMENTS = [
  { id: "first_blood", name: "First Blood", description: "Defeat your first enemy.", condition: (s) => s.stats.enemiesDefeated >= 1 },
  { id: "enemy_smasher", name: "Enemy Smasher", description: "Defeat 25 enemies.", condition: (s) => s.stats.enemiesDefeated >= 25 },
  { id: "ring_collector", name: "Ring Collector", description: "Collect 100 rings in total.", condition: (s) => s.stats.totalRings >= 100 },
  { id: "ring_hoarder", name: "Ring Hoarder", description: "Collect 500 rings in total.", condition: (s) => s.stats.totalRings >= 500 },
  { id: "boss_slayer", name: "Boss Slayer", description: "Defeat your first boss.", condition: (s) => s.stats.bossesDefeated >= 1 },
  { id: "friend_finder", name: "Friend Finder", description: "Free 5 friends.", condition: (s) => s.stats.bossesDefeated >= 5 },
  { id: "never_give_up", name: "Never Give Up", description: "Respawn 10 times and keep going.", condition: (s) => s.stats.deaths >= 10 },
  { id: "completionist", name: "Completionist", description: "Complete the whole story.", condition: (s) => s.gameCompleted === true },
];

export function checkAchievements(save) {
  if (!save.stats.achievements) save.stats.achievements = [];
  const unlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (save.stats.achievements.includes(ach.id)) continue;
    if (ach.condition(save)) {
      save.stats.achievements.push(ach.id);
      unlocked.push(ach);
    }
  }
  return unlocked;
}
