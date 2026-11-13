import * as THREE from "three";
import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
import { catalogueAppearance } from "./galaxy-overview-appearance";
import { OBSERVED_IMAGE_BY_KEY } from "./galaxy-observed-images";
import { earthDirectionLocal, observedImageMatrix } from "./galaxy-observed-projection";
import diskMapData from "./catalog-data/galaxy-disk-maps.json";
import {
  KPC_LY,
  MILKY_WAY_ARMS,
  MILKY_WAY_ARM_WIDTH,
  MILKY_WAY_BAR,
  type MilkyWayArm,
} from "./milky-way-structure";

/**
 * GALAXY DISK LAYER
 *
 * Disk galaxies are rendered as face-on 2D maps (in-plane structure) multiplied by
 * analytic vertical profiles, the geometry used by panchromatic radiative-transfer
 * models of nearby spirals (De Looze et al. 2014, A&A 571, A69; Nersesian et al. 2020):
 *
 *  - an old stellar disk (sech², exponential scale height ≈ 0.1 × scale length, de Grijs
 *    1998; Kregel et al. 2002) plus a fainter thick disk;
 *  - a thinner young (UV) disk and dust disk at about half the old scale height
 *    (Xilouris et al. 1999), and ionised gas at about a quarter;
 *  - a flattened spheroidal bulge.
 *
 * Seven galaxies with registered telescope images take their in-plane maps from the
 * image itself (scripts/derive-galaxy-disk-maps.ts); the rest bake a procedural map
 * from their catalogued morphology. The Milky Way, which cannot be photographed from
 * outside, bakes its map from published fits to its arms, bar and disk
 * (milky-way-structure.ts). Vertical structure, the far side of each disk and
 * everything outside a photograph's frame are reconstructions, not measurements.
 */

type RGB = [number, number, number];

export type ObservedDiskPart = {
  id: string;
  label: string;
  source: string;
  uvRect: [number, number, number, number];
  atlasRect: [number, number, number, number];
  centreUv: [number, number];
  axisA: [number, number];
  axisB: [number, number];
  depthCentre: number;
  depthExtent: number;
  centre: [number, number, number];
  radius: number;
  /** Local units (disk radii) per atlas texel. */
  texel: number;
  /** "spheroid": spherically deprojected; "sheet": flattened slab (disturbed disks, tails, gas). */
  kind?: "spheroid" | "sheet";
  /** Spheroids: core radius of the light profile (half-width at half maximum), outline units. */
  core?: number;
};
export type ObservedDiskMap = {
  key: string;
  image: string;
  /** "disk": deprojected face-on maps plus parts; "sky": sightline-extruded parts only. */
  mode: "disk" | "sky";
  extent: number;
  detail: { url: string; size: number; scale: number } | null;
  smooth: { url: string; size: number; scale: number } | null;
  dust: { url: string; size: number; tauMax: number; encoding: "sqrt" } | null;
  parts: {
    url: string;
    width: number;
    height: number;
    scale: number;
    items: ObservedDiskPart[];
  } | null;
  profile: { old: [number, number]; young: [number, number]; dust: [number, number] };
  colours: { old: RGB; young: RGB };
  stars: number;
  note: string;
};

export const OBSERVED_DISK_MAPS: Readonly<Record<string, ObservedDiskMap>> = (
  diskMapData as unknown as { maps: Record<string, ObservedDiskMap> }
).maps;

/** Maximum sightline-extruded parts (bulges, companions) per galaxy. */
export const MAX_DISK_PARTS = 6;
/** Capacity of a sourced arm table in the map bake: arms, and knots per arm. */
export const MAX_TABLE_ARMS = 8;
export const MAX_ARM_KNOTS = 5;

export type ProceduralDiskParameters = {
  arms: number;
  /** Pitch angle (radians). */
  pitch: number;
  /** Bar half-length (disk radii) and position angle in the disk plane (radians). */
  bar: number;
  barAngle: number;
  ring: number;
  ringWidth: number;
  seed: number;
  flocculent: number;
  grand: number;
  lenticular: number;
  clumps: number;
  asymmetry: number;
  lanes: number;
  /** Exponential scale lengths (disk radii) of the old and young light. */
  oldScale: number;
  youngScale: number;
  /** Central amplitudes (display-referred photo units). */
  oldAmp: number;
  youngAmp: number;
  hiiAmp: number;
  dustAmp: number;
  /** Outer truncation radius (disk radii). */
  outer: number;
  oldColour: RGB;
  youngColour: RGB;
  /** Optional dust patch: centre x, z, radius, optical depth (M64's "black eye"). */
  patch: [number, number, number, number];
  /** Irregular galaxies: clumpy, lopsided complexes instead of arms (0 or 1). */
  irregular: number;
  /** Irregular envelope: centre offset (disk plane x, z) and minor/major axis ratio. */
  envelope: [number, number, number];
  /**
   * Sourced arms (the Milky Way) that replace the m-fold spiral: log-spiral knots in units of
   * `armScale` (disk radii), with azimuth 0 along +x and increasing toward +z. Empty otherwise.
   */
  armTable: readonly MilkyWayArm[];
  armScale: number;
};

/** Star-forming complexes (sourced positions) drawn as 3D clumps of young light, H II and dust. */
export type DiskKnots = {
  items: [number, number, number, number][];
  hot: number;
  hii: number;
  dust: number;
  colour: RGB;
};

export type DiskLayerSpec = {
  key: string;
  observed: ObservedDiskMap | null;
  /** sech² z0 of the old thin disk; exponential heights of young, ionised and dust layers. */
  heights: { old: number; young: number; ionised: number; dust: number };
  thick: { z0: number; fraction: number };
  flare: number;
  /** Half-height of the integration slab (disk radii). */
  slab: number;
  /** Half-size of the volume box (disk radii); 1.35 unless a ring reaches further. */
  box: number;
  /** Radius beyond which the galaxy has no light or dust, so rays stop there; 0: the whole box. */
  reach: number;
  /**
   * Spheroid (a bulge, or the whole old population of an elliptical, dwarf or irregular):
   * a triaxial profile exp(-b m^(1/n)), m = |q / axes| / radius. Amplitude is its central
   * face-on column; `flattening` sets the ray marcher's fine-step core.
   */
  bulge: {
    radius: number;
    flattening: number;
    amplitude: number;
    exponent: number;
    coefficient: number;
    axes: [number, number, number];
    /** Azimuth of the x semi-axis in the disk plane (radians): a bar-shaped bulge. */
    turn: number;
    colour: RGB;
  };
  /**
   * Once the camera has entered: gain of the display-referred light (interior exposure), and
   * the fraction of the galaxy's own light kept when the interior is revealed.
   */
  interior: [number, number];
  knots: DiskKnots;
  halo: number;
  /** Diffuse face-on dust: central optical depth, scale length, outer radius. */
  dust: [number, number, number];
  /** Bipolar starburst wind: amplitude, tan(half-opening), base radius, height scale. */
  wind: [number, number, number, number];
  procedural: ProceduralDiskParameters;
  /**
   * Star points: 1 follow the disk maps' light; 0 part-only systems (shown only inside);
   * 2 resolved populations (dwarfs, ellipticals, irregulars) keep their own distribution.
   */
  starHost: number;
  /** Extent (± disk radii) of the procedural map. */
  proceduralExtent: number;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const luma = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const normalise = (c: RGB): RGB => {
  const l = Math.max(1e-4, luma(c));
  return c.map((v) => v / l) as RGB;
};
/** Mixes two colours at equal luminance (weight w of the second), normalised to unit luminance. */
const tint = (base: RGB, colour: RGB, w: number): RGB => {
  const a = normalise(base),
    b = normalise(colour);
  return normalise(a.map((v, i) => v * (1 - w) + b[i] * w) as RGB);
};
/**
 * Display colours of old populations: bulges and old disks have the red optical colours of
 * old stars (Peletier & Balcells 1996, AJ 111, 2238; de Jong 1996, A&A 313, 377) and read
 * cream to yellow in Hubble and Legacy Surveys composites. Catalogue colours of generated
 * models are integrated colours of the whole galaxy, blue for late types; the disk layer
 * separates old and young light, so it starts from these and keeps a light catalogue tint.
 * Display choices, not photometry.
 */
const OLD_DISK_COLOUR: RGB = [1, 0.9, 0.76];

/** Γ(x), x > 0 (Lanczos, g = 7), for the spheroid column normalisation. */
function gamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * t ** (x + 0.5) * Math.exp(-t) * a;
}
/** Sérsic coefficient b(n) (Ciotti & Bertin 1999), so `radius` is the half-light radius. */
export const sersicCoefficient = (n: number) =>
  2 * n - 1 / 3 + 4 / (405 * n) + 46 / (25515 * n * n);
/** Central face-on column of exp(-b m^w) through a spheroid of vertical semi-axis `vertical`. */
export function spheroidColumn(radius: number, vertical: number, exponent: number, b: number) {
  return 2 * radius * vertical * gamma(1 + 1 / exponent) * b ** (-1 / exponent);
}
const OLD_BULGE_COLOUR: RGB = [1, 0.86, 0.68];

/** Galaxies whose bespoke legacy volume features are kept (Cen A, M82, Magellanic Clouds, mergers…). */
const LEGACY_FEATURES = new Set([1, 4, 5, 7, 8, 9, 10, 11, 12, 15]);
const DISK_MORPHOLOGIES = new Set([
  "spiral",
  "grand-design",
  "flocculent",
  "barred",
  "lenticular",
  "edge-on",
  "ring",
  "starburst",
]);

/** Disk-layer parameters, or null when the galaxy keeps the cached 3D volume. */
export function diskLayerSpec(model: GalaxyModel): DiskLayerSpec | null {
  const observed = OBSERVED_DISK_MAPS[model.key] ?? null;
  const structure = galaxyStructure(model);
  if (!observed) {
    // Resolved populations (ellipticals, lenticulars, dwarfs, irregulars and starbursts with
    // sourced recipes) and irregulars without one have their own reconstructions below.
    const populationSpec =
      structure.population || (structure.irregular && structure.feature !== 3)
        ? populationLayerSpec(model, structure)
        : null;
    if (populationSpec) return populationSpec;
    if (structure.population || structure.spheroid || structure.irregular) {
      if (structure.feature !== 3) return null;
    }
    if (!DISK_MORPHOLOGIES.has(model.morphology)) return null;
    if (LEGACY_FEATURES.has(structure.feature)) return null;
  }
  const appearance = catalogueAppearance(model);
  let seed = 0;
  for (const c of model.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
  const lenticular = model.morphology === "lenticular" ? 1 : 0;
  const sombrero = structure.feature === 2;
  const blackEye = structure.feature === 13;
  const m94 = structure.feature === 14;
  const andromeda = model.key === "andromeda";
  const milkyWay = model.name === "Milky Way";
  /** Disk radii per kiloparsec. */
  const kpc = KPC_LY / model.diskRadius;
  const cigar = structure.feature === 3;
  const barred = model.barLength > 0 ? 1 : 0;
  const bulgeRatio = clamp(model.bulgeRadius / Math.max(1, model.diskRadius), 0.025, 0.6);
  const oldColour = observed
    ? normalise(observed.colours.old)
    : tint(OLD_DISK_COLOUR, appearance.oldColor, 0.25);
  // Young light in composites is blue (with pink H II, carried separately); catalogue palettes
  // are paler, so procedural disks lean toward it. Display choice, not photometry.
  const youngColour = observed
    ? normalise(observed.colours.young)
    : tint(appearance.youngColor, [0.6, 0.78, 1], 0.4);
  const procedural: ProceduralDiskParameters = {
    arms: lenticular || sombrero ? 0 : Math.max(2, Math.min(6, model.arms || 2)),
    pitch: THREE.MathUtils.degToRad(clamp(model.pitchDeg || 16, 6, 40)),
    bar: barred ? clamp(model.barLength / model.diskRadius, 0.05, 0.6) : 0,
    barAngle: milkyWay ? MILKY_WAY_BAR.angle : (seed % 31) * 0.21,
    // Sombrero (Hubble opo0328a): the dust lane runs almost the full length of the stellar
    // disk, so the ring sits near its outer edge, with the bright disk inside it.
    ring: sombrero ? 0.88 : clamp(structure.ringRadius || 0, 0, 0.9),
    ringWidth: sombrero ? 0.05 : 0.05,
    seed: seed / 13,
    flocculent: model.morphology === "flocculent" ? 1 : 0,
    grand: model.morphology === "grand-design" || model.morphology === "barred" ? 1 : 0,
    lenticular: lenticular || sombrero ? 1 : 0,
    clumps: clamp(appearance.features[2] || 0.5, 0.2, 1),
    asymmetry: structure.asymmetry,
    lanes: model.dustLanes ? 1 : lenticular ? 0.15 : 0.35,
    // Old-disk scale length about 0.2 of the model radius, as measured from the registered
    // photographs (0.15-0.2 for M51, M81 and M101), so the outer disk is carried by the arms.
    // Milky Way: thin-disk scale length 2.6 ± 0.5 kpc (Bland-Hawthorn & Gerhard 2016). Its
    // young light is given a shorter scale than the generic disk, a display choice: little
    // star formation is seen in its outer arms.
    oldScale: milkyWay ? 2.6 * kpc : andromeda ? 0.2 : sombrero ? 0.42 : 0.21,
    youngScale: milkyWay ? 0.26 : andromeda ? 0.32 : 0.34,
    oldAmp: sombrero ? 0.28 : lenticular ? 0.85 : milkyWay ? 0.38 : 0.7,
    youngAmp: lenticular || sombrero ? 0 : milkyWay ? 0.7 : 0.55,
    hiiAmp: lenticular || sombrero ? 0 : milkyWay ? 0.55 : 0.85,
    dustAmp: sombrero ? 5.5 : andromeda ? 2 : milkyWay ? 2.4 : model.dustLanes ? 1.5 : 0.4,
    outer: m94 ? 1.15 : sombrero ? 0.98 : 1.05,
    oldColour,
    youngColour,
    patch: blackEye ? [0.07, 0.035, 0.2, 2.2] : [0, 0, 0, 0],
    irregular: 0,
    envelope: [0, 0, 1],
    armTable: milkyWay ? MILKY_WAY_ARMS : [],
    // The Sun's distance from the centre: the arm fits are in units of it.
    armScale: milkyWay ? model.distance / model.diskRadius : 1,
  };
  if (cigar) {
    // M82: an edge-on, dusty, clumpy starburst disk with a short bar (ESA/Hubble heic0604a).
    Object.assign(procedural, {
      arms: 2,
      pitch: THREE.MathUtils.degToRad(20),
      bar: 0.18,
      flocculent: 1,
      grand: 0,
      lenticular: 0,
      clumps: 1,
      lanes: 1,
      oldScale: 0.2,
      youngScale: 0.16,
      oldAmp: 0.75,
      youngAmp: 0.95,
      hiiAmp: 1.5,
      dustAmp: 3.2,
      outer: 1,
    });
  }
  if (observed) {
    // Continue the observed disk outside the frame with its own measured profile and colours.
    // A zero profile means the photograph already covers the disk: no continuation.
    procedural.oldScale = clamp(observed.profile.old[1], 0.12, 0.6);
    procedural.youngScale = clamp(observed.profile.young[1], 0.12, 0.7);
    procedural.oldAmp = clamp(observed.profile.old[0], 0, 6);
    procedural.youngAmp = clamp(observed.profile.young[0] * 1.6, 0, 4);
    procedural.hiiAmp = procedural.youngAmp * 0.9;
    procedural.dustAmp = clamp(observed.profile.dust[0] * 0.6, 0, 6);
  }
  // Milky Way (Bland-Hawthorn & Gerhard 2016): thin and thick disks with exponential scale
  // heights 300 ± 50 pc and 900 ± 180 pc (sech² z0 is twice that) and a thick/thin surface
  // density of 12 ± 4%. Its young, ionised and dust layers keep the generic ratios to the old
  // disk.
  const thin = milkyWay ? (0.6 * kpc) / 0.046 : 1;
  const heights = {
    old: milkyWay ? 0.6 * kpc : cigar ? 0.06 : sombrero ? 0.035 : lenticular ? 0.06 : 0.046,
    young: cigar ? 0.02 : 0.014 * thin,
    ionised: cigar ? 0.012 : 0.0075 * thin,
    dust: cigar ? 0.019 : 0.012 * thin,
  };
  const thick = milkyWay
    ? { z0: 1.8 * kpc, fraction: 0.12 / 1.12 }
    : { z0: 0.13, fraction: sombrero ? 0.12 : lenticular ? 0.2 : 0.1 };
  const flare = sombrero ? 0.2 : 0.6;
  // Disk bulges: exp(-3 m^0.75). The Sombrero's dominant spheroid follows a de Vaucouleurs
  // (Sérsic n = 4) law (Kormendy 1988; Hes & Peletier 1993): a bright, compact core inside
  // a faint halo that reaches beyond the disk.
  const bulgeExponent = sombrero ? 0.25 : 0.75;
  // Milky Way: a box/peanut bulge that is the inner, thick part of the bar. Vertical scale
  // height 180 pc with axis ratios 0.26 edge-on and 0.5 from above (Bland-Hawthorn & Gerhard
  // 2016, §4.2), so 180 / 0.26 pc along the bar; exp(-3 m^0.75) falls by e at m = 3^(-4/3).
  const bulgeRadius = sombrero
    ? 0.24
    : andromeda
      ? 0.16
      : milkyWay
        ? ((0.18 / MILKY_WAY_BAR.bulgeAxes[1]) * kpc) / 3 ** (-4 / 3)
        : cigar
          ? 0.07
          : clamp(bulgeRatio, 0.04, 0.3);
  // M104's spheroid: axis ratio 0.62 measured on its registered Hubble image (opo0328a;
  // isophotes at 8-15% of the peak, on the side away from the dust lane).
  const bulgeFlattening = milkyWay
    ? MILKY_WAY_BAR.bulgeAxes[1]
    : sombrero
      ? 0.62
      : lenticular
        ? 0.62
        : 0.72;
  const bulge = {
    radius: bulgeRadius,
    // Steeper (n = 4) profiles need finer steps through their core.
    flattening: bulgeFlattening * (sombrero ? 0.3 : 1),
    amplitude: observed
      ? 0
      : sombrero
        ? 2.2
        : andromeda
          ? 1.6
          : milkyWay
            ? 0.75
            : cigar
              ? 0.9
              : lenticular
                ? 1.3
                : 1.05,
    exponent: bulgeExponent,
    coefficient: sombrero ? sersicCoefficient(4) : 3,
    axes: [1, bulgeFlattening, milkyWay ? MILKY_WAY_BAR.bulgeAxes[0] : 1] as [
      number,
      number,
      number,
    ],
    turn: milkyWay ? MILKY_WAY_BAR.angle : 0,
    colour: sombrero
      ? tint(OLD_BULGE_COLOUR, [1, 0.97, 0.93], 0.65)
      : tint(OLD_BULGE_COLOUR, appearance.oldColor, 0.2),
  };
  const parts = observed?.parts?.items ?? [];
  const sky = observed?.mode === "sky";
  if (sky) {
    // Mergers and groups are carried by their photographed components alone.
    Object.assign(procedural, { oldAmp: 0, youngAmp: 0, hiiAmp: 0, dustAmp: 0 });
    bulge.amplitude = 0;
  }
  // H-alpha superwind of M82: biconical, about 30° half-opening, filaments to ~0.9 disk radii
  // (Shopbell & Bland-Hawthorn 1998; ESA/Hubble heic0604a). Filament positions are illustrative.
  const wind: [number, number, number, number] = cigar ? [3.2, 0.55, 0.07, 0.34] : [0, 0, 0, 1];
  const slab = Math.max(
    wind[0] > 0 ? 1.0 : 0,
    thick.z0 * (1 + flare) * 3.6,
    bulge.amplitude > 0 ? bulge.radius * bulgeFlattening * (sombrero ? 4.5 : 3.2) : 0,
    ...parts.map((p) => Math.abs(p.centre[1]) + p.radius),
    0.12,
  );
  const box = Math.min(
    2.6,
    Math.max(
      1.35,
      (observed?.extent ?? 0) + 0.05,
      ...parts.map((p) => Math.max(...p.centre.map(Math.abs)) + p.radius + p.depthExtent),
    ),
  );
  return {
    key: model.key,
    observed,
    box,
    // A procedural disk ends at its map's edge taper (with room for texture filtering), the
    // spheroid's taper and the halo's.
    reach:
      observed || cigar
        ? 0
        : Math.max(
            1.12 * procedural.outer + 0.1,
            5.5 * bulge.radius * Math.max(bulge.axes[0], bulge.axes[2]),
            1.3,
          ),
    heights,
    thick,
    flare,
    slab: sky ? box : Math.min(box, slab),
    bulge,
    // The Milky Way is seen mostly from inside: its gain matches the exterior view at the
    // default exposure, so entry and exit have no brightness step, and its band keeps more
    // of its light than a galaxy visited briefly.
    interior: milkyWay ? [8, 0.36] : [2.4, 0.09],
    knots: NO_KNOTS,
    halo: observed ? 0 : sombrero ? 0.012 : lenticular ? 0.04 : 0.025,
    starHost: sky ? 0 : 1,
    dust: [
      sky ? 0 : sombrero ? 0.1 : cigar ? 0.9 : model.dustLanes ? 0.7 : 0.2,
      cigar ? 0.3 : 0.36,
      sombrero ? 0.7 : 1.12,
    ],
    wind,
    procedural,
    proceduralExtent: 1.3,
  };
}

const NO_KNOTS: DiskKnots = { items: [], hot: 0, hii: 0, dust: 0, colour: [1, 1, 1] };

/** Default recipe for irregulars without a sourced population (e.g. NGC 5253). */
const IRREGULAR_DEFAULT = {
  kind: 2 as const,
  axes: [1, 0.32, 0.68] as [number, number, number],
  core: 0.55,
  continuum: 0.12,
  hotFraction: 0.48,
  dust: 0.12,
  hii: 0.4,
  old: [1, 0.77, 0.52] as RGB,
  hot: [0.38, 0.65, 1] as RGB,
  knots: [] as readonly (readonly [number, number, number, number])[],
};

/**
 * Resolved stellar populations with sourced recipes (galaxy-populations.ts: projected axis
 * ratio, core radius, diffuse-light level, young fraction, dust, H II and the positions of
 * named star-forming complexes):
 *
 *  - Ellipticals, lenticulars and dwarf spheroidals/ellipticals are smooth triaxial
 *    spheroids with a Sérsic profile by class: n = 4 for giant ellipticals (de Vaucouleurs),
 *    about 1.5 for dwarf ellipticals and 0.8 for dwarf spheroidals, whose low-concentration
 *    profiles are close to exponential (Caon, Capaccioli & D'Onofrio 1993; Graham & Guzmán
 *    2003; McConnachie 2012). Lenticulars add a thin disk with a dust lane when catalogued.
 *  - Irregulars and starbursts keep their old population as an exponential spheroid and draw
 *    young light, H II and dust as a thick, lopsided, clumpy layer (dwarf irregulars have
 *    intrinsic thickness ratios of about 0.3-0.6; Roychowdhury et al. 2013), with the sourced
 *    complexes (30 Doradus-like regions) as 3D clumps.
 *
 * Shapes in depth and the clump layout between named complexes are reconstructions.
 */
function populationLayerSpec(
  model: GalaxyModel,
  structure: ReturnType<typeof galaxyStructure>,
): DiskLayerSpec | null {
  const population = structure.population ?? (structure.irregular ? IRREGULAR_DEFAULT : null);
  if (!population) return null;
  let seed = 0;
  for (const c of model.name) seed = (seed * 31 + c.charCodeAt(0)) % 997;
  const appearance = catalogueAppearance(model);
  const axes = [...population.axes] as [number, number, number];
  const spheroidal = population.kind === 1 || population.kind === 4;
  const lenticular = /lenticular|S0/i.test(model.type) || model.morphology === "lenticular";
  const edgeOn = model.morphology === "edge-on";
  const giant = /elliptical|lenticular|S0/i.test(model.type) && !/dwarf/i.test(model.type);
  const dwarfSpheroidal = /spheroidal/i.test(model.type);
  // Lenticular bulges are less concentrated than giant ellipticals (n about 2-3).
  const n = !spheroidal ? 1 : lenticular || edgeOn ? 3 : giant ? 4 : dwarfSpheroidal ? 0.8 : 1.5;
  const exponent = 1 / n;
  const coefficient = sersicCoefficient(n);
  const knots = (population.knots ?? []).slice(0, MAX_DISK_PARTS);
  const procedural: ProceduralDiskParameters = {
    arms: 0,
    pitch: 0.3,
    bar: 0,
    barAngle: (seed % 31) * 0.21,
    ring: 0,
    ringWidth: 0.05,
    seed: seed / 13,
    flocculent: spheroidal ? 0 : 1,
    grand: 0,
    lenticular: spheroidal ? 1 : 0,
    clumps: 1,
    asymmetry: structure.asymmetry,
    lanes: 0,
    oldScale: 0.25,
    youngScale: Math.max(0.12, population.core * 0.6),
    // Population lenticulars stay smooth spheroids: their sourced axes carry the measured
    // projected shape, and most lack a measured inclination for a separate thin disk.
    oldAmp: 0,
    youngAmp: spheroidal ? 0 : 0.6 * population.hotFraction,
    hiiAmp: spheroidal ? 0 : 0.8 * population.hii,
    dustAmp: spheroidal ? 0 : 1.1 * population.dust,
    outer: spheroidal ? 0.9 : 1.05,
    oldColour: normalise(population.old),
    youngColour: normalise(population.hot),
    patch: [0, 0, 0, 0],
    irregular: spheroidal ? 0 : 1,
    // Irregular envelopes are lopsided (an off-centre light peak; e.g. the LMC's bar sits off
    // the disk centre) and follow the sourced axis ratio in the disk plane.
    envelope: [
      ((seed % 7) / 7 - 0.5) * 0.18 * (spheroidal ? 0 : 1),
      ((seed % 11) / 11 - 0.5) * 0.18 * (spheroidal ? 0 : 1),
      clamp(axes[2], 0.25, 1),
    ],
    armTable: [],
    armScale: 1,
  };
  const thicknessRatio = clamp(axes[1], 0.15, 1);
  const heights = {
    old: lenticular || edgeOn ? 0.05 : 0.08,
    young: spheroidal ? 0.03 : Math.min(0.09, 0.22 * thicknessRatio),
    ionised: spheroidal ? 0.02 : Math.min(0.06, 0.13 * thicknessRatio),
    dust: spheroidal ? 0.01 : Math.min(0.08, 0.17 * thicknessRatio),
  };
  // Diffuse light: bright for ellipticals, faint for dwarf spheroidals, whose look is
  // carried by their resolved stars (central surface brightness about 23-27 mag/arcsec²).
  const amplitude = spheroidal ? 2.2 * population.continuum ** 1.6 : 1.3 * population.continuum;
  const radius = Math.max(0.05, population.core) * (spheroidal ? 1 : 0.9);
  const bulge = {
    radius,
    flattening: Math.min(axes[1], axes[2]) * (n >= 3 ? 0.3 : 1),
    amplitude,
    exponent,
    coefficient,
    axes,
    turn: 0,
    colour: normalise(population.old),
  };
  const slab = Math.min(
    1.35,
    Math.max(0.12, radius * axes[1] * (n >= 3 ? 6 : 4), heights.young * 4, 0.3 * thicknessRatio),
  );
  return {
    key: model.key,
    observed: null,
    box: 1.35,
    reach: 0,
    heights,
    thick: { z0: heights.old * 2, fraction: 0.15 },
    flare: 0.3,
    slab: Math.max(slab, ...knots.map((k) => Math.abs(k[1]) + k[3] * 3)),
    bulge,
    interior: [2.4, 0.09],
    knots: {
      items: knots.map((k) => [k[0], k[1], k[2], k[3]] as [number, number, number, number]),
      hot: spheroidal ? 0.25 * population.hotFraction : 0.5 * population.hotFraction,
      hii: spheroidal ? 0.25 * population.hii : 1.2 * population.hii,
      dust: 0.6 * population.dust,
      colour: normalise(population.hot),
    },
    halo: spheroidal ? (giant ? 0.02 : 0.006) : 0.004,
    starHost: 2,
    dust: [spheroidal ? 0 : 0.25 * population.dust, 0.4, 1.0],
    wind: [0, 0, 0, 1],
    procedural,
    proceduralExtent: 1.3,
  };
}

/** Observed disks keep their registration with the photograph: no rigid pattern rotation. */
export function hasObservedDiskMap(model: Pick<GalaxyModel, "key">) {
  return Boolean(OBSERVED_DISK_MAPS[model.key]);
}

// -------------------------------------------------------------------------------------------
// GLSL shared by the ray marcher and the star points
// -------------------------------------------------------------------------------------------

export const DISK_LAYER_GLSL = /* glsl */ `
uniform sampler2D uDiskYoung,uDiskOld,uProcYoung,uProcOld,uDiskParts;
uniform float uDiskObserved;
uniform vec4 uDiskExtent;   // observed half-extent, procedural half-extent, observed texel, procedural texel
uniform vec2 uDiskLod;      // log2 of the observed and procedural texel sizes
uniform vec4 uDiskHeights;  // old sech² z0, young h, ionised h, dust h
uniform vec4 uDiskShape;    // thick z0, thick fraction, flare, halo
uniform vec4 uDiskScale;    // observed young, old, tau max, procedural tau max
uniform vec3 uDiskDiffuse;  // diffuse dust: central tau, scale length, outer radius
uniform mat4 uDiskMat;      // local -> photograph [u w, v w, w]
uniform vec4 uDiskBulge;    // radius, fine-step core, amplitude over the central column, exponent 1/n
uniform vec4 uDiskBulgeAxes; // spheroid semi-axes (x, vertical y, z) and Sérsic coefficient b
uniform vec3 uDiskBulgeColor;
uniform vec2 uDiskBulgeTurn; // cos, sin of the azimuth of the spheroid's x semi-axis
uniform vec4 uKnot[${MAX_DISK_PARTS}]; // star-forming complexes: centre (local), size
uniform vec4 uKnotLight;    // young-light column, H II column, optical depth, count
uniform vec3 uKnotColor;
uniform vec3 uEarth;
uniform float uPartCount,uPartScale,uDiskStarHost;
uniform float uPartTexel[${MAX_DISK_PARTS}],uPartKind[${MAX_DISK_PARTS}],uPartCore[${MAX_DISK_PARTS}]; // core: c²
uniform vec4 uPartRect[${MAX_DISK_PARTS}],uPartAtlas[${MAX_DISK_PARTS}],uPartAxes[${MAX_DISK_PARTS}],uPartBound[${MAX_DISK_PARTS}];
uniform vec4 uPartDepth[${MAX_DISK_PARTS}]; // centre uv (xy), depth centre, depth extent
uniform vec4 uDiskWind;     // amplitude, tan(half opening), base radius, height scale
uniform sampler3D uNoise;
uniform float uSeed;
float diskSech2(float x){float e=exp(-2.*min(abs(x),30.));return 4.*e/((1.+e)*(1.+e));}
float diskFlare(float r){return 1.+uDiskShape.z*r*r;}
/** Feathered photograph frame of a disk-plane point (where the young-light map is valid). */
float diskPhotoFrame(vec2 xz){
 vec4 h=uDiskMat*vec4(xz.x,0.,xz.y,1.);
 if(h.z<=0.)return 0.;
 vec2 uv=h.xy/h.z,e=min(uv,1.-uv);
 return smoothstep(0.,.05,e.x)*smoothstep(0.,.05,e.y);
}
/** Weight of the photograph-derived maps at a disk-plane point (feathered frame). */
float diskPhoto(vec2 xz){
 if(uDiskObserved<.5)return 0.;
 vec2 uv=xz/(2.*uDiskExtent.x)+.5,em=min(uv,1.-uv);
 float photo=smoothstep(0.,.035,em.x)*smoothstep(0.,.035,em.y);
 return photo>0.?photo*diskPhotoFrame(xz):0.;
}
/** Young light (rgb) and face-on optical depth (a) at a disk-plane point. Inside a photograph's
 * frame the observed maps carry the disk; outside it (and for galaxies without one) the
 * procedural map continues it with the measured profile. */
vec4 diskYoungDust(vec2 xz,float lod,float photo){
 vec4 r=vec4(0.);
 if(photo>0.){
  // Young light (rgb) and sqrt-encoded dust (alpha) share one texture.
  vec4 yd=textureLod(uDiskYoung,xz/(2.*uDiskExtent.x)+.5,max(0.,lod-uDiskLod.x));
  r=vec4(yd.rgb*uDiskScale.x,yd.a*yd.a*uDiskScale.z)*photo;
 }
 if(photo<.999){
  vec2 uv=xz/(2.*uDiskExtent.y)+.5;
  if(all(greaterThan(uv,vec2(0.)))&&all(lessThan(uv,vec2(1.)))){
   vec4 y=textureLod(uProcYoung,uv,max(0.,lod-uDiskLod.y));
   r+=vec4(y.rgb,y.a*y.a*uDiskScale.w)*(1.-photo);
  }
 }
 return r;
}
/** Old light at a disk-plane point (its maps have a quarter of the young-light resolution). */
vec3 diskOld(vec2 xz,float lod,float photo){
 vec3 old=vec3(0.);
 if(photo>0.)
  old=textureLod(uDiskOld,xz/(2.*uDiskExtent.x)+.5,max(0.,lod-uDiskLod.x-2.)).rgb*uDiskScale.y*photo;
 if(photo<.999){
  vec2 uv=xz/(2.*uDiskExtent.y)+.5;
  if(all(greaterThan(uv,vec2(0.)))&&all(lessThan(uv,vec2(1.))))
   old+=textureLod(uProcOld,uv,max(0.,lod-uDiskLod.y-2.)).rgb*(1.-photo);
 }
 return old;
}
/** Face-on maps at a disk-plane point: young light, old light, face-on optical depth. */
void diskMaps(vec2 xz,float lod,out vec3 young,out vec3 old,out float tau){
 float photo=diskPhoto(xz);
 vec4 yd=diskYoungDust(xz,lod,photo);
 young=yd.rgb;tau=yd.a;old=diskOld(xz,lod,photo);
}
float diskDiffuseTau(float r){return uDiskDiffuse.x*exp(-r/uDiskDiffuse.y)*(1.-smoothstep(uDiskDiffuse.z*.82,uDiskDiffuse.z,r));}
/** Emission (per unit length) and extinction of the disk layers at q. Young light and dust
 * above their local mean on the scale lodC (the layers' projected thickness) belong to the
 * mid-plane sheet (diskSheet) with weight w; the layers keep the rest, so the face-on
 * column is unchanged. */
void diskLayer(vec3 q,float lod,float lodC,float w,out vec3 emission,out float kappa){
 emission=vec3(0.);kappa=0.;
 float r=length(q.xz),y=abs(q.y),f=diskFlare(r);
 float zt=uDiskShape.x*f;
 if(y>zt*3.6)return;
 float photo=diskPhoto(q.xz);
 float zo=uDiskHeights.x*f;
 float oldProfile=mix(diskSech2(y/zo)/(2.*zo),diskSech2(y/zt)/(2.*zt),uDiskShape.y);
 emission=diskOld(q.xz,lod,photo)*oldProfile;
 // Nine scale heights up, the young and dust layers hold about 0.01% of their mid-plane
 // density: only old stars are left to sample.
 if(y>9.*max(uDiskHeights.y,uDiskHeights.w)*f)return;
 vec4 yd=diskYoungDust(q.xz,lod,photo);
 if(w>0.&&lodC>lod+.5)yd=mix(yd,min(yd,diskYoungDust(q.xz,lodC,photo)),w);
 vec3 young=yd.rgb;
 float tau=yd.a;
 // H-alpha light (magenta) sits in a thinner layer than blue young stars.
 float s=young.r+young.g+young.b;
 float magenta=clamp((young.r+young.b-2.*young.g)/max(1e-5,s)*2.5,0.,1.);
 float h=mix(uDiskHeights.y,uDiskHeights.z,magenta)*f;
 float hd=uDiskHeights.w*f;
 emission+=young*exp(-y/h)/(2.*h);
 kappa=(tau+diskDiffuseTau(r))*exp(-y/hd)/(2.*hd);
}
/** Fine detail at a mid-plane point: young light (rgb) and optical depth (a) above their local
 * mean on the scale lodC. H II regions, young clusters and dust lanes lie close to the
 * mid-plane; the ray marcher draws this as a thin sheet where the ray crosses it. */
vec4 diskSheet(vec2 xz,float lod,float lodC){
 if(lodC<=lod+.5)return vec4(0.);
 float photo=diskPhoto(xz);
 return max(diskYoungDust(xz,lod,photo)-diskYoungDust(xz,lodC,photo),vec4(0.));
}
/** Spheroid (bulge, or a whole elliptical, dwarf or irregular's old population) and faint halo. */
vec3 diskBulge(vec3 q){
 vec3 light=vec3(0.);
 if(uDiskBulge.z>0.){
  vec3 b=vec3(uDiskBulgeTurn.x*q.x+uDiskBulgeTurn.y*q.z,q.y,uDiskBulgeTurn.x*q.z-uDiskBulgeTurn.y*q.x);
  float m=length(b/uDiskBulgeAxes.xyz)/uDiskBulge.x;
  // exp(-b m^(1/n)); uDiskBulge.z is pre-divided by the central face-on column (CPU). The
  // wings taper beyond 3-5.5 half-light radii, where photographs reach the sky level; a
  // de Vaucouleurs law kept to infinity fills the view with a grey glow.
  if(m<5.5)light+=uDiskBulgeColor*uDiskBulge.z*exp(-uDiskBulgeAxes.w*pow(m+.002,uDiskBulge.w))*(1.-smoothstep(3.,5.5,m));
 }
 if(uDiskShape.w>0.){
  float hm=length(q*vec3(1.,1.6,1.));
  light+=uDiskBulgeColor*uDiskShape.w*exp(-hm/.26)*(1.-smoothstep(1.,1.3,hm));
 }
 return light;
}
/** Named star-forming complexes as 3D clumps: young light, H II and dust, broken into
 * clusters by noise. Columns through a clump's centre equal uKnotLight (per unit size). */
vec3 diskKnots(vec3 q,out float kappa){
 vec3 light=vec3(0.);kappa=0.;
 for(int k=0;k<${MAX_DISK_PARTS};k++){
  if(float(k)>=uKnotLight.w)break;
  vec4 kn=uKnot[k];
  vec3 d=(q-kn.xyz)/kn.w;
  float r2=dot(d,d);
  if(r2>9.)continue;
  vec3 nq=(q-kn.xyz)/kn.w;
  float n1=texture(uNoise,nq*.09+kn.xyz*3.1).r,n2=texture(uNoise,nq*.23+kn.xyz*1.7).r;
  float clump=.2+.8*smoothstep(.38,.78,.6*n1+.4*n2);
  float a=exp(-r2*1.4)*clump/(1.5*kn.w);
  light+=(uKnotColor*uKnotLight.x*(.4+.6*n2)+vec3(1.,.28,.45)*uKnotLight.y*clump)*a;
  kappa+=uKnotLight.z*a;
 }
 return light;
}
/** Step bound near the complexes, so each is sampled several times. */
float diskKnotStep(vec3 q){
 float step=1e3;
 for(int k=0;k<${MAX_DISK_PARTS};k++){
  if(float(k)>=uKnotLight.w)break;
  vec4 kn=uKnot[k];
  step=min(step,max(length(q-kn.xyz)-2.5*kn.w,.35*kn.w));
 }
 return step;
}
/** Biconical starburst wind: edge-brightened cones of filamentary H-alpha emission. */
vec3 diskWind(vec3 q){
 if(uDiskWind.x<=0.)return vec3(0.);
 float y=abs(q.y);
 float cone=uDiskWind.z+y*uDiskWind.y;
 float rr=length(q.xz);
 float inside=(1.-smoothstep(cone*.55,cone*1.05,rr))*smoothstep(.012,.06,y);
 if(inside<=0.)return vec3(0.);
 // Filaments run along the outflow: noise in cone-relative coordinates, about eight times
 // longer along the axis than across it (uNoise is 64³ white noise; one texel = 1/64).
 vec3 n=vec3(q.x/(cone+.03)*.16,y*.05+(q.y<0.?.37:0.),q.z/(cone+.03)*.16);
 float f1=texture(uNoise,n+vec3(.13,uSeed*.017,.71)).r;
 float f2=texture(uNoise,n*vec3(2.3,1.6,2.3)+vec3(.57,.21,uSeed*.023)).r;
 float filament=pow(smoothstep(.38,.85,.62*f1+.38*f2),1.4);
 float shell=.35+.65*smoothstep(.25,.95,rr/max(cone,1e-3));
 return vec3(1.,.26,.32)*uDiskWind.x*inside*filament*shell*exp(-y/uDiskWind.w);
}
/** Step bound near image parts: thin sheets and compact spheroids need several samples across
 * their depth, wherever they sit relative to the disk plane. */
float diskPartStep(vec3 q){
 float step=1e3;
 for(int k=0;k<${MAX_DISK_PARTS};k++){
  if(float(k)>=uPartCount)break;
  vec4 b=uPartBound[k];
  float fine=max(.004,uPartDepth[k].w*.3);
  step=min(step,max(length(q-b.xyz)-b.w,fine));
 }
 return step;
}
/** Compact image parts (bulges, companions) extruded along Earth's sightline. */
vec3 diskParts(vec3 q,float lod){
 vec3 light=vec3(0.);
 for(int k=0;k<${MAX_DISK_PARTS};k++){
  if(float(k)>=uPartCount)break;
  vec4 b=uPartBound[k];
  if(length(q-b.xyz)>b.w)continue;
  vec4 h=uDiskMat*vec4(q,1.);
  if(h.z<=0.)continue;
  vec2 uv=h.xy/h.z,d=uv-uPartDepth[k].xy;
  vec4 ax=uPartAxes[k];
  float rho=length(vec2(dot(ax.xy,d),dot(ax.zw,d)));
  if(rho>1.)continue;
  // Compact (biweight) depth profile: a rounded spheroid with no faint tails along the
  // sightline. Its integral along the sightline is 1, so Earth's view equals the image.
  float dn=(dot(q,uEarth)-uPartDepth[k].z)/uPartDepth[k].w;
  float profile;
  if(uPartKind[k]>.5){
   // Spherical deprojection: for an emissivity j(r) proportional to (r^2+c^2)^-1.5 the light at
   // projected radius rho comes from depths d with weight s^2/(2(s^2+d^2)^1.5), s^2=rho^2+c^2.
   // The core c is measured from the part's own profile (its half-width at half maximum), so
   // flat-topped, display-stretched bulges stay round from the side. A parabolic window over
   // the chord |dn|<L=sqrt(1-rho^2) brings the light to zero at the outline, so a wide core
   // shows no hard spherical edge. Each sightline is renormalised by the closed-form column
   // L/q-(s^2/L^2)(asinh(L/s)-L/q), q=sqrt(1+c^2), so Earth's view equals the image.
   if(rho*rho+dn*dn>=1.)continue;
   float c2=uPartCore[k],s2=rho*rho+c2,l2=max(1.-rho*rho,.0025),r1=sqrt(l2/(1.+c2));
   float column=r1-s2/l2*(asinh(sqrt(l2/s2))-r1);
   profile=s2/(2.*pow(s2+dn*dn,1.5))*(1.-dn*dn/l2)/column/uPartDepth[k].w;
  }else{
   // Flattened slab (disturbed disk, tidal tail, gas): biweight depth profile, thinning
   // toward the outline. Its column is 1, so Earth's view equals the image.
   float e=1.6*sqrt(max(.03,1.-rho*rho));
   float z=dn/e;
   if(abs(z)>=1.)continue;
   float w=1.-z*z;
   profile=.9375*w*w/(e*uPartDepth[k].w);
  }
  vec4 rect=uPartRect[k],atlas=uPartAtlas[k];
  vec2 c=(uv-rect.xy)/(rect.zw-rect.xy);
  if(any(lessThan(c,vec2(0.)))||any(greaterThan(c,vec2(1.))))continue;
  float l=max(0.,lod-log2(uPartTexel[k]));
  light+=textureLod(uDiskParts,atlas.xy+c*(atlas.zw-atlas.xy),l).rgb*profile;
 }
 return light*uPartScale;
}
`;

// -------------------------------------------------------------------------------------------
// Procedural face-on maps (baked once per selected galaxy)
// -------------------------------------------------------------------------------------------

const PROCEDURAL_FRAGMENT = /* glsl */ `
precision highp float;
uniform float uPass,uExtent,uTauMax;
uniform vec2 uSize;
uniform float uArms,uPitch,uBar,uBarAngle,uRing,uRingWidth,uSeed,uFlocculent,uGrand,uLenticular,uClumps,uAsymmetry,uLanes;
uniform vec4 uScales;   // old scale, young scale, outer radius, unused
uniform vec4 uAmps;     // old, young, H II, dust
uniform vec3 uOldColor,uYoungColor;
uniform vec4 uPatch;
uniform float uIrregular;
uniform vec3 uEnvelope;   // irregular envelope: centre offset (x, z), minor/major axis ratio
uniform float uArmCount;
uniform vec2 uArmKnot[${MAX_TABLE_ARMS * MAX_ARM_KNOTS}]; // azimuth (decreasing outward), ln(radius)
uniform vec3 uArmLight[${MAX_TABLE_ARMS}]; // knot count, old-star strength, young strength
uniform vec2 uArmWidth;   // Gaussian sigma across an arm: x + y·r
layout(location=0)out vec4 outColor;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash12(i),hash12(i+vec2(1,0)),u.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<6;i++){s+=a*vnoise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+17.17;a*=.5;}return s/.984;}
float fbm4(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vnoise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+17.17;a*=.5;}return s/.9375;}
// F1 distance and cell identity of a jittered grid.
vec2 worley(vec2 p){vec2 i=floor(p),f=fract(p);float d1=9.,id=0.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=hash22(i+g);vec2 r=g+o-f;float d=dot(r,r);
  if(d<d1){d1=d;id=hash12(i+g+uSeed*7.13);}}
 return vec2(sqrt(d1),id);}
const float TAU=6.2831853;
/** Sourced arm table: log-spiral segments between knots. Gives the young and old arm light, the
 * dust lane on the inner edge, and for the brightest arm its index, its azimuth along the arm
 * and the offset across it in sigma (positive outward). Sigma is the measured width of the
 * star-forming ridge; young light is drawn 1.5 and old-star light 3 times as wide. */
void tableArms(float r,float th,out float young,out float old,out float lane,out vec3 ridge){
 young=0.;old=0.;lane=0.;ridge=vec3(0.,0.,9.);
 float lr=log(max(r,1e-4)),sigma=uArmWidth.x+uArmWidth.y*r;
 for(int a=0;a<${MAX_TABLE_ARMS};a++){
  if(float(a)>=uArmCount)break;
  vec3 light=uArmLight[a];
  int last=int(light.x)-1;
  float first=uArmKnot[a*${MAX_ARM_KNOTS}].x,end=uArmKnot[a*${MAX_ARM_KNOTS}+last].x;
  float fade=min(.3,.25*(first-end)),s=9.,beta=0.;
  for(int k=0;k<last;k++){
   vec2 k0=uArmKnot[a*${MAX_ARM_KNOTS}+k],k1=uArmKnot[a*${MAX_ARM_KNOTS}+k+1];
   float slope=(k1.y-k0.y)/(k0.x-k1.x);
   for(int n=-1;n<=1;n++){
    float b=th+TAU*float(n);
    if(b>k0.x||b<k1.x)continue;
    float d=(lr-mix(k0.y,k1.y,(k0.x-b)/(k0.x-k1.x)))*r/(sigma*sqrt(1.+slope*slope));
    if(abs(d)<abs(s)){s=d;beta=b;}
   }
  }
  if(abs(s)>8.)continue;
  float taper=smoothstep(0.,fade,first-beta)*smoothstep(0.,fade,beta-end);
  float y=light.z*taper*exp(-.222*s*s);
  if(y>young){young=y;ridge=vec3(float(a),beta,s);}
  old=max(old,light.y*taper*exp(-.0556*s*s));
  lane=max(lane,light.z*taper*exp(-pow((s+1.5)/.55,2.)));
 }
}
void main(){
 vec2 p=(gl_FragCoord.xy/uSize-.5)*2.*uExtent;
 float r=length(p),th=atan(p.y,p.x);
 float outer=uScales.z;
 float edge=1.-smoothstep(outer*.8,outer*1.12,r);
 // Large-scale lopsidedness and arm irregularity.
 vec2 warpP=p*1.6+uSeed*3.1;
 float warp=(fbm(warpP)-.5)*(.7+uAsymmetry*4.);
 float m=max(1.,uArms);
 float launch=max(.05,uBar*.95);
 float tanP=tan(uPitch);
 float lr=log(max(r,launch*.55)/launch);
 float phi=th-uBarAngle-lr/tanP+warp*(.55+.45*smoothstep(.2,.9,r));
 float wave=.5+.5*cos(m*phi);
 float armIdx=mod(floor(m*phi/TAU+.5),m);
 float armGain=.72+.56*hash12(vec2(armIdx,uSeed));
 // Arms break into segments along their length (lr runs along a logarithmic spiral).
 float along=vnoise(vec2(lr*mix(2.6,5.5,uFlocculent),armIdx*7.31+uSeed));
 float segment=mix(.55+.45*along,smoothstep(.3,.7,along),uFlocculent);
 float sharp=mix(3.4,6.5,uGrand)*mix(1.,.5,uFlocculent);
 float region=smoothstep(launch*.75,launch*(uBar>0.?1.1:1.5),r)*edge;
 float arm=pow(wave,sharp)*region*segment*armGain*(1.-uLenticular);
 // Real arms are ragged: their light breaks into sheared clumps along and across them.
 // Arm-aligned coordinates, continuous across the atan seam (m is an integer).
 vec2 armUv=vec2(lr*7.+armIdx*13.7,0.)+.5*vec2(cos(m*phi),sin(m*phi));
 float rag=.6*fbm4(armUv+vec2(warp*1.3,uSeed*4.1))+.4*fbm4(p*13.+uSeed*1.9);
 arm*=.42+.95*smoothstep(.3,.72,rag);
 // Flocculent disks: many short, sheared fragments.
 float flocks=smoothstep(.52,.78,fbm(vec2(p.x*cos(.6)-p.y*sin(.6),p.x*sin(.6)+p.y*cos(.6))*9.+uSeed))*uFlocculent*region;
 arm=max(arm,flocks*.85*(1.-uLenticular));
 // Dust lanes trace the inner (upstream) edge of the arms, with spurs crossing the interarm.
 float lane=pow(.5+.5*cos(m*phi-.55),sharp*3.2+4.)*region*mix(.7+.3*along,segment,.5)*armGain*(1.-uLenticular);
 lane*=.55+.9*smoothstep(.3,.7,fbm(p*16.+uSeed*2.9));
 float rel=fract(m*phi/TAU);
 float spurPhase=th-lr/tan(1.05)+warp*.4;
 float spurs=pow(.5+.5*cos(floor(m*5.+1.)*spurPhase+fbm(p*7.+uSeed)*3.),14.)*smoothstep(.58,.82,rel)*(1.-smoothstep(.9,.99,rel))*region*(1.-uLenticular);
 float armOld=arm,mottle=0.;
 if(uArmCount>.5){
  // Sourced arms (the Milky Way). Azimuth is the fits' own: 0 toward the Sun and increasing
  // with rotation, so the arms trail. Old stars follow broad arms, young stars narrow ones.
  float y,o,l;vec3 ridge;
  tableArms(r,th,y,o,l,ridge);
  region=smoothstep(.1,.18,r)*edge;
  along=vnoise(vec2(ridge.y*2.3,ridge.x*7.31+uSeed));
  rag=.6*fbm4(vec2(ridge.y*4.+ridge.x*13.7,ridge.z*.6)+uSeed*4.1)+.4*fbm4(p*13.+uSeed*1.9);
  arm=y*region*(.5+.5*smoothstep(.2,.75,along))*(.42+.95*smoothstep(.3,.72,rag));
  armOld=o*region;
  lane=l*region*(.7+.3*along)*(.55+.9*smoothstep(.3,.7,fbm(p*16.+uSeed*2.9)));
  // Spurs leave the outer, downstream edge of an arm at a steeper pitch (about 60°).
  spurs=.6*pow(.5+.5*cos(21.*(th+lr/tan(1.05))+fbm(p*7.+uSeed)*3.),10.)*smoothstep(1.2,2.2,ridge.z)*(1.-smoothstep(4.,7.,ridge.z))*smoothstep(.2,.36,r)*edge;
  // Faint, sheared star-forming fragments between the arms.
  float shear=th+lr/tan(.38);
  float fragments=smoothstep(.55,.8,fbm(vec2(cos(shear),sin(shear))*3.5+lr*vec2(5.,-3.5)+uSeed));
  arm=max(arm,.3*fragments*region*smoothstep(2.2,4.,abs(ridge.z)));
  // Feathery dust lanes between and across the arms, sheared like the fragments.
  float web=fbm(vec2(cos(shear),sin(shear))*6.+lr*vec2(9.,-6.)+uSeed*2.3);
  mottle=1.4*pow(1.-abs(2.*web-1.),2.5)*smoothstep(.35,.7,fbm(p*5.+uSeed*.7))*region;
 }
 float patchy=smoothstep(.55,.8,fbm(p*14.+uSeed*1.7))*region*(1.-uLenticular);
 // Bar (Ferrers-like) with offset dust lanes along its leading edges, and the inner ring at its ends.
 float ca=cos(uBarAngle),sa=sin(uBarAngle);
 vec2 b=vec2(ca*p.x+sa*p.y,-sa*p.x+ca*p.y);
 float bar=0.,barLane=0.;
 if(uBar>0.){
  float q=1.-pow(b.x/uBar,2.)-pow(b.y/(uBar*.26),2.);
  bar=max(q,0.);
  float offset=uBar*.13*tanh(b.x/(uBar*.28));
  barLane=exp(-pow((b.y-offset)/(uBar*.035),2.))*smoothstep(uBar*.12,uBar*.3,abs(b.x))*(1.-smoothstep(uBar*.82,uBar*1.05,abs(b.x)));
  // Beside sourced arms: a softer-edged (Ferrers n = 2) bar with fainter dust lanes.
  if(uArmCount>.5){bar*=bar*.9;barLane*=.45;}
 }
 float ring=uRing>0.?exp(-pow((r-uRing)/uRingWidth,2.)):0.;
 // A sourced arm table already carries the arm segments that surround the bar.
 if(uBar>0.&&uArmCount<.5)ring=max(ring,.7*exp(-pow((r-uBar*1.02)/(uBar*.12),2.))*(1.-uLenticular));
 // Irregular galaxies: no arms. Young light sits in large star-forming complexes and smaller
 // associations inside a lopsided elliptical envelope (offset centre, sourced axis ratio).
 float rr=r;
 if(uIrregular>.5){
  vec2 e=(p-uEnvelope.xy)*vec2(1.,1./uEnvelope.z);
  rr=length(e);
  float env=1.-smoothstep(.72,1.12,rr);
  float big=smoothstep(.42,.78,fbm4(p*2.4+uSeed*3.3));
  float mid=smoothstep(.5,.82,fbm4(p*6.5+uSeed*1.7));
  arm=(big*.8+mid*.55)*env;
  region=env;
  lane=0.;spurs=0.;
  patchy=smoothstep(.55,.8,fbm(p*9.+uSeed*1.7))*env;
 }
 // Star-forming knots: H II regions and young clusters on the arms and ring.
 float host=max(arm,ring*(1.-uLenticular*.8));
 // H II regions are drawn smaller beside sourced arms, which are seen from close by.
 vec2 cellA=worley(p*(uArmCount>.5?92.:58.)+uSeed);
 float hiiOn=step(cellA.y,(.22+.75*uClumps)*smoothstep(.15,.8,host));
 float hiiSize=.18+.32*fract(cellA.y*13.7);
 float hii=hiiOn*exp(-pow(cellA.x/hiiSize,2.))*(.25+pow(fract(cellA.y*91.3),3.)*2.2);
 vec2 cellB=worley(p*150.+uSeed*2.3);
 float cluster=step(cellB.y,.55*smoothstep(.1,.7,host))*exp(-pow(cellB.x/.2,2.))*(.3+fract(cellB.y*57.1));
 float grain=fbm4(p*30.+uSeed*5.);
 if(uPass<.5){
  float youngDisk=uAmps.y*exp(-rr/uScales.y)*region;
  float knots=smoothstep(.4,.85,grain);
  vec3 young=uYoungColor*youngDisk*(arm*(.3+1.15*knots)+ring*(.35+.7*knots)+.02*region);
  young+=uYoungColor*uAmps.y*exp(-rr/uScales.y)*cluster*.9*region;
  young+=vec3(1.,.3,.52)*uAmps.z*exp(-rr/uScales.y)*hii*region;
  float dust=uAmps.w*exp(-r/(uScales.x*1.35))*edge*(uLanes*(lane*1.15+spurs*.55+barLane*1.4)+patchy*.25*(.4+.6*uLanes)+ring*.35*uLanes+mottle);
  if(uIrregular>.5)dust=uAmps.w*exp(-rr/(uScales.y*1.5))*region*(patchy*.6+arm*.4);
  if(uPatch.w>0.)dust+=uPatch.w*exp(-pow(length(p-uPatch.xy)/uPatch.z,2.))*(.6+.6*fbm(p*20.));
  if(uRing>0.&&uLenticular>.5)dust+=uAmps.w*exp(-pow((r-uRing)/(uRingWidth*.65),2.))*(.75+.5*fbm(p*18.));
  outColor=vec4(max(young,vec3(0.)),sqrt(clamp(dust/uTauMax,0.,1.)));
 }else{
  float disk=uAmps.x*exp(-r/uScales.x)*edge;
  float lens=uLenticular*.35*uAmps.x*exp(-pow(r/(uScales.x*.9),2.));
  // Density-wave arms gather old stars too (K-band arm contrast: Rix & Zaritsky 1995),
  // weakly in flocculent disks (Thornley 1996), so the interarm disk is darker than the arms.
  // Sourced arms carry their own old-star strengths.
  float oldArm=uArmCount>.5?.5:mix(.8,.25,uFlocculent)*(1.-uLenticular);
  vec3 old=uOldColor*(disk*(1.-.35*oldArm+oldArm*1.1*armOld-.3*lane*uLanes)+lens+uAmps.x*bar*1.35+uAmps.x*ring*.12*uLenticular);
  outColor=vec4(max(old,vec3(0.)),1.);
 }
}`;

/** Owns the selected galaxy's face-on maps: observed textures and/or procedural bakes. */
export class GalaxyDiskMaps {
  readonly procYoung: THREE.WebGLRenderTarget;
  readonly procOld: THREE.WebGLRenderTarget;
  /** Observed young light (rgb) and dust (alpha), packed on the GPU after loading. */
  observedPacked: THREE.WebGLRenderTarget | null = null;
  observedOld: THREE.Texture | null = null;
  parts: THREE.Texture | null = null;
  private pending: { young: THREE.Texture; dust: THREE.Texture } | null = null;
  private baked = false;
  private observedState: "none" | "loading" | "ready" | "failed";
  private readonly material: THREE.ShaderMaterial;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.Camera();
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly controller = new AbortController();
  private bitmaps: ImageBitmap[] = [];
  constructor(
    readonly spec: DiskLayerSpec,
    readonly size: number,
  ) {
    const target = (s: number) =>
      new THREE.WebGLRenderTarget(s, s, {
        type: THREE.UnsignedByteType,
        format: THREE.RGBAFormat,
        colorSpace: THREE.SRGBColorSpace,
        minFilter: THREE.LinearMipmapLinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: true,
        depthBuffer: false,
        stencilBuffer: false,
      });
    this.procYoung = target(size);
    this.procOld = target(Math.max(128, size / 4));
    this.procYoung.texture.name = "Galaxy procedural young-light and dust map";
    this.procOld.texture.name = "Galaxy procedural old-light map";
    const p = spec.procedural;
    this.material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader: PROCEDURAL_FRAGMENT,
      uniforms: {
        uPass: { value: 0 },
        uExtent: { value: spec.proceduralExtent },
        uTauMax: { value: PROCEDURAL_TAU_MAX },
        uSize: { value: new THREE.Vector2(size, size) },
        uArms: { value: p.arms },
        uPitch: { value: p.pitch },
        uBar: { value: p.bar },
        uBarAngle: { value: p.barAngle },
        uRing: { value: p.ring },
        uRingWidth: { value: p.ringWidth },
        uSeed: { value: p.seed },
        uFlocculent: { value: p.flocculent },
        uGrand: { value: p.grand },
        uLenticular: { value: p.lenticular },
        uClumps: { value: p.clumps },
        uAsymmetry: { value: p.asymmetry },
        uLanes: { value: p.lanes },
        uScales: { value: new THREE.Vector4(p.oldScale, p.youngScale, p.outer, 0) },
        uAmps: { value: new THREE.Vector4(p.oldAmp, p.youngAmp, p.hiiAmp, p.dustAmp) },
        uOldColor: { value: new THREE.Vector3(...p.oldColour) },
        uYoungColor: { value: new THREE.Vector3(...p.youngColour) },
        uPatch: { value: new THREE.Vector4(...p.patch) },
        uIrregular: { value: p.irregular },
        uEnvelope: { value: new THREE.Vector3(...p.envelope) },
        uArmCount: { value: p.armTable.length },
        uArmKnot: {
          value: Array.from({ length: MAX_TABLE_ARMS * MAX_ARM_KNOTS }, (_, i) => {
            const knot = p.armTable[Math.floor(i / MAX_ARM_KNOTS)]?.knots[i % MAX_ARM_KNOTS];
            return new THREE.Vector2(knot?.[0] ?? 0, (knot?.[1] ?? 0) + Math.log(p.armScale));
          }),
        },
        uArmLight: {
          value: Array.from({ length: MAX_TABLE_ARMS }, (_, i) => {
            const arm = p.armTable[i];
            return new THREE.Vector3(arm?.knots.length ?? 0, arm?.old ?? 0, arm?.young ?? 0);
          }),
        },
        uArmWidth: {
          value: new THREE.Vector2(MILKY_WAY_ARM_WIDTH[0] * p.armScale, MILKY_WAY_ARM_WIDTH[1]),
        },
      },
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    this.observedState = spec.observed ? "loading" : "none";
    if (spec.observed) void this.loadObserved(spec.observed);
  }
  get ready() {
    return this.baked && this.observedState !== "loading";
  }
  /** Packs the observed young and dust maps into one mipmapped sRGB texture. */
  private pack(gl: THREE.WebGLRenderer) {
    const pending = this.pending;
    if (!pending) return;
    const size = (pending.young.image as ImageBitmap).width;
    const target = new THREE.WebGLRenderTarget(size, size, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: true,
      depthBuffer: false,
      stencilBuffer: false,
    });
    target.texture.name = "Galaxy observed young-light and dust map";
    const material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      uniforms: {
        uYoung: { value: pending.young },
        uDust: { value: pending.dust },
        uSize: { value: size },
      },
      vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
      fragmentShader:
        "precision highp float;uniform sampler2D uYoung,uDust;uniform float uSize;layout(location=0)out vec4 outColor;" +
        "void main(){vec2 uv=gl_FragCoord.xy/uSize;outColor=vec4(texture(uYoung,uv).rgb,texture(uDust,uv).r);}",
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    const scene = new THREE.Scene().add(mesh);
    const previous = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel();
    try {
      gl.setRenderTarget(target);
      gl.render(scene, this.camera);
    } finally {
      gl.setRenderTarget(previous, face, mip);
      material.dispose();
    }
    pending.young.dispose();
    pending.dust.dispose();
    this.pending = null;
    this.observedPacked = target;
    this.observedState = "ready";
  }
  get observedReady() {
    return this.observedState === "ready";
  }
  get observedMaps() {
    return this.observedState === "ready" && this.observedPacked !== null;
  }
  /** One-time bake of the procedural maps (two full-screen draws). */
  bake(gl: THREE.WebGLRenderer) {
    if (this.pending) this.pack(gl);
    if (this.baked) return;
    const previous = gl.getRenderTarget(),
      face = gl.getActiveCubeFace(),
      mip = gl.getActiveMipmapLevel();
    try {
      for (const [pass, target] of [
        [0, this.procYoung],
        [1, this.procOld],
      ] as const) {
        this.material.uniforms.uPass.value = pass;
        this.material.uniforms.uSize.value.set(target.width, target.height);
        gl.setRenderTarget(target);
        gl.render(this.scene, this.camera);
      }
    } finally {
      gl.setRenderTarget(previous, face, mip);
    }
    this.baked = true;
  }
  private async loadObserved(map: ObservedDiskMap) {
    const load = async (url: string, colour: boolean, resize?: number) => {
      const response = await fetch(url, { signal: this.controller.signal });
      if (!response.ok) throw Error("Galaxy disk map " + response.status + " " + url);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "flipY",
        premultiplyAlpha: "none",
        colorSpaceConversion: "none",
        ...(resize
          ? { resizeWidth: resize, resizeHeight: resize, resizeQuality: "high" as const }
          : {}),
      });
      this.bitmaps.push(bitmap);
      const texture = new THREE.Texture(bitmap);
      texture.colorSpace = colour ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.needsUpdate = true;
      return texture;
    };
    if (!map.detail || !map.smooth || !map.dust) {
      try {
        const parts = map.parts ? await load(map.parts.url, true) : null;
        if (this.controller.signal.aborted) return parts?.dispose();
        this.parts = parts;
        this.observedState = "ready";
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.warn("Observed galaxy parts unavailable", map.key, error);
        this.observedState = "failed";
      }
      return;
    }
    const resize = this.size < map.detail.size ? this.size : undefined;
    try {
      const [young, old, dust, parts] = await Promise.all([
        load(map.detail.url, true, resize),
        load(map.smooth.url, true),
        load(map.dust.url, false, resize),
        map.parts ? load(map.parts.url, true) : Promise.resolve(null),
      ]);
      if (this.controller.signal.aborted) {
        for (const t of [young, old, dust, parts]) t?.dispose();
        return;
      }
      this.observedOld = old;
      this.parts = parts;
      // Packed (and marked ready) on the next frame, where the renderer is available.
      this.pending = { young, dust };
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.warn(
        "Observed galaxy disk maps unavailable; using the procedural disk",
        map.key,
        error,
      );
      this.observedState = "failed";
    }
  }
  dispose() {
    this.controller.abort();
    this.procYoung.dispose();
    this.procOld.dispose();
    this.material.dispose();
    this.geometry.dispose();
    for (const t of [this.observedOld, this.parts, this.pending?.young, this.pending?.dust])
      t?.dispose();
    this.observedPacked?.dispose();
    for (const b of this.bitmaps) b.close();
    this.bitmaps = [];
  }
}

/** Encoded procedural dust: alpha = sqrt(tau / PROCEDURAL_TAU_MAX). */
export const PROCEDURAL_TAU_MAX = 4;

/** Uniforms read by DISK_LAYER_GLSL. */
export function diskLayerUniforms(model: GalaxyModel, spec: DiskLayerSpec) {
  const o = spec.observed;
  const image = o ? OBSERVED_IMAGE_BY_KEY.get(model.key) : undefined;
  const parts = o?.parts?.items ?? [];
  const blank = Array.from({ length: MAX_DISK_PARTS }, () => new THREE.Vector4());
  const partTexel = Array.from({ length: MAX_DISK_PARTS }, (_, i) => parts[i]?.texel ?? 1);
  const partKind = Array.from({ length: MAX_DISK_PARTS }, (_, i) =>
    parts[i]?.kind === "sheet" ? 0 : 1,
  );
  const partCore = Array.from({ length: MAX_DISK_PARTS }, (_, i) => (parts[i]?.core ?? 0.06) ** 2);
  return {
    uDiskYoung: { value: null as THREE.Texture | null },
    uDiskOld: { value: null as THREE.Texture | null },
    uProcYoung: { value: null as THREE.Texture | null },
    uProcOld: { value: null as THREE.Texture | null },
    uDiskParts: { value: null as THREE.Texture | null },
    uDiskObserved: { value: 0 },
    uDiskExtent: {
      value: new THREE.Vector4(
        o?.extent ?? 1,
        spec.proceduralExtent,
        o?.detail ? (2 * o.extent) / o.detail.size : 1,
        (2 * spec.proceduralExtent) / 2048,
      ),
    },
    uDiskLod: {
      value: new THREE.Vector2(
        Math.log2(o?.detail ? (2 * o.extent) / o.detail.size : 1),
        Math.log2((2 * spec.proceduralExtent) / 2048),
      ),
    },
    uDiskHeights: {
      value: new THREE.Vector4(
        spec.heights.old,
        spec.heights.young,
        spec.heights.ionised,
        spec.heights.dust,
      ),
    },
    uDiskShape: {
      value: new THREE.Vector4(spec.thick.z0, spec.thick.fraction, spec.flare, spec.halo),
    },
    uDiskScale: {
      value: new THREE.Vector4(
        o?.detail?.scale ?? 0,
        o?.smooth?.scale ?? 0,
        o?.dust?.tauMax ?? 0,
        PROCEDURAL_TAU_MAX,
      ),
    },
    uDiskDiffuse: { value: new THREE.Vector3(...spec.dust) },
    uDiskReach: { value: spec.reach },
    uDiskWind: { value: new THREE.Vector4(...spec.wind) },
    uDiskMat: { value: image ? observedImageMatrix(model, image) : new THREE.Matrix4() },
    uDiskBulge: {
      value: new THREE.Vector4(
        spec.bulge.radius,
        spec.bulge.flattening,
        spec.bulge.amplitude > 0
          ? spec.bulge.amplitude /
              spheroidColumn(
                spec.bulge.radius,
                spec.bulge.axes[1],
                spec.bulge.exponent,
                spec.bulge.coefficient,
              )
          : 0,
        spec.bulge.exponent,
      ),
    },
    uDiskBulgeAxes: { value: new THREE.Vector4(...spec.bulge.axes, spec.bulge.coefficient) },
    uDiskBulgeTurn: {
      value: new THREE.Vector2(Math.cos(spec.bulge.turn), Math.sin(spec.bulge.turn)),
    },
    uDiskInterior: { value: new THREE.Vector2(...spec.interior) },
    uKnot: {
      value: Array.from(
        { length: MAX_DISK_PARTS },
        (_, i) => new THREE.Vector4(...(spec.knots.items[i] ?? [0, 0, 0, 1])),
      ),
    },
    uKnotLight: {
      value: new THREE.Vector4(
        spec.knots.hot,
        spec.knots.hii,
        spec.knots.dust,
        Math.min(MAX_DISK_PARTS, spec.knots.items.length),
      ),
    },
    uKnotColor: { value: new THREE.Vector3(...spec.knots.colour) },
    uDiskBulgeColor: { value: new THREE.Vector3(...spec.bulge.colour) },
    uEarth: { value: earthDirectionLocal(model) },
    uPartCount: { value: 0 },
    uPartScale: { value: o?.parts?.scale ?? 0 },
    uPartTexel: { value: partTexel },
    uPartKind: { value: partKind },
    uPartCore: { value: partCore },
    uDiskStarHost: { value: spec.starHost },
    uPartRect: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(...p.uvRect))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartAtlas: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(...p.atlasRect))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartAxes: {
      value: parts.length
        ? parts
            .map((p) => new THREE.Vector4(p.axisA[0], p.axisA[1], p.axisB[0], p.axisB[1]))
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartBound: {
      value: parts.length
        ? parts
            .map(
              (p) =>
                new THREE.Vector4(p.centre[0], p.centre[1], p.centre[2], p.radius + p.depthExtent),
            )
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
    uPartDepth: {
      value: parts.length
        ? parts
            .map(
              (p) => new THREE.Vector4(p.centreUv[0], p.centreUv[1], p.depthCentre, p.depthExtent),
            )
            .concat(blank)
            .slice(0, MAX_DISK_PARTS)
        : blank,
    },
  };
}
export type DiskLayerUniforms = ReturnType<typeof diskLayerUniforms>;

/** Binds the current textures of a map owner into disk-layer uniforms. */
export function bindDiskMaps(uniforms: DiskLayerUniforms, maps: GalaxyDiskMaps) {
  uniforms.uProcYoung.value = maps.procYoung.texture;
  uniforms.uProcOld.value = maps.procOld.texture;
  const observed = maps.observedMaps;
  uniforms.uDiskObserved.value = observed ? 1 : 0;
  uniforms.uDiskYoung.value = observed ? maps.observedPacked!.texture : maps.procYoung.texture;
  uniforms.uDiskOld.value = observed ? maps.observedOld : maps.procOld.texture;
  uniforms.uDiskParts.value = maps.parts ?? maps.procOld.texture;
  uniforms.uPartCount.value =
    maps.observedReady && maps.parts
      ? Math.min(MAX_DISK_PARTS, maps.spec.observed?.parts?.items.length ?? 0)
      : 0;
  uniforms.uDiskExtent.value.w = (2 * maps.spec.proceduralExtent) / maps.size;
  const observedSize = maps.observedPacked?.width;
  if (observed && observedSize && maps.spec.observed)
    uniforms.uDiskExtent.value.z = (2 * maps.spec.observed.extent) / observedSize;
  uniforms.uDiskLod.value.set(
    Math.log2(uniforms.uDiskExtent.value.z),
    Math.log2(uniforms.uDiskExtent.value.w),
  );
}
