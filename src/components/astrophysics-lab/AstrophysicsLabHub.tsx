import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Flame,
  Sparkles,
  Orbit,
  Layers,
  Sliders,
  Info,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Eye,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarFormationLab } from "./StarFormationLab";
import { StellarEvolutionLab } from "./StellarEvolutionLab";
import { PlanetFormationLab } from "./PlanetFormationLab";
import { GalaxyAssemblyLab } from "./GalaxyAssemblyLab";

export type AstrophysicsLabModuleId = "star_formation" | "stellar_evolution" | "planet_formation" | "galaxy_assembly";

interface AstrophysicsLabHubProps {
  initialModule?: AstrophysicsLabModuleId;
  targetObjectName?: string;
}

export function AstrophysicsLabHub({
  initialModule = "star_formation",
  targetObjectName,
}: AstrophysicsLabHubProps) {
  const [activeModule, setActiveModule] = useState<AstrophysicsLabModuleId>(initialModule);
  const [showStatusLegend, setShowStatusLegend] = useState<boolean>(false);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-6 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Global Scientific Constitution Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Research Laboratories
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Physics-Informed Numerical Models
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Astrophysics & Formation Laboratories
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Explore simplified, mathematically sound numerical simulations of stellar birth, lifecycles, protoplanetary systems, and cosmological galaxy collisions.
          </p>
        </div>

        {/* Status Legend Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStatusLegend((prev) => !prev)}
            className="text-xs font-mono px-3 py-1.5 rounded-xl border border-white/15 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Info className="size-3.5 text-cyan-400" />
            <span>Classification Badges</span>
          </button>
        </div>
      </div>

      {/* 2. Classification Badges Explanation (when toggled) */}
      {showStatusLegend && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
            <span className="font-bold text-emerald-400 font-mono">[OBSERVATION]</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Direct empirical data measured by telescopes (e.g. ALMA dust rings, Gaia photometry, JWST spectra).
            </p>
          </div>
          <div className="space-y-1 p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20">
            <span className="font-bold text-blue-400 font-mono">[MODEL]</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Physics-informed theoretical calculations or precomputed simulation grids (e.g. MIST stellar tracks, Jeans collapse).
            </p>
          </div>
          <div className="space-y-1 p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20">
            <span className="font-bold text-purple-400 font-mono">[ILLUSTRATION]</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Conceptual visualization designed to illustrate physical processes where 1:1 numerical precision is computationally bounded.
            </p>
          </div>
        </div>
      )}

      {/* 3. Module Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10">
        <button
          onClick={() => setActiveModule("star_formation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModule === "star_formation"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Flame className="size-4" />
          <span>1. Star Formation Lab</span>
        </button>

        <button
          onClick={() => setActiveModule("stellar_evolution")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModule === "stellar_evolution"
              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="size-4" />
          <span>2. Stellar Evolution & H-R</span>
        </button>

        <button
          onClick={() => setActiveModule("planet_formation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModule === "planet_formation"
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Orbit className="size-4" />
          <span>3. Planet Formation Lab</span>
        </button>

        <button
          onClick={() => setActiveModule("galaxy_assembly")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeModule === "galaxy_assembly"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
              : "text-slate-300 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="size-4" />
          <span>4. Galaxy Assembly Lab</span>
        </button>
      </div>

      {/* 4. Active Laboratory View */}
      {activeModule === "star_formation" && (
        <StarFormationLab initialTargetName={targetObjectName || "Orion Molecular Cloud (OMC-1)"} />
      )}

      {activeModule === "stellar_evolution" && (
        <StellarEvolutionLab
          initialMassSolar={1.0}
          initialTargetStarName={targetObjectName || "The Sun (Sol)"}
        />
      )}

      {activeModule === "planet_formation" && (
        <PlanetFormationLab
          initialHostStarName={targetObjectName || "HL Tauri Protoplanetary System"}
        />
      )}

      {activeModule === "galaxy_assembly" && (
        <GalaxyAssemblyLab
          initialGalaxyTargetName={targetObjectName || "The Antennae Galaxies (NGC 4038 / 4039)"}
        />
      )}

      {/* 5. Academy Curriculum Cross-Links */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-cyan-400" />
          <span>Integrated with Cosmic Learning Academy modules:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] border-white/10">
            <Link to="/learn" search={{ module: "module-10" }}>
              Module 10: Stellar Evolution
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] border-white/10">
            <Link to="/learn" search={{ module: "module-11" }}>
              Module 11: Nebulae & Birth
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] border-white/10">
            <Link to="/learn" search={{ module: "module-12" }}>
              Module 12: Exoplanets
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-7 text-[11px] border-white/10">
            <Link to="/learn" search={{ module: "module-13" }}>
              Module 13: Galaxies
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
