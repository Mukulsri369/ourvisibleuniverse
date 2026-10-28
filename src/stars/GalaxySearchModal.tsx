import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import {
  searchObservationalAtlas,
  OBSERVATIONAL_GALAXY_CATALOG,
  type ObservationalGalaxy,
  type GalaxyDistanceTier,
} from "./galaxy-catalog";
import { formatLy } from "./GalaxyInfoPanel";
import { toXYZ } from "./Universe";

export function GalaxySearchModal() {
  const open = useStore((s) => s.galaxyAtlasSearchOpen);
  const setOpen = useStore((s) => s.setGalaxyAtlasSearchOpen);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);

  // Filter criteria states
  const [query, setQuery] = useState("");
  const [objectType, setObjectType] = useState<string>("all");
  const [distanceTier, setDistanceTier] = useState<GalaxyDistanceTier | "all">("all");
  const [redshiftRange, setRedshiftRange] = useState<
    "all" | "blueshifted" | "low" | "intermediate" | "high" | "cosmic_dawn"
  >("all");
  const [morphology, setMorphology] = useState<string>("all");
  const [constellation, setConstellation] = useState<string>("all");
  const [hostGroup, setHostGroup] = useState<string>("all");
  const [observationSource, setObservationSource] = useState<string>("all");

  // Derive unique options from catalog
  const constellations = useMemo(() => {
    const set = new Set<string>();
    for (const g of OBSERVATIONAL_GALAXY_CATALOG) {
      if (g.constellation) set.add(g.constellation);
    }
    return Array.from(set).sort();
  }, []);

  const hostGroups = useMemo(() => {
    const set = new Set<string>();
    for (const g of OBSERVATIONAL_GALAXY_CATALOG) {
      if (g.hostGroup) set.add(g.hostGroup);
    }
    return Array.from(set).sort();
  }, []);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const g of OBSERVATIONAL_GALAXY_CATALOG) {
      if (g.observationSource) set.add(g.observationSource.split("/")[0].trim());
    }
    return Array.from(set).sort();
  }, []);

  // Filtered results
  const results = useMemo(() => {
    return searchObservationalAtlas({
      query,
      type: objectType,
      distanceTier,
      redshiftRange,
      morphology,
      constellation,
      hostGroup,
      observationSource,
    });
  }, [
    query,
    objectType,
    distanceTier,
    redshiftRange,
    morphology,
    constellation,
    hostGroup,
    observationSource,
  ]);

  if (!open) return null;

  const handleSelectGalaxy = (g: ObservationalGalaxy) => {
    const pos = toXYZ(g.l, g.b, g.distance);
    setVisitGalaxy({
      name: g.name,
      x: pos.x,
      y: pos.y,
      z: pos.z,
      size: g.size,
      distance: g.distance,
      type: g.type,
    });
    setOpen(false);
  };

  const handleResetFilters = () => {
    setQuery("");
    setObjectType("all");
    setDistanceTier("all");
    setRedshiftRange("all");
    setMorphology("all");
    setConstellation("all");
    setHostGroup("all");
    setObservationSource("all");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        style={{ background: "rgba(3, 6, 18, 0.75)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#090c1f] shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-sky-400">
                Multi-Dimensional Ingestion Search
              </div>
              <h2 className="text-xl font-light tracking-wide text-white">
                Extragalactic Observational Catalog Explorer
              </h2>
            </div>
            <button
              aria-label="Close galaxy search"
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="border-b border-white/10 bg-white/[0.02] p-6 space-y-4">
            {/* Main Text Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by galaxy name, Messier, NGC, IC, UGC, PGC or alias (e.g. M31, Whirlpool, NGC 1365, GN-z11)..."
                className="flex-1 rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-sky-400 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleResetFilters}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white"
              >
                Reset
              </button>
            </div>

            {/* Dimensional Selectors */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7 text-xs">
              {/* 1. Object Type */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">Type</label>
                <select
                  value={objectType}
                  onChange={(e) => setObjectType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Types</option>
                  <option value="Spiral">Spiral</option>
                  <option value="Barred Spiral">Barred Spiral</option>
                  <option value="Elliptical">Elliptical</option>
                  <option value="Lenticular">Lenticular</option>
                  <option value="Irregular">Irregular</option>
                  <option value="Starburst">Starburst</option>
                  <option value="Interacting">Interacting</option>
                  <option value="Dwarf Spheroidal">Dwarf Spheroidal</option>
                  <option value="Dwarf Elliptical">Dwarf Elliptical</option>
                </select>
              </div>

              {/* 2. Distance Tier */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">
                  Distance Tier
                </label>
                <select
                  value={distanceTier}
                  onChange={(e) => setDistanceTier(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Distances</option>
                  <option value="local_group">Local Group (&lt;5 Mly)</option>
                  <option value="nearby_groups">Nearby (5–40 Mly)</option>
                  <option value="virgo_cluster">Virgo (40–75 Mly)</option>
                  <option value="distant_clusters">Distant (&gt;100 Mly)</option>
                  <option value="high_redshift">High-z (Cosmic Dawn)</option>
                </select>
              </div>

              {/* 3. Redshift Range */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">
                  Redshift (z)
                </label>
                <select
                  value={redshiftRange}
                  onChange={(e) => setRedshiftRange(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Redshifts</option>
                  <option value="blueshifted">Blueshifted (z &lt; 0)</option>
                  <option value="low">Low (0 &lt; z &lt; 0.02)</option>
                  <option value="intermediate">Intermediate (0.02–1.0)</option>
                  <option value="high">High (1.0–8.0)</option>
                  <option value="cosmic_dawn">Cosmic Dawn (z &gt; 8)</option>
                </select>
              </div>

              {/* 4. Morphology */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">
                  Morphology
                </label>
                <select
                  value={morphology}
                  onChange={(e) => setMorphology(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Morphology</option>
                  <option value="spiral">Spiral</option>
                  <option value="barred">Barred</option>
                  <option value="elliptical">Elliptical</option>
                  <option value="edge-on">Edge-on</option>
                  <option value="lenticular">Lenticular</option>
                  <option value="irregular">Irregular</option>
                  <option value="starburst">Starburst</option>
                  <option value="interacting">Interacting Merger</option>
                </select>
              </div>

              {/* 5. Constellation */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">
                  Constellation
                </label>
                <select
                  value={constellation}
                  onChange={(e) => setConstellation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Constellations</option>
                  {constellations.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Galaxy Group */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">
                  Cluster / Group
                </label>
                <select
                  value={hostGroup}
                  onChange={(e) => setHostGroup(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Groups</option>
                  {hostGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Observation Source */}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-white/40">Source</label>
                <select
                  value={observationSource}
                  onChange={(e) => setObservationSource(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] text-white"
                >
                  <option value="all">All Sources</option>
                  {sources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between text-xs text-white/50 mb-3">
              <span>
                Matching Galaxies: {results.length} of {OBSERVATIONAL_GALAXY_CATALOG.length}
              </span>
              <span className="text-[10px]">Click any entry to fly in 3D</span>
            </div>

            {results.length === 0 ? (
              <div className="grid h-48 place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/40">
                No extragalactic targets matched your filter criteria. Try clearing some filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {results.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => handleSelectGalaxy(g)}
                    className="flex cursor-pointer items-start justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3.5 transition hover:border-sky-500/40 hover:bg-sky-500/[0.05]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{g.name}</span>
                        {g.level === 4 && (
                          <span className="rounded bg-sky-500/20 px-1 py-0.5 text-[9px] text-sky-300">
                            ✦ 3D
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/50">
                        {g.morphologyClass ? `${g.morphologyClass} · ` : ""}
                        {g.type}
                        {g.hostGroup ? ` · ${g.hostGroup}` : ""}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-white/40">
                        {g.redshift < 0 ? (
                          <span className="text-sky-300 font-mono">
                            Blueshift (z = {g.redshift.toFixed(5)})
                          </span>
                        ) : (
                          <span className="font-mono">
                            z = {g.redshift.toFixed(g.redshift > 1 ? 3 : 4)}
                          </span>
                        )}
                        {g.constellation && <span>· {g.constellation}</span>}
                        {g.apparentMagnitude && (
                          <span className="font-mono">
                            · {g.apparentMagnitude.band}={g.apparentMagnitude.value.toFixed(1)}m
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sky-300 text-xs">{formatLy(g.distance)}</div>
                      <div className="text-[10px] text-white/40 font-mono mt-0.5">
                        Ø {formatLy(g.size)}
                      </div>
                      <button className="mt-2 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80 transition hover:bg-sky-500 hover:text-white">
                        Fly To
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
