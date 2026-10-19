/**
 * COSMOS Scientific 3D Scene Host & Cinematic Camera Rig
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 & Prompt 05 — Next-Generation Scientific 3D Rendering Engine
 *
 * Implements:
 * - Single dedicated React Three Fiber <Canvas> when Cinematic Mode is open
 * - WebGL support check & webglcontextlost / webglcontextrestored recovery
 * - Adaptive DPR & particle budget governed by CosmosCinematicQualityManager
 * - Quality-aware HDR Postprocessing (CinematicPostprocessingPipeline with high-threshold
 *   selective bloom and ACES Filmic tone mapping)
 * - Physically grounded low-ambient lighting & collimated solar terminators
 * - Three Upgraded Reference Scenes:
 *   1. Reference Scene A (Module 01): Cosmic Scale Hierarchy (Earth with continents, oceans,
 *      clouds, city lights & Rayleigh Kármán limb; airless cratered Moon; deterministic
 *      Milky Way barred-spiral disk; logarithmic scale coordination)
 *   2. Reference Scene B (Module 08): Newtonian & Keplerian Orbital Mechanics (G2V Star with
 *      convective granulation & limb darkening; orbiting planets with live day-night
 *      terminators; Keplerian ellipse & equal-area swept sectors; live velocity & gravity
 *      force vectors; gravitational potential well embedding grid)
 *   3. Reference Scene C (Module 14): Black Holes & Extreme Compact Objects (Schwarzschild/Kerr
 *      Event Horizon shadow, Photon Sphere, Doppler-beamed & gravitationally redshifted
 *      accretion disk, gravitational lensing halo, Blandford-Znajek jets, Flamm's paraboloid
 *      spacetime curvature funnel, and rotating Pulsar lighthouse beam)
 * - Plus Stellar Physics (with cue-driven interior cutaway), Nebula Volume, and Galactic Structure scenes
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type {
  CinematicCameraCommand,
  CinematicPlayerStateSnapshot,
} from "@/lib/cosmos/cinematic/CosmosCinematicPlayerState";
import {
  CINEMATIC_QUALITY_PROFILES,
  CosmosCinematicQualityManager,
  type CinematicQualityProfile,
} from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type { CinematicSceneDescriptor } from "@/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import type { RegisteredAnimationCue } from "@/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import { CosmosCinematicAssetManager } from "@/lib/cosmos/cinematic/assets";
import {
  AstronomicalScaleCoordinator,
  CinematicPostprocessingPipeline,
  CosmosScientificSceneLibrary,
  ScientificResourceManager,
} from "@/lib/cosmos/cinematic/rendering";
import {
  GalaxyParticleField,
  IrregularCelestialBodyRenderer,
  NebulaVolume,
  OrbitalTrajectoryRenderer,
  PulsarBeamRenderer,
  ScientificAnnotation,
  ScientificBlackHoleEffects,
  ScientificPlanetMaterial,
  ScientificSpacecraftRenderer,
  ScientificStarMaterial,
  ScientificTelescopeCutaway,
  ScientificVectorField,
  StarClusterRenderer,
  type VectorArrowDescriptor,
} from "./science";
import {
  Module01CinematicDirectorScene,
  Module05CinematicDirectorScene,
  Module06CinematicDirectorScene,
  Module07CinematicDirectorScene,
  Module08CinematicDirectorScene,
  Module13CinematicDirectorScene,
  Module14CinematicDirectorScene,
  Module15CinematicDirectorScene,
  Module16CinematicDirectorScene,
  Module17CinematicDirectorScene,
  Module18CinematicDirectorScene,
  Module19CinematicDirectorScene,
  Module20CinematicDirectorScene,
  Module21CinematicDirectorScene,
  Module22CinematicDirectorScene,
  Module23CinematicDirectorScene,
  Module24CinematicDirectorScene,
} from "./scenes";
import { CosmosProofOfConceptCatalog } from "@/lib/cosmos/cinematic/poc";
import { CosmosCinematicFallback } from "./CosmosCinematicFallback";

interface CosmosCinematicSceneHostProps {
  snapshot: CinematicPlayerStateSnapshot;
  scene: CinematicSceneDescriptor;
  activeCue: RegisteredAnimationCue | null;
  latestCameraCommand: CinematicCameraCommand | null;
  reducedMotion: boolean;
  onSelectObject: (objectId: string) => void;
  onEnableManualCamera: () => void;
  onSceneError: (
    code: "WEBGL_UNSUPPORTED" | "WEBGL_CONTEXT_LOST" | "SCENE_LOAD_FAILED",
    msg: string,
  ) => void;
  onClearError: () => void;
  onExitCinematicMode: () => void;
}

/**
 * Checks whether the current browser environment supports WebGL rendering.
 */
function checkWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Frame-Rate Monitor & Adaptive Quality Governor inside the R3F render loop.
 */
function PerformanceMonitorLoop() {
  const frameCountRef = useRef(0);
  const windowStartRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current += 1;
    const now = performance.now();
    const elapsed = now - windowStartRef.current;
    if (elapsed >= 1000) {
      CosmosCinematicQualityManager.getInstance().reportFrameWindow(frameCountRef.current, elapsed);
      frameCountRef.current = 0;
      windowStartRef.current = now;
    }
  });

  return null;
}

/**
 * Cinematic Camera Rig with Smooth Exponential Damping, Aspect Ratio Sync,
 * Reduced-Motion Instant Keyframes, and Manual Student Orbit Handoff.
 */
function CinematicCameraRig({
  scene,
  activeCue,
  latestCameraCommand,
  isManualCameraMode,
  reducedMotion,
  onEnableManualCamera,
}: {
  scene: CinematicSceneDescriptor;
  activeCue: RegisteredAnimationCue | null;
  latestCameraCommand: CinematicCameraCommand | null;
  isManualCameraMode: boolean;
  reducedMotion: boolean;
  onEnableManualCamera: () => void;
}) {
  const { camera, size } = useThree();
  const controlsRef = useRef<any>(null);

  const desiredPosRef = useRef(new THREE.Vector3(...scene.defaultCameraPosition));
  const desiredTargetRef = useRef(new THREE.Vector3(...scene.defaultCameraTarget));
  const currentTargetRef = useRef(new THREE.Vector3(...scene.defaultCameraTarget));
  const cameraPausedRef = useRef(false);
  const orbitModeActiveRef = useRef(false);

  useEffect(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.aspect = Math.max(0.2, size.width / Math.max(1, size.height));
      persp.near = scene.nearClip;
      persp.far = scene.farClip;
      persp.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, scene.nearClip, scene.farClip]);

  useEffect(() => {
    if (!activeCue || isManualCameraMode) return;
    desiredPosRef.current.set(...activeCue.cameraPosition);
    desiredTargetRef.current.set(...activeCue.cameraTarget);
    orbitModeActiveRef.current = activeCue.cameraAction === "ORBIT_OBJECT";
    cameraPausedRef.current = false;

    if (reducedMotion) {
      camera.position.copy(desiredPosRef.current);
      currentTargetRef.current.copy(desiredTargetRef.current);
      camera.lookAt(currentTargetRef.current);
    }
  }, [activeCue, isManualCameraMode, reducedMotion, camera]);

  useEffect(() => {
    if (!latestCameraCommand) return;

    switch (latestCameraCommand.action) {
      case "PAUSE_CAMERA_MOVEMENT":
        cameraPausedRef.current = true;
        orbitModeActiveRef.current = false;
        break;

      case "RESTORE_CAMERA":
      case "APPLY_CAMERA_PRESET":
      case "SEEK_CAMERA_TRANSITION":
        cameraPausedRef.current = false;
        if (latestCameraCommand.cameraPosition) {
          desiredPosRef.current.set(...latestCameraCommand.cameraPosition);
        } else {
          desiredPosRef.current.set(...scene.defaultCameraPosition);
        }
        if (latestCameraCommand.targetPosition) {
          desiredTargetRef.current.set(...latestCameraCommand.targetPosition);
        } else {
          desiredTargetRef.current.set(...scene.defaultCameraTarget);
        }
        if (reducedMotion) {
          camera.position.copy(desiredPosRef.current);
          currentTargetRef.current.copy(desiredTargetRef.current);
          camera.lookAt(currentTargetRef.current);
        }
        break;

      case "FOCUS_OBJECT":
      case "ZOOM_TO_OBJECT":
      case "PAN_TO_REGION":
      case "FOLLOW_TRAJECTORY":
      case "ORBIT_OBJECT": {
        cameraPausedRef.current = false;
        orbitModeActiveRef.current = latestCameraCommand.action === "ORBIT_OBJECT";
        const obj = scene.objects.find((o) => o.objectId === latestCameraCommand.targetObjectId);
        if (obj) {
          desiredTargetRef.current.set(...obj.position);
          const zoomDist =
            latestCameraCommand.action === "ZOOM_TO_OBJECT"
              ? Math.max(3.2, obj.radius * 3.0)
              : Math.max(4.8, obj.radius * 4.2);
          desiredPosRef.current.set(
            obj.position[0] + zoomDist * 0.45,
            obj.position[1] + zoomDist * 0.55,
            obj.position[2] + zoomDist,
          );
        } else if (latestCameraCommand.cameraPosition) {
          desiredPosRef.current.set(...latestCameraCommand.cameraPosition);
        }
        break;
      }
    }
  }, [latestCameraCommand, scene, reducedMotion, camera]);

  useFrame((state, delta) => {
    if (isManualCameraMode || cameraPausedRef.current) {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      return;
    }

    const dt = Math.min(delta, 0.1);
    const lambda = reducedMotion ? 25.0 : 3.2;

    if (orbitModeActiveRef.current && !reducedMotion) {
      const angle = state.clock.elapsedTime * 0.16;
      const radius = Math.hypot(desiredPosRef.current.x, desiredPosRef.current.z) || 10;
      desiredPosRef.current.x = Math.sin(angle) * radius;
      desiredPosRef.current.z = Math.cos(angle) * radius;
    }

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      desiredPosRef.current.x,
      lambda,
      dt,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      desiredPosRef.current.y,
      lambda,
      dt,
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      desiredPosRef.current.z,
      lambda,
      dt,
    );

    currentTargetRef.current.x = THREE.MathUtils.damp(
      currentTargetRef.current.x,
      desiredTargetRef.current.x,
      lambda,
      dt,
    );
    currentTargetRef.current.y = THREE.MathUtils.damp(
      currentTargetRef.current.y,
      desiredTargetRef.current.y,
      lambda,
      dt,
    );
    currentTargetRef.current.z = THREE.MathUtils.damp(
      currentTargetRef.current.z,
      desiredTargetRef.current.z,
      lambda,
      dt,
    );

    if (controlsRef.current) {
      controlsRef.current.target.copy(currentTargetRef.current);
      controlsRef.current.update();
    } else {
      camera.lookAt(currentTargetRef.current);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      enableZoom
      enablePan={isManualCameraMode}
      minDistance={2.2}
      maxDistance={48}
      onStart={() => {
        if (!isManualCameraMode) {
          onEnableManualCamera();
        }
      }}
    />
  );
}

/**
 * REFERENCE SCENE A — MODULE 01 (& Cosmic Scale / Observational Geometry Modules):
 * Multi-layer Cosmic Hierarchy with Photorealistic Earth, Rayleigh Kármán Atmosphere,
 * Cratered Airless Moon, Logarithmic Distance Rings, and Deterministic Milky Way Barred Spiral.
 */
function CosmicHierarchyScene3D({
  sceneId,
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const moonOrbitGroupRef = useRef<THREE.Group>(null);
  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;

  // Map sublesson index (0..7) to logarithmic scale regime (10^7 m to 10^25 m)
  const scaleTransform = useMemo(
    () => AstronomicalScaleCoordinator.evaluateScaleTransition(7 + sublessonIdx * 2.5),
    [sublessonIdx],
  );

  useFrame((_, delta) => {
    if (!isSimulationRunning || !moonOrbitGroupRef.current) return;
    moonOrbitGroupRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 0.42;
  });

  const earthHighlighted =
    activeHighlightedObjects.includes("earth") ||
    activeHighlightedObjects.includes("karman_atmosphere");
  const moonHighlighted = activeHighlightedObjects.includes("moon");

  return (
    <group>
      {/* Photorealistic Earth with Continents, Oceans, Cloud Deck, City Lights & Rayleigh Kármán Limb */}
      <ScientificPlanetMaterial
        objectId="earth"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.45}
        starPosition={[14, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={earthHighlighted}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Inclined Lunar Orbit & Airless Cratered Moon */}
      <group rotation={[0.09, 0, 0]}>
        <OrbitalTrajectoryRenderer
          semiMajorAxis={4.2}
          eccentricity={0.0549}
          colorHex="#38bdf8"
          opacity={0.45}
          showApsidesMarkers={false}
        />

        <group ref={moonOrbitGroupRef}>
          <ScientificPlanetMaterial
            objectId="moon"
            sceneId={sceneId}
            presetId="moon"
            position={[4.2, 0, 0]}
            radius={0.4}
            starPosition={[14, 5, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={moonHighlighted}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
        </group>
      </group>

      {/* Deterministic Milky Way Barred-Spiral Disk (Galactic / Cosmological Scale Regime) */}
      <GalaxyParticleField
        objectId="milky_way_disk"
        morphology="barred_spiral"
        position={[0, -1.8, -3.5]}
        rotation={[0.35, 0, 0]}
        radius={7.8}
        armCount={4}
        seed={202601}
        opacity={Math.max(0.38, scaleTransform.galacticLayerOpacity)}
        pointSize={sublessonIdx >= 4 ? 0.08 : 0.05}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

/**
 * REFERENCE SCENE B — MODULE 08 (& Planetary Systems Modules 05, 06, 12, 19, 22, 23, 24):
 * Symplectic Newtonian & Keplerian Orbital Mechanics Laboratory with Real-Time Force & Velocity
 * Vectors, Equal-Area Swept Sectors, Photorealistic Planets, and Potential Well Grid.
 */
function OrbitalMechanicsScene3D({
  sceneId,
  moduleId,
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: {
  sceneId: string;
  moduleId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const orbitPhaseRef = useRef(0.35);
  const [planetPos, setPlanetPos] = useState<[number, number, number]>([4.9, 0, 0]);
  const [companionPos, setCompanionPos] = useState<[number, number, number]>([-7.8, 0, 2.0]);
  const [starPos, setStarPos] = useState<[number, number, number]>([0, 0, 0]);
  const [vectors, setVectors] = useState<VectorArrowDescriptor[]>([]);

  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;
  const eccentricity =
    sublessonIdx === 2 || sublessonIdx === 5 ? 0.42 : sublessonIdx === 6 ? 0.65 : 0.12;
  const semiMajorAxis = 5.4;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
  const focalOffset = semiMajorAxis * eccentricity;

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;

    const currentX = Math.cos(orbitPhaseRef.current) * semiMajorAxis - focalOffset;
    const currentZ = Math.sin(orbitPhaseRef.current) * semiMinorAxis;
    const r = Math.max(1.6, Math.hypot(currentX, currentZ));

    // Vis-Viva orbital angular rate: omega ~ (a / r)^(3/2)
    const angularRate = 0.82 * Math.pow(semiMajorAxis / r, 1.5);
    orbitPhaseRef.current = (orbitPhaseRef.current + dt * angularRate) % (Math.PI * 2);

    const px = Math.cos(orbitPhaseRef.current) * semiMajorAxis - focalOffset;
    const pz = Math.sin(orbitPhaseRef.current) * semiMinorAxis;
    setPlanetPos([px, 0, pz]);

    // Tangent velocity vector v = (-a*sin(theta), 0, b*cos(theta))
    const vx = -Math.sin(orbitPhaseRef.current) * semiMajorAxis;
    const vz = Math.cos(orbitPhaseRef.current) * semiMinorAxis;
    const vMag = Math.sqrt(Math.max(0.2, 2 / r - 1 / semiMajorAxis)) * 2.4;

    // Centripetal gravitational force vector F_g directed toward central star at (0,0,0)
    const fgLen = Math.min(2.6, (6.5 / (r * r)) * 2.2);

    setVectors([
      {
        origin: [px, 0, pz],
        direction: [vx, 0, vz],
        length: vMag,
        colorHex: "#38bdf8", // Orbital velocity vector (Cyan)
      },
      {
        origin: [px, 0, pz],
        direction: [-px, 0, -pz],
        length: fgLen,
        colorHex: "#10b981", // Centripetal gravitational force F_g (Emerald)
      },
    ]);

    const compAngle = orbitPhaseRef.current * 0.42 + 2.1;
    setCompanionPos([Math.cos(compAngle) * 8.4, 0, Math.sin(compAngle) * 8.4]);

    const wobbleRadius = sublessonIdx === 7 ? 0.62 : 0.1;
    setStarPos([
      -Math.cos(orbitPhaseRef.current) * wobbleRadius,
      0,
      -Math.sin(orbitPhaseRef.current) * wobbleRadius,
    ]);
  });

  // Choose companion planet preset (Saturn with rings for Module 06, Europa for Module 23, Jupiter default)
  const companionPreset = moduleId === "06" ? "saturn" : moduleId === "23" ? "europa" : "jupiter";

  return (
    <group>
      {/* Central G2V Primary Star with Convective Granulation & Limb Darkening */}
      <ScientificStarMaterial
        objectId="central_star"
        sceneId={sceneId}
        name="Central Primary Star (1.0 M_☉)"
        temperatureK={5772}
        position={starPos}
        radius={1.35}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Keplerian Elliptical Trajectory + Equal-Area Swept Sectors */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={semiMajorAxis}
        eccentricity={eccentricity}
        colorHex="#38bdf8"
        opacity={0.72}
        showEqualAreaSectors={sublessonIdx === 5 || sublessonIdx === 2}
        showApsidesMarkers
      />

      {/* Live Velocity (v) & Centripetal Gravity (F_g) Vectors + Potential Well Grid */}
      <ScientificVectorField
        vectors={vectors}
        showPotentialWellGrid={qualityProfile.tier !== "LOW_POWER"}
        potentialWellDepth={1.8}
        potentialWellRadius={8.8}
      />

      {/* Orbiting Test Planet with Live Solar Terminator */}
      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId={moduleId === "19" ? "mars" : "earth"}
        position={planetPos}
        radius={0.48}
        starPosition={starPos}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Outer Resonant Gas Giant / Ringed Planet Companion */}
      <ScientificPlanetMaterial
        objectId="companion_body"
        sceneId={sceneId}
        presetId={companionPreset}
        position={companionPos}
        radius={0.68}
        starPosition={starPos}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("companion_body")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

/**
 * REFERENCE SCENE C — MODULE 14 (Black Holes, Relativistic Accretion & Pulsars):
 * Schwarzschild/Kerr Black Hole with Doppler-Beamed Accretion Disk, Photon Sphere,
 * Gravitational Lensing Halo, Blandford-Znajek Polar Jets, Spacetime Potential Funnel,
 * and Companion Rotating Pulsar Lighthouse.
 */
function BlackHoleRelativityScene3D({
  sceneId,
  qualityProfile,
  activeCue,
  reducedMotion,
  isSimulationRunning,
  simulationTimeScale,
  activeHighlightedObjects,
  onSelectObject,
}: {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  reducedMotion: boolean;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;

  return (
    <group>
      {/* Relativistic Black Hole, Photon Sphere, Doppler-Beamed Disk & Jets */}
      <ScientificBlackHoleEffects
        objectId="event_horizon"
        sceneId={sceneId}
        schwarzschildRadius={1.35}
        spinParameterAStar={sublessonIdx >= 4 ? 0.65 : 0.0}
        dopplerBeamingStrength={0.92}
        showJets
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlightedObjectIds={activeHighlightedObjects}
        onSelectObject={onSelectObject}
      />

      {/* Pedagogical Flamm's Paraboloid Spacetime Embedding Grid */}
      {qualityProfile.tier !== "LOW_POWER" && (
        <ScientificVectorField
          showPotentialWellGrid
          potentialWellDepth={2.8}
          potentialWellRadius={8.5}
          gridColorHex="#818cf8"
        />
      )}

      {/* Companion Rotating Neutron Star / Pulsar Lighthouse (Highlighted in Pulsar sublessons) */}
      <PulsarBeamRenderer
        objectId="pulsar_remnant"
        position={[6.2, 0.8, -2.4]}
        neutronStarRadius={0.42}
        magneticTiltDeg={38}
        reducedMotion={reducedMotion}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

/**
 * STELLAR PHYSICS, CUTAWAY & NEBULAE SCENE (Modules 07, 09, 10, 11):
 * Multi-Spectral Blackbody Stars (O-Type Blue Supergiant, G2V Solar Star with Cue-Driven
 * Interior Cutaway, M-Type Red Giant) + Ionized Emission Nebula & Star Cluster.
 */
function StellarPhysicsScene3D({
  sceneId,
  moduleId,
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: {
  sceneId: string;
  moduleId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;
  const cueActionText = (activeCue?.animationAction || "").toLowerCase();
  // Activate interior octant cutaway on core/fusion sublessons
  const showSolarCutaway =
    sublessonIdx === 1 ||
    sublessonIdx === 2 ||
    cueActionText.includes("core") ||
    cueActionText.includes("cutaway");

  return (
    <group>
      {/* Central G2V Star (5,772 K) with Interior Cutaway Capability */}
      <ScientificStarMaterial
        objectId="main_sequence_star"
        sceneId={sceneId}
        name="G2V Main-Sequence Star (5,772 K)"
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={1.65}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        showCutaway={showSolarCutaway}
        highlighted={activeHighlightedObjects.includes("main_sequence_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* O-Type Blue Supergiant (32,000 K) */}
      <ScientificStarMaterial
        objectId="blue_supergiant"
        sceneId={sceneId}
        name="O-Type Blue Supergiant (32,000 K)"
        temperatureK={32000}
        position={[-4.8, 0.8, -1.5]}
        radius={2.15}
        sunspotStrength={0.1}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("blue_supergiant")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* M-Type Red Giant (3,200 K) */}
      <ScientificStarMaterial
        objectId="red_giant_branch"
        sceneId={sceneId}
        name="M-Type Red Giant (3,200 K)"
        temperatureK={3200}
        position={[4.8, -0.5, -1.2]}
        radius={2.45}
        sunspotStrength={0.65}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("red_giant_branch")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Background Ionized H II Emission Nebula or Supernova Remnant Volume */}
      <NebulaVolume
        objectId="nebula_volume"
        sceneId={sceneId}
        nebulaType={moduleId === "10" ? "supernova_remnant" : "emission"}
        position={[0, 0.4, -4.2]}
        scale={7.5}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Embedded Young Open Star Cluster */}
      <StarClusterRenderer
        objectId="open_cluster"
        clusterType="open"
        position={[0, 0.4, -3.5]}
        radius={4.2}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

/**
 * GALACTIC STRUCTURE, COSMIC WEB & COSMOLOGY SCENE (Modules 13, 15, 16, 17, 18, 20):
 * Barred Spiral Galaxy, Globular Cluster Halo, and Dark Matter / Cosmic Web Distribution.
 */
function GalacticAndCosmologyScene3D({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  onSelectObject: (id: string) => void;
}) {
  return (
    <group>
      <GalaxyParticleField
        objectId="primary_galaxy_disk"
        morphology="barred_spiral"
        position={[0, 0, 0]}
        rotation={[0.42, 0, 0.12]}
        radius={7.2}
        armCount={4}
        seed={1313}
        opacity={0.92}
        pointSize={0.07}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      <StarClusterRenderer
        objectId="globular_halo"
        clusterType="globular"
        position={[3.8, 2.1, -1.8]}
        radius={2.2}
        seed={1515}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      <NebulaVolume
        objectId="galactic_halo_gas"
        sceneId={sceneId}
        nebulaType="reflection"
        position={[0, 0, -1.5]}
        scale={8.2}
        densityScale={0.75}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

/**
 * OBSERVATORY INSTRUMENTS & SPACECRAFT MISSIONS SCENE (Modules 21 & 22):
 * Renders node-addressable JWST, Hubble, Voyager, Chandrayaan-3 Vikram/Pragyan,
 * Cassegrain Telescope Optical Cutaway & Ray Paths, and Bennu Rubble-Pile Asteroid.
 */
function ObservatoryAndSpacecraftScene3D({
  sceneId,
  moduleId,
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: {
  sceneId: string;
  moduleId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const subIdx = activeCue?.layerOrPresetIndex ?? 0;
  const spacecraftId =
    moduleId === "21"
      ? subIdx % 2 === 0
        ? "asset_spacecraft_jwst_v2"
        : "asset_spacecraft_hst_v2"
      : subIdx % 4 === 0
        ? "asset_spacecraft_jwst_v2"
        : subIdx % 4 === 1
          ? "asset_spacecraft_voyager_v2"
          : subIdx % 4 === 2
            ? "asset_spacecraft_chandrayaan3_vikram_v2"
            : "asset_spacecraft_hst_v2";

  return (
    <group>
      {/* Primary Space Observatory / Mission Vehicle */}
      <ScientificSpacecraftRenderer
        objectId="primary_spacecraft"
        sceneId={sceneId}
        assetId={spacecraftId}
        position={[-2.2, 0.2, 0]}
        scale={1.35}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("primary_spacecraft")}
        highlightedPartNodeId={activeHighlightedObjects[0] || null}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Interactive Cassegrain Optical Cutaway & Collimated Ray Bench */}
      <ScientificTelescopeCutaway
        objectId="telescope_optical_cutaway"
        sceneId={sceneId}
        position={[2.4, 0.2, 0]}
        scale={1.15}
        qualityTier={qualityProfile.tier}
        showRayPaths
        highlightedNodeId={activeHighlightedObjects[0] || null}
        isSimulationRunning={isSimulationRunning}
        onSelectObject={onSelectObject}
      />

      {/* Target Irregular Asteroid 101955 Bennu (OSIRIS-REx Rubble-Pile Shape Model) */}
      <IrregularCelestialBodyRenderer
        objectId="target_asteroid_bennu"
        sceneId={sceneId}
        position={[0, -2.2, -2.5]}
        scale={0.75}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

export function CosmosCinematicSceneHost({
  snapshot,
  scene,
  activeCue,
  latestCameraCommand,
  reducedMotion,
  onSelectObject,
  onEnableManualCamera,
  onSceneError,
  onClearError,
  onExitCinematicMode,
}: CosmosCinematicSceneHostProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean>(() => checkWebGLAvailable());
  const [contextLost, setContextLost] = useState(false);

  const qualityProfile: CinematicQualityProfile =
    CINEMATIC_QUALITY_PROFILES[snapshot.qualityPreset] || CINEMATIC_QUALITY_PROFILES.BALANCED;

  useEffect(() => {
    const supported = checkWebGLAvailable();
    setWebGLSupported(supported);
    if (!supported) {
      onSceneError(
        "WEBGL_UNSUPPORTED",
        "WebGL 3D hardware acceleration is unavailable in this browser environment. Displaying the interactive 2D scientific schematic.",
      );
    }
  }, [onSceneError]);

  // Synchronize active animation cue across all registered scientific objects in the scene
  useEffect(() => {
    CosmosScientificSceneLibrary.getInstance().evaluateCueAcrossScene(
      scene.sceneId,
      activeCue,
      snapshot.normalizedSegmentProgress,
    );
  }, [scene.sceneId, activeCue, snapshot.normalizedSegmentProgress]);

  // Preload only the active module's verified assets and release module scope on unmount (Section 28)
  useEffect(() => {
    const assetMgr = CosmosCinematicAssetManager.getInstance();
    assetMgr.preloadModuleAssets(snapshot.currentModuleId, qualityProfile.tier, true);
    return () => {
      assetMgr.releaseModuleScope(snapshot.currentModuleId);
      ScientificResourceManager.getInstance().releaseSceneScope(`scene:${scene.sceneId}`);
    };
  }, [snapshot.currentModuleId, qualityProfile.tier, scene.sceneId]);

  const handleRetryWebGL = () => {
    setContextLost(false);
    const supported = checkWebGLAvailable();
    setWebGLSupported(supported);
    if (supported) {
      onClearError();
    }
  };

  if (!webGLSupported || contextLost || snapshot.playerState === "ERROR") {
    return (
      <CosmosCinematicFallback
        scene={scene}
        errorState={snapshot.errorState}
        activeHighlightedObjects={snapshot.activeHighlightedObjects}
        selectedObjectId={snapshot.selectedObjectId}
        onSelectObject={onSelectObject}
        onRetryWebGL={handleRetryWebGL}
        onExitCinematicMode={onExitCinematicMode}
      />
    );
  }

  const starCount = Math.max(400, Math.floor(1800 * qualityProfile.particleBudgetMultiplier));

  return (
    <div
      data-testid="cosmos-cinematic-scene-host"
      className="relative w-full h-full bg-[#03050A] overflow-hidden"
    >
      <Canvas
        dpr={qualityProfile.dprRange}
        camera={{
          position: scene.defaultCameraPosition,
          fov: 45,
          near: scene.nearClip,
          far: scene.farClip,
        }}
        gl={{
          antialias: qualityProfile.antialias,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          const domElement = gl.domElement;
          const handleContextLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
            onSceneError(
              "WEBGL_CONTEXT_LOST",
              "The GPU WebGL context was interrupted. Your lesson position is preserved.",
            );
          };
          const handleContextRestored = () => {
            setContextLost(false);
            onClearError();
          };
          domElement.addEventListener("webglcontextlost", handleContextLost, false);
          domElement.addEventListener("webglcontextrestored", handleContextRestored, false);
        }}
      >
        <color attach="background" args={["#03050A"]} />

        {/* Physically Grounded Low-Ambient Lighting (Preserves Dark Planetary Night Sides & Terminators) */}
        <ambientLight intensity={0.11} />
        <directionalLight position={[14, 5, 10]} intensity={2.15} color="#fff4ea" />
        <pointLight position={[-10, -4, -10]} intensity={0.22} color="#38bdf8" />

        {/* Quality-Aware HDR Postprocessing (Selective High-Threshold Bloom + ACES Filmic) */}
        <CinematicPostprocessingPipeline
          qualityTier={qualityProfile.tier}
          exposure={1.08}
          toneMapping="aces"
          reducedMotion={reducedMotion}
        />

        {/* Contextual Background Starfield (Omitted in deep intergalactic scenes if inappropriate) */}
        {scene.sceneArchetype !== "cosmological_expansion" && (
          <Stars
            radius={120}
            depth={60}
            count={starCount}
            factor={3.2}
            saturation={0.25}
            fade
            speed={reducedMotion || !snapshot.isSimulationRunning ? 0 : 0.32}
          />
        )}

        <PerformanceMonitorLoop />

        <CinematicCameraRig
          scene={scene}
          activeCue={activeCue}
          latestCameraCommand={latestCameraCommand}
          isManualCameraMode={snapshot.isManualCameraMode}
          reducedMotion={reducedMotion}
          onEnableManualCamera={onEnableManualCamera}
        />

        {/* Render Module-Appropriate Scientific 3D Scene (44 Distinct Chapters across Modules 01, 05, 06, 07, 08, 14) */}
        {snapshot.currentModuleId === "01" ? (
          <Module01CinematicDirectorScene
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "05" ? (
          <Module05CinematicDirectorScene
            sceneId={scene.sceneId}
            lessonId={snapshot.currentSublessonId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            reducedMotion={reducedMotion}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "06" ? (
          <Module06CinematicDirectorScene
            sceneId={scene.sceneId}
            lessonId={snapshot.currentSublessonId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            reducedMotion={reducedMotion}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "07" ? (
          <Module07CinematicDirectorScene
            sceneId={scene.sceneId}
            lessonId={snapshot.currentSublessonId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            reducedMotion={reducedMotion}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "08" ? (
          <Module08CinematicDirectorScene
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "13" ? (
          <Module13CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("13", snapshot.currentSublessonId)
                ?.sceneComponentId || "m13_ch1_hubble_tuning_fork"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "14" ? (
          <Module14CinematicDirectorScene
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            reducedMotion={reducedMotion}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "15" ? (
          <Module15CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("15", snapshot.currentSublessonId)
                ?.sceneComponentId || "m15_ch1_cosmic_hierarchy_ladder"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "16" ? (
          <Module16CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("16", snapshot.currentSublessonId)
                ?.sceneComponentId || "m16_ch1_cosmic_energy_pie"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "17" ? (
          <Module17CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("17", snapshot.currentSublessonId)
                ?.sceneComponentId || "m17_ch1_big_bang_metric_intro"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "18" ? (
          <Module18CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("18", snapshot.currentSublessonId)
                ?.sceneComponentId || "m18_ch1_comoving_expansion_grid"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "19" ? (
          <Module19CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("19", snapshot.currentSublessonId)
                ?.sceneComponentId || "m19_ch1_ancient_worldviews_sky"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "20" ? (
          <Module20CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("20", snapshot.currentSublessonId)
                ?.sceneComponentId || "m20_ch1_solar_red_giant_track"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "21" ? (
          <Module21CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("21", snapshot.currentSublessonId)
                ?.sceneComponentId || "m21_ch1_photon_bucket_light_power"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "22" ? (
          <Module22CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("22", snapshot.currentSublessonId)
                ?.sceneComponentId || "m22_ch1_sputnik_leo_mechanics"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "23" ? (
          <Module23CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("23", snapshot.currentSublessonId)
                ?.sceneComponentId || "m23_ch1_chnops_water_chemistry"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : snapshot.currentModuleId === "24" ? (
          <Module24CinematicDirectorScene
            sceneComponentId={
              CosmosProofOfConceptCatalog.getChapterManifest("24", snapshot.currentSublessonId)
                ?.sceneComponentId || "m24_ch1_citizen_science_zooniverse"
            }
            chapterId={snapshot.currentSublessonId}
            activeBeatIndex={0}
            highlightedObjectIds={snapshot.activeHighlightedObjects}
            timeScale={snapshot.simulationTimeScale}
            isPaused={!snapshot.isSimulationRunning}
            showLabels={snapshot.showLabelsAndFormulae}
            reducedMotion={reducedMotion}
            qualityTier={qualityProfile.tier}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "orbital_mechanics" ? (
          <OrbitalMechanicsScene3D
            sceneId={scene.sceneId}
            moduleId={scene.moduleId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "black_hole_relativity" ? (
          <BlackHoleRelativityScene3D
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            reducedMotion={reducedMotion}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "stellar_physics" ? (
          <StellarPhysicsScene3D
            sceneId={scene.sceneId}
            moduleId={scene.moduleId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "galactic_structure" ||
          scene.sceneArchetype === "cosmological_expansion" ? (
          <GalacticAndCosmologyScene3D
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "observatory_instrument" ? (
          <ObservatoryAndSpacecraftScene3D
            sceneId={scene.sceneId}
            moduleId={scene.moduleId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        ) : (
          <CosmicHierarchyScene3D
            sceneId={scene.sceneId}
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            normalizedProgress={snapshot.normalizedSegmentProgress}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        )}

        {/* World-Anchored Scientific Annotations & 3D Object Focus Outlines */}
        <ScientificAnnotation
          scene={scene}
          chapterAnnotations={
            CosmosProofOfConceptCatalog.getChapterManifest(
              snapshot.currentModuleId,
              snapshot.currentSublessonId,
            )?.chapterAnnotations
          }
          enabled={snapshot.scientificLabelsEnabled}
          learningLevel={snapshot.learningLevel}
          highlightedObjectIds={snapshot.activeHighlightedObjects}
          selectedObjectId={snapshot.selectedObjectId}
        />
      </Canvas>
    </div>
  );
}
