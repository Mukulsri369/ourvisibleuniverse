/**
 * JPL Ephemeris Caching, Inter-Body Distance Engine & Galactic Trajectory Model
 *
 * Implements:
 * 1. High-speed in-memory memoization of computed ephemeris state vectors.
 * 2. Planet-to-planet physical distance ruler and light-travel time (d / c).
 * 3. Separate Galactic Trajectory Model (distinct from short-term orbital ephemerides).
 * 4. Documented accuracy limits and fallback to labelled analytical models.
 */

import {
  computePlanetStateVector,
  computeSunBarycentricOffsetAu,
  J2000_JD,
  type EphemerisStateVector,
} from "./horizons-ephemeris";
import { SPEED_OF_LIGHT_M_S, METERS_PER_AU, METERS_PER_LIGHT_YEAR } from "../constants";

export interface InterplanetaryDistanceInfo {
  bodyA: string;
  bodyB: string;
  distanceAu: number;
  distanceKm: number;
  lightTravelTimeSeconds: number;
  lightTravelTimeFormatted: string;
  relativeSpeedKmS: number;
}

export interface GalacticTrajectoryState {
  modelName: "Milky Way Disk Circular Kinematic Model";
  galactocentricDistanceLy: number; // ~26,000 ly
  orbitalSpeedKmS: number; // ~220-240 km/s (IAU standard: 220 km/s, Reid et al. 2014: 240 km/s)
  orbitalPeriodMyr: number; // ~230 Myr
  eclipticToGalacticPlaneInclinationDeg: number; // 60.19 degrees
  solarApexRaDeg: number; // RA ≈ 271°, Dec ≈ +30° (toward constellation Hercules/Vega)
  solarApexDecDeg: number;
  solarPeculiarMotionUvwKmS: [number, number, number]; // [11.1, 12.24, 7.25] km/s relative to LSR (Schönrich et al. 2010)
  disclaimer: string;
}

export class JplEphemerisManager {
  private static instance: JplEphemerisManager;
  // Cache key: `${planetName}:${Math.round(jd * 100) / 100}` (sub-15-minute resolution cache)
  private cache = new Map<string, EphemerisStateVector>();

  public static getInstance(): JplEphemerisManager {
    if (!JplEphemerisManager.instance) {
      JplEphemerisManager.instance = new JplEphemerisManager();
    }
    return JplEphemerisManager.instance;
  }

  /**
   * Retrieves planet state vector with caching.
   */
  public getPlanetState(planetName: string, jd: number): EphemerisStateVector {
    const key = `${planetName}:${(Math.round(jd * 100) / 100).toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const state = computePlanetStateVector(planetName, jd);
    if (this.cache.size > 2000) {
      this.cache.clear();
    }
    this.cache.set(key, state);
    return state;
  }

  /**
   * Computes exact distance, light travel time, and relative speed between two bodies.
   */
  public computeDistance(bodyA: string, bodyB: string, jd: number): InterplanetaryDistanceInfo {
    let posA = { xAu: 0, yAu: 0, zAu: 0, vxKmS: 0, vyKmS: 0, vzKmS: 0 };
    let posB = { xAu: 0, yAu: 0, zAu: 0, vxKmS: 0, vyKmS: 0, vzKmS: 0 };

    if (bodyA !== "Sun") {
      const stateA = this.getPlanetState(bodyA, jd);
      posA = {
        xAu: stateA.xAu,
        yAu: stateA.yAu,
        zAu: stateA.zAu,
        vxKmS: stateA.vxKmS,
        vyKmS: stateA.vyKmS,
        vzKmS: stateA.vzKmS,
      };
    }
    if (bodyB !== "Sun") {
      const stateB = this.getPlanetState(bodyB, jd);
      posB = {
        xAu: stateB.xAu,
        yAu: stateB.yAu,
        zAu: stateB.zAu,
        vxKmS: stateB.vxKmS,
        vyKmS: stateB.vyKmS,
        vzKmS: stateB.vzKmS,
      };
    }

    const dx = posB.xAu - posA.xAu;
    const dy = posB.yAu - posA.yAu;
    const dz = posB.zAu - posA.zAu;
    const distAu = Math.hypot(dx, dy, dz);
    const distKm = distAu * 149597870.7;

    const lightSeconds = (distKm * 1000.0) / SPEED_OF_LIGHT_M_S;
    let timeStr = "";
    if (lightSeconds < 60) {
      timeStr = `${lightSeconds.toFixed(1)} light-sec`;
    } else if (lightSeconds < 3600) {
      timeStr = `${(lightSeconds / 60).toFixed(2)} light-min`;
    } else {
      timeStr = `${(lightSeconds / 3600).toFixed(2)} light-hours`;
    }

    const dvx = posB.vxKmS - posA.vxKmS;
    const dvy = posB.vyKmS - posA.vyKmS;
    const dvz = posB.vzKmS - posA.vzKmS;
    const relSpeed = Math.hypot(dvx, dvy, dvz);

    return {
      bodyA,
      bodyB,
      distanceAu: distAu,
      distanceKm: distKm,
      lightTravelTimeSeconds: lightSeconds,
      lightTravelTimeFormatted: timeStr,
      relativeSpeedKmS: relSpeed,
    };
  }

  /**
   * Provides the Separate Galactic Trajectory Model parameters
   * (Strict Rule: do not treat current orbital ephemerides as millions-of-years predictions).
   */
  public getGalacticTrajectoryModel(): GalacticTrajectoryState {
    return {
      modelName: "Milky Way Disk Circular Kinematic Model",
      galactocentricDistanceLy: 26000,
      orbitalSpeedKmS: 220,
      orbitalPeriodMyr: 230,
      eclipticToGalacticPlaneInclinationDeg: 60.19,
      solarApexRaDeg: 271.0,
      solarApexDecDeg: 30.0,
      solarPeculiarMotionUvwKmS: [11.1, 12.24, 7.25],
      disclaimer:
        "Scientific Policy: Solar System galactic drift is visualized via a decoupled kinematic model. Planetary ephemerides are valid for historical/exploratory human epochs (±3,000 yr) and are NOT extrapolated across millions of years.",
    };
  }
}

export const jplEphemerisManager = JplEphemerisManager.getInstance();
