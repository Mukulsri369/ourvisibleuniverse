/**
 * Central Astronomical Units & Quantity Handling Package
 * Reference: IAU 2012 Resolution B2, CODATA 2018, Astropy Units Framework
 *
 * Provides exact conversions, typed quantities, and human-readable formatters
 * across SI and astrophysical distance and mass scales.
 */

import {
  AU_PER_LIGHT_YEAR,
  EARTH_MASS_KG,
  EARTH_RADIUS_MEAN_M,
  JUPITER_MASS_KG,
  JUPITER_RADIUS_EQUATORIAL_M,
  LIGHT_YEARS_PER_AU,
  LIGHT_YEARS_PER_PARSEC,
  METERS_PER_AU,
  METERS_PER_LIGHT_YEAR,
  METERS_PER_PARSEC,
  PARSECS_PER_LIGHT_YEAR,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
} from "./constants";

export type DistanceUnit =
  | "meter"
  | "kilometer"
  | "astronomical_unit"
  | "solar_radius"
  | "earth_radius"
  | "light_year"
  | "parsec"
  | "kiloparsec"
  | "megaparsec"
  | "gigaparsec";

export type MassUnit = "kilogram" | "earth_mass" | "jupiter_mass" | "solar_mass";

/**
 * Strongly-typed astronomical quantity carrying value (in double precision) and unit.
 */
export interface DistanceQuantity {
  readonly value: number;
  readonly unit: DistanceUnit;
  toMeters(): number;
  toKilometers(): number;
  toAU(): number;
  toLightYears(): number;
  toParsecs(): number;
  toMegaparsecs(): number;
  format(decimals?: number): string;
}

/**
 * Conversion factors to base SI meters.
 */
const METERS_PER_UNIT: Record<DistanceUnit, number> = {
  meter: 1,
  kilometer: 1_000,
  astronomical_unit: METERS_PER_AU,
  solar_radius: SOLAR_RADIUS_M,
  earth_radius: EARTH_RADIUS_MEAN_M,
  light_year: METERS_PER_LIGHT_YEAR,
  parsec: METERS_PER_PARSEC,
  kiloparsec: METERS_PER_PARSEC * 1_000,
  megaparsec: METERS_PER_PARSEC * 1_000_000,
  gigaparsec: METERS_PER_PARSEC * 1_000_000_000,
};

/**
 * Creates a DistanceQuantity object supporting exact conversions and formatting.
 */
export function distance(value: number, unit: DistanceUnit): DistanceQuantity {
  const meters = value * METERS_PER_UNIT[unit];

  return {
    value,
    unit,
    toMeters: () => meters,
    toKilometers: () => meters / 1_000,
    toAU: () => meters / METERS_PER_AU,
    toLightYears: () => meters / METERS_PER_LIGHT_YEAR,
    toParsecs: () => meters / METERS_PER_PARSEC,
    toMegaparsecs: () => meters / (METERS_PER_PARSEC * 1_000_000),
    format: (decimals = 2) => formatDistanceMeters(meters, decimals),
  };
}

/**
 * Direct conversions between common units.
 */
export const Units = {
  // Distance
  metersToKm: (m: number): number => m / 1_000,
  kmToMeters: (km: number): number => km * 1_000,
  kmToAU: (km: number): number => (km * 1_000) / METERS_PER_AU,
  auToKm: (au: number): number => (au * METERS_PER_AU) / 1_000,
  auToMeters: (au: number): number => au * METERS_PER_AU,
  auToLightYears: (au: number): number => au * LIGHT_YEARS_PER_AU,
  lightYearsToAU: (ly: number): number => ly * AU_PER_LIGHT_YEAR,
  lightYearsToParsecs: (ly: number): number => ly * PARSECS_PER_LIGHT_YEAR,
  parsecsToLightYears: (pc: number): number => pc * LIGHT_YEARS_PER_PARSEC,
  lightYearsToKm: (ly: number): number => (ly * METERS_PER_LIGHT_YEAR) / 1_000,
  kmToLightYears: (km: number): number => (km * 1_000) / METERS_PER_LIGHT_YEAR,
  solarRadiiToKm: (rSun: number): number => (rSun * SOLAR_RADIUS_M) / 1_000,
  kmToSolarRadii: (km: number): number => (km * 1_000) / SOLAR_RADIUS_M,
  earthRadiiToKm: (rEarth: number): number => (rEarth * EARTH_RADIUS_MEAN_M) / 1_000,
  kmToEarthRadii: (km: number): number => (km * 1_000) / EARTH_RADIUS_MEAN_M,

  // Mass
  kgToSolarMasses: (kg: number): number => kg / SOLAR_MASS_KG,
  solarMassesToKg: (mSun: number): number => mSun * SOLAR_MASS_KG,
  kgToEarthMasses: (kg: number): number => kg / EARTH_MASS_KG,
  earthMassesToKg: (mEarth: number): number => mEarth * EARTH_MASS_KG,
  solarMassesToEarthMasses: (mSun: number): number => (mSun * SOLAR_MASS_KG) / EARTH_MASS_KG,
  earthMassesToSolarMasses: (mEarth: number): number => (mEarth * EARTH_MASS_KG) / SOLAR_MASS_KG,
  jupiterMassesToEarthMasses: (mJup: number): number => (mJup * JUPITER_MASS_KG) / EARTH_MASS_KG,
};

/**
 * Context-aware distance formatter that selects the most astronomically
 * natural unit based on scale depth (from meters to Gigalight-years).
 */
export function formatDistanceMeters(meters: number, decimals = 2): string {
  const absM = Math.abs(meters);

  if (absM < 1_000) {
    return `${meters.toFixed(decimals)} m`;
  }
  if (absM < 100_000_000) {
    // Under 100,000 km (Earth-Moon neighborhood)
    const km = meters / 1_000;
    return `${km.toLocaleString(undefined, { maximumFractionDigits: decimals })} km`;
  }
  if (absM < 0.1 * METERS_PER_LIGHT_YEAR) {
    // Under 0.1 ly (~6,324 AU, Solar System and Kuiper Belt)
    const au = meters / METERS_PER_AU;
    if (au < 0.1) {
      const km = meters / 1_000;
      return `${(km / 1_000_000).toFixed(decimals)} million km (${au.toFixed(decimals + 1)} AU)`;
    }
    return `${au.toFixed(decimals)} AU`;
  }
  if (absM < 10_000 * METERS_PER_LIGHT_YEAR) {
    // Nearby stars and solar neighborhood (<10,000 ly)
    const ly = meters / METERS_PER_LIGHT_YEAR;
    const pc = meters / METERS_PER_PARSEC;
    return `${ly.toFixed(decimals)} ly (${pc.toFixed(decimals)} pc)`;
  }
  if (absM < 10_000_000 * METERS_PER_LIGHT_YEAR) {
    // Milky Way & Local Group (<10 Mly)
    const kly = meters / (METERS_PER_LIGHT_YEAR * 1_000);
    const kpc = meters / (METERS_PER_PARSEC * 1_000);
    return `${kly.toFixed(decimals)} kly (${kpc.toFixed(decimals)} kpc)`;
  }
  if (absM < 1_000_000_000 * METERS_PER_LIGHT_YEAR) {
    // Virgo Supercluster & deep galaxies (<1 Gly)
    const mly = meters / (METERS_PER_LIGHT_YEAR * 1_000_000);
    const mpc = meters / (METERS_PER_PARSEC * 1_000_000);
    return `${mly.toFixed(decimals)} Mly (${mpc.toFixed(decimals)} Mpc)`;
  }
  // Cosmological horizon (Gigalight-years)
  const gly = meters / (METERS_PER_LIGHT_YEAR * 1_000_000_000);
  const gpc = meters / (METERS_PER_PARSEC * 1_000_000_000);
  return `${gly.toFixed(decimals)} Gly (${gpc.toFixed(decimals)} Gpc)`;
}

/**
 * Context-aware distance formatter accepting light-years directly.
 */
export function formatDistanceLy(lightYears: number, decimals = 2): string {
  return formatDistanceMeters(lightYears * METERS_PER_LIGHT_YEAR, decimals);
}
