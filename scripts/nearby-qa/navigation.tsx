import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useThree } from "@react-three/fiber";
import "../../src/styles.css";
import { Universe } from "../../src/stars/Universe";
import { DetailedGalaxies } from "../../src/stars/GalaxyDetail";
import { CameraRig } from "../../src/stars/CameraRig";
import { GalaxyExplorer } from "../../src/stars/GalaxyExplorer";
import { GalaxyInfoPanel } from "../../src/stars/GalaxyInfoPanel";
import { useStore } from "../../src/stars/store";
import { useExploration } from "../../src/stars/exploration-scope";
import { useGalaxyJourney } from "../../src/stars/galaxy-journey";
import { HOME_GALAXY } from "../../src/stars/exploration-galaxies";
import { MotionProbe, MotionControls } from "./motion-probe";
import { OpticsPostProcessing } from "../../src/stars/OpticsPostProcessing";
// `?optics=1` adds the production exposure, tone-mapping and bloom pipeline.
const OPTICS = new URLSearchParams(location.search).has("optics");
useStore.setState({
  visitGalaxy: HOME_GALAXY,
  uiHidden: false,
  showObservedGalaxies: true,
  subsystems: {
    ...useStore.getState().subsystems,
    cosmicWeb: false,
    milkyWay: true,
    detailedGalaxies: true,
  },
});
useExploration.setState({ phase: "outside", galaxy: null, mapOpen: true });
function StateProbe() {
  const { scene, camera, gl } = useThree();
  (window as any).__nearbyNavigation = {
    scene,
    camera,
    gl,
    useStore,
    useExploration,
    useGalaxyJourney,
  };
  return null;
}
const container = document.getElementById("root")! as HTMLElement & {
  nearbyQaRoot?: ReturnType<typeof createRoot>;
};
// Shared shader edits can refresh this QA entry. Reuse its root and WebGL canvas.
const root = (container.nearbyQaRoot ??= createRoot(container));
root.render(
  <main style={{ height: "100dvh", width: "100vw", overflow: "hidden", background: "#000" }}>
    <p className="pointer-events-none fixed bottom-2 left-4 z-50 text-xs text-neutral-400">
      Isolated local QA · actual explorer, camera, and catalogue components
    </p>
    <Canvas
      dpr={Math.max(1, Math.min(2, Number(new URLSearchParams(location.search).get("dpr")) || 1))}
      gl={{ antialias: false, logarithmicDepthBuffer: true }}
      camera={{ fov: 42, near: 0.001, far: 1e12 }}
    >
      <StateProbe />
      <Universe />
      <DetailedGalaxies />
      <CameraRig />
      <MotionProbe />
      {OPTICS && <OpticsPostProcessing />}
    </Canvas>
    <GalaxyExplorer />
    <GalaxyInfoPanel />
    <MotionControls />
  </main>,
);
