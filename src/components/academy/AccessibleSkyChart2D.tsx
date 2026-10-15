import React, { useState, useMemo } from "react";
import {
  PLANETARIUM_STARS,
  PLANETARIUM_CONSTELLATIONS,
  PlanetariumStar,
  PlanetariumConstellation,
} from "@/lib/academy/lessons/module-02-night-sky";
import { Compass, Info, Sparkles, ZoomIn, ZoomOut, RotateCcw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccessibleSkyChart2DProps {
  onSelectStar?: (star: PlanetariumStar) => void;
  onSelectConstellation?: (constellation: PlanetariumConstellation) => void;
  selectedStarId?: string | null;
  selectedConstellationId?: string | null;
}

export function AccessibleSkyChart2D({
  onSelectStar,
  onSelectConstellation,
  selectedStarId,
  selectedConstellationId,
}: AccessibleSkyChart2DProps) {
  const [hemisphere, setHemisphere] = useState<"northern" | "southern">("northern");
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showPointers, setShowPointers] = useState(true);
  const [activeStar, setActiveStar] = useState<PlanetariumStar | null>(null);

  // SVG dimensions
  const size = 520;
  const center = size / 2;
  const radius = center - 35;

  // Filter stars by hemisphere (Northern: Dec >= -20, Southern: Dec <= +20)
  const currentStars = useMemo(() => {
    return PLANETARIUM_STARS.filter((s) => {
      if (hemisphere === "northern") return s.decDeg >= -25;
      return s.decDeg <= 25;
    });
  }, [hemisphere]);

  const starPositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    PLANETARIUM_STARS.forEach((s) => {
      const angle = (s.raHours * 2 * Math.PI) / 24 - Math.PI / 2;
      const rFrac = hemisphere === "northern" ? (90 - s.decDeg) / 115 : (90 + s.decDeg) / 115;
      const r = Math.max(0, Math.min(radius, rFrac * radius));
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      map.set(s.id, { x, y });
    });
    return map;
  }, [hemisphere, radius, center]);

  // Constellations visible in this hemisphere
  const visibleConstellations = useMemo(() => {
    return PLANETARIUM_CONSTELLATIONS.filter((c) => {
      if (hemisphere === "northern")
        return c.hemisphere === "northern" || c.hemisphere === "equatorial";
      return c.hemisphere === "southern" || c.hemisphere === "equatorial";
    });
  }, [hemisphere]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-7 backdrop-blur-xl space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
              Accessible 2D Planisphere
            </span>
            <span className="text-xs text-slate-400">High-Contrast Fallback Sky Chart</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            {hemisphere === "northern"
              ? "Northern Hemisphere Star Wheel"
              : "Southern Hemisphere Star Wheel"}
          </h3>
        </div>

        {/* Hemisphere Toggle & Display Switches */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-white/10">
            <button
              onClick={() => setHemisphere("northern")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hemisphere === "northern"
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Northern Sky (Polaris)
            </button>
            <button
              onClick={() => setHemisphere("southern")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hemisphere === "southern"
                  ? "bg-cyan-500 text-slate-950 shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Southern Sky (Crux)
            </button>
          </div>

          <button
            onClick={() => setShowLines(!showLines)}
            className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
              showLines
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "border-white/10 text-slate-400"
            }`}
          >
            Lines
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
              showLabels
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "border-white/10 text-slate-400"
            }`}
          >
            Labels
          </button>
        </div>
      </div>

      {/* Main 2D Chart SVG Stage */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        <div className="relative flex-shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="w-[320px] sm:w-[420px] md:w-[480px] h-auto rounded-full bg-slate-950 border-2 border-cyan-500/30 shadow-2xl overflow-visible"
            aria-label={`${hemisphere} celestial sphere star chart`}
          >
            {/* Celestial coordinate rings */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1.5"
            />
            <circle
              cx={center}
              cy={center}
              r={radius * 0.75}
              fill="none"
              stroke="#334155"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <circle
              cx={center}
              cy={center}
              r={radius * 0.45}
              fill="none"
              stroke="#334155"
              strokeDasharray="2 3"
              strokeWidth="1"
            />

            {/* Radial RA hour coordinate lines */}
            {[0, 3, 6, 9, 12, 15, 18, 21].map((hr) => {
              const ang = (hr * 2 * Math.PI) / 24 - Math.PI / 2;
              const x2 = center + radius * Math.cos(ang);
              const y2 = center + radius * Math.sin(ang);
              return (
                <line
                  key={hr}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Outer Cardinal Direction Labels */}
            <text
              x={center}
              y={18}
              fill="#f87171"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              {hemisphere === "northern" ? "NORTH (0°)" : "SOUTH (180°)"}
            </text>
            <text
              x={center}
              y={size - 8}
              fill="#38bdf8"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              {hemisphere === "northern" ? "SOUTH" : "NORTH"}
            </text>
            <text
              x={size - 10}
              y={center + 5}
              fill="#38bdf8"
              fontSize="13"
              fontWeight="bold"
              textAnchor="start"
            >
              EAST
            </text>
            <text
              x={10}
              y={center + 5}
              fill="#38bdf8"
              fontSize="13"
              fontWeight="bold"
              textAnchor="end"
            >
              WEST
            </text>

            {/* Constellation Connecting Lines */}
            {showLines &&
              visibleConstellations.map((c) => (
                <g key={c.id}>
                  {c.lines.map(([s1Id, s2Id], i) => {
                    const p1 = starPositions.get(s1Id);
                    const p2 = starPositions.get(s2Id);
                    if (!p1 || !p2) return null;
                    const isSelected = selectedConstellationId === c.id;
                    return (
                      <line
                        key={i}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isSelected ? "#38bdf8" : "#0284c7"}
                        strokeWidth={isSelected ? "2" : "1.2"}
                        strokeOpacity={isSelected ? "0.9" : "0.45"}
                      />
                    );
                  })}
                </g>
              ))}

            {/* Pointer Line for Polaris or Southern Cross */}
            {showPointers && hemisphere === "northern" && (
              <g>
                {/* Pointer line: Merak -> Dubhe -> Polaris */}
                {(() => {
                  const pMerak = starPositions.get("merak");
                  const pDubhe = starPositions.get("dubhe");
                  const pPolaris = starPositions.get("polaris");
                  if (pMerak && pDubhe && pPolaris) {
                    return (
                      <path
                        d={`M ${pMerak.x} ${pMerak.y} L ${pDubhe.x} ${pDubhe.y} L ${pPolaris.x} ${pPolaris.y}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                      />
                    );
                  }
                  return null;
                })()}
              </g>
            )}

            {showPointers && hemisphere === "southern" && (
              <g>
                {/* Southern Cross line: Gacrux -> Acrux */}
                {(() => {
                  const pGacrux = starPositions.get("gacrux");
                  const pAcrux = starPositions.get("acrux");
                  if (pGacrux && pAcrux) {
                    return (
                      <line
                        x1={pGacrux.x}
                        y1={pGacrux.y}
                        x2={pAcrux.x}
                        y2={pAcrux.y}
                        stroke="#f59e0b"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                      />
                    );
                  }
                  return null;
                })()}
              </g>
            )}

            {/* Stars */}
            {currentStars.map((star) => {
              const pos = starPositions.get(star.id);
              if (!pos) return null;
              const r = Math.max(3, 7.5 - star.magnitude * 1.2);
              const isSelected = selectedStarId === star.id || activeStar?.id === star.id;

              return (
                <g
                  key={star.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveStar(star);
                    onSelectStar?.(star);
                  }}
                >
                  {/* Glow circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r + 3}
                    fill={star.colorHex}
                    opacity={isSelected ? "0.6" : "0.15"}
                  />

                  {/* Star core */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={r}
                    fill={star.colorHex}
                    stroke={isSelected ? "#ffffff" : "none"}
                    strokeWidth={isSelected ? "1.5" : "0"}
                  />

                  {/* Star label */}
                  {showLabels && (
                    <text
                      x={pos.x + r + 4}
                      y={pos.y + 3}
                      fill={star.isNavigationalMarker ? "#fde047" : "#cbd5e1"}
                      fontSize={star.isNavigationalMarker ? "11" : "9"}
                      fontWeight={star.isNavigationalMarker ? "bold" : "normal"}
                      fontFamily="monospace"
                    >
                      {star.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Celestial Pole Center Dot */}
            <circle
              cx={center}
              cy={center}
              r="3.5"
              fill={hemisphere === "northern" ? "#f59e0b" : "#38bdf8"}
              stroke="#ffffff"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Informative Side Panel */}
        <div className="flex-1 space-y-4 max-w-sm text-xs">
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Compass className="size-4 text-cyan-400" />
              <span>
                {hemisphere === "northern"
                  ? "Northern Navigational Anchor"
                  : "Southern Navigational Anchor"}
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {hemisphere === "northern" ? (
                <>
                  Follow the gold dashed line from the Big Dipper’s pointer stars (
                  <strong className="text-amber-300">Merak and Dubhe</strong>) straight into{" "}
                  <strong className="text-white">Polaris</strong>. Polaris marks True Geographic
                  North.
                </>
              ) : (
                <>
                  In the southern sky, there is no bright pole star! Navigators follow the vertical
                  beam of the <strong className="text-cyan-300">Southern Cross (Crux)</strong> from
                  Gacrux through Acrux to locate True South.
                </>
              )}
            </p>
          </div>

          {/* Active Star Details Card if selected */}
          {activeStar ? (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{activeStar.name}</span>
                <span className="font-mono text-[10px] text-amber-300">
                  Mag {activeStar.magnitude}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{activeStar.description}</p>
              <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] text-slate-400">
                <span>Constellation: {activeStar.constellation}</span>
                <span>Distance: {activeStar.distanceLy} ly</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-slate-400 text-center">
              Click any star on the chart to inspect its apparent magnitude and distance.
            </div>
          )}

          {/* Constellations Quick List */}
          <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Prominent {hemisphere === "northern" ? "Northern" : "Southern"} Constellations
            </span>
            <div className="space-y-1.5">
              {visibleConstellations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onSelectConstellation?.(c)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedConstellationId === c.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                      : "bg-white/[0.02] text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c.latinName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
