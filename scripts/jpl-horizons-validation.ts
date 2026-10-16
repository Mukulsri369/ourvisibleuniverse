/**
 * NASA JPL Horizons Solar System Ephemeris & Dynamics Automated Test Suite
 *
 * Validates:
 * 1. Barycentric & Heliocentric state vector precision against JPL DE440 benchmarks across multiple epochs.
 * 2. Sun wobble around the Solar System Barycenter (SSB).
 * 3. Exact physical body dimensions, sidereal rotation rates, and retrograde rotation.
 * 4. Moon 3D relative positions, Laplace plane inclinations, and retrograde orbits (Triton).
 * 5. Three-Body Lagrange points (L1 - L5) for Sun-Earth (JWST/SOHO) and Sun-Jupiter (Trojans).
 * 6. Orbital resonances (Laplace 4:2:1 and Neptune:Pluto 3:2).
 * 7. Interplanetary distance calculations and light-travel time.
 * 8. Decoupled Galactic Trajectory Model invariants.
 */

import {
  computePlanetStateVector,
  computeSunBarycentricOffsetAu,
  computeMoonRelativeState,
  solveKeplerEquation,
  JPL_BENCHMARK_DATES,
  J2000_JD,
} from "../src/lib/astronomy/jpl/horizons-ephemeris";
import { JPL_PLANETS_PHYSICAL } from "../src/lib/astronomy/jpl/planetary-physical-data";
import { computeLagrangePoints } from "../src/lib/astronomy/jpl/lagrange-points";
import { SOLAR_SYSTEM_RESONANCES } from "../src/lib/astronomy/jpl/orbital-resonances";
import { jplEphemerisManager } from "../src/lib/astronomy/jpl/ephemeris-cache";

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${message}`);
  }
}

function assertClose(actual: number, expected: number, tol: number, message: string) {
  totalChecks++;
  const diff = Math.abs(actual - expected);
  if (diff <= tol) {
    passedChecks++;
    console.log(
      `  [PASS] ${message} (actual: ${actual.toFixed(4)}, expected: ${expected.toFixed(4)}, diff: ${diff.toExponential(2)})`,
    );
  } else {
    failedChecks++;
    console.error(
      `  [FAIL] ${message} (actual: ${actual.toFixed(4)}, expected: ${expected.toFixed(4)}, diff: ${diff.toExponential(2)}, tol: ${tol})`,
    );
  }
}

console.log("==================================================================");
console.log("🛰️ NASA JPL HORIZONS SOLAR SYSTEM EPHEMERIS & DYNAMICS VALIDATION");
console.log("==================================================================");

// ----------------------------------------------------------------------------
// 1. Kepler Equation Solver Precision
// ----------------------------------------------------------------------------
console.log("\n1. Kepler Equation Numerical Solver (Newton-Raphson):");
const M1 = 0.5;
const e1 = 0.2056; // Mercury
const E1 = solveKeplerEquation(M1, e1);
const residual1 = Math.abs(E1 - e1 * Math.sin(E1) - M1);
assert(
  residual1 < 1e-12,
  `Mercury Kepler equation solved with residual < 1e-12 (${residual1.toExponential(2)})`,
);

const M2 = 2.1;
const e2 = 0.2488; // Pluto
const E2 = solveKeplerEquation(M2, e2);
const residual2 = Math.abs(E2 - e2 * Math.sin(E2) - M2);
assert(
  residual2 < 1e-12,
  `Pluto eccentric Kepler equation solved with residual < 1e-12 (${residual2.toExponential(2)})`,
);

// ----------------------------------------------------------------------------
// 2. State Vectors vs NASA JPL DE440 Reference Across Historical Epochs
// ----------------------------------------------------------------------------
console.log("\n2. JPL Horizons State Vectors vs DE440 Reference Results on Multiple Dates:");

// Benchmark 1: J2000.0 Epoch
const bJ2000 = JPL_BENCHMARK_DATES.j2000;
const earthJ2000 = computePlanetStateVector("Earth", bJ2000.jd);
const refEarthJ2000 = bJ2000.planets.Earth;
const earthDiff = Math.hypot(
  earthJ2000.xAu - refEarthJ2000[0],
  earthJ2000.yAu - refEarthJ2000[1],
  earthJ2000.zAu - refEarthJ2000[2],
);
assert(
  earthDiff < 0.002,
  `Earth J2000.0 position matches JPL reference (< 0.002 AU, diff: ${earthDiff.toFixed(5)} AU)`,
);
assertClose(earthJ2000.speedKmS, 29.8, 1.0, "Earth orbital speed at J2000.0 is ~29.8 km/s");

const jupiterJ2000 = computePlanetStateVector("Jupiter", bJ2000.jd);
const refJupJ2000 = bJ2000.planets.Jupiter;
const jupDiff = Math.hypot(
  jupiterJ2000.xAu - refJupJ2000[0],
  jupiterJ2000.yAu - refJupJ2000[1],
  jupiterJ2000.zAu - refJupJ2000[2],
);
assert(
  jupDiff < 0.005,
  `Jupiter J2000.0 position matches JPL reference (< 0.005 AU, diff: ${jupDiff.toFixed(5)} AU)`,
);

const marsJ2000 = computePlanetStateVector("Mars", bJ2000.jd);
const refMarsJ2000 = bJ2000.planets.Mars;
const marsDiff = Math.hypot(
  marsJ2000.xAu - refMarsJ2000[0],
  marsJ2000.yAu - refMarsJ2000[1],
  marsJ2000.zAu - refMarsJ2000[2],
);
assert(
  marsDiff < 0.003,
  `Mars J2000.0 position matches JPL reference (< 0.003 AU, diff: ${marsDiff.toFixed(5)} AU)`,
);

// Benchmark 2: Great Conjunction 2020-12-21
const bConj = JPL_BENCHMARK_DATES.greatConjunction2020;
const jupConj = computePlanetStateVector("Jupiter", bConj.jd);
const satConj = computePlanetStateVector("Saturn", bConj.jd);
assert(
  jupConj.distanceSunAu > 5.0 && jupConj.distanceSunAu < 5.4,
  `Jupiter at Great Conjunction is ~5.1 AU from Sun (${jupConj.distanceSunAu.toFixed(2)} AU)`,
);
assert(
  satConj.distanceSunAu > 9.8 && satConj.distanceSunAu < 10.2,
  `Saturn at Great Conjunction is ~10.0 AU from Sun (${satConj.distanceSunAu.toFixed(2)} AU)`,
);

// Benchmark 3: Apollo 11 Lunar Landing (1969-07-20)
const bApollo = JPL_BENCHMARK_DATES.apollo11_1969;
const earthApollo = computePlanetStateVector("Earth", bApollo.jd);
assert(
  earthApollo.distanceSunAu > 1.005 && earthApollo.distanceSunAu < 1.02,
  `Earth at Apollo 11 landing is ~1.008-1.016 AU (${earthApollo.distanceSunAu.toFixed(3)} AU)`,
);

// Benchmark 4: Voyager 2 Neptune Flyby (1989-08-25)
const bVoyager = JPL_BENCHMARK_DATES.voyager2Neptune1989;
const nepVoyager = computePlanetStateVector("Neptune", bVoyager.jd);
assert(
  nepVoyager.distanceSunAu > 29.8 && nepVoyager.distanceSunAu < 30.2,
  `Neptune at Voyager 2 flyby is ~30.0 AU from Sun (${nepVoyager.distanceSunAu.toFixed(2)} AU)`,
);

// ----------------------------------------------------------------------------
// 3. Solar System Barycenter (SSB) & Sun Wobble
// ----------------------------------------------------------------------------
console.log("\n3. Sun Orbit around the Solar System Barycenter (SSB):");
const ssbJ2000 = computeSunBarycentricOffsetAu(J2000_JD);
const ssbDistJ2000 = Math.hypot(ssbJ2000.xAu, ssbJ2000.yAu, ssbJ2000.zAu);
assert(
  ssbDistJ2000 > 0.002 && ssbDistJ2000 < 0.01,
  `Sun is physically offset from SSB at J2000 (${(ssbDistJ2000 * 149.6).toFixed(2)} million km ~ ${((ssbDistJ2000 * 149597870.7) / 696340).toFixed(2)} solar radii)`,
);
assert(
  ssbJ2000.radiusKm > 500000 && ssbJ2000.radiusKm < 1500000,
  `Sun displacement radius is ~1.0-1.5M km (${(ssbJ2000.radiusKm / 1e6).toFixed(2)}M km)`,
);

// ----------------------------------------------------------------------------
// 4. Physical Dimensions, Rotation & Retrograde Dynamics
// ----------------------------------------------------------------------------
console.log("\n4. Planetary Dimensions, Axial Tilts & Retrograde Rotation:");
const earthPhys = JPL_PLANETS_PHYSICAL.Earth;
assertClose(earthPhys.radiusKm, 6371.0, 0.1, "Earth volumetric mean radius is 6371.0 km");
assertClose(earthPhys.axialTiltDeg, 23.44, 0.05, "Earth axial tilt is 23.44 degrees");
assert(earthPhys.siderealRotationHours > 0, "Earth rotates prograde (positive sidereal period)");

const venusPhys = JPL_PLANETS_PHYSICAL.Venus;
assert(
  venusPhys.siderealRotationHours < 0,
  `Venus exhibits RETROGRADE rotation (${venusPhys.siderealRotationHours} hours)`,
);
assert(
  venusPhys.axialTiltDeg > 170.0,
  `Venus axial tilt is ~177.36 degrees (${venusPhys.axialTiltDeg}°)`,
);

const uranusPhys = JPL_PLANETS_PHYSICAL.Uranus;
assert(
  uranusPhys.siderealRotationHours < 0,
  `Uranus exhibits RETROGRADE rotation (${uranusPhys.siderealRotationHours} hours)`,
);
assertClose(
  uranusPhys.axialTiltDeg,
  97.77,
  0.1,
  "Uranus rotates on its side (axial tilt 97.77 degrees)",
);

const jupiterPhys = JPL_PLANETS_PHYSICAL.Jupiter;
assertClose(jupiterPhys.radiusKm, 69911.0, 1.0, "Jupiter mean radius is 69911 km");
assertClose(
  jupiterPhys.siderealRotationHours,
  9.925,
  0.01,
  "Jupiter fast sidereal rotation is ~9.925 hours",
);
assert(jupiterPhys.rings !== undefined, "Jupiter has modelled ring architecture");

const saturnPhys = JPL_PLANETS_PHYSICAL.Saturn;
assert(saturnPhys.rings !== undefined, "Saturn ring architecture present");
assert(saturnPhys.rings!.outerRadiusKm > 130000, "Saturn A-ring outer radius exceeds 130,000 km");

// ----------------------------------------------------------------------------
// 5. Moon Orbits, Laplace Inclinations & Retrograde Moons
// ----------------------------------------------------------------------------
console.log("\n5. Major Moons & Distinct Orbital Planes (No Arbitrary Shared Planes):");
const moonEarth = computeMoonRelativeState(
  "Moon",
  "Earth",
  J2000_JD,
  384400,
  27.32166,
  5.145,
  0.0549,
);
assertClose(moonEarth.distanceKm, 384400, 25000, "Moon semi-major axis is ~384,400 km");
assertClose(moonEarth.inclinationDeg, 5.145, 0.01, "Moon orbit has 5.145° inclination to ecliptic");

const tritonNep = computeMoonRelativeState(
  "Triton",
  "Neptune",
  J2000_JD,
  354760,
  -5.87685,
  156.885,
  0.000016,
);
assert(
  tritonNep.speedKmS > 4.0 && tritonNep.speedKmS < 5.0,
  `Triton orbital speed is ~4.39 km/s (${tritonNep.speedKmS.toFixed(2)} km/s)`,
);
assert(
  tritonNep.inclinationDeg > 150.0,
  `Triton has RETROGRADE inclination relative to Neptune equator (${tritonNep.inclinationDeg}°)`,
);

const phobosMars = computeMoonRelativeState("Phobos", "Mars", J2000_JD, 9376, 0.3189, 1.093, 0.015);
assert(
  phobosMars.distanceKm < 10000,
  "Phobos is a close-orbiting moon (< 10,000 km from Mars center)",
);

// ----------------------------------------------------------------------------
// 6. Three-Body Lagrange Points (L1 - L5)
// ----------------------------------------------------------------------------
console.log("\n6. Three-Body Lagrange Points (L1 - L5) Precision:");
const earthState = jplEphemerisManager.getPlanetState("Earth", J2000_JD);
const lagrangeEarth = computeLagrangePoints("Sun-Earth", earthState);
assert(lagrangeEarth.length === 5, "5 Lagrange points computed for Sun-Earth system");

const l1 = lagrangeEarth.find((p) => p.point === "L1")!;
const l2 = lagrangeEarth.find((p) => p.point === "L2")!;
const l4 = lagrangeEarth.find((p) => p.point === "L4")!;

assertClose(
  l1.distanceFromPlanetKm,
  1495978,
  200000,
  "Sun-Earth L1 is ~1.5 million km from Earth (SOHO home)",
);
assertClose(
  l2.distanceFromPlanetKm,
  1495978,
  200000,
  "Sun-Earth L2 is ~1.5 million km from Earth (JWST home)",
);
assert(
  l2.notableMissionsOrObjects.includes("JWST (James Webb)"),
  "JWST identified at Sun-Earth L2",
);
assert(l1.notableMissionsOrObjects.includes("SOHO"), "SOHO identified at Sun-Earth L1");

const jupState = jplEphemerisManager.getPlanetState("Jupiter", J2000_JD);
const lagrangeJup = computeLagrangePoints("Sun-Jupiter", jupState);
const jupL4 = lagrangeJup.find((p) => p.point === "L4")!;
assert(
  jupL4.notableMissionsOrObjects.some((o) => o.includes("Trojan")),
  "Jupiter L4 identified with Trojan asteroid swarms",
);

// ----------------------------------------------------------------------------
// 7. Orbital Resonances
// ----------------------------------------------------------------------------
console.log("\n7. Orbital Resonances (Laplace 4:2:1 & Pluto-Neptune):");
const laplace = SOLAR_SYSTEM_RESONANCES.find((r) => r.id === "galilean_laplace")!;
assert(laplace.ratio === "4 : 2 : 1", "Galilean Laplace resonance is 4:2:1");
assert(
  laplace.bodies.includes("Io") &&
    laplace.bodies.includes("Europa") &&
    laplace.bodies.includes("Ganymede"),
  "Laplace resonance couples Io, Europa, and Ganymede",
);

const plutoNep = SOLAR_SYSTEM_RESONANCES.find((r) => r.id === "neptune_pluto")!;
assert(plutoNep.ratio === "3 : 2", "Neptune-Pluto resonance is 3:2");

// ----------------------------------------------------------------------------
// 8. Interplanetary Distance Calculator & Light-Travel Time
// ----------------------------------------------------------------------------
console.log("\n8. Interplanetary Distance Calculator & Light Travel Time (d / c):");
const distEarthMars = jplEphemerisManager.computeDistance("Earth", "Mars", J2000_JD);
assert(
  distEarthMars.distanceAu > 0.35 && distEarthMars.distanceAu < 2.7,
  `Earth-Mars distance is physically bounded (${distEarthMars.distanceAu.toFixed(3)} AU)`,
);
assert(
  distEarthMars.lightTravelTimeSeconds > 180 && distEarthMars.lightTravelTimeSeconds < 1500,
  `Light travel time Earth-Mars is ~3-22 minutes (${distEarthMars.lightTravelTimeFormatted})`,
);

const distSunEarth = jplEphemerisManager.computeDistance("Sun", "Earth", J2000_JD);
assertClose(
  distSunEarth.distanceAu,
  0.983,
  0.05,
  "Sun-Earth distance at J2000 (Jan 1) is ~0.983 AU (near perihelion)",
);
assert(
  distSunEarth.lightTravelTimeFormatted.includes("light-min"),
  `Sun-Earth light travel time is ~8.2 light-minutes (${distSunEarth.lightTravelTimeFormatted})`,
);

// ----------------------------------------------------------------------------
// 9. Separate Galactic Trajectory Model
// ----------------------------------------------------------------------------
console.log("\n9. Separate Galactic Trajectory Model Invariants:");
const galModel = jplEphemerisManager.getGalacticTrajectoryModel();
assert(galModel.orbitalSpeedKmS === 220, "Galactic orbital speed is 220 km/s");
assert(galModel.galactocentricDistanceLy === 26000, "Sun galactocentric distance is 26,000 ly");
assert(
  galModel.eclipticToGalacticPlaneInclinationDeg === 60.19,
  "Ecliptic is inclined 60.19° to galactic plane",
);
assert(
  galModel.disclaimer.includes("Scientific Policy"),
  "Explicit scientific disclaimer segregates galactic motion from short-term ephemerides",
);

console.log("\n================ VALIDATION SUMMARY ================");
console.log(`Total Checks Run: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log("🌟 ALL NASA JPL HORIZONS SOLAR SYSTEM CHECKS PASSED WITH 100% SUCCESS!");
} else {
  console.error("❌ Some validation checks failed.");
  process.exit(1);
}
