import type { LearningLevel, LessonContract, QuizQuestion, ScientificSource } from "../types";

export interface CosmicScaleStep {
  id: string;
  name: string;
  exponent: number; // 10^exponent meters
  meters: number;
  formattedSize: string;
  astronomicalEquivalent: string;
  description: string;
  analogy: string;
  category: "terrestrial" | "planetary" | "stellar" | "galactic" | "cosmological";
  visualColor: string;
}

export interface TravelTimeVehicle {
  id: string;
  name: string;
  speedKmh: number;
  formattedSpeed: string;
  icon: string;
  description: string;
  isRealMission?: boolean;
}

export interface TravelDestination {
  id: string;
  name: string;
  distanceKm: number;
  distanceAU?: number;
  distanceLy?: number;
  formattedDistance: string;
  lightTravelTime: string;
  lightSeconds: number;
  trajectoryNote: string;
}

export interface BasketballPlanetScale {
  name: string;
  realDiameterKm: number;
  scaleDiameterMm: number;
  scaleObjectAnalogy: string;
  realDistanceKm: number;
  scaleDistanceMeters: number;
  scaleDistanceAnalogy: string;
  colorHex: string;
}

export interface SubLesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  content: Record<
    LearningLevel,
    {
      summary: string;
      takeaway: string;
      deepDive: string;
      didYouKnow: string;
      mathOrAnalogy: string;
    }
  >;
}

export const MODULE_03_SUBLESSONS: SubLesson[] = [
  {
    id: "lesson-1-kilometers-in-space",
    number: 1,
    title: "Kilometers in space",
    subtitle: "Why everyday highway units break down in the celestial ocean",
    description:
      "Discover why the kilometer—perfect for measuring roads on Earth—becomes impossibly unwieldy for measuring the cosmos.",
    content: {
      junior: {
        summary:
          "On Earth, we use kilometers to measure how far you drive to Grandma's house or to school. But outer space is so mind-bogglingly huge that counting in kilometers is like trying to measure the distance across an ocean using a tiny pencil!",
        takeaway:
          "Kilometers work great on Earth, but in space, numbers get too giant to write down easily!",
        deepDive:
          "Earth is about 12,742 kilometers wide. That sounds big! But to get to the Moon, you have to travel 384,400 kilometers. And to reach the Sun, it's 149,600,000 kilometers! If you tried to write down the distance to the next star in kilometers, you would need a number with 14 zeros! That's why astronomers invented space yardsticks.",
        didYouKnow:
          "If you drove a car at highway speed (100 km/h) without stopping, it would take you over 5 months just to reach the Moon, and 170 years to reach the Sun!",
        mathOrAnalogy:
          "Measuring space in kilometers is like counting the distance between New York and Tokyo in single sesame seeds.",
      },
      explorer: {
        summary:
          "The metric kilometer (1,000 meters) was calibrated to Earth's circumference. When applied to interplanetary and interstellar space, distances balloon into millions, trillions, and quadrillions of units.",
        takeaway:
          "Astronomers require specialized units (AU, light-year, parsec) because ordinary human metric units result in cumbersome numbers prone to notation errors.",
        deepDive:
          "Originally, the meter was defined in 1791 as one ten-millionth of the distance from the equator to the North Pole. Consequently, Earth's mean radius is ~6,371 km. While appropriate for planetary geology, interplanetary distances require 8 to 11 digits: the Moon is 3.84 x 10^5 km, the Sun is 1.496 x 10^8 km, and Neptune is 4.5 x 10^9 km. For stellar distances, the closest star (Proxima Centauri) is 40,140,000,000,000 km away. To manage these scales, science uses scientific notation (powers of ten) and natural physical constants.",
        didYouKnow:
          "A highway billboard listing the distance to the nearest star in kilometers would read: 'Next Star: 40,140,000,000,000 km. Keep Right!'",
        mathOrAnalogy:
          "1 kilometer = 10^3 meters. The distance to the edge of the observable universe is roughly 4.4 x 10^23 kilometers—a 4 followed by 23 zeros!",
      },
      astronomer: {
        summary:
          "Dimensional analysis in astrometry dictates that distance units match the characteristic physical scale of the gravitational regime under investigation: planetary (SI km), orbital/heliocentric (AU), and interstellar/cosmological (pc / Mpc).",
        takeaway:
          "Unit transitions avoid catastrophic numerical cancellation and truncation in floating-point orbital ephemeris integrations.",
        deepDive:
          "In gravitational N-body orbital mechanics, using SI units (meters or kilometers) requires manipulating the universal gravitational constant G ≈ 6.6743 x 10^-11 m^3 kg^-1 s^-2 alongside mass values of order 10^30 kg and distances of order 10^12 m. Astrodynamicists frequently adopt canonical Gaussian gravitational units where the gravitational parameter of the Sun μ_sun = GM_sun = 1, distance is in AU, and time is in Gaussian days (k = 0.01720209895), dramatically improving numerical stability in symplectic integrators.",
        didYouKnow:
          "In 1999, the Mars Climate Orbiter spacecraft was lost because one software team used Imperial units (pound-force seconds) while another used SI metric units (newton-seconds), throwing off its trajectory by 170 kilometers.",
        mathOrAnalogy:
          "Order-of-magnitude jump: Earth radius (~10^4 km) → 1 AU (~1.5 x 10^8 km, factor of 10^4) → 1 Light-Year (~10^13 km, factor of 10^5) → 1 Megaparsec (~3 x 10^19 km, factor of 10^6).",
      },
    },
  },
  {
    id: "lesson-2-astronomical-units",
    number: 2,
    title: "Astronomical units (AU)",
    subtitle: "The fundamental solar system ruler based on Earth's orbit",
    description:
      "Learn how the average distance between Earth and the Sun became the gold-standard yardstick for our entire solar system.",
    content: {
      junior: {
        summary:
          "Instead of counting millions of kilometers, astronomers made a clever shortcut: they called the distance from Earth to the Sun exactly '1 Astronomical Unit' (or 1 AU for short). It's the master measuring tape for our solar neighborhood!",
        takeaway: "1 AU = The average distance from Earth to the Sun (~150 million km).",
        deepDive:
          "Once you have the AU yardstick, the Solar System becomes easy to understand! Mercury is about 0.4 AU from the Sun. Earth is at 1.0 AU. Mars is about 1.5 AU. Giant Jupiter is at 5 AU, and distant Neptune is 30 AU out! Isn't that much easier to remember than 4,500,000,000 kilometers?",
        didYouKnow:
          "The robotic explorer Voyager 1, which launched in 1977, is currently more than 164 AU away from the Sun—the farthest human-made object in history!",
        mathOrAnalogy:
          "If Earth's distance to the Sun (1 AU) was the length of your classroom desk, Jupiter would be at the classroom door, and Neptune would be across the street!",
      },
      explorer: {
        summary:
          "The Astronomical Unit (symbol: au or AU) is officially defined as exactly 149,597,870,700 meters (approximately 149.6 million km), representing the mean radius of Earth's semi-major orbital axis.",
        takeaway:
          "In 2012, the International Astronomical Union (IAU) re-anchored the AU as an exact fixed physical constant in SI meters rather than an orbital calculation.",
        deepDive:
          "Historically, determining the absolute kilometer value of the AU was astronomy's holy grail. Johannes Kepler knew the relative planetary distances in AU using his Third Law (P^2 = a^3), but he didn't know how many kilometers 1 AU actually was! In the 18th and 19th centuries, global expeditions measured the Transit of Venus across the Sun using triangulation parallax to compute the first accurate value. Today, NASA's Deep Space Network uses interplanetary radar ranging to measure planetary distances to within a few meters.",
        didYouKnow:
          "Because Earth's orbit is slightly elliptical (eccentricity e = 0.0167), we are closest to the Sun in January (Perihelion: 0.983 AU) and farthest in July (Aphelion: 1.017 AU).",
        mathOrAnalogy:
          "1 AU ≈ 1.496 x 10^8 km. The entire Kuiper Belt extends from 30 AU (Neptune) to roughly 50 AU. The inner edge of the Oort Cloud starts around 2,000 AU.",
      },
      astronomer: {
        summary:
          "The AU serves as the foundational baseline of the cosmic distance ladder. The definition of the parsec is geometrically derived directly from 1 AU subtending 1 arcsecond of annual heliocentric parallax.",
        takeaway:
          "By IAU 2012 Resolution B2, 1 au ≡ 149,597,870,700 m exactly, decoupling the constant from heliocentric gravitational parameter drift.",
        deepDive:
          "Prior to 2012, the astronomical unit was defined dynamically via the Gaussian gravitational constant A^3 = GM_sun / k^2. However, general relativity and the secular mass loss of the Sun due to radiation (dM/dt ≈ -1.3 x 10^14 M_sun/year) and solar wind caused the dynamical AU to expand secularly by ~15 cm per year, introducing discrepancies into ultra-precise pulsar timing arrays and spacecraft telemetry. Fixing the AU to an exact integer number of SI meters resolved this divergence.",
        didYouKnow:
          "Radar echo ranging to Venus bounced radar pulses off Venus's rocky surface: time delay Δt = 2d / c directly measured distance in SI meters, yielding the definitive modern calibration of the AU.",
        mathOrAnalogy:
          "Geometric parsec derivation: 1 pc = 1 AU / tan(1″) ≈ 1 AU / (π / (180 * 3600)) = 206,264.806 AU ≈ 3.0857 x 10^16 m.",
      },
    },
  },
  {
    id: "lesson-3-light-seconds-and-light-minutes",
    number: 3,
    title: "Light-seconds and light-minutes",
    subtitle: "Measuring cosmic distance with the ultimate cosmic speed limit",
    description:
      "Explore how the speed of light turns time into distance, creating natural cosmic distance milestones across our solar system.",
    content: {
      junior: {
        summary:
          "Light is the fastest thing in the entire universe! A beam of light travels at 300,000 kilometers every single second. Even at that insane speed, space is so huge that light still takes time to travel from one place to another.",
        takeaway:
          "Light-travel times: Moon is 1.28 seconds away, the Sun is 8.3 minutes away, and Mars is about 12 minutes away!",
        deepDive:
          "In the time it takes you to snap your fingers (one second), a beam of light could wrap all the way around planet Earth seven and a half times! When astronauts talked on the Moon, their radio signals (which travel at the speed of light) took 1.3 seconds to reach Houston, and 1.3 seconds to come back—causing a funny 2.6-second delay between questions and answers.",
        didYouKnow:
          "If the Sun suddenly vanished right now, Earth would continue orbiting peacefully in warm sunlight for another 8 minutes and 20 seconds before we ever noticed!",
        mathOrAnalogy:
          "A light-second is about 300,000 km (Earth to Moon is ~1.3 light-seconds). A light-minute is about 18 million kilometers.",
      },
      explorer: {
        summary:
          "Because the vacuum speed of light c (299,792 km/s) is constant for all observers, light-travel time provides an intuitive, physically grounded distance metric for the solar system.",
        takeaway:
          "1 light-second ≈ 3.0 x 10^5 km; 1 light-minute ≈ 1.8 x 10^7 km; 1 light-hour ≈ 1.08 x 10^9 km.",
        deepDive:
          "NASA mission engineers cannot drive Mars rovers (Curiosity, Perseverance) with a real-time joystick. Depending on Earth and Mars's orbital positions, the one-way radio light-travel time varies from 4 minutes (at closest opposition) to 22 minutes (at solar conjunction on opposite sides of the Sun). Consequently, rovers must use onboard computer vision and hazard avoidance algorithms to navigate Martian terrain autonomously.",
        didYouKnow:
          "When the New Horizons spacecraft flew past Pluto in 2015, its celebratory radio ping took 4.5 hours to travel across the solar system at the speed of light to reach antennas on Earth!",
        mathOrAnalogy:
          "Speed of light c = 299,792,458 m/s. 1 AU = 149,597,870.7 km / 299,792.458 km/s = 499.00478 seconds = 8 minutes and 19 seconds.",
      },
      astronomer: {
        summary:
          "In relativistic electrodynamics, light-travel time defines the backward light cone. Every observation of a celestial body is an observation of its retarded time state: t_ret = t_obs - d/c.",
        takeaway:
          "Solar System telemetry requires relativistic Shapiro time delay corrections as electromagnetic signals pass through the Sun's gravitational curvature potential.",
        deepDive:
          "Radar signals sent from Earth to planets and spacecraft do not travel in perfectly straight Euclidean paths at constant coordinate speed. In general relativity, the gravitational potential field of the Sun causes a relativistic Shapiro delay: Δt_shapiro ≈ (4GM / c^3) * ln((r_earth + r_target + d) / (r_earth + r_target - d)). This delay can exceed 200 microseconds and must be incorporated into spacecraft ranging and planetary ephemerides.",
        didYouKnow:
          "The Cassini spacecraft measured the Shapiro time delay past Saturn with an accuracy of 0.002%, providing one of the most rigorous experimental verifications of Einstein's general relativity.",
        mathOrAnalogy:
          "Relativistic metric: ds^2 = 0 for null geodesics (photons). Gravitational redshift and time dilation: dτ = dt * √(1 - 2GM / (r c^2)).",
      },
    },
  },
  {
    id: "lesson-4-light-years",
    number: 4,
    title: "Light-years",
    subtitle: "The interstellar bridge: 9.46 trillion kilometers in a single leap",
    description:
      "Understand what a light-year actually measures (distance, not time!) and how it bridges the immense gulfs between stars.",
    content: {
      junior: {
        summary:
          "A 'light-year' sounds like a measurement of time because of the word 'year'—but it is actually a measurement of huge DISTANCE! It is the total distance a beam of light travels in one full year.",
        takeaway:
          "A light-year is a distance! It equals roughly 9.5 trillion kilometers (about 6 trillion miles).",
        deepDive:
          "Think about a car driving at 100 km/h for one hour: the distance it travels is '1 car-hour' (100 km). Now imagine a beam of light zooming at 300,000 km every single second, non-stop without pausing for a whole year of 365 days. That light beam travels 9,460,000,000,000 kilometers! The closest neighbor star to our Sun, Proxima Centauri, is about 4.2 light-years away.",
        didYouKnow:
          "When you look at the stars tonight, you are looking back in time! The light from Proxima Centauri that hits your eye left the star over 4 years ago.",
        mathOrAnalogy:
          "1 light-year is 63,241 times the distance from Earth to the Sun! If 1 AU were an inch, a light-year would be a full mile.",
      },
      explorer: {
        summary:
          "A light-year (ly) is the distance an electromagnetic photon travels in an absolute vacuum in one Julian year (365.25 days of 86,400 SI seconds), equal to 9.4607 x 10^12 km.",
        takeaway:
          "1 light-year = c x (365.25 x 86,400s) = 9,460,730,472,580,800 meters ≈ 9.46 trillion km ≈ 63,241 AU.",
        deepDive:
          "The light-year is widely used in popular science and education because of its intuitive connection to cosmic lookback time. When we photograph the Orion Nebula at 1,344 light-years, we are witnessing starlight emitted during the twilight of the Roman Empire and the rise of early medieval civilizations. Starlight from the Andromeda Galaxy (2.5 million ly) left before modern Homo sapiens evolved on Earth.",
        didYouKnow:
          "Professional astronomers frequently prefer the unit 'parsec' (pc) over light-years, because parsecs are directly measured from observational parallax angles. 1 parsec ≈ 3.26 light-years.",
        mathOrAnalogy:
          "Calculations: c = 2.9979 x 10^5 km/s. Seconds in a Julian year = 31,557,600 s. Total distance = 2.9979 x 10^5 * 31,557,600 = 9.4607 x 10^12 km.",
      },
      astronomer: {
        summary:
          "The IAU formal definition of the light-year operates as a secondary astrometric unit tied to the Julian year. Astrometric catalogs (Gaia, Hipparcos) publish stellar data in parsecs derived from trigonometric parallax: d (pc) = 1 / ϖ (arcsec).",
        takeaway: "Relation: 1 pc = (1 AU) / tan(1″) ≈ 3.26156 ly ≈ 3.085677 x 10^16 m.",
        deepDive:
          "Trigonometric stellar parallax ϖ is the apparent annual angular displacement of a star against background quasars caused by Earth's orbital baseline (2 AU diameter). Because the nearest star has a parallax of only 0.768 arcseconds (Proxima Centauri), ground-based optical astronomy was limited by atmospheric seeing (~1 arcsec). Space missions like Hipparcos (1 milliarcsecond precision) and Gaia (sub-10 microarcsecond precision) expanded the direct trigonometric parallax horizon to the galactic center and Magellanic Clouds.",
        didYouKnow:
          "No star in the entire universe has a parallax angle as large as 1 full arcsecond! That's why Friedrich Bessel's first successful parallax measurement of 61 Cygni in 1838 was considered one of the greatest observational triumphs in history.",
        mathOrAnalogy:
          "Distance modulus formula: m - M = 5 * log_10(d_pc) - 5 + A_V (where m is apparent magnitude, M is absolute magnitude, and A_V is interstellar extinction).",
      },
    },
  },
  {
    id: "lesson-5-distances-between-stars",
    number: 5,
    title: "Distances between stars",
    subtitle: "The profound cosmic vacuum separating stellar island worlds",
    description:
      "Grasp the staggering emptiness of interstellar space and why science-fiction depictions of crowded starfields are misleading.",
    content: {
      junior: {
        summary:
          "Movies often show starships flying past stars every few seconds. In real life, stars are separated by mind-bending oceans of empty space! If our Sun were a tiny marble on the floor, the nearest neighbor star would be another marble hundreds of kilometers away.",
        takeaway:
          "Space is almost completely empty! Stars are like lonely lighthouses separated by vast dark oceans.",
        deepDive:
          "Between our Sun and Alpha Centauri, there are no other stars—just 40 trillion kilometers of cold, dark, quiet vacuum. If our Sun were shrunk to the size of a standard basketball, Earth would be a tiny grain of sand 26 meters away, and the closest star (Alpha Centauri) would be another basketball located over 7,000 kilometers away on another continent!",
        didYouKnow:
          "When two giant galaxies collide, their billions of stars almost NEVER hit each other! There is so much empty space between stars that galaxies pass right through each other like ghosts.",
        mathOrAnalogy:
          "The ratio of a star's physical size to the distance to its nearest neighbor is roughly 1 to 30,000,000. It's like two tennis balls on opposite sides of North America.",
      },
      explorer: {
        summary:
          "In the solar neighborhood of the Milky Way, the average distance between neighboring stellar systems is roughly 4 to 5 light-years (~4 x 10^13 km), creating a stellar density of only ~0.004 stars per cubic light-year.",
        takeaway:
          "The mean free path of stars in the galactic disk is so vast (~10^20 km) that direct physical collisions during galaxy mergers have a probability approaching zero.",
        deepDive:
          "The stellar diameter of the Sun is 1.39 x 10^6 km (~4.6 light-seconds). The distance to Proxima Centauri is 4.24 light-years (1.33 x 10^8 light-seconds). Thus, the distance between stars is nearly 30 million times larger than the physical size of the stars themselves! By comparison, the molecules in room-temperature air are separated by only ~10 times their molecular diameter. Interstellar space is billions of times emptier than the highest laboratory vacuums created on Earth.",
        didYouKnow:
          "Voyager 1 travels at ~17 km/s (61,200 km/h). Even at this blazing speed, it will take roughly 73,000 years to travel the distance equivalent to our nearest neighbor star!",
        mathOrAnalogy:
          "Volume comparison: A cube 5 light-years on each side contains ~125 cubic light-years of volume, yet typically houses only 1 or 2 stars whose combined volume is less than 10^-21 of that cube!",
      },
      astronomer: {
        summary:
          "Interstellar matter is governed by the Interstellar Medium (ISM) phases: hot ionized medium (HIM, n ~ 0.003 cm^-3), warm neutral medium (WNM, n ~ 0.5 cm^-3), and cold neutral/molecular clouds (CNM, n ~ 50–10^4 cm^-3).",
        takeaway:
          "Collision cross-section for stars: σ = π (R_1 + R_2)^2 * (1 + 2G(M_1 + M_2) / ((R_1 + R_2) v_rel^2)). Gravitational focusing is negligible in low-density disk fields.",
        deepDive:
          "Even in dense globular star clusters (e.g., M13 or Omega Centauri) where core stellar densities reach 100 to 1,000 stars per cubic parsec, stellar separations are still ~0.1 parsecs (~20,000 AU). Only in ultra-dense galactic nuclei containing supermassive black holes (like Sagittarius A*) do direct physical stellar tidal disruptions, hyper-velocity ejections, and stellar mergers occur with significant observational frequency.",
        didYouKnow:
          "Interstellar space is not truly empty: it is permeated by the interstellar radiation field (ISRF), cosmic rays, Galactic magnetic fields (~5 μG), and sparse interstellar hydrogen gas.",
        mathOrAnalogy:
          "Stellar collision timescale in the solar neighborhood: τ_coll = 1 / (n * σ * v) ≈ 10^18 years—many orders of magnitude longer than the current age of the universe (1.38 x 10^10 years).",
      },
    },
  },
  {
    id: "lesson-6-galactic-and-intergalactic-distances",
    number: 6,
    title: "Galactic and intergalactic distances",
    subtitle: "From kiloparsecs across the Milky Way to megaparsecs across the cosmic web",
    description:
      "Traverse the grandest scales in physics: stellar disks, galactic halos, galaxy clusters, and the particle horizon of the observable universe.",
    content: {
      junior: {
        summary:
          "Stars live together in gigantic stellar cities called galaxies! Our home galaxy, the Milky Way, contains over 100 billion stars. To measure the distance across a galaxy or between galaxies, even light-years need to be multiplied by millions and billions!",
        takeaway:
          "Our Milky Way is 100,000 light-years across. The nearest major spiral galaxy (Andromeda) is 2.5 million light-years away!",
        deepDive:
          "If our entire Solar System out to Pluto were shrunk to the size of a coin, the Milky Way galaxy would still be as wide as the United States! And the Milky Way is just one of hundreds of galaxies in our local neighborhood, which forms part of a gargantuan cosmic spiderweb stretching across 93 billion light-years.",
        didYouKnow:
          "There are an estimated two trillion galaxies in the observable universe, each containing billions or trillions of stars!",
        mathOrAnalogy:
          "A beam of light traveling at top speed takes 100,000 years just to cross from one end of our Milky Way to the other.",
      },
      explorer: {
        summary:
          "Cosmic distances beyond our galaxy are expressed in kiloparsecs (1 kpc = 1,000 pc ≈ 3,260 ly), megaparsecs (1 Mpc = 10^6 pc ≈ 3.26 million ly), and gigaparsecs (1 Gpc = 10^9 pc ≈ 3.26 billion ly).",
        takeaway:
          "The Milky Way stellar disk diameter is ~30 kpc (100,000 ly). The Local Group spans ~3 Mpc (10 million ly). The observable universe radius is ~14.2 Gpc (~46.5 billion ly).",
        deepDive:
          "Why is the observable universe 93 billion light-years in diameter if the universe is only 13.8 billion years old? Because space itself has been expanding continuously since the Big Bang! Light that set out 13 billion years ago was emitted from objects that have since been carried much farther away by metric cosmic expansion (Hubble flow). The current proper distance to that cosmic horizon is 46.5 billion light-years in every direction.",
        didYouKnow:
          "The Andromeda Galaxy (M31) is approaching the Milky Way at 110 kilometers per second. In approximately 4.5 billion years, our two galaxies will merge into a single giant elliptical galaxy nicknamed 'Milkomeda'.",
        mathOrAnalogy:
          "Scales: Solar system (10^-4 ly) → Star separation (~5 ly) → Galaxy diameter (~10^5 ly) → Galaxy cluster separation (~10^7 ly) → Cosmic horizon (~10^11 ly). Each step jumps by 4 to 6 orders of magnitude!",
      },
      astronomer: {
        summary:
          "Extragalactic distance determination requires the Cosmic Distance Ladder: trigonometric parallax (Gaia) → Cepheid period-luminosity relation (Leavitt law) → Type Ia supernovae standard candles → Hubble-Lemaître cosmological redshift z.",
        takeaway:
          "Hubble-Lemaître law: v = H_0 * d (where H_0 ≈ 67–73 km/s/Mpc). Proper distance: d_p = c ∫_0^z dz' / H(z').",
        deepDive:
          "In Friedmann-Lemaître-Robertson-Walker (FLRW) cosmology, several distinct distance measures exist for a given redshift z: comoving distance d_C, proper distance d_p(t), luminosity distance d_L = (1+z) d_C (governing flux reduction of supernovae), and angular diameter distance d_A = d_C / (1+z) (governing observed angular size of galaxies and CMB acoustic peaks). Understanding these relativistic distinctions prevents the naive fallacy of conflating lookback time (c * t_lookback) with spatial radius.",
        didYouKnow:
          "The 'Hubble Tension' is one of modern astrophysics' greatest unresolved mysteries: local distance ladder measurements (SH0ES via Cepheids and Type Ia supernovae) yield H_0 ≈ 73 km/s/Mpc, while early-universe CMB Planck measurements yield H_0 ≈ 67.4 km/s/Mpc.",
        mathOrAnalogy:
          "Luminosity distance vs Angular diameter distance relation: Etherington's reciprocity theorem: d_L = d_A * (1 + z)^2, rigorously holding in any metric theory of gravity where photons travel on null geodesics and photon number is conserved.",
      },
    },
  },
];

export const COSMIC_SCALE_STEPS: CosmicScaleStep[] = [
  {
    id: "step-human",
    name: "Human Scale",
    exponent: 0,
    meters: 1.7,
    formattedSize: "1.7 Meters",
    astronomicalEquivalent: "10^0 m",
    description: "The baseline human perspective: standing on the surface of Earth.",
    analogy: "A curious student gazing up at the stars.",
    category: "terrestrial",
    visualColor: "#38bdf8",
  },
  {
    id: "step-earth",
    name: "Planet Earth",
    exponent: 7,
    meters: 12742000,
    formattedSize: "12,742 Kilometers",
    astronomicalEquivalent: "1.27 x 10^7 m (0.000085 AU)",
    description: "Our terrestrial home planet, sheltered by a thin breathable atmosphere.",
    analogy:
      "If Earth were a basketball, our atmosphere would be thinner than a sheet of plastic wrap.",
    category: "terrestrial",
    visualColor: "#0ea5e9",
  },
  {
    id: "step-moon-orbit",
    name: "Moon's Orbit",
    exponent: 8,
    meters: 384400000,
    formattedSize: "384,400 Kilometers",
    astronomicalEquivalent: "3.84 x 10^8 m (1.28 Light-Seconds)",
    description: "The orbital track of Earth's only natural satellite.",
    analogy:
      "All other 7 planets in the solar system could fit side-by-side between Earth and the Moon!",
    category: "planetary",
    visualColor: "#cbd5e1",
  },
  {
    id: "step-solar-system",
    name: "Inner to Outer Solar System",
    exponent: 12,
    meters: 4500000000000,
    formattedSize: "4.5 Billion Kilometers (30 AU)",
    astronomicalEquivalent: "4.5 x 10^12 m (4.1 Light-Hours)",
    description: "The gravitational realm of the Sun out to the orbit of Neptune.",
    analogy: "Light from the Sun takes over 4 hours to reach icy Neptune.",
    category: "planetary",
    visualColor: "#facc15",
  },
  {
    id: "step-nearby-stars",
    name: "Nearby Stellar Neighborhood",
    exponent: 16,
    meters: 40140000000000000,
    formattedSize: "4.24 Light-Years (40.1 Trillion km)",
    astronomicalEquivalent: "4.0 x 10^16 m (268,000 AU)",
    description: "The distance from our Sun to our nearest stellar neighbor, Proxima Centauri.",
    analogy:
      "If the Sun were a grain of sand in New York, Proxima Centauri would be another grain in San Francisco.",
    category: "stellar",
    visualColor: "#f97316",
  },
  {
    id: "step-milky-way",
    name: "Milky Way Galaxy",
    exponent: 21,
    meters: 946073000000000000000,
    formattedSize: "100,000 Light-Years (30 kpc)",
    astronomicalEquivalent: "9.5 x 10^20 m (6.3 Billion AU)",
    description:
      "Our grand barred spiral galaxy containing over 100 billion stars and dark matter.",
    analogy:
      "A beam of light takes 100,000 years to cross from one edge of the galactic disk to the other.",
    category: "galactic",
    visualColor: "#a855f7",
  },
  {
    id: "step-local-group",
    name: "Local Group of Galaxies",
    exponent: 23,
    meters: 94607300000000000000000,
    formattedSize: "10 Million Light-Years (3 Mpc)",
    astronomicalEquivalent: "9.5 x 10^22 m",
    description:
      "A gravitational cluster of over 80 galaxies anchored by the Milky Way and Andromeda.",
    analogy:
      "The Milky Way and Andromeda are like two great whirlpools rushing toward each other across the dark.",
    category: "galactic",
    visualColor: "#ec4899",
  },
  {
    id: "step-observable-universe",
    name: "Observable Universe",
    exponent: 26,
    meters: 880000000000000000000000000,
    formattedSize: "93 Billion Light-Years (28.5 Gpc)",
    astronomicalEquivalent: "8.8 x 10^26 m",
    description:
      "The complete cosmological particle horizon from which light has had time to reach us since the Big Bang.",
    analogy:
      "Contains an estimated 2 trillion galaxies and 10^24 stars—more stars than grains of sand on all of Earth's beaches.",
    category: "cosmological",
    visualColor: "#6366f1",
  },
];

export const TRAVEL_VEHICLES: TravelTimeVehicle[] = [
  {
    id: "walking",
    name: "Walking on Foot",
    speedKmh: 5,
    formattedSpeed: "5 km/h",
    icon: "🚶",
    description: "Standard human walking pace.",
  },
  {
    id: "highway-car",
    name: "Highway Passenger Car",
    speedKmh: 100,
    formattedSpeed: "100 km/h",
    icon: "🚗",
    description: "Standard highway cruising speed without stops.",
  },
  {
    id: "commercial-jet",
    name: "Commercial Jet Airliner",
    speedKmh: 900,
    formattedSpeed: "900 km/h",
    icon: "✈️",
    description: "Boeing 787 / Airbus A350 cruising velocity.",
  },
  {
    id: "apollo-10",
    name: "Apollo 10 Command Module",
    speedKmh: 39897,
    formattedSpeed: "39,897 km/h (11.1 km/s)",
    icon: "🚀",
    description:
      "Highest speed achieved by a crewed vehicle (Earth atmospheric reentry return, May 1969).",
    isRealMission: true,
  },
  {
    id: "voyager-1",
    name: "Voyager 1 Space Probe",
    speedKmh: 61200,
    formattedSpeed: "61,200 km/h (17.0 km/s)",
    icon: "🛰️",
    description:
      "Robotic deep-space probe cruising through interstellar space after multiple gravity assists.",
    isRealMission: true,
  },
  {
    id: "speed-of-light",
    name: "Beam of Light (c)",
    speedKmh: 1079252848,
    formattedSpeed: "1.08 Billion km/h (299,792 km/s)",
    icon: "⚡",
    description: "The universal speed limit of physics in a vacuum.",
  },
];

export const TRAVEL_DESTINATIONS: TravelDestination[] = [
  {
    id: "dest-moon",
    name: "The Moon (Average Orbit)",
    distanceKm: 384400,
    formattedDistance: "384,400 Kilometers",
    lightTravelTime: "1.28 Seconds",
    lightSeconds: 1.28,
    trajectoryNote:
      "Real missions (Apollo 11, Artemis) fly on curved translunar injection ellipses taking roughly 3.0 to 4.5 days rather than straight lines.",
  },
  {
    id: "dest-sun",
    name: "The Sun (1.0 AU)",
    distanceKm: 149597871,
    distanceAU: 1.0,
    formattedDistance: "149.6 Million Kilometers (1.0 AU)",
    lightTravelTime: "8 Minutes 19 Seconds",
    lightSeconds: 499,
    trajectoryNote:
      "Direct flights to the Sun require massive energy (canceling Earth's 30 km/s orbital momentum). Parker Solar Probe uses 7 Venus gravity assists over 7 years.",
  },
  {
    id: "dest-mars",
    name: "Mars (Closest Approach)",
    distanceKm: 54600000,
    distanceAU: 0.36,
    formattedDistance: "54.6 Million Kilometers (Closest Opposition)",
    lightTravelTime: "3 Minutes 2 Seconds",
    lightSeconds: 182,
    trajectoryNote:
      "Spacecraft do not fly in a straight line; they travel on a Hohmann transfer orbit around the Sun taking roughly 7 to 9 months (~480 million km flown).",
  },
  {
    id: "dest-jupiter",
    name: "Jupiter (Closest Approach)",
    distanceKm: 588000000,
    distanceAU: 3.93,
    formattedDistance: "588 Million Kilometers",
    lightTravelTime: "32 Minutes 40 Seconds",
    lightSeconds: 1960,
    trajectoryNote:
      "Missions like Juno and Europa Clipper use Earth and Mars gravity assists over 5 to 6 years to rendezvous with Jupiter.",
  },
  {
    id: "dest-pluto",
    name: "Pluto (Average Orbit)",
    distanceKm: 5900000000,
    distanceAU: 39.5,
    formattedDistance: "5.9 Billion Kilometers (39.5 AU)",
    lightTravelTime: "5 Hours 28 Minutes",
    lightSeconds: 19680,
    trajectoryNote:
      "NASA's New Horizons probe was the fastest spacecraft ever launched from Earth (58,536 km/h) and used a Jupiter gravity boost to reach Pluto in 9.5 years.",
  },
  {
    id: "dest-proxima",
    name: "Proxima Centauri (Nearest Star)",
    distanceKm: 40140000000000,
    distanceLy: 4.24,
    formattedDistance: "40.1 Trillion km (4.24 Light-Years)",
    lightTravelTime: "4.24 Years",
    lightSeconds: 133860000,
    trajectoryNote:
      "Interstellar distances require propulsion concepts beyond chemical rockets (e.g., Breakthrough Starshot laser light-sails accelerating to 20% c).",
  },
];

export const BASKETBALL_SOLAR_SYSTEM: BasketballPlanetScale[] = [
  {
    name: "Sun (Center Anchor)",
    realDiameterKm: 1392700,
    scaleDiameterMm: 240, // 24 cm standard basketball
    scaleObjectAnalogy: "Standard 24 cm Basketball (anchor point)",
    realDistanceKm: 0,
    scaleDistanceMeters: 0,
    scaleDistanceAnalogy: "Placed at center court",
    colorHex: "#facc15",
  },
  {
    name: "Mercury",
    realDiameterKm: 4879,
    scaleDiameterMm: 0.84,
    scaleObjectAnalogy: "Tiny grain of coarse sand (0.8 mm)",
    realDistanceKm: 57900000,
    scaleDistanceMeters: 10.0,
    scaleDistanceAnalogy: "10 meters away (free-throw line distance)",
    colorHex: "#94a3b8",
  },
  {
    name: "Venus",
    realDiameterKm: 12104,
    scaleDiameterMm: 2.08,
    scaleObjectAnalogy: "Small sesame seed (2.1 mm)",
    realDistanceKm: 108200000,
    scaleDistanceMeters: 18.6,
    scaleDistanceAnalogy: "18.6 meters away (opposite 3-point arc)",
    colorHex: "#fde047",
  },
  {
    name: "Earth",
    realDiameterKm: 12742,
    scaleDiameterMm: 2.19,
    scaleObjectAnalogy: "Small pinhead or peppercorn (2.2 mm)",
    realDistanceKm: 149600000,
    scaleDistanceMeters: 25.8,
    scaleDistanceAnalogy: "25.8 meters away (baseline of the basketball court!)",
    colorHex: "#38bdf8",
  },
  {
    name: "Mars",
    realDiameterKm: 6779,
    scaleDiameterMm: 1.17,
    scaleObjectAnalogy: "Tiny pinhead (1.2 mm)",
    realDistanceKm: 227900000,
    scaleDistanceMeters: 39.2,
    scaleDistanceAnalogy: "39.2 meters away (outside the gymnasium doors)",
    colorHex: "#f87171",
  },
  {
    name: "Jupiter",
    realDiameterKm: 139820,
    scaleDiameterMm: 24.1,
    scaleObjectAnalogy: "A sweet grape or large marble (2.4 cm)",
    realDistanceKm: 778500000,
    scaleDistanceMeters: 134.2,
    scaleDistanceAnalogy: "134 meters away (over an entire football field away!)",
    colorHex: "#fb923c",
  },
  {
    name: "Saturn",
    realDiameterKm: 116460,
    scaleDiameterMm: 20.1,
    scaleObjectAnalogy: "A hazelnut (2.0 cm, plus thin paper ring)",
    realDistanceKm: 1433000000,
    scaleDistanceMeters: 247.0,
    scaleDistanceAnalogy: "247 meters away (two and a half football fields away)",
    colorHex: "#fde047",
  },
  {
    name: "Uranus",
    realDiameterKm: 50724,
    scaleDiameterMm: 8.7,
    scaleObjectAnalogy: "A small green pea (8.7 mm)",
    realDistanceKm: 2872000000,
    scaleDistanceMeters: 495.0,
    scaleDistanceAnalogy: "495 meters away (half a kilometer down the street)",
    colorHex: "#2dd4bf",
  },
  {
    name: "Neptune",
    realDiameterKm: 49244,
    scaleDiameterMm: 8.5,
    scaleObjectAnalogy: "A small blue blueberry (8.5 mm)",
    realDistanceKm: 4495000000,
    scaleDistanceMeters: 775.0,
    scaleDistanceAnalogy: "775 meters away (nearly 8 city blocks away)",
    colorHex: "#60a5fa",
  },
  {
    name: "Proxima Centauri (Nearest Star)",
    realDiameterKm: 214500,
    scaleDiameterMm: 37, // 3.7 cm golf ball
    scaleObjectAnalogy: "Another small orange (3.7 cm)",
    realDistanceKm: 40140000000000,
    scaleDistanceMeters: 6920000, // 6,920 kilometers!
    scaleDistanceAnalogy: "6,920 km away—all the way from New York to Paris or Berlin!",
    colorHex: "#ef4444",
  },
];

export const DISTANCE_UNIT_CHALLENGES = [
  {
    id: "match-1",
    scenario: "Distance from London to Tokyo or Earth's diameter",
    bestUnit: "Kilometers (km)",
    explanation: "Terrestrial surface distances are well within thousands of kilometers.",
    options: [
      "Kilometers (km)",
      "Astronomical Units (AU)",
      "Light-Years (ly)",
      "Megaparsecs (Mpc)",
    ],
  },
  {
    id: "match-2",
    scenario: "Distance from the Sun to Jupiter or Neptune",
    bestUnit: "Astronomical Units (AU)",
    explanation:
      "Planetary orbital semi-major axes range from 0.4 to 30 AU, making AU the ideal solar system ruler.",
    options: [
      "Kilometers (km)",
      "Astronomical Units (AU)",
      "Light-Years (ly)",
      "Megaparsecs (Mpc)",
    ],
  },
  {
    id: "match-3",
    scenario: "Radio signal communication delay with a Mars rover",
    bestUnit: "Light-Minutes",
    explanation:
      "Electromagnetic signals travel across the 0.36–2.5 AU interplanetary distance in 3 to 22 minutes.",
    options: ["Light-Seconds", "Light-Minutes", "Light-Years", "Kiloparsecs"],
  },
  {
    id: "match-4",
    scenario: "Distance to nearby stars like Sirius, Vega, or Betelgeuse",
    bestUnit: "Light-Years (ly)",
    explanation:
      "Interstellar distances range from 4.24 light-years to thousands of light-years across our spiral arm.",
    options: ["Astronomical Units (AU)", "Light-Hours", "Light-Years (ly)", "Gigaparsecs (Gpc)"],
  },
  {
    id: "match-5",
    scenario: "Distance between the Milky Way, Andromeda, and the Virgo Cluster",
    bestUnit: "Megaparsecs (Mpc)",
    explanation:
      "Intergalactic separations range from 0.78 Mpc (Andromeda) to 16.5 Mpc (Virgo cluster core).",
    options: ["Astronomical Units (AU)", "Light-Days", "Kilometers (km)", "Megaparsecs (Mpc)"],
  },
];

export const MODULE_03_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is an Astronomical Unit (AU)?",
    options: [
      "The total distance light travels in one full year",
      "The average distance from the center of the Earth to the center of the Sun (~150 million km)",
      "The width of our Milky Way galaxy",
      "The speed of the fastest rocket ever built",
    ],
    correctIndex: 1,
    explanation:
      "1 AU is officially defined as exactly 149,597,870,700 meters, corresponding to the mean orbital distance between Earth and the Sun.",
    hint: "Think about the baseline measuring stick of our home Solar System.",
  },
  {
    id: "q2",
    question: "Is a light-year a unit of time or a unit of distance?",
    options: [
      "It is a unit of time (it measures 365 days of light)",
      "It is a unit of distance (the distance light travels in one year)",
      "It measures the brightness of ancient stars",
      "It measures the weight of interstellar gas clouds",
    ],
    correctIndex: 1,
    explanation:
      "Despite containing the word 'year', a light-year is strictly a unit of length: approximately 9.46 trillion kilometers.",
    hint: "Like a 'car-hour' is the distance a car covers in 60 minutes.",
  },
  {
    id: "q3",
    question:
      "If we scale the Sun down to the size of a 24 cm basketball, how far away would Earth be?",
    options: [
      "Touching the basketball",
      "About 1 meter away on the same table",
      "About 26 meters away (the length of the entire basketball court)",
      "Over 100 kilometers away in another city",
    ],
    correctIndex: 2,
    explanation:
      "At this true physical ratio (1:5,800,000,000), Earth is a 2.2 mm pinhead located nearly 26 meters away from the basketball Sun!",
    hint: "Space between planetary orbits is vast: Earth sits at the far baseline of the court.",
  },
  {
    id: "q4",
    question: "Why can't NASA mission controllers drive Mars rovers with a real-time joystick?",
    options: [
      "Rovers use secret encrypted radio codes that take hours to decode",
      "Radio signals travel at light speed and take between 3 and 22 minutes to travel each way",
      "Rovers are only allowed to drive during Martian nighttime",
      "The Moon's gravity blocks all radio signals from reaching Mars directly",
    ],
    correctIndex: 1,
    explanation:
      "Because Earth and Mars are separated by tens of millions of kilometers, radio signals take 3 to 22 minutes to travel one way, requiring autonomous onboard obstacle avoidance.",
    hint: "Light speed is finite: signals take minutes to cross interplanetary space.",
  },
  {
    id: "q5",
    question:
      "When two large spiral galaxies collide in deep space, why do their stars almost never collide directly?",
    options: [
      "Magnetic repulsion forces push the stars away from each other",
      "Stars are separated by light-years of empty vacuum; their sizes are microscopic compared to the distance between them",
      "Stars turn into dark matter during collisions",
      "All stars have protective force fields generated by stellar winds",
    ],
    correctIndex: 1,
    explanation:
      "The distance between stars is tens of millions of times larger than the physical diameters of the stars themselves. Galaxies pass through each other like ghostly clouds of dust.",
    hint: "Remember the basketball analogy: if stars were basketballs, they would be separated by thousands of kilometers.",
  },
];

export const MODULE_03_SOURCES: ScientificSource[] = [
  {
    title: "NASA Solar System Scale & Distance Guide",
    organization: "NASA",
    url: "https://science.nasa.gov/solar-system/our-solar-system/",
    note: "Official planetary semi-major axes, physical radii, and light-travel calculations.",
  },
  {
    title:
      "International Astronomical Union (IAU) Resolution B2 on the Re-definition of the Astronomical Unit",
    organization: "IAU",
    url: "https://www.iau.org/static/resolutions/IAU2012_English.pdf",
    note: "Anchoring 1 au ≡ 149,597,870,700 m exactly in the SI metric system.",
  },
  {
    title: "BIPM: The International System of Units (SI) & Astronomical Units",
    organization: "NASA",
    url: "https://www.bipm.org/en/publications/si-brochure",
    note: "Standards for SI physical units, speed of light c, and astronomical conversion factors.",
  },
  {
    title: "ESA Planck & Hubble Cosmological Horizon Measurements",
    organization: "ESA",
    url: "https://www.cosmos.esa.int/web/planck",
    note: "Measurements of cosmological particle horizon, FLRW scale parameters, and Hubble constant.",
  },
];

export const MODULE_03_LESSON: LessonContract = {
  lessonId: "module-03-cosmic-scale-full",
  moduleId: "03",
  title: "Cosmic Distances & Scale",
  objectives: [
    "Comprehend why standard kilometers fail in deep space and why astronomical units and light-years are required",
    "Calculate and visualize light-travel times across lunar, planetary, and interstellar distances",
    "Explore the true scale of the solar system using the basketball-to-pinhead physical model",
    "Contrast illustrative straight-line travel times with real Keplerian mission trajectories",
    "Operate a continuous logarithmic scale explorer spanning 26 orders of physical magnitude",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Welcome to the Cosmic Scale Laboratory! Today, you'll discover why space is so gigantic that normal rulers break down, how fast a beam of light travels, and why stars are like lonely lighthouses separated by vast oceans of emptiness.",
      coreConcepts: [
        "Kilometers are too small for outer space",
        "1 AU is the distance from Earth to the Sun",
        "Light travels at 300,000 km every single second",
        "A light-year is a distance, not a measurement of time",
        "Space is mostly empty: stars almost never bump into each other",
      ],
      explanatoryText:
        "When you look at drawings of the solar system in a picture book, all the planets are crowded close together so they can fit on the page. But that is an illusion! In real space, planets are tiny specks separated by immense deserts of empty vacuum. In this laboratory, you will walk the true distances of the planets and race spacecraft against beams of light.",
      quizQuestions: MODULE_03_QUIZ.slice(0, 3),
      funFacts: [
        "If you could drive your car straight up at 100 km/h, you would reach space in 1 hour, the Moon in 5 months, and the Sun in 170 years!",
        "A beam of light can travel all the way around planet Earth 7.5 times in the blink of an eye (one second)!",
        "If the Sun were a basketball at one end of a gym, Earth would be a tiny pinhead at the other end, and Pluto would be a kilometer down the street!",
      ],
    },
    explorer: {
      introHook:
        "Investigate the mathematical architecture of cosmic scales. Step through 26 powers of ten, compare travel times between terrestrial vehicles and interplanetary probes, and discover why the Astronomical Unit and the light-year anchor the cosmic distance ladder.",
      coreConcepts: [
        "The Astronomical Unit (AU = 149.6 million km) standardizes heliocentric orbital mechanics",
        "Light speed c (299,792 km/s) imposes communication latencies on all robotic planetary probes",
        "1 light-year equals ~9.46 trillion km (63,241 AU)",
        "Stellar separation in the solar neighborhood is ~30 million times larger than stellar radii",
        "The observable universe diameter is 93 billion light-years due to continuous metric expansion",
      ],
      explanatoryText:
        "The Cosmic Scale Laboratory bridges intuitive human experience with astronomical reality. Because human perception evolved in a narrow terrestrial environment spanning tens of meters to a few hundred kilometers, grasping 10^12 meters or 10^26 meters requires specialized scientific tools: logarithmic visualizers, scale models, and time-of-flight comparisons. By examining why a phone screen cannot linearly represent the solar system to scale, students develop deep scientific intuition for proportional geometry.",
      quizQuestions: MODULE_03_QUIZ,
      funFacts: [
        "Voyager 1 is the most distant human-made artifact at over 164 AU away, yet its radio signals traveling at light speed still take nearly 23 hours to reach Earth!",
        "When the Andromeda Galaxy merges with the Milky Way in 4.5 billion years, not a single star is expected to collide because the space between stars is so unfathomably vast.",
        "The parsec (3.26 light-years) was created because it is directly measured from observational parallax: 1 AU divided by the tangent of 1 arcsecond.",
      ],
    },
    astronomer: {
      introHook:
        "Explore dimensional scaling, astrometric distance ladders, and FLRW cosmological expansion. Analyze relativistic lookback times, canonical Gaussian units, and the distinction between comoving and proper cosmological horizons.",
      coreConcepts: [
        "Gaussian canonical gravitational units vs SI metric standardization (IAU 2012 Res B2)",
        "Retarded time, null geodesics, and relativistic Shapiro gravitational delay in solar system telemetry",
        "Trigonometric parallax: d (pc) = 1 / ϖ (arcsec) as the anchor of the cosmic distance ladder",
        "Interstellar collision cross-sections and mean free path in the galactic disk: τ_coll >> 10^18 yr",
        "FLRW metric distances: comoving (d_C), luminosity (d_L), and angular diameter (d_A)",
      ],
      explanatoryText:
        "At advanced levels, astrophysical distance determination ceases to be a simple ruler measurement and becomes an intricate interplay of general relativity, stellar astrophysics, and observational cosmology. Students analyze how the cosmic distance ladder transitions from direct geometric trigonometric parallax (Gaia satellite) to standard candles (Cepheids via the Leavitt law, Type Ia supernovae), and ultimately to Hubble-Lemaître expansion parameters governing cosmological redshift z.",
      quizQuestions: MODULE_03_QUIZ,
      mathExplanation:
        "Parallax: d = 1/ϖ. Distance modulus: μ = m - M = 5 log_10(d_pc) - 5. FLRW comoving distance: d_C = (c / H_0) ∫_0^z dz' / E(z').",
      funFacts: [
        "Because of relativistic space expansion, the most distant galaxies imaged by the James Webb Space Telescope were only a few billion light-years away when they emitted the light, but are now over 33 billion light-years away from us.",
        "The Shapiro time delay caused by the Sun's gravity was measured by the Cassini spacecraft to an accuracy of 20 parts per million, confirming general relativity's prediction for spacetime curvature.",
      ],
    },
  },
  visualizationType: "cosmic-scale",
  interactions: [
    "Continuous logarithmic scale slider spanning 26 orders of magnitude (10^0 to 10^26 m)",
    "Earth vs Jupiter vs Sun interactive 3D/2D relative size comparator",
    "Speed of light pulse simulator and travel time calculator",
    "Driving vs Spacecraft vs Light speed trip comparator with transparent mathematics",
    "Interactive Basketball Sun scale model with real-world walking analogies",
    "Celestial distance unit matching challenge game",
    "Optional logarithmic powers-of-ten scale chart for advanced students",
  ],
  relatedConcepts: [
    "Astronomical Unit (AU)",
    "Light-Year (ly)",
    "Parsec (pc)",
    "Speed of Light (c)",
    "Powers of Ten",
    "Cosmic Distance Ladder",
    "Metric Expansion of Space",
    "Hohmann Transfer Orbit",
  ],
  completionCriteria:
    "Explore the continuous logarithmic scale visualizer, test the vehicle travel calculator, try the basketball scale model, and pass the cosmic scale knowledge check.",
  scientificSources: MODULE_03_SOURCES,
};
