/**
 * COSMOS Reproducible Scientific 3D Asset Processing Pipeline CLI
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Section 33 & Section 34 (Model Preprocessing & Sample Optimization Pipeline)
 *
 * Supports reproducible stages:
 *   npx tsx scripts/assets/cosmos-asset-pipeline-cli.ts [stage]
 * Stages:
 *   - audit-assets
 *   - inspect-gltf
 *   - optimize-model
 *   - compress-textures
 *   - generate-lod
 *   - validate-model
 *   - build-asset-manifest
 *   - benchmark-assets
 */

import {
  COSMOS_VERIFIED_ASSET_MANIFEST,
  CosmosAssetAttribution,
  CosmosAssetLoader,
  CosmosAssetValidation,
  CosmosCinematicAssetManager,
  CosmosTextureVariantManager,
  getComplete172ChapterAssetCoverageMatrix,
} from "../../src/lib/cosmos/cinematic/assets";

const stage = process.argv[2] || "all";

function runPipelineStage(targetStage: string): void {
  const loader = CosmosAssetLoader.getInstance();
  const assetMgr = CosmosCinematicAssetManager.getInstance();
  const texMgr = CosmosTextureVariantManager.getInstance();
  const records = Object.values(COSMOS_VERIFIED_ASSET_MANIFEST);

  if (targetStage === "all" || targetStage === "audit-assets") {
    console.log("=== [STAGE 1: audit-assets] ===");
    const audit = CosmosAssetValidation.runManifestIntegrityAudit();
    console.log(
      `Audited ${audit.totalAssets} verified assets | All Compliant: ${audit.allCompliant} | Duplicates: ${audit.duplicateAssetIds.length} | Color-Space Verified: ${audit.colorSpaceVerified}`,
    );
  }

  if (targetStage === "all" || targetStage === "inspect-gltf" || targetStage === "optimize-model") {
    console.log("\n=== [STAGE 2 & 3: inspect-gltf & optimize-model (Meshopt vs Draco Evaluation)] ===");
    for (const rec of records.filter((r) => r.deliveryStrategy === "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE")) {
      const glb = loader.synthesizeVerifiedGLBContainer(rec);
      const inspection = CosmosAssetValidation.inspectGLBContainer(glb);
      const opt = CosmosAssetValidation.evaluateGeometryOptimizationStrategies(rec.assetId);
      console.log(
        `  • ${rec.assetId}: GLB v${inspection.version} (${inspection.declaredNodeNames.length} nodes) | Uncompressed: ${opt.uncompressedBytes} B -> Meshopt: ${opt.meshoptBytes} B (${opt.meshoptDecodeMs} ms decode) vs Draco: ${opt.dracoBytes} B (${opt.dracoDecodeMs} ms decode) -> Selected: ${opt.recommendedCodec}`,
      );
    }
  }

  if (targetStage === "all" || targetStage === "compress-textures") {
    console.log("\n=== [STAGE 4: compress-textures (Multi-Resolution Albedo/Normal/Roughness Bundles)] ===");
    const gpuSupport = texMgr.detectGPUCompressionSupport(null);
    console.log(`  • GPU Transcode Target: ${gpuSupport.selectedTranscodeTarget}`);
    for (const tier of ["HIGH_CINEMATIC", "BALANCED", "LOW_POWER"] as const) {
      const bundle = texMgr.getOrCreateTextureBundle("earth", tier);
      console.log(
        `  • Earth (${tier}): ${bundle.width}x${bundle.height} px | Normal Map: ${bundle.normalMap ? "LINEAR_RGBA8" : "OMITTED"} | Est. GPU: ${(bundle.estimatedGpuBytes / 1024).toFixed(1)} KB`,
      );
    }
  }

  if (targetStage === "all" || targetStage === "generate-lod" || targetStage === "validate-model") {
    console.log("\n=== [STAGE 5 & 6: generate-lod & validate-model (Interactive Node Survival)] ===");
    for (const rec of records) {
      const instance = loader.loadHierarchicalScientificModel(rec.assetId, "LOD0_HIGH");
      const check = CosmosAssetValidation.validateOptimizedAssetInteractivity(rec, instance);
      const license = CosmosAssetAttribution.verifyAssetLicenseCompliance(rec);
      console.log(
        `  • ${rec.assetId}: ${rec.availableLODLevels.length} LODs | ${check.verifiedNodeIds.length}/${rec.requiredInteractiveNodeIds.length} Interactive Nodes Verified | License Approved: ${license.productionApproved}`,
      );
    }
  }

  if (targetStage === "all" || targetStage === "build-asset-manifest" || targetStage === "benchmark-assets") {
    console.log("\n=== [STAGE 7 & 8: build-asset-manifest & benchmark-assets] ===");
    const coverage = getComplete172ChapterAssetCoverageMatrix();
    const readyCount = coverage.filter((c) => c.coverageStatus === "READY").length;
    assetMgr.preloadModuleAssets("01", "HIGH_CINEMATIC", true);
    const telemetry = assetMgr.getMemoryTelemetry("HIGH_CINEMATIC");
    console.log(
      `  • Chapter Coverage: ${readyCount}/${coverage.length} chapters READY | Active GPU Cache: ${(telemetry.currentEstimatedGpuBytes / (1024 * 1024)).toFixed(2)} MB / ${(telemetry.budgetCapBytes / (1024 * 1024)).toFixed(0)} MB (${(telemetry.budgetUtilizationRatio * 100).toFixed(1)}%)`,
    );
    assetMgr.releaseModuleScope("01");
    assetMgr.clearUnusedCache();
  }
}

runPipelineStage(stage);
