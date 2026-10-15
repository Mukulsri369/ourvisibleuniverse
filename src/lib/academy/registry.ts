import type { LearningLevelInfo, ModuleContract, StageContract } from "./types";

export const LEARNING_LEVELS: Record<string, LearningLevelInfo> = {
  junior: {
    id: "junior",
    name: "Junior Explorer",
    gradeRange: "Classes 1–3",
    targetAudience: "Ages 6–9",
    description:
      "Visual stories, fun analogies, and friendly bite-sized discoveries that ignite cosmic curiosity.",
    badge: "🚀 Junior Voyager",
    color: "from-cyan-400 to-blue-500",
  },
  explorer: {
    id: "explorer",
    name: "Space Explorer",
    gradeRange: "Classes 4–6",
    targetAudience: "Ages 9–12",
    description:
      "Hands-on cosmic experiments, fundamental laws of astronomy, and guided planetary explorations.",
    badge: "🔭 Space Scout",
    color: "from-indigo-400 to-purple-500",
  },
  astronomer: {
    id: "astronomer",
    name: "Young Astronomer",
    gradeRange: "Classes 7–10",
    targetAudience: "Ages 12–16",
    description:
      "Real observational data, mathematical scale comparisons, astrophysics principles, and research methods.",
    badge: "✨ Stellar Scholar",
    color: "from-amber-400 to-rose-500",
  },
};

export const ACADEMY_MODULES: ModuleContract[] = [
  // STAGE 1: DISCOVERING SPACE
  {
    id: "01",
    slug: "our-place-in-the-universe",
    number: 1,
    title: "Our Place in the Universe",
    subtitle: "From your home city to the cosmic web",
    description:
      "Zoom through eight orders of cosmic magnitude to understand our celestial address in the cosmos.",
    stageId: 1,
    recommendedOrder: 1,
    difficultyLevels: ["Beginner"],
    learningObjectives: [
      "Identify Earth's position within the Solar System and Milky Way galaxy",
      "Understand the hierarchical cosmic address concept",
      "Grasp the difference between solar systems, galaxies, and clusters",
    ],
    prerequisites: [],
    route: "/learn?module=01",
    estimatedMinutes: 15,
    visualAssets: {
      iconName: "Globe",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    scientificSources: [
      {
        title: "NASA Solar System Exploration: Our Cosmic Address",
        organization: "NASA",
        url: "https://science.nasa.gov/solar-system/",
      },
      {
        title: "Observable Universe Overview & Cosmic Scale",
        organization: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Observable_universe",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "02",
    slug: "the-night-sky-and-constellations",
    number: 2,
    title: "The Night Sky & Constellations",
    subtitle: "Navigating star patterns across ancient and modern skies",
    description:
      "Learn how humans mapped the heavens into 88 official constellations and how the sky shifts with Earth's rotation.",
    stageId: 1,
    recommendedOrder: 2,
    difficultyLevels: ["Beginner"],
    learningObjectives: [
      "Recognize major celestial landmarks including Polaris, Ursa Major, and Orion",
      "Understand how constellations were defined by the International Astronomical Union",
      "Explain why the night sky changes with seasons and latitude",
    ],
    prerequisites: ["01"],
    route: "/learn?module=02",
    estimatedMinutes: 18,
    visualAssets: {
      iconName: "Sparkles",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    scientificSources: [
      {
        title: "The 88 Official Constellations",
        organization: "IAU",
        url: "https://www.iau.org/public/themes/constellations/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "03",
    slug: "cosmic-distances-and-scale",
    number: 3,
    title: "Cosmic Distances & Scale",
    subtitle: "Astronomical Units, Light-Years and Parsecs",
    description:
      "Grasp the mind-bending gulfs of empty space between worlds and why standard kilometers fail in deep space.",
    stageId: 1,
    recommendedOrder: 3,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Define the Astronomical Unit (AU), light-year, and parsec",
      "Calculate light-travel times to the Moon, Sun, and Alpha Centauri",
      "Appreciate the immense vacuum separating planetary systems",
    ],
    prerequisites: ["01"],
    route: "/learn?module=03",
    estimatedMinutes: 20,
    visualAssets: {
      iconName: "Ruler",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    scientificSources: [
      {
        title: "Measuring Cosmic Distances",
        organization: "NASA",
        url: "https://science.nasa.gov/universe/exoplanets/how-do-we-measure-distances-in-space/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "04",
    slug: "light-time-and-cosmic-observation",
    number: 4,
    title: "Light, Time & Cosmic Observation",
    subtitle: "Looking outward is looking backward in time",
    description:
      "Discover why the speed of light turns every telescope into a genuine time machine.",
    stageId: 1,
    recommendedOrder: 4,
    difficultyLevels: ["Intermediate"],
    learningObjectives: [
      "Explain why telescope images show objects as they were in the past",
      "Identify the electromagnetic spectrum from radio to gamma rays",
      "Understand why modern observatories observe in infrared and X-rays",
    ],
    prerequisites: ["03"],
    route: "/learn?module=04",
    estimatedMinutes: 20,
    visualAssets: {
      iconName: "Eye",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    scientificSources: [
      {
        title: "The Electromagnetic Spectrum",
        organization: "NASA",
        url: "https://science.nasa.gov/ems/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },

  // STAGE 2: OUR COSMIC NEIGHBORHOOD
  {
    id: "05",
    slug: "earth-moon-and-eclipses",
    number: 5,
    title: "Earth, Moon & Eclipses",
    subtitle: "Orbital choreography of our home world and satellite",
    description:
      "Explore lunar phases, tidal locking, and the rare geometry that produces solar and lunar eclipses.",
    stageId: 2,
    recommendedOrder: 5,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Demonstrate why the Moon exhibits changing illumination phases",
      "Distinguish between total, partial, and annular solar eclipses",
      "Explain the tidal gravitational interactions between Earth and Moon",
      "Model how Earth's 23.44° axial tilt drives seasonal solstices and equinoxes",
      "Understand why the 5.145° lunar orbit inclination prevents monthly eclipses",
    ],
    prerequisites: ["01", "04"],
    route: "/learn?module=05",
    estimatedMinutes: 18,
    visualAssets: {
      iconName: "Moon",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    scientificSources: [
      {
        title: "NASA Lunar Science & Eclipse Exploration",
        organization: "NASA",
        url: "https://science.nasa.gov/eclipses/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "06",
    slug: "explore-the-solar-system",
    number: 6,
    title: "Explore the Solar System",
    subtitle: "From rocky infernos to gas giants and icy dwarf planets",
    description:
      "Tour the 8 major planets, asteroid belt, Kuiper belt, and distant icy comets orbiting our central star.",
    stageId: 2,
    recommendedOrder: 6,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Compare terrestrial rocky worlds with Jovian gas and ice giants",
      "Trace the formation of the protoplanetary accretion disk",
      "Identify key dwarf planets like Pluto, Ceres, and Eris",
    ],
    prerequisites: ["05"],
    route: "/learn?module=06",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Orbit",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    scientificSources: [
      {
        title: "Planetary Fact Sheets",
        organization: "NASA",
        url: "https://nssdc.gsfc.nasa.gov/planetary/planetfact.html",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "07",
    slug: "the-sun-our-star",
    number: 7,
    title: "The Sun: Our Star",
    subtitle: "The nuclear fusion powerhouse that fuels life",
    description:
      "Peer inside the Sun's core, radiative zone, convection cells, and dynamic magnetic flares.",
    stageId: 2,
    recommendedOrder: 7,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Describe the proton-proton nuclear fusion chain that powers the Sun",
      "Trace the 11-year solar sunspot and magnetic activity cycle",
      "Explain how solar winds interact with Earth's magnetosphere creating auroras",
    ],
    prerequisites: ["06"],
    route: "/learn?module=07",
    estimatedMinutes: 20,
    visualAssets: {
      iconName: "Sun",
      badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    },
    scientificSources: [
      {
        title: "NASA Solar Dynamics Observatory (SDO)",
        organization: "NASA",
        url: "https://sdo.gsfc.nasa.gov/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "08",
    slug: "gravity-orbits-and-motion",
    number: 8,
    title: "Gravity, Orbits & Motion",
    subtitle: "Kepler's laws, Newton's universal gravity, and orbital mechanics",
    description:
      "Understand why planets fall around the Sun without crashing, and how spacecraft navigate using gravitational slingshots.",
    stageId: 2,
    recommendedOrder: 8,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "State and interpret Kepler's three laws of planetary motion",
      "Understand escape velocity and orbital insertion velocities",
      "Calculate orbital periods using Newton's gravitational equation",
    ],
    prerequisites: ["06", "07"],
    route: "/learn?module=08",
    estimatedMinutes: 24,
    visualAssets: {
      iconName: "Compass",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    },
    scientificSources: [
      {
        title: "Basics of Space Flight: Orbital Mechanics",
        organization: "NASA",
        url: "https://science.nasa.gov/learn/basics-of-space-flight/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },

  // STAGE 3: THE LIFE OF STARS
  {
    id: "09",
    slug: "stars-colors-sizes-and-temperatures",
    number: 9,
    title: "Stars: Colors, Sizes & Temperatures",
    subtitle: "Spectral classification from red dwarfs to blue supergiants and the H-R diagram",
    description:
      "Explore 3D stars in the comparison museum, test blackbody Planck curves, and navigate the Hertzsprung-Russell diagram.",
    stageId: 3,
    recommendedOrder: 9,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Compare scientifically representative 3D models of the Sun, red dwarfs, blue giants, supergiants, and white dwarfs",
      "Categorize stars by Harvard spectral classes: O, B, A, F, G, K, M and Morgan-Keenan luminosity classes",
      "Model Wien's displacement law, Stefan-Boltzmann luminosity, and blackbody thermal radiation",
      "Understand the inverse-square law of starlight and absolute versus apparent magnitude",
      "Analyze the Hertzsprung-Russell (H-R) diagram and identify the Main Sequence, Giant Branch, and White Dwarf cooling track",
    ],
    prerequisites: ["04", "07"],
    route: "/learn?module=09",
    estimatedMinutes: 22,
    visualAssets: {
      iconName: "Flame",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    scientificSources: [
      {
        title: "ESA Gaia Mission: Star Mapping & The Hertzsprung-Russell Diagram",
        organization: "ESA",
        url: "https://www.cosmos.esa.int/web/gaia/dr3",
      },
      {
        title: "NASA Astrophysics: Stars, Classification & Stellar Lifecycles",
        organization: "NASA",
        url: "https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/",
      },
      {
        title:
          "IAU Commission G1: Binary and Multiple Star Systems & Fundamental Stellar Parameters",
        organization: "IAU",
        url: "https://www.iau.org/science/scientific_bodies/commissions/G1/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "10",
    slug: "birth-life-and-death-of-stars",
    number: 10,
    title: "Birth, Life & Death of Stars",
    subtitle: "From molecular clouds to white dwarfs, supernovae, and remnants",
    description:
      "Follow the dramatic evolutionary trajectories determined purely by a star's initial birth mass.",
    stageId: 3,
    recommendedOrder: 10,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Trace the life cycle of low-mass stars like our Sun up to planetary nebulae",
      "Examine the core-collapse supernova process for massive stars (>8 solar masses)",
      "Understand nucleosynthesis and how every heavy element in your body was forged in stars",
    ],
    prerequisites: ["09"],
    route: "/learn?module=10",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Zap",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    },
    scientificSources: [
      {
        title: "Hubble Stars & Stellar Evolution",
        organization: "Hubble",
        url: "https://hubblesite.org/science/stars-and-nebulae",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "11",
    slug: "nebulae-and-star-clusters",
    number: 11,
    title: "Nebulae & Star Clusters",
    subtitle: "Stellar nurseries, emission clouds, and ancient globular swarms",
    description:
      "Explore the glowing gas and dust clouds where new star systems coalesce into open and globular clusters.",
    stageId: 3,
    recommendedOrder: 11,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Distinguish between emission, reflection, dark, and planetary nebulae",
      "Compare open clusters in galactic arms with ancient spherical globular clusters",
      "Interpret infrared views penetrating dense stellar dust clouds",
    ],
    prerequisites: ["10"],
    route: "/learn?module=11",
    estimatedMinutes: 20,
    visualAssets: {
      iconName: "Cloud",
      badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    },
    scientificSources: [
      {
        title: "JWST Pillars of Creation & Star-Forming Regions",
        organization: "JWST",
        url: "https://webbtelescope.org/contents/media/images/2022/052/01GF423GBQSK6ANC89NTFJW8VM",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "12",
    slug: "exoplanets-and-alien-worlds",
    number: 12,
    title: "Exoplanets & Alien Worlds",
    subtitle: "Transit photometry, radial velocity, and the search for habitable zones",
    description:
      "Discover thousands of confirmed worlds beyond our solar system, from hot Jupiters to rocky habitable exoplanets.",
    stageId: 3,
    recommendedOrder: 12,
    difficultyLevels: ["Intermediate"],
    learningObjectives: [
      "Understand the transit method and Kepler/TESS light curves",
      "Define circumstellar habitable zones (Goldilocks zones)",
      "Analyze atmospheric transmission spectra for bio-signatures",
    ],
    prerequisites: ["06", "09"],
    route: "/learn?module=12",
    estimatedMinutes: 22,
    visualAssets: {
      iconName: "Globe2",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    scientificSources: [
      {
        title: "NASA Exoplanet Archive & Exploration",
        organization: "NASA",
        url: "https://exoplanets.nasa.gov/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },

  // STAGE 4: GALAXIES & EXTREME OBJECTS
  {
    id: "13",
    slug: "learn-about-galaxies",
    number: 13,
    title: "Learn About Galaxies",
    subtitle: "Spiral, elliptical, and irregular island universes",
    description:
      "Inspect the morphology, stellar populations, and central supermassive black holes of the Milky Way, Andromeda, and deep sky galaxies.",
    stageId: 4,
    recommendedOrder: 13,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Identify galaxy types via Hubble's tuning fork classification scheme",
      "Explore the Milky Way's spiral structure, bar, and stellar halo",
      "Interact with real 3D models of Andromeda, Whirlpool, and Sombrero galaxies",
    ],
    prerequisites: ["01", "10"],
    route: "/galaxies",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Disc",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    },
    scientificSources: [
      {
        title: "NASA Astrophysics: Galaxies and the Cosmic Web",
        organization: "NASA",
        url: "https://science.nasa.gov/astrophysics/focus-areas/what-are-galaxies/",
      },
      {
        title: "Galaxy Morphology & Catalog",
        organization: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Galaxy_morphological_classification",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "14",
    slug: "black-holes-and-neutron-stars",
    number: 14,
    title: "Black Holes & Neutron Stars",
    subtitle: "Event horizons, gravitational lensing, and relativistic jets",
    description:
      "Investigate physics at the extremes: pulsars, magnetars, and supermassive black holes warping spacetime itself.",
    stageId: 4,
    recommendedOrder: 14,
    difficultyLevels: ["Advanced"],
    learningObjectives: [
      "Define the Schwarzschild radius and event horizon physics",
      "Understand gravitational lensing and photon sphere orbits",
      "Examine relativistic particle jets and accretion disk temperatures",
    ],
    prerequisites: ["10", "13"],
    route: "/learn?module=14",
    estimatedMinutes: 26,
    visualAssets: {
      iconName: "Radio",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    scientificSources: [
      {
        title: "Event Horizon Telescope Black Hole Imaging",
        organization: "NASA",
        url: "https://eventhorizontelescope.org/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "15",
    slug: "galaxy-groups-clusters-and-cosmic-web",
    number: 15,
    title: "Galaxy Groups, Clusters & Cosmic Web",
    subtitle: "The largest gravitationally bound structures in the universe",
    description:
      "Witness how billions of galaxies trace vast filamentary highways surrounding enormous cosmic voids.",
    stageId: 4,
    recommendedOrder: 15,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Locate the Local Group within the Laniakea Supercluster",
      "Analyze hot intracluster gas via X-ray observations",
      "Understand cosmic web filament formation via dark matter scaffolding",
    ],
    prerequisites: ["13"],
    route: "/learn?module=15",
    estimatedMinutes: 22,
    visualAssets: {
      iconName: "Network",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    scientificSources: [
      {
        title: "Laniakea: Our Local Supercluster",
        organization: "ESA",
        url: "https://www.nature.com/articles/nature13674",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "16",
    slug: "dark-matter-and-dark-energy",
    number: 16,
    title: "Dark Matter & Dark Energy",
    subtitle: "The 95% invisible universe dictating cosmic destiny",
    description:
      "Explore the astronomical evidence from galactic rotation curves and accelerating expansion that revealed unseen forces.",
    stageId: 4,
    recommendedOrder: 16,
    difficultyLevels: ["Advanced"],
    learningObjectives: [
      "Review Vera Rubin's discovery of flat galactic rotation curves",
      "Explain gravitational lensing measurements of dark matter halos",
      "Describe Type Ia supernovae evidence for accelerated expansion",
    ],
    prerequisites: ["13", "15"],
    route: "/learn?module=16",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "HelpCircle",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    scientificSources: [
      {
        title: "Dark Energy, Dark Matter Overview",
        organization: "NASA",
        url: "https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },

  // STAGE 5: UNDERSTANDING THE UNIVERSE
  {
    id: "17",
    slug: "big-bang-and-cosmic-evolution",
    number: 17,
    title: "Big Bang & Cosmic Evolution",
    subtitle: "From inflation and primordial nucleosynthesis to the first stars",
    description:
      "Trace the 13.8-billion-year chronology from Planck time and recombination to the modern cosmic era.",
    stageId: 5,
    recommendedOrder: 17,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Explain the Big Bang as an expansion of space, not an explosion in space",
      "Understand the Cosmic Microwave Background (CMB) as primordial light",
      "Follow the Cosmic Dark Ages and the epoch of reionization",
    ],
    prerequisites: ["04", "16"],
    route: "/learn?module=17",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Activity",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    scientificSources: [
      {
        title: "Planck Cosmic Microwave Background Survey",
        organization: "ESA",
        url: "https://www.cosmos.esa.int/web/planck",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "18",
    slug: "the-expanding-universe",
    number: 18,
    title: "The Expanding Universe",
    subtitle: "Hubble-Lemaître law, cosmological redshift, and metric expansion",
    description:
      "Learn how galaxies drift apart as spacetime itself stretches, shifting ancient light into longer red wavelengths.",
    stageId: 5,
    recommendedOrder: 18,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Formulate Hubble's Law (v = H0 * d)",
      "Differentiate Doppler shift from cosmological redshift (z)",
      "Explain why the expansion does not expand atoms, planets, or galaxies",
    ],
    prerequisites: ["17"],
    route: "/learn?module=18",
    estimatedMinutes: 24,
    visualAssets: {
      iconName: "Maximize2",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    scientificSources: [
      {
        title: "Hubble's Law & Redshift Measurement",
        organization: "NASA",
        url: "https://science.nasa.gov/mission/hubble/science/science-highlights/determining-the-rate-of-expansion-of-the-universe/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "19",
    slug: "visible-universe-history",
    number: 19,
    title: "Visible Universe History",
    subtitle: "Interactive chronological simulation from the Big Bang to the Present",
    description:
      "Experience the full cosmic timeline with interactive epoch simulations, redshift trackers, FAQs, and NASA archives.",
    stageId: 5,
    recommendedOrder: 19,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Navigate all primary cosmic epochs from 0 years to 13.8 billion years",
      "Observe the emergence of light, stars, spiral galaxies, and life",
      "Interact with NASA and Wikipedia research entries for key cosmic phenomena",
    ],
    prerequisites: ["01", "17"],
    route: "/visible-universe-history",
    estimatedMinutes: 30,
    visualAssets: {
      iconName: "Clock",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    scientificSources: [
      {
        title: "Cosmic Evolution Timeline",
        organization: "NASA",
        url: "https://science.nasa.gov/universe/overview/",
      },
      {
        title: "Chronology of the Universe",
        organization: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Chronology_of_the_universe",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "20",
    slug: "the-future-of-the-universe",
    number: 20,
    title: "The Future of the Universe",
    subtitle: "From the Stelliferous Era to the Heat Death and Big Freeze",
    description:
      "Contemplate astronomical time scales spanning trillions of years as stars exhaust their fuel into the cosmic night.",
    stageId: 5,
    recommendedOrder: 20,
    difficultyLevels: ["Advanced"],
    learningObjectives: [
      "Delineate the 5 cosmological eras of Fred Adams and Gregory Laughlin",
      "Explore the degenerate era, black hole era, and final dark era",
      "Discuss modern hypotheses on the ultimate fate of spacetime",
    ],
    prerequisites: ["17", "18"],
    route: "/learn?module=20",
    estimatedMinutes: 20,
    visualAssets: {
      iconName: "Hourglass",
      badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/30",
    },
    scientificSources: [
      {
        title: "Ultimate Fate of the Universe",
        organization: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Ultimate_fate_of_the_universe",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },

  // STAGE 6: BECOME A SPACE SCIENTIST
  {
    id: "21",
    slug: "telescopes-and-how-we-discover-space",
    number: 21,
    title: "Telescopes & How We Discover Space",
    subtitle: "Refractors, reflectors, interferometry, and space observatories",
    description:
      "Learn how astronomers harness mirrors, CCDs, radio arrays, and space-based infrared sensors to peer across cosmos.",
    stageId: 6,
    recommendedOrder: 21,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Compare optical refractor and Newtonian reflector designs",
      "Understand why placing telescopes in space avoids atmospheric turbulence",
      "Learn how radio interferometers like the ALMA array work together",
    ],
    prerequisites: ["04"],
    route: "/learn?module=21",
    estimatedMinutes: 22,
    visualAssets: {
      iconName: "Search",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    scientificSources: [
      {
        title: "NASA Space Observatories & Technology",
        organization: "NASA",
        url: "https://science.nasa.gov/mission/webb/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "22",
    slug: "space-missions-and-human-exploration",
    number: 22,
    title: "Space Missions & Human Exploration",
    subtitle: "Voyagers, Apollo, Mars rovers, Artemis, and beyond",
    description:
      "Relive historic triumphs from Apollo 11 to the robotic probes cruising through interstellar space.",
    stageId: 6,
    recommendedOrder: 22,
    difficultyLevels: ["Beginner", "Intermediate"],
    learningObjectives: [
      "Trace the milestones of human spaceflight and the ISS",
      "Follow the Voyager 1 & 2 journeys beyond the heliosphere",
      "Explore ongoing Mars rover science and the Artemis lunar program",
    ],
    prerequisites: ["06"],
    route: "/learn?module=22",
    estimatedMinutes: 24,
    visualAssets: {
      iconName: "Rocket",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    scientificSources: [
      {
        title: "NASA Planetary Missions Directory",
        organization: "NASA",
        url: "https://science.nasa.gov/missions/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "23",
    slug: "life-beyond-earth-and-astrobiology",
    number: 23,
    title: "Life Beyond Earth & Astrobiology",
    subtitle: "Extremophiles, subsurface oceans, and the Drake equation",
    description:
      "Evaluate the scientific prospects for extraterrestrial life on icy moons like Europa and Enceladus.",
    stageId: 6,
    recommendedOrder: 23,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Study extremophiles living in boiling hydrothermal vents and acidic lakes",
      "Assess habitable hydrothermal oceans under the ice crusts of Europa and Enceladus",
      "Break down the factors of the Frank Drake Equation",
    ],
    prerequisites: ["06", "12"],
    route: "/learn?module=23",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Dna",
      badgeColor: "bg-green-500/10 text-green-400 border-green-500/30",
    },
    scientificSources: [
      {
        title: "NASA Astrobiology Institute",
        organization: "NASA",
        url: "https://astrobiology.nasa.gov/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
  {
    id: "24",
    slug: "cosmic-physics-laboratory-and-challenges",
    number: 24,
    title: "Cosmic Physics Laboratory & Challenges",
    subtitle: "Interactive simulations, orbital puzzles, and master challenges",
    description:
      "Put your knowledge into practice in a physics sandbox: balance solar systems, escape black holes, and calculate cosmic scales.",
    stageId: 6,
    recommendedOrder: 24,
    difficultyLevels: ["Advanced"],
    learningObjectives: [
      "Apply orbital physics principles to stabilize multi-planet systems",
      "Analyze spectral lines to identify unknown stellar compositions",
      "Complete the Capstone Space Scientist Assessment",
    ],
    prerequisites: ["08", "14", "18"],
    route: "/learn?module=24",
    estimatedMinutes: 35,
    visualAssets: {
      iconName: "Cpu",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    scientificSources: [
      {
        title: "Astrophysics Data System & Lab Resources",
        organization: "NASA",
        url: "https://ui.adsabs.harvard.edu/",
      },
    ],
    status: "coming_soon",
    version: "0.9.0",
  },
];

export const ACADEMY_STAGES: StageContract[] = [
  {
    id: 1,
    title: "Discovering Space",
    subtitle: "Our Cosmic Horizon",
    themeColor: "from-cyan-500/20 via-blue-500/10 to-transparent",
    accentGlow: "shadow-cyan-500/20 text-cyan-400 border-cyan-500/30",
    spaceDestination: "Earth & Nearby Space",
    iconName: "Globe",
    description:
      "Begin at home on Earth and orient yourself with the constellations, cosmic distance scales, and how light connects us to space.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 1),
  },
  {
    id: 2,
    title: "Our Cosmic Neighborhood",
    subtitle: "Planetary Systems & Gravity",
    themeColor: "from-amber-500/20 via-orange-500/10 to-transparent",
    accentGlow: "shadow-amber-500/20 text-amber-400 border-amber-500/30",
    spaceDestination: "The Solar System",
    iconName: "Orbit",
    description:
      "Explore the Sun, Earth, Moon, rings of Saturn, Jupiter's moons, and the gravitational laws that bind celestial bodies in orbit.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 2),
  },
  {
    id: 3,
    title: "The Life of Stars",
    subtitle: "Stellar Alchemy & Worlds",
    themeColor: "from-pink-500/20 via-purple-500/10 to-transparent",
    accentGlow: "shadow-pink-500/20 text-pink-400 border-pink-500/30",
    spaceDestination: "Nebulae & Stellar Nurseries",
    iconName: "Sparkles",
    description:
      "Witness the birth, dramatic lives, and explosive deaths of stars, glowing nebulae, and thousands of discovered exoplanets.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 3),
  },
  {
    id: 4,
    title: "Galaxies & Extreme Objects",
    subtitle: "Island Universes & Spacetime",
    themeColor: "from-purple-500/20 via-indigo-500/10 to-transparent",
    accentGlow: "shadow-purple-500/20 text-purple-400 border-purple-500/30",
    spaceDestination: "Milky Way & Galaxy Clusters",
    iconName: "Disc",
    description:
      "Examine spiral, elliptical, and colliding galaxies, alongside relativistic black holes, neutron stars, and mysterious dark matter.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 4),
  },
  {
    id: 5,
    title: "Understanding the Universe",
    subtitle: "Cosmic History & Evolution",
    themeColor: "from-rose-500/20 via-red-500/10 to-transparent",
    accentGlow: "shadow-rose-500/20 text-rose-400 border-rose-500/30",
    spaceDestination: "Cosmic Web & Early Universe",
    iconName: "Activity",
    description:
      "Unravel the Big Bang, expanding spacetime, 13.8 billion years of visible universe history, and the ultimate future of the cosmos.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 5),
  },
  {
    id: 6,
    title: "Become a Space Scientist",
    subtitle: "Observatories, Missions & Physics",
    themeColor: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accentGlow: "shadow-emerald-500/20 text-emerald-400 border-emerald-500/30",
    spaceDestination: "Futuristic Observatory & Lab",
    iconName: "Cpu",
    description:
      "Operate space telescopes, study astrobiology and the search for extraterrestrial life, and test your skills in interactive challenges.",
    modules: ACADEMY_MODULES.filter((m) => m.stageId === 6),
  },
];
