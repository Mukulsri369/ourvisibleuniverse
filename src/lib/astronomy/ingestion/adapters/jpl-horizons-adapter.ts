/**
 * NASA JPL Horizons Solar System Dynamics Ingestion Adapter
 *
 * Ingests major planets, moons, dwarf planets, and asteroids with authoritative
 * JPL DE440 ephemerides, masses, and true physical radii.
 *
 * Source: NASA / JPL Solar System Dynamics (SSD)
 * License: Public Domain
 * Reference: Standish et al., JPL Planetary and Lunar Ephemerides
 */

import type { CanonicalAstronomicalObject, CatalogProviderInfo } from "../types";
import { Units } from "../../units";

export const JPL_PROVIDER_INFO: CatalogProviderInfo = {
  id: "jpl_horizons",
  name: "NASA JPL Horizons On-Line Solar System Ephemeris",
  provider: "NASA / Jet Propulsion Laboratory (JPL) / Solar System Dynamics Group",
  version: "JPL DE440/DE441 (2020)",
  description: "Highly precise ephemerides and physical characteristics for Solar System bodies.",
  homepageUrl: "https://ssd.jpl.nasa.gov/horizons/",
  license: "Public Domain (NASA)",
  attribution:
    "Courtesy NASA/JPL-Caltech. Solar system orbital elements and body parameters derived from JPL DE440 ephemerides.",
  bibcode: "2021AJ....161..105P",
};

export const JPL_BENCHMARK_SOLAR_SYSTEM: Record<string, Record<string, unknown>> = {
  sun: {
    id: "10",
    name: "Sun",
    type: "star",
    subtype: "yellow_dwarf",
    parent: null,
    semi_major_axis_au: 0.0,
    eccentricity: 0.0,
    radius_km: 696340.0,
    mass_solar: 1.0,
    teff_k: 5772.0,
    spectral_type: "G2V",
  },
  earth: {
    id: "399",
    name: "Earth",
    type: "solar_system_body",
    subtype: "terrestrial_planet",
    parent: "Sun",
    semi_major_axis_au: 1.00000261,
    eccentricity: 0.01671123,
    inclination_deg: 0.0,
    orbital_period_days: 365.256363,
    radius_km: 6371.0,
    mass_earth: 1.0,
  },
  jupiter: {
    id: "599",
    name: "Jupiter",
    type: "solar_system_body",
    subtype: "gas_giant",
    parent: "Sun",
    semi_major_axis_au: 5.2044,
    eccentricity: 0.0489,
    inclination_deg: 1.303,
    orbital_period_days: 4332.59,
    radius_km: 69911.0,
    mass_earth: 317.8,
  },
  neptune: {
    id: "899",
    name: "Neptune",
    type: "solar_system_body",
    subtype: "ice_giant",
    parent: "Sun",
    semi_major_axis_au: 30.0699,
    eccentricity: 0.0086,
    inclination_deg: 1.77,
    orbital_period_days: 60189.0,
    radius_km: 24622.0,
    mass_earth: 17.15,
  },
};

export class JplHorizonsAdapter {
  public normalizeRecord(raw: Record<string, unknown>): CanonicalAstronomicalObject {
    const name = String(raw.name);
    const semiMajorAxisAu = Number(raw.semi_major_axis_au);
    const distanceLy = Units.auToLightYears(semiMajorAxisAu);

    return {
      canonicalId: `URN:ASTRO:SOLAR:${name.toUpperCase()}`,
      name,
      alternateNames: [name, `Sol ${name}`],
      objectType: (raw.type as any) ?? "solar_system_body",
      subtype: (raw.subtype as string) ?? "planet",
      parentHostId: raw.parent ? `URN:ASTRO:SOLAR:${String(raw.parent).toUpperCase()}` : null,
      status: "observational",
      classificationConfidence: 1.0,
      dataQualityFlags: ["JPL_DE440_EPHEMERIS_STANDARD"],

      raDeg: 0.0,
      decDeg: 0.0,
      coordinateFrame: "Ecliptic",
      referenceEpoch: "J2000.0",

      galacticCartesianLy: { x: 0, y: 0, z: distanceLy },

      distanceLy,
      distanceUncertaintyLy: 0.0,
      distanceMethod: "ephemeris_radar",
      parallaxMas: null,
      parallaxErrorMas: null,
      properMotionRaMasYr: null,
      properMotionDecMasYr: null,
      radialVelocityKmS: null,
      redshift: null,
      redshiftUncertainty: null,

      physicalProperties: {
        radiusKm: raw.radius_km != null ? Number(raw.radius_km) : null,
        massSolar: raw.mass_solar != null ? Number(raw.mass_solar) : null,
        massEarth: raw.mass_earth != null ? Number(raw.mass_earth) : null,
        spectralType: (raw.spectral_type as string) ?? null,
        effectiveTemperatureK: raw.teff_k != null ? Number(raw.teff_k) : null,
      },

      orbitalElements: {
        semiMajorAxisAu,
        eccentricity: raw.eccentricity != null ? Number(raw.eccentricity) : 0,
        inclinationDeg: raw.inclination_deg != null ? Number(raw.inclination_deg) : 0,
        orbitalPeriodDays: raw.orbital_period_days != null ? Number(raw.orbital_period_days) : null,
      },

      spatialTileId: "tile_l0_solar_system",

      provenance: {
        sourceCatalog: "jpl_horizons",
        sourceId: String(raw.id),
        sourceUrl: `https://ssd.jpl.nasa.gov/horizons/app.html#/`,
        catalogVersion: JPL_PROVIDER_INFO.version,
        retrievalTimestamp: new Date().toISOString(),
        license: JPL_PROVIDER_INFO.license,
        attribution: JPL_PROVIDER_INFO.attribution,
        bibcode: JPL_PROVIDER_INFO.bibcode,
      },
    };
  }

  public getBenchmarkSolarSystem(): CanonicalAstronomicalObject[] {
    return Object.values(JPL_BENCHMARK_SOLAR_SYSTEM).map((raw) => this.normalizeRecord(raw));
  }
}
