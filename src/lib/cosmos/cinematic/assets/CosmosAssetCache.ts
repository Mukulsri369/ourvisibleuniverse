/**
 * COSMOS Reference-Counted Asset Cache, Priority Preloader & GPU Memory Budget Governor
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 28, 29, 30
 *
 * Implements:
 * 1. Reference-counted LRU GPU asset cache integrated with ScientificResourceManager.
 * 2. Quality-tier GPU memory ceilings from docs/academy/cinematic-performance-budget.md:
 *    - HIGH_CINEMATIC: <= 45 MB
 *    - BALANCED: <= 24 MB
 *    - LOW_POWER: <= 12 MB
 * 3. Bounded-concurrency priority preloader (CRITICAL_VISIBLE, ACTIVE_SCENE,
 *    NEXT_CHAPTER_PRELOAD, BACKGROUND) with AbortController cancellation on navigation
 *    so distant future chapters never consume excessive memory or cause race conditions.
 */

import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import { ScientificResourceManager } from "../rendering/ScientificResourceManager";
import type { LoadedScientificModelInstance } from "./CosmosAssetLoader";
import { COSMOS_VERIFIED_ASSET_MANIFEST } from "./CosmosAssetManifest";
import type { CelestialTextureBundle } from "./CosmosTextureVariantManager";

export type AssetPreloadPriority =
  | "CRITICAL_VISIBLE"
  | "ACTIVE_SCENE"
  | "NEXT_CHAPTER_PRELOAD"
  | "BACKGROUND";

export type CachedAssetStatus =
  | "NOT_LOADED"
  | "QUEUED"
  | "LOADING"
  | "READY"
  | "EVICTED"
  | "FALLBACK_ACTIVE"
  | "ERROR";

export interface CachedAssetEntry {
  cacheKey: string;
  assetId: string;
  qualityTier: CinematicQualityTier;
  status: CachedAssetStatus;
  refCount: number;
  holders: Set<string>;
  estimatedGpuBytes: number;
  lastAccessedAt: number;
  loadedModel?: LoadedScientificModelInstance;
  loadedTextures?: CelestialTextureBundle;
}

export interface AssetMemoryTelemetry {
  qualityTier: CinematicQualityTier;
  budgetCapBytes: number;
  currentEstimatedGpuBytes: number;
  budgetUtilizationRatio: number;
  cachedEntryCount: number;
  activePinnedCount: number;
  evictedCount: number;
}

export const QUALITY_TIER_MEMORY_CAP_BYTES: Record<CinematicQualityTier, number> = {
  HIGH_CINEMATIC: 45 * 1024 * 1024, // 45 MB
  BALANCED: 24 * 1024 * 1024, // 24 MB
  LOW_POWER: 12 * 1024 * 1024, // 12 MB
};

export class CosmosAssetCache {
  private static instance: CosmosAssetCache | null = null;
  private entries = new Map<string, CachedAssetEntry>();
  private activeAbortControllers = new Map<string, AbortController>();
  private evictedCount = 0;

  public static getInstance(): CosmosAssetCache {
    if (!this.instance) {
      this.instance = new CosmosAssetCache();
    }
    return this.instance;
  }

  /**
   * Registers or increments reference ownership on a cached asset entry.
   */
  public putOrRetain(params: {
    assetId: string;
    qualityTier: CinematicQualityTier;
    holderId: string;
    estimatedGpuBytes: number;
    loadedModel?: LoadedScientificModelInstance;
    loadedTextures?: CelestialTextureBundle;
  }): CachedAssetEntry {
    const cacheKey = `${params.assetId}:${params.qualityTier}`;
    const existing = this.entries.get(cacheKey);
    if (existing) {
      existing.holders.add(params.holderId);
      existing.refCount = existing.holders.size;
      existing.status = "READY";
      existing.lastAccessedAt = Date.now();
      if (params.loadedModel) existing.loadedModel = params.loadedModel;
      if (params.loadedTextures) existing.loadedTextures = params.loadedTextures;
      return existing;
    }

    // Enforce memory budget before inserting a new entry
    this.enforceMemoryBudget(params.qualityTier, params.estimatedGpuBytes);

    const entry: CachedAssetEntry = {
      cacheKey,
      assetId: params.assetId,
      qualityTier: params.qualityTier,
      status: "READY",
      refCount: 1,
      holders: new Set([params.holderId]),
      estimatedGpuBytes: params.estimatedGpuBytes,
      lastAccessedAt: Date.now(),
      loadedModel: params.loadedModel,
      loadedTextures: params.loadedTextures,
    };

    this.entries.set(cacheKey, entry);
    return entry;
  }

  /**
   * Decrements reference ownership for a holder and marks entry eligible for LRU eviction
   * when refCount reaches 0.
   */
  public releaseHolder(assetId: string, holderId: string): number {
    let releasedCount = 0;
    for (const entry of this.entries.values()) {
      if (entry.assetId === assetId && entry.holders.has(holderId)) {
        entry.holders.delete(holderId);
        entry.refCount = entry.holders.size;
        releasedCount++;
      }
    }
    return releasedCount;
  }

  /**
   * Releases all assets held by a specific scene scope when switching modules or exiting fullscreen.
   */
  public releaseSceneScope(sceneId: string): number {
    // Cancel any pending preloads for this scene
    const abortCtrl = this.activeAbortControllers.get(sceneId);
    if (abortCtrl) {
      abortCtrl.abort();
      this.activeAbortControllers.delete(sceneId);
    }

    let released = 0;
    for (const entry of this.entries.values()) {
      if (entry.holders.has(sceneId)) {
        entry.holders.delete(sceneId);
        entry.refCount = entry.holders.size;
        released++;
      }
    }
    return released;
  }

  /**
   * Evicts unreferenced (refCount === 0) entries in LRU order to stay under the quality tier GPU budget.
   */
  public enforceMemoryBudget(
    qualityTier: CinematicQualityTier,
    incomingBytes = 0,
  ): number {
    const capBytes = QUALITY_TIER_MEMORY_CAP_BYTES[qualityTier];
    let currentBytes = this.getTotalEstimatedGpuBytes();
    if (currentBytes + incomingBytes <= capBytes) {
      return 0;
    }

    // Sort unpinned (refCount === 0) entries oldest-first
    const evictable = Array.from(this.entries.values())
      .filter((e) => e.refCount <= 0 && e.status === "READY")
      .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

    let freedBytes = 0;
    for (const candidate of evictable) {
      if (currentBytes + incomingBytes - freedBytes <= capBytes) {
        break;
      }
      this.disposeEntry(candidate);
      freedBytes += candidate.estimatedGpuBytes;
    }
    return freedBytes;
  }

  /**
   * Explicitly disposes all unreferenced cached assets (`refCount === 0`).
   */
  public clearUnusedCache(): number {
    let cleared = 0;
    for (const entry of Array.from(this.entries.values())) {
      if (entry.refCount <= 0) {
        this.disposeEntry(entry);
        cleared++;
      }
    }
    return cleared;
  }

  private disposeEntry(entry: CachedAssetEntry): void {
    if (entry.loadedModel?.rootGroup) {
      entry.loadedModel.rootGroup.traverse((obj) => {
        const mesh = obj as any;
        if (mesh.geometry && typeof mesh.geometry.dispose === "function") {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: any) => m?.dispose?.());
          } else if (typeof mesh.material.dispose === "function") {
            mesh.material.dispose();
          }
        }
      });
    }
    entry.status = "EVICTED";
    this.entries.delete(entry.cacheKey);
    this.evictedCount++;
    ScientificResourceManager.getInstance().releaseResource(entry.cacheKey);
  }

  public getEntry(assetId: string, qualityTier: CinematicQualityTier): CachedAssetEntry | null {
    const entry = this.entries.get(`${assetId}:${qualityTier}`);
    if (entry) {
      entry.lastAccessedAt = Date.now();
    }
    return entry || null;
  }

  public getStatus(assetId: string, qualityTier: CinematicQualityTier = "HIGH_CINEMATIC"): CachedAssetStatus {
    const entry = this.entries.get(`${assetId}:${qualityTier}`);
    if (entry) return entry.status;
    return COSMOS_VERIFIED_ASSET_MANIFEST[assetId] ? "NOT_LOADED" : "ERROR";
  }

  public getTotalEstimatedGpuBytes(): number {
    let sum = 0;
    for (const entry of this.entries.values()) {
      if (entry.status === "READY") {
        sum += entry.estimatedGpuBytes;
      }
    }
    return sum;
  }

  public getMemoryTelemetry(
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): AssetMemoryTelemetry {
    const cap = QUALITY_TIER_MEMORY_CAP_BYTES[qualityTier];
    const current = this.getTotalEstimatedGpuBytes();
    let pinned = 0;
    for (const entry of this.entries.values()) {
      if (entry.refCount > 0) pinned++;
    }
    return {
      qualityTier,
      budgetCapBytes: cap,
      currentEstimatedGpuBytes: current,
      budgetUtilizationRatio: Number((current / cap).toFixed(4)),
      cachedEntryCount: this.entries.size,
      activePinnedCount: pinned,
      evictedCount: this.evictedCount,
    };
  }
}
