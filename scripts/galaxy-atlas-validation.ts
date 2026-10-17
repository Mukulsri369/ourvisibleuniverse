/**
 * NASA/IPAC Extragalactic Database (NED) & Cosmological Atlas Validation Suite
 *
 * Grounded in:
 * - NASA/IPAC Extragalactic Database (NED)
 * - Planck Collaboration VI (2020) Cosmological Parameters
 * - Freedman et al. (2001) Final HST Key Project Results
 * - Pietrzyński et al. (2019) LMC Eclipsing Binary Distance Benchmark (Nature 567, 200)
 * - Carniani et al. (2024) JADES-GS-z14-0 Cosmic Dawn Discovery (arXiv:2405.21051)
 */

import {
  COSMOLOGY_MODELS,
  DEFAULT_COSMOLOGY,
  calculateCosmologicalDistances,
  dimensionlessHubbleE,
  angularSizeToPhysicalDiameterLy,
} from "../src/lib/astronomy/cosmology";
import {
  OBSERVATIONAL_GALAXIES,
  GALAXY_BY_ANY_NAME,
  searchGalaxyAtlas,
} from "../src/stars/galaxy-catalog";
import { coordinates } from "../src/lib/astronomy/coordinates";

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

function assertClose(actual: number, expected: number, relTol = 1e-3, msg: string) {
  const diff = Math.abs(actual - expected);
  const denom = Math.max(Math.abs(actual), Math.abs(expected), 1e-9);
  const relErr = diff / denom;
  if (relErr <= relTol) {
    console.log(
      `  [PASS] ${msg} (actual: ${actual.toExponential(4)}, expected: ${expected.toExponential(4)}, relErr: ${relErr.toExponential(2)})`,
    );
    passCount++;
  } else {
    console.error(
      `  [FAIL] ${msg} (actual: ${actual.toExponential(4)}, expected: ${expected.toExponential(4)}, relErr: ${relErr.toExponential(2)})`,
    );
    failCount++;
  }
}

console.log("==================================================================");
console.log("🌌 NASA/IPAC EXTRAGALACTIC DATABASE (NED) ATLAS VALIDATION SUITE");
console.log("==================================================================");

// -----------------------------------------------------------------------------
// 1. BENCHMARK LOCAL GROUP & DISTANCE LADDER CALIBRATIONS
// -----------------------------------------------------------------------------
console.log("\n1. Benchmark Local Group & Extragalactic Distance Ladder Objects:");

const m31 = GALAXY_BY_ANY_NAME.get("m31");
assert(!!m31, "Andromeda (M31) resolved from catalog");
if (m31) {
  assertClose(
    m31.distance,
    2_537_000,
    0.01,
    "M31 distance is 2.537 Mly (Freedman et al. Cepheids)",
  );
  assert(m31.redshift < 0, `M31 is blueshifted toward Milky Way (z = ${m31.redshift})`);
  assertClose(m31.radialVelocityKmS, -300.0, 0.05, "M31 radial velocity is ~ -300 km/s");
  assert(
    m31.independentDistanceMethod === "cepheid_variable",
    "M31 calibrated via Cepheid variables",
  );
  assert(m31.size >= 200_000, "M31 physical diameter is >= 200,000 ly");
}

const m33 = GALAXY_BY_ANY_NAME.get("m33");
assert(!!m33, "Triangulum (M33) resolved from catalog");
if (m33) {
  assertClose(m33.distance, 2_730_000, 0.01, "M33 distance is 2.730 Mly");
  assert(m33.redshift < 0, `M33 is blueshifted (z = ${m33.redshift})`);
  assert(m33.morphologyCategory === "spiral", "M33 is a spiral morphology");
}

const lmc = GALAXY_BY_ANY_NAME.get("lmc");
assert(!!lmc, "Large Magellanic Cloud (LMC) resolved from catalog");
if (lmc) {
  assertClose(
    lmc.distance,
    163_000,
    0.01,
    "LMC distance is 163,000 ly (Pietrzyński 2019 benchmark)",
  );
  assert(
    lmc.independentDistanceMethod === "detached_eclipsing_binaries",
    "LMC calibrated via eclipsing binaries",
  );
  assert(
    lmc.independentDistanceUncertaintyLy! <= 3_000,
    "LMC distance uncertainty is <= 3,000 ly (<2%)",
  );
}

const smc = GALAXY_BY_ANY_NAME.get("smc");
assert(!!smc, "Small Magellanic Cloud (SMC) resolved from catalog");
if (smc) {
  assertClose(smc.distance, 200_000, 0.02, "SMC distance is 200,000 ly");
}

const m51 = GALAXY_BY_ANY_NAME.get("m51");
assert(!!m51, "Whirlpool (M51) resolved from catalog");
if (m51) {
  assert(m51.distance >= 22_000_000 && m51.distance <= 25_000_000, "M51 distance is ~23.5 Mly");
  assert(
    m51.hostGroup.includes("M51 Group") || m51.hostGroup.includes("Canes"),
    "M51 host group documented",
  );
}

const m87 = GALAXY_BY_ANY_NAME.get("m87");
assert(!!m87, "Virgo A (M87) resolved from catalog");
if (m87) {
  assert(
    m87.distance >= 50_000_000 && m87.distance <= 56_000_000,
    "M87 distance is ~53.5 Mly in Virgo Cluster",
  );
  assert(m87.morphologyCategory === "elliptical", "M87 is an elliptical galaxy");
  assert(m87.hostGroup === "Virgo Cluster", "M87 host is Virgo Cluster");
}

// -----------------------------------------------------------------------------
// 2. COSMOLOGICAL DISTANCE CALCULATIONS (FLRW METRIC INVARIANTS)
// -----------------------------------------------------------------------------
console.log("\n2. Cosmological Distance Engine (Planck 2018 & Invariants):");

// Baseline Planck 2018 parameters
assertClose(DEFAULT_COSMOLOGY.h0, 67.4, 1e-4, "Planck 2018 H0 is 67.4 km/s/Mpc");
assertClose(DEFAULT_COSMOLOGY.omegaM, 0.315, 1e-4, "Planck 2018 Omega_M is 0.315");
assertClose(DEFAULT_COSMOLOGY.omegaLambda, 0.685, 1e-4, "Planck 2018 Omega_Lambda is 0.685");

// Invariant: At z = 0, E(0) ≈ 1 (within radiation density Omega_r ≈ 9e-5)
const e0 = dimensionlessHubbleE(0, DEFAULT_COSMOLOGY);
assertClose(
  e0,
  1.0,
  1e-4,
  "Dimensionless Hubble parameter at z=0 is E(0) ≈ 1.0 (with radiation Omega_r)",
);

// Test distances at z = 1.0
const cosmoZ1 = calculateCosmologicalDistances(1.0, DEFAULT_COSMOLOGY);
// Standard literature benchmark: D_C(z=1) for Planck 2018 ≈ 3.40 Gpc ≈ 11.09 Gly
assert(
  cosmoZ1.comovingDistanceLy > 10.8e9 && cosmoZ1.comovingDistanceLy < 11.4e9,
  `Comoving distance at z=1 is ~11.1 Gly (calculated: ${(cosmoZ1.comovingDistanceLy / 1e9).toFixed(3)} Gly)`,
);

// Fundamental Relativistic Cosmological Identity: D_L = (1 + z) * D_C
const expectedDlZ1 = 2.0 * cosmoZ1.comovingDistanceLy; // 1 + z = 2
assertClose(
  cosmoZ1.luminosityDistanceLy,
  expectedDlZ1,
  1e-6,
  "Identity verified: D_L = (1 + z) * D_C at z = 1.0",
);

// Fundamental Relativistic Cosmological Identity: D_A = D_C / (1 + z)
const expectedDaZ1 = cosmoZ1.comovingDistanceLy / 2.0;
assertClose(
  cosmoZ1.angularDiameterDistanceLy,
  expectedDaZ1,
  1e-6,
  "Identity verified: D_A = D_C / (1 + z) at z = 1.0",
);

// Identity: D_L = (1 + z)^2 * D_A
const ratioDlDa = cosmoZ1.luminosityDistanceLy / cosmoZ1.angularDiameterDistanceLy;
assertClose(ratioDlDa, 4.0, 1e-6, "Identity verified: D_L / D_A = (1 + z)^2 = 4.0 at z = 1.0");

// Lookback time at z = 1.0 should be ~7.8 to 8.0 Gyr
assert(
  cosmoZ1.lookbackTimeGyr >= 7.6 && cosmoZ1.lookbackTimeGyr <= 8.2,
  `Lookback time at z=1.0 is ~7.9 Gyr (calculated: ${cosmoZ1.lookbackTimeGyr.toFixed(2)} Gyr)`,
);

// High-redshift Cosmic Dawn test (JADES-GS-z14-0 at z = 14.32)
const cosmoZ14 = calculateCosmologicalDistances(14.32, DEFAULT_COSMOLOGY);
assert(
  cosmoZ14.lookbackTimeGyr > 13.4 && cosmoZ14.lookbackTimeGyr < 13.6,
  `Lookback time for JADES-GS-z14-0 (z=14.32) is ~13.5 Gyr (calculated: ${cosmoZ14.lookbackTimeGyr.toFixed(3)} Gyr)`,
);
assert(
  cosmoZ14.cosmicAgeAtEmissionGyr < 0.35 && cosmoZ14.cosmicAgeAtEmissionGyr > 0.25,
  `Cosmic age at emission for z=14.32 is ~290 Myr post-Big Bang (calculated: ${(cosmoZ14.cosmicAgeAtEmissionGyr * 1000).toFixed(0)} Myr)`,
);

// Redshift is distinguished from linear velocity: cz != D*H0 at high z
const linearHubbleLy = ((299792.458 * 14.32) / 67.4) * 3_261_563.777;
assert(
  Math.abs(linearHubbleLy - cosmoZ14.comovingDistanceLy) > 1e11,
  "Relativistic integration properly segregates from naive linear cz / H0 Hubble law",
);

// -----------------------------------------------------------------------------
// 3. CATALOG DEDUPLICATION & CROSS-IDENTIFICATION
// -----------------------------------------------------------------------------
console.log("\n3. Catalog Deduplication & Cross-Identification:");

// Cross-match test: M31, NGC 224, UGC 454
const m31ByName = GALAXY_BY_ANY_NAME.get("m31");
const m31ByNgc = GALAXY_BY_ANY_NAME.get("ngc224");
const m31ByUgc = GALAXY_BY_ANY_NAME.get("ugc00454");
assert(
  !!m31ByName && !!m31ByNgc && m31ByName.id === m31ByNgc.id,
  "M31 matches NGC 224 deduplication index",
);
assert(
  !!m31ByName && !!m31ByUgc && m31ByName.id === m31ByUgc.id,
  "M31 matches UGC 00454 deduplication index",
);

// Cross-match test: M51, NGC 5194
const m51ByName = GALAXY_BY_ANY_NAME.get("m51");
const m51ByNgc = GALAXY_BY_ANY_NAME.get("ngc5194");
assert(
  !!m51ByName && !!m51ByNgc && m51ByName.id === m51ByNgc.id,
  "M51 matches NGC 5194 deduplication index",
);

// Cross-match test: M87, Virgo A, NGC 4486
const m87ByName = GALAXY_BY_ANY_NAME.get("m87");
const m87ByVirgoA = GALAXY_BY_ANY_NAME.get("virgoa");
const m87ByNgc = GALAXY_BY_ANY_NAME.get("ngc4486");
assert(
  !!m87ByName && !!m87ByVirgoA && m87ByName.id === m87ByVirgoA.id,
  "M87 matches Virgo A deduplication index",
);
assert(
  !!m87ByName && !!m87ByNgc && m87ByName.id === m87ByNgc.id,
  "M87 matches NGC 4486 deduplication index",
);

// -----------------------------------------------------------------------------
// 4. COORDINATE REFERENCE SYSTEMS & SPATIAL INVARIANTS
// -----------------------------------------------------------------------------
console.log("\n4. Coordinate Systems & Sky Positions:");

// Test ICRS to Galactic conversion for M31
const m31Gal = coordinates.icrsToGalactic(10.6847, 41.26875);
assertClose(m31Gal.l, 121.2, 0.01, "M31 galactic longitude l ≈ 121.2°");
assertClose(m31Gal.b, -21.6, 0.01, "M31 galactic latitude b ≈ -21.6°");

// Test 3D Cartesian norm preservation
const m31Cart = coordinates.sphericalToCartesian(m31Gal.l, m31Gal.b, 2_537_000);
const rCart = Math.sqrt(m31Cart.x * m31Cart.x + m31Cart.y * m31Cart.y + m31Cart.z * m31Cart.z);
assertClose(
  rCart,
  2_537_000,
  1e-9,
  "Cartesian 3D Euclidean norm preserves 2.537 Mly distance exactly",
);

// Zone of Avoidance test: Canis Major Dwarf is at b = -8.0° (inside |b| < 10°)
const cma = GALAXY_BY_ANY_NAME.get("canis major dwarf");
if (cma) {
  assert(
    Math.abs(cma.b) < 10,
    `Canis Major dwarf lies within the Zone of Avoidance (|b| = ${Math.abs(cma.b).toFixed(1)}° < 10°)`,
  );
}

// -----------------------------------------------------------------------------
// 5. MULTI-CRITERIA SEARCH FUNCTIONALITY
// -----------------------------------------------------------------------------
console.log("\n5. Multi-Criteria Galaxy Search Engine:");

// Search by Constellation
const virgoGalaxies = searchGalaxyAtlas({ constellation: "Virgo" });
assert(virgoGalaxies.length >= 3, `Found ${virgoGalaxies.length} galaxies in constellation Virgo`);

// Search by Morphology Category
const spiralGalaxies = searchGalaxyAtlas({ morphologyCategory: "spiral" });
assert(spiralGalaxies.length >= 5, `Found ${spiralGalaxies.length} spiral galaxies`);

// Search by Host Group
const localGroupMembers = searchGalaxyAtlas({ hostGroup: "Local Group" });
assert(localGroupMembers.length >= 8, `Found ${localGroupMembers.length} Local Group members`);

// Search by Redshift Range (high-z: z > 5)
const highZGalaxies = searchGalaxyAtlas({ minZ: 5.0 });
assert(highZGalaxies.length >= 2, `Found ${highZGalaxies.length} high-z galaxies (z > 5)`);

// -----------------------------------------------------------------------------
// 6. HIERARCHICAL RENDERING CONSTITUTION & SCIENTIFIC ETHICS
// -----------------------------------------------------------------------------
console.log("\n6. Hierarchical Rendering & Scientific Discipline:");

// High-z galaxies must be Level 1 and NOT have fake 3D spiral arms
const jades = GALAXY_BY_ANY_NAME.get("jades-gs-z14-0");
assert(
  !!jades && jades.renderLevel === 1,
  "JADES-GS-z14-0 is assigned Level 1 (Point Sprite only)",
);
assert(
  !!jades && !jades.isDetailedReconstruction,
  "JADES-GS-z14-0 has no invented 3D reconstruction",
);

const hudf = GALAXY_BY_ANY_NAME.get("hudf-jd2");
assert(!!hudf && hudf.renderLevel === 1, "HUDF-JD2 is assigned Level 1 (Point Sprite only)");

// Reconstructed models must be explicitly labelled
for (const g of OBSERVATIONAL_GALAXIES) {
  if (g.isDetailedReconstruction) {
    assert(g.renderLevel === 4, `Reconstruction ${g.name} is classified as Level 4`);
  }
}

console.log("==================================================================");
console.log(`TOTAL VALIDATION CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log("==================================================================");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("🌟 ALL EXTRAGALACTIC ATLAS & COSMOLOGY TESTS PASSED WITH 100% SUCCESS!");
}
