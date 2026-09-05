import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, MilkyWay } from "./SceneObjects";
import { Universe } from "./Universe";
import { Andromeda } from "./Andromeda";
import { DetailedGalaxies } from "./GalaxyDetail";
import { Planets, SolarSystem, MotionTrails } from "./Planets";
import { StarLabels, BinaryMarkers } from "./StarLabels";
import { CameraRig } from "./CameraRig";
import {
  InfoPanel,
  TopLeftControls,
  ZoomSlider,
  ScaleIndicator,
  MusicToggle,
  Branding,
  LoadingScreen,
  UIHideToggle,
  SiteMap,
} from "./UI";
import { GalaxyInfoPanel } from "./GalaxyInfoPanel";
import { ObservedObjects } from "./ObservedObjects";
import { ObservedObjectInfoPanel } from "./ObservedObjectInfoPanel";

import { useStore } from "./store";

export function StarsApp() {
  const [loaded, setLoaded] = useState(false);
  const selected = useStore((s) => s.selectedStar);
  const setSelected = useStore((s) => s.setSelected);
  const uiHidden = useStore((s) => s.uiHidden);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black text-white"
      onClick={() => {
        if (selected) setSelected(null);
      }}
    >
      <Canvas
        camera={{ fov: 40, near: 1e-11, far: 1e11, position: [4, 2, 6] }}
        // Cap the render resolution: at 1M+ particles the fill cost of a
        // 2x device-pixel-ratio buffer is the single biggest frame cost.
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, logarithmicDepthBuffer: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <MilkyWay />
          <Universe />
          <Andromeda />
          <DetailedGalaxies />
          <ObservedObjects />
          <SolarSystem>
            <Sun />
            <Planets />
          </SolarSystem>
          <MotionTrails />
          <OrientationDisc />
          <StarField />
          <BinaryMarkers />
          <StarLabels />
          <CameraRig />
        </Suspense>
      </Canvas>

      {/* Hide toggle stays visible so users can bring the UI back */}
      <UIHideToggle />

      {!uiHidden && (
        <>
          <SiteMap />
          <TopLeftControls />
          <ZoomSlider />
          <ScaleIndicator />
          <MusicToggle />
          <Branding />
          <InfoPanel />
          <GalaxyInfoPanel />
          <ObservedObjectInfoPanel />
        </>
      )}
      <LoadingScreen done={loaded} />
    </div>
  );
}
