import type { LearningLevel, LessonContract, QuizQuestion, ScientificSource } from "../types";

export interface LightTravelTarget {
  id: string;
  name: string;
  category: "solar_system" | "nearby_star" | "deep_space" | "distant_galaxy";
  distanceKm?: number;
  distanceLy?: number;
  distanceDisplay: string;
  lightTravelTimeSeconds: number;
  lightTravelTimeDisplay: string;
  lookbackEraEarth: string;
  description: string;
  colorHex: string;
  radiusScale: number; // for visual representation
  simulationDurationSec: number; // base animation duration in seconds for UI pulse
}

export interface SpectrumBand {
  id: string;
  name: string;
  wavelengthRange: string;
  wavelengthMeters: number; // representative mid-value in meters
  frequencyHz: number; // c / lambda
  energyEv: number; // photon energy in electron-volts
  colorTheme: string;
  visibleToHumanEyes: boolean;
  cosmicSources: string[];
  telescopesUsed: string[];
  whatWeLearn: string;
  temperatureKelvinRange: string;
}

export interface SpectralElement {
  symbol: string;
  name: string;
  linesNm: number[]; // wavelength in nanometers
  color: string;
  stellarPresence: string;
  description: string;
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

export const LIGHT_TRAVEL_TARGETS: LightTravelTarget[] = [
  {
    id: "moon",
    name: "The Moon",
    category: "solar_system",
    distanceKm: 384400,
    distanceDisplay: "384,400 km (0.00257 AU)",
    lightTravelTimeSeconds: 1.282,
    lightTravelTimeDisplay: "1.28 seconds",
    lookbackEraEarth: "You see the Moon as it was just over a second ago—a brief heartbeat!",
    description:
      "Our natural satellite. When Apollo astronauts spoke with Houston Mission Control from the lunar surface, there was an unavoidable 2.6-second round-trip radio delay.",
    colorHex: "#e2e8f0",
    radiusScale: 0.27,
    simulationDurationSec: 2.5,
  },
  {
    id: "sun",
    name: "The Sun",
    category: "solar_system",
    distanceKm: 149597870,
    distanceDisplay: "149.6 Million km (1.00 AU)",
    lightTravelTimeSeconds: 499,
    lightTravelTimeDisplay: "8 minutes 19 seconds",
    lookbackEraEarth:
      "If the Sun were to suddenly vanish right now, Earth would continue orbiting in bright daylight for another 8 minutes and 19 seconds!",
    description:
      "Our G-type main sequence star. Nuclear fusion in the core produces photons that take ~100,000 years to reach the solar surface, but once free, they sprint to Earth in under 9 minutes.",
    colorHex: "#fbbf24",
    radiusScale: 1.8,
    simulationDurationSec: 4.5,
  },
  {
    id: "mars",
    name: "Mars",
    category: "solar_system",
    distanceKm: 225000000,
    distanceDisplay: "225 Million km (avg 1.52 AU)",
    lightTravelTimeSeconds: 750,
    lightTravelTimeDisplay: "12.5 minutes (3 to 22 min depending on orbit)",
    lookbackEraEarth:
      "NASA rover drivers on Earth cannot use joysticks; the Curiosity and Perseverance rovers must navigate autonomously because commands take 12.5 minutes to arrive.",
    description:
      "The Red Planet. Because both Earth and Mars follow elliptical orbits around the Sun, the light travel time fluctuates dramatically from 3 minutes at closest approach to over 22 minutes at solar conjunction.",
    colorHex: "#f87171",
    radiusScale: 0.53,
    simulationDurationSec: 5.5,
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "solar_system",
    distanceKm: 778500000,
    distanceDisplay: "778.5 Million km (5.20 AU)",
    lightTravelTimeSeconds: 2596,
    lightTravelTimeDisplay: "43 minutes 16 seconds",
    lookbackEraEarth:
      "In 1676, Danish astronomer Ole Rømer noticed eclipses of Jupiter's moon Io occurred later when Earth was farther away, making the first measurement of the finite speed of light!",
    description:
      "The solar system's king planet. Sunlight reaching Jupiter's icy Galilean moons (Io, Europa, Ganymede, Callisto) left the Sun nearly three-quarters of an hour earlier.",
    colorHex: "#fdba74",
    radiusScale: 1.2,
    simulationDurationSec: 6.5,
  },
  {
    id: "proxima_centauri",
    name: "Proxima Centauri",
    category: "nearby_star",
    distanceLy: 4.246,
    distanceDisplay: "4.246 Light-Years (40.17 Trillion km)",
    lightTravelTimeSeconds: 1.34e8,
    lightTravelTimeDisplay: "4.25 years (4 years, 3 months)",
    lookbackEraEarth:
      "The starlight striking your eyes tonight set out when you were several years younger. If someone on Proxima b waved a giant laser today, we would not see it until 4 years in the future.",
    description:
      "A red dwarf star in the Alpha Centauri triple star system, and the closest known stellar neighbor to our Sun. It hosts at least two confirmed exoplanets.",
    colorHex: "#ef4444",
    radiusScale: 0.6,
    simulationDurationSec: 7.5,
  },
  {
    id: "sirius",
    name: "Sirius (The Dog Star)",
    category: "nearby_star",
    distanceLy: 8.611,
    distanceDisplay: "8.611 Light-Years (81.46 Trillion km)",
    lightTravelTimeSeconds: 2.71e8,
    lightTravelTimeDisplay: "8.6 years",
    lookbackEraEarth:
      "The sparkling blue-white starlight you observe tonight departed Sirius when an 8-year-old child was born!",
    description:
      "The brightest star in Earth's night sky, located in Canis Major. Sirius is an A-type binary system: a luminous main-sequence star orbited by a tiny, Earth-sized white dwarf companion (Sirius B).",
    colorHex: "#93c5fd",
    radiusScale: 0.9,
    simulationDurationSec: 8.0,
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    category: "nearby_star",
    distanceLy: 642.5,
    distanceDisplay: "642.5 Light-Years (6.08 Quadrillion km)",
    lightTravelTimeSeconds: 2.03e10,
    lightTravelTimeDisplay: "642.5 years",
    lookbackEraEarth:
      "The reddish photons landing in your telescope left Betelgeuse in the late 14th century—during the European Middle Ages and the Ming Dynasty in China!",
    description:
      "A pulsating red supergiant in Orion. Betelgeuse is so colossal that if placed at the center of our solar system, its turbulent outer photosphere would engulf Mercury, Venus, Earth, and Mars.",
    colorHex: "#f97316",
    radiusScale: 1.5,
    simulationDurationSec: 9.0,
  },
  {
    id: "sagittarius_a",
    name: "Sagittarius A* (Milky Way Core)",
    category: "deep_space",
    distanceLy: 26700,
    distanceDisplay: "26,700 Light-Years (252.6 Quadrillion km)",
    lightTravelTimeSeconds: 8.42e11,
    lightTravelTimeDisplay: "26,700 years",
    lookbackEraEarth:
      "When this light left the supermassive black hole at the center of our galaxy, human Neanderthals had just vanished, and prehistoric Homo sapiens were painting cave walls in Lascaux during the last Ice Age.",
    description:
      "The 4-million-solar-mass supermassive black hole anchoring the center of our Milky Way. Radio and infrared waves pierce the dense dust clouds of the galactic plane to reach observatories on Earth.",
    colorHex: "#a855f7",
    radiusScale: 1.1,
    simulationDurationSec: 10.0,
  },
  {
    id: "andromeda",
    name: "Andromeda Galaxy (M31)",
    category: "distant_galaxy",
    distanceLy: 2537000,
    distanceDisplay: "2.537 Million Light-Years",
    lightTravelTimeSeconds: 8.0e13,
    lightTravelTimeDisplay: "2.537 Million years",
    lookbackEraEarth:
      "The most distant object visible to the unaided human eye! This light left Andromeda when our early hominid ancestors (Australopithecus / early Homo habilis) were just crafting the very first stone tools in Africa.",
    description:
      "A grand spiral galaxy containing over one trillion stars. It is hurtling toward our Milky Way at 110 kilometers per second and will collide with us in 4.5 billion years.",
    colorHex: "#38bdf8",
    radiusScale: 1.6,
    simulationDurationSec: 11.0,
  },
  {
    id: "sombrero",
    name: "Sombrero Galaxy (M104)",
    category: "distant_galaxy",
    distanceLy: 29300000,
    distanceDisplay: "29.3 Million Light-Years",
    lightTravelTimeSeconds: 9.24e14,
    lightTravelTimeDisplay: "29.3 Million years",
    lookbackEraEarth:
      "This light embarked during the Oligocene Epoch on Earth—decades of millions of years before humans existed, when early primates and prehistoric mammals roamed subtropical forests.",
    description:
      "A luminous spiral galaxy in Virgo famous for its brilliant white bulbous nucleus and prominent dark absorption dust lane encircling its rim like a sombrero hat.",
    colorHex: "#facc15",
    radiusScale: 1.4,
    simulationDurationSec: 12.0,
  },
  {
    id: "gn_z11",
    name: "GN-z11 (Early JWST Galaxy)",
    category: "distant_galaxy",
    distanceLy: 13400000000,
    distanceDisplay: "13.4 Billion Light-Years (Lookback Time)",
    lightTravelTimeSeconds: 4.22e17,
    lightTravelTimeDisplay: "13.4 Billion years (z = 10.6)",
    lookbackEraEarth:
      "This ancient light departed just 400 million years after the Big Bang! Earth, our Sun, and our entire Milky Way galaxy did not even exist for another 8.8 billion years after this photon set sail.",
    description:
      "One of the earliest and most distant galaxies ever confirmed. Observed by the Hubble and James Webb Space Telescopes, its ultraviolet emissions have been stretched by cosmic expansion into deep infrared.",
    colorHex: "#f43f5e",
    radiusScale: 1.0,
    simulationDurationSec: 13.5,
  },
];

export const SPECTRUM_BANDS: SpectrumBand[] = [
  {
    id: "radio",
    name: "Radio Waves",
    wavelengthRange: "> 1 meter down to 1 mm",
    wavelengthMeters: 1.0,
    frequencyHz: 3.0e8,
    energyEv: 1.24e-6,
    colorTheme: "text-red-400 bg-red-950/40 border-red-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Spinning pulsars",
      "Cold neutral hydrogen clouds (21 cm line)",
      "Relativistic black hole jets",
      "Cosmic Microwave Background",
    ],
    telescopesUsed: ["ALMA", "Very Large Array (VLA)", "FAST", "Square Kilometre Array (SKA)"],
    whatWeLearn:
      "Radio waves pass effortlessly through interstellar dust clouds, mapping the spiral arms of our galaxy and measuring magnetic fields in deep space.",
    temperatureKelvinRange: "< 10 K (Extremely Cold gas & synchrotron radiation)",
  },
  {
    id: "microwave",
    name: "Microwaves",
    wavelengthRange: "1 mm to 1 meter (typically 1–10 cm in astronomy)",
    wavelengthMeters: 0.01,
    frequencyHz: 3.0e10,
    energyEv: 1.24e-4,
    colorTheme: "text-orange-400 bg-orange-950/40 border-orange-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Cosmic Microwave Background (CMB)",
      "Interstellar molecular clouds",
      "Planetary atmospheres",
    ],
    telescopesUsed: ["Planck Satellite", "COBE", "WMAP", "South Pole Telescope"],
    whatWeLearn:
      "Microwaves carry the 13.8-billion-year-old baby picture of the universe—the thermal afterglow of the Big Bang cooled down to 2.725 Kelvin.",
    temperatureKelvinRange: "1 K to 100 K",
  },
  {
    id: "infrared",
    name: "Infrared (IR)",
    wavelengthRange: "700 nanometers to 1 mm",
    wavelengthMeters: 1.0e-5,
    frequencyHz: 3.0e13,
    energyEv: 0.124,
    colorTheme: "text-amber-400 bg-amber-950/40 border-amber-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Protostars forming inside dust cocoons",
      "Cool red dwarf stars",
      "Exoplanet atmospheres & water vapor",
      "Cosmologically redshifted primeval galaxies",
    ],
    telescopesUsed: ["James Webb Space Telescope (JWST)", "Spitzer Space Telescope", "SOFIA"],
    whatWeLearn:
      "Because infrared waves are longer than cosmic dust grains, they slice right through opaque dark nebulae, revealing hidden stellar nurseries and looking back to the first galaxies.",
    temperatureKelvinRange: "10 K to 1,000 K (Cool gas, dust & low-mass stars)",
  },
  {
    id: "visible",
    name: "Visible Light (Optical)",
    wavelengthRange: "380 nm (Violet) to 750 nm (Red)",
    wavelengthMeters: 5.5e-7,
    frequencyHz: 5.45e14,
    energyEv: 2.25,
    colorTheme: "text-emerald-400 bg-emerald-950/40 border-emerald-500/40",
    visibleToHumanEyes: true,
    cosmicSources: [
      "Our Sun (photosphere ~5778 K)",
      "Main sequence stars",
      "Emission nebulae (ionized hydrogen-alpha ~656 nm)",
      "Reflecting planetary surfaces",
    ],
    telescopesUsed: [
      "Hubble Space Telescope",
      "Very Large Telescope (VLT)",
      "Keck Observatories",
      "Amateur backyard telescopes",
    ],
    whatWeLearn:
      "The narrow band human evolution tuned our eyes to see. It reveals stellar surface temperatures, visual morphology, and optical absorption fingerprints of chemical elements.",
    temperatureKelvinRange: "3,000 K to 10,000 K (Sun-like & stellar surfaces)",
  },
  {
    id: "ultraviolet",
    name: "Ultraviolet (UV)",
    wavelengthRange: "10 nm to 400 nm",
    wavelengthMeters: 1.0e-7,
    frequencyHz: 3.0e15,
    energyEv: 12.4,
    colorTheme: "text-cyan-400 bg-cyan-950/40 border-cyan-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Scorching hot young O and B stars (>20,000 K)",
      "White dwarf stellar remnants",
      "Supernova blast fronts",
      "Active galactic nuclei (quasars)",
    ],
    telescopesUsed: ["Hubble Space Telescope (STIS/WFC3)", "GALEX", "AstroSat"],
    whatWeLearn:
      "UV radiation pinpoints where massive stars were born within the last few million years. Because Earth's ozone layer blocks UV (protecting human DNA), UV astronomy requires space observatories.",
    temperatureKelvinRange: "10,000 K to 100,000 K (Violent, massive young stars)",
  },
  {
    id: "xray",
    name: "X-Rays",
    wavelengthRange: "0.01 nm to 10 nm",
    wavelengthMeters: 1.0e-9,
    frequencyHz: 3.0e17,
    energyEv: 1240,
    colorTheme: "text-blue-400 bg-blue-950/40 border-blue-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Superheated accretion disks around black holes",
      "Colliding neutron star binaries",
      "Intracluster gas in galaxy clusters (millions of degrees)",
      "Stellar magnetic corona flares",
    ],
    telescopesUsed: ["Chandra X-ray Observatory", "XMM-Newton", "NuSTAR", "eROSITA"],
    whatWeLearn:
      "X-rays reveal matter falling into gravitational monsters at fractions of the speed of light, heating to tens of millions of degrees before crossing the event horizon.",
    temperatureKelvinRange: "1 Million K to 100 Million K (Extreme plasma)",
  },
  {
    id: "gamma",
    name: "Gamma Rays",
    wavelengthRange: "< 0.01 nanometers (< 10 picometers)",
    wavelengthMeters: 1.0e-12,
    frequencyHz: 3.0e20,
    energyEv: 1.24e6,
    colorTheme: "text-purple-400 bg-purple-950/40 border-purple-500/40",
    visibleToHumanEyes: false,
    cosmicSources: [
      "Gamma-Ray Bursts (GRBs)",
      "Hypernovae (collapsing massive stars)",
      "Matter-antimatter annihilation",
      "Pulsar magnetospheres",
    ],
    telescopesUsed: ["Fermi Gamma-ray Space Telescope", "Swift", "H.E.S.S.", "MAGIC"],
    whatWeLearn:
      "The most energetic photons in nature, with frequencies above 10^19 Hz. A single gamma-ray burst can outshine the combined light of an entire galaxy of 100 billion stars for several seconds.",
    temperatureKelvinRange: "> 100 Million K (Most violent cataclysms in cosmos)",
  },
];

export const SPECTRAL_ELEMENTS: SpectralElement[] = [
  {
    symbol: "H",
    name: "Hydrogen (Balmer Series)",
    linesNm: [656.3, 486.1, 434.0, 410.2], // H-alpha, H-beta, H-gamma, H-delta
    color: "#ef4444",
    stellarPresence: "Present in >90% of all stars across the universe",
    description:
      "The H-alpha line at 656.3 nm glows deep crimson red and is the signature emission of star-forming emission nebulae and the solar chromosphere.",
  },
  {
    symbol: "He",
    name: "Helium",
    linesNm: [587.6, 501.6, 447.1],
    color: "#f59e0b",
    stellarPresence: "Hot B-type and O-type stars; planetary nebulae",
    description:
      "Helium was discovered on the Sun via solar spectrometry during an 1868 eclipse—27 years before it was ever isolated on Earth! (Named after Helios, the Greek sun god).",
  },
  {
    symbol: "Na",
    name: "Sodium (Fraunhofer D Doublet)",
    linesNm: [589.0, 589.6],
    color: "#eab308",
    stellarPresence: "Cool G, K, and M dwarf stars like our Sun",
    description:
      "A famous prominent doublet in the yellow part of the spectrum. When starlight passes through cooler sodium gas in a star's atmosphere, it absorbs photons at exactly these wavelengths.",
  },
  {
    symbol: "Ca",
    name: "Calcium (Fraunhofer H & K lines)",
    linesNm: [393.4, 396.8],
    color: "#8b5cf6",
    stellarPresence: "Intense in Sun-like stars and cool red giants",
    description:
      "Two deep dark absorption notches in the near-ultraviolet/violet region. They serve as reliable cosmic thermometers to calculate stellar surface temperatures.",
  },
  {
    symbol: "Fe",
    name: "Iron",
    linesNm: [527.0, 532.8, 438.3],
    color: "#06b6d4",
    stellarPresence: "Populates Population I metal-rich stars",
    description:
      "Iron lines reveal stellar metallicity—how many generations of supernovae contributed heavy elements to the gas cloud from which the star coalesced.",
  },
];

export const MODULE_04_SUBLESSONS: SubLesson[] = [
  {
    id: "lesson-1-what-is-light",
    number: 1,
    title: "What is light?",
    subtitle: "The cosmic messenger that travels as waves and packets of energy",
    description:
      "Discover the true physical nature of light: oscillating electric and magnetic fields carrying information across the cosmos.",
    content: {
      junior: {
        summary:
          "Light is pure traveling energy! Everything we see around us—from the green grass outside to the twinkling stars—is brought into our eyes by tiny, super-fast energy packets called photons.",
        takeaway: "Light travels like waves in an ocean and carries energy straight into our eyes.",
        deepDive:
          "Think of light like microscopic runners carrying secret messages. When a star shines, it launches billions of these runners (photons) into the vacuum of space. They don't need any roads, tracks, or air to travel—they can fly across trillions of miles of empty space without stopping!",
        didYouKnow:
          "Photons have zero rest mass! That means light weighs nothing at all, which is why it can fly at the fastest possible speed in the universe.",
        mathOrAnalogy:
          "Turn on a lamp in your bedroom. The light floods every corner instantly because it travels faster than anything you can imagine!",
      },
      explorer: {
        summary:
          "Light is electromagnetic radiation. It behaves simultaneously as continuous transverse waves (with crests and troughs) and as discrete quantum packets of energy called photons.",
        takeaway:
          "Light requires no medium (unlike sound waves, which need air, water, or rock). It travels freely through the vacuum of space.",
        deepDive:
          "In the 1860s, Scottish physicist James Clerk Maxwell proved that light consists of intertwined oscillating electric and magnetic fields. An electric field creates a magnetic field, and a changing magnetic field creates an electric field, allowing the wave to propel itself forward through empty vacuum indefinitely until it strikes an atom.",
        didYouKnow:
          "Because light carries momentum even though it has no mass, scientists can build 'Solar Sails' that propel spacecraft across space pushed only by sunlight!",
        mathOrAnalogy:
          "Sound waves travel through air at about 343 meters per second (1,235 km/h). Light travels nearly ONE MILLION times faster than sound!",
      },
      astronomer: {
        summary:
          "Light exhibits wave-particle duality governed by quantum electrodynamics. A photon possesses energy E = h·f and momentum p = h/λ, moving as a self-sustaining transverse electromagnetic wave.",
        takeaway:
          "Electromagnetic radiation is the only direct probe astronomers have to inspect thermodynamic conditions, chemical abundances, and magnetic topologies of distant celestial bodies.",
        deepDive:
          "When an electron in an atom drops from an excited high-energy orbital (E2) down to a lower orbital (E1), conservation of energy dictates that the energy difference ΔE = E2 - E1 must be emitted as a single photon of frequency f = ΔE / h. Conversely, when an atom absorbs a photon of that precise frequency, its electron jumps upward. This fundamental quantum mechanism produces the emission and absorption spectral lines that serve as the universal barcodes of the cosmos.",
        didYouKnow:
          "Albert Einstein won his 1921 Nobel Prize in Physics not for relativity, but for explaining the photoelectric effect—proving that light transfers energy in discrete quanta (photons).",
        mathOrAnalogy:
          "Planck's relation states E = h·f. Because frequency and wavelength are inversely related (c = λ·f), blue/UV photons (λ = 400 nm) carry nearly twice the energy of red photons (λ = 700 nm).",
      },
    },
  },
  {
    id: "lesson-2-speed-of-light",
    number: 2,
    title: "How fast does light travel?",
    subtitle: "The ultimate cosmic speed limit of the universe: c = 299,792 km/s",
    description:
      "Investigate the universal speed limit, how fast 300,000 km/s really is, and why nothing with mass can ever exceed it.",
    content: {
      junior: {
        summary:
          "Light is the fastest thing in the entire universe! In just one second, a beam of light can zip around the entire planet Earth seven and a half times!",
        takeaway:
          "Light moves at approximately 300,000 kilometers every single second (186,000 miles per second).",
        deepDive:
          "If you were as fast as light, you could click your fingers and travel to the Moon in just over 1 second. A high-speed bullet train would take two whole months to make that same trip without stopping!",
        didYouKnow:
          "Nothing in the entire universe can move faster than light in a vacuum. It is the absolute speed limit set by nature!",
        mathOrAnalogy:
          "In the time it takes you to say 'One Mississippi', light has traveled 300,000 km—far enough to circle the equator 7.5 times.",
      },
      explorer: {
        summary:
          "The speed of light in a vacuum is denoted by the letter 'c' (from Latin 'celeritas', meaning swiftness). Its exact defined value is 299,792,458 meters per second.",
        takeaway:
          "c = 299,792 km/s (roughly 300,000 km/s). Even at this staggering velocity, cosmic distances are so vast that light takes noticeable minutes, years, and millennia to travel between worlds.",
        deepDive:
          "For thousands of years, philosophers believed light was instantaneous. In 1676, Ole Rømer timed the orbital eclipses of Jupiter's volcanic moon Io. When Earth moved farther away from Jupiter, Io disappeared behind Jupiter later than expected. Rømer realized light was not instantaneous—it took extra time to traverse the extra distance across Earth's orbit!",
        didYouKnow:
          "Light only travels at 300,000 km/s in a vacuum. Inside glass or water, it slows down significantly (to ~200,000 km/s in glass), which is what causes refraction and makes lenses work!",
        mathOrAnalogy:
          "The fastest human spacecraft ever launched (the Parker Solar Probe) reaches ~190 km/s. While blindingly fast, that is still only 0.06% the speed of light!",
      },
      astronomer: {
        summary:
          "The speed of light in vacuum c is an invariant universal constant (299,792,458 m/s exactly). Under special relativity, c is identical for all inertial observers regardless of their relative motion.",
        takeaway:
          "Because c is constant in all inertial frames, space and time must dynamically warp (time dilation and length contraction) via the Lorentz factor γ = 1 / √(1 - v²/c²).",
        deepDive:
          "The Michelson-Morley experiment of 1887 attempted to measure the velocity of light relative to a hypothesized 'luminiferous aether'. The null result proved that light does not travel through a background medium; its speed c is isotropic and constant. As an object with rest mass accelerates toward c, its relativistic mass-energy approaches infinity, requiring infinite work. Thus, c represents the causal speed of spacetime itself.",
        didYouKnow:
          "Since 1983, the International Bureau of Weights and Measures defined the meter based on the speed of light: 1 meter is the distance light travels in vacuum in 1/299,792,458 of a second.",
        mathOrAnalogy:
          "Lorentz factor: At 90% the speed of light (0.9c), time for an astronaut dilates by γ = 2.29—clocks on Earth tick more than twice as fast as their onboard clock!",
      },
    },
  },
  {
    id: "lesson-3-sunlight-travel-time",
    number: 3,
    title: "Why sunlight takes time to reach Earth",
    subtitle: "150 million kilometers away: 8 minutes and 19 seconds of transit",
    description:
      "Calculate the travel time across our solar system and discover why we always experience the Sun as it was over 8 minutes ago.",
    content: {
      junior: {
        summary:
          "The Sun is very far away—about 150 million kilometers! Even though sunlight flies at 300,000 km/s, it still takes about 8 minutes and 20 seconds to reach your eyes.",
        takeaway:
          "When you feel the warm sunshine on your face, that sunlight began its journey from the Sun over 8 minutes ago!",
        deepDive:
          "Imagine sending a postcard in the mail. By the time your friend reads it, a few days have passed. The Sun does the same thing with light! When you look safely at solar rays filtering through leaves, you are seeing what the Sun was doing during your breakfast 8 minutes ago.",
        didYouKnow:
          "If the Sun sneezed out a giant solar flare right now, astronauts on the International Space Station wouldn't see it happen until 8 minutes later!",
        mathOrAnalogy:
          "If you could drive a car to the Sun at highway speed (100 km/h) without stopping, it would take you 170 years to get there. Light makes the trip in 500 seconds!",
      },
      explorer: {
        summary:
          "Earth orbits the Sun at an average distance of 1 Astronomical Unit (1 AU = 149,597,870 km). Dividing distance by speed yields: 149,597,870 km ÷ 299,792 km/s ≈ 499 seconds (8 minutes 19 seconds).",
        takeaway:
          "We never observe our star in real-time. All solar phenomena—coronal mass ejections, sunspots, and flares—are observed with an 8.3-minute lag.",
        deepDive:
          "The delay grows even more dramatic for the outer planets. Sunlight takes 3 minutes to reach Mercury, 12.5 minutes to reach Mars, 43 minutes to reach Jupiter, 1 hour 20 minutes to reach Saturn, and over 4.5 hours to reach distant Pluto! Radio commands sent to the Voyager 1 probe on the frontier of interstellar space take more than 22 hours to arrive.",
        didYouKnow:
          "While photons take 8.3 minutes to travel from the Sun's surface to Earth, those same photons took between 10,000 and 100,000 years to slowly bounce and diffuse from the dense fusion core up to the surface!",
        mathOrAnalogy:
          "Time = Distance ÷ Speed. For the Moon: 384,400 km ÷ 300,000 km/s = 1.28 s. For the Sun: 150,000,000 km ÷ 300,000 km/s = 500 s (8.33 min).",
      },
      astronomer: {
        summary:
          "Planetary light-travel times introduce light-time aberration and orbital lag in astrometry, requiring relativistic corrections in spacecraft telemetry and interplanetary ephemerides.",
        takeaway:
          "Signal latency across the Astronomical Unit sets fundamental communication delays for deep-space missions and solar storm early warning systems.",
        deepDive:
          "Solar weather monitoring satellites like NOAA's DSCOVR and NASA's SOHO are stationed at the Sun-Earth Lagrange Point 1 (L1), roughly 1.5 million kilometers sunward of Earth. When a Coronal Mass Ejection (CME) erupts, the flare's photons reach L1 and Earth in 8.3 minutes at c. However, the plasma cloud of charged protons and electrons travels much slower (400–1,000 km/s), taking 15 to 48 hours to strike Earth's magnetosphere. This speed differential gives us critical advance warning to protect power grids and orbiting satellites.",
        didYouKnow:
          "Because Earth moves along its orbit at ~29.8 km/s while sunlight is traveling toward us, the Sun appears shifted in the sky by 20.5 arcseconds—an optical effect known as stellar aberration.",
        mathOrAnalogy:
          "Aberration angle θ ≈ v/c = (29.8 km/s) / (300,000 km/s) ≈ 1.0 × 10^-4 radians ≈ 20.5 arcseconds.",
      },
    },
  },
  {
    id: "lesson-4-distant-stars-show-the-past",
    number: 4,
    title: "Why distant stars show us the past",
    subtitle: "Telescopes are genuine time machines: looking outward is looking backward",
    description:
      "Understand the mind-expanding concept of lookback time: why peering billions of light-years into deep space allows astronomers to witness the infancy of the universe.",
    content: {
      junior: {
        summary:
          "When you look up at the night sky, you are looking backward in time! You are not seeing the stars as they are tonight, but as they were years, centuries, or millions of years ago when their light began traveling toward Earth.",
        takeaway:
          "Every telescope is a real-life time machine. The farther away an object is, the further back in history you see it!",
        deepDive:
          "If a star is 100 light-years away, its light took 100 years to reach your eyes. You see that star as it looked 100 years ago, when your great-grandparents were children! The star might have changed, or even blown up, but we won't know until the new light finishes its long journey to us.",
        didYouKnow:
          "If alien astronomers in the Andromeda Galaxy (2.5 million light-years away) were looking at Earth right now through a super telescope, they wouldn't see cars or cities—they would see prehistoric human ancestors walking on the African savannah!",
        mathOrAnalogy:
          "It's just like watching a recorded home video from your fifth birthday. The video shows the past, exactly as it was when the camera captured it.",
      },
      explorer: {
        summary:
          "A light-year is the distance light travels in one Julian year (9.46 trillion kilometers). Because light has a finite speed, seeing an object D light-years away means viewing it as it was D years ago—its 'lookback time'.",
        takeaway:
          "Astronomy is unique among all scientific disciplines: geologists must dig for fossils in rocks, but astronomers can watch cosmic history happen live simply by looking farther away.",
        deepDive:
          "When you look at Sirius (8.6 light-years away), you see it 8.6 years in the past. Betelgeuse in Orion is ~642 light-years away—you see it during the European Renaissance! The Andromeda Galaxy is 2.5 million light-years away, viewed during the Pliocene epoch on Earth. By building colossal space observatories like the James Webb Space Telescope (JWST), humanity can gather light that set out 13.4 billion years ago, watching the very first baby galaxies assemble shortly after the Big Bang.",
        didYouKnow:
          "Some of the distant stars you see tonight might have already exploded into supernovae and died, but their ghost light is still traveling through space toward us!",
        mathOrAnalogy:
          "Lookback Time Table: Moon = 1.3 seconds ago; Sun = 8.3 minutes ago; Proxima Centauri = 4.25 years ago; Betelgeuse = 642 years ago; Andromeda = 2.5 million years ago; GN-z11 = 13.4 billion years ago.",
      },
      astronomer: {
        summary:
          "In an expanding universe, lookback time t_L is given by the integral of the cosmological scale factor over redshift z: t_L = ∫ [1 / (H(z')·(1 + z'))] dz' from 0 to z. Light travel time reflects cosmic epoch, not current comoving distance.",
        takeaway:
          "High-redshift observations allow direct empirical testing of cosmological models, primordial nucleosynthesis, and galaxy assembly across 13.8 billion years of cosmic time.",
        deepDive:
          "Because space itself has been expanding during the billions of years light spent in flight, the current physical distance ('comoving distance') to a high-redshift galaxy is much greater than c × lookback time. For example, galaxy GN-z11 has a lookback time of ~13.4 billion years (z = 10.6), but due to metric expansion, its present comoving distance from Earth is approximately 32 billion light-years! The cosmological redshift z = (λ_observed - λ_emitted) / λ_emitted directly traces the cosmic scale factor: 1 + z = a_now / a_then.",
        didYouKnow:
          "The oldest light in the cosmos is the Cosmic Microwave Background (CMB), emitted ~380,000 years after the Big Bang at redshift z ≈ 1100. It has been traveling for 13.79 billion years!",
        mathOrAnalogy:
          "Hubble parameter H(z) = H_0 · √(Ω_m·(1+z)³ + Ω_r·(1+z)⁴ + Ω_Λ). High redshift z shifts ultraviolet Lyman-alpha photons (121.6 nm) into the infrared (1.4 μm at z=10.6), which is why JWST was designed specifically as an infrared observatory.",
      },
    },
  },
  {
    id: "lesson-5-colors-wavelengths-spectra",
    number: 5,
    title: "Colors, wavelengths and spectra",
    subtitle: "The rainbow of electromagnetic radiation: c = wavelength × frequency",
    description:
      "Examine how light waves differ by wavelength, how a glass prism refracts and disperses white light, and why the invisible spectrum rules modern astrophysics.",
    content: {
      junior: {
        summary:
          "Visible white light from the Sun looks clear, but it is actually a rainbow of colors mixed together! When light passes through raindrops or a glass prism, it bends and splits into Red, Orange, Yellow, Green, Blue, and Violet.",
        takeaway:
          "Red light has the longest waves; violet light has the shortest waves. Together they make up the rainbow!",
        deepDive:
          "Different colors of light have different wave sizes. Red waves are gentle and long. Blue and violet waves are short and wiggle very quickly. When white sunlight hits a raindrop in the sky, each color bends by a slightly different angle, spreading the light out into a gorgeous rainbow across the clouds!",
        didYouKnow:
          "Visible light is only a tiny sliver of the full light family! There are invisible types of light like radio waves, infrared heat, and X-rays all around us right now.",
        mathOrAnalogy:
          "Imagine running through ocean water: high-stepping takes fast short steps (like violet light), while taking giant slow strides is like long red waves.",
      },
      explorer: {
        summary:
          "Light is a wave with two key properties: wavelength (λ, the distance between crests) and frequency (f, how many waves pass per second). Red light has a wavelength around 700 nanometers, while violet light is around 400 nanometers.",
        takeaway:
          "The fundamental wave equation connects light speed to wavelength and frequency: c = λ × f. As wavelength gets shorter, frequency and photon energy increase.",
        deepDive:
          "In 1666, Sir Isaac Newton darkened his room, punched a pinhole in the shutter, and placed a triangular glass prism in the beam of white sunlight. He proved that the prism wasn't coloring the light; the rainbow of colors was already inside the white light! Because glass slows down violet light more than red light, violet refracts (bends) more sharply than red. This separation of colors by wavelength is called optical dispersion.",
        didYouKnow:
          "A nanometer (nm) is one billionth of a meter. A single human hair is roughly 80,000 nanometers wide—wide enough to fit over 150 waves of green light side by side!",
        mathOrAnalogy:
          "Wave relationship: If you double the frequency of a wave, its wavelength is cut in half, because their product always equals the constant speed of light: c = λ · f.",
      },
      astronomer: {
        summary:
          "The electromagnetic spectrum spans from radio waves (λ > 1 m, f < 300 MHz) to gamma rays (λ < 0.01 nm, f > 30 EHz). Photons carry energy E = h·f = hc/λ, where h = 6.626 × 10^-34 J·s.",
        takeaway:
          "Wave equation c = λ·f dictates an inverse linear relationship between wavelength and frequency. Dispersion arises from the wavelength dependence of the refractive index n(λ) described by the Sellmeier equation.",
        deepDive:
          "Thermal radiators emit a continuous blackbody spectrum described by Planck's law. Wien's displacement law states that the peak emission wavelength λ_max is inversely proportional to absolute surface temperature: λ_max = b / T, where b ≈ 2.898 × 10^-3 m·K. A hot O-type star at 30,000 K peaks in the far ultraviolet (λ_max ≈ 96 nm), appearing blue-white. Our Sun at 5,778 K peaks in the green-yellow optical range (λ_max ≈ 500 nm). Cool red supergiants like Betelgeuse at 3,500 K peak in the infrared (λ_max ≈ 830 nm), appearing distinctly reddish to the human eye.",
        didYouKnow:
          "Because high-energy gamma-ray and X-ray photons ionize atoms and shatter molecular bonds, astronomers must use grazing-incidence mirrors (Wolter telescopes) rather than traditional lenses to focus X-rays.",
        mathOrAnalogy:
          "Formula: c = λ · f. For green light at λ = 550 nm: f = (3.0 × 10^8 m/s) / (550 × 10^-9 m) = 5.45 × 10^14 Hz (545 Terahertz!). Energy E = h·f = 3.61 × 10^-19 Joules = 2.26 eV.",
      },
    },
  },
  {
    id: "lesson-6-how-scientists-study-stars",
    number: 6,
    title: "How scientists learn about stars from light",
    subtitle: "Spectroscopy: chemical fingerprints, temperatures, and cosmic motions",
    description:
      "Learn how decoding the dark absorption lines in starlight reveals a star's composition, surface temperature, atmospheric pressure, and orbital velocity.",
    content: {
      junior: {
        summary:
          "Astronomers cannot visit distant stars in rocket ships or scoop up samples with spoons. But by studying starlight with special instruments called spectrometers, they can tell exactly what elements stars are made of!",
        takeaway:
          "Every chemical element in the universe leaves a unique barcode pattern of dark lines in starlight.",
        deepDive:
          "Just like a barcode scanner at a grocery store tells the cashier whether you are buying apples or milk, astronomers look at the dark lines in starlight. When they see specific black lines at exact spots in the rainbow, they know: 'Aha! This star has hydrogen, helium, sodium, and iron in its atmosphere!'",
        didYouKnow:
          "Helium was discovered shining in the Sun's atmosphere in 1868 before anyone had ever found a single ounce of it on Earth!",
        mathOrAnalogy:
          "A star's color also tells us its temperature, just like your kitchen stove: cool glowing elements are deep red, but the hottest burner flame glows bright blue-white!",
      },
      explorer: {
        summary:
          "When continuous white light from a star's dense core passes through its cooler outer atmospheric gas, specific wavelengths are absorbed by atoms. This creates dark 'Fraunhofer lines' (an absorption spectrum).",
        takeaway:
          "Spectroscopy reveals four vital stellar secrets: (1) chemical composition, (2) surface temperature, (3) radial velocity via Doppler shift, and (4) magnetic field strength.",
        deepDive:
          "In 1814, Joseph von Fraunhofer cataloged 574 dark lines crossing the solar spectrum. Decades later, Gustav Kirchhoff and Robert Bunsen demonstrated that every chemical element produces an exact, unchanging set of spectral lines—like an atomic fingerprint. Furthermore, if a star is moving toward Earth, its spectral lines shift toward the blue end of the spectrum (blueshift); if it is moving away, its lines shift toward the red (redshift). This Doppler shift allows astronomers to detect wobbling stars orbited by hidden exoplanets!",
        didYouKnow:
          "The James Webb Space Telescope recently used transmission spectroscopy during an exoplanet transit to detect carbon dioxide, sulfur dioxide, and water vapor in the atmosphere of exoplanet WASP-39b, 700 light-years away!",
        mathOrAnalogy:
          "Doppler shift formula: Δλ / λ_0 = v / c. If a star's hydrogen line shifts by just 0.1 nanometers, astronomers can calculate its velocity down to a few meters per second!",
      },
      astronomer: {
        summary:
          "Stellar spectroscopy models radiative transfer through stellar atmospheres. Spectral line profiles undergo thermal Doppler broadening, collisional (pressure) broadening, and Zeeman splitting.",
        takeaway:
          "Morgan-Keenan (MK) spectral classification (O, B, A, F, G, K, M) reflects atmospheric ionization state and surface temperature, not primarily elemental abundance differences.",
        deepDive:
          "The Saha ionization equation and Boltzmann excitation equation govern the population of atomic energy levels in thermal equilibrium: N_j / N = (g_j / Z) · exp(-E_j / k_B·T). In stellar atmospheres, Hydrogen Balmer lines peak in strength in A0 stars (~10,000 K) because at that temperature, the n=2 energy level has optimal thermal population. In hotter O stars (>30,000 K), hydrogen is almost completely ionized into bare protons and electrons, so hydrogen lines fade and ionized helium (He II) lines dominate. In cool M dwarfs (<3,500 K), neutral metal lines and molecular bands like titanium oxide (TiO) dominate the spectrum.",
        didYouKnow:
          "Cecilia Payne-Gaposchkin discovered in her groundbreaking 1925 Harvard PhD thesis that stars are composed overwhelmingly of hydrogen and helium, disproving the prevailing belief that the Sun had the same elemental composition as Earth.",
        mathOrAnalogy:
          "Radial velocity measurement: v_r = c · (Δλ / λ_0). High-precision spectrographs like ESPRESSO on the VLT can detect velocity variations as minuscule as 10 cm/s—the walking speed of a baby turtle!",
      },
    },
  },
];

export const MODULE_04_QUIZ: QuizQuestion[] = [
  {
    id: "m4_q1",
    question: "What is the approximate speed of light in a vacuum?",
    options: [
      "300,000 kilometers per second",
      "300,000 kilometers per hour",
      "150 million kilometers per second",
      "1,235 kilometers per hour (the speed of sound)",
    ],
    correctIndex: 0,
    explanation:
      "Light travels at c ≈ 299,792 km/s (roughly 300,000 km/s in vacuum). At this speed, it can circle the Earth 7.5 times in a single second!",
    hint: "Think about how many times a light beam can circle Earth in one second.",
  },
  {
    id: "m4_q2",
    question: "How long does it take for sunlight to travel across space and reach Earth?",
    options: [
      "Instantly (0 seconds)",
      "1.28 seconds",
      "About 8 minutes and 19 seconds",
      "24 hours",
    ],
    correctIndex: 2,
    explanation:
      "Earth is 150 million kilometers away from the Sun. Dividing 150,000,000 km by 300,000 km/s yields 500 seconds, which equals roughly 8 minutes and 19 seconds.",
    hint: "It takes longer than a heartbeat, but less time than a lunch break.",
  },
  {
    id: "m4_q3",
    question: "Why do astronomers refer to telescopes as 'time machines'?",
    options: [
      "Telescopes can send signals back into the past",
      "Because light has a finite speed, seeing distant objects means seeing how they looked when the light left them",
      "Telescopes use wormholes to observe future stars",
      "Telescopes reverse the aging process of celestial bodies",
    ],
    correctIndex: 1,
    explanation:
      "Because light takes time to travel through space, the farther away an object is, the longer its light spent traveling. When you observe a galaxy 10 million light-years away, you are seeing it as it existed 10 million years ago.",
    hint: "Think about lookback time and the delay between light emission and observation.",
  },
  {
    id: "m4_q4",
    question:
      "Which of the following correctly describes the relationship between light's wavelength and frequency?",
    options: [
      "c = wavelength × frequency (as wavelength gets shorter, frequency increases)",
      "wavelength and frequency are completely independent",
      "longer wavelengths always carry higher photon energy",
      "c = wavelength ÷ frequency",
    ],
    correctIndex: 0,
    explanation:
      "The universal wave equation states c = λ × f. Because the speed of light c is constant in vacuum, shorter wavelengths (like blue and ultraviolet) must oscillate at higher frequencies and carry more photon energy.",
    hint: "Remember the formula: speed = wavelength × frequency.",
  },
  {
    id: "m4_q5",
    question: "How can astronomers determine what chemical elements exist in a distant star?",
    options: [
      "By launching robotic scoops to collect samples from the star's surface",
      "By observing the specific dark absorption lines (barcodes) in the star's spectrum",
      "By measuring how heavy the star feels through gravity sensors",
      "By measuring the star's distance with laser rangefinders",
    ],
    correctIndex: 1,
    explanation:
      "Every chemical element (like hydrogen, helium, sodium, or iron) absorbs light at exact, characteristic wavelengths. These create a unique barcode of dark absorption lines in the star's spectrum, revealing its precise chemical makeup.",
    hint: "Think about atomic fingerprints in rainbows (spectroscopy).",
  },
];

export const HOW_FAR_INTO_THE_PAST_CHALLENGES = [
  {
    id: "challenge_1",
    scenario: "Sunlight warming your hands right now",
    objectName: "The Sun",
    distanceStr: "150 Million km (1 AU)",
    correctOptionId: "8_min",
    options: [
      {
        id: "1_sec",
        label: "1.3 seconds ago",
        feedback: "Too short! That is the travel time to the Moon.",
      },
      {
        id: "8_min",
        label: "8 minutes and 20 seconds ago",
        feedback: "Correct! That sunlight set out while you were having breakfast.",
        isCorrect: true,
      },
      {
        id: "1_day",
        label: "24 hours ago",
        feedback: "Too long! Light crosses 1 AU in only 500 seconds.",
      },
      {
        id: "4_yr",
        label: "4.2 years ago",
        feedback: "Too long! That is the distance to Proxima Centauri.",
      },
    ],
    historicalEventEarth: "Someone in your house just poured a fresh cup of coffee!",
  },
  {
    id: "challenge_2",
    scenario: "Starlight from Proxima Centauri reaching a backyard telescope",
    objectName: "Proxima Centauri",
    distanceStr: "4.25 Light-Years (40 Trillion km)",
    correctOptionId: "4_yr",
    options: [
      {
        id: "8_min",
        label: "8.3 minutes ago",
        feedback: "That's the Sun! Proxima is 270,000 times farther away.",
      },
      {
        id: "4_yr",
        label: "4 years and 3 months ago",
        feedback: "Correct! The light set out when today's elementary students were in preschool.",
        isCorrect: true,
      },
      {
        id: "100_yr",
        label: "100 years ago",
        feedback: "Much too far! Proxima is our closest stellar neighbor.",
      },
      {
        id: "2_myr",
        label: "2.5 million years ago",
        feedback: "That is the Andromeda Galaxy, not our neighbor star!",
      },
    ],
    historicalEventEarth:
      "You were over 4 years younger when these photons began their journey through the void.",
  },
  {
    id: "challenge_3",
    scenario: "Light from the giant red supergiant Betelgeuse in Orion",
    objectName: "Betelgeuse",
    distanceStr: "642.5 Light-Years",
    correctOptionId: "642_yr",
    options: [
      {
        id: "8_yr",
        label: "8.6 years ago",
        feedback: "That's Sirius! Betelgeuse is much further across our spiral arm.",
      },
      {
        id: "642_yr",
        label: "642 years ago (~1384 AD)",
        feedback:
          "Correct! The light departed during the European Middle Ages and the Ming Dynasty.",
        isCorrect: true,
      },
      {
        id: "26000_yr",
        label: "26,700 years ago",
        feedback:
          "That is the distance to the supermassive black hole at the center of the Milky Way!",
      },
      {
        id: "13_byr",
        label: "13.4 billion years ago",
        feedback: "That is the lookback time to the earliest JWST galaxies!",
      },
    ],
    historicalEventEarth:
      "Castles and knights in the Middle Ages; the printing press had not even been invented yet!",
  },
  {
    id: "challenge_4",
    scenario: "Observing the Andromeda Galaxy (M31) with binoculars",
    objectName: "Andromeda Galaxy (M31)",
    distanceStr: "2.537 Million Light-Years",
    correctOptionId: "2_5_myr",
    options: [
      {
        id: "642_yr",
        label: "642 years ago",
        feedback: "Too recent! Andromeda is outside our Milky Way galaxy.",
      },
      {
        id: "26000_yr",
        label: "26,700 years ago",
        feedback: "That is our own Milky Way center, not another galaxy.",
      },
      {
        id: "2_5_myr",
        label: "2.5 million years ago",
        feedback: "Correct! Light set out when early hominids made the first Oldowan stone tools.",
        isCorrect: true,
      },
      {
        id: "65_myr",
        label: "66 million years ago (Dinosaur extinction)",
        feedback: "That's roughly the Virgo Cluster distance, not Andromeda.",
      },
    ],
    historicalEventEarth:
      "Early human ancestors (Homo habilis) chipping stones in the East African Rift valley.",
  },
  {
    id: "challenge_5",
    scenario: "JWST detecting infrared photons from primeval galaxy GN-z11",
    objectName: "Galaxy GN-z11",
    distanceStr: "Lookback Time: 13.4 Billion Years",
    correctOptionId: "13_4_byr",
    options: [
      { id: "2_5_myr", label: "2.5 million years ago", feedback: "Too recent! That is Andromeda." },
      {
        id: "4_5_byr",
        label: "4.5 billion years ago (Earth formation)",
        feedback:
          "Earth had not formed, but GN-z11 light had already traveled for 9 billion years!",
      },
      {
        id: "13_4_byr",
        label: "13.4 billion years ago (Cosmic Dawn)",
        feedback: "Brilliant! You are peering to within 400 million years of the Big Bang itself.",
        isCorrect: true,
      },
      {
        id: "100_byr",
        label: "100 billion years ago",
        feedback: "The universe is only 13.8 billion years old!",
      },
    ],
    historicalEventEarth:
      "Neither Earth, our Sun, nor our Milky Way existed yet. Pure cosmic dawn!",
  },
];

export const MODULE_04_SOURCES: ScientificSource[] = [
  {
    title: "NASA Science: The Electromagnetic Spectrum",
    organization: "NASA",
    url: "https://science.nasa.gov/ems/",
    note: "Comprehensive overview of wavelength regimes, photon energies, and observatory missions.",
  },
  {
    title: "How Fast Does Light Travel? The Cosmic Speed Limit",
    organization: "NASA",
    url: "https://science.nasa.gov/universe/exoplanets/how-fast-does-light-travel/",
    note: "Educational guide on finite light speed and planetary transit times.",
  },
  {
    title: "ESA / Webb: Lookback Time & The Early Universe",
    organization: "ESA",
    url: "https://www.esa.int/Science_Exploration/Space_Science/Webb/Looking_back_in_time",
    note: "Explanations of cosmological redshift and telescope lookback time.",
  },
  {
    title: "Spectroscopy & Stellar Fingerprints",
    organization: "Hubble",
    url: "https://hubblesite.org/science/spectroscopy",
    note: "Decoding absorption lines to determine elemental composition and atmospheric physics.",
  },
  {
    title: "Speed of Light & Astronomical Constants",
    organization: "IAU",
    url: "https://www.iau.org/public/themes/measuring/",
    note: "Official IAU standards for light-year definitions and astronomical units.",
  },
];

export const MODULE_04_LESSON: LessonContract = {
  lessonId: "module-04-light-time",
  moduleId: "04",
  title: "Light, Time & Cosmic Observation",
  objectives: [
    "Explain why the finite speed of light turns every telescope into a lookback time machine",
    "Calculate light-travel times between Earth, the Moon, the Sun, and distant galaxies",
    "Identify the electromagnetic spectrum from radio waves to gamma rays using c = λ × f",
    "Demonstrate how an optical prism disperses white light into a continuous rainbow spectrum",
    "Decode stellar absorption lines (Fraunhofer barcodes) to determine the chemical composition of stars",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Did you know that you have never seen the Sun as it looks right now? You always see it as it was 8 minutes ago! Put on your cosmic goggles and learn how super-fast light particles connect us to stars that lived millions of years in the past.",
      coreConcepts: [
        "Light travels faster than anything else in the world, at 300,000 kilometers every second.",
        "Sunlight takes over 8 minutes to travel across space to reach your backyard.",
        "When you look at distant stars, you are looking straight into history!",
        "Rainbows happen because white sunlight is a bundle of red, yellow, green, blue, and violet waves.",
      ],
      explanatoryText:
        "Think of light as tiny runners carrying pictures from distant worlds. Because space is so gigantic, even the fastest runner takes seconds, minutes, or millions of years to deliver those pictures into your eyes. That means telescopes aren't just magnifying glasses—they are real-life time machines!",
      funFacts: [
        "In one second, a beam of light can travel around the Earth seven and a half times!",
        "If aliens in the Andromeda Galaxy looked at Earth today with a giant telescope, they would see early prehistoric humans walking on Earth!",
        "Helium was discovered in the Sun's light before anyone found it on Earth!",
      ],
      quizQuestions: MODULE_04_QUIZ.slice(0, 3),
    },
    explorer: {
      introHook:
        "The speed of light (c = 300,000 km/s) is the ultimate speed limit of the universe. Because empty space is so immense, looking outward through a telescope is literally looking backward through cosmic time. Explore how light carries the secrets of the cosmos to our telescopes.",
      coreConcepts: [
        "c = 299,792 km/s is an absolute universal constant in vacuum.",
        "Light travel time = Distance ÷ c. Sunlight takes 499 seconds (8 min 19 sec) to traverse 1 AU.",
        "Lookback time allows astronomers to observe ancient cosmic epochs directly.",
        "The wave relationship c = λ × f links wavelength and frequency across the electromagnetic spectrum.",
        "Spectroscopy reveals what stars are made of by reading dark absorption lines.",
      ],
      explanatoryText:
        "Light is electromagnetic radiation composed of coupled oscillating electric and magnetic fields. It carries vital information about the conditions at its source (temperature, composition, magnetism) and along its trajectory (interstellar dust absorption, gravitational bending, cosmological redshift).",
      depthNotes:
        "Ole Rømer's 1676 observations of Jupiter's moon Io first demonstrated that light has a finite speed. Today, astronomers use the electromagnetic spectrum from radio to gamma rays to observe phenomena invisible to the naked human eye.",
      mathExplanation:
        "Travel Time Formula: t = d / c. Moon (384,400 km) = 1.28 s. Sun (1.5 × 10^8 km) = 500 s. Proxima Centauri (4.0 × 10^13 km) = 4.25 years.",
      funFacts: [
        "Sunlight takes 8.3 minutes to reach Earth, but over 4.5 hours to reach Pluto!",
        "Curiosity and Perseverance Mars rovers must drive autonomously because radio signals take up to 22 minutes to travel between Earth and Mars.",
        "The James Webb Space Telescope uses infrared light because the universe's expansion stretched ancient ultraviolet light into longer infrared waves.",
      ],
      quizQuestions: MODULE_04_QUIZ.slice(0, 4),
    },
    astronomer: {
      introHook:
        "Light is the primary empirical probe of astrophysics. From Maxwell's electrodynamics to quantum photonics, Wien's displacement law, and relativistic lookback time, starlight delivers the quantitative thermodynamics, chemistry, and kinematic motion of the cosmos.",
      coreConcepts: [
        "Universal speed of light c = 299,792,458 m/s is invariant in all inertial reference frames.",
        "Photon energy E = h·f = hc/λ and momentum p = h/λ dictate quantum atomic transitions.",
        "Electromagnetic wave relation c = λ·f underpins the entire spectrum from radio to gamma-ray regimes.",
        "Fraunhofer absorption lines provide chemical fingerprints via atomic electron orbital excitation.",
        "Cosmological redshift z = Δλ / λ_0 links lookback time to the expansion factor of the universe.",
      ],
      explanatoryText:
        "Photons emitted from a stellar photosphere encode the local thermodynamic equilibrium, effective temperature T_eff (via Wien's displacement law λ_max = b/T), atmospheric pressure (via line broadening), and radial velocity (via Doppler shift Δλ/λ = v/c). Looking back across billions of light-years enables the observational study of cosmic evolution from the Cosmic Dawn to the present day.",
      depthNotes:
        "Because c is finite, observing a source at redshift z probes the universe when its cosmic scale factor was a = 1 / (1 + z). Infrared space observatories like JWST bypass dust extinction and capture rest-frame ultraviolet radiation redshifted into the near-infrared.",
      mathExplanation:
        "Wave equation: c = λ · f. Planck relation: E = h · f = (hc) / λ. Doppler radial velocity: v_r = c · (Δλ / λ_0). Wien's law: λ_max · T = 2.898 × 10^-3 m·K.",
      funFacts: [
        "The Cosmic Microwave Background represents light that has traveled for 13.79 billion years, redshifted by a factor of 1,100 from visible orange down to 1.9 mm microwaves.",
        "High-resolution spectrographs can measure stellar radial velocity variations down to 10 cm/s, detecting Earth-mass exoplanets from the wobble of their parent star.",
      ],
      quizQuestions: MODULE_04_QUIZ,
    },
  },
  visualizationType: "spectral-lab",
  interactions: [
    "3D interactive light-travel simulation from Earth to Moon, Sun, stars, and distant galaxies",
    "Time-compressed animation with live travel-time comparison",
    "Electromagnetic spectrum slider with wavelength, frequency, and photon energy readouts",
    "Interactive triangular glass prism light dispersion laboratory",
    "Multimodal comparative observation in Visible, Infrared, and Ultraviolet bands",
    "Lookback time cosmic chronology explorer",
    "Stellar absorption line chemical fingerprint analyzer",
    "'How Far Into the Past?' historical alignment challenge",
  ],
  relatedConcepts: [
    "Speed of Light (c)",
    "Lookback Time",
    "Electromagnetic Spectrum",
    "Wavelength (λ) & Frequency (f)",
    "Refraction & Dispersion",
    "Fraunhofer Absorption Lines",
    "Doppler Shift & Redshift",
    "Cosmological Expansion",
  ],
  completionCriteria:
    "Complete the 3D Light-Travel simulation, test the prism and spectrum experiments, solve the 'How Far Into the Past?' challenge, and score at least 80% on the Knowledge Check.",
  scientificSources: MODULE_04_SOURCES,
};
