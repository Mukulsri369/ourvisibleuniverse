import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, OortCloud, MilkyWay } from "./SceneObjects";
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
          {/* Galactic backdrop: Milky Way sits at its real galactocentric
              offset (~26,000 ly) and rotates around Sgr A*. */}
          <MilkyWay />
          {/* Solar System drifts along the Sun's galactic orbital tangent.
              Combined with each planet's Kepler orbit, that turns the planets'
              world-space paths into true helices — the real motion of our
              system through the Milky Way. */}
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

      <TopLeftControls />
      <TourStopIndicator />
      <ZoomSlider />
      <TourCaption />
      <ScaleIndicator />
      <MusicToggle />
      <Branding />
      <InfoPanel />
      <PlanetNavigator />
      <StarNavigator />
      <LoadingScreen done={loaded} />
    </div>
  );
}

