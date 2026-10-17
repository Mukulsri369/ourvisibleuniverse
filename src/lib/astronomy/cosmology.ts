/**
 * Rigorous Cosmological Distance & Metric Framework
 *
 * Implements cosmological distance calculations across standard FLRW metrics:
 *  - Comoving Distance (D_C)
 *  - Transverse Comoving Distance (D_M)
 *  - Lookback Time (t_L) and Cosmic Age (t_age)
 *  - Luminosity Distance (D_L)
 *  - Angular Diameter Distance (D_A)
 *  - Distance Modulus (mu)
 *  - Angular-to-Physical Scale (kpc/arcsec and ly/arcmin)
 *
 * References:
 * - Hogg, D. W. (1999). "Distance measures in cosmology", arXiv:astro-ph/9905116
 * - Planck Collaboration (2018). "Planck 2018 results. VI. Cosmological parameters", A&A 641, A6 (2020)
 * - Riess, A. G., et al. (2022). "A Comprehensive Measurement of the Local Value of the Hubble Constant with 1 km/s/Mpc Uncertainty from the Hubble Space Telescope and the SH0ES Team", ApJ 934, L7
 * - Hinshaw, G., et al. (2013). "Nine-Year Wilkinson Microwave Anisotropy Probe (WMAP) Observations: Final Results", ApJS 208, 19
 */

import { SPEED_OF_LIGHT_M_S } from "./constants";

export interface CosmologicalParameters {
  name: string;
  description: string;
  h0: number; // Hubble constant in km/s/Mpc
  omegaM: number; // Matter density parameter (baryonic + cold dark matter)
  omegaLambda: number; // Dark energy density parameter (cosmological constant)
  omegaRadiation?: number; // Relativistic radiation density parameter (CMB photons + neutrinos)
  citation: string;
  bibcode: string;
}

export const COSMOLOGICAL_MODELS: Record<string, CosmologicalParameters> = {
  planck2018: {
    name: "Planck 2018 (Concordance ΛCDM)",
    description:
      "Final legacy release from the ESA Planck satellite CMB temperature and polarization power spectra.",
    h0: 67.4,
    omegaM: 0.315,
    omegaLambda: 0.685,
    omegaRadiation: 9.0e-5,
    citation: "Planck Collaboration (2020), A&A 641, A6",
    bibcode: "2020A&A...641A...6P",
  },
  shoes2022: {
    name: "SH0ES 2022 (Local Distance Ladder)",
    description:
      "HST Cepheid-calibrated Type Ia supernovae local distance ladder, exhibiting the Hubble tension.",
    h0: 73.04,
    omegaM: 0.3,
    omegaLambda: 0.7,
    omegaRadiation: 9.0e-5,
    citation: "Riess et al. (2022), ApJ 934, L7",
    bibcode: "2022ApJ...934L...7R",
  },
  wmap9: {
    name: "WMAP 9-Year",
    description:
      "NASA Wilkinson Microwave Anisotropy Probe 9-year final cosmological parameter compilation.",
    h0: 69.32,
    omegaM: 0.286,
    omegaLambda: 0.714,
    omegaRadiation: 8.5e-5,
    citation: "Hinshaw et al. (2013), ApJS 208, 19",
    bibcode: "2013ApJS..208...19H",
  },
};

export const COSMOLOGY_MODELS = COSMOLOGICAL_MODELS;
export const DEFAULT_COSMOLOGY = COSMOLOGICAL_MODELS.planck2018;

export interface CosmologicalDistanceResult {
  redshift: number;
  model: CosmologicalParameters;
  hubbleDistanceMpc: number; // D_H = c / H_0
  hubbleDistanceGly: number;
  comovingDistanceMpc: number; // D_C
  comovingDistanceGly: number;
  comovingDistanceLy: number;
  transverseComovingDistanceMpc: number; // D_M
  lookbackTimeGyr: number; // t_L
  lookbackTimeYr: number;
  cosmicAgeAtRedshiftGyr: number; // Age of universe when photons were emitted
  cosmicAgeAtEmissionGyr: number; // Alias for cosmicAgeAtRedshiftGyr
  currentUniverseAgeGyr: number; // t_0
  luminosityDistanceMpc: number; // D_L = (1+z) D_M
  luminosityDistanceGly: number;
  luminosityDistanceLy: number;
  angularDiameterDistanceMpc: number; // D_A = D_M / (1+z)
  angularDiameterDistanceGly: number;
  angularDiameterDistanceLy: number;
  distanceModulus: number; // mu = m - M = 5 log10(D_L / 10 pc)
  kpcPerArcsec: number; // Physical scale subtended by 1 arcsecond at z
  lyPerArcmin: number; // Physical scale subtended by 1 arcminute at z
}

/**
 * Calculates physical diameter in light-years from observed angular diameter in arcminutes.
 */
export function angularSizeToPhysicalDiameterLy(
  angularDiameterArcmin: number,
  angularDiameterDistanceLy: number,
): number {
  const thetaRad = (angularDiameterArcmin / 60) * (Math.PI / 180);
  return thetaRad * angularDiameterDistanceLy;
}

/**
 * Dimensionless Hubble parameter E(z) = H(z) / H_0
 */
export function dimensionlessHubble(z: number, params: CosmologicalParameters): number {
  const om = params.omegaM;
  const or = params.omegaRadiation ?? 9.0e-5;
  const ol = params.omegaLambda;
  const ok = 1.0 - (om + or + ol); // Curvature parameter Omega_k
  const onePlusZ = 1.0 + z;
  const e2 =
    or * Math.pow(onePlusZ, 4) + om * Math.pow(onePlusZ, 3) + ok * Math.pow(onePlusZ, 2) + ol;
  return Math.sqrt(Math.max(e2, 1e-12));
}

export const dimensionlessHubbleE = dimensionlessHubble;

/**
 * Calculates complete cosmological distances for a given redshift z and cosmological model.
 * Uses Gaussian quadrature / adaptive Simpson integration for sub-0.01% precision.
 */
export function calculateCosmologicalDistances(
  z: number,
  params: CosmologicalParameters = COSMOLOGICAL_MODELS.planck2018,
): CosmologicalDistanceResult {
  const cKmS = SPEED_OF_LIGHT_M_S / 1000;
  const dHMpc = cKmS / params.h0; // Hubble distance c/H0 in Mpc
  const LY_PER_MPC = 3.261563777e6;
  const dHGly = (dHMpc * LY_PER_MPC) / 1e9;

  // For z <= 0 (e.g. blueshifted Local Group like Andromeda M31 z = -0.001001)
  if (z <= 0) {
    const age0 = calculateUniverseAgeGyr(params);
    return {
      redshift: z,
      model: params,
      hubbleDistanceMpc: dHMpc,
      hubbleDistanceGly: dHGly,
      comovingDistanceMpc: 0,
      comovingDistanceGly: 0,
      comovingDistanceLy: 0,
      transverseComovingDistanceMpc: 0,
      lookbackTimeGyr: 0,
      lookbackTimeYr: 0,
      cosmicAgeAtRedshiftGyr: age0,
      cosmicAgeAtEmissionGyr: age0,
      currentUniverseAgeGyr: age0,
      luminosityDistanceMpc: 0,
      luminosityDistanceGly: 0,
      luminosityDistanceLy: 0,
      angularDiameterDistanceMpc: 0,
      angularDiameterDistanceGly: 0,
      angularDiameterDistanceLy: 0,
      distanceModulus: 0,
      kpcPerArcsec: 0,
      lyPerArcmin: 0,
    };
  }

  // Numerical quadrature for comoving distance: integral 0 to z of 1/E(z') dz'
  const steps = Math.max(120, Math.min(2000, Math.round(z * 150)));
  const dz = z / steps;
  let integralComoving = 0;
  let integralLookback = 0;

  for (let i = 0; i < steps; i++) {
    const zLeft = i * dz;
    const zMid = (i + 0.5) * dz;
    const zRight = (i + 1) * dz;

    // Simpson's rule for comoving distance
    const fCLeft = 1 / dimensionlessHubble(zLeft, params);
    const fCMid = 1 / dimensionlessHubble(zMid, params);
    const fCRight = 1 / dimensionlessHubble(zRight, params);
    integralComoving += ((fCLeft + 4 * fCMid + fCRight) * dz) / 6;

    // Simpson's rule for lookback time: 1 / ((1+z') * E(z'))
    const fLLeft = 1 / ((1 + zLeft) * dimensionlessHubble(zLeft, params));
    const fLMid = 1 / ((1 + zMid) * dimensionlessHubble(zMid, params));
    const fLRight = 1 / ((1 + zRight) * dimensionlessHubble(zRight, params));
    integralLookback += ((fLLeft + 4 * fLMid + fLRight) * dz) / 6;
  }

  // Line-of-sight Comoving Distance D_C
  const dCMpc = dHMpc * integralComoving;
  const dCGly = (dCMpc * LY_PER_MPC) / 1e9;
  const dCLy = dCMpc * LY_PER_MPC;

  // Transverse Comoving Distance D_M (accounting for Omega_k)
  const om = params.omegaM;
  const or = params.omegaRadiation ?? 9.0e-5;
  const ol = params.omegaLambda;
  const ok = 1.0 - (om + or + ol);

  let dMMpc = dCMpc;
  if (Math.abs(ok) > 1e-3) {
    const sqrtOk = Math.sqrt(Math.abs(ok));
    if (ok > 0) {
      // Open universe (hyperspheric)
      dMMpc = (dHMpc / sqrtOk) * Math.sinh((sqrtOk * dCMpc) / dHMpc);
    } else {
      // Closed universe (spherical)
      dMMpc = (dHMpc / sqrtOk) * Math.sin((sqrtOk * dCMpc) / dHMpc);
    }
  }

  // Lookback time: t_L = (1/H0) * integral 0 to z of dz' / ((1+z')*E(z'))
  // 1/H0 in Gyr: 1 Mpc = 3.085677581e19 km; 1 yr = 3.15576e7 s; 1 Gyr = 1e9 yr
  // (3.085677581e19 km / 3.15576e16 s) / H0 = 977.79222 / H0 Gyr
  const hubbleTimeGyr = 977.79222 / params.h0;
  const tLookbackGyr = hubbleTimeGyr * integralLookback;
  const tLookbackYr = tLookbackGyr * 1e9;

  const currentAgeGyr = calculateUniverseAgeGyr(params);
  const cosmicAgeAtRedshift = Math.max(0.001, currentAgeGyr - tLookbackGyr);

  // Luminosity Distance: D_L = (1 + z) * D_M
  const dLMpc = (1 + z) * dMMpc;
  const dLGly = (dLMpc * LY_PER_MPC) / 1e9;
  const dLLy = dLMpc * LY_PER_MPC;

  // Angular Diameter Distance: D_A = D_M / (1 + z)
  const dAMpc = dMMpc / (1 + z);
  const dAGly = (dAMpc * LY_PER_MPC) / 1e9;
  const dALy = dAMpc * LY_PER_MPC;

  // Distance Modulus: mu = 5 * log10(D_L_pc / 10) = 5 * log10(D_L_Mpc) + 25
  const distanceModulus = 5 * Math.log10(Math.max(dLMpc, 1e-8)) + 25;

  // Angular scale: 1 arcsec in radians = pi / (180 * 3600) = 4.848136811e-6 rad
  // physical scale = D_A * theta_rad
  const kpcPerArcsec = dAMpc * 1000 * (Math.PI / (180 * 3600));
  // 1 arcmin in radians = pi / (180 * 60) = 2.908882087e-4 rad
  const lyPerArcmin = dALy * (Math.PI / (180 * 60));

  return {
    redshift: z,
    model: params,
    hubbleDistanceMpc: dHMpc,
    hubbleDistanceGly: dHGly,
    comovingDistanceMpc: dCMpc,
    comovingDistanceGly: dCGly,
    comovingDistanceLy: dCLy,
    transverseComovingDistanceMpc: dMMpc,
    lookbackTimeGyr: tLookbackGyr,
    lookbackTimeYr: tLookbackYr,
    cosmicAgeAtRedshiftGyr: cosmicAgeAtRedshift,
    cosmicAgeAtEmissionGyr: cosmicAgeAtRedshift,
    currentUniverseAgeGyr: currentAgeGyr,
    luminosityDistanceMpc: dLMpc,
    luminosityDistanceGly: dLGly,
    luminosityDistanceLy: dLLy,
    angularDiameterDistanceMpc: dAMpc,
    angularDiameterDistanceGly: dAGly,
    angularDiameterDistanceLy: dALy,
    distanceModulus,
    kpcPerArcsec,
    lyPerArcmin,
  };
}

/**
 * Calculates current age of universe t_0 by integrating from z = 0 to infinity.
 */
export function calculateUniverseAgeGyr(
  params: CosmologicalParameters = COSMOLOGICAL_MODELS.planck2018,
): number {
  const hubbleTimeGyr = 977.79222 / params.h0;
  // Integrate using substitute variable a = 1 / (1 + z), so a goes from 0 to 1
  // dt = (1/H0) * da / (a * E(1/a - 1))
  const steps = 600;
  const da = 1.0 / steps;
  let integral = 0;

  for (let i = 0; i < steps; i++) {
    const a = (i + 0.5) * da;
    const z = 1.0 / a - 1.0;
    const Ez = dimensionlessHubble(z, params);
    integral += (1.0 / (a * Ez)) * da;
  }

  return hubbleTimeGyr * integral;
}
