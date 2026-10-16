import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface PlanetPreset {
  id: string;
  name: string;
  type: string;
  starType: "M" | "K" | "G" | "F" | "A";
  orbitalDistanceAU: number; // in AU
  planetRadiusEarth: number; // in R_earth
  planetMassEarth: number; // in M_earth
  surfacePressureAtm: number; // in atm
  albedo: number; // 0 to 1
  greenhouseGasFraction: number; // factor representing greenhouse gas abundance (CO2, H2O, CH4)
  waterFraction: number; // 0 to 1
  tidalHeatingWatts: number; // internal tidal heating W/m^2 (crucial for Europa/Enceladus)
  primaryAtmosphere: string;
  description: string;
  scientificStatus: "Observed Solar System Body" | "Confirmed Exoplanet" | "Theoretical Analog";
}

export interface SearchForLifeCase {
  id: string;
  codename: string;
  targetWorld: string;
  targetType: string;
  distanceLightYears: number;
  missionType:
    | "Transmission Spectroscopy"
    | "Cryovolcanic Plume Flyby"
    | "In-Situ Rover Raman & Mass Spec"
    | "Radio Technosignature Array"
    | "Direct Imaging Coronagraph";
  dataTelemetry: {
    atmosphericComposition: { molecule: string; percentage: number; note?: string }[];
    surfaceTemperatureK: number;
    surfacePressureAtm: number;
    stellarHost: string;
    stellarActivity: string;
    specialObservation: string;
  };
  hypothesis: string;
  potentialFalsePositives: string[];
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    scientificDebrief: string;
  }[];
}

export const MODULE_23_SUBLESSONS: SubLesson[] = [
  {
    id: "23-1",
    title: "What is Life? The Operational and Thermodynamic Definition",
    durationMinutes: 6,
    content: {
      Beginner: `Life is difficult to define with a single sentence because living organisms are extraordinarily diverse. However, all living things on Earth share fundamental properties: they grow, reproduce, maintain their internal state (homeostasis), respond to their environment, and use energy from their surroundings.

NASA uses a widely cited working definition: "Life is a self-sustaining chemical system capable of Darwinian evolution."

This means living things are not just static crystals or active weather systems. Living organisms store hereditary instructions (like DNA), replicate those instructions with slight variations, and pass them to their offspring. Natural selection then acts on these variations over generations, allowing populations to adapt to changing environments.`,
      Intermediate: `From a physical and thermodynamic perspective, living organisms are localized non-equilibrium structures. According to the Second Law of Thermodynamics, closed systems tend toward maximum entropy (disorder). Life maintains low internal entropy and high molecular order by consuming energy from its environment and expelling entropy as waste heat and disordered molecules.

The three universal pillars of terrestrial life are:
1. Information Storage: Biopolymers (DNA and RNA) that encode structural templates and functional instructions.
2. Catalysis and Metabolism: Molecular engines (enzymes and proteins) that accelerate chemical reactions by factors of millions, driving redox pathways.
3. Compartmentalization: Semi-permeable lipid membranes that separate the living cell's interior chemical milieu from the chaotic external environment, enabling ion gradients (chemiosmosis) that power ATP synthesis.`,
      Advanced: `At the molecular level, abiogenesis research investigates how prebiotic chemistry transitioned into autonomous replicators. The "RNA World" hypothesis posits that early life utilized RNA as both an informational repository (genotype) and a catalytic enzyme (ribozyme/phenotype), resolving the chicken-and-egg paradox of whether proteins or nucleic acids came first.

Furthermore, Mitchell's chemiosmotic hypothesis explains how life universalizes proton-motive force (Δp = Δψ - 59ΔpH). Every known living cell uses membrane-bound ATP synthase enzymes driven by electrochemical proton or sodium gradients across lipid bilayers. This universality suggests that any extraterrestrial life will likely require boundary-enclosed compartments capable of maintaining trans-membrane thermodynamic disequilibrium.`,
    },
  },
  {
    id: "23-2",
    title: "Conditions that Support Life on Earth: The Planetary Cradle",
    durationMinutes: 7,
    content: {
      Beginner: `Earth is often called the "Goldilocks planet" because conditions are just right for life. It is not too close to the Sun (which would boil away all water, like Venus) and not too far (which would freeze all water solid, like Mars).

Earth possesses three crucial protective shields:
1. Liquid Water Oceans: Water covers over 70% of Earth's surface, acting as a global climate stabilizer and the medium in which life first began.
2. A Magnetic Field: Generated deep within Earth's swirling liquid iron outer core, the magnetosphere deflects dangerous high-energy solar wind particles that would otherwise strip away our atmosphere.
3. A Protective Atmosphere: Rich in nitrogen and oxygen with an ozone layer that blocks harmful ultraviolet radiation from reaching the surface.`,
      Intermediate: `Earth's long-term habitability is actively stabilized by planetary geological cycles, most notably the carbonate-silicate cycle (plate tectonics). Over millions of years, atmospheric carbon dioxide dissolves in rainwater, weathers silicate rocks, washes into oceans as carbonates, and is subducted into Earth's mantle, where volcanic activity outgasses it back into the atmosphere.

This geochemical negative feedback loop acts as Earth's natural thermostat:
- If Earth gets too hot, weathering increases, pulling CO2 out of the atmosphere and cooling the planet.
- If Earth freezes (as during "Snowball Earth" glaciations), ice covers the continents, halting weathering while volcanoes continue pumping CO2 into the air until greenhouse warming melts the ice.

Additionally, our large Moon stabilizes Earth's axial tilt (obliquity) near 23.5 degrees, preventing chaotic climate swings.`,
      Advanced: `The geodynamo in Earth's core requires vigorous thermal and compositional convection driven by the crystallization of the solid inner core. Without this magnetic dipole, atmospheric sputtering and hydrodynamic escape would desiccate volatile inventories, as evidenced by Mars, which lost its global dipole ~4.0 Ga when its small core cooled rapidly.

Moreover, the redox history of Earth illustrates that planetary conditions are co-shaped by life. The Great Oxidation Event (~2.4 Ga) triggered by cyanobacterial oxygenic photosynthesis oxidized crustal iron formations, wiped out strict anaerobes, and precipitated the Paleoproterozoic Huronian glaciation by removing atmospheric methane greenhouse gas, fundamentally restructuring the terrestrial biosphere.`,
    },
  },
  {
    id: "23-3",
    title: "Water, Chemistry and Energy: The Biochemical Triad",
    durationMinutes: 8,
    content: {
      Beginner: `Why do astrobiologists always say "follow the water"? Water is the ultimate solvent for life. Because a water molecule is shaped with a positive end and a negative end (it is polar), it dissolves an enormous variety of salts, sugars, and organic chemicals, allowing them to collide and react.

Life also needs building blocks. All life on Earth is carbon-based. Carbon atoms can form four strong bonds at once, allowing them to assemble into complex rings, branching chains, and intricate spirals like DNA.

Finally, life needs an energy source. On Earth's surface, sunlight powers plants through photosynthesis. But deep beneath the ocean where no sunlight reaches, microbes thrive on geothermal heat and chemical nutrients from underwater volcanoes.`,
      Intermediate: `Carbon's chemical superiority over alternatives (such as silicon) stems from fundamental atomic orbital physics:
- Carbon-carbon (C-C) bonds (347 kJ/mol) are nearly equal in strength to carbon-oxygen (C-O) bonds (358 kJ/mol) and carbon-hydrogen (C-H) bonds (413 kJ/mol), allowing dynamic rearrangement, reversible reactions, and stable macromolecular polymers.
- Silicon-silicon (Si-Si) bonds (226 kJ/mol) are far weaker than silicon-oxygen bonds (466 kJ/mol). In an oxygen-rich environment, silicon spontaneously locks into insoluble, crystalline quartz or silicates (SiO2 rock), halting dynamic organic chemistry.
- Carbon dioxide (CO2) is a soluble gas at biological temperatures, enabling gas exchange, whereas silicon dioxide (SiO2) is a solid with a melting point above 1,700°C.

Liquid water provides a wide 100°C liquid range under 1 atm pressure, possesses high dielectric constant (ε ≈ 80), high specific heat capacity, and ice that floats (protecting liquid habitats below).`,
      Advanced: `Thermodynamically, all metabolic pathways exploit oxidation-reduction (redox) reactions. Life extracts Gibbs free energy (ΔG = ΔG° + RT ln Q) by coupling an electron donor (reducing agent) to an electron acceptor (oxidizing agent).

On early Earth and in dark subsurface environments, life relies on lithoautotrophy. Examples include:
- Methanogenesis: CO2 + 4H2 → CH4 + 2H2O (ΔG°' = -131 kJ/mol)
- Sulfate reduction: SO4^(2-) + 4H2 + 2H^+ → H2S + 4H2O
- Iron oxidation: 4Fe^(2+) + O2 + 4H^+ → 4Fe^(3+) + 2H2O

The availability of electron acceptors with high reduction potential (such as O2, E°' = +0.82 V) enables aerobic respiration, yielding 10 to 15 times more ATP per mole of glucose than anaerobic fermentation, which paved the way for complex multicellular organisms on Earth.`,
    },
  },
  {
    id: "23-4",
    title: "Extremophiles: Expanding the Envelope of Habitability",
    durationMinutes: 7,
    content: {
      Beginner: `For decades, scientists believed life could only survive in mild, hospitable temperatures. Then they discovered "extremophiles"—microorganisms that thrive in environments that would instantly kill humans.

Famous examples include:
- Thermophiles: Heat-loving microbes found in Yellowstone's boiling geysers and deep-sea hydrothermal vents at temperatures exceeding 100°C (212°F).
- Psychrophiles: Cold-adapted organisms that grow inside Antarctic glaciers and sea ice at sub-zero temperatures.
- Halophiles: Salt-lovers living in saturated brine pools like the Dead Sea.
- Deinococcus radiodurans: A bacterium nicknamed "Conan the Bacterium" that can withstand thousands of times the lethal human dose of radiation by rapidly repairing its shattered DNA.

These discoveries proved that planetary bodies once dismissed as "dead wastelands" might host microbial life.`,
      Intermediate: `Extremophiles belong mostly to the domain Archaea and specialized Bacteria. They have evolved ingenious molecular adaptations:
1. Hyperthermophiles (e.g., *Methanopyrus kandleri*, surviving up to 122°C): Utilize reverse DNA gyrase to induce positive supercoiling, preventing double-helix denaturation. Their cell membranes feature ether-linked isoprenoid lipid monolayers rather than ester-linked fatty acid bilayers, resisting thermal hydrolysis.
2. Piezophiles/Barophiles (e.g., in the Mariana Trench at >1,000 atm): Possess polyunsaturated fatty acids that preserve membrane fluidity under extreme hydrostatic pressure.
3. Acidophiles (e.g., *Picrophilus oshimae*, thriving at pH 0.06): Maintain a near-neutral intracellular pH (~6.5) via specialized proton pumps and positive inside-membrane surface charges that repel hydronium ions (H3O+).`,
      Advanced: `Endolithic extremophiles inhabit pore spaces inside rocks kilometers beneath the terrestrial continents and deep beneath the oceanic crust (the "deep biosphere"). These subsurface ecosystems obtain energy via radiolysis of water: radiation from radioactive decay of Uranium, Thorium, and Potassium-40 cleaves H2O into H2 and oxidants, fueling sulfate-reducing microorganisms without any link to solar photons.

This finding dramatically alters astrobiological paradigms: subterranean habitats sheltered from harsh planetary surface radiation (such as cosmic rays on Mars, Europa, or wandering rogue planets) can remain biologically viable for billions of years purely through radiolytic and serpentinization-driven lithochemistry.`,
    },
  },
  {
    id: "23-5",
    title: "Mars as a Scientific Target: Rivers in the Past, Brines in the Present",
    durationMinutes: 8,
    content: {
      Beginner: `Mars is today a frigid, hyper-arid desert with a very thin atmosphere composed mostly of carbon dioxide. Its atmospheric pressure is less than 1% of Earth's, which means liquid water cannot stay on the surface—it immediately boils or freezes.

Yet, orbiters and rovers have gathered undeniable evidence that 3.8 to 4.0 billion years ago (the Noachian period), Mars was warmer and wetter. Ancient Mars possessed:
- Vast river channels and branching tributary networks.
- Ancient lakes and lake deltas, such as the one explored by NASA's Perseverance rover in Jezero Crater.
- Abundant clay minerals (phyllosilicates) that can only form through long-term interaction with liquid water.

Because Mars was once warm and wet around the same time life began on Earth, it is our top candidate for discovering past fossilized microbial life.`,
      Intermediate: `Mars lost its habitability primarily due to its smaller size (~11% of Earth's mass). As its interior cooled:
1. The global magnetic dynamo ceased around 4.1 to 3.9 billion years ago.
2. Without a magnetospheric shield, the energetic solar wind and coronal mass ejections directly stripped away the Martian atmosphere (measured today by NASA's MAVEN orbiter).
3. The loss of greenhouse gas (CO2) dropped surface temperatures and atmospheric pressure below water's triple point (6.11 mbar), locking surviving water into the polar ice caps and subsurface permafrost.

Modern rovers (Curiosity in Gale Crater and Perseverance in Jezero Crater) have detected complex indigenous organic molecules (chlorobenzene, thiophenes, and alkyl chains) preserved in sedimentary mudstones, along with seasonal fluctuations in atmospheric methane.`,
      Advanced: `The search for extant (living) Martian organisms focuses on specialized niches:
- Subsurface Hypersaline Aquifers: Deep permafrost brines with depressed freezing points (eutectic perchlorate solutions) might remain liquid at -70°C.
- Recurring Slope Lineae (RSL): Dark, seasonal flows observed on sun-facing slopes, debated between active granular flows and seasonal deliquescence of hygroscopic salts (e.g., magnesium perchlorate).
- Sample Return Architecture: NASA and ESA's Mars Sample Return campaign aims to return hermetically sealed Jezero crater rock cores to Earth for ultra-high-resolution synchrotron X-ray fluorescence, nano-SIMS isotopic ratios, and electron microscopy to definitively confirm or refute ancient biogenic signatures.`,
    },
  },
  {
    id: "23-6",
    title: "Ocean Worlds: Europa, Enceladus, and Subsurface Seas",
    durationMinutes: 8,
    content: {
      Beginner: `One of the most thrilling discoveries in planetary science is that the best places to look for life in our Solar System are not warm rocky planets, but icy moons of Jupiter and Saturn.

Europa (orbiting Jupiter) has an outer shell of ice 15 to 25 kilometers (10 to 15 miles) thick. Beneath that ice lies a global ocean of liquid water holding more water than all of Earth's oceans combined!

Enceladus (orbiting Saturn) is a tiny moon only 500 kilometers across, yet it shoots giant geysers of water vapor, ice crystals, and organic molecules out of fractures near its south pole directly into space. NASA's Cassini spacecraft flew right through these plumes and tasted what is inside Enceladus's hidden ocean!`,
      Intermediate: `How can liquid oceans exist in the frigid outer Solar System, hundreds of millions of miles from the Sun?
The answer is tidal heating:
- Europa is locked in an orbital resonance (Laplace resonance) with Io and Ganymede (for every 1 orbit of Ganymede, Europa orbits 2 times, and Io orbits 4 times). This keeps its orbit slightly eccentric.
- As Europa orbits massive Jupiter, gravitational tidal forces continuously stretch and flex its rocky and icy interior, generating immense friction and internal heat that keeps its ocean liquid.

Similarly, Enceladus is kept active by an orbital resonance with Dione. Gravitational flexing warms its silicate core, generating hydrothermal activity at the seafloor.`,
      Advanced: `In-situ measurements by Cassini's Ion and Neutral Mass Spectrometer (INMS) and Cosmic Dust Analyzer (CDA) revealed that Enceladus's plumes contain:
- H2O vapor, molecular nitrogen (N2), carbon dioxide (CO2), and methane (CH4).
- Native molecular hydrogen (H2) at concentrations of 0.4% to 1.4%, a smoking gun for active serpentinization (iron-magnesium rock reacting with water at >100°C: 6[(Mg,Fe)2SiO4] + 7H2O → 3[(Mg,Fe)3Si2O5(OH)4] + Fe3O4 + H2).
- Native phosphorus in the form of orthophosphate ions (PO4^(3-)), completing the detection of all six primary CHNOPS bio-elements in Enceladus's ocean.

Europa Clipper (launched 2024) is carrying ice-penetrating radar (REASON), high-resolution imaging, and mass spectrometers to determine Europa's ice shell thickness, ocean salinity, and search for active plumes.`,
    },
  },
  {
    id: "23-7",
    title: "Exoplanet Habitability: The Circumstellar Habitable Zone",
    durationMinutes: 7,
    content: {
      Beginner: `Astronomers have discovered thousands of exoplanets—planets orbiting other stars. To determine if an exoplanet might support life, scientists calculate whether it orbits in the "Circumstellar Habitable Zone" (also known as the Habitable Zone or Goldilocks Zone).

This is the region around a star where the temperature allows liquid water to exist on a rocky planet's surface:
- If a planet is too close, intense stellar heat triggers a "runaway greenhouse effect" where oceans boil away.
- If a planet is too far, all water freezes into an ice desert.

The location of this zone depends on the host star. Big, hot stars have habitable zones far out, while small, cool red dwarf stars have habitable zones located very close to the star.`,
      Intermediate: `The boundaries of the Habitable Zone are quantified using 1D and 3D radiative-convective planetary climate models (notably the Kasting and Kopparapu models):
1. Inner Edge (Runaway Greenhouse Limit): Solar insolation vaporizes the oceans; water vapor enters the stratosphere, where stellar UV radiation dissociates H2O into H and OH, and hydrogen escapes to space (desiccating the planet, like Venus). Around our Sun, this is ~0.95 to 0.99 AU.
2. Outer Edge (Maximum Greenhouse Limit): Beyond ~1.67 AU, adding more CO2 to the atmosphere no longer warms the surface because Rayleigh scattering of incoming sunlight by dense CO2 outweighs its greenhouse infrared absorption, leading to irreversible global glaciation.

Planetary mass also matters: worlds smaller than ~0.5 Earth masses lack sufficient gravity to retain dense atmospheres over billions of years.`,
      Advanced: `M-dwarf (red dwarf) stars represent ~75% of all stellar systems in the Milky Way, making them frequent targets for transit spectroscopy (e.g., the TRAPPIST-1 system). However, M-dwarf habitable zones pose severe challenges:
- Tidal Locking: Because the habitable zone is extremely close to the star (0.01 to 0.2 AU), tidal dissipation quickly synchronizes planetary rotation with its orbital period. One hemisphere faces permanent searing daylight, while the other faces permanent cryogenic night.
- Stellar Flares and Coronal Mass Ejections: Young M-dwarfs exhibit intense magnetic reconnection events and high X-ray/extreme-UV (XUV) flux for 1 to 2 billion years, which can strip an Earth-like atmosphere and desiccate surface water inventories before the star stabilizes.
- K-dwarf "Orange Dwarfs": Increasingly regarded as optimal candidates; they live for 20 to 70 billion years, emit significantly lower XUV flare activity than M-dwarfs, and have habitable zones far enough out to avoid rapid tidal locking.`,
    },
  },
  {
    id: "23-8",
    title: "Biosignatures: Chemical Disequilibrium and False Positives",
    durationMinutes: 8,
    content: {
      Beginner: `Because we cannot easily travel light-years to scoop up soil from exoplanets, we search for "biosignatures"—observable clues that life has altered a planet's atmosphere or surface.

The most famous biosignature on Earth is our atmosphere. Oxygen (O2) makes up 21% of Earth's air. Oxygen is very reactive; if all plants and photosynthetic algae died tomorrow, oxygen would react with rocks and disappear within a few million years. Its constant presence is direct proof of living organisms.

Another clue is the "vegetation red edge." Plants absorb red and blue light to perform photosynthesis, but strongly reflect infrared light. If we look at Earth from deep space, this infrared reflection is visible in the spectrum.`,
      Intermediate: `Astrobiologists do not look for a single gas; they look for chemical disequilibrium. On Earth, oxygen (O2) and methane (CH4) coexist in huge quantities, even though they react with each other in sunlight to form CO2 and water. Their simultaneous presence requires an active, continuous biological source producing both gases at rates millions of times faster than inorganic processes.

However, astrobiologists are extremely cautious about false positives:
- Abiotic Oxygen: If a planet undergoes hydrodynamic water escape, hydrogen escapes into space while heavy oxygen atoms remain behind, creating a dense, purely abiotic O2 atmosphere around a sterile world.
- Abiotic Methane: Serpentinization and Fischer-Tropsch-type reactions in hydrothermal systems produce methane without any biological presence.
Therefore, a true biosignature requires measuring multiple gases (O2, O3, CH4, CO2, H2O) simultaneously and assessing the host star's UV spectrum.`,
      Advanced: `The search for biosignatures using transmission and emission spectroscopy with telescopes like JWST and the upcoming Habitable Worlds Observatory (HWO) relies on radiative transfer modeling across infrared and optical wavelengths.

Key diagnostic markers include:
1. Ozone (O3) at 9.6 μm: Highly sensitive proxy for trace molecular oxygen (detectable even at 0.5% present atmospheric levels).
2. Carbon Monoxide (CO) Scarcity: In an oxygen-methane atmosphere, biological consumption (by acetogens and methanogens) rapidly cleanses atmospheric CO. Finding high CO alongside methane suggests abiotic photochemical production, whereas vanishingly low CO supports biological origin.
3. Technosignatures: Unnatural atmospheric pollutants such as chlorofluorocarbons (CFC-11 and CFC-12) with narrow absorption bands at 8-12 μm, or nitrogen dioxide (NO2) plumes characteristic of industrial energy production.`,
    },
  },
  {
    id: "23-9",
    title: "SETI & Technosignatures: Listening to the Cosmos",
    durationMinutes: 7,
    content: {
      Beginner: `While most astrobiology focuses on microscopic single-celled life, SETI (the Search for Extraterrestrial Intelligence) searches for evidence of advanced technological civilizations.

How do scientists search?
1. Radio Telescopes: Scanning millions of radio frequencies for narrowband signals (signals focused on a single sharp frequency, like human radio broadcasts), which nature almost never produces.
2. Optical SETI: Using high-speed detectors to search for ultrashort (nanosecond) laser pulses that an alien civilization might use for interstellar communication.
3. Technosignatures: Searching for massive engineering projects, such as Dyson spheres (swarms of solar collectors built around a star to harness its entire energy output).`,
      Intermediate: `The framework for thinking about intelligent life was formulated in 1961 by astronomer Frank Drake. The Drake Equation calculates the number of active, communicative civilizations in our galaxy:
N = R* · f_p · n_e · f_l · f_i · f_c · L

Where:
- R*: Rate of star formation in our galaxy (~1 to 2 stars/year).
- f_p: Fraction of stars with planets (now proven to be ~1, nearly every star has planets!).
- n_e: Average number of habitable planets per star system (~0.2 to 0.5).
- f_l: Fraction of habitable planets where life actually arises.
- f_i: Fraction of life-bearing worlds where intelligent life evolves.
- f_c: Fraction of intelligent civilizations that develop electromagnetic communication.
- L: The average lifespan of a communicative civilization (in years).

The first three terms are now well constrained by modern astrophysics. The remaining biological and sociological terms remain completely unknown.`,
      Advanced: `The apparent contradiction between high probabilistic estimates of alien civilizations and our complete lack of observations is the Fermi Paradox: "Where is everybody?"

Hypothesized resolutions include:
1. The Great Filter: An evolutionary or developmental barrier that is virtually impossible to cross. The filter could be behind us (abiogenesis is extraordinarily rare, or the jump to eukaryotes took 2 billion years) or ahead of us (civilizations invariably destroy themselves via technological catastrophes).
2. The Rare Earth Hypothesis: While microbial life might be common, complex multicellular intelligence requires a precise convergence of rare factors (plate tectonics, large stabilizing moon, just-right metallicity, Jupiter shield).
3. Technosignature Search Limits: Despite decades of effort, humanity has searched only a cosmic "hot tub" fraction of the multidimensional search parameter space (frequency, polarization, sky coordinates, signal modulation, power threshold). Project Breakthrough Listen has expanded this effort dramatically using the Green Bank, Parkes, and MeerKAT radio arrays.`,
    },
  },
  {
    id: "23-10",
    title: "What Scientists Have and Have NOT Discovered: The Evidence Boundary",
    durationMinutes: 6,
    content: {
      Beginner: `In science, separating what we know from what we hope or imagine is essential. Here is the strict, verified scientific boundary of astrobiology today:

WHAT WE HAVE DISCOVERED:
- Thousands of exoplanets, including rocky worlds in their stars' habitable zones.
- Organic molecules (carbon compounds) throughout the universe: in interstellar gas clouds, in comets, in meteorites, and in Martian soil.
- Subsurface liquid water oceans on icy moons like Europa and Enceladus.
- Extremophiles living in boiling water, acid, and radiation on Earth.

WHAT WE HAVE NOT DISCOVERED:
- We have NOT discovered any confirmed alien organism—not even a single microbe.
- We have NOT detected any alien radio signal, transmission, or technosignature.
- We have NOT found any proof of alien visitation.

Evidence of habitability is not evidence of life. Just because a house is comfortable does not prove someone lives inside.`,
      Intermediate: `History is filled with premature claims of extraterrestrial life that were subsequently explained by abiotic physical mechanisms:
1. The Martian "Canals" (late 1800s): Optical illusions created by human visual pattern completion (pareidolia) viewing low-resolution telescopic images.
2. The Allan Hills 84001 Meteorite (1996): Carbonate globules and microscopic magnetite crystal chains inside an Antarctic Martian meteorite were initially claimed to be nanobacteria fossils. Subsequent research proved that thermal decomposition of siderite during impact shock produces identical magnetite crystals purely abiotically.
3. The Phosphine on Venus Claim (2020): Initial detection of PH3 in Venus's clouds at 20 ppb was suggested as an anaerobic biosignature. Reanalysis showed spectral overlap with sulfur dioxide (SO2) and calibration noise, failing statistical significance tests.
4. The "Wow! Signal" (1977) and "BLC-1" (2020): Narrowband candidate radio signals that turned out to be terrestrial radio frequency interference (RFI) from local ground equipment or satellites.`,
      Advanced: `To avoid confirmation bias, the astrobiology community established the "Confidence of Life Detection" (CoLD) scale, a seven-step progressive framework:
- Step 1: Detect a signal or anomaly.
- Step 2: Rule out contamination and instrumental artifacts.
- Step 3: Demonstrate that the environmental context could produce or sustain the signal.
- Step 4: Rule out all known abiotic, geochemical, and photochemical pathways.
- Step 5: Detect an independent, compatible second biosignature signal.
- Step 6: Formulate and test alternative non-biological hypotheses.
- Step 7: Independent replication and confirmation by separate observatories and scientific teams.

Until an observation satisfies all seven steps of the CoLD scale, scientists must maintain rigorous scientific skepticism and never declare the discovery of extraterrestrial life based on ambiguous single-instrument measurements.`,
    },
  },
];

export const PLANET_PRESETS: PlanetPreset[] = [
  {
    id: "earth",
    name: "Earth (Modern Biosphere)",
    type: "Terrestrial Ocean World",
    starType: "G",
    orbitalDistanceAU: 1.0,
    planetRadiusEarth: 1.0,
    planetMassEarth: 1.0,
    surfacePressureAtm: 1.0,
    albedo: 0.3,
    greenhouseGasFraction: 0.15,
    waterFraction: 0.71,
    tidalHeatingWatts: 0.08,
    primaryAtmosphere: "78% N2, 21% O2, 0.9% Ar, 0.04% CO2",
    description:
      "Our home planet: balanced atmospheric greenhouse warming, stable liquid oceans, global magnetic geodynamo, and extensive biological oxygenic photosynthesis.",
    scientificStatus: "Observed Solar System Body",
  },
  {
    id: "mars",
    name: "Mars (Present Day)",
    type: "Cold Desert Terrestrial",
    starType: "G",
    orbitalDistanceAU: 1.52,
    planetRadiusEarth: 0.532,
    planetMassEarth: 0.107,
    surfacePressureAtm: 0.006,
    albedo: 0.25,
    greenhouseGasFraction: 0.05,
    waterFraction: 0.02,
    tidalHeatingWatts: 0.02,
    primaryAtmosphere: "95.3% CO2, 2.6% N2, 1.9% Ar",
    description:
      "Frigid hyper-arid world. Surface pressure is below water's triple point; water exists only as polar ice, permafrost, or transient subsurface brines.",
    scientificStatus: "Observed Solar System Body",
  },
  {
    id: "europa",
    name: "Europa (Jovian Ocean Moon)",
    type: "Subsurface Ocean Moon",
    starType: "G",
    orbitalDistanceAU: 5.2,
    planetRadiusEarth: 0.245,
    planetMassEarth: 0.008,
    surfacePressureAtm: 1e-11,
    albedo: 0.67,
    greenhouseGasFraction: 0.0,
    waterFraction: 0.95,
    tidalHeatingWatts: 0.15,
    primaryAtmosphere: "Trace O2 (exosphere from radiolysis)",
    description:
      "Tidally flexed by Jupiter and orbital resonances with Io and Ganymede. Beneath a 15-25 km ice crust lies a global 100-km-deep liquid water mantle in contact with a rocky seabed.",
    scientificStatus: "Observed Solar System Body",
  },
  {
    id: "enceladus",
    name: "Enceladus (Saturnian Cryo-Moon)",
    type: "Subsurface Ocean Moon",
    starType: "G",
    orbitalDistanceAU: 9.58,
    planetRadiusEarth: 0.04,
    planetMassEarth: 0.00018,
    surfacePressureAtm: 1e-12,
    albedo: 0.99,
    greenhouseGasFraction: 0.0,
    waterFraction: 0.98,
    tidalHeatingWatts: 0.25,
    primaryAtmosphere: "Trace plume vapor (H2O, CO2, CH4, H2)",
    description:
      "Tidal dissipation drives active hydrothermal activity. Cryovolcanic geysers erupt from south polar 'tiger stripes', venting water vapor, molecular hydrogen, and organic macromolecules directly into space.",
    scientificStatus: "Observed Solar System Body",
  },
  {
    id: "trappist-1e",
    name: "TRAPPIST-1e (M-Dwarf Habitable Planet)",
    type: "Temperate Rocky Exoplanet",
    starType: "M",
    orbitalDistanceAU: 0.029,
    planetRadiusEarth: 0.92,
    planetMassEarth: 0.69,
    surfacePressureAtm: 1.2,
    albedo: 0.28,
    greenhouseGasFraction: 0.25,
    waterFraction: 0.65,
    tidalHeatingWatts: 0.1,
    primaryAtmosphere: "Hypothesized secondary N2-CO2 atmosphere",
    description:
      "One of seven Earth-sized worlds orbiting an ultra-cool red dwarf. Close orbit causes tidal locking, but atmospheric/ocean circulation may maintain temperate surface conditions.",
    scientificStatus: "Confirmed Exoplanet",
  },
  {
    id: "super-earth-waterworld",
    name: "Oceanus Prime (K-Dwarf Water World)",
    type: "Super-Earth Hycean World",
    starType: "K",
    orbitalDistanceAU: 0.75,
    planetRadiusEarth: 1.55,
    planetMassEarth: 3.2,
    surfacePressureAtm: 3.5,
    albedo: 0.35,
    greenhouseGasFraction: 0.3,
    waterFraction: 0.99,
    tidalHeatingWatts: 0.05,
    primaryAtmosphere: "Dense H2O/CO2/N2 greenhouse blanket",
    description:
      "Deep global ocean hundreds of kilometers deep overlaying high-pressure exotic ice polymorphs (Ice VII/X). Lacks subaerial continents, posing questions about nutrient recycling.",
    scientificStatus: "Theoretical Analog",
  },
  {
    id: "venus-analog",
    name: "Cytherean Hellscape (Runaway Greenhouse)",
    type: "Post-Runaway Greenhouse World",
    starType: "G",
    orbitalDistanceAU: 0.72,
    planetRadiusEarth: 0.95,
    planetMassEarth: 0.815,
    surfacePressureAtm: 92.0,
    albedo: 0.77,
    greenhouseGasFraction: 0.95,
    waterFraction: 0.0,
    tidalHeatingWatts: 0.01,
    primaryAtmosphere: "96.5% CO2, 3.5% N2, SO2 clouds",
    description:
      "Massive runaway greenhouse caused total ocean evaporation and hydrodynamic hydrogen loss. Surface temperature is 737 K (464°C), hot enough to melt lead.",
    scientificStatus: "Theoretical Analog",
  },
];

export const SEARCH_FOR_LIFE_CASES: SearchForLifeCase[] = [
  {
    id: "case-1",
    codename: "ANOMALY-ALPHA-7",
    targetWorld: "Gliese 667Cc Analogue",
    targetType: "Rocky Super-Earth (1.4 R_earth)",
    distanceLightYears: 23.6,
    missionType: "Transmission Spectroscopy",
    dataTelemetry: {
      atmosphericComposition: [
        { molecule: "Methane (CH4)", percentage: 1.8, note: "Strong absorption at 3.3 μm" },
        { molecule: "Carbon Dioxide (CO2)", percentage: 88.0 },
        { molecule: "Nitrogen (N2)", percentage: 9.8 },
        { molecule: "Water Vapor (H2O)", percentage: 0.4 },
        { molecule: "Molecular Oxygen (O2)", percentage: 0.001, note: "Below detection threshold" },
      ],
      surfaceTemperatureK: 288,
      surfacePressureAtm: 2.2,
      stellarHost: "M1.5V Red Dwarf (Active Flares)",
      stellarActivity: "Frequent stellar coronal mass ejections; high UV flux",
      specialObservation: "Abundant atmospheric methane without detectable oxygen or ozone.",
    },
    hypothesis: "Can abundant atmospheric methane alone prove biological methanogenesis?",
    potentialFalsePositives: [
      "Serpentinization: Olivine hydration producing H2 which reduces CO2 into CH4",
      "Impact delivery of organics from carbonaceous asteroids",
      "Magmatic volcanic outgassing under highly reducing mantle conditions",
    ],
    options: [
      {
        id: "opt-1",
        label:
          "Declare confirmed microbial life: Methane is a biological gas produced by cows and methanogens.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Methane without oxygen is frequently produced by abiotic serpentinization (water reacting with ultramafic rocks) or volcanic outgassing. Without chemical disequilibrium (such as simultaneous O2/O3 and CH4), methane is not a definitive biosignature.",
      },
      {
        id: "opt-2",
        label:
          "Classify as Unconfirmed: Prioritize for UV photochemistry modeling and isotopic 12C/13C fractionation search.",
        isCorrect: true,
        scientificDebrief:
          "CORRECT! In the absence of atmospheric oxygen or ozone, methane can easily arise abiotically via serpentinization. Rigorous science demands modeling stellar UV destruction rates and searching for isotopic carbon fractionation before drawing biological conclusions.",
      },
      {
        id: "opt-3",
        label: "Dismiss as impossible: M-dwarfs cannot have planets with methane atmospheres.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. M-dwarf planets can certainly maintain methane-rich atmospheres, especially with reducing volcanic outgassing or high volatile delivery.",
      },
    ],
  },
  {
    id: "case-2",
    codename: "BIOSIG-EQUILIBRIUM-PRIME",
    targetWorld: "K-Dwarf Habitable Candidate 'Aurelia'",
    targetType: "Earth-Sized Terrestrial (1.05 R_earth, 1.1 M_earth)",
    distanceLightYears: 38.2,
    missionType: "Direct Imaging Coronagraph",
    dataTelemetry: {
      atmosphericComposition: [
        { molecule: "Nitrogen (N2)", percentage: 76.5 },
        {
          molecule: "Molecular Oxygen (O2)",
          percentage: 19.8,
          note: "Strong 0.76 μm A-band absorption",
        },
        { molecule: "Ozone (O3)", percentage: 0.0004, note: "Deep 9.6 μm absorption feature" },
        { molecule: "Methane (CH4)", percentage: 0.02, note: "Steady absorption at 2.3 μm" },
        {
          molecule: "Carbon Monoxide (CO)",
          percentage: 0.00001,
          note: "Remarkably depleted / undetectable",
        },
        { molecule: "Water Vapor (H2O)", percentage: 1.2 },
      ],
      surfaceTemperatureK: 291,
      surfacePressureAtm: 1.08,
      stellarHost: "K2V Orange Dwarf (Low Flare Activity)",
      stellarActivity: "Quiet star; low X-ray flux; stable for >15 billion years",
      specialObservation:
        "Co-existence of O2, O3, and CH4 in severe thermodynamic disequilibrium with depleted CO.",
    },
    hypothesis:
      "Is the simultaneous coexistence of high oxygen and methane in a quiet star system robust evidence?",
    potentialFalsePositives: [
      "Photolysis of H2O followed by rapid hydrogen escape (ruled out by high H2O and low CO)",
      "Abiotic CO2 photolysis (ruled out by absence of excess CO)",
    ],
    options: [
      {
        id: "opt-1",
        label:
          "Flag as strong Candidate Biosignature: The chemical disequilibrium of O2 + CH4 with depleted CO matches biological maintenance.",
        isCorrect: true,
        scientificDebrief:
          "CORRECT! O2 and CH4 spontaneously combust/oxidize into CO2 and H2O. Having both present in significant quantities around a quiet K-dwarf—combined with depleted CO (which biology rapidly metabolizes)—is the classic gold standard of atmospheric chemical disequilibrium.",
      },
      {
        id: "opt-2",
        label:
          "Dismiss as sensor malfunction: Oxygen and methane cannot chemically coexist in an atmosphere.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Oxygen and methane do coexist right now on Earth because living organisms continuously pump both into the atmosphere faster than they react!",
      },
      {
        id: "opt-3",
        label:
          "Declare intelligent civilization detected: Only technological machines produce ozone.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Ozone (O3) is produced naturally when UV light strikes oxygen (O2) in the stratosphere (the Chapman mechanism). It indicates photosynthetic life or oxygen photochemistry, not technology.",
      },
    ],
  },
  {
    id: "case-3",
    codename: "CRYOPLUME-ENIGMA",
    targetWorld: "Outer Moons Cryovolcanic Plume 'Boreas'",
    targetType: "Icy Moon orbiting a Ringed Gas Giant",
    distanceLightYears: 0.00014, // In Solar System
    missionType: "Cryovolcanic Plume Flyby",
    dataTelemetry: {
      atmosphericComposition: [
        { molecule: "Water Vapor (H2O)", percentage: 95.0 },
        { molecule: "Molecular Hydrogen (H2)", percentage: 1.5, note: "Native dissolved gas" },
        { molecule: "Carbon Dioxide (CO2)", percentage: 2.1 },
        { molecule: "Methane (CH4)", percentage: 0.9 },
        {
          molecule: "Complex Organic Macromolecules",
          percentage: 0.5,
          note: "Mass > 200 amu (aromatic rings)",
        },
      ],
      surfaceTemperatureK: 75,
      surfacePressureAtm: 1e-12,
      stellarHost: "G2V Sun (5.2 AU)",
      stellarActivity: "Shielded by gas giant magnetosphere",
      specialObservation:
        "High concentration of native H2 alongside CO2 and silica nanoparticles (indicating >90°C hydrothermal vents).",
    },
    hypothesis: "Does this plume telemetry provide evidence of habitability, life, or both?",
    potentialFalsePositives: [
      "Abiotic Fischer-Tropsch catalysis producing methane",
      "Serpentinization without biological exploitation",
    ],
    options: [
      {
        id: "opt-1",
        label:
          "Evidence of Habitability and Chemical Energy, but NOT confirmed life: Proves a warm, active hydrothermal system.",
        isCorrect: true,
        scientificDebrief:
          "CORRECT! Native H2 and CO2 provide a powerful chemical redox gradient (methanogenesis fuel), and silica nanoparticles confirm hydrothermal vents at the seafloor. This establishes habitability and metabolic energy, but does NOT prove living organisms exist.",
      },
      {
        id: "opt-2",
        label:
          "Definitive proof of alien fish: Water plus organics always means complex marine life.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Complex organic molecules are abundant throughout lifeless space (in carbonaceous meteorites and interstellar clouds). Finding organic molecules is chemistry, not biology.",
      },
      {
        id: "opt-3",
        label:
          "Sterile wasteland: At 75 Kelvin surface temperature, biology is physically impossible.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. While the icy surface is indeed 75 Kelvin, the subsurface ocean beneath the ice is liquid water (>273 K) heated by tidal dissipation and hydrothermal vents.",
      },
    ],
  },
  {
    id: "case-4",
    codename: "SIGNAL-CANDIDATE-982",
    targetWorld: "Proxima Centauri System",
    targetType: "Nearby Red Dwarf System",
    distanceLightYears: 4.24,
    missionType: "Radio Technosignature Array",
    dataTelemetry: {
      atmosphericComposition: [{ molecule: "Unknown exoplanet atmosphere", percentage: 100 }],
      surfaceTemperatureK: 240,
      surfacePressureAtm: 1.0,
      stellarHost: "M5.5V Red Dwarf",
      stellarActivity: "Superflare star",
      specialObservation:
        "Narrowband radio signal at 982.002 MHz detected during 30 hours of observation. Signal drifts in frequency at ~-0.02 Hz/s.",
    },
    hypothesis: "Could this drifting narrowband signal be an alien technosignature (BLC-1 analog)?",
    potentialFalsePositives: [
      "Local Terrestrial Radio Frequency Interference (RFI) from cell towers or electronics",
      "Intermodulation products from multiple local oscillator frequencies",
      "Orbiting human satellite transmission",
    ],
    options: [
      {
        id: "opt-1",
        label:
          "Announce contact with extraterrestrial intelligence: Natural sources cannot produce narrowband radio signals.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. While natural astrophysical sources don't produce narrow signals, human electronic equipment produces billions of them! The real BLC-1 candidate at 982 MHz turned out to be intermodulation products from human terrestrial radio frequency interference.",
      },
      {
        id: "opt-2",
        label:
          "Classify as Terrestrial RFI candidate: Rigorously verify off-target pointings, local clock intermodulation, and satellite databases.",
        isCorrect: true,
        scientificDebrief:
          "CORRECT! In the Breakthrough Listen project, BLC-1 was tracked for months. Deep forensic analysis proved it was terrestrial interference from clock oscillators on Earth whose harmonics mimicked the telescope's tracking drift. Verification protocol is crucial.",
      },
      {
        id: "opt-3",
        label: "Assume it is a pulsar: Pulsars routinely emit sharp 982 MHz monotone frequencies.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Pulsars are broadband emitters (spanning broad spectrums with regular pulse periods), not continuous monochromatic narrowband signals.",
      },
    ],
  },
  {
    id: "case-5",
    codename: "VENUSIAN-PHOSPHINE-PUZZLE",
    targetWorld: "Cloud Deck of Terrestrial Planet 'Vespera'",
    targetType: "Runaway Greenhouse Planet with Sulfuric Acid Clouds",
    distanceLightYears: 0.000004,
    missionType: "Submillimeter Radio Spectroscopy",
    dataTelemetry: {
      atmosphericComposition: [
        { molecule: "Carbon Dioxide (CO2)", percentage: 96.0 },
        { molecule: "Sulfur Dioxide (SO2)", percentage: 0.015 },
        { molecule: "Water Vapor (H2O)", percentage: 0.002 },
        {
          molecule: "Candidate Phosphine (PH3)",
          percentage: 0.000002,
          note: "Reported ~20 ppb at 266.94 GHz",
        },
      ],
      surfaceTemperatureK: 735,
      surfacePressureAtm: 90.0,
      stellarHost: "G2V Sun",
      stellarActivity: "Solar standard",
      specialObservation:
        "Weak absorption line near 1.12 mm millimeter wavelength; clouds at 55 km altitude have temperate 30°C temperature and 1 atm pressure.",
    },
    hypothesis:
      "Does a 20 ppb phosphine signal in temperate clouds constitute definitive evidence of aerial microbial life?",
    potentialFalsePositives: [
      "Spectral line overlap with Sulfur Dioxide (SO2)",
      "High-order polynomial baseline subtraction artifacts",
      "Deep mantle explosive volcanism outgassing trace phosphides",
    ],
    options: [
      {
        id: "opt-1",
        label:
          "Unverified Anomaly: Demand independent confirmation, check SO2 spectral blending, and evaluate non-biological volcanic phosphide pathways.",
        isCorrect: true,
        scientificDebrief:
          "CORRECT! This reflects the real 2020 Venus phosphine debate. Subsequent re-analyses by independent teams found that the 266.94 GHz line was severely blended with SO2, and polynomial fitting had created artificial peaks. Independent verification is mandatory.",
      },
      {
        id: "opt-2",
        label:
          "Proof of aerial life: Phosphine cannot be formed by any inorganic chemistry under any conditions.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. Phosphine is produced abiotically in massive quantities in the deep, hot hydrogen atmospheres of Jupiter and Saturn, and deep volcanic phosphide minerals can theoretically generate trace phosphine.",
      },
      {
        id: "opt-3",
        label: "Ignore the finding: Clouds at 55 km can never support chemical reactions.",
        isCorrect: false,
        scientificDebrief:
          "INCORRECT. The cloud decks of Venus at 50-60 km altitude are one of the most chemically dynamic regions in the Solar System, possessing Earth-like pressure and temperature, though drenched in concentrated sulfuric acid.",
      },
    ],
  },
];

export const MODULE_23_QUIZ: QuizQuestion[] = [
  {
    id: "q23-1",
    question: "What is NASA's widely adopted operational definition of life?",
    options: [
      "Any entity that breathes oxygen and consumes organic compounds",
      "A self-sustaining chemical system capable of Darwinian evolution",
      "Any molecular system containing water and carbon-based proteins",
      "A thermodynamic structure that creates order without expelling heat",
    ],
    correctAnswer: 1,
    explanation:
      "NASA defines life as 'a self-sustaining chemical system capable of Darwinian evolution.' This captures both the metabolic aspect (self-sustaining) and the informational/adaptive aspect (Darwinian evolution).",
    hint: "Think about the balance between metabolic maintenance and genetic adaptation across generations.",
  },
  {
    id: "q23-2",
    question:
      "Why is liquid water considered the ideal solvent for biochemical reactions compared to liquid methane or nitrogen?",
    options: [
      "Water has zero surface tension and boils at room temperature",
      "Water is non-polar, which prevents cellular membranes from forming",
      "Water is a polar molecule with a wide 100°C liquid range and high dielectric constant that dissolves diverse salts and organics",
      "Water is the only liquid in the universe that can bond with silicon",
    ],
    correctAnswer: 2,
    explanation:
      "Water's polarity, wide liquid temperature range (0°C to 100°C at 1 atm), high dielectric constant, and ability to form extensive hydrogen-bonding networks make it uniquely capable of dissolving metabolites and structuring lipid bilayers.",
    hint: "Water molecules have a distinct positive dipole near the hydrogens and a negative dipole near the oxygen.",
  },
  {
    id: "q23-3",
    question:
      "What mechanism prevents Earth's climate from freezing solid permanently or suffering a runaway greenhouse like Venus over geological timescales?",
    options: [
      "The carbonate-silicate cycle (plate tectonics weathering feedback)",
      "Continuous changes in the Sun's magnetic field",
      "Periodic volcanic eruptions that coat the ice with black dust",
      "The gravitational tug of Jupiter pulling Earth in and out of the habitable zone",
    ],
    correctAnswer: 0,
    explanation:
      "The carbonate-silicate cycle acts as a planetary thermostat: temperature increases speed up silicate weathering, scrubbing CO2 from the air; cooling stops weathering while volcanic outgassing rebuilds greenhouse gases.",
    hint: "It involves rain, rock weathering, ocean sediment deposition, and volcanic outgassing.",
  },
  {
    id: "q23-4",
    question:
      "What keeps the subsurface global oceans of Europa and Enceladus liquid despite being hundreds of millions of kilometers from the Sun?",
    options: [
      "Intense solar radiation penetrating through thin surface ice",
      "Gravitational tidal flexing caused by orbital resonances with neighboring moons and giant host planets",
      "Nuclear fusion reactions occurring inside their silicate mantles",
      "High concentrations of liquid petroleum acting as antifreeze",
    ],
    correctAnswer: 1,
    explanation:
      "Orbital resonances (such as Europa's resonance with Io and Ganymede) keep their orbits eccentric. As they orbit massive gas giants, gravitational tidal forces continuously stretch and squeeze them, dissipating heat internally.",
    hint: "Think about orbital resonance and gravitational stretching friction.",
  },
  {
    id: "q23-5",
    question:
      "Why is the simultaneous detection of both Oxygen (O2) and Methane (CH4) in an exoplanet atmosphere considered a prime candidate biosignature?",
    options: [
      "They react together rapidly, so having both present in high abundance requires an active, continuous source (chemical disequilibrium)",
      "They only form when alien spacecraft burn rocket propellant",
      "They cause the exoplanet to emit bright green laser light into space",
      "They prove that trees and mammals must be physically present",
    ],
    correctAnswer: 0,
    explanation:
      "Oxygen and methane chemically react and destroy one another. Their coexistence in large quantities indicates thermodynamic chemical disequilibrium, requiring rapid, continuous replenishment—a classic hallmark of a biosphere.",
    hint: "Consider what happens when a reducing gas and an oxidizing gas mix in sunlight.",
  },
  {
    id: "q23-6",
    question:
      "What is the crucial scientific distinction between discovering that a world is 'habitable' versus discovering that it is 'inhabited'?",
    options: [
      "Habitable means it has plant life, while inhabited means it has intelligent alien cities",
      "Habitability means environmental conditions could support life; it does not prove that life actually originated or exists there",
      "Habitable applies only to planets orbiting Sun-like G-stars, while inhabited applies to moons",
      "There is no distinction; any habitable planet automatically evolves life within 100 years",
    ],
    correctAnswer: 1,
    explanation:
      "Habitability indicates physical/chemical conditions (liquid water, temperature, energy) where life could survive. However, abiogenesis (the origin of life) is a separate process; a world can be completely habitable yet entirely sterile.",
    hint: "Think of an empty house: it can be habitable, but no one is living in it.",
  },
  {
    id: "q23-7",
    question:
      "Which term in the Frank Drake Equation (N = R* · f_p · n_e · f_l · f_i · f_c · L) has been accurately measured and constrained by modern space telescopes like Kepler?",
    options: [
      "L: The average lifetime of an alien technological civilization",
      "f_i: The fraction of life-bearing worlds where intelligence evolves",
      "f_p and n_e: The fraction of stars with planets and the number of habitable-zone rocky planets per star",
      "f_c: The fraction of civilizations that transmit radio signals",
    ],
    correctAnswer: 2,
    explanation:
      "Exoplanet transit and radial velocity surveys have proven that nearly all stars host planets (f_p ~ 1) and that rocky planets in the habitable zone are common (n_e ~ 0.2 to 0.5). The biological and sociological terms remain completely unknown.",
    hint: "Which terms relate directly to astronomy and planet detection rather than biology or sociology?",
  },
  {
    id: "q23-8",
    question:
      "What is the primary danger of claiming life on Mars or Venus based on a single gas detection, such as the 1996 ALH84001 meteorite or 2020 phosphine report?",
    options: [
      "Space agencies will instantly cancel all future planetary exploration missions",
      "Abiotic geochemical processes or spectral calibration errors can mimic biological signatures (false positives)",
      "Microbes might mutate and escape into Earth's drinking water",
      "The United Nations requires international consensus before any scientific paper is published",
    ],
    correctAnswer: 1,
    explanation:
      "Astrobiology requires extreme caution because nature has numerous non-biological ways to produce gases (serpentinization, volcanism, photochemistry) and instruments can suffer spectral blending or calibration artifacts.",
    hint: "Remember Carl Sagan's maxim: 'Extraordinary claims require extraordinary evidence.'",
  },
];

export const MODULE_23_DISCOVERY_FACTS = [
  {
    id: "fact-1",
    title: "The Murchison Meteorite",
    text: "When the Murchison meteorite fell in Australia in 1969, chemical analysis revealed more than 70 different amino acids, including glycine, alanine, and glutamic acid, proving that fundamental building blocks of proteins assemble spontaneously in deep space.",
    category: "Prebiotic Chemistry",
  },
  {
    id: "fact-2",
    title: "Cassini's Molecular Plume Flyby",
    text: "In 2008 and 2015, NASA's Cassini spacecraft flew at over 30,000 km/h just 25 kilometers above Enceladus's south pole, directly sampling water vapor, molecular hydrogen, and complex organic polymers venting from an alien ocean.",
    category: "Ocean Worlds",
  },
  {
    id: "fact-3",
    title: "Lake Vostok: Sealed for 15 Million Years",
    text: "Subglacial Lake Vostok in Antarctica lies trapped under nearly 4 kilometers of solid ice under 350 atmospheres of pressure in total darkness, yet cores contain viable extremophile bacteria, serving as a direct Earth analogue for Europa's ocean.",
    category: "Extremophiles",
  },
  {
    id: "fact-4",
    title: "10 Billion Habitable Worlds in the Milky Way",
    text: "Based on Kepler and TESS data, astronomers estimate that 20% to 50% of the Milky Way's 100+ billion stars host a rocky planet in their habitable zone—meaning there may be over 10 billion potentially habitable planets in our galaxy alone.",
    category: "Exoplanets",
  },
];

export const MODULE_23_SOURCES: ScientificSource[] = [
  {
    title: "NASA Astrobiology Strategy & Research Roadmap",
    organization: "NASA Science Mission Directorate",
    url: "https://astrobiology.nasa.gov/research/astrobiology-strategy/",
  },
  {
    title: "Cassini-Huygens Mission at Saturn & Enceladus Plume Analysis",
    organization: "NASA / ESA / ASI / JPL",
    url: "https://science.nasa.gov/mission/cassini/",
  },
  {
    title: "Europa Clipper: Exploring Jupiter's Ocean Moon",
    organization: "NASA Jet Propulsion Laboratory",
    url: "https://europa.nasa.gov/",
  },
  {
    title: "The Confidence of Life Detection (CoLD) Scale Framework",
    organization: "Nature / NASA Astrobiology (Green et al., 2021)",
    url: "https://www.nature.com/articles/s41586-021-03804-9",
  },
  {
    title: "Habitable Zones Around Main-Sequence Stars: New Estimates",
    organization: "The Astrophysical Journal (Kopparapu et al., 2013)",
    url: "https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131",
  },
  {
    title: "Breakthrough Listen: Technosignature Search Initiatives",
    organization: "Breakthrough Initiatives & SETI Institute",
    url: "https://breakthroughinitiatives.org/initiative/1",
  },
];
