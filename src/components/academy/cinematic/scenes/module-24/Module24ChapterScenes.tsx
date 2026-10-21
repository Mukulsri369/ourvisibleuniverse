// @ts-nocheck
/**
 * COSMOS Stage 6 — Module 24 (Becoming a Space Scientist & Final Graduation)
 * Complete 3-Chapter Bespoke 3D Scene Suite (9 Canonical Explorer Narration Segments)
 *
 * Chapters:
 * 24.1 (`m24-sub1`) — Citizen Science & Amateur Astronomy (Galaxy Zoo, Planet Hunters TESS, IASC Asteroids, AAVSO & Vera Rubin LSST)
 * 24.2 (`m24-sub2`) — Space Science Careers & Indian/Global Institutions (ISRO, IIST, IUCAA, IIA, PRL, NCRA-GMRT & Global Pathways)
 * 24.3 (`m24-sub3`) — The Complete Cosmic Synthesis & Final Graduation (24-Module 6-Stage Master Synthesis from Earth to 93 Gly Observable Horizon)
 */

import React, { useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line, Ring, Sphere, Torus } from "@react-three/drei";
import * as THREE from "three";
import type { ProofOfConceptSceneComponentId } from "@/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "@/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";

export interface Module24ChapterSceneProps {
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
    return store.getChapterValues("24", chapterId);
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
// CHAPTER 24.1 — CITIZEN SCIENCE & VERA RUBIN LSST OPEN DATA ARCHIVES
// ============================================================================
const Ch1CitizenScienceZooniverseScene: React.FC<Module24ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const project = String(controls.citizenProject ?? "planet_hunters_tess");

  return (
    <group onClick={() => onSelectObject?.("citizen_science_sky_survey_dome")}>
      {/* Vera Rubin 8.4m Simonyi Survey Telescope Dome + All-Sky Alert Stream */}
      <Sphere args={[1.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#38bdf8" wireframe />
      </Sphere>
      {[
        [-1.8, 0.9, 0],
        [0, 1.35, 0],
        [1.8, 0.9, 0],
      ].map((pos, idx) => (
        <group key={`alert-${idx}`}>
          <Line points={[[0, -0.2, 0], pos as [number, number, number]]} color="#fbbf24" lineWidth={2.0} />
          <Sphere args={[0.18, 20, 20]} position={pos as [number, number, number]}>
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.8} />
          </Sphere>
        </group>
      ))}

      <SceneLabel
        position={[0, 2.5, 0]}
        title="CITIZEN SCIENCE & OPEN ARCHIVES: VERA RUBIN LSST (20 TB/NIGHT, 10M ALERTS)"
        subtitle={`Active Program: ${project.replace(/_/g, " ").toUpperCase()} • Galaxy Zoo, Planet Hunters TESS, IASC & AAVSO`}
        color="#38bdf8"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 24.2 — SPACE SCIENCE CAREERS & INDIAN / GLOBAL INSTITUTIONS
// ============================================================================
const Ch2SpaceCareersInstitutionsScene: React.FC<Module24ChapterSceneProps> = ({
  chapterId,
  showLabels,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const pathway = String(controls.careerPathway ?? "observational_data_astrophysics");

  const nodes: { pos: [number, number, number]; label: string; color: string }[] = [
    { pos: [-2.1, 0.65, 0], label: "ISRO / IIST", color: "#f59e0b" },
    { pos: [-0.7, 1.15, 0], label: "IUCAA / NCRA-GMRT", color: "#38bdf8" },
    { pos: [0.7, 1.15, 0], label: "IIA / ARIES / PRL", color: "#10b981" },
    { pos: [2.1, 0.65, 0], label: "IISc / IISER / IIT", color: "#a855f7" },
  ];

  return (
    <group onClick={() => onSelectObject?.("indian_global_research_network")}>
      {nodes.map((n, idx) => (
        <group key={`inst-${idx}`} position={n.pos}>
          <Sphere args={[0.28, 24, 24]}>
            <meshStandardMaterial color={n.color} emissive={n.color} emissiveIntensity={0.5} />
          </Sphere>
          <SceneLabel position={[0, -0.55, 0]} title={n.label} color={n.color} visible={showLabels} />
        </group>
      ))}
      <Line
        points={nodes.map((n) => n.pos)}
        color="#e2e8f0"
        lineWidth={2.0}
      />

      <SceneLabel
        position={[0, 2.5, 0]}
        title="INDIAN & GLOBAL SPACE SCIENCE CAREER PATHWAYS"
        subtitle={`Selected Specialization: ${pathway.replace(/_/g, " ").toUpperCase()} • Physics, Math, Python/C++ & Instrumentation`}
        color="#10b981"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// CHAPTER 24.3 — COMPLETE 6-STAGE COSMIC SYNTHESIS & FINAL GRADUATION
// ============================================================================
const Ch3CosmicSynthesisGraduationScene: React.FC<Module24ChapterSceneProps> = ({
  chapterId,
  showLabels,
  isPaused,
  reducedMotion,
  onSelectObject,
}) => {
  const controls = useChapterControls(chapterId);
  const activeStage = Math.max(1, Math.min(6, Number(controls.synthesisStage ?? 6)));
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (isPaused || reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.14;
  });

  const stageRings = [
    { stage: 1, r: 0.55, color: "#38bdf8", name: "Stage 1: Sky & Scales" },
    { stage: 2, r: 0.95, color: "#22c55e", name: "Stage 2: Solar System & Orbits" },
    { stage: 3, r: 1.35, color: "#eab308", name: "Stage 3: Stars & Nucleosynthesis" },
    { stage: 4, r: 1.75, color: "#a855f7", name: "Stage 4: Galaxies & Black Holes" },
    { stage: 5, r: 2.15, color: "#f97316", name: "Stage 5: Big Bang & Cosmology" },
    { stage: 6, r: 2.55, color: "#fbbf24", name: "Stage 6: Space Scientist Synthesis" },
  ];

  return (
    <group ref={groupRef} onClick={() => onSelectObject?.("cosmic_synthesis_graduation_orrery")}>
      <Sphere args={[0.28, 28, 28]}>
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.1} />
      </Sphere>
      {stageRings.map((s) => {
        const isHighlighted = s.stage <= activeStage;
        return (
          <Torus
            key={`stage-ring-${s.stage}`}
            args={[s.r, isHighlighted ? 0.035 : 0.015, 16, 64]}
            rotation={[Math.PI / 2.3 + s.stage * 0.08, s.stage * 0.12, 0]}
          >
            <meshStandardMaterial
              color={s.color}
              emissive={s.color}
              emissiveIntensity={isHighlighted ? 0.85 : 0.15}
            />
          </Torus>
        );
      })}

      <SceneLabel
        position={[0, 2.65, 0]}
        title={`COMPLETE 24-MODULE COSMIC SYNTHESIS (STAGE ${activeStage} / 6)`}
        subtitle="We Are Star-Stuff Studying the Stars: Nuclear Ashes Forged in Supernovae Exploring 93 Billion Light-Years"
        color="#fbbf24"
        visible={showLabels}
      />
    </group>
  );
};

// ============================================================================
// MODULE 24 DIRECTOR DISPATCHER
// ============================================================================
export const Module24CinematicDirectorScene: React.FC<Module24ChapterSceneProps> = (props) => {
  switch (props.sceneComponentId) {
    case "m24_ch1_citizen_science_zooniverse":
      return <Ch1CitizenScienceZooniverseScene {...props} />;
    case "m24_ch2_space_careers_institutions":
      return <Ch2SpaceCareersInstitutionsScene {...props} />;
    case "m24_ch3_cosmic_synthesis_graduation":
      return <Ch3CosmicSynthesisGraduationScene {...props} />;
    default:
      return <Ch3CosmicSynthesisGraduationScene {...props} />;
  }
};
