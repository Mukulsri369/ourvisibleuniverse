import * as THREE from "three";
import { BlackHoleLensPass } from "../src/stars/BlackHoleLensPass";
import { objectPosition } from "../src/stars/observed-objects";
import assert from "node:assert/strict";
import { OBSERVED_OBJECTS, objectVisitDistance } from "../src/stars/observed-objects";
import {
  blackHoleModel,
  isBlackHoleTarget,
  kerrIscoRs,
  CRITICAL_IMPACT_RS,
} from "../src/stars/black-hole-model";
import {
  descentRadiusRs,
  useBlackHoleJourney,
  descentMotion,
} from "../src/stars/black-hole-journey";
const holes = OBSERVED_OBJECTS.filter(isBlackHoleTarget);
assert.equal(holes.length, 13, "Review new black-hole and quasar catalogue entries");
for (const item of holes) {
  const model = blackHoleModel(item);
  assert.ok(model.radiusLy > 0 && Number.isFinite(model.radiusLy));
  assert.ok(model.radiusLy >= model.physicalRsLy);
  assert.equal(model.dormant, !item.compactPhysics?.hasAccretionDisk);
  assert.ok(objectVisitDistance(item) >= model.radiusLy * model.outerRs);
}
for (const id of ["gaiabh1", "gaiabh3"]) {
  const item = holes.find((h) => h.id === id)!;
  assert.equal(blackHoleModel(item).intensity, 0);
  assert.equal(item.compactPhysics?.hasRelativisticJet, false);
}
assert.ok(
  OBSERVED_OBJECTS.filter((o) => o.category === "Gravitational wave").every(
    (o) => !isBlackHoleTarget(o),
  ),
  "Localization regions are not resolved black-hole images",
);
assert.ok(Math.abs(kerrIscoRs(0) - 3) < 1e-12);
assert.ok(Math.abs(kerrIscoRs(0.9) - 1.160441520880944) < 1e-9);
assert.ok(Math.abs(CRITICAL_IMPACT_RS - 2.598076211353316) < 1e-12);
for (const start of [12, 32, 80]) {
  let previous = Infinity;
  for (let i = 0; i <= 200; i++) {
    const radius = descentRadiusRs(start, i / 200);
    assert.ok(Number.isFinite(radius) && radius <= previous);
    previous = radius;
  }
  assert.ok(descentRadiusRs(start, 1) < 1);
}
useBlackHoleJourney.getState().begin("sgr-a");
assert.equal(useBlackHoleJourney.getState().mode, "falling");
useBlackHoleJourney.getState().pause();
assert.equal(useBlackHoleJourney.getState().mode, "paused");
useBlackHoleJourney.getState().resume();
assert.equal(useBlackHoleJourney.getState().mode, "falling");
useBlackHoleJourney.getState().returnToOrbit();
assert.equal(useBlackHoleJourney.getState().mode, "returning");
useBlackHoleJourney.getState().reset();
assert.equal(useBlackHoleJourney.getState().mode, "idle");
assert.equal(descentMotion.elapsed, 0);
console.log(
  "PASS: 13 black-hole/quasar cores, dormant emission, physical scales, ISCO references and descent lifecycle",
);

const pass = new BlackHoleLensPass(new THREE.Scene()),
  camera = new THREE.PerspectiveCamera(40, 1, 0.000000001, 1e11);
const target = holes.find((o) => o.id === "m87star")!,
  model = blackHoleModel(target),
  center = new THREE.Vector3(...objectPosition(target));
pass.setSize(1024, 768);
camera.position.copy(center).addScaledVector(new THREE.Vector3(0, 0, 1), model.radiusLy * 32);
pass.update(camera, target, "scientific_high", 1 / 60);
assert.equal(pass.enabled, true);
camera.position.copy(center).addScaledVector(new THREE.Vector3(0, 0, 1), model.radiusLy * 5000);
pass.update(camera, target, "scientific_high", 1 / 60);
assert.equal(pass.enabled, false, "Distant zoom disables optical work");
pass.update(camera, undefined, "scientific_high", 1 / 60);
assert.equal(pass.enabled, false);
pass.dispose();
console.log("PASS: distant/cleared targets disable the optical pass");
