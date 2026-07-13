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
  PhysicsMotionType,
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
  const movingPlatforms = [];

  levelData.platforms.forEach((p, i) => {
    const box = MeshBuilder.CreateBox(`platform${i}`, { width: p.size[0], height: p.size[1], depth: p.size[2] }, scene);
    box.position.set(p.pos[0], p.pos[1], p.pos[2]);
    // Moving platforms get a warmer tint so they visually read as "different
    // from the static path" at a glance, not just when they start sliding.
    const mat = new PBRMaterial(`platformMat${i}`, scene);
    mat.albedoColor = p.moving ? new Color3(0.85, 0.55, 0.35) : new Color3(0.75, 0.7, 0.55);
    mat.roughness = 0.6;
    mat.metallic = 0.1;
    box.material = mat;
    box.receiveShadows = true;
    shadowGenerator.addShadowCaster(box);
    const aggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 0, friction: 0.7 }, scene);
    if (p.moving) {
      // ANIMATED (not STATIC/DYNAMIC): moves under our own control each
      // frame rather than gravity/forces, but still correctly pushes/carries
      // a DYNAMIC body (the player) standing on it — real physics-driven
      // motion, not a purely visual slide with fake collision.
      aggregate.body.setMotionType(PhysicsMotionType.ANIMATED);
      movingPlatforms.push({ body: aggregate.body, basePos: box.position.clone(), ...p.moving, elapsed: 0 });
    }
    aggregates.push(aggregate);
    meshes.push(box);
  });

  const goalMesh = MeshBuilder.CreateTorus("goalMarker", { diameter: 1.6, thickness: 0.22, tessellation: 24 }, scene);
  goalMesh.position.set(levelData.goal[0], levelData.goal[1], levelData.goal[2]);
  const goalMat = new PBRMaterial("goalMat", scene);
  goalMat.emissiveColor = new Color3(1, 0.85, 0.2);
  goalMat.albedoColor = new Color3(1, 0.85, 0.2);
  goalMesh.material = goalMat;
  meshes.push(goalMesh);

  // Bonus rings — small cyan tori, distinct from the goal's larger gold one
  // at a glance. Pure distance-check pickup (same pattern main.js already
  // uses for the goal), no physics trigger needed.
  const collectibles = (levelData.collectibles || []).map((pos, i) => {
    const mesh = MeshBuilder.CreateTorus(`collectible${i}`, { diameter: 0.6, thickness: 0.12, tessellation: 16 }, scene);
    mesh.position.set(pos[0], pos[1], pos[2]);
    const mat = new PBRMaterial(`collectibleMat${i}`, scene);
    mat.emissiveColor = new Color3(0.3, 0.9, 1);
    mat.albedoColor = new Color3(0.3, 0.9, 1);
    mesh.material = mat;
    meshes.push(mesh);
    return { mesh, collected: false };
  });

  // Checkpoint beacons — a thin pole planted at the actual respawn spot
  // (ground level, same convention as playerStart), drawn tall so it reads
  // from a distance. Starts dim, lights up green once activated (see
  // main.js) as the only feedback the player needs that it "took".
  const checkpoints = (levelData.checkpoints || []).map((pos, i) => {
    const mesh = MeshBuilder.CreateCylinder(`checkpoint${i}`, { diameter: 0.3, height: 2 }, scene);
    mesh.position.set(pos[0], pos[1] + 1, pos[2]);
    const mat = new PBRMaterial(`checkpointMat${i}`, scene);
    mat.emissiveColor = new Color3(0.3, 0.35, 0.4);
    mat.albedoColor = new Color3(0.3, 0.35, 0.4);
    mesh.material = mat;
    mesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(mesh);
    meshes.push(mesh);
    return { mesh, mat, activated: false, respawn: pos };
  });

  return { meshes, aggregates, goalMesh, movingPlatforms, collectibles, checkpoints };
}

// Spins every not-yet-collected ring in place — purely cosmetic, same idea
// as the goal marker's own spin in main.js's render loop.
export function updateCollectibles(collectibles, dt) {
  collectibles.forEach((c) => {
    if (!c.collected) c.mesh.rotation.y += dt * 2.4;
  });
}

// Advances every moving platform in the current level by one frame — an
// oscillating sine offset along its configured axis, driven through
// setTargetTransform() so Havok computes correct carry-along velocity for
// anything standing on top (unlike a raw position write, which a physics
// body would just ignore).
export function updateMovingPlatforms(movingPlatforms, dt) {
  movingPlatforms.forEach((mp) => {
    mp.elapsed += dt;
    const offset = Math.sin(mp.elapsed * mp.speed) * mp.range;
    const pos = mp.basePos.clone();
    pos[mp.axis] += offset;
    mp.body.setTargetTransform(pos, mp.body.transformNode.rotationQuaternion);
  });
}

export function disposeLevel(levelObjects) {
  if (!levelObjects) return;
  levelObjects.aggregates.forEach((a) => a.dispose());
  levelObjects.meshes.forEach((m) => m.dispose());
}
