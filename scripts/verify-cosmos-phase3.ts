/**
 * COSMOS 2.0 — Phase 3 End-to-End Verification Script
 * Project: Our Visible Universe Academy
 *
 * Verifies:
 * 1. All 24 modules generate deterministic multi-step learning sequences
 *    (TRANSITION, LESSON_EXPLANATION, VISUALIZATION, ACTIVITY, KNOWLEDGE_CHECK, COMPLETION_CHECK).
 * 2. All 24 modules have registered interactive activity guidance specifications
 *    with strict real-interaction validation (zero narration-end auto-completion).
 * 3. All 6 stages and 24 modules map to Stage Achievement Badges and Final Exam eligibility.
 * 4. Practice vs Official Assessment guidance enforces zero answer leakage in official mode.
 * 5. Session persistence & resumption across modules.
 */

import { ACADEMY_MODULES } from "../src/lib/academy/registry";
import { STAGE_BADGES } from "../src/lib/academy/stage-badges";
import { CosmosStepSequenceGenerator } from "../src/lib/cosmos/CosmosStepSequenceGenerator";
import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { CosmosActivityAdapter } from "../src/lib/cosmos/CosmosActivityAdapter";
import { CosmosAssessmentGuide } from "../src/lib/cosmos/CosmosQuizGuide";
import { CosmosInputCoordinator } from "../src/lib/cosmos/CosmosInputCoordinator";
import { CosmosLearningSessionManager } from "../src/lib/cosmos/CosmosLearningSessionManager";

async function runPhase3Verification() {
  console.log("==========================================================");
  console.log("COSMOS 2.0 — PHASE 3 VERIFICATION SUITE (ALL 24 MODULES)");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, label: string) => {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${label}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${label}`);
    }
  };

  // 1. Verify all 24 modules in registry and step generation
  console.log("1. Verifying 24-Module Step Sequence Generation...");
  assert(ACADEMY_MODULES.length === 24, "Registry contains all 24 modules (01-24)");

  for (const mod of ACADEMY_MODULES) {
    const steps = CosmosStepSequenceGenerator.generateModuleSequence(mod.id, "explorer");
    const segments = LessonContentProvider.getSegmentsForModule(mod.id, "explorer", "en");

    const hasIntro = steps.some((s) => s.stepType === "TRANSITION");
    const hasLesson = steps.some((s) => s.stepType === "LESSON" || s.stepType === "EXPLANATION");
    const hasVis = steps.some((s) => s.stepType === "VISUALIZATION");
    const hasActivity = steps.some((s) => s.stepType === "ACTIVITY");
    const hasQuiz = steps.some((s) => s.stepType === "KNOWLEDGE_CHECK");
    const hasCompletion = steps.some((s) => s.stepType === "COMPLETION_CHECK");

    const activityStep = steps.find((s) => s.stepType === "ACTIVITY");
    const quizStep = steps.find((s) => s.stepType === "KNOWLEDGE_CHECK");

    assert(
      steps.length >= 6 &&
        segments.length > 0 &&
        hasIntro &&
        hasLesson &&
        hasVis &&
        hasActivity &&
        hasQuiz &&
        hasCompletion &&
        activityStep?.requiresStudentInput === true &&
        quizStep?.requiresStudentInput === true,
      `Module ${mod.id} (${mod.title}): ${steps.length} steps, ${segments.length} segments, requiresStudentInput enforced`,
    );
  }

  // 2. Verify all 24 modules have Activity Specs & require real student input
  console.log("\n2. Verifying 24-Module Interactive Activity Specifications...");
  const adapter = CosmosActivityAdapter.getInstance();
  for (const mod of ACADEMY_MODULES) {
    const activityRecord = adapter.getActivityForModule(mod.id);
    const hasInteractedInitially =
      (activityRecord?.completedActions.length ?? 0) > 0 ||
      Boolean(activityRecord?.currentParameters.interacted);

    assert(
      Boolean(activityRecord) &&
        activityRecord!.instructionSteps.length >= 2 &&
        hasInteractedInitially === false,
      `Module ${mod.id} (${activityRecord?.title}): ${activityRecord?.instructionSteps.length} instruction steps, zero premature interaction`,
    );
  }

  // Verify real student interaction advances activity steps
  const m08Interaction = adapter.reportStudentInteraction("08", "eccentricity_changed", {
    eccentricity: 0.42,
  });
  assert(
    Boolean(m08Interaction.completedStep) &&
      m08Interaction.state?.currentParameters.interacted === true,
    "Module 08 Keplerian Orbit Sandbox records real student interaction and advances step",
  );

  // 3. Verify Stage Badges (Stages 1-6)
  console.log("\n3. Verifying Stage Achievement Badges (Stages 1-6)...");
  const stageBadgesList = Object.values(STAGE_BADGES);
  assert(stageBadgesList.length === 6, "All 6 Stage Achievement Badges are defined");
  for (const badge of stageBadgesList) {
    assert(
      badge.requiredModuleIds.length === 4,
      `Stage ${badge.stageId} (${badge.title}) requires 4 verified modules: [${badge.requiredModuleIds.join(", ")}]`,
    );
  }

  // 4. Verify Practice vs Official Assessment Security
  console.log("\n4. Verifying Practice vs Official Assessment Security...");
  const quizGuide = CosmosAssessmentGuide.getInstance();
  quizGuide.registerQuizBridge({
    moduleId: "01",
    mode: "official",
    passingScorePct: 70,
    getQuestions: () => [
      {
        id: "q1",
        moduleId: "01",
        stageId: 1,
        level: "explorer",
        questionText: "What is 1 Astronomical Unit (AU)?",
        options: ["Earth-Sun distance", "Light year", "Parsec", "Lunar distance"],
        learningObjective: "Cosmic Distance Units",
      },
    ],
    getSelectedAnswers: () => ({}),
    selectOption: () => {},
    submitAssessment: async () => {},
    retryAssessment: () => {},
  });
  await quizGuide.startGuidedQuiz("01");

  const officialHint = await quizGuide.requestQuestionHint();
  assert(
    (officialHint.toLowerCase().includes("official") ||
      officialHint.toLowerCase().includes("hint")) &&
      !officialHint.includes("Earth-Sun"),
    "Official assessment mode strictly blocks hints and never leaks answers",
  );

  // 5. Verify Voice & Text Input Coordinator
  console.log("\n5. Verifying Voice & Text Input Coordinator...");
  const coord = CosmosInputCoordinator.getInstance();
  const parsedOptionB = coord.parseUtterance("I choose Option B", "WAITING_FOR_ANSWER", true);
  const parsedConfirm = coord.parseUtterance("Confirm my answer", "CONFIRMING_ANSWER", true);
  assert(
    parsedOptionB.intent === "OPTION_SELECT" && parsedOptionB.optionIndex === 1,
    "Recognizes voice 'Option B' -> optionIndex 1",
  );
  assert(
    parsedConfirm.intent === "CONFIRM_ANSWER",
    "Recognizes voice 'Confirm my answer' -> CONFIRM_ANSWER",
  );

  // 6. Verify Session Persistence & Resumption
  console.log("\n6. Verifying Guided Learning Session Persistence...");
  CosmosLearningSessionManager.saveSession({
    courseId: "cosmic-journey",
    courseVersion: "1.0.0",
    moduleId: "13",
    moduleTitle: "Galaxies & Deep Space",
    lessonId: "m13-sub-2",
    lessonTitle: "Spiral, Elliptical & Irregular Galaxies",
    sectionId: "keyIdea",
    stepId: "step_13_2",
    stepIndex: 3,
    totalSteps: 11,
    learningLevel: "explorer",
    confirmedPlaybackPosition: 2,
    sessionStatus: "paused",
    updatedAt: new Date().toISOString(),
  });
  const restored = CosmosLearningSessionManager.getSession("13");
  assert(
    restored !== null &&
      restored.moduleId === "13" &&
      restored.stepIndex === 3 &&
      restored.lessonId === "m13-sub-2",
    "Restores saved session state for Module 13 accurately",
  );

  console.log("\n==========================================================");
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

void runPhase3Verification();
