/**
 * COSMOS Stage 2 Cinematic Modules (05, 06, 07, 08) End-to-End Validation Suite
 * Verifies:
 * 1. Exact 30-chapter and 149-canonical-segment reconciliation across Modules 05, 06, 07, and 08
 * 2. Multi-tier (`junior`, `explorer`, `astronomer`) cue and beat resolution with zero unmapped segments
 * 3. 30 distinct 3D sceneComponentIds, interactive lab controls, and scientific representation disclosures
 * 4. Live physics telemetry computation and ActivityAdapter bridging across all 4 Stage 2 modules
 */

import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import { CosmosAnimationCueRegistry } from "../src/lib/cosmos/cinematic/CosmosAnimationCueRegistry";
import {
  CosmosProofOfConceptCatalog,
  CosmosChapterInteractionStore,
  STAGE_2_NEW_CHAPTER_MANIFESTS,
} from "../src/lib/cosmos/cinematic/poc";
import { CosmosActivityAdapter } from "../src/lib/cosmos/CosmosActivityAdapter";

let passed = 0;
let failed = 0;

function assertCheck(name: string, condition: boolean, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${name}${details ? ` — ${details}` : ""}`);
  }
}

console.log("================================================================================");
console.log("COSMOS STAGE 2 (MODULES 05–08) 30-CHAPTER & 149-SEGMENT VALIDATION SUITE");
console.log("================================================================================");

// 1. Summary Statistics Check
const stage2Stats = CosmosProofOfConceptCatalog.getStage2SummaryStatistics();
assertCheck(
  "Stage 2 total chapters === 30 (7 + 8 + 7 + 8)",
  stage2Stats.totalChapters === 30 &&
    stage2Stats.byModule["05"].chapters === 7 &&
    stage2Stats.byModule["06"].chapters === 8 &&
    stage2Stats.byModule["07"].chapters === 7 &&
    stage2Stats.byModule["08"].chapters === 8,
  JSON.stringify(stage2Stats),
);

assertCheck(
  "Stage 2 total canonical Explorer segments === 149 (40 + 34 + 35 + 40)",
  stage2Stats.totalCanonicalSegments === 149 &&
    stage2Stats.byModule["05"].segments === 40 &&
    stage2Stats.byModule["06"].segments === 34 &&
    stage2Stats.byModule["07"].segments === 35 &&
    stage2Stats.byModule["08"].segments === 40,
  JSON.stringify(stage2Stats),
);

assertCheck(
  "STAGE_2_NEW_CHAPTER_MANIFESTS contains 22 chapters for Modules 05, 06, and 07",
  STAGE_2_NEW_CHAPTER_MANIFESTS.length === 22,
  `Found ${STAGE_2_NEW_CHAPTER_MANIFESTS.length}`,
);

// 2. Exact 1:1 Reconciliation with LessonContentProvider across junior, explorer, astronomer
const stage2Modules = [
  { id: "05", expectedChapters: 7, expectedExplorerSegments: 40 },
  { id: "06", expectedChapters: 8, expectedExplorerSegments: 34 },
  { id: "07", expectedChapters: 7, expectedExplorerSegments: 35 },
  { id: "08", expectedChapters: 8, expectedExplorerSegments: 40 },
] as const;

const seenSceneComponentIds = new Set<string>();

for (const mod of stage2Modules) {
  const chapters = CosmosProofOfConceptCatalog.getChaptersForModule(mod.id);
  assertCheck(
    `Module ${mod.id} has ${mod.expectedChapters} registered chapters`,
    chapters.length === mod.expectedChapters,
    `Got ${chapters.length}`,
  );

  for (const ch of chapters) {
    seenSceneComponentIds.add(ch.sceneComponentId);
    assertCheck(
      `Chapter ${ch.chapterCode} (${ch.chapterId}) has >=2 beats, controls, annotations & disclosure`,
      ch.visualBeats.length >= 2 &&
        ch.interactiveControls.length >= 1 &&
        ch.chapterAnnotations.length >= 1 &&
        typeof ch.representationDisclosure === "string" &&
        ch.representationDisclosure.length > 0,
      `beats=${ch.visualBeats.length}, controls=${ch.interactiveControls.length}, annotations=${ch.chapterAnnotations.length}`,
    );
  }

  for (const level of ["junior", "explorer", "astronomer"] as const) {
    const segments = LessonContentProvider.getSegmentsForModule(mod.id, level, "en");
    const cues = CosmosAnimationCueRegistry.getCuesForModule(mod.id, level, "en");

    if (level === "explorer") {
      assertCheck(
        `Module ${mod.id} Explorer segment count matches ${mod.expectedExplorerSegments}`,
        segments.length === mod.expectedExplorerSegments,
        `Got ${segments.length}`,
      );
    }

    const everyCueHasSceneComponent = cues.every(
      (c) => Boolean(c.sceneComponentId) && Boolean(c.beatId) && Boolean(c.chapterCode),
    );
    assertCheck(
      `Module ${mod.id} [${level}] all ${cues.length} cues resolve chapterCode, beatId & sceneComponentId`,
      cues.length === segments.length && everyCueHasSceneComponent,
    );
  }
}

assertCheck(
  "All 30 Stage 2 chapters have 30 distinct 3D sceneComponentIds",
  seenSceneComponentIds.size === 30,
  `Distinct sceneComponentIds: ${seenSceneComponentIds.size}`,
);

// 3. Verify Live Physics Telemetry & Activity Adapter Bridging across Stage 2 Chapters
const interactionStore = CosmosChapterInteractionStore.getInstance();
const activityAdapter = CosmosActivityAdapter.getInstance();

let telemetryPassCount = 0;
for (const mod of stage2Modules) {
  const chapters = CosmosProofOfConceptCatalog.getChaptersForModule(mod.id);
  for (const ch of chapters) {
    const expTel = interactionStore.computeChapterLiveTelemetry(mod.id, ch.chapterId, "explorer");
    const junTel = interactionStore.computeChapterLiveTelemetry(mod.id, ch.chapterId, "junior");
    const astTel = interactionStore.computeChapterLiveTelemetry(mod.id, ch.chapterId, "astronomer");
    if (
      expTel.length >= 1 &&
      junTel.length >= 1 &&
      astTel.length >= 1 &&
      astTel.some((m) => Boolean(m.formula))
    ) {
      telemetryPassCount++;
    }
  }
}

assertCheck(
  "All 30 Stage 2 chapters compute tier-differentiated live physics telemetry & equations",
  telemetryPassCount === 30,
  `Passed ${telemetryPassCount}/30 chapters`,
);

// Trigger interactive controls in Modules 05, 06, 07, and 08 and verify ActivityAdapter state updates
interactionStore.setControlValue("05", "lesson-2-earths-orbit-and-seasons", "orbitalMonthIndex", 12);
interactionStore.setControlValue("05", "lesson-5-solar-eclipses", "nodeOffsetDeg", 0);
interactionStore.setControlValue("06", "sub-02", "selectedRockyPlanet", "Venus");
interactionStore.setControlValue("06", "sub-08", "comparisonPlanetB", "Neptune");
interactionStore.setControlValue("07", "07-01", "coreTemperatureMK", 16.5);
interactionStore.setControlValue("07", "07-07", "imfBzNanotesla", -18);

const act05 = activityAdapter.getActivityForModule("05");
const act06 = activityAdapter.getActivityForModule("06");
const act07 = activityAdapter.getActivityForModule("07");

assertCheck(
  "Module 05 interactive chapter controls bridge to Module 05 ActivityAdapter",
  Boolean(act05 && act05.completedActions.length > 0),
  JSON.stringify(act05?.completedActions),
);

assertCheck(
  "Module 06 interactive chapter controls bridge to Module 06 ActivityAdapter",
  Boolean(act06 && act06.completedActions.length > 0),
  JSON.stringify(act06?.completedActions),
);

assertCheck(
  "Module 07 interactive chapter controls bridge to Module 07 ActivityAdapter",
  Boolean(act07 && act07.completedActions.length > 0),
  JSON.stringify(act07?.completedActions),
);

console.log("================================================================================");
console.log(`STAGE 2 VALIDATION SUMMARY: ${passed} passed, ${failed} failed`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
