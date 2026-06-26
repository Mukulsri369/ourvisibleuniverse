import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, OortCloud, MilkyWay } from "./SceneObjects";
import { Planets } from "./Planets";
import { MotionTrails } from "./MotionTrails";
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
} from "./UI";

import { useStore } from "./store";

export function StarsApp() {
  const [loaded, setLoaded] = useState(false);
  const selected = useStore((s) => s.selectedStar);
  const setSelected = useStore((s) => s.setSelected);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white" onClick={() => { if (selected) setSelected(null); }}>
      <Canvas
        camera={{ fov: 40, near: 0.05, far: 250000, position: [4, 2, 6] }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          {/* Galactic backdrop: Sun is at origin, Milky Way sits at its real
              galactocentric offset (~26,000 ly) and rotates around Sgr A*. */}
          <MilkyWay />
          {/* Local stellar neighborhood — co-moving with the Sun, so it does
              NOT rotate relative to us on human timescales. */}
          <Sun />
          <Planets />
          <OrientationDisc />
          <OortCloud />
          <StarField />
          <BinaryMarkers />
          <StarLabels />
          <CameraRig />
        </Suspense>
      </Canvas>

      <TopLeftControls />
      <TourStopIndicator />
      <ZoomSlider />
      <TourCaption />
      <ScaleIndicator />
      <MusicToggle />
      <Branding />
      <InfoPanel />
      <PlanetNavigator />
      <LoadingScreen done={loaded} />
    </div>
  );
}

