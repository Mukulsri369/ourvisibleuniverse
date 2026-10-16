/**
 * Astronomical Data Normalization & Validation Engine
 *
 * Implements strict data sanity checks:
 * - Coordinates strictly inside valid domains (RA [0, 360), Dec [-90, +90])
 * - Double precision Cartesian conversions
 * - Never invents missing measurements (leaves missing values null)
 * - Strict schema validation through Zod
 */

import { CanonicalAstronomicalObjectSchema, type CanonicalAstronomicalObject } from "./types";

export interface NormalizationReport {
  valid: boolean;
  object?: CanonicalAstronomicalObject;
  errors: string[];
}

export class AstronomicalNormalizer {
  /**
   * Validates and normalizes an astronomical object candidate.
   */
  public static validate(candidate: unknown): NormalizationReport {
    const parseResult = CanonicalAstronomicalObjectSchema.safeParse(candidate);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return {
        valid: false,
        errors: errorMessages,
      };
    }

    const obj = parseResult.data;

    // Additional astrophysical invariant sanity checks
    const additionalErrors: string[] = [];

    if (obj.raDeg < 0 || obj.raDeg >= 360) {
      additionalErrors.push(`RA ${obj.raDeg} outside range [0, 360)`);
    }
    if (obj.decDeg < -90 || obj.decDeg > 90) {
      additionalErrors.push(`Dec ${obj.decDeg} outside range [-90, 90]`);
    }
    if (obj.distanceLy < 0) {
      additionalErrors.push(`Distance ${obj.distanceLy} cannot be negative`);
    }
    if (obj.parallaxMas != null && obj.parallaxErrorMas != null && obj.parallaxErrorMas < 0) {
      additionalErrors.push(`Parallax uncertainty cannot be negative`);
    }

    if (additionalErrors.length > 0) {
      return {
        valid: false,
        errors: additionalErrors,
      };
    }

    return {
      valid: true,
      object: obj,
      errors: [],
    };
  }
}
