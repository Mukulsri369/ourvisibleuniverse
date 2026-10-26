import { galaxyAppearance } from "../src/stars/galaxy-appearance";
import { pickSurveyGalaxy } from "../src/stars/survey-galaxy-picking";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  GALAXY_MODELS,
  galaxyCenter,
  galaxyQuat,
  systemPresentationScale,
  systemWorldPosition,
} from "../src/stars/galaxy-models";
import { MILKY_WAY_APPEARANCE, ANDROMEDA_APPEARANCE } from "../src/stars/GalaxyRadiance";
import { makeGalaxyInteriorStars } from "../src/stars/galaxy-interior-stars";
import { GalaxyFlight } from "../src/stars/GalaxyFlight";
import { useGalaxyJourney, galaxyOverviewFloor } from "../src/stars/galaxy-journey";
import { useStore } from "../src/stars/store";
Object.defineProperty(globalThis, "document", { value: { hidden: false }, configurable: true });
const sample = [
  MILKY_WAY_APPEARANCE,
  ANDROMEDA_APPEARANCE,
  galaxyAppearance({
    name: "Unresolved survey regression",
    x: -1e8,
    y: 2e7,
    z: 3e7,
    size: 70000,
    distance: 1.1e8,
    type: "Unresolved spiral galaxy",
  }),
  ...new Map(GALAXY_MODELS.map((m) => [m.morphology, m])).values(),
];
for (const model of sample) {
  const g = makeGalaxyInteriorStars(model);
  assert.equal(g.attributes.position.count, 100000);
  for (const attribute of Object.values(g.attributes))
    for (const value of attribute.array) assert.ok(Number.isFinite(value));
  g.dispose();
  const scene = new THREE.Scene(),
    volume = new THREE.Object3D(),
    center =
      model.name === "Milky Way" ? new THREE.Vector3(-model.distance, 0, 0) : galaxyCenter(model);
  volume.name = "galaxy-radiance:" + model.name;
  volume.position.copy(center);
  volume.scale.setScalar(model.diskRadius);
  volume.quaternion.copy(galaxyQuat(model.inclination, model.posAngle));
  scene.add(volume);
  scene.updateMatrixWorld(true);
  const camera = new THREE.PerspectiveCamera(42);
  camera.position.copy(center).add(new THREE.Vector3(2, 1, 3).multiplyScalar(model.diskRadius));
  camera.lookAt(center);
  const initial = camera.position.clone(),
    q = camera.quaternion.clone();
  const visit = {
    name: model.name,
    x: center.x,
    y: center.y,
    z: center.z,
    size: model.diskRadius * 2,
    distance: model.distance,
    type: model.type,
    view: "overview" as const,
  };
  useStore.getState().setVisitGalaxy(visit);
  assert.equal(useStore.getState().visitGalaxy?.focus, undefined);
  assert(galaxyOverviewFloor(visit) > model.diskRadius, "Overview cannot be zoomed into the core");
  useGalaxyJourney.getState().enter(visit);
  useGalaxyJourney.setState({ duration: 1 });
  const flight = new GalaxyFlight();
  flight.update(camera, scene, 0);
  assert(
    camera.position.distanceTo(initial) < Math.max(1e-6, initial.length() * Number.EPSILON * 8),
  );
  assert(camera.quaternion.angleTo(q) < 1e-7);
  for (let n = 0; n < 62; n++) flight.update(camera, scene, 1 / 60);
  assert.equal(useGalaxyJourney.getState().mode, "inside");
  assert.equal(useStore.getState().cameraFree, true);
  const local = volume.worldToLocal(camera.position.clone());
  assert(
    local.length() > 0.4 && local.length() < 1,
    "Passage finishes in the outer population, not at the core",
  );
  useGalaxyJourney.getState().exit();
  for (let n = 0; n < 250; n++) flight.update(camera, scene, 1 / 60);
  assert.equal(useGalaxyJourney.getState().mode, "idle");
  assert(
    camera.position.distanceTo(initial) < Math.max(1e-6, initial.length() * Number.EPSILON * 8),
  );
  assert(camera.quaternion.angleTo(q) < 1e-7);
}
for (const m of GALAXY_MODELS.filter((m) => m.system))
  for (const planet of m.system!.planets) {
    const scale = systemPresentationScale(m),
      center = systemWorldPosition(m),
      radius = planet.size * scale;
    for (let i = 0; i < 100; i++) {
      const offset = new THREE.Vector3(Math.sin(i * 0.1), 0.2, Math.cos(i * 0.1))
        .normalize()
        .multiplyScalar(radius);
      assert(
        center.clone().add(offset).sub(center).distanceTo(offset) / radius < 0.001,
        m.name + " hosted world precision",
      );
    }
  }
console.log(
  "PASS: all galaxy morphologies, 100k finite stars, explicit entry, exterior core guard, continuous entry/return, free-look handoff and distant hosted-world precision",
);

const camera = new THREE.PerspectiveCamera(60, 1, 1, 1e12);
camera.position.set(0, 0, 1e6);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 100000, 0, 0], 3));
geometry.setAttribute("seed", new THREE.Float32BufferAttribute([0.5, 0.2], 1));
const object = new THREE.Points(geometry),
  raycaster = new THREE.Raycaster(),
  hits: THREE.Intersection[] = [];
raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
pickSurveyGalaxy(object, raycaster, { width: 1000, height: 1000 }, hits);
assert.equal(hits[0]?.index, 0);
object.visible = false;
hits.length = 0;
pickSurveyGalaxy(object, raycaster, { width: 1000, height: 1000 }, hits);
assert.equal(hits.length, 0);
geometry.dispose();
console.log(
  "PASS: unresolved survey appearance and click picking, including invisible-field rejection",
);
