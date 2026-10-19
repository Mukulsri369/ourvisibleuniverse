/**
 * COSMOS Stage 5 — Module 18 (13.8 Billion Years of Cosmic History)
 * Complete 8-Chapter Bespoke 3D Scene Suite (46 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 18.1 (`m18-l1`) — The Cosmic Dark Ages (Neutral Hydrogen Fog & 21-cm Hyperfine Spin-Flip at 1420.4 MHz)
 * 18.2 (`m18-l2`) — Cosmic Dawn & First Stars (Population III Stars 10–300 M_☉, H₂ Cooling & Pair-Instability SNe)
 * 18.3 (`m18-l3`) — The Epoch of Reionization (Expanding UV H II "Swiss-Cheese" Bubbles z ≈ 15 → 6)
 * 18.4 (`m18-l4`) — First Galaxies & JWST High-Redshift Frontier (Protogalactic Minihalo Mergers at z ≈ 10–14)
 * 18.5 (`m18-l5`) — Cosmic Noon & Peak Star Formation (Madau–Lilly SFRD Peak at z ≈ 2 & AGN Feedback)
 * 18.6 (`m18-l6`) — Birth of the Solar System at 9.2 Billion Years (Presolar Nebula Collapse 4.567 Gyr Ago)
 * 18.7 (`m18-l7`) — The Cosmic Calendar (Carl Sagan's 365-Day Compression: 1 Day ≈ 37.8 Myr, 1 Second ≈ 437.5 yr)
 * 18.8 (`m18-l8`) — Module 18 Synthesis: 13.8 Billion Years of Unbroken Matter Evolution (H/He → Stardust → Life)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module18ChapterSceneProps {
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
    return store.getChapterValues("18", chapterId);
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
// CHAPTER 18.1 — THE COSMIC DARK AGES & 21-CM HYPERFINE SPIN-FLIP
// ============================================================================
const Ch1DarkAges21cmScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.darkAgesRedshiftZ ?? 50);
  const nuObsMHz = 1420.40575 / (1 + z);
  const lambdaObsM = 0.21106 * (1 + z);

  const atomRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (atomRef.current) {
      atomRef.current.rotation.y += delta * 0.35 * Math.max(0.1, timeScale);
    }
  });

  // 21-cm radio wave emitted during spin-flip transition
  const wavePoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 90; i++) {
      const u = i / 90;
      const x = 0.8 + u * 3.2;
      const y = Math.sin(u * 22) * 0.42;
      pts.push([x, y, 0]);
    }
    return pts;
  }, []);

  return (
    <group onClick={() => onSelectObject?.("pop_iii_first_stars_halos")}>
      {/* Left/Center: Neutral Hydrogen (H I) Atom with Proton & Electron Spin Vectors */}
      <group ref={atomRef} position={[-1.2, 0, 0]}>
        {/* Central Proton */}
        <Sphere args={[0.38, 24, 24]}>
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.85} />
        </Sphere>
        {/* Proton Spin Arrow (Up) */}
        <Line
          points={[
            [0, -0.75, 0],
            [0, 0.75, 0],
          ]}
          color="#ef4444"
          lineWidth={3}
        />

        {/* 1s Bohr Orbit & Electron */}
        <Torus args={[1.35, 0.025, 16, 64]} rotation={[Math.PI / 2.2, 0, 0]}>
          <meshBasicMaterial color="#60a5fa" />
        </Torus>
        <group position={[1.35, 0, 0]}>
          <Sphere args={[0.18, 20, 20]}>
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.1} />
          </Sphere>
          {/* Electron Spin Arrow (Antiparallel after flip) */}
          <Line
            points={[
              [0, 0.55, 0],
              [0, -0.55, 0],
            ]}
            color="#38bdf8"
            lineWidth={3}
          />
        </group>
      </group>

      {/* Emitted 21-cm Hyperfine Photon Wavepacket */}
      <Line points={wavePoints} color="#f59e0b" lineWidth={3.0} />

      <SceneLabel
        position={[-1.2, 2.1, 0]}
        title={`COSMIC DARK AGES (z = ${z.toFixed(0)}) • ZERO STARS`}
        subtitle="Neutral Hydrogen (H I) hyperfine spin-flip: parallel (F=1) → antiparallel (F=0)"
        color="#60a5fa"
        visible={showLabels}
      />
      <SceneLabel
        position={[2.4, 1.3, 0]}
        title={`21-CM LINE REDSHIFTED TO λ_obs = ${lambdaObsM.toFixed(2)} m`}
        subtitle={`Rest ν₀ = 1420.4 MHz (ΔE = 5.87 μeV) → Observed ν_obs = ${nuObsMHz.toFixed(1)} MHz`}
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.2 — COSMIC DAWN & POPULATION III FIRST STARS
// ============================================================================
const Ch2CosmicDawnPopIIIScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const pop3Mass = Number(controls.popIIIMassSolar ?? 160);
  const isPISN = pop3Mass >= 140 && pop3Mass <= 260;

  const starRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (starRef.current) {
      starRef.current.rotation.y += delta * 0.24 * Math.max(0.1, timeScale);
    }
  });

  const starRadius = Math.min(2.1, 0.65 + (pop3Mass / 300) * 1.35);

  return (
    <group onClick={() => onSelectObject?.("pop_iii_first_stars_halos")}>
      {/* Surrounding Dark Matter Minihalo (~10⁶ M_☉) */}
      <Sphere args={[3.2, 32, 32]}>
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.18} />
      </Sphere>

      {/* Massive Metal-Free Population III Star (T_eff ~ 80,000–100,000 K) */}
      <group ref={starRef}>
        <Sphere args={[starRadius, 40, 40]}>
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={1.65}
          />
        </Sphere>
        {/* Hard UV ionizing corona & Pair-Instability Supernova heavy-element shell */}
        {isPISN && (
          <Torus args={[starRadius + 0.55, 0.08, 16, 64]} rotation={[0.9, 0.4, 0]}>
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.2} />
          </Torus>
        )}
      </group>

      <SceneLabel
        position={[0, 3.3, 0]}
        title={`POPULATION III STAR • M = ${pop3Mass} M_☉ (METALLICITY Z = 0)`}
        subtitle="Formed via molecular H₂ cooling at T ≈ 200 K → High Jeans mass M_J ∝ T^(3/2) ρ^(-1/2)"
        color="#38bdf8"
        visible={showLabels}
      />
      <SceneLabel
        position={[0, -2.9, 0]}
        title={
          isPISN
            ? "FATE: PAIR-INSTABILITY SUPERNOVA (140–260 M_☉) — TOTAL DISRUPTION"
            : pop3Mass > 260
              ? "FATE: DIRECT COLLAPSE TO INTERMEDIATE-MASS BLACK HOLE"
              : "FATE: CORE-COLLAPSE SUPERNOVA + BLACK HOLE REMNANT"
        }
        subtitle={
          isPISN
            ? "e⁻e⁺ pair production triggers runaway thermonuclear explosion, seeding first C, O, Mg, Si, Fe"
            : "Short lifetime (~2–5 Myr) enriches pristine intergalactic medium for Population II stars"
        }
        color={isPISN ? "#f59e0b" : "#a855f7"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.3 — THE EPOCH OF REIONIZATION (SWISS-CHEESE UV BUBBLES)
// ============================================================================
const Ch3ReionizationBubblesScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.reionizationRedshiftZ ?? 8.5);
  const xHII = 1 / (1 + Math.exp((z - 7.8) / 1.1));
  const bubbleScale = 0.35 + xHII * 1.45;

  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.14 * Math.max(0.1, timeScale);
    }
  });

  const bubbleCenters: [number, number, number][] = [
    [-1.4, 0.3, 0.2],
    [1.3, -0.2, -0.3],
    [0.1, 0.9, 0.6],
    [-0.3, -0.8, -0.5],
  ];

  return (
    <group onClick={() => onSelectObject?.("reionization_swiss_cheese_igm")}>
      <group ref={groupRef}>
        {/* Outer Neutral IGM Box / Fog */}
        <Sphere args={[3.3, 32, 32]}>
          <meshStandardMaterial
            color="#475569"
            transparent
            opacity={Math.max(0.08, (1 - xHII) * 0.55)}
          />
        </Sphere>

        {/* Overlapping Ionized H II Bubbles around Early Star-Forming Galaxies */}
        {bubbleCenters.map((pos, idx) => (
          <group key={`hii-${idx}`} position={pos}>
            <Sphere args={[bubbleScale, 28, 28]}>
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0284c7"
                emissiveIntensity={0.75}
                transparent
                opacity={0.38}
              />
            </Sphere>
            <Sphere args={[0.14, 16, 16]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          </group>
        ))}
      </group>

      <SceneLabel
        position={[0, 3.4, 0]}
        title={`EPOCH OF REIONIZATION • z = ${z.toFixed(1)} (IONIZED FRACTION Q_HII ≈ ${(xHII * 100).toFixed(1)}%)`}
        subtitle="Lyman-continuum UV photons (E > 13.6 eV) carve overlapping H II bubbles; complete by z ≈ 6 (t ≈ 1 Gyr)"
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.4 — FIRST GALAXIES & JWST HIGH-REDSHIFT FRONTIER
// ============================================================================
const Ch4FirstGalaxiesJwstScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.jwstTargetRedshiftZ ?? 12.0);

  const mergerRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (mergerRef.current) {
      mergerRef.current.rotation.y += delta * 0.25 * Math.max(0.1, timeScale);
    }
  });

  const separation = Math.max(0.35, (z - 6) * 0.22);

  return (
    <group onClick={() => onSelectObject?.("reionization_swiss_cheese_igm")}>
      <group ref={mergerRef}>
        {/* Merging Clumpy Protogalaxies */}
        <group position={[-separation, 0.2, 0]}>
          <Torus args={[0.85, 0.16, 16, 40]} rotation={[0.9, 0.3, 0]}>
            <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={1.1} />
          </Torus>
          <Sphere args={[0.32, 20, 20]}>
            <meshBasicMaterial color="#fde047" />
          </Sphere>
        </group>

        <group position={[separation, -0.2, 0]}>
          <Torus args={[0.72, 0.14, 16, 40]} rotation={[-0.8, 0.5, 0]}>
            <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={1.0} />
          </Torus>
          <Sphere args={[0.26, 20, 20]}>
            <meshBasicMaterial color="#fde047" />
          </Sphere>
        </group>
      </group>

      <SceneLabel
        position={[0, 2.8, 0]}
        title={`JWST HIGH-REDSHIFT PROTOGALAXIES • z = ${z.toFixed(1)}`}
        subtitle={`Lyman-break dropout λ_obs ≈ ${(121.6 * (1 + z) / 1000).toFixed(2)} μm (NIRCam) • Hierarchical bottom-up assembly`}
        color="#f43f5e"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.5 — COSMIC NOON & PEAK STAR FORMATION (MADAU-LILLY PLOT)
// ============================================================================
const Ch5CosmicNoonStarburstScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const z = Number(controls.cosmicNoonRedshiftZ ?? 2.0);
  const psi =
    (0.015 * Math.pow(1 + z, 2.7)) / (1 + Math.pow((1 + z) / 2.9, 5.6));

  const jetRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (jetRef.current) {
      jetRef.current.rotation.y += delta * 0.3 * Math.max(0.1, timeScale);
    }
  });

  // Madau-Lilly curve across z = 0 to 8
  const madauCurve = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 80; i++) {
      const zVal = (i / 80) * 8.0;
      const sfrd =
        (0.015 * Math.pow(1 + zVal, 2.7)) / (1 + Math.pow((1 + zVal) / 2.9, 5.6));
      const x = -3.2 + (zVal / 8.0) * 6.4;
      const y = -2.2 + (sfrd / 0.135) * 1.9;
      pts.push([x, y, 1.2]);
    }
    return pts;
  }, []);

  const markerX = -3.2 + (Math.min(8, z) / 8.0) * 6.4;
  const markerY = -2.2 + (psi / 0.135) * 1.9;

  return (
    <group onClick={() => onSelectObject?.("reionization_swiss_cheese_igm")}>
      {/* Starburst Disk + Bipolar AGN Quasar Outflow Jets */}
      <group ref={jetRef} position={[0, 0.7, 0]}>
        <Torus args={[1.65, 0.22, 20, 64]} rotation={[Math.PI / 2.3, 0, 0]}>
          <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={0.8 + psi * 6} />
        </Torus>
        {/* Bipolar AGN Feedback Cone */}
        <Line
          points={[
            [0, -2.1, 0],
            [0, 2.1, 0],
          ]}
          color="#38bdf8"
          lineWidth={3.2}
        />
      </group>

      {/* Madau-Lilly Star Formation History Curve */}
      <Line points={madauCurve} color="#fbbf24" lineWidth={3.0} />
      <Sphere position={[markerX, markerY, 1.2]} args={[0.16, 16, 16]}>
        <meshBasicMaterial color="#ef4444" />
      </Sphere>

      <SceneLabel
        position={[0, 3.2, 0]}
        title={`COSMIC NOON (z = ${z.toFixed(1)}) • ψ(z) = ${psi.toFixed(3)} M_☉ yr⁻¹ Mpc⁻³`}
        subtitle="Peak star formation ~10 Gyr ago (~10× today's rate) • Co-evolution with SMBH AGN feedback"
        color="#a855f7"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.6 — BIRTH OF THE SOLAR SYSTEM AT t = 9.2 BILLION YEARS
// ============================================================================
const Ch6SolarSystemBirthScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  timeScale,
  isPaused,
  showLabels,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const zSolar = Number(controls.presolarMetallicityZ ?? 0.0142);

  const diskRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isPaused || reducedMotion) return;
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.28 * Math.max(0.1, timeScale);
    }
  });

  return (
    <group onClick={() => onSelectObject?.("solar_system_presolar_nebula")}>
      <group ref={diskRef} rotation={[0.42, 0, 0]}>
        {/* Young Protosun at t = 9.2 Gyr (4.567 Gyr Ago) */}
        <Sphere args={[0.72, 32, 32]}>
          <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={1.5} />
        </Sphere>

        {/* Protoplanetary Dust & Planetesimal Rings */}
        {[1.3, 1.85, 2.45, 3.05].map((r, i) => (
          <Torus key={`ring-${i}`} args={[r, 0.055 + zSolar * 1.5, 16, 64]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color={i < 2 ? "#f97316" : "#38bdf8"}
              emissive={i < 2 ? "#ea580c" : "#0284c7"}
              emissiveIntensity={0.65}
            />
          </Torus>
        ))}
      </group>

      <SceneLabel
        position={[0, 2.9, 0]}
        title={`SOLAR SYSTEM BIRTH AT t ≈ 9.2 Gyr (4.567 Gyr AGO • z ≈ 0.45)`}
        subtitle={`Population I Sun (Z = ${(zSolar * 100).toFixed(2)}% heavy elements) • Formed after 67% of cosmic history`}
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.7 — CARL SAGAN'S 365-DAY COSMIC CALENDAR
// ============================================================================
const Ch7CosmicCalendar365Scene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const day = Number(controls.cosmicCalendarDay ?? 245);
  const cosmicAgeGyr = (day / 365) * 13.8;
  const angle = ((day - 1) / 365) * Math.PI * 2;

  const milestones = [
    { d: 1, label: "Jan 1: Big Bang (0 Gyr)", color: "#f59e0b" },
    { d: 130, label: "May 11: Milky Way Disk (4.9 Gyr)", color: "#38bdf8" },
    { d: 245, label: "Sept 2: Solar System (9.2 Gyr)", color: "#fbbf24" },
    { d: 365, label: "Dec 31 23:59:46: Recorded History", color: "#10b981" },
  ];

  return (
    <group onClick={() => onSelectObject?.("solar_system_presolar_nebula")}>
      {/* 365-Day Circular Cosmic Calendar Dial */}
      <Torus args={[2.6, 0.08, 20, 96]} rotation={[0.35, 0, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </Torus>

      {/* Milestone Nodes around Calendar Ring */}
      {milestones.map((m) => {
        const a = ((m.d - 1) / 365) * Math.PI * 2;
        const x = Math.cos(a) * 2.6;
        const z = Math.sin(a) * 2.6;
        return (
          <group key={m.label} position={[x, 0, z]}>
            <Sphere args={[0.18, 20, 20]}>
              <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={1.1} />
            </Sphere>
          </group>
        );
      })}

      {/* Active Day Pointer */}
      <group position={[Math.cos(angle) * 2.6, 0.25, Math.sin(angle) * 2.6]}>
        <Sphere args={[0.28, 24, 24]}>
          <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={1.4} />
        </Sphere>
      </group>

      <SceneLabel
        position={[0, 2.8, 0]}
        title={`COSMIC CALENDAR DAY ${day} / 365 (t = ${cosmicAgeGyr.toFixed(2)} Gyr)`}
        subtitle="1 Calendar Day = 37.8 Myr • 1 Second = 437.5 yr • Sept 2 = Sun & Earth • Dec 31 23:52 = Humans"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 18.8 — MODULE 18 SYNTHESIS: 13.8 BILLION YEARS OF MATTER EVOLUTION
// ============================================================================
const Ch8CosmicHistorySynthesisScene: React.FC<Module18ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const stage = String(controls.matterCycleStage ?? "full_chain");

  const nodes = [
    {
      id: "primordial_bbn",
      pos: [-3.3, 0, 0] as [number, number, number],
      title: "1. BBN (t = 3 min)",
      sub: "75% ¹H • 25% ⁴He (Z = 0)",
      color: "#38bdf8",
    },
    {
      id: "stellar_forges",
      pos: [-1.1, 0.5, 0] as [number, number, number],
      title: "2. POP III & COSMIC NOON",
      sub: "Supernovae & Kilonovae forge C, O, Fe, Au",
      color: "#a855f7",
    },
    {
      id: "planetary_biosphere",
      pos: [1.3, -0.3, 0] as [number, number, number],
      title: "3. SOLAR SYSTEM (9.2 Gyr)",
      sub: "Z = 1.42% Dust → Rocky Earth",
      color: "#fbbf24",
    },
    {
      id: "observing_cosmos",
      pos: [3.3, 0.3, 0] as [number, number, number],
      title: "4. PRESENT (13.8 Gyr)",
      sub: "Atoms of Stardust Decoding the Cosmos",
      color: "#10b981",
    },
  ];

  return (
    <group onClick={() => onSelectObject?.("solar_system_presolar_nebula")}>
      <Line
        points={nodes.map((n) => n.pos)}
        color="#60a5fa"
        lineWidth={2.8}
      />
      {nodes.map((n) => {
        const highlighted = stage === "full_chain" || stage === n.id;
        return (
          <group key={n.id} position={n.pos}>
            <Sphere args={[highlighted ? 0.65 : 0.45, 28, 28]}>
              <meshStandardMaterial
                color={n.color}
                emissive={n.color}
                emissiveIntensity={highlighted ? 1.15 : 0.4}
              />
            </Sphere>
            <SceneLabel
              position={[0, 1.25, 0]}
              title={n.title}
              subtitle={n.sub}
              color={n.color}
              visible={showLabels}
            />
          </group>
        );
      })}
    </group>
  );
};

// ============================================================================
// MODULE 18 DIRECTOR DISPATCHER
// ============================================================================
export const Module18CinematicDirectorScene: React.FC<Module18ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m18_ch1_comoving_expansion_grid":
    case "m18_ch1_dark_ages_21cm" as ProofOfConceptSceneComponentId:
      return <Ch1DarkAges21cmScene {...props} />;
    case "m18_ch2_proper_comoving_distance_evolution":
    case "m18_ch2_cosmic_dawn_pop_iii" as ProofOfConceptSceneComponentId:
      return <Ch2CosmicDawnPopIIIScene {...props} />;
    case "m18_ch3_hubble_lemaitre_diagram_3d":
    case "m18_ch3_reionization_bubbles" as ProofOfConceptSceneComponentId:
      return <Ch3ReionizationBubblesScene {...props} />;
    case "m18_ch4_cosmological_redshift_spectrometer":
    case "m18_ch4_first_galaxies_jwst" as ProofOfConceptSceneComponentId:
      return <Ch4FirstGalaxiesJwstScene {...props} />;
    case "m18_ch5_flrw_scale_factor_solver":
    case "m18_ch5_cosmic_noon_starburst" as ProofOfConceptSceneComponentId:
      return <Ch5CosmicNoonStarburstScene {...props} />;
    case "m18_ch6_lookback_light_cone_distances":
    case "m18_ch6_solar_system_birth_9gyr" as ProofOfConceptSceneComponentId:
      return <Ch6SolarSystemBirthScene {...props} />;
    case "m18_ch7_cosmological_horizons_spacetime":
    case "m18_ch7_cosmic_calendar_365" as ProofOfConceptSceneComponentId:
      return <Ch7CosmicCalendar365Scene {...props} />;
    case "m18_ch8_bound_vs_expanding_systems":
    case "m18_ch8_cosmic_history_synthesis" as ProofOfConceptSceneComponentId:
      return <Ch8CosmicHistorySynthesisScene {...props} />;
    default:
      return <Ch1DarkAges21cmScene {...props} />;
  }
};
