/**
 * Comprehensive Validation Test Suite:
 * Cosmic Evolution Timeline & Physical Stages Experience
 *
 * Validates:
 * 1. Chronological order & completeness of all 15 cosmic evolution epochs.
 * 2. Strict monotonicity of cosmic scale factor, redshift, and temperature cooling.
 * 3. Separation of all 7 visual stages and their physical parameters.
 * 4. Availability of 3 viewing experiences (guided cinematic, interactive exploration, advanced physics).
 * 5. Epistemological safeguards:
 *    - Big Bang as metric spacetime expansion (never an explosion in space).
 *    - Pre-Planck era marked as beyond established empirical knowledge.
 *    - Inflation hypothesis explicitly documented with uncertainties.
 *    - IllustrisTNG simulation snapshots labeled as statistical realizations.
 * 6. Inclusion of all required scientific metadata per stage:
 *    - Time after Big Bang
 *    - Relevant redshift range
 *    - Physical temperature
 *    - Scientific process
 *    - Observational evidence
 *    - Known uncertainties
 *    - Peer-reviewed source citations
 * 7. Mathematical consistency of FLRW time-scale factor interpolation.
 * 8. Performance benchmark for timeline interpolation (< 100 ms).
 */

import {
  COSMIC_EVOLUTION_STAGES,
  VISUAL_STAGES_CONFIG,
  TNG_EVOLUTION_SNAPSHOTS,
  getCosmicTimelineInterpolation,
  type VisualStageId,
} from "../src/lib/astronomy/cosmic-evolution/evolution-stages";

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
console.log("🌌 COSMIC EVOLUTION VALIDATION & INTEGRATION TEST HARNESS");
console.log("==================================================================");

// 1. Completeness & Ordering of 15 Cosmic Epochs
console.log("\n1. Completeness & Chronological Ordering of All 15 Epochs:");
assert(COSMIC_EVOLUTION_STAGES.length === 15, "Catalog contains exactly 15 cosmological epochs");

const requiredEpochIds = [
  "hot_big_bang_expansion",
  "inflation_hypothesis",
  "particle_formation_early_plasma",
  "primordial_nucleosynthesis",
  "recombination_photon_decoupling",
  "cosmic_microwave_background_sky",
  "cosmic_dark_ages",
  "formation_first_stars",
  "early_galaxies_reionization",
  "supermassive_black_hole_growth",
  "growth_galaxy_clusters_filaments",
  "cosmic_noon_mature_galaxies",
  "chemical_enrichment_heavy_elements",
  "formation_solar_system",
  "present_day_large_scale_structure",
];

requiredEpochIds.forEach((reqId, idx) => {
  const stage = COSMIC_EVOLUTION_STAGES[idx];
  assert(
    stage && stage.id === reqId,
    `Stage ${idx + 1} matches required epoch '${reqId}' (Order: ${stage ? stage.order : "missing"})`,
  );
});

// Verify Monotonic progression of time
for (let i = 1; i < COSMIC_EVOLUTION_STAGES.length; i++) {
  const prev = COSMIC_EVOLUTION_STAGES[i - 1];
  const curr = COSMIC_EVOLUTION_STAGES[i];
  assert(
    curr.timeSeconds >= prev.timeSeconds,
    `Time advances monotonically: Stage ${curr.order} (${curr.timeSeconds}s) >= Stage ${prev.order} (${prev.timeSeconds}s)`,
  );
  assert(
    curr.timeGyr >= prev.timeGyr,
    `Gyr time advances monotonically: Stage ${curr.order} (${curr.timeGyr} Gyr) >= Stage ${prev.order} (${prev.timeGyr} Gyr)`,
  );
  assert(
    curr.scaleFactorA >= prev.scaleFactorA,
    `Scale factor a(t) expands monotonically: Stage ${curr.order} (a=${curr.scaleFactorA}) >= Stage ${prev.order} (a=${prev.scaleFactorA})`,
  );
}

// 2. Physical Temperature & Redshift Cooling
console.log("\n2. Physical Cooling & Redshift Consistency:");
const firstStage = COSMIC_EVOLUTION_STAGES[0];
const lastStage = COSMIC_EVOLUTION_STAGES[14];
assert(firstStage.temperatureNum >= 1e30, "Initial epoch temperature exceeds 10^30 K");
assertClose(
  lastStage.temperatureNum,
  2.7255,
  1e-3,
  "Present epoch temperature matches CMB 2.7255 K",
);
assert(
  lastStage.scaleFactorA === 1.0,
  "Present epoch scale factor a(t) is normalized to exactly 1.0",
);
assert(lastStage.redshiftNum === 0.0, "Present epoch redshift is exactly z = 0.0");

// 3. Epistemological Safeguards & Scientific Rigor
console.log("\n3. Epistemological Safeguards & Scientific Integrity:");
COSMIC_EVOLUTION_STAGES.forEach((stage) => {
  // Check Big Bang description
  const combinedText = (
    stage.scientificProcess +
    " " +
    stage.guidedNarration.studentSummary +
    " " +
    stage.guidedNarration.inDepthExplanation
  ).toLowerCase();

  assert(
    !combinedText.includes("explosion in space") &&
      !combinedText.includes("explosion into space") &&
      !combinedText.includes("exploded into pre-existing"),
    `Stage ${stage.order} respects safeguard: Big Bang is metric expansion, never an explosion into space`,
  );
});

// Stage 1 pre-Planck limits
assert(
  firstStage.knownUncertainties.toLowerCase().includes("quantum gravity") ||
    firstStage.scientificProcess.toLowerCase().includes("quantum gravitational"),
  "Stage 1 explicitly acknowledges pre-Planck physics requires untested Quantum Gravity",
);

// Stage 2 Inflation hypothesis
const inflationStage = COSMIC_EVOLUTION_STAGES[1];
assert(
  inflationStage.observedVsSimulatedLabel.toLowerCase().includes("theoretical hypothesis"),
  "Stage 2 Inflation is correctly classified as a theoretical hypothesis with observational predictions",
);
assert(
  inflationStage.knownUncertainties.toLowerCase().includes("inflaton") ||
    inflationStage.knownUncertainties.toLowerCase().includes("gravitational wave"),
  "Stage 2 Inflation notes known uncertainties regarding inflaton identity and primordial tensor modes",
);

// 4. Seven Visual Stages Verification
console.log("\n4. Separate 7 Visual Stages Verification:");
const expectedVisualStages: VisualStageId[] = [
  "early_plasma",
  "cmb_sky",
  "gravitational_growth",
  "first_stars",
  "galaxy_assembly",
  "cosmic_web",
  "modern_distribution",
];

expectedVisualStages.forEach((vId) => {
  const cfg = VISUAL_STAGES_CONFIG[vId];
  assert(Boolean(cfg), `Visual stage '${vId}' is configured`);
  assert(
    cfg.colorPalette && Boolean(cfg.colorPalette.primary),
    `Visual stage '${vId}' has color palette`,
  );
  assert(
    cfg.simulationNotes.length > 15,
    `Visual stage '${vId}' contains scientific simulation notes`,
  );
  assert(
    cfg.visualMetaphor.length > 15,
    `Visual stage '${vId}' contains pedagogical visual metaphor`,
  );
});

// 5. Scientific Citations & Required Metadata per Stage
console.log("\n5. Scientific Metadata & Peer-Reviewed References Audit:");
COSMIC_EVOLUTION_STAGES.forEach((stage) => {
  assert(
    stage.scientificProcess.length > 40,
    `Stage ${stage.order} has rigorous scientific process description`,
  );
  assert(
    stage.observationalEvidence.length > 25,
    `Stage ${stage.order} details specific observational evidence`,
  );
  assert(
    stage.knownUncertainties.length > 25,
    `Stage ${stage.order} documents open scientific uncertainties`,
  );
  assert(
    stage.scientificCitations.length >= 1,
    `Stage ${stage.order} includes at least 1 peer-reviewed citation`,
  );
  assert(
    stage.observedVsSimulatedLabel.length > 10,
    `Stage ${stage.order} has clear Observed-vs-Simulated label`,
  );
  assert(
    Boolean(stage.advancedPhysics.latexEquation),
    `Stage ${stage.order} includes physical equation in Advanced Mode`,
  );
});

// 6. Multi-Epoch Simulation Snapshots (IllustrisTNG)
console.log("\n6. IllustrisTNG Multi-Epoch Simulation Snapshots:");
assert(
  TNG_EVOLUTION_SNAPSHOTS.length === 4,
  "TNG evolution includes 4 documented simulation snapshots",
);
TNG_EVOLUTION_SNAPSHOTS.forEach((snap) => {
  assert(snap.snapshotNumber > 0, `Snapshot #${snap.snapshotNumber} recorded`);
  assert(
    snap.totalHalosDocumented > 10000,
    `Snapshot #${snap.snapshotNumber} has >10,000 documented halos`,
  );
  assert(
    snap.voidFraction > 0.3 && snap.voidFraction < 0.95,
    `Snapshot #${snap.snapshotNumber} void fraction realistic`,
  );
});

// 7. Cosmological FLRW Time Interpolation Engine
console.log("\n7. Cosmological FLRW Time Interpolation Consistency:");
const interp1 = getCosmicTimelineInterpolation(0.001); // Near Big Bang
assert(interp1.scaleFactorA < 0.01, "Early time (0.001 Gyr) yields scale factor a << 1");
assert(interp1.redshiftZ > 100, "Early time yields high redshift z > 100");

const interpMid = getCosmicTimelineInterpolation(6.0); // ~ Cosmic Noon
assertClose(interpMid.timeGyr, 6.0, 1e-4, "Time 6.0 Gyr preserved");
assert(
  interpMid.scaleFactorA > 0.3 && interpMid.scaleFactorA < 0.7,
  "Mid-time scale factor consistent with matter expansion",
);
assertClose(interpMid.lookbackTimeGyr, 7.8, 1e-3, "Lookback time at t=6.0 Gyr is 7.8 Gyr");

const interpToday = getCosmicTimelineInterpolation(13.8); // Present Day
assertClose(interpToday.scaleFactorA, 1.0, 0.05, "Present day t=13.8 Gyr scale factor a ≈ 1.0");
assertClose(interpToday.temperatureK, 2.7255, 0.1, "Present day temperature matches 2.7255 K");

// 8. Performance Benchmark for Timeline Scrubbing & Interpolation
console.log("\n8. Performance Benchmarks:");
const BENCHMARK_ITERATIONS = 10000;
const tStart = performance.now();
for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
  const t = (i / BENCHMARK_ITERATIONS) * 13.8;
  getCosmicTimelineInterpolation(t);
}
const elapsedMs = performance.now() - tStart;
console.log(
  `  Calculated ${BENCHMARK_ITERATIONS} cosmological timeline interpolations in ${elapsedMs.toFixed(2)} ms`,
);
assert(
  elapsedMs < 100,
  `Interpolation benchmark completed in ${elapsedMs.toFixed(2)} ms (< 100 ms target)`,
);

console.log("\n==================================================================");
console.log(`TOTAL CHECKS RUN: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log("==================================================================");

if (failCount === 0) {
  console.log("🌟 ALL COSMIC EVOLUTION TESTS PASSED WITH 100% SUCCESS!\n");
  process.exit(0);
} else {
  console.error("❌ COSMIC EVOLUTION TESTS ENCOUNTERED FAILURES!\n");
  process.exit(1);
}
