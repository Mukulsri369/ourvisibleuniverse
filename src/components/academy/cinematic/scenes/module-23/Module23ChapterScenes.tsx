/**
 * COSMOS Stage 6 — Module 23 (Astrobiology & Life in the Universe)
 * Complete 10-Chapter Bespoke 3D Scene Suite (52 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 23.1 (`1` / `23-1`) — What Is Life? Chemical Requirements (CHNOPS, Carbon Tetravalence, Liquid H₂O & Gibbs Free Energy ΔG < 0)
 * 23.2 (`2` / `23-2`) — Extremophiles on Earth (395 K Hydrothermal Black Smokers, Atacama Dryness, Acidophiles & Deinococcus radiodurans)
 * 23.3 (`3` / `23-3`) — Mars: Ancient Rivers & Modern Subsurface (Noachian Jezero Delta Clays/Carbonates vs Modern UV/Perchlorates)
 * 23.4 (`4` / `23-4`) — Ocean Worlds: Europa & Enceladus (Tidal Flexing Heat, Subsurface Saltwater Oceans & Cassini H₂/Organic Plumes)
 * 23.5 (`5` / `23-5`) — Titan: Prebiotic Chemistry & Methane Cycle (1.45 bar N₂-CH₄ Atmosphere, Kraken Mare & Dragonfly Rotorcraft)
 * 23.6 (`6` / `23-6`) — The Circumstellar Habitable Zone (Kopparapu Runaway Greenhouse Inner Edge & Max CO₂ Greenhouse Outer Edge)
 * 23.7 (`7` / `23-7`) — Exoplanet Biosignatures & Atmospheric Spectroscopy (JWST Transit Transmission Δ(R_p/R_*)² & O₂/O₃ + CH₄ Disequilibrium)
 * 23.8 (`8` / `23-8`) — SETI & The Drake Equation (N = R_* f_p n_e f_l f_i f_c L & the 1.42–1.66 GHz Water-Hole Radio Window)
 * 23.9 (`9` / `23-9`) — The Fermi Paradox & Great Filter Hypotheses (50 Myr Galactic Crossing Time vs Early/Late Evolutionary Filters)
 * 23.10 (`10` / `23-10`) — Scientific Evidence vs Speculation (Confidence of Life Detection CoLD Scale & Extraordinary Evidence Standard)
 */

import React, { useMemo, useSyncExternalStore } from "react";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module23ChapterSceneProps {
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
    return store.getChapterValues("23", chapterId);
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
// CHAPTER 23.1 — WHAT IS LIFE? CHNOPS & LIQUID WATER SOLVENT
// ============================================================================
const Ch1ChnopsWaterChemistryScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const solvent = String(controls.solventType ?? "water_h2o");

  const tetraVertices: [number, number, number][] = [
    [0, 1.15, 0],
    [-1.05, -0.45, 0.65],
    [1.05, -0.45, 0.65],
    [0, -0.45, -1.1],
  ];

  return (
    <group onClick={() => onSelectObject?.("jwst_transit_biosignature_spectrum")}>
      {/* Central Tetravalent Carbon Atom (4 Covalent Bonds) */}
      <Sphere args={[0.38, 28, 28]}>
        <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.5} />
      </Sphere>
      {tetraVertices.map((pos, idx) => (
        <group key={`bond-${idx}`}>
          <Line points={[[0, 0, 0], pos]} color="#94a3b8" lineWidth={3.0} />
          <Sphere args={[0.24, 24, 24]} position={pos}>
            <meshStandardMaterial
              color={["#38bdf8", "#f59e0b", "#ef4444", "#a855f7"][idx]}
              roughness={0.35}
            />
          </Sphere>
        </group>
      ))}

      <SceneLabel
        position={[0, 2.45, 0]}
        title="BIOCHEMICAL FOUNDATIONS: CHNOPS + TETRAVALENT CARBON + LIQUID SOLVENT"
        subtitle={`Solvent: ${solvent.replace(/_/g, " ").toUpperCase()} • Polar H₂O Dipole (104.5°) & ΔG < 0 Redox Disequilibrium`}
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.2 — EXTREMOPHILES ON EARTH (HYDROTHERMAL VENTS TO SUBGLACIAL LAKES)
// ============================================================================
const Ch2ExtremophilesHydrothermalScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const niche = String(controls.extremophileNiche ?? "hydrothermal_black_smoker");

  return (
    <group onClick={() => onSelectObject?.("europa_enceladus_cutaway")}>
      {/* Seafloor Basalt + Hydrothermal Black Smoker Vent Chimney */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.2, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.45, 0]}>
        <cylinderGeometry args={[0.32, 0.65, 1.8, 24]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Glowing Chemosynthetic Plume (H₂ + CO₂ -> CH₄ + 2H₂O) */}
      <Sphere args={[0.55, 24, 24]} position={[0, 0.95, 0]}>
        <meshBasicMaterial color="#f97316" transparent opacity={0.55} />
      </Sphere>

      <SceneLabel
        position={[0, 2.5, 0]}
        title="EARTH EXTREMOPHILES EXPAND THE ENVELOPE OF HABITABILITY"
        subtitle={`Active Niche: ${niche.replace(/_/g, " ").toUpperCase()} • Sunlight-Independent Chemosynthesis up to 122°C (395 K)`}
        color="#f97316"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.3 — MARS: ANCIENT JEZERO DELTA VS MODERN SUBSURFACE
// ============================================================================
const Ch3MarsAncientVsSubsurfaceScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const depthMeters = Math.max(0, Number(controls.subsurfaceDepthMeters ?? 2.0));

  return (
    <group onClick={() => onSelectObject?.("europa_enceladus_cutaway")}>
      {/* Stratified Martian Crust Cutaway (UV-Irradiated Regolith -> Shielded Phyllosilicates) */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.8, 0.55, 1.6]} />
        <meshStandardMaterial color="#c2410c" roughness={0.88} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[3.8, 1.05, 1.6]} />
        <meshStandardMaterial color="#0f766e" roughness={0.75} />
      </mesh>
      {/* Subsurface Drill Depth Marker */}
      <Line
        points={[
          [0, 1.2, 0.85],
          [0, 0.72 - Math.min(1.5, depthMeters * 0.45), 0.85],
        ]}
        color="#38bdf8"
        lineWidth={3.2}
      />

      <SceneLabel
        position={[0, 2.45, 0]}
        title={`MARS HABITABILITY: NOACHIAN CLAYS & SUBSURFACE SHIELDING (d = ${depthMeters.toFixed(1)} m)`}
        subtitle={
          depthMeters >= 1.5
            ? "Shielded Below ≥1.5 m from Solar UV, GCRs & Surface Perchlorate Oxidation"
            : "Unshielded Surface Zone: High UV Flux & Oxidizing Perchlorates Degrade Organics"
        }
        color={depthMeters >= 1.5 ? "#10b981" : "#f59e0b"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.4 — OCEAN WORLDS: EUROPA & ENCELADUS SUBSURFACE OCEANS
// ============================================================================
const Ch4EuropaEnceladusOceansScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const world = String(controls.oceanWorld ?? "enceladus_plumes");

  return (
    <group onClick={() => onSelectObject?.("europa_enceladus_cutaway")}>
      {/* Concentric Interior Cutaway: Rocky Core + Global Liquid Saltwater Ocean + Ice Shell */}
      <Sphere args={[0.72, 28, 28]}>
        <meshStandardMaterial color="#78716c" roughness={0.85} />
      </Sphere>
      <Ring args={[0.74, 1.32, 48]}>
        <meshStandardMaterial color="#0284c7" side={THREE.DoubleSide} transparent opacity={0.82} />
      </Ring>
      <Ring args={[1.34, 1.52, 48]}>
        <meshStandardMaterial color="#f8fafc" side={THREE.DoubleSide} />
      </Ring>

      {/* South Polar Tiger-Stripe Cryovolcanic Plume Jets (H₂, CO₂, CH₄, NaCl, Silica) */}
      <Line points={[[0, -1.52, 0], [0, -2.55, 0]]} color="#38bdf8" lineWidth={3.4} />
      <Line points={[[-0.25, -1.5, 0], [-0.55, -2.4, 0]]} color="#7dd3fc" lineWidth={2.2} />
      <Line points={[[0.25, -1.5, 0], [0.55, -2.4, 0]]} color="#7dd3fc" lineWidth={2.2} />

      <SceneLabel
        position={[0, 2.5, 0]}
        title="SUBSURFACE OCEAN WORLDS BEYOND THE FROST LINE (TIDAL DISSIPATION)"
        subtitle={`Target: ${world.replace(/_/g, " ").toUpperCase()} • Liquid Saltwater In Direct Contact With Hydrothermal Rock Core`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.5 — TITAN: PREBIOTIC ORGANIC CHEMISTRY & DRAGONFLY
// ============================================================================
const Ch5TitanMethaneDragonflyScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const region = String(controls.titanRegion ?? "selk_crater_dragonfly");

  return (
    <group onClick={() => onSelectObject?.("europa_enceladus_cutaway")}>
      {/* Titan Golden Tholin Haze Globe (94 K, 1.45 bar N₂/CH₄) */}
      <Sphere args={[1.25, 36, 36]}>
        <meshStandardMaterial color="#d97706" roughness={0.5} />
      </Sphere>
      <Sphere args={[1.38, 32, 32]}>
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.26} />
      </Sphere>

      <SceneLabel
        position={[0, 2.45, 0]}
        title="TITAN (94 K, 1.45 BAR N₂/CH₄): HYDROCARBON LAKES & THOLIN PREBIOTIC LAB"
        subtitle={`Region: ${region.replace(/_/g, " ").toUpperCase()} • Dragonfly RTG Octocopter Targets Selk Impact Melt Organics`}
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.6 — CIRCUMSTELLAR HABITABLE ZONE (KOPPARAPU S_eff = L / d²)
// ============================================================================
const Ch6KopparapuHabitableZoneScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const lumSolar = Math.max(0.001, Number(controls.stellarLuminositySolar ?? 1.0));
  const distAu = Math.max(0.02, Number(controls.orbitalDistanceAu ?? 1.0));
  const sEff = lumSolar / (distAu * distAu);
  const inHz = sEff <= 1.1 && sEff >= 0.35;

  const innerR = Math.min(2.2, Math.max(0.45, Math.sqrt(lumSolar / 1.1) * 1.35));
  const outerR = Math.min(3.2, Math.max(0.85, Math.sqrt(lumSolar / 0.35) * 1.35));
  const planetR = Math.min(3.4, Math.max(0.35, distAu * 1.35));

  return (
    <group onClick={() => onSelectObject?.("kopparapu_habitable_zone_annulus")}>
      {/* Host Star */}
      <Sphere args={[0.34, 28, 28]}>
        <meshBasicMaterial color={lumSolar < 0.1 ? "#f87171" : "#fde047"} />
      </Sphere>
      {/* Green Kopparapu Habitable Zone Annulus */}
      <Ring args={[innerR, outerR, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} transparent opacity={0.32} />
      </Ring>
      {/* Test Exoplanet */}
      <Sphere args={[0.18, 24, 24]} position={[planetR, 0, 0]}>
        <meshStandardMaterial color={inHz ? "#38bdf8" : "#ef4444"} />
      </Sphere>

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`KOPPARAPU HABITABLE ZONE: S_eff = (L/L_☉)/d² = ${sEff.toFixed(2)} S_⊕`}
        subtitle={`Inner Runaway Greenhouse (1.10 S_⊕) to Outer Max CO₂ (0.35 S_⊕) -> ${
          inHz ? "TEMPERATE HABITABLE ZONE" : sEff > 1.1 ? "TOO HOT (VENUS RUNAWAY)" : "TOO COLD (FROZEN)"
        }`}
        color={inHz ? "#10b981" : "#f59e0b"}
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.7 — EXOPLANET BIOSIGNATURES & JWST TRANSIT SPECTROSCOPY
// ============================================================================
const Ch7ExoplanetBiosignaturesScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const atm = String(controls.atmosphereProfile ?? "earth_disequilibrium_o2_ch4");

  return (
    <group onClick={() => onSelectObject?.("jwst_transit_biosignature_spectrum")}>
      {/* Background Host Star + Transiting Planet with Glowing Atmospheric Limb Annulus */}
      <Sphere args={[1.45, 36, 36]} position={[0, 0, -0.8]}>
        <meshBasicMaterial color="#fde047" />
      </Sphere>
      <Sphere args={[0.48, 32, 32]} position={[0, 0, 0.5]}>
        <meshBasicMaterial color="#020617" />
      </Sphere>
      <Ring args={[0.48, 0.58, 48]} position={[0, 0, 0.51]}>
        <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.88} />
      </Ring>

      <SceneLabel
        position={[0, 2.5, 0]}
        title="JWST TRANSMISSION SPECTROSCOPY: Δ(R_p(λ)/R_*)² & CHEMICAL DISEQUILIBRIUM"
        subtitle={`Atmosphere: ${atm.replace(/_/g, " ").toUpperCase()} • Simultaneous O₂/O₃ + CH₄ + H₂O Requires Active Flux`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.8 — SETI & THE DRAKE EQUATION (N = R_* f_p n_e f_l f_i f_c L)
// ============================================================================
const Ch8SetiDrakeEquationScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const lifetimeYears = Math.max(10, Number(controls.civilizationLifetimeYears ?? 10000));
  const nCivs = Math.max(0.01, 2.0 * 1.0 * 0.2 * 0.1 * 0.1 * 0.1 * lifetimeYears);

  return (
    <group onClick={() => onSelectObject?.("galactic_seti_drake_disk")}>
      {/* Milky Way Galactic Disk with Active Communicating Civilization Nodes (N) */}
      <Ring args={[0.35, 2.65, 64]} rotation={[Math.PI / 2.4, 0, 0]}>
        <meshBasicMaterial color="#1e1b4b" side={THREE.DoubleSide} transparent opacity={0.65} />
      </Ring>
      {Array.from({ length: Math.min(24, Math.max(1, Math.round(Math.log10(nCivs + 1) * 8))) }).map((_, idx) => {
        const a = (idx / 12) * Math.PI * 2;
        const r = 0.7 + (idx % 4) * 0.45;
        return (
          <Sphere
            key={`civ-${idx}`}
            args={[0.09, 16, 16]}
            position={[Math.cos(a) * r, Math.sin(a) * r * 0.4, Math.sin(a) * r]}
          >
            <meshBasicMaterial color="#10b981" />
          </Sphere>
        );
      })}

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`DRAKE EQUATION: N = R_* f_p n_e f_l f_i f_c L ≈ ${nCivs.toFixed(1)} CIVILIZATIONS`}
        subtitle={`Detectable Lifetime L = ${lifetimeYears.toLocaleString()} yr • 1.420 GHz H I – 1.667 GHz OH Water-Hole Band`}
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.9 — THE FERMI PARADOX & GREAT FILTER HYPOTHESES
// ============================================================================
const Ch9FermiParadoxGreatFilterScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const filterStage = String(controls.greatFilterStage ?? "eukaryogenesis_rare_earth");

  const rungs = [
    { x: -2.4, label: "1. Habitable World", color: "#38bdf8" },
    { x: -1.2, label: "2. Abiogenesis", color: "#22c55e" },
    { x: 0.0, label: "3. Eukaryotes", color: "#eab308" },
    { x: 1.2, label: "4. Intelligence", color: "#f97316" },
    { x: 2.4, label: "5. Galactic Durability", color: "#ef4444" },
  ];

  return (
    <group onClick={() => onSelectObject?.("galactic_seti_drake_disk")}>
      {rungs.map((r, i) => (
        <group key={`rung-${i}`} position={[r.x, 0, 0]}>
          <Torus args={[0.48, 0.05, 16, 48]} rotation={[0, Math.PI / 2, 0]}>
            <meshStandardMaterial color={r.color} emissive={r.color} emissiveIntensity={0.6} />
          </Torus>
        </group>
      ))}

      <SceneLabel
        position={[0, 2.45, 0]}
        title="FERMI PARADOX (t_gal ≈ 5–50 Myr << 10 Gyr) & THE GREAT FILTER"
        subtitle={`Evaluated Bottleneck: ${filterStage.replace(/_/g, " ").toUpperCase()}`}
        color="#f59e0b"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 23.10 — SCIENTIFIC EVIDENCE VS SPECULATION (CoLD SCALE 1–7)
// ============================================================================
const Ch10ColdEvidenceFrameworkScene: React.FC<Module23ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const coldLevel = Math.max(1, Math.min(7, Number(controls.coldScaleLevel ?? 4)));

  return (
    <group onClick={() => onSelectObject?.("jwst_transit_biosignature_spectrum")}>
      {/* 7-Rung CoLD Ladder */}
      {Array.from({ length: 7 }).map((_, idx) => {
        const level = idx + 1;
        const active = level <= coldLevel;
        return (
          <mesh key={`cold-${level}`} position={[(level - 4) * 0.85, (level - 4) * 0.25, 0]}>
            <boxGeometry args={[0.62, 0.28 + level * 0.18, 0.4]} />
            <meshStandardMaterial
              color={active ? "#10b981" : "#334155"}
              emissive={active ? "#059669" : "#000000"}
              emissiveIntensity={active ? 0.5 : 0}
            />
          </mesh>
        );
      })}

      <SceneLabel
        position={[0, 2.5, 0]}
        title={`CONFIDENCE OF LIFE DETECTION (CoLD) SCALE: LEVEL ${coldLevel} / 7`}
        subtitle="Signal Detection -> Contamination Exclusion -> Abiotic Elimination -> Independent Confirmation"
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 23 DIRECTOR DISPATCHER
// ============================================================================
export const Module23CinematicDirectorScene: React.FC<Module23ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m23_ch1_chnops_water_chemistry":
      return <Ch1ChnopsWaterChemistryScene {...props} />;
    case "m23_ch2_extremophiles_hydrothermal":
      return <Ch2ExtremophilesHydrothermalScene {...props} />;
    case "m23_ch3_mars_ancient_vs_subsurface":
      return <Ch3MarsAncientVsSubsurfaceScene {...props} />;
    case "m23_ch4_europa_enceladus_oceans":
      return <Ch4EuropaEnceladusOceansScene {...props} />;
    case "m23_ch5_titan_methane_dragonfly":
      return <Ch5TitanMethaneDragonflyScene {...props} />;
    case "m23_ch6_kopparapu_habitable_zone":
      return <Ch6KopparapuHabitableZoneScene {...props} />;
    case "m23_ch7_exoplanet_biosignatures_jwst":
      return <Ch7ExoplanetBiosignaturesScene {...props} />;
    case "m23_ch8_seti_drake_equation":
      return <Ch8SetiDrakeEquationScene {...props} />;
    case "m23_ch9_fermi_paradox_great_filter":
      return <Ch9FermiParadoxGreatFilterScene {...props} />;
    case "m23_ch10_cold_evidence_framework":
      return <Ch10ColdEvidenceFrameworkScene {...props} />;
    default:
      return <Ch6KopparapuHabitableZoneScene {...props} />;
  }
};
