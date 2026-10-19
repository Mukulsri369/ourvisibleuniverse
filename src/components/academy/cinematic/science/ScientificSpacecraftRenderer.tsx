/**
 * COSMOS Scientific Spacecraft & Mission Assembly 3D Renderer
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 20, 26, 27, 32
 *
 * Renders node-addressable, LOD-aware 3D spacecraft models:
 * - James Webb Space Telescope (asset_spacecraft_jwst_v2)
 * - Hubble Space Telescope (asset_spacecraft_hst_v2)
 * - Voyager 1/2 Interstellar Probe (asset_spacecraft_voyager_v2)
 * - ISRO Chandrayaan-3 Vikram Lander & Pragyan Rover (asset_spacecraft_chandrayaan3_vikram_v2)
 *
 * Preserves named interactive hierarchy nodes (primary_mirror, secondary_mirror,
 * sunshield, solar_array, high_gain_antenna, golden_record_plaque, etc.) so COSMOS
 * animation cues and camera focus commands can highlight and inspect individual parts.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CinematicQualityTier } from "@/lib/cosmos/cinematic-storyboard-types";
import { CosmosCinematicAssetManager } from "@/lib/cosmos/cinematic/assets";
import { CosmosScientificSceneLibrary } from "@/lib/cosmos/cinematic/rendering";

export type SpacecraftAssetId =
  | "asset_spacecraft_jwst_v2"
  | "asset_spacecraft_hst_v2"
  | "asset_spacecraft_voyager_v2"
  | "asset_spacecraft_chandrayaan3_vikram_v2";

export interface ScientificSpacecraftRendererProps {
  objectId: string;
  sceneId: string;
  assetId: SpacecraftAssetId;
  position?: [number, number, number];
  scale?: number;
  qualityTier: CinematicQualityTier;
  isSimulationRunning?: boolean;
  simulationTimeScale?: number;
  highlighted?: boolean;
  highlightedPartNodeId?: string | null;
  narrativeProgress?: number;
  onSelectObject?: (objectId: string) => void;
}

export function ScientificSpacecraftRenderer({
  objectId,
  sceneId,
  assetId,
  position = [0, 0, 0],
  scale = 1.0,
  qualityTier,
  isSimulationRunning = true,
  simulationTimeScale = 1.0,
  highlighted = false,
  highlightedPartNodeId = null,
  narrativeProgress = 0,
  onSelectObject,
}: ScientificSpacecraftRendererProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  const assetManager = CosmosCinematicAssetManager.getInstance();

  const metadata = useMemo(() => assetManager.getAssetMetadata(assetId), [assetManager, assetId]);

  const loadedEntry = useMemo(
    () =>
      assetManager.loadAsset(assetId, {
        qualityTier,
        holderId: sceneId,
      }),
    [assetManager, assetId, qualityTier, sceneId],
  );

  const clonedScene = useMemo(() => {
    if (!loadedEntry.loadedModel) return new THREE.Group();
    return loadedEntry.loadedModel.rootGroup.clone(true);
  }, [loadedEntry]);

  // Apply part-level highlight when COSMOS cues reference a specific sub-assembly node
  useEffect(() => {
    clonedScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        const isPartTarget =
          Boolean(highlightedPartNodeId) &&
          (obj.name === highlightedPartNodeId || obj.parent?.name === highlightedPartNodeId);
        if (isPartTarget || highlighted) {
          mat.emissive = new THREE.Color(isPartTarget ? "#38bdf8" : "#0284c7");
          mat.emissiveIntensity = isPartTarget ? 0.55 : 0.25;
        } else {
          mat.emissive = new THREE.Color("#000000");
          mat.emissiveIntensity = 0.0;
        }
        mesh.material = mat;
      }
    });
  }, [clonedScene, highlighted, highlightedPartNodeId]);

  // Register with CosmosScientificSceneLibrary & release on unmount
  useEffect(() => {
    const lib = CosmosScientificSceneLibrary.getInstance();
    const ctrl = lib.registerObject(
      {
        objectId,
        sceneId,
        name: metadata?.displayName || "Spacecraft Observatory",
        scientificObjectType: "spacecraft_instrument",
        scaleRegime: "planetary_scale",
        scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
        epistemicDisclosure:
          metadata?.requiredAttribution ||
          "Scale-adjusted spacecraft assembly with addressable instrument nodes.",
        physicalParameters: {
          radiusKm: metadata?.physicalDimensions.physicalRadiusKm || 0.01,
        },
        displayScale: scale,
        renderingQuality: qualityTier,
        supportedAnimations: ["attitude_slewing", "part_highlight"],
        supportedHighlights: metadata?.requiredInteractiveNodeIds || ["primary_mirror"],
        supportedCameraTargets: [objectId, ...(metadata?.requiredInteractiveNodeIds || [])],
        scientificSources: [metadata?.sourceOrganization || "NASA 3D Resources"],
        shaderState: {
          narrativeProgress,
          simulationTime: 0,
          stellarTemperatureK: 5772,
          atmosphericOpticalDepth: 0,
          highlightStrength: highlighted ? 0.85 : 0,
          emissionIntensity: 1.0,
          densityScale: 1.0,
          cutawayRevealAngleRad: 0,
          dopplerBeamingStrength: 0,
          lensingDeflectionStrength: 0,
          visualizationMode: "photometric",
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
      scale,
    );

    return () => {
      ctrl.disposeResources();
      assetManager.releaseAsset(assetId, sceneId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId, sceneId, assetId]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isSimulationRunning) {
      const dt = Math.min(delta, 0.1) * simulationTimeScale;
      groupRef.current.rotation.y += dt * 0.14;
    }

    // Evaluate continuous screen-space LOD
    const camDist = camera.position.distanceTo(new THREE.Vector3(...position));
    const lodState = assetManager.selectLOD({
      assetId,
      objectId,
      displayRadiusUnits: scale,
      cameraDistanceUnits: camDist,
      viewportHeightPx: size.height || 1080,
      qualityTier,
    });
    groupRef.current.visible = !lodState.isImpostorActive;
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
      <primitive object={clonedScene} />
    </group>
  );
}
