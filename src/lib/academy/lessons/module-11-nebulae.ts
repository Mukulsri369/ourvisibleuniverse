import type { LessonModule, ScientificSource } from "../types";

export type WavelengthMode = "visible" | "hubble_sho" | "infrared" | "xray";

export interface NebulaBenchmark {
  id: string;
  name: string;
  catalogName: string;
  type:
    | "emission"
    | "reflection"
    | "dark"
    | "planetary"
    | "supernova_remnant"
    | "open_cluster"
    | "globular_cluster";
  typeLabel: string;
  constellation: string;
  distanceLightYears: number;
  sizeLightYears: number;
  ageYears?: string;
  primaryIlluminator: string;
  description: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  wavelengthFeatures: {
    visible: string;
    hubble_sho: string;
    infrared: string;
    xray: string;
  };
  astronomicalFiltersUsed: string[];
  colorsAndProcessingNotice: string;
  dominantElements: string[];
  keyScienceFact: string;
}

export const NEBULA_BENCHMARKS: NebulaBenchmark[] = [
  {
    id: "orion",
    name: "Orion Nebula",
    catalogName: "Messier 42 (M42 / NGC 1976)",
    type: "emission",
    typeLabel: "Diffuse H II Emission Nebula",
    constellation: "Orion (The Hunter)",
    distanceLightYears: 1344,
    sizeLightYears: 24,
    ageYears: "~3 Million Years",
    primaryIlluminator: "Trapezium Cluster (θ1 Orionis C — hot O7V star)",
    description: {
      junior:
        "A famous glowing cloud in Orion's sword where hundreds of baby stars are being born right now!",
      explorer:
        "A massive stellar nursery where ultraviolet light from massive young stars ionizes hydrogen gas, creating a brilliant cosmic glow.",
      astronomer:
        "A classic blister-type H II region on the face of the Orion Molecular Cloud Complex (OMC-1), driven by photo-evaporating Lyman continuum photons from the Trapezium OB cluster.",
    },
    wavelengthFeatures: {
      visible:
        "Soft greenish-blue tint from doubly ionized oxygen ([O III] 500.7 nm) surrounded by deep crimson hydrogen (H-alpha 656.3 nm).",
      hubble_sho:
        "Hubble palette (SHO): Sulfur-II mapped to Red, Hydrogen-alpha to Green, and Oxygen-III to Blue, showing ionization layers.",
      infrared:
        "JWST/Spitzer reveal hundreds of embedded protostars, brown dwarfs, and protoplanetary disks (proplyds) inside opaque dust.",
      xray: "Chandra pinpoints over 1,000 flaring young magnetic protostars concealed behind the glowing gas veil.",
    },
    astronomicalFiltersUsed: [
      "Hα (656 nm)",
      "[O III] (501 nm)",
      "[S II] (672 nm)",
      "NIRCam F444W (4.4 µm)",
    ],
    colorsAndProcessingNotice:
      "To human eyes through small telescopes, the nebula appears ghostly gray-green because human scotopic (night) vision cannot detect faint red H-alpha light. Long-exposure photographs and filter composites reveal the deep reds and ionization hues.",
    dominantElements: [
      "Hydrogen (73%)",
      "Helium (25%)",
      "Oxygen (0.8%)",
      "Carbon & Nitrogen (0.5%)",
    ],
    keyScienceFact:
      "Astronomers have discovered more than 150 'proplyds' (protoplanetary disks) inside the Orion Nebula—new planetary systems in their earliest infancy!",
  },
  {
    id: "eagle",
    name: "Eagle Nebula (Pillars of Creation)",
    catalogName: "Messier 16 (M16 / NGC 6611)",
    type: "emission",
    typeLabel: "Active Star-Forming H II Nebula",
    constellation: "Serpens (The Serpent)",
    distanceLightYears: 7000,
    sizeLightYears: 70,
    ageYears: "~5.5 Million Years",
    primaryIlluminator: "NGC 6611 Open Cluster (Massive O and B stars)",
    description: {
      junior:
        "Gigantic columns of space dust and gas that look like towering cosmic fingers where baby stars hatch!",
      explorer:
        "Towering gas spires light-years tall being eroded by blistering ultraviolet radiation from nearby newborn monster stars.",
      astronomer:
        "Dense interstellar columns exhibiting photo-evaporation driven by ultraviolet radiation from the NGC 6611 cluster, producing evaporating gaseous globules (EGGs) at column tips.",
    },
    wavelengthFeatures: {
      visible:
        "Silhouetted dark brown pillars against vibrant red and green ionized gas glowing under ionizing ultraviolet flux.",
      hubble_sho:
        "Iconic golden-brown dust pillars contrasting against royal blue oxygen emission and emerald hydrogen glow.",
      infrared:
        "JWST piercing view: dust pillars turn semi-transparent orange and blue, revealing newborn stars embedded within the column tips.",
      xray: "High-energy point sources mark violent magnetic flares from young T Tauri protostars.",
    },
    astronomicalFiltersUsed: [
      "F657N (Hα)",
      "[O III] (F502N)",
      "[S II] (F673N)",
      "JWST F090W/F187N/F470N",
    ],
    colorsAndProcessingNotice:
      "The famous Hubble colors are not what you would see looking out a spaceship window. They are narrow-band emission maps translated into RGB color space to study gas chemistry and ionization temperatures.",
    dominantElements: [
      "Molecular Hydrogen (H2)",
      "Polycyclic Aromatic Hydrocarbons (Dust)",
      "Ionized Sulfur",
      "Oxygen",
    ],
    keyScienceFact:
      "The tallest pillar is roughly 4 to 5 light-years tall—a distance greater than that between our Sun and the nearest star, Proxima Centauri!",
  },
  {
    id: "ring",
    name: "Ring Nebula",
    catalogName: "Messier 57 (M57 / NGC 6720)",
    type: "planetary",
    typeLabel: "Classic Toroidal Planetary Nebula",
    constellation: "Lyra (The Harp)",
    distanceLightYears: 2570,
    sizeLightYears: 1.3,
    ageYears: "~4,000 – 7,000 Years",
    primaryIlluminator: "Central Hot White Dwarf (15.75 mag, T ≈ 125,000 K)",
    description: {
      junior:
        "A colorful cosmic smoke ring puffed out by a dying Sun-like star thousands of years ago.",
      explorer:
        "An expanding bubble of gas expelled by a dying star, ionized into a glowing ring by the scorching central white dwarf.",
      astronomer:
        "Bipolar/toroidal planetary nebula viewed nearly pole-on. Stratified ionization: high-excitation He II / [O III] in central cavity, surrounded by lower excitation [N II] and [S II] in outer rim.",
    },
    wavelengthFeatures: {
      visible:
        "Emerald green center from doubly ionized oxygen ([O III]), surrounded by a ruby outer rim from nitrogen and hydrogen.",
      hubble_sho:
        "Distinct blue interior hole, yellow-green transition ring, and sharp red scalloped outer boundary.",
      infrared:
        "JWST reveals an intricate web of 20,000 dense molecular hydrogen clumps in the ring and concentric halo ripples.",
      xray: "Soft X-ray emissions originate from the blistering 125,000 K central white dwarf core.",
    },
    astronomicalFiltersUsed: [
      "[O III] (500.7 nm)",
      "Hα (656.3 nm)",
      "[N II] (658.4 nm)",
      "JWST NIRCam F212N (H2)",
    ],
    colorsAndProcessingNotice:
      "The vivid colors accurately map temperature stratification: highest energy emissions (blue/cyan) occupy the center near the white dwarf, while cooler gases (red) occupy the outer rim.",
    dominantElements: ["Hydrogen", "Helium", "Oxygen", "Nitrogen", "Molecular Hydrogen (H2)"],
    keyScienceFact:
      "In about 5 billion years, our own Sun will create an expanding planetary nebula very similar to the Ring Nebula!",
  },
  {
    id: "crab",
    name: "Crab Nebula",
    catalogName: "Messier 1 (M1 / NGC 1952)",
    type: "supernova_remnant",
    typeLabel: "Pulsar Wind Supernova Remnant",
    constellation: "Taurus (The Bull)",
    distanceLightYears: 6500,
    sizeLightYears: 11,
    ageYears: "972 Years (Exploded in 1054 AD)",
    primaryIlluminator: "Crab Pulsar (PSR B0531+21 — spins 30.2 times per second)",
    description: {
      junior:
        "The tangled glowing wreckage left behind when a massive star exploded like fireworks in the year 1054!",
      explorer:
        "A supernova remnant powered by a central spinning neutron star that pumps magnetic energy into expanding filamentary debris.",
      astronomer:
        "Plerionic supernova remnant (pulsar wind nebula) expanding at 1,500 km/s. Synchrotron radiation continuum driven by relativistic electrons gyrating along magnetic field lines.",
    },
    wavelengthFeatures: {
      visible:
        "Tangled orange filaments of ionized hydrogen and helium enclosing a ghostly blue-white synchrotron glow.",
      hubble_sho:
        "High-contrast filamentous cage showing chemical abundances from the core of the destroyed 10 M☉ progenitor star.",
      infrared:
        "Spitzer and JWST trace warm synchrotron dust and forbidden line emissions from iron, nickel, and argon.",
      xray: "Chandra reveals a dazzling dynamic ring of X-ray emission and relativistic plasma jets shooting from the spinning pulsar.",
    },
    astronomicalFiltersUsed: [
      "[O III]",
      "Hα",
      "[S II]",
      "Chandra ACIS (0.5–8 keV)",
      "Radio VLA (1.4 GHz)",
    ],
    colorsAndProcessingNotice:
      "Multi-wavelength composites of the Crab combine radio (red), infrared (yellow), visible (green), ultraviolet (blue), and X-rays (purple) to trace completely different physical radiation regimes.",
    dominantElements: ["Helium", "Hydrogen", "Carbon", "Oxygen", "Neon", "Iron (Supernova debris)"],
    keyScienceFact:
      "Chinese and Arab astronomers recorded this supernova in July 1054 AD. It was so bright it could be seen in broad daylight for 23 days!",
  },
  {
    id: "pleiades",
    name: "Pleiades Reflection Nebulosity",
    catalogName: "Messier 45 (M45 / Seven Sisters)",
    type: "reflection",
    typeLabel: "Reflection Nebula & Open Cluster",
    constellation: "Taurus (The Bull)",
    distanceLightYears: 444,
    sizeLightYears: 17,
    ageYears: "~100 Million Years",
    primaryIlluminator: "Young B-type stars (Alcyone, Electra, Maia, Merope)",
    description: {
      junior:
        "A famous cluster of bright blue stars wrapped in a shimmering blue fog of space dust.",
      explorer:
        "A reflection nebula where microscopic dust grains scatter blue starlight from young, hot stars like sunlight through blue sky.",
      astronomer:
        "Rayleigh scattering of light from late B-type main sequence stars by an unrelated interstellar dust cloud that the cluster is currently passing through at ~40 km/s.",
    },
    wavelengthFeatures: {
      visible:
        "Intense sapphire-blue reflection glow surrounding stars; Rayleigh scattering favors shorter (blue) wavelengths (I ∝ λ^-4).",
      hubble_sho:
        "Not suitable for SHO narrowband filters because the gas does not emit its own line photons—it only reflects continuous starlight!",
      infrared:
        "Warm thermal glow of silicate and polycyclic aromatic hydrocarbon (PAH) dust grains heated by starlight.",
      xray: "Hundreds of faint coronal point sources from low-mass cluster members.",
    },
    astronomicalFiltersUsed: ["Johnson B (440 nm)", "Johnson V (550 nm)", "Sloan g' and r'"],
    colorsAndProcessingNotice:
      "The blue color of reflection nebulae is physical and true-to-eye: tiny carbon and silicate dust grains scatter short blue wavelengths far more efficiently than red wavelengths, exactly like Earth's blue sky.",
    dominantElements: [
      "Interstellar Silicate Grains",
      "Graphite Dust",
      "Polycyclic Aromatic Hydrocarbons (PAHs)",
    ],
    keyScienceFact:
      "The stars and the dust nebula are not from the same origin! The Pleiades cluster is merely plowing through an unrelated cold dust cloud by chance.",
  },
  {
    id: "horsehead",
    name: "Horsehead Nebula & Barnard 68",
    catalogName: "Barnard 33 (Horsehead) / Barnard 68",
    type: "dark",
    typeLabel: "Dense Opaque Dark Molecular Cloud",
    constellation: "Orion / Ophiuchus",
    distanceLightYears: 1375,
    sizeLightYears: 3.5,
    ageYears: "~1 Million Years",
    primaryIlluminator: "Backlit by IC 434 (ionized by Sigma Orionis)",
    description: {
      junior:
        "A shadow shaped like a knight chess piece, made of thick space dust that blocks all the light behind it.",
      explorer:
        "A dense, cold dark nebula containing thick dust that absorbs visible light, silhouetted against glowing pink hydrogen gas.",
      astronomer:
        "Dense Bok globule / molecular cloud protrusion with visual extinction A_V > 10 magnitudes, shielding cold molecular gas (T ~ 10 K) where gravity may trigger star collapse.",
    },
    wavelengthFeatures: {
      visible:
        "Pitch black silhouette completely blocking background stars, framed by a soft pink hydrogen emission ribbon (IC 434).",
      hubble_sho:
        "Dramatic high-contrast silhouette against green and red narrowband ionized emission backdrop.",
      infrared:
        "Near and mid-infrared (JWST) pass right through the dust grains! The horsehead appears translucent and ghost-like, revealing background stars.",
      xray: "Completely invisible in X-rays; acts as an absorbing shadow against diffuse X-ray backgrounds.",
    },
    astronomicalFiltersUsed: ["Hα (656 nm)", "JWST NIRCam F115W/F150W", "ALMA 1.3 mm CO lines"],
    colorsAndProcessingNotice:
      "Dark nebulae have no internal color because they emit virtually no visible light. Their appearance is purely defined by extinction (absorption and scattering) of background starlight.",
    dominantElements: [
      "Molecular Hydrogen (H2)",
      "Carbon Monoxide (CO)",
      "Silicate & Ice Dust Mantles",
    ],
    keyScienceFact:
      "Astronomer Williamina Fleming first discovered the Horsehead Nebula in 1888 while analyzing photographic glass plates at Harvard Observatory!",
  },
  {
    id: "m13",
    name: "Great Hercules Globular Cluster",
    catalogName: "Messier 13 (M13 / NGC 6205)",
    type: "globular_cluster",
    typeLabel: "Ancient Spherical Globular Star Cluster",
    constellation: "Hercules",
    distanceLightYears: 22200,
    sizeLightYears: 145,
    ageYears: "11.65 Billion Years",
    primaryIlluminator: "300,000+ Ancient Population II Stars",
    description: {
      junior:
        "A dazzling cosmic snowglobe of hundreds of thousands of ancient stars tightly packed together!",
      explorer:
        "A dense spherical swarm of over 300,000 stars formed near the dawn of the Milky Way, orbiting in our galaxy's outer halo.",
      astronomer:
        "Ancient Population II globular cluster ([Fe/H] = -1.58) bound by mutual self-gravity. Features an old main-sequence turnoff, extended blue horizontal branch, and exotic blue stragglers.",
    },
    wavelengthFeatures: {
      visible:
        "Blazing golden and white core packed with red giants and low-mass stars, with sparse blue stragglers.",
      hubble_sho:
        "Broadband imaging is used rather than narrowband, since star clusters emit thermal blackbody spectra rather than nebulous gas lines.",
      infrared:
        "Reveals the dominant population of low-mass red dwarfs and cool giant atmospheres with minimal dust extinction.",
      xray: "Chandra discovers low-mass X-ray binaries (LMXBs) and millisecond pulsars formed through dense stellar collisions in the core.",
    },
    astronomicalFiltersUsed: [
      "B (440 nm)",
      "V (550 nm)",
      "I (800 nm)",
      "Chandra High Resolution Mirror",
    ],
    colorsAndProcessingNotice:
      "Star cluster colors represent authentic physical star surface temperatures: warm yellow-orange for ancient red giants and white for older main-sequence stars.",
    dominantElements: ["Hydrogen", "Helium", "Low metallicity (Metal-poor Population II)"],
    keyScienceFact:
      "In 1974, humanity beamed the famous 'Arecibo Message' toward M13 using the giant Puerto Rico radio dish, carrying binary code about human DNA and Earth!",
  },
];

export interface StarNurseryParams {
  gasDensityCm3: number; // 10^2 to 10^6
  temperatureKelvin: number; // 5 to 100 K
  cloudMassSolar: number; // 10 to 1,000 M_sun
  cloudRadiusLightYears: number; // 0.5 to 10 ly
}

export function calculateStarNurseryPhysics(params: StarNurseryParams) {
  const { gasDensityCm3, temperatureKelvin, cloudMassSolar } = params;

  // Constants (cgs / astronomical units)
  // Jeans Mass approximation: M_J = 1.0 * (T / 10K)^(1.5) * (n / 10^4 cm^-3)^(-0.5) M_sun
  const normalizedTemp = Math.max(1, temperatureKelvin) / 10;
  const normalizedDensity = Math.max(1, gasDensityCm3) / 10000;
  const jeansMassSolar = 1.0 * Math.pow(normalizedTemp, 1.5) * Math.pow(normalizedDensity, -0.5);

  // Free-fall collapse time: tau_ff ≈ 3.4 x 10^7 / sqrt(n_H2) years
  const freeFallTimeYears = Math.round(34000000 / Math.sqrt(Math.max(1, gasDensityCm3)));

  // Virial Ratio parameter: alpha_vir = 2 * E_thermal / |E_grav| ≈ M_J / M_cloud
  const virialRatio = jeansMassSolar / Math.max(0.1, cloudMassSolar);

  const willCollapse = virialRatio < 1.0;
  const collapseSpeed = willCollapse
    ? virialRatio < 0.2
      ? "Rapid Gravitational Collapse (Runaway)"
      : "Moderate Gravitational Contraction"
    : "Thermal Expansion / Dispersal";

  return {
    jeansMassSolar: parseFloat(jeansMassSolar.toFixed(2)),
    freeFallTimeYears,
    virialRatio: parseFloat(virialRatio.toFixed(3)),
    willCollapse,
    collapseSpeed,
    expectedStars: willCollapse
      ? Math.max(1, Math.round(cloudMassSolar / Math.max(0.1, jeansMassSolar * 0.8)))
      : 0,
  };
}

export interface Module11Sublesson {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  summary: string;
  keyConcepts: {
    junior: string[];
    explorer: string[];
    astronomer: string[];
  };
  content: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  didYouKnow: string;
  signatureHighlight: string;
}

export const MODULE_11_SUBLESSONS: Module11Sublesson[] = [
  {
    id: "sub-01",
    number: 1,
    title: "What is Interstellar Gas and Dust?",
    shortTitle: "Gas & Dust (ISM)",
    summary:
      "The thin material filling the vast gulfs between stars forms the fundamental raw material for future solar systems.",
    keyConcepts: {
      junior: [
        "Space is not completely empty; it has floating gas and tiny specks of cosmic dust",
        "The gas is mostly hydrogen and helium",
        "Stars and planets are born from this floating material",
      ],
      explorer: [
        "The Interstellar Medium (ISM) is 99% gas and 1% microscopic dust by mass",
        "Dust grains are microscopic flakes of carbon, graphite, and silicates",
        "Interstellar dust causes 'extinction' (dimming) and 'reddening' of starlight",
      ],
      astronomer: [
        "ISM thermal phases: Hot Ionized Medium (HIM, 10^6 K), Warm Ionized/Neutral Medium (WIM/WNM, 8,000 K), and Cold Neutral Medium (CNM, 50-100 K)",
        "Extinction law A_V / E(B-V) ≈ 3.1; dust grains absorb short wavelengths and re-radiate in far-infrared",
        "Gas-to-dust ratio is approximately 100:1 by mass in the Milky Way disk.",
      ],
    },
    content: {
      junior:
        "When you look into deep space, it seems totally empty—but it isn't! Floating between the stars are vast, ghostly clouds of hydrogen gas and microscopic specks of cosmic soot called interstellar dust. Every star, planet, rock, and drop of water was once part of this floating space dust!",
      explorer:
        "Between the stars lies the Interstellar Medium (ISM). For every 100 grams of material in the ISM, about 99 grams is gas (mostly hydrogen and helium) and only 1 gram is solid dust. Yet that tiny 1% of dust has an immense effect on astronomy: dust grains act like a smoky fog, absorbing blue starlight and making stars appear dimmer and redder than they actually are.",
      astronomer:
        "The interstellar medium maintains an active multi-phase thermodynamic equilibrium governed by supernovae feedback, stellar winds, and cosmic rays. Interstellar dust grains comprise silicates, polycyclic aromatic hydrocarbons (PAHs), and amorphous carbon coated with water/methane ice mantles in dense molecular cores (T < 20 K). Optical extinction A_V scales inversely with wavelength, making infrared (2–10 µm) the premier window for penetrating dense interstellar columns.",
    },
    didYouKnow:
      "A typical interstellar dust grain is smaller than a single grain of smoke soot—under 1 micrometer across—yet cosmic dust clouds can span hundreds of light-years across space!",
    signatureHighlight:
      "Toggle between the Gas, Dust, and Star layers in the 3D Explorer to see how dust grains trace the backbone of star-forming regions.",
  },
  {
    id: "sub-02",
    number: 2,
    title: "Emission Nebulae: Glowing Stellar Nurseries",
    shortTitle: "Emission Nebulae",
    summary:
      "High-energy ultraviolet photons from newborn hot stars ionize hydrogen gas, causing it to glow with fluorescent light.",
    keyConcepts: {
      junior: [
        "Emission nebulae shine with their own colorful light like neon signs",
        "Hot baby stars make the surrounding gas glow bright red and green",
        "The Orion Nebula is the most famous glowing emission nebula",
      ],
      explorer: [
        "Also known as H II regions (ionized hydrogen clouds)",
        "Ultraviolet radiation strips electrons from hydrogen atoms; when electrons recombine, they emit light",
        "The famous red color comes from the Hydrogen-alpha line at 656.3 nanometers",
      ],
      astronomer: [
        "Strömgren sphere radius R_S = (3 N_Lyc / (4 pi alpha_B n_e^2))^(1/3), bounded by ionization balance",
        "Forbidden transition lines like [O III] (495.9, 500.7 nm) and [N II] (658.4 nm) dominate visible spectra due to low collisional de-excitation in rarefied plasma",
        "H-alpha (3 -> 2 transition at 656.3 nm) serves as the standard tracer for cosmic star formation rates.",
      ],
    },
    content: {
      junior:
        "Emission nebulae are the colorful neon signs of deep space! When giant stars are born, they blast out intense ultraviolet light that excites the surrounding hydrogen gas. The gas soaks up the energy and glows in gorgeous red, pink, and emerald green!",
      explorer:
        "An emission nebula is energized by blazing O- and B-type stars with surface temperatures over 25,000 Kelvin. High-energy UV photons knock electrons off hydrogen atoms in a process called photo-ionization. As free electrons are recaptured, they cascade down energy levels, releasing photons at exact wavelengths: primarily the famous crimson red Hydrogen-alpha (656.3 nm) and turquoise [O III] (500.7 nm).",
      astronomer:
        "In an H II region, the photo-ionization rate from Lyman continuum photons (h nu >= 13.6 eV) precisely balances radiative recombination. Because electron densities are typically low (n_e ~ 10^2 to 10^4 cm^-3), collisionally excited metastable states can decay via magnetic dipole or electric quadrupole transitions. This produces prominent forbidden lines like [O III] 5007 Å, which diagnostic ratios correlate with electron temperature T_e and metallicity.",
    },
    didYouKnow:
      "The famous green color seen in emission nebulae was originally thought to be a new element called 'Nebulium'—until astrophysicists proved in 1927 it was actually doubly ionized oxygen ([O III])!",
    signatureHighlight:
      "Inspect the Orion Nebula in the 3D lab to view the ionizing cavity carved out by the four massive Trapezium stars.",
  },
  {
    id: "sub-03",
    number: 3,
    title: "Reflection Nebulae: Scattered Starlight",
    shortTitle: "Reflection Nebulae",
    summary:
      "Interstellar dust grains scatter and reflect the light of nearby stars, producing a characteristic celestial blue haze.",
    keyConcepts: {
      junior: [
        "Reflection nebulae do not make their own light; they reflect light from nearby stars",
        "They look bright blue for the exact same reason Earth's sky is blue!",
        "The Pleiades star cluster is famous for its glowing blue reflection dust",
      ],
      explorer: [
        "Microscopic silicate and carbon dust grains scatter blue light much better than red light",
        "Known as Rayleigh scattering (scattering intensity is proportional to 1 / wavelength^4)",
        "Unlike emission nebulae, reflection nebulae have continuous spectra identical to their parent stars",
      ],
      astronomer: [
        "Rayleigh and Mie scattering regimes determined by the size parameter x = 2 pi a / lambda",
        "Dust albedo omega ≈ 0.5 to 0.7 in visible bands; forward-scattering phase function g ≈ 0.6",
        "Absence of recombination lines: spectra show stellar absorption lines rather than emission spikes.",
      ],
    },
    content: {
      junior:
        "Reflection nebulae don't produce their own light. Instead, they act like giant cosmic mirrors reflecting the light of nearby stars! Because tiny dust particles bounce blue light in all directions much more easily than red light, reflection nebulae almost always glow a gorgeous sapphire blue—just like Earth's blue sky!",
      explorer:
        "When a cloud of dust is near a star that isn't hot enough to ionize gas into an emission nebula (like a B-type star with T < 20,000 K), the dust simply scatters the star's light. Rayleigh scattering dictates that shorter wavelengths (blue at ~400 nm) scatter roughly ten times more efficiently than longer wavelengths (red at ~700 nm). The resulting cloud exhibits a spectral fingerprint that mirrors the illuminating star.",
      astronomer:
        "Reflection nebulae represent pure scattering phenomena characterized by the dust grain size distribution (MRN power-law dn/da ∝ a^-3.5 for 0.005 µm < a < 0.25 µm). Because the scattering efficiency Q_scat scales steeply with inverse wavelength for particles smaller than the wavelength of light, the scattered light is blue-shifted relative to the illuminating source. Polarization measurements of reflection nebulae reveal grain alignment with interstellar magnetic fields.",
    },
    didYouKnow:
      "The famous blue reflection nebulosity around the Pleiades (Seven Sisters) is not leftover dust from when the stars were born—the cluster is simply traveling through an unrelated cloud by accident!",
    signatureHighlight:
      "Explore the Pleiades model in the 3D viewer to see how sapphire starlight scatters through the wispy dust filaments.",
  },
  {
    id: "sub-04",
    number: 4,
    title: "Dark Nebulae: The Cold Silhouettes of Creation",
    shortTitle: "Dark Nebulae",
    summary:
      "Dense, freezing molecular clouds absorb all background visible light, appearing as silhouettes where new stars coalesce.",
    keyConcepts: {
      junior: [
        "Dark nebulae are so thick with space dust that they block all the stars behind them",
        "They look like black holes or cutouts in the starry sky",
        "The Horsehead Nebula is the most famous dark nebula shape",
      ],
      explorer: [
        "Bok globules are dense pockets of cold molecular gas and dust (temperatures as low as 10 Kelvin)",
        "They block visible light, but infrared telescopes like Webb can see right through them!",
        "Inside these dark shadows, gravity is actively crushing gas to form brand new stars",
      ],
      astronomer: [
        "Visual extinction exceeds 10 to 30 magnitudes (A_V > 10–30 mag), completely extinguishing optical background photons",
        "Gas is predominantly molecular (H2, CO, NH3) shielded from interstellar ultraviolet radiation fields",
        "Infrared transmission follows the reddening law: at 2.2 µm (K-band), extinction is only ~10% of that at optical V-band.",
      ],
    },
    content: {
      junior:
        "Dark nebulae look like giant black holes carved into the starfields! But they aren't empty holes—they are ultra-dense clouds of freezing cold cosmic dust so thick that no light from the stars behind them can shine through. The famous Horsehead Nebula looks like a chess knight standing in deep space!",
      explorer:
        "Early astronomers thought dark nebulae were empty voids in the cosmos. In 1919, astronomer E.E. Barnard cataloged hundreds of them and proved they were actually opaque clouds of molecular gas and dust grains. These 'Bok globules' are the coldest places in the universe (10–20 Kelvin). While optical telescopes only see a black silhouette, infrared telescopes easily pierce the dust to reveal newborn protostars hiding inside.",
      astronomer:
        "Dark clouds maintain temperatures of 8–15 K where thermal pressure is minimal, rendering them prime sites for gravitational Jeans instability. Interstellar dust shields complex organic molecules from photo-dissociation by the interstellar radiation field (ISRF). Extinction profiles measured via background star near-infrared color excess (NICE method) map core density profiles, confirming Bonnor-Ebert sphere hydrostatic equilibrium on the verge of dynamic collapse.",
    },
    didYouKnow:
      "When astronomer William Herschel observed a dark nebula through his telescope in 1785, he famously exclaimed: 'Truly, there is a hole in the heavens!'",
    signatureHighlight:
      "Switch to the Infrared filter on the Horsehead Nebula in the 3D lab to watch the opaque black silhouette turn transparent!",
  },
  {
    id: "sub-05",
    number: 5,
    title: "Planetary Nebulae: The Legacy of Sun-like Stars",
    shortTitle: "Planetary Nebulae",
    summary:
      "Expanding shells of glowing gas ejected by dying low-to-intermediate mass stars as they transition to white dwarfs.",
    keyConcepts: {
      junior: [
        "Planetary nebulae have nothing to do with planets! Early astronomers thought they looked round like Uranus",
        "They are glowing smoke rings blown off by gentle dying stars like our Sun",
        "In the very center sits an Earth-sized white dwarf core",
      ],
      explorer: [
        "When a Sun-like star exhausts its fuel, thermal pulses blow away its outer atmosphere",
        "The remaining hot carbon-oxygen core illuminates the expanding gas bubble for ~20,000 years",
        "The Ring Nebula and Helix Nebula are stunning nearby examples",
      ],
      astronomer: [
        "Interacting Stellar Winds model (ISW): slow AGB wind (~10–20 km/s) is overtaken and compressed by a fast central star wind (~1,000–3,000 km/s)",
        "Photo-ionized by central white dwarf cores with T_eff up to 200,000 K",
        "Rich in s-process nucleosynthesis products (carbon, nitrogen, fluorine, and barium) returned to the interstellar medium.",
      ],
    },
    content: {
      junior:
        "Don't let the name confuse you—planetary nebulae have nothing to do with planets! Over 200 years ago, astronomers looked through small telescopes and saw fuzzy green disks that looked like the planet Uranus, so they called them 'planetary'. In reality, they are glowing gas bubbles puffed off by dying stars like our Sun!",
      explorer:
        "When a star with less than 8 times the Sun's mass reaches the end of its life, it cannot fuse carbon. Instead, violent thermal pulsations blow its outer layers into space at 20 kilometers per second. The exposed central core—now a white dwarf blazing at over 100,000 Kelvin—bombards the expanding gas with ultraviolet light, making it fluoresce like a cosmic jewel for about 20,000 years before dissipating into deep space.",
      astronomer:
        "Planetary nebulae exhibit complex non-spherical morphologies (elliptical, butterfly, bipolar) shaped by binary companion interactions, magnetic fields, and precessing collimated jets. As the central white dwarf cools along its degenerate cooling track, ionizing photon output plummets and the nebular gas disperses into the galactic disk, enriching future generations of stars with forged carbon and oxygen.",
    },
    didYouKnow:
      "Planetary nebulae only last for about 20,000 to 50,000 years—a mere blink of an eye in cosmic time compared to a star's 10-billion-year lifespan!",
    signatureHighlight:
      "Examine the Ring Nebula (M57) in 3D to see the hot white dwarf in the center and the expanding dual-ring ionized bubble.",
  },
  {
    id: "sub-06",
    number: 6,
    title: "Supernova Remnants: Relativistic Shockwaves",
    shortTitle: "Supernova Remnants",
    summary:
      "Violent expanding debris fields created by catastrophic core-collapse explosions of massive stars.",
    keyConcepts: {
      junior: [
        "Supernova remnants are the shattered wreckage of massive exploded stars",
        "The gas shoots outward at thousands of kilometers every single second!",
        "The Crab Nebula was formed by a star that exploded in the year 1054",
      ],
      explorer: [
        "Created when a star with over 8 solar masses suffers iron core collapse",
        "A high-velocity blast wave slams into surrounding gas, heating it to millions of degrees",
        "In the center often sits an ultra-dense, spinning pulsar (neutron star)",
      ],
      astronomer: [
        "Evolution stages: Free expansion -> Sedov-Taylor blast wave -> Radiative cooling -> Dispersal into ISM",
        "Non-thermal synchrotron radiation: relativistic electrons accelerated across magnetic shock fronts emit broadband continuum from radio to X-rays",
        "Primary cosmic engine for r-process nucleosynthesis and cosmic ray acceleration via Diffusive Shock Acceleration (Fermi mechanism).",
      ],
    },
    content: {
      junior:
        "Supernova remnants are the dramatic blast waves of destroyed stars! When a giant star explodes in a supernova, it blasts its outer layers across space at millions of miles per hour. The Crab Nebula in Taurus is the famous tangled wreckage of a star whose explosion was seen on Earth nearly 1,000 years ago!",
      explorer:
        "Unlike the gentle expansion of planetary nebulae, supernova remnants are violent cosmic accelerators. The explosion unleashes 10^51 ergs of energy, driving a supersonic shockwave that sweeps up interstellar material and heats it to millions of degrees. In the Crab Nebula, a central pulsar spins 30 times every second, pumping energetic particles into magnetic fields and lighting up the remnant with eerie synchrotron radiation.",
      astronomer:
        "Supernova remnants (SNRs) drive the mechanical energy budget of the interstellar medium. The expanding shock compresses ambient molecular clouds, frequently triggering new star formation, while distributing heavy alpha elements (O, Ne, Mg, Si, S, Ca, Fe) synthesized during hydrostatic and explosive burning. Particle acceleration at forward shocks accounts for the origin of Galactic cosmic rays up to PeV energies.",
    },
    didYouKnow:
      "In July 1054 AD, the supernova that created the Crab Nebula was so blindingly bright that it could be seen during broad daylight next to the Sun for over three weeks!",
    signatureHighlight:
      "Inspect the multi-wavelength composite of the Crab Nebula to see the central pulsar wind and synchrotron filaments.",
  },
  {
    id: "sub-07",
    number: 7,
    title: "Open Star Clusters: Young Galactic Families",
    shortTitle: "Open Clusters",
    summary:
      "Loose, gravitationally fragile groups of up to a few thousand young stars born together in the Milky Way's spiral disk.",
    keyConcepts: {
      junior: [
        "Open clusters are groups of sister stars born together from the same gas cloud",
        "They are young, bright, and usually have pretty blue stars",
        "The Pleiades (Seven Sisters) and Hyades are famous open clusters in our sky",
      ],
      explorer: [
        "Contain between a few dozen and a few thousand stars bound loosely by gravity",
        "Located in the spiral arms of the Milky Way galaxy disk",
        "Over hundreds of millions of years, galactic gravitational tides gradually pull them apart",
      ],
      astronomer: [
        "Formed in giant molecular cloud complexes with star formation efficiencies of 5–30%",
        "Located strictly in the thin Galactic disk (Population I stars with solar-like metallicity)",
        "Color-Magnitude Diagram (CMD) shows high-mass blue main-sequence turnoff, providing precise cluster age dating.",
      ],
    },
    content: {
      junior:
        "Stars are almost never born alone! They are born in litters of sister stars called 'open clusters'. Because they are all newborn, open clusters are dominated by dazzling, hot blue stars. Over millions of years, they slowly drift apart and travel the galaxy on their own—just like our own Sun did billions of years ago!",
      explorer:
        "Open star clusters typically contain several hundred to a few thousand stars that condensed from the same molecular cloud at the exact same time. Located in the spiral disk of our Milky Way, they are held together only loosely by gravity. As they orbit the galactic center, gravitational tugs from passing gas clouds and galactic tides gradually disrupt the cluster, dispersing its member stars across the Milky Way within a few hundred million years.",
      astronomer:
        "Open clusters provide empirical benchmarks for stellar astrophysics because all member stars share identical ages, distances, and initial chemical compositions ([Fe/H]). The main-sequence turnoff point on the Hertzsprung-Russell diagram directly yields the cluster's chronological age via stellar evolution isochrones. Dynamical mass segregation causes massive stars to sink toward the core while low-mass stars are preferentially stripped into stellar tidal tails.",
    },
    didYouKnow:
      "Our own Sun was born in an open star cluster about 4.6 billion years ago alongside thousands of sibling stars, but our cosmic brothers and sisters drifted apart long ago!",
    signatureHighlight:
      "Compare the loose structure and blue stars of the Pleiades Open Cluster with the dense ancient Globular Cluster in the 3D lab.",
  },
  {
    id: "sub-08",
    number: 8,
    title: "Globular Star Clusters: Ancient Galactic Swarms",
    shortTitle: "Globular Clusters",
    summary:
      "Densely packed spherical swarms of hundreds of thousands of ancient stars orbiting in the Milky Way's outer halo.",
    keyConcepts: {
      junior: [
        "Globular clusters are giant ball-shaped swarms of hundreds of thousands of stars!",
        "They are the oldest objects in the entire galaxy—over 11 billion years old",
        "The Great Hercules Cluster (M13) is packed so tightly that stars look like glittering diamonds",
      ],
      explorer: [
        "Spherical swarms containing 100,000 to over 1,000,000 ancient stars tightly bound by gravity",
        "Orbit in the spherical halo above and below the Milky Way disk",
        "All their massive blue stars died billions of years ago, leaving only long-lived yellow, orange, and red stars",
      ],
      astronomer: [
        "Population II stars with low metallicity ([Fe/H] typically -1.0 to -2.3)",
        "Core stellar densities can exceed 10^4 to 10^5 stars per cubic parsec, leading to dynamical collisions, millisecond pulsars, and 'blue stragglers'",
        "Provide a cosmological lower limit on the age of the Universe (11.5–13.0 Gyr).",
      ],
    },
    content: {
      junior:
        "Imagine looking up at night and seeing thousands of stars blazing so close together that they light up the sky like perpetual twilight! That's what it looks like inside a 'globular cluster'—a massive spherical swarm of over 300,000 ancient stars packed tightly together like a glittering snowglobe!",
      explorer:
        "Globular clusters are cosmic fossils from the dawn of our galaxy. Formed over 11 billion years ago, they orbit outside the Milky Way's flat spiral disk in a giant spherical halo. Because they are so old, every single massive blue star burned out billions of years ago. Today, globular clusters glow with the golden-orange light of ancient red giants and low-mass stars tightly bound by gravity.",
      astronomer:
        "With stellar densities exceeding 100,000 stars per cubic parsec in core-collapsed clusters (like M15), stellar encounter rates are extraordinarily high. Binary systems harden through three-body dynamical encounters, generating exotic objects including low-mass X-ray binaries (LMXBs), millisecond pulsars, and 'blue straggler' stars—stars that merged or accreted mass from companions to rejuvenate on the main sequence despite the cluster's ancient 12-Gyr age.",
    },
    didYouKnow:
      "If our Earth orbited a star in the core of globular cluster M13, the night sky would be packed with over 10,000 stars closer than Alpha Centauri, making the night sky brighter than a full Moon!",
    signatureHighlight:
      "Examine the dense core of Hercules Globular Cluster M13 in the 3D viewer and notice the absence of young blue stars.",
  },
];

export const MODULE_11_SOURCES: ScientificSource[] = [
  {
    title: "NASA James Webb Space Telescope: Pillars of Creation & Star Birth",
    organization: "NASA / STScI",
    url: "https://webbtelescope.org/contents/media/images/2022/052/01GF423GBQSK6ANC89NTFJW8VM",
  },
  {
    title: "ESA Hubble Space Telescope: The Science of Astronomical Colors & Nebulae",
    organization: "ESA",
    url: "https://hubblesite.org/science/stars-and-nebulae",
  },
  {
    title: "Chandra X-Ray Observatory: Supernova Remnants & Multiwavelength Composites",
    organization: "NASA Chandra",
    url: "https://chandra.harvard.edu/photo/category/snr.html",
  },
  {
    title: "ALMA Observatory: Cold Gas, Dust Grains, and Protoplanetary Disks",
    organization: "ESO / ALMA",
    url: "https://www.almaobservatory.org/en/about-alma/science-with-alma/",
  },
];

export const MODULE_11_LESSON: LessonModule = {
  id: "11",
  slug: "nebulae-and-star-clusters",
  number: 11,
  title: "Nebulae & Star Clusters",
  subtitle: "Stellar nurseries, emission clouds, and ancient globular swarms",
  description:
    "Explore the glowing gas and dust clouds where new star systems coalesce into open and globular clusters, and decode the science of astronomical imaging filters.",
  stageId: 3,
  recommendedOrder: 11,
  difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
  learningObjectives: [
    "Distinguish between emission, reflection, dark, planetary nebulae, and supernova remnants",
    "Explain how astronomical filters and false-color image processing create published nebula pictures",
    "Compare young disk open clusters (Pleiades) with ancient halo globular clusters (M13)",
    "Simulate how gas density, temperature, and Jeans criteria dictate whether a molecular cloud collapses into stars",
    "Analyze how multi-wavelength observations (visible, narrowband SHO, infrared, X-ray) reveal hidden cosmic phenomena",
  ],
  prerequisites: ["10"],
  route: "/learn?module=11",
  estimatedMinutes: 24,
  visualAssets: {
    iconName: "Cloud",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  },
  scientificSources: MODULE_11_SOURCES,
  status: "ready",
  version: "1.0.0",
};

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  level: "explorer" | "astronomer";
}

export const MODULE_11_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question:
      "Why do emission nebulae like the Orion Nebula glow predominantly red in true-color photographs?",
    options: [
      "The dust is red hot iron rust",
      "Excited hydrogen atoms emit Hydrogen-alpha light at 656.3 nanometers when electrons recombine",
      "Red light from Mars reflects off the clouds",
      "The gas is burning with oxygen flames",
    ],
    correctIndex: 1,
    explanation:
      "High-energy UV radiation from young stars ionizes hydrogen. When electrons recombine and drop from energy level 3 to 2, they emit crimson H-alpha photons at 656.3 nm.",
    level: "explorer",
  },
  {
    id: "q2",
    question: "Why do reflection nebulae like the Pleiades nebulosity appear blue?",
    options: [
      "The gas is made of pure blue copper vapor",
      "Tiny dust grains scatter short blue wavelengths much more effectively than long red wavelengths (Rayleigh scattering)",
      "The stars inside them are only blue dwarfs",
      "The light is Doppler blue-shifted toward Earth",
    ],
    correctIndex: 1,
    explanation:
      "Rayleigh scattering intensity scales inversely with wavelength to the 4th power (1/λ^4). Microscopic dust grains scatter blue light across the sky, just like Earth's atmosphere.",
    level: "explorer",
  },
  {
    id: "q3",
    question:
      "Are published colorful nebula images from Hubble and Webb direct representations of what human eyes would see in person?",
    options: [
      "Yes, human eyes see exactly those colors in space",
      "No, astronomical filters isolate specific chemical emission lines (like [S II], Hα, [O III]) and map them to primary RGB colors to highlight astrophysics",
      "No, they are hand-painted illustrations made by artists without real data",
      "Yes, astronauts in orbit see the sky glowing like neon billboards",
    ],
    correctIndex: 1,
    explanation:
      "Human scotopic (night) vision is insensitive to faint reds. Astronomical photos use narrow-band filters and multi-spectral assignments (like the Hubble SHO Palette) to map physical chemistry and ionization structures.",
    level: "explorer",
  },
  {
    id: "q4",
    question:
      "What is the key difference between an open star cluster and a globular star cluster?",
    options: [
      "Open clusters are young and loosely bound in the galactic disk; globular clusters are ancient, densely packed spherical swarms in the halo",
      "Open clusters contain black holes; globular clusters only have planets",
      "Open clusters are older than the universe; globular clusters formed last year",
      "Open clusters only exist outside the Milky Way",
    ],
    correctIndex: 0,
    explanation:
      "Open clusters (like the Pleiades) are young (<few 100 Myr), contain hundreds of stars, and live in the disk. Globular clusters (like M13) are 11–13 billion years old, contain hundreds of thousands of stars, and orbit in the halo.",
    level: "explorer",
  },
  {
    id: "q5",
    question:
      "Why can the James Webb Space Telescope (JWST) see newborn stars inside dark nebulae that Hubble cannot see in visible light?",
    options: [
      "Webb shoots lasers into the dust to burn it away",
      "Infrared light has longer wavelengths that easily pass through microscopic dust grains without scattering or being absorbed",
      "Webb flies much closer to the nebulae",
      "Webb only takes photos during the daytime",
    ],
    correctIndex: 1,
    explanation:
      "Interstellar extinction drops drastically at longer wavelengths. While visible light is scattered and blocked by dust grains, infrared photons pass through the dust columns, revealing embedded protostars.",
    level: "astronomer",
  },
  {
    id: "q6",
    question:
      "In the Jeans instability criteria, which conditions are most favorable for a gas cloud to collapse and form new stars?",
    options: [
      "High temperature and low density",
      "Low temperature and high density",
      "Low density and strong magnetic expansion",
      "Extreme radiation pressure and near-zero gravity",
    ],
    correctIndex: 1,
    explanation:
      "The Jeans mass scales as M_J ∝ T^(1.5) * ρ^(-0.5). Cold temperatures minimize thermal gas pressure support, while high density amplifies gravitational attraction, triggering collapse.",
    level: "astronomer",
  },
  {
    id: "q7",
    question: "What powers the continuous glow in the center of the Crab Nebula supernova remnant?",
    options: [
      "Nuclear fusion in an expanding iron core",
      "Synchrotron radiation from relativistic electrons accelerated by the rapidly spinning Crab Pulsar",
      "Chemical burning of coal dust",
      "Reflected light from the Moon",
    ],
    correctIndex: 1,
    explanation:
      "The Crab Nebula is a pulsar wind nebula. The central neutron star spins 30 times a second, injecting high-energy relativistic particles into magnetic fields, creating intense synchrotron continuum radiation.",
    level: "astronomer",
  },
  {
    id: "q8",
    question:
      "Why do globular clusters lack bright, massive blue O- and B-type main-sequence stars?",
    options: [
      "Globular clusters are too cold for blue stars to form",
      "Massive stars burn through their fuel in a few million years and died more than 10 billion years ago in these ancient clusters",
      "Gravity pulls all the blue light into the core",
      "Blue stars are blown out of the cluster by solar winds",
    ],
    correctIndex: 1,
    explanation:
      "Globular clusters formed over 11 billion years ago. Massive O and B stars only live 10 to 100 million years, so they exploded as supernovae early in the cluster's history.",
    level: "astronomer",
  },
];
