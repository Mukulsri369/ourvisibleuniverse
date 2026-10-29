import assert from "node:assert/strict";
import * as THREE from "three";
import { useStore } from "../src/stars/store";
import {
  useExploration,
  requireGalaxy,
  mayVisit,
  galaxyContentsLoaded,
} from "../src/stars/exploration-scope";
import { OBJECT_HOSTS, objectHost, MILKY_WAY, ANDROMEDA } from "../src/stars/object-hosts";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import { EXPLORER_GALAXIES, explorerGalaxy } from "../src/stars/exploration-galaxies";
import { galaxyEntries, searchExplorer, outsideEntries } from "../src/stars/exploration-catalog";
import { navigateExplorationTarget } from "../src/stars/exploration-navigation";
import { useGalaxyJourney } from "../src/stars/galaxy-journey";
import { GalaxyFlight } from "../src/stars/GalaxyFlight";
Object.defineProperty(globalThis, "document", { value: { hidden: false }, configurable: true });
assert.equal(useStore.getState().visitGalaxy?.name, MILKY_WAY);
assert.equal(useExploration.getState().phase, "outside");
assert.equal(new Set(EXPLORER_GALAXIES.map((g) => g.name)).size, EXPLORER_GALAXIES.length);
for (const item of OBSERVED_OBJECTS) {
  assert(Object.hasOwn(OBJECT_HOSTS, item.id), "Unreviewed membership: " + item.id);
  const host = objectHost(item.id);
  if (host) assert(explorerGalaxy(host), "Missing host " + host);
}
for (const galaxy of EXPLORER_GALAXIES) {
  const entries = galaxyEntries(galaxy.name);
  assert(entries.length > 0, galaxy.name + " has destinations");
  assert(entries.every((d) => d.host === galaxy.name));
}
assert.equal(objectHost("tarantula"), "Large Magellanic Cloud");
assert.equal(objectHost("r136a1"), "Large Magellanic Cloud");
assert.equal(objectHost("hlx1"), "ESO 243-49");
assert.equal(objectHost("gw170817"), "NGC 4993");
assert.equal(objectHost("gw150914"), null);
assert(!galaxyEntries(MILKY_WAY).some((d) => d.id === "tarantula"));
assert(galaxyEntries("Large Magellanic Cloud").some((d) => d.id === "tarantula"));
assert(galaxyEntries(ANDROMEDA).some((d) => d.name.includes("PA-99-N2")));
assert.equal(searchExplorer("solar system", ANDROMEDA).length, 0);
const solar = searchExplorer("solar system", null).find((d) => d.kind === "solar")!;
assert(solar && solar.host === MILKY_WAY);
assert(outsideEntries().some((d) => d.id === "gw150914"));
assert(outsideEntries().some((d) => d.kind === "space" && d.name.includes("Virgo")));
for (const d of outsideEntries())
  if (d.position) assert([...d.position, d.distance!].every(Number.isFinite));
useStore.getState().setVisitPlanet("Earth");
assert.equal(useStore.getState().visitPlanet, null);
assert.equal(useExploration.getState().pending?.host, MILKY_WAY);
useExploration.setState({ pending: null });
function enter(name: string, queued = false) {
  const g = explorerGalaxy(name)!;
  useStore.getState().setVisitGalaxy(g);
  useGalaxyJourney.getState().enter(g);
  assert.equal(useGalaxyJourney.getState().duration, 9);
  useGalaxyJourney.setState({ duration: 1 });
  assert(galaxyContentsLoaded(name));
  assert(!mayVisit(name));
  const scene = new THREE.Scene(),
    volume = new THREE.Object3D();
  volume.name = "galaxy-radiance:" + name;
  volume.position.set(g.x, g.y, g.z);
  volume.scale.setScalar(g.size / 2);
  scene.add(volume);
  scene.updateMatrixWorld(true);
  const camera = new THREE.PerspectiveCamera(42);
  camera.position.set(g.x + g.size, g.y + g.size, g.z + g.size);
  camera.lookAt(volume.position);
  const flight = new GalaxyFlight();
  flight.update(camera, scene, 0);
  for (let n = 0; n < 62; n++) flight.update(camera, scene, 1 / 60);
  assert.equal(useGalaxyJourney.getState().mode, "inside");
  assert(mayVisit(name));
  assert.equal(useStore.getState().cameraFree, false, "Galaxy entry must not enable free look");
  return { flight, camera, scene };
}
let session = enter(ANDROMEDA);
useStore.getState().setVisitPlanet("Earth");
assert.equal(useStore.getState().visitPlanet, null);
assert.equal(useExploration.getState().pending?.host, MILKY_WAY);
useStore.getState().setVisitGalaxy(explorerGalaxy(MILKY_WAY)!);
assert.equal(useExploration.getState().galaxy, ANDROMEDA);
useGalaxyJourney.getState().exit();
assert(!galaxyContentsLoaded(ANDROMEDA));
for (let n = 0; n < 160; n++) session.flight.update(session.camera, session.scene, 1 / 60);
assert.equal(useExploration.getState().phase, "outside");
useExploration.setState({ pending: solar });
session = enter(MILKY_WAY, true);
assert.equal(useExploration.getState().queued?.kind, "solar");
navigateExplorationTarget(useExploration.getState().queued!);
useExploration.setState({ queued: null });
assert.equal(useStore.getState().visitGalaxy, null);
assert((useStore.getState().flyTo?.distance ?? 0) > 1);
useStore.getState().setVisitPlanet("Earth");
assert.equal(useStore.getState().visitPlanet, "Earth");
useStore.getState().setSelectedObject("tarantula");
assert.equal(useExploration.getState().pending?.host, "Large Magellanic Cloud");
assert.equal(useStore.getState().selectedObjectId, null);
useGalaxyJourney.getState().exit();
for (let n = 0; n < 160; n++) session.flight.update(session.camera, session.scene, 1 / 60);
assert(!galaxyContentsLoaded(MILKY_WAY));
useExploration.setState({ pending: null });
navigateExplorationTarget(outsideEntries().find((d) => d.id === "gw150914")!);
assert.equal(useStore.getState().selectedObjectId, "gw150914");
assert.equal(useExploration.getState().phase, "outside");
console.log(
  "PASS: complete object-host coverage, scoped search, explicit exit/entry, queued destination, 9s entry, unload flags, and host-unknown navigation",
);

assert(searchExplorer("SolarSystem", null).some((d) => d.kind === "solar"));
assert.equal(searchExplorer("M1", null)[0].id, "m1");
const survey = {
  name: "Survey regression galaxy",
  x: 1e8,
  y: 2e7,
  z: 0,
  size: 100000,
  distance: 1e8,
  type: "Elliptical",
};
assert(galaxyEntries(survey.name, survey).length >= 2);
navigateExplorationTarget({
  kind: "galaxy",
  id: survey.name,
  name: survey.name,
  host: survey.name,
  galaxy: survey,
});
assert.equal(useStore.getState().visitGalaxy?.name, survey.name);
