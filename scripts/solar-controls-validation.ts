import { jplEphemerisManager } from "../src/lib/astronomy/jpl/ephemeris-cache";
import assert from "node:assert/strict";
import * as THREE from "three";
import { useStore } from "../src/stars/store";
import { SOLAR_ORBIT_NAMES } from "../src/stars/planet-orbit-controls";
import {
  getPlanetSimulationJd,
  getSimulationJd,
  setSimulationDate,
  setSimPaused,
  setTimeMultiplier,
  tickSim,
  getGalacticTimeYears,
} from "../src/stars/sim-clock";
import { orbitalTrailSampleCount, writeTrailPosition } from "../src/stars/trail-sampling";
import { solarGalacticPosition, SOLAR_GALACTIC } from "../src/stars/solar-galactic-motion";
import { MILKY_WAY_APPEARANCE } from "../src/stars/GalaxyRadiance";
import { galaxyStructure } from "../src/stars/galaxy-structure";
import {
  computePlanetStateVector,
  computeMoonRelativeState,
} from "../src/lib/astronomy/jpl/horizons-ephemeris";
const expectedDefaults: Record<string, number> = {
  Mercury: 1,
  Venus: 1,
  Earth: 1,
  Mars: 1,
  Jupiter: 3.63,
  Saturn: 4.9,
  Uranus: 10.96,
  Neptune: 12.88,
  Pluto: 15.49,
};
assert.deepEqual(useStore.getState().planetOrbitSpeeds, expectedDefaults);
useStore.getState().setPlanetOrbitSpeed("Jupiter", 100);
useStore.getState().resetPlanetOrbitSpeeds();
assert.deepEqual(useStore.getState().planetOrbitSpeeds, expectedDefaults);
setSimPaused(false);
setTimeMultiplier(1);
useStore.setState({ systemSpeed: 25, galacticTravelSpeed: 1 });
for (const name of SOLAR_ORBIT_NAMES) {
  useStore.getState().resetPlanetOrbitSpeeds();
  setSimulationDate(2451545);
  const before = Object.fromEntries(SOLAR_ORBIT_NAMES.map((n) => [n, getPlanetSimulationJd(n)])),
    base = getSimulationJd(),
    galactic = getGalacticTimeYears();
  useStore.getState().setPlanetOrbitSpeed(name, 10);
  for (const n of SOLAR_ORBIT_NAMES)
    assert.equal(getPlanetSimulationJd(n), before[n], "Rate changes must not teleport " + n);
  tickSim(0.1);
  const step = getSimulationJd() - base;
  for (const n of SOLAR_ORBIT_NAMES)
    assert(
      Math.abs(
        (getPlanetSimulationJd(n) - before[n]) / step - (n === name ? 10 : expectedDefaults[n]),
      ) < 1e-5,
      n,
    );
  assert(
    Math.abs((getGalacticTimeYears() - galactic) * 365.25 - step) < 1e-8,
    "Planet speed cannot alter Galactic time",
  );
  useStore.getState().setPlanetOrbitSpeed(name, 0);
  const stopped = getPlanetSimulationJd(name);
  for (let i = 0; i < 20; i++) tickSim(0.1);
  assert.equal(getPlanetSimulationJd(name), stopped, "Individual pause must be exact");
  useStore.getState().setPlanetOrbitSpeed(name, 1);
  assert.equal(getPlanetSimulationJd(name), stopped, "Resume must preserve phase");
  assert(
    Object.values(computePlanetStateVector(name, getPlanetSimulationJd(name)))
      .filter((v) => typeof v === "number")
      .every(Number.isFinite),
  );
}
useStore.getState().resetPlanetOrbitSpeeds();
setSimulationDate(2451545);
const moon = computeMoonRelativeState("Earth", "Moon", getSimulationJd());
useStore.getState().setPlanetOrbitSpeed("Earth", 1000);
assert.deepEqual(
  computeMoonRelativeState("Earth", "Moon", getSimulationJd()),
  moon,
  "Moon relative orbit is independent of its parent's speed",
);
const epoch = getPlanetSimulationJd("Earth");
useStore.getState().setPlanetOrbitSpeed("Earth", NaN);
assert.equal(useStore.getState().planetOrbitSpeeds.Earth, 1);
assert.equal(getPlanetSimulationJd("Earth"), epoch);
setSimulationDate(2452000);
for (const name of SOLAR_ORBIT_NAMES) assert.equal(getPlanetSimulationJd(name), 2452000);
setSimPaused(true);
const jd = getPlanetSimulationJd("Earth");
tickSim(0.1);
assert.equal(getPlanetSimulationJd("Earth"), jd);
setSimPaused(false);
const p0 = solarGalacticPosition(0, new THREE.Vector3()),
  p1 = solarGalacticPosition(1000, new THREE.Vector3());
const starAngle = -galaxyStructure(MILKY_WAY_APPEARANCE).rotationRate;
assert(
  (p0.x + SOLAR_GALACTIC.radiusLy) * (p1.z - p0.z) - p0.z * (p1.x - p0.x) > 0 && starAngle > 0,
  "Sun and reconstructed Milky Way disk must be prograde in the same scene convention",
);
assert.equal(orbitalTrailSampleCount(0, 30), 1);
assert(orbitalTrailSampleCount(3, 30) > 1);
assert.equal(orbitalTrailSampleCount(1e9, 1), 128);
for (const base of [26673, 53346, 1000000]) {
  const high = new Float32Array(3),
    low = new Float32Array(3),
    camera = base + 0.00017,
    point = base + 0.00023;
  writeTrailPosition(high, low, 0, point, 0, 0);
  const cHigh = Math.fround(camera),
    cLow = Math.fround(camera - cHigh);
  const relative = Math.fround(Math.fround(high[0] - cHigh) + Math.fround(low[0] - cLow));
  assert(
    Math.abs(relative - (point - camera)) < 1e-8,
    "Moon-scale detail must survive galactic coordinate rounding",
  );
}
console.log(
  "PASS: nine independent phase-continuous clocks, exact pause/resume, unchanged moon and Galactic clocks, prograde Milky Way and high/low precision trails",
);

const a = computePlanetStateVector("Earth", 2451545),
  b = computePlanetStateVector("Mars", 2451600);
const distance = jplEphemerisManager.computeDistance("Earth", "Mars", 2451545, 2451600);
assert(
  Math.abs(distance.distanceAu - Math.hypot(a.xAu - b.xAu, a.yAu - b.yAu, a.zAu - b.zAu)) < 1e-12,
  "Distance overlays must follow independent displayed phases",
);
