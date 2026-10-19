/**
 * Comprehensive Validation Test Suite
 * PROJECT: OUR VISIBLE UNIVERSE ACADEMY
 * PROMPT 09: FINAL COSMIC EXPLORER EXAMINATION
 *
 * Verifies:
 * 1. Examination locked before course completion.
 * 2. Failed attempt does not issue certificate.
 * 3. 15/20 does not pass (75% < 80%).
 * 4. 16/20 passes (80% >= 80%).
 * 5. Browser-modified score is rejected.
 * 6. Duplicate submissions are handled safely.
 * 7. COSMOS cannot provide official exam answers.
 * 8. All three learning levels function (Junior, Space Explorer, Young Astronomer).
 * 9. Stage distribution conformity (3, 4, 3, 4, 3, 3 = 20 questions).
 */

import assert from "node:assert";
import {
  FINAL_EXAM_QUESTION_BANK,
  generateFinalExamAttemptServer,
  sanitizeQuestionsForClient,
  computeFinalExamTopicBreakdown,
  STAGE_TITLES,
} from "../src/lib/academy/final-exam-bank.server";
import {
  checkFinalExamEligibilityServer,
  startAssessmentServer,
  submitAssessmentAttemptServer,
  verifyCosmosAssistanceAllowed,
  setMockUserVerifiedModules,
  getOfficialExamAttemptServer,
  getCertificateEligibilityStatusServer,
} from "../src/lib/academy/assessment.server";
import {
  FINAL_EXAM_BLUEPRINT,
  DEFAULT_ASSESSMENT_POLICY,
} from "../src/lib/academy/assessment-types";

console.log("======================================================================");
console.log("OUR VISIBLE UNIVERSE ACADEMY");
console.log("PROMPT 09: COSMIC EXPLORER FINAL KNOWLEDGE ASSESSMENT VALIDATION SUITE");
console.log("======================================================================\n");

let passedTests = 0;
let totalTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res && typeof (res as any).then === "function") {
      await res;
    }
    console.log(`  ✓ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error(`    ${err?.message || err}`);
  }
}

const ALL_24_MODULES = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0"));

async function runValidation() {
  // -------------------------------------------------------------------------
  // TEST 1: Question Bank Integrity & Metadata Completeness
  // -------------------------------------------------------------------------
  await test("Question Bank metadata completeness (scientific sources, wording, explanations, objectives)", () => {
    assert.ok(
      FINAL_EXAM_QUESTION_BANK.length >= 30,
      `Expected >= 30 curated questions in question bank, found ${FINAL_EXAM_QUESTION_BANK.length}`,
    );

    for (const q of FINAL_EXAM_QUESTION_BANK) {
      assert.ok(q.id.length > 5, `Question missing valid id: ${q.id}`);
      assert.ok(
        q.stageId >= 1 && q.stageId <= 6,
        `Question ${q.id} has invalid stageId: ${q.stageId}`,
      );
      assert.ok(q.moduleId.length === 2, `Question ${q.id} has invalid moduleId: ${q.moduleId}`);
      assert.ok(
        q.questionText.length > 15,
        `Question ${q.id} has insufficient text: ${q.questionText}`,
      );
      assert.ok(q.options.length >= 2, `Question ${q.id} must have >= 2 options`);
      assert.ok(
        typeof q.correctAnswer === "number" &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < q.options.length,
        `Question ${q.id} correct answer out of bounds: ${q.correctAnswer}`,
      );
      assert.ok(q.explanation.length > 20, `Question ${q.id} missing detailed explanation`);
      assert.ok(
        q.sourceReference.length > 5,
        `Question ${q.id} missing scientific source reference`,
      );
      assert.ok(q.learningObjective.length > 10, `Question ${q.id} missing learning objective`);
      assert.strictEqual(q.version, "1.0.0", `Question ${q.id} version must be 1.0.0`);
    }
  });

  // -------------------------------------------------------------------------
  // TEST 2: All Three Learning Levels Function with Balanced Blueprint
  // -------------------------------------------------------------------------
  await test("All three learning levels function with exact 20-question balanced blueprint (3, 4, 3, 4, 3, 3)", () => {
    const levels: ("junior" | "explorer" | "astronomer")[] = ["junior", "explorer", "astronomer"];

    for (const lvl of levels) {
      const exam = generateFinalExamAttemptServer(lvl);
      assert.strictEqual(
        exam.length,
        FINAL_EXAM_BLUEPRINT.totalQuestions,
        `Level ${lvl} must generate exactly ${FINAL_EXAM_BLUEPRINT.totalQuestions} questions`,
      );

      // Verify stage distribution
      const stageCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      for (const q of exam) {
        stageCounts[q.stageId]++;
      }

      assert.strictEqual(stageCounts[1], 3, `Level ${lvl} Stage 1 must have 3 questions`);
      assert.strictEqual(stageCounts[2], 4, `Level ${lvl} Stage 2 must have 4 questions`);
      assert.strictEqual(stageCounts[3], 3, `Level ${lvl} Stage 3 must have 3 questions`);
      assert.strictEqual(stageCounts[4], 4, `Level ${lvl} Stage 4 must have 4 questions`);
      assert.strictEqual(stageCounts[5], 3, `Level ${lvl} Stage 5 must have 3 questions`);
      assert.strictEqual(stageCounts[6], 3, `Level ${lvl} Stage 6 must have 3 questions`);
    }
  });

  // -------------------------------------------------------------------------
  // TEST 3: Client Question Sanitization (Zero Answer Leakage)
  // -------------------------------------------------------------------------
  await test("Client question payload strictly omits correctAnswer and explanation", () => {
    const canonical = generateFinalExamAttemptServer("explorer");
    const clientQuestions = sanitizeQuestionsForClient(canonical);

    assert.strictEqual(clientQuestions.length, 20);

    for (const q of clientQuestions) {
      assert.strictEqual(
        (q as any).correctAnswer,
        undefined,
        `SECURITY LEAK: correctAnswer exposed in ${q.id}`,
      );
      assert.strictEqual(
        (q as any).correctIndex,
        undefined,
        `SECURITY LEAK: correctIndex exposed in ${q.id}`,
      );
      assert.strictEqual(
        (q as any).explanation,
        undefined,
        `SECURITY LEAK: explanation exposed in ${q.id}`,
      );
      assert.ok(q.learningObjective, `Sanitized question ${q.id} missing learningObjective`);
      assert.ok(q.stageTitle, `Sanitized question ${q.id} missing stageTitle`);
      assert.ok(q.options.length >= 2, `Sanitized question ${q.id} missing options`);
    }
  });

  // -------------------------------------------------------------------------
  // TEST 4: Examination Locked Before Course Completion
  // -------------------------------------------------------------------------
  await test("Examination locked before course completion (rejects browser-stored flags)", async () => {
    const incompleteUserId = `incomplete_student_${Date.now()}`;
    setMockUserVerifiedModules(incompleteUserId, ["01", "02", "03", "04"]); // Only 4/24 modules verified

    const eligibility = await checkFinalExamEligibilityServer(incompleteUserId);

    assert.strictEqual(eligibility.isEligible, false, "Incomplete user must NOT be eligible");
    assert.strictEqual(eligibility.totalVerified, 4, "Should report 4 verified modules");
    assert.strictEqual(eligibility.requiredTotal, 24, "Must require 24 modules");
    assert.strictEqual(eligibility.missingModules.length, 20, "20 missing modules must be listed");

    let threwError = false;
    try {
      await startAssessmentServer({
        userId: incompleteUserId,
        moduleId: "exam",
        level: "explorer",
        mode: "official",
      });
    } catch (err: any) {
      threwError = true;
      assert.ok(
        err.message.includes("Final Examination Locked") || err.message.includes("24 modules"),
        `Error message must indicate prerequisite lock: ${err.message}`,
      );
    }

    assert.strictEqual(
      threwError,
      true,
      "Official startAssessmentServer must reject ineligible users",
    );
  });

  // -------------------------------------------------------------------------
  // TEST 5: 15 / 20 Does Not Pass (75% < 80%) & Failed Official Attempt Does Not Issue Certificate
  // -------------------------------------------------------------------------
  await test("Official attempt with 15 / 20 does not pass (75% < 80%) and does NOT issue certificate", async () => {
    const testUserId = `official_student_15_${Date.now()}`;
    setMockUserVerifiedModules(testUserId, ALL_24_MODULES);

    const session = await startAssessmentServer({
      userId: testUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });

    assert.strictEqual(session.questions.length, 20);

    const answers: Record<string, number> = {};
    for (let i = 0; i < 20; i++) {
      const q = session.questions[i];
      const canonicalQ = FINAL_EXAM_QUESTION_BANK.find((x) => x.id === q.id);
      assert.ok(canonicalQ, `Canonical question not found: ${q.id}`);

      if (i < 15) {
        answers[q.id] = canonicalQ.correctAnswer as number;
      } else {
        answers[q.id] = ((canonicalQ.correctAnswer as number) + 1) % canonicalQ.options.length;
      }
    }

    const grading = await submitAssessmentAttemptServer({
      userId: testUserId,
      attemptId: session.attemptId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
      answers,
      clientDurationSeconds: 60,
    });

    assert.strictEqual(grading.score, 15, `Expected score 15, got ${grading.score}`);
    assert.strictEqual(grading.totalPoints, 20, `Expected 20 total points, got ${grading.totalPoints}`);
    assert.strictEqual(grading.percentage, 75.0, `Expected 75.0%, got ${grading.percentage}`);
    assert.strictEqual(grading.passed, false, "15/20 MUST FAIL (< 80%)");
    assert.strictEqual(
      grading.certificateEligible,
      false,
      "Failed official attempt must NEVER grant certificateEligible",
    );

    const certStatus = getCertificateEligibilityStatusServer(testUserId);
    assert.strictEqual(
      certStatus.finalExamPassed,
      false,
      "Certification eligibility service must record finalExamPassed = false on 15/20",
    );
    assert.strictEqual(certStatus.eligibleAt, null, "eligibleAt must remain null on failed attempt");
  });

  // -------------------------------------------------------------------------
  // TEST 6: 16 / 20 Passes (80% >= 80%) & Triggers Certification Eligibility Service
  // -------------------------------------------------------------------------
  await test("Official attempt with 16 / 20 passes (80.0% >= 80%) and triggers certification eligibility service", async () => {
    const testUserId = `official_student_16_${Date.now()}`;
    setMockUserVerifiedModules(testUserId, ALL_24_MODULES);

    const session = await startAssessmentServer({
      userId: testUserId,
      moduleId: "exam",
      level: "astronomer",
      mode: "official",
    });

    assert.strictEqual(session.questions.length, 20);

    const answers: Record<string, number> = {};
    for (let i = 0; i < 20; i++) {
      const q = session.questions[i];
      const canonicalQ = FINAL_EXAM_QUESTION_BANK.find((x) => x.id === q.id)!;

      if (i < 16) {
        answers[q.id] = canonicalQ.correctAnswer as number;
      } else {
        answers[q.id] = ((canonicalQ.correctAnswer as number) + 1) % canonicalQ.options.length;
      }
    }

    const grading = await submitAssessmentAttemptServer({
      userId: testUserId,
      attemptId: session.attemptId,
      moduleId: "exam",
      level: "astronomer",
      mode: "official",
      answers,
      courseVersion: "1.0.0",
      clientDurationSeconds: 120,
    });

    assert.strictEqual(grading.score, 16, `Expected score 16, got ${grading.score}`);
    assert.strictEqual(grading.totalPoints, 20);
    assert.strictEqual(grading.percentage, 80.0);
    assert.strictEqual(grading.passed, true, "16/20 MUST PASS (>= 80%)");
    assert.strictEqual(
      grading.certificateEligible,
      true,
      "Passing official attempt MUST trigger certificateEligible = true",
    );

    const certStatus = getCertificateEligibilityStatusServer(testUserId);
    assert.strictEqual(certStatus.finalExamPassed, true);
    assert.strictEqual(certStatus.finalExamScorePct, 80.0);
    assert.ok(certStatus.eligibleAt, "eligibleAt timestamp must be populated");

    // Verify all 9 required audit fields are stored in OfficialExamAttemptRecord
    const storedRecord = getOfficialExamAttemptServer(grading.attemptId);
    assert.ok(storedRecord, "Official attempt record must be stored on server");
    assert.strictEqual(storedRecord.attemptId, grading.attemptId);
    assert.strictEqual(storedRecord.userId, testUserId);
    assert.strictEqual(storedRecord.courseVersion, "1.0.0");
    assert.strictEqual(storedRecord.learningLevel, "astronomer");
    assert.strictEqual(storedRecord.questionIds.length, 20);
    assert.strictEqual(Object.keys(storedRecord.submittedAnswers).length, 20);
    assert.strictEqual(storedRecord.finalScore, 16);
    assert.strictEqual(storedRecord.passingStatus, true);
    assert.ok(storedRecord.completionTimestamp.length > 10);
  });

  // -------------------------------------------------------------------------
  // TEST 7: Attempt Ownership Verification
  // -------------------------------------------------------------------------
  await test("Attempt ownership verification rejects submissions from a different userId", async () => {
    const ownerUserId = `owner_user_${Date.now()}`;
    const attackerUserId = `attacker_user_${Date.now()}`;
    setMockUserVerifiedModules(ownerUserId, ALL_24_MODULES);
    setMockUserVerifiedModules(attackerUserId, ALL_24_MODULES);

    const session = await startAssessmentServer({
      userId: ownerUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });

    let ownershipRejected = false;
    try {
      await submitAssessmentAttemptServer({
        userId: attackerUserId,
        attemptId: session.attemptId,
        moduleId: "exam",
        level: "explorer",
        mode: "official",
        answers: {},
        clientDurationSeconds: 60,
      });
    } catch (err: any) {
      ownershipRejected = true;
      assert.ok(err.message.includes("Attempt ownership mismatch"));
    }

    assert.strictEqual(
      ownershipRejected,
      true,
      "Server must reject official exam submissions where userId does not match attempt owner",
    );
  });

  // -------------------------------------------------------------------------
  // TEST 8: Browser-Modified Score Is Rejected (Authoritative Server-Side Grading)
  // -------------------------------------------------------------------------
  await test("Browser-modified score is rejected (client cannot submit fake score)", async () => {
    const testUserId = `test_hacker_${Date.now()}`;
    setMockUserVerifiedModules(testUserId, ALL_24_MODULES);

    const session = await startAssessmentServer({
      userId: testUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });

    // Provide only 5 correct answers, but send fake clientScore = 20
    const answers: Record<string, number> = {};
    for (let i = 0; i < 20; i++) {
      const q = session.questions[i];
      const canonicalQ = FINAL_EXAM_QUESTION_BANK.find((x) => x.id === q.id)!;
      answers[q.id] =
        i < 5
          ? (canonicalQ.correctAnswer as number)
          : ((canonicalQ.correctAnswer as number) + 1) % canonicalQ.options.length;
    }

    const grading = await submitAssessmentAttemptServer({
      userId: testUserId,
      attemptId: session.attemptId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
      answers,
      clientScore: 20, // Manipulated score attempt
      clientDurationSeconds: 90,
    });

    assert.strictEqual(grading.score, 5, "Server must grade actual answers and report score = 5");
    assert.strictEqual(grading.percentage, 25.0, "Server must compute actual percentage = 25.0%");
    assert.strictEqual(grading.passed, false, "Fabricated 100% score MUST BE REJECTED");
    assert.strictEqual(grading.certificateEligible, false);
  });

  // -------------------------------------------------------------------------
  // TEST 9: Duplicate Submissions Handled Safely (Idempotency Protection)
  // -------------------------------------------------------------------------
  await test("Duplicate submissions are handled safely with replay protection", async () => {
    const testUserId = `test_replay_${Date.now()}`;
    setMockUserVerifiedModules(testUserId, ALL_24_MODULES);
    const idempotencyKey = `idemp_test_${Date.now()}`;

    const session = await startAssessmentServer({
      userId: testUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });

    const answers: Record<string, number> = {};
    for (let i = 0; i < 20; i++) {
      const q = session.questions[i];
      const canonicalQ = FINAL_EXAM_QUESTION_BANK.find((x) => x.id === q.id)!;
      answers[q.id] = canonicalQ.correctAnswer as number;
    }

    // First submission
    const res1 = await submitAssessmentAttemptServer({
      userId: testUserId,
      attemptId: session.attemptId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
      answers,
      idempotencyKey,
      clientDurationSeconds: 60,
    });

    // Duplicate submission with same idempotency key
    const res2 = await submitAssessmentAttemptServer({
      userId: testUserId,
      attemptId: session.attemptId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
      answers,
      idempotencyKey,
      clientDurationSeconds: 60,
    });

    assert.strictEqual(res1.attemptId, res2.attemptId);
    assert.strictEqual(res1.score, res2.score);
    assert.strictEqual(res1.percentage, res2.percentage);
    assert.strictEqual(res1.passed, res2.passed);
  });

  // -------------------------------------------------------------------------
  // TEST 10: COSMOS Cannot Provide Official Exam Answers
  // -------------------------------------------------------------------------
  await test("COSMOS conversational assistance cannot provide official exam answers", () => {
    const activeCheck = verifyCosmosAssistanceAllowed({ isExamActive: true });
    assert.strictEqual(activeCheck.allowed, false);
    assert.ok(
      activeCheck.reason?.includes("strictly disabled") ||
        activeCheck.reason?.includes("Final Knowledge Assessment"),
    );

    const promptCheck = verifyCosmosAssistanceAllowed({
      isExamActive: false,
      userPrompt: "Give me the final exam answers for question 1 to 20",
    });
    assert.strictEqual(promptCheck.allowed, false);
    assert.ok(promptCheck.reason?.includes("cannot disclose official assessment question answers"));

    const normalCheck = verifyCosmosAssistanceAllowed({
      isExamActive: false,
      userPrompt: "How do Keplerian orbits work in solar systems?",
    });
    assert.strictEqual(normalCheck.allowed, true);
  });

  // -------------------------------------------------------------------------
  // TEST 11: Topic Strengths & Review Recommendations
  // -------------------------------------------------------------------------
  await test("Topic strengths and review recommendations are generated accurately", () => {
    const canonical = generateFinalExamAttemptServer("explorer");
    const feedback = canonical.map((q, idx) => ({
      questionId: q.id,
      questionText: q.questionText,
      userAnswer: idx < 16 ? q.correctAnswer : 99,
      isCorrect: idx < 16,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      sourceReference: q.sourceReference,
      stageId: q.stageId,
      moduleId: q.moduleId,
      learningObjective: q.learningObjective,
    }));

    const breakdown = computeFinalExamTopicBreakdown(feedback);
    assert.strictEqual(
      breakdown.topicStrengths.length,
      6,
      "Must provide topic strengths for all 6 stages",
    );
    assert.strictEqual(
      breakdown.topicsRequiringReview.length,
      4,
      "Must identify the 4 missed questions for review",
    );

    for (const rev of breakdown.topicsRequiringReview) {
      assert.ok(rev.moduleTitle, "Review topic must have moduleTitle");
      assert.ok(rev.learningObjective, "Review topic must have learningObjective");
      assert.ok(rev.reviewRecommendation, "Review topic must have reviewRecommendation");
    }
  });

  // -------------------------------------------------------------------------
  // TEST 12: Fresh Question Selection on Retries
  // -------------------------------------------------------------------------
  await test("Retries support fresh question selection while preserving the 6-stage blueprint", async () => {
    const retryUserId = `retry_student_${Date.now()}`;
    setMockUserVerifiedModules(retryUserId, ALL_24_MODULES);

    const attemptA = await startAssessmentServer({
      userId: retryUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });
    const attemptB = await startAssessmentServer({
      userId: retryUserId,
      moduleId: "exam",
      level: "explorer",
      mode: "official",
    });

    assert.strictEqual(attemptA.questions.length, 20);
    assert.strictEqual(attemptB.questions.length, 20);

    const idsASet = new Set(attemptA.questions.map((q) => q.id));
    const freshInB = attemptB.questions.filter((q) => !idsASet.has(q.id));
    assert.ok(
      freshInB.length > 0,
      `Expected retry attempt to include fresh questions not seen in attempt 1, found ${freshInB.length} fresh questions`,
    );

    // Both must adhere to the 20-question blueprint
    assert.strictEqual(attemptA.questions.filter((q) => q.stageId === 1).length, 3);
    assert.strictEqual(attemptB.questions.filter((q) => q.stageId === 1).length, 3);
  });

  console.log("\n======================================================================");
  console.log(`FINAL EXAM ASSESSMENT VALIDATION SUMMARY:`);
  console.log(`Total Checks Run: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log("======================================================================");

  if (passedTests === totalTests) {
    console.log("ALL FINAL KNOWLEDGE ASSESSMENT CHECKS PASSED WITH 100% SUCCESS!");
  } else {
    process.exit(1);
  }
}

runValidation().catch((err) => {
  console.error("FATAL ERROR IN VALIDATION SUITE:", err);
  process.exit(1);
});
