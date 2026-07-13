export const ABILITY_KEYS = [
  "doubleJump", "spinDash", "wallJump", "homingAttack",
  "airDash", "groundPound", "ringMagnet", "shield",
];

export const ABILITY_LABELS = {
  doubleJump: "Double Jump",
  spinDash: "Spin Dash",
  wallJump: "Wall Jump",
  homingAttack: "Homing Attack",
  airDash: "Air Dash",
  groundPound: "Ground Pound",
  ringMagnet: "Ring Magnet",
  shield: "Shield",
};

export function defaultAbilities() {
  const abilities = {};
  ABILITY_KEYS.forEach((k) => (abilities[k] = false));
  return abilities;
}
