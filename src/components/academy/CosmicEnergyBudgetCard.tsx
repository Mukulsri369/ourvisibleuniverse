import React from "react";
import { PieChart, ShieldAlert, Layers, Sparkles, Scale, Info, CheckCircle2 } from "lucide-react";

export function CosmicEnergyBudgetCard() {
  const budgetItems = [
    {
      name: "Dark Energy (Vacuum Energy / Λ)",
      percentage: "68.3%",
      fraction: 0.683,
      color: "bg-indigo-500",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/40",
      description:
        "Repulsive, negative-pressure property of empty space causing cosmic expansion to accelerate.",
    },
    {
      name: "Cold Dark Matter (Non-Baryonic)",
      percentage: "26.8%",
      fraction: 0.268,
      color: "bg-purple-500",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/40",
      description:
        "Invisible non-baryonic particles whose attractive gravity forms the scaffolding of galaxies and clusters.",
    },
    {
      name: "Ordinary Matter (Atoms / Baryons)",
      percentage: "4.9%",
      fraction: 0.049,
      color: "bg-amber-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/40",
      description:
        "Protons, neutrons, and electrons forming every star, gas cloud, planet, moon, ocean, and living organism.",
    },
    {
      name: "Photons & Relic Neutrinos",
      percentage: "< 0.1%",
      fraction: 0.001,
      color: "bg-cyan-500",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/40",
      description:
        "Cosmic Microwave Background radiation and primordial neutrinos left over from the Big Bang.",
    },
  ];

  const comparisonRows = [
    {
      feature: "Cosmic Role & Effect",
      darkMatter: "Attractive gravity: pulls gas and stars together into galaxies",
      darkEnergy: "Repulsive metric expansion: stretches space apart between galaxy clusters",
    },
    {
      feature: "Spatial Distribution",
      darkMatter: "Clumped into dense halos, galaxy clusters, and cosmic filaments",
      darkEnergy: "Completely homogeneous and smooth across the entire universe",
    },
    {
      feature: "Density as Universe Expands",
      darkMatter: "Dilutes over time as cosmic volume grows: ρ_m ∝ a⁻³",
      darkEnergy: "Remains constant per cubic meter of space: ρ_Λ = constant",
    },
    {
      feature: "Thermodynamic Pressure",
      darkMatter: "Zero pressure (p = 0): behaves as cold, pressureless dust",
      darkEnergy: "Large negative pressure: p = -ρc² (equation of state w = -1)",
    },
    {
      feature: "Primary Observational Proof",
      darkMatter: "Vera Rubin rotation curves, Bullet Cluster, gravitational lensing",
      darkEnergy: "Type Ia Supernovae standard candles, CMB acoustic peaks, BAO",
    },
    {
      feature: "Leading Candidate Hypotheses",
      darkMatter: "WIMPs, QCD axions, sterile neutrinos, primordial black holes",
      darkEnergy: "Einstein's Cosmological Constant (Λ), quantum vacuum energy, quintessence",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full uppercase">
            Cosmic Inventory
          </span>
          <span className="text-xs text-slate-400">Planck 2018 High-Precision Census</span>
        </div>
        <h3 className="text-2xl font-black text-white">The 95% Invisible Universe</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
          Everything human telescopes can see—every star, nebula, and glowing galaxy—makes up less
          than 5% of cosmic reality.
        </p>
      </div>

      {/* Visual Energy Budget Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span className="font-semibold text-white">
            Total Cosmic Energy-Density Fraction (Ω_total = 1.00 ± 0.002):
          </span>
          <span className="font-mono text-cyan-300">Spatially Flat Universe</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-6 w-full rounded-xl overflow-hidden flex bg-slate-900 border border-white/10 shadow-inner">
          <div
            style={{ width: "68.3%" }}
            className="bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white tracking-wider"
            title="Dark Energy (68.3%)"
          >
            68.3% Dark Energy
          </div>
          <div
            style={{ width: "26.8%" }}
            className="bg-purple-600 flex items-center justify-center text-[11px] font-bold text-white tracking-wider"
            title="Dark Matter (26.8%)"
          >
            26.8% DM
          </div>
          <div
            style={{ width: "4.9%" }}
            className="bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-950"
            title="Ordinary Atoms (4.9%)"
          >
            4.9%
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {budgetItems.map((item) => (
            <div
              key={item.name}
              className={`p-4 rounded-2xl bg-white/[0.02] border ${item.borderColor} space-y-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xl font-black font-mono ${item.textColor}`}>
                  {item.percentage}
                </span>
                <span className={`size-2.5 rounded-full ${item.color}`} />
              </div>
              <span className="text-xs font-bold text-white block">{item.name}</span>
              <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Side-by-Side Comparison Matrix */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Scale className="size-4 text-purple-400" />
          <h4 className="text-lg font-bold text-white">
            Dark Matter vs Dark Energy: Side-by-Side Comparison
          </h4>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-slate-300">
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-400 w-1/4">
                  Cosmological Property
                </th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-purple-300 w-3/8 bg-purple-950/20 border-r border-white/5">
                  Dark Matter (Ω_c ≈ 26.8%)
                </th>
                <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-indigo-300 w-3/8 bg-indigo-950/20">
                  Dark Energy (Ω_Λ ≈ 68.3%)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 font-semibold text-white">{row.feature}</td>
                  <td className="p-3.5 bg-purple-950/10 border-r border-white/5 text-purple-200">
                    {row.darkMatter}
                  </td>
                  <td className="p-3.5 bg-indigo-950/10 text-indigo-200">{row.darkEnergy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
