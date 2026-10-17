/**
 * Compact-Object Astrophysics & Relativistic Spacetime Test Suite
 * 
 * Validates:
 * 1. Schwarzschild, Kerr, and Ergosphere metric boundary calculations
 * 2. Bardeen ISCO analytical solutions across the spin parameter range (-1 to +0.998)
 * 3. Critical impact parameter, photon sphere, and apparent black hole shadow dimensions
 * 4. Relativistic Doppler boosting and gravitational redshift formulations
 * 5. Pulsar timing, surface magnetic field, spin-down luminosity, and light-cylinder radius
 * 6. Gravitational-wave chirp mass, radiated energy, and localization parameters
 * 7. Real catalog objects integrity and strict accretion/dormancy distinctions
 */

import {
  calculateSchwarzschildRadius,
  calculateKerrHorizon,
  calculateErgosphereRadius,
  calculateISCORadius,
  calculatePhotonSphere,
  calculateGravitationalRedshift,
  calculateDopplerBeaming,
  getPulsarMetrics,
  getGravitationalWaveMetrics,
  gravitationalRadius,
} from "../src/lib/astronomy/compact-objects";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import { OBSERVED_VISUAL_PROFILES } from "../src/stars/observed-object-visuals";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function assertClose(actual: number, expected: number, tolerance: number, message: string) {
  const relDiff = Math.abs(actual - expected) / Math.max(Math.abs(expected), 1e-12);
  const condition = relDiff <= tolerance;
  if (condition) {
    console.log(`  [PASS] ${message} (val: ${actual.toExponential(4)}, ref: ${expected.toExponential(4)})`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message} (val: ${actual.toExponential(4)}, ref: ${expected.toExponential(4)}, relErr: ${relDiff.toExponential(2)})`);
    failed++;
  }
}

console.log("==================================================================");
console.log("🔬 COMPACT OBJECTS & RELATIVISTIC SPACETIME VALIDATION SUITE");
console.log("==================================================================");

// 1. Schwarzschild & Kerr Event Horizons
console.log("\n1. Schwarzschild & Kerr Event Horizon Metrics:");
const r_s_solar = calculateSchwarzschildRadius(1.0);
assertClose(r_s_solar, 2953.25, 0.001, "1.0 M_sun Schwarzschild radius is ~2,953.25 meters");

const r_s_sgra = calculateSchwarzschildRadius(4.154e6);
assertClose(r_s_sgra, 1.2267e10, 0.01, "Sgr A* (4.154M M_sun) event horizon diameter is ~24.5M km (~0.16 AU)");

const r_s_m87 = calculateSchwarzschildRadius(6.5e9);
assertClose(r_s_m87, 1.9196e13, 0.01, "M87* (6.5B M_sun) event horizon radius is ~1.92e10 km (>128 AU)");

const rg_10m = gravitationalRadius(10.0);
const r_plus_zero = calculateKerrHorizon(10.0, 0.0);
assertClose(r_plus_zero, 2 * rg_10m, 1e-6, "Kerr horizon at a*=0 strictly equals Schwarzschild radius (2 r_g)");

const r_plus_max = calculateKerrHorizon(10.0, 0.998);
assert(r_plus_max < 1.1 * rg_10m && r_plus_max > 1.0 * rg_10m, "Near-extremal Kerr horizon contracts toward r_g");

const r_ergo_equator = calculateErgosphereRadius(10.0, 0.95, Math.PI / 2);
assertClose(r_ergo_equator, 2 * rg_10m, 1e-6, "Ergosphere radius at equator is exactly 2 r_g (R_s) for all spins");

const r_ergo_pole = calculateErgosphereRadius(10.0, 0.95, 0.0);
const r_plus_95 = calculateKerrHorizon(10.0, 0.95);
assertClose(r_ergo_pole, r_plus_95, 1e-6, "Ergosphere touches outer event horizon at poles");

// 2. Innermost Stable Circular Orbit (ISCO) Solutions
console.log("\n2. Bardeen Analytical ISCO Radii:");
const isco_zero = calculateISCORadius(10.0, 0.0);
assertClose(isco_zero.radiusInRg, 6.0, 0.001, "Non-spinning Schwarzschild ISCO is exactly 6.0 r_g (3 R_s)");

const isco_prograde = calculateISCORadius(10.0, 0.998);
assert(isco_prograde.radiusInRg >= 1.2 && isco_prograde.radiusInRg <= 1.3, "Extreme prograde ISCO contracts to ~1.237 r_g");

const isco_retrograde = calculateISCORadius(10.0, -0.998);
assert(isco_retrograde.radiusInRg >= 8.9 && isco_retrograde.radiusInRg <= 9.05, "Extreme retrograde ISCO expands to ~9.0 r_g");

// 3. Photon Sphere & Critical Impact Parameter (Shadow Diameter)
console.log("\n3. Photon Sphere & Apparent Black Hole Shadow:");
const ps_zero = calculatePhotonSphere(10.0, 0.0);
assertClose(ps_zero.rPhotonMeters, 3 * rg_10m, 0.001, "Schwarzschild photon sphere radius is exactly 3 r_g (1.5 R_s)");

const b_crit_expected = Math.sqrt(27) * rg_10m;
assertClose(ps_zero.bCritMeters, b_crit_expected, 0.001, "Critical impact parameter is sqrt(27) * r_g ≈ 5.196 * r_g");
assertClose(ps_zero.shadowDiameterMeters, 2 * b_crit_expected, 0.001, "Apparent shadow diameter is 2 * b_crit ≈ 10.392 * r_g");

// 4. Relativistic Doppler Beaming & Gravitational Redshift
console.log("\n4. Relativistic Doppler Beaming & Gravitational Redshift:");
const z_isco = calculateGravitationalRedshift(10.0, 6 * rg_10m);
// 1 + z = 1 / sqrt(1 - 2/6) = 1 / sqrt(2/3) = sqrt(1.5) ≈ 1.22474 -> z ≈ 0.22474
assertClose(z_isco, Math.sqrt(1.5) - 1, 0.001, "Gravitational redshift at Schwarzschild ISCO is ~0.2247");

const doppler_forward = calculateDopplerBeaming(0.5, 0.0, 1.0);
assert(doppler_forward.intensityFactor > 5.0, "Forward Doppler boosting significantly amplifies approaching plasma jet (>5x)");

const doppler_backward = calculateDopplerBeaming(0.5, Math.PI, 1.0);
assert(doppler_backward.intensityFactor < 0.2, "Receding Doppler boosting de-amplifies counter-jet (<0.2x)");

// 5. Pulsar Electrodynamics & Timing
console.log("\n5. Pulsar Spin-Down & Electrodynamics:");
// Crab Pulsar: P = 33.39 ms, P_dot = 4.21e-13
const crabMetrics = getPulsarMetrics(0.03339, 4.21e-13);
assertClose(crabMetrics.spinFrequencyHz, 29.95, 0.01, "Crab Pulsar spin frequency is ~29.95 Hz");
assertClose(crabMetrics.surfaceMagneticFieldGauss, 3.78e12, 0.05, "Crab Pulsar surface dipole B-field is ~3.8e12 Gauss");
assert(crabMetrics.characteristicAgeYears > 1000 && crabMetrics.characteristicAgeYears < 1500, "Crab characteristic age is ~1,250 years (SN 1054 remnant)");
assert(crabMetrics.lightCylinderRadiusKm > 1500 && crabMetrics.lightCylinderRadiusKm < 1700, "Crab light cylinder radius is ~1,593 km");

// Millisecond pulsar: PSR J0437-4715 (P = 5.757 ms)
const msPulsar = getPulsarMetrics(0.005757, 5.73e-20);
assert(msPulsar.spinFrequencyHz > 170, "Millisecond pulsar rotates >170 times per second");
assert(msPulsar.surfaceMagneticFieldGauss < 1e9, "Recycled millisecond pulsar has weakened B-field (<1e9 G)");

// 6. Gravitational Wave Mergers
console.log("\n6. Gravitational-Wave Parameters:");
// GW150914: 35.6 M_sun + 30.6 M_sun -> 63.1 M_sun
const gwMetrics = getGravitationalWaveMetrics(35.6, 30.6, 63.1, 1300, 230);
assertClose(gwMetrics.chirpMassSolar, 28.6, 0.05, "GW150914 chirp mass is ~28.6 M_sun");
assertClose(gwMetrics.radiatedMassSolar, 3.1, 0.05, "GW150914 radiated mass is ~3.1 M_sun");
assert(gwMetrics.radiatedEnergyJoules > 5e47, "GW150914 radiated >5e47 Joules in gravitational radiation");

// 7. Catalog Integrity & Strict Dormancy Rules
console.log("\n7. Catalog Compact Object Integrity & Dormancy Discipline:");
const gaiabh1 = OBSERVED_OBJECTS.find((o) => o.id === "gaiabh1");
assert(!!gaiabh1, "Gaia BH1 exists in catalog");
assert(gaiabh1?.compactPhysics?.hasAccretionDisk === false, "Gaia BH1 is STRICTLY DORMANT: zero accretion disk");
assert(gaiabh1?.compactPhysics?.accretionState === "dormant", "Gaia BH1 marked with dormant accretion state");

const gaiabh3 = OBSERVED_OBJECTS.find((o) => o.id === "gaiabh3");
assert(!!gaiabh3, "Gaia BH3 exists in catalog");
assert(gaiabh3?.compactPhysics?.hasAccretionDisk === false, "Gaia BH3 is STRICTLY DORMANT: zero accretion disk");

const cygx1 = OBSERVED_OBJECTS.find((o) => o.id === "cygx1");
assert(cygx1?.compactPhysics?.hasAccretionDisk === true, "Cygnus X-1 has confirmed active accretion disk");
assert(cygx1?.compactPhysics?.hasRelativisticJet === true, "Cygnus X-1 has confirmed relativistic jet");

const sgra = OBSERVED_OBJECTS.find((o) => o.id === "sgr-a");
assert(!!sgra, "Sagittarius A* exists in catalog");
assert(sgra?.compactPhysics?.compactClass === "supermassive_black_hole", "Sgr A* is supermassive black hole");

const m87 = OBSERVED_OBJECTS.find((o) => o.id === "m87star");
assert(!!m87, "M87* exists in catalog");
assert(m87?.compactPhysics?.hasRelativisticJet === true, "M87* has confirmed relativistic jet");

const ton618 = OBSERVED_OBJECTS.find((o) => o.id === "ton618");
assert(ton618?.compactPhysics?.massSolar === 6.6e10, "TON 618 SMBH mass is 6.6e10 M_sun");

const rxj = OBSERVED_OBJECTS.find((o) => o.id === "rx-j1856");
assert(rxj?.compactPhysics?.compactClass === "thermal_neutron_star", "RX J1856 is isolated thermal neutron star");
assert(rxj?.compactPhysics?.hasAccretionDisk === false, "RX J1856 has no accretion disk");

const gw150914 = OBSERVED_OBJECTS.find((o) => o.id === "gw150914");
assert((gw150914?.compactPhysics?.gwSkyAreaDeg2 ?? 0) > 0, "GW150914 retains positive sky localization area (not a fake pinpoint)");

// Check visual profiles
const dormantProfiles = [
  OBSERVED_VISUAL_PROFILES["gaiabh1"],
  OBSERVED_VISUAL_PROFILES["gaiabh3"],
];
assert(dormantProfiles.every((p) => p?.morphology === "dormant-blackhole"), "Dormant black holes use 'dormant-blackhole' morphology (no glowing disk)");

console.log("\n================ VALIDATION SUMMARY ================");
console.log(`Total Checks Run: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log("🌟 ALL COMPACT OBJECTS & RELATIVISTIC TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
} else {
  console.error("❌ Some validation checks failed.");
  process.exit(1);
}
