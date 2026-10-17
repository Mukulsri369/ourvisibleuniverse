/**
 * Extragalactic Atlas, Cosmology & NED TAP Validation Test Harness
 *
 * Validates:
 * 1. Benchmark Galaxy Positions & Distances (Andromeda, Triangulum, LMC, SMC, M81, M87, Centaurus A, JADES-GS-z14-0)
 * 2. Cross-Identification & Deduplication across Messier, NGC, UGC, PGC, and colloquial aliases
 * 3. FLRW Cosmological Distance Metrics:
 *    - Comoving Distance (D_C)
 *    - Lookback Time (t_L)
 *    - Luminosity Distance (D_L)
 *    - Angular Diameter Distance (D_A)
 *    - Relativistic expansion inequality (D_L > D_C > c*t_L > D_A for high z)
 * 4. Multi-dimensional Atlas Search (by name, type, distance tier, redshift, morphology, group, source)
 * 5. Scientific Integrity Policy (no invented planets for unresolved galaxies; no universal catalog completeness claimed)
 */

import {
  OBSERVATIONAL_GALAXY_CATALOG,
  getGalaxyByAnyName,
  searchObservationalAtlas,
  deduplicateGalaxies,
} from "../src/stars/galaxy-catalog";
import {
  calculateCosmologicalDistances,
  COSMOLOGICAL_MODELS,
} from "../src/lib/astronomy/cosmology";
import { GALAXY_BY_NAME } from "../src/stars/galaxy-models";

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
console.log("🌌 EXTRAGALACTIC ATLAS & OBSERVATIONAL COSMOLOGY TEST SUITE");
console.log("==================================================================");

// -----------------------------------------------------------------------------
// 1. Benchmark Galaxy Positions & Distances
// -----------------------------------------------------------------------------
console.log("\n1. Extragalactic Benchmark Positions & Distances:");

// Andromeda M31
const m31 = getGalaxyByAnyName("Andromeda (M31)");
assert(Boolean(m31), "Andromeda Galaxy present in catalog");
assertClose(
  m31!.distance,
  2_537_000,
  1e-4,
  "M31 distance is 2.537 Mly (Freedman et al. Cepheid benchmark)",
);
assertClose(m31!.ra, 10.6847, 0.01, "M31 RA is ~10.68° (ICRS J2000)");
assertClose(m31!.dec, 41.2687, 0.01, "M31 Dec is +41.27°");
assert(m31!.redshift < 0, "M31 has negative redshift (blueshifted approaching Milky Way)");
assertClose(m31!.radialVelocityKmS!, -300, 5, "M31 radial velocity is -300 km/s");

// Triangulum M33
const m33 = getGalaxyByAnyName("Triangulum (M33)");
assert(Boolean(m33), "Triangulum Galaxy present in catalog");
assertClose(m33!.distance, 2_730_000, 1e-4, "M33 distance is 2.730 Mly");
assert(m33!.redshift < 0, "M33 has negative redshift");

// Large Magellanic Cloud
const lmc = getGalaxyByAnyName("Large Magellanic Cloud");
assert(Boolean(lmc), "LMC present in catalog");
assertClose(
  lmc!.distance,
  163_000,
  1e-4,
  "LMC distance is 163,000 ly (Pietrzyński 2019 benchmark)",
);
assert(lmc!.morphologyClass.includes("SB"), "LMC classified as Barred Irregular (SBm)");

// Small Magellanic Cloud
const smc = getGalaxyByAnyName("Small Magellanic Cloud");
assert(Boolean(smc), "SMC present in catalog");
assertClose(smc!.distance, 200_000, 1e-3, "SMC distance is 200,000 ly");

// M87 Virgo A
const m87 = getGalaxyByAnyName("M87 (Virgo A)");
assert(Boolean(m87), "M87 present in catalog");
assertClose(m87!.distance, 53_000_000, 0.05, "M87 distance is ~53 Mly (Virgo Cluster core)");
assert(m87!.hostGroup?.includes("Virgo"), "M87 linked to Virgo Cluster");

// JADES-GS-z14-0 Cosmic Dawn Record
const z14 = getGalaxyByAnyName("JADES-GS-z14-0");
assert(Boolean(z14), "JWST Cosmic Dawn record galaxy JADES-GS-z14-0 present");
assertClose(z14!.redshift, 14.32, 0.01, "JADES-GS-z14-0 has confirmed redshift z = 14.32");

// -----------------------------------------------------------------------------
// 2. Cross-Identification & Deduplication
// -----------------------------------------------------------------------------
console.log("\n2. Cross-Identification & Deduplication:");

assert(getGalaxyByAnyName("M31")?.id === "MESSIER-031", "Alias 'M31' resolves to MESSIER-031");
assert(
  getGalaxyByAnyName("NGC 224")?.id === "MESSIER-031",
  "Alias 'NGC 224' resolves to MESSIER-031",
);
assert(
  getGalaxyByAnyName("UGC 454")?.id === "MESSIER-031",
  "Alias 'UGC 454' resolves to MESSIER-031",
);
assert(
  getGalaxyByAnyName("PGC 2557")?.id === "MESSIER-031",
  "Alias 'PGC 2557' resolves to MESSIER-031",
);

assert(
  getGalaxyByAnyName("Whirlpool Galaxy")?.id === "MESSIER-051A",
  "Colloquial 'Whirlpool Galaxy' resolves to M51",
);
assert(getGalaxyByAnyName("NGC 5194")?.id === "MESSIER-051A", "Alias 'NGC 5194' resolves to M51");
assert(
  getGalaxyByAnyName("Bode's Galaxy")?.id === "MESSIER-081",
  "Colloquial 'Bode's Galaxy' resolves to M81",
);
assert(
  getGalaxyByAnyName("Sombrero Galaxy")?.id === "MESSIER-104",
  "Colloquial 'Sombrero Galaxy' resolves to M104",
);
assert(getGalaxyByAnyName("NGC 4594")?.id === "MESSIER-104", "Alias 'NGC 4594' resolves to M104");

const dedup = deduplicateGalaxies(OBSERVATIONAL_GALAXY_CATALOG);
assert(
  dedup.length === OBSERVATIONAL_GALAXY_CATALOG.length,
  "Catalog contains 0 duplicate canonical IDs",
);

// -----------------------------------------------------------------------------
// 3. Cosmological Distance Calculations & FLRW Metrics
// -----------------------------------------------------------------------------
console.log("\n3. Cosmological Distance Calculations & FLRW Metrics:");

// Test z = 1.0 under Planck 2018
const z1 = calculateCosmologicalDistances(1.0, COSMOLOGICAL_MODELS.planck2018);
assertClose(
  z1.comovingDistanceGly,
  11.09,
  0.05,
  "Planck 2018 comoving distance at z=1.0 is ~11.1 Gly",
);
assertClose(z1.lookbackTimeGyr, 7.85, 0.05, "Planck 2018 lookback time at z=1.0 is ~7.85 Gyr");
assertClose(
  z1.luminosityDistanceGly,
  (1 + 1.0) * z1.comovingDistanceGly,
  1e-4,
  "D_L = (1+z) * D_C for flat space",
);
assertClose(
  z1.angularDiameterDistanceGly,
  z1.comovingDistanceGly / (1 + 1.0),
  1e-4,
  "D_A = D_C / (1+z) for flat space",
);

// Relativistic expansion inequality at high redshift (z = 3.0)
const z3 = calculateCosmologicalDistances(3.0, COSMOLOGICAL_MODELS.planck2018);
const cTimesLookbackGly = z3.lookbackTimeGyr; // in Gly
assert(
  z3.luminosityDistanceGly > z3.comovingDistanceGly &&
    z3.comovingDistanceGly > cTimesLookbackGly &&
    cTimesLookbackGly > z3.angularDiameterDistanceGly,
  "Relativistic inequality verified: D_L > D_C > c*t_L > D_A at z=3.0",
);

// Hubble tension comparison at z = 0.5: SH0ES (H0 = 73.04) vs Planck 2018 (H0 = 67.4)
const zPlanck = calculateCosmologicalDistances(0.5, COSMOLOGICAL_MODELS.planck2018);
const zShoes = calculateCosmologicalDistances(0.5, COSMOLOGICAL_MODELS.shoes2022);
assert(
  zShoes.comovingDistanceGly < zPlanck.comovingDistanceGly,
  "Higher Hubble constant yields smaller comoving distance at identical redshift (Hubble tension)",
);

// JADES-GS-z14-0 Cosmic Dawn: light departed when universe was < 350 Myr old
const z14Cosmo = calculateCosmologicalDistances(14.32, COSMOLOGICAL_MODELS.planck2018);
assert(z14Cosmo.lookbackTimeGyr > 13.4, "JADES-GS-z14-0 lookback time is > 13.4 Gyr");
assert(
  z14Cosmo.cosmicAgeAtRedshiftGyr < 0.35,
  "JADES-GS-z14-0 observed within first 350 Myr of cosmic time",
);

// -----------------------------------------------------------------------------
// 4. Multi-Dimensional Search
// -----------------------------------------------------------------------------
console.log("\n4. Multi-Dimensional Atlas Search:");

const spirals = searchObservationalAtlas({ type: "Spiral" });
assert(spirals.length >= 5, "Filter by type='Spiral' returns >= 5 galaxies");

const virgo = searchObservationalAtlas({ hostGroup: "Virgo Cluster" });
assert(virgo.length >= 6, "Filter by hostGroup='Virgo Cluster' returns >= 6 galaxies");

const highZList = searchObservationalAtlas({ distanceTier: "high_redshift" });
assert(
  highZList.length >= 2,
  "Filter by distanceTier='high_redshift' returns cosmic dawn benchmarks",
);

const blueshifted = searchObservationalAtlas({ redshiftRange: "blueshifted" });
assert(
  blueshifted.length >= 3,
  "Filter by redshiftRange='blueshifted' finds approaching Local Group galaxies",
);

// -----------------------------------------------------------------------------
// 5. Scientific Integrity & Model Discipline
// -----------------------------------------------------------------------------
console.log("\n5. Scientific Integrity & Model Discipline:");

// Unresolved catalog galaxies must NOT fabricate planetary systems
const unmodelled = GALAXY_BY_NAME.get("NGC 1300");
assert(Boolean(unmodelled), "NGC 1300 model present");
assert(
  unmodelled?.system === undefined,
  "Unresolved galaxy NGC 1300 does NOT fabricate speculative star systems or planets",
);

// Curated galaxies retain labelled reconstructions
const m51Model = GALAXY_BY_NAME.get("M51 (Whirlpool)");
assert(
  Boolean(m51Model?.system),
  "M51 retains labelled star system reconstruction (M51-ULS-1 candidate)",
);

console.log("\n================ VALIDATION SUMMARY ================");
console.log("ALL EXTRAGALACTIC ATLAS & COSMOLOGY TESTS PASSED WITH 100% SUCCESS!");
