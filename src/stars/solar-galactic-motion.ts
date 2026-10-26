import * as THREE from "three";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";

// Smooth, axisymmetric illustrative potential, not a unique Galactic ephemeris.
// Units: light-years and Myr. Observational inputs and limitations: docs/solar-galactic-motion.md.
export const KM_S_TO_LY_MYR = 1e6 / 299792.458;
export const SOLAR_GALACTIC = Object.freeze({
  radiusLy: SGR_A_DISTANCE_LY,
  heightPc: 20.8,
  uKmS: 11.1,
  vKmS: 245.24,
  wKmS: 7.25,
  circularKmS: 233,
  verticalPeriodMyr: 74,
  rangeMyr: 500,
});
const PC_LY = 3.261563777;
const STEP = 0.25;
const N = SOLAR_GALACTIC.rangeMyr / STEP;
const vc = SOLAR_GALACTIC.circularKmS * KM_S_TO_LY_MYR;
const nu = (2 * Math.PI) / SOLAR_GALACTIC.verticalPeriodMyr;
const z0 = SOLAR_GALACTIC.heightPc * PC_LY;
const w0 = SOLAR_GALACTIC.wKmS * KM_S_TO_LY_MYR;
let table: Float64Array | undefined;
function derivative(s: number[], out: number[]) {
  const f = (-vc * vc) / (s[0] * s[0] + s[1] * s[1]);
  out[0] = s[2];
  out[1] = s[3];
  out[2] = f * s[0];
  out[3] = f * s[1];
}
function buildTable() {
  const data = new Float64Array((2 * N + 1) * 4);
  const initial = [
    SOLAR_GALACTIC.radiusLy,
    0,
    -SOLAR_GALACTIC.uKmS * KM_S_TO_LY_MYR,
    SOLAR_GALACTIC.vKmS * KM_S_TO_LY_MYR,
  ];
  data.set(initial, N * 4);
  const k1 = [0, 0, 0, 0],
    k2 = [...k1],
    k3 = [...k1],
    k4 = [...k1],
    temp = [...k1];
  for (const sign of [-1, 1]) {
    const s = [...initial],
      h = sign * STEP;
    for (let j = 1; j <= N; j++) {
      derivative(s, k1);
      for (let i = 0; i < 4; i++) temp[i] = s[i] + (h * k1[i]) / 2;
      derivative(temp, k2);
      for (let i = 0; i < 4; i++) temp[i] = s[i] + (h * k2[i]) / 2;
      derivative(temp, k3);
      for (let i = 0; i < 4; i++) temp[i] = s[i] + h * k3[i];
      derivative(temp, k4);
      for (let i = 0; i < 4; i++) s[i] += (h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) / 6;
      data.set(s, (N + sign * j) * 4);
    }
  }
  return data;
}
/** Evaluate a bounded Galactic orbit; constant work, no allocations after first use. */
export function solarGalacticPosition(years: number, out: THREE.Vector3) {
  table ??= buildTable();
  const t = THREE.MathUtils.clamp(Number.isFinite(years) ? years / 1e6 : 0, -N * STEP, N * STEP);
  const f = t / STEP + N,
    index = Math.min(2 * N - 1, Math.floor(f)),
    u = f - index;
  const a = index * 4,
    b = a + 4,
    u2 = u * u,
    u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1,
    h10 = u3 - 2 * u2 + u,
    h01 = -2 * u3 + 3 * u2,
    h11 = u3 - u2;
  const x = h00 * table[a] + h10 * STEP * table[a + 2] + h01 * table[b] + h11 * STEP * table[b + 2];
  const z =
    h00 * table[a + 1] + h10 * STEP * table[a + 3] + h01 * table[b + 1] + h11 * STEP * table[b + 3];
  // Sun is anchored at the existing scene origin at J2000. The actual disk
  // midplane is z0 below that origin; catalogue positions are not relocated.
  return out.set(
    x - SOLAR_GALACTIC.radiusLy,
    z0 * (Math.cos(nu * t) - 1) + (w0 / nu) * Math.sin(nu * t),
    z,
  );
}

// IAU J2000 equatorial -> Galactic Cartesian, followed by scene (-Xg,Zg,Yg).
export function equatorialToScene(v: THREE.Vector3) {
  const x = v.x,
    y = v.y,
    z = v.z;
  return v.set(
    0.0548755604 * x + 0.8734370902 * y + 0.4838350155 * z,
    -0.867666149 * x - 0.1980763734 * y + 0.4559837762 * z,
    0.4941094279 * x - 0.44482963 * y + 0.7469822445 * z,
  );
}
const eps = (23.439291111 * Math.PI) / 180;
const ex = equatorialToScene(new THREE.Vector3(1, 0, 0));
const ey = equatorialToScene(new THREE.Vector3(0, Math.cos(eps), Math.sin(eps)));
export const ECLIPTIC_POLE = equatorialToScene(
  new THREE.Vector3(0, -Math.sin(eps), Math.cos(eps)),
).normalize();
// Existing planet vectors are (ecliptic X, ecliptic Z, ecliptic Y).
// A matrix preserves that convention, including its reflection, without changing ephemerides.
export const ECLIPTIC_TO_SCENE = new THREE.Matrix4().makeBasis(ex, ECLIPTIC_POLE, ey);
