// Entry point: a small, real 3D platformer — physics-driven movement, a
// rigged/animated character, dynamic shadows, post-processing, and a short
// run of goal-based platforming levels. See docs/3D_PROTOTYPE.md at the repo
// root for the honest scope/limitations (this replaced an earlier, purely
// single-scene "vertical slice" prototype — the fixes documented there for
// physics/loading/scale bugs still apply, since this reuses that same
// character/physics/rendering code).
import { Engine, Scene, ArcRotateCamera, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";

import { createHavokPlugin } from "./physics.js";
import { buildEnvironment, buildLevel, disposeLevel, updateMovingPlatforms } from "./environment.js";
import { loadCharacter } from "./character.js";
import { createKeyboardState } from "./input.js";
import { createTouchControls, isTouchDevice } from "./touchControls.js";
import { setupPostProcessing } from "./postfx.js";
import { LEVELS } from "./levels.js";
import { PERSONAS } from "./personas.js";

const GOAL_RADIUS = 2;
const STARTING_LIVES = 3;

// Shown before anything Babylon-related even starts — it's plain DOM, no
// engine/scene needed yet — and resolves once the player taps a swatch.
function selectPersona() {
  return new Promise((resolve) => {
    const selectEl = document.getElementById("character-select");
    const gridEl = document.getElementById("persona-grid");
    PERSONAS.forEach((persona) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "persona-btn";
      btn.innerHTML = `<span class="persona-swatch" style="background:${persona.swatch}"></span><span>${persona.name}</span>`;
      btn.addEventListener("click", () => {
        selectEl.classList.add("hidden");
        resolve(persona);
      });
      gridEl.appendChild(btn);
    });
  });
}

async function main() {
  const persona = await selectPersona();

  const canvas = document.getElementById("render-canvas");
  const engine = new Engine(canvas, true, { stencil: true, antialias: true });
  const scene = new Scene(engine);

  const havok = await createHavokPlugin();
  scene.enablePhysics(new Vector3(0, -9.81, 0), havok);

  const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 12, new Vector3(0, 1.5, 0), scene);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 25;
  camera.lowerBetaLimit = 0.2;
  camera.upperBetaLimit = Math.PI / 2.1;
  camera.wheelPrecision = 40;
  camera.attachControl(canvas, true);

  const { shadowGenerator } = buildEnvironment(scene);
  const character = await loadCharacter(scene, shadowGenerator, LEVELS[0].playerStart, persona);

  setupPostProcessing(scene, camera);

  const keyboardInput = createKeyboardState();
  const touchInput = createTouchControls();
  const loadingEl = document.getElementById("loading");
  const levelInfoEl = document.getElementById("level-info");
  const livesInfoEl = document.getElementById("lives-info");
  const infoEl = document.getElementById("info");
  const completeEl = document.getElementById("level-complete");
  const completeTitleEl = document.getElementById("level-complete-title");
  const completeSubEl = document.getElementById("level-complete-sub");
  const completeBtnEl = document.getElementById("level-complete-btn");
  const gameOverEl = document.getElementById("game-over");
  const gameOverBtnEl = document.getElementById("game-over-btn");

  if (isTouchDevice && infoEl) {
    infoEl.textContent = "Left stick to move · JUMP to jump · RUN to sprint · Drag screen to orbit camera";
  }

  let levelIndex = 0;
  let levelObjects = null;
  let levelActive = false; // false while an overlay (level-complete/game-over) is up
  let lives = STARTING_LIVES;

  function updateLivesHUD() {
    if (!livesInfoEl) return;
    livesInfoEl.textContent = "❤".repeat(Math.max(0, lives)) + "🖤".repeat(Math.max(0, STARTING_LIVES - lives));
    livesInfoEl.classList.remove("hidden");
  }

  function loadLevel(index) {
    disposeLevel(levelObjects);
    const data = LEVELS[index];
    levelObjects = buildLevel(scene, data, shadowGenerator);
    character.respawn(data.playerStart);
    levelActive = true;
    completeEl.classList.add("hidden");
    gameOverEl.classList.add("hidden");
    if (levelInfoEl) {
      levelInfoEl.textContent = `Level ${index + 1} of ${LEVELS.length}: ${data.name}`;
      levelInfoEl.classList.remove("hidden");
    }
    updateLivesHUD();
  }

  function onGoalReached() {
    levelActive = false;
    const isLast = levelIndex === LEVELS.length - 1;
    completeTitleEl.textContent = isLast ? "🏆 All Levels Complete!" : "Level Complete!";
    completeSubEl.textContent = isLast
      ? "You finished every level in this prototype."
      : `On to Level ${levelIndex + 2}: ${LEVELS[levelIndex + 1].name}`;
    completeBtnEl.textContent = isLast ? "Play Again" : "Next Level";
    completeEl.classList.remove("hidden");
  }

  // Falling into a gap costs a life instead of being a free, unlimited
  // retry — repeatedly missing jumps now has a real consequence, same as
  // any standard platformer's lives system.
  function onFall(data) {
    lives -= 1;
    updateLivesHUD();
    if (lives <= 0) {
      levelActive = false;
      gameOverEl.classList.remove("hidden");
    } else {
      character.respawn(data.playerStart);
    }
  }

  completeBtnEl.addEventListener("click", () => {
    levelIndex = levelIndex === LEVELS.length - 1 ? 0 : levelIndex + 1;
    if (levelIndex === 0) lives = STARTING_LIVES; // full loop back to Level 1 — fresh run
    loadLevel(levelIndex);
  });

  gameOverBtnEl.addEventListener("click", () => {
    lives = STARTING_LIVES;
    levelIndex = 0;
    loadLevel(0);
  });

  loadLevel(0);
  if (loadingEl) loadingEl.classList.add("hidden");

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;

    if (levelObjects && levelObjects.goalMesh) {
      levelObjects.goalMesh.rotation.y += dt * 1.5;
      levelObjects.goalMesh.rotation.x += dt * 0.7;
    }
    if (levelObjects && levelActive) {
      updateMovingPlatforms(levelObjects.movingPlatforms, dt);
    }

    if (levelActive) {
      // Merge keyboard and touch input — whichever has actual signal wins
      // per-axis, so a touch player who also has a keyboard plugged in
      // (a tablet with a case, say) doesn't fight themselves.
      const kb = keyboardInput.poll();
      const tc = touchInput.poll();
      const raw = {
        forwardAxis: kb.forwardAxis || tc.forwardAxis,
        strafeAxis: kb.strafeAxis || tc.strafeAxis,
        run: kb.run || tc.run,
        jumpPressed: kb.jumpPressed || tc.jumpPressed,
      };

      // Camera-relative movement: "forward" is wherever the camera is
      // currently looking, projected flat onto the ground plane.
      let x = 0, z = 0;
      if (raw.forwardAxis || raw.strafeAxis) {
        const forward = camera.getForwardRay().direction;
        const flatForward = new Vector3(forward.x, 0, forward.z).normalize();
        const flatRight = new Vector3(flatForward.z, 0, -flatForward.x);
        const move = flatForward.scale(raw.forwardAxis).add(flatRight.scale(raw.strafeAxis));
        if (move.lengthSquared() > 0.0001) {
          move.normalize();
          x = move.x;
          z = move.z;
        }
      }

      character.update({ x, z, run: raw.run, jumpPressed: raw.jumpPressed }, dt);

      const data = LEVELS[levelIndex];
      if (character.root.position.y < data.fallThreshold) {
        onFall(data);
      } else {
        const goalVec = new Vector3(data.goal[0], data.goal[1], data.goal[2]);
        if (Vector3.Distance(character.root.position, goalVec) < GOAL_RADIUS) {
          onGoalReached();
        }
      }
    }

    camera.target = character.root.position.add(new Vector3(0, 1.4, 0));
    scene.render();
  });

  window.addEventListener("resize", () => engine.resize());
}

main().catch((err) => {
  console.error("3D game failed to start:", err);
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.textContent = "Failed to load — see browser console for details.";
    loadingEl.classList.remove("hidden");
  }
});
