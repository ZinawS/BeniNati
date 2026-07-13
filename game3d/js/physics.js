// Havok is Babylon's modern (WASM-based) physics engine — real rigid-body
// gravity, collision, and impact response, not Arcade Physics' simple AABB
// overlap tests. It initializes asynchronously (loads a .wasm binary), which
// is why main.js awaits this before building anything physical.
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin.js";
import HavokPhysics from "@babylonjs/havok";
import havokWasmAsset from "@babylonjs/havok/lib/esm/HavokPhysics.wasm";

// esbuild's `file` loader gives back a path relative to the *page* (e.g.
// "HavokPhysics.wasm"), not to this bundled module — resolving it against
// import.meta.url (which, once bundled, is this file's actual served URL)
// is what makes it find the .wasm sitting next to bundle.js instead of 404ing
// one directory up. Caught this with an actual headless-browser run, not by
// inspection — see docs/3D_PROTOTYPE.md's QA notes.
const havokWasmUrl = new URL(havokWasmAsset, import.meta.url).href;

export async function createHavokPlugin() {
  const havokInstance = await HavokPhysics({ locateFile: () => havokWasmUrl });
  return new HavokPlugin(true, havokInstance);
}
