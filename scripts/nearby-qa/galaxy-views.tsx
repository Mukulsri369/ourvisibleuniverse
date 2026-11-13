import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../../src/styles.css";
import { Universe } from "../../src/stars/Universe";
import { DetailedGalaxies } from "../../src/stars/GalaxyDetail";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
import { useStore } from "../../src/stars/store";
import { useExploration } from "../../src/stars/exploration-scope";
import { NEARBY_GALAXIES } from "../../src/stars/galaxy-catalog";
import {
  GALAXY_MODELS,
  galaxyCenter,
  galaxyOrientation,
  type GalaxyModel,
} from "../../src/stars/galaxy-models";
import { ANDROMEDA_APPEARANCE, MILKY_WAY_APPEARANCE } from "../../src/stars/GalaxyRadiance";
import { earthDirectionLocal } from "../../src/stars/galaxy-observed-projection";
import { galaxyDetailAlpha } from "../../src/stars/galaxy-detail-state";
import { galaxyMotion, useGalaxyJourney } from "../../src/stars/galaxy-journey";

/**
 * Isolated multi-angle galaxy QA page. It renders the production galaxy components
 * (DetailedGalaxies and, optionally, the Universe atlas) from fixed, reproducible
 * poses in each galaxy's own frame, so before/after screenshots compare like with like.
 *
 *   ?g=<model key>&v=<front|back|edge|oblique|top|bottom|three-quarter>&d=<disk radii>
 *   &optics=0 disables the production exposure/tone-mapping/bloom pipeline
 *   &universe=1 adds the surrounding atlas (stars, catalogue galaxies)
 *   &eye=x,y,z&look=x,y,z places the camera and its target in the galaxy's local frame
 *     (disk radii, disk normal = +Y), e.g. the Sun in the Milky Way: eye=0.533,0,0
 *   &inside=1 shows the entered state (interior exposure and star population) without the flight;
 *     &reveal=0..1 sets how far the interior is revealed (0 at the start of the flight)
 *   &sel=none selects no galaxy, so g is drawn by its unselected far-field preview (universe=1)
 */
const params = new URLSearchParams(location.search);
const OPTICS = params.get("optics") !== "0";
const UNIVERSE = params.get("universe") === "1";

const ALL_MODELS: GalaxyModel[] = [MILKY_WAY_APPEARANCE, ANDROMEDA_APPEARANCE, ...GALAXY_MODELS];
const vector = (name: string) =>
  params.get(name)?.split(",").map(Number) as [number, number, number] | undefined;
const view = {
  key: params.get("g") ?? "m51",
  direction: params.get("v") ?? "front",
  distance: Number(params.get("d")) || 2.7,
  eye: vector("eye"),
  look: vector("look"),
};

function modelFor(key: string) {
  const model = ALL_MODELS.find((m) => m.key === key || m.name === key);
  if (!model) throw Error("Unknown galaxy model " + key);
  return model;
}

function select(key: string) {
  const model = modelFor(key);
  const record = NEARBY_GALAXIES.find((g) => g.name === model.name);
  const centre = galaxyCenter(model);
  useStore.getState().setVisitGalaxy({
    name: model.name,
    x: centre.x,
    y: centre.y,
    z: centre.z,
    size: record?.size ?? model.diskRadius * 2,
    distance: model.distance,
    type: record?.type ?? model.type,
    view: "overview",
  });
  view.key = model.key;
}

/** Unit view direction and up vector in the galaxy's local frame (disk normal = +Y). */
function localPose(model: GalaxyModel, direction: string) {
  const normal = new THREE.Vector3(0, 1, 0);
  const earth = earthDirectionLocal(model);
  const inPlane = earth.clone().setY(0);
  if (inPlane.lengthSq() < 1e-6) inPlane.set(1, 0, 0);
  inPlane.normalize();
  // A side line of sight at right angles to Earth's, so it shows what the photo cannot.
  const side = inPlane.clone().cross(normal).normalize();
  let dir: THREE.Vector3;
  switch (direction) {
    case "back":
      dir = earth.clone().negate();
      break;
    case "edge":
      dir = side.clone().multiplyScalar(Math.cos(0.035)).addScaledVector(normal, Math.sin(0.035));
      break;
    case "oblique":
      dir = side.clone().multiplyScalar(Math.cos(0.5)).addScaledVector(normal, Math.sin(0.5));
      break;
    case "three-quarter":
      dir = side.clone().multiplyScalar(Math.cos(0.95)).addScaledVector(normal, -Math.sin(0.95));
      break;
    case "top":
      dir = normal.clone();
      break;
    case "bottom":
      dir = normal.clone().negate();
      break;
    default:
      dir = earth.clone();
  }
  dir.normalize();
  let up = normal.clone().addScaledVector(dir, -normal.dot(dir));
  if (up.lengthSq() < 1e-4) up = inPlane.clone().addScaledVector(dir, -inPlane.dot(dir));
  return { dir, up: up.normalize() };
}

function ViewRig() {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    const model = modelFor(view.key);
    const q = galaxyOrientation(model);
    const centre = galaxyCenter(model);
    if (view.eye) {
      const place = (v: [number, number, number]) =>
        new THREE.Vector3(...v).multiplyScalar(model.diskRadius).applyQuaternion(q).add(centre);
      camera.up.set(0, 1, 0).applyQuaternion(q);
      camera.position.copy(place(view.eye));
      camera.lookAt(place(view.look ?? [0, 0, 0]));
      camera.updateMatrixWorld();
      return;
    }
    const { dir, up } = localPose(model, view.direction);
    camera.up.copy(up.applyQuaternion(q));
    camera.position
      .copy(centre)
      .addScaledVector(dir.applyQuaternion(q), view.distance * model.diskRadius);
    camera.lookAt(centre);
    camera.updateMatrixWorld();
  }, -10);
  return null;
}

function Probe() {
  const { scene, gl } = useThree();
  (window as unknown as Record<string, unknown>).__galaxyViewsScene = scene;
  (window as unknown as Record<string, unknown>).__galaxyViews = {
    select,
    setView(direction: string, distance?: number) {
      view.direction = direction;
      view.eye = undefined;
      if (distance) view.distance = distance;
    },
    setEye(eye: [number, number, number], look?: [number, number, number]) {
      view.eye = eye;
      view.look = look;
    },
    status() {
      const model = modelFor(view.key);
      const volume = scene.getObjectByName("galaxy-radiance:" + model.name) as
        THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | undefined;
      return {
        key: model.key,
        name: model.name,
        direction: view.direction,
        distance: view.distance,
        mounted: Boolean(volume),
        cacheFade: volume?.material.uniforms.uCacheFade?.value ?? 0,
        detailAlpha: galaxyDetailAlpha.get(model.key) ?? 0,
        renderer: (() => {
          const ext = gl.getContext().getExtension("WEBGL_debug_renderer_info");
          return ext ? gl.getContext().getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown";
        })(),
        textures: gl.info.memory.textures,
        programs: gl.info.programs?.length ?? 0,
      };
    },
  };
  return null;
}

useStore.setState({
  uiHidden: true,
  showObservedGalaxies: UNIVERSE,
  subsystems: {
    ...useStore.getState().subsystems,
    cosmicWeb: false,
    milkyWay: UNIVERSE,
    detailedGalaxies: true,
  },
});
useExploration.setState({ phase: "outside", galaxy: null, mapOpen: false });
select(view.key);
if (params.get("sel") === "none") useStore.setState({ visitGalaxy: null });
if (params.get("inside") === "1") {
  useGalaxyJourney.setState({ galaxy: useStore.getState().visitGalaxy, mode: "inside" });
  galaxyMotion.progress = galaxyMotion.reveal = Number(params.get("reveal") ?? 1);
}

const container = document.getElementById("root")! as HTMLElement & {
  galaxyViewsRoot?: ReturnType<typeof createRoot>;
};
const root = (container.galaxyViewsRoot ??= createRoot(container));
root.render(
  <main style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "#000" }}>
    <Canvas
      dpr={Math.max(1, Math.min(2, Number(params.get("dpr")) || 1))}
      gl={{ antialias: false, logarithmicDepthBuffer: true }}
      camera={{ fov: 42, near: 0.001, far: 1e12 }}
    >
      <Probe />
      <ViewRig />
      {UNIVERSE && <Universe />}
      <DetailedGalaxies />
      {OPTICS && <OpticsPostProcessing />}
    </Canvas>
  </main>,
);
