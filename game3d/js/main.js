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
import { buildEnvironment, buildLevel, disposeLevel } from "./environment.js";
import { loadCharacter } from "./character.js";
import { createKeyboardState } from "./input.js";
import { setupPostProcessing } from "./postfx.js";
import { LEVELS } from "./levels.js";

const GOAL_RADIUS = 2;

async function main() {
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
  const character = await loadCharacter(scene, shadowGenerator, LEVELS[0].playerStart);

  setupPostProcessing(scene, camera);

  const input = createKeyboardState();
  const loadingEl = document.getElementById("loading");
  const levelInfoEl = document.getElementById("level-info");
  const completeEl = document.getElementById("level-complete");
  const completeTitleEl = document.getElementById("level-complete-title");
  const completeSubEl = document.getElementById("level-complete-sub");
  const completeBtnEl = document.getElementById("level-complete-btn");

  let levelIndex = 0;
  let levelObjects = null;
  let levelActive = false; // false while the "level complete" overlay is up

  function loadLevel(index) {
    disposeLevel(levelObjects);
    const data = LEVELS[index];
    levelObjects = buildLevel(scene, data, shadowGenerator);
    character.respawn(data.playerStart);
    levelActive = true;
    completeEl.classList.add("hidden");
    if (levelInfoEl) {
      levelInfoEl.textContent = `Level ${index + 1} of ${LEVELS.length}: ${data.name}`;
      levelInfoEl.classList.remove("hidden");
    }
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

  completeBtnEl.addEventListener("click", () => {
    levelIndex = levelIndex === LEVELS.length - 1 ? 0 : levelIndex + 1;
    loadLevel(levelIndex);
  });

  loadLevel(0);
  if (loadingEl) loadingEl.classList.add("hidden");

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;

    if (levelObjects && levelObjects.goalMesh) {
      levelObjects.goalMesh.rotation.y += dt * 1.5;
      levelObjects.goalMesh.rotation.x += dt * 0.7;
    }

    if (levelActive) {
      // Camera-relative movement: "forward" is wherever the camera is
      // currently looking, projected flat onto the ground plane.
      const raw = input.poll();
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
        character.respawn(data.playerStart);
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
