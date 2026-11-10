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

/** Local-frame normal of the surface the image is projected onto. */
export function observedSurfaceNormal(model: GalaxyModel, image: ObservedGalaxyImage) {
  return image.surface === "disk" ? new THREE.Vector3(0, 1, 0) : earthDirectionLocal(model);
}

/**
 * The four image corners (u, v = 0/1) traced along their sightlines from the Sun onto
 * the projection surface, in local units. The quad covers exactly the registered image.
 */
export function observedSurfaceCorners(model: GalaxyModel, image: ObservedGalaxyImage) {
  const orientation = galaxyOrientation(model),
    inverse = orientation.clone().invert(),
    unalign = catalogueAlignment(model).invert();
  const sun = galaxyCenter(model).negate().applyQuaternion(inverse).divideScalar(model.diskRadius);
  const normal = observedSurfaceNormal(model, image);
  return (
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ] as const
  ).map(([u, v]) => {
    const direction = sceneFromIcrs(avmDirection(image.avm, u, v))
      .applyQuaternion(unalign)
      .applyQuaternion(inverse);
    const t = -normal.dot(sun) / normal.dot(direction);
    return sun.clone().addScaledVector(direction, t);
  });
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * How strongly the observed image is shown. It is exact from Earth's direction; away
 * from it, disk surfaces stay plausible longer for face-on systems than for inclined
 * ones, and sky sheets fade early. Close approach yields to the 3D star field.
 */
export function observedLayerWeight(o: {
  angleFromEarthDeg: number;
  inclinationDeg: number;
  surface: ObservedGalaxyImage["surface"];
  eyeDistanceRadii: number;
}) {
  const allowed =
    o.surface === "disk" ? Math.min(68, Math.max(30, 75 - 0.55 * o.inclinationDeg)) : 28;
  const angular = 1 - smoothstep(allowed * 0.45, allowed, o.angleFromEarthDeg);
  const near = smoothstep(0.7, 1.5, o.eyeDistanceRadii);
  return angular * near;
}

/**
 * Continuous resolution gate. A registered image is shown only once the galaxy is
 * resolved on screen (projected diameter in pixels), never as an inflated marker.
 */
export function observedResolution(projectedDiameterPx: number) {
  return smoothstep(22, 60, projectedDiameterPx);
}

/**
 * Image-edge band (in uv) over which the photograph and the reconstruction
 * cross-fade. Published frames often crop a galaxy's outer disk or a companion's
 * halo; a wide band keeps that crop from reading as a straight line.
 */
export const OBSERVED_EDGE_UV = 0.1;

/** Share of reconstructed light kept inside a fully weighted registered image. */
export const OBSERVED_RECONSTRUCTION_FLOOR = 0.1;

/** Fade of the photograph toward its own frame edge (0 outside, 1 well inside, rounded corners). */
export function observedEdgeFade(u: number, v: number) {
  return (
    smoothstep(0, OBSERVED_EDGE_UV, Math.min(u, 1 - u)) *
    smoothstep(0, OBSERVED_EDGE_UV, Math.min(v, 1 - v))
  );
}

/**
 * Reconstructed-light factor at an image position. Inside the frame the
 * photograph carries the light; outside it the reconstruction is untouched,
 * with the same edge band as the photograph so the two cross-fade.
 * CPU mirror of `observedKeepH` in OBSERVED_FOOTPRINT_GLSL.
 */
export function observedKeep(weight: number, u: number, v: number) {
  const w = Math.min(1, Math.max(0, weight));
  return 1 - w * (1 - OBSERVED_RECONSTRUCTION_FLOOR) * observedEdgeFade(u, v);
}

const glslFloat = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

/** Footprint test for reconstruction shaders; `uObsMat` maps their local frame to image. */
export const OBSERVED_FOOTPRINT_GLSL = /* glsl */ `
uniform mat4 uObsMat;uniform float uObsWeight;
float observedFrame(vec2 e){vec2 f=smoothstep(vec2(0.),vec2(${glslFloat(OBSERVED_EDGE_UV)}),e);return f.x*f.y;}
float observedKeepH(vec4 h){
 if(uObsWeight<.001||h.z<=0.)return 1.;
 vec2 uv=h.xy/h.z,e=min(uv,1.-uv);
 return 1.-uObsWeight*${glslFloat(1 - OBSERVED_RECONSTRUCTION_FLOOR)}*observedFrame(e);
}
float observedKeep(vec3 p){return observedKeepH(uObsMat*vec4(p,1.));}
`;

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
