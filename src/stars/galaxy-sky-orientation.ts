import * as THREE from "three";

/**
 * Which half of an inclined disk's minor axis is nearer to the Sun, where a source
 * establishes it. Catalogue inclinations (0–90°) and position angles fix a disk's tilt
 * only up to this choice, so without it the near side is a convention, not a measurement.
 */
export type SkyNearSide = {
  /** Position angle (degrees east of north) of the nearer half of the minor axis: PA ± 90°. */
  pa: number;
  /**
   * "dust-silhouette": a dust lane is dark only where it passes in front of the bulge, so
   * the side where it crosses the bulge is the near side. This is the generally accepted
   * reading (de Vaucouleurs 1959; Iye, Tadaki & Fukumoto 2019, ApJ,
   * doi:10.3847/1538-4357/ab4a18), independently confirmed so far only for M31.
   */
  method: "dust-silhouette";
  /** What was measured, and where. */
  evidence: string;
  /** Citation, with a DOI, bibcode or arXiv identifier. */
  source: string;
};

export type SkyOrientation = {
  ra: number;
  dec: number;
  inclination: number;
  pa: number;
  /** Only where a source establishes it; otherwise the default convention below applies. */
  nearSide?: SkyNearSide;
};

/** IAU J2000 rotation (ICRS -> Galactic), then this scene's [-X, Z, Y] convention. */
function sceneVector(x: number, y: number, z: number) {
  return new THREE.Vector3(
    -(-0.0548755604 * x - 0.8734370902 * y - 0.4838350155 * z),
    -0.867666149 * x - 0.1980763734 * y + 0.4559837762 * z,
    0.4941094279 * x - 0.44482963 * y + 0.7469822445 * z,
  );
}

/** Whether a sourced near side lies on the minor-axis half toward PA + 90°. */
function nearSideAtPaPlus90(o: SkyOrientation) {
  return Boolean(o.nearSide && Math.cos(((o.nearSide.pa - o.pa - 90) * Math.PI) / 180) > 0);
}

/**
 * Local X is the observed major axis, Y the disk normal and Z the disk minor axis.
 *
 * By convention the minor-axis half toward PA + 90° is tilted away from the Sun, so the
 * half toward PA − 90° is the near side. That choice is not a measurement. A sourced
 * `nearSide` on the PA + 90° half reverses the tilt (the inclination changes sign), which
 * leaves the disk plane's projection on the sky unchanged and moves only depth: the near
 * half then passes in front of the bulge.
 */
export function observedSkyQuaternion(o: SkyOrientation) {
  const rad = Math.PI / 180,
    ra = o.ra * rad,
    dec = o.dec * rad,
    pa = o.pa * rad,
    inc = o.inclination * rad,
    tilt = nearSideAtPaPlus90(o) ? -1 : 1;
  const east = sceneVector(-Math.sin(ra), Math.cos(ra), 0);
  const north = sceneVector(
    -Math.sin(dec) * Math.cos(ra),
    -Math.sin(dec) * Math.sin(ra),
    Math.cos(dec),
  );
  const line = sceneVector(
    Math.cos(dec) * Math.cos(ra),
    Math.cos(dec) * Math.sin(ra),
    Math.sin(dec),
  );
  const major = north
    .clone()
    .multiplyScalar(Math.cos(pa))
    .addScaledVector(east, Math.sin(pa))
    .normalize();
  const minor = east
    .multiplyScalar(Math.cos(pa))
    .addScaledVector(north, -Math.sin(pa))
    .multiplyScalar(Math.cos(inc))
    .addScaledVector(line, tilt * Math.sin(inc))
    .normalize();
  const normal = minor.clone().cross(major).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(major, normal, minor),
  );
}
