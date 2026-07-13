// Level data only — no engine calls here, just plain numbers, so this stays
// easy to read/tweak without touching any Babylon code. Platform gaps are
// sized against the character controller's actual jump: at walk speed
// (4.2 u/s) with jump speed 7 and gravity -9.81, total air time is ~1.43s,
// giving a walk-jump range of ~6 units and a run-jump (8 u/s) range of
// ~11 units — gaps below stay well inside those so every jump is makeable,
// tighter gaps just need a run-up instead of a walk.
//
// A platform's optional `moving: {axis, range, speed}` makes it slide back
// and forth (real Havok ANIMATED-motion physics, not a visual-only fake) —
// introduced starting Level 2, faster/wider by Level 4, as one concrete way
// the difficulty ramps up beyond just bigger gaps.
export const LEVELS = [
  {
    name: "First Steps",
    playerStart: [0, 1, 0],
    fallThreshold: -15,
    platforms: [
      { pos: [0, 0, 0], size: [6, 1, 6] },
      { pos: [0, 0, 8], size: [4, 1, 4] },
      { pos: [0, 0, 15], size: [4, 1, 4] },
      { pos: [3, 0.5, 21], size: [4, 1, 4] },
      { pos: [3, 0.5, 28], size: [5, 1, 5] },
    ],
    goal: [3, 1.5, 28],
  },
  {
    name: "Stepping Up",
    playerStart: [0, 1, 0],
    fallThreshold: -15,
    platforms: [
      { pos: [0, 0, 0], size: [5, 1, 5] },
      { pos: [0, 0.5, 7], size: [3.5, 1, 3.5] },
      { pos: [0, 1.5, 13], size: [3.5, 1, 3.5] },
      { pos: [0, 2.5, 19], size: [3.5, 1, 3.5], moving: { axis: "x", range: 3, speed: 1.2 } },
      { pos: [-3, 3, 25], size: [3.5, 1, 3.5] },
      { pos: [-3, 3.5, 31], size: [3.5, 1, 3.5] },
      { pos: [-3, 3.5, 37], size: [5, 1, 5] },
    ],
    goal: [-3, 5, 37],
  },
  {
    name: "The Gauntlet",
    playerStart: [0, 1, 0],
    fallThreshold: -15,
    platforms: [
      { pos: [0, 0, 0], size: [5, 1, 5] },
      { pos: [0, 0, 7], size: [2.5, 1, 2.5] },
      { pos: [4, 0, 12], size: [2.5, 1, 2.5] },
      { pos: [4, 1, 18], size: [2.5, 1, 2.5], moving: { axis: "z", range: 2.5, speed: 1.5 } },
      { pos: [0, 1, 23], size: [2.5, 1, 2.5] },
      { pos: [0, 2, 29], size: [2.5, 1, 2.5] },
      { pos: [-4, 2, 34], size: [2.5, 1, 2.5] },
      { pos: [-4, 2.5, 40], size: [5, 1, 5] },
    ],
    goal: [-4, 4, 40],
  },
  {
    name: "Sky Course",
    playerStart: [0, 1, 0],
    fallThreshold: -20,
    platforms: [
      { pos: [0, 0, 0], size: [5, 1, 5] },
      { pos: [0, 1, 6], size: [3, 1, 3] },
      { pos: [3, 2, 11], size: [3, 1, 3] },
      { pos: [3, 3, 16], size: [2.5, 1, 2.5], moving: { axis: "x", range: 3, speed: 1.8 } },
      { pos: [-1, 4, 21], size: [2.5, 1, 2.5] },
      { pos: [-1, 5, 26], size: [2.5, 1, 2.5], moving: { axis: "z", range: 2.5, speed: 2 } },
      { pos: [3, 6, 31], size: [2.5, 1, 2.5] },
      { pos: [3, 6, 37], size: [2.5, 1, 2.5] },
      { pos: [0, 6.5, 43], size: [3, 1, 3] },
      { pos: [0, 7, 49], size: [5, 1, 5] },
    ],
    goal: [0, 8.5, 49],
  },
];
