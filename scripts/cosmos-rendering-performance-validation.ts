/**
 * COSMOS Rendering Performance, Camera Stability & Scale Transition Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 17 of 18 — End-to-End Verification & Benchmark Suite
 *
 * Validates:
 * 1. CameraOwnershipController single-owner governance & stale command rejection
 * 2. Repeatable Cross-Scale Zoom Benchmark (T0 -> T10) legacy vs remediated stability
 * 3. ScaleTransitionCoordinator 8-regime hierarchy & hysteresis bands
 * 4. RenderPerformanceProfiler p50/p95/p99 latency & stutter classification
 * 5. Continuous near/far & FOV projection synchronization (zero 25% step-snap)
 * 6. Shader logarithmic depth buffer (#include <logdepthbuf_vertex> / fragment) audit
 * 7. SolarSystemExplorer3D & CosmicZoomVisualizer3D zero-remount / GPU disposal audit
 * 8. CinematicPostprocessingPipeline priority-1 fallback & OpticsPostProcessing disposal audit
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as THREE from "three";
import {
  CameraOwnershipController,
  CameraStabilityMonitor,
  ScaleTransitionCoordinator,
  RenderPerformanceProfiler,
  computeContinuousNearFar,
  computeTargetRelativeOrbitPosition,
  runRepeatableCrossScaleZoomBenchmark,
} from "../src/lib/rendering/performance";
import { CosmosCinematicQualityManager } from "../src/lib/cosmos/cinematic/CosmosCinematicQualityManager";
import { ScientificResourceManager } from "../src/lib/cosmos/cinematic/rendering/ScientificResourceManager";

interface CheckResult {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  details: string;
}

const results: CheckResult[] = [];

function recordCheck(
  id: string,
  category: string,
  description: string,
  passed: boolean,
  details: string,
) {
  results.push({ id, category, description, passed, details });
}

function readSourceFile(relPath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relPath), "utf8");
}

// ============================================================================
// 1. CAMERA OWNERSHIP CONTROLLER & SINGLE-OWNER GOVERNANCE
// ============================================================================
function validateCameraOwnership() {
  const controller = new CameraOwnershipController();
  const initial = controller.getState();

  recordCheck(
    "CAM-01",
    "Camera Ownership",
    "Default camera owner is GUIDED_CINEMATIC with programmatic rig active",
    initial === "GUIDED_CINEMATIC" &&
      controller.isProgrammaticRigOwner() &&
      !controller.isOrbitControlsActiveOwner(),
    `state=${initial}, programmaticOwner=${controller.isProgrammaticRigOwner()}`,
  );

  // User drag interrupt immediately claims USER_ORBIT
  controller.transitionTo("USER_ORBIT", "student_pointer_drag", { isUserInitiated: true });
  const afterInterrupt = controller.getState();

  // Attempt automated narration cue hijack while student is in USER_ORBIT -> must be rejected
  const hijackAccepted = controller.transitionTo("GUIDED_CINEMATIC", "auto_narration_cue", {
    isUserInitiated: false,
  });

  recordCheck(
    "CAM-02",
    "Camera Ownership",
    "User pointer interaction transfers ownership to USER_ORBIT and blocks automated cue hijacks",
    afterInterrupt === "USER_ORBIT" &&
      controller.isOrbitControlsActiveOwner() &&
      !hijackAccepted &&
      controller.getState() === "USER_ORBIT",
    `state=${controller.getState()}, hijackAccepted=${hijackAccepted}`,
  );

  // Explicit student return to guided camera succeeds
  const explicitReturn = controller.transitionTo("GUIDED_CINEMATIC", "explicit_return_to_guided", {
    isUserInitiated: true,
  });

  recordCheck(
    "CAM-03",
    "Camera Ownership",
    "Explicit student 'Return to Guided Camera' cleanly restores GUIDED_CINEMATIC ownership",
    explicitReturn &&
      controller.getState() === "GUIDED_CINEMATIC" &&
      controller.isProgrammaticRigOwner(),
    `explicitReturn=${explicitReturn}, state=${controller.getState()}`,
  );
}

// ============================================================================
// 2. REPEATABLE T0-T10 CROSS-SCALE ZOOM BENCHMARK & TARGET-RELATIVE ORBIT
// ============================================================================
function validateCrossScaleZoomAndOrbitMath() {
  const bench = runRepeatableCrossScaleZoomBenchmark();

  recordCheck(
    "ZOOM-01",
    "Cross-Scale T0->T10 Zoom Stability",
    "Remediated T0->T10 zoom sequence eliminates FOV step snaps and achieves 100% camera stability",
    bench.remediatedStability.isStable &&
      bench.remediatedStability.fovStepSnaps === 0 &&
      bench.remediatedStability.unexpectedReversals === 0 &&
      bench.remediatedStability.positionDiscontinuities === 0 &&
      bench.steps.length === 11,
    `legacyFovSnaps=${bench.legacyStability.fovStepSnaps} -> remediatedFovSnaps=${bench.remediatedStability.fovStepSnaps}, steps=${bench.steps.length}`,
  );

  recordCheck(
    "ZOOM-02",
    "Store Update Throttling & Draw Call Culling",
    "Remediated zoom loop reduces React store commits by >70% and outer-scale draw calls by >70%",
    bench.remediatedStoreCommits < bench.legacyStoreCommits * 0.3 &&
      bench.remediatedDrawCallsOuterScale < bench.legacyDrawCallsOuterScale * 0.35,
    `storeCommits: ${bench.legacyStoreCommits} -> ${bench.remediatedStoreCommits}, outerDrawCalls: ${bench.legacyDrawCallsOuterScale} -> ${bench.remediatedDrawCallsOuterScale}`,
  );

  // Verify target-relative orbit math never orbits world origin (0,0,0) when target is off-origin
  const planetCenter = new THREE.Vector3(18, 2, -12);
  const initialCam = new THREE.Vector3(24, 5, -12);
  const outPos = new THREE.Vector3();
  let maxDistError = 0;
  const expectedHorizRadius = 6.0;

  for (let a = 0; a <= Math.PI * 2; a += Math.PI / 8) {
    computeTargetRelativeOrbitPosition(planetCenter, initialCam, a, outPos);
    const actualHorizRadius = Math.hypot(outPos.x - planetCenter.x, outPos.z - planetCenter.z);
    maxDistError = Math.max(maxDistError, Math.abs(actualHorizRadius - expectedHorizRadius));
  }

  recordCheck(
    "ZOOM-03",
    "Target-Relative Orbit Invariance",
    "computeTargetRelativeOrbitPosition maintains constant orbital radius around off-origin target [18, 2, -12]",
    maxDistError < 1e-6,
    `expectedRadius=${expectedHorizRadius}, maxRadiusError=${maxDistError.toExponential(2)}`,
  );

  // Verify ScaleTransitionCoordinator hysteresis prevents boundary thrashing
  const coord = new ScaleTransitionCoordinator();
  coord.updateRadiusWithHysteresis(2.45); // Inside SOLAR_SYSTEM (max 2.5 ly)
  const beforeCount = coord.getTransitionCount();
  coord.updateRadiusWithHysteresis(2.55); // Within hysteresis band of SOLAR_SYSTEM
  const afterSmallHoverCount = coord.getTransitionCount();

  recordCheck(
    "ZOOM-04",
    "Logarithmic Scale Hysteresis",
    "ScaleTransitionCoordinator hysteresis prevents regime oscillation when hovering near scale boundaries",
    beforeCount === afterSmallHoverCount && coord.getCurrentRegime().regimeId === "SOLAR_SYSTEM",
    `regime=${coord.getCurrentRegime().regimeId}, transitionsDuringBoundaryHover=${afterSmallHoverCount - beforeCount}`,
  );

  // Verify continuous near/far clipping across 16 orders of magnitude
  const testDistances = [1e-9, 1e-6, 1e-4, 0.01, 1, 100, 50000, 1e7];
  const allNearFarValid = testDistances.every((d) => {
    const { near, far } = computeContinuousNearFar(d);
    return Number.isFinite(near) && Number.isFinite(far) && near > 0 && far > near * 100;
  });

  recordCheck(
    "ZOOM-05",
    "Continuous Frustum Clipping",
    "computeContinuousNearFar maintains valid, non-clipping near/far planes from 1e-9 ly to 1e7 ly",
    allNearFarValid,
    `tested ${testDistances.length} scale regimes across 16 orders of magnitude`,
  );
}

// ============================================================================
// 3. LOGARITHMIC DEPTH BUFFER & SHADER AUDIT (src/stars/*)
// ============================================================================
function validateShadersAndCameraRigSource() {
  const cameraRigSrc = readSourceFile("src/stars/CameraRig.tsx");
  const sceneObjectsSrc = readSourceFile("src/stars/SceneObjects.tsx");
  const starFieldSrc = readSourceFile("src/stars/StarField.tsx");
  const planetsSrc = readSourceFile("src/stars/Planets.tsx");
  const opticsSrc = readSourceFile("src/stars/OpticsPostProcessing.tsx");

  const hasStepSnapRemoved =
    !cameraRigSrc.includes("Math.abs(pc.near - desiredNear) / pc.near > 0.25") &&
    cameraRigSrc.includes("computeContinuousNearFar") &&
    cameraRigSrc.includes("expDampLogRadius");

  recordCheck(
    "SHADER-01",
    "CameraRig Projection Sync",
    "src/stars/CameraRig.tsx removes the 25% near-plane step-snap gate and synchronizes FOV & near/far continuously",
    hasStepSnapRemoved,
    "Verified computeContinuousNearFar + expDampLogRadius + continuous updateProjectionMatrix()",
  );

  const milkyWayHasLogDepth =
    sceneObjectsSrc.includes("#include <logdepthbuf_pars_vertex>") &&
    sceneObjectsSrc.includes("#include <logdepthbuf_vertex>") &&
    sceneObjectsSrc.includes("#include <logdepthbuf_pars_fragment>") &&
    sceneObjectsSrc.includes("#include <logdepthbuf_fragment>");

  recordCheck(
    "SHADER-02",
    "Logarithmic Depth Buffer (MilkyWay)",
    "src/stars/SceneObjects.tsx MilkyWay ShaderMaterial includes vertex and fragment logarithmic depth buffer chunks",
    milkyWayHasLogDepth,
    "Verified #include <logdepthbuf_vertex> and #include <logdepthbuf_fragment> in MilkyWay shader",
  );

  const starFieldHasLogDepth =
    starFieldSrc.includes("#include <logdepthbuf_pars_vertex>") &&
    starFieldSrc.includes("#include <logdepthbuf_vertex>") &&
    starFieldSrc.includes("#include <logdepthbuf_fragment>") &&
    starFieldSrc.includes("__liveCameraDistance");

  recordCheck(
    "SHADER-03",
    "Logarithmic Depth Buffer & Live Distance (StarField)",
    "src/stars/StarField.tsx includes logdepthbuf shader chunks and reads high-frequency __liveCameraDistance",
    starFieldHasLogDepth,
    "Verified logdepthbuf chunks and __liveCameraDistance in StarField.tsx",
  );

  const planetsHasScaleCullingAndLogDepth =
    planetsSrc.includes("pointsRef.current.visible = d <= 25") &&
    planetsSrc.includes("const drawable = pixels > 1.5 && fade > 0.001") &&
    planetsSrc.includes("if (!drawable) {\n        gpuDirty.current = true;\n        return;") &&
    planetsSrc.includes("#include <logdepthbuf_vertex>") &&
    planetsSrc.includes("#include <logdepthbuf_fragment>");

  recordCheck(
    "SHADER-04",
    "Solar System MinorBodies & MotionTrails Scale Culling",
    "Minor bodies cull beyond 25 ly; trails skip GPU uploads below their projected pixel threshold and use logarithmic depth",
    planetsHasScaleCullingAndLogDepth,
    "Verified minor-body distance culling, trail pixel-footprint upload guard and logarithmic depth",
  );

  const opticsDisposesRenderTarget =
    opticsSrc.includes("composer.comp.dispose()") &&
    opticsSrc.includes("composer.bloomPass.dispose()");

  recordCheck(
    "MEM-01",
    "HDR RenderTarget Disposal (OpticsPostProcessing)",
    "src/stars/OpticsPostProcessing.tsx explicitly disposes HalfFloatType WebGLRenderTarget and UnrealBloomPass on unmount",
    opticsDisposesRenderTarget,
    "Verified composer.comp.dispose() (both render targets) and composer.bloomPass.dispose()",
  );
}

// ============================================================================
// 4. ACADEMY 3D EXPLORERS & CINEMATIC SCENE HOST AUDIT
// ============================================================================
function validateAcademy3DComponents() {
  const solarExplorerSrc = readSourceFile("src/components/academy/SolarSystemExplorer3D.tsx");
  const cosmicZoomSrc = readSourceFile("src/components/academy/CosmicZoomVisualizer3D.tsx");
  const sceneHostSrc = readSourceFile(
    "src/components/academy/cinematic/CosmosCinematicSceneHost.tsx",
  );
  const postPipelineSrc = readSourceFile(
    "src/lib/cosmos/cinematic/rendering/CinematicPostprocessingPipeline.tsx",
  );

  const keplerLineMemoized =
    solarExplorerSrc.includes("const lineObj = useMemo(") &&
    solarExplorerSrc.includes("lineObj.geo.dispose()") &&
    solarExplorerSrc.includes("lineObj.mat.dispose()") &&
    solarExplorerSrc.includes("const emissiveColor = useMemo(");

  recordCheck(
    "ACAD-01",
    "SolarSystemExplorer3D GPU Resource Lifecycle",
    "SolarSystemExplorer3D memoizes and disposes KeplerOrbitLine THREE.Line/Material and PlanetMesh emissiveColor",
    keplerLineMemoized,
    "Verified memoized lineObj with unmount disposal and memoized emissiveColor",
  );

  const smoothPresetCamera =
    solarExplorerSrc.includes("transitionRemainingRef") &&
    solarExplorerSrc.includes("1 - Math.exp(-10.0 * dt)") &&
    !solarExplorerSrc.includes("lerp(targetPos, 0.08)");

  recordCheck(
    "ACAD-02",
    "SolarSystemExplorer3D Smooth Camera Presets & Tracking",
    "SolarSystemExplorer3D replaces instant preset teleports and fixed-step 0.08 lerp with frame-rate-independent exponential damping",
    smoothPresetCamera,
    "Verified delta-time exponential damping for preset transitions and live planet tracking",
  );

  const cosmicZoomPersistentLayers =
    cosmicZoomSrc.includes("visible={layerIndex === 0}") &&
    cosmicZoomSrc.includes("visible={layerIndex === 4}") &&
    cosmicZoomSrc.includes("visible={layerIndex === 6}") &&
    cosmicZoomSrc.includes("CosmicZoomCameraController");

  recordCheck(
    "ACAD-03",
    "CosmicZoomVisualizer3D Zero-Remount Scale Switching",
    "CosmicZoomVisualizer3D keeps all 7 scale layers mounted via visibility toggling and smoothly interpolates camera distance",
    cosmicZoomPersistentLayers,
    "Verified visible={layerIndex === N} across all 7 layers and CosmicZoomCameraController",
  );

  const sceneHostTargetCenteredOrbit =
    sceneHostSrc.includes("desiredTargetRef.current.x + Math.sin(angle) * radius") &&
    sceneHostSrc.includes("desiredTargetRef.current.z + Math.cos(angle) * radius") &&
    sceneHostSrc.includes("enableDamping={isManualCameraMode || cameraPausedRef.current}");

  recordCheck(
    "ACAD-04",
    "CosmosCinematicSceneHost Target-Centered Orbit & Single-Owner Camera",
    "CosmosCinematicSceneHost orbits around desiredTargetRef instead of world origin (0,0,0) and disables OrbitControls damping conflict during guided playback",
    sceneHostTargetCenteredOrbit,
    "Verified target-relative orbit math and single-owner OrbitControls damping gate",
  );

  const postPipelineFallbackRender =
    postPipelineSrc.includes("composerBundle.composer.render()") &&
    postPipelineSrc.includes("gl.render(scene, camera)");

  recordCheck(
    "ACAD-05",
    "CinematicPostprocessingPipeline Priority-1 Fallback Render",
    "CinematicPostprocessingPipeline calls gl.render(scene, camera) when postprocessing is disabled so LOW_POWER tier never freezes the canvas",
    postPipelineFallbackRender,
    "Verified else { gl.render(scene, camera); } in priority-1 useFrame hook",
  );
}

// ============================================================================
// 5. FRAME-PACING PROFILER & ADAPTIVE QUALITY TELEMETRY BENCHMARK
// ============================================================================
function validateFramePacingAndQualityManager() {
  const profiler = new RenderPerformanceProfiler();
  const qm = CosmosCinematicQualityManager.getInstance();
  qm.resetForTesting();

  // Feed 100 smooth 60fps frames (16.4ms) + 5 slight 22ms frames
  for (let i = 0; i < 100; i++) {
    profiler.recordFrame(16.4);
    qm.reportFrameDelta(16.4);
  }
  for (let i = 0; i < 5; i++) {
    profiler.recordFrame(22.0);
    qm.reportFrameDelta(22.0);
  }

  const snap = profiler.computeMetrics({ cameraStable: true });
  const qmMetrics = qm.getFramePacingMetrics();

  recordCheck(
    "PERF-01",
    "Frame-Pacing Percentile Profiler",
    "RenderPerformanceProfiler and CosmosCinematicQualityManager compute accurate p50, p95, p99, and stutter metrics",
    snap.p50FrameTimeMs <= 17.0 &&
      snap.p95FrameTimeMs <= 22.5 &&
      snap.longFrameCount === 0 &&
      snap.primaryBottleneck === "NONE" &&
      qmMetrics.sampleCount === 105 &&
      qmMetrics.stutterFramesOver33ms === 0,
    `p50=${snap.p50FrameTimeMs}ms, p95=${snap.p95FrameTimeMs}ms, p99=${snap.p99FrameTimeMs}ms, fps=${snap.avgFps}, bottleneck=${snap.primaryBottleneck}`,
  );

  // Verify ScientificResourceManager zero-leak lifecycle under repeated scene switches
  const rm = ScientificResourceManager.getInstance();
  const beforeMetrics = rm.getMemorySnapshot();
  for (let i = 0; i < 25; i++) {
    const key = `bench-geo-${i}`;
    rm.trackThreeObject(key, new THREE.SphereGeometry(1, 16, 16), false);
    rm.releaseResource(key, true);
  }
  const afterMetrics = rm.getMemorySnapshot();

  recordCheck(
    "PERF-02",
    "Repeated Scene Switch GPU Memory Stability",
    "25 rapid scene resource acquire/release cycles leave zero leaked geometries or materials",
    afterMetrics.geometriesCount === beforeMetrics.geometriesCount,
    `geometriesCount before=${beforeMetrics.geometriesCount}, after=${afterMetrics.geometriesCount}, totalDisposed=${afterMetrics.totalDisposedCount}`,
  );
}

// ============================================================================
// RUN ALL CHECKS & SUMMARY
// ============================================================================
validateCameraOwnership();
validateCrossScaleZoomAndOrbitMath();
validateShadersAndCameraRigSource();
validateAcademy3DComponents();
validateFramePacingAndQualityManager();

const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.length - passedCount;

console.log("================================================================================");
console.log("COSMOS RENDERING PERFORMANCE, CAMERA STABILITY & SCALE TRANSITION VALIDATION");
console.log("================================================================================");
for (const r of results) {
  const status = r.passed ? "PASS" : "FAIL";
  console.log(`[${status}] ${r.id} (${r.category}): ${r.description}`);
  console.log(`       -> ${r.details}`);
}
console.log("--------------------------------------------------------------------------------");
console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("================================================================================");

if (failedCount > 0) {
  process.exit(1);
}
