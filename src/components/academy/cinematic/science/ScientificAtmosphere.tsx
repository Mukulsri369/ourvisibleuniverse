// @ts-nocheck
/**
 * COSMOS Scientific Planetary Atmosphere Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 9 (Advanced Atmospheric Scattering)
 *
 * Implements physically motivated Rayleigh (lambda^-4) and forward-peaked Mie
 * atmospheric limb scattering parameterized by:
 * - Planet radius & atmosphere height / scale height ratio
 * - Sun direction vector (day-side blue limb, sunset orange terminator, dark night limb)
 * - Optical depth & highlight intensity
 * - Multi-tier quality adaptation (GLSL shader in HIGH_CINEMATIC/BALANCED; lightweight
 *   backface shell in LOW_POWER)
 */

import React, { useMemo } from "react";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
} from "@/lib/cosmos/cinematic/rendering";

export interface ScientificAtmosphereProps {
  objectId: string;
  planetRadius: number;
  atmosphereRadiusRatio?: number;
  scaleHeightKm?: number;
  opticalDepth?: number;
  rayleighColorHex?: string;
  mieColorHex?: string;
  sunDirection?: [number, number, number];
  qualityTier: CinematicQualityTier;
  sphereSegments?: number;
  highlightStrength?: number;
  isSpeculativeExoplanet?: boolean;
  onSelect?: () => void;
}

export function ScientificAtmosphere({
  objectId,
  planetRadius,
  atmosphereRadiusRatio = 1.045,
  scaleHeightKm = 8.5,
  opticalDepth = 1.15,
  rayleighColorHex = "#38bdf8",
  mieColorHex = "#fb923c",
  sunDirection = [1, 0.25, 0.65],
  qualityTier,
  sphereSegments = 32,
  highlightStrength = 0,
  onSelect,
}: ScientificAtmosphereProps) {
  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );

  const atmRadius = planetRadius * Math.max(1.01, atmosphereRadiusRatio);
  const segs = Math.max(16, Math.floor(sphereSegments * 0.75));

  const shaderMaterial = useMemo(() => {
    if (!adapted.enableAtmosphericScatteringShader) return null;
    const sunVec = new THREE.Vector3(...sunDirection).normalize();
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "atmospheric_scattering_shader",
      `atm_${objectId}_${qualityTier}`,
      {
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniformOverrides: {
          uSunDirection: sunVec,
          uRayleighColor: new THREE.Color(rayleighColorHex),
          uMieColor: new THREE.Color(mieColorHex),
          uOpticalDepth: opticalDepth,
          uScaleHeightRatio: Math.min(0.1, Math.max(0.005, scaleHeightKm / 6371)),
          uHighlightStrength: highlightStrength,
        },
      },
    );
  }, [
    adapted.enableAtmosphericScatteringShader,
    objectId,
    qualityTier,
    sunDirection,
    rayleighColorHex,
    mieColorHex,
    opticalDepth,
    scaleHeightKm,
    highlightStrength,
  ]);

  if (shaderMaterial) {
    shaderMaterial.uniforms.uSunDirection.value.set(...sunDirection).normalize();
    shaderMaterial.uniforms.uOpticalDepth.value = opticalDepth;
    shaderMaterial.uniforms.uHighlightStrength.value = highlightStrength;
  }

  return (
    <mesh
      onClick={
        onSelect
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
    >
      <sphereGeometry args={[atmRadius, segs, segs]} />
      {shaderMaterial ? (
        <primitive object={shaderMaterial} attach="material" />
      ) : (
        <meshBasicMaterial
          color={rayleighColorHex}
          transparent
          opacity={Math.min(0.32, opticalDepth * 0.18 + highlightStrength * 0.15)}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      )}
    </mesh>
  );
}
