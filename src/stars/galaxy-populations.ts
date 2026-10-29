import { NEARBY_MEASUREMENT_BY_NAME } from "./nearby-galaxy-data";
import type { GalaxyModel } from "./galaxy-models";
export type PopulationKnot = readonly [number, number, number, number];
export type GalaxyPopulation = {
  kind: 1 | 2 | 3 | 4;
  axes: [number, number, number];
  core: number;
  continuum: number;
  hotFraction: number;
  dust: number;
  hii: number;
  tail: number;
  old: [number, number, number];
  hot: [number, number, number];
  knots: readonly PopulationKnot[];
  note: string;
  source: string;
};
const spheroid: GalaxyPopulation = {
  kind: 1,
  axes: [1, 0.55, 0.75],
  core: 0.38,
  continuum: 0.16,
  hotFraction: 0.08,
  dust: 0,
  hii: 0,
  tail: 0,
  old: [1, 0.76, 0.46],
  hot: [0.53, 0.72, 1],
  knots: [],
  note: "Diffuse old stellar population; blue horizontal-branch stars are not new star formation.",
  source: "https://academic.oup.com/mnras/article/532/4/4157/7718108",
};
const irregular: GalaxyPopulation = {
  ...spheroid,
  kind: 2,
  axes: [1, 0.32, 0.68],
  core: 0.55,
  continuum: 0.12,
  hotFraction: 0.48,
  dust: 0.12,
  hii: 0.4,
  old: [1, 0.77, 0.52],
  hot: [0.38, 0.65, 1],
  note: "Asymmetric stellar associations and H-alpha regions; unresolved depth is illustrative.",
  source: "https://www.eso.org/public/news/eso1603/",
};
function sph(p: Partial<GalaxyPopulation>): GalaxyPopulation {
  return { ...spheroid, ...p };
}
function irr(p: Partial<GalaxyPopulation>): GalaxyPopulation {
  return { ...irregular, ...p };
}
export const GALAXY_POPULATIONS: Record<string, GalaxyPopulation> = {
  "Sagittarius Dwarf": sph({
    axes: [1, 0.34, 0.46],
    core: 0.46,
    continuum: 0.1,
    hotFraction: 0.06,
    tail: 0.42,
    knots: [[0, 0, 0, 0.018]],
    note: "Elongated, tidally disrupted spheroidal body and a compact illustrative M54 region.",
    source:
      "https://www.esa.int/ESA_Multimedia/Images/2018/09/The_Sagittarius_dwarf_galaxy_in_Gaia_s_all-sky_view",
  }),
  "Canis Major Dwarf": sph({
    kind: 4,
    axes: [1, 0.16, 0.42],
    core: 0.62,
    continuum: 0.045,
    hotFraction: 0.025,
    tail: 0.22,
    note: "Diffuse Canis Major stellar overdensity; its interpretation as a separate dwarf galaxy is disputed.",
    source: "https://arxiv.org/abs/astro-ph/0603385",
  }),
  "NGC 205 (M110)": sph({
    axes: [1, 0.52, 0.57],
    core: 0.24,
    continuum: 0.42,
    dust: 0.65,
    hotFraction: 0.14,
    old: [1, 0.86, 0.68],
    knots: [
      [-0.12, 0.015, 0.07, 0.055],
      [0.16, -0.01, -0.05, 0.04],
    ],
    note: "Elongated dwarf elliptical with localized dust and a modest younger central population.",
    source:
      "https://science.nasa.gov/image-article/apod-2008-september-9-m110-satellite-of-the-andromeda-galaxy/",
  }),
  M32: sph({
    axes: [1, 0.77, 0.82],
    core: 0.13,
    continuum: 1.2,
    hotFraction: 0.035,
    old: [1, 0.87, 0.65],
    note: "Compact, centrally concentrated elliptical with a bright old stellar nucleus.",
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-32/",
  }),
  "Leo I": sph({
    axes: [1, 0.67, 0.76],
    core: 0.29,
    continuum: 0.22,
    hotFraction: 0.1,
    old: [1, 0.82, 0.59],
    source:
      "https://science.nasa.gov/image-article/apod-2024-april-26-regulus-and-the-dwarf-galaxy/",
  }),
  "Leo II": sph({
    axes: [1, 0.78, 0.91],
    core: 0.43,
    continuum: 0.13,
    hotFraction: 0.14,
    old: [0.95, 0.82, 0.68],
  }),
  "Draco Dwarf": sph({
    axes: [1, 0.51, 0.69],
    core: 0.36,
    continuum: 0.09,
    hotFraction: 0.16,
    old: [1, 0.75, 0.46],
  }),
  "Sculptor Dwarf": sph({
    axes: [1, 0.54, 0.68],
    core: 0.37,
    continuum: 0.11,
    hotFraction: 0.13,
    old: [1, 0.71, 0.38],
    note: "A diffuse, ancient metal-poor stellar population, not a luminous gas cloud.",
    source: "https://www.eso.org/public/news/eso1536/",
  }),
  "Fornax Dwarf": sph({
    axes: [1, 0.59, 0.7],
    core: 0.48,
    continuum: 0.15,
    hotFraction: 0.06,
    old: [1, 0.65, 0.33],
    knots: [
      [-0.48, 0.06, 0.3, 0.015],
      [0.27, -0.08, 0.38, 0.019],
      [0.05, 0.11, -0.42, 0.016],
      [-0.21, -0.13, -0.2, 0.013],
      [0.48, 0.03, -0.14, 0.017],
    ],
    note: "Broad mixed-age stellar population with five representative globular clusters; cluster positions are illustrative.",
    source: "https://www.eso.org/public/archives/techdocs/pdf/report_0009.pdf",
  }),
  "Carina Dwarf": sph({
    axes: [1, 0.49, 0.65],
    core: 0.47,
    continuum: 0.075,
    hotFraction: 0.12,
    old: [1, 0.82, 0.58],
  }),
  "Sextans Dwarf": sph({
    axes: [1, 0.56, 0.7],
    core: 0.66,
    continuum: 0.045,
    hotFraction: 0.14,
    old: [1, 0.84, 0.68],
    note: "Very low surface brightness, extended stellar body with no invented gas clouds.",
  }),
  "Ursa Minor Dwarf": sph({
    axes: [1, 0.36, 0.45],
    core: 0.49,
    continuum: 0.07,
    hotFraction: 0.18,
    old: [0.96, 0.8, 0.61],
    tail: 0.1,
  }),
  "NGC 185": sph({
    axes: [1, 0.65, 0.84],
    core: 0.24,
    continuum: 0.34,
    hotFraction: 0.12,
    dust: 0.85,
    old: [1, 0.79, 0.53],
    knots: [
      [-0.055, 0.02, 0.02, 0.065],
      [0.07, -0.01, -0.03, 0.045],
    ],
    note: "Dwarf elliptical with a dusty central region and a small young central component.",
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-18/",
  }),
  "NGC 147": sph({
    axes: [1, 0.44, 0.59],
    core: 0.43,
    continuum: 0.17,
    hotFraction: 0.07,
    tail: 0.15,
    old: [1, 0.84, 0.68],
    note: "Gas-poor elongated dwarf spheroidal, with diffuse outer stellar structure.",
    source: "https://ned.ipac.caltech.edu/level5/March01/Mateo/Mateo4.html",
  }),
  WLM: irr({
    axes: [1, 0.3, 0.35],
    core: 0.6,
    continuum: 0.08,
    hotFraction: 0.43,
    hii: 0.19,
    dust: 0.06,
    knots: [
      [-0.4, 0.03, 0.04, 0.09],
      [0.15, -0.035, -0.06, 0.1],
      [0.42, 0.02, 0.03, 0.065],
    ],
    note: "Elongated dwarf irregular with resolved cool giants and blue stellar associations.",
    source: "https://esawebb.org/images/WLMa/",
  }),
  "IC 1613": irr({
    axes: [1, 0.38, 0.84],
    core: 0.64,
    continuum: 0.06,
    hotFraction: 0.53,
    dust: 0.015,
    hii: 0.34,
    knots: [
      [-0.43, 0.04, 0.18, 0.1],
      [0.25, -0.05, 0.36, 0.12],
      [0.36, 0.015, -0.27, 0.08],
      [-0.12, -0.025, -0.4, 0.09],
    ],
    note: "Sparse blue associations and pink emission regions, with exceptionally little dust.",
    source: "https://www.eso.org/public/news/eso1603/",
  }),
  "IC 10": irr({
    kind: 3,
    axes: [1, 0.42, 0.83],
    core: 0.4,
    continuum: 0.16,
    hotFraction: 0.7,
    dust: 0.85,
    hii: 1.15,
    old: [1, 0.65, 0.37],
    knots: [
      [-0.24, 0.04, 0.13, 0.14],
      [0.19, -0.03, -0.17, 0.12],
      [0.36, 0.06, 0.2, 0.09],
      [-0.11, -0.04, -0.36, 0.075],
    ],
    note: "Compact starburst dwarf: dense young blue associations, dusty knots and H-alpha regions.",
    source: "https://science.nasa.gov/missions/hubble/hubble-captures-elusive-irregular-galaxy/",
  }),
  "NGC 6822 (Barnard)": irr({
    axes: [1, 0.28, 0.6],
    core: 0.6,
    continuum: 0.09,
    hotFraction: 0.49,
    dust: 0.16,
    hii: 0.7,
    knots: [
      [-0.42, 0.025, 0.19, 0.095],
      [0.34, -0.02, 0.21, 0.09],
      [0.03, 0.015, -0.18, 0.12],
    ],
    note: "Loose stellar bar, irregular blue associations and separate HII complexes.",
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/caldwell-57/",
  }),
  "Large Magellanic Cloud": irr({
    axes: [1, 0.22, 0.68],
    core: 0.52,
    continuum: 0.17,
    hotFraction: 0.47,
    dust: 0.3,
    hii: 0.85,
    knots: [
      [-0.38, 0.025, 0.03, 0.12],
      [0.09, -0.015, -0.05, 0.15],
      [0.43, 0.04, -0.23, 0.085],
    ],
    note: "Asymmetric stellar bar with an off-center Tarantula-like star-forming complex.",
    source: "https://www.eso.org/public/images/eso1914a/",
  }),
  "Small Magellanic Cloud": irr({
    axes: [1, 0.45, 0.59],
    core: 0.54,
    continuum: 0.11,
    hotFraction: 0.5,
    dust: 0.18,
    hii: 0.62,
    knots: [
      [-0.3, 0.06, -0.08, 0.15],
      [0.3, -0.05, 0.05, 0.09],
      [0.48, 0.02, 0.16, 0.075],
    ],
    note: "Elongated three-dimensional stellar body with asymmetric young associations.",
    source: "https://www.eso.org/public/images/eso1714a/",
  }),
  "GN-z11": irr({
    kind: 3,
    axes: [1, 0.53, 0.76],
    core: 0.18,
    continuum: 0.18,
    hotFraction: 0.83,
    dust: 0.12,
    hii: 0.7,
    knots: [
      [0, 0, 0, 0.13],
      [0.23, 0.05, 0.11, 0.08],
    ],
    note: "Unresolved high-redshift galaxy: compact illustrative young stellar body; its interior is not measured.",
    source:
      "https://science.nasa.gov/missions/webb/nasas-webb-finds-early-galaxies-werent-too-big-for-their-britches-after-all/",
  }),
  "JADES-GS-z14-0": irr({
    kind: 3,
    axes: [1, 0.51, 0.8],
    core: 0.25,
    continuum: 0.13,
    hotFraction: 0.86,
    dust: 0.08,
    hii: 0.55,
    knots: [
      [-0.13, 0.02, 0.05, 0.11],
      [0.19, -0.02, -0.08, 0.09],
    ],
    note: "Unresolved early galaxy; illustrative compact blue population rather than a measured resolved image.",
    source:
      "https://science.nasa.gov/missions/webb/nasas-james-webb-space-telescope-finds-most-distant-known-galaxy/",
  }),
  "GLASS-z12": irr({
    kind: 3,
    axes: [1, 0.46, 0.64],
    core: 0.29,
    continuum: 0.12,
    hotFraction: 0.8,
    dust: 0.1,
    hii: 0.4,
    knots: [
      [-0.15, 0.04, 0, 0.13],
      [0.2, -0.02, 0.12, 0.07],
    ],
    note: "Unresolved high-redshift source; depth and stellar detail are representative.",
    source: "https://science.nasa.gov/universe/galaxies/types/",
  }),
  "HUDF-JD2": irr({
    kind: 3,
    axes: [1, 0.58, 0.9],
    core: 0.22,
    continuum: 0.1,
    hotFraction: 0.72,
    dust: 0.15,
    hii: 0.3,
    knots: [[0.02, 0.01, 0, 0.15]],
    note: "Unresolved catalogue source; historical high-redshift interpretation is uncertain. Internal structure is illustrative.",
    source: "https://science.nasa.gov/universe/galaxies/types/",
  }),
  "M87 (Virgo A)": sph({
    axes: [1, 0.86, 0.93],
    core: 0.22,
    continuum: 0.85,
    hotFraction: 0.025,
    old: [1, 0.82, 0.57],
    note: "Massive, nearly round old stellar spheroid; halo globular populations remain representative.",
    source: "https://science.nasa.gov/universe/galaxies/types/",
  }),
  M49: sph({
    axes: [1, 0.62, 0.78],
    core: 0.3,
    continuum: 0.65,
    hotFraction: 0.025,
    old: [1, 0.8, 0.55],
  }),
  M60: sph({
    axes: [1, 0.7, 0.84],
    core: 0.2,
    continuum: 0.8,
    hotFraction: 0.025,
    old: [1, 0.85, 0.67],
  }),
  M86: sph({
    axes: [1, 0.59, 0.7],
    core: 0.35,
    continuum: 0.45,
    hotFraction: 0.03,
    old: [1, 0.88, 0.74],
  }),
  M84: sph({
    axes: [1, 0.73, 0.86],
    core: 0.23,
    continuum: 0.63,
    hotFraction: 0.025,
    old: [1, 0.83, 0.62],
  }),
  "NGC 1316 (Fornax A)": sph({
    axes: [1, 0.56, 0.73],
    core: 0.32,
    continuum: 0.48,
    hotFraction: 0.1,
    dust: 0.7,
    knots: [
      [-0.16, 0.02, 0.1, 0.06],
      [0.18, -0.02, -0.08, 0.08],
    ],
    old: [1, 0.8, 0.56],
    note: "Merger-shaped early-type host with localized absorbing dust rather than a generic spiral disk.",
  }),
  "Perseus Cluster (NGC 1275)": sph({
    axes: [1, 0.74, 0.86],
    core: 0.24,
    continuum: 0.55,
    hotFraction: 0.1,
    dust: 0.25,
    hii: 0.7,
    knots: [
      [-0.15, 0.06, 0.13, 0.055],
      [0.23, -0.03, -0.12, 0.045],
      [-0.31, -0.02, -0.09, 0.04],
    ],
    old: [1, 0.81, 0.61],
    note: "Old central galaxy with separate central emission complexes; cluster galaxies remain separate objects.",
  }),
  "Coma Cluster (NGC 4889)": sph({
    axes: [1, 0.53, 0.68],
    core: 0.37,
    continuum: 0.48,
    hotFraction: 0.015,
    old: [1, 0.84, 0.62],
  }),
  "Hercules A": sph({
    axes: [1, 0.68, 0.81],
    core: 0.28,
    continuum: 0.55,
    hotFraction: 0.02,
    old: [1, 0.76, 0.5],
  }),
  "Cygnus A": sph({
    axes: [1, 0.58, 0.73],
    core: 0.2,
    continuum: 0.55,
    hotFraction: 0.06,
    dust: 0.7,
    knots: [[0, 0.01, 0, 0.06]],
    old: [1, 0.74, 0.46],
  }),
  "3C 273 (Quasar Host)": sph({
    axes: [1, 0.8, 0.92],
    core: 0.18,
    continuum: 0.62,
    hotFraction: 0.1,
    old: [1, 0.87, 0.72],
    source: "https://science.nasa.gov/missions/hubble/hubble-probes-the-heart-of-a-nearby-quasar/",
    note: "Resolved host reconstruction only; the separate quasar rendering retains ownership of the active nucleus.",
  }),
};
const nearbyPopulations = new Map<string, GalaxyPopulation>();
for (const [name, m] of NEARBY_MEASUREMENT_BY_NAME) {
  const q = m.minor / m.major,
    old = /spheroidal|elliptical|lenticular/i.test(m.type),
    mixed = /transition/i.test(m.type),
    starFormingNucleus = m.nuclearActivity?.includes("SF") ?? false;
  if (!old && !/irregular/i.test(m.type)) continue;
  nearbyPopulations.set(
    name,
    old
      ? sph({
          axes: [1, Math.sqrt(q), q],
          core: 0.38,
          continuum: /spheroidal/i.test(m.type) ? 0.09 : 0.4,
          source: m.source,
          hotFraction: starFormingNucleus ? 0.32 : 0.04,
          dust: starFormingNucleus ? 0.4 : 0,
          hii: starFormingNucleus ? 0.4 : 0,
          knots: starFormingNucleus ? [[0, 0, 0, 0.06]] : [],
          note: starFormingNucleus
            ? "KINGFISH reports a star-forming nucleus in this early-type galaxy. Its central gas and young population are reconstructed; no individual source identities are invented."
            : "Projected stellar axis ratio follows the source fit; intrinsic depth, star colours and individual stars are reconstructed. No invented gas cloud.",
        })
      : irr({
          axes: [1, 0.3, q],
          core: 0.5,
          continuum: 0.12,
          hotFraction: mixed ? 0.15 : 0.42,
          dust: mixed ? 0.03 : 0.16,
          hii: mixed ? 0.05 : 0.35,
          knots: [],
          source: m.source,
          note: "Observed irregular stellar morphology; unresolved associations and intrinsic depth are reconstructed.",
        }),
  );
}
export function galaxyPopulation(model: Pick<GalaxyModel, "name">) {
  return GALAXY_POPULATIONS[model.name] ?? nearbyPopulations.get(model.name);
}
