/**
 * NASA JPL Horizons & IAU Authoritative Planetary & Lunar Physical Data
 *
 * Sources:
 * - NASA JPL Solar System Dynamics (SSD): https://ssd.jpl.nasa.gov/
 * - IAU Working Group on Cartographic Coordinates and Rotational Elements (WGCCRE)
 *   (Archinal et al. 2018, Cel. Mech. Dyn. Astr. 130, 22)
 * - Standish, E. M., "JPL Planetary and Lunar Ephemerides, DE440/DE441" (2020)
 */

export interface JplMoonPhysicalDef {
  name: string;
  parent: string;
  radiusKm: number;
  massKg?: number;
  semiMajorAxisKm: number;
  orbitalPeriodDays: number; // positive = prograde, negative = retrograde
  eccentricity: number;
  inclinationDeg: number; // relative to parent body's equatorial or Laplace plane
  nodeDeg?: number; // longitude of ascending node
  color: string;
  albedo: number;
  tidallyLocked: boolean;
  description: string;
}

export interface JplPlanetPhysicalDef {
  name: string;
  jplId: string;
  type: "terrestrial" | "gas_giant" | "ice_giant" | "dwarf_planet" | "star";
  radiusKm: number; // volumetric mean radius
  equatorialRadiusKm: number;
  polarRadiusKm: number;
  massKg: number;
  gmKm3S2: number; // Standard Gravitational Parameter GM
  densityGCm3: number;
  surfaceGravityMS2: number;
  escapeVelocityKmS: number;
  siderealRotationHours: number; // negative = retrograde rotation
  axialTiltDeg: number; // obliquity to orbit
  precessionPeriodYears?: number;
  color: string;
  atmosphereGlow?: string;
  description: string;
  rings?: {
    innerRadiusKm: number;
    outerRadiusKm: number;
    thicknessM: number;
    color: string;
    features: string[]; // e.g. ["Cassini Division", "Encke Gap"]
  };
  moons: JplMoonPhysicalDef[];
}

export const JPL_PLANETS_PHYSICAL: Record<string, JplPlanetPhysicalDef> = {
  Sun: {
    name: "Sun",
    jplId: "10",
    type: "star",
    radiusKm: 696340.0,
    equatorialRadiusKm: 696342.0,
    polarRadiusKm: 696332.0,
    massKg: 1.9884e30,
    gmKm3S2: 132712440041.9394,
    densityGCm3: 1.408,
    surfaceGravityMS2: 274.0,
    escapeVelocityKmS: 617.7,
    siderealRotationHours: 609.12, // 25.38 days at equator (differential rotation)
    axialTiltDeg: 7.25, // obliquity to ecliptic
    color: "#ffc860",
    description:
      "G-type main-sequence star (G2V) comprising 99.86% of the Solar System's total mass.",
    moons: [],
  },
  Mercury: {
    name: "Mercury",
    jplId: "199",
    type: "terrestrial",
    radiusKm: 2439.7,
    equatorialRadiusKm: 2440.5,
    polarRadiusKm: 2438.3,
    massKg: 3.3011e23,
    gmKm3S2: 22031.86855,
    densityGCm3: 5.427,
    surfaceGravityMS2: 3.7,
    escapeVelocityKmS: 4.25,
    siderealRotationHours: 1407.6, // 58.646 days (3:2 spin-orbit resonance)
    axialTiltDeg: 0.034, // virtually zero tilt
    color: "#b09b88",
    description:
      "Heavily cratered, airless terrestrial planet in a 3:2 spin-orbit resonance with the Sun.",
    moons: [],
  },
  Venus: {
    name: "Venus",
    jplId: "299",
    type: "terrestrial",
    radiusKm: 6051.8,
    equatorialRadiusKm: 6051.8,
    polarRadiusKm: 6051.8,
    massKg: 4.8675e24,
    gmKm3S2: 324858.592,
    densityGCm3: 5.243,
    surfaceGravityMS2: 8.87,
    escapeVelocityKmS: 10.36,
    siderealRotationHours: -5832.5, // 243.02 days (RETROGRADE rotation!)
    axialTiltDeg: 177.36, // flipped upside-down relative to right-hand rule
    color: "#e8c98e",
    atmosphereGlow: "#ffd99e",
    description:
      "Runaway greenhouse world with a dense CO2/H2SO4 atmosphere and retrograde clockwise rotation.",
    moons: [],
  },
  Earth: {
    name: "Earth",
    jplId: "399",
    type: "terrestrial",
    radiusKm: 6371.0,
    equatorialRadiusKm: 6378.137,
    polarRadiusKm: 6356.752,
    massKg: 5.9722e24,
    gmKm3S2: 398600.435436,
    densityGCm3: 5.514,
    surfaceGravityMS2: 9.80665,
    escapeVelocityKmS: 11.186,
    siderealRotationHours: 23.9344696,
    axialTiltDeg: 23.4392911,
    precessionPeriodYears: 25772,
    color: "#2875d0",
    atmosphereGlow: "#6fb2ff",
    description:
      "The only known world with active surface plate tectonics, liquid oceans, and life.",
    moons: [
      {
        name: "Moon",
        parent: "Earth",
        radiusKm: 1737.4,
        massKg: 7.342e22,
        semiMajorAxisKm: 384400,
        orbitalPeriodDays: 27.321661,
        eccentricity: 0.0549,
        inclinationDeg: 5.145, // to ecliptic (not Earth equator!)
        nodeDeg: 125.08,
        color: "#c2c4c8",
        albedo: 0.12,
        tidallyLocked: true,
        description: "Earth's large rocky natural satellite in synchronous tidal rotation.",
      },
    ],
  },
  Mars: {
    name: "Mars",
    jplId: "499",
    type: "terrestrial",
    radiusKm: 3389.5,
    equatorialRadiusKm: 3396.2,
    polarRadiusKm: 3376.2,
    massKg: 6.4171e23,
    gmKm3S2: 42828.375214,
    densityGCm3: 3.9335,
    surfaceGravityMS2: 3.72076,
    escapeVelocityKmS: 5.027,
    siderealRotationHours: 24.622962,
    axialTiltDeg: 25.19,
    color: "#c84a22",
    atmosphereGlow: "#e49272",
    description: "Cold iron-oxide desert world hosting Olympus Mons and polar ice deposits.",
    moons: [
      {
        name: "Phobos",
        parent: "Mars",
        radiusKm: 11.267,
        massKg: 1.0658e16,
        semiMajorAxisKm: 9376,
        orbitalPeriodDays: 0.31891, // orbits faster than Mars rotates!
        eccentricity: 0.0151,
        inclinationDeg: 1.093,
        color: "#8c7a6e",
        albedo: 0.071,
        tidallyLocked: true,
        description: "Small, irregularly shaped inner moon on a decaying sub-synchronous orbit.",
      },
      {
        name: "Deimos",
        parent: "Mars",
        radiusKm: 6.2,
        massKg: 1.4762e15,
        semiMajorAxisKm: 23463,
        orbitalPeriodDays: 1.26244,
        eccentricity: 0.0002,
        inclinationDeg: 0.93,
        color: "#968375",
        albedo: 0.068,
        tidallyLocked: true,
        description: "Outermost small Martian moon with smooth dust-mantled surface.",
      },
    ],
  },
  Jupiter: {
    name: "Jupiter",
    jplId: "599",
    type: "gas_giant",
    radiusKm: 69911.0,
    equatorialRadiusKm: 71492.0,
    polarRadiusKm: 66854.0,
    massKg: 1.8982e27,
    gmKm3S2: 126686534.9218,
    densityGCm3: 1.326,
    surfaceGravityMS2: 24.79,
    escapeVelocityKmS: 59.5,
    siderealRotationHours: 9.925,
    axialTiltDeg: 3.13,
    color: "#d0ab7a",
    atmosphereGlow: "#e6cba0",
    description:
      "Dominant gas giant with 2.5 times the mass of all other planets combined, Great Red Spot, and 95 moons.",
    rings: {
      innerRadiusKm: 92000,
      outerRadiusKm: 226000,
      thicknessM: 30000,
      color: "#807060",
      features: ["Halo ring", "Main ring", "Gossamer rings"],
    },
    moons: [
      {
        name: "Io",
        parent: "Jupiter",
        radiusKm: 1821.6,
        massKg: 8.9319e22,
        semiMajorAxisKm: 421700,
        orbitalPeriodDays: 1.769137786,
        eccentricity: 0.0041,
        inclinationDeg: 0.05,
        color: "#e8d254",
        albedo: 0.63,
        tidallyLocked: true,
        description:
          "Most volcanically active body in the Solar System, driven by tidal flexing in 4:2:1 Laplace resonance.",
      },
      {
        name: "Europa",
        parent: "Jupiter",
        radiusKm: 1560.8,
        massKg: 4.8e22,
        semiMajorAxisKm: 670900,
        orbitalPeriodDays: 3.551181,
        eccentricity: 0.009,
        inclinationDeg: 0.47,
        color: "#e2d7c0",
        albedo: 0.67,
        tidallyLocked: true,
        description:
          "Smooth ice-crusted world concealing a global liquid water ocean with more water than Earth.",
      },
      {
        name: "Ganymede",
        parent: "Jupiter",
        radiusKm: 2634.1,
        massKg: 1.4819e23,
        semiMajorAxisKm: 1070400,
        orbitalPeriodDays: 7.154553,
        eccentricity: 0.0013,
        inclinationDeg: 0.2,
        color: "#b09f8c",
        albedo: 0.43,
        tidallyLocked: true,
        description:
          "Largest moon in the Solar System (bigger than Mercury), possessing an intrinsic magnetic field.",
      },
      {
        name: "Callisto",
        parent: "Jupiter",
        radiusKm: 2410.3,
        massKg: 1.0759e23,
        semiMajorAxisKm: 1882700,
        orbitalPeriodDays: 16.689018,
        eccentricity: 0.0074,
        inclinationDeg: 0.28,
        color: "#887968",
        albedo: 0.19,
        tidallyLocked: true,
        description:
          "Ancient, intensely cratered icy moon without interior tidal resonance heating.",
      },
    ],
  },
  Saturn: {
    name: "Saturn",
    jplId: "699",
    type: "gas_giant",
    radiusKm: 58232.0,
    equatorialRadiusKm: 60268.0,
    polarRadiusKm: 54364.0,
    massKg: 5.6834e26,
    gmKm3S2: 37931187.0,
    densityGCm3: 0.687, // less dense than water!
    surfaceGravityMS2: 10.44,
    escapeVelocityKmS: 35.5,
    siderealRotationHours: 10.656,
    axialTiltDeg: 26.73,
    color: "#e2cfa2",
    atmosphereGlow: "#ebdcb4",
    description:
      "Gas giant with oblate flattening and spectacular water-ice ring architecture spanning 282,000 km.",
    rings: {
      innerRadiusKm: 74500, // C ring inner
      outerRadiusKm: 136775, // A ring outer
      thicknessM: 10,
      color: "#dfd2ab",
      features: ["Cassini Division (4800 km wide)", "Encke Gap (325 km wide)", "A, B, C, F rings"],
    },
    moons: [
      {
        name: "Mimas",
        parent: "Saturn",
        radiusKm: 198.2,
        massKg: 3.75e19,
        semiMajorAxisKm: 185520,
        orbitalPeriodDays: 0.942422,
        eccentricity: 0.0202,
        inclinationDeg: 1.574,
        color: "#c6c4bf",
        albedo: 0.96,
        tidallyLocked: true,
        description: "Innermost major Saturnian moon marked by the colossal Herschel crater.",
      },
      {
        name: "Enceladus",
        parent: "Saturn",
        radiusKm: 252.1,
        massKg: 1.08e20,
        semiMajorAxisKm: 238020,
        orbitalPeriodDays: 1.370218,
        eccentricity: 0.0047,
        inclinationDeg: 0.019,
        color: "#f4f6fa",
        albedo: 0.99, // highest geometric albedo in Solar System
        tidallyLocked: true,
        description:
          "Highly reflective icy moon venting warm water vapor and organics from south polar tiger stripes.",
      },
      {
        name: "Tethys",
        parent: "Saturn",
        radiusKm: 531.1,
        massKg: 6.17e20,
        semiMajorAxisKm: 294660,
        orbitalPeriodDays: 1.887802,
        eccentricity: 0.0001,
        inclinationDeg: 1.12,
        color: "#ddd9cf",
        albedo: 0.8,
        tidallyLocked: true,
        description: "Pure water-ice satellite featuring the massive Ithaca Chasma trench.",
      },
      {
        name: "Dione",
        parent: "Saturn",
        radiusKm: 561.4,
        massKg: 1.095e21,
        semiMajorAxisKm: 377400,
        orbitalPeriodDays: 2.736915,
        eccentricity: 0.0022,
        inclinationDeg: 0.019,
        color: "#d0cbbf",
        albedo: 0.6,
        tidallyLocked: true,
        description:
          "Heavily cratered leading hemisphere and bright wispy ice cliffs on trailing side.",
      },
      {
        name: "Rhea",
        parent: "Saturn",
        radiusKm: 763.8,
        massKg: 2.306e21,
        semiMajorAxisKm: 527040,
        orbitalPeriodDays: 4.5175,
        eccentricity: 0.001258,
        inclinationDeg: 0.345,
        color: "#cbc5b9",
        albedo: 0.65,
        tidallyLocked: true,
        description: "Second-largest Saturnian moon, an airless mixture of 75% ice and 25% rock.",
      },
      {
        name: "Titan",
        parent: "Saturn",
        radiusKm: 2574.73,
        massKg: 1.3452e23,
        semiMajorAxisKm: 1221870,
        orbitalPeriodDays: 15.94542,
        eccentricity: 0.0288,
        inclinationDeg: 0.348,
        color: "#e2a946",
        albedo: 0.22,
        tidallyLocked: true,
        description:
          "Only moon with a dense atmosphere (1.45 atm N2) and active surface methane/ethane lakes.",
      },
      {
        name: "Iapetus",
        parent: "Saturn",
        radiusKm: 734.5,
        massKg: 1.805e21,
        semiMajorAxisKm: 3561300,
        orbitalPeriodDays: 79.330183,
        eccentricity: 0.0286,
        inclinationDeg: 15.47, // high inclination to Saturn's ring plane!
        color: "#7e7465",
        albedo: 0.28,
        tidallyLocked: true,
        description:
          "Two-toned yin-yang moon with jet-black leading hemisphere (Cassini Regio) and towering equatorial ridge.",
      },
    ],
  },
  Uranus: {
    name: "Uranus",
    jplId: "799",
    type: "ice_giant",
    radiusKm: 25362.0,
    equatorialRadiusKm: 25559.0,
    polarRadiusKm: 24973.0,
    massKg: 8.681e25,
    gmKm3S2: 5793939.3,
    densityGCm3: 1.271,
    surfaceGravityMS2: 8.69,
    escapeVelocityKmS: 21.3,
    siderealRotationHours: -17.24, // RETROGRADE sideways spin!
    axialTiltDeg: 97.77, // rotates on its side!
    color: "#97d8db",
    atmosphereGlow: "#b3eaed",
    description:
      "Ice giant tipped 98 degrees on its side with retrograde rotation and methane absorption bands.",
    rings: {
      innerRadiusKm: 38000,
      outerRadiusKm: 51149,
      thicknessM: 100,
      color: "#546468",
      features: ["13 narrow dark rings", "Epsilon ring"],
    },
    moons: [
      {
        name: "Miranda",
        parent: "Uranus",
        radiusKm: 235.8,
        massKg: 6.4e19,
        semiMajorAxisKm: 129390,
        orbitalPeriodDays: 1.413479,
        eccentricity: 0.0013,
        inclinationDeg: 4.338,
        color: "#c0c4c8",
        albedo: 0.32,
        tidallyLocked: true,
        description:
          "Geologically scrambled moon featuring Verona Rupes, the tallest cliff in the Solar System (20 km).",
      },
      {
        name: "Ariel",
        parent: "Uranus",
        radiusKm: 578.9,
        massKg: 1.29e21,
        semiMajorAxisKm: 191020,
        orbitalPeriodDays: 2.520379,
        eccentricity: 0.0012,
        inclinationDeg: 0.26,
        color: "#cbd2d8",
        albedo: 0.39,
        tidallyLocked: true,
        description:
          "Brightest Uranian moon with extensive extensional fault valleys and icy resurfacing.",
      },
      {
        name: "Titania",
        parent: "Uranus",
        radiusKm: 788.4,
        massKg: 3.4e21,
        semiMajorAxisKm: 435910,
        orbitalPeriodDays: 8.706234,
        eccentricity: 0.0011,
        inclinationDeg: 0.34,
        color: "#b9bec4",
        albedo: 0.27,
        tidallyLocked: true,
        description: "Largest moon of Uranus, laced with fault scarps and impact craters.",
      },
      {
        name: "Oberon",
        parent: "Uranus",
        radiusKm: 761.4,
        massKg: 3.014e21,
        semiMajorAxisKm: 583520,
        orbitalPeriodDays: 13.463239,
        eccentricity: 0.0014,
        inclinationDeg: 0.058,
        color: "#abb0b6",
        albedo: 0.23,
        tidallyLocked: true,
        description:
          "Outermost major Uranian moon, ancient, heavily cratered, with dark carbonaceous floor deposits.",
      },
    ],
  },
  Neptune: {
    name: "Neptune",
    jplId: "899",
    type: "ice_giant",
    radiusKm: 24622.0,
    equatorialRadiusKm: 24764.0,
    polarRadiusKm: 24341.0,
    massKg: 1.02413e26,
    gmKm3S2: 6836527.10058,
    densityGCm3: 1.638,
    surfaceGravityMS2: 11.15,
    escapeVelocityKmS: 23.5,
    siderealRotationHours: 16.11,
    axialTiltDeg: 28.32,
    color: "#3762dc",
    atmosphereGlow: "#5584f2",
    description:
      "Most distant major planet, driven by extreme supersonic winds exceeding 2,100 km/h and deep methane absorption.",
    rings: {
      innerRadiusKm: 41900,
      outerRadiusKm: 62932,
      thicknessM: 50,
      color: "#304060",
      features: ["Adams ring", "Galle ring", "Ring arcs: Liberté, Égalité, Fraternité"],
    },
    moons: [
      {
        name: "Proteus",
        parent: "Neptune",
        radiusKm: 210.0,
        massKg: 4.4e19,
        semiMajorAxisKm: 117647,
        orbitalPeriodDays: 1.122315,
        eccentricity: 0.0005,
        inclinationDeg: 0.075,
        color: "#7e8690",
        albedo: 0.096,
        tidallyLocked: true,
        description: "Largest irregularly shaped, non-spherical moon of Neptune.",
      },
      {
        name: "Triton",
        parent: "Neptune",
        radiusKm: 1353.4,
        massKg: 2.14e22,
        semiMajorAxisKm: 354760,
        orbitalPeriodDays: -5.876854, // RETROGRADE captured Kuiper Belt object!
        eccentricity: 0.000016,
        inclinationDeg: 156.885, // retrograde inclination relative to Neptune equator!
        color: "#c6d0da",
        albedo: 0.76,
        tidallyLocked: true,
        description:
          "Captured dwarf planet with active nitrogen cryogeysers, retrograde orbit, and cantaloupe terrain.",
      },
      {
        name: "Nereid",
        parent: "Neptune",
        radiusKm: 170.0,
        massKg: 2.7e19,
        semiMajorAxisKm: 5513811,
        orbitalPeriodDays: 360.1362,
        eccentricity: 0.7512, // extremely eccentric!
        inclinationDeg: 7.23,
        color: "#9da6af",
        albedo: 0.155,
        tidallyLocked: false,
        description: "Highly eccentric outer moon scattered during Triton's gravitational capture.",
      },
    ],
  },
  Pluto: {
    name: "Pluto",
    jplId: "999",
    type: "dwarf_planet",
    radiusKm: 1188.3,
    equatorialRadiusKm: 1188.3,
    polarRadiusKm: 1188.3,
    massKg: 1.303e22,
    gmKm3S2: 869.6,
    densityGCm3: 1.854,
    surfaceGravityMS2: 0.62,
    escapeVelocityKmS: 1.21,
    siderealRotationHours: -153.29, // 6.387 days RETROGRADE
    axialTiltDeg: 122.53,
    color: "#cfb096",
    description:
      "Resonant Kuiper Belt dwarf planet (2:3 with Neptune) hosting nitrogen-ice glacier Sputnik Planitia.",
    moons: [
      {
        name: "Charon",
        parent: "Pluto",
        radiusKm: 606.0,
        massKg: 1.586e21,
        semiMajorAxisKm: 19591,
        orbitalPeriodDays: -6.38723, // mutually tidally locked to Pluto!
        eccentricity: 0.00005,
        inclinationDeg: 0.0, // aligned with Pluto's equator
        color: "#9d8e7e",
        albedo: 0.38,
        tidallyLocked: true,
        description:
          "Mutually tidally locked binary companion; their barycenter lies outside Pluto's surface.",
      },
    ],
  },
};
