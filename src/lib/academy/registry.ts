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
    status: "ready",
    version: "1.0.0",
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
      "Trace the life cycle of low-mass stars like our Sun up to planetary nebulae and white dwarfs",
      "Examine the core-collapse supernova process for massive stars (>8 solar masses)",
      "Explain why the Sun will NEVER explode as a supernova",
      "Understand the stellar lifetime relationship τ ∝ M^(-2.5) and its physical limitations",
      "Identify how compact remnants (white dwarfs, neutron stars, black holes) are supported against gravity",
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
        title: "NASA Astrophysics: How Do Stars Form, Live, and Die?",
        organization: "NASA",
        url: "https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/",
      },
      {
        title: "ESA Hubble Science: Star Birth, Evolution, and Stellar Remnants",
        organization: "ESA",
        url: "https://hubblesite.org/science/stars-and-nebulae",
      },
      {
        title: "Chandra X-Ray Observatory: Supernovae, Pulsars & Stellar Black Holes",
        organization: "NASA Chandra",
        url: "https://chandra.harvard.edu/xray_sources/supernovas.html",
      },
      {
        title: "MESA: Modules for Experiments in Stellar Astrophysics",
        organization: "MESA Project",
        url: "https://docs.mesastar.org/",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
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
    scientificSources: [
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
    ],
    status: "ready",
    version: "1.0.0",
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
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Identify galaxy types via Hubble's tuning fork classification scheme (spirals, barred spirals, ellipticals, irregulars)",
      "Explore the Milky Way's spiral structure, bar, galactic center, and stellar halo",
      "Understand galactic rotation curves and the cosmological evidence for dark matter halos",
      "Investigate supermassive black holes (Sagittarius A* and M87*) and active galactic nuclei",
      "Interact with scientifically representative 3D procedural particle models of real galaxies",
    ],
    prerequisites: ["03", "08", "09"],
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
    subtitle:
      "Extreme Objects Laboratory: event horizons, lensing, pulsars, and gravitational waves",
    description:
      "Investigate physics at the extremes: white dwarfs vs neutron stars, relativistic black hole gravitational lensing, pulsar magnetic beams, and gravitational-wave ripples in spacetime.",
    stageId: 4,
    recommendedOrder: 14,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Understand core collapse physics, degeneracy pressures, Chandrasekhar and Tolman-Oppenheimer-Volkoff limits",
      "Compare physical densities and structures of white dwarfs, neutron stars, and black holes",
      "Calculate and visualize Schwarzschild event horizons (r_s = 2GM/c^2), photon spheres, and ISCO radii",
      "Explore gravitational lensing, Einstein rings, and relativistic accretion-disk Doppler beaming",
      "Investigate pulsar magnetic axes, rapid millisecond rotation, and lighthouse emission cones",
      "Simulate compact binary inspirals and the emission of quadrupole gravitational-wave chirp waveforms",
      "Debunk common misconceptions: black holes do not act as cosmic vacuum cleaners at orbital distances",
    ],
    prerequisites: ["08", "10"],
    route: "/learn?module=14",
    estimatedMinutes: 28,
    visualAssets: {
      iconName: "Radio",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    scientificSources: [
      {
        title: "Event Horizon Telescope (EHT) Collaboration: First M87* & Sgr A* Horizon Images",
        organization: "EHT / Astrophysical Journal Letters",
        url: "https://eventhorizontelescope.org/",
      },
      {
        title: "LIGO–Virgo–KAGRA Gravitational Wave Observations and Binary Black Hole Mergers",
        organization: "Caltech / MIT / LIGO Laboratory",
        url: "https://www.ligo.caltech.edu/",
      },
      {
        title: "Chandra X-ray Observatory: Stellar-Mass & Supermassive Black Hole Accretion",
        organization: "NASA / Smithsonian Astrophysical Observatory",
        url: "https://chandra.harvard.edu/",
      },
      {
        title:
          "NICER (Neutron Star Interior Composition Explorer) Pulsar Mass & Radius Constraints",
        organization: "NASA Goddard Space Flight Center",
        url: "https://www.nasa.gov/nicer",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "15",
    slug: "galaxy-groups-clusters-and-cosmic-web",
    number: 15,
    title: "Galaxy Groups, Clusters & Cosmic Web",
    subtitle:
      "The largest gravitationally bound structures, cosmic filaments, and empty supervoids",
    description:
      "Explore the grandest architecture of the universe: from the Local Group and Virgo Cluster to Laniakea, the Boötes Supervoid, and the cosmic web scaffolding.",
    stageId: 4,
    recommendedOrder: 15,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Distinguish between gravitationally bound virialized clusters and unbound expanding superclusters",
      "Trace our cosmic address: Milky Way → Local Group → Virgo Cluster → Laniakea Supercluster",
      "Understand Fritz Zwicky's 1933 discovery of dark matter in the Coma Cluster via the Virial Theorem",
      "Explore the Warm-Hot Intergalactic Medium (WHIM) and the solution to the missing baryon problem",
      "Analyze the Boötes Void ('The Great Nothing') and the dynamics of cosmic void expansion",
      "Simulate 13.8 billion years of hierarchical structure formation from primordial quantum fluctuations",
      "Conduct photometric aperture density mapping on simulated galaxy redshift surveys",
    ],
    prerequisites: ["13", "14"],
    route: "/learn?module=15",
    estimatedMinutes: 24,
    visualAssets: {
      iconName: "Network",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    },
    scientificSources: [
      {
        title: "Tully et al. (Nature, 2014) The Laniakea Supercluster of Galaxies",
        organization: "Nature / Cosmicflows Project",
        url: "https://www.nature.com/articles/nature13674",
      },
      {
        title: "Sloan Digital Sky Survey (SDSS) 3D Large-Scale Structure Maps",
        organization: "SDSS Collaboration / Astrophysical Journal",
        url: "https://www.sdss.org/",
      },
      {
        title: "The IllustrisTNG Project: Cosmological Magnetohydrodynamical Simulations",
        organization: "Max Planck Institute for Astrophysics / Harvard CFA",
        url: "https://www.tng-project.org/",
      },
      {
        title: "Kirshner et al. (1981) A Million Cubic Megaparsec Void in Boötes",
        organization: "Astrophysical Journal Letters",
        url: "https://ui.adsabs.harvard.edu/abs/1981ApJ...248L..57K",
      },
    ],
    status: "ready",
    version: "1.0.0",
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
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Analyze Vera Rubin's flat rotation curves and distinguish Keplerian decline from dark halo dynamics",
      "Model spherical dark matter halos and compute enclosed mass profiles M(r) vs radius",
      "Examine the Bullet Cluster (1E 0657-56) as empirical proof of collisionless particle dark matter",
      "Understand Fritz Zwicky's 1933 Virial Theorem mass estimates in the Coma Cluster",
      "Measure cosmic acceleration using Type Ia supernova standard candles and cosmological redshift",
      "Compare Friedmann cosmological histories: ΛCDM, matter-only, recollapsing, and phantom energy",
      "Differentiate the attractive gravitational nature of dark matter from the repulsive negative pressure of dark energy",
      "Bust common cosmic myths and explore open frontiers in modern cosmological physics",
    ],
    prerequisites: ["13", "14", "15"],
    route: "/learn?module=16",
    estimatedMinutes: 25,
    visualAssets: {
      iconName: "Compass",
      badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    },
    scientificSources: [
      {
        title: "Rubin & Ford (1970) Rotation of the Andromeda Nebula from a Spectroscopic Survey",
        organization: "Astrophysical Journal (ApJ 159, 379)",
        url: "https://ui.adsabs.harvard.edu/abs/1970ApJ...159..379R",
      },
      {
        title:
          "Perlmutter et al. (1999) Measurements of Omega and Lambda from 42 High-Redshift Supernovae",
        organization: "The Supernova Cosmology Project / Astrophysical Journal",
        url: "https://ui.adsabs.harvard.edu/abs/1999ApJ...517..565P",
      },
      {
        title:
          "Riess et al. (1998) Observational Evidence from Supernovae for an Accelerating Universe",
        organization: "High-Z Supernova Search Team / Astronomical Journal",
        url: "https://ui.adsabs.harvard.edu/abs/1998AJ....116.1009R",
      },
      {
        title:
          "Clowe et al. (2006) A Direct Empirical Proof of the Existence of Dark Matter (The Bullet Cluster)",
        organization: "Astrophysical Journal Letters (ApJL 648, L109)",
        url: "https://ui.adsabs.harvard.edu/abs/2006ApJ...648L.109C",
      },
      {
        title: "Planck Collaboration (2018) Planck 2018 Results. VI. Cosmological Parameters",
        organization: "Astronomy & Astrophysics (A&A 641, A6)",
        url: "https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html",
      },
    ],
    status: "ready",
    version: "1.0.0",
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
      "Clarify the Big Bang as metric expansion of space everywhere, not an explosion in empty space",
      "Trace physical conditions across epochs: Planck, inflation, electroweak, and quark-gluon plasma",
      "Analyze Big Bang Nucleosynthesis (BBN) forging primordial Hydrogen (~75%) and Helium-4 (~25%)",
      "Decode Recombination at t ≈ 380,000 years and the Cosmic Microwave Background (CMB) surface of last scattering",
      "Explore the 21 cm neutral hydrogen line during the Cosmic Dark Ages",
      "Track Cosmic Dawn, Population III massive stars, and the epoch of Cosmic Reionization",
      "Map galaxy assembly, Cosmic Noon starburst peak, and the Madau-Dickinson star formation curve",
      "Calculate cosmological redshift z, temperature evolution T(z) = T_0(1+z), and scale factor a(t)",
    ],
    prerequisites: ["04", "16"],
    route: "/learn?module=17",
    estimatedMinutes: 28,
    visualAssets: {
      iconName: "Clock",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    },
    scientificSources: [
      {
        title: "Planck 2018 Results. VI. Cosmological Parameters",
        organization: "Planck Collaboration / Astronomy & Astrophysics",
        url: "https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html",
      },
      {
        title: "A Measurement of Excess Antenna Temperature at 4080 Mc/s",
        organization: "Penzias & Wilson (1965) / Astrophysical Journal",
        url: "https://ui.adsabs.harvard.edu/abs/1965ApJ...142..419P",
      },
      {
        title: "The Cosmic History of Star Formation",
        organization: "Madau & Dickinson (2014) / Annual Review of Astronomy & Astrophysics",
        url: "https://ui.adsabs.harvard.edu/abs/2014ARA%26A..52..415M",
      },
      {
        title: "A Candidate z = 14.32 Galaxy Confirmed by JWST NIRSpec (JADES-GS-z14-0)",
        organization: "Carniani et al. (2024) / Nature / arXiv:2405.18485",
        url: "https://arxiv.org/abs/2405.18485",
      },
    ],
    status: "ready",
    version: "1.0.0",
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
      "Understand the metric expansion of space vs physical motion through static space",
      "Observe how galaxy distances evolve: proper distance d(t) = a(t) * χ with no central point",
      "Formulate the Hubble–Lemaître Law: v = H0 * d and trace the Hubble parameter H(t)",
      "Distinguish cosmological redshift (1 + z = 1/a) from Doppler and gravitational redshifts",
      "Track the cosmic scale factor a(t) from radiation domination to modern dark energy acceleration",
      "Compute lookback time across billions of years and understand how we see cosmic history",
      "Map observable universe horizons (Particle Horizon, Hubble Radius, Event Horizon)",
      "Explain why atoms, planetary orbits, and galaxies DO NOT expand under metric stretching",
    ],
    prerequisites: ["17"],
    route: "/learn?module=18",
    estimatedMinutes: 26,
    visualAssets: {
      iconName: "Compass",
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    scientificSources: [
      {
        title: "A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae",
        organization: "Hubble (1929) / PNAS",
        url: "https://www.pnas.org/doi/10.1073/pnas.15.3.168",
      },
      {
        title: "Un Univers homogène de masse constante et de rayon croissant",
        organization: "Lemaître (1927) / Annales de la Société Scientifique de Bruxelles",
        url: "https://ui.adsabs.harvard.edu/abs/1927ASSB...47...49L",
      },
      {
        title: "Final Results from the HST Key Project to Measure the Hubble Constant",
        organization: "Freedman et al. (2001) / Astrophysical Journal",
        url: "https://ui.adsabs.harvard.edu/abs/2001ApJ...553...47F",
      },
      {
        title: "The Pantheon+ Analysis: Cosmological Constraints",
        organization: "Brout et al. (2022) / Astrophysical Journal",
        url: "https://ui.adsabs.harvard.edu/abs/2022ApJ...938..110B",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },
  {
    id: "19",
    slug: "visible-universe-history",
    number: 19,
    title: "Visible Universe History",
    subtitle: "How human understanding of the cosmos changed from antiquity to the modern frontier",
    description:
      "Trace the evolution of human cosmological models: from Eratosthenes and Ptolemaic epicycles to Islamic mathematics, Copernican heliocentrism, Kepler, Newton, Hubble, and modern astrophysics.",
    stageId: 5,
    recommendedOrder: 19,
    difficultyLevels: ["Intermediate", "Advanced"],
    learningObjectives: [
      "Survey diverse early cosmological models and debunk the myth of universal flat-earth beliefs",
      "Analyze empirical proofs of a spherical Earth (Eratosthenes, lunar eclipses, star elevation)",
      "Examine major geocentric architectures (Aristotelian spheres, Ptolemaic epicycles and equants)",
      "Explore contributions from Indian (Aryabhata), Islamic (Tusi Couple, Maragha), and global traditions",
      "Follow the heliocentric revolution through Aristarchus, Copernicus, and Tycho Brahe",
      "Trace Kepler's orbital laws, Galileo's telescopic discoveries, and Newtonian universal gravitation",
      "Map the scale of the Milky Way, Bessel's parallax, and the resolution of the Great Debate",
      "Investigate modern cosmology: expansion, Big Bang, CMB, dark matter, and space observatories",
    ],
    prerequisites: ["01", "17", "18"],
    route: "/learn?module=19",
    estimatedMinutes: 30,
    visualAssets: {
      iconName: "Compass",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    },
    scientificSources: [
      {
        title: "Almagest (Syntaxis Mathematica)",
        organization: "Claudius Ptolemy (c. 150 CE)",
        url: "https://archive.org/details/ptolemysalmagest00ptol",
      },
      {
        title: "On the Revolutions of the Heavenly Spheres",
        organization: "Nicolaus Copernicus (1543)",
        url: "https://www.loc.gov/item/49039755/",
      },
      {
        title: "The Starry Messenger (Sidereus Nuncius)",
        organization: "Galileo Galilei (1610)",
        url: "https://www.loc.gov/item/45041006/",
      },
      {
        title: "Cepheids in Spiral Nebulae (Andromeda Galaxy Discovery)",
        organization: "Edwin Hubble (1925) / The Observatory",
        url: "https://ui.adsabs.harvard.edu/abs/1925Obs....48..139H",
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
    subtitle:
      "From stellar evolution and Milkomeda to the Degenerate Era, Heat Death, and cosmic fate",
    description:
      "Journey across logarithmic timescales into deep cosmic time: explore the Sun's post-main-sequence evolution, the collision of galaxies, declining star formation, the 5 physical eras of Adams & Laughlin, and the thermodynamic fate of spacetime.",
    stageId: 5,
    recommendedOrder: 20,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Trace the Sun's modeled evolutionary stages from hydrogen exhaustion to red giant, helium flash, and white dwarf",
      "Analyze the long-term future of Earth, ocean desiccation, and the debate over orbital expansion vs tidal engulfment",
      "Simulate the dynamic coalescence of the Milky Way and Andromeda ('Milkomeda') and understand why stars rarely collide",
      "Relate stellar mass to main-sequence lifetime (t_ms ∝ M^(-2.5)) and observe the extinction sequence of stellar populations",
      "Interpret the Madau-Dickinson curve and the decline of cosmic star formation rates from Cosmic Noon to the end of starbursts",
      "Delineate the 5 cosmological eras of Adams & Laughlin: Stelliferous, Degenerate, Black Hole, and Dark Era",
      "Apply the Second Law of Thermodynamics (dS ≥ 0) and Helmholtz free energy to the concept of cosmic Heat Death",
      "Compare how dark energy equation of state w = P/ρ dictates cosmic destiny (Big Freeze vs Big Rip vs Big Crunch)",
    ],
    prerequisites: ["17", "18", "19"],
    route: "/learn?module=20",
    estimatedMinutes: 28,
    visualAssets: {
      iconName: "Clock",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
    scientificSources: [
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
        organization: "K.-P. Schröder & Robert Connon Smith / MNRAS (MNRAS 386, 155)",
        url: "https://academic.oup.com/mnras/article/386/1/155/1466396",
      },
      {
        title: "The M31 Velocity Vector: Orbital Evolution and Collision with the Milky Way",
        organization: "R. P. van der Marel et al. / The Astrophysical Journal (ApJ 753, 9)",
        url: "https://iopscience.iop.org/article/10.1088/0004-637X/753/1/9",
      },
      {
        title: "Phantom Energy and Cosmic Doomsday (The Big Rip)",
        organization:
          "R. R. Caldwell, M. Kamionkowski & N. N. Weinberg / Physical Review Letters (PRL 91, 071301)",
        url: "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.91.071301",
      },
    ],
    status: "ready",
    version: "1.0.0",
  },

  // STAGE 6: BECOME A SPACE SCIENTIST
  {
    id: "21",
    slug: "telescopes-and-how-we-discover-space",
    number: 21,
    title: "Telescopes & How We Discover Space",
    subtitle: "Refractors, reflectors, interferometry, and multi-wavelength space observatories",
    description:
      "Command a virtual observatory: test optical diffraction, manipulate wavelengths from radio to X-ray, decode stellar spectra, and master astronomical discovery.",
    stageId: 6,
    recommendedOrder: 21,
    difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
    learningObjectives: [
      "Understand why scientists build large telescope apertures: light-gathering buckets (LGP ∝ D²) and diffraction limits (θ ≈ 1.22 λ / D)",
      "Contrast refracting lenses and reflecting mirrors, explaining why Newton's catoptric design eliminates chromatic aberration",
      "Analyze atmospheric seeing turbulence, Fried coherence length r₀, and real-time Laser Guide Star Adaptive Optics",
      "Master multi-wavelength astronomy: radio 21-cm cold gas, infrared dust penetration, optical starlight, UV starbursts, and million-degree X-ray plasma",
      "Explore aperture synthesis interferometry (ALMA, VLA, EHT) and space observatories (Hubble, JWST, Chandra)",
      "Decode chemical elements, temperatures, and Doppler radial velocity shifts using astronomical spectroscopy",
    ],
    prerequisites: ["04"],
    route: "/learn?module=21",
    estimatedMinutes: 26,
    visualAssets: {
      iconName: "Search",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    scientificSources: [
      {
        title: "The James Webb Space Telescope Mission Overview & Optical Performance",
        organization: "JWST",
        url: "https://webb.nasa.gov/",
      },
      {
        title: "Hubble Space Telescope Science Instruments and Wavelength Handbooks",
        organization: "Hubble",
        url: "https://hubblesite.org/",
      },
      {
        title: "Chandra X-ray Observatory Science & Wolter Optics Architecture",
        organization: "Chandra",
        url: "https://chandra.harvard.edu/",
      },
      {
        title: "ALMA: The Atacama Large Millimeter/submillimeter Array Science Archive",
        organization: "ESA",
        url: "https://www.almaobservatory.org/",
      },
      {
        title: "Very Large Telescope (VLT) & Adaptive Optics Facility",
        organization: "ESO",
        url: "https://www.eso.org/public/teles-instr/paranal-observatory/vlt/",
      },
    ],
    status: "ready",
    version: "1.0.0",
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
