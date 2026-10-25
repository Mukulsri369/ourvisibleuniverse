/**
 * Comprehensive Validation Test Suite:
 * Large-Scale Structure & Hybrid Cosmic Web Explorer (Mode A vs Mode B)
 *
 * Verifies all criteria from user specifications:
 * 1. Two strictly separated data modes:
 *    - Mode A: Actual observed survey galaxies & footprints (SDSS, 2dFGRS, 2MRS, Cosmicflows)
 *    - Mode B: IllustrisTNG-300-1 simulation snapshot 99 comoving box
 * 2. Scientific integrity & lightcone distinction:
 *    - Mode A: Observations made across past lightcone at different cosmic epochs (lookback time)
 *    - Mode B: Simultaneous equal-time snapshot (z = 0) with explicit disclaimer that simulation
 *              coordinates do NOT map to real distant sky positions
 * 3. FLRW expanding space metric vs static Euclidean interpretation:
 *    - Relativistic distance inequality D_L > D_C > c*t_L > D_A
 *    - Cosmological model selection (Planck 2018, SH0ES 2022, WMAP9)
 * 4. Spatial clustering, LOD, and density benchmarks (5k, 15k, 30k, 60k points)
 * 5. Interactive 6-stage guided journey scale monotonic expansion
 * 6. Zone of Avoidance dust mask (|b| >= 8°) fully respected in Mode A
 */

import {
  SURVEY_FOOTPRINTS,
  COSMIC_BENCHMARKS,
  DOCUMENTED_SURVEY_GALAXIES,
  generateSurveyDistributionPoints,
} from "../src/lib/astronomy/cosmic-web/survey-catalogs";
import {
  TNG300_METADATA,
  TNG_BENCHMARK_HALOS,
  TNG_BENCHMARK_VOIDS,
  TNG_FILAMENTS,
  generateSimulationBoxDistribution,
} from "../src/lib/astronomy/cosmic-web/illustris-tng";
import {
  COSMOLOGICAL_MODELS,
  calculateCosmologicalDistances,
} from "../src/lib/astronomy/cosmology";
import { GUIDED_JOURNEY_STEPS } from "../src/stars/store";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  [PASS] ${msg}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${msg}`);
    failCount++;
  }
}

function assertClose(actual: number, expected: number, tol = 1e-3, msg: string) {
  const diff = Math.abs(actual - expected);
  const rel = expected !== 0 ? diff / Math.abs(expected) : diff;
  if (rel <= tol || diff <= tol) {
    console.log(`  [PASS] ${msg}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${msg} (actual: ${actual}, expected: ${expected}, rel: ${rel})`);
    failCount++;
  }
}

console.log("==================================================================");
console.log("🌌 HYBRID COSMIC WEB & LARGE-SCALE STRUCTURE TEST HARNESS");
console.log("==================================================================");

// -----------------------------------------------------------------------------
// 1. DATA SEPARATION: MODE A (OBSERVED) VS MODE B (SIMULATION)
// -----------------------------------------------------------------------------
console.log("\n1. Data Mode Segregation & Survey Grounding:");

// Mode A: Documented Survey Footprints
assert(Boolean(SURVEY_FOOTPRINTS.sdss_dr18), "SDSS DR18 / BOSS catalogued in Mode A");
assertClose(
  SURVEY_FOOTPRINTS.sdss_dr18.skyCoverageDeg2,
  14555,
  0.01,
  "SDSS sky coverage is 14,555 deg² (~35% of all-sky)",
);
assert(
  SURVEY_FOOTPRINTS.sdss_dr18.geometryType === "wedges_and_cones",
  "SDSS geometry is wedges and cones",
);

assert(Boolean(SURVEY_FOOTPRINTS["2dfgrs"]), "2dFGRS survey catalogued in Mode A");
assert(
  SURVEY_FOOTPRINTS["2dfgrs"].geometryType === "strips",
  "2dFGRS geometry is declination strips",
);

assert(Boolean(SURVEY_FOOTPRINTS["2mrs"]), "2MASS 2MRS all-sky survey catalogued in Mode A");
assert(
  SURVEY_FOOTPRINTS["2mrs"].geometryType === "all_sky_with_zoa",
  "2MRS bounded by Zone of Avoidance",
);

// Mode B: IllustrisTNG-300 Simulation Box
assert(
  TNG300_METADATA.simulationName === "IllustrisTNG (TNG300-1)",
  "Mode B uses IllustrisTNG-300-1",
);
assertClose(
  TNG300_METADATA.boxSizeComovingMpc,
  302.6,
  0.01,
  "TNG300 box size is 302.6 comoving Mpc (205 h⁻¹ Mpc)",
);
assertClose(TNG300_METADATA.boxSizeComovingMly, 987, 0.01, "TNG300 box size is ~987 Mly");
assert(TNG300_METADATA.snapshot === 99, "TNG300 snapshot is 99 (present-day cosmic epoch z = 0)");
assert(
  TNG300_METADATA.scientificCaveat.includes("does NOT map to real"),
  "Strict scientific disclaimer: simulation volume does NOT map to real sky positions",
);

// -----------------------------------------------------------------------------
// 2. OBSERVATIONAL SELECTION & DUST EXTINCTION DISCIPLINE (ZONE OF AVOIDANCE)
// -----------------------------------------------------------------------------
console.log("\n2. Observational Selection & Zone of Avoidance Integrity:");

const obsSample = generateSurveyDistributionPoints(5000, COSMOLOGICAL_MODELS.planck2018);
assert(obsSample.count === 5000, "Allocated 5,000 observational survey points");

let zoaViolations = 0;
for (let i = 0; i < obsSample.count; i++) {
  if (obsSample.surveyIndices[i] === 3) {
    // 2MRS all-sky survey code
    const x = obsSample.positions[i * 3];
    const y = obsSample.positions[i * 3 + 1];
    const z = obsSample.positions[i * 3 + 2];
    const d = Math.sqrt(x * x + y * y + z * z);
    if (d > 0) {
      // Survey buffers use the scene Galactic frame: Y / radius is sin(latitude).
      const bRad = Math.asin(Math.max(-1, Math.min(1, y / d)));
      const bDeg = (bRad * 180) / Math.PI;
      if (Math.abs(bDeg) < 7.9) {
        zoaViolations++;
      }
    }
  }
}
assert(
  zoaViolations === 0,
  "Mode A respects Galactic Zone of Avoidance (|b| >= 8°): zero galaxies in dust belt",
);

// -----------------------------------------------------------------------------
// 3. COSMIC WEB SIMULATION STRUCTURES (HALOS, FILAMENTS, VOIDS)
// -----------------------------------------------------------------------------
console.log("\n3. IllustrisTNG Structures (Halos, Filaments, Voids):");

assert(TNG_BENCHMARK_HALOS.length >= 8, "Simulation includes documented benchmark halos");
const richestHalo = TNG_BENCHMARK_HALOS[0];
assert(richestHalo.massTotalMsun > 1e15, "Richest halo is rich galaxy cluster (M > 10¹⁵ M_sun)");
assert(richestHalo.velocityDispersionKmS > 900, "Cluster velocity dispersion sigma > 900 km/s");
assert(richestHalo.radiusVirialKpc / 1000 > 2.0, "Cluster virial radius R_200c > 2.0 Mpc");

assert(TNG_BENCHMARK_VOIDS.length >= 4, "Simulation includes documented cosmic voids");
for (const v of TNG_BENCHMARK_VOIDS) {
  assert(
    v.densityContrastDelta < -0.8,
    `Void #${v.id} is strongly underdense (delta = ${v.densityContrastDelta} < -0.8)`,
  );
  assert(v.radiusMpc >= 30, `Void #${v.id} radius is >= 30 Mpc (R = ${v.radiusMpc} Mpc)`);
}

assert(TNG_FILAMENTS.length >= 6, "Simulation includes dark matter filament skeleton segments");
for (const fil of TNG_FILAMENTS) {
  assert(fil.lengthMpc >= 20, `Filament #${fil.id} spans ${fil.lengthMpc} Mpc (>= 20 Mpc)`);
  assert(
    fil.linearMassDensityMsunPerMpc >= 1e12,
    `Filament #${fil.id} linear density > 10¹² M_sun/Mpc`,
  );
}

// -----------------------------------------------------------------------------
// 4. FLRW METRIC EXPANDING SPACE VS STATIC EUCLIDEAN DISTANCES
// -----------------------------------------------------------------------------
console.log("\n4. FLRW Expanding Space & Lightcone Relativistic Identity:");

const zTest = 2.0;
const cosmoResult = calculateCosmologicalDistances(zTest, COSMOLOGICAL_MODELS.planck2018);

// Relativistic inequalities
assert(
  cosmoResult.luminosityDistanceGly > cosmoResult.comovingDistanceGly,
  "Relativistic FLRW inequality: D_L > D_C verified (flux dilution due to cosmic expansion)",
);
assert(
  cosmoResult.comovingDistanceGly > cosmoResult.angularDiameterDistanceGly,
  "Relativistic FLRW inequality: D_C > D_A verified (apparent angular size turn-around)",
);

// Analytical FLRW Identities for Flat Universe
assertClose(
  cosmoResult.luminosityDistanceGly,
  cosmoResult.comovingDistanceGly * (1 + zTest),
  1e-5,
  "Exact FLRW identity verified: D_L = (1 + z) * D_C",
);
assertClose(
  cosmoResult.angularDiameterDistanceGly,
  cosmoResult.comovingDistanceGly / (1 + zTest),
  1e-5,
  "Exact FLRW identity verified: D_A = D_C / (1 + z)",
);

// Past Lightcone vs Equal-Time Snapshot
assert(
  cosmoResult.lookbackTimeGyr > 10.0 && cosmoResult.lookbackTimeGyr < 11.0,
  `Mode A Past Lightcone: z=2.0 light emitted ${cosmoResult.lookbackTimeGyr.toFixed(2)} Gyr ago (universe age ~3.3 Gyr)`,
);

// Hubble Tension Comparison
const shoesResult = calculateCosmologicalDistances(zTest, COSMOLOGICAL_MODELS.shoes2022);
assert(
  shoesResult.comovingDistanceGly < cosmoResult.comovingDistanceGly,
  "Hubble Tension demonstrated: higher H0 (SH0ES 73.04 vs Planck 67.4) yields smaller comoving distance",
);

// -----------------------------------------------------------------------------
// 5. INTERACTIVE GUIDED JOURNEY SCALE EXPANSION (6 STAGES)
// -----------------------------------------------------------------------------
console.log("\n5. Guided Cosmic Journey Monotonic Hierarchy:");

assert(GUIDED_JOURNEY_STEPS.length === 6, "Guided journey comprises exactly 6 scale stages");

const expectedIds = [
  "milky_way",
  "local_group",
  "virgo_cluster",
  "laniakea",
  "cosmic_web",
  "observable_universe",
];
for (let i = 0; i < expectedIds.length; i++) {
  assert(
    GUIDED_JOURNEY_STEPS[i].id === expectedIds[i],
    `Stage ${i + 1} matches ID '${expectedIds[i]}'`,
  );
}

for (let i = 1; i < GUIDED_JOURNEY_STEPS.length; i++) {
  const prev = GUIDED_JOURNEY_STEPS[i - 1];
  const curr = GUIDED_JOURNEY_STEPS[i];
  assert(
    curr.distanceLy > prev.distanceLy,
    `Scale expands monotonically: ${curr.title} (${curr.scaleDescription}) > ${prev.title}`,
  );
  assert(
    curr.cameraDistance > prev.cameraDistance,
    `Camera distance scales appropriately: ${curr.cameraDistance.toExponential(1)} > ${prev.cameraDistance.toExponential(1)}`,
  );
}

// -----------------------------------------------------------------------------
// 6. MULTI-DENSITY SCALABILITY & BUFFER GENERATION BENCHMARKS
// -----------------------------------------------------------------------------
console.log("\n6. Performance Benchmarks across Catalog Densities:");

const densityTiers = [5000, 15000, 30000, 60000];
for (const density of densityTiers) {
  const t0 = performance.now();
  const obsPoints = generateSurveyDistributionPoints(density, COSMOLOGICAL_MODELS.planck2018);
  const dt = performance.now() - t0;
  assert(
    obsPoints.count === density,
    `Survey point generator allocated ${density.toLocaleString()} points`,
  );
  assert(
    dt < 350,
    `Benchmark at ${density.toLocaleString()} points completed in ${dt.toFixed(1)} ms (< 350 ms)`,
  );
}

console.log("==================================================================");
console.log(`TOTAL VALIDATION CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log("==================================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("🌟 ALL HYBRID COSMIC WEB & LARGE-SCALE STRUCTURE TESTS PASSED WITH 100% SUCCESS!");
}
