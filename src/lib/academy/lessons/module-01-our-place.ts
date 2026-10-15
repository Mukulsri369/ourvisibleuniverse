import type { LessonContract } from "../types";

export const MODULE_01_LESSON: LessonContract = {
  lessonId: "lesson-01-cosmic-address",
  moduleId: "01",
  title: "Our Place in the Universe",
  objectives: [
    "Identify your multi-tiered Cosmic Address in the universe",
    "Grasp the logarithmic zoom from Earth to the Cosmic Web",
    "Distinguish between planets, planetary systems, galaxies, and galaxy clusters",
  ],
  visualizationType: "cosmic-scale",
  interactions: [
    "Step-by-step cosmic scale zoom controller",
    "Interactive celestial body focus inspection",
    "Scale slider and light travel time calculator",
    "Drag-and-drop cosmic address sequencer",
  ],
  completionCriteria:
    "Complete the interactive scale zoom, test the speed-of-light experiment, and pass the knowledge check with at least 80%.",
  scientificSources: [
    {
      title: "NASA Solar System Exploration: Our Cosmic Address",
      organization: "NASA",
      url: "https://science.nasa.gov/solar-system/",
      note: "Standard astronomical hierarchical classification from planetary bodies to superclusters.",
    },
    {
      title: "The Scale of the Observable Universe",
      organization: "ESA",
      url: "https://www.cosmos.esa.int/",
      note: "Cosmological distance ladders and observable particle horizons.",
    },
    {
      title: "Observable Universe",
      organization: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Observable_universe",
      note: "Comprehensive overview of comoving distance and cosmic web structures.",
    },
  ],
  relatedConcepts: [
    "Light-Year",
    "Astronomical Unit (AU)",
    "Milky Way Galaxy",
    "Local Group",
    "Virgo Supercluster",
    "Laniakea",
    "Observable Universe",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Have you ever wondered what your address looks like if a friendly alien wants to send you a postcard from outer space?",
      coreConcepts: [
        "Earth is our home planet orbiting the Sun.",
        "The Sun is just one star among hundreds of billions in our star city, the Milky Way.",
        "Space is gigantic, and our planet is a precious blue jewel floating safely in it!",
      ],
      explanatoryText:
        "When you write a letter to a friend, you write your room, your house number, your street, and your city. But what if we zoom all the way up into the clouds and into space? Your city is on planet Earth! Earth is the 3rd planet spinning around the Sun. Together with Mars, Jupiter, and Saturn, we make up the Solar System. And guess what? Our Solar System lives inside an enormous swirling city of stars called the Milky Way galaxy!",
      mathExplanation:
        "Earth is about 12,740 kilometers across. If Earth were the size of a marble, the Sun would be a giant exercise ball 100 meters away!",
      quizQuestions: [
        {
          id: "q-jr-1",
          question: "What is the name of our home planet?",
          options: ["Mars", "Earth", "Jupiter", "Venus"],
          correctIndex: 1,
          explanation:
            "That's right! We all live together on planet Earth, the wonderful blue planet with oceans and air.",
        },
        {
          id: "q-jr-2",
          question: "Which star does planet Earth travel around?",
          options: ["Polaris (The North Star)", "The Sun", "Betelgeuse", "Sirius"],
          correctIndex: 1,
          explanation:
            "Spot on! The Sun is our very own star that gives us daylight, warm weather, and energy to grow plants.",
        },
        {
          id: "q-jr-3",
          question: "What do we call our giant city of stars?",
          options: ["The Milky Way", "The Solar Train", "The Starlight Room", "The Moon Base"],
          correctIndex: 0,
          explanation:
            "Fantastic! The Milky Way is a majestic spiral galaxy containing over 100 billion stars, including our Sun.",
        },
      ],
      funFacts: [
        "Light travels so fast it could circle Earth 7 times in a single second!",
        "It takes 8 minutes for sunlight to travel from the Sun to your eyes on Earth.",
        "If you held a grain of sand at arm's length against the sky, that tiny patch holds thousands of distant galaxies!",
      ],
    },
    explorer: {
      introHook:
        "If you had to send your cosmic coordinates to a deep-space probe, what would your full universal address be?",
      coreConcepts: [
        "Cosmic Address Hierarchy: Earth -> Solar System -> Orion Cygnus Arm -> Milky Way Galaxy -> Local Group -> Virgo Supercluster -> Laniakea -> Observable Universe.",
        "Distances in space are measured using Astronomical Units (AU) for solar systems and Light-Years for interstellar space.",
        "Our Sun orbits the galactic core once every ~230 million years in what astronomers call a Cosmic Year.",
      ],
      explanatoryText:
        "To pinpoint any location in the vast cosmos, astronomers use an 8-level hierarchical address. Earth is a terrestrial rocky planet situated 1 Astronomical Unit (150 million km) from the Sun. Our solar system lies along the inner edge of the Orion-Cygnus spiral arm, approximately 26,000 light-years from the supermassive black hole at the center of the Milky Way. Our galaxy belongs to the Local Group—a gravitational neighborhood of about 80 galaxies—which in turn forms part of the gargantuan Laniakea Supercluster spanning 520 million light-years.",
      depthNotes:
        "The Local Group is dominated by two massive spiral giants: our Milky Way and the Andromeda Galaxy (M31), along with dozens of dwarf satellite galaxies.",
      mathExplanation:
        "1 Astronomical Unit (AU) = 1.496 x 10^8 km. 1 Light-Year = 9.46 x 10^12 km. The observable universe has a diameter of roughly 93 billion light-years.",
      quizQuestions: [
        {
          id: "q-ex-1",
          question: "In which spiral arm of the Milky Way galaxy does our Solar System reside?",
          options: ["Perseus Arm", "Scutum-Centaurus Arm", "Orion-Cygnus Arm", "Norma Arm"],
          correctIndex: 2,
          explanation:
            "Correct! Our Sun and all its planets orbit inside the Orion-Cygnus spur, nestled between the Sagittarius and Perseus arms.",
        },
        {
          id: "q-ex-2",
          question: "What is the largest galaxy in our Local Group neighborhood?",
          options: [
            "Triangulum Galaxy",
            "Andromeda Galaxy (M31)",
            "Milky Way Galaxy",
            "Large Magellanic Cloud",
          ],
          correctIndex: 1,
          explanation:
            "Exact! The Andromeda Galaxy is the largest member of our Local Group, spanning about 220,000 light-years across.",
        },
        {
          id: "q-ex-3",
          question:
            "What massive supercluster contains our Local Group and over 100,000 other galaxies?",
          options: [
            "Laniakea Supercluster",
            "Coma Cluster",
            "Bootes Void",
            "Perseus-Pisces Supercluster",
          ],
          correctIndex: 0,
          explanation:
            "Awesome! Laniakea (meaning 'immense heaven' in Hawaiian) was mapped in 2014 by tracing gravitational velocity flows.",
        },
      ],
      funFacts: [
        "The last time our Solar System was in this exact spot in the Milky Way, early dinosaurs were just beginning to walk on Earth!",
        "Voyager 1, traveling at 61,000 km/h since 1977, is still less than 1 light-day away from Earth.",
        "The observable universe contains an estimated 2 trillion galaxies.",
      ],
    },
    astronomer: {
      introHook:
        "How do cosmologists bridge 41 orders of physical magnitude from the subatomic Planck scale to the 93-billion-light-year cosmological particle horizon?",
      coreConcepts: [
        "Metric scaling across logarithmic decades (10^7 m planetary diameter to 10^26 m cosmological horizon).",
        "Gravitational binding thresholds: from gravitationally bound structures (Local Group) to Hubble-flow-dominated isotropic expansion.",
        "The Cosmic Web topology: dense nodes, dark matter filaments, sheets, and cosmological voids (e.g., KBC Void, Boötes Void).",
      ],
      explanatoryText:
        "Our location in the universe can be formally defined across fundamental cosmological structures. Earth (radius ~6,371 km) is gravitationally bound in a heliocentric orbit (semi-major axis ~1.000 AU, eccentricity 0.0167). The Sun orbits Sagittarius A* at ~8.2 kpc with a circular velocity of ~220 km/s. The Milky Way (baryonic mass ~10^11 M_sun, halo mass ~10^12 M_sun) is virialized within the Local Group (diameter ~3 Mpc). Beyond the Local Group, universal metric expansion (H0 ~ 70 km/s/Mpc) overcomes local gravitation, driving structures toward the cosmic filamentary web with a particle horizon currently measured at comoving radius R ~ 46.5 billion light-years.",
      depthNotes:
        "The Great Attractor, located in the Direction of Centaurus, pulls both the Milky Way and surrounding galaxies toward a gravitational basin of attraction at the core of the Laniakea Supercluster.",
      mathExplanation:
        "Logarithmic scale comparison: Earth diameter ~1.27 x 10^7 m. Solar System to Kuiper Belt ~1.5 x 10^13 m (100 AU). Milky Way diameter ~1.0 x 10^21 m (100 kly). Observable universe horizon ~8.8 x 10^26 m (93 Gly). Total dynamic span: ~10^20 spatial scale factors.",
      quizQuestions: [
        {
          id: "q-ast-1",
          question:
            "At what structural scale does gravitational binding give way to metric spacetime expansion (Hubble flow)?",
          options: [
            "Within planetary star systems (<0.1 pc)",
            "Between stars in galactic disks (<10 kpc)",
            "Beyond galaxy groups and clusters (>3 to 5 Mpc)",
            "Only at the edge of the observable horizon (>10 Gpc)",
          ],
          correctIndex: 2,
          explanation:
            "Precisely! Within galaxy clusters and groups (like the Local Group), local gravity easily overcomes the cosmic expansion. Metric expansion dominates at scales exceeding ~3–5 Mpc.",
        },
        {
          id: "q-ast-2",
          question:
            "What is the approximate comoving radius of the observable universe from Earth?",
          options: [
            "13.8 billion light-years",
            "46.5 billion light-years",
            "93 billion light-years",
            "100 trillion kilometers",
          ],
          correctIndex: 1,
          explanation:
            "Correct! Because space has been expanding for 13.8 billion years, light emitted long ago now originates from objects currently ~46.5 billion light-years away (giving a full diameter of ~93 billion light-years).",
        },
        {
          id: "q-ast-3",
          question:
            "What gravitational anomaly acts as the gravitational basin of attraction for the Laniakea Supercluster?",
          options: [
            "The Boötes Void",
            "The Great Attractor / Norma Cluster",
            "Sagittarius A*",
            "The Crab Pulsar",
          ],
          correctIndex: 1,
          explanation:
            "Spot on! The Great Attractor is a gravitational focal point in the direction of Hydra and Centaurus toward which our galaxy and thousands of others are streaming at ~600 km/s.",
        },
      ],
      funFacts: [
        "Due to cosmic expansion, the light emitted by the most distant observable galaxies was emitted when those galaxies were only a few billion light-years away from our proto-Milky Way.",
        "Over 99.999999999999% of the volume of the observable universe is absolute vacuum.",
        "The Cosmic Microwave Background confirms our peculiar motion through space is 369 km/s relative to the cosmic rest frame.",
      ],
    },
  },
};

export const COSMIC_ADDRESS_STEPS = [
  {
    step: 1,
    name: "Earth",
    scale: "12,742 km",
    scaleExponent: 7,
    description:
      "Our blue terrestrial world with liquid water oceans and a protective nitrogen-oxygen atmosphere.",
    icon: "🌍",
    tag: "Home Planet",
  },
  {
    step: 2,
    name: "Solar System",
    scale: "287 billion km (100 AU)",
    scaleExponent: 13,
    description:
      "The Sun, 8 major planets, dwarf worlds, and the trillions of icy bodies in the Kuiper Belt.",
    icon: "🪐",
    tag: "Star System",
  },
  {
    step: 3,
    name: "Solar Interstellar Neighborhood",
    scale: "60 light-years",
    scaleExponent: 17,
    description:
      "Nearby star systems including Alpha Centauri, Sirius, Procyon, and Vega within the local interstellar cloud.",
    icon: "✨",
    tag: "Stellar Cloud",
  },
  {
    step: 4,
    name: "Milky Way Galaxy",
    scale: "100,000 light-years",
    scaleExponent: 21,
    description:
      "Barred spiral galaxy with 100–400 billion stars orbiting Sagittarius A* in the galactic core.",
    icon: "🌀",
    tag: "Host Galaxy",
  },
  {
    step: 5,
    name: "The Local Group",
    scale: "10 million light-years (3 Mpc)",
    scaleExponent: 23,
    description:
      "Gravitational cluster dominated by the Milky Way and Andromeda, plus 80+ satellite dwarf galaxies.",
    icon: "🌌",
    tag: "Galaxy Group",
  },
  {
    step: 6,
    name: "Virgo Supercluster",
    scale: "110 million light-years",
    scaleExponent: 24,
    description:
      "Massive congregation containing 100 galaxy groups and clusters, anchored by giant elliptical galaxy M87.",
    icon: "🕸️",
    tag: "Supercluster",
  },
  {
    step: 7,
    name: "Laniakea Supercluster",
    scale: "520 million light-years",
    scaleExponent: 25,
    description: "Immense cosmic watershed of 100,000 galaxies flowing toward the Great Attractor.",
    icon: "🌊",
    tag: "Cosmic Basin",
  },
  {
    step: 8,
    name: "The Observable Universe",
    scale: "93 billion light-years (28.5 Gpc)",
    scaleExponent: 26,
    description:
      "The entire sphere of space from which light has had time to reach Earth since the Big Bang.",
    icon: "🔮",
    tag: "Cosmic Horizon",
  },
];
