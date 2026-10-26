import assert from "node:assert/strict";
import * as THREE from "three";
import {
  solarGalacticPosition as position,
  SOLAR_GALACTIC as model,
  KM_S_TO_LY_MYR as convert,
  ECLIPTIC_POLE,
  ECLIPTIC_TO_SCENE,
} from "../src/stars/solar-galactic-motion";
import { useStore } from "../src/stars/store";
import {
  getGalacticTimeYears,
  setGalacticTimeScale,
  setSimulationDate,
  setSimPaused,
  setTimeMultiplier,
  stepSimulationDays,
  tickSim,
  getSimulationJd,
} from "../src/stars/sim-clock";
const p = new THREE.Vector3();
assert(position(0, p).length() < 1e-9);
const before = position(-100, new THREE.Vector3()),
  after = position(100, new THREE.Vector3());
const velocity = after.sub(before).divideScalar((200 / 1e6) * convert);
assert(Math.abs(velocity.x + model.uKmS) < 0.001);
assert(Math.abs(velocity.y - model.wKmS) < 0.001);
assert(Math.abs(velocity.z - model.vKmS) < 0.001);
const angle = THREE.MathUtils.radToDeg(Math.acos(ECLIPTIC_POLE.y));
assert(Math.abs(angle - 60.19) < 0.03);
const north = new THREE.Vector3(0, 1, 0).applyMatrix4(ECLIPTIC_TO_SCENE);
assert(north.distanceTo(ECLIPTIC_POLE) < 1e-10);
const vc = model.circularKmS * convert,
  center = new THREE.Vector3(-model.radiusLy, 0, 0);
let initialEnergy = 0,
  initialL = 0,
  minR = Infinity,
  maxR = 0,
  minY = Infinity,
  maxY = -Infinity;
for (let years = -499e6; years < 499e6; years += 1e6) {
  const point = position(years, new THREE.Vector3());
  const vel = position(years + 10, new THREE.Vector3())
    .sub(position(years - 10, new THREE.Vector3()))
    .divideScalar(20 / 1e6);
  const r = Math.hypot(point.x - center.x, point.z);
  const energy = (vel.x ** 2 + vel.z ** 2) / 2 + vc ** 2 * Math.log(r);
  const l = (point.x - center.x) * vel.z - point.z * vel.x;
  if (!initialEnergy) {
    initialEnergy = energy;
    initialL = l;
  }
  assert(Math.abs((energy - initialEnergy) / initialEnergy) < 2e-6);
  assert(Math.abs((l - initialL) / initialL) < 2e-6);
  minR = Math.min(minR, r);
  maxR = Math.max(maxR, r);
  minY = Math.min(minY, point.y);
  maxY = Math.max(maxY, point.y);
  assert(point.toArray().every(Number.isFinite));
}
assert(maxR - minR > 1000, "Radial excursions emerge from the potential");
assert(minY < 0 && maxY > 0, "Vertical oscillation crosses initial height");
for (const boundary of [-100e6, 0, 100e6]) {
  const a = position(boundary - 0.1, new THREE.Vector3());
  const b = position(boundary, new THREE.Vector3());
  const c = position(boundary + 0.1, new THREE.Vector3());
  assert(a.distanceTo(b) < 0.001 && b.distanceTo(c) < 0.001);
  assert(b.clone().sub(a).distanceTo(c.sub(b)) < 1e-7);
}
assert(position(1e20, p).equals(position(5e8, new THREE.Vector3())));
useStore.setState({ systemSpeed: 25, outerOrbitSpeed: 1 });
setSimulationDate("2000-01-01T12:00:00Z");
setSimPaused(false);
setTimeMultiplier(1);
setGalacticTimeScale(1);
tickSim(0.1);
assert(Math.abs(getGalacticTimeYears() - (getSimulationJd() - 2451545) / 365.25) < 1e-9);
const old = getGalacticTimeYears(),
  jd = getSimulationJd();
setGalacticTimeScale(1e8);
assert.equal(getGalacticTimeYears(), old, "Changing rate keeps phase");
tickSim(0.1);
assert(Math.abs((getGalacticTimeYears() - old) / (0.1 / 31.5) - 1e8) < 1);
assert(getSimulationJd() - jd < 2, "Galactic acceleration does not accelerate planets");
setSimPaused(true);
const paused = getGalacticTimeYears();
tickSim(0.1);
assert.equal(getGalacticTimeYears(), paused);
setSimPaused(false);
setTimeMultiplier(-1);
tickSim(0.1);
assert(getGalacticTimeYears() < paused);
setSimulationDate("2000-01-01T12:00:00Z");
assert.equal(getGalacticTimeYears(), 0);
stepSimulationDays(1);
assert.equal(getGalacticTimeYears(), 1 / 365.25);
console.log(
  "PASS: initial velocity, Galactic rotation, 60.19° plane, radial/vertical motion, conserved orbit, continuous interpolation, physical/accelerated time, pause, reverse, date reset and bounds",
  { angle, minR, maxR, minY, maxY },
);
