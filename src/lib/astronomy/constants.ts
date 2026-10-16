/**
 * Precision Physical & Astronomical Constants
 * Sourced from:
 *  - IAU (International Astronomical Union) 2012 Resolution B2
 *  - CODATA 2018 Recommended Values of the Fundamental Physical Constants
 *  - NASA / JPL Astronomical Constants (DE440)
 */

// --- Fundamental Physical Constants (SI) ------------------------------------
/** Speed of light in vacuum (m/s, exact by definition) */
export const SPEED_OF_LIGHT_M_S = 299_792_458;

/** Newtonian constant of gravitation (m^3 kg^-1 s^-2, CODATA 2018) */
export const GRAVITATIONAL_CONSTANT_SI = 6.6743e-11;

/** Planck constant (J s, exact by definition) */
export const PLANCK_CONSTANT_SI = 6.62607015e-34;

/** Boltzmann constant (J/K, exact by definition) */
export const BOLTZMANN_CONSTANT_SI = 1.380649e-23;

/** Stefan-Boltzmann constant (W m^-2 K^-4, exact from CODATA) */
export const STEFAN_BOLTZMANN_SI = 5.670374419e-8;

// --- Celestial Distance Units (Exact Definitions) ---------------------------
/**
 * Astronomical Unit in meters (IAU 2012 Resolution B2, exact by definition):
 * Exactly 149,597,870,700 meters.
 */
export const METERS_PER_AU = 149_597_870_700;

/** Seconds in a Julian year (365.25 days of 86,400 SI seconds) */
export const SECONDS_PER_JULIAN_YEAR = 365.25 * 86_400; // 31,557,600 s

/**
 * Light-year in meters (distance light travels in vacuum in one Julian year):
 * Exactly 9,460,730,472,580,800 meters.
 */
export const METERS_PER_LIGHT_YEAR = SPEED_OF_LIGHT_M_S * SECONDS_PER_JULIAN_YEAR;

/**
 * Parsec in meters (IAU definition: 1 AU / tan(1 arcsec)):
 * Exactly 149,597,870,700 * (648,000 / pi) ≈ 3.085677581e16 meters.
 */
export const METERS_PER_PARSEC = (METERS_PER_AU * 648_000) / Math.PI;

/** Exact ratio: Astronomical Units per Light-Year */
export const AU_PER_LIGHT_YEAR = METERS_PER_LIGHT_YEAR / METERS_PER_AU; // ≈ 63,241.077084

/** Exact ratio: Light-Years per Astronomical Unit */
export const LIGHT_YEARS_PER_AU = 1 / AU_PER_LIGHT_YEAR; // ≈ 1.581284565e-5

/** Ratio: Parsecs per Light-Year */
export const PARSECS_PER_LIGHT_YEAR = METERS_PER_LIGHT_YEAR / METERS_PER_PARSEC; // ≈ 0.306601

/** Ratio: Light-Years per Parsec */
export const LIGHT_YEARS_PER_PARSEC = 1 / PARSECS_PER_LIGHT_YEAR; // ≈ 3.2615638

// --- Solar & Terrestrial Nominal Standards (IAU 2015 Resolution B3) --------
/** Nominal Solar Mass (kg) */
export const SOLAR_MASS_KG = 1.98847e30;

/** Nominal Solar Radius (m) */
export const SOLAR_RADIUS_M = 695_700_000;

/** Solar radius in AU */
export const SOLAR_RADIUS_AU = SOLAR_RADIUS_M / METERS_PER_AU; // ≈ 0.004650467

/** Nominal Solar Luminosity (Watts) */
export const SOLAR_LUMINOSITY_W = 3.828e26;

/** Nominal Solar Effective Surface Temperature (Kelvin) */
export const SOLAR_EFFECTIVE_TEMPERATURE_K = 5772;

/** Nominal Earth Equatorial Radius (m) */
export const EARTH_RADIUS_EQUATORIAL_M = 6_378_136.6;

/** Earth Mean Radius (m) */
export const EARTH_RADIUS_MEAN_M = 6_371_008.8;

/** Nominal Earth Mass (kg) */
export const EARTH_MASS_KG = 5.9722e24;

/** Earth Radius in AU */
export const EARTH_RADIUS_AU = EARTH_RADIUS_MEAN_M / METERS_PER_AU; // ≈ 4.25875e-5

/** Nominal Jupiter Equatorial Radius (m) */
export const JUPITER_RADIUS_EQUATORIAL_M = 71_492_000;

/** Nominal Jupiter Mass (kg) */
export const JUPITER_MASS_KG = 1.89813e27;

// --- Astrometric Epochs -----------------------------------------------------
/** Standard J2000.0 Epoch Milliseconds (2000-01-01 12:00:00 UTC) */
export const J2000_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

/** Julian Day of J2000.0 */
export const J2000_JD = 2451545.0;

// --- Galactic Center & Milky Way Benchmarks (Gravity Collaboration / IAU) ---
/** Sun-to-Galactic Center Distance (Sgr A*) in parsecs (Gravity Collaboration 2021) */
export const GALACTIC_CENTER_DISTANCE_PC = 8277; // ± 33 pc

/** Sun-to-Galactic Center Distance in light-years */
export const GALACTIC_CENTER_DISTANCE_LY = GALACTIC_CENTER_DISTANCE_PC * LIGHT_YEARS_PER_PARSEC; // ≈ 26,996 ly

/** Standard IAU reference distance to Sgr A* (historical round benchmark) */
export const GALACTIC_CENTER_REFERENCE_LY = 26_000;

/** Solar circular orbital velocity around Galactic Center (km/s) */
export const SOLAR_GALACTIC_ORBIT_VELOCITY_KM_S = 233.0; // km/s

/** Solar orbital period around Galactic Center (Myr) */
export const SOLAR_GALACTIC_PERIOD_MYR = 230.0;
