import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import { NAMED_STARS, type NamedStar } from "./data";
import { PLANETS, AU } from "./Planets";
import { OBSERVED_OBJECTS, type ObservedObject } from "./observed-objects";
import { OBSERVATIONAL_GALAXY_CATALOG, type ObservationalGalaxy } from "./galaxy-catalog";
import { REAL_SYSTEMS } from "./real-exoplanets";
import { gaiaTileManager } from "@/lib/astronomy/gaia/gaia-tile-manager";
import { toXYZ } from "./Universe";
import {
  Search,
  SlidersHorizontal,
  X,
  Compass,
  Sparkles,
  Telescope,
  Globe,
  Radio,
  Filter,
} from "lucide-react";

export interface UniversalSearchResult {
  id: string;
  name: string;
  type:
    | "planet"
    | "moon"
    | "star"
    | "exoplanet"
    | "galaxy"
    | "nebula"
    | "black_hole"
    | "quasar"
    | "pulsar"
    | "cluster";
  category: string;
  catalogId: string;
  distanceLy: number;
  distanceFormatted: string;
  redshift?: number;
  spectralType?: string;
  morphology?: string;
  confidence: number;
  matchReason: string;
  coordinates?: string;
  raw: any;
  action: () => void;
}

export function UniversalSearchModal() {
  const open = useStore((s) => s.universalSearchOpen);
  const setOpen = useStore((s) => s.setUniversalSearchOpen);
  const flyToStar = useStore((s) => s.flyToStar);
  const setVisitPlanet = useStore((s) => s.setVisitPlanet);
  const setVisitGalaxy = useStore((s) => s.setVisitGalaxy);
  const setSelectedObject = useStore((s) => s.setSelectedObject);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistanceTier, setSelectedDistanceTier] = useState<string>("all");
  const [selectedMorphology, setSelectedMorphology] = useState<string>("all");
  const [selectedStarType, setSelectedStarType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Comprehensive index builder & scorer
  const results = useMemo<UniversalSearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    const hasQuery = q.length > 0;

    const list: UniversalSearchResult[] = [];

    // Helper to format distance nicely
    const formatDist = (ly: number) => {
      if (ly < 0.0001) return `${(ly * 63241).toFixed(2)} AU`;
      if (ly >= 1e9) return `${(ly / 1e9).toFixed(2)} Gly`;
      if (ly >= 1e6) return `${(ly / 1e6).toFixed(2)} Mly`;
      if (ly >= 1e3) return `${(ly / 1e3).toFixed(1)}k ly`;
      return `${ly.toFixed(1)} ly`;
    };

    // 1. Planets and Moons
    for (const p of PLANETS) {
      const pDistLy = (p.a / AU) * 1.58125e-5;
      let score = 0;
      let reason = "";

      if (hasQuery) {
        if (p.name.toLowerCase() === q) {
          score = 100;
          reason = "Exact Name Match";
        } else if (p.name.toLowerCase().startsWith(q)) {
          score = 92;
          reason = "Name Prefix Match";
        } else if (p.name.toLowerCase().includes(q)) {
          score = 80;
          reason = "Name Match";
        } else if (q.includes("planet") || q.includes("solar system") || q.includes("sun")) {
          score = 70;
          reason = "Category Keyword Match";
        }
      } else {
        score = 85;
        reason = "Solar System World";
      }

      if (score > 0) {
        list.push({
          id: `planet_${p.name}`,
          name: p.name,
          type: "planet",
          category: "Solar System Planet",
          catalogId: `IAU Sol-${p.name.toUpperCase()}`,
          distanceLy: pDistLy,
          distanceFormatted: `${(p.a / AU).toFixed(2)} AU`,
          confidence: score,
          matchReason: reason,
          raw: p,
          action: () => {
            setVisitPlanet(p.name);
            setOpen(false);
          },
        });
      }

      // Moons
      if (p.moons) {
        for (const m of p.moons) {
          let mScore = 0;
          let mReason = "";
          if (hasQuery) {
            if (m.name.toLowerCase() === q) {
              mScore = 100;
              mReason = "Exact Moon Name Match";
            } else if (m.name.toLowerCase().startsWith(q)) {
              mScore = 92;
              mReason = "Moon Prefix Match";
            } else if (m.name.toLowerCase().includes(q)) {
              mScore = 80;
              mReason = "Moon Name Match";
            } else if (
              q.includes("moon") ||
              q.includes("satellite") ||
              q.includes(p.name.toLowerCase())
            ) {
              mScore = 72;
              mReason = "Parent Planet / Moon Query";
            }
          } else {
            mScore = 75;
            mReason = `Natural Satellite of ${p.name}`;
          }

          if (mScore > 0) {
            list.push({
              id: `moon_${m.name}`,
              name: m.name,
              type: "moon",
              category: "Natural Satellite",
              catalogId: `IAU ${p.name.toUpperCase()}-${m.name.toUpperCase()}`,
              distanceLy: pDistLy,
              distanceFormatted: `Orbiting ${p.name}`,
              confidence: mScore,
              matchReason: mReason,
              raw: m,
              action: () => {
                setVisitPlanet(`${p.name}:${m.name}`);
                setOpen(false);
              },
            });
          }
        }
      }
    }

    // 2. Named Stars (Catalogued)
    for (const s of NAMED_STARS) {
      let score = 0;
      let reason = "";
      const sName = s.name.toLowerCase();
      const sSpec = s.spectral.toLowerCase();

      if (hasQuery) {
        if (sName === q) {
          score = 100;
          reason = "Exact Star Name Match";
        } else if (sName.startsWith(q)) {
          score = 92;
          reason = "Star Name Prefix";
        } else if (sName.includes(q)) {
          score = 82;
          reason = "Star Name Match";
        } else if (sSpec.startsWith(q) || sSpec.includes(q)) {
          score = 75;
          reason = `Spectral Type (${s.spectral})`;
        } else if (s.description.toLowerCase().includes(q)) {
          score = 65;
          reason = "Astrophysical Description Match";
        }
      } else {
        score = 80;
        reason = "Catalog Star";
      }

      if (score > 0) {
        list.push({
          id: `star_${s.name}`,
          name: s.name,
          type: "star",
          category: `Star (${s.spectral})`,
          catalogId: (s as any).gaiaSourceId
            ? `Gaia DR3 ${(s as any).gaiaSourceId}`
            : `HIP / HD ${s.name}`,
          distanceLy: s.distance,
          distanceFormatted: formatDist(s.distance),
          spectralType: s.spectral,
          coordinates: `RA ${s.ra} · Dec ${s.dec}`,
          confidence: score,
          matchReason: reason,
          raw: s,
          action: () => {
            flyToStar(s);
            setOpen(false);
          },
        });
      }
    }

    // 3. Gaia DR3 Query
    if (hasQuery && q.length >= 2) {
      try {
        const gaiaHits = gaiaTileManager.searchStars(q, 6);
        for (const gs of gaiaHits) {
          if (!list.some((existing) => existing.name === gs.name)) {
            list.push({
              id: `gaia_${gs.name}`,
              name: gs.name,
              type: "star",
              category: "Gaia DR3 Astrometric Star",
              catalogId: `Gaia DR3 ${gs.name}`,
              distanceLy: gs.distance,
              distanceFormatted: formatDist(gs.distance),
              coordinates: `${gs.constellation} · l=${gs.galacticL.toFixed(1)}°`,
              confidence: 94,
              matchReason: "Gaia Astrometry DR3 Exact Match",
              raw: gs,
              action: () => {
                flyToStar(gs);
                setOpen(false);
              },
            });
          }
        }
      } catch {
        /* ignore */
      }
    }

    // 4. Real Exoplanets
    for (const [hostStar, exoplanets] of Object.entries(REAL_SYSTEMS)) {
      for (const exo of exoplanets) {
        let score = 0;
        let reason = "";
        const exoName = exo.name.toLowerCase();

        if (hasQuery) {
          if (exoName === q) {
            score = 100;
            reason = "Exact Exoplanet Name Match";
          } else if (exoName.startsWith(q)) {
            score = 94;
            reason = "Exoplanet Designation Match";
          } else if (exoName.includes(q)) {
            score = 85;
            reason = "Exoplanet Match";
          } else if (hostStar.toLowerCase().includes(q)) {
            score = 80;
            reason = `Host Star: ${hostStar}`;
          } else if (q.includes("exoplanet") || q.includes("habitable") || q.includes("transit")) {
            score = 72;
            reason = "Exoplanet Characteristic Query";
          }
        } else {
          score = 78;
          reason = `Confirmed Exoplanet at ${hostStar}`;
        }

        if (score > 0) {
          const parentStar = NAMED_STARS.find((st) => st.name === hostStar);
          const distLy = parentStar?.distance ?? 40;
          list.push({
            id: `exo_${exo.name}`,
            name: exo.name,
            type: "exoplanet",
            category: "Confirmed Exoplanet",
            catalogId: `NASA Exoplanet Archive ${exo.name}`,
            distanceLy: distLy,
            distanceFormatted: `${formatDist(distLy)} (a=${exo.aAU.toFixed(3)} AU)`,
            confidence: score,
            matchReason: reason,
            raw: exo,
            action: () => {
              if (parentStar) flyToStar(parentStar);
              setOpen(false);
            },
          });
        }
      }
    }

    // 5. Observed Objects (Nebulae, Black Holes, Quasars, Supernovae)
    for (const obj of OBSERVED_OBJECTS) {
      let score = 0;
      let reason = "";
      const oName = obj.name.toLowerCase();
      const oAliases = obj.aliases.map((a) => a.toLowerCase());

      if (hasQuery) {
        if (oName === q) {
          score = 100;
          reason = "Exact Object Name Match";
        } else if (oAliases.includes(q)) {
          score = 98;
          reason = `Exact Catalog Alias (${obj.aliases.find((a) => a.toLowerCase() === q)})`;
        } else if (oName.startsWith(q) || oAliases.some((a) => a.startsWith(q))) {
          score = 90;
          reason = "Designation Prefix Match";
        } else if (oName.includes(q) || oAliases.some((a) => a.includes(q))) {
          score = 82;
          reason = "Object Identifier Match";
        } else if (
          obj.category.toLowerCase().includes(q) ||
          obj.subtype.toLowerCase().includes(q)
        ) {
          score = 75;
          reason = `Category Match: ${obj.category}`;
        } else if (obj.description.toLowerCase().includes(q)) {
          score = 65;
          reason = "Scientific Summary Match";
        }
      } else {
        score = 82;
        reason = "Deep-Space Landmark";
      }

      if (score > 0) {
        const type: any =
          obj.category === "Black Hole"
            ? "black_hole"
            : obj.category === "Nebula"
              ? "nebula"
              : obj.category === "Quasar"
                ? "quasar"
                : obj.category === "Supernova Remnant"
                  ? "pulsar"
                  : "nebula";

        list.push({
          id: `observed_${obj.id}`,
          name: obj.name,
          type,
          category: `${obj.category} · ${obj.subtype}`,
          catalogId: obj.aliases[0] || obj.id.toUpperCase(),
          distanceLy: obj.distance,
          distanceFormatted: formatDist(obj.distance),
          confidence: score,
          matchReason: reason,
          raw: obj,
          action: () => {
            setSelectedObject(obj.id);
            setOpen(false);
          },
        });
      }
    }

    // 6. Extragalactic Observational Catalog (Galaxies)
    for (const g of OBSERVATIONAL_GALAXY_CATALOG) {
      let score = 0;
      let reason = "";
      const gName = g.name.toLowerCase();
      const gPref = (g.preferredName || "").toLowerCase();
      const gAliases = (g.aliases || []).map((a) => a.toLowerCase());

      if (hasQuery) {
        if (gName === q || gPref === q) {
          score = 100;
          reason = "Exact Galaxy Name Match";
        } else if (gAliases.includes(q)) {
          score = 96;
          reason = `Catalog Cross-ID Match (${g.aliases?.find((a) => a.toLowerCase() === q)})`;
        } else if (gName.startsWith(q) || gAliases.some((a) => a.startsWith(q))) {
          score = 90;
          reason = "Galaxy Designation Prefix";
        } else if (gName.includes(q) || gAliases.some((a) => a.includes(q))) {
          score = 82;
          reason = "Galaxy Identifier Match";
        } else if (
          g.morphologyClass.toLowerCase().includes(q) ||
          g.type.toLowerCase().includes(q)
        ) {
          score = 75;
          reason = `Morphology: ${g.morphologyClass}`;
        } else if (g.hostGroup && g.hostGroup.toLowerCase().includes(q)) {
          score = 72;
          reason = `Cluster / Group: ${g.hostGroup}`;
        }
      } else {
        score = 80;
        reason = "Catalog Galaxy";
      }

      if (score > 0) {
        list.push({
          id: `galaxy_${g.name}`,
          name: g.name,
          type: "galaxy",
          category: `Galaxy · ${g.morphologyClass || g.type}`,
          catalogId: `NED / NGC ${g.preferredName || g.name}`,
          distanceLy: g.distance,
          distanceFormatted: formatDist(g.distance),
          redshift: g.redshift,
          morphology: g.morphologyClass,
          confidence: score,
          matchReason: reason,
          raw: g,
          action: () => {
            const pos = toXYZ(g.l, g.b, g.distance);
            setVisitGalaxy({
              name: g.name,
              x: pos.x,
              y: pos.y,
              z: pos.z,
              size: g.size,
              distance: g.distance,
              type: g.type,
              view: "overview",
            });
            setOpen(false);
          },
        });
      }
    }

    // Apply Filter Criteria
    let filtered = list;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((r) => r.type === selectedCategory);
    }

    if (selectedDistanceTier !== "all") {
      if (selectedDistanceTier === "solar_system") {
        filtered = filtered.filter((r) => r.distanceLy < 0.01);
      } else if (selectedDistanceTier === "nearby_stars") {
        filtered = filtered.filter((r) => r.distanceLy >= 0.01 && r.distanceLy <= 100);
      } else if (selectedDistanceTier === "milky_way") {
        filtered = filtered.filter((r) => r.distanceLy > 100 && r.distanceLy <= 150000);
      } else if (selectedDistanceTier === "local_group") {
        filtered = filtered.filter((r) => r.distanceLy > 150000 && r.distanceLy <= 10000000);
      } else if (selectedDistanceTier === "cosmological") {
        filtered = filtered.filter((r) => r.distanceLy > 10000000);
      }
    }

    if (selectedMorphology !== "all") {
      filtered = filtered.filter(
        (r) =>
          r.morphology && r.morphology.toLowerCase().includes(selectedMorphology.toLowerCase()),
      );
    }

    if (selectedStarType !== "all") {
      filtered = filtered.filter(
        (r) => r.spectralType && r.spectralType.startsWith(selectedStarType),
      );
    }

    // Sort by confidence descending, then by distance
    filtered.sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return a.distanceLy - b.distanceLy;
    });

    return filtered.slice(0, 40);
  }, [
    query,
    selectedCategory,
    selectedDistanceTier,
    selectedMorphology,
    selectedStarType,
    setVisitPlanet,
    flyToStar,
    setSelectedObject,
    setVisitGalaxy,
    setOpen,
  ]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 backdrop-blur-md"
        style={{ background: "rgba(3, 5, 14, 0.82)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-white/15 bg-[#090b1c] shadow-2xl overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-medium text-white tracking-wide">
                  Universal Astronomical Catalog Search
                </h2>
                <p className="text-xs text-white/50">
                  Indexed cross-catalog queries across Stars, Exoplanets, Solar Worlds, Nebulae
                  &amp; Galaxies
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="border-b border-white/10 bg-white/[0.02] p-4 space-y-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, Messier/NGC ID, Kepler, Hipparcos, coordinates, morphology..."
                className="h-11 w-full rounded-xl border border-white/15 bg-black/50 pl-10 pr-24 text-sm text-white placeholder:text-white/35 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-12 text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  showFilters || selectedCategory !== "all" || selectedDistanceTier !== "all"
                    ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                    : "border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Filter Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs"
                >
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-white/80 focus:border-cyan-400"
                    >
                      <option value="all">All Categories</option>
                      <option value="planet">Planets</option>
                      <option value="moon">Moons</option>
                      <option value="star">Stars</option>
                      <option value="exoplanet">Exoplanets</option>
                      <option value="galaxy">Galaxies</option>
                      <option value="nebula">Nebulae</option>
                      <option value="black_hole">Black Holes</option>
                      <option value="quasar">Quasars</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                      Distance Regime
                    </label>
                    <select
                      value={selectedDistanceTier}
                      onChange={(e) => setSelectedDistanceTier(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-white/80 focus:border-cyan-400"
                    >
                      <option value="all">Any Distance</option>
                      <option value="solar_system">&lt; 0.01 ly (Solar System)</option>
                      <option value="nearby_stars">0.01 – 100 ly (Neighborhood)</option>
                      <option value="milky_way">100 – 150k ly (Milky Way)</option>
                      <option value="local_group">150k – 10 Mly (Local Group)</option>
                      <option value="cosmological">&gt; 10 Mly (Deep Cosmological)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                      Galaxy Morphology
                    </label>
                    <select
                      value={selectedMorphology}
                      onChange={(e) => setSelectedMorphology(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-white/80 focus:border-cyan-400"
                    >
                      <option value="all">Any Morphology</option>
                      <option value="spiral">Spiral (S)</option>
                      <option value="barred">Barred Spiral (SB)</option>
                      <option value="elliptical">Elliptical (E)</option>
                      <option value="irregular">Irregular (Irr)</option>
                      <option value="dwarf">Dwarf</option>
                      <option value="interacting">Interacting / Merging</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                      Stellar Spectral Type
                    </label>
                    <select
                      value={selectedStarType}
                      onChange={(e) => setSelectedStarType(e.target.value)}
                      className="w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-white/80 focus:border-cyan-400"
                    >
                      <option value="all">Any Spectral Type</option>
                      <option value="O">O-type (Blue Hypergiant)</option>
                      <option value="B">B-type (Blue Giant)</option>
                      <option value="A">A-type (White, Sirius-like)</option>
                      <option value="F">F-type (Yellow-White)</option>
                      <option value="G">G-type (Yellow, Solar-type)</option>
                      <option value="K">K-type (Orange Dwarf)</option>
                      <option value="M">M-type (Red Dwarf / Giant)</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {results.length > 0 ? (
              results.map((r) => (
                <button
                  key={r.id}
                  onClick={r.action}
                  className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/40 text-cyan-300">
                      {r.type === "planet" || r.type === "moon" ? (
                        <Globe className="h-4 w-4" />
                      ) : r.type === "galaxy" ? (
                        <Compass className="h-4 w-4" />
                      ) : r.type === "star" || r.type === "exoplanet" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Radio className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white group-hover:text-cyan-200">
                          {r.name}
                        </span>
                        <span className="font-mono text-[10px] text-white/40">{r.catalogId}</span>
                      </div>
                      <div className="text-xs text-white/50 flex flex-wrap items-center gap-x-2">
                        <span>{r.category}</span>
                        {r.coordinates && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[11px] text-cyan-300/70">
                              {r.coordinates}
                            </span>
                          </>
                        )}
                        {r.redshift !== undefined && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[11px] text-amber-300/80">
                              z={r.redshift.toFixed(4)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-mono text-xs font-semibold text-white/90">
                      {r.distanceFormatted}
                    </span>
                    <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-500/20">
                      {r.confidence}% · {r.matchReason}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-white/40 space-y-2">
                <Search className="h-8 w-8 text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/70">
                  No cataloged celestial object found for &quot;{query}&quot;
                </p>
                <p className="text-xs max-w-md text-white/40">
                  In accordance with observational astrophysics standards, no speculative objects
                  are invented. Try searching by catalog identifiers such as &quot;M31&quot;,
                  &quot;HD 209458&quot;, &quot;TRAPPIST-1&quot;, &quot;NGC 1952&quot;, or by
                  celestial category.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {[
                    "Earth",
                    "Jupiter",
                    "Betelgeuse",
                    "Andromeda",
                    "Crab Nebula",
                    "Sagittarius A*",
                    "Virgo Cluster",
                  ].map((suggest) => (
                    <button
                      key={suggest}
                      onClick={() => setQuery(suggest)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      {suggest}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
