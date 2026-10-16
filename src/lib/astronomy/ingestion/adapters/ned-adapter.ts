/**
 * NASA/IPAC Extragalactic Database (NED) Ingestion Adapter
 *
 * Ingests external galaxies, cosmological redshifts, Hubble morphological types,
 * multi-wavelength photometry, and metric distances.
 *
 * Source: NASA / IPAC / Caltech
 * License: Open Scientific Data
 * Bibcode: 1990ASSL..157..137H
 */

import type { CanonicalAstronomicalObject, CatalogProviderInfo } from "../types";
import { coordinates } from "../../coordinates";

export const NED_PROVIDER_INFO: CatalogProviderInfo = {
  id: "ned",
  name: "NASA/IPAC Extragalactic Database",
  provider: "NASA / IPAC / California Institute of Technology",
  version: "NED v3.0 (2026)",
  description:
    "Comprehensive database of multiwavelength data and distances for extragalactic objects beyond our Milky Way.",
  homepageUrl: "https://ned.ipac.caltech.edu/",
  license: "NASA Open Data Policy (Free for research and educational visualization)",
  attribution:
    "This research has made use of the NASA/IPAC Extragalactic Database (NED), which is operated by the Jet Propulsion Laboratory, California Institute of Technology, under contract with the National Aeronautics and Space Administration.",
  bibcode: "1990ASSL..157..137H",
};

// Authoritative benchmark galaxies from NED / Cepheid / TRGB distance ladder
export const NED_BENCHMARK_GALAXIES: Record<string, Record<string, unknown>> = {
  "andromeda-m31": {
    preferred_name: "MESSIER 031",
    name: "Andromeda Galaxy",
    alternate_names: ["M 31", "NGC 0224", "UGC 00454", "Andromeda I"],
    morphology: "SA(s)b",
    ra: 10.684708,
    dec: 41.26875,
    redshift: -0.001001, // Blueshifted approaching Milky Way at ~300 km/s
    radial_velocity_km_s: -300.0,
    distance_ly: 2537000.0, // Freedman et al. Cepheid calibration
    distance_uncertainty_ly: 50000.0,
    distance_method: "cepheid_variable",
    diameter_ly: 220000.0,
    mass_solar: 1.5e12,
    bibcode: "2001ApJ...553...47F",
  },
  "triangulum-m33": {
    preferred_name: "MESSIER 033",
    name: "Triangulum Galaxy",
    alternate_names: ["M 33", "NGC 0598", "UGC 01117", "Pinwheel Galaxy"],
    morphology: "SA(s)cd",
    ra: 23.4621,
    dec: 30.6599,
    redshift: -0.000607,
    radial_velocity_km_s: -182.0,
    distance_ly: 2730000.0,
    distance_uncertainty_ly: 60000.0,
    distance_method: "cepheid_variable",
    diameter_ly: 60000.0,
    mass_solar: 5.0e10,
    bibcode: "2004A&A...424...43B",
  },
  "large-magellanic-cloud": {
    preferred_name: "Large Magellanic Cloud",
    name: "Large Magellanic Cloud (LMC)",
    alternate_names: ["LMC", "ESO 056-115", "PGC 017223"],
    morphology: "SB(s)m",
    ra: 80.8942,
    dec: -69.7561,
    redshift: 0.000927,
    radial_velocity_km_s: 278.0,
    distance_ly: 163000.0, // Detached eclipsing binaries benchmark (Pietrzyński et al. 2019)
    distance_uncertainty_ly: 2000.0,
    distance_method: "orbital_dynamics",
    diameter_ly: 32000.0,
    mass_solar: 1.4e11,
    bibcode: "2019Natur.567..200P",
  },
  "whirlpool-m51": {
    preferred_name: "MESSIER 051A",
    name: "Whirlpool Galaxy",
    alternate_names: ["M 51a", "NGC 5194", "UGC 08493", "Arp 085"],
    morphology: "SA(s)bc pec",
    ra: 202.469575,
    dec: 47.195258,
    redshift: 0.001544,
    radial_velocity_km_s: 463.0,
    distance_ly: 23500000.0, // 7.2 Mpc
    distance_uncertainty_ly: 1500000.0,
    distance_method: "type_ia_supernova",
    diameter_ly: 76000.0,
    mass_solar: 1.6e11,
    bibcode: "2016ApJ...826...56M",
  },
  "sombrero-m104": {
    preferred_name: "MESSIER 104",
    name: "Sombrero Galaxy",
    alternate_names: ["M 104", "NGC 4594", "UGC 07824"],
    morphology: "SA(s)a",
    ra: 189.997633,
    dec: -11.623053,
    redshift: 0.003416,
    radial_velocity_km_s: 1024.0,
    distance_ly: 29300000.0, // 9.0 Mpc
    distance_uncertainty_ly: 1800000.0,
    distance_method: "trgb",
    diameter_ly: 105000.0,
    mass_solar: 8.0e11,
    bibcode: "2008ApJ...676..184M",
  },
};

export class NedAdapter {
  public normalizeRecord(raw: Record<string, unknown>): CanonicalAstronomicalObject {
    const prefName = String(raw.preferred_name);
    const name = String(raw.name ?? prefName);
    const raDeg = Number(raw.ra);
    const decDeg = Number(raw.dec);
    const distanceLy = Number(raw.distance_ly);
    const distUncert =
      raw.distance_uncertainty_ly != null ? Number(raw.distance_uncertainty_ly) : null;

    const galacticCoords = coordinates.icrsToGalactic(raDeg, decDeg);
    const cartesianPos = coordinates.sphericalToCartesian(
      galacticCoords.l,
      galacticCoords.b,
      distanceLy,
    );

    return {
      canonicalId: `URN:ASTRO:GAL:${prefName.toUpperCase().replace(/[^A-Z0-9]/g, "-")}`,
      name,
      alternateNames: Array.from(
        new Set([name, prefName, ...((raw.alternate_names as string[]) ?? [])]),
      ),
      objectType: "galaxy",
      subtype: (raw.morphology as string) ?? "spiral_galaxy",
      parentHostId: "URN:ASTRO:STRUCT:LOCAL-GROUP",
      status: "observational",
      classificationConfidence: 0.99,
      dataQualityFlags: ["NED_EXTRAGALACTIC_CERTIFIED"],

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
      distanceUncertaintyLy: distUncert,
      distanceMethod: (raw.distance_method as any) ?? "cepheid_variable",
      parallaxMas: null,
      parallaxErrorMas: null,
      properMotionRaMasYr: null,
      properMotionDecMasYr: null,
      radialVelocityKmS: raw.radial_velocity_km_s != null ? Number(raw.radial_velocity_km_s) : null,
      redshift: raw.redshift != null ? Number(raw.redshift) : null,
      redshiftUncertainty: null,

      physicalProperties: {
        morphologicalClass: (raw.morphology as string) ?? null,
        massSolar: raw.mass_solar != null ? Number(raw.mass_solar) : null,
      },

      spatialTileId: `tile_l2_${Math.floor(raDeg / 60)}_${Math.floor((decDeg + 90) / 60)}`,

      provenance: {
        sourceCatalog: "ned",
        sourceId: prefName,
        sourceUrl: `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(prefName)}`,
        catalogVersion: NED_PROVIDER_INFO.version,
        retrievalTimestamp: new Date().toISOString(),
        license: NED_PROVIDER_INFO.license,
        attribution: NED_PROVIDER_INFO.attribution,
        bibcode: (raw.bibcode as string) ?? NED_PROVIDER_INFO.bibcode,
      },
    };
  }

  public getBenchmarkGalaxies(): CanonicalAstronomicalObject[] {
    return Object.values(NED_BENCHMARK_GALAXIES).map((raw) => this.normalizeRecord(raw));
  }
}
