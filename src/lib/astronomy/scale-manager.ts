/**
 * Central ScaleManager & Continuous Navigation Architecture
 *
 * Responsibilities:
 *  1. Distinguishes uncompromised underlying physical coordinates from presentation magnification.
 *  2. Classifies active camera depth across 6 hierarchical scale regimes:
 *     - PlanetarySurface (< 0.0001 ly / < 6.3 AU)
 *     - SolarSystem (0.0001 - 0.1 ly / 6.3 - 6,324 AU)
 *     - NearbyStars (0.1 - 1,000 ly)
 *     - Galactic (1,000 - 200,000 ly)
 *     - Intergalactic (200,000 - 100,000,000 ly)
 *     - Cosmological (>= 100,000,000 ly)
 *  3. Supports dual modes:
 *     - "enhanced": Pedagogical display magnification preserving user visibility and visitability.
 *     - "true_scale": 1:1 scientific physical dimensions.
 *  4. Provides compatibility adapters for legacy constants without breaking existing rendering.
 */

import {
  AU_PER_LIGHT_YEAR,
  EARTH_RADIUS_MEAN_M,
  JUPITER_RADIUS_EQUATORIAL_M,
  LIGHT_YEARS_PER_AU,
  METERS_PER_AU,
  METERS_PER_LIGHT_YEAR,
  SOLAR_RADIUS_AU,
  SOLAR_RADIUS_M,
} from "./constants";
import { formatDistanceLy } from "./units";

export type ScaleRegime =
  | "PlanetarySurface"
  | "SolarSystem"
  | "NearbyStars"
  | "Galactic"
  | "Intergalactic"
  | "Cosmological";

export type ViewScaleMode = "enhanced" | "true_scale";

// --- Legacy Presentation Constants (for backward compatibility in Enhanced Mode) ---
export const LEGACY_AU_ENHANCED = 0.05;
export const LEGACY_PLANET_SCALE_ENHANCED = 0.005;
export const LEGACY_BODY_RADIUS_TO_AU = 1 / 180;
export const LEGACY_EXO_BODY_MAGNIFY = 2200;
export const LEGACY_EXO_STAR_MAGNIFY = 400;

export interface ScaleRegimeInfo {
  readonly id: ScaleRegime;
  readonly name: string;
  readonly subtitle: string;
  readonly minLy: number;
  readonly maxLy: number;
  readonly recommendedFov: number;
}

export const SCALE_REGIMES: Record<ScaleRegime, ScaleRegimeInfo> = {
  PlanetarySurface: {
    id: "PlanetarySurface",
    name: "Planetary Scale",
    subtitle: "Planetary surfaces, atmospheres & moon orbits",
    minLy: 0,
    maxLy: 0.0001,
    recommendedFov: 38,
  },
  SolarSystem: {
    id: "SolarSystem",
    name: "Solar System Scale",
    subtitle: "Heliocentric orbits, Kuiper belt & Oort cloud",
    minLy: 0.0001,
    maxLy: 0.1,
    recommendedFov: 42,
  },
  NearbyStars: {
    id: "NearbyStars",
    name: "Interstellar Scale",
    subtitle: "Solar neighborhood & local stellar cluster",
    minLy: 0.1,
    maxLy: 1_000,
    recommendedFov: 48,
  },
  Galactic: {
    id: "Galactic",
    name: "Galactic Scale",
    subtitle: "Milky Way spiral arms, bar, bulge & halo",
    minLy: 1_000,
    maxLy: 200_000,
    recommendedFov: 60,
  },
  Intergalactic: {
    id: "Intergalactic",
    name: "Intergalactic Scale",
    subtitle: "Local Group & Virgo Supercluster filaments",
    minLy: 200_000,
    maxLy: 100_000_000,
    recommendedFov: 70,
  },
  Cosmological: {
    id: "Cosmological",
    name: "Cosmological Scale",
    subtitle: "Cosmic web & observable universe horizon (46.5 Gly)",
    minLy: 100_000_000,
    maxLy: 100_000_000_000,
    recommendedFov: 80,
  },
};

/**
 * Verified physical mean parameters for Solar System bodies.
 * Distances in AU, radii in kilometers.
 */
export const SOLAR_SYSTEM_PHYSICAL_DATA: Record<
  string,
  {
    semiMajorAxisAU: number;
    radiusKm: number;
    periodDays: number;
    rotationHours: number;
    massKg: number;
  }
> = {
  Sun: {
    semiMajorAxisAU: 0,
    radiusKm: SOLAR_RADIUS_M / 1_000, // 695,700 km
    periodDays: 0,
    rotationHours: 609.12, // 25.38 days differential equator
    massKg: 1.98847e30,
  },
  Mercury: {
    semiMajorAxisAU: 0.387098,
    radiusKm: 2439.7,
    periodDays: 87.969,
    rotationHours: 1407.6,
    massKg: 3.3011e23,
  },
  Venus: {
    semiMajorAxisAU: 0.723332,
    radiusKm: 6051.8,
    periodDays: 224.701,
    rotationHours: -5832.5,
    massKg: 4.8675e24,
  },
  Earth: {
    semiMajorAxisAU: 1.00000261,
    radiusKm: EARTH_RADIUS_MEAN_M / 1_000, // 6,371 km
    periodDays: 365.256,
    rotationHours: 23.934,
    massKg: 5.9722e24,
  },
  Mars: {
    semiMajorAxisAU: 1.523679,
    radiusKm: 3389.5,
    periodDays: 686.98,
    rotationHours: 24.623,
    massKg: 6.4171e23,
  },
  Jupiter: {
    semiMajorAxisAU: 5.204267,
    radiusKm: JUPITER_RADIUS_EQUATORIAL_M / 1_000, // 71,492 km
    periodDays: 4332.59,
    rotationHours: 9.925,
    massKg: 1.89813e27,
  },
  Saturn: {
    semiMajorAxisAU: 9.5826,
    radiusKm: 58232,
    periodDays: 10759.22,
    rotationHours: 10.656,
    massKg: 5.6834e26,
  },
  Uranus: {
    semiMajorAxisAU: 19.2294,
    radiusKm: 25362,
    periodDays: 30685.4,
    rotationHours: -17.24,
    massKg: 8.681e25,
  },
  Neptune: {
    semiMajorAxisAU: 30.0699,
    radiusKm: 24622,
    periodDays: 60189.0,
    rotationHours: 16.11,
    massKg: 1.02413e26,
  },
  Pluto: {
    semiMajorAxisAU: 39.482,
    radiusKm: 1188.3,
    periodDays: 90560.0,
    rotationHours: -153.29,
    massKg: 1.303e22,
  },
};

/**
 * ScaleManager singleton providing unified scale regime detection,
 * coordinate transformations, and presentation magnification.
 */
class ScaleManagerClass {
  private currentMode: ViewScaleMode = "enhanced";

  public setMode(mode: ViewScaleMode) {
    this.currentMode = mode;
  }

  public getMode(): ViewScaleMode {
    return this.currentMode;
  }

  /**
   * Identifies the current spatial scale regime based on camera distance from origin (or target).
   * @param cameraDistanceLy Camera distance in light-years
   */
  public getScaleRegime(cameraDistanceLy: number): ScaleRegime {
    const d = Math.abs(cameraDistanceLy);
    if (d < 0.0001) return "PlanetarySurface";
    if (d < 0.1) return "SolarSystem";
    if (d < 1_000) return "NearbyStars";
    if (d < 200_000) return "Galactic";
    if (d < 100_000_000) return "Intergalactic";
    return "Cosmological";
  }

  public getRegimeInfo(regime: ScaleRegime): ScaleRegimeInfo {
    return SCALE_REGIMES[regime];
  }

  /**
   * Returns the scene multiplier for 1 Astronomical Unit.
   * - In "enhanced" mode: returns 0.05 (for visual balance across the Solar System).
   * - In "true_scale" mode: returns exact LIGHT_YEARS_PER_AU (≈ 1.58128e-5 ly).
   */
  public getRenderAU(mode: ViewScaleMode = this.currentMode): number {
    return mode === "enhanced" ? LEGACY_AU_ENHANCED : LIGHT_YEARS_PER_AU;
  }

  /**
   * Returns the planet radius presentation multiplier.
   * - In "enhanced" mode: returns 0.005.
   * - In "true_scale" mode: returns true physical conversion factor (km -> ly).
   */
  public getRenderPlanetScale(mode: ViewScaleMode = this.currentMode): number {
    return mode === "enhanced" ? LEGACY_PLANET_SCALE_ENHANCED : 1_000 / METERS_PER_LIGHT_YEAR;
  }

  /**
   * Calculates the render radius of a body given its physical radius in kilometers.
   */
  public getRenderRadiusFromKm(radiusKm: number, mode: ViewScaleMode = this.currentMode): number {
    if (mode === "enhanced") {
      // In enhanced mode, map Earth (6371 km) to 0.055 * P = 0.000275 ly
      const earthRadiusKm = 6371;
      const relativeToEarth = radiusKm / earthRadiusKm;
      return relativeToEarth * 0.055 * LEGACY_PLANET_SCALE_ENHANCED;
    }
    // In true scale mode, 1:1 physical conversion to light-years
    return (radiusKm * 1_000) / METERS_PER_LIGHT_YEAR;
  }

  /**
   * Calculates the render orbital semi-major axis given physical AU.
   */
  public getRenderOrbitFromAU(
    semiMajorAxisAU: number,
    mode: ViewScaleMode = this.currentMode,
  ): number {
    return semiMajorAxisAU * this.getRenderAU(mode);
  }

  /**
   * Magnification factors for extragalactic star systems.
   */
  public getExoBodyMagnify(mode: ViewScaleMode = this.currentMode): number {
    return mode === "enhanced" ? LEGACY_EXO_BODY_MAGNIFY : 1.0;
  }

  public getExoStarMagnify(mode: ViewScaleMode = this.currentMode): number {
    return mode === "enhanced" ? LEGACY_EXO_STAR_MAGNIFY : 1.0;
  }

  public getExoBodyScale(mode: ViewScaleMode = this.currentMode): number {
    return mode === "enhanced"
      ? LEGACY_BODY_RADIUS_TO_AU * LEGACY_EXO_BODY_MAGNIFY
      : LIGHT_YEARS_PER_AU;
  }

  /**
   * Formats comprehensive telemetry indicator for the UI HUD.
   */
  public formatIndicator(
    cameraDistanceLy: number,
    mode: ViewScaleMode = this.currentMode,
  ): {
    distanceLabel: string;
    regimeName: string;
    regimeSubtitle: string;
    modeLabel: string;
    modeDescription: string;
  } {
    const regime = this.getScaleRegime(cameraDistanceLy);
    const info = this.getRegimeInfo(regime);

    let distanceLabel = formatDistanceLy(cameraDistanceLy);
    if (regime === "PlanetarySurface" || regime === "SolarSystem") {
      const au = cameraDistanceLy * AU_PER_LIGHT_YEAR;
      if (au < 0.1) {
        const km = (cameraDistanceLy * METERS_PER_LIGHT_YEAR) / 1_000;
        distanceLabel = `${(km / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k km (${au.toFixed(3)} AU)`;
      } else {
        distanceLabel = `${au.toFixed(2)} AU (${(au * 149.6).toFixed(1)}M km)`;
      }
    }

    return {
      distanceLabel,
      regimeName: info.name,
      regimeSubtitle: info.subtitle,
      modeLabel: mode === "enhanced" ? "Enhanced Visibility Mode" : "True Scientific Scale (1:1)",
      modeDescription:
        mode === "enhanced"
          ? "Planetary orbits and radii are proportionally enlarged for clear spatial inspection."
          : "Uncompromised 1:1 physical dimensions (bodies appear as true astronomical points).",
    };
  }
}

export const scaleManager = new ScaleManagerClass();
