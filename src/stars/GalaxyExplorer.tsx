import { useEffect, useMemo, useRef, useState } from "react";
import {
  Map,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  ArrowLeft,
  Orbit,
  ArrowUpRight,
  Settings2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "./store";
import { useExploration, type ExploreTarget } from "./exploration-scope";
import { EXPLORER_GALAXIES, explorerGalaxy } from "./exploration-galaxies";
import {
  galaxyEntries,
  matchesExplorerCategory,
  outsideEntries,
  searchExplorer,
  type ExplorerEntry,
} from "./exploration-catalog";
import { navigateExplorationTarget, returnToGalaxyOverview } from "./exploration-navigation";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";
import { getGalaxyByAnyName } from "./galaxy-catalog";
import { filterNearbyGalaxies, galaxyDistanceLabel } from "./galaxy-measurement-format";

const discoverableGalaxies = EXPLORER_GALAXIES.map((descriptor) => ({
  ...descriptor,
  ...getGalaxyByAnyName(descriptor.name),
  ...(descriptor.name === "Milky Way" ? { hostGroup: "Local Group" } : {}),
  descriptor,
}));
const galaxyAssociations = [
  ...new Set([
    ...discoverableGalaxies.map((g) => g.hostGroup).filter((g): g is string => !!g),
    "Virgo Cluster",
    "Fornax Cluster",
    "Perseus Cluster",
    "Coma Cluster",
  ]),
].sort();

export function GalaxyExplorer() {
  const phase = useExploration((s) => s.phase),
    active = useExploration((s) => s.galaxy),
    open = useExploration((s) => s.mapOpen);
  const destinationName = useExploration((s) => s.destinationName);
  const pending = useExploration((s) => s.pending),
    queued = useExploration((s) => s.queued);
  const journeyGalaxy = useGalaxyJourney((s) => s.galaxy);
  const freeLook = useStore((s) => s.cameraFree);
  const selected = useStore((s) => s.visitGalaxy),
    searchOpen = useStore((s) => s.universalSearchOpen);
  const [query, setQuery] = useState(""),
    [tab, setTab] = useState<"galaxies" | "beyond">("galaxies"),
    [category, setCategory] = useState("all"),
    [limit, setLimit] = useState(25);
  const [range, setRange] = useState("all"),
    [galaxyType, setGalaxyType] = useState("all"),
    [association, setAssociation] = useState("all"),
    [featured, setFeatured] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    veil = useRef<HTMLDivElement>(null);
  const inside = phase === "inside",
    travelling = phase === "entering" || phase === "exiting";
  const reduced = useGalaxyJourney((s) => s.reducedMotion);
  const requestedAssociation = useExploration((s) => s.requestedGalaxyAssociation);
  useEffect(() => {
    if (!requestedAssociation || phase !== "outside") return;
    setAssociation(requestedAssociation);
    setRange("all");
    setGalaxyType("all");
    setFeatured(false);
    setQuery("");
    setTab("galaxies");
    setLimit(25);
    useExploration.setState({ requestedGalaxyAssociation: null, mapOpen: true });
  }, [requestedAssociation, phase]);
  useEffect(() => {
    setQuery("");
    setLimit(25);
    setCategory("all");
  }, [phase, active]);
  useEffect(() => {
    if (searchOpen && !travelling) {
      useExploration.setState({ mapOpen: true });
      useStore.getState().setUniversalSearchOpen(false);
      requestAnimationFrame(() => input.current?.focus());
    }
  }, [searchOpen, travelling]);
  useEffect(() => {
    if (!pending || phase !== "outside") return;
    if (pending.host) {
      const galaxy = explorerGalaxy(pending.host) ?? pending.galaxy;
      if (galaxy) useStore.getState().setVisitGalaxy(galaxy);
    } else {
      useExploration.setState({ pending: null });
      navigateExplorationTarget(pending);
    }
  }, [pending, phase]);
  useEffect(() => {
    if (phase !== "inside" || !queued) return;
    useExploration.setState({ queued: null });
    navigateExplorationTarget(queued);
  }, [phase, queued]);
  useEffect(() => {
    if (!travelling || !reduced) return;
    let frame = 0;
    const tick = () => {
      if (veil.current)
        veil.current.style.opacity = String(Math.sin(Math.PI * galaxyMotion.progress));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [travelling, reduced]);
  const entries = useMemo(() => {
    const rows = query.trim()
      ? searchExplorer(query, inside ? active : null, selected ?? journeyGalaxy ?? undefined)
      : inside && active
        ? galaxyEntries(active, selected ?? journeyGalaxy ?? undefined)
        : tab === "beyond"
          ? outsideEntries()
          : [];
    return rows.filter((d) => matchesExplorerCategory(d, category));
  }, [query, inside, active, tab, category, selected, journeyGalaxy]);
  const galaxies = useMemo(
    () =>
      filterNearbyGalaxies(discoverableGalaxies, {
        range,
        type: galaxyType,
        group: association,
        featured,
      }),
    [range, galaxyType, association, featured],
  );
  const visit = (name: string) => {
    const g = explorerGalaxy(name) ?? (selected?.name === name ? selected : null);
    if (g) useGalaxyJourney.getState().enter(g);
  };
  const choose = (target: ExploreTarget) => {
    navigateExplorationTarget(target);
    if (target.kind === "galaxy") setQuery("");
    if (inside) useExploration.setState({ mapOpen: false });
  };
  const selectedGalaxy =
    selected &&
    (explorerGalaxy(selected.name) ?? {
      ...selected,
      note: "This catalogue galaxy’s depth and stellar population are reconstructed.",
    });
  return (
    <>
      {travelling && reduced && (
        <div
          ref={veil}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 bg-black"
          style={{ opacity: 0 }}
        />
      )}
      {!open ? (
        !travelling && (
          <div className="galaxy-explorer-shortcuts pointer-events-auto fixed left-4 top-20 z-40 flex gap-2">
            <button
              aria-label="Open explorer map"
              onClick={() => useExploration.setState({ mapOpen: true })}
              className="flex min-h-12 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm text-white"
            >
              <Map size={18} />
              {inside ? (
                <span className="text-left">
                  <span className="block text-xs text-neutral-400">{active}</span>
                  <span className="block">{destinationName ?? "Galaxy map"}</span>
                </span>
              ) : (
                "Explore galaxies"
              )}
            </button>
            {phase === "outside" && selectedGalaxy && (
              <button
                onClick={() => visit(selectedGalaxy.name)}
                className="min-h-12 rounded-xl bg-white px-4 text-sm font-medium text-black"
              >
                Visit galaxy
              </button>
            )}
          </div>
        )
      ) : (
        <aside
          aria-label="Galaxy explorer map"
          onKeyDown={(e) => e.stopPropagation()}
          className="pointer-events-auto fixed left-4 top-20 z-40 flex max-h-[calc(100dvh-160px)] w-[336px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl bg-neutral-950 text-white max-sm:max-h-[calc(100dvh-112px)]"
        >
          <header className="shrink-0 bg-neutral-900 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-400">Our Visible Universe</p>
                <h2 className="mt-1 text-base font-medium">
                  {inside ? active : travelling ? "Your galaxy journey" : "Where shall we go?"}
                </h2>
              </div>
              <button
                aria-label="View options"
                title="View options"
                onClick={() => {
                  useExploration.setState({ mapOpen: false });
                  useStore.setState({ uiHidden: false, navigationSettingsOpen: true });
                }}
                className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"
              >
                <Settings2 size={18} />
              </button>
              <button
                aria-label="Minimize explorer map"
                onClick={() => useExploration.setState({ mapOpen: false })}
                className="grid size-11 shrink-0 place-items-center rounded-lg hover:bg-white/10"
              >
                <ChevronDown size={20} />
              </button>
            </div>
            {inside ? (
              <button
                onClick={() => useGalaxyJourney.getState().exit()}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black"
              >
                <ArrowLeft size={16} />
                Exit galaxy
              </button>
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-neutral-400">
                {travelling
                  ? "Enjoy the flight. Your map will be ready when you arrive."
                  : "Choose a galaxy, visit it, then discover what lives inside."}
              </p>
            )}
            {inside && active && (
              <button
                onClick={() =>
                  returnToGalaxyOverview(active, window.innerWidth, window.innerHeight)
                }
                className="mt-2 min-h-11 w-full rounded-xl bg-neutral-800 text-sm"
              >
                Galaxy overview
              </button>
            )}
            {inside && !freeLook && (
              <button
                onClick={() => {
                  useStore.getState().toggleCameraFree();
                  useExploration.setState({ mapOpen: false });
                }}
                className="mt-2 min-h-11 w-full rounded-xl bg-neutral-800 text-sm"
              >
                Fly freely
              </button>
            )}
            {!travelling && (
              <label className="mt-4 flex min-h-12 items-center gap-2 rounded-xl bg-black px-3 text-neutral-400 focus-within:ring-2 focus-within:ring-sky-300">
                <Search size={17} />
                <span className="sr-only">Search the explorer</span>
                <input
                  ref={input}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setLimit(25);
                  }}
                  placeholder={inside ? "Search this galaxy" : "Search galaxies or objects"}
                  className="min-w-0 flex-1 bg-transparent py-3 text-base sm:text-sm text-white outline-none placeholder:text-neutral-500"
                />
                {query && (
                  <button
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="grid size-11 place-items-center"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
            )}
          </header>
          {!travelling && (
            <>
              {!inside && !query && (
                <div className="flex shrink-0 gap-1 px-4 pt-3" aria-label="Map sections">
                  <button
                    aria-pressed={tab === "galaxies"}
                    onClick={() => {
                      setTab("galaxies");
                      setLimit(25);
                    }}
                    className={
                      "min-h-11 flex-1 rounded-lg text-sm " +
                      (tab === "galaxies" ? "bg-neutral-800 text-white" : "text-neutral-400")
                    }
                  >
                    Galaxies
                  </button>
                  <button
                    aria-pressed={tab === "beyond"}
                    onClick={() => {
                      setTab("beyond");
                      setLimit(25);
                    }}
                    className={
                      "min-h-11 flex-1 rounded-lg text-sm " +
                      (tab === "beyond" ? "bg-neutral-800 text-white" : "text-neutral-400")
                    }
                  >
                    Beyond galaxies
                  </button>
                </div>
              )}
              {inside && (
                <div className="flex shrink-0 items-center justify-between gap-2 px-4 py-3">
                  <span className="text-xs text-neutral-400">Objects in this galaxy</span>
                  <select
                    aria-label="Filter galaxy objects"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setLimit(25);
                    }}
                    className="min-h-11 max-w-[56%] rounded-lg bg-neutral-800 px-2 text-base sm:text-xs"
                  >
                    <option value="all">All objects</option>
                    <option value="solar">Solar system</option>
                    <option value="star">Stars</option>
                    <option value="cluster">Clusters & associations</option>
                    <option value="nebula">Nebulae</option>
                    <option value="black_hole">Black holes & candidates</option>
                    <option value="remnant">Pulsars & remnants</option>
                    <option value="planet">Planets & moons</option>
                    <option value="object">Nebulae & compact objects</option>
                    <option value="region">Regions</option>
                  </select>
                </div>
              )}
              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3 pt-2"
                aria-label={
                  inside
                    ? "Objects in current galaxy"
                    : query
                      ? "Explorer search results"
                      : tab === "galaxies"
                        ? "Available galaxies"
                        : "Objects beyond individual galaxies"
                }
              >
                {phase === "outside" && !query && tab === "galaxies" && (
                  <details className="mx-4 mt-3 shrink-0 rounded-xl bg-neutral-900">
                    <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm focus-visible:outline focus-visible:outline-sky-300">
                      Nearby galaxies · filters
                    </summary>
                    <div className="grid grid-cols-2 gap-3 px-3 pb-3 text-xs text-neutral-300">
                      <label>
                        Distance
                        <select
                          aria-label="Galaxy distance range"
                          value={range}
                          onChange={(e) => {
                            setRange(e.target.value);
                            setLimit(25);
                          }}
                          className="mt-1 min-h-11 w-full rounded-lg bg-neutral-800 px-2 text-base sm:text-sm"
                        >
                          <option value="all">All distances</option>
                          <option value="0-11">0–11 Mpc</option>
                          <option value="11-30">11–30 Mpc</option>
                          <option value="30-100">30–100 Mpc</option>
                        </select>
                      </label>
                      <label>
                        Galaxy type
                        <select
                          aria-label="Galaxy morphology"
                          value={galaxyType}
                          onChange={(e) => {
                            setGalaxyType(e.target.value);
                            setLimit(25);
                          }}
                          className="mt-1 min-h-11 w-full rounded-lg bg-neutral-800 px-2 text-base sm:text-sm"
                        >
                          <option value="all">All types</option>
                          <option value="spiral">Spiral</option>
                          <option value="barred">Barred spiral</option>
                          <option value="elliptical">Elliptical</option>
                          <option value="lenticular">Lenticular</option>
                          <option value="irregular">Irregular</option>
                          <option value="dwarf">Dwarf</option>
                          <option value="blue compact">Blue compact dwarf</option>
                        </select>
                      </label>
                      <label className="col-span-2">
                        Galaxy association
                        <select
                          aria-label="Galaxy association"
                          value={association}
                          onChange={(e) => {
                            setAssociation(e.target.value);
                            setLimit(25);
                          }}
                          className="mt-1 min-h-11 w-full rounded-lg bg-neutral-800 px-2 text-base sm:text-sm"
                        >
                          <option value="all">All associations</option>
                          {galaxyAssociations.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                          <option value="unassigned">Membership unassigned</option>
                        </select>
                      </label>
                      <label className="col-span-2 flex min-h-11 cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => {
                            setFeatured(e.target.checked);
                            setLimit(25);
                          }}
                          className="size-5 accent-sky-300"
                        />
                        Featured destinations
                      </label>
                      <p className="col-span-2 leading-relaxed text-neutral-400">
                        Associations follow cited catalogues. Distances are adopted estimates;
                        coverage is incomplete.
                      </p>
                    </div>
                  </details>
                )}
                {phase === "outside" && selectedGalaxy && !query && tab === "galaxies" && (
                  <div className="mx-4 mt-3 shrink-0 rounded-xl bg-neutral-800 p-3">
                    <p className="text-xs text-neutral-400">Ready to explore</p>
                    <p className="mt-1 text-sm font-medium">{selectedGalaxy.name}</p>
                    {selectedGalaxy.note && (
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {selectedGalaxy.note}
                      </p>
                    )}
                    <button
                      onClick={() => visit(selectedGalaxy.name)}
                      className="mt-3 min-h-11 w-full rounded-xl bg-white text-sm font-medium text-black"
                    >
                      Visit galaxy <ArrowUpRight className="ml-1 inline" size={15} />
                    </button>
                  </div>
                )}
                {phase === "outside" && !query && tab === "galaxies" ? (
                  <>
                    <p role="status" className="px-3 py-2 text-xs text-neutral-400">
                      {galaxies.length} galaxies · nearest first
                    </p>
                    {!galaxies.length && (
                      <p className="px-3 py-4 text-sm text-neutral-300">
                        No galaxies match these filters.
                      </p>
                    )}
                    {galaxies.slice(0, limit).map((g) => (
                      <button
                        key={g.name}
                        onClick={() => useStore.getState().setVisitGalaxy(g.descriptor)}
                        className={
                          "flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-neutral-800 " +
                          (selected?.name === g.name ? "bg-neutral-900" : "")
                        }
                      >
                        <Orbit size={21} className="shrink-0 text-neutral-400" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{g.name}</span>
                          <span className="mt-1 block text-xs text-neutral-400">
                            {g.name === "Milky Way" ? "Our home galaxy" : g.type}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-neutral-300">
                            {g.name === "Milky Way"
                              ? "Sun is inside this galaxy"
                              : galaxyDistanceLabel(g)}
                          </span>
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-neutral-500" />
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {phase === "outside" && !query && tab === "beyond" && (
                      <p className="px-3 py-2 text-xs leading-relaxed text-neutral-400">
                        Explore groups of galaxies and objects whose individual host has not been
                        identified.
                      </p>
                    )}
                    {entries.slice(0, limit).map((d) => (
                      <button
                        key={d.kind + ":" + d.host + ":" + d.id}
                        onClick={() => choose(d)}
                        className="flex min-h-20 w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-neutral-800"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs text-neutral-400">
                            {d.host ?? "Beyond galaxies / host unknown"}{" "}
                            <ChevronRight className="inline" size={11} />
                          </span>
                          <span className="mt-1 block text-sm font-medium">{d.name}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-neutral-400">
                            {d.type}
                          </span>
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-neutral-500" />
                      </button>
                    ))}
                    {!entries.length && (
                      <p className="px-3 py-5 text-sm leading-relaxed text-neutral-400">
                        {inside
                          ? "No matching objects in this galaxy. Exit this galaxy to search somewhere else."
                          : "No matching destinations. Try a galaxy, planet or star name."}
                      </p>
                    )}
                  </>
                )}
                {limit <
                  (phase === "outside" && !query && tab === "galaxies"
                    ? galaxies.length
                    : entries.length) && (
                  <button
                    onClick={() => setLimit((n) => n + 30)}
                    className="mt-2 min-h-11 w-full rounded-xl bg-neutral-900 text-sm"
                  >
                    Show more
                  </button>
                )}
              </div>
            </>
          )}
        </aside>
      )}
      <Dialog
        open={!!pending && !travelling && (phase === "inside" || pending.host !== null)}
        onOpenChange={(v) => {
          if (!v) useExploration.setState({ pending: null });
        }}
      >
        <DialogContent
          onKeyDown={(e) => e.stopPropagation()}
          className="w-[calc(100vw-32px)] max-w-md rounded-2xl border-neutral-700 bg-neutral-950 text-white [&>button.absolute]:grid [&>button.absolute]:min-h-11 [&>button.absolute]:min-w-11 [&>button.absolute]:place-items-center [&>button.absolute]:right-2 [&>button.absolute]:top-2"
        >
          <DialogHeader>
            <DialogTitle>
              {phase === "inside" ? "Exit this galaxy first" : "Your next discovery"}
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-relaxed text-neutral-300">
              {phase === "inside"
                ? pending?.kind === "journey"
                  ? `Exit ${active} before starting the Cosmic Scale Journey.`
                  : `You are inside ${active}. Exit this galaxy before travelling to ${pending?.host ?? "objects beyond galaxies"}.`
                : pending?.kind === "galaxy"
                  ? `Visit ${pending.name} to explore what’s inside.`
                  : `${pending?.name} is in ${pending?.host}. To visit this object, click Visit galaxy. We will fly inside, then take you to your chosen destination.`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 rounded-xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">
              {pending?.kind === "journey"
                ? "Beyond this galaxy"
                : (pending?.host ?? "Host unknown")}
            </p>
            <p className="mt-1 text-base">{pending?.name}</p>
          </div>
          <button
            onClick={() =>
              phase === "inside"
                ? useGalaxyJourney.getState().exit()
                : pending?.host && visit(pending.host)
            }
            className="mt-2 min-h-12 rounded-xl bg-white px-4 text-sm font-medium text-black"
          >
            {phase === "inside" ? "Exit galaxy" : "Visit galaxy"}
          </button>
          <button
            onClick={() => useExploration.setState({ pending: null })}
            className="min-h-11 rounded-xl px-4 text-sm text-neutral-300"
          >
            Not now
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
