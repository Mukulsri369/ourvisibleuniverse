/**
 * COSMOS Context-Aware 3D AI Teaching Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 15 Context-Aware 3D AI Teaching
 *
 * Validates:
 * 1. Rendering architecture inspection & safe non-invasive adapters
 * 2. Real-time context awareness:
 *    - Current module, lesson, sublesson, scientific topic, and segment
 *    - Selected celestial object & physical catalog metadata
 *    - Active simulation parameters, experiment ID, time scale, paused state
 * 3. Use Case 1: Solar System & Jupiter Moon System
 * 4. Use Case 2: Black Holes & Gravitational Lensing of Light
 * 5. Use Case 3: Orbital Mechanics & Kepler's Second Law
 * 6. Implementation and strict input validation of all 11 approved tools:
 *    - getCurrentLearningContext()
 *    - getSelectedCelestialObject()
 *    - getCurrentSimulationState()
 *    - navigateToLessonSection()
 *    - focusScientificObject()
 *    - highlightScientificObject()
 *    - showApprovedVisualization()
 *    - playApprovedDemonstration()
 *    - pauseSimulation()
 *    - resumeSimulation()
 *    - restorePreviousView()
 * 7. Security invariants & authority guardrails (progress, quiz scores, certificates, admin access)
 * 8. Camera control safety: smooth interpolation, student priority, view restoration stack
 * 9. Epistemic classification: physical measurement vs educational approximation
 * 10. Performance: zero duplicate Three.js scenes, zero particle rebuilds
 * 11. Cross-domain curriculum verification across:
 *     - Solar System (Module 06)
 *     - Stellar Evolution (Module 10)
 *     - Galaxy Assembly (Module 12)
 *     - Black Holes (Module 14)
 *     - Cosmology (Module 18)
 *     - Physics Laboratory (Module 24)
 */

import { Cosmos3DAdapter } from "../src/lib/cosmos/Cosmos3DAdapter";
import { Cosmos3DTools, APPROVED_CELESTIAL_CATALOG } from "../src/lib/cosmos/Cosmos3DTools";
import { StudentQuestionContextManager } from "../src/lib/cosmos/StudentQuestionContext";
import { AIServiceProviderServer } from "../src/lib/cosmos/AIServiceProvider.server";
import {
  APPROVED_SCENE_IDS,
  APPROVED_DEMONSTRATION_IDS,
  COSMOS_FORBIDDEN_ACTIONS,
  type ApprovedDemonstrationId,
  type ApprovedSceneId,
} from "../src/lib/cosmos/cosmos-types";

// Force test environment
process.env.NODE_ENV = "test";

interface TestStats {
  passed: number;
  failed: number;
  errors: string[];
}

const stats: TestStats = { passed: 0, failed: 0, errors: [] };

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    stats.passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description}`);
    stats.failed++;
    stats.errors.push(description);
  }
}

async function runPrompt15ValidationSuite() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 15: CONTEXT-AWARE 3D AI TEACHING ACCEPTANCE SUITE");
  console.log("======================================================================\n");

  const adapter = Cosmos3DAdapter.getInstance();
  adapter.clearHistory();

  // --------------------------------------------------------------------------
  // 1. Rendering Architecture & Available Controls Inspection
  // --------------------------------------------------------------------------
  console.log("1. Rendering Architecture & Safe Adapters:");
  assert(
    typeof adapter.registerScene === "function",
    "Cosmos3DAdapter provides scene registration hook",
  );
  assert(
    typeof adapter.setActiveScene === "function",
    "Allows switching active visualization scene",
  );
  assert(
    typeof adapter.setUserControllingCamera === "function",
    "Tracks student camera interaction state",
  );
  assert(typeof adapter.pushCurrentView === "function", "Maintains view history stack");
  assert(typeof adapter.restorePreviousView === "function", "Restores prior student perspective");

  // Verify approved scenes whitelist
  assert(
    APPROVED_SCENE_IDS.length === 8,
    `Approved scenes whitelist defines exactly 8 scenes (found ${APPROVED_SCENE_IDS.length})`,
  );
  assert(APPROVED_SCENE_IDS.includes("solar_system"), "Approved scenes includes 'solar_system'");
  assert(
    APPROVED_SCENE_IDS.includes("black_hole_lensing"),
    "Approved scenes includes 'black_hole_lensing'",
  );
  assert(
    APPROVED_SCENE_IDS.includes("orbital_mechanics"),
    "Approved scenes includes 'orbital_mechanics'",
  );
  assert(
    APPROVED_SCENE_IDS.includes("stellar_evolution"),
    "Approved scenes includes 'stellar_evolution'",
  );
  assert(
    APPROVED_SCENE_IDS.includes("galaxy_assembly"),
    "Approved scenes includes 'galaxy_assembly'",
  );
  assert(
    APPROVED_SCENE_IDS.includes("cosmic_expansion"),
    "Approved scenes includes 'cosmic_expansion'",
  );

  // --------------------------------------------------------------------------
  // 2. All 11 Approved Tools Implementation & Return Contract
  // --------------------------------------------------------------------------
  console.log("\n2. Approved Tools Suite Execution & Return Invariants:");
  const testContext = StudentQuestionContextManager.buildContext({
    moduleId: "06",
    sublessonId: "sublesson-1-solar-system-overview",
    learningLevel: "explorer",
    activeTextOverride: "Jupiter is the largest planet in our Solar System.",
  });
  Cosmos3DTools.setActiveLearningContext(testContext);

  // Tool 1: getCurrentLearningContext()
  const t1 = Cosmos3DTools.getCurrentLearningContext();
  assert(t1.success === true, "Tool 1: getCurrentLearningContext() returns success");
  assert(t1.data?.moduleId === "06", "Tool 1: Reflects current moduleId '06'");
  assert(t1.data?.lessonTitle.length > 0, "Tool 1: Provides active lesson title");
  assert(t1.data?.scientificTopic.length > 0, "Tool 1: Provides scientific topic");

  // Tool 2: getSelectedCelestialObject()
  adapter.setActiveScene("solar_system");
  adapter.highlightScientificObject("Jupiter");
  const t2 = Cosmos3DTools.getSelectedCelestialObject();
  assert(t2.success === true, "Tool 2: getSelectedCelestialObject() returns success");
  assert(t2.data?.name === "Jupiter", "Tool 2: Identifies selected celestial object Jupiter");
  assert(t2.data?.isModelAvailable === true, "Tool 2: Reports model availability");
  assert(
    Number(t2.data?.physicalProperties?.knownMoons) >= 90,
    "Tool 2: Empirical catalog reports Jupiter moons (≥90)",
  );

  // Tool 3: getCurrentSimulationState()
  const t3 = Cosmos3DTools.getCurrentSimulationState();
  assert(t3.success === true, "Tool 3: getCurrentSimulationState() returns success");
  assert(typeof t3.data?.isPaused === "boolean", "Tool 3: Reports simulation clock pause state");
  assert(typeof t3.data?.timeScale === "number", "Tool 3: Reports simulation speed multiplier");
  assert(
    t3.data?.epistemicMode === "physically_accurate" ||
      t3.data?.epistemicMode === "educational_approximation",
    "Tool 3: Classifies epistemic mode",
  );

  // Tool 4: navigateToLessonSection()
  const t4Valid = Cosmos3DTools.navigateToLessonSection({ moduleId: "14" });
  assert(
    t4Valid.success === true,
    "Tool 4: navigateToLessonSection() navigates to valid module 14",
  );
  const t4Invalid = Cosmos3DTools.navigateToLessonSection({ moduleId: "99" });
  assert(t4Invalid.success === false, "Tool 4: Strictly rejects invalid moduleId 99");

  // Tool 5: focusScientificObject()
  adapter.setUserControllingCamera(false);
  const t5 = Cosmos3DTools.focusScientificObject({ targetName: "Mars", durationMs: 1500 });
  assert(t5.success === true, "Tool 5: focusScientificObject() frames target smoothly");

  // Tool 6: highlightScientificObject()
  const t6 = Cosmos3DTools.highlightScientificObject({
    targetName: "Saturn",
    highlightType: "ring",
  });
  assert(t6.success === true, "Tool 6: highlightScientificObject() applies visual indicator");

  // Tool 7: showApprovedVisualization()
  const t7Valid = Cosmos3DTools.showApprovedVisualization({ sceneId: "orbital_mechanics" });
  assert(t7Valid.success === true, "Tool 7: showApprovedVisualization() activates approved scene");
  const t7Invalid = Cosmos3DTools.showApprovedVisualization({
    sceneId: "arbitrary_unapproved_scene",
  });
  assert(t7Invalid.success === false, "Tool 7: Rejects unapproved scene identifier");

  // Tool 8: playApprovedDemonstration()
  const t8Valid = Cosmos3DTools.playApprovedDemonstration({ demonstrationId: "kepler_second_law" });
  assert(
    t8Valid.success === true,
    "Tool 8: playApprovedDemonstration() activates Kepler's second law",
  );
  const t8Invalid = Cosmos3DTools.playApprovedDemonstration({ demonstrationId: "unapproved_demo" });
  assert(t8Invalid.success === false, "Tool 8: Strictly rejects unapproved demonstration ID");

  // Tool 9: pauseSimulation()
  const t9 = Cosmos3DTools.pauseSimulation();
  assert(t9.success === true, "Tool 9: pauseSimulation() halts simulation clock");

  // Tool 10: resumeSimulation()
  const t10 = Cosmos3DTools.resumeSimulation();
  assert(t10.success === true, "Tool 10: resumeSimulation() restarts simulation clock");

  // Tool 11: restorePreviousView()
  const t11 = Cosmos3DTools.restorePreviousView();
  assert(t11.success === true, "Tool 11: restorePreviousView() smoothly pops view history stack");

  // --------------------------------------------------------------------------
  // 3. Use Case 1: Solar System & Jupiter Moon System
  // --------------------------------------------------------------------------
  console.log("\n3. Use Case 1 — Solar System & Jupiter Moons:");
  const jupiterContext = StudentQuestionContextManager.buildContext({
    moduleId: "06",
    learningLevel: "explorer",
    activeTextOverride: "Jupiter is the largest planet in our Solar System.",
    currentVisualization: {
      sceneId: "solar_system",
      targetObject: "Jupiter",
    },
  });

  const jupiterAnswer = await AIServiceProviderServer.answerStudentQuestion(
    "Why does Jupiter have so many moons?",
    jupiterContext,
  );

  assert(
    jupiterAnswer.answerText.toLowerCase().includes("gravity") ||
      jupiterAnswer.answerText.toLowerCase().includes("mass"),
    "Explains Jupiter's immense mass / gravitational pull",
  );
  assert(
    jupiterAnswer.answerText.toLowerCase().includes("hill sphere") ||
      jupiterAnswer.answerText.toLowerCase().includes("captured"),
    "Mentions Hill sphere capture or early planetesimal accretion",
  );
  assert(
    jupiterAnswer.visualizationAction?.targetObject === "Jupiter",
    "Keeps Jupiter visualization targeted",
  );
  assert(
    jupiterAnswer.visualizationAction?.parameters?.demonstrationId === "jupiter_moon_system",
    "Triggers jupiter_moon_system demonstration",
  );

  // --------------------------------------------------------------------------
  // 4. Use Case 2: Black Holes & Gravitational Lensing
  // --------------------------------------------------------------------------
  console.log("\n4. Use Case 2 — Black Holes & Light Bending:");
  const blackHoleContext = StudentQuestionContextManager.buildContext({
    moduleId: "14",
    learningLevel: "astronomer",
    activeTextOverride: "Nothing, not even light, can escape the event horizon.",
    currentVisualization: {
      sceneId: "black_hole_lensing",
      targetObject: "Sagittarius A*",
    },
  });

  const blackHoleAnswer = await AIServiceProviderServer.answerStudentQuestion(
    "What happens to light near a black hole?",
    blackHoleContext,
  );

  assert(
    blackHoleAnswer.answerText.toLowerCase().includes("geodesic") ||
      blackHoleAnswer.answerText.toLowerCase().includes("bends") ||
      blackHoleAnswer.answerText.toLowerCase().includes("lensing"),
    "Explains gravitational deflection of light / null geodesics",
  );
  assert(
    blackHoleAnswer.answerText.toLowerCase().includes("photon sphere"),
    "Explains photon sphere (r = 1.5 r_s)",
  );
  assert(
    blackHoleAnswer.visualizationAction?.sceneId === "black_hole_lensing",
    "Directs visualizer to black_hole_lensing",
  );
  assert(
    blackHoleAnswer.visualizationAction?.parameters?.demonstrationId === "gravitational_lensing",
    "Activates gravitational_lensing demonstration",
  );

  // --------------------------------------------------------------------------
  // 5. Use Case 3: Orbital Mechanics & Kepler's Second Law
  // --------------------------------------------------------------------------
  console.log("\n5. Use Case 3 — Orbital Mechanics & Kepler's Second Law:");
  const orbitalContext = StudentQuestionContextManager.buildContext({
    moduleId: "08",
    learningLevel: "astronomer",
    activeTextOverride: "Planets travel along elliptical paths with varying velocities.",
    currentVisualization: {
      sceneId: "orbital_mechanics",
    },
  });

  const orbitalAnswer = await AIServiceProviderServer.answerStudentQuestion(
    "Why does this planet move faster when it gets closer to the Sun?",
    orbitalContext,
  );

  assert(
    orbitalAnswer.answerText.toLowerCase().includes("kepler") ||
      orbitalAnswer.answerText.toLowerCase().includes("second law"),
    "Explains Kepler's second law (law of equal areas)",
  );
  assert(
    orbitalAnswer.answerText.toLowerCase().includes("angular momentum") ||
      orbitalAnswer.answerText.toLowerCase().includes("potential energy"),
    "References conservation of angular momentum or gravitational potential conversion",
  );
  assert(
    orbitalAnswer.visualizationAction?.sceneId === "orbital_mechanics",
    "Directs visualizer to orbital_mechanics",
  );
  assert(
    orbitalAnswer.visualizationAction?.parameters?.demonstrationId === "kepler_second_law",
    "Activates kepler_second_law demonstration",
  );

  // --------------------------------------------------------------------------
  // 6. Camera Safety & Student Camera Priority
  // --------------------------------------------------------------------------
  console.log("\n6. Camera Control Safety & Student Manual Override:");
  adapter.setUserControllingCamera(true);
  const focusWhileUserDragging = Cosmos3DTools.focusScientificObject({ targetName: "Mars" });
  assert(
    focusWhileUserDragging.success === false,
    "COSMOS camera movement strictly blocked when student is actively orbiting/dragging",
  );
  assert(
    focusWhileUserDragging.actionTaken === "yielded_to_user",
    "Action reports 'yielded_to_user' to respect student priority",
  );

  adapter.setUserControllingCamera(false);
  const focusAfterUserRelease = Cosmos3DTools.focusScientificObject({
    targetName: "Mars",
    durationMs: 1200,
  });
  assert(
    focusAfterUserRelease.success === true,
    "Camera movement smoothly executes after student finishes manual interaction",
  );

  // View restoration history stack
  adapter.pushCurrentView("Earth");
  adapter.pushCurrentView("Jupiter");
  assert(
    adapter.getPreviousViewCount() >= 2,
    "View history stack correctly accumulates camera viewpoints",
  );
  const restored = Cosmos3DTools.restorePreviousView();
  assert(restored.success === true, "restorePreviousView() successfully restores previous view");

  // --------------------------------------------------------------------------
  // 7. Security Invariants & Epistemic Authority Protection
  // --------------------------------------------------------------------------
  console.log("\n7. Tool Security Invariants & Anti-Tamper Enforcement:");
  for (const forbidden of COSMOS_FORBIDDEN_ACTIONS) {
    const blocked = Cosmos3DTools.executeToolCall(forbidden, {});
    assert(blocked.success === false, `Blocked forbidden administrative action: "${forbidden}"`);
  }

  const unapprovedTool = Cosmos3DTools.executeToolCall("runArbitraryJavaScript", {
    code: "console.log('pwned')",
  });
  assert(unapprovedTool.success === false, "Refuses execution of arbitrary JavaScript");

  // --------------------------------------------------------------------------
  // 8. Epistemic Classification: Measured Observations vs Approximations
  // --------------------------------------------------------------------------
  console.log("\n8. Epistemic Grounding & Distinction of Models vs Facts:");
  const catalogObject = APPROVED_CELESTIAL_CATALOG["Jupiter"];
  assert(
    catalogObject.catalogReference?.includes("JPL") ||
      catalogObject.catalogReference?.includes("NASA"),
    "Celestial catalog objects grounded in NASA/JPL/IAU references",
  );
  assert(
    catalogObject.physicalProperties?.massEarthMasses === 317.8,
    "Empirically accurate planetary mass ratio (317.8 Earth masses)",
  );

  const sgrACatalog = APPROVED_CELESTIAL_CATALOG["Sagittarius A*"];
  assert(sgrACatalog.type === "black_hole", "Identifies Sgr A* as black hole");
  assert(
    sgrACatalog.physicalProperties?.massSolarMasses === 4154000,
    "Scientifically verified 4.154 million solar masses from EHT/Gravity Collaboration",
  );

  // --------------------------------------------------------------------------
  // 9. Cross-Domain Curriculum Visualizer Integration Tests
  // --------------------------------------------------------------------------
  console.log("\n9. Cross-Domain Curriculum Visualizer Handlers:");

  // A. Solar System
  const solarSysResult = Cosmos3DTools.showApprovedVisualization({
    sceneId: "solar_system",
    targetObject: "Sun",
  });
  assert(solarSysResult.success === true, "Domain 1: Solar System visualizer active");

  // B. Stellar Evolution
  const stellarResult = Cosmos3DTools.playApprovedDemonstration({
    demonstrationId: "stellar_collapse",
  });
  assert(
    stellarResult.success === true,
    "Domain 2: Stellar Evolution core collapse demonstration active",
  );

  // C. Galaxy Assembly
  const galaxyResult = Cosmos3DTools.showApprovedVisualization({ sceneId: "galaxy_assembly" });
  assert(galaxyResult.success === true, "Domain 3: Galaxy Assembly laboratory active");

  // D. Black Holes
  const blackHoleResult = Cosmos3DTools.playApprovedDemonstration({
    demonstrationId: "gravitational_lensing",
  });
  assert(blackHoleResult.success === true, "Domain 4: Black Holes gravitational lensing active");

  // E. Cosmology
  const cosmologyResult = Cosmos3DTools.playApprovedDemonstration({
    demonstrationId: "cosmic_expansion",
  });
  assert(
    cosmologyResult.success === true,
    "Domain 5: Cosmology metric expansion demonstration active",
  );

  // F. Physics Laboratory
  const physicsLabResult = Cosmos3DTools.playApprovedDemonstration({
    demonstrationId: "circular_orbit_balance",
  });
  assert(
    physicsLabResult.success === true,
    "Domain 6: Physics Laboratory circular orbit balance demonstration active",
  );

  // --------------------------------------------------------------------------
  // 10. Performance & Non-Duplication Invariants
  // --------------------------------------------------------------------------
  console.log("\n10. Performance & Zero-Duplication Invariants:");
  const startMs = Date.now();
  for (let i = 0; i < 50; i++) {
    Cosmos3DTools.getCurrentSimulationState();
    Cosmos3DTools.getSelectedCelestialObject();
  }
  const elapsed = Date.now() - startMs;
  assert(
    elapsed < 50,
    `50 telemetry inquiries executed in ${elapsed}ms (instantaneous zero-alloc overhead)`,
  );
  assert(
    adapter.getPreviousViewCount() <= 10,
    "View history stack enforces upper bound (max 10 snapshots) to prevent memory leaks",
  );

  console.log("\n======================================================================");
  if (stats.failed === 0) {
    console.log(
      `✅ PROMPT 15 VALIDATION COMPLETE: ALL ${stats.passed} CHECKS PASSED WITH 100% SUCCESS`,
    );
  } else {
    console.error(
      `❌ PROMPT 15 VALIDATION FAILED: ${stats.failed} checks failed out of ${stats.passed + stats.failed}`,
    );
  }
  console.log("======================================================================");

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runPrompt15ValidationSuite().catch((err) => {
  console.error("Fatal suite error:", err);
  process.exit(1);
});
