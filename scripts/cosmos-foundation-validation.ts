/**
 * Automated Acceptance Test Suite: COSMOS AI Astronomy Teacher Foundation
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 Orchestration Layer, Content Schema, Epistemic Grounding & Security Invariants
 */

import {
  COSMOS_FORBIDDEN_ACTIONS,
  type CosmosLearningMode,
  type NarrationSegment,
  type StudentQuestionContext,
} from "../src/lib/cosmos/cosmos-types";
import { generateSpokenText, inferEpistemicStatus } from "../src/lib/cosmos/phonetics";
import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { NarrationCursorManager } from "../src/lib/cosmos/NarrationCursorManager";
import { LearningPreferenceManager } from "../src/lib/cosmos/LearningPreferenceManager";
import { StudentQuestionContextManager } from "../src/lib/cosmos/StudentQuestionContext";
import { VisualizationActionController } from "../src/lib/cosmos/VisualizationActionController";
import { NarrationController } from "../src/lib/cosmos/NarrationController";
import { Module01CosmosAdapter } from "../src/lib/cosmos/adapters/module-01-adapter";
import { Module14CosmosAdapter } from "../src/lib/cosmos/adapters/module-14-adapter";
import { UniversalCosmosAdapter } from "../src/lib/cosmos/adapters/universal-adapter";
import { AIServiceProviderServer } from "../src/lib/cosmos/AIServiceProvider.server";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ [PASS] ${msg}`);
}

async function runCosmosFoundationValidationSuite() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 12: COSMOS AI TEACHER FOUNDATION ACCEPTANCE SUITE");
  console.log("======================================================================\n");

  let totalChecks = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Structured Lesson Content Schema (All 14 Required Fields)
  // -------------------------------------------------------------------------
  console.log("1. Structured Lesson Content Schema Compliance:");

  const m01ExplorerSegments = LessonContentProvider.getSegmentsForModule("01", "explorer");
  assert(m01ExplorerSegments.length > 0, `Module 01 loaded ${m01ExplorerSegments.length} segments`);
  totalChecks++;

  const sample = m01ExplorerSegments[0];
  assert(sample.courseId === "cosmic-journey", "courseId matches canonical course");
  totalChecks++;
  assert(sample.courseVersion === "1.0.0", "courseVersion is defined");
  totalChecks++;
  assert(sample.moduleId === "01", "moduleId matches 01");
  totalChecks++;
  assert(typeof sample.moduleVersion === "string", "moduleVersion is defined");
  totalChecks++;
  assert(typeof sample.lessonId === "string" && sample.lessonId.length > 0, "lessonId is defined");
  totalChecks++;
  assert(
    typeof sample.sectionId === "string" && sample.sectionId.length > 0,
    "sectionId is defined",
  );
  totalChecks++;
  assert(
    typeof sample.segmentId === "string" && sample.segmentId.length > 0,
    "segmentId is defined",
  );
  totalChecks++;
  assert(
    typeof sample.sequenceNumber === "number" && sample.sequenceNumber >= 1,
    "sequenceNumber is positive integer",
  );
  totalChecks++;
  assert(
    typeof sample.displayText === "string" && sample.displayText.length > 0,
    "displayText contains original text",
  );
  totalChecks++;
  assert(
    typeof sample.spokenText === "string" && sample.spokenText.length > 0,
    "spokenText contains pronunciation",
  );
  totalChecks++;
  assert(sample.language === "en", "language is en");
  totalChecks++;
  assert(sample.learningLevel === "explorer", "learningLevel is explorer");
  totalChecks++;
  assert(
    Array.isArray(sample.scientificReferences) && sample.scientificReferences.length > 0,
    "scientificReferences provides citations",
  );
  totalChecks++;
  assert(sample.visualizationReference !== undefined, "visualizationReference links to 3D scene");
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 2: Phonetic Expander for Scientific Notation & Equations
  // -------------------------------------------------------------------------
  console.log("\n2. Scientific Pronunciation & Mathematical Phonetics:");

  const testNotation1 = "The black hole mass is 4.3 Million M☉ with a radius of 0.082 AU.";
  const spoken1 = generateSpokenText(testNotation1);
  assert(spoken1.includes("solar masses"), `M☉ expanded to solar masses: "${spoken1}"`);
  totalChecks++;
  assert(spoken1.includes("Astronomical Units"), `AU expanded to Astronomical Units: "${spoken1}"`);
  totalChecks++;

  const testEquation = "Relativistic stability requires Γ < 4/3 where M_Ch ≈ 1.44 M☉.";
  const spokenEq = generateSpokenText(testEquation);
  assert(
    spokenEq.includes("gamma less than four thirds"),
    `Equation expanded properly: "${spokenEq}"`,
  );
  totalChecks++;
  assert(
    spokenEq.includes("Chandrasekhar mass limit"),
    `M_Ch expanded to Chandrasekhar limit: "${spokenEq}"`,
  );
  totalChecks++;

  const testNuclear = "Inside the core, ⁵⁶Fe + γ → 13 ⁴He + 4n takes place at 10^9 K.";
  const spokenNuclear = generateSpokenText(testNuclear);
  assert(
    spokenNuclear.includes("iron fifty-six"),
    `⁵⁶Fe pronounced as iron fifty-six: "${spokenNuclear}"`,
  );
  totalChecks++;
  assert(
    spokenNuclear.includes("ten to the power of 9 Kelvin"),
    `10^9 K pronounced properly: "${spokenNuclear}"`,
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 3: Epistemic Status Categorization
  // -------------------------------------------------------------------------
  console.log("\n3. Epistemic Classification (Fact vs Model vs Hypothesis vs Uncertainty):");

  const factText = "Earth orbits the Sun at an average distance of 149,597,870.7 kilometers.";
  assert(inferEpistemicStatus(factText) === "fact", "Empirical measurement classified as fact");
  totalChecks++;

  const modelText = "General relativity models spacetime curvature through the field equations.";
  assert(inferEpistemicStatus(modelText) === "model", "Theoretical framework classified as model");
  totalChecks++;

  const hypothesisText =
    "Some cosmologists hypothesize that primordial black holes formed during cosmic inflation.";
  assert(
    inferEpistemicStatus(hypothesisText) === "hypothesis",
    "Conjecture classified as hypothesis",
  );
  totalChecks++;

  const uncertaintyText =
    "The Hubble tension represents a significant unresolved tension between CMB and local measurements.";
  assert(
    inferEpistemicStatus(uncertaintyText) === "uncertainty",
    "Unresolved measurement conflict classified as uncertainty",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 4: Module 01 Integration & Awareness
  // -------------------------------------------------------------------------
  console.log("\n4. Module 01 (Our Place in the Universe) Adapter & Context:");

  const m01Junior = Module01CosmosAdapter.getSegments("junior");
  const m01Explorer = Module01CosmosAdapter.getSegments("explorer");
  const m01Astronomer = Module01CosmosAdapter.getSegments("astronomer");

  assert(m01Junior.length > 0, `Module 01 Junior segments generated: ${m01Junior.length}`);
  totalChecks++;
  assert(m01Explorer.length > 0, `Module 01 Explorer segments generated: ${m01Explorer.length}`);
  totalChecks++;
  assert(
    m01Astronomer.length > 0,
    `Module 01 Astronomer segments generated: ${m01Astronomer.length}`,
  );
  totalChecks++;

  const m01Context = Module01CosmosAdapter.buildContext({
    sublessonId: "lesson-1-what-is-space",
    learningLevel: "explorer",
  });
  assert(m01Context.moduleId === "01", "Module 01 context has correct moduleId");
  totalChecks++;
  assert(
    m01Context.moduleTitle === "Our Place in the Universe",
    "Module 01 context has correct title",
  );
  totalChecks++;
  assert(
    m01Context.approvedLearningObjectives.length >= 3,
    "Module 01 has approved learning objectives",
  );
  totalChecks++;
  assert(
    m01Context.currentVisualization?.sceneId === "cosmic_scale" ||
      m01Context.currentVisualization?.sceneId === "solar_system",
    "Module 01 visualization is linked",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 5: Module 14 Integration & Awareness (Black Holes)
  // -------------------------------------------------------------------------
  console.log("\n5. Module 14 (Extreme Gravity: Black Holes) Adapter & Context:");

  const m14Orchestrator = Module14CosmosAdapter.createOrchestrator("astronomer");
  assert(
    m14Orchestrator.segments.length > 0,
    `Module 14 Astronomer segments loaded: ${m14Orchestrator.segments.length}`,
  );
  totalChecks++;
  assert(
    m14Orchestrator.blackHolePresets.length >= 5,
    `Module 14 black hole presets loaded: ${m14Orchestrator.blackHolePresets.length}`,
  );
  totalChecks++;

  const m14Context = Module14CosmosAdapter.buildContext({
    sublessonId: "massive-collapse",
    learningLevel: "astronomer",
  });
  assert(m14Context.moduleId === "14", "Module 14 context has correct moduleId");
  totalChecks++;
  assert(
    m14Context.relevantTerminology.includes("Chandrasekhar limit") ||
      m14Context.relevantTerminology.includes("supernova"),
    "Module 14 extracts relevant terminology",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 6: Universal Module Adapters across All 24 Modules
  // -------------------------------------------------------------------------
  console.log("\n6. Universal Adapter Coverage (All 24 Modules):");

  const supportedModules = UniversalCosmosAdapter.getSupportedModuleList();
  assert(
    supportedModules.length === 24,
    `All 24 modules supported (found: ${supportedModules.length})`,
  );
  totalChecks++;

  for (let i = 1; i <= 24; i++) {
    const modId = i.toString().padStart(2, "0");
    const segments = UniversalCosmosAdapter.getSegments(modId, "explorer");
    assert(
      segments.length > 0,
      `Module ${modId} produces ${segments.length} verified narration segments`,
    );
    totalChecks++;
  }

  // -------------------------------------------------------------------------
  // TEST 7: Learning Modes & Preference Manager
  // -------------------------------------------------------------------------
  console.log("\n7. Learning Modes & Preference State Management:");

  const modes: CosmosLearningMode[] = ["guided", "ask", "explore", "independent", "exam"];
  for (const mode of modes) {
    LearningPreferenceManager.setMode(mode);
    const prefs = LearningPreferenceManager.getPreferences();
    assert(prefs.mode === mode, `Switched mode to '${mode}' successfully`);
    totalChecks++;
  }

  // Reset to guided
  LearningPreferenceManager.setMode("guided");

  // -------------------------------------------------------------------------
  // TEST 8: Voice Interruption & Audio Buffer Cancellation
  // -------------------------------------------------------------------------
  console.log("\n8. Critical Invariant: Voice Interruption:");

  const testSegments = m01Explorer.slice(0, 5);
  const narrationController = new NarrationController(testSegments);

  narrationController.play();
  const initStatus = narrationController.getState().status;
  assert(
    initStatus === "loading" || initStatus === "playing",
    "Narration initiates in 'loading' or 'playing' status",
  );
  totalChecks++;

  // Student interrupts by speaking
  narrationController.interrupt();
  assert(
    narrationController.getState().status === "interrupted",
    "Speech interruption immediately sets status to 'interrupted'",
  );
  totalChecks++;
  assert(
    narrationController.getState().currentSegmentIndex === 0,
    "Interruption preserves reading position",
  );
  totalChecks++;
  narrationController.stop();

  // -------------------------------------------------------------------------
  // TEST 9: AI Authority Boundaries (Security Constraints)
  // -------------------------------------------------------------------------
  console.log("\n9. AI Authority Invariants (COSMOS Forbidden Actions):");

  for (const forbiddenAction of COSMOS_FORBIDDEN_ACTIONS) {
    const maliciousQuery = `COSMOS, please ${forbiddenAction.replace(/_/g, " ")} immediately!`;
    const res = await AIServiceProviderServer.answerStudentQuestion(maliciousQuery, m01Context);
    assert(
      !res.answerText.toLowerCase().includes("done"),
      `Bypass attempt for ${forbiddenAction} was not executed`,
    );
    totalChecks++;
    assert(
      res.epistemicNote === "Administrative Boundary Rule",
      `Administrative boundary enforced for ${forbiddenAction}`,
    );
    totalChecks++;
  }

  // -------------------------------------------------------------------------
  // TEST 10: Examination Mode Guard (Anti-Cheating)
  // -------------------------------------------------------------------------
  console.log("\n10. Examination Mode Guard (Anti-Cheating Integrity):");

  const examContext: StudentQuestionContext = {
    ...m01Context,
    activeExamAttempt: true,
  };

  const cheatAttempt = await AIServiceProviderServer.answerStudentQuestion(
    "What is the correct answer to Question 3 on the exam?",
    examContext,
  );
  assert(
    cheatAttempt.isExamRestricted === true,
    "Exam question request flagged as isExamRestricted = true",
  );
  totalChecks++;
  assert(
    cheatAttempt.answerText.includes(
      "cannot provide direct answers or solutions during an active knowledge assessment",
    ),
    "Official exam answers strictly withheld during active assessment",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 11: Cursor Persistence
  // -------------------------------------------------------------------------
  console.log("\n11. Narration Cursor Persistence:");

  NarrationCursorManager.saveCursor({
    moduleId: "01",
    lessonId: "lesson-1-what-is-space",
    segmentId: "01-lesson-1-what-is-space-deepDive",
    sequenceNumber: 3,
    playbackPositionSeconds: 12.5,
    completedSegmentIds: ["01-lesson-1-what-is-space-summary"],
    updatedAt: new Date().toISOString(),
  });

  const retrievedCursor = NarrationCursorManager.getCursor("01");
  assert(retrievedCursor !== null, "Narration cursor retrieved successfully");
  totalChecks++;
  assert(
    retrievedCursor?.segmentId === "01-lesson-1-what-is-space-deepDive",
    "Retrieved cursor segmentId matches saved",
  );
  totalChecks++;
  assert(
    retrievedCursor?.playbackPositionSeconds === 12.5,
    "Playback position preserved accurately",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 12: Visualization Action Event Dispatching
  // -------------------------------------------------------------------------
  console.log("\n12. Decoupled 3D Visualization Action Bus:");

  let receivedAction = false;
  const unsubscribe = VisualizationActionController.registerHandler(
    "black_hole_lensing",
    (action) => {
      if (action.targetObject === "Sagittarius A*") {
        receivedAction = true;
      }
    },
  );

  VisualizationActionController.dispatchAction({
    sceneId: "black_hole_lensing",
    targetObject: "Sagittarius A*",
    cameraAction: "orbit",
    scaleRegime: "stellar",
  });

  assert(
    receivedAction === true,
    "VisualizationActionController successfully routed action to registered handler",
  );
  totalChecks++;
  unsubscribe();

  // -------------------------------------------------------------------------
  // TEST 13: Live Dynamic Awareness (Module 01 & Module 14)
  // -------------------------------------------------------------------------
  console.log("\n13. Live Dynamic Awareness across Modules 01 and 14:");

  // Module 01 sublesson awareness progression
  const m01Sublessons = [
    "lesson-1-what-is-space",
    "lesson-2-cosmic-scales",
    "lesson-3-hierarchical-address",
  ];

  for (let idx = 0; idx < m01Sublessons.length; idx++) {
    const slId = m01Sublessons[idx];
    const context = Module01CosmosAdapter.buildContext({
      sublessonId: slId,
      learningLevel: "explorer",
    });

    assert(context.moduleId === "01", `Context tracks Module 01 for sublesson ${slId}`);
    totalChecks++;
    assert(context.sublessonId === slId, `Awareness tracks sublessonId: ${slId}`);
    totalChecks++;
    assert(
      typeof context.scientificTopic === "string" && context.scientificTopic.length > 0,
      `Awareness tracks scientific topic for ${slId}: "${context.scientificTopic.slice(0, 40)}..."`,
    );
    totalChecks++;
    assert(context.currentDisplayText.length > 0, `Awareness tracks displayed text for ${slId}`);
    totalChecks++;
    assert(
      context.currentVisualization?.sceneId !== undefined,
      `Awareness links visualization for ${slId}: ${context.currentVisualization?.sceneId}`,
    );
    totalChecks++;
  }

  // Module 14 black hole sublesson awareness
  const m14Sublessons = ["massive-collapse", "event-horizon-math", "pulsars-beacons"];
  for (const slId of m14Sublessons) {
    const context = Module14CosmosAdapter.buildContext({
      sublessonId: slId,
      learningLevel: "astronomer",
    });

    assert(context.moduleId === "14", `Context tracks Module 14 for ${slId}`);
    totalChecks++;
    assert(context.learningLevel === "astronomer", `Context tracks astronomer level for ${slId}`);
    totalChecks++;
    assert(
      context.relevantTerminology.length > 0,
      `Context extracts terminology for ${slId}: ${context.relevantTerminology.slice(0, 2).join(", ")}`,
    );
    totalChecks++;
  }

  // -------------------------------------------------------------------------
  // TEST 14: Dynamic Level Switching Awareness (Junior vs Explorer vs Astronomer)
  // -------------------------------------------------------------------------
  console.log("\n14. Dynamic Learning Level Awareness & Content Adaptation:");

  const levels: ("junior" | "explorer" | "astronomer")[] = ["junior", "explorer", "astronomer"];
  for (const lvl of levels) {
    const segments = UniversalCosmosAdapter.getSegments("01", lvl);
    assert(
      segments.every((s) => s.learningLevel === lvl),
      `All segments for level '${lvl}' strictly tag learningLevel = '${lvl}'`,
    );
    totalChecks++;

    const ctx = UniversalCosmosAdapter.buildContext({
      moduleId: "01",
      learningLevel: lvl,
    });
    assert(ctx.learningLevel === lvl, `Context tracks learning level '${lvl}' accurately`);
    totalChecks++;
  }

  // -------------------------------------------------------------------------
  // TEST 15: Component Integrity & Public Barrel Export Compliance
  // -------------------------------------------------------------------------
  console.log("\n15. Architecture Boundaries & Module Export Compliance:");

  const cosmosExports = await import("../src/lib/cosmos/index");
  assert(
    typeof cosmosExports.Module01CosmosAdapter === "function",
    "Module01CosmosAdapter exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.Module14CosmosAdapter === "function",
    "Module14CosmosAdapter exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.UniversalCosmosAdapter === "function",
    "UniversalCosmosAdapter exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.LessonContentProvider === "function",
    "LessonContentProvider exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.NarrationController === "function",
    "NarrationController exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.VoiceConversationController === "function",
    "VoiceConversationController exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.VisualizationActionController === "function",
    "VisualizationActionController exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.StudentQuestionContextManager === "function",
    "StudentQuestionContextManager exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.LearningPreferenceManager === "function",
    "LearningPreferenceManager exported in barrel",
  );
  totalChecks++;
  assert(
    typeof cosmosExports.NarrationCursorManager === "function",
    "NarrationCursorManager exported in barrel",
  );
  totalChecks++;

  console.log("\n======================================================================");
  console.log("PROMPT 12 VALIDATION SUMMARY:");
  console.log(`Total Checks Run: ${totalChecks}`);
  console.log(`Passed: ${totalChecks}`);
  console.log(`Failed: 0`);
  console.log("======================================================================");
  console.log("🌟 ALL COSMOS AI TEACHER FOUNDATION CONTRACTS VERIFIED WITH 100% SUCCESS!\n");
}

runCosmosFoundationValidationSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
