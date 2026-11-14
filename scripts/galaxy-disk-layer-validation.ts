/**
 * Validates the disk-layer galaxy reconstruction:
 *  - derived face-on maps exist, match their metadata and stay registered with the
 *    photograph they came from (re-projection correlation, no flips or rotations);
 *  - vertical structure follows the adopted literature ratios and every profile integrates
 *    to the map value it carries (Earth's view of a part equals its image);
 *  - galaxy selection: observed disks, procedural disks, and galaxies that keep the cached
 *    volume (bespoke legacy features);
 *  - the Milky Way's sourced arms keep their observed directions from the Sun, trail its
 *    rotation and share the bar's measured angle with its bulge and star points;
 *  - observed disks do not rotate away from their registration.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as THREE from "three";
import { GALAXY_MODELS } from "../src/stars/galaxy-models";
import { ANDROMEDA_APPEARANCE, MILKY_WAY_APPEARANCE } from "../src/stars/GalaxyRadiance";
import { OBSERVED_IMAGE_BY_KEY } from "../src/stars/galaxy-observed-images";
import { observedImageMatrix } from "../src/stars/galaxy-observed-projection";
import { galaxyStructure } from "../src/stars/galaxy-structure";
import { makeGalaxyStarData } from "../src/stars/galaxy-star-data";
import {
  MILKY_WAY_ARMS,
  MILKY_WAY_BAR,
  ARM_FIT_R0_KPC,
  armRadius,
  galacticLongitude,
} from "../src/stars/milky-way-structure";
import {
  DISK_LAYER_GLSL,
  MAX_ARM_KNOTS,
  MAX_DISK_PARTS,
  MAX_TABLE_ARMS,
  OBSERVED_DISK_MAPS,
  diskLayerSpec,
  diskLayerUniforms,
  sersicCoefficient,
  spheroidColumn,
} from "../src/stars/galaxy-disk-layer";
import { GALAXY_DISK_FRAGMENT } from "../src/stars/galaxy-volume-shader";

const ROOT = process.cwd();
const byKey = new Map(GALAXY_MODELS.map((m) => [m.key, m]));
const srgb = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
async function decode(url: string, size?: number) {
  const file = path.join(ROOT, "public", url);
  assert(fs.existsSync(file), "Missing derived map " + url);
  let pipeline = sharp(file).removeAlpha();
  if (size) pipeline = pipeline.resize(size, size, { fit: "fill" });
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, c: info.channels };
}
function pearson(a: number[], b: number[]) {
  const n = a.length,
    ma = a.reduce((s, v) => s + v, 0) / n,
    mb = b.reduce((s, v) => s + v, 0) / n;
  let ab = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < n; i++) {
    ab += (a[i] - ma) * (b[i] - mb);
    aa += (a[i] - ma) ** 2;
    bb += (b[i] - mb) ** 2;
  }
  return ab / Math.sqrt(aa * bb);
}

// 1. Metadata and files.
const keys = Object.keys(OBSERVED_DISK_MAPS);
assert.deepEqual(
  [...keys].sort(),
  [
    "antennae",
    "cartwheel",
    "catalog-ngc-1300",
    "hoags-object",
    "m101",
    "m33",
    "m51",
    "m81",
    "stephans-quintet",
    "tadpole",
  ],
  "Observed maps cover the seven disk-surface photographs and three merging systems",
);
for (const key of keys) {
  const map = OBSERVED_DISK_MAPS[key];
  const model = byKey.get(key);
  const image = OBSERVED_IMAGE_BY_KEY.get(key);
  assert(model && image, key + " model and registered image");
  assert.equal(map.image, image.url);
  assert.equal(
    map.mode,
    image.surface === "disk" ? "disk" : "sky",
    key + " mode follows its registration surface",
  );
  assert(map.note.includes("not an observation"), key + " labelled as a reconstruction input");
  if (map.mode === "sky") {
    // Part-only systems: every component sits inside the photograph and the volume box.
    const atlas = await decode(map.parts!.url);
    assert.equal(atlas.w, map.parts!.width);
    const spec = diskLayerSpec(model)!;
    assert(
      map.parts!.items.length >= 2 && map.parts!.items.length <= MAX_DISK_PARTS,
      key + " part count",
    );
    for (const part of map.parts!.items) {
      assert(
        part.centreUv.every((v) => v > 0 && v < 1),
        key + " part centred in the photograph",
      );
      assert(
        Math.max(...part.centre.map(Math.abs)) + part.radius <= spec.box + 1e-6,
        key + " part inside the volume",
      );
      assert(part.kind === "sheet" || part.kind === "spheroid");
      if (part.kind === "spheroid")
        assert(
          part.core !== undefined && part.core >= 0.06 && part.core <= 0.8,
          key + " spheroid part has a measured core radius",
        );
    }
    assert(
      !map.parts!.items.some((p) => /7320/.test(p.label)),
      "Foreground NGC 7320 is not part of the group",
    );
    console.log(`${key}: ${map.parts!.items.length} photographed components`);
    continue;
  }
  assert.equal(image.surface, "disk", key + " uses a disk-surface registration");
  assert(map.detail && map.smooth && map.dust, key + " face-on maps");
  assert(map.extent > 0.3 && map.extent <= 1.6, key + " extent");
  const young = await decode(map.detail!.url);
  assert.equal(young.w, map.detail!.size);
  assert.equal(young.h, map.detail!.size);
  const old = await decode(map.smooth!.url);
  assert.equal(old.w, map.smooth!.size);
  const dust = await decode(map.dust!.url);
  assert.equal(dust.w, map.dust!.size);
  assert(map.detail!.scale > 0 && map.smooth!.scale > 0 && map.dust!.tauMax > 0);
  assert((map.parts?.items.length ?? 0) <= MAX_DISK_PARTS);
  for (const part of map.parts?.items ?? []) {
    for (const v of [...part.uvRect, ...part.atlasRect, ...part.centreUv])
      assert(v >= -1e-6 && v <= 1 + 1e-6, key + " part rects");
    assert(part.depthExtent > 0 && part.radius > 0 && part.texel > 0, key + " part geometry");
    assert(part.source.length > 5, key + " part position source");
    assert(
      part.core !== undefined && part.core >= 0.06 && part.core <= 0.8,
      key + " spheroid part has a measured core radius",
    );
  }

  // 2. Registration: re-project the derived face-on light into the photograph and compare.
  const photo = await decode(image.url);
  const M = observedImageMatrix(model, image);
  const N = 72,
    a: number[] = [],
    b: number[] = [];
  const v4 = new THREE.Vector4();
  const smoothScale = old.w / young.w;
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = -map.extent + ((i + 0.5) / N) * 2 * map.extent,
        z = map.extent - ((j + 0.5) / N) * 2 * map.extent;
      if (Math.hypot(x, z) > 0.95 * Math.min(map.extent, 1.1)) continue;
      v4.set(x, 0, z, 1).applyMatrix4(M);
      const u = v4.x / v4.z,
        v = v4.y / v4.z;
      if (u < 0.05 || v < 0.05 || u > 0.95 || v > 0.95) continue;
      // Bulges and companions are rendered as separate sightline parts; compare the disk only.
      const inPart = (map.parts?.items ?? []).some((p) => {
        const du = u - p.centreUv[0],
          dv = v - p.centreUv[1];
        return (
          Math.hypot(p.axisA[0] * du + p.axisA[1] * dv, p.axisB[0] * du + p.axisB[1] * dv) < 1.1
        );
      });
      if (inPart) continue;
      // Map texel (row 0 = +z) and photograph pixel (row 0 = top, v up).
      const mx = Math.min(young.w - 1, Math.floor(((x + map.extent) / (2 * map.extent)) * young.w)),
        my = Math.min(young.h - 1, Math.floor(((map.extent - z) / (2 * map.extent)) * young.h));
      const yi = (my * young.w + mx) * young.c,
        oi = (Math.floor(my * smoothScale) * old.w + Math.floor(mx * smoothScale)) * old.c;
      const derived =
        0.7152 *
        (srgb(young.data[yi + 1]) * map.detail!.scale + srgb(old.data[oi + 1]) * map.smooth!.scale);
      const px = Math.min(photo.w - 1, Math.floor(u * photo.w)),
        py = Math.min(photo.h - 1, Math.floor((1 - v) * photo.h));
      a.push(derived);
      b.push(srgb(photo.data[(py * photo.w + px) * photo.c + 1]));
    }
  assert(a.length > 400, key + " enough registration samples");
  const r = pearson(a, b);
  assert(
    r > 0.75,
    `${key}: derived disk light must stay registered with its photograph (r=${r.toFixed(3)})`,
  );
  console.log(
    `${key}: registration correlation ${r.toFixed(3)} over ${a.length} disk-plane samples`,
  );
}

// 3. Vertical structure and normalisation.
const spec = diskLayerSpec(byKey.get("catalog-m74-phantom-galaxy")!);
assert(spec, "A normal spiral uses the disk layer");
const hzOld = spec.heights.old / 2; // sech²(z/z0) ≈ exp(−z/(z0/2)) far from the plane
const close = (v: number, target: number, tol: number, label: string) =>
  assert(Math.abs(v - target) <= tol, `${label}: ${v.toFixed(3)} vs ${target}`);
close(spec.heights.dust / hzOld, 0.5, 0.12, "dust/old scale height (Xilouris et al. 1999)");
close(spec.heights.young / hzOld, 0.5, 0.15, "young/old scale height (De Looze et al. 2014)");
close(spec.heights.ionised / hzOld, 0.25, 0.1, "ionised/old scale height");
close(
  hzOld / 0.27,
  0.085,
  0.04,
  "old scale height / scale length (de Grijs 1998; Kregel et al. 2002)",
);
const integrate = (f: (y: number) => number, lim: number) => {
  let s = 0;
  const steps = 200000,
    dy = (2 * lim) / steps;
  for (let i = 0; i < steps; i++) s += f(-lim + (i + 0.5) * dy) * dy;
  return s;
};
const sech2 = (x: number) => 1 / Math.cosh(Math.min(Math.abs(x), 30)) ** 2;
close(
  integrate((y) => sech2(y / 0.046) / (2 * 0.046), 2),
  1,
  1e-3,
  "sech² profile normalisation",
);
close(
  integrate((y) => Math.exp(-Math.abs(y) / 0.012) / (2 * 0.012), 2),
  1,
  1e-3,
  "exponential profile normalisation",
);
// Spheroids: exp(-b m^w) column normaliser. w = 0.75, b = 3 reproduces the earlier fixed 0.55
// (disk bulges unchanged); the n = 4 column matches numerical integration.
close(spheroidColumn(1, 1, 0.75, 3), 0.5503, 2e-4, "disk-bulge column normaliser");
for (const n of [0.8, 1, 1.5, 4]) {
  const b = sersicCoefficient(n);
  close(
    integrate((y) => Math.exp(-b * Math.abs(y / 0.3) ** (1 / n)), 6) /
      spheroidColumn(0.5, 0.6, 1 / n, b),
    1,
    3e-3,
    "spheroid column n=" + n,
  );
}
// Spheroid parts: spherical-deprojection weight with the part's measured core c, times a
// parabolic window over the chord |d| < L = sqrt(1 − rho²), renormalised per sightline by
// its closed-form column, so Earth's view equals the image for any core (mirrors the GLSL).
for (const core of [0.06, 0.3, 0.6, 0.8])
  for (const rho of [0, 0.3, 0.6, 0.9, 0.99]) {
    const c2 = core * core,
      s2 = rho * rho + c2,
      l2 = Math.max(1 - rho * rho, 0.0025),
      l = Math.sqrt(l2),
      r1 = l / Math.sqrt(1 + c2);
    const closedForm = r1 - (s2 / l2) * (Math.asinh(l / Math.sqrt(s2)) - r1);
    const column = integrate(
      (d) =>
        Math.abs(d) < l ? ((s2 / (2 * (s2 + d * d) ** 1.5)) * (1 - (d * d) / l2)) / closedForm : 0,
      1.2,
    );
    close(column, 1, 2e-3, `spheroid part column at core=${core}, rho=${rho}`);
  }
assert(
  DISK_LAYER_GLSL.includes("diskSech2(y/zo)/(2.*zo)") &&
    DISK_LAYER_GLSL.includes("s2/(2.*pow(s2+dn*dn,1.5))"),
);
assert(
  !/uDiskDust\b/.test(DISK_LAYER_GLSL),
  "Observed dust travels in the packed young-light texture",
);
assert(
  GALAXY_DISK_FRAGMENT.includes("beforeDisplay(display)"),
  "Exterior view uses the photograph's display mapping",
);

// 4. Selection.
const observedCount = GALAXY_MODELS.filter((m) => diskLayerSpec(m)?.observed).length;
assert.equal(observedCount, 10);
const andromeda = diskLayerSpec(ANDROMEDA_APPEARANCE);
assert(andromeda, "Andromeda uses a procedural disk layer");
assert(
  andromeda.procedural.armTable.length === 0 &&
    andromeda.bulge.turn === 0 &&
    andromeda.interior[0] === 8 &&
    andromeda.interior[1] === 0.36 &&
    andromeda.interior[2] === 1,
  "Other disks keep the m-fold spiral, an unturned bulge and the default interior light",
);

// 4b. The Milky Way: a disk layer baked from published fits (milky-way-structure.ts).
const milkyWay = diskLayerSpec(MILKY_WAY_APPEARANCE);
assert(
  milkyWay && milkyWay.procedural.armTable === MILKY_WAY_ARMS,
  "The Milky Way is drawn from its sourced arms",
);
assert(MILKY_WAY_ARMS.length <= MAX_TABLE_ARMS, "The arm table fits the map bake");
for (const a of MILKY_WAY_ARMS) {
  assert(a.knots.length >= 2 && a.knots.length <= MAX_ARM_KNOTS, a.name + " knots fit the bake");
  // Azimuth rises with Galactic rotation and falls outward along every arm, so arms trail.
  for (let k = 0; k + 1 < a.knots.length; k++)
    assert(a.knots[k + 1][0] < a.knots[k][0], a.name + " azimuth falls outward");
}
for (const name of ["Norma-Outer", "Scutum-Centaurus", "Sagittarius-Carina", "Perseus"]) {
  const a = MILKY_WAY_ARMS.find((x) => x.name === name)!;
  assert(a.knots.at(-1)![1] > a.knots[0][1] + 0.9, name + " winds outward");
}
// The arms keep their observed directions from the Sun: the fourth-quadrant tangencies of
// Reid et al. 2019, Table 2 (posterior longitudes, column 3).
for (const [name, longitude] of Object.entries({
  "3-kpc (near)": 337.0,
  "Norma-Outer": 327.5,
  "Scutum-Centaurus": 306.1,
  "Sagittarius-Carina": 285.6,
})) {
  const a = MILKY_WAY_ARMS.find((x) => x.name === name)!;
  let tangency = 360;
  for (let beta = 0; beta > -2.5; beta -= 0.0005) {
    const r = armRadius(a, beta);
    if (r === null || r >= 1) continue;
    const l = galacticLongitude(beta, r);
    if (l > 180) tangency = Math.min(tangency, l);
  }
  close(tangency, longitude, 1, name + " tangency longitude");
}
// The Sun (azimuth 0, R0) lies outside the Sagittarius arm, inside the Perseus arm and just
// inside the ridge of the Local arm.
const atSun = (name: string) =>
  armRadius(
    MILKY_WAY_ARMS.find((x) => x.name === name)!,
    0,
  )!;
assert(
  atSun("Sagittarius-Carina") < 0.9 &&
    atSun("Local") > 1 &&
    atSun("Local") < 1.1 &&
    atSun("Perseus") > 1.15,
  "The Sun sits between the Sagittarius and Perseus arms, beside the Local arm",
);
close(
  milkyWay.procedural.armScale,
  MILKY_WAY_APPEARANCE.distance / MILKY_WAY_APPEARANCE.diskRadius,
  1e-12,
  "Arm radii are scaled by the Sun's distance from the centre",
);
// Bar and bulge share the measured angle; the near end lies at positive longitude.
assert(
  milkyWay.bulge.turn === MILKY_WAY_BAR.angle &&
    milkyWay.procedural.barAngle === MILKY_WAY_BAR.angle,
);
const barEnd = galacticLongitude(MILKY_WAY_BAR.angle, MILKY_WAY_BAR.halfLengthKpc / ARM_FIT_R0_KPC);
assert(barEnd > 0 && barEnd < 90, "The near end of the bar is in the first quadrant");
assert(
  galaxyStructure(MILKY_WAY_APPEARANCE).rotationRate < 0,
  "The pattern turns toward rising azimuth, the sense the arms trail",
);
{
  // Star points: the bar points lie along the bar, and the disk points do not trace a second,
  // m-fold spiral beside the sourced arms (their light comes from the map).
  const stars = makeGalaxyStarData(MILKY_WAY_APPEARANCE, 36000).positions;
  let xx = 0,
    zz = 0,
    xz = 0;
  const bar = MILKY_WAY_APPEARANCE.barLength / MILKY_WAY_APPEARANCE.diskRadius;
  const sectors = new Array(72).fill(0);
  for (let i = 0; i < stars.length; i += 3) {
    const x = stars[i],
      z = stars[i + 2],
      r = Math.hypot(x, z);
    if (r > 0.5 * bar && r < bar && Math.abs(stars[i + 1]) < 0.05) {
      xx += x * x;
      zz += z * z;
      xz += x * z;
    }
    if (r > 0.45 && r < 0.55)
      sectors[Math.floor(((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * 72) % 72]++;
  }
  close(0.5 * Math.atan2(2 * xz, xx - zz), MILKY_WAY_BAR.angle, 0.1, "Star-point bar angle");
  const mean = sectors.reduce((s, v) => s + v, 0) / 72;
  assert(
    Math.max(...sectors) < 1.8 * mean && Math.min(...sectors) > 0.4 * mean,
    "Milky Way disk points are even in azimuth",
  );
}
for (const m of GALAXY_MODELS) {
  const s = diskLayerSpec(m);
  const structure = galaxyStructure(m);
  // Resolved populations (ellipticals, lenticulars, dwarfs, irregulars, starbursts; LMC and
  // SMC included) and irregulars without a recipe use the population reconstruction.
  const population =
    !OBSERVED_DISK_MAPS[m.key] &&
    (structure.population || (structure.irregular && structure.feature !== 3));
  if (population)
    assert(
      s && s.starHost === 2 && s.bulge.amplitude > 0 && s.bulge.exponent > 0,
      m.name + " has a population reconstruction",
    );
  // M82 (feature 3) is the one starburst rendered as an edge-on disk with its wind.
  if (structure.feature === 3)
    assert(s && s.wind[0] > 0 && s.slab >= 0.99, m.name + " carries its bipolar wind");
  // Bespoke legacy volumes: Centaurus A, Mayall's Object, Malin 1, and interacting systems
  // without a photograph.
  if (
    !OBSERVED_DISK_MAPS[m.key] &&
    !population &&
    ([1, 12, 15].includes(structure.feature) || m.morphology === "interacting")
  )
    assert.equal(s, null, m.name + " keeps its bespoke feature");
  if (s) {
    assert(s.slab > 0.1 && s.slab <= s.box, m.name + " slab");
    assert(s.box >= 1.35 && s.box <= 2.6, m.name + " box");
    // Rays stop at `reach` only for procedural disks, whose maps, spheroid and halo end inside it.
    assert(
      OBSERVED_DISK_MAPS[m.key] || population
        ? s.reach === 0
        : s.reach === 0 ||
            (s.reach >= 1.3 &&
              s.reach >= 1.12 * s.procedural.outer &&
              s.reach >= 5.5 * s.bulge.radius * Math.max(s.bulge.axes[0], s.bulge.axes[2])),
      m.name + " reach",
    );
    const u = diskLayerUniforms(m, s);
    assert(
      u.uDiskHeights.value.toArray().every((v) => v > 0 && v < 0.1),
      m.name + " heights",
    );
  }
}
// 5. Observed disks keep their registration with the photograph.
for (const key of keys)
  assert.equal(galaxyStructure(byKey.get(key)!).rotationRate, 0, key + " pattern rotation");
assert(
  galaxyStructure(byKey.get("catalog-m74-phantom-galaxy")!).rotationRate !== 0,
  "Procedural disks still rotate",
);
console.log(
  `PASS: ${keys.length} observed disk maps registered with their photographs; vertical ratios and profile normalisation; ${
    GALAXY_MODELS.filter((m) => diskLayerSpec(m)).length
  } disk-layer galaxies; population reconstructions for ellipticals, dwarfs and irregulars; the Milky Way from its sourced arms and bar; legacy volumes kept for bespoke features`,
);
