/**
 * Physics-Informed Planetary System Formation Engine
 *
 * Scientific Authorities:
 * - Hayashi, C. (1981) "Structure of the Solar Nebula, Growth and Decay of Magnetic Fields and Effects of Magnetic and Turbulent Viscosities on the Nebula", PTP Suppl. 70, 35 (MMSN Model)
 * - Weidenschilling, S.J. (1977) "Aerodynamics of solid bodies in the solar nebula", MNRAS 180, 57
 * - Goldreich, P. & Ward, W.R. (1973) "The Formation of Planetesimals", ApJ 183, 1051
 * - Youdin, A.N. & Goodman, J. (2005) "Streaming Instabilities in Protoplanetary Disks", ApJ 620, 459
 * - Ward, W.R. (1997) "Protoplanet Migration by Nebula Tides", Icarus 126, 261 (Type I / Type II)
 * - ALMA DSHARP Survey: Andrews, S.M., et al. (2018) ApJL 869, L41
 *
 * Epistemological Status:
 * Displays: [MODEL] - Core accretion paradigm coupled to hydrodynamic viscous disk profiles.
 */

export type PlanetFormationPhaseId =
  | "protoplanetary_disk"
  | "dust_settling"
  | "pebble_growth"
  | "planetesimals"
  | "embryo_growth"
  | "migration_resonance"
  | "giant_impacts"
  | "atmosphere_formation";

export interface PlanetFormationPhase {
  id: PlanetFormationPhaseId;
  order: number;
  name: string;
  astronomicalEpoch: string;
  timescaleYears: string;
  typicalParticleSize: string;
  governingPhysics: string;
  observationalEvidence: string;
  knownLimitations: string;
  description: string;
  statusBadge: "OBSERVATION" | "MODEL" | "ILLUSTRATION";
}

export const PLANET_FORMATION_PHASES: Record<PlanetFormationPhaseId, PlanetFormationPhase> = {
  protoplanetary_disk: {
    id: "protoplanetary_disk",
    order: 1,
    name: "1. Flared Protoplanetary Disk",
    astronomicalEpoch: "Class II YSO Phase",
    timescaleYears: "t ≈ 100,000 to 1,000,000 years",
    typicalParticleSize: "Sub-micron to micron (0.1 – 10 μm) interstellar dust grains",
    governingPhysics:
      "Hydrostatic equilibrium in vertical direction, Keplerian orbital rotation, Minimum Mass Solar Nebula (MMSN) surface density Sigma(r) ~ r^-1.5, temperature profile T(r) ~ r^-0.5.",
    observationalEvidence:
      "ALMA millimeter continuum images of HL Tauri and TW Hydrae; JWST MIRI mid-infrared detection of water vapor and organic molecules in inner disks.",
    knownLimitations:
      "Idealized power-law disk ignores localized magnetic dead zones, photoevaporation from external OB stars, and non-ideal MHD wind driving.",
    description:
      "A massive rotating circumstellar disk of 99% gas and 1% dust orbits the newborn star. The ice line (frost line) divides the warm rocky inner system from the cold volatile-rich outer realm.",
    statusBadge: "OBSERVATION",
  },
  dust_settling: {
    id: "dust_settling",
    order: 2,
    name: "2. Vertical Dust Settling to Midplane",
    astronomicalEpoch: "Disk Quiescence",
    timescaleYears: "t ≈ 10,000 to 50,000 years",
    typicalParticleSize: "Micron to millimeter (1 μm – 1 mm)",
    governingPhysics:
      "Epstein and Stokes gas drag balances vertical stellar gravity: settling timescale t_settle ~ (Omega_K * St)^-1, where Stokes number St = rho_s * s * Omega_K / (rho_g * v_th).",
    observationalEvidence:
      "Thin dust disks measured by ALMA (dust scale height H_dust / H_gas < 0.2) in Taurus and Ophiuchus star-forming regions.",
    knownLimitations:
      "Vertical turbulent stirring (characterized by alpha-viscosity parameter) counteracts settling, preventing complete midplane collapse without streaming instability.",
    description:
      "Small dust grains collide with gas molecules and lose vertical momentum, falling toward the central midplane to create an ultra-dense, paper-thin sheet of concentrated solids.",
    statusBadge: "MODEL",
  },
  pebble_growth: {
    id: "pebble_growth",
    order: 3,
    name: "3. Grain Coagulation & Pebble Growth",
    astronomicalEpoch: "Centimeter Pebble Production",
    timescaleYears: "t ≈ 50,000 to 100,000 years",
    typicalParticleSize: "Millimeters to centimeters (1 mm – 10 cm)",
    governingPhysics:
      "Van der Waals adhesion, electrostatics, and velocity-dependent sticking. Radial drift barrier: gas rotates at sub-Keplerian speed due to outward pressure gradient, inducing inward aerodynamic drag on pebbles.",
    observationalEvidence:
      "Spectral index beta of millimeter dust opacity (beta < 1.0) measured by VLA and ALMA, proving grain growth from sub-micron sizes to centimeter pebbles.",
    knownLimitations:
      "The 'Bouncing and Bouncing-Fragmentation Barrier': lab experiments show silicate grains shatter or bounce at relative collision velocities v > 1 m/s unless coated in sticky water ice.",
    description:
      "Microscopic dust grains stick together into porous aggregates and compact pebbles. As pebbles grow, they experience a strong headwind from sub-Keplerian gas and drift rapidly inward toward the star.",
    statusBadge: "MODEL",
  },
  planetesimals: {
    id: "planetesimals",
    order: 4,
    name: "4. Streaming Instability & Planetesimals",
    astronomicalEpoch: "Kilometer-Scale Asteroid Generation",
    timescaleYears: "t ≈ 100,000 to 300,000 years",
    typicalParticleSize: "Kilometers to tens of kilometers (1 – 100 km)",
    governingPhysics:
      "Streaming instability: collective back-reaction of pebbles on the gas concentrates solids into dense filaments where local density exceeds the Roche density, triggering direct gravitational collapse into 100-km planetesimals.",
    observationalEvidence:
      "Contact binary planetesimal Arrokoth (New Horizons flyby) and size distribution of pristine Kuiper Belt objects peaking at ~100 km without smaller collisional fragments.",
    knownLimitations:
      "Requires local metallicity enhancement (Z_local > 0.02) and low turbulent gas diffusion to trigger aerodynamic clumping.",
    description:
      "Pebbles draft behind one another like cyclists in a peloton, forming dense swarms that collapse under their own mutual gravity into solid asteroids and comets in a single leap.",
    statusBadge: "OBSERVATION",
  },
  embryo_growth: {
    id: "embryo_growth",
    order: 5,
    name: "5. Runaway & Oligarchic Embryo Growth",
    astronomicalEpoch: "Mars-Sized Protoplanet Assembly",
    timescaleYears: "t ≈ 500,000 to 2,000,000 years",
    typicalParticleSize: "Moon to Mars mass (1,000 – 6,000 km)",
    governingPhysics:
      "Gravitational focusing: cross section sigma = pi * R^2 * [1 + (v_esc / v_rel)^2]. When v_rel < v_esc, growth rate dM/dt ~ M^(4/3) (runaway growth), transitioning to oligarchic growth spaced by several mutual Hill radii.",
    observationalEvidence:
      "Meteoritic differentiation dates of Vesta (HED meteorites) showing core formation within 1-2 Myr of CAIs, consistent with rapid runaway accretion.",
    knownLimitations:
      "Pebble accretion efficiency depends strongly on disk turbulence, gas scale height, and planetesimal seed inclination.",
    description:
      "The largest bodies use their gravity like a tractor beam to suck up surrounding pebbles and planetesimals at accelerating speeds, growing into dozens of isolated planetary embryos.",
    statusBadge: "MODEL",
  },
  migration_resonance: {
    id: "migration_resonance",
    order: 6,
    name: "6. Planet Migration & Orbital Resonance",
    astronomicalEpoch: "Disk-Planet Interactions",
    timescaleYears: "t ≈ 1,000,000 to 5,000,000 years",
    typicalParticleSize: "Terrestrial cores & Gas Giant protoplanets",
    governingPhysics:
      "Type I migration: spiral density waves launched at Lindblad and corotation resonances exert negative net torque, driving inward migration. Type II migration: massive planets open deep annular gaps and migrate on viscous timescale. Resonant capture (e.g. 2:1, 3:2 MMR).",
    observationalEvidence:
      "Resonant chains in multi-planet exoplanet systems (e.g., TRAPPIST-1's 7-planet resonant chain, Kepler-223) and Hot Jupiters found parked near stellar surfaces.",
    knownLimitations:
      "Corotation torque saturation and magnetic disk winds can reverse migration, but 3D hydrodynamic models show high sensitivity to disk thermodynamics and opacity.",
    description:
      "Planets launch spiral density ripples in the gas disk. The gravitational tug of these ripples pushes planets inward, locking neighboring worlds into precise musical orbital resonances.",
    statusBadge: "OBSERVATION",
  },
  giant_impacts: {
    id: "giant_impacts",
    order: 7,
    name: "7. Giant Impacts & Late-Stage Accretion",
    astronomicalEpoch: "Clearing the Planetary Chamber",
    timescaleYears: "t ≈ 10 to 100 Million years",
    typicalParticleSize: "Terrestrial Planets (Earth, Venus, Mercury)",
    governingPhysics:
      "Gas disk disperses, removing aerodynamic damping. Gravitational perturbations excite orbital eccentricities, causing intersecting orbits and colossal catastrophic collisions between Mars-sized embryos.",
    observationalEvidence:
      "The Moon's giant impact origin (Theia collision), Mercury's stripped silicate mantle and huge iron core, Uranus's 98-degree axial tilt, and Martian crustal dichotomy.",
    knownLimitations:
      "N-body simulations of terrestrial assembly often over-produce massive planets at Mars's orbital distance unless constrained by Jupiter's migration (Grand Tack model).",
    description:
      "With the gas gone, stability ends. Dozens of planetary embryos crash into one another in catastrophic cataclysms that melt entire planetary surfaces, merge cores, and spawn moons.",
    statusBadge: "OBSERVATION",
  },
  atmosphere_formation: {
    id: "atmosphere_formation",
    order: 8,
    name: "8. Atmospheric Outgassing & Primordial Capture",
    astronomicalEpoch: "Planetary Maturity",
    timescaleYears: "t ≈ 50 to 500 Million years",
    typicalParticleSize: "Final Planetary System Architectures",
    governingPhysics:
      "Core Accretion: runaway capture of H/He envelope once core reaches critical mass M_crit ≈ 10 M_Earth. Secondary atmospheres: mantle outgassing of volatile compounds (H2O, CO2, N2) and late cometary/asteroidal delivery.",
    observationalEvidence:
      "Exoplanet radius valley (Fulton gap) at 1.7 - 2.0 R_Earth separating rocky super-Earths from gas-enveloped sub-Neptunes; JWST transmission spectroscopy of WASP-39b (CO2, SO2).",
    knownLimitations:
      "Atmospheric photoevaporation driven by stellar extreme-ultraviolet (XUV) radiation and stellar wind stripping depend critically on stellar magnetic history.",
    description:
      "Massive cores capture deep gaseous oceans of hydrogen and helium to become gas giants, while terrestrial worlds vent volatile gases from their magma oceans to create breathable skies and liquid oceans.",
    statusBadge: "OBSERVATION",
  },
};

export interface NumericalProtoplanetaryDiskParams {
  stellarMassSolar: number; // Central star mass (0.2 - 2.0 M_sun)
  diskMassSolar: number; // Total disk mass (0.005 - 0.1 M_sun)
  diskRadiusAu: number; // Outer disk radius (50 - 300 AU)
  stellarLuminositySolar: number; // Star luminosity (0.1 - 10 L_sun)
  viscosityAlpha: number; // Shakura-Sunyaev alpha (1e-4 - 1e-2)
}

/**
 * Calculates physical protoplanetary disk structure and snow line
 */
export function calculateDiskStructure(params: NumericalProtoplanetaryDiskParams) {
  // Snow line calculation: Radius where midplane temperature drops to T_ice ≈ 170 K
  // T(r) = (L_* / (16 * pi * sigma_SB * r^2))^0.25 * (H/r)^0.5
  // Empirically: r_snow ≈ 2.7 * (L_* / L_sun)^0.5 AU
  const snowLineRadiusAu = 2.7 * Math.sqrt(Math.max(0.01, params.stellarLuminositySolar));

  // Temperature at 1 AU
  const temp1AuK = 280 * Math.pow(params.stellarLuminositySolar, 0.25);

  // Surface density at 1 AU: Sigma_0 ≈ 1700 g/cm^2 for MMSN
  const surfaceDensity1Au = (params.diskMassSolar / 0.01) * 1700;

  // Gas scale height at 1 AU: H/r = c_s / v_K
  const aspectFractionHOverR1Au = 0.033 * Math.pow(params.stellarLuminositySolar, 0.125);

  // Minimum core mass for runaway gas accretion (Perri & Cameron 1974)
  const criticalCoreMassEarth = 10.0;

  // Type I migration timescale at 5 AU for 1 Earth mass: t_I ~ 10^5 - 10^6 years
  const typeIMigrationTimeYears =
    (1e5 * Math.pow(params.stellarMassSolar, 1.5)) / (params.diskMassSolar / 0.01);

  return {
    snowLineRadiusAu,
    temp1AuK,
    surfaceDensity1Au,
    aspectFractionHOverR1Au,
    criticalCoreMassEarth,
    typeIMigrationTimeYears,
  };
}

/**
 * Calculates physical Hill radius and orbital period for an embryonic planet
 */
export function calculateOrbitalPhysics(
  semiMajorAxisAu: number,
  planetMassEarth: number,
  starMassSolar: number,
) {
  const G = 6.6743e-11;
  const M_sun = 1.989e30;
  const M_earth = 5.972e24;
  const AU_m = 1.496e11;

  const a_m = semiMajorAxisAu * AU_m;
  const M_star_kg = starMassSolar * M_sun;
  const M_planet_kg = planetMassEarth * M_earth;

  // Kepler's Third Law: Period P = 2*pi * sqrt(a^3 / (G*M))
  const orbitalPeriodYears = Math.sqrt(Math.pow(semiMajorAxisAu, 3) / starMassSolar);

  // Orbital speed v_K = sqrt(G*M / a)
  const orbitalSpeedKmS = Math.sqrt((G * M_star_kg) / a_m) / 1000;

  // Hill Sphere radius: r_H = a * (M_p / (3 * M_*))^(1/3)
  const hillRadiusAu = semiMajorAxisAu * Math.pow(M_planet_kg / (3 * M_star_kg), 1 / 3);
  const hillRadiusKm = hillRadiusAu * 1.496e8;

  // Escape velocity from planet surface (approx Earth density)
  const planetRadiusKm = 6371 * Math.pow(planetMassEarth, 1 / 3);
  const escapeVelocityKmS = Math.sqrt((2 * G * M_planet_kg) / (planetRadiusKm * 1000)) / 1000;

  return {
    orbitalPeriodYears,
    orbitalSpeedKmS,
    hillRadiusAu,
    hillRadiusKm,
    planetRadiusKm,
    escapeVelocityKmS,
  };
}
