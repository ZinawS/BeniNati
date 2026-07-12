// Tile size (px) used by both the level-map grid and every procedurally
// generated texture. Levels are authored as ASCII grids at this resolution.
export const TILE = 40;

/**
 * Builds one ASCII map row of a fixed width from sparse segments, so level
 * data doesn't rely on manually counting/aligning characters by hand.
 * @param {number} width - total row length in tiles
 * @param {...[number, string]} segs - [startColumn, string] pairs to stamp in
 */
export function row(width, ...segs) {
  const arr = new Array(width).fill(" ");
  for (const [pos, str] of segs) {
    for (let i = 0; i < str.length; i++) arr[pos + i] = str[i];
  }
  return arr.join("");
}

// One entry per world. `ambient` selects the particle preset spawned by
// GameScene#spawnAmbient (see systems — ambient presets live inline there).
export const THEMES = [
  { sky: 0x87ceeb, groundTop: 0x22cc44, groundBody: 0x654321, ambient: "leaves" }, // Green Hills
  { sky: 0x1e90ff, groundTop: 0xffe4a3, groundBody: 0xd2a679, ambient: "bubbles" }, // Ocean Kingdom
  { sky: 0xdce8f5, groundTop: 0xffffff, groundBody: 0x88aacc, ambient: "snow" }, // Snow Mountains
  { sky: 0x6fa8dc, groundTop: 0xfff2cc, groundBody: 0xd9b38c, ambient: null }, // Sky Kingdom
  { sky: 0x2b1010, groundTop: 0x552222, groundBody: 0x1a0a0a, ambient: "embers" }, // Volcano World
  { sky: 0x140a24, groundTop: 0x9966ff, groundBody: 0x2a1a4a, ambient: "dust" }, // Crystal Cave
  { sky: 0x0e1a12, groundTop: 0x557744, groundBody: 0x1c2a1c, ambient: "leaves" }, // Haunted Forest
  { sky: 0x05051a, groundTop: 0x00ffcc, groundBody: 0x1a1a33, ambient: "sparks" }, // Cyber City
  { sky: 0x1a0505, groundTop: 0x663322, groundBody: 0x140303, ambient: "embers" }, // Cogsworth's Fortress
];
