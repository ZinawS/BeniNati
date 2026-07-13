(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // 2d/js/config/themes.js
  var TILE = 40;
  function row(width, ...segs) {
    const arr = new Array(width).fill(" ");
    for (const [pos, str] of segs) {
      for (let i = 0; i < str.length; i++) arr[pos + i] = str[i];
    }
    return arr.join("");
  }
  var THEMES = [
    { sky: 8900331, groundTop: 2280516, groundBody: 6636321, ambient: "leaves" },
    // Green Hills
    { sky: 2003199, groundTop: 16770211, groundBody: 13805177, ambient: "bubbles" },
    // Ocean Kingdom
    { sky: 14477557, groundTop: 16777215, groundBody: 8956620, ambient: "snow" },
    // Snow Mountains
    { sky: 7317724, groundTop: 16773836, groundBody: 14267276, ambient: null },
    // Sky Kingdom
    { sky: 2822160, groundTop: 5579298, groundBody: 1706506, ambient: "embers" },
    // Volcano World
    { sky: 1313316, groundTop: 10053375, groundBody: 2759242, ambient: "dust" },
    // Crystal Cave
    { sky: 924178, groundTop: 5601092, groundBody: 1845788, ambient: "leaves" },
    // Haunted Forest
    { sky: 328986, groundTop: 65484, groundBody: 1710643, ambient: "sparks" },
    // Cyber City
    { sky: 1705221, groundTop: 6697762, groundBody: 1311491, ambient: "embers" }
    // Cogsworth's Fortress
  ];

  // 2d/js/scenes/PreloadScene.js
  var PreloadScene = class extends Phaser.Scene {
    constructor() {
      super("Preload");
    }
    preload() {
      let canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      let ctx = canvas.getContext("2d");
      const colors = { 0: null, 1: "#0033cc", 2: "#ffcc99", 3: "#cc0000", 4: "#ffffff", 5: "#000000" };
      const pixels = [
        "0000011110000000",
        "0000111111100000",
        "0001111111110000",
        "0011111122210000",
        "0111112222221000",
        "0111122452245000",
        "0011122222222000",
        "0001112222220000",
        "0011111222211000",
        "0111111111111100",
        "0111111111111100",
        "0011111111111000",
        "0001100000011000",
        "0004400000044000",
        "0033330000333300",
        "0033330000333300"
      ];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (colors[pixels[y][x]]) {
            ctx.fillStyle = colors[pixels[y][x]];
            ctx.fillRect(x * 2, y * 2, 2, 2);
          }
        }
      }
      this.textures.addCanvas("hero", canvas);
      let g = this.make.graphics({ x: 0, y: 0, add: false });
      THEMES.forEach((t, i) => {
        g.fillStyle(t.groundBody, 1);
        g.fillRect(0, 0, 40, 40);
        g.fillStyle(t.groundTop, 1);
        g.fillRect(0, 0, 40, 10);
        g.generateTexture("ground" + i, 40, 40);
        g.clear();
      });
      g.lineStyle(4, 16763904, 1);
      g.strokeCircle(10, 10, 8);
      g.generateTexture("ring", 20, 20);
      g.clear();
      g.fillStyle(11184810, 1);
      g.fillTriangle(20, 0, 0, 40, 40, 40);
      g.generateTexture("spike", 40, 40);
      g.clear();
      g.fillStyle(16733440, 1);
      g.fillRect(0, 20, 40, 20);
      g.fillStyle(11184810, 1);
      g.fillRect(10, 0, 20, 20);
      g.generateTexture("spring", 40, 40);
      g.clear();
      g.fillStyle(16755200, 1);
      g.fillTriangle(0, 10, 40, 20, 0, 30);
      g.generateTexture("speedpad", 40, 40);
      g.clear();
      g.fillStyle(15658734, 1);
      g.fillRect(0, 0, 40, 80);
      g.fillStyle(0, 1);
      g.fillRect(10, 10, 20, 60);
      g.generateTexture("goal", 40, 80);
      g.clear();
      g.fillStyle(16777215, 1);
      g.fillRoundedRect(4, 8, 32, 28, 6);
      g.fillStyle(2236962, 1);
      g.fillCircle(14, 20, 4);
      g.fillCircle(26, 20, 4);
      g.generateTexture("enemy", 40, 40);
      g.clear();
      g.fillStyle(16777215, 1);
      g.fillRoundedRect(10, 10, 100, 100, 16);
      g.fillStyle(2236962, 1);
      g.fillCircle(40, 55, 10);
      g.fillCircle(80, 55, 10);
      g.fillStyle(16711680, 1);
      g.fillCircle(60, 90, 14);
      g.generateTexture("boss", 120, 120);
      g.clear();
      g.fillStyle(16777215, 1);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(0, 0.18);
      g.fillRect(0, 0, 8, 40);
      g.fillRect(32, 0, 8, 40);
      g.generateTexture("wall", 40, 40);
      g.clear();
      g.fillStyle(16777215, 1);
      g.fillRect(0, 0, 40, 40);
      g.lineStyle(3, 0, 0.3);
      g.strokeRect(2, 2, 36, 36);
      g.generateTexture("breakable", 40, 40);
      g.clear();
      g.fillStyle(8947848, 1);
      g.fillRect(18, 0, 4, 60);
      g.fillStyle(16711680, 1);
      g.fillTriangle(22, 5, 22, 25, 42, 15);
      g.generateTexture("checkpoint", 44, 60);
      g.clear();
      g.fillStyle(16777215, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture("particle", 8, 8);
      g.clear();
      g.fillStyle(16720418, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture("projectile", 16, 16);
      g.clear();
      g.fillStyle(16724736, 1);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(16755200, 1);
      g.fillRect(2, 2, 36, 10);
      g.generateTexture("lava", 40, 40);
      g.clear();
      g.fillStyle(12314623, 0.9);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(16777215, 0.5);
      g.fillRect(0, 0, 40, 6);
      g.generateTexture("ice", 40, 40);
      g.clear();
      g.fillStyle(7031338, 1);
      g.fillRect(0, 0, 40, 40);
      g.fillStyle(4862488, 1);
      g.fillCircle(12, 14, 5);
      g.fillCircle(28, 26, 6);
      g.generateTexture("mud", 40, 40);
      g.clear();
      g.fillStyle(11462655, 0.18);
      g.fillRect(0, 0, 40, 40);
      g.lineStyle(2, 16777215, 0.5);
      g.lineBetween(8, 34, 20, 10);
      g.lineBetween(22, 34, 34, 10);
      g.generateTexture("windzone", 40, 40);
      g.clear();
      g.fillStyle(10066329, 1);
      g.fillRect(0, 0, 40, 40);
      g.lineStyle(2, 4473924, 1);
      g.lineBetween(4, 4, 36, 36);
      g.lineBetween(36, 4, 4, 36);
      g.generateTexture("crumble", 40, 40);
      g.clear();
      g.fillStyle(65484, 1);
      g.fillRoundedRect(0, 0, 40, 16, 4);
      g.generateTexture("hover", 40, 16);
    }
    create() {
      this.scene.start("MainMenu");
    }
  };

  // 2d/js/config/levels.js
  var W0S1 = (() => {
    const w = 56;
    return [
      row(w),
      row(w, [20, "R R R"]),
      row(w),
      row(w, [18, "xxxxx"]),
      row(w, [40, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [10, "R"], [30, "C"], [44, "S"], [50, "R"], [52, "R"], [54, "G"]),
      row(w, [0, "x".repeat(20)], [22, "x".repeat(10)], [34, "x".repeat(22)])
    ];
  })();
  var W0S2 = (() => {
    const w = 60;
    return [
      row(w),
      row(w, [10, "R R"], [46, "R R"]),
      row(w, [27, "R R"]),
      row(w, [26, "xxxx"]),
      row(w, [14, "N"], [50, "N"]),
      row(w),
      row(w, [2, "P"], [8, ">"], [34, "C"], [40, "S"], [56, "G"]),
      row(w, [0, "x".repeat(18)], [20, "x".repeat(16)], [38, "x".repeat(22)])
    ];
  })();
  var W0BOSS = (() => {
    const w = 38;
    return [
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [12, "R"], [36, "G"]),
      row(w, [0, "x".repeat(38)])
    ];
  })();
  var W1S1 = (() => {
    const w = 58;
    return [
      row(w),
      row(w, [20, "R R R"]),
      row(w),
      row(w, [38, "xxxx"]),
      row(w, [10, "N"], [44, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [26, "C"], [46, "S"], [54, "G"]),
      row(w, [0, "x".repeat(16)], [19, "x".repeat(13)], [34, "x".repeat(24)])
    ];
  })();
  var W1S2 = (() => {
    const w = 62;
    return [
      row(w),
      row(w, [12, "R R"], [48, "R R"]),
      row(w, [30, "R"]),
      row(w, [28, "xxxxx"]),
      row(w, [16, "N"], [52, "N"]),
      row(w),
      row(w, [2, "P"], [8, "S"], [34, "S"], [44, "C"], [56, "G"]),
      row(w, [0, "x".repeat(20)], [22, "x".repeat(14)], [40, "x".repeat(22)])
    ];
  })();
  var W1BOSS = (() => {
    const w = 40;
    return [
      row(w),
      row(w),
      row(w),
      row(w, [14, "xxxx"]),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [12, "R"], [38, "G"]),
      row(w, [0, "x".repeat(40)])
    ];
  })();
  var W2S1 = (() => {
    const w = 56;
    return [
      row(w),
      row(w, [18, "R R"]),
      row(w),
      row(w, [30, "xxxx"]),
      row(w, [14, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [22, "D"], [38, "C"], [46, "S"], [52, "G"]),
      row(w, [0, "x".repeat(22)], [22, "D"], [23, "x".repeat(10)], [33, "I".repeat(4)], [37, "x".repeat(19)])
    ];
  })();
  var W2S2 = (() => {
    const w = 60;
    return [
      row(w),
      row(w, [10, "R R"], [44, "R R"]),
      row(w, [10, "M"]),
      row(w, [30, "xxxx"]),
      row(w, [16, "N"], [48, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [26, "D"], [42, "C"], [50, "S"], [56, "G"]),
      row(w, [0, "x".repeat(26)], [26, "D"], [27, "x".repeat(8)], [35, "I".repeat(4)], [39, "x".repeat(4)], [45, "x".repeat(15)])
    ];
  })();
  var W2BOSS = (() => {
    const w = 40;
    return [
      row(w),
      row(w),
      row(w, [8, "xxx"], [20, "xxx"]),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [38, "G"]),
      row(w, [0, "x".repeat(40)])
    ];
  })();
  var W3S1 = (() => {
    const w = 50;
    return [
      row(w, [29, "R R"]),
      row(w, [28, "xxxxxxxx"]),
      row(w, [30, "W"], [32, "W"]),
      row(w, [30, "W"], [32, "W"]),
      row(w, [30, "W"], [32, "W"]),
      row(w, [30, "W"], [32, "W"]),
      row(w, [2, "P"], [8, "R"], [16, "N"], [38, "C"], [44, "S"], [48, "G"]),
      row(w, [0, "x".repeat(18)], [20, "x".repeat(30)])
    ];
  })();
  var W3S2 = (() => {
    const w = 54;
    return [
      row(w, [32, "R R"]),
      row(w, [31, "xxxxxx"]),
      row(w, [34, "W"], [36, "W"]),
      row(w, [34, "W"], [36, "W"]),
      row(w, [34, "W"], [36, "W"]),
      row(w, [34, "W"], [36, "W"]),
      row(w, [2, "P"], [8, "R"], [20, "N"], [40, "C"], [48, "S"], [52, "G"]),
      row(w, [0, "x".repeat(24)], [27, "x".repeat(27)])
    ];
  })();
  var W3BOSS = (() => {
    const w = 40;
    return [
      row(w),
      row(w),
      row(w),
      row(w, [10, "xxx"], [20, "xxx"]),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [38, "G"]),
      row(w, [0, "x".repeat(40)])
    ];
  })();
  var W4S1 = (() => {
    const w = 56;
    return [
      row(w),
      row(w, [10, "R R"]),
      row(w),
      row(w, [34, "xxxx"], [46, "M"]),
      row(w, [24, "N"], [30, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [42, "C"], [48, "S"], [52, "G"]),
      row(w, [0, "x".repeat(20)], [36, "x".repeat(20)])
    ];
  })();
  var W4S2 = (() => {
    const w = 60;
    return [
      row(w, [14, "R R"], [44, "R R"]),
      row(w),
      row(w),
      row(w, [50, "xxxx"]),
      row(w, [36, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [20, "D"], [46, "C"], [54, "S"], [58, "G"]),
      row(w, [0, "x".repeat(20)], [20, "D"], [21, "x".repeat(13)], [40, "x".repeat(20)])
    ];
  })();
  var W4BOSS = (() => {
    const w = 44;
    return [
      row(w),
      row(w, [6, "xxx"], [16, "xxx"], [26, "xxx"]),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [12, "R"], [42, "G"]),
      row(w, [0, "x".repeat(44)])
    ];
  })();
  var W5S1 = (() => {
    const w = 54;
    return [
      row(w),
      row(w, [16, "R R"]),
      row(w),
      row(w, [30, "xxKx"]),
      row(w, [14, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [38, "C"], [46, "S"], [52, "G"]),
      row(w, [0, "x".repeat(20)], [20, "U".repeat(3)], [23, "x".repeat(31)])
    ];
  })();
  var W5S2 = (() => {
    const w = 58;
    return [
      row(w),
      row(w, [10, "R R"], [44, "R R"]),
      row(w),
      row(w),
      row(w, [16, "N"], [46, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [40, "C"], [48, "S"], [54, "G"]),
      row(w, [0, "x".repeat(24)], [24, "K".repeat(6)], [30, "x".repeat(28)])
    ];
  })();
  var W5BOSS = (() => {
    const w = 40;
    return [
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [38, "G"]),
      row(w, [0, "x".repeat(40)])
    ];
  })();
  var W6S1 = (() => {
    const w = 56;
    return [
      row(w, [18, "R R"], [22, "FFFFFF"]),
      row(w, [22, "FFFFFF"]),
      row(w, [22, "FFFFFF"], [30, "xxxx"]),
      row(w, [14, "N"], [22, "FFFFFF"]),
      row(w, [22, "FFFFFF"]),
      row(w, [22, "FFFFFF"]),
      row(w, [2, "P"], [8, "R"], [22, "FFFFFF"], [40, "C"], [48, "S"], [52, "G"]),
      row(w, [0, "x".repeat(20)], [30, "x".repeat(26)])
    ];
  })();
  var W6S2 = (() => {
    const w = 58;
    return [
      row(w, [14, "R R"], [44, "R R"], [26, "FFFFFF"]),
      row(w, [26, "FFFFFF"]),
      row(w, [26, "FFFFFF"], [46, "xxxx"]),
      row(w, [18, "N"], [26, "FFFFFF"], [36, "N"]),
      row(w, [26, "FFFFFF"]),
      row(w, [26, "FFFFFF"]),
      row(w, [2, "P"], [8, "R"], [26, "FFFFFF"], [42, "C"], [50, "S"], [54, "G"]),
      row(w, [0, "x".repeat(24)], [38, "x".repeat(20)])
    ];
  })();
  var W6BOSS = (() => {
    const w = 40;
    return [
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [38, "G"]),
      row(w, [0, "x".repeat(40)])
    ];
  })();
  var W7S1 = (() => {
    const w = 58;
    return [
      row(w),
      row(w, [16, "R R"]),
      row(w),
      row(w),
      row(w, [12, "N"], [48, "N"]),
      row(w, [30, "O"]),
      row(w, [2, "P"], [8, "R"], [36, "C"], [50, "S"], [54, "G"]),
      row(w, [0, "x".repeat(22)], [40, "x".repeat(18)])
    ];
  })();
  var W7S2 = (() => {
    const w = 60;
    return [
      row(w, [12, "R R"], [46, "R R"]),
      row(w),
      row(w),
      row(w),
      row(w, [16, "N"], [44, "N"]),
      row(w, [30, "O"]),
      row(w, [2, "P"], [8, ">"], [50, "C"], [56, "G"]),
      row(w, [0, "x".repeat(24)], [36, "x".repeat(24)])
    ];
  })();
  var W7BOSS = (() => {
    const w = 42;
    return [
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [40, "G"]),
      row(w, [0, "x".repeat(42)])
    ];
  })();
  var W8S1 = (() => {
    const w = 56;
    return [
      row(w),
      row(w, [14, "R R"]),
      row(w),
      row(w, [32, "xxxx"]),
      row(w, [20, "N"], [44, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [40, "C"], [50, "S"], [54, "G"]),
      row(w, [0, "x".repeat(18)], [18, "LL"], [20, "x".repeat(16)], [36, "LLL"], [39, "x".repeat(17)])
    ];
  })();
  var W8S2 = (() => {
    const w = 60;
    return [
      row(w, [10, "R R"], [46, "R R"]),
      row(w),
      row(w),
      row(w, [28, "xxxx"]),
      row(w, [16, "N"], [46, "N"]),
      row(w),
      row(w, [2, "P"], [8, "R"], [44, "C"], [52, "S"], [56, "G"]),
      row(w, [0, "x".repeat(20)], [20, "L".repeat(6)], [26, "x".repeat(14)], [40, "K".repeat(5)], [45, "x".repeat(15)])
    ];
  })();
  var W8BOSS = (() => {
    const w = 44;
    return [
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w),
      row(w, [2, "P"], [10, "R"], [12, "R"], [42, "G"]),
      row(w, [0, "x".repeat(44)])
    ];
  })();

  // 2d/js/config/worlds.js
  var VILLAIN = "Professor Cogsworth";
  var WORLDS = [
    {
      name: "Green Hills",
      theme: 0,
      friend: "Momo the Squirrel",
      bossName: "Crusher Claw",
      bossHP: 4,
      bossColor: 16724787,
      bossX: 22,
      bossY: 3,
      rewardKey: "doubleJump",
      rewardLabel: "Double Jump",
      hint: "Arrows to move, UP to jump. Grab rings, avoid spikes!",
      stages: [{ type: "normal", map: W0S1 }, { type: "normal", map: W0S2 }, { type: "boss", map: W0BOSS }]
    },
    {
      name: "Ocean Kingdom",
      theme: 1,
      friend: "Coral the Dolphin",
      bossName: "Leviathan Mk.I",
      bossHP: 5,
      bossColor: 43775,
      bossX: 24,
      bossY: 2,
      rewardKey: "spinDash",
      rewardLabel: "Spin Dash",
      hint: "NEW! Press UP again in mid-air to DOUBLE JUMP over wide gaps!",
      stages: [{ type: "normal", map: W1S1 }, { type: "normal", map: W1S2 }, { type: "boss", map: W1BOSS }]
    },
    {
      name: "Snow Mountains",
      theme: 2,
      friend: "Frost the Fox",
      bossName: "Ice Titan",
      bossHP: 5,
      bossColor: 10086143,
      bossX: 24,
      bossY: 2,
      rewardKey: "wallJump",
      rewardLabel: "Wall Jump",
      hint: "NEW! Hold DOWN then let go to SPIN DASH through cracked ice walls!",
      stages: [{ type: "normal", map: W2S1 }, { type: "normal", map: W2S2 }, { type: "boss", map: W2BOSS }]
    },
    {
      name: "Sky Kingdom",
      theme: 3,
      friend: "Gale the Falcon",
      bossName: "Sky Dragon Mk.II",
      bossHP: 6,
      bossColor: 13395711,
      bossX: 24,
      bossY: 2,
      rewardKey: "homingAttack",
      rewardLabel: "Homing Attack",
      hint: "NEW! Jump into a wall and press UP again to WALL JUMP up shafts!",
      stages: [{ type: "normal", map: W3S1 }, { type: "normal", map: W3S2 }, { type: "boss", map: W3BOSS }]
    },
    {
      name: "Volcano World",
      theme: 4,
      friend: "Ember the Salamander",
      bossName: "Overlord Prime",
      bossHP: 7,
      bossColor: 4473924,
      bossX: 26,
      bossY: 2,
      rewardKey: "airDash",
      rewardLabel: "Air Dash",
      hint: "NEW! Press X near an enemy in mid-air for a HOMING ATTACK!",
      stages: [{ type: "normal", map: W4S1 }, { type: "normal", map: W4S2 }, { type: "boss", map: W4BOSS }]
    },
    {
      name: "Crystal Cave",
      theme: 5,
      friend: "Pip the Bat",
      bossName: "Gemstone Golem",
      bossHP: 5,
      bossColor: 10053375,
      bossX: 24,
      bossY: 2,
      rewardKey: "groundPound",
      rewardLabel: "Ground Pound",
      hint: "NEW! Press DOWN in mid-air to GROUND POUND \u2014 smashes nearby enemies! Watch for sticky mud and crumbling rock.",
      stages: [{ type: "normal", map: W5S1 }, { type: "normal", map: W5S2 }, { type: "boss", map: W5BOSS }]
    },
    {
      name: "Haunted Forest",
      theme: 6,
      friend: "Wisp the Ghost Fox",
      bossName: "The Hollow Reaper",
      bossHP: 6,
      bossColor: 5583735,
      bossX: 24,
      bossY: 2,
      rewardKey: "ringMagnet",
      rewardLabel: "Ring Magnet",
      hint: "NEW! Rings now fly to you automatically! Ride the ghostly wind currents to cross wide chasms.",
      stages: [{ type: "normal", map: W6S1 }, { type: "normal", map: W6S2 }, { type: "boss", map: W6BOSS }]
    },
    {
      name: "Cyber City",
      theme: 7,
      friend: "Byte the Robot Dog",
      bossName: "AI Overmind",
      bossHP: 6,
      bossColor: 65484,
      bossX: 26,
      bossY: 2,
      rewardKey: "shield",
      rewardLabel: "Shield",
      hint: "NEW! You'll periodically generate a SHIELD that blocks one hit for free. Ride the hover platforms across the gaps!",
      stages: [{ type: "normal", map: W7S1 }, { type: "normal", map: W7S2 }, { type: "boss", map: W7BOSS }]
    },
    {
      name: "Cogsworth's Fortress",
      theme: 8,
      friend: "Everyone (final rescue!)",
      bossName: "Cogsworth's Ultimate Titan",
      bossHP: 10,
      bossColor: 4465186,
      bossX: 28,
      bossY: 3,
      rewardKey: null,
      rewardLabel: "Super Transformation",
      hint: "FINAL WORLD! Watch out for LAVA \u2014 it's not just a fall, it burns! Give it everything you've got.",
      stages: [{ type: "normal", map: W8S1 }, { type: "normal", map: W8S2 }, { type: "boss", map: W8BOSS }]
    }
  ];
  var FINAL_WORLD_INDEX = WORLDS.length - 1;
  var ENCOURAGEMENTS = [
    "Keep trying \u2014 you can do it!",
    "Every challenge teaches you something new.",
    "Think creatively to find another path.",
    "Great explorers never give up.",
    "Learning comes from practice.",
    "Believe in yourself.",
    "Every mistake is a step toward success.",
    "Use your imagination.",
    "Solve problems one step at a time.",
    "Be curious!"
  ];

  // 2d/js/config/abilities.js
  var ABILITY_KEYS = [
    "doubleJump",
    "spinDash",
    "wallJump",
    "homingAttack",
    "airDash",
    "groundPound",
    "ringMagnet",
    "shield"
  ];
  var ABILITY_LABELS = {
    doubleJump: "Double Jump",
    spinDash: "Spin Dash",
    wallJump: "Wall Jump",
    homingAttack: "Homing Attack",
    airDash: "Air Dash",
    groundPound: "Ground Pound",
    ringMagnet: "Ring Magnet",
    shield: "Shield"
  };
  function defaultAbilities() {
    const abilities = {};
    ABILITY_KEYS.forEach((k) => abilities[k] = false);
    return abilities;
  }

  // 2d/js/systems/save.js
  var REGISTRY_KEY = "nati_beni_profiles_v1";
  var SAVE_KEY_PREFIX = "nati_beni_save_v1_";
  var DEFAULT_TINTS = [16777215, 16750899, 6750105, 16737996, 6737151, 16772710];
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
    } catch (e) {
    }
  }
  function makeId() {
    return "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }
  function sanitizeName(raw) {
    const trimmed = (raw || "").trim().replace(/[<>]/g, "");
    return trimmed.slice(0, 16) || "Player";
  }
  function defaultProfileSave() {
    return {
      unlockedWorld: 0,
      clearedWorlds: new Array(WORLDS.length).fill(false),
      abilities: defaultAbilities(),
      settings: { encouragement: true, sfxVolume: 1, musicVolume: 0.75 },
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
        bestBossRushSeconds: null
      }
    };
  }
  function migrateSave(parsed) {
    const defaults = defaultProfileSave();
    const clearedWorlds = defaults.clearedWorlds.slice();
    (parsed.clearedWorlds || []).forEach((v, i) => {
      if (i < clearedWorlds.length) clearedWorlds[i] = v;
    });
    const parsedSettings = parsed.settings || {};
    const settings = __spreadValues(__spreadValues({}, defaults.settings), parsedSettings);
    if (parsedSettings.sfxVolume === void 0 && parsedSettings.sfx !== void 0) {
      settings.sfxVolume = parsedSettings.sfx ? 1 : 0;
    }
    if (parsedSettings.musicVolume === void 0 && parsedSettings.music !== void 0) {
      settings.musicVolume = parsedSettings.music ? defaults.settings.musicVolume : 0;
    }
    delete settings.sfx;
    delete settings.music;
    return __spreadProps(__spreadValues(__spreadValues({}, defaults), parsed), {
      clearedWorlds,
      abilities: __spreadValues(__spreadValues({}, defaults.abilities), parsed.abilities || {}),
      settings,
      stats: __spreadProps(__spreadValues(__spreadValues({}, defaults.stats), parsed.stats || {}), { bestRingsPerStage: __spreadValues({}, parsed.stats && parsed.stats.bestRingsPerStage || {}) })
    });
  }
  var Profiles = {
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
      const p = registry.profiles.find((p2) => p2.id === id);
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
      } catch (e) {
      }
    },
    setActive(id) {
      const registry = readRegistry();
      registry.activeProfileId = id;
      writeRegistry(registry);
    },
    getActiveId() {
      return readRegistry().activeProfileId;
    }
  };
  function writeSave(profileId, save) {
    try {
      localStorage.setItem(SAVE_KEY_PREFIX + profileId, JSON.stringify(save));
    } catch (e) {
    }
  }
  function readSave(profileId) {
    const parsed = safeParse(localStorage.getItem(SAVE_KEY_PREFIX + profileId), null);
    return parsed ? migrateSave(parsed) : defaultProfileSave();
  }
  var currentProfileId = null;
  var currentSave = null;
  var Save = {
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
    }
  };

  // 2d/js/systems/audio.js
  var audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function initAudioUnlock() {
    const unlock = () => {
      if (isUnlocked()) return;
      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
      }
    };
    const targets = [document, document.getElementById("game-container")].filter(Boolean);
    targets.forEach((target) => {
      ["pointerdown", "touchstart", "keydown"].forEach((evt) => {
        target.addEventListener(evt, unlock, { passive: true });
      });
    });
  }
  function isUnlocked() {
    return !!audioCtx && audioCtx.state === "running";
  }
  function getVolume(kind) {
    try {
      const v = Save.current().settings[kind + "Volume"];
      return typeof v === "number" ? v : 1;
    } catch (e) {
      return 1;
    }
  }
  function beep(freq, duration, type = "square", volume = 0.15, delay = 0) {
    const level = getVolume("sfx");
    if (level <= 0) return;
    try {
      const ctx = getAudioCtx();
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t0 = ctx.currentTime + delay;
      gain.gain.setValueAtTime(volume * level, t0);
      gain.gain.exponentialRampToValueAtTime(1e-3, t0 + duration);
      osc.start(t0);
      osc.stop(t0 + duration);
    } catch (e) {
    }
  }
  var SFX = {
    jump: () => beep(520, 0.12, "square", 0.12),
    ring: () => beep(1200, 0.08, "sine", 0.1),
    hurt: () => beep(150, 0.3, "sawtooth", 0.15),
    spring: () => beep(300, 0.15, "triangle", 0.15),
    dash: () => beep(700, 0.1, "sawtooth", 0.12),
    enemyDefeat: () => beep(900, 0.15, "square", 0.15),
    bossHit: () => {
      beep(200, 0.2, "square", 0.2);
      beep(100, 0.25, "sawtooth", 0.2, 0.05);
    },
    bossDefeat: () => [400, 600, 800, 1e3, 1300].forEach((f, i) => beep(f, 0.2, "square", 0.15, i * 0.1)),
    goal: () => [500, 700, 900].forEach((f, i) => beep(f, 0.15, "sine", 0.15, i * 0.08)),
    fire: () => {
      beep(80, 0.4, "sawtooth", 0.18);
      beep(55, 0.45, "square", 0.14, 0.08);
    },
    transform: () => [600, 900, 1200, 1600, 2e3].forEach((f, i) => beep(f, 0.25, "sine", 0.18, i * 0.09)),
    achievement: () => [700, 1e3, 1400].forEach((f, i) => beep(f, 0.18, "triangle", 0.16, i * 0.07)),
    uiClick: () => beep(440, 0.05, "triangle", 0.08),
    uiHover: () => beep(660, 0.03, "sine", 0.04),
    land: () => beep(110, 0.08, "sine", 0.1)
  };
  function vibrate(duration = 200, weak = 0.4, strong = 0.6) {
    try {
      const pad = navigator.getGamepads && navigator.getGamepads()[0];
      if (pad && pad.vibrationActuator) {
        pad.vibrationActuator.playEffect("dual-rumble", { duration, weakMagnitude: weak, strongMagnitude: strong });
      }
    } catch (e) {
    }
  }
  function semitoneToFreq(root, semitones) {
    return root * Math.pow(2, semitones / 12);
  }
  var MAJOR_PENTATONIC = [0, 2, 4, 7, 9];
  var MINOR_PENTATONIC = [0, 3, 5, 7, 10];
  var NATURAL_MINOR = [0, 2, 3, 5, 7, 8, 10];
  var THEME_CONFIGS = [
    { root: 261.63, scale: MAJOR_PENTATONIC, tempo: 128 },
    // Green Hills
    { root: 293.66, scale: MAJOR_PENTATONIC, tempo: 118 },
    // Ocean Kingdom
    { root: 220, scale: MINOR_PENTATONIC, tempo: 110 },
    // Snow Mountains
    { root: 329.63, scale: MAJOR_PENTATONIC, tempo: 142 },
    // Sky Kingdom
    { root: 174.61, scale: MINOR_PENTATONIC, tempo: 132 },
    // Volcano World
    { root: 246.94, scale: NATURAL_MINOR, tempo: 100 },
    // Crystal Cave
    { root: 196, scale: NATURAL_MINOR, tempo: 92 },
    // Haunted Forest
    { root: 233.08, scale: MINOR_PENTATONIC, tempo: 136 },
    // Cyber City
    { root: 164.81, scale: NATURAL_MINOR, tempo: 124 }
    // Cogsworth's Fortress
  ];
  var ARP_PATTERN = [0, 2, 4, 2, 1, 4, 3, 2];
  var BASS_PATTERN = [0, -1, -1, -1, 0, -1, 2, -1];
  var MusicSystem = class {
    constructor() {
      this.master = null;
      this.config = null;
      this.playing = false;
      this.intense = false;
      this.timer = null;
      this.noiseBuffer = null;
    }
    playTheme(themeIndex) {
      this.stop(0.4);
      const level = getVolume("music");
      if (level <= 0) return;
      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
        this.config = THEME_CONFIGS[themeIndex % THEME_CONFIGS.length];
        this.master = ctx.createGain();
        this.master.gain.value = 0;
        this.master.connect(ctx.destination);
        this.master.gain.setTargetAtTime(0.55 * level, ctx.currentTime, 1);
        this.playing = true;
        this._scheduleLoop();
      } catch (e) {
      }
    }
    /** Picked up at the start of the next loop, not forced mid-bar — avoids an audible timing jump. */
    setBossIntensity(active) {
      this.intense = active;
      if (this.master) {
        const ctx = getAudioCtx();
        const level = getVolume("music");
        this.master.gain.setTargetAtTime((active ? 0.68 : 0.55) * level, ctx.currentTime, 0.8);
      }
    }
    _noise(ctx) {
      if (this.noiseBuffer) return this.noiseBuffer;
      const len = Math.floor(ctx.sampleRate * 0.2);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
      return buf;
    }
    _pluck(ctx, freq, time, dur, vol, type) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(1e-3, time + dur);
      osc.connect(gain).connect(this.master);
      osc.start(time);
      osc.stop(time + dur + 0.05);
    }
    _hat(ctx, time, vol) {
      const noise = ctx.createBufferSource();
      noise.buffer = this._noise(ctx);
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 6e3;
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.05);
      noise.connect(filter).connect(gain).connect(this.master);
      noise.start(time);
      noise.stop(time + 0.06);
    }
    _kick(ctx, time) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(1e-3, time + 0.15);
      osc.connect(gain).connect(this.master);
      osc.start(time);
      osc.stop(time + 0.16);
    }
    _scheduleLoop() {
      if (!this.playing || !this.master || !this.config) return;
      const ctx = getAudioCtx();
      const cfg = this.config;
      const bpm = cfg.tempo * (this.intense ? 1.15 : 1);
      const stepDur = 60 / bpm / 2;
      const steps = ARP_PATTERN.length;
      const startTime = ctx.currentTime + 0.05;
      for (let i = 0; i < steps; i++) {
        const t = startTime + i * stepDur;
        const leadDeg = cfg.scale[ARP_PATTERN[i] % cfg.scale.length];
        this._pluck(ctx, semitoneToFreq(cfg.root * 2, leadDeg), t, stepDur * 0.85, 0.09, "sine");
        const bassStep = BASS_PATTERN[i];
        if (bassStep >= 0) {
          const bassDeg = cfg.scale[bassStep % cfg.scale.length];
          this._pluck(ctx, semitoneToFreq(cfg.root / 2, bassDeg), t, stepDur * 1.6, 0.13, "triangle");
        }
        if (this.intense || i % 2 === 0) this._hat(ctx, t, this.intense ? 0.05 : 0.03);
        if (i === 0 || this.intense && i === 4) this._kick(ctx, t);
      }
      const loopMs = steps * stepDur * 1e3;
      this.timer = setTimeout(() => this._scheduleLoop(), Math.max(50, loopMs - 30));
    }
    stop(fadeSeconds = 0.6) {
      this.playing = false;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (!this.master) return;
      try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        const master = this.master;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0, now, fadeSeconds / 3);
        setTimeout(() => {
          try {
            master.disconnect();
          } catch (e) {
          }
        }, (fadeSeconds + 0.5) * 1e3);
      } catch (e) {
      }
      this.master = null;
    }
  };
  var Music = new MusicSystem();

  // 2d/js/ui/uiHelpers.js
  function makeButton(scene, x, y, label, onClick, opts = {}) {
    var _a, _b;
    const color = opts.color || "#ffcc00";
    const hoverColor = opts.hoverColor || "#ffffff";
    const style = {
      fontSize: opts.fontSize || "18px",
      fill: color,
      fontStyle: opts.bold === false ? "normal" : "bold"
    };
    if (opts.backgroundColor) style.backgroundColor = opts.backgroundColor;
    if (opts.padding) style.padding = opts.padding;
    if (opts.align) style.align = opts.align;
    if (opts.wordWrap) style.wordWrap = opts.wordWrap;
    const text = scene.add.text(x, y, label, style).setOrigin((_a = opts.originX) != null ? _a : 0.5, (_b = opts.originY) != null ? _b : 0.5);
    text.setInteractive({ useHandCursor: true });
    text.on("pointerover", () => {
      scene.tweens.add({ targets: text, scale: 1.08, duration: 120, ease: "Sine.easeOut" });
      text.setColor(hoverColor);
      SFX.uiHover();
    });
    text.on("pointerout", () => {
      scene.tweens.add({ targets: text, scale: 1, duration: 120, ease: "Sine.easeOut" });
      text.setColor(color);
    });
    text.on("pointerdown", (pointer, lx, ly, event) => {
      if (event) event.stopPropagation();
      SFX.uiClick();
      scene.tweens.add({ targets: text, scale: 0.92, duration: 60, yoyo: true });
      onClick(pointer, lx, ly, event);
    });
    return text;
  }
  function addHoverFeedback(scene, gameObject) {
    const baseScale = gameObject.scale || 1;
    gameObject.setInteractive({ useHandCursor: true });
    gameObject.on("pointerover", () => scene.tweens.add({ targets: gameObject, scale: baseScale * 1.05, duration: 120, ease: "Sine.easeOut" }));
    gameObject.on("pointerout", () => scene.tweens.add({ targets: gameObject, scale: baseScale, duration: 120, ease: "Sine.easeOut" }));
    gameObject.on("pointerdown", () => SFX.uiClick());
    return gameObject;
  }
  function sceneTransition(scene, key, data) {
    scene.cameras.main.fadeOut(220, 0, 0, 0);
    scene.cameras.main.once("camerafadeoutcomplete", () => scene.scene.start(key, data));
  }
  function fadeInScene(scene) {
    scene.cameras.main.fadeIn(260, 0, 0, 0);
  }
  function screenAnchors(scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;
    return { width, height, cx: width / 2, cy: height / 2, right: width, bottom: height, left: 0, top: 0 };
  }
  function autoRelayoutOnResize(scene) {
    let last = { width: scene.scale.width, height: scene.scale.height };
    const handler = (gameSize) => {
      if (gameSize.width === last.width && gameSize.height === last.height) return;
      last = { width: gameSize.width, height: gameSize.height };
      scene.scene.restart();
    };
    scene.scale.on("resize", handler);
    scene.events.once("shutdown", () => scene.scale.off("resize", handler));
  }

  // 2d/js/ui/soundIndicator.js
  function addSoundIndicator(scene, x = 764, y = 24) {
    const icon = scene.add.text(x, y, "\u{1F508}", { fontSize: "22px" }).setOrigin(0.5).setScrollFactor(0).setDepth(2e3).setInteractive({ useHandCursor: true });
    const muted = () => {
      try {
        const s = Save.current().settings;
        return (s.sfxVolume || 0) <= 0 && (s.musicVolume || 0) <= 0;
      } catch (e) {
        return false;
      }
    };
    const refresh = () => {
      if (!isUnlocked()) icon.setText("\u{1F507}");
      else icon.setText(muted() ? "\u{1F508}" : "\u{1F50A}");
    };
    icon.on("pointerdown", () => {
      initAudioUnlock();
      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
      } catch (e) {
      }
      try {
        const save = Save.current();
        const nowMuted = !muted();
        save.settings.sfxVolume = nowMuted ? 0 : 1;
        save.settings.musicVolume = nowMuted ? 0 : 0.75;
        Save.persist();
        if (!nowMuted) SFX.uiClick();
      } catch (e) {
      }
      scene.tweens.add({ targets: icon, scale: 1.3, duration: 90, yoyo: true });
      refresh();
    });
    refresh();
    const timer = scene.time.addEvent({ delay: 800, loop: true, callback: refresh });
    scene.events.once("shutdown", () => timer.remove());
    return icon;
  }

  // 2d/js/systems/platform.js
  var isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // 2d/js/ui/soundSetupModal.js
  var SEEN_KEY = "nati_beni_sound_intro_seen_v1";
  function maybeShowSoundSetup(scene) {
    if (!isTouchDevice) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch (e) {
    }
    showSoundSetupModal(scene);
  }
  function showSoundSetupModal(scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;
    const cx = width / 2;
    const cy = height / 2;
    const depth = 5e3;
    let save;
    try {
      save = Save.current();
    } catch (e) {
      save = { settings: { sfxVolume: 1, musicVolume: 0.75 } };
    }
    const elements = [];
    const add = (obj) => {
      elements.push(obj);
      return obj;
    };
    add(scene.add.rectangle(cx, cy, width, height, 0, 0.72).setScrollFactor(0).setDepth(depth).setInteractive());
    const cardW = Math.min(420, width - 40);
    const cardH = Math.min(260, height - 40);
    const card = scene.add.graphics().setScrollFactor(0).setDepth(depth + 1);
    card.fillStyle(1052709, 0.98);
    card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 18);
    card.lineStyle(2, 6737151, 0.85);
    card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 18);
    add(card);
    add(scene.add.text(cx, cy - cardH / 2 + 34, "\u{1F50A} Sound Settings", { fontSize: "22px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2));
    add(scene.add.text(cx, cy - cardH / 2 + 66, "This game has music and sound effects.\nTap below to turn them on or off \u2014 you can fine-tune\nthe volume of each separately in Settings later.", { fontSize: "13px", fill: "#ddd", align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2));
    const unlock = () => {
      initAudioUnlock();
      try {
        const ctx = getAudioCtx();
        if (ctx.state === "suspended") ctx.resume();
      } catch (e) {
      }
    };
    const isOn = () => save.settings.sfxVolume > 0 || save.settings.musicVolume > 0;
    const toggleLabel = () => `Sound: ${isOn() ? "ON" : "OFF"}`;
    const toggleBtn = add(
      scene.add.text(cx, cy - 4, toggleLabel(), { fontSize: "20px", fill: "#fff", backgroundColor: "#222244", padding: { x: 16, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true })
    );
    toggleBtn.on("pointerdown", () => {
      unlock();
      const turningOn = !isOn();
      save.settings.sfxVolume = turningOn ? 1 : 0;
      save.settings.musicVolume = turningOn ? 0.75 : 0;
      try {
        Save.persist();
      } catch (e) {
      }
      toggleBtn.setText(toggleLabel());
      if (turningOn) SFX.uiClick();
    });
    const close = () => {
      unlock();
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch (e) {
      }
      elements.forEach((el) => el.destroy());
    };
    const closeBtn = add(
      scene.add.text(cx, cy + cardH / 2 - 36, "[ Continue ]", { fontSize: "18px", fill: "#00ff88", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 2).setInteractive({ useHandCursor: true })
    );
    closeBtn.on("pointerdown", close);
    return elements;
  }

  // 2d/js/scenes/MainMenu.js
  var MainMenu = class extends Phaser.Scene {
    constructor() {
      super("MainMenu");
    }
    create() {
      initAudioUnlock();
      fadeInScene(this);
      addSoundIndicator(this);
      autoRelayoutOnResize(this);
      const { cx, height } = screenAnchors(this);
      this.add.text(cx, height * 0.18, "NATI & BENIYAS'S", { fontSize: "26px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      const title = this.add.text(cx, height * 0.26, "SPEEDY ADVENTURE!", { fontSize: "40px", fill: "#0066ff", fontStyle: "bold", stroke: "#fff", strokeThickness: 4 }).setOrigin(0.5);
      this.tweens.add({ targets: title, scale: { from: 0.9, to: 1 }, duration: 900, ease: "Bounce.easeOut" });
      this.add.text(cx, height * 0.35, `${VILLAIN} has captured your friends across ${WORLDS.length} worlds!`, { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);
      this.add.text(cx, height * 0.39, "Rescue them all and stop his ultimate machine!", { fontSize: "16px", fill: "#ddd" }).setOrigin(0.5);
      makeButton(this, cx, height * 0.57, "[ PLAY ]", () => {
        getAudioCtx().resume();
        sceneTransition(this, "ProfileSelect");
      }, { fontSize: "34px", color: "#00ff00" });
      makeButton(this, cx, height * 0.68, "[ How To Play ]", () => sceneTransition(this, "HowToPlay"), { fontSize: "16px" });
      this.add.text(cx, height * 0.8, "Pick or create your player on the next screen.", { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);
      maybeShowSoundSetup(this);
    }
  };

  // 2d/js/scenes/ProfileSelect.js
  var ProfileSelect = class extends Phaser.Scene {
    constructor() {
      super("ProfileSelect");
    }
    create() {
      fadeInScene(this);
      autoRelayoutOnResize(this);
      Profiles.ensureDefaults();
      const { cx, height } = screenAnchors(this);
      this.add.text(cx, height * 0.09, "Who's Playing?", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      this.renderProfiles();
      makeButton(this, cx, height - 24, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "14px", color: "#aaaaaa" });
    }
    renderProfiles() {
      if (this.profileContainer) this.profileContainer.forEach((o) => o.destroy());
      this.profileContainer = [];
      const add = (obj) => {
        this.profileContainer.push(obj);
        return obj;
      };
      const { width, height } = screenAnchors(this);
      const cellW = 180, cellH = 170;
      const cols = Math.max(3, Math.min(6, Math.floor(width / cellW)));
      const gridWidth = cols * cellW;
      const startX = (width - gridWidth) / 2 + cellW / 2;
      const startY = Math.min(160, height * 0.35);
      const profiles = Profiles.list();
      profiles.forEach((p, i) => {
        const x = startX + i % cols * cellW;
        const y = startY + Math.floor(i / cols) * cellH;
        const card = add(this.add.rectangle(x, y, 150, 130, 2236996, 0.9).setStrokeStyle(2, p.tint || 16777215));
        addHoverFeedback(this, card);
        add(this.add.circle(x, y - 35, 22, p.tint || 16777215));
        add(this.add.text(x, y + 5, p.name, { fontSize: "16px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5));
        card.on("pointerdown", () => this.selectProfile(p));
        add(makeButton(this, x - 30, y + 45, "Rename", (pointer, lx, ly, event) => {
          const next = window.prompt("New name:", p.name);
          if (next && next.trim()) {
            Profiles.rename(p.id, sanitizeName(next));
            this.renderProfiles();
          }
        }, { fontSize: "11px", color: "#66ccff" }));
        add(makeButton(this, x + 40, y + 45, "Delete", (pointer, lx, ly, event) => {
          if (window.confirm(`Delete ${p.name} and all their progress? This can't be undone.`)) {
            Profiles.delete(p.id);
            this.renderProfiles();
          }
        }, { fontSize: "11px", color: "#ff6666" }));
      });
      const newX = startX + profiles.length % cols * cellW;
      const newY = startY + Math.floor(profiles.length / cols) * cellH;
      const newCard = add(this.add.rectangle(newX, newY, 150, 130, 1710634, 0.9).setStrokeStyle(2, 65416));
      addHoverFeedback(this, newCard);
      add(this.add.text(newX, newY, "+ New\nPlayer", { fontSize: "16px", fill: "#00ff88", align: "center" }).setOrigin(0.5));
      newCard.on("pointerdown", () => {
        const name = window.prompt("Enter your name:", "");
        if (name && name.trim()) {
          const profile = Profiles.create(sanitizeName(name));
          this.selectProfile(profile);
        }
      });
    }
    selectProfile(profile) {
      Save.activate(profile.id);
      sceneTransition(this, "WorldMap", { profileId: profile.id, profileName: profile.name, profileTint: profile.tint });
    }
  };

  // 2d/js/scenes/HowToPlay.js
  var HowToPlay = class extends Phaser.Scene {
    constructor() {
      super("HowToPlay");
    }
    init(data) {
      this.returnTo = data && data.returnTo || "MainMenu";
    }
    create() {
      fadeInScene(this);
      autoRelayoutOnResize(this);
      const { cx, width, height } = screenAnchors(this);
      this.add.text(cx, height * 0.08, "HOW TO PLAY", { fontSize: "26px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      const lines = [
        ["Move", "Left/Right arrows, gamepad, or the on-screen \u25C0\u25B6 buttons on your left thumb."],
        ["Jump / Double Jump", "UP, SPACE, gamepad A, or the on-screen \u25B2 button on your right thumb. Press again in mid-air to double jump (once unlocked)."],
        ["Wall Jump", "Jump while touching a wall, then press Jump again to bounce off (once unlocked)."],
        ["Spin Dash", "Hold DOWN then release to launch forward (once unlocked)."],
        ["Ground Pound", "Press DOWN in mid-air to slam down and shock nearby enemies (once unlocked)."],
        ["Homing / Air Dash", "X, Z, gamepad B/X, or the on-screen \u2605 button \u2014 snaps to the nearest enemy, or dashes forward if none is close."],
        ["Rings", "Collect them! They protect you \u2014 lose them instead of dying when hit."],
        ["Checkpoints", "Touching a flag saves your spot in the stage."],
        ["Boss Fights", "Wait for the boss to flash YELLOW, then jump on it, spin-dash it, or homing-attack it."],
        ["Escaping a Boss", "Don't want to fight? Every boss arena has a way past \u2014 run/jump beyond it to the exit and you'll skip the fight (still counts as clearing the world)."],
        ["Lava", "Never touch it \u2014 it burns! You respawn at your last checkpoint."],
        ["Pause", "ESC any time during a stage."],
        ["Sound", "Tap the speaker icon (top-right) any time to enable/mute audio."]
      ];
      const twoCol = width >= 640;
      const colWidth = twoCol ? width / 2 - 40 : width - 80;
      const startY = height * 0.18;
      const rowH = Math.max(30, Math.min(34, height * 0.72 / Math.ceil(lines.length / (twoCol ? 2 : 1))));
      lines.forEach(([title, desc], i) => {
        const col = twoCol ? i % 2 : 0;
        const row2 = twoCol ? Math.floor(i / 2) : i;
        const colX = twoCol ? 40 + col * (width / 2) : 40;
        const y = startY + row2 * rowH;
        this.add.text(colX, y, title + ":", { fontSize: "13px", fill: "#66ccff", fontStyle: "bold" });
        this.add.text(colX, y + 15, desc, { fontSize: "11px", fill: "#eee", wordWrap: { width: colWidth } });
      });
      makeButton(this, cx, height - 26, "Back", () => sceneTransition(this, this.returnTo), { color: "#00ff00" });
    }
  };

  // 2d/js/scenes/Settings.js
  var VOLUME_STEPS = [1, 0.75, 0.5, 0.25, 0];
  function volumeBar(level) {
    const filled = Math.round(level * 5);
    return "\u25A0".repeat(filled) + "\u25A1".repeat(5 - filled);
  }
  var Settings = class extends Phaser.Scene {
    constructor() {
      super("Settings");
    }
    create() {
      fadeInScene(this);
      autoRelayoutOnResize(this);
      const save = Save.current();
      const { cx, height } = screenAnchors(this);
      this.add.text(cx, height * 0.09, "SETTINGS", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      const toggle = (y, key, label, desc, color = "#fff") => {
        const text = () => `${label}: ${save.settings[key] ? "ON" : "OFF"}`;
        const btn = makeButton(this, cx, y, text(), () => {
          save.settings[key] = !save.settings[key];
          Save.persist();
          btn.setText(text());
        }, { fontSize: "20px", color });
        this.add.text(cx, y + 24, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
      };
      const volumeControl = (y, settingsKey, label, desc, color = "#fff") => {
        const text = () => `${label}: ${volumeBar(save.settings[settingsKey])} ${Math.round(save.settings[settingsKey] * 100)}%`;
        const btn = makeButton(this, cx, y, text(), () => {
          const idx = VOLUME_STEPS.indexOf(save.settings[settingsKey]);
          const next = VOLUME_STEPS[(idx === -1 ? 0 : idx + 1) % VOLUME_STEPS.length];
          save.settings[settingsKey] = next;
          Save.persist();
          btn.setText(text());
          if (settingsKey === "musicVolume") {
            if (next <= 0) Music.stop();
            else Music.playTheme(0);
          }
        }, { fontSize: "18px", color });
        this.add.text(cx, y + 24, desc, { fontSize: "12px", fill: "#aaa" }).setOrigin(0.5);
      };
      volumeControl(height * 0.24, "sfxVolume", "Sound Effects", "Jump, rings, hits, boss cues \u2014 tap to cycle the volume.");
      volumeControl(height * 0.39, "musicVolume", "Music", "Background soundtrack \u2014 tap to cycle the volume, independent of sound effects.");
      toggle(height * 0.54, "encouragement", "Encouraging Messages", "Friendly tips shown when you respawn after a mistake.");
      makeButton(this, cx, height * 0.67, "[ Sound Setup ]", () => showSoundSetupModal(this), { fontSize: "15px", color: "#66ccff" });
      if (save.gameCompleted) {
        const nmLabel = () => `Nightmare Mode: ${save.nightmareMode ? "ON" : "OFF"}`;
        const nmBtn = makeButton(this, cx, height * 0.8, nmLabel(), () => {
          save.nightmareMode = !save.nightmareMode;
          Save.persist();
          nmBtn.setText(nmLabel());
        }, { fontSize: "18px", color: "#ff6666" });
      }
      makeButton(this, cx, height - 30, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
    }
  };

  // 2d/js/scenes/WorldMap.js
  var WorldMap = class extends Phaser.Scene {
    constructor() {
      super("WorldMap");
    }
    init(data) {
      const activeId = Save.currentProfileId() || data && data.profileId;
      const profile = Profiles.list().find((p) => p.id === activeId);
      this.profileId = activeId;
      this.playerName = data && data.profileName || profile && profile.name || "Player";
      this.profileTint = data && data.profileTint || profile && profile.tint || 16777215;
    }
    create() {
      fadeInScene(this);
      autoRelayoutOnResize(this);
      const save = Save.current();
      const { cx, width, height } = screenAnchors(this);
      this.add.text(cx, height * 0.05, `${this.playerName}'s Journey`, { fontSize: "20px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      this.resetArmed = false;
      const cellW = 150, cellH = height * 0.2;
      const cols = Math.max(5, Math.min(WORLDS.length, Math.floor(width / cellW)));
      const rows = Math.ceil(WORLDS.length / cols);
      const gridWidth = cols * cellW;
      const startX = (width - gridWidth) / 2 + cellW / 2;
      const startY = height * 0.22;
      WORLDS.forEach((world, i) => {
        const x = startX + i % cols * cellW;
        const y = startY + Math.floor(i / cols) * cellH;
        const unlocked = i <= save.unlockedWorld;
        const cleared = save.clearedWorlds[i];
        const color = cleared ? "#00ff88" : unlocked ? "#ffffff" : "#555555";
        const box = this.add.rectangle(x, y, 130, cellH * 0.72, THEMES[world.theme].sky, unlocked ? 1 : 0.3).setStrokeStyle(3, cleared ? 65416 : 16777215);
        this.add.text(x, y - cellH * 0.32, world.name, { fontSize: "12px", fill: color, fontStyle: "bold", align: "center", wordWrap: { width: 130 } }).setOrigin(0.5);
        this.add.text(x, y + cellH * 0.32, cleared ? "CLEARED" : unlocked ? "PLAY" : "LOCKED", { fontSize: "12px", fill: color }).setOrigin(0.5);
        if (unlocked) {
          addHoverFeedback(this, box);
          box.on("pointerdown", () => {
            sceneTransition(this, "GameScene", { worldIndex: i, stageIndex: 0, score: 0, playerName: this.playerName, profileTint: this.profileTint });
          });
        }
      });
      const gridBottom = startY + (rows - 1) * cellH + cellH * 0.5;
      const infoY = Math.min(gridBottom + 22, height - 120);
      this.add.text(cx, infoY, `Abilities: ${Save.abilityListText()}`, { fontSize: "13px", fill: "#66ccff" }).setOrigin(0.5);
      if (save.gameCompleted) {
        this.add.text(cx, infoY + 22, `You defeated ${VILLAIN} and rescued everyone! THE END.`, { fontSize: "14px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
        this.add.text(cx, infoY + 42, "New Game+ and Nightmare Mode are available in Settings!", { fontSize: "12px", fill: "#aaddff" }).setOrigin(0.5);
      }
      const buttons = [
        ["[ How To Play ]", () => sceneTransition(this, "HowToPlay", { returnTo: "WorldMap" }), "#ffcc00"],
        ["[ Settings ]", () => sceneTransition(this, "Settings"), "#ffcc00"],
        ["[ Stats ]", () => sceneTransition(this, "StatsScene"), "#ffcc00"],
        ["[ Switch Player ]", () => sceneTransition(this, "ProfileSelect"), "#ffcc00"]
      ];
      if (save.gameCompleted) {
        const bestTime = save.stats.bestBossRushSeconds;
        const bestLabel = bestTime !== null && bestTime !== void 0 ? `[ \u2605 Boss Rush ${Math.floor(bestTime / 60)}:${String(bestTime % 60).padStart(2, "0")} ]` : "[ \u2605 Boss Rush ]";
        buttons.push([bestLabel, () => {
          sceneTransition(this, "GameScene", {
            bossRush: true,
            bossRushIndex: 0,
            bossRushStartTime: Date.now(),
            score: 0,
            playerName: this.playerName,
            profileTint: this.profileTint
          });
        }, "#ffee66"]);
      }
      const totalButtons = buttons.length + 1;
      const btnRowY = height - 55;
      const btnGap = Math.min(130, width / (totalButtons + 1));
      const btnStartX = cx - btnGap * (totalButtons - 1) / 2;
      buttons.forEach(([label, onClick, color], i) => {
        makeButton(this, btnStartX + btnGap * i, btnRowY, label, onClick, { fontSize: "12px", color });
      });
      const resetText = makeButton(this, btnStartX + btnGap * buttons.length, btnRowY, "Reset Progress", () => {
        if (!this.resetArmed) {
          this.resetArmed = true;
          resetText.setText("Click again to confirm!");
          this.time.delayedCall(3e3, () => {
            this.resetArmed = false;
            resetText.setText("Reset Progress");
          });
        } else {
          Save.reset();
          this.scene.restart();
        }
      }, { fontSize: "12px", color: "#884444" });
      makeButton(this, cx, height - 24, "Back to Menu", () => sceneTransition(this, "MainMenu"), { fontSize: "13px", color: "#aaaaaa" });
    }
  };

  // 2d/js/systems/achievements.js
  var ACHIEVEMENTS = [
    { id: "first_blood", name: "First Blood", description: "Defeat your first enemy.", condition: (s) => s.stats.enemiesDefeated >= 1 },
    { id: "enemy_smasher", name: "Enemy Smasher", description: "Defeat 25 enemies.", condition: (s) => s.stats.enemiesDefeated >= 25 },
    { id: "ring_collector", name: "Ring Collector", description: "Collect 100 rings in total.", condition: (s) => s.stats.totalRings >= 100 },
    { id: "ring_hoarder", name: "Ring Hoarder", description: "Collect 500 rings in total.", condition: (s) => s.stats.totalRings >= 500 },
    { id: "boss_slayer", name: "Boss Slayer", description: "Defeat your first boss.", condition: (s) => s.stats.bossesDefeated >= 1 },
    { id: "friend_finder", name: "Friend Finder", description: "Free 5 friends.", condition: (s) => s.stats.bossesDefeated >= 5 },
    { id: "never_give_up", name: "Never Give Up", description: "Respawn 10 times and keep going.", condition: (s) => s.stats.deaths >= 10 },
    { id: "completionist", name: "Completionist", description: "Complete the whole story.", condition: (s) => s.gameCompleted === true },
    { id: "boss_rush_champion", name: "Boss Rush Champion", description: "Beat every boss back-to-back in Boss Rush mode.", condition: (s) => s.stats.bestBossRushSeconds !== null && s.stats.bestBossRushSeconds !== void 0 }
  ];
  function checkAchievements(save) {
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

  // 2d/js/scenes/StatsScene.js
  var StatsScene = class extends Phaser.Scene {
    constructor() {
      super("StatsScene");
    }
    create() {
      fadeInScene(this);
      autoRelayoutOnResize(this);
      const save = Save.current();
      const { cx, width, height } = screenAnchors(this);
      this.add.text(cx, height * 0.08, "STATS & ACHIEVEMENTS", { fontSize: "22px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5);
      const bestRush = save.stats.bestBossRushSeconds;
      const bestRushLabel = bestRush !== null && bestRush !== void 0 ? `${Math.floor(bestRush / 60)}:${String(bestRush % 60).padStart(2, "0")}` : "not run yet";
      const stats = [
        `Rings collected (lifetime): ${save.stats.totalRings}`,
        `Enemies defeated: ${save.stats.enemiesDefeated}`,
        `Bosses defeated: ${save.stats.bossesDefeated}`,
        `Times respawned: ${save.stats.deaths}`,
        `Worlds cleared: ${save.clearedWorlds.filter(Boolean).length} / ${save.clearedWorlds.length}`,
        `Best Boss Rush time: ${bestRushLabel}`
      ];
      const sideBySide = width >= 640;
      const leftX = sideBySide ? 40 : 40;
      const rightX = sideBySide ? width / 2 + 20 : 40;
      let y = height * 0.2;
      stats.forEach((line) => {
        this.add.text(leftX, y, line, { fontSize: "14px", fill: "#eee" });
        y += 26;
      });
      let ay = sideBySide ? height * 0.2 : y + 20;
      this.add.text(rightX, ay, "Achievements:", { fontSize: "15px", fill: "#66ccff", fontStyle: "bold" });
      ay += 30;
      const unlocked = new Set(save.stats.achievements || []);
      const achWrap = sideBySide ? width / 2 - 60 : width - 80;
      ACHIEVEMENTS.forEach((ach) => {
        const got = unlocked.has(ach.id);
        const label = got ? `\u2605 ${ach.name}` : `\u2606 ???`;
        const desc = got ? ach.description : "Keep playing to unlock this one!";
        this.add.text(rightX, ay, label, { fontSize: "13px", fill: got ? "#ffcc00" : "#666", fontStyle: "bold" });
        this.add.text(rightX, ay + 14, desc, { fontSize: "11px", fill: got ? "#ccc" : "#555", wordWrap: { width: achWrap } });
        ay += 32;
      });
      makeButton(this, cx, height - 26, "Back", () => sceneTransition(this, "WorldMap"), { color: "#00ff00" });
    }
  };

  // 2d/js/systems/input.js
  var InputController = class {
    constructor(scene) {
      this.scene = scene;
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.spaceKey = scene.input.keyboard.addKey("SPACE");
      this.actionKeys = [scene.input.keyboard.addKey("X"), scene.input.keyboard.addKey("Z")];
      this._prevDown = false;
      this._prevJump = false;
      this._prevAction = false;
      this._padPrevJump = false;
      this._padPrevAction = false;
      this.touch = { left: false, right: false, down: false, jump: false, action: false };
      this._touchParts = [];
      if (isTouchDevice) {
        this._buildTouchButtons(scene);
        this._resizeHandler = () => this._buildTouchButtons(scene);
        scene.scale.on("resize", this._resizeHandler);
        scene.events.once("shutdown", () => scene.scale.off("resize", this._resizeHandler));
      }
    }
    /**
     * On-screen controls, split by thumb the way a real mobile platformer
     * lays them out: LEFT thumb = forward/backward, RIGHT thumb = down/up
     * (up doubles as jump) + the action button. Both clusters sit on the same
     * horizontal baseline in same-height panels, buttons evenly spaced within
     * each — one aligned control strip, not mismatched floating pieces (an
     * earlier version stacked up/down vertically with the action button
     * floating separately above, which read as misaligned). Real drawn
     * triangle arrows (not font glyphs, which render inconsistently across
     * mobile browsers). Rebuilt on every resize/rotate so it stays correctly
     * anchored to the actual screen edges.
     */
    _buildTouchButtons(scene) {
      this._touchParts.forEach((o) => o.destroy());
      this._touchParts = [];
      const track = (obj) => {
        this._touchParts.push(obj);
        return obj;
      };
      const width = scene.scale.width;
      const height = scene.scale.height;
      const DPAD_COLOR = 6737151;
      const ACTION_COLOR = 16772710;
      const BTN_RADIUS = 30;
      const PANEL_H = 92;
      const panel = (cx, cy, w, h, strokeColor) => {
        const g = track(scene.add.graphics().setScrollFactor(0).setDepth(996));
        g.fillStyle(657946, 0.42);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
        g.lineStyle(2, strokeColor, 0.55);
        g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 16);
        return g;
      };
      const pressFeedback = (parts, pressed) => {
        scene.tweens.add({ targets: parts, scale: pressed ? 0.86 : 1, duration: 90, ease: "Sine.easeOut" });
      };
      const arrowButton = (x, y, angleDeg, key, color) => {
        const backdrop = track(scene.add.circle(x, y, BTN_RADIUS, color, 0.2).setStrokeStyle(2, color, 0.75).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
        const arrow = track(scene.add.triangle(x, y, -12, -11, 12, 0, -12, 11, 16777215, 0.95).setAngle(angleDeg).setScrollFactor(0).setDepth(999));
        const parts = [backdrop, arrow];
        backdrop.on("pointerdown", () => {
          this.touch[key] = true;
          pressFeedback(parts, true);
          backdrop.setFillStyle(color, 0.45);
        });
        const release = () => {
          this.touch[key] = false;
          pressFeedback(parts, false);
          backdrop.setFillStyle(color, 0.2);
        };
        backdrop.on("pointerup", release);
        backdrop.on("pointerout", release);
        return parts;
      };
      const actionButton = (x, y) => {
        const backdrop = track(scene.add.circle(x, y, BTN_RADIUS + 2, ACTION_COLOR, 0.22).setStrokeStyle(2, ACTION_COLOR, 0.85).setScrollFactor(0).setDepth(998).setInteractive({ useHandCursor: true }));
        const star = track(scene.add.star(x, y, 5, 9, 18, 16777215, 0.95).setScrollFactor(0).setDepth(999));
        const parts = [backdrop, star];
        backdrop.on("pointerdown", () => {
          this.touch.action = true;
          pressFeedback(parts, true);
          backdrop.setFillStyle(ACTION_COLOR, 0.5);
        });
        const release = () => {
          this.touch.action = false;
          pressFeedback(parts, false);
          backdrop.setFillStyle(ACTION_COLOR, 0.22);
        };
        backdrop.on("pointerup", release);
        backdrop.on("pointerout", release);
      };
      const bottomY = height - Math.min(70, height * 0.15);
      const moveCx = 105;
      const moveGap = 44;
      panel(moveCx, bottomY, moveGap * 2 + 70, PANEL_H, DPAD_COLOR);
      arrowButton(moveCx - moveGap, bottomY, 180, "left", DPAD_COLOR);
      arrowButton(moveCx + moveGap, bottomY, 0, "right", DPAD_COLOR);
      const rightCx = width - 150;
      const rightGap = 72;
      panel(rightCx, bottomY, rightGap * 2 + 74, PANEL_H, DPAD_COLOR);
      arrowButton(rightCx - rightGap, bottomY, 90, "down", DPAD_COLOR);
      arrowButton(rightCx, bottomY, 270, "jump", DPAD_COLOR);
      actionButton(rightCx + rightGap, bottomY);
    }
    _padButtonPressed(pad, index) {
      return !!(pad && pad.buttons[index] && pad.buttons[index].pressed);
    }
    /** Returns a fresh snapshot for this frame. Call once per GameScene.update(). */
    poll() {
      const pad = navigator.getGamepads ? navigator.getGamepads()[0] : null;
      const padAxisX = pad ? pad.axes[0] || 0 : 0;
      const padLeft = this._padButtonPressed(pad, 14) || padAxisX < -0.4;
      const padRight = this._padButtonPressed(pad, 15) || padAxisX > 0.4;
      const padDown = this._padButtonPressed(pad, 13) || (pad ? (pad.axes[1] || 0) > 0.5 : false);
      const padJump = this._padButtonPressed(pad, 0);
      const padAction = this._padButtonPressed(pad, 1) || this._padButtonPressed(pad, 2);
      const left = this.cursors.left.isDown || this.touch.left || padLeft;
      const right = this.cursors.right.isDown || this.touch.right || padRight;
      const downHeld = this.cursors.down.isDown || this.touch.down || padDown;
      const kbJump = Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.spaceKey);
      const kbAction = this.actionKeys.some((k) => Phaser.Input.Keyboard.JustDown(k));
      const kbDownJust = Phaser.Input.Keyboard.JustDown(this.cursors.down);
      const touchJumpEdge = this.touch.jump && !this._prevJump;
      const touchActionEdge = this.touch.action && !this._prevAction;
      const touchDownEdge = this.touch.down && !this._prevDown;
      const padJumpEdge = padJump && !this._padPrevJump;
      const padActionEdge = padAction && !this._padPrevAction;
      const snapshot = {
        left,
        right,
        downHeld,
        downJustPressed: kbDownJust || touchDownEdge,
        jumpJustPressed: kbJump || touchJumpEdge || padJumpEdge,
        actionJustPressed: kbAction || touchActionEdge || padActionEdge
      };
      this._prevDown = this.touch.down;
      this._prevJump = this.touch.jump;
      this._prevAction = this.touch.action;
      this._padPrevJump = padJump;
      this._padPrevAction = padAction;
      return snapshot;
    }
  };

  // 2d/js/scenes/GameScene.js
  var HOMING_RADIUS = 280;
  var GameScene = class extends Phaser.Scene {
    constructor() {
      super("GameScene");
    }
    init(data) {
      this.bossRush = !!data.bossRush;
      this.bossRushStartTime = data.bossRushStartTime || null;
      this.worldIndex = this.bossRush ? data.bossRushIndex || 0 : data.worldIndex || 0;
      this.stageIndex = this.bossRush ? 2 : data.stageIndex || 0;
      this.score = data.score || 0;
      this.playerName = data.playerName || "Player";
      this.profileTint = data.profileTint || 16777215;
      this.world = WORLDS[this.worldIndex];
      this.stageData = this.world.stages[this.stageIndex];
      this.theme = THEMES[this.world.theme];
      this.isInvulnerable = false;
      this.inputLocked = false;
      this.isDashing = false;
      this.isHomingActive = false;
      this.jumpsUsed = 0;
      this.airDashUsed = false;
      this.facing = 1;
      this.downHeldPrev = false;
      this.onIce = false;
      this.onMud = false;
      this.isGroundPounding = false;
      this.hasShield = false;
      this.superMode = false;
      this.superTriggered = false;
      const save = Save.current();
      this.nightmare = save.nightmareMode && save.gameCompleted;
    }
    create() {
      fadeInScene(this);
      this.cameras.main.setBackgroundColor(this.theme.sky);
      this.platforms = this.physics.add.staticGroup();
      this.rings = this.physics.add.group({ allowGravity: false, immovable: true });
      this.spikes = this.physics.add.staticGroup();
      this.springs = this.physics.add.staticGroup();
      this.speedpads = this.physics.add.staticGroup();
      this.goal = this.physics.add.staticGroup();
      this.breakables = this.physics.add.staticGroup();
      this.checkpoints = this.physics.add.group({ allowGravity: false, immovable: true });
      this.enemies = this.physics.add.group({ allowGravity: false, immovable: true });
      this.lava = this.physics.add.staticGroup();
      this.iceTiles = this.physics.add.staticGroup();
      this.mudTiles = this.physics.add.staticGroup();
      this.windZones = this.physics.add.staticGroup();
      this.crumbles = this.physics.add.staticGroup();
      this.movingPlatforms = [];
      this.verticalPlatforms = [];
      this.buildLevel(this.stageData.map);
      this.respawnX = this.spawnX;
      this.respawnY = this.spawnY;
      this.player = this.physics.add.sprite(this.spawnX, this.spawnY, "hero");
      if (this.profileTint !== 16777215) this.player.setTint(this.profileTint);
      this.player.setBounce(0.1);
      this.player.setCollideWorldBounds(true);
      this.player.setMaxVelocity(520, 900);
      this.player.setDragX(800);
      const worldWidth = Math.max(...this.stageData.map.map((r) => r.length)) * TILE;
      this.cameras.main.startFollow(this.player);
      this.cameras.main.setBounds(0, 0, worldWidth, 600);
      this.physics.world.setBounds(0, 0, worldWidth, 600);
      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.player, this.breakables, null, (player, wall) => {
        if (this.isDashing) {
          wall.destroy();
          SFX.dash();
          return false;
        }
        return true;
      }, this);
      this.physics.add.overlap(this.player, this.rings, this.collectRing, null, this);
      this.physics.add.collider(this.player, this.spikes, () => this.scatterOrDie(), null, this);
      this.physics.add.overlap(this.player, this.springs, this.hitSpring, null, this);
      this.physics.add.overlap(this.player, this.speedpads, this.hitSpeedPad, null, this);
      this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
      this.physics.add.overlap(this.player, this.checkpoints, this.hitCheckpoint, null, this);
      this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
      this.movingPlatforms.forEach((mp) => this.physics.add.collider(this.player, mp.obj));
      this.verticalPlatforms.forEach((vp) => this.physics.add.collider(this.player, vp.obj));
      this.physics.add.collider(this.player, this.iceTiles, () => this.onIce = true, null, this);
      this.physics.add.collider(this.player, this.mudTiles, () => this.onMud = true, null, this);
      this.physics.add.collider(this.player, this.crumbles, null, (player, tile) => {
        if (!tile.crumbling) {
          tile.crumbling = true;
          this.tweens.add({ targets: tile, alpha: 0.3, duration: 500 });
          this.time.delayedCall(550, () => tile.destroy());
        }
        return true;
      }, this);
      this.physics.add.overlap(this.player, this.lava, () => this.hitLava(), null, this);
      this.physics.add.overlap(this.player, this.windZones, () => {
        this.player.body.velocity.x = Math.min(this.player.body.velocity.x + 20, 420);
        this.player.body.velocity.y -= 28;
      }, null, this);
      this.controls = new InputController(this);
      this.scoreText = this.add.text(16, 16, "", { fontSize: "18px", fill: "#fff", fontStyle: "bold", backgroundColor: "#000" }).setScrollFactor(0);
      this.scoreText.setPadding(10, 10, 10, 10);
      this.updateHUD();
      this.soundIcon = addSoundIndicator(this, this.scale.width - 36, 56);
      this.pauseIcon = this.add.text(this.scale.width - 36, 24, "\u23F8", { fontSize: "20px", fill: "#fff", backgroundColor: "#00000066", padding: { x: 6, y: 2 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2e3).setInteractive({ useHandCursor: true });
      this.pauseIcon.on("pointerdown", () => this.togglePause());
      this._resizeHandler = (gameSize) => {
        if (this.soundIcon) this.soundIcon.setPosition(gameSize.width - 36, 56);
        if (this.pauseIcon) this.pauseIcon.setPosition(gameSize.width - 36, 24);
        if (this.bossBarBg) this.drawBossBar();
      };
      this.scale.on("resize", this._resizeHandler);
      const save = Save.current();
      if (save.abilities.shield) {
        this.hasShield = true;
        this.shieldGfx = this.add.circle(this.player.x, this.player.y, 26, 6737151, 0.25).setStrokeStyle(2, 6737151);
      }
      Music.playTheme(this.world.theme);
      if (this.stageData.type === "boss") this.setupBoss();
      if (this.stageIndex === 0) {
        this.showWorldTitleCard();
        this.time.delayedCall(2600, () => this.showHint(this.world.hint));
      }
      this.spawnAmbient();
      this.paused = false;
      this.input.keyboard.on("keydown-ESC", () => this.togglePause());
      this.events.once("shutdown", () => {
        const container = document.getElementById("game-container");
        if (container) container.classList.remove("boss-mode");
        Music.stop(0.5);
        this.scale.off("resize", this._resizeHandler);
      });
    }
    showWorldTitleCard() {
      const cx = this.scale.width / 2, cy = this.scale.height / 2;
      const dim = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0, 0.45).setScrollFactor(0).setDepth(500);
      const label = this.add.text(cx, cy - 30, `W O R L D   ${this.worldIndex + 1}`, { fontSize: "16px", fill: "#aaddff" }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);
      const name = this.add.text(cx, cy + 10, this.world.name, { fontSize: "40px", fill: "#ffcc00", fontStyle: "bold", stroke: "#000", strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0).setScale(0.85);
      this.tweens.add({ targets: [label, name], alpha: 1, duration: 400, ease: "Sine.easeOut" });
      this.tweens.add({ targets: name, scale: 1, duration: 500, ease: "Back.easeOut" });
      this.time.delayedCall(1700, () => {
        this.tweens.add({ targets: [dim, label, name], alpha: 0, duration: 500, onComplete: () => {
          dim.destroy();
          label.destroy();
          name.destroy();
        } });
      });
    }
    spawnAmbient() {
      const type = this.theme.ambient;
      if (!type) return;
      const w = this.scale.width, h = this.scale.height;
      const particles = this.add.particles("particle");
      let cfg;
      if (type === "snow") cfg = { x: { min: 0, max: w }, y: -10, lifespan: 6e3, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 10 }, tint: 16777215, quantity: 1, frequency: 150 };
      else if (type === "bubbles") cfg = { x: { min: 0, max: w }, y: h + 10, lifespan: 5e3, speedY: { min: -60, max: -20 }, speedX: { min: -5, max: 5 }, tint: 10083839, alpha: { start: 0.6, end: 0 }, quantity: 1, frequency: 300 };
      else if (type === "embers") cfg = { x: { min: 0, max: w }, y: h + 10, lifespan: 4e3, speedY: { min: -80, max: -30 }, speedX: { min: -15, max: 15 }, tint: 16737792, scale: { start: 0.5, end: 0.1 }, quantity: 1, frequency: 200 };
      else if (type === "dust") cfg = { x: { min: 0, max: w }, y: { min: 0, max: h }, lifespan: 4e3, speedY: { min: -10, max: 10 }, speedX: { min: -10, max: 10 }, tint: 12290303, alpha: { start: 0.5, end: 0 }, quantity: 1, frequency: 250 };
      else if (type === "sparks") cfg = { x: { min: 0, max: w }, y: { min: 0, max: h }, lifespan: 1200, speedY: { min: -40, max: 40 }, speedX: { min: -40, max: 40 }, tint: [65535, 16711935], quantity: 1, frequency: 180 };
      else if (type === "leaves") cfg = { x: { min: 0, max: w }, y: -10, lifespan: 7e3, speedY: { min: 15, max: 35 }, speedX: { min: -20, max: 20 }, tint: 6728243, scale: { start: 0.5, end: 0.5 }, quantity: 1, frequency: 400 };
      else return;
      particles.createEmitter(cfg);
      particles.setScrollFactor(0);
      this.ambientParticles = particles;
    }
    buildLevel(mapArray) {
      const save = Save.current();
      for (let y = 0; y < mapArray.length; y++) {
        let r = mapArray[y];
        for (let x = 0; x < r.length; x++) {
          let ch = r[x];
          let px = x * TILE + TILE / 2;
          let py = y * TILE + TILE / 2 + 150;
          if (ch === "x") this.platforms.create(px, py, "ground" + this.world.theme);
          else if (ch === "W") this.platforms.create(px, py, "wall").setTint(this.theme.groundTop);
          else if (ch === "R") this.rings.create(px, py, "ring");
          else if (ch === "E") this.spikes.create(px, py, "spike");
          else if (ch === "S") this.springs.create(px, py, "spring");
          else if (ch === ">") this.speedpads.create(px, py, "speedpad");
          else if (ch === "C") this.checkpoints.create(px, py, "checkpoint");
          else if (ch === "D") this.breakables.create(px, py, "breakable").setTint(this.theme.groundTop);
          else if (ch === "G") this.goal.create(px, py - 20, "goal");
          else if (ch === "N") {
            let e = this.enemies.create(px, py, "enemy").setTint(this.theme.groundBody);
            e.startX = px;
            e.dir = 1;
            e.speed = this.nightmare ? 2.4 : 1.5;
          } else if (ch === "M") {
            let mp = this.physics.add.image(px, py, "ground" + this.world.theme);
            mp.setImmovable(true);
            mp.body.allowGravity = false;
            this.movingPlatforms.push({ obj: mp, startX: px, dir: 1 });
          } else if (ch === "O") {
            let vp = this.physics.add.image(px, py, "hover").setTint(65484);
            vp.setImmovable(true);
            vp.body.allowGravity = false;
            this.verticalPlatforms.push({ obj: vp, baseY: py, dir: 1, speed: 1.2 });
          } else if (ch === "L") this.lava.create(px, py, "lava");
          else if (ch === "I") this.iceTiles.create(px, py, "ice");
          else if (ch === "U") this.mudTiles.create(px, py, "mud");
          else if (ch === "F") this.windZones.create(px, py, "windzone");
          else if (ch === "K") this.crumbles.create(px, py, "crumble");
          else if (ch === "P") {
            this.spawnX = px;
            this.spawnY = py;
          }
        }
      }
    }
    showHint(text) {
      const cx = this.scale.width / 2;
      const t = this.add.text(cx, 60, text, { fontSize: "15px", fill: "#fff", backgroundColor: "#000000aa", padding: { x: 10, y: 6 }, align: "center", wordWrap: { width: Math.min(600, this.scale.width - 40) } }).setOrigin(0.5).setScrollFactor(0);
      this.time.delayedCall(4500, () => this.tweens.add({ targets: t, alpha: 0, duration: 800, onComplete: () => t.destroy() }));
    }
    togglePause() {
      this.paused = !this.paused;
      if (this.paused) {
        this.physics.world.pause();
        this.pauseElements = this.buildPauseMenu();
      } else {
        this.physics.world.resume();
        if (this.pauseElements) this.pauseElements.forEach((el) => el.destroy());
        this.pauseElements = null;
      }
    }
    /** Real tappable buttons, not just "press ESC" text — pausing/quitting has to work with no keyboard (mobile). */
    buildPauseMenu() {
      const cx = this.scale.width / 2, cy = this.scale.height / 2;
      const els = [];
      const add = (obj) => {
        els.push(obj);
        return obj;
      };
      add(this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0, 0.6).setScrollFactor(0).setDepth(1900).setInteractive());
      add(this.add.text(cx, cy - 70, "PAUSED", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(1901));
      add(makeButton(this, cx, cy - 10, "[ \u25B6 Resume ]", () => this.togglePause(), { fontSize: "22px", color: "#00ff00" }).setDepth(1901));
      add(makeButton(this, cx, cy + 50, "[ Quit to World Map ]", () => {
        this.physics.world.resume();
        sceneTransition(this, "WorldMap");
      }, { fontSize: "16px", color: "#ff6666" }).setDepth(1901));
      return els;
    }
    setupBoss() {
      const container = document.getElementById("game-container");
      if (container) container.classList.add("boss-mode");
      const bossX = this.world.bossX * TILE + TILE / 2;
      const bossY = this.world.bossY * TILE + TILE / 2 + 150;
      this.boss = this.physics.add.sprite(bossX, bossY, "boss").setTint(this.world.bossColor);
      this.boss.body.allowGravity = false;
      this.boss.setImmovable(true);
      const nmHP = this.nightmare ? Math.ceil(this.world.bossHP * 1.5) : this.world.bossHP;
      this.bossHP = nmHP;
      this.bossMaxHP = nmHP;
      this.bossVulnerable = false;
      this.bossHitCooldown = false;
      this.bossPhase = 1;
      this.bossBaseX = bossX;
      this.bossDir = -1;
      this.projectiles = this.physics.add.group({ allowGravity: true });
      this.physics.add.overlap(this.player, this.boss, this.hitBoss, null, this);
      this.physics.add.overlap(this.player, this.projectiles, () => this.scatterOrDie(), null, this);
      Music.setBossIntensity(true);
      this.inputLocked = true;
      this.player.setVelocity(0, 0);
      this.player.body.moves = false;
      this.cameras.main.stopFollow();
      this.cameras.main.pan(bossX, bossY, 500, "Sine.easeInOut");
      this.cameras.main.zoomTo(1.5, 500, "Sine.easeInOut");
      this.time.delayedCall(900, () => {
        this.cameras.main.pan(this.player.x, this.player.y, 500, "Sine.easeInOut");
        this.cameras.main.zoomTo(1, 500, "Sine.easeInOut");
        this.time.delayedCall(500, () => {
          this.cameras.main.startFollow(this.player);
          this.player.body.moves = true;
          this.inputLocked = false;
        });
      });
      this.bossAttackTimer = this.time.addEvent({ delay: this.nightmare ? 1800 : 2500, callback: () => this.bossAttack(), loop: true });
      this.drawBossBar();
      const escapeHint = this.bossRush ? "" : " Or get past it and keep running to escape the fight entirely!";
      this.showHint(`BOSS: ${this.world.bossName}! Wait for it to flash YELLOW, then jump on it or dash into it!${escapeHint}`);
    }
    /**
     * (Re)creates the bar at the right position/size — used on setup and on
     * resize, where an instant snap is correct (the screen itself just
     * changed). Sits on its own solid backdrop panel (not just a transparent
     * dark rectangle) so it stays clearly visible against any world's
     * background color — the plain dark-gray bar could blend into similarly
     * dark skies (Volcano, Haunted Forest, the final Fortress) and read as
     * "hidden."
     */
    drawBossBar() {
      if (this.bossBarPanel) this.bossBarPanel.destroy();
      if (this.bossBarBg) this.bossBarBg.destroy();
      if (this.bossBarFg) this.bossBarFg.destroy();
      if (this.bossNameText) this.bossNameText.destroy();
      const cx = this.scale.width / 2;
      const barWidth = Math.min(300, this.scale.width - 120);
      this.bossBarWidth = barWidth;
      const panelW = barWidth + 40;
      this.bossBarPanel = this.add.graphics().setScrollFactor(0).setDepth(1499);
      this.bossBarPanel.fillStyle(0, 0.7);
      this.bossBarPanel.fillRoundedRect(cx - panelW / 2, 2, panelW, 46, 10);
      this.bossBarPanel.lineStyle(2, 16763904, 0.9);
      this.bossBarPanel.strokeRoundedRect(cx - panelW / 2, 2, panelW, 46, 10);
      this.bossBarBg = this.add.rectangle(cx, 30, barWidth, 18, 3355443).setScrollFactor(0).setDepth(1500).setStrokeStyle(2, 16777215);
      this.bossBarFg = this.add.rectangle(cx - barWidth / 2, 30, barWidth, 14, 16724787).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1501);
      this.bossBarFg.setScale(Math.max(0, this.bossHP / this.bossMaxHP), 1);
      this.bossNameText = this.add.text(cx, 12, this.world.bossName, { fontSize: "13px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(1501);
    }
    /** Called on every hit — smoothly drains the bar to the new HP fraction instead of snapping, with a brief white damage flash. */
    updateBossBar() {
      if (!this.bossBarFg) return;
      const pct = Math.max(0, this.bossHP / this.bossMaxHP);
      this.tweens.add({ targets: this.bossBarFg, scaleX: pct, duration: 280, ease: "Cubic.easeOut" });
      this.tweens.add({ targets: this.bossBarBg, x: this.bossBarBg.x - 3, duration: 40, yoyo: true, repeat: 3 });
      this.bossBarFg.setFillStyle(16777215);
      this.time.delayedCall(150, () => {
        if (this.bossBarFg && this.bossBarFg.active) this.bossBarFg.setFillStyle(16724787);
      });
    }
    /** The "completed" moment — bar visibly drains to empty and fades out, instead of just being abandoned when the boss dies. */
    drainBossBarToZero() {
      if (!this.bossBarFg) return;
      this.bossBarFg.setFillStyle(16772608);
      this.tweens.add({ targets: this.bossBarFg, scaleX: 0, duration: 350, ease: "Cubic.easeOut" });
      this.time.delayedCall(700, () => {
        const targets = [this.bossBarPanel, this.bossBarBg, this.bossBarFg, this.bossNameText].filter(Boolean);
        this.tweens.add({
          targets,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            targets.forEach((t) => t.destroy());
            this.bossBarPanel = this.bossBarBg = this.bossBarFg = this.bossNameText = null;
          }
        });
      });
    }
    bossAttack() {
      if (!this.boss || !this.boss.active) return;
      const p = this.projectiles.create(this.boss.x, this.boss.y + 40, "projectile");
      p.setVelocity(Phaser.Math.Between(-100, 100), 320);
      this.time.delayedCall(3e3, () => p.destroy());
      this.bossVulnerable = true;
      this.boss.setTint(16776960);
      this.time.delayedCall(1300, () => {
        if (this.boss && this.boss.active) {
          this.bossVulnerable = false;
          this.boss.setTint(this.world.bossColor);
        }
      });
    }
    hitBoss(player, boss) {
      if (this.bossHitCooldown || this.inputLocked) return;
      const stomping = player.body.velocity.y > 0 && player.y < boss.y - 20;
      if (this.bossVulnerable && (this.isDashing || this.isHomingActive || stomping)) {
        this.damageBoss();
      } else if (!this.bossVulnerable && !this.isInvulnerable && !this.superMode) {
        this.scatterOrDie();
      }
    }
    damageBoss() {
      this.bossHP -= 1;
      SFX.bossHit();
      vibrate(150, 0.4, 0.7);
      this.player.setVelocityY(-350);
      this.bossHitCooldown = true;
      this.time.delayedCall(500, () => this.bossHitCooldown = false);
      this.updateBossBar();
      if (this.worldIndex === FINAL_WORLD_INDEX && !this.superTriggered && this.bossHP <= this.bossMaxHP * 0.5) {
        this.triggerSuperTransformation();
        return;
      }
      if (this.bossHP <= this.bossMaxHP * 0.66 && this.bossPhase === 1) {
        this.bossPhase = 2;
        this.bossAttackTimer.delay = 1800;
      }
      if (this.bossHP <= this.bossMaxHP * 0.33 && this.bossPhase === 2) {
        this.bossPhase = 3;
        this.bossAttackTimer.delay = 1200;
      }
      if (this.bossHP <= 0) this.bossDefeated();
    }
    triggerSuperTransformation() {
      this.superTriggered = true;
      this.inputLocked = true;
      this.bossAttackTimer.paused = true;
      SFX.transform();
      vibrate(600, 0.6, 1);
      const t = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 - 40,
        `${this.world.friend} and your friends are cheering you on!

\u2605 SUPER TRANSFORMATION! \u2605`,
        { fontSize: "22px", fill: "#ffee00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
      ).setOrigin(0.5).setScrollFactor(0);
      this.time.delayedCall(2e3, () => {
        t.destroy();
        this.inputLocked = false;
        this.superMode = true;
        this.bossPhase = 4;
        this.bossAttackTimer.paused = false;
        this.bossAttackTimer.delay = 1e3;
        this.player.setTint(16772608);
        this.player.setMaxVelocity(700, 900);
        this.superParticles = this.add.particles("particle");
        this.superParticles.createEmitter({ tint: [16772608, 16777215], speed: { min: 20, max: 60 }, lifespan: 400, quantity: 2, frequency: 60, follow: this.player });
      });
    }
    bossDefeated() {
      this.inputLocked = true;
      this.bossAttackTimer.remove();
      this.boss.body.enable = false;
      SFX.bossDefeat();
      vibrate(500, 0.7, 1);
      Music.setBossIntensity(false);
      this.drainBossBarToZero();
      const container = document.getElementById("game-container");
      if (container) container.classList.remove("boss-mode");
      if (this.superParticles) this.superParticles.destroy();
      let particles = this.add.particles("particle");
      let emitter = particles.createEmitter({ speed: { min: 100, max: 300 }, lifespan: 800, quantity: 40, on: false });
      emitter.explode(40, this.boss.x, this.boss.y);
      this.tweens.add({ targets: this.boss, scale: 0, alpha: 0, duration: 600 });
      this.player.setVelocity(0, 0);
      const save = Save.current();
      save.clearedWorlds[this.worldIndex] = true;
      if (this.world.rewardKey) save.abilities[this.world.rewardKey] = true;
      save.unlockedWorld = Math.max(save.unlockedWorld, this.worldIndex + 1);
      save.gameCompleted = save.clearedWorlds.every(Boolean);
      this.recordStat((stats) => stats.bossesDefeated += 1);
      if (this.bossRush) {
        this.bossRushDefeated();
        return;
      }
      const isFinal = this.worldIndex === FINAL_WORLD_INDEX;
      const rewardLine = isFinal ? `You saved everyone and stopped ${VILLAIN} for good!` : `New Power Unlocked: ${this.world.rewardLabel}!`;
      this.time.delayedCall(1200, () => {
        const msg = this.add.text(
          this.scale.width / 2,
          this.scale.height / 2 - 40,
          `${this.world.friend} is FREE!
${rewardLine}

Click to continue`,
          { fontSize: "20px", fill: "#ffcc00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
        ).setOrigin(0.5).setScrollFactor(0);
        this.input.once("pointerdown", () => sceneTransition(this, "WorldMap"));
      });
    }
    bossRushDefeated() {
      const isLast = this.worldIndex >= WORLDS.length - 1;
      if (!isLast) {
        this.time.delayedCall(1200, () => {
          const msg = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 40,
            `${this.world.bossName} defeated!
Boss ${this.worldIndex + 1} of ${WORLDS.length} down.`,
            { fontSize: "18px", fill: "#ffcc00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
          ).setOrigin(0.5).setScrollFactor(0);
          this.time.delayedCall(1e3, () => {
            msg.destroy();
            sceneTransition(this, "GameScene", {
              bossRush: true,
              bossRushIndex: this.worldIndex + 1,
              bossRushStartTime: this.bossRushStartTime,
              score: this.score,
              playerName: this.playerName,
              profileTint: this.profileTint
            });
          });
        });
        return;
      }
      const elapsedSeconds = Math.round((Date.now() - this.bossRushStartTime) / 1e3);
      const save = Save.current();
      const prevBest = save.stats.bestBossRushSeconds;
      const isNewBest = prevBest === null || prevBest === void 0 || elapsedSeconds < prevBest;
      if (isNewBest) save.stats.bestBossRushSeconds = elapsedSeconds;
      const unlocked = checkAchievements(save);
      Save.persist();
      unlocked.forEach((ach) => this.showAchievementToast(ach));
      const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      this.time.delayedCall(1200, () => {
        const msg = this.add.text(
          this.scale.width / 2,
          this.scale.height / 2 - 40,
          `\u2605 BOSS RUSH COMPLETE! \u2605

Time: ${fmt(elapsedSeconds)}${isNewBest ? "  (NEW BEST!)" : `
Best: ${fmt(save.stats.bestBossRushSeconds)}`}

Click to continue`,
          { fontSize: "20px", fill: "#ffcc00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
        ).setOrigin(0.5).setScrollFactor(0);
        this.input.once("pointerdown", () => sceneTransition(this, "WorldMap"));
      });
    }
    update() {
      if (this.paused) return;
      const input = this.controls.poll();
      const wasOnIce = this.onIce;
      const wasOnMud = this.onMud;
      this.onIce = false;
      this.onMud = false;
      const accel = wasOnMud ? 350 : 1e3;
      const onGround = this.player.body.touching.down;
      this.player.setDragX(wasOnIce ? 60 : wasOnMud ? 2200 : 800);
      if (!this.wasOnGroundLastFrame && onGround && (this.prevVelY || 0) > 500) {
        this.landingEffect();
      }
      if (input.left) {
        this.player.setAccelerationX(-accel);
        this.player.setFlipX(true);
        this.facing = -1;
      } else if (input.right) {
        this.player.setAccelerationX(accel);
        this.player.setFlipX(false);
        this.facing = 1;
      } else this.player.setAccelerationX(0);
      if (input.downHeld && onGround && Math.abs(this.player.body.velocity.x) > 150) this.player.setScale(1, 0.65);
      else this.player.setScale(1, 1);
      const save = Save.current();
      if (this.downHeldPrev && !input.downHeld && onGround && save.abilities.spinDash && !this.inputLocked) {
        this.player.setVelocityX(this.facing * 850);
        this.isDashing = true;
        SFX.dash();
        this.time.delayedCall(300, () => this.isDashing = false);
      }
      this.downHeldPrev = input.downHeld;
      if (save.abilities.groundPound && input.downJustPressed && !onGround && !this.isGroundPounding && !this.inputLocked) {
        this.player.setVelocityY(1400);
        this.player.setVelocityX(0);
        this.isGroundPounding = true;
        SFX.dash();
      }
      if (this.isGroundPounding && onGround) {
        this.isGroundPounding = false;
        this.groundPoundImpact();
      }
      if (onGround) {
        this.jumpsUsed = 0;
        this.airDashUsed = false;
      }
      if (input.jumpJustPressed && !this.inputLocked) {
        if (onGround) {
          this.player.setVelocityY(-480);
          this.jumpsUsed = 1;
          SFX.jump();
        } else if (!onGround && (this.player.body.touching.left || this.player.body.touching.right) && save.abilities.wallJump) {
          const pushDir = this.player.body.touching.left ? 1 : -1;
          this.player.setVelocityY(-420);
          this.player.setVelocityX(pushDir * 460);
          this.jumpsUsed = 1;
          SFX.jump();
        } else if (save.abilities.doubleJump && this.jumpsUsed < 2) {
          this.player.setVelocityY(-400);
          this.jumpsUsed = 2;
          SFX.jump();
        }
      }
      const enemyList = this.enemies.getChildren();
      if (input.actionJustPressed && !onGround && !this.inputLocked) {
        let target = null;
        if (save.abilities.homingAttack) {
          let best = HOMING_RADIUS;
          const candidates = [...enemyList];
          if (this.boss && this.boss.active) candidates.push(this.boss);
          candidates.forEach((c) => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.x, c.y);
            if (d < best) {
              best = d;
              target = c;
            }
          });
        }
        if (target) {
          const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
          this.player.setVelocity(Math.cos(ang) * 900, Math.sin(ang) * 900);
          this.isHomingActive = true;
          this.jumpsUsed = 1;
          SFX.dash();
          this.time.delayedCall(350, () => this.isHomingActive = false);
        } else if (save.abilities.airDash && !this.airDashUsed) {
          this.player.setVelocityX(this.facing * 750);
          this.airDashUsed = true;
          SFX.dash();
        }
      }
      this.movingPlatforms.forEach((mp) => {
        mp.obj.x += 2 * mp.dir;
        if (mp.obj.x > mp.startX + 120) mp.dir = -1;
        if (mp.obj.x < mp.startX - 120) mp.dir = 1;
      });
      this.verticalPlatforms.forEach((vp) => {
        vp.obj.y += vp.speed * vp.dir;
        if (vp.obj.y > vp.baseY + 90) vp.dir = -1;
        if (vp.obj.y < vp.baseY - 90) vp.dir = 1;
      });
      enemyList.forEach((e) => {
        e.x += e.speed * e.dir;
        if (e.x > e.startX + 90) e.dir = -1;
        if (e.x < e.startX - 90) e.dir = 1;
        e.setFlipX(e.dir > 0);
      });
      if (save.abilities.ringMagnet) {
        this.rings.getChildren().forEach((r) => {
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, r.x, r.y);
          if (d < 140) this.physics.moveToObject(r, this.player, 480);
        });
      }
      if (this.shieldGfx) this.shieldGfx.setPosition(this.player.x, this.player.y).setVisible(this.hasShield);
      if (this.boss && this.boss.active) {
        const speed = (1 + this.bossPhase * 0.6) * (this.superMode ? 1.4 : 1);
        this.boss.x += speed * this.bossDir;
        if (this.boss.x > this.bossBaseX + 160) this.bossDir = -1;
        if (this.boss.x < this.bossBaseX - 160) this.bossDir = 1;
      }
      if (this.player.y > 580) this.die();
      this.prevVelY = this.player.body.velocity.y;
      this.wasOnGroundLastFrame = onGround;
    }
    landingEffect() {
      SFX.land();
      const particles = this.add.particles("particle");
      const emitter = particles.createEmitter({ tint: this.theme.groundTop, speed: { min: 40, max: 120 }, angle: { min: 200, max: 340 }, lifespan: 300, quantity: 8, scale: { start: 0.7, end: 0 }, on: false });
      emitter.explode(8, this.player.x, this.player.y + 14);
      this.time.delayedCall(350, () => particles.destroy());
    }
    recordStat(mutate) {
      const save = Save.current();
      mutate(save.stats);
      const unlocked = checkAchievements(save);
      Save.persist();
      unlocked.forEach((ach) => this.showAchievementToast(ach));
    }
    showAchievementToast(ach) {
      SFX.achievement();
      const t = this.add.text(this.scale.width / 2, 110, `\u{1F3C6} Achievement Unlocked: ${ach.name}`, { fontSize: "15px", fill: "#ffee00", backgroundColor: "#000000cc", padding: { x: 12, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 300, hold: 2200, yoyo: true, onComplete: () => t.destroy() });
    }
    groundPoundImpact() {
      this.cameras.main.shake(200, 0.01);
      SFX.enemyDefeat();
      vibrate(150, 0.3, 0.6);
      const radius = 110;
      let defeated = 0;
      this.enemies.getChildren().forEach((e) => {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < radius) {
          e.destroy();
          this.score += 2;
          defeated += 1;
        }
      });
      if (defeated > 0) this.recordStat((stats) => stats.enemiesDefeated += defeated);
      if (this.boss && this.boss.active && this.bossVulnerable && !this.bossHitCooldown && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < radius + 40) {
        this.damageBoss();
      }
      this.updateHUD();
    }
    hitEnemy(player, enemy) {
      if (this.inputLocked) return;
      const stomping = player.body.velocity.y > 0 && player.y < enemy.y - 12;
      if (this.isDashing || this.isHomingActive || stomping) {
        enemy.destroy();
        this.score += 2;
        player.setVelocityY(-320);
        SFX.enemyDefeat();
        this.recordStat((stats) => stats.enemiesDefeated += 1);
        this.updateHUD();
      } else if (!this.isInvulnerable) {
        this.scatterOrDie();
      }
    }
    hitLava() {
      if (this.isInvulnerable || this.inputLocked) return;
      if (this.consumeShield()) return;
      this.inputLocked = true;
      SFX.fire();
      vibrate(400, 0.5, 0.9);
      this.cameras.main.shake(300, 0.015);
      this.player.setTintFill(16724736);
      this.player.setVelocity(0, -200);
      let particles = this.add.particles("particle");
      let emitter = particles.createEmitter({ tint: [16737792, 16755200], speed: { min: 80, max: 200 }, lifespan: 500, quantity: 20, on: false });
      emitter.explode(20, this.player.x, this.player.y);
      const msg = this.add.text(this.player.x, this.player.y - 50, "It's HOT! Respawning...", { fontSize: "14px", fill: "#ffaa00" }).setOrigin(0.5);
      this.time.delayedCall(700, () => {
        msg.destroy();
        particles.destroy();
        this.player.clearTint();
        if (this.profileTint !== 16777215) this.player.setTint(this.profileTint);
        this.score = 0;
        this.updateHUD();
        this.player.setPosition(this.respawnX, this.respawnY);
        this.player.setVelocity(0, 0);
        this.inputLocked = false;
        this.isInvulnerable = true;
        this.player.setAlpha(0.5);
        this.time.delayedCall(1200, () => {
          this.isInvulnerable = false;
          this.player.setAlpha(1);
        });
        this.recordStat((stats) => stats.deaths += 1);
        this.maybeShowEncouragement();
      });
    }
    collectRing(player, ring) {
      ring.disableBody(true, true);
      this.score += 1;
      SFX.ring();
      this.recordStat((stats) => stats.totalRings += 1);
      this.updateHUD();
    }
    hitSpring(player) {
      player.setVelocityY(-750);
      SFX.spring();
    }
    hitSpeedPad(player) {
      player.setVelocityX(800);
      SFX.dash();
    }
    hitCheckpoint(player, cp) {
      this.respawnX = cp.x;
      this.respawnY = cp.y;
    }
    consumeShield() {
      if (!this.hasShield) return false;
      this.hasShield = false;
      if (this.shieldGfx) this.shieldGfx.setVisible(false);
      SFX.spring();
      this.time.delayedCall(15e3, () => {
        this.hasShield = true;
      });
      this.isInvulnerable = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(600, () => {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      });
      return true;
    }
    scatterOrDie() {
      if (this.isInvulnerable || this.inputLocked) return;
      if (this.consumeShield()) return;
      if (this.score > 0) {
        let n = Math.min(this.score, 15);
        for (let i = 0; i < n; i++) {
          let r = this.physics.add.sprite(this.player.x, this.player.y, "ring");
          r.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-500, -200));
          r.setBounce(0.8);
          r.setCollideWorldBounds(true);
          this.physics.add.collider(r, this.platforms);
          this.time.delayedCall(3e3, () => r.destroy());
        }
        this.score = 0;
        this.updateHUD();
        SFX.hurt();
        this.player.setVelocityY(-300);
        this.player.setVelocityX(this.player.body.velocity.x * -1);
        this.isInvulnerable = true;
        this.player.setAlpha(0.5);
        this.time.delayedCall(1500, () => {
          this.isInvulnerable = false;
          this.player.setAlpha(1);
        });
      } else {
        this.die();
      }
    }
    die() {
      SFX.hurt();
      this.score = 0;
      this.updateHUD();
      this.player.setPosition(this.respawnX, this.respawnY);
      this.player.setVelocity(0, 0);
      this.isInvulnerable = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(1200, () => {
        this.isInvulnerable = false;
        this.player.setAlpha(1);
      });
      this.recordStat((stats) => stats.deaths += 1);
      this.maybeShowEncouragement();
    }
    maybeShowEncouragement() {
      if (!Save.current().settings.encouragement) return;
      const msg = Phaser.Utils.Array.GetRandom(ENCOURAGEMENTS);
      const t = this.add.text(this.scale.width / 2, 80, msg, { fontSize: "14px", fill: "#aaddff", backgroundColor: "#00000099", padding: { x: 10, y: 6 } }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
      this.tweens.add({ targets: t, alpha: 1, duration: 300, hold: 2e3, yoyo: true, onComplete: () => t.destroy() });
    }
    reachGoal() {
      if (this.inputLocked) return;
      if (this.stageData.type === "boss") {
        if (this.bossRush) return;
        this.bossEscaped();
        return;
      }
      this.inputLocked = true;
      SFX.goal();
      this.time.delayedCall(300, () => {
        const nextStage = this.stageIndex + 1;
        sceneTransition(this, "GameScene", { worldIndex: this.worldIndex, stageIndex: nextStage, score: this.score, playerName: this.playerName, profileTint: this.profileTint });
      });
    }
    /**
     * Every boss arena has an exit past the boss's patrol range — reaching it
     * skips the fight as an alternate, skill-based way to progress (get past
     * without landing a hit, since the boss still damages you on non-vulnerable
     * contact). Still grants the world's ability and unlocks the next world
     * (so it can never soft-lock a later level that assumes you have that
     * ability), but doesn't count toward the bossesDefeated stat or its
     * achievements — those still require actually winning the fight.
     */
    bossEscaped() {
      this.inputLocked = true;
      SFX.goal();
      if (this.boss) this.boss.body.enable = false;
      if (this.bossAttackTimer) this.bossAttackTimer.remove();
      Music.setBossIntensity(false);
      const container = document.getElementById("game-container");
      if (container) container.classList.remove("boss-mode");
      const save = Save.current();
      save.clearedWorlds[this.worldIndex] = true;
      if (this.world.rewardKey) save.abilities[this.world.rewardKey] = true;
      save.unlockedWorld = Math.max(save.unlockedWorld, this.worldIndex + 1);
      save.gameCompleted = save.clearedWorlds.every(Boolean);
      Save.persist();
      const isFinal = this.worldIndex === FINAL_WORLD_INDEX;
      const line = isFinal ? `You slipped past ${VILLAIN}'s fortress without a fight and freed everyone! The final showdown will have to wait for another day...` : `You snuck past ${this.world.bossName} and freed ${this.world.friend} anyway!`;
      this.time.delayedCall(300, () => {
        const msg = this.add.text(
          this.scale.width / 2,
          this.scale.height / 2 - 40,
          `ESCAPED!
${line}

Click to continue`,
          { fontSize: "18px", fill: "#66ccff", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 }, wordWrap: { width: Math.min(560, this.scale.width - 60) } }
        ).setOrigin(0.5).setScrollFactor(0);
        this.input.once("pointerdown", () => sceneTransition(this, "WorldMap"));
      });
    }
    updateHUD() {
      if (this.bossRush) {
        this.scoreText.setText(`${this.playerName} | Rings: ${this.score} | BOSS RUSH ${this.worldIndex + 1}/${WORLDS.length}`);
      } else {
        this.scoreText.setText(`${this.playerName} | Rings: ${this.score} | ${this.world.name} - ${this.stageData.type === "boss" ? "BOSS" : "Stage " + (this.stageIndex + 1)}`);
      }
    }
  };

  // 2d/js/ui/orientationGuard.js
  function initOrientationGuard() {
    if (!isTouchDevice) return;
    const el = document.getElementById("orientation-guard");
    if (!el) return;
    const check = () => {
      const portrait = window.innerHeight > window.innerWidth;
      el.classList.toggle("visible", portrait);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
  }

  // 2d/js/main.js
  var config = {
    type: Phaser.AUTO,
    parent: "game-container",
    physics: { default: "arcade", arcade: { gravity: { y: 1200 }, debug: false } },
    scene: [PreloadScene, MainMenu, ProfileSelect, HowToPlay, Settings, WorldMap, StatsScene, GameScene],
    // Phaser only tracks 1 touch point by default. The split two-thumb touch
    // controls (movement on one hand, jump/action on the other) fundamentally
    // need simultaneous multi-touch — left thumb holding a direction while the
    // right thumb taps jump — or half the control scheme silently stops
    // responding on a real touchscreen.
    input: {
      activePointers: 3
    },
    // RESIZE (not FIT) so the canvas actually fills the viewport edge to edge
    // on a landscape phone/tablet instead of letterboxing to preserve 800x600's
    // 4:3 aspect ratio. Every scene reads its real size from this.scale.width/
    // height rather than assuming 800x600, so this is safe to fill dynamically.
    //
    // Using the *real* current viewport size (not the 800x600 fallback) as the
    // starting size matters: RESIZE mode is supposed to immediately measure its
    // parent and correct itself, but on some mobile browsers that first
    // measurement can be stale (e.g. mid-layout while the address bar is still
    // collapsing), leaving the game rendered at 800px wide well past what a
    // ~380px-wide phone screen can show — which pushes the right-anchored
    // controls (up/down, action, pause, sound icon) off-screen entirely, with
    // no way to reach them. Seeding it with the actual window size up front
    // avoids depending on that first auto-correction firing correctly at all.
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
  new Phaser.Game(config);
  initOrientationGuard();
})();
