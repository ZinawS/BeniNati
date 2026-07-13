import { TILE, THEMES } from "../config/themes.js";
import { WORLDS, VILLAIN, FINAL_WORLD_INDEX, ENCOURAGEMENTS } from "../config/worlds.js";
import { Save } from "../systems/save.js";
import { SFX, vibrate, Music } from "../systems/audio.js";
import { InputController } from "../systems/input.js";
import { checkAchievements } from "../systems/achievements.js";
import { sceneTransition, fadeInScene, makeButton } from "../ui/uiHelpers.js";
import { addSoundIndicator } from "../ui/soundIndicator.js";
import { safeAreaInsets } from "../systems/platform.js";

const HOMING_RADIUS = 280;

export class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init(data) {
    // Boss Rush reuses each world's existing boss stage back-to-back — no
    // new level data needed. Always lands on that world's boss map (index 2)
    // regardless of what stageIndex was passed.
    this.bossRush = !!data.bossRush;
    this.bossRushStartTime = data.bossRushStartTime || null;
    this.worldIndex = this.bossRush ? data.bossRushIndex || 0 : data.worldIndex || 0;
    this.stageIndex = this.bossRush ? 2 : data.stageIndex || 0;
    this.score = data.score || 0;
    this.playerName = data.playerName || "Player";
    this.profileTint = data.profileTint || 0xffffff;
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
    this.ringCombo = 0;
    this.comboTimer = null;
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
    if (this.profileTint !== 0xffffff) this.player.setTint(this.profileTint);
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
      if (this.isDashing) { wall.destroy(); SFX.dash(); return false; }
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
    this.physics.add.collider(this.player, this.iceTiles, () => (this.onIce = true), null, this);
    this.physics.add.collider(this.player, this.mudTiles, () => (this.onMud = true), null, this);
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

    const inset = safeAreaInsets();
    this.scoreText = this.add.text(16 + inset.left, 16 + inset.top, "", { fontSize: "18px", fill: "#fff", fontStyle: "bold", backgroundColor: "#000" }).setScrollFactor(0);
    this.scoreText.setPadding(10, 10, 10, 10);
    this.updateHUD();
    this.soundIcon = addSoundIndicator(this, this.scale.width - 36 - inset.right, 56 + inset.top);
    this.pauseIcon = this.add.text(this.scale.width - 36 - inset.right, 24 + inset.top, "⏸", { fontSize: "20px", fill: "#fff", backgroundColor: "#00000066", padding: { x: 6, y: 2 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(2000).setInteractive({ useHandCursor: true });
    this.pauseIcon.on("pointerdown", () => this.togglePause());

    this._resizeHandler = (gameSize) => {
      const inset = safeAreaInsets();
      if (this.soundIcon) this.soundIcon.setPosition(gameSize.width - 36 - inset.right, 56 + inset.top);
      if (this.pauseIcon) this.pauseIcon.setPosition(gameSize.width - 36 - inset.right, 24 + inset.top);
      if (this.scoreText) this.scoreText.setPosition(16 + inset.left, 16 + inset.top);
      if (this.bossBarBg) this.drawBossBar();
    };
    this.scale.on("resize", this._resizeHandler);

    const save = Save.current();
    if (save.abilities.shield) {
      this.hasShield = true;
      this.shieldGfx = this.add.circle(this.player.x, this.player.y, 26, 0x66ccff, 0.25).setStrokeStyle(2, 0x66ccff);
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
    const dim = this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.45).setScrollFactor(0).setDepth(500);
    const label = this.add.text(cx, cy - 30, `W O R L D   ${this.worldIndex + 1}`, { fontSize: "16px", fill: "#aaddff" }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);
    const name = this.add.text(cx, cy + 10, this.world.name, { fontSize: "40px", fill: "#ffcc00", fontStyle: "bold", stroke: "#000", strokeThickness: 6 }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0).setScale(0.85);
    this.tweens.add({ targets: [label, name], alpha: 1, duration: 400, ease: "Sine.easeOut" });
    this.tweens.add({ targets: name, scale: 1, duration: 500, ease: "Back.easeOut" });
    this.time.delayedCall(1700, () => {
      this.tweens.add({ targets: [dim, label, name], alpha: 0, duration: 500, onComplete: () => { dim.destroy(); label.destroy(); name.destroy(); } });
    });
  }

  spawnAmbient() {
    const type = this.theme.ambient;
    if (!type) return;
    const w = this.scale.width, h = this.scale.height;
    const particles = this.add.particles("particle");
    let cfg;
    if (type === "snow") cfg = { x: { min: 0, max: w }, y: -10, lifespan: 6000, speedY: { min: 20, max: 50 }, speedX: { min: -10, max: 10 }, tint: 0xffffff, quantity: 1, frequency: 150 };
    else if (type === "bubbles") cfg = { x: { min: 0, max: w }, y: h + 10, lifespan: 5000, speedY: { min: -60, max: -20 }, speedX: { min: -5, max: 5 }, tint: 0x99ddff, alpha: { start: 0.6, end: 0 }, quantity: 1, frequency: 300 };
    else if (type === "embers") cfg = { x: { min: 0, max: w }, y: h + 10, lifespan: 4000, speedY: { min: -80, max: -30 }, speedX: { min: -15, max: 15 }, tint: 0xff6600, scale: { start: 0.5, end: 0.1 }, quantity: 1, frequency: 200 };
    else if (type === "dust") cfg = { x: { min: 0, max: w }, y: { min: 0, max: h }, lifespan: 4000, speedY: { min: -10, max: 10 }, speedX: { min: -10, max: 10 }, tint: 0xbb88ff, alpha: { start: 0.5, end: 0 }, quantity: 1, frequency: 250 };
    else if (type === "sparks") cfg = { x: { min: 0, max: w }, y: { min: 0, max: h }, lifespan: 1200, speedY: { min: -40, max: 40 }, speedX: { min: -40, max: 40 }, tint: [0x00ffff, 0xff00ff], quantity: 1, frequency: 180 };
    else if (type === "leaves") cfg = { x: { min: 0, max: w }, y: -10, lifespan: 7000, speedY: { min: 15, max: 35 }, speedX: { min: -20, max: 20 }, tint: 0x66aa33, scale: { start: 0.5, end: 0.5 }, quantity: 1, frequency: 400 };
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
          e.startX = px; e.dir = 1; e.speed = this.nightmare ? 2.4 : 1.5;
        } else if (ch === "M") {
          let mp = this.physics.add.image(px, py, "ground" + this.world.theme);
          mp.setImmovable(true);
          mp.body.allowGravity = false;
          this.movingPlatforms.push({ obj: mp, startX: px, dir: 1 });
        } else if (ch === "O") {
          let vp = this.physics.add.image(px, py, "hover").setTint(0x00ffcc);
          vp.setImmovable(true);
          vp.body.allowGravity = false;
          this.verticalPlatforms.push({ obj: vp, baseY: py, dir: 1, speed: 1.2 });
        } else if (ch === "L") this.lava.create(px, py, "lava");
        else if (ch === "I") this.iceTiles.create(px, py, "ice");
        else if (ch === "U") this.mudTiles.create(px, py, "mud");
        else if (ch === "F") this.windZones.create(px, py, "windzone");
        else if (ch === "K") this.crumbles.create(px, py, "crumble");
        else if (ch === "P") { this.spawnX = px; this.spawnY = py; }
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
    const add = (obj) => { els.push(obj); return obj; };

    add(this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6).setScrollFactor(0).setDepth(1900).setInteractive());
    add(this.add.text(cx, cy - 70, "PAUSED", { fontSize: "30px", fill: "#ffcc00", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(1901));

    add(makeButton(this, cx, cy - 10, "[ ▶ Resume ]", () => this.togglePause(), { fontSize: "22px", color: "#00ff00" }).setDepth(1901));
    add(makeButton(this, cx, cy + 50, "[ 📷 Photo Mode ]", () => this.capturePhoto(), { fontSize: "16px", color: "#66ccff" }).setDepth(1901));
    add(makeButton(this, cx, cy + 100, "[ Quit to World Map ]", () => {
      this.physics.world.resume();
      sceneTransition(this, "WorldMap");
    }, { fontSize: "16px", color: "#ff6666" }).setDepth(1901));

    return els;
  }

  /** Hides all meta-UI (HUD, pause overlay, icons) for one frame, grabs a clean
   * snapshot of just the game world, and triggers a browser download of it. */
  capturePhoto() {
    const hidden = [this.scoreText, this.soundIcon, this.pauseIcon, ...(this.pauseElements || [])].filter(Boolean);
    hidden.forEach((el) => el.setVisible(false));
    this.game.renderer.snapshot((image) => {
      hidden.forEach((el) => el.setVisible(true));
      const link = document.createElement("a");
      link.href = image.src;
      link.download = `nati-beniyas-adventure-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.showToast("📸 Photo saved!", "#66ccff");
    });
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
    this.bossBarPanel.fillStyle(0x000000, 0.7);
    this.bossBarPanel.fillRoundedRect(cx - panelW / 2, 2, panelW, 46, 10);
    this.bossBarPanel.lineStyle(2, 0xffcc00, 0.9);
    this.bossBarPanel.strokeRoundedRect(cx - panelW / 2, 2, panelW, 46, 10);

    this.bossBarBg = this.add.rectangle(cx, 30, barWidth, 18, 0x333333).setScrollFactor(0).setDepth(1500).setStrokeStyle(2, 0xffffff);
    // Origin (0, 0.5) + scaleX lets the fill visibly drain from full to
    // empty (tweened in updateBossBar) instead of just snapping to a new
    // size on every hit — "life being reduced" should read as motion.
    this.bossBarFg = this.add.rectangle(cx - barWidth / 2, 30, barWidth, 14, 0xff3333).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1501);
    this.bossBarFg.setScale(Math.max(0, this.bossHP / this.bossMaxHP), 1);
    this.bossNameText = this.add.text(cx, 12, this.world.bossName, { fontSize: "13px", fill: "#fff", fontStyle: "bold" }).setOrigin(0.5).setScrollFactor(0).setDepth(1501);
  }

  /** Called on every hit — smoothly drains the bar to the new HP fraction instead of snapping, with a brief white damage flash. */
  updateBossBar() {
    if (!this.bossBarFg) return;
    const pct = Math.max(0, this.bossHP / this.bossMaxHP);
    this.tweens.add({ targets: this.bossBarFg, scaleX: pct, duration: 280, ease: "Cubic.easeOut" });
    this.tweens.add({ targets: this.bossBarBg, x: this.bossBarBg.x - 3, duration: 40, yoyo: true, repeat: 3 });
    this.bossBarFg.setFillStyle(0xffffff);
    this.time.delayedCall(150, () => { if (this.bossBarFg && this.bossBarFg.active) this.bossBarFg.setFillStyle(0xff3333); });
  }

  /** The "completed" moment — bar visibly drains to empty and fades out, instead of just being abandoned when the boss dies. */
  drainBossBarToZero() {
    if (!this.bossBarFg) return;
    this.bossBarFg.setFillStyle(0xffee00);
    this.tweens.add({ targets: this.bossBarFg, scaleX: 0, duration: 350, ease: "Cubic.easeOut" });
    this.time.delayedCall(700, () => {
      const targets = [this.bossBarPanel, this.bossBarBg, this.bossBarFg, this.bossNameText].filter(Boolean);
      this.tweens.add({
        targets, alpha: 0, duration: 500,
        onComplete: () => {
          targets.forEach((t) => t.destroy());
          this.bossBarPanel = this.bossBarBg = this.bossBarFg = this.bossNameText = null;
        },
      });
    });
  }

  bossAttack() {
    if (!this.boss || !this.boss.active) return;
    const p = this.projectiles.create(this.boss.x, this.boss.y + 40, "projectile");
    p.setVelocity(Phaser.Math.Between(-100, 100), 320);
    this.time.delayedCall(3000, () => p.destroy());
    this.bossVulnerable = true;
    this.boss.setTint(0xffff00);
    this.time.delayedCall(1300, () => {
      if (this.boss && this.boss.active) { this.bossVulnerable = false; this.boss.setTint(this.world.bossColor); }
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
    this.time.delayedCall(500, () => (this.bossHitCooldown = false));
    this.updateBossBar();

    if (this.worldIndex === FINAL_WORLD_INDEX && !this.superTriggered && this.bossHP <= this.bossMaxHP * 0.5) {
      this.triggerSuperTransformation();
      return;
    }

    if (this.bossHP <= this.bossMaxHP * 0.66 && this.bossPhase === 1) { this.bossPhase = 2; this.bossAttackTimer.delay = 1800; }
    if (this.bossHP <= this.bossMaxHP * 0.33 && this.bossPhase === 2) { this.bossPhase = 3; this.bossAttackTimer.delay = 1200; }
    if (this.bossHP <= 0) this.bossDefeated();
  }

  triggerSuperTransformation() {
    this.superTriggered = true;
    this.inputLocked = true;
    this.bossAttackTimer.paused = true;
    SFX.transform();
    vibrate(600, 0.6, 1);
    const t = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
      `${this.world.friend} and your friends are cheering you on!\n\n★ SUPER TRANSFORMATION! ★`,
      { fontSize: "22px", fill: "#ffee00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
    ).setOrigin(0.5).setScrollFactor(0);
    this.time.delayedCall(2000, () => {
      t.destroy();
      this.inputLocked = false;
      this.superMode = true;
      this.bossPhase = 4;
      this.bossAttackTimer.paused = false;
      this.bossAttackTimer.delay = 1000;
      this.player.setTint(0xffee00);
      this.player.setMaxVelocity(700, 900);
      this.superParticles = this.add.particles("particle");
      this.superParticles.createEmitter({ tint: [0xffee00, 0xffffff], speed: { min: 20, max: 60 }, lifespan: 400, quantity: 2, frequency: 60, follow: this.player });
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
    this.recordStat((stats) => (stats.bossesDefeated += 1));

    if (this.bossRush) {
      this.bossRushDefeated();
      return;
    }

    const isFinal = this.worldIndex === FINAL_WORLD_INDEX;
    const rewardLine = isFinal ? `You saved everyone and stopped ${VILLAIN} for good!` : `New Power Unlocked: ${this.world.rewardLabel}!`;

    this.time.delayedCall(1200, () => {
      const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
        `${this.world.friend} is FREE!\n${rewardLine}\n\nClick to continue`,
        { fontSize: "20px", fill: "#ffcc00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
      ).setOrigin(0.5).setScrollFactor(0);
      this.input.once("pointerdown", () => sceneTransition(this, "WorldMap"));
    });
  }

  bossRushDefeated() {
    const isLast = this.worldIndex >= WORLDS.length - 1;

    if (!isLast) {
      this.time.delayedCall(1200, () => {
        const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
          `${this.world.bossName} defeated!\nBoss ${this.worldIndex + 1} of ${WORLDS.length} down.`,
          { fontSize: "18px", fill: "#ffcc00", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 } }
        ).setOrigin(0.5).setScrollFactor(0);
        this.time.delayedCall(1000, () => {
          msg.destroy();
          sceneTransition(this, "GameScene", {
            bossRush: true,
            bossRushIndex: this.worldIndex + 1,
            bossRushStartTime: this.bossRushStartTime,
            score: this.score,
            playerName: this.playerName,
            profileTint: this.profileTint,
          });
        });
      });
      return;
    }

    const elapsedSeconds = Math.round((Date.now() - this.bossRushStartTime) / 1000);
    const save = Save.current();
    const prevBest = save.stats.bestBossRushSeconds;
    const isNewBest = prevBest === null || prevBest === undefined || elapsedSeconds < prevBest;
    if (isNewBest) save.stats.bestBossRushSeconds = elapsedSeconds;
    const unlocked = checkAchievements(save);
    Save.persist();
    unlocked.forEach((ach) => this.showAchievementToast(ach));

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    this.time.delayedCall(1200, () => {
      const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
        `★ BOSS RUSH COMPLETE! ★\n\nTime: ${fmt(elapsedSeconds)}${isNewBest ? "  (NEW BEST!)" : `\nBest: ${fmt(save.stats.bestBossRushSeconds)}`}\n\nClick to continue`,
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
    const accel = wasOnMud ? 350 : 1000;
    const onGround = this.player.body.touching.down;
    this.player.setDragX(wasOnIce ? 60 : wasOnMud ? 2200 : 800);

    // Arcade physics zeroes velocity.y on the same step it resolves a ground
    // collision, so "fall speed at impact" has to come from last frame's
    // velocity (captured below), not this frame's.
    if (!this.wasOnGroundLastFrame && onGround && (this.prevVelY || 0) > 500) {
      this.landingEffect();
    }

    if (input.left) { this.player.setAccelerationX(-accel); this.player.setFlipX(true); this.facing = -1; }
    else if (input.right) { this.player.setAccelerationX(accel); this.player.setFlipX(false); this.facing = 1; }
    else this.player.setAccelerationX(0);

    if (input.downHeld && onGround && Math.abs(this.player.body.velocity.x) > 150) this.player.setScale(1, 0.65);
    else this.player.setScale(1, 1);

    const save = Save.current();

    if (this.downHeldPrev && !input.downHeld && onGround && save.abilities.spinDash && !this.inputLocked) {
      this.player.setVelocityX(this.facing * 850);
      this.isDashing = true;
      SFX.dash();
      this.time.delayedCall(300, () => (this.isDashing = false));
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

    if (onGround) { this.jumpsUsed = 0; this.airDashUsed = false; }

    if (input.jumpJustPressed && !this.inputLocked) {
      if (onGround) { this.player.setVelocityY(-480); this.jumpsUsed = 1; SFX.jump(); this.jumpEffect(); }
      else if (!onGround && (this.player.body.touching.left || this.player.body.touching.right) && save.abilities.wallJump) {
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
          if (d < best) { best = d; target = c; }
        });
      }
      if (target) {
        const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        this.player.setVelocity(Math.cos(ang) * 900, Math.sin(ang) * 900);
        this.isHomingActive = true;
        this.jumpsUsed = 1;
        SFX.dash();
        this.time.delayedCall(350, () => (this.isHomingActive = false));
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
    this.showToast(`🏆 Achievement Unlocked: ${ach.name}`, "#ffee00");
  }

  showToast(message, color = "#ffee00") {
    const t = this.add.text(this.scale.width / 2, 110, message, { fontSize: "15px", fill: color, backgroundColor: "#000000cc", padding: { x: 12, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setAlpha(0);
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
    if (defeated > 0) this.recordStat((stats) => (stats.enemiesDefeated += defeated));
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
      this.recordStat((stats) => (stats.enemiesDefeated += 1));
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
    this.player.setTintFill(0xff3300);
    this.player.setVelocity(0, -200);
    let particles = this.add.particles("particle");
    let emitter = particles.createEmitter({ tint: [0xff6600, 0xffaa00], speed: { min: 80, max: 200 }, lifespan: 500, quantity: 20, on: false });
    emitter.explode(20, this.player.x, this.player.y);
    const msg = this.add.text(this.player.x, this.player.y - 50, "It's HOT! Respawning...", { fontSize: "14px", fill: "#ffaa00" }).setOrigin(0.5);
    this.time.delayedCall(700, () => {
      msg.destroy();
      particles.destroy();
      this.player.clearTint();
      if (this.profileTint !== 0xffffff) this.player.setTint(this.profileTint);
      this.score = 0;
      this.updateHUD();
      this.player.setPosition(this.respawnX, this.respawnY);
      this.player.setVelocity(0, 0);
      this.inputLocked = false;
      this.isInvulnerable = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(1200, () => { this.isInvulnerable = false; this.player.setAlpha(1); });
      this.recordStat((stats) => (stats.deaths += 1));
      this.maybeShowEncouragement();
    });
  }

  collectRing(player, ring) {
    ring.disableBody(true, true);
    this.score += 1;
    SFX.ring();
    this.ringSparkle(ring.x, ring.y);
    this.recordStat((stats) => (stats.totalRings += 1));

    this.ringCombo += 1;
    if (this.comboTimer) this.comboTimer.remove();
    this.comboTimer = this.time.delayedCall(2500, () => { this.ringCombo = 0; this.updateHUD(); });
    if (this.ringCombo > 0 && this.ringCombo % 5 === 0) {
      this.score += 5;
      this.showToast(`✨ Combo x${this.ringCombo}! +5 bonus`, "#66ffcc");
    }

    this.updateHUD();
  }

  ringSparkle(x, y) {
    const particles = this.add.particles("particle");
    const emitter = particles.createEmitter({ tint: [0xffee00, 0xffffff], speed: { min: 40, max: 100 }, lifespan: 250, quantity: 6, scale: { start: 0.6, end: 0 }, on: false });
    emitter.explode(6, x, y);
    this.time.delayedCall(300, () => particles.destroy());
  }

  jumpEffect() {
    const particles = this.add.particles("particle");
    const emitter = particles.createEmitter({ tint: this.theme.groundTop, speed: { min: 30, max: 80 }, angle: { min: 250, max: 290 }, lifespan: 220, quantity: 5, scale: { start: 0.5, end: 0 }, on: false });
    emitter.explode(5, this.player.x, this.player.y + 16);
    this.time.delayedCall(300, () => particles.destroy());
  }

  hitSpring(player) { player.setVelocityY(-750); SFX.spring(); }
  hitSpeedPad(player) { player.setVelocityX(800); SFX.dash(); }
  hitCheckpoint(player, cp) { this.respawnX = cp.x; this.respawnY = cp.y; }

  consumeShield() {
    if (!this.hasShield) return false;
    this.hasShield = false;
    if (this.shieldGfx) this.shieldGfx.setVisible(false);
    SFX.spring();
    this.time.delayedCall(15000, () => { this.hasShield = true; });
    this.isInvulnerable = true;
    this.player.setAlpha(0.5);
    this.time.delayedCall(600, () => { this.isInvulnerable = false; this.player.setAlpha(1); });
    return true;
  }

  scatterOrDie() {
    if (this.isInvulnerable || this.inputLocked) return;
    if (this.consumeShield()) return;
    this.ringCombo = 0;
    if (this.comboTimer) this.comboTimer.remove();
    if (this.score > 0) {
      let n = Math.min(this.score, 15);
      for (let i = 0; i < n; i++) {
        let r = this.physics.add.sprite(this.player.x, this.player.y, "ring");
        r.setVelocity(Phaser.Math.Between(-300, 300), Phaser.Math.Between(-500, -200));
        r.setBounce(0.8);
        r.setCollideWorldBounds(true);
        this.physics.add.collider(r, this.platforms);
        this.time.delayedCall(3000, () => r.destroy());
      }
      this.score = 0;
      this.updateHUD();
      SFX.hurt();
      this.player.setVelocityY(-300);
      this.player.setVelocityX(this.player.body.velocity.x * -1);
      this.isInvulnerable = true;
      this.player.setAlpha(0.5);
      this.time.delayedCall(1500, () => { this.isInvulnerable = false; this.player.setAlpha(1); });
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
    this.time.delayedCall(1200, () => { this.isInvulnerable = false; this.player.setAlpha(1); });
    this.recordStat((stats) => (stats.deaths += 1));
    this.maybeShowEncouragement();
  }

  maybeShowEncouragement() {
    if (!Save.current().settings.encouragement) return;
    const msg = Phaser.Utils.Array.GetRandom(ENCOURAGEMENTS);
    const t = this.add.text(this.scale.width / 2, 80, msg, { fontSize: "14px", fill: "#aaddff", backgroundColor: "#00000099", padding: { x: 10, y: 6 } }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 300, hold: 2000, yoyo: true, onComplete: () => t.destroy() });
  }

  reachGoal() {
    if (this.inputLocked) return;
    if (this.stageData.type === "boss") {
      // Boss Rush is specifically about fighting every boss — no shortcut there.
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
    const line = isFinal
      ? `You slipped past ${VILLAIN}'s fortress without a fight and freed everyone! The final showdown will have to wait for another day...`
      : `You snuck past ${this.world.bossName} and freed ${this.world.friend} anyway!`;

    this.time.delayedCall(300, () => {
      const msg = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40,
        `ESCAPED!\n${line}\n\nClick to continue`,
        { fontSize: "18px", fill: "#66ccff", align: "center", backgroundColor: "#000000cc", padding: { x: 20, y: 20 }, wordWrap: { width: Math.min(560, this.scale.width - 60) } }
      ).setOrigin(0.5).setScrollFactor(0);
      this.input.once("pointerdown", () => sceneTransition(this, "WorldMap"));
    });
  }

  updateHUD() {
    const combo = this.ringCombo >= 2 ? ` (x${this.ringCombo} combo!)` : "";
    if (this.bossRush) {
      this.scoreText.setText(`${this.playerName} | Rings: ${this.score}${combo} | BOSS RUSH ${this.worldIndex + 1}/${WORLDS.length}`);
    } else {
      this.scoreText.setText(`${this.playerName} | Rings: ${this.score}${combo} | ${this.world.name} - ${this.stageData.type === "boss" ? "BOSS" : "Stage " + (this.stageIndex + 1)}`);
    }
  }
}
