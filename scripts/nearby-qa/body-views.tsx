import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../../src/styles.css";
import { SolarSystem, Planets } from "../../src/stars/Planets";
import { Sun } from "../../src/stars/SceneObjects";
import { ExoSystem } from "../../src/stars/ExoSystem";
import { CameraRig } from "../../src/stars/CameraRig";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
import { NAMED_STARS } from "../../src/stars/data";
import { useStore } from "../../src/stars/store";
import { useExploration } from "../../src/stars/exploration-scope";
import { tickSim } from "../../src/stars/sim-clock";

/**
 * Isolated planet / moon / exoplanet QA page using the production components.
 *
 *   ?body=Earth:Moon            visit a Solar System body through the production CameraRig
 *   ?star=<host>&planet=<name>  visit an exoplanet; add &rig=0 for a fixed look-dev pose
 *   &phase=<deg>                rig=0 only: angle between star and camera seen from the planet
 *   &d=<radii>                  rig=0 only: camera distance in planet radii (default 3.2)
 *   &optics=0                   disable the production exposure/tone-mapping/bloom pipeline
 *
 * window.__bodyViews.jitter(seconds) samples the visited body's on-screen centre every
 * frame (after the camera has moved) and reports frame-to-frame movement in pixels.
 */
const params = new URLSearchParams(location.search);
const OPTICS = params.get("optics") !== "0";
const RIG = params.get("rig") !== "0";
const starName = params.get("star");
const star = starName ? NAMED_STARS.find((s) => s.name === starName) : undefined;
if (starName && !star) throw Error("Unknown star " + starName);
const target = star ? params.get("planet")! : (params.get("body") ?? "Earth:Moon");

useExploration.setState({ phase: "inside", galaxy: "Milky Way", mapOpen: false });
useStore.setState({
  visitGalaxy: null,
  selectedStar: null,
  visitPlanet: target,
  exoVisit: star ? { star, planet: target } : null,
  uiHidden: true,
});

function Clock() {
  useFrame((_, dt) => tickSim(dt), -3);
  return null;
}

const toStar = new THREE.Vector3();
/** Fixed look-dev pose: runs after bodies publish (-2/-1) and replaces the CameraRig. */
function PoseRig() {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    const p = window.__planetPositions?.get(target);
    const r = window.__exoSizes?.get(target);
    if (!p || !r || !star) return;
    toStar.set(star.x, star.y, star.z).sub(p).normalize();
    const phase = THREE.MathUtils.degToRad(Number(params.get("phase") ?? 40));
    const dir = toStar.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), phase);
    dir.y += 0.25;
    camera.position.copy(p).addScaledVector(dir.normalize(), r * (Number(params.get("d")) || 3.2));
    camera.lookAt(p);
    camera.updateMatrixWorld();
  }, -0.25);
  return null;
}

const ndc = new THREE.Vector3();
const visited = () => useStore.getState().visitPlanet ?? target;
function Probe() {
  const { camera, gl, size } = useThree();
  const samples: number[][] = [];
  let recording = false;
  // Runs last (priority 0, mounted last): the camera has already been placed this frame.
  useFrame(() => {
    if (!recording) return;
    const p = window.__planetPositions?.get(visited());
    if (!p) return;
    camera.updateMatrixWorld();
    ndc.copy(p).project(camera);
    samples.push([(ndc.x * size.width) / 2, (ndc.y * size.height) / 2]);
  });
  (window as unknown as Record<string, unknown>).__bodyViews = {
    target,
    status: () => ({
      visited: visited(),
      position: window.__planetPositions?.get(visited())?.toArray(),
      radius: window.__exoSizes?.get(visited()),
      camera: camera.position.toArray(),
      calls: gl.info.render.calls,
      textures: gl.info.memory.textures,
    }),
    jitter: (seconds: number) =>
      new Promise((resolve) => {
        samples.length = 0;
        recording = true;
        setTimeout(() => {
          recording = false;
          const steps = samples
            .slice(1)
            .map((s, i) => Math.hypot(s[0] - samples[i][0], s[1] - samples[i][1]));
          const offsets = samples.map((s) => Math.hypot(s[0], s[1]));
          const sorted = [...steps].sort((a, b) => a - b);
          const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
          resolve({
            frames: samples.length,
            meanStepPx: +mean(steps).toFixed(3),
            p95StepPx: +(sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(3),
            maxStepPx: +(sorted[sorted.length - 1] ?? 0).toFixed(3),
            meanOffsetPx: +mean(offsets).toFixed(3),
            maxOffsetPx: +Math.max(0, ...offsets).toFixed(3),
          });
        }, seconds * 1000);
      }),
  };
  return null;
}

const container = document.getElementById("root")! as HTMLElement & {
  bodyQaRoot?: ReturnType<typeof createRoot>;
};
const root = (container.bodyQaRoot ??= createRoot(container));
root.render(
  <Canvas
    style={{ height: "100dvh", width: "100vw", background: "#000" }}
    camera={{ fov: 40, near: 1e-10, far: 1e11, position: [4, 2, 6] }}
    dpr={[1, 1.5]}
    gl={{ antialias: false, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
  >
    <Clock />
    {/* Production mounts CameraRig at start-up and the Milky Way contents later, so the rig subscribes first. */}
    {RIG && <CameraRig />}
    {star ? (
      <ExoSystem />
    ) : (
      <SolarSystem>
        <Sun />
        <Planets />
      </SolarSystem>
    )}
    {!RIG && <PoseRig />}
    {OPTICS && <OpticsPostProcessing />}
    <Probe />
  </Canvas>,
);
