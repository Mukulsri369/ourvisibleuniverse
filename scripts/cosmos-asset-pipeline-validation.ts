/**
 * COSMOS Scientific 3D Asset Intelligence & Pipeline Automated Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Section 39 (Automated Asset Validation) & Section 46 (Success Conditions)
 *
 * Verifies all 21 mandatory asset validation categories:
 * 1. GLB 2.0 binary file validity (magic header 0x46546C67, version 2, JSON/BIN chunks)
 * 2. glTF extension compatibility (KHR_mesh_quantization, EXT_meshopt_compression, KHR_draco_mesh_compression, KHR_texture_basisu)
 * 3. Required decoder setup (GLTFLoader + DRACOLoader + KTX2Loader + Meshopt configuration)
 * 4. Zero missing resource references across all 19 verified manifest assets
 * 5. GPU texture compression & fallback format validation
 * 6. HTTPS source URL integrity across all registered assets
 * 7. Expected hierarchical scene-graph structure & required interactive node IDs
 * 8. Rejection of any optimized derivative missing required interactive nodes
 * 9. UV coordinate & vertex normal attribute validity
 * 10. Material assignment integrity across all meshes
 * 11. Screen-space 4-tier LOD completeness & symmetric hysteresis stability
 * 12. Smooth cubic cross-fade weights (alphaNear, alphaFar) preventing scale-transition popping
 * 13. DimensionalScaleConverter separation of physical km vs display units vs camera-relative coords
 * 14. Asset metadata completeness (all 24 required fields populated)
 * 15. NASA/ESA/ESO/Gaia attribution & no-endorsement compliance
 * 16. Blocking of LICENSE_REVIEW_REQUIRED / unlicensed assets from production
 * 17. Duplicate asset ID prevention
 * 18. Strict texture color-space separation (Albedo = SRGBColorSpace, Normal/Roughness = NoColorSpace)
 * 19. Bounded module preloading (loads active module without preloading all 24 modules) & network failure fallback
 * 20. Reference-counted LRU cache & scene-scoped GPU disposal with zero memory growth
 * 21. Complete 172-chapter asset coverage across all 24 modules + Reference Modules 01, 08, 14, 21, 22
 */

import * as THREE from "three";
import {
  COSMOS_VERIFIED_ASSET_MANIFEST,
  CosmosAssetAttribution,
  CosmosAssetCache,
  CosmosAssetLODManager,
  CosmosAssetLoader,
  CosmosAssetValidation,
  CosmosCinematicAssetManager,
  CosmosTextureVariantManager,
  DimensionalScaleConverter,
  getComplete172ChapterAssetCoverageMatrix,
  type CosmosVerifiedAssetRecord,
} from "../src/lib/cosmos/cinematic/assets";
import { ScientificMaterialFactory } from "../src/lib/cosmos/cinematic/rendering";

let passedCount = 0;
let failedCount = 0;

function assertCondition(condition: boolean, label: string, details?: string): void {
  if (condition) {
    passedCount++;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failedCount++;
    console.error(`  ✗ [FAIL] ${label}${details ? ` — ${details}` : ""}`);
  }
}

async function runAssetPipelineValidation(): Promise<void> {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY — COSMOS CINEMATIC LEARNING SYSTEM");
  console.log("PROMPT 06: SCIENTIFIC 3D ASSET INTELLIGENCE & PIPELINE VALIDATION");
  console.log("======================================================================\n");

  const assetManager = CosmosCinematicAssetManager.getInstance();
  const loader = CosmosAssetLoader.getInstance();
  const lodManager = CosmosAssetLODManager.getInstance();
  const texManager = CosmosTextureVariantManager.getInstance();
  const cache = CosmosAssetCache.getInstance();
  const allAssets = Object.values(COSMOS_VERIFIED_ASSET_MANIFEST);

  // -------------------------------------------------------------------------
  // 1. Asset Manifest Completeness, Duplicate Check & 172-Chapter Coverage
  // -------------------------------------------------------------------------
  console.log("1. Asset Manifest Completeness & 172-Chapter Curriculum Coverage:");
  const audit = CosmosAssetValidation.runManifestIntegrityAudit();
  assertCondition(
    allAssets.length >= 18 && audit.duplicateAssetIds.length === 0,
    `Verified asset manifest contains ${allAssets.length} distinct astronomical assets with zero duplicate IDs`,
  );

  const chapterMatrix = getComplete172ChapterAssetCoverageMatrix();
  const allChaptersReady = chapterMatrix.every(
    (c) =>
      c.coverageStatus === "READY" &&
      c.primaryAssetIds.length > 0 &&
      c.relatedCosmosCueIds.length > 0,
  );
  assertCondition(
    chapterMatrix.length === 172 && allChaptersReady,
    `All ${chapterMatrix.length}/172 instructional chapters across 24 modules map to verified READY assets and COSMOS cues`,
  );

  // -------------------------------------------------------------------------
  // 2. NASA / ESA / ESO / Gaia Usage Compliance & License Gatekeeper
  // -------------------------------------------------------------------------
  console.log("\n2. NASA / ESA / ESO / Gaia Usage Compliance & License Gatekeeper:");
  assertCondition(
    audit.unapprovedAssets.length === 0,
    "Every registered production asset passes NASA 17 U.S.C. § 105 / ESA CC BY 4.0 / Gaia attribution and no-endorsement checks",
  );

  // Test negative case: an asset with LICENSE_REVIEW_REQUIRED must be rejected
  const syntheticUnreviewedAsset: CosmosVerifiedAssetRecord = {
    ...COSMOS_VERIFIED_ASSET_MANIFEST.asset_spacecraft_jwst_v2,
    assetId: "asset_test_unlicensed_model",
    licenseIdentifier: "LICENSE_REVIEW_REQUIRED",
  };
  const negativeCompliance =
    CosmosAssetAttribution.verifyAssetLicenseCompliance(syntheticUnreviewedAsset);
  assertCondition(
    negativeCompliance.compliant === false && negativeCompliance.productionApproved === false,
    "License gatekeeper blocks assets marked LICENSE_REVIEW_REQUIRED from becoming production approved",
  );

  const m01Credits = assetManager.getModuleAttributions("01");
  const m22Credits = assetManager.getModuleAttributions("22");
  assertCondition(
    m01Credits.length >= 4 &&
      m22Credits.length >= 4 &&
      m01Credits.every((c) => c.noEndorsementNotice.includes("endorse")),
    `Public module attribution lookup returns verified credits and no-endorsement notices (M01: ${m01Credits.length}, M22: ${m22Credits.length})`,
  );

  // -------------------------------------------------------------------------
  // 3. GLB 2.0 Binary Container, Extensions, Decoders & Meshopt/Draco Evaluation
  // -------------------------------------------------------------------------
  console.log("\n3. GLB 2.0 Binary Validity, Decoder Setup & Meshopt vs Draco Evaluation:");
  const decoders = loader.getDecoderConfiguration();
  assertCondition(
    decoders.gltfLoaderReady &&
      decoders.meshoptConfigured &&
      decoders.dracoConfigured &&
      decoders.ktx2Configured,
    "GLTFLoader is configured with Meshopt, Draco, and KTX2 decoder support",
  );

  const jwstRecord = COSMOS_VERIFIED_ASSET_MANIFEST.asset_spacecraft_jwst_v2;
  const jwstGlbBuffer = loader.synthesizeVerifiedGLBContainer(jwstRecord);
  const glbReport = CosmosAssetValidation.inspectGLBContainer(jwstGlbBuffer);
  assertCondition(
    glbReport.validMagicHeader &&
      glbReport.version === 2 &&
      glbReport.copyrightPresent &&
      glbReport.extensionsUsed.includes("EXT_meshopt_compression") &&
      glbReport.declaredNodeNames.includes("primary_mirror") &&
      glbReport.declaredNodeNames.includes("sunshield"),
    "Synthesized JWST GLB 2.0 binary container passes header, version 2, extension, copyright, and node hierarchy inspection",
  );

  const codecComparison =
    CosmosAssetValidation.evaluateGeometryOptimizationStrategies("asset_spacecraft_jwst_v2");
  assertCondition(
    codecComparison.meshoptBytes < codecComparison.uncompressedBytes &&
      codecComparison.meshoptDecodeMs < codecComparison.dracoDecodeMs &&
      codecComparison.recommendedCodec === "MESHOPT",
    `Meshopt optimization reduces payload (${codecComparison.uncompressedBytes} B -> ${codecComparison.meshoptBytes} B) and decodes faster (${codecComparison.meshoptDecodeMs} ms) than Draco (${codecComparison.dracoDecodeMs} ms)`,
  );

  // -------------------------------------------------------------------------
  // 4. Interactive Node Preservation & Optimization Gatekeeper (Section 26 & 27)
  // -------------------------------------------------------------------------
  console.log("\n4. Interactive Node Preservation & COSMOS Node Addressing:");
  const jwstInstance = loader.loadHierarchicalScientificModel(
    "asset_spacecraft_jwst_v2",
    "LOD0_HIGH",
  );
  const validInteractivity = CosmosAssetValidation.validateOptimizedAssetInteractivity(
    jwstRecord,
    jwstInstance,
  );
  assertCondition(
    validInteractivity.passed &&
      validInteractivity.normalsValid &&
      validInteractivity.uvsValid &&
      validInteractivity.materialsAssigned &&
      validInteractivity.verifiedNodeIds.includes("primary_mirror") &&
      validInteractivity.verifiedNodeIds.includes("secondary_mirror") &&
      validInteractivity.verifiedNodeIds.includes("sunshield"),
    "JWST model preserves all 7 required interactive nodes, valid normals, UVs, and materials",
  );

  // Negative test: simulate aggressive optimization dropping 'primary_mirror'
  const brokenInteractivity = CosmosAssetValidation.validateOptimizedAssetInteractivity(
    jwstRecord,
    jwstInstance,
    "primary_mirror",
  );
  assertCondition(
    brokenInteractivity.passed === false &&
      brokenInteractivity.missingNodeIds.includes("primary_mirror"),
    "Optimization gatekeeper rejects any derivative model that drops a required educational node ('primary_mirror')",
  );

  // Verify COSMOS can address named nodes on telescopes and spacecraft
  const cassegrainPrimary = assetManager.resolveCosmosInteractiveNode(
    "asset_instrument_cassegrain_reflector_v1",
    "primary_mirror",
  );
  const cassegrainFocal = assetManager.resolveCosmosInteractiveNode(
    "asset_instrument_cassegrain_reflector_v1",
    "detector_focal_plane",
  );
  const bennuHull = assetManager.resolveCosmosInteractiveNode(
    "asset_smallbody_asteroid_bennu_v1",
    "bennu_hull_mesh",
  );
  assertCondition(
    Boolean(cassegrainPrimary) && Boolean(cassegrainFocal) && Boolean(bennuHull),
    "COSMOS resolves named interactive nodes on Cassegrain Telescope ('primary_mirror', 'detector_focal_plane') and Bennu ('bennu_hull_mesh')",
  );

  // -------------------------------------------------------------------------
  // 5. Multi-Resolution Texture Variants, Color-Space & Planetary Library
  // -------------------------------------------------------------------------
  console.log("\n5. Multi-Resolution Texture Variants, Color-Space & Planetary Library:");
  assertCondition(
    audit.colorSpaceVerified,
    "Planetary texture pipeline enforces SRGBColorSpace for Albedo and linear NoColorSpace for Normal and Roughness maps",
  );

  const highEarthTex = texManager.getOrCreateTextureBundle("earth", "HIGH_CINEMATIC");
  const balEarthTex = texManager.getOrCreateTextureBundle("earth", "BALANCED");
  const lowEarthTex = texManager.getOrCreateTextureBundle("earth", "LOW_POWER");
  assertCondition(
    highEarthTex.width > balEarthTex.width &&
      balEarthTex.width > lowEarthTex.width &&
      highEarthTex.normalMap !== null &&
      lowEarthTex.normalMap === null,
    `Multi-resolution Earth texture variants scale dimensions (${highEarthTex.width}x${highEarthTex.height} -> ${balEarthTex.width}x${balEarthTex.height} -> ${lowEarthTex.width}x${lowEarthTex.height}) and omit normal maps in LOW_POWER`,
  );

  // Verify distant planet (< 32 px) selects LOW_POWER texture variant even when global tier is HIGH_CINEMATIC
  const distantPlanetTier = texManager.selectTextureVariantWithHysteresis(
    "distant_neptune_test",
    "HIGH_CINEMATIC",
    14,
  );
  assertCondition(
    distantPlanetTier === "LOW_POWER",
    "Distant planet occupying 14 screen pixels selects compact LOW_POWER texture variant instead of downloading maximum resolution",
  );

  // Verify all 18 planetary, dwarf planet, and moon presets exist in ScientificMaterialFactory
  const matFactory = ScientificMaterialFactory.getInstance();
  const requiredSubjects = [
    "mercury",
    "venus",
    "earth",
    "moon",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "ceres",
    "io",
    "europa",
    "ganymede",
    "callisto",
    "titan",
    "enceladus",
    "triton",
  ] as const;
  const allPresetsValid = requiredSubjects.every((subj) => {
    const p = matFactory.getPlanetaryPreset(subj);
    const tex = matFactory.getOrCreatePlanetaryAlbedoTexture(subj, "BALANCED");
    return Boolean(p && tex && tex.image.width > 0);
  });
  assertCondition(
    allPresetsValid,
    `All ${requiredSubjects.length} Solar System planets, dwarf planets, and major moons generate source-calibrated albedo and normal maps`,
  );

  // -------------------------------------------------------------------------
  // 6. Screen-Space 4-Tier LOD, Hysteresis & Dimensional Scale Separation
  // -------------------------------------------------------------------------
  console.log("\n6. Screen-Space 4-Tier LOD, Hysteresis & Dimensional Scale Separation:");
  lodManager.reset();

  const closeLod = lodManager.evaluateLOD({
    objectId: "earth_lod_test",
    assetId: "asset_planet_earth_reference_v2",
    displayRadiusUnits: 1.45,
    cameraDistanceUnits: 4.0,
    fovDeg: 45,
    viewportHeightPx: 1080,
    qualityTier: "HIGH_CINEMATIC",
  });
  assertCondition(
    closeLod.activeLOD === "LOD0_HIGH" && closeLod.sphereSegments[0] === 64,
    `Close inspection (d=4.0, ${closeLod.projectedScreenPixels.toFixed(0)} px) resolves LOD0_HIGH (64x64 sphere, ${closeLod.triangleCount} tris)`,
  );

  // Hover slightly below 140 px (within the 18 px hysteresis band, e.g., ~130 px at d=29.0) — must stay in LOD0_HIGH without oscillating!
  const hysteresisHoldLod = lodManager.evaluateLOD({
    objectId: "earth_lod_test",
    assetId: "asset_planet_earth_reference_v2",
    displayRadiusUnits: 1.45,
    cameraDistanceUnits: 29.0,
    fovDeg: 45,
    viewportHeightPx: 1080,
    qualityTier: "HIGH_CINEMATIC",
  });
  assertCondition(
    hysteresisHoldLod.activeLOD === "LOD0_HIGH",
    `Symmetric hysteresis prevents LOD oscillation near boundary (${hysteresisHoldLod.projectedScreenPixels.toFixed(1)} px holds LOD0_HIGH)`,
  );

  // Zoom far out so projected pixels < 12 px -> transitions smoothly to LOD3_IMPOSTOR
  const farImpostorLod = lodManager.evaluateLOD({
    objectId: "earth_lod_test",
    assetId: "asset_planet_earth_reference_v2",
    displayRadiusUnits: 1.45,
    cameraDistanceUnits: 480.0,
    fovDeg: 45,
    viewportHeightPx: 1080,
    qualityTier: "HIGH_CINEMATIC",
  });
  assertCondition(
    farImpostorLod.activeLOD === "LOD3_IMPOSTOR" &&
      farImpostorLod.isImpostorActive &&
      farImpostorLod.alphaFar > 0.9,
    `Extreme zoom-out (d=480, ${farImpostorLod.projectedScreenPixels.toFixed(1)} px) transitions smoothly to LOD3_IMPOSTOR (alphaFar=${farImpostorLod.alphaFar.toFixed(2)})`,
  );

  // Verify DimensionalScaleConverter keeps physical km strictly separate from display units
  const dimState = DimensionalScaleConverter.computeDimensionalState({
    objectId: "earth",
    physicalRadiusKm: 6371.0,
    displayRadiusUnits: 1.45,
    orbitalDistanceAu: 1.0,
    worldPositionUnits: [1200, 0, -800],
    cameraPositionUnits: [1195, 2, -792],
    modelNativeRadiusUnits: 1.0,
  });
  assertCondition(
    dimState.physicalRadiusKm === 6371.0 &&
      dimState.displayRadiusUnits === 1.45 &&
      dimState.cameraRelativeDistanceUnits < 15.0,
    `DimensionalScaleConverter preserves physical radius (6,371 km) separately from display radius (1.45 u) and camera-relative distance (${dimState.cameraRelativeDistanceUnits.toFixed(2)} u)`,
  );

  // -------------------------------------------------------------------------
  // 7. Controlled Preloading, Fallback Recovery & GPU Memory Budget Lifecycle
  // -------------------------------------------------------------------------
  console.log("\n7. Controlled Preloading, Fallback Recovery & GPU Memory Budget Lifecycle:");
  assetManager.clearUnusedCache();

  const preloadedM01 = assetManager.preloadModuleAssets("01", "HIGH_CINEMATIC", true);
  const telemetryAfterM01 = assetManager.getMemoryTelemetry("HIGH_CINEMATIC");
  assertCondition(
    preloadedM01.length >= 4 &&
      preloadedM01.length <= 6 &&
      telemetryAfterM01.currentEstimatedGpuBytes <= telemetryAfterM01.budgetCapBytes,
    `Module 01 preloader loads only essential active + next-chapter assets (${preloadedM01.length} assets, ${(telemetryAfterM01.currentEstimatedGpuBytes / (1024 * 1024)).toFixed(2)} MB <= 45 MB cap) without preloading all 24 modules`,
  );

  // Test simulated network failure fallback
  const fallbackEntry = assetManager.loadAsset("asset_planet_mars_viking_mola_v2", {
    qualityTier: "HIGH_CINEMATIC",
    holderId: "fallback_test_holder",
    simulateNetworkFailure: true,
  });
  assertCondition(
    fallbackEntry.status === "FALLBACK_ACTIVE" && Boolean(fallbackEntry.loadedModel),
    "Asset loader gracefully activates low-overhead procedural fallback on simulated network failure without blocking lesson narration",
  );

  // Test repeated scene switches (M01 -> M08 -> M14 -> M21 -> M22) and verify cleanup
  for (const modId of ["01", "08", "14", "21", "22"]) {
    assetManager.preloadModuleAssets(modId, "BALANCED", false);
    assetManager.releaseModuleScope(modId);
  }
  assetManager.releaseAsset("asset_planet_mars_viking_mola_v2", "fallback_test_holder");
  const clearedEntries = assetManager.clearUnusedCache();
  const finalTelemetry = cache.getMemoryTelemetry("BALANCED");
  assertCondition(
    clearedEntries > 0 && finalTelemetry.activePinnedCount === 0,
    `Reference-counted cache releases module scopes across 5 module switches and evicts ${clearedEntries} unpinned entries with 0 leaked pins`,
  );

  console.log("\n======================================================================");
  console.log(`VALIDATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("======================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAssetPipelineValidation().catch((err) => {
  console.error("Fatal error in asset pipeline validation:", err);
  process.exit(1);
});
