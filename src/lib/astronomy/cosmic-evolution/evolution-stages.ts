/**
 * Comprehensive Scientific Cosmic Evolution Chronology & Physical Stages
 *
 * Grounded in peer-reviewed observational cosmology and numerical simulations:
 * - Planck Collaboration (2020) "Planck 2018 results. VI. Cosmological parameters", A&A 641, A6
 * - Guth, A. (1981) "Inflationary universe", PRD 23, 347; Linde, A. (1982) PLB 108, 389
 * - Alpher, Bethe & Gamow (1948) "The Origin of Chemical Elements", Phys. Rev. 73, 803
 * - Peebles, P.J.E. (1968) "Recombination of the Primeval Plasma", ApJ 153, 1
 * - Robertson, B.E., et al. (2023) "Identification and properties of z > 10 galaxies in JWST JADES", Nat Astron 7, 611
 * - Madau, P. & Dickinson, M. (2014) "Cosmic Star-Formation History", ARA&A 52, 415
 * - Springel, V., et al. (2018) / Nelson, D., et al. (2019) IllustrisTNG Cosmological Simulations
 *
 * MANDATORY SCIENTIFIC SAFEGUARDS:
 * 1. The Big Bang is NEVER described as an explosion of matter into pre-existing space.
 *    It is the expansion of spacetime itself from an initial hot, dense state.
 * 2. Pre-Planck physics (t < 10^-43 s) is explicitly marked as beyond established empirical knowledge.
 * 3. Inflation is classified as a prevailing theoretical hypothesis with specific observational predictions
 *    (flatness, scalar tilt, acoustic phase) and acknowledged uncertainties (inflaton identity, trans-Planckian issue).
 * 4. Simulation data (IllustrisTNG) is clearly labeled as statistical realizations, never claimed to reproduce
 *    the actual historical sky coordinates of real distant galaxies.
 */

export type ViewingExperienceMode =
  "guided_cinematic" | "interactive_exploration" | "advanced_physics";

export type VisualStageId =
  | "early_plasma"
  | "cmb_sky"
  | "gravitational_growth"
  | "first_stars"
  | "galaxy_assembly"
  | "cosmic_web"
  | "modern_distribution";

export interface CosmicEvolutionStage {
  id: string;
  order: number;
  name: string;
  subtitle: string;
  epochRange: string;
  timeSeconds: number; // Approximate elapsed seconds since start of metric expansion
  timeGyr: number; // Elapsed time in Gyr
  redshiftZ: number | string; // Numerical or string for extreme epochs
  redshiftNum: number;
  temperatureKelvin: number | string;
  temperatureNum: number;
  energyScale: string;
  scaleFactorA: number; // a = 1 / (1 + z)
  dominantEnergyComponent:
    "Quantum Vacuum" | "Radiation" | "Matter (Dark + Baryonic)" | "Dark Energy";
  visualStageId: VisualStageId;

  // Methodological / Epistemological Status
  dataStatus:
    | "empirical_observation"
    | "theoretical_standard_model"
    | "speculative_frontier"
    | "simulation_reconstruction";
  observedVsSimulatedLabel: string;

  // Scientific details
  scientificProcess: string;
  observationalEvidence: string;
  knownUncertainties: string;
  scientificCitations: {
    authors: string;
    year: number;
    title: string;
    journal: string;
    doiOrBibcode?: string;
  }[];

  // Guided narrative for students and enthusiasts
  guidedNarration: {
    studentSummary: string;
    inDepthExplanation: string;
    keyTakeaway: string;
  };

  // Physical parameters for Advanced Physics Mode
  advancedPhysics: {
    keyEquationName: string;
    latexEquation: string;
    equationDescription: string;
    cosmicDensityParameters: {
      omegaM: number;
      omegaLambda: number;
      omegaRad: number;
    };
    physicalScaleNote: string;
  };
}

export const COSMIC_EVOLUTION_STAGES: CosmicEvolutionStage[] = [
  {
    id: "hot_big_bang_expansion",
    order: 1,
    name: "1. Hot Big Bang Metric Expansion",
    subtitle: "The Beginning of Spacetime Metric Expansion",
    epochRange: "t ≈ 10⁻⁴³ to 10⁻³⁶ seconds",
    timeSeconds: 1e-43,
    timeGyr: 0,
    redshiftZ: "z > 10³¹",
    redshiftNum: 1e31,
    temperatureKelvin: "T > 10³² K",
    temperatureNum: 1e32,
    energyScale: "~10¹⁹ GeV (Planck Energy)",
    scaleFactorA: 1e-31,
    dominantEnergyComponent: "Quantum Vacuum",
    visualStageId: "early_plasma",
    dataStatus: "speculative_frontier",
    observedVsSimulatedLabel:
      "Theoretical Physics Frontier (Limits of Established General Relativity)",
    scientificProcess:
      "All space was in an ultra-dense, ultra-hot initial state. General Relativity predicts a spacetime singularity, but quantum gravitational effects dominate at scales smaller than the Planck length (1.62 × 10⁻³⁵ m), meaning classical spacetime concepts break down. The Big Bang was not an explosion into pre-existing space, but the expansion of space itself.",
    observationalEvidence:
      "Indirect: The observed isotropic Hubble expansion of all distant galaxies, the 2.7255 K blackbody CMB spectrum, and primordial light element abundances all extrapolate back to this hot, dense origin.",
    knownUncertainties:
      "A complete, experimentally verified theory of Quantum Gravity (unifying General Relativity and Quantum Mechanics) does not yet exist. We cannot make definitive physical claims before t ≈ 10⁻⁴³ s (Planck time).",
    scientificCitations: [
      {
        authors: "Hawking, S.W. & Penrose, R.",
        year: 1970,
        title: "The Singularities of Gravitational Collapse and Cosmology",
        journal: "Proc. R. Soc. Lond. A 314, 529-548",
      },
      {
        authors: "Planck Collaboration",
        year: 2020,
        title: "Planck 2018 results. VI. Cosmological parameters",
        journal: "Astron. Astrophys. 641, A6",
      },
    ],
    guidedNarration: {
      studentSummary:
        "The Big Bang wasn't a bomb exploding in the dark. It was the birth of space and time everywhere at once, starting unimaginably hot and dense!",
      inDepthExplanation:
        "Standard cosmology models metric expansion using the Friedmann-Lemaître-Robertson-Walker (FLRW) metric. Every point in the universe recedes from every other point; there is no central point in space from which matter was ejected.",
      keyTakeaway:
        "The Big Bang happened everywhere simultaneously, creating space and time rather than expanding into prior space.",
    },
    advancedPhysics: {
      keyEquationName: "Friedmann Expansion Equation (Radiation Era)",
      latexEquation: "H^2 = \\left(\\frac{\\dot{a}}{a}\\right)^2 = \\frac{8\\pi G}{3}\\rho",
      equationDescription:
        "Relates the Hubble parameter H to the total energy density rho. In the radiation-dominated early universe, rho scales as a^-4, yielding a(t) ~ t^(1/2).",
      cosmicDensityParameters: { omegaM: 0.0001, omegaLambda: 0.0, omegaRad: 0.9999 },
      physicalScaleNote: "Planck length l_p = sqrt(hbar*G / c^3) ≈ 1.616 x 10^-35 m",
    },
  },
  {
    id: "inflation_hypothesis",
    order: 2,
    name: "2. Cosmic Inflation Hypothesis",
    subtitle: "Hypothetical Exponential Metric Stretching",
    epochRange: "t ≈ 10⁻³⁶ to 10⁻³² seconds",
    timeSeconds: 1e-35,
    timeGyr: 0,
    redshiftZ: "z ≈ 10²⁷",
    redshiftNum: 1e27,
    temperatureKelvin: "T ≈ 10²⁸ K",
    temperatureNum: 1e28,
    energyScale: "10¹⁵ – 10¹⁶ GeV (GUT Scale)",
    scaleFactorA: 1e-27,
    dominantEnergyComponent: "Quantum Vacuum",
    visualStageId: "early_plasma",
    dataStatus: "theoretical_standard_model",
    observedVsSimulatedLabel: "Theoretical Hypothesis with Precision Empirical Predictions",
    scientificProcess:
      "A proposed scalar field (the inflaton) in a false-vacuum potential drove rapid exponential metric expansion, expanding space by a factor of at least 10²⁶ within 10⁻³² seconds. Quantum zero-point fluctuations were stretched past the cosmological event horizon, freezing out as macroscopic curvature perturbations.",
    observationalEvidence:
      "Solves the Horizon Problem (why causally disconnected regions of the CMB have the same temperature to 1 part in 100,000) and the Flatness Problem (spatial curvature |Omega_k| < 0.005). Predicts a nearly scale-invariant scalar perturbation spectrum (Planck measured n_s = 0.9649 ± 0.0042).",
    knownUncertainties:
      "The microscopic identity of the inflaton field remains unidentified. Primordial gravitational wave B-modes (tensor-to-scalar ratio r < 0.036 at 95% CL from BICEP/Keck + Planck) have not yet been detected.",
    scientificCitations: [
      {
        authors: "Guth, A.H.",
        year: 1981,
        title: "Inflationary universe: A possible solution to the horizon and flatness problems",
        journal: "Physical Review D 23, 347",
      },
      {
        authors: "Linde, A.D.",
        year: 1982,
        title: "A new inflationary universe scenario",
        journal: "Physics Letters B 108, 389",
      },
      {
        authors: "BICEP/Keck Collaboration",
        year: 2021,
        title: "Improved Constraints on Primordial Gravitational Waves",
        journal: "Physical Review Letters 127, 151301",
      },
    ],
    guidedNarration: {
      studentSummary:
        "For a tiny sliver of a second, space expanded faster than light, smoothing out wrinkles and freezing tiny microscopic ripples that later became galaxies!",
      inDepthExplanation:
        "During inflation, vacuum energy acts as a cosmological constant with negative pressure (p = -rho c^2), driving de Sitter exponential expansion a(t) = a_0 exp(H_inf * t). Quantum fluctuations stretched to cosmological scales became the density seeds of all subsequent cosmic structures.",
      keyTakeaway:
        "Inflation explains why our universe is so smooth, flat, and uniform, while generating the density seeds for all future cosmic structure.",
    },
    advancedPhysics: {
      keyEquationName: "De Sitter Metric Inflation",
      latexEquation:
        "a(t) = a(0)\\,e^{H_{\\text{inf}}t}, \\quad H_{\\text{inf}} = \\sqrt{\\frac{8\\pi G V(\\phi)}{3}}",
      equationDescription:
        "Slow-roll scalar field dynamics V(phi) generate quasi-de Sitter exponential scale expansion. Generates primordial power spectrum P_R(k) = A_s (k/k_0)^(n_s - 1).",
      cosmicDensityParameters: { omegaM: 0.0, omegaLambda: 1.0, omegaRad: 0.0 },
      physicalScaleNote: "Scale factor expanded by > 60 e-folds (e^60 ≈ 10^26)",
    },
  },
  {
    id: "particle_formation_early_plasma",
    order: 3,
    name: "3. Particle Formation & Early Plasma",
    subtitle: "Electroweak Symmetry Breaking & Quark-Gluon Plasma",
    epochRange: "t ≈ 10⁻¹² to 10⁻⁶ seconds",
    timeSeconds: 1e-6,
    timeGyr: 0,
    redshiftZ: "z ≈ 10¹²",
    redshiftNum: 1e12,
    temperatureKelvin: "T ≈ 10¹² K to 10¹⁵ K",
    temperatureNum: 1e12,
    energyScale: "150 MeV – 100 GeV",
    scaleFactorA: 1e-12,
    dominantEnergyComponent: "Radiation",
    visualStageId: "early_plasma",
    dataStatus: "theoretical_standard_model",
    observedVsSimulatedLabel: "Empirically Verified in Terrestrial Colliders (CERN LHC & RHIC)",
    scientificProcess:
      "As temperatures dropped below ~100 GeV, the Higgs mechanism broke electroweak symmetry, granting mass to W and Z bosons while leaving photons massless. At ~150-200 MeV, quarks and gluons underwent color confinement into hadrons (protons, neutrons, mesons). Baryogenesis generated a tiny matter-antimatter asymmetry of roughly 1 extra baryon per 10⁹ baryon-antibaryon pairs.",
    observationalEvidence:
      "The quark-gluon plasma state is directly created and measured in high-energy heavy ion collisions at CERN's Large Hadron Collider (ALICE) and Brookhaven's Relativistic Heavy Ion Collider (RHIC). The photon-to-baryon ratio eta ≈ 6.1 × 10⁻¹⁰ measured in the CMB confirms this early annihilation.",
    knownUncertainties:
      "The exact physical mechanism behind Baryogenesis (satisfying Sakharov conditions) is not fully established within the minimal Standard Model and requires physics beyond the Standard Model (e.g. leptogenesis, SUSY, or extended Higgs sectors).",
    scientificCitations: [
      {
        authors: "ALICE Collaboration",
        year: 2022,
        title: "The ALICE experiment: A journey through QCD at the LHC",
        journal: "Eur. Phys. J. C 82, 1144",
      },
      {
        authors: "Sakharov, A.D.",
        year: 1967,
        title: "Violation of CP Invariance, C Asymmetry, and Baryon Asymmetry of the Universe",
        journal: "JETP Lett. 5, 24-27",
      },
    ],
    guidedNarration: {
      studentSummary:
        "The universe was a super-hot boiling soup of quarks and gluons. As it cooled slightly, quarks snapped together into the protons and neutrons inside every atom today!",
      inDepthExplanation:
        "Nearly all matter and antimatter annihilated into high-energy photons. Only one extra particle of normal matter survived out of every billion pairs, forming all the galaxies, stars, and humans in the cosmos.",
      keyTakeaway:
        "Every proton in your body survived the primordial annihilation of matter and antimatter in the first microsecond of time.",
    },
    advancedPhysics: {
      keyEquationName: "QCD Confinement Phase Transition",
      latexEquation: "T_c \\approx 155 \\text{ MeV} \\approx 1.8 \\times 10^{12} \\text{ K}",
      equationDescription:
        "Below T_c, quantum chromodynamics transitions from asymptotic freedom to color confinement, assembling quarks into color-singlet hadrons.",
      cosmicDensityParameters: { omegaM: 0.001, omegaLambda: 0.0, omegaRad: 0.999 },
      physicalScaleNote: "Baryon-to-photon ratio eta = n_b / n_gamma ≈ 6.12 x 10^-10",
    },
  },
  {
    id: "primordial_nucleosynthesis",
    order: 4,
    name: "4. Primordial Nucleosynthesis (BBN)",
    subtitle: "The Cosmic Thermonuclear Forge",
    epochRange: "t ≈ 3 to 20 minutes",
    timeSeconds: 1200,
    timeGyr: 0.00000004,
    redshiftZ: "z ≈ 3 × 10⁸",
    redshiftNum: 3e8,
    temperatureKelvin: "T ≈ 10⁹ K",
    temperatureNum: 1e9,
    energyScale: "0.1 – 1.0 MeV",
    scaleFactorA: 3.3e-9,
    dominantEnergyComponent: "Radiation",
    visualStageId: "early_plasma",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel: "Precision Empirical Observational Pillar (Light Element Abundances)",
    scientificProcess:
      "When the universe cooled to ~10⁹ K, the 'deuterium bottleneck' broke, allowing protons and neutrons to fuse into deuterium, helium-3, helium-4, and trace lithium-7. Rapid expansion and cooling halted fusion before elements heavier than lithium could form, as there are no stable nuclei of mass A = 5 or A = 8.",
    observationalEvidence:
      "Astronomical spectroscopic observations of pristine metal-poor gas clouds, damped Lyman-alpha absorbers, and H II regions reveal primordial mass fractions of ~75% Hydrogen, ~25% Helium-4, D/H ≈ 2.5 × 10⁻⁵, matching BBN calculations with astounding precision.",
    knownUncertainties:
      "The 'Cosmological Lithium Problem': Observed Lithium-7 abundances in ancient halo stars (the Spite plateau) are a factor of 2 to 3 lower than standard BBN model predictions, potentially caused by stellar depletion or new physics.",
    scientificCitations: [
      {
        authors: "Alpher, R.A., Bethe, H. & Gamow, G.",
        year: 1948,
        title: "The Origin of Chemical Elements",
        journal: "Physical Review 73, 803",
      },
      {
        authors: "Fields, B.D., Molaro, P. & Sarkar, S.",
        year: 2020,
        title: "Big-Bang Nucleosynthesis",
        journal: "Review of Particle Physics (PDG)",
      },
    ],
    guidedNarration: {
      studentSummary:
        "For about 17 minutes, the whole universe acted like a giant fusion reactor, forging 75% hydrogen and 25% helium, the raw fuel of every future star!",
      inDepthExplanation:
        "Free neutrons decay with a half-life of ~879 seconds. Because the neutron-to-proton ratio froze at ~1/7, nearly every free neutron was locked into stable Helium-4 (which contains two protons and two neutrons).",
      keyTakeaway:
        "Three-quarters hydrogen and one-quarter helium were set in stone in the first 20 minutes of the universe.",
    },
    advancedPhysics: {
      keyEquationName: "Primordial Helium Mass Fraction",
      latexEquation: "Y_p = \\frac{2(n/p)}{1 + (n/p)} \\approx \\frac{2(1/7)}{1 + 1/7} = 0.25",
      equationDescription:
        "Predicts the primordial helium-4 abundance directly from the freeze-out neutron-to-proton ratio (n/p ≈ 1/7) without free fitting parameters.",
      cosmicDensityParameters: { omegaM: 0.05, omegaLambda: 0.0, omegaRad: 0.95 },
      physicalScaleNote: "Primordial composition: 75% H, 25% 4He, ~2.5x10^-5 D, ~10^-10 7Li",
    },
  },
  {
    id: "recombination_photon_decoupling",
    order: 5,
    name: "5. Recombination & Photon Decoupling",
    subtitle: "The Clearing of the Cosmic Fog",
    epochRange: "t ≈ 380,000 years",
    timeSeconds: 1.2e13,
    timeGyr: 0.00038,
    redshiftZ: "z ≈ 1090",
    redshiftNum: 1090,
    temperatureKelvin: "T ≈ 2,970 K",
    temperatureNum: 2970,
    energyScale: "0.26 eV",
    scaleFactorA: 0.000917,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "cmb_sky",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel: "Gold-Standard Empirical Benchmark (COBE, WMAP, Planck Satellites)",
    scientificProcess:
      "Ambient photons cooled below ~0.3 eV, allowing free electrons to bind with protons to form neutral hydrogen atoms without being immediately knocked free. With free electrons gone, the Thomson scattering optical depth dropped to near zero, freeing photons to travel through space forever without scattering.",
    observationalEvidence:
      "The Cosmic Microwave Background (CMB) is the direct relic of this last scattering surface. COBE measured a perfect blackbody spectrum with T = 2.7255 ± 0.0006 K. Planck mapped temperature fluctuations (Delta T / T ~ 10⁻⁵) across the entire celestial sphere.",
    knownUncertainties:
      "Precision details of non-equilibrium hydrogen recombination dynamics (Peebles three-level atom versus full multi-level atomic cascade codes like COSMOREC/HYREC).",
    scientificCitations: [
      {
        authors: "Peebles, P.J.E.",
        year: 1968,
        title: "Recombination of the Primeval Plasma",
        journal: "Astrophysical Journal 153, 1",
      },
      {
        authors: "Fixsen, D.J.",
        year: 2009,
        title: "The Temperature of the Cosmic Microwave Background",
        journal: "Astrophysical Journal 707, 916",
      },
    ],
    guidedNarration: {
      studentSummary:
        "The early universe was a blinding glowing fog. When it cooled to about 3,000 degrees, electrons snapped into atoms, the fog cleared in an instant, and light was set free!",
      inDepthExplanation:
        "This moment created the oldest image in the universe: the Cosmic Microwave Background. The photons released 380,000 years after the Big Bang have travelled across space for 13.8 billion years, stretched by expansion into microwaves.",
      keyTakeaway:
        "The CMB is the ultimate baby picture of the universe, captured at the exact moment space became transparent.",
    },
    advancedPhysics: {
      keyEquationName: "Saha Ionization Equation (Decoupling)",
      latexEquation:
        "\\frac{n_e n_p}{n_H} = \\left(\\frac{m_e k_B T}{2\\pi\\hbar^2}\\right)^{3/2} e^{-E_I / (k_B T)}",
      equationDescription:
        "Ionization equilibrium for hydrogen (ionization potential E_I = 13.6 eV). High photon-to-baryon ratio delays decoupling until T drops to ~0.26 eV (2970 K).",
      cosmicDensityParameters: { omegaM: 0.315, omegaLambda: 0.685, omegaRad: 0.0008 },
      physicalScaleNote: "Comoving sound horizon at drag epoch r_s ≈ 147.21 ± 0.23 Mpc",
    },
  },
  {
    id: "cosmic_microwave_background_sky",
    order: 6,
    name: "6. Cosmic Microwave Background (CMB) Sky",
    subtitle: "Acoustic Oscillations in the Primordial Fluid",
    epochRange: "t ≈ 380,000 yr (Observed Today at z = 1090)",
    timeSeconds: 1.2e13,
    timeGyr: 0.00038,
    redshiftZ: "z = 1089.8 ± 0.2",
    redshiftNum: 1089.8,
    temperatureKelvin: "T_0 = 2.7255 K (Emitted at 2970 K)",
    temperatureNum: 2.7255,
    energyScale: "0.235 meV (Microwaves)",
    scaleFactorA: 0.000917,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "cmb_sky",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel:
      "All-Sky Empirical Data (ESA Planck Satellite PR3 / PR4 Legacy Release)",
    scientificProcess:
      "Before recombination, gravity pulled matter into overdensities while photon radiation pressure pushed it out, setting up acoustic sound waves (Baryon Acoustic Oscillations, BAO) in the photon-baryon fluid. When recombination occurred, the pattern of acoustic wave peaks was frozen into the temperature and polarization of the CMB sky.",
    observationalEvidence:
      "Planck 2018 angular power spectrum TT, TE, and EE multipoles (ell = 2 to 2500) measuring 7 acoustic peaks with exceptional sub-percent precision, establishing the concordance Lambda-CDM model.",
    knownUncertainties:
      "Large-scale anomalies (low quadrupole power, hemispherical power asymmetry, cold spot) and the Hubble Tension: early universe H_0 from CMB is 67.4 ± 0.5 km/s/Mpc, while local late-time distance ladder (SH0ES) measures 73.04 ± 1.04 km/s/Mpc (>5 sigma discrepancy).",
    scientificCitations: [
      {
        authors: "Planck Collaboration",
        year: 2020,
        title: "Planck 2018 results. I. Overview and the cosmological legacy of Planck",
        journal: "Astron. Astrophys. 641, A1",
      },
      {
        authors: "Riess, A.G., et al. (SH0ES)",
        year: 2022,
        title: "A Comprehensive Measurement of the Local Value of the Hubble Constant",
        journal: "Astrophysical Journal Letters 934, L7",
      },
    ],
    guidedNarration: {
      studentSummary:
        "The red and blue spots on the CMB map are sound waves frozen in time! Red spots were slightly warmer, blue spots slightly cooler; those cooler dense spots grew into all the galaxies we see today.",
      inDepthExplanation:
        "The first acoustic peak at angular scale theta ≈ 1 degree corresponds to the sound horizon at decoupling. Because this peak lands precisely at 1 degree on our sky, it proves spatial geometry is flat (Omega_k ≈ 0).",
      keyTakeaway:
        "Sound waves in the baby universe created the blueprint for where all galaxy clusters and filaments would form billions of years later.",
    },
    advancedPhysics: {
      keyEquationName: "CMB Multipole Expansion & Sound Horizon",
      latexEquation:
        "C_\\ell = \\frac{1}{2\\ell+1}\\sum_{m=-\\ell}^{\\ell}|a_{\\ell m}|^2, \\quad \\ell_1 = \\frac{\\pi D_M(z_*)}{r_s(z_*)} \\approx 220",
      equationDescription:
        "The first acoustic peak occurs at multipole ell_1 ≈ 220, demonstrating flat spatial curvature (Omega_k = 0.0007 ± 0.0019) via the transverse comoving distance D_M.",
      cosmicDensityParameters: { omegaM: 0.3153, omegaLambda: 0.6847, omegaRad: 0.00008 },
      physicalScaleNote: "Angular size of first peak theta_s = 0.5965° (1.041 x 10^-2 rad)",
    },
  },
  {
    id: "cosmic_dark_ages",
    order: 7,
    name: "7. The Cosmic Dark Ages",
    subtitle: "Silent Growth of Dark Matter Halos",
    epochRange: "t ≈ 380,000 yr to 150 Million yr",
    timeSeconds: 4.7e15,
    timeGyr: 0.1,
    redshiftZ: "z ≈ 1100 to 30",
    redshiftNum: 50,
    temperatureKelvin: "T drops from 3000 K to 60 K",
    temperatureNum: 139,
    energyScale: "12 meV",
    scaleFactorA: 0.0196,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "gravitational_growth",
    dataStatus: "simulation_reconstruction",
    observedVsSimulatedLabel:
      "Cosmological N-Body Theory & 21-cm Hydrogen Physics (Pre-Star Formation)",
    scientificProcess:
      "Space was inky black. Baryonic gas cooled faster than the CMB (T_gas ~ (1+z)^2). Dark matter, unaffected by photon pressure, had already begun collapsing into gravitational wells. Neutral hydrogen filled the universe, occasionally emitting 21-cm (1420 MHz) hyperfine radio waves when hydrogen atom electron and proton spins flipped.",
    observationalEvidence:
      "Direct 21-cm global signal and tomography experiments (EDGES, HERA, LOFAR, NenuFAR, SKA-Low) are actively mapping this epoch to measure neutral hydrogen absorption against the CMB background.",
    knownUncertainties:
      "The EDGES reported absorption trough at 78 MHz (z ≈ 17) is roughly twice as deep as standard astrophysics predicts, sparking debate over whether gas was cooled by dark matter interactions or experimental systematic effects (SARAS 3 non-detection).",
    scientificCitations: [
      {
        authors: "Bowman, J.D., et al.",
        year: 2018,
        title: "An absorption profile centred at 78 megahertz in the sky-averaged spectrum",
        journal: "Nature 555, 67-70",
      },
      {
        authors: "Singh, S., et al. (SARAS 3)",
        year: 2022,
        title: "On the detection of a cosmic dawn signal in the radio background",
        journal: "Nature Astronomy 6, 607",
      },
    ],
    guidedNarration: {
      studentSummary:
        "For over 100 million years, space was pitch black! No stars had lit up yet. In total darkness, invisible dark matter was quietly pulling gas into the first cosmic pockets.",
      inDepthExplanation:
        "Without any stars or black holes, the cosmos was entirely dark. The only glow was the fading red ember of the CMB shifting into infrared and microwave wavelengths. Meanwhile, dark matter mini-halos grew like invisible scaffolding.",
      keyTakeaway:
        "Dark matter did all the heavy lifting in the Dark Ages, building the gravitational nests where the first stars would soon be born.",
    },
    advancedPhysics: {
      keyEquationName: "Linear Density Perturbation Growth",
      latexEquation:
        "\\delta(t) = \\frac{\\delta\\rho}{\\rho} \\propto a(t) \\propto t^{2/3} \\quad (\\text{Matter Domination})",
      equationDescription:
        "In the linear regime, gravitational instability causes matter density perturbations delta to grow linearly with the cosmic scale factor a(t).",
      cosmicDensityParameters: { omegaM: 0.99, omegaLambda: 0.01, omegaRad: 0.001 },
      physicalScaleNote: "Jeans mass M_J ≈ 10^5 to 10^6 M_sun in dark matter mini-halos",
    },
  },
  {
    id: "formation_first_stars",
    order: 8,
    name: "8. Formation of the First Stars (Pop III)",
    subtitle: "Cosmic Dawn & The First Light",
    epochRange: "t ≈ 150 to 300 Million years",
    timeSeconds: 7.9e15,
    timeGyr: 0.25,
    redshiftZ: "z ≈ 30 to 15",
    redshiftNum: 20,
    temperatureKelvin: "T_gas ≈ 30 – 100 K",
    temperatureNum: 57,
    energyScale: "5 meV",
    scaleFactorA: 0.0476,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "first_stars",
    dataStatus: "simulation_reconstruction",
    observedVsSimulatedLabel:
      "Theoretical Radiation Hydrodynamics Simulations (Pop III Stellar Models)",
    scientificProcess:
      "Inside dark matter mini-halos of mass ~10⁶ M_sun, pristine hydrogen and helium gas cooled solely through molecular hydrogen (H₂) rotational transitions. Because H₂ cooling is far less efficient than metal cooling, Jeans masses were huge: the first stars (Population III) were monsters of 50 to 300+ solar masses, burning furiously with surface temperatures over 50,000 K.",
    observationalEvidence:
      "Indirect: Pristine extremely metal-poor stars in the Milky Way halo with distinctive nucleosynthetic fingerprints of pair-instability supernovae, and JWST spectroscopic detection of high-ionization He II emission lines at z > 10.",
    knownUncertainties:
      "The initial mass function (IMF) of Population III stars: whether protostellar gas disks fragmented into multiple 10–50 M_sun stars or formed isolated single hypermassive giants exceeding 500 M_sun.",
    scientificCitations: [
      {
        authors: "Bromm, V. & Larson, R.B.",
        year: 2004,
        title: "The First Stars",
        journal: "Annual Review of Astronomy and Astrophysics 42, 79",
      },
      {
        authors: "Heger, A. & Woosley, S.E.",
        year: 2002,
        title: "The Nucleosynthetic Signature of Population III",
        journal: "Astrophysical Journal 567, 532",
      },
    ],
    guidedNarration: {
      studentSummary:
        "The very first stars were pure blue giants, hundreds of times heavier than our Sun! They lived fast, died young in colossal explosions, and seeded space with the universe's first metals.",
      inDepthExplanation:
        "Because there was no carbon, oxygen, or iron to cool the collapsing gas clouds, the gas stayed warm and only formed gigantic stars. These stars produced vast amounts of ultraviolet light and ended in catastrophic pair-instability supernovae.",
      keyTakeaway:
        "The first stars transformed the universe from a quiet, dark expanse into a radiant, chemically enriched cosmos.",
    },
    advancedPhysics: {
      keyEquationName: "Jeans Mass Criterion for Pristine Gas",
      latexEquation:
        "M_J = \\frac{\\pi}{6}\\rho\\left(\\frac{\\pi c_s^2}{G\\rho}\\right)^{3/2} \\propto T^{3/2}\\rho^{-1/2}",
      equationDescription:
        "Without heavy elements, molecular H_2 cooling limits the minimum cloud temperature to T ~ 200 K, elevating the Jeans mass to ~10^2 - 10^3 M_sun.",
      cosmicDensityParameters: { omegaM: 0.98, omegaLambda: 0.02, omegaRad: 0.0001 },
      physicalScaleNote:
        "Stellar lifetimes were brief: ~2 to 3 million years before total collapse",
    },
  },
  {
    id: "early_galaxies_reionization",
    order: 9,
    name: "9. Early Galaxies & Cosmic Reionization",
    subtitle: "Overlapping Strömgren Bubbles Clear the IGM",
    epochRange: "t ≈ 300 Million yr to 1 Billion yr",
    timeSeconds: 2.2e16,
    timeGyr: 0.7,
    redshiftZ: "z ≈ 15 to 6",
    redshiftNum: 8,
    temperatureKelvin: "T_IGM ≈ 10,000 – 20,000 K (Ionized)",
    temperatureNum: 24.5,
    energyScale: "2.1 meV",
    scaleFactorA: 0.111,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "first_stars",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel: "Confirmed JWST Empirical Discoveries (JADES-GS-z14-0 & GN-z11)",
    scientificProcess:
      "Vast numbers of star-forming dwarf protogalaxies and early active galactic nuclei poured energetic ultraviolet photons (E > 13.6 eV) into intergalactic space. Each galaxy carved an expanding bubble (Strömgren sphere) of ionized hydrogen. Eventually, these bubbles merged together, completely reionizing the intergalactic medium (IGM) by z ≈ 5.8.",
    observationalEvidence:
      "JWST NIRCam & NIRSpec discovery of confirmed high-redshift galaxies: JADES-GS-z14-0 at z = 14.32 (t = 290 Myr) and GN-z11 at z = 10.60. High-redshift quasar spectra show the Gunn-Peterson trough vanishing at z < 6, proving reionization finished by t ≈ 1 Gyr.",
    knownUncertainties:
      "The relative contribution of faint dwarf galaxies versus early supermassive black holes/quasars to the reionization photon budget, and the surprisingly high stellar mass densities observed in z > 10 galaxies by JWST.",
    scientificCitations: [
      {
        authors: "Carniani, S., et al. (JADES)",
        year: 2024,
        title: "A shining cosmic dawn: properties of an exceptionally bright galaxy at z = 14",
        journal: "Nature 633, 318-322",
      },
      {
        authors: "Fan, X., et al.",
        year: 2006,
        title: "A Survey of z > 5.7 Quasars in the Sloan Digital Sky Survey. VI.",
        journal: "Astronomical Journal 132, 117",
      },
    ],
    guidedNarration: {
      studentSummary:
        "JWST discovered bright baby galaxies that lit up the darkness! Their ultraviolet light carved giant bubbles through the hydrogen gas until all space was clear and transparent again.",
      inDepthExplanation:
        "Cosmic reionization was the last major phase change of hydrogen in the universe. Before this, ultraviolet light was absorbed by neutral gas; after reionization, intergalactic space became permanently transparent to UV light.",
      keyTakeaway:
        "JWST showed us that early galaxies grew much faster and brighter than anyone predicted.",
    },
    advancedPhysics: {
      keyEquationName: "Gunn-Peterson Optical Depth",
      latexEquation:
        "\\tau_{\\text{GP}} = \\frac{\\pi e^2 f_{\\alpha}}{m_e c}\\frac{n_{\\text{H I}}}{H(z)} \\gg 1 \\quad (\\text{for neutral fraction } x_{\\text{H I}} > 10^{-4})",
      equationDescription:
        "Even a minuscule fraction of neutral hydrogen produces complete absorption in Lyman-alpha. Its disappearance at z < 5.8 proves reionization was complete.",
      cosmicDensityParameters: { omegaM: 0.95, omegaLambda: 0.05, omegaRad: 0.00005 },
      physicalScaleNote: "JADES-GS-z14-0: redshift z = 14.32, universe age ~290 million years",
    },
  },
  {
    id: "supermassive_black_hole_growth",
    order: 10,
    name: "10. Supermassive Black Hole Seed Growth & Quasars",
    subtitle: "Cosmic Monsters at the Dawn of Time",
    epochRange: "t ≈ 700 Million yr to 2 Billion yr",
    timeSeconds: 4.7e16,
    timeGyr: 1.5,
    redshiftZ: "z ≈ 7 to 3",
    redshiftNum: 4.5,
    temperatureKelvin: "Accretion disks T > 10⁶ K",
    temperatureNum: 15.0,
    energyScale: "Quasar X-rays / Gamma-rays",
    scaleFactorA: 0.182,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "galaxy_assembly",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel:
      "Empirical Observations from Subaru, Magellan, Keck & JWST Quasar Surveys",
    scientificProcess:
      "Centres of massive protogalaxies hosted black hole seeds that grew into billion-solar-mass supermassive black holes within less than 800 million years after the Big Bang. Gas falling onto these black holes released enormous gravitational potential energy as radiation, making high-redshift quasars the brightest beacons in the cosmos.",
    observationalEvidence:
      "Confirmed hyper-luminous quasars at z > 7: J0313-1806 (z = 7.64, M_BH ≈ 1.6 × 10⁹ M_sun) and J1342+0928 (z = 7.54, M_BH ≈ 8 × 10⁸ M_sun), observed when the universe was only 670 million years old.",
    knownUncertainties:
      "The 'Seed Problem': Standard Eddington-limited accretion from 100 M_sun Pop III remnants cannot grow a billion-solar-mass black hole in 700 Myr. Leading hypotheses include Direct Collapse Black Holes (DCBHs) forming 10⁴–10⁵ M_sun seeds, or super-Eddington accretion episodes.",
    scientificCitations: [
      {
        authors: "Wang, F., et al.",
        year: 2021,
        title: "A Luminous Quasar at z = 7.642",
        journal: "Astrophysical Journal Letters 907, L1",
      },
      {
        authors: "Volonteri, M.",
        year: 2010,
        title: "Formation of supermassive black holes",
        journal: "Astronomy and Astrophysics Review 18, 279",
      },
    ],
    guidedNarration: {
      studentSummary:
        "Supermassive black holes weighing a billion times more than our Sun were already feasting when the universe was less than a billion years old, shining brighter than whole galaxies!",
      inDepthExplanation:
        "How these black holes grew so huge so quickly is one of the greatest mysteries in modern astronomy. They outshone their host galaxies, blasting out relativistic jets and driving cosmic winds that regulated star formation.",
      keyTakeaway:
        "Billion-solar-mass black holes formed remarkably early, acting as powerful engines in young galaxies.",
    },
    advancedPhysics: {
      keyEquationName: "Salpeter Accretion Timescale",
      latexEquation:
        "t_{\\text{Salpeter}} = \\frac{\\epsilon\\,\\sigma_T c}{4\\pi G m_p (1 - \\epsilon)} \\approx 45 \\text{ Myr}, \\quad M(t) = M_0\\,e^{t / t_{\\text{Salpeter}}}",
      equationDescription:
        "Exponential mass growth under Eddington-limited accretion with radiative efficiency epsilon = 0.1 requires ~16 e-folds (~700 Myr) starting from a stellar seed.",
      cosmicDensityParameters: { omegaM: 0.91, omegaLambda: 0.09, omegaRad: 0.00003 },
      physicalScaleNote: "J0313-1806: M_BH ≈ 1.6 billion M_sun at z = 7.642 (t = 670 Myr)",
    },
  },
  {
    id: "growth_galaxy_clusters_filaments",
    order: 11,
    name: "11. Growth of Galaxy Clusters & Cosmic Filaments",
    subtitle: "Hierarchical Gravitational Clustering",
    epochRange: "t ≈ 1.5 to 4 Billion years",
    timeSeconds: 9.5e16,
    timeGyr: 3.0,
    redshiftZ: "z ≈ 4 to 1.5",
    redshiftNum: 2.5,
    temperatureKelvin: "Intracluster Gas T > 10⁷ K",
    temperatureNum: 9.5,
    energyScale: "Thermal Bremsstrahlung X-rays",
    scaleFactorA: 0.286,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "cosmic_web",
    dataStatus: "simulation_reconstruction",
    observedVsSimulatedLabel:
      "IllustrisTNG & Millennium Simulation Halos Cross-Checked with X-Ray Observations",
    scientificProcess:
      "Hierarchical bottom-up structure formation: smaller dark matter halos merged continuously along dense gravitational filaments. Gas falling into these massive potential wells was shock-heated to tens of millions of degrees (Warm-Hot Intergalactic Medium, WHIM), forming the hot intracluster medium (ICM) of nascent galaxy clusters.",
    observationalEvidence:
      "X-ray observations (Chandra, XMM-Newton, eROSITA) showing shock-heated ICM gas in proto-clusters at z > 2, and the Sunyaev-Zel'dovich (SZ) effect in Planck and ACT data revealing the thermal pressure of cluster gas.",
    knownUncertainties:
      "Baryonic feedback physics: how much kinetic and thermal energy AGN jets inject back into the cluster gas to prevent runaway cooling ('cooling flows') in central cluster galaxies.",
    scientificCitations: [
      {
        authors: "Springel, V., et al.",
        year: 2005,
        title: "Simulations of the formation, evolution and clustering of galaxies and quasars",
        journal: "Nature 435, 629",
      },
      {
        authors: "Pillepich, A., et al. (IllustrisTNG)",
        year: 2018,
        title:
          "First results from the IllustrisTNG simulations: the stellar mass content of groups and clusters",
        journal: "Monthly Notices of the RAS 475, 648",
      },
    ],
    guidedNarration: {
      studentSummary:
        "Galaxies traveled along gigantic bridges of dark matter like cars on cosmic highways, piling up at the intersections to build massive galaxy clusters!",
      inDepthExplanation:
        "Gravity pulled halos together along filamentary dark matter spines. As gas crashed into the centers of these clusters, it was heated to tens of millions of degrees, glowing brightly in X-rays.",
      keyTakeaway:
        "The cosmic web channeled galaxies into dense clusters containing trillions of stars.",
    },
    advancedPhysics: {
      keyEquationName: "Virial Shock Heating in Halos",
      latexEquation:
        "T_{\\text{vir}} = \\frac{\\mu m_p G M_{200}}{2 k_B R_{200}} \\propto M_{200}^{2/3} (1+z)",
      equationDescription:
        "Gravitational infall shock-heats gas entering a 10^14 - 10^15 M_sun cluster halo to virial temperatures T_vir > 10^7 K, emitting thermal X-rays.",
      cosmicDensityParameters: { omegaM: 0.83, omegaLambda: 0.17, omegaRad: 0.00002 },
      physicalScaleNote:
        "Cluster masses exceed 10^14 - 10^15 M_sun with virial radii R_200 > 2 Mpc",
    },
  },
  {
    id: "cosmic_noon_mature_galaxies",
    order: 12,
    name: "12. Cosmic Noon & Mature Galaxy Assembly",
    subtitle: "Peak Star Formation & Morphology Emergence",
    epochRange: "t ≈ 3 to 6 Billion years",
    timeSeconds: 1.4e17,
    timeGyr: 4.5,
    redshiftZ: "z ≈ 2.5 to 1.0",
    redshiftNum: 1.8,
    temperatureKelvin: "T_CMB ≈ 7.6 K",
    temperatureNum: 7.6,
    energyScale: "Optical / Far-Infrared",
    scaleFactorA: 0.357,
    dominantEnergyComponent: "Matter (Dark + Baryonic)",
    visualStageId: "galaxy_assembly",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel: "Empirically Mapped by Hubble Deep Fields, ALMA, Herschel & JWST",
    scientificProcess:
      "The universe experienced its most frantic, prolific epoch of star formation: the cosmic star formation rate density peaked at roughly 10 times its present value (the Madau-Dickinson relation). Dense, turbulent rotating gas disks formed spiral arms, while massive gas-rich mergers formed elliptical galaxies and drove extreme starbursts.",
    observationalEvidence:
      "Deep-field galaxy surveys across UV, optical, submillimeter, and radio wavelengths (Hubble GOODS, CANDELS, ALMA COSMOS, JWST CEERS) measuring the cosmic star formation history and the morphological Hubble sequence.",
    knownUncertainties:
      "The quenching mechanism: the exact physical interplay between supernova feedback, AGN jet heating, and virial shock heating that permanently shuts down star formation in massive elliptical galaxies ('red and dead' galaxies).",
    scientificCitations: [
      {
        authors: "Madau, P. & Dickinson, M.",
        year: 2014,
        title: "Cosmic Star-Formation History",
        journal: "Annual Review of Astronomy and Astrophysics 52, 415",
      },
      {
        authors: "Förster Schreiber, N.M. & Wuyts, S.",
        year: 2020,
        title: "Star-Forming Galaxies at Cosmic Noon",
        journal: "Annual Review of Astronomy and Astrophysics 58, 661",
      },
    ],
    guidedNarration: {
      studentSummary:
        "About 10 billion years ago was 'Cosmic Noon': the universe was churning out new stars ten times faster than it does today! Galaxies crashed together in spectacular fireworks of star formation.",
      inDepthExplanation:
        "This era built the core of the galaxies we see around us today. Gas poured into disks along cosmic filaments, fueling intense starbursts until central supermassive black holes blew out the gas and cooled things down.",
      keyTakeaway:
        "Cosmic Noon was the high-water mark of star creation; most stars in the universe were born during this era.",
    },
    advancedPhysics: {
      keyEquationName: "Madau-Dickinson Star Formation Density",
      latexEquation:
        "\\psi(z) = 0.015 \\frac{(1+z)^{2.7}}{1 + [(1+z)/2.9]^{5.6}} \\quad [M_\\odot\\,\\text{yr}^{-1}\\,\\text{Mpc}^{-3}]",
      equationDescription:
        "Empirical fit to the cosmic star formation rate density, demonstrating a steep rise from z = 8 to a broad peak around z ≈ 1.9 (Cosmic Noon), followed by an exponential decline.",
      cosmicDensityParameters: { omegaM: 0.74, omegaLambda: 0.26, omegaRad: 0.00001 },
      physicalScaleNote: "Peak star formation rate density ≈ 0.15 M_sun / yr / Mpc^3 at z ≈ 1.9",
    },
  },
  {
    id: "chemical_enrichment_heavy_elements",
    order: 13,
    name: "13. Heavy-Element Enrichment & Stardust",
    subtitle: "Forging the Periodic Table Across Stellar Generations",
    epochRange: "t ≈ 5 to 9 Billion years",
    timeSeconds: 2.2e17,
    timeGyr: 7.0,
    redshiftZ: "z ≈ 1.2 to 0.4",
    redshiftNum: 0.8,
    temperatureKelvin: "T_CMB ≈ 4.9 K",
    temperatureNum: 4.9,
    energyScale: "Nucleosynthesis (MeV per nucleon)",
    scaleFactorA: 0.556,
    dominantEnergyComponent: "Matter transitioning to Dark Energy",
    visualStageId: "galaxy_assembly",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel:
      "Empirical Stellar Spectroscopy (Gaia-ESO, APOGEE, LAMOST) & Kilonova GW170817",
    scientificProcess:
      "Multiple generations of Population II and Population I stars enriched the interstellar medium: Core-collapse supernovae forged alpha-elements (oxygen, neon, magnesium, silicon); Type Ia supernovae produced iron-peak elements; asymptotic giant branch (AGB) stars produced s-process elements; and colliding neutron stars (kilonovae) produced rapid neutron-capture (r-process) elements including gold, platinum, and uranium.",
    observationalEvidence:
      "Spectroscopic stellar surveys measuring stellar metallicities [Fe/H] and [alpha/Fe] across galactic disks and halos. Gravitational wave detection of neutron star merger GW170817 with its optical/IR kilonova counterpart confirming heavy r-process element production.",
    knownUncertainties:
      "The relative contribution of neutron star mergers versus rare magnetorotational core-collapse hypernovae to the total cosmic budget of gold, platinum, and actinide elements.",
    scientificCitations: [
      {
        authors: "Abbott, B.P., et al. (LIGO/Virgo)",
        year: 2017,
        title: "Multi-messenger Observations of a Binary Neutron Star Merger",
        journal: "Astrophysical Journal Letters 848, L12",
      },
      {
        authors: "Kobayashi, C., Karakas, A.I. & Lugaro, M.",
        year: 2020,
        title: "The Origin of Elements from Carbon to Uranium",
        journal: "Astrophysical Journal 900, 179",
      },
    ],
    guidedNarration: {
      studentSummary:
        "Every atom of oxygen you breathe, iron in your blood, and gold in a ring was cooked inside dying stars and colliding neutron stars over billions of years!",
      inDepthExplanation:
        "The Big Bang produced only hydrogen and helium. It took successive generations of giant stars living, exploding, and colliding to fill the universe with carbon, oxygen, iron, and precious metals.",
      keyTakeaway:
        "We are literally made of stardust: the atoms in your body were created in supernova explosions and neutron star collisions.",
    },
    advancedPhysics: {
      keyEquationName: "Chemical Metallicity Growth Rate",
      latexEquation:
        "Z(t) = -y_Z \\ln\\left(\\frac{M_{\\text{gas}}(t)}{M_{\\text{gas}}(0)}\\right) \\quad (\\text{Simple Closed-Box Model})",
      equationDescription:
        "Yield y_Z connects stellar nucleosynthetic production directly to interstellar gas metallicity fraction Z = M_metals / M_total.",
      cosmicDensityParameters: { omegaM: 0.53, omegaLambda: 0.47, omegaRad: 0.00001 },
      physicalScaleNote:
        "Interstellar gas metallicity rose from Z ≈ 0 to Solar value Z_sun ≈ 0.014",
    },
  },
  {
    id: "formation_solar_system",
    order: 14,
    name: "14. Formation of the Solar System & Earth",
    subtitle: "The Birth of Our Planetary Home",
    epochRange: "t ≈ 9.2 Billion yr after Big Bang (4.57 Gyr Ago)",
    timeSeconds: 2.9e17,
    timeGyr: 9.23,
    redshiftZ: "z = 0.45",
    redshiftNum: 0.45,
    temperatureKelvin: "T_CMB = 3.95 K",
    temperatureNum: 3.95,
    energyScale: "Gravitational Collapse & Planetesimal Accretion",
    scaleFactorA: 0.69,
    dominantEnergyComponent: "Dark Energy (Expansion Accelerating)",
    visualStageId: "modern_distribution",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel:
      "Empirical Meteoritic Radiometric Dating (CAIs in Allende Meteorite) & ALMA Protoplanetary Disks",
    scientificProcess:
      "A parcel of chemically enriched interstellar molecular gas and dust in the Orion Arm of the Milky Way collapsed under gravity, possibly triggered by a nearby supernova. Conservation of angular momentum flattened the collapsing cloud into a rotating protoplanetary disk. Dust grains condensed into pebbles, planetesimals, and ultimately rocky terrestrial worlds and gas giants.",
    observationalEvidence:
      "Uranium-lead radiometric dating of Calcium-Aluminum-rich Inclusions (CAIs) in pristine carbonaceous chondrite meteorites fixes the formation of the Solar System precisely at 4.5673 ± 0.00016 billion years ago. ALMA millimeter images (DSHARP survey) directly resolve gaps and rings carved by forming planets in protoplanetary disks around young stars like HL Tauri.",
    knownUncertainties:
      "Early giant planet orbital migration pathways (Grand Tack hypothesis versus Nice model) and the exact primary delivery mechanism for Earth's surface water (asteroidal chondrites versus icy comets).",
    scientificCitations: [
      {
        authors: "Connelly, J.N., et al.",
        year: 2012,
        title:
          "The Absolute Chronology and Thermal Processing of Solids in the Solar Protoplanetary Disk",
        journal: "Science 338, 651-655",
      },
      {
        authors: "Andrews, S.M., et al. (DSHARP)",
        year: 2018,
        title: "The Disk Substructures at High Angular Resolution Project (DSHARP)",
        journal: "Astrophysical Journal Letters 869, L41",
      },
    ],
    guidedNarration: {
      studentSummary:
        "Nine billion years into cosmic history, a swirling cloud of gas and stardust flattened into our Sun and eight planets. Earth formed as rocky rubble clumped together in the warm inner zone!",
      inDepthExplanation:
        "The Sun ignited nuclear fusion at its core, blowing away residual gas. In the inner solar system, only rocky materials and metals could condense, assembling Mercury, Venus, Earth, and Mars, while gas giants took shape past the frost line.",
      keyTakeaway:
        "The Solar System is a relatively late arrival in the universe, forming when the cosmos was already two-thirds of its present age.",
    },
    advancedPhysics: {
      keyEquationName: "Solar Nebula Angular Momentum Conservation",
      latexEquation: "L = I\\omega = \\text{const}, \\quad v_K = \\sqrt{\\frac{G M_\\odot}{r}}",
      equationDescription:
        "Keplerian rotation in the flattened protoplanetary disk governed dust settling, planetesimal accretion, and giant planet core formation.",
      cosmicDensityParameters: { omegaM: 0.42, omegaLambda: 0.58, omegaRad: 0.000009 },
      physicalScaleNote: "Exact age of Solar System from meteoritic CAIs: 4.5673 ± 0.0002 Gyr",
    },
  },
  {
    id: "present_day_large_scale_structure",
    order: 15,
    name: "15. Present-Day Large-Scale Structure & Dark Energy",
    subtitle: "The Mature Cosmic Web & Accelerated Metric Expansion",
    epochRange: "t = 13.8 Billion years (Present Day)",
    timeSeconds: 4.35e17,
    timeGyr: 13.8,
    redshiftZ: "z = 0.0",
    redshiftNum: 0.0,
    temperatureKelvin: "T_CMB = 2.7255 K",
    temperatureNum: 2.7255,
    energyScale: "2.35 meV (CMB) / Vacuum Energy Density",
    scaleFactorA: 1.0,
    dominantEnergyComponent: "Dark Energy (68.5% of Total Energy Density)",
    visualStageId: "modern_distribution",
    dataStatus: "empirical_observation",
    observedVsSimulatedLabel:
      "Empirical Galaxy Surveys (SDSS DR18, 2MASS 2MRS, DESI) + TNG300 Simulation Benchmark",
    scientificProcess:
      "Today, the universe spans an observable diameter of ~93 billion light-years (46.5 Gly comoving radius). Galaxies are organized in an intricate cosmic web of dense clusters, wall-like sheets, and long filaments surrounding vast cosmic voids up to 150 million light-years across. Cosmic expansion is accelerating, driven by dark energy with negative pressure.",
    observationalEvidence:
      "Direct 3D spectroscopic galaxy surveys: Sloan Digital Sky Survey (SDSS), Dark Energy Spectroscopic Instrument (DESI), 2MASS Redshift Survey. Supernova Type Ia acceleration discovery (Perlmutter, Riess, Schmidt, 1998 Nobel Prize).",
    knownUncertainties:
      "The nature of Dark Energy: is it an exact cosmological constant (w = -1, vacuum zero-point energy) or dynamical quintessence? DESI Year 1 BAO results show tantalizing hints of time-varying dark energy (w_0 w_a parameter space).",
    scientificCitations: [
      {
        authors: "DESI Collaboration",
        year: 2024,
        title:
          "DESI 2024 VI: Cosmological Constraints from the Measurements of Baryon Acoustic Oscillations",
        journal: "arXiv:2404.03002",
      },
      {
        authors: "Riess, A.G., et al.",
        year: 1998,
        title: "Observational Evidence from Supernovae for an Accelerating Universe",
        journal: "Astronomical Journal 116, 1009",
      },
      {
        authors: "Perlmutter, S., et al.",
        year: 1999,
        title: "Measurements of Omega and Lambda from 42 High-Redshift Supernovae",
        journal: "Astrophysical Journal 517, 565",
      },
    ],
    guidedNarration: {
      studentSummary:
        "Today, the universe is 13.8 billion years old! Billions of galaxies are woven into a gigantic cosmic web, and mysterious dark energy is causing space to expand faster and faster every day.",
      inDepthExplanation:
        "Matter makes up only ~31% of the total energy density of the universe today (with normal atoms making up only 5%). Dark energy accounts for the remaining 69%, accelerating cosmic expansion and freezing further gravitational collapse on the largest cosmological scales.",
      keyTakeaway:
        "We live in a mature cosmic web where dark energy governs the future fate of the cosmos.",
    },
    advancedPhysics: {
      keyEquationName: "Lambda-CDM Acceleration Equation",
      latexEquation:
        "\\frac{\\ddot{a}}{a} = -\\frac{4\\pi G}{3}\\left(\\rho + \\frac{3p}{c^2}\\right) = \\frac{\\Lambda c^2}{3} - \\frac{4\\pi G}{3}\\rho_m",
      equationDescription:
        "When dark energy density exceeds half the matter density (z < 0.4), positive acceleration (\\ddot{a} > 0) takes over, causing accelerated metric expansion.",
      cosmicDensityParameters: { omegaM: 0.315, omegaLambda: 0.685, omegaRad: 0.00008 },
      physicalScaleNote:
        "Observable universe comoving particle horizon radius = 46.5 Gly (14.26 Gpc)",
    },
  },
];

/**
 * Visual Stages definition for the 7 rendering modes
 */
export interface VisualStageConfig {
  id: VisualStageId;
  name: string;
  shortDescription: string;
  associatedEpochIds: string[];
  cameraPacing: string;
  visualMetaphor: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    ambient: string;
  };
  simulationNotes: string;
}

export const VISUAL_STAGES_CONFIG: Record<VisualStageId, VisualStageConfig> = {
  early_plasma: {
    id: "early_plasma",
    name: "1. Early Plasma & Density Fluctuations",
    shortDescription: "Ultra-hot relativistic plasma fluid oscillating with primordial sound waves",
    associatedEpochIds: [
      "hot_big_bang_expansion",
      "inflation_hypothesis",
      "particle_formation_early_plasma",
      "primordial_nucleosynthesis",
    ],
    cameraPacing: "Fast energetic metric vibrations with fluid particle circulation",
    visualMetaphor: "Relativistic subatomic particle soup colliding in blinding incandescent heat",
    colorPalette: {
      primary: "#f59e0b",
      secondary: "#ef4444",
      accent: "#a855f7",
      ambient: "#450a0a",
    },
    simulationNotes:
      "Fluid particle acoustic oscillations simulating relativistic sound waves propagating at c_s = c / sqrt(3).",
  },
  cmb_sky: {
    id: "cmb_sky",
    name: "2. CMB Sky Visualization",
    shortDescription:
      "Surface of last scattering displaying frozen acoustic temperature multipoles",
    associatedEpochIds: ["recombination_photon_decoupling", "cosmic_microwave_background_sky"],
    cameraPacing: "Slow celestial rotation across full spherical harmonic multipole projection",
    visualMetaphor: "Golden-amber acoustic ripples on a 2.7K thermal blackbody surface",
    colorPalette: {
      primary: "#38bdf8",
      secondary: "#f97316",
      accent: "#fbbf24",
      ambient: "#022c22",
    },
    simulationNotes:
      "Spherical harmonic multipole synthesis with Planck 2018 power spectrum peak at ell ≈ 220.",
  },
  gravitational_growth: {
    id: "gravitational_growth",
    name: "3. Gravitational Structure Growth",
    shortDescription:
      "Dark matter mini-halos silently collapsing under Jeans gravitational instability",
    associatedEpochIds: ["cosmic_dark_ages"],
    cameraPacing: "Subtle inward gravitational convergence into filamentary nodes",
    visualMetaphor: "Deep midnight blue dark matter density contours channeling diffuse gas",
    colorPalette: {
      primary: "#60a5fa",
      secondary: "#312e81",
      accent: "#06b6d4",
      ambient: "#030712",
    },
    simulationNotes:
      "Linear perturbation growth delta ~ a(t) feeding hierarchical dark matter potential wells.",
  },
  first_stars: {
    id: "first_stars",
    name: "4. First Star Populations & Reionization",
    shortDescription: "Zero-metallicity Pop III hypergiants igniting and carving ionized bubbles",
    associatedEpochIds: ["formation_first_stars", "early_galaxies_reionization"],
    cameraPacing: "Dynamic bursts of ionization front expansion into neutral hydrogen fog",
    visualMetaphor:
      "Fierce ultraviolet blue-white stellar cores expanding translucent ionization cavities",
    colorPalette: {
      primary: "#06b6d4",
      secondary: "#3b82f6",
      accent: "#f43f5e",
      ambient: "#0f172a",
    },
    simulationNotes:
      "Strömgren sphere radial expansion simulating UV photoionization clearing neutral hydrogen.",
  },
  galaxy_assembly: {
    id: "galaxy_assembly",
    name: "5. Galaxy Assembly & Active Nuclei",
    shortDescription: "Turbulent protogalaxies colliding and feeding central supermassive quasars",
    associatedEpochIds: [
      "supermassive_black_hole_growth",
      "cosmic_noon_mature_galaxies",
      "chemical_enrichment_heavy_elements",
    ],
    cameraPacing: "Orbiting spiral inflows with beamed relativistic accretion jets",
    visualMetaphor:
      "Vibrant magenta-gold starburst disks with high velocity dispersion and quasar outflows",
    colorPalette: {
      primary: "#ec4899",
      secondary: "#8b5cf6",
      accent: "#facc15",
      ambient: "#1e1b4b",
    },
    simulationNotes:
      "Kinematic disk shear with tidal tails and relativistic biconical AGN jet outflows.",
  },
  cosmic_web: {
    id: "cosmic_web",
    name: "6. Cosmic-Web Evolution",
    shortDescription: "IllustrisTNG multi-snapshot density web evolution from z=6 to z=0",
    associatedEpochIds: ["growth_galaxy_clusters_filaments"],
    cameraPacing: "Deep volumetric zoom through interconnected cosmic filaments and giant voids",
    visualMetaphor:
      "Luminous spiderweb of matter connecting massive galaxy clusters across hundreds of megaparsecs",
    colorPalette: {
      primary: "#818cf8",
      secondary: "#4f46e5",
      accent: "#c084fc",
      ambient: "#050816",
    },
    simulationNotes:
      "IllustrisTNG multi-snapshot interpolation showing filament condensation and void evacuation.",
  },
  modern_distribution: {
    id: "modern_distribution",
    name: "7. Modern Galaxy Distribution & Lightcone",
    shortDescription:
      "Observed SDSS & 2MASS galaxy survey distribution versus dark energy accelerated expansion",
    associatedEpochIds: ["formation_solar_system", "present_day_large_scale_structure"],
    cameraPacing:
      "Macro cosmic overview revealing survey cones, Zone of Avoidance, and the cosmic horizon",
    visualMetaphor:
      "Dual-mode observational survey wedges and isotropic simulation box in comoving space",
    colorPalette: {
      primary: "#38bdf8",
      secondary: "#10b981",
      accent: "#fbbf24",
      ambient: "#020617",
    },
    simulationNotes:
      "Mode A survey lightcone (lookback time) versus Mode B equal-time simulation box comparison.",
  },
};

/**
 * Multi-Snapshot Cosmological Simulation Data Points
 * Based on IllustrisTNG-300-1 snapshots across cosmic time
 */
export interface SimulationSnapshotData {
  snapshotNumber: number;
  redshift: number;
  lookbackTimeGyr: number;
  scaleFactor: number;
  totalHalosDocumented: number;
  clusterCount: number;
  voidFraction: number; // Fraction of volume occupied by underdense voids (delta < -0.8)
  description: string;
}

export const TNG_EVOLUTION_SNAPSHOTS: SimulationSnapshotData[] = [
  {
    snapshotNumber: 17,
    redshift: 6.0,
    lookbackTimeGyr: 12.8,
    scaleFactor: 0.143,
    totalHalosDocumented: 14200,
    clusterCount: 0, // No massive clusters virialized yet
    voidFraction: 0.35,
    description:
      "Cosmic Dawn (z=6): diffuse filamentary web, faint protogalactic mini-halos forming.",
  },
  {
    snapshotNumber: 33,
    redshift: 2.0,
    lookbackTimeGyr: 10.3,
    scaleFactor: 0.333,
    totalHalosDocumented: 48900,
    clusterCount: 12,
    voidFraction: 0.58,
    description:
      "Cosmic Noon (z=2): rapid halo mergers, proto-clusters forming at filament intersections.",
  },
  {
    snapshotNumber: 50,
    redshift: 1.0,
    lookbackTimeGyr: 7.8,
    scaleFactor: 0.5,
    totalHalosDocumented: 92400,
    clusterCount: 48,
    voidFraction: 0.72,
    description: "Mature Cosmic Web (z=1): distinct filament spines, pronounced underdense voids.",
  },
  {
    snapshotNumber: 99,
    redshift: 0.0,
    lookbackTimeGyr: 0.0,
    scaleFactor: 1.0,
    totalHalosDocumented: 168000,
    clusterCount: 112,
    voidFraction: 0.82,
    description:
      "Present Day (z=0): rich virialized galaxy clusters (M > 10^15 M_sun), prominent cosmic voids.",
  },
];

/**
 * Calculates physical scale and timeline parameters for any arbitrary cosmic time in Gyr (0 to 13.8)
 */
export function getCosmicTimelineInterpolation(timeGyr: number) {
  const clampedTime = Math.max(0.0001, Math.min(13.8, timeGyr));
  // In flat Lambda-CDM with Omega_M ≈ 0.315 and Omega_Lambda ≈ 0.685:
  // a(t) = (Omega_M / Omega_Lambda)^(1/3) * sinh(3/2 * H0 * sqrt(Omega_Lambda) * t)^(2/3)
  const H0 = 67.4; // km/s/Mpc
  const omegaM = 0.315;
  const omegaL = 0.685;
  const tH0Gyr = 14.5; // Hubble time 1/H0 in Gyr ≈ 14.5 Gyr

  const factor = (3 / 2) * Math.sqrt(omegaL) * (clampedTime / tH0Gyr);
  const a = Math.pow(omegaM / omegaL, 1 / 3) * Math.pow(Math.sinh(factor), 2 / 3);

  const z = a > 0 ? Math.max(0, 1 / a - 1) : 1e30;
  const temperatureK = 2.7255 * (1 + z);
  const lookbackTimeGyr = Math.max(0, 13.8 - clampedTime);

  // Find nearest stage
  let activeStage = COSMIC_EVOLUTION_STAGES[COSMIC_EVOLUTION_STAGES.length - 1];
  for (let i = 0; i < COSMIC_EVOLUTION_STAGES.length; i++) {
    const stage = COSMIC_EVOLUTION_STAGES[i];
    if (stage.timeGyr >= clampedTime || (i === 0 && clampedTime <= stage.timeGyr)) {
      activeStage = stage;
      break;
    }
  }

  return {
    timeGyr: clampedTime,
    scaleFactorA: a,
    redshiftZ: z,
    temperatureK,
    lookbackTimeGyr,
    activeStage,
  };
}
