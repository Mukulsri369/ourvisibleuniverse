/**
 * COSMOS Scientific 3D Rendering Engine, Shaders, Materials & Performance Validation Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 30, 31, 32, 33, 36, 37
 *
 * Verifies:
 * 1. Reusable Scientific Object Contract & 24-Module Visual Library Map
 * 2. Shader Registry (6 GLSL shaders, uniform caching, deterministic clamping)
 * 3. Physically Grounded Lighting (Planckian blackbody chromaticity, planetary terminator,
 *    lunar phase illumination fraction, umbral/penumbral eclipse cones)
 * 4. HDR Color Management & Tone Mapping (SRGBColorSpace, ACES Filmic / AgX, no double tone-mapping)
 * 5. Planetary Material Library (Earth, airless Moon with zero atmosphere, Mars, Jupiter GRS,
 *    Saturn Cassini-division rings, Uranus, Neptune, Europa)
 * 6. Deterministic Seeded Particle Engine (Spiral, Barred Spiral, Elliptical, Irregular galaxies,
 *    Globular/Open clusters, zero NaN vertices, quality-tier scaling)
 * 7. Relativistic Black Hole (Schwarzschild vs Kerr ISCO, Doppler beaming) & Pulsar Lighthouse
 *    (Rotation Axis vs Magnetic Axis vs Observer Line-of-Sight)
 * 8. Astronomical Scale Handling (Origin rebasing & logarithmic scale transitions)
 * 9. Adaptive Quality Presets (HIGH_CINEMATIC, BALANCED, LOW_POWER fallback)
 * 10. GPU Memory & Resource Management (Reference counting & zero leak after repeated mounts)
 * 11. COSMOS Animation Cue Synchronization, Pause/Seek Determinism & Annotation Filtering
 */

import * as THREE from "three";
import {
  AstronomicalScaleCoordinator,
  CosmosScientificSceneLibrary,
  MODULE_24_VISUAL_LIBRARY_MAP,
  PLANETARY_VISUAL_PRESETS,
  SCIENTIFIC_SHADER_DEFINITIONS,
  ScientificMaterialFactory,
  ScientificParticleManager,
  ScientificRenderingQualityAdapter,
  ScientificResourceManager,
  ScientificShaderRegistry,
  blackbodyTemperatureToColor,
  computeEclipseShadowCones,
  computeLunarPhaseIllumination,
  computePlanetaryTerminator,
  configureScientificColorPipeline,
  validateAndClampShaderParameters,
} from "../src/lib/cosmos/cinematic/rendering";
import {
  computeKerrProgradeIscoRatioToRs,
  evaluatePulsarLighthouseSweep,
  filterAnnotationsForLearningLevel,
} from "../src/components/academy/cinematic/science";
import { CosmosCinematicSceneRegistry } from "../src/lib/cosmos/cinematic/CosmosCinematicSceneRegistry";
import { CosmosAnimationCueRegistry } from "../src/lib/cosmos/cinematic/CosmosAnimationCueRegistry";

let passedCount = 0;
let failedCount = 0;

function assertCondition(condition: boolean, label: string, details?: string): void {
  if (condition) {
    passedCount += 1;
    console.log(`  ✓ [PASS] ${label}`);
  } else {
    failedCount += 1;
    console.error(`  ✗ [FAIL] ${label}${details ? ` — ${details}` : ""}`);
  }
}

async function runScientificRenderingValidation(): Promise<void> {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY — COSMOS CINEMATIC LEARNING SYSTEM");
  console.log("PROMPT 05: SCIENTIFIC 3D RENDERING ENGINE & SHADER VALIDATION SUITE");
  console.log("======================================================================\n");

  // -------------------------------------------------------------------------
  // 1. 24-Module Visual Library & Scientific Object Contract
  // -------------------------------------------------------------------------
  console.log("1. 24-Module Visual Library & Scientific Object Contract:");
  const moduleKeys = Object.keys(MODULE_24_VISUAL_LIBRARY_MAP);
  assertCondition(
    moduleKeys.length === 24,
    "All 24 Academy modules (01–24) are mapped in MODULE_24_VISUAL_LIBRARY_MAP",
    `Found ${moduleKeys.length}`,
  );

  const clamped = validateAndClampShaderParameters({
    narrativeProgress: 2.5,
    stellarTemperatureK: 999999,
    atmosphericOpticalDepth: -3.0,
    highlightStrength: 5.0,
    cutawayRevealAngleRad: 10.0,
  });
  assertCondition(
    clamped.narrativeProgress === 1.0 &&
      clamped.stellarTemperatureK === 50000 &&
      clamped.atmosphericOpticalDepth === 0.0 &&
      clamped.highlightStrength === 1.0 &&
      Math.abs(clamped.cutawayRevealAngleRad - Math.PI) < 1e-6,
    "validateAndClampShaderParameters clamps out-of-range inputs to safe physical bounds",
  );

  // -------------------------------------------------------------------------
  // 2. Shader Registry, Compilation Definitions & Deterministic Uniforms
  // -------------------------------------------------------------------------
  console.log("\n2. Shader Registry & Deterministic Uniform Updates:");
  const shaderReg = ScientificShaderRegistry.getInstance();
  const defs = shaderReg.getAllDefinitions();
  assertCondition(
    defs.length === 6 &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.planetary_terminator_shader) &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.atmospheric_scattering_shader) &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.stellar_photosphere_shader) &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.stellar_interior_cutaway_shader) &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.nebula_volumetric_shader) &&
      Boolean(SCIENTIFIC_SHADER_DEFINITIONS.black_hole_accretion_shader),
    "All 6 core scientific GLSL shader programs are registered with vertex & fragment source",
  );

  const starMat1 = shaderReg.getOrCreateShaderMaterial("stellar_photosphere_shader", "test_sun");
  const starMat2 = shaderReg.getOrCreateShaderMaterial("stellar_photosphere_shader", "test_sun");
  assertCondition(
    starMat1 === starMat2,
    "ShaderRegistry caches ShaderMaterial instances by key without redundant recompilation",
  );

  shaderReg.updateDeterministicUniforms(starMat1, {
    simulationTime: 42.5,
    narrativeProgress: 0.65,
    stellarTemperatureK: 32000,
    highlightStrength: 0.8,
  });
  assertCondition(
    starMat1.uniforms.uSimulationTime.value === 42.5 &&
      starMat1.uniforms.uTemperatureK.value === 32000 &&
      starMat1.uniforms.uHighlightStrength.value === 0.8,
    "updateDeterministicUniforms updates existing uniforms in place for seek/replay determinism",
  );

  // -------------------------------------------------------------------------
  // 3. Physically Grounded Lighting: Blackbody, Terminators, Lunar Phases, Eclipses
  // -------------------------------------------------------------------------
  console.log("\n3. Physically Grounded Lighting & Eclipse/Phase Geometry:");
  const mStar = blackbodyTemperatureToColor(3000);
  const gStar = blackbodyTemperatureToColor(5772);
  const oStar = blackbodyTemperatureToColor(35000);
  assertCondition(
    mStar.spectralClass === "M" && gStar.spectralClass === "G" && oStar.spectralClass === "O",
    "Planckian blackbody model maps 3,000 K -> M, 5,772 K -> G, and 35,000 K -> O spectral classes",
  );
  assertCondition(
    mStar.linearRgb[0] > mStar.linearRgb[2] && oStar.linearRgb[2] > oStar.linearRgb[0],
    "Planckian chromaticity produces red-dominant flux for M-dwarfs and blue-dominant flux for O-stars",
  );

  const dayTerminator = computePlanetaryTerminator([0, 0, 0], [10, 0, 0], [1, 0, 0]);
  const nightTerminator = computePlanetaryTerminator([0, 0, 0], [10, 0, 0], [-1, 0, 0]);
  assertCondition(
    dayTerminator.isDaySide === true &&
      dayTerminator.surfaceIlluminationCosine > 0.99 &&
      nightTerminator.isDaySide === false &&
      nightTerminator.surfaceIlluminationCosine < -0.99,
    "Planetary terminator geometry accurately separates sub-solar day hemisphere from dark night hemisphere",
  );

  // Lunar phases: Sun at (+150, 0, 0), Earth at (0, 0, 0)
  const newMoonPhase = computeLunarPhaseIllumination([150, 0, 0], [4, 0, 0], [0, 0, 0]);
  const fullMoonPhase = computeLunarPhaseIllumination([150, 0, 0], [-4, 0, 0], [0, 0, 0]);
  const quarterMoonPhase = computeLunarPhaseIllumination([150, 0, 0], [0, 0, 4], [0, 0, 0]);
  assertCondition(
    newMoonPhase.phaseName === "New Moon" &&
      newMoonPhase.illuminatedFraction < 0.02 &&
      fullMoonPhase.phaseName === "Full Moon" &&
      fullMoonPhase.illuminatedFraction > 0.98 &&
      Math.abs(quarterMoonPhase.illuminatedFraction - 0.5) < 0.05,
    "Lunar phase illumination fraction f = (1 + cos(alpha))/2 matches Sun-Moon-Earth geometry",
  );

  const totalEclipse = computeEclipseShadowCones({
    sunRadiusKm: 695700,
    occulterRadiusKm: 1737.4,
    sunToOcculterDistanceKm: 149200000,
    occulterToTargetDistanceKm: 363300, // Perigee lunar distance -> total solar eclipse
    lateralOffsetKm: 0,
  });
  const annularEclipse = computeEclipseShadowCones({
    sunRadiusKm: 695700,
    occulterRadiusKm: 1737.4,
    sunToOcculterDistanceKm: 149600000,
    occulterToTargetDistanceKm: 405500, // Apogee lunar distance -> antumbra / annular eclipse
    lateralOffsetKm: 0,
  });
  assertCondition(
    totalEclipse.eclipseType === "total" && annularEclipse.eclipseType === "annular",
    "Eclipse shadow cone solver distinguishes perigee Total Solar Eclipse from apogee Annular Eclipse",
  );

  // -------------------------------------------------------------------------
  // 4. HDR Color Management & Planetary Material Presets
  // -------------------------------------------------------------------------
  console.log("\n4. HDR Color Management & Planetary Material Library:");
  const mockRenderer = {
    outputColorSpace: THREE.NoColorSpace,
    toneMapping: THREE.NoToneMapping,
    toneMappingExposure: 1.0,
    shadowMap: { enabled: false, type: THREE.BasicShadowMap },
  } as unknown as THREE.WebGLRenderer;

  const colorCfg = configureScientificColorPipeline(mockRenderer, {
    qualityTier: "HIGH_CINEMATIC",
    toneMapping: "aces",
    exposure: 1.08,
  });
  assertCondition(
    colorCfg.outputColorSpace === THREE.SRGBColorSpace &&
      colorCfg.toneMapping === THREE.ACESFilmicToneMapping &&
      colorCfg.shadowsEnabled === true,
    "configureScientificColorPipeline sets SRGBColorSpace and ACESFilmicToneMapping without double gamma",
  );

  const matFactory = ScientificMaterialFactory.getInstance();
  assertCondition(
    PLANETARY_VISUAL_PRESETS.earth.hasAtmosphere === true &&
      PLANETARY_VISUAL_PRESETS.earth.hasCloudLayer === true &&
      PLANETARY_VISUAL_PRESETS.moon.hasAtmosphere === false &&
      PLANETARY_VISUAL_PRESETS.moon.atmosphereOpticalDepth === 0 &&
      PLANETARY_VISUAL_PRESETS.saturn.hasRingSystem === true,
    "Planetary presets enforce Earth atmosphere/clouds, airless Moon (zero atmospheric glow), and Saturn rings",
  );

  const earthTex = matFactory.getOrCreatePlanetaryAlbedoTexture("earth", "BALANCED");
  const saturnRingTex = matFactory.getOrCreatePlanetaryRingTexture();
  assertCondition(
    earthTex.image.width === 256 &&
      earthTex.colorSpace === THREE.SRGBColorSpace &&
      saturnRingTex.image.width === 256,
    "Procedural planetary albedo and Saturn Cassini-division ring DataTextures generate with zero 404s",
  );

  // -------------------------------------------------------------------------
  // 5. Deterministic Seeded Particle Engine & Quality Scaling
  // -------------------------------------------------------------------------
  console.log("\n5. Deterministic GPU Particle Engine & Quality Scaling:");
  const particleMgr = ScientificParticleManager.getInstance();
  const galHigh1 = particleMgr.getOrCreateGalaxyBuffers({
    morphology: "barred_spiral",
    seed: 99,
    tier: "HIGH_CINEMATIC",
  });
  const galHigh2 = particleMgr.getOrCreateGalaxyBuffers({
    morphology: "barred_spiral",
    seed: 99,
    tier: "HIGH_CINEMATIC",
  });
  const galBalanced = particleMgr.getOrCreateGalaxyBuffers({
    morphology: "barred_spiral",
    seed: 99,
    tier: "BALANCED",
  });
  const galLow = particleMgr.getOrCreateGalaxyBuffers({
    morphology: "barred_spiral",
    seed: 99,
    tier: "LOW_POWER",
  });

  assertCondition(
    galHigh1.positions[0] === galHigh2.positions[0] &&
      galHigh1.positions[150] === galHigh2.positions[150],
    "Seeded galaxy particle generator is 100% deterministic across repeated calls",
  );
  assertCondition(
    galHigh1.count > galBalanced.count && galBalanced.count > galLow.count,
    `Galaxy particle budget scales with quality tier (High: ${galHigh1.count}, Balanced: ${galBalanced.count}, Low: ${galLow.count})`,
  );

  const hasNaN = Array.from(galHigh1.positions).some((v) => !Number.isFinite(v));
  assertCondition(!hasNaN, "Galaxy particle position buffer contains zero NaN or Infinite values");

  // -------------------------------------------------------------------------
  // 6. Black Hole Relativistic ISCO & Pulsar Lighthouse Geometry
  // -------------------------------------------------------------------------
  console.log("\n6. Black Hole Relativistic ISCO & Pulsar Lighthouse Geometry:");
  const iscoSchwarzschild = computeKerrProgradeIscoRatioToRs(0.0);
  const iscoKerr = computeKerrProgradeIscoRatioToRs(0.9);
  assertCondition(
    Math.abs(iscoSchwarzschild - 3.0) < 1e-4 && iscoKerr < iscoSchwarzschild,
    `Schwarzschild ISCO is 3.0 r_s (${iscoSchwarzschild.toFixed(2)} r_s) while prograde Kerr (a*=0.9) contracts to ${iscoKerr.toFixed(2)} r_s`,
  );

  // Pulsar with 40-deg magnetic tilt, observer along direction of tilted pole at phase 0
  const obsAtPole: [number, number, number] = [
    Math.sin((40 * Math.PI) / 180),
    Math.cos((40 * Math.PI) / 180),
    0,
  ];
  const pulseAligned = evaluatePulsarLighthouseSweep({
    rotationPhaseRad: 0,
    magneticTiltDeg: 40,
    observerDirection: obsAtPole,
    beamHalfConeDeg: 15,
  });
  const pulseAway = evaluatePulsarLighthouseSweep({
    rotationPhaseRad: Math.PI,
    magneticTiltDeg: 40,
    observerDirection: obsAtPole,
    beamHalfConeDeg: 15,
  });
  assertCondition(
    pulseAligned.isPulseVisibleToObserver === true && pulseAway.isPulseVisibleToObserver === false,
    "Pulsar lighthouse pulse triggers only when the tilted magnetic beam crosses the observer's line of sight",
  );

  // -------------------------------------------------------------------------
  // 7. Astronomical Scale Handling & Origin Rebasing
  // -------------------------------------------------------------------------
  console.log("\n7. Astronomical Scale Coordinator & Origin Rebasing:");
  const rebased = AstronomicalScaleCoordinator.rebasePositionToCameraOrigin(
    [1e8 + 12.5, -4.0, 1e8 - 3.0],
    [1e8, 0, 1e8],
  );
  assertCondition(
    Math.abs(rebased[0] - 12.5) < 1e-5 && Math.abs(rebased[2] - -3.0) < 1e-5,
    "Camera-relative origin rebasing eliminates large floating-point coordinate offsets",
  );

  const planetaryScale = AstronomicalScaleCoordinator.evaluateScaleTransition(7.5);
  const galacticScale = AstronomicalScaleCoordinator.evaluateScaleTransition(21.0);
  assertCondition(
    planetaryScale.regime === "planetary_scale" &&
      planetaryScale.solarSystemLayerOpacity === 1.0 &&
      galacticScale.regime === "galactic_scale" &&
      galacticScale.galacticLayerOpacity > 0.8,
    "Logarithmic scale transition smoothly shifts layer opacities from planetary to galactic regimes",
  );

  // -------------------------------------------------------------------------
  // 8. Reference Scenes (Modules 01, 08, 14), Cue Sync & GPU Memory Lifecycle
  // -------------------------------------------------------------------------
  console.log("\n8. Reference Scenes (01, 08, 14), Cue Synchronization & GPU Memory Cleanup:");
  const sceneLib = CosmosScientificSceneLibrary.getInstance();
  const resMgr = ScientificResourceManager.getInstance();

  const m01Scene = CosmosCinematicSceneRegistry.getSceneForModule("01");
  const m08Scene = CosmosCinematicSceneRegistry.getSceneForModule("08");
  const m14Scene = CosmosCinematicSceneRegistry.getSceneForModule("14");
  assertCondition(
    m01Scene.sceneArchetype === "cosmic_zoom" &&
      m08Scene.sceneArchetype === "orbital_mechanics" &&
      m14Scene.sceneArchetype === "black_hole_relativity",
    "Reference Modules 01, 08, and 14 resolve their dedicated upgraded 3D scene archetypes",
  );

  // Simulate repeated scene mounting and cue evaluation to verify zero memory leak
  const baselineSnap = resMgr.getMemorySnapshot();
  for (let cycle = 0; cycle < 5; cycle++) {
    const tempGeom = new THREE.SphereGeometry(1, 16, 16);
    resMgr.trackThreeObject(`scene:m01:temp_geom_${cycle}`, tempGeom, false, 4096);
    resMgr.releaseSceneScope("scene:m01");
  }
  const afterCyclesSnap = resMgr.getMemorySnapshot();
  assertCondition(
    afterCyclesSnap.activeResourceCount === baselineSnap.activeResourceCount &&
      afterCyclesSnap.totalDisposedCount >= baselineSnap.totalDisposedCount + 5,
    "ScientificResourceManager disposes temporary scene geometries across 5 mount/unmount cycles with zero memory growth",
  );

  // Verify annotation filtering by learning level
  const jrAnns = filterAnnotationsForLearningLevel(m14Scene.annotations, "junior");
  const astAnns = filterAnnotationsForLearningLevel(m14Scene.annotations, "astronomer");
  assertCondition(
    jrAnns.length <= 3 && astAnns.length >= jrAnns.length,
    `ScientificAnnotation filters label density by learning level (Junior: ${jrAnns.length}, Astronomer: ${astAnns.length})`,
  );

  // Verify cue evaluation updates object shader state deterministically
  const m01Cue = CosmosAnimationCueRegistry.getCuesForModule("01", "explorer", "en")[0] || null;
  const targetObjectId = m01Cue?.highlightedObjects[0] || "earth";
  const ctrl = sceneLib.registerObject({
    objectId: targetObjectId,
    sceneId: m01Scene.sceneId,
    name: "Earth",
    scientificObjectType: "planet_terrestrial",
    scaleRegime: "planetary_scale",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    epistemicDisclosure: "Scale-adjusted radius",
    physicalParameters: { radiusKm: 6371 },
    displayScale: 1.45,
    renderingQuality: "HIGH_CINEMATIC",
    supportedAnimations: ["axial_rotation"],
    supportedHighlights: ["fresnel_rim"],
    supportedCameraTargets: [targetObjectId],
    scientificSources: ["IAU"],
    shaderState: validateAndClampShaderParameters({}),
    resourceLifecycle: {
      createdAt: Date.now(),
      lastUpdatedAt: Date.now(),
      disposed: false,
      geometryCount: 1,
      materialCount: 1,
      textureCount: 1,
    },
  });

  sceneLib.evaluateCueAcrossScene(m01Scene.sceneId, m01Cue, 0.72);
  assertCondition(
    Math.abs(ctrl.contract.shaderState.narrativeProgress - 0.72) < 1e-6 &&
      ctrl.contract.shaderState.highlightStrength > 0.5,
    "evaluateCueAcrossScene synchronizes normalized narration progress (0.72) and object highlight state",
  );

  // Reject un-allowlisted parameter mutation attempts
  const rejectedMutation = ctrl.setVisualParameter("arbitraryIllegalProperty" as any, 999);
  assertCondition(
    rejectedMutation === false,
    "ScientificObjectInstanceController blocks un-allowlisted property mutations",
  );
  ctrl.disposeResources();

  console.log("\n======================================================================");
  console.log(`VALIDATION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("======================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runScientificRenderingValidation().catch((err) => {
  console.error("Fatal error in scientific rendering validation:", err);
  process.exit(1);
});
