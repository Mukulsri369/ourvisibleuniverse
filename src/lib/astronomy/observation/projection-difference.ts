/**
 * Celestial Projection vs 3D Physical Distance Analyzer
 *
 * Implements rigorous spherical trigonometry to demonstrate how objects with
 * minimal angular separation on the 2D celestial sphere (optical alignment / asterisms)
 * can be separated by enormous physical depths along the line of sight.
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export interface ProjectedPairAnalysis {
  readonly objectA: { name: string; raDeg: number; decDeg: number; distanceLy: number };
  readonly objectB: { name: string; raDeg: number; decDeg: number; distanceLy: number };
  readonly angularSeparationDeg: number;
  readonly angularSeparationArcmin: number;
  readonly angularSeparationArcsec: number;
  readonly projectedTransverseSeparationLy: number;
  readonly radialDepthSeparationLy: number;
  readonly true3DEuclideanDistanceLy: number;
  readonly depthToTransverseRatio: number;
  readonly isChanceAlignment: boolean;
  readonly scientificExplanation: string;
}

/**
 * Computes angular separation between two (RA, Dec) coordinates in degrees
 * using the numerically stable Vincenty / Haversine formula on the unit sphere.
 */
export function calculateAngularSeparationDeg(
  ra1Deg: number,
  dec1Deg: number,
  ra2Deg: number,
  dec2Deg: number,
): number {
  const phi1 = dec1Deg * DEG_TO_RAD;
  const phi2 = dec2Deg * DEG_TO_RAD;
  const deltaPhi = (dec2Deg - dec1Deg) * DEG_TO_RAD;
  const deltaLambda = (ra2Deg - ra1Deg) * DEG_TO_RAD;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(Math.max(0, Math.min(1, a))), Math.sqrt(Math.max(0, 1 - a)));
  return c * RAD_TO_DEG;
}

/**
 * Analyzes two celestial objects to determine their 2D projected proximity
 * versus their true 3D physical separation in light-years.
 */
export function analyzeProjectionDifference(
  objA: { name: string; raDeg: number; decDeg: number; distanceLy: number },
  objB: { name: string; raDeg: number; decDeg: number; distanceLy: number },
): ProjectedPairAnalysis {
  const thetaDeg = calculateAngularSeparationDeg(objA.raDeg, objA.decDeg, objB.raDeg, objB.decDeg);
  const thetaRad = thetaDeg * DEG_TO_RAD;

  const r1 = objA.distanceLy;
  const r2 = objB.distanceLy;

  // Law of Cosines in 3D Euclidean space: d^2 = r1^2 + r2^2 - 2*r1*r2*cos(theta)
  const true3DDistanceSq = r1 * r1 + r2 * r2 - 2 * r1 * r2 * Math.cos(thetaRad);
  const true3DEuclideanDistanceLy = Math.sqrt(Math.max(0, true3DDistanceSq));

  const radialDepthSeparationLy = Math.abs(r1 - r2);
  const minDistance = Math.min(r1, r2);
  const projectedTransverseSeparationLy = minDistance * thetaRad;

  const depthToTransverseRatio =
    projectedTransverseSeparationLy > 0
      ? radialDepthSeparationLy / projectedTransverseSeparationLy
      : 0;

  const isChanceAlignment = thetaDeg < 2.0 && depthToTransverseRatio > 10.0;

  let explanation = "";
  if (isChanceAlignment) {
    explanation = `Optical chance alignment: ${objA.name} and ${objB.name} appear separated by only ${thetaDeg.toFixed(
      2,
    )}° on the 2D sky projection, but ${
      r1 < r2 ? objA.name : objB.name
    } is a foreground object. The true physical depth between them is ${radialDepthSeparationLy.toLocaleString(
      undefined,
      { maximumFractionDigits: 1 },
    )} light-years, exceeding their apparent transverse separation by a factor of ${depthToTransverseRatio.toFixed(
      1,
    )}×.`;
  } else {
    explanation = `${objA.name} and ${objB.name} have an angular separation of ${thetaDeg.toFixed(
      2,
    )}° with a 3D physical separation of ${true3DEuclideanDistanceLy.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} light-years.`;
  }

  return {
    objectA: objA,
    objectB: objB,
    angularSeparationDeg: thetaDeg,
    angularSeparationArcmin: thetaDeg * 60,
    angularSeparationArcsec: thetaDeg * 3600,
    projectedTransverseSeparationLy,
    radialDepthSeparationLy,
    true3DEuclideanDistanceLy,
    depthToTransverseRatio,
    isChanceAlignment,
    scientificExplanation: explanation,
  };
}

/** Formats right ascension in degrees to standard sexagesimal HH:MM:SS.ss */
export function formatRaHms(raDeg: number): string {
  const norm = ((raDeg % 360) + 360) % 360;
  const hours = norm / 15;
  const h = Math.floor(hours);
  const remMinutes = (hours - h) * 60;
  const m = Math.floor(remMinutes);
  const s = (remMinutes - m) * 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${s.toFixed(2).padStart(5, "0")}s`;
}

/** Formats declination in degrees to standard sexagesimal ±DD:MM:SS.s */
export function formatDecDms(decDeg: number): string {
  const sign = decDeg < 0 ? "-" : "+";
  const abs = Math.abs(decDeg);
  const d = Math.floor(abs);
  const remMinutes = (abs - d) * 60;
  const m = Math.floor(remMinutes);
  const s = (remMinutes - m) * 60;
  return `${sign}${String(d).padStart(2, "0")}° ${String(m).padStart(2, "0")}′ ${s.toFixed(1).padStart(4, "0")}″`;
}
