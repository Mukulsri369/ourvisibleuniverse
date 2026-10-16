/**
 * Astronomical Coordinate Reference Systems (CRS) & Epoch Framework
 * Reference: IAU Standards of Fundamental Astronomy (SOFA), Astropy Coordinates
 *
 * Implements:
 *  1. ICRS / ICRF (International Celestial Reference System) - Barycentric
 *  2. Heliocentric Ecliptic J2000 - Sun-centered
 *  3. Planetocentric / Topocentric Local Frames - Body-centered
 *  4. IAU Galactic Reference Frame (l, b, d)
 *  5. Extragalactic Comoving & Cosmological Horizon
 *  6. Timescales: UTC, TT, and TDB
 */

import {
  METERS_PER_AU,
  METERS_PER_LIGHT_YEAR,
  SPEED_OF_LIGHT_M_S,
  J2000_EPOCH_MS,
  J2000_JD,
  GALACTIC_CENTER_REFERENCE_LY,
} from "./constants";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// --- Timescale & Epoch Handling ---------------------------------------------
export type Timescale = "UTC" | "TT" | "TDB";

export interface AstronomicalEpoch {
  readonly dateUtc: Date;
  readonly jd: number; // Julian Date (UTC)
  readonly tdbDaysSinceJ2000: number; // Days since J2000.0 (TDB)
  readonly julianYearsSinceJ2000: number; // Julian years since J2000.0
  readonly timescale: Timescale;
}

/**
 * Computes Julian Date from UTC Date object.
 */
export function dateToJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2440587.5;
}

/**
 * Creates an astronomical epoch with UTC, TT, and TDB offsets.
 * TT = UTC + Delta_AT + 32.184s (approx +69.184s in 2024-2026).
 * TDB differs from TT by periodic relativistic variations (< 1.7 ms), which is negligible
 * for visual atlas purposes, but tracked for formal precision.
 */
export function createEpoch(
  date: Date = new Date(),
  timescale: Timescale = "TDB",
): AstronomicalEpoch {
  const jd = dateToJulianDate(date);
  const msSinceJ2000 = date.getTime() - J2000_EPOCH_MS;
  const daysSinceJ2000 = msSinceJ2000 / 86_400_000;
  const julianYearsSinceJ2000 = daysSinceJ2000 / 365.25;

  return {
    dateUtc: date,
    jd,
    tdbDaysSinceJ2000: daysSinceJ2000,
    julianYearsSinceJ2000,
    timescale,
  };
}

// --- Coordinate Frame Definitions -------------------------------------------
export type ReferenceFrameType =
  "ICRS" | "HeliocentricEcliptic" | "Planetocentric" | "Galactic" | "ExtragalacticComoving";

export interface SphericalCoordinates {
  readonly lonDeg: number; // RA or l
  readonly latDeg: number; // Dec or b
  readonly distance: number; // in light-years unless specified
}

export interface CartesianVector64 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

// --- IAU J2000 Galactic Pole Rotation Constants -----------------------------
const RA_NGP_RAD = 192.85948 * DEG_TO_RAD;
const DEC_NGP_RAD = 27.12825 * DEG_TO_RAD;
const THETA_0_RAD = 122.93192 * DEG_TO_RAD;

const SIN_DEC_NGP = Math.sin(DEC_NGP_RAD);
const COS_DEC_NGP = Math.cos(DEC_NGP_RAD);

/**
 * 1. ICRS (RA, Dec, d) -> Galactic (l, b, d)
 */
export function icrsToGalacticSpherical(
  raDeg: number,
  decDeg: number,
  distanceLy: number,
): SphericalCoordinates {
  const ra = raDeg * DEG_TO_RAD;
  const dec = decDeg * DEG_TO_RAD;

  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const deltaRA = ra - RA_NGP_RAD;

  const sinB = sinDec * SIN_DEC_NGP + cosDec * COS_DEC_NGP * Math.cos(deltaRA);
  const bRad = Math.asin(Math.max(-1, Math.min(1, sinB)));

  const y = cosDec * Math.sin(deltaRA);
  const x = sinDec * COS_DEC_NGP - cosDec * SIN_DEC_NGP * Math.cos(deltaRA);

  let lRad = THETA_0_RAD - Math.atan2(y, x);
  if (lRad < 0) lRad += 2 * Math.PI;
  if (lRad >= 2 * Math.PI) lRad -= 2 * Math.PI;

  return {
    lonDeg: lRad * RAD_TO_DEG,
    latDeg: bRad * RAD_TO_DEG,
    distance: distanceLy,
  };
}

/**
 * 2. Galactic (l, b, d) -> Cartesian in Light-Years
 * Supports both standard IAU right-handed Cartesian (X toward GC) and
 * the application's scene convention (invertX: X away from GC so Sgr A* sits at -X).
 */
export function galacticToCartesian64(
  lDeg: number,
  bDeg: number,
  distanceLy: number,
  invertX = true,
): CartesianVector64 {
  const lr = lDeg * DEG_TO_RAD;
  const br = bDeg * DEG_TO_RAD;
  const cosB = Math.cos(br);

  const xVal = distanceLy * cosB * Math.cos(lr);
  const yVal = distanceLy * Math.sin(br);
  const zVal = distanceLy * cosB * Math.sin(lr);

  return {
    x: invertX ? -xVal : xVal,
    y: yVal,
    z: zVal,
  };
}

/**
 * 3. Heliocentric Ecliptic -> Cartesian in Astronomical Units (AU)
 * x toward vernal equinox, y in ecliptic plane, z toward North Ecliptic Pole.
 */
export function heliocentricEclipticToCartesianAU(
  longitudeRad: number,
  latitudeRad: number,
  radiusAU: number,
): CartesianVector64 {
  const cosB = Math.cos(latitudeRad);
  return {
    x: radiusAU * cosB * Math.cos(longitudeRad),
    y: radiusAU * Math.sin(latitudeRad),
    z: radiusAU * cosB * Math.sin(longitudeRad),
  };
}

/**
 * 4. Planetocentric Local Frame
 * Represents an offset vector (in km or AU) relative to the planet's physical center,
 * taking into account axial tilt and prime meridian spin.
 */
export function planetocentricToParentAU(
  planetCenterAU: CartesianVector64,
  localOffsetKm: CartesianVector64,
  axialTiltRad: number,
  spinRotationRad: number,
): CartesianVector64 {
  const kmToAU = 1_000 / METERS_PER_AU;
  const lx = localOffsetKm.x * kmToAU;
  const ly = localOffsetKm.y * kmToAU;
  const lz = localOffsetKm.z * kmToAU;

  // Rotate around Y by spinRotationRad
  const cosSpin = Math.cos(spinRotationRad);
  const sinSpin = Math.sin(spinRotationRad);
  const rx = lx * cosSpin - lz * sinSpin;
  const rz = lx * sinSpin + lz * cosSpin;

  // Tilt around X by axialTiltRad
  const cosTilt = Math.cos(axialTiltRad);
  const sinTilt = Math.sin(axialTiltRad);
  const finalY = ly * cosTilt - rz * sinTilt;
  const finalZ = ly * sinTilt + rz * cosTilt;

  return {
    x: planetCenterAU.x + rx,
    y: planetCenterAU.y + finalY,
    z: planetCenterAU.z + finalZ,
  };
}

/**
 * 5. Cosmological Comoving Coordinates & Hubble Expansion
 * Standard LCDM cosmology: H0 = 67.4 km/s/Mpc (Planck 2018), Omega_M = 0.315, Omega_Lambda = 0.685.
 * Computes comoving distance from cosmological redshift z (for z < 10).
 */
export const COSMOLOGY_PLANCK_2018 = {
  hubbleConstantKmSMpc: 67.4,
  omegaMatter: 0.315,
  omegaLambda: 0.685,
  observableUniverseRadiusGly: 46.5, // Comoving particle horizon ≈ 46.5 Gly (~14.26 Gpc)
};

export function redshiftToComovingDistanceMly(z: number): number {
  if (z <= 0) return 0;
  // Numerical quadrature of E(z') = sqrt(Omega_M * (1+z')^3 + Omega_Lambda)
  const cKmS = SPEED_OF_LIGHT_M_S / 1_000;
  const H0 = COSMOLOGY_PLANCK_2018.hubbleConstantKmSMpc;
  const steps = 60;
  const dz = z / steps;
  let integral = 0;

  for (let i = 0; i < steps; i++) {
    const zi = (i + 0.5) * dz;
    const Ez = Math.sqrt(
      COSMOLOGY_PLANCK_2018.omegaMatter * Math.pow(1 + zi, 3) + COSMOLOGY_PLANCK_2018.omegaLambda,
    );
    integral += (1 / Ez) * dz;
  }

  const dMpc = (cKmS / H0) * integral;
  const dMly = dMpc * 3.2615638;
  return dMly;
}
