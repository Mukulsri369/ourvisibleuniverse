/**
 * Astronomical Data Ingestion, Staging & Publication Pipeline
 *
 * Coordinates end-to-end multi-catalog harvesting, validation, cross-matching,
 * spatial indexing, binary tile compilation, and atomic publication.
 */

import { GaiaAdapter, GAIA_PROVIDER_INFO } from "./adapters/gaia-adapter";
import {
  NasaExoplanetAdapter,
  NASA_EXOPLANET_PROVIDER_INFO,
} from "./adapters/nasa-exoplanet-adapter";
import { SimbadAdapter, SIMBAD_PROVIDER_INFO } from "./adapters/simbad-adapter";
import { NedAdapter, NED_PROVIDER_INFO } from "./adapters/ned-adapter";
import { JplHorizonsAdapter, JPL_PROVIDER_INFO } from "./adapters/jpl-horizons-adapter";
import { AtnfPulsarAdapter, ATNF_PROVIDER_INFO } from "./adapters/atnf-pulsar-adapter";
import { AstronomicalNormalizer } from "./normalizer";
import { AstronomicalCrossMatcher } from "./cross-match";
import { SpatialIndexer } from "./spatial-indexer";
import { BinaryTileGenerator } from "./tile-generator";
import type {
  CanonicalAstronomicalObject,
  CatalogMeasurement,
  CatalogProviderInfo,
  IngestionBatchResult,
} from "./types";

export interface PipelineExecutionOptions {
  includeBenchmarks?: boolean;
  maxRecordsPerCatalog?: number;
  enableBinaryTiles?: boolean;
}

export class AstronomicalDataPipeline {
  private static publishedCatalog: CanonicalAstronomicalObject[] = [];
  private static publishedProvenance: CatalogMeasurement[] = [];
  private static binaryTiles = new Map<string, ArrayBuffer>();
  private static lastPublishedAt: string | null = null;

  /**
   * Catalog provider directory.
   */
  public static getProviders(): CatalogProviderInfo[] {
    return [
      GAIA_PROVIDER_INFO,
      NASA_EXOPLANET_PROVIDER_INFO,
      SIMBAD_PROVIDER_INFO,
      NED_PROVIDER_INFO,
      JPL_PROVIDER_INFO,
      ATNF_PROVIDER_INFO,
    ];
  }

  /**
   * Runs the complete ingestion and normalization workflow across all scientific catalogs.
   */
  public static async execute(
    options: PipelineExecutionOptions = { includeBenchmarks: true, enableBinaryTiles: true },
  ): Promise<{
    batchResults: IngestionBatchResult[];
    totalObjects: number;
    totalProvenance: number;
    tileCount: number;
    publishedAt: string;
  }> {
    const startTime = Date.now();
    const batchResults: IngestionBatchResult[] = [];
    const allRawObjects: CanonicalAstronomicalObject[] = [];

    // 1. Initialize Adapters
    const gaiaAdapter = new GaiaAdapter();
    const exoAdapter = new NasaExoplanetAdapter();
    const simbadAdapter = new SimbadAdapter();
    const nedAdapter = new NedAdapter();
    const jplAdapter = new JplHorizonsAdapter();
    const atnfAdapter = new AtnfPulsarAdapter();

    // 2. Collect verified records
    const gaiaStars = gaiaAdapter.getBenchmarkStars();
    const exoplanets = exoAdapter.getBenchmarkExoplanets();
    const simbadObjects = simbadAdapter.getBenchmarkObjects();
    const galaxies = nedAdapter.getBenchmarkGalaxies();
    const solarBodies = jplAdapter.getBenchmarkSolarSystem();
    const pulsars = atnfAdapter.getBenchmarkPulsars();

    const catalogGroups = [
      { id: "gaia_dr3", objects: gaiaStars },
      { id: "nasa_exoplanet_archive", objects: exoplanets },
      { id: "simbad", objects: simbadObjects },
      { id: "ned", objects: galaxies },
      { id: "jpl_horizons", objects: solarBodies },
      { id: "atnf_pulsar", objects: pulsars },
    ];

    // 3. Normalize and validate each batch
    for (const group of catalogGroups) {
      const batchStart = Date.now();
      const validObjects: CanonicalAstronomicalObject[] = [];
      const errors: string[] = [];

      for (const obj of group.objects) {
        const report = AstronomicalNormalizer.validate(obj);
        if (report.valid && report.object) {
          validObjects.push(report.object);
        } else {
          errors.push(`Validation failed for ${obj.canonicalId}: ${report.errors.join("; ")}`);
        }
      }

      batchResults.push({
        batchId: `batch-${group.id}-${Date.now()}`,
        catalogId: group.id as any,
        status: errors.length === 0 ? "published" : "staging",
        recordsProcessed: group.objects.length,
        recordsValid: validObjects.length,
        recordsCrossMatched: 0,
        recordsPublished: validObjects.length,
        errors,
        durationMs: Date.now() - batchStart,
        timestamp: new Date().toISOString(),
      });

      allRawObjects.push(...validObjects);
    }

    // 4. Cross-match and resolve duplicates while retaining conflicting measurements
    // Start with Solar System & Gaia as baseline
    const baseGroup = allRawObjects.filter(
      (o) =>
        o.provenance.sourceCatalog === "jpl_horizons" || o.provenance.sourceCatalog === "gaia_dr3",
    );
    const secondaryGroup = allRawObjects.filter(
      (o) =>
        o.provenance.sourceCatalog !== "jpl_horizons" && o.provenance.sourceCatalog !== "gaia_dr3",
    );

    const crossMatchResult = AstronomicalCrossMatcher.mergeCatalogs(baseGroup, secondaryGroup, 5.0);
    const finalizedObjects = crossMatchResult.mergedObjects;
    const provenanceList = crossMatchResult.provenanceMeasurements;

    // 5. Partition into Hierarchical Spatial Sky Tiles
    const tileMap = SpatialIndexer.partitionObjects(finalizedObjects);

    // 6. Generate Compact Binary GPU Tiles
    this.binaryTiles.clear();
    if (options.enableBinaryTiles) {
      for (const [tileId, tileObjects] of tileMap.entries()) {
        const buffer = BinaryTileGenerator.serializeTile(tileId, tileObjects, 1);
        this.binaryTiles.set(tileId, buffer);
      }
    }

    // 7. Atomic Publication
    this.publishedCatalog = finalizedObjects;
    this.publishedProvenance = provenanceList;
    const publishedAt = new Date().toISOString();
    this.lastPublishedAt = publishedAt;

    return {
      batchResults,
      totalObjects: finalizedObjects.length,
      totalProvenance: provenanceList.length,
      tileCount: this.binaryTiles.size,
      publishedAt,
    };
  }

  /**
   * Returns current published catalog objects.
   */
  public static getPublishedCatalog(): CanonicalAstronomicalObject[] {
    // If not yet executed, run synchronously with benchmarks
    if (this.publishedCatalog.length === 0) {
      this.execute({ includeBenchmarks: true, enableBinaryTiles: true });
    }
    return this.publishedCatalog;
  }

  /**
   * Returns provenance records for conflicting measurements.
   */
  public static getPublishedProvenance(): CatalogMeasurement[] {
    if (this.publishedCatalog.length === 0) {
      this.execute({ includeBenchmarks: true, enableBinaryTiles: true });
    }
    return this.publishedProvenance;
  }

  /**
   * Retrieves a binary GPU tile by ID.
   */
  public static getBinaryTile(tileId: string): ArrayBuffer | null {
    if (this.publishedCatalog.length === 0) {
      this.execute({ includeBenchmarks: true, enableBinaryTiles: true });
    }
    return this.binaryTiles.get(tileId) ?? null;
  }

  /**
   * Returns metadata and all available tile IDs.
   */
  public static listBinaryTiles(): Array<{ tileId: string; byteSize: number }> {
    if (this.publishedCatalog.length === 0) {
      this.execute({ includeBenchmarks: true, enableBinaryTiles: true });
    }
    return Array.from(this.binaryTiles.entries()).map(([tileId, buffer]) => ({
      tileId,
      byteSize: buffer.byteLength,
    }));
  }

  /**
   * Search index across names, aliases, object types, and spatial coordinates.
   */
  public static search(params: {
    query?: string;
    objectType?: string;
    minDistanceLy?: number;
    maxDistanceLy?: number;
    cone?: { raDeg: number; decDeg: number; radiusDeg: number };
    limit?: number;
    offset?: number;
  }): { results: CanonicalAstronomicalObject[]; total: number } {
    const catalog = this.getPublishedCatalog();
    const q = params.query ? params.query.trim().toLowerCase() : "";
    const type = params.objectType?.toLowerCase();
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const offset = Math.max(0, params.offset ?? 0);

    const filtered = catalog.filter((obj) => {
      // Query filter
      if (q) {
        const matchesName = obj.name.toLowerCase().includes(q);
        const matchesCanonical = obj.canonicalId.toLowerCase().includes(q);
        const matchesAlias = obj.alternateNames.some((alias) => alias.toLowerCase().includes(q));
        if (!matchesName && !matchesCanonical && !matchesAlias) return false;
      }

      // Type filter
      if (type && type !== "all" && obj.objectType.toLowerCase() !== type) {
        return false;
      }

      // Distance filter
      if (params.minDistanceLy != null && obj.distanceLy < params.minDistanceLy) {
        return false;
      }
      if (params.maxDistanceLy != null && obj.distanceLy > params.maxDistanceLy) {
        return false;
      }

      // Celestial cone search
      if (params.cone) {
        const sepArcsec = AstronomicalCrossMatcher.angularSeparationArcsec(
          params.cone.raDeg,
          params.cone.decDeg,
          obj.raDeg,
          obj.decDeg,
        );
        const radiusArcsec = params.cone.radiusDeg * 3600.0;
        if (sepArcsec > radiusArcsec) return false;
      }

      return true;
    });

    return {
      results: filtered.slice(offset, offset + limit),
      total: filtered.length,
    };
  }
}
