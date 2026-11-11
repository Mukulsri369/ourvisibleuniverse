import * as THREE from "three";
import { NEARBY_GALAXIES } from "./galaxy-catalog";
import { galaxyCenter, galaxyOrientation, type GalaxyModel } from "./galaxy-models";
import type { AvmRegistration, ObservedGalaxyImage } from "./galaxy-observed-images";

const D2R = Math.PI / 180;

/** scene = M · ICRS (IAU J2000 ICRS→Galactic, then this scene's [-X, Z, Y]); see galaxy-sky-orientation.ts. */
const SCENE_FROM_ICRS = new THREE.Matrix3().set(
  0.0548755604,
  0.8734370902,
  0.4838350155,
  -0.867666149,
  -0.1980763734,
  0.4559837762,
  0.4941094279,
  -0.44482963,
  0.7469822445,
);
/** A proper rotation, so the inverse is the transpose. */
const ICRS_FROM_SCENE = SCENE_FROM_ICRS.clone().transpose();

export function icrsUnit(raDeg: number, decDeg: number) {
  const a = raDeg * D2R,
    d = decDeg * D2R;
  return new THREE.Vector3(Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d));
}
export const sceneFromIcrs = (v: THREE.Vector3) => v.clone().applyMatrix3(SCENE_FROM_ICRS);
export const icrsFromScene = (v: THREE.Vector3) => v.clone().applyMatrix3(ICRS_FROM_SCENE);

function tangentBasis(avm: AvmRegistration) {
  const a0 = avm.referenceValue[0] * D2R,
    d0 = avm.referenceValue[1] * D2R;
  return {
    centre: icrsUnit(avm.referenceValue[0], avm.referenceValue[1]),
    east: new THREE.Vector3(-Math.sin(a0), Math.cos(a0), 0),
    north: new THREE.Vector3(
      -Math.sin(d0) * Math.cos(a0),
      -Math.sin(d0) * Math.sin(a0),
      Math.cos(d0),
    ),
  };
}
/** FITS CD matrix (degrees per pixel) from AVM scale and CROTA2-style rotation. */
function cdMatrix(avm: AvmRegistration) {
  const [sx, sy] = avm.scale,
    r = avm.rotation * D2R;
  return { a: sx * Math.cos(r), b: -sy * Math.sin(r), c: sx * Math.sin(r), d: sy * Math.cos(r) };
}

/**
 * Rows mapping an ICRS direction d (any length) to homogeneous texture coordinates
 * [u·w, v·w, w] for a gnomonic (TAN) image: u, v are 0..1 across the registered
 * image, v increasing upward (FITS convention, matching a flipY texture).
 */
export function avmTextureRows(
  avm: AvmRegistration,
): [THREE.Vector3, THREE.Vector3, THREE.Vector3] {
  const { centre, east, north } = tangentBasis(avm);
  const cd = cdMatrix(avm);
  const k = 180 / Math.PI / (cd.a * cd.d - cd.b * cd.c);
  const k11 = k * cd.d,
    k12 = -k * cd.b,
    k21 = -k * cd.c,
    k22 = k * cd.a;
  const [width, height] = avm.referenceDimension,
    [px, py] = avm.referencePixel;
  const u = east
    .clone()
    .multiplyScalar(k11)
    .addScaledVector(north, k12)
    .addScaledVector(centre, px - 0.5)
    .divideScalar(width);
  const v = east
    .clone()
    .multiplyScalar(k21)
    .addScaledVector(north, k22)
    .addScaledVector(centre, py - 0.5)
    .divideScalar(height);
  return [u, v, centre.clone()];
}

/** Inverse of avmTextureRows: ICRS unit direction seen at texture coordinate (u, v). */
export function avmDirection(avm: AvmRegistration, u: number, v: number) {
  const { centre, east, north } = tangentBasis(avm);
  const cd = cdMatrix(avm);
  const [width, height] = avm.referenceDimension,
    [px, py] = avm.referencePixel;
  const dx = u * width + 0.5 - px,
    dy = v * height + 0.5 - py;
  const xi = (cd.a * dx + cd.b * dy) * D2R,
    eta = (cd.c * dx + cd.d * dy) * D2R;
  return centre.clone().addScaledVector(east, xi).addScaledVector(north, eta).normalize();
}

/**
 * Catalogue nucleus direction (scene) for a model. Model centres use galactic l/b
 * rounded to about 0.05°; the rotation that maps that centre onto the catalogued
 * RA/Dec keeps the registered image exactly on the 3D model.
 */
export function catalogueAlignment(model: GalaxyModel) {
  const centre = galaxyCenter(model).normalize();
  const catalogued = NEARBY_GALAXIES.find((g) => g.name === model.name);
  const target =
    catalogued?.ra !== undefined && catalogued.dec !== undefined
      ? sceneFromIcrs(icrsUnit(catalogued.ra, catalogued.dec))
      : centre.clone();
  return new THREE.Quaternion().setFromUnitVectors(centre, target.normalize());
}

/**
 * Projective map from galaxy-local coordinates (units of disk radius, the frame of
 * GalaxyRadiance) to homogeneous texture coordinates. Each point is sampled along its
 * sightline from the Sun, so the image is reproduced exactly from Earth's direction.
 * Rows 0–2 of the returned matrix hold [u·w, v·w, w]; use uv = h.xy / h.z.
 */
export function observedImageMatrix(model: GalaxyModel, image: ObservedGalaxyImage) {
  const centre = galaxyCenter(model),
    distance = centre.length();
  const rotation = new THREE.Matrix3().setFromMatrix4(
    new THREE.Matrix4().makeRotationFromQuaternion(galaxyOrientation(model)),
  );
  const align = new THREE.Matrix3().setFromMatrix4(
    new THREE.Matrix4().makeRotationFromQuaternion(catalogueAlignment(model)),
  );
  // Scene point -> ICRS direction, after aligning the centre with the catalogue nucleus.
  const toIcrs = ICRS_FROM_SCENE.clone().multiply(align);
  const rows = avmTextureRows(image.avm).map((r) => {
    // Row vector r·toIcrs, expressed as a scene-space vector.
    const sceneRow = r.clone().applyMatrix3(toIcrs.clone().transpose());
    const local = sceneRow
      .clone()
      .applyMatrix3(rotation.clone().transpose())
      .multiplyScalar(model.diskRadius / distance);
    return { local, offset: sceneRow.dot(centre) / distance };
  });
  // Dividing every row by the distance keeps float32 shader arithmetic well scaled.
  return new THREE.Matrix4().set(
    rows[0].local.x,
    rows[0].local.y,
    rows[0].local.z,
    rows[0].offset,
    rows[1].local.x,
    rows[1].local.y,
    rows[1].local.z,
    rows[1].offset,
    rows[2].local.x,
    rows[2].local.y,
    rows[2].local.z,
    rows[2].offset,
    0,
    0,
    0,
    1,
  );
}

/** Unit vector from the galaxy centre toward the Sun, in the galaxy's local frame. */
export function earthDirectionLocal(model: GalaxyModel) {
  // Sky orientations come from a 10-digit ICRS-to-Galactic matrix, so their quaternions are
  // unit only to about 1e-11; normalising again keeps the promised unit length.
  return galaxyCenter(model)
    .negate()
    .normalize()
    .applyQuaternion(galaxyOrientation(model).clone().invert())
    .normalize();
}

/**
 * Display-referred image light → scene light, so that the renderer's later
 * `toneMap(exposure · x)` shows the published pixel value. The default neutral
 * curve (three.js `NeutralToneMapping`) is undone exactly below its shoulder and
 * along the peak within it (its slight highlight desaturation is not undone);
 * other curves are exposure-compensated only. CPU mirror of
 * OBSERVED_DISPLAY_GLSL's `beforeDisplay`.
 */
export function beforeDisplay(rgb: [number, number, number], exposure: number, neutral: boolean) {
  let y = [...rgb] as [number, number, number];
  if (neutral) {
    const S = 0.76,
      D = 0.24;
    const peak = Math.max(...y);
    if (peak >= S) {
      const top = Math.min(peak, 0.985);
      const scale = (D * D) / (1 - top) - D + S;
      y = y.map((c) => (c * scale) / Math.max(peak, 1e-5)) as typeof y;
    }
    const low = Math.min(...y);
    const offset = low >= 0.04 ? 0.04 : 0.4 * Math.sqrt(Math.max(low, 0)) - low;
    y = y.map((c) => c + offset) as typeof y;
  }
  return y.map((c) => c / Math.max(exposure, 1e-4)) as typeof y;
}

export const OBSERVED_DISPLAY_GLSL = /* glsl */ `
uniform float uExposure,uNeutral;
vec3 beforeDisplay(vec3 y){
 if(uNeutral>.5){
  const float S=.76,D=.24;
  float peak=max(y.r,max(y.g,y.b));
  if(peak>=S){float top=min(peak,.985);y*=(D*D/(1.-top)-D+S)/max(peak,1e-5);}
  float low=min(y.r,min(y.g,y.b));
  y+=low>=.04?.04:.4*sqrt(max(low,0.))-low;
 }
 return y/max(uExposure,1e-4);
}
`;
