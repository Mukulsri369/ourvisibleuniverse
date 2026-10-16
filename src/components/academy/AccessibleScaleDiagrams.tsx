import React from "react";
import {
  COSMIC_SCALE_STEPS,
  BASKETBALL_SOLAR_SYSTEM,
  TRAVEL_DESTINATIONS,
} from "@/lib/academy/lessons/module-03-cosmic-scale";
import { Table, Sparkles, Ruler, Footprints, ShieldCheck } from "lucide-react";

export function AccessibleScaleDiagrams() {
  return (
    <div className="space-y-8 p-6 rounded-2xl border border-white/10 bg-slate-900/90 text-slate-100">
      <div className="border-b border-white/10 pb-4">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
          Accessibility Mode
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Accessible 2D Cosmic Scale Reference Tables & Diagrams
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Designed for screen-readers, high-contrast displays, and low-motion environments.
        </p>
      </div>

      {/* 1. Powers of Ten Reference Table */}
      <section className="space-y-3" aria-labelledby="powers-of-ten-heading">
        <div className="flex items-center gap-2">
          <Ruler className="size-4 text-indigo-400" />
          <h4 id="powers-of-ten-heading" className="text-base font-bold text-white">
            1. Powers of Ten Cosmic Scale Ladder (10^0 m to 10^26 m)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950">
          <table className="w-full text-left text-xs" role="table">
            <thead className="bg-slate-900 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3 font-mono">Scale Step</th>
                <th className="py-2.5 px-3 font-mono">Exponent</th>
                <th className="py-2.5 px-3">Physical Size</th>
                <th className="py-2.5 px-3">Astronomical Unit Equivalent</th>
                <th className="py-2.5 px-3">Analogy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {COSMIC_SCALE_STEPS.map((step) => (
                <tr key={step.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-white">{step.name}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">10^{step.exponent} m</td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">{step.formattedSize}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {step.astronomicalEquivalent}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{step.analogy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Basketball Scale Model Blueprint */}
      <section className="space-y-3" aria-labelledby="basketball-table-heading">
        <div className="flex items-center gap-2">
          <Footprints className="size-4 text-rose-400" />
          <h4 id="basketball-table-heading" className="text-base font-bold text-white">
            2. The Basketball Sun Scale Model (Sun = 24 cm Basketball)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950">
          <table className="w-full text-left text-xs" role="table">
            <thead className="bg-slate-900 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Body Name</th>
                <th className="py-2.5 px-3 font-mono">Real Diameter</th>
                <th className="py-2.5 px-3">Scaled Size Analogy</th>
                <th className="py-2.5 px-3 font-mono">Scaled Distance</th>
                <th className="py-2.5 px-3">Where to Walk in Real Life</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {BASKETBALL_SOLAR_SYSTEM.map((body) => (
                <tr key={body.name} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-white">{body.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {body.realDiameterKm.toLocaleString()} km
                  </td>
                  <td className="py-2.5 px-3 text-amber-300">{body.scaleObjectAnalogy}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">
                    {body.scaleDistanceMeters >= 1000
                      ? `${(body.scaleDistanceMeters / 1000).toLocaleString()} km`
                      : `${body.scaleDistanceMeters.toFixed(1)} m`}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{body.scaleDistanceAnalogy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Real Missions vs Straight-Line Light Travel */}
      <section className="space-y-3" aria-labelledby="travel-table-heading">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-amber-400" />
          <h4 id="travel-table-heading" className="text-base font-bold text-white">
            3. Light-Travel Time & Real Spacecraft Orbital Trajectories
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950">
          <table className="w-full text-left text-xs" role="table">
            <thead className="bg-slate-900 text-slate-400 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">Destination</th>
                <th className="py-2.5 px-3 font-mono">Distance</th>
                <th className="py-2.5 px-3 font-mono text-amber-400">Light Time (c)</th>
                <th className="py-2.5 px-3">Real Orbital Trajectory Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TRAVEL_DESTINATIONS.map((dest) => (
                <tr key={dest.id} className="hover:bg-white/5">
                  <td className="py-2.5 px-3 font-bold text-white">{dest.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{dest.formattedDistance}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                    {dest.lightTravelTime}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{dest.trajectoryNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
