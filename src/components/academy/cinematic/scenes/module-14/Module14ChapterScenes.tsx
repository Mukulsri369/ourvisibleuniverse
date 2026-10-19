/**
 * MODULE 14 — BLACK HOLES & NEUTRON STARS: 8 COMPLETE CINEMATIC CHAPTER SCENES
 * Project: Our Visible Universe Academy
 * Scope: Prompt 08 — Phase D (Chapters 14.1 through 14.8)
 *
 * Implements 8 distinct relativistic and compact-object 3D chapter experiences:
 * - Chapter 14.1 (StellarCollapseScene): Massive supergiant 120° onion-skin fusion cutaway
 *   (H → He → C → Ne → O → Si → ⁵⁶Fe), hydrostatic equilibrium breakdown (endothermic iron peak
 *   + electron capture + photodisintegration), core implosion, and 3-way remnant comparator.
 * - Chapter 14.2 (CompactObjectsScene): Earth-sized White Dwarf (R ≈ 6,000 km, M_Ch ≈ 1.44 M_☉,
 *   electron degeneracy) vs city-sized Neutron Star (R ≈ 11 km / D ≈ 22 km suspended over a
 *   25-km city reference grid, M_TOV ≈ 2.0–2.3 M_☉ with EOS uncertainty).
 * - Chapter 14.3 (BlackHoleConceptScene): Birkhoff's Theorem 1 M_☉ Sun ↔ 1 M_☉ Black Hole
 *   (r_s = 2.95 km) swap proving Earth's 1.00 AU orbit (29.78 km/s) does NOT fall inward,
 *   plus strong-field lensing near r < 15 r_s.
 * - Chapter 14.4 (EventHorizonScene): Non-rotating Schwarzschild metric shells (1.0 r_s Event
 *   Horizon, 1.5 r_s Photon Sphere, 2.60 r_s Critical Impact Parameter b_c, 3.0 r_s ISCO) and
 *   interactive null geodesic photon ray tracing (capture, circular photon orbit, deflection).
 * - Chapter 14.5 (AccretionDiskScene): Novikov-Thorne differential shear disk, Kerr spin a*
 *   efficiency (6% → 42%), Relativistic Doppler Beaming asymmetry (I ∝ δ³), and lensed far-side arch.
 * - Chapter 14.6 (PulsarMagnetarScene): Spin axis Ω vs tilted magnetic dipole axis μ (angle α),
 *   observer sightline ζ, live radio pulse-profile trace, and Magnetar (10¹¹ T) twisted flux loops
 *   with full reduced-motion safety.
 * - Chapter 14.7 (SupermassiveBlackHoleScene): Sagittarius A* (4.15 × 10⁶ M_☉) with Star S2's
 *   e = 0.8846 rosette-precessing orbit (v_max = 7,650 km/s = 2.55% c) vs M87* (6.5 × 10⁹ M_☉)
 *   with 30-AU Solar System scale ring inside its shadow and 5,000-ly relativistic jet.
 * - Chapter 14.8 (GravitationalWaveScene): LIGO GW150914 (36 M_☉ + 29 M_☉ → 62 M_☉ + 3 M_☉ c²)
 *   binary coalescence across Inspiral, Merger, and Ringdown on a transverse quadrupole strain
 *   mesh (h_+, h_×) with live synchronized chirp waveform h(t).
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
  NebulaVolume,
  OrbitalTrajectoryRenderer,
  PulsarBeamRenderer,
  ScientificBlackHoleEffects,
  ScientificPlanetMaterial,
  ScientificStarMaterial,
  ScientificVectorField,
  type VectorArrowDescriptor,
} from "../../science";

export interface Module14SceneProps {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  reducedMotion: boolean;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}

function useM14Controls(chapterId: string): ChapterControlValueMap {
  const store = CosmosChapterInteractionStore.getInstance();
  const [values, setValues] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues("14", chapterId),
  );

  useEffect(() => {
    setValues(store.getChapterValues("14", chapterId));
    return store.subscribe(() => {
      setValues(store.getChapterValues("14", chapterId));
    });
  }, [store, chapterId]);

  return values;
}

// ============================================================================
// CHAPTER 14.1 — MASSIVE STELLAR COLLAPSE (Onion Shells, ⁵⁶Fe Crisis & Remnants)
// ============================================================================
export function StellarCollapseScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("massive-collapse");
  const mZams = Number(controls.progenitorMassSolar ?? 20);
  const collapseStage = String(controls.collapseStage ?? "onion_shells");

  const isIronCrisis = collapseStage === "iron_crisis";
  const isImplosion = collapseStage === "core_implosion";

  // Hydrostatic vectors: outward pressure (cyan) vs inward gravity (amber)
  const hydrostaticVectors: VectorArrowDescriptor[] = useMemo(() => {
    const dirs: [number, number, number][] = [
      [1, 0.5, 0],
      [-1, 0.5, 0],
      [0, 1, 0],
      [0, -1, 0],
    ];
    const outLen = isImplosion ? 0.15 : isIronCrisis ? 0.45 : 1.35;
    const inLen = isImplosion ? 2.1 : isIronCrisis ? 1.85 : 1.35;
    const res: VectorArrowDescriptor[] = [];
    for (const d of dirs) {
      res.push(
        {
          origin: [d[0] * 1.1, d[1] * 1.1, 0],
          direction: d,
          length: outLen,
          colorHex: "#22d3ee", // Outward thermal + radiation pressure ∇P
        },
        {
          origin: [d[0] * 2.3, d[1] * 2.3, 0],
          direction: [-d[0], -d[1], 0],
          length: inLen,
          colorHex: "#f59e0b", // Inward self-gravity ρg
        },
      );
    }
    return res;
  }, [isIronCrisis, isImplosion]);

  return (
    <group>
      {/* Massive Supergiant with 120° Interior Cutaway (H → He → C → Ne → O → Si → ⁵⁶Fe) */}
      <ScientificStarMaterial
        objectId="supergiant_onion_core"
        sceneId={sceneId}
        name={`Massive Progenitor (${mZams} M_☉)`}
        temperatureK={isImplosion ? 28000 : 3800}
        position={[-1.4, 0.2, 0]}
        radius={isImplosion ? 0.95 : 1.95}
        showCutaway
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("supergiant_onion_core")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Core-Collapse Supernova Shockwave Shell in Stage 3 */}
      {isImplosion && (
        <NebulaVolume
          objectId="supernova_remnant"
          sceneId={sceneId}
          nebulaType="supernova_remnant"
          position={[-1.4, 0.2, 0]}
          scale={4.8}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          onSelectObject={onSelectObject}
        />
      )}

      {/* Hydrostatic Balance / Collapse Vectors */}
      <group position={[-1.4, 0.2, 0]}>
        <ScientificVectorField vectors={hydrostaticVectors} />
      </group>

      {/* 3-Branch Evolutionary Remnant Pathway Comparator (Right Side) */}
      <group
        position={[3.2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("remnant_bifurcation_diagram");
        }}
      >
        {/* Branch 1: White Dwarf (< 8 M_☉) */}
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={mZams < 8 ? 1.8 : 0.4}
          />
        </mesh>
        {/* Branch 2: Neutron Star (~8–20 M_☉) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#22d3ee"
            emissiveIntensity={mZams >= 8 && mZams <= 20 ? 2.2 : 0.4}
          />
        </mesh>
        {/* Branch 3: Stellar Black Hole (> 20 M_☉) */}
        <group position={[0, -1.6, 0]}>
          <mesh>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.32, 0.56, 32]} />
            <meshBasicMaterial color={mZams > 20 ? "#fbbf24" : "#64748b"} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 14.2 — WHITE DWARFS VS NEUTRON STARS (Degeneracy & 25-km City Grid)
// ============================================================================
export function CompactObjectsScene({
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("white-dwarfs-vs-neutron-stars");
  const mCore = Number(controls.remnantCoreMassSolar ?? 1.4);
  const viewMode = String(controls.compactViewMode ?? "side_by_side");

  const isNeutronDominant = mCore > 1.44 || viewMode === "city_grid_zoom";
  const nsSpinRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!isSimulationRunning || !nsSpinRef.current) return;
    nsSpinRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 2.2;
  });

  // 25-km City Skyline Reference Grid beneath the R = 11 km (D = 22 km) Neutron Star
  const cityBlocks = useMemo(() => {
    const arr: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    for (let gx = -4; gx <= 4; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        const h = 0.08 + ((Math.abs(gx * 7 + gz * 13) % 10) / 10) * 0.28;
        arr.push({
          pos: [2.2 + gx * 0.34, -1.25 + h / 2, gz * 0.34],
          scale: [0.22, h, 0.22],
        });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Left: White Dwarf (R ≈ 6,000 km, D ≈ 12,000 km • Electron Degeneracy M_Ch ≈ 1.44 M_☉) */}
      <group
        position={[-2.3, 0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("white_dwarf_body");
        }}
      >
        <mesh>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#38bdf8"
            emissiveIntensity={isNeutronDominant ? 0.55 : 1.35}
            roughness={0.25}
          />
        </mesh>
        {/* Pauli Electron Fermi State Wireframe Shell */}
        <mesh>
          <icosahedronGeometry args={[1.55, 2]} />
          <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.28} />
        </mesh>
      </group>

      {/* Right: Neutron Star (R ≈ 11 km, D ≈ 22 km • Neutron Degeneracy + Strong Force M_TOV ≈ 2.0–2.3 M_☉) */}
      <group
        position={[2.2, 0.2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("neutron_star_body");
        }}
      >
        <mesh ref={nsSpinRef}>
          <sphereGeometry args={[0.58, 32, 32]} />
          <meshStandardMaterial
            color="#a5f3fc"
            emissive="#22d3ee"
            emissiveIntensity={isNeutronDominant ? 1.9 : 1.1}
            metalness={0.6}
            roughness={0.18}
          />
        </mesh>
        {/* Dipolar Magnetic Arcs */}
        <mesh rotation={[0, 0, 0.4]}>
          <torusGeometry args={[0.92, 0.018, 12, 48]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.75} />
        </mesh>
      </group>

      {/* 25-km City Skyline Reference Grid Below the Neutron Star (Demonstrating D ≈ 22 km Scale) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("city_scale_grid");
        }}
      >
        <gridHelper args={[3.4, 14, "#22d3ee", "#1e293b"]} position={[2.2, -1.25, 0]} />
        {qualityProfile.tier !== "LOW_POWER" &&
          cityBlocks.map((b, i) => (
            <mesh key={i} position={b.pos}>
              <boxGeometry args={b.scale} />
              <meshStandardMaterial color="#334155" emissive="#0ea5e9" emissiveIntensity={0.25} />
            </mesh>
          ))}
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 14.3 — WHAT IS A BLACK HOLE? (Birkhoff 1 M_☉ Swap & Strong-Field Lensing)
// ============================================================================
export function BlackHoleConceptScene({
  sceneId,
  qualityProfile,
  activeCue,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("what-is-a-black-hole");
  const swappedByToggle = Boolean(controls.swapSunWithBlackHole ?? false);
  const bhMassSolar = Number(controls.blackHoleMassSolar ?? 1);

  const isBeatB = activeCue?.beatIndex === 1;
  const showBlackHole = swappedByToggle || isBeatB;

  const orbitRadius = 4.8; // Represents 1.00 AU
  const phaseRef = useRef(0.5);
  const [earthPos, setEarthPos] = useState<[number, number, number]>([orbitRadius, 0, 0]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    // Key scientific proof: angular velocity ω at 1 AU is IDENTICAL whether 1 M_☉ Sun or 1 M_☉ Black Hole!
    phaseRef.current = (phaseRef.current + dt * 0.65) % (Math.PI * 2);
    setEarthPos([
      Math.cos(phaseRef.current) * orbitRadius,
      0,
      Math.sin(phaseRef.current) * orbitRadius,
    ]);
  });

  const bhVisualRadius = Math.min(1.85, 0.75 + Math.log10(Math.max(1, bhMassSolar)) * 0.65);

  return (
    <group>
      {/* Central 1.0 M_☉ Sun OR Equal-Mass Black Hole (r_s = 2.95 km × M/M_☉) */}
      {showBlackHole ? (
        <ScientificBlackHoleEffects
          objectId="central_mass_sun_or_bh"
          sceneId={sceneId}
          schwarzschildRadius={bhVisualRadius}
          spinParameterAStar={0.0}
          dopplerBeamingStrength={0.75}
          showJets={false}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlightedObjectIds={activeHighlightedObjects}
          onSelectObject={onSelectObject}
        />
      ) : (
        <ScientificStarMaterial
          objectId="central_mass_sun_or_bh"
          sceneId={sceneId}
          name="1.0 M_☉ Sun (Standard Exterior Gravity)"
          temperatureK={5772}
          position={[0, 0, 0]}
          radius={1.15}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("central_mass_sun_or_bh")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      )}

      {/* Unchanged 1.00 AU Earth Orbit (Proving Black Holes Are NOT Cosmic Vacuum Cleaners!) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={orbitRadius}
        eccentricity={0.0167}
        colorHex="#22d3ee"
        opacity={0.85}
        showApsidesMarkers={false}
      />

      <ScientificPlanetMaterial
        objectId="orbiting_earth_1au"
        sceneId={sceneId}
        presetId="earth"
        position={earthPos}
        radius={0.44}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_earth_1au")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Exterior Schwarzschild Potential Grid Φ(r) = -GM/r (Identical at r = 1 AU!) */}
      <ScientificVectorField
        showPotentialWellGrid={qualityProfile.tier !== "LOW_POWER"}
        potentialWellDepth={2.4}
        potentialWellRadius={8.8}
        gridColorHex="#38bdf8"
        vectors={[
          {
            origin: earthPos,
            direction: [-Math.sin(phaseRef.current), 0, Math.cos(phaseRef.current)],
            length: 2.1,
            colorHex: "#22d3ee",
          },
          {
            origin: earthPos,
            direction: [-earthPos[0], 0, -earthPos[2]],
            length: 1.6,
            colorHex: "#10b981",
          },
        ]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 14.4 — EVENT HORIZONS & PHOTON SPHERES (1.0 r_s, 1.5 r_s, 2.60 r_s, 3.0 r_s)
// ============================================================================
export function EventHorizonScene({ onSelectObject }: Module14SceneProps) {
  const controls = useM14Controls("event-horizons");
  const impactParamRs = Number(controls.photonImpactParameterRs ?? 2.6);
  const showMetricShells = Boolean(controls.showMetricShells ?? true);

  const rs = 1.15; // Scene unit for 1.0 r_s
  const rPhotonSphere = 1.5 * rs; // 1.725 u
  const bCritical = ((3 * Math.sqrt(3)) / 2) * rs; // ~2.598 r_s = 2.988 u
  const rIsco = 3.0 * rs; // 3.45 u

  // Compute null geodesic ray trajectory for the student's interactive impact parameter b / r_s
  const interactivePhotonRay = useMemo(() => {
    const b = impactParamRs * rs;
    const pts: [number, number, number][] = [];
    const bCrit = (3 * Math.sqrt(3)) / 2;

    if (impactParamRs < bCrit - 0.05) {
      // Captured ray: bends inward and crosses the 1.0 r_s Event Horizon
      for (let i = 0; i <= 48; i++) {
        const u = i / 48;
        const x = 6.5 * (1 - u);
        const y = b * Math.pow(1 - u, 1.45);
        const r = Math.hypot(x, y);
        pts.push([x, y, 0]);
        if (r <= rs * 0.96) break;
      }
    } else if (impactParamRs <= bCrit + 0.05) {
      // Critical impact parameter b_c ≈ 2.60 r_s: spirals tangentially onto the 1.5 r_s Photon Sphere!
      for (let i = 0; i <= 80; i++) {
        const u = i / 80;
        if (u < 0.35) {
          const t = u / 0.35;
          pts.push([THREE.MathUtils.lerp(6.5, 0, t), THREE.MathUtils.lerp(b, rPhotonSphere, t), 0]);
        } else {
          const angle = Math.PI / 2 + ((u - 0.35) / 0.65) * Math.PI * 2.2;
          pts.push([Math.cos(angle) * rPhotonSphere, Math.sin(angle) * rPhotonSphere, 0]);
        }
      }
    } else {
      // Gravitationally deflected escape ray (Einstein deflection angle α ≈ 4GM / c²b)
      const deflectionRad = Math.min(1.35, 2.2 / impactParamRs);
      for (let i = -30; i <= 30; i++) {
        const u = i / 30; // -1..1
        const x = u * 6.5;
        const bend = u < 0 ? Math.sin(((u + 1) * Math.PI) / 2) * deflectionRad * b * 0.45 : 0;
        const y = b - bend - (u < 0 ? Math.abs(u) * deflectionRad * 2.2 : 0);
        pts.push([x, y, 0]);
      }
    }
    return pts;
  }, [impactParamRs, rs, rPhotonSphere]);

  const rayColor = impactParamRs < 2.55 ? "#f43f5e" : impactParamRs <= 2.65 ? "#fbbf24" : "#22d3ee";

  return (
    <group>
      {/* 1.0 r_s Event Horizon Black Sphere */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("event_horizon_sphere");
        }}
      >
        <sphereGeometry args={[rs, 48, 48]} />
        <meshBasicMaterial color="#010309" />
      </mesh>

      {showMetricShells && (
        <>
          {/* 1.0 r_s Event Horizon Equatorial Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[rs, rs + 0.04, 64]} />
            <meshBasicMaterial color="#f43f5e" side={THREE.DoubleSide} />
          </mesh>

          {/* 1.5 r_s Photon Sphere Wireframe & Ring (Unstable Circular Null Geodesics) */}
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("photon_sphere_shell");
            }}
          >
            <sphereGeometry args={[rPhotonSphere, 28, 20]} />
            <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.32} />
          </mesh>

          {/* b_c ≈ 2.60 r_s Critical Impact Parameter / Apparent Shadow Ring */}
          <mesh>
            <ringGeometry args={[bCritical - 0.03, bCritical + 0.03, 64]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} transparent opacity={0.78} />
          </mesh>

          {/* 3.0 r_s Schwarzschild ISCO (Innermost Stable Circular Orbit for Matter) */}
          <mesh
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("isco_ring");
            }}
          >
            <torusGeometry args={[rIsco, 0.025, 16, 96]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
          </mesh>
        </>
      )}

      {/* Interactive Null Geodesic Photon Beam */}
      {interactivePhotonRay.length >= 2 && (
        <Line points={interactivePhotonRay} color={rayColor} lineWidth={2.8} />
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 14.5 — ACCRETION DISKS (Differential Shear & Relativistic Doppler Beaming)
// ============================================================================
export function AccretionDiskScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  activeHighlightedObjects,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("accretion-disks");
  const incDeg = Number(controls.diskInclinationDeg ?? 76);
  const spinAStar = Number(controls.dimensionlessSpinAStar ?? 0.65);

  const tiltX = ((90 - incDeg) * Math.PI) / 180;

  return (
    <group rotation={[tiltX, 0, 0]}>
      <ScientificBlackHoleEffects
        objectId="event_horizon"
        sceneId={sceneId}
        schwarzschildRadius={1.35}
        spinParameterAStar={spinAStar}
        dopplerBeamingStrength={0.96}
        showJets={spinAStar >= 0.5}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlightedObjectIds={activeHighlightedObjects}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 14.6 — PULSARS AND MAGNETARS (Spin Ω vs Magnetic Axis μ & Pulse Trace)
// ============================================================================
export function PulsarMagnetarScene({
  qualityProfile,
  reducedMotion,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("pulsars-and-magnetars");
  const magneticTiltDeg = Number(controls.magneticTiltDeg ?? 35);
  const observerSightlineDeg = Number(controls.observerSightlineDeg ?? 35);
  const mode = String(controls.neutronStarRegime ?? "pulsar");

  const isMagnetar = mode === "magnetar";
  const pulseAligned = Math.abs(magneticTiltDeg - observerSightlineDeg) <= 15;

  // Twisted toroidal magnetar flux loops (B ~ 10¹¹ Tesla)
  const magnetarLoops = useMemo(() => {
    const curves: [number, number, number][][] = [];
    for (let k = 0; k < 6; k++) {
      const phi0 = (k / 6) * Math.PI * 2;
      const pts: [number, number, number][] = [];
      for (let i = 4; i <= 36; i++) {
        const theta = (i / 40) * Math.PI;
        const r = 2.4 * Math.pow(Math.sin(theta), 2);
        const twist = Math.cos(theta) * 0.65;
        pts.push([
          r * Math.sin(theta) * Math.cos(phi0 + twist),
          r * Math.cos(theta),
          r * Math.sin(theta) * Math.sin(phi0 + twist),
        ]);
      }
      curves.push(pts);
    }
    return curves;
  }, []);

  // Sightline ray from origin along angle ζ
  const zetaRad = (observerSightlineDeg * Math.PI) / 180;
  const sightlineEnd: [number, number, number] = [
    0,
    Math.cos(zetaRad) * 4.5,
    Math.sin(zetaRad) * 4.5,
  ];

  return (
    <group>
      {/* Rotating Neutron Star & Sweeping Synchrotron Lighthouse Cones */}
      <PulsarBeamRenderer
        objectId="pulsar_remnant"
        position={[0, 0, 0]}
        neutronStarRadius={0.62}
        magneticTiltDeg={magneticTiltDeg}
        reducedMotion={reducedMotion}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Vertical Spin Axis Ω (Emerald) */}
      <Line
        points={[
          [0, -3.4, 0],
          [0, 3.4, 0],
        ]}
        color="#10b981"
        lineWidth={2.0}
      />

      {/* Observer Sightline Vector (Angle ζ) */}
      <Line
        points={[[0, 0, 0], sightlineEnd]}
        color={pulseAligned ? "#fbbf24" : "#64748b"}
        lineWidth={2.2}
      />

      {/* Magnetar Twisted Toroidal Flux Loops (10¹⁰–10¹¹ Tesla) */}
      {isMagnetar &&
        magnetarLoops.map((pts, idx) => (
          <Line key={idx} points={pts} color="#e879f9" lineWidth={1.8} transparent opacity={0.78} />
        ))}
    </group>
  );
}

// ============================================================================
// CHAPTER 14.7 — SUPERMASSIVE BLACK HOLES (Sgr A* S2 Orbit vs M87* & 30-AU Ring)
// ============================================================================
export function SupermassiveBlackHoleScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  activeHighlightedObjects,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("supermassive-black-holes");
  const target = String(controls.smbhSystemTarget ?? "sgr_a_star");
  const showSolarComparison = Boolean(controls.showSolarSystemComparison ?? true);

  const isM87 = target === "m87_star";

  // Star S2 highly eccentric orbit (e = 0.8846) around Sgr A*
  const aS2 = 4.5;
  const eS2 = 0.78; // Scaled for clear 3D inspection of periastron passage
  const bS2 = aS2 * Math.sqrt(1 - eS2 * eS2);
  const cS2 = aS2 * eS2;

  const s2PhaseRef = useRef(0.15);
  const precessionRef = useRef(0);
  const [s2Pos, setS2Pos] = useState<[number, number, number]>([aS2 - cS2, 0, 0]);

  useFrame((_, delta) => {
    if (!isSimulationRunning || isM87) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    const px = Math.cos(s2PhaseRef.current) * aS2 - cS2;
    const pz = Math.sin(s2PhaseRef.current) * bS2;
    const r = Math.max(0.55, Math.hypot(px, pz));

    const dTheta = (dt * 0.95 * (aS2 * bS2)) / (r * r);
    s2PhaseRef.current = (s2PhaseRef.current + dTheta) % (Math.PI * 2);
    precessionRef.current += dt * 0.04; // Schwarzschild rosette apsidal precession

    const nx = Math.cos(s2PhaseRef.current) * aS2 - cS2;
    const nz = Math.sin(s2PhaseRef.current) * bS2;
    const cosP = Math.cos(precessionRef.current);
    const sinP = Math.sin(precessionRef.current);
    setS2Pos([nx * cosP - nz * sinP, 0, nx * sinP + nz * cosP]);
  });

  return (
    <group>
      {/* Central Supermassive Black Hole (Sgr A* 4.15×10⁶ M_☉ or M87* 6.5×10⁹ M_☉) */}
      <ScientificBlackHoleEffects
        objectId="smbh_horizon"
        sceneId={sceneId}
        schwarzschildRadius={isM87 ? 2.15 : 0.75}
        spinParameterAStar={isM87 ? 0.9 : 0.5}
        dopplerBeamingStrength={0.95}
        showJets={isM87}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlightedObjectIds={activeHighlightedObjects}
        onSelectObject={onSelectObject}
      />

      {/* Sgr A* Mode: Star S2 Eccentric Rosette Orbit (v_max = 7,650 km/s = 2.55% c at 120 AU) */}
      {!isM87 && (
        <group rotation={[0.35, precessionRef.current, 0.15]}>
          <OrbitalTrajectoryRenderer
            semiMajorAxis={aS2}
            eccentricity={eS2}
            colorHex="#22d3ee"
            opacity={0.88}
            showApsidesMarkers
          />
          <ScientificStarMaterial
            objectId="s2_star_orbit"
            sceneId={sceneId}
            name="Star S2 (B-Type • v_max = 7,650 km/s)"
            temperatureK={22000}
            position={s2Pos}
            radius={0.28}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={activeHighlightedObjects.includes("s2_star_orbit")}
            narrativeProgress={0.5}
            onSelectObject={onSelectObject}
          />
        </group>
      )}

      {/* 30-AU Neptune Solar System Scale Ring (Fits entirely inside M87*'s 260-AU Shadow!) */}
      {showSolarComparison && (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("solar_system_scale_ring");
          }}
        >
          <ringGeometry args={[isM87 ? 0.95 : 2.2, isM87 ? 1.03 : 2.28, 64]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 14.8 — GRAVITATIONAL WAVES (GW150914 Inspiral, Merger, Ringdown & h(t))
// ============================================================================
export function GravitationalWaveScene({
  qualityProfile,
  reducedMotion,
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module14SceneProps) {
  const controls = useM14Controls("gravitational-waves");
  const phaseMode = String(controls.coalescencePhaseMode ?? "auto_chirp");
  const massRatio = Number(controls.chirpMassRatio ?? 0.8);

  const cycleTimeRef = useRef(0);
  const [bh1Pos, setBh1Pos] = useState<[number, number, number]>([-1.8, 0, 0]);
  const [bh2Pos, setBh2Pos] = useState<[number, number, number]>([1.8, 0, 0]);
  const [merged, setMerged] = useState(false);
  const [waveformPts, setWaveformPts] = useState<[number, number, number][]>([
    [-4, -2.4, 2],
    [4, -2.4, 2],
  ]);

  const waveMeshRef = useRef<THREE.Mesh>(null);
  const gridSegs = qualityProfile.tier === "LOW_POWER" ? 28 : 48;

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    cycleTimeRef.current = (cycleTimeRef.current + dt * 0.22) % 1.0;

    const u =
      phaseMode === "inspiral"
        ? 0.35
        : phaseMode === "merger"
          ? 0.76
          : phaseMode === "ringdown"
            ? 0.9
            : cycleTimeRef.current;

    const isMergedNow = u >= 0.78;
    setMerged(isMergedNow);

    // Inspiral separation shrinks as (t_c - t)^(1/4) while orbital frequency chirps upward
    const sep = isMergedNow ? 0 : Math.max(0.42, 2.8 * Math.pow(1 - u / 0.78, 0.38));
    const angle = cycleTimeRef.current * Math.PI * (isMergedNow ? 28 : 12 + u * 24);

    const r1 = (sep * massRatio) / (1 + massRatio);
    const r2 = sep / (1 + massRatio);
    setBh1Pos([Math.cos(angle) * r1, 0.15, Math.sin(angle) * r1]);
    setBh2Pos([-Math.cos(angle) * r2, 0.15, -Math.sin(angle) * r2]);

    // Deform 3D quadrupole spacetime strain mesh: h_+(r, φ, t) ∝ cos(2φ - k·r + ω_GW t) / r
    if (waveMeshRef.current && !reducedMotion) {
      const posAttr = waveMeshRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const r = Math.max(0.6, Math.hypot(vx, vy));
        const phi = Math.atan2(vy, vx);
        const amp = isMergedNow
          ? Math.exp(-(u - 0.78) * 9) * 0.38
          : (0.12 + u * 0.28) / (1 + r * 0.18);
        const zStrain = Math.cos(2 * (phi - angle) - r * 1.45) * amp;
        posAttr.setZ(i, zStrain);
      }
      posAttr.needsUpdate = true;
    }

    // Live synchronized LIGO GW150914 Chirp Waveform h(t) Ribbon
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 72; i++) {
      const s = i / 72; // 0..1 time axis
      const x = (s - 0.5) * 9.0;
      let strain = 0;
      if (s < 0.75) {
        const env = 0.08 + Math.pow(s / 0.75, 2.2) * 0.65;
        const freq = 10 + Math.pow(s / 0.75, 2.5) * 42;
        strain = Math.sin(s * freq - cycleTimeRef.current * 12) * env;
      } else {
        const decay = Math.exp(-(s - 0.75) * 18);
        strain = Math.sin(s * 65 - cycleTimeRef.current * 12) * 0.72 * decay;
      }
      pts.push([x, -2.35 + strain, 2.2]);
    }
    setWaveformPts(pts);
  });

  return (
    <group>
      {/* Transverse Quadrupole Spacetime Strain Mesh (h_+, h_×) */}
      <mesh
        ref={waveMeshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.35, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("quadrupole_wave_mesh");
        }}
      >
        <planeGeometry args={[13, 13, gridSegs, gridSegs]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.42} />
      </mesh>

      {/* Binary Black Holes (36 M_☉ + 29 M_☉) OR Merged 62 M_☉ Kerr Remnant */}
      {merged ? (
        <group position={[0, 0.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.78, 32, 32]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.85, 1.25, 48]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : (
        <>
          <group
            position={bh1Pos}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("binary_bh_primary");
            }}
          >
            <mesh>
              <sphereGeometry args={[0.52, 28, 28]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.56, 0.76, 32]} />
              <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
            </mesh>
          </group>

          <group
            position={bh2Pos}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("binary_bh_secondary");
            }}
          >
            <mesh>
              <sphereGeometry args={[0.44 * Math.pow(massRatio, 0.33), 28, 28]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.48, 0.66, 32]} />
              <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </>
      )}

      {/* Synchronized LIGO GW150914 Strain Chirp Waveform h(t) */}
      <Line points={waveformPts} color="#fbbf24" lineWidth={2.5} />
    </group>
  );
}

/**
 * Dispatcher for all 8 chapters of Module 14.
 */
export function Module14CinematicDirectorScene(props: Module14SceneProps) {
  const sceneComp: ProofOfConceptSceneComponentId =
    props.activeCue?.sceneComponentId ||
    ([
      "m14_ch1_massive_stellar_collapse",
      "m14_ch2_white_dwarf_vs_neutron_star",
      "m14_ch3_black_hole_birkhoff",
      "m14_ch4_event_horizon_photon_sphere",
      "m14_ch5_relativistic_accretion_disk",
      "m14_ch6_pulsar_magnetar_lighthouse",
      "m14_ch7_supermassive_black_holes",
      "m14_ch8_gravitational_wave_chirp",
    ][props.activeCue?.layerOrPresetIndex ?? 0] as ProofOfConceptSceneComponentId) ||
    "m14_ch1_massive_stellar_collapse";

  switch (sceneComp) {
    case "m14_ch1_massive_stellar_collapse":
      return <StellarCollapseScene {...props} />;
    case "m14_ch2_white_dwarf_vs_neutron_star":
      return <CompactObjectsScene {...props} />;
    case "m14_ch3_black_hole_birkhoff":
      return <BlackHoleConceptScene {...props} />;
    case "m14_ch4_event_horizon_photon_sphere":
      return <EventHorizonScene {...props} />;
    case "m14_ch5_relativistic_accretion_disk":
      return <AccretionDiskScene {...props} />;
    case "m14_ch6_pulsar_magnetar_lighthouse":
      return <PulsarMagnetarScene {...props} />;
    case "m14_ch7_supermassive_black_holes":
      return <SupermassiveBlackHoleScene {...props} />;
    case "m14_ch8_gravitational_wave_chirp":
      return <GravitationalWaveScene {...props} />;
    default:
      return <StellarCollapseScene {...props} />;
  }
}
