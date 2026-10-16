/**
 * Executable Astronomical Data Ingestion Worker
 *
 * Runs end-to-end multi-provider harvesting, validation, cross-matching,
 * spatial indexing, and binary tile generation.
 *
 * Usage:
 *   npx tsx scripts/ingest-astronomy-catalog.ts
 */

import { AstronomicalDataPipeline } from "../src/lib/astronomy/ingestion/pipeline";
import { BinaryTileGenerator } from "../src/lib/astronomy/ingestion/tile-generator";
import { formatDistanceLy } from "../src/lib/astronomy/units";

async function main() {
  console.log("==================================================================");
  console.log("🌌 OUR VISIBLE UNIVERSE — SCIENTIFIC DATA INGESTION ENGINE");
  console.log("==================================================================\n");

  console.log("1. Catalog Providers Configured:");
  const providers = AstronomicalDataPipeline.getProviders();
  for (const p of providers) {
    console.log(`   - [${p.id}] ${p.name} (${p.provider})`);
    console.log(`     Endpoint: ${p.tapEndpoint ?? p.homepageUrl}`);
    console.log(`     License: ${p.license}`);
  }

  console.log("\n2. Executing Multi-Catalog Ingestion Pipeline...");
  const startTime = Date.now();
  const summary = await AstronomicalDataPipeline.execute({
    includeBenchmarks: true,
    enableBinaryTiles: true,
  });

  console.log("\n3. Batch Validation & Ingestion Results:");
  for (const b of summary.batchResults) {
    const statusIcon = b.status === "published" ? "✅" : "⚠️";
    console.log(
      `   ${statusIcon} [${b.catalogId}] ${b.recordsProcessed} processed | ${b.recordsValid} valid | ${b.durationMs}ms`,
    );
    if (b.errors.length > 0) {
      console.log(`      Warnings: ${b.errors.join(", ")}`);
    }
  }

  console.log("\n4. Published Canonical Catalog Statistics:");
  const catalog = AstronomicalDataPipeline.getPublishedCatalog();
  console.log(`   - Total Canonical Astronomical Objects: ${summary.totalObjects}`);
  console.log(`   - Published Timestamp: ${summary.publishedAt}`);
  console.log(`   - Spatial GPU Binary Tiles Created: ${summary.tileCount}`);
  console.log(`   - Conflicting Measurement Provenance Records: ${summary.totalProvenance}`);

  console.log("\n5. Sample Ingested Scientific Targets:");
  const sampleIds = [
    "URN:ASTRO:SOLAR:EARTH",
    "URN:ASTRO:STAR:GAIADR3-2947050466531835648", // Sirius A
    "URN:ASTRO:EXO:PROXIMA-CENTAURI-B",
    "URN:ASTRO:BLACK_HOLE:SGR-A-STAR",
    "URN:ASTRO:GAL:MESSIER-031", // Andromeda
    "URN:ASTRO:PULSAR:PSR-J0534+2200", // Crab Pulsar
  ];

  for (const id of sampleIds) {
    const obj = catalog.find((o) => o.canonicalId === id);
    if (obj) {
      console.log(`   ⭐ ${obj.name} (${obj.objectType}) [${obj.canonicalId}]`);
      console.log(
        `      RA: ${obj.raDeg.toFixed(4)}°, Dec: ${obj.decDeg.toFixed(4)}° (${obj.coordinateFrame} ${obj.referenceEpoch})`,
      );
      console.log(
        `      Distance: ${formatDistanceLy(obj.distanceLy)} (Method: ${obj.distanceMethod})`,
      );
      if (obj.parallaxMas) {
        console.log(`      Parallax: ${obj.parallaxMas} ± ${obj.parallaxErrorMas ?? 0} mas`);
      }
      if (obj.physicalProperties.effectiveTemperatureK) {
        console.log(
          `      T_eff: ${obj.physicalProperties.effectiveTemperatureK} K, Spectral: ${obj.physicalProperties.spectralType ?? "N/A"}`,
        );
      }
      if (obj.orbitalElements?.semiMajorAxisAu) {
        console.log(
          `      Semi-major axis: ${obj.orbitalElements.semiMajorAxisAu} AU, Period: ${obj.orbitalElements.orbitalPeriodDays} days`,
        );
      }
      console.log(
        `      Source: ${obj.provenance.sourceCatalog} (${obj.provenance.catalogVersion}) - Bibcode: ${obj.provenance.bibcode}`,
      );
      console.log(`      Spatial Tile: ${obj.spatialTileId}`);
      console.log("");
    }
  }

  console.log("6. Binary GPU Tile Verification:");
  const tiles = AstronomicalDataPipeline.listBinaryTiles();
  for (const t of tiles.slice(0, 4)) {
    const buf = AstronomicalDataPipeline.getBinaryTile(t.tileId);
    if (buf) {
      const parsed = BinaryTileGenerator.deserializeTile(buf);
      console.log(
        `   📦 Tile [${t.tileId}] — ${parsed.recordCount} records, ${t.byteSize} bytes, Magic: '${parsed.magic}', Bounding Box: [${parsed.boundingBox.minX.toFixed(1)}, ${parsed.boundingBox.maxX.toFixed(1)}] ly`,
      );
    }
  }

  console.log(`\n✨ Pipeline execution complete in ${Date.now() - startTime}ms.`);
  console.log("==================================================================");
}

main().catch((err) => {
  console.error("Pipeline failure:", err);
  process.exit(1);
});
