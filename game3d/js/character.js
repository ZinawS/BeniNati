// Loads a real rigged, mocap-animated character (Babylon's official demo
// asset — freely hosted for exactly this kind of use, see README for the
// honest asset-sourcing story) and drives it with physics-based movement
// instead of Arcade Physics' AABB overlap tests.
import { ImportMeshAsync, Vector3, Quaternion, TransformNode, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";

const CHARACTER_URL = "https://assets.babylonjs.com/meshes/HVGirl.glb";
const MOVE_SPEED = 4.2;
const RUN_SPEED = 8;
const JUMP_SPEED = 7;

// Animation group names aren't hardcoded — different exports of this asset
// have used slightly different naming, so we search by keyword instead of
// assuming an exact match, and fall back gracefully instead of silently
// leaving the character static if a name doesn't match.
function findAnimGroup(groups, patterns, exclude) {
  for (const pattern of patterns) {
    const match = groups.find((g) => pattern.test(g.name) && !(exclude && exclude.test(g.name)));
    if (match) return match;
  }
  return null;
}

// This asset's raw mesh hierarchy measures ~23.4 units tall (confirmed via
// headless diagnostic using getHierarchyBoundingVectors) rather than a
// human-scale ~1.8m — some source assets ship at whatever scale their DCC
// tool authored them at, with no implicit "1 unit = 1 meter" guarantee.
const RAW_HEIGHT = 23.41;
const TARGET_HEIGHT = 1.8;
const VISUAL_SCALE = TARGET_HEIGHT / RAW_HEIGHT;
const CAPSULE_RADIUS = 0.3;

export async function loadCharacter(scene, shadowGenerator) {
  const result = await ImportMeshAsync(CHARACTER_URL, scene);
  const root = result.meshes[0];

  // Physics needs a stable, correctly-scaled body to drive — rather than
  // fight the oversized visual mesh's own transform (and the shape-scaling
  // math that comes with resizing it), the capsule lives on a separate,
  // scale-1 anchor node, and the visual mesh is just a scaled-down child
  // that follows it. This is the standard "physics proxy + visual child"
  // pattern for exactly this kind of mesh/collider mismatch.
  const anchor = new TransformNode("characterAnchor", scene);
  anchor.position.set(0, 0.05, 0);
  anchor.rotationQuaternion = Quaternion.Identity();

  root.parent = anchor;
  root.position.set(0, 0, 0);
  root.scaling.setAll(VISUAL_SCALE);
  // This asset's imported root also carries a baked 180-degree rotation
  // (confirmed via headless diagnostic: rotationQuaternion was [0,0,1,0]
  // from the very first rendered frame, before physics ever touched it) —
  // left alone, the character renders upside down. Reset to identity.
  root.rotationQuaternion = Quaternion.Identity();

  result.meshes.forEach((m) => {
    m.receiveShadows = true;
    if (shadowGenerator) shadowGenerator.addShadowCaster(m, true);
  });

  const groups = result.animationGroups;
  groups.forEach((g) => g.stop());
  const anims = {
    idle: findAnimGroup(groups, [/idle/i]) || groups[0],
    walk: findAnimGroup(groups, [/walk/i], /back/i) || groups[0],
    run: findAnimGroup(groups, [/run/i], /back/i) || groups[0],
    jump: findAnimGroup(groups, [/jump/i]) || null,
  };

  // A capsule physics body, rotation locked so it doesn't topple like a
  // ragdoll bottle — standard technique for an upright character controller.
  // Explicit dimensions rather than mesh auto-fit: auto-fit from this asset's
  // skinned-mesh bounding box produced a degenerate/near-zero-overlap capsule
  // that fell straight through the ground forever with zero collision
  // response (confirmed via headless diagnostic). A hand-sized capsule for a
  // typical adult human sidesteps that entirely.
  const aggregate = new PhysicsAggregate(
    anchor,
    PhysicsShapeType.CAPSULE,
    {
      mass: 70,
      friction: 0.4,
      restitution: 0,
      radius: CAPSULE_RADIUS,
      pointA: new Vector3(0, CAPSULE_RADIUS, 0),
      pointB: new Vector3(0, TARGET_HEIGHT - CAPSULE_RADIUS, 0),
    },
    scene
  );
  aggregate.body.setMassProperties({ inertia: Vector3.Zero() });
  aggregate.body.setAngularDamping(1);

  let currentAnim = null;
  let blendTimer = null;
  function crossFadeTo(group, loop = true) {
    if (!group || currentAnim === group) return;
    const outgoing = currentAnim;
    currentAnim = group;
    group.play(loop);
    group.setWeightForAllAnimatables(0);
    if (blendTimer) clearInterval(blendTimer);
    const durationMs = 180;
    const steps = 8;
    let step = 0;
    blendTimer = setInterval(() => {
      step++;
      const t = step / steps;
      group.setWeightForAllAnimatables(Math.min(1, t));
      if (outgoing) outgoing.setWeightForAllAnimatables(Math.max(0, 1 - t));
      if (step >= steps) {
        clearInterval(blendTimer);
        if (outgoing && outgoing !== group) outgoing.stop();
      }
    }, durationMs / steps);
  }
  crossFadeTo(anims.idle);

  let grounded = true;
  let facing = 0; // radians

  function update(input, deltaSeconds) {
    const body = aggregate.body;
    const vel = body.getLinearVelocity();

    // Ground check: short downward ray from the capsule's base.
    const rayOrigin = anchor.position.add(new Vector3(0, 0.15, 0));
    const hit = scene.pickWithRay({ origin: rayOrigin, direction: new Vector3(0, -1, 0), length: 1.1 }, (m) => !result.meshes.includes(m));
    grounded = !!(hit && hit.hit);

    const moving = input.x !== 0 || input.z !== 0;
    const speed = input.run ? RUN_SPEED : MOVE_SPEED;
    const desiredX = input.x * speed;
    const desiredZ = input.z * speed;
    body.setLinearVelocity(new Vector3(desiredX, vel.y, desiredZ));

    if (input.jumpPressed && grounded) {
      body.setLinearVelocity(new Vector3(desiredX, JUMP_SPEED, desiredZ));
      grounded = false;
      crossFadeTo(anims.jump || anims.idle, false);
    } else if (!grounded) {
      // mid-air: keep whatever animation was already playing (jump/fall)
    } else if (moving) {
      crossFadeTo(input.run ? anims.run : anims.walk);
    } else {
      crossFadeTo(anims.idle);
    }

    if (moving) {
      facing = Math.atan2(input.x, input.z);
      // Rotate the anchor, not the visual mesh directly — the mesh just
      // inherits it as a child. Anchor has a rotationQuaternion set (see the
      // identity-reset above), so Babylon ignores plain .rotation.y writes.
      Quaternion.RotationYawPitchRollToRef(facing, 0, 0, anchor.rotationQuaternion);
    }
  }

  return { root: anchor, update, body: aggregate.body, get grounded() { return grounded; } };
}
