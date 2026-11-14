import type { VisitGalaxy } from "./store";
import { getGalaxyByAnyName } from "./galaxy-catalog";
import { galaxyIdentityKey } from "./galaxy-ingestion";
import { galaxyDestinations } from "./GalaxyDestinationGrid";
import { EXPLORER_GALAXIES } from "./exploration-galaxies";
import { OBSERVED_OBJECTS } from "./observed-objects";
import { NAMED_STARS } from "./data";
import { REAL_SYSTEMS } from "./real-exoplanets";
import { objectHost, MILKY_WAY } from "./object-hosts";
import { COSMIC_BENCHMARKS } from "@/lib/astronomy/cosmic-web/survey-catalogs";
import { gToXYZ } from "./galaxy-models";
import type { ExploreTarget } from "./exploration-scope";
export type ExplorerEntry = ExploreTarget & { type: string; detail: string; aliases?: string[] };
const entryCache = new Map<string, ExplorerEntry[]>();
export function galaxyEntries(name: string, descriptor?: VisitGalaxy): ExplorerEntry[] {
  if (entryCache.has(name)) return entryCache.get(name)!;
  const g = EXPLORER_GALAXIES.find((g) => g.name === name) ?? descriptor;
  if (!g) return [];
  const base = galaxyDestinations(name, g)
    .filter(
      (d) =>
        d.action !== "object" && (!("unresolved" in g && g.unresolved) || d.action !== "region"),
    )
    .map((d) => ({
      id: d.id,
      galaxy: g,
      name: d.name,
      host: name,
      kind: (d.action === "body" ? "planet" : d.action) as ExploreTarget["kind"],
      type:
        d.action === "body" && /candidate/i.test(d.note)
          ? "Planet candidate (unconfirmed)"
          : d.type,
      detail: d.note,
      local: d.landmark?.local,
      distance: d.landmark?.distance,
    }));
  const objects = OBSERVED_OBJECTS.filter((o) => objectHost(o.id) === name).map((o) => ({
    id: o.id,
    name: o.name,
    host: name,
    kind: "object" as const,
    type: o.category,
    detail: o.subtype,
    aliases: o.aliases,
  }));
  const extras: ExplorerEntry[] = [];
  // No separate "Solar System" row: the Sun row already leads to our planetary system.
  if (name === MILKY_WAY) {
    for (const star of NAMED_STARS)
      for (const p of REAL_SYSTEMS[star.name] ?? [])
        extras.push({
          id: p.name,
          name: p.name,
          host: name,
          kind: "exo",
          starName: star.name,
          type: "Exoplanet",
          detail: "Orbits " + star.name,
        });
  }
  const result = [...extras, ...base, ...objects].filter(
    (d, i, a) => a.findIndex((o) => o.kind === d.kind && o.id === d.id) === i,
  );
  const rank = (d: ExplorerEntry) =>
    d.id === "Sun"
      ? 1
      : d.kind === "planet"
        ? 2
        : d.kind === "host"
          ? 3
          : d.kind === "star"
            ? 4
            : d.kind === "object"
              ? 5
              : d.kind === "exo"
                ? 6
                : 7;
  result.sort((a, b) => rank(a) - rank(b));
  entryCache.set(name, result);
  return result;
}
export function outsideEntries(): ExplorerEntry[] {
  const unknown = OBSERVED_OBJECTS.filter((o) => objectHost(o.id) === null).map((o) => ({
    id: o.id,
    name: o.name,
    host: null,
    kind: "object" as const,
    type: "Host unknown",
    detail: "No individual host galaxy has been identified.",
    aliases: o.aliases,
  }));
  const structures = COSMIC_BENCHMARKS.map((b) => ({
    id: b.id,
    name: b.name,
    host: null,
    kind: "space" as const,
    type: b.type,
    detail: b.description,
    position: gToXYZ(b.l, b.b, b.distanceGlyPlanck * 1e9).toArray() as [number, number, number],
    distance: b.diameterMly * 1e6 * 1.8,
  }));
  return [...unknown, ...structures];
}
const compactSearch = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
function prepareSearchEntry(entry: ExplorerEntry) {
  const text = [entry.name, entry.id, entry.type, entry.detail, ...(entry.aliases ?? [])]
    .join(" ")
    .toLowerCase();
  return {
    entry,
    text,
    compact: compactSearch(text),
    name: compactSearch(entry.name),
    id: compactSearch(entry.id),
    aliases: entry.aliases?.map(compactSearch) ?? [],
    identityKeys:
      entry.kind === "galaxy" ? [entry.name, ...(entry.aliases ?? [])].map(galaxyIdentityKey) : [],
  };
}
let universeSearchIndex: ReturnType<typeof prepareSearchEntry>[] | undefined;
/** Search includes membership breadcrumbs; browsing still respects the entered galaxy. */
export function searchExplorer(
  query: string,
  activeGalaxy: string | null,
  descriptor?: VisitGalaxy,
): ExplorerEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = activeGalaxy
    ? galaxyEntries(activeGalaxy, descriptor).map(prepareSearchEntry)
    : (universeSearchIndex ??= EXPLORER_GALAXIES.flatMap((g) => [
        {
          id: g.name,
          name: g.name,
          host: g.name,
          kind: "galaxy" as const,
          type: "Galaxy",
          detail: g.type,
          aliases: getGalaxyByAnyName(g.name)?.aliases,
        },
        ...galaxyEntries(g.name),
      ])
        .concat(outsideEntries())
        .map(prepareSearchEntry));
  const needle = compactSearch(q),
    identity = galaxyIdentityKey(q);
  const score = (d: ReturnType<typeof prepareSearchEntry>) =>
    Number(d.name === needle) * 3 +
    Number(d.id === needle) * 3 +
    Number(d.aliases.includes(needle)) * 2 +
    Number(d.entry.name.toLowerCase().startsWith(q));
  return all
    .filter((d) => {
      return (
        d.text.includes(q) ||
        (needle.length > 0 && d.compact.includes(needle)) ||
        d.identityKeys.includes(identity)
      );
    })
    .sort((a, b) => score(b) - score(a))
    .slice(0, 80)
    .map((d) => d.entry);
}

/** Observed stars and clusters retain object navigation while filtering by scientific class. */
export function matchesExplorerCategory(d: ExplorerEntry, category: string) {
  const observedStar =
    d.kind === "object" &&
    ["Variable star", "Unusual star", "Supergiant", "Dwarf star"].includes(d.type);
  const cluster = d.kind === "object" && d.type === "Star cluster";
  if (category === "all") return true;
  if (category === "star") return observedStar || d.kind === "star" || d.kind === "host";
  if (category === "cluster") return cluster;
  const blackHole =
    d.kind === "object" && (d.type === "Black hole" || /black.hole candidate/i.test(d.detail));
  if (category === "black_hole") return blackHole;
  if (category === "nebula") return d.kind === "object" && d.type === "Nebula";
  if (category === "remnant")
    return (
      d.kind === "object" && !blackHole && ["Neutron star", "Stellar remnant"].includes(d.type)
    );
  if (category === "object") return d.kind === "object" && !observedStar && !cluster;
  return d.kind === category || (category === "planet" && d.kind === "exo");
}
