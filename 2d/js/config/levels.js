// ===================== LEVEL EDITOR LEGEND =====================
// 'x' Ground/Platform   'R' Ring        'E' Spike (hazard)
// 'N' Enemy (stomp/dash/homing to defeat)   'S' Spring (bounce)
// '>' Speed Pad (dash)  'M' Moving Platform  'W' Wall (wall-jump)
// 'D' Breakable Wall (spin-dash through)     'C' Checkpoint
// 'G' Goal              'P' Player Start
// 'L' Lava (fire hazard)   'I' Ice (slippery)   'U' Mud (slow)
// 'F' Wind Current (pushes up/forward)   'K' Crumbling Platform
// 'O' Vertical Hover Platform (bobs up/down)
// =================================================================
import { row } from "./themes.js";

// ----------------------- WORLD 0: GREEN HILLS -----------------------
export const W0S1 = (() => {
  const w = 56;
  return [
    row(w),
    row(w, [20, "R R R"]),
    row(w),
    row(w, [18, "xxxxx"]),
    row(w, [40, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [10, "R"], [30, "C"], [44, "S"], [50, "R"], [52, "R"], [54, "G"]),
    row(w, [0, "x".repeat(20)], [22, "x".repeat(10)], [34, "x".repeat(22)]),
  ];
})();
export const W0S2 = (() => {
  const w = 60;
  return [
    row(w),
    row(w, [10, "R R"], [46, "R R"]),
    row(w, [27, "R R"]),
    row(w, [26, "xxxx"]),
    row(w, [14, "N"], [50, "N"]),
    row(w),
    row(w, [2, "P"], [8, ">"], [34, "C"], [40, "S"], [56, "G"]),
    row(w, [0, "x".repeat(18)], [20, "x".repeat(16)], [38, "x".repeat(22)]),
  ];
})();
export const W0S3 = (() => {
  // Hardest of the three normal Green Hills stages, right before the boss —
  // no new tile types (nothing beyond W0S1/S2's own vocabulary, since the
  // player still only has base movement here), just more of everything:
  // wider gaps, more enemies, denser rings.
  const w = 64;
  return [
    row(w, [22, "R R R"]),
    row(w, [40, "R R"]),
    row(w),
    row(w, [16, "xxxx"], [36, "xxxx"]),
    row(w, [12, "N"], [34, "N"], [50, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [10, "R"], [26, "C"], [42, "S"], [56, "R"], [58, "R"], [62, "G"]),
    row(w, [0, "x".repeat(18)], [21, "x".repeat(9)], [33, "x".repeat(8)], [44, "x".repeat(20)]),
  ];
})();
export const W0BOSS = (() => {
  // Extended past the boss's patrol range with an escape goal ('G') at the
  // far end — running/jumping past the boss to reach it skips the fight
  // (still advances the world) as an alternate route for anyone who'd
  // rather not fight; actually beating the boss is still the only way to
  // get the "defeated" stats/achievements and the full victory moment.
  const w = 38;
  return [
    row(w), row(w), row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [12, "R"], [36, "G"]),
    row(w, [0, "x".repeat(38)]),
  ];
})();

// ----------------------- WORLD 1: OCEAN KINGDOM -----------------------
export const W1S1 = (() => {
  const w = 58;
  return [
    row(w),
    row(w, [20, "R R R"]),
    row(w),
    row(w, [38, "xxxx"]),
    row(w, [10, "N"], [44, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [26, "C"], [46, "S"], [54, "G"]),
    row(w, [0, "x".repeat(16)], [19, "x".repeat(13)], [34, "x".repeat(24)]),
  ];
})();
export const W1S2 = (() => {
  const w = 62;
  return [
    row(w),
    row(w, [12, "R R"], [48, "R R"]),
    row(w, [30, "R"]),
    row(w, [28, "xxxxx"]),
    row(w, [16, "N"], [52, "N"]),
    row(w),
    row(w, [2, "P"], [8, "S"], [34, "S"], [44, "C"], [56, "G"]),
    row(w, [0, "x".repeat(20)], [22, "x".repeat(14)], [40, "x".repeat(22)]),
  ];
})();
export const W1S3 = (() => {
  const w = 66;
  return [
    row(w, [16, "R R R"], [46, "R R"]),
    row(w),
    row(w, [30, "R"]),
    row(w, [28, "xxxxx"]),
    row(w, [12, "N"], [36, "N"], [54, "N"]),
    row(w),
    row(w, [2, "P"], [8, ">"], [24, "C"], [40, "S"], [50, "S"], [64, "G"]),
    row(w, [0, "x".repeat(18)], [21, "x".repeat(15)], [39, "x".repeat(27)]),
  ];
})();
export const W1BOSS = (() => {
  const w = 40; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w), row(w),
    row(w, [14, "xxxx"]),
    row(w), row(w),
    row(w, [2, "P"], [10, "R"], [12, "R"], [38, "G"]),
    row(w, [0, "x".repeat(40)]),
  ];
})();

// ----------------------- WORLD 2: SNOW MOUNTAINS -----------------------
export const W2S1 = (() => {
  const w = 56;
  return [
    row(w),
    row(w, [18, "R R"]),
    row(w),
    row(w, [30, "xxxx"]),
    row(w, [14, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [22, "D"], [38, "C"], [46, "S"], [52, "G"]),
    row(w, [0, "x".repeat(22)], [22, "D"], [23, "x".repeat(10)], [33, "I".repeat(4)], [37, "x".repeat(19)]),
  ];
})();
export const W2S2 = (() => {
  const w = 60;
  return [
    row(w),
    row(w, [10, "R R"], [44, "R R"]),
    row(w, [10, "M"]),
    row(w, [30, "xxxx"]),
    row(w, [16, "N"], [48, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [26, "D"], [42, "C"], [50, "S"], [56, "G"]),
    row(w, [0, "x".repeat(26)], [26, "D"], [27, "x".repeat(8)], [35, "I".repeat(4)], [39, "x".repeat(4)], [45, "x".repeat(15)]),
  ];
})();
export const W2S3 = (() => {
  const w = 64;
  return [
    row(w),
    row(w, [12, "R R"], [48, "R R"]),
    row(w, [12, "M"], [46, "M"]),
    row(w, [32, "xxxx"]),
    row(w, [16, "N"], [50, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [24, "D"], [40, "C"], [48, "S"], [56, "G"]),
    row(w, [0, "x".repeat(24)], [24, "D"], [25, "x".repeat(8)], [33, "I".repeat(5)], [38, "x".repeat(26)]),
  ];
})();
export const W2BOSS = (() => {
  const w = 40; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w),
    row(w, [8, "xxx"], [20, "xxx"]),
    row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [38, "G"]),
    row(w, [0, "x".repeat(40)]),
  ];
})();

// ----------------------- WORLD 3: SKY KINGDOM -----------------------
export const W3S1 = (() => {
  const w = 50;
  return [
    row(w, [29, "R R"]),
    row(w, [28, "xxxxxxxx"]),
    row(w, [30, "W"], [32, "W"]),
    row(w, [30, "W"], [32, "W"]),
    row(w, [30, "W"], [32, "W"]),
    row(w, [30, "W"], [32, "W"]),
    row(w, [2, "P"], [8, "R"], [16, "N"], [38, "C"], [44, "S"], [48, "G"]),
    row(w, [0, "x".repeat(18)], [20, "x".repeat(30)]),
  ];
})();
export const W3S2 = (() => {
  const w = 54;
  return [
    row(w, [32, "R R"]),
    row(w, [31, "xxxxxx"]),
    row(w, [34, "W"], [36, "W"]),
    row(w, [34, "W"], [36, "W"]),
    row(w, [34, "W"], [36, "W"]),
    row(w, [34, "W"], [36, "W"]),
    row(w, [2, "P"], [8, "R"], [20, "N"], [40, "C"], [48, "S"], [52, "G"]),
    row(w, [0, "x".repeat(24)], [27, "x".repeat(27)]),
  ];
})();
export const W3S3 = (() => {
  const w = 58;
  return [
    row(w, [34, "R R"]),
    row(w, [33, "xxxxxxxx"]),
    row(w, [36, "W"], [38, "W"]),
    row(w, [36, "W"], [38, "W"]),
    row(w, [36, "W"], [38, "W"]),
    row(w, [36, "W"], [38, "W"]),
    row(w, [2, "P"], [8, "R"], [16, "N"], [24, "N"], [42, "C"], [50, "S"], [56, "G"]),
    row(w, [0, "x".repeat(26)], [29, "x".repeat(29)]),
  ];
})();
export const W3BOSS = (() => {
  const w = 40; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w),
    row(w),
    row(w, [10, "xxx"], [20, "xxx"]),
    row(w), row(w),
    row(w, [2, "P"], [10, "R"], [38, "G"]),
    row(w, [0, "x".repeat(40)]),
  ];
})();

// ----------------------- WORLD 4: VOLCANO WORLD -----------------------
export const W4S1 = (() => {
  const w = 56;
  return [
    row(w),
    row(w, [10, "R R"]),
    row(w),
    row(w, [34, "xxxx"], [46, "M"]),
    row(w, [24, "N"], [30, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [42, "C"], [48, "S"], [52, "G"]),
    row(w, [0, "x".repeat(20)], [36, "x".repeat(20)]),
  ];
})();
export const W4S2 = (() => {
  const w = 60;
  return [
    row(w, [14, "R R"], [44, "R R"]),
    row(w),
    row(w),
    row(w, [50, "xxxx"]),
    row(w, [36, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [20, "D"], [46, "C"], [54, "S"], [58, "G"]),
    row(w, [0, "x".repeat(20)], [20, "D"], [21, "x".repeat(13)], [40, "x".repeat(20)]),
  ];
})();
export const W4S3 = (() => {
  const w = 64;
  return [
    row(w, [14, "R R"], [46, "R R"]),
    row(w),
    row(w, [30, "M"]),
    row(w, [50, "xxxx"]),
    row(w, [22, "N"], [38, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [20, "D"], [44, "C"], [52, "S"], [60, "G"]),
    row(w, [0, "x".repeat(20)], [20, "D"], [21, "x".repeat(15)], [39, "x".repeat(25)]),
  ];
})();
export const W4BOSS = (() => {
  const w = 44; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w),
    row(w, [6, "xxx"], [16, "xxx"], [26, "xxx"]),
    row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [12, "R"], [42, "G"]),
    row(w, [0, "x".repeat(44)]),
  ];
})();

// ----------------------- WORLD 5: CRYSTAL CAVE -----------------------
export const W5S1 = (() => {
  const w = 54;
  return [
    row(w),
    row(w, [16, "R R"]),
    row(w),
    row(w, [30, "xxKx"]),
    row(w, [14, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [38, "C"], [46, "S"], [52, "G"]),
    row(w, [0, "x".repeat(20)], [20, "U".repeat(3)], [23, "x".repeat(31)]),
  ];
})();
export const W5S2 = (() => {
  const w = 58;
  return [
    row(w),
    row(w, [10, "R R"], [44, "R R"]),
    row(w),
    row(w),
    row(w, [16, "N"], [46, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [40, "C"], [48, "S"], [54, "G"]),
    row(w, [0, "x".repeat(24)], [24, "K".repeat(6)], [30, "x".repeat(28)]),
  ];
})();
export const W5S3 = (() => {
  const w = 62;
  return [
    row(w, [12, "R R"], [46, "R R"]),
    row(w),
    row(w, [30, "xxKKx"]),
    row(w),
    row(w, [16, "N"], [34, "N"], [48, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [42, "C"], [50, "S"], [58, "G"]),
    row(w, [0, "x".repeat(22)], [22, "U".repeat(4)], [26, "x".repeat(10)], [36, "K".repeat(6)], [42, "x".repeat(20)]),
  ];
})();
export const W5BOSS = (() => {
  const w = 40; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w), row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [38, "G"]),
    row(w, [0, "x".repeat(40)]),
  ];
})();

// ----------------------- WORLD 6: HAUNTED FOREST -----------------------
export const W6S1 = (() => {
  const w = 56;
  return [
    row(w, [18, "R R"], [22, "FFFFFF"]),
    row(w, [22, "FFFFFF"]),
    row(w, [22, "FFFFFF"], [30, "xxxx"]),
    row(w, [14, "N"], [22, "FFFFFF"]),
    row(w, [22, "FFFFFF"]),
    row(w, [22, "FFFFFF"]),
    row(w, [2, "P"], [8, "R"], [22, "FFFFFF"], [40, "C"], [48, "S"], [52, "G"]),
    row(w, [0, "x".repeat(20)], [30, "x".repeat(26)]),
  ];
})();
export const W6S2 = (() => {
  const w = 58;
  return [
    row(w, [14, "R R"], [44, "R R"], [26, "FFFFFF"]),
    row(w, [26, "FFFFFF"]),
    row(w, [26, "FFFFFF"], [46, "xxxx"]),
    row(w, [18, "N"], [26, "FFFFFF"], [36, "N"]),
    row(w, [26, "FFFFFF"]),
    row(w, [26, "FFFFFF"]),
    row(w, [2, "P"], [8, "R"], [26, "FFFFFF"], [42, "C"], [50, "S"], [54, "G"]),
    row(w, [0, "x".repeat(24)], [38, "x".repeat(20)]),
  ];
})();
export const W6S3 = (() => {
  const w = 60;
  return [
    row(w, [16, "R R"], [44, "R R"], [24, "FFFFFF"], [38, "FFFFFF"]),
    row(w, [24, "FFFFFF"], [38, "FFFFFF"]),
    row(w, [24, "FFFFFF"], [38, "FFFFFF"], [32, "xxxx"]),
    row(w, [14, "N"], [24, "FFFFFF"], [38, "FFFFFF"], [46, "N"]),
    row(w, [24, "FFFFFF"], [38, "FFFFFF"]),
    row(w, [24, "FFFFFF"], [38, "FFFFFF"]),
    row(w, [2, "P"], [8, "R"], [24, "FFFFFF"], [38, "FFFFFF"], [44, "C"], [52, "S"], [56, "G"]),
    row(w, [0, "x".repeat(22)], [34, "x".repeat(26)]),
  ];
})();
export const W6BOSS = (() => {
  const w = 40; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w), row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [38, "G"]),
    row(w, [0, "x".repeat(40)]),
  ];
})();

// ----------------------- WORLD 7: CYBER CITY -----------------------
export const W7S1 = (() => {
  const w = 58;
  return [
    row(w),
    row(w, [16, "R R"]),
    row(w),
    row(w),
    row(w, [12, "N"], [48, "N"]),
    row(w, [30, "O"]),
    row(w, [2, "P"], [8, "R"], [36, "C"], [50, "S"], [54, "G"]),
    row(w, [0, "x".repeat(22)], [40, "x".repeat(18)]),
  ];
})();
export const W7S2 = (() => {
  const w = 60;
  return [
    row(w, [12, "R R"], [46, "R R"]),
    row(w),
    row(w),
    row(w),
    row(w, [16, "N"], [44, "N"]),
    row(w, [30, "O"]),
    row(w, [2, "P"], [8, ">"], [50, "C"], [56, "G"]),
    row(w, [0, "x".repeat(24)], [36, "x".repeat(24)]),
  ];
})();
export const W7S3 = (() => {
  const w = 62;
  return [
    row(w, [14, "R R"], [48, "R R"]),
    row(w),
    row(w),
    row(w),
    row(w, [12, "N"], [34, "N"], [50, "N"]),
    row(w, [24, "O"], [42, "O"]),
    row(w, [2, "P"], [8, ">"], [46, "C"], [52, "S"], [58, "G"]),
    row(w, [0, "x".repeat(20)], [40, "x".repeat(22)]),
  ];
})();
export const W7BOSS = (() => {
  const w = 42; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w), row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [40, "G"]),
    row(w, [0, "x".repeat(42)]),
  ];
})();

// ----------------------- WORLD 8: COGSWORTH'S FORTRESS (FINAL) -----------------------
export const W8S1 = (() => {
  const w = 56;
  return [
    row(w),
    row(w, [14, "R R"]),
    row(w),
    row(w, [32, "xxxx"]),
    row(w, [20, "N"], [44, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [40, "C"], [50, "S"], [54, "G"]),
    row(w, [0, "x".repeat(18)], [18, "LL"], [20, "x".repeat(16)], [36, "LLL"], [39, "x".repeat(17)]),
  ];
})();
export const W8S2 = (() => {
  const w = 60;
  return [
    row(w, [10, "R R"], [46, "R R"]),
    row(w),
    row(w),
    row(w, [28, "xxxx"]),
    row(w, [16, "N"], [46, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [44, "C"], [52, "S"], [56, "G"]),
    row(w, [0, "x".repeat(20)], [20, "L".repeat(6)], [26, "x".repeat(14)], [40, "K".repeat(5)], [45, "x".repeat(15)]),
  ];
})();
export const W8S3 = (() => {
  // The hardest normal stage in the entire game — right before the final
  // boss, so it stacks both of this world's own hazards (lava + crumbling)
  // more densely than either W8S1 or W8S2 do individually.
  const w = 64;
  return [
    row(w, [12, "R R"], [48, "R R"]),
    row(w),
    row(w, [30, "xxxx"]),
    row(w),
    row(w, [16, "N"], [34, "N"], [50, "N"]),
    row(w),
    row(w, [2, "P"], [8, "R"], [44, "C"], [54, "S"], [60, "G"]),
    row(w, [0, "x".repeat(16)], [16, "LL"], [18, "x".repeat(10)], [28, "K".repeat(5)], [33, "x".repeat(9)], [42, "L".repeat(4)], [46, "x".repeat(18)]),
  ];
})();
export const W8BOSS = (() => {
  const w = 44; // extended for an escape route past the boss — see W0BOSS
  return [
    row(w), row(w), row(w), row(w), row(w),
    row(w),
    row(w, [2, "P"], [10, "R"], [12, "R"], [42, "G"]),
    row(w, [0, "x".repeat(44)]),
  ];
})();
