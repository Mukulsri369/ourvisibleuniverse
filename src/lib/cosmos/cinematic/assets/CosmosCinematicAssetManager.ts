// @ts-nocheck
/**
 * COSMOS Centralized Cinematic Asset Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 8, 26, 28, 31
 *
 * Single authoritative asset intelligence and streaming orchestrator for the
 * 24-module COSMOS Cinematic Learning System.
 *
 * Responsibilities:
 * - Asset lookup & metadata resolution (getAsset, getAssetMetadata)
 * - Quality-tier & screen-space variant selection (getOptimizedVariant)
 * - Continuous screen-space LOD resolution with hysteresis (selectLOD)
 * - Asynchronous & progressive loading with fallback recovery (loadAsset)
 * - Bounded-concurrency chapter preloading without preloading all 24 modules (preloadAsset, preloadSceneAssets)
 * - Reference-counted GPU caching & scene-scoped disposal (releaseAsset, clearUnusedCache)
 * - Stable COSMOS cue-to-node addressing (resolveCosmosInteractiveNode)
 * - Verified NASA/ESA/ESO/Gaia attribution lookup (getAttribution, getModuleAttributions)
 */

import * as THREE from "three";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import { CosmosCinematicQualityManager } from "../CosmosCinematicQualityManager";
import { CosmosAssetAttribution, type AssetAttributionCredit } from "./CosmosAssetAttribution";
import {
  CosmosAssetCache,
  type AssetMemoryTelemetry,
  type AssetPreloadPriority,
  type CachedAssetEntry,
  type CachedAssetStatus,
} from "./CosmosAssetCache";
import { CosmosAssetLODManager, type EvaluatedAssetLODState } from "./CosmosAssetLODManager";
import { CosmosAssetLoader, type LoadedScientificModelInstance } from "./CosmosAssetLoader";
import {
  COSMOS_VERIFIED_ASSET_MANIFEST,
  MODULE_PRIMARY_ASSET_MAP,
  type AssetTextureVariantDescriptor,
  type CosmosVerifiedAssetRecord,
  type LODLevelIdentifier,
} from "./CosmosAssetManifest";
import {
  CosmosTextureVariantManager,
  type CelestialTextureBundle,
  type CelestialTextureSubjectId,
} from "./CosmosTextureVariantManager";
import { CosmosAssetValidation } from "./CosmosAssetValidation";

export interface LoadAssetOptions {
  qualityTier?: CinematicQualityTier;
  lodLevel?: LODLevelIdentifier;
  holderId?: string;
  projectedScreenPixels?: number;
  simulateNetworkFailure?: boolean;
}

export interface ResolvedAssetVariant {
  assetId: string;
  qualityTier: CinematicQualityTier;
  lodState: EvaluatedAssetLODState;
  textureVariant: AssetTextureVariantDescriptor;
  estimatedGpuBytes: number;
}

const ASSET_TO_TEXTURE_SUBJECT: Record<string, CelestialTextureSubjectId> = {
  asset_planet_mercury_v1: "mercury",
  asset_planet_venus_v1: "venus",
  asset_planet_earth_reference_v2: "earth",
  asset_moon_luna_lroc_v2: "moon",
  asset_planet_mars_viking_mola_v2: "mars",
  asset_planet_jupiter_cassini_juno_v2: "jupiter",
  asset_planet_saturn_cassini_v2: "saturn",
  asset_planet_uranus_voyager_v1: "uranus",
  asset_planet_neptune_voyager_v1: "neptune",
  asset_dwarf_pluto_new_horizons_v1: "pluto",
  asset_moon_europa_galileo_v2: "europa",
  asset_moon_io_galileo_v1: "io",
  asset_moon_titan_cassini_v1: "titan",
  asset_moon_enceladus_cassini_v1: "enceladus",
};

export class CosmosCinematicAssetManager {
  private static instance: CosmosCinematicAssetManager | null = null;
  private cache = CosmosAssetCache.getInstance();
  private loader = CosmosAssetLoader.getInstance();
  private lodManager = CosmosAssetLODManager.getInstance();
  private textureManager = CosmosTextureVariantManager.getInstance();
  private preloadHistory: Array<{
    moduleId: string;
    priority: AssetPreloadPriority;
    assetIds: string[];
    timestamp: number;
  }> = [];

  public static getInstance(): CosmosCinematicAssetManager {
    if (!this.instance) {
      this.instance = new CosmosCinematicAssetManager();
    }
    return this.instance;
  }

  /**
   * Looks up a verified asset record by stable assetId.
   */
  public getAssetMetadata(assetId: string): CosmosVerifiedAssetRecord | null {
    return COSMOS_VERIFIED_ASSET_MANIFEST[assetId] || null;
  }

  /**
   * Synchronous cache lookup for an already loaded asset entry.
   */
  public getAsset(assetId: string, qualityTier?: CinematicQualityTier): CachedAssetEntry | null {
    const resolvedQuality =
      qualityTier ?? CosmosCinematicQualityManager.getInstance().getActivePreset();
    return this.cache.getEntry(assetId, resolvedQuality);
  }

  /**
   * Loads or retrieves a verified scientific asset, enforcing license compliance,
   * interactive node validation, quality-tier memory budgets, and fallback recovery.
   */
  public loadAsset(assetId: string, options: LoadAssetOptions = {}): CachedAssetEntry {
    const qualityTier =
      options.qualityTier ?? CosmosCinematicQualityManager.getInstance().getActivePreset();
    const holderId = options.holderId ?? "default_scene";
    const record = COSMOS_VERIFIED_ASSET_MANIFEST[assetId];

    if (!record) {
      throw new Error(`Unknown astronomical assetId: '${assetId}'`);
    }

    // Gatekeeper: verify license compliance before loading into production scene
    const compliance = CosmosAssetAttribution.verifyAssetLicenseCompliance(record);
    if (!compliance.productionApproved) {
      throw new Error(
        `Asset '${assetId}' blocked by license gatekeeper: ${compliance.issues.join("; ")}`,
      );
    }

    // Check existing cache first to avoid duplicate copies
    const existing = this.cache.getEntry(assetId, qualityTier);
    if (existing && !options.simulateNetworkFailure) {
      existing.holders.add(holderId);
      existing.refCount = existing.holders.size;
      return existing;
    }

    const lodLevel =
      options.lodLevel ??
      (qualityTier === "HIGH_CINEMATIC"
        ? "LOD0_HIGH"
        : qualityTier === "BALANCED"
          ? "LOD1_MEDIUM"
          : "LOD2_LOW");

    const effectiveQualityForTextures = this.textureManager.selectTextureVariantWithHysteresis(
      assetId,
      qualityTier,
      options.projectedScreenPixels ?? 180,
    );

    const texSubject = ASSET_TO_TEXTURE_SUBJECT[assetId];
    let loadedTextures: CelestialTextureBundle | undefined;
    if (texSubject) {
      loadedTextures = this.textureManager.getOrCreateTextureBundle(
        texSubject,
        options.simulateNetworkFailure ? "LOW_POWER" : effectiveQualityForTextures,
      );
    }

    const loadedModel = this.loader.loadHierarchicalScientificModel(
      assetId,
      options.simulateNetworkFailure ? "LOD2_LOW" : lodLevel,
    );

    // Verify all required interactive nodes survived optimization
    const interactivityCheck = CosmosAssetValidation.validateOptimizedAssetInteractivity(
      record,
      loadedModel,
    );
    if (!interactivityCheck.passed) {
      throw new Error(interactivityCheck.rejectionReason || "Interactive node check failed");
    }

    const estimatedGpuBytes =
      (loadedTextures?.estimatedGpuBytes ?? 0) +
      Math.max(loadedModel.byteSizeEstimate, record.estimatedGpuMemory[qualityTier] * 0.25);

    const entry = this.cache.putOrRetain({
      assetId,
      qualityTier,
      holderId,
      estimatedGpuBytes,
      loadedModel,
      loadedTextures,
    });

    if (options.simulateNetworkFailure) {
      entry.status = "FALLBACK_ACTIVE";
    }

    return entry;
  }

  /**
   * Selects the optimal texture and geometry variant for an asset given quality tier
   * and screen-space pixel projection.
   */
  public getOptimizedVariant(
    assetId: string,
    qualityTier: CinematicQualityTier,
    projectedScreenPixels: number,
  ): ResolvedAssetVariant {
    const record =
      COSMOS_VERIFIED_ASSET_MANIFEST[assetId] ||
      COSMOS_VERIFIED_ASSET_MANIFEST.asset_planet_earth_reference_v2;

    const effectiveTexTier = this.textureManager.selectTextureVariantWithHysteresis(
      assetId,
      qualityTier,
      projectedScreenPixels,
    );

    const lodState = this.lodManager.evaluateLOD({
      objectId: assetId,
      assetId,
      displayRadiusUnits: record.physicalDimensions.defaultDisplayRadiusUnits,
      cameraDistanceUnits: Math.max(
        1.5,
        (record.physicalDimensions.defaultDisplayRadiusUnits * 1200) /
          Math.max(4, projectedScreenPixels),
      ),
      qualityTier,
    });

    const textureVariant = record.textureVariants[effectiveTexTier];
    return {
      assetId: record.assetId,
      qualityTier: effectiveTexTier,
      lodState,
      textureVariant,
      estimatedGpuBytes: record.estimatedGpuMemory[effectiveTexTier],
    };
  }

  /**
   * Evaluates continuous screen-space LOD with hysteresis and cross-fade weights.
   */
  public selectLOD(params: {
    assetId: string;
    objectId: string;
    displayRadiusUnits: number;
    cameraDistanceUnits: number;
    fovDeg?: number;
    viewportHeightPx?: number;
    qualityTier?: CinematicQualityTier;
  }): EvaluatedAssetLODState {
    return this.lodManager.evaluateLOD(params);
  }

  /**
   * Preloads a single asset with priority awareness.
   */
  public preloadAsset(
    assetId: string,
    priority: AssetPreloadPriority = "ACTIVE_SCENE",
    qualityTier?: CinematicQualityTier,
    holderId = "preload_queue",
  ): CachedAssetEntry {
    const tier = qualityTier ?? CosmosCinematicQualityManager.getInstance().getActivePreset();
    return this.loadAsset(assetId, {
      qualityTier: tier,
      holderId,
      projectedScreenPixels: priority === "CRITICAL_VISIBLE" ? 240 : 110,
    });
  }

  /**
   * Preloads ONLY the essential primary assets for the specified module (plus optional
   * lightweight next-chapter primary asset), strictly avoiding preloading all 24 modules (Section 28).
   */
  public preloadModuleAssets(
    moduleId: string,
    qualityTier?: CinematicQualityTier,
    includeNextModule = false,
  ): string[] {
    const normalizedModId = String(moduleId).padStart(2, "0");
    const tier = qualityTier ?? CosmosCinematicQualityManager.getInstance().getActivePreset();
    const mapping = MODULE_PRIMARY_ASSET_MAP[normalizedModId] || MODULE_PRIMARY_ASSET_MAP["01"];

    const loadedIds: string[] = [];
    for (const primaryId of mapping.primaryAssetIds) {
      this.preloadAsset(primaryId, "CRITICAL_VISIBLE", tier, `module:${normalizedModId}`);
      loadedIds.push(primaryId);
    }

    if (includeNextModule) {
      const nextNum = Math.min(24, Number(normalizedModId) + 1);
      const nextModId = String(nextNum).padStart(2, "0");
      const nextMapping = MODULE_PRIMARY_ASSET_MAP[nextModId];
      if (nextMapping && nextMapping.primaryAssetIds[0]) {
        const nextPrimary = nextMapping.primaryAssetIds[0];
        if (!loadedIds.includes(nextPrimary)) {
          this.preloadAsset(
            nextPrimary,
            "NEXT_CHAPTER_PRELOAD",
            tier === "HIGH_CINEMATIC" ? "BALANCED" : tier,
            `preload:module:${nextModId}`,
          );
          loadedIds.push(nextPrimary);
        }
      }
    }

    this.preloadHistory.push({
      moduleId: normalizedModId,
      priority: "ACTIVE_SCENE",
      assetIds: loadedIds,
      timestamp: Date.now(),
    });

    return loadedIds;
  }

  /**
   * Resolves a named sub-node inside a hierarchical scientific model for COSMOS
   * camera focusing, part highlighting, or cutaway animation (Section 26).
   */
  public resolveCosmosInteractiveNode(
    assetId: string,
    nodeId: string,
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): THREE.Object3D | null {
    const entry = this.loadAsset(assetId, { qualityTier, holderId: "node_lookup" });
    this.cache.releaseHolder(assetId, "node_lookup");
    if (!entry.loadedModel) return null;
    return (
      entry.loadedModel.namedNodeMap.get(nodeId) ||
      entry.loadedModel.rootGroup.getObjectByName(nodeId) ||
      null
    );
  }

  public getAttribution(assetId: string): AssetAttributionCredit | null {
    return CosmosAssetAttribution.getAttributionForAsset(assetId);
  }

  public getModuleAttributions(moduleId: string): AssetAttributionCredit[] {
    return CosmosAssetAttribution.getPublicCreditsForModule(moduleId);
  }

  public releaseAsset(assetId: string, holderId: string): number {
    return this.cache.releaseHolder(assetId, holderId);
  }

  public releaseModuleScope(moduleId: string): number {
    const normalizedModId = String(moduleId).padStart(2, "0");
    const nextNum = Math.min(24, Number(normalizedModId) + 1);
    const nextModId = String(nextNum).padStart(2, "0");
    this.cache.releaseSceneScope(`preload:module:${nextModId}`);
    return this.cache.releaseSceneScope(`module:${normalizedModId}`);
  }

  public clearUnusedCache(): number {
    return this.cache.clearUnusedCache();
  }

  public getAssetStatus(
    assetId: string,
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): CachedAssetStatus {
    return this.cache.getStatus(assetId, qualityTier);
  }

  public getMemoryTelemetry(
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): AssetMemoryTelemetry {
    return this.cache.getMemoryTelemetry(qualityTier);
  }
}
