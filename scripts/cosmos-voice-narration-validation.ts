/**
 * Automated Acceptance Test Suite: COSMOS Intelligent Voice Narration
 * Project: Our Visible Universe Academy
 * Scope: Prompt 13 Complete Natural Voice Narration for All 24 Modules
 */

import {
  type CosmosAudioSynthesisResult,
  type CosmosLanguage,
  type CosmosNarrationStatus,
  type CosmosVoiceName,
  type NarrationSegment,
  type NarrationState,
} from "../src/lib/cosmos/cosmos-types";
import { generateSpokenText, inferEpistemicStatus } from "../src/lib/cosmos/phonetics";
import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { NarrationController } from "../src/lib/cosmos/NarrationController";
import { NarrationCursorManager } from "../src/lib/cosmos/NarrationCursorManager";
import { AudioCacheManager } from "../src/lib/cosmos/AudioCacheManager";
import { UniversalCosmosAdapter } from "../src/lib/cosmos/adapters/universal-adapter";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ [PASS] ${msg}`);
}

async function runVoiceNarrationValidationSuite() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 13: INTELLIGENT VOICE NARRATION ACCEPTANCE SUITE");
  console.log("======================================================================\n");

  let totalChecks = 0;

  // -------------------------------------------------------------------------
  // TEST 1: Full Instructional Coverage Across All 24 Modules
  // -------------------------------------------------------------------------
  console.log("1. Full Instructional Content Coverage (All 24 Modules):");

  const supportedModules = UniversalCosmosAdapter.getSupportedModuleList();
  assert(
    supportedModules.length === 24,
    `All 24 modules registered (found: ${supportedModules.length})`,
  );
  totalChecks++;

  let totalSegmentsAllModules = 0;
  for (const modId of supportedModules) {
    const segs = LessonContentProvider.getSegmentsForModule(modId, "explorer", "en");
    assert(segs.length > 0, `Module ${modId} has segments (${segs.length} generated)`);
    totalChecks++;

    // Verify Lesson Titles are never skipped
    const titleSegs = segs.filter((s) => s.sectionId === "title");
    assert(
      titleSegs.length > 0,
      `Module ${modId} includes lesson titles (${titleSegs.length} titles)`,
    );
    totalChecks++;

    // Verify sequence monotonicity and stable IDs
    const seenIds = new Set<string>();
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      assert(
        s.sequenceNumber === i + 1,
        `Module ${modId} segment ${i + 1} has strictly monotonic sequence number`,
      );
      totalChecks++;
      assert(!seenIds.has(s.segmentId), `Module ${modId} has unique segmentId "${s.segmentId}"`);
      seenIds.add(s.segmentId);
      totalChecks++;
      assert(
        s.displayText.length > 0,
        `Module ${modId} segment ${s.segmentId} has non-empty displayText`,
      );
      totalChecks++;
      assert(
        s.spokenText.length > 0,
        `Module ${modId} segment ${s.segmentId} has non-empty spokenText`,
      );
      totalChecks++;
    }

    totalSegmentsAllModules += segs.length;
  }
  console.log(`  ✓ [INFO] Total verified segments across curriculum: ${totalSegmentsAllModules}`);

  // -------------------------------------------------------------------------
  // TEST 2: Detailed Verification for Modules 01 and 14
  // -------------------------------------------------------------------------
  console.log("\n2. Deep Inspection of Modules 01 and 14:");

  const m01Segments = LessonContentProvider.getSegmentsForModule("01", "explorer", "en");
  assert(m01Segments.length >= 30, `Module 01 has ${m01Segments.length} segments`);
  totalChecks++;
  const m01Titles = m01Segments.filter((s) => s.sectionId === "title");
  assert(m01Titles.length === 6, `Module 01 has all 6 sublesson titles narrated`);
  totalChecks++;

  const m14Segments = LessonContentProvider.getSegmentsForModule("14", "astronomer", "en");
  assert(m14Segments.length >= 40, `Module 14 has ${m14Segments.length} segments`);
  totalChecks++;
  const m14Titles = m14Segments.filter((s) => s.sectionId === "title");
  assert(m14Titles.length === 8, `Module 14 has all 8 sublesson titles narrated`);
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 3: Mathematical & Physical Equation Speech Expansions
  // -------------------------------------------------------------------------
  console.log("\n3. Mathematical Formula & Equation Phonetics:");

  const eq1 = "Newton's law: F = G(m1*m2)/r^2";
  const sp1 = generateSpokenText(eq1);
  assert(
    sp1.includes("gravitational force F equals universal gravitational constant G"),
    `F = G(m1m2)/r^2 expanded accurately: "${sp1}"`,
  );
  totalChecks++;
  assert(
    sp1.includes("divided by distance r squared"),
    `distance r squared expanded properly: "${sp1}"`,
  );
  totalChecks++;

  const eq2 = "Einstein's mass-energy formula is E = mc^2 and E = mc².";
  const sp2 = generateSpokenText(eq2);
  assert(
    sp2.includes("E equals m c squared"),
    `E = mc^2 expanded accurately without trailing digits: "${sp2}"`,
  );
  totalChecks++;
  assert(!sp2.includes("squared2"), `No regex trailing '2' artifact in: "${sp2}"`);
  totalChecks++;

  const eq3 = "Hubble's expansion law: v = H0 * d";
  const sp3 = generateSpokenText(eq3);
  assert(
    sp3.includes("recession velocity v equals Hubble constant H-nought times distance d"),
    `v = H0 * d expanded accurately: "${sp3}"`,
  );
  totalChecks++;

  const eq4 = "Kepler's Third Law states P^2 = a^3.";
  const sp4 = generateSpokenText(eq4);
  assert(
    sp4.includes("orbital period P squared equals semi-major axis a cubed"),
    `P^2 = a^3 expanded accurately: "${sp4}"`,
  );
  totalChecks++;

  const eq5 = "Schwarzschild radius is given by r_s = 2GM/c^2.";
  const sp5 = generateSpokenText(eq5);
  assert(
    sp5.includes("Schwarzschild radius equals two G M over c squared"),
    `r_s = 2GM/c^2 expanded accurately: "${sp5}"`,
  );
  totalChecks++;

  const eq6 = "Escape velocity v_esc = \\sqrt{2GM/R}.";
  const sp6 = generateSpokenText(eq6);
  assert(
    sp6.includes("escape velocity equals the square root of two G M over radius R"),
    `Escape velocity formula expanded: "${sp6}"`,
  );
  totalChecks++;

  const eq7 = "Wien's law is λ_max = b / T.";
  const sp7 = generateSpokenText(eq7);
  assert(
    sp7.includes(
      "peak wavelength lambda max equals Wien's displacement constant b divided by absolute temperature T",
    ),
    `Wien's law expanded: "${sp7}"`,
  );
  totalChecks++;

  const eq8 = "At early times, a(t) \\propto t^{1/2} and T > 10^32 K.";
  const sp8 = generateSpokenText(eq8);
  assert(
    sp8.includes("scale factor a of t is proportional to"),
    `a(t) and proportionality expanded: "${sp8}"`,
  );
  totalChecks++;
  assert(sp8.includes("ten to the power of 32 Kelvin"), `10^32 K expanded: "${sp8}"`);
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 4: Markdown and LaTeX Formatting Stripping for Spoken Text
  // -------------------------------------------------------------------------
  console.log("\n4. Spoken Cleanliness (Markdown & LaTeX Delimiter Stripping):");

  const mdInput =
    "### What Was the Big Bang?\n\n**Space** expanded from a hot state. Notice $E = mc^2$.";
  const spMd = generateSpokenText(mdInput);
  assert(!spMd.includes("###"), `Markdown header hashes stripped: "${spMd}"`);
  totalChecks++;
  assert(!spMd.includes("**"), `Markdown bold asterisks stripped: "${spMd}"`);
  totalChecks++;
  assert(!spMd.includes("$"), `LaTeX dollar signs stripped from spoken text: "${spMd}"`);
  totalChecks++;
  assert(spMd.startsWith("What Was the Big Bang?"), `Header spoken naturally: "${spMd}"`);
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 5: Narration Controller State Machine & Cursor Invariant
  // -------------------------------------------------------------------------
  console.log("\n5. Narration Controller State Machine & Cursor Progression Invariant:");

  const testSegments = m01Segments.slice(0, 5);
  const controller = new NarrationController(testSegments, 0);

  const currentState: NarrationState = controller.getState();
  assert(currentState.status === "idle", `Initial state is 'idle' (got: ${currentState.status})`);
  totalChecks++;
  assert(currentState.currentSegmentIndex === 0, `Initial segment index is 0`);
  totalChecks++;

  // Test speed control
  controller.setSpeed(1.25);
  assert(controller.getState().speechSpeed === 1.25, "Speed updated to 1.25x");
  totalChecks++;
  controller.setSpeed(2.5); // Should clamp to 1.5
  assert(controller.getState().speechSpeed === 1.5, "Speed correctly clamped to 1.5x max");
  totalChecks++;

  // Test voice preference
  controller.setVoiceName("Puck");
  assert(controller.getState().voiceName === "Puck", "Voice updated to Puck");
  totalChecks++;

  // Test text-only mode
  controller.setTextOnlyMode(true);
  assert(controller.getState().textOnlyMode === true, "Text-only mode enabled");
  totalChecks++;
  assert(controller.getState().audioSource === "text-only", "Audio source updated to text-only");
  totalChecks++;

  // Test seek and cursor advancement
  controller.seekSegment(2);
  assert(controller.getState().currentSegmentIndex === 2, "Seek segment to index 2 successful");
  totalChecks++;
  assert(
    controller.getState().currentSegment?.segmentId === testSegments[2].segmentId,
    "Current segment matches sought index",
  );
  totalChecks++;

  // Test previous segment
  controller.previous();
  assert(controller.getState().currentSegmentIndex === 1, "Previous segment moved to index 1");
  totalChecks++;

  // Test next segment
  controller.next();
  assert(controller.getState().currentSegmentIndex === 2, "Next segment moved to index 2");
  totalChecks++;

  // Test voice interruption invariant
  controller.interrupt();
  assert(controller.getState().status === "interrupted", "Interrupt set status to 'interrupted'");
  totalChecks++;
  assert(
    controller.getState().currentSegmentIndex === 2,
    "Interruption preserved active reading index",
  );
  totalChecks++;

  // Test stop
  controller.stop();
  assert(controller.getState().status === "idle", "Stop reset status to 'idle'");
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 6: Confirmed Cursor Advancement Invariant
  // -------------------------------------------------------------------------
  console.log("\n6. Confirmed Cursor Advancement Invariant:");

  // Clear cursor first
  NarrationCursorManager.clearCursor("01");
  assert(NarrationCursorManager.getCursor("01") === null, "Cursor cleared cleanly");
  totalChecks++;

  // Advance confirmed cursor ONLY on completion
  NarrationCursorManager.markSegmentConfirmedCompleted({
    moduleId: "01",
    lessonId: testSegments[0].lessonId,
    sectionId: testSegments[0].sectionId,
    segmentId: testSegments[0].segmentId,
    sequenceNumber: 1,
  });

  const savedCursor = NarrationCursorManager.getCursor("01");
  assert(savedCursor !== null, "Cursor saved in store");
  totalChecks++;
  assert(
    savedCursor?.lastConfirmedCompletedSegmentId === testSegments[0].segmentId,
    "Confirmed segment stored accurately",
  );
  totalChecks++;
  assert(
    savedCursor?.completedSegmentIds.includes(testSegments[0].segmentId) === true,
    "Segment recorded in completedSegmentIds",
  );
  totalChecks++;

  // -------------------------------------------------------------------------
  // TEST 7: Audio Cache Manager & Privacy Invariant
  // -------------------------------------------------------------------------
  console.log("\n7. Audio Cache Manager & Zero-PII Invariant:");

  AudioCacheManager.clear();
  assert(AudioCacheManager.getStats().memorySize === 0, "Audio cache cleared");
  totalChecks++;

  const testKey = AudioCacheManager.createCacheKey({
    courseVersion: "1.0.0",
    moduleId: "01",
    segmentId: "01-sub-1-summary",
    language: "en",
    voiceName: "Kore",
    model: "gemini-3.8-flash-lite-tts",
  });

  assert(!testKey.includes("user"), "Cache key does not contain user identifier");
  totalChecks++;
  assert(!testKey.includes("student"), "Cache key does not contain student identifier");
  totalChecks++;
  assert(!testKey.includes("@"), "Cache key does not contain email address");
  totalChecks++;

  AudioCacheManager.set(testKey, "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
  assert(AudioCacheManager.has(testKey), "Audio cache stored payload successfully");
  totalChecks++;
  assert(AudioCacheManager.get(testKey) !== null, "Audio cache returned stored payload");
  totalChecks++;

  console.log("======================================================================");
  console.log(`PROMPT 13 VALIDATION SUMMARY:`);
  console.log(`Total Checks Run: ${totalChecks}`);
  console.log(`Passed: ${totalChecks}`);
  console.log(`Failed: 0`);
  console.log("======================================================================");
  console.log("🌟 ALL COSMOS VOICE NARRATION ACCEPTANCE CONTRACTS VERIFIED WITH 100% SUCCESS!");
}

runVoiceNarrationValidationSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
