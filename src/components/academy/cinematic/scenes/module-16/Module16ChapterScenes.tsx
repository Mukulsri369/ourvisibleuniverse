/**
 * COSMOS Stage 4 — Module 16 (Dark Matter & Dark Energy)
 * Complete 9-Chapter Bespoke 3D Scene Suite (53 Canonical Narration Segments)
 *
 * Chapters:
 * 16.1 (`sub-16-1-invisible-universe`)       — Planck 2018 Cosmic Energy Pie (68.3% Dark Energy, 26.8% Dark Matter, 4.9% Baryons)
 * 16.2 (`sub-16-2-rotation-curves`)          — Zwicky Coma Cluster & Rubin Flat Rotation Curve Discrepancy
 * 16.3 (`sub-16-3-gravitational-lensing`)    — Relativistic Gravitational Lensing Bench (Einstein Ring θ_E & Bullet Cluster)
 * 16.4 (`sub-16-4-dark-matter-halos`)        — NFW Dark Matter Halo Profile (R_200 ≈ 225 kpc vs 15 kpc Baryonic Disk)
 * 16.5 (`sub-16-5-dark-matter-candidates`)   — Particle Dark Matter Hypotheses (WIMPs, Axions, Sterile ν) vs MOND
 * 16.6 (`sub-16-6-expanding-universe`)       — Hubble–Lemaître Metric Expansion v = H₀ d & Redshift 1 + z = a₀/a(t)
 * 16.7 (`sub-16-7-accelerating-expansion`)   — Type Ia Supernovae (M_Ch ≈ 1.44 M_☉) & 1998 Accelerating Expansion Discovery
 * 16.8 (`sub-16-8-what-dark-energy-means`)   — Friedmann Acceleration Equation & Equation of State w = P/(ρc²) = -1
 * 16.9 (`sub-16-9-open-questions`)           — Frontier Cosmology: Hubble Tension, DESI 2024–2026 w(a) Tests & Epistemic Audit
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";
import { GalaxyParticleField } from "../../science/GalaxyParticleField";

export interface Module16ChapterSceneProps {
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
    return store.getChapterValues("16", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#6366f1",
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
// CHAPTER 16.1 — THE INVISIBLE UNIVERSE: PLANCK 2018 COSMIC ENERGY PIE
// ============================================================================
const Ch1CosmicEnergyPieScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const filter = String(controls.energyComponentFilter ?? "all_components");

  const pieRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (pieRef.current) {
      pieRef.current.rotation.y += delta * 0.14 * Math.max(0.1, timeScale);
    }
  });

  // 68.3% Dark Energy = 2.4588 * PI rad, 26.8% Dark Matter = 0.536 * PI rad, 4.9% Baryons = 0.098 * PI rad
  const deArc = 0.683 * Math.PI * 2;
  const dmArc = 0.268 * Math.PI * 2;
  const bArc = 0.049 * Math.PI * 2;

  return (
    <group>
      <group ref={pieRef} rotation={[0.45, 0, 0]}>
        {/* 1. Dark Energy Sector (Ω_Λ = 68.3%) */}
        <mesh
          position={[0, filter === "dark_energy_68" ? 0.35 : 0, 0]}
          onClick={() => onSelectObject?.("planck_dark_energy_sector")}
        >
          <cylinderGeometry args={[3.1, 3.1, 0.65, 64, 1, false, 0, deArc]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={filter === "dark_energy_68" ? 1.5 : 0.85}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* 2. Cold Dark Matter Sector (Ω_c = 26.8%) */}
        <mesh
          position={[0, filter === "dark_matter_27" ? 0.35 : 0, 0]}
          onClick={() => onSelectObject?.("planck_dark_matter_sector")}
        >
          <cylinderGeometry args={[3.1, 3.1, 0.65, 48, 1, false, deArc, dmArc]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#4f46e5"
            emissiveIntensity={filter === "dark_matter_27" ? 1.5 : 0.85}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* 3. Ordinary Baryonic Matter Sector (Ω_b = 4.9%; Stars ≈ 0.5%) */}
        <mesh
          position={[0, filter === "baryons_5" ? 0.45 : 0.1, 0]}
          onClick={() => onSelectObject?.("planck_baryonic_matter_slice")}
        >
          <cylinderGeometry args={[3.25, 3.25, 0.75, 24, 1, false, deArc + dmArc, bArc]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
      </group>

      <SceneLabel
        position={[-2.6, 2.2, 0]}
        title="DARK ENERGY (Ω_Λ = 68.3%)"
        subtitle="Spatially Smooth (w ≈ -1) • Accelerates Metric Expansion"
        color="#10b981"
        visible={showLabels}
      />
      <SceneLabel
        position={[2.6, 2.2, 0]}
        title="COLD DARK MATTER (Ω_c = 26.8%)"
        subtitle="Clusters Gravitationally (w ≈ 0) • Cosmic Web Scaffold"
        color="#818cf8"
        visible={showLabels}
      />
      <SceneLabel
        position={[0, -2.5, 0]}
        title="ORDINARY BARYONS (Ω_b = 4.9% • Stars ≈ 0.5%)"
        subtitle="Planck 2018 CMB TT Spectrum: Ω_m + Ω_Λ = 1.000 ± 0.002"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 16.2 — GALAXY ROTATION CURVES & ZWICKY COMA DISCREPANCY
// ============================================================================
const Ch2RotationCurveDiscrepancyScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const probeRKpc = Number(controls.rotationProbeRadiusKpc ?? 25);
  const mode = String(controls.darkHaloContributionToggle ?? "with_dark_halo");

  const diskRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.25 * Math.max(0.1, timeScale);
    }
  });

  const { kepPts, obsPts } = useMemo(() => {
    const k: [number, number, number][] = [];
    const o: [number, number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const rKpc = 2 + (i / 28) * 38;
      const x = 0.6 + (i / 28) * 4.5;
      const vKep = 215 * Math.sqrt(Math.min(1, 5.5 / Math.max(2, rKpc)));
      const vFlat = Math.max(vKep, 222);
      k.push([x, -1.6 + (vKep / 260) * 3.0, 0]);
      o.push([x, -1.6 + (vFlat / 260) * 3.0, 0]);
    }
    return { kepPts: k, obsPts: o };
  }, []);

  const probeX = 0.6 + ((probeRKpc - 2) / 38) * 4.5;

  return (
    <group>
      {/* Left: Rotating Galaxy + 21-cm H I Outer Ring */}
      <group
        position={[-2.4, 0, 0]}
        onClick={() => onSelectObject?.("spiral_galaxy_velocity_tracers")}
      >
        {mode === "with_dark_halo" && (
          <Sphere args={[3.2, 28, 28]}>
            <meshBasicMaterial
              color="#6366f1"
              transparent
              opacity={0.14}
              wireframe
              depthWrite={false}
            />
          </Sphere>
        )}
        <group ref={diskRef} scale={0.58}>
          <GalaxyParticleField
            radius={3.5}
            armCount={2}
            qualityTier={qualityTier}
            rotationSpeed={0}
          />
        </group>
        <Ring args={[2.1, 2.9, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} side={THREE.DoubleSide} />
        </Ring>
        <SceneLabel
          position={[0, 3.4, 0]}
          title="EXTENDED 21-cm H I NEUTRAL GAS DISK"
          subtitle="Traces Orbital Speeds Beyond the Optical Stellar Edge"
          color="#22d3ee"
          visible={showLabels}
        />
      </group>

      {/* Right: Keplerian vs Observed Flat Rotation Curve */}
      <group onClick={() => onSelectObject?.("observed_flat_hi_rotation_curve")}>
        <Line
          points={[
            [0.6, 1.9, 0],
            [0.6, -1.6, 0],
            [5.2, -1.6, 0],
          ]}
          color="#94a3b8"
          lineWidth={1.8}
        />
        <Line points={kepPts} color="#f59e0b" lineWidth={2.2} dashed dashScale={4} />
        <Line
          points={obsPts}
          color={mode === "with_dark_halo" ? "#34d399" : "#64748b"}
          lineWidth={3.0}
        />
        <Line
          points={[
            [probeX, -1.6, 0],
            [probeX, 1.7, 0],
          ]}
          color="#38bdf8"
          lineWidth={1.6}
          dashed
          dashScale={5}
        />
        <SceneLabel
          position={[2.9, 2.2, 0]}
          title={`ROTATION CURVE AT R = ${probeRKpc.toFixed(0)} kpc`}
          subtitle="Zwicky (1933) Coma Cluster + Rubin & Ford (1970) Flat v(r) ≈ 220 km/s"
          color="#34d399"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 16.3 — GRAVITATIONAL LENSING: EINSTEIN RINGS & BULLET CLUSTER
// ============================================================================
const Ch3GravitationalLensingBenchScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const mLens14 = Number(controls.lensClusterMass14Solar ?? 8.0);
  const betaArcsec = Number(controls.sourceImpactAngleArcsec ?? 0.2);
  const showBullet = Boolean(controls.showBulletClusterOffset ?? true);

  const ringRadius = 1.25 * Math.sqrt(mLens14 / 8.0);
  const sourceY = betaArcsec * 0.85;

  // Bent null geodesic rays from source [-4.4, sourceY, 0] around lens [0, 0, 0] to observer [4.4, 0, 0]
  const upperRay = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-4.4, sourceY, 0),
      new THREE.Vector3(0, ringRadius * 1.15, 0),
      new THREE.Vector3(4.4, 0, 0),
    );
    return c.getPoints(32).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [sourceY, ringRadius]);

  const lowerRay = useMemo(() => {
    const c = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-4.4, sourceY, 0),
      new THREE.Vector3(0, -ringRadius * 1.15, 0),
      new THREE.Vector3(4.4, 0, 0),
    );
    return c.getPoints(32).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [sourceY, ringRadius]);

  return (
    <group>
      {/* Background Source Quasar / Blue Galaxy */}
      <group
        position={[-4.4, sourceY, 0]}
        onClick={() => onSelectObject?.("background_source_quasar_galaxy")}
      >
        <Sphere args={[0.32, 20, 20]}>
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.6} />
        </Sphere>
        <SceneLabel
          position={[0, 0.9, 0]}
          title="BACKGROUND SOURCE (D_S)"
          subtitle={`Impact Misalignment β = ${betaArcsec.toFixed(2)}"`}
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Foreground Cluster Lens & Einstein Ring */}
      <group onClick={() => onSelectObject?.("foreground_cluster_mass_lens")}>
        <Sphere args={[0.78, 28, 28]}>
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.2} />
        </Sphere>
        <Sphere args={[1.65, 28, 28]}>
          <meshBasicMaterial color="#6366f1" transparent opacity={0.16} wireframe />
        </Sphere>
      </group>

      {/* Einstein Ring / Tangential Lensed Arcs */}
      <group onClick={() => onSelectObject?.("einstein_ring_and_giant_arcs")}>
        <Torus
          args={[ringRadius, 0.075, 16, 64]}
          rotation={[0, Math.PI / 2, 0]}
          position={[0, sourceY * 0.15, 0]}
        >
          <meshBasicMaterial color="#38bdf8" />
        </Torus>
      </group>

      {/* Deflected Null Geodesic Light Rays */}
      <Line points={upperRay} color="#38bdf8" lineWidth={2.2} />
      <Line points={lowerRay} color="#38bdf8" lineWidth={2.2} />

      {/* Bullet Cluster (1E 0657-558) Offset Inset */}
      {showBullet && (
        <group
          position={[0, -2.55, 0]}
          onClick={() => onSelectObject?.("bullet_cluster_lensing_separation")}
        >
          {/* Left & Right Collisionless Dark Matter Lensing Peaks (Blue) */}
          <Sphere args={[0.42, 20, 20]} position={[-1.25, 0, 0]}>
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.65} />
          </Sphere>
          <Sphere args={[0.38, 20, 20]} position={[1.25, 0, 0]}>
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.65} />
          </Sphere>
          {/* Central Shocked Collisional X-Ray Gas Clouds (Magenta) */}
          <Sphere args={[0.36, 20, 20]} position={[-0.42, 0, 0]}>
            <meshBasicMaterial color="#ec4899" transparent opacity={0.78} />
          </Sphere>
          <Sphere args={[0.32, 20, 20]} position={[0.42, 0, 0]}>
            <meshBasicMaterial color="#ec4899" transparent opacity={0.78} />
          </Sphere>
          <SceneLabel
            position={[0, -0.85, 0]}
            title="BULLET CLUSTER (1E 0657-558 • 8σ Direct Proof)"
            subtitle="Blue Lensing Mass Peaks Outrun Shocked Magenta X-Ray Gas"
            color="#ec4899"
            visible={showLabels}
          />
        </group>
      )}

      <SceneLabel
        position={[0, 2.75, 0]}
        title={`GR DEFLECTION α̂ = 4GM/(c²b) • EINSTEIN RING θ_E ≈ ${(28 * Math.sqrt(mLens14 / 8)).toFixed(1)}"`}
        subtitle="Weighs Total Projected Mass Σ(R) Independent of Baryonic Equilibrium"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 16.4 — DARK MATTER HALOS & NFW RADIAL PROFILE
// ============================================================================
const Ch4NfwDarkMatterHalosScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  qualityTier = "HIGH_QUALITY",
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const mVir12 = Number(controls.nfwVirialMass12Solar ?? 1.2);
  const c200 = Number(controls.haloConcentrationC200 ?? 10.0);

  const haloScale = Math.pow(mVir12 / 1.2, 0.25);
  const rsScene = 3.2 / Math.max(4, c200 * 0.25);

  const subhalosRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (subhalosRef.current) {
      subhalosRef.current.rotation.y += delta * 0.16 * Math.max(0.1, timeScale);
    }
  });

  const subhaloCoords = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 24);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.6 + (i % 4) * 0.55;
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      ]);
    }
    return pts;
  }, []);

  return (
    <group>
      {/* Spherical NFW Dark Matter Halo (R_200 ≈ 225 kpc) */}
      <group scale={haloScale} onClick={() => onSelectObject?.("nfw_spherical_dark_halo")}>
        <Sphere args={[3.5, 32, 32]}>
          <meshBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.11}
            wireframe
            depthWrite={false}
          />
        </Sphere>
        {/* Scale Radius r_s Shell */}
        <Sphere args={[rsScene, 24, 24]}>
          <meshBasicMaterial
            color="#818cf8"
            transparent
            opacity={0.2}
            wireframe
            depthWrite={false}
          />
        </Sphere>
      </group>

      {/* Embedded Baryonic Stellar Disk (R_disk ≈ 15 kpc — ~15× smaller than R_200!) */}
      <group scale={0.34} onClick={() => onSelectObject?.("embedded_baryonic_stellar_disk")}>
        <GalaxyParticleField
          radius={3.0}
          armCount={4}
          qualityTier={qualityTier}
          rotationSpeed={0.3}
        />
      </group>

      {/* ΛCDM Satellite Subhalos */}
      <group ref={subhalosRef} onClick={() => onSelectObject?.("satellite_subhalo_swarm")}>
        {subhaloCoords.map((pos, idx) => (
          <Sphere key={idx} args={[0.09, 12, 12]} position={pos}>
            <meshBasicMaterial color="#a5b4fc" />
          </Sphere>
        ))}
      </group>

      <SceneLabel
        position={[0, 3.8, 0]}
        title={`NFW DARK MATTER HALO (M_200 = ${mVir12.toFixed(2)} × 10¹² M_☉ • c = ${c200.toFixed(1)})`}
        subtitle="ρ(r) = ρ₀ / [(r/r_s)(1 + r/r_s)²] • Halo R_200 (~225 kpc) >> Stellar Disk (~15 kpc)"
        color="#818cf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 16.5 — WHAT COULD DARK MATTER BE? CANDIDATES VS MOND
// ============================================================================
const Ch5DarkMatterCandidatesScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const selected = String(controls.candidateHypothesisSelect ?? "wimp_gev_tev");

  return (
    <group>
      {/* Left: WIMP Liquid-Xenon Time Projection Chamber (LZ / XENONnT) */}
      <group
        position={[-3.2, 0, 0]}
        scale={selected === "wimp_gev_tev" ? 1.2 : 0.92}
        onClick={() => onSelectObject?.("wimp_xenon_recoil_chamber")}
      >
        <mesh>
          <cylinderGeometry args={[1.05, 1.05, 2.2, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            transparent
            opacity={0.45}
          />
        </mesh>
        <Sphere args={[0.18, 16, 16]} position={[0, 0.1, 0]}>
          <meshBasicMaterial color="#fde047" />
        </Sphere>
        <SceneLabel
          position={[0, 1.65, 0]}
          title="1. WIMP (10 GeV – 1 TeV)"
          subtitle="Liquid Xenon Recoil (LZ / XENONnT • Unconfirmed)"
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Center: QCD Axion High-Field Microwave Cavity Haloscope (ADMX) */}
      <group
        position={[0, 0, 0]}
        scale={selected === "axion_micro_ev" ? 1.2 : 0.92}
        onClick={() => onSelectObject?.("axion_admx_cavity_haloscope")}
      >
        <Torus args={[1.0, 0.25, 24, 48]}>
          <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.9} />
        </Torus>
        <Ring args={[0.35, 0.72, 32]}>
          <meshBasicMaterial color="#f472b6" side={THREE.DoubleSide} />
        </Ring>
        <SceneLabel
          position={[0, 1.65, 0]}
          title="2. QCD AXION (μeV–meV)"
          subtitle="Primakoff B-Field Conversion a + B → γ (ADMX)"
          color="#a855f7"
          visible={showLabels}
        />
      </group>

      {/* Right: CMB Acoustic Peaks & MOND vs ΛCDM Audit */}
      <group
        position={[3.2, 0, 0]}
        scale={selected === "mond_vs_lcdm" || selected === "sterile_neutrino_kev" ? 1.2 : 0.92}
        onClick={() => onSelectObject?.("cmb_third_acoustic_peak_panel")}
      >
        <Line
          points={[
            [-1.2, -0.8, 0],
            [-0.6, 1.1, 0],
            [0.0, -0.2, 0],
            [0.5, 0.55, 0],
            [1.1, 0.52, 0],
          ]}
          color="#34d399"
          lineWidth={3.0}
        />
        <SceneLabel
          position={[0, 1.65, 0]}
          title="3. CMB 3RD PEAK & MOND AUDIT"
          subtitle="Ω_c h² = 0.120 ± 0.001 • Bullet Cluster Challenges MOND"
          color="#34d399"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, -2.35, 0]}
        title="EPISTEMIC BOUNDARY: GRAVITATIONAL EFFECTS MEASURED • PARTICLE IDENTITY UNCONFIRMED"
        subtitle="Non-Baryonic Cold Dark Matter Remains an Open Experimental Frontier"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 16.6 — THE EXPANDING UNIVERSE: HUBBLE-LEMAÎTRE LAW & REDSHIFT
// ============================================================================
const Ch6HubbleLemaitreExpansionScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const h0 = Number(controls.hubbleConstantH0 ?? 70.0);
  const z = Number(controls.observedGalaxyRedshiftZ ?? 0.5);
  const scaleGrid = 0.8 + z * 0.45;

  // Stretched photon wave propagating across expanding space
  const photonWavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const x = -3.8 + t * 7.6;
      const localStretch = 1 + t * z;
      const y = 1.25 + Math.sin((t * 28) / localStretch) * 0.42;
      pts.push([x, y, 0]);
    }
    return pts;
  }, [z]);

  return (
    <group>
      {/* 3D Expanding Comoving Coordinate Grid */}
      <group
        scale={scaleGrid}
        onClick={() => onSelectObject?.("expanding_comoving_coordinate_grid")}
      >
        <mesh>
          <boxGeometry args={[5.8, 2.8, 3.6]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.28} />
        </mesh>
      </group>

      {/* Cosmological Redshift Photon Wave λ_obs = (1 + z) λ_emit */}
      <group onClick={() => onSelectObject?.("cosmological_redshift_photon_wave")}>
        <Line
          points={photonWavePoints}
          color={z > 0.8 ? "#ef4444" : z > 0.35 ? "#f59e0b" : "#38bdf8"}
          lineWidth={3.0}
        />
      </group>

      {/* Bound Local Group Island (Fixed Physical Size — Does NOT Expand!) */}
      <group
        position={[-2.2, -0.6, 0]}
        onClick={() => onSelectObject?.("bound_local_group_non_expanding_island")}
      >
        <Sphere args={[0.45, 20, 20]}>
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={1.2} />
        </Sphere>
        <SceneLabel
          position={[0, -0.95, 0]}
          title="BOUND LOCAL GROUP (FIXED SIZE)"
          subtitle="Gravity Overcomes Hubble Flow on <10 Mpc Scales"
          color="#34d399"
          visible={showLabels}
        />
      </group>

      <SceneLabel
        position={[0, 2.65, 0]}
        title={`METRIC EXPANSION v = H₀ d (H₀ = ${h0.toFixed(1)} km/s/Mpc • Redshift z = ${z.toFixed(2)})`}
        subtitle={`1 + z = a₀ / a(t_emit) = ${(1 + z).toFixed(2)}× Wavelength Stretch (Centerless FLRW Metric)`}
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 16.7 — THE ACCELERATING UNIVERSE: 1998 SUPERNOVA DISCOVERY
// ============================================================================
const Ch7SupernovaAccelerationEvidenceScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const zSn = Number(controls.supernovaRedshiftProbeZ ?? 0.65);

  const { lcdmCurve, matterOnlyCurve } = useMemo(() => {
    const accel: [number, number, number][] = [];
    const decel: [number, number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const zVal = 0.05 + (i / 28) * 1.35;
      const x = 0.4 + (i / 28) * 4.6;
      const yBase = -1.6 + Math.log10(1 + zVal * 4.5) * 3.2;
      accel.push([x, yBase + zVal * 0.42, 0]); // Fainter (higher distance modulus μ)
      decel.push([x, yBase, 0]);
    }
    return { lcdmCurve: accel, matterOnlyCurve: decel };
  }, []);

  const probeX = 0.4 + ((zSn - 0.05) / 1.35) * 4.6;

  return (
    <group>
      {/* Left: Type Ia White Dwarf Thermonuclear Supernova (M_Ch ≈ 1.44 M_☉) */}
      <group
        position={[-2.6, 0, 0]}
        onClick={() => onSelectObject?.("type_ia_white_dwarf_supernova")}
      >
        <Sphere args={[0.55, 28, 28]}>
          <meshStandardMaterial color="#f8fafc" emissive="#38bdf8" emissiveIntensity={2.0} />
        </Sphere>
        <Sphere args={[1.35, 28, 28]}>
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.28} wireframe />
        </Sphere>
        <SceneLabel
          position={[0, 1.95, 0]}
          title="TYPE Ia SUPERNOVA (M_Ch ≈ 1.44 M_☉)"
          subtitle="Standardizable Candle (M_B ≈ -19.3) • ~25% Fainter at z ≈ 0.5–1.0"
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Right: Hubble Diagram Distance Modulus μ(z) */}
      <group onClick={() => onSelectObject?.("hubble_diagram_distance_modulus_plot")}>
        <Line
          points={[
            [0.4, 2.0, 0],
            [0.4, -1.6, 0],
            [5.1, -1.6, 0],
          ]}
          color="#94a3b8"
          lineWidth={1.8}
        />
        <Line points={lcdmCurve} color="#10b981" lineWidth={3.0} />
        <Line points={matterOnlyCurve} color="#f59e0b" lineWidth={2.2} dashed dashScale={4} />
        <Line
          points={[
            [probeX, -1.6, 0],
            [probeX, 1.9, 0],
          ]}
          color="#38bdf8"
          lineWidth={1.6}
          dashed
          dashScale={5}
        />
        <SceneLabel
          position={[2.8, 2.35, 0]}
          title={`HUBBLE DIAGRAM μ(z) AT z = ${zSn.toFixed(2)} (Riess / Perlmutter 1998)`}
          subtitle="Green: Accelerating ΛCDM (Ω_Λ ≈ 0.68) • Amber: Decelerating Matter-Only"
          color="#10b981"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 16.8 — WHAT DARK ENERGY MEANS: FRIEDMANN ACCELERATION & w = -1
// ============================================================================
const Ch8DarkEnergyModelsScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const w = Number(controls.darkEnergyEquationOfStateW ?? -1.0);
  const om = Number(controls.omegaMatterToday ?? 0.315);

  const { matterRhoPts, deRhoPts } = useMemo(() => {
    const m: [number, number, number][] = [];
    const de: [number, number, number][] = [];
    for (let i = 0; i <= 28; i++) {
      const a = 0.25 + (i / 28) * 1.15;
      const x = 0.6 + (i / 28) * 4.4;
      const yMatter = Math.max(-1.5, Math.min(1.8, -0.5 + Math.log10(om * Math.pow(a, -3)) * 0.9));
      const yDe = Math.max(
        -1.5,
        Math.min(1.8, -0.5 + Math.log10((1 - om) * Math.pow(a, -3 * (1 + w))) * 0.9),
      );
      m.push([x, yMatter, 0]);
      de.push([x, yDe, 0]);
    }
    return { matterRhoPts: m, deRhoPts: de };
  }, [w, om]);

  return (
    <group>
      {/* Left: 3D FLRW Expansion History Cone a(t) */}
      <group
        position={[-2.4, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        onClick={() => onSelectObject?.("expansion_history_trumpet_3d")}
      >
        <mesh>
          <cylinderGeometry args={[1.65 * Math.abs(w), 0.35, 3.8, 36, 1, true]} />
          <meshBasicMaterial
            color="#10b981"
            wireframe
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
        <SceneLabel
          position={[2.2, 0, 0]}
          title={`FLRW EXPANSION TRUMPET a(t) (w = ${w.toFixed(2)})`}
          subtitle="ä/a = -(4πG/3)(ρ + 3P/c²) > 0 for w < -1/3"
          color="#10b981"
          visible={showLabels}
        />
      </group>

      {/* Right: Density Evolution ρ_m ∝ a⁻³ vs ρ_DE ∝ a⁻³⁽¹⁺ʷ⁾ */}
      <group onClick={() => onSelectObject?.("density_evolution_curves_rho_a")}>
        <Line
          points={[
            [0.6, 1.9, 0],
            [0.6, -1.6, 0],
            [5.1, -1.6, 0],
          ]}
          color="#94a3b8"
          lineWidth={1.8}
        />
        <Line points={matterRhoPts} color="#818cf8" lineWidth={2.5} />
        <Line points={deRhoPts} color="#10b981" lineWidth={3.0} />
        <SceneLabel
          position={[2.8, 2.3, 0]}
          title="DENSITY EVOLUTION: ρ_m ∝ a⁻³ (Indigo) vs ρ_DE (Green)"
          subtitle="Equality Crossing at a_eq ≈ 0.77 (z_eq ≈ 0.30 • Mathematical Model, Not Visible Fluid)"
          color="#10b981"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// CHAPTER 16.9 — OPEN QUESTIONS: HUBBLE TENSION, DESI w(a) & EPISTEMIC MATRIX
// ============================================================================
const Ch9OpenQuestionsModelsScene: React.FC<Module16ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const fw = String(controls.frontierCosmologyFramework ?? "standard_flat_lcdm");
  const w0 = Number(controls.cplW0Parameter ?? -1.0);

  return (
    <group>
      {/* Left: CPL (w₀, w_a) Parameter Plane & DESI BAO Comparison */}
      <group
        position={[-2.6, 0.3, 0]}
        scale={fw === "desi_cpl_evolving_de" ? 1.15 : 0.96}
        onClick={() => onSelectObject?.("cpl_w0_wa_parameter_plane")}
      >
        <Ring args={[0.7, 1.35, 48]}>
          <meshBasicMaterial color="#10b981" transparent opacity={0.35} side={THREE.DoubleSide} />
        </Ring>
        {/* ΛCDM Benchmark Crosshair (w₀ = -1, w_a = 0) */}
        <Sphere args={[0.16, 16, 16]} position={[-0.35, 0.25, 0]}>
          <meshBasicMaterial color="#fde047" />
        </Sphere>
        {/* Active CPL Probe Marker */}
        <Sphere args={[0.18, 16, 16]} position={[(w0 + 1.0) * 2.2, -0.2, 0]}>
          <meshBasicMaterial color="#38bdf8" />
        </Sphere>
        <SceneLabel
          position={[0, 1.85, 0]}
          title={`DESI 2024–2026 CPL w(a) = w₀ + w_a(1-a) (w₀ = ${w0.toFixed(2)})`}
          subtitle="Gold: Flat ΛCDM (w₀=-1, w_a=0) • Cyan: Evolving DE Hypothesis (Not Proven)"
          color="#38bdf8"
          visible={showLabels}
        />
      </group>

      {/* Right: Hubble Tension Early-vs-Late Calibration Bridge */}
      <group
        position={[2.6, 0.3, 0]}
        scale={fw === "hubble_tension_audit" ? 1.15 : 0.96}
        onClick={() => onSelectObject?.("hubble_tension_calibration_bridge")}
      >
        {/* Early Universe Planck CMB Bar (67.4 km/s/Mpc) */}
        <mesh position={[-0.65, 0, 0]}>
          <boxGeometry args={[0.65, 1.75, 0.45]} />
          <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.9} />
        </mesh>
        {/* Late Universe SH0ES Cepheid + SN Ia Bar (73.0 km/s/Mpc) */}
        <mesh position={[0.65, 0.22, 0]}>
          <boxGeometry args={[0.65, 2.2, 0.45]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.9} />
        </mesh>
        <SceneLabel
          position={[0, 1.85, 0]}
          title="HUBBLE TENSION (~5σ EARLY VS LATE)"
          subtitle="Planck CMB: 67.4 ± 0.5 vs SH0ES Ladder: 73.0 ± 1.0 km/s/Mpc"
          color="#f59e0b"
          visible={showLabels}
        />
      </group>

      {/* Bottom: 4-Tier Epistemic Classification Matrix */}
      <group
        position={[0, -2.15, 0]}
        onClick={() => onSelectObject?.("epistemic_classification_matrix")}
      >
        <Line
          points={[
            [-4.2, 0, 0],
            [4.2, 0, 0],
          ]}
          color="#34d399"
          lineWidth={2.0}
        />
        <SceneLabel
          position={[0, -0.45, 0]}
          title="4-TIER SCIENTIFIC EPISTEMIC CLASSIFICATION"
          subtitle="[1. Measurement: z, θ_E, m_B] • [2. Inference: Ω_m, Ω_Λ] • [3. Prediction: P(k)] • [4. Hypothesis: WIMPs, w(a)]"
          color="#34d399"
          visible={showLabels}
        />
      </group>
    </group>
  );
};

// ============================================================================
// MODULE 16 DIRECTOR DISPATCHER
// ============================================================================
export const Module16CinematicDirectorScene: React.FC<Module16ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m16_ch1_cosmic_energy_pie":
    case "m16_ch1_visible_invisible_matter":
      return <Ch1CosmicEnergyPieScene {...props} />;
    case "m16_ch2_rotation_curve_discrepancy":
    case "m16_ch2_rotation_curve_decomposition":
      return <Ch2RotationCurveDiscrepancyScene {...props} />;
    case "m16_ch3_gravitational_lensing_bench":
    case "m16_ch3_gravitational_lensing_bullet":
      return <Ch3GravitationalLensingBenchScene {...props} />;
    case "m16_ch4_nfw_dark_matter_halos":
    case "m16_ch4_zwicky_coma_virial":
      return <Ch4NfwDarkMatterHalosScene {...props} />;
    case "m16_ch5_dark_matter_candidates":
    case "m16_ch5_dark_matter_evidence_pillars":
      return <Ch5DarkMatterCandidatesScene {...props} />;
    case "m16_ch6_hubble_lemiaitre_expansion":
    case "m16_ch6_measuring_cosmic_expansion":
      return <Ch6HubbleLemaitreExpansionScene {...props} />;
    case "m16_ch7_supernova_acceleration_evidence":
    case "m16_ch7_supernova_acceleration":
      return <Ch7SupernovaAccelerationEvidenceScene {...props} />;
    case "m16_ch8_dark_energy_models":
      return <Ch8DarkEnergyModelsScene {...props} />;
    case "m16_ch9_open_questions_models":
      return <Ch9OpenQuestionsModelsScene {...props} />;
    default:
      return <Ch1CosmicEnergyPieScene {...props} />;
  }
};
