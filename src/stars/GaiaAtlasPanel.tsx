/**
 * ESA Gaia DR3 Star Atlas Controls & Benchmark Telemetry Panel
 *
 * Provides:
 * 1. Interactive Proper Motion Cosmic Epoch slider (-100,000 to +100,000 years).
 * 2. Scalability tier selector (Mobile, Standard, High, Benchmark up to 500k+).
 * 3. Sky-direction astrometry layer toggle (for unconstrained parallaxes).
 * 4. Procedural background stars toggle (distinguish observational vs procedural).
 * 5. Real-time Atlas telemetry, memory footprint, and GPU draw metrics.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Telescope,
  Sparkles,
  Clock,
  Layers,
  Activity,
  Eye,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "./store";
import { gaiaTileManager, type QualityTier } from "@/lib/astronomy/gaia/gaia-tile-manager";

export function GaiaAtlasPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const properMotionYears = useStore((s) => s.properMotionYears);
  const setProperMotionYears = useStore((s) => s.setProperMotionYears);
  const starLODTier = useStore((s) => s.starLODTier);
  const setStarLODTier = useStore((s) => s.setStarLODTier);
  const showSkyDirection = useStore((s) => s.showSkyDirectionLayer);
  const toggleSkyDirection = useStore((s) => s.toggleSkyDirectionLayer);
  const showProcedural = useStore((s) => s.showProceduralStars);
  const toggleProcedural = useStore((s) => s.toggleProceduralStars);

  const [stats, setStats] = useState(() => gaiaTileManager.getStatistics());

  // Periodically refresh telemetry
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setStats(gaiaTileManager.getStatistics());
    }, 1000);
    return () => clearInterval(interval);
  }, [open]);

  const handleLODChange = (tier: QualityTier) => {
    setStarLODTier(tier);
    gaiaTileManager.setQualityTier(tier);
    setStats(gaiaTileManager.getStatistics());
  };

  const epochLabels: Record<number, string> = {
    [-50000]: "50,000 BCE (Upper Paleolithic)",
    [-10000]: "10,000 BCE (End of Ice Age)",
    [0]: "Current Epoch (J2016.0 / 2026 CE)",
    [25000]: "+25,000 CE (Future Sky)",
    [50000]: "+50,000 CE (Constellations Deformed)",
    [100000]: "+100,000 CE (Stellar Reshuffle)",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed left-4 top-16 z-50 w-96 max-h-[85vh] overflow-y-auto rounded-2xl border border-cyan-500/30 bg-[#090d1a]/95 p-5 text-white shadow-2xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Telescope className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">
                  ESA Gaia DR3 Star Atlas
                </h3>
                <p className="text-[10px] text-cyan-300/70">
                  Astrometry & Multi-Resolution Kinematics
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Section 1: Proper Motion Epoch Simulation */}
          <div className="mt-4 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Cosmic Proper Motion Epoch</span>
              </div>
              <span className="font-mono text-xs text-amber-300">
                {properMotionYears >= 0
                  ? `+${properMotionYears.toLocaleString()} yr`
                  : `${properMotionYears.toLocaleString()} yr`}
              </span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-white/50">
              GPU-propagated 3D stellar motion from Gaia DR3 transverse and radial velocities.
            </p>

            <input
              type="range"
              min={-50000}
              max={100000}
              step={1000}
              value={properMotionYears}
              onChange={(e) => setProperMotionYears(Number(e.target.value))}
              className="mt-3 w-full accent-amber-400"
            />

            <div className="mt-2 text-[10px] text-amber-300/80 font-mono text-center">
              {epochLabels[properMotionYears] ||
                `${Math.abs(properMotionYears).toLocaleString()} years ${
                  properMotionYears < 0 ? "into the past" : "into the future"
                }`}
            </div>

            {/* Quick preset buttons */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => setProperMotionYears(-25000)}
                className={`rounded border px-2 py-1 transition ${
                  properMotionYears === -25000
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                -25,000 yr
              </button>
              <button
                type="button"
                onClick={() => setProperMotionYears(0)}
                className={`rounded border px-2 py-1 transition ${
                  properMotionYears === 0
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Present (J2016)
              </button>
              <button
                type="button"
                onClick={() => setProperMotionYears(50000)}
                className={`rounded border px-2 py-1 transition ${
                  properMotionYears === 50000
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                +50,000 yr
              </button>
            </div>
          </div>

          {/* Section 2: Scalability LOD Tiers */}
          <div className="mt-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Scalability Tier & Point Capacity</span>
            </div>
            <p className="mt-1 text-[10px] text-white/50">
              Adapts active GPU points and multi-resolution LOD tiles based on device performance.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLODChange("mobile")}
                className={`rounded-lg border p-2 text-left transition ${
                  starLODTier === "mobile"
                    ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-medium">Mobile Fallback</div>
                <div className="text-[9px] text-white/40">~15k points • Low power</div>
              </button>
              <button
                type="button"
                onClick={() => handleLODChange("standard")}
                className={`rounded-lg border p-2 text-left transition ${
                  starLODTier === "standard"
                    ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-medium">Standard (60 FPS)</div>
                <div className="text-[9px] text-white/40">~50k points • Balanced</div>
              </button>
              <button
                type="button"
                onClick={() => handleLODChange("high")}
                className={`rounded-lg border p-2 text-left transition ${
                  starLODTier === "high"
                    ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-medium">High Detail</div>
                <div className="text-[9px] text-white/40">~150k points • Desktop</div>
              </button>
              <button
                type="button"
                onClick={() => handleLODChange("benchmark")}
                className={`rounded-lg border p-2 text-left transition ${
                  starLODTier === "benchmark"
                    ? "border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-medium">Stress Benchmark</div>
                <div className="text-[9px] text-white/40">~500k+ points • GPU stress</div>
              </button>
            </div>
          </div>

          {/* Section 3: Scientific Layer Filters */}
          <div className="mt-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
              <Eye className="h-3.5 w-3.5 text-emerald-400" />
              <span>Scientific Data Layers</span>
            </div>

            <div className="mt-3 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={showSkyDirection}
                  onChange={toggleSkyDirection}
                  className="mt-0.5 accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-medium text-white/90">
                    Sky-Direction Astrometry Layer
                  </div>
                  <div className="text-[10px] text-white/50 leading-snug">
                    Renders stars with unconstrained/negative parallaxes on celestial sphere (15,000
                    ly) without fake depths.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2.5 transition hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={showProcedural}
                  onChange={toggleProcedural}
                  className="mt-0.5 accent-cyan-400"
                />
                <div>
                  <div className="text-xs font-medium text-white/90">
                    Procedural Background Stars
                  </div>
                  <div className="text-[10px] text-white/50 leading-snug">
                    Illustrative galactic thin-disk glow. Turn off for 100% pure observational Gaia
                    DR3 stars.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Live Atlas Telemetry & Benchmarking */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-medium text-white/90">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-purple-400" />
                <span>Live Atlas Benchmarks</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Bright Guide Stars
                </div>
                <div className="font-mono text-sm font-semibold text-white mt-0.5">
                  {stats.brightStarsCount} stars
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Nearby 3D Stars (&lt;300 ly)
                </div>
                <div className="font-mono text-sm font-semibold text-white mt-0.5">
                  {stats.nearbyStarsCount} stars
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Active Spatial Tiles
                </div>
                <div className="font-mono text-sm font-semibold text-cyan-300 mt-0.5">
                  {stats.activeTilesCount} tiles
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/40 p-2">
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  Sky-Direction Shell
                </div>
                <div className="font-mono text-sm font-semibold text-purple-300 mt-0.5">
                  {stats.skyDirectionCount} sources
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
              <span>Catalog: ESA Gaia DR3 (I/355)</span>
              <span>Distances: Bailer-Jones 2021</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
