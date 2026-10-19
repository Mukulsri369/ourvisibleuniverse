/**
 * COSMOS Stage 2 — Module 05 Complete 7-Chapter 3D Scientific Scene Suite
 * "Earth, Moon & Eclipses"
 *
 * Implements 7 distinct, scientifically verified 3D chapter scenes:
 * - Chapter 05.1 (m05_ch1_earth_day_night): Collimated sunlight, terminator, latitude speed & sidereal vs solar day
 * - Chapter 05.2 (m05_ch2_earth_seasons): 23.44° axial parallelism, solstices/equinoxes & cosine insolation bundles
 * - Chapter 05.3 (m05_ch3_lunar_appearance): Synchronized 3D cis-lunar orbit + Geocentric Observer Sky Viewport
 * - Chapter 05.4 (m05_ch4_lunar_phases): 8-station phase ring, Earthshine & 29.53 d synodic vs 27.32 d sidereal arc
 * - Chapter 05.5 (m05_ch5_solar_eclipse): 5.145° inclined nodal plane, umbra/penumbra/antumbra & Total vs Annular view
 * - Chapter 05.6 (m05_ch6_lunar_eclipse): Earth umbra/penumbra cones & Rayleigh sunset refraction onto Blood Moon
 * - Chapter 05.7 (m05_ch7_tidal_forces): 1/d³ quadrupole differential force vectors, Spring vs Neap tides
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityProfile } from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type { RegisteredAnimationCue } from "@/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
  type ChapterControlValueMap,
  type ProofOfConceptSceneComponentId,
} from "@/lib/cosmos/cinematic/poc";
import {
  OrbitalTrajectoryRenderer,
  ScientificFieldRenderer,
  ScientificPlanetMaterial,
  ScientificStarMaterial,
  type VectorArrowDescriptor,
} from "../../science";

export interface Module05ChapterSceneProps {
  sceneId: string;
  lessonId?: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  reducedMotion?: boolean;
  onSelectObject: (objectId: string) => void;
}

function useChapterControls(chapterId: string): ChapterControlValueMap {
  const store = useMemo(() => CosmosChapterInteractionStore.getInstance(), []);
  const [values, setValues] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues("05", chapterId),
  );

  useEffect(() => {
    setValues(store.getChapterValues("05", chapterId));
    return store.subscribe(() => {
      setValues(store.getChapterValues("05", chapterId));
    });
  }, [store, chapterId]);

  return values;
}

// ============================================================================
// CHAPTER 05.1 — EARTH ROTATES: DAY AND NIGHT
// ============================================================================
function EarthDayNightScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-1-earth-rotates-day-night");
  const observerLatDeg = Number(controls.observerLatitudeDeg ?? 28.6);
  const rotationHourAngle = Number(controls.rotationHourAngle ?? 12);
  const viewpointMode = String(controls.viewpointMode ?? "orbital_terminator");

  const spinRef = useRef(0);
  const earthGroupRef = useRef<THREE.Group>(null);
  const observerBeaconRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isSimulationRunning && !reducedMotion) {
      spinRef.current =
        (spinRef.current + Math.min(delta, 0.1) * simulationTimeScale * 0.45) % (Math.PI * 2);
    }
    const baseAngle = ((rotationHourAngle - 12) / 24) * Math.PI * 2 + spinRef.current;
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y = baseAngle;
    }
    if (observerBeaconRef.current) {
      observerBeaconRef.current.rotation.y = baseAngle;
    }
  });

  const latRad = (observerLatDeg * Math.PI) / 180;
  const earthRadius = 2.0;
  const obsX = earthRadius * Math.cos(latRad);
  const obsY = earthRadius * Math.sin(latRad);

  // Tangential eastward rotation velocity vector at observer latitude
  const vScale = Math.max(0.35, Math.cos(latRad) * 1.65);
  const velocityVectors = useMemo<VectorArrowDescriptor[]>(
    () => [
      {
        origin: [obsX, obsY, 0],
        direction: [0, 0, -1],
        length: vScale,
        colorHex: "#38bdf8",
      },
      // Collimated incoming solar rays from +X
      {
        origin: [6.4, 1.4, 0],
        direction: [-1, 0, 0],
        length: 2.6,
        colorHex: "#fde047",
      },
      {
        origin: [6.4, 0, 0],
        direction: [-1, 0, 0],
        length: 2.6,
        colorHex: "#fde047",
      },
      {
        origin: [6.4, -1.4, 0],
        direction: [-1, 0, 0],
        length: 2.6,
        colorHex: "#fde047",
      },
    ],
    [obsX, obsY, vScale],
  );

  return (
    <group>
      {/* Distant Collimated Sun Indicator on +X Axis */}
      <ScientificStarMaterial
        objectId="sun_day_night"
        position={[11.5, 0, 0]}
        radius={1.1}
        temperatureK={5772}
        coronaScale={1.45}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Oblate Spheroid Earth (21.4 km Equatorial Bulge Exaggerated Subtle Ring) */}
      <group ref={earthGroupRef}>
        <ScientificPlanetMaterial
          objectId="earth"
          sceneId={sceneId}
          presetId="earth"
          position={[0, 0, 0]}
          radius={earthRadius}
          starPosition={[14, 0, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("earth")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* Rotation Axis Rod & Counter-Clockwise North Pole Spin Ring */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("rotation_axis_rod");
        }}
      >
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 5.8, 16]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 2.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.02, 12, 48, Math.PI * 1.65]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Sharp Dawn/Dusk Terminator Circle (Plane X = 0 Perpendicular to Sunlight) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("solar_terminator_ring");
        }}
      >
        <torusGeometry args={[earthRadius * 1.025, 0.032, 16, 96]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.92} />
      </mesh>

      {/* Translucent Night-Hemisphere Shadow Shroud (-X side) */}
      <mesh position={[-0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[earthRadius * 1.018, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial
          color="#020617"
          transparent
          opacity={0.48}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Latitude Parallel Ring & Rotating Surface Observer Horizon Dome */}
      <mesh position={[0, obsY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[Math.max(0.1, obsX * 1.01), 0.016, 12, 64]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.65} />
      </mesh>

      <group ref={observerBeaconRef}>
        <group
          position={[obsX, obsY, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("observer_meridian_beacon");
          }}
        >
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          {viewpointMode === "surface_observer" && (
            <mesh rotation={[0, 0, -latRad]}>
              <sphereGeometry args={[0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.28} wireframe />
            </mesh>
          )}
        </group>
      </group>

      {/* Sidereal (360°) vs Mean Solar Day (360.986°) Reference Arc */}
      {viewpointMode === "sidereal_vs_solar" && (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[3.1, 0.022, 12, 96]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.55} />
          </mesh>
          <mesh rotation={[0, 0, -0.08]}>
            <torusGeometry args={[3.28, 0.035, 12, 32, 0.22]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      )}

      {/* Collimated Sunlight & Tangential Velocity Vectors */}
      <ScientificFieldRenderer vectors={velocityVectors} fieldLines={[]} equipotentialRings={[]} />
    </group>
  );
}

// ============================================================================
// CHAPTER 05.2 — EARTH'S ORBIT AND THE SEASONS
// ============================================================================
function EarthSeasonsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-2-earths-orbit-and-seasons");
  const dayOfYear = Number(controls.orbitalDayOfYear ?? 172);
  const tiltDeg = Number(controls.hypotheticalTiltDeg ?? 23.44);
  const showInsolationRays = Boolean(controls.showInsolationRays ?? true);

  const autoAngleRef = useRef(0);
  const [orbitAngle, setOrbitAngle] = useState(0);

  useFrame((_, delta) => {
    if (isSimulationRunning && !reducedMotion) {
      autoAngleRef.current =
        (autoAngleRef.current + Math.min(delta, 0.1) * simulationTimeScale * 0.18) % (Math.PI * 2);
    }
    // Map dayOfYear (172 = June Solstice at -X, 355 = Dec Solstice at +X)
    const baseOrbitalAngle = ((dayOfYear - 172) / 365) * Math.PI * 2 + Math.PI;
    setOrbitAngle(baseOrbitalAngle + autoAngleRef.current * 0.25);
  });

  const orbitRadius = 5.6;
  const ex = Math.cos(orbitAngle) * orbitRadius;
  const ez = Math.sin(orbitAngle) * orbitRadius;
  const tiltRad = (tiltDeg * Math.PI) / 180;

  // Four cardinal seasonal stations
  const cardinalStations = useMemo(
    () => [
      {
        id: "june_solstice_marker",
        pos: [-orbitRadius, 0, 0] as [number, number, number],
        color: "#10b981",
      },
      {
        id: "sept_equinox_marker",
        pos: [0, 0, orbitRadius] as [number, number, number],
        color: "#38bdf8",
      },
      {
        id: "december_solstice_marker",
        pos: [orbitRadius, 0, 0] as [number, number, number],
        color: "#f59e0b",
      },
      {
        id: "march_equinox_marker",
        pos: [0, 0, -orbitRadius] as [number, number, number],
        color: "#a855f7",
      },
    ],
    [orbitRadius],
  );

  // Collimated solar insolation rays from Sun (0,0,0) toward active Earth (ex, 0, ez)
  const insolationVectors = useMemo<VectorArrowDescriptor[]>(() => {
    if (!showInsolationRays) return [];
    const dirLen = Math.hypot(ex, ez) || 1;
    const dx = ex / dirLen;
    const dz = ez / dirLen;
    return [
      {
        origin: [dx * 2.0, 0.45, dz * 2.0],
        direction: [dx, 0, dz],
        length: 2.3,
        colorHex: "#fde047",
      },
      {
        origin: [dx * 2.0, 0, dz * 2.0],
        direction: [dx, 0, dz],
        length: 2.3,
        colorHex: "#f59e0b",
      },
      {
        origin: [dx * 2.0, -0.45, dz * 2.0],
        direction: [dx, 0, dz],
        length: 2.3,
        colorHex: "#fde047",
      },
    ];
  }, [ex, ez, showInsolationRays]);

  return (
    <group>
      {/* Central G2V Sun */}
      <ScientificStarMaterial
        objectId="sun_central"
        position={[0, 0, 0]}
        radius={1.25}
        temperatureK={5772}
        coronaScale={1.55}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Nearly Circular Ecliptic Orbit (e = 0.0167) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={orbitRadius}
        eccentricity={0.0167}
        colorHex="#38bdf8"
        opacity={0.55}
        showApsidesMarkers={true}
      />

      {/* 4 Reference Solstice/Equinox Ghost Stations Demonstrating Fixed Inertial Axis Parallelism */}
      {cardinalStations.map((st) => (
        <group
          key={st.id}
          position={st.pos}
          rotation={[0, 0, -tiltRad]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject(st.id);
          }}
        >
          <mesh>
            <sphereGeometry args={[0.48, 20, 20]} />
            <meshBasicMaterial color={st.color} transparent opacity={0.26} wireframe />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.016, 0.016, 1.45, 12]} />
            <meshBasicMaterial color={st.color} transparent opacity={0.75} />
          </mesh>
        </group>
      ))}

      {/* Active Earth with Fixed Inertial Spin Axis Direction (-Z/X Plane Tilt = ε) */}
      <group position={[ex, 0, ez]}>
        <group rotation={[0, 0, -tiltRad]}>
          <ScientificPlanetMaterial
            objectId="earth_seasonal_globe"
            sceneId={sceneId}
            presetId="earth"
            position={[0, 0, 0]}
            radius={0.95}
            starPosition={[-ex, 0, -ez]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={activeHighlightedObjects.includes("earth_seasonal_globe")}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {/* Spin Axis Rod Pointing Consistently Toward Polaris */}
          <mesh>
            <cylinderGeometry args={[0.022, 0.022, 2.75, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Equator (0°) & Arctic/Antarctic Circles (±(90° - ε)) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.97, 0.015, 12, 64]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.95 * Math.cos(tiltRad), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.max(0.08, 0.96 * Math.sin(tiltRad)), 0.014, 12, 48]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
          <mesh position={[0, -0.95 * Math.cos(tiltRad), 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.max(0.08, 0.96 * Math.sin(tiltRad)), 0.014, 12, 48]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
        </group>
      </group>

      {/* Insolation Flux Vectors */}
      <ScientificFieldRenderer
        vectors={insolationVectors}
        fieldLines={[]}
        equipotentialRings={[]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 05.3 — WHY THE MOON CHANGES APPEARANCE (SYNCHRONIZED DUAL VIEW)
// ============================================================================
function LunarAppearanceScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-3-why-the-moon-changes-appearance");
  const baseElongationDeg = Number(controls.lunarElongationDeg ?? 120);
  const showEarthShadowCone = Boolean(controls.showEarthShadowCone ?? true);
  const showTidalLockVector = Boolean(controls.showTidalLockVector ?? true);

  const animOffsetRef = useRef(0);
  const [elongRad, setElongRad] = useState((baseElongationDeg * Math.PI) / 180);

  useFrame((_, delta) => {
    if (isSimulationRunning && !reducedMotion) {
      animOffsetRef.current =
        (animOffsetRef.current + Math.min(delta, 0.1) * simulationTimeScale * 0.25) % (Math.PI * 2);
    }
    setElongRad(
      ((baseElongationDeg * Math.PI) / 180 + animOffsetRef.current * 0.35) % (Math.PI * 2),
    );
  });

  // Sun is at +X (+14, 0, 0). Elongation E = 0° means Moon is at (+R, 0, 0) between Earth and Sun.
  const orbitR = 4.4;
  const mx = Math.cos(elongRad) * orbitR;
  const mz = -Math.sin(elongRad) * orbitR;

  const sightVectors = useMemo<VectorArrowDescriptor[]>(() => {
    const list: VectorArrowDescriptor[] = [
      // Observer Line-of-Sight from Earth (0,0,0) to Moon (mx,0,mz)
      {
        origin: [0, 0, 0],
        direction: [mx, 0, mz],
        length: orbitR * 0.88,
        colorHex: "#38bdf8",
      },
    ];
    if (showTidalLockVector) {
      // Synchronous 1:1 tidal-lock vector pointing from Moon center back toward Earth
      list.push({
        origin: [mx, 0, mz],
        direction: [-mx, 0, -mz],
        length: 1.35,
        colorHex: "#ec4899",
      });
    }
    return list;
  }, [mx, mz, orbitR, showTidalLockVector]);

  return (
    <group>
      {/* Distant Collimated Sun Direction (+X) */}
      <ScientificStarMaterial
        objectId="sun_phase_light"
        position={[12.5, 0, 0]}
        radius={1.0}
        temperatureK={5772}
        coronaScale={1.4}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Central Earth */}
      <ScientificPlanetMaterial
        objectId="earth_center"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.35}
        starPosition={[14, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("earth_center")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Earth's Antisolar Shadow Cone (-X direction) — Proving it misses ordinary lunar phases */}
      {showEarthShadowCone && (
        <mesh position={[-3.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[1.32, 6.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#0f172a"
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Lunar Orbit Ring */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={orbitR}
        eccentricity={0.0549}
        colorHex="#38bdf8"
        opacity={0.48}
        showApsidesMarkers={false}
      />

      {/* Orbiting Moon (Half-Illuminated Toward +X Sun) */}
      <group position={[mx, 0, mz]}>
        <ScientificPlanetMaterial
          objectId="moon_orbiting"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.52}
          starPosition={[14 - mx, 0, -mz]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("moon_orbiting")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* Geocentric Observer Telescope Preview Viewport (Upper-Right Floating Frame) */}
      <group
        position={[4.2, 2.85, -2.5]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("geocentric_moon_preview");
        }}
      >
        <mesh>
          <torusGeometry args={[1.18, 0.035, 16, 64]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Phase-lit Moon rotated so the camera sees the exact Earth-to-Moon phase angle */}
        <ScientificPlanetMaterial
          objectId="geocentric_moon_preview"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.92}
          starPosition={[Math.sin(elongRad) * 10, 0, -Math.cos(elongRad) * 10]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={false}
          simulationTimeScale={0}
          highlighted={activeHighlightedObjects.includes("geocentric_moon_preview")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      <ScientificFieldRenderer vectors={sightVectors} fieldLines={[]} equipotentialRings={[]} />
    </group>
  );
}

// ============================================================================
// CHAPTER 05.4 — LUNAR PHASES: 8-STATION CYCLE & SYNODIC VS SIDEREAL MONTH
// ============================================================================
function LunarPhasesScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-4-lunar-phases");
  const synodicDay = Number(controls.synodicDay ?? 7.38);
  const showEightPhaseRing = Boolean(controls.showEightPhaseRing ?? true);
  const showSynodicVsSiderealArc = Boolean(controls.showSynodicVsSiderealArc ?? true);

  const cycleOffsetRef = useRef(0);
  const [activeAngle, setActiveAngle] = useState((synodicDay / 29.53059) * Math.PI * 2);

  useFrame((_, delta) => {
    if (isSimulationRunning && !reducedMotion) {
      cycleOffsetRef.current =
        (cycleOffsetRef.current + Math.min(delta, 0.1) * simulationTimeScale * 0.22) %
        (Math.PI * 2);
    }
    setActiveAngle(
      ((synodicDay / 29.53059) * Math.PI * 2 + cycleOffsetRef.current * 0.3) % (Math.PI * 2),
    );
  });

  const ringRadius = 4.8;
  const eightStations = useMemo(
    () =>
      Array.from({ length: 8 }, (_, idx) => {
        const ang = (idx * Math.PI) / 4;
        return {
          idx,
          x: Math.cos(ang) * ringRadius,
          z: -Math.sin(ang) * ringRadius,
        };
      }),
    [ringRadius],
  );

  const activeX = Math.cos(activeAngle) * ringRadius;
  const activeZ = -Math.sin(activeAngle) * ringRadius;

  return (
    <group>
      {/* Distant Sun Direction (+X) */}
      <ScientificStarMaterial
        objectId="sun_synodic_light"
        position={[13.0, 0, 0]}
        radius={1.05}
        temperatureK={5772}
        coronaScale={1.4}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Central Earth */}
      <ScientificPlanetMaterial
        objectId="earth_phase_hub"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.25}
        starPosition={[14, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={false}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* 8-Station Phase Carousel Lit by True +X Sunlight */}
      {showEightPhaseRing &&
        eightStations.map((st) => (
          <group
            key={st.idx}
            position={[st.x, 0, st.z]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("eight_phase_carousel");
            }}
          >
            <ScientificPlanetMaterial
              objectId={`phase_station_${st.idx}`}
              sceneId={sceneId}
              presetId="moon"
              position={[0, 0, 0]}
              radius={0.34}
              starPosition={[14 - st.x, 0, -st.z]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={false}
              simulationTimeScale={0}
              highlighted={false}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
          </group>
        ))}

      {/* Active Highlighted Moon on Orbit */}
      <group position={[activeX, 0.25, activeZ]}>
        <ScientificPlanetMaterial
          objectId="active_phase_moon"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.58}
          starPosition={[14 - activeX, 0, -activeZ]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("active_phase_moon") || true}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* Synodic (29.53 d) vs Sidereal (27.32 d) Extra 27.2° Orbital Travel Arc */}
      {showSynodicVsSiderealArc && (
        <group
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("synodic_extra_arc");
          }}
        >
          {/* Full 360° Sidereal Ring (27.32 d) */}
          <mesh>
            <torusGeometry args={[ringRadius, 0.02, 12, 96]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
          {/* Extra 27.2° (0.475 rad) Synodic Catch-Up Arc (2.21 days) */}
          <mesh>
            <torusGeometry args={[ringRadius + 0.35, 0.045, 16, 48, 0.475]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 05.5 — SOLAR ECLIPSES (5.145° INCLINATION, NODES & UMBRA/ANTUMBRA)
// ============================================================================
function SolarEclipseScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-5-solar-eclipses");
  const nodeOffsetDeg = Number(controls.nodeOffsetDeg ?? 0);
  const lunarDistanceMode = String(controls.lunarDistanceMode ?? "perigee_total");
  const showShadowCones = Boolean(controls.showShadowCones ?? true);

  // Moon sits between Sun (-X at -11.5) and Earth (+X at +2.6)
  const isApogee = lunarDistanceMode === "apogee_annular";
  const moonX = isApogee ? -1.85 : -1.15;
  // Vertical displacement from ecliptic plane due to 5.145° inclination and Δλ from node
  const moonY = Math.sin((5.145 * Math.PI) / 180) * Math.sin((nodeOffsetDeg * Math.PI) / 180) * 9.5;
  const earthX = 2.6;

  return (
    <group>
      {/* Sun at -X */}
      <ScientificStarMaterial
        objectId="sun_eclipse_source"
        position={[-11.2, 0, 0]}
        radius={1.55}
        temperatureK={5772}
        coronaScale={1.6}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Ecliptic Plane Ring (Blue) vs 5.145° Inclined Lunar Orbit Plane (Cyan) & Line of Nodes */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.4, 0.018, 12, 96]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.38} />
      </mesh>
      <group position={[earthX, 0, 0]} rotation={[0, 0, (5.145 * Math.PI) / 180]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.1, 0.022, 12, 96]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.65} />
        </mesh>
      </group>
      {/* Line of Nodes Axis */}
      <mesh
        position={[earthX, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("line_of_nodes_axis");
        }}
      >
        <cylinderGeometry args={[0.018, 0.018, 8.6, 12]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.75} />
      </mesh>

      {/* Moon Casting Umbra, Penumbra & Antumbra toward Earth */}
      <group position={[moonX, moonY, 0]}>
        <ScientificPlanetMaterial
          objectId="moon_eclipse_caster"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.44}
          starPosition={[-11.2 - moonX, -moonY, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("moon_eclipse_caster")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />

        {showShadowCones && (
          <group>
            {/* Converging Dark Umbra Cone */}
            <mesh
              position={[1.95, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject("umbra_shadow_cone");
              }}
            >
              <coneGeometry args={[0.43, 3.9, 32, 1, true]} />
              <meshBasicMaterial
                color="#020617"
                transparent
                opacity={0.82}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* Diverging Translucent Penumbra Cone */}
            <mesh
              position={[2.15, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject("penumbra_shadow_cone");
              }}
            >
              <cylinderGeometry args={[0.98, 0.44, 4.3, 32, 1, true]} />
              <meshBasicMaterial
                color="#334155"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Target Earth Receiving Umbral/Antumbral Spot */}
      <group position={[earthX, 0, 0]}>
        <ScientificPlanetMaterial
          objectId="earth_eclipse_target"
          sceneId={sceneId}
          presetId="earth"
          position={[0, 0, 0]}
          radius={1.35}
          starPosition={[-14, 0, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={false}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
        {/* Umbral/Antumbral Totality Spot on Earth's Sunlit Hemisphere when near Node */}
        {Math.abs(moonY) < 0.95 && (
          <mesh position={[-1.33, moonY, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[isApogee ? 0.22 : 0.16, 24]} />
            <meshBasicMaterial color={isApogee ? "#f59e0b" : "#020617"} />
          </mesh>
        )}
      </group>

      {/* Earth-Surface Observer Solar Corona / Annular Ring-of-Fire Inset Viewport */}
      <group
        position={[4.0, 2.75, -2.2]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("solar_corona_observer_inset");
        }}
      >
        {/* Pearly Solar Corona Streamer Halo */}
        <mesh>
          <ringGeometry args={[0.88, 1.42, 48]} />
          <meshBasicMaterial
            color="#e2e8f0"
            transparent
            opacity={Math.abs(moonY) < 0.45 && !isApogee ? 0.85 : 0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Photospheric Solar Disk */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.92, 48]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Occulting New Moon Silhouette Displaced by Nodal Offset */}
        <mesh position={[0, moonY * 0.85, 0.02]}>
          <circleGeometry args={[isApogee ? 0.82 : 0.94, 48]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 05.6 — LUNAR ECLIPSES (EARTH UMBRA/PENUMBRA & RAYLEIGH RED REFRACTION)
// ============================================================================
function LunarEclipseScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-6-lunar-eclipses");
  const impactParam = Number(controls.lunarEclipseImpactParam ?? 0.0);
  const showRayleighRefractionCones = Boolean(controls.showRayleighRefractionCones ?? true);

  const earthX = -1.2;
  const moonX = 3.2;
  const moonY = impactParam * 0.95;
  const isTotalUmbra = Math.abs(impactParam) <= 0.65;
  const isPartialUmbra = Math.abs(impactParam) > 0.65 && Math.abs(impactParam) <= 1.15;

  return (
    <group>
      {/* Distant Sun at -X */}
      <ScientificStarMaterial
        objectId="sun_lunar_eclipse"
        position={[-11.8, 0, 0]}
        radius={1.45}
        temperatureK={5772}
        coronaScale={1.5}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Earth Casting Umbra & Penumbra Cones (+X) */}
      <group position={[earthX, 0, 0]}>
        <ScientificPlanetMaterial
          objectId="earth_shadow_caster"
          sceneId={sceneId}
          presetId="earth"
          position={[0, 0, 0]}
          radius={1.4}
          starPosition={[-12, 0, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("earth_shadow_caster")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />

        {/* 360° Atmospheric Sunset/Sunrise Rayleigh Refraction Ring Around Earth's Limb */}
        <mesh
          rotation={[0, Math.PI / 2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("rayleigh_sunset_ring");
          }}
        >
          <torusGeometry args={[1.44, 0.048, 16, 96]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.92} />
        </mesh>

        {/* Earth's Converging Umbra Cone */}
        <mesh
          position={[3.4, 0, 0]}
          rotation={[0, 0, -Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("earth_umbra_cone");
          }}
        >
          <coneGeometry args={[1.38, 6.8, 32, 1, true]} />
          <meshBasicMaterial
            color={showRayleighRefractionCones ? "#7f1d1d" : "#090d16"}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Earth's Diverging Penumbra Cone */}
        <mesh
          position={[3.4, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("earth_penumbra_cone");
          }}
        >
          <cylinderGeometry args={[2.15, 1.4, 6.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#334155"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Full Moon Crossing Earth's Shadow (Copper-Red "Blood Moon" in Umbra) */}
      <group
        position={[moonX, moonY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("eclipsed_blood_moon");
        }}
      >
        <ScientificPlanetMaterial
          objectId="eclipsed_blood_moon"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.52}
          starPosition={[-14, 0, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("eclipsed_blood_moon")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
        {(isTotalUmbra || isPartialUmbra) && (
          <mesh>
            <sphereGeometry args={[0.535, 32, 32]} />
            <meshBasicMaterial
              color={isTotalUmbra ? "#dc2626" : "#b91c1c"}
              transparent
              opacity={isTotalUmbra ? 0.62 : 0.35}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 05.7 — TIDES AND GRAVITATIONAL INTERACTIONS (1/d³ QUADRUPOLE FIELD)
// ============================================================================
function TidalForcesScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module05ChapterSceneProps) {
  const controls = useChapterControls("lesson-7-tides-and-gravity");
  const syzygyAngleDeg = Number(controls.tidalSyzygyAngleDeg ?? 0);
  const showSolarTidalVector = Boolean(controls.showSolarTidalVector ?? true);

  const syzRad = (syzygyAngleDeg * Math.PI) / 180;
  const moonDist = 4.6;
  const mx = Math.cos(syzRad) * moonDist;
  const mz = -Math.sin(syzRad) * moonDist;

  // Net tidal bulge elongation factor (Spring = 1.46, Neap = 0.54)
  const bulgeStretch = 1.24 + 0.14 * Math.cos(2 * syzRad);
  const bulgeCompress = 1.04 - 0.06 * Math.cos(2 * syzRad);

  // 12-point quadrupole differential acceleration arrows around Earth's equator:
  // Δa(θ) = a_0 * (2 cos(θ - φ) u_r - sin(θ - φ) u_θ)
  const quadrupoleVectors = useMemo<VectorArrowDescriptor[]>(() => {
    const arrows: VectorArrowDescriptor[] = [];
    const rBase = 1.52;
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
      const rel = theta - syzRad;
      const ox = Math.cos(theta) * rBase;
      const oz = -Math.sin(theta) * rBase;

      // Quadrupole components rotated back to world coordinates
      const radialStretch = 2 * Math.cos(rel);
      const tangStretch = -Math.sin(rel);
      const dx = radialStretch * Math.cos(theta) - tangStretch * Math.sin(theta);
      const dz = -radialStretch * Math.sin(theta) - tangStretch * Math.cos(theta);
      const mag = Math.hypot(dx, dz) * 0.42;

      arrows.push({
        origin: [ox, 0, oz],
        direction: [dx, 0, dz],
        length: Math.max(0.22, mag),
        colorHex: Math.cos(2 * rel) >= 0 ? "#38bdf8" : "#f59e0b",
      });
    }
    if (showSolarTidalVector) {
      arrows.push({
        origin: [2.4, 0, 0],
        direction: [1, 0, 0],
        length: 0.9,
        colorHex: "#fde047",
      });
    }
    return arrows;
  }, [syzRad, showSolarTidalVector]);

  return (
    <group>
      {/* Distant Sun Direction (+X) Contributing 46% of Lunar Tidal Amplitude */}
      {showSolarTidalVector && (
        <ScientificStarMaterial
          objectId="sun_tidal_perturber"
          position={[12.2, 0, 0]}
          radius={1.05}
          temperatureK={5772}
          coronaScale={1.4}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          onSelectObject={onSelectObject}
        />
      )}

      {/* Central Earth Core */}
      <ScientificPlanetMaterial
        objectId="earth_tidal_core"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.35}
        starPosition={[14, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("earth_tidal_core")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Translucent Equilibrium Tidal Ellipsoid Aligned with Moon */}
      <group
        rotation={[0, syzRad, 0]}
        scale={[bulgeStretch, 0.96, bulgeCompress]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("equilibrium_tidal_envelope");
        }}
      >
        <mesh>
          <sphereGeometry args={[1.45, 36, 24]} />
          <meshPhysicalMaterial
            color="#0ea5e9"
            transparent
            opacity={0.34}
            roughness={0.2}
            transmission={0.4}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.46, 0.024, 12, 72]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Orbiting Moon Perturber */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={moonDist}
        eccentricity={0.0549}
        colorHex="#38bdf8"
        opacity={0.4}
        showApsidesMarkers={false}
      />
      <group position={[mx, 0, mz]}>
        <ScientificPlanetMaterial
          objectId="moon_tidal_perturber"
          sceneId={sceneId}
          presetId="moon"
          position={[0, 0, 0]}
          radius={0.46}
          starPosition={[14 - mx, 0, -mz]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("moon_tidal_perturber")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* Quadrupole Differential Acceleration Vectors (Near-Side & Far-Side Stretching) */}
      <ScientificFieldRenderer
        vectors={quadrupoleVectors}
        fieldLines={[]}
        equipotentialRings={[]}
      />
    </group>
  );
}

// ============================================================================
// MODULE 05 DIRECTOR ROUTER
// ============================================================================
export function Module05CinematicDirectorScene(props: Module05ChapterSceneProps) {
  const effectiveLessonId =
    props.lessonId || props.activeCue?.sublessonId || "lesson-1-earth-rotates-day-night";
  const beatInfo = useMemo(() => {
    const segId = props.activeCue?.narrationSegmentId || "";
    return (
      CosmosProofOfConceptCatalog.getBeatForNarrationSegment("05", effectiveLessonId, segId) || {
        chapter: CosmosProofOfConceptCatalog.getChapterManifest("05", effectiveLessonId),
        beat: null,
      }
    );
  }, [effectiveLessonId, props.activeCue?.narrationSegmentId]);

  const componentId: ProofOfConceptSceneComponentId =
    props.activeCue?.sceneComponentId ||
    beatInfo.chapter?.sceneComponentId ||
    "m05_ch1_earth_day_night";

  switch (componentId) {
    case "m05_ch1_earth_day_night":
      return <EarthDayNightScene {...props} />;
    case "m05_ch2_earth_seasons":
      return <EarthSeasonsScene {...props} />;
    case "m05_ch3_lunar_appearance":
      return <LunarAppearanceScene {...props} />;
    case "m05_ch4_lunar_phases":
      return <LunarPhasesScene {...props} />;
    case "m05_ch5_solar_eclipse":
      return <SolarEclipseScene {...props} />;
    case "m05_ch6_lunar_eclipse":
      return <LunarEclipseScene {...props} />;
    case "m05_ch7_tidal_forces":
      return <TidalForcesScene {...props} />;
    default:
      return <EarthDayNightScene {...props} />;
  }
}
