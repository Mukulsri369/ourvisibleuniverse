/**
 * Derives face-on disk maps from the registered telescope images of selected disk galaxies.
 *
 *   npx tsx scripts/derive-galaxy-disk-maps.ts [key ...]      (default: every configured galaxy)
 *   npx tsx scripts/derive-galaxy-disk-maps.ts --check         (verify outputs are reproducible)
 *
 * Method (a simplified form of the geometry used in panchromatic radiative-transfer models,
 * e.g. De Looze et al. 2014, A&A 571, A69, which deproject observed 2D maps to face-on and
 * assign vertical profiles):
 *  1. Decode the published image to linear light; subtract the sky level measured on its border.
 *  2. Remove compact foreground stars and listed background objects (push-pull inpainting).
 *  3. Measure dust lanes as local, reddened darkening and partially restore the light behind them.
 *  4. Move compact spheroids (bulges, the M51 companion) into separate image-plane parts that the
 *     renderer extrudes along the sightline, so they stay rounded when seen from the side.
 *  5. Deproject the remaining disk light and the dust to the disk plane through the same
 *     registration (`observedImageMatrix`) the photograph uses, then split it into a smooth,
 *     older component and a clumpy young/H II component.
 *
 * The outputs are reconstruction inputs derived from the images, not new observations. Depth,
 * vertical structure and everything outside each photograph's frame remain illustrative.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
import * as THREE from "three";
import { GALAXY_MODELS, galaxyCenter, galaxyOrientation, type GalaxyModel } from "../src/stars/galaxy-models";
import { OBSERVED_IMAGE_BY_KEY, type ObservedGalaxyImage } from "../src/stars/galaxy-observed-images";
import {
  avmDirection,
  avmTextureRows,
  catalogueAlignment,
  earthDirectionLocal,
  icrsUnit,
  observedImageMatrix,
  sceneFromIcrs,
} from "../src/stars/galaxy-observed-projection";

type Part = {
  id: string;
  label: string;
  /** Catalogue ICRS centre (degrees). */
  ra: number;
  dec: number;
  semiMajorArcsec: number;
  axisRatio: number;
  /** Position angle of the major axis, degrees east of north. */
  paDeg: number;
  /** Elliptical radius (0–1) where the hand-over to the disk begins. */
  taper: number;
  /** Depth half-extent as a fraction of the semi-major axis. */
  depth: number;
  /** Disk radii behind the disk plane along Earth's sightline (companions); 0 = galaxy sky plane. */
  behindDisk?: number;
  /** Smoothing (fraction of the semi-major axis) separating the spheroid's smooth light from
   * clumpy disk structure in front of it, which stays in the thin disk. */
  smooth?: number;
  source: string;
};
type Mask = { x: number; y: number; r: number; note: string };
type Config = {
  key: string;
  parts: Part[];
  /** Extra circles (local file pixels, x right, y down) to inpaint: bright stars, background objects. */
  masks?: Mask[];
  /** Point-source detector strength; 0 disables automatic star removal. */
  starContrast?: number;
  /** Minimum linear peak excess of a removed point source (keeps a galaxy's own compact clusters). */
  starMinPeak?: number;
  /** Keep blue point sources (young clusters); false where they are mostly foreground stars. */
  starKeepBlue?: boolean;
  /** Multiplies the measured face-on dust optical depth. */
  dustGain?: number;
  /** Disk-plane radius (disk radii) beyond which derived light is tapered away. */
  maxRadius?: number;
  /** Map half-extent override (disk radii), for disks that reach beyond 1.3 R. */
  extent?: number;
  /** Continue the disk past the frame with the fitted profile (only where the frame crops it). */
  continuation?: boolean;
};

const CONFIGS: Config[] = [
  {
    key: "m51",
    parts: [
      {
        id: "bulge",
        label: "M51a bulge",
        ra: 202.469575,
        dec: 47.195258,
        semiMajorArcsec: 34,
        axisRatio: 0.9,
        paDeg: 10,
        taper: 0.35,
        depth: 0.8,
        smooth: 0.05,
        source: "NED NGC 5194 nucleus position",
      },
      {
        id: "companion",
        label: "NGC 5195",
        ra: 202.49829,
        dec: 47.26613,
        semiMajorArcsec: 150,
        axisRatio: 0.85,
        paDeg: 79,
        taper: 0.25,
        depth: 0.62,
        smooth: 0.025,
        behindDisk: 0.35,
        source: "NED NGC 5195 position; seen behind M51a's northern arm (dust in front)",
      },
    ],
  },
  {
    key: "m81",
    parts: [
      {
        id: "bulge",
        label: "M81 bulge",
        ra: 148.888221,
        dec: 69.065295,
        semiMajorArcsec: 215,
        axisRatio: 0.66,
        paDeg: 157,
        taper: 0.3,
        depth: 0.7,
        smooth: 0.04,
        source: "NED M81 nucleus position",
      },
    ],
  },
  {
    key: "m101",
    extent: 1.15,
    parts: [
      {
        id: "bulge",
        label: "M101 nucleus",
        ra: 210.802429,
        dec: 54.34875,
        semiMajorArcsec: 26,
        axisRatio: 0.95,
        paDeg: 40,
        taper: 0.35,
        depth: 0.8,
        source: "NED M101 nucleus position",
      },
    ],
  },
  {
    key: "m33",
    continuation: false,
    starContrast: 1.5,
    starMinPeak: 0,
    starKeepBlue: false,
    maxRadius: 1.2,
    parts: [
      {
        id: "bulge",
        label: "M33 nucleus",
        ra: 23.4621,
        dec: 30.6599,
        semiMajorArcsec: 70,
        axisRatio: 0.8,
        paDeg: 22,
        taper: 0.35,
        depth: 0.8,
        source: "NED M33 nucleus position",
      },
    ],
  },
  {
    key: "catalog-ngc-1300",
    continuation: false,
    parts: [
      {
        id: "bulge",
        label: "NGC 1300 bulge",
        ra: 49.920815,
        dec: -19.411114,
        semiMajorArcsec: 18,
        axisRatio: 0.85,
        paDeg: 106,
        taper: 0.35,
        depth: 0.8,
        source: "NED NGC 1300 nucleus position",
      },
    ],
  },
  {
    key: "cartwheel",
    continuation: false,
    extent: 1.55,
    maxRadius: 1.4,
    masks: [{ x: 3440, y: 1640, r: 46, note: "foreground star with diffraction spikes on the ring" }],
    parts: [
      {
        id: "bulge",
        label: "Cartwheel nucleus",
        ra: 9.4214,
        dec: -33.7163,
        semiMajorArcsec: 4.2,
        axisRatio: 0.75,
        paDeg: 145,
        taper: 0.35,
        depth: 0.8,
        source: "Catalogue position (see galaxy-catalog.ts)",
      },
    ],
  },
  {
    key: "hoags-object",
    continuation: false,
    maxRadius: 1.25,
    dustGain: 0.3,
    masks: [
      { x: 875, y: 502, r: 26, note: "background ring galaxy seen through the gap" },
      { x: 1141, y: 616, r: 15, note: "background galaxy on the ring" },
      { x: 398, y: 908, r: 15, note: "background galaxy on the ring" },
    ],
    parts: [
      {
        id: "bulge",
        label: "Hoag's Object core",
        ra: 229.31,
        dec: 21.5855,
        semiMajorArcsec: 12.5,
        axisRatio: 0.97,
        paDeg: 25,
        taper: 0.3,
        depth: 0.95,
        smooth: 0.02,
        source: "Catalogue position (see galaxy-catalog.ts)",
      },
    ],
  },
];

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "public/textures/galaxies/derived");
const META_FILE = path.join(ROOT, "src/stars/catalog-data/galaxy-disk-maps.json");
const DIAG_DIR = path.join(ROOT, ".taste-skill/disk-maps");
const DETAIL_SIZE = 2048;
const SMOOTH_SIZE = 512;
const PART_CELL = 640;
const TAU_MAX = 4;
const MAX_EXTENT = 1.3;
/** Relative extinction (R, G, B) for a Milky Way-like curve, normalised at V. */
const REDDENING = [0.74, 1, 1.32] as const;

// ------------------------------------------------------------------------------------------
// Small float-image toolkit (no dependencies beyond sharp for decode/encode).
// ------------------------------------------------------------------------------------------
type Plane = Float32Array;
type RGB = { w: number; h: number; c: [Plane, Plane, Plane] };

const SRGB_TO_LINEAR = new Float32Array(256).map((_, i) => {
  const c = i / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
});
const toSrgb = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};
const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function boxesForGauss(sigma: number) {
  const n = 3;
  const ideal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let lower = Math.floor(ideal);
  if (lower % 2 === 0) lower--;
  const upper = lower + 2;
  const m = Math.round((12 * sigma * sigma - n * lower * lower - 4 * n * lower - 3 * n) / (-4 * lower - 4));
  return Array.from({ length: n }, (_, i) => ((i < m ? lower : upper) - 1) / 2);
}
function boxH(src: Plane, dst: Plane, w: number, h: number, r: number) {
  const scale = 1 / (2 * r + 1);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = src[row] * (r + 1);
    for (let x = 1; x <= r; x++) acc += src[row + Math.min(x, w - 1)];
    for (let x = 0; x < w; x++) {
      dst[row + x] = acc * scale;
      acc += src[row + Math.min(x + r + 1, w - 1)] - src[row + Math.max(x - r, 0)];
    }
  }
}
function boxV(src: Plane, dst: Plane, w: number, h: number, r: number) {
  const scale = 1 / (2 * r + 1);
  for (let x = 0; x < w; x++) {
    let acc = src[x] * (r + 1);
    for (let y = 1; y <= r; y++) acc += src[Math.min(y, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = acc * scale;
      acc += src[Math.min(y + r + 1, h - 1) * w + x] - src[Math.max(y - r, 0) * w + x];
    }
  }
}
/** Gaussian blur (three box passes); returns a new plane. */
function blur(src: Plane, w: number, h: number, sigma: number): Plane {
  if (sigma < 0.3) return src.slice();
  let a = src.slice();
  const b = new Float32Array(src.length);
  for (const r of boxesForGauss(sigma)) {
    if (r < 1) continue;
    boxH(a, b, w, h, Math.round(r));
    boxV(b, a, w, h, Math.round(r));
  }
  return a;
}
/** Weighted (normalised) blur: blur(v·m)/blur(m). */
function maskedBlur(src: Plane, mask: Plane, w: number, h: number, sigma: number): Plane {
  const vm = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) vm[i] = src[i] * mask[i];
  const num = blur(vm, w, h, sigma),
    den = blur(mask, w, h, sigma);
  for (let i = 0; i < num.length; i++) num[i] = den[i] > 1e-4 ? num[i] / den[i] : 0;
  return num;
}
/** Push-pull hole filling: pixels with weight < 1 are filled from a coarser, weighted pyramid. */
function pushPull(planes: Plane[], weight: Plane, w: number, h: number) {
  type Level = { w: number; h: number; v: Plane[]; m: Plane };
  const levels: Level[] = [{ w, h, v: planes.map((p) => p.slice()), m: weight.slice() }];
  while (levels[levels.length - 1].w > 1 || levels[levels.length - 1].h > 1) {
    const f = levels[levels.length - 1];
    const cw = Math.max(1, Math.ceil(f.w / 2)),
      ch = Math.max(1, Math.ceil(f.h / 2));
    const m = new Float32Array(cw * ch);
    const v = f.v.map(() => new Float32Array(cw * ch));
    for (let y = 0; y < ch; y++)
      for (let x = 0; x < cw; x++) {
        let sw = 0;
        const acc = [0, 0, 0, 0, 0];
        for (let dy = 0; dy < 2; dy++)
          for (let dx = 0; dx < 2; dx++) {
            const fx = Math.min(f.w - 1, 2 * x + dx),
              fy = Math.min(f.h - 1, 2 * y + dy);
            const wt = f.m[fy * f.w + fx];
            sw += wt;
            for (let k = 0; k < f.v.length; k++) acc[k] += f.v[k][fy * f.w + fx] * wt;
          }
        m[y * cw + x] = Math.min(1, sw);
        for (let k = 0; k < f.v.length; k++) v[k][y * cw + x] = sw > 1e-6 ? acc[k] / sw : 0;
      }
    levels.push({ w: cw, h: ch, v, m });
  }
  for (let l = levels.length - 2; l >= 0; l--) {
    const f = levels[l],
      c = levels[l + 1];
    for (let y = 0; y < f.h; y++)
      for (let x = 0; x < f.w; x++) {
        const i = y * f.w + x;
        const wt = f.m[i];
        if (wt >= 1) continue;
        const cx = Math.min(c.w - 1, Math.max(0, (x + 0.5) / 2 - 0.5)),
          cy = Math.min(c.h - 1, Math.max(0, (y + 0.5) / 2 - 0.5));
        for (let k = 0; k < f.v.length; k++) {
          const up = sampleBilinear(c.v[k], c.w, c.h, cx, cy);
          f.v[k][i] = f.v[k][i] * wt + up * (1 - wt);
        }
        f.m[i] = 1;
      }
  }
  return levels[0].v;
}
function sampleBilinear(p: Plane, w: number, h: number, x: number, y: number) {
  const x0 = Math.max(0, Math.min(w - 1, Math.floor(x))),
    y0 = Math.max(0, Math.min(h - 1, Math.floor(y)));
  const x1 = Math.min(w - 1, x0 + 1),
    y1 = Math.min(h - 1, y0 + 1);
  const fx = Math.min(1, Math.max(0, x - x0)),
    fy = Math.min(1, Math.max(0, y - y0));
  const a = p[y0 * w + x0] * (1 - fx) + p[y0 * w + x1] * fx;
  const b = p[y1 * w + x0] * (1 - fx) + p[y1 * w + x1] * fx;
  return a * (1 - fy) + b * fy;
}
function percentile(values: ArrayLike<number>, q: number, stride = 1) {
  const list: number[] = [];
  for (let i = 0; i < values.length; i += stride) if (Number.isFinite(values[i])) list.push(values[i]);
  if (!list.length) return 0;
  list.sort((a, b) => a - b);
  return list[Math.min(list.length - 1, Math.max(0, Math.round(q * (list.length - 1))))];
}

async function readImage(file: string): Promise<RGB> {
  const { data, info } = await sharp(file).removeAlpha().toColourspace("srgb").raw().toBuffer({ resolveWithObject: true });
  const w = info.width,
    h = info.height,
    n = w * h;
  const c: [Plane, Plane, Plane] = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k][i] = SRGB_TO_LINEAR[data[i * 3 + k]];
  return { w, h, c };
}
async function writeRgb(file: string, img: RGB, scale: number, quality = 90) {
  const buf = Buffer.alloc(img.w * img.h * 3);
  for (let i = 0; i < img.w * img.h; i++)
    for (let k = 0; k < 3; k++) buf[i * 3 + k] = Math.round(toSrgb(img.c[k][i] * scale) * 255);
  await sharp(buf, { raw: { width: img.w, height: img.h, channels: 3 } })
    .jpeg({ quality, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toFile(file);
}
async function writeGray(file: string, plane: Plane, w: number, h: number, encode: (x: number) => number, quality = 90) {
  const buf = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) buf[i] = Math.round(Math.min(1, Math.max(0, encode(plane[i]))) * 255);
  await sharp(buf, { raw: { width: w, height: h, channels: 1 } })
    .jpeg({ quality, mozjpeg: true })
    .toFile(file);
}
async function writeDiagnostic(file: string, img: RGB, scale: number, maxSize = 1200) {
  const buf = Buffer.alloc(img.w * img.h * 3);
  for (let i = 0; i < img.w * img.h; i++)
    for (let k = 0; k < 3; k++) buf[i * 3 + k] = Math.round(toSrgb(img.c[k][i] * scale) * 255);
  await sharp(buf, { raw: { width: img.w, height: img.h, channels: 3 } })
    .resize({ width: Math.min(maxSize, img.w), height: Math.min(maxSize, img.h), fit: "inside" })
    .jpeg({ quality: 88 })
    .toFile(file);
}

// ------------------------------------------------------------------------------------------
// Geometry helpers: the photograph's own WCS and the model registration.
// ------------------------------------------------------------------------------------------
function uvOfRaDec(image: ObservedGalaxyImage, ra: number, dec: number) {
  const [ru, rv, rw] = avmTextureRows(image.avm);
  const d = icrsUnit(ra, dec);
  const w = rw.dot(d);
  return [ru.dot(d) / w, rv.dot(d) / w] as const;
}
/** Local-file pixel (x right, y down) of a uv coordinate (v up). */
const pixelOfUv = (image: { width: number; height: number }, u: number, v: number) =>
  [u * image.width - 0.5, (1 - v) * image.height - 0.5] as const;

/** Pixel scale of the local file in arcseconds per pixel. */
function arcsecPerPixel(image: ObservedGalaxyImage) {
  return Math.abs(image.avm.scale[1]) * (image.avm.referenceDimension[1] / image.height) * 3600;
}
/** Image-pixel direction of position angle `pa` (east of north) at a sky position. */
function pixelAxis(image: ObservedGalaxyImage, ra: number, dec: number, paDeg: number) {
  const step = 10 / 3600;
  const pa = (paDeg * Math.PI) / 180;
  const [u0, v0] = uvOfRaDec(image, ra, dec);
  const dDec = step * Math.cos(pa),
    dRa = (step * Math.sin(pa)) / Math.cos((dec * Math.PI) / 180);
  const [u1, v1] = uvOfRaDec(image, ra + dRa, dec + dDec);
  const p0 = pixelOfUv(image, u0, v0),
    p1 = pixelOfUv(image, u1, v1);
  const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  return { x: (p1[0] - p0[0]) / len, y: (p1[1] - p0[1]) / len, pxPerArcsec: len / 10 };
}
/** Local point where the Sun's sightline through image coordinate (u, v) meets a plane. */
function sightlinePoint(model: GalaxyModel, image: ObservedGalaxyImage, u: number, v: number, normal: THREE.Vector3, offset = 0) {
  const inverse = galaxyOrientation(model).clone().invert(),
    unalign = catalogueAlignment(model).invert();
  const sun = galaxyCenter(model).negate().applyQuaternion(inverse).divideScalar(model.diskRadius);
  const direction = sceneFromIcrs(avmDirection(image.avm, u, v)).applyQuaternion(unalign).applyQuaternion(inverse);
  const t = (offset - normal.dot(sun)) / normal.dot(direction);
  return sun.clone().addScaledVector(direction, t);
}

// ------------------------------------------------------------------------------------------
// Processing steps
// ------------------------------------------------------------------------------------------
/** Sky level and noise from the darkest quartile of the frame border. */
function skyAndNoise(img: RGB) {
  const { w, h } = img;
  const band = Math.max(8, Math.round(Math.min(w, h) * 0.03));
  const idx: number[] = [];
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) if (x < band || y < band || x >= w - band || y >= h - band) idx.push(y * w + x);
  const level = img.c.map((p) => percentile(idx.map((i) => p[i]), 0.25)) as [number, number, number];
  const lum = idx.map((i) => luma(img.c[0][i] - level[0], img.c[1][i] - level[1], img.c[2][i] - level[2]));
  const med = percentile(lum, 0.5);
  const mad = percentile(lum.map((v) => Math.abs(v - med)), 0.5);
  return { level, noise: Math.max(1e-5, 1.4826 * mad) };
}

type StarReport = { x: number; y: number; r: number; peak: number };
/**
 * Compact, non-H II point sources that stand far above the local galaxy light: foreground
 * stars (and their diffraction spikes) and compact background objects.
 */
function findPointSources(img: RGB, noise: number, strength: number, minPeak: number, keepBlue = true): { mask: Plane; stars: StarReport[] } {
  const { w, h, c } = img;
  const n = w * h;
  const Y = new Float32Array(n);
  for (let i = 0; i < n; i++) Y[i] = luma(c[0][i], c[1][i], c[2][i]);
  const core = blur(Y, w, h, 0.8);
  // Robust local background: clip bright peaks, then blur widely.
  let bg = blur(Y, w, h, 9);
  for (let pass = 0; pass < 2; pass++) {
    const clipped = new Float32Array(n);
    for (let i = 0; i < n; i++) clipped[i] = Math.min(Y[i], bg[i] * 1.25 + 2 * noise);
    bg = blur(clipped, w, h, 9);
  }
  const mask = new Float32Array(n);
  const stars: StarReport[] = [];
  const RING = 16;
  const ringX = Array.from({ length: RING }, (_, k) => Math.round(Math.cos((k / RING) * Math.PI * 2) * 3.6));
  const ringY = Array.from({ length: RING }, (_, k) => Math.round(Math.sin((k / RING) * Math.PI * 2) * 3.6));
  for (let y = 6; y < h - 6; y++)
    for (let x = 6; x < w - 6; x++) {
      const i = y * w + x;
      const excess = core[i] - bg[i];
      // Far above both the noise and the surrounding galaxy light.
      if (excess < Math.max(14 * noise, minPeak) || excess < (1.3 / strength) * bg[i]) continue;
      let peak = true;
      for (let dy = -2; dy <= 2 && peak; dy++)
        for (let dx = -2; dx <= 2; dx++) if ((dx || dy) && core[i + dy * w + dx] > core[i]) peak = false;
      if (!peak) continue;
      // Compactness: an unresolved point leaves almost nothing in a ring 3.6 px out, whereas
      // H II regions and associations at these distances are resolved.
      let ring = 0;
      for (let k = 0; k < RING; k++) ring += core[i + ringY[k] * w + ringX[k]] - bg[i + ringY[k] * w + ringX[k]];
      ring /= RING;
      if (excess < (4.5 / strength) * Math.max(ring, 0)) continue;
      let r = 0,
        g = 0,
        b = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const j = i + dy * w + dx;
          r += c[0][j] - bg[j];
          g += c[1][j] - bg[j];
          b += c[2][j] - bg[j];
        }
      const s = Math.abs(r) + Math.abs(g) + Math.abs(b) + 1e-6;
      const saturated = core[i] > 0.6;
      // H-alpha regions are magenta (R and B above G); young clusters are blue. Both stay,
      // unless the source is a saturated point, which in these images is a foreground star.
      if (!saturated && (r - g) / s > 0.02 && (b - g) / s > -0.04) continue;
      if (keepBlue && !saturated && (b - r) / s > 0.05) continue;
      // Radius: walk outward until the excess falls near the background.
      let radius = 1.5;
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        let rr = 1;
        for (; rr < 60; rr++) {
          const px = Math.round(x + Math.cos(a) * rr),
            py = Math.round(y + Math.sin(a) * rr);
          if (px < 0 || py < 0 || px >= w || py >= h) break;
          const j = py * w + px;
          if (Y[j] - bg[j] < Math.max(2 * noise, 0.12 * excess)) break;
        }
        radius = Math.max(radius, rr);
      }
      radius = Math.min(90, radius * (core[i] > 0.5 ? 1.9 : 1.5) + 2);
      stars.push({ x, y, r: radius, peak: core[i] });
      const rr = Math.ceil(radius + 2);
      for (let dy = -rr; dy <= rr; dy++)
        for (let dx = -rr; dx <= rr; dx++) {
          const px = x + dx,
            py = y + dy;
          if (px < 0 || py < 0 || px >= w || py >= h) continue;
          const d = Math.hypot(dx, dy);
          const m = 1 - smoothstep(radius, radius + 2, d);
          const j = py * w + px;
          if (m > mask[j]) mask[j] = m;
        }
      // Diffraction spikes of bright saturated stars: mask narrow rays where they stay bright.
      if (core[i] > 0.75 && radius > 5) {
        for (let k = 0; k < 72; k++) {
          const a = (k / 72) * Math.PI * 2;
          const ca = Math.cos(a),
            sa = Math.sin(a);
          let run = 0;
          for (let rr = Math.ceil(radius); rr < radius * 9; rr++) {
            const px = Math.round(x + ca * rr),
              py = Math.round(y + sa * rr);
            if (px < 1 || py < 1 || px >= w - 1 || py >= h - 1) break;
            const j = py * w + px;
            // A spike pixel is brighter than its local background and its own sides.
            const side =
              0.5 *
              (Y[Math.round(py + ca * 3) * w + Math.round(px - sa * 3)] + Y[Math.round(py - ca * 3) * w + Math.round(px + sa * 3)]);
            if (Y[j] - Math.max(bg[j], side) > Math.max(3 * noise, 0.08 * bg[j])) run = rr;
            else if (rr - run > 4) break;
          }
          if (run > radius * 1.6)
            for (let rr = Math.ceil(radius); rr <= run + 2; rr++)
              for (let t = -2; t <= 2; t++) {
                const px = Math.round(x + ca * rr - sa * t),
                  py = Math.round(y + sa * rr + ca * t);
                if (px < 0 || py < 0 || px >= w || py >= h) continue;
                const j = py * w + px;
                mask[j] = Math.max(mask[j], 1 - Math.abs(t) / 3);
              }
        }
      }
    }
  return { mask, stars };
}

/** Local dust optical depth along the sightline from reddened, local darkening. */
function measureDust(img: RGB, noise: number, sigmaPx: number) {
  const { w, h, c } = img;
  const n = w * h;
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) raw[i] = luma(c[0][i], c[1][i], c[2][i]);
  // Resolved stars and clusters make the disk grainy; lanes are coherent over several pixels.
  const fine = Math.max(1.2, sigmaPx * 0.08);
  const Y = blur(raw, w, h, fine);
  const smooth = blur(Y, w, h, sigmaPx);
  // Upper envelope: dark lanes are filled in, bright knots are clipped so they do not
  // raise the reference level around themselves.
  const clipped = new Float32Array(n);
  for (let i = 0; i < n; i++) clipped[i] = Math.min(Math.max(Y[i], smooth[i]), smooth[i] * 1.2);
  const envelope = blur(clipped, w, h, sigmaPx * 0.8);
  const red = blur(c[0], w, h, fine),
    blue = blur(c[2], w, h, fine);
  const ratio = new Float32Array(n);
  for (let i = 0; i < n; i++) ratio[i] = Math.log((blue[i] + noise) / (red[i] + noise));
  const ratioSmooth = blur(ratio, w, h, sigmaPx * 1.5);
  const floor = 3 * noise;
  const tau = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const significant = smoothstep(8 * noise, 25 * noise, envelope[i]);
    const dark = Math.log((envelope[i] + floor) / (Y[i] + floor));
    // Dust reddens what it dims: B/R falls inside lanes. Dark, unreddened gaps between
    // clusters keep only a small share.
    const reddening = ratioSmooth[i] - ratio[i];
    const colour = 0.12 + 0.88 * smoothstep(0.015, 0.16, reddening);
    tau[i] = Math.max(0, dark - 0.07) * colour * significant;
  }
  return blur(tau, w, h, Math.max(0.8, fine * 0.7));
}

type PartMeta = {
  id: string;
  label: string;
  source: string;
  /** Photograph uv rectangle of the crop (v up). */
  uvRect: [number, number, number, number];
  /** Atlas uv rectangle of the crop (v up). */
  atlasRect: [number, number, number, number];
  /** Elliptical radius in photograph uv: rho^2 = (A·d)^2 + (B·d)^2 with d = uv − centre. */
  centreUv: [number, number];
  axisA: [number, number];
  axisB: [number, number];
  /** Depth centre along Earth's sightline (disk radii, positive toward Earth) and half-extent. */
  depthCentre: number;
  depthExtent: number;
  /** Local-frame centre (disk radii) for bounds. */
  centre: [number, number, number];
  radius: number;
  /** Local units (disk radii) per atlas texel. */
  texel: number;
};
type MapMeta = {
  key: string;
  image: string;
  extent: number;
  detail: { url: string; size: number; scale: number };
  smooth: { url: string; size: number; scale: number };
  dust: { url: string; size: number; tauMax: number; encoding: "sqrt" };
  parts: { url: string; width: number; height: number; scale: number; items: PartMeta[] } | null;
  /** Exponential fits (photo units, disk radii) for continuing the disk outside the frame. */
  profile: { old: [number, number]; young: [number, number]; dust: [number, number] };
  colours: { old: [number, number, number]; young: [number, number, number] };
  stars: number;
  note: string;
};

async function deriveOne(config: Config, check: boolean): Promise<MapMeta> {
  const model = GALAXY_MODELS.find((m) => m.key === config.key);
  const image = OBSERVED_IMAGE_BY_KEY.get(config.key);
  if (!model || !image) throw Error("Missing model or image " + config.key);
  if (image.surface !== "disk") throw Error(config.key + " is not a disk-surface image");
  const file = path.join(ROOT, "public", image.url);
  const photo = await readImage(file);
  if (photo.w !== image.width || photo.h !== image.height) throw Error("Unexpected size " + config.key);
  const { w, h } = photo;
  const n = w * h;
  const { level, noise } = skyAndNoise(photo);
  for (let k = 0; k < 3; k++) for (let i = 0; i < n; i++) photo.c[k][i] = Math.max(0, photo.c[k][i] - level[k]);

  // Scale of the disk in this file.
  const arcsec = arcsecPerPixel(image);
  const radiusArcsec = ((model.diskRadius / model.distance) * 180 * 3600) / Math.PI;
  const pxPerR = radiusArcsec / arcsec;

  // 1. Foreground stars and listed objects.
  const { mask, stars } = config.starContrast === 0 ? { mask: new Float32Array(n), stars: [] } : findPointSources(photo, noise, config.starContrast ?? 1, config.starMinPeak ?? 0.22, config.starKeepBlue ?? true);
  for (const m of config.masks ?? []) {
    const rr = Math.ceil(m.r + 3);
    for (let dy = -rr; dy <= rr; dy++)
      for (let dx = -rr; dx <= rr; dx++) {
        const x = Math.round(m.x + dx),
          y = Math.round(m.y + dy);
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const v = 1 - smoothstep(m.r, m.r + 3, Math.hypot(dx, dy));
        mask[y * w + x] = Math.max(mask[y * w + x], v);
      }
  }
  const keep = new Float32Array(n);
  for (let i = 0; i < n; i++) keep[i] = 1 - mask[i];
  const filled = pushPull(photo.c, keep, w, h);
  const clean: RGB = { w, h, c: [filled[0], filled[1], filled[2]] };
  // Restore unmasked pixels exactly and blend the soft mask edge.
  for (let k = 0; k < 3; k++) for (let i = 0; i < n; i++) clean.c[k][i] = photo.c[k][i] * keep[i] + filled[k][i] * mask[i];

  // 2. Dust along the sightline (image plane) and partial restoration of the light behind it.
  const sigmaDust = Math.max(2, 0.011 * pxPerR);
  const tauLos = measureDust(clean, noise, sigmaDust);
  // Inpainted stars leave smooth patches whose surroundings read as false dust rings.
  const near = blur(mask, w, h, 4);
  for (let i = 0; i < n; i++) tauLos[i] *= 1 - smoothstep(0.01, 0.08, near[i]);
  const restored: RGB = { w, h, c: [new Float32Array(n), new Float32Array(n), new Float32Array(n)] };
  for (let i = 0; i < n; i++) {
    const t = Math.min(1.6, tauLos[i]);
    for (let k = 0; k < 3; k++) restored.c[k][i] = clean.c[k][i] * Math.exp(0.55 * t * REDDENING[k]);
  }

  // 3. Compact spheroids become separate sightline-extruded parts.
  const earth = earthDirectionLocal(model);
  const diskWeight = new Float32Array(n).fill(1);
  const partPlanes: { cfg: Part; weight: Plane; box: [number, number, number, number]; meta: Omit<PartMeta, "atlasRect" | "texel"> }[] = [];
  for (const part of config.parts) {
    const [cu, cv] = uvOfRaDec(image, part.ra, part.dec);
    const [cx, cy] = pixelOfUv(image, cu, cv);
    const axis = pixelAxis(image, part.ra, part.dec, part.paDeg);
    const a = part.semiMajorArcsec * axis.pxPerArcsec,
      b = a * part.axisRatio;
    const weight = new Float32Array(n);
    const reach = Math.ceil(a * 1.05);
    const x0 = Math.max(0, Math.floor(cx - reach)),
      x1 = Math.min(w, Math.ceil(cx + reach) + 1),
      y0 = Math.max(0, Math.floor(cy - reach)),
      y1 = Math.min(h, Math.ceil(cy + reach) + 1);
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const dx = x - cx,
          dy = y - cy;
        const along = dx * axis.x + dy * axis.y,
          across = -dx * axis.y + dy * axis.x;
        const rho = Math.hypot(along / a, across / b);
        // Parts cut by the photograph's border fade out instead of ending on a straight edge.
        const border = Math.min(x, y, w - 1 - x, h - 1 - y) / Math.min(w, h);
        const wt = (1 - smoothstep(part.taper, 1, rho)) * smoothstep(0, 0.03, border);
        const i = y * w + x;
        weight[i] = wt * diskWeight[i];
        diskWeight[i] -= weight[i];
      }
    // Elliptical radius in uv: d = (du, dv); pixel offsets dx = W du, dy = −H dv.
    const axisA: [number, number] = [(w * axis.x) / a, (-h * axis.y) / a];
    const axisB: [number, number] = [(w * -axis.y) / b, (-h * axis.x) / b];
    const aLocal = a / pxPerR;
    const onDisk = sightlinePoint(model, image, cu, cv, new THREE.Vector3(0, 1, 0));
    const depthCentre = part.behindDisk !== undefined ? onDisk.dot(earth) - part.behindDisk : 0;
    const centre = sightlinePoint(model, image, cu, cv, earth, depthCentre);
    partPlanes.push({
      cfg: part,
      weight,
      box: [x0, y0, x1, y1],
      meta: {
        id: part.id,
        label: part.label,
        source: part.source,
        uvRect: [x0 / w, 1 - y1 / h, x1 / w, 1 - y0 / h],
        centreUv: [cu, cv],
        axisA,
        axisB,
        depthCentre,
        depthExtent: aLocal * part.depth,
        centre: [centre.x, centre.y, centre.z],
        radius: aLocal * 1.05,
      },
    });
  }

  // Spheroids keep only their smooth light; clumpy structure in front of them (arms, H II
  // regions, the nucleus' own dust) stays in the thin disk.
  const partLight: Plane[][] = [];
  const residual: Plane[] = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  for (const p of partPlanes) {
    const [x0, y0, x1, y1] = p.box;
    const bw = x1 - x0,
      bh = y1 - y0;
    const axis = pixelAxis(image, p.cfg.ra, p.cfg.dec, p.cfg.paDeg);
    const sigma = Math.max(2, (p.cfg.smooth ?? 0.1) * p.cfg.semiMajorArcsec * axis.pxPerArcsec);
    const planes = restored.c.map((plane) => {
      const crop = new Float32Array(bw * bh);
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) crop[y * bw + x] = plane[(y + y0) * w + x + x0];
      let env = blur(crop, bw, bh, sigma);
      for (let pass = 0; pass < 2; pass++) {
        const lower = new Float32Array(bw * bh);
        for (let i = 0; i < bw * bh; i++) lower[i] = Math.min(crop[i], env[i]);
        env = blur(lower, bw, bh, sigma);
      }
      return { crop, env };
    });
    const light: Plane[] = planes.map(() => new Float32Array(bw * bh));
    for (let y = 0; y < bh; y++)
      for (let x = 0; x < bw; x++) {
        const i = (y + y0) * w + x + x0,
          j = y * bw + x;
        const wt = p.weight[i];
        // Only clumps that are significant in brightness leave the spheroid, carrying their
        // own colour; per-channel differences (e.g. imperfectly restored dust colour) stay.
        const yc = luma(planes[0].crop[j], planes[1].crop[j], planes[2].crop[j]),
          ye = luma(planes[0].env[j], planes[1].env[j], planes[2].env[j]);
        const share = yc > 1e-6 ? Math.max(0, yc - ye * 1.07 - 4 * noise) / yc : 0;
        for (let k = 0; k < 3; k++) {
          residual[k][i] += planes[k].crop[j] * share * wt;
          light[k][j] = (planes[k].env[j] + (planes[k].crop[j] * (1 - share) - planes[k].env[j]) * 0.85) * wt;
        }
      }
    partLight.push(light);
  }

  // 4. Deproject the disk light and the dust onto the disk plane.
  const M = observedImageMatrix(model, image);
  const corners = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ].map(([u, v]) => sightlinePoint(model, image, u, v, new THREE.Vector3(0, 1, 0)));
  const reach = Math.max(...corners.map((p) => Math.max(Math.abs(p.x), Math.abs(p.z))));
  const extent = config.extent ?? Math.min(MAX_EXTENT, Math.ceil(reach * 20) / 20);
  const N = DETAIL_SIZE;
  const texel = (2 * extent) / N;
  // Pre-filter the photograph to the map's sampling (anti-aliasing for downsampled cases).
  const footprintPx = texel * pxPerR;
  const pre = Math.max(0, 0.45 * footprintPx - 0.3);
  const diskLight = clean.c.map((p, k) => {
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) out[i] = restored.c[k][i] * diskWeight[i] + residual[k][i];
    return blur(out, w, h, pre);
  });
  const tauPre = blur(tauLos, w, h, pre);
  const cosI = Math.max(0.15, Math.abs(earth.y));
  const light: RGB = { w: N, h: N, c: [new Float32Array(N * N), new Float32Array(N * N), new Float32Array(N * N)] };
  const tauFace = new Float32Array(N * N);
  const inFrame = new Float32Array(N * N);
  const v4 = new THREE.Vector4();
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) {
      const x = -extent + (i + 0.5) * texel,
        z = extent - (j + 0.5) * texel;
      v4.set(x, 0, z, 1).applyMatrix4(M);
      if (v4.z <= 0) continue;
      const u = v4.x / v4.z,
        v = v4.y / v4.z;
      if (u < 0 || v < 0 || u > 1 || v > 1) continue;
      const frame = smoothstep(0, 0.012, Math.min(u, 1 - u)) * smoothstep(0, 0.012, Math.min(v, 1 - v));
      const [px, py] = pixelOfUv(image, u, v);
      const o = j * N + i;
      inFrame[o] = frame;
      for (let k = 0; k < 3; k++) light.c[k][o] = sampleBilinear(diskLight[k], w, h, px, py) * frame * cosI;
      tauFace[o] = sampleBilinear(tauPre, w, h, px, py) * frame * cosI * 1.6 * (config.dustGain ?? 1);
    }

  // 5. Support (galaxy light above the noise) and the smooth/young split.
  const lum = new Float32Array(N * N);
  for (let o = 0; o < N * N; o++) lum[o] = luma(light.c[0][o], light.c[1][o], light.c[2][o]);
  const lumWide = blur(lum, N, N, 3);
  const lumGalaxy = blur(lum, N, N, 0.02 / texel);
  const noiseFace = noise * cosI;
  for (let o = 0; o < N * N; o++) {
    // Galaxy light on two scales: isolated points in empty sky (stars, background galaxies)
    // fail the wide-scale test even when they are bright.
    const support = smoothstep(1.5 * noiseFace, 6 * noiseFace, lumWide[o]) * smoothstep(1 * noiseFace, 4 * noiseFace, lumGalaxy[o]);
    for (let k = 0; k < 3; k++) light.c[k][o] *= support;
    tauFace[o] *= support;
  }
  // Disk-plane radius of every texel, and an outer taper (stops background objects
  // and frame fill beyond the disk).
  const radius = new Float32Array(N * N);
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) radius[j * N + i] = Math.hypot(-extent + (i + 0.5) * texel, extent - (j + 0.5) * texel);
  const rMax = config.maxRadius ?? 1.18;
  for (let o = 0; o < N * N; o++) {
    const taper = 1 - smoothstep(rMax * 0.88, rMax, radius[o]);
    for (let k = 0; k < 3; k++) light.c[k][o] *= taper;
    tauFace[o] *= taper;
  }
  // Smooth (older) light: a lower envelope that ignores everything outside the frame, so
  // the frame edge does not pull it down.
  const sigmaSmooth = 0.03 / texel;
  const frameBlur = (p: Plane) => maskedBlur(p, inFrame, N, N, sigmaSmooth);
  let env = light.c.map(frameBlur);
  for (let pass = 0; pass < 2; pass++)
    env = light.c.map((p, k) => {
      const lower = new Float32Array(N * N);
      for (let o = 0; o < N * N; o++) lower[o] = Math.min(p[o], env[k][o]);
      return frameBlur(lower);
    });
  const young: RGB = { w: N, h: N, c: [new Float32Array(N * N), new Float32Array(N * N), new Float32Array(N * N)] };
  for (let k = 0; k < 3; k++)
    for (let o = 0; o < N * N; o++) young.c[k][o] = inFrame[o] > 0 ? Math.max(0, light.c[k][o] - env[k][o]) : 0;
  // Isolated point-like peaks (foreground stars that survived detection) would become thin
  // bright spikes when the young layer is given depth; clamp them to a few times their
  // surroundings. Clusters and H II regions spread over several texels keep their contrast.
  {
    const ylum = new Float32Array(N * N);
    for (let o = 0; o < N * N; o++) ylum[o] = luma(young.c[0][o], young.c[1][o], young.c[2][o]);
    const local = blur(ylum, N, N, 12);
    for (let o = 0; o < N * N; o++) {
      const limit = 5 * local[o] + 2 * noise;
      if (ylum[o] > limit) for (let k = 0; k < 3; k++) young.c[k][o] *= limit / ylum[o];
    }
  }
  const envLum = new Float32Array(N * N),
    youngLum = new Float32Array(N * N);
  for (let o = 0; o < N * N; o++) {
    envLum[o] = luma(env[0][o], env[1][o], env[2][o]);
    youngLum[o] = luma(young.c[0][o], young.c[1][o], young.c[2][o]);
  }

  // Radial profiles (azimuthal means over complete annuli inside the frame).
  const bins = 26,
    acc = Array.from({ length: bins }, () => ({ o: 0, y: 0, t: 0, n: 0, f: 0 }));
  for (let o = 0; o < N * N; o += 3) {
    const b = Math.floor((radius[o] / 1.3) * bins);
    if (b >= bins) continue;
    acc[b].n++;
    acc[b].f += inFrame[o];
    if (inFrame[o] < 0.99) continue;
    acc[b].o += envLum[o];
    acc[b].y += youngLum[o];
    acc[b].t += tauFace[o];
  }
  // Exponential continuation anchored at the outermost complete annulus: the slope is fitted
  // over the outer half of the covered radii (clamped to 0.15–0.6 disk radii, typical of
  // disk scale lengths in units of the optical radius) and the amplitude reproduces the
  // measured level at the anchor, so the continuation meets the photograph at its frame.
  const complete = acc.map((a, b) => ({
    r: ((b + 0.5) / bins) * 1.3,
    ok: a.f / Math.max(1, a.n) >= 0.85 && a.f > 0,
    a,
  }));
  const anchor = complete.filter((c) => c.ok && c.r >= 0.2).pop();
  const fit = (pick: (a: (typeof acc)[number]) => number) => {
    if (!anchor) return [0, 0.3] as [number, number];
    const value = (c: (typeof complete)[number]) => pick(c.a) / Math.max(1, c.a.f);
    let sx = 0,
      sy = 0,
      sxx = 0,
      sxy = 0,
      cnt = 0;
    for (const c of complete) {
      if (!c.ok || c.r < Math.max(0.2, anchor.r * 0.5) || c.r > anchor.r || value(c) <= 0) continue;
      const lv = Math.log(value(c));
      sx += c.r;
      sy += lv;
      sxx += c.r * c.r;
      sxy += c.r * lv;
      cnt++;
    }
    const slope = cnt >= 2 ? (cnt * sxy - sx * sy) / Math.max(1e-9, cnt * sxx - sx * sx) : -1 / 0.3;
    const scale = Math.min(0.6, Math.max(0.15, -1 / Math.min(-1e-3, slope)));
    const level = Math.max(0, value(anchor));
    return [level * Math.exp(anchor.r / scale), scale] as [number, number];
  };
  const profile =
    config.continuation === false
      ? { old: [0, 0.3] as [number, number], young: [0, 0.3] as [number, number], dust: [0, 0.3] as [number, number] }
      : { old: fit((a) => a.o), young: fit((a) => a.y), dust: fit((a) => a.t) };

  // The smooth map is stored at a quarter of the detail resolution.
  const S = SMOOTH_SIZE,
    f = N / S;
  const smooth: RGB = { w: S, h: S, c: [new Float32Array(S * S), new Float32Array(S * S), new Float32Array(S * S)] };
  for (let k = 0; k < 3; k++)
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        let sum = 0;
        for (let dy = 0; dy < f; dy++) for (let dx = 0; dx < f; dx++) sum += env[k][(j * f + dy) * N + i * f + dx];
        smooth.c[k][j * S + i] = sum / (f * f);
      }

  // Normalisation (stored so the renderer restores photograph units).
  const smoothLum = new Float32Array(S * S);
  for (let o = 0; o < S * S; o++) smoothLum[o] = luma(smooth.c[0][o], smooth.c[1][o], smooth.c[2][o]);
  const youngPeak = Math.max(1e-4, percentile(youngLum.filter((v) => v > 0), 0.9995, 3));
  const smoothPeak = Math.max(1e-4, percentile(smoothLum, 1));
  const youngScale = 0.92 / youngPeak,
    smoothScale = 0.97 / smoothPeak;

  // Part atlas.
  let partsMeta: MapMeta["parts"] = null;
  const partAtlas: { img: RGB; meta: PartMeta }[] = [];
  let partPeak = 1e-4;
  for (const p of partPlanes) {
    const [x0, y0, x1, y1] = p.box;
    const bw = x1 - x0,
      bh = y1 - y0;
    const scale = Math.min(1, PART_CELL / Math.max(bw, bh));
    const cw = Math.max(8, Math.round(bw * scale)),
      ch = Math.max(8, Math.round(bh * scale));
    const pre2 = Math.max(0, 0.45 / scale - 0.3);
    const src = partLight[partPlanes.indexOf(p)].map((plane) => blur(plane, bw, bh, pre2));
    const crop: RGB = { w: cw, h: ch, c: [new Float32Array(cw * ch), new Float32Array(cw * ch), new Float32Array(cw * ch)] };
    for (let y = 0; y < ch; y++)
      for (let x = 0; x < cw; x++)
        for (let k = 0; k < 3; k++)
          crop.c[k][y * cw + x] = sampleBilinear(src[k], bw, bh, ((x + 0.5) / cw) * bw - 0.5, ((y + 0.5) / ch) * bh - 0.5);
    for (let i = 0; i < cw * ch; i++) partPeak = Math.max(partPeak, luma(crop.c[0][i], crop.c[1][i], crop.c[2][i]));
    partAtlas.push({ img: crop, meta: { ...p.meta, atlasRect: [0, 0, 0, 0], texel: bw / pxPerR / cw } });
  }
  if (partAtlas.length) {
    const width = partAtlas.reduce((s, p) => s + p.img.w + 2, 0),
      height = Math.max(...partAtlas.map((p) => p.img.h));
    const atlas: RGB = { w: width, h: height, c: [new Float32Array(width * height), new Float32Array(width * height), new Float32Array(width * height)] };
    let x = 0;
    for (const p of partAtlas) {
      for (let y = 0; y < p.img.h; y++)
        for (let xx = 0; xx < p.img.w; xx++)
          for (let k = 0; k < 3; k++) atlas.c[k][y * width + x + xx] = p.img.c[k][y * p.img.w + xx];
      p.meta.atlasRect = [x / width, 1 - p.img.h / height, (x + p.img.w) / width, 1];
      x += p.img.w + 2;
    }
    const scale = 0.97 / partPeak;
    const url = `/textures/galaxies/derived/${config.key}-parts.jpg`;
    if (!check) await writeRgb(path.join(ROOT, "public", url), atlas, scale, 92);
    partsMeta = { url, width, height, scale, items: partAtlas.map((p) => p.meta) };
  }

  // Colours (photograph units) for the procedural continuation and for star points.
  const meanColour = (img: RGB, weight: (i: number) => number) => {
    const s = [0, 0, 0];
    let ws = 0;
    for (let i = 0; i < img.w * img.h; i += 7) {
      const wt = weight(i);
      if (wt <= 0) continue;
      for (let k = 0; k < 3; k++) s[k] += img.c[k][i] * wt;
      ws += wt;
    }
    const l = luma(s[0], s[1], s[2]) || 1;
    return s.map((v) => +(v / l).toFixed(4)) as [number, number, number];
  };
  const colours = {
    old: meanColour(smooth, (i) => smoothLum[i]),
    young: meanColour(young, (i) => youngLum[i]),
  };

  const detailUrl = `/textures/galaxies/derived/${config.key}-young.jpg`,
    smoothUrl = `/textures/galaxies/derived/${config.key}-old.jpg`,
    dustUrl = `/textures/galaxies/derived/${config.key}-dust.jpg`;
  if (!check) {
    await writeRgb(path.join(ROOT, "public", detailUrl), young, youngScale, 90);
    await writeRgb(path.join(ROOT, "public", smoothUrl), smooth, smoothScale, 92);
    await writeGray(path.join(ROOT, "public", dustUrl), tauFace, N, N, (t) => Math.sqrt(t / TAU_MAX), 92);
    fs.mkdirSync(DIAG_DIR, { recursive: true });
    await writeDiagnostic(path.join(DIAG_DIR, `${config.key}-clean.jpg`), clean, 1 / Math.max(1e-4, percentile(clean.c[1], 0.998, 13)));
    const maskView: RGB = { w, h, c: [mask, keep.map(() => 0) as Plane, keep.map(() => 0) as Plane] };
    await writeDiagnostic(path.join(DIAG_DIR, `${config.key}-mask.jpg`), maskView, 1);
    const composite: RGB = {
      w: N,
      h: N,
      c: [0, 1, 2].map((k) => {
        const out = new Float32Array(N * N);
        for (let o = 0; o < N * N; o++)
          out[o] = young.c[k][o] + smooth.c[k][Math.floor(Math.floor(o / N) / f) * S + Math.floor((o % N) / f)];
        return out;
      }) as [Plane, Plane, Plane],
    };
    await writeDiagnostic(path.join(DIAG_DIR, `${config.key}-faceon.jpg`), composite, smoothScale * 0.9);
    const tauView: RGB = { w: N, h: N, c: [tauFace, tauFace, tauFace] };
    await writeDiagnostic(path.join(DIAG_DIR, `${config.key}-tau.jpg`), tauView, 0.6);
  }
  return {
    key: config.key,
    image: image.url,
    extent,
    detail: { url: detailUrl, size: N, scale: +(1 / youngScale).toPrecision(6) },
    smooth: { url: smoothUrl, size: S, scale: +(1 / smoothScale).toPrecision(6) },
    dust: { url: dustUrl, size: N, tauMax: TAU_MAX, encoding: "sqrt" },
    parts: partsMeta
      ? {
          ...partsMeta,
          scale: +(1 / partsMeta.scale).toPrecision(6),
          items: partsMeta.items.map((p) => ({
            ...p,
            uvRect: p.uvRect.map((v) => +v.toFixed(6)) as PartMeta["uvRect"],
            atlasRect: p.atlasRect.map((v) => +v.toFixed(6)) as PartMeta["atlasRect"],
            centreUv: p.centreUv.map((v) => +v.toFixed(6)) as PartMeta["centreUv"],
            axisA: p.axisA.map((v) => +v.toPrecision(6)) as PartMeta["axisA"],
            axisB: p.axisB.map((v) => +v.toPrecision(6)) as PartMeta["axisB"],
            depthCentre: +p.depthCentre.toFixed(5),
            depthExtent: +p.depthExtent.toFixed(5),
            centre: p.centre.map((v) => +v.toFixed(5)) as PartMeta["centre"],
            radius: +p.radius.toFixed(5),
            texel: +p.texel.toPrecision(4),
          })),
        }
      : null,
    profile: {
      old: [+profile.old[0].toPrecision(5), +profile.old[1].toPrecision(4)],
      young: [+profile.young[0].toPrecision(5), +profile.young[1].toPrecision(4)],
      dust: [+profile.dust[0].toPrecision(5), +profile.dust[1].toPrecision(4)],
    },
    colours,
    stars: stars.length,
    note: "Derived from the registered image: sky-subtracted, foreground stars inpainted, dust measured from reddened local darkening, deprojected to the disk plane. A reconstruction input, not an observation.",
  };
}

async function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const keys = args.filter((a) => !a.startsWith("--"));
  const selected = CONFIGS.filter((c) => !keys.length || keys.includes(c.key));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const existing: Record<string, MapMeta> = fs.existsSync(META_FILE) ? JSON.parse(fs.readFileSync(META_FILE, "utf8")).maps ?? {} : {};
  for (const config of selected) {
    const started = Date.now();
    const meta = await deriveOne(config, check);
    if (check) {
      const before = JSON.stringify(existing[config.key]);
      if (before !== JSON.stringify(meta)) throw Error(`${config.key}: derived metadata differs from ${path.relative(ROOT, META_FILE)}`);
      console.log(`${config.key}: metadata reproduced`);
      continue;
    }
    existing[config.key] = meta;
    console.log(`${config.key}: extent ±${meta.extent} R, ${meta.stars} point sources removed, ${((Date.now() - started) / 1000).toFixed(1)} s`);
  }
  if (!check) {
    const ordered = Object.fromEntries(CONFIGS.filter((c) => existing[c.key]).map((c) => [c.key, existing[c.key]]));
    const body = { generator: "scripts/derive-galaxy-disk-maps.ts", maps: ordered };
    fs.writeFileSync(META_FILE, JSON.stringify(body, null, 2) + "\n");
    const digest = createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 12);
    console.log("Wrote", path.relative(ROOT, META_FILE), digest);
  }
}
await main();
