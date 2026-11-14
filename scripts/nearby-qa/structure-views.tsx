import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../../src/styles.css";
import { Universe } from "../../src/stars/Universe";
import { LargeScaleStructure3D } from "../../src/stars/LargeScaleStructure3D";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
import { useStore } from "../../src/stars/store";
import { useExploration } from "../../src/stars/exploration-scope";
import { gToXYZ } from "../../src/stars/galaxy-models";
import { COSMIC_BENCHMARKS } from "../../src/lib/astronomy/cosmic-web/survey-catalogs";

/**
 * Isolated cosmic-structure QA page: renders the production large-scale-structure
 * components from fixed, reproducible poses so before/after captures compare like with like.
 *
 *   ?s=<benchmark id>&v=<earth|side|top|oblique>&d=<camera distance in structure diameters>
 *   default d=1.5 matches the production fly-to distance (1.5 × viewDiameterMly ?? diameterMly)
 *   &universe=1 mounts the whole atlas (production context); default mounts only the structures
 *   &web=0 hides the background survey points (production shows them)
 *   &optics=0 disables the production exposure/tone-mapping/bloom pipeline
 *   &dpr=1..2 sets the device pixel ratio (production uses up to 1.5)
 *   &mounted=0 keeps the pose but selects no structure (performance control)
 *   &tier=scientific_high|standard|performance sets the rendering quality tier
 */
const params = new URLSearchParams(location.search);
const OPTICS = params.get("optics") !== "0";
const UNIVERSE = params.get("universe") === "1";
const view = {
  id: params.get("s") ?? "coma_cluster",
  direction: params.get("v") ?? "earth",
  distance: Number(params.get("d")) || 1.5,
};

function benchmarkFor(id: string) {
  const b = COSMIC_BENCHMARKS.find((x) => x.id === id);
  if (!b)
    throw Error(
      "Unknown structure " + id + "; known: " + COSMIC_BENCHMARKS.map((x) => x.id).join(", "),
    );
  return b;
}

function select(id: string, mounted = true) {
  benchmarkFor(id);
  view.id = id;
  // Set the selection without the production fly-to (this page has no camera rig).
  // mounted=false keeps the same pose with no structure selected (performance control).
  useStore.setState({ selectedCosmicBenchmarkId: mounted ? id : null });
}

/** rAF frame intervals over a window: mean, percentiles and long frames (needs a visible tab). */
function sample(seconds: number) {
  return new Promise((resolve) => {
    const intervals: number[] = [];
    let last = performance.now();
    const end = last + seconds * 1000;
    const tick = (now: number) => {
      intervals.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        const sorted = [...intervals].sort((a, b) => a - b);
        const at = (q: number) =>
          sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        resolve({
          frames: intervals.length,
          meanMs: +mean.toFixed(2),
          fps: +(1000 / mean).toFixed(1),
          p50Ms: +at(0.5).toFixed(2),
          p95Ms: +at(0.95).toFixed(2),
          p99Ms: +at(0.99).toFixed(2),
          over33: intervals.filter((v) => v > 33.4).length,
        });
      }
    };
    requestAnimationFrame(tick);
  });
}

function pose(direction: string) {
  const b = benchmarkFor(view.id);
  const centre = gToXYZ(b.l, b.b, b.distanceGlyPlanck * 1e9);
  const toSun = centre.clone().negate().normalize();
  const north = new THREE.Vector3(0, 1, 0);
  const side = toSun.clone().cross(north).normalize();
  let dir: THREE.Vector3;
  if (direction === "side") dir = side;
  else if (direction === "top") dir = north.clone();
  else if (direction === "oblique")
    dir = toSun.clone().add(side).add(north.clone().multiplyScalar(0.6));
  else dir = toSun;
  dir.normalize();
  let up = north.clone().addScaledVector(dir, -north.dot(dir));
  if (up.lengthSq() < 1e-4) up = toSun.clone().addScaledVector(dir, -toSun.dot(dir));
  return { centre, dir, up: up.normalize(), diameter: (b.viewDiameterMly ?? b.diameterMly) * 1e6 };
}

function ViewRig() {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    const { centre, dir, up, diameter } = pose(view.direction);
    camera.up.copy(up);
    camera.position.copy(centre).addScaledVector(dir, view.distance * diameter);
    camera.lookAt(centre);
    camera.updateMatrixWorld();
  }, -10);
  return null;
}

function Probe() {
  const { scene, gl } = useThree();
  (window as unknown as Record<string, unknown>).__structureViews = {
    select,
    sample,
    ids: COSMIC_BENCHMARKS.map((b) => b.id),
    setView(direction: string, distance?: number) {
      view.direction = direction;
      if (distance) view.distance = distance;
    },
    status() {
      const object = scene.getObjectByName("structure:" + view.id);
      const ext = gl.getContext().getExtension("WEBGL_debug_renderer_info");
      return {
        id: view.id,
        direction: view.direction,
        distance: view.distance,
        mounted: Boolean(object),
        // Data-driven renderers set userData.ready once their catalogue has loaded.
        ready:
          useStore.getState().selectedCosmicBenchmarkId === null ||
          (Boolean(object) && object!.userData.ready !== false),
        renderer: ext ? gl.getContext().getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown",
        calls: gl.info.render.calls,
        points: gl.info.render.points,
        textures: gl.info.memory.textures,
        programs: gl.info.programs?.length ?? 0,
      };
    },
  };
  return null;
}

useStore.setState({
  uiHidden: true,
  ...(params.get("tier") ? { renderingQualityTier: params.get("tier") as "standard" } : {}),
  showCosmicWebDensity: params.get("web") !== "0",
  cosmicWebMode: "observational",
  subsystems: { ...useStore.getState().subsystems, cosmicWeb: true },
});
useExploration.setState({ phase: "outside", galaxy: null, mapOpen: false });
select(view.id, params.get("mounted") !== "0");

const container = document.getElementById("root")! as HTMLElement & {
  structureViewsRoot?: ReturnType<typeof createRoot>;
};
const root = (container.structureViewsRoot ??= createRoot(container));
root.render(
  <main style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "#000" }}>
    <Canvas
      dpr={Math.max(1, Math.min(2, Number(params.get("dpr")) || 1))}
      gl={{ antialias: false, logarithmicDepthBuffer: true }}
      camera={{ fov: 40, near: 1e-10, far: 1e11 }}
    >
      <Probe />
      <ViewRig />
      {UNIVERSE ? <Universe /> : <LargeScaleStructure3D />}
      {OPTICS && <OpticsPostProcessing />}
    </Canvas>
  </main>,
);
