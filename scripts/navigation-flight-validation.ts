import assert from "node:assert/strict";
import { useStore } from "../src/stars/store";
import { freeLookSpeed } from "../src/stars/free-look-input";
import {
  getPlanetSimulationJd,
  getSimulationJd,
  setSimulationDate,
  setSimPaused,
  setTimeMultiplier,
  tickSim,
} from "../src/stars/sim-clock";

useStore.setState({ systemSpeed: 1, outerOrbitSpeed: 1, zoomSpeed: 50 });
setSimulationDate("2026-10-26T00:00:00Z");
setTimeMultiplier(1);
setSimPaused(false);
const names = ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
for (const name of names) assert.equal(getPlanetSimulationJd(name), getSimulationJd());
let earth = getPlanetSimulationJd("Earth"),
  outer = getPlanetSimulationJd("Jupiter");
tickSim(0.1);
assert(
  Math.abs(
    (getPlanetSimulationJd("Jupiter") - outer) / (getPlanetSimulationJd("Earth") - earth) - 1,
  ) < 1e-6,
);
outer = getPlanetSimulationJd("Jupiter");
useStore.getState().setOuterOrbitSpeed(1000);
assert.equal(getPlanetSimulationJd("Jupiter"), outer, "Changing rate must not jump orbital phase");
earth = getPlanetSimulationJd("Earth");
tickSim(0.1);
const earthStep = getPlanetSimulationJd("Earth") - earth;
for (const name of names)
  assert(Math.abs((getPlanetSimulationJd(name) - outer) / earthStep - 1000) < 0.001);
const fastPosition = getPlanetSimulationJd("Pluto");
useStore.getState().setOuterOrbitSpeed(1);
assert.equal(
  getPlanetSimulationJd("Pluto"),
  fastPosition,
  "Restoring rate keeps accumulated phase",
);
setSimPaused(true);
tickSim(0.1);
assert.equal(getPlanetSimulationJd("Pluto"), fastPosition, "Pause freezes extra orbital time");
setSimulationDate("2026-10-26T00:00:00Z");
assert.equal(
  getPlanetSimulationJd("Pluto"),
  getSimulationJd(),
  "An explicit date resets illustrative orbit offsets",
);
for (const radius of [1e-9, 0.05, 10, 1e6]) {
  assert.equal(freeLookSpeed(radius, 50, 1), radius * 1.2);
  assert.equal(freeLookSpeed(radius, 50, 2), freeLookSpeed(radius, 50, 1) * 2);
}
useStore.getState().setVisitPlanet("Mercury");
useStore.getState().toggleCameraFree();
assert.equal(useStore.getState().visitPlanet, "Mercury", "Free look retains the return target");
assert.equal(useStore.getState().cameraFree, true);
useStore.getState().setVisitPlanet("Venus");
assert.equal(useStore.getState().cameraFree, false, "An explicit visit exits free flight");
useStore.getState().toggleCameraFree();
useStore.getState().setSelectedObject("sgr-a");
assert.equal(
  useStore.getState().cameraFree,
  false,
  "A selected catalogue target exits free flight",
);
useStore.getState().setFreeLookSpeed(0);
assert.equal(useStore.getState().freeLookSpeed, 0.05);
useStore.getState().setOuterOrbitSpeed(5000);
assert.equal(useStore.getState().outerOrbitSpeed, 2000);
console.log(
  "PASS: continuous outer orbit rates, default motion, pause/date reset, free-flight speed and selection lifecycle",
);
