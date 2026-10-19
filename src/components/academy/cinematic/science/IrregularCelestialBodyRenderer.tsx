/**
 * COSMOS Irregular Celestial Body & Rubble-Pile Asteroid Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Section 18 (Moons and Small Celestial Bodies)
 *
 * Renders non-spherical small Solar System bodies (such as 101955 Bennu with its
 * OSIRIS-REx spinning-top equatorial ridge and boulder morphology) without forcing
 * irregular asteroids or captured moons into artificial spheres.
 */

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { CosmosCinematicAssetManager } from "@/lib/cosmos/cinematic/assets";

export interface IrregularCelestialBodyRendererProps {
  objectId: string;
  sceneId: string;
  position?: [number, number, number];
  scale?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  onSelectObject?: (objectId: string) => void;
}

export function IrregularCelestialBodyRenderer({
  objectId,
  sceneId,
  position = [0, 0, 0],
  scale = 0.65,
  qualityTier,
  isSimulationRunning = true,
  onSelectObject,
}: IrregularCelestialBodyRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const assetManager = CosmosCinematicAssetManager.getInstance();

  const loadedEntry = useMemo(
    () =>
      assetManager.loadAsset("asset_smallbody_asteroid_bennu_v1", {
        qualityTier,
        holderId: sceneId,
      }),
    [assetManager, qualityTier, sceneId],
  );

  const clonedAsteroid = useMemo(() => {
    if (!loadedEntry.loadedModel) return new THREE.Group();
    return loadedEntry.loadedModel.rootGroup.clone(true);
  }, [loadedEntry]);

  useFrame((_, delta) => {
    if (groupRef.current && isSimulationRunning) {
      groupRef.current.rotation.y += Math.min(delta, 0.1) * 0.35;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onSelectObject?.(objectId);
      }}
    >
      <primitive object={clonedAsteroid} />
    </group>
  );
}
