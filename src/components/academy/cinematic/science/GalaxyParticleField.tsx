// @ts-nocheck
/**
 * COSMOS Deterministic GPU Galaxy Particle Field Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 13 (Galaxy and Star Cluster Rendering)
 *
 * Uses a single THREE.Points draw call backed by deterministic, seed-based
 * typed arrays from ScientificParticleManager.
 * Supports Spiral, Barred Spiral, Elliptical, and Irregular morphologies.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import {
  ScientificParticleManager,
  type GalaxyMorphologyPreset,
} from "@/lib/cosmos/cinematic/rendering";

export interface GalaxyParticleFieldProps {
  objectId: string;
  morphology?: GalaxyMorphologyPreset;
  position?: [number, number, number];
  rotation?: [number, number, number];
  radius?: number;
  armCount?: number;
  seed?: number;
  opacity?: number;
  pointSize?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  onSelectObject?: (objectId: string) => void;
}

export function GalaxyParticleField({
  objectId,
  morphology = "barred_spiral",
  position = [0, 0, 0],
  rotation = [0.35, 0, 0],
  radius = 7.5,
  armCount = 2,
  seed = 1337,
  opacity = 0.85,
  pointSize = 0.065,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  onSelectObject,
}: GalaxyParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const buffers = useMemo(
    () =>
      ScientificParticleManager.getInstance().getOrCreateGalaxyBuffers({
        morphology,
        radius,
        armCount,
        seed,
        tier: qualityTier,
      }),
    [morphology, radius, armCount, seed, qualityTier],
  );

  useFrame((_, delta) => {
    if (!isSimulationRunning || !pointsRef.current) return;
    pointsRef.current.rotation.y += Math.min(delta, 0.1) * simulationTimeScale * 0.06;
  });

  return (
    <points
      ref={pointsRef}
      position={position}
      rotation={rotation}
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
        size={pointSize}
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
