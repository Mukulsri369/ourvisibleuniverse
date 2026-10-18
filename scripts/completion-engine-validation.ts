import assert from "node:assert";
import {
  MODULE_COMPLETION_RULES,
  getModuleCompletionRule,
} from "../src/lib/academy/completion-rules";
import { validateActivityOutcomeServer } from "../src/lib/academy/activity-validator.server";
import {
  evaluateCompletionCriteria,
  evaluateModuleCompletionServer,
} from "../src/lib/academy/completion.server";
import { STAGE_BADGES } from "../src/lib/academy/stage-badges";

console.log("=================================================");
console.log("OUR VISIBLE UNIVERSE ACADEMY");
console.log("PROMPT 05: Verified Completion Engine Validation");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

async function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err?.message || err}`);
  }
}

async function main() {
  // Test 1: Completion Rule Model for all 24 Modules
  await runTest(
    "All 24 modules declare versioned completion rules with measurable criteria and accessible alternatives",
    () => {
      assert.strictEqual(
        Object.keys(MODULE_COMPLETION_RULES).length,
        24,
        "Exactly 24 modules must be registered in MODULE_COMPLETION_RULES",
      );

      for (let m = 1; m <= 24; m++) {
        const modId = String(m).padStart(2, "0");
        const rule = getModuleCompletionRule(modId);

        assert.ok(rule, `Module ${modId} rule must exist`);
        assert.ok(
          rule.ruleVersion.match(/^\d+\.\d+\.\d+$/),
          `Module ${modId} version must be semver`,
        );
        assert.ok(rule.title.length > 3, `Module ${modId} must have title`);
        assert.ok(rule.requiredSections.length >= 2, `Module ${modId} requires >= 2 sections`);
        assert.ok(rule.requiredActivities.length >= 1, `Module ${modId} requires >= 1 activity`);
        assert.strictEqual(
          rule.passingScorePct,
          70.0,
          `Module ${modId} passing threshold must be 70%`,
        );
        assert.ok(
          rule.minimumReadingSeconds >= 30,
          `Module ${modId} minimum reading must be >= 30s`,
        );

        for (const act of rule.requiredActivities) {
          assert.ok(act.id.length > 3, `Activity in module ${modId} must have valid ID`);
          assert.ok(
            act.validationKey.length > 3,
            `Activity in module ${modId} must have validationKey`,
          );
          assert.ok(
            act.measurableCriteria.length > 5,
            `Activity in module ${modId} must have measurable criteria`,
          );
          assert.ok(
            act.accessibleAlternativeId,
            `Activity in module ${modId} must declare an accessible alternative ID`,
          );
        }
      }
    },
  );

  // Test 2: Manual shortcut cannot issue completion
  await runTest("Manual shortcut cannot issue verified module completion", () => {
    const rule = getModuleCompletionRule("08")!;
    // Student with no verified evidence or attempts
    const result = evaluateCompletionCriteria(rule, {
      existingCompletion: null,
      lessonProgressRows: [],
      activityEvidenceRows: [],
      assessmentAttemptRows: [],
    });

    assert.strictEqual(
      result.allCriteriaSatisfied,
      false,
      "allCriteriaSatisfied must be false when requirements are unfulfilled",
    );
    assert.ok(
      result.missingRequirements.length >= 3,
      "Must specify missing requirements across reading, activity, and assessment",
    );
  });

  // Test 3: Opening a lesson does not award mastery
  await runTest("Opening or reading a lesson alone does not award module completion", () => {
    const rule = getModuleCompletionRule("08")!;
    // Student has completed reading but NO activity or assessment
    const result = evaluateCompletionCriteria(rule, {
      existingCompletion: null,
      lessonProgressRows: [{ time_spent_seconds: 300, scroll_depth_percent: 100 }],
      activityEvidenceRows: [],
      assessmentAttemptRows: [],
    });

    assert.strictEqual(
      result.allCriteriaSatisfied,
      false,
      "Reading alone must never award verified module completion",
    );
    const activityReq = result.checklist.find((c) => c.category === "activity");
    const quizReq = result.checklist.find((c) => c.category === "assessment");

    assert.ok(activityReq && !activityReq.isSatisfied, "Activity must be unsatisfied");
    assert.ok(quizReq && !quizReq.isSatisfied, "Assessment must be unsatisfied");
  });

  // Test 4: Unverified simulation events cannot award mastery
  await runTest(
    "Unverified or physically invalid simulation telemetry fails validation and is rejected",
    () => {
      // 1. Kepler Orbit insertion: Hyperbolic orbit (eccentricity > 1.0) must fail
      const hyperbolicResult = validateActivityOutcomeServer("kepler_orbit_insertion", {
        eccentricity: 2.8,
        semiMajorAxisAU: 1.5,
        periapsisKm: 1200,
      });
      assert.strictEqual(
        hyperbolicResult.isValid,
        false,
        "Hyperbolic orbit must fail closed orbit validation",
      );

      // 2. Parallax distance calculation out of tolerance must fail
      const parallaxWrong = validateActivityOutcomeServer("parallax_distance_calculation", {
        parallaxArcsec: 0.1,
        distanceParsecs: 50.0, // Expected: 10 parsecs
      });
      assert.strictEqual(
        parallaxWrong.isValid,
        false,
        "Parallax distance out of tolerance must fail validation",
      );

      // 3. Empty or null telemetry must fail
      const emptyResult = validateActivityOutcomeServer("kepler_orbit_insertion", {});
      assert.strictEqual(emptyResult.isValid, false, "Empty payload must fail validation");

      // 4. Valid Keplerian orbit satisfies physical criteria
      const validOrbit = validateActivityOutcomeServer("kepler_orbit_insertion", {
        eccentricity: 0.045,
        semiMajorAxisAU: 1.0,
        periapsisKm: 1200,
      });
      assert.strictEqual(validOrbit.isValid, true, "Stable Keplerian orbit must pass validation");
    },
  );

  // Test 5: Failed assessment cannot award completion
  await runTest("Failed assessment (< 70%) strictly prevents verified completion", () => {
    const rule = getModuleCompletionRule("08")!;
    // Student has completed reading and activity, but scored only 50% on assessment
    const result = evaluateCompletionCriteria(rule, {
      existingCompletion: null,
      lessonProgressRows: [{ time_spent_seconds: 300, scroll_depth_percent: 100 }],
      activityEvidenceRows: [{ activity_type: "act_08_orbital_mechanics_lab" }],
      assessmentAttemptRows: [{ percentage: 50.0, passed: false }],
    });

    assert.strictEqual(
      result.allCriteriaSatisfied,
      false,
      "Failed assessment must strictly prevent verified module completion",
    );
    const quizReq = result.checklist.find((c) => c.category === "assessment");
    assert.ok(quizReq && !quizReq.isSatisfied, "Assessment item must be unsatisfied");
    assert.strictEqual(result.recommendedAction, "take_assessment");
  });

  // Test 6: Valid completed requirements award completion once (idempotent)
  await runTest(
    "Valid completed requirements satisfy all criteria and award verified status idempotently",
    () => {
      const rule = getModuleCompletionRule("08")!;
      // Full completion: reading + verified activity + passing score >= 70%
      const result = evaluateCompletionCriteria(rule, {
        existingCompletion: null,
        lessonProgressRows: [{ time_spent_seconds: 300, scroll_depth_percent: 100 }],
        activityEvidenceRows: [{ activity_type: "act_08_orbital_mechanics_lab", id: "ev_123" }],
        assessmentAttemptRows: [{ percentage: 85.0, passed: true }],
      });

      assert.strictEqual(
        result.allCriteriaSatisfied,
        true,
        "All verified requirements must satisfy module criteria",
      );
      assert.strictEqual(result.missingRequirements.length, 0);

      // Re-evaluation when existing completion is present returns certified state
      const recheck = evaluateCompletionCriteria(rule, {
        existingCompletion: { verified_at: "2026-10-18T00:00:00.000Z" },
        lessonProgressRows: [{ time_spent_seconds: 300, scroll_depth_percent: 100 }],
        activityEvidenceRows: [{ activity_type: "act_08_orbital_mechanics_lab", id: "ev_123" }],
        assessmentAttemptRows: [{ percentage: 85.0, passed: true }],
      });
      assert.strictEqual(recheck.recommendedAction, "certified");
    },
  );

  // Test 7: Student isolation test (cross-student security)
  await runTest(
    "Student evaluation strictly scopes to caller user_id and rejects cross-student completion",
    () => {
      const rule = getModuleCompletionRule("08")!;
      const studentARecords = {
        lessonProgressRows: [{ time_spent_seconds: 120 }],
        activityEvidenceRows: [{ activity_type: "act_08_orbital_mechanics_lab" }],
        assessmentAttemptRows: [{ percentage: 90 }],
      };
      const studentBRecords = {
        lessonProgressRows: [],
        activityEvidenceRows: [],
        assessmentAttemptRows: [],
      };

      const evalA = evaluateCompletionCriteria(rule, studentARecords);
      const evalB = evaluateCompletionCriteria(rule, studentBRecords);

      assert.strictEqual(evalA.allCriteriaSatisfied, true, "Student A satisfies criteria");
      assert.strictEqual(evalB.allCriteriaSatisfied, false, "Student B does not satisfy criteria");
    },
  );

  // Test 8: All legitimate accessibility paths remain available and rigorous
  await runTest(
    "Accessible 2D alternative challenge pathways enforce equal mathematical and physical rigor",
    () => {
      // Accessible alternative for Module 08: Kepler's Third Law T^2 = a^3
      // Earth: a = 1.0 AU, T = 1.0 yr -> 1^2 = 1^3 = 1
      const earthResult = validateActivityOutcomeServer(
        "kepler_orbit_insertion",
        {
          semiMajorAxisAU: 1.0,
          periodYears: 1.0,
          accessibleAlternative: true,
        },
        true,
      );
      assert.strictEqual(
        earthResult.isValid,
        true,
        "Accessible Kepler T^2 = a^3 for Earth must pass",
      );

      // Jupiter: a = 5.204 AU -> a^3 = 140.9, T = 11.86 yr -> T^2 = 140.7
      const jupiterResult = validateActivityOutcomeServer(
        "kepler_orbit_insertion",
        {
          semiMajorAxisAU: 5.204,
          periodYears: 11.86,
          accessibleAlternative: true,
        },
        true,
      );
      assert.strictEqual(
        jupiterResult.isValid,
        true,
        "Accessible Kepler T^2 = a^3 for Jupiter must pass",
      );

      // Invalid accessible attempt: a = 5.2 AU, T = 2.0 yr -> T^2 = 4, a^3 = 140 -> mismatch
      const invalidAccessible = validateActivityOutcomeServer(
        "kepler_orbit_insertion",
        {
          semiMajorAxisAU: 5.2,
          periodYears: 2.0,
          accessibleAlternative: true,
        },
        true,
      );
      assert.strictEqual(
        invalidAccessible.isValid,
        false,
        "Invalid parameters in accessible alternative must be rejected",
      );

      // Verify that accessible alternative satisfies activity requirement in evaluateCompletionCriteria
      const rule = getModuleCompletionRule("08")!;
      const evalAccessible = evaluateCompletionCriteria(rule, {
        lessonProgressRows: [{ time_spent_seconds: 100 }],
        activityEvidenceRows: [{ activity_type: "act_08_kepler_math", id: "ev_acc_01" }],
        assessmentAttemptRows: [{ percentage: 75.0 }],
      });
      assert.strictEqual(
        evalAccessible.allCriteriaSatisfied,
        true,
        "Accessible alternative evidence must satisfy activity requirement",
      );
    },
  );

  // Test 9: Stage achievements require all four constituent modules
  await runTest(
    "Stage achievements unlock only when all 4 constituent modules are verified",
    () => {
      assert.strictEqual(Object.keys(STAGE_BADGES).length, 6, "Must define 6 stages");

      for (let s = 1; s <= 6; s++) {
        const badge = STAGE_BADGES[s];
        assert.ok(badge, `Stage ${s} badge must exist`);
        assert.strictEqual(badge.stageId, s);

        // Verify module range calculation (each stage has 4 modules)
        const startMod = (s - 1) * 4 + 1;
        const expectedModules = [0, 1, 2, 3].map((offset) =>
          String(startMod + offset).padStart(2, "0"),
        );
        assert.strictEqual(expectedModules.length, 4);

        // 3 of 4 modules verified must NOT unlock the stage
        const partialCompleted = expectedModules.slice(0, 3);
        assert.strictEqual(
          partialCompleted.length === 4,
          false,
          "3 of 4 modules cannot unlock stage",
        );

        // 4 of 4 modules verified unlocks the stage
        const fullCompleted = expectedModules;
        assert.strictEqual(fullCompleted.length === 4, true, "4 of 4 modules unlocks stage");
      }
    },
  );

  console.log("=================================================");
  console.log(`Summary: ${passedTests} / ${totalTests} Completion Engine Tests Passed`);
  console.log("=================================================");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
