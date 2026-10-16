/**
 * Astronomical Data Ingestion, Validation & Storage Integration Test Suite
 *
 * Verifies IVOA TAP query execution, schema validation, astrometric cross-matching,
 * GPU binary tile serialization, API search indexing, and provenance tracking.
 *
 * Usage:
 *   npx tsx scripts/catalog-integration-test.ts
 */

import { AstronomicalDataPipeline } from "../src/lib/astronomy/ingestion/pipeline";
import { AstronomicalNormalizer } from "../src/lib/astronomy/ingestion/normalizer";
import { AstronomicalCrossMatcher } from "../src/lib/astronomy/ingestion/cross-match";
import { SpatialIndexer } from "../src/lib/astronomy/ingestion/spatial-indexer";
import {
  BinaryTileGenerator,
  BINARY_TILE_MAGIC,
} from "../src/lib/astronomy/ingestion/tile-generator";
import { GaiaAdapter } from "../src/lib/astronomy/ingestion/adapters/gaia-adapter";
import { NasaExoplanetAdapter } from "../src/lib/astronomy/ingestion/adapters/nasa-exoplanet-adapter";
import { SimbadAdapter } from "../src/lib/astronomy/ingestion/adapters/simbad-adapter";
import { NedAdapter } from "../src/lib/astronomy/ingestion/adapters/ned-adapter";
import { JplHorizonsAdapter } from "../src/lib/astronomy/ingestion/adapters/jpl-horizons-adapter";
import { AtnfPulsarAdapter } from "../src/lib/astronomy/ingestion/adapters/atnf-pulsar-adapter";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${testName}${details ? ` -> ${details}` : ""}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("🔭 ASTRONOMICAL DATA INGESTION & PIPELINE TEST SUITE");
  console.log("==================================================================\n");

  // 1. Schema Validation & Rejection of Corrupt Records
  console.log("1. Canonical Schema & Invariant Validation:");
  const validReport = AstronomicalNormalizer.validate({
    canonicalId: "URN:ASTRO:STAR:TEST-001",
    name: "Test Star",
    alternateNames: ["HD 12345"],
    objectType: "star",
    status: "observational",
    classificationConfidence: 1.0,
    dataQualityFlags: ["TEST_FLAG"],
    raDeg: 120.5,
    decDeg: -35.2,
    coordinateFrame: "ICRS",
    referenceEpoch: "J2000.0",
    galacticCartesianLy: { x: 10, y: 20, z: 5 },
    distanceLy: 22.9,
    distanceMethod: "trigonometric_parallax",
    physicalProperties: { effectiveTemperatureK: 5500 },
    spatialTileId: "tile_l1_4_1",
    provenance: {
      sourceCatalog: "gaia_dr3",
      sourceId: "12345",
      catalogVersion: "Gaia DR3",
      retrievalTimestamp: new Date().toISOString(),
      license: "CC BY-SA 3.0",
      attribution: "ESA Gaia",
    },
  });
  assert(validReport.valid, "Valid canonical star record passes Zod validation");

  const invalidRaReport = AstronomicalNormalizer.validate({
    canonicalId: "URN:ASTRO:STAR:INVALID",
    name: "Invalid Star",
    objectType: "star",
    raDeg: 450.0, // Invalid RA > 360
    decDeg: 0,
    galacticCartesianLy: { x: 0, y: 0, z: 0 },
    distanceLy: 10,
    spatialTileId: "tile_0",
    provenance: {
      sourceCatalog: "gaia_dr3",
      sourceId: "0",
      catalogVersion: "DR3",
      retrievalTimestamp: new Date().toISOString(),
      license: "Open",
      attribution: "Attribution",
    },
  });
  assert(!invalidRaReport.valid, "Rejects record with out-of-bounds RA (> 360°)");

  const invalidDistanceReport = AstronomicalNormalizer.validate({
    canonicalId: "URN:ASTRO:STAR:NEGATIVE-DIST",
    name: "Negative Distance Star",
    objectType: "star",
    raDeg: 100,
    decDeg: 0,
    galacticCartesianLy: { x: 0, y: 0, z: 0 },
    distanceLy: -5.0, // Negative distance impossible
    spatialTileId: "tile_0",
    provenance: {
      sourceCatalog: "gaia_dr3",
      sourceId: "0",
      catalogVersion: "DR3",
      retrievalTimestamp: new Date().toISOString(),
      license: "Open",
      attribution: "Attribution",
    },
  });
  assert(!invalidDistanceReport.valid, "Rejects record with physically negative distance");

  // 2. Gaia DR3 Adapter Tests
  console.log("\n2. ESA Gaia DR3 Adapter & Astrometric Kinematics:");
  const gaiaAdapter = new GaiaAdapter();
  const benchmarkStars = gaiaAdapter.getBenchmarkStars();
  assert(benchmarkStars.length >= 4, "Gaia adapter provides verified benchmark stellar records");

  const siriusA = benchmarkStars.find((s) => s.name === "Sirius A");
  assert(siriusA != null, "Sirius A present in benchmark records");
  if (siriusA) {
    assert(
      Math.abs(siriusA.distanceLy - 8.6) < 0.1,
      `Sirius A distance is ~8.6 ly (actual: ${siriusA.distanceLy.toFixed(2)})`,
    );
    assert(
      siriusA.parallaxMas === 379.21,
      "Sirius A parallax matches Gaia DR3 benchmark (379.21 mas)",
    );
    assert(siriusA.dataQualityFlags.includes("GAIA_RUWE_GOOD"), "Sirius A has RUWE quality flag");
  }

  const proxima = benchmarkStars.find((s) => s.name === "Proxima Centauri");
  assert(proxima != null, "Proxima Centauri present in benchmark records");
  if (proxima) {
    assert(
      Math.abs(proxima.distanceLy - 4.2465) < 0.05,
      `Proxima Centauri distance is ~4.246 ly (actual: ${proxima.distanceLy.toFixed(3)})`,
    );
    assert(proxima.parallaxMas === 768.0665, "Proxima parallax is 768.0665 mas");
  }

  // 3. NASA Exoplanet Archive Adapter Tests
  console.log("\n3. NASA Exoplanet Archive Adapter & Planetary Systems:");
  const exoAdapter = new NasaExoplanetAdapter();
  const exoplanets = exoAdapter.getBenchmarkExoplanets();
  assert(exoplanets.length >= 3, "NASA Exoplanet adapter provides verified benchmark planets");

  const kepler452b = exoplanets.find((p) => p.name === "Kepler-452 b");
  assert(kepler452b != null, "Kepler-452 b present in benchmark exoplanets");
  if (kepler452b) {
    assert(
      kepler452b.subtype === "super_earth",
      `Kepler-452 b classified as super_earth (actual: ${kepler452b.subtype})`,
    );
    assert(
      kepler452b.orbitalElements?.semiMajorAxisAu === 1.046,
      "Kepler-452 b semi-major axis is 1.046 AU",
    );
    assert(
      kepler452b.parentHostId === "URN:ASTRO:STAR:KEPLER-452",
      "Kepler-452 b correctly linked to host star parent ID",
    );
    assert(
      kepler452b.dataQualityFlags.includes("POTENTIALLY_HABITABLE_ZONE"),
      "Kepler-452 b identified in Habitable Zone",
    );
  }

  const proximaB = exoplanets.find((p) => p.name === "Proxima Centauri b");
  assert(proximaB != null, "Proxima Centauri b present in benchmark exoplanets");
  if (proximaB) {
    assert(
      proximaB.subtype === "terrestrial_rocky",
      "Proxima Centauri b classified as terrestrial rocky",
    );
    assert(
      Math.abs((proximaB.orbitalElements?.orbitalPeriodDays ?? 0) - 11.1868) < 0.001,
      "Proxima b period is 11.1868 days",
    );
  }

  // 4. CDS SIMBAD Adapter & Relativistic Black Holes
  console.log("\n4. CDS SIMBAD Adapter & Relativistic Compact Objects:");
  const simbadAdapter = new SimbadAdapter();
  const simbadObjects = simbadAdapter.getBenchmarkObjects();
  assert(simbadObjects.length >= 4, "SIMBAD adapter provides verified exotic objects");

  const sgrA = simbadObjects.find((o) => o.name === "Sagittarius A*");
  assert(sgrA != null, "Sagittarius A* present in SIMBAD records");
  if (sgrA) {
    assert(sgrA.objectType === "black_hole", "Sgr A* object type is black_hole");
    assert(
      sgrA.physicalProperties.massSolar === 4.154e6,
      "Sgr A* mass is 4.154 million solar masses",
    );
    assert(sgrA.distanceLy === 26000.0, "Sgr A* distance is 26,000 ly");
  }

  const ton618 = simbadObjects.find((o) => o.name === "TON 618");
  assert(ton618 != null, "TON 618 hyperluminous quasar present");
  if (ton618) {
    assert(ton618.objectType === "quasar", "TON 618 classified as quasar");
    assert(ton618.physicalProperties.massSolar === 6.6e10, "TON 618 mass is 66 billion M_sun");
    assert(ton618.redshift === 2.219, "TON 618 redshift is 2.219");
  }

  // 5. NASA/IPAC NED Extragalactic Database Tests
  console.log("\n5. NASA/IPAC NED Adapter & Extragalactic Distances:");
  const nedAdapter = new NedAdapter();
  const galaxies = nedAdapter.getBenchmarkGalaxies();
  assert(galaxies.length >= 4, "NED adapter provides verified benchmark galaxies");

  const m31 = galaxies.find((g) => g.name === "Andromeda Galaxy");
  assert(m31 != null, "Andromeda Galaxy (M31) present in NED records");
  if (m31) {
    assert(m31.distanceLy === 2537000.0, "M31 distance is 2.537 Mly (Freedman Cepheid benchmark)");
    assert(
      m31.redshift === -0.001001,
      "M31 has negative redshift (blueshifted approaching Milky Way)",
    );
    assert((m31.radialVelocityKmS ?? 0) < 0, "M31 radial velocity is negative (-300 km/s)");
  }

  // 6. NASA JPL Horizons Adapter Tests
  console.log("\n6. NASA JPL Horizons Adapter & Solar System DE440:");
  const jplAdapter = new JplHorizonsAdapter();
  const solarBodies = jplAdapter.getBenchmarkSolarSystem();
  assert(solarBodies.length >= 4, "JPL adapter provides verified Solar System bodies");

  const earth = solarBodies.find((b) => b.name === "Earth");
  assert(earth != null, "Earth present in JPL records");
  if (earth) {
    assert(
      earth.orbitalElements?.semiMajorAxisAu === 1.00000261,
      "Earth semi-major axis is exactly 1.00000261 AU",
    );
    assert(earth.physicalProperties.radiusKm === 6371.0, "Earth physical radius is 6,371.0 km");
  }

  const neptune = solarBodies.find((b) => b.name === "Neptune");
  assert(neptune != null, "Neptune present in JPL records");
  if (neptune) {
    assert(
      neptune.orbitalElements?.semiMajorAxisAu === 30.0699,
      "Neptune semi-major axis is 30.0699 AU",
    );
  }

  // 7. ATNF Pulsar Adapter Tests
  console.log("\n7. ATNF Pulsar Catalogue Adapter & Spin Dynamics:");
  const atnfAdapter = new AtnfPulsarAdapter();
  const pulsars = atnfAdapter.getBenchmarkPulsars();
  assert(pulsars.length >= 2, "ATNF adapter provides verified pulsars");

  const crabPulsar = pulsars.find((p) => p.name === "Crab Pulsar");
  assert(crabPulsar != null, "Crab Pulsar present in ATNF records");
  if (crabPulsar) {
    assert(
      Math.abs((crabPulsar.physicalProperties.spinPeriodSeconds ?? 0) - 0.03339) < 0.001,
      "Crab Pulsar spin period is ~33.4 ms",
    );
    assert(
      (crabPulsar.physicalProperties.magneticFieldGauss ?? 0) > 1e12,
      "Crab Pulsar magnetic field > 10^12 Gauss",
    );
  }

  // 8. Cross-Matching & Provenance Conflict Tracking
  console.log("\n8. Astrometric Cross-Matching & Conflict Provenance Ledger:");
  const sepSame = AstronomicalCrossMatcher.angularSeparationArcsec(10, 20, 10, 20);
  assert(sepSame === 0, "Identical coordinates have 0 arcseconds separation");

  const sepOneDeg = AstronomicalCrossMatcher.angularSeparationArcsec(0, 0, 1, 0);
  assert(Math.abs(sepOneDeg - 3600.0) < 0.1, "1 degree separation equals 3600 arcseconds");

  // Simulate cross-matching with conflicting distance measurement
  const primaryStar = siriusA!;
  const alternateSirius = {
    ...siriusA!,
    canonicalId: "URN:ASTRO:STAR:HIPPARCOS-32349",
    name: "Sirius",
    alternateNames: ["HIP 32349"],
    distanceLy: 8.66, // Hipparcos legacy distance (slightly differs from Gaia DR3 8.60)
    parallaxMas: 376.5,
    provenance: {
      sourceCatalog: "simbad" as const,
      sourceId: "HIP 32349",
      catalogVersion: "Hipparcos (1997)",
      retrievalTimestamp: new Date().toISOString(),
      license: "ESA",
      attribution: "ESA Hipparcos Space Astrometry Mission",
      bibcode: "1997A&A...323L..49P",
    },
  };

  const matchFound = AstronomicalCrossMatcher.findMatch(alternateSirius, [primaryStar], 10.0);
  assert(matchFound != null, "Cross-matcher identified alternate Sirius designation");

  const mergeResult = AstronomicalCrossMatcher.mergeCatalogs([primaryStar], [alternateSirius]);
  assert(mergeResult.crossMatchedCount === 1, "Cross-matching detected and merged duplicate star");
  assert(
    mergeResult.provenanceMeasurements.length >= 2,
    "Conflicting distance and parallax preserved in provenance ledger",
  );
  assert(
    mergeResult.mergedObjects[0].alternateNames.includes("HIP 32349"),
    "Merged object contains accumulated alias list",
  );

  // 9. Spatial Sky Partitioning
  console.log("\n9. Spatial Sky Partitioning & Hierarchical Bins:");
  const solarTile = SpatialIndexer.computeTileId({ raDeg: 0, decDeg: 0, distanceLy: 0.0005 });
  assert(solarTile === "tile_l0_solar_system", "Solar System bodies map to Level 0 tile");

  const nearbyTile = SpatialIndexer.computeTileId({ raDeg: 45, decDeg: 15, distanceLy: 25.0 });
  assert(nearbyTile.startsWith("tile_l1_"), "Nearby stars map to Level 1 spatial tile");

  const galaxyTile = SpatialIndexer.computeTileId({ raDeg: 10, decDeg: 41, distanceLy: 2.5e6 });
  assert(galaxyTile.startsWith("tile_l2_"), "Local group galaxies map to Level 2 spatial tile");

  const quasarTile = SpatialIndexer.computeTileId({ raDeg: 187, decDeg: 31, distanceLy: 1.08e10 });
  assert(quasarTile.startsWith("tile_l3_"), "Cosmological quasars map to Level 3 spatial tile");

  // 10. GPU Compact Binary Tile Serialization & Deserialization
  console.log("\n10. GPU Compact Binary Tile (.astrobinary) Serialization:");
  const testObjects = [siriusA!, proxima!];
  const binaryBuffer = BinaryTileGenerator.serializeTile("test_tile_01", testObjects, 1);
  assert(
    binaryBuffer.byteLength > 64,
    `Binary tile buffer generated (${binaryBuffer.byteLength} bytes)`,
  );

  const parsedTile = BinaryTileGenerator.deserializeTile(binaryBuffer);
  assert(parsedTile.magic === BINARY_TILE_MAGIC, `Magic header matches '${BINARY_TILE_MAGIC}'`);
  assert(parsedTile.version === 1, "Binary tile version is 1");
  assert(
    parsedTile.recordCount === 2,
    "Deserialized record count matches original object count (2)",
  );
  assert(
    Math.abs(parsedTile.records[0].x - testObjects[0].galacticCartesianLy.x) < 1e-4,
    "Lossless floating-point reconstruction of X coordinate",
  );
  assert(
    Math.abs(parsedTile.records[0].distanceLy - testObjects[0].distanceLy) < 1e-4,
    "Lossless reconstruction of distance in light-years",
  );
  assert(
    parsedTile.records[0].color.length === 3,
    "Parsed record carries computed RGB blackbody color",
  );

  // 11. Pipeline Execution & Search Index Tests
  console.log("\n11. Pipeline Execution & Materialized Search Index:");
  const pipelineResult = await AstronomicalDataPipeline.execute({
    includeBenchmarks: true,
    enableBinaryTiles: true,
  });
  assert(
    pipelineResult.totalObjects >= 15,
    `Pipeline published full multi-catalog dataset (${pipelineResult.totalObjects} objects)`,
  );
  assert(
    pipelineResult.tileCount >= 5,
    `Pipeline generated ${pipelineResult.tileCount} spatial GPU tiles`,
  );

  // Search by name
  const searchName = AstronomicalDataPipeline.search({ query: "sirius" });
  assert(searchName.total >= 1, "Search by primary name 'sirius' found target");

  // Search by alias
  const searchAlias = AstronomicalDataPipeline.search({ query: "Alpha Canis Majoris" });
  assert(searchAlias.total >= 1, "Search by alias 'Alpha Canis Majoris' found target");

  // Search by object type
  const searchExo = AstronomicalDataPipeline.search({ objectType: "exoplanet" });
  assert(
    searchExo.total >= 3,
    `Filter by objectType='exoplanet' found ${searchExo.total} exoplanets`,
  );

  // Search by celestial cone
  const searchCone = AstronomicalDataPipeline.search({
    cone: { raDeg: 101.28, decDeg: -16.71, radiusDeg: 2.0 },
  });
  assert(searchCone.total >= 1, "Cone search centered at Sirius found star within 2 degrees");

  // 12. Strict Missing Data Preservation (Zero Hallucination)
  console.log("\n12. Strict Scientific Integrity & Missing Value Policy:");
  const published = AstronomicalDataPipeline.getPublishedCatalog();
  const starWithoutRedshift = published.find((o) => o.objectType === "star");
  assert(
    starWithoutRedshift?.redshift === null,
    "Stars without cosmological redshift have strictly null redshift",
  );

  const unmeasuredRadialVel = published.find((o) => o.canonicalId === "URN:ASTRO:QUASAR:TON-618");
  assert(
    unmeasuredRadialVel != null && unmeasuredRadialVel.radialVelocityKmS === null,
    "Quasars without direct radial velocity have strictly null radialVelocityKmS",
  );

  console.log("\n================ TEST SUMMARY ================");
  console.log(`Total Checks Run: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed === 0) {
    console.log("ALL ASTRONOMICAL INGESTION & PIPELINE CHECKS PASSED WITH 100% SUCCESS!");
  } else {
    throw new Error(`${failed} tests failed in catalog test suite.`);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
