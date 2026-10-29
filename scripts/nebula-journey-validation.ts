import assert from "node:assert/strict";
import * as THREE from "three";
const saved = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => saved.get(k) ?? null,
    setItem: (k: string, v: string) => saved.set(k, v),
    removeItem: (k: string) => saved.delete(k),
  },
  configurable: true,
});
Object.defineProperty(globalThis, "document", { value: { hidden: false }, configurable: true });
const { useStore } = await import("../src/stars/store");
const { NebulaFlight } = await import("../src/stars/NebulaFlight");
const { useNebulaJourney, nebulaMotion } = await import("../src/stars/nebula-journey");
const { NEBULA_ROUTES } = await import("../src/stars/nebula-journey-profiles");
const { NEBULA_SHAPES } = await import("../src/stars/nebula-structure");
const { useObjectView, objectView, DEFAULT_OBJECT_VIEW } =
  await import("../src/stars/object-view-settings");
assert.deepEqual(Object.keys(NEBULA_ROUTES).sort(), Object.keys(NEBULA_SHAPES).sort());
for (const id of Object.keys(NEBULA_ROUTES)) {
  useStore.setState({ selectedObjectId: id, uiHidden: false, cameraFree: false });
  const scene = new THREE.Scene(),
    volume = new THREE.Object3D();
  volume.name = "nebula-volume:" + id;
  volume.position.set(2e5, -3000, 5000);
  volume.scale.setScalar(3.7);
  volume.rotation.set(0.2, 0.5, -0.3);
  scene.add(volume);
  scene.updateMatrixWorld(true);
  const camera = new THREE.PerspectiveCamera(35);
  camera.position.set(2e5 + 8, -2998, 5012);
  camera.lookAt(volume.position);
  const start = camera.position.clone(),
    orientation = camera.quaternion.clone();
  const flight = new NebulaFlight();
  useNebulaJourney.getState().start(id);
  useNebulaJourney.setState({ duration: 2 });
  flight.update(camera, scene, 0);
  assert(camera.position.distanceTo(start) < 1e-8, "No positional cut at entry");
  assert(camera.quaternion.angleTo(orientation) < 1e-7, "No angular cut at entry");
  for (let i = 0; i < 60; i++) {
    flight.update(camera, scene, 1 / 30);
    assert(camera.position.toArray().every(Number.isFinite));
    assert(camera.quaternion.toArray().every(Number.isFinite));
  }
  flight.update(camera, scene, 0.01);
  assert.equal(useNebulaJourney.getState().mode, "inside");
  assert.equal(
    useStore.getState().cameraFree,
    false,
    "Passage completion must keep free look opt-in",
  );
  assert.equal(nebulaMotion.reveal, 1);
  const local = volume.worldToLocal(camera.position.clone());
  assert(local.distanceTo(new THREE.Vector3(...NEBULA_ROUTES[id].points.at(-1)!)) < 1e-7);
  useNebulaJourney.getState().back();
  for (let i = 0; i < 122; i++) flight.update(camera, scene, 1 / 30);
  assert.equal(useNebulaJourney.getState().mode, "idle");
  assert(camera.position.distanceTo(start) < 1e-8, "Return restores observer position");
  assert(camera.quaternion.angleTo(orientation) < 1e-7, "Return restores direction");
  assert.equal(camera.fov, 35);
}
useObjectView.getState().set("m42", { exposure: 2, dust: 0.2 });
assert.equal(objectView("m42").exposure, 2);
assert.deepEqual(objectView("m57"), DEFAULT_OBJECT_VIEW);
useObjectView.getState().set("m42", { exposure: 99, brightness: NaN });
assert.equal(objectView("m42").exposure, 3);
assert.equal(objectView("m42").brightness, 1);
useObjectView.getState().reset("m42");
assert.deepEqual(objectView("m42"), DEFAULT_OBJECT_VIEW);
const id = "m42",
  scene = new THREE.Scene(),
  volume = new THREE.Object3D(),
  camera = new THREE.PerspectiveCamera();
volume.name = "nebula-volume:" + id;
scene.add(volume);
camera.position.set(0, 0, 4);
useStore.setState({ selectedObjectId: id });
useNebulaJourney.getState().start(id);
const flight = new NebulaFlight();
flight.update(camera, scene, 0.1);
useNebulaJourney.getState().pause();
const pose = camera.position.clone();
for (let i = 0; i < 60; i++) flight.update(camera, scene, 1 / 60);
assert.equal(camera.position.distanceTo(pose), 0, "Pause holds position");
useStore.setState({ selectedObjectId: "m57" });
flight.update(camera, scene, 0.1);
assert.equal(useNebulaJourney.getState().mode, "idle", "Changing object cancels old flight");
console.log(
  "PASS: 21 transformed routes, continuous entry, exact return, free-look handoff, pause, cancellation, and isolated view preferences",
);
