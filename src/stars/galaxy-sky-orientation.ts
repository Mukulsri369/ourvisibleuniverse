import * as THREE from "three";
export type SkyOrientation = { ra: number; dec: number; inclination: number; pa: number };
/** IAU J2000 rotation (ICRS -> Galactic), then this scene's [-X, Z, Y] convention. */
function sceneVector(x: number, y: number, z: number) {
  return new THREE.Vector3(
    -(-0.0548755604 * x - 0.8734370902 * y - 0.4838350155 * z),
    -0.867666149 * x - 0.1980763734 * y + 0.4559837762 * z,
    0.4941094279 * x - 0.44482963 * y + 0.7469822445 * z,
  );
}
/** Local X is observed major axis, Y is disk normal, Z is disk minor axis.
 * Unmeasured near-side ambiguity is deliberately not claimed to be solved. */
export function observedSkyQuaternion(o: SkyOrientation) {
  const rad = Math.PI / 180,
    ra = o.ra * rad,
    dec = o.dec * rad,
    pa = o.pa * rad,
    inc = o.inclination * rad;
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
    .addScaledVector(line, Math.sin(inc))
    .normalize();
  const normal = minor.clone().cross(major).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(major, normal, minor),
  );
}
