// @ts-nocheck
/**
 * COSMOS Globular & Open Star Cluster Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 13 (Galaxy and Star Cluster Rendering)
 *
 * Renders King-profile globular clusters and open clusters using a single
 * deterministic THREE.Points buffer from ScientificParticleManager.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { ScientificParticleManager } from "@/lib/cosmos/cinematic/rendering";

export interface StarClusterRendererProps {
  objectId: string;
  clusterType?: "globular" | "open";
  position?: [number, number, number];
  radius?: number;
  seed?: number;
  opacity?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  onSelectObject?: (objectId: string) => void;
}

export function StarClusterRenderer({
  objectId,
  clusterType = "globular",
  position = [0, 0, 0],
  radius = 3.2,
  seed = 4096,
  opacity = 0.88,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  onSelectObject,
}: StarClusterRendererProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const buffers = useMemo(
    () =>
      ScientificParticleManager.getInstance().getOrCreateStarClusterBuffers({
        clusterType,
        radius,
        seed,
        tier: qualityTier,
      }),
    [clusterType, radius, seed, qualityTier],
  );

  useFrame((_, delta) => {
    if (!isSimulationRunning || !pointsRef.current) return;
    pointsRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 0.04;
  });

  return (
    <points
      ref={pointsRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      <bufferGeometry key={buffers.bufferKey}>
        <bufferAttribute attach="attributes-position" args={[buffers.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[buffers.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
