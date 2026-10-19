/**
 * COSMOS Scientific Stellar Photosphere & Corona Component
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 10 (Advanced Stellar Rendering)
 *
 * Implements:
 * - Planckian Blackbody chromaticity across O, B, A, F, G, K, M, White Dwarf stars
 * - Eddington linear limb darkening I(mu)/I(0) = 1 - u*(1 - mu)
 * - Multi-scale convective granulation cells & magnetic sunspot umbrae
 * - Outer coronal emission shell & optional magnetic flux loop arches
 * - Cue-driven interior cutaway transition via StellarStructureCutaway
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  CosmosScientificSceneLibrary,
  ScientificMaterialFactory,
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
} from "@/lib/cosmos/cinematic/rendering";
import { StellarStructureCutaway } from "./StellarStructureCutaway";

export interface ScientificStarProps {
  objectId: string;
  sceneId?: string;
  name?: string;
  temperatureK?: number;
  position?: [number, number, number];
  radius?: number;
  qualityTier?: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  sunspotStrength?: number;
  coronaScale?: number;
  showCorona?: boolean;
  showCutaway?: boolean;
  highlighted?: boolean;
  narrativeProgress?: number;
  onSelectObject?: (objectId: string) => void;
}

export function ScientificStarMaterial({
  objectId,
  sceneId = "cosmos_star_scene",
  name = "Main-Sequence Star",
  temperatureK = 5772,
  position = [0, 0, 0],
  radius = 1.5,
  qualityTier = "HIGH_VISUAL",
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  sunspotStrength = 0.42,
  showCorona = true,
  showCutaway = false,
  highlighted = false,
  narrativeProgress = 0,
  onSelectObject,
}: ScientificStarProps) {
  const starMeshRef = useRef<THREE.Mesh>(null);
  const simTimeRef = useRef(0);

  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );

  const stellarParams = useMemo(
    () => ScientificMaterialFactory.getInstance().resolveStellarParameters(temperatureK),
    [temperatureK],
  );

  const shaderMaterial = useMemo(() => {
    if (!adapted.enableCustomFragmentShaders) return null;
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "stellar_photosphere_shader",
      `star_${sceneId}_${objectId}_${temperatureK}_${qualityTier}`,
      {
        uniformOverrides: {
          uBlackbodyColor: new THREE.Color(stellarParams.blackbodyHex),
          uCoronaColor: new THREE.Color(stellarParams.coronaHex),
          uTemperatureK: temperatureK,
          uLimbDarkeningU: stellarParams.limbDarkeningU,
          uGranulationScale: stellarParams.granulationScale,
          uSunspotStrength: sunspotStrength,
          uEmissionIntensity: 1.18,
          uHighlightStrength: highlighted ? 0.85 : 0.0,
        },
      },
    );
  }, [
    adapted.enableCustomFragmentShaders,
    sceneId,
    objectId,
    temperatureK,
    qualityTier,
    stellarParams,
    sunspotStrength,
    highlighted,
  ]);

  useEffect(() => {
    const lib = CosmosScientificSceneLibrary.getInstance();
    const ctrl = lib.registerObject(
      {
        objectId,
        sceneId,
        name,
        scientificObjectType:
          temperatureK >= 20000
            ? "star_blue_supergiant"
            : temperatureK <= 3800
              ? "star_red_giant"
              : "star_main_sequence",
        scaleRegime: "stellar_scale",
        scientificRepresentation: "PHYSICS_BASED_SIMULATION",
        epistemicDisclosure:
          "Planckian blackbody photosphere with Eddington limb darkening and procedural convective granulation.",
        physicalParameters: {
          effectiveTemperatureK: temperatureK,
          spectralClass: stellarParams.spectralClass as any,
        },
        displayScale: radius,
        renderingQuality: qualityTier,
        supportedAnimations: [
          "convective_granulation",
          "differential_rotation",
          "interior_cutaway",
        ],
        supportedHighlights: ["corona_emphasis", "core_cutaway"],
        supportedCameraTargets: [objectId],
        scientificSources: ["IAU 2015 Resolution B2 / NASA SDO"],
        shaderState: {
          narrativeProgress,
          simulationTime: 0,
          stellarTemperatureK: temperatureK,
          atmosphericOpticalDepth: 1.0,
          highlightStrength: highlighted ? 0.85 : 0,
          emissionIntensity: 1.18,
          densityScale: 1.0,
          cutawayRevealAngleRad: showCutaway ? Math.PI * 0.5 : 0,
          dopplerBeamingStrength: 0,
          lensingDeflectionStrength: 0,
          visualizationMode: showCutaway ? "cross_section" : "photometric",
        },
        resourceLifecycle: {
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          disposed: false,
          geometryCount: 1,
          materialCount: 1,
          textureCount: 0,
        },
      },
      position,
      radius,
    );

    return () => {
      ctrl.disposeResources();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, sceneId, temperatureK]);

  useFrame((_, delta) => {
    if (isSimulationRunning) {
      const dt = Math.min(delta, 0.1) * simulationTimeScale;
      simTimeRef.current += dt;
      if (starMeshRef.current && !showCutaway) {
        starMeshRef.current.rotation.y += dt * 0.22;
      }
    }

    if (shaderMaterial) {
      ScientificShaderRegistry.getInstance().updateDeterministicUniforms(shaderMaterial, {
        simulationTime: simTimeRef.current,
        narrativeProgress,
        stellarTemperatureK: temperatureK,
        highlightStrength: highlighted ? 0.85 : 0.0,
        emissionIntensity: 1.18,
      });
    }
  });

  const segs = adapted.profile.sphereSegments;

  return (
    <group position={position}>
      {showCutaway ? (
        <StellarStructureCutaway
          objectId={objectId}
          sceneId={sceneId}
          radius={radius}
          temperatureK={temperatureK}
          qualityTier={qualityTier}
          isSimulationRunning={isSimulationRunning}
          simulationTimeScale={simulationTimeScale}
          onSelectObject={onSelectObject}
        />
      ) : (
        <mesh
          ref={starMeshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelectObject?.(objectId);
          }}
        >
          <sphereGeometry args={[radius, segs, segs]} />
          {shaderMaterial ? (
            <primitive object={shaderMaterial} attach="material" />
          ) : (
            <meshStandardMaterial
              color={stellarParams.blackbodyHex}
              emissive={stellarParams.blackbodyHex}
              emissiveIntensity={1.15}
              roughness={0.25}
            />
          )}
        </mesh>
      )}

      {/* Solar / Stellar Outer Corona Shell */}
      {showCorona && qualityTier !== "LOW_POWER" && (
        <mesh>
          <sphereGeometry args={[radius * 1.14, Math.max(16, segs / 2), Math.max(16, segs / 2)]} />
          <meshBasicMaterial
            color={stellarParams.coronaHex}
            transparent
            opacity={highlighted ? 0.26 : 0.14}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
