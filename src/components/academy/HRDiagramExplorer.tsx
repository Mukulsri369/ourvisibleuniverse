import React, { useState, useMemo } from "react";
import { BENCHMARK_STARS, type BenchmarkStar } from "@/lib/academy/lessons/module-09-stars";
import {
  Sparkles,
  Layers,
  Info,
  Sliders,
  Filter,
  Eye,
  CheckCircle2,
  Crosshair,
  Maximize2,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function HRDiagramExplorer({ onInteracted }: { onInteracted?: () => void }) {
  const [selectedStarId, setSelectedStarId] = useState<string>("sun");
  const [highlightRegion, setHighlightRegion] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState<string>("all");

  // Custom Star Creator state
  const [customTempK, setCustomTempK] = useState<number>(6000);
  const [customRadiusR, setCustomRadiusR] = useState<number>(1.2);
  const [showCustomStar, setShowCustomStar] = useState<boolean>(false);

  const selectedStar = useMemo(() => {
    return BENCHMARK_STARS.find((s) => s.id === selectedStarId) || BENCHMARK_STARS[0];
  }, [selectedStarId]);

  // Compute custom star parameters
  const customStar = useMemo(() => {
    // Stefan-Boltzmann: L / L_sun = (R / R_sun)^2 * (T / T_sun)^4
    const tSun = 5772;
    const lum = Math.pow(customRadiusR, 2) * Math.pow(customTempK / tSun, 4);
    const absMag = 4.83 - 2.5 * Math.log10(lum);

    // Map log Temp: 40000 K (x=0) to 2500 K (x=100)
    const logMinT = Math.log10(2500); // ~3.398
    const logMaxT = Math.log10(40000); // ~4.602
    const logT = Math.log10(customTempK);
    const hrX = 100 - ((logT - logMinT) / (logMaxT - logMinT)) * 100;

    // Map log Lum: 1e-4 (y=100) to 1e6 (y=0)
    const logMinL = -4;
    const logMaxL = 6;
    const logL = Math.log10(Math.max(1e-5, lum));
    const hrY = 100 - ((logL - logMinL) / (logMaxL - logMinL)) * 100;

    let region = "Main Sequence";
    if (lum > 10000) region = "Supergiants";
    else if (lum > 50 && customTempK < 6000) region = "Red Giants";
    else if (customRadiusR < 0.05 && customTempK > 6000) region = "White Dwarfs";

    return {
      tempK: customTempK,
      radiusR: customRadiusR,
      luminosity: lum,
      absMag,
      hrX: Math.max(5, Math.min(hrX, 95)),
      hrY: Math.max(5, Math.min(hrY, 95)),
      region,
    };
  }, [customTempK, customRadiusR]);

  // Filter stars list
  const filteredStars = useMemo(() => {
    return BENCHMARK_STARS.filter((s) => {
      if (filterClass !== "all" && s.spectralClass !== filterClass) return false;
      if (highlightRegion && s.hrRegion !== highlightRegion) return false;
      return true;
    });
  }, [filterClass, highlightRegion]);

  const handleSelectStar = (id: string) => {
    setSelectedStarId(id);
    onInteracted?.();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* 1. Header & Region Highlight Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider">
              The Master Map of Astrophysics
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Interactive Hertzsprung–Russell (H-R) Diagram
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Click any plotted star or region overlay to uncover how surface temperature and
            luminosity reveal stellar lifecycles.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Regions:</span>
          {[
            { id: null, label: "All Stars" },
            { id: "Main Sequence", label: "Main Sequence" },
            { id: "Red Giants", label: "Giants" },
            { id: "Supergiants", label: "Supergiants" },
            { id: "White Dwarfs", label: "White Dwarfs" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setHighlightRegion(item.id);
                onInteracted?.();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                highlightRegion === item.id
                  ? "bg-pink-500 text-white font-bold shadow-md shadow-pink-500/20"
                  : "bg-slate-950 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Layout: HR Diagram Scatter Graph + Star Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Interactive HR Diagram Canvas / SVG */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-3">
              <span>X: Effective Temp (Hot ← Cool)</span>
              <span>Y: Bolometric Luminosity (Log L☉)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Filter:</span>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 px-2 py-1"
              >
                <option value="all">All Spectral Classes</option>
                <option value="O">Class O (&gt;30,000 K)</option>
                <option value="B">Class B (10,000–30,000 K)</option>
                <option value="A">Class A (7,500–10,000 K)</option>
                <option value="F">Class F (6,000–7,500 K)</option>
                <option value="G">Class G (5,200–6,000 K)</option>
                <option value="K">Class K (3,700–5,200 K)</option>
                <option value="M">Class M (&lt;3,700 K)</option>
                <option value="D">White Dwarfs (Class D)</option>
              </select>
            </div>
          </div>

          {/* SVG Diagram Surface */}
          <div className="relative w-full h-[380px] sm:h-[440px] rounded-xl border border-white/10 bg-gradient-to-b from-[#080d1e] to-[#04060f] overflow-hidden select-none">
            {/* Top Spectral Class Labels (O B A F G K M) */}
            <div className="absolute top-2 left-12 right-12 flex justify-between text-[11px] font-mono font-bold pointer-events-none z-10">
              <span className="text-blue-400">Class O</span>
              <span className="text-sky-300">Class B</span>
              <span className="text-indigo-200">Class A</span>
              <span className="text-amber-100">Class F</span>
              <span className="text-amber-300">Class G (Sun)</span>
              <span className="text-orange-400">Class K</span>
              <span className="text-rose-400">Class M</span>
            </div>

            {/* Left Y-Axis Luminosity Labels */}
            <div className="absolute top-8 bottom-8 left-2 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none z-10">
              <span>10⁶ L☉</span>
              <span>10⁴ L☉</span>
              <span>10² L☉</span>
              <span>1 L☉</span>
              <span>10⁻² L☉</span>
              <span>10⁻⁴ L☉</span>
            </div>

            {/* Bottom X-Axis Temperature Labels */}
            <div className="absolute bottom-2 left-12 right-12 flex justify-between text-[10px] font-mono text-slate-400 pointer-events-none z-10">
              <span>40,000 K</span>
              <span>20,000 K</span>
              <span>10,000 K</span>
              <span>6,000 K</span>
              <span>4,000 K</span>
              <span>2,500 K</span>
            </div>

            <svg className="w-full h-full p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Horizontal Luminosity Grid Lines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#ffffff10" strokeDasharray="1 1" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#ffffff10" strokeDasharray="1 1" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#ffffff10" strokeDasharray="1 1" />
              <line x1="0" y1="70" x2="100" y2="70" stroke="#ffffff10" strokeDasharray="1 1" />
              <line x1="0" y1="90" x2="100" y2="90" stroke="#ffffff10" strokeDasharray="1 1" />

              {/* Shaded Region: The Main Sequence Band */}
              <polygon
                points="10,12 25,12 88,88 78,92 50,62 10,22"
                fill="#38bdf8"
                fillOpacity={highlightRegion === "Main Sequence" ? "0.22" : "0.06"}
                stroke="#38bdf8"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
              <text
                x="36"
                y="52"
                fill="#38bdf8"
                fontSize="3"
                fontFamily="monospace"
                transform="rotate(35 36 52)"
              >
                MAIN SEQUENCE (90% of stars)
              </text>

              {/* Shaded Region: Supergiants (Top Horizontal Band) */}
              <rect
                x="5"
                y="5"
                width="90"
                height="15"
                fill="#ec4899"
                fillOpacity={highlightRegion === "Supergiants" ? "0.22" : "0.05"}
                stroke="#ec4899"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
              <text x="45" y="11" fill="#ec4899" fontSize="2.8" fontFamily="monospace">
                SUPERGIANTS (Class I)
              </text>

              {/* Shaded Region: Red Giants Branch (Upper Right) */}
              <ellipse
                cx="74"
                cy="32"
                rx="14"
                ry="10"
                fill="#f97316"
                fillOpacity={highlightRegion === "Red Giants" ? "0.25" : "0.07"}
                stroke="#f97316"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
              <text x="66" y="32" fill="#fb923c" fontSize="2.8" fontFamily="monospace">
                RED GIANTS (Class III)
              </text>

              {/* Shaded Region: White Dwarfs (Lower Left Graveyard) */}
              <ellipse
                cx="22"
                cy="82"
                rx="14"
                ry="9"
                fill="#a855f7"
                fillOpacity={highlightRegion === "White Dwarfs" ? "0.25" : "0.07"}
                stroke="#a855f7"
                strokeWidth="0.3"
                strokeDasharray="1 1"
              />
              <text x="12" y="82" fill="#c084fc" fontSize="2.6" fontFamily="monospace">
                WHITE DWARFS (Degenerate)
              </text>

              {/* Plotted Benchmark Stars */}
              {filteredStars.map((star) => {
                const isSelected = star.id === selectedStarId;
                return (
                  <g
                    key={star.id}
                    className="cursor-pointer group"
                    onClick={() => handleSelectStar(star.id)}
                  >
                    {/* Selected halo ring */}
                    {isSelected && (
                      <circle
                        cx={star.hrX}
                        cy={star.hrY}
                        r="3.5"
                        fill="none"
                        stroke="#00ffff"
                        strokeWidth="0.8"
                        strokeDasharray="1 0.5"
                      />
                    )}

                    {/* Star Node */}
                    <circle
                      cx={star.hrX}
                      cy={star.hrY}
                      r={isSelected ? "2.2" : "1.6"}
                      fill={star.colorHex}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "0.6" : "0.2"}
                    />

                    {/* Star Label */}
                    <text
                      x={star.hrX + 2}
                      y={star.hrY - 1.5}
                      fill={isSelected ? "#00ffff" : "#e2e8f0"}
                      fontSize={isSelected ? "2.6" : "2.1"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      fontFamily="sans-serif"
                    >
                      {star.name}
                    </text>
                  </g>
                );
              })}

              {/* Custom Star Point (if plotted) */}
              {showCustomStar && (
                <g>
                  <circle
                    cx={customStar.hrX}
                    cy={customStar.hrY}
                    r="3.8"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="0.8"
                    strokeDasharray="1 1"
                  />
                  <circle
                    cx={customStar.hrX}
                    cy={customStar.hrY}
                    r="2.4"
                    fill="#22c55e"
                    stroke="#ffffff"
                    strokeWidth="0.6"
                  />
                  <text
                    x={customStar.hrX + 2.5}
                    y={customStar.hrY - 2}
                    fill="#22c55e"
                    fontSize="2.7"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ★ YOUR CUSTOM STAR
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right Col: Selected Star Inspector Card */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Stellar Inspector
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {selectedStar.hrRegion}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-full border border-white/20 flex-shrink-0 flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: selectedStar.colorHex,
                  boxShadow: `0 0 20px ${selectedStar.glowHex}88`,
                }}
              />
              <div>
                <h4 className="text-base font-extrabold text-white">{selectedStar.name}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedStar.spectralType} • {selectedStar.constellation}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedStar.description}</p>

            {/* Astrophysical Parameters Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">Surface Temp</span>
                <span className="font-mono font-bold text-amber-300">
                  {selectedStar.temperatureK.toLocaleString()} K
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">Radius</span>
                <span className="font-mono font-bold text-cyan-300">
                  {selectedStar.radiusSolar} R☉
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">Luminosity</span>
                <span className="font-mono font-bold text-violet-300">
                  {selectedStar.luminositySolar.toLocaleString()} L☉
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-slate-400 block mb-0.5">Mass</span>
                <span className="font-mono font-bold text-emerald-300">
                  {selectedStar.massSolar} M☉
                </span>
              </div>
            </div>

            {/* Did You Know? */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="size-3" />
                Astronomical Note:
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed italic">
                {selectedStar.funFact}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono pt-2 border-t border-white/10 flex justify-between">
            <span>Absolute Mag M: {selectedStar.absoluteMagnitude}</span>
            <span>Dist: {selectedStar.distanceLightYears.toFixed(1)} ly</span>
          </div>
        </div>
      </div>

      {/* 3. "Plot My Custom Star" Sandbox Tool */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="size-4 text-emerald-400" />
              Hypothetical Star Creator: Stefan-Boltzmann Sandbox
            </h4>
            <p className="text-xs text-slate-300">
              Input surface temperature and radius; the physics engine computes luminosity and plots
              your custom star on the HR diagram!
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setShowCustomStar(!showCustomStar);
              onInteracted?.();
            }}
            className={
              showCustomStar
                ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                : "bg-white/10 text-white hover:bg-white/20"
            }
          >
            {showCustomStar ? "Hide Custom Star" : "Plot On Diagram"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Surface Temp (K):</span>
              <span className="font-mono font-bold text-white">
                {customTempK.toLocaleString()} K
              </span>
            </div>
            <input
              type="range"
              min={2500}
              max={35000}
              step={250}
              value={customTempK}
              onChange={(e) => {
                setCustomTempK(Number(e.target.value));
                setShowCustomStar(true);
                onInteracted?.();
              }}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Radius Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Radius (R☉):</span>
              <span className="font-mono font-bold text-white">{customRadiusR} R☉</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={50}
              step={0.1}
              value={customRadiusR}
              onChange={(e) => {
                setCustomRadiusR(Number(e.target.value));
                setShowCustomStar(true);
                onInteracted?.();
              }}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Computed Luminosity */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5">
            <span className="text-[10px] text-slate-400 uppercase block mb-0.5">
              Calculated Luminosity
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {customStar.luminosity >= 1000
                ? customStar.luminosity.toExponential(2)
                : customStar.luminosity.toFixed(2)}{" "}
              L☉
            </span>
          </div>

          {/* Resulting Classification */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-2.5">
            <span className="text-[10px] text-slate-400 uppercase block mb-0.5">
              Resulting Placement
            </span>
            <span className="font-mono font-bold text-cyan-400 text-sm">{customStar.region}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
