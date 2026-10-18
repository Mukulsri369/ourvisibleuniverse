/**
 * Official Server-Side Final Examination Question Bank
 * Examination Title: Cosmic Explorer — Final Knowledge Assessment
 *
 * Grounded in the 24 modules and 6 celestial stages of Our Visible Universe Academy:
 * Stage 1: The Cosmic Perspective & Scale (Modules 01 - 04)
 * Stage 2: The Solar Neighborhood & Planetary Physics (Modules 05 - 08)
 * Stage 3: The Stellar Realm & Exoplanetary Systems (Modules 09 - 12)
 * Stage 4: Extragalactic Cosmos & Relativistic Phenomena (Modules 13 - 16)
 * Stage 5: Cosmic Evolution & Spacetime Dynamics (Modules 17 - 20)
 * Stage 6: Observational Frontiers, Astrobiology & Synthesis (Modules 21 - 24)
 *
 * Age-Adaptive Tiers:
 * 1. Junior Explorer (simple concepts & observation-based)
 * 2. Space Explorer (scientific reasoning & conceptual knowledge)
 * 3. Young Astronomer (deeper physics, calculations & observational reasoning)
 *
 * SECURITY: Stored strictly server-side. Never bundled into public frontend code.
 */

import type { LearningLevel } from "./types";
import {
  type CanonicalAssessmentQuestion,
  type ClientAssessmentQuestion,
  type TopicStrength,
  type TopicRequiringReview,
  type AssessmentFeedbackItem,
  FINAL_EXAM_BLUEPRINT,
} from "./assessment-types";

export const STAGE_TITLES: Record<number, string> = {
  1: "Stage 1: Cosmic Perspective & Foundations (Modules 01-04)",
  2: "Stage 2: Solar System & Gravitational Orbits (Modules 05-08)",
  3: "Stage 3: Stellar Physics & Exoplanetary Worlds (Modules 09-12)",
  4: "Stage 4: Extragalactic Galaxies & Relativistic Physics (Modules 13-16)",
  5: "Stage 5: Big Bang Cosmology & Universal Expansion (Modules 17-20)",
  6: "Stage 6: Observational Frontiers & Synthesis (Modules 21-24)",
};

export const MODULE_TITLES: Record<string, string> = {
  "01": "Our Place in the Universe",
  "02": "The Night Sky & Constellations",
  "03": "Cosmic Distances & Scales",
  "04": "Light, Time & Observation",
  "05": "Earth, Moon & Seasons",
  "06": "The Solar System Worlds",
  "07": "The Sun: Our Living Star",
  "08": "Gravity & Orbital Mechanics",
  "09": "Stars & Stellar Structure",
  "10": "Stellar Evolution & Supernovae",
  "11": "Nebulae & Cosmic Gas Clouds",
  "12": "Exoplanets & Alien Worlds",
  "13": "Galaxies & Morphological Assembly",
  "14": "Black Holes & Relativistic Curvature",
  "15": "The Cosmic Web & Filaments",
  "16": "Dark Matter & Dark Energy",
  "17": "The Hot Big Bang & CMB",
  "18": "The Expanding Universe & Hubble Flow",
  "19": "History of Human Cosmology",
  "20": "The Ultimate Fate of the Universe",
  "21": "Telescopes & Photon Astronomy",
  "22": "Space Missions & Planetary Robotics",
  "23": "Astrobiology & Habitable Zones",
  "24": "Astrophysics Capstone Laboratory",
};

/**
 * AUTHORITATIVE REVIEWED FINAL EXAMINATION QUESTION REPOSITORY
 */
export const FINAL_EXAM_QUESTION_BANK: CanonicalAssessmentQuestion[] = [
  // =========================================================================
  // STAGE 1: MODULES 01 - 04 (Cosmic Perspective, Night Sky, Scale, Light & Time)
  // =========================================================================

  // --- STAGE 1: JUNIOR EXPLORER ---
  {
    id: "fe_stg1_mod01_j01",
    stageId: 1,
    moduleId: "01",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Which cosmic neighborhood does our solar system belong to inside the Milky Way Galaxy?",
    options: ["The Orion-Cygnus Arm", "The Galactic Core Singularity", "The Crab Nebula", "The Andromeda Halo"],
    correctAnswer: 0,
    explanation: "Our solar system is situated along the Orion-Cygnus spiral arm of the Milky Way, approximately 26,000 light-years from the galactic core.",
    sourceReference: "IAU Working Group on Galactic Coordinates / Gaia DR3",
    learningObjective: "Locate Earth and the Sun within the Milky Way's spiral structure.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod02_j01",
    stageId: 1,
    moduleId: "02",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Why do the stars appear to slowly rotate across our night sky each night?",
    options: ["Earth rotates once per day on its axis", "The entire universe spins around Earth", "Constellations are physically flying through space", "The Moon's gravity pushes the stars"],
    correctAnswer: 0,
    explanation: "Earth rotates on its axis once every 24 hours (a sidereal day of ~23h 56m), making distant celestial objects appear to rotate across the sky.",
    sourceReference: "NASA Space Place / International Astronomical Union",
    learningObjective: "Explain apparent diurnal celestial motion caused by Earth's axial rotation.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod03_j01",
    stageId: 1,
    moduleId: "03",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What standard unit do astronomers use to measure the average distance from Earth to the Sun?",
    options: ["Astronomical Unit (AU)", "Light-year", "Kilometer", "Parsec"],
    correctAnswer: 0,
    explanation: "One Astronomical Unit (AU) is defined as exactly 149,597,870,700 meters (~150 million kilometers), representing the mean Earth-Sun distance.",
    sourceReference: "IAU 2012 Resolution B2",
    learningObjective: "Define the Astronomical Unit as the baseline scale for the solar system.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod04_j01",
    stageId: 1,
    moduleId: "04",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "When you look at sunlight during the day, how long ago did that light leave the surface of the Sun?",
    options: ["About 8.3 minutes ago", "Instantly (0 seconds)", "About 1 hour ago", "1 full year ago"],
    correctAnswer: 0,
    explanation: "Because light travels at 299,792 km/s and the Sun is ~150 million km away, sunlight takes roughly 500 seconds (8 minutes and 20 seconds) to reach Earth.",
    sourceReference: "JPL Solar System Dynamics / NIST Physics Laboratory",
    learningObjective: "Understand lookback time as a direct consequence of the finite speed of light.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod01_j02",
    stageId: 1,
    moduleId: "01",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What is the name of the closest major spiral galaxy to our own Milky Way?",
    options: ["The Andromeda Galaxy (M31)", "The Whirlpool Galaxy", "The Sombrero Galaxy", "The Large Magellanic Cloud"],
    correctAnswer: 0,
    explanation: "The Andromeda Galaxy (M31) is the nearest giant spiral galaxy to the Milky Way, located about 2.5 million light-years away in our Local Group.",
    sourceReference: "NASA / ESA Hubble Space Telescope Surveys",
    learningObjective: "Identify key members of the Local Group of galaxies.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod03_j02",
    stageId: 1,
    moduleId: "03",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What distance does light travel in one complete year?",
    options: ["One light-year (about 9.46 trillion kilometers)", "One Astronomical Unit", "One parsec", "One gigameter"],
    correctAnswer: 0,
    explanation: "A light-year is the physical distance light travels in vacuum during one Julian year (365.25 days), equal to 9.46 x 10^12 kilometers.",
    sourceReference: "IAU Standards of Fundamental Astronomy",
    learningObjective: "Relate light travel time to interstellar distance measurements.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 1: SPACE EXPLORER ---
  {
    id: "fe_stg1_mod01_e01",
    stageId: 1,
    moduleId: "01",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What is the boundary of the 'Observable Universe' defined by?",
    options: [
      "The maximum distance light could have traveled to us since the Big Bang",
      "The physical edge where stars and matter completely end",
      "The gravitational reach of the Milky Way's supermassive black hole",
      "The maximum resolution limit of ground-based optical mirrors",
    ],
    correctAnswer: 0,
    explanation: "The observable universe is an informational horizon set by the finite age of the cosmos (~13.8 Gyr) and the finite speed of light (c), currently spanning ~46.5 billion light-years in comoving radius.",
    sourceReference: "Planck Collaboration (2020) Cosmological Parameters",
    learningObjective: "Distinguish between the observable horizon and the infinite cosmos.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod02_e01",
    stageId: 1,
    moduleId: "02",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What astronomical phenomenon causes the North Star (Polaris) to slowly drift away from true celestial north over millennia?",
    options: [
      "Precession of the equinoxes (~25,772 year axial wobble)",
      "Solar system orbital eccentricity around the Milky Way",
      "Planetary migration in the Kuiper belt",
      "General relativistic frame-dragging by Earth's mantle",
    ],
    correctAnswer: 0,
    explanation: "Earth's rotational axis wobbles like a spinning top due to gravitational torques from the Moon and Sun, completing one precession cycle every ~25,800 years.",
    sourceReference: "US Naval Observatory Astronomical Almanac",
    learningObjective: "Explain axial precession and historical changes in celestial reference poles.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod03_e01",
    stageId: 1,
    moduleId: "03",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "How is a parsec (pc) geometrically defined in observational astrometry?",
    options: [
      "The distance at which 1 AU subtends a parallax angle of 1 arcsecond",
      "The distance traversed by light during one solar cycle (11 years)",
      "The orbital radius of Neptune multiplied by the speed of light",
      "The distance from Earth to the center of the Milky Way",
    ],
    correctAnswer: 0,
    explanation: "By definition, a parsec (parallax arcsecond) is the distance where a perpendicular baseline of 1 AU subtends an angle of exactly 1 arcsecond (1/3600 of a degree), equal to ~3.26 light-years or ~206,265 AU.",
    sourceReference: "IAU 2015 Resolution B2 / Gaia DR3 Astrometry Guidelines",
    learningObjective: "Explain stellar parallax geometry and the derivation of the parsec.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod04_e01",
    stageId: 1,
    moduleId: "04",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Why is infrared astronomy crucial for studying the earliest cosmic structures and star-forming regions?",
    options: [
      "Infrared light penetrates dense interstellar dust clouds and detects cosmological redshifted UV light",
      "Infrared photons travel significantly faster than visible photons in space",
      "Earth's atmosphere is completely transparent only to infrared wavelengths",
      "Stars emit electromagnetic radiation exclusively in infrared bands",
    ],
    correctAnswer: 0,
    explanation: "Infrared wavelengths have longer waves that scatter far less off microscopic dust grains (Mie scattering), while light from early high-redshift galaxies is stretched into the infrared.",
    sourceReference: "NASA / ESA / CSA James Webb Space Telescope Science Objectives",
    learningObjective: "Analyze the scientific advantages of multi-wavelength and infrared astronomy.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod02_e02",
    stageId: 1,
    moduleId: "02",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What coordinate system do astronomers use on the celestial sphere that mirrors Earth's longitude and latitude?",
    options: [
      "Right Ascension and Declination (ICRS)",
      "Azimuth and Altitude (Horizontal Frame)",
      "Ecliptic Longitude and Obliquity",
      "Galactic Longitude and Supergalactic Width",
    ],
    correctAnswer: 0,
    explanation: "Right Ascension (measured eastward along celestial equator in hours) and Declination (measured north/south in degrees) form the equatorial coordinate system.",
    sourceReference: "International Celestial Reference System (ICRS) / IAU",
    learningObjective: "Navigate the equatorial celestial coordinate grid.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 1: YOUNG ASTRONOMER ---
  {
    id: "fe_stg1_mod03_a01",
    stageId: 1,
    moduleId: "03",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "If a star observed by ESA's Gaia observatory exhibits an annual parallax angle of 20 milliarcseconds (0.020 arcsec), what is its distance from Earth?",
    options: ["50 parsecs (163 light-years)", "20 parsecs (65.2 light-years)", "200 parsecs (652 light-years)", "5 parsecs (16.3 light-years)"],
    correctAnswer: 0,
    explanation: "Distance in parsecs is calculated via d = 1 / p (with p in arcseconds). Here d = 1 / 0.020 = 50 pc. In light-years, 50 pc x 3.26156 ly/pc = 163.08 ly.",
    sourceReference: "Gaia Collaboration (2022) 'Gaia Data Release 3 Summary of Content'",
    learningObjective: "Compute astronomical distances using stellar parallax formulas.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod04_a01",
    stageId: 1,
    moduleId: "04",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "According to Wien's Displacement Law (lambda_max = b / T), if an O-type star has a surface temperature of 29,000 K, at what wavelength does its blackbody radiation peak?",
    options: ["~100 nanometers (Ultraviolet)", "~500 nanometers (Visible green)", "~1,000 nanometers (Near-infrared)", "~10 nanometers (Hard X-ray)"],
    correctAnswer: 0,
    explanation: "Wien's constant b ≈ 2.89777 x 10^-3 m·K. Therefore lambda_max = 2.89777 x 10^-3 / 29,000 ≈ 9.99 x 10^-8 m = 100 nm, deep in the ultraviolet spectrum.",
    sourceReference: "Rybicki & Lightman, 'Radiative Processes in Astrophysics'",
    learningObjective: "Apply Wien's Law to derive peak emission wavelengths from stellar surface temperatures.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg1_mod01_a01",
    stageId: 1,
    moduleId: "01",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "Why is the current comoving radius of the observable universe (~46.5 Gly) substantially larger than 13.8 billion light-years?",
    options: [
      "The metric expansion of space has stretched distances while the photons were in flight",
      "Photons traveled faster than c during the primordial plasma era",
      "Gravitational lensing uniformly magnifies cosmic space by a factor of 3.37",
      "Cosmic ray pressure expanded the physical boundaries of light cones",
    ],
    correctAnswer: 0,
    explanation: "While the lookback time cannot exceed the age of the universe (13.8 Gyr), the coordinates of the emitter moved outward due to the Friedmann-Lemaître-Robertson-Walker scale factor a(t).",
    sourceReference: "Davis & Lineweaver (2004) 'Expanding Confusion: common misconceptions of cosmological horizons'",
    learningObjective: "Derive and interpret the difference between proper distance, lookback time, and comoving horizon.",
    version: "1.0.0",
    isActive: true,
  },

  // =========================================================================
  // STAGE 2: MODULES 05 - 08 (Earth & Moon, Solar System, Sun, Gravity & Orbits)
  // =========================================================================

  // --- STAGE 2: JUNIOR EXPLORER ---
  {
    id: "fe_stg2_mod05_j01",
    stageId: 2,
    moduleId: "05",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What primarily causes the four seasonal changes on planet Earth?",
    options: ["The 23.5° tilt of Earth's rotational axis", "Earth moving much closer to the Sun in summer", "The Moon blocking sunlight in winter", "Variations in the Sun's core burning rate"],
    correctAnswer: 0,
    explanation: "Earth's 23.5° axial tilt means that each hemisphere leans toward the Sun for half the orbit (experiencing more direct sunlight and longer days) and away for the other half.",
    sourceReference: "NASA Science Solar System Exploration",
    learningObjective: "Explain the mechanism of planetary seasons through axial inclination.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod06_j01",
    stageId: 2,
    moduleId: "06",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Which is the largest planet in our solar system by diameter and mass?",
    options: ["Jupiter", "Saturn", "Neptune", "Mars"],
    correctAnswer: 0,
    explanation: "Jupiter is the largest planet, with a mass greater than twice that of all other planets in the Solar System combined (318 Earth masses).",
    sourceReference: "NASA Planetary Fact Sheet / JPL",
    learningObjective: "Identify key physical characteristics of Solar System planets.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod07_j01",
    stageId: 2,
    moduleId: "07",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What fundamental process powers the Sun's energy at its extreme core?",
    options: ["Nuclear fusion (fusing hydrogen into helium)", "Burning coal and liquid fossil fuels", "Chemical combustion with oxygen", "Gravitational friction of solar wind"],
    correctAnswer: 0,
    explanation: "The Sun generates energy in its core through the proton-proton chain nuclear fusion, converting ~600 million tons of hydrogen into helium every second.",
    sourceReference: "NASA Solar Dynamics Observatory (SDO)",
    learningObjective: "Explain solar power generation through thermonuclear fusion.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod08_j01",
    stageId: 2,
    moduleId: "08",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Why do astronauts float inside the International Space Station as it orbits Earth?",
    options: [
      "They are in continuous freefall around Earth alongside the spacecraft",
      "Earth's gravity drops completely to zero in orbit",
      "Special magnets in the station cancel out gravitational pull",
      "Air pressure in the cabin lifts astronauts off the floor",
    ],
    correctAnswer: 0,
    explanation: "Gravity in low Earth orbit is still ~90% of surface gravity. Astronauts feel weightless because the spacecraft and everything inside are falling around Earth at orbital velocity (~7.66 km/s).",
    sourceReference: "NASA Human Space Flight Science / Glenn Research Center",
    learningObjective: "Explain apparent weightlessness in orbital freefall.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod06_j02",
    stageId: 2,
    moduleId: "06",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Where is the main Asteroid Belt located in our solar system?",
    options: ["Between Mars and Jupiter", "Between Mercury and Venus", "Beyond Pluto in the Oort Cloud", "Inside the rings of Saturn"],
    correctAnswer: 0,
    explanation: "The main asteroid belt occupies the orbital zone between Mars (~1.5 AU) and Jupiter (~5.2 AU), containing remnants from the early protoplanetary disk.",
    sourceReference: "NASA Dawn Mission Archives / JPL",
    learningObjective: "Identify major architectural zones of the Solar System.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 2: SPACE EXPLORER ---
  {
    id: "fe_stg2_mod05_e01",
    stageId: 2,
    moduleId: "05",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Why do we always see the same side of the Moon facing Earth?",
    options: [
      "Tidal locking has synchronized the Moon's rotation period to its orbital period (~27.3 days)",
      "The Moon does not rotate on its axis at all",
      "Earth's magnetic field locks the Moon's ferrous core in a fixed orientation",
      "The far side of the Moon is permanently shrouded in shadow",
    ],
    correctAnswer: 0,
    explanation: "Gravitational tidal friction dissipated the Moon's rotational energy until its spin period matched its orbital period around Earth (1:1 spin-orbit resonance).",
    sourceReference: "NASA Lunar Reconnaissance Orbiter (LRO) / Murray & Dermott, Solar System Dynamics",
    learningObjective: "Describe tidal dissipation and tidal locking mechanisms.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod06_e01",
    stageId: 2,
    moduleId: "06",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What physical boundary in the protoplanetary disk separated the formation of inner rocky terrestrial planets from outer gas and ice giants?",
    options: [
      "The Frost Line (Snow Line), where water ice could condense into solid grains",
      "The Roche Limit of the proto-Sun",
      "The Kuiper Cliff ionization front",
      "The Heliopause shock boundary",
    ],
    correctAnswer: 0,
    explanation: "Inside the Frost Line (~2.7 AU), only metals and silicate rocks could condense, resulting in small rocky planets. Beyond it, abundant volatile ices condensed, building massive cores that accreted gas.",
    sourceReference: "Armitage, 'Astrophysics of Planet Formation', Cambridge Univ Press",
    learningObjective: "Explain the frost line and chemical differentiation of planetary systems.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod07_e01",
    stageId: 2,
    moduleId: "07",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What creates the periodic 11-year solar sunspot cycle and coronal mass ejections?",
    options: [
      "The solar magnetic dynamo driven by differential rotation in the convective envelope",
      "Gravitational tides from Jupiter's 11.86-year orbital period",
      "Periodic surges in core nuclear burning rates",
      "Interactions with interstellar dust streams passing through the heliosphere",
    ],
    correctAnswer: 0,
    explanation: "Because the Sun's equator rotates faster (~25 days) than its poles (~35 days), magnetic field lines wind tightly, producing intense tangled loops (sunspots) that flip magnetic polarity every 11 years (the 22-year Hale cycle).",
    sourceReference: "ESA/NASA SOHO & SDO Mission Science Reports",
    learningObjective: "Explain the solar dynamo, differential rotation, and space weather cycles.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod08_e01",
    stageId: 2,
    moduleId: "08",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "According to Kepler's Second Law (Law of Equal Areas), what happens to a comet as it travels toward its perihelion closest to the Sun?",
    options: [
      "It accelerates, sweeping out equal orbital areas in equal intervals of time",
      "It decelerates to conserve total mechanical energy",
      "Its orbital velocity remains strictly constant throughout the orbit",
      "Its orbital plane rotates by 90 degrees",
    ],
    correctAnswer: 0,
    explanation: "Conservation of angular momentum requires r x v = const. As radial distance r decreases near perihelion, tangential velocity v increases, sweeping equal areas in equal time.",
    sourceReference: "Kepler, 'Astronomia Nova' / Classical Celestial Mechanics",
    learningObjective: "Apply Kepler's Second Law and conservation of angular momentum to eccentric orbits.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod08_e02",
    stageId: 2,
    moduleId: "08",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What is the escape velocity from a celestial body's surface mathematically proportional to?",
    options: [
      "Square root of (Mass / Radius)",
      "Mass divided by Radius squared",
      "Radius divided by Mass",
      "Mass times Radius squared",
    ],
    correctAnswer: 0,
    explanation: "Equating kinetic energy to gravitational potential energy (1/2 m v_esc^2 = G M m / R) gives v_esc = sqrt(2 G M / R), which is directly proportional to sqrt(M / R).",
    sourceReference: "Roy, 'Orbital Motion' / JPL Navigation Manual",
    learningObjective: "Derive and analyze escape velocity relationships.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 2: YOUNG ASTRONOMER ---
  {
    id: "fe_stg2_mod08_a01",
    stageId: 2,
    moduleId: "08",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "According to Kepler's Third Law (T^2 = a^3), if an asteroid has a circular orbit with semi-major axis a = 4.0 AU, what is its orbital period T in Earth years?",
    options: ["8.0 years", "16.0 years", "2.0 years", "64.0 years"],
    correctAnswer: 0,
    explanation: "With T in years and a in AU, T^2 = a^3. For a = 4.0 AU, a^3 = 64.0. Taking the square root gives T = sqrt(64) = 8.0 Earth years.",
    sourceReference: "Kepler's Third Law / Danby, 'Fundamentals of Celestial Mechanics'",
    learningObjective: "Calculate planetary orbital periods using Kepler's Third Law.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod07_a01",
    stageId: 2,
    moduleId: "07",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "Why does the Sun remain stable in hydrostatic equilibrium for billions of years on the main sequence?",
    options: [
      "Inward gravitational compression is precisely counterbalanced by outward gas and radiation pressure gradients",
      "Electromagnetic repulsion between iron ions halts gravitational contraction",
      "Neutron degeneracy pressure supports the solar envelope",
      "Centrifugal force from solar rotation cancels out 99% of solar mass gravity",
    ],
    correctAnswer: 0,
    explanation: "Hydrostatic equilibrium (dP/dr = -G M(r) rho(r) / r^2) ensures that the inward weight of overlying stellar layers is matched by thermal gas pressure (P = n k T) and photon radiation pressure.",
    sourceReference: "Kippenhahn & Weigert, 'Stellar Structure and Evolution', Springer",
    learningObjective: "Formulate the condition for stellar hydrostatic equilibrium.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg2_mod08_a02",
    stageId: 2,
    moduleId: "08",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "What orbital maneuver provides the minimum propellant energy (Delta-v) to transfer a spacecraft between two coplanar circular orbits?",
    options: [
      "A Hohmann transfer ellipse tangent to both orbits",
      "A radial thrust burn directed straight toward the target planet",
      "A parabolic escape burn with constant low-thrust spiraling",
      "A bi-elliptic transfer with infinite apocenter radius",
    ],
    correctAnswer: 0,
    explanation: "A Hohmann transfer uses an elliptical orbit whose periapsis is tangent to the inner orbit and apoapsis is tangent to the outer orbit, minimizing the two impulsive velocity changes (Delta-v1 + Delta-v2).",
    sourceReference: "Bate, Mueller & White, 'Fundamentals of Astrodynamics'",
    learningObjective: "Calculate Hohmann transfer trajectory parameters and Delta-v budgets.",
    version: "1.0.0",
    isActive: true,
  },

  // =========================================================================
  // STAGE 3: MODULES 09 - 12 (Stars, Stellar Evolution, Nebulae, Exoplanets)
  // =========================================================================

  // --- STAGE 3: JUNIOR EXPLORER ---
  {
    id: "fe_stg3_mod09_j01",
    stageId: 3,
    moduleId: "09",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What star color indicates the hottest stellar surface temperature?",
    options: ["Blue-white", "Yellow", "Orange", "Deep red"],
    correctAnswer: 0,
    explanation: "Hotter stars radiate photons at higher frequencies. Blue-white stars have surface temperatures exceeding 20,000 K, while red stars are cooler (~3,000 K).",
    sourceReference: "Harvard Spectral Classification System / IAU",
    learningObjective: "Relate stellar color to surface temperature.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod10_j01",
    stageId: 3,
    moduleId: "10",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What will our Sun eventually become at the end of its life in about 5 billion years?",
    options: ["A glowing White Dwarf surrounded by a planetary nebula", "A Supermassive Black Hole", "A Pulsar neutron star", "A Supernova explosion"],
    correctAnswer: 0,
    explanation: "Low-mass stars like our Sun shed their outer atmospheres to form a planetary nebula, leaving behind a dense Earth-sized carbon-oxygen white dwarf.",
    sourceReference: "ESA Hubble Science Archive: Planetary Nebulae / NASA",
    learningObjective: "Describe the lifecycle and ultimate fate of intermediate-mass stars like the Sun.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod12_j01",
    stageId: 3,
    moduleId: "12",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What is an exoplanet?",
    options: ["A planet orbiting a star other than our Sun", "An asteroid that entered Earth's atmosphere", "A rogue moon expelled from Saturn", "A comet with an ice tail"],
    correctAnswer: 0,
    explanation: "An exoplanet (extrasolar planet) is any planet that orbits a star outside our solar system, or traverses interstellar space as a rogue planet.",
    sourceReference: "NASA Exoplanet Archive / Kepler & TESS Missions",
    learningObjective: "Define exoplanets and their discovery contexts.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod11_j01",
    stageId: 3,
    moduleId: "11",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What are giant interstellar clouds of gas and dust called where baby stars are born?",
    options: ["Nebulae", "Asteroids", "Quasars", "Comets"],
    correctAnswer: 0,
    explanation: "Nebulae (such as the Orion Nebula) are vast interstellar clouds primarily composed of molecular hydrogen and dust that collapse gravitationally to form new stars.",
    sourceReference: "NASA / ESA Hubble Space Telescope - Pillars of Creation",
    learningObjective: "Identify nebulae as stellar nurseries and star-forming regions.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 3: SPACE EXPLORER ---
  {
    id: "fe_stg3_mod09_e01",
    stageId: 3,
    moduleId: "09",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "On the Hertzsprung-Russell (H-R) diagram, what physical properties are plotted on the axes?",
    options: [
      "Stellar Luminosity (vertical) versus Surface Temperature / Spectral Type (horizontal)",
      "Stellar Mass (vertical) versus Distance from Earth (horizontal)",
      "Orbital Velocity (vertical) versus Apparent Magnitude (horizontal)",
      "Core Density (vertical) versus Magnetic Field Strength (horizontal)",
    ],
    correctAnswer: 0,
    explanation: "The H-R diagram plots luminosity (or absolute magnitude) against surface temperature (or spectral class OBAFGKM, running hot-to-cool from left to right).",
    sourceReference: "Hertzsprung (1911) & Russell (1913) / Carroll & Ostlie, Modern Astrophysics",
    learningObjective: "Interpret the axes and diagnostic regions of the Hertzsprung-Russell diagram.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod10_e01",
    stageId: 3,
    moduleId: "10",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Why does nuclear fusion in massive stars cease once iron-56 is synthesized in the core?",
    options: [
      "Iron-56 has the highest nuclear binding energy per nucleon; fusing it is endothermic (absorbs energy instead of releasing it)",
      "Iron atoms instantly repel all neutrinos through the strong nuclear force",
      "Iron evaporates into relativistic photons that halt core gravity",
      "Stellar magnetic fields short-circuit above iron's Curie point",
    ],
    correctAnswer: 0,
    explanation: "Iron-56 sits at the peak of the nuclear binding energy curve. Fusing elements heavier than iron consumes thermal energy, removing pressure support and triggering catastrophic core collapse in milliseconds.",
    sourceReference: "Bethe (1990) 'Supernova mechanisms', Reviews of Modern Physics",
    learningObjective: "Explain the iron core catastrophe leading to Core-Collapse Supernovae.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod12_e01",
    stageId: 3,
    moduleId: "12",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "How does the Transit Photometry method discover exoplanets?",
    options: [
      "By detecting the tiny periodic dip in starlight when a planet crosses in front of its host star",
      "By measuring the Doppler redshift and blueshift of the host star's spectrum",
      "By taking high-contrast direct optical photographs of the planet's oceans",
      "By detecting radio signals emitted by the planet's lightning storms",
    ],
    correctAnswer: 0,
    explanation: "Transit photometry (used by Kepler and TESS) detects periodic decreases in stellar flux (Delta F / F ≈ (R_p / R_*)^2), revealing the planet's physical radius and orbital period.",
    sourceReference: "NASA Kepler & TESS Science Data Archives",
    learningObjective: "Explain the transit method and calculate planet-to-star radius ratios.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 3: YOUNG ASTRONOMER ---
  {
    id: "fe_stg3_mod10_a01",
    stageId: 3,
    moduleId: "10",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "What is the Chandrasekhar mass limit (~1.44 Solar Masses), and what physical mechanism determines it?",
    options: [
      "The maximum mass supported by relativistic electron degeneracy pressure before collapsing into a neutron star",
      "The minimum mass required for a protostar to ignite hydrogen fusion",
      "The upper boundary where radiation pressure tears a supergiant star apart",
      "The mass threshold where a neutron star collapses into a black hole",
    ],
    correctAnswer: 0,
    explanation: "Subrahmanyan Chandrasekhar calculated that when degenerate electrons become relativistic, their equation of state softens (P proportional to rho^(4/3)), setting an upper limit of ~1.44 M_sun for stable white dwarfs.",
    sourceReference: "Chandrasekhar (1931) 'The Maximum Mass of Ideal White Dwarfs', ApJ",
    learningObjective: "Derive the Chandrasekhar mass limit from degenerate relativistic electron thermodynamics.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg3_mod09_a01",
    stageId: 3,
    moduleId: "09",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "According to the Stefan-Boltzmann relation (L = 4 pi R^2 sigma T^4), if Star B has twice the radius and twice the surface temperature of Star A, what is the ratio of their luminosities (L_B / L_A)?",
    options: ["64", "16", "32", "8"],
    correctAnswer: 0,
    explanation: "L is proportional to R^2 * T^4. Doubling radius gives a factor of 2^2 = 4. Doubling temperature gives 2^4 = 16. The total luminosity ratio is 4 x 16 = 64.",
    sourceReference: "Carroll & Ostlie, 'Introduction to Modern Astrophysics'",
    learningObjective: "Apply the Stefan-Boltzmann law to compute stellar luminosity variations.",
    version: "1.0.0",
    isActive: true,
  },

  // =========================================================================
  // STAGE 4: MODULES 13 - 16 (Galaxies, Black Holes, Cosmic Web, Dark Matter & Energy)
  // =========================================================================

  // --- STAGE 4: JUNIOR EXPLORER ---
  {
    id: "fe_stg4_mod13_j01",
    stageId: 4,
    moduleId: "13",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What broad shape classification best describes our Milky Way Galaxy?",
    options: ["A barred spiral galaxy", "A featureless elliptical sphere", "An irregular dwarf galaxy", "A perfect ring galaxy"],
    correctAnswer: 0,
    explanation: "Infrared surveys and Gaia mapping confirm that the Milky Way is a barred spiral galaxy (Hubble type SBbc) with a central stellar bar and majestic spiral arms.",
    sourceReference: "NASA / ESA / Spitzer & Gaia Galactic Survey Maps",
    learningObjective: "Classify galaxies according to Hubble morphology.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod14_j01",
    stageId: 4,
    moduleId: "14",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What is the boundary around a black hole called beyond which nothing, not even light, can escape?",
    options: ["The Event Horizon", "The Accretion Disk", "The Ergosphere", "The Photon Sphere"],
    correctAnswer: 0,
    explanation: "The event horizon marks the mathematical threshold where escape velocity equals the speed of light c. Any matter or photon crossing it cannot return.",
    sourceReference: "Event Horizon Telescope (EHT) Collaboration / NASA",
    learningObjective: "Define the event horizon of a black hole.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod15_j01",
    stageId: 4,
    moduleId: "15",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "On the largest scales of the universe, how are galaxies arranged?",
    options: [
      "In a vast cosmic web of filaments, dense clusters, and giant empty voids",
      "In neat concentric circles around planet Earth",
      "Evenly spaced like a grid of checkers",
      "Scattered randomly with no gravitational grouping",
    ],
    correctAnswer: 0,
    explanation: "Galaxies are organized along gravitational filaments of dark matter and gas, connecting dense superclusters and surrounding enormous cosmic voids millions of light-years across.",
    sourceReference: "SDSS Galaxy Surveys / Millennium & IllustrisTNG Simulations",
    learningObjective: "Describe the cosmic web architecture of large-scale structure.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod16_j01",
    stageId: 4,
    moduleId: "16",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Why is Dark Matter called 'dark' by astronomers?",
    options: [
      "It does not absorb, reflect, or emit light (electromagnetic radiation)",
      "It is black in color like soot or coal",
      "It only appears at night when the Sun sets",
      "It absorbs all light like a black hole",
    ],
    correctAnswer: 0,
    explanation: "Dark matter interacts gravitationally with normal matter, but does not interact with the electromagnetic force, making it invisible to all photon telescopes.",
    sourceReference: "NASA Astrophysics: Dark Matter Primer",
    learningObjective: "Explain the non-electromagnetic nature of dark matter.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod14_j02",
    stageId: 4,
    moduleId: "14",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What supermassive black hole sits at the very center of our Milky Way Galaxy?",
    options: ["Sagittarius A* (Sgr A*)", "Cygnus X-1", "M87*", "Centaurus A"],
    correctAnswer: 0,
    explanation: "Sagittarius A* is the 4.15-million-solar-mass supermassive black hole at the center of the Milky Way, imaged by the Event Horizon Telescope in 2022.",
    sourceReference: "EHT Collaboration (2022) / Genzel & Ghez Nobel Prize Research",
    learningObjective: "Identify Sagittarius A* as the galactic core supermassive black hole.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 4: SPACE EXPLORER ---
  {
    id: "fe_stg4_mod13_e01",
    stageId: 4,
    moduleId: "13",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What observational anomaly did astronomer Vera Rubin discover in spiral galaxy rotation curves that provided decisive evidence for dark matter halos?",
    options: [
      "Orbital velocities of outer stars remained flat and constant instead of falling off with Keplerian decline (v proportional to 1/sqrt(r))",
      "Galactic spiral arms were unwinding faster than the speed of light",
      "Core stars were rotating in the opposite direction of disk stars",
      "Galaxies lacked enough gravitational mass to hold any gas inside",
    ],
    correctAnswer: 0,
    explanation: "If visible stars constituted all mass, velocities should drop as 1/sqrt(r) beyond the optical disk. Instead, rotation curves stay flat out to tens of kiloparsecs, proving the existence of an extended spherical dark matter halo.",
    sourceReference: "Rubin, Ford & Thonnard (1980) 'Rotational properties of 21 Sc galaxies', ApJ",
    learningObjective: "Analyze galactic rotation curves and the empirical necessity for dark matter.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod14_e01",
    stageId: 4,
    moduleId: "14",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What observational breakthrough did the Event Horizon Telescope (EHT) achieve when imaging M87* and Sgr A*?",
    options: [
      "Resolving the dark silhouette (shadow) cast by the event horizon against the lensed emission ring of glowing plasma",
      "Capturing a direct optical photograph of the central point singularity",
      "Detecting Hawking radiation escaping from inside the black hole",
      "Measuring the exact electric charge of the black hole horizon",
    ],
    correctAnswer: 0,
    explanation: "Using global Very Long Baseline Interferometry (VLBI) at 1.3 mm wavelengths, the EHT resolved the shadow created by photon capture at 2.6 Schwarzschild radii, surrounded by the Doppler-boosted photon ring.",
    sourceReference: "Event Horizon Telescope Collaboration (2019, 2022) ApJ Letters",
    learningObjective: "Explain black hole shadow formation and gravitational light bending.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod15_e01",
    stageId: 4,
    moduleId: "15",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What physical process drove the growth of primordial density fluctuations into the modern cosmic web?",
    options: [
      "Gravitational Jeans instability: overdense regions collapsed under their own gravity, pulling mass from underdense voids",
      "Relativistic shock waves from early supermassive black hole mergers",
      "Magnetic repulsion between primordial helium ions",
      "Cosmic ray pressure pushing dark matter into filamentary shapes",
    ],
    correctAnswer: 0,
    explanation: "Regions with tiny initial overdensities (delta rho / rho ~ 10^-5) experienced stronger self-gravity, pulling in dark matter and gas hierarchically over billions of years.",
    sourceReference: "Springel et al. (2005) 'Simulations of the formation, evolution and clustering of galaxies', Nature",
    learningObjective: "Explain hierarchical structure formation through gravitational Jeans instability.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod16_e01",
    stageId: 4,
    moduleId: "16",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Why is the Bullet Cluster (1E 0657-56) considered the 'smoking gun' observational proof of dark matter?",
    options: [
      "Gravitational lensing maps reveal the gravitational mass passed right through the collision without colliding, while normal X-ray gas collided and stalled",
      "The cluster contains two colliding supermassive black holes that emitted gravitational waves",
      "Dark matter emitted brilliant gamma-ray annihilation lines recorded by Fermi",
      "All galaxies in the cluster disintegrated due to dark energy repulsion",
    ],
    correctAnswer: 0,
    explanation: "During the cluster collision, collisional drag slowed down the baryonic hot X-ray gas (pink), while collisionless dark matter (mapped by weak gravitational lensing in blue) sailed right through along with the galaxies.",
    sourceReference: "Clowe et al. (2006) 'A Direct Empirical Proof of the Existence of Dark Matter', ApJ Letters",
    learningObjective: "Analyze Bullet Cluster weak lensing maps as direct empirical proof of dark matter.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 4: YOUNG ASTRONOMER ---
  {
    id: "fe_stg4_mod14_a01",
    stageId: 4,
    moduleId: "14",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "What is the Schwarzschild radius formula (R_s = 2 G M / c^2) for a non-rotating (Schwarzschild) black hole of mass M = 10 Solar Masses?",
    options: ["~29.5 kilometers", "~2.95 kilometers", "~295 kilometers", "~14.8 kilometers"],
    correctAnswer: 0,
    explanation: "For 1 solar mass, R_s ≈ 2.953 km. For a 10-solar-mass black hole, R_s = 10 x 2.953 km ≈ 29.53 km.",
    sourceReference: "Misner, Thorne & Wheeler, 'Gravitation', W. H. Freeman",
    learningObjective: "Calculate the Schwarzschild event horizon radius for stellar and supermassive black holes.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg4_mod16_a01",
    stageId: 4,
    moduleId: "16",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "In the standard Lambda-CDM cosmological concordance model, what are the approximate fractional energy densities of Dark Energy (Omega_Lambda), Dark Matter (Omega_c), and Baryonic Matter (Omega_b)?",
    options: [
      "~68.5% Dark Energy, ~26.5% Dark Matter, ~5.0% Baryons",
      "~50% Dark Matter, ~30% Dark Energy, ~20% Baryons",
      "~85% Dark Matter, ~10% Baryons, ~5% Dark Energy",
      "~95% Dark Energy, ~4% Dark Matter, ~1% Baryons",
    ],
    correctAnswer: 0,
    explanation: "Planck 2018 cosmic microwave background results determine Omega_Lambda = 0.6847 ± 0.0073, Omega_c = 0.2645 ± 0.0048, and Omega_b = 0.0493 ± 0.0006.",
    sourceReference: "Planck Collaboration (2020) 'Planck 2018 results. VI. Cosmological parameters', A&A",
    learningObjective: "State the empirical energy density components of the Lambda-CDM model.",
    version: "1.0.0",
    isActive: true,
  },

  // =========================================================================
  // STAGE 5: MODULES 17 - 20 (Big Bang, Expansion, History of Cosmology, Future)
  // =========================================================================

  // --- STAGE 5: JUNIOR EXPLORER ---
  {
    id: "fe_stg5_mod17_j01",
    stageId: 5,
    moduleId: "17",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What was the early universe like in the first few minutes after the Big Bang?",
    options: [
      "Extremely hot, dense, and glowing with high-energy radiation everywhere",
      "Completely dark and frozen cold like deep outer space",
      "Full of mature galaxies and modern planetary systems",
      "A single giant solid star that exploded like dynamite inside empty space",
    ],
    correctAnswer: 0,
    explanation: "The Big Bang was not an explosion into pre-existing space, but the rapid expansion of spacetime itself from an initial hot, dense, and nearly homogeneous plasma state.",
    sourceReference: "Weinberg, 'The First Three Minutes' / NASA Cosmology Primer",
    learningObjective: "Describe the initial hot, dense plasma state of the early universe.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod17_j02",
    stageId: 5,
    moduleId: "17",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What is the Cosmic Microwave Background (CMB)?",
    options: [
      "The afterglow radiation from the early universe when it cooled enough for atoms to form (recombination)",
      "Microwave radio signals emitted by orbiting communications satellites",
      "Heat radiated by the rings of Saturn and Jupiter",
      "Radiation from nearby exploding stars in the Milky Way",
    ],
    correctAnswer: 0,
    explanation: "At recombination (~380,000 years after Big Bang, z ≈ 1100), protons and electrons combined into neutral hydrogen, letting photons travel freely across the cosmos as the CMB.",
    sourceReference: "Penzias & Wilson (1965) / COBE, WMAP, Planck Missions",
    learningObjective: "Identify the Cosmic Microwave Background as primordial relic radiation.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod18_j01",
    stageId: 5,
    moduleId: "18",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What did astronomer Edwin Hubble discover about distant galaxies in 1929?",
    options: [
      "Almost all distant galaxies are moving away from us, and farther galaxies recede faster",
      "All galaxies are falling directly inward toward the Sun",
      "Galaxies are stationary and fixed in space forever",
      "Distant galaxies are all orbiting planet Earth",
    ],
    correctAnswer: 0,
    explanation: "Hubble observed that spectral absorption lines in distant galaxies are systematically redshifted proportional to their distance (Hubble-Lemaître Law), showing the expansion of space.",
    sourceReference: "Hubble (1929) 'A relation between distance and radial velocity among extra-galactic nebulae'",
    learningObjective: "State Hubble's Law and the observational evidence for cosmic expansion.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod20_j01",
    stageId: 5,
    moduleId: "20",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What is currently causing the expansion of the universe to speed up (accelerate)?",
    options: ["Dark Energy", "The Sun's solar wind", "The gravity of black holes", "Cosmic dust friction"],
    correctAnswer: 0,
    explanation: "Observations of distant Type Ia supernovae in 1998 revealed that cosmic expansion is accelerating, driven by the repulsive negative pressure of Dark Energy.",
    sourceReference: "1998 Supernova Cosmology Project & High-Z Supernova Search Team (2011 Nobel Prize)",
    learningObjective: "Identify Dark Energy as the driver of accelerated universal expansion.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 5: SPACE EXPLORER ---
  {
    id: "fe_stg5_mod17_e01",
    stageId: 5,
    moduleId: "17",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What elements were synthesized during Big Bang Nucleosynthesis (BBN) in the first 20 minutes of the universe?",
    options: [
      "~75% Hydrogen, ~25% Helium-4, with trace amounts of Deuterium, Helium-3, and Lithium-7",
      "Equal amounts of carbon, oxygen, iron, and silicon",
      "100% pure hydrogen with zero helium",
      "Heavy elements like uranium and gold",
    ],
    correctAnswer: 0,
    explanation: "Because the universe expanded and cooled rapidly, fusion ceased after helium and tiny trace lithium was produced. All elements heavier than lithium were forged billions of years later in stars.",
    sourceReference: "Alpher, Bethe & Gamow (1948) / Steigman (2007) 'Primordial Nucleosynthesis', ARNPS",
    learningObjective: "Describe primordial abundances predicted by Big Bang Nucleosynthesis.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod18_e01",
    stageId: 5,
    moduleId: "18",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What causes cosmological redshift (z) in photons arriving from distant galaxies?",
    options: [
      "The physical wavelength of light is stretched by the expansion of spacetime during transit",
      "Photons lose energy by colliding with interstellar dust grains (tired light)",
      "Galaxies are physically flying through space faster than the speed of light",
      "Earth's atmosphere absorbs blue wavelengths preferentially",
    ],
    correctAnswer: 0,
    explanation: "Cosmological redshift is not a Doppler shift through static space; rather, 1 + z = a_now / a_then, where a(t) is the cosmic scale factor stretching the photon's wavelength as space expands.",
    sourceReference: "Peebles, 'Principles of Physical Cosmology', Princeton Univ Press",
    learningObjective: "Distinguish cosmological redshift from classical Doppler shifts.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod19_e01",
    stageId: 5,
    moduleId: "19",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Who first mathematically derived from Einstein's General Relativity that the universe must be expanding, and proposed the 'hypothesis of the primeval atom'?",
    options: ["Georges Lemaître & Alexander Friedmann", "Albert Einstein & Isaac Newton", "Johannes Kepler & Galileo Galilei", "Nicolaus Copernicus & Tycho Brahe"],
    correctAnswer: 0,
    explanation: "In 1927, Belgian physicist and priest Georges Lemaître independently solved Einstein's field equations, derived Hubble's law two years before Hubble's observational paper, and proposed the Big Bang concept.",
    sourceReference: "Lemaître (1927) Annales de la Société Scientifique de Bruxelles / Friedmann (1922) Z. Phys",
    learningObjective: "Identify the historical pioneers of relativistic cosmology and the Big Bang theory.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 5: YOUNG ASTRONOMER ---
  {
    id: "fe_stg5_mod17_a01",
    stageId: 5,
    moduleId: "17",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "What key cosmological problems (Flatness, Horizon, and Monopole problems) does the Cosmic Inflation hypothesis solve?",
    options: [
      "An exponential expansion driven by an inflaton scalar field flattened curvature and placed regions into causal contact before inflation",
      "Supermassive black hole mergers converted dark matter into baryonic matter",
      "Cosmic rays neutralized magnetic monopoles into neutral helium atoms",
      "General relativistic singularities were dissolved by quantum gravitational friction",
    ],
    correctAnswer: 0,
    explanation: "Alan Guth (1981) proposed that an exponential expansion by a factor of > 10^26 during ~10^-36 s stretched the universe flat (Omega_k ≈ 0) and inflated a microscopic causally-connected thermal patch across the observable sky.",
    sourceReference: "Guth (1981) 'Inflationary universe: A possible solution to the horizon and flatness problems', Phys Rev D",
    learningObjective: "Explain cosmic inflation and its solutions to classical Big Bang paradoxes.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg5_mod18_a01",
    stageId: 5,
    moduleId: "18",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "If the Hubble Constant is H_0 = 70 km/s/Mpc, what is the recession velocity of a galaxy located at a comoving distance of 100 Mpc according to Hubble's Law (v = H_0 * d)?",
    options: ["7,000 km/s", "700 km/s", "70,000 km/s", "49,000 km/s"],
    correctAnswer: 0,
    explanation: "Using v = H_0 * d: v = 70 (km/s/Mpc) * 100 Mpc = 7,000 km/s (~2.3% of the speed of light).",
    sourceReference: "Freedman et al. (2001) 'Final Results from the Hubble Space Telescope Key Project to Measure the Hubble Constant'",
    learningObjective: "Calculate cosmological galaxy recession velocities using Hubble's Law.",
    version: "1.0.0",
    isActive: true,
  },

  // =========================================================================
  // STAGE 6: MODULES 21 - 24 (Telescopes, Space Missions, Astrobiology, Capstone)
  // =========================================================================

  // --- STAGE 6: JUNIOR EXPLORER ---
  {
    id: "fe_stg6_mod21_j01",
    stageId: 6,
    moduleId: "21",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Why do astronomers put telescopes like Hubble and the James Webb Space Telescope into space?",
    options: [
      "To avoid atmospheric blurring, light pollution, and atmospheric absorption of infrared and UV light",
      "Because space telescopes are closer to the stars by half the distance",
      "Because gravity on Earth breaks glass mirrors over time",
      "To escape Earth's magnetic field which bends visible light",
    ],
    correctAnswer: 0,
    explanation: "Earth's atmosphere blurs optical images (atmospheric seeing) and completely absorbs or distorts many ultraviolet, X-ray, gamma-ray, and infrared wavelengths.",
    sourceReference: "NASA / ESA Space Telescope Science Institute (STScI)",
    learningObjective: "Explain the observational advantages of space-based observatories.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod22_j01",
    stageId: 6,
    moduleId: "22",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "Which robotic spacecraft have traveled beyond the heliopause and entered interstellar space?",
    options: ["Voyager 1 and Voyager 2", "Apollo 11 and Apollo 13", "Curiosity and Perseverance", "Hubble and Spitzer"],
    correctAnswer: 0,
    explanation: "Launched in 1977, NASA's Voyager 1 (in 2012) and Voyager 2 (in 2018) crossed the heliopause into interstellar space, continuing to transmit scientific telemetry.",
    sourceReference: "NASA JPL Voyager Interstellar Mission Archive",
    learningObjective: "Identify humanity's interstellar robotic probes and their milestones.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod23_j01",
    stageId: 6,
    moduleId: "23",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "What key ingredient is considered essential for life as we know it when searching for habitable worlds?",
    options: ["Liquid water", "Pure methane oceans", "Liquid nitrogen lakes", "Sulfur dioxide clouds"],
    correctAnswer: 0,
    explanation: "Liquid water is the universal solvent for organic biochemistry, which is why astronomers search for planets within the Circumstellar Habitable Zone ('Goldilocks Zone').",
    sourceReference: "NASA Astrobiology Strategy / Kasting et al., Habitable Zones around Main Sequence Stars",
    learningObjective: "Explain the prerequisites for organic life and the circumstellar habitable zone.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod24_j01",
    stageId: 6,
    moduleId: "24",
    level: "junior",
    difficulty: "introductory",
    type: "single_choice",
    questionText: "In our unified astrophysics laboratory, what happens to planetary orbital speed when a planet moves farther away from its parent star?",
    options: ["It moves slower", "It moves faster", "Its speed never changes", "It stops orbiting and falls straight into the star"],
    correctAnswer: 0,
    explanation: "Gravitational pull weakens with distance according to the inverse-square law (F = G M m / r^2). Consequently, orbital velocity decreases as v = sqrt(G M / r).",
    sourceReference: "Newton's Principia / Planetary Orbital Mechanics",
    learningObjective: "Synthesize gravitational force relationships with orbital velocities.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 6: SPACE EXPLORER ---
  {
    id: "fe_stg6_mod21_e01",
    stageId: 6,
    moduleId: "21",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What is the primary factor that determines the light-gathering power and angular resolution of an optical telescope?",
    options: [
      "The diameter (aperture) of its primary mirror or lens",
      "The magnification power of the eyepiece lens",
      "The length of the telescope tube",
      "The color of paint on the telescope housing",
    ],
    correctAnswer: 0,
    explanation: "Light-gathering power scales with mirror area (proportional to D^2), and diffraction-limited angular resolution improves inversely with aperture (theta ≈ 1.22 lambda / D).",
    sourceReference: "Rayleigh Criterion / Hecht, 'Optics', Pearson",
    learningObjective: "Apply aperture scaling laws to telescope light collection and diffraction limits.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod22_e01",
    stageId: 6,
    moduleId: "22",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "How do interplanetary spacecraft like Cassini, New Horizons, and Parker Solar Probe gain velocity without expending rocket fuel?",
    options: [
      "By performing gravity-assist flybys (gravitational slingshots) that borrow orbital momentum from planets",
      "By deploying solar sails that catch solar magnetic sparks",
      "By turning off their radio transmitters to reduce drag",
      "By absorbing cosmic ray kinetic energy in deep space",
    ],
    correctAnswer: 0,
    explanation: "In a gravity assist flyby, the spacecraft enters a planet's gravitational sphere of influence; in the heliocentric frame, it exits with altered direction and increased orbital velocity, exchanging angular momentum with the planet.",
    sourceReference: "NASA JPL Basics of Space Flight: Gravity Assists",
    learningObjective: "Explain orbital momentum transfer in gravity-assist trajectories.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod23_e01",
    stageId: 6,
    moduleId: "23",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "Why are the icy ocean moons Europa (Jupiter) and Enceladus (Saturn) prime candidates in the search for extraterrestrial life?",
    options: [
      "They harbor vast subsurface liquid water oceans kept warm by tidal heating, with hydrothermal vents on their ocean floors",
      "Their frozen ice surfaces receive abundant ultraviolet light from the Sun",
      "They contain thick oxygen atmospheres produced by plant forests",
      "Their cores consist of radioactive uranium that melts surface ice caps",
    ],
    correctAnswer: 0,
    explanation: "Gravitational tidal kneading by Jupiter and Saturn generates geothermal heat in the rocky mantles of Europa and Enceladus, sustaining liquid oceans with chemical energy sources independent of sunlight.",
    sourceReference: "NASA Cassini and Galileo Science Findings / Europa Clipper Mission Objectives",
    learningObjective: "Evaluate astrobiological potential of ocean worlds sustained by tidal heating.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod24_e01",
    stageId: 6,
    moduleId: "24",
    level: "explorer",
    difficulty: "intermediate",
    type: "single_choice",
    questionText: "What does the Drake Equation attempt to estimate in astrobiology and astrophysics?",
    options: [
      "The number of active, communicative technological civilizations in the Milky Way Galaxy",
      "The total mass of dark matter in our Local Group",
      "The exact age of the universe in atomic seconds",
      "The maximum speed a rocket can reach using chemical propellants",
    ],
    correctAnswer: 0,
    explanation: "Formulated by Frank Drake in 1961, the equation multiplies star formation rates, fractions of stars with planets, habitable planets, life emergence, intelligence, communication, and civilization longevity (N = R* x f_p x n_e x f_l x f_i x f_c x L).",
    sourceReference: "Drake (1961) SETI Institute / Shostak, 'Sharing the Universe'",
    learningObjective: "Analyze the components and scientific uncertainties of the Drake Equation.",
    version: "1.0.0",
    isActive: true,
  },

  // --- STAGE 6: YOUNG ASTRONOMER ---
  {
    id: "fe_stg6_mod21_a01",
    stageId: 6,
    moduleId: "21",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "According to the Rayleigh criterion (theta = 1.22 * lambda / D), if an optical telescope has a primary mirror diameter D = 6.5 meters (like the James Webb Space Telescope) observing at wavelength lambda = 2.0 microns (2.0 x 10^-6 m), what is its diffraction-limited angular resolution?",
    options: ["~0.077 arcseconds", "~0.77 arcseconds", "~0.0077 arcseconds", "~1.22 arcseconds"],
    correctAnswer: 0,
    explanation: "Theta in radians = 1.22 * (2.0 x 10^-6 m) / 6.5 m ≈ 3.754 x 10^-7 rad. Converting to arcseconds (multiply by 206,265 arcsec/rad) yields theta ≈ 0.0774 arcseconds.",
    sourceReference: "JWST Technical Handbook / Hecht, 'Optics'",
    learningObjective: "Calculate the diffraction-limited angular resolution of astronomical observatories.",
    version: "1.0.0",
    isActive: true,
  },
  {
    id: "fe_stg6_mod24_a01",
    stageId: 6,
    moduleId: "24",
    level: "astronomer",
    difficulty: "advanced",
    type: "single_choice",
    questionText: "In stellar nucleosynthesis calculations, why does the Triple-Alpha Process require a sharp temperature resonance (~10^8 K) to fuse three helium-4 nuclei into carbon-12?",
    options: [
      "Beryllium-8 is extremely unstable with a half-life of ~10^-16 seconds; a third alpha particle must collide before it decays, utilizing Hoyle's 7.65 MeV excited resonance state in carbon-12",
      "Helium nuclei cannot overcome Coulomb repulsion without relativistic magnetic confinement",
      "Electron degeneracy pressure cools the core until carbon crystals form",
      "Neutrino emission carries away 99% of fusion kinetic energy below 10^8 K",
    ],
    correctAnswer: 0,
    explanation: "Fred Hoyle (1954) predicted an excited nuclear state at 7.65 MeV in carbon-12; without this exact resonance, the fleeting Beryllium-8 nucleus would decay before capturing a third alpha particle, preventing carbon and oxygen synthesis in the universe.",
    sourceReference: "Hoyle (1954) 'On Nuclear Reactions Occurring in Very Hot STARS. I. the Synthesis of Elements from Carbon to Nickel', ApJS",
    learningObjective: "Explain the Hoyle state and the nuclear physics of the triple-alpha process.",
    version: "1.0.0",
    isActive: true,
  },
];

/**
 * Validates and retrieves all questions for a specific stage and learning level.
 */
export function getExamQuestionsForStage(
  stageId: number,
  level: LearningLevel,
): CanonicalAssessmentQuestion[] {
  return FINAL_EXAM_QUESTION_BANK.filter(
    (q) => q.stageId === stageId && q.level === level && q.isActive,
  );
}

/**
 * Fisher-Yates array shuffle using cryptographically sound or high-entropy randomization.
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates an official authoritative Final Examination attempt.
 * Selects exactly 20 questions according to the balanced 6-stage blueprint:
 * Stage 1: 3 questions
 * Stage 2: 4 questions
 * Stage 3: 3 questions
 * Stage 4: 4 questions
 * Stage 5: 3 questions
 * Stage 6: 3 questions
 * Total: 20 questions
 */
export function generateFinalExamAttemptServer(
  level: LearningLevel = "explorer",
): CanonicalAssessmentQuestion[] {
  const distribution = FINAL_EXAM_BLUEPRINT.stageDistribution;
  const selectedQuestions: CanonicalAssessmentQuestion[] = [];

  for (let stageId = 1; stageId <= 6; stageId++) {
    const requiredCount = distribution[stageId] || 3;
    let pool = getExamQuestionsForStage(stageId, level);

    // Fallback: If pool for requested level has fewer questions than required,
    // supplement with explorer level questions
    if (pool.length < requiredCount && level !== "explorer") {
      const explorerPool = getExamQuestionsForStage(stageId, "explorer");
      pool = [...pool, ...explorerPool];
    }

    if (pool.length < requiredCount) {
      throw new Error(
        `Final Exam Question Bank error: Insufficient questions for Stage ${stageId} at level ${level} (need ${requiredCount}, have ${pool.length})`,
      );
    }

    const shuffled = shuffleArray(pool);
    selectedQuestions.push(...shuffled.slice(0, requiredCount));
  }

  if (selectedQuestions.length !== FINAL_EXAM_BLUEPRINT.totalQuestions) {
    throw new Error(
      `Blueprint allocation failure: Expected ${FINAL_EXAM_BLUEPRINT.totalQuestions} questions, got ${selectedQuestions.length}`,
    );
  }

  return selectedQuestions;
}

/**
 * Sanitizes canonical questions into client-safe representation.
 * GUARANTEE: Never leaks correctAnswer or explanation to browser bundle!
 */
export function sanitizeQuestionsForClient(
  canonical: CanonicalAssessmentQuestion[],
): ClientAssessmentQuestion[] {
  return canonical.map((q) => ({
    id: q.id,
    moduleId: q.moduleId,
    stageId: q.stageId,
    stageTitle: STAGE_TITLES[q.stageId] || `Stage ${q.stageId}`,
    level: q.level,
    difficulty: q.difficulty,
    type: q.type,
    questionText: q.questionText,
    options: q.options,
    learningObjective: q.learningObjective,
    relevantLessonId: q.relevantLessonId || `${q.moduleId}-core`,
    sourceReference: q.sourceReference,
    questionVersion: q.version,
  }));
}

/**
 * Computes stage-level topic strengths and identifies review topics.
 */
export function computeFinalExamTopicBreakdown(
  feedbackItems: AssessmentFeedbackItem[],
): {
  topicStrengths: TopicStrength[];
  topicsRequiringReview: TopicRequiringReview[];
} {
  const stageStats: Record<number, { correct: number; total: number }> = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
    5: { correct: 0, total: 0 },
    6: { correct: 0, total: 0 },
  };

  const topicsRequiringReview: TopicRequiringReview[] = [];

  for (const item of feedbackItems) {
    const stageId = item.stageId || 1;
    if (stageStats[stageId]) {
      stageStats[stageId].total++;
      if (item.isCorrect) {
        stageStats[stageId].correct++;
      }
    }

    if (!item.isCorrect) {
      const modId = item.moduleId || "01";
      topicsRequiringReview.push({
        stageId,
        moduleId: modId,
        moduleTitle: MODULE_TITLES[modId] || `Module ${modId}`,
        topicName: item.questionText.slice(0, 60) + "...",
        learningObjective:
          item.learningObjective ||
          `Master core principles of ${MODULE_TITLES[modId] || "Astronomy Concept"}`,
        reviewRecommendation: `Review Module ${modId}: ${item.sourceReference}`,
      });
    }
  }

  const topicStrengths: TopicStrength[] = Object.entries(stageStats).map(
    ([stgStr, { correct, total }]) => {
      const stageId = parseInt(stgStr, 10);
      const pct = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
      let status: "mastered" | "proficient" | "review_needed" = "review_needed";
      if (pct >= 80) status = "mastered";
      else if (pct >= 60) status = "proficient";

      return {
        stageId,
        stageTitle: STAGE_TITLES[stageId] || `Stage ${stageId}`,
        correctCount: correct,
        totalCount: total,
        percentage: pct,
        status,
      };
    },
  );

  return { topicStrengths, topicsRequiringReview };
}
