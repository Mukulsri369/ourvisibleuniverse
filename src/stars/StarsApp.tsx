import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, OortCloud, MilkyWay } from "./SceneObjects";
import { Universe } from "./Universe";
import { Nebulae } from "./Nebulae";
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
  GalaxyInfoPanel,
  UIVisibilityToggle,
} from "./UI";

import { useStore } from "./store";

export function StarsApp() {
  const [loaded, setLoaded] = useState(false);
  const selected = useStore((s) => s.selectedStar);
  const selectedGalaxy = useStore((s) => s.selectedGalaxy);
  const setSelected = useStore((s) => s.setSelected);
  const setSelectedGalaxy = useStore((s) => s.setSelectedGalaxy);
  const uiHidden = useStore((s) => s.uiHidden);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white" onClick={() => {
      if (selected) setSelected(null);
      if (selectedGalaxy) setSelectedGalaxy(null);
    }}>
      <Canvas
        camera={{ fov: 40, near: 0.05, far: 1e11, position: [4, 2, 6] }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <MilkyWay />
          <Nebulae />
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

      <UIVisibilityToggle />
      {!uiHidden && (
        <>
          <TopLeftControls />
          <TourStopIndicator />
          <ZoomSlider />
          <TourCaption />
          <ScaleIndicator />
          <MusicToggle />
          <Branding />
          <InfoPanel />
          <GalaxyInfoPanel />
          <PlanetNavigator />
          <StarNavigator />
          <GalaxyNavigator />
        </>
      )}
      <LoadingScreen done={loaded} />
    </div>
  );
}
