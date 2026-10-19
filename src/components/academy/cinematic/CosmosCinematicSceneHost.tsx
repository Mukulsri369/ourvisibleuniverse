/**
 * COSMOS Scientific 3D Scene Host & Cinematic Camera Rig
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 10, 11, 15, 21, 22, 23, 24
 *
 * Implements:
 * - Single dedicated React Three Fiber <Canvas> when Cinematic Mode is open
 * - WebGL support check & webglcontextlost / webglcontextrestored recovery
 * - Adaptive DPR & particle budget governed by CosmosCinematicQualityManager
 * - Cinematic Camera Controller supporting FOCUS_OBJECT, ORBIT_OBJECT, ZOOM_TO_OBJECT,
 *   PAN_TO_REGION, FOLLOW_TRAJECTORY, RESTORE_CAMERA, APPLY_CAMERA_PRESET,
 *   SEEK_CAMERA_TRANSITION, and PAUSE_CAMERA_MOVEMENT with exponential spring damping
 * - 3D world-anchored scientific annotations (<Html> from @react-three/drei)
 * - Representative scientific scenes for Module 01 (Cosmic Scale Hierarchy),
 *   Module 08 (Newtonian & Keplerian Orbital Mechanics), Module 14 (Relativistic Black Hole
 *   & Compact Objects), plus Stellar Physics, Galactic Structure, and Cosmological Expansion.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
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
import { CosmosCinematicFallback } from "./CosmosCinematicFallback";

interface CosmosCinematicSceneHostProps {
  snapshot: CinematicPlayerStateSnapshot;
  scene: CinematicSceneDescriptor;
  activeCue: RegisteredAnimationCue | null;
  latestCameraCommand: CinematicCameraCommand | null;
  reducedMotion: boolean;
  onSelectObject: (objectId: string) => void;
  onEnableManualCamera: () => void;
  onSceneError: (code: "WEBGL_UNSUPPORTED" | "WEBGL_CONTEXT_LOST" | "SCENE_LOAD_FAILED", msg: string) => void;
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
      CosmosCinematicQualityManager.getInstance().reportFrameWindow(
        frameCountRef.current,
        elapsed,
      );
      frameCountRef.current = 0;
      windowStartRef.current = now;
    }
  });

  return null;
}

/**
 * Cinematic Camera Rig with Smooth Exponential Damping, Aspect Ratio Sync,
 * Reduced-Motion Instant Keyframes, and Manual Student Orbit Handoff (Prompt 03 Section 11).
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

  // Keep perspective aspect ratio and clipping planes synchronized on fullscreen/viewport resize
  useEffect(() => {
    if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.aspect = Math.max(0.2, size.width / Math.max(1, size.height));
      persp.near = scene.nearClip;
      persp.far = scene.farClip;
      persp.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height, scene.nearClip, scene.farClip]);

  // Update target camera position & lookAt when activeCue changes
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

  // Respond to explicit CinematicCameraCommand actions (Section 11)
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

    // Smooth exponential damping for position & orientation
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPosRef.current.x, lambda, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPosRef.current.y, lambda, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPosRef.current.z, lambda, dt);

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
 * MODULE 01 (& Cosmic Scale / Solar System Modules) 3D Scene:
 * Multi-layer Cosmic Hierarchy (Earth, Kármán Atmosphere, Moon Orbit, Milky Way Spiral & Cosmic Web).
 */
function CosmicHierarchyScene3D({
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  activeHighlightedObjects,
  onSelectObject,
}: {
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const galaxyPointsRef = useRef<THREE.Points>(null);

  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;
  const segCount = qualityProfile.sphereSegments;
  const particleCount = Math.max(
    400,
    Math.floor(2400 * qualityProfile.particleBudgetMultiplier),
  );

  // Generate spiral galaxy particle buffer once per quality tier
  const [galaxyPositions, galaxyColors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const coreColor = new THREE.Color("#fde68a");
    const armColor = new THREE.Color("#38bdf8");

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = Math.random() * 7.5 + 0.4;
      const branch = ((i % 2) * Math.PI * 2) / 2;
      const spin = r * 2.2;
      const spread = (Math.random() - 0.5) * 0.45 * r;

      pos[i3] = Math.cos(branch + spin) * r + spread;
      pos[i3 + 1] = (Math.random() - 0.5) * 0.35;
      pos[i3 + 2] = Math.sin(branch + spin) * r + spread;

      const mixed = coreColor.clone().lerp(armColor, r / 8.0);
      col[i3] = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = delta * simulationTimeScale;
    if (earthRef.current) {
      earthRef.current.rotation.y += dt * 0.32;
    }
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += dt * 0.48;
    }
    if (galaxyPointsRef.current) {
      galaxyPointsRef.current.rotation.y += dt * 0.06;
    }
  });

  const earthHighlighted = activeHighlightedObjects.includes("earth");
  const moonHighlighted = activeHighlightedObjects.includes("moon");

  return (
    <group>
      {/* Earth Sphere */}
      <mesh
        ref={earthRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("earth");
        }}
      >
        <sphereGeometry args={[1.45, segCount, segCount]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive={earthHighlighted ? "#0ea5e9" : "#082f49"}
          emissiveIntensity={earthHighlighted ? 0.55 : 0.2}
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Kármán Line Atmospheric Shell (100 km boundary representation) */}
      {qualityProfile.enableAtmosphericGlow && (
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("karman_atmosphere");
          }}
        >
          <sphereGeometry args={[1.62, Math.max(16, segCount / 2), Math.max(16, segCount / 2)]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={sublessonIdx === 0 ? 0.32 : 0.16}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Lunar Orbit Ring & Orbiting Moon */}
      <group rotation={[0.09, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.16, 4.22, 96]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>

        <group ref={moonGroupRef}>
          <mesh
            position={[4.2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("moon");
            }}
          >
            <sphereGeometry args={[0.4, Math.max(16, segCount / 2), Math.max(16, segCount / 2)]} />
            <meshStandardMaterial
              color="#cbd5e1"
              emissive={moonHighlighted ? "#38bdf8" : "#1e293b"}
              emissiveIntensity={moonHighlighted ? 0.6 : 0.15}
              roughness={0.85}
            />
          </mesh>
        </group>
      </group>

      {/* Outer Milky Way Spiral Disk Particle Cloud (Visible on Galactic / Cosmic Scale cues) */}
      <points
        ref={galaxyPointsRef}
        position={[0, -1.8, -3.5]}
        rotation={[0.35, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("milky_way_disk");
        }}
      >
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[galaxyPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[galaxyColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={sublessonIdx >= 4 ? 0.08 : 0.045}
          vertexColors
          transparent
          opacity={sublessonIdx >= 4 ? 0.9 : 0.45}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/**
 * MODULE 08 3D Scene:
 * Symplectic Newtonian & Keplerian Orbital Mechanics Laboratory
 */
function OrbitalMechanicsScene3D({
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: {
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  onSelectObject: (id: string) => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const companionRef = useRef<THREE.Mesh>(null);
  const starRef = useRef<THREE.Mesh>(null);
  const orbitPhaseRef = useRef(0);

  const sublessonIdx = activeCue?.layerOrPresetIndex ?? 0;
  // Vary eccentricity based on sublesson (08-03 elliptical, 08-06 Kepler equal areas, 08-07 escape)
  const eccentricity =
    sublessonIdx === 2 || sublessonIdx === 5 ? 0.42 : sublessonIdx === 6 ? 0.65 : 0.08;
  const semiMajorAxis = 5.4;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
  const focalOffset = semiMajorAxis * eccentricity;

  // Precompute Keplerian ellipse curve points
  const orbitLineGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          Math.cos(theta) * semiMajorAxis - focalOffset,
          0,
          Math.sin(theta) * semiMinorAxis,
        ),
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [semiMajorAxis, semiMinorAxis, focalOffset]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = delta * simulationTimeScale;

    // Vis-Viva angular speed modulation (faster at periapsis, slower at apoapsis)
    const currentX = Math.cos(orbitPhaseRef.current) * semiMajorAxis - focalOffset;
    const currentZ = Math.sin(orbitPhaseRef.current) * semiMinorAxis;
    const r = Math.max(1.8, Math.hypot(currentX, currentZ));
    const angularRate = 0.85 * Math.pow(semiMajorAxis / r, 1.5);

    orbitPhaseRef.current += dt * angularRate;

    if (planetRef.current) {
      planetRef.current.position.set(
        Math.cos(orbitPhaseRef.current) * semiMajorAxis - focalOffset,
        0,
        Math.sin(orbitPhaseRef.current) * semiMinorAxis,
      );
      planetRef.current.rotation.y += dt * 0.8;
    }

    if (companionRef.current) {
      const compAngle = orbitPhaseRef.current * 0.42 + 2.1;
      companionRef.current.position.set(Math.cos(compAngle) * 8.2, 0, Math.sin(compAngle) * 8.2);
    }

    // Barycenter stellar reflex wobble (highlighted in Sublesson 08-08)
    if (starRef.current) {
      const wobbleRadius = sublessonIdx === 7 ? 0.65 : 0.12;
      starRef.current.position.set(
        -Math.cos(orbitPhaseRef.current) * wobbleRadius,
        0,
        -Math.sin(orbitPhaseRef.current) * wobbleRadius,
      );
    }
  });

  const segs = qualityProfile.sphereSegments;

  return (
    <group>
      {/* Central Primary Star */}
      <mesh
        ref={starRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("central_star");
        }}
      >
        <sphereGeometry args={[1.35, segs, segs]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={1.2}
          roughness={0.25}
        />
      </mesh>

      {/* Keplerian Elliptical Orbit Path */}
      <lineLoop geometry={orbitLineGeometry}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.65} />
      </lineLoop>

      {/* Orbiting Test Planet */}
      <mesh
        ref={planetRef}
        position={[semiMajorAxis - focalOffset, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("orbiting_planet");
        }}
      >
        <sphereGeometry args={[0.45, Math.max(16, segs / 2), Math.max(16, segs / 2)]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.45}
          roughness={0.5}
        />
      </mesh>

      {/* Outer Resonant Companion */}
      <mesh
        ref={companionRef}
        position={[-7.8, 0, 2.0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("companion_body");
        }}
      >
        <sphereGeometry args={[0.62, Math.max(16, segs / 2), Math.max(16, segs / 2)]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#ea580c"
          emissiveIntensity={0.35}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

/**
 * MODULE 14 3D Scene:
 * Relativistic Compact Objects (Schwarzschild Event Horizon, Photon Sphere, Doppler Accretion Disk & Polar Jets)
 */
function BlackHoleRelativityScene3D({
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: {
  qualityProfile: CinematicQualityProfile;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  onSelectObject: (id: string) => void;
}) {
  const diskGroupRef = useRef<THREE.Group>(null);
  const lensedRingRef = useRef<THREE.Mesh>(null);
  const segs = qualityProfile.sphereSegments;

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = delta * simulationTimeScale;
    if (diskGroupRef.current) {
      diskGroupRef.current.rotation.y += dt * 0.75;
    }
    if (lensedRingRef.current) {
      lensedRingRef.current.rotation.z += dt * 0.35;
    }
  });

  return (
    <group>
      {/* Event Horizon Shadow Sphere (r_s = 2GM/c²) */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("event_horizon");
        }}
      >
        <sphereGeometry args={[1.35, segs, segs]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Photon Sphere Ring (r_ph = 1.5 r_s) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("photon_sphere");
        }}
      >
        <torusGeometry args={[2.025, 0.045, 24, 96]} />
        <meshBasicMaterial
          color="#e0f2fe"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Relativistic Accretion Disk (r_ISCO = 3 r_s to 5.4 r_s) */}
      <group
        ref={diskGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("accretion_disk");
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.35, 5.2, 96, 8]} />
          <meshBasicMaterial
            color="#fb923c"
            side={THREE.DoubleSide}
            transparent
            opacity={0.82}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner Hot ISCO Rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.05, 2.55, 96, 4]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Gravitationally Lensed Upper/Lower Halo Ring */}
      <mesh ref={lensedRingRef} rotation={[0.12, 0, 0]}>
        <ringGeometry args={[2.1, 3.35, 96, 4]} />
        <meshBasicMaterial
          color="#f97316"
          side={THREE.DoubleSide}
          transparent
          opacity={0.48}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Blandford–Znajek Relativistic Polar Jets */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("relativistic_jets");
        }}
      >
        <mesh position={[0, 3.6, 0]}>
          <cylinderGeometry args={[0.42, 0.08, 4.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh position={[0, -3.6, 0]}>
          <cylinderGeometry args={[0.08, 0.42, 4.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * STELLAR PHYSICS 3D Scene (Modules 07, 09, 10, 11):
 * Multi-Spectral Blackbody Stars (O-Type Supergiant, G2V Solar Star, M-Type Red Giant)
 */
function StellarPhysicsScene3D({
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: {
  qualityProfile: CinematicQualityProfile;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  onSelectObject: (id: string) => void;
}) {
  const solarRef = useRef<THREE.Mesh>(null);
  const blueRef = useRef<THREE.Mesh>(null);
  const redRef = useRef<THREE.Mesh>(null);
  const segs = qualityProfile.sphereSegments;

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = delta * simulationTimeScale;
    if (solarRef.current) solarRef.current.rotation.y += dt * 0.25;
    if (blueRef.current) blueRef.current.rotation.y += dt * 0.4;
    if (redRef.current) redRef.current.rotation.y += dt * 0.12;
  });

  return (
    <group>
      {/* Central G2V Star */}
      <mesh
        ref={solarRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("main_sequence_star");
        }}
      >
        <sphereGeometry args={[1.65, segs, segs]} />
        <meshStandardMaterial color="#fff4ea" emissive="#fbbf24" emissiveIntensity={1.1} />
      </mesh>

      {/* O-Type Blue Supergiant */}
      <mesh
        ref={blueRef}
        position={[-4.8, 0.8, -1.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("blue_supergiant");
        }}
      >
        <sphereGeometry args={[2.2, segs, segs]} />
        <meshStandardMaterial color="#9bb0ff" emissive="#3b82f6" emissiveIntensity={1.25} />
      </mesh>

      {/* M-Type Red Giant */}
      <mesh
        ref={redRef}
        position={[4.8, -0.5, -1.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("red_giant_branch");
        }}
      >
        <sphereGeometry args={[2.5, segs, segs]} />
        <meshStandardMaterial color="#ff6b3d" emissive="#ea580c" emissiveIntensity={0.95} />
      </mesh>
    </group>
  );
}

/**
 * 3D World-Anchored Scientific Annotations Layer (Prompt 03 Section 15)
 */
function SceneScientificAnnotations({
  scene,
  enabled,
}: {
  scene: CinematicSceneDescriptor;
  enabled: boolean;
}) {
  if (!enabled) return null;

  return (
    <group>
      {scene.annotations.map((ann) => (
        <Html
          key={ann.annotationId}
          position={ann.worldPosition}
          center
          distanceFactor={15}
          zIndexRange={[10, 0]}
        >
          <div
            data-testid={`scene-annotation-${ann.annotationId}`}
            className="pointer-events-none select-none bg-[#050914]/85 backdrop-blur-md border border-cyan-400/40 px-2.5 py-1 text-[11px] font-mono text-slate-100 whitespace-nowrap shadow-lg"
          >
            <span className="text-cyan-400 font-bold block">{ann.label}</span>
            <span className="text-slate-200 text-[10px]">{ann.value}</span>
          </div>
        </Html>
      ))}
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
        <ambientLight intensity={0.42} />
        <directionalLight position={[10, 12, 10]} intensity={1.85} color="#fff4ea" />
        <pointLight position={[-8, -5, -8]} intensity={0.45} color="#38bdf8" />

        <Stars
          radius={120}
          depth={60}
          count={starCount}
          factor={3.5}
          saturation={0.2}
          fade
          speed={reducedMotion || !snapshot.isSimulationRunning ? 0 : 0.4}
        />

        <PerformanceMonitorLoop />

        <CinematicCameraRig
          scene={scene}
          activeCue={activeCue}
          latestCameraCommand={latestCameraCommand}
          isManualCameraMode={snapshot.isManualCameraMode}
          reducedMotion={reducedMotion}
          onEnableManualCamera={onEnableManualCamera}
        />

        {/* Render Module-Appropriate Scientific 3D Scene */}
        {scene.sceneArchetype === "orbital_mechanics" ? (
          <OrbitalMechanicsScene3D
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "black_hole_relativity" ? (
          <BlackHoleRelativityScene3D
            qualityProfile={qualityProfile}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            onSelectObject={onSelectObject}
          />
        ) : scene.sceneArchetype === "stellar_physics" ? (
          <StellarPhysicsScene3D
            qualityProfile={qualityProfile}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            onSelectObject={onSelectObject}
          />
        ) : (
          <CosmicHierarchyScene3D
            qualityProfile={qualityProfile}
            activeCue={activeCue}
            isSimulationRunning={snapshot.isSimulationRunning}
            simulationTimeScale={snapshot.simulationTimeScale}
            activeHighlightedObjects={snapshot.activeHighlightedObjects}
            onSelectObject={onSelectObject}
          />
        )}

        <SceneScientificAnnotations
          scene={scene}
          enabled={snapshot.scientificLabelsEnabled}
        />
      </Canvas>
    </div>
  );
}
