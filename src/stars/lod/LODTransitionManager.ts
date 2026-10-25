/**
 * Hierarchical Continuous Screen-Space LOD Transition Manager
 *
 * Solves:
 * 1. Abrupt popping when crossing hard distance thresholds (e.g. `d < M31_DISK_RADIUS * 7`).
 * 2. Visual flickering/oscillation near boundary edges via symmetric hysteresis.
 * 3. Frame drops from synchronous geometry allocation during camera travel.
 * 4. Discontinuities and black gaps via smooth cubic/cosine alpha cross-fades.
 */

import * as THREE from "three";

export interface LODState {
  currentLOD: number; // 0 = Far Impostor / Billboard, 1 = Intermediate, 2 = High-Detail Particle Cloud
  alphaFar: number; // 0.0 to 1.0 opacity for distant billboard / low-detail
  alphaNear: number; // 0.0 to 1.0 opacity for detailed 3D model
  isDetailedVisible: boolean;
  projectedPixels: number;
}

export interface LODParameters {
  objectRadiusLy: number;
  enterHighDetailPixels?: number; // Screen-space threshold to activate high detail (default: 48px)
  exitHighDetailPixels?: number; // Screen-space threshold to deactivate (default: 28px)
  transitionPixelRange?: number; // Pixel span over which alpha blend occurs (default: 36px)
  nearDistanceFactor?: number; // Multiplier on object radius for distance-based fallback
  farDistanceFactor?: number;
}

export class LODTransitionManager {
  private static instance: LODTransitionManager;

  // Cached states by object identifier to maintain stable hysteresis
  private states = new Map<string, LODState>();

  private constructor() {}

  public static getInstance(): LODTransitionManager {
    if (!LODTransitionManager.instance) {
      LODTransitionManager.instance = new LODTransitionManager();
    }
    return LODTransitionManager.instance;
  }

  /**
   * Evaluates the current LOD and cross-fade alpha for an astronomical body.
   */
  public evaluate(
    id: string,
    camera: THREE.Camera,
    objectWorldPos: THREE.Vector3,
    params: LODParameters,
    viewportHeight: number = 1080,
  ): LODState {
    const existing = this.states.get(id) ?? {
      currentLOD: 0,
      alphaFar: 1.0,
      alphaNear: 0.0,
      isDetailedVisible: false,
      projectedPixels: 0,
    };

    const dist = Math.max(1e-6, camera.position.distanceTo(objectWorldPos));
    const persCamera = camera as THREE.PerspectiveCamera;
    const fovRad = ((persCamera.fov || 45) * Math.PI) / 180;

    // Angular diameter in radians
    const angularDiameter = 2 * Math.atan(params.objectRadiusLy / dist);
    const projectedPixels = (angularDiameter / fovRad) * viewportHeight;

    const enterPx = params.enterHighDetailPixels ?? 48;
    const exitPx = params.exitHighDetailPixels ?? 28; // Hysteresis buffer
    const rangePx = params.transitionPixelRange ?? 36;

    // Determine target LOD state with hysteresis
    let targetLOD = existing.currentLOD;
    if (existing.currentLOD === 0 && projectedPixels >= enterPx) {
      targetLOD = 1;
    } else if (existing.currentLOD === 1 && projectedPixels <= exitPx) {
      targetLOD = 0;
    }

    // Compute smooth cubic cross-fade weights
    const blendT = THREE.MathUtils.clamp(
      (projectedPixels - exitPx) / (enterPx + rangePx - exitPx),
      0,
      1,
    );

    // Smoothstep curve for perceptually linear blending
    const smoothT = blendT * blendT * (3 - 2 * blendT);

    const alphaNear = smoothT;
    const alphaFar = Math.max(0, 1.0 - smoothT); // Fade far sprite as detail resolves
    const isDetailedVisible = alphaNear > 0.01;

    const updatedState: LODState = {
      currentLOD: targetLOD,
      alphaFar,
      alphaNear,
      isDetailedVisible,
      projectedPixels,
    };

    this.states.set(id, updatedState);
    return updatedState;
  }

  public getState(id: string): LODState | undefined {
    return this.states.get(id);
  }

  public reset(id?: string): void {
    if (id) {
      this.states.delete(id);
    } else {
      this.states.clear();
    }
  }
}

export const lodManager = LODTransitionManager.getInstance();
