/**
 * Gaia DR3 Stellar Kinematics & Proper Motion Engine
 *
 * Computes 3D space velocities (U, V, W) and propagates stellar coordinates
 * across cosmic time offsets (e.g. +/- 10,000 to +/- 100,000 years)
 * from Gaia DR3 astrometric solutions (pmra, pmdec, radial_velocity).
 *
 * References:
 * - Johnson & Soderblom (1987), AJ 93, 864: Galactic space velocity vectors
 * - Gaia Data Release 3 Astrometry (Lindegren et al. 2021)
 */

import { coordinates } from "../coordinates";

export interface StellarKinematics {
  pmraMasYr: number; // pmra * cos(dec) in mas/yr
  pmdecMasYr: number; // pmdec in mas/yr
  radialVelocityKmS: number; // v_rad in km/s (positive receding)
}

export interface ProperMotionVector3D {
  // Velocity in scene light-years per 1,000 Earth years
  vxLyPerKyr: number;
  vyLyPerKyr: number;
  vzLyPerKyr: number;
  // Total 3D space speed in km/s
  totalSpeedKmS: number;
}

// Conversion constant: km/s to light-years per 1,000 Julian years
// 1 km/s * (1000 * 31,557,600 s) / 9.460730472e12 km = 0.00333564 ly / kyr
const KM_S_TO_LY_PER_KYR = (1000 * 31557600) / 9460730472580.8;

/**
 * Computes the 3D velocity vector in the scene's Galactic Cartesian frame (ly/kyr)
 */
export function calculateStellarVelocity3D(
  raDeg: number,
  decDeg: number,
  distanceLy: number,
  kinematics: Partial<StellarKinematics>,
): ProperMotionVector3D {
  const pmra = kinematics.pmraMasYr ?? 0;
  const pmdec = kinematics.pmdecMasYr ?? 0;
  const vRad = kinematics.radialVelocityKmS ?? 0;

  // Convert distance in ly to parsecs
  const distancePc = distanceLy / 3.261563777;

  // Tangential velocities in km/s: v_t = 4.74047 * (mu / mas_yr) * (d / pc)
  const vAlpha = 4.74047 * (pmra / 1000) * distancePc;
  const vDelta = 4.74047 * (pmdec / 1000) * distancePc;

  const totalSpeedKmS = Math.sqrt(vAlpha * vAlpha + vDelta * vDelta + vRad * vRad);

  // Unit vectors in spherical ICRS
  const alphaRad = (raDeg * Math.PI) / 180;
  const deltaRad = (decDeg * Math.PI) / 180;

  const cosA = Math.cos(alphaRad);
  const sinA = Math.sin(alphaRad);
  const cosD = Math.cos(deltaRad);
  const sinD = Math.sin(deltaRad);

  // Radial unit vector e_r
  const erX = cosD * cosA;
  const erY = cosD * sinA;
  const erZ = sinD;

  // RA unit vector e_alpha
  const eaX = -sinA;
  const eaY = cosA;
  const eaZ = 0;

  // Dec unit vector e_delta
  const edX = -sinD * cosA;
  const edY = -sinD * sinA;
  const edZ = cosD;

  // ICRS Cartesian velocity vector (km/s)
  const vIcrsX = vRad * erX + vAlpha * eaX + vDelta * edX;
  const vIcrsY = vRad * erY + vAlpha * eaY + vDelta * edY;
  const vIcrsZ = vRad * erZ + vAlpha * eaZ + vDelta * edZ;

  // Transform velocity vector from ICRS to Galactic Frame
  // Using the rotation matrix between ICRS and Galactic Frame (Hipparcos/IAU 1958)
  const vGalacticX = -0.054875560416 * vIcrsX - 0.873437090235 * vIcrsY - 0.483835015549 * vIcrsZ;
  const vGalacticY = 0.494109427876 * vIcrsX - 0.44482962996 * vIcrsY + 0.746982244497 * vIcrsZ;
  const vGalacticZ = -0.867666149019 * vIcrsX - 0.198076373431 * vIcrsY + 0.455983776175 * vIcrsZ;

  // In the application's scene convention:
  // Galactic plane = XZ, Galactic Center = -X (flipped x), Galactic Pole = +Y
  // Scene coordinates: sceneX = -galacticX, sceneY = galacticZ, sceneZ = galacticY
  return {
    vxLyPerKyr: -vGalacticX * KM_S_TO_LY_PER_KYR,
    vyLyPerKyr: vGalacticZ * KM_S_TO_LY_PER_KYR,
    vzLyPerKyr: vGalacticY * KM_S_TO_LY_PER_KYR,
    totalSpeedKmS,
  };
}

/**
 * Propagates star position forward or backward in time by deltaYears.
 */
export function propagateStarPosition(
  currentPos: { x: number; y: number; z: number },
  velocity: ProperMotionVector3D,
  deltaYears: number,
): { x: number; y: number; z: number } {
  const kyr = deltaYears / 1000;
  return {
    x: currentPos.x + velocity.vxLyPerKyr * kyr,
    y: currentPos.y + velocity.vyLyPerKyr * kyr,
    z: currentPos.z + velocity.vzLyPerKyr * kyr,
  };
}
