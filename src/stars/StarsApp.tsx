import { GalaxyJourneyControls } from "./GalaxyJourneyControls";
import { NebulaJourneyControls } from "./NebulaJourneyControls";
import { BlackHoleJourneyControls } from "./BlackHoleJourneyControls";
import { tickSim } from "./sim-clock";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc, MilkyWay } from "./SceneObjects";
import { Universe } from "./Universe";
import { Andromeda } from "./Andromeda";
import { DetailedGalaxies } from "./GalaxyDetail";
import { Planets, SolarSystem, MotionTrails } from "./Planets";
import { StarLabels } from "./StarLabels";
import { CameraRig } from "./CameraRig";
import { ExoSystem } from "./ExoSystem";
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
import { ExoPlanetPanel } from "./ExoPlanetPanel";
import { SolarBodyPanel } from "./SolarBodyPanel";
import { ObservedObjects } from "./ObservedObjects";
import { ObservedObjectInfoPanel } from "./ObservedObjectInfoPanel";
import { OpticsPostProcessing } from "./OpticsPostProcessing";
import { OpticsControlModal } from "./OpticsControlModal";
import { RenderingBenchmarkModal } from "./RenderingBenchmarkModal";
import { ObservationEvidenceModal } from "@/components/observation/ObservationEvidenceModal";
import { CosmicJourneyNavigator } from "./CosmicJourneyNavigator";
import { UniversalSearchModal } from "./UniversalSearchModal";
import { UniversalObjectModal } from "./UniversalObjectModal";
import { CameraBookmarksModal } from "./CameraBookmarksModal";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { MajorDiscoveriesModal } from "./MajorDiscoveriesModal";

import { useStore } from "./store";

function SceneClock() {
  useFrame((_, dt) => tickSim(dt), -3);
  return null;
}

export function StarsApp() {
  const [loaded, setLoaded] = useState(false);
  const uiHidden = useStore((s) => s.uiHidden);
  const focusedObject = useStore(
    (s) => !!s.visitPlanet || !!s.selectedObjectId || !!s.selectedStar,
  );
  const subsystems = useStore((s) => s.subsystems);
  const observationModalOpen = useStore((s) => s.observationModalOpen);
  const observationTargetId = useStore((s) => s.observationTargetId);
  const setObservationModalOpen = useStore((s) => s.setObservationModalOpen);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white">
      <Canvas
        style={{ touchAction: "none" }}
        camera={{ fov: 40, near: 1e-10, far: 1e11, position: [4, 2, 6] }}
        // Cap the render resolution: at 1M+ particles the fill cost of a
        // 2x device-pixel-ratio buffer is the single biggest frame cost.
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, logarithmicDepthBuffer: true, powerPreference: "high-performance" }}
      >
        <SceneClock />
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <MilkyWay />
          <Universe />
          <Andromeda />
          <DetailedGalaxies />
          <ObservedObjects />
          <ExoSystem />
          {subsystems.planets && (
            <SolarSystem>
              <Sun />
              <Planets />
            </SolarSystem>
          )}
          {subsystems.planets && <MotionTrails />}
          <OrientationDisc />
          <StarField />
          <StarLabels />
          <CameraRig />
          <OpticsPostProcessing />
        </Suspense>
      </Canvas>

      {/* Performance profiler HUD is not shown on screen */}

      {/* Hide toggle stays visible so users can bring the UI back */}
      <UIHideToggle />
      <BlackHoleJourneyControls />
      <NebulaJourneyControls />
      <GalaxyJourneyControls />

      {!uiHidden && (
        <>
          <SiteMap />
          <TopLeftControls />
          <ZoomSlider />
          <ScaleIndicator />
          <CosmicJourneyNavigator />
          <MusicToggle />
          <Branding />
          <InfoPanel />
          <ExoPlanetPanel />
          <SolarBodyPanel />
          {!focusedObject && <GalaxyInfoPanel />}
          <ObservedObjectInfoPanel />
          <OpticsControlModal />
          <RenderingBenchmarkModal />
          <UniversalSearchModal />
          <UniversalObjectModal />
          <CameraBookmarksModal />
          <KeyboardShortcutsModal />
          <MajorDiscoveriesModal />
          <ObservationEvidenceModal
            open={observationModalOpen}
            onClose={() => setObservationModalOpen(false)}
            initialTargetId={observationTargetId}
          />
        </>
      )}
      <LoadingScreen done={loaded} />
    </div>
  );
}
