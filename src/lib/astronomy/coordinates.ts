/**
 * Precision Astronomical Coordinate Transformations & Celestial Mechanics Solvers
 * Sourced from:
 *  - Meeus, "Astronomical Algorithms" (2nd ed.)
 *  - Murray & Dermott, "Solar System Dynamics"
 *  - ESA Gaia DR3 Coordinate Transformation Specifications
 */

import {
  GRAVITATIONAL_CONSTANT_SI,
  METERS_PER_LIGHT_YEAR,
  SOLAR_EFFECTIVE_TEMPERATURE_K,
  SOLAR_MASS_KG,
  SPEED_OF_LIGHT_M_S,
  STEFAN_BOLTZMANN_SI,
} from "./constants";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// --- IAU Galactic Coordinate System Definition (J2000) ---------------------
// North Galactic Pole (NGP, J2000): RA = 192.85948°, Dec = +27.12825°
const RA_NGP_RAD = 192.85948 * DEG_TO_RAD;
const DEC_NGP_RAD = 27.12825 * DEG_TO_RAD;
// Position angle of NGP at J2000 (l = 122.93192°)
const THETA_0_RAD = 122.93192 * DEG_TO_RAD;

const SIN_DEC_NGP = Math.sin(DEC_NGP_RAD);
const COS_DEC_NGP = Math.cos(DEC_NGP_RAD);

/**
 * Transforms ICRS equatorial coordinates (RA, Dec) at J2000 to IAU Galactic coordinates (l, b).
 * @param raDeg Right Ascension in degrees (0 to 360)
 * @param decDeg Declination in degrees (-90 to +90)
 * @returns { l: number, b: number } Galactic longitude and latitude in degrees
 */
export function icrsToGalactic(raDeg: number, decDeg: number): { l: number; b: number } {
  const ra = raDeg * DEG_TO_RAD;
  const dec = decDeg * DEG_TO_RAD;

  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const deltaRA = ra - RA_NGP_RAD;

  // sin(b) = sin(dec) * sin(dec_NGP) + cos(dec) * cos(dec_NGP) * cos(ra - ra_NGP)
  const sinB = sinDec * SIN_DEC_NGP + cosDec * COS_DEC_NGP * Math.cos(deltaRA);
  const bRad = Math.asin(Math.max(-1, Math.min(1, sinB)));

  // cos(b) * sin(theta_0 - l) = cos(dec) * sin(ra - ra_NGP)
  // cos(b) * cos(theta_0 - l) = sin(dec) * cos(dec_NGP) - cos(dec) * sin(dec_NGP) * cos(ra - ra_NGP)
  const y = cosDec * Math.sin(deltaRA);
  const x = sinDec * COS_DEC_NGP - cosDec * SIN_DEC_NGP * Math.cos(deltaRA);

  let lRad = THETA_0_RAD - Math.atan2(y, x);
  if (lRad < 0) lRad += 2 * Math.PI;
  if (lRad >= 2 * Math.PI) lRad -= 2 * Math.PI;

  return {
    l: lRad * RAD_TO_DEG,
    b: bRad * RAD_TO_DEG,
  };
}

/**
 * Transforms IAU Galactic coordinates (l, b) to ICRS equatorial coordinates (RA, Dec) at J2000.
 * @param lDeg Galactic longitude in degrees (0 to 360)
 * @param bDeg Galactic latitude in degrees (-90 to +90)
 * @returns { ra: number, dec: number } Right Ascension and Declination in degrees
 */
export function galacticToIcrs(lDeg: number, bDeg: number): { ra: number; dec: number } {
  const l = lDeg * DEG_TO_RAD;
  const b = bDeg * DEG_TO_RAD;

  const sinB = Math.sin(b);
  const cosB = Math.cos(b);
  const deltaL = l - THETA_0_RAD;

  const sinDec = sinB * SIN_DEC_NGP + cosB * COS_DEC_NGP * Math.cos(deltaL);
  const decRad = Math.asin(Math.max(-1, Math.min(1, sinDec)));

  const y = cosB * Math.sin(deltaL);
  const x = sinB * COS_DEC_NGP - cosB * SIN_DEC_NGP * Math.cos(deltaL);

  let raRad = RA_NGP_RAD - Math.atan2(y, x);
  if (raRad < 0) raRad += 2 * Math.PI;
  if (raRad >= 2 * Math.PI) raRad -= 2 * Math.PI;

  return {
    ra: raRad * RAD_TO_DEG,
    dec: decRad * RAD_TO_DEG,
  };
}

/**
 * Converts Galactic coordinates (l, b, distance) to 3D Cartesian coordinates.
 * @param lDeg Galactic longitude in degrees (0 to 360)
 * @param bDeg Galactic latitude in degrees (-90 to +90)
 * @param distance Distance from Sun (e.g. in light-years)
 * @param invertX If true, points Galactic Center (l=0) along -X (matches existing app scene convention)
 * @returns { x: number, y: number, z: number } Cartesian coordinates in scene/light-year units
 */
export function galacticToCartesian(
  lDeg: number,
  bDeg: number,
  distance: number,
  invertX = true,
): { x: number; y: number; z: number } {
  const lr = lDeg * DEG_TO_RAD;
  const br = bDeg * DEG_TO_RAD;
  const cosB = Math.cos(br);

  const xVal = distance * cosB * Math.cos(lr);
  const yVal = distance * Math.sin(br);
  const zVal = distance * cosB * Math.sin(lr);

  return {
    x: invertX ? -xVal : xVal,
    y: yVal,
    z: zVal,
  };
}

/**
 * High-precision Newton-Raphson Kepler Equation Solver.
 * Solves: M = E - e * sin(E) for Eccentric Anomaly E given Mean Anomaly M and Eccentricity e.
 *
 * @param meanAnomalyRad Mean anomaly in radians
 * @param eccentricity Orbital eccentricity (0 <= e < 1 for elliptical orbits)
 * @param tolerance Convergence threshold in radians (defaults to 1e-12)
 * @param maxIterations Maximum Newton-Raphson iterations (defaults to 15)
 * @returns Eccentric Anomaly E in radians
 */
export function solveKepler(
  meanAnomalyRad: number,
  eccentricity: number,
  tolerance = 1e-12,
  maxIterations = 15,
): number {
  // Normalize M to [0, 2*pi)
  let M = meanAnomalyRad % (2 * Math.PI);
  if (M < 0) M += 2 * Math.PI;

  const e = Math.max(0, Math.min(0.999999, eccentricity));

  // High-order initial guess (Prussing / Danby approximation)
  let E = e < 0.8 ? M : Math.PI;

  for (let i = 0; i < maxIterations; i++) {
    const f = E - e * Math.sin(E) - M;
    if (Math.abs(f) < tolerance) break;
    const fPrime = 1 - e * Math.cos(E);
    // Halley's method (second-order Newton-Raphson) for cubic convergence
    const fDoublePrime = e * Math.sin(E);
    const delta = f / fPrime;
    E -= delta / (1 - 0.5 * delta * (fDoublePrime / fPrime));
  }

  return E;
}

/**
 * Computes True Anomaly nu from Eccentric Anomaly E and Eccentricity e.
 * @param eccentricAnomalyRad E in radians
 * @param eccentricity e
 * @returns True Anomaly nu in radians [0, 2*pi)
 */
export function trueAnomalyFromEccentric(
  eccentricAnomalyRad: number,
  eccentricity: number,
): number {
  const E = eccentricAnomalyRad;
  const e = eccentricity;
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  const sinNu = (Math.sqrt(1 - e * e) * sinE) / (1 - e * cosE);
  const cosNu = (cosE - e) / (1 - e * cosE);

  let nu = Math.atan2(sinNu, cosNu);
  if (nu < 0) nu += 2 * Math.PI;
  return nu;
}

/**
 * Solves Keplerian 3D position in the perifocal and heliocentric orbital frame.
 * @param semiMajorAxisAU Semi-major axis in AU
 * @param eccentricity Eccentricity
 * @param inclinationRad Orbital inclination in radians
 * @param argPerihelionRad Argument of perihelion in radians
 * @param longAscNodeRad Longitude of ascending node in radians
 * @param meanAnomalyRad Mean anomaly in radians
 * @returns 3D heliocentric position vector { x, y, z } in AU
 */
export function keplerianOrbitalPositionAU(
  semiMajorAxisAU: number,
  eccentricity: number,
  inclinationRad: number,
  argPerihelionRad: number,
  longAscNodeRad: number,
  meanAnomalyRad: number,
): { x: number; y: number; z: number } {
  const E = solveKepler(meanAnomalyRad, eccentricity);
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);

  // Position in orbital plane (perifocal coords)
  const a = semiMajorAxisAU;
  const e = eccentricity;
  const xp = a * (cosE - e);
  const yp = a * Math.sqrt(1 - e * e) * sinE;

  // Euler angles rotation to reference plane
  const w = argPerihelionRad;
  const node = longAscNodeRad;
  const i = inclinationRad;

  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);

  // Heliocentric ecliptic coordinates
  const Px = cosNode * cosW - sinNode * sinW * cosI;
  const Py = sinNode * cosW + cosNode * sinW * cosI;
  const Pz = sinW * sinI;

  const Qx = -cosNode * sinW - sinNode * cosW * cosI;
  const Qy = -sinNode * sinW + cosNode * cosW * cosI;
  const Qz = cosW * sinI;

  return {
    x: xp * Px + yp * Qx,
    y: xp * Py + yp * Qy,
    z: xp * Pz + yp * Qz,
  };
}

/**
 * Calculates stellar luminosity from radius and effective temperature using Stefan-Boltzmann law.
 * L / L_sun = (R / R_sun)^2 * (T_eff / T_sun)^4
 * @param radiusSolar Stellar radius in solar radii (R_sun = 1)
 * @param temperatureKelvin Stellar effective surface temperature in Kelvin
 * @returns Stellar luminosity in solar luminosities (L_sun = 1)
 */
export function calculateLuminosity(radiusSolar: number, temperatureKelvin: number): number {
  const rRatio = Math.max(0, radiusSolar);
  const tRatio = Math.max(0, temperatureKelvin) / SOLAR_EFFECTIVE_TEMPERATURE_K;
  return rRatio * rRatio * Math.pow(tRatio, 4);
}

/**
 * Calculates Schwarzschild event horizon radius of a non-rotating black hole.
 * r_s = 2 * G * M / c^2
 * @param massKg Mass in kilograms
 * @returns Radius in meters
 */
export function schwarzschildRadiusMeters(massKg: number): number {
  return (2 * GRAVITATIONAL_CONSTANT_SI * massKg) / (SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S);
}

/**
 * Calculates Schwarzschild radius expressed in light-years.
 * @param massSolar Mass in solar masses (M_sun = 1)
 * @returns Radius in light-years
 */
export function schwarzschildRadiusLy(massSolar: number): number {
  const massKg = massSolar * SOLAR_MASS_KG;
  const rMeters = schwarzschildRadiusMeters(massKg);
  return rMeters / METERS_PER_LIGHT_YEAR;
}

export const coordinates = {
  icrsToGalactic,
  galacticToIcrs,
  galacticToCartesian,
  sphericalToCartesian: galacticToCartesian,
  solveKepler,
  trueAnomalyFromEccentric,
  keplerianOrbitalPositionAU,
  calculateLuminosity,
  schwarzschildRadiusMeters,
  schwarzschildRadiusLy,
};
