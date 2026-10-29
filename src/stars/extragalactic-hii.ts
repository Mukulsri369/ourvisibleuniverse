import rows from "./catalog-data/sings-hii.json";
import { getGalaxyByAnyName } from "./galaxy-catalog";
import { icrsToGalactic } from "@/lib/astronomy/coordinates";
import { sexagesimalDegrees, NEARBY_CATALOG_SOURCES } from "./nearby-galaxy-data";
import type { ObservedObject } from "./observed-objects";
export type HIITarget = {
  id: string;
  name: string;
  host: string;
  ra: number;
  dec: number;
  diameter?: number;
  source: string;
  coordinatesSource: string;
  shape: number;
  seed: number;
  description: string;
};
const hostAlias: Record<string, string> = {
  M81: "M81 (Bode's Galaxy)",
  M51: "M51 (Whirlpool)",
  "Ho II": "Holmberg II",
  "NGC 4736": "M94",
  "NGC 628": "M74 (Phantom Galaxy)",
  "NGC 6822": "NGC 6822 (Barnard)",
};
export const EXTRAGALACTIC_HII_TARGETS: HIITarget[] = [
  ...rows.map(([label, ra, dec], i) => {
    const name = String(label),
      rawHost = name.match(/^(NGC \d+|M81|M51|Ho II)/)![1];
    const host = hostAlias[rawHost] ?? rawHost;
    return {
      id: "hii-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      host,
      ra: sexagesimalDegrees(String(ra), true),
      dec: sexagesimalDegrees(String(dec)),
      source: NEARBY_CATALOG_SOURCES.sings,
      coordinatesSource: NEARBY_CATALOG_SOURCES.sings,
      shape: 23,
      seed: 3001 + i * 79,
      description: `A real optically selected H II region in ${host}, included in the SINGS spectroscopic target catalogue (Kennicutt et al. 2003, Table 3). Its measured J2000 sky position is retained. The depth relative to the galaxy centre is unknown and is placed at the adopted host distance. The table's Radius column is distance from the galactic centre, not the nebula's radius. The close-up gas, stellar field and 200-light-year viewing envelope are illustrative; no measured physical diameter is asserted.`,
    };
  }),
  {
    id: "ngc604",
    name: "NGC 604",
    host: "Triangulum (M33)",
    ra: sexagesimalDegrees("01:34:32.1", true),
    dec: sexagesimalDegrees("+30:47:01"),
    diameter: 1500,
    shape: 22,
    seed: 604,
    source: "https://science.nasa.gov/asset/webb/ngc-604-nircam-image/",
    coordinatesSource: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=NGC604",
    description:
      "A roughly 1,500-light-year giant star-forming region in M33. Massive young stars excavate interconnected wind-blown cavities through the molecular gas. The three-dimensional cavities and unseen depth are reconstructed from observatory descriptions, rather than a flat image.",
  },
  {
    id: "ngc346",
    name: "NGC 346 / N66",
    host: "Small Magellanic Cloud",
    ra: sexagesimalDegrees("00:59:04.4", true),
    dec: sexagesimalDegrees("-72:10:39"),
    diameter: 200,
    shape: 24,
    seed: 346,
    source: "https://www.eso.org/public/news/eso1008/",
    coordinatesSource: "https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=NGC+346",
    description:
      "An approximately 200-light-year star-forming complex in the Small Magellanic Cloud. Its curved gas ridges surround a young stellar association in a low-metallicity environment. Dust filaments and star-forming knots are a volumetric reconstruction; individual rendered stars do not claim catalogue identities.",
  },
  {
    id: "ngc602",
    name: "NGC 602 / N90",
    host: "Small Magellanic Cloud",
    ra: sexagesimalDegrees("01:29:31", true),
    dec: sexagesimalDegrees("-73:33:15"),
    shape: 25,
    seed: 602,
    source: "https://science.nasa.gov/asset/hubble/star-cluster-ngc-602/",
    coordinatesSource: "https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/J/ApJ/730/78?format=html",
    description:
      "A young stellar association in the Wing of the Small Magellanic Cloud. Stellar radiation erodes the surrounding gas into swept-back ridges, leaving a clearing around young stars. The adopted observing-field centre follows Carlson et al. (2011); cluster and nebular centres need not coincide. Unseen depth and the viewing envelope are illustrative.",
  },
];
export const EXTRAGALACTIC_HII_IDS = new Set(EXTRAGALACTIC_HII_TARGETS.map((o) => o.id));
export const EXTRAGALACTIC_HII_OBJECTS: ObservedObject[] = EXTRAGALACTIC_HII_TARGETS.map((t) => {
  const host = getGalaxyByAnyName(t.host);
  if (!host) throw new Error("Missing documented H II host: " + t.host);
  return {
    id: t.id,
    name: t.name,
    aliases: [t.name],
    category: "Nebula",
    subtype: "Extragalactic H II region / stellar nursery",
    distance: host.distance,
    ...icrsToGalactic(t.ra, t.dec),
    diameterLy: t.diameter ?? 200,
    extentBasis: t.diameter ? "observational" : "illustrative",
    hostGalaxy: t.host,
    visual: "cloud",
    color: "#e26b89",
    accent: "#6cc7df",
    nebulaClass: "emission",
    observed: "Optical H II emission; published host association and J2000 position",
    properties: [
      `Host: ${t.host}`,
      `J2000 RA ${t.ra.toFixed(5)}°, Dec ${t.dec.toFixed(5)}°`,
      t.diameter
        ? `Approximate observed extent: ${t.diameter.toLocaleString()} ly`
        : "Physical diameter not supplied by the source catalogue",
      "Line-of-sight depth within the host is not measured",
    ],
    description: t.description,
    visualNote:
      "True 3D emission and extinction with embedded illustrative stars. Display-adapted hydrogen/oxygen palette; this is not a measured colour or depth map. " +
      (t.diameter ? "" : "The display envelope is not a physical size measurement."),
    source: t.source + " · Coordinates: " + t.coordinatesSource,
    filterPalette: "Display-adapted Hα / [O III]",
  };
});
