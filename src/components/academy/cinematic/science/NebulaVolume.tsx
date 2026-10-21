// @ts-nocheck
/**
 * COSMOS Nebula & Interstellar Dust Volume Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 12 (Nebula and Interstellar Dust Renderer)
 *
 * Supports physically distinct astrophysical nebular categories:
 * - emission: Ionized H II region (Balmer H-alpha 656.3 nm rose + [O III] 500.7 nm teal)
 * - reflection: Interstellar dust scattering short-wavelength blue starlight
 * - dark: Cold molecular cloud / Bok globule (Beer-Lambert extinction obscuring background light)
 * - planetary_nebula / supernova_remnant: Radially expanding ionized shock shell
 *
 * Adapts volumetric layer count & shader complexity to CosmosCinematicQualityManager.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  ScientificRenderingQualityAdapter,
  ScientificShaderRegistry,
} from "@/lib/cosmos/cinematic/rendering";

export type NebulaCategoryType =
  "emission" | "reflection" | "dark" | "planetary_nebula" | "supernova_remnant";

export interface NebulaVolumeProps {
  objectId: string;
  sceneId: string;
  nebulaType: NebulaCategoryType;
  position?: [number, number, number];
  scale?: number;
  densityScale?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  onSelectObject?: (objectId: string) => void;
}

export function NebulaVolume({
  objectId,
  sceneId,
  nebulaType,
  position = [0, 0, 0],
  scale = 4.5,
  densityScale = 1.15,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  onSelectObject,
}: NebulaVolumeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const simTimeRef = useRef(0);

  const adapted = useMemo(
    () => ScientificRenderingQualityAdapter.resolveAdaptedParameters(qualityTier),
    [qualityTier],
  );

  const { primaryHex, secondaryHex, typeIndex, blending } = useMemo(() => {
    switch (nebulaType) {
      case "reflection":
        return {
          primaryHex: "#38bdf8",
          secondaryHex: "#60a5fa",
          typeIndex: 1,
          blending: THREE.AdditiveBlending,
        };
      case "dark":
        return {
          primaryHex: "#0f172a",
          secondaryHex: "#1e293b",
          typeIndex: 2,
          blending: THREE.NormalBlending, // Dark nebulae obscure background light
        };
      case "planetary_nebula":
      case "supernova_remnant":
        return {
          primaryHex: "#14b8a6",
          secondaryHex: "#f43f5e",
          typeIndex: 3,
          blending: THREE.AdditiveBlending,
        };
      case "emission":
      default:
        return {
          primaryHex: "#f43f5e",
          secondaryHex: "#14b8a6",
          typeIndex: 0,
          blending: THREE.AdditiveBlending,
        };
    }
  }, [nebulaType]);

  const shaderMaterial = useMemo(() => {
    if (!adapted.enableCustomFragmentShaders) return null;
    return ScientificShaderRegistry.getInstance().getOrCreateShaderMaterial(
      "nebula_volumetric_shader",
      `nebula_${sceneId}_${objectId}_${nebulaType}_${qualityTier}`,
      {
        transparent: true,
        side: THREE.DoubleSide,
        blending,
        depthWrite: false,
        uniformOverrides: {
          uPrimaryColor: new THREE.Color(primaryHex),
          uSecondaryColor: new THREE.Color(secondaryHex),
          uDensityScale: densityScale,
          uNebulaType: typeIndex,
          uRaymarchSteps: adapted.volumetricRaymarchSteps,
        },
      },
    );
  }, [
    adapted.enableCustomFragmentShaders,
    adapted.volumetricRaymarchSteps,
    sceneId,
    objectId,
    nebulaType,
    qualityTier,
    blending,
    primaryHex,
    secondaryHex,
    densityScale,
    typeIndex,
  ]);

  useFrame((_, delta) => {
    if (isSimulationRunning) {
      simTimeRef.current += Math.min(delta, 0.1) * simulationTimeScale;
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.03 * simulationTimeScale;
      }
    }
    if (shaderMaterial) {
      shaderMaterial.uniforms.uSimulationTime.value = simTimeRef.current;
      shaderMaterial.uniforms.uDensityScale.value = densityScale;
    }
  });

  const layerAngles = useMemo(() => {
    const count = adapted.nebulaLayerCount;
    const list: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const frac = i / Math.max(1, count);
      list.push([frac * Math.PI * 0.65, frac * Math.PI, (i % 2 === 0 ? 1 : -1) * 0.25]);
    }
    return list;
  }, [adapted.nebulaLayerCount]);

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      {layerAngles.map((rot, idx) => (
        <mesh key={idx} rotation={rot}>
          <planeGeometry args={[scale * (1.0 - idx * 0.06), scale * (1.0 - idx * 0.06)]} />
          {shaderMaterial ? (
            <primitive object={shaderMaterial} attach="material" />
          ) : (
            <meshBasicMaterial
              color={primaryHex}
              transparent
              opacity={nebulaType === "dark" ? 0.78 : 0.22}
              side={THREE.DoubleSide}
              blending={blending}
              depthWrite={false}
            />
          )}
        </mesh>
      ))}
    </group>
  );
}
