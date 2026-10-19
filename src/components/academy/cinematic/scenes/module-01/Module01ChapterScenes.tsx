/**
 * MODULE 01 — OUR PLACE IN THE UNIVERSE: 6 COMPLETE CINEMATIC CHAPTER SCENES
 * Project: Our Visible Universe Academy
 * Scope: Prompt 08 — Phase B (Chapters 01.1 through 01.6)
 *
 * Implements 6 distinct scientific 3D chapter experiences:
 * - Chapter 01.1 (EarthAtmosphereScene): Exponential barometric density decay, 100 km Kármán
 *   operational convention (not a wall), interplanetary vacuum cube (~5 protons/cm³ + EM wave),
 *   and 408 km ISS orbit (1.57% R_⊕ apple-skin scale).
 * - Chapter 01.2 (EarthHomeScene): 23.44° axial obliquity, solar terminator, schematic outer-core
 *   geodynamo cutaway, dipolar magnetosphere & solar-wind bow shock (~10 R_⊕), 557.7 nm auroral
 *   ovals, and 29.78 km/s orbital velocity vector.
 * - Chapter 01.3 (EarthMoonScene): Educational vs True 30-Earth-Diameter (384,400 km) scale toggle,
 *   30 wireframe Earth-diameter markers, 1:1 synchronous tidal lock prime-meridian vector,
 *   1.282-s Apollo laser ranging pulse, and leading Theia giant-impact model reconstruction.
 * - Chapter 01.4 (SolarSystemScaleScene): Flicker-free heliocentric Solar System with all 8 planets,
 *   1.00 AU golden caliper, Main Asteroid Belt, Kuiper Belt, Oort Cloud, expanding sunlight wavefront,
 *   and 99.86% solar mass dominance.
 * - Chapter 01.5 (MilkyWayJourneyScene): 100,000-ly SBbc barred spiral Milky Way, Orion–Cygnus Spur
 *   Solar System beacon (R_0 = 26,670 ly from Sgr A*), 230-Myr Galactic Year orbit, and 100:1
 *   edge-on thin disk vs halo profile.
 * - Chapter 01.6 (ObservableUniverseScene): Local Group (Milky Way, Andromeda M31, M33), Laniakea
 *   Supercluster (520 Mly), Cosmic Web filaments, and the 46.5-Gly Comoving Particle Horizon with
 *   unobservable structure continuing beyond the horizon sphere.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { CinematicQualityProfile } from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type { RegisteredAnimationCue } from "@/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import {
  CosmosChapterInteractionStore,
  type ChapterControlValueMap,
  type ProofOfConceptSceneComponentId,
} from "@/lib/cosmos/cinematic/poc";
import {
  GalaxyParticleField,
  OrbitalTrajectoryRenderer,
  ScientificPlanetMaterial,
  ScientificStarMaterial,
  ScientificVectorField,
  StarClusterRenderer,
} from "../../science";

export interface Module01SceneProps {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}

/**
 * Hook subscribing a 3D chapter scene to live student controls in CosmosChapterInteractionStore.
 */
function useChapterControlValues(moduleId: string, chapterId: string): ChapterControlValueMap {
  const store = CosmosChapterInteractionStore.getInstance();
  const [values, setValues] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues(moduleId, chapterId),
  );

  useEffect(() => {
    setValues(store.getChapterValues(moduleId, chapterId));
    return store.subscribe(() => {
      setValues(store.getChapterValues(moduleId, chapterId));
    });
  }, [store, moduleId, chapterId]);

  return values;
}

// ============================================================================
// CHAPTER 01.1 — WHAT IS SPACE? (Atmospheric Scale Height, Kármán Line & Vacuum)
// ============================================================================
export function EarthAtmosphereScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-1-what-is-space");
  const altitudeKm = Number(controls.altitudeKm ?? 100);
  const showVacuumCube = Boolean(controls.showVacuumCube ?? true);

  const gasParticlesRef = useRef<THREE.Points>(null);
  const issGroupRef = useRef<THREE.Group>(null);
  const emWavePhaseRef = useRef(0);
  const [emWavePoints, setEmWavePoints] = useState<[number, number, number][]>([
    [1.2, 2.0, 0],
    [2.4, 2.0, 0],
  ]);

  // Exponential barometric particle field: n(z) = n_0 exp(-z / H) around Earth (R = 1.65)
  const { positions, colors } = useMemo(() => {
    const count = qualityProfile.tier === "LOW_POWER" ? 600 : 1600;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const lowCol = new THREE.Color("#38bdf8");
    const highCol = new THREE.Color("#818cf8");

    for (let i = 0; i < count; i++) {
      // Exponential radial height distribution above r = 1.66 (no sharp wall at 100 km!)
      const u = Math.max(0.0005, ((i * 9301 + 49297) % 233280) / 233280);
      const heightOffset = -Math.log(u) * 0.16; // Smooth exponential tail into exosphere
      const r = 1.66 + Math.min(1.6, heightOffset);
      const theta = ((i * 1.6180339) % 1) * Math.PI * 2;
      const phi = Math.acos(1 - 2 * (((i * 0.754877) % 1)));

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const t = Math.min(1, heightOffset / 0.7);
      const c = lowCol.clone().lerp(highCol, t);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [qualityProfile.tier]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    if (gasParticlesRef.current) {
      gasParticlesRef.current.rotation.y += dt * 0.08;
    }
    if (issGroupRef.current) {
      issGroupRef.current.rotation.z += dt * 0.45;
    }
    emWavePhaseRef.current += dt * 4.0;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const x = 1.35 + u * 1.1;
      const y = 2.05 + Math.sin(u * Math.PI * 4 - emWavePhaseRef.current) * 0.14;
      pts.push([x, y, 0.2]);
    }
    setEmWavePoints(pts);
  });

  // Map altitudeKm (0..500 km) to scene radial distance above R_earth = 1.65
  const probeRadius = 1.65 + (altitudeKm / 500) * 0.95;
  const karmanRadius = 1.65 + (100 / 500) * 0.95; // 1.84 u
  const issRadius = 1.65 + (408 / 500) * 0.95; // 2.425 u

  return (
    <group>
      {/* Photorealistic Earth with Rayleigh Limb */}
      <ScientificPlanetMaterial
        objectId="earth"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.65}
        starPosition={[14, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("earth")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Continuous Exponential Atmospheric Molecule Field (No Physical Wall at 100 km) */}
      <points ref={gasParticlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          vertexColors
          transparent
          opacity={0.62}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 100 km Kármán Line Operational Coordinate Ring (Dashed/Translucent Reference Marker) */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("karman_atmosphere");
        }}
      >
        <torusGeometry args={[karmanRadius, 0.014, 16, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.82} />
      </mesh>

      {/* Interactive Probe Altitude Marker Ring (0–500 km Scrubber) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[probeRadius, 0.018, 16, 96]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} />
      </mesh>

      {/* 408 km International Space Station (ISS) Thermosphere Orbit Ring */}
      <group ref={issGroupRef} rotation={[0.45, 0.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[issRadius, 0.01, 12, 96]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.65} />
        </mesh>
        <mesh position={[issRadius, 0, 0]}>
          <boxGeometry args={[0.16, 0.05, 0.28]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Interplanetary Vacuum Diagnostic Sample Cube (~5 protons/cm³ + EM Wave) */}
      {showVacuumCube && (
        <group
          position={[1.9, 2.05, 0.2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("vacuum_diagnostic_cube");
          }}
        >
          <mesh>
            <boxGeometry args={[1.15, 0.85, 0.85]} />
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.48} />
          </mesh>
          {/* 5 Sparse Interplanetary Plasma Protons inside the Sample Volume */}
          {[
            [-0.35, 0.18, -0.15],
            [-0.1, -0.22, 0.2],
            [0.05, 0.24, 0.1],
            [0.25, -0.12, -0.2],
            [0.4, 0.15, 0.12],
          ].map((pt, idx) => (
            <mesh key={idx} position={pt as [number, number, number]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#fbbf24" />
            </mesh>
          ))}
        </group>
      )}
      {showVacuumCube && (
        <Line points={emWavePoints} color="#22d3ee" lineWidth={2.0} transparent opacity={0.9} />
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 01.2 — EARTH: OUR HOME IN SPACE (Obliquity, Geodynamo & Magnetosphere)
// ============================================================================
export function EarthHomeScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-2-earth-our-home");
  const axialTiltDeg = Number(controls.axialTiltDeg ?? 23.44);
  const showCoreCutaway = Boolean(controls.showCoreCutaway ?? true);
  const showMagnetosphere = Boolean(controls.showMagnetosphere ?? true);

  const tiltRad = (axialTiltDeg * Math.PI) / 180;
  const solarWindRef = useRef<THREE.Group>(null);

  // Generate dipolar magnetic field lines B(r, θ) = B_0 sin²(θ)
  const dipoleLines = useMemo(() => {
    const curves: [number, number, number][][] = [];
    const azimuths = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
    for (const phi of azimuths) {
      for (const lShell of [2.6, 3.6]) {
        const pts: [number, number, number][] = [];
        for (let i = 5; i <= 35; i++) {
          const theta = (i / 40) * Math.PI;
          const r = lShell * Math.pow(Math.sin(theta), 2);
          if (r >= 1.45) {
            // Compress sunward (+x) side slightly, stretch nightside (-x) magnetotail
            const xRaw = r * Math.sin(theta) * Math.cos(phi);
            const x = xRaw > 0 ? xRaw * 0.78 : xRaw * 1.35;
            const y = r * Math.cos(theta);
            const z = r * Math.sin(theta) * Math.sin(phi);
            pts.push([x, y, z]);
          }
        }
        if (pts.length >= 2) curves.push(pts);
      }
    }
    return curves;
  }, []);

  useFrame((state) => {
    if (!isSimulationRunning || !solarWindRef.current) return;
    const t = state.clock.elapsedTime * simulationTimeScale;
    solarWindRef.current.position.x = -((t * 1.8) % 2.4);
  });

  return (
    <group>
      {/* Tilted Earth System (Obliquity ε = 23.44°) */}
      <group rotation={[0, 0, -tiltRad]}>
        <ScientificPlanetMaterial
          objectId="earth"
          sceneId={sceneId}
          presetId="earth"
          position={[0, 0, 0]}
          radius={1.55}
          starPosition={[14, 4, 8]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("earth")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />

        {/* Rotational Axis Pole Rod */}
        <Line
          points={[
            [0, -2.35, 0],
            [0, 2.35, 0],
          ]}
          color="#fbbf24"
          lineWidth={2.0}
        />

        {/* Schematic Outer & Inner Core Geodynamo Indicator */}
        {showCoreCutaway && (
          <group position={[0, 0, 1.15]}>
            {/* Molten Iron-Nickel Outer Core Schematic Shell */}
            <mesh>
              <ringGeometry args={[0.32, 0.68, 32]} />
              <meshBasicMaterial
                color="#f59e0b"
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Solid Inner Core */}
            <mesh position={[0, 0, 0.02]}>
              <circleGeometry args={[0.28, 24]} />
              <meshBasicMaterial color="#fef08a" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}

        {/* Polar Auroral Ovals (557.7 nm [O I] Emerald Emission around North & South Poles) */}
        {showMagnetosphere && (
          <>
            <mesh position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.48, 0.035, 16, 48]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.88} />
            </mesh>
            <mesh position={[0, -1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.48, 0.035, 16, 48]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.88} />
            </mesh>
          </>
        )}

        {/* Dipolar Magnetosphere Flux Lines */}
        {showMagnetosphere &&
          dipoleLines.map((pts, idx) => (
            <Line
              key={idx}
              points={pts}
              color={idx % 2 === 0 ? "#818cf8" : "#38bdf8"}
              lineWidth={1.3}
              transparent
              opacity={0.55}
            />
          ))}
      </group>

      {/* Dayside Bow Shock Arc & Incoming Solar Wind Stream */}
      {showMagnetosphere && (
        <group>
          <Line
            points={[
              [2.6, -2.8, 0],
              [3.3, -1.4, 0],
              [3.6, 0, 0],
              [3.3, 1.4, 0],
              [2.6, 2.8, 0],
            ]}
            color="#fbbf24"
            lineWidth={1.8}
            transparent
            opacity={0.7}
          />
          <group ref={solarWindRef}>
            {[-1.6, -0.8, 0, 0.8, 1.6].map((y, i) => (
              <Line
                key={i}
                points={[
                  [5.8, y, 0],
                  [4.4, y, 0],
                ]}
                color="#fde047"
                lineWidth={1.5}
                transparent
                opacity={0.65}
              />
            ))}
          </group>
        </group>
      )}

      {/* Heliocentric Orbital Velocity Vector v_⊕ = 29.78 km/s */}
      <ScientificVectorField
        vectors={[
          {
            origin: [0, -1.75, 0],
            direction: [1, 0, 0.3],
            length: 2.3,
            colorHex: "#22d3ee",
          },
        ]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 01.3 — EARTH AND THE MOON (30 D_⊕ Scale Toggle & 1:1 Tidal Locking)
// ============================================================================
export function EarthMoonScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-3-earth-and-the-moon");
  const scaleMode = String(controls.cisLunarScaleMode ?? "educational");
  const showTidalLockVector = Boolean(controls.showTidalLockVector ?? true);
  const showTheiaModel = Boolean(controls.showTheiaModel ?? false);

  const isTrueScale = scaleMode === "true_30_earth_diameters";
  const earthRadius = isTrueScale ? 0.18 : 1.25;
  const moonRadius = isTrueScale ? 0.05 : 0.36;
  const orbitRadius = isTrueScale ? 10.8 : 4.6; // In true scale: 10.8 / (2 * 0.18) = 30.0 Earth diameters!

  const orbitPhaseRef = useRef(0.4);
  const [moonPos, setMoonPos] = useState<[number, number, number]>([orbitRadius, 0, 0]);
  const [laserProgress, setLaserProgress] = useState(0);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    orbitPhaseRef.current = (orbitPhaseRef.current + dt * 0.38) % (Math.PI * 2);
    const mx = Math.cos(orbitPhaseRef.current) * orbitRadius;
    const mz = Math.sin(orbitPhaseRef.current) * orbitRadius;
    setMoonPos([mx, 0, mz]);
    setLaserProgress((prev) => (prev + dt * 0.78) % 1);
  });

  // 30 Earth-diameter wireframe spheres arrayed between Earth and Moon
  const thirtyEarthMarkers = useMemo(() => {
    const count = 30;
    const items: number[] = [];
    for (let i = 1; i <= count; i++) {
      items.push((i / (count + 1)) * orbitRadius);
    }
    return items;
  }, [orbitRadius]);

  const laserPoint: [number, number, number] = [
    moonPos[0] * laserProgress,
    0.05,
    moonPos[2] * laserProgress,
  ];

  return (
    <group>
      {/* Earth */}
      <ScientificPlanetMaterial
        objectId="earth"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={earthRadius}
        starPosition={[16, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("earth")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Lunar Orbit Path */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={orbitRadius}
        eccentricity={0.0549}
        colorHex="#38bdf8"
        opacity={0.55}
        showApsidesMarkers={false}
      />

      {/* 30 Earth-Diameter Yardstick Spheres Along the Cis-Lunar Baseline */}
      {thirtyEarthMarkers.map((dist, idx) => (
        <mesh
          key={idx}
          position={[
            Math.cos(orbitPhaseRef.current) * dist,
            0,
            Math.sin(orbitPhaseRef.current) * dist,
          ]}
        >
          <sphereGeometry args={[orbitRadius / 62, 8, 8]} />
          <meshBasicMaterial
            color={idx % 5 === 0 ? "#38bdf8" : "#94a3b8"}
            wireframe
            transparent
            opacity={isTrueScale ? 0.55 : 0.28}
          />
        </mesh>
      ))}

      {/* Synchronous Tidally Locked Moon */}
      <ScientificPlanetMaterial
        objectId="moon"
        sceneId={sceneId}
        presetId="moon"
        position={moonPos}
        radius={moonRadius}
        starPosition={[16, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("moon")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* 1:1 Synchronous Rotation Vector (Near-Side Prime Meridian Always Points at Earth) */}
      {showTidalLockVector && (
        <ScientificVectorField
          vectors={[
            {
              origin: moonPos,
              direction: [-moonPos[0], 0, -moonPos[2]],
              length: Math.min(2.2, orbitRadius * 0.38),
              colorHex: "#10b981",
            },
          ]}
        />
      )}

      {/* 1.282-Second Apollo Laser Ranging Pulse */}
      <mesh position={laserPoint}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#f43f5e" />
      </mesh>

      {/* Leading Scientific Hypothesis Reconstruction: Theia Giant Impact Debris Ring */}
      {showTheiaModel && (
        <group position={[0, 0, 0]} rotation={[0.35, 0, 0.15]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[earthRadius * 1.35, earthRadius * 2.25, 64]} />
            <meshBasicMaterial
              color="#f97316"
              side={THREE.DoubleSide}
              transparent
              opacity={0.52}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 01.4 — OUR SOLAR SYSTEM (8 Planets, 1 AU Caliper, Belts & Wavefront)
// ============================================================================
const SOLAR_PLANET_SPECS = [
  { id: "mercury", preset: "mercury" as const, au: 0.39, sceneR: 1.5, radius: 0.12, speed: 1.6 },
  { id: "venus", preset: "venus" as const, au: 0.72, sceneR: 2.1, radius: 0.18, speed: 1.15 },
  { id: "earth", preset: "earth" as const, au: 1.0, sceneR: 2.8, radius: 0.22, speed: 0.95 },
  { id: "mars", preset: "mars" as const, au: 1.52, sceneR: 3.5, radius: 0.16, speed: 0.75 },
  { id: "jupiter", preset: "jupiter" as const, au: 5.2, sceneR: 5.4, radius: 0.46, speed: 0.42 },
  { id: "saturn", preset: "saturn" as const, au: 9.54, sceneR: 6.9, radius: 0.38, speed: 0.3 },
  { id: "uranus", preset: "uranus" as const, au: 19.2, sceneR: 8.3, radius: 0.28, speed: 0.21 },
  { id: "neptune", preset: "neptune" as const, au: 30.1, sceneR: 9.6, radius: 0.27, speed: 0.16 },
];

export function SolarSystemScaleScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-4-our-solar-system");
  const locateEarthBeacon = Boolean(controls.locateEarthBeacon ?? true);
  const showSunlightWavefront = Boolean(controls.showSunlightWavefront ?? true);
  const heliocentricDistanceAu = Number(controls.heliocentricDistanceAu ?? 5.2);

  const timeRef = useRef(0);
  const [wavefrontRadius, setWavefrontRadius] = useState(2.8);
  const [planetAngles, setPlanetAngles] = useState<number[]>(() =>
    SOLAR_PLANET_SPECS.map((_, i) => i * 0.85),
  );

  // Main Asteroid Belt (2.1–3.3 AU -> sceneR 4.1–4.7) & Kuiper Belt (30–50 AU -> sceneR 10.2–11.8)
  const { beltPositions, beltColors } = useMemo(() => {
    const count = qualityProfile.tier === "LOW_POWER" ? 700 : 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const astCol = new THREE.Color("#cbd5e1");
    const kuiperCol = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const isKuiper = i >= count * 0.45;
      const u = ((i * 7919 + 104729) % 100000) / 100000;
      const angle = ((i * 1.6180339) % 1) * Math.PI * 2;
      const r = isKuiper ? 10.2 + u * 1.8 : 4.15 + u * 0.55;
      const y = (((i * 3571) % 1000) / 1000 - 0.5) * (isKuiper ? 0.55 : 0.18);

      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const c = isKuiper ? kuiperCol : astCol;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { beltPositions: pos, beltColors: col };
  }, [qualityProfile.tier]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    timeRef.current += dt;
    setPlanetAngles(SOLAR_PLANET_SPECS.map((p, i) => i * 0.85 + timeRef.current * p.speed * 0.35));
    setWavefrontRadius(1.2 + ((timeRef.current * 1.8) % 10.2));
  });

  const earthAngle = planetAngles[2] || 0;
  const earthPos: [number, number, number] = [
    Math.cos(earthAngle) * 2.8,
    0,
    Math.sin(earthAngle) * 2.8,
  ];

  // Map interactive AU slider (0.4..35 AU) to scene radius
  const selectedSceneRadius =
    heliocentricDistanceAu <= 1.52
      ? 1.5 + ((heliocentricDistanceAu - 0.39) / 1.13) * 2.0
      : 3.5 + (Math.log10(heliocentricDistanceAu / 1.52) / Math.log10(35 / 1.52)) * 7.8;

  return (
    <group>
      {/* Central Sun (99.86% of Solar System Mass) */}
      <ScientificStarMaterial
        objectId="sun"
        sceneId={sceneId}
        name="The Sun (99.86% System Mass)"
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={0.95}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("sun")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* All 8 Solar System Planets & Orbit Rings */}
      {SOLAR_PLANET_SPECS.map((planet, idx) => {
        const angle = planetAngles[idx] || 0;
        const px = Math.cos(angle) * planet.sceneR;
        const pz = Math.sin(angle) * planet.sceneR;
        return (
          <group key={planet.id}>
            <OrbitalTrajectoryRenderer
              semiMajorAxis={planet.sceneR}
              eccentricity={0.02}
              colorHex={planet.id === "earth" ? "#22d3ee" : "#475569"}
              opacity={planet.id === "earth" ? 0.78 : 0.35}
              showApsidesMarkers={false}
            />
            <ScientificPlanetMaterial
              objectId={planet.id}
              sceneId={sceneId}
              presetId={planet.preset}
              position={[px, 0, pz]}
              radius={planet.radius}
              starPosition={[0, 0, 0]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={simulationTimeScale}
              highlighted={activeHighlightedObjects.includes(planet.id)}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
          </group>
        );
      })}

      {/* 1.00 AU Golden Caliper & Locate Earth Beacon */}
      {locateEarthBeacon && (
        <group>
          <Line points={[[0, 0.1, 0], [earthPos[0], 0.1, earthPos[2]]]} color="#fbbf24" lineWidth={2.2} />
          <mesh position={[earthPos[0], 0.42, earthPos[2]]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.28, 0.38, 32]} />
            <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Main Asteroid Belt (2.1–3.3 AU) & Kuiper Belt (30–50 AU) */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[beltPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[beltColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.04} vertexColors transparent opacity={0.75} depthWrite={false} />
      </points>

      {/* Interactive AU Distance Probe Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[selectedSceneRadius, 0.02, 12, 96]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.75} />
      </mesh>

      {/* Expanding Sunlight Transit Wavefront */}
      {showSunlightWavefront && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[wavefrontRadius, wavefrontRadius + 0.08, 64]} />
          <meshBasicMaterial
            color="#fef08a"
            side={THREE.DoubleSide}
            transparent
            opacity={0.48}
          />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 01.5 — THE MILKY WAY GALAXY (Orion Spur Address & 230-Myr Orbit)
// ============================================================================
export function MilkyWayJourneyScene({
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-5-the-milky-way-galaxy");
  const perspective = String(controls.galacticPerspective ?? "face_on");
  const showGalacticOrbit = Boolean(controls.showGalacticOrbit ?? true);

  const diskTiltX =
    perspective === "edge_on" ? 1.48 : perspective === "solar_neighborhood" ? 0.35 : 0.18;

  // Sun location in the Orion–Cygnus Spur at R_0 = 26,670 ly (~53% of 50,000 ly disk radius)
  const sunRadius = 3.8;
  const sunAngleRef = useRef(0.75);
  const [sunPos, setSunPos] = useState<[number, number, number]>([
    Math.cos(0.75) * sunRadius,
    0,
    Math.sin(0.75) * sunRadius,
  ]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    sunAngleRef.current = (sunAngleRef.current + dt * 0.12) % (Math.PI * 2);
    setSunPos([
      Math.cos(sunAngleRef.current) * sunRadius,
      0,
      Math.sin(sunAngleRef.current) * sunRadius,
    ]);
  });

  return (
    <group rotation={[diskTiltX, 0, 0]}>
      {/* SBbc Barred-Spiral Milky Way Disk (100,000 ly diameter) */}
      <GalaxyParticleField
        objectId="milky_way_disk"
        morphology="barred_spiral"
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        radius={7.4}
        armCount={4}
        seed={202605}
        opacity={0.94}
        pointSize={0.065}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Globular Cluster Stellar Halo */}
      <StarClusterRenderer
        objectId="globular_halo"
        clusterType="globular"
        position={[0, 1.4, 0]}
        radius={4.5}
        seed={105}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Sagittarius A* Galactic Core Marker */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("sgr_a_star_core");
        }}
      >
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* 230-Million-Year Solar Galactic Orbit Ring (R_0 = 26,670 ly) */}
      {showGalacticOrbit && (
        <OrbitalTrajectoryRenderer
          semiMajorAxis={sunRadius}
          eccentricity={0.02}
          colorHex="#fbbf24"
          opacity={0.82}
          showApsidesMarkers={false}
        />
      )}

      {/* Orion–Cygnus Spur Solar System Beacon & R_0 Caliper Line */}
      <Line points={[[0, 0.05, 0], [sunPos[0], 0.05, sunPos[2]]]} color="#22d3ee" lineWidth={1.8} />
      <group
        position={sunPos}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("orion_spur_sun_beacon");
        }}
      >
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.36, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 01.6 — OTHER GALAXIES & THE OBSERVABLE UNIVERSE (Horizon ≠ Wall)
// ============================================================================
export function ObservableUniverseScene({
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module01SceneProps) {
  const controls = useChapterControlValues("01", "lesson-6-other-galaxies-and-universe");
  const showBeyondHorizon = Boolean(controls.showBeyondHorizonContinuation ?? true);
  const hierarchyTier = Number(controls.cosmicHierarchyLayer ?? 6);

  const webGroupRef = useRef<THREE.Group>(null);

  // Cosmic Web Filaments & Supercluster Nodes (Inside r <= 5.4 and continuing Beyond r > 5.4)
  const { insidePoints, outsidePoints, filamentLines } = useMemo(() => {
    const inCount = qualityProfile.tier === "LOW_POWER" ? 500 : 1200;
    const outCount = qualityProfile.tier === "LOW_POWER" ? 250 : 600;
    const inPos = new Float32Array(inCount * 3);
    const outPos = new Float32Array(outCount * 3);
    const lines: [number, number, number][][] = [];

    const nodes: [number, number, number][] = [];
    for (let i = 0; i < 36; i++) {
      const r = 1.2 + ((i * 17) % 38) * 0.11;
      const theta = i * 2.39996;
      const phi = Math.acos(1 - 2 * ((i + 0.5) / 36));
      nodes.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }

    for (let i = 0; i < nodes.length - 1; i++) {
      lines.push([nodes[i], nodes[(i + 3) % nodes.length]]);
    }

    for (let i = 0; i < inCount; i++) {
      const node = nodes[i % nodes.length];
      const next = nodes[(i + 3) % nodes.length];
      const u = ((i * 4999) % 1000) / 1000;
      const spread = 0.25;
      inPos[i * 3] = THREE.MathUtils.lerp(node[0], next[0], u) + (Math.sin(i) * spread);
      inPos[i * 3 + 1] = THREE.MathUtils.lerp(node[1], next[1], u) + (Math.cos(i) * spread);
      inPos[i * 3 + 2] = THREE.MathUtils.lerp(node[2], next[2], u) + (Math.sin(i * 1.7) * spread);
    }

    // Filaments continuing beyond the 46.5 Gly Particle Horizon (r = 5.6..8.2)
    for (let i = 0; i < outCount; i++) {
      const r = 5.65 + ((i * 31) % 100) * 0.026;
      const theta = i * 2.39996;
      const phi = Math.acos(1 - 2 * ((i + 0.5) / outCount));
      outPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      outPos[i * 3 + 1] = r * Math.cos(phi);
      outPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }

    return { insidePoints: inPos, outsidePoints: outPos, filamentLines: lines };
  }, [qualityProfile.tier]);

  useFrame((_, delta) => {
    if (!isSimulationRunning || !webGroupRef.current) return;
    webGroupRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 0.04;
  });

  const horizonRadius = 5.4;

  return (
    <group ref={webGroupRef}>
      {/* Central Local Group: Milky Way + Andromeda (M31 at 2.54 Mly) */}
      <GalaxyParticleField
        objectId="local_group_cluster"
        morphology="barred_spiral"
        position={[-0.9, 0, 0]}
        rotation={[0.35, 0, 0]}
        radius={1.25}
        armCount={4}
        seed={101}
        opacity={0.92}
        pointSize={0.045}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      <GalaxyParticleField
        objectId="andromeda_m31"
        morphology="grand_design_spiral"
        position={[1.35, 0.45, -0.5]}
        rotation={[-0.5, 0.3, 0.2]}
        radius={1.45}
        armCount={2}
        seed={31}
        opacity={0.92}
        pointSize={0.048}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Laniakea Supercluster & Cosmic Web Filament Network */}
      {hierarchyTier >= 4 &&
        filamentLines.map((pts, idx) => (
          <Line
            key={idx}
            points={pts}
            color={idx % 3 === 0 ? "#fbbf24" : "#38bdf8"}
            lineWidth={1.1}
            transparent
            opacity={0.35}
          />
        ))}

      <points
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("cosmic_web_filaments");
        }}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[insidePoints, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#fbbf24"
          transparent
          opacity={0.78}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Comoving Particle Horizon Sphere (R = 46.5 Gly — Observational Horizon, NOT a Physical Wall) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("observable_horizon_sphere");
        }}
      >
        <sphereGeometry args={[horizonRadius, 32, 24]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.22} />
      </mesh>

      {/* Unobservable Universe Continuation Outside the 46.5 Gly Horizon Sphere */}
      {showBeyondHorizon && (
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[outsidePoints, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            color="#818cf8"
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}

/**
 * Dispatcher for all 6 chapters of Module 01.
 */
export function Module01CinematicDirectorScene(props: Module01SceneProps) {
  const sceneComp: ProofOfConceptSceneComponentId =
    props.activeCue?.sceneComponentId ||
    ([
      "m01_ch1_earth_atmosphere",
      "m01_ch2_earth_home_system",
      "m01_ch3_earth_moon_system",
      "m01_ch4_solar_system_scale",
      "m01_ch5_milky_way_journey",
      "m01_ch6_observable_universe",
    ][props.activeCue?.layerOrPresetIndex ?? 0] as ProofOfConceptSceneComponentId) ||
    "m01_ch1_earth_atmosphere";

  switch (sceneComp) {
    case "m01_ch1_earth_atmosphere":
      return <EarthAtmosphereScene {...props} />;
    case "m01_ch2_earth_home_system":
      return <EarthHomeScene {...props} />;
    case "m01_ch3_earth_moon_system":
      return <EarthMoonScene {...props} />;
    case "m01_ch4_solar_system_scale":
      return <SolarSystemScaleScene {...props} />;
    case "m01_ch5_milky_way_journey":
      return <MilkyWayJourneyScene {...props} />;
    case "m01_ch6_observable_universe":
      return <ObservableUniverseScene {...props} />;
    default:
      return <EarthAtmosphereScene {...props} />;
  }
}
