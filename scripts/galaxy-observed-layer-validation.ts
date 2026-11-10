import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";
import * as THREE from "three";
import { readAvm } from "./galaxy-observed-avm.mjs";
import { NEARBY_GALAXIES } from "../src/stars/galaxy-catalog";
import { GALAXY_MODELS, galaxyCenter, galaxyOrientation, gToXYZ } from "../src/stars/galaxy-models";
import { OBSERVED_GALAXY_IMAGES } from "../src/stars/galaxy-observed-images";
import {
  OBSERVED_DISPLAY_GLSL,
  OBSERVED_EDGE_UV,
  OBSERVED_FOOTPRINT_GLSL,
  OBSERVED_RECONSTRUCTION_FLOOR,
  avmDirection,
  avmTextureRows,
  beforeDisplay,
  earthDirectionLocal,
  icrsFromScene,
  icrsUnit,
  observedEdgeFade,
  observedImageMatrix,
  observedKeep,
  observedLayerWeight,
  observedResolution,
  observedSurfaceCorners,
  sceneFromIcrs,
} from "../src/stars/galaxy-observed-projection";

const D2R = Math.PI / 180;
const close = (a: number, b: number, tolerance: number, label: string) =>
  assert(Math.abs(a - b) <= tolerance, `${label}: ${a} vs ${b} (tolerance ${tolerance})`);
function jpegSize(file: string) {
  const d = fs.readFileSync(file);
  for (let i = 2; i < d.length;) {
    if (d[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = d[i + 1];
    if (marker >= 0xc0 && marker <= 0xc2) return [d.readUInt16BE(i + 7), d.readUInt16BE(i + 5)];
    i += 2 + d.readUInt16BE(i + 2);
  }
  throw Error("No JPEG frame header in " + file);
}
const uvOf = (avm: (typeof OBSERVED_GALAXY_IMAGES)[number]["avm"], icrs: THREE.Vector3) => {
  const [u, v, w] = avmTextureRows(avm).map((r) => r.dot(icrs));
  return [u / w, v / w];
};
const project = (m: THREE.Matrix4, q: THREE.Vector3) => {
  const h = new THREE.Vector4(q.x, q.y, q.z, 1).applyMatrix4(m);
  return [h.x / h.z, h.y / h.z];
};

// Every catalogue entry's galactic coordinates must agree with its own ICRS position
// within the rounding of one-decimal l/b (≈0.07°). These entries disagree and are kept
// as recorded until their source is re-verified; the bound stops them drifting further.
const UNVERIFIED_LB: Record<string, number> = {
  "Malin 1": 6.7,
  "GLASS-z12": 3.15,
  M60: 1.26,
  "Hercules A": 1.13,
  "Canis Major Dwarf": 1.04,
  M65: 0.2,
  M66: 0.2,
  "NGC 3628": 0.19,
  M86: 0.125,
};
let checked = 0;
for (const g of NEARBY_GALAXIES) {
  if (g.ra === undefined || g.dec === undefined) continue;
  const scene = sceneFromIcrs(icrsUnit(g.ra, g.dec));
  const l = Math.atan2(scene.z, -scene.x) / D2R,
    b = Math.asin(THREE.MathUtils.clamp(scene.y, -1, 1)) / D2R;
  const fromLb = new THREE.Vector3(
    -Math.cos(g.b * D2R) * Math.cos(g.l * D2R),
    Math.sin(g.b * D2R),
    Math.cos(g.b * D2R) * Math.sin(g.l * D2R),
  );
  const separation = fromLb.angleTo(scene) / D2R;
  assert(
    separation < (UNVERIFIED_LB[g.name] ?? 0.1),
    `${g.name}: l/b (${g.l}, ${g.b}) is ${separation.toFixed(3)}° from RA/Dec (expected about ${l.toFixed(3)}, ${b.toFixed(3)})`,
  );
  checked++;
}
console.log(
  `Catalogue l/b agrees with RA/Dec for ${checked} entries (< 0.1°); awaiting source verification: ${Object.keys(UNVERIFIED_LB).join(", ")}`,
);

for (const image of OBSERVED_GALAXY_IMAGES) {
  const file = "public" + image.url;
  assert(fs.existsSync(file), "Missing image " + file);
  const [width, height] = jpegSize(file);
  assert.deepEqual([width, height], [image.width, image.height], image.key + " dimensions");
  const [refW, refH] = image.avm.referenceDimension;
  close(width / height, refW / refH, 0.002 * (refW / refH), image.key + " aspect vs AVM");

  const avm = readAvm(file);
  if (image.avmSource === "embedded") {
    // Registry values are the file's own embedded metadata.
    assert(avm, image.key + " has no AVM in its XMP packet");
    assert.equal(avm.quality, "Full", image.key + " AVM quality");
    assert.equal(avm.frame, image.avm.frame);
    assert.equal(avm.projection, image.avm.projection);
    for (const field of [
      "referenceValue",
      "referencePixel",
      "referenceDimension",
      "scale",
    ] as const)
      avm[field].forEach((v: number, i: number) =>
        close(v, image.avm[field][i], Math.abs(v) * 1e-12 + 1e-12, `${image.key} ${field}[${i}]`),
      );
    close(avm.rotation, image.avm.rotation, 1e-9, image.key + " rotation");
  } else {
    // Published record: only allowed when the file has no spatial AVM of its own,
    // and it must place at least two measured compact features.
    assert(!avm, image.key + " embeds AVM; use it instead of a published record");
    assert((image.landmarks?.length ?? 0) >= 2, image.key + " needs measured landmarks");
  }
  for (const landmark of image.landmarks ?? []) {
    const [u, v] = uvOf(image.avm, icrsUnit(landmark.ra, landmark.dec));
    const measured = [(landmark.pixel[0] + 0.5) / width, 1 - (landmark.pixel[1] + 0.5) / height];
    const miss = Math.hypot(u - measured[0], v - measured[1]);
    assert(
      miss <= landmark.toleranceUv,
      `${image.key} ${landmark.name}: predicted (${u.toFixed(4)}, ${v.toFixed(4)}) vs measured ${measured.map((x) => x.toFixed(4))}`,
    );
  }

  // WCS round trip.
  for (const [u, v] of [
    [0.13, 0.71],
    [0.5, 0.5],
    [0.92, 0.08],
  ]) {
    const [u2, v2] = uvOf(image.avm, avmDirection(image.avm, u, v));
    close(u2, u, 1e-9, image.key + " round trip u");
    close(v2, v, 1e-9, image.key + " round trip v");
  }

  const model = GALAXY_MODELS.find((m) => m.key === image.key);
  assert(model, "No galaxy model for " + image.key);
  const catalogued = NEARBY_GALAXIES.find((g) => g.name === model.name)!;
  const nucleus = uvOf(image.avm, icrsUnit(catalogued.ra!, catalogued.dec!));
  assert(
    nucleus.every((x) => x > 0.05 && x < 0.95),
    `${image.key}: catalogued nucleus falls outside its image at ${nucleus}`,
  );

  // The model centre lands on the catalogued nucleus.
  const matrix = observedImageMatrix(model, image);
  const [cu, cv] = project(matrix, new THREE.Vector3());
  close(cu, nucleus[0], 2e-4, image.key + " centre u");
  close(cv, nucleus[1], 2e-4, image.key + " centre v");

  // Points on one sightline from the Sun sample one image pixel (exact Earth view).
  const sun = galaxyCenter(model)
    .negate()
    .applyQuaternion(galaxyOrientation(model).clone().invert())
    .divideScalar(model.diskRadius);
  const q = new THREE.Vector3(0.31, 0.04, -0.22);
  const behind = q.clone().add(q.clone().sub(sun).multiplyScalar(0.004));
  const [a, b] = [project(matrix, q), project(matrix, behind)];
  close(a[0], b[0], 2e-5, image.key + " sightline u");
  close(a[1], b[1], 2e-5, image.key + " sightline v");

  // The rendered quad covers exactly the registered image.
  const corners = observedSurfaceCorners(model, image);
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].forEach(([u, v], i) => {
    const p = corners[i];
    assert([p.x, p.y, p.z].every(Number.isFinite), image.key + " corner finite");
    assert(p.length() < 6, `${image.key} corner ${i} extends ${p.length().toFixed(2)} radii`);
    const [pu, pv] = project(matrix, p);
    close(pu, u, 2e-4, `${image.key} corner ${i} u`);
    close(pv, v, 2e-4, `${image.key} corner ${i} v`);
  });
  // Reconstruction shaders receive worldToImage · (their own matrixWorld), composed
  // exactly as GalaxyObservedLayer and its consumers do. The catalogue body is placed
  // from the catalogue record (two-decimal l/b), the detailed body from the model, so
  // the footprint must be evaluated in world space to land on the same pixels.
  const sheetWorld = new THREE.Matrix4().compose(
    galaxyCenter(model),
    galaxyOrientation(model),
    new THREE.Vector3().setScalar(model.diskRadius),
  );
  const worldToImage = new THREE.Matrix4().copy(sheetWorld).invert().premultiply(matrix);
  const catalogueWorld = new THREE.Matrix4().compose(
    gToXYZ(catalogued.l, catalogued.b, catalogued.distance),
    galaxyOrientation(model),
    new THREE.Vector3().setScalar(model.diskRadius * 1.0),
  );
  const viaCatalogue = new THREE.Matrix4().multiplyMatrices(worldToImage, catalogueWorld);
  for (const local of [new THREE.Vector3(), q, new THREE.Vector3(-0.6, 0.02, 0.45)]) {
    const world = local.clone().applyMatrix4(catalogueWorld);
    const [u0, v0] = project(matrix, world.applyMatrix4(sheetWorld.clone().invert())),
      [u1, v1] = project(viaCatalogue, local);
    close(u1, u0, 1e-6, image.key + " catalogue-body footprint u");
    close(v1, v0, 1e-6, image.key + " catalogue-body footprint v");
  }
  const bodyOffset =
    galaxyCenter(model).distanceTo(gToXYZ(catalogued.l, catalogued.b, catalogued.distance)) /
    model.diskRadius;
  assert(
    bodyOffset < 1e-6,
    `${image.key}: catalogue body ${bodyOffset.toFixed(3)} radii from model`,
  );
  console.log(
    `${image.key}: ${image.avmSource === "embedded" ? "embedded AVM verified" : `published AVM checked by ${image.landmarks!.length} landmarks`}, nucleus at uv (${nucleus.map((x) => x.toFixed(3)).join(", ")}), ${image.surface} surface`,
  );
}

// Catalogued orientation is what an observer at the Sun now sees.
let oriented = 0;
for (const m of GALAXY_MODELS) {
  const g = NEARBY_GALAXIES.find((x) => x.name === m.name);
  if (!g || g.ra === undefined || g.inclination === undefined || g.posAngle === undefined) continue;
  assert(m.skyOrientation, m.name + " lacks its catalogued sky orientation");
  const q = galaxyOrientation(m),
    los = sceneFromIcrs(icrsUnit(m.skyOrientation.ra, m.skyOrientation.dec));
  const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(q),
    major = new THREE.Vector3(1, 0, 0).applyQuaternion(q);
  close(
    Math.acos(Math.min(1, Math.abs(normal.dot(los)))) / D2R,
    g.inclination,
    0.5,
    m.name + " inclination",
  );
  const icrsMajor = icrsFromScene(major),
    ra = m.skyOrientation.ra * D2R,
    dec = m.skyOrientation.dec * D2R;
  const east = new THREE.Vector3(-Math.sin(ra), Math.cos(ra), 0),
    north = new THREE.Vector3(
      -Math.sin(dec) * Math.cos(ra),
      -Math.sin(dec) * Math.sin(ra),
      Math.cos(dec),
    );
  const pa = (((Math.atan2(icrsMajor.dot(east), icrsMajor.dot(north)) / D2R) % 180) + 180) % 180;
  const expected = ((g.posAngle % 180) + 180) % 180;
  const diff = Math.min(Math.abs(pa - expected), 180 - Math.abs(pa - expected));
  assert(diff < 0.5, `${m.name}: projected major axis PA ${pa.toFixed(2)} vs ${expected}`);
  oriented++;
}
console.log(`Measured inclination and position angle seen from Earth for ${oriented} models`);

// Near side. Inclination and position angle leave open which half of the minor axis is
// nearer the Sun. A sourced near side must be the nearer half; every other inclined model
// keeps the default convention (the half toward PA − 90°), so recording one moves no other.
const skyBasis = (raDeg: number, decDeg: number) => {
  const ra = raDeg * D2R,
    dec = decDeg * D2R;
  return {
    east: new THREE.Vector3(-Math.sin(ra), Math.cos(ra), 0),
    north: new THREE.Vector3(
      -Math.sin(dec) * Math.cos(ra),
      -Math.sin(dec) * Math.sin(ra),
      Math.cos(dec),
    ),
  };
};
/** Smallest angle between two position angles (0–180°). */
const paGap = (a: number, b: number) => {
  const d = (((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
};
let sourcedNearSides = 0,
  conventionalNearSides = 0;
for (const m of GALAXY_MODELS) {
  const o = m.skyOrientation;
  // Face-on and exactly edge-on disks have no near half to check.
  if (!o || o.inclination < 1 || o.inclination > 89) {
    assert(!o?.nearSide, `${m.name}: a near side needs an inclined disk`);
    continue;
  }
  const minor = new THREE.Vector3(0, 0, 1).applyQuaternion(galaxyOrientation(m));
  const { east, north } = skyBasis(o.ra, o.dec);
  const icrsMinor = icrsFromScene(minor);
  const minorPa = (Math.atan2(icrsMinor.dot(east), icrsMinor.dot(north)) / D2R + 360) % 360;
  const towardSun = minor.dot(sceneFromIcrs(icrsUnit(o.ra, o.dec))) < 0;
  const nearPa = towardSun ? minorPa : (minorPa + 180) % 360;
  const n = o.nearSide;
  if (n) {
    assert(
      Math.min(paGap(n.pa, o.pa + 90), paGap(n.pa, o.pa - 90)) < 0.5,
      `${m.name}: near side PA ${n.pa} is not on the minor axis of PA ${o.pa}`,
    );
    assert(
      n.evidence.length > 40 && /arXiv:|doi:|\b(19|20)\d\d\b/.test(n.source),
      `${m.name}: a near side needs its evidence and a citation`,
    );
    close(paGap(nearPa, n.pa), 0, 0.5, `${m.name}: sourced near side (PA ${n.pa})`);
    sourcedNearSides++;
  } else {
    close(paGap(nearPa, o.pa - 90), 0, 0.5, `${m.name}: default near-side convention`);
    conventionalNearSides++;
  }
}
const m104 = GALAXY_MODELS.find((m) => m.key === "m104")!;
assert.equal(m104.skyOrientation?.nearSide?.pa, 180, "M104's near side is south of the nucleus");
console.log(
  `Near side: ${sourcedNearSides} sourced, ${conventionalNearSides} on the default convention`,
);

// A dust-silhouette near side must be visible in the registered photograph: along the
// minor axis the bulge light dips and recovers, reddened, on that half, and falls off
// smoothly on the far half. Medians across a band ignore foreground stars.
const SRGB = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const median = (values: number[]) => [...values].sort((a, b) => a - b)[values.length >> 1];
for (const m of GALAXY_MODELS) {
  const n = m.skyOrientation?.nearSide;
  const image = OBSERVED_GALAXY_IMAGES.find((i) => i.key === m.key);
  if (!n || n.method !== "dust-silhouette" || !image) continue;
  const g = NEARBY_GALAXIES.find((x) => x.name === m.name)!;
  const { data, info } = await sharp("public" + image.url)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const rows = avmTextureRows(image.avm),
    centre = icrsUnit(g.ra!, g.dec!),
    { east, north } = skyBasis(g.ra!, g.dec!);
  const semiMinor = ((g.angularDiameterArcmin.minor ?? g.angularDiameterArcmin.major) * 60) / 2;
  const reach = 0.5 * semiMinor,
    band = Math.max(4, 0.06 * semiMinor);
  const silhouette = (paDeg: number) => {
    const t = paDeg * D2R,
      along = north.clone().multiplyScalar(Math.cos(t)).addScaledVector(east, Math.sin(t)),
      across = east.clone().multiplyScalar(Math.cos(t)).addScaledVector(north, -Math.sin(t));
    const profile: { light: number; blueRed: number }[] = [];
    for (let s = 0; s <= reach; s += reach / 80) {
      const light: number[] = [],
        blueRed: number[] = [];
      for (let k = -band; k <= band; k += band / 12) {
        const d = centre
          .clone()
          .addScaledVector(along, (s / 3600) * D2R)
          .addScaledVector(across, (k / 3600) * D2R);
        const [u, v, w] = rows.map((r) => r.dot(d));
        const x = Math.floor((u / w) * info.width),
          y = Math.floor((1 - v / w) * info.height);
        if (x < 0 || y < 0 || x >= info.width || y >= info.height) continue;
        const i = (y * info.width + x) * info.channels;
        const [r, gg, b] = [SRGB(data[i]), SRGB(data[i + 1]), SRGB(data[i + 2])];
        light.push(0.2126 * r + 0.7152 * gg + 0.0722 * b);
        blueRed.push((b + 1e-3) / (r + 1e-3));
      }
      if (light.length) profile.push({ light: median(light), blueRed: median(blueRed) });
    }
    // Recovery: how far the light climbs again beyond its darkest point (1 = smooth fall-off).
    let best = { recovery: 1, reddening: 1 };
    for (let i = 0; i < profile.length; i++) {
      let peak = i;
      for (let k = i; k < profile.length; k++) if (profile[k].light > profile[peak].light) peak = k;
      const recovery = profile[peak].light / Math.max(profile[i].light, 1e-6);
      if (recovery > best.recovery)
        best = { recovery, reddening: profile[i].blueRed / profile[peak].blueRed };
    }
    return best;
  };
  const near = silhouette(n.pa),
    far = silhouette(n.pa + 180);
  assert(
    near.recovery > 2 && near.reddening < 0.8 && far.recovery < 1.2,
    `${m.name}: photograph's dust silhouette should lie at PA ${n.pa} ` +
      `(near ${JSON.stringify(near)}, far ${JSON.stringify(far)})`,
  );
  console.log(
    `${image.key}: dust silhouette at PA ${n.pa}° in its photograph (light recovers ×${near.recovery.toFixed(1)}, ` +
      `reddened ×${near.reddening.toFixed(2)}; far half ×${far.recovery.toFixed(2)})`,
  );
}

// Visibility rules.
const w = (angle: number, inclination: number, surface: "disk" | "sky", radii = 4) =>
  observedLayerWeight({
    angleFromEarthDeg: angle,
    inclinationDeg: inclination,
    surface,
    eyeDistanceRadii: radii,
  });
close(w(0, 20, "disk"), 1, 1e-12, "Earth view shows the image");
assert(w(90, 20, "disk") === 0 && w(40, 84, "sky") === 0, "Side views return to the 3D model");
assert(w(0, 20, "disk", 0.5) === 0, "Close approach yields to stars");
assert(w(35, 20, "disk") > w(35, 62, "disk"), "Face-on disks deproject farther than inclined ones");
assert(w(20, 20, "disk") > w(20, 20, "sky"), "Sky sheets fade earlier than disks");
const m81 = GALAXY_MODELS.find((m) => m.key === "m81")!;
close(earthDirectionLocal(m81).length(), 1, 1e-12, "Earth direction is a unit vector");
assert(
  observedResolution(10) === 0 && observedResolution(80) === 1,
  "Unresolved markers get no image",
);

// Reconstructed light is replaced only inside the photograph's frame, and the two
// cross-fade over the same edge band.
close(observedKeep(1, 0.5, 0.5), OBSERVED_RECONSTRUCTION_FLOOR, 1e-12, "Inside a full image");
assert(observedKeep(1, -0.2, 0.5) === 1 && observedKeep(1, 0.5, 1.3) === 1, "Outside the frame");
assert(observedKeep(0, 0.5, 0.5) === 1, "No image, no change");
assert(
  observedKeep(1, 0, 0.5) === 1 && observedEdgeFade(0, 0.5) === 0,
  "Continuous at the frame edge",
);
close(
  observedKeep(1, OBSERVED_EDGE_UV, 0.5),
  OBSERVED_RECONSTRUCTION_FLOOR,
  1e-12,
  "Edge band width",
);
for (const u of [0.005, 0.01, 0.02, 0.03]) {
  const photo = observedEdgeFade(u, 0.5),
    keep = observedKeep(1, u, 0.5);
  close(keep, 1 - (1 - OBSERVED_RECONSTRUCTION_FLOOR) * photo, 1e-12, "Cross-fade at " + u);
}
assert(
  OBSERVED_FOOTPRINT_GLSL.includes(String(1 - OBSERVED_RECONSTRUCTION_FLOOR)) &&
    OBSERVED_FOOTPRINT_GLSL.includes(String(OBSERVED_EDGE_UV)),
  "GLSL footprint uses the tested constants",
);

// Display inverse: three.js NeutralToneMapping(exposure · beforeDisplay(y)) returns y.
function neutral(color: number[], exposure: number) {
  const S = 0.8 - 0.04,
    desaturation = 0.15;
  let c = color.map((x) => x * exposure);
  const x = Math.min(...c);
  const offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  c = c.map((v) => v - offset);
  const peak = Math.max(...c);
  if (peak < S) return c;
  const d = 1 - S;
  const newPeak = 1 - (d * d) / (peak + d - S);
  c = c.map((v) => (v * newPeak) / peak);
  const g = 1 - 1 / (desaturation * (peak - newPeak) + 1);
  return c.map((v) => v * (1 - g) + newPeak * g);
}
for (const exposure of [1, 0.135, 0.075])
  for (const rgb of [
    [0.001, 0.002, 0.004],
    [0.02, 0.03, 0.05],
    [0.1, 0.07, 0.04],
    [0.45, 0.4, 0.3],
    [0.7, 0.72, 0.75],
  ] as [number, number, number][]) {
    const shown = neutral(beforeDisplay(rgb, exposure, true), exposure);
    rgb.forEach((c, i) => close(shown[i], c, 1e-9, `neutral round trip ${rgb} @ ${exposure}`));
  }
for (const rgb of [
  [0.9, 0.8, 0.6],
  [0.95, 0.95, 0.95],
] as [number, number, number][]) {
  const shown = neutral(beforeDisplay(rgb, 0.135, true), 0.135);
  close(Math.max(...shown), Math.max(...rgb), 1e-9, "Highlight peak restored " + rgb);
  rgb.forEach((c, i) => close(shown[i], c, 0.03, "Highlight colour within desaturation " + rgb));
}
close(beforeDisplay([0.5, 0.4, 0.3], 0.25, false)[0], 2, 1e-12, "Other curves: exposure only");
assert(OBSERVED_DISPLAY_GLSL.includes("beforeDisplay"), "GLSL display inverse present");
console.log("Observed galaxy layer validation passed");
