/**
 * COSMOS Scientific Telescope Optical Cutaway & Ray-Tracing Bench Component
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Section 21 (Scientific Telescope Models & Optical Cutaways)
 *
 * Renders interactive 3D optical telescope assemblies (Cassegrain / Ritchey-Chrétien
 * Reflector and Keplerian Refractor) with:
 * - Cutaway optical tube revealing primary parabolic mirror and secondary hyperbolic mirror
 * - Dynamic collimated-to-focal light ray paths showing primary reflection -> secondary
 *   reflection -> Cassegrain focal plane convergence
 * - Addressable nodes for COSMOS narration cues (primary_mirror, secondary_mirror,
 *   detector_focal_plane, optical_ray_path)
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { CosmosCinematicAssetManager } from "@/lib/cosmos/cinematic/assets";

export interface ScientificTelescopeCutawayProps {
  objectId: string;
  sceneId: string;
  position?: [number, number, number];
  scale?: number;
  qualityTier: CinematicQualityTier;
  showRayPaths?: boolean;
  highlightedNodeId?: string | null;
  isSimulationRunning?: boolean;
  onSelectObject?: (objectId: string) => void;
}

export function ScientificTelescopeCutaway({
  objectId,
  sceneId,
  position = [0, 0, 0],
  scale = 1.0,
  qualityTier,
  showRayPaths = true,
  highlightedNodeId = null,
  isSimulationRunning = true,
  onSelectObject,
}: ScientificTelescopeCutawayProps) {
  const rootRef = useRef<THREE.Group>(null);
  const assetManager = CosmosCinematicAssetManager.getInstance();

  const loadedEntry = useMemo(
    () =>
      assetManager.loadAsset("asset_instrument_cassegrain_reflector_v1", {
        qualityTier,
        holderId: sceneId,
      }),
    [assetManager, qualityTier, sceneId],
  );

  const clonedAssembly = useMemo(() => {
    if (!loadedEntry.loadedModel) return new THREE.Group();
    return loadedEntry.loadedModel.rootGroup.clone(true);
  }, [loadedEntry]);

  // Build collimated incoming -> primary mirror -> secondary mirror -> focal plane ray bundle
  const rayPositions = useMemo(() => {
    const rays: number[] = [];
    const offsets = [-0.46, -0.28, 0.28, 0.46];
    for (const yOff of offsets) {
      // 1. Incoming parallel starlight ray (x = +1.55 -> primary mirror at x = -0.95)
      rays.push(1.55, yOff, 0, -0.95, yOff, 0);
      // 2. Reflected converging ray from primary mirror to hyperbolic secondary (x = +0.78)
      rays.push(-0.95, yOff, 0, 0.78, yOff * 0.25, 0);
      // 3. Secondary reflection through central perforation to Cassegrain focal plane (x = -1.28)
      rays.push(0.78, yOff * 0.25, 0, -1.28, 0, 0);
    }
    return new Float32Array(rays);
  }, []);

  useFrame((_, delta) => {
    if (rootRef.current && isSimulationRunning) {
      rootRef.current.rotation.y += Math.min(delta, 0.1) * 0.12;
    }
  });

  return (
    <group
      ref={rootRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      <primitive object={clonedAssembly} />

      {showRayPaths && (
        <lineSegments name="optical_ray_path">
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rayPositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={highlightedNodeId === "optical_ray_path" ? "#fde047" : "#38bdf8"}
            transparent
            opacity={0.88}
          />
        </lineSegments>
      )}
    </group>
  );
}
