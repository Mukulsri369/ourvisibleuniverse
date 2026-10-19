/**
 * COSMOS GPU Memory & Reference-Counted Resource Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Section 25 (GPU Memory and Resource Management)
 *
 * Tracks ownership and reference counts for Three.js Geometries, Materials,
 * Textures, RenderTargets, and Particle TypedArray buffers.
 * Prevents GPU memory leaks across repeated lesson changes, fullscreen transitions,
 * cue replays, COSMOS interruptions, and WebGL context restorations while protecting
 * shared cached assets from premature disposal.
 */

import * as THREE from "three";

export type ManagedResourceCategory =
  "geometry" | "material" | "texture" | "render_target" | "particle_buffer";

export interface ManagedResourceRecord {
  resourceKey: string;
  category: ManagedResourceCategory;
  refCount: number;
  isSharedCache: boolean;
  estimatedBytes: number;
  createdAt: number;
  lastAccessedAt: number;
  disposed: boolean;
  disposeFn: () => void;
}

export interface GpuMemorySnapshot {
  activeResourceCount: number;
  geometriesCount: number;
  materialsCount: number;
  texturesCount: number;
  renderTargetsCount: number;
  particleBuffersCount: number;
  estimatedGpuBytes: number;
  totalDisposedCount: number;
}

export class ScientificResourceManager {
  private static instance: ScientificResourceManager | null = null;
  private resources = new Map<string, ManagedResourceRecord>();
  private totalDisposedCount = 0;

  public static getInstance(): ScientificResourceManager {
    if (!this.instance) {
      this.instance = new ScientificResourceManager();
    }
    return this.instance;
  }

  /**
   * Acquires or registers a GPU resource with reference counting.
   */
  public registerResource(params: {
    resourceKey: string;
    category: ManagedResourceCategory;
    isSharedCache?: boolean;
    estimatedBytes?: number;
    disposeFn: () => void;
  }): ManagedResourceRecord {
    const existing = this.resources.get(params.resourceKey);
    if (existing && !existing.disposed) {
      existing.refCount += 1;
      existing.lastAccessedAt = Date.now();
      return existing;
    }

    const record: ManagedResourceRecord = {
      resourceKey: params.resourceKey,
      category: params.category,
      refCount: 1,
      isSharedCache: Boolean(params.isSharedCache),
      estimatedBytes: Math.max(0, params.estimatedBytes ?? 4096),
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      disposed: false,
      disposeFn: params.disposeFn,
    };

    this.resources.set(params.resourceKey, record);
    return record;
  }

  /**
   * Convenience helper to register a Three.js BufferGeometry, Material, or Texture.
   */
  public trackThreeObject(
    resourceKey: string,
    obj: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.WebGLRenderTarget,
    isSharedCache = false,
    estimatedBytes = 16384,
  ): ManagedResourceRecord {
    let category: ManagedResourceCategory = "geometry";
    if ((obj as THREE.Material).isMaterial) {
      category = "material";
    } else if ((obj as THREE.Texture).isTexture) {
      category = "texture";
    } else if ((obj as THREE.WebGLRenderTarget).isWebGLRenderTarget) {
      category = "render_target";
    }

    return this.registerResource({
      resourceKey,
      category,
      isSharedCache,
      estimatedBytes,
      disposeFn: () => {
        try {
          obj.dispose();
        } catch {
          // Ignore disposal errors on lost context
        }
      },
    });
  }

  /**
   * Decrements reference count for a resource and disposes it when refCount reaches 0
   * (unless it is marked as a persistent shared cache asset and forceDisposeShared is false).
   */
  public releaseResource(resourceKey: string, forceDisposeShared = false): boolean {
    const rec = this.resources.get(resourceKey);
    if (!rec || rec.disposed) return false;

    rec.refCount = Math.max(0, rec.refCount - 1);
    rec.lastAccessedAt = Date.now();

    if (rec.refCount === 0 && (!rec.isSharedCache || forceDisposeShared)) {
      rec.disposed = true;
      rec.disposeFn();
      this.resources.delete(resourceKey);
      this.totalDisposedCount += 1;
      return true;
    }

    return false;
  }

  /**
   * Releases all non-shared temporary scene resources matching a prefix (e.g. "scene:m01").
   */
  public releaseSceneScope(scopePrefix: string): number {
    let released = 0;
    for (const [key, rec] of Array.from(this.resources.entries())) {
      if (key.startsWith(scopePrefix) && !rec.isSharedCache) {
        rec.refCount = 0;
        rec.disposed = true;
        rec.disposeFn();
        this.resources.delete(key);
        this.totalDisposedCount += 1;
        released += 1;
      }
    }
    return released;
  }

  /**
   * Returns a diagnostic snapshot of active GPU resources to verify zero memory growth
   * across repeated scene mounts and quality preset changes.
   */
  public getMemorySnapshot(): GpuMemorySnapshot {
    let geometriesCount = 0;
    let materialsCount = 0;
    let texturesCount = 0;
    let renderTargetsCount = 0;
    let particleBuffersCount = 0;
    let estimatedGpuBytes = 0;

    for (const rec of this.resources.values()) {
      if (rec.disposed) continue;
      estimatedGpuBytes += rec.estimatedBytes;
      switch (rec.category) {
        case "geometry":
          geometriesCount += 1;
          break;
        case "material":
          materialsCount += 1;
          break;
        case "texture":
          texturesCount += 1;
          break;
        case "render_target":
          renderTargetsCount += 1;
          break;
        case "particle_buffer":
          particleBuffersCount += 1;
          break;
      }
    }

    return {
      activeResourceCount: this.resources.size,
      geometriesCount,
      materialsCount,
      texturesCount,
      renderTargetsCount,
      particleBuffersCount,
      estimatedGpuBytes,
      totalDisposedCount: this.totalDisposedCount,
    };
  }

  /**
   * Disposes all resources (including shared caches) for full teardown or test reset.
   */
  public disposeAll(): void {
    for (const rec of this.resources.values()) {
      if (!rec.disposed) {
        rec.disposed = true;
        rec.disposeFn();
        this.totalDisposedCount += 1;
      }
    }
    this.resources.clear();
  }
}
