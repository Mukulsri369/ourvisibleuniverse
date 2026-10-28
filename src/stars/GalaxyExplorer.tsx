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
  outsideEntries,
  searchExplorer,
  type ExplorerEntry,
} from "./exploration-catalog";
import { navigateExplorationTarget } from "./exploration-navigation";
import { useGalaxyJourney, galaxyMotion } from "./galaxy-journey";

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
  const input = useRef<HTMLInputElement>(null),
    veil = useRef<HTMLDivElement>(null);
  const inside = phase === "inside",
    travelling = phase === "entering" || phase === "exiting";
  const reduced = useGalaxyJourney((s) => s.reducedMotion);
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
    return rows.filter(
      (d) =>
        category === "all" ||
        d.kind === category ||
        (category === "star" && d.kind === "host") ||
        (category === "planet" && d.kind === "exo"),
    );
  }, [query, inside, active, tab, category, selected, journeyGalaxy]);
  const galaxies = useMemo(
    () =>
      EXPLORER_GALAXIES.slice().sort((a, b) =>
        a.name === "Milky Way"
          ? -1
          : b.name === "Milky Way"
            ? 1
            : a.name === "Andromeda (M31)"
              ? -1
              : b.name === "Andromeda (M31)"
                ? 1
                : a.distance - b.distance,
      ),
    [],
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
          <div className="pointer-events-auto fixed left-4 top-20 z-40 flex gap-2">
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
                onClick={() => useStore.setState({ uiHidden: false, navigationSettingsOpen: true })}
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
                    <option value="planet">Planets & moons</option>
                    <option value="object">Nebulae & compact objects</option>
                    <option value="region">Regions</option>
                  </select>
                </div>
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
                {phase === "outside" && !query && tab === "galaxies" ? (
                  galaxies.slice(0, limit).map((g) => (
                    <button
                      key={g.name}
                      onClick={() => useStore.getState().setVisitGalaxy(g)}
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
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-neutral-500" />
                    </button>
                  ))
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
                ? `You are inside ${active}. Exit this galaxy before travelling to ${pending?.host ?? "objects beyond galaxies"}.`
                : pending?.kind === "galaxy"
                  ? `Visit ${pending.name} to explore what’s inside.`
                  : `${pending?.name} is in ${pending?.host}. To visit this object, click Visit galaxy. We will fly inside, then take you to your chosen destination.`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 rounded-xl bg-neutral-900 p-4">
            <p className="text-xs text-neutral-400">{pending?.host ?? "Host unknown"}</p>
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
