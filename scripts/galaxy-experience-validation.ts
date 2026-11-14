import assert from "node:assert/strict";
import { GALAXY_MODELS } from "../src/stars/galaxy-models";
import { galaxyEntryRoute } from "../src/stars/galaxy-entry-route";
import { galaxyStructure } from "../src/stars/galaxy-structure";
import { makeGalaxyInteriorStars } from "../src/stars/galaxy-interior-stars";
import { galaxyDestinations } from "../src/stars/GalaxyDestinationGrid";
import {
  surveyScenePosition,
  COSMIC_BENCHMARKS,
} from "../src/lib/astronomy/cosmic-web/survey-catalogs";
import { useStore } from "../src/stars/store";
import {
  tickSim,
  motionTimeSeconds,
  motionDeltaSeconds,
  setSimPaused,
  getSimulationJd,
  NORMAL_TIME_RATE,
} from "../src/stars/sim-clock";
const names = new Set(),
  families = new Set();
for (const m of GALAXY_MODELS) {
  assert(!names.has(m.name));
  names.add(m.name);
  families.add(m.morphology);
  assert(m.diskRadius > 0 && m.bulgeRadius > 0);
  const map = makeGalaxyInteriorStars(m, 4096);
  assert.equal(map.getAttribute("position").count, 4096);
  const positions = map.getAttribute("position").array;
  assert(positions.every(Number.isFinite));
  assert(
    positions.some((v, i) => i % 3 === 1 && Math.abs(v) > 0.001),
    m.name + " must have depth",
  );
  map.dispose();
  const route = galaxyEntryRoute(m),
    end = route.points.at(-1)!;
  assert(route.points.flat().every(Number.isFinite));
  if (m.morphology === "ring")
    assert(
      Math.abs(Math.hypot(end[0], end[2]) - galaxyStructure(m).ringRadius) < 0.001,
      m.name + " entry must finish among ring stars",
    );
  const d = galaxyDestinations(m.name);
  assert.equal(new Set(d.map((o) => o.id)).size, d.length);
  if (m.system) assert(d.some((o) => o.id === m.system!.star.name));
}
assert(galaxyDestinations("Milky Way").length > 100);
assert(galaxyDestinations("Andromeda (M31)").length > 1);
const center = surveyScenePosition(266.4051, -28.936175, 1),
  pole = surveyScenePosition(192.85948, 27.12825, 1);
assert(Math.abs(center[0] + 1) < 1e-5 && Math.abs(center[1]) < 1e-5);
assert(Math.abs(pole[1] - 1) < 1e-5);
const saved = useStore.getState().systemSpeed;
setSimPaused(false);
useStore.getState().setSystemSpeed(1);
const a = motionTimeSeconds();
tickSim(0.1);
assert(Math.abs(motionTimeSeconds() - a - 0.1) < 1e-9);
const jd = getSimulationJd();
useStore.getState().setSystemSpeed(1e-6);
const before = motionTimeSeconds();
assert.equal(before, motionTimeSeconds());
tickSim(0.1);
assert(motionTimeSeconds() - before < 1e-6);
assert(getSimulationJd() >= jd);
setSimPaused(true);
const paused = motionTimeSeconds();
tickSim(0.1);
assert.equal(motionTimeSeconds(), paused);
setSimPaused(false);
useStore.getState().setSystemSpeed(saved);
// Objects outside the Solar System run at real time; a rate set for one object changes only it,
// continuously, and leaves the Solar System's clock alone.
{
  const solar = motionTimeSeconds(),
    m51 = motionTimeSeconds("M51"),
    m42 = motionTimeSeconds("m42");
  tickSim(0.1);
  assert(Math.abs(motionTimeSeconds("m42") - m42 - 0.1 * NORMAL_TIME_RATE) < 1e-12);
  assert(Math.abs(motionTimeSeconds() - solar - 0.1 * saved) < 1e-9);
  const m51Now = motionTimeSeconds("M51");
  assert(Math.abs(m51Now - m51 - 0.1 * NORMAL_TIME_RATE) < 1e-12);
  useStore.getState().setObjectTimeRate("M51", 1);
  const m51Before = motionTimeSeconds("M51");
  assert.equal(m51Before, m51Now, "setting a rate must not jump the object's time");
  tickSim(0.1);
  assert(Math.abs(motionTimeSeconds("M51") - m51Before - 0.1) < 1e-9);
  assert(Math.abs(motionDeltaSeconds("M51") - 0.1) < 1e-9);
  assert(motionTimeSeconds("m42") - m42 < 1e-5, "other objects keep real time");
  useStore.setState({ objectTimeRates: {} });
}
assert.equal(useStore.getState().exposure, 0.1);
assert.equal(useStore.getState().sceneBrightness, 1);
useStore.getState().setExposure(NaN);
assert.equal(useStore.getState().exposure, 0.1);
useStore.getState().setSceneBrightness(0);
assert.equal(useStore.getState().sceneBrightness, 0.05);
useStore.getState().setSceneBrightness(1);
console.log(
  `Validated ${names.size} unique galaxies, ${families.size} morphological families, ${COSMIC_BENCHMARKS.length} large-scale landmarks, destination grids, coordinates, continuous time and default optics.`,
);
