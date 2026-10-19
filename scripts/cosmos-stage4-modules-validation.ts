/**
 * COSMOS Stage 4 Modules (13, 14, 15, 16) Automated Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 12 — Complete Stage 4 Cinematic Cosmology Experience
 */

import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { CosmosAnimationCueRegistry } from "../src/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import { CosmosCinematicSceneRegistry } from "../src/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import {
  CosmosChapterInteractionStore,
  CosmosProofOfConceptCatalog,
  type Stage4ModuleId,
} from "../src/lib/cosmos/cinematic/poc";
import { CosmosActivityAdapter } from "../src/lib/cosmos/CosmosActivityAdapter";
import { validateActivityOutcomeServer } from "../src/lib/academy/activity-validator.server";

let passed = 0;
let failed = 0;

function assertCheck(name: string, condition: boolean, detail = ""): void {
  if (condition) {
    passed += 1;
    console.log(`✅ PASS: ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed += 1;
    console.error(`❌ FAIL: ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log("================================================================================");
console.log("COSMOS STAGE 4 CINEMATIC COSMOLOGY VALIDATION (MODULES 13, 14, 15, 16)");
console.log("================================================================================");

const stats = CosmosProofOfConceptCatalog.getStage4SummaryStatistics();

assertCheck(
  "Stage 4 covers all 4 modules (13, 14, 15, 16)",
  stats.totalModules === 4,
  `totalModules=${stats.totalModules}`,
);

assertCheck(
  "Stage 4 contains exactly 30 chapters (6 + 8 + 7 + 9)",
  stats.totalChapters === 30 &&
    stats.byModule["13"].chapters === 6 &&
    stats.byModule["14"].chapters === 8 &&
    stats.byModule["15"].chapters === 7 &&
    stats.byModule["16"].chapters === 9,
  JSON.stringify(stats.byModule),
);

assertCheck(
  "Stage 4 newly implemented modules (13, 15, 16) contain 22 chapters",
  stats.newChapters === 22,
  `newChapters=${stats.newChapters}`,
);

assertCheck(
  "Stage 4 contains 203 canonical Explorer narration segments (62 + 46 + 42 + 53)",
  stats.totalCanonicalSegments === 203 &&
    stats.byModule["13"].segments === 62 &&
    stats.byModule["14"].segments === 46 &&
    stats.byModule["15"].segments === 42 &&
    stats.byModule["16"].segments === 53,
  `totalCanonicalSegments=${stats.totalCanonicalSegments}`,
);

assertCheck(
  "Stage 4 newly implemented modules (13, 15, 16) cover 157 canonical Explorer segments",
  stats.newCanonicalSegments === 157,
  `newCanonicalSegments=${stats.newCanonicalSegments}`,
);

const stage4Chapters = CosmosProofOfConceptCatalog.getStage4ChapterManifests();
const uniqueSceneComponentIds = new Set(stage4Chapters.map((c) => c.sceneComponentId));

assertCheck(
  "All 30 Stage 4 chapters have unique dedicated 3D sceneComponentIds",
  uniqueSceneComponentIds.size === 30,
  `uniqueSceneComponentIds=${uniqueSceneComponentIds.size}`,
);

const interactionStore = CosmosChapterInteractionStore.getInstance();

for (const chapter of stage4Chapters) {
  const r = chapter.rubricScores;
  const allFive =
    r.scientificAccuracy === 5 &&
    r.educationalClarity === 5 &&
    r.cinematicComposition === 5 &&
    r.celestialVisualFidelity === 5 &&
    r.lightingAndMaterials === 5 &&
    r.animationStorytelling === 5 &&
    r.cameraChoreography === 5 &&
    r.narrationSynchronization === 5 &&
    r.interactivity === 5 &&
    r.accessibility === 5 &&
    r.performanceStability === 5 &&
    r.visualDistinctiveness === 5 &&
    r.independentScientificReviewPassed &&
    r.runtimeTestsPassed;

  assertCheck(
    `Chapter ${chapter.chapterCode} (${chapter.title}) meets 5/5 rubric & scientific disclosures`,
    allFive &&
      chapter.scientificObjective.length > 20 &&
      chapter.representationDisclosure.length > 20 &&
      chapter.scientificReviewCorrectionNote.length > 15 &&
      chapter.interactiveControls.length >= 2 &&
      chapter.visualBeats.length >= 2 &&
      chapter.chapterAnnotations.length >= 1,
    `beats=${chapter.visualBeats.length}, controls=${chapter.interactiveControls.length}`,
  );

  const telemetryExplorer = interactionStore.computeChapterLiveTelemetry(
    chapter.moduleId,
    chapter.chapterId,
    "explorer",
  );
  const telemetryJunior = interactionStore.computeChapterLiveTelemetry(
    chapter.moduleId,
    chapter.chapterId,
    "junior",
  );
  const telemetryAstronomer = interactionStore.computeChapterLiveTelemetry(
    chapter.moduleId,
    chapter.chapterId,
    "astronomer",
  );

  assertCheck(
    `Chapter ${chapter.chapterCode} computes live scientific telemetry across all 3 levels`,
    telemetryExplorer.length >= 2 && telemetryJunior.length >= 2 && telemetryAstronomer.length >= 2,
    `metrics=${telemetryExplorer.length}`,
  );
}

// Verify 100% narration synchronization across all 4 Stage 4 modules, 3 levels, and 3 languages
const STAGE4_MODULES: Stage4ModuleId[] = ["13", "14", "15", "16"];
const LEVELS = ["explorer", "junior", "astronomer"] as const;
const LANGUAGES = ["en", "hi", "mr"] as const;

for (const modId of STAGE4_MODULES) {
  const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(modId);
  assertCheck(
    `Module ${modId} has explicit 3D scene descriptor in CosmosCinematicSceneRegistry`,
    Boolean(sceneDesc && sceneDesc.objects.length >= 3 && sceneDesc.annotations.length >= 2),
    `sceneId=${sceneDesc.sceneId}, objects=${sceneDesc.objects.length}`,
  );

  for (const level of LEVELS) {
    for (const lang of LANGUAGES) {
      const segments = LessonContentProvider.getSegmentsForModule(modId, level, lang);
      const cues = CosmosAnimationCueRegistry.getCuesForModule(modId, level, lang);
      let resolvedBeats = 0;

      for (const seg of segments) {
        const beatMatch = CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
          modId,
          seg.lessonId,
          seg.segmentId,
        );
        if (beatMatch) resolvedBeats += 1;
      }

      const resolvedCues = cues.filter(
        (c) => Boolean(c.sceneComponentId) && Boolean(c.beatId) && Boolean(c.chapterCode),
      ).length;

      assertCheck(
        `Module ${modId} [${level}/${lang}] resolves 100% of narration segments (${segments.length})`,
        segments.length > 0 &&
          resolvedBeats === segments.length &&
          resolvedCues === segments.length,
        `segments=${segments.length}, beats=${resolvedBeats}, cues=${resolvedCues}`,
      );
    }
  }
}

// Verify interactive chapter controls bridge to CosmosActivityAdapter and pass server validation
const activityAdapter = CosmosActivityAdapter.getInstance();

interactionStore.setControlValue("13", "13-1-morphology", "selectedMorphologyClass", "E0");
interactionStore.setControlValue("13", "13-5-dark-matter", "haloMassMultiplier", 1.35);
interactionStore.setControlValue("14", "14-event-horizon", "blackHoleMassSolar", 15);
interactionStore.setControlValue(
  "15",
  "sub-15-3-galaxy-clusters",
  "clusterVirialMass14Solar",
  12.5,
);
interactionStore.setControlValue("15", "sub-15-7-cosmic-evolution", "cosmicRedshiftEpochZ", 2.0);
interactionStore.setControlValue("16", "sub-16-4-dark-matter-halos", "nfwVirialMass12Solar", 1.45);
interactionStore.setControlValue("16", "sub-16-9-open-questions", "cplW0Parameter", -0.9);

const act13 = activityAdapter.getActivityForModule("13");
const act14 = activityAdapter.getActivityForModule("14");
const act15 = activityAdapter.getActivityForModule("15");
const act16 = activityAdapter.getActivityForModule("16");

assertCheck(
  "Module 13 interactive chapter controls bridge to ActivityAdapter",
  Boolean(act13 && act13.completedActions.length > 0),
  JSON.stringify(act13?.completedActions),
);
assertCheck(
  "Module 14 interactive chapter controls bridge to ActivityAdapter",
  Boolean(act14 && act14.completedActions.length > 0),
  JSON.stringify(act14?.completedActions),
);
assertCheck(
  "Module 15 interactive chapter controls bridge to ActivityAdapter",
  Boolean(act15 && act15.completedActions.length > 0),
  JSON.stringify(act15?.completedActions),
);
assertCheck(
  "Module 16 interactive chapter controls bridge to ActivityAdapter",
  Boolean(act16 && act16.completedActions.length > 0),
  JSON.stringify(act16?.completedActions),
);

// Verify server-side activity payload validator accepts Stage 4 payloads
const val13 = validateActivityOutcomeServer("galaxy_morphology_classification", {
  galaxyTypesIdentified: 4,
  classifiedCount: 4,
  verified: true,
});
const val14 = validateActivityOutcomeServer("schwarzschild_radius_calculation", {
  massSolar: 15,
  radiusKm: 44.3,
  verified: true,
});
const val15 = validateActivityOutcomeServer("cosmic_web_node_inspection", {
  nodesInspected: 4,
  structuresInspected: 4,
  verified: true,
});
const val16 = validateActivityOutcomeServer("rotation_curve_fitting", {
  haloMassSolar: 1.45e12,
  haloToStellarMassRatio: 8.5,
  verified: true,
});

assertCheck(
  "Server activity validator approves all 4 Stage 4 module activity submissions",
  val13.isValid && val14.isValid && val15.isValid && val16.isValid,
  `m13=${val13.isValid}, m14=${val14.isValid}, m15=${val15.isValid}, m16=${val16.isValid}`,
);

console.log("================================================================================");
console.log(`STAGE 4 VALIDATION SUMMARY: ${passed} passed, ${failed} failed`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
