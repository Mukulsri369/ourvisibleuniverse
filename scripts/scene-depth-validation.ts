import assert from "node:assert/strict";
import * as THREE from "three";
import { BlackHoleLensPass } from "../src/stars/BlackHoleLensPass";
import { OBJECT_BY_ID, objectPosition } from "../src/stars/observed-objects";
import { blackHoleModel } from "../src/stars/black-hole-model";
import { BLACK_HOLE_DESCENT_SECONDS, descentRadiusRs } from "../src/stars/black-hole-journey";
import { MILKY_WAY_CENTER_LY } from "../src/lib/astronomy/galactic-scene";
import { makeNebulaStars } from "../src/stars/NebulaStars";
import { NEBULA_SHAPES } from "../src/stars/nebula-structure";
import { NEBULA_STELLAR_PROFILES } from "../src/stars/nebula-stellar-profiles";
assert.deepEqual(
  objectPosition(OBJECT_BY_ID.get("sgr-a")!),
  MILKY_WAY_CENTER_LY,
  "The Galactic Centre must contain Sgr A*",
);
assert(
  descentRadiusRs(32, 26 / BLACK_HOLE_DESCENT_SECONDS) > 1.1,
  "The longer approach must not cross the horizon at the former endpoint",
);
assert(descentRadiusRs(32, 1) < 1);
for (const id of Object.keys(NEBULA_SHAPES)) {
  const profile = NEBULA_STELLAR_PROFILES[id];
  assert(profile, "Missing stellar profile " + id);
  const g = makeNebulaStars(id)!,
    again = makeNebulaStars(id)!;
  const p = g.getAttribute("position"),
    expected = profile.field + (profile.cluster?.count ?? 0) + profile.anchors.length;
  assert.equal(p.count, expected);
  assert.deepEqual(
    p.array,
    again.getAttribute("position").array,
    "Star placement changes during remount",
  );
  let minZ = Infinity,
    maxZ = -Infinity;
  for (let i = 0; i < p.count; i++) {
    assert(Number.isFinite(p.getX(i) + p.getY(i) + p.getZ(i)));
    minZ = Math.min(minZ, p.getZ(i));
    maxZ = Math.max(maxZ, p.getZ(i));
  }
  assert(maxZ - minZ > 1, "A stellar field collapsed into a flat layer");
  g.dispose();
  again.dispose();
}
assert.equal(makeNebulaStars("unresolved-quasar"), null);
const scene = new THREE.Scene(),
  pass = new BlackHoleLensPass(scene),
  camera = new THREE.PerspectiveCamera(40, 1.5, 1e-10, 1e11),
  item = OBJECT_BY_ID.get("m87star")!,
  model = blackHoleModel(item),
  center = new THREE.Vector3(...objectPosition(item));
pass.setSize(1152, 768);
camera.position.copy(center).add(new THREE.Vector3(0, 0, model.radiusLy * 32));
camera.lookAt(center);
for (const tier of ["scientific_high", "standard", "performance"]) {
  for (let i = 0; i < 120; i++) pass.update(camera, item, tier, 0.08);
  const target = Reflect.get(pass, "target") as THREE.WebGLRenderTarget;
  assert.deepEqual(
    [target.width, target.height],
    [1152, 768],
    "Interaction downsampled the optical image",
  );
}
const scissors: number[][] = [];
let scissorEnabled = false;
const renderer = {
  xr: { enabled: false },
  getRenderTarget: () => null,
  setRenderTarget: () => {},
  clear: () => {},
  render: () => {},
  getPixelRatio: () => 1.5,
  getScissorTest: () => scissorEnabled,
  setScissorTest: (v: boolean) => {
    scissorEnabled = v;
  },
  getScissor: (v: THREE.Vector4) => v.set(2, 3, 400, 300),
  setScissor: (...args: unknown[]) => {
    scissors.push(args[0] instanceof THREE.Vector4 ? args[0].toArray() : (args as number[]));
  },
};
const target = new THREE.WebGLRenderTarget(1152, 768);
pass.render(renderer as unknown as THREE.WebGLRenderer, target, target);
assert.deepEqual(
  scissors[0],
  [0, 0, 768, 512],
  "Physical render-target pixels must be converted before setScissor",
);
assert.deepEqual(scissors.at(-1), [2, 3, 400, 300]);
assert.equal(scissorEnabled, false);
pass.dispose();
target.dispose();
console.log(
  "PASS: Galactic Centre alignment, extended descent, 21 reproducible 3D stellar fields, native black-hole targets and fractional-DPR scissor restoration.",
);
