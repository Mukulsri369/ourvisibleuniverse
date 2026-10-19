/**
 * COSMOS Screen-Space & Geometric-Error Level of Detail (LOD) & Dimensional Scale Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 14, 15, 32
 *
 * Implements:
 * 1. 4-tier screen-space + geometric-error LOD resolution:
 *    - LOD0_HIGH (>= 140 px): Close inspection (64x64 geodetic sphere / full spacecraft hierarchy)
 *    - LOD1_MEDIUM (48..140 px): Normal cinematic viewing (48x48 sphere / instanced sub-assemblies)
 *    - LOD2_LOW (12..48 px): Distant orbital viewing (32x32 sphere / simplified hull)
 *    - LOD3_IMPOSTOR (< 12 px): Sub-12px screen-space photometric impostor / billboard
 * 2. Symmetric hysteresis buffer preventing LOD oscillation when the camera hovers near a threshold.
 * 3. Smooth cubic cross-fade weights (alphaNear, alphaFar) eliminating visible popping.
 * 4. DimensionalScaleConverter keeping physical radius, display radius, orbital distance,
 *    rendering coordinates, camera-relative distance, and model local units strictly separate.
 */

import * as THREE from "three";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import {
  COSMOS_VERIFIED_ASSET_MANIFEST,
  type AssetLODDescriptor,
  type LODLevelIdentifier,
} from "./CosmosAssetManifest";

export interface DimensionalScaleState {
  objectId: string;
  physicalRadiusKm: number;
  displayRadiusUnits: number;
  orbitalDistanceAu: number;
  renderingPositionUnits: [number, number, number];
  cameraRelativePositionUnits: [number, number, number];
  cameraRelativeDistanceUnits: number;
  modelLocalScale: number;
  scaleCompressionFactor: number;
}

export interface EvaluatedAssetLODState {
  objectId: string;
  assetId: string;
  activeLOD: LODLevelIdentifier;
  previousLOD: LODLevelIdentifier;
  projectedScreenPixels: number;
  measuredGeometricError: number;
  triangleCount: number;
  sphereSegments: [number, number];
  particleCount: number;
  alphaNear: number;
  alphaFar: number;
  isImpostorActive: boolean;
  transitionInProgress: boolean;
}

const LOD_ORDER: LODLevelIdentifier[] = ["LOD0_HIGH", "LOD1_MEDIUM", "LOD2_LOW", "LOD3_IMPOSTOR"];

/**
 * Keeps physical astronomical measurements strictly decoupled from 3D scene rendering units
 * and imported model local bounding boxes (Section 15).
 */
export class DimensionalScaleConverter {
  public static readonly KM_PER_AU = 149_597_870.7;
  public static readonly EARTH_RADIUS_KM = 6_371.0;

  /**
   * Computes a complete dimensional state without mutating authoritative physical parameters.
   */
  public static computeDimensionalState(params: {
    objectId: string;
    physicalRadiusKm: number;
    displayRadiusUnits: number;
    orbitalDistanceAu?: number;
    worldPositionUnits: [number, number, number];
    cameraPositionUnits: [number, number, number];
    modelNativeRadiusUnits?: number;
  }): DimensionalScaleState {
    const nativeRadius = Math.max(1e-6, params.modelNativeRadiusUnits ?? 1.0);
    const modelLocalScale = params.displayRadiusUnits / nativeRadius;

    const relX = params.worldPositionUnits[0] - params.cameraPositionUnits[0];
    const relY = params.worldPositionUnits[1] - params.cameraPositionUnits[1];
    const relZ = params.worldPositionUnits[2] - params.cameraPositionUnits[2];
    const cameraRelativeDistanceUnits = Math.max(
      1e-5,
      Math.hypot(relX, relY, relZ),
    );

    const earthNormalizedPhysical = params.physicalRadiusKm / this.EARTH_RADIUS_KM;
    const scaleCompressionFactor =
      earthNormalizedPhysical > 0 ? params.displayRadiusUnits / earthNormalizedPhysical : 1.0;

    return {
      objectId: params.objectId,
      physicalRadiusKm: params.physicalRadiusKm,
      displayRadiusUnits: params.displayRadiusUnits,
      orbitalDistanceAu: params.orbitalDistanceAu ?? 0,
      renderingPositionUnits: [...params.worldPositionUnits],
      cameraRelativePositionUnits: [relX, relY, relZ],
      cameraRelativeDistanceUnits,
      modelLocalScale,
      scaleCompressionFactor,
    };
  }
}

export class CosmosAssetLODManager {
  private static instance: CosmosAssetLODManager | null = null;
  private lodStates = new Map<string, EvaluatedAssetLODState>();
  private sharedSphereGeometries = new Map<string, THREE.SphereGeometry>();

  public static getInstance(): CosmosAssetLODManager {
    if (!this.instance) {
      this.instance = new CosmosAssetLODManager();
    }
    return this.instance;
  }

  /**
   * Projects an object's display radius onto the viewport in pixels.
   */
  public static computeProjectedScreenPixels(
    displayRadiusUnits: number,
    cameraDistanceUnits: number,
    fovDeg = 45,
    viewportHeightPx = 1080,
  ): number {
    const safeDist = Math.max(0.05, cameraDistanceUnits);
    const fovRad = (Math.max(10, Math.min(120, fovDeg)) * Math.PI) / 180;
    const angularDiameterRad = 2 * Math.atan(Math.max(0.001, displayRadiusUnits) / safeDist);
    return Math.max(0, (angularDiameterRad / fovRad) * viewportHeightPx);
  }

  /**
   * Evaluates the optimal LOD level with symmetric hysteresis and quality-tier clamping.
   */
  public evaluateLOD(params: {
    objectId: string;
    assetId: string;
    displayRadiusUnits: number;
    cameraDistanceUnits: number;
    fovDeg?: number;
    viewportHeightPx?: number;
    qualityTier?: CinematicQualityTier;
  }): EvaluatedAssetLODState {
    const stateKey = `${params.objectId}:${params.assetId}`;
    const existing = this.lodStates.get(stateKey);
    const record =
      COSMOS_VERIFIED_ASSET_MANIFEST[params.assetId] ||
      COSMOS_VERIFIED_ASSET_MANIFEST.asset_planet_earth_reference_v2;
    const available = record.availableLODLevels;

    const projectedPx = CosmosAssetLODManager.computeProjectedScreenPixels(
      params.displayRadiusUnits,
      params.cameraDistanceUnits,
      params.fovDeg ?? 45,
      params.viewportHeightPx ?? 1080,
    );

    // Determine raw candidate LOD from screen pixels
    let targetDescriptor: AssetLODDescriptor =
      available.find(
        (d) => projectedPx >= d.minScreenPixels && projectedPx < d.maxScreenPixels,
      ) || available[available.length - 1];

    // Apply symmetric hysteresis if an existing state is present so minor camera movements never oscillate
    if (existing) {
      const currentDesc = available.find((d) => d.lodId === existing.activeLOD);
      if (currentDesc) {
        const currentIdx = LOD_ORDER.indexOf(currentDesc.lodId);
        const targetIdx = LOD_ORDER.indexOf(targetDescriptor.lodId);

        if (targetIdx < currentIdx) {
          // Moving to higher detail (e.g., LOD1 -> LOD0): require exceeding minScreenPixels + hysteresis
          const upgradeThreshold = currentDesc.maxScreenPixels + currentDesc.hysteresisPixels;
          if (projectedPx < upgradeThreshold) {
            targetDescriptor = currentDesc;
          }
        } else if (targetIdx > currentIdx) {
          // Moving to lower detail (e.g., LOD0 -> LOD1): require dropping below minScreenPixels - hysteresis
          const downgradeThreshold = Math.max(
            0,
            currentDesc.minScreenPixels - currentDesc.hysteresisPixels,
          );
          if (projectedPx > downgradeThreshold) {
            targetDescriptor = currentDesc;
          }
        }
      }
    }

    // Apply quality-tier floor (LOW_POWER caps at LOD1/LOD2 to preserve mobile frame stability)
    const quality = params.qualityTier ?? "HIGH_CINEMATIC";
    if (quality === "LOW_POWER" && targetDescriptor.lodId === "LOD0_HIGH" && available.length > 1) {
      targetDescriptor = available[1];
    }

    // Smooth cross-fade weights across the transition band
    const impostorThreshold = 12;
    const impostorBlendSpan = 16;
    const rawBlend = THREE.MathUtils.clamp(
      (projectedPx - impostorThreshold) / impostorBlendSpan,
      0,
      1,
    );
    const smoothNear = rawBlend * rawBlend * (3 - 2 * rawBlend);
    const alphaNear = smoothNear;
    const alphaFar = Math.max(0, 1.0 - smoothNear * 1.1);

    const sphereSegments: [number, number] = targetDescriptor.sphereSegments ?? [
      quality === "HIGH_CINEMATIC" ? 64 : quality === "BALANCED" ? 48 : 32,
      quality === "HIGH_CINEMATIC" ? 64 : quality === "BALANCED" ? 48 : 32,
    ];

    const evaluated: EvaluatedAssetLODState = {
      objectId: params.objectId,
      assetId: params.assetId,
      activeLOD: targetDescriptor.lodId,
      previousLOD: existing?.activeLOD ?? targetDescriptor.lodId,
      projectedScreenPixels: projectedPx,
      measuredGeometricError: targetDescriptor.geometricErrorRatio,
      triangleCount: targetDescriptor.triangleCount,
      sphereSegments,
      particleCount: targetDescriptor.particleCount ?? 0,
      alphaNear,
      alphaFar,
      isImpostorActive: targetDescriptor.lodId === "LOD3_IMPOSTOR",
      transitionInProgress: alphaNear > 0.02 && alphaNear < 0.98,
    };

    this.lodStates.set(stateKey, evaluated);
    return evaluated;
  }

  /**
   * Returns a shared, cached SphereGeometry for the resolved LOD segment count
   * so multiple celestial bodies reuse GPU vertex/index buffers without reallocation.
   */
  public getSharedSphereGeometry(widthSegments: number, heightSegments: number): THREE.SphereGeometry {
    const key = `sphere:${widthSegments}x${heightSegments}`;
    let geom = this.sharedSphereGeometries.get(key);
    if (!geom) {
      geom = new THREE.SphereGeometry(1, widthSegments, heightSegments);
      this.sharedSphereGeometries.set(key, geom);
    }
    return geom;
  }

  public getState(objectId: string, assetId: string): EvaluatedAssetLODState | undefined {
    return this.lodStates.get(`${objectId}:${assetId}`);
  }

  public reset(): void {
    this.lodStates.clear();
  }
}
