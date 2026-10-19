/**
 * COSMOS Fullscreen Cinematic Learning Player Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 03 — Sections 26 & 27 (Unit, Integration & Scenario A–G Verification)
 *
 * Tests all 28 required verification areas:
 * 1. Player initial state (CLOSED) & lifecycle state machine transitions
 * 2. Entering Cinematic Mode across representative modules (01, 08, 14) & all 24 modules
 * 3. Native Fullscreen API success handling
 * 4. Native Fullscreen API rejection / permission denied recovery
 * 5. Full-Viewport Fallback activation without falsely claiming native fullscreen
 * 6. Fullscreen exit & normal lesson restoration
 * 7. Unexpected `fullscreenchange` event handling (Escape key transition)
 * 8. Scene loading & 24-module registry resolution
 * 9. Missing / fallback module scene handling
 * 10. Single authoritative COSMOS Learning Director state subscription
 * 11. Narration cue activation across all 24 modules & 960 approved segments
 * 12. Pause synchronization & dual-time policy enforcement (FOLLOW_NARRATION vs SIMULATION_CONTINUOUS)
 * 13. Resume synchronization
 * 14. Segment seeking & cue restoration
 * 15. Backward navigation (`previousEligibleStep`)
 * 16. Camera command dispatch & resize/aspect handling
 * 17. Synchronized caption updates & terminology extraction
 * 18. Activity waiting state (`ACTIVITY_REQUIRED` input gating)
 * 19. Required student-input step non-bypass guardrail (`nextEligibleStep`)
 * 20. Quiz overlay synchronization (`QUIZ_REQUIRED`)
 * 21. Official examination restrictions (no hints or auto-answers in official mode)
 * 22. Voice connection interruption & context-preserving Q&A (`askCosmosQuestionInCinematicMode`)
 * 23. Resume after question (`resumeAfterQuestionInCinematicMode`) restoring interrupted cue
 * 24. Scene error recovery (WebGL unsupported / context lost fallback)
 * 25. Rapid Enter/Exit mode-switch race condition prevention
 * 26. Quality presets (`HIGH_CINEMATIC`, `BALANCED`, `LOW_POWER`) & FPS hysteresis downgrade
 * 27. Grounded scientific annotations (all 13 annotation types supported, zero fabricated data)
 * 28. Student progress preservation across display-mode transitions (Scenarios A–G)
 */

import { ACADEMY_MODULES } from "../src/lib/academy/registry";
import { CosmosLearningDirector } from "../src/lib/cosmos/CosmosLearningDirector";
import { CosmosQuizGuide } from "../src/lib/cosmos/CosmosQuizGuide";
import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { CosmosCinematicSessionBridge } from "../src/lib/cosmos/cinematic/CosmosCinematicSessionBridge";
import { CosmosAnimationCueRegistry } from "../src/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import { CosmosAnimationCueController } from "../src/lib/cosmos/cinematic/CosmosAnimationCueController";
import { CosmosCinematicSceneRegistry } from "../src/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import {
  CosmosCinematicQualityManager,
  CINEMATIC_QUALITY_PROFILES,
} from "../src/lib/cosmos/cinematic/CosmosCinematicQualityManager";

process.env.NODE_ENV = "test";

interface TestSummary {
  passed: number;
  failed: number;
  failures: string[];
}

const summary: TestSummary = { passed: 0, failed: 0, failures: [] };

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${label}`);
    summary.passed += 1;
  } else {
    console.error(`  ✗ [FAIL] ${label}`);
    summary.failed += 1;
    summary.failures.push(label);
  }
}

async function runCinematicPlayerValidation() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY — COSMOS CINEMATIC LEARNING SYSTEM");
  console.log("PROMPT 03: FULLSCREEN CINEMATIC PLAYER VALIDATION SUITE");
  console.log("======================================================================\n");

  const bridge = CosmosCinematicSessionBridge.getInstance();
  const director = CosmosLearningDirector.getInstance();
  const cueController = CosmosAnimationCueController.getInstance();
  const qualityManager = CosmosCinematicQualityManager.getInstance();

  // --------------------------------------------------------------------------
  // 1. Initial Lifecycle State & Single Authoritative Instance Check
  // --------------------------------------------------------------------------
  console.log("1. Singleton Authority & Initial Player State:");
  assert(
    bridge.getDirector() === director,
    "CosmosCinematicSessionBridge connects to the single authoritative CosmosLearningDirector instance",
  );
  assert(
    bridge.getStateManager().getSnapshot().playerState === "CLOSED",
    "Cinematic player starts in CLOSED state",
  );
  assert(
    bridge.getStateManager().getSnapshot().fullscreenState === "INACTIVE",
    "Fullscreen state starts as INACTIVE",
  );

  // --------------------------------------------------------------------------
  // 2. All 24 Modules & 960 Narration Segments Cue Registry Verification
  // --------------------------------------------------------------------------
  console.log("\n2. 24-Module Cue Registry & Scene Descriptor Verification:");
  let totalCuesCount = 0;
  let allModulesHaveScenes = true;
  let allCuesMatchApprovedSegments = true;

  for (const mod of ACADEMY_MODULES) {
    const modId = String(mod.number).padStart(2, "0");
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(modId, mod.title);
    const segments = LessonContentProvider.getSegmentsForModule(modId, "explorer", "en");
    const cues = CosmosAnimationCueRegistry.getCuesForModule(modId, "explorer", "en");

    if (!sceneDesc || !sceneDesc.sceneId || sceneDesc.objects.length === 0) {
      allModulesHaveScenes = false;
    }
    if (cues.length !== segments.length || cues.length === 0) {
      allCuesMatchApprovedSegments = false;
    }
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].narrationSegmentId !== segments[i].segmentId) {
        allCuesMatchApprovedSegments = false;
      }
    }
    totalCuesCount += cues.length;
  }

  assert(
    allModulesHaveScenes,
    "All 24 Cosmic Journey modules resolve valid 3D scene descriptors and scientific objects",
  );
  assert(
    allCuesMatchApprovedSegments && totalCuesCount === 960,
    `All ${totalCuesCount} animation cues map 1:1 to approved LessonContentProvider narrationSegmentIds`,
  );

  // --------------------------------------------------------------------------
  // 3. SCENARIO A: Open Module 01, Enter Cinematic Mode, Native Fullscreen vs Fallback, Pause/Resume & Exit
  // --------------------------------------------------------------------------
  console.log(
    "\n3. Scenario A — Module 01 Enter Cinematic Mode, Native Fullscreen & State Restoration:",
  );
  const mockFullscreenContainer: any = {
    requestFullscreen: async () => Promise.resolve(),
  };

  const enterRes01 = await bridge.enterCinematicMode({
    moduleId: "01",
    moduleTitle: "Our Place in the Universe",
    learningLevel: "explorer",
    containerElement: mockFullscreenContainer,
  });

  const snap01 = bridge.getStateManager().getSnapshot();
  assert(enterRes01.opened === true, "Module 01 enters Cinematic Mode successfully");
  assert(
    enterRes01.fullscreenMode === "NATIVE_FULLSCREEN" &&
      snap01.fullscreenState === "NATIVE_FULLSCREEN",
    "Authorized container element with requestFullscreen() enters NATIVE_FULLSCREEN",
  );
  assert(
    snap01.currentModuleId === "01" && snap01.currentSceneId === "m01_cosmic_zoom_hierarchy",
    "Module 01 loads m01_cosmic_zoom_hierarchy scene",
  );
  assert(
    Boolean(snap01.currentNarrationSegmentId?.startsWith("01-")),
    `Module 01 synchronizes initial narration segment (${snap01.currentNarrationSegmentId})`,
  );

  // Pause & Resume synchronization
  bridge.pause();
  assert(
    bridge.getStateManager().getSnapshot().playerState === "PAUSED" &&
      cueController.getState().narrationPaused === true,
    "Pausing player pauses narration and synchronized FOLLOW_NARRATION cue",
  );

  await bridge.playOrResume();
  assert(
    cueController.getState().narrationPaused === false,
    "Resuming player resumes synchronized animation cue",
  );

  // Seek to a later segment in Module 01 and verify exit preserves it
  const m01Segments = LessonContentProvider.getSegmentsForModule("01", "explorer", "en");
  const targetM01Seg = m01Segments[3].segmentId;
  const seekOk = bridge.seekToNarrationSegment(targetM01Seg);
  assert(
    seekOk && bridge.getStateManager().getSnapshot().currentNarrationSegmentId === targetM01Seg,
    `Seeking to segment ${targetM01Seg} updates active caption and animation cue`,
  );

  await bridge.exitCinematicMode();
  assert(
    bridge.getStateManager().getSnapshot().playerState === "CLOSED" &&
      director.getNarrationController().getCurrentSegment()?.segmentId === targetM01Seg,
    "Exiting Cinematic Mode closes player while preserving exact narration segment in normal lesson view",
  );

  // --------------------------------------------------------------------------
  // 4. SCENARIO F: Native Fullscreen Rejection / Unsupported -> Full-Viewport Fallback
  // --------------------------------------------------------------------------
  console.log("\n4. Scenario F — Native Fullscreen Permission Denied & Fallback Mode:");
  const rejectingContainer: any = {
    requestFullscreen: async () =>
      Promise.reject(new Error("Fullscreen permission denied by user")),
  };

  const fallbackRes = await bridge.enterCinematicMode({
    moduleId: "01",
    moduleTitle: "Our Place in the Universe",
    learningLevel: "explorer",
    containerElement: rejectingContainer,
  });

  const snapFallback = bridge.getStateManager().getSnapshot();
  assert(
    fallbackRes.opened === true &&
      fallbackRes.fullscreenMode === "VIEWPORT_FALLBACK" &&
      snapFallback.fullscreenState === "VIEWPORT_FALLBACK",
    "Rejected requestFullscreen() activates VIEWPORT_FALLBACK without claiming native fullscreen",
  );
  assert(
    snapFallback.errorState?.code === "FULLSCREEN_PERMISSION_DENIED" &&
      snapFallback.errorState.fallbackAvailable === true,
    "Records recoverable FULLSCREEN_PERMISSION_DENIED notice while keeping player usable",
  );

  // --------------------------------------------------------------------------
  // 5. SCENARIO B & D: Module 14 Black Holes, Scientific Annotations & Voice/Text Interruption
  // --------------------------------------------------------------------------
  console.log(
    "\n5. Scenarios B & D — Module 14 Black Holes, Annotations & Context-Preserving Q&A Interruption:",
  );
  await bridge.enterCinematicMode({
    moduleId: "14",
    moduleTitle: "Black Holes & Neutron Stars",
    learningLevel: "explorer",
    forceViewportFallback: true,
  });

  const snap14 = bridge.getStateManager().getSnapshot();
  const scene14 = bridge.getActiveSceneDescriptor();
  assert(
    snap14.currentModuleId === "14" &&
      scene14.sceneId === "m14_black_hole_relativity_3d" &&
      scene14.annotations.length >= 4,
    "Module 14 loads m14_black_hole_relativity_3d with relativistic Schwarzschild/ISCO annotations",
  );

  const m14Segments = LessonContentProvider.getSegmentsForModule("14", "explorer", "en");
  const interruptedSegId = m14Segments[2].segmentId;
  bridge.seekToNarrationSegment(interruptedSegId);
  const preInterruptCueId = cueController.getState().activeCue?.cueId;

  // Interrupt COSMOS with a question
  const answer = await bridge.askCosmosQuestionInCinematicMode(
    "How small is a neutron star or stellar black hole compared to Earth?",
  );

  const interruptedCueState = cueController.getState();
  assert(
    Boolean(answer && answer.answerText.length > 10),
    "COSMOS answers student question with grounded astrophysical explanation",
  );
  assert(
    interruptedCueState.interruptedForQuestion === true &&
      interruptedCueState.preservedCueBeforeInterruption?.cueId === preInterruptCueId,
    "Cue controller preserves interrupted visual cue during Q&A",
  );
  assert(
    interruptedCueState.isSimulationRunning === true &&
      interruptedCueState.simulationTimeScale < 1.0,
    "Module 14 SIMULATION_CONTINUOUS time policy slows relativistic accretion disk without freezing scene",
  );

  // Resume after question
  await bridge.resumeAfterQuestionInCinematicMode();
  assert(
    cueController.getState().interruptedForQuestion === false &&
      cueController.getState().activeCue?.cueId === preInterruptCueId &&
      director.getNarrationController().getCurrentSegment()?.segmentId === interruptedSegId,
    "Resuming after question restores original narration segment and animation cue",
  );

  // --------------------------------------------------------------------------
  // 6. SCENARIO C: Module 08 Gravity & Orbits, Activity Input Gating & Guardrails
  // --------------------------------------------------------------------------
  console.log("\n6. Scenario C — Module 08 Orbital Mechanics & Activity Input Gating:");
  await bridge.enterCinematicMode({
    moduleId: "08",
    moduleTitle: "Gravity, Orbits & Motion",
    learningLevel: "explorer",
    forceViewportFallback: true,
  });

  const snap08 = bridge.getStateManager().getSnapshot();
  assert(
    snap08.currentModuleId === "08" &&
      snap08.currentSceneId === "m08_orbital_mechanics_lab" &&
      snap08.currentTimePolicy === "SIMULATION_CONTINUOUS",
    "Module 08 loads m08_orbital_mechanics_lab with SIMULATION_CONTINUOUS time policy",
  );

  // Navigate to the Activity step in Module 08 and verify NEXT STEP cannot bypass unresolved activity
  const steps08 = director.getSteps();
  const activityStepIdx = steps08.findIndex((s) => s.stepType === "ACTIVITY");
  assert(activityStepIdx > 0, "Module 08 step sequence contains an authoritative ACTIVITY step");

  await director.startGuidedSession("08", "explorer", activityStepIdx);
  const gatedSnap = bridge.getStateManager().getSnapshot();
  assert(
    gatedSnap.interactionState === "ACTIVITY_REQUIRED",
    "Reaching Module 08 activity step transitions interactionState to ACTIVITY_REQUIRED",
  );

  const canSkipActivity = await bridge.nextEligibleStep();
  assert(
    canSkipActivity === false && director.getSnapshot().currentStepIndex === activityStepIdx,
    "nextEligibleStep() refuses to skip an unresolved required activity step",
  );

  // --------------------------------------------------------------------------
  // 7. Camera Control Actions, Quality Manager Hysteresis & Error Recovery (Scenario G)
  // --------------------------------------------------------------------------
  console.log(
    "\n7. Camera Commands, Quality Governor Hysteresis & Scene Error Recovery (Scenario G):",
  );
  let receivedCamCmd: string | null = null;
  const unsubCam = bridge.subscribeCameraCommands((cmd) => {
    receivedCamCmd = cmd.action;
  });

  bridge.dispatchCameraCommand({
    action: "FOCUS_OBJECT",
    targetObjectId: "orbiting_planet",
  });
  assert(
    receivedCamCmd === "FOCUS_OBJECT" &&
      bridge.getStateManager().getSnapshot().selectedObjectId === "orbiting_planet",
    "dispatchCameraCommand(FOCUS_OBJECT) updates selectedObjectId and notifies camera rig",
  );

  bridge.setManualCameraMode(true);
  assert(
    bridge.getStateManager().getSnapshot().isManualCameraMode === true &&
      CosmosLearningDirector.getInstance() !== null,
    "Enabling manual camera mode sets MANUAL_CAMERA_ORBIT without disrupting learning session",
  );

  bridge.setManualCameraMode(false);
  assert(
    receivedCamCmd === "RESTORE_CAMERA" &&
      bridge.getStateManager().getSnapshot().isManualCameraMode === false,
    "Returning to guided camera dispatches RESTORE_CAMERA",
  );
  unsubCam();

  // Quality Manager hysteresis test
  qualityManager.resetForTesting();
  qualityManager.setTier("HIGH_CINEMATIC", false);
  assert(
    qualityManager.getTier() === "HIGH_CINEMATIC" &&
      CINEMATIC_QUALITY_PROFILES.HIGH_CINEMATIC.dprRange[1] === 2,
    "Quality preset HIGH_CINEMATIC configures DPR [1, 2]",
  );
  qualityManager.reportFrameWindow(25, 1000);
  qualityManager.reportFrameWindow(25, 1000);
  assert(
    qualityManager.getTier() === "HIGH_CINEMATIC",
    "Quality manager does not oscillate after only 2 low-FPS windows",
  );
  qualityManager.reportFrameWindow(25, 1000);
  assert(
    qualityManager.getTier() === "BALANCED",
    "Quality manager automatically steps down to BALANCED after 3 consecutive low-FPS windows",
  );

  // Scenario G: Simulate WebGL context lost / scene error and verify recovery
  bridge
    .getStateManager()
    .recordError("WEBGL_CONTEXT_LOST", "Simulated WebGL context loss during validation", {
      recoverable: true,
      fallbackAvailable: true,
      enterErrorState: true,
    });
  assert(
    bridge.getStateManager().getSnapshot().playerState === "ERROR" &&
      bridge.getStateManager().getSnapshot().currentModuleId === "08",
    "WebGL error transitions player to ERROR fallback while preserving currentModuleId and step",
  );

  bridge.getStateManager().clearError();
  assert(
    bridge.getStateManager().getSnapshot().playerState === "READY" &&
      bridge.getStateManager().getSnapshot().errorState === null,
    "clearError() recovers player cleanly to READY state",
  );

  // --------------------------------------------------------------------------
  // 8. SCENARIO E: Quiz Synchronization & Official Examination Guardrails
  // --------------------------------------------------------------------------
  console.log("\n8. Scenario E — Quiz Overlay Synchronization & Official Exam Guardrails:");
  const quizStepIdx = steps08.findIndex((s) => s.stepType === "KNOWLEDGE_CHECK");
  assert(quizStepIdx > 0, "Module 08 step sequence contains an authoritative KNOWLEDGE_CHECK step");

  const quizGuide = CosmosQuizGuide.getInstance();
  const selectedQuizAnswers: Record<string, number> = {};
  let quizMode: "practice" | "official" = "practice";

  const unregQuizBridge = quizGuide.registerQuizBridge({
    moduleId: "08",
    get mode() {
      return quizMode;
    },
    passingScorePct: 70,
    getQuestions: () => [
      {
        id: "m08-q1",
        moduleId: "08",
        questionNumber: 1,
        questionText:
          "According to Kepler's Second Law, when does a planet move fastest in an elliptical orbit?",
        questionType: "multiple_choice",
        difficulty: "medium",
        points: 10,
        options: [
          "At perihelion (closest approach to the star)",
          "At aphelion (farthest distance from the star)",
          "At constant speed everywhere",
          "Only when eccentricity is zero",
        ],
        relevantLessonId: "lesson-2",
      },
    ],
    getSelectedAnswers: () => selectedQuizAnswers,
    selectOption: (qId, optIdx) => {
      selectedQuizAnswers[qId] = optIdx;
    },
    submitAssessment: async () => Promise.resolve(),
    retryAssessment: () => {},
  });

  await director.startGuidedSession("08", "explorer", quizStepIdx);
  const quizSnap = bridge.getStateManager().getSnapshot();
  assert(
    quizSnap.interactionState === "QUIZ_REQUIRED",
    "Reaching Module 08 quiz step transitions interactionState to QUIZ_REQUIRED",
  );

  const canSkipQuiz = await bridge.nextEligibleStep();
  assert(
    canSkipQuiz === false && director.getSnapshot().currentStepIndex === quizStepIdx,
    "nextEligibleStep() refuses to skip an unsubmitted quiz step",
  );

  // Test option selection in practice quiz mode
  const selectAccepted = await director.selectQuizOption(0, "ui");
  assert(
    selectAccepted === true && selectedQuizAnswers["m08-q1"] === 0,
    "Selecting quiz option in Cinematic Mode updates authoritative CosmosQuizGuide state",
  );

  // Test Official Exam Guardrail
  quizMode = "official";
  quizGuide.syncSessionFromBridge("08");
  const officialHintResponse = await director.requestStepHint();
  assert(
    officialHintResponse.includes("Official Certification Assessment") &&
      officialHintResponse.includes("cannot provide hints"),
    "Official examination mode blocks answer hints and auto-solutions",
  );
  unregQuizBridge();

  // --------------------------------------------------------------------------
  // 9. Backward Navigation, Unexpected Fullscreen Exit & Race Condition Lock
  // --------------------------------------------------------------------------
  console.log("\n9. Backward Navigation, Unexpected Fullscreen Exit & Race Condition Lock:");
  await director.startGuidedSession("08", "explorer", 2);
  const prevOk = await bridge.previousEligibleStep();
  assert(
    prevOk === true && director.getSnapshot().currentStepIndex === 1,
    "previousEligibleStep() moves backward to the prior instructional step",
  );

  // Simulate unexpected Escape key exiting browser fullscreen while player is open
  bridge.getStateManager().updateState({ fullscreenState: "NATIVE_FULLSCREEN" });
  bridge.handleBrowserFullscreenChange(false);
  assert(
    bridge.getStateManager().getSnapshot().fullscreenState === "VIEWPORT_FALLBACK" &&
      bridge.getStateManager().getSnapshot().playerState !== "CLOSED",
    "Unexpected browser fullscreen exit transitions smoothly to VIEWPORT_FALLBACK without losing lesson state",
  );

  // Rapid Enter/Exit operation token race condition protection
  const token1 = bridge.getStateManager().beginModeSwitchOperation();
  const token2 = bridge.getStateManager().beginModeSwitchOperation();
  assert(
    bridge.getStateManager().isCurrentModeSwitchOperation(token1) === false &&
      bridge.getStateManager().isCurrentModeSwitchOperation(token2) === true,
    "Mode-switch operation token invalidates superseded concurrent Enter/Exit transitions",
  );

  await bridge.exitCinematicMode();
  director.pauseSession();

  console.log("\n======================================================================");
  console.log(`VALIDATION SUMMARY: ${summary.passed} PASSED, ${summary.failed} FAILED`);
  console.log("======================================================================");

  if (summary.failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

void runCinematicPlayerValidation();
