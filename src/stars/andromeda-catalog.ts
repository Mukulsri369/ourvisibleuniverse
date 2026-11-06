import type { ObservedObject } from "./observed-objects";
import { icrsToGalactic } from "@/lib/astronomy/coordinates";
import { M31_DISTANCE } from "./andromeda-data";
export const M31_HOST = "Andromeda (M31)";
export const M31_PLACEMENT =
  "Measured sky direction; adopted M31 distance, unknown individual line-of-sight depth. Not a deprojected disk measurement.";
const h = (a: number, b: number, c: number) => (a + b / 60 + c / 3600) * 15;
const d = (a: number, b: number, c: number) => a + b / 60 + c / 3600;
const simbad = (id: string) =>
  "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=" + encodeURIComponent(id);
export const M31_TARGETS = [
  {
    id: "m31-v1",
    name: "M31-V1 (Hubble's Cepheid)",
    aliases: ["M31-V1", "Hubble's Cepheid"],
    ra: h(0, 41, 26.99),
    dec: d(41, 10, 6),
    category: "Variable star",
    subtype: "Cepheid variable",
    visual: "star",
    color: "#ffe4b1",
    extent: 0.00001,
    source: "https://science.nasa.gov/asset/hubble/m31-cepheid-variable-star-v1/",
    description:
      "The Cepheid whose variability allowed Edwin Hubble to establish that Andromeda lies beyond the Milky Way. NASA's image metadata supplies the sky position; the rendered surface and variability are artistic, not a measured light curve.",
  },
  {
    id: "m31-ae-and",
    name: "AE Andromedae",
    aliases: ["AE And", "AE Andromedae"],
    ra: h(0, 43, 2.514465),
    dec: d(41, 49, 12.212124),
    category: "Variable star",
    subtype: "Luminous blue variable",
    visual: "star",
    color: "#b9d8ff",
    extent: 0.00001,
    source: simbad("AE And"),
    description:
      "A documented luminous blue variable in M31. Its appearance changes with stellar state; this blue-white close-up is an illustrative state, not a temperature measurement.",
  },
  {
    id: "m31-af-and",
    name: "AF Andromedae",
    aliases: ["AF And", "BASW 19", "LGGS J004333.09+411210.4"],
    ra: h(0, 43, 33.086194),
    dec: d(41, 12, 10.311568),
    category: "Variable star",
    subtype: "Luminous blue variable",
    visual: "star",
    color: "#d2e3ff",
    extent: 0.00001,
    source: simbad("AF And"),
    description:
      "A luminous blue variable classified as LBV in the cited SIMBAD record. Gaia astrometry for a crowded extragalactic field is not interpreted here as an individual distance.",
  },
  {
    id: "m31-ngc206",
    name: "NGC 206",
    aliases: ["NGC206", "[V64] 78"],
    ra: h(0, 40, 33.8),
    dec: d(40, 44, 22),
    category: "Star cluster",
    subtype: "OB stellar association / star cloud",
    visual: "cluster",
    color: "#aaceff",
    extent: 1800,
    source: simbad("NGC206"),
    description:
      "An association of young stars in Andromeda's southwestern disk. This is a loose star cloud, not a spherical globular cluster. The 3D stellar distribution and viewing envelope are reconstructed; rendered stars are not separately identified catalogue sources.",
  },
  {
    id: "m31-g1",
    name: "Mayall II (G1)",
    aliases: ["G1", "Mayall II", "Mayall-II"],
    ra: h(0, 32, 46.5),
    dec: d(39, 34, 40),
    category: "Star cluster",
    subtype: "Halo globular cluster",
    visual: "cluster",
    color: "#ffe2af",
    extent: 200,
    source: "https://academic.oup.com/view-large/21099397",
    description:
      "A prominent globular cluster in the M31 halo. Its J2000 position follows the published globular-cluster table. A proposed intermediate-mass black hole remains a candidate, so no additional confirmed black hole is placed inside it.",
  },
  {
    id: "m31-nucleus",
    name: "M31* (nuclear black hole)",
    aliases: ["M31*", "Andromeda central black hole"],
    ra: h(0, 42, 44.33),
    dec: d(41, 16, 7.5),
    category: "Black hole",
    subtype: "Dynamically inferred supermassive black hole",
    visual: "blackhole",
    color: "#9ca9c5",
    extent: 0.00009,
    source: "https://chandra.as.utexas.edu/m31stis.html",
    description:
      "Stellar dynamics establish a central supermassive black hole, with a published mass estimate around 140 million solar masses. The position is the approximate nuclear centre, not a separately measured event-horizon location. No bright accretion disk or jet is asserted.",
  },
] as const;
export function validateM31Coordinates(ra: number, dec: number) {
  if (!Number.isFinite(ra) || !Number.isFinite(dec) || ra < 0 || ra >= 360 || dec < -90 || dec > 90)
    throw new Error("Invalid ICRS coordinates");
  return icrsToGalactic(ra, dec);
}
export const ANDROMEDA_OBJECTS: ObservedObject[] = M31_TARGETS.map((t) => ({
  id: t.id,
  name: t.name,
  aliases: [...t.aliases],
  category: t.category,
  subtype: t.subtype,
  distance: M31_DISTANCE,
  ...validateM31Coordinates(t.ra, t.dec),
  diameterLy: t.extent,
  extentBasis: "illustrative",
  hostGalaxy: M31_HOST,
  visual: t.visual,
  color: t.color,
  accent: t.color,
  observed: "Optical catalogue / published observations",
  properties: [
    "Host: Andromeda (M31)",
    t.id === "m31-v1"
      ? "NASA equatorial image position; J2000 assumed for scene conversion"
      : t.id === "m31-nucleus"
        ? "Approximate J2000 nuclear centre; scene aligned to the existing M31 centre"
        : "ICRS / J2000 sky position",
    "RA " + t.ra.toFixed(6) + "°, Dec " + t.dec.toFixed(6) + "°",
    M31_PLACEMENT,
  ],
  description: t.description,
  visualNote:
    "Artistic 3D reconstruction; presentation size and stellar colors are illustrative. " +
    M31_PLACEMENT,
  source: t.source,
  ...(t.id === "m31-nucleus"
    ? {
        compactPhysics: {
          compactClass: "supermassive_black_hole",
          massSolar: 140000000,
          accretionState: "quiescent",
          hasAccretionDisk: false,
          hasRelativisticJet: false,
          scientificConfidence: "confirmed",
          publishedCitation: t.source,
        },
      }
    : {}),
}));
