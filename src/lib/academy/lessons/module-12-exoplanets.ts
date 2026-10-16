import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface ConfirmedExoplanetSystem {
  id: string;
  name: string;
  hostStar: string;
  spectralType: "M" | "K" | "G" | "F";
  distanceLy: number;
  discoveryMethod: "Transit" | "Radial Velocity" | "Direct Imaging" | "Microlensing";
  discoveryYear: number;
  observatory: string;
  habitableZoneAU: [number, number];
  planets: {
    name: string;
    semiMajorAxisAU: number;
    periodDays: number;
    radiusEarth: number;
    massEarth: number;
    inHabitableZone: boolean;
    planetType: "Rocky Terrestrial" | "Super-Earth" | "Sub-Neptune" | "Gas Giant" | "Hot Jupiter";
    equilibriumTempK: number;
    transitDepthPpm: number;
    rvAmplitudeMs: number;
  }[];
  description: string;
}

export const REAL_EXOPLANET_SYSTEMS: ConfirmedExoplanetSystem[] = [
  {
    id: "trappist-1",
    name: "TRAPPIST-1 System",
    hostStar: "TRAPPIST-1 (Ultra-cool M-dwarf)",
    spectralType: "M",
    distanceLy: 40.7,
    discoveryMethod: "Transit",
    discoveryYear: 2017,
    observatory: "Spitzer Space Telescope & TRAPPIST",
    habitableZoneAU: [0.024, 0.049],
    planets: [
      {
        name: "TRAPPIST-1 b",
        semiMajorAxisAU: 0.0115,
        periodDays: 1.51,
        radiusEarth: 1.12,
        massEarth: 1.37,
        inHabitableZone: false,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 400,
        transitDepthPpm: 7260,
        rvAmplitudeMs: 3.1,
      },
      {
        name: "TRAPPIST-1 c",
        semiMajorAxisAU: 0.0158,
        periodDays: 2.42,
        radiusEarth: 1.1,
        massEarth: 1.31,
        inHabitableZone: false,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 342,
        transitDepthPpm: 6870,
        rvAmplitudeMs: 2.7,
      },
      {
        name: "TRAPPIST-1 d",
        semiMajorAxisAU: 0.0223,
        periodDays: 4.05,
        radiusEarth: 0.79,
        massEarth: 0.39,
        inHabitableZone: false,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 288,
        transitDepthPpm: 3670,
        rvAmplitudeMs: 1.2,
      },
      {
        name: "TRAPPIST-1 e",
        semiMajorAxisAU: 0.0293,
        periodDays: 6.1,
        radiusEarth: 0.92,
        massEarth: 0.69,
        inHabitableZone: true,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 251,
        transitDepthPpm: 5100,
        rvAmplitudeMs: 1.8,
      },
      {
        name: "TRAPPIST-1 f",
        semiMajorAxisAU: 0.0385,
        periodDays: 9.21,
        radiusEarth: 1.05,
        massEarth: 1.04,
        inHabitableZone: true,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 219,
        transitDepthPpm: 6380,
        rvAmplitudeMs: 2.2,
      },
      {
        name: "TRAPPIST-1 g",
        semiMajorAxisAU: 0.0469,
        periodDays: 12.35,
        radiusEarth: 1.15,
        massEarth: 1.32,
        inHabitableZone: true,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 199,
        transitDepthPpm: 7650,
        rvAmplitudeMs: 2.5,
      },
      {
        name: "TRAPPIST-1 h",
        semiMajorAxisAU: 0.0619,
        periodDays: 18.77,
        radiusEarth: 0.77,
        massEarth: 0.33,
        inHabitableZone: false,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 173,
        transitDepthPpm: 3400,
        rvAmplitudeMs: 1.0,
      },
    ],
    description:
      "A landmark planetary system around an ultra-cool red dwarf star possessing seven Earth-sized rocky worlds, three of which orbit squarely in the liquid-water circumstellar habitable zone.",
  },
  {
    id: "proxima-centauri",
    name: "Proxima Centauri System",
    hostStar: "Proxima Centauri (M5.5V)",
    spectralType: "M",
    distanceLy: 4.24,
    discoveryMethod: "Radial Velocity",
    discoveryYear: 2016,
    observatory: "ESO HARPS / VLT",
    habitableZoneAU: [0.04, 0.08],
    planets: [
      {
        name: "Proxima Centauri d",
        semiMajorAxisAU: 0.029,
        periodDays: 5.12,
        radiusEarth: 0.81,
        massEarth: 0.26,
        inHabitableZone: false,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 355,
        transitDepthPpm: 520,
        rvAmplitudeMs: 0.65,
      },
      {
        name: "Proxima Centauri b",
        semiMajorAxisAU: 0.0486,
        periodDays: 11.19,
        radiusEarth: 1.07,
        massEarth: 1.07,
        inHabitableZone: true,
        planetType: "Rocky Terrestrial",
        equilibriumTempK: 234,
        transitDepthPpm: 910,
        rvAmplitudeMs: 1.24,
      },
    ],
    description:
      "Our closest stellar neighbor hosts an Earth-mass exoplanet (Proxima b) in its habitable zone. However, severe stellar flares pose significant challenges for atmospheric retention.",
  },
  {
    id: "kepler-452",
    name: "Kepler-452 System",
    hostStar: "Kepler-452 (G2V Sun-analog)",
    spectralType: "G",
    distanceLy: 1400,
    discoveryMethod: "Transit",
    discoveryYear: 2015,
    observatory: "NASA Kepler Space Telescope",
    habitableZoneAU: [0.95, 1.45],
    planets: [
      {
        name: "Kepler-452 b",
        semiMajorAxisAU: 1.046,
        periodDays: 384.8,
        radiusEarth: 1.63,
        massEarth: 3.29,
        inHabitableZone: true,
        planetType: "Super-Earth",
        equilibriumTempK: 265,
        transitDepthPpm: 215,
        rvAmplitudeMs: 0.45,
      },
    ],
    description:
      "Often hailed as 'Earth's older cousin', Kepler-452b orbits a Sun-like star with an orbital period of 385 days, receiving 10% more energy than Earth does from our Sun.",
  },
  {
    id: "51-pegasi",
    name: "51 Pegasi System",
    hostStar: "51 Pegasi (G5V)",
    spectralType: "G",
    distanceLy: 50.45,
    discoveryMethod: "Radial Velocity",
    discoveryYear: 1995,
    observatory: "Observatoire de Haute-Provence (ELODIE)",
    habitableZoneAU: [1.1, 1.6],
    planets: [
      {
        name: "51 Pegasi b (Dimidium)",
        semiMajorAxisAU: 0.0527,
        periodDays: 4.23,
        radiusEarth: 13.4,
        massEarth: 150.0,
        inHabitableZone: false,
        planetType: "Hot Jupiter",
        equilibriumTempK: 1284,
        transitDepthPpm: 0,
        rvAmplitudeMs: 55.9,
      },
    ],
    description:
      "The historic first exoplanet confirmed around a main-sequence Sun-like star, awarded the 2019 Nobel Prize in Physics to Michel Mayor and Didier Queloz. It established the existence of 'Hot Jupiters'.",
  },
  {
    id: "wasp-12",
    name: "WASP-12 System",
    hostStar: "WASP-12 (F9V)",
    spectralType: "F",
    distanceLy: 1410,
    discoveryMethod: "Transit",
    discoveryYear: 2008,
    observatory: "SuperWASP Survey",
    habitableZoneAU: [1.3, 1.9],
    planets: [
      {
        name: "WASP-12 b",
        semiMajorAxisAU: 0.0229,
        periodDays: 1.09,
        radiusEarth: 21.3,
        massEarth: 448.0,
        inHabitableZone: false,
        planetType: "Hot Jupiter",
        equilibriumTempK: 2580,
        transitDepthPpm: 14500,
        rvAmplitudeMs: 226.0,
      },
    ],
    description:
      "An extreme tidally distorted hot Jupiter being actively stripped and consumed by its host star, with surface temperatures exceeding 2500 K and an egg-like eggshell geometry.",
  },
];

export const MODULE_12_SUBLESSONS: SubLesson[] = [
  {
    id: "12-1",
    title: "The Exoplanet Revolution: Beyond Our Solar System",
    durationMinutes: 6,
    contentByLevel: {
      junior:
        "For centuries, humans wondered if other stars had families of planets just like our Sun. In 1995, astronomers made history by discovering the very first planet orbiting a sun-like star! Today, we know of more than 5,500 planets beyond our solar system, called exoplanets. Some are giant gas balls hotter than lava, while others are icy or rocky worlds like Earth.",
      explorer:
        "An exoplanet (extrasolar planet) is any planet that orbits a star outside our solar system. Because exoplanets are trillions of kilometers away and drowned out by the blinding glare of their host stars, direct photography is exceptionally difficult—comparable to spotting a firefly buzzing next to a giant searchlight thousands of kilometers away. Instead, astronomers rely on ingenious indirect detection techniques like transit photometry and radial velocity wobbles.",
      astronomer:
        "The observational confirmation of 51 Pegasi b by Mayor & Queloz (1995) completely revolutionized planetary astrophysics. Prior models assumed solar system architecture was typical: rocky worlds close in, gas giants beyond the snow line (~2.7 AU). The discovery of a Jupiter-mass planet orbiting at 0.05 AU with a 4.2-day period proved planetary migration occurs via disk-gas interactions or planet-planet gravitational scattering, prompting universal reform in accretion disk thermodynamics.",
    },
    keyTakeaways: [
      "More than 5,500 exoplanets have been confirmed using modern space telescopes like Kepler and TESS.",
      "Most exoplanets cannot be seen directly because host stars are a billion times brighter than reflected planetary light.",
      "Planetary systems exhibit vastly greater diversity than our own Solar System, including Hot Jupiters and Super-Earths.",
    ],
  },
  {
    id: "12-2",
    title: "Transit Photometry: Measuring Light Dips and Planet Sizes",
    durationMinutes: 8,
    contentByLevel: {
      junior:
        "Imagine a tiny moth flying in front of a bright light bulb. The bulb dims just a tiny fraction of a percent for a short moment. When an exoplanet passes between its star and our telescope, it blocks a tiny speck of starlight! By measuring how much the star dims, astronomers can calculate exactly how big the planet is.",
      explorer:
        "Transit photometry measures the periodic dip in a star's apparent brightness as an exoplanet transits across the stellar disk. The fractional dip depth (ΔF / F) is equal to the ratio of planetary cross-sectional area to stellar cross-sectional area: (R_p / R_*)^2. For an Earth-sized planet passing a Sun-like star, the transit depth is approximately 0.0084% (84 parts per million), requiring ultra-precise space observatories like Kepler and TESS.",
      astronomer:
        "The primary observable parameters extracted from high-cadence transit light curves include the transit depth δ = (R_p / R_*)^2, transit duration T_dur = (P / π) * arcsin( (R_* / a) * sqrt( (1 + k)^2 - b^2 ) / sin(i) ), and ingress/egress slopes governed by limb-darkening coefficients (quadratic or nonlinear Claret laws). Transit timing variations (TTVs) further reveal unseen non-transiting companion planets through mutual gravitational perturbations.",
    },
    keyTakeaways: [
      "The transit method measures fractional brightness dips when a planet crosses in front of its star.",
      "Transit depth directly reveals the planet's radius relative to the star: ΔF/F ≈ (R_p / R_*)^2.",
      "Kepler and TESS discovered thousands of worlds using transit photometry.",
    ],
  },
  {
    id: "12-3",
    title: "Radial Velocity: The Gravitational Stellar Wobble",
    durationMinutes: 8,
    contentByLevel: {
      junior:
        "When an athlete swings a heavy hammer around, their own body wobbles slightly in a circle. Planets don't just orbit a still star; both the star and the planet orbit a shared balance point called the center of mass! As the star wobbles toward us, its light shifts slightly blue; as it wobbles away, its light shifts red.",
      explorer:
        "The radial velocity (Doppler wobble) method tracks periodic Doppler shifts in a star's spectral absorption lines. As the star moves toward Earth in its orbit about the mutual barycenter, spectral lines blueshift; as it moves away, they redshift. The amplitude of this velocity wave (K) depends on the planet's mass and orbital inclination. Because the inclination angle i is usually unknown without a transit, radial velocity yields the minimum mass: M_p * sin(i).",
      astronomer:
        "The semi-amplitude of the radial velocity signal is given by K = (2π G / P)^(1/3) * (M_p * sin i) / (M_* + M_p)^(2/3) * 1 / sqrt(1 - e^2). State-of-the-art spectrographs like ESPRESSO on ESO's VLT achieve velocity precisions down to ~10 cm/s (a walking pace), allowing detection of low-mass rocky worlds around quiet M-dwarfs. Combining transit radii with radial velocity masses yields bulk density ρ = M_p / (4/3 π R_p^3), breaking degeneracies between rocky super-Earths and volatile-rich mini-Neptunes.",
    },
    keyTakeaways: [
      "Planets cause their host stars to wobble around their mutual center of mass (barycenter).",
      "Doppler shifts in stellar spectral lines reveal the radial velocity semi-amplitude K.",
      "Radial velocity provides planetary mass (M_p sin i); combined with transit radius, it calculates bulk density.",
    ],
  },
  {
    id: "12-4",
    title: "Habitable Zones & Atmospheric Spectroscopy",
    durationMinutes: 8,
    contentByLevel: {
      junior:
        "Just like standing too close to a bonfire makes you too hot and standing too far makes you freeze, planets need to be at just the right distance from their star so water can stay liquid. This sweet spot is called the 'Goldilocks Zone' or Habitable Zone! Telescopes like the James Webb Space Telescope can even taste the air of these worlds to look for water vapor and clouds.",
      explorer:
        "The circumstellar habitable zone (HZ) is the orbital shell where liquid water can stably exist on a planet's surface under suitable atmospheric pressure. The boundaries depend primarily on stellar luminosity: inner edge (runaway greenhouse) and outer edge (maximum greenhouse CO2 condensation). Atmospheric transmission spectroscopy, conducted during transit as starlight filters through the planetary atmosphere's thin ring, reveals chemical signatures such as H2O, CO2, CH4, and aerosol hazes.",
      astronomer:
        "Insolation flux scales as S_eff = L_* / d^2. According to Kopparapu et al. (2013) climate models, the conservative habitable zone spans S_eff ≈ 1.05 to 0.35 times modern Earth insolation. For M-dwarf systems (e.g. TRAPPIST-1), the HZ is compressed within 0.02–0.05 AU, causing tidal locking (synchronous rotation with permanent day and night sides) and exposure to intense XUV flare erosion. Transmission spectroscopy with JWST NIRSpec/NIRISS measures atmospheric scale height H = k_B T / (μ g) to characterize secondary atmospheres.",
    },
    keyTakeaways: [
      "Circumstellar habitable zones depend on stellar luminosity and planetary atmospheric greenhouse properties.",
      "Atmospheric transmission spectroscopy analyzes filtered starlight to detect water vapor, carbon dioxide, and clouds.",
      "M-dwarf habitable zones are very close to their stars, leading to tidal locking and stellar flare exposure.",
    ],
  },
];

export const MODULE_12_QUIZ: QuizQuestion[] = [
  {
    id: "q12-1",
    question:
      "What physical quantity is directly determined by measuring the fractional depth (ΔF / F) of a transit light curve?",
    options: [
      "The exoplanet's core magnetic field strength",
      "The ratio of the planet's radius to the star's radius squared",
      "The exact age of the planetary system",
      "The planet's surface gravity directly without mass data",
    ],
    correctIndex: 1,
    explanation:
      "The transit depth represents the fraction of the stellar disk obscured by the planet during transit: ΔF / F = (R_p / R_*)^2.",
  },
  {
    id: "q12-2",
    question:
      "Why does the radial velocity method typically yield a minimum mass (M_p * sin i) rather than an exact mass?",
    options: [
      "Because spectrometers cannot measure speeds faster than light",
      "Because the orbital inclination angle relative to our line of sight is usually unknown",
      "Because planets lose mass during each periastron passage",
      "Because starlight loses energy through cosmological redshift",
    ],
    correctIndex: 1,
    explanation:
      "The Doppler effect measures velocity along our line of sight. Unless a transit occurs (indicating inclination i ≈ 90°), the tilt angle i remains unknown, leaving M_p * sin(i) as the lower bound.",
  },
  {
    id: "q12-3",
    question:
      "What is the bulk consequence of combining transit photometry with radial velocity measurements for the same exoplanet?",
    options: [
      "You can determine the planet's mean density and distinguish rocky worlds from gas-rich planets",
      "You can immediately prove the existence of alien vegetation",
      "The host star's nuclear fusion ceases during transit",
      "The planet's orbital speed drops to zero",
    ],
    correctIndex: 0,
    explanation:
      "Transit gives radius R_p and radial velocity gives mass M_p. Together, density ρ = M / (4/3 π R^3) reveals whether the world is iron-rock, water-rich, or a gas dwarf.",
  },
  {
    id: "q12-4",
    question:
      "What unique feature characterizes the TRAPPIST-1 system located 40 light-years away?",
    options: [
      "It consists of a single massive gas giant larger than Jupiter",
      "It contains seven Earth-sized rocky planets, with three in the circumstellar habitable zone",
      "It orbits inside the core of a supermassive black hole",
      "Its planets have orbits tilted 90 degrees to each other",
    ],
    correctIndex: 1,
    explanation:
      "TRAPPIST-1 hosts seven Earth-sized terrestrial planets in compact resonant orbits around an ultra-cool M-dwarf, three of which (e, f, g) reside in the habitable zone.",
  },
  {
    id: "q12-5",
    question:
      "How do habitable zone distances differ between an ultra-cool red dwarf (M-star) and a hot G-type star like our Sun?",
    options: [
      "The M-star habitable zone is located much closer to the star because its luminosity is far lower",
      "The M-star habitable zone is 100 times farther out than Jupiter's orbit",
      "Red dwarfs have no habitable zones under any circumstances",
      "All stars have habitable zones at exactly 1.0 Astronomical Unit",
    ],
    correctIndex: 0,
    explanation:
      "Because red dwarf stars emit only 0.01% to 1% of the Sun's luminosity, their habitable zones are compressed very close in (typically 0.02 to 0.1 AU).",
  },
];

export const MODULE_12_SOURCES: ScientificSource[] = [
  {
    title: "NASA Exoplanet Archive: Confirmed Planets Data Table",
    organization: "NASA / Caltech IPAC",
    url: "https://exoplanetarchive.ipac.caltech.edu/",
  },
  {
    title: "Mayor & Queloz (1995) A Jupiter-Mass Companion to a Solar-Type Star",
    organization: "Nature (Vol 378, pp 355–359)",
    url: "https://www.nature.com/articles/378355a0",
  },
  {
    title: "Gillon et al. (2017) Seven temperate terrestrial planets around TRAPPIST-1",
    organization: "Nature (Vol 542, pp 456–460)",
    url: "https://www.nature.com/articles/nature21360",
  },
  {
    title: "Kopparapu et al. (2013) Habitable Zones around Main-Sequence Stars: New Estimates",
    organization: "The Astrophysical Journal (ApJ 765, 131)",
    url: "https://iopscience.iop.org/article/10.1088/0004-637X/765/2/131",
  },
  {
    title: "JWST Transiting Exoplanet Community Early Release Science Program",
    organization: "STScI / NASA",
    url: "https://webbtelescope.org/contents/news-releases/2022/news-2022-045",
  },
];
