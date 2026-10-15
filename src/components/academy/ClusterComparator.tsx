import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Scale,
  Compass,
  Clock,
  Atom,
  Info,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ClusterComparator() {
  const [activeTab, setActiveTab] = useState<"overview" | "hr_turnoff" | "origins">("overview");

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
              <Scale className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-semibold text-white">
              Open Clusters vs. Globular Clusters
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare young spiral-arm stellar litters with ancient spherical galactic halo swarms
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === "overview"
                ? "bg-pink-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Side-by-Side Metrics
          </button>
          <button
            onClick={() => setActiveTab("hr_turnoff")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === "hr_turnoff"
                ? "bg-pink-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            H-R Turnoff Age Dating
          </button>
          <button
            onClick={() => setActiveTab("origins")}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeTab === "origins"
                ? "bg-pink-500 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Galactic Habitat
          </button>
        </div>
      </div>

      {/* Tab 1: Side-by-Side Metrics */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          {/* Card 1: Open Cluster */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Young Galactic Disk Population
                </span>
                <h4 className="text-base font-bold text-white mt-1">Open Star Clusters</h4>
                <p className="text-xs text-slate-400">Archetype: Pleiades (M45) / Hyades</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-cyan-400">~100 Million Yrs</span>
                <span className="block text-[10px] text-slate-500">Typical Age</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Number of Stars:</span>
                <span className="font-mono text-white font-medium">Few dozen to ~1,500 stars</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Dominant Star Colors:</span>
                <span className="text-cyan-300 font-medium">Bright Blue & White (O/B/A types)</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Location in Galaxy:</span>
                <span className="text-slate-200">Milky Way Spiral Arms (Thin Disk)</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Heavy Element Metallicity:</span>
                <span className="text-slate-200 font-mono">
                  Population I (Solar-like, ~1–2% metals)
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Gravitational Binding:</span>
                <span className="text-rose-400 font-medium">Loose (Disrupted in &lt;500 Myr)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Key Astrophysical Role:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Traces recent star formation in galactic spiral density waves and provides stellar
                  samples with identical age and chemical composition.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Globular Cluster */}
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ancient Galactic Halo Population
                </span>
                <h4 className="text-base font-bold text-white mt-1">Globular Star Clusters</h4>
                <p className="text-xs text-slate-400">Archetype: Great Hercules Cluster (M13)</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-amber-400">
                  11 – 13 Billion Yrs
                </span>
                <span className="block text-[10px] text-slate-500">Typical Age</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Number of Stars:</span>
                <span className="font-mono text-white font-medium">100,000 to over 1,000,000</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Dominant Star Colors:</span>
                <span className="text-amber-300 font-medium">Golden Yellow, Orange, & Red</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Location in Galaxy:</span>
                <span className="text-slate-200">Spherical Galactic Halo & Bulge</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Heavy Element Metallicity:</span>
                <span className="text-slate-200 font-mono">
                  Population II (Metal-poor, 0.01–0.1% metals)
                </span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Gravitational Binding:</span>
                <span className="text-emerald-400 font-medium">
                  Extremely Tightly Bound (Eternal)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Key Astrophysical Role:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Acts as cosmic chronometers establishing the minimum age of the Universe and
                  mapping the primordial assembly history of the Milky Way.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: HR Turnoff Age Dating */}
      {activeTab === "hr_turnoff" && (
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                The Main-Sequence Turnoff Point: The Universe&apos;s Clock
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Because all stars in a cluster formed at the same time from the same cloud, the most
                massive stars die first. The point where stars peel off the Main Sequence to become
                Red Giants reveals the exact age of the cluster!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-900 border border-cyan-500/20 space-y-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide block">
                Open Cluster Turnoff (e.g. Pleiades)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The turnoff point sits high on the upper left of the H-R diagram among luminous,
                massive B-type stars. This tells astronomers the cluster is young (under 100 million
                years old).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide block">
                Globular Cluster Turnoff (e.g. M13)
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                The turnoff point has dropped all the way down to solar-mass stars (~0.8 M☉). All
                stars more massive than the Sun have already died, leaving an empty upper main
                sequence and a populated red giant branch.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Galactic Habitat */}
      {activeTab === "origins" && (
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                Galactic Distribution: Disk vs. Halo
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Where are these clusters found in our home galaxy, the Milky Way?
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-white block mb-1">Open Clusters in the Galactic Disk:</strong>
              They travel inside the flat, gas-rich spiral arms where molecular clouds continually
              form new stars. Gravitational encounters with giant clouds and spiral arms tear them
              apart within a few galactic orbits.
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-white block mb-1">
                Globular Clusters in the Galactic Halo:
              </strong>
              Roughly 150 globular clusters orbit like a giant spherical swarm above and below the
              disk. Because they spend most of their time in the empty halo far from dense gas, they
              survive intact for over 12 billion years!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
