/**
 * Physics-Informed Galaxy Assembly & Numerical Mergers Engine
 *
 * Grounded in Cosmological Hydrodynamic Simulations:
 * - IllustrisTNG Project: Pillepich et al. (2018) MNRAS 473, 4077; Nelson et al. (2019) CompAC 6, 2
 * - FIRE-2 (Feedback In Realistic Environments): Hopkins et al. (2018) MNRAS 480, 800
 * - Kennicutt, R.C. (1998) "The Global Schmidt Law in Star-Forming Galaxies", ApJ 498, 541
 * - Toomre, A. & Toomre, J. (1972) "Galactic Bridges and Tails", ApJ 178, 623
 *
 * Epistemological Status:
 * Displays: [MODEL] - Cosmological N-body hydrodynamics with subgrid stellar feedback & AGN physics.
 */

export type GalaxyAssemblyStageId =
  | "dm_halo_collapse"
  | "cold_filamentary_accretion"
  | "turbulent_clumpy_disk"
  | "supernova_feedback_winds"
  | "galaxy_collision_tidal_tails"
  | "nuclear_starburst_merger"
  | "quenched_elliptical_remnant";

export interface GalaxyAssemblyStage {
  id: GalaxyAssemblyStageId;
  order: number;
  name: string;
  cosmicEpoch: string;
  redshiftZ: string;
  darkMatterHaloMassSolar: number;
  stellarMassSolar: number;
  gasFraction: number; // M_gas / (M_gas + M_star)
  starFormationRateSolarPerYr: number;
  morphologyClass: string;
  governingPhysicalProcess: string;
  simulationEvidence: string;
  observationalEvidence: string;
  description: string;
  statusBadge: "OBSERVATION" | "MODEL" | "ILLUSTRATION";
}

export const GALAXY_ASSEMBLY_STAGES: Record<GalaxyAssemblyStageId, GalaxyAssemblyStage> = {
  dm_halo_collapse: {
    id: "dm_halo_collapse",
    order: 1,
    name: "1. Dark Matter Halo Primordial Collapse",
    cosmicEpoch: "Cosmic Dawn (z ≈ 15 – 8)",
    redshiftZ: "z = 10.0",
    darkMatterHaloMassSolar: 1e9,
    stellarMassSolar: 0.0,
    gasFraction: 0.99,
    starFormationRateSolarPerYr: 0.01,
    morphologyClass: "Dark Matter Mini-Halo with Diffuse Gas Core",
    governingPhysicalProcess:
      "Jeans gravitational collapse of cold dark matter (CDM) density perturbations. Non-linear turnaround and virialization according to Navarro-Frenk-White (NFW) profile.",
    simulationEvidence:
      "TNG50 and FIRE-2 high-resolution N-body simulations resolving early halo virialization.",
    observationalEvidence:
      "CMB angular power spectrum constraining primordial density perturbation amplitude sigma_8 = 0.811.",
    description:
      "Cold dark matter gathers under gravity into an invisible virialized halo, establishing the deep gravitational potential well that will trap primordial gas.",
    statusBadge: "MODEL",
  },
  cold_filamentary_accretion: {
    id: "cold_filamentary_accretion",
    order: 2,
    name: "2. Cold Filamentary Gas Streams",
    cosmicEpoch: "Early Universe (z ≈ 6 – 3)",
    redshiftZ: "z = 4.5",
    darkMatterHaloMassSolar: 1e11,
    stellarMassSolar: 5e8,
    gasFraction: 0.85,
    starFormationRateSolarPerYr: 5.0,
    morphologyClass: "Pristine Infall Streams & Filamentary Bridges",
    governingPhysicalProcess:
      "Cold-mode accretion: unshocked pristine gas streams with T < 10^5 K penetrate directly through the dark matter virial radius, delivering fuel to the center without shock heating.",
    simulationEvidence:
      "Dekel et al. (2009) Nature simulations showing cold streams feeding high-z disk galaxies.",
    observationalEvidence:
      "Keck Cosmic Web Imager (KCWI) and MUSE optical integral-field detections of diffuse Lyman-alpha emission halos around high-redshift protogalaxies.",
    description:
      "Cold rivers of hydrogen gas flow along cosmic web filaments directly into the galaxy's center, bypassing virial shock heating and fueling rapid growth.",
    statusBadge: "OBSERVATION",
  },
  turbulent_clumpy_disk: {
    id: "turbulent_clumpy_disk",
    order: 3,
    name: "3. Turbulent Clumpy Starburst Disk",
    cosmicEpoch: "Cosmic Noon (z ≈ 3 – 1.5)",
    redshiftZ: "z = 2.1",
    darkMatterHaloMassSolar: 5e11,
    stellarMassSolar: 1.5e10,
    gasFraction: 0.65,
    starFormationRateSolarPerYr: 45.0,
    morphologyClass: "Clumpy Rotating Disk with Giant Star-Forming Complexes",
    governingPhysicalProcess:
      "Toomre gravitational instability (Q < 1): thick, highly turbulent gas disks (velocity dispersion sigma ~ 50 km/s) fragment into giant starburst clumps of mass ~10^8 - 10^9 M_sun.",
    simulationEvidence:
      "IllustrisTNG-50 resolving kpc-scale star-forming clumps and inward clump migration to build galactic bulges.",
    observationalEvidence:
      "Hubble CANDELS and JWST deep imaging resolving bright clumpy morphologies in z ~ 2 star-forming galaxies.",
    description:
      "A chaotic, spinning disk of gas churning with violent turbulence. Massive clumps weighing hundreds of millions of suns ignite with hundreds of thousands of new stars.",
    statusBadge: "OBSERVATION",
  },
  supernova_feedback_winds: {
    id: "supernova_feedback_winds",
    order: 4,
    name: "4. Stellar & Supernova Feedback Galactic Winds",
    cosmicEpoch: "Peak Outflow Era (z ≈ 2 – 1)",
    redshiftZ: "z = 1.6",
    darkMatterHaloMassSolar: 8e11,
    stellarMassSolar: 3.5e10,
    gasFraction: 0.45,
    starFormationRateSolarPerYr: 28.0,
    morphologyClass: "Bipolar Multiphase Galactic Superwind Outflows",
    governingPhysicalProcess:
      "Core-collapse supernovae and radiation pressure inject kinetic and thermal energy (E_SN ~ 10^51 erg), driving large-scale biconical winds that eject enriched gas into the circumgalactic medium (CGM). Mass loading factor eta = M_dot_wind / SFR > 1.",
    simulationEvidence:
      "FIRE-2 simulations showing multiphase galactic winds regulating the galaxy mass-metallicity relation.",
    observationalEvidence:
      "High-velocity blue-shifted absorption lines (v_wind > 1,000 km/s) observed in Keck, VLT, and JWST spectra of starburst galaxies.",
    description:
      "Millions of dying massive stars detonate in rapid succession. Their combined blast waves launch superheated gas fountains thousands of light-years out into intergalactic space.",
    statusBadge: "OBSERVATION",
  },
  galaxy_collision_tidal_tails: {
    id: "galaxy_collision_tidal_tails",
    order: 5,
    name: "5. Major Collision & Tidal Tail Bridges",
    cosmicEpoch: "Galaxy Interaction (Dynamic Encounter)",
    redshiftZ: "z = 0.8",
    darkMatterHaloMassSolar: 1.5e12,
    stellarMassSolar: 6e10,
    gasFraction: 0.35,
    starFormationRateSolarPerYr: 75.0,
    morphologyClass: "Interacting Pair with Gravitational Tidal Tails (Antennae Class)",
    governingPhysicalProcess:
      "Toomre tidal resonance: mutual gravitational torque flings stars and gas into spectacular sweeping tidal tails spanning over 100 kpc. Dynamical friction transfers orbital energy into dark matter halos, decaying the orbit.",
    simulationEvidence:
      "Barnes & Hernquist (1996) and modern GADGET-4 hydrodynamic merger simulations reproducing the Antennae (NGC 4038/39) and Mice (NGC 4676) morphologies.",
    observationalEvidence:
      "The Antennae Galaxies, Arp 220, and the future Milky Way - Andromeda (Milkomeda) collision pathway.",
    description:
      "Two massive disk galaxies perform a gravitational dance. Mutual tides rip out sweeping streamers of stars and gas over 300,000 light-years across space.",
    statusBadge: "OBSERVATION",
  },
  nuclear_starburst_merger: {
    id: "nuclear_starburst_merger",
    order: 6,
    name: "6. Nuclear Coalescence & Quasar Starburst",
    cosmicEpoch: "Coalescence & AGN Feedback",
    redshiftZ: "z = 0.7",
    darkMatterHaloMassSolar: 1.8e12,
    stellarMassSolar: 9e10,
    gasFraction: 0.18,
    starFormationRateSolarPerYr: 150.0,
    morphologyClass: "Ultraluminous Infrared Galaxy (ULIRG) / Quasar Host",
    governingPhysicalProcess:
      "Gravitational torques remove angular momentum from gas, channeling massive gas flows into the central kiloparsec. Fuels an extreme nuclear starburst and supermassive black hole accretion, triggering relativistic AGN jets.",
    simulationEvidence:
      "Hopkins et al. (2006) evolutionary model connecting gas-rich mergers to quasars and red ellipticals.",
    observationalEvidence:
      "ALMA and Spitzer measurements of Arp 220 and high-z submillimeter galaxies with infrared luminosities L_IR > 10^12 L_sun.",
    description:
      "The two galactic cores merge into one. Gas crashes into the center at immense speeds, feeding the central supermassive black hole and sparking the brightest starburst in the galaxy's history.",
    statusBadge: "MODEL",
  },
  quenched_elliptical_remnant: {
    id: "quenched_elliptical_remnant",
    order: 7,
    name: "7. Quenched Spheroidal Elliptical Remnant",
    cosmicEpoch: "Modern Universe (z ≈ 0.2 – 0)",
    redshiftZ: "z = 0.05",
    darkMatterHaloMassSolar: 2.5e12,
    stellarMassSolar: 1.2e11,
    gasFraction: 0.03,
    starFormationRateSolarPerYr: 0.5,
    morphologyClass: "Giant Triaxial Elliptical Galaxy (E0-E3) / Red & Dead",
    governingPhysicalProcess:
      "Violent gravitational relaxation randomizes stellar orbits into a pressure-supported spheroidal distribution. AGN feedback and virial shock heating prevent residual gas from cooling, permanently quenching star formation.",
    simulationEvidence:
      "IllustrisTNG-100 reproducing the observed galaxy color bimodal distribution (blue star-forming cloud vs red sequence).",
    observationalEvidence:
      "Messier 87 (Virgo cluster core), giant elliptical NGC 1316 (Fornax A), and SDSS red sequence galaxies.",
    description:
      "The merger settles into an orderly, ancient elliptical galaxy. Star formation has ceased; trillions of long-lived red and yellow stars swarm in three-dimensional swarm-like orbits.",
    statusBadge: "OBSERVATION",
  },
};

export interface MergerSimulationParams {
  massRatio: number; // Primary to secondary mass ratio (e.g. 1.0 for equal major merger, 0.25 for 4:1, 0.1 for 10:1 minor)
  gasFraction: number; // 0.1 to 0.8
  impactParameterKpc: number; // Pericenter distance (10 - 80 kpc)
  isPrograde: boolean; // Orbital angular momentum aligned with disk spin
  feedbackStrength: number; // Supernova & AGN feedback multiplier (0.5 - 2.5)
}

/**
 * Calculates physical merger observables and Kennicutt-Schmidt star formation rate
 */
export function calculateMergerPhysics(params: MergerSimulationParams) {
  // Kennicutt-Schmidt law: Sigma_SFR = A * Sigma_gas^N with N ≈ 1.4
  // Baseline disk gas surface density in M_sun / pc^2
  const baselineSigmaGas = 50 * (params.gasFraction / 0.3);
  // Tidal compression multiplier: major prograde mergers produce peak compression
  const compressionFactor = (params.isPrograde ? 2.5 : 1.2) * (1.0 / Math.max(0.2, params.massRatio > 0 ? 1 / params.massRatio : 1));
  const compressedSigmaGas = baselineSigmaGas * Math.min(6.0, compressionFactor);

  // Surface SFR in M_sun / yr / kpc^2: Sigma_SFR = 2.5e-4 * (Sigma_gas / 1 M_sun/pc^2)^1.4
  const surfaceSfr = 2.5e-4 * Math.pow(compressedSigmaGas, 1.4);
  const effectiveAreaKpc2 = 50.0; // Central starburst area (LIRG/ULIRG scale)
  const totalSfrSolarPerYr = surfaceSfr * effectiveAreaKpc2 * (1.0 / params.feedbackStrength);

  // Orbital decay timescale due to dynamical friction (Chandrasekhar formula):
  // t_fric ~ (r_init^2 * v_circ) / (G * M_satellite * ln(Lambda))
  const orbitalDecayTimeMyr = (600 * Math.pow(params.impactParameterKpc / 30, 1.5)) / Math.max(0.1, params.massRatio);

  // Tidal tail length: scales with prograde resonance and mass ratio
  const tidalTailLengthKpc = params.isPrograde ? 60 * Math.sqrt(Math.min(1.0, params.massRatio)) : 15;

  // Final Remnant Morphology prediction
  let finalMorphology = "Giant Triaxial Elliptical (E1-E2)";
  if (params.massRatio < 0.2) {
    finalMorphology = "Thickened Spiral Disk with Prominent Bulge (S0/a)";
  } else if (params.gasFraction > 0.5) {
    finalMorphology = "Reformed Gas-Rich Disk with Massive Central Bulge";
  }

  return {
    baselineSigmaGas,
    compressedSigmaGas,
    totalSfrSolarPerYr,
    orbitalDecayTimeMyr,
    tidalTailLengthKpc,
    finalMorphology,
  };
}
