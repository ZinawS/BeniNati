// Real dynamic lighting + shadow mapping + a physically-shaded ground —
// this is the part of the "AAA visual" ask that's genuinely achievable:
// Babylon's PBR pipeline and shadow generator are built-in engine features,
// not something requiring a custom renderer.
import {
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  Color3,
  MeshBuilder,
  PBRMaterial,
  PhysicsAggregate,
  PhysicsShapeType,
} from "@babylonjs/core";

// Lights/fog/shadow generator are level-independent — set up once per game
// session. Level geometry (platforms, goal marker) is separate: see
// buildLevel()/disposeLevel() below, called every time the level changes.
export function buildEnvironment(scene) {
  // Soft ambient fill (sky-down / ground-up light) so shadowed areas are
  // never pure black, plus a directional "sun" that actually casts shadows.
  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.55;
  ambient.groundColor = new Color3(0.25, 0.28, 0.35);

  const sun = new DirectionalLight("sun", new Vector3(-0.5, -1, 0.4), scene);
  sun.intensity = 1.6;
  sun.position = new Vector3(20, 30, -20);

  const shadowGenerator = new ShadowGenerator(2048, sun);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  scene.clearColor.set(0.55, 0.72, 0.92, 1);
  scene.fogMode = 3; // FOGMODE_EXP2 — cheap depth cue, reads as atmosphere
  scene.fogColor = new Color3(0.6, 0.75, 0.9);
  scene.fogDensity = 0.006;

  return { shadowGenerator };
}

// Builds one level's platforms (real geometry + real collision, each sized
// with actual thickness — a lesson from the earlier zero-thickness-ground
// bug, see docs/3D_PROTOTYPE.md) plus a glowing, spinning goal marker.
// Returns everything so disposeLevel() can clean it all up when the player
// moves on to the next level.
export function buildLevel(scene, levelData, shadowGenerator) {
  const meshes = [];
  const aggregates = [];

  levelData.platforms.forEach((p, i) => {
    const box = MeshBuilder.CreateBox(`platform${i}`, { width: p.size[0], height: p.size[1], depth: p.size[2] }, scene);
    box.position.set(p.pos[0], p.pos[1], p.pos[2]);
    const mat = new PBRMaterial(`platformMat${i}`, scene);
    mat.albedoColor = new Color3(0.75, 0.7, 0.55);
    mat.roughness = 0.6;
    mat.metallic = 0.1;
    box.material = mat;
    box.receiveShadows = true;
    shadowGenerator.addShadowCaster(box);
    aggregates.push(new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0, friction: 0.7 }, scene));
    meshes.push(box);
  });

  const goalMesh = MeshBuilder.CreateTorus("goalMarker", { diameter: 1.6, thickness: 0.22, tessellation: 24 }, scene);
  goalMesh.position.set(levelData.goal[0], levelData.goal[1], levelData.goal[2]);
  const goalMat = new PBRMaterial("goalMat", scene);
  goalMat.emissiveColor = new Color3(1, 0.85, 0.2);
  goalMat.albedoColor = new Color3(1, 0.85, 0.2);
  goalMesh.material = goalMat;
  meshes.push(goalMesh);

  return { meshes, aggregates, goalMesh };
}

export function disposeLevel(levelObjects) {
  if (!levelObjects) return;
  levelObjects.aggregates.forEach((a) => a.dispose());
  levelObjects.meshes.forEach((m) => m.dispose());
}
