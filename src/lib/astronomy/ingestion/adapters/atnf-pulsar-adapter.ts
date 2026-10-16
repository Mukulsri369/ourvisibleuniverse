/**
 * ATNF Pulsar Catalogue Ingestion Adapter
 *
 * Ingests rotating neutron stars (pulsars), spin periods, period derivatives,
 * dispersion measures, and derived magnetic fields.
 *
 * Source: Australia Telescope National Facility (CSIRO Space & Astronomy)
 * License: Open Scientific Data
 * Reference: Manchester et al. (2005) AJ, 129, 1993
 */

import type { CanonicalAstronomicalObject, CatalogProviderInfo } from "../types";
import { coordinates } from "../../coordinates";

export const ATNF_PROVIDER_INFO: CatalogProviderInfo = {
  id: "atnf_pulsar",
  name: "ATNF Pulsar Catalogue",
  provider: "Australia Telescope National Facility (CSIRO Space and Astronomy)",
  version: "PSRCAT v1.71 (2026)",
  description: "Authoritative catalog of all published rotation-powered pulsars.",
  homepageUrl: "https://www.atnf.csiro.au/research/pulsar/psrcat/",
  license: "CSIRO Open Scientific Access",
  attribution:
    "Pulsar parameters sourced from the ATNF Pulsar Catalogue (Manchester, Hobbs, Teoh & Hobbs, 2005).",
  bibcode: "2005AJ....129.1993M",
};

export const ATNF_BENCHMARK_PULSARS: Record<string, Record<string, unknown>> = {
  "crab-pulsar": {
    jname: "PSR J0534+2200",
    bname: "PSR B0531+21",
    name: "Crab Pulsar",
    ra: 83.633218,
    dec: 22.014464,
    distance_ly: 6500.0,
    distance_uncertainty_ly: 500.0,
    period_s: 0.0333924, // 33.39 ms
    p_dot: 4.21e-13,
    dm: 56.77,
    b_surf_gauss: 3.78e12,
    age_yr: 1240.0,
    bibcode: "1969Natur.221...42C",
  },
  "vela-pulsar": {
    jname: "PSR J0835-4510",
    bname: "PSR B0833-45",
    name: "Vela Pulsar",
    ra: 128.83588,
    dec: -45.17636,
    distance_ly: 936.0,
    distance_uncertainty_ly: 50.0,
    period_s: 0.089328, // 89.3 ms
    p_dot: 1.25e-13,
    dm: 67.99,
    b_surf_gauss: 3.38e12,
    age_yr: 11300.0,
    bibcode: "2003ApJ...596.1137D",
  },
};

export class AtnfPulsarAdapter {
  public normalizeRecord(raw: Record<string, unknown>): CanonicalAstronomicalObject {
    const jname = String(raw.jname);
    const name = String(raw.name ?? jname);
    const raDeg = Number(raw.ra);
    const decDeg = Number(raw.dec);
    const distanceLy = Number(raw.distance_ly);

    const galacticCoords = coordinates.icrsToGalactic(raDeg, decDeg);
    const cartesianPos = coordinates.sphericalToCartesian(
      galacticCoords.l,
      galacticCoords.b,
      distanceLy,
    );

    return {
      canonicalId: `URN:ASTRO:PULSAR:${jname.replace(/[^A-Z0-9+]/g, "-")}`,
      name,
      alternateNames: [name, jname, String(raw.bname ?? "")].filter(Boolean),
      objectType: "pulsar",
      subtype: "isolated_radio_pulsar",
      parentHostId: "URN:ASTRO:GAL:MILKY-WAY",
      status: "observational",
      classificationConfidence: 1.0,
      dataQualityFlags: ["ATNF_VERIFIED_EPHEMERIS"],

      raDeg,
      decDeg,
      coordinateFrame: "ICRS",
      referenceEpoch: "J2000.0",

      galacticCartesianLy: {
        x: cartesianPos.x,
        y: cartesianPos.y,
        z: cartesianPos.z,
      },

      distanceLy,
      distanceUncertaintyLy:
        raw.distance_uncertainty_ly != null ? Number(raw.distance_uncertainty_ly) : null,
      distanceMethod: "spectroscopic_parallax",
      parallaxMas: null,
      parallaxErrorMas: null,
      properMotionRaMasYr: null,
      properMotionDecMasYr: null,
      radialVelocityKmS: null,
      redshift: null,
      redshiftUncertainty: null,

      physicalProperties: {
        massSolar: 1.4, // Chandrasekhar canonical neutron star mass
        radiusKm: 12.0, // Canonical neutron star radius ~12 km
        spinPeriodSeconds: raw.period_s != null ? Number(raw.period_s) : null,
        magneticFieldGauss: raw.b_surf_gauss != null ? Number(raw.b_surf_gauss) : null,
      },

      spatialTileId: `tile_l1_${Math.floor(raDeg / 30)}_${Math.floor((decDeg + 90) / 30)}`,

      provenance: {
        sourceCatalog: "atnf_pulsar",
        sourceId: jname,
        sourceUrl: `https://www.atnf.csiro.au/research/pulsar/psrcat/proc_start.php?pulsar_names=${encodeURIComponent(jname)}`,
        catalogVersion: ATNF_PROVIDER_INFO.version,
        retrievalTimestamp: new Date().toISOString(),
        license: ATNF_PROVIDER_INFO.license,
        attribution: ATNF_PROVIDER_INFO.attribution,
        bibcode: (raw.bibcode as string) ?? ATNF_PROVIDER_INFO.bibcode,
      },
    };
  }

  public getBenchmarkPulsars(): CanonicalAstronomicalObject[] {
    return Object.values(ATNF_BENCHMARK_PULSARS).map((raw) => this.normalizeRecord(raw));
  }
}
