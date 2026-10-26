import { useGalaxyJourney } from "./galaxy-journey";
import { systemWorldPosition, systemViewDistance } from "./galaxy-models";
import { PA99N2_WORLD } from "./andromeda-data";
import { useMemo, useState } from "react";
import { useStore } from "./store";
import { GALAXY_BY_NAME } from "./galaxy-models";
import { ANDROMEDA_NAME, M31_PLANETS, PA99N2_STAR } from "./andromeda-data";
import { NAMED_STARS } from "./data";
import { PLANETS } from "./Planets";
import { OBSERVED_OBJECTS } from "./observed-objects";
export type GalaxyDestination = {
  id: string;
  name: string;
  type: string;
  note: string;
  action: "star" | "body" | "object" | "host";
};
export function galaxyDestinations(name: string): GalaxyDestination[] {
  const list: GalaxyDestination[] = [];
  if (name === "Milky Way") {
    for (const star of NAMED_STARS)
      list.push({
        id: star.name,
        name: star.name,
        type: "Star",
        note: star.spectral,
        action: "star",
      });
    for (const p of PLANETS) {
      list.push({ id: p.name, name: p.name, type: "Planet", note: "Solar System", action: "body" });
      for (const m of p.moons ?? [])
        list.push({
          id: `${p.name}:${m.name}`,
          name: m.name,
          type: "Moon",
          note: p.name,
          action: "body",
        });
    }
    for (const o of OBSERVED_OBJECTS.filter((o) => o.distance < 120000))
      list.push({ id: o.id, name: o.name, type: o.category, note: o.subtype, action: "object" });
  } else {
    const system = GALAXY_BY_NAME.get(name)?.system;
    const star = name === ANDROMEDA_NAME ? PA99N2_STAR : system?.star;
    const planets = name === ANDROMEDA_NAME ? M31_PLANETS : system?.planets;
    if (star)
      list.push({
        id: star.name,
        name: star.name,
        type: "Host star",
        note: star.spectral,
        action: "host",
      });
    for (const p of planets ?? []) {
      list.push({
        id: p.name,
        name: p.name,
        type: "Planet",
        note: p.confirmed ? "Observed candidate" : "Modelled world",
        action: "body",
      });
      for (const m of p.moons ?? [])
        list.push({
          id: `${p.name} · ${m.name}`,
          name: m.name,
          type: "Moon",
          note: `${p.name} · model`,
          action: "body",
        });
    }
    if (/M87|Virgo A/i.test(name)) {
      const o = OBSERVED_OBJECTS.find((o) => o.id === "m87star");
      if (o)
        list.push({
          id: o.id,
          name: o.name,
          type: o.category,
          note: "Observed nucleus",
          action: "object",
        });
    }
  }
  return [...new Map(list.map((item) => [item.id, item])).values()];
}
export function GalaxyDestinationGrid({ name, onVisit }: { name: string; onVisit?: () => void }) {
  const [query, setQuery] = useState(""),
    [limit, setLimit] = useState(12);
  const all = useMemo(() => galaxyDestinations(name), [name]);
  const filtered = all.filter((d) =>
    `${d.name} ${d.type} ${d.note}`.toLowerCase().includes(query.toLowerCase()),
  );
  const visit = (d: GalaxyDestination) => {
    onVisit?.();
    const state = useStore.getState();
    if (d.action === "star") {
      const star = NAMED_STARS.find((s) => s.name === d.id);
      if (star) state.flyToStar(star);
    } else if (d.action === "object") state.setSelectedObject(d.id);
    else if (d.action === "host") {
      const g = useGalaxyJourney.getState().galaxy ?? state.visitGalaxy;
      if (g) {
        const m = GALAXY_BY_NAME.get(name),
          live = window.__planetPositions?.get(d.id);
        const p =
          live ?? (name === ANDROMEDA_NAME ? PA99N2_WORLD : m ? systemWorldPosition(m) : null);
        const distance = m
          ? systemViewDistance(m)
          : M31_PLANETS.reduce((a, p) => Math.max(a, p.a), 0.001) * 3.2;
        if (p)
          useStore.setState({
            visitGalaxy: {
              ...g,
              view: undefined,
              focus: { x: p.x, y: p.y, z: p.z, distance, key: d.id },
            },
            selectedStar: null,
            selectedObjectId: null,
            visitPlanet: null,
            cameraFree: false,
            flyTo: { x: p.x, y: p.y, z: p.z, distance },
          });
      }
    } else if (name === "Milky Way") state.setVisitPlanet(d.id);
    else
      useStore.setState({
        visitPlanet: d.id,
        selectedStar: null,
        selectedObjectId: null,
        flyTo: null,
        cameraFree: false,
        tourActive: false,
      });
  };
  return (
    <section aria-label="Visitable objects" className="mt-5 border-y border-white/10 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-white">Explore this galaxy</h3>
        <span className="text-xs text-white/45">{all.length} destinations</span>
      </div>
      {all.length > 0 ? (
        <>
          <input
            aria-label="Search galaxy objects"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
            }}
            placeholder="Search stars, worlds and objects"
            className="mt-3 min-h-11 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-300"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {filtered.slice(0, limit).map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => visit(d)}
                className="min-h-20 rounded-lg border border-white/10 bg-white/[.025] p-3 text-left transition hover:border-sky-300/50 hover:bg-sky-300/5 focus-visible:outline focus-visible:outline-sky-300"
              >
                <span className="block text-[10px] uppercase tracking-wider text-sky-200/65">
                  {d.type}
                </span>
                <span className="mt-1 block text-xs font-medium text-white/90">{d.name}</span>
                <span className="mt-1 block text-[11px] text-white/45">{d.note}</span>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <p className="mt-3 text-xs text-white/50">No matching destinations.</p>
          )}
          {limit < filtered.length && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + 24)}
              className="mt-3 min-h-11 w-full rounded-lg border border-white/15 text-xs text-white/75 hover:bg-white/5"
            >
              Show more ({filtered.length - limit} remaining)
            </button>
          )}
        </>
      ) : (
        <p className="mt-2 text-xs leading-relaxed text-white/55">
          This catalogue contains the galaxy overview. Individual objects are not yet available to
          visit here.
        </p>
      )}
    </section>
  );
}
