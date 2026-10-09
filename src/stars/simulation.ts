import { Body, HelioVector, GeoMoon, JupiterMoons, RotationAxis, Rotation_EQJ_ECL, RotateVector, Vector, MakeTime } from "astronomy-engine";
import * as THREE from "three";

// Local presentation units are uniformly enlarged: radii and distances use
// the SAME conversion. This preserves physical ratios without GPU sub-nanometre math.
export const SYSTEM_AU = 0.05;
export const EARTH_RADIUS = 6371 / 149597870.7 * SYSTEM_AU;
export const SUN_RADIUS = 695700 / 149597870.7 * SYSTEM_AU;
export const DAYS_PER_SECOND = 1; // at the default 25% setting
export const simulation = { days: 0, epoch: 0, date: new Date(0) };
const ecliptic = Rotation_EQJ_ECL();
const bodies = new Set<string>(Object.values(Body));
export function astronomyBody(name: string): Body | null {
  return bodies.has(name) ? name as Body : null;
}
export function toScene(v: { x: number; y: number; z: number }, out: THREE.Vector3) {
  const e = RotateVector(ecliptic, new Vector(v.x, v.y, v.z, MakeTime(simulation.date)));
  return out.set(e.x * SYSTEM_AU, e.z * SYSTEM_AU, -e.y * SYSTEM_AU);
}
export function planetPosition(name: string, out: THREE.Vector3) {
  const body = astronomyBody(name);
  return body ? toScene(HelioVector(body, simulation.date), out) : out.set(0, 0, 0);
}
let jovianDate = -1;
let jovian: ReturnType<typeof JupiterMoons> | null = null;
export function satellitePosition(parent: string, name: string, out: THREE.Vector3): boolean {
  if (name === "Moon") { toScene(GeoMoon(simulation.date), out); return true; }
  if (parent !== "Jupiter") return false;
  if (jovianDate !== simulation.date.getTime()) {
    jovianDate = simulation.date.getTime();
    jovian = JupiterMoons(simulation.date);
  }
  const state = name === "Io" ? jovian?.io : name === "Europa" ? jovian?.europa : name === "Ganymede" ? jovian?.ganymede : name === "Callisto" ? jovian?.callisto : null;
  if (!state) return false;
  toScene(state, out); return true;
}
export function bodyOrientation(name: string, pole: THREE.Quaternion): number {
  const body = astronomyBody(name);
  if (!body) return 0;
  const axis = RotationAxis(body, simulation.date);
  const north = toScene(axis.north, new THREE.Vector3()).normalize();
  pole.setFromUnitVectors(new THREE.Vector3(0, 1, 0), north);
  return THREE.MathUtils.degToRad(axis.spin % 360);
}
export function eccentricAnomaly(mean: number, e: number) {
  const m = mean % (2 * Math.PI);
  let anomaly = m;
  for (let i = 0; i < 8; i++) anomaly -= (anomaly - e * Math.sin(anomaly) - m) / (1 - e * Math.cos(anomaly));
  return anomaly;
}

/** Mean radius km, mean orbital radius km, sidereal period days.
 * NASA/JPL satellite mean elements; non-ephemeris satellite phases are modelled.
 */
export const MOON_ELEMENTS: Record<string, [number, number, number]> = {
  Moon: [1737.4,384400,27.321661], Phobos:[11.1,9376,0.31891], Deimos:[6.2,23463,1.26244],
  Io:[1821.6,421800,1.769138], Europa:[1560.8,671100,3.551181], Ganymede:[2634.1,1070400,7.154553], Callisto:[2410.3,1882700,16.689018],
  Metis:[21.5,128000,0.29478], Adrastea:[8.2,129000,0.29826], Amalthea:[83.5,181400,0.49818], Thebe:[49.3,221900,0.6745], Himalia:[85,11461000,250.56], Elara:[43,11741000,259.64], Pasiphae:[30,23624000,743.63], Carme:[23,23404000,734.17],
  Mimas:[198.2,185539,0.942422], Enceladus:[252.1,238042,1.370218], Tethys:[531.1,294672,1.887802], Dione:[561.4,377415,2.736915], Rhea:[763.8,527068,4.518212], Titan:[2574.7,1221870,15.945421], Hyperion:[135,1481100,21.276609], Iapetus:[734.5,3560820,79.3215], Phoebe:[106.5,12952000,550.48],
  Puck:[81,86004,0.761833], Miranda:[235.8,129390,1.413479], Ariel:[578.9,191020,2.520379], Umbriel:[584.7,266300,4.144177], Titania:[788.9,435910,8.705872], Oberon:[761.4,583520,13.463239],
  Naiad:[33,48227,0.294396], Despina:[75,52526,0.334655], Galatea:[88,61953,0.428745], Larissa:[97,73548,0.554654], Proteus:[210,117647,1.122315], Triton:[1353.4,354759,5.876854], Nereid:[170,5513400,360.1362],
  Charon:[606,19596,6.38723], Styx:[5.2,42656,20.16155], Nix:[19.3,48694,24.85463], Kerberos:[6,57783,32.16756], Hydra:[20.9,64738,38.20177],
};