/**
 * MODULE 08 — GRAVITY, ORBITS & MOTION: 8 COMPLETE CINEMATIC CHAPTER SCENES
 * Project: Our Visible Universe Academy
 * Scope: Prompt 08 — Phase C (Chapters 08.1 through 08.8)
 *
 * Implements 8 distinct physics-validated 3D chapter experiences:
 * - Chapter 08.1 (GravityConceptScene): F = G M₁ m₂ / r², equal-and-opposite force vectors
 *   |F₁₂| = |F₂₁|, 1/r² steps (1 → 1/4 → 1/9), radial field lines, tidal gradient ΔF ∝ 1/r³,
 *   and pedagogical scalar potential diagram Φ(r) = -GM/r.
 * - Chapter 08.2 (OrbitalMotionScene): Newton's cannonball perpetual free fall, circular orbit
 *   orthogonal v ⊥ F_g (90° zero-work marker) vs elliptical +W inbound / -W outbound work.
 * - Chapter 08.3 (OrbitalGeometryScene): Conic section family (circle e=0, ellipse 0<e<1,
 *   parabola e=1, hyperbola e=1.2 'Oumuamua), star strictly at occupied focus F₁=(0,0,0),
 *   empty focus F₂=(-2ae,0,0), r_p/r_a calipers, and Hohmann transfer ellipse (Δv₁, Δv₂).
 * - Chapter 08.4 (OrbitalVelocityScene): Vis-viva v² = GM(2/r - 1/a), Equivalence Principle
 *   co-orbiting pebble & station, LEO (7.66 km/s) vs GEO ring (3.07 km/s), and continuous
 *   low-thrust xenon ion spiral vs impulsive burn.
 * - Chapter 08.5 (NewtonLawsScene): Distinct demonstrations for 1st Law (inertial straight-line
 *   tangent release), 2nd Law (a = F/m 81:1 Moon-to-Earth acceleration ratio), and 3rd Law
 *   (Tsiolkovsky vacuum rocket exhaust recoil).
 * - Chapter 08.6 (KeplerLawsScene): Simultaneous 1st Law (focus F₁), 2nd Law (equal-area
 *   triangular sectors ΔA_peri = ΔA_apo), and 3rd Law (harmonic T² = a³ concentric race).
 * - Chapter 08.7 (EscapeVelocityScene): Bound ellipse (E<0), parabolic threshold v_esc = √2 v_circ
 *   (E=0), and hyperbolic escape trajectory (E>0) over a 3D potential funnel.
 * - Chapter 08.8 (BarycenterScene): Mutual two-body motion around stationary barycenter (+)
 *   with r₁ = a·q/(1+q) and r₂ = a/(1+q) (primary star never fixed!), plus co-rotating L1–L5
 *   Lagrange points, equilateral Trojan triangles, and Hill sphere r_H ≈ a(q/3)^(1/3).
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
  OrbitalTrajectoryRenderer,
  ScientificPlanetMaterial,
  ScientificSpacecraftRenderer,
  ScientificStarMaterial,
  ScientificVectorField,
  type VectorArrowDescriptor,
} from "../../science";

export interface Module08SceneProps {
  sceneId: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  onSelectObject: (id: string) => void;
}

function useM08Controls(chapterId: string): ChapterControlValueMap {
  const store = CosmosChapterInteractionStore.getInstance();
  const [values, setValues] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues("08", chapterId),
  );

  useEffect(() => {
    setValues(store.getChapterValues("08", chapterId));
    return store.subscribe(() => {
      setValues(store.getChapterValues("08", chapterId));
    });
  }, [store, chapterId]);

  return values;
}

// ============================================================================
// CHAPTER 08.1 — WHAT IS GRAVITY? (F = G M₁ m₂ / r², Equal Vectors & Tidal Field)
// ============================================================================
export function GravityConceptScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-01");
  const primaryMassSolar = Number(controls.primaryMassSolar ?? 1.0);
  const separationAu = Number(controls.separationAu ?? 1.0);
  const showTidalVectors = Boolean(controls.showTidalVectors ?? true);

  const planetX = 2.2 + separationAu * 2.1; // Maps 1..3 AU to 4.3..8.5 u
  const forceScale = Math.min(2.8, Math.max(0.35, (primaryMassSolar / (separationAu * separationAu)) * 1.9));

  const vectors: VectorArrowDescriptor[] = useMemo(() => {
    const arr: VectorArrowDescriptor[] = [
      // F_12 on Star toward Planet (Amber) — Equal magnitude to F_21!
      {
        origin: [0, 0, 0],
        direction: [1, 0, 0],
        length: forceScale,
        colorHex: "#f59e0b",
      },
      // F_21 on Planet toward Star (Amber) — Equal magnitude, opposite direction!
      {
        origin: [planetX, 0, 0],
        direction: [-1, 0, 0],
        length: forceScale,
        colorHex: "#f59e0b",
      },
    ];

    if (showTidalVectors) {
      // Near-side stronger pull vs far-side weaker pull (ΔF ∝ 1/r³)
      const tidalNear = Math.min(1.5, forceScale * 0.65);
      const tidalFar = Math.max(0.2, forceScale * 0.32);
      arr.push(
        {
          origin: [planetX - 0.55, 0.45, 0],
          direction: [-1, 0, 0],
          length: tidalNear,
          colorHex: "#22d3ee",
        },
        {
          origin: [planetX + 0.55, 0.45, 0],
          direction: [-1, 0, 0],
          length: tidalFar,
          colorHex: "#38bdf8",
        },
      );
    }
    return arr;
  }, [planetX, forceScale, showTidalVectors]);

  return (
    <group>
      {/* Central Primary Star M₁ */}
      <ScientificStarMaterial
        objectId="central_star"
        sceneId={sceneId}
        name={`Primary Mass M₁ (${primaryMassSolar.toFixed(2)} M_☉)`}
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={1.15 * Math.pow(primaryMassSolar, 0.22)}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Secondary Planet m₂ at Interactive Distance r */}
      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId="earth"
        position={[planetX, 0, 0]}
        radius={0.52}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Distance Tick Markers for 1 AU, 2 AU (1/4 F₀), and 3 AU (1/9 F₀) */}
      {[1, 2, 3].map((auTick) => {
        const tickR = 2.2 + auTick * 2.1;
        return (
          <mesh key={auTick} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[tickR - 0.02, tickR + 0.02, 64]} />
            <meshBasicMaterial
              color={Math.abs(separationAu - auTick) < 0.15 ? "#22d3ee" : "#475569"}
              side={THREE.DoubleSide}
              transparent
              opacity={0.55}
            />
          </mesh>
        );
      })}

      {/* Equal-and-Opposite Force Vectors F₁₂ = -F₂₁ + Pedagogical Potential Funnel Φ(r) = -GM/r */}
      <ScientificVectorField
        vectors={vectors}
        showPotentialWellGrid={qualityProfile.tier !== "LOW_POWER"}
        potentialWellDepth={1.4 * Math.min(2.2, primaryMassSolar)}
        potentialWellRadius={9.5}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.2 — WHY PLANETS ORBIT STARS (Perpetual Free Fall & v ⊥ F_g Work)
// ============================================================================
export function OrbitalMotionScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-02");
  const regime = String(controls.freeFallOrbitRegime ?? "circular");

  const eccentricity = regime === "elliptical" ? 0.5 : 0.0;
  const semiMajorAxis = 5.2;
  const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);
  const focalOffset = semiMajorAxis * eccentricity;

  const phaseRef = useRef(0.6);
  const [planetPos, setPlanetPos] = useState<[number, number, number]>([5.2, 0, 0]);
  const [vectors, setVectors] = useState<VectorArrowDescriptor[]>([]);
  const [rightAngleMarker, setRightAngleMarker] = useState<[number, number, number][]>([
    [5.2, 0, 0],
    [5.2, 0, 0.3],
  ]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    const cx = Math.cos(phaseRef.current) * semiMajorAxis - focalOffset;
    const cz = Math.sin(phaseRef.current) * semiMinorAxis;
    const r = Math.max(1.4, Math.hypot(cx, cz));

    const omega = 0.85 * Math.pow(semiMajorAxis / r, 1.5);
    phaseRef.current = (phaseRef.current + dt * omega) % (Math.PI * 2);

    const px = Math.cos(phaseRef.current) * semiMajorAxis - focalOffset;
    const pz = Math.sin(phaseRef.current) * semiMinorAxis;
    setPlanetPos([px, 0, pz]);

    const vx = -Math.sin(phaseRef.current) * semiMajorAxis;
    const vz = Math.cos(phaseRef.current) * semiMinorAxis;
    const vNorm = Math.hypot(vx, vz) || 1;
    const ux = vx / vNorm;
    const uz = vz / vNorm;

    const rNorm = Math.hypot(px, pz) || 1;
    const gx = -px / rNorm;
    const gz = -pz / rNorm;

    const vLen = Math.sqrt(Math.max(0.2, 2 / rNorm - 1 / semiMajorAxis)) * 2.5;
    const gLen = Math.min(2.6, (5.8 / (rNorm * rNorm)) * 2.2);

    // Dot product F_g · v determines sign of work (+W inbound emerald, -W outbound rose, 0 cyan)
    const dot = ux * gx + uz * gz;
    const vColor =
      regime === "circular" ? "#22d3ee" : dot > 0.08 ? "#10b981" : dot < -0.08 ? "#f43f5e" : "#22d3ee";

    setVectors([
      {
        origin: [px, 0, pz],
        direction: [ux, 0, uz],
        length: vLen,
        colorHex: vColor,
      },
      {
        origin: [px, 0, pz],
        direction: [gx, 0, gz],
        length: gLen,
        colorHex: "#f59e0b",
      },
    ]);

    // 90° orthogonal square symbol between v and F_g
    const s = 0.38;
    setRightAngleMarker([
      [px + ux * s, 0.05, pz + uz * s],
      [px + (ux + gx) * s, 0.05, pz + (uz + gz) * s],
      [px + gx * s, 0.05, pz + gz * s],
    ]);
  });

  return (
    <group>
      <ScientificStarMaterial
        objectId="central_star"
        sceneId={sceneId}
        name="Central Star (1.0 M_☉)"
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={1.25}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      <OrbitalTrajectoryRenderer
        semiMajorAxis={semiMajorAxis}
        eccentricity={eccentricity}
        colorHex="#38bdf8"
        opacity={0.78}
        showApsidesMarkers={eccentricity > 0.05}
      />

      {/* Newton's Cannonball Suborbital Comparison Arcs */}
      {regime === "suborbital_cannonball" && (
        <OrbitalTrajectoryRenderer
          semiMajorAxis={3.2}
          eccentricity={0.62}
          colorHex="#f43f5e"
          opacity={0.55}
          showApsidesMarkers={false}
        />
      )}

      {/* 90° Right-Angle Orthogonal Square Symbol (v ⊥ F_g ⇒ W = 0) */}
      <Line points={rightAngleMarker} color="#fef08a" lineWidth={2.0} />

      <ScientificVectorField vectors={vectors} />

      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId="earth"
        position={planetPos}
        radius={0.48}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.3 — CIRCULAR AND ELLIPTICAL ORBITS (Conic Family, F₁/F₂ & Hohmann)
// ============================================================================
export function OrbitalGeometryScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-03");
  const eccentricity = Number(controls.eccentricity ?? 0.48);
  const showConicFamily = Boolean(controls.showConicFamily ?? true);
  const showHohmannTransfer = Boolean(controls.showHohmannTransfer ?? true);

  const a = 5.4;
  const b = a * Math.sqrt(Math.max(0.01, 1 - eccentricity * eccentricity));
  const c = a * eccentricity; // Star at F₁=(0,0,0), geometric center at (-c,0,0), empty focus F₂=(-2c,0,0)

  const phaseRef = useRef(0.3);
  const [planetPos, setPlanetPos] = useState<[number, number, number]>([a - c, 0, 0]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    const px = Math.cos(phaseRef.current) * a - c;
    const pz = Math.sin(phaseRef.current) * b;
    const r = Math.max(0.8, Math.hypot(px, pz));
    phaseRef.current = (phaseRef.current + dt * 0.8 * Math.pow(a / r, 1.5)) % (Math.PI * 2);
    setPlanetPos([Math.cos(phaseRef.current) * a - c, 0, Math.sin(phaseRef.current) * b]);
  });

  // Parabolic (e=1) and Hyperbolic (e=1.2 'Oumuamua) open trajectories sharing periapsis r_p = 2.8
  const { parabolaPts, hyperbolaPts } = useMemo(() => {
    const rp = 2.8;
    const pPts: [number, number, number][] = [];
    const hPts: [number, number, number][] = [];
    const eHyp = 1.25;

    for (let i = -28; i <= 28; i++) {
      const nu = (i / 28) * 2.15;
      const rPar = (2 * rp) / Math.max(0.18, 1 + Math.cos(nu));
      if (rPar <= 13) {
        pPts.push([rPar * Math.cos(nu), 0.02, rPar * Math.sin(nu)]);
      }
      const denomHyp = 1 + eHyp * Math.cos(nu);
      if (denomHyp > 0.22) {
        const rHyp = (rp * (1 + eHyp)) / denomHyp;
        if (rHyp <= 13) {
          hPts.push([rHyp * Math.cos(nu), 0.04, rHyp * Math.sin(nu)]);
        }
      }
    }
    return { parabolaPts: pPts, hyperbolaPts: hPts };
  }, []);

  return (
    <group>
      {/* Occupied Focus F₁ = (0,0,0): Central Star NEVER at geometric center when e > 0 */}
      <ScientificStarMaterial
        objectId="central_star"
        sceneId={sceneId}
        name="Occupied Focus F₁ (Star)"
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={1.1}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Empty Focus F₂ Marker at (-2ae, 0, 0) */}
      <group
        position={[-2 * c, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("focus_f2_marker");
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.34, 24]} />
          <meshBasicMaterial color="#f43f5e" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Major Axis Line from Periapsis (a - c) to Apoapsis (-a - c) */}
      <Line
        points={[
          [a - c, 0, 0],
          [-a - c, 0, 0],
        ]}
        color="#94a3b8"
        lineWidth={1.4}
        transparent
        opacity={0.6}
      />

      {/* Primary Interactive Elliptical Orbit (Eccentricity e) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={a}
        eccentricity={eccentricity}
        colorHex="#22d3ee"
        opacity={0.92}
        showApsidesMarkers
      />

      {/* Parabolic (e=1) & Hyperbolic (e=1.25 'Oumuamua) Open Trajectories */}
      {showConicFamily && (
        <>
          <OrbitalTrajectoryRenderer
            semiMajorAxis={2.8}
            eccentricity={0.0}
            colorHex="#64748b"
            opacity={0.45}
            showApsidesMarkers={false}
          />
          {parabolaPts.length >= 2 && (
            <Line points={parabolaPts} color="#fbbf24" lineWidth={1.8} transparent opacity={0.75} />
          )}
          {hyperbolaPts.length >= 2 && (
            <Line points={hyperbolaPts} color="#e879f9" lineWidth={1.8} transparent opacity={0.78} />
          )}
        </>
      )}

      {/* Hohmann Transfer Ellipse & Δv₁ / Δv₂ Tangential Burn Vectors */}
      {showHohmannTransfer && (
        <group>
          <OrbitalTrajectoryRenderer
            semiMajorAxis={4.2}
            eccentricity={0.333}
            colorHex="#10b981"
            opacity={0.72}
            showApsidesMarkers={false}
          />
          <ScientificVectorField
            vectors={[
              {
                origin: [2.8, 0.1, 0],
                direction: [0, 0, 1],
                length: 1.5,
                colorHex: "#10b981", // Δv₁ periapsis prograde burn
              },
              {
                origin: [-5.6, 0.1, 0],
                direction: [0, 0, -1],
                length: 1.3,
                colorHex: "#10b981", // Δv₂ apoapsis circularization burn
              },
            ]}
          />
        </group>
      )}

      {/* Orbiting Planet */}
      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId="earth"
        position={planetPos}
        radius={0.46}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.4 — ORBITAL VELOCITY (Vis-Viva, LEO vs GEO & Ion Spiral)
// ============================================================================
export function OrbitalVelocityScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-04");
  const rRe = Number(controls.orbitalRadiusEarthRadii ?? 6.61);
  const showIonSpiral = Boolean(controls.showIonSpiral ?? true);

  const leoRadius = 2.2;
  const customRadius = 2.0 + ((rRe - 1.0) / 5.62) * 5.2; // Maps 1.06..6.62 R_⊕ to 2.05..7.2 u

  const leoPhaseRef = useRef(0);
  const customPhaseRef = useRef(1.2);
  const [leoPos, setLeoPos] = useState<[number, number, number]>([leoRadius, 0, 0]);
  const [customPos, setCustomPos] = useState<[number, number, number]>([customRadius, 0, 0]);

  // Continuous low-thrust ion propulsion outward spiral from LEO to GEO
  const ionSpiralPts = useMemo(() => {
    const pts: [number, number, number][] = [];
    const turns = 4.5;
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const theta = u * turns * Math.PI * 2;
      const r = THREE.MathUtils.lerp(leoRadius, 7.2, u);
      pts.push([Math.cos(theta) * r, 0.02, Math.sin(theta) * r]);
    }
    return pts;
  }, []);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    // Angular velocity ω = √(GM / r³) ∝ r^(-3/2)
    const omegaLeo = 1.65;
    const omegaCustom = omegaLeo * Math.pow(leoRadius / customRadius, 1.5);

    leoPhaseRef.current = (leoPhaseRef.current + dt * omegaLeo) % (Math.PI * 2);
    customPhaseRef.current = (customPhaseRef.current + dt * omegaCustom) % (Math.PI * 2);

    setLeoPos([
      Math.cos(leoPhaseRef.current) * leoRadius,
      0,
      Math.sin(leoPhaseRef.current) * leoRadius,
    ]);
    setCustomPos([
      Math.cos(customPhaseRef.current) * customRadius,
      0,
      Math.sin(customPhaseRef.current) * customRadius,
    ]);
  });

  const vLenLeo = 2.4;
  const vLenCustom = vLenLeo * Math.sqrt(leoRadius / customRadius);

  return (
    <group>
      {/* Central Earth */}
      <ScientificPlanetMaterial
        objectId="central_star"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.35}
        starPosition={[14, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Inner Fast LEO Orbit Ring (7.66 km/s) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={leoRadius}
        eccentricity={0.0}
        colorHex="#38bdf8"
        opacity={0.75}
        showApsidesMarkers={false}
      />

      {/* Interactive Radius Orbit Ring (e.g. Geostationary at 6.61 R_⊕ = 3.07 km/s) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={customRadius}
        eccentricity={0.0}
        colorHex="#fbbf24"
        opacity={0.85}
        showApsidesMarkers={false}
      />

      {/* Continuous Low-Thrust Xenon Ion Propulsion Spiral */}
      {showIonSpiral && (
        <Line points={ionSpiralPts} color="#a78bfa" lineWidth={1.6} transparent opacity={0.68} />
      )}

      {/* Equivalence Principle Pair in LEO: 420-ton Station + 1-g Pebble Co-Orbiting at Identical Speed */}
      <group position={leoPos}>
        <mesh>
          <boxGeometry args={[0.26, 0.08, 0.36]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.28, 0.12, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
      </group>

      {/* Outer Satellite at Interactive Radius r */}
      <mesh
        position={customPos}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("geo_satellite");
        }}
      >
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Live Velocity Vectors Scaled by v = √(GM/r) */}
      <ScientificVectorField
        vectors={[
          {
            origin: leoPos,
            direction: [-Math.sin(leoPhaseRef.current), 0, Math.cos(leoPhaseRef.current)],
            length: vLenLeo,
            colorHex: "#22d3ee",
          },
          {
            origin: customPos,
            direction: [-Math.sin(customPhaseRef.current), 0, Math.cos(customPhaseRef.current)],
            length: vLenCustom,
            colorHex: "#fbbf24",
          },
        ]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.5 — NEWTON'S LAWS OF MOTION (Inertia, 81:1 F=ma & Rocket Recoil)
// ============================================================================
export function NewtonLawsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-05");
  const lawMode = String(controls.newtonLawDemonstration ?? "law1_inertia");
  const gravityTetherActive = Boolean(controls.gravityTetherActive ?? true);

  const phaseRef = useRef(0);
  const coastDistRef = useRef(0);
  const [bodyPos, setBodyPos] = useState<[number, number, number]>([4.6, 0, 0]);
  const [tangentLine, setTangentLine] = useState<[number, number, number][]>([
    [4.6, 0, 0],
    [4.6, 0, 5.0],
  ]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    const r = 4.6;

    if (lawMode === "law1_inertia" && !gravityTetherActive) {
      // Coast along straight inertial tangent line!
      coastDistRef.current = (coastDistRef.current + dt * 2.8) % 6.5;
      const x0 = Math.cos(phaseRef.current) * r;
      const z0 = Math.sin(phaseRef.current) * r;
      const tx = -Math.sin(phaseRef.current);
      const tz = Math.cos(phaseRef.current);
      setBodyPos([x0 + tx * coastDistRef.current, 0, z0 + tz * coastDistRef.current]);
    } else {
      coastDistRef.current = 0;
      phaseRef.current = (phaseRef.current + dt * 0.72) % (Math.PI * 2);
      const px = Math.cos(phaseRef.current) * r;
      const pz = Math.sin(phaseRef.current) * r;
      setBodyPos([px, 0, pz]);
      const tx = -Math.sin(phaseRef.current);
      const tz = Math.cos(phaseRef.current);
      setTangentLine([
        [px, 0, pz],
        [px + tx * 4.5, 0, pz + tz * 4.5],
      ]);
    }
  });

  return (
    <group>
      {/* Central Body (Earth / Star) */}
      <ScientificPlanetMaterial
        objectId="central_star"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.35}
        starPosition={[14, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      <OrbitalTrajectoryRenderer
        semiMajorAxis={4.6}
        eccentricity={0.0}
        colorHex="#475569"
        opacity={0.55}
        showApsidesMarkers={false}
      />

      {/* 1st Law: Ghostly Straight-Line Inertial Tangent Departure Line */}
      <Line points={tangentLine} color="#22d3ee" lineWidth={2.0} transparent opacity={0.85} />

      {/* Orbiting Moon / Test Body */}
      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId="moon"
        position={bodyPos}
        radius={0.42}
        starPosition={[14, 5, 10]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* 2nd & 3rd Law Force & Acceleration Vectors */}
      <ScientificVectorField
        vectors={
          lawMode === "law2_fma_ratio"
            ? [
                // Equal forces |F_12| = |F_21| (Amber)
                {
                  origin: [0, 0.3, 0],
                  direction: [bodyPos[0], 0, bodyPos[2]],
                  length: 1.5,
                  colorHex: "#f59e0b",
                },
                {
                  origin: [bodyPos[0], 0.3, bodyPos[2]],
                  direction: [-bodyPos[0], 0, -bodyPos[2]],
                  length: 1.5,
                  colorHex: "#f59e0b",
                },
                // Acceleration vectors a = F/m: Moon accelerates 81x more than Earth (Emerald)
                {
                  origin: [0, -0.35, 0],
                  direction: [bodyPos[0], 0, bodyPos[2]],
                  length: 0.25,
                  colorHex: "#10b981",
                },
                {
                  origin: [bodyPos[0], -0.35, bodyPos[2]],
                  direction: [-bodyPos[0], 0, -bodyPos[2]],
                  length: 2.8,
                  colorHex: "#10b981",
                },
              ]
            : [
                {
                  origin: bodyPos,
                  direction: [-Math.sin(phaseRef.current), 0, Math.cos(phaseRef.current)],
                  length: 2.2,
                  colorHex: "#22d3ee",
                },
                ...(gravityTetherActive
                  ? [
                      {
                        origin: bodyPos,
                        direction: [-bodyPos[0], 0, -bodyPos[2]] as [number, number, number],
                        length: 1.8,
                        colorHex: "#f59e0b",
                      },
                    ]
                  : []),
              ]
        }
      />

      {/* 3rd Law: Vacuum Spacecraft Exhaust Recoil Demonstration */}
      {lawMode === "law3_rocket_recoil" && (
        <group position={[0, 2.2, 0]}>
          <ScientificSpacecraftRenderer
            objectId="rocket_recoil_vehicle"
            sceneId={sceneId}
            assetId="asset_spacecraft_voyager_v2"
            position={[0, 0, 0]}
            scale={0.85}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            onSelectObject={onSelectObject}
          />
          <ScientificVectorField
            vectors={[
              {
                origin: [0.4, 0, 0],
                direction: [1, 0, 0],
                length: 2.1,
                colorHex: "#10b981", // Forward spacecraft thrust recoil +Δp
              },
              {
                origin: [-0.4, 0, 0],
                direction: [-1, 0, 0],
                length: 2.1,
                colorHex: "#f43f5e", // Backward high-velocity exhaust momentum -Δm v_e
              },
            ]}
          />
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 08.6 — KEPLER'S LAWS (Focus F₁, Equal Areas & Harmonic T² = a³)
// ============================================================================
export function KeplerLawsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-06");
  const ecc = Number(controls.keplerEccentricity ?? 0.52);
  const outerSmaAu = Number(controls.harmonicPlanetSemiMajorAu ?? 4.0);

  const aInner = 4.6;
  const bInner = aInner * Math.sqrt(Math.max(0.01, 1 - ecc * ecc));
  const cInner = aInner * ecc;
  const aOuterScene = 3.2 + (outerSmaAu / 9.0) * 6.4;

  const innerPhaseRef = useRef(0.2);
  const outerPhaseRef = useRef(1.1);
  const [innerPos, setInnerPos] = useState<[number, number, number]>([aInner - cInner, 0, 0]);
  const [outerPos, setOuterPos] = useState<[number, number, number]>([aOuterScene, 0, 0]);
  const [vectors, setVectors] = useState<VectorArrowDescriptor[]>([]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;

    const px = Math.cos(innerPhaseRef.current) * aInner - cInner;
    const pz = Math.sin(innerPhaseRef.current) * bInner;
    const r = Math.max(0.8, Math.hypot(px, pz));

    // Conservation of angular momentum: r² dθ/dt = const
    const dTheta = (dt * 1.15 * (aInner * bInner)) / (r * r);
    innerPhaseRef.current = (innerPhaseRef.current + dTheta) % (Math.PI * 2);

    const nx = Math.cos(innerPhaseRef.current) * aInner - cInner;
    const nz = Math.sin(innerPhaseRef.current) * bInner;
    setInnerPos([nx, 0, nz]);

    // Kepler's 3rd Law angular rate: ω_outer = ω_1 / a^(3/2)
    const omegaOuter = 0.85 / Math.pow(outerSmaAu, 1.5);
    outerPhaseRef.current = (outerPhaseRef.current + dt * omegaOuter) % (Math.PI * 2);
    setOuterPos([
      Math.cos(outerPhaseRef.current) * aOuterScene,
      0,
      Math.sin(outerPhaseRef.current) * aOuterScene,
    ]);

    const vx = -Math.sin(innerPhaseRef.current) * aInner;
    const vz = Math.cos(innerPhaseRef.current) * bInner;
    const vLen = Math.sqrt(Math.max(0.2, 2 / r - 1 / aInner)) * 2.3;
    setVectors([
      {
        origin: [nx, 0, nz],
        direction: [vx, 0, vz],
        length: vLen,
        colorHex: "#22d3ee",
      },
    ]);
  });

  return (
    <group>
      {/* Occupied Focus F₁ = (0,0,0) */}
      <ScientificStarMaterial
        objectId="central_star"
        sceneId={sceneId}
        name="Central Star at Occupied Focus F₁"
        temperatureK={5772}
        position={[0, 0, 0]}
        radius={1.15}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("central_star")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Kepler's 1st & 2nd Law Elliptical Trajectory + Shaded Equal-Area Sectors */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={aInner}
        eccentricity={ecc}
        colorHex="#22d3ee"
        opacity={0.88}
        showEqualAreaSectors
        showApsidesMarkers
      />

      {/* Kepler's 3rd Law Harmonic Outer Planet Orbit (T² = a³) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={aOuterScene}
        eccentricity={0.04}
        colorHex="#fbbf24"
        opacity={0.62}
        showApsidesMarkers={false}
      />

      <ScientificVectorField vectors={vectors} />

      <ScientificPlanetMaterial
        objectId="orbiting_planet"
        sceneId={sceneId}
        presetId="earth"
        position={innerPos}
        radius={0.44}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("orbiting_planet")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      <ScientificPlanetMaterial
        objectId="harmonic_outer_planets"
        sceneId={sceneId}
        presetId="jupiter"
        position={outerPos}
        radius={0.62}
        starPosition={[0, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("harmonic_outer_planets")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.7 — ESCAPE VELOCITY (Bound E<0, Parabolic E=0 & Hyperbolic E>0)
// ============================================================================
export function EscapeVelocityScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-07");
  const launchRatio = Number(controls.launchSpeedRatio ?? 1.41); // v_0 / v_circ
  const bodyPreset = String(controls.escapeBodyPreset ?? "earth");

  // Conic eccentricity from launch speed at periapsis: e = |v_0² / v_circ² - 1|
  const eRaw = launchRatio * launchRatio - 1;
  const rp = 2.6;
  const probeProgressRef = useRef(0);
  const [probePos, setProbePos] = useState<[number, number, number]>([rp, 0, 0]);

  const trajectoryPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const e = Math.max(0, eRaw);
    const p = rp * (1 + e); // Semi-latus rectum p = r_p (1 + e)

    const maxNu = e < 0.98 ? Math.PI : e <= 1.03 ? 2.35 : Math.acos(-1 / e) - 0.18;
    const steps = 96;
    for (let i = -steps / 2; i <= steps / 2; i++) {
      const nu = (i / (steps / 2)) * maxNu;
      const denom = 1 + e * Math.cos(nu);
      if (denom > 0.12) {
        const r = Math.min(13.5, p / denom);
        pts.push([r * Math.cos(nu), 0.05, r * Math.sin(nu)]);
      }
    }
    return pts;
  }, [eRaw]);

  useFrame((_, delta) => {
    if (!isSimulationRunning || trajectoryPoints.length < 2) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    probeProgressRef.current = (probeProgressRef.current + dt * 0.28) % 1;
    const idx = Math.min(
      trajectoryPoints.length - 1,
      Math.floor(probeProgressRef.current * trajectoryPoints.length),
    );
    setProbePos(trajectoryPoints[idx]);
  });

  const trajColor =
    launchRatio < 1.405 ? "#38bdf8" : launchRatio <= 1.425 ? "#10b981" : "#f59e0b";

  return (
    <group>
      {/* Central Attracting Body (Earth / Sun / Jupiter) */}
      {bodyPreset === "sun_1au" ? (
        <ScientificStarMaterial
          objectId="central_star"
          sceneId={sceneId}
          name="The Sun (v_esc at 1 AU = 42.1 km/s)"
          temperatureK={5772}
          position={[0, 0, 0]}
          radius={1.25}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("central_star")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      ) : (
        <ScientificPlanetMaterial
          objectId="central_star"
          sceneId={sceneId}
          presetId={bodyPreset === "jupiter" ? "jupiter" : "earth"}
          position={[0, 0, 0]}
          radius={1.25}
          starPosition={[14, 5, 10]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("central_star")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      )}

      {/* Circular Reference Orbit (v_circ) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={rp}
        eccentricity={0.0}
        colorHex="#64748b"
        opacity={0.45}
        showApsidesMarkers={false}
      />

      {/* Active Launch Trajectory (Bound Ellipse E<0, Parabola E=0, or Hyperbola E>0) */}
      {trajectoryPoints.length >= 2 && (
        <Line points={trajectoryPoints} color={trajColor} lineWidth={2.4} />
      )}

      {/* Escape Probe */}
      <mesh
        position={probePos}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("escape_probe");
        }}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={trajColor} />
      </mesh>

      {/* 3D Gravitational Potential Well Funnel U(r) = -GMm/r */}
      <ScientificVectorField
        showPotentialWellGrid={qualityProfile.tier !== "LOW_POWER"}
        potentialWellDepth={2.2}
        potentialWellRadius={9.2}
        vectors={[
          {
            origin: [rp, 0.1, 0],
            direction: [0, 0, 1],
            length: launchRatio * 1.6,
            colorHex: trajColor,
          },
        ]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 08.8 — BARYCENTERS & MULTIPLE-BODY SYSTEMS (M₁ r₁ = m₂ r₂ & L1–L5)
// ============================================================================
export function BarycenterScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module08SceneProps) {
  const controls = useM08Controls("08-08");
  const q = Number(controls.massRatioQ ?? 0.4); // m_2 / M_1
  const showLagrangePoints = Boolean(controls.showLagrangePoints ?? true);

  const totalSeparation = 6.2;
  // Exact two-body barycenter offsets: r_1 = a * q / (1 + q), r_2 = a * 1 / (1 + q)
  const r1 = (totalSeparation * q) / (1 + q);
  const r2 = totalSeparation / (1 + q);
  const hillRadius = Math.max(0.45, totalSeparation * Math.pow(q / 3, 1 / 3) * 0.45);

  const phaseRef = useRef(0);
  const [primaryPos, setPrimaryPos] = useState<[number, number, number]>([-r1, 0, 0]);
  const [secondaryPos, setSecondaryPos] = useState<[number, number, number]>([r2, 0, 0]);
  const [lagrangePts, setLagrangePts] = useState<
    { id: string; pos: [number, number, number]; color: string }[]
  >([]);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    phaseRef.current = (phaseRef.current + dt * 0.65) % (Math.PI * 2);

    const cosP = Math.cos(phaseRef.current);
    const sinP = Math.sin(phaseRef.current);

    // Primary and Secondary move in exact opposite phase (Δφ = 180°) around (0,0,0)
    setPrimaryPos([-cosP * r1, 0, -sinP * r1]);
    setSecondaryPos([cosP * r2, 0, sinP * r2]);

    // Co-rotating Lagrange points L1, L2, L3, L4 (+60°), L5 (-60°)
    const l1R = r2 - hillRadius;
    const l2R = r2 + hillRadius;
    const l3R = -(r1 + totalSeparation * 0.85);
    const l4Angle = phaseRef.current + Math.PI / 3;
    const l5Angle = phaseRef.current - Math.PI / 3;

    setLagrangePts([
      { id: "L1", pos: [cosP * l1R, 0, sinP * l1R], color: "#fbbf24" },
      { id: "L2", pos: [cosP * l2R, 0, sinP * l2R], color: "#22d3ee" },
      { id: "L3", pos: [cosP * l3R, 0, sinP * l3R], color: "#94a3b8" },
      {
        id: "L4",
        pos: [Math.cos(l4Angle) * r2, 0, Math.sin(l4Angle) * r2],
        color: "#10b981",
      },
      {
        id: "L5",
        pos: [Math.cos(l5Angle) * r2, 0, Math.sin(l5Angle) * r2],
        color: "#10b981",
      },
    ]);
  });

  return (
    <group>
      {/* Stationary Golden Barycenter Crosshair (+) at Origin (0,0,0) */}
      <group
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("barycenter_crosshair");
        }}
      >
        <Line
          points={[
            [-0.55, 0, 0],
            [0.55, 0, 0],
          ]}
          color="#fbbf24"
          lineWidth={2.5}
        />
        <Line
          points={[
            [0, 0, -0.55],
            [0, 0, 0.55],
          ]}
          color="#fbbf24"
          lineWidth={2.5}
        />
      </group>

      {/* Primary Body Orbit Circle (r₁ = a·q/(1+q) — NEVER fixed!) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={Math.max(0.15, r1)}
        eccentricity={0.0}
        colorHex="#fbbf24"
        opacity={0.75}
        showApsidesMarkers={false}
      />

      {/* Secondary Companion Orbit Circle (r₂ = a/(1+q)) */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={r2}
        eccentricity={0.0}
        colorHex="#38bdf8"
        opacity={0.75}
        showApsidesMarkers={false}
      />

      {/* Line of Centers Connecting M₁ and m₂ Through the Barycenter */}
      <Line points={[primaryPos, secondaryPos]} color="#64748b" lineWidth={1.4} />

      {/* Primary Star M₁ */}
      <ScientificStarMaterial
        objectId="primary_body"
        sceneId={sceneId}
        name="Primary Body M₁"
        temperatureK={5772}
        position={primaryPos}
        radius={1.05}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("primary_body")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Companion Body m₂ (Star if q >= 0.5, Giant Planet if q < 0.5) */}
      {q >= 0.5 ? (
        <ScientificStarMaterial
          objectId="secondary_body"
          sceneId={sceneId}
          name={`Companion Star m₂ (q = ${q.toFixed(2)})`}
          temperatureK={4600}
          position={secondaryPos}
          radius={0.85 * Math.pow(q, 0.25)}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("secondary_body")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      ) : (
        <ScientificPlanetMaterial
          objectId="secondary_body"
          sceneId={sceneId}
          presetId="jupiter"
          position={secondaryPos}
          radius={0.58}
          starPosition={primaryPos}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("secondary_body")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      )}

      {/* Hill Sphere & Co-Rotating L1–L5 Lagrange Points */}
      {showLagrangePoints && (
        <group>
          <mesh position={secondaryPos} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[hillRadius - 0.02, hillRadius + 0.02, 48]} />
            <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} transparent opacity={0.65} />
          </mesh>
          {lagrangePts.map((pt) => (
            <mesh key={pt.id} position={pt.pos}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshBasicMaterial color={pt.color} />
            </mesh>
          ))}
          {lagrangePts.length === 5 && (
            <>
              {/* Equilateral Trojan Triangles to L4 (+60°) and L5 (-60°) */}
              <Line
                points={[primaryPos, lagrangePts[3].pos, secondaryPos]}
                color="#10b981"
                lineWidth={1.2}
                transparent
                opacity={0.45}
              />
              <Line
                points={[primaryPos, lagrangePts[4].pos, secondaryPos]}
                color="#10b981"
                lineWidth={1.2}
                transparent
                opacity={0.45}
              />
            </>
          )}
        </group>
      )}
    </group>
  );
}

/**
 * Dispatcher for all 8 chapters of Module 08.
 */
export function Module08CinematicDirectorScene(props: Module08SceneProps) {
  const sceneComp: ProofOfConceptSceneComponentId =
    props.activeCue?.sceneComponentId ||
    ([
      "m08_ch1_gravity_inverse_square",
      "m08_ch2_orbital_free_fall",
      "m08_ch3_conic_orbit_geometry",
      "m08_ch4_vis_viva_velocity",
      "m08_ch5_newton_laws_motion",
      "m08_ch6_kepler_three_laws",
      "m08_ch7_escape_velocity_well",
      "m08_ch8_barycenter_multibody",
    ][props.activeCue?.layerOrPresetIndex ?? 0] as ProofOfConceptSceneComponentId) ||
    "m08_ch1_gravity_inverse_square";

  switch (sceneComp) {
    case "m08_ch1_gravity_inverse_square":
      return <GravityConceptScene {...props} />;
    case "m08_ch2_orbital_free_fall":
      return <OrbitalMotionScene {...props} />;
    case "m08_ch3_conic_orbit_geometry":
      return <OrbitalGeometryScene {...props} />;
    case "m08_ch4_vis_viva_velocity":
      return <OrbitalVelocityScene {...props} />;
    case "m08_ch5_newton_laws_motion":
      return <NewtonLawsScene {...props} />;
    case "m08_ch6_kepler_three_laws":
      return <KeplerLawsScene {...props} />;
    case "m08_ch7_escape_velocity_well":
      return <EscapeVelocityScene {...props} />;
    case "m08_ch8_barycenter_multibody":
      return <BarycenterScene {...props} />;
    default:
      return <GravityConceptScene {...props} />;
  }
}
