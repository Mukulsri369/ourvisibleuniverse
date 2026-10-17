// @ts-nocheck
/**
 * Physics-Informed Star Formation Engine
 *
 * Scientific Basis:
 * - Jeans, J.H. (1902) "The Stability of a Spherical Nebula", Phil. Trans. R. Soc. A 199, 1-53
 * - Bonnor, W.B. (1956) "Boyle's Law and gravitational instability", Z. Astrophys. 39, 143
 * - Shu, F.H. (1977) "Self-similar collapse of isothermal spheres and star formation", ApJ 214, 488
 * - Lada, C.J. (1987) "Star formation - From OB associations to protostars", IAU Symp. 115, 1-17 (YSO Classification)
 * - McKee, C.F. & Ostriker, E.C. (2007) "Theory of Star Formation", ARA&A 45, 565-687
 *
 * Epistemological Status:
 * Displays: [MODEL] - Idealized gravitational collapse and young stellar object (YSO) accretion.
 */

import { G_CONST } from "../constants";

export interface MolecularCloudParams {
  temperatureK: number; // Cloud temperature (5 - 80 K)
  densityCm3: number; // Number density of H2 molecules (10^2 - 10^7 cm^-3)
  cloudMassSolar: number; // Cloud mass in M_sun (1 - 5000 M_sun)
  magneticFieldMicroGauss: number; // B-field strength (5 - 100 uG)
  turbulenceKmS: number; // Supersonic velocity dispersion (0.2 - 5.0 km/s)
}

export type YSOClass = "prestellar_core" | "class_0" | "class_I" | "class_II" | "class_III";

export interface YSOStageInfo {
  id: YSOClass;
  order: number;
  name: string;
  astronomicalClass: string;
  typicalAgeYears: string;
  centralTemperatureK: number;
  centralDensityGcm3: number;
  bolometricLuminositySolar: number;
  envelopeMassSolar: number;
  diskMassSolar: number;
  stellarMassSolar: number;
  inflowRateSolarPerYear: number;
  outflowVelocityKmS: number;
  spectralIndexAlpha: string;
  description: string;
  observationalDiagnostics: string[];
  hydrogenFusionIgnited: boolean;
  statusBadge: "OBSERVATION" | "MODEL" | "ILLUSTRATION";
}

export const YSO_STAGES: Record<YSOClass, YSOStageInfo> = {
  prestellar_core: {
    id: "prestellar_core",
    order: 1,
    name: "1. Cold Dense Pre-Stellar Core",
    astronomicalClass: "Bok Globule / Dense Core",
    typicalAgeYears: "t ≈ -100,000 years (Pre-Collapse)",
    centralTemperatureK: 10,
    centralDensityGcm3: 1e-19,
    bolometricLuminositySolar: 0.05,
    envelopeMassSolar: 5.0,
    diskMassSolar: 0.0,
    stellarMassSolar: 0.0,
    inflowRateSolarPerYear: 0.0,
    outflowVelocityKmS: 0.0,
    spectralIndexAlpha: "Far-IR / Sub-mm cold dust peak (< 20 K)",
    description:
      "A starless, gravitationally bound condensation within a giant molecular cloud (GMC). Thermal pressure and magnetic fields fight gravity, waiting for turbulent dissipation to trigger collapse.",
    observationalDiagnostics: [
      "Deep optical obscuration (Barnard dark cloud)",
      "Submillimeter dust continuum emission (ALMA, JCMT SCUBA-2)",
      "Molecular line freeze-out (C18O, N2H+, NH3)",
    ],
    hydrogenFusionIgnited: false,
    statusBadge: "OBSERVATION",
  },
  class_0: {
    id: "class_0",
    order: 2,
    name: "2. Deeply Embedded Protostar",
    astronomicalClass: "Class 0 YSO (First Hydrostatic Core)",
    typicalAgeYears: "t ≈ 10,000 to 50,000 years",
    centralTemperatureK: 2000,
    centralDensityGcm3: 1e-13,
    bolometricLuminositySolar: 5.0,
    envelopeMassSolar: 4.0,
    diskMassSolar: 0.2,
    stellarMassSolar: 0.15,
    inflowRateSolarPerYear: 3e-5,
    outflowVelocityKmS: 150,
    spectralIndexAlpha: "alpha_IR > 0.3 (Envelope dominates; M_env > M_star)",
    description:
      "The first hydrostatic core has formed. Matter falls inward at supersonic free-fall speeds. Conservation of angular momentum forms an embryonic accretion disk, driving collimated supersonic Herbig-Haro bipolar jets.",
    observationalDiagnostics: [
      "Centrally peaked submillimeter emission",
      "Collimated molecular CO outflows and shocked H2 knots (Herbig-Haro objects)",
      "Undetectable in optical and near-infrared due to heavy dust extinction (A_V > 100 mag)",
    ],
    hydrogenFusionIgnited: false,
    statusBadge: "MODEL",
  },
  class_I: {
    id: "class_I",
    order: 3,
    name: "3. Accreting Protostar with Cavity",
    astronomicalClass: "Class I YSO (Envelope Shedding)",
    typicalAgeYears: "t ≈ 100,000 to 200,000 years",
    centralTemperatureK: 50000,
    centralDensityGcm3: 1e-8,
    bolometricLuminositySolar: 8.0,
    envelopeMassSolar: 1.0,
    diskMassSolar: 0.15,
    stellarMassSolar: 0.5,
    inflowRateSolarPerYear: 1e-5,
    outflowVelocityKmS: 250,
    spectralIndexAlpha: "0.0 < alpha_IR < 0.3 (M_star > M_env)",
    description:
      "The protostar has accumulated the majority of its final mass. Bipolar outflow cavities have punctured the surrounding envelope, allowing scattered infrared light to escape.",
    observationalDiagnostics: [
      "Infrared reflection nebulae carved by bipolar outflow cavities",
      "Prominent mid-to-far-infrared excess (Spitzer, WISE)",
      "X-ray emission from magnetic star-disk reconnection flares (Chandra)",
    ],
    hydrogenFusionIgnited: false,
    statusBadge: "MODEL",
  },
  class_II: {
    id: "class_II",
    order: 4,
    name: "4. Classical T Tauri Star & Protoplanetary Disk",
    astronomicalClass: "Class II YSO (T Tauri Phase)",
    typicalAgeYears: "t ≈ 1 to 3 Million years",
    centralTemperatureK: 3e6,
    centralDensityGcm3: 1e-2,
    bolometricLuminositySolar: 2.5,
    envelopeMassSolar: 0.01,
    diskMassSolar: 0.03,
    stellarMassSolar: 0.9,
    inflowRateSolarPerYear: 1e-8,
    outflowVelocityKmS: 80,
    spectralIndexAlpha: "-1.6 < alpha_IR < 0.0 (Optically thick disk)",
    description:
      "The envelope has largely dispersed, leaving an optically visible pre-main sequence star surrounded by a Keplerian protoplanetary disk. Gas funnels along magnetic field lines onto the stellar surface. Giant planet formation is underway.",
    observationalDiagnostics: [
      "Broad H-alpha emission lines with P Cygni profiles (magnetospheric accretion)",
      "ALMA millimeter dust continuum resolving protoplanetary rings and gaps",
      "Excess ultraviolet and infrared emission above stellar photosphere",
    ],
    hydrogenFusionIgnited: false,
    statusBadge: "OBSERVATION",
  },
  class_III: {
    id: "class_III",
    order: 5,
    name: "5. Zero-Age Main Sequence (ZAMS) Ignition",
    astronomicalClass: "Class III YSO / ZAMS Star",
    typicalAgeYears: "t ≈ 10 to 30 Million years",
    centralTemperatureK: 1.5e7, // 15 Million K
    centralDensityGcm3: 100, // ~100 g/cm^3
    bolometricLuminositySolar: 1.0,
    envelopeMassSolar: 0.0,
    diskMassSolar: 0.001, // Debris disk
    stellarMassSolar: 1.0,
    inflowRateSolarPerYear: 0.0,
    outflowVelocityKmS: 0.0,
    spectralIndexAlpha: "alpha_IR < -1.6 (Pure photosphere with weak debris disk)",
    description:
      "Core temperature reaches 15 million Kelvin, triggering sustained hydrogen fusion via the proton-proton chain. Thermal radiation pressure halts gravitational contraction. The young star achieves hydrostatic equilibrium on the Zero-Age Main Sequence (ZAMS).",
    observationalDiagnostics: [
      "Pure stellar photosphere spectrum with weak optically thin debris disk",
      "Stable chromospheric and coronal magnetic activity",
      "Hydrogen alpha in absorption; no active gas accretion",
    ],
    hydrogenFusionIgnited: true,
    statusBadge: "OBSERVATION",
  },
};

/**
 * Calculates physical collapse parameters based on Jeans Instability and Virial Equilibrium
 */
export function calculateStarFormationPhysics(params: MolecularCloudParams) {
  // Mean molecular weight for cold molecular hydrogen gas (70% H2, 28% He, 2% metals)
  const mu = 2.38;
  const mH = 1.6735e-24; // grams
  const kB = 1.3807e-16; // erg / K
  const G = 6.6743e-8; // cm^3 / g / s^2
  const M_sun_g = 1.989e33; // grams
  const pc_cm = 3.0857e18; // cm
  const ly_cm = 9.4607e17; // cm

  // Mass density rho = mu * m_H * n
  const rhoCgs = mu * mH * params.densityCm3; // g / cm^3

  // Isothermal sound speed c_s = sqrt(k_B * T / (mu * m_H))
  const soundSpeedCmS = Math.sqrt((kB * params.temperatureK) / (mu * mH));
  const soundSpeedKmS = soundSpeedCmS / 1e5;

  // Effective sound speed including supersonic turbulence
  const effectiveSoundSpeedKmS = Math.sqrt(
    soundSpeedKmS * soundSpeedKmS + (params.turbulenceKmS * params.turbulenceKmS) / 3,
  );
  const effectiveSoundSpeedCmS = effectiveSoundSpeedKmS * 1e5;

  // Jeans Length: lambda_J = sqrt(pi * c_s,eff^2 / (G * rho))
  const jeansLengthCm = Math.sqrt(
    (Math.PI * effectiveSoundSpeedCmS * effectiveSoundSpeedCmS) / (G * rhoCgs),
  );
  const jeansLengthPc = jeansLengthCm / pc_cm;
  const jeansLengthLy = jeansLengthCm / ly_cm;

  // Jeans Mass: M_J = (pi / 6) * rho * lambda_J^3
  const jeansMassG = (Math.PI / 6) * rhoCgs * Math.pow(jeansLengthCm, 3);
  const jeansMassSolar = jeansMassG / M_sun_g;

  // Bonnor-Ebert critical mass: M_BE = 1.18 * c_s^3 / (sqrt(G^3 * rho_edge))
  const bonnorEbertMassSolar =
    (1.18 * Math.pow(effectiveSoundSpeedCmS, 3)) / (Math.sqrt(Math.pow(G, 3) * rhoCgs) * M_sun_g);

  // Free-fall collapse timescale: t_ff = sqrt(3 * pi / (32 * G * rho))
  const freeFallTimeSec = Math.sqrt((3 * Math.PI) / (32 * G * rhoCgs));
  const freeFallTimeYears = freeFallTimeSec / (365.25 * 86400);

  // Magnetic critical mass: M_phi = 0.12 * Phi_B / sqrt(G)
  // Cloud radius approximated from mass and density
  const cloudVolumeCm3 = (params.cloudMassSolar * M_sun_g) / rhoCgs;
  const cloudRadiusCm = Math.pow((3 * cloudVolumeCm3) / (4 * Math.PI), 1 / 3);
  const cloudRadiusLy = cloudRadiusCm / ly_cm;
  const magneticFieldGauss = params.magneticFieldMicroGauss * 1e-6;
  const magneticFlux = Math.PI * cloudRadiusCm * cloudRadiusCm * magneticFieldGauss;
  const magneticCriticalMassSolar = (0.12 * magneticFlux) / (Math.sqrt(G) * M_sun_g);

  // Collapse Condition: Is total cloud mass greater than Jeans Mass & Magnetic Critical Mass?
  const isGravitationallyUnstable = params.cloudMassSolar > jeansMassSolar;
  const isMagneticallySupercritical = params.cloudMassSolar > magneticCriticalMassSolar;
  const willCollapse = isGravitationallyUnstable && isMagneticallySupercritical;

  // Star Formation Efficiency (SFE ~ 2 - 10% in typical GMCs)
  const estimatedStarCount = Math.max(
    1,
    Math.floor((params.cloudMassSolar * 0.05) / Math.max(0.3, Math.min(jeansMassSolar, 2.0))),
  );

  return {
    rhoCgs,
    soundSpeedKmS,
    effectiveSoundSpeedKmS,
    jeansLengthLy,
    jeansLengthPc,
    jeansMassSolar,
    bonnorEbertMassSolar,
    freeFallTimeYears,
    magneticCriticalMassSolar,
    cloudRadiusLy,
    isGravitationallyUnstable,
    isMagneticallySupercritical,
    willCollapse,
    estimatedStarCount,
  };
}

/**
 * Calculates inside-out collapse density and velocity profiles
 * Based on Shu (1977) self-similar isothermal collapse
 */
export function calculateCollapseProfile(rAu: number, rExpansionWaveAu: number) {
  // rAu: distance from central protostar in AU
  // rExpansionWaveAu: current radius of the outward-propagating rarefaction wave c_s * t
  if (rAu <= 0) rAu = 0.01;

  if (rAu >= rExpansionWaveAu) {
    // Static Singular Isothermal Sphere (SIS) outer envelope: rho ~ r^-2, v = 0
    const relativeDensity = Math.pow(rExpansionWaveAu / rAu, 2);
    const infallVelocityKmS = 0.0;
    return { relativeDensity, infallVelocityKmS, isInfaling: false };
  } else {
    // Free-fall inner core: rho ~ r^-1.5, v ~ r^-0.5
    const relativeDensity = Math.pow(rExpansionWaveAu / rAu, 1.5);
    const infallVelocityKmS = 5.0 * Math.pow(rExpansionWaveAu / rAu, 0.5);
    return { relativeDensity, infallVelocityKmS, isInfaling: true };
  }
}
