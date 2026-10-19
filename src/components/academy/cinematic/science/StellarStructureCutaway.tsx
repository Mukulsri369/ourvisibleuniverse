/**
 * COSMOS Stellar Interior Cross-Section Cutaway Component
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 11 (Stellar Internal Structures)
 *
 * Renders an educational 3D octant cutaway revealing:
 * - Thermonuclear Core (r < 0.25 R_*, T ~ 1.56 x 10^7 K, p-p chain / CNO cycle)
 * - Radiative Zone (0.25 - 0.70 R_*, photon radiative diffusion)
 * - Convective Zone (0.70 - 1.00 R_*, buoyant plasma plumes)
 * - Photospheric exterior shell (3/4 sphere)
 *
 * Explicitly disclosed as a structured astrophysical diagram rather than direct imagery.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  ScientificMaterialFactory,
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
} from "@/lib/cosmos/cinematic/rendering";

export interface StellarStructureCutawayProps {
  objectId: string;
  sceneId: string;
  radius: number;
  temperatureK?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  onSelectObject?: (objectId: string) => void;
}

export function StellarStructureCutaway({
  objectId,
  sceneId,
  radius,
  temperatureK = 5772,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  onSelectObject,
}: StellarStructureCutawayProps) {
  const simTimeRef = useRef(0);
  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );
  const segs = Math.max(24, adapted.profile.sphereSegments);

  const stellarParams = useMemo(
    () => ScientificMaterialFactory.getInstance().resolveStellarParameters(temperatureK),
    [temperatureK],
  );

  const interiorMaterial = useMemo(() => {
    if (!adapted.enableCustomFragmentShaders) return null;
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "stellar_interior_cutaway_shader",
      `cutaway_${sceneId}_${objectId}_${qualityTier}`,
      {
        side: THREE.DoubleSide,
        uniformOverrides: {
          uOuterRadius: radius,
          uCoreColor: new THREE.Color("#e0f2fe"),
          uRadiativeColor: new THREE.Color("#f59e0b"),
          uConvectiveColor: new THREE.Color("#ea580c"),
        },
      },
    );
  }, [adapted.enableCustomFragmentShaders, sceneId, objectId, qualityTier, radius]);

  useFrame((_, delta) => {
    if (isSimulationRunning) {
      simTimeRef.current += Math.min(delta, 0.1) * simulationTimeScale;
    }
    if (interiorMaterial) {
      interiorMaterial.uniforms.uSimulationTime.value = simTimeRef.current;
    }
  });

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      {/* 270-degree Exterior Photosphere Shell (leaving a 90-degree front-upper wedge open) */}
      <mesh>
        <sphereGeometry args={[radius, segs, segs, Math.PI * 0.5, Math.PI * 1.5, 0, Math.PI]} />
        <meshStandardMaterial
          color={stellarParams.blackbodyHex}
          emissive={stellarParams.blackbodyHex}
          emissiveIntensity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Exposed Inner Thermonuclear Core Sphere (0.25 R_*) */}
      <mesh>
        <sphereGeometry args={[radius * 0.26, Math.max(16, segs / 2), Math.max(16, segs / 2)]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>

      {/* Meridional Cutaway Planes showing Core -> Radiative -> Convective radial gradient */}
      <mesh rotation={[0, 0, 0]}>
        <circleGeometry args={[radius * 0.995, segs, -Math.PI / 2, Math.PI]} />
        {interiorMaterial ? (
          <primitive object={interiorMaterial} attach="material" />
        ) : (
          <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
        )}
      </mesh>

      <mesh rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[radius * 0.995, segs, -Math.PI / 2, Math.PI]} />
        {interiorMaterial ? (
          <primitive object={interiorMaterial} attach="material" />
        ) : (
          <meshBasicMaterial color="#ea580c" side={THREE.DoubleSide} />
        )}
      </mesh>
    </group>
  );
}
