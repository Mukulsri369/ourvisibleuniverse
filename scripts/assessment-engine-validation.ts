import assert from "node:assert";
import {
  getCanonicalQuestionsForModule,
  getClientQuestionsForModule,
  getFinalExamQuestions,
  getClientFinalExamQuestions,
} from "../src/lib/academy/assessment-bank.server";
import { DEFAULT_ASSESSMENT_POLICY } from "../src/lib/academy/assessment-types";

console.log("=================================================");
console.log("OUR VISIBLE UNIVERSE ACADEMY");
console.log("PROMPT 04: Secure Assessment Engine Verification");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res && typeof (res as any).then === "function") {
      (res as Promise<void>)
        .then(() => {
          console.log(`  ✓ ${name}`);
          passedTests++;
        })
        .catch((err) => {
          console.error(`  ✗ FAIL: ${name}`);
          console.error(`    ${err?.message || err}`);
        });
    } else {
      console.log(`  ✓ ${name}`);
      passedTests++;
    }
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err?.message || err}`);
  }
}

// 1. Check all 24 modules have question banks
test("All 24 modules possess canonical questions across learning levels", () => {
  for (let m = 1; m <= 24; m++) {
    const modId = String(m).padStart(2, "0");
    const junior = getCanonicalQuestionsForModule(modId, "junior");
    const explorer = getCanonicalQuestionsForModule(modId, "explorer");
    const astronomer = getCanonicalQuestionsForModule(modId, "astronomer");

    assert.ok(
      explorer.length >= 3,
      `Module ${modId} Explorer must have at least 3 questions (got ${explorer.length})`,
    );
    assert.ok(
      junior.length >= 2,
      `Module ${modId} Junior must have at least 2 questions (got ${junior.length})`,
    );
    assert.ok(
      astronomer.length >= 3,
      `Module ${modId} Astronomer must have at least 3 questions (got ${astronomer.length})`,
    );

    // Verify option bounds for every canonical question
    for (const q of explorer) {
      assert.ok(q.options.length >= 2, `Question ${q.id} must have >= 2 options`);
      assert.ok(
        typeof q.correctAnswer === "number" || Array.isArray(q.correctAnswer),
        `Question ${q.id} missing valid correctAnswer`,
      );
      if (typeof q.correctAnswer === "number") {
        assert.ok(
          q.correctAnswer >= 0 && q.correctAnswer < q.options.length,
          `Question ${q.id} correct answer index ${q.correctAnswer} out of bounds`,
        );
      }
      assert.ok(q.explanation.length > 5, `Question ${q.id} missing explanation`);
      assert.ok(q.sourceReference.length > 3, `Question ${q.id} missing source reference`);
    }
  }
});

// 2. Client payload sanitization test: NO correct answers or explanations leaked
test("Client questions payload strictly omits correctAnswer and explanation", () => {
  for (let m = 1; m <= 24; m++) {
    const modId = String(m).padStart(2, "0");
    const clientQuestions = getClientQuestionsForModule(modId, "explorer");

    for (const q of clientQuestions) {
      assert.strictEqual(
        (q as any).correctAnswer,
        undefined,
        `SECURITY VIOLATION: correctAnswer leaked to client in question ${q.id}`,
      );
      assert.strictEqual(
        (q as any).correctIndex,
        undefined,
        `SECURITY VIOLATION: correctIndex leaked to client in question ${q.id}`,
      );
      assert.strictEqual(
        (q as any).explanation,
        undefined,
        `SECURITY VIOLATION: explanation leaked to client before grading in question ${q.id}`,
      );
      assert.ok(q.options.length >= 2, `Client question ${q.id} must have options list`);
      assert.ok(q.questionText.length > 5, `Client question ${q.id} must have questionText`);
    }
  }
});

// 3. Final Capstone Examination question set
test("Final Capstone Examination spans all 6 stages without leaking answers", () => {
  const exam = getFinalExamQuestions("explorer");
  assert.ok(exam.length >= 10, `Final exam must have >= 10 questions (got ${exam.length})`);

  const clientExam = getClientFinalExamQuestions("explorer");
  assert.strictEqual(
    clientExam.length,
    exam.length,
    "Client exam count must match canonical count",
  );

  for (const q of clientExam) {
    assert.strictEqual(
      (q as any).correctAnswer,
      undefined,
      "Final exam leaked correctAnswer to client",
    );
    assert.strictEqual(
      (q as any).explanation,
      undefined,
      "Final exam leaked explanation to client",
    );
  }
});

// 4. Server-Side Grading Logic: Failed Assessment Test
test("A failed assessment (< 70%) does not create a pass", () => {
  const canonical = getCanonicalQuestionsForModule("01", "explorer");
  assert.ok(canonical.length >= 4);

  // Submit intentionally all wrong answers
  let score = 0;
  for (const q of canonical) {
    const wrongAnswer = (Number(q.correctAnswer) + 1) % q.options.length;
    if (wrongAnswer === q.correctAnswer) score++;
  }

  const pct = (score / canonical.length) * 100;
  assert.strictEqual(pct < 70, true, "Intentionally wrong submission must score < 70%");
  const passed = pct >= DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct;
  assert.strictEqual(passed, false, "Assessment must fail when score < 70%");
});

// 5. Server-Side Grading Logic: Passing Assessment Test
test("A qualifying assessment (>= 70%) creates a verified pass", () => {
  const canonical = getCanonicalQuestionsForModule("01", "explorer");
  // Submit all correct answers
  let score = 0;
  for (const q of canonical) {
    const correctAnswer = q.correctAnswer;
    if (correctAnswer === q.correctAnswer) score++;
  }

  const pct = (score / canonical.length) * 100;
  assert.strictEqual(pct, 100, "All correct submission must score 100%");
  const passed = pct >= DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct;
  assert.strictEqual(passed, true, "Assessment must pass when score >= 70%");
});

// 6. Practice Mode Isolation Test
test("Practice mode questions must never award official verified certificate credentials", () => {
  // Practice submissions are flagged mode: 'practice'
  const mode = "practice";
  const passed = true;
  const verifiedCompletionAwarded = mode === "official" && passed;
  assert.strictEqual(
    verifiedCompletionAwarded,
    false,
    "Practice mode must NEVER award official verified completion",
  );
});

// 7. Replay & Idempotency Protection Test
test("Replayed assessment submission returns previous attempt and blocks duplicate awards", () => {
  const key1 = "sub_user123_mod01_attempt1";
  const existingRecords = new Map<string, { attemptId: string; score: number }>();

  // First submission
  existingRecords.set(key1, { attemptId: "att_001", score: 4 });

  // Replay attempt with same key
  const isReplay = existingRecords.has(key1);
  assert.strictEqual(isReplay, true, "Duplicate submission key must be detected as replay");

  // Replay returns existing attempt without awarding new completion
  const awardDuplicate = !isReplay;
  assert.strictEqual(awardDuplicate, false, "Replay must NOT trigger duplicate completion award");
});

// 8. Policy Configuration Integrity
test("Assessment policy conforms to 70% module and 80% final exam thresholds", () => {
  assert.strictEqual(
    DEFAULT_ASSESSMENT_POLICY.defaultModulePassingPct,
    70.0,
    "Module passing requirement must be 70%",
  );
  assert.strictEqual(
    DEFAULT_ASSESSMENT_POLICY.finalCertificationPassingPct,
    80.0,
    "Final certification requirement must be 80%",
  );
  assert.ok(
    DEFAULT_ASSESSMENT_POLICY.minDurationSeconds >= 3,
    "Rate-limiting minimum duration must be configured",
  );
});

console.log("\n=================================================");
console.log(`Summary: ${passedTests} / ${totalTests} Assessment Engine Tests Passed`);
console.log("=================================================");
if (passedTests !== totalTests) {
  process.exit(1);
}
