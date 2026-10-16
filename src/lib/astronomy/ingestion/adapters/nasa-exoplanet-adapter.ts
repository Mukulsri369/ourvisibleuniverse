/**
 * NASA Exoplanet Archive Ingestion Adapter
 *
 * Ingests confirmed exoplanetary systems, orbital elements, transit & radial velocity
 * parameters, planetary atmospheres, and host star metadata.
 *
 * Source: NASA Exoplanet Science Institute (NExScI) / IPAC / Caltech
 * Table: pscomppars (Planetary Systems Composite Parameters)
 * License: Open Access Public Scientific Data
 * Bibcode: 2013PASP..125..989A
 */

import { TapClient } from "../tap-client";
import type { CanonicalAstronomicalObject, CatalogProviderInfo } from "../types";
import { coordinates } from "../../coordinates";

export const NASA_EXOPLANET_PROVIDER_INFO: CatalogProviderInfo = {
  id: "nasa_exoplanet_archive",
  name: "NASA Exoplanet Archive",
  provider: "NASA Exoplanet Science Institute (NExScI) / Caltech / IPAC",
  version: "Composite Parameters (2026-10)",
  description:
    "Authoritative astronomical database of confirmed exoplanets, stellar parameters, and orbital solutions.",
  homepageUrl: "https://exoplanetarchive.ipac.caltech.edu/",
  tapEndpoint: "https://exoplanetarchive.ipac.caltech.edu/TAP/sync",
  license: "NASA Open Data Policy (Public Domain / Free Scientific Use)",
  attribution:
    "This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet Exploration Program.",
  bibcode: "2013PASP..125..989A",
};

// Verified benchmark exoplanets from the NASA Exoplanet Archive
export const NASA_BENCHMARK_EXOPLANETS: Record<string, Record<string, unknown>> = {
  "kepler-452-b": {
    pl_name: "Kepler-452 b",
    hostname: "Kepler-452",
    discoverymethod: "Transit",
    disc_year: 2015,
    pl_orbper: 384.843,
    pl_orbsmax: 1.046,
    pl_rade: 1.63,
    pl_bmasse: 5.0, // Inferred mass
    pl_orbeccen: 0.035,
    pl_orbincl: 89.806,
    pl_eqt: 265,
    pl_insol: 1.1,
    st_spectype: "G2V",
    st_teff: 5757,
    st_mass: 1.037,
    st_rad: 1.11,
    ra: 296.007625,
    dec: 44.277461,
    sy_dist: 552.0, // pc
    sy_disterr1: 35.0,
    sy_plx: 1.81,
  },
  "proxima-centauri-b": {
    pl_name: "Proxima Centauri b",
    hostname: "Proxima Centauri",
    discoverymethod: "Radial Velocity",
    disc_year: 2016,
    pl_orbper: 11.1868,
    pl_orbsmax: 0.0485,
    pl_rade: 1.07,
    pl_bmasse: 1.07,
    pl_orbeccen: 0.02,
    pl_orbincl: 133.0,
    pl_eqt: 234,
    pl_insol: 0.65,
    st_spectype: "M5.5Ve",
    st_teff: 3042,
    st_mass: 0.122,
    st_rad: 0.154,
    ra: 217.428938,
    dec: -62.679492,
    sy_dist: 1.302, // pc
    sy_disterr1: 0.001,
    sy_plx: 768.0665,
  },
  "trappist-1-e": {
    pl_name: "TRAPPIST-1 e",
    hostname: "TRAPPIST-1",
    discoverymethod: "Transit",
    disc_year: 2017,
    pl_orbper: 6.099615,
    pl_orbsmax: 0.02928,
    pl_rade: 0.92,
    pl_bmasse: 0.692,
    pl_orbeccen: 0.0051,
    pl_orbincl: 89.86,
    pl_eqt: 251,
    pl_insol: 0.662,
    st_spectype: "M8V",
    st_teff: 2566,
    st_mass: 0.0898,
    st_rad: 0.1192,
    ra: 346.622013,
    dec: -5.041397,
    sy_dist: 12.43, // pc
    sy_disterr1: 0.05,
    sy_plx: 80.45,
  },
  "wasp-12-b": {
    pl_name: "WASP-12 b",
    hostname: "WASP-12",
    discoverymethod: "Transit",
    disc_year: 2008,
    pl_orbper: 1.09142,
    pl_orbsmax: 0.0229,
    pl_rade: 19.39, // 1.73 RJup
    pl_bmasse: 467.2, // 1.47 MJup
    pl_orbeccen: 0.0,
    pl_orbincl: 86.0,
    pl_eqt: 2580,
    pl_insol: 2300.0,
    st_spectype: "F8V",
    st_teff: 6300,
    st_mass: 1.35,
    st_rad: 1.57,
    ra: 97.636667,
    dec: 29.672222,
    sy_dist: 430.0, // pc
    sy_disterr1: 20.0,
    sy_plx: 2.32,
  },
};

export class NasaExoplanetAdapter {
  private client: TapClient;

  constructor(client?: TapClient) {
    this.client =
      client ??
      new TapClient({
        baseUrl: NASA_EXOPLANET_PROVIDER_INFO.tapEndpoint!,
        defaultFormat: "json",
        minIntervalMs: 250,
      });
  }

  public buildHabitableZoneAdql(limit = 100): string {
    return `
      SELECT TOP ${limit}
        pl_name, hostname, discoverymethod, disc_year, pl_orbper, pl_orbsmax,
        pl_rade, pl_bmasse, pl_orbeccen, pl_orbincl, pl_eqt, pl_insol,
        st_spectype, st_teff, st_mass, st_rad, ra, dec, sy_dist, sy_disterr1, sy_plx
      FROM pscomppars
      WHERE pl_insol BETWEEN 0.2 AND 2.0
      AND pl_rade BETWEEN 0.5 AND 2.5
      ORDER BY sy_dist ASC
    `.trim();
  }

  public normalizeRecord(raw: Record<string, unknown>): CanonicalAstronomicalObject {
    const plName = String(raw.pl_name);
    const hostname = String(raw.hostname);
    const raDeg = Number(raw.ra);
    const decDeg = Number(raw.dec);
    const distPc = Number(raw.sy_dist);
    const distLy = distPc * 3.261563777;
    const distErrPc = raw.sy_disterr1 != null ? Number(raw.sy_disterr1) : null;
    const distErrLy = distErrPc ? distErrPc * 3.261563777 : null;

    const galacticCoords = coordinates.icrsToGalactic(raDeg, decDeg);
    const cartesianPos = coordinates.sphericalToCartesian(
      galacticCoords.l,
      galacticCoords.b,
      distLy,
    );

    const rade = raw.pl_rade != null ? Number(raw.pl_rade) : null;
    const bmasse = raw.pl_bmasse != null ? Number(raw.pl_bmasse) : null;
    const semiMajorAxis = raw.pl_orbsmax != null ? Number(raw.pl_orbsmax) : null;
    const eqt = raw.pl_eqt != null ? Number(raw.pl_eqt) : null;
    const insol = raw.pl_insol != null ? Number(raw.pl_insol) : null;

    // Subtype classification
    let subtype = "exoplanet";
    if (rade != null) {
      if (rade < 1.25) subtype = "terrestrial_rocky";
      else if (rade < 2.0) subtype = "super_earth";
      else if (rade < 6.0) subtype = "sub_neptune";
      else subtype = "gas_giant";
    }

    const flags: string[] = [];
    if (raw.discoverymethod)
      flags.push(`DISCOVERY_${String(raw.discoverymethod).toUpperCase().replace(/\s+/g, "_")}`);
    if (insol && insol >= 0.25 && insol <= 1.5) flags.push("POTENTIALLY_HABITABLE_ZONE");

    return {
      canonicalId: `URN:ASTRO:EXO:${plName.toUpperCase().replace(/\s+/g, "-")}`,
      name: plName,
      alternateNames: [plName, `${hostname} planet`],
      objectType: "exoplanet",
      subtype,
      parentHostId: `URN:ASTRO:STAR:${hostname.toUpperCase().replace(/\s+/g, "-")}`,
      status: "observational",
      classificationConfidence: 0.99,
      dataQualityFlags: flags,

      raDeg,
      decDeg,
      coordinateFrame: "ICRS",
      referenceEpoch: "J2000.0",

      galacticCartesianLy: {
        x: cartesianPos.x,
        y: cartesianPos.y,
        z: cartesianPos.z,
      },

      distanceLy: distLy,
      distanceUncertaintyLy: distErrLy,
      distanceMethod: "trigonometric_parallax",
      parallaxMas: raw.sy_plx != null ? Number(raw.sy_plx) : null,
      parallaxErrorMas: null,
      properMotionRaMasYr: null,
      properMotionDecMasYr: null,
      radialVelocityKmS: null,
      redshift: null,
      redshiftUncertainty: null,

      physicalProperties: {
        radiusEarth: rade,
        massEarth: bmasse,
        equilibriumTemperatureK: eqt,
        insolationFluxEarth: insol,
      },

      orbitalElements: {
        semiMajorAxisAu: semiMajorAxis,
        eccentricity: raw.pl_orbeccen != null ? Number(raw.pl_orbeccen) : null,
        inclinationDeg: raw.pl_orbincl != null ? Number(raw.pl_orbincl) : null,
        orbitalPeriodDays: raw.pl_orbper != null ? Number(raw.pl_orbper) : null,
      },

      spatialTileId: `tile_l1_${Math.floor(raDeg / 30)}_${Math.floor((decDeg + 90) / 30)}`,

      provenance: {
        sourceCatalog: "nasa_exoplanet_archive",
        sourceId: plName,
        sourceUrl: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(hostname)}`,
        catalogVersion: NASA_EXOPLANET_PROVIDER_INFO.version,
        retrievalTimestamp: new Date().toISOString(),
        license: NASA_EXOPLANET_PROVIDER_INFO.license,
        attribution: NASA_EXOPLANET_PROVIDER_INFO.attribution,
        bibcode: NASA_EXOPLANET_PROVIDER_INFO.bibcode,
      },
    };
  }

  public getBenchmarkExoplanets(): CanonicalAstronomicalObject[] {
    return Object.values(NASA_BENCHMARK_EXOPLANETS).map((raw) => this.normalizeRecord(raw));
  }
}
