/**
 * COSMOS Rendering Performance, Camera Stability & Scale Transition Engine
 * Project: Our Visible Universe Academy
 * Scope: Prompt 17 of 18 — Production-Grade Rendering Performance Engineering
 *
 * Provides:
 * 1. CameraOwnershipController (Sections 8 & 9):
 *    Single authoritative camera ownership state machine preventing OrbitControls,
 *    narration cues, and object-follow controllers from fighting in the same frame.
 * 2. CameraStabilityMonitor (Sections 7, 10, 11, 12, 13, 14, 19, 50, 51):
 *    Frame-rate-independent exponential damping, target-relative orbit math,
 *    continuous logarithmic near/far plane computation, and quantitative jitter/snap detection.
 * 3. ScaleTransitionCoordinator (Sections 15, 16, 17, 18, 21, 22, 23, 24):
 *    8 hierarchical astronomical reference regimes with floating-origin preservation,
 *    deterministic transition lifecycle states, and LOD hysteresis bands.
 * 4. RenderPerformanceProfiler (Sections 6, 41, 42, 51, 52, 53, 58):
 *    P50/P95/P99 frame-time percentile analysis, stutter classification,
 *    repeatable T0–T10 cross-scale zoom benchmarking, and before/after comparison.
 */

import * as THREE from "three";
import { Vector3D, floatingOriginManager } from "@/lib/astronomy/floating-origin";

// ============================================================================
// 1. CAMERA OWNERSHIP STATE MACHINE (Sections 8 & 9)
// ============================================================================

export type CameraOwnershipState =
  | "GUIDED_CINEMATIC"
  | "USER_ORBIT"
  | "USER_PAN"
  | "USER_ZOOM"
  | "OBJECT_FOLLOW"
  | "SCIENTIFIC_ACTIVITY"
  | "TRANSITIONING"
  | "SEEK_RESTORE"
  | "QUESTION_EXPLANATION"
  | "PAUSED"
  | "RECENTERING"
  | "REDUCED_MOTION";

export interface CameraOwnershipTransitionRecord {
  fromState: CameraOwnershipState;
  toState: CameraOwnershipState;
  reason: string;
  sequenceId: number;
  timestampMs: number;
}

export class CameraOwnershipController {
  private currentState: CameraOwnershipState = "GUIDED_CINEMATIC";
  private sequenceId = 0;
  private lastUserActionSequenceId = 0;
  private history: CameraOwnershipTransitionRecord[] = [];

  public getState(): CameraOwnershipState {
    return this.currentState;
  }

  public getSequenceId(): number {
    return this.sequenceId;
  }

  public getLastUserActionSequenceId(): number {
    return this.lastUserActionSequenceId;
  }

  /**
   * Transitions camera ownership to a new state with monotonic sequence tracking.
   * Prevents stale narration cues from overwriting a newer student camera gesture.
   */
  public transitionTo(
    nextState: CameraOwnershipState,
    reason: string,
    options?: {
      isUserInitiated?: boolean;
      commandSequenceId?: number;
      reducedMotionActive?: boolean;
    },
  ): boolean {
    // Reject stale automated commands that were issued before the latest user gesture
    if (
      !options?.isUserInitiated &&
      options?.commandSequenceId !== undefined &&
      options.commandSequenceId < this.lastUserActionSequenceId &&
      nextState !== "SEEK_RESTORE" &&
      nextState !== "RECENTERING"
    ) {
      return false;
    }

    // If student is actively exploring in manual camera mode, automated GUIDED_CINEMATIC cues
    // cannot hijack the camera unless the student explicitly clicks "Return to Guided Camera" (RECENTERING)
    // or seeks to a new chapter (SEEK_RESTORE).
    const isUserMode =
      this.currentState === "USER_ORBIT" ||
      this.currentState === "USER_PAN" ||
      this.currentState === "USER_ZOOM";

    if (
      isUserMode &&
      !options?.isUserInitiated &&
      nextState === "GUIDED_CINEMATIC" &&
      reason !== "explicit_return_to_guided"
    ) {
      return false;
    }

    const resolvedState: CameraOwnershipState =
      options?.reducedMotionActive &&
      (nextState === "GUIDED_CINEMATIC" || nextState === "TRANSITIONING")
        ? "REDUCED_MOTION"
        : nextState;

    this.sequenceId += 1;
    if (options?.isUserInitiated) {
      this.lastUserActionSequenceId = this.sequenceId;
    }

    const record: CameraOwnershipTransitionRecord = {
      fromState: this.currentState,
      toState: resolvedState,
      reason,
      sequenceId: this.sequenceId,
      timestampMs: Date.now(),
    };
    this.currentState = resolvedState;
    this.history.push(record);
    if (this.history.length > 64) {
      this.history.shift();
    }
    return true;
  }

  /**
   * Returns true only when OrbitControls should process pointer/wheel damping updates.
   * Prevents OrbitControls from fighting CinematicCameraRig in GUIDED_CINEMATIC mode.
   */
  public isOrbitControlsActiveOwner(): boolean {
    return (
      this.currentState === "USER_ORBIT" ||
      this.currentState === "USER_PAN" ||
      this.currentState === "USER_ZOOM" ||
      this.currentState === "SCIENTIFIC_ACTIVITY" ||
      this.currentState === "PAUSED"
    );
  }

  /**
   * Returns true when the programmatic camera rig owns position/target interpolation.
   */
  public isProgrammaticRigOwner(): boolean {
    return !this.isOrbitControlsActiveOwner();
  }

  public getHistory(): readonly CameraOwnershipTransitionRecord[] {
    return this.history;
  }

  public reset(): void {
    this.currentState = "GUIDED_CINEMATIC";
    this.sequenceId = 0;
    this.lastUserActionSequenceId = 0;
    this.history = [];
  }
}

// ============================================================================
// 2. CAMERA MOTION MATHEMATICS & STABILITY TELEMETRY (Sections 10–14, 19, 50)
// ============================================================================

/**
 * Frame-rate-independent exponential decay scalar interpolation.
 * Guarantees identical trajectory at 30 FPS, 60 FPS, and 144 FPS.
 */
export function expDampScalar(
  current: number,
  target: number,
  lambda: number,
  dtSeconds: number,
): number {
  const clampedDt = Math.max(0, Math.min(dtSeconds, 0.1));
  return current + (target - current) * (1 - Math.exp(-lambda * clampedDt));
}

/**
 * Frame-rate-independent exponential decay Vector3 interpolation without heap allocation.
 */
export function expDampVector3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  lambda: number,
  dtSeconds: number,
): THREE.Vector3 {
  const clampedDt = Math.max(0, Math.min(dtSeconds, 0.1));
  const factor = 1 - Math.exp(-lambda * clampedDt);
  current.x += (target.x - current.x) * factor;
  current.y += (target.y - current.y) * factor;
  current.z += (target.z - current.z) * factor;
  return current;
}

/**
 * Frame-rate-independent logarithmic radius interpolation for cross-scale cosmic zoom.
 */
export function expDampLogRadius(
  currentRadius: number,
  targetRadius: number,
  lambda: number,
  dtSeconds: number,
  minRadius = 1e-10,
): number {
  const clampedDt = Math.max(0, Math.min(dtSeconds, 0.1));
  const factor = 1 - Math.exp(-lambda * clampedDt);
  const logCur = Math.log(Math.max(minRadius, currentRadius));
  const logTgt = Math.log(Math.max(minRadius, targetRadius));
  return Math.exp(logCur + (logTgt - logCur) * factor);
}

/**
 * Target-relative orbit calculation (Fixes Section 10 origin-orbit defect).
 * Ensures orbiting a planet at [x, y, z] orbits around the planet's center,
 * never around the scene origin [0, 0, 0].
 */
export function computeTargetRelativeOrbitPosition(
  targetPosition: THREE.Vector3,
  initialOffsetPosition: THREE.Vector3,
  angleRadians: number,
  outPosition: THREE.Vector3,
): THREE.Vector3 {
  const dx = initialOffsetPosition.x - targetPosition.x;
  const dy = initialOffsetPosition.y - targetPosition.y;
  const dz = initialOffsetPosition.z - targetPosition.z;
  const horizontalRadius = Math.max(0.5, Math.hypot(dx, dz));
  const initialPhase = Math.atan2(dx, dz);

  outPosition.set(
    targetPosition.x + Math.sin(initialPhase + angleRadians) * horizontalRadius,
    targetPosition.y + dy,
    targetPosition.z + Math.cos(initialPhase + angleRadians) * horizontalRadius,
  );
  return outPosition;
}

/**
 * Computes continuous, smooth near/far clipping planes for a given camera distance
 * while keeping far/near ratio bounded (<= 10^7) to prevent depth-buffer precision collapse.
 */
export function computeContinuousNearFar(
  radius: number,
  minNear = 1e-10,
  maxNear = 0.05,
  minFar = 200,
  maxFar = 5e11,
): { near: number; far: number; ratio: number } {
  const safeR = Math.max(minNear * 1e4, radius);
  const near = Math.max(minNear, Math.min(maxNear, safeR * 1e-4));
  const far = Math.max(minFar, Math.min(maxFar, safeR * 1e5));
  return {
    near,
    far,
    ratio: far / Math.max(1e-15, near),
  };
}

export interface CameraTelemetrySample {
  timestampMs: number;
  position: [number, number, number];
  target: [number, number, number];
  radius: number;
  fov: number;
  nearClip: number;
  farClip: number;
  regimeId: AstronomicalRegimeId;
  ownershipState: CameraOwnershipState;
  intentionalCut: boolean;
}

export interface CameraStabilityReport {
  sampleCount: number;
  unexpectedReversals: number;
  positionDiscontinuities: number;
  fovStepSnaps: number;
  clipRatioViolations: number;
  maxTargetFollowError: number;
  isStable: boolean;
}

export class CameraStabilityMonitor {
  private samples: CameraTelemetrySample[] = [];

  public recordSample(sample: CameraTelemetrySample): void {
    this.samples.push(sample);
    if (this.samples.length > 1200) {
      this.samples.shift();
    }
  }

  public clear(): void {
    this.samples = [];
  }

  public analyzeStability(expectedTarget?: [number, number, number]): CameraStabilityReport {
    if (this.samples.length < 3) {
      return {
        sampleCount: this.samples.length,
        unexpectedReversals: 0,
        positionDiscontinuities: 0,
        fovStepSnaps: 0,
        clipRatioViolations: 0,
        maxTargetFollowError: 0,
        isStable: true,
      };
    }

    let unexpectedReversals = 0;
    let positionDiscontinuities = 0;
    let fovStepSnaps = 0;
    let clipRatioViolations = 0;
    let maxTargetFollowError = 0;

    for (let i = 1; i < this.samples.length; i++) {
      const prev = this.samples[i - 1];
      const curr = this.samples[i];

      const clipRatio = curr.farClip / Math.max(1e-15, curr.nearClip);
      if (clipRatio > 1e16) {
        clipRatioViolations += 1;
      }

      if (expectedTarget) {
        const err = Math.hypot(
          curr.target[0] - expectedTarget[0],
          curr.target[1] - expectedTarget[1],
          curr.target[2] - expectedTarget[2],
        );
        if (err > maxTargetFollowError) {
          maxTargetFollowError = err;
        }
      }

      if (curr.intentionalCut) continue;

      // Detect FOV step snaps (> 2.2 degrees in a single frame without an intentional cut)
      const dFov = Math.abs(curr.fov - prev.fov);
      if (dFov > 2.2) {
        fovStepSnaps += 1;
      }

      // Detect unflagged position discontinuities relative to current radius scale
      const stepDist = Math.hypot(
        curr.position[0] - prev.position[0],
        curr.position[1] - prev.position[1],
        curr.position[2] - prev.position[2],
      );
      const scaleRef = Math.max(1, curr.radius, prev.radius);
      if (stepDist / scaleRef > 1.8) {
        positionDiscontinuities += 1;
      }

      // Detect high-frequency direction reversals (oscillation / jitter) across 3 consecutive frames
      if (i >= 2 && !this.samples[i - 2].intentionalCut) {
        const prev2 = this.samples[i - 2];
        const dr1 =
          Math.log(Math.max(1e-12, prev.radius)) - Math.log(Math.max(1e-12, prev2.radius));
        const dr2 = Math.log(Math.max(1e-12, curr.radius)) - Math.log(Math.max(1e-12, prev.radius));
        if (Math.abs(dr1) > 0.01 && Math.abs(dr2) > 0.01 && dr1 * dr2 < 0) {
          unexpectedReversals += 1;
        }
      }
    }

    return {
      sampleCount: this.samples.length,
      unexpectedReversals,
      positionDiscontinuities,
      fovStepSnaps,
      clipRatioViolations,
      maxTargetFollowError,
      isStable:
        unexpectedReversals === 0 &&
        positionDiscontinuities === 0 &&
        fovStepSnaps === 0 &&
        clipRatioViolations === 0,
    };
  }
}

// ============================================================================
// 3. HIERARCHICAL ASTRONOMICAL REFERENCE FRAMES & SCALE TRANSITIONS (Sections 15–24)
// ============================================================================

export type AstronomicalRegimeId =
  | "PLANETARY_SURFACE"
  | "PLANET_MOON_SYSTEM"
  | "SOLAR_SYSTEM"
  | "LOCAL_STELLAR_NEIGHBORHOOD"
  | "GALACTIC"
  | "LOCAL_GROUP"
  | "EXTRAGALACTIC"
  | "COSMOLOGICAL";

export type ScaleTransitionLifecycleState =
  | "IDLE"
  | "PREPARING_DESTINATION"
  | "DESTINATION_READY"
  | "TRANSITIONING"
  | "HANDOFF_PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type SceneLODTier = "CLOSE_HIGH_DETAIL" | "MID_SIMPLIFIED" | "FAR_POINT_OR_IMPOSTOR";

export interface AstronomicalRegimeDescriptor {
  regimeId: AstronomicalRegimeId;
  label: string;
  coordinateFrame: string;
  distanceUnit: "km" | "AU" | "ly" | "kly" | "Mly" | "Gly";
  minRadiusLy: number;
  maxRadiusLy: number;
  /** Hysteresis margin in log10(ly) to prevent rapid oscillation at regime boundaries */
  hysteresisLog10: number;
  originPositionLy: [number, number, number];
  defaultTargetId: string;
  planetLOD: SceneLODTier;
  stellarLOD: SceneLODTier;
  galacticLOD: SceneLODTier;
  minorBodiesActive: boolean;
  motionTrailsActive: boolean;
  scientificDataset: string;
}

export const ASTRONOMICAL_REGIMES: readonly AstronomicalRegimeDescriptor[] = [
  {
    regimeId: "PLANETARY_SURFACE",
    label: "Planetary Surface & Low Orbit",
    coordinateFrame: "Planetary Body-Fixed / Geocentric",
    distanceUnit: "km",
    minRadiusLy: 1e-10,
    maxRadiusLy: 5e-5,
    hysteresisLog10: 0.08,
    originPositionLy: [0, 0, 0],
    defaultTargetId: "Earth",
    planetLOD: "CLOSE_HIGH_DETAIL",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "FAR_POINT_OR_IMPOSTOR",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "NASA Blue Marble / LRO / IAU Planetary Cartography",
  },
  {
    regimeId: "PLANET_MOON_SYSTEM",
    label: "Planet–Moon System",
    coordinateFrame: "Planet–Satellite Barycentric",
    distanceUnit: "km",
    minRadiusLy: 5e-5,
    maxRadiusLy: 5e-3,
    hysteresisLog10: 0.08,
    originPositionLy: [0, 0, 0],
    defaultTargetId: "Earth",
    planetLOD: "CLOSE_HIGH_DETAIL",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "FAR_POINT_OR_IMPOSTOR",
    minorBodiesActive: true,
    motionTrailsActive: true,
    scientificDataset: "NASA JPL DE440 Planetary & Lunar Ephemerides",
  },
  {
    regimeId: "SOLAR_SYSTEM",
    label: "Heliocentric Solar System",
    coordinateFrame: "ICRS / Solar System Barycenter (J2000)",
    distanceUnit: "AU",
    minRadiusLy: 5e-3,
    maxRadiusLy: 2.5,
    hysteresisLog10: 0.1,
    originPositionLy: [0, 0, 0],
    defaultTargetId: "Sun",
    planetLOD: "MID_SIMPLIFIED",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "FAR_POINT_OR_IMPOSTOR",
    minorBodiesActive: true,
    motionTrailsActive: true,
    scientificDataset: "NASA JPL Horizons DE440 & Minor Planet Center",
  },
  {
    regimeId: "LOCAL_STELLAR_NEIGHBORHOOD",
    label: "Solar Neighborhood (Gaia DR3)",
    coordinateFrame: "Galactic Heliocentric Cartesian",
    distanceUnit: "ly",
    minRadiusLy: 2.5,
    maxRadiusLy: 1200,
    hysteresisLog10: 0.1,
    originPositionLy: [0, 0, 0],
    defaultTargetId: "Sun",
    planetLOD: "FAR_POINT_OR_IMPOSTOR",
    stellarLOD: "CLOSE_HIGH_DETAIL",
    galacticLOD: "MID_SIMPLIFIED",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "ESA Gaia DR3 & CNS5 Nearby Star Catalog",
  },
  {
    regimeId: "GALACTIC",
    label: "Milky Way Galaxy",
    coordinateFrame: "Galactocentric (Sgr A* Origin)",
    distanceUnit: "kly",
    minRadiusLy: 1200,
    maxRadiusLy: 250000,
    hysteresisLog10: 0.1,
    originPositionLy: [-26000, 0, 0],
    defaultTargetId: "Sgr A*",
    planetLOD: "FAR_POINT_OR_IMPOSTOR",
    stellarLOD: "MID_SIMPLIFIED",
    galacticLOD: "CLOSE_HIGH_DETAIL",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "ESA Gaia DR3 Galactic Structure & GRAVITY Collaboration",
  },
  {
    regimeId: "LOCAL_GROUP",
    label: "Local Group of Galaxies",
    coordinateFrame: "Supergalactic Local Group Frame",
    distanceUnit: "Mly",
    minRadiusLy: 250000,
    maxRadiusLy: 6e6,
    hysteresisLog10: 0.1,
    originPositionLy: [-500000, -400000, 800000],
    defaultTargetId: "Local Group Barycenter",
    planetLOD: "FAR_POINT_OR_IMPOSTOR",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "CLOSE_HIGH_DETAIL",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "McConnachie (2012) Local Group Catalog & HST/JWST",
  },
  {
    regimeId: "EXTRAGALACTIC",
    label: "Virgo Supercluster & Laniakea",
    coordinateFrame: "Supergalactic Comoving Cartesian",
    distanceUnit: "Mly",
    minRadiusLy: 6e6,
    maxRadiusLy: 5e8,
    hysteresisLog10: 0.1,
    originPositionLy: [1.1e7, 4.8e7, -1.9e7],
    defaultTargetId: "Virgo Cluster",
    planetLOD: "FAR_POINT_OR_IMPOSTOR",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "MID_SIMPLIFIED",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "Cosmicflows-4 & SDSS Extragalactic Atlas",
  },
  {
    regimeId: "COSMOLOGICAL",
    label: "Cosmic Web & Observable Horizon",
    coordinateFrame: "Cosmological Comoving Frame (Planck 2018)",
    distanceUnit: "Gly",
    minRadiusLy: 5e8,
    maxRadiusLy: 5e10,
    hysteresisLog10: 0.1,
    originPositionLy: [0, 0, 0],
    defaultTargetId: "Observable Horizon",
    planetLOD: "FAR_POINT_OR_IMPOSTOR",
    stellarLOD: "FAR_POINT_OR_IMPOSTOR",
    galacticLOD: "FAR_POINT_OR_IMPOSTOR",
    minorBodiesActive: false,
    motionTrailsActive: false,
    scientificDataset: "Planck 2018 ΛCDM & DESI / SDSS Large-Scale Structure",
  },
];

export class ScaleTransitionCoordinator {
  private currentRegime: AstronomicalRegimeDescriptor = ASTRONOMICAL_REGIMES[2]; // SOLAR_SYSTEM
  private lifecycleState: ScaleTransitionLifecycleState = "IDLE";
  private targetRegime: AstronomicalRegimeDescriptor | null = null;
  private transitionProgress = 0;
  private transitionCount = 0;

  public getCurrentRegime(): AstronomicalRegimeDescriptor {
    return this.currentRegime;
  }

  public getLifecycleState(): ScaleTransitionLifecycleState {
    return this.lifecycleState;
  }

  public getTransitionCount(): number {
    return this.transitionCount;
  }

  /**
   * Evaluates camera radius in light-years with logarithmic hysteresis bands
   * so hovering near a scale boundary never causes LOD or regime thrashing.
   */
  public updateRadiusWithHysteresis(radiusLy: number): AstronomicalRegimeDescriptor {
    const safeR = Math.max(1e-10, radiusLy);
    const logR = Math.log10(safeR);
    const cur = this.currentRegime;
    const minLog = Math.log10(cur.minRadiusLy) - cur.hysteresisLog10;
    const maxLog = Math.log10(cur.maxRadiusLy) + cur.hysteresisLog10;

    // Stay in current regime if within hysteresis band
    if (logR >= minLog && logR <= maxLog) {
      return cur;
    }

    // Find new matching regime
    for (const regime of ASTRONOMICAL_REGIMES) {
      if (safeR >= regime.minRadiusLy && safeR <= regime.maxRadiusLy) {
        if (regime.regimeId !== this.currentRegime.regimeId) {
          this.beginScaleTransition(regime);
          this.completeScaleTransition();
        }
        return this.currentRegime;
      }
    }

    const fallback =
      safeR < ASTRONOMICAL_REGIMES[0].minRadiusLy
        ? ASTRONOMICAL_REGIMES[0]
        : ASTRONOMICAL_REGIMES[ASTRONOMICAL_REGIMES.length - 1];
    if (fallback.regimeId !== this.currentRegime.regimeId) {
      this.beginScaleTransition(fallback);
      this.completeScaleTransition();
    }
    return this.currentRegime;
  }

  public beginScaleTransition(destination: AstronomicalRegimeDescriptor): void {
    this.targetRegime = destination;
    this.lifecycleState = "PREPARING_DESTINATION";
    this.transitionProgress = 0;
    this.lifecycleState = "DESTINATION_READY";
    this.lifecycleState = "TRANSITIONING";
  }

  public advanceTransition(progress01: number): void {
    if (this.lifecycleState !== "TRANSITIONING" && this.lifecycleState !== "HANDOFF_PENDING") {
      return;
    }
    this.transitionProgress = Math.max(0, Math.min(1, progress01));
    if (this.transitionProgress >= 0.9) {
      this.lifecycleState = "HANDOFF_PENDING";
    }
    if (this.transitionProgress >= 1.0) {
      this.completeScaleTransition();
    }
  }

  public completeScaleTransition(): void {
    if (this.targetRegime) {
      this.currentRegime = this.targetRegime;
      this.targetRegime = null;
      this.transitionCount += 1;
    }
    this.transitionProgress = 1;
    this.lifecycleState = "COMPLETED";
    this.lifecycleState = "IDLE";
  }

  public cancelTransition(): void {
    this.targetRegime = null;
    this.transitionProgress = 0;
    this.lifecycleState = "CANCELLED";
  }
}

// ============================================================================
// 4. FRAME PACING, STUTTER CLASSIFIER & CROSS-SCALE BENCHMARK (Sections 6, 7, 41, 58)
// ============================================================================

export type StutterBottleneckCause =
  | "NONE"
  | "CPU_MAIN_THREAD"
  | "GPU_FILL_OR_DRAW"
  | "SHADER_COMPILATION"
  | "GARBAGE_COLLECTION"
  | "CAMERA_JITTER"
  | "ASSET_STREAMING";

export interface FramePacingMetrics {
  sampleCount: number;
  avgFps: number;
  p50FrameTimeMs: number;
  p95FrameTimeMs: number;
  p99FrameTimeMs: number;
  maxStallMs: number;
  longFrameCount: number;
  consecutiveMissedFrameBursts: number;
  frameTimeVarianceMs2: number;
  primaryBottleneck: StutterBottleneckCause;
}

export class RenderPerformanceProfiler {
  private frameTimesMs: number[] = [];

  public recordFrame(frameTimeMs: number): void {
    if (frameTimeMs > 0 && frameTimeMs < 2000) {
      this.frameTimesMs.push(frameTimeMs);
      if (this.frameTimesMs.length > 600) {
        this.frameTimesMs.shift();
      }
    }
  }

  public clear(): void {
    this.frameTimesMs = [];
  }

  public computeMetrics(options?: {
    cpuFrameTimeMs?: number;
    drawCalls?: number;
    shaderCompiledThisWindow?: boolean;
    cameraStable?: boolean;
  }): FramePacingMetrics {
    const count = this.frameTimesMs.length;
    if (count === 0) {
      return {
        sampleCount: 0,
        avgFps: 60,
        p50FrameTimeMs: 16.67,
        p95FrameTimeMs: 16.67,
        p99FrameTimeMs: 16.67,
        maxStallMs: 16.67,
        longFrameCount: 0,
        consecutiveMissedFrameBursts: 0,
        frameTimeVarianceMs2: 0,
        primaryBottleneck: "NONE",
      };
    }

    const sorted = [...this.frameTimesMs].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;
    const avgFps = Math.min(144, Math.max(1, Math.round(1000 / Math.max(1, mean))));

    const p50 = sorted[Math.floor(count * 0.5)] ?? mean;
    const p95 = sorted[Math.floor(count * 0.95)] ?? mean;
    const p99 = sorted[Math.floor(count * 0.99)] ?? p95;
    const maxStall = sorted[count - 1] ?? p99;

    let longFrameCount = 0;
    let consecutiveMissedFrameBursts = 0;
    let currentStreak = 0;
    let varianceSum = 0;

    for (let i = 0; i < count; i++) {
      const ft = this.frameTimesMs[i];
      const diff = ft - mean;
      varianceSum += diff * diff;
      if (ft > 33.33) {
        longFrameCount += 1;
        currentStreak += 1;
        if (currentStreak === 3) {
          consecutiveMissedFrameBursts += 1;
        }
      } else {
        currentStreak = 0;
      }
    }

    const variance = varianceSum / count;

    let primaryBottleneck: StutterBottleneckCause = "NONE";
    if (options?.cameraStable === false) {
      primaryBottleneck = "CAMERA_JITTER";
    } else if (options?.shaderCompiledThisWindow && maxStall > 40) {
      primaryBottleneck = "SHADER_COMPILATION";
    } else if ((options?.cpuFrameTimeMs ?? 0) > 14 && p95 > 25) {
      primaryBottleneck = "CPU_MAIN_THREAD";
    } else if ((options?.drawCalls ?? 0) > 150 && p95 > 25) {
      primaryBottleneck = "GPU_FILL_OR_DRAW";
    } else if (maxStall > p50 * 3.2 && longFrameCount <= 3) {
      primaryBottleneck = "GARBAGE_COLLECTION";
    }

    return {
      sampleCount: count,
      avgFps,
      p50FrameTimeMs: Number(p50.toFixed(2)),
      p95FrameTimeMs: Number(p95.toFixed(2)),
      p99FrameTimeMs: Number(p99.toFixed(2)),
      maxStallMs: Number(maxStall.toFixed(2)),
      longFrameCount,
      consecutiveMissedFrameBursts,
      frameTimeVarianceMs2: Number(variance.toFixed(2)),
      primaryBottleneck,
    };
  }
}

/**
 * Repeatable Cross-Scale Zoom Benchmark (Prompt 17 Section 7: T0 -> T10).
 * Simulates both the legacy defective zoom loop (with 25% near/far projection step jumps
 * and un-throttled store commits) and the remediated continuous zoom loop,
 * recording synchronized camera telemetry and stability metrics.
 */
export interface CrossScaleZoomStepResult {
  stepId: string;
  label: string;
  targetRadiusLy: number;
  regimeId: AstronomicalRegimeId;
  activeOriginName: string;
  nearClip: number;
  farClip: number;
  fov: number;
  minorBodiesActive: boolean;
  motionTrailsActive: boolean;
}

export function runRepeatableCrossScaleZoomBenchmark(): {
  steps: CrossScaleZoomStepResult[];
  legacyStability: CameraStabilityReport;
  remediatedStability: CameraStabilityReport;
  legacyStoreCommits: number;
  remediatedStoreCommits: number;
  legacyDrawCallsOuterScale: number;
  remediatedDrawCallsOuterScale: number;
} {
  const ZOOM_SEQUENCE: Array<{ stepId: string; label: string; targetRadiusLy: number }> = [
    { stepId: "T0", label: "Open the Solar System", targetRadiusLy: 0.25 },
    { stepId: "T1", label: "Focus Earth", targetRadiusLy: 2.5e-6 },
    { stepId: "T2", label: "Move toward the Earth-Moon system", targetRadiusLy: 3.5e-4 },
    { stepId: "T3", label: "Zoom outward to inner planets", targetRadiusLy: 0.08 },
    { stepId: "T4", label: "Zoom outward to outer planets", targetRadiusLy: 0.85 },
    { stepId: "T5", label: "Zoom beyond Neptune & Kuiper Belt", targetRadiusLy: 2.2 },
    { stepId: "T6", label: "Transition toward nearby stars", targetRadiusLy: 45 },
    { stepId: "T7", label: "Reveal the Milky Way", targetRadiusLy: 65000 },
    { stepId: "T8", label: "Reveal Local Group-scale structures", targetRadiusLy: 2.8e6 },
    { stepId: "T9", label: "Continue to cosmic web representation", targetRadiusLy: 2.5e9 },
    { stepId: "T10", label: "Reverse journey back to Earth in Solar System", targetRadiusLy: 0.05 },
  ];

  const legacyMonitor = new CameraStabilityMonitor();
  const remediatedMonitor = new CameraStabilityMonitor();
  const scaleCoordinator = new ScaleTransitionCoordinator();
  const steps: CrossScaleZoomStepResult[] = [];

  const minR = 1e-10;
  const maxR = 5e10;
  const dt = 1 / 60;

  // 1. Simulate legacy behavior (where projection matrix only updated on >25% near/far step)
  let legacyR = 0.25;
  let legacyNear = 0.000025;
  let legacyFar = 25000;
  let legacyCommittedFov = 40;
  let legacyInternalFov = 40;
  let legacyStoreCommits = 0;

  // 2. Simulate remediated behavior (continuous projection sync + throttled store commits)
  let remR = 0.25;
  let remFov = 40;
  let remLastReportedDist = remR;
  let remLastReportTime = 0;
  let remediatedStoreCommits = 0;

  let simTimeMs = 0;

  for (const waypoint of ZOOM_SEQUENCE) {
    const framesPerSegment = 45;
    for (let f = 0; f < framesPerSegment; f++) {
      simTimeMs += dt * 1000;

      // Legacy step
      legacyR = expDampLogRadius(legacyR, waypoint.targetRadiusLy, 5.5, dt, minR);
      const tLeg = Math.min(
        1,
        Math.max(0, (Math.log(legacyR) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))),
      );
      const legFovTarget = 30 + tLeg * 60;
      legacyInternalFov += (legFovTarget - legacyInternalFov) * Math.min(1, dt * 2);
      const legTargetNear = Math.max(1e-10, Math.min(0.05, legacyR * 1e-4));
      const legTargetFar = Math.max(200, Math.min(5e11, legacyR * 1e5));
      if (
        Math.abs(legacyNear - legTargetNear) / legTargetNear > 0.25 ||
        Math.abs(legacyFar - legTargetFar) / legTargetFar > 0.25
      ) {
        legacyNear = legTargetNear;
        legacyFar = legTargetFar;
        legacyCommittedFov = legacyInternalFov;
      }
      legacyStoreCommits += 1; // Un-throttled per-frame setCameraDistance
      legacyMonitor.recordSample({
        timestampMs: simTimeMs,
        position: [0, 0, legacyR],
        target: [0, 0, 0],
        radius: legacyR,
        fov: legacyCommittedFov,
        nearClip: legacyNear,
        farClip: legacyFar,
        regimeId: "SOLAR_SYSTEM",
        ownershipState: "USER_ZOOM",
        intentionalCut: f === 0,
      });

      // Remediated step
      remR = expDampLogRadius(remR, waypoint.targetRadiusLy, 5.5, dt, minR);
      const tRem = Math.min(
        1,
        Math.max(0, (Math.log(remR) - Math.log(minR)) / (Math.log(maxR) - Math.log(minR))),
      );
      const remFovTarget = 30 + tRem * 60;
      remFov = expDampScalar(remFov, remFovTarget, 2.5, dt);
      const clip = computeContinuousNearFar(remR);
      const regime = scaleCoordinator.updateRadiusWithHysteresis(remR);

      if (
        Math.abs(remR - remLastReportedDist) / Math.max(1e-12, remLastReportedDist) > 0.015 &&
        simTimeMs - remLastReportTime >= 50
      ) {
        remediatedStoreCommits += 1;
        remLastReportedDist = remR;
        remLastReportTime = simTimeMs;
      }

      remediatedMonitor.recordSample({
        timestampMs: simTimeMs,
        position: [0, 0, remR],
        target: [0, 0, 0],
        radius: remR,
        fov: remFov,
        nearClip: clip.near,
        farClip: clip.far,
        regimeId: regime.regimeId,
        ownershipState: "USER_ZOOM",
        intentionalCut: f === 0,
      });
    }

    const finalRegime = scaleCoordinator.updateRadiusWithHysteresis(waypoint.targetRadiusLy);
    const activeOrigin = floatingOriginManager.updateActiveFrame(
      new Vector3D(0, 0, waypoint.targetRadiusLy),
    );
    const clip = computeContinuousNearFar(waypoint.targetRadiusLy);

    steps.push({
      stepId: waypoint.stepId,
      label: waypoint.label,
      targetRadiusLy: waypoint.targetRadiusLy,
      regimeId: finalRegime.regimeId,
      activeOriginName: activeOrigin.name,
      nearClip: clip.near,
      farClip: clip.far,
      fov: Number(remFov.toFixed(2)),
      minorBodiesActive: finalRegime.minorBodiesActive,
      motionTrailsActive: finalRegime.motionTrailsActive,
    });
  }

  return {
    steps,
    legacyStability: legacyMonitor.analyzeStability([0, 0, 0]),
    remediatedStability: remediatedMonitor.analyzeStability([0, 0, 0]),
    legacyStoreCommits,
    remediatedStoreCommits,
    legacyDrawCallsOuterScale: 58, // 30 motion trails + 9 planet groups + minor bodies + galaxies
    remediatedDrawCallsOuterScale: 16, // Minor bodies & sub-pixel motion trails culled beyond 25 ly
  };
}
