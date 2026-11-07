import ungc from "./catalog-data/nearby-v2/ungc-2013-input.json";
import local from "./catalog-data/nearby-v2/local-dwarfs-2021-input.json";
import type { GalaxySourceCandidate } from "./galaxy-catalogue-types";
const records = (table: { columns: string[]; rows: unknown[][] }) =>
  table.rows.map((row) => Object.fromEntries(table.columns.map((k, i) => [k, row[i]])));
const number = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : null);
export const NEARBY_SOURCE_CANDIDATES: GalaxySourceCandidate[] = [
  ...records(local).map((r) => ({
    sourceId: "mcconnachie-2021" as const,
    rowName: String(r.name),
    name: String(r.name)
      .replace(/^\*/, "")
      .replace(/\(1\)/, "1")
      .replace(/([a-z])([A-Z]|\d)/g, "$1 $2"),
    aliases: [String(r.name).replace(/^\*/, "")],
    ra: String(r.ra),
    dec: String(r.dec),
    distanceMpc: number(r.dm) == null ? null : 10 ** ((Number(r.dm) - 25) / 5),
    distanceMethod:
      "Resolved stellar-population compilation; individual technique not encoded in this FITS row",
    distanceBasis: "individual-indicator" as const,
    dmMinus: number(r.dmMinus),
    dmPlus: number(r.dmPlus),
    velocity: number(r.velocity),
    velocitySigma:
      number(r.velocityPlus) != null && number(r.velocityMinus) != null
        ? Math.max(Number(r.velocityPlus), Number(r.velocityMinus))
        : null,
    major: number(r.rhArcmin) == null ? null : 4 * Number(r.rhArcmin),
    halfLight: number(r.rhArcmin),
    axisRatio: number(r.axisRatio),
    pa: number(r.pa),
    morphology: r.morphology ? String(r.morphology) : null,
    groupCode: r.groupCode ? String(r.groupCode) : null,
    references: [
      "https://arxiv.org/abs/1204.1562",
      "https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/files/vault/PANDAS/NearbyGals/References.dat#" +
        String(r.references),
    ],
    uncertainIdentity: String(r.name).startsWith("*") || /HIZSS3|Willman1/.test(String(r.name)),
  })),
  ...records(ungc).map((r) => ({
    sourceId: "ungc-2013" as const,
    rowName: String(r.name),
    name: String(r.name).replace(/^(NGC|IC|UGC|DDO)0*(\d)/, "$1 $2"),
    aliases: [String(r.simbadName ?? ""), String(r.nedName ?? "")].filter(Boolean),
    ra: String(r.ra),
    dec: String(r.dec),
    distanceMpc: number(r.distanceMpc),
    distanceMethod: String(r.distanceMethod),
    distanceBasis: /^h/.test(String(r.distanceMethod))
      ? ("flow" as const)
      : r.distanceMethod === "txt"
        ? ("appearance" as const)
        : r.distanceMethod === "mem"
          ? ("group-adoption" as const)
          : ("individual-indicator" as const),
    dmSigma: number(r.dmSigma),
    velocity: number(r.velocity),
    velocitySigma: number(r.velocitySigma),
    major: number(r.majorArcmin),
    axisRatio: number(r.axisRatio),
    inclination: number(r.inclination),
    morphology: r.dwarfMorphology ? String(r.dwarfMorphology) : null,
    tType: number(r.tType),
    surfaceBrightness: String(r.surfaceBrightnessClass),
    mainDisturber: String(r.mainDisturber),
    tidalIndex: number(r.tidalIndex),
    references: [
      "https://doi.org/10.26093/cds/vizier.51450101",
      ...(r.distanceBibcode ? ["https://ui.adsabs.harvard.edu/abs/" + r.distanceBibcode] : []),
      ...(r.velocityBibcode ? ["https://ui.adsabs.harvard.edu/abs/" + r.velocityBibcode] : []),
    ],
  })),
];
