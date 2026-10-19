/**
 * COSMOS Stage 6 — Module 22 (Space Exploration & Historic Missions)
 * Complete 8-Chapter Bespoke 3D Scene Suite (43 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 22.1 (`sublesson-1-satellites`) — Dawn of the Space Age (Sputnik 1 1957, Vostok 1 1961 & LEO v_orb = √(GM/r) ≈ 7.8 km/s)
 * 22.2 (`sublesson-2-moon-landings`) — The Apollo Lunar Program (Saturn V, Apollo 11 Eagle 1969, 382 kg Lunar Samples & Laser Ranging)
 * 22.3 (`sublesson-3-voyager`) — Voyager 1 & 2 Grand Tour (175-Year Outer Planet Gravity Assists, Heliopause ~120 AU & Golden Record)
 * 22.4 (`sublesson-4-mars-rovers`) — Robotic Explorers of Mars (Viking -> Sojourner -> Spirit/Opportunity -> Curiosity -> Perseverance/Ingenuity)
 * 22.5 (`sublesson-5-outer-planet-probes`) — Outer Planet Flagships (Galileo, Cassini-Huygens Enceladus/Titan & Juno Polar Magnetosphere)
 * 22.6 (`sublesson-6-small-body-missions`) — Small-Body & Sample-Return Pioneers (New Horizons Pluto, Rosetta 67P & Hayabusa2/OSIRIS-REx Bennu)
 * 22.7 (`sublesson-7-indian-space-program`) — India's Space Milestones (ISRO Aryabhata, Chandrayaan-1 H₂O/OH, MOM, Chandrayaan-3 South Pole & Aditya-L1)
 * 22.8 (`sublesson-8-future-missions`) — Future Horizons (Artemis, Mars Sample Return, Europa Clipper, Dragonfly, LISA & Habitable Worlds Observatory)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module22ChapterSceneProps {
  sceneComponentId: ProofOfConceptSceneComponentId;
  chapterId: string;
  activeBeatIndex: number;
  highlightedObjectIds: string[];
  timeScale: number;
  isPaused: boolean;
  showLabels: boolean;
  reducedMotion: boolean;
  qualityTier?: "HIGH_QUALITY" | "BALANCED_QUALITY" | "LOW_POWER_QUALITY";
  onSelectObject?: (objectId: string) => void;
}

function useChapterControls(chapterId: string) {
  const store = CosmosChapterInteractionStore.getInstance();
  const version = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getSnapshotVersion(),
  );
  return useMemo(() => {
    void version;
    return store.getChapterValues("22", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#fbbf24",
  visible = true,
}: {
  position: [number, number, number];
  title: string;
  subtitle?: string;
  color?: string;
  visible?: boolean;
}) {
  if (!visible) return null;
  return (
    <Html position={position} center distanceFactor={14} zIndexRange={[10, 0]}>
      <div
        className="pointer-events-none select-none whitespace-nowrap rounded-lg border px-2.5 py-1 text-[10px] shadow-xl backdrop-blur-md"
        style={{
          borderColor: `${color}66`,
          backgroundColor: "rgba(4, 9, 22, 0.88)",
          color: "#f8fafc",
        }}
      >
        <div className="font-mono font-bold tracking-wider" style={{ color }}>
          {title}
        </div>
        {subtitle && <div className="text-[9px] text-slate-300">{subtitle}</div>}
      </div>
    </Html>
  );
}

// ============================================================================
// CHAPTER 22.1 — DAWN OF THE SPACE AGE: SPUTNIK 1 & LEO ORBITAL VELOCITY
// ============================================================================
const Ch1SputnikLeoMechanicsScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  isPaused,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const altKm = Math.max(200, Number(controls.orbitalAltitudeKm ?? 400));
  const rKm = 6371 + altKm;
  const vOrbKms = Math.sqrt(398600.4418 / rKm);
  const orbitRadius = Math.min(3.1, 1.35 + (altKm / 35786) * 1.75);
  const satRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (isPaused || reducedMotion || !satRef.current) return;
    const t = clock.getElapsedTime() * 0.7;
    satRef.current.position.set(Math.cos(t) * orbitRadius, 0.15 * Math.sin(t), Math.sin(t) * orbitRadius);
  });

  return (
    <group onClick={() => onSelectObject?.("voyager_deep_space_probe")}>
      {/* Earth Globe */}
      <Sphere args={[1.15, 36, 36]}>
        <meshStandardMaterial color="#1d4ed8" roughness={0.55} />
      </Sphere>
      {/* Orbital Trajectory Ring */}
      <Ring args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
      </Ring>
      {/* Sputnik 1 Polished 58 cm Sphere + 4 Whip Antennas */}
      <group ref={satRef} position={[orbitRadius, 0, 0]}>
        <Sphere args={[0.16, 24, 24]}>
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.08} />
        </Sphere>
        {[0.3, -0.3, 0.6, -0.6].map((ang, idx) => (
          <Line
            key={`whip-${idx}`}
            points={[
              [0, 0, 0],
              [-0.65, ang * 0.5, (idx % 2 === 0 ? 1 : -1) * 0.25],
            ]}
            color="#cbd5e1"
            lineWidth={1.6}
          />
        ))}
      </group>

      <SceneLabel
        position={[0, 2.55, 0]}
        title={`SPUTNIK 1 (1957) & ORBITAL MECHANICS: v_orb = √(GM/r) = ${vOrbKms.toFixed(2)} km/s`}
        subtitle={`Altitude h = ${altKm.toLocaleString()} km • Escape Speed v_esc = √2 v_orb = ${(vOrbKms * Math.SQRT2).toFixed(2)} km/s`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.2 — THE APOLLO LUNAR PROGRAM (SATURN V, EAGLE & 382 KG SAMPLES)
// ============================================================================
const Ch2ApolloLunarProgramScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const site = String(controls.apolloSite ?? "apollo11_tranquility");

  return (
    <group onClick={() => onSelectObject?.("chandrayaan3_vikram_pragyan")}>
      {/* Lunar Regolith Surface */}
      <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#64748b" roughness={0.92} />
      </mesh>

      {/* Apollo Lunar Module Descent + Ascent Stage */}
      <group position={[-0.6, -0.65, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.5, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.48, 0]}>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>

      {/* Lunar Laser Ranging Retroreflector Array (3.8 cm/yr Recession) */}
      <group position={[1.45, -1.05, 0.35]}>
        <mesh rotation={[-0.4, -0.5, 0]}>
          <boxGeometry args={[0.45, 0.32, 0.08]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
        </mesh>
        <Line points={[[0, 0, 0], [2.2, 2.8, 0]]} color="#22c55e" lineWidth={2.0} />
      </group>

      <SceneLabel
        position={[0, 2.45, 0]}
        title="APOLLO LUNAR EXPLORATION (1969–1972) • 382 kg RADIOMETRIC SAMPLES"
        subtitle={`Site: ${site.replace(/_/g, " ").toUpperCase()} • Laser Retroreflector Measures +3.8 cm/yr Lunar Recession`}
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.3 — VOYAGER 1 & 2 GRAND TOUR & HELIOPAUSE (~120 AU)
// ============================================================================
const Ch3VoyagerGrandTourScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const distAu = Math.max(1, Number(controls.heliocentricDistanceAu ?? 165));
  const lightHours = (distAu * 499.005) / 3600;
  const probeX = Math.min(3.2, -2.2 + (distAu / 170) * 5.0);

  return (
    <group onClick={() => onSelectObject?.("voyager_deep_space_probe")}>
      {/* Sun & 120 AU Heliopause Boundary Shell */}
      <Sphere args={[0.32, 24, 24]} position={[-2.4, 0, 0]}>
        <meshBasicMaterial color="#fde047" />
      </Sphere>
      <Ring args={[2.95, 3.05, 64]} position={[-2.4, 0, 0]}>
        <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} transparent opacity={0.65} />
      </Ring>

      {/* Voyager Spacecraft with 3.7 m High-Gain Dish & Golden Record */}
      <group position={[probeX, 0.25, 0]}>
        <Ring args={[0.08, 0.52, 32]} rotation={[0, Math.PI / 2, 0]}>
          <meshStandardMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </Ring>
        {/* Golden Phonograph Record Plaque */}
        <Sphere args={[0.12, 16, 16]} position={[0.15, -0.12, 0.22]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </Sphere>
      </group>

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`VOYAGER GRAND TOUR & INTERSTELLAR MEDIUM (${distAu.toFixed(0)} AU)`}
        subtitle={`One-Way Light Time = ${lightHours.toFixed(2)} hr • Crossed Heliopause at ~120 AU (${
          distAu >= 120 ? "INTERSTELLAR SPACE" : "INSIDE HELIOSPHERE"
        })`}
        color="#a855f7"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.4 — ROBOTIC EXPLORERS OF MARS (JEZERO DELTA & PERSEVERANCE)
// ============================================================================
const Ch4MarsRoversTimelineScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const era = String(controls.marsMissionEra ?? "perseverance_jezero_2021");

  return (
    <group onClick={() => onSelectObject?.("mars_rover_and_bennu_target")}>
      {/* Martian Rust-Oxide Terrain & Ancient Jezero Lakebed Clays */}
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshStandardMaterial color="#b45309" roughness={0.88} />
      </mesh>

      {/* 6-Wheeled Mars Rover Chassis + Mastcam-Z / SuperCam */}
      <group position={[0, -0.65, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.42, 0.78]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0.42, 0.55, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 12]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[0.45, 0.92, 0]}>
          <boxGeometry args={[0.26, 0.18, 0.32]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Ingenuity Rotorcraft Coaxial Helicopter */}
      <group position={[1.45, 0.75, -0.4]}>
        <Sphere args={[0.14, 16, 16]}>
          <meshStandardMaterial color="#38bdf8" />
        </Sphere>
        <Ring args={[0.05, 0.52, 24]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
          <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} />
        </Ring>
      </group>

      <SceneLabel
        position={[0, 2.45, 0]}
        title="MARS ROBOTIC EXPLORATION: FOLLOW THE WATER TO SAMPLE CACHE"
        subtitle={`Active Mission: ${era.replace(/_/g, " ").toUpperCase()} • Hematite, Clays & Sealed Rock Cores`}
        color="#f97316"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.5 — OUTER PLANET FLAGSHIPS (CASSINI-HUYGENS, GALILEO & JUNO)
// ============================================================================
const Ch5OuterPlanetFlagshipsScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const flagship = String(controls.outerFlagship ?? "cassini_huygens_saturn");

  return (
    <group onClick={() => onSelectObject?.("voyager_deep_space_probe")}>
      {/* Saturn / Gas Giant with Ring System */}
      <Sphere args={[1.15, 36, 36]} position={[-0.8, 0, 0]}>
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </Sphere>
      <Ring args={[1.45, 2.35, 64]} position={[-0.8, 0, 0]} rotation={[1.15, 0.25, 0]}>
        <meshStandardMaterial color="#fef08a" side={THREE.DoubleSide} transparent opacity={0.72} />
      </Ring>

      {/* Enceladus South Polar Cryovolcanic Plume */}
      <group position={[2.1, -0.45, 0]}>
        <Sphere args={[0.32, 24, 24]}>
          <meshStandardMaterial color="#e0f2fe" roughness={0.25} />
        </Sphere>
        <Line points={[[0, -0.32, 0], [0, -1.35, 0]]} color="#38bdf8" lineWidth={3.0} />
      </group>

      <SceneLabel
        position={[0, 2.5, 0]}
        title="OUTER PLANET FLAGSHIPS: GALILEO, CASSINI-HUYGENS & JUNO"
        subtitle={`Selected Flagship: ${flagship.replace(/_/g, " ").toUpperCase()} • Enceladus H₂/Silica Plumes & Titan Lakes`}
        color="#eab308"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.6 — SMALL-BODY & SAMPLE-RETURN PIONEERS (BENNU, RYUGU & 67P)
// ============================================================================
const Ch6SmallBodySampleReturnScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const target = String(controls.smallBodyTarget ?? "osiris_rex_bennu");

  return (
    <group onClick={() => onSelectObject?.("mars_rover_and_bennu_target")}>
      {/* Diamond-Shaped Carbonaceous Rubble-Pile Asteroid 101955 Bennu */}
      <mesh rotation={[0.25, 0.6, 0]}>
        <octahedronGeometry args={[1.25, 1]} />
        <meshStandardMaterial color="#334155" roughness={0.95} flatShading />
      </mesh>

      {/* OSIRIS-REx Touch-And-Go Sample Acquisition Arm (TAGSAM) */}
      <group position={[0, 1.85, 0]}>
        <mesh>
          <boxGeometry args={[0.65, 0.5, 0.55]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
        <Line points={[[0, -0.25, 0], [0, -0.65, 0]]} color="#38bdf8" lineWidth={2.5} />
      </group>

      <SceneLabel
        position={[0, 2.6, 0]}
        title="PRISTINE SOLAR SYSTEM TIME CAPSULES (4.56 Gyr CARBONACEOUS SAMPLES)"
        subtitle={`Target: ${target.replace(/_/g, " ").toUpperCase()} • Hydrated Phyllosilicates, Amino Acids & Nucleobases`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.7 — INDIA'S SPACE MILESTONES (CHANDRAYAAN-3 SOUTH POLE & ADITYA-L1)
// ============================================================================
const Ch7IsroChandrayaanAdityaScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const mission = String(controls.isroMission ?? "chandrayaan3_shiv_shakti");

  return (
    <group onClick={() => onSelectObject?.("chandrayaan3_vikram_pragyan")}>
      {/* Lunar South Polar Highland Terrain (69.37°S Shiv Shakti Point) */}
      <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 48]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>

      {/* Chandrayaan-3 Vikram Lander + ChaSTE Thermal Probe */}
      <group position={[-0.75, -0.68, 0]}>
        <mesh>
          <boxGeometry args={[0.92, 0.72, 0.92]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.82} roughness={0.22} />
        </mesh>
        {/* ChaSTE 10 cm Thermal Probe into Regolith */}
        <Line points={[[0.52, -0.1, 0], [0.52, -0.65, 0]]} color="#ef4444" lineWidth={3.0} />
      </group>

      {/* Pragyan 6-Wheeled Rover + LIBS/APXS Sulfur Detection */}
      <group position={[1.15, -1.02, 0.25]}>
        <mesh>
          <boxGeometry args={[0.55, 0.24, 0.42]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.75} roughness={0.28} />
        </mesh>
        <Line points={[[0.28, 0, 0], [0.75, -0.22, 0]]} color="#38bdf8" lineWidth={2.4} />
      </group>

      <SceneLabel
        position={[0, 2.5, 0]}
        title="ISRO MILESTONES: CHANDRAYAAN-1 H₂O, MOM, CHANDRAYAAN-3 (69.37°S) & ADITYA-L1"
        subtitle={`Mission Focus: ${mission.replace(/_/g, " ").toUpperCase()} • ChaSTE ΔT ≈ 60 K in Top 10 cm & Pragyan LIBS Sulfur`}
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 22.8 — FUTURE HORIZONS (ARTEMIS, EUROPA CLIPPER, LISA & HWO)
// ============================================================================
const Ch8FutureMissionsHorizonScene: React.FC<Module22ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const flagship = String(controls.futureFlagship ?? "lisa_space_gw");

  // LISA 2.5 Million km Equilateral Laser Triangle
  const r = 1.85;
  const vertices: [number, number, number][] = [
    [0, r, 0],
    [-r * Math.cos(Math.PI / 6), -r * Math.sin(Math.PI / 6), 0],
    [r * Math.cos(Math.PI / 6), -r * Math.sin(Math.PI / 6), 0],
  ];

  return (
    <group onClick={() => onSelectObject?.("voyager_deep_space_probe")}>
      {/* LISA 3-Spacecraft Laser Interferometer Constellation */}
      {vertices.map((pos, idx) => (
        <Sphere key={`lisa-sc-${idx}`} args={[0.2, 24, 24]} position={pos}>
          <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.2} />
        </Sphere>
      ))}
      <Line points={[vertices[0], vertices[1], vertices[2], vertices[0]]} color="#10b981" lineWidth={2.6} />

      <SceneLabel
        position={[0, 2.55, 0]}
        title="NEXT-GENERATION SPACE FLAGSHIPS: ARTEMIS, CLIPPER, DRAGONFLY, LISA & HWO"
        subtitle={`Selected Flagship: ${flagship.replace(/_/g, " ").toUpperCase()} • 2.5M km Space GW Interferometry & Coronagraph Direct Imaging`}
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 22 DIRECTOR DISPATCHER
// ============================================================================
export const Module22CinematicDirectorScene: React.FC<Module22ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m22_ch1_sputnik_leo_mechanics":
      return <Ch1SputnikLeoMechanicsScene {...props} />;
    case "m22_ch2_apollo_lunar_program":
      return <Ch2ApolloLunarProgramScene {...props} />;
    case "m22_ch3_voyager_grand_tour_heliopause":
      return <Ch3VoyagerGrandTourScene {...props} />;
    case "m22_ch4_mars_rovers_jezero_delta":
      return <Ch4MarsRoversTimelineScene {...props} />;
    case "m22_ch5_outer_planet_flagships":
      return <Ch5OuterPlanetFlagshipsScene {...props} />;
    case "m22_ch6_small_body_sample_return":
      return <Ch6SmallBodySampleReturnScene {...props} />;
    case "m22_ch7_isro_chandrayaan_aditya":
      return <Ch7IsroChandrayaanAdityaScene {...props} />;
    case "m22_ch8_future_missions_lisa_hwo":
      return <Ch8FutureMissionsHorizonScene {...props} />;
    default:
      return <Ch7IsroChandrayaanAdityaScene {...props} />;
  }
};
