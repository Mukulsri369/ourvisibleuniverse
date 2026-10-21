// @ts-nocheck
/**
 * COSMOS Relativistic Black Hole & Accretion System Visualization
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 14 (Black Hole Scientific Visualization)
 *
 * Implements:
 * - Schwarzschild (a* = 0: r_s = 2GM/c^2, r_ph = 1.5 r_s, r_ISCO = 3.0 r_s) and
 *   prograde Kerr (a* > 0: smaller prograde ISCO & ergosphere) geometric distinctions
 * - Relativistic Shakura-Sunyaev accretion disk shader with special-relativistic
 *   Doppler beaming (approaching wing brightened/blueshifted, receding wing dimmed/redshifted)
 *   and gravitational redshift sqrt(1 - r_s/r)
 * - Gravitationally lensed secondary image halo (analytic deflection approximation,
 *   explicitly disclosed as an educational relativistic model)
 * - Blandford-Znajek collimated polar plasma jets
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  CosmosScientificSceneLibrary,
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
} from "@/lib/cosmos/cinematic/rendering";

export interface ScientificBlackHoleEffectsProps {
  objectId?: string;
  sceneId: string;
  schwarzschildRadius?: number;
  spinParameterAStar?: number; // 0.0 = Schwarzschild, (0..0.998] = Kerr
  dopplerBeamingStrength?: number;
  showJets?: boolean;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  highlightedObjectIds?: string[];
  onSelectObject?: (objectId: string) => void;
}

/**
 * Computes the dimensionless ISCO radius (in units of r_s = 2GM/c^2)
 * using the exact Bardeen-Press-Teukolsky (1972) prograde Kerr formula.
 * For a* = 0 (Schwarzschild), r_ISCO / r_s = 3.0 (i.e. 6 GM/c^2).
 */
export function computeKerrProgradeIscoRatioToRs(aStar: number): number {
  const a = Math.min(0.998, Math.max(0.0, aStar));
  if (a < 1e-4) return 3.0;
  const z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const z2 = Math.sqrt(3 * a * a + z1 * z1);
  const rIscoInM = 3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2));
  // Convert from GM/c^2 units to r_s = 2GM/c^2 units
  return rIscoInM * 0.5;
}

export function ScientificBlackHoleEffects({
  objectId = "event_horizon",
  sceneId,
  schwarzschildRadius = 1.35,
  spinParameterAStar = 0.0,
  dopplerBeamingStrength = 0.88,
  showJets = true,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  highlightedObjectIds = [],
  onSelectObject,
}: ScientificBlackHoleEffectsProps) {
  const simTimeRef = useRef(0);
  const lensedHaloRef = useRef<THREE.Mesh>(null);

  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );

  const rS = Math.max(0.4, schwarzschildRadius);
  const rPhotonSphere = rS * 1.5;
  const iscoRatio = computeKerrProgradeIscoRatioToRs(spinParameterAStar);
  // Display scale maps r_ISCO to visible inner disk edge outside photon sphere
  const innerDiskRadius = Math.max(rPhotonSphere * 1.04, rS * Math.min(2.2, iscoRatio * 0.68));
  const outerDiskRadius = rS * 4.1;

  const accretionMaterial = useMemo(() => {
    if (!adapted.enableCustomFragmentShaders) return null;
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "black_hole_accretion_shader",
      `bh_disk_${sceneId}_${objectId}_${qualityTier}`,
      {
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniformOverrides: {
          uInnerHotColor: new THREE.Color("#e0f2fe"),
          uMidDiskColor: new THREE.Color("#fb923c"),
          uOuterCoolColor: new THREE.Color("#991b1b"),
          uInnerRadius: innerDiskRadius,
          uOuterRadius: outerDiskRadius,
          uDopplerStrength: dopplerBeamingStrength,
          uSpinAStar: spinParameterAStar,
        },
      },
    );
  }, [
    adapted.enableCustomFragmentShaders,
    sceneId,
    objectId,
    qualityTier,
    innerDiskRadius,
    outerDiskRadius,
    dopplerBeamingStrength,
    spinParameterAStar,
  ]);

  useEffect(() => {
    const lib = CosmosScientificSceneLibrary.getInstance();
    const isKerr = spinParameterAStar > 0.01;
    const ctrl = lib.registerObject(
      {
        objectId,
        sceneId,
        name: isKerr ? "Rotating Kerr Black Hole" : "Schwarzschild Black Hole",
        scientificObjectType: isKerr ? "black_hole_kerr" : "black_hole_schwarzschild",
        scaleRegime: "stellar_scale",
        scientificRepresentation: "PHYSICS_BASED_SIMULATION",
        epistemicDisclosure:
          "Analytic relativistic accretion disk model with special-relativistic Doppler beaming, gravitational redshift, and secondary Einstein lensing ring approximation (not full numerical geodesic ray-tracing).",
        physicalParameters: {
          schwarzschildRadiusKm: 29.5,
          dimensionlessSpinAStar: spinParameterAStar,
        },
        displayScale: rS,
        renderingQuality: qualityTier,
        supportedAnimations: [
          "keplerian_accretion_shear",
          "doppler_beaming",
          "polar_jet_collimation",
        ],
        supportedHighlights: ["photon_sphere", "accretion_disk", "event_horizon"],
        supportedCameraTargets: [
          "event_horizon",
          "photon_sphere",
          "accretion_disk",
          "relativistic_jets",
        ],
        scientificSources: [
          "Event Horizon Telescope Collaboration (2019, 2022)",
          "Shakura & Sunyaev (1973)",
          "Bardeen, Press & Teukolsky (1972)",
        ],
        shaderState: {
          narrativeProgress: 0,
          simulationTime: 0,
          stellarTemperatureK: 15000,
          atmosphericOpticalDepth: 1.0,
          highlightStrength: 0,
          emissionIntensity: 1.2,
          densityScale: 1.0,
          cutawayRevealAngleRad: 0,
          dopplerBeamingStrength,
          lensingDeflectionStrength: 1.0,
          visualizationMode: "photometric",
        },
        resourceLifecycle: {
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          disposed: false,
          geometryCount: 5,
          materialCount: 3,
          textureCount: 0,
        },
      },
      [0, 0, 0],
      rS,
    );

    return () => {
      ctrl.disposeResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, sceneId, spinParameterAStar, rS]);

  useFrame((_, delta) => {
    if (isSimulationRunning) {
      const dt = Math.min(delta, 0.1) * simulationTimeScale;
      simTimeRef.current += dt;
      if (lensedHaloRef.current) {
        lensedHaloRef.current.rotation.z += dt * 0.25;
      }
    }
    if (accretionMaterial) {
      accretionMaterial.uniforms.uSimulationTime.value = simTimeRef.current;
      accretionMaterial.uniforms.uDopplerStrength.value = dopplerBeamingStrength;
    }
  });

  const segs = adapted.accretionDiskSegments;
  const photonHighlighted = highlightedObjectIds.includes("photon_sphere");

  return (
    <group>
      {/* 1. Event Horizon Shadow Sphere (r_s = 2GM/c^2) */}
      <mesh
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject?.("event_horizon");
        }}
      >
        <sphereGeometry
          args={[rS, adapted.profile.sphereSegments, adapted.profile.sphereSegments]}
        />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Unstable Circular Photon Sphere Ring (r_ph = 1.5 r_s) */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject?.("photon_sphere");
        }}
      >
        <torusGeometry args={[rPhotonSphere, 0.042, 20, segs]} />
        <meshBasicMaterial
          color={photonHighlighted ? "#38bdf8" : "#e0f2fe"}
          transparent
          opacity={photonHighlighted ? 0.96 : 0.82}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Relativistic Equatorial Accretion Disk (with Doppler Beaming Shader) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelectObject?.("accretion_disk");
        }}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[innerDiskRadius, outerDiskRadius, segs, 6]} />
          {accretionMaterial ? (
            <primitive object={accretionMaterial} attach="material" />
          ) : (
            <meshBasicMaterial
              color="#fb923c"
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          )}
        </mesh>
      </group>

      {/* 4. Gravitationally Lensed Far-Side Disk Halo (Bent over North & South of Shadow) */}
      <mesh ref={lensedHaloRef} rotation={[0.14, 0, 0]}>
        <ringGeometry args={[rPhotonSphere * 1.02, innerDiskRadius * 1.48, segs, 4]} />
        {accretionMaterial ? (
          <primitive object={accretionMaterial} attach="material" />
        ) : (
          <meshBasicMaterial
            color="#f97316"
            side={THREE.DoubleSide}
            transparent
            opacity={0.48}
            blending={THREE.AdditiveBlending}
          />
        )}
      </mesh>

      {/* 5. Blandford-Znajek Relativistic Collimated Polar Jets */}
      {showJets && (
        <group
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject?.("relativistic_jets");
          }}
        >
          <mesh position={[0, rS * 2.65, 0]}>
            <cylinderGeometry args={[0.42, 0.07, rS * 3.5, 24, 1, true]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, -rS * 2.65, 0]}>
            <cylinderGeometry args={[0.07, 0.42, rS * 3.5, 24, 1, true]} />
            <meshBasicMaterial
              color="#60a5fa"
              transparent
              opacity={0.38}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
