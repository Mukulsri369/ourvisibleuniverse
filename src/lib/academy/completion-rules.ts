/**
 * Authoritative Module Completion Rules Registry
 * Scope: All 24 Modules of Cosmic Learning Academy.
 * Defines measurable learning requirements for verified module certification.
 */

export interface ActivityRequirement {
  id: string;
  title: string;
  type: "simulation_3d" | "interactive_lab" | "accessible_2d_alternative";
  description: string;
  measurableCriteria: string;
  validationKey: string;
  accessibleAlternativeId?: string;
  accessibleAlternativeTitle?: string;
}

export interface ModuleCompletionRule {
  moduleId: string;
  ruleVersion: string;
  title: string;
  stageId: number;
  requiredSections: {
    id: string;
    title: string;
  }[];
  requiredActivities: ActivityRequirement[];
  passingScorePct: number; // Default: 70%
  minimumReadingSeconds: number; // Anti-skip duration guard
}

export const MODULE_COMPLETION_RULES: Record<string, ModuleCompletionRule> = {
  "01": {
    moduleId: "01",
    ruleVersion: "1.0.0",
    title: "Our Place in the Universe",
    stageId: 1,
    requiredSections: [
      { id: "01-cosmic-address", title: "Earth to Laniakea Hierarchy" },
      { id: "01-powers-of-ten", title: "Powers of Ten Astronomical Scales" },
    ],
    requiredActivities: [
      {
        id: "act_01_cosmic_zoom",
        title: "Cosmic Zoom Scale Navigation",
        type: "simulation_3d",
        description: "Traverse from human scale (10^0 m) to the observable cosmic horizon (10^26 m).",
        measurableCriteria: "Navigate at least 15 continuous powers of ten with active coordinate inspection.",
        validationKey: "cosmic_zoom_scale_traversal",
        accessibleAlternativeId: "act_01_scale_diagrams",
        accessibleAlternativeTitle: "Accessible Scale Hierarchy Sequencer",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "02": {
    moduleId: "02",
    ruleVersion: "1.0.0",
    title: "The Night Sky & Constellations",
    stageId: 1,
    requiredSections: [
      { id: "02-celestial-sphere", title: "Celestial Coordinates & Polaris" },
      { id: "02-constellations", title: "Seasonal Constellations & Star Hopping" },
    ],
    requiredActivities: [
      {
        id: "act_02_planetarium_nav",
        title: "Virtual Planetarium Constellation Mapping",
        type: "simulation_3d",
        description: "Locate Polaris and identify northern/southern circumpolar constellations.",
        measurableCriteria: "Accurately locate celestial north and align three seasonal constellations.",
        validationKey: "planetarium_constellation_alignment",
        accessibleAlternativeId: "act_02_skychart_2d",
        accessibleAlternativeTitle: "2D High-Contrast Accessible Sky Chart",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "03": {
    moduleId: "03",
    ruleVersion: "1.0.0",
    title: "Cosmic Distances & Scale",
    stageId: 1,
    requiredSections: [
      { id: "03-au-and-ly", title: "Astronomical Units, Light-Years & Parsecs" },
      { id: "03-distance-ladder", title: "The Cosmic Distance Ladder" },
    ],
    requiredActivities: [
      {
        id: "act_03_distance_ladder_lab",
        title: "Distance Ladder Calibration Lab",
        type: "interactive_lab",
        description: "Calculate stellar parallax and convert angular shift in milliarcseconds to parsecs.",
        measurableCriteria: "Parallax conversion formula d = 1/p validated within 2% margin.",
        validationKey: "parallax_distance_calculation",
        accessibleAlternativeId: "act_03_parallax_table",
        accessibleAlternativeTitle: "Numerical Parallax Parameter Challenge",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "04": {
    moduleId: "04",
    ruleVersion: "1.0.0",
    title: "Light, Time & Cosmic Observation",
    stageId: 1,
    requiredSections: [
      { id: "04-speed-of-light", title: "Finite Speed of Light & Lookback Time" },
      { id: "04-electromagnetic-spectrum", title: "The Full EM Spectrum in Astronomy" },
    ],
    requiredActivities: [
      {
        id: "act_04_lookback_time_machine",
        title: "Cosmic Time Machine Simulation",
        type: "simulation_3d",
        description: "Trace photon lookback time from the Moon (1.3s) to GN-z11 (13.4 Gyr).",
        measurableCriteria: "Synthesize light-travel times across 4 cosmological distance benchmarks.",
        validationKey: "lookback_photon_trace",
        accessibleAlternativeId: "act_04_lookback_table",
        accessibleAlternativeTitle: "Lookback Time Calibration Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "05": {
    moduleId: "05",
    ruleVersion: "1.0.0",
    title: "Earth, Moon & Seasons",
    stageId: 2,
    requiredSections: [
      { id: "05-axial-tilt", title: "Earth's 23.5° Axial Tilt & Solstices" },
      { id: "05-lunar-phases", title: "Lunar Orbit & Eclipse Geometry" },
    ],
    requiredActivities: [
      {
        id: "act_05_seasons_eclipse_sim",
        title: "Axial Tilt & Eclipse Geometry Lab",
        type: "simulation_3d",
        description: "Simulate summer solstice solar insolation and lunar orbital inclination nodes.",
        measurableCriteria: "Predict eclipse alignment at ascending/descending orbital nodes.",
        validationKey: "lunar_phase_eclipse_prediction",
        accessibleAlternativeId: "act_05_eclipse_table",
        accessibleAlternativeTitle: "Saros Cycle Eclipse Prediction Challenge",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "06": {
    moduleId: "06",
    ruleVersion: "1.0.0",
    title: "The Solar System Worlds",
    stageId: 2,
    requiredSections: [
      { id: "06-rocky-planets", title: "Terrestrial Worlds: Mercury to Mars" },
      { id: "06-gas-giants-kuiper", title: "Gas Giants, Icy Moons & Kuiper Belt" },
    ],
    requiredActivities: [
      {
        id: "act_06_solar_system_tour",
        title: "Planetary Architecture Explorer",
        type: "simulation_3d",
        description: "Compare planetary densities, compositions, and orbital radii from Sun to Neptune.",
        measurableCriteria: "Correctly classify 4 planetary categories by density and composition.",
        validationKey: "planetary_density_classification",
        accessibleAlternativeId: "act_06_density_table",
        accessibleAlternativeTitle: "Planetary Density & Atmosphere Matrix",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "07": {
    moduleId: "07",
    ruleVersion: "1.0.0",
    title: "The Sun: Our Living Star",
    stageId: 2,
    requiredSections: [
      { id: "07-thermonuclear-core", title: "Core Proton-Proton Chain Fusion" },
      { id: "07-space-weather", title: "Sunspots, Coronal Mass Ejections & Solar Wind" },
    ],
    requiredActivities: [
      {
        id: "act_07_sun_simulator",
        title: "Solar Thermonuclear & Magnetic Simulator",
        type: "simulation_3d",
        description: "Simulate solar core temperature gradient and magnetic coronal loop eruption.",
        measurableCriteria: "Maintain core fusion pressure equilibrium and trace CME trajectory.",
        validationKey: "solar_magnetic_cme_simulation",
        accessibleAlternativeId: "act_07_solar_layers",
        accessibleAlternativeTitle: "Solar Interior Layer Radiative Transfer Lab",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "08": {
    moduleId: "08",
    ruleVersion: "1.0.0",
    title: "Gravity & Orbital Mechanics",
    stageId: 2,
    requiredSections: [
      { id: "08-kepler-laws", title: "Kepler's Laws of Planetary Motion" },
      { id: "08-orbital-energy", title: "Escape Velocity & Hohmann Transfer Orbits" },
    ],
    requiredActivities: [
      {
        id: "act_08_orbital_mechanics_lab",
        title: "Interactive Keplerian Orbital Mechanics Lab",
        type: "simulation_3d",
        description: "Achieve stable closed elliptical orbit around central mass.",
        measurableCriteria: "Execute orbital insertion with periapsis > planetary radius and eccentricity e < 0.2.",
        validationKey: "kepler_orbit_insertion",
        accessibleAlternativeId: "act_08_kepler_math",
        accessibleAlternativeTitle: "Kepler's Third Law (T^2 = a^3) Parameter Lab",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "09": {
    moduleId: "09",
    ruleVersion: "1.0.0",
    title: "Stars & How They Work",
    stageId: 3,
    requiredSections: [
      { id: "09-stellar-spectra", title: "Spectral Classes (OBAFGKM) & Blackbody Curves" },
      { id: "09-hr-diagram", title: "The Hertzsprung-Russell (H-R) Diagram" },
    ],
    requiredActivities: [
      {
        id: "act_09_hr_diagram_lab",
        title: "Hertzsprung-Russell Diagram Explorer",
        type: "interactive_lab",
        description: "Place stars onto the H-R diagram by temperature (K) and luminosity (L_sun).",
        measurableCriteria: "Correctly locate Main Sequence, Red Giant, and White Dwarf branches.",
        validationKey: "hr_diagram_classification",
        accessibleAlternativeId: "act_09_hr_table",
        accessibleAlternativeTitle: "Spectral Class & Temperature Matrix",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "10": {
    moduleId: "10",
    ruleVersion: "1.0.0",
    title: "Stellar Evolution & Death",
    stageId: 3,
    requiredSections: [
      { id: "10-stellar-lifecycles", title: "Main Sequence to Giant Branches" },
      { id: "10-supernovae-remnants", title: "Supernovae, White Dwarfs & Neutron Stars" },
    ],
    requiredActivities: [
      {
        id: "act_10_stellar_evolution_timeline",
        title: "Stellar Fate Predictor Simulation",
        type: "simulation_3d",
        description: "Simulate stellar evolution by varying initial Zero-Age Main Sequence mass.",
        measurableCriteria: "Correctly predict outcomes for 1 M_sun (White Dwarf) and 20 M_sun (Supernova/Black Hole).",
        validationKey: "stellar_fate_prediction",
        accessibleAlternativeId: "act_10_evolution_table",
        accessibleAlternativeTitle: "Chandrasekhar & TOV Limit Threshold Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "11": {
    moduleId: "11",
    ruleVersion: "1.0.0",
    title: "Nebulae & Star Nurseries",
    stageId: 3,
    requiredSections: [
      { id: "11-interstellar-medium", title: "Emission, Reflection & Dark Nebulae" },
      { id: "11-jeans-collapse", title: "Jeans Instability & Protostar Formation" },
    ],
    requiredActivities: [
      {
        id: "act_11_star_nursery_collapse",
        title: "Jeans Gravitational Collapse Lab",
        type: "simulation_3d",
        description: "Trigger gravitational collapse in molecular cloud by satisfying Jeans mass criteria.",
        measurableCriteria: "Exceed Jeans critical mass M > M_J to initiate protostellar core contraction.",
        validationKey: "jeans_mass_collapse",
        accessibleAlternativeId: "act_11_jeans_calculator",
        accessibleAlternativeTitle: "Jeans Length & Density Parameter Calculator",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "12": {
    moduleId: "12",
    ruleVersion: "1.0.0",
    title: "Exoplanets & Alien Worlds",
    stageId: 3,
    requiredSections: [
      { id: "12-detection-methods", title: "Transit Photometry & Radial Velocity" },
      { id: "12-habitable-zones", title: "Goldilocks Habitable Zones & Biosignatures" },
    ],
    requiredActivities: [
      {
        id: "act_12_transit_detection_lab",
        title: "Exoplanet Transit Photometry Lab",
        type: "interactive_lab",
        description: "Detect planetary transit from stellar flux light curve dip.",
        measurableCriteria: "Derive planet-to-star radius ratio (R_p / R_*) from transit depth within 5%.",
        validationKey: "transit_photometry_radius_derivation",
        accessibleAlternativeId: "act_12_lightcurve_table",
        accessibleAlternativeTitle: "Tabular Transit Depth & Period Analysis",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "13": {
    moduleId: "13",
    ruleVersion: "1.0.0",
    title: "Galaxies & the Milky Way",
    stageId: 4,
    requiredSections: [
      { id: "13-hubble-tuning-fork", title: "Hubble Galaxy Classification Scheme" },
      { id: "13-milky-way-structure", title: "Milky Way Spiral Arms, Bulge & Halo" },
    ],
    requiredActivities: [
      {
        id: "act_13_galaxy_morphology_lab",
        title: "Galaxy Morphology & Dynamics Lab",
        type: "simulation_3d",
        description: "Classify galaxies across spiral, elliptical, and irregular morphologies.",
        measurableCriteria: "Correctly categorize 5 galaxies on the Hubble sequence using bulge/disk ratios.",
        validationKey: "galaxy_morphology_classification",
        accessibleAlternativeId: "act_13_morphology_table",
        accessibleAlternativeTitle: "Galaxy Photometry & Sersic Index Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "14": {
    moduleId: "14",
    ruleVersion: "1.0.0",
    title: "Black Holes & Extreme Objects",
    stageId: 4,
    requiredSections: [
      { id: "14-schwarzschild-radius", title: "Event Horizons & Gravitational Time Dilation" },
      { id: "14-pulsars-gravitational-waves", title: "Pulsars, Magnetars & Gravitational Waves" },
    ],
    requiredActivities: [
      {
        id: "act_14_black_hole_visualizer",
        title: "Schwarzschild Radius & Lensing Lab",
        type: "simulation_3d",
        description: "Calculate event horizon radius R_s = 2GM/c^2 and observe photon sphere deflection.",
        measurableCriteria: "Compute Schwarzschild radius for solar and supermassive black hole masses.",
        validationKey: "schwarzschild_radius_calculation",
        accessibleAlternativeId: "act_14_lensing_table",
        accessibleAlternativeTitle: "Relativistic Spacetime Curvature Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "15": {
    moduleId: "15",
    ruleVersion: "1.0.0",
    title: "The Cosmic Web & Large-Scale Structure",
    stageId: 4,
    requiredSections: [
      { id: "15-filaments-and-voids", title: "Cosmic Filaments, Nodes & Cosmic Voids" },
      { id: "15-superclusters-surveys", title: "Sloan Great Wall & Redshift Space Distortions" },
    ],
    requiredActivities: [
      {
        id: "act_15_cosmic_web_explorer",
        title: "Large-Scale Filamentary Web Explorer",
        type: "simulation_3d",
        description: "Inspect cosmic web density fields and navigate galaxy clusters and voids.",
        measurableCriteria: "Identify intersection node density vs void underdensities across 100 Mpc scales.",
        validationKey: "cosmic_web_topology_inspection",
        accessibleAlternativeId: "act_15_density_table",
        accessibleAlternativeTitle: "Cosmic Matter Density Contrast Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "16": {
    moduleId: "16",
    ruleVersion: "1.0.0",
    title: "Dark Matter & Dark Energy",
    stageId: 4,
    requiredSections: [
      { id: "16-rotation-curves", title: "Vera Rubin's Flat Galaxy Rotation Curves" },
      { id: "16-accelerating-expansion", title: "Type Ia Supernovae & Cosmological Constant" },
    ],
    requiredActivities: [
      {
        id: "act_16_dark_matter_rotation_lab",
        title: "Galaxy Rotation Curve Decomposition Lab",
        type: "interactive_lab",
        description: "Deconstruct observed vs Keplerian rotation curves by tuning dark matter halo mass.",
        measurableCriteria: "Fit dark matter NFW halo profile to match observed flat outer velocity curve.",
        validationKey: "rotation_curve_nfw_fit",
        accessibleAlternativeId: "act_16_rotation_table",
        accessibleAlternativeTitle: "Velocity Dispersion & Mass Decomposition Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "17": {
    moduleId: "17",
    ruleVersion: "1.0.0",
    title: "The Big Bang & Early Cosmos",
    stageId: 5,
    requiredSections: [
      { id: "17-primordial-nucleosynthesis", title: "Cosmic Inflation & Primordial H/He Ratios" },
      { id: "17-cmb-recombination", title: "Cosmic Microwave Background & 380,000 Year Recombination" },
    ],
    requiredActivities: [
      {
        id: "act_17_cmb_explorer",
        title: "Cosmic Microwave Background Power Spectrum Lab",
        type: "interactive_lab",
        description: "Analyze acoustic peaks in the Planck CMB angular power spectrum.",
        measurableCriteria: "Derive baryon and cold dark matter density from first and second acoustic peaks.",
        validationKey: "cmb_acoustic_peak_analysis",
        accessibleAlternativeId: "act_17_cmb_table",
        accessibleAlternativeTitle: "Primordial Nucleosynthesis Abundance Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "18": {
    moduleId: "18",
    ruleVersion: "1.0.0",
    title: "The Expanding Universe & Redshift",
    stageId: 5,
    requiredSections: [
      { id: "18-hubble-lemaitre-law", title: "Hubble-Lemaître Law (v = H_0 * d)" },
      { id: "18-cosmological-redshift", title: "Metric Space Expansion vs Doppler Shift" },
    ],
    requiredActivities: [
      {
        id: "act_18_redshift_expansion_lab",
        title: "Cosmological Redshift & Expansion Lab",
        type: "simulation_3d",
        description: "Measure spectral line shifting (z = delta_lambda / lambda_0) across redshift z = 0 to 6.",
        measurableCriteria: "Compute recessional velocity and comoving distance from observed redshift z.",
        validationKey: "redshift_velocity_distance_calculation",
        accessibleAlternativeId: "act_18_redshift_table",
        accessibleAlternativeTitle: "Hubble Diagram & Distance Modulus Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "19": {
    moduleId: "19",
    ruleVersion: "1.0.0",
    title: "History of Human Cosmology",
    stageId: 5,
    requiredSections: [
      { id: "19-geocentric-to-heliocentric", title: "Ptolemaic Epicycles to Copernican Heliocentrism" },
      { id: "19-modern-cosmology", title: "Galileo, Kepler, Newton to Einstein's Spacetime" },
    ],
    requiredActivities: [
      {
        id: "act_19_model_comparator",
        title: "Historical Cosmological Model Comparator",
        type: "interactive_lab",
        description: "Compare retrograde planetary loops in Ptolemaic vs Copernican architectures.",
        measurableCriteria: "Demonstrate retrograde motion naturally arising from orbital overtaking.",
        validationKey: "retrograde_motion_comparison",
        accessibleAlternativeId: "act_19_timeline_table",
        accessibleAlternativeTitle: "Cosmological Paradigm Shift Timeline Matrix",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "20": {
    moduleId: "20",
    ruleVersion: "1.0.0",
    title: "The Future of the Universe",
    stageId: 5,
    requiredSections: [
      { id: "20-cosmic-eras", title: "Stelliferous, Degenerate, Black Hole & Dark Eras" },
      { id: "20-ultimate-fates", title: "Big Freeze, Heat Death & Long Cosmological Timelines" },
    ],
    requiredActivities: [
      {
        id: "act_20_future_timeline_lab",
        title: "Long-Term Cosmic Future Simulator",
        type: "interactive_lab",
        description: "Project astronomical timescales up to 10^100 years (Hawking radiation decay).",
        measurableCriteria: "Map the succession of all 4 cosmological future eras in proper thermodynamic order.",
        validationKey: "cosmic_future_era_ordering",
        accessibleAlternativeId: "act_20_thermodynamic_table",
        accessibleAlternativeTitle: "Thermodynamic Entropy & Decay Matrix",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "21": {
    moduleId: "21",
    ruleVersion: "1.0.0",
    title: "Telescopes & Observatories",
    stageId: 6,
    requiredSections: [
      { id: "21-optical-radio-space", title: "Refractors, Reflectors, Interferometry & Space Telescopes" },
      { id: "21-diffraction-limit", title: "Angular Resolution, Aperture & Diffraction Limits" },
    ],
    requiredActivities: [
      {
        id: "act_21_telescope_optics_lab",
        title: "Telescope Optics & Aperture Lab",
        type: "interactive_lab",
        description: "Calculate Rayleigh diffraction limit theta = 1.22 * lambda / D for optical vs radio.",
        measurableCriteria: "Determine resolving power improvement from increasing primary mirror aperture.",
        validationKey: "rayleigh_criterion_resolution",
        accessibleAlternativeId: "act_21_optics_table",
        accessibleAlternativeTitle: "Angular Resolution & Wavelength Matrix",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "22": {
    moduleId: "22",
    ruleVersion: "1.0.0",
    title: "Space Missions & Exploration",
    stageId: 6,
    requiredSections: [
      { id: "22-voyagers-and-probes", title: "Voyager 1/2, New Horizons & Interstellar Boundaries" },
      { id: "22-mars-rovers-orbiters", title: "Mars Rovers, Lunar Landers & Outer Planet Orbiters" },
    ],
    requiredActivities: [
      {
        id: "act_22_gravity_assist_trajectory",
        title: "Interplanetary Gravity Assist Simulator",
        type: "simulation_3d",
        description: "Plan planetary gravity assist slingshot trajectory to reach outer solar system.",
        measurableCriteria: "Increase probe heliocentric velocity via Jupiter gravitational assist flyby.",
        validationKey: "gravity_assist_slingshot",
        accessibleAlternativeId: "act_22_trajectory_table",
        accessibleAlternativeTitle: "Delta-V Budget & Mission Parameter Table",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "23": {
    moduleId: "23",
    ruleVersion: "1.0.0",
    title: "Astrobiology & the Search for Life",
    stageId: 6,
    requiredSections: [
      { id: "23-extremophiles-ocean-worlds", title: "Extremophiles on Earth & Subsurface Oceans on Europa/Enceladus" },
      { id: "23-drake-equation-seti", title: "The Drake Equation, Technosignatures & SETI" },
    ],
    requiredActivities: [
      {
        id: "act_23_habitable_world_lab",
        title: "Habitable World & Biosignature Lab",
        type: "interactive_lab",
        description: "Evaluate atmospheric spectra for simultaneous O2 + CH4 chemical disequilibrium.",
        measurableCriteria: "Identify atmospheric biosignature disequilibrium indicating biological processes.",
        validationKey: "biosignature_disequilibrium_analysis",
        accessibleAlternativeId: "act_23_drake_calculator",
        accessibleAlternativeTitle: "Drake Equation Parameter Matrix Challenge",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },

  "24": {
    moduleId: "24",
    ruleVersion: "1.0.0",
    title: "The Cosmic Laboratory Capstone",
    stageId: 6,
    requiredSections: [
      { id: "24-unified-astrophysics", title: "Synthesis of 23 Observational Astronomy Domains" },
      { id: "24-capstone-methodology", title: "Observational Data Analysis & Scientific Rigor" },
    ],
    requiredActivities: [
      {
        id: "act_24_cosmic_lab_capstone",
        title: "Unified Cosmic Physics Laboratory",
        type: "interactive_lab",
        description: "Synthesize multi-wavelength data, stellar evolution, and cosmological redshift.",
        measurableCriteria: "Complete comprehensive astrophysics lab synthesis with all parameters calibrated.",
        validationKey: "capstone_astrophysics_synthesis",
        accessibleAlternativeId: "act_24_capstone_matrix",
        accessibleAlternativeTitle: "Unified Astronomical Parameter Synthesis Challenge",
      },
    ],
    passingScorePct: 70.0,
    minimumReadingSeconds: 60,
  },
};

/**
 * Returns completion rule for a given module ID.
 */
export function getModuleCompletionRule(moduleId: string): ModuleCompletionRule | null {
  const formattedModId = moduleId.padStart(2, "0");
  return MODULE_COMPLETION_RULES[formattedModId] || null;
}
