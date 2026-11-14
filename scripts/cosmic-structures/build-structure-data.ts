// Builds the per-structure galaxy fields rendered by src/stars/cosmic-structures/.
//   npm run cosmic:fetch   (downloads survey tables into .taste-skill/cosmic-cache/)
//   npm run cosmic:build   (writes public/data/cosmic-structures/*.bin and the generated manifest)
// Real survey directions and redshifts; distances from the Planck 2018 cosmology. Members of
// groups found by friends-of-friends have their redshift-space "fingers of God" compressed,
// and literature-defined clouds (Virgo) sit at their measured distances. Those depths, the
// orientations of galaxies without a measured position angle and the display palette are
// reconstructions, labelled as such in the manifest.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  COSMIC_BENCHMARKS,
  surveyScenePosition,
  type CosmicStructureBenchmark,
} from "../../src/lib/astronomy/cosmic-web/survey-catalogs";
import { calculateCosmologicalDistances } from "../../src/lib/astronomy/cosmology";
import { EXPLORER_GALAXIES } from "../../src/stars/exploration-galaxies";
import { getGalaxyByAnyName } from "../../src/stars/galaxy-catalog";
import { gToXYZ } from "../../src/stars/galaxy-models";
import {
  SDSS_BOXES,
  STRUCTURE_DEFINITIONS,
  SURVEY_SOURCES,
  type CatalogueId,
  type FixedGroup,
  type StructureDefinition,
} from "./structure-definitions";

const CACHE = ".taste-skill/cosmic-cache";
const OUT_DIR = "public/data/cosmic-structures";
const MANIFEST = "src/stars/cosmic-structures/structure-fields.generated.ts";
const C_KMS = 299792.458;
const LY_PER_MPC = 3.261563777e6;
const D2R = Math.PI / 180;
export const LOG_LUM_RANGE: [number, number] = [-3, 1.5]; // log10(L/L*)
export const LOG_RADIUS_RANGE: [number, number] = [-0.5, 2.5]; // log10(R90 / kpc)
const GRID = 64;

type Vec = [number, number, number];
type Galaxy = {
  ra: number;
  dec: number;
  cz: number;
  catalogue: CatalogueId;
  logLum: number;
  logRadiusKpc: number;
  redness: number;
  bulge: number;
  axisRatio: number | null;
  paDeg: number | null;
  sizeEstimated: boolean;
  unit: Vec;
  dzMpc: number; // redshift-space comoving distance
  dMpc: number; // final distance before structure scaling
  scaled?: boolean; // dMpc already in final units (fixed or anchored groups)
  group: number; // -1 none
  compressed: boolean;
  name?: string;
};

// ---------- cosmology ----------
const Z_TABLE_MAX = 0.12,
  Z_TABLE_N = 2400;
const dcTable = new Float64Array(Z_TABLE_N + 1);
for (let i = 0; i <= Z_TABLE_N; i++)
  dcTable[i] = calculateCosmologicalDistances((i / Z_TABLE_N) * Z_TABLE_MAX).comovingDistanceMpc;
function comovingMpc(z: number) {
  if (z <= 0) return Math.max(0, z) * (C_KMS / 67.4);
  const x = (z / Z_TABLE_MAX) * Z_TABLE_N,
    i = Math.min(Z_TABLE_N - 1, Math.floor(x));
  return dcTable[i] + (dcTable[i + 1] - dcTable[i]) * (x - i);
}
/** Redshift-space distance; negative velocities (blueshifted Virgo members) clamp near zero. */
const czToMpc = (cz: number) => (cz <= 0 ? 0.5 : comovingMpc(cz / C_KMS));

// ---------- geometry ----------
const unitOf = (ra: number, dec: number): Vec => surveyScenePosition(ra, dec, 1) as Vec;
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a: Vec): Vec => scale(a, 1 / Math.hypot(...a));
function sepDeg(ra1: number, de1: number, ra2: number, de2: number) {
  const c =
    Math.sin(de1 * D2R) * Math.sin(de2 * D2R) +
    Math.cos(de1 * D2R) * Math.cos(de2 * D2R) * Math.cos((ra1 - ra2) * D2R);
  return Math.acos(Math.min(1, Math.max(-1, c))) / D2R;
}
/** Equatorial north and east unit vectors at (ra, dec), in scene axes. */
function skyBasis(ra: number, dec: number) {
  const north = norm(sub(unitOf(ra, dec + 0.01), unitOf(ra, dec - 0.01)));
  const east = norm(sub(unitOf(ra + 0.01, dec), unitOf(ra - 0.01, dec)));
  return { north, east };
}
function hash(a: number, b: number, salt = 0) {
  let h =
    Math.imul(Math.round(a * 36000) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.round(b * 36000 + salt * 7919);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- catalogue parsing ----------
function readTsv(file: string) {
  const lines = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"));
  const header = lines[0].split("\t").map((h) => h.trim());
  return lines.slice(3).map((line) => {
    const cells = line.split("\t");
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()]));
  });
}
function readCsv(file: string) {
  const lines = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"));
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""]));
  });
}
const num = (v: string | undefined) => (v === undefined || v.trim() === "" ? NaN : Number(v));
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Approximate L* absolute magnitudes for display weighting only (h = 0.674):
// r: Blanton et al. (2003) M* - 5 log h = -20.44; K: Kochanek et al. (2001) -23.39.
const M_STAR = { r: -20.44 + 5 * Math.log10(0.674), K: -23.39 + 5 * Math.log10(0.674) };

function luminosity(appMag: number, cz: number, band: "r" | "K") {
  const z = Math.max(cz, 300) / C_KMS;
  const dl = comovingMpc(z) * (1 + z) * 1e6; // pc
  const M = appMag - 5 * Math.log10(dl / 10);
  return -0.4 * (M - M_STAR[band]);
}
function radiusKpc(arcsec: number, cz: number) {
  const z = Math.max(cz, 300) / C_KMS;
  const da = (comovingMpc(z) / (1 + z)) * 1000; // kpc
  return arcsec * da * (Math.PI / 648000);
}

/** de Vaucouleurs-style T type → display redness and bulge fraction (labelled palette). */
function morphology(type: string) {
  const t = parseInt(type, 10);
  if (!Number.isFinite(t) || t > 11) return { redness: 0.62, bulge: 0.5, known: false };
  if (t <= -3) return { redness: 0.95, bulge: 0.95, known: true };
  if (t <= 0) return { redness: 0.86, bulge: 0.7, known: true };
  if (t <= 2) return { redness: 0.7, bulge: 0.45, known: true };
  if (t <= 4) return { redness: 0.5, bulge: 0.28, known: true };
  if (t <= 6) return { redness: 0.32, bulge: 0.14, known: true };
  return { redness: 0.18, bulge: 0.05, known: true };
}

function load2mrs(): Galaxy[] {
  return readTsv(path.join(CACHE, "2mrs.tsv"))
    .map((r) => {
      const ra = num(r.RAJ2000),
        dec = num(r.DEJ2000),
        cz = num(r.cz),
        k = num(r.Kcmag),
        rext = num(r.Rext),
        ba = num(r["b/a"]);
      if (![ra, dec, cz, k].every(Number.isFinite)) return null;
      const m = morphology(r.type);
      const g: Galaxy = {
        ra,
        dec,
        cz,
        catalogue: "2mrs",
        logLum: luminosity(k, cz, "K"),
        // Rext is log10 of the extrapolated K-band radius in arcsec (Huchra et al. 2012).
        logRadiusKpc: Number.isFinite(rext)
          ? Math.log10(Math.max(0.3, radiusKpc(10 ** rext, cz)))
          : NaN,
        redness: m.redness,
        bulge: m.bulge,
        axisRatio: Number.isFinite(ba) && ba > 0 ? ba : null,
        paDeg: null,
        sizeEstimated: !Number.isFinite(rext),
        unit: unitOf(ra, dec),
        dzMpc: 0,
        dMpc: 0,
        group: -1,
        compressed: false,
        name: r.SimbadName?.replace(/_+/g, " ").trim() || undefined,
      };
      return g;
    })
    .filter((g): g is Galaxy => g !== null);
}

function loadSdss(box: keyof typeof SDSS_BOXES): Galaxy[] {
  const files = fs
    .readdirSync(CACHE)
    .filter((f) => f.startsWith(`sdss-${box}-`))
    .map((f) => path.join(CACHE, f));
  assert(files.length, `missing SDSS ${box} tables; run npm run cosmic:fetch`);
  const out: Galaxy[] = [];
  for (const file of files)
    for (const r of readCsv(file)) {
      const ra = num(r.ra),
        dec = num(r.dec),
        z = num(r.z),
        mr = num(r.petroMag_r) - num(r.extinction_r);
      if (![ra, dec, z, mr].every(Number.isFinite) || mr <= 0 || mr > 19) continue;
      const cz = z * C_KMS;
      const gr =
        num(r.modelMag_g) - num(r.extinction_g) - (num(r.modelMag_r) - num(r.extinction_r));
      const fracDeV = clamp01(num(r.fracDeV_r));
      const ba = fracDeV > 0.5 ? num(r.deVAB_r) : num(r.expAB_r);
      const pa = fracDeV > 0.5 ? num(r.deVPhi_r) : num(r.expPhi_r);
      const r90 = num(r.petroR90_r);
      out.push({
        ra,
        dec,
        cz,
        catalogue: "sdss",
        logLum: luminosity(mr, cz, "r"),
        logRadiusKpc: r90 > 0 ? Math.log10(Math.max(0.3, radiusKpc(r90, cz))) : NaN,
        // Rest-frame g-r ≈ observed - z (rough k-correction); 0.40 blue cloud → 0.80 red sequence.
        redness: Number.isFinite(gr) ? clamp01((gr - z - 0.4) / 0.4) : 0.6,
        bulge: Number.isFinite(fracDeV) ? fracDeV : 0.5,
        axisRatio: ba > 0.05 && ba <= 1 ? ba : null,
        paDeg: Number.isFinite(pa) ? pa : null,
        sizeEstimated: !(r90 > 0),
        unit: unitOf(ra, dec),
        dzMpc: 0,
        dMpc: 0,
        group: -1,
        compressed: false,
      });
    }
  return out;
}

function load6df(box: string): Galaxy[] {
  return readTsv(path.join(CACHE, `6dfgs-${box}.tsv`))
    .map((r) => {
      const ra = num(r._RAJ2000),
        dec = num(r._DEJ2000),
        cz = num(r.cz),
        bj = num(r.bJmag),
        rf = num(r.rFmag);
      if (![ra, dec, cz, rf].every(Number.isFinite)) return null;
      const colour = Number.isFinite(bj) ? bj - rf : NaN;
      const redness = Number.isFinite(colour) ? clamp01((colour - 0.9) / 0.55) : 0.6;
      const logLum = luminosity(rf, cz, "r"); // photographic rF treated as r for display weighting
      const g: Galaxy = {
        ra,
        dec,
        cz,
        catalogue: "6dfgs",
        logLum,
        // No size or shape in 6dFGS DR3: R90 ≈ 12 kpc (L/L*)^0.3 (size–luminosity scaling, Shen et al. 2003).
        logRadiusKpc: Math.log10(12) + 0.3 * logLum,
        redness,
        bulge: 0.15 + 0.7 * redness,
        axisRatio: null,
        paDeg: null,
        sizeEstimated: true,
        unit: unitOf(ra, dec),
        dzMpc: 0,
        dMpc: 0,
        group: -1,
        compressed: false,
      };
      return g;
    })
    .filter((g): g is Galaxy => g !== null);
}

// ---------- selection ----------
function benchmarkCentre(b: CosmicStructureBenchmark) {
  return gToXYZ(b.l, b.b, b.distanceGlyPlanck * 1e9);
}
function inRegion(def: StructureDefinition, g: Galaxy, centreUnit: Vec, centreMpc: number) {
  const r = def.region;
  if (r.kind === "cone") return sepDeg(r.centre[0], r.centre[1], g.ra, g.dec) <= r.radiusDeg;
  if (r.kind === "box")
    return g.ra >= r.ra[0] && g.ra <= r.ra[1] && g.dec >= r.dec[0] && g.dec <= r.dec[1];
  const p = scale(g.unit, czToMpc(g.cz));
  return Math.hypot(...sub(p, scale(centreUnit, centreMpc))) <= r.radiusMpc;
}

/** Cross-match: drop lower-priority records within 6″ and 300 km/s of a kept one. */
function mergeCatalogues(lists: Galaxy[][]) {
  const kept: Galaxy[] = [];
  const cell = (g: Galaxy) => `${Math.floor(g.ra * 20)}:${Math.floor(g.dec * 20)}`;
  const index = new Map<string, Galaxy[]>();
  let dropped = 0;
  for (const list of lists)
    for (const g of list) {
      let duplicate = false;
      const [cx, cy] = [Math.floor(g.ra * 20), Math.floor(g.dec * 20)];
      for (let dx = -1; dx <= 1 && !duplicate; dx++)
        for (let dy = -1; dy <= 1 && !duplicate; dy++)
          for (const k of index.get(`${cx + dx}:${cy + dy}`) ?? [])
            if (Math.abs(k.cz - g.cz) < 300 && sepDeg(k.ra, k.dec, g.ra, g.dec) < 6 / 3600) {
              duplicate = true;
              if (!k.name && g.name) k.name = g.name;
              break;
            }
      if (duplicate) {
        dropped++;
        continue;
      }
      kept.push(g);
      const key = cell(g);
      index.set(key, [...(index.get(key) ?? []), g]);
    }
  return { kept, dropped };
}

/** OVU atlas galaxies with catalogue coordinates (rendered by the galaxy system itself). */
const ATLAS = EXPLORER_GALAXIES.map((g) => {
  const c = getGalaxyByAnyName(g.name);
  if (!c || typeof c.ra !== "number" || typeof c.dec !== "number") return null;
  const v =
    c.radialVelocityKmS ?? (typeof c.redshift === "number" ? c.redshift * C_KMS : undefined);
  return {
    name: g.name,
    ra: c.ra,
    dec: c.dec,
    cz: v,
    distanceLy: g.distance,
    position: gToXYZ(c.l, c.b, g.distance),
  };
}).filter((a): a is NonNullable<typeof a> => a !== null);

function atlasMatch(g: Galaxy) {
  for (const a of ATLAS) {
    if (a.cz !== undefined && Math.abs(a.cz - g.cz) > 500) continue;
    if (Math.abs(a.dec - g.dec) > 0.03) continue;
    if (sepDeg(a.ra, a.dec, g.ra, g.dec) < 1.2 / 60) return a;
  }
  return null;
}

// ---------- groups ----------
function friendsOfFriends(gals: Galaxy[], perpMpc: number, losKmS: number) {
  const order = gals.map((_, i) => i).sort((a, b) => gals[a].cz - gals[b].cz);
  const parent = gals.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) i = parent[i] = parent[parent[i]];
    return i;
  };
  for (let a = 0; a < order.length; a++) {
    const i = order[a],
      gi = gals[i];
    for (let b = a + 1; b < order.length; b++) {
      const j = order[b],
        gj = gals[j];
      if (gj.cz - gi.cz > losKmS) break;
      const mean = 0.5 * (gi.dzMpc + gj.dzMpc);
      const c = dot(gi.unit, gj.unit);
      if (mean * Math.sqrt(Math.max(0, 2 - 2 * c)) <= perpMpc) {
        const ri = find(i),
          rj = find(j);
        if (ri !== rj) parent[ri] = rj;
      }
    }
  }
  const groups = new Map<number, number[]>();
  gals.forEach((_, i) => {
    const r = find(i);
    groups.set(r, [...(groups.get(r) ?? []), i]);
  });
  return [...groups.values()];
}

/** Compress a group's line-of-sight spread so it matches its projected (transverse) spread. */
function compress(members: Galaxy[], centreMpc?: number, depthRmsMpc?: number) {
  const n = members.length;
  const meanCz = members.reduce((s, g) => s + g.cz, 0) / n;
  const sigmaCz = Math.max(
    30,
    Math.sqrt(members.reduce((s, g) => s + (g.cz - meanCz) ** 2, 0) / n),
  );
  const u = norm(members.reduce<Vec>((s, g) => add(s, g.unit), [0, 0, 0]));
  const dGroup = centreMpc ?? czToMpc(meanCz);
  const rPerp2 =
    members.reduce((s, g) => s + dGroup * dGroup * Math.max(0, 2 - 2 * dot(g.unit, u)), 0) / n;
  const sigmaLos = depthRmsMpc ?? Math.max(0.05, Math.sqrt(rPerp2 / 2));
  for (const g of members) {
    g.dMpc = dGroup + ((g.cz - meanCz) / sigmaCz) * sigmaLos;
    g.compressed = true;
  }
  return { meanCz, sigmaCz, dGroup, sigmaLos, unit: u };
}

// ---------- orientation ----------
/** Disk normal consistent with the measured axis ratio and position angle as seen from Earth. */
function diskNormal(g: Galaxy): { normal: Vec; intrinsic: number } {
  const los = g.unit;
  const { north, east } = skyBasis(g.ra, g.dec);
  const pa = (g.paDeg ?? hash(g.ra, g.dec, 1) * 180) * D2R;
  const minor = add(scale(north, -Math.sin(pa)), scale(east, Math.cos(pa))); // ⟂ major axis on the sky
  const q = g.axisRatio ?? 0.3 + 0.7 * hash(g.ra, g.dec, 2);
  const spheroid = g.bulge > 0.6;
  // Thin disks (q0 = 0.2): cos² i = (q² − q0²)/(1 − q0²). Spheroids: an oblate body seen edge-on.
  const intrinsic = spheroid ? Math.max(0.3, q) : 0.2;
  const cosI = spheroid ? 0 : Math.sqrt(clamp01((q * q - 0.04) / 0.96));
  const sinI = Math.sqrt(1 - cosI * cosI);
  const s1 = hash(g.ra, g.dec, 3) < 0.5 ? -1 : 1,
    s2 = hash(g.ra, g.dec, 4) < 0.5 ? -1 : 1;
  return { normal: norm(add(scale(los, cosI * s1), scale(minor, sinI * s2))), intrinsic };
}

/** 0 at the survey selection's edge, 1 inside, so no hard box or cone edges show. */
function edgeFade(def: StructureDefinition, g: Galaxy, localPosition: Vec) {
  const smooth = (x: number, w: number) => {
    const t = clamp01(x / w);
    return t * t * (3 - 2 * t);
  };
  const r = def.region;
  let sky = 1;
  if (r.kind === "box") {
    const cosDec = Math.cos(g.dec * D2R);
    const margin = Math.min(
      Math.min(g.ra - r.ra[0], r.ra[1] - g.ra) * cosDec,
      g.dec - r.dec[0],
      r.dec[1] - g.dec,
    );
    sky = smooth(margin, 0.3 * Math.min((r.ra[1] - r.ra[0]) * cosDec, r.dec[1] - r.dec[0]));
  } else if (r.kind === "cone") {
    sky = smooth(r.radiusDeg - sepDeg(r.centre[0], r.centre[1], g.ra, g.dec), 0.2 * r.radiusDeg);
  } else {
    sky = smooth(r.radiusMpc - Math.hypot(...localPosition) / LY_PER_MPC, 0.2 * r.radiusMpc);
  }
  const span = def.cz[1] - def.cz[0];
  const depth = g.compressed ? 1 : smooth(Math.min(g.cz - def.cz[0], def.cz[1] - g.cz), 0.3 * span);
  return sky * depth;
}

// ---------- build ----------
function quantise(v: number, [lo, hi]: [number, number]) {
  return Math.round(clamp01((v - lo) / (hi - lo)) * 255);
}

function buildStructure(def: StructureDefinition, catalogues: Record<string, Galaxy[]>) {
  const bench = COSMIC_BENCHMARKS.find((b) => b.id === def.id);
  assert(bench, `no benchmark ${def.id}`);
  const centre = benchmarkCentre(bench);
  const centreVec: Vec = [centre.x, centre.y, centre.z];
  const centreUnit = norm(centreVec);
  const centreMpc = Math.hypot(...centreVec) / LY_PER_MPC;
  // Field distances are scaled so the benchmark redshift lands on the benchmark distance.
  const benchScale =
    (bench.distanceGlyPlanck * 1e9) / LY_PER_MPC / czToMpc(bench.meanRedshift * C_KMS);

  const lists = def.catalogues.map(({ id, box }) =>
    (id === "2mrs" ? catalogues["2mrs"] : catalogues[`${id}:${box}`]).filter(
      (g) => g.cz >= def.cz[0] && g.cz <= def.cz[1],
    ),
  );
  const merged = mergeCatalogues(lists);
  const counts = Object.fromEntries(def.catalogues.map(({ id }, i) => [id, lists[i].length]));
  let gals = merged.kept.map((g) => ({ ...g, unit: g.unit.slice() as Vec }));
  for (const g of gals) g.dzMpc = czToMpc(g.cz);
  gals = gals.filter((g) => inRegion(def, g, centreUnit, centreMpc));

  // Atlas galaxies are drawn by the galaxy system; drop their survey duplicates.
  const atlasHits = new Map<string, (typeof ATLAS)[number]>();
  gals = gals.filter((g) => {
    const a = atlasMatch(g);
    if (a) atlasHits.set(a.name, a);
    return !a;
  });

  // Literature clouds at adopted distances.
  const fixedSummaries: { name: string; members: number; source: string }[] = [];
  for (const fg of def.fixedGroups ?? []) {
    const members = gals.filter(
      (g) =>
        !g.compressed &&
        g.cz >= fg.cz[0] &&
        g.cz <= fg.cz[1] &&
        sepDeg(fg.centre[0], fg.centre[1], g.ra, g.dec) <= fg.radiusDeg,
    );
    const anchor = fg.anchor ? ATLAS.find((a) => a.name === fg.anchor) : undefined;
    const distanceMpc = anchor ? anchor.distanceLy / LY_PER_MPC : fg.distanceMpc;
    if (members.length) compress(members, distanceMpc, fg.depthRmsMpc);
    for (const g of members) g.scaled = true;
    fixedSummaries.push({ name: fg.name, members: members.length, source: fg.source });
  }
  if (def.minFieldCz !== undefined)
    gals = gals.filter((g) => g.compressed || g.cz >= def.minFieldCz!);

  // Friends-of-friends on the rest; compress groups with enough members.
  const free = gals.filter((g) => !g.compressed);
  const groups = friendsOfFriends(free, def.fof.perpMpc, def.fof.losKmS).filter(
    (m) => m.length >= def.fof.minMembers,
  );
  const anchorNames = new Set(def.anchors ?? []);
  const groupSummaries: { members: number; cz: number; sigma: number; anchor?: string }[] = [];
  for (const indices of groups) {
    const members = indices.map((i) => free[i]);
    // Anchor: the group around an atlas galaxy is centred on that galaxy's catalogue distance.
    let anchor: (typeof ATLAS)[number] | undefined;
    for (const name of anchorNames) {
      const a = atlasHits.get(name) ?? ATLAS.find((x) => x.name === name);
      if (!a || a.cz === undefined) continue;
      const near = members.some(
        (g) => sepDeg(a.ra, a.dec, g.ra, g.dec) < 0.25 && Math.abs(g.cz - a.cz!) < 1500,
      );
      if (near && members.length >= 20) anchor = a;
    }
    const summary = compress(members, anchor ? anchor.distanceLy / LY_PER_MPC : undefined);
    if (anchor) for (const g of members) g.scaled = true;
    groupSummaries.push({
      members: members.length,
      cz: Math.round(summary.meanCz),
      sigma: Math.round(summary.sigmaCz),
      anchor: anchor?.name,
    });
  }
  for (const g of gals) if (!g.compressed) g.dMpc = g.dzMpc;

  // Final scene positions relative to the structure centre (light-years).
  const local = gals.map((g) => {
    const d = (g.scaled ? g.dMpc : g.dMpc * benchScale) * LY_PER_MPC;
    return sub(scale(g.unit, d), centreVec);
  });

  // Labelled components.
  const simbad = readCsv(path.join(CACHE, "simbad-components.csv"));
  const components = def.components.map((c) => {
    const row = simbad.find((r) => r.id.replace(/"/g, "").replace(/\s+/g, " ").trim() === c.simbad);
    assert(row, `SIMBAD has no ${c.simbad}`);
    const ra = num(row.ra),
      dec = num(row.dec),
      z = num(row.rvz_redshift);
    const cz = Number.isFinite(z) ? z * C_KMS : NaN;
    const atlas = ATLAS.find((a) => sepDeg(a.ra, a.dec, ra, dec) < 1.2 / 60);
    let position: Vec | null = atlas
      ? sub([atlas.position.x, atlas.position.y, atlas.position.z], centreVec)
      : null;
    if (!position) {
      let best = -1,
        bestSep = 20 / 3600;
      gals.forEach((g, i) => {
        if (Number.isFinite(cz) && Math.abs(g.cz - cz) > 1500) return;
        const s = sepDeg(ra, dec, g.ra, g.dec);
        if (s < bestSep) {
          best = i;
          bestSep = s;
        }
      });
      if (best >= 0) position = local[best];
    }
    if (!position && Number.isFinite(cz)) {
      // Cluster centres: nearest compressed members within 0.3° give the cluster's distance.
      const near = gals
        .map((g, i) => ({ g, i }))
        .filter(
          ({ g }) =>
            g.compressed && Math.abs(g.cz - cz) < 1500 && sepDeg(ra, dec, g.ra, g.dec) < 0.3,
        );
      const d = near.length
        ? near.reduce((s, { i }) => s + Math.hypot(...add(local[i], centreVec)), 0) / near.length
        : czToMpc(cz) * benchScale * LY_PER_MPC;
      position = sub(scale(unitOf(ra, dec), d), centreVec);
    }
    assert(position, `no position for ${c.simbad}`);
    return {
      name: c.name,
      role: c.role,
      source: c.source,
      position: position.map((v) => Math.round(v)) as Vec,
      sky: {
        ra: +ra.toFixed(5),
        dec: +dec.toFixed(5),
        z: Number.isFinite(z) ? +z.toFixed(5) : null,
        bibcode: row.coo_bibcode?.replace(/"/g, "") || null,
      },
    };
  });

  // Extent of the field (cube half-size) for Int16 positions.
  let extent = 1;
  for (const p of local) extent = Math.max(extent, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
  for (const c of components) extent = Math.max(extent, ...c.position.map(Math.abs));
  extent = Math.ceil(extent * 1.01);

  // Galaxy attributes.
  const n = gals.length;
  const pos = new Int16Array(n * 3),
    normals = new Int8Array(n * 3),
    props = new Uint8Array(n * 4),
    shape = new Uint8Array(n * 4);
  const fades = gals.map((g, i) => edgeFade(def, g, local[i]));
  let measuredPa = 0,
    estimatedSize = 0;
  gals.forEach((g, i) => {
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = Math.round((local[i][k] / extent) * 32767);
    const { normal, intrinsic } = diskNormal(g);
    for (let k = 0; k < 3; k++) normals[i * 3 + k] = Math.round(normal[k] * 127);
    const logR = Number.isFinite(g.logRadiusKpc) ? g.logRadiusKpc : Math.log10(12) + 0.3 * g.logLum;
    props[i * 4] = quantise(g.logLum, LOG_LUM_RANGE);
    props[i * 4 + 1] = quantise(logR, LOG_RADIUS_RANGE);
    props[i * 4 + 2] = Math.round(clamp01(g.redness) * 255);
    props[i * 4 + 3] = Math.round(clamp01(g.bulge) * 255);
    shape[i * 4] = Math.round(clamp01(intrinsic) * 255);
    shape[i * 4 + 1] =
      (g.compressed ? 1 : 0) |
      (g.sizeEstimated || !Number.isFinite(g.logRadiusKpc) ? 2 : 0) |
      (g.paDeg === null ? 4 : 0);
    shape[i * 4 + 2] = Math.round(fades[i] * 255);
    if (g.paDeg !== null) measuredPa++;
    if (g.sizeEstimated) estimatedSize++;
  });

  // Glow: the plotted galaxies' light smoothed on a GRID³ lattice, shown only where it exceeds
  // the mean at the same distance from us (density contrast): the surveys are flux limited
  // and would otherwise just light up their own selection volume.
  const cellSize = (2 * extent) / GRID;
  const w = new Float32Array(GRID ** 3),
    red = new Float32Array(GRID ** 3),
    fade = new Float32Array(GRID ** 3);
  gals.forEach((g, i) => {
    const L = 10 ** Math.min(1.5, g.logLum);
    const f = local[i].map((v) => (v + extent) / cellSize - 0.5);
    const base = f.map(Math.floor),
      t = f.map((v, k) => v - base[k]);
    for (let dx = 0; dx <= 1; dx++)
      for (let dy = 0; dy <= 1; dy++)
        for (let dz = 0; dz <= 1; dz++) {
          const x = base[0] + dx,
            y = base[1] + dy,
            z = base[2] + dz;
          if (x < 0 || y < 0 || z < 0 || x >= GRID || y >= GRID || z >= GRID) continue;
          const weight =
            L * (dx ? t[0] : 1 - t[0]) * (dy ? t[1] : 1 - t[1]) * (dz ? t[2] : 1 - t[2]);
          const idx = (z * GRID + y) * GRID + x;
          w[idx] += weight;
          red[idx] += weight * g.redness;
          fade[idx] += weight * fades[i];
        }
  });
  const blur = (src: Float32Array) => {
    const kernel = [1, 4, 6, 4, 1].map((v) => v / 16);
    let a = src;
    for (let axis = 0; axis < 3; axis++) {
      const b = new Float32Array(a.length);
      const stride = axis === 0 ? 1 : axis === 1 ? GRID : GRID * GRID;
      for (let idx = 0; idx < a.length; idx++) {
        const coord = Math.floor(idx / stride) % GRID;
        let s = 0;
        for (let k = -2; k <= 2; k++)
          if (coord + k >= 0 && coord + k < GRID) s += a[idx + k * stride] * kernel[k + 2];
        b[idx] = s;
      }
      a = b;
    }
    return a;
  };
  const wb = blur(w),
    rb = blur(red),
    fb = blur(fade);
  const cellCentre = (idx: number, jitter = false): Vec => {
    const x = idx % GRID,
      y = Math.floor(idx / GRID) % GRID,
      z = Math.floor(idx / (GRID * GRID));
    return [x, y, z].map(
      (v, k) => -extent + (v + 0.5 + (jitter ? (hash(idx, k, 9) - 0.5) * 0.7 : 0)) * cellSize,
    ) as Vec;
  };
  // Mean smoothed light in radial shells around the observer, over cells inside the survey.
  const SHELLS = 24;
  let rMin = Infinity,
    rMax = 0;
  for (const p of local) {
    const r = Math.hypot(...add(p, centreVec));
    rMin = Math.min(rMin, r);
    rMax = Math.max(rMax, r);
  }
  const shellOf = (idx: number) =>
    Math.min(
      SHELLS - 1,
      Math.max(
        0,
        Math.floor(
          ((Math.hypot(...add(cellCentre(idx), centreVec)) - rMin) / Math.max(1, rMax - rMin)) *
            SHELLS,
        ),
      ),
    );
  const shellSum = new Float64Array(SHELLS),
    shellN = new Float64Array(SHELLS);
  for (let idx = 0; idx < wb.length; idx++)
    if (wb[idx] > 0 && fb[idx] / wb[idx] > 0.5) {
      const sh = shellOf(idx);
      shellSum[sh] += wb[idx];
      shellN[sh]++;
    }
  const contrast = new Float32Array(wb.length);
  for (let idx = 0; idx < wb.length; idx++) {
    if (!(wb[idx] > 0)) continue;
    const sh = shellOf(idx);
    contrast[idx] = shellN[sh] ? wb[idx] / (shellSum[sh] / shellN[sh]) - 1 : 0;
  }
  const cells = [...contrast.keys()]
    .filter((i) => contrast[i] > 1.5)
    .sort((a, b) => contrast[b] - contrast[a])
    .slice(0, 4000);
  const top = contrast[cells[Math.floor(cells.length * 0.01)] ?? 0] || 2.5;
  const splatPos = new Int16Array(cells.length * 3),
    splatProps = new Uint8Array(cells.length * 2);
  cells.forEach((idx, s) => {
    const c = cellCentre(idx, true);
    for (let k = 0; k < 3; k++) splatPos[s * 3 + k] = Math.round((c[k] / extent) * 32767);
    const edge = clamp01(fb[idx] / Math.max(1e-9, wb[idx]));
    const level = Math.log1p(contrast[idx] - 1.5) / Math.log1p(Math.max(0.5, top - 1.5));
    splatProps[s * 2] = Math.round(clamp01(level) * edge * 255);
    splatProps[s * 2 + 1] = Math.round(clamp01(rb[idx] / Math.max(1e-9, wb[idx])) * 255);
  });

  // Binary layout (little-endian, 4-byte aligned sections).
  const sections: [string, ArrayBufferView][] = [
    ["position", pos],
    ["normal", normals],
    ["props", props],
    ["shape", shape],
    ["splatPosition", splatPos],
    ["splatProps", splatProps],
  ];
  const offsets: Record<string, number> = {};
  let bytes = 0;
  for (const [name, view] of sections) {
    offsets[name] = bytes;
    bytes += Math.ceil(view.byteLength / 4) * 4;
  }
  const buffer = new Uint8Array(bytes);
  for (const [name, view] of sections)
    buffer.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength), offsets[name]);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${def.id}.bin`), buffer);

  // Mask cone for layers that would otherwise draw the same galaxies again.
  let maxAngle = 0,
    minD = Infinity,
    maxD = 0;
  gals.forEach((g, i) => {
    maxAngle = Math.max(maxAngle, Math.acos(Math.min(1, dot(g.unit, centreUnit))));
    const d = Math.hypot(...add(local[i], centreVec));
    minD = Math.min(minD, d);
    maxD = Math.max(maxD, d);
  });
  const czUsed = gals.reduce<[number, number]>(
    (r, g) => [Math.min(r[0], g.cz), Math.max(r[1], g.cz)],
    [Infinity, -Infinity],
  );
  const compressedCount = gals.filter((g) => g.compressed).length;
  console.log(
    `${def.id}: ${n} galaxies (${Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(", ")}; ${merged.dropped} cross-matched, ${atlasHits.size} atlas duplicates), ` +
      `${groups.length} groups, ${compressedCount} compressed, ${cells.length} glow cells, ${(bytes / 1024).toFixed(0)} KiB, extent ${(extent / 1e6).toFixed(1)} Mly`,
  );
  return {
    id: def.id,
    file: `/data/cosmic-structures/${def.id}.bin`,
    bytes,
    galaxies: n,
    splats: cells.length,
    extentLy: extent,
    centreLy: centreVec.map((v) => Math.round(v)) as Vec,
    splatRadiusLy: Math.round(cellSize * 1.05),
    slabLy: def.slabMpc ? Math.round(def.slabMpc * LY_PER_MPC) : 0,
    offsets,
    // Layers that would draw the same galaxies again hide what falls inside this volume:
    // a cone with a distance (and cz) range, or for spherical selections a sphere.
    mask: {
      kind: def.region.kind === "sphere" ? ("sphere" as const) : ("cone" as const),
      direction: centreUnit.map((v) => +v.toFixed(6)) as Vec,
      cosAngle: +Math.cos(Math.min(Math.PI, maxAngle * 1.02 + 0.002)).toFixed(6),
      distanceLy: [Math.round(minD * 0.99), Math.round(maxD * 1.01)] as [number, number],
      czKmS: [Math.floor(czUsed[0]), Math.ceil(czUsed[1])] as [number, number],
      sphereRadiusLy:
        def.region.kind === "sphere"
          ? Math.round(def.region.radiusMpc * LY_PER_MPC * benchScale)
          : 0,
    },
    catalogueRows: counts,
    plottedByCatalogue: gals.reduce<Record<string, number>>(
      (m, g) => ((m[g.catalogue] = (m[g.catalogue] ?? 0) + 1), m),
      {},
    ),
    crossMatched: merged.dropped,
    atlasDuplicates: [...atlasHits.keys()].sort(),
    measuredPositionAngles: measuredPa,
    estimatedSizes: estimatedSize,
    compressedMembers: compressedCount,
    groups: groupSummaries.length,
    richestGroups: groupSummaries.sort((a, b) => b.members - a.members).slice(0, 5),
    fixedGroups: fixedSummaries,
    components,
    notes: def.notes,
  };
}

function main() {
  const catalogues: Record<string, Galaxy[]> = { "2mrs": load2mrs() };
  for (const def of STRUCTURE_DEFINITIONS)
    for (const { id, box } of def.catalogues) {
      const key = `${id}:${box}`;
      if (id === "2mrs" || catalogues[key]) continue;
      catalogues[key] = id === "sdss" ? loadSdss(box as keyof typeof SDSS_BOXES) : load6df(box!);
    }
  const fields = STRUCTURE_DEFINITIONS.map((def) => buildStructure(def, catalogues));
  const builtOn = process.env.OVU_BUILD_DATE ?? new Date().toISOString().slice(0, 10);
  const banner =
    "// Generated by scripts/cosmic-structures/build-structure-data.ts — do not edit by hand.\n" +
    "// Survey galaxies around each cosmic structure; see the build script for methods and sources.\n";
  const body =
    `export const STRUCTURE_FIELD_BUILD = ${JSON.stringify(
      {
        builtOn,
        logLumRange: LOG_LUM_RANGE,
        logRadiusKpcRange: LOG_RADIUS_RANGE,
        sources: SURVEY_SOURCES,
        method: [
          "Directions and redshifts are measured (2MRS, SDSS DR17, 6dFGS DR3); distances use the Planck 2018 cosmology, scaled so each structure's adopted redshift lands on its adopted distance.",
          "Galaxies in friends-of-friends groups (Huchra & Geller 1982) have their line-of-sight spread compressed to match their projected spread (finger-of-God compression, e.g. Tegmark et al. 2004); their exact depths are a reconstruction.",
          "Sizes come from measured radii (SDSS Petrosian R90, 2MRS extrapolated K-band radius) or, for 6dFGS, from a size–luminosity relation; axis ratios and position angles are measured where the survey gives them, and the orientation in depth is a reconstruction.",
          "Colours are a labelled display palette from measured g−r colour, photographic bJ−rF colour or morphological type; the soft glow is the plotted galaxies' light smoothed on a 64³ grid, shown where it is at least 2.5 times the mean at the same distance from us.",
        ],
      },
      null,
      2,
    )} as const;\n\n` +
    `export const STRUCTURE_FIELDS = ${JSON.stringify(Object.fromEntries(fields.map((f) => [f.id, f])), null, 2)} as const;\n\n` +
    "export type StructureFieldId = keyof typeof STRUCTURE_FIELDS;\n";
  fs.writeFileSync(MANIFEST, banner + body);
  console.log(`wrote ${MANIFEST} and ${fields.length} files in ${OUT_DIR}`);
}

main();
