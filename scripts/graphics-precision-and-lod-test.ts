/**
 * Automated Verification: Real-Time Astronomical Graphics Precision,
 * Camera-Relative Floating Origin, and Continuous LOD System.
 */

import * as THREE from "three";
import {
  Vector3D,
  floatingOriginManager,
  HIERARCHICAL_FRAMES,
  splitDouble,
} from "../src/lib/astronomy/floating-origin";
import { lodManager } from "../src/stars/lod/LODTransitionManager";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failCount++;
  }
}

console.log("\n=======================================================");
console.log("TEST SUITE 1: 64-BIT FLOATING-ORIGIN PRECISION & CANCELLATION");
console.log("=======================================================");

// Test 1: Catastrophic float32 cancellation vs. Float64 Vector3D relative calculation
const worldDistanceLy = 2_500_000.0; // 2.5 million light-years (Andromeda distance)
const fineOffsetLy = 0.00042; // Planetary scale (~26 AU)

// Standard float32 arithmetic simulation
const bigFloat32 = Math.fround(worldDistanceLy);
const offsetFloat32 = Math.fround(bigFloat32 + fineOffsetLy);
const float32CancellationDiff = offsetFloat32 - bigFloat32;
const float32Error = Math.abs(float32CancellationDiff - fineOffsetLy) / fineOffsetLy;

// Vector3D Float64 camera-relative calculation
const cameraWorld64 = new Vector3D(worldDistanceLy, 0, 0);
const planetWorld64 = new Vector3D(worldDistanceLy + fineOffsetLy, 0, 0);
const relativeOut = planetWorld64.toCameraRelative(cameraWorld64);
const float64Error = Math.abs(relativeOut.x - fineOffsetLy) / fineOffsetLy;

console.log(`  Float32 relative error at 2.5 Mly: ${(float32Error * 100).toFixed(4)}%`);
console.log(`  Float64 relative error at 2.5 Mly: ${(float64Error * 100).toFixed(8)}%`);

assert(
  float64Error < 1e-6,
  "Vector3D preserves sub-AU precision at multi-million light-year scales",
  `Error: ${float64Error}`,
);

// Test 2: High/Low Float32 splitting for GLSL reconstruction
const testValue = 1234567.89012345;
const [hi, lo] = splitDouble(testValue);
const reconstructed = hi + lo;
const splitDiff = Math.abs(reconstructed - testValue);
assert(
  splitDiff < 1e-9,
  "splitDouble mathematically reconstructs 64-bit float from two 32-bit floats",
  `Reconstructed diff: ${splitDiff}`,
);

// Test 3: Hierarchical Reference Frame Switching
const solarPos = new Vector3D(2, 1, 3);
const activeSolar = floatingOriginManager.updateActiveFrame(solarPos);
assert(
  activeSolar.id === HIERARCHICAL_FRAMES.SOLAR_SYSTEM.id,
  "Solar neighborhood (< 50 ly) correctly binds Solar System barycenter frame",
);

const gcPos = new Vector3D(-25900, 10, -50);
const activeGC = floatingOriginManager.updateActiveFrame(gcPos);
assert(
  activeGC.id === HIERARCHICAL_FRAMES.GALACTIC_CENTER.id,
  "Sagittarius A* vicinity binds Galactic Center frame",
);

const m31Pos = new Vector3D(-1175000, -931000, 1928000);
const activeM31 = floatingOriginManager.updateActiveFrame(m31Pos);
assert(
  activeM31.id === HIERARCHICAL_FRAMES.ANDROMEDA_M31.id,
  "M31 neighborhood binds Andromeda extragalactic frame",
);

const cosmologicalPos = new Vector3D(1e9, 2e9, 3e9);
const activeCosmo = floatingOriginManager.updateActiveFrame(cosmologicalPos);
assert(
  activeCosmo.id === HIERARCHICAL_FRAMES.OBSERVABLE_COSMOS.id,
  "Deep space binds Observable Universe cosmological frame",
);

console.log("\n=======================================================");
console.log("TEST SUITE 2: CONTINUOUS SCREEN-SPACE LOD & HYSTERESIS");
console.log("=======================================================");

const fakeCamera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 1e8);
const objectCenter = new THREE.Vector3(0, 0, 0);
const galaxyRadius = 100_000; // 100k ly

// Reset manager state for deterministic testing
lodManager.reset("test_galaxy");

// Distance 1: Very far away (10 million ly) -> Impostor billboard active
fakeCamera.position.set(0, 0, 10_000_000);
const stateFar = lodManager.evaluate("test_galaxy", fakeCamera, objectCenter, {
  objectRadiusLy: galaxyRadius,
  enterHighDetailPixels: 48,
  exitHighDetailPixels: 28,
  transitionPixelRange: 32,
});
assert(
  stateFar.currentLOD === 0 && stateFar.alphaNear < 0.05 && stateFar.alphaFar > 0.9,
  "Far distance activates Impostor LOD (alphaNear ≈ 0, alphaFar ≈ 1)",
);

// Distance 2: Approaching -> crosses enter threshold (e.g. 500,000 ly)
fakeCamera.position.set(0, 0, 500_000);
const stateApproach = lodManager.evaluate("test_galaxy", fakeCamera, objectCenter, {
  objectRadiusLy: galaxyRadius,
  enterHighDetailPixels: 48,
  exitHighDetailPixels: 28,
  transitionPixelRange: 32,
});
assert(
  stateApproach.currentLOD === 1 && stateApproach.isDetailedVisible,
  "Entering detail range activates high-detail particle model",
);

// Distance 3: Hysteresis check -> camera pulls back to intermediate distance where projected pixels
// is below enterHighDetailPixels (48) but above exitHighDetailPixels (28)
// Distance ~900,000 ly produces ~36px
fakeCamera.position.set(0, 0, 900_000);
const stateHysteresis = lodManager.evaluate("test_galaxy", fakeCamera, objectCenter, {
  objectRadiusLy: galaxyRadius,
  enterHighDetailPixels: 48,
  exitHighDetailPixels: 28,
  transitionPixelRange: 32,
});
assert(
  stateHysteresis.currentLOD === 1,
  "Symmetric hysteresis prevents LOD flipping in intermediate boundary band",
  `Current LOD: ${stateHysteresis.currentLOD}`,
);

// Distance 4: Pulling far back past exit threshold (> 12,000,000 ly, < 28px)
fakeCamera.position.set(0, 0, 15_000_000);
const stateExit = lodManager.evaluate("test_galaxy", fakeCamera, objectCenter, {
  objectRadiusLy: galaxyRadius,
  enterHighDetailPixels: 48,
  exitHighDetailPixels: 28,
  transitionPixelRange: 32,
});
assert(
  stateExit.currentLOD === 0,
  "Departing past exit threshold reverts safely to low-detail impostor",
);

console.log("\n=======================================================");
console.log(`TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log("=======================================================\n");

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
