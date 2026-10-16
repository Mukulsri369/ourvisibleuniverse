/**
 * Astrometric Cross-Matching, Deduplication & Conflict Provenance Engine
 *
 * Implements high-precision celestial spherical trigonometry (Haversine distance)
 * for spatial cross-matching combined with catalog alias resolution.
 *
 * When measurements conflict across providers, both are preserved with full
 * attribution and bibcodes in the provenance ledger.
 */

import type { CanonicalAstronomicalObject, CatalogMeasurement } from "./types";

export interface CrossMatchResult {
  mergedObjects: CanonicalAstronomicalObject[];
  provenanceMeasurements: CatalogMeasurement[];
  crossMatchedCount: number;
}

export class AstronomicalCrossMatcher {
  /**
   * Computes great-circle angular distance on the celestial sphere in arcseconds.
   */
  public static angularSeparationArcsec(
    ra1Deg: number,
    dec1Deg: number,
    ra2Deg: number,
    dec2Deg: number,
  ): number {
    const degToRad = Math.PI / 180;
    const phi1 = dec1Deg * degToRad;
    const phi2 = dec2Deg * degToRad;
    const deltaPhi = (dec2Deg - dec1Deg) * degToRad;
    const deltaLambda = (ra2Deg - ra1Deg) * degToRad;

    // Haversine formula
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    const separationDeg = c / degToRad;
    return separationDeg * 3600.0; // Convert to arcseconds
  }

  /**
   * Normalizes an astronomical name or alias for case-insensitive matching.
   */
  public static normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[\s\-_*.]+/g, "")
      .replace(/^name/, "");
  }

  /**
   * Cross-matches a candidate against a list of existing objects.
   * Checks both alias overlaps and spatial proximity (within threshold arcsec).
   */
  public static findMatch(
    candidate: CanonicalAstronomicalObject,
    existing: CanonicalAstronomicalObject[],
    spatialThresholdArcsec = 5.0, // Default 5 arcseconds for stellar sources
  ): CanonicalAstronomicalObject | null {
    const candidateAliases = new Set([
      this.normalizeName(candidate.name),
      ...candidate.alternateNames.map((n) => this.normalizeName(n)),
    ]);

    // 1. Alias-based deterministic matching
    for (const obj of existing) {
      if (candidate.objectType !== obj.objectType) continue;

      const objAliases = new Set([
        this.normalizeName(obj.name),
        ...obj.alternateNames.map((n) => this.normalizeName(n)),
      ]);

      for (const a of candidateAliases) {
        if (objAliases.has(a)) {
          return obj;
        }
      }
    }

    // 2. Spatial proximity matching (only for identical object types and distance agreement within 30%)
    for (const obj of existing) {
      if (candidate.objectType !== obj.objectType) continue;

      const separation = this.angularSeparationArcsec(
        candidate.raDeg,
        candidate.decDeg,
        obj.raDeg,
        obj.decDeg,
      );

      if (separation <= spatialThresholdArcsec) {
        // Distance check
        const maxDist = Math.max(candidate.distanceLy, obj.distanceLy);
        const distDiff = Math.abs(candidate.distanceLy - obj.distanceLy);
        if (maxDist === 0 || distDiff / maxDist < 0.35) {
          return obj;
        }
      }
    }

    return null;
  }

  /**
   * Merges multiple catalog datasets, resolving cross-identifications and preserving
   * contradictory measurements in the provenance ledger.
   */
  public static mergeCatalogs(
    primaryCatalog: CanonicalAstronomicalObject[],
    secondaryCatalog: CanonicalAstronomicalObject[],
    spatialThresholdArcsec = 5.0,
  ): CrossMatchResult {
    const merged = new Map<string, CanonicalAstronomicalObject>();
    const provenance: CatalogMeasurement[] = [];
    let crossMatchedCount = 0;

    // Load primary catalog
    for (const obj of primaryCatalog) {
      merged.set(obj.canonicalId, { ...obj });
    }

    // Process secondary catalog
    for (const incoming of secondaryCatalog) {
      const match = this.findMatch(incoming, Array.from(merged.values()), spatialThresholdArcsec);

      if (match) {
        crossMatchedCount++;
        // Merge alternate names
        const combinedAliases = Array.from(
          new Set([...match.alternateNames, incoming.name, ...incoming.alternateNames]),
        );
        match.alternateNames = combinedAliases;

        // Record conflicting or secondary measurements
        if (incoming.distanceLy !== match.distanceLy) {
          provenance.push({
            id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            canonicalId: match.canonicalId,
            catalogId: incoming.provenance.sourceCatalog,
            parameterName: "distance_ly",
            parameterValue: incoming.distanceLy,
            uncertainty: incoming.distanceUncertaintyLy,
            method: incoming.distanceMethod ?? undefined,
            bibcode: incoming.provenance.bibcode ?? undefined,
            citation: incoming.provenance.attribution,
            retrievalTimestamp: incoming.provenance.retrievalTimestamp,
          });
        }

        if (incoming.parallaxMas != null && incoming.parallaxMas !== match.parallaxMas) {
          provenance.push({
            id: `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            canonicalId: match.canonicalId,
            catalogId: incoming.provenance.sourceCatalog,
            parameterName: "parallax_mas",
            parameterValue: incoming.parallaxMas,
            uncertainty: incoming.parallaxErrorMas,
            method: "trigonometric_parallax",
            bibcode: incoming.provenance.bibcode ?? undefined,
            citation: incoming.provenance.attribution,
            retrievalTimestamp: incoming.provenance.retrievalTimestamp,
          });
        }

        // Fill in missing physical parameters from secondary if absent in primary
        if (!match.physicalProperties.spectralType && incoming.physicalProperties.spectralType) {
          match.physicalProperties.spectralType = incoming.physicalProperties.spectralType;
        }
        if (!match.physicalProperties.massSolar && incoming.physicalProperties.massSolar) {
          match.physicalProperties.massSolar = incoming.physicalProperties.massSolar;
        }
        if (!match.physicalProperties.radiusSolar && incoming.physicalProperties.radiusSolar) {
          match.physicalProperties.radiusSolar = incoming.physicalProperties.radiusSolar;
        }
        if (!match.subtype && incoming.subtype) {
          match.subtype = incoming.subtype;
        }
      } else {
        // Unique new object
        merged.set(incoming.canonicalId, { ...incoming });
      }
    }

    return {
      mergedObjects: Array.from(merged.values()),
      provenanceMeasurements: provenance,
      crossMatchedCount,
    };
  }
}
