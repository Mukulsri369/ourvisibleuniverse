import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, OortCloud, MilkyWay } from "./SceneObjects";
import { Universe } from "./Universe";
import { Planets, SolarSystem, MotionTrails } from "./Planets";
import { StarLabels, BinaryMarkers } from "./StarLabels";
import { CameraRig } from "./CameraRig";
import {
  InfoPanel,
  TopLeftControls,
  ZoomSlider,
  TourCaption,
  ScaleIndicator,
  MusicToggle,
  Branding,
  TourStopIndicator,
  LoadingScreen,
  PlanetNavigator,
  StarNavigator,
  GalaxyNavigator,
  UIHideToggle,
} from "./UI";

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
    <div className="fixed inset-0 bg-black text-white" onClick={() => { if (selected) setSelected(null); }}>
      <Canvas
        camera={{ fov: 40, near: 0.05, far: 1e11, position: [4, 2, 6] }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <MilkyWay />
          <Universe />
          <SolarSystem>
            <Sun />
            <Planets />
          </SolarSystem>
          <MotionTrails />
          <OrientationDisc />
          <OortCloud />
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
          <TopLeftControls />
          <TourStopIndicator />
          <ZoomSlider />
          <ScaleIndicator />
          <MusicToggle />
          <Branding />
          <InfoPanel />
          <PlanetNavigator />
          <StarNavigator />
          <GalaxyNavigator />
        </>
      )}
      {/* Tour caption remains even when panels are hidden — it's diegetic. */}
      <TourCaption />
      <LoadingScreen done={loaded} />
    </div>
  );
}
