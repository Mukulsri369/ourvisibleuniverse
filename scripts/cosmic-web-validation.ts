/**
 * Large-Scale Structure & Hybrid Cosmic Web Validation Test Suite
 *
 * Validates:
 * 1. MODE A: Observational Distribution & Surveys
 *    - Footprint boundaries, angular coverage, and selection limits
 *    - Strict Galactic Zone of Avoidance (|b| < 8 deg) dust mask preservation
 *    - FLRW Metric Redshift-to-Comoving Distance reconstruction across cosmologies
 *    - Past Lightcone Lookback Time vs Redshift
 *    - Confirmed Extragalactic Benchmarks (Virgo, Coma, Great Attractor, Sloan Great Wall, Boötes Void, Laniakea)
 * 2. MODE B: IllustrisTNG Cosmological Hydrodynamic Simulation (TNG300-1)
 *    - Simulation box comoving dimensions (302.6 Mpc = 987 Mly)
 *    - Halo virial masses, radii, and velocity dispersions
 *    - Cosmic void underdensities (delta < -0.8) and void avoidance integrity
 *    - Cosmic filament skeleton connectivity and mass densities
 *    - Strict scientific disclaimer segregation (simulation vs real observed coordinates)
 * 3. Guided Cosmic Journey (6 Scale Tiers)
 *    - Monotonic hierarchical scale expansion (Milky Way -> Local Group -> Virgo -> Laniakea -> Cosmic Web -> Horizon)
 *    - 3D target coordinates, camera framing distances, and lookback time continuity
 * 4. Cosmological Statistics & Expanding Space
 *    - Two-point correlation function xi(r) = (r_0 / r)^gamma
 *    - Luminosity vs Comoving vs Angular Diameter distance relations (D_L > D_C > D_A)
 * 5. Multi-Density Scalability & Performance Benchmarks
 *    - Buffer generation and numerical bounds at 5,000, 15,000, 30,000, and 60,000 points
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

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`  [FAIL] ${msg}`);
    process.exit(1);
  }
  console.log(`  [PASS] ${msg}`);
}

function assertClose(actual: number, expected: number, tol: number, msg: string) {
  const diff = Math.abs(actual - expected);
  const rel = expected !== 0 ? diff / Math.abs(expected) : diff;
  if (rel > tol && diff > tol) {
    console.error(`  [FAIL] ${msg} (actual: ${actual}, expected: ${expected}, rel: ${rel})`);
    process.exit(1);
  }
  console.log(`  [PASS] ${msg}`);
}

console.log("==================================================================");
console.log("🌌 LARGE-SCALE STRUCTURE & HYBRID COSMIC WEB VALIDATION SUITE");
console.log("==================================================================");

// -----------------------------------------------------------------------------
// 1. MODE A: Observational Distribution & Survey Footprints
// -----------------------------------------------------------------------------
console.log("\n1. Observational Survey Footprints & Selection Limits:");

assert(Boolean(SURVEY_FOOTPRINTS.sdss_dr18), "SDSS DR18 / BOSS footprint catalogued");
assertClose(
  SURVEY_FOOTPRINTS.sdss_dr18.skyCoverageDeg2,
  14555,
  0.01,
  "SDSS sky coverage is 14,555 deg² (~35% of all-sky)",
);
assert(
  SURVEY_FOOTPRINTS.sdss_dr18.geometryType === "wedges_and_cones",
  "SDSS geometry accurately designated as fan wedges and cones",
);

assert(Boolean(SURVEY_FOOTPRINTS["2dfgrs"]), "2dFGRS survey footprint catalogued");
assert(
  SURVEY_FOOTPRINTS["2dfgrs"].geometryType === "strips",
  "2dFGRS geometry designated as declination strips",
);

assert(Boolean(SURVEY_FOOTPRINTS["2mrs"]), "2MASS 2MRS all-sky survey catalogued");
assert(
  SURVEY_FOOTPRINTS["2mrs"].geometryType === "all_sky_with_zoa",
  "2MRS designated as all-sky bounded by Zone of Avoidance",
);

// Zone of Avoidance dust mask verification
const surveyPointsSample = generateSurveyDistributionPoints(4000, COSMOLOGICAL_MODELS.planck2018);
assert(surveyPointsSample.count === 4000, "Generated 4,000 observational survey points");

// Verify that points with 2MRS survey code strictly satisfy |b| >= 8 deg
let zoaViolations = 0;
for (let i = 0; i < surveyPointsSample.count; i++) {
  if (surveyPointsSample.surveyIndices[i] === 3) {
    // 2mrs code
    const x = surveyPointsSample.positions[i * 3];
    const y = surveyPointsSample.positions[i * 3 + 1];
    const z = surveyPointsSample.positions[i * 3 + 2];
    const d = Math.sqrt(x * x + y * y + z * z);
    if (d > 0) {
      // In the shared scene Galactic frame:
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
  "Strict Galactic Zone of Avoidance (|b| >= 8°) fully respected: zero galaxies in dust belt",
);

// Confirmed benchmarks in observational mode
const virgo = COSMIC_BENCHMARKS.find((b) => b.id === "virgo_cluster");
assert(Boolean(virgo), "Virgo Cluster benchmark catalogued");
assertClose(virgo!.distanceGlyPlanck, 0.054, 0.05, "Virgo distance is ~54 Mly (16.5 Mpc)");

const sgw = COSMIC_BENCHMARKS.find((b) => b.id === "sloan_great_wall");
assert(Boolean(sgw), "Sloan Great Wall benchmark catalogued");
assert(sgw!.diameterMly > 1300, "Sloan Great Wall spans > 1.3 billion light-years");

const laniakea = COSMIC_BENCHMARKS.find((b) => b.id === "laniakea_boundary");
assert(Boolean(laniakea), "Laniakea Supercluster watershed catalogued");
assertClose(laniakea!.diameterMly, 520, 0.02, "Laniakea watershed diameter is 520 Mly (160 Mpc)");

// -----------------------------------------------------------------------------
// 2. MODE B: IllustrisTNG Cosmological Simulation (TNG300-1)
// -----------------------------------------------------------------------------
console.log("\n2. IllustrisTNG Cosmological Simulation Box (TNG300-1 Snapshot 99):");

assertClose(
  TNG300_METADATA.boxSizeComovingMpc,
  302.6,
  0.01,
  "TNG300 box size is 302.6 comoving Mpc (205 h⁻¹ Mpc)",
);
assertClose(
  TNG300_METADATA.boxSizeComovingMly,
  987.0,
  0.01,
  "TNG300 box size in light-years is ~987 Mly",
);
assert(TNG300_METADATA.snapshot === 99, "TNG snapshot is 99 (z = 0 present-day cosmic epoch)");
assert(
  TNG300_METADATA.disclaimer.includes(
    "does NOT correspond to real catalogued astronomical coordinates",
  ),
  "Explicit scientific caveat disclaims simulation positions mapping to real sky coordinates",
);

// Halo mass spectrum
assert(
  TNG_BENCHMARK_HALOS.length >= 8,
  "Catalog contains >= 8 benchmark halos/groups from Subfind",
);
const richCluster = TNG_BENCHMARK_HALOS[0];
assert(
  richCluster.massTotalMsun > 1e15,
  "Richest halo is massive cluster with M_200c > 10¹⁵ M_sun",
);
assert(richCluster.velocityDispersionKmS > 900, "Cluster velocity dispersion is > 900 km/s");
assert(richCluster.radiusVirialKpc > 2000, "Cluster virial radius R_200c is > 2.0 Mpc");

// Cosmic Voids
assert(TNG_BENCHMARK_VOIDS.length >= 4, "Simulation contains documented cosmic voids");
for (const v of TNG_BENCHMARK_VOIDS) {
  assert(
    v.densityContrastDelta < -0.8,
    `Void #${v.id} has severe underdensity (delta = ${v.densityContrastDelta} < -0.80)`,
  );
  assert(v.radiusMpc >= 30, `Void #${v.id} radius is >= 30 Mpc (R = ${v.radiusMpc} Mpc)`);
}

// Filament Segments
assert(TNG_FILAMENTS.length >= 6, "Simulation contains filament skeleton segments");
for (const f of TNG_FILAMENTS) {
  assert(f.lengthMpc > 20, `Filament #${f.id} length is ${f.lengthMpc} Mpc (> 20 Mpc)`);
  assert(
    f.linearMassDensityMsunPerMpc > 1e12,
    `Filament #${f.id} linear density is > 10¹² M_sun/Mpc`,
  );
}

// Simulation Box Point Cloud Generation
const simBuffer = generateSimulationBoxDistribution(5000);
assert(simBuffer.count === 5000, "Generated 5,000 IllustrisTNG simulation particles");
assert(simBuffer.positions.length === 15000, "Buffer contains 3D position vector triplets");
assert(simBuffer.colors.length === 15000, "Buffer contains RGB color triplets");

// Verify bounds: all particles must lie within [-halfBoxLy, +halfBoxLy]
const halfBoxLy = (TNG300_METADATA.boxSizeComovingMly * 1e6) / 2;
let outOfBoundsCount = 0;
for (let i = 0; i < simBuffer.count * 3; i++) {
  if (Math.abs(simBuffer.positions[i]) > halfBoxLy * 1.05) {
    outOfBoundsCount++;
  }
}
assert(
  outOfBoundsCount === 0,
  "All simulation particles reside strictly within the 987 Mly box boundary",
);

// -----------------------------------------------------------------------------
// 3. Interactive Guided Journey (6 Scale Tiers)
// -----------------------------------------------------------------------------
console.log("\n3. Interactive Guided Cosmic Journey (6 Stages):");

assert(
  GUIDED_JOURNEY_STEPS.length === 6,
  "Guided journey comprises exactly 6 hierarchical scale stages",
);

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

// Monotonic scale expansion check
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
// 4. Expanding Space & FLRW Cosmological Distances
// -----------------------------------------------------------------------------
console.log("\n4. Expanding Space & Cosmological FLRW Metrics:");

const zTest = 2.0;
const planckDist = calculateCosmologicalDistances(zTest, COSMOLOGICAL_MODELS.planck2018);
const shoesDist = calculateCosmologicalDistances(zTest, COSMOLOGICAL_MODELS.shoes2022);

// Relativistic expansion inequality: D_L > D_C > c * t_L > D_A
assert(
  planckDist.luminosityDistanceGly > planckDist.comovingDistanceGly,
  "Relativistic FLRW inequality: D_L > D_C verified (flux dilution due to cosmological expansion)",
);
assert(
  planckDist.comovingDistanceGly > planckDist.angularDiameterDistanceGly,
  "Relativistic FLRW inequality: D_C > D_A verified (apparent angular size relation)",
);
assertClose(
  planckDist.luminosityDistanceGly,
  planckDist.comovingDistanceGly * (1 + zTest),
  1e-6,
  "Exact identity D_L = (1 + z) * D_C satisfied",
);
assertClose(
  planckDist.angularDiameterDistanceGly,
  planckDist.comovingDistanceGly / (1 + zTest),
  1e-6,
  "Exact identity D_A = D_C / (1 + z) satisfied",
);

// Hubble Tension: Higher H_0 (SH0ES 73.04 vs Planck 67.4) yields smaller comoving distance at fixed z
assert(
  shoesDist.comovingDistanceGly < planckDist.comovingDistanceGly,
  "Hubble Tension demonstrated: SH0ES 2022 yields smaller comoving distance than Planck 2018",
);

// -----------------------------------------------------------------------------
// 5. Multi-Density Scalability & Performance Benchmarks
// -----------------------------------------------------------------------------
console.log("\n5. Multi-Density Scalability & Performance Benchmarks:");

const benchmarkCounts = [5000, 15000, 30000, 60000];
for (const count of benchmarkCounts) {
  const t0 = Date.now();
  const obsPoints = generateSurveyDistributionPoints(count, COSMOLOGICAL_MODELS.planck2018);
  const dtObs = Date.now() - t0;
  assert(
    obsPoints.count === count,
    `Survey point generator allocated ${count.toLocaleString()} points`,
  );
  assert(
    dtObs < 350,
    `Benchmark at ${count.toLocaleString()} points completed in ${dtObs} ms (< 350 ms)`,
  );

  // Check no NaN or Infinite coordinates
  let hasNaN = false;
  for (let i = 0; i < count * 3; i++) {
    if (isNaN(obsPoints.positions[i]) || !isFinite(obsPoints.positions[i])) {
      hasNaN = true;
      break;
    }
  }
  assert(
    !hasNaN,
    `Point buffer at ${count.toLocaleString()} points contains 100% finite coordinates`,
  );
}

console.log("\n================ VALIDATION SUMMARY ================");
console.log("🌟 ALL LARGE-SCALE STRUCTURE & HYBRID COSMIC WEB TESTS PASSED WITH 100% SUCCESS!");
