import { useExploration } from "./exploration-scope";
import { FreeLookControls } from "./FreeLookControls";
import { ObjectAudioRuntime, ObjectAudioControl } from "./ObjectAudio";
import { useGalaxyJourney } from "./galaxy-journey";
import { GalaxyJourneyControls } from "./GalaxyJourneyControls";
import { NebulaJourneyControls } from "./NebulaJourneyControls";
import { BlackHoleJourneyControls } from "./BlackHoleJourneyControls";
import { tickSim } from "./sim-clock";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
import { StarField } from "./StarField";
import { Sun, OrientationDisc } from "./SceneObjects";
import { Universe } from "./Universe";
import { Andromeda } from "./Andromeda";
import { DetailedGalaxies } from "./GalaxyDetail";
import { Planets, SolarSystem, MotionTrails, PLANETS } from "./Planets";
import { StarLabels } from "./StarLabels";
import { CameraRig } from "./CameraRig";
import { ExoSystem } from "./ExoSystem";
import {
  InfoPanel,
  TopLeftControls,
  ZoomSlider,
  ScaleIndicator,
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
  const mwLoaded = useExploration(
    (s) => s.galaxy === "Milky Way" && (s.phase === "entering" || s.phase === "inside"),
  );
  const initialGalaxy = useRef(useStore.getState().visitGalaxy);
  const initialCamera = useRef<[number, number, number]>(
    initialGalaxy.current
      ? [
          initialGalaxy.current.x,
          initialGalaxy.current.y + initialGalaxy.current.size * 1.5,
          initialGalaxy.current.z + initialGalaxy.current.size,
        ]
      : [4, 2, 6],
  );
  useEffect(() => {
    if (!mwLoaded && typeof window !== "undefined") {
      const reg = window.__planetPositions;
      reg?.delete("Sun");
      for (const p of PLANETS) {
        reg?.delete(p.name);
        for (const m of p.moons ?? []) reg?.delete(p.name + ":" + m.name);
      }
    }
  }, [mwLoaded]);
  const uiHidden = useStore((s) => s.uiHidden);
  const galaxyJourneyActive = useGalaxyJourney((s) => s.mode !== "idle");
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
        camera={{ fov: 40, near: 1e-10, far: 1e11, position: initialCamera.current }}
        // Cap the render resolution: at 1M+ particles the fill cost of a
        // 2x device-pixel-ratio buffer is the single biggest frame cost.
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{ antialias: false, logarithmicDepthBuffer: true, powerPreference: "high-performance" }}
      >
        <SceneClock />
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          <Universe />
          <Andromeda />
          <DetailedGalaxies />
          <ObservedObjects />
          {mwLoaded && (
            <group name="galaxy-content:Milky Way">
              <ExoSystem />
              {subsystems.planets && (
                <>
                  <SolarSystem>
                    <Sun />
                    <Planets />
                  </SolarSystem>
                  <MotionTrails />
                </>
              )}
              <OrientationDisc />
              <StarField />
              <StarLabels />
            </group>
          )}
          <CameraRig />
          <ObjectAudioRuntime />
          <OpticsPostProcessing />
        </Suspense>
      </Canvas>

      {/* Performance profiler HUD is not shown on screen */}

      {/* Hide toggle stays visible so users can bring the UI back */}
      <SiteMap />
      <UIHideToggle />
      <ObjectAudioControl />
      <BlackHoleJourneyControls />
      <NebulaJourneyControls />
      <GalaxyJourneyControls />

      <FreeLookControls
        onOpenSettings={() => {
          useExploration.setState({ mapOpen: false });
          useStore.setState({ uiHidden: false, navigationSettingsOpen: true });
        }}
      />
      {!uiHidden && (
        <>
          <TopLeftControls />
          <ZoomSlider />
          <ScaleIndicator />
          <Branding />
          <InfoPanel />
          <ExoPlanetPanel />
          <SolarBodyPanel />
          {!focusedObject && !galaxyJourneyActive && <GalaxyInfoPanel />}
          <ObservedObjectInfoPanel />
          <OpticsControlModal />
          <RenderingBenchmarkModal />
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
