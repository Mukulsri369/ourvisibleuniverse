/**
 * Precision Compact-Object Physics & Relativistic Spacetime Formulations
 *
 * Standards & Grounding:
 *  - Schwarzschild metric (1916): R_s = 2GM / c^2
 *  - Kerr metric (1963): R_+ = (GM/c^2) * (1 + sqrt(1 - a*^2))
 *  - Bardeen, Press, Teukolsky (1972): Innermost Stable Circular Orbit (ISCO)
 *  - Cunningham & Bardeen (1973): Geodesic ray deflection and relativistic transfer
 *  - Tolman-Oppenheimer-Volkoff (TOV) limit: Neutron star mass & radius bounds
 *  - Goldreich-Julian (1969) & Manchester et al. (ATNF): Pulsar spin-down and magnetic dipole
 *  - Abbott et al. (LIGO-Virgo-KAGRA Collaboration): Gravitational-wave parameters
 */

import {
  SPEED_OF_LIGHT_M_S,
  GRAVITATIONAL_CONSTANT_SI,
  METERS_PER_LIGHT_YEAR,
  NOMINAL_SOLAR_MASS_KG,
} from "./constants";

export interface BlackHoleMetrics {
  massSolar: number;
  massKg: number;
  spinDimensionless: number; // a* = c J / (G M^2), -1.0 to +1.0
  gravitationalRadiusMeters: number; // r_g = GM / c^2
  schwarzschildRadiusMeters: number; // R_s = 2GM / c^2
  schwarzschildRadiusLy: number;
  kerrHorizonRadiusMeters: number; // R_+
  kerrHorizonRadiusLy: number;
  ergosphereEquatorMeters: number;
  photonSphereRadiusMeters: number; // for a=0: 1.5 R_s = 3 r_g
  criticalImpactParameterMeters: number; // b_crit = sqrt(27) * r_g ≈ 5.196 * r_g
  apparentShadowDiameterMeters: number; // 2 * b_crit
  iscoRadiusMeters: number; // r_isco(a)
  iscoRadiusInRg: number;
  iscoOrbitalPeriodSeconds: number;
  gravitationalRedshiftAtISCO: number;
}

export interface PulsarMetrics {
  spinPeriodSec: number;
  periodDot: number;
  spinFrequencyHz: number;
  surfaceMagneticFieldGauss: number;
  characteristicAgeYears: number;
  spinDownLuminosityWatts: number;
  lightCylinderRadiusKm: number;
  corotationRadiusKm: number;
}

export interface GravitationalWaveMetrics {
  m1Solar: number;
  m2Solar: number;
  mFinalSolar: number;
  chirpMassSolar: number;
  radiatedMassSolar: number;
  radiatedEnergyJoules: number;
  luminosityDistanceMly: number;
  skyAreaDeg2: number;
}

/**
 * Calculates exact gravitational radius r_g = G * M / c^2 in SI meters.
 */
export function gravitationalRadius(massSolar: number): number {
  const mKg = massSolar * NOMINAL_SOLAR_MASS_KG;
  return (GRAVITATIONAL_CONSTANT_SI * mKg) / (SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S);
}

/**
 * Calculates standard Schwarzschild radius R_s = 2 * G * M / c^2 in meters.
 * Benchmark: 1 M_sun ≈ 2,953.25 meters (~2.953 km).
 */
export function calculateSchwarzschildRadius(massSolar: number): number {
  return 2 * gravitationalRadius(massSolar);
}

/**
 * Calculates outer Kerr event horizon R_+ = r_g * (1 + sqrt(1 - a*^2)).
 * Clamped to |a*| <= 0.998 (Thorne 1974 astrophysical limit).
 */
export function calculateKerrHorizon(massSolar: number, spinDimensionless = 0): number {
  const rg = gravitationalRadius(massSolar);
  const aClamped = Math.max(-0.998, Math.min(0.998, spinDimensionless));
  const disc = Math.max(0, 1 - aClamped * aClamped);
  return rg * (1 + Math.sqrt(disc));
}

/**
 * Calculates the ergosphere radius at polar angle theta (radians).
 * R_ergo(theta) = r_g * (1 + sqrt(1 - a*^2 * cos^2(theta))).
 * At equator (theta = pi/2): R_ergo = 2 * r_g = R_s for any spin.
 * At poles (theta = 0, pi): R_ergo = R_+ (touches event horizon).
 */
export function calculateErgosphereRadius(
  massSolar: number,
  spinDimensionless: number,
  thetaRad: number = Math.PI / 2,
): number {
  const rg = gravitationalRadius(massSolar);
  const aClamped = Math.max(-0.998, Math.min(0.998, spinDimensionless));
  const cosT = Math.cos(thetaRad);
  const disc = Math.max(0, 1 - aClamped * aClamped * cosT * cosT);
  return rg * (1 + Math.sqrt(disc));
}

/**
 * Calculates Innermost Stable Circular Orbit (ISCO) using the analytical
 * Bardeen, Press & Teukolsky (1972) solution.
 * For a* = 0 (Schwarzschild): r_isco = 6 r_g = 3 R_s.
 * For a* = +0.998 (extreme prograde): r_isco ≈ 1.23 r_g ≈ 0.615 R_s.
 * For a* = -1.0 (extreme retrograde): r_isco = 9 r_g = 4.5 R_s.
 */
export function calculateISCORadius(
  massSolar: number,
  spinDimensionless = 0,
): {
  radiusMeters: number;
  radiusInRg: number;
} {
  const rg = gravitationalRadius(massSolar);
  const a = Math.max(-0.998, Math.min(0.998, spinDimensionless));
  const absA = Math.abs(a);

  // Bardeen auxiliary variables Z1 and Z2
  const z1Term1 = Math.pow(1 - absA * absA, 1 / 3);
  const z1Term2 = Math.pow(1 + absA, 1 / 3) + Math.pow(Math.max(1e-12, 1 - absA), 1 / 3);
  const z1 = 1 + z1Term1 * z1Term2;
  const z2 = Math.sqrt(Math.max(0, 3 * a * a + z1 * z1));

  // Sign: minus for prograde (a > 0), plus for retrograde (a < 0)
  const sign = a >= 0 ? -1 : 1;
  const termRoot = Math.max(0, (3 - z1) * (3 + z1 + 2 * z2));
  const rISCOInRg = 3 + z2 + sign * Math.sqrt(termRoot);

  return {
    radiusMeters: rISCOInRg * rg,
    radiusInRg: rISCOInRg,
  };
}

/**
 * Calculates the photon sphere radius and critical impact parameter.
 * For non-spinning Schwarzschild:
 *  r_ph = 3 r_g = 1.5 R_s
 *  b_crit = sqrt(27) * r_g ≈ 5.196152 r_g ≈ 2.598076 R_s
 *  The apparent black hole shadow radius viewed from infinity is b_crit.
 */
export function calculatePhotonSphere(
  massSolar: number,
  spinDimensionless = 0,
): {
  rPhotonMeters: number;
  bCritMeters: number;
  shadowDiameterMeters: number;
} {
  const rg = gravitationalRadius(massSolar);
  const a = Math.max(-0.998, Math.min(0.998, spinDimensionless));

  // Equatorial prograde/retrograde photon orbit approximation
  // for a=0: r_ph = 3 r_g
  const rPhotonMeters = 3 * rg * (1 - 0.33 * a);
  // Shadow radius b_crit ≈ sqrt(27) * rg ≈ 5.196 * rg (distorts by ~15% for extreme spin)
  const bCritMeters = Math.sqrt(27) * rg * (1 - 0.08 * a);
  return {
    rPhotonMeters,
    bCritMeters,
    shadowDiameterMeters: 2 * bCritMeters,
  };
}

/**
 * Calculates relativistic gravitational redshift z_grav at radial distance r:
 * 1 + z_grav = 1 / sqrt(1 - 2GM / (r c^2)) = 1 / sqrt(1 - R_s / r)
 */
export function calculateGravitationalRedshift(massSolar: number, radiusMeters: number): number {
  const rs = calculateSchwarzschildRadius(massSolar);
  if (radiusMeters <= rs) return Infinity;
  const factor = 1 - rs / radiusMeters;
  return 1 / Math.sqrt(factor) - 1;
}

/**
 * Calculates relativistic Doppler boosting factor:
 * delta = 1 / (gamma * (1 - beta * cos(theta)))
 * Beaming intensity amplification: I_obs / I_emit = delta^(3 + alpha)
 * where alpha is the spectral index (typically ~1.0 for synchrotron plasma).
 */
export function calculateDopplerBeaming(
  velocityOverC: number,
  viewingAngleRad: number,
  spectralIndex = 1.0,
): {
  delta: number;
  intensityFactor: number;
  gamma: number;
} {
  const beta = Math.max(0, Math.min(0.9999, Math.abs(velocityOverC)));
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const cosTheta = Math.cos(viewingAngleRad);
  const delta = 1 / (gamma * (1 - beta * cosTheta));
  const intensityFactor = Math.pow(delta, 3 + spectralIndex);
  return { delta, intensityFactor, gamma };
}

/**
 * Complete metrics builder for any black hole object.
 */
export function getBlackHoleMetrics(massSolar: number, spinDimensionless = 0): BlackHoleMetrics {
  const massKg = massSolar * NOMINAL_SOLAR_MASS_KG;
  const rg = gravitationalRadius(massSolar);
  const rs = calculateSchwarzschildRadius(massSolar);
  const rPlus = calculateKerrHorizon(massSolar, spinDimensionless);
  const ergoEq = calculateErgosphereRadius(massSolar, spinDimensionless, Math.PI / 2);
  const { rPhotonMeters, bCritMeters, shadowDiameterMeters } = calculatePhotonSphere(
    massSolar,
    spinDimensionless,
  );
  const { radiusMeters: iscoMeters, radiusInRg: iscoRg } = calculateISCORadius(
    massSolar,
    spinDimensionless,
  );

  // Keplerian orbital period at ISCO: T = 2*pi * sqrt(r^3 / (G*M)) + 2*pi*a*rg/c
  const orbitalPeriod =
    2 * Math.PI * Math.sqrt(Math.pow(iscoMeters, 3) / (GRAVITATIONAL_CONSTANT_SI * massKg));
  const zISCO = calculateGravitationalRedshift(massSolar, iscoMeters);

  return {
    massSolar,
    massKg,
    spinDimensionless,
    gravitationalRadiusMeters: rg,
    schwarzschildRadiusMeters: rs,
    schwarzschildRadiusLy: rs / METERS_PER_LIGHT_YEAR,
    kerrHorizonRadiusMeters: rPlus,
    kerrHorizonRadiusLy: rPlus / METERS_PER_LIGHT_YEAR,
    ergosphereEquatorMeters: ergoEq,
    photonSphereRadiusMeters: rPhotonMeters,
    criticalImpactParameterMeters: bCritMeters,
    apparentShadowDiameterMeters: shadowDiameterMeters,
    iscoRadiusMeters: iscoMeters,
    iscoRadiusInRg: iscoRg,
    iscoOrbitalPeriodSeconds: orbitalPeriod,
    gravitationalRedshiftAtISCO: zISCO,
  };
}

/**
 * Calculates pulsar electrodynamics & spin-down properties from P and P-dot.
 * Standard equations:
 *  - B_surf = 3.2e19 * sqrt(P * P_dot) Gauss
 *  - Characteristic age tau = P / (2 * P_dot)
 *  - Spin-down luminosity E_dot = 4 * pi^2 * I * P_dot / P^3 (with I ≈ 1e38 kg m^2)
 *  - Light cylinder radius R_LC = c * P / (2*pi)
 */
export function getPulsarMetrics(periodSec: number, periodDot: number): PulsarMetrics {
  const p = Math.max(0.001, periodSec);
  const pDot = Math.max(1e-25, periodDot);
  const freq = 1 / p;

  // Surface magnetic dipole field in Gauss (Manchester et al. ATNF standard)
  const surfaceB = 3.2e19 * Math.sqrt(p * pDot);

  // Characteristic spin-down age in seconds -> Julian years
  const ageSec = p / (2 * pDot);
  const ageYears = ageSec / (365.25 * 86400);

  // Moment of inertia for canonical 1.4 M_sun, 12 km neutron star: I ≈ 1e38 kg m^2
  const I_NS = 1.0e38;
  const eDotWatts = (4 * Math.PI * Math.PI * I_NS * pDot) / (p * p * p);

  // Light cylinder radius in km: R_LC = c / omega = c * P / (2*pi)
  const rLightCylinderKm = (SPEED_OF_LIGHT_M_S * p) / (2 * Math.PI * 1000);

  // Corotation radius in km for Keplerian orbit matching star spin
  const mNSKg = 1.4 * NOMINAL_SOLAR_MASS_KG;
  const rCorotationKm =
    Math.pow((GRAVITATIONAL_CONSTANT_SI * mNSKg * p * p) / (4 * Math.PI * Math.PI), 1 / 3) / 1000;

  return {
    spinPeriodSec: p,
    periodDot: pDot,
    spinFrequencyHz: freq,
    surfaceMagneticFieldGauss: surfaceB,
    characteristicAgeYears: ageYears,
    spinDownLuminosityWatts: eDotWatts,
    lightCylinderRadiusKm: rLightCylinderKm,
    corotationRadiusKm: rCorotationKm,
  };
}

/**
 * Calculates gravitational-wave parameters from progenitor masses.
 * Chirp mass: M_chirp = (m1 * m2)^(3/5) / (m1 + m2)^(1/5)
 * Radiated energy in solar masses: Delta M = m1 + m2 - m_final
 */
export function getGravitationalWaveMetrics(
  m1Solar: number,
  m2Solar: number,
  mFinalSolar: number,
  distanceMly: number,
  skyAreaDeg2: number,
): GravitationalWaveMetrics {
  const m1 = Math.max(0.1, m1Solar);
  const m2 = Math.max(0.1, m2Solar);
  const mTot = m1 + m2;
  const chirpMass = Math.pow(m1 * m2, 3 / 5) / Math.pow(mTot, 1 / 5);
  const radiatedMass = Math.max(0, mTot - mFinalSolar);
  const radiatedJoules =
    radiatedMass * NOMINAL_SOLAR_MASS_KG * SPEED_OF_LIGHT_M_S * SPEED_OF_LIGHT_M_S;

  return {
    m1Solar: m1,
    m2Solar: m2,
    mFinalSolar,
    chirpMassSolar: chirpMass,
    radiatedMassSolar: radiatedMass,
    radiatedEnergyJoules: radiatedJoules,
    luminosityDistanceMly: distanceMly,
    skyAreaDeg2,
  };
}

/**
 * Analytical gravitational light deflection angle theta_def (Einstein formula
 * with strong-field Darwin approximation):
 * alpha(b) = 4GM / (c^2 * b) * [ 1 + (15*pi / 16) * (r_g / b) ]
 */
export function calculateGravitationalDeflectionAngle(
  massSolar: number,
  impactParameterMeters: number,
): number {
  const rg = gravitationalRadius(massSolar);
  if (impactParameterMeters <= Math.sqrt(27) * rg) {
    return Math.PI * 2; // Captured inside critical curve
  }
  const u = rg / impactParameterMeters;
  const weakDeflection = 4 * u;
  const secondOrder = ((15 * Math.PI) / 16) * u * u;
  return weakDeflection + secondOrder;
}
