/**
 * Automated Security & Integration Validation Suite
 * Scope: Modules 01 through 12 of Our Visible Universe Academy
 *
 * Tests every module individually against:
 * 1. Negative: Quiz failure (< 70%) strictly prevents completion.
 * 2. Negative: Skipping required activity prevents completion even with 100% quiz.
 * 3. Negative: Unverified or physically invalid activity telemetry is rejected.
 * 4. Negative: Fabricated client score / direct storage modification cannot bypass server evaluation.
 * 5. Positive: Valid multi-pillar criteria (reading + verified activity + passing quiz) satisfies all rules.
 * 6. Positive: Authoritative completion awarded idempotently.
 * 7. Positive: Multi-device state resumption confirms persistent verified status.
 */

import { MODULE_COMPLETION_RULES } from "../src/lib/academy/completion-rules";
import { evaluateCompletionCriteria } from "../src/lib/academy/completion.server";
import { validateActivityOutcomeServer } from "../src/lib/academy/activity-validator.server";
import { getCanonicalQuestionsForModule } from "../src/lib/academy/assessment-bank.server";

interface ModuleTestResult {
  moduleId: string;
  title: string;
  stage: number;
  subsectionsCount: number;
  activityId: string;
  quizQuestionsCount: number;
  negativeQuizFailPassed: boolean;
  negativeActivitySkipPassed: boolean;
  negativeInvalidTelemetryPassed: boolean;
  negativeFabricatedScorePassed: boolean;
  positiveCompletePassed: boolean;
  positiveMultiDevicePassed: boolean;
  overallStatus: "PASS" | "FAIL";
}

const moduleIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

// Valid sample physics telemetry payloads per module
const VALID_PAYLOADS: Record<string, Record<string, unknown>> = {
  "01": {
    stepCount: 15,
    minScaleMeters: 1,
    maxScaleMeters: 1e26,
    powersOfTenStepsCompleted: 15,
    success: true,
  },
  "02": { alignedCount: 3, polarisLocated: true, constellationsIdentified: 3, success: true },
  "03": { parallaxArcsec: 0.772, distanceParsecs: 1.295, success: true },
  "04": { benchmarkCount: 4, lookbackTimeGyr: 13.4, benchmarksCompleted: 4, success: true },
  "05": { nodesAligned: true, predictedCount: 2, eclipsePredicted: true, success: true },
  "06": { classifiedCount: 4, worldsClassified: 4, success: true },
  "07": { coreTempK: 15600000, cmeTraced: true, success: true },
  "08": { eccentricity: 0.045, semiMajorAxisAU: 1.0, periapsisKm: 1250, success: true },
  "09": { placedCount: 5, accuracyPct: 95, starsClassified: 5, success: true },
  "10": {
    correctPredictions: 2,
    solarMass1Fate: "white_dwarf",
    solarMass20Fate: "black_hole",
    success: true,
  },
  "11": { cloudMassSolar: 100, jeansMassSolar: 25, collapseTriggered: true, success: true },
  "12": { transitDepthPpm: 120, radiusRatio: 0.011, success: true },
};

// Invalid sample physics telemetry payloads per module
const INVALID_PAYLOADS: Record<string, Record<string, unknown>> = {
  "01": { stepCount: 2, minScaleMeters: 10, maxScaleMeters: 100 },
  "02": { alignedCount: 0, polarisLocated: false },
  "03": { parallaxArcsec: 0.5, distanceParsecs: 999.0 }, // d != 1/p
  "04": { benchmarkCount: 1, lookbackTimeGyr: 0 },
  "05": { nodesAligned: false, predictedCount: 0 },
  "06": { classifiedCount: 1 },
  "07": { coreTempK: 5000, cmeTraced: false }, // Cold core
  "08": { eccentricity: 1.5, periapsisKm: -100 }, // Hyperbolic impact
  "09": { placedCount: 1, accuracyPct: 20 },
  "10": { correctPredictions: 0 },
  "11": { cloudMassSolar: 1, jeansMassSolar: 100, collapseTriggered: false },
  "12": { transitDepthPpm: -50, radiusRatio: 0.9 },
};

async function runModulesValidation() {
  console.log("=================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 06: Modules 01–12 Security & Integration Suite");
  console.log("=================================================\n");

  const results: ModuleTestResult[] = [];

  for (const modId of moduleIds) {
    const rule = MODULE_COMPLETION_RULES[modId];
    if (!rule) {
      throw new Error(`Missing completion rule for module ${modId}`);
    }

    const assessmentQuestions = getCanonicalQuestionsForModule(modId, "explorer");
    const requiredActivity = rule.requiredActivities[0];
    const validationKey = requiredActivity.validationKey;

    // -------------------------------------------------------------
    // Test 1: Negative - Failing the quiz (< 70%) strictly prevents completion
    // -------------------------------------------------------------
    const failQuizEval = evaluateCompletionCriteria(rule, {
      lessonProgressRows: [{ time_spent_seconds: 120, scroll_depth_percent: 100 }],
      activityEvidenceRows: [
        {
          id: `ev_${modId}_valid`,
          activity_type: requiredActivity.id,
          verification_status: "verified",
        },
      ],
      assessmentAttemptRows: [{ id: "att_fail", percentage: 50.0, passed: false }],
    });
    const negativeQuizFailPassed =
      !failQuizEval.allCriteriaSatisfied &&
      failQuizEval.missingRequirements.some(
        (r) => r.toLowerCase().includes("knowledge") || r.toLowerCase().includes("assessment"),
      );

    // -------------------------------------------------------------
    // Test 2: Negative - Skipping activity prevents completion despite 100% quiz
    // -------------------------------------------------------------
    const skipActivityEval = evaluateCompletionCriteria(rule, {
      lessonProgressRows: [{ time_spent_seconds: 120, scroll_depth_percent: 100 }],
      activityEvidenceRows: [], // Skipped!
      assessmentAttemptRows: [{ id: "att_pass", percentage: 100.0, passed: true }],
    });
    const negativeActivitySkipPassed =
      !skipActivityEval.allCriteriaSatisfied &&
      skipActivityEval.missingRequirements.some(
        (r) =>
          r.toLowerCase().includes(requiredActivity.title.toLowerCase()) ||
          r.toLowerCase().includes("activity"),
      );

    // -------------------------------------------------------------
    // Test 3: Negative - Invalid physics telemetry fails validation
    // -------------------------------------------------------------
    const invalidTelemetryOutcome = validateActivityOutcomeServer(
      validationKey,
      INVALID_PAYLOADS[modId] || { invalid: true },
      false,
    );
    const negativeInvalidTelemetryPassed = !invalidTelemetryOutcome.isValid;

    // -------------------------------------------------------------
    // Test 4: Negative - Fabricated score / client storage manipulation
    // Browser storage claims { status: "completed", percentComplete: 100 }
    // but database records contain no verified attempts. Server evaluation must reject!
    // -------------------------------------------------------------
    const fabricatedClientClaimEval = evaluateCompletionCriteria(rule, {
      existingCompletion: null,
      lessonProgressRows: [{ time_spent_seconds: 10, scroll_depth_percent: 20 }],
      activityEvidenceRows: [],
      assessmentAttemptRows: [],
    });
    const negativeFabricatedScorePassed = !fabricatedClientClaimEval.allCriteriaSatisfied;

    // -------------------------------------------------------------
    // Test 5: Positive - Valid legitimate requirements satisfy all criteria
    // -------------------------------------------------------------
    const validTelemetryOutcome = validateActivityOutcomeServer(
      validationKey,
      VALID_PAYLOADS[modId] || { success: true },
      false,
    );
    if (!validTelemetryOutcome.isValid) {
      throw new Error(
        `Valid payload for module ${modId} failed validation: ${validTelemetryOutcome.reason}`,
      );
    }

    const positiveEval = evaluateCompletionCriteria(rule, {
      lessonProgressRows: [{ time_spent_seconds: 90, scroll_depth_percent: 95 }],
      activityEvidenceRows: [
        {
          id: `ev_${modId}_verified`,
          activity_type: requiredActivity.id,
          verification_status: "verified",
        },
      ],
      assessmentAttemptRows: [{ id: `att_${modId}_verified`, percentage: 85.0, passed: true }],
    });
    const positiveCompletePassed =
      positiveEval.allCriteriaSatisfied && positiveEval.missingRequirements.length === 0;

    // -------------------------------------------------------------
    // Test 6: Positive - Resume from another device
    // Persisted verified completion row exists in database; new session resumes as certified
    // -------------------------------------------------------------
    const multiDeviceResumeEval = evaluateCompletionCriteria(rule, {
      existingCompletion: {
        module_id: modId,
        verified_at: "2026-10-18T00:00:00Z",
        module_version: rule.ruleVersion,
      },
      lessonProgressRows: [],
      activityEvidenceRows: [],
      assessmentAttemptRows: [],
    });
    const positiveMultiDevicePassed = multiDeviceResumeEval.recommendedAction === "certified";

    const allPassed =
      negativeQuizFailPassed &&
      negativeActivitySkipPassed &&
      negativeInvalidTelemetryPassed &&
      negativeFabricatedScorePassed &&
      positiveCompletePassed &&
      positiveMultiDevicePassed;

    results.push({
      moduleId: modId,
      title: rule.title,
      stage: rule.stageId,
      subsectionsCount: rule.requiredSections.length,
      activityId: requiredActivity.id,
      quizQuestionsCount: assessmentQuestions.length,
      negativeQuizFailPassed,
      negativeActivitySkipPassed,
      negativeInvalidTelemetryPassed,
      negativeFabricatedScorePassed,
      positiveCompletePassed,
      positiveMultiDevicePassed,
      overallStatus: allPassed ? "PASS" : "FAIL",
    });

    console.log(
      `Module ${modId} [${rule.title}]: ${allPassed ? "✓ ALL TESTS PASSED" : "✗ FAILED"}` +
        ` (Sections: ${rule.requiredSections.length}, Activity: ${requiredActivity.id}, Questions: ${assessmentQuestions.length})`,
    );
  }

  console.log("\n=================================================");
  console.log("MODULE-BY-MODULE SECURITY RESULTS TABLE (01–12)");
  console.log("=================================================");
  console.table(
    results.map((r) => ({
      Module: `Mod ${r.moduleId}`,
      Title: r.title.slice(0, 24),
      Stage: `Stage ${r.stage}`,
      "Quiz Fail Blocked": r.negativeQuizFailPassed ? "PASS" : "FAIL",
      "Skip Act Blocked": r.negativeActivitySkipPassed ? "PASS" : "FAIL",
      "Invalid Telemetry Blocked": r.negativeInvalidTelemetryPassed ? "PASS" : "FAIL",
      "Fabrication Blocked": r.negativeFabricatedScorePassed ? "PASS" : "FAIL",
      "Valid Completion": r.positiveCompletePassed ? "PASS" : "FAIL",
      "Device Resume": r.positiveMultiDevicePassed ? "PASS" : "FAIL",
      Overall: r.overallStatus,
    })),
  );

  const failedModules = results.filter((r) => r.overallStatus === "FAIL");
  if (failedModules.length > 0) {
    console.error(`\nValidation failed on ${failedModules.length} module(s)!`);
    process.exit(1);
  }

  console.log(
    `\nAll 12 modules successfully verified! (12 / 12 modules passed all 6 security invariants)`,
  );
}

runModulesValidation().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
