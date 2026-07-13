// Loads a real rigged, mocap-animated character (Babylon's official demo
// asset — freely hosted for exactly this kind of use, see README for the
// honest asset-sourcing story) and drives it with physics-based movement
// instead of Arcade Physics' AABB overlap tests.
import { ImportMeshAsync, Vector3, Quaternion, Color3, TransformNode, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";

const DEFAULT_CHARACTER_URL = "https://assets.babylonjs.com/meshes/HVGirl.glb";
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

// Source character meshes don't ship at a guaranteed "1 unit = 1 meter"
// scale — HVGirl.glb measures ~23.4 units tall (confirmed via headless
// diagnostic using getHierarchyBoundingVectors), while Xbot.glb measures
// ~1.8 units tall already. Rather than hardcode a raw-height constant per
// model (which silently goes stale the moment a third model is added),
// this is measured fresh from whatever was actually just imported.
const TARGET_HEIGHT = 1.8;
const CAPSULE_RADIUS = 0.3;

// Both supported character models face -Z at their (post-import) identity
// rotation, not +Z — verified visually (see loadCharacter). This offset is
// added to every anchor yaw so "facing 0" (moving toward +Z, i.e. straight
// into the level from the default camera) actually turns the model away
// from the camera instead of leaving it facing the viewer.
const FACING_YAW_OFFSET = Math.PI;

export async function loadCharacter(scene, shadowGenerator, startPos = [0, 0.05, 0], persona = null) {
  const characterUrl = (persona && persona.characterUrl) || DEFAULT_CHARACTER_URL;
  const result = await ImportMeshAsync(characterUrl, scene);
  const root = result.meshes[0];

  // Persona is normally an outfit recolor only (T-shirt/shorts materials on
  // the default rig), never skin/hair/eyes — see personas.js for why not
  // different models entirely for every persona. A persona *can* specify
  // characterUrl to swap the whole model instead (only Xbot.glb does this
  // today) — its material names don't match "T-shirt"/"short" at all, so
  // this recolor step harmlessly no-ops for it rather than needing a
  // separate code path.
  if (persona) {
    result.meshes.forEach((m) => {
      if (!m.material) return;
      if (persona.shirtColor && m.material.name === "T-shirt") m.material.albedoColor = Color3.FromArray(persona.shirtColor);
      if (persona.shortsColor && m.material.name === "short") m.material.albedoColor = Color3.FromArray(persona.shortsColor);
    });
  }

  // Physics needs a stable, correctly-scaled body to drive — rather than
  // fight the oversized visual mesh's own transform (and the shape-scaling
  // math that comes with resizing it), the capsule lives on a separate,
  // scale-1 anchor node, and the visual mesh is just a scaled-down child
  // that follows it. This is the standard "physics proxy + visual child"
  // pattern for exactly this kind of mesh/collider mismatch.
  const anchor = new TransformNode("characterAnchor", scene);
  anchor.position.set(startPos[0], startPos[1], startPos[2]);
  anchor.rotationQuaternion = Quaternion.RotationAxis(Vector3.Up(), FACING_YAW_OFFSET);

  root.parent = anchor;
  root.position.set(0, 0, 0);

  // Measure the raw hierarchy height *before* touching scaling, and derive
  // the correction factor from that — works for any model regardless of its
  // native scale. Sign preserved per-axis (not just magnitude) because some
  // exports bake a mirror into the root's own scaling as a coordinate-system
  // conversion — confirmed via headless diagnostic: Xbot.glb's root scaling
  // is [1, 1, -1], a genuine Z-axis mirror, not just [1,1,1]. Blindly
  // overwriting it with a uniform scale (as HVGirl's fix originally did,
  // when there was only one model to worry about) would have silently
  // un-mirrored it, which typically shows up as inverted normals/backwards
  // winding on a mesh that was authored assuming that mirror stays intact.
  const rawBounds = root.getHierarchyBoundingVectors(true);
  const rawHeight = rawBounds.max.y - rawBounds.min.y;
  const visualScale = TARGET_HEIGHT / rawHeight;
  const sign = (n) => (n < 0 ? -1 : 1);
  root.scaling.set(
    sign(root.scaling.x) * visualScale,
    sign(root.scaling.y) * visualScale,
    sign(root.scaling.z) * visualScale
  );

  // HVGirl's imported root carries a baked 180-degree rotation about Z
  // (rotationQuaternion [0,0,1,0] from the very first rendered frame,
  // before physics ever touched it) — left alone, it renders upside down.
  // Xbot's is a 180-degree rotation about Y instead ([0,1,0,0]) — a
  // facing-direction flip, not an upside-down one. Both get reset to
  // identity here for the same reason (our own movement code drives
  // facing via the anchor, not whatever the asset shipped with) — but at
  // identity, both models' neutral pose actually faces -Z (confirmed by
  // screenshotting: the character showed its face to a camera parked on
  // the -Z side while walking toward +Z, i.e. it always faced the viewer
  // instead of the direction it was walking). FACING_YAW_OFFSET corrects
  // for that so yaw 0 on the anchor means "facing +Z", matching the
  // atan2(x, z) convention used below.
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
      Quaternion.RotationYawPitchRollToRef(facing + FACING_YAW_OFFSET, 0, 0, anchor.rotationQuaternion);
    }
  }

  // Teleporting a *dynamic* physics body (nonzero mass) isn't as simple as
  // setting transformNode.position — Havok owns that body's transform once
  // it's simulating, so a plain position write normally gets ignored/
  // overwritten on the next physics step (prestep is DISABLED by default,
  // precisely so our own per-frame position isn't fought over). This
  // deliberately did NOT use setTargetTransform() first — that API makes the
  // body *seek toward* a target by adjusting velocity over time, not snap to
  // it; combined with update()'s own per-frame setLinearVelocity() calls,
  // the two fought each other and produced runaway upward drift instead of
  // an instant teleport (confirmed via headless diagnostic: y climbed
  // unbounded, x/z froze mid-air). Flipping disablePreStep off for exactly
  // one physics step is Babylon's actual documented mechanism for a genuine
  // teleport: it makes the body pull its transform FROM the node for that
  // one step, instead of the other way around.
  function respawn(position) {
    const body = aggregate.body;
    body.setLinearVelocity(Vector3.Zero());
    body.setAngularVelocity(Vector3.Zero());
    anchor.position.set(position[0], position[1], position[2]);
    anchor.rotationQuaternion.copyFrom(Quaternion.RotationAxis(Vector3.Up(), FACING_YAW_OFFSET));
    body.disablePreStep = false;
    // Physics steps once per scene.render() call, *before* rendering — by
    // the time onAfterRenderObservable fires for this same frame, that step
    // has already consumed the position write above as the teleport target,
    // so it's safe to flip prestep back off for every frame after this one.
    scene.onAfterRenderObservable.addOnce(() => { body.disablePreStep = true; });
    grounded = true;
    crossFadeTo(anims.idle);
  }

  return { root: anchor, update, respawn, body: aggregate.body, get grounded() { return grounded; } };
}
