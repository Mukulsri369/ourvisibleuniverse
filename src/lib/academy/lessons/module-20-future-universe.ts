import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface FutureMilestone {
  id: string;
  logYears: number; // log10(years from present) e.g. 5 = 100,000 yr, 9 = 1 Gyr, 14 = 100 Trillion yr, 100 = 10^100 yr
  yearsLabel: string;
  scientificEpoch:
    "Present & Near Future" | "Stelliferous Era" | "Degenerate Era" | "Black Hole Era" | "Dark Era";
  adamsLaughlinEra: string;
  title: string;
  subtitle: string;
  certaintyLevel: "well_supported" | "theoretically_sound" | "speculative_frontier";
  certaintyBadge: string;
  solarSystemState: string;
  galacticState: string;
  cosmologicalState: string;
  entropyAndPhysics: string;
  description: {
    explorer: string;
    scholar: string;
    astrophysicist: string;
  };
  visualTheme: {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  };
}

export interface SunEvolutionStage {
  id: string;
  name: string;
  timeGyr: number; // Billions of years from present
  totalAgeGyr: number; // Total age of the Sun (starts at 4.6 Gyr today)
  radiusSolar: number; // Relative to current R_sun
  luminositySolar: number; // Relative to current L_sun
  temperatureKelvin: number;
  coreFuel: string;
  earthStatus: string;
  earthHabitability:
    | "Habitable"
    | "Runaway Greenhouse"
    | "Oceans Vaporized"
    | "Engulfed or Scorched Remnant"
    | "Frozen Cinder";
  description: string;
  keyPhysics: string;
}

export interface GalaxyMergerStage {
  phase: number;
  timeGyr: number; // Gyr from present
  name: string;
  separationKpc: number; // Separation between MW and M31 cores (2.5 Mly ≈ 770 kpc)
  relativeVelocityKms: number; // km/s
  morphology: string;
  starFormationRate: string;
  description: string;
  astrophysicalDetails: string;
}

export interface CosmologicalScenario {
  id: "big_freeze" | "big_rip" | "big_crunch" | "vacuum_decay";
  name: string;
  alternativeNames: string[];
  equationOfState: string; // e.g. w = -1, w < -1
  confidence:
    | "Standard Consensus (ΛCDM)"
    | "Hypothetical (Phantom Energy)"
    | "Alternative (Dynamical DE)"
    | "Quantum Speculation";
  confidenceRating:
    "Consensus" | "Speculative" | "Unlikely with current data" | "Theoretical Frontier";
  description: string;
  fateOfGalaxies: string;
  fateOfAtomsAndSpacetime: string;
  timescaleToEndpoint: string;
  keyScientificMechanism: string;
  entropyTrend: string;
}

export interface StellarPopulationEra {
  eraName: string;
  timeRange: string;
  activeStarTypes: string[];
  dyingStarTypes: string[];
  dominantRemnants: string[];
  cosmicLuminosityPercent: number; // Relative to present day (100%)
  starFormationRatePercent: number; // Relative to present day (100%)
  notes: string;
}

export const FUTURE_CHRONOLOGY_MILESTONES: FutureMilestone[] = [
  {
    id: "near_future_100k",
    logYears: 5,
    yearsLabel: "+100,000 Years",
    scientificEpoch: "Present & Near Future",
    adamsLaughlinEra: "Stelliferous Era",
    title: "The Shifting Night Sky",
    subtitle: "Proper motion of stars dissolves familiar constellations",
    certaintyLevel: "well_supported",
    certaintyBadge: "Well-Supported Astrophysics",
    solarSystemState: "Stable planetary orbits; Sun's luminosity increased by negligible ~0.001%.",
    galacticState:
      "Milky Way spiral continues steady rotation; constellations like Ursa Major and Orion deform unrecognizable to the naked eye.",
    cosmologicalState: "Hubble expansion continues; CMB temperature drops by ~0.00002 K.",
    entropyAndPhysics:
      "Normal stellar hydrogen burning in main sequence stars; steady local entropy generation through stellar nucleosynthesis.",
    description: {
      explorer:
        "The stars are not painted onto the sky—they are all traveling on their own paths! In 100,000 years, the constellations we know, like Orion and the Big Dipper, will have completely stretched out of shape.",
      scholar:
        "Stellar proper motions (such as Barnard's Star moving at 10.3 arcseconds/year) gradually alter the celestial sphere. Gravitational three-body perturbations in the Solar System remain bound and chaotic only over Lyapunov timescales of ~5-10 million years.",
      astrophysicist:
        "Kinematic dispersion of the solar neighborhood: Velocity dispersion of thin-disk stars (σ_v ≈ 20–40 km/s) carries nearby stars tens of parsecs relative to the Sun. Stellar evolution models demonstrate that the Sun's core hydrogen abundance drops imperceptibly over this interval.",
    },
    visualTheme: {
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      icon: "Sparkles",
    },
  },
  {
    id: "earth_oceans_1gyr",
    logYears: 9,
    yearsLabel: "+1.1 Billion Years",
    scientificEpoch: "Stelliferous Era",
    adamsLaughlinEra: "Stelliferous Era",
    title: "Moist Greenhouse & Earth's Desiccation",
    subtitle: "Rising solar luminosity evaporates Earth's oceans",
    certaintyLevel: "well_supported",
    certaintyBadge: "Well-Supported Heliophysics",
    solarSystemState:
      "Sun's core accumulates helium ash; core contracts, heats up, accelerating p-p chain fusion; solar luminosity increases by ~10%.",
    galacticState:
      "Milky Way continues its slow orbit; Andromeda galaxy draws closer by ~110 km/s.",
    cosmologicalState:
      "Accelerated cosmic expansion pushes distant galaxy clusters beyond z ≈ 0.5 lookback reach.",
    entropyAndPhysics:
      "Runaway moist greenhouse effect breaks geochemical carbon-silicate cycle; atmospheric water vapor dissociates under solar UV radiation.",
    description: {
      explorer:
        "As the Sun burns hydrogen, it slowly grows hotter and brighter. In about one billion years, it will be 10% brighter than today—enough to boil Earth's oceans away into steam!",
      scholar:
        "Standard solar models (Sackmann et al.) predict solar luminosity increases at ~1% per 110 million years. Increased insolation causes tropospheric water vapor to penetrate the stratosphere, where solar ultraviolet photolysis splits H2O, and hydrogen escapes to space (hydrodynamic escape).",
      astrophysicist:
        "Solar core helium accumulation increases mean molecular weight μ, requiring higher central temperatures (T_c ∝ μ) to maintain hydrostatic equilibrium: P_c = ρ k_B T_c / (μ m_u). The increased core temperature elevates nuclear fusion rates (ε_pp ∝ T^4), driving L_sun to ~1.1 L_0. Earth's surface temperature exceeds 350 K, initiating moist greenhouse desiccation.",
    },
    visualTheme: {
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      icon: "Flame",
    },
  },
  {
    id: "milkomeda_4gyr",
    logYears: 9.6,
    yearsLabel: "+4.0 to +4.5 Billion Years",
    scientificEpoch: "Stelliferous Era",
    adamsLaughlinEra: "Stelliferous Era",
    title: "The Great Galactic Merger: 'Milkomeda'",
    subtitle: "Gravitational coalescence of the Milky Way and Andromeda",
    certaintyLevel: "theoretically_sound",
    certaintyBadge: "High Confidence Dynamics (with Proper Motion Uncertainties)",
    solarSystemState:
      "Sun approaches the end of its Main Sequence lifetime. Planets remain gravitationally bound to the Sun with >98% probability despite galactic tides.",
    galacticState:
      "First close perigalactic passage between Milky Way and Andromeda (M31). Massive tidal tails of stars and neutral gas are pulled across intergalactic space.",
    cosmologicalState:
      "The Local Group remains bound by mutual gravity, decoupling from the surrounding accelerated cosmic expansion.",
    entropyAndPhysics:
      "Violent relaxation and dynamic friction transfer orbital angular momentum into random stellar kinetic energy, transforming two disk spirals into a giant triaxial elliptical galaxy.",
    description: {
      explorer:
        "Our Milky Way and its giant neighbor Andromeda are speeding toward each other! In about 4 billion years, they will dance together and merge into one giant super-galaxy called 'Milkomeda'. Stars almost never collide because they are so far apart, but the night sky will be filled with ribbons of glowing starlight!",
      scholar:
        "Based on Hubble and Gaia proper motion measurements of M31 (transverse velocity ~30-50 km/s and radial velocity -110 km/s), the two galaxies will experience multiple pericenter passes before coalescing. Gravitational tidal forces will compress interstellar molecular clouds, sparking a final brief burst of star formation.",
      astrophysicist:
        "N-body smoothed-particle hydrodynamic (SPH) simulations reveal that stellar collisions are negligible due to the low stellar volume filling factor (~10⁻²¹). Gas dissipates energy via radiative cooling and shocks, fueling nuclear starbursts and feeding Sagittarius A* and M31*'s central black holes into an Active Galactic Nucleus (AGN) phase before coalescence.",
    },
    visualTheme: {
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      icon: "Disc",
    },
  },
  {
    id: "sun_red_giant_5gyr",
    logYears: 9.7,
    yearsLabel: "+5.0 to +7.5 Billion Years",
    scientificEpoch: "Stelliferous Era",
    adamsLaughlinEra: "Stelliferous Era",
    title: "The Sun's Red Giant Climax & White Dwarf Remnant",
    subtitle: "Core helium ignition, envelope expansion, and planetary nebula ejection",
    certaintyLevel: "well_supported",
    certaintyBadge: "Well-Supported Stellar Astrophysics",
    solarSystemState:
      "Sun exhausts core hydrogen, expands into a Red Giant (radius ~170–250 R_sun), engulfing Mercury and Venus. Earth is either consumed or roasted as an irradiated cinder; Sun sheds ~45% of its mass into a planetary nebula.",
    galacticState:
      "Milkomeda core settles into a relaxed giant elliptical galaxy with an aging stellar population.",
    cosmologicalState:
      "Hubble parameter approaches asymptotic constant H_inf ≈ 56 km/s/Mpc in flat ΛCDM space.",
    entropyAndPhysics:
      "Degenerate carbon-oxygen core forms; electron degeneracy pressure halts further gravitational collapse below the Chandrasekhar limit (1.4 M_sun).",
    description: {
      explorer:
        "The Sun exhausts its hydrogen core fuel, swelling up into a vast red giant hundreds of times wider than it is now! It will swallow Mercury and Venus. Eventually, it blows off its outer layers as a glowing cosmic smoke ring, leaving behind a hot, dense Earth-sized white dwarf ember.",
      scholar:
        "At t ≈ 12 Gyr total age, the hydrogen-exhausted core contracts while a hydrogen-burning shell ignites, pushing the convective envelope out to ~1 AU. After core helium burning via the triple-alpha process and thermal pulses on the Asymptotic Giant Branch (AGB), solar wind mass loss leaves a ~0.54 M_sun carbon-oxygen white dwarf that will slowly cool over trillions of years.",
      astrophysicist:
        "Earth's orbital radius expands outward due to solar mass loss (r ∝ M_sun⁻¹), but tidal dissipation in the extended convective envelope exerts a retarding torque: dr/dt = - (k_2 / τ_tidal) (R_env/r)^8. Detailed hydrodynamical modeling (Schröder & Connon Smith) suggests tidal capture overcomes mass-loss orbital expansion, leading to Earth's engulfment at r ≈ 256 R_sun.",
    },
    visualTheme: {
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      icon: "Sun",
    },
  },
  {
    id: "cosmic_isolation_100gyr",
    logYears: 11,
    yearsLabel: "+100 Billion Years",
    scientificEpoch: "Stelliferous Era",
    adamsLaughlinEra: "Stelliferous Era",
    title: "Cosmological Horizon Isolation",
    subtitle: "All exterior galaxy clusters slip permanently past the cosmic event horizon",
    certaintyLevel: "well_supported",
    certaintyBadge: "Solid General Relativity & ΛCDM",
    solarSystemState:
      "Cold white dwarf Sun surrounded by frozen outer planets (Mars, Jupiter, Saturn, Uranus, Neptune) in expanded orbits.",
    galacticState:
      "Milkomeda is completely isolated. All galaxies not gravitationally bound to the Local Group have redshifted beyond detection.",
    cosmologicalState:
      "Distant galaxies reach z → ∞; cosmological event horizon d_e = c ∫ dt/a(t) prevents any light from outside our bound cluster from ever reaching us.",
    entropyAndPhysics:
      "Cosmic Microwave Background (CMB) cools below 0.05 K, stretching to radio wavelengths with peak λ > 5 cm, becoming virtually unobservable against local galactic synchrotron noise.",
    description: {
      explorer:
        "Because dark energy is stretching space faster and faster, every galaxy outside our own neighborhood will race away faster than light! Any future astronomers looking up at the sky would think their single galaxy was the only thing in the entire universe.",
      scholar:
        "In an accelerating de Sitter universe driven by dark energy (w = -1), the proper distance to unbound structures grows exponentially: d(t) ∝ e^(H_t). All galaxy clusters outside the Local Supercluster cross the cosmological event horizon. Their emitted light becomes infinitely redshifted, fading permanently to black.",
      astrophysicist:
        "Cosmic history amnesia (Loeb & Krauss): Future civilizations born after t ≈ 100 Gyr will have no observational evidence for the Big Bang or cosmological expansion. The CMB will be masked by the intergalactic plasma frequency (ω_p ≈ 10 s⁻¹), and no standard candles outside Milkomeda will be visible. The universe will appear static, eternal, and solitary.",
    },
    visualTheme: {
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      icon: "EyeOff",
    },
  },
  {
    id: "stelliferous_end_100t",
    logYears: 14,
    yearsLabel: "+100 Trillion Years (10¹⁴ yr)",
    scientificEpoch: "Stelliferous Era Climax",
    adamsLaughlinEra: "End of the Stelliferous Era",
    title: "The Last Stars Flame Out",
    subtitle: "Cold molecular gas is depleted; longest-lived red dwarfs exhaust hydrogen",
    certaintyLevel: "well_supported",
    certaintyBadge: "Well-Supported Stellar Lifetimes",
    solarSystemState:
      "Sun is a cooling 'black dwarf' at T < 100 K, a diamond-like crystallized carbon-oxygen lattice in total darkness.",
    galacticState:
      "No new stars can form. Interstellar hydrogen is locked inside stellar remnants (white dwarfs, neutron stars, black holes) and failed stars (brown dwarfs).",
    cosmologicalState: "Cosmic background temperature approaches microkelvins (T_CMB < 10⁻⁴ K).",
    entropyAndPhysics:
      "Stellar nucleosynthesis ceases entirely. The universe transitions from radiation-generating fusion engines to degenerate matter repositories.",
    description: {
      explorer:
        "Small red dwarf stars burn their fuel so slowly and carefully that they can live for trillions of years! But by 100 trillion years, even the very last red dwarf star will use up its final drop of hydrogen fuel and go dark. The Stelliferous (star-bearing) Era of the universe comes to an end.",
      scholar:
        "Lowest-mass stars (M ≈ 0.08 M_sun) are fully convective, meaning they circulate 100% of their hydrogen through their core. Their nuclear fusion lifespans scale as t_ms ≈ 10¹⁰ (M/M_sun)⁻².⁵ yr ≈ 10¹⁴ yr (100 trillion years). Once they fade into helium white dwarfs, no new starbursts can occur because interstellar gas is exhausted or locked in stellar corpses.",
      astrophysicist:
        "Cosmic star formation rate density ψ(z), which peaked at 'Cosmic Noon' (z ≈ 1.9, ~10 Gyr ago) at ~0.1 M_sun/yr/Mpc³, asymptotically approaches zero as cold molecular gas accretion from the cosmic web is severed by de Sitter acceleration. Gas recycling efficiency through planetary nebulae and supernovae is < 40%, guaranteeing finite chemical exhaustion.",
    },
    visualTheme: {
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/30",
      icon: "Moon",
    },
  },
  {
    id: "degenerate_era_10e15",
    logYears: 20,
    yearsLabel: "10¹⁵ to 10³⁹ Years",
    scientificEpoch: "Degenerate Era",
    adamsLaughlinEra: "Degenerate Era (Adams & Laughlin)",
    title: "The Degenerate Graveyard & Dynamical Evaporation",
    subtitle: "Brown dwarf collisions, orbital decay, and hypothetical proton decay",
    certaintyLevel: "theoretically_sound",
    certaintyBadge: "Physics-Grounded / Proton Decay Hypothesized",
    solarSystemState:
      "Surviving dead planets are gradually stripped from the dead Sun through rare close gravitational encounters with wandering stellar remnants (~10¹⁵ yr).",
    galacticState:
      "Milkomeda undergoes dynamical relaxation: ~90-99% of dead stellar corpses are gravitationally scattered into intergalactic space, while ~1-10% sink into the central supermassive black hole.",
    cosmologicalState:
      "Space is an unimaginably vast, near-empty vacuum dotted with lonely black dwarfs, neutron stars, and black holes separated by light-years.",
    entropyAndPhysics:
      "Occasional brown dwarf collisions trigger rare, dim red flare stars. If Grand Unified Theories (GUTs) are correct, protons decay with half-life τ_p ~ 10³⁴ to 10³⁶ years, dissolving all baryonic matter into positrons, electrons, and photons.",
    description: {
      explorer:
        "In this quiet era, only cold cosmic remnants remain: burned-out white dwarfs, neutron stars, cold brown dwarfs, and black holes. Over trillions upon trillions of years, close passes will fling planets and dead stars out into the lonely dark, while central black holes swallow whatever falls in.",
      scholar:
        "Adams & Laughlin (1997) classified this as the Degenerate Era. Matter is locked in degenerate electron/neutron states. Rare collisions between brown dwarfs briefly rekindle fusion. Gravitational radiation (orbital decay via quadrupole energy loss: dE/dt = -32 G⁴ M³ / 5 c⁵ r⁵) eventually spirals remaining orbiting bodies into central masses over ~10²⁰ years.",
      astrophysicist:
        "Proton decay hypothesis: If baryon number conservation is violated (predicted by SU(5) and SO(10) GUT models via X/Y gauge bosons, p → e⁺ + π⁰), nucleons decay on timescales τ_p > 1.6 × 10³⁴ yr (Super-Kamiokande empirical lower limit). Proton decay releases ~10²⁵ W per white dwarf, maintaining internal temperatures at T ≈ 0.06 K until all atoms dissolve by ~10³⁹ years.",
    },
    visualTheme: {
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      icon: "Radio",
    },
  },
  {
    id: "black_hole_era_10e40",
    logYears: 65,
    yearsLabel: "10⁴⁰ to 10¹⁰⁰ Years",
    scientificEpoch: "Black Hole Era",
    adamsLaughlinEra: "Black Hole Era (Adams & Laughlin)",
    title: "Black Hole Sovereignty & Hawking Evaporation",
    subtitle: "Supermassive black holes dominate, radiating away via quantum tunneling",
    certaintyLevel: "theoretically_sound",
    certaintyBadge: "Quantum Field Theory in Curved Spacetime",
    solarSystemState:
      "All atomic matter has decayed or been swallowed; no planets, moons, or atoms remain.",
    galacticState:
      "The only surviving organized structures are isolated supermassive black holes (masses 10⁶ to 10¹¹ M_sun) drifting in total darkness.",
    cosmologicalState:
      "Temperature of the cosmological horizon T_dS = \u210f H / (2π k_B) ≈ 10⁻³⁰ K.",
    entropyAndPhysics:
      "Hawking radiation evaporates black holes: T_H = \u210f c³ / (8π G M k_B). Evaporation timescale: t_evap = 5120 π G² M³ / (\u210f c⁴) \u221d M³.",
    description: {
      explorer:
        "Black holes are the ultimate survivors! For countless eons, they are the only massive things left in the cosmos. But even black holes do not last forever—quantum physics causes them to slowly leak tiny amounts of heat called Hawking radiation, until they evaporate in a final flash of light!",
      scholar:
        "Stephen Hawking proved in 1974 that quantum vacuum fluctuations near event horizons produce a thermal emission spectrum. Stellar-mass black holes (3 M_sun) evaporate in ~10⁶⁸ years. Supermassive black holes like Sgr A* take ~10⁸⁷ years, while the most colossal 100-billion-solar-mass titans evaporate by ~10¹⁰⁶ years.",
      astrophysicist:
        "The Hawking temperature T_H is inversely proportional to mass: T_H \u2248 6.17 \u00d7 10⁻⁸ (M_sun/M) K. As mass decreases via dm/dt = - \u210f c⁴ / (15360 π G² m²), the black hole heats up. During the final 0.1 second of evaporation, the remaining ~10⁶ kg explodes with an energy of ~10²² Joules (equivalent to millions of megatons of TNT), releasing high-energy gamma rays and Standard Model particles.",
    },
    visualTheme: {
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      icon: "Disc",
    },
  },
  {
    id: "dark_era_10e100",
    logYears: 100,
    yearsLabel: "> 10¹⁰⁰ Years and Beyond",
    scientificEpoch: "Dark Era",
    adamsLaughlinEra: "The Dark Era (Heat Death)",
    title: "The Dark Era & Maximum Thermodynamic Entropy",
    subtitle: "A silent sea of ultra-diffuse photons, leptons, and quantum vacuum",
    certaintyLevel: "speculative_frontier",
    certaintyBadge: "Thermodynamic Limit / Physics Frontier",
    solarSystemState:
      "Completely non-existent. Spacetime coordinates once occupied by our solar system are indistinguishable from empty vacuum.",
    galacticState: "No galaxies, no clusters, no stars, no black holes.",
    cosmologicalState:
      "Cosmological event horizon expanded to virtually empty de Sitter space; particles are separated by billions of light-years.",
    entropyAndPhysics:
      "Thermodynamic equilibrium; maximum entropy S_max. Free energy F = U - TS approaches zero. No physical work, computation, information processing, or chemical reaction can ever take place.",
    description: {
      explorer:
        "After the last black hole evaporates, the universe enters the Dark Era. Only lonely, stretched-out photons of light and rare particles drift in an ocean of silence. All heat differences have smoothed out, and no more engines, stars, or life can ever run.",
      scholar:
        "This is the thermodynamic Heat Death (the Big Freeze). The Second Law of Thermodynamics dictates that entropy in an isolated system never decreases (dS \u2265 0). When all temperature gradients vanish (thermal equilibrium), usable free energy reaches zero, ending all physical and biological processes.",
      astrophysicist:
        "In the asymptotic de Sitter state, particle mean free paths exceed the Hubble horizon: λ_mfp \u226b c/H_0. Rare positronium pairs (e⁺ and e⁻ orbiting each other across astronomical distances) may form and slowly spiral inward via quadrupole gravitational radiation over ~10¹⁴² years to annihilate. Extremely rare Poincaré recurrence or quantum vacuum tunneling events are calculated on timescales of 10^(10^(10^56)) years, representing theoretical curiosities rather than observable astrophysics.",
    },
    visualTheme: {
      color: "text-slate-500",
      bgColor: "bg-slate-900/60",
      borderColor: "border-slate-700/40",
      icon: "Infinity",
    },
  },
];

export const SUN_EVOLUTION_STAGES: SunEvolutionStage[] = [
  {
    id: "stage_current",
    name: "1. Current Main Sequence",
    timeGyr: 0,
    totalAgeGyr: 4.6,
    radiusSolar: 1.0,
    luminositySolar: 1.0,
    temperatureKelvin: 5778,
    coreFuel: "Core Hydrogen fusion (p-p chain, ~600M tons H/sec converted to He)",
    earthStatus: "Abundant liquid water oceans, protective magnetic dynamo, thriving biosphere.",
    earthHabitability: "Habitable",
    description:
      "The Sun is currently in stable hydrostatic equilibrium, balancing inward gravitational pull with outward thermonuclear radiation pressure.",
    keyPhysics:
      "Hydrostatic equilibrium: dP/dr = - G M(r) ρ(r) / r². Core temperature T_c ≈ 15.7 million K; central density ρ_c ≈ 150 g/cm³.",
  },
  {
    id: "stage_subgiant",
    name: "2. Subgiant Transition",
    timeGyr: 5.0,
    totalAgeGyr: 9.6,
    radiusSolar: 2.3,
    luminositySolar: 2.2,
    temperatureKelvin: 4900,
    coreFuel: "Core hydrogen exhausted; hydrogen shell burning begins around inert helium ash core",
    earthStatus:
      "Oceans completely evaporated (~1-2 Gyr); surface is an arid, sun-scorched desert baked at >100°C.",
    earthHabitability: "Oceans Vaporized",
    description:
      "As the hydrogen in the Sun's core is converted into helium ash, the core contracts and heats up, causing the outer convective layers to swell.",
    keyPhysics:
      "Schönberg-Chandrasekhar limit: an isothermal core cannot support more than ~10% of the star's mass before contracting.",
  },
  {
    id: "stage_first_rgb",
    name: "3. First Red Giant Branch (RGB)",
    timeGyr: 7.0,
    totalAgeGyr: 11.6,
    radiusSolar: 170,
    luminositySolar: 2350,
    temperatureKelvin: 3100,
    coreFuel:
      "Vigorously burning Hydrogen shell; degenerate helium core contracting to extreme density",
    earthStatus:
      "Mercury and Venus are swallowed. Earth's surface rocks melt into glowing lava lakes; atmosphere is stripped away by intense solar wind.",
    earthHabitability: "Engulfed or Scorched Remnant",
    description:
      "The Sun balloons into a colossal red giant. It fills half the sky from Earth's orbit, shining with the brightness of over 2,000 modern Suns.",
    keyPhysics:
      "Luminosity L = 4π R² σ T_eff⁴. Despite a lower surface temperature (3,100 K vs 5,778 K), the immense radius yields L ≈ 2,350 L_sun.",
  },
  {
    id: "stage_helium_flash",
    name: "4. Helium Core Flash & Horizontal Branch",
    timeGyr: 7.1,
    totalAgeGyr: 11.7,
    radiusSolar: 10,
    luminositySolar: 45,
    temperatureKelvin: 4700,
    coreFuel:
      "Core Helium fusion via Triple-Alpha process (3 ⁴He → ¹²C) plus hydrogen shell burning",
    earthStatus:
      "Cooled slightly from peak RGB inferno, but remains a dead, airless slag of basalt and iron.",
    earthHabitability: "Frozen Cinder",
    description:
      "When the degenerate helium core reaches ~100 million Kelvin, helium fusion ignites explosively in a matter of minutes (the Helium Flash), lifting degeneracy and settling into stable horizontal-branch burning.",
    keyPhysics:
      "Triple-alpha reaction: ⁴He + ⁴He ↔ ⁸Be, then ⁸Be + ⁴He → ¹²C* → ¹²C + γ. Degenerate matter pressure is independent of temperature (P \u221d ρ^(5/3)), causing a runaway thermal flash until thermal pressure lifts degeneracy.",
  },
  {
    id: "stage_agb",
    name: "5. Asymptotic Giant Branch (AGB)",
    timeGyr: 7.3,
    totalAgeGyr: 11.9,
    radiusSolar: 250,
    luminositySolar: 5000,
    temperatureKelvin: 3000,
    coreFuel:
      "Inert Carbon-Oxygen core; alternating Helium and Hydrogen shell burning (Thermal Pulses)",
    earthStatus:
      "Maximum solar radius extends to ~1.2 AU. Tidal drag in the giant envelope likely drags Earth inward into total destruction, or leaves a charred rocky core at ~1.5 AU.",
    earthHabitability: "Engulfed or Scorched Remnant",
    description:
      "The Sun's second red giant phase is even larger and more violent than the first. Violent thermal pulsations blow away massive shells of outer atmosphere.",
    keyPhysics:
      "Thermal pulses (helium shell flashes) occur every ~100,000 years, driving massive mass-loss rates up to 10⁻⁴ M_sun/yr via dust radiation pressure.",
  },
  {
    id: "stage_planetary_nebula",
    name: "6. Planetary Nebula Ejection",
    timeGyr: 7.4,
    totalAgeGyr: 12.0,
    radiusSolar: 0.1,
    luminositySolar: 100,
    temperatureKelvin: 100000,
    coreFuel: "All nuclear fusion stops; hot naked core exposed to space",
    earthStatus:
      "Surviving outer planets (Mars, Jupiter, Saturn) orbit a glowing jewel of ionized gas expanding outward at 20-30 km/s.",
    earthHabitability: "Frozen Cinder",
    description:
      "The Sun ejects its entire outer convective mantle into deep space, forming an illuminated, colorful planetary nebula that enriches the galaxy with carbon and oxygen.",
    keyPhysics:
      "Ultraviolet photons from the blistering 100,000 K central proto-white dwarf photoionize the ejected gas shells ([O III], H-alpha emission lines).",
  },
  {
    id: "stage_white_dwarf",
    name: "7. White Dwarf & Black Dwarf",
    timeGyr: 8.0,
    totalAgeGyr: 12.6,
    radiusSolar: 0.009, // Earth-sized!
    luminositySolar: 0.001,
    temperatureKelvin: 10000,
    coreFuel: "No fusion; supported entirely by electron degeneracy pressure",
    earthStatus:
      "Deep, permanent sub-zero freeze. Any surviving planetary remnants orbit in darkness around an Earth-sized diamond star.",
    earthHabitability: "Frozen Cinder",
    description:
      "The Sun is now a white dwarf: roughly 54% of its original mass packed into a sphere no larger than Earth. It has no nuclear fuel left and will slowly radiate away its residual thermal heat over trillions of years.",
    keyPhysics:
      "Electron degeneracy pressure: P_e = (3 π²)^(2/3) (\u210f² / 5 m_e) n_e^(5/3). Mestel cooling law: L \u221d t^(-7/2). It will take > 10¹⁴ years to cool to an undetectable Black Dwarf (T < 5 K).",
  },
];

export const GALAXY_MERGER_STAGES: GalaxyMergerStage[] = [
  {
    phase: 1,
    timeGyr: 0,
    name: "Present Day: Mutual Approach",
    separationKpc: 770, // ~2.5 million light-years
    relativeVelocityKms: 110,
    morphology:
      "Two distinct spiral galaxies: Milky Way (barred spiral SBbc) and Andromeda (spiral SA(s)b).",
    starFormationRate: "Steady: ~1-2 M_sun/yr in Milky Way, ~0.5-1 M_sun/yr in M31.",
    description:
      "The two dominant galaxies of the Local Group are accelerating toward each other due to their mutual gravitational pull, overcoming cosmological expansion.",
    astrophysicalDetails:
      "Gaia DR3 astrometry measures M31 transverse velocity at v_tan ≈ 30–50 km/s. The radial collision path has small angular momentum, ensuring close gravitational interaction.",
  },
  {
    phase: 2,
    timeGyr: 4.0,
    name: "First Pericenter Passage",
    separationKpc: 25,
    relativeVelocityKms: 450,
    morphology:
      "Dramatic tidal bridges and tails. Spiral arms distort into chaotic ribbons stretching across hundreds of thousands of light-years.",
    starFormationRate: "Rising: ~10-15 M_sun/yr as intergalactic gas clouds collide.",
    description:
      "The disks graze each other at over 400 km/s! While individual stars almost never collide because space is mostly empty, interstellar gas clouds crash violently.",
    astrophysicalDetails:
      "Tidal forces dF/dr = 2 G M / r³ strip stellar and dark matter streams. Gas clouds experience strong hydrodynamic shock heating and compression.",
  },
  {
    phase: 3,
    timeGyr: 4.5,
    name: "Apocenter Turnaround",
    separationKpc: 100,
    relativeVelocityKms: 150,
    morphology:
      "Two warped, elongated spheroids connected by a faint stellar bridge, slowing down at maximum post-pass separation.",
    starFormationRate: "Moderate: ~5 M_sun/yr.",
    description:
      "Like two cosmic skaters on a gravitational tether, the galaxies swing past each other, slow down at their farthest rebound point, and begin falling back together.",
    astrophysicalDetails:
      "Dynamic friction between the overlapping dark matter halos removes orbital angular momentum, transferring kinetic energy to halo particles.",
  },
  {
    phase: 4,
    timeGyr: 5.1,
    name: "Secondary Infall & Nuclear Starburst",
    separationKpc: 10,
    relativeVelocityKms: 320,
    morphology:
      "Severely disrupted chaotic core merger. Shockwaves compress remaining molecular reservoirs.",
    starFormationRate:
      "Starburst peak: > 25 M_sun/yr; supermassive black holes Sgr A* and M31* form a close binary.",
    description:
      "The galaxies collide for the second time, thoroughly blending their stars and plunging gas into the central cores, sparking a dazzling fireworks display of newborn star clusters.",
    astrophysicalDetails:
      "Gas loses angular momentum rapidly via gravitational torques from non-axisymmetric bars and inflows into the central ~500 pc.",
  },
  {
    phase: 5,
    timeGyr: 6.0,
    name: "Relaxation into 'Milkomeda'",
    separationKpc: 0,
    relativeVelocityKms: 0,
    morphology:
      "Giant triaxial elliptical galaxy (E3/E4) with a smooth stellar halo and no spiral arms.",
    starFormationRate:
      "Quenched (< 0.1 M_sun/yr); gas exhausted or expelled by active galactic nucleus feedback.",
    description:
      "The merger is complete! A peaceful giant elliptical galaxy—often nicknamed 'Milkomeda'—shines with the warm golden glow of billions of old stars. The central supermassive black holes have merged.",
    astrophysicalDetails:
      "Violent relaxation (Lynden-Bell) randomizes stellar orbits into a velocity ellipsoid. The two SMBHs (Sgr A* at 4×10⁶ M_sun and M31* at 1.4×10⁸ M_sun) inspiral and coalesce, radiating ~10⁵⁴ Joules in gravitational waves.",
  },
];

export const COSMOLOGICAL_SCENARIOS: CosmologicalScenario[] = [
  {
    id: "big_freeze",
    name: "The Big Freeze (Heat Death)",
    alternativeNames: ["The Big Chill", "Asymptotic de Sitter Dilution", "Standard ΛCDM Fate"],
    equationOfState: "w = P / (ρ c²) = -1.0 (Cosmological Constant)",
    confidence: "Standard Consensus (ΛCDM)",
    confidenceRating: "Consensus",
    description:
      "The universe continues expanding at an accelerating rate driven by constant vacuum dark energy. Galaxies outside our bound cluster fade past the horizon. Stars run out of fuel, remnants dissolve, black holes evaporate, and temperature asymptotically approaches absolute zero at maximum entropy.",
    fateOfGalaxies:
      "Local Group remains gravitationally bound as Milkomeda; all other galaxy clusters drift beyond the cosmological event horizon and become permanently invisible.",
    fateOfAtomsAndSpacetime:
      "Baryonic matter persists until potential proton decay (~10³⁴-10³⁹ yr); black holes evaporate by 10¹⁰⁰ yr; spacetime expands forever smoothly.",
    timescaleToEndpoint: "10¹⁴ yr (last stars) → 10¹⁰⁰ yr (last black holes) → ∞ (asymptote)",
    keyScientificMechanism:
      "Cosmological constant Λ has constant energy density ρ_Λ = Λ c² / (8π G). Matter density drops as a⁻³, while dark energy remains constant, leading to exponential metric expansion a(t) ∝ e^(H t).",
    entropyTrend:
      "Entropy S increases monotonically to a global thermodynamic maximum S_max where no free energy ΔF = ΔU - TΔS remains.",
  },
  {
    id: "big_rip",
    name: "The Big Rip",
    alternativeNames: ["Phantom Energy Catastrophe", "Cosmic Disruption"],
    equationOfState: "w < -1.0 (Phantom Dark Energy, e.g. w = -1.5)",
    confidence: "Hypothetical (Phantom Energy)",
    confidenceRating: "Speculative",
    description:
      "If dark energy is 'phantom energy' with w < -1, its density does not stay constant—it grows with time! As the universe expands, dark energy becomes infinitely repulsive, tearing apart galaxy clusters, galaxies, planetary systems, stars, atoms, and finally spacetime itself at a finite future time.",
    fateOfGalaxies:
      "Ripped apart into unconstrained individual stars ~60 million years before the Rip.",
    fateOfAtomsAndSpacetime:
      "Planets torn apart 30 minutes before; atoms and nuclei stripped by infinite negative pressure 10⁻¹⁹ seconds before; spacetime curvature diverges to infinity (R → ∞).",
    timescaleToEndpoint:
      "Finite time: t_rip ≈ (2/3) / (|1 + w| H_0 √(Ω_DE)) ≈ 20 to 50 billion years from today.",
    keyScientificMechanism:
      "For w < -1, energy density ρ_ph ∝ a^(-3(1+w)) grows as scale factor a grows. The scale factor reaches infinity in finite cosmic time: a(t) = a_0 [ (t_rip - t) / (t_rip - t_0) ]^(-2 / 3|1+w|).",
    entropyTrend:
      "Thermodynamic definitions break down as causal horizons shrink to zero radius around every quantum point.",
  },
  {
    id: "big_crunch",
    name: "The Big Crunch & Big Bounce",
    alternativeNames: ["Cosmic Recollapse", "Oscillating / Cyclic Universe"],
    equationOfState: "Dynamical Scalar Field (Quintessence with V(φ) < 0) or w > -1/3",
    confidence: "Alternative (Dynamical DE)",
    confidenceRating: "Unlikely with current data",
    description:
      "If dark energy is not a static constant but a dynamical scalar field whose potential energy drops below zero, the cosmic acceleration could stop and reverse into contraction. Spacetime would shrink, blue-shifting light, heating up, and crushing all matter back into a scorching high-density singularity—or bouncing into a new cycle.",
    fateOfGalaxies:
      "Expansion halts at a maximum scale factor a_max; galaxies fall back toward each other, merging into a single chaotic super-dense plasma inferno.",
    fateOfAtomsAndSpacetime:
      "The CMB blue-shifts into visible light, then ultraviolet, then gamma rays, vaporizing stars and decomposing atoms back into subatomic quarks and gluons.",
    timescaleToEndpoint:
      "Estimated at least 20 to 100+ billion years into the future if turnaround begins.",
    keyScientificMechanism:
      "The Friedmann equation H² = (8πG/3)ρ - k c²/a² requires H = 0 when energy density cancels spatial curvature or potential V(φ) becomes negative, yielding d²a/dt² < 0.",
    entropyTrend:
      "A profound paradox: whether entropy resets at the bounce or accumulates across cycles, potentially limiting maximum cycle lifetimes (Tolman's oscillation problem).",
  },
  {
    id: "vacuum_decay",
    name: "False Vacuum Decay",
    alternativeNames: [
      "Higgs Metastability",
      "Bubble of Nothingness",
      "Phase Transition Catastrophe",
    ],
    equationOfState: "Quantum Field Metastability (V_Higgs(φ))",
    confidence: "Quantum Speculation",
    confidenceRating: "Theoretical Frontier",
    description:
      "Precise measurements of the top quark mass (~172.5 GeV) and Higgs boson mass (~125.1 GeV) at the CERN LHC suggest our universe's electroweak vacuum may be metastable. Quantum tunneling could nucleate a true-vacuum bubble that expands outward at light speed, radically altering the laws of physics inside.",
    fateOfGalaxies:
      "Instantly annihilated without advance warning the microsecond the bubble wall passes.",
    fateOfAtomsAndSpacetime:
      "Inside the bubble, the Higgs field acquires a new vacuum expectation value; electrons and quarks change mass or decouple, dissolving all chemical bonds, atoms, and gravitational structures.",
    timescaleToEndpoint:
      "Expected tunneling lifetime is extraordinarily vast: τ_tunneling > 10¹⁰⁰ to 10⁶⁰⁰ years, far longer than the present age of the universe.",
    keyScientificMechanism:
      "Coleman-De Luccia instanton tunneling across an energy barrier in the effective Higgs potential: Γ/V ≈ A e^(-B/\u210f).",
    entropyTrend:
      "Instantaneous catastrophic state collapse within the causal light-cone of nucleation.",
  },
];

export const STELLAR_POPULATION_ERAS: StellarPopulationEra[] = [
  {
    eraName: "Stelliferous Youth (Cosmic Noon to Present)",
    timeRange: "0 to 10 Billion Years",
    activeStarTypes: [
      "O, B, A (Blue Supergiants)",
      "F, G (Solar-type)",
      "K (Orange dwarfs)",
      "M (Red dwarfs)",
    ],
    dyingStarTypes: ["Massive O/B stars explode as Core-Collapse Supernovae in 10-50 Myr"],
    dominantRemnants: ["Neutron Stars", "Stellar Black Holes", "White Dwarfs"],
    cosmicLuminosityPercent: 100,
    starFormationRatePercent: 100,
    notes: "Vibrant star nurseries, emission nebulae, and spiral galaxies lit by hot blue stars.",
  },
  {
    eraName: "Golden Sunset of Stars",
    timeRange: "+10 to +100 Billion Years",
    activeStarTypes: ["G (Late Solar-type)", "K (Orange dwarfs)", "M (Red dwarfs)"],
    dyingStarTypes: ["Solar-mass stars swell into Red Giants and shed planetary nebulae"],
    dominantRemnants: ["Carbon-Oxygen White Dwarfs", "Pulsars", "Black Holes"],
    cosmicLuminosityPercent: 35,
    starFormationRatePercent: 12,
    notes: "Blue stars vanish; galaxies take on a reddish-amber hue dominated by low-mass stars.",
  },
  {
    eraName: "The Twilight of Red Dwarfs",
    timeRange: "+100 Billion to +100 Trillion Years",
    activeStarTypes: [
      "M-dwarfs (Red & Blue dwarf transition)",
      "Brown dwarfs (deuterium burning only)",
    ],
    dyingStarTypes: [
      "Orange K-dwarfs fade into white dwarfs; long-lived red dwarfs burn final core hydrogen",
    ],
    dominantRemnants: ["Helium & Carbon-Oxygen White Dwarfs", "Neutron Stars", "Black Holes"],
    cosmicLuminosityPercent: 2,
    starFormationRatePercent: 0.1,
    notes: "Only dim red dwarfs light up the cosmos. Galaxies are dark disks studded with embers.",
  },
  {
    eraName: "The Degenerate Graveyard",
    timeRange: "+100 Trillion to 10³⁹ Years",
    activeStarTypes: ["None (All nuclear fusion ceased)"],
    dyingStarTypes: ["Occasional rare brown dwarf collisions briefly ignite dim flare stars"],
    dominantRemnants: [
      "Black Dwarfs (crystallized C-O)",
      "Neutron Stars",
      "Black Holes",
      "Cold Brown Dwarfs",
    ],
    cosmicLuminosityPercent: 0.000000001,
    starFormationRatePercent: 0,
    notes:
      "No active stars remain anywhere in the observable universe. Degenerate remnants slowly cool toward absolute zero.",
  },
];

export const MODULE_20_SUBLESSONS: SubLesson[] = [
  {
    id: "sub_sun_future",
    title: "1. The Future Evolution of the Sun",
    subtitle: "From stable yellow dwarf to red giant, planetary nebula, and white dwarf ember",
    durationMinutes: 18,
    objectives: [
      "Understand why the Sun will brighten by ~10% every billion years as its core builds helium ash",
      "Trace the Sun's path on the Hertzsprung-Russell diagram to the Red Giant Branch and AGB",
      "Explain the Helium Core Flash and how mass loss forms a planetary nebula",
      "Differentiate the white dwarf core supported by electron degeneracy pressure from a living star",
    ],
    content: {
      explorer: {
        summary:
          "Our Sun has been shining steadily for 4.6 billion years, but it will not stay the same forever. As it burns through its hydrogen fuel, it will slowly become hotter and brighter. In about 5 billion years, it will swell up into a giant red balloon hundreds of times larger than it is today, before shedding its outer coat and shrinking into a dense Earth-sized ember called a white dwarf.",
        keyTakeaways: [
          "The Sun gets about 10% brighter every billion years as its engine warms up.",
          "In about 5 billion years, the Sun runs out of core hydrogen and expands into a Red Giant.",
          "The giant Sun will swallow Mercury and Venus, and make Earth unimaginably hot.",
          "Eventually, the Sun puffs away its outer layers into a glowing planetary nebula, leaving behind a white dwarf.",
        ],
        deepDive:
          "Think of the Sun like a campfire that slowly burns its biggest logs. As the center packs together tighter and tighter, the fire actually gets hotter and pushes the outer smoke and flames farther outward. When all the easy fuel is gone, the campfire collapses into glowing hot coals. That's exactly what a white dwarf star is: the hot, super-dense coal left behind by a dead Sun!",
        didYouKnow:
          "A single teaspoon of material from the Sun's future white dwarf core will weigh as much as an elephant on Earth—about 5 tons!",
      },
      scholar: {
        summary:
          "The Sun's main sequence lifetime is governed by the rate of hydrogen fusion via the proton-proton chain. Core helium accumulation increases the mean molecular weight, causing the core to contract and heat up to maintain hydrostatic equilibrium. At t ≈ 10–12 Gyr, the hydrogen core is exhausted, triggering shell burning, the First Red Giant Branch, the explosive Helium Flash at T ≈ 100 million K, the Asymptotic Giant Branch, and envelope ejection into a white dwarf.",
        keyTakeaways: [
          "Solar luminosity increases by ~1% per 110 Myr, reaching 1.1 L_0 at +1.1 Gyr and 2.2 L_0 at +5 Gyr.",
          "The Red Giant Branch (RGB) expands the solar photosphere to ~170–250 R_0 (over 1 AU).",
          "The Helium Flash ignites degenerate helium in the core runaway before settling onto the horizontal branch.",
          "Thermal pulses on the AGB strip ~45% of the Sun's mass into the interstellar medium.",
        ],
        deepDive:
          "Hydrostatic equilibrium requires dP/dr = - G M(r) ρ(r) / r². Because the core is an ideal gas during the main sequence (P = ρ k_B T / μ m_u), as hydrogen converts to helium, μ increases from ~0.6 to ~1.3. To balance gravity, T_c and ρ_c must rise. The increased temperature dramatically accelerates the p-p chain reaction rate (ε ∝ T⁴), producing the gradual 10% per Gyr luminosity increase.",
        didYouKnow:
          "The Helium Core Flash produces as much peak energy as an entire galaxy for a few seconds, but the energy is absorbed by lifting core degeneracy and never reaches the surface as a visible explosion!",
      },
      astrophysicist: {
        summary:
          "Quantitative stellar modeling (e.g., Sackmann et al. 1993, Schröder & Connon Smith 2008) details the post-main-sequence trajectory of a 1.0 M_sun star with solar metallicity (Z ≈ 0.014). From the Schönberg-Chandrasekhar limit through degenerate electron core formation (E_F ≈ 0.3 MeV), the helium flash, and thermal pulses on the TP-AGB, the final remnant is a 0.54 ± 0.02 M_sun carbon-oxygen white dwarf cooled via neutrino emission and surface blackbody radiation.",
        keyTakeaways: [
          "Core hydrogen exhaustion occurs at t ≈ 10.0 Gyr (relative to ZAMS); RGB tip is reached at t ≈ 12.16 Gyr.",
          "At the RGB tip, L_max ≈ 2,730 L_0 and R_max ≈ 256 R_0; mass loss reaches ~0.28 M_sun via Reimers' wind formulation.",
          "Degenerate electron equation of state: P_e = (3π²)^(2/3) (ℏ² / 5m_e) n_e^(5/3), independent of temperature.",
          "Mestel cooling law applies: L_WD ≈ C (M/M_sun) T_core^(7/2), cooling from 100,000 K to < 4,000 K over 10¹² years.",
        ],
        deepDive:
          "During the TP-AGB phase, helium shell flashes occur when the thin helium layer between the degenerate C-O core and the hydrogen-burning shell reaches critical mass. Thermal instability drives violent convective mixing ('third dredge-up'), enriching the outer envelope with synthesized carbon and s-process elements before radiation pressure on carbonaceous dust grains ejects the envelope at terminal velocities v_inf ≈ 15–30 km/s.",
        didYouKnow:
          "When the white dwarf cools below ~10,000 K, the electrostatic Coulomb energy between carbon and oxygen nuclei exceeds the thermal kinetic energy (Γ = Z²e² / (a_i k_B T) > 178), causing the entire core to freeze into a body-centered cubic crystal lattice—a cosmic diamond!",
      },
    },
  },
  {
    id: "sub_earth_future",
    title: "2. The Long-Term Future of Earth",
    subtitle: "Biosphere extinction, ocean evaporation, and the debate over engulfment vs escape",
    durationMinutes: 16,
    objectives: [
      "Explain how increasing solar luminosity will trigger a moist greenhouse effect in ~1 Gyr",
      "Trace the shutdown of the carbon-silicate geochemical cycle and biosphere timeline",
      "Analyze the competing forces determining Earth's fate: solar mass loss expansion vs tidal dissipation drag",
      "Understand why Earth's ultimate fate (engulfment vs survival as a scorched rock) contains scientific uncertainty",
    ],
    content: {
      explorer: {
        summary:
          "Earth will not remain cozy forever. Long before the Sun swells into a red giant, its gradual brightening will warm Earth up. In about 1 billion years, the oceans will evaporate into steam, and plant life will disappear. When the Sun finally becomes a red giant in 7 billion years, it will expand right to Earth's doorstep. Scientists are still studying whether Earth will be completely swallowed or pushed out into a frozen outer orbit!",
        keyTakeaways: [
          "In ~600 million to 1 billion years, extra heat will evaporate water and shut down complex plant life.",
          "By ~1.5 to 2 billion years, Earth will lose all its oceans to space.",
          "When the Sun expands to its largest size, it will either engulf Earth or leave it as a burned cinder.",
          "Scientific models cannot predict the exact outcome with 100% certainty because solar mass loss and tidal drag battle each other.",
        ],
        deepDive:
          "Imagine pulling a boat toward a dock while someone else pushes water away. The dock is the Sun swelling outward, but as the Sun loses mass, its gravitational grip weakens, letting Earth drift outward! At the same time, tides in the Sun's giant atmosphere try to drag Earth inward. Which one wins? The latest computer simulations show it is a very close race, with engulfment being slightly more likely.",
        didYouKnow:
          "Even if Earth escapes being swallowed, its surface will be heated to over 1,000°C—hot enough to melt rock into lakes of glowing lava!",
      },
      scholar: {
        summary:
          "Earth's habitability ends far earlier than the Sun's red giant phase. Increased weathering accelerates CO2 drawdown; in ~600 Myr, atmospheric CO2 falls below ~10 ppm, ending C3 and C4 photosynthesis. By ~1.1 Gyr, surface temperatures exceed 350 K, triggering a runaway moist greenhouse where water vapor reaches the stratosphere and is photolyzed by UV, losing all water to space via hydrodynamic escape.",
        keyTakeaways: [
          "Carbon-silicate cycle feedback accelerates CO2 depletion as temperatures rise.",
          "The moist greenhouse threshold occurs when troposphere water vapor mixing ratio exceeds ~0.1.",
          "Solar mass loss increases Earth's semi-major axis: r(t) = r_0 [M_sun(0) / M_sun(t)].",
          "Tidal friction in the Sun's convective envelope exerts a retarding torque that opposes orbital expansion.",
        ],
        deepDive:
          "The carbon-silicate weathering thermostat (Walker et al.): CaSiO3 + CO2 ↔ CaCO3 + SiO2. Higher rainfall and temperature accelerate chemical weathering of silicate rocks, pulling CO2 out of the atmosphere. Because the solar flux continues to rise, the thermostat breaks down when CO2 reaches the minimum threshold for photosynthesis, collapsing primary food webs long before the oceans fully evaporate.",
        didYouKnow:
          "The last surviving organisms on Earth in ~1.5 to 2 billion years will likely be deep subsurface extremophile bacteria, the same kinds of simple microbes that began life on early Earth!",
      },
      astrophysicist: {
        summary:
          "Quantitative orbital dynamics during the Sun's RGB tip involve two competing nonlinear terms: orbital expansion due to isotropic stellar mass loss: (dr/dt)_mass = - r (dM/dt) / M, versus orbital decay driven by tidal dissipation in the turbulent convective stellar envelope: (dr/dt)_tide = - (k_2 / τ_tide) (M_env / M_total) (R_sun / r)⁸ (Ω_rot - Ω_orb). Schröder & Connon Smith (2008) show tidal drag dominates at r < 1.15 AU, predicting Earth's engulfment at t ≈ 12.167 Gyr.",
        keyTakeaways: [
          "Solar mass drops from 1.0 M_0 to ~0.67 M_0 at the RGB tip, which alone would expand Earth's orbit to ~1.5 AU.",
          "However, when R_sun expands to ~256 R_0 (1.19 AU), tidal torques scale as (R_sun / r)⁸, causing rapid runaway orbital decay.",
          "Hydrodynamic ablation inside the stellar envelope evaporates Earth's crust and mantle within a few thousand years.",
          "Uncertainties remain in the tidal dissipation timescale τ_tide and the exact mass-loss prescription (Reimers vs Bloecker).",
        ],
        deepDive:
          "Tidal dissipation in convective stellar envelopes is governed by turbulent eddy viscosity acting on the equilibrium tide. The tidal quality factor Q or effective lag time τ_lag determines the retarding torque. If the convective turnover time τ_conv is longer than the tidal forcing period, eddy viscosity is reduced (Goldreich-Nicholson scaling vs Zahn scaling), leading to a factor of ~2 uncertainty in the critical semi-major axis for capture.",
        didYouKnow:
          "Mars, at 1.52 AU, will drift outward to ~2.2 AU during the Sun's mass loss, safely avoiding engulfment and briefly experiencing surface temperatures warm enough to melt its subsurface permafrost!",
      },
    },
  },
  {
    id: "sub_galaxy_motions",
    title: "3. Future Motions of Galaxies",
    subtitle:
      "The Milky Way–Andromeda collision, Local Group coalescence, and the cosmic event horizon",
    durationMinutes: 18,
    objectives: [
      "Model the approach of the Andromeda Galaxy (M31) at 110 km/s and the formation of 'Milkomeda'",
      "Explain why individual stars virtually never collide during galactic mergers",
      "Trace the coalescence of the Local Group into a solitary giant elliptical galaxy",
      "Understand how accelerated cosmic expansion will isolate Milkomeda behind the cosmic event horizon",
    ],
    content: {
      explorer: {
        summary:
          "Galaxies are not frozen in space—they are in constant motion! The Andromeda Galaxy is speeding straight toward our Milky Way at 110 kilometers per second. In about 4 billion years, the two galaxies will pass right through each other, pulling out spectacular ribbons of stars. Eventually, they will merge into one peaceful super-galaxy nicknamed 'Milkomeda'. Later, all distant galaxies will drift out of view forever because of cosmic expansion.",
        keyTakeaways: [
          "Andromeda and the Milky Way are approaching each other at about 400,000 km/h.",
          "Even when galaxies collide, stars are so widely spaced that almost none actually bump into each other.",
          "The merger will transform two spiral disks into one smooth giant elliptical galaxy.",
          "Over 100 billion years, dark energy will push all galaxies outside our group over the horizon, leaving Milkomeda alone in the dark.",
        ],
        deepDive:
          "If stars were the size of tennis balls, they would be separated by over 1,000 miles of empty space! That is why when two galaxies collide, the stars just pass smoothly past one another like two swarms of gnats crossing paths. What does collide violently are the giant clouds of hydrogen gas, which get squeezed together and ignite thousands of brilliant new star clusters!",
        didYouKnow:
          "If anyone is still around in 4 billion years, the night sky will be filled with a massive glowing band of light as Andromeda's spiral arms drape across our sky!",
      },
      scholar: {
        summary:
          "The Milky Way and M31 form a gravitationally bound binary system with total mass ~2.5–3 × 10¹² M_sun. High-precision proper motion astrometry from the Hubble Space Telescope and Gaia spacecraft confirms a largely radial collision trajectory with first pericenter at ~4.0 Gyr. Dynamical friction from extended dark matter halos transfers orbital momentum to halo particles, causing complete coalescence into a giant elliptical galaxy by ~6 Gyr.",
        keyTakeaways: [
          "Radial velocity is -110 km/s; transverse velocity is v_tan ≈ 30–50 km/s.",
          "First perigalactic pass occurs at ~4.0 Gyr; complete coalescence into 'Milkomeda' at ~5.5–6.0 Gyr.",
          "Dynamic friction transfers orbital energy into random kinetic energy of dark matter and stars.",
          "Gravitationally bound structures (Local Group) remain intact despite global metric expansion.",
        ],
        deepDive:
          "Chandrasekhar's dynamical friction formula explains how galaxies merge: F_df = - 4π G² M² ρ_dm ln(Λ) [erf(X) - 2X e^(-X²) / √π] / v², where X = v / (√2 σ). As the galactic cores plow through the overlapping dark matter halos, a gravitational wake forms behind them, exerting a continuous braking force that pulls the cores into a death spiral.",
        didYouKnow:
          "The supermassive black holes at the centers of both galaxies (Sagittarius A* at 4 million M_sun and M31* at 140 million M_sun) will form a close binary and eventually merge, releasing intense gravitational waves!",
      },
      astrophysicist: {
        summary:
          "Cosmological structure evolution dictates that regions with matter density contrast δρ/ρ > δ_c ≈ 1.686 have decoupled from the Hubble flow and virialized. The Local Group (Milky Way, M31, M33, and ~80 dwarf spheroidal companions) is a gravitationally bound, virialized structure that will resist dark-energy-driven metric expansion. In contrast, unbound structures (Virgo, Coma, and all distant clusters) accelerate away according to the de Sitter metric.",
        keyTakeaways: [
          "Gaia DR3 astrometry (van der Marel et al. 2019) narrows M31 orbital parameters, confirming a direct or close grazing encounter.",
          "Violent relaxation (Lynden-Bell 1967) operates on timescales of a few dynamical times (t_dyn ~ 200 Myr), establishing a de Vaucouleurs R^(1/4) surface brightness profile.",
          "Gas compression fuels a starburst, but subsequent AGN feedback and shock heating quench star formation, creating a 'red and dead' elliptical.",
          "Cosmic event horizon d_e = c ∫ dt/a(t) asymptotic limit prevents photons emitted by exterior clusters after t ≈ 100 Gyr from ever reaching Milkomeda.",
        ],
        deepDive:
          "The metric expansion of space does not expand gravitationally bound systems. In the weak-field limit of General Relativity with a cosmological constant Λ, the equation of motion for a test particle is d²r/dt² = - G M_enc / r² + (Λ c² / 3) r. For the Local Group, the gravitational attraction term dominates over the repulsive dark energy term out to the turnaround radius R_ta ≈ [3 G M_tot / (Λ c²)]^(1/3) ≈ 1.5–2.0 Mpc.",
        didYouKnow:
          "Because all external galaxies will slip beyond the cosmological horizon in ~100 billion years, any astronomers evolving in the far future will have no observational way to discover the Big Bang, expanding space, or other galaxies—they would conclude their island galaxy is the entire universe!",
      },
    },
  },
  {
    id: "sub_stellar_evolution_time",
    title: "4. Stellar Evolution Across Cosmic Time",
    subtitle:
      "Lifespans of stars: why high-mass blue giants die quickly while red dwarfs live for trillions of years",
    durationMinutes: 17,
    objectives: [
      "Relate stellar mass to main-sequence lifetime: t_ms ∝ M / L ∝ M^(-2.5)",
      "Explain why red dwarfs burn fuel for 10 to 100 trillion years due to full convection",
      "Trace the sequential die-off of star classes across the Hertzsprung-Russell diagram",
      "Identify the degenerate graveyard: white dwarfs, neutron stars, and cold brown dwarfs",
    ],
    content: {
      explorer: {
        summary:
          "Stars live very different lifespans depending on how heavy they are. Giant blue stars are like roaring drag-racing cars: they burn up all their gas in just a few million years and explode as supernovae! But tiny, dim red dwarf stars are like ultra-efficient hybrid cars: they sip their fuel so slowly that they can live for tens of trillions of years—thousands of times longer than the current age of our universe!",
        keyTakeaways: [
          "Massive stars burn bright and die fast (10 to 50 million years).",
          "Stars like our Sun live for about 10 billion years.",
          "Tiny red dwarfs can live for up to 100 trillion years!",
          "When stars die, they leave behind dense cosmic remnants: white dwarfs, neutron stars, or black holes.",
        ],
        deepDive:
          "Why do red dwarfs live so unimaginably long? In our Sun, only the center can burn hydrogen, because heat doesn't circulate well. But in a tiny red dwarf, the entire star churns like a boiling pot of soup! Every single atom of hydrogen gets circulated into the hot core and burned, so nothing is wasted.",
        didYouKnow:
          "No red dwarf star in the history of the universe has ever grown old and died yet! Because the universe is only 13.8 billion years old, all the red dwarfs that were ever born are still in their early childhood.",
      },
      scholar: {
        summary:
          "Stellar lifetimes are determined by the mass-luminosity relation: L ∝ M^(3.5) for intermediate-mass stars. Because fuel available is proportional to mass M, the main-sequence lifetime scales as t_ms ∝ M / L ∝ M^(-2.5). A 10 M_sun star lives only ~30 Myr, a 1 M_sun star lives ~10 Gyr, and a 0.1 M_sun red dwarf can endure for ~10¹⁴ years (100 trillion years).",
        keyTakeaways: [
          "Mass-to-luminosity scaling: higher mass means exponentially faster fuel consumption.",
          "Red dwarfs (M < 0.35 M_sun) are fully convective, utilizing nearly 100% of their hydrogen fuel.",
          "As red dwarfs age, they slowly contract into warm 'blue dwarfs' before settling into helium white dwarfs without a giant phase.",
          "By t ≈ 100 trillion years, all hydrogen fusion throughout the cosmos will be extinguished.",
        ],
        deepDive:
          "Convective stability is governed by the Schwarzschild criterion: - dT/dr < (1 - 1/γ) (T/P) |dP/dr|. In low-mass stars, high atmospheric opacity (due to molecular H2 and H⁻ ions) creates steep temperature gradients throughout the interior, making the entire star convective from core to photosphere. This prevents helium ash from settling exclusively in the core.",
        didYouKnow:
          "Before tiny red dwarfs finally die in ~10 trillion years, they will actually heat up and glow blue (becoming theoretical 'blue dwarfs') because their surface radiates more efficiently as helium fraction increases!",
      },
      astrophysicist: {
        summary:
          "Theoretical stellar evolution models for ultra-low-mass stars (Laughlin, Bodenheimer & Adams 1997) demonstrate that below the fully convective threshold (M ≈ 0.35 M_sun), stars do not develop a distinct core-envelope boundary. Instead, the hydrogen mass fraction X decreases uniformly throughout the star: dX/dt = - L / (Q M_star), where Q = 6.4 × 10¹⁸ erg/g for hydrogen-to-helium fusion. Their lifetimes reach t_ms ≈ 1.2 × 10¹⁴ (0.08 M_sun / M) yr.",
        keyTakeaways: [
          "Mass threshold for hydrogen burning is M_min ≈ 0.075–0.08 M_sun (depending on metallicity Z); below this are substellar brown dwarfs.",
          "Red dwarfs never reach the temperatures required for triple-alpha helium fusion (T_c remains below ~10⁸ K).",
          "Their end states are degenerate helium white dwarfs with masses ~0.08–0.25 M_sun, bypassing planetary nebula ejection.",
          "Stellar mass function (Salpeter/Chabrier IMF) heavily favors low-mass stars, so > 75% of all stars ever born will survive into the deep future.",
        ],
        deepDive:
          "Because helium white dwarfs formed from single low-mass stars have lifetimes exceeding the current age of the universe, all currently observed helium white dwarfs are the result of binary mass transfer (where a companion stripped the red giant envelope before helium ignition). Single-star helium white dwarfs will only naturally appear in the universe starting at t > 100 Gyr.",
        didYouKnow:
          "Brown dwarfs (masses between 13 and 80 Jupiter masses) never ignite steady hydrogen fusion, but they will wander the dark universe forever, occasionally colliding to form rare, transient low-mass stars in the Degenerate Era!",
      },
    },
  },
  {
    id: "sub_declining_star_formation",
    title: "5. Declining Cosmic Star Formation",
    subtitle: "The Madau–Dickinson curve: why the cosmic party peaked 10 billion years ago",
    durationMinutes: 15,
    objectives: [
      "Analyze the Madau-Dickinson curve of cosmic star formation rate density ψ(z)",
      "Explain why star formation peaked at 'Cosmic Noon' (z ≈ 1.9) and has plummeted by >95%",
      "Trace the exhaustion of cold molecular gas reservoirs (CO and H2) in galaxies",
      "Understand why new star formation will completely halt within ~1 to 100 trillion years",
    ],
    content: {
      explorer: {
        summary:
          "Did you know that the universe's biggest baby boom of stars is already over? About 10 billion years ago, galaxies were churning out new stars at a furious pace—hundreds of times faster than today! Astronomers call this time 'Cosmic Noon'. Ever since then, the universe has been running low on cold gas, and star birth has been slowing down. In the future, star formation will stop completely.",
        keyTakeaways: [
          "The peak of star creation in the universe happened 10 billion years ago ('Cosmic Noon').",
          "Today, the rate of star birth is less than 5% of what it used to be.",
          "Galaxies are running out of cold hydrogen gas clouds to build new stars.",
          "When the gas is all used up or blown away, no more new stars can ever be born.",
        ],
        deepDive:
          "Think of the universe like a bakery that started with a massive sack of flour (hydrogen gas). During the morning rush, the baker baked thousands of fresh star cookies! But by afternoon, most of the flour has been baked into cookies or locked up in crumbs. The bakery is still open, but it can only bake a few cookies a day, and soon the flour will be completely gone.",
        didYouKnow:
          "Over 95% of all the stars that will ever exist in the entire history of the universe have already been born!",
      },
      scholar: {
        summary:
          "The cosmic star formation history is quantified by the Madau-Dickinson relation: ψ(z) = 0.015 (1 + z)^2.7 / [1 + ((1 + z)/2.9)^5.6] M_sun yr⁻¹ Mpc⁻³. Star formation peaked at redshift z ≈ 1.9 (~10 Gyr ago) at ~0.1 M_sun yr⁻¹ Mpc⁻³ and has declined exponentially by a factor of ~20 to today's rate of ~0.007 M_sun yr⁻¹ Mpc⁻³.",
        keyTakeaways: [
          "Peak star formation ('Cosmic Noon') occurred at lookback time t_lb ≈ 10 Gyr (z ≈ 1.9).",
          "Decline is driven by gas consumption, AGN feedback heating, and reduced cosmic web accretion.",
          "Stellar nucleosynthesis locks up ~60% of gas in long-lived remnants; only ~40% is recycled.",
          "Cold molecular gas (measured via CO line surveys with ALMA) is depleting on depletion timescales t_dep ≈ M_gas / SFR ~ 1–2 Gyr.",
        ],
        deepDive:
          "Why didn't galaxies save their gas? Early hierarchical mergers and cold gas accretion streams fed high-density gas reservoirs, driving high Kennicutt-Schmidt star formation rates: Σ_SFR ∝ Σ_gas^1.4. However, energy feedback from supermassive black holes (AGN radio jets and quasar winds) and massive star supernovae injected heat into the circumgalactic medium, preventing gas from cooling and halting further accretion.",
        didYouKnow:
          "In our own Milky Way, only about 1 to 2 new stars are born every year, compared to dozens per year during its youthful peak!",
      },
      astrophysicist: {
        summary:
          "The cessation of cosmic star formation ('cosmic quenching') involves the interplay between the Kennicutt-Schmidt law, halo virialization, and dark energy acceleration. As dark energy takes over cosmic expansion (z < 0.4), the growth of linear perturbations δ(t) freezes out: D(a) ∝ H(a) ∫ da / (a H(a))³. This halts the gravitational accretion of pristine intergalactic gas filaments onto galaxy halos, severing the supply lines of fresh baryon fuel.",
        keyTakeaways: [
          "Cosmic web baryon accretion drops exponentially as de Sitter acceleration isolates dark matter halos.",
          "Baryon recycling efficiency R ≈ 0.3–0.5 (via stellar winds and supernovae) guarantees finite gas exhaustion via the closed-box / leaky-box model: M_gas(t) = M_gas(0) e^(- (1 - R) t / t_dep).",
          "Gravitational heating in virialized halos (M_halo > 10¹² M_sun) sets up stable accretion shocks that heat falling gas to virial temperatures T_vir > 10⁶ K, preventing radiative cooling.",
          "Complete cessation of star formation is projected for t ≈ 10¹⁴ years when remaining cold gas disks in isolated elliptical galaxies are exhausted.",
        ],
        deepDive:
          "The chemical evolution equation dZ/dt = y (1 - R) SFR / M_gas demonstrates that as gas fractions approach zero, metallicity Z in the remaining gas climbs dramatically. The very last stars born in the universe around t ≈ 10¹³–10¹⁴ years will be hyper-metal-rich low-mass red dwarfs and brown dwarfs, forming from gas polluted by hundreds of previous stellar generations.",
        didYouKnow:
          "The James Webb Space Telescope (JWST) and ALMA have directly confirmed that distant galaxies at z > 2 were packed with up to 10 times more cold molecular gas than galaxies today!",
      },
    },
  },
  {
    id: "sub_cosmic_structures_future",
    title: "6. The Distant Future of Cosmic Structures",
    subtitle:
      "The 5 physical eras of Adams and Laughlin: from stars to degenerate matter, black holes, and darkness",
    durationMinutes: 18,
    objectives: [
      "Define the 5 cosmological eras of Adams & Laughlin: Primordial, Stelliferous, Degenerate, Black Hole, Dark Era",
      "Model dynamical relaxation and evaporation of galaxies over 10¹⁹ to 10²⁴ years",
      "Explain the hypothesis and experimental search for proton decay (τ_p > 10³⁴ yr)",
      "Calculate Hawking evaporation timescales for stellar and supermassive black holes",
    ],
    content: {
      explorer: {
        summary:
          "Two brilliant astrophysicists named Fred Adams and Gregory Laughlin realized we can divide the entire future of the universe into five great chapters. We are living in the very beginning—the second chapter, called the Stelliferous (Star) Era! After this comes the Degenerate Era (only dead embers), the Black Hole Era (where black holes reign supreme), and finally the Dark Era, where everything fades into a peaceful, quiet, endless sea of light and particles.",
        keyTakeaways: [
          "The 5 Cosmic Eras: Primordial, Stelliferous, Degenerate, Black Hole, and Dark Era.",
          "We live in the Stelliferous Era (the brief era when stars shine).",
          "In the Degenerate Era (10¹⁵ to 10³⁹ years), only white dwarfs, neutron stars, and black holes remain.",
          "In the Black Hole Era (10⁴⁰ to 10¹⁰⁰ years), black holes slowly evaporate into Hawking radiation.",
          "The Dark Era (> 10¹⁰⁰ years) is the quiet, endless finale.",
        ],
        deepDive:
          "If the entire lifetime of the universe were a 100-year human life, the time when stars shine would be over before the baby is even one second old! We happen to live in a very special, lucky moment in cosmic history when the universe is warm, bright, and filled with glowing stars.",
        didYouKnow:
          "Over 99.99999999999999999999999999999999999999999999999999% of the universe's total history will take place after the last star has died!",
      },
      scholar: {
        summary:
          "In their seminal 1997 paper, Adams and Laughlin organized cosmic chronology into five eras based on the dominant physical processes: 1. Primordial Era (Big Bang to first stars), 2. Stelliferous Era (10⁶ to 10¹⁴ yr, nuclear fusion), 3. Degenerate Era (10¹⁵ to 10³⁹ yr, degenerate remnants and proton decay), 4. Black Hole Era (10⁴⁰ to 10¹⁰⁰ yr, Hawking radiation), and 5. Dark Era (> 10¹⁰⁰ yr, ultra-low energy photons and leptons).",
        keyTakeaways: [
          "Stelliferous Era ends at ~10¹⁴ years with the extinction of the lowest-mass M-dwarfs.",
          "Galactic dynamical relaxation: close gravitational scattering ejects ~90–99% of stars into intergalactic space over ~10¹⁹ years.",
          "Proton decay (hypothesized half-life ~10³⁴–10³⁸ yr) slowly dissolves all white dwarfs and neutron stars.",
          "Hawking radiation evaporates stellar-mass black holes in ~10⁶⁷ yr and supermassive giants in ~10¹⁰⁰ yr.",
        ],
        deepDive:
          "Dynamical relaxation of stellar remnants in galaxies occurs through two-body gravitational encounters. The relaxation time is t_relax ≈ (0.1 N / ln N) t_cross. Over ~100 relaxation times (~10¹⁹ yr), stellar remnants in Milkomeda will experience close encounters where one body gains escape velocity and is ejected into intergalactic space, while the other loses angular momentum and falls into the central supermassive black hole.",
        didYouKnow:
          "If protons decay, a cold white dwarf in the Degenerate Era will generate about 400 watts of power from nuclear decay—barely enough energy to power four household lightbulbs, but keeping the white dwarf at a temperature of 0.06 Kelvin!",
      },
      astrophysicist: {
        summary:
          "The physical transitions between cosmological eras are governed by fundamental physical timescales: nuclear fusion timescales (t_nuc ~ 10¹⁴ yr), gravitational two-body relaxation and ejection (t_evap ~ 10¹⁹–10²⁴ yr), gravitational radiation orbital decay (t_gw ∝ r⁴ / M³ ~ 10²⁰ yr), baryon decay (τ_p > 1.6 × 10³⁴ yr via p → e⁺ π⁰), and semi-classical Hawking evaporation (t_hawk = 5120 π G² M³ / (ℏ c⁴) ≈ 2.1 × 10⁶⁷ (M/M_sun)³ yr).",
        keyTakeaways: [
          "Baryon number violation is required by Sakharov conditions; Grand Unified Theories (GUTs) predict proton decay via dimension-6 gauge boson exchange.",
          "If protons do not decay (Baryon number is strictly conserved), cold white dwarfs and neutron stars survive until quantum tunneling to iron-56 occurs on Dyson timescales of ~10^(10²⁶) years.",
          "Black hole temperature T_H = ℏ c³ / (8π G M k_B) reaches the CMB temperature when T_H = T_CMB; beyond that, black holes become net emitters rather than net absorbers.",
          "The Dark Era is characterized by a photon-to-baryon ratio approaching infinity, with photons redshifted to wavelength λ > c/H_0.",
        ],
        deepDive:
          "Hawking radiation in the Black Hole Era: The power radiated by a Schwarzschild black hole is P = - dM c² / dt = ℏ c⁶ / (15360 π G² M²). Integrating dM/dt yields the total evaporation lifetime: t_evap = (5120 π G² / 3 ℏ c⁴) M_0³. For the largest known supermassive black holes (M ≈ 6 × 10¹⁰ M_sun, such as TON 618), t_evap ≈ 2.1 × 10⁶⁷ × (6 × 10¹⁰)³ ≈ 4.5 × 10¹⁰² years.",
        didYouKnow:
          "In the final second of a black hole's life, when its mass drops below ~228 tons, it releases its remaining mass-energy in a colossal explosion equivalent to 5 million megatons of TNT!",
      },
    },
  },
  {
    id: "sub_heat_death_entropy",
    title: "7. Heat-Death Scenarios & Thermodynamics",
    subtitle:
      "The Second Law, entropy maximization, and why you can't build a machine without temperature differences",
    durationMinutes: 16,
    objectives: [
      "Understand the Second Law of Thermodynamics: entropy S always increases in an isolated system (dS ≥ 0)",
      "Explain the concept of thermodynamic Heat Death as a state of maximum entropy and thermal equilibrium",
      "Relate free energy (F = U - TS) to the ability to perform physical work, process information, or sustain life",
      "Introduce Ludwig Boltzmann's statistical entropy: S = k_B ln(Ω)",
    ],
    content: {
      explorer: {
        summary:
          "Have you ever wondered why ice cubes melt in warm water, but warm water never spontaneously freezes into an ice cube? That's because of a universal rule called entropy! Entropy means things naturally spread out and become less organized. In the far future of the universe, all heat and energy will spread out evenly everywhere. When everything is the exact same temperature, no engines can run, no stars can shine, and no life can exist. Scientists call this 'Heat Death' or the 'Big Freeze'.",
        keyTakeaways: [
          "Entropy is a measure of how spread out and mixed up energy is.",
          "Heat always naturally flows from hot things to cold things, never the reverse.",
          "You need a difference in temperature to generate power, move muscles, or run computers.",
          "When the whole universe reaches the exact same temperature, no more work or thoughts can happen.",
        ],
        deepDive:
          "Imagine a drop of blue food coloring placed in a glass of water. At first, it's a tight, organized drop. But slowly, it spreads out until the whole glass is a pale, uniform blue. Once it spreads out, it will never spontaneously gather back into a single drop! That is what happens to all energy in our universe. It spreads out until everything is completely balanced and uniform.",
        didYouKnow:
          "The term 'Heat Death' can sound confusing because it doesn't mean the universe gets hot—it actually means the universe gets unimaginably cold! It's called heat death because all heat flow dies.",
      },
      scholar: {
        summary:
          "The concept of cosmic Heat Death was first formulated by Lord Kelvin, Rudolf Clausius, and Hermann von Helmholtz in the 1850s following the discovery of the Second Law of Thermodynamics: ΔS_total ≥ 0. In an expanding universe, usable mechanical work requires a non-zero thermodynamic gradient (Carnot efficiency η = 1 - T_cold / T_hot). When all gradients vanish in thermal equilibrium, the Helmholtz free energy F = U - TS reaches its minimum, eliminating any capacity for physical work or biological metabolism.",
        keyTakeaways: [
          "Second Law of Thermodynamics: dS ≥ 0 for any closed thermodynamic system.",
          "Carnot efficiency η = (T_hot - T_cold) / T_hot shows that work requires temperature differences.",
          "Thermal equilibrium represents the state of maximum macroscopic entropy.",
          "Information processing and life require continuous entropy export to a cold bath (Landauer's principle).",
        ],
        deepDive:
          "Ludwig Boltzmann connected thermodynamics to statistical mechanics: S = k_B ln(Ω), where Ω is the number of accessible microstates corresponding to a macroscopic state. Because there are vastly more disordered microstates than ordered ones, random particle interactions overwhelmingly drive systems toward maximum Ω. The initial condition of our universe—an extraordinarily low-entropy Big Bang—is what allows stars, planets, and life to exist today.",
        didYouKnow:
          "The great physicist Ludwig Boltzmann was so proud of his statistical entropy equation S = k_B ln(Ω) that he had it engraved on his tombstone in Vienna!",
      },
      astrophysicist: {
        summary:
          "Cosmological entropy budget analysis (Egan & Lineweaver 2010) reveals that supermassive black holes dominate the current observable universe's entropy budget: S_SMBH ≈ 10¹⁰⁴ k_B, compared to the CMB at S_CMB ≈ 10⁸⁹ k_B and stellar baryons at only S_stars ≈ 10⁷⁹ k_B. The Bekenstein-Hawking black hole entropy S_BH = k_B c³ A / (4 G ℏ) = k_B (4π G M² / ℏ c) demonstrates that black holes are the ultimate entropy repositories.",
        keyTakeaways: [
          "Bekenstein-Hawking entropy scales with event horizon area A: S_BH = (k_B / 4) (A / l_p²).",
          "When black holes evaporate into Hawking radiation photons, entropy increases further: S_rad ≈ 4/3 S_BH.",
          "The Dark Era achieves maximal de Sitter entropy: S_dS = k_B π c³ / (G ℏ H²), corresponding to the cosmological event horizon area.",
          "Poincaré Recurrence Theorem applies only to bounded phase spaces; in open accelerating de Sitter space, recurrence is debated.",
        ],
        deepDive:
          "Landauer's Principle dictates that erasing one bit of information in any computation requires dissipating a minimum energy of E_min = k_B T ln(2) into the environment. Freeman Dyson (1979) demonstrated that in an ever-cooling open universe, if temperature drops as T(t) ∝ t^(-a), an intelligent entity could theoretically perform infinite computations on finite energy only if a ≤ 1/3. However, with a positive cosmological constant Λ > 0, de Sitter horizon radiation imposes a non-zero minimum temperature T_min = ℏ H / (2π k_B) ≈ 10⁻³⁰ K, placing a finite upper bound on total future computations.",
        didYouKnow:
          "A single supermassive black hole with a mass of 1 billion Suns contains more thermodynamic entropy than all the gas, stars, radiation, and particles in the rest of the observable universe combined!",
      },
    },
  },
  {
    id: "sub_cosmic_possibilities",
    title: "8. Alternative Cosmological Possibilities & Uncertainties",
    subtitle:
      "The Big Rip, Big Crunch, Vacuum Decay, and why dark energy holds the secret to our ultimate fate",
    durationMinutes: 18,
    objectives: [
      "Distinguish how the dark energy equation of state w = P/ρ determines cosmological destiny",
      "Compare the Big Freeze (w = -1), Big Rip (w < -1), and Big Crunch (w > -1/3 or negative V)",
      "Explain the concept of false vacuum decay in the Standard Model Higgs potential",
      "Emphasize the scientific humility required when extrapolating physics across billions and trillions of years",
    ],
    content: {
      explorer: {
        summary:
          "How will the whole universe end? The honest answer from science is: we have great theories, but we don't know for sure yet! The ultimate fate of everything depends on what dark energy really is. If dark energy stays the same, we get the Big Freeze. If it gets stronger and wilder, it could rip atoms apart in a Big Rip! If it weakens or pulls backward, space could collapse in a Big Crunch. Science is all about exploring these fascinating possibilities!",
        keyTakeaways: [
          "Our predictions about the far future depend on the mystery of dark energy.",
          "The Big Freeze is currently the most widely supported scientific model.",
          "The Big Rip is a scenario where dark energy grows stronger and tears everything apart.",
          "The Big Crunch is a scenario where expansion reverses into a giant cosmic collapse.",
          "Scientists treat far-future predictions as carefully tested models, not guaranteed prophecies.",
        ],
        deepDive:
          "Imagine tossing a ball straight up into the air. If gravity is strong, the ball slows down, stops, and falls back down into your hand (that's the Big Crunch). If you throw it at the exact right speed, it drifts away forever (the Big Freeze). But what if a mystery rocket engine strapped to the ball starts firing faster and faster until the ball tears itself apart? That's the Big Rip!",
        didYouKnow:
          "Astronomers use giant space telescopes like the James Webb and the Roman Space Telescope to measure dark energy with incredible precision to find out which future is the real one!",
      },
      scholar: {
        summary:
          "The asymptotic fate of the cosmos is determined by the dark energy equation of state parameter w = P / (ρ c²). Observational constraints from Planck, SDSS BAO, and Type Ia supernovae (Pantheon+) find w = -1.03 ± 0.03, consistent with Einstein's cosmological constant (w = -1). However, even slight deviations (phantom energy w < -1 or dynamic quintessence w(a) = w_0 + w_a(1 - a)) lead to radically divergent cosmological futures.",
        keyTakeaways: [
          "The cosmological constant (w = -1) leads to the Big Freeze (exponential de Sitter expansion).",
          "Phantom energy (w < -1) drives energy density to infinity in a finite time Big Rip.",
          "Quintessence scalar fields with negative potentials can trigger turnaround and a Big Crunch.",
          "Higgs vacuum metastability represents a quantum tunneling transition to a true minimum.",
        ],
        deepDive:
          "In the Big Rip model (Caldwell, Kamionkowski & Weinberg 2003), phantom energy with w < -1 has an energy density ρ_ph ∝ a^(-3(1+w)) that increases as the scale factor a grows. The time remaining until the Big Rip is t_rip - t_0 ≈ (2/3) / [|1 + w| H_0 √(1 - Ω_m)]. For w = -1.5, t_rip would be ~35 billion years from the Big Bang (~22 billion years from today).",
        didYouKnow:
          "In a Big Rip scenario, the repulsive force overcomes gravity in the solar system just 3 months before the end, tears Earth apart 30 minutes before, and shatters atomic nuclei in the final 10⁻¹⁹ seconds!",
      },
      astrophysicist: {
        summary:
          "The cosmic scale factor evolution is governed by the Friedmann acceleration equation: ä/a = - (4π G / 3) ∑ [ρ_i + 3 P_i / c²] = - (4π G / 3) [ρ_m + ρ_r + ρ_DE (1 + 3w)]. Acceleration (ä > 0) requires w < -1/3. In addition to dark energy equation of state uncertainties, quantum field theory introduces the possibility of vacuum decay: precision measurements of m_t = 172.5 GeV and m_h = 125.1 GeV place the Standard Model in the metastable valley where the quartic Higgs coupling λ(μ) runs negative at high energy scales μ > 10¹¹ GeV.",
        keyTakeaways: [
          "Dark energy parameterization: Chevallier-Polarski-Linder (CPL) ansatz w(a) = w_0 + w_a (1 - a).",
          "DESI 2024 Year 1 BAO results report intriguing ~2.5–3.9σ hints of dynamical dark energy (w_0 > -1, w_a < 0), reigniting debate over cosmic fate.",
          "Higgs effective potential V_eff(φ) developed through two-loop renormalization group equations reveals a second, deeper minimum at Planckian scales.",
          "Science rigorously distinguishes between deterministic predictions based on well-tested laws (stellar nuclear lifespans) and speculative extrapolations (GUT proton decay, phantom energy, multiverses).",
        ],
        deepDive:
          "The nucleation probability per unit volume for a Coleman-De Luccia true vacuum bubble is Γ/V = A exp(-B/ℏ), where B is the Euclidean four-dimensional action of the bounce solution: B = 27 π² S_1⁴ / (2 [ΔV]³), with S_1 the bubble wall surface tension. Because the action B is exceptionally large (B/ℏ > 10³), the expected tunneling lifetime τ > 10¹⁰⁰ years far exceeds the current age of the cosmos, ensuring short-term cosmological stability while maintaining an open theoretical frontier.",
        didYouKnow:
          "Because a vacuum decay bubble expands at virtually the exact speed of light, it would hit us without any warning whatsoever—there would be no advance radio wave or light signal, because nothing travels faster than the bubble wall!",
      },
    },
  },
];

export const MODULE_20_QUIZ: QuizQuestion[] = [
  {
    id: "m20-q1",
    level: "Junior Explorer",
    question: "Why will our Sun get hotter and brighter over the next 1 billion years?",
    options: [
      "Because the Sun is absorbing heat from Jupiter",
      "Because converting hydrogen into helium ash in its core makes the core hotter and fusion faster",
      "Because space is running out of cold air",
      "Because the Sun is moving closer to Earth",
    ],
    correctAnswer: 1,
    explanation:
      "As the Sun fuses hydrogen into helium, the helium ash packs into the core, causing it to shrink slightly, heat up, and fuse hydrogen even faster!",
  },
  {
    id: "m20-q2",
    level: "Junior Explorer",
    question:
      "What will happen when the Milky Way and Andromeda galaxies collide in ~4 billion years?",
    options: [
      "Every single star will crash head-on into another star and explode",
      "The galaxies will pass through each other and merge into a giant elliptical galaxy called 'Milkomeda'",
      "Both galaxies will instantly vanish into a giant black hole",
      "Earth will be instantly flung into deep space at the speed of light",
    ],
    correctAnswer: 1,
    explanation:
      "Because stars are separated by light-years of empty space, almost no stars will actually collide. The two galaxies will gravitationally merge into a giant elliptical galaxy!",
  },
  {
    id: "m20-q3",
    level: "Junior Explorer",
    question: "Which type of star has the longest lifespan in the entire universe?",
    options: [
      "Giant blue stars",
      "Yellow stars like our Sun",
      "Tiny red dwarf stars",
      "Supergiant red stars",
    ],
    correctAnswer: 2,
    explanation:
      "Tiny red dwarf stars burn their fuel so slowly and efficiently that they can live for tens of trillions of years—thousands of times longer than our Sun!",
  },
  {
    id: "m20-q4",
    level: "Curious Scholar",
    question:
      "What is the primary physical reason Earth will become uninhabitable long before the Sun becomes a red giant?",
    options: [
      "The Moon's orbit will decay and crash into Earth within 500 million years",
      "Solar luminosity increases by ~10% per billion years, triggering a runaway moist greenhouse and ocean loss",
      "The Earth's magnetic core will freeze solid in 200 million years, stripping the atmosphere",
      "Asteroids from the Kuiper belt will bombard Earth continuously",
    ],
    correctAnswer: 1,
    explanation:
      "Standard solar models show that solar luminosity increases by ~10% per billion years. In ~1 to 1.5 Gyr, the increased heat will vaporize Earth's oceans into the stratosphere, where UV photolysis causes permanent water loss.",
  },
  {
    id: "m20-q5",
    level: "Curious Scholar",
    question:
      "In Adams and Laughlin's 5 Cosmological Eras, what characterizes the 'Degenerate Era' (10¹⁵ to 10³⁹ years)?",
    options: [
      "Active nuclear starbursts light up every galaxy",
      "Only stellar remnants (white dwarfs, neutron stars, black holes, brown dwarfs) remain, with no normal star formation",
      "The entire universe is filled with hot quark-gluon plasma",
      "Dark energy reverses and collapses all matter in seconds",
    ],
    correctAnswer: 1,
    explanation:
      "In the Degenerate Era, all regular hydrogen-burning stars have died. The universe is populated solely by cooling degenerate remnants, brown dwarfs, and black holes, while protons may slowly decay.",
  },
  {
    id: "m20-q6",
    level: "Curious Scholar",
    question:
      "How does the Second Law of Thermodynamics explain the ultimate 'Heat Death' of the universe?",
    options: [
      "Entropy in a closed system increases to a maximum, eliminating temperature differences needed to do work",
      "The universe gets infinitely hot and melts all matter into pure energy",
      "Friction between planets generates so much heat that space catches on fire",
      "Atoms stop moving because quantum mechanics is repealed",
    ],
    correctAnswer: 0,
    explanation:
      "The Second Law states that entropy increases (dS ≥ 0). When all temperature differences smooth out into thermal equilibrium, usable free energy reaches zero, and no thermodynamic work or computation can occur.",
  },
  {
    id: "m20-q7",
    level: "Young Astrophysicist",
    question:
      "What dark energy equation of state parameter w = P/(ρ c²) would produce a catastrophic 'Big Rip' in a finite future time?",
    options: [
      "w = 0 (Pressureless dust/matter)",
      "w = +1/3 (Relativistic radiation)",
      "w = -1.0 (Cosmological constant / vacuum energy)",
      "w < -1.0 (Phantom energy, where energy density grows with scale factor a)",
    ],
    correctAnswer: 3,
    explanation:
      "For phantom energy (w < -1), the energy density scales as ρ ∝ a^(-3(1+w)), which increases as the universe expands. This drives the scale factor and expansion rate to infinity at a finite future time, ripping apart all bound systems.",
  },
  {
    id: "m20-q8",
    level: "Young Astrophysicist",
    question:
      "According to Stephen Hawking's semi-classical derivation, how does the evaporation lifetime of a Schwarzschild black hole scale with its initial mass M?",
    options: [
      "t_evap ∝ M (Linear)",
      "t_evap ∝ M² (Quadratic)",
      "t_evap ∝ M³ (Cubic: t_evap = 5120 π G² M³ / (ℏ c⁴))",
      "t_evap ∝ e^(M / M_Planck)",
    ],
    correctAnswer: 2,
    explanation:
      "Because black hole temperature is inversely proportional to mass (T_H ∝ 1/M) and luminosity scales as L ∝ A T⁴ ∝ M² (1/M)⁴ ∝ 1/M², the mass-loss rate is dM/dt ∝ - 1/M². Integrating gives t_evap ∝ M³.",
  },
];

export const MODULE_20_SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    title: "A Dying Universe: The Long-Term Fate and Evolution of Astrophysical Objects",
    organization:
      "Fred C. Adams & Gregory Laughlin / Reviews of Modern Physics (Rev. Mod. Phys. 69, 337)",
    url: "https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.69.337",
  },
  {
    title: "Our Sun. III. Present and Future",
    organization:
      "I.-J. Sackmann, A. I. Boothroyd & K. E. Kraemer / The Astrophysical Journal (ApJ 418, 457)",
    url: "https://ui.adsabs.harvard.edu/abs/1993ApJ...418..457S",
  },
  {
    title: "Distant Future of the Sun and Earth Revisited",
    organization:
      "K.-P. Schröder & Robert Connon Smith / Monthly Notices of the Royal Astronomical Society (MNRAS 386, 155)",
    url: "https://academic.oup.com/mnras/article/386/1/155/1466396",
  },
  {
    title:
      "The M31 Velocity Vector. III. Future Milky Way M31-M33 Orbital Evolution, Merging, and Fate of the Sun",
    organization:
      "R. P. van der Marel, G. Besla, T. J. Cox, S. T. Sohn & J. Anderson / The Astrophysical Journal (ApJ 753, 9)",
    url: "https://iopscience.iop.org/article/10.1088/0004-637X/753/1/9",
  },
  {
    title: "Phantom Energy and Cosmic Doomsday (The Big Rip)",
    organization:
      "R. R. Caldwell, M. Kamionkowski & N. N. Weinberg / Physical Review Letters (PRL 91, 071301)",
    url: "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.91.071301",
  },
  {
    title: "Time Without End: Physics in an Open Universe",
    organization: "Freeman J. Dyson / Reviews of Modern Physics (Rev. Mod. Phys. 51, 447)",
    url: "https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.51.447",
  },
  {
    title: "The Cosmic History of Star Formation",
    organization:
      "Piero Madau & Mark Dickinson / Annual Review of Astronomy and Astrophysics (ARA&A 52, 415)",
    url: "https://www.annualreviews.org/doi/10.1146/annurev-astro-081811-125615",
  },
  {
    title: "A Cosmological Information Bound: The Cosmic Entropy Budget",
    organization:
      "Chas A. Egan & Charles H. Lineweaver / The Astrophysical Journal (ApJ 710, 1825)",
    url: "https://iopscience.iop.org/article/10.1088/0004-637X/710/2/1825",
  },
];

export const MODULE_20_DISCOVERY_FACTS = [
  {
    title: "The Very Long Childhood of Red Dwarfs",
    text: "Because the universe is only 13.8 billion years old, not a single red dwarf star in the history of the cosmos has ever died of old age. Every red dwarf ever created is still in its infancy!",
  },
  {
    title: "The Loneliest Sky in the Cosmos",
    text: "In 100 billion years, cosmic accelerated expansion will push all galaxies outside our Local Group past the cosmic horizon. If astronomers evolved then, they would see zero other galaxies and think their single galaxy was the entire universe.",
  },
  {
    title: "The Final Sputter of Black Holes",
    text: "During the final 0.1 seconds of a black hole's evaporation via Hawking radiation, its remaining mass explodes with the force of millions of hydrogen bombs, releasing high-energy gamma rays into the empty vacuum.",
  },
  {
    title: "The Brief Age of Light",
    text: "The Stelliferous Era (when stars shine) will last ~100 trillion years. That sounds immense, but compared to the 10¹⁰⁰ years of the Black Hole Era, the entire age of starlight is less than a single raindrop in an ocean.",
  },
];
