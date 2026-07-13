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

  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100, subdivisions: 4 }, scene);
  const groundMat = new PBRMaterial("groundMat", scene);
  groundMat.albedoColor = new Color3(0.28, 0.55, 0.28);
  groundMat.roughness = 0.9;
  groundMat.metallic = 0;
  ground.material = groundMat;
  ground.receiveShadows = true;

  // A separate invisible box for physics rather than colliding the visual
  // ground mesh directly: CreateGround is a zero-thickness plane, and both a
  // BOX collider auto-fit to it (degenerate height) and a MESH/heightfield
  // collider on it (one-sided-normal contact instability) let the character
  // fall straight through after a brief, unstable initial contact — confirmed
  // by headless testing (grounded flickered true then false while free-falling
  // under both approaches). A real box with actual thickness is robust.
  const groundPhysicsBox = MeshBuilder.CreateBox("groundPhysicsBox", { width: 100, height: 1, depth: 100 }, scene);
  groundPhysicsBox.position.y = -0.5;
  groundPhysicsBox.isVisible = false;
  new PhysicsAggregate(groundPhysicsBox, PhysicsShapeType.BOX, { mass: 0, friction: 0.8 }, scene);

  // A handful of simple platforms/obstacles so there's something to
  // navigate around — real geometry, real shadows, real collision.
  const platformPositions = [
    [6, 1, 4], [10, 2, -3], [-8, 1.5, 6], [-4, 2.5, -8], [14, 1, 10],
  ];
  platformPositions.forEach(([x, y, z], i) => {
    const box = MeshBuilder.CreateBox(`platform${i}`, { width: 3, height: y * 2, depth: 3 }, scene);
    box.position.set(x, y, z);
    const mat = new PBRMaterial(`platformMat${i}`, scene);
    mat.albedoColor = new Color3(0.75, 0.7, 0.55);
    mat.roughness = 0.6;
    mat.metallic = 0.1;
    box.material = mat;
    box.receiveShadows = true;
    shadowGenerator.addShadowCaster(box);
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0, friction: 0.6 }, scene);
  });

  return { shadowGenerator, ground };
}
