import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import "../../src/styles.css";
import { NebulaVolume } from "../../src/stars/NebulaVolume";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
import { OBJECT_BY_ID } from "../../src/stars/observed-objects";
import { OBSERVED_VISUAL_PROFILES } from "../../src/stars/observed-object-visuals";
import { NEBULA_ROUTES } from "../../src/stars/nebula-journey-profiles";
import { useNebulaJourney, nebulaMotion } from "../../src/stars/nebula-journey";

/**
 * Isolated nebula look-dev page: one production NebulaVolume at fixed poses (nebula-local units, box ±1.6).
 *   ?n=<object id>&v=front|close|inside   inside = last journey waypoint looking at the route focus
 *   &eye=x,y,z&look=x,y,z                 explicit local pose; &optics=0 disables the HDR pipeline
 */
const params = new URLSearchParams(location.search);
const id = params.get("n") ?? "m42";
const item = OBJECT_BY_ID.get(id);
if (!item) throw Error("Unknown nebula " + id);
const route = NEBULA_ROUTES[id];
const vec = (s: string | null) => (s ? new THREE.Vector3(...s.split(",").map(Number)) : null);
const v = params.get("v") ?? "front";
const eye =
  vec(params.get("eye")) ??
  (v === "inside" && route
    ? new THREE.Vector3(...route.points.at(-1)!)
    : new THREE.Vector3(0.25, 0.15, v === "close" ? 1.45 : 4.4));
const look =
  vec(params.get("look")) ??
  (v === "inside" && route ? new THREE.Vector3(...route.focus) : new THREE.Vector3());

// Inside poses reproduce the journey's end state (dust thinned, stars brightened).
if (v === "inside") {
  useNebulaJourney.setState({ id, mode: "inside" });
  nebulaMotion.reveal = 1;
}

function PoseRig() {
  const { camera, scene } = useThree();
  useFrame(() => {
    const volume = scene.getObjectByName("nebula-volume:" + id);
    if (!volume) return;
    volume.updateWorldMatrix(true, false);
    camera.position.copy(eye).applyMatrix4(volume.matrixWorld);
    camera.lookAt(look.clone().applyMatrix4(volume.matrixWorld));
    (camera as THREE.PerspectiveCamera).fov = v === "inside" ? 48 : 40;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, -10);
  return null;
}

const container = document.getElementById("root")! as HTMLElement & {
  nebulaQaRoot?: ReturnType<typeof createRoot>;
};
const root = (container.nebulaQaRoot ??= createRoot(container));
root.render(
  <Canvas
    style={{ height: "100dvh", width: "100vw", background: "#000" }}
    camera={{ fov: 40, near: 1e-6, far: 1e6 }}
    dpr={[1, 1.5]}
    gl={{ antialias: false, logarithmicDepthBuffer: true, preserveDrawingBuffer: true }}
  >
    <PoseRig />
    <NebulaVolume
      item={item}
      profile={OBSERVED_VISUAL_PROFILES[id] ?? { seed: 1, tilt: [0, 0, 0] }}
      scale={1}
    />
    {params.get("optics") !== "0" && <OpticsPostProcessing />}
  </Canvas>,
);
