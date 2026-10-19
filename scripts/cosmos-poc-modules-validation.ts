/**
 * COSMOS Proof-of-Concept Modules (01, 08, 14) Comprehensive Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 08 — Phase E: End-to-End Integration, Physics Telemetry & Storyboard Verification
 *
 * Verifies:
 * 1. Exact reconciled chapter & segment counts across Modules 01, 08, and 14 (22 chapters, 120 canonical Explorer segments)
 * 2. Complete visual beat resolution for all segments across Junior, Explorer, and Astronomer tiers
 * 3. Distinct 3D chapter component mapping across all 22 chapters (6 in M01, 8 in M08, 8 in M14)
 * 4. Interactive chapter controls, live physics calculations (Junior, Explorer, Astronomer), and reset defaults
 * 5. Automatic CosmosActivityAdapter bridging & server-compatible activity verification for Modules 01, 08, and 14
 * 6. Fullscreen Cinematic Session lifecycle: enter, play, chapter seek, voice Q&A interruption + exact resumption
 * 7. Scientific review disclosures, epistemic classifications, and verified NASA/ESA asset attribution coverage
 */

import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { CosmosActivityAdapter } from "../src/lib/cosmos/CosmosActivityAdapter";
import { CosmosAnimationCueRegistry } from "../src/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import { CosmosCinematicSessionBridge } from "../src/lib/cosmos/cinematic/CosmosCinematicSessionBridge";
import { CosmosCinematicAssetManager } from "../src/lib/cosmos/cinematic/assets";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
  PROOF_OF_CONCEPT_CHAPTER_MANIFESTS,
} from "../src/lib/cosmos/cinematic/poc";

let passed = 0;
let failed = 0;

function assertCheck(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${name}${detail ? ` (${detail})` : ""}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function runValidation(): Promise<void> {
  console.log("================================================================================");
  console.log("COSMOS 2.0 — PROMPT 08 PROOF-OF-CONCEPT MODULES (01, 08, 14) VALIDATION SUITE");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // 1. Curriculum & Storyboard Manifest Reconciliation (22 Chapters, 120 Segments)
  // ---------------------------------------------------------------------------
  console.log("--- 1. Curriculum & Storyboard Manifest Verification ---");
  const stats = CosmosProofOfConceptCatalog.getSummaryStatistics();

  assertCheck(
    "Total Proof-of-Concept chapters equals 22 (6 + 8 + 8)",
    stats.totalChapters === 22 &&
      stats.byModule["01"].chapters === 6 &&
      stats.byModule["08"].chapters === 8 &&
      stats.byModule["14"].chapters === 8,
    `M01=${stats.byModule["01"].chapters}, M08=${stats.byModule["08"].chapters}, M14=${stats.byModule["14"].chapters}, Total=${stats.totalChapters}`,
  );

  assertCheck(
    "Total Proof-of-Concept canonical narration segments equals 120 (34 + 40 + 46)",
    stats.totalCanonicalSegments === 120 &&
      stats.byModule["01"].segments === 34 &&
      stats.byModule["08"].segments === 40 &&
      stats.byModule["14"].segments === 46,
    `M01=${stats.byModule["01"].segments}, M08=${stats.byModule["08"].segments}, M14=${stats.byModule["14"].segments}, Total=${stats.totalCanonicalSegments}`,
  );

  const totalBeats = PROOF_OF_CONCEPT_CHAPTER_MANIFESTS.reduce(
    (acc, ch) => acc + ch.visualBeats.length,
    0,
  );
  assertCheck(
    "Total authored visual beats across the 22 chapters >= 44",
    totalBeats >= 44,
    `${totalBeats} authored visual beats`,
  );

  // Verify 100% alignment between LessonContentProvider and PROOF_OF_CONCEPT_CHAPTER_MANIFESTS
  for (const modId of ["01", "08", "14"] as const) {
    const providerSegments = LessonContentProvider.getSegmentsForModule(modId, "explorer", "en");
    const manifestChapters = CosmosProofOfConceptCatalog.getChaptersForModule(modId);
    const manifestSegmentIds = manifestChapters.flatMap((ch) =>
      ch.visualBeats.flatMap((b) => b.narrationSegmentIds),
    );

    const missingInManifest = providerSegments.filter(
      (s) => !manifestSegmentIds.includes(s.segmentId),
    );

    assertCheck(
      `Module ${modId} 100% narration segment coverage in PoC Storyboard Manifest`,
      missingInManifest.length === 0 && manifestSegmentIds.length === providerSegments.length,
      `${manifestSegmentIds.length}/${providerSegments.length} segments mapped`,
    );

    // Verify Junior, Explorer, and Astronomer tiers all resolve to valid PoC chapter beats
    const juniorSegs = LessonContentProvider.getSegmentsForModule(modId, "junior", "en");
    const astronomerSegs = LessonContentProvider.getSegmentsForModule(modId, "astronomer", "en");
    const allTiersResolve = [...juniorSegs, ...providerSegments, ...astronomerSegs].every((seg) =>
      Boolean(
        CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
          modId,
          seg.lessonId,
          seg.segmentId,
        ),
      ),
    );
    assertCheck(
      `Module ${modId} multi-tier beat resolution across Junior (${juniorSegs.length}), Explorer (${providerSegments.length}), and Astronomer (${astronomerSegs.length})`,
      allTiersResolve && juniorSegs.length > 0 && astronomerSegs.length > 0,
      `Junior=${juniorSegs.length}, Explorer=${providerSegments.length}, Astronomer=${astronomerSegs.length}`,
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Distinct 3D Chapter Component & Cue Registry Verification
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. 22-Chapter 3D Scene Component & Animation Cue Resolution ---");
  const uniqueSceneComponents = new Set(
    PROOF_OF_CONCEPT_CHAPTER_MANIFESTS.map((ch) => ch.sceneComponentId),
  );

  assertCheck(
    "All 22 chapters map to 22 distinct 3D scene component IDs",
    uniqueSceneComponents.size === 22,
    `${uniqueSceneComponents.size} distinct 3D chapter scene components`,
  );

  let resolvedCueCount = 0;
  for (const modId of ["01", "08", "14"]) {
    const cues = CosmosAnimationCueRegistry.getCuesForModule(modId, "explorer", "en");
    for (const cue of cues) {
      if (cue.chapterCode && cue.beatId && cue.sceneComponentId) {
        resolvedCueCount++;
      }
    }
  }

  assertCheck(
    "All 120 canonical narration segments resolve chapterCode, beatId, and sceneComponentId in CosmosAnimationCueRegistry",
    resolvedCueCount === 120,
    `${resolvedCueCount}/120 cues enriched with PoC beat choreography`,
  );

  // ---------------------------------------------------------------------------
  // 3. Interactive Chapter Controls & Real-Time Physics Telemetry Engine
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Interactive Chapter Controls & Real-Time Physics Telemetry ---");
  const interactionStore = CosmosChapterInteractionStore.getInstance();
  const activityAdapter = CosmosActivityAdapter.getInstance();

  let chaptersWithControls = 0;
  let chaptersWithTelemetry = 0;

  for (const chapter of PROOF_OF_CONCEPT_CHAPTER_MANIFESTS) {
    if (chapter.interactiveControls.length > 0) {
      chaptersWithControls++;
    }
    const juniorTelemetry = interactionStore.computeChapterLiveTelemetry(
      chapter.moduleId,
      chapter.chapterId,
      "junior",
    );
    const explorerTelemetry = interactionStore.computeChapterLiveTelemetry(
      chapter.moduleId,
      chapter.chapterId,
      "explorer",
    );
    const astronomerTelemetry = interactionStore.computeChapterLiveTelemetry(
      chapter.moduleId,
      chapter.chapterId,
      "astronomer",
    );

    if (
      juniorTelemetry.length > 0 &&
      explorerTelemetry.length > 0 &&
      astronomerTelemetry.length > 0
    ) {
      chaptersWithTelemetry++;
    }
  }

  assertCheck(
    "All 22 chapters provide interactive student controls",
    chaptersWithControls === 22,
    `${chaptersWithControls}/22 chapters have interactive controls`,
  );

  assertCheck(
    "All 22 chapters compute live physics telemetry across Junior, Explorer, and Astronomer levels",
    chaptersWithTelemetry === 22,
    `${chaptersWithTelemetry}/22 chapters return multi-tier telemetry`,
  );

  // Test specific physics calculations & activity adapter bridging across Modules 01, 08, 14
  interactionStore.setControlValue("01", "what-is-space", "altitudeKm", 100);
  const karmanTelemetry = interactionStore.computeChapterLiveTelemetry(
    "01",
    "what-is-space",
    "astronomer",
  );
  assertCheck(
    "Module 01 Chapter 01.1 Kármán Line telemetry accurately identifies near-vacuum above 100 km",
    karmanTelemetry.some((m) => m.value.includes("Near-Vacuum")),
    karmanTelemetry.map((m) => `${m.label}: ${m.value}`).join(" | "),
  );

  interactionStore.setControlValue("01", "observable-universe", "cosmicHierarchyLayer", 6);
  const mod01Activity = activityAdapter.getActivityState("01");
  assertCheck(
    "Module 01 interactive cosmic hierarchy control automatically bridges to CosmosActivityAdapter",
    Boolean(mod01Activity && Number(mod01Activity.currentParameters.stepCount) >= 10),
    `stepCount=${mod01Activity?.currentParameters.stepCount}, maxScale=${mod01Activity?.currentParameters.maxScaleMeters}`,
  );

  // Module 08 Kepler / Orbital Mechanics test
  interactionStore.setControlValue(
    "08",
    "08-06",
    "harmonicPlanetSemiMajorAu",
    4.0,
  );
  const keplerTelemetry = interactionStore.computeChapterLiveTelemetry(
    "08",
    "08-06",
    "astronomer",
  );
  assertCheck(
    "Module 08 Chapter 08.6 Kepler's Third Law accurately computes P = 8.00 yr for a = 4.00 AU (1 M☉)",
    keplerTelemetry.some((m) => m.value.includes("8.00")),
    keplerTelemetry.map((m) => `${m.label}: ${m.value}`).join(" | "),
  );

  const mod08Activity = activityAdapter.getActivityState("08");
  assertCheck(
    "Module 08 orbital control adjustment automatically records valid orbital state in CosmosActivityAdapter",
    Boolean(mod08Activity && Number(mod08Activity.currentParameters.semiMajorAxisAU) === 4.0),
    `semiMajorAxisAU=${mod08Activity?.currentParameters.semiMajorAxisAU}, periapsisKm=${mod08Activity?.currentParameters.periapsisKm}`,
  );

  // Module 14 Black Hole Event Horizon & Schwarzschild Radius test
  interactionStore.setControlValue("14", "what-is-a-black-hole", "blackHoleMassSolar", 10);
  const bhConceptTelemetry = interactionStore.computeChapterLiveTelemetry(
    "14",
    "what-is-a-black-hole",
    "astronomer",
  );
  const bhHorizonTelemetry = interactionStore.computeChapterLiveTelemetry(
    "14",
    "event-horizon",
    "astronomer",
  );
  assertCheck(
    "Module 14 Chapters 14.3 & 14.4 accurately compute r_s = 29.53 km (10 M☉) and r_ph = 1.5 r_s / r_ISCO = 3.0 r_s",
    bhConceptTelemetry.some((m) => m.value.includes("29.53 km")) &&
      bhHorizonTelemetry.some((m) => m.value.includes("r_ph = 1.5 r_s")),
    [...bhConceptTelemetry, ...bhHorizonTelemetry].map((m) => `${m.label}: ${m.value}`).join(" | "),
  );

  const mod14Activity = activityAdapter.getActivityState("14");
  assertCheck(
    "Module 14 black hole control adjustment automatically bridges to CosmosActivityAdapter",
    Boolean(
      mod14Activity &&
        Math.abs(Number(mod14Activity.currentParameters.radiusKm) - 29.53) < 0.1,
    ),
    `massSolar=${mod14Activity?.currentParameters.massSolar}, radiusKm=${mod14Activity?.currentParameters.radiusKm}`,
  );

  // ---------------------------------------------------------------------------
  // 4. End-to-End Cinematic Session Playback Across Modules 01, 08, and 14
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. End-to-End Cinematic Session Playback & Interruption Recovery ---");
  const bridge = CosmosCinematicSessionBridge.getInstance();

  for (const modId of ["01", "08", "14"] as const) {
    await bridge.enterCinematicMode({
      moduleId: modId,
      learningLevel: "explorer",
      forceViewportFallback: true,
    });
    await bridge.playOrResume();
    const initialSnap = bridge.getStateManager().getSnapshot();

    assertCheck(
      `Module ${modId} opens in Cinematic Mode and starts playing chapter 1`,
      initialSnap.currentModuleId === modId &&
        initialSnap.playerState === "PLAYING" &&
        Boolean(initialSnap.currentNarrationSegmentId),
      `lesson=${initialSnap.currentLessonId}, segment=${initialSnap.currentNarrationSegmentId}`,
    );

    // Seek to the final chapter's first narration segment
    const chapters = CosmosProofOfConceptCatalog.getChaptersForModule(modId);
    const lastChapter = chapters[chapters.length - 1]!;
    const targetSegId = lastChapter.visualBeats[0]!.narrationSegmentIds[0]!;
    const seeked = bridge.seekToNarrationSegment(targetSegId);
    const jumpedSnap = bridge.getStateManager().getSnapshot();

    assertCheck(
      `Module ${modId} seeks cleanly to final chapter (${lastChapter.chapterCode}: ${lastChapter.chapterId})`,
      seeked && jumpedSnap.currentNarrationSegmentId === targetSegId,
      `activeCue=${jumpedSnap.currentAnimationCueId}`,
    );

    // Simulate a live student question interruption and verify exact segment & beat preservation
    const preQuestionSeg = jumpedSnap.currentNarrationSegmentId;
    await bridge.askCosmosQuestionInCinematicMode(
      `How does the physics in ${lastChapter.title} connect to real astronomical observations?`,
    );
    const afterQuestionSnap = bridge.getStateManager().getSnapshot();

    assertCheck(
      `Module ${modId} Q&A interruption preserves exact segment (${preQuestionSeg})`,
      afterQuestionSnap.currentNarrationSegmentId === preQuestionSeg &&
        afterQuestionSnap.playerState === "ANSWERING_QUESTION",
      `state=${afterQuestionSnap.playerState}, interaction=${afterQuestionSnap.interactionState}`,
    );

    await bridge.resumeAfterQuestionInCinematicMode();
    const resumedSnap = bridge.getStateManager().getSnapshot();
    assertCheck(
      `Module ${modId} resumes playback from exact interrupted segment (${resumedSnap.currentNarrationSegmentId})`,
      resumedSnap.currentNarrationSegmentId === preQuestionSeg &&
        resumedSnap.playerState === "PLAYING",
      `playerState=${resumedSnap.playerState}`,
    );
  }

  await bridge.exitCinematicMode();

  // ---------------------------------------------------------------------------
  // 5. Scientific Review Disclosures, Rubric Scores & Asset Provenance Coverage
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Scientific Review Disclosures, Rubric Scores & Verified Asset Provenance ---");
  let validDisclosuresAndRubrics = 0;
  for (const ch of PROOF_OF_CONCEPT_CHAPTER_MANIFESTS) {
    if (
      ch.representationDisclosure.length > 10 &&
      ch.scientificReviewCorrectionNote.length > 10 &&
      ch.rubricScores.independentScientificReviewPassed &&
      ch.rubricScores.runtimeTestsPassed &&
      ch.rubricScores.scientificAccuracy === 5
    ) {
      validDisclosuresAndRubrics++;
    }
  }

  assertCheck(
    "All 22 chapters pass independent scientific review, disclosure audit, and 5/5 quality rubric",
    validDisclosuresAndRubrics === 22,
    `${validDisclosuresAndRubrics}/22 chapters verified`,
  );

  const assetManager = CosmosCinematicAssetManager.getInstance();
  for (const modId of ["01", "08", "14"]) {
    const credits = assetManager.getModuleAttributions(modId);
    assertCheck(
      `Module ${modId} provides verified public NASA/ESA 3D asset credits and license provenance`,
      credits.length >= 2,
      `${credits.length} verified asset attributions`,
    );
  }

  console.log("\n================================================================================");
  console.log(`VALIDATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runValidation().catch((err) => {
  console.error("Validation error:", err);
  process.exit(1);
});
