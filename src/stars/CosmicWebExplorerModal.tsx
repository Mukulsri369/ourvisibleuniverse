// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore, GUIDED_JOURNEY_STEPS } from "./store";
import {
  COSMIC_BENCHMARKS,
  SURVEY_FOOTPRINTS,
  type SurveyId,
} from "@/lib/astronomy/cosmic-web/survey-catalogs";
import {
  TNG300_METADATA,
  TNG_BENCHMARK_HALOS,
  TNG_BENCHMARK_VOIDS,
  TNG_FILAMENTS,
} from "@/lib/astronomy/cosmic-web/illustris-tng";
import {
  COSMOLOGICAL_MODELS,
  calculateCosmologicalDistances,
  dimensionlessHubble,
  type CosmologicalParameters,
} from "@/lib/astronomy/cosmology";
import {
  X,
  Compass,
  Layers,
  Sparkles,
  Database,
  Cpu,
  BarChart3,
  BookOpen,
  Info,
  CheckCircle2,
  Sliders,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Filter,
  Maximize2,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CosmicWebExplorerModal({ journeyRequest = 0 }: { journeyRequest?: number } = {}) {
  const open = useStore((s) => s.cosmicWebExplorerOpen);
  const setOpen = useStore((s) => s.setCosmicWebExplorerOpen);

  // Store state & controls
  const cosmicWebMode = useStore((s) => s.cosmicWebMode);
  const setCosmicWebMode = useStore((s) => s.setCosmicWebMode);
  const selectedSurveys = useStore((s) => s.selectedSurveys);
  const toggleSurvey = useStore((s) => s.toggleSurvey);
  const redshiftFilter = useStore((s) => s.redshiftFilter);
  const setRedshiftFilter = useStore((s) => s.setRedshiftFilter);
  const showSurveyFootprints = useStore((s) => s.showSurveyFootprints);
  const toggleSurveyFootprints = useStore((s) => s.toggleSurveyFootprints);
  const showZoneOfAvoidance = useStore((s) => s.showZoneOfAvoidance);
  const toggleZoneOfAvoidance = useStore((s) => s.toggleZoneOfAvoidance);
  const selectedCosmicBenchmarkId = useStore((s) => s.selectedCosmicBenchmarkId);
  const setSelectedCosmicBenchmarkId = useStore((s) => s.setSelectedCosmicBenchmarkId);
  const showCosmicBenchmarks = useStore((s) => s.showCosmicBenchmarks);
  const toggleCosmicBenchmarks = useStore((s) => s.toggleCosmicBenchmarks);

  // Simulation controls
  const simulationComponent = useStore((s) => s.simulationComponent);
  const setSimulationComponent = useStore((s) => s.setSimulationComponent);
  const showSimulationFilaments = useStore((s) => s.showSimulationFilaments);
  const toggleSimulationFilaments = useStore((s) => s.toggleSimulationFilaments);
  const showSimulationVoids = useStore((s) => s.showSimulationVoids);
  const toggleSimulationVoids = useStore((s) => s.toggleSimulationVoids);
  const showSimulationBoundingBox = useStore((s) => s.showSimulationBoundingBox);
  const toggleSimulationBoundingBox = useStore((s) => s.toggleSimulationBoundingBox);
  const selectedSimHaloId = useStore((s) => s.selectedSimHaloId);
  const setSelectedSimHaloId = useStore((s) => s.setSelectedSimHaloId);

  // Cosmology model
  const cosmologyModelKey = useStore((s) => s.cosmologyModelKey);
  const setCosmologyModelKey = useStore((s) => s.setCosmologyModelKey);
  const customCosmology = useStore((s) => s.customCosmology);
  const setCustomCosmology = useStore((s) => s.setCustomCosmology);

  // Benchmarks & Guided Journey
  const catalogDensityLevel = useStore((s) => s.catalogDensityLevel);
  const setCatalogDensityLevel = useStore((s) => s.setCatalogDensityLevel);
  const startGuidedJourney = useStore((s) => s.startGuidedJourney);
  const performanceStats = useStore((s) => s.performanceStats);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "modes" | "journey" | "cosmology" | "statistics" | "benchmarks" | "citations"
  >("modes");

  useEffect(() => {
    if (journeyRequest > 0) setActiveTab("journey");
  }, [journeyRequest]);

  // Local interactive redshift calculator
  const [calcZ, setCalcZ] = useState<number>(0.15);

  if (!open) return null;

  const currentCosmo: CosmologicalParameters =
    cosmologyModelKey === "custom"
      ? {
          name: "Custom User Cosmology",
          description: "User customized FLRW parameters",
          h0: customCosmology.h0,
          omegaM: customCosmology.omegaM,
          omegaLambda: customCosmology.omegaLambda,
          citation: "User configured",
          bibcode: "CUSTOM",
        }
      : (COSMOLOGICAL_MODELS[cosmologyModelKey] ?? COSMOLOGICAL_MODELS.planck2018);

  const cosmoMetrics = calculateCosmologicalDistances(Math.max(0.0001, calcZ), currentCosmo);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        style={{ background: "rgba(2, 6, 18, 0.85)" }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[88vh] w-full max-w-5xl flex-col rounded-2xl border border-white/15 bg-[#070b19] shadow-2xl overflow-hidden text-white font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Layers className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Large-Scale Structure & Cosmic Web Explorer
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                      cosmicWebMode === "observational"
                        ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                        : cosmicWebMode === "simulation"
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    {cosmicWebMode === "observational"
                      ? "MODE A: OBSERVED DISTRIBUTION"
                      : cosmicWebMode === "simulation"
                        ? "MODE B: SIMULATED COSMIC WEB"
                        : "OFF"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Hybrid Observational Survey Reconstruction & Cosmological Hydrodynamic Simulation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label="Close cosmic web explorer"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-white/10 bg-slate-900/40 px-6 py-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("modes")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "modes"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders className="size-3.5" />
              Data Modes & Layers
            </button>

            <button
              onClick={() => setActiveTab("journey")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "journey"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Compass className="size-3.5" />
              Guided Cosmic Journey (6 Stages)
            </button>

            <button
              onClick={() => setActiveTab("cosmology")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "cosmology"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="size-3.5" />
              Cosmology & Lookback Explorer
            </button>

            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "statistics"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 className="size-3.5" />
              Clustering & Voids
            </button>

            <button
              onClick={() => setActiveTab("benchmarks")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "benchmarks"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="size-3.5" />
              Density Benchmarks
            </button>

            <button
              onClick={() => setActiveTab("citations")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === "citations"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BookOpen className="size-3.5" />
              Citations & Data Manifests
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-6 text-sm">
            {/* ---------------- TAB 1: DATA MODES & LAYERS ---------------- */}
            {activeTab === "modes" && (
              <div className="space-y-6">
                {/* Mode Selector Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setCosmicWebMode("observational")}
                    className={`cursor-pointer rounded-xl border p-5 transition-all ${
                      cosmicWebMode === "observational"
                        ? "border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                        : "border-white/10 bg-slate-900/40 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                          A
                        </span>
                        <h4 className="font-bold text-white text-base">
                          MODE A: OBSERVED DISTRIBUTION
                        </h4>
                      </div>
                      {cosmicWebMode === "observational" && (
                        <CheckCircle2 className="size-5 text-cyan-400" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      Actual galaxy survey coordinates and redshifts from SDSS DR18, 2dFGRS, 2MASS
                      2MRS, and Cosmicflows. Reconstructs 3D comoving positions using active FLRW
                      cosmology.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-300 border border-cyan-500/30">
                        SDSS Fan Wedges
                      </span>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-300 border border-amber-500/30">
                        2dFGRS Strips
                      </span>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-300 border border-emerald-500/30">
                        2MRS All-Sky
                      </span>
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 text-purple-300 border border-purple-500/30">
                        Cosmicflows-3/4
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-cyan-300/80">
                      <ShieldCheck className="size-3.5 text-cyan-400" />
                      Preserves survey footprints; zero invented galaxies.
                    </div>
                  </div>

                  <div
                    onClick={() => setCosmicWebMode("simulation")}
                    className={`cursor-pointer rounded-xl border p-5 transition-all ${
                      cosmicWebMode === "simulation"
                        ? "border-purple-400/80 bg-purple-950/30 shadow-[0_0_20px_rgba(192,132,252,0.2)]"
                        : "border-white/10 bg-slate-900/40 hover:border-white/25"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                          B
                        </span>
                        <h4 className="font-bold text-white text-base">
                          MODE B: SIMULATED COSMIC WEB
                        </h4>
                      </div>
                      {cosmicWebMode === "simulation" && (
                        <CheckCircle2 className="size-5 text-purple-400" />
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      Preprocessed cosmological simulation outputs from IllustrisTNG (TNG300-1,
                      Snapshot 99, z=0). Displays dark matter filaments, virialized cluster halos,
                      baryonic gas, and cosmic voids.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 text-purple-300 border border-purple-500/30">
                        TNG300-1 (302.6 Mpc Box)
                      </span>
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 text-blue-300 border border-blue-500/30">
                        DM Halos & Gas
                      </span>
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-300 border border-amber-500/30">
                        Filament Bridges
                      </span>
                      <span className="rounded bg-slate-500/10 px-2 py-0.5 text-slate-300 border border-slate-500/30">
                        Cosmic Voids
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-300/80">
                      <ShieldAlert className="size-3.5 text-amber-400" />
                      Statistical realization; does NOT map to actual observed sky coordinates.
                    </div>
                  </div>
                </div>

                {/* Sub-controls based on active mode */}
                {cosmicWebMode === "observational" ? (
                  <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Filter className="size-4 text-cyan-400" />
                      Observational Survey Footprints & Selection Filters
                    </h3>

                    {/* Survey Checkboxes */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      {(Object.keys(SURVEY_FOOTPRINTS) as (keyof typeof SURVEY_FOOTPRINTS)[]).map(
                        (sId) => {
                          const fp = SURVEY_FOOTPRINTS[sId];
                          const isChecked = selectedSurveys[sId] ?? true;
                          return (
                            <div
                              key={sId}
                              onClick={() => toggleSurvey(sId)}
                              className={`cursor-pointer rounded-lg border p-2.5 transition flex flex-col justify-between ${
                                isChecked
                                  ? "border-cyan-500/50 bg-cyan-950/20 text-white"
                                  : "border-white/5 bg-slate-950/40 text-slate-500"
                              }`}
                            >
                              <div className="font-semibold">{fp.name.split(" ")[0]}</div>
                              <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                {fp.geometryType.replace(/_/g, " ")}
                              </div>
                              <div className="text-[10px] text-cyan-400 mt-1 font-mono">
                                z: {fp.redshiftRange[0]} - {fp.redshiftRange[1]}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Redshift Slider Filter */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">
                          Redshift Filter: z = {redshiftFilter[0].toFixed(3)} to{" "}
                          {redshiftFilter[1].toFixed(2)}
                        </span>
                        <span className="text-cyan-400 font-mono text-[11px]">
                          Lookback: ~
                          {calculateCosmologicalDistances(
                            redshiftFilter[1],
                            currentCosmo,
                          ).lookbackTimeGyr.toFixed(2)}{" "}
                          Gyr
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="1.0"
                        step="0.01"
                        value={redshiftFilter[1]}
                        onChange={(e) =>
                          setRedshiftFilter([redshiftFilter[0], parseFloat(e.target.value)])
                        }
                        className="w-full accent-cyan-400"
                      />
                    </div>

                    {/* Boundary & Zone of Avoidance Toggles */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showSurveyFootprints}
                          onChange={toggleSurveyFootprints}
                          className="accent-cyan-400"
                        />
                        <span>Show Survey Boundary Cones & Strips</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showZoneOfAvoidance}
                          onChange={toggleZoneOfAvoidance}
                          className="accent-cyan-400"
                        />
                        <span>Show Galactic Zone of Avoidance (|b| &lt; 8°)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showCosmicBenchmarks}
                          onChange={toggleCosmicBenchmarks}
                          className="accent-cyan-400"
                        />
                        <span>Show Superclusters & Void Landmarks</span>
                      </label>
                    </div>

                    {/* Landmark quick jump pills */}
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Landmark clouds illustrate spatial density around catalogue coordinates. Their
                      individual tracers are not measured galaxy-member positions. Survey footprints
                      and simulation structures remain separate views.
                    </p>
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[11px] text-slate-400 mb-2 font-medium">
                        Quick-Focus Large-Scale Cosmological Structures:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {COSMIC_BENCHMARKS.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setSelectedCosmicBenchmarkId(b.id)}
                            className={`rounded-md px-2.5 py-1 text-xs border transition ${
                              selectedCosmicBenchmarkId === b.id
                                ? "bg-cyan-500/30 border-cyan-400 text-cyan-200"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {b.name} ({b.distanceGlyPlanck.toFixed(2)} Gly)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Cpu className="size-4 text-purple-400" />
                      IllustrisTNG Hydrodynamic Simulation Controls (TNG300-1)
                    </h3>

                    {/* Component Filter Buttons */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      {[
                        { id: "all", label: "All Components", desc: "DM + Gas + Filaments" },
                        {
                          id: "dark_matter",
                          label: "Dark Matter Halos",
                          desc: "Subfind halo nodes",
                        },
                        { id: "gas", label: "Baryonic Gas", desc: "Intergalactic medium" },
                        {
                          id: "filaments",
                          label: "Filament Bridges",
                          desc: "Cosmic web skeleton",
                        },
                        {
                          id: "clusters",
                          label: "Rich Clusters",
                          desc: "M > 10¹⁴ M☉ cores",
                        },
                      ].map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => setSimulationComponent(comp.id as any)}
                          className={`rounded-lg border p-2.5 text-left transition ${
                            simulationComponent === comp.id
                              ? "border-purple-500/60 bg-purple-950/30 text-white"
                              : "border-white/5 bg-slate-950/40 text-slate-400 hover:text-white"
                          }`}
                        >
                          <div className="font-semibold text-xs">{comp.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{comp.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Simulation Toggles */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showSimulationBoundingBox}
                          onChange={toggleSimulationBoundingBox}
                          className="accent-purple-400"
                        />
                        <span>Show Simulation Bounding Box (302.6 Mpc / 987 Mly)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showSimulationFilaments}
                          onChange={toggleSimulationFilaments}
                          className="accent-purple-400"
                        />
                        <span>Show Filament Skeleton Overlays</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={showSimulationVoids}
                          onChange={toggleSimulationVoids}
                          className="accent-purple-400"
                        />
                        <span>Show Cosmic Void Underdensities (δ &lt; -0.85)</span>
                      </label>
                    </div>

                    {/* Preprocessed Halos List */}
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[11px] text-slate-400 mb-2 font-medium">
                        Preprocessed Massive Clusters in TNG300 Box:
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {TNG_BENCHMARK_HALOS.map((h) => (
                          <div
                            key={h.id}
                            onClick={() => setSelectedSimHaloId(h.id)}
                            className={`cursor-pointer rounded-lg border p-2 text-left transition ${
                              selectedSimHaloId === h.id
                                ? "border-purple-400 bg-purple-950/40 text-white"
                                : "border-white/5 bg-slate-950/30 text-slate-300 hover:bg-white/5"
                            }`}
                          >
                            <div className="font-semibold text-xs">
                              {h.environmentType === "cluster" ? "Cluster" : "Group"} #{h.id}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              M: {(h.massTotalMsun / 1e14).toFixed(2)}×10¹⁴ M☉
                            </div>
                            <div className="text-[10px] text-purple-400 font-mono">
                              R_vir: {h.radiusVirialKpc} kpc
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- TAB 2: GUIDED COSMIC JOURNEY ---------------- */}
            {activeTab === "journey" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Compass className="size-5 text-cyan-400" />
                      Scale Ladder: From Earth to the Observable Horizon
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Experience the hierarchical architecture of the universe through 6
                      astrophysical scale tiers. From our home spiral galaxy to the colossal cosmic
                      web and the 46.5-billion-light-year boundary of the observable universe.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      startGuidedJourney();
                      setOpen(false);
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-lg shadow-cyan-500/20 px-5"
                  >
                    <Play className="size-3.5 mr-1.5 fill-current" />
                    Launch 3D Journey
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GUIDED_JOURNEY_STEPS.map((step, idx) => (
                    <div
                      key={step.id}
                      className="rounded-xl border border-white/10 bg-slate-900/40 p-4 space-y-2 hover:border-cyan-500/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{step.title}</span>
                        <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-500/20">
                          {step.scaleDescription}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Lookback: {step.lookbackTimeText}</span>
                        <span>•</span>
                        <span>{step.redshiftText}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {step.scientificDescription}
                      </p>
                      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1 text-[10px]">
                        {step.keyPhenomena.map((k, i) => (
                          <span
                            key={i}
                            className="rounded bg-white/5 px-2 py-0.5 text-slate-400 border border-white/5"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: COSMOLOGY & LOOKBACK EXPLORER ---------------- */}
            {activeTab === "cosmology" && (
              <div className="space-y-6">
                {/* Expanding Space vs Euclidean Space Explainer */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-5 text-xs text-slate-200 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                    <Info className="size-4" />
                    Why Static Euclidean Distance Fails Across Cosmological Scales
                  </div>
                  <p>
                    In an expanding universe governed by General Relativity and the
                    Friedmann-Lemaître-Robertson-Walker (FLRW) metric, distance is not a single
                    Euclidean quantity. As light travels from a distant galaxy, the space through
                    which it propagates continuously stretches:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded bg-black/40 p-2 border border-white/10">
                      <div className="text-cyan-400 font-bold">Comoving Distance (D_C)</div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        Distance scaled to present-day coordinates (z=0 grid).
                      </div>
                    </div>
                    <div className="rounded bg-black/40 p-2 border border-white/10">
                      <div className="text-amber-400 font-bold">Luminosity Distance (D_L)</div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        D_L = (1 + z) · D_C. Dimming from flux dilution & redshift.
                      </div>
                    </div>
                    <div className="rounded bg-black/40 p-2 border border-white/10">
                      <div className="text-emerald-400 font-bold">Angular Diameter (D_A)</div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        D_A = D_C / (1 + z). Apparent angular size at emission.
                      </div>
                    </div>
                    <div className="rounded bg-black/40 p-2 border border-white/10">
                      <div className="text-purple-400 font-bold">Lookback Time (t_L)</div>
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        Light travel time: t_L = ∫ dz' / [(1+z') H(z')].
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cosmological Model Selector */}
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
                  <h4 className="font-bold text-white text-sm">Cosmology Model Parameters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {(Object.keys(COSMOLOGICAL_MODELS) as (keyof typeof COSMOLOGICAL_MODELS)[]).map(
                      (mKey) => {
                        const m = COSMOLOGICAL_MODELS[mKey];
                        const isSel = cosmologyModelKey === mKey;
                        return (
                          <div
                            key={mKey}
                            onClick={() => setCosmologyModelKey(mKey)}
                            className={`cursor-pointer rounded-lg border p-3 transition ${
                              isSel
                                ? "border-cyan-400 bg-cyan-950/30 text-white shadow-md"
                                : "border-white/10 bg-slate-950/40 text-slate-400 hover:text-white"
                            }`}
                          >
                            <div className="font-bold text-xs">{m.name}</div>
                            <div className="mt-1 font-mono text-[10px] text-cyan-400">
                              H₀ = {m.h0} km/s/Mpc
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">
                              Ω_m = {m.omegaM} • Ω_Λ = {m.omegaLambda}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Interactive Redshift-Distance FLRW Calculator */}
                  <div className="pt-3 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        FLRW Metric Calculator at Redshift z = {calcZ.toFixed(3)}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Hubble Expansion Rate H(z) ={" "}
                        {(
                          cosmoMetrics.hubbleParameterKmSPerMpc ??
                          currentCosmo.h0 * dimensionlessHubble(calcZ, currentCosmo)
                        ).toFixed(1)}{" "}
                        km/s/Mpc
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.001"
                      max="14.5"
                      step="0.01"
                      value={calcZ}
                      onChange={(e) => setCalcZ(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
                      <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                        <div className="text-[10px] text-slate-400">Comoving Distance (D_C)</div>
                        <div className="text-base font-bold text-cyan-400 mt-0.5">
                          {cosmoMetrics.comovingDistanceGly.toFixed(3)} Gly
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {cosmoMetrics.comovingDistanceMpc.toFixed(1)} Mpc
                        </div>
                      </div>

                      <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                        <div className="text-[10px] text-slate-400">Lookback Time (t_L)</div>
                        <div className="text-base font-bold text-amber-400 mt-0.5">
                          {cosmoMetrics.lookbackTimeGyr.toFixed(3)} Gyr
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Universe Age:{" "}
                          {(
                            cosmoMetrics.ageAtRedshiftGyr ??
                            cosmoMetrics.cosmicAgeAtRedshiftGyr ??
                            0
                          ).toFixed(3)}{" "}
                          Gyr
                        </div>
                      </div>

                      <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                        <div className="text-[10px] text-slate-400">Luminosity Distance (D_L)</div>
                        <div className="text-base font-bold text-purple-400 mt-0.5">
                          {cosmoMetrics.luminosityDistanceGly.toFixed(3)} Gly
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Flux dilution: (1+z)² factor
                        </div>
                      </div>

                      <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                        <div className="text-[10px] text-slate-400">Angular Diameter (D_A)</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">
                          {cosmoMetrics.angularDiameterDistanceGly.toFixed(3)} Gly
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Scale: {cosmoMetrics.kpcPerArcsec.toFixed(2)} kpc/arcsec
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: CLUSTERING & VOIDS ---------------- */}
            {activeTab === "statistics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Two-Point Correlation Function */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <BarChart3 className="size-4 text-cyan-400" />
                      Two-Point Galaxy Correlation Function ξ(r)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Galaxy clustering is quantified by the excess probability over random of
                      finding two galaxies separated by distance <em>r</em>:
                    </p>
                    <div className="rounded-lg bg-black/50 p-3 font-mono text-center text-cyan-300 text-xs border border-white/10">
                      ξ(r) = (r₀ / r)^γ
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Correlation Length (r₀):</span>
                        <span className="font-mono text-white">5.4 ± 0.3 h⁻¹ Mpc (~26 Mly)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Power Law Slope (γ):</span>
                        <span className="font-mono text-white">1.77 ± 0.04</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">
                          Baryon Acoustic Oscillation (BAO) Peak:
                        </span>
                        <span className="font-mono text-cyan-400">r ≈ 105 h⁻¹ Mpc (147 Mpc)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Sound Horizon at Drag Epoch (r_d):</span>
                        <span className="font-mono text-white">147.1 ± 0.3 Mpc</span>
                      </div>
                    </div>
                  </div>

                  {/* Cosmic Void Demographics */}
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Database className="size-4 text-purple-400" />
                      Cosmic Void Hierarchy & Matter Distribution
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Cosmic voids are underdense bubbles (density contrast δ &lt; -0.8) created by
                      gravitational evacuation of matter into surrounding walls and filaments:
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded bg-white/5 p-2">
                        <span className="text-slate-300">
                          Cosmic Volume Filling Fraction of Voids:
                        </span>
                        <span className="font-mono font-bold text-purple-400">60% – 75%</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-white/5 p-2">
                        <span className="text-slate-300">Mean Void Radius:</span>
                        <span className="font-mono font-bold text-white">15 – 35 h⁻¹ Mpc</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-white/5 p-2">
                        <span className="text-slate-300">Boötes Void Diameter:</span>
                        <span className="font-mono font-bold text-amber-400">330 Million ly</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-white/5 p-2">
                        <span className="text-slate-300">Baryonic Mass Fraction in Filaments:</span>
                        <span className="font-mono font-bold text-emerald-400">~50% (WHIM)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 5: DENSITY BENCHMARKS ---------------- */}
            {activeTab === "benchmarks" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Cpu className="size-4 text-cyan-400" />
                    Catalog Point Density Benchmarking & GPU Performance
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Test your system performance with increasing catalog point counts. Points use
                    instanced Float32 buffer attributes and GPU frustum culling for scalable 60 FPS
                    spatial rendering.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {[
                      {
                        level: 5000,
                        label: "Lightweight",
                        desc: "5,000 Points",
                        vram: "~15 MB",
                        targetFps: "60 FPS",
                      },
                      {
                        level: 15000,
                        label: "Balanced (Recommended)",
                        desc: "15,000 Points",
                        vram: "~42 MB",
                        targetFps: "60 FPS",
                      },
                      {
                        level: 30000,
                        label: "High Density",
                        desc: "30,000 Points",
                        vram: "~85 MB",
                        targetFps: "60 FPS",
                      },
                      {
                        level: 60000,
                        label: "Extreme Density",
                        desc: "60,000 Points",
                        vram: "~170 MB",
                        targetFps: "50-60 FPS",
                      },
                    ].map((b) => (
                      <div
                        key={b.level}
                        onClick={() => setCatalogDensityLevel(b.level)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          catalogDensityLevel === b.level
                            ? "border-cyan-400 bg-cyan-950/40 shadow-lg text-white"
                            : "border-white/10 bg-slate-950/30 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="font-bold text-sm">{b.label}</div>
                        <div className="text-cyan-400 font-mono text-xs mt-1">{b.desc}</div>
                        <div className="text-[10px] text-slate-500 mt-2">
                          VRAM: {b.vram} • Target: {b.targetFps}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5 font-mono text-xs">
                    <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                      <div className="text-[10px] text-slate-400">Current FPS</div>
                      <div className="text-base font-bold text-emerald-400 mt-0.5">
                        {performanceStats.fps} FPS
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                      <div className="text-[10px] text-slate-400">Active Point Geometries</div>
                      <div className="text-base font-bold text-cyan-400 mt-0.5">
                        {catalogDensityLevel.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                      <div className="text-[10px] text-slate-400">Estimated Draw Calls</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {performanceStats.drawCalls}
                      </div>
                    </div>
                    <div className="rounded-lg bg-black/40 p-3 border border-white/5">
                      <div className="text-[10px] text-slate-400">GPU Memory Allocated</div>
                      <div className="text-base font-bold text-purple-400 mt-0.5">
                        {performanceStats.memoryMb} MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 6: CITATIONS & DATA MANIFESTS ---------------- */}
            {activeTab === "citations" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-5 space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <BookOpen className="size-4 text-cyan-400" />
                    Scientific Authorities, Catalogs & Simulation Data Manifests
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-bold text-cyan-300">
                        IllustrisTNG Cosmological Simulation Project
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Nelson, D., et al. (2019). "The IllustrisTNG simulations: Public data
                        release", Computational Astrophysics and Cosmology 6, 2; Springel, V., et
                        al. (2018). "Matter and galaxy clustering", MNRAS 475, 676.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bibcode: 2019ComAC...6....2N • Simulation URL:
                        https://www.tng-project.org/data/
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-bold text-cyan-300">
                        Sloan Digital Sky Survey (SDSS DR18 / BOSS / eBOSS)
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Ahumada, R., et al. (2020). "The 16th Data Release of the Sloan Digital Sky
                        Survey: First Results from APOGEE-2 and MaNGA", ApJS 249, 3; Alam, S., et
                        al. (2021). PRD 103, 083533.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bibcode: 2020ApJS..249....3A • Sky Coverage: 14,555 deg²
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-bold text-cyan-300">
                        Two-degree-Field Galaxy Redshift Survey (2dFGRS)
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Colless, M., et al. (2001). "The 2dF Galaxy Redshift Survey: Spectra and
                        redshifts", MNRAS 328, 1039; Cole, S., et al. (2005). MNRAS 362, 505.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bibcode: 2001MNRAS.328.1039C • Angular wedges across southern celestial
                        hemisphere
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-bold text-cyan-300">
                        Cosmicflows-3 & 4 (Local Supercluster & Laniakea Watershed)
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Tully, R. B., Courtois, H., Dolphin, A. E., et al. (2014). "The Laniakea
                        supercluster of galaxies", Nature 513, 71; Tully et al. (2023) ApJ 944, 94.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bibcode: 2014Natur.513...71T • Peculiar velocity flow streamlines
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-black/30 p-3 space-y-1">
                      <div className="font-bold text-cyan-300">
                        Planck 2018 Cosmological Parameters
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Planck Collaboration (2020). "Planck 2018 results. VI. Cosmological
                        parameters", Astronomy & Astrophysics 641, A6.
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bibcode: 2020A&A...641A...6P • H₀ = 67.4 km/s/Mpc, Ω_m = 0.315
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
