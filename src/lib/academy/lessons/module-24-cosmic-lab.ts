import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface LabDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  iconName: string;
  category: "Mechanics" | "Astrophysics" | "Cosmology" | "Exploration";
  description: string;
  juniorPrompt: string;
  explorerPrompt: string;
  astronomerPrompt: string;
  scientificLimitations: string[];
  keyEquations: { name: string; formula: string; explanation: string }[];
}

export const LAB_DEFINITIONS: LabDefinition[] = [
  {
    id: "lab-1-solar-system",
    number: 1,
    title: "Create a Solar System",
    subtitle: "N-Body Orbital Dynamics & Keplerian Mechanics",
    iconName: "Orbit",
    category: "Mechanics",
    description:
      "Construct multi-planet planetary systems from scratch. Balance gravitational attraction with centrifugal inertia to establish stable Keplerian orbits, avoid chaotic resonance ejections, and observe Kepler's Third Law in action.",
    juniorPrompt:
      "Try adding 2 or 3 planets! Give them enough speed so they don't fall into the star, but not so much that they fly away into deep space.",
    explorerPrompt:
      "Set up circular orbits by matching velocity to v = sqrt(GM/r). Observe how planets further out must travel slower to stay in orbit.",
    astronomerPrompt:
      "Analyze the vis-viva equation v² = GM(2/r - 1/a) and specific orbital energy E = -GM/(2a). Observe perihelion advance and mutual N-body perturbations when orbits cross within mutual Hill spheres.",
    scientificLimitations: [
      "Simulations use 4th-order Runge-Kutta numerical integration with point-mass approximations.",
      "Relativistic corrections (Schwarzschild frame dragging and perihelion precession) are neglected in this Newtonian regime.",
      "Tidal dissipation, solar wind drag, and radiation pressure are assumed negligible over short integration times.",
    ],
    keyEquations: [
      {
        name: "Vis-Viva Equation",
        formula: "v² = G·M·(2/r - 1/a)",
        explanation: "Relates instantaneous orbital speed v at distance r to semi-major axis a.",
      },
      {
        name: "Kepler's Third Law",
        formula: "T² = (4π² / G·M) · a³",
        explanation:
          "The square of the orbital period T is directly proportional to the cube of semi-major axis a.",
      },
      {
        name: "Specific Orbital Energy",
        formula: "ε = v²/2 - G·M/r = -G·M / (2a)",
        explanation:
          "Total energy per unit mass is conserved along an unperturbed Keplerian orbit.",
      },
    ],
  },
  {
    id: "lab-2-build-galaxy",
    number: 2,
    title: "Build a Galaxy",
    subtitle: "Stellar Disk, Gas & Dark Matter Halo Rotation",
    iconName: "Disc",
    category: "Astrophysics",
    description:
      "Model a spiral galaxy by adjusting stellar bulge mass, exponential disk scale length, cold gas reservoirs, and the unseen spheroidal dark matter halo. Discover why Vera Rubin's flat rotation curves demand dark matter.",
    juniorPrompt:
      "Watch what happens to outer stars when you turn Dark Matter ON vs OFF! Without dark matter, outer stars would fly off or turn sluggishly.",
    explorerPrompt:
      "Balance the visible disk mass against the dark halo. Observe how the rotation curve flattens out to 220 km/s at large galactic radii (r > 10 kpc).",
    astronomerPrompt:
      "Decompose the circular velocity v_circ(r) = sqrt(v_bulge² + v_disk² + v_gas² + v_halo²). Compare an isothermal or NFW halo profile with Keplerian decline v ~ r^(-1/2) expected from visible baryonic mass alone.",
    scientificLimitations: [
      "Dark matter halo is modeled as a spherically symmetric pseudo-isothermal / NFW density distribution.",
      "Spiral arm density waves are approximated kinematically rather than fully self-consistent magnetohydrodynamics (MHD).",
      "Stellar feedback (supernova blowouts) is treated parametrically.",
    ],
    keyEquations: [
      {
        name: "Circular Velocity Decomposition",
        formula: "v_circ²(r) = v_bulge²(r) + v_disk²(r) + v_halo²(r)",
        explanation:
          "Total gravitational acceleration is the sum of baryonic and dark matter components.",
      },
      {
        name: "Isothermal Halo Profile",
        formula: "M_halo(r) = 4π·ρ_0·r_c²·[r - r_c·arctan(r/r_c)]",
        explanation: "Yields an asymptotically flat circular velocity curve at large radii.",
      },
    ],
  },
  {
    id: "lab-3-stellar-evolution",
    number: 3,
    title: "Stellar Evolution Laboratory",
    subtitle: "Mass-Luminosity Scaling, Lifetimes & Remnants",
    iconName: "Flame",
    category: "Astrophysics",
    description:
      "Select stellar birth mass from 0.1 M☉ (red dwarf) to 60 M☉ (hypergiant). Trace how initial mass strictly governs core temperature, nuclear fusion pathways (p-p chain vs CNO cycle to silicon burning), lifetime, and ultimate death.",
    juniorPrompt:
      "Bigger stars are not calmer stars! A giant star burns through its fuel in millions of years, while a tiny red dwarf can shine for trillions of years.",
    explorerPrompt:
      "Notice the Chandrasekhar mass limit (1.44 M☉) and Tolman-Oppenheimer-Volkoff limit (~2.2 M☉) that divide white dwarfs, neutron stars, and black holes.",
    astronomerPrompt:
      "Explore the mass-luminosity relation L ~ M^3.5 for intermediate stars, yielding main-sequence lifetime τ_MS ~ M/L ~ M^(-2.5). Examine post-main-sequence giant branch tracks and core nucleosynthetic shell burning.",
    scientificLimitations: [
      "Stellar tracks use smoothed interpolations from MIST / Geneva stellar evolution models.",
      "Rotational mixing and magnetic stellar wind mass-loss rates are simplified.",
      "Binary star mass transfer (common envelope phases) is not modeled in this single-star lab.",
    ],
    keyEquations: [
      {
        name: "Main-Sequence Lifetime",
        formula: "τ_MS ≈ 10 Gyr · (M / M☉)^(-2.5)",
        explanation: "Stellar lifetime drops precipitously with increasing initial mass.",
      },
      {
        name: "Mass-Luminosity Relation",
        formula: "L / L☉ ≈ (M / M☉)^3.5  (for 0.43 < M/M☉ < 20)",
        explanation:
          "Radiation pressure and core temperature drive extreme luminosity in massive stars.",
      },
      {
        name: "Chandrasekhar Mass Limit",
        formula: "M_Ch ≈ 1.44 M☉",
        explanation:
          "Maximum mass supportable by degenerate electron pressure before core collapse.",
      },
    ],
  },
  {
    id: "lab-4-galaxy-collision",
    number: 4,
    title: "Galaxy Collision & Mergers",
    subtitle: "Tidal Forces, Gravitational Encounters & Morphology",
    iconName: "Activity",
    category: "Mechanics",
    description:
      "Simulate the close gravitational encounter or merger between two galaxies (such as the impending Milky Way - Andromeda collision). Observe how tidal gravity rips out dramatic tidal tails while individual stars almost never collide.",
    juniorPrompt:
      "Galaxies are mostly empty space! When two galaxies crash, their stars pass right through each other like ghosts, but gravity bends their shapes into long curving tails.",
    explorerPrompt:
      "Vary the impact parameter (b) and approach velocity. Watch how prograde disk rotations form vastly longer tidal tails than retrograde orientations.",
    astronomerPrompt:
      "Investigate dynamic friction (Chandrasekhar drag) that robs orbital energy from the galactic cores, converting an orbital binary into a coalesced relaxed elliptical galaxy. Track tidal radius r_t ≈ R · (m / 3M)^(1/3).",
    scientificLimitations: [
      "Restricted N-body / test-particle method: star particles respond to analytic galaxy potentials without mutual star-star gravity.",
      "Interstellar gas hydrodynamics (shock compression and bursts of star formation) is represented parametrically.",
    ],
    keyEquations: [
      {
        name: "Tidal Radius (Roche Limit)",
        formula: "r_tidal ≈ R_sep · (M_satellite / 3 M_host)^(1/3)",
        explanation:
          "Distance from satellite core where host tidal force overcomes satellite self-gravity.",
      },
      {
        name: "Dynamical Friction Force",
        formula: "F_df ∝ - (G² · M² · ρ) / v² · ln(Λ)",
        explanation:
          "Gravitational wake behind a massive body decelerates its orbit through the background halo.",
      },
    ],
  },
  {
    id: "lab-5-black-hole",
    number: 5,
    title: "Black Hole Experiment",
    subtitle: "Schwarzschild Geodesics, Accretion & Gravitational Lensing",
    iconName: "Maximize2",
    category: "Astrophysics",
    description:
      "Explore the spacetime geometry around a non-rotating Schwarzschild black hole. Measure the Event Horizon, Photon Sphere, and ISCO (Innermost Stable Circular Orbit), and observe photon deflection and relativistic Einstein rings.",
    juniorPrompt:
      "Move the test particle near the black hole. If it crosses the glowing red circle (Event Horizon), not even light can pull it back out!",
    explorerPrompt:
      "Find the innermost stable circular orbit (ISCO = 3 r_s). Any orbit closer than this spirals inevitably into the singularity without extra propulsion.",
    astronomerPrompt:
      "Investigate the effective potential in general relativity: V_eff(r) = -GM/r + L²/(2r²) - GML²/(c²r³). Notice how the cubic general relativistic term destroys stability at r < 6GM/c².",
    scientificLimitations: [
      "Assumes non-rotating (Kerr parameter a* = 0) Schwarzschild metric; frame-dragging from Kerr rotation is omitted.",
      "Ray deflection uses first-order Einstein light bending angle θ = 4GM / (c² b) with relativistic higher-order ray-tracing approximations.",
    ],
    keyEquations: [
      {
        name: "Schwarzschild Radius",
        formula: "r_s = 2·G·M / c² ≈ 2.95 km · (M / M☉)",
        explanation: "The radius of the event horizon where escape velocity equals light speed.",
      },
      {
        name: "Innermost Stable Circular Orbit (ISCO)",
        formula: "r_isco = 3·r_s = 6·G·M / c²",
        explanation: "Minimum stable orbit for massive particles in Schwarzschild spacetime.",
      },
      {
        name: "Einstein Deflection Angle",
        formula: "θ_def = 4·G·M / (c² · b)",
        explanation: "Angular deflection of a photon passing at impact parameter b.",
      },
    ],
  },
  {
    id: "lab-6-light-spectra",
    number: 6,
    title: "Light & Spectra Analyzer",
    subtitle: "Blackbody Radiation, Quantum Transitions & Redshift",
    iconName: "Sun",
    category: "Astrophysics",
    description:
      "Analyze the continuous blackbody continuum and discrete quantum absorption/emission lines of stars, nebulae, and distant quasars. Measure peak wavelength via Wien's Law and measure cosmological or Doppler redshift z.",
    juniorPrompt:
      "Hot stars glow brilliant blue, while cool stars glow deep red! Look at the colorful barcode lines to see what chemical elements the star is made of.",
    explorerPrompt:
      "Identify characteristic hydrogen Balmer lines (H-alpha at 656.3 nm, H-beta at 486.1 nm). Slide Doppler velocity to watch redshift and blueshift shift every line together.",
    astronomerPrompt:
      "Calculate Wien's displacement λ_max · T = 2.898 × 10^(-3) m·K and integrate Stefan-Boltzmann flux F = σ·T⁴. Calculate redshift z = (λ_obs - λ_emit) / λ_emit = v / c for non-relativistic velocities.",
    scientificLimitations: [
      "Absorption line profiles use Voigt / Gaussian approximations without complex non-LTE stellar atmosphere radiative transfer.",
      "Blackbody curves assume ideal Planckian radiators without interstellar dust extinction reddening E(B-V).",
    ],
    keyEquations: [
      {
        name: "Wien's Displacement Law",
        formula: "λ_peak · T = 2.89777 × 10^(-3) m·K",
        explanation:
          "The peak emission wavelength is inversely proportional to blackbody absolute temperature.",
      },
      {
        name: "Stefan-Boltzmann Law",
        formula: "F = σ · T⁴  (σ = 5.670 × 10^(-8) W/(m²·K⁴))",
        explanation:
          "Total radiant energy emitted per unit surface area scales with the fourth power of temperature.",
      },
      {
        name: "Redshift Parameter",
        formula: "z = (λ_observed - λ_rest) / λ_rest ≈ v / c",
        explanation:
          "Fractional wavelength shift induced by relative radial velocity or cosmic expansion.",
      },
    ],
  },
  {
    id: "lab-7-exoplanet-discovery",
    number: 7,
    title: "Exoplanet Discovery Observatory",
    subtitle: "Transit Photometry & Radial Velocity Spectroscopy",
    iconName: "Compass",
    category: "Astrophysics",
    description:
      "Detect unknown exoplanets using the two primary astronomical detection techniques: Transit Photometry (measuring tiny stellar dips as a planet eclipses its star) and Radial Velocity (measuring the star's Doppler wobble induced by the planet's gravitational tug).",
    juniorPrompt:
      "Watch the star's brightness dip when the planet passes in front! A giant Jupiter causes a deep dip, while a small Earth-sized planet makes only a tiny speck of a shadow.",
    explorerPrompt:
      "Measure the transit depth (ΔF/F) to find the planet's radius relative to the star: (R_p / R_star)². Measure the time between dips to determine its orbital year.",
    astronomerPrompt:
      "Combine transit depth and radial velocity semi-amplitude K = (2πG/P)^(1/3) · (M_p sin i)/(M_star + M_p)^(2/3) to solve for both planet radius and mass, deriving bulk density ρ_p = M_p / (4/3 π R_p³) to distinguish gas giants, ocean worlds, and rocky super-Earths.",
    scientificLimitations: [
      "Assumes spherical planets with uniform quadratic stellar limb darkening approximations.",
      "Stellar starspots, granulation flicker, and multi-planet transit timing variations (TTVs) are treated as Gaussian noise.",
    ],
    keyEquations: [
      {
        name: "Transit Depth",
        formula: "ΔF / F_star = (R_planet / R_star)²",
        explanation:
          "The fractional decrease in stellar flux during transit equals the ratio of cross-sectional areas.",
      },
      {
        name: "Radial Velocity Semi-Amplitude",
        formula: "K = (2π·G / P)^(1/3) · [M_p·sin(i) / M_star^(2/3)] · (1 - e²)^(-1/2)",
        explanation:
          "The peak Doppler reflex velocity of the host star caused by the orbiting planet.",
      },
    ],
  },
  {
    id: "lab-8-cosmic-expansion",
    number: 8,
    title: "Cosmic Expansion & Friedmann Engine",
    subtitle: "Scale Factor a(t), Density Parameters & Ultimate Fate",
    iconName: "Sparkles",
    category: "Cosmology",
    description:
      "Control the cosmic recipe of our universe: Matter (Ω_m), Radiation (Ω_r), Dark Energy (Ω_Λ), and Spatial Curvature (Ω_k). Solve the Friedmann equation numerically to trace cosmic scale factor a(t) from the Big Bang through the present day (t = 13.8 Gyr) into the deep future.",
    juniorPrompt:
      "What pushes the universe apart? Dark energy! Without enough dark energy, gravity pulls everything back together into a Big Crunch. With too much, space expands forever into a Big Freeze.",
    explorerPrompt:
      "Tune the universe to the benchmark ΛCDM values (Ω_m = 0.31, Ω_Λ = 0.69). Notice how expansion initially decelerated due to gravity, then transitioned into acceleration ~5 billion years ago.",
    astronomerPrompt:
      "Evaluate the first Friedmann equation: (ȧ/a)² = H₀² · [Ω_r·a^(-4) + Ω_m·a^(-3) + Ω_k·a^(-2) + Ω_Λ·a^(-3(1+w))]. Test phantom energy (w < -1) leading to a Big Rip versus open negative curvature.",
    scientificLimitations: [
      "Assumes homogeneous and isotropic FLRW metric on cosmological scales > 100 Mpc.",
      "Dark energy equation of state w is assumed constant (w = -1 for cosmological constant Λ) unless modified.",
    ],
    keyEquations: [
      {
        name: "First Friedmann Equation",
        formula: "H²(a) = H₀² · [Ω_r·a^(-4) + Ω_m·a^(-3) + Ω_k·a^(-2) + Ω_Λ]",
        explanation: "Governs the expansion rate H = ȧ/a as a function of scale factor a.",
      },
      {
        name: "Flatness Condition",
        formula: "Ω_total = Ω_m + Ω_r + Ω_Λ + Ω_k = 1.0",
        explanation:
          "Critical density condition determining the global geometry of spatial slices.",
      },
    ],
  },
  {
    id: "lab-9-space-mission",
    number: 9,
    title: "Space Mission Architecture & Delta-V",
    subtitle: "Hohmann Transfers, Rocket Equation & Gravity Assists",
    iconName: "Rocket",
    category: "Exploration",
    description:
      "Design an interplanetary probe trajectory from Earth to Mars, Venus, or Jupiter. Calculate the Hohmann transfer semi-major axis, two-impulse injection Δv, flight duration, and apply the Tsiolkovsky Rocket Equation to calculate required propellant mass ratio.",
    juniorPrompt:
      "You cannot fly straight to Mars like an airplane! You have to boost into an oval transfer orbit that coasts around the Sun until it meets Mars at just the right moment.",
    explorerPrompt:
      "Calculate the two burns: Δv_1 to escape Low Earth Orbit into the transfer ellipse, and Δv_2 to match Mars's orbital speed. Watch how specific impulse (Isp) saves tons of fuel.",
    astronomerPrompt:
      "Solve the Hohmann transfer geometry: a_trans = (r₁ + r₂)/2, flight time t = π·sqrt(a_trans³ / μ_Sun). Evaluate Tsiolkovsky's rocket equation Δv = I_sp · g₀ · ln(m_initial / m_final) and mass fraction f_p = 1 - exp(-Δv / (I_sp · g₀)).",
    scientificLimitations: [
      "Uses patched-conic approximation (two-body Keplerian segments) rather than full multi-body n-body gravitational trajectory integration.",
      "Planetary orbits are approximated as coplanar circles (eccentricities e ≈ 0 and orbital inclinations i ≈ 0).",
    ],
    keyEquations: [
      {
        name: "Hohmann Transfer Semi-Major Axis",
        formula: "a_trans = (r₁ + r₂) / 2",
        explanation:
          "The transfer orbit connects the periapsis at inner planet r₁ to apoapsis at outer planet r₂.",
      },
      {
        name: "Tsiolkovsky Rocket Equation",
        formula: "Δv = I_sp · g₀ · ln(m₀ / m_f)",
        explanation:
          "Maximum velocity change achievable from reaction mass expulsion with effective exhaust velocity.",
      },
      {
        name: "Transfer Duration",
        formula: "T_transfer = π · sqrt(a_trans³ / μ_Sun)",
        explanation: "Half the orbital period of the heliocentric transfer ellipse.",
      },
    ],
  },
  {
    id: "lab-10-astronomy-challenge",
    number: 10,
    title: "Comprehensive Academy Challenge",
    subtitle: "Mastery Assessment Across All 24 Modules",
    iconName: "Award",
    category: "Exploration",
    description:
      "Put your complete knowledge across all 24 Cosmic Academy modules to the ultimate test. Solve randomized scientific problems spanning solar physics, stellar death, dark matter, cosmology, and astrobiology.",
    juniorPrompt:
      "Test how much you've learned on your journey through the cosmos! Answer questions from Earth to the edge of the visible universe.",
    explorerPrompt:
      "Demonstrate your scientific reasoning: calculate distance moduli, interpret HR diagrams, predict orbital behaviors, and identify biosignatures.",
    astronomerPrompt:
      "Tackle multi-disciplinary astrophysical scenarios requiring integration of gravitational mechanics, radiative transfer, cosmological models, and spacecraft dynamics.",
    scientificLimitations: [
      "Questions follow verified peer-reviewed astrophysics consensus from NASA, ESA, IAU, and cosmological Planck / JWST observations.",
    ],
    keyEquations: [
      {
        name: "Cosmic Integration",
        formula: "Astrophysics = Mechanics + Thermodynamics + Quantum Optics + Relativity",
        explanation: "The union of fundamental physical principles describing the universe.",
      },
    ],
  },
];

export interface FinalChallengeStep {
  id: string;
  stepNumber: number;
  domain: string;
  title: string;
  scenario: string;
  taskPrompt: string;
  calculatorType:
    | "transit_depth"
    | "orbital_resonance"
    | "dark_matter_ratio"
    | "schwarzschild_radius"
    | "hohmann_deltav";
  targetValues: {
    label: string;
    target: number;
    tolerance: number;
    unit: string;
  };
  hints: string[];
  scientificDebrief: string;
}

export const FINAL_CHALLENGE_STEPS: FinalChallengeStep[] = [
  {
    id: "step-1-exoplanet",
    stepNumber: 1,
    domain: "Observational Astrophysics (Module 21 & 23)",
    title: "Measure Exoplanet Radius from Transit Depth",
    scenario:
      "The James Webb Space Telescope observes a distant solar-type star (R_star = 1.0 R☉ = 696,340 km). The precision light curve reveals a periodic transit dip with fractional depth ΔF/F = 0.0100 (1.00%).",
    taskPrompt:
      "Using the transit depth relationship ΔF/F = (R_p / R_star)², calculate the radius of this exoplanet in Earth radii (1 R☉ ≈ 109.2 R_Earth).",
    calculatorType: "transit_depth",
    targetValues: {
      label: "Exoplanet Radius",
      target: 10.9,
      tolerance: 0.5,
      unit: "R_Earth",
    },
    hints: [
      "Take the square root of the flux dip: R_p / R_star = sqrt(0.0100) = 0.100.",
      "Multiply by the star's radius in Earth units: 0.100 × 109.2 R_Earth ≈ 10.9 R_Earth (roughly the size of Saturn or Jupiter!).",
    ],
    scientificDebrief:
      "Outstanding! A 1% dip corresponds to an exoplanet with 10% of the star's radius. At ~10.9 Earth radii, this world is a Jovian gas giant, similar in diameter to Saturn (9.4 R_Earth) or Jupiter (11.2 R_Earth).",
  },
  {
    id: "step-2-resonance",
    stepNumber: 2,
    domain: "Orbital Mechanics (Module 08 & 06)",
    title: "Balance Orbital Resonances in a Multi-Planet System",
    scenario:
      "You are configuring a stable two-planet system around a 1.0 M☉ star. Planet A orbits at a₁ = 1.00 AU (orbital period T₁ = 1.00 Year). To prevent chaotic gravitational disruption, Planet B must be placed in a resonant 2:1 mean-motion orbital resonance (T₂ = 2.00 Years).",
    taskPrompt:
      "Apply Kepler's Third Law (T² = a³) to determine the required semi-major axis a₂ in Astronomical Units (AU).",
    calculatorType: "orbital_resonance",
    targetValues: {
      label: "Semi-Major Axis a₂",
      target: 1.587,
      tolerance: 0.05,
      unit: "AU",
    },
    hints: [
      "Since T₂ = 2.00 years, square the period: T₂² = 2² = 4.",
      "By Kepler's Third Law (for a 1 M☉ star), a³ = T² = 4. Therefore a = 4^(1/3) = cube_root(4) ≈ 1.587 AU.",
    ],
    scientificDebrief:
      "Spot on! At a₂ = 1.587 AU, Planet B completes exactly 1 orbit for every 2 orbits of Planet A. Many exoplanet systems (such as the TRAPPIST-1 system and Jupiter's Galilean moons Io-Europa-Ganymede) lock into resonant orbital lap times that preserve long-term stability over billions of years.",
  },
  {
    id: "step-3-dark-matter",
    stepNumber: 3,
    domain: "Galaxies & Dark Matter (Module 13 & 16)",
    title: "Deduce Galactic Dark Matter Fraction",
    scenario:
      "Vera Rubin observations of spiral galaxy NGC-3198 measure a flat circular speed v = 150 km/s out to a radius of r = 25 kpc. Gravitational mass within this radius is M_total = v²·r / G ≈ 13.0 × 10¹⁰ M☉. Photometric counting of all visible stars, gas clouds, and dust reveals only M_baryon = 2.6 × 10¹⁰ M☉.",
    taskPrompt:
      "Calculate the percentage of total mass that consists of unseen Dark Matter: [ (M_total - M_baryon) / M_total ] × 100%.",
    calculatorType: "dark_matter_ratio",
    targetValues: {
      label: "Dark Matter Fraction",
      target: 80.0,
      tolerance: 1.5,
      unit: "%",
    },
    hints: [
      "Subtract baryonic mass from total mass: M_dark = 13.0 - 2.6 = 10.4 × 10¹⁰ M☉.",
      "Divide by total mass: 10.4 / 13.0 = 0.80 = 80%.",
    ],
    scientificDebrief:
      "Exactly right! 80% of NGC-3198's mass inside 25 kpc is non-luminous dark matter. Across our entire universe, cosmological Planck CMB measurements reveal that dark matter outweighs normal baryonic matter by approximately 5.4 to 1 (making up ~85% of all matter!).",
  },
  {
    id: "step-4-black-hole",
    stepNumber: 4,
    domain: "Stellar Death & Black Holes (Module 10 & 14)",
    title: "Compute Event Horizon of Sagittarius A*",
    scenario:
      "At the center of our Milky Way sits the supermassive black hole Sagittarius A*, whose mass was determined by tracking stellar orbits (such as the star S2) to be M = 4.15 million solar masses (4.15 × 10⁶ M☉).",
    taskPrompt:
      "Using the Schwarzschild radius formula r_s = 2GM/c² (where 1 M☉ produces r_s ≈ 2.953 km), calculate the radius of Sagittarius A*'s event horizon in millions of kilometers (10⁶ km).",
    calculatorType: "schwarzschild_radius",
    targetValues: {
      label: "Schwarzschild Radius",
      target: 12.25,
      tolerance: 0.35,
      unit: "Million km",
    },
    hints: [
      "Multiply 4.15 × 10⁶ M☉ by 2.953 km/M☉ ≈ 12,255,000 km.",
      "Convert to millions of km: 12,255,000 km = 12.25 million km (well inside the orbit of Mercury at 57.9 million km!).",
    ],
    scientificDebrief:
      "Calculated with precision! With an event horizon radius of only ~12.3 million kilometers (roughly 0.082 AU), Sagittarius A* packs 4.15 million suns into a space that could easily fit inside the orbit of Mercury. In 2022, the Event Horizon Telescope captured the direct shadow of this photon sphere ring.",
  },
  {
    id: "step-5-hohmann",
    stepNumber: 5,
    domain: "Space Exploration & Trajectories (Module 22 & 24)",
    title: "Calculate Hohmann Injection Burn to Mars",
    scenario:
      "Your exploration craft is in Low Earth Parking Orbit (heliocentric distance r₁ = 1.00 AU, orbital velocity v₁ = 29.78 km/s). Mars orbits at r₂ = 1.524 AU. The semi-major axis of the Hohmann transfer ellipse is a_trans = (1.00 + 1.524)/2 = 1.262 AU. Heliocentric speed required at perihelion is v_peri = sqrt(GM_sun · (2/r₁ - 1/a_trans)) = 32.73 km/s.",
    taskPrompt:
      "Calculate the heliocentric velocity boost (Δv = v_peri - v₁) in km/s that the spacecraft must add to its Earth orbital speed to reach Mars.",
    calculatorType: "hohmann_deltav",
    targetValues: {
      label: "Heliocentric Δv Boost",
      target: 2.95,
      tolerance: 0.15,
      unit: "km/s",
    },
    hints: [
      "Subtract Earth's heliocentric speed from the perihelion speed: 32.73 km/s - 29.78 km/s = 2.95 km/s.",
      "This is the heliocentric hyperbolic excess speed v_infinity needed to send the spacecraft toward Mars.",
    ],
    scientificDebrief:
      "Mission Go! Adding ~2.95 km/s of velocity relative to the Sun injects the spacecraft into the transfer trajectory, arriving at Mars in approximately 259 days (8.5 months). You have mastered the physical foundations of astronautics!",
  },
];

export const MODULE_24_QUIZ: QuizQuestion[] = [
  {
    id: "q24-1",
    question:
      "According to Kepler's Third Law, if Planet Alpha is 4 times farther from its star than Planet Beta, how many times longer is its orbital period?",
    options: ["2 times longer", "4 times longer", "8 times longer", "16 times longer"],
    correctIndex: 2,
    explanation:
      "By Kepler's Third Law, T² ∝ a³. If distance a increases by a factor of 4, a³ = 4³ = 64. Taking the square root gives T = sqrt(64) = 8 times longer.",
    hint: "Recall T = a^(3/2) = (sqrt(a))³.",
  },
  {
    id: "q24-2",
    question:
      "Why do spiral galaxies maintain flat rotation curves at large radii instead of declining like planets in the Solar System?",
    options: [
      "Solar radiation pressure pushes outer stars faster",
      "An extended, massive Dark Matter halo envelops the galaxy",
      "Supermassive black holes at the center pull outer stars faster",
      "Magnetic fields hold all the stars in rigid rotation",
    ],
    correctIndex: 1,
    explanation:
      "In a Keplerian system where mass is concentrated at the center, speed declines as v ∝ 1/sqrt(r). Vera Rubin discovered that spiral galaxies stay flat at ~200+ km/s because of an extended spheroidal dark matter halo.",
    hint: "Think about Vera Rubin's foundational 1970s observations.",
  },
  {
    id: "q24-3",
    question:
      "What physical boundary marks the point of no return around a non-rotating black hole?",
    options: [
      "The accretion disc inner edge",
      "The photon sphere at 1.5 r_s",
      "The Schwarzschild event horizon at r_s = 2GM/c²",
      "The Roche limit",
    ],
    correctIndex: 2,
    explanation:
      "The Event Horizon (Schwarzschild radius r_s = 2GM/c²) is the surface where spacetime curvature makes escape velocity equal the speed of light in vacuum.",
    hint: "At this boundary, light itself cannot escape.",
  },
  {
    id: "q24-4",
    question:
      "If a star's surface temperature doubles from 3,000 K to 6,000 K, what happens to its radiant energy flux per unit surface area?",
    options: [
      "It doubles (2×)",
      "It quadruples (4×)",
      "It increases by 8 times",
      "It increases by 16 times (2⁴)",
    ],
    correctIndex: 3,
    explanation:
      "By the Stefan-Boltzmann Law (F = σ·T⁴), radiant flux scales with temperature to the fourth power. Doubling temperature increases flux by 2⁴ = 16 times.",
    hint: "Remember the power of 4 in Stefan-Boltzmann Law.",
  },
  {
    id: "q24-5",
    question: "When using transit photometry, how is the radius of an exoplanet determined?",
    options: [
      "From the color change of the star",
      "From the fractional depth of the light curve dip: ΔF/F = (R_p / R_star)²",
      "From the time it takes the star to rotate once",
      "From the gravitational lensing magnification spike",
    ],
    correctIndex: 1,
    explanation:
      "As an exoplanet transits across its host star, it blocks an area proportional to its disk area π R_p². The fractional dip in stellar brightness equals (R_p / R_star)².",
    hint: "The dip corresponds directly to the ratio of cross-sectional areas.",
  },
  {
    id: "q24-6",
    question:
      "In standard ΛCDM cosmology, what causes the current accelerated expansion of the universe?",
    options: [
      "Radiation from ancient supernovae",
      "Gravitational repulsion of dark matter particles",
      "Dark Energy with negative pressure (cosmological constant Λ)",
      "Solar wind from trillions of stars",
    ],
    correctIndex: 2,
    explanation:
      "Dark energy, representing ~69% of the universe's total energy density, exerts negative pressure in the stress-energy tensor, driving cosmological acceleration.",
    hint: "Awarded the 2011 Nobel Prize in Physics for Type Ia supernovae observations.",
  },
  {
    id: "q24-7",
    question:
      "Why is a Hohmann transfer orbit the most fuel-efficient trajectory between two coplanar circular orbits?",
    options: [
      "It travels in a direct straight line between planets",
      "It uses an ellipse tangent to both the departure and arrival orbits, minimizing impulsive Δv",
      "It relies entirely on atmospheric drag to change speed",
      "It operates without firing rocket engines",
    ],
    correctIndex: 1,
    explanation:
      "A Hohmann transfer is a two-impulse semi-elliptic transfer trajectory that is tangent to both initial and final circular orbits, minimizing required Δv.",
    hint: "Named after German engineer Walter Hohmann in 1925.",
  },
  {
    id: "q24-8",
    question:
      "What is the primary nucleosynthetic reason massive stars collapse when their core produces Iron (Fe)?",
    options: [
      "Iron is radioactive and explodes spontaneously",
      "Iron fusion is endothermic (absorbs energy instead of releasing it), halting thermal pressure",
      "Iron evaporates into hydrogen gas",
      "Iron creates an intense magnetic field that halts fusion",
    ],
    correctIndex: 1,
    explanation:
      "Iron-56 has one of the highest nuclear binding energies per nucleon in nature. Fusing iron consumes net thermal energy rather than releasing it, causing the core pressure to drop catastrophically.",
    hint: "Check the nuclear binding energy curve at atomic number 26.",
  },
];

export const MODULE_24_SUBLESSONS: SubLesson[] = [
  {
    id: "24-1",
    title: "The Universal Physics Sandbox: Synthesizing 23 Modules",
    durationMinutes: 5,
    content: {
      Beginner: `Welcome to the Capstone Laboratory of Cosmic Learning Academy! Throughout the previous 23 modules, you explored our Solar System, the birth and death of stars, black holes, the cosmic web, dark matter, the Big Bang, and the search for extraterrestrial life.

In this capstone, you are no longer just a reader—you are a computational astrophysicist! You hold the dials to gravity, mass, light, and the expansion of spacetime itself. Every experiment here uses verified physical equations, allowing you to test what happens if you tweak the fundamental laws of nature.`,
      Intermediate: `Astrophysics is unique among sciences because astronomers cannot touch or manipulate stars in a physical laboratory. Instead, astrophysicists build mathematical simulations grounded in conservation laws: conservation of energy, linear and angular momentum, electric charge, and baryon number.

In Module 24, you have direct access to 10 integrated research laboratories. Each lab solves authentic physical relationships—from the vis-viva equation and NFW dark matter profiles to relativistic ISCO horizons and Hohmann trajectory transfers.`,
      Advanced: `The culmination of modern astrophysics rests on the synthesis of four pillars:
1. Classical & Relativistic Mechanics (Kepler, Newton, Einstein geodesics)
2. Quantum Mechanics & Spectroscopy (Atomic transition lines, degeneracy pressure)
3. Thermodynamics & Nuclear Physics (Stellar fusion chains, blackbody radiation)
4. Relativistic Cosmology (FLRW metric, Friedmann equations, ΛCDM parameters)

This capstone laboratory unites these frameworks into an interactive testbed, allowing real numerical parameter exploration, stability analysis, and verifiable problem-solving.`,
    },
  },
  {
    id: "24-2",
    title: "Numerical Simulation, Models, and Scientific Limitations",
    durationMinutes: 5,
    content: {
      Beginner: `When scientists simulate space on computers, they have to make reasonable simplifications! For example, when calculating how a planet orbits, it is helpful to treat the planet as a smooth point mass rather than calculating every grain of sand or wave in the ocean.

As you explore the labs, look for the 'Scientific Limitations' box in each experiment. Knowing what a simulation includes—and what it leaves out—is one of the most important skills in science!`,
      Intermediate: `Every computational model involves trade-offs between physical fidelity, numerical stability, and real-time interactive performance. For instance:
- In our Solar System lab, we use 4th-order Runge-Kutta integration with point masses, neglecting relativistic frame dragging.
- In our Galaxy Collision lab, we use restricted N-body test particles, capturing tidal tails without the massive computational expense of mutual O(N²) particle-particle forces.
- In our Exoplanet lab, we model spherical bodies with limb darkening, treating stellar granulation as stochastic noise.`,
      Advanced: `Scientific modeling is an iterative pursuit of truth. When discrepancies emerge between simplified analytic models and authentic telescope data (such as Mercury's 43 arcseconds/century anomalous perihelion precession or Vera Rubin's flat rotation curves), physics does not fail—it expands!

Recognizing the domain of validity of Newtonian mechanics (weak field, v << c), General Relativity (strong field, event horizons), and classical optics is the hallmark of a mature research scientist.`,
    },
  },
  {
    id: "24-3",
    title: "The Cosmic Explorer Journey & Graduation Challenge",
    durationMinutes: 5,
    content: {
      Beginner: `Are you ready for your final graduation challenge? "Your Journey Through the Cosmos" will present you with 5 real-world puzzles: finding an exoplanet's size, balancing an orbit, measuring dark matter, finding a black hole's boundary, and sending a probe to Mars!

When you complete all challenges, you will earn your official Cosmic Explorer Completion Certificate! You can pick your own astronaut callsign—no real name is ever stored or shared.`,
      Intermediate: `The Final Capstone Challenge tests your quantitative synthesis:
1. Transit Photometry: Derive planetary cross-sectional radii from telescope flux dips.
2. Orbital Resonance: Calculate resonance semi-major axes using Kepler's 3rd law.
3. Dark Matter Fraction: Disentangle baryonic versus dark halo gravitational masses.
4. General Relativity: Compute the Schwarzschild event horizon of Sagittarius A*.
5. Interplanetary Astronautics: Calculate the heliocentric Δv for a Hohmann transfer to Mars.`,
      Advanced: `Completing the Cosmic Learning Academy curriculum validates foundational mastery across astronomical observational techniques, celestial mechanics, stellar nucleosynthesis, and physical cosmology.

Upon finishing the capstone suite, you receive an authentic Cosmic Explorer Credential generated client-side with cryptographic completion hashing, customizable callsign identification, and learning tier achievement.`,
    },
  },
];

export const MODULE_24_SOURCES: ScientificSource[] = [
  {
    title: "Astrophysics Data System (ADS) Digital Library",
    organization: "NASA",
    url: "https://ui.adsabs.harvard.edu/",
    note: "Primary bibliographic and peer-reviewed research database in astronomy.",
  },
  {
    title: "NASA Exoplanet Archive & Transit Ephemerides",
    organization: "NASA",
    url: "https://exoplanetarchive.ipac.caltech.edu/",
    note: "Public database of confirmed exoplanets, transit parameters, and RV orbits.",
  },
  {
    title: "Hubble & James Webb Space Telescope Science Releases",
    organization: "JWST",
    url: "https://webbtelescope.org/resource-gallery",
    note: "Spectroscopic and deep field observational data.",
  },
  {
    title: "European Space Agency (ESA) Gaia Archive",
    organization: "ESA",
    url: "https://www.cosmos.esa.int/web/gaia/data-release-3",
    note: "Astrometric data for over 1.8 billion stars and galactic kinematics.",
  },
  {
    title: "International Astronomical Union (IAU) Standards",
    organization: "IAU",
    url: "https://www.iau.org/science/scientific_bodies/commissions/",
    note: "Standard astronomical units, planetary nomenclature, and constants.",
  },
];
