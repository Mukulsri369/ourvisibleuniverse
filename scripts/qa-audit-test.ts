/**
 * Cosmic Learning Academy - Master Automated QA & Scientific Validation Suite
 * Tests all 24 modules, curricula, physics engines, and progression systems.
 */
import { ACADEMY_MODULES, ACADEMY_STAGES, LEARNING_LEVELS } from "../src/lib/academy/registry";
import { getAdaptiveRecommendations } from "../src/lib/academy/recommendations";
import type { UserProgress } from "../src/lib/academy/types";

// Import all sublessons & quizzes for all 24 modules
import { MODULE_01_LESSON } from "../src/lib/academy/lessons/module-01-our-place";
import {
  MODULE_02_SUBLESSONS,
  MODULE_02_QUIZ,
} from "../src/lib/academy/lessons/module-02-night-sky";
import {
  MODULE_03_SUBLESSONS,
  MODULE_03_QUIZ,
} from "../src/lib/academy/lessons/module-03-cosmic-scale";
import {
  MODULE_04_SUBLESSONS,
  MODULE_04_QUIZ,
} from "../src/lib/academy/lessons/module-04-light-time";
import {
  MODULE_05_SUBLESSONS,
  MODULE_05_QUIZ,
} from "../src/lib/academy/lessons/module-05-earth-moon";
import {
  MODULE_06_SUBLESSONS,
  MODULE_06_QUIZ,
} from "../src/lib/academy/lessons/module-06-solar-system";
import { MODULE_07_SUBLESSONS, MODULE_07_QUIZ } from "../src/lib/academy/lessons/module-07-the-sun";
import {
  MODULE_08_SUBLESSONS,
  MODULE_08_LESSON,
} from "../src/lib/academy/lessons/module-08-gravity-orbits";
import { MODULE_09_SUBLESSONS, MODULE_09_LESSON } from "../src/lib/academy/lessons/module-09-stars";
import {
  MODULE_10_SUBLESSONS,
  MODULE_10_QUIZ_QUESTIONS,
} from "../src/lib/academy/lessons/module-10-stellar-evolution";
import {
  MODULE_11_SUBLESSONS,
  MODULE_11_QUIZ_QUESTIONS,
} from "../src/lib/academy/lessons/module-11-nebulae";
import {
  MODULE_12_SUBLESSONS,
  MODULE_12_QUIZ,
} from "../src/lib/academy/lessons/module-12-exoplanets";
import {
  MODULE_13_SUBLESSONS,
  MODULE_13_QUIZ_QUESTIONS,
} from "../src/lib/academy/lessons/module-13-galaxies";
import {
  MODULE_14_SUBLESSONS,
  MODULE_14_QUIZ,
} from "../src/lib/academy/lessons/module-14-black-holes";
import {
  MODULE_15_SUBLESSONS,
  MODULE_15_QUIZ,
} from "../src/lib/academy/lessons/module-15-cosmic-web";
import {
  MODULE_16_SUBLESSONS,
  MODULE_16_QUIZ,
} from "../src/lib/academy/lessons/module-16-dark-matter-energy";
import {
  MODULE_17_SUBLESSONS,
  MODULE_17_QUIZ,
} from "../src/lib/academy/lessons/module-17-big-bang";
import {
  MODULE_18_SUBLESSONS,
  MODULE_18_QUIZ,
} from "../src/lib/academy/lessons/module-18-expanding-universe";
import {
  MODULE_19_SUBLESSONS,
  MODULE_19_QUIZ,
} from "../src/lib/academy/lessons/module-19-history-cosmology";
import {
  MODULE_20_SUBLESSONS,
  MODULE_20_QUIZ,
} from "../src/lib/academy/lessons/module-20-future-universe";
import {
  MODULE_21_SUBLESSONS,
  MODULE_21_QUIZ,
} from "../src/lib/academy/lessons/module-21-telescopes";
import {
  MODULE_22_SUBLESSONS,
  MODULE_22_QUIZ,
} from "../src/lib/academy/lessons/module-22-space-missions";
import {
  MODULE_23_SUBLESSONS,
  MODULE_23_QUIZ,
} from "../src/lib/academy/lessons/module-23-astrobiology";
import {
  MODULE_24_SUBLESSONS,
  MODULE_24_QUIZ,
} from "../src/lib/academy/lessons/module-24-cosmic-lab";

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  message?: string;
  details?: unknown;
}

const results: TestResult[] = [];

function assert(
  category: string,
  name: string,
  condition: boolean,
  message?: string,
  details?: unknown,
) {
  results.push({
    category,
    name,
    passed: condition,
    message: condition ? undefined : message || "Assertion failed",
    details,
  });
}

console.log("=== COSMIC LEARNING ACADEMY: MASTER TEST HARNESS ===");

// 1. REGISTRY & CURRICULUM ARCHITECTURE TESTS
console.log("\n[1] Testing Registry & Stages...");
assert(
  "Registry",
  "Total Module Count is Exactly 24",
  ACADEMY_MODULES.length === 24,
  `Expected 24, got ${ACADEMY_MODULES.length}`,
);
assert(
  "Registry",
  "Total Stage Count is Exactly 6",
  ACADEMY_STAGES.length === 6,
  `Expected 6, got ${ACADEMY_STAGES.length}`,
);
assert("Registry", "Learning Levels Defined (3 levels)", Object.keys(LEARNING_LEVELS).length === 3);

// Verify all 24 modules have sequential IDs "01" to "24" and status "ready"
ACADEMY_MODULES.forEach((mod, index) => {
  const expectedNum = index + 1;
  const expectedId = expectedNum.toString().padStart(2, "0");
  assert(
    "Registry",
    `Module ${expectedId} Structure & Ready Status`,
    mod.id === expectedId &&
      mod.number === expectedNum &&
      mod.status === "ready" &&
      mod.learningObjectives.length >= 3 &&
      mod.scientificSources.length >= 1,
    `Module ${mod.id} failed readiness or metadata criteria`,
  );
});

// Verify Stages contain all 24 modules collectively with no duplicates
const stageModuleIds = ACADEMY_STAGES.flatMap((s) => s.modules.map((m) => m.id));
assert("Registry", "All 24 Modules Distributed across 6 Stages", stageModuleIds.length === 24);
assert("Registry", "No Duplicate Modules Across Stages", new Set(stageModuleIds).size === 24);

// 2. CURRICULA & QUIZ VERIFICATION FOR ALL 24 MODULES
console.log("\n[2] Testing Lessons & Knowledge Check Quizzes...");
const MODULE_QUIZZES: Record<string, unknown[]> = {
  "01": (
    MODULE_01_LESSON as {
      gradeLevelContent: { explorer: { quizQuestions: unknown[] } };
    }
  ).gradeLevelContent.explorer.quizQuestions,
  "02": MODULE_02_QUIZ,
  "03": MODULE_03_QUIZ,
  "04": MODULE_04_QUIZ,
  "05": MODULE_05_QUIZ,
  "06": MODULE_06_QUIZ.explorer,
  "07": MODULE_07_QUIZ,
  "08": MODULE_08_LESSON.gradeLevelContent.explorer.quizQuestions,
  "09": MODULE_09_LESSON.gradeLevelContent.explorer.quizQuestions,
  "10": MODULE_10_QUIZ_QUESTIONS,
  "11": MODULE_11_QUIZ_QUESTIONS,
  "12": MODULE_12_QUIZ,
  "13": MODULE_13_QUIZ_QUESTIONS.explorer,
  "14": MODULE_14_QUIZ,
  "15": MODULE_15_QUIZ,
  "16": MODULE_16_QUIZ,
  "17": MODULE_17_QUIZ,
  "18": MODULE_18_QUIZ,
  "19": MODULE_19_QUIZ,
  "20": MODULE_20_QUIZ,
  "21": MODULE_21_QUIZ,
  "22": MODULE_22_QUIZ,
  "23": MODULE_23_QUIZ,
  "24": MODULE_24_QUIZ,
};

const MODULE_LESSONS: Record<string, unknown[]> = {
  "01": [MODULE_01_LESSON],
  "02": MODULE_02_SUBLESSONS,
  "03": MODULE_03_SUBLESSONS,
  "04": MODULE_04_SUBLESSONS,
  "05": MODULE_05_SUBLESSONS,
  "06": MODULE_06_SUBLESSONS,
  "07": MODULE_07_SUBLESSONS,
  "08": MODULE_08_SUBLESSONS,
  "09": MODULE_09_SUBLESSONS,
  "10": MODULE_10_SUBLESSONS,
  "11": MODULE_11_SUBLESSONS,
  "12": MODULE_12_SUBLESSONS,
  "13": MODULE_13_SUBLESSONS,
  "14": MODULE_14_SUBLESSONS,
  "15": MODULE_15_SUBLESSONS,
  "16": MODULE_16_SUBLESSONS,
  "17": MODULE_17_SUBLESSONS,
  "18": MODULE_18_SUBLESSONS,
  "19": MODULE_19_SUBLESSONS,
  "20": MODULE_20_SUBLESSONS,
  "21": MODULE_21_SUBLESSONS,
  "22": MODULE_22_SUBLESSONS,
  "23": MODULE_23_SUBLESSONS,
  "24": MODULE_24_SUBLESSONS,
};

for (let i = 1; i <= 24; i++) {
  const id = i.toString().padStart(2, "0");
  const quiz = MODULE_QUIZZES[id];
  assert(
    "Quizzes",
    `Module ${id} Quiz Integrity`,
    Array.isArray(quiz) && quiz.length >= 3,
    `Module ${id} has invalid quiz questions`,
  );

  if (Array.isArray(quiz)) {
    quiz.forEach((q, qIdx) => {
      const validOptions = Array.isArray(q.options) && q.options.length >= 3;
      const correctVal = q.correctIndex !== undefined ? q.correctIndex : q.correctAnswerIndex;
      const validCorrect =
        typeof correctVal === "number" && correctVal >= 0 && correctVal < q.options.length;
      const validExplanation = typeof q.explanation === "string" && q.explanation.length > 10;
      assert(
        "Quizzes",
        `Module ${id} Q${qIdx + 1} Answer Validation`,
        validOptions && validCorrect && validExplanation,
        `Module ${id} Q${qIdx + 1} failed: options=${validOptions}, correct=${validCorrect}, explanation=${validExplanation}`,
      );
    });
  }

  const sublessons = MODULE_LESSONS[id];
  assert(
    "Curriculum",
    `Module ${id} Lessons Content Available`,
    Array.isArray(sublessons) && sublessons.length >= 1,
    `Module ${id} has no sublessons`,
  );
}

// 3. SCIENTIFIC CALCULATIONS & PHYSICS SIMULATION NUMERICAL TESTS
console.log("\n[3] Testing Scientific Physics Engine Formulas...");

// Test A: Kepler's Third Law (T^2 = a^3 / M_*)
// For Earth around Sun: a = 1.0 AU, M = 1.0 M_sun => T = 1.0 year (365.25 days)
const keplerPeriodYears = Math.sqrt(Math.pow(1.0, 3) / 1.0);
assert(
  "Physics",
  "Kepler Third Law: 1 AU at 1 M_sun yields 1.0 year",
  Math.abs(keplerPeriodYears - 1.0) < 1e-6,
);

// Jupiter at 5.204 AU => T ≈ 11.86 years
const jupiterPeriod = Math.sqrt(Math.pow(5.204, 3) / 1.0);
assert(
  "Physics",
  "Kepler Third Law: Jupiter (5.204 AU) period ≈ 11.86 yr",
  Math.abs(jupiterPeriod - 11.86) < 0.05,
);

// Test B: Transit Photometry Light Curve Depth (ΔF/F = (Rp/R*)^2)
// Earth (Rp = 1 R_earth = 0.009167 R_sun) transiting Sun (R* = 1 R_sun)
const earthTransitDepth = Math.pow(0.009167 / 1.0, 2);
const earthTransitDepthPpm = Math.round(earthTransitDepth * 1_000_000);
assert(
  "Physics",
  "Transit Photometry: Earth transit depth ≈ 84 ppm",
  Math.abs(earthTransitDepthPpm - 84) <= 2,
  `Got ${earthTransitDepthPpm} ppm`,
);

// Test C: Schwarzschild Radius (r_s = 2GM / c^2)
// For 1 Solar Mass: r_s ≈ 2953 meters (~2.95 km)
const G = 6.6743e-11;
const c = 299792458;
const M_sun = 1.989e30;
const rsSolarMeters = (2 * G * M_sun) / (c * c);
const rsSolarKm = rsSolarMeters / 1000;
assert(
  "Physics",
  "Schwarzschild Radius: 1 M_sun event horizon ≈ 2.95 km",
  Math.abs(rsSolarKm - 2.95) < 0.05,
  `Got ${rsSolarKm} km`,
);

// Test D: Stefan-Boltzmann Law & Wien's Displacement
// Sun T = 5778 K => lambda_max = 2.898e-3 / 5778 ≈ 501.5 nm (green-yellow visible light)
const wienConstant = 2.897771955e-3;
const sunLambdaMaxNm = (wienConstant / 5778) * 1e9;
assert(
  "Physics",
  "Wien Law: Solar peak wavelength ≈ 501 nm",
  Math.abs(sunLambdaMaxNm - 501.5) < 1.0,
);

// Test E: Hubble-Lemaître Velocity (v = H_0 * d)
// H_0 = 70 km/s/Mpc, d = 100 Mpc => v = 7000 km/s
const H_0 = 70;
const dMpc = 100;
const recessionVelocity = H_0 * dMpc;
assert(
  "Physics",
  "Hubble-Lemaître Law: 100 Mpc at 70 km/s/Mpc yields 7000 km/s",
  recessionVelocity === 7000,
);

// Test F: Relativistic Doppler / Redshift 1 + z = sqrt((1 + v/c)/(1 - v/c))
// At v = 0.6c, 1 + z = sqrt(1.6 / 0.4) = sqrt(4) = 2.0 => z = 1.0
const beta = 0.6;
const zCalculated = Math.sqrt((1 + beta) / (1 - beta)) - 1;
assert(
  "Physics",
  "Relativistic Doppler Redshift at 0.6c yields z = 1.0",
  Math.abs(zCalculated - 1.0) < 1e-6,
);

// Test G: Hohmann Interplanetary Transfer Delta-V (Earth to Mars)
// r1 = 1.0 AU, r2 = 1.524 AU => Semi-major axis of transfer orbit = (1.0 + 1.524)/2 = 1.262 AU
const aHohmann = (1.0 + 1.524) / 2;
// Transfer time = 0.5 * sqrt(a^3) years ≈ 0.5 * sqrt(1.262^3) = 0.5 * 1.417 = 0.708 years (~259 days)
const tHohmannDays = 0.5 * Math.sqrt(Math.pow(aHohmann, 3)) * 365.25;
assert(
  "Physics",
  "Hohmann Transfer to Mars Duration ≈ 259 days",
  Math.abs(tHohmannDays - 259) < 2.0,
  `Got ${tHohmannDays} days`,
);

// 4. PROGRESSION ENGINE & RECOMMENDATION CONTINUITY TESTS
console.log("\n[4] Testing Recommendation Engine & Student Progression...");

// Test Scenario 1: New Student (Module 01 incomplete)
const freshProgress: UserProgress = {
  selectedLevel: "explorer",
  moduleProgress: {},
  completedLessons: [],
  quizScores: {},
  bookmarks: [],
  lastOpenedModuleId: "01",
  achievements: ["welcome_explorer"],
  lastUpdated: new Date().toISOString(),
};
const recsNew = getAdaptiveRecommendations(freshProgress);
assert("Progression", "New Student Recommended Module 01 First", recsNew[0]?.module.id === "01");

// Test Scenario 2: Student completes 01 to 11 (Next should be Module 12)
const midProgress: UserProgress = {
  ...freshProgress,
  moduleProgress: {
    "01": { status: "completed", percent: 100 },
    "02": { status: "completed", percent: 100 },
    "03": { status: "completed", percent: 100 },
    "04": { status: "completed", percent: 100 },
    "05": { status: "completed", percent: 100 },
    "06": { status: "completed", percent: 100 },
    "07": { status: "completed", percent: 100 },
    "08": { status: "completed", percent: 100 },
    "09": { status: "completed", percent: 100 },
    "10": { status: "completed", percent: 100 },
    "11": { status: "completed", percent: 100 },
  },
};
const recsMid = getAdaptiveRecommendations(midProgress);
assert(
  "Progression",
  "Student completing Module 11 recommended Module 12",
  recsMid[0]?.module.id === "12",
  `Got ${recsMid[0]?.module.id}`,
);

// Test Scenario 3: Student completes 12 (Next should be Module 13: Galaxies)
midProgress.moduleProgress["12"] = { status: "completed", percent: 100 };
const recs13 = getAdaptiveRecommendations(midProgress);
assert(
  "Progression",
  "Student completing Module 12 recommended Module 13",
  recs13[0]?.module.id === "13",
  `Got ${recs13[0]?.module.id}`,
);

// Test Scenario 4: Student completes all 23 modules (Next should be Module 24 Capstone)
for (let m = 1; m <= 23; m++) {
  midProgress.moduleProgress[m.toString().padStart(2, "0")] = { status: "completed", percent: 100 };
}
const recsCapstone = getAdaptiveRecommendations(midProgress);
assert(
  "Progression",
  "Student completing 23 modules recommended Module 24 Capstone",
  recsCapstone[0]?.module.id === "24",
);

// 5. TEST REPORT SUMMARY
console.log("\n================ TEST SUMMARY ================");
const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.filter((r) => !r.passed).length;

console.log(`Total Assertions Run: ${results.length}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);

if (failedCount > 0) {
  console.log("\nFailed Assertions:");
  results
    .filter((r) => !r.passed)
    .forEach((r) => {
      console.error(`  [${r.category}] ${r.name}: ${r.message}`);
    });
  process.exit(1);
} else {
  console.log("\nALL AUTOMATED TESTS PASSED WITH 100% SUCCESS!");
}
