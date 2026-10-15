import React, { useState } from "react";
import {
  LineChart,
  Calculator,
  Compass,
  Zap,
  Info,
  Scale,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Atom,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrbitalEnergyGraphs() {
  const [activeTab, setActiveTab] = useState<"equations" | "graphs" | "relativity">("graphs");

  // Interactive Inverse-Square Law slider states
  const [mass1, setMass1] = useState<number>(100); // 10 to 500
  const [mass2, setMass2] = useState<number>(1); // 1 to 50
  const [distanceR, setDistanceR] = useState<number>(10); // 2 to 30

  // Interactive Orbit calculator states
  const [starMass, setStarMass] = useState<number>(1.0); // Solar masses
  const [orbitRadiusAu, setOrbitRadiusAu] = useState<number>(1.0); // AU

  // Derived values for Inverse-Square Law
  // F = G * m1 * m2 / r^2 (scaled constant G = 1000)
  const forceVal = (1000 * mass1 * mass2) / (distanceR * distanceR);

  // Derived values for Solar System Kepler calculations
  // v_circ = 29.78 * sqrt(M_star / r_au) km/s
  const vCircKmS = 29.78 * Math.sqrt(starMass / orbitRadiusAu);
  // v_esc = sqrt(2) * v_circ
  const vEscKmS = vCircKmS * Math.SQRT2;
  // Period in Earth years: T = sqrt(a^3 / M)
  const periodYears = Math.sqrt(Math.pow(orbitRadiusAu, 3) / starMass);
  const periodDays = periodYears * 365.25;

  // Real planetary data for Kepler's 3rd Law Graph
  const PLANET_KEPLER_DATA = [
    { name: "Mercury", a: 0.387, T: 0.241, a3: 0.058, T2: 0.058, v: 47.4 },
    { name: "Venus", a: 0.723, T: 0.615, a3: 0.378, T2: 0.378, v: 35.0 },
    { name: "Earth", a: 1.0, T: 1.0, a3: 1.0, T2: 1.0, v: 29.8 },
    { name: "Mars", a: 1.524, T: 1.881, a3: 3.54, T2: 3.54, v: 24.1 },
    { name: "Jupiter", a: 5.204, T: 11.86, a3: 140.8, T2: 140.7, v: 13.1 },
    { name: "Saturn", a: 9.582, T: 29.46, a3: 880.0, T2: 868.0, v: 9.7 },
    { name: "Uranus", a: 19.2, T: 84.01, a3: 7078.0, T2: 7058.0, v: 6.8 },
    { name: "Neptune", a: 30.05, T: 164.8, a3: 27135.0, T2: 27159.0, v: 5.4 },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 backdrop-blur-xl shadow-xl space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <span>Orbital Mechanics Equations & Numerical Graphs (Classes 7–10)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explore verified mathematical relationships, physical conservation laws, and the
            Newtonian-Relativistic boundary.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("graphs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "graphs"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Numerical Graphs
          </button>
          <button
            onClick={() => setActiveTab("equations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "equations"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Formula Laboratory
          </button>
          <button
            onClick={() => setActiveTab("relativity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "relativity"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Newton vs Einstein
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: NUMERICAL GRAPHS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "graphs" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GRAPH A: INVERSE-SQUARE LAW FORCE VS DISTANCE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-cyan-300 text-xs">
                  Graph 1: Inverse-Square Gravitational Falloff
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  F(r) = G · (m₁ · m₂) / r²
                </div>
              </div>
              <span className="text-[10px] bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-300 font-mono">
                Classes 7–9
              </span>
            </div>

            {/* SVG Plot */}
            <div className="relative h-44 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Axes */}
                <line x1="30" y1="130" x2="290" y2="130" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1" />
                <text x="290" y="142" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Distance r →
                </text>
                <text x="28" y="15" fill="#94a3b8" fontSize="9" textAnchor="end">
                  F(r)
                </text>

                {/* 1/r^2 curve */}
                {(() => {
                  const points: string[] = [];
                  for (let rx = 35; rx <= 285; rx += 5) {
                    const rNorm = (rx - 30) / 10;
                    const yVal = 130 - 1200 / (rNorm * rNorm + 4);
                    const clampedY = Math.max(15, Math.min(130, yVal));
                    points.push(`${rx},${clampedY}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      points={points.join(" ")}
                    />
                  );
                })()}

                {/* Key markers: 1r, 2r (1/4 F), 3r (1/9 F) */}
                <circle cx="60" cy="30" r="3.5" fill="#f59e0b" />
                <text x="65" y="28" fill="#f59e0b" fontSize="8" fontWeight="bold">
                  r₀ (F₀ = 100%)
                </text>

                <circle cx="110" cy="105" r="3.5" fill="#ef4444" />
                <text x="115" y="103" fill="#ef4444" fontSize="8" fontWeight="bold">
                  2r₀ (F = 25%)
                </text>

                <circle cx="160" cy="119" r="3" fill="#a855f7" />
                <text x="165" y="117" fill="#a855f7" fontSize="8">
                  3r₀ (F = 11.1%)
                </text>

                <circle cx="210" cy="123" r="2.5" fill="#64748b" />
                <text x="215" y="122" fill="#94a3b8" fontSize="8">
                  4r₀ (F = 6.25%)
                </text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-cyan-200">
                The Power of the Inverse-Square Law:
              </div>
              <p className="text-slate-400">
                Doubling the distance (2×) drops gravity to 1/4th (25%). Tripling the distance (3×)
                reduces gravity to 1/9th (11%). At 10 times the distance, gravity is only 1% of its
                initial pull!
              </p>
            </div>
          </div>

          {/* GRAPH B: KEPLER'S 3RD LAW T² VS a³ */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-emerald-300 text-xs">
                  Graph 2: Kepler's Harmonic Law (T² vs a³)
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  T² / a³ = 1.000 yr² / AU³ (Slope = 1.000)
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-300 font-mono">
                Classes 8–10
              </span>
            </div>

            {/* SVG Plot */}
            <div className="relative h-44 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Axes */}
                <line x1="30" y1="130" x2="290" y2="130" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1" />
                <text x="290" y="142" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Semi-Major Axis a³ →
                </text>
                <text x="28" y="15" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Period T²
                </text>

                {/* Linear diagonal line showing perfect unity slope T^2 = a^3 */}
                <line
                  x1="30"
                  y1="130"
                  x2="280"
                  y2="20"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Real Planets plotted on log/scaled coordinates */}
                <circle cx="45" cy="123" r="3" fill="#fb923c" />
                <text x="50" y="122" fill="#fb923c" fontSize="7.5">
                  Mercury
                </text>

                <circle cx="65" cy="114" r="3" fill="#e2e8f0" />
                <text x="70" y="113" fill="#e2e8f0" fontSize="7.5">
                  Venus
                </text>

                <circle cx="85" cy="105" r="3.5" fill="#38bdf8" />
                <text x="90" y="104" fill="#38bdf8" fontSize="8" fontWeight="bold">
                  Earth (1, 1)
                </text>

                <circle cx="115" cy="92" r="3" fill="#f87171" />
                <text x="120" y="91" fill="#f87171" fontSize="7.5">
                  Mars
                </text>

                <circle cx="180" cy="64" r="4" fill="#f59e0b" />
                <text x="185" y="63" fill="#f59e0b" fontSize="8" fontWeight="bold">
                  Jupiter
                </text>

                <circle cx="240" cy="38" r="3.5" fill="#fbbf24" />
                <text x="235" y="32" fill="#fbbf24" fontSize="7.5">
                  Saturn
                </text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-emerald-200">The Empirical Proof:</div>
              <p className="text-slate-400">
                Because every body in our Solar System orbits the same central Sun, the plot of T²
                versus a³ forms an exact straight line passing through the origin. If an exoplanet
                is at 4 AU, T² = 4³ = 64, so T = 8 Earth years.
              </p>
            </div>
          </div>

          {/* GRAPH C: ORBITAL VELOCITY VS DISTANCE */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-amber-300 text-xs">
                  Graph 3: Orbital Speed vs Orbital Distance (v ∝ 1/√r)
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  v_circ = √(GM / r) · Drops from 47.4 km/s to 5.4 km/s
                </div>
              </div>
              <span className="text-[10px] bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded text-amber-300 font-mono">
                Classes 9–10
              </span>
            </div>

            {/* SVG Plot */}
            <div className="relative h-44 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Axes */}
                <line x1="30" y1="130" x2="290" y2="130" stroke="#475569" strokeWidth="1" />
                <line x1="30" y1="10" x2="30" y2="130" stroke="#475569" strokeWidth="1" />
                <text x="290" y="142" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Orbital Radius r (AU) →
                </text>
                <text x="28" y="15" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Velocity v (km/s)
                </text>

                {/* 1/sqrt(r) curve */}
                {(() => {
                  const points: string[] = [];
                  for (let rx = 35; rx <= 285; rx += 5) {
                    const rNorm = (rx - 30) / 10;
                    const yVal = 130 - 180 / Math.sqrt(rNorm + 1.2);
                    const clampedY = Math.max(15, Math.min(130, yVal));
                    points.push(`${rx},${clampedY}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      points={points.join(" ")}
                    />
                  );
                })()}

                {/* Escape velocity curve (dashed red, exactly sqrt(2) higher) */}
                {(() => {
                  const points: string[] = [];
                  for (let rx = 35; rx <= 285; rx += 5) {
                    const rNorm = (rx - 30) / 10;
                    const yVal = 130 - (180 * Math.SQRT2) / Math.sqrt(rNorm + 1.2);
                    const clampedY = Math.max(15, Math.min(130, yVal));
                    points.push(`${rx},${clampedY}`);
                  }
                  return (
                    <polyline
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="3 2"
                      points={points.join(" ")}
                    />
                  );
                })()}

                <circle cx="65" cy="48" r="3" fill="#fb923c" />
                <text x="70" y="47" fill="#fb923c" fontSize="7.5">
                  Mercury (47 km/s)
                </text>

                <circle cx="105" cy="72" r="3.5" fill="#38bdf8" />
                <text x="110" y="71" fill="#38bdf8" fontSize="8" fontWeight="bold">
                  Earth (29.8 km/s)
                </text>

                <circle cx="250" cy="115" r="3" fill="#818cf8" />
                <text x="220" y="112" fill="#818cf8" fontSize="7.5">
                  Neptune (5.4 km/s)
                </text>

                <text x="160" y="32" fill="#ef4444" fontSize="8" fontWeight="bold">
                  - - Escape Velocity v_esc = √2 · v_circ
                </text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-amber-200">Why Outer Planets are Slow:</div>
              <p className="text-slate-400">
                Orbital velocity decreases with the square root of distance (v ∝ 1/√r). Solar
                gravity is much weaker far away, requiring less centripetal velocity to sustain an
                equilibrium orbit.
              </p>
            </div>
          </div>

          {/* GRAPH D: CONSERVATION OF MECHANICAL ENERGY IN ELLIPTIC ORBITS */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-purple-300 text-xs">
                  Graph 4: Conservation of Mechanical Energy (Vis-Viva)
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  E_tot = K(r) + U(r) = -G·M·m / (2a) = Constant
                </div>
              </div>
              <span className="text-[10px] bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded text-purple-300 font-mono">
                Class 10 & Advanced
              </span>
            </div>

            {/* SVG Plot */}
            <div className="relative h-44 w-full bg-slate-900/60 rounded-lg p-2 border border-white/5">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 150">
                {/* Zero Energy Axis */}
                <line
                  x1="30"
                  y1="50"
                  x2="290"
                  y2="50"
                  stroke="#64748b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text x="290" y="46" fill="#94a3b8" fontSize="8" textAnchor="end">
                  E = 0 (Escape Threshold)
                </text>

                <line x1="30" y1="10" x2="30" y2="140" stroke="#475569" strokeWidth="1" />
                <text x="28" y="15" fill="#94a3b8" fontSize="9" textAnchor="end">
                  Energy
                </text>

                {/* Total Energy Line (strictly horizontal constant!) */}
                <line x1="40" y1="85" x2="280" y2="85" stroke="#a855f7" strokeWidth="2.5" />
                <text x="280" y="80" fill="#a855f7" fontSize="8" textAnchor="end" fontWeight="bold">
                  Total Energy E = -GMm / (2a) (CONSTANT)
                </text>

                {/* Kinetic Energy K (always positive, peaks at periapsis) */}
                <path d="M 40 25 Q 160 80 280 100" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <text x="70" y="35" fill="#38bdf8" fontSize="8">
                  Kinetic Energy K = ½mv²
                </text>

                {/* Potential Energy U (always negative, deepest at periapsis) */}
                <path d="M 40 145 Q 160 90 280 70" fill="none" stroke="#f43f5e" strokeWidth="2" />
                <text x="70" y="135" fill="#f43f5e" fontSize="8">
                  Potential Energy U = -GMm/r
                </text>

                <text x="45" y="10" fill="#fbbf24" fontSize="7.5">
                  Periapsis (Closest, Fastest)
                </text>
                <text x="220" y="10" fill="#94a3b8" fontSize="7.5">
                  Apoapsis (Farthest, Slowest)
                </text>
              </svg>
            </div>

            <div className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="font-semibold text-purple-200">Energy Exchange in Action:</div>
              <p className="text-slate-400">
                At periapsis, potential energy drops to its lowest value, converting into maximum
                kinetic energy (maximum speed). At apoapsis, kinetic energy converts back into
                potential energy. Total mechanical energy never changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: FORMULA LABORATORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "equations" && (
        <div className="space-y-6">
          {/* INTERACTIVE CALCULATOR 1: INVERSE-SQUARE FORCE */}
          <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Newton's Universal Gravitation Force Calculator</span>
                </h4>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  F = G · (m₁ · m₂) / r²
                </div>
              </div>
              <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-lg text-cyan-300 font-mono text-xs font-bold">
                Computed Force: {forceVal.toFixed(2)} Newtons
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Mass 1 (Primary Star)</span>
                  <span className="font-mono text-cyan-300">{mass1} kg × 10²⁴</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={mass1}
                  onChange={(e) => setMass1(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Mass 2 (Planet / Satellite)</span>
                  <span className="font-mono text-cyan-300">{mass2} kg × 10²²</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={mass2}
                  onChange={(e) => setMass2(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Distance r (Separation)</span>
                  <span className="font-mono text-cyan-300">{distanceR} units</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={distanceR}
                  onChange={(e) => setDistanceR(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* INTERACTIVE CALCULATOR 2: ORBITAL & ESCAPE VELOCITIES */}
          <div className="p-5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Keplerian Orbital & Escape Velocity Calculator</span>
                </h4>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  v_circ = √(GM/r) · v_esc = √(2GM/r) · T = √(a³/M)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Host Star Mass (M_sun)</span>
                  <span className="font-mono text-emerald-300">{starMass.toFixed(2)} M☉</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={starMass}
                  onChange={(e) => setStarMass(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Orbital Radius a (AU)</span>
                  <span className="font-mono text-emerald-300">{orbitRadiusAu.toFixed(2)} AU</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10.0"
                  step="0.1"
                  value={orbitRadiusAu}
                  onChange={(e) => setOrbitRadiusAu(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Circular Speed (v_c)</div>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {vCircKmS.toFixed(2)} km/s
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {(vCircKmS * 3600).toLocaleString(undefined, { maximumFractionDigits: 0 })} km/h
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Escape Speed (v_esc)</div>
                <div className="text-sm font-bold text-red-400 font-mono mt-0.5">
                  {vEscKmS.toFixed(2)} km/s
                </div>
                <div className="text-[10px] text-slate-500 font-mono">√2 × v_c (+41.4%)</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Orbital Period (T)</div>
                <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                  {periodYears < 1
                    ? `${periodDays.toFixed(1)} Days`
                    : `${periodYears.toFixed(2)} Years`}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Kepler's 3rd Law</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                <div className="text-[10px] text-slate-400 uppercase">Specific Energy (ε)</div>
                <div className="text-sm font-bold text-purple-300 font-mono mt-0.5">
                  {(-(vCircKmS * vCircKmS) / 2).toFixed(1)} MJ/kg
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Gravitationally Bound</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: NEWTONIAN VS RELATIVISTIC MECHANICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "relativity" && (
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-300 text-sm">
              <Atom className="w-4 h-4" />
              <span>
                Scientific Disclosure: Classical Newtonian Mechanics vs General Relativity
              </span>
            </div>
            <p className="text-slate-300">
              The physics engine in this laboratory accurately integrates Isaac Newton’s 1687
              Universal Law of Gravitation. In our everyday world, for Solar System spacecraft
              navigation, and for Apollo lunar landings, Newtonian mechanics is accurate to better
              than 99.999%. However, in intense gravitational fields or high-precision measurements,
              Albert Einstein’s 1915 General Relativity reveals that gravity is not a force, but the
              curvature of 4D spacetime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2.5">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <span>Isaac Newton (1687)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Classical Flat Spacetime
                </span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instantaneous Pull:</strong> Gravity acts instantaneously across
                    infinite distances via an attractive inverse-square force F = G(m₁m₂)/r².
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Fixed Orbits:</strong> Isolated two-body orbits form strictly closed
                    ellipses that never precess on their own (Laplace-Runge-Lenz vector is
                    conserved).
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Universal Clock:</strong> Time ticks at the exact same uniform rate
                    everywhere across the cosmos, unaffected by gravity or velocity.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2.5">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <span>Albert Einstein (1915)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Curved Spacetime (G_μν = 8πG T_μν / c⁴)
                </span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Spacetime Curvature:</strong> Matter tells spacetime how to curve;
                    curved spacetime tells matter how to move. Gravitational waves travel at exactly
                    c.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mercury's Perihelion Precession:</strong> The Sun's intense curvature
                    causes Mercury's orbit to precess by 43.1 arcsec/century—unexplainable by
                    Newton, exactly predicted by Einstein.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Gravitational Time Dilation:</strong> Clocks run slower in deep
                    gravitational wells. GPS satellites must compensate for +38.6 microseconds/day
                    or navigation errors would drift by 11 km every day!
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
