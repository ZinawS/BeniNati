// Vertical-slice entry point: prove the toolchain (physics, lighting,
// shadows, post-processing, a real animated character) works end to end
// before building out actual levels/content on top of it. See
// docs/3D_PROTOTYPE.md at the repo root for what this is and isn't.
import { Engine, Scene, ArcRotateCamera, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";

import { createHavokPlugin } from "./physics.js";
import { buildEnvironment } from "./environment.js";
import { loadCharacter } from "./character.js";
import { createKeyboardState } from "./input.js";
import { setupPostProcessing } from "./postfx.js";

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
  const character = await loadCharacter(scene, shadowGenerator);

  setupPostProcessing(scene, camera);

  const input = createKeyboardState();
  const loadingEl = document.getElementById("loading");
  if (loadingEl) loadingEl.classList.add("hidden");

  engine.runRenderLoop(() => {
    const dt = engine.getDeltaTime() / 1000;

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
    camera.target = character.root.position.add(new Vector3(0, 1.4, 0));

    scene.render();
  });

  window.addEventListener("resize", () => engine.resize());
}

main().catch((err) => {
  console.error("3D prototype failed to start:", err);
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.textContent = "Failed to load — see browser console for details.";
    loadingEl.classList.remove("hidden");
  }
});
