import { useState } from "react";
import { useStore } from "./store";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

export function PerformanceProfilerHUD() {
  const stats = useStore((s) => s.performanceStats);
  const subsystems = useStore((s) => s.subsystems);
  const toggleSubsystem = useStore((s) => s.toggleSubsystem);
  const expanded = useStore((s) => s.performanceProfilerExpanded);
  const setExpanded = useStore((s) => s.setPerformanceProfilerExpanded);
  const uiHidden = useStore((s) => s.uiHidden);

  if (uiHidden) return null;

  const fpsColor =
    stats.fps >= 55 ? "text-emerald-400" : stats.fps >= 35 ? "text-amber-400" : "text-rose-400";

  return (
    <aside
      aria-label="Real-time Graphics Engine Performance Profiler"
      className="fixed top-4 right-4 z-40 max-w-sm select-none transition-all duration-200"
    >
      <div className="rounded-xl border border-white/15 bg-neutral-950/85 p-3 text-white shadow-2xl backdrop-blur-md">
        {/* Header / Summary Bar */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span className={`font-mono font-bold tabular-nums ${fpsColor}`}>{stats.fps}</span>
              <span className="text-[10px] uppercase text-white/50">FPS</span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[11px] text-white/70 tabular-nums">
                {stats.frameTimeMs.toFixed(1)}ms
              </span>
              <span className="text-white/20">·</span>
              <span className="font-mono text-[11px] text-white/70 tabular-nums">
                {stats.drawCalls} calls
              </span>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse performance profiler" : "Expand performance profiler"}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span>{expanded ? "Collapse" : "Profiler"}</span>
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </header>

        {/* Detailed Metrics Panel */}
        {expanded && (
          <section className="mt-3 space-y-3 border-t border-white/10 pt-3 text-[11px]">
            {/* Latency Quantiles */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
                <span>Frame Timing & Percentiles</span>
                <span className="text-white/30 font-mono">P95 / P99</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded border border-white/5 bg-white/[0.03] p-1.5 text-center">
                  <div className="text-[9px] uppercase text-white/40">Rolling FPS</div>
                  <div className="font-mono font-semibold text-white/90 tabular-nums">
                    {stats.rollingFps}
                  </div>
                </div>
                <div className="rounded border border-white/5 bg-white/[0.03] p-1.5 text-center">
                  <div className="text-[9px] uppercase text-white/40">P95 Latency</div>
                  <div className="font-mono font-semibold text-white/90 tabular-nums">
                    {stats.p95FrameTimeMs.toFixed(1)}ms
                  </div>
                </div>
                <div className="rounded border border-white/5 bg-white/[0.03] p-1.5 text-center">
                  <div className="text-[9px] uppercase text-white/40">P99 Latency</div>
                  <div className="font-mono font-semibold text-white/90 tabular-nums">
                    {stats.p99FrameTimeMs.toFixed(1)}ms
                  </div>
                </div>
              </div>
            </div>

            {/* GPU Workload & Geometries */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
                <span>WebGL Pipeline Load</span>
                <span className="text-white/30 font-mono">
                  {stats.triangles.toLocaleString()} tris
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-white/5 bg-white/[0.03] p-1.5">
                  <div className="text-[9px] uppercase text-white/40">Particle Points</div>
                  <div className="font-mono font-medium text-cyan-300 tabular-nums">
                    {stats.pointsCount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded border border-white/5 bg-white/[0.03] p-1.5">
                  <div className="text-[9px] uppercase text-white/40">JS Heap Memory</div>
                  <div className="font-mono font-medium text-white/90 tabular-nums">
                    ~{stats.memoryMb} MB
                  </div>
                </div>
              </div>
            </div>

            {/* Active Floating Origin Frame */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-cyan-400" />
                <span>Camera-Relative Origin</span>
              </div>
              <div className="rounded border border-cyan-500/20 bg-cyan-950/20 px-2 py-1 text-[10px] font-mono text-cyan-200 truncate">
                {stats.activeFloatingOrigin || "Solar System Barycenter"}
              </div>
            </div>

            {/* Subsystem Isolation Switches */}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
                <span>Subsystem Isolation</span>
                <span className="text-[9px] text-white/30">Benchmark Toggles</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => toggleSubsystem("milkyWay")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.milkyWay
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Milky Way</span>
                  {subsystems.milkyWay ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>

                <button
                  onClick={() => toggleSubsystem("andromeda")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.andromeda
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Andromeda</span>
                  {subsystems.andromeda ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>

                <button
                  onClick={() => toggleSubsystem("gaiaStars")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.gaiaStars
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Gaia Stars</span>
                  {subsystems.gaiaStars ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>

                <button
                  onClick={() => toggleSubsystem("detailedGalaxies")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.detailedGalaxies
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Catalog Detail</span>
                  {subsystems.detailedGalaxies ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>

                <button
                  onClick={() => toggleSubsystem("planets")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.planets
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Solar System</span>
                  {subsystems.planets ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>

                <button
                  onClick={() => toggleSubsystem("bloom")}
                  className={`flex items-center justify-between rounded px-2 py-1 transition-colors border ${
                    subsystems.bloom
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/5 bg-white/[0.02] text-white/40"
                  }`}
                >
                  <span>Optics Bloom</span>
                  {subsystems.bloom ? <Zap className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
