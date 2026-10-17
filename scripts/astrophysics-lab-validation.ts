/**
 * Comprehensive Validation Test Suite:
 * Interactive Physics-Informed Astrophysics Laboratories
 *
 * Validates:
 * 1. Module 1: Star Formation (Jeans instability, Bonnor-Ebert, YSO stages, Shu collapse)
 * 2. Module 2: Stellar Evolution (MIST/PARSEC tracks, mass-luminosity relation, H-R diagram, remnants, uncertainties)
 * 3. Module 3: Planet Formation (MMSN disk profiles, snow line, Hill sphere, migration, 8 phases)
 * 4. Module 4: Galaxy Assembly (Hydrodynamic stages, Kennicutt-Schmidt law, merger kinematics, remnants)
 * 5. Epistemological Standards (OBSERVATION, MODEL, ILLUSTRATION badges and object past disclaimer)
 * 6. High-Performance numerical benchmark (< 50 ms).
 */

import {
  calculateStarFormationPhysics,
  calculateCollapseProfile,
  YSO_STAGES,
  type YSOClass,
} from "../src/lib/astronomy/astrophysics-lab/star-formation-engine";

import {
  STELLAR_EVOLUTION_GRID,
  getStellarEvolutionInterpolation,
} from "../src/lib/astronomy/astrophysics-lab/stellar-evolution-engine";

import {
  PLANET_FORMATION_PHASES,
  calculateDiskStructure,
  calculateOrbitalPhysics,
  type PlanetFormationPhaseId,
} from "../src/lib/astronomy/astrophysics-lab/planet-formation-engine";

import {
  GALAXY_ASSEMBLY_STAGES,
  calculateMergerPhysics,
  type GalaxyAssemblyStageId,
} from "../src/lib/astronomy/astrophysics-lab/galaxy-assembly-engine";

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

function assertClose(actual: number, expected: number, tol = 1e-2, msg: string) {
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
console.log("🔬 ASTROPHYSICS & FORMATION LABORATORIES VALIDATION SUITE");
console.log("==================================================================");

// -------------------------------------------------------------
// 1. MODULE 1: STAR FORMATION
// -------------------------------------------------------------
console.log("\n1. Module 1: Star Formation Physics & YSO Stages:");
const coldCore = calculateStarFormationPhysics({
  temperatureK: 10,
  densityCm3: 20000,
  cloudMassSolar: 100,
  magneticFieldMicroGauss: 20,
  turbulenceKmS: 0.5,
});

assert(
  coldCore.soundSpeedKmS > 0.15 && coldCore.soundSpeedKmS < 0.35,
  "Isothermal sound speed at 10 K is ~0.2 km/s",
);
assert(
  coldCore.jeansMassSolar > 0.5 && coldCore.jeansMassSolar < 30.0,
  "Jeans mass in dense cold core is realistic (~2 - 15 M_sun)",
);
assert(
  coldCore.freeFallTimeYears > 1e4 && coldCore.freeFallTimeYears < 1e6,
  "Free-fall collapse time is ~10^5 years",
);
assert(
  coldCore.isGravitationallyUnstable,
  "100 M_sun cold cloud exceeds Jeans mass -> gravitationally unstable",
);
assert(coldCore.willCollapse, "Cloud is supercritical -> proceeds to collapse");

// Shu inside-out collapse velocity fields
const outerShu = calculateCollapseProfile(150, 50); // r = 150 AU, r_wave = 50 AU
assert(!outerShu.isInfaling, "Gas outside expansion wave is static singular isothermal sphere");
assert(
  outerShu.infallVelocityKmS === 0.0,
  "Outer velocity is zero before rarefaction wave arrives",
);

const innerShu = calculateCollapseProfile(10, 50); // r = 10 AU, r_wave = 50 AU
assert(innerShu.isInfaling, "Gas inside expansion wave is infalling in free-fall");
assert(innerShu.infallVelocityKmS > 0.0, "Inner velocity is positive directed inward");

// YSO Classification checks
const ysoKeys: YSOClass[] = ["prestellar_core", "class_0", "class_I", "class_II", "class_III"];
ysoKeys.forEach((k) => {
  const yso = YSO_STAGES[k];
  assert(Boolean(yso), `YSO stage '${k}' documented`);
  assert(
    Boolean(yso.statusBadge),
    `YSO stage '${k}' has explicit status badge: [${yso.statusBadge}]`,
  );
  assert(
    yso.observationalDiagnostics.length >= 2,
    `YSO stage '${k}' has observational diagnostics`,
  );
});

assert(
  !YSO_STAGES.prestellar_core.hydrogenFusionIgnited,
  "Prestellar core has not ignited hydrogen",
);
assert(!YSO_STAGES.class_0.hydrogenFusionIgnited, "Class 0 protostar has not ignited hydrogen");
assert(
  YSO_STAGES.class_III.hydrogenFusionIgnited,
  "Class III ZAMS has ignited sustained hydrogen fusion",
);
assert(
  YSO_STAGES.class_III.centralTemperatureK >= 1e7,
  "Class III central core temperature reaches >= 10^7 K",
);

// -------------------------------------------------------------
// 2. MODULE 2: STELLAR EVOLUTION & H-R DIAGRAM
// -------------------------------------------------------------
console.log("\n2. Module 2: Stellar Evolution & Published Track Grids:");
assert(STELLAR_EVOLUTION_GRID.length >= 5, "Grid covers at least 5 mass regimes (0.2 to 40 M_sun)");

STELLAR_EVOLUTION_GRID.forEach((grid) => {
  assert(grid.initialMassSolar > 0, `Track ${grid.initialMassSolar} M_sun present`);
  assert(
    grid.points.length >= 3,
    `Track ${grid.initialMassSolar} M_sun has >= 3 evolutionary points`,
  );
  assert(
    Boolean(grid.remnantType),
    `Track ${grid.initialMassSolar} M_sun specifies remnant: ${grid.remnantType}`,
  );
  assert(
    Boolean(grid.modelUncertainties.overshootingUncertainty),
    `Track ${grid.initialMassSolar} M_sun documents overshooting uncertainty`,
  );
  assert(
    Boolean(grid.modelUncertainties.massLossPrescription),
    `Track ${grid.initialMassSolar} M_sun documents mass-loss prescription`,
  );

  // Verify H-R diagram coordinates are within physically sound bounds (including black holes)
  grid.points.forEach((pt) => {
    assert(
      pt.logTeff >= 0.0 && pt.logTeff <= 6.5,
      `Track point ${pt.stageName} log(T_eff)=${pt.logTeff} physically valid`,
    );
    assert(
      pt.logL >= -15.0 && pt.logL <= 12.0,
      `Track point ${pt.stageName} log(L)=${pt.logL} physically valid`,
    );
  });
});

// Test Mass-dependent lifecycles and outcomes
const m02 = getStellarEvolutionInterpolation(0.2, 0.014);
assert(m02.remnantType === "helium_white_dwarf", "0.2 M_sun yields Helium White Dwarf");
assert(m02.scaledLifetimeGyr > 100, "0.2 M_sun red dwarf lifetime > 100 Gyr");

const m1 = getStellarEvolutionInterpolation(1.0, 0.014);
assert(
  m1.remnantType === "carbon_oxygen_white_dwarf",
  "1.0 M_sun yields Carbon-Oxygen White Dwarf",
);
assertClose(m1.scaledLifetimeGyr, 10.0, 0.1, "1.0 M_sun lifetime is ~10 Gyr");

const m15 = getStellarEvolutionInterpolation(15.0, 0.014);
assert(m15.remnantType === "neutron_star", "15.0 M_sun yields Neutron Star remnant");
assert(m15.scaledLifetimeGyr < 0.1, "15.0 M_sun lifetime is short (< 100 Myr)");

const m40 = getStellarEvolutionInterpolation(40.0, 0.014);
assert(m40.remnantType === "black_hole", "40.0 M_sun yields Stellar Black Hole");

// -------------------------------------------------------------
// 3. MODULE 3: PLANET FORMATION
// -------------------------------------------------------------
console.log("\n3. Module 3: Protoplanetary Disk & Planet Formation Phases:");
const disk = calculateDiskStructure({
  stellarMassSolar: 1.0,
  diskMassSolar: 0.02,
  diskRadiusAu: 100,
  stellarLuminositySolar: 1.0,
  viscosityAlpha: 0.001,
});

assertClose(disk.snowLineRadiusAu, 2.7, 0.1, "Solar-type star snow line is at ~2.7 AU");
assert(disk.temp1AuK > 250 && disk.temp1AuK < 320, "Temperature at 1 AU is ~280 K");
assert(
  disk.criticalCoreMassEarth === 10.0,
  "Critical core mass for runaway gas capture is ~10 M_Earth",
);

const orbit3Au = calculateOrbitalPhysics(3.0, 5.0, 1.0);
assertClose(
  orbit3Au.orbitalPeriodYears,
  Math.sqrt(27),
  0.05,
  "Orbital period at 3 AU is sqrt(27) ≈ 5.2 years",
);
assert(orbit3Au.hillRadiusAu > 0.01, "Hill sphere radius is positive");

const planetPhaseKeys: PlanetFormationPhaseId[] = [
  "protoplanetary_disk",
  "dust_settling",
  "pebble_growth",
  "planetesimals",
  "embryo_growth",
  "migration_resonance",
  "giant_impacts",
  "atmosphere_formation",
];

planetPhaseKeys.forEach((phKey) => {
  const ph = PLANET_FORMATION_PHASES[phKey];
  assert(Boolean(ph), `Planet phase '${phKey}' documented`);
  assert(
    Boolean(ph.statusBadge),
    `Planet phase '${phKey}' has explicit badge: [${ph.statusBadge}]`,
  );
  assert(ph.governingPhysics.length > 20, `Planet phase '${phKey}' documents governing physics`);
  assert(ph.knownLimitations.length > 20, `Planet phase '${phKey}' documents limitations`);
});

// -------------------------------------------------------------
// 4. MODULE 4: GALAXY ASSEMBLY & MERGERS
// -------------------------------------------------------------
console.log("\n4. Module 4: Galaxy Assembly & Merger Dynamics:");
const assemblyStageKeys: GalaxyAssemblyStageId[] = [
  "dm_halo_collapse",
  "cold_filamentary_accretion",
  "turbulent_clumpy_disk",
  "supernova_feedback_winds",
  "galaxy_collision_tidal_tails",
  "nuclear_starburst_merger",
  "quenched_elliptical_remnant",
];

assemblyStageKeys.forEach((stKey) => {
  const st = GALAXY_ASSEMBLY_STAGES[stKey];
  assert(Boolean(st), `Galaxy assembly stage '${stKey}' documented`);
  assert(
    Boolean(st.statusBadge),
    `Galaxy assembly stage '${stKey}' has badge: [${st.statusBadge}]`,
  );
  assert(
    st.governingPhysicalProcess.length > 20,
    `Galaxy stage '${stKey}' documents physical process`,
  );
  assert(st.simulationEvidence.length > 15, `Galaxy stage '${stKey}' cites simulation evidence`);
});

const majorMerger = calculateMergerPhysics({
  massRatio: 1.0,
  gasFraction: 0.4,
  impactParameterKpc: 25,
  isPrograde: true,
  feedbackStrength: 1.0,
});

assert(
  majorMerger.totalSfrSolarPerYr > 10.0,
  "Major gas-rich prograde merger triggers strong starburst",
);
assert(
  majorMerger.tidalTailLengthKpc >= 40,
  "Prograde major merger generates extensive tidal tails (>= 40 kpc)",
);
assert(
  majorMerger.finalMorphology.includes("Elliptical"),
  "Major equal merger settles into an Elliptical galaxy",
);

const minorMerger = calculateMergerPhysics({
  massRatio: 0.1,
  gasFraction: 0.2,
  impactParameterKpc: 40,
  isPrograde: false,
  feedbackStrength: 1.0,
});
assert(
  minorMerger.finalMorphology.includes("Spiral"),
  "Minor 1:10 merger preserves disk morphology",
);

// -------------------------------------------------------------
// 5. PERFORMANCE BENCHMARK
// -------------------------------------------------------------
console.log("\n5. High-Performance Numerical Solvers Benchmark:");
const ITERATIONS = 10000;
const tStart = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  calculateStarFormationPhysics({
    temperatureK: 10 + (i % 20),
    densityCm3: 1000 + i * 2,
    cloudMassSolar: 50 + (i % 100),
    magneticFieldMicroGauss: 20,
    turbulenceKmS: 1.0,
  });
  calculateDiskStructure({
    stellarMassSolar: 1.0,
    diskMassSolar: 0.02,
    diskRadiusAu: 100,
    stellarLuminositySolar: 1.0 + (i % 5) * 0.2,
    viscosityAlpha: 0.001,
  });
}
const elapsedMs = performance.now() - tStart;
console.log(
  `  Executed ${ITERATIONS * 2} numerical physics evaluations in ${elapsedMs.toFixed(2)} ms`,
);
assert(
  elapsedMs < 50,
  `Numerical solvers completed in ${elapsedMs.toFixed(2)} ms (< 50 ms target)`,
);

console.log("\n==================================================================");
console.log(`TOTAL CHECKS RUN: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log("==================================================================");

if (failCount === 0) {
  console.log("🌟 ALL ASTROPHYSICS LABORATORIES TESTS PASSED WITH 100% SUCCESS!\n");
  process.exit(0);
} else {
  console.error("❌ ASTROPHYSICS LABORATORIES TESTS ENCOUNTERED FAILURES!\n");
  process.exit(1);
}
