import {
  W0S1, W0S2, W0S3, W0BOSS, W1S1, W1S2, W1S3, W1BOSS, W2S1, W2S2, W2S3, W2BOSS,
  W3S1, W3S2, W3S3, W3BOSS, W4S1, W4S2, W4S3, W4BOSS, W5S1, W5S2, W5S3, W5BOSS,
  W6S1, W6S2, W6S3, W6BOSS, W7S1, W7S2, W7S3, W7BOSS, W8S1, W8S2, W8S3, W8BOSS,
} from "./levels.js";

export const VILLAIN = "Professor Cogsworth";

export const WORLDS = [
  {
    name: "Green Hills", theme: 0, friend: "Momo the Squirrel",
    bossName: "Crusher Claw", bossHP: 4, bossColor: 0xff3333, bossX: 22, bossY: 3,
    rewardKey: "doubleJump", rewardLabel: "Double Jump",
    hint: "Arrows to move, UP to jump. Grab rings, avoid spikes!",
    stages: [{ type: "normal", map: W0S1 }, { type: "normal", map: W0S2 }, { type: "normal", map: W0S3 }, { type: "boss", map: W0BOSS }],
  },
  {
    name: "Ocean Kingdom", theme: 1, friend: "Coral the Dolphin",
    bossName: "Leviathan Mk.I", bossHP: 5, bossColor: 0x00aaff, bossX: 24, bossY: 2,
    rewardKey: "spinDash", rewardLabel: "Spin Dash",
    hint: "NEW! Press UP again in mid-air to DOUBLE JUMP over wide gaps!",
    stages: [{ type: "normal", map: W1S1 }, { type: "normal", map: W1S2 }, { type: "normal", map: W1S3 }, { type: "boss", map: W1BOSS }],
  },
  {
    name: "Snow Mountains", theme: 2, friend: "Frost the Fox",
    bossName: "Ice Titan", bossHP: 5, bossColor: 0x99e6ff, bossX: 24, bossY: 2,
    rewardKey: "wallJump", rewardLabel: "Wall Jump",
    hint: "NEW! Hold DOWN then let go to SPIN DASH through cracked ice walls!",
    stages: [{ type: "normal", map: W2S1 }, { type: "normal", map: W2S2 }, { type: "normal", map: W2S3 }, { type: "boss", map: W2BOSS }],
  },
  {
    name: "Sky Kingdom", theme: 3, friend: "Gale the Falcon",
    bossName: "Sky Dragon Mk.II", bossHP: 6, bossColor: 0xcc66ff, bossX: 24, bossY: 2,
    rewardKey: "homingAttack", rewardLabel: "Homing Attack",
    hint: "NEW! Jump into a wall and press UP again to WALL JUMP up shafts!",
    stages: [{ type: "normal", map: W3S1 }, { type: "normal", map: W3S2 }, { type: "normal", map: W3S3 }, { type: "boss", map: W3BOSS }],
  },
  {
    name: "Volcano World", theme: 4, friend: "Ember the Salamander",
    bossName: "Overlord Prime", bossHP: 7, bossColor: 0x444444, bossX: 26, bossY: 2,
    rewardKey: "airDash", rewardLabel: "Air Dash",
    hint: "NEW! Press X near an enemy in mid-air for a HOMING ATTACK!",
    stages: [{ type: "normal", map: W4S1 }, { type: "normal", map: W4S2 }, { type: "normal", map: W4S3 }, { type: "boss", map: W4BOSS }],
  },
  {
    name: "Crystal Cave", theme: 5, friend: "Pip the Bat",
    bossName: "Gemstone Golem", bossHP: 8, bossColor: 0x9966ff, bossX: 24, bossY: 2,
    rewardKey: "groundPound", rewardLabel: "Ground Pound",
    hint: "NEW! Press DOWN in mid-air to GROUND POUND — smashes nearby enemies! Watch for sticky mud and crumbling rock.",
    stages: [{ type: "normal", map: W5S1 }, { type: "normal", map: W5S2 }, { type: "normal", map: W5S3 }, { type: "boss", map: W5BOSS }],
  },
  {
    name: "Haunted Forest", theme: 6, friend: "Wisp the Ghost Fox",
    bossName: "The Hollow Reaper", bossHP: 9, bossColor: 0x553377, bossX: 24, bossY: 2,
    rewardKey: "ringMagnet", rewardLabel: "Ring Magnet",
    hint: "NEW! Rings now fly to you automatically! Ride the ghostly wind currents to cross wide chasms.",
    stages: [{ type: "normal", map: W6S1 }, { type: "normal", map: W6S2 }, { type: "normal", map: W6S3 }, { type: "boss", map: W6BOSS }],
  },
  {
    name: "Cyber City", theme: 7, friend: "Byte the Robot Dog",
    bossName: "AI Overmind", bossHP: 10, bossColor: 0x00ffcc, bossX: 26, bossY: 2,
    rewardKey: "shield", rewardLabel: "Shield",
    hint: "NEW! You'll periodically generate a SHIELD that blocks one hit for free. Ride the hover platforms across the gaps!",
    stages: [{ type: "normal", map: W7S1 }, { type: "normal", map: W7S2 }, { type: "normal", map: W7S3 }, { type: "boss", map: W7BOSS }],
  },
  {
    name: "Cogsworth's Fortress", theme: 8, friend: "Everyone (final rescue!)",
    bossName: "Cogsworth's Ultimate Titan", bossHP: 15, bossColor: 0x442222, bossX: 28, bossY: 3,
    rewardKey: null, rewardLabel: "Super Transformation",
    hint: "FINAL WORLD! Watch out for LAVA — it's not just a fall, it burns! Give it everything you've got.",
    stages: [{ type: "normal", map: W8S1 }, { type: "normal", map: W8S2 }, { type: "normal", map: W8S3 }, { type: "boss", map: W8BOSS }],
  },
];

export const FINAL_WORLD_INDEX = WORLDS.length - 1;

export const ENCOURAGEMENTS = [
  "Keep trying — you can do it!",
  "Every challenge teaches you something new.",
  "Think creatively to find another path.",
  "Great explorers never give up.",
  "Learning comes from practice.",
  "Believe in yourself.",
  "Every mistake is a step toward success.",
  "Use your imagination.",
  "Solve problems one step at a time.",
  "Be curious!",
];
