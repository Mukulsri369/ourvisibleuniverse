import type { LessonModule, ScientificSource } from "../types";

export interface StellarParameter {
  label: string;
  sunValue: string;
  siriusAValue: string;
  betelgeuseValue: string;
  siriusBValue: string;
  proximaValue: string;
  notes: string;
  source: string;
}

export const SOURCED_STELLAR_PARAMETERS: StellarParameter[] = [
  {
    label: "Spectral Classification",
    sunValue: "G2V (Yellow Dwarf)",
    siriusAValue: "A1V (Blue-White MS)",
    betelgeuseValue: "M1-2Ia-ab (Red Supergiant)",
    siriusBValue: "DA2 (White Dwarf)",
    proximaValue: "M5.5V (Red Dwarf)",
    notes: "Morgan-Keenan system: Letter = Temperature/Spectrum, Roman Numeral = Luminosity Class.",
    source: "IAU / SIMBAD Astronomical Database",
  },
  {
    label: "Effective Surface Temp",
    sunValue: "5,772 K",
    siriusAValue: "9,940 K",
    betelgeuseValue: "3,600 K",
    siriusBValue: "25,200 K",
    proximaValue: "3,042 K",
    notes: "Determined via Wien's displacement law and blackbody continuum spectroscopy.",
    source: "ESA Gaia DR3 / NASA Astrophysics",
  },
  {
    label: "Radius (Solar Radii R☉)",
    sunValue: "1.00 R☉ (696,340 km)",
    siriusAValue: "1.71 R☉ (1,190,000 km)",
    betelgeuseValue: "764 R☉ (531,000,000 km)",
    siriusBValue: "0.0084 R☉ (5,840 km)",
    proximaValue: "0.154 R☉ (107,000 km)",
    notes: "Betelgeuse easily engulfs Mars's orbit; Sirius B is smaller than planet Earth!",
    source: "VLTI / CHARA Interferometry",
  },
  {
    label: "Bolometric Luminosity",
    sunValue: "1.00 L☉ (3.828×10²⁶ W)",
    siriusAValue: "25.4 L☉",
    betelgeuseValue: "126,000 L☉",
    siriusBValue: "0.056 L☉",
    proximaValue: "0.0017 L☉",
    notes:
      "Stefan-Boltzmann Law: L = 4π R² σ T⁴. High temperature and radius drive colossal luminosity.",
    source: "ESA Gaia DR3 & Hipparcos",
  },
  {
    label: "Mass (Solar Masses M☉)",
    sunValue: "1.00 M☉ (1.989×10³⁰ kg)",
    siriusAValue: "2.06 M☉",
    betelgeuseValue: "16.5 M☉",
    siriusBValue: "1.02 M☉",
    proximaValue: "0.122 M☉",
    notes: "On main sequence, L ∝ M^3.5. White dwarf packs a solar mass into Earth volume.",
    source: "Binary Astrometry & Stellar Evolutionary Models",
  },
  {
    label: "Mean Density",
    sunValue: "1.41 g/cm³ (~1.4× water)",
    siriusAValue: "0.58 g/cm³",
    betelgeuseValue: "1.2×10⁻⁸ g/cm³ (Near vacuum!)",
    siriusBValue: "2.4×10⁶ g/cm³ (2.4 metric tons/cm³)",
    proximaValue: "47.3 g/cm³ (~4× lead)",
    notes:
      "Supergiants are tenuous glowing vacuum bubbles; white dwarfs are degenerate quantum matter.",
    source: "Standard Astrophysical Models",
  },
  {
    label: "Main Sequence Lifespan",
    sunValue: "~10 Billion Years",
    siriusAValue: "~1.3 Billion Years",
    betelgeuseValue: "~10 Million Years",
    siriusBValue: "Remnant (C/O core)",
    proximaValue: "~4 Trillion Years",
    notes:
      "Massive stars consume hydrogen furiously; low-mass red dwarfs burn fuel for cosmic eons.",
    source: "Stellar Nucleosynthesis Models",
  },
];

export interface BenchmarkStar {
  id: string;
  name: string;
  designation: string;
  spectralClass: "O" | "B" | "A" | "F" | "G" | "K" | "M" | "D";
  spectralType: string; // e.g. "G2V", "M1-2Ia"
  category:
    "sun" | "red_dwarf" | "blue_white" | "red_giant" | "supergiant" | "white_dwarf" | "other";
  categoryLabel: string;
  temperatureK: number;
  radiusSolar: number;
  luminositySolar: number;
  massSolar: number;
  distanceLightYears: number;
  constellation: string;
  apparentMagnitude: number;
  absoluteMagnitude: number;
  colorHex: string;
  glowHex: string;
  hrX: number; // Log temperature position for diagram (0 to 100)
  hrY: number; // Log luminosity position for diagram (0 to 100)
  hrRegion: "Main Sequence" | "Red Giants" | "Supergiants" | "White Dwarfs";
  description: string;
  funFact: string;
}

export const BENCHMARK_STARS: BenchmarkStar[] = [
  {
    id: "sun",
    name: "The Sun (Sol)",
    designation: "Sol / G2V",
    spectralClass: "G",
    spectralType: "G2V",
    category: "sun",
    categoryLabel: "Yellow Main-Sequence Dwarf",
    temperatureK: 5772,
    radiusSolar: 1.0,
    luminositySolar: 1.0,
    massSolar: 1.0,
    distanceLightYears: 0.0000158, // 8.3 light minutes
    constellation: "None (Our Star)",
    apparentMagnitude: -26.74,
    absoluteMagnitude: +4.83,
    colorHex: "#FFF3DC",
    glowHex: "#FFD080",
    hrX: 52.8,
    hrY: 53.5,
    hrRegion: "Main Sequence",
    description:
      "Our home star. A stable G2V yellow dwarf fusing 600 million tons of hydrogen into helium every second in its core.",
    funFact:
      "Although the Sun looks golden from Earth due to atmospheric scattering, its true peak emission above the atmosphere is green-white, appearing pure bright white to human eyes in deep space!",
  },
  {
    id: "proxima_centauri",
    name: "Proxima Centauri",
    designation: "Alpha Centauri C",
    spectralClass: "M",
    spectralType: "M5.5V",
    category: "red_dwarf",
    categoryLabel: "Red Dwarf Star",
    temperatureK: 3042,
    radiusSolar: 0.154,
    luminositySolar: 0.0017,
    massSolar: 0.122,
    distanceLightYears: 4.246,
    constellation: "Centaurus",
    apparentMagnitude: 11.13,
    absoluteMagnitude: 15.53,
    colorHex: "#FF8A65",
    glowHex: "#D84315",
    hrX: 84.5,
    hrY: 82.2,
    hrRegion: "Main Sequence",
    description:
      "The closest star to our Solar System. A tiny, fully convective red dwarf that will continue fusing hydrogen for roughly 4 trillion years.",
    funFact:
      "Over 75% of all stars in the Milky Way are red dwarfs like Proxima, yet not a single one is visible to the naked human eye from Earth due to their dim luminosity!",
  },
  {
    id: "sirius_a",
    name: "Sirius A",
    designation: "Alpha Canis Majoris A",
    spectralClass: "A",
    spectralType: "A1V",
    category: "blue_white",
    categoryLabel: "Blue-White Main-Sequence Star",
    temperatureK: 9940,
    radiusSolar: 1.71,
    luminositySolar: 25.4,
    massSolar: 2.06,
    distanceLightYears: 8.6,
    constellation: "Canis Major",
    apparentMagnitude: -1.46,
    absoluteMagnitude: +1.43,
    colorHex: "#D6E4FF",
    glowHex: "#85A5FF",
    hrX: 33.5,
    hrY: 41.2,
    hrRegion: "Main Sequence",
    description:
      "The brightest star in Earth's night sky, shining with a striking diamond blue-white luster.",
    funFact:
      "Sirius A is twice as massive as the Sun and shines 25 times brighter, meaning it will live only about 1.3 billion years before exhausting its hydrogen fuel.",
  },
  {
    id: "spica",
    name: "Spica",
    designation: "Alpha Virginis",
    spectralClass: "B",
    spectralType: "B1V",
    category: "blue_white",
    categoryLabel: "Hot Blue Main-Sequence Star",
    temperatureK: 25300,
    radiusSolar: 7.47,
    luminositySolar: 20500,
    massSolar: 11.4,
    distanceLightYears: 250,
    constellation: "Virgo",
    apparentMagnitude: 0.98,
    absoluteMagnitude: -3.55,
    colorHex: "#99B8FF",
    glowHex: "#597EF7",
    hrX: 13.5,
    hrY: 17.5,
    hrRegion: "Main Sequence",
    description:
      "A blistering hot B-type star radiating ferocious ultraviolet energy at over 25,000 Kelvin.",
    funFact:
      "Spica radiates so much invisible energetic ultraviolet radiation that its total bolometric luminosity is over 20,000 times that of the Sun!",
  },
  {
    id: "arcturus",
    name: "Arcturus",
    designation: "Alpha Boötis",
    spectralClass: "K",
    spectralType: "K1.5III",
    category: "red_giant",
    categoryLabel: "Orange Red Giant Star",
    temperatureK: 4286,
    radiusSolar: 25.4,
    luminositySolar: 170,
    massSolar: 1.08,
    distanceLightYears: 36.7,
    constellation: "Boötes",
    apparentMagnitude: -0.05,
    absoluteMagnitude: -0.31,
    colorHex: "#FFB74D",
    glowHex: "#F57C00",
    hrX: 68.2,
    hrY: 30.5,
    hrRegion: "Red Giants",
    description:
      "An aging star that exhausted core hydrogen, swollen to 25 times the Sun's radius while cooling to an orange hue.",
    funFact:
      "Arcturus has roughly the same mass as our Sun, giving us a preview of what the Sun will look like in 5 billion years when it expands into a red giant!",
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    designation: "Alpha Tauri",
    spectralClass: "K",
    spectralType: "K5III",
    category: "red_giant",
    categoryLabel: "Red Giant Star",
    temperatureK: 3900,
    radiusSolar: 44.1,
    luminositySolar: 440,
    massSolar: 1.16,
    distanceLightYears: 65.3,
    constellation: "Taurus",
    apparentMagnitude: 0.85,
    absoluteMagnitude: -0.63,
    colorHex: "#FFA726",
    glowHex: "#E65100",
    hrX: 73.1,
    hrY: 26.2,
    hrRegion: "Red Giants",
    description:
      "The fiery eye of Taurus the Bull. A giant star whose diameter spans 44 times the Sun, radiating a warm amber-orange glow.",
    funFact:
      "If placed at the center of our Solar System, Aldebaran's surface would engulf the orbit of planet Mercury and fill half the sky towards Venus!",
  },
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    designation: "Alpha Orionis",
    spectralClass: "M",
    spectralType: "M1-2Ia-ab",
    category: "supergiant",
    categoryLabel: "Red Supergiant Star",
    temperatureK: 3600,
    radiusSolar: 764,
    luminositySolar: 126000,
    massSolar: 16.5,
    distanceLightYears: 642,
    constellation: "Orion",
    apparentMagnitude: 0.5,
    absoluteMagnitude: -5.85,
    colorHex: "#FF7043",
    glowHex: "#BF360C",
    hrX: 78.5,
    hrY: 8.5,
    hrRegion: "Supergiants",
    description:
      "A colossal red supergiant pulsating on Orion's shoulder. It is destined to detonate in a spectacular core-collapse supernova.",
    funFact:
      "If Betelgeuse replaced our Sun, its churning surface would swallow Mercury, Venus, Earth, Mars, and even reach all the way out to the orbit of Jupiter!",
  },
  {
    id: "rigel",
    name: "Rigel A",
    designation: "Beta Orionis A",
    spectralClass: "B",
    spectralType: "B8Ia",
    category: "supergiant",
    categoryLabel: "Blue Supergiant Star",
    temperatureK: 12100,
    radiusSolar: 78.9,
    luminositySolar: 120000,
    massSolar: 21.0,
    distanceLightYears: 860,
    constellation: "Orion",
    apparentMagnitude: 0.13,
    absoluteMagnitude: -7.84,
    colorHex: "#B0C4DE",
    glowHex: "#4169E1",
    hrX: 27.5,
    hrY: 9.1,
    hrRegion: "Supergiants",
    description:
      "The dazzling blue supergiant at Orion's foot. A blazing powerhouse radiating 120,000 times the radiant power of our Sun.",
    funFact:
      "Rigel shines with the power of 120,000 Suns. It burns through its nuclear fuel so furiously that its entire lifespan is under 10 million years!",
  },
  {
    id: "sirius_b",
    name: "Sirius B (The Pup)",
    designation: "Alpha Canis Majoris B",
    spectralClass: "D",
    spectralType: "DA2",
    category: "white_dwarf",
    categoryLabel: "White Dwarf Remnant",
    temperatureK: 25200,
    radiusSolar: 0.0084, // ~5,840 km, slightly smaller than Earth (6,371 km)
    luminositySolar: 0.056,
    massSolar: 1.02,
    distanceLightYears: 8.6,
    constellation: "Canis Major",
    apparentMagnitude: 8.44,
    absoluteMagnitude: +11.18,
    colorHex: "#E6F0FF",
    glowHex: "#91D5FF",
    hrX: 14.1,
    hrY: 76.5,
    hrRegion: "White Dwarfs",
    description:
      "The burned-out stellar core of a dead star. It contains an entire solar mass compressed into a sphere smaller than the Earth!",
    funFact:
      "Sirius B's gravity is 350,000 times stronger than Earth's. A single teaspoon of its electron-degenerate carbon-oxygen matter weighs over 5 metric tons!",
  },
  {
    id: "vega",
    name: "Vega",
    designation: "Alpha Lyrae",
    spectralClass: "A",
    spectralType: "A0V",
    category: "blue_white",
    categoryLabel: "Blue-White Standard Star",
    temperatureK: 9602,
    radiusSolar: 2.36,
    luminositySolar: 40.1,
    massSolar: 2.14,
    distanceLightYears: 25.04,
    constellation: "Lyra",
    apparentMagnitude: 0.03,
    absoluteMagnitude: +0.58,
    colorHex: "#E6EEFF",
    glowHex: "#ADC6FF",
    hrX: 35.2,
    hrY: 38.4,
    hrRegion: "Main Sequence",
    description:
      "The historical zero-point benchmark for the astronomical magnitude photometric scale.",
    funFact:
      "Vega spins so rapidly (once every 12.5 hours) that centrifugal force bulges its equator out, making it 19% wider at the equator than at its poles!",
  },
  {
    id: "polaris",
    name: "Polaris",
    designation: "Alpha Ursae Minoris",
    spectralClass: "F",
    spectralType: "F7Ib",
    category: "supergiant",
    categoryLabel: "Yellow Bright Giant (Cepheid)",
    temperatureK: 6015,
    radiusSolar: 37.5,
    luminositySolar: 1260,
    massSolar: 5.4,
    distanceLightYears: 433,
    constellation: "Ursa Minor",
    apparentMagnitude: 1.98,
    absoluteMagnitude: -3.64,
    colorHex: "#FFFBE6",
    glowHex: "#FFE58F",
    hrX: 50.8,
    hrY: 22.5,
    hrRegion: "Supergiants",
    description:
      "The current North Star. A pulsating Classical Cepheid variable bright giant star.",
    funFact:
      "Polaris is not a single star, but a triple star system located almost directly aligned with Earth's rotational axis in the northern celestial sphere.",
  },
  {
    id: "trappist_1",
    name: "TRAPPIST-1",
    designation: "2MASS J23062928-0502285",
    spectralClass: "M",
    spectralType: "M8V",
    category: "red_dwarf",
    categoryLabel: "Ultra-Cool Red Dwarf",
    temperatureK: 2566,
    radiusSolar: 0.119,
    luminositySolar: 0.00055,
    massSolar: 0.089,
    distanceLightYears: 39.46,
    constellation: "Aquarius",
    apparentMagnitude: 18.8,
    absoluteMagnitude: +18.4,
    colorHex: "#FF6F43",
    glowHex: "#BF360C",
    hrX: 92.5,
    hrY: 88.5,
    hrRegion: "Main Sequence",
    description:
      "An ultra-cool red dwarf barely larger than Jupiter, famous for hosting 7 Earth-sized rocky exoplanets.",
    funFact:
      "TRAPPIST-1 is so small that its entire planetary system of 7 worlds orbits closer to it than Mercury orbits around our Sun!",
  },
  {
    id: "deneb",
    name: "Deneb",
    designation: "Alpha Cygni",
    spectralClass: "A",
    spectralType: "A2Ia",
    category: "supergiant",
    categoryLabel: "White Supergiant Star",
    temperatureK: 8525,
    radiusSolar: 203,
    luminositySolar: 196000,
    massSolar: 19.0,
    distanceLightYears: 2615,
    constellation: "Cygnus",
    apparentMagnitude: 1.25,
    absoluteMagnitude: -8.38,
    colorHex: "#E6F0FF",
    glowHex: "#85A5FF",
    hrX: 38.5,
    hrY: 7.2,
    hrRegion: "Supergiants",
    description:
      "One of the most luminous stars visible to the naked human eye, shining from over 2,600 light-years away.",
    funFact: "Deneb radiates in just one day as much energy as our Sun produces in 500 years!",
  },
  {
    id: "antares",
    name: "Antares",
    designation: "Alpha Scorpii",
    spectralClass: "M",
    spectralType: "M1.5Iab",
    category: "supergiant",
    categoryLabel: "Red Supergiant Star",
    temperatureK: 3660,
    radiusSolar: 680,
    luminositySolar: 75900,
    massSolar: 14.3,
    distanceLightYears: 550,
    constellation: "Scorpius",
    apparentMagnitude: 1.06,
    absoluteMagnitude: -5.28,
    colorHex: "#FF7043",
    glowHex: "#D84315",
    hrX: 77.2,
    hrY: 10.8,
    hrRegion: "Supergiants",
    description:
      "The rival of Mars (Ares). A gargantuan red supergiant anchoring the heart of the celestial scorpion.",
    funFact:
      "Ancient Greek stargazers called it 'Anti-Ares' (rival to Mars) because its deep reddish color and brightness rivaled the Red Planet as it passed nearby.",
  },
  {
    id: "procyon_b",
    name: "Procyon B",
    designation: "Alpha Canis Minoris B",
    spectralClass: "D",
    spectralType: "DQZ",
    category: "white_dwarf",
    categoryLabel: "White Dwarf Remnant",
    temperatureK: 7740,
    radiusSolar: 0.0123,
    luminositySolar: 0.00049,
    massSolar: 0.6,
    distanceLightYears: 11.46,
    constellation: "Canis Minor",
    apparentMagnitude: 10.92,
    absoluteMagnitude: +13.2,
    colorHex: "#FFFBE6",
    glowHex: "#FFE58F",
    hrX: 42.5,
    hrY: 89.2,
    hrRegion: "White Dwarfs",
    description: "A cool, dense white dwarf companion orbiting the bright subgiant Procyon A.",
    funFact:
      "As white dwarfs cool over trillions of years without any internal fusion, they will eventually fade into theoretical cold, dark objects called Black Dwarfs.",
  },
];

export interface SubLesson09 {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  content: {
    junior: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    explorer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    astronomer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
  };
}

export const MODULE_09_SUBLESSONS: SubLesson09[] = [
  {
    id: "09-01",
    number: 1,
    title: "1. What Makes a Star Shine?",
    subtitle: "Nuclear fusion, mass-energy equivalence, and photon travel",
    content: {
      junior: {
        summary:
          "Stars are not on fire like a campfire! Instead, deep in their super-hot hearts, stars squeeze tiny invisible building blocks called hydrogen atoms together into helium. This releases gigantic amounts of heat and light that travel across space.",
        keyConcepts: [
          "Stars do not burn wood or coal; they shine through nuclear fusion.",
          "Four tiny hydrogen particles get squeezed together to make one helium particle.",
          "A tiny bit of mass turns into pure light energy during this squeeze!",
        ],
        details: [
          "The center of our Sun is crushed by the weight of everything above it to a scorching 15 million degrees.",
          "The light created in the core bounces around inside the star for tens of thousands of years before finally escaping into space.",
          "Once light leaves the star's surface, it races through space at the speed of light: 300,000 kilometers per second!",
        ],
        didYouKnow:
          "Every second, our Sun turns 4 million tons of matter directly into pure radiant energy—enough power to run all of Earth's cities for millions of years!",
      },
      explorer: {
        summary:
          "A star is a self-luminous sphere of plasma held together by its own gravity and powered by thermonuclear fusion in its core. Through Einstein's equation E = mc², the mass deficit in the proton-proton chain is converted directly into electromagnetic radiation.",
        keyConcepts: [
          "Thermonuclear Fusion: Extreme temperature and pressure overcome electrostatic repulsion between protons.",
          "Mass-Energy Equivalence: In each fusion reaction, 0.7% of the hydrogen mass is converted directly into photons (E = mc²).",
          "Hydrostatic Equilibrium: Outward thermal pressure perfectly balances the inward gravitational crush.",
        ],
        details: [
          "Low and medium mass stars like the Sun rely predominantly on the proton-proton (p-p) chain fusion process.",
          "Hotter, more massive stars (>1.3 solar masses) fuse hydrogen via the catalytic CNO (Carbon-Nitrogen-Oxygen) cycle.",
          "Photons take 10,000 to 170,000 years to slowly diffuse through the dense radiative zone via countless Thomson scatterings.",
        ],
        didYouKnow:
          "The sunlight hitting your face right now was generated inside the Sun's core during the last ice age on Earth, tens of thousands of years ago!",
      },
      astronomer: {
        summary:
          "Stars maintain structural stability through hydrostatic equilibrium: dP/dr = -G M(r) ρ(r) / r². The energy generation rate ε in the stellar core is governed by the Gamow peak quantum tunneling probability, where fusion occurs via the p-p chain or CNO cycle at temperatures T > 10⁷ K.",
        keyConcepts: [
          "Gamow Peak: High thermal velocity Maxwell-Boltzmann distribution multiplied by quantum mechanical Coulomb barrier penetration probability.",
          "p-p Chain vs CNO: p-p chain energy generation scales as ε ∝ T⁴, while the CNO cycle scales steeply as ε ∝ T¹⁶–T²⁰.",
          "Radiative Transport: Energy gradient governed by opacity κ: dT/dr = - (3 κ ρ L) / (16 π a c r² T³).",
        ],
        details: [
          "In the core of a star, four protons have a combined rest mass of 4.029 amu, while a helium-4 nucleus has 4.0015 amu. The mass difference Δm = 0.0275 amu (0.71%) is released as gamma photons and neutrinos.",
          "Neutrinos interact so weakly with matter that they escape the solar core in just 2.3 seconds, serving as our only real-time probe of core fusion rates (Super-Kamiokande and SNO detectors).",
          "If the core temperature rises slightly, the core expands, cools, and decreases fusion rate—functioning as a self-regulating gravitational thermostat.",
        ],
        didYouKnow:
          "The solar neutrino problem, where only 1/3 of predicted solar neutrinos were initially detected on Earth, proved that neutrinos have non-zero mass and oscillate between flavors on their flight to Earth (2015 Nobel Prize in Physics)!",
      },
    },
  },
  {
    id: "09-02",
    number: 2,
    title: "2. Why Stars Have Different Colors",
    subtitle: "Blackbody radiation, Wien's displacement law, and the myth of green stars",
    content: {
      junior: {
        summary:
          "Just like a piece of iron in a blacksmith's fire changes from dull red to bright orange and then white-hot, stars change color depending on how hot their surfaces are! Cool stars glow red, medium stars glow yellow or white, and the hottest stars blaze bright blue.",
        keyConcepts: [
          "Red stars are the coolest stars (like warm glowing embers).",
          "Yellow and white stars are medium temperature (like our Sun).",
          "Blue stars are the hottest stars in the entire universe!",
        ],
        details: [
          "A red star has a surface temperature around 3,000 degrees Celsius.",
          "Our Sun's surface is about 5,500 degrees Celsius and shines warm white.",
          "A blazing blue star can reach over 20,000 to 40,000 degrees Celsius!",
        ],
        didYouKnow:
          "Have you ever noticed there are NO green stars in the sky? Stars emit a wide rainbow of colors all mixed together, and our human eyes see that combination as white or yellow, never pure green!",
      },
      explorer: {
        summary:
          "Stars behave as nearly perfect thermal blackbody emitters. Their color is dictated by the continuous Planck radiation spectrum: hotter objects radiate more energy at shorter, more energetic wavelengths. Wien's Law states that peak emission wavelength is inversely proportional to temperature: λ_peak = 2.898×10⁻³ / T.",
        keyConcepts: [
          "Continuous Blackbody Spectrum: Thermal agitation of charged particles produces light across all wavelengths.",
          "Wien's Displacement Law: Peak wavelength shifts toward blue and ultraviolet as temperature rises.",
          "Stefan-Boltzmann Law: Total radiant energy flux scales as the fourth power of temperature (F = σ T⁴).",
        ],
        details: [
          "Red stars (Betelgeuse, Proxima Centauri) peak in the infrared and red spectrum (650–1000 nm).",
          "Sun-like stars peak near 500 nm (green-blue light), but because they also emit abundant red, yellow, and blue light simultaneously, human trichromatic vision perceives them as white.",
          "Hot O and B stars peak in the far ultraviolet, but their visible light tail is heavily weighted toward blue wavelengths (400–480 nm).",
        ],
        didYouKnow:
          "Do not confuse real star colors with astrophotography images! Space telescope images often use false-color narrowband filters (like hydrogen-alpha and oxygen-III) that tint clouds green and purple for scientific analysis, but to human eyes, stars strictly follow blackbody colors.",
      },
      astronomer: {
        summary:
          "Stellar continuous emission is governed by Planck's radiation law: B_λ(T) = (2hc² / λ⁵) / [exp(hc / λkT) - 1]. Differentiating with respect to wavelength yields Wien's Displacement Law: λ_max · T = 2.897771955×10⁻³ m·K. Stellar color indices (such as B - V and Gaia G_BP - G_RP) measure the slope of this Planck curve across calibrated photometric bandpasses.",
        keyConcepts: [
          "Planck Function: Relativistic quantum derivation explaining blackbody intensity per unit wavelength.",
          "Color Index (B - V): Ratio of fluxes in Blue (~440 nm) and Visual (~550 nm) filters, calibrated such that Vega has B - V = 0.00.",
          "Absence of Green Stars: Human color vision integrates the broad Planck curve across L, M, and S retinal cone sensitivities. A peak at 500 nm activates both L (red) and M (green) cones equally, producing a white/yellow chromaticity coordinate (x ≈ 0.33, y ≈ 0.34).",
        ],
        details: [
          "Cool stars (T_eff ≈ 3,000 K) have B - V > +1.5, appearing reddish-orange.",
          "Intermediate stars like the Sun (T_eff = 5,772 K) have B - V = +0.65.",
          "Extremely hot O-type stars (T_eff > 30,000 K) have negative color indices B - V ≈ -0.33, saturating the human visual eye with blue-violet photons.",
        ],
        didYouKnow:
          "The color of a star is also affected by interstellar extinction and reddening: microscopic interstellar dust grains scatter short blue wavelengths more efficiently than longer red wavelengths, making distant stars appear redder than their true spectral class!",
      },
    },
  },
  {
    id: "09-03",
    number: 3,
    title: "3. Stellar Temperature and Spectral Class",
    subtitle:
      "Harvard OBAFGKM classification, Balmer absorption lines, and Morgan-Keenan luminosity",
    content: {
      junior: {
        summary:
          "Astronomers sort all the stars into seven main color-temperature families with the letters O, B, A, F, G, K, and M. A famous rhyme to remember them is: 'Oh, Be A Fine Girl/Guy, Kiss Me!' O stars are scorching blue, G stars like our Sun are yellow-white, and M stars are cool red.",
        keyConcepts: [
          "Star letters: O, B, A, F, G, K, M from hottest to coolest.",
          "O stars are super giant blue stars hotter than 30,000 degrees.",
          "Our Sun is a G-class star right in the middle at about 5,500 degrees.",
          "M stars are cooler red stars around 3,000 degrees.",
        ],
        details: [
          "Annie Jump Cannon and her team at Harvard looked at thousands of star light patterns and created this famous code over 100 years ago.",
          "Each letter also has numbers from 0 to 9, so a G0 star is slightly hotter than a G9 star.",
          "By looking at the dark barcode lines in starlight, scientists can tell what elements are inside the star without ever visiting it!",
        ],
        didYouKnow:
          "Annie Jump Cannon was nearly deaf, but she personally classified more than 350,000 stars by hand just by examining their glass photographic spectra plates!",
      },
      explorer: {
        summary:
          "The Morgan-Keenan (MK) spectral classification system categorizes stars by their surface temperature (O, B, A, F, G, K, M) and luminosity class (I through VII). Dark absorption lines in a star's spectrum reveal its temperature because different chemical elements only absorb specific wavelengths when their electrons occupy precise energy states.",
        keyConcepts: [
          "Spectral Classes: O (>30,000 K), B (10,000–30,000 K), A (7,500–10,000 K), F (6,000–7,500 K), G (5,200–6,000 K), K (3,700–5,200 K), M (2,400–3,700 K).",
          "Balmer Lines: Hydrogen absorption lines are strongest in class A stars (~9,500 K) because hydrogen electrons occupy the n = 2 energy level.",
          "Luminosity Classes: I (Supergiants), II (Bright Giants), III (Regular Giants), IV (Subgiants), V (Main-Sequence Dwarfs), VII (White Dwarfs).",
        ],
        details: [
          "In hot O stars, hydrogen atoms are completely stripped of electrons (ionized), so hydrogen lines are weak, while ionized helium (He II) lines dominate.",
          "In cool M stars, temperatures are low enough for complex molecules like Titanium Oxide (TiO) to survive, creating broad absorption bands that carve valleys into the spectrum.",
          "Our Sun is classified as G2V: 'G2' means surface temperature 5,772 K, and 'V' denotes a stable main-sequence dwarf.",
        ],
        didYouKnow:
          "Astronomers have recently added three new spectral classes for ultra-cool failed stars and brown dwarfs: L, T, and Y, where temperatures drop down to just 300 Kelvin (room temperature)!",
      },
      astronomer: {
        summary:
          "Spectral lines are quantitatively governed by the Boltzmann excitation equation (N_b / N_a = (g_b / g_a) exp(-ΔE / kT)) and the Saha ionization equation: (N_j+1 / N_j) P_e = [2 k T (2 π m_e k T / h²)^(3/2)] [U_j+1(T) / U_j(T)] exp(-χ_j / kT). Cecilia Payne-Gaposchkin applied these equations in 1925 to discover that stars are composed overwhelmingly of hydrogen and helium.",
        keyConcepts: [
          "Payne-Gaposchkin Discovery: Differences in stellar spectra reflect temperature and electron pressure, NOT vast differences in chemical abundance.",
          "Balmer Maximum: At T ≈ 9,520 K (A0V stars), the fraction of neutral hydrogen in the n = 2 excitation state reaches its theoretical maximum.",
          "Luminosity Classification: MK luminosity classes (Ia, Ib, II, III, IV, V, VI, VII) are determined by spectral line width (collisional/Stark broadening), which decreases in low-density supergiant atmospheres.",
        ],
        details: [
          "Class O: Lines of ionized helium (He II 468.6 nm), doubly and triply ionized nitrogen and oxygen; neutral hydrogen is weakly detectable.",
          "Class B: Neutral helium (He I) reaches maximum intensity at B2; hydrogen lines steadily strengthen.",
          "Class A: Dominant neutral hydrogen Balmer lines (Hα 656.3 nm, Hβ 486.1 nm, Hγ 434.0 nm, Hδ 410.2 nm). Ionized metals like Ca II (H & K lines at 396.8 nm and 393.4 nm) begin to appear.",
          "Class F: Ca II H & K lines become prominent; Balmer lines weaken as temperatures drop below 7,500 K.",
          "Class G: Neutral metal lines (Fe I, Ca I) surpass hydrogen; G-band of CH molecules appears.",
          "Class K: Neutral metal lines dominate; Ca I 422.7 nm is very strong.",
          "Class M: Deep molecular absorption bands of TiO and VO dominate; neutral metal lines remain strong.",
        ],
        didYouKnow:
          "When Cecilia Payne proved in her 1925 Harvard Ph.D. thesis that the universe is made of hydrogen and helium, famous astrophysicist Henry Norris Russell told her it was 'impossible' because scientists believed stars had the same composition as Earth. Four years later, Russell realized she was right and confirmed her discovery!",
      },
    },
  },
  {
    id: "09-04",
    number: 4,
    title: "4. Luminosity versus Apparent Brightness",
    subtitle: "The inverse-square law, absolute vs apparent magnitude, and standard candles",
    content: {
      junior: {
        summary:
          "Think of a car's headlights: when the car is right next to you, the lights are blindingly bright! But if the car is two miles away down a dark road, the headlights look like tiny faint fireflies. The headlight's real power didn't change—only its distance from you did!",
        keyConcepts: [
          "Luminosity is how much light a star really produces (its intrinsic power).",
          "Apparent brightness is how bright that star looks to our eyes from Earth.",
          "A faint star in our sky might actually be a gargantuan supergiant that is just tremendously far away!",
        ],
        details: [
          "Our Sun looks a billion times brighter than nighttime stars only because it is right next door to us (150 million km).",
          "If you moved our Sun out to where Sirius is, it would look like an ordinary, rather dim dot in the night sky.",
          "As light spreads outward into space, it gets diluted across bigger and bigger imaginary spheres.",
        ],
        didYouKnow:
          "If you double your distance from a glowing star, its light spreads out over 4 times the area, making it look 4 times dimmer!",
      },
      explorer: {
        summary:
          "Apparent brightness (F) depends on intrinsic luminosity (L) and distance (d) via the Inverse-Square Law: F = L / (4π d²). To compare stars objectively without distance distortion, astronomers use Absolute Magnitude (M), defined as the apparent magnitude a star would possess if placed at a standard reference distance of exactly 10 parsecs (32.6 light-years).",
        keyConcepts: [
          "Inverse-Square Law: Light spreads across a spherical wavefront of area 4π r².",
          "Apparent Magnitude (m): How bright a star appears from Earth (lower/more negative numbers = brighter).",
          "Absolute Magnitude (M): The true luminosity benchmark at 10 parsecs distance.",
          "Distance Modulus Formula: m - M = 5 log₁₀(d) - 5, where d is in parsecs.",
        ],
        details: [
          "The Sun has an apparent magnitude of m = -26.74, but an absolute magnitude of M = +4.83. At 10 parsecs, it would be a faint 5th-magnitude star barely visible from suburban skies.",
          "Rigel has an absolute magnitude of M = -7.84. Even though it is 860 light-years away, it outshines almost every star in our night sky because its true luminosity is 120,000 Suns!",
          "The magnitude scale is logarithmic: a difference of 5 magnitudes corresponds to exactly a 100-fold difference in brightness (each magnitude step is 2.512×).",
        ],
        didYouKnow:
          "Ancient astronomer Hipparchus invented the magnitude scale in 150 BCE by calling the brightest stars '1st class' and the faintest visible stars '6th class'. That is why brighter objects have smaller (and even negative) numbers!",
      },
      astronomer: {
        summary:
          "Radiant flux received at distance d is F = L_bol / (4π d²). The Pogson relation defines the photometric magnitude scale: m₁ - m₂ = -2.5 log₁₀(F₁ / F₂). The bolometric absolute magnitude M_bol is linked to luminosity via M_bol - M_bol,☉ = -2.5 log₁₀(L / L_☉), where M_bol,☉ = +4.74. Parallax measurements (ϖ) from ESA's Gaia mission provide direct geometric distances: d = 1 / ϖ.",
        keyConcepts: [
          "Bolometric Correction (BC): M_bol = M_V + BC. BC accounts for radiation emitted outside the visual V band (e.g., ultraviolet in O stars, infrared in M stars).",
          "Distance Modulus: μ = m - M = 5 log₁₀(d) - 5 + A_V, where A_V represents interstellar extinction in magnitudes.",
          "Standard Candles: Objects with known intrinsic luminosity L (Cepheid variables via Leavitt's law, Type Ia supernovae) allow astronomers to calculate cosmic distances across billions of light-years.",
        ],
        details: [
          "A difference of 1.0 magnitude corresponds to a flux ratio of 10^(0.4) ≈ 2.511886.",
          "Interstellar dust grains attenuate and scatter light, adding an extinction term A_V that makes stars appear dimmer (and thus appear deceptively farther away) unless corrected via multi-band color excesses E(B - V).",
          "The James Webb Space Telescope can detect infrared sources with apparent magnitudes down to m ≈ +34, over 10 billion times fainter than what the naked human eye can see!",
        ],
        didYouKnow:
          "Henrietta Swan Leavitt discovered the Period-Luminosity relationship of Cepheid variable stars in 1912 while working as a 'human computer' at Harvard. Edwin Hubble later used her relationship to prove that Andromeda was a separate galaxy outside the Milky Way!",
      },
    },
  },
  {
    id: "09-05",
    number: 5,
    title: "5. Stellar Size and Mass",
    subtitle: "The Stefan-Boltzmann law, radius calculation, and the mass-luminosity relation",
    content: {
      junior: {
        summary:
          "Stars come in mind-boggling sizes! If the smallest red dwarf star were the size of a golf ball, our Sun would be a large beachball, and a monstrous supergiant star like Betelgeuse would be as big as a 10-story skyscraper building!",
        keyConcepts: [
          "White dwarfs and small red dwarfs are smaller than or close to Earth's size.",
          "Our Sun is an average-sized dwarf star, about 109 times wider than Earth.",
          "Supergiants are hundreds of times wider than the Sun!",
        ],
        details: [
          "Mass is how much material a star is packed with, while radius is how wide it is.",
          "The more mass a star is born with, the hotter its engine burns, and the shorter its life will be.",
          "A supergiant star has a lot of mass, but it is so blown up that its outer layers are thinner than the air we breathe!",
        ],
        didYouKnow:
          "Even though the supergiant Betelgeuse is over 700 times wider than the Sun, it only has about 16 times as much mass—its hot gas is puffed out like cotton candy!",
      },
      explorer: {
        summary:
          "A star's total luminosity depends on both its surface area (4π R²) and its surface temperature (T⁴) according to the Stefan-Boltzmann Law: L = 4π R² σ T⁴. This means a cool red giant can be thousands of times more luminous than a hot white dwarf simply because its radiant surface area is astronomical in size.",
        keyConcepts: [
          "Radius Formula: R / R_☉ = (T_☉ / T)² × √(L / L_☉).",
          "Surface Area Factor: Doubling radius quadruples surface area (4×).",
          "Temperature Factor: Doubling surface temperature increases energy radiated per square meter by 16× (2⁴).",
          "Mass-Luminosity Relation: On the main sequence, L ∝ M^(3.5).",
        ],
        details: [
          "A star with twice the mass of the Sun produces roughly 2^(3.5) ≈ 11.3 times more light, burning through its fuel much faster.",
          "A star with 10 times the Sun's mass shines about 3,160 times brighter, living only ~30 million years compared to the Sun's 10 billion years.",
          "White dwarfs have high surface temperatures (>25,000 K) but tiny luminosities (L ≈ 0.001 L_☉) because their radius is only about that of the Earth (R ≈ 0.01 R_☉).",
        ],
        didYouKnow:
          "Because a star's lifespan scales as Mass / Luminosity ≈ M / M^(3.5) = M^(-2.5), low-mass red dwarfs will still be shining when the universe is 1,000 times older than it is today!",
      },
      astronomer: {
        summary:
          "Stellar radius is directly derived by equating bolometric luminosity to blackbody flux integrated over spherical area: L_bol = 4π R² σ T_eff⁴, where σ = 5.670374419×10⁻⁸ W·m⁻²·K⁻⁴. For main-sequence stars, the empirical Mass-Luminosity relation exhibits distinct power-law regimes: L ∝ M^(2.3) for M < 0.43 M_☉; L ∝ M⁴ for 0.43 M_☉ < M < 2 M_☉; L ∝ M^(3.5) for 2 M_☉ < M < 20 M_☉; and asymptotically approaches L ∝ M for radiation-pressure dominated very massive stars.",
        keyConcepts: [
          "Eddington Luminosity Limit: L_Edd = (4π G M c) / κ_es ≈ 3.8×10⁴ (M / M_☉) L_☉. Beyond this limit, radiation pressure blowing on free electrons exceeds inward gravitational force.",
          "Main Sequence Lifespan: τ_MS ≈ 10¹⁰ yr × (M / M_☉) / (L / L_☉) ≈ 10¹⁰ yr × (M / M_☉)⁻².⁵.",
          "Interferometric Radius Verification: Long-baseline optical interferometry (VLTI PIONIER, CHARA Array) measures stellar angular diameters θ directly to within 1% precision: R = (θ / 2) × d.",
        ],
        details: [
          "White dwarfs are governed by electron degeneracy pressure described by the Fowler-Chandrasekhar equation of state: P ∝ ρ^(5/3) (non-relativistic) transitioning to P ∝ ρ^(4/3) (ultra-relativistic). This produces an inverted mass-radius relation: R ∝ M^(-1/3), meaning heavier white dwarfs are physically smaller!",
          "The Chandrasekhar Mass Limit (1.44 M_☉) marks the threshold where electron degeneracy can no longer support the star against gravity, leading to Type Ia supernovae or neutron star collapse.",
          "Very massive O stars near 100 M_☉ experience intense radiation-driven stellar winds that strip off dozens of solar masses over their brief multi-million year lifetimes.",
        ],
        didYouKnow:
          "The most massive star known, R136a1 in the Large Magellanic Cloud, was born with an estimated 250–300 solar masses and shines with over 4.6 million times the luminosity of our Sun!",
      },
    },
  },
  {
    id: "09-06",
    number: 6,
    title: "6. Dwarfs, Giants and Supergiants",
    subtitle: "Stellar zoo: from electron-degenerate white dwarfs to puffy red supergiants",
    content: {
      junior: {
        summary:
          "Astronomers divide stars into different 'families' just like animals in a zoo! There are tiny white dwarfs (super heavy and small like Earth), red dwarfs (dim and long-lived), medium yellow dwarfs (like our Sun), puffy red giants, and monster supergiants.",
        keyConcepts: [
          "White Dwarfs: Dead star cores shrunk to the size of Earth.",
          "Red Dwarfs: Tiny, cool stars that live for trillions of years.",
          "Main-Sequence Stars: Adult stars in their normal prime of life (like our Sun).",
          "Giants and Supergiants: Dying stars that have swelled up like gigantic hot balloons.",
        ],
        details: [
          "A white dwarf is so dense that a single sugar-cube amount of its material would weigh as much as an elephant on Earth!",
          "When our Sun runs out of fuel in 5 billion years, it will swell up into a red giant and swallow Mercury and Venus.",
          "Later, the Sun will gently puff off its outer layers, leaving behind a glowing white dwarf diamond in space.",
        ],
        didYouKnow:
          "Supergiant stars are so huge that light—which circles Earth 7 times in one second—takes over an hour just to travel across the diameter of Betelgeuse!",
      },
      explorer: {
        summary:
          "The term 'dwarf' in astronomy refers to ordinary main-sequence stars in hydrostatic equilibrium (Luminosity Class V) or stellar remnants (White Dwarfs). 'Giants' (Class III) and 'Supergiants' (Class I) are stars that have exhausted core hydrogen, causing their cores to contract and heat while their outer envelopes expand massively and cool.",
        keyConcepts: [
          "Main-Sequence Dwarfs (Class V): Fusing hydrogen into helium stably in their cores (e.g., Sun, Proxima Centauri, Vega).",
          "Red Giants (Class III): Core has run out of hydrogen; hydrogen shell burning puffs the envelope outward (e.g., Arcturus, Aldebaran).",
          "Supergiants (Class I): High-mass stars (>8 M_☉) capable of fusing elements up to carbon, oxygen, neon, and iron (e.g., Betelgeuse, Rigel).",
          "White Dwarfs: Stellar corpses composed of carbon and oxygen supported entirely by quantum electron degeneracy pressure.",
        ],
        details: [
          "Red dwarf stars are fully convective from core to surface. They circulate their entire hydrogen supply into the core, allowing them to burn fuel for trillions of years without leaving any unburned fuel behind.",
          "Red giants experience a 'helium flash' when core temperature reaches 100 million Kelvin, igniting helium fusion into carbon via the triple-alpha process.",
          "Supergiants fuse elements rapidly: hydrogen lasts millions of years, helium lasts hundreds of thousands of years, carbon lasts hundreds of years, and the final iron-core stage lasts less than 24 hours before core collapse!",
        ],
        didYouKnow:
          "Our Sun is called a 'yellow dwarf', but it is actually more luminous and massive than 85% of all the stars in the Milky Way galaxy!",
      },
      astronomer: {
        summary:
          "Stellar structural evolution is driven by core exhaustion: once hydrogen is depleted, the isothermal core undergoes Schoenberg-Chandrasekhar contraction until helium shell ignition occurs. Low-mass stars (<8 M_☉) ascend the Red Giant Branch (RGB), experience the core helium flash, occupy the Horizontal Branch, and ascend the Asymptotic Giant Branch (AGB) before ejecting a planetary nebula and cooling as a degenerate white dwarf.",
        keyConcepts: [
          "Triple-Alpha Process: 3 ⁴He → ¹²C + γ (requires T ≈ 10⁸ K, density ρ ≈ 10⁴ g/cm³).",
          "AGB Thermal Pulses: Helium shell flashes drive episodic superwinds with mass-loss rates dM/dt ≈ 10⁻⁴ M_☉/yr, enriching the interstellar medium with s-process elements.",
          "Degeneracy Pressure: Fermi-Dirac statistics for non-relativistic electrons: P_e = (3 π²)^(2/3) (ℏ² / 5 m_e) n_e^(5/3). Independent of temperature!",
          "Core-Collapse Supernova: Stars with M > 8 M_☉ fuse through neon, oxygen, and silicon burning down to an iron-56 core. Iron photodisintegration and electron capture trigger catastrophic collapse into a neutron star or black hole.",
        ],
        details: [
          "White dwarfs have surface gravities log g ≈ 8.0 (compared to log g ≈ 4.4 for the Sun and log g ≈ -0.5 for Betelgeuse).",
          "Stark broadening of spectral lines is extreme in white dwarfs due to intense micro-electric fields between ions, whereas supergiant lines are needle-thin due to low gas pressure in their extended envelopes.",
          "Brown dwarfs (13 to 80 Jupiter masses) can fuse deuterium but cannot sustain steady hydrogen-1 fusion, cooling indefinitely through spectral classes L, T, and Y.",
        ],
        didYouKnow:
          "In white dwarfs, the atomic nuclei arrange themselves into a rigid solid crystalline lattice as the star cools—meaning older white dwarfs like BPM 37093 ('Lucy') are essentially gargantuan cosmic diamonds spanning thousands of kilometers!",
      },
    },
  },
  {
    id: "09-07",
    number: 7,
    title: "7. Introduction to the Hertzsprung–Russell Diagram",
    subtitle:
      "The master map of astrophysics: axes, the main sequence, and stellar evolution tracks",
    content: {
      junior: {
        summary:
          "Imagine a giant map of every star in the sky! On this map, hotter stars are on the left, cooler stars are on the right, dimmer stars are on the bottom, and super-bright stars are at the top. This famous map is called the Hertzsprung–Russell (H-R) diagram, and it shows the life story of every star in the universe!",
        keyConcepts: [
          "Hot blue stars live on the left side of the map.",
          "Cool red stars live on the right side of the map.",
          "Bright powerhouse stars are high at the top; dim stars are down low.",
          "Most stars line up along a diagonal highway called the Main Sequence!",
        ],
        details: [
          "Two astronomers named Ejnar Hertzsprung and Henry Norris Russell invented this map in the early 1900s.",
          "Our Sun sits right in the comfortable middle of the main sequence highway.",
          "Dying giant stars float up into the top-right corner, while dead white dwarfs sink down to the bottom-left graveyard.",
        ],
        didYouKnow:
          "About 90% of all the stars in the universe live along the Main Sequence diagonal strip right now, just happily fusing hydrogen into helium!",
      },
      explorer: {
        summary:
          "The Hertzsprung–Russell (H-R) diagram plots stellar luminosity (or absolute magnitude) on the vertical Y-axis against surface temperature (or spectral class) on the horizontal X-axis. Crucially, the temperature axis is plotted backwards: hot stars (>30,000 K) are on the left, and cool stars (<3,000 K) are on the right.",
        keyConcepts: [
          "X-Axis: Surface Temperature (log T_eff), decreasing from left to right (O, B, A, F, G, K, M).",
          "Y-Axis: Bolometric Luminosity (log L/L_☉) or Absolute Magnitude (M_V, with brighter negative numbers at the top).",
          "The Main Sequence: The prominent diagonal band where stars spend 90% of their lifespans fusing core hydrogen.",
          "The Red Giant Branch: Upper-right quadrant of cool, highly luminous swollen stars.",
          "The White Dwarf Region: Lower-left quadrant of hot, ultra-dim Earth-sized dead cores.",
        ],
        details: [
          "A star's position on the main sequence is determined almost entirely by its birth mass: high-mass stars are at the top-left (hot and bright), while low-mass stars are at the bottom-right (cool and dim).",
          "Lines of constant stellar radius slope downward from upper-left to lower-right (R = constant).",
          "As stars evolve, they migrate across the H-R diagram along evolutionary tracks: when the Sun exhausts core hydrogen, it will move up and to the right into the red giant realm.",
        ],
        didYouKnow:
          "The H-R diagram is so fundamental that astronomers call it the 'Rosetta Stone of Stellar Astrophysics'—from just a star's position on this graph, you can estimate its mass, radius, temperature, age, and future fate!",
      },
      astronomer: {
        summary:
          "The theoretical H-R diagram plots log L vs log T_eff, while the observational color-magnitude diagram (CMD) plots apparent or absolute magnitude (e.g., M_G or V) against color index (e.g., G_BP - G_RP or B - V). Isochrones (curves of equal age derived from stellar evolutionary codes like MIST and PARSEC) fitted to open and globular cluster CMDs provide the primary clock for measuring the ages of star clusters and the Milky Way.",
        keyConcepts: [
          "Main Sequence Turnoff Point: The mass/luminosity at which cluster stars leave the main sequence indicates the exact age of the cluster: τ_cluster ≈ 10¹⁰ yr × (M_turnoff / M_☉)⁻².⁵.",
          "Hayashi Track & Henyey Track: Pre-main-sequence contraction paths dictated by convective vs radiative equilibrium.",
          "Instability Strip: Nearly vertical region crossing the Cepheid strip where the kappa-opacity mechanism drives stellar pulsations.",
          "Stefan-Boltzmann Isoradius Contours: log L = 2 log R + 4 log T_eff + constant, creating parallel lines of constant radius on the log L vs log T_eff plane.",
        ],
        details: [
          "In globular clusters (such as M13 or Omega Centauri), the main-sequence turnoff occurs around 0.8 M_☉, proving these ancient stellar swarms are over 12 billion years old—nearly as old as the Big Bang itself.",
          "Zero-Age Main Sequence (ZAMS): The locus on the H-R diagram where homogeneous protostars initiate stable core hydrogen burning.",
          "Terminal-Age Main Sequence (TAMS): The locus where core hydrogen abundance drops to X_c = 0, initiating core contraction and the subgiant branch transition.",
        ],
        didYouKnow:
          "Modern space astrometry from ESA's Gaia mission has plotted high-precision H-R diagrams containing over 1.8 billion stars, revealing unprecedented fine structure including the white dwarf cooling sequence bifurcation and the binary star secondary main sequence!",
      },
    },
  },
];

export const MODULE_09_SOURCES: ScientificSource[] = [
  {
    title: "ESA Gaia Mission: Star Mapping & The Hertzsprung-Russell Diagram",
    organization: "ESA",
    url: "https://www.cosmos.esa.int/web/gaia/dr3",
    note: "High-precision geometric parallaxes, photometry, and 1.8-billion-star empirical HR diagrams.",
  },
  {
    title: "NASA Astrophysics: Stars, Classification & Stellar Lifecycles",
    organization: "NASA",
    url: "https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/",
    note: "Educational archive on spectral classes, blackbody radiation, and nucleosynthesis.",
  },
  {
    title: "IAU Commission G1: Binary and Multiple Star Systems & Fundamental Stellar Parameters",
    organization: "IAU",
    url: "https://www.iau.org/science/scientific_bodies/commissions/G1/",
    note: "Official standard values for solar luminosity, mass, and spectral types.",
  },
  {
    title: "SIMBAD Astronomical Database (Strasbourg Astronomical Data Center)",
    organization: "Wikipedia",
    url: "https://simbad.cds.unistra.fr/simbad/",
    note: "Authoritative astronomical database for cross-identifying and querying stellar parameters.",
  },
];

export const MODULE_09_LESSON: LessonModule = {
  moduleId: "09",
  moduleName: "Stars: Colors, Sizes & Temperatures",
  gradeLevelContent: {
    junior: {
      introHook:
        "Step inside the Cosmic Star Museum! Look up at the night sky: some stars sparkle ice-blue, others gleam warm golden, and some glow like fiery red rubies. Let's compare giant monster stars with tiny Earth-sized white dwarfs and discover why stars have different colors!",
      coreConcepts: [
        "Stars shine because deep inside their cores, tiny hydrogen particles are squeezed together into helium.",
        "Color tells you temperature: blue stars are blazing hot, yellow stars like our Sun are warm, and red stars are cooler.",
        "Stars range from tiny white dwarfs the size of Earth to colossal supergiants wide enough to swallow planets!",
      ],
      explanatoryText:
        "Welcome to the Stellar Museum. Here you can grab two stars and put them side-by-side to see who is bigger, hotter, and heavier. You will also play with a special heat slider to see how light changes color as things get hotter!",
      quizQuestions: [
        {
          id: "q09_j_1",
          question: "Which color star is the HOTTEST in the universe?",
          options: ["Red", "Yellow", "Blue", "Green"],
          correctIndex: 2,
          explanation:
            "Blue stars are blazing hot (over 10,000 to 40,000 degrees!), just like the hottest part of a flame.",
          hint: "Think about the color of the hottest flame on a gas stove.",
        },
        {
          id: "q09_j_2",
          question: "What powers a star and makes it shine?",
          options: [
            "Burning coal and wood",
            "Nuclear fusion in its core",
            "Giant electric batteries",
            "Reflecting light from the Moon",
          ],
          correctIndex: 1,
          explanation:
            "Stars shine because nuclear fusion squeezes hydrogen into helium deep inside their cores, releasing enormous light and heat.",
          hint: "It happens in the core when atoms get squeezed together.",
        },
        {
          id: "q09_j_3",
          question: "About how big is a White Dwarf star like Sirius B?",
          options: [
            "About the size of planet Earth",
            "As big as our entire Solar System",
            "The size of a basketball",
            "Twice as big as the Sun",
          ],
          correctIndex: 0,
          explanation:
            "A white dwarf is an ultra-dense dead core that has shrunk to roughly the physical size of planet Earth, even though it still contains the mass of an entire Sun!",
          hint: "It is tiny compared to other stars—about the size of our home world.",
        },
      ],
      funFacts: [
        "The Sun contains 99.86% of all the mass in our Solar System, but compared to supergiants like Betelgeuse, the Sun is like a single grain of sand next to an exercise ball!",
        "There are no green stars in the sky because stars emit a broad rainbow mixture of light that our human eyes see as white or yellow.",
      ],
    },
    explorer: {
      introHook:
        "How do astrophysicists weigh a star or measure its temperature from trillions of miles away? Starlight carries a cosmic barcode! By decoding blackbody radiation, spectral absorption lines, and the Hertzsprung-Russell diagram, we can uncover every secret of a star's size, mass, and destiny.",
      coreConcepts: [
        "Wien's Law dictates that higher temperatures shift the peak wavelength of blackbody radiation toward shorter, bluer wavelengths.",
        "The Stefan-Boltzmann Law (L = 4π R² σ T⁴) links a star's luminosity to both its surface area and temperature.",
        "The Morgan-Keenan spectral system classifies stars into O, B, A, F, G, K, M and luminosity classes I through VII.",
        "The Hertzsprung-Russell diagram maps luminosity against surface temperature, revealing the stable Main Sequence.",
      ],
      explanatoryText:
        "In this interactive laboratory, you will adjust the temperature of a true blackbody emitter, observe the inverse-square dilution of starlight over distance, and explore the master map of astronomy: the Hertzsprung-Russell diagram.",
      quizQuestions: [
        {
          id: "q09_e_1",
          question:
            "According to Wien's Law, what happens to a star's light as its surface temperature increases?",
          options: [
            "Its peak wavelength shifts toward longer, redder wavelengths",
            "Its peak wavelength shifts toward shorter, bluer wavelengths",
            "The star stops emitting ultraviolet light entirely",
            "Its total luminosity drops to zero",
          ],
          correctIndex: 1,
          explanation:
            "Wien's Law states λ_peak = b / T. As temperature T increases, peak wavelength λ_peak becomes shorter, shifting into blue and ultraviolet light.",
          hint: "Hotter means more energetic, higher-frequency photons.",
        },
        {
          id: "q09_e_2",
          question:
            "If Star A has the same surface temperature as Star B, but is 100 times more luminous, what must be true?",
          options: [
            "Star A has 10 times the radius of Star B",
            "Star A is 100 times closer to Earth",
            "Star A has 100 times the radius of Star B",
            "Star A is a white dwarf",
          ],
          correctIndex: 0,
          explanation:
            "Stefan-Boltzmann Law states L ∝ R² T⁴. If temperatures are identical, L_A / L_B = (R_A / R_B)². Therefore, √(100) = 10, meaning Star A has 10 times the radius of Star B.",
          hint: "Luminosity scales with radius squared (R²).",
        },
        {
          id: "q09_e_3",
          question:
            "If you move 3 times farther away from a glowing star, its apparent brightness becomes:",
          options: ["3 times dimmer", "6 times dimmer", "9 times dimmer", "27 times dimmer"],
          correctIndex: 2,
          explanation:
            "The Inverse-Square Law states that apparent brightness F = L / (4π d²). At 3 times the distance, light spreads over 3² = 9 times the area, making the star appear 9 times dimmer.",
          hint: "Distance is squared in the denominator: (3)².",
        },
        {
          id: "q09_e_4",
          question: "Where do about 90% of all stars lie on the Hertzsprung-Russell (H-R) diagram?",
          options: [
            "The White Dwarf graveyard in the lower-left",
            "The Red Giant branch in the upper-right",
            "The diagonal Main Sequence band",
            "The Horizontal Branch",
          ],
          correctIndex: 2,
          explanation:
            "About 90% of stars lie along the Main Sequence diagonal band, because stars spend roughly 90% of their total evolutionary lifespans stably fusing hydrogen in their cores.",
          hint: "It is the long diagonal strip where our Sun currently lives.",
        },
      ],
      funFacts: [
        "Astronomical photographs often use false-color narrowband filters (like the Hubble SHO palette: Sulfur, Hydrogen, Oxygen) to highlight ionized gas structures, but this is NOT how stars look to human eyes. Real star colors strictly follow the blackbody continuum!",
        "Sirius B was the first white dwarf ever discovered (in 1862). Its companion Sirius A outshines it by 10,000 times in visible light, making Sirius B notoriously difficult to see through amateur telescopes.",
      ],
    },
    astronomer: {
      introHook:
        "Stellar astrophysics is grounded in rigorous thermodynamics, quantum mechanics, and nuclear physics. Through the Stefan-Boltzmann law, Planck's blackbody distribution, the Saha-Boltzmann ionization equations, and the Eddington luminosity limit, we quantitatively decipher the inner engines of stars and map the cosmic population of the Milky Way.",
      coreConcepts: [
        "Blackbody spectral radiance B_λ(T) is derived from Planck's quantum law; integration yields the Stefan-Boltzmann total flux F = σ T⁴.",
        "Spectral absorption features are governed by Boltzmann excitation and Saha ionization equilibria; Balmer lines peak at A0 (T ≈ 9,520 K).",
        "The Mass-Luminosity relation L ∝ M^(3.5) causes massive stars to consume core hydrogen at catastrophic rates, dictating a main-sequence lifespan τ ∝ M^(-2.5).",
        "The Hertzsprung-Russell diagram displays stellar evolutionary tracks; cluster turnoff points provide precise astrophysical clocks.",
      ],
      explanatoryText:
        "Utilize the interactive 3D museum to analyze exact stellar ratios, calculate Planck distributions with Wien's displacement law, test the inverse-square law with distance moduli, and inspect the Gaia-calibrated Hertzsprung-Russell diagram.",
      quizQuestions: [
        {
          id: "q09_a_1",
          question:
            "Why do hydrogen Balmer absorption lines peak in strength in spectral class A0 stars (~9,500 K)?",
          options: [
            "Hotter O and B stars have no hydrogen in their atmospheres",
            "At 9,500 K, the Boltzmann-Saha equations predict the maximum population of neutral hydrogen in the n = 2 excitation level",
            "Cooler G and K stars have already fused all their atmospheric hydrogen into helium",
            "A-type stars possess higher hydrogen abundance than any other spectral class",
          ],
          correctIndex: 1,
          explanation:
            "Balmer lines originate from the n = 2 state. In cooler stars (G, K, M), nearly all hydrogen electrons are in the ground state (n = 1). In hotter stars (O, B), hydrogen is ionized into free protons. At ~9,520 K (A0V), the combination of Boltzmann excitation and Saha ionization maximizes the neutral n = 2 population.",
          hint: "Consider the balance between thermal excitation to n = 2 and complete ionization.",
        },
        {
          id: "q09_a_2",
          question:
            "A main-sequence star with 10 solar masses (M = 10 M☉) will have a main-sequence lifespan approximately:",
          options: [
            "10 times longer than the Sun (~100 billion years)",
            "The same lifespan as the Sun (~10 billion years)",
            "About 300 times shorter than the Sun (~30 million years)",
            "Infinitely long because of high gravity",
          ],
          correctIndex: 2,
          explanation:
            "Main sequence lifetime scales as τ ∝ M / L ∝ M / M^(3.5) = M^(-2.5). For M = 10 M☉: τ ≈ 10¹⁰ yr × (10)^(-2.5) ≈ 10¹⁰ / 316.2 ≈ 3.16×10⁷ years (about 32 million years).",
          hint: "Use τ ∝ M^(-2.5). 10^(2.5) ≈ 316.",
        },
        {
          id: "q09_a_3",
          question: "The Eddington Luminosity Limit represents:",
          options: [
            "The minimum luminosity required for nuclear fusion to ignite",
            "The maximum luminosity a star can generate before outward radiation pressure on electrons exceeds inward gravity",
            "The luminosity of an electron-degenerate white dwarf at the Chandrasekhar mass",
            "The apparent brightness of a standard candle at 10 parsecs",
          ],
          correctIndex: 1,
          explanation:
            "The Eddington limit occurs where radiation pressure on free electrons (via Thomson scattering) exactly balances gravitational attraction: L_Edd = 4π G M c / κ_es. Beyond this limit, a star's outer layers are blown away into space by radiation pressure.",
          hint: "It involves balancing outward radiation pressure against inward gravity.",
        },
        {
          id: "q09_a_4",
          question:
            "In a star cluster's Color-Magnitude Diagram, the Main Sequence Turnoff Point allows astronomers to determine:",
          options: [
            "The exact age of the star cluster",
            "The chemical distance to the galactic core only",
            "The number of exoplanets in the cluster",
            "The exact mass of the central supermassive black hole",
          ],
          correctIndex: 0,
          explanation:
            "All stars in a cluster formed at the same time. The most massive stars evolve off the main sequence first. The luminosity and temperature of the main-sequence turnoff point directly reveal how long the cluster has existed.",
          hint: "Since high-mass stars peel off the main sequence first, the turnoff acts as an evolutionary clock.",
        },
      ],
      funFacts: [
        "The core of a red supergiant just before supernova collapse burns silicon into iron at a temperature exceeding 3 billion Kelvin. This entire silicon-burning stage lasts less than 24 hours before the iron core collapses at 23% the speed of light!",
        "In 1910, Ejnar Hertzsprung and Henry Norris Russell independently developed the H-R diagram. Hertzsprung was a Danish chemical engineer and astronomer, while Russell was director of the Princeton University Observatory.",
      ],
    },
  },
};
