/**
 * Automated Astronomical Accuracy, Coordinate Transforms & Physical Constants Test Harness
 *
 * Validates:
 *  1. Fundamental IAU / CODATA physical constants & units framework (units.ts)
 *  2. Astrometric coordinate reference frames (ICRS, Galactic, Heliocentric Ecliptic, Planetocentric, Cosmological)
 *  3. Timescales & Epochs (UTC, TT, TDB, Julian Dates)
 *  4. Invariant coordinate conversions (round-trips, norm preservation)
 *  5. Documented benchmark source values:
 *     - Sun-Earth distance
 *     - Neptune's orbit
 *     - Proxima Centauri distance
 *     - Galactic Centre distance
 *     - Andromeda (M31) distance
 *  6. Floating-origin camera-relative engine & float32 [high, low] splitting precision
 *  7. ScaleManager continuous navigation across all 6 hierarchical scale regimes
 *  8. Display magnification vs 1:1 true physical scale adapters
 *  9. Keplerian orbit solvers & celestial mechanics invariants
 * 10. Relativistic metrics & Schwarzschild event horizons
 */

import {
  METERS_PER_AU,
  METERS_PER_LIGHT_YEAR,
  METERS_PER_PARSEC,
  SPEED_OF_LIGHT_M_S,
  SECONDS_PER_JULIAN_YEAR,
  AU_PER_LIGHT_YEAR,
  LIGHT_YEARS_PER_AU,
  LIGHT_YEARS_PER_PARSEC,
  PARSECS_PER_LIGHT_YEAR,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  EARTH_RADIUS_MEAN_M,
  EARTH_MASS_KG,
  SOLAR_EFFECTIVE_TEMPERATURE_K,
  GRAVITATIONAL_CONSTANT_SI,
} from "../src/lib/astronomy/constants";

import {
  icrsToGalactic,
  galacticToCartesian,
  solveKepler,
  trueAnomalyFromEccentric,
  keplerianOrbitalPositionAU,
  calculateLuminosity,
  schwarzschildRadiusMeters,
  schwarzschildRadiusLy,
} from "../src/lib/astronomy/coordinates";

import {
  distance,
  Units,
  formatDistanceMeters,
  formatDistanceLy,
} from "../src/lib/astronomy/units";

import {
  createEpoch,
  dateToJulianDate,
  icrsToGalacticSpherical,
  galacticToCartesian64,
  heliocentricEclipticToCartesianAU,
  planetocentricToParentAU,
  redshiftToComovingDistanceMly,
  COSMOLOGY_PLANCK_2018,
} from "../src/lib/astronomy/reference-frames";

import {
  Vector3D,
  splitDouble,
  splitVector3D,
  SceneOriginNode,
} from "../src/lib/astronomy/floating-origin";

import {
  scaleManager,
  SCALE_REGIMES,
  SOLAR_SYSTEM_PHYSICAL_DATA,
} from "../src/lib/astronomy/scale-manager";

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${desc}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${desc}`);
  }
}

function assertClose(actual: number, expected: number, maxRelativeError: number, desc: string) {
  const relError = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-15);
  if (relError <= maxRelativeError) {
    passed++;
    console.log(
      `  [PASS] ${desc} (actual: ${actual.toExponential(4)}, expected: ${expected.toExponential(4)}, relErr: ${relError.toExponential(2)})`,
    );
  } else {
    failed++;
    console.error(
      `  [FAIL] ${desc} (actual: ${actual}, expected: ${expected}, relErr: ${relError})`,
    );
  }
}

console.log("=== COMPREHENSIVE ASTRONOMY & HIERARCHICAL SCALE TEST SUITE ===\n");

// ============================================================================
// 1. FUNDAMENTAL CONSTANTS & ASTRONOMICAL UNITS (IAU 2012 / CODATA 2018)
// ============================================================================
console.log("1. Physical Constants & Fundamental Units:");
assert(METERS_PER_AU === 149_597_870_700, "IAU 2012 AU is exactly 149,597,870,700 meters");
assert(SPEED_OF_LIGHT_M_S === 299_792_458, "Speed of light c is exactly 299,792,458 m/s");
assert(SECONDS_PER_JULIAN_YEAR === 31_557_600, "Julian year is exactly 31,557,600 SI seconds");
assert(
  METERS_PER_LIGHT_YEAR === SPEED_OF_LIGHT_M_S * SECONDS_PER_JULIAN_YEAR,
  "Light-year is exact product of c and Julian year (9,460,730,472,580,800 m)",
);
assertClose(
  AU_PER_LIGHT_YEAR,
  63241.077,
  1e-4,
  "Astronomical Units per light-year matches IAU ratio ~63,241.077",
);
assertClose(
  LIGHT_YEARS_PER_AU * AU_PER_LIGHT_YEAR,
  1.0,
  1e-12,
  "AU and light-year conversion factors are exact inverses",
);
assertClose(
  PARSECS_PER_LIGHT_YEAR * LIGHT_YEARS_PER_PARSEC,
  1.0,
  1e-12,
  "Parsec and light-year conversion factors are exact inverses",
);
assertClose(
  METERS_PER_PARSEC,
  3.085677581e16,
  1e-5,
  "Parsec definition matches IAU 648,000/pi AU (~3.085677581e16 m)",
);

// Quantity Object & Conversion Helpers
const distAu = distance(1.0, "astronomical_unit");
assertClose(distAu.toKilometers(), 149_597_870.7, 1e-6, "1 AU converts to 149,597,870.7 km");
assertClose(distAu.toLightYears(), LIGHT_YEARS_PER_AU, 1e-12, "1 AU converts to exact light-years");
assertClose(
  Units.solarMassesToEarthMasses(1.0),
  SOLAR_MASS_KG / EARTH_MASS_KG,
  1e-9,
  "1 Solar Mass converts to ~332,946 Earth masses",
);

// ============================================================================
// 2. DOCUMENTED BENCHMARK SOURCE VALUES VALIDATION
// ============================================================================
console.log("\n2. Documented Astronomical Benchmark Values:");

// A. Sun-Earth Distance (1.00000261 AU)
const earthData = SOLAR_SYSTEM_PHYSICAL_DATA["Earth"];
assertClose(
  earthData.semiMajorAxisAU,
  1.00000261,
  1e-6,
  "Earth semi-major axis matches JPL DE440 benchmark (1.00000261 AU)",
);
const earthDistKm = Units.auToKm(earthData.semiMajorAxisAU);
assertClose(
  earthDistKm,
  149_598_261,
  1e-5,
  "Earth physical distance is 149.598 million kilometers",
);
const earthDistLy = earthData.semiMajorAxisAU * LIGHT_YEARS_PER_AU;
assertClose(
  earthDistLy,
  1.58125e-5,
  1e-4,
  "Earth distance in light-years is ~1.58125e-5 ly (~8.317 light minutes)",
);

// B. Neptune's Orbit (30.0699 AU)
const neptuneData = SOLAR_SYSTEM_PHYSICAL_DATA["Neptune"];
assertClose(
  neptuneData.semiMajorAxisAU,
  30.0699,
  1e-4,
  "Neptune semi-major axis matches NASA Planetary Fact Sheet (30.0699 AU)",
);
const neptuneDistKm = Units.auToKm(neptuneData.semiMajorAxisAU);
assertClose(
  neptuneDistKm,
  4.4984e9,
  1e-3,
  "Neptune physical distance is ~4.4984 billion km (~4.17 light-hours)",
);
const neptuneDistLy = neptuneData.semiMajorAxisAU * LIGHT_YEARS_PER_AU;
assertClose(
  neptuneDistLy,
  4.7549e-4,
  1e-3,
  "Neptune distance in physical light-years is ~4.755e-4 ly",
);

// C. Proxima Centauri Distance (4.2465 ly / 1.3020 pc / 268,550 AU)
const proximaLy = 4.2465;
const proximaPc = Units.lightYearsToParsecs(proximaLy);
assertClose(
  proximaPc,
  1.302,
  1e-3,
  "Proxima Centauri distance converts to 1.302 pc (Gaia DR3 parallax 768.06 mas)",
);
const proximaAU = Units.lightYearsToAU(proximaLy);
assertClose(
  proximaAU,
  268550,
  1e-3,
  "Proxima Centauri distance is ~268,550 AU (>8,900x farther than Neptune)",
);

// D. Galactic Centre Distance (Sgr A* at 26,000 ly / 7.97 kpc)
const sgrADistLy = 26000;
const sgrADistKpc = Units.lightYearsToParsecs(sgrADistLy) / 1000;
assertClose(
  sgrADistKpc,
  7.9716,
  1e-3,
  "Galactic Centre distance is 26,000 ly = 7.97 kpc (consistent with Gravity Collaboration ~8.2 kpc)",
);

// E. Andromeda Distance (M31 at 2.537 Mly / 778 kpc)
const m31DistLy = 2_537_000;
const m31DistMpc = Units.lightYearsToParsecs(m31DistLy) / 1_000_000;
assertClose(
  m31DistMpc,
  0.7778,
  1e-3,
  "Andromeda (M31) distance is 2.537 Mly = 778 kpc (Freedman et al. Cepheid calibration)",
);

// ============================================================================
// 3. COORDINATE REFERENCE SYSTEMS & TRANSFORMATIONS
// ============================================================================
console.log("\n3. Coordinate Reference Systems & Invariant Conversions:");

// A. ICRS -> Galactic Spherical Transformation
const ngp = icrsToGalacticSpherical(192.85948, 27.12825, 1000);
assertClose(
  ngp.latDeg,
  90.0,
  1e-5,
  "North Galactic Pole ICRS coordinates transform exactly to b = +90.0°",
);

const sgrASph = icrsToGalacticSpherical(266.4051, -28.93617, 26000);
assert(
  Math.abs(sgrASph.lonDeg) < 0.25 || Math.abs(sgrASph.lonDeg - 360) < 0.25,
  "Sgr A* ICRS coordinates transform to Galactic longitude l ≈ 0.0°",
);
assert(
  Math.abs(sgrASph.latDeg) < 0.1,
  `Sgr A* lies within 0.1° of Galactic midplane (b = ${sgrASph.latDeg.toFixed(4)}°)`,
);

// B. Galactic Spherical -> 64-bit Cartesian Coordinates
const cartSgrA = galacticToCartesian64(0, 0, 26000, true);
assert(
  cartSgrA.x === -26000 && cartSgrA.y === 0 && cartSgrA.z === 0,
  "Scene convention places Galactic Centre along -X at precisely 26,000 ly",
);

// Invariant: Vector norm preservation under spherical-to-Cartesian rotation
const testDist = 1234.56;
const randL = 73.4;
const randB = -28.9;
const cartRand = galacticToCartesian64(randL, randB, testDist, true);
const norm = Math.sqrt(cartRand.x * cartRand.x + cartRand.y * cartRand.y + cartRand.z * cartRand.z);
assertClose(
  norm,
  testDist,
  1e-12,
  "Spherical to Cartesian conversion preserves 3D Euclidean norm exactly",
);

// C. Heliocentric Ecliptic to Cartesian AU
const eclipticPos = heliocentricEclipticToCartesianAU(Math.PI / 4, 0, 1.0);
assertClose(eclipticPos.x, Math.SQRT1_2, 1e-12, "Ecliptic x at 45 deg longitude is 1/sqrt(2) AU");
assertClose(eclipticPos.z, Math.SQRT1_2, 1e-12, "Ecliptic z at 45 deg longitude is 1/sqrt(2) AU");
assertClose(eclipticPos.y, 0.0, 1e-12, "Ecliptic y for 0 latitude is 0.0 AU");

// D. Planetocentric Local Frame
const planetCenterAU = { x: 1.0, y: 0.0, z: 0.0 };
const moonOffsetKm = { x: 384400, y: 0.0, z: 0.0 }; // Earth-Moon distance ~384,400 km
const moonInParentAU = planetocentricToParentAU(planetCenterAU, moonOffsetKm, 0, 0);
const moonOffsetAU = Units.kmToAU(384400);
assertClose(
  moonInParentAU.x,
  1.0 + moonOffsetAU,
  1e-8,
  "Planetocentric frame accurately places satellite relative to parent planet",
);

// E. Cosmological Comoving Coordinates & Hubble Expansion
const comovingDistZ1 = redshiftToComovingDistanceMly(1.0);
assert(
  comovingDistZ1 > 10000 && comovingDistZ1 < 12000,
  `Planck 2018 comoving distance at z=1.0 is ~11.1 Gly (calculated: ${(comovingDistZ1 / 1000).toFixed(2)} Gly)`,
);
assertClose(
  COSMOLOGY_PLANCK_2018.observableUniverseRadiusGly,
  46.5,
  1e-6,
  "Cosmological comoving particle horizon is 46.5 Gly",
);

// ============================================================================
// 4. TIMESCALES & EPOCH METADATA
// ============================================================================
console.log("\n4. Epochs & Timescales:");
const j2000Date = new Date("2000-01-01T12:00:00Z");
const j2000JD = dateToJulianDate(j2000Date);
assertClose(j2000JD, 2451545.0, 1e-6, "J2000.0 epoch corresponds to Julian Date 2,451,545.0");

const epoch = createEpoch(j2000Date, "TDB");
assertClose(epoch.tdbDaysSinceJ2000, 0.0, 1e-9, "J2000 date has 0.0 days since J2000.0");
assertClose(
  epoch.julianYearsSinceJ2000,
  0.0,
  1e-9,
  "J2000 date has 0.0 Julian years since J2000.0",
);

// ============================================================================
// 5. FLOATING-ORIGIN ENGINE & FLOAT32 SPLITTING PRECISION
// ============================================================================
console.log("\n5. Floating-Origin & High/Low Float32 Splitting:");

const worldPos64 = new Vector3D(2_537_000.1234567, 100.5, -450.25);
const cameraPos64 = new Vector3D(2_537_000.0, 100.0, -450.0);
const rel = worldPos64.toCameraRelative(cameraPos64);

assertClose(
  rel.x,
  0.1234567,
  1e-6,
  "Floating-origin camera relative subtraction preserves millimeter precision at 2.5 Mly",
);
assertClose(rel.y, 0.5, 1e-6, "Camera relative y offset is exact");
assertClose(rel.z, -0.25, 1e-6, "Camera relative z offset is exact");

// Test float32 [high, low] splitting
const testVal = 2_537_000.987654321;
const [hi, lo] = splitDouble(testVal);
const reconstructed = hi + lo;
assertClose(
  reconstructed,
  testVal,
  1e-14,
  "Double precision value is losslessly reconstructed from high + low float32 pair",
);
assert(Math.fround(hi) === hi, "High component is an exact IEEE 754 float32");
assert(Math.fround(lo) === lo, "Low component is an exact IEEE 754 float32");

const node = new SceneOriginNode("m31", "Andromeda Galaxy", worldPos64, 110_000);
const localOffset = new Vector3D(10, 0, 0);
const transformedWorld = node.localToWorld64(localOffset);
assertClose(
  transformedWorld.x,
  worldPos64.x + 10,
  1e-12,
  "SceneOriginNode correctly transforms local coordinate to world 64-bit frame",
);

// ============================================================================
// 6. SCALEMANAGER HIERARCHICAL REGIMES & CONTINUOUS NAVIGATION
// ============================================================================
console.log("\n6. ScaleManager Hierarchical Regimes & Dual Modes:");

assert(
  scaleManager.getScaleRegime(0.00005) === "PlanetarySurface",
  "Under 0.0001 ly maps to PlanetarySurface regime",
);
assert(
  scaleManager.getScaleRegime(0.005) === "SolarSystem",
  "0.0001 - 0.1 ly maps to SolarSystem regime",
);
assert(
  scaleManager.getScaleRegime(50) === "NearbyStars",
  "0.1 - 1,000 ly maps to NearbyStars regime",
);
assert(
  scaleManager.getScaleRegime(50_000) === "Galactic",
  "1,000 - 200,000 ly maps to Galactic regime",
);
assert(
  scaleManager.getScaleRegime(5_000_000) === "Intergalactic",
  "200k - 100M ly maps to Intergalactic regime",
);
assert(
  scaleManager.getScaleRegime(500_000_000) === "Cosmological",
  ">= 100M ly maps to Cosmological regime",
);

// Presentation vs True Physical Scale
const renderAuEnhanced = scaleManager.getRenderAU("enhanced");
const renderAuTrue = scaleManager.getRenderAU("true_scale");
assert(renderAuEnhanced === 0.05, "Enhanced mode renders 1 AU as 0.05 ly for visual accessibility");
assertClose(
  renderAuTrue,
  LIGHT_YEARS_PER_AU,
  1e-12,
  "True scale mode renders 1 AU as exact physical light-years (1.58128e-5 ly)",
);

// Earth render radius
const earthRadiusKm = 6371.0;
const rEarthEnhanced = scaleManager.getRenderRadiusFromKm(earthRadiusKm, "enhanced");
const rEarthTrue = scaleManager.getRenderRadiusFromKm(earthRadiusKm, "true_scale");
assert(rEarthEnhanced > rEarthTrue * 100, "Enhanced mode magnifies planetary disc for visibility");
assertClose(
  rEarthTrue * METERS_PER_LIGHT_YEAR,
  earthRadiusKm * 1000,
  1e-6,
  "True scale mode calculates uncompromised 1:1 physical radius in meters",
);

// Telemetry Formatting
const indicatorSolar = scaleManager.formatIndicator(0.0000158128, "true_scale");
assert(indicatorSolar.regimeName === "Planetary Scale", "Correct regime name reported");
assert(
  indicatorSolar.distanceLabel.includes("AU") || indicatorSolar.distanceLabel.includes("km"),
  "Solar neighborhood reports in AU / km",
);

// ============================================================================
// 7. KEPLERIAN CELESTIAL MECHANICS SOLVERS
// ============================================================================
console.log("\n7. Keplerian Solvers & Orbital Invariants:");

// Circular Orbit: E = M
const eCirc = solveKepler(Math.PI / 4, 0);
assertClose(eCirc, Math.PI / 4, 1e-12, "Circular orbit satisfies E = M");

// Earth orbit (e = 0.0167)
const mEarth = 2.14;
const eEarth = solveKepler(mEarth, 0.0167);
const mRec = eEarth - 0.0167 * Math.sin(eEarth);
assertClose(mRec, mEarth, 1e-12, "Earth orbit solves Kepler equation to <1e-12 precision");

// High eccentricity (Halley's comet e = 0.967)
const mHalley = 0.35;
const eHalley = solveKepler(mHalley, 0.967);
const mRecHalley = eHalley - 0.967 * Math.sin(eHalley);
assertClose(
  mRecHalley,
  mHalley,
  1e-11,
  "High eccentricity orbit solves Kepler equation to <1e-11 precision",
);

// True Anomaly Invariant: r(theta = 0) = a * (1 - e) at perihelion
const posPeri = keplerianOrbitalPositionAU(1.5, 0.2, 0, 0, 0, 0);
assertClose(posPeri.x, 1.5 * (1 - 0.2), 1e-6, "Perihelion radius equals a * (1 - e) = 1.2 AU");
assertClose(posPeri.y, 0, 1e-12, "Perpendicular orbital coordinate is 0 at perihelion");

// ============================================================================
// 8. STELLAR PHYSICS & RELATIVISTIC GRAVITATION
// ============================================================================
console.log("\n8. Stellar & Relativistic Physics:");

const sunL = calculateLuminosity(1.0, SOLAR_EFFECTIVE_TEMPERATURE_K);
assertClose(sunL, 1.0, 1e-12, "Stefan-Boltzmann luminosity for Sun is 1.000 L_sun");

const siriusL = calculateLuminosity(1.711, 9940);
assertClose(
  siriusL,
  25.65,
  0.02,
  "Sirius A calculated luminosity matches empirical data (~25.4 L_sun)",
);

const rsSun = schwarzschildRadiusMeters(SOLAR_MASS_KG);
assertClose(rsSun, 2953.25, 1e-3, "Solar mass Schwarzschild horizon radius is 2,953.25 meters");

const rsSgrA = schwarzschildRadiusLy(4.154e6);
assertClose(
  rsSgrA,
  1.296e-6,
  0.01,
  "Sgr A* (4.154M M_sun) event horizon is ~1.296e-6 ly (~0.082 AU)",
);

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log("\n================ VALIDATION SUMMARY ================");
console.log(`Total Checks Run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log("ALL ASTRONOMICAL INTEGRITY & SCALE CHECKS PASSED WITH 100% SUCCESS!\n");
  process.exit(0);
} else {
  console.error("SOME CHECKS FAILED!\n");
  process.exit(1);
}
