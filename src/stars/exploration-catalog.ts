import type { VisitGalaxy } from "./store";
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
  if (name === MILKY_WAY) {
    extras.push({
      id: "solar-system",
      name: "Solar System",
      host: name,
      kind: "solar",
      type: "Our planetary system",
      detail: "Sun, Earth, planets and moons",
      aliases: ["sun system", "sol", "our home"],
    });
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
    d.kind === "solar"
      ? 0
      : d.id === "Sun"
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
/** Search includes membership breadcrumbs; browsing still respects the entered galaxy. */
export function searchExplorer(
  query: string,
  activeGalaxy: string | null,
  descriptor?: VisitGalaxy,
): ExplorerEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = activeGalaxy
    ? galaxyEntries(activeGalaxy, descriptor)
    : EXPLORER_GALAXIES.flatMap((g) => [
        {
          id: g.name,
          name: g.name,
          host: g.name,
          kind: "galaxy" as const,
          type: "Galaxy",
          detail: g.type,
        },
        ...galaxyEntries(g.name),
      ]).concat(outsideEntries());
  const compact = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const needle = compact(q);
  const score = (d: ExplorerEntry) =>
    Number(compact(d.name) === needle) * 3 +
    Number(compact(d.id) === needle) * 3 +
    Number(!!d.aliases?.some((a) => compact(a) === needle)) * 2 +
    Number(d.name.toLowerCase().startsWith(q));
  return all
    .filter((d) => {
      const text = [d.name, d.id, d.type, d.detail, ...(d.aliases ?? [])].join(" ").toLowerCase();
      return text.includes(q) || (needle.length > 0 && compact(text).includes(needle));
    })
    .sort((a, b) => score(b) - score(a))
    .slice(0, 80);
}
