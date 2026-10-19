/**
 * COSMOS Stage 5 — Module 19 (The Fate of the Universe)
 * Complete 8-Chapter Bespoke 3D Scene Suite (51 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 19.1 (`m19-l1`) — Gravity vs Expansion & Critical Density ρ_crit (Ω₀ Spatial Curvature Surfaces k = +1, 0, -1)
 * 19.2 (`m19-l2`) — Four Cosmic Scenarios: Big Freeze, Big Crunch, Big Rip & Big Bounce (a(t) Trajectory Manifold)
 * 19.3 (`m19-l3`) — Fate of the Sun & Solar System (+1.1 Gyr Ocean Loss, +5 Gyr Red Giant, +7.6 Gyr White Dwarf)
 * 19.4 (`m19-l4`) — Milkomeda Merger (+4.5 Gyr) & Local Group Isolation Across the de Sitter Horizon (t > 100 Gyr)
 * 19.5 (`m19-l5`) — End of the Stelliferous Era (Red Dwarf 10¹³ yr Lifetimes & Stellar Shutoff at 10¹⁴ yr)
 * 19.6 (`m19-l6`) — The Degenerate Era & Black Hole Era (10¹⁴–10¹⁰⁰ yr, Hawking Radiation T_H ∝ 1/M & t_evap ∝ M³)
 * 19.7 (`m19-l7`) — The Dark Era & Thermodynamic Heat Death (Maximum Entropy S_max & 10⁻¹²² K de Sitter Bath)
 * 19.8 (`m19-l8`) — Module 19 Synthesis: Cosmological Epistemology & Deep-Future Timeline (10⁰ to 10¹⁰⁰ yr)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module19ChapterSceneProps {
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
    return store.getChapterValues("19", chapterId);
  }, [store, chapterId, version]);
}

function SceneLabel({
  position,
  title,
  subtitle,
  color = "#10b981",
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
// CHAPTER 19.1 — GRAVITY VS EXPANSION & CRITICAL DENSITY (SPATIAL GEOMETRY)
// ============================================================================
const Ch1CriticalDensityGeometryScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const omegaM = Number(controls.omegaMatter0 ?? 0.315);
  const omegaL = Number(controls.omegaLambda0 ?? 0.685);
  const omegaTotal = omegaM + omegaL;
  const omegaK = 1.0 - omegaTotal;

  // Build 2D spatial surface with positive (sphere-like), zero (flat), or negative (saddle) curvature
  const surfaceLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    for (let r = -3; r <= 3; r++) {
      const pts: [number, number, number][] = [];
      for (let c = -20; c <= 20; c++) {
        const x = (c / 20) * 3.4;
        const z = (r / 3) * 2.2;
        const y =
          Math.abs(omegaK) < 0.03
            ? 0
            : omegaK < 0
              ? -0.32 * (x * x * 0.25 + z * z * 0.25) + 0.9
              : 0.28 * (x * x * 0.25 - z * z * 0.35);
        pts.push([x, y - 0.3, z]);
      }
      lines.push(pts);
    }
    return lines;
  }, [omegaK]);

  const geomColor =
    Math.abs(omegaK) < 0.03 ? "#10b981" : omegaK < 0 ? "#f59e0b" : "#38bdf8";

  return (
    <group onClick={() => onSelectObject?.("friedmann_destiny_manifold")}>
      {surfaceLines.map((pts, idx) => (
        <Line key={`surf-${idx}`} points={pts} color={geomColor} lineWidth={2.2} />
      ))}

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`CRITICAL DENSITY BALANCE • Ω_tot = ${omegaTotal.toFixed(3)} (Ω_K = ${omegaK >= 0 ? "+" : ""}${omegaK.toFixed(3)})`}
        subtitle={`ρ_crit = 3H₀²/(8πG) ≈ 8.5 × 10⁻²⁷ kg/m³ (~5 H atoms/m³) • Ω_m = ${omegaM.toFixed(3)}, Ω_Λ = ${omegaL.toFixed(3)}`}
        color={geomColor}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.2 — FOUR COSMIC DESTINY SCENARIOS (FRIEDMANN TRAJECTORIES)
// ============================================================================
const Ch2FourCosmicFatesManifoldScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const w0 = Number(controls.darkEnergyEquationOfStateW ?? -1.0);
  const scenario = String(controls.destinyScenarioSelect ?? "big_freeze_lcdm");

  // 4 Trajectory Curves a(t) from t = 0 to future
  const trajectories = useMemo(() => {
    const freezePts: [number, number, number][] = [];
    const ripPts: [number, number, number][] = [];
    const crunchPts: [number, number, number][] = [];
    const bouncePts: [number, number, number][] = [];

    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const x = -3.4 + u * 6.8;
      // Big Freeze (w = -1 exponential de Sitter)
      freezePts.push([x, -1.8 + Math.pow(u, 0.7) * 1.4 + Math.exp(u * 1.65) * 0.35, 0]);
      // Big Rip (w < -1 phantom finite-time divergence)
      const ripY = u < 0.82 ? -1.8 + Math.pow(u, 0.7) * 1.4 + Math.tan(u * 1.75) * 0.45 : 3.2;
      ripPts.push([x, Math.min(3.2, ripY), 0.3]);
      // Big Crunch (recollapsing closed matter-dominated)
      crunchPts.push([x, -1.8 + Math.sin(u * Math.PI) * 2.1, -0.3]);
      // Big Bounce (non-singular minimum scale factor rebound)
      bouncePts.push([x, -1.5 + Math.pow(u - 0.35, 2) * 4.2, -0.6]);
    }
    return { freezePts, ripPts, crunchPts, bouncePts };
  }, []);

  return (
    <group onClick={() => onSelectObject?.("friedmann_destiny_manifold")}>
      <Line
        points={trajectories.freezePts}
        color="#10b981"
        lineWidth={scenario === "big_freeze_lcdm" ? 4.0 : 1.6}
      />
      <Line
        points={trajectories.ripPts}
        color="#ef4444"
        lineWidth={scenario === "big_rip_phantom" || w0 < -1.03 ? 4.0 : 1.6}
      />
      <Line
        points={trajectories.crunchPts}
        color="#f59e0b"
        lineWidth={scenario === "big_crunch_closed" ? 4.0 : 1.6}
      />
      <Line
        points={trajectories.bouncePts}
        color="#a855f7"
        lineWidth={scenario === "big_bounce_cyclic" ? 4.0 : 1.6}
      />

      <SceneLabel
        position={[-1.8, 2.7, 0]}
        title="BIG FREEZE (w = -1, ΛCDM FAVORED)"
        subtitle="Eternal accelerating expansion → Heat Death"
        color="#10b981"
        visible={showLabels}
      />
      <SceneLabel
        position={[2.1, 2.9, 0.3]}
        title={`BIG RIP (w = ${w0.toFixed(2)} < -1 PHANTOM)`}
        subtitle="Divergent dark energy unbinds clusters, stars & atoms"
        color="#ef4444"
        visible={showLabels}
      />
      <SceneLabel
        position={[1.9, -1.4, -0.3]}
        title="BIG CRUNCH / BIG BOUNCE"
        subtitle="Recollapse (requires Λ ≤ 0 or decaying dark energy)"
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.3 — FATE OF THE SUN & INNER SOLAR SYSTEM (+1 TO +8 GYR)
// ============================================================================
const Ch3SolarRedGiantFateScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const tFutureGyr = Number(controls.solarFutureTimeGyr ?? 5.4);

  const isWhiteDwarf = tFutureGyr >= 7.6;
  const isRedGiant = tFutureGyr >= 5.0 && tFutureGyr < 7.6;
  const sunRadius = isWhiteDwarf
    ? 0.16
    : isRedGiant
      ? 0.65 + ((tFutureGyr - 5.0) / 2.5) * 1.65
      : 0.55 + (tFutureGyr / 5.0) * 0.15;

  const orbitRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 0.3 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("milkomeda_merger_and_red_giant")}>
      {/* Evolving Sun: Main Sequence → Red Giant → Carbon-Oxygen White Dwarf + Planetary Nebula */}
      <Sphere args={[sunRadius, 36, 36]}>
        <meshStandardMaterial
          color={isWhiteDwarf ? "#e0f2fe" : isRedGiant ? "#ef4444" : "#fde047"}
          emissive={isWhiteDwarf ? "#38bdf8" : isRedGiant ? "#dc2626" : "#f59e0b"}
          emissiveIntensity={isWhiteDwarf ? 1.8 : 1.3}
        />
      </Sphere>

      {/* Planetary Nebula Shell if t >= 7.6 Gyr */}
      {isWhiteDwarf && (
        <Sphere args={[2.8, 32, 32]}>
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#a855f7"
            emissiveIntensity={0.9}
            transparent
            opacity={0.32}
          />
        </Sphere>
      )}

      {/* Inner Planetary Orbits (Mercury 0.9, Venus 1.5, Earth 2.2) */}
      <group ref={orbitRef}>
        <Torus args={[2.25, 0.02, 12, 64]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#38bdf8" />
        </Torus>
        <Sphere position={[2.25, 0, 0]} args={[0.16, 20, 20]}>
          <meshStandardMaterial
            color={tFutureGyr >= 1.1 ? "#dc2626" : "#3b82f6"}
            emissive={tFutureGyr >= 5.0 ? "#ef4444" : "#1d4ed8"}
            emissiveIntensity={0.7}
          />
        </Sphere>
      </group>

      <SceneLabel
        position={[0, 3.2, 0]}
        title={`SOLAR EVOLUTION AT +${tFutureGyr.toFixed(1)} GYR FROM TODAY`}
        subtitle={
          tFutureGyr < 1.1
            ? "Habitable Window: Main-sequence hydrogen fusion brightening ~10% per Gyr"
            : tFutureGyr < 5.0
              ? "+1.1 Gyr Moist Greenhouse: Earth's oceans evaporate long before Red Giant phase"
              : isRedGiant
                ? "Red Giant Phase (+5.0 to +7.5 Gyr): Mercury & Venus engulfed; Earth scorched near 1 AU"
                : "+7.6 Gyr Planetary Nebula & C-O White Dwarf (M ≈ 0.54 M_☉, R ≈ 1 R_⊕)"
        }
        color={isWhiteDwarf ? "#38bdf8" : isRedGiant ? "#ef4444" : "#fbbf24"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.4 — MILKOMEDA MERGER (+4.5 GYR) & DE SITTER HORIZON ISOLATION
// ============================================================================
const Ch4MilkomedaLocalIsolationScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const tGyr = Number(controls.localGroupTimeGyr ?? 4.5);
  const merged = tGyr >= 5.5;
  const sep = merged ? 0 : Math.max(0.15, (5.5 - tGyr) * 0.42);

  const spinRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * 0.25 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("milkomeda_merger_and_red_giant")}>
      <group ref={spinRef}>
        {merged ? (
          /* Giant Elliptical Galaxy Milkomeda */
          <Sphere args={[1.55, 36, 36]} scale={[1.35, 0.9, 1.1]}>
            <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.1} />
          </Sphere>
        ) : (
          /* Approaching / Interacting Milky Way & Andromeda Spirals */
          <>
            <group position={[-sep, 0.2, 0]} rotation={[0.7, 0.3, 0]}>
              <Torus args={[1.05, 0.14, 16, 48]}>
                <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.95} />
              </Torus>
            </group>
            <group position={[sep, -0.2, 0]} rotation={[-0.7, -0.3, 0]}>
              <Torus args={[1.2, 0.16, 16, 48]}>
                <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.95} />
              </Torus>
            </group>
          </>
        )}
      </group>

      {/* Cosmological de Sitter Event Horizon Ring (d_H = c/H_∞ ≈ 16.5 Gly) */}
      <Ring args={[3.2, 3.32, 64]} rotation={[Math.PI / 2.2, 0, 0]}>
        <meshBasicMaterial
          color={tGyr >= 100 ? "#ef4444" : "#10b981"}
          side={THREE.DoubleSide}
        />
      </Ring>

      <SceneLabel
        position={[0, 3.1, 0]}
        title={
          merged
            ? `MILKOMEDA GIANT ELLIPTICAL (+${tGyr.toFixed(1)} GYR)`
            : `MW–ANDROMEDA APPROACH (+${tGyr.toFixed(1)} GYR • v_rad ≈ -110 km/s)`
        }
        subtitle={
          tGyr >= 100
            ? "t > 100 Gyr: All unbound galaxies have crossed the de Sitter horizon (d_H ≈ 16.5 Gly)"
            : "Local gravity overcomes Hubble expansion inside the bound Local Group; stars rarely collide"
        }
        color={tGyr >= 100 ? "#ef4444" : "#38bdf8"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.5 — END OF THE STELLIFEROUS ERA (RED DWARF TRILLION-YEAR LIFETIMES)
// ============================================================================
const Ch5StelliferousFadeoutScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const log10AgeYr = Number(controls.stelliferousLog10TimeYr ?? 12.5);
  const redDwarfMass = Number(controls.redDwarfMassSolar ?? 0.1);
  const tMainSeqYr = 1e10 * Math.pow(redDwarfMass, -2.5);
  const log10Lifetime = Math.log10(tMainSeqYr);

  const starsAlive = log10AgeYr < 14.0;

  return (
    <group onClick={() => onSelectObject?.("five_ages_hawking_evaporation")}>
      {/* Fully Convective Red Dwarf (0.08–0.25 M_☉) */}
      <Sphere args={[0.95, 32, 32]}>
        <meshStandardMaterial
          color={starsAlive ? "#ef4444" : "#334155"}
          emissive={starsAlive ? "#dc2626" : "#0f172a"}
          emissiveIntensity={starsAlive ? 1.25 : 0.15}
        />
      </Sphere>

      <SceneLabel
        position={[0, 2.3, 0]}
        title={`STELLIFEROUS ERA • t = 10^${log10AgeYr.toFixed(1)} YR`}
        subtitle={`M-Dwarf (${redDwarfMass.toFixed(2)} M_☉) Main-Sequence Lifetime ≈ 10^${log10Lifetime.toFixed(2)} yr (${(tMainSeqYr / 1e12).toFixed(2)} Trillion yr)`}
        color={starsAlive ? "#ef4444" : "#94a3b8"}
        visible={showLabels}
      />
      <SceneLabel
        position={[0, -2.2, 0]}
        title="WHY RED DWARFS OUTLIVE SUN-LIKE STARS BY 100–1,000×"
        subtitle="Low core pressure burns ¹H slowly AND full interior convection recycles nearly 100% of hydrogen fuel"
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.6 — DEGENERATE & BLACK HOLE ERAS (HAWKING EVAPORATION t ∝ M³)
// ============================================================================
const Ch6HawkingEvaporationBlackHolesScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const log10MassSolar = Number(controls.log10BlackHoleMassSolar ?? 1.0);
  const log10EvapYr = 67.32 + 3 * log10MassSolar;
  const hawkingTempK = 6.17e-8 / Math.pow(10, log10MassSolar);

  const ringRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.45 * Math.max(0.1, timeScale);
    }
  });

  const horizonR = 0.55 + (log10MassSolar / 10) * 1.45;

  return (
    <group onClick={() => onSelectObject?.("five_ages_hawking_evaporation")}>
      {/* Black Hole Event Horizon */}
      <Sphere args={[horizonR, 36, 36]}>
        <meshBasicMaterial color="#020617" />
      </Sphere>

      {/* Quantum Pair-Fluctuation & Hawking Thermal Emission Ring */}
      <group ref={ringRef}>
        <Ring args={[horizonR * 1.08, horizonR * 1.24, 64]}>
          <meshBasicMaterial color="#8b5cf6" side={THREE.DoubleSide} />
        </Ring>
        <Torus args={[horizonR * 1.38, 0.04, 16, 64]}>
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
        </Torus>
      </group>

      <SceneLabel
        position={[0, 2.9, 0]}
        title={`BLACK HOLE ERA • M = 10^${log10MassSolar.toFixed(1)} M_☉`}
        subtitle={`Hawking Evaporation Time t_evap = 5120πG²M³/(ℏc⁴) ≈ 10^${log10EvapYr.toFixed(1)} yr`}
        color="#8b5cf6"
        visible={showLabels}
      />
      <SceneLabel
        position={[0, -2.5, 0]}
        title={`HAWKING TEMPERATURE T_H = ℏc³/(8πGMk_B) ≈ ${hawkingTempK.toExponential(2)} K`}
        subtitle="[Extrapolated Semiclassical QFT] • Proton decay (τ_p > 1.6×10³⁴ yr) remains unconfirmed"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.7 — THE DARK ERA & THERMODYNAMIC HEAT DEATH (MAXIMUM ENTROPY)
// ============================================================================
const Ch7DarkEraHeatDeathScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const log10TimeYr = Number(controls.darkEraLog10TimeYr ?? 100);
  const eqReached = log10TimeYr >= 100;

  // Entropy curve S(t) approaching asymptotic de Sitter horizon maximum S_max
  const entropyCurve = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 80; i++) {
      const u = i / 80;
      const x = -3.4 + u * 6.8;
      const y = -1.6 + (1 - Math.exp(-u * 4.5)) * 2.8;
      pts.push([x, y, 0]);
    }
    return pts;
  }, []);

  return (
    <group onClick={() => onSelectObject?.("five_ages_hawking_evaporation")}>
      <Line points={entropyCurve} color="#8b5cf6" lineWidth={3.2} />
      {/* Asymptotic S_max ceiling line */}
      <Line
        points={[
          [-3.4, 1.25, 0],
          [3.4, 1.25, 0],
        ]}
        color="#34d399"
        lineWidth={1.6}
      />

      <SceneLabel
        position={[0, 2.3, 0]}
        title={
          eqReached
            ? `DARK ERA (t = 10^${log10TimeYr.toFixed(0)} YR) • MAXIMUM ENTROPY S → S_max`
            : `APPROACHING HEAT DEATH (t = 10^${log10TimeYr.toFixed(0)} YR)`
        }
        subtitle="ΔT → 0 across space → Zero extractable thermodynamic work (W = Q_H(1 - T_C/T_H) → 0)"
        color="#8b5cf6"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 19.8 — MODULE 19 SYNTHESIS: FIVE AGES LOGARITHMIC TIMELINE
// ============================================================================
const Ch8DeepFutureSynthesisScene: React.FC<Module19ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const era = String(controls.fiveAgesSelector ?? "all_five_ages");

  const ages = [
    { id: "primordial_era", x: -3.4, label: "1. PRIMORDIAL (<10⁶ yr)", color: "#f59e0b" },
    { id: "stelliferous_era", x: -1.7, label: "2. STELLIFEROUS (10⁶–10¹⁴ yr)", color: "#38bdf8" },
    { id: "degenerate_era", x: 0, label: "3. DEGENERATE (10¹⁴–10⁴⁰ yr)", color: "#10b981" },
    { id: "black_hole_era", x: 1.7, label: "4. BLACK HOLE (10⁴⁰–10¹⁰⁰ yr)", color: "#8b5cf6" },
    { id: "dark_era", x: 3.4, label: "5. DARK ERA (>10¹⁰⁰ yr)", color: "#64748b" },
  ];

  return (
    <group onClick={() => onSelectObject?.("five_ages_hawking_evaporation")}>
      <Line
        points={[
          [-3.4, 0, 0],
          [3.4, 0, 0],
        ]}
        color="#475569"
        lineWidth={3}
      />
      {ages.map((a) => {
        const active = era === "all_five_ages" || era === a.id;
        return (
          <group key={a.id} position={[a.x, 0, 0]}>
            <Sphere args={[active ? 0.55 : 0.35, 24, 24]}>
              <meshStandardMaterial
                color={a.color}
                emissive={a.color}
                emissiveIntensity={active ? 1.15 : 0.35}
              />
            </Sphere>
            <SceneLabel
              position={[0, 1.15, 0]}
              title={a.label}
              color={a.color}
              visible={showLabels}
            />
          </group>
        );
      })}
      <SceneLabel
        position={[0, -2.2, 0]}
        title="EPISTEMIC AUDIT OF DEEP-FUTURE COSMOLOGY"
        subtitle="[Measured: H₀, Ω_m, Ω_Λ] • [Extrapolated: Milkomeda, Red Dwarfs, Hawking T_H] • [Unconfirmed: Proton Decay, w(a)]"
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 19 DIRECTOR DISPATCHER
// ============================================================================
export const Module19CinematicDirectorScene: React.FC<Module19ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m19_ch1_ancient_worldviews_sky":
    case "m19_ch1_critical_density_geometry" as ProofOfConceptSceneComponentId:
      return <Ch1CriticalDensityGeometryScene {...props} />;
    case "m19_ch2_eratosthenes_spherical_earth_lab":
    case "m19_ch2_four_cosmic_fates_manifold" as ProofOfConceptSceneComponentId:
      return <Ch2FourCosmicFatesManifoldScene {...props} />;
    case "m19_ch3_ptolemaic_epicycle_equant_3d":
    case "m19_ch3_solar_red_giant_fate" as ProofOfConceptSceneComponentId:
      return <Ch3SolarRedGiantFateScene {...props} />;
    case "m19_ch4_global_astronomy_traditions_3d":
    case "m19_ch4_milkomeda_local_isolation" as ProofOfConceptSceneComponentId:
      return <Ch4MilkomedaLocalIsolationScene {...props} />;
    case "m19_ch5_copernican_heliocentric_retrograde":
    case "m19_ch5_stelliferous_fadeout" as ProofOfConceptSceneComponentId:
      return <Ch5StelliferousFadeoutScene {...props} />;
    case "m19_ch6_galileo_kepler_newton_breakthrough":
    case "m19_ch6_hawking_evaporation_black_holes" as ProofOfConceptSceneComponentId:
      return <Ch6HawkingEvaporationBlackHolesScene {...props} />;
    case "m19_ch7_great_debate_cepheid_distance":
    case "m19_ch7_dark_era_heat_death" as ProofOfConceptSceneComponentId:
      return <Ch7DarkEraHeatDeathScene {...props} />;
    case "m19_ch8_modern_cosmology_observatories":
    case "m19_ch8_deep_future_synthesis" as ProofOfConceptSceneComponentId:
      return <Ch8DeepFutureSynthesisScene {...props} />;
    default:
      return <Ch1CriticalDensityGeometryScene {...props} />;
  }
};
