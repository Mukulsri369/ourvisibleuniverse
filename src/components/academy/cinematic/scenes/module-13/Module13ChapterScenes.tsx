// @ts-nocheck
/**
 * COSMOS Stage 4 — Module 13 (Learn About Galaxies)
 * Complete 6-Chapter Bespoke 3D Scene Suite (62 Canonical Narration Segments)
 *
 * Chapters:
 * 13.1 (`13-1-morphology`)       — Hubble-de Vaucouleurs Sequence & Sérsic Profiles
 * 13.2 (`13-2-milky-way`)        — Milky Way Anatomy: Central Bar, 4 Arms, Orion Spur (R₀ = 8.18 kpc) & Stellar Halo
 * 13.3 (`13-3-local-group`)      — Local Group (~3 Mpc): Milky Way, Andromeda (M31 v_rad = -110 km/s), M33, LMC/SMC
 * 13.4 (`13-4-galactic-cores`)   — Galactic Nuclei, Sgr A* S-Star Orbits & Unified AGN Model (Torus + Bipolar Jets)
 * 13.5 (`13-5-dark-matter`)      — Differential Galactic Rotation, 21-cm H I Tracers & Flat Rotation Curve v(r) ≈ 220 km/s
 * 13.6 (`13-6-collisions`)       — Major Galaxy Mergers: Collisionless Stars, Shocked Gas Starburst & Milkomeda Remnant
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";
import { GalaxyParticleField } from "../../science/GalaxyParticleField";

export interface Module13ChapterSceneProps {
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
    return store.getChapterValues("13", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#60a5fa",
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
          backgroundColor: "rgba(4, 9, 22, 0.86)",
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
// CHAPTER 13.1 — GALAXY MORPHOLOGIES & THE HUBBLE TUNING FORK
// ============================================================================
const Ch1HubbleTuningForkScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  activeBeatIndex,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const selectedClass = String(controls.selectedMorphologyClass ?? "SBbc");
  const bulgeRatio = Number(controls.bulgeToTotalRatio ?? 0.25);
  const incDeg = Number(controls.viewingInclinationDeg ?? 35);
  const incRad = THREE.MathUtils.degToRad(incDeg);

  const spiralGroupRef = useRef<THREE.Group>(null);
  const barredGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    const dt = delta * Math.max(0.1, timeScale);
    if (spiralGroupRef.current) spiralGroupRef.current.rotation.y += dt * 0.24;
    if (barredGroupRef.current) barredGroupRef.current.rotation.y += dt * 0.24;
  });

  const forkHandleLine = useMemo<[number, number, number][]>(
    () => [
      [-5.2, 0, 0],
      [-1.8, 0, 0],
    ],
    [],
  );
  const upperProngLine = useMemo<[number, number, number][]>(
    () => [
      [-1.8, 0, 0],
      [0.4, 1.65, 0],
      [3.2, 1.65, 0],
    ],
    [],
  );
  const lowerProngLine = useMemo<[number, number, number][]>(
    () => [
      [-1.8, 0, 0],
      [0.4, -1.65, 0],
      [3.2, -1.65, 0],
    ],
    [],
  );

  return (
    <group>
      {/* Hubble Tuning Fork Schematic Wireframe */}
      <Line points={forkHandleLine} color="#64748b" lineWidth={1.6} dashed dashScale={4} />
      <Line points={upperProngLine} color="#38bdf8" lineWidth={1.6} dashed dashScale={4} />
      <Line points={lowerProngLine} color="#f59e0b" lineWidth={1.6} dashed dashScale={4} />

      {/* 1. Elliptical Specimen (E0–E4) */}
      <group
        position={[-4.5, 0, 0]}
        scale={selectedClass === "E0" ? 1.25 : 0.95}
        onClick={() => onSelectObject?.("elliptical_galaxy_specimen")}
      >
        <Sphere args={[0.95, 32, 32]} scale={[1.25, 0.9, 0.95]}>
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={selectedClass === "E0" ? 1.5 : 0.85}
            transparent
            opacity={0.78}
          />
        </Sphere>
        <Sphere args={[1.35, 24, 24]} scale={[1.3, 0.95, 1.0]}>
          <meshBasicMaterial color="#fde68a" transparent opacity={0.18} depthWrite={false} />
        </Sphere>
        <SceneLabel
          position={[0, 1.55, 0]}
          title="ELLIPTICAL (E0–E7 • Sérsic n ≈ 4)"
          subtitle="Dispersion-Supported • Old Metal-Rich K/M Stars"
          color="#fbbf24"
          visible={showLabels}
        />
      </group>

      {/* 2. Lenticular Transition (S0) at Fork Pivot */}
      <group
        position={[-1.8, 0, 0]}
        rotation={[incRad, 0, 0]}
        scale={selectedClass === "S0" ? 1.25 : 0.95}
      >
        <Sphere args={[0.45 + bulgeRatio * 0.35, 24, 24]}>
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.2} />
        </Sphere>
        <Ring args={[0.4, 1.25, 48]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#fcd34d" transparent opacity={0.42} side={THREE.DoubleSide} />
        </Ring>
        <SceneLabel
          position={[0, -1.45, 0]}
          title="LENTICULAR (S0 Pivot)"
          subtitle={`Smooth Disk + Bulge (B/T ≈ ${bulgeRatio.toFixed(2)})`}
          color="#fde047"
          visible={showLabels}
        />
      </group>

      {/* 3. Unbarred Spiral Specimen (Sa–Sc) on Upper Prong */}
      <group
        position={[1.4, 1.65, 0]}
        rotation={[incRad, 0, 0]}
        scale={selectedClass === "Sa" ? 0.52 : 0.42}
        onClick={() => onSelectObject?.("spiral_galaxy_specimen")}
      >
        <group ref={spiralGroupRef}>
          <GalaxyParticleField
            radius={3.2}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
          <Sphere args={[0.55 + bulgeRatio * 0.6, 24, 24]}>
            <meshBasicMaterial color="#fffbeb" transparent opacity={0.85} />
          </Sphere>
        </group>
        <SceneLabel
          position={[0, 3.3, 0]}
          title="UNBARRED SPIRAL (Sa–Sc • n ≈ 1 Disk)"
          subtitle="Logarithmic Density-Wave Arms + OB Associations"
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* 4. Barred Spiral Specimen (SBa–SBc) on Lower Prong */}
      <group
        position={[1.4, -1.65, 0]}
        rotation={[incRad, 0, 0]}
        scale={selectedClass === "SBbc" ? 0.54 : 0.42}
        onClick={() => onSelectObject?.("barred_spiral_specimen")}
      >
        <group ref={barredGroupRef}>
          <GalaxyParticleField
            radius={3.2}
            armCount={4}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
          {/* Prominent Central Stellar Bar */}
          <mesh scale={[1.8, 0.32, 0.45]}>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.9} />
          </mesh>
        </group>
        <SceneLabel
          position={[0, -3.2, 0]}
          title="BARRED SPIRAL (SBa–SBc • Milky Way Class)"
          subtitle="Central Stellar Bar Torque + Star-Forming Arms"
          color="#f59e0b"
          visible={showLabels}
        />
      </group>

      {/* 5. Irregular Starburst Dwarf Specimen (Irr) */}
      <group
        position={[4.6, 0, 0]}
        scale={selectedClass === "Irr" ? 1.25 : 0.95}
        onClick={() => onSelectObject?.("irregular_galaxy_specimen")}
      >
        {[
          [0, 0, 0, 0.55, "#38bdf8"],
          [0.45, 0.28, -0.2, 0.38, "#f472b6"],
          [-0.42, -0.25, 0.25, 0.42, "#60a5fa"],
          [0.2, -0.35, 0.3, 0.3, "#c084fc"],
        ].map(([x, y, z, r, c], idx) => (
          <Sphere key={idx} args={[Number(r), 20, 20]} position={[Number(x), Number(y), Number(z)]}>
            <meshStandardMaterial
              color={String(c)}
              emissive={String(c)}
              emissiveIntensity={1.2}
              transparent
              opacity={0.75}
            />
          </Sphere>
        ))}
        <SceneLabel
          position={[0, 1.45, 0]}
          title="IRREGULAR (Irr • LMC/SMC Analog)"
          subtitle="Gas-Rich, Asymmetric H II Starburst Clumps"
          color="#f472b6"
          visible={showLabels}
        />
      </group>

      {activeBeatIndex >= 2 && (
        <SceneLabel
          position={[0, 3.6, 0]}
          title="SCIENTIFIC CORRECTION: TAXONOMY ≠ CHRONOLOGICAL AGE"
          subtitle="'Early-Type' (E) vs 'Late-Type' (S) reflects B/T & angular momentum, NOT birth order"
          color="#34d399"
          visible={showLabels}
        />
      )}
    </group>
  );
};

// ============================================================================
// CHAPTER 13.2 — THE MILKY WAY: ANATOMY OF OUR HOME GALAXY
// ============================================================================
const Ch2MilkyWayAnatomyScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const barPitchDeg = Number(controls.galacticBarPitchDeg ?? 28);
  const band = String(controls.wavelengthBandOverlay ?? "optical_gaia");
  const showHalo = Boolean(controls.showGlobularClusterHalo ?? true);

  const diskRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.14 * Math.max(0.1, timeScale);
    }
  });

  // 160 Globular clusters distributed spherically in the halo
  const globularPositions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 42; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 42);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 2.4 + (i % 5) * 0.55;
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.85,
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }
    return pts;
  }, []);

  const solarOrbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const rSun = 2.65; // scaled 8.178 kpc
    for (let i = 0; i <= 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      pts.push([Math.cos(a) * rSun, 0.04, Math.sin(a) * rSun]);
    }
    return pts;
  }, []);

  const bandTint =
    band === "radio_21cm_hi" ? "#22d3ee" : band === "infrared_spitzer_wise" ? "#f59e0b" : "#93c5fd";

  return (
    <group>
      <group ref={diskRef} onClick={() => onSelectObject?.("milky_way_spiral_arms")}>
        <GalaxyParticleField
          radius={5.2}
          armCount={4}
          qualityTier={qualityTier}
          rotationSpeed={0}
        />

        {/* Central Box/Peanut Bulge & Stellar Bar (~27° Pitch) */}
        <group
          rotation={[0, THREE.MathUtils.degToRad(barPitchDeg), 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject?.("milky_way_central_bar");
          }}
        >
          <mesh scale={[2.1, 0.42, 0.62]}>
            <sphereGeometry args={[0.9, 28, 28]} />
            <meshStandardMaterial
              color="#fde68a"
              emissive="#f59e0b"
              emissiveIntensity={1.35}
              transparent
              opacity={0.88}
            />
          </mesh>
        </group>

        {/* Wavelength-Specific Overlay Ring */}
        <Ring args={[1.4, 4.9, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color={bandTint}
            transparent
            opacity={band === "optical_gaia" ? 0.06 : 0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </Ring>

        {/* Solar Galactocentric Orbit & Orion Spur Locus (R₀ = 8.178 kpc = 26,670 ly) */}
        <Line points={solarOrbitPoints} color="#38bdf8" lineWidth={1.8} dashed dashScale={3} />
        <group
          position={[2.3, 0.08, 1.32]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject?.("solar_orion_spur_marker");
          }}
        >
          <Sphere args={[0.18, 20, 20]}>
            <meshBasicMaterial color="#38bdf8" />
          </Sphere>
          <Ring args={[0.26, 0.38, 24]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="#fde047" side={THREE.DoubleSide} />
          </Ring>
          <SceneLabel
            position={[0, 0.85, 0]}
            title="SOLAR SYSTEM (R₀ = 8.178 kpc / 26,670 ly)"
            subtitle="Orion–Cygnus Spur • v₀ ≈ 225 km/s • T_gal ≈ 225–230 Myr"
            color="#38bdf8"
            visible={showLabels}
          />
        </group>
      </group>

      {/* Spherical Halo & Globular Clusters */}
      {showHalo && (
        <group onClick={() => onSelectObject?.("globular_cluster_stellar_halo")}>
          <Sphere args={[5.1, 28, 28]}>
            <meshBasicMaterial
              color="#818cf8"
              transparent
              opacity={0.05}
              wireframe
              depthWrite={false}
            />
          </Sphere>
          {globularPositions.map((pos, idx) => (
            <Sphere key={idx} args={[0.075, 10, 10]} position={pos}>
              <meshBasicMaterial color="#fef08a" />
            </Sphere>
          ))}
        </group>
      )}

      <SceneLabel
        position={[0, -2.9, 0]}
        title="RECONSTRUCTED FROM INTERNAL OBSERVATIONS (Gaia DR3 + VLBI + 21-cm H I)"
        subtitle="Thin Disk (~300 pc) • Thick Disk (~1 kpc) • Central Bar + Sgr A* (4.15 × 10⁶ M_☉)"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 13.3 — OUR GALACTIC NEIGHBORHOOD: THE LOCAL GROUP
// ============================================================================
const Ch3LocalGroupNeighborhoodScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const epochGyr = Number(controls.andromedaApproachEpochGyr ?? 0.0);
  const showZeroVel = Boolean(controls.showZeroVelocityBoundary ?? true);

  const mwRef = useRef<THREE.Group>(null);
  const m31Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    const dt = delta * Math.max(0.1, timeScale);
    if (mwRef.current) mwRef.current.rotation.y += dt * 0.25;
    if (m31Ref.current) m31Ref.current.rotation.y -= dt * 0.22;
  });

  const frac = Math.min(0.92, epochGyr / 4.5);
  const mwPos: [number, number, number] = [-3.1 * (1 - frac), 0, 0.5 * (1 - frac)];
  const m31Pos: [number, number, number] = [3.1 * (1 - frac), 0.35 * (1 - frac), -0.5 * (1 - frac)];
  const sepMly = Math.max(0.15, 2.537 * (1 - frac));

  return (
    <group>
      {/* Local Group Zero-Velocity Surface (~3.1 Mpc Diameter / R_0 ≈ 1.0 Mpc) */}
      {showZeroVel && (
        <group onClick={() => onSelectObject?.("local_group_zero_velocity_sphere")}>
          <Sphere args={[5.8, 32, 32]}>
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.07}
              wireframe
              depthWrite={false}
            />
          </Sphere>
          <SceneLabel
            position={[0, 3.6, 0]}
            title="LOCAL GROUP ZERO-VELOCITY SURFACE (D ≈ 3.1 Mpc / 10 Mly)"
            subtitle="Gravitationally Bound >80 Galaxies (M_LG ≈ 3.2 × 10¹² M_☉) Decoupled from Hubble Flow"
            color="#38bdf8"
            visible={showLabels}
          />
        </group>
      )}

      {/* Milky Way & Magellanic Clouds */}
      <group
        position={mwPos}
        rotation={[0.38, 0, -0.2]}
        onClick={() => onSelectObject?.("local_group_milky_way")}
      >
        <group ref={mwRef} scale={0.44}>
          <GalaxyParticleField
            radius={3.2}
            armCount={4}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>
        {/* LMC (50 kpc) & SMC (62 kpc) */}
        <group
          position={[-0.95, -0.55, 0.45]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject?.("magellanic_clouds_pair");
          }}
        >
          <Sphere args={[0.22, 16, 16]}>
            <meshBasicMaterial color="#60a5fa" />
          </Sphere>
          <Sphere args={[0.14, 16, 16]} position={[-0.35, -0.2, 0.18]}>
            <meshBasicMaterial color="#93c5fd" />
          </Sphere>
        </group>
        <SceneLabel
          position={[0, 1.35, 0]}
          title="MILKY WAY + LMC (50 kpc) & SMC (62 kpc)"
          subtitle="M_vir ≈ 1.15 × 10¹² M_☉ • Magellanic Stream"
          color="#60a5fa"
          visible={showLabels}
        />
      </group>

      {/* Andromeda Galaxy (M31) */}
      <group
        position={m31Pos}
        rotation={[0.62, 0.25, 0.32]}
        onClick={() => onSelectObject?.("andromeda_m31_system")}
      >
        <group ref={m31Ref} scale={0.54}>
          <GalaxyParticleField
            radius={3.4}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>
        {/* M32 & M110 Dwarf Elliptical Satellites */}
        <Sphere args={[0.15, 14, 14]} position={[-0.65, 0.32, 0.2]}>
          <meshBasicMaterial color="#fde68a" />
        </Sphere>
        <Sphere args={[0.17, 14, 14]} position={[0.75, -0.28, -0.25]}>
          <meshBasicMaterial color="#fde68a" />
        </Sphere>
        <SceneLabel
          position={[0, 1.55, 0]}
          title={`ANDROMEDA (M31 • d = ${sepMly.toFixed(2)} Mly)`}
          subtitle="v_rad = -110 km/s Galactocentric (-301 km/s Helio • Blueshifted)"
          color="#818cf8"
          visible={showLabels}
        />
      </group>

      {/* Triangulum Galaxy (M33) */}
      <group
        position={[4.2, -1.1, 1.3]}
        rotation={[0.45, -0.3, 0.15]}
        scale={0.32}
        onClick={() => onSelectObject?.("triangulum_m33_galaxy")}
      >
        <GalaxyParticleField
          radius={2.8}
          armCount={2}
          qualityTier={qualityTier}
          rotationSpeed={0.3}
        />
        <SceneLabel
          position={[0, 3.2, 0]}
          title="TRIANGULUM (M33 • ~2.73 Mly)"
          subtitle="3rd Largest Local Group Spiral (~4 × 10¹⁰ Stars)"
          color="#c084fc"
          visible={showLabels}
        />
      </group>

      {/* Approach Vector Line between MW and M31 */}
      <Line points={[mwPos, m31Pos]} color="#34d399" lineWidth={2.0} dashed dashScale={3} />
    </group>
  );
};

// ============================================================================
// CHAPTER 13.4 — GALACTIC CORES, SGR A* & ACTIVE GALACTIC NUCLEI (AGN)
// ============================================================================
const Ch4GalacticCoresAgnScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const incDeg = Number(controls.agnViewingAngleDeg ?? 35);
  const eddRatio = Number(controls.eddingtonAccretionRatio ?? 0.15);

  const diskRef = useRef<THREE.Group>(null);
  const s2StarRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (isPaused || reducedMotion) return;
    const dt = delta * Math.max(0.1, timeScale);
    if (diskRef.current) diskRef.current.rotation.y += dt * 1.4;
    if (s2StarRef.current) {
      const t = state.clock.elapsedTime * 1.6;
      // Keplerian eccentric S2 orbit around Sgr A* (e = 0.88)
      const a = 1.65;
      const b = 0.78;
      s2StarRef.current.position.set(Math.cos(t) * a - 0.8, Math.sin(t) * 0.35, Math.sin(t) * b);
    }
  });

  const s2OrbitPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const a = 1.65;
    const b = 0.78;
    for (let i = 0; i <= 64; i++) {
      const ang = (i / 64) * Math.PI * 2;
      pts.push([Math.cos(ang) * a - 0.8, Math.sin(ang) * 0.35, Math.sin(ang) * b]);
    }
    return pts;
  }, []);

  const tiltRad = THREE.MathUtils.degToRad(incDeg - 35);
  const jetScale = 0.65 + eddRatio * 1.6;

  return (
    <group rotation={[tiltRad, 0, 0]}>
      {/* Central Supermassive Black Hole Shadow & Photon Ring */}
      <group onClick={() => onSelectObject?.("smbh_accretion_core")}>
        <Sphere args={[0.58, 32, 32]}>
          <meshBasicMaterial color="#000000" />
        </Sphere>
        <Ring args={[0.62, 0.78, 48]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#fde047" side={THREE.DoubleSide} />
        </Ring>
      </group>

      {/* Relativistic Inner Accretion Disk */}
      <group ref={diskRef} onClick={() => onSelectObject?.("smbh_accretion_core")}>
        <Ring args={[0.82, 2.35, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={0.45 + eddRatio * 0.45}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>

      {/* S-Star (S2) Elliptical Orbit around Sgr A* */}
      <Line points={s2OrbitPoints} color="#38bdf8" lineWidth={1.8} />
      <Sphere ref={s2StarRef} args={[0.11, 16, 16]} position={[0.85, 0, 0]}>
        <meshBasicMaterial color="#38bdf8" />
      </Sphere>

      {/* Clumpy Obscuring Dusty Molecular Torus */}
      <group onClick={() => onSelectObject?.("agn_dusty_obscuring_torus")}>
        <Torus args={[3.1, 0.85, 24, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#78350f"
            emissive="#451a03"
            roughness={0.85}
            transparent
            opacity={0.82}
          />
        </Torus>
      </group>

      {/* Broad-Line Region (BLR) & Narrow-Line Region (NLR) Ionization Cones */}
      <group onClick={() => onSelectObject?.("broad_and_narrow_line_clouds")}>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[1.9, 3.6, 32, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -2.2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.9, 3.6, 32, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Blandford–Znajek Relativistic Bipolar Plasma Jets */}
      <group onClick={() => onSelectObject?.("agn_relativistic_bipolar_jets")}>
        <mesh position={[0, 2.6 * jetScale, 0]}>
          <cylinderGeometry args={[0.28, 0.06, 5.2 * jetScale, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.78} />
        </mesh>
        <mesh position={[0, -2.6 * jetScale, 0]}>
          <cylinderGeometry args={[0.06, 0.28, 5.2 * jetScale, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.78} />
        </mesh>
      </group>

      <SceneLabel
        position={[0, 3.8, 0]}
        title={`UNIFIED AGN ENGINE (Inclination i = ${incDeg.toFixed(0)}° • λ_Edd = ${eddRatio.toFixed(2)})`}
        subtitle={
          incDeg <= 15
            ? "Blazar Line-of-Sight Down Relativistic Jet"
            : incDeg <= 45
              ? "Type 1 Quasar / Seyfert 1 (Broad + Narrow Lines Visible)"
              : "Type 2 Seyfert (Broad-Line Core Obscured by Dusty Torus)"
        }
        color="#f97316"
        visible={showLabels}
      />
      <SceneLabel
        position={[-2.2, -1.6, 0]}
        title="Sgr A* S2 STAR ORBIT (P = 16.05 yr)"
        subtitle="M_BH = 4.154 × 10⁶ M_☉ (GRAVITY / Keck)"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 13.5 — GALAXY ROTATION & DARK MATTER HALO EVIDENCE
// ============================================================================
const Ch5GalaxyRotationCurvesScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const probeRKpc = Number(controls.galactocentricProbeRadiusKpc ?? 22);
  const haloMult = Number(controls.haloMassMultiplier ?? 1.0);

  const diskRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.25 * Math.max(0.1, timeScale);
    }
  });

  // 3D Live Rotation Curve Plot on the right side
  const { keplerianCurve, observedFlatCurve } = useMemo(() => {
    const kep: [number, number, number][] = [];
    const obs: [number, number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const rKpc = 2 + (i / 28) * 33;
      const x = 0.8 + (i / 28) * 4.4;
      const vBary = 215 * Math.sqrt(Math.min(1, 6 / Math.max(2, rKpc)));
      const vHalo = 185 * Math.sqrt(haloMult) * Math.sqrt(rKpc / (rKpc + 8));
      const vTot = Math.sqrt(vBary * vBary + vHalo * vHalo);
      kep.push([x, -1.6 + (vBary / 260) * 3.0, 0]);
      obs.push([x, -1.6 + (vTot / 260) * 3.0, 0]);
    }
    return { keplerianCurve: kep, observedFlatCurve: obs };
  }, [haloMult]);

  const probeRadiusScene = 0.6 + ((probeRKpc - 2) / 33) * 2.5;
  const probeXPlot = 0.8 + ((probeRKpc - 2) / 33) * 4.4;

  return (
    <group>
      {/* Left: Rotating Spiral Disk + Extended Spherical Dark Matter Halo */}
      <group position={[-2.3, 0, 0]}>
        {haloMult > 0.05 && (
          <Sphere
            args={[3.3, 32, 32]}
            onClick={() => onSelectObject?.("spherical_dark_matter_halo_envelope")}
          >
            <meshBasicMaterial
              color="#6366f1"
              transparent
              opacity={Math.min(0.24, 0.08 * haloMult)}
              wireframe
              depthWrite={false}
            />
          </Sphere>
        )}

        <group
          ref={diskRef}
          scale={0.62}
          onClick={() => onSelectObject?.("rotating_galaxy_disk_tracers")}
        >
          <GalaxyParticleField
            radius={3.6}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>

        {/* Active Galactocentric Probe Ring */}
        <Ring
          args={[probeRadiusScene - 0.05, probeRadiusScene + 0.05, 64]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial color="#34d399" side={THREE.DoubleSide} />
        </Ring>

        <SceneLabel
          position={[0, 3.5, 0]}
          title={`EXTENDED DARK MATTER HALO (${haloMult.toFixed(2)}× Standard NFW)`}
          subtitle="Encloses M(<r) ∝ r out to >30 kpc"
          color="#818cf8"
          visible={showLabels}
        />
      </group>

      {/* Right: 3D Rotation Curve Comparison Graph */}
      <group onClick={() => onSelectObject?.("keplerian_vs_flat_curve_plot")}>
        {/* Axes */}
        <Line
          points={[
            [0.8, 1.8, 0],
            [0.8, -1.6, 0],
            [5.3, -1.6, 0],
          ]}
          color="#94a3b8"
          lineWidth={1.8}
        />
        {/* Keplerian Baryon-Only Curve (Dashed Amber) */}
        <Line points={keplerianCurve} color="#f59e0b" lineWidth={2.2} dashed dashScale={4} />
        {/* Observed Flat Rotation Curve (Solid Emerald/Cyan) */}
        <Line points={observedFlatCurve} color="#34d399" lineWidth={3.0} />
        {/* Probe Vertical Marker */}
        <Line
          points={[
            [probeXPlot, -1.6, 0],
            [probeXPlot, 1.6, 0],
          ]}
          color="#38bdf8"
          lineWidth={1.5}
          dashed
          dashScale={5}
        />

        <SceneLabel
          position={[3.1, 2.1, 0]}
          title="GALACTIC ROTATION CURVE v(r) = √(G M(<r) / r)"
          subtitle="Green: Observed Flat (~220 km/s) • Amber: Keplerian Baryons Only (r⁻¹/²)"
          color="#34d399"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 13.6 — GALAXY COLLISIONS, TIDAL TAILS & EVOLUTION
// ============================================================================
const Ch6GalaxyMergersEvolutionScene: React.FC<Module13ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const stageGyr = Number(controls.mergerTimelineStageGyr ?? 2.2);
  const gasFrac = Number(controls.progenitorGasFraction ?? 0.25);

  const primaryRef = useRef<THREE.Group>(null);
  const secondaryRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    const dt = delta * Math.max(0.1, timeScale);
    if (primaryRef.current) primaryRef.current.rotation.y += dt * 0.32;
    if (secondaryRef.current) secondaryRef.current.rotation.y -= dt * 0.28;
  });

  // Compute separation and tidal tail extension from stageGyr (0..4.5 Gyr)
  const sep = stageGyr < 3.4 ? Math.max(0.25, 2.8 * (1 - stageGyr / 3.5)) : 0.08;
  const isRemnant = stageGyr >= 3.5;

  const upperTailPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const tailLen = Math.min(1.0, stageGyr / 2.2);
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * tailLen;
      pts.push([-sep - t * 3.2, t * 2.1, -t * 1.4]);
    }
    return pts;
  }, [sep, stageGyr]);

  const lowerTailPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const tailLen = Math.min(1.0, stageGyr / 2.2);
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * tailLen;
      pts.push([sep + t * 3.2, -t * 2.1, t * 1.4]);
    }
    return pts;
  }, [sep, stageGyr]);

  return (
    <group>
      {/* Primary Progenitor Galaxy */}
      <group
        position={[-sep, 0.15 * sep, 0]}
        rotation={[0.35, 0, 0.2]}
        scale={isRemnant ? 0.55 : 0.48}
        onClick={() => onSelectObject?.("colliding_galaxy_primary")}
      >
        <group ref={primaryRef}>
          <GalaxyParticleField
            radius={3.2}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>
      </group>

      {/* Secondary Progenitor Galaxy */}
      <group
        position={[sep, -0.15 * sep, 0]}
        rotation={[-0.4, 0, -0.25]}
        scale={isRemnant ? 0.55 : 0.46}
        onClick={() => onSelectObject?.("colliding_galaxy_secondary")}
      >
        <group ref={secondaryRef}>
          <GalaxyParticleField
            radius={3.0}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>
      </group>

      {/* Coalesced Elliptical Remnant Spheroid (when t >= 3.5 Gyr) */}
      {isRemnant && (
        <Sphere args={[1.85, 32, 32]} scale={[1.25, 0.92, 1.0]}>
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={1.1}
            transparent
            opacity={0.55}
          />
        </Sphere>
      )}

      {/* Gravitationally Stripped Tidal Tails & Bridge */}
      {stageGyr >= 0.8 && (
        <group onClick={() => onSelectObject?.("tidal_bridge_and_tails")}>
          <Line points={upperTailPoints} color="#93c5fd" lineWidth={2.5} />
          <Line points={lowerTailPoints} color="#93c5fd" lineWidth={2.5} />
        </group>
      )}

      {/* Shocked Interstellar Gas & Starburst Knots at Overlap Bridge */}
      {stageGyr >= 1.2 && stageGyr <= 3.8 && (
        <group onClick={() => onSelectObject?.("shocked_starburst_core_knots")}>
          <Sphere args={[0.45 + gasFrac * 0.9, 24, 24]}>
            <meshBasicMaterial color="#f43f5e" transparent opacity={0.55} />
          </Sphere>
          <SceneLabel
            position={[0, -1.9, 0]}
            title={`SHOCKED GAS STARBURST (f_gas = ${(gasFrac * 100).toFixed(0)}%)`}
            subtitle="Gas clouds shock & compress • Individual stars remain collisionless!"
            color="#f43f5e"
            visible={showLabels}
          />
        </group>
      )}

      <SceneLabel
        position={[0, 3.4, 0]}
        title={`MAJOR GALAXY MERGER (t = ${stageGyr.toFixed(1)} Gyr • Antennae / Milkomeda Analog)`}
        subtitle={
          isRemnant
            ? "Violent Relaxation Complete → Elliptical Spheroid Remnant (Sérsic n ≈ 4)"
            : "Tidal Gravity a_tidal ∝ M R_gal / d³ Strips Long Tails & Fuels Nuclear Starburst"
        }
        color="#60a5fa"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 13 DIRECTOR DISPATCHER
// ============================================================================
export const Module13CinematicDirectorScene: React.FC<Module13ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m13_ch1_hubble_tuning_fork":
      return <Ch1HubbleTuningForkScene {...props} />;
    case "m13_ch2_milky_way_anatomy":
      return <Ch2MilkyWayAnatomyScene {...props} />;
    case "m13_ch3_local_group_neighborhood":
      return <Ch3LocalGroupNeighborhoodScene {...props} />;
    case "m13_ch4_galactic_cores_agn":
      return <Ch4GalacticCoresAgnScene {...props} />;
    case "m13_ch5_galaxy_rotation_curves":
    case "m13_ch5_rotation_curves_halos":
      return <Ch5GalaxyRotationCurvesScene {...props} />;
    case "m13_ch6_galaxy_mergers_evolution":
    case "m13_ch6_galaxy_collisions":
      return <Ch6GalaxyMergersEvolutionScene {...props} />;
    default:
      return <Ch1HubbleTuningForkScene {...props} />;
  }
};
