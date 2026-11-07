import type { ObservationalGalaxy } from "./galaxy-catalog";
import type { GalaxyModel } from "./galaxy-models";
import { GALAXY_REFERENCES } from "./galaxy-references";

type RGB = [number, number, number];
type Guide = {
  old: RGB;
  young: RGB;
  dust?: number;
  clumps?: number;
  feature?: number;
  source?: string;
};

/** Linear-light rendering palettes, informed by published composite images.
 * These are presentation choices, never measured RGB or resolved stellar colours.
 * Infrared VISTA/Webb composites are structural guides, not naked-eye colours.
 */
const GUIDES: Record<string, Guide> = {
  m33: { old: [1, 0.89, 0.76], young: [0.3, 0.59, 1], clumps: 0.8 },
  lmc: { old: [1, 0.88, 0.73], young: [0.72, 0.85, 1], clumps: 0.76, feature: 4 },
  smc: { old: [1, 0.9, 0.78], young: [0.76, 0.87, 1], clumps: 0.6 },
  m51: { old: [1, 0.86, 0.66], young: [0.25, 0.5, 1], dust: 0.7, clumps: 0.6 },
  m81: { old: [1, 0.89, 0.74], young: [0.4, 0.64, 1], dust: 0.55, clumps: 0.35 },
  m82: { old: [1, 0.8, 0.61], young: [0.74, 0.85, 1], dust: 0.9, clumps: 0.85, feature: 1 },
  m104: { old: [1, 0.94, 0.84], young: [0.86, 0.91, 1], dust: 1, clumps: 0.08 },
  m101: { old: [1, 0.91, 0.8], young: [0.24, 0.54, 1], dust: 0.45, clumps: 0.8 },
  "catalog-ngc-1300": { old: [1, 0.88, 0.7], young: [0.3, 0.6, 1], dust: 0.7, clumps: 0.45 },
  cena: { old: [1, 0.9, 0.77], young: [0.75, 0.85, 1], dust: 1, clumps: 0.18, feature: 3 },
  antennae: { old: [1, 0.85, 0.7], young: [0.66, 0.82, 1], dust: 0.65, clumps: 0.95 },
  "stephans-quintet": { old: [1, 0.89, 0.76], young: [0.72, 0.85, 1], dust: 0.45, clumps: 0.7 },
  tadpole: { old: [1, 0.9, 0.77], young: [0.62, 0.81, 1], dust: 0.45, clumps: 0.8, feature: 2 },
  "hoags-object": { old: [1, 0.88, 0.66], young: [0.58, 0.78, 1], dust: 0, clumps: 0.45 },
  cartwheel: { old: [1, 0.89, 0.75], young: [0.64, 0.81, 1], dust: 0.3, clumps: 0.8 },
  m87: {
    old: [1, 0.9, 0.75],
    young: [0.96, 0.94, 0.86],
    clumps: 0,
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-87/",
  },
  "catalog-ngc-253-sculptor-galaxy": {
    old: [1, 0.86, 0.66],
    young: [0.73, 0.81, 1],
    dust: 0.9,
    clumps: 0.8,
    source: "https://www.eso.org/public/images/potw1017a/",
  },
};

export type CatalogueAppearance = {
  oldColor: RGB;
  youngColor: RGB;
  /** tan(pitch), dust optical-depth control, bulge/radius, display gain. */
  parameters: [number, number, number, number];
  /** Ring/radius, bar/radius, association contrast, documented guide feature. */
  features: [number, number, number, number];
  colorBasis: "observatory-guide reconstruction" | "morphology-family reconstruction";
  structureBasis: "source-catalogue morphology" | "existing curated model";
  source?: string;
  /** Preserved for context; not converted into a fictitious resolved RGB map. */
  integratedColorIndexBV?: number;
  note: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const safeColor = (color: RGB): RGB => color.map((value) => clamp(value, 0, 1)) as RGB;

/** Stable shader mode codes; orientation and physical catalogue size stay separate. */
export function catalogueMorphologyMode(model: GalaxyModel): number {
  if (/blue compact|\bBCD\b/i.test(model.type)) return 6;
  if (model.morphology === "ring") return 7;
  if (model.morphology === "flocculent") return 8;
  if (model.morphology === "interacting") return 9;
  if (model.morphology === "barred") return 1;
  if (model.morphology === "elliptical") return 2;
  if (model.morphology === "dwarf") return 4;
  if (model.morphology === "starburst") return /dwarf|irregular/i.test(model.type) ? 3 : 10;
  if (model.morphology === "irregular") return 3;
  if (model.morphology === "lenticular" || /lenticular/i.test(model.type)) return 5;
  return 0;
}

/** No random runtime state, texture downloads, data mutations or invented measurements. */
export function catalogueAppearance(
  model: GalaxyModel,
  record?: Pick<ObservationalGalaxy, "catalogueEvidence" | "photometry">,
): CatalogueAppearance {
  const mode = catalogueMorphologyMode(model),
    guide = GUIDES[model.key],
    old = mode === 2 || mode === 4 || mode === 5,
    diffuse = mode === 4,
    irregular = mode === 3 || mode === 6 || mode === 9 || mode === 10,
    source = guide?.source ?? GALAXY_REFERENCES[model.key]?.source,
    bulge = clamp(model.bulgeRadius / Math.max(1, model.diskRadius), 0.035, 0.8),
    b = record?.photometry?.B,
    v = record?.photometry?.V;
  const appearance: CatalogueAppearance = {
    oldColor: safeColor(guide?.old ?? (old ? [1, 0.9, 0.77] : model.oldColor)),
    youngColor: safeColor(guide?.young ?? (old ? [0.94, 0.92, 0.86] : model.youngColor)),
    parameters: [
      Math.tan((clamp(model.pitchDeg || 16, 5, 45) * Math.PI) / 180),
      guide?.dust ?? (model.dustLanes ? (old ? 0.2 : 0.5) : 0),
      bulge,
      diffuse ? 0.72 : mode === 6 ? 1.08 : 1,
    ],
    features: [
      model.ringRadius ? clamp(model.ringRadius / model.diskRadius, 0.12, 0.9) : 0,
      clamp(model.barLength / Math.max(1, model.diskRadius), 0, 0.85),
      guide?.clumps ?? (old ? 0 : irregular ? 0.68 : mode === 8 ? 0.78 : 0.38),
      guide?.feature ?? 0,
    ],
    colorBasis: guide ? "observatory-guide reconstruction" : "morphology-family reconstruction",
    structureBasis: record?.catalogueEvidence
      ? "source-catalogue morphology"
      : "existing curated model",
    source: source ?? record?.catalogueEvidence?.sourceUrl,
    note: "Catalogue positions, sizes and supplied orientation are preserved. Unresolved depth, population colours, dust texture and association locations are illustrative; display gain and the minimum marker size are not calibrated photometry.",
  };
  if (Number.isFinite(b) && Number.isFinite(v)) appearance.integratedColorIndexBV = b! - v!;
  // Ordinary passive spheroids have no spiral dust lanes; the observed Centaurus A
  // guide is an explicit exception. No unidentified dwarf receives a gas nebula.
  if ((mode === 2 || mode === 4) && !model.dustLanes) appearance.parameters[1] = 0;
  return appearance;
}
