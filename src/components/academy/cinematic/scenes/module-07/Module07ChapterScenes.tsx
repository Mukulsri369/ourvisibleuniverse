/**
 * COSMOS Stage 2 — Module 07 Complete 7-Chapter 3D Scientific Scene Suite
 * "The Sun: Our Star"
 *
 * Implements 7 distinct, scientifically verified 3D chapter scenes:
 * - Chapter 07.1 (m07_ch1_solar_core_fusion): Proton-Proton chain, Gamow quantum tunneling, & hydrostatic balance
 * - Chapter 07.2 (m07_ch2_solar_interior_layers): Cutaway core/radiative/tachocline/convective layers & photon random walk
 * - Chapter 07.3 (m07_ch3_solar_atmosphere_eclipse): Photosphere, chromosphere spicules, transition region & 2 MK corona
 * - Chapter 07.4 (m07_ch4_sunspots_granulation_prominences): Granulation cells, bipolar sunspot magnetic inhibition & prominence loop
 * - Chapter 07.5 (m07_ch5_magnetic_dynamo_cycle): Differential rotation Omega-effect winding & 11/22-yr solar cycle butterfly bands
 * - Chapter 07.6 (m07_ch6_flares_cmes_heliosphere): Magnetic reconnection X-point, expanding CME flux rope & Parker spiral
 * - Chapter 07.7 (m07_ch7_space_weather_magnetosphere): Solar wind bow shock, Earth magnetopause, southward Bz reconnection & aurorae
 */

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityProfile } from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type { RegisteredAnimationCue } from "@/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import {
  ScientificPlanetMaterial,
  ScientificStarMaterial,
  OrbitalTrajectoryRenderer,
  ScientificFieldRenderer,
  type VectorArrowDescriptor,
  type FieldLineDescriptor,
} from "../../science";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
  type ChapterControlValueMap,
  type ProofOfConceptSceneComponentId,
} from "@/lib/cosmos/cinematic/poc";

export interface Module07ChapterSceneProps {
  sceneId: string;
  lessonId?: string;
  qualityProfile: CinematicQualityProfile;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  activeCue: RegisteredAnimationCue | null;
  reducedMotion?: boolean;
  onSelectObject: (objectId: string) => void;
}

function useChapterControls(chapterId: string): ChapterControlValueMap {
  const store = useMemo(() => CosmosChapterInteractionStore.getInstance(), []);
  const [controls, setControls] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues("07", chapterId),
  );
  useEffect(() => {
    setControls(store.getChapterValues("07", chapterId));
    return store.subscribe(() => {
      setControls({ ...store.getChapterValues("07", chapterId) });
    });
  }, [store, chapterId]);
  return controls;
}

// ============================================================================
// CHAPTER 07.1 — INSIDE THE SOLAR CORE: NUCLEAR FUSION & QUANTUM TUNNELING
// ============================================================================
function SolarCoreFusionScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-01");
  const coreTempMK = Number(controls.coreTemperatureMK ?? 15.7);
  const coreDensity = Number(controls.coreDensityGcm3 ?? 150);
  const showTunneling = Boolean(controls.showQuantumTunnelingWave ?? true);

  const p1Ref = useRef<THREE.Mesh>(null);
  const p2Ref = useRef<THREE.Mesh>(null);
  const he4Ref = useRef<THREE.Mesh>(null);
  const neutrinoRingRef = useRef<THREE.Mesh>(null);
  const phaseRef = useRef(0);

  const reactionRateScale = Math.pow(coreTempMK / 15.7, 1.4) * (coreDensity / 150);

  useFrame((_, delta) => {
    if (!isSimulationRunning) return;
    phaseRef.current = (phaseRef.current + delta * simulationTimeScale * 0.85 * reactionRateScale) % (Math.PI * 2);
    const s = Math.sin(phaseRef.current);
    const sep = Math.max(0.28, 1.45 - Math.abs(s) * 1.15);

    if (p1Ref.current) p1Ref.current.position.set(-sep, Math.sin(phaseRef.current * 2) * 0.12, 0);
    if (p2Ref.current) p2Ref.current.position.set(sep, -Math.sin(phaseRef.current * 2) * 0.12, 0);
    if (he4Ref.current) {
      const pulse = 0.85 + 0.25 * Math.max(0, Math.abs(s) - 0.65);
      he4Ref.current.scale.setScalar(pulse);
    }
    if (neutrinoRingRef.current) {
      const expand = ((phaseRef.current / (Math.PI * 2)) * 4.2) + 0.6;
      neutrinoRingRef.current.scale.setScalar(expand);
    }
  });

  // Hydrostatic Equilibrium Vectors: Inward Gravity vs Outward Thermal + Radiation Pressure
  const hydrostaticVectors = useMemo<VectorArrowDescriptor[]>(() => {
    const vectors: VectorArrowDescriptor[] = [];
    const pressureLen = Math.min(1.5, 0.85 * (coreTempMK / 15.7));
    const gravLen = Math.min(1.5, 0.85 * (coreDensity / 150));

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cx = Math.cos(a);
      const cz = Math.sin(a);
      // Outward thermal pressure gradient (-∇P)
      vectors.push({
        origin: [cx * 2.1, 0, cz * 2.1],
        direction: [cx, 0, cz],
        length: pressureLen,
        colorHex: "#fbbf24",
      });
      // Inward self-gravity (-ρg)
      vectors.push({
        origin: [cx * 3.8, 0, cz * 3.8],
        direction: [-cx, 0, -cz],
        length: gravLen,
        colorHex: "#ef4444",
      });
    }
    return vectors;
  }, [coreTempMK, coreDensity]);

  return (
    <group>
      {/* Translucent Solar Core Plasma Envelope (0–0.25 R_sun) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("solar_core_fusion_zone");
        }}
      >
        <sphereGeometry args={[3.35, 36, 24]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </mesh>

      {/* Central Helium-4 Alpha Particle Product Node */}
      <mesh
        ref={he4Ref}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("pp_chain_reaction_node");
        }}
      >
        <sphereGeometry args={[0.52, 24, 24]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#fbbf24"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>

      {/* Colliding Protons (p + p) */}
      <mesh
        ref={p1Ref}
        position={[-1.2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("pp_chain_reaction_node");
        }}
      >
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.1} />
      </mesh>
      <mesh
        ref={p2Ref}
        position={[1.2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("pp_chain_reaction_node");
        }}
      >
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={1.1} />
      </mesh>

      {/* Gamow Quantum Tunneling Wavefunction Envelope & Coulomb Barrier Torus */}
      {showTunneling && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("coulomb_tunneling_barrier");
          }}
        >
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.05, 0.045, 16, 64]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.38, 0.38, 2.2, 24, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.22}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Expanding Solar Neutrino Escape Wavefront */}
      <mesh ref={neutrinoRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.82, 48]} />
        <meshBasicMaterial
          color="#a7f3d0"
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Hydrostatic Balance Force Vectors */}
      <ScientificFieldRenderer
        vectors={hydrostaticVectors}
        fieldLines={[]}
        equipotentialRings={[]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 07.2 — LAYERS OF THE SUN: RADIATIVE ZONE, TACHOCLINE & CONVECTION
// ============================================================================
function SolarInteriorLayersScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-02");
  const cutawayDeg = Number(controls.interiorCutawayAngleDeg ?? 110);
  const opacityMultiplier = Number(controls.radiativeOpacityMultiplier ?? 1.0);
  const showPhotonWalk = Boolean(controls.showRandomWalkPhotonPath ?? true);

  const photonMarkerRef = useRef<THREE.Mesh>(null);
  const walkStepRef = useRef(0);

  // Generate a 3D zig-zag random walk path from core (r=0.5) to tachocline (r=2.15)
  const photonWalkPoints = useMemo(() => {
    const pts: Array<[number, number, number]> = [[0.2, 0, 0.2]];
    const steps = Math.min(48, Math.round(26 * opacityMultiplier));
    let seed = 42;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    for (let i = 1; i <= steps; i++) {
      const r = 0.35 + (i / steps) * 1.75;
      const theta = (rand() - 0.5) * 1.4;
      const phi = (rand() - 0.2) * 1.6;
      pts.push([
        r * Math.cos(theta) * Math.cos(phi),
        r * Math.sin(theta),
        r * Math.cos(theta) * Math.sin(phi),
      ]);
    }
    return pts;
  }, [opacityMultiplier]);

  useFrame((_, delta) => {
    if (!isSimulationRunning || !photonMarkerRef.current || photonWalkPoints.length === 0) return;
    walkStepRef.current =
      (walkStepRef.current + (delta * simulationTimeScale * 4.5) / opacityMultiplier) %
      photonWalkPoints.length;
    const idx = Math.floor(walkStepRef.current);
    const nextIdx = (idx + 1) % photonWalkPoints.length;
    const frac = walkStepRef.current - idx;
    const pA = photonWalkPoints[idx];
    const pB = photonWalkPoints[nextIdx];
    photonMarkerRef.current.position.set(
      pA[0] + (pB[0] - pA[0]) * frac,
      pA[1] + (pB[1] - pA[1]) * frac,
      pA[2] + (pB[2] - pA[2]) * frac,
    );
  });

  const phiLen = THREE.MathUtils.degToRad(360 - cutawayDeg);

  // Convective zone overturning circulation loops (0.71 - 1.00 R_sun => r = 2.15 to 3.0)
  const convectiveFieldLines = useMemo<FieldLineDescriptor[]>(() => {
    const lines: FieldLineDescriptor[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 1.2 + 0.4;
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 16; s++) {
        const t = (s / 16) * Math.PI * 2;
        const r = 2.55 + Math.sin(t) * 0.36;
        const a = angle + Math.cos(t) * 0.14;
        pts.push([Math.cos(a) * r, Math.sin(t * 2) * 0.18, Math.sin(a) * r]);
      }
      lines.push({
        points: pts,
        colorHex: i % 2 === 0 ? "#f97316" : "#fbbf24",
        opacity: 0.75,
      });
    }
    if (showPhotonWalk) {
      lines.push({
        points: photonWalkPoints,
        colorHex: "#fef08a",
        opacity: 0.92,
      });
    }
    return lines;
  }, [photonWalkPoints, showPhotonWalk]);

  return (
    <group>
      {/* Inner Core (0–0.25 R_sun => r = 0.78) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("solar_core_fusion_zone");
        }}
      >
        <sphereGeometry args={[0.78, 32, 24]} />
        <meshStandardMaterial
          color="#fef9c3"
          emissive="#fde047"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Radiative Zone Shell (0.25–0.71 R_sun => r = 2.13) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("radiative_zone_shell");
        }}
      >
        <sphereGeometry args={[2.13, 36, 28, 0, phiLen]} />
        <meshStandardMaterial
          color="#facc15"
          emissive="#f59e0b"
          emissiveIntensity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tachocline Shear Layer Ring at 0.71 R_sun (r = 2.15) */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("tachocline_shear_layer");
        }}
      >
        <torusGeometry args={[2.15, 0.045, 16, 72]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Convective Zone Outer Shell (0.71–1.00 R_sun => r = 3.0) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("convective_zone_plumes");
        }}
      >
        <sphereGeometry args={[3.0, 42, 32, 0, phiLen]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#dc2626"
          emissiveIntensity={0.65}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Animated Random-Walk Photon Particle */}
      {showPhotonWalk && (
        <mesh
          ref={photonMarkerRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("radiative_zone_shell");
          }}
        >
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}

      {/* Photon Random Walk & Convective Overturning Loops */}
      <ScientificFieldRenderer
        vectors={[]}
        fieldLines={convectiveFieldLines}
        equipotentialRings={[]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 07.3 — THE SOLAR ATMOSPHERE: PHOTOSPHERE, CHROMOSPHERE & CORONA
// ============================================================================
function SolarAtmosphereEclipseScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-03");
  const eclipseOcculter = Boolean(controls.eclipseOcculterActive ?? false);
  const waveFlux = Number(controls.coronalMagneticWaveFlux ?? 1.0);
  const filterBand = String(controls.atmosphericFilterBand ?? "euv_171_corona");

  const starTemp =
    filterBand === "white_light_photosphere"
      ? 5772
      : filterBand === "h_alpha_chromosphere"
        ? 3800
        : 9500;

  // Coronal helmet streamer arches & chromospheric spicule jets
  const coronalStreamers = useMemo<FieldLineDescriptor[]>(() => {
    const lines: FieldLineDescriptor[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const baseAngle = (i / count) * Math.PI * 2;
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 20; s++) {
        const u = (s / 20 - 0.5) * 0.75;
        const r = 2.4 + Math.cos(u * 2.1) * (1.35 * Math.sqrt(waveFlux));
        const a = baseAngle + u;
        pts.push([Math.cos(a) * r, Math.sin(a) * r, Math.sin(u * 3) * 0.25]);
      }
      lines.push({
        points: pts,
        colorHex: filterBand === "h_alpha_chromosphere" ? "#fb7185" : "#7dd3fc",
        opacity: 0.72,
      });
    }
    return lines;
  }, [waveFlux, filterBand]);

  return (
    <group>
      {/* Photosphere Base Surface (5,772 K) */}
      <ScientificStarMaterial
        objectId="photosphere_limb_surface"
        position={[0, 0, 0]}
        radius={2.35}
        temperatureK={starTemp}
        coronaScale={1.35 + waveFlux * 0.35}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Ruby-Red H-Alpha Chromosphere Rim & Spicule Shell */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("chromosphere_spicule_rim");
        }}
      >
        <sphereGeometry args={[2.46, 36, 28]} />
        <meshBasicMaterial
          color="#f43f5e"
          transparent
          opacity={filterBand === "h_alpha_chromosphere" ? 0.52 : 0.24}
          depthWrite={false}
        />
      </mesh>

      {/* Total Solar Eclipse Lunar Occultation Disc Toggle */}
      {eclipseOcculter && (
        <mesh
          position={[0, 0, 0.28]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("coronal_helmet_streamers");
          }}
        >
          <circleGeometry args={[2.38, 64]} />
          <meshBasicMaterial color="#030712" />
        </mesh>
      )}

      {/* 2 Million K Coronal Helmet Streamers */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("coronal_helmet_streamers");
        }}
      >
        <ScientificFieldRenderer
          vectors={[]}
          fieldLines={coronalStreamers}
          equipotentialRings={[]}
        />
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 07.4 — SOLAR SURFACE FEATURES: SUNSPOTS, GRANULATION & PROMINENCES
// ============================================================================
function SunspotsGranulationProminencesScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-04");
  const bFieldGauss = Number(controls.sunspotMagneticFieldGauss ?? 3200);
  const archHeightMm = Number(controls.prominenceArchHeightMm ?? 85);
  const showFluxRopes = Boolean(controls.showSubsurfaceFluxRopes ?? true);

  const archFactor = archHeightMm / 85;
  const spotRadius = 0.28 + (bFieldGauss / 4500) * 0.24;

  // Photospheric Granulation Cell Array (Bright Upwelling Centers + Dark Lanes)
  const granules = useMemo(() => {
    const list: Array<{ x: number; z: number; r: number }> = [];
    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -2; gz <= 2; gz++) {
        if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue; // Leave room for bipolar sunspot pair
        list.push({
          x: gx * 0.92 + (gz % 2) * 0.25,
          z: gz * 0.88,
          r: 0.36,
        });
      }
    }
    return list;
  }, []);

  // Bipolar Magnetic Arcade & Kippenhahn-Schlüter Prominence Support Loops
  const magneticArcadeLines = useMemo<FieldLineDescriptor[]>(() => {
    const lines: FieldLineDescriptor[] = [];
    const heights = [1.4, 2.0, 2.6].map((h) => h * archFactor);
    heights.forEach((h, idx) => {
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 28; s++) {
        const t = (s / 28) * Math.PI; // 0 to pi from North polarity (-X) to South polarity (+X)
        const x = -Math.cos(t) * 1.25;
        const y = Math.sin(t) * h;
        const z = (idx - 1) * 0.32 + Math.sin(t * 4) * 0.08;
        pts.push([x, y, z]);
      }
      lines.push({
        points: pts,
        colorHex: idx === 1 ? "#f43f5e" : "#38bdf8",
        opacity: idx === 1 ? 0.95 : 0.65,
      });
    });

    if (showFluxRopes) {
      const subPts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 20; s++) {
        const t = (s / 20) * Math.PI;
        subPts.push([-Math.cos(t) * 1.25, -Math.sin(t) * 1.1, 0]);
      }
      lines.push({
        points: subPts,
        colorHex: "#fbbf24",
        opacity: 0.75,
      });
    }
    return lines;
  }, [archFactor, showFluxRopes]);

  return (
    <group position={[0, -0.8, 0]}>
      {/* Photospheric Patch Base */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("photospheric_granulation_cells");
        }}
      >
        <planeGeometry args={[8.2, 5.6]} />
        <meshStandardMaterial
          color="#ea580c"
          emissive="#f59e0b"
          emissiveIntensity={0.75}
          roughness={0.6}
        />
      </mesh>

      {/* Granulation Convection Cell Tops */}
      {granules.map((g, idx) => (
        <mesh
          key={idx}
          position={[g.x, 0.04, g.z]}
          scale={[1, 0.25, 1]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("photospheric_granulation_cells");
          }}
        >
          <sphereGeometry args={[g.r, 16, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#facc15"
            emissiveIntensity={0.95}
          />
        </mesh>
      ))}

      {/* Bipolar Sunspot Pair (North & South Magnetic Footpoints with Umbra + Penumbra) */}
      {[-1.25, 1.25].map((xPos, idx) => (
        <group
          key={idx}
          position={[xPos, 0.02, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("bipolar_sunspot_pair");
          }}
        >
          {/* Penumbra */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[spotRadius, spotRadius * 1.85, 32]} />
            <meshBasicMaterial color="#7c2d12" side={THREE.DoubleSide} />
          </mesh>
          {/* Dark Umbra (3,800 K) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[spotRadius, 32]} />
            <meshBasicMaterial color="#1c1917" />
          </mesh>
        </group>
      ))}

      {/* Glowing H-Alpha Prominence Plasma Tube Suspended in Magnetic Arcade */}
      <mesh
        position={[0, 1.0 * archFactor, 0]}
        rotation={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("coronal_prominence_arcade");
        }}
      >
        <torusGeometry args={[1.25, 0.11, 16, 48, Math.PI]} />
        <meshStandardMaterial
          color="#fb7185"
          emissive="#e11d48"
          emissiveIntensity={1.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Bipolar Magnetic Arcade & Subsurface Flux Ropes */}
      <ScientificFieldRenderer
        vectors={[]}
        fieldLines={magneticArcadeLines}
        equipotentialRings={[]}
      />
    </group>
  );
}

// ============================================================================
// CHAPTER 07.5 — THE SOLAR MAGNETIC DYNAMO & 11-YEAR CYCLE
// ============================================================================
function MagneticDynamoCycleScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-05");
  const cycleYear = Number(controls.solarCyclePhaseYear ?? 4.5);
  const shearRate = Number(controls.differentialShearRate ?? 1.0);
  const showButterfly = Boolean(controls.showButterflyLatitudeBands ?? true);

  // Winding factor increases toward Solar Maximum (~year 5.5)
  const windingTurns = Math.sin((cycleYear / 11) * Math.PI) * 3.2 * shearRate;
  // Spörer's Law sunspot latitude migrates from ±35° to ±8° over 11-year cycle
  const spotLatRad = THREE.MathUtils.degToRad(Math.max(6, 35 - (cycleYear / 11) * 28));

  // Wound magnetic field lines (Poloidal + Toroidal Omega-Effect Winding)
  const dynamoFieldLines = useMemo<FieldLineDescriptor[]>(() => {
    const lines: FieldLineDescriptor[] = [];
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const baseLon = (i / numLines) * Math.PI * 2;
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 40; s++) {
        const lat = ((s / 40) - 0.5) * Math.PI * 0.88; // -79 deg to +79 deg
        // Equatorial regions advance faster in longitude (Omega effect)
        const lonAdvance = Math.pow(Math.cos(lat), 2) * windingTurns * Math.PI;
        const lon = baseLon + lonAdvance;
        const r = 2.48;
        pts.push([
          r * Math.cos(lat) * Math.cos(lon),
          r * Math.sin(lat),
          r * Math.cos(lat) * Math.sin(lon),
        ]);
      }
      lines.push({
        points: pts,
        colorHex: Math.abs(windingTurns) > 1.2 ? "#fb923c" : "#38bdf8",
        opacity: 0.82,
      });
    }
    return lines;
  }, [windingTurns]);

  return (
    <group>
      {/* Differentially Rotating Solar Sphere */}
      <ScientificStarMaterial
        objectId="differential_rotation_bands"
        position={[0, 0, 0]}
        radius={2.35}
        temperatureK={5772}
        coronaScale={1.25}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Spörer's Law Butterfly Diagram Active Latitude Rings (±spotLatRad) */}
      {showButterfly &&
        [1, -1].map((hemisphere) => {
          const y = Math.sin(spotLatRad) * 2.38 * hemisphere;
          const ringR = Math.cos(spotLatRad) * 2.38;
          return (
            <mesh
              key={hemisphere}
              position={[0, y, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject("butterfly_active_latitude_belt");
              }}
            >
              <torusGeometry args={[ringR, 0.045, 12, 64]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          );
        })}

      {/* Poloidal-to-Toroidal Dynamo Field Lines */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("omega_toroidal_flux_winding");
        }}
      >
        <ScientificFieldRenderer
          vectors={[]}
          fieldLines={dynamoFieldLines}
          equipotentialRings={[]}
        />
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 07.6 — SOLAR FLARES, CORONAL MASS EJECTIONS & THE HELIOSPHERE
// ============================================================================
function FlaresCmesHeliosphereScene({
  isSimulationRunning,
  simulationTimeScale,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-06");
  const cmeSpeedKms = Number(controls.cmeVelocityKms ?? 1200);
  const flarePower = Number(controls.flareClassLogPower ?? 1.5);
  const showParkerSpiral = Boolean(controls.showParkerSpiralField ?? true);

  const cmeFrontRef = useRef<THREE.Group>(null);
  const cmeDistRef = useRef(2.2);

  useFrame((_, delta) => {
    if (!isSimulationRunning || !cmeFrontRef.current) return;
    cmeDistRef.current += delta * simulationTimeScale * (cmeSpeedKms / 600);
    if (cmeDistRef.current > 7.5) cmeDistRef.current = 1.8;
    const d = cmeDistRef.current;
    cmeFrontRef.current.position.set(d, 0, 0);
    const expand = 0.45 + d * 0.28;
    cmeFrontRef.current.scale.setScalar(expand);
  });

  // Parker Archimedean Spiral Interplanetary Magnetic Field Lines
  // r - r0 = -(v_sw / Omega_sun) * (phi - phi0)
  const parkerSpiralLines = useMemo<FieldLineDescriptor[]>(() => {
    if (!showParkerSpiral) return [];
    const lines: FieldLineDescriptor[] = [];
    const arms = 6;
    const pitchFactor = 400 / Math.max(300, cmeSpeedKms * 0.45);
    for (let a = 0; a < arms; a++) {
      const phi0 = (a / arms) * Math.PI * 2;
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 32; s++) {
        const r = 1.45 + (s / 32) * 6.8;
        const phi = phi0 - (r - 1.45) * 0.42 * pitchFactor;
        pts.push([Math.cos(phi) * r, 0, Math.sin(phi) * r]);
      }
      lines.push({
        points: pts,
        colorHex: a % 2 === 0 ? "#38bdf8" : "#f43f5e",
        opacity: 0.55,
      });
    }
    return lines;
  }, [showParkerSpiral, cmeSpeedKms]);

  return (
    <group>
      {/* Central Sun */}
      <ScientificStarMaterial
        objectId="flare_reconnection_x_point"
        position={[0, 0, 0]}
        radius={1.35}
        temperatureK={5772}
        coronaScale={1.35}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Magnetic Reconnection X-Point Flare Flash at East Limb (+X) */}
      <mesh
        position={[1.42, 0.15, 0]}
        scale={0.5 + flarePower * 0.35}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("flare_reconnection_x_point");
        }}
      >
        <octahedronGeometry args={[0.38, 1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Expanding Twisted Magnetic Flux-Rope CME Cloud */}
      <group
        ref={cmeFrontRef}
        position={[3.6, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("cme_magnetic_flux_rope");
        }}
      >
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.1, 0.32, 16, 48, Math.PI * 1.15]} />
          <meshStandardMaterial
            color="#fb923c"
            emissive="#f97316"
            emissiveIntensity={1.2}
            transparent
            opacity={0.72}
          />
        </mesh>
        {/* Fast-Mode MHD Shock Sheath Ahead of CME */}
        <mesh position={[0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.38, 0.05, 12, 48, Math.PI * 1.25]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      </group>

      {/* Heliopause / Outer Heliospheric Boundary Ring */}
      <OrbitalTrajectoryRenderer
        semiMajorAxis={8.2}
        eccentricity={0.08}
        colorHex="#818cf8"
        opacity={0.38}
        showApsidesMarkers={false}
      />

      {/* Parker Spiral Interplanetary Magnetic Field */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("parker_spiral_heliosphere");
        }}
      >
        <ScientificFieldRenderer
          vectors={[]}
          fieldLines={parkerSpiralLines}
          equipotentialRings={[]}
        />
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 07.7 — SPACE WEATHER & EARTH'S MAGNETOSPHERE: AURORAS & STORMS
// ============================================================================
function SpaceWeatherMagnetosphereScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module07ChapterSceneProps) {
  const controls = useChapterControls("sub-07");
  const swSpeed = Number(controls.solarWindSpeedKms ?? 650);
  const imfBz = Number(controls.imfBzSouthwardNt ?? -12);
  const showAurora = Boolean(controls.showAuroralOvalRings ?? true);

  // Dayside magnetopause standoff distance compresses as dynamic pressure rises
  const standoffScale = Math.max(0.68, Math.pow(400 / swSpeed, 1 / 3));
  const southwardReconnection = imfBz < -2;
  const auroraBrightness = southwardReconnection
    ? Math.min(1.0, Math.abs(imfBz) / 18)
    : 0.22;

  // Earth's Asymmetric Magnetosphere Field Lines (Compressed Dayside -X, Stretched Magnetotail +X)
  const magnetosphereLines = useMemo<FieldLineDescriptor[]>(() => {
    const lines: FieldLineDescriptor[] = [];
    // Dayside closed dipole loops compressed toward Earth
    for (let i = -2; i <= 2; i++) {
      const zOff = i * 0.45;
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 24; s++) {
        const lat = ((s / 24) - 0.5) * Math.PI * 0.82;
        const r = 2.6 * standoffScale * Math.pow(Math.cos(lat), 2);
        pts.push([-r * Math.cos(lat), r * Math.sin(lat) * 1.35, zOff]);
      }
      lines.push({
        points: pts,
        colorHex: southwardReconnection ? "#f43f5e" : "#38bdf8",
        opacity: 0.78,
      });
    }

    // Stretched Nightside Magnetotail Lobes (+X)
    [1, -1].forEach((hemi) => {
      const pts: Array<[number, number, number]> = [];
      for (let s = 0; s <= 20; s++) {
        const u = s / 20;
        const x = 0.6 + u * 6.2;
        const y = hemi * (0.95 + Math.sin(u * Math.PI * 0.6) * 0.85);
        pts.push([x, y, 0]);
      }
      lines.push({
        points: pts,
        colorHex: "#60a5fa",
        opacity: 0.72,
      });
    });

    return lines;
  }, [standoffScale, southwardReconnection]);

  // Incoming Supersonic Solar Wind Stream Vectors from -X
  const solarWindVectors = useMemo<VectorArrowDescriptor[]>(() => {
    const vecs: VectorArrowDescriptor[] = [];
    for (let y = -2; y <= 2; y++) {
      vecs.push({
        origin: [-5.8, y * 1.05, 0],
        direction: [1, 0, 0],
        length: Math.min(1.6, swSpeed / 550),
        colorHex: "#fde047",
      });
    }
    return vecs;
  }, [swSpeed]);

  return (
    <group>
      {/* Earth at Center of Magnetosphere */}
      <ScientificPlanetMaterial
        objectId="magnetopause_bow_shock"
        sceneId={sceneId}
        presetId="earth"
        position={[0, 0, 0]}
        radius={1.15}
        starPosition={[-14, 0, 0]}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        highlighted={activeHighlightedObjects.includes("magnetopause_bow_shock")}
        narrativeProgress={normalizedProgress}
        onSelectObject={onSelectObject}
      />

      {/* Parabolic Supersonic Bow Shock Envelope Ahead of Dayside Magnetopause */}
      <mesh
        position={[-2.85 * standoffScale, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("magnetopause_bow_shock");
        }}
      >
        <torusGeometry args={[2.55, 0.04, 16, 64, Math.PI * 1.1]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.72} />
      </mesh>

      {/* Polar Auroral Ovals (557.7 nm Green & 630.0 nm Red Atomic Oxygen Emission) */}
      {showAurora &&
        [1, -1].map((pole) => (
          <group
            key={pole}
            position={[0, pole * 1.02, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("polar_auroral_ovals");
            }}
          >
            {/* 557.7 nm Green Lower Auroral Curtain */}
            <mesh>
              <torusGeometry args={[0.56, 0.048, 16, 48]} />
              <meshBasicMaterial
                color="#4ade80"
                transparent
                opacity={0.45 + auroraBrightness * 0.52}
              />
            </mesh>
            {/* 630.0 nm High-Altitude Red Auroral Crown */}
            <mesh position={[0, 0, -pole * 0.06]}>
              <torusGeometry args={[0.62, 0.032, 16, 48]} />
              <meshBasicMaterial
                color="#fb7185"
                transparent
                opacity={auroraBrightness * 0.75}
              />
            </mesh>
          </group>
        ))}

      {/* Magnetospheric Field Lines & Incoming Solar Wind Vectors */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("magnetotail_reconnection_sheet");
        }}
      >
        <ScientificFieldRenderer
          vectors={solarWindVectors}
          fieldLines={magnetosphereLines}
          equipotentialRings={[]}
        />
      </group>
    </group>
  );
}

// ============================================================================
// MODULE 07 DIRECTOR ROUTER
// ============================================================================
export function Module07CinematicDirectorScene(props: Module07ChapterSceneProps) {
  const effectiveLessonId = props.lessonId || props.activeCue?.sublessonId || "sub-01";
  const beatInfo = useMemo(() => {
    const segId = props.activeCue?.narrationSegmentId || "";
    return (
      CosmosProofOfConceptCatalog.getBeatForNarrationSegment("07", effectiveLessonId, segId) || {
        chapter: CosmosProofOfConceptCatalog.getChapterManifest("07", effectiveLessonId),
        beat: null,
      }
    );
  }, [effectiveLessonId, props.activeCue?.narrationSegmentId]);

  const componentId =
    props.activeCue?.sceneComponentId ||
    beatInfo.chapter?.sceneComponentId ||
    "m07_ch1_solar_introduction";

  switch (componentId as string) {
    case "m07_ch1_solar_introduction":
      return <MagneticDynamoCycleScene {...props} />;
    case "m07_ch2_solar_interior":
    case "m07_ch2_solar_interior_layers":
      return <SolarInteriorLayersScene {...props} />;
    case "m07_ch3_nuclear_fusion":
    case "m07_ch1_solar_core_fusion":
      return <SolarCoreFusionScene {...props} />;
    case "m07_ch4_solar_atmosphere":
    case "m07_ch3_solar_atmosphere_eclipse":
      return <SolarAtmosphereEclipseScene {...props} />;
    case "m07_ch5_sunspots_magnetism":
    case "m07_ch4_sunspots_granulation_prominences":
    case "m07_ch5_magnetic_dynamo_cycle":
      return <SunspotsGranulationProminencesScene {...props} />;
    case "m07_ch6_flares_and_cmes":
    case "m07_ch6_flares_cmes_heliosphere":
      return <FlaresCmesHeliosphereScene {...props} />;
    case "m07_ch7_solar_wind_space_weather":
    case "m07_ch7_space_weather_magnetosphere":
      return <SpaceWeatherMagnetosphereScene {...props} />;
    default:
      return <SolarCoreFusionScene {...props} />;
  }
}


