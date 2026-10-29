import nuclearRows from "./catalog-data/kingfish-nuclei.json";
import dwarfPositions from "./catalog-data/local-dwarf-positions.json";
import singsRows from "./catalog-data/sings-galaxies.json";
import distanceRows from "./catalog-data/kingfish-distances.json";
import { LOCAL_DWARF_ROWS } from "./catalog-data/local-dwarfs";
import { icrsToGalactic } from "@/lib/astronomy/coordinates";
import { LIGHT_YEARS_PER_PARSEC } from "@/lib/astronomy/constants";
import type { ObservationalGalaxy } from "./galaxy-catalog";

export const NEARBY_CATALOG_SOURCES = {
  dwarf: "https://arxiv.org/abs/1204.1562",
  sings: "https://arxiv.org/abs/astro-ph/0305437",
  kingfish: "https://arxiv.org/abs/1111.4438",
};
export type NearbyMeasurement = {
  name: string;
  aliases: string[];
  ra: number;
  dec: number;
  l: number;
  b: number;
  distanceMpc: number;
  distanceSigmaMpc?: number;
  velocity: number;
  major: number;
  minor: number;
  pa?: number;
  morphology: string;
  type: string;
  group: string;
  source: string;
  distanceSource: string;
  distanceMethod: string;
  nuclearActivity?: string;
  sizeDefinition: "D25" | "half-light";
  halfLightArcmin?: number;
};
const pc = LIGHT_YEARS_PER_PARSEC;
export const catalogNameKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^(ngc|ic|ddo|m)0+(?=\d)/, "$1");
export function sexagesimalDegrees(value: string, hours = false): number {
  const [a, b, c] = value.replace(/[+−-]/g, "").split(":").map(Number);
  return (
    (value.startsWith("-") || value.startsWith("−") ? -1 : 1) *
    (a + b / 60 + c / 3600) *
    (hours ? 15 : 1)
  );
}
const nuclearIndex = new Map(nuclearRows.map(([name, type]) => [catalogNameKey(name), type]));
const distanceIndex = new Map(
  distanceRows.map(([name, d, method]) => [
    catalogNameKey(String(name)),
    { d: Number(d), method: String(method) },
  ]),
);
const commonNames: Record<string, [string, string[]]> = {
  ngc628: ["M74 (Phantom Galaxy)", ["M74", "Messier 74"]],
  ngc3351: ["M95", ["M95", "Messier 95"]],
  ngc4254: ["M99", ["M99", "Messier 99"]],
  ngc4552: ["M89", ["M89", "Messier 89"]],
  ngc4569: ["M90", ["M90", "Messier 90"]],
  ngc4579: ["M58", ["M58", "Messier 58"]],
  ngc5055: ["M63 (Sunflower Galaxy)", ["M63", "Messier 63"]],
  hoi: ["Holmberg I", ["Ho I", "DDO 63"]],
  hoii: ["Holmberg II", ["Ho II", "DDO 50"]],
  hoix: ["Holmberg IX", ["Ho IX", "DDO 66"]],
};
const m81 = new Set([
  "ngc2403",
  "hoii",
  "m81dwa",
  "ddo53",
  "hoi",
  "ngc2976",
  "hoix",
  "m81dwb",
  "ic2574",
  "ddo165",
  "ngc4236",
  "ngc3077",
]);
const virgo = new Set(["ngc4254", "ngc4450", "ngc4552", "ngc4569", "ngc4579"]);
// Later NASA summaries supersede the discrepant early distance estimates in KINGFISH.
const adopted: Record<string, { ly: number; source: string }> = {
  ngc628: {
    ly: 32e6,
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-74/",
  },
  ngc4569: {
    ly: 59e6,
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-90/",
  },
  ngc4579: {
    ly: 62e6,
    source:
      "https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-58/",
  },
};
function typeOf(m: string): string {
  if (/^E/.test(m)) return "Elliptical";
  if (/^(I|Am)/.test(m) || /m/.test(m)) return "Dwarf irregular";
  if (/0/.test(m)) return "Lenticular";
  return /^SB/.test(m) ? "Barred spiral" : "Spiral";
}
export const NEARBY_MEASUREMENTS: NearbyMeasurement[] = [
  ...singsRows.map(([n, ra, dec, morph, v, dist, major, minor]) => {
    const rawName = String(n),
      key = catalogNameKey(rawName),
      update = distanceIndex.get(key);
    const name = commonNames[key]?.[0] ?? rawName.replace(/^(NGC|DDO) 0+(?=\d)/, "$1 ");
    const equatorial = {
      ra: sexagesimalDegrees(String(ra), true),
      dec: sexagesimalDegrees(String(dec)),
    };
    return {
      name,
      aliases: [rawName, ...(commonNames[key]?.[1] ?? [])],
      ...equatorial,
      ...icrsToGalactic(equatorial.ra, equatorial.dec),
      distanceMpc: adopted[key]
        ? adopted[key].ly / (pc * 1e6)
        : key === "m81dwb"
          ? 3.6
          : (update?.d ?? Number(dist)),
      velocity: Number(v),
      nuclearActivity: nuclearIndex.get(key),
      major: Number(major),
      minor: Number(minor),
      morphology: String(morph),
      type: typeOf(String(morph)),
      group:
        key === "m81dwb"
          ? "M81 direction (membership uncertain)"
          : m81.has(key)
            ? "M81 Group"
            : virgo.has(key)
              ? "Virgo Cluster"
              : key === "ngc1404"
                ? "Fornax Cluster"
                : "Local Supercluster / field",
      source: NEARBY_CATALOG_SOURCES.sings,
      distanceSource:
        adopted[key]?.source ??
        (update || key === "m81dwb"
          ? NEARBY_CATALOG_SOURCES.kingfish
          : NEARBY_CATALOG_SOURCES.sings),
      distanceMethod: adopted[key]
        ? "Adopted NASA distance"
        : key === "m81dwb"
          ? "M81 group mean (membership uncertain)"
          : (update?.method ??
            (m81.has(key) ? "M81 group mean (SINGS)" : "Flow-corrected (H0 = 70)")),
      sizeDefinition: "D25" as const,
    };
  }),
  ...LOCAL_DWARF_ROWS.map(([name, _l, _b, kpc, sigma, v, rh, e, pa, pop, group]) => {
    const sph = pop === "spheroidal",
      transition = pop === "transition",
      disk = pop === "spiral";
    const position = dwarfPositions[name];
    const eq = { ra: sexagesimalDegrees(position[0], true), dec: sexagesimalDegrees(position[1]) };
    // Four major-axis half-light radii are a display envelope, not a measured outer edge.
    const noPA = [
      "Andromeda XI",
      "Andromeda XII",
      "Andromeda XIII",
      "Andromeda XIV",
      "Andromeda XV",
      "Andromeda XVI",
      "LGS 3",
      "Leo T",
      "KKR 25",
      "DDO 113",
    ].includes(name);
    return {
      name,
      aliases: [
        name.replace("Boötes", "Bootes"),
        ...(name === "Aquarius Dwarf"
          ? ["DDO 210"]
          : name === "Sagittarius Dwarf Irregular"
            ? ["SagDIG"]
            : name === "Pegasus Dwarf Irregular"
              ? ["DDO 216"]
              : []),
      ],
      ...eq,
      ...icrsToGalactic(eq.ra, eq.dec),
      distanceMpc: kpc / 1000,
      distanceSigmaMpc: sigma / 1000,
      velocity: v,
      major: rh * 4,
      minor: rh * 4 * (1 - e),
      halfLightArcmin: rh,
      pa: noPA ? undefined : ((pa % 180) + 180) % 180,
      morphology: sph ? "dSph" : transition ? "dIrr/dSph" : disk ? "SA(s)d" : "dIrr",
      type: sph
        ? "Dwarf spheroidal"
        : transition
          ? "Transition dwarf irregular"
          : disk
            ? "Spiral"
            : pop === "magellanic"
              ? "Magellanic irregular"
              : "Dwarf irregular",
      group,
      source: NEARBY_CATALOG_SOURCES.dwarf,
      distanceSource: NEARBY_CATALOG_SOURCES.dwarf,
      distanceMethod: "Resolved stellar populations",
      sizeDefinition: "half-light" as const,
    };
  }),
  // KINGFISH additions outside the SINGS sample; J2000 centres from CDS/SIMBAD.
  ...(
    [
      ["IC 342", "03:46:48.514", "+68:05:45.98", "SABcd", 31, 3.28, 21.4, 20, "IC 342 Group"],
      [
        "NGC 2146",
        "06:18:37.710",
        "+78:21:25.27",
        "Sbab",
        893,
        17.2,
        6,
        3.4,
        "Local Supercluster / field",
      ],
      ["NGC 3077", "10:03:19.07", "+68:44:02.2", "I0pec", 14, 3.83, 5.4, 4.5, "M81 Group"],
    ] as const
  ).map(([name, ra, dec, morph, v, d, major, minor, group]) => {
    const eq = { ra: sexagesimalDegrees(ra, true), dec: sexagesimalDegrees(dec) };
    return {
      name,
      aliases: [name],
      ...eq,
      ...icrsToGalactic(eq.ra, eq.dec),
      distanceMpc: d,
      velocity: v,
      major,
      minor,
      morphology: morph,
      type: name === "NGC 2146" ? "Barred spiral" : typeOf(morph),
      group,
      source: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=" + encodeURIComponent(name),
      distanceSource: NEARBY_CATALOG_SOURCES.kingfish,
      distanceMethod: name === "IC 342" ? "Ceph" : name === "NGC 3077" ? "TRGB" : "TF",
      sizeDefinition: "D25" as const,
    };
  }),
];
export const NEARBY_MEASUREMENT_BY_NAME = new Map(NEARBY_MEASUREMENTS.map((m) => [m.name, m]));
export function makeNearbyGalaxyAdditions(
  existing: readonly ObservationalGalaxy[],
): ObservationalGalaxy[] {
  const known = new Set(
    existing.flatMap((g) => [g.name, g.id, g.preferredName, ...g.aliases]).map(catalogNameKey),
  );
  return NEARBY_MEASUREMENTS.filter((m) => {
    if ([m.name, ...m.aliases].some((n) => known.has(catalogNameKey(n)))) return false;
    for (const n of [m.name, ...m.aliases]) known.add(catalogNameKey(n));
    return true;
  }).map((m) => {
    const q = m.minor / m.major,
      old = /spheroidal|elliptical|lenticular/i.test(m.type);
    const distance = m.distanceMpc * 1e6 * pc;
    return {
      id: "nearby-" + catalogNameKey(m.aliases[0]),
      name: m.name,
      preferredName: m.name,
      aliases: m.aliases,
      type: m.type,
      ra: m.ra,
      dec: m.dec,
      l: m.l,
      b: m.b,
      distance,
      size: 2 * distance * Math.tan((m.major * Math.PI) / (180 * 60 * 2)),
      color: old ? "#e6cda9" : "#b5cced",
      // Disk inclination is a thin-disk axis-ratio estimate, not a measured kinematic tilt.
      inclination:
        old || /irregular/i.test(m.type) ? 0 : (Math.acos(Math.min(1, q)) * 180) / Math.PI,
      posAngle: m.pa,
      redshift: m.velocity / 299792.458,
      redshiftMethod: "velocity_proxy",
      radialVelocityKmS: m.velocity,
      independentDistanceLy: /Flow/.test(m.distanceMethod) ? undefined : distance,
      independentDistanceMpc: /Flow/.test(m.distanceMethod) ? undefined : m.distanceMpc,
      distanceUncertaintyLy:
        m.distanceSigmaMpc === undefined ? undefined : m.distanceSigmaMpc * 1e6 * pc,
      morphologyClass: m.morphology,
      angularDiameterArcmin: { major: m.major, minor: m.minor },
      hostGroup: m.group,
      observationSource: m.source,
      uncertaintyNotes: `Adopted distance: ${m.distanceMethod} (${m.distanceSource}). ${m.sizeDefinition === "half-light" ? "The display envelope spans four observed major-axis half-light radii, not an outer boundary." : "Size is the optical D25 isophotal diameter."} ${m.pa === undefined ? "Sky position angle is not supplied; the display orientation is reconstructed." : "Sky PA follows the cited structural fit."} Intrinsic depth, near side, star positions and viewing colours are reconstructed; they are not a 3D survey. z = v/c is a low-redshift velocity proxy. For Andromeda XI and XIII, the larger asymmetric distance-error side is retained as a conservative bound. Source edition and uncertainties are retained; absence of a distance error does not mean exact distance.`,
      level: 2 as const,
      distanceTier: m.group.includes("Virgo")
        ? ("virgo_cluster" as const)
        : m.distanceMpc < 1.5
          ? ("local_group" as const)
          : ("nearby_groups" as const),
      measurements: m,
    };
  });
}
