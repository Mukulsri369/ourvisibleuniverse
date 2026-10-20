/**
 * COSMOS Stage 2 — Module 06 Complete 8-Chapter 3D Scientific Scene Suite
 * "Explore the Solar System"
 *
 * Implements 8 distinct, scientifically verified 3D chapter scenes:
 * - Chapter 06.1 (m06_ch1_solar_system_formation): Nebular collapse, protoplanetary disk & 2.7 AU Frost Line
 * - Chapter 06.2 (m06_ch2_terrestrial_planets): Mercury, Venus, Earth & Mars with core-mantle-crust cutaways
 * - Chapter 06.3 (m06_ch3_gas_giants): Jupiter & Saturn with Great Red Spot, rings, polar hexagon & metallic H
 * - Chapter 06.4 (m06_ch4_ice_giants): Uranus (97.77° tilt) & Neptune with supercritical H₂O-NH₃-CH₄ fluid mantles
 * - Chapter 06.5 (m06_ch5_dwarf_planets): 5 IAU Dwarf Planets (Pluto-Charon, Eris, Ceres, Haumea, Makemake) & Kuiper Belt
 * - Chapter 06.6 (m06_ch6_asteroids_comets): Anti-sunward comet ion/dust tails, 16 Psyche, NASA DART & meteor entry
 * - Chapter 06.7 (m06_ch7_moons_and_rings): Galilean 4:2:1 Laplace resonance, Europa/Enceladus oceans, Titan & Roche limit
 * - Chapter 06.8 (m06_ch8_planetary_comparison): Side-by-side Planetary Architecture & Environment Comparison Lab
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityProfile } from "@/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import type { RegisteredAnimationCue } from "@/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
  type ChapterControlValueMap,
  type ProofOfConceptSceneComponentId,
} from "@/lib/cosmos/cinematic/poc";
import {
  GalaxyParticleField,
  OrbitalTrajectoryRenderer,
  ScientificFieldRenderer,
  ScientificPlanetMaterial,
  ScientificStarMaterial,
  type VectorArrowDescriptor,
} from "../../science";

export interface Module06ChapterSceneProps {
  sceneId: string;
  lessonId?: string;
  qualityProfile: CinematicQualityProfile;
  activeCue: RegisteredAnimationCue | null;
  isSimulationRunning: boolean;
  simulationTimeScale: number;
  normalizedProgress: number;
  activeHighlightedObjects: string[];
  reducedMotion?: boolean;
  onSelectObject: (objectId: string) => void;
}

function useChapterControls(chapterId: string): ChapterControlValueMap {
  const store = useMemo(() => CosmosChapterInteractionStore.getInstance(), []);
  const [values, setValues] = useState<ChapterControlValueMap>(() =>
    store.getChapterValues("06", chapterId),
  );

  useEffect(() => {
    setValues(store.getChapterValues("06", chapterId));
    return store.subscribe(() => {
      setValues(store.getChapterValues("06", chapterId));
    });
  }, [store, chapterId]);

  return values;
}

// ============================================================================
// CHAPTER 06.1 — HOW THE SOLAR SYSTEM FORMED (NEBULAR DISK & 2.7 AU FROST LINE)
// ============================================================================
function SolarSystemFormationScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-01");
  const epochMyr = Number(controls.formationEpochMyr ?? 3.5);
  const showFrostLine = Boolean(controls.showFrostLineBoundary ?? true);

  const protoGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!isSimulationRunning || reducedMotion || !protoGroupRef.current) return;
    protoGroupRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 0.32;
  });

  // Disk flattens and clears as epochMyr progresses from 0 to 50 Myr
  const diskClearedFactor = Math.min(1, epochMyr / 15);
  const frostLineRadius = 3.2;

  return (
    <group>
      {/* Young T-Tauri Protostar at Center */}
      <ScientificStarMaterial
        objectId="protostar_t_tauri"
        position={[0, 0, 0]}
        radius={1.25}
        temperatureK={4800}
        coronaScale={1.75}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* Bipolar Protostellar Herbig-Haro Outflow Jets (Active in Early <10 Myr Epoch) */}
      {epochMyr < 12 && (
        <group>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[0.45, 4.8, 24, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={Math.max(0.08, (1 - epochMyr / 12) * 0.42)}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, -3.2, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.45, 4.8, 24, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={Math.max(0.08, (1 - epochMyr / 12) * 0.42)}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* Rotating Protoplanetary Dust & Gas Accretion Disk */}
      <GalaxyParticleField
        objectId="protoplanetary_accretion_disk"
        morphology="spiral"
        radius={7.6}
        armCount={3}
        rotation={[0, 0, 0]}
        opacity={Math.max(0.32, 0.88 - diskClearedFactor * 0.42)}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning && !reducedMotion}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {/* 2.7 AU Frost Line (Snow Line) Condensation Boundary Ring */}
      {showFrostLine && (
        <mesh
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("frost_line_boundary_ring");
          }}
        >
          <torusGeometry args={[frostLineRadius, 0.042, 16, 96]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      )}

      {/* Accreting Inner Rocky vs Outer Giant Protoplanets Sweeping Disk Gaps */}
      <group
        ref={protoGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("accreting_protoplanets");
        }}
      >
        {/* Inner Refractory Rocky Protoplanet (< 2.7 AU) */}
        <ScientificPlanetMaterial
          objectId="protoplanet_rocky"
          sceneId={sceneId}
          presetId="earth"
          position={[2.2, 0, 0]}
          radius={0.32 + diskClearedFactor * 0.14}
          starPosition={[-2.2, 0, 0]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("accreting_protoplanets")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
        {/* Outer Volatile Ice+Gas Giant Protoplanet (> 2.7 AU Frost Line) */}
        <ScientificPlanetMaterial
          objectId="protoplanet_jovian"
          sceneId={sceneId}
          presetId="jupiter"
          position={[-4.8, 0, 1.2]}
          radius={0.68 + diskClearedFactor * 0.25}
          starPosition={[4.8, 0, -1.2]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("accreting_protoplanets")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 06.2 — THE FOUR ROCKY PLANETS (MERCURY, VENUS, EARTH, MARS + CORES)
// ============================================================================
function TerrestrialPlanetsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-02");
  const selectedPlanet = String(controls.selectedRockyPlanet ?? "Earth");
  const showCoreCutaway = Boolean(controls.showInteriorCoreCutaway ?? true);

  const planets = useMemo(
    () => [
      {
        name: "Mercury",
        objectId: "mercury_globe",
        preset: "moon" as const,
        x: -4.8,
        r: 0.58,
        coreFraction: 0.85,
        coreColor: "#f59e0b",
        mantleColor: "#78716c",
      },
      {
        name: "Venus",
        objectId: "venus_globe",
        preset: "venus" as const,
        x: -1.8,
        r: 1.18,
        coreFraction: 0.52,
        coreColor: "#fbbf24",
        mantleColor: "#d97706",
      },
      {
        name: "Earth",
        objectId: "earth_globe",
        preset: "earth" as const,
        x: 1.6,
        r: 1.25,
        coreFraction: 0.55,
        coreColor: "#fef08a",
        mantleColor: "#ea580c",
      },
      {
        name: "Mars",
        objectId: "mars_globe",
        preset: "mars" as const,
        x: 4.6,
        r: 0.72,
        coreFraction: 0.48,
        coreColor: "#f97316",
        mantleColor: "#9a3412",
      },
    ],
    [],
  );

  return (
    <group>
      {planets.map((p) => {
        const isSelected = selectedPlanet === p.name;
        const scaleMult = isSelected ? 1.18 : 0.92;
        return (
          <group key={p.name} position={[p.x, 0, isSelected ? 0.8 : 0]} scale={scaleMult}>
            <ScientificPlanetMaterial
              objectId={p.objectId}
              sceneId={sceneId}
              presetId={p.preset}
              position={[0, 0, 0]}
              radius={p.r}
              starPosition={[-8, 4, 10]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={
                p.name === "Venus" ? -simulationTimeScale * 0.2 : simulationTimeScale
              }
              highlighted={isSelected || activeHighlightedObjects.includes(p.objectId)}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />

            {/* Interior Metallic Core & Silicate Mantle Cutaway Indicator */}
            {showCoreCutaway && (
              <group
                position={[0, 0, p.r * 0.32]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("terrestrial_core_cutaway");
                }}
              >
                {/* Silicate Mantle Ring */}
                <mesh>
                  <ringGeometry args={[p.r * p.coreFraction, p.r * 0.92, 32]} />
                  <meshBasicMaterial
                    color={p.mantleColor}
                    transparent
                    opacity={0.78}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                {/* Iron-Nickel Core Sphere */}
                <mesh>
                  <sphereGeometry args={[p.r * p.coreFraction, 24, 24]} />
                  <meshBasicMaterial color={p.coreColor} />
                </mesh>
              </group>
            )}

            {/* Earth's Active Dipolar Magnetosphere Arch */}
            {p.name === "Earth" && (
              <mesh rotation={[0, 0, 0.2]}>
                <torusGeometry args={[p.r * 1.48, 0.018, 12, 64]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

// ============================================================================
// CHAPTER 06.3 — JUPITER AND SATURN: THE GAS GIANTS
// ============================================================================
function GasGiantsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-03");
  const selectedGiant = String(controls.selectedGasGiant ?? "Jupiter");
  const showMetallicH = Boolean(controls.showMetallicHydrogenCutaway ?? true);

  const isJupiter = selectedGiant === "Jupiter";

  return (
    <group>
      {/* Left: Jupiter (11.2 R_⊕, Oblate Zonal Bands, Great Red Spot & 20,000× B_⊕ Magnetosphere) */}
      <group
        position={[-2.9, 0, isJupiter ? 0.7 : -0.4]}
        scale={isJupiter ? [1.08, 1.01, 1.08] : [0.88, 0.82, 0.88]}
      >
        <ScientificPlanetMaterial
          objectId="jupiter_gas_giant"
          sceneId={sceneId}
          presetId="jupiter"
          position={[0, 0, 0]}
          radius={2.15}
          starPosition={[-12, 4, 12]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale * 1.35}
          highlighted={isJupiter || activeHighlightedObjects.includes("jupiter_gas_giant")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />

        {/* Great Red Spot Anticyclonic Vortex Marker (~1.3 Earth Diameters) */}
        <mesh
          position={[0.65, -0.58, 1.98]}
          rotation={[0.25, 0.3, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("great_red_spot_vortex");
          }}
        >
          <torusGeometry args={[0.28, 0.055, 16, 36]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Deep Liquid Metallic Hydrogen Mantle Ring */}
        {showMetallicH && (
          <mesh
            position={[0, 0, 0.8]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("metallic_hydrogen_mantle");
            }}
          >
            <ringGeometry args={[0.45, 1.65, 48]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.42} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Right: Saturn (9.45 R_⊕, 26.73° Tilted Water-Ice Rings & North Polar Hexagon) */}
      <group
        position={[2.9, 0, !isJupiter ? 0.7 : -0.4]}
        rotation={[0.466, 0, 0.15]}
        scale={!isJupiter ? 1.08 : 0.88}
      >
        <ScientificPlanetMaterial
          objectId="saturn_gas_giant"
          sceneId={sceneId}
          presetId="saturn"
          position={[0, 0, 0]}
          radius={1.78}
          starPosition={[-12, 4, 12]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale * 1.2}
          highlighted={!isJupiter || activeHighlightedObjects.includes("saturn_gas_giant")}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />

        {/* North Polar Hexagonal Jet Stream (6-Sided Torus) */}
        <mesh
          position={[0, 1.74, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("saturn_ring_system");
          }}
        >
          <torusGeometry args={[0.42, 0.032, 8, 6]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      </group>

      {/* 1.0 R_⊕ Earth Size Reference Sphere at Bottom Center */}
      <group position={[0, -2.55, 1.2]}>
        <ScientificPlanetMaterial
          objectId="earth_size_reference"
          sceneId={sceneId}
          presetId="earth"
          position={[0, 0, 0]}
          radius={0.22}
          starPosition={[-10, 4, 10]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={false}
          simulationTimeScale={0}
          highlighted={false}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 06.4 — URANUS AND NEPTUNE: THE ICE GIANTS
// ============================================================================
function IceGiantsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-04");
  const selectedIce = String(controls.selectedIceGiant ?? "Uranus");
  const showObliquityAndRings = Boolean(controls.showObliquityAndRings ?? true);

  const isUranus = selectedIce === "Uranus";

  return (
    <group>
      {/* Left: Uranus (19.2 AU, 97.77° Sideways Axial Tilt & Vertical Narrow Dark Rings) */}
      <group position={[-2.6, 0, isUranus ? 0.6 : -0.3]} scale={isUranus ? 1.12 : 0.9}>
        <group rotation={[0, 0, (97.77 * Math.PI) / 180]}>
          <ScientificPlanetMaterial
            objectId="uranus_ice_giant"
            sceneId={sceneId}
            presetId="neptune"
            position={[0, 0, 0]}
            radius={1.55}
            starPosition={[-12, 3, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={isUranus || activeHighlightedObjects.includes("uranus_ice_giant")}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />

          {showObliquityAndRings && (
            <group
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject("uranus_vertical_rings");
              }}
            >
              {/* 97.77° Sideways Spin Axis Rod */}
              <mesh>
                <cylinderGeometry args={[0.025, 0.025, 4.4, 12]} />
                <meshBasicMaterial color="#22d3ee" />
              </mesh>
              {/* Faint Narrow Vertical Rings */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.95, 2.32, 64]} />
                <meshBasicMaterial
                  color="#94a3b8"
                  transparent
                  opacity={0.48}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}
        </group>

        {/* Supercritical H₂O–NH₃–CH₄ Ionic Fluid Mantle Cutaway */}
        {showObliquityAndRings && (
          <mesh
            position={[0, 0, 0.65]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("supercritical_ice_mantle");
            }}
          >
            <ringGeometry args={[0.38, 1.25, 48]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.48} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>

      {/* Right: Neptune (30.1 AU, 28.32° Tilt, 2.6× Internal Heat & 2,100 km/h Winds) */}
      <group position={[2.6, 0, !isUranus ? 0.6 : -0.3]} scale={!isUranus ? 1.12 : 0.9}>
        <group rotation={[0, 0, (28.32 * Math.PI) / 180]}>
          <ScientificPlanetMaterial
            objectId="neptune_ice_giant"
            sceneId={sceneId}
            presetId="neptune"
            position={[0, 0, 0]}
            radius={1.5}
            starPosition={[-12, 3, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale * 1.15}
            highlighted={!isUranus || activeHighlightedObjects.includes("neptune_ice_giant")}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {showObliquityAndRings && (
            <group>
              <mesh>
                <cylinderGeometry args={[0.025, 0.025, 4.2, 12]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.88, 2.12, 64]} />
                <meshBasicMaterial
                  color="#64748b"
                  transparent
                  opacity={0.35}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

// ============================================================================
// CHAPTER 06.5 — DWARF PLANETS & BEYOND (PLUTO-CHARON, ERIS, CERES, HAUMEA)
// ============================================================================
function DwarfPlanetsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-05");
  const selectedDwarf = String(controls.selectedDwarfPlanet ?? "Pluto");
  const showInclinedOrbits = Boolean(controls.showInclinedTnoOrbits ?? true);

  const binaryRef = useRef<THREE.Group>(null);
  const haumeaSpinRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!isSimulationRunning || reducedMotion) return;
    const dt = Math.min(delta, 0.1) * simulationTimeScale;
    if (binaryRef.current) {
      binaryRef.current.rotation.y += dt * 0.65;
    }
    if (haumeaSpinRef.current) {
      // Haumea rapid 3.9-hour rotation
      haumeaSpinRef.current.rotation.y += dt * 2.8;
    }
  });

  return (
    <group>
      {/* Kuiper Belt Icy Planetesimal Torus (30–50 AU) */}
      <GalaxyParticleField
        objectId="kuiper_belt_torus"
        morphology="spiral"
        radius={6.2}
        armCount={2}
        rotation={[0.12, 0, 0]}
        opacity={0.68}
        qualityTier={qualityProfile.tier}
        isSimulationRunning={isSimulationRunning && !reducedMotion}
        simulationTimeScale={simulationTimeScale * 0.35}
        onSelectObject={onSelectObject}
      />

      {/* Inclined Trans-Neptunian Orbits (Pluto i = 17.2°, Eris i = 44.0°) */}
      {showInclinedOrbits && (
        <group>
          <group rotation={[0, 0, (17.16 * Math.PI) / 180]}>
            <OrbitalTrajectoryRenderer
              semiMajorAxis={4.6}
              eccentricity={0.2488}
              colorHex="#38bdf8"
              opacity={0.55}
              showApsidesMarkers={false}
            />
          </group>
          <group rotation={[0, 0, (44.04 * Math.PI) / 180]}>
            <OrbitalTrajectoryRenderer
              semiMajorAxis={5.8}
              eccentricity={0.436}
              colorHex="#f43f5e"
              opacity={0.55}
              showApsidesMarkers={false}
            />
          </group>
        </group>
      )}

      {/* Center Stage: Selected Dwarf Planet Close-Up Apparatus */}
      {selectedDwarf === "Pluto" && (
        <group
          ref={binaryRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("pluto_charon_binary");
          }}
        >
          {/* External Barycenter Crosshair */}
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#fde047" />
          </mesh>
          {/* Pluto with Nitrogen-Ice Sputnik Planitia Basin */}
          <ScientificPlanetMaterial
            objectId="pluto_charon_binary"
            sceneId={sceneId}
            presetId="europa"
            position={[-0.45, 0, 0]}
            radius={1.15}
            starPosition={[-12, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={activeHighlightedObjects.includes("pluto_charon_binary") || true}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {/* Charon Companion Orbiting External Barycenter */}
          <ScientificPlanetMaterial
            objectId="charon_companion"
            sceneId={sceneId}
            presetId="moon"
            position={[2.15, 0, 0]}
            radius={0.58}
            starPosition={[-12, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={false}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
        </group>
      )}

      {selectedDwarf === "Haumea" && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("haumea_ellipsoid");
          }}
        >
          {/* Triaxial Jacobi Ellipsoid (2,100 × 1,680 × 1,070 km) */}
          <mesh ref={haumeaSpinRef} scale={[1.65, 0.85, 1.25]}>
            <sphereGeometry args={[1.0, 36, 36]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.45} metalness={0.1} />
          </mesh>
          {/* Haumea's Discovered Ring System */}
          <mesh rotation={[Math.PI / 2, 0.15, 0]}>
            <ringGeometry args={[2.25, 2.45, 64]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {(selectedDwarf === "Eris" || selectedDwarf === "Ceres" || selectedDwarf === "Makemake") && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject(selectedDwarf === "Eris" ? "eris_dwarf_planet" : "ceres_occator");
          }}
        >
          <ScientificPlanetMaterial
            objectId={selectedDwarf === "Eris" ? "eris_dwarf_planet" : "ceres_occator"}
            sceneId={sceneId}
            presetId={selectedDwarf === "Ceres" ? "moon" : "europa"}
            position={[0, 0, 0]}
            radius={1.25}
            starPosition={[-12, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={true}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {/* Ceres Occator Crater Bright Sodium-Carbonate Salt Deposits */}
          {selectedDwarf === "Ceres" && (
            <mesh position={[0.35, 0.2, 1.21]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 06.6 — ASTEROIDS, COMETS & METEOROIDS (ANTI-SUNWARD DUAL TAILS & DART)
// ============================================================================
function AsteroidCometScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-06");
  const rAu = Number(controls.cometHeliocentricDistAu ?? 1.1);
  const smallBodyMode = String(controls.smallBodyMode ?? "comet_dual_tails");

  // Tail length scales inversely with heliocentric distance rAu
  const tailScale = Math.min(2.2, Math.max(0.45, 1.5 / rAu));

  const tailVectors = useMemo<VectorArrowDescriptor[]>(
    () => [
      // Solar Wind / Anti-Sunward Ion Tail Direction (+X away from Sun at -X)
      {
        origin: [0, 0, 0],
        direction: [1, 0, 0],
        length: 3.4 * tailScale,
        colorHex: "#38bdf8",
      },
      // Curved Dust Tail Direction (Anti-Sunward + Lagging Orbital Tangent)
      {
        origin: [0, 0, 0],
        direction: [1, 0, 0.48],
        length: 2.8 * tailScale,
        colorHex: "#fde047",
      },
      // Comet Orbital Velocity Vector (Moving toward +Z/-X, proving tail does NOT trail behind motion)
      {
        origin: [0, 0, 0],
        direction: [-0.4, 0, -1],
        length: 1.8,
        colorHex: "#10b981",
      },
    ],
    [tailScale],
  );

  return (
    <group>
      {/* Distant Sun at -X Driving Solar Wind & Radiation Pressure */}
      <ScientificStarMaterial
        objectId="sun_comet_driver"
        position={[-11.5, 0, 0]}
        radius={1.25}
        temperatureK={5772}
        coronaScale={1.5}
        isSimulationRunning={isSimulationRunning}
        simulationTimeScale={simulationTimeScale}
        onSelectObject={onSelectObject}
      />

      {smallBodyMode === "comet_dual_tails" && (
        <group>
          {/* Comet Icy Nucleus & Sublimating Greenish Cyanogen/C₂ Coma */}
          <group
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("active_comet_nucleus");
            }}
          >
            <mesh scale={[1.35, 0.85, 0.95]}>
              <dodecahedronGeometry args={[0.45, 2]} />
              <meshStandardMaterial color="#475569" roughness={0.85} metalness={0.1} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.92 * tailScale, 28, 28]} />
              <meshBasicMaterial color="#22d3ee" transparent opacity={0.28} depthWrite={false} />
            </mesh>
          </group>

          {/* Straight Blue Ionized CO⁺ Plasma Tail Pointing Strictly Anti-Sunward (+X) */}
          <mesh
            position={[2.6 * tailScale, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("comet_ion_tail");
            }}
          >
            <coneGeometry args={[0.48 * tailScale, 5.2 * tailScale, 24, 1, true]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.48}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Curved Yellowish-White Silicate Dust Tail */}
          <mesh
            position={[2.2 * tailScale, 0, 0.95 * tailScale]}
            rotation={[0.38, 0, Math.PI / 2]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("comet_dust_tail");
            }}
          >
            <coneGeometry args={[0.82 * tailScale, 4.6 * tailScale, 24, 1, true]} />
            <meshBasicMaterial
              color="#fef08a"
              transparent
              opacity={0.36}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          <ScientificFieldRenderer vectors={tailVectors} fieldLines={[]} equipotentialRings={[]} />
        </group>
      )}

      {smallBodyMode === "asteroid_dart_impact" && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("asteroid_psyche_dart");
          }}
        >
          {/* Primary Asteroid 16 Psyche / Didymos */}
          <mesh position={[-1.4, 0, 0]} scale={[1.35, 1.05, 1.15]}>
            <dodecahedronGeometry args={[1.15, 2]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.45} metalness={0.72} />
          </mesh>
          {/* Moonlet Dimorphos + NASA DART Kinetic Ejecta Cone */}
          <group position={[2.2, 0, 0]}>
            <mesh scale={[1.2, 0.9, 1.0]}>
              <dodecahedronGeometry args={[0.52, 2]} />
              <meshStandardMaterial color="#78716c" roughness={0.8} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.65, 2.2, 24, 1, true]} />
              <meshBasicMaterial
                color="#f59e0b"
                transparent
                opacity={0.55}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      )}

      {smallBodyMode === "meteoroid_entry" && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("meteor_entry_streak");
          }}
        >
          <ScientificPlanetMaterial
            objectId="earth_meteor_limb"
            sceneId={sceneId}
            presetId="earth"
            position={[0, -2.2, 0]}
            radius={2.1}
            starPosition={[-12, 4, 8]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={activeHighlightedObjects.includes("meteor_entry_streak")}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {/* Luminous Ram-Pressure Atmospheric Entry Meteor Trail */}
          <mesh position={[0.4, 0.65, 0.8]} rotation={[0, 0, -0.95]}>
            <coneGeometry args={[0.18, 2.8, 16]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 06.7 — PLANETARY MOONS AND RINGS (LAPLACE RESONANCE, TITAN, ROCHE)
// ============================================================================
function MoonRingSystemsScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  reducedMotion,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-07");
  const moonSystem = String(controls.selectedMoonSystem ?? "jovian_laplace_resonance");
  const showOceanCutaway = Boolean(controls.showSubsurfaceOceanCutaway ?? true);

  const phaseRef = useRef(0);
  const [ganymedeAngle, setGanymedeAngle] = useState(0);

  useFrame((_, delta) => {
    if (!isSimulationRunning || reducedMotion) return;
    phaseRef.current =
      (phaseRef.current + Math.min(delta, 0.1) * simulationTimeScale * 0.35) % (Math.PI * 2);
    setGanymedeAngle(phaseRef.current);
  });

  // Exact 4 : 2 : 1 Laplace Mean-Motion Resonance
  const ioAngle = ganymedeAngle * 4;
  const europaAngle = ganymedeAngle * 2;

  return (
    <group>
      {moonSystem === "jovian_laplace_resonance" && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("laplace_resonance_system");
          }}
        >
          {/* Central Jupiter */}
          <ScientificPlanetMaterial
            objectId="jupiter_resonance_hub"
            sceneId={sceneId}
            presetId="jupiter"
            position={[0, 0, 0]}
            radius={1.45}
            starPosition={[14, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={false}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />

          {/* Io (4x Orbital Frequency — Tidal Silicate Volcanism) */}
          <OrbitalTrajectoryRenderer
            semiMajorAxis={2.6}
            eccentricity={0.0041}
            colorHex="#f59e0b"
            opacity={0.55}
            showApsidesMarkers={false}
          />
          <mesh position={[Math.cos(ioAngle) * 2.6, 0, Math.sin(ioAngle) * 2.6]}>
            <sphereGeometry args={[0.26, 24, 24]} />
            <meshStandardMaterial color="#facc15" emissive="#ea580c" emissiveIntensity={0.45} />
          </mesh>

          {/* Europa (2x Orbital Frequency — Ice Shell + Model Subsurface Saltwater Ocean) */}
          <OrbitalTrajectoryRenderer
            semiMajorAxis={3.8}
            eccentricity={0.009}
            colorHex="#38bdf8"
            opacity={0.6}
            showApsidesMarkers={false}
          />
          <group
            position={[Math.cos(europaAngle) * 3.8, 0, Math.sin(europaAngle) * 3.8]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("europa_ocean_cutaway");
            }}
          >
            <ScientificPlanetMaterial
              objectId="europa_ocean_cutaway"
              sceneId={sceneId}
              presetId="europa"
              position={[0, 0, 0]}
              radius={0.32}
              starPosition={[14, 4, 10]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={simulationTimeScale}
              highlighted={activeHighlightedObjects.includes("europa_ocean_cutaway") || true}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
            {showOceanCutaway && (
              <mesh position={[0, 0, 0.14]}>
                <ringGeometry args={[0.16, 0.28, 32]} />
                <meshBasicMaterial
                  color="#0284c7"
                  transparent
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>

          {/* Ganymede (1x Orbital Frequency — Largest Moon in Solar System, Intrinsic Magnetosphere) */}
          <OrbitalTrajectoryRenderer
            semiMajorAxis={5.2}
            eccentricity={0.0013}
            colorHex="#a855f7"
            opacity={0.5}
            showApsidesMarkers={false}
          />
          <ScientificPlanetMaterial
            objectId="ganymede_moon"
            sceneId={sceneId}
            presetId="moon"
            position={[Math.cos(ganymedeAngle) * 5.2, 0, Math.sin(ganymedeAngle) * 5.2]}
            radius={0.4}
            starPosition={[14, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={false}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
        </group>
      )}

      {moonSystem === "saturn_titan_enceladus" && (
        <group>
          {/* Left: Titan (1.45-bar Orange N₂/CH₄ Photochemical Haze + Hydrocarbon Lakes) */}
          <group position={[-2.2, 0, 0]}>
            <ScientificPlanetMaterial
              objectId="titan_atmosphere_globe"
              sceneId={sceneId}
              presetId="venus"
              position={[0, 0, 0]}
              radius={1.35}
              starPosition={[12, 4, 10]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={simulationTimeScale}
              highlighted={activeHighlightedObjects.includes("titan_atmosphere_globe") || true}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
            <mesh>
              <sphereGeometry args={[1.48, 32, 32]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.28} depthWrite={false} />
            </mesh>
          </group>

          {/* Right: Enceladus Venting South-Polar Cryovolcanic Water-Ice Plumes into E-Ring */}
          <group
            position={[2.4, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelectObject("enceladus_e_ring_plumes");
            }}
          >
            <ScientificPlanetMaterial
              objectId="enceladus_e_ring_plumes"
              sceneId={sceneId}
              presetId="europa"
              position={[0, 0, 0]}
              radius={0.95}
              starPosition={[12, 4, 10]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={simulationTimeScale}
              highlighted={activeHighlightedObjects.includes("enceladus_e_ring_plumes") || true}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
            {/* South-Polar Tiger-Stripe Water-Ice Geyser Plume Cone */}
            <mesh position={[0, -1.55, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.52, 1.5, 24, 1, true]} />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.62}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        </group>
      )}

      {moonSystem === "neptune_triton_roche" && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject("roche_limit_ring");
          }}
        >
          <ScientificPlanetMaterial
            objectId="neptune_roche_hub"
            sceneId={sceneId}
            presetId="neptune"
            position={[0, 0, 0]}
            radius={1.55}
            starPosition={[12, 4, 10]}
            qualityTier={qualityProfile.tier}
            isSimulationRunning={isSimulationRunning}
            simulationTimeScale={simulationTimeScale}
            highlighted={false}
            narrativeProgress={normalizedProgress}
            onSelectObject={onSelectObject}
          />
          {/* Roche Limit Boundary Ring (d_Roche ≈ 2.44 R_p) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.55 * 2.44, 0.035, 16, 96]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
          {/* Retrograde Inclined Triton Orbit (i = 156.9°) */}
          <group rotation={[0, 0, (23.1 * Math.PI) / 180]}>
            <OrbitalTrajectoryRenderer
              semiMajorAxis={4.8}
              eccentricity={0.000016}
              colorHex="#38bdf8"
              opacity={0.65}
              showApsidesMarkers={false}
            />
            <ScientificPlanetMaterial
              objectId="triton_retrograde_moon"
              sceneId={sceneId}
              presetId="europa"
              position={[Math.cos(-ganymedeAngle * 2) * 4.8, 0, Math.sin(-ganymedeAngle * 2) * 4.8]}
              radius={0.44}
              starPosition={[12, 4, 10]}
              qualityTier={qualityProfile.tier}
              isSimulationRunning={isSimulationRunning}
              simulationTimeScale={simulationTimeScale}
              highlighted={true}
              narrativeProgress={normalizedProgress}
              onSelectObject={onSelectObject}
            />
          </group>
        </group>
      )}
    </group>
  );
}

// ============================================================================
// CHAPTER 06.8 — COMPARING PLANETARY ENVIRONMENTS (SIDE-BY-SIDE LAB)
// ============================================================================
function PlanetaryComparisonScene({
  sceneId,
  qualityProfile,
  isSimulationRunning,
  simulationTimeScale,
  normalizedProgress,
  activeHighlightedObjects,
  onSelectObject,
}: Module06ChapterSceneProps) {
  const controls = useChapterControls("sub-08");
  const planetA = String(controls.comparisonPlanetA ?? "Earth");
  const planetB = String(controls.comparisonPlanetB ?? "Saturn");
  const scaleMode = String(controls.comparisonScaleMode ?? "true_relative_radius");

  const planetPresets: Record<
    string,
    {
      preset: "earth" | "venus" | "mars" | "jupiter" | "saturn" | "neptune" | "moon";
      trueRadius: number;
      normRadius: number;
      gravityRatio: number;
      density: number;
    }
  > = {
    Mercury: {
      preset: "moon",
      trueRadius: 0.42,
      normRadius: 1.35,
      gravityRatio: 0.38,
      density: 5.43,
    },
    Venus: {
      preset: "venus",
      trueRadius: 0.85,
      normRadius: 1.45,
      gravityRatio: 0.9,
      density: 5.24,
    },
    Earth: { preset: "earth", trueRadius: 0.9, normRadius: 1.5, gravityRatio: 1.0, density: 5.51 },
    Mars: { preset: "mars", trueRadius: 0.52, normRadius: 1.35, gravityRatio: 0.38, density: 3.93 },
    Jupiter: {
      preset: "jupiter",
      trueRadius: 2.35,
      normRadius: 1.65,
      gravityRatio: 2.53,
      density: 1.33,
    },
    Saturn: {
      preset: "saturn",
      trueRadius: 1.98,
      normRadius: 1.6,
      gravityRatio: 1.06,
      density: 0.69,
    },
    Uranus: {
      preset: "neptune",
      trueRadius: 1.42,
      normRadius: 1.5,
      gravityRatio: 0.89,
      density: 1.27,
    },
    Neptune: {
      preset: "neptune",
      trueRadius: 1.38,
      normRadius: 1.5,
      gravityRatio: 1.14,
      density: 1.64,
    },
  };

  const specA = planetPresets[planetA] || planetPresets.Earth;
  const specB = planetPresets[planetB] || planetPresets.Saturn;

  const rA = scaleMode === "true_relative_radius" ? specA.trueRadius : specA.normRadius;
  const rB = scaleMode === "true_relative_radius" ? specB.trueRadius : specB.normRadius;

  // Downward surface/1-bar gravity comparison vectors (g = GM/R²)
  const gravityVectors = useMemo<VectorArrowDescriptor[]>(
    () => [
      {
        origin: [-2.8, rA + 1.4, 0],
        direction: [0, -1, 0],
        length: Math.min(2.2, Math.max(0.55, specA.gravityRatio * 1.0)),
        colorHex: "#38bdf8",
      },
      {
        origin: [2.8, rB + 1.4, 0],
        direction: [0, -1, 0],
        length: Math.min(2.2, Math.max(0.55, specB.gravityRatio * 1.0)),
        colorHex: "#10b981",
      },
    ],
    [rA, rB, specA.gravityRatio, specB.gravityRatio],
  );

  return (
    <group>
      {/* Left Comparison World (A) */}
      <group position={[-2.8, 0, 0]}>
        <ScientificPlanetMaterial
          objectId="comparison_planet_left"
          sceneId={sceneId}
          presetId={specA.preset}
          position={[0, 0, 0]}
          radius={rA}
          starPosition={[-10, 5, 12]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("comparison_planet_left") || true}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* Right Comparison World (B) */}
      <group position={[2.8, 0, 0]}>
        <ScientificPlanetMaterial
          objectId="comparison_planet_right"
          sceneId={sceneId}
          presetId={specB.preset}
          position={[0, 0, 0]}
          radius={rB}
          starPosition={[-10, 5, 12]}
          qualityTier={qualityProfile.tier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          highlighted={activeHighlightedObjects.includes("comparison_planet_right") || true}
          narrativeProgress={normalizedProgress}
          onSelectObject={onSelectObject}
        />
      </group>

      {/* 1.00 g/cm³ Liquid Water Density Reference Plane (Shows Saturn ρ = 0.687 g/cm³ Floating) */}
      <mesh
        position={[0, -2.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject("density_water_benchmark");
        }}
      >
        <planeGeometry args={[10.5, 4.2]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Gravity Comparison Vectors */}
      <ScientificFieldRenderer vectors={gravityVectors} fieldLines={[]} equipotentialRings={[]} />
    </group>
  );
}

// ============================================================================
// MODULE 06 DIRECTOR ROUTER
// ============================================================================
export function Module06CinematicDirectorScene(props: Module06ChapterSceneProps) {
  const effectiveLessonId = props.lessonId || props.activeCue?.sublessonId || "sub-01";
  const beatInfo = useMemo(() => {
    const segId = props.activeCue?.narrationSegmentId || "";
    return (
      CosmosProofOfConceptCatalog.getBeatForNarrationSegment("06", effectiveLessonId, segId) || {
        chapter: CosmosProofOfConceptCatalog.getChapterManifest("06", effectiveLessonId),
        beat: null,
      }
    );
  }, [effectiveLessonId, props.activeCue?.narrationSegmentId]);

  const componentId: ProofOfConceptSceneComponentId =
    props.activeCue?.sceneComponentId ||
    beatInfo.chapter?.sceneComponentId ||
    "m06_ch1_solar_system_formation";

  switch (componentId) {
    case "m06_ch1_solar_system_formation":
      return <SolarSystemFormationScene {...props} />;
    case "m06_ch2_terrestrial_planets":
      return <TerrestrialPlanetsScene {...props} />;
    case "m06_ch3_gas_giants":
      return <GasGiantsScene {...props} />;
    case "m06_ch4_ice_giants":
      return <IceGiantsScene {...props} />;
    case "m06_ch5_dwarf_planets":
      return <DwarfPlanetsScene {...props} />;
    case "m06_ch6_asteroids_comets":
      return <AsteroidCometScene {...props} />;
    case "m06_ch7_moons_and_rings":
      return <MoonRingSystemsScene {...props} />;
    case "m06_ch8_planetary_comparison":
      return <PlanetaryComparisonScene {...props} />;
    default:
      return <SolarSystemFormationScene {...props} />;
  }
}
