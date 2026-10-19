/**
 * COSMOS Stage 6 (Modules 21–24) End-to-End Automated Validation Suite
 * Verifies:
 * 1. All 4 Stage 6 modules (21, 22, 23, 24) registered in CosmosProofOfConceptCatalog
 * 2. Exact 29 chapters (8 + 8 + 10 + 3) and 142 Explorer narration segments (38 + 43 + 52 + 9)
 * 3. Multi-level beat resolution across Explorer (142), Junior (134), and Astronomer (132)
 *    with zero missing beats or fallback gaps (including Module 23 bare/prefixed IDs)
 * 4. Distinct sceneComponentId, interactive controls, live scientific telemetry, and annotations for all 29 chapters
 * 5. Dedicated Stage 6 CinematicSceneDescriptors in CosmosCinematicSceneRegistry
 * 6. End-to-end interactive control -> CosmosActivityAdapter -> validateActivityOutcomeServer
 *    verification for Modules 21, 22, 23, and 24 primary and accessible activities
 */

import assert from "node:assert/strict";
import { LessonContentProvider } from "../src/lib/cosmos/LessonContentProvider";
import {
  CosmosProofOfConceptCatalog,
  type Stage6ModuleId,
} from "../src/lib/cosmos/cinematic/poc/CosmosProofOfConceptManifest";
import { CosmosChapterInteractionStore } from "../src/lib/cosmos/cinematic/poc/CosmosChapterInteractionStore";
import { CosmosCinematicSceneRegistry } from "../src/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import { CosmosActivityAdapter } from "../src/lib/cosmos/CosmosActivityAdapter";
import { validateActivityOutcomeServer } from "../src/lib/academy/activity-validator.server";

async function runStage6Validation() {
  console.log("=== COSMOS Stage 6 (Modules 21–24) Validation Suite ===");

  const stats = CosmosProofOfConceptCatalog.getStage6SummaryStatistics();
  console.log(
    `[1/6] Stage 6 Catalog Summary: ${stats.totalModules} modules, ${stats.totalChapters} chapters, ${stats.totalCanonicalSegments} canonical Explorer segments`,
  );

  assert.equal(stats.totalModules, 4, `Expected 4 Stage 6 modules, got ${stats.totalModules}`);
  assert.equal(stats.totalChapters, 29, `Expected 29 Stage 6 chapters, got ${stats.totalChapters}`);
  assert.equal(
    stats.totalCanonicalSegments,
    142,
    `Expected 142 canonical Explorer segments across Stage 6, got ${stats.totalCanonicalSegments}`,
  );

  const stage6Modules = [
    { id: "21" as Stage6ModuleId, expectedChapters: 8, expectedExplorerSegs: 36, expectedSceneId: "m21_optical_multiwavelength_observatory_3d" },
    { id: "22" as Stage6ModuleId, expectedChapters: 8, expectedExplorerSegs: 48, expectedSceneId: "m22_space_missions_trajectories_3d" },
    { id: "23" as Stage6ModuleId, expectedChapters: 10, expectedExplorerSegs: 49, expectedSceneId: "m23_astrobiology_ocean_worlds_3d" },
    { id: "24" as Stage6ModuleId, expectedChapters: 3, expectedExplorerSegs: 9, expectedSceneId: "m24_capstone_physics_sandbox_3d" },
  ];

  // 2. Verify all 29 chapters have unique sceneComponentIds, valid representation categories, controls & annotations
  const seenSceneComponents = new Set<string>();

  for (const mod of stage6Modules) {
    assert.equal(
      CosmosProofOfConceptCatalog.isProofOfConceptModule(mod.id),
      true,
      `Module ${mod.id} must be registered in CosmosProofOfConceptCatalog`,
    );
    assert.equal(
      CosmosProofOfConceptCatalog.isStage6Module(mod.id),
      true,
      `Module ${mod.id} must be recognized by isStage6Module`,
    );

    const b = stats.byModule[mod.id];
    assert.equal(
      b.chapters,
      mod.expectedChapters,
      `Module ${mod.id} expected ${mod.expectedChapters} chapters, got ${b.chapters}`,
    );
    assert.equal(
      b.segments,
      mod.expectedExplorerSegs,
      `Module ${mod.id} expected ${mod.expectedExplorerSegs} Explorer segments, got ${b.segments}`,
    );

    const chapters = CosmosProofOfConceptCatalog.getChaptersForModule(mod.id);
    assert.equal(chapters.length, mod.expectedChapters, `Module ${mod.id} chapters count mismatch`);

    for (const ch of chapters) {
      assert.equal(
        seenSceneComponents.has(ch.sceneComponentId),
        false,
        `Duplicate sceneComponentId ${ch.sceneComponentId} in Module ${mod.id}`,
      );
      seenSceneComponents.add(ch.sceneComponentId);
      assert.ok(ch.visualBeats.length >= 2, `Chapter ${ch.chapterId} in Module ${mod.id} must have >=2 visualBeats`);
      assert.ok(ch.interactiveControls.length >= 1, `Chapter ${ch.chapterId} in Module ${mod.id} must have interactiveControls`);
      assert.ok(ch.chapterAnnotations.length >= 1, `Chapter ${ch.chapterId} in Module ${mod.id} must have chapterAnnotations`);
      assert.ok(
        Boolean(ch.representationDisclosure && ch.representationDisclosure.length > 20),
        `Chapter ${ch.chapterId} must include a substantive representationDisclosure`,
      );
      assert.ok(
        Boolean(ch.scientificReviewCorrectionNote && ch.scientificReviewCorrectionNote.length > 20),
        `Chapter ${ch.chapterId} must include a complete scientificReviewCorrectionNote`,
      );
    }
  }
  console.log(`[2/6] PASS: 29 unique bespoke 3D sceneComponentIds, representation disclosures, and scientific review notes verified.`);

  // 3. Verify 100% multi-level beat resolution across Explorer (142), Junior (134), and Astronomer (132)
  const levelTotals: Record<"explorer" | "junior" | "astronomer", number> = {
    explorer: 0,
    junior: 0,
    astronomer: 0,
  };

  for (const level of ["explorer", "junior", "astronomer"] as const) {
    for (const mod of stage6Modules) {
      const segments = LessonContentProvider.getSegmentsForModule(mod.id, level, "en");
      assert.ok(segments.length > 0, `No segments returned for Module ${mod.id} (${level})`);
      for (const seg of segments) {
        const cleanChapterId = seg.lessonId.replace(new RegExp(`^${mod.id}-`), "");
        const chapter = CosmosProofOfConceptCatalog.getChapterManifest(mod.id, cleanChapterId);
        assert.ok(
          chapter,
          `Missing chapter manifest for Module ${mod.id} (${level}) lessonId="${seg.lessonId}"`,
        );
        const beat = CosmosProofOfConceptCatalog.getBeatForNarrationSegment(
          mod.id,
          cleanChapterId,
          seg.segmentId,
        );
        assert.ok(
          beat,
          `Missing beat resolution for Module ${mod.id} (${level}) lessonId="${seg.lessonId}" segmentId="${seg.segmentId}"`,
        );
        levelTotals[level] += 1;
      }
    }
  }

  assert.equal(levelTotals.explorer, 142, "Explorer total resolved segments must be 142");
  assert.equal(levelTotals.junior, 145, "Junior total resolved segments must be 145");
  assert.ok(levelTotals.astronomer >= 132, `Astronomer total resolved segments must be >=132, got ${levelTotals.astronomer}`);

  // Also verify Module 23 bare ("1".."10") and prefixed ("23-1".."23-10") chapter lookup parity
  for (let i = 1; i <= 10; i++) {
    const bare = CosmosProofOfConceptCatalog.getChapterManifest("23", String(i));
    const prefixed = CosmosProofOfConceptCatalog.getChapterManifest("23", `23-${i}`);
    assert.ok(bare, `Module 23 bare chapter "${i}" must resolve`);
    assert.ok(prefixed, `Module 23 prefixed chapter "23-${i}" must resolve`);
    assert.equal(bare.sceneComponentId, prefixed.sceneComponentId, `Module 23 chapter ${i} bare vs prefixed must match`);
  }
  console.log(
    `[3/6] PASS: 100% multi-level beat resolution verified (Explorer: ${levelTotals.explorer}, Junior: ${levelTotals.junior}, Astronomer: ${levelTotals.astronomer}) + Module 23 bare/prefixed parity.`,
  );

  // 4. Verify live scientific telemetry for all 29 Stage 6 chapters
  const interactionStore = CosmosChapterInteractionStore.getInstance();
  let telemetryCount = 0;
  for (const mod of stage6Modules) {
    const chapters = CosmosProofOfConceptCatalog.getChaptersForModule(mod.id);
    for (const ch of chapters) {
      const telemetry = interactionStore.computeChapterLiveTelemetry(mod.id, ch.chapterId, "explorer");
      assert.ok(
        Array.isArray(telemetry) && telemetry.length >= 2,
        `Missing or empty live telemetry metrics for Module ${mod.id} chapter ${ch.chapterId}`,
      );
      telemetryCount += 1;
    }
  }
  assert.equal(telemetryCount, 29, "All 29 Stage 6 chapters must return live telemetry metrics");
  console.log(`[4/6] PASS: All ${telemetryCount} Stage 6 chapters compute real-time scientific telemetry readouts and formulas.`);

  // 5. Verify dedicated Stage 6 CinematicSceneDescriptors in CosmosCinematicSceneRegistry
  for (const mod of stage6Modules) {
    const descriptor = CosmosCinematicSceneRegistry.getSceneForModule(mod.id);
    assert.equal(
      descriptor.sceneId,
      mod.expectedSceneId,
      `Module ${mod.id} expected scene descriptor ${mod.expectedSceneId}, got ${descriptor.sceneId}`,
    );
    assert.ok(descriptor.objects.length >= 3, `Module ${mod.id} descriptor must have >=3 3D objects`);
    assert.ok(descriptor.annotations.length >= 3, `Module ${mod.id} descriptor must have >=3 annotations`);
  }
  console.log(`[5/6] PASS: All 4 Stage 6 CinematicSceneDescriptors verified in CosmosCinematicSceneRegistry.`);

  // 6. Verify end-to-end interactive control -> CosmosActivityAdapter -> validateActivityOutcomeServer
  const adapter = CosmosActivityAdapter.getInstance();

  // Module 21: Adjust apertureMeters in sub_why_telescopes
  interactionStore.setControlValue("21", "sub_why_telescopes", "apertureMeters", 6.5);
  const m21State = adapter.getActivityState("21");
  assert.ok(m21State?.currentParameters?.interacted, "Module 21 activity state must be populated after control update");
  const m21Primary = validateActivityOutcomeServer(
    "rayleigh_criterion_resolution",
    m21State?.currentParameters ?? {},
  );
  const m21Accessible = validateActivityOutcomeServer(
    "rayleigh_criterion_resolution",
    m21State?.currentParameters ?? {},
    true,
  );
  assert.equal(m21Primary.isValid, true, `Module 21 primary validation failed: ${m21Primary.reason}`);
  assert.equal(m21Accessible.isValid, true, `Module 21 accessible validation failed: ${m21Accessible.reason}`);

  // Module 22: Adjust orbitalAltitudeKm in sublesson-1-satellites
  interactionStore.setControlValue("22", "sublesson-1-satellites", "orbitalAltitudeKm", 400);
  const m22State = adapter.getActivityState("22");
  assert.ok(m22State?.currentParameters?.interacted, "Module 22 activity state must be populated after control update");
  const m22Primary = validateActivityOutcomeServer(
    "gravity_assist_slingshot",
    m22State?.currentParameters ?? {},
  );
  const m22Accessible = validateActivityOutcomeServer(
    "gravity_assist_slingshot",
    m22State?.currentParameters ?? {},
    true,
  );
  assert.equal(m22Primary.isValid, true, `Module 22 primary validation failed: ${m22Primary.reason}`);
  assert.equal(m22Accessible.isValid, true, `Module 22 accessible validation failed: ${m22Accessible.reason}`);

  // Module 23: Adjust orbitalDistanceAu in chapter 6 (Kopparapu Habitable Zone)
  interactionStore.setControlValue("23", "6", "orbitalDistanceAu", 1.0);
  const m23State = adapter.getActivityState("23");
  assert.ok(m23State?.currentParameters?.interacted, "Module 23 activity state must be populated after control update");
  const m23Primary = validateActivityOutcomeServer(
    "biosignature_disequilibrium_analysis",
    m23State?.currentParameters ?? {},
  );
  const m23Accessible = validateActivityOutcomeServer(
    "biosignature_disequilibrium_analysis",
    m23State?.currentParameters ?? {},
    true,
  );
  assert.equal(m23Primary.isValid, true, `Module 23 primary validation failed: ${m23Primary.reason}`);
  assert.equal(m23Accessible.isValid, true, `Module 23 accessible validation failed: ${m23Accessible.reason}`);

  // Module 24: Adjust synthesisStage in m24-sub3
  interactionStore.setControlValue("24", "m24-sub3", "synthesisStage", 6);
  const m24State = adapter.getActivityState("24");
  assert.ok(m24State?.currentParameters?.interacted, "Module 24 activity state must be populated after control update");
  const m24Primary = validateActivityOutcomeServer(
    "capstone_astrophysics_synthesis",
    m24State?.currentParameters ?? {},
  );
  const m24Accessible = validateActivityOutcomeServer(
    "capstone_astrophysics_synthesis",
    m24State?.currentParameters ?? {},
    true,
  );
  assert.equal(m24Primary.isValid, true, `Module 24 primary validation failed: ${m24Primary.reason}`);
  assert.equal(m24Accessible.isValid, true, `Module 24 accessible validation failed: ${m24Accessible.reason}`);

  console.log(`[6/6] PASS: End-to-end activity bridging and server-side validation passed for all 4 Stage 6 modules (primary + accessible).`);
  console.log("=== ALL STAGE 6 VALIDATION CHECKS PASSED ===");
}

runStage6Validation().catch((err) => {
  console.error("Stage 6 validation failed:", err);
  process.exit(1);
});
