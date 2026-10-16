/**
 * Astronomical Spatial Indexer & Celestial Partitioning
 *
 * Partitions the observable universe volume into hierarchical spatial bins (tiles)
 * across angular coordinates (RA, Dec) and distance tiers.
 */

import type { CanonicalAstronomicalObject } from "./types";

export interface TileCoordinates {
  level: number;
  raIndex: number;
  decIndex: number;
  distanceTier: "solar_system" | "neighborhood" | "galactic" | "cosmological";
}

export class SpatialIndexer {
  /**
   * Computes the hierarchical spatial tile ID for an astronomical object.
   */
  public static computeTileId(obj: { raDeg: number; decDeg: number; distanceLy: number }): string {
    const { raDeg, decDeg, distanceLy } = obj;

    // Normalize RA into [0, 360) and Dec into [-90, +90]
    const normRa = ((raDeg % 360) + 360) % 360;
    const clampedDec = Math.max(-90, Math.min(90, decDeg));

    // Level 0: Solar System (distance < 0.1 light-year)
    if (distanceLy < 0.1) {
      return "tile_l0_solar_system";
    }

    // Level 1: Solar Neighborhood & Local Stars (0.1 <= d < 10,000 ly)
    // 30° RA grid (12 bands) x 30° Dec grid (6 bands) = 72 spatial tiles
    if (distanceLy < 10_000) {
      const raBin = Math.floor(normRa / 30);
      const decBin = Math.floor((clampedDec + 90) / 30);
      return `tile_l1_${raBin}_${decBin}`;
    }

    // Level 2: Galactic & Local Group (10,000 <= d < 10,000,000 ly)
    // 60° RA grid x 60° Dec grid = 18 spatial tiles
    if (distanceLy < 10_000_000) {
      const raBin = Math.floor(normRa / 60);
      const decBin = Math.floor((clampedDec + 90) / 60);
      return `tile_l2_${raBin}_${decBin}`;
    }

    // Level 3: Extragalactic & Cosmological Web (d >= 10,000,000 ly)
    // 90° RA grid x 90° Dec grid = 8 large cosmological octants
    const raBin = Math.floor(normRa / 90);
    const decBin = Math.floor((clampedDec + 90) / 90);
    return `tile_l3_${raBin}_${decBin}`;
  }

  /**
   * Partitions an array of canonical objects into spatial tile groups.
   */
  public static partitionObjects(
    objects: CanonicalAstronomicalObject[],
  ): Map<string, CanonicalAstronomicalObject[]> {
    const tileMap = new Map<string, CanonicalAstronomicalObject[]>();

    for (const obj of objects) {
      const tileId = this.computeTileId(obj);
      // Ensure the object carries its assigned tileId
      obj.spatialTileId = tileId;

      const group = tileMap.get(tileId) ?? [];
      group.push(obj);
      tileMap.set(tileId, group);
    }

    return tileMap;
  }
}
