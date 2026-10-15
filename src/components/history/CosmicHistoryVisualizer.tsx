import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Telescope,
  Compass,
  ArrowRight,
  Info,
} from "lucide-react";
import { HistoryChapter, VisualizerModelType } from "@/lib/visible-universe-history-data";

interface VisualizerProps {
  chapter: HistoryChapter;
  className?: string;
  onJumpToChapter?: (id: number) => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  compact?: boolean;
}

export function CosmicHistoryVisualizer({
  chapter,
  className = "",
  onJumpToChapter,
  onMaximize,
  isMaximized = false,
  compact = false,
}: VisualizerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [showGuides, setShowGuides] = useState(true);
  const [activeCompare, setActiveCompare] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [customParam, setCustomParam] = useState<number>(50); // General interactive scrubber
  const [selectedBand, setSelectedBand] = useState<"optical" | "infrared" | "radio" | "xray">(
    "infrared",
  );
  const [timeTick, setTimeTick] = useState(0);

  // IntersectionObserver to pause mathematical loop when scrolled off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "150px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animation frame loop for continuous mathematical motion
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (isPlaying && isInView) {
        setTimeTick((t) => t + dt * speed);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, isInView]);

  // Reset parameters when chapter changes
  useEffect(() => {
    setCustomParam(50);
    setActiveCompare(false);
  }, [chapter.id]);

  const handleReset = () => {
    setTimeTick(0);
    setCustomParam(50);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isZenMode
          ? "fixed inset-4 z-50 rounded-3xl border-cyan-500/40 bg-slate-950/95 backdrop-blur-2xl"
          : className
      }`}
    >
      {/* Top HUD Telemetry Ribbon */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-4 py-2 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden text-slate-300">
          <span className="font-mono text-cyan-400 font-semibold uppercase tracking-wider">
            Ch {chapter.id.toString().padStart(2, "0")}
          </span>
          <span className="text-white/30">/</span>
          <span className="truncate font-medium text-white">{chapter.title}</span>
          <span className="text-white/30 hidden sm:inline">·</span>
          <span className="hidden sm:inline font-mono text-amber-300/90 text-[11px]">
            {chapter.yearDisplay}
          </span>
        </div>

        {/* Viewport controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowGuides((v) => !v)}
            title={showGuides ? "Hide Geometry Guides" : "Show Geometry Guides"}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition ${
              showGuides
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {showGuides ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            <span className="hidden md:inline">Guides</span>
          </button>

          {chapter.compareWith && (
            <button
              type="button"
              onClick={() => setActiveCompare((v) => !v)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition ${
                activeCompare
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Compare</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onMaximize) {
                onMaximize();
              } else {
                setIsZenMode((v) => !v);
              }
            }}
            title={
              isMaximized
                ? "Minimize to standard layout"
                : onMaximize
                  ? "Maximize Chapters View"
                  : isZenMode
                    ? "Exit Zen Fullscreen"
                    : "Zen Fullscreen Mode"
            }
            className={`rounded-md p-1.5 transition ${
              isMaximized || isZenMode
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isMaximized || isZenMode ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Stage */}
      <div
        className={`relative flex-1 w-full bg-[#05070f] overflow-hidden select-none flex items-center justify-center ${
          compact
            ? "h-[200px] sm:h-[240px]"
            : isZenMode
              ? "h-full min-h-[400px]"
              : "h-[260px] xs:h-[300px] sm:h-[330px] lg:h-[340px] xl:h-[380px] max-h-[50vh] min-h-[220px]"
        }`}
      >
        {/* Render Model Graphics */}
        <ModelGraphicDispatcher
          modelType={chapter.modelType}
          time={timeTick}
          showGuides={showGuides}
          activeCompare={activeCompare}
          customParam={customParam}
          selectedBand={selectedBand}
        />

        {/* Floating Parameter Scrubber Overlay for Applicable Models */}
        <ParameterScrubberBar
          modelType={chapter.modelType}
          customParam={customParam}
          setCustomParam={setCustomParam}
          selectedBand={selectedBand}
          setSelectedBand={setSelectedBand}
        />

        {/* Comparative Model Badge if Active */}
        {activeCompare && chapter.compareWith && (
          <div className="absolute top-3 left-3 max-w-xs rounded-xl border border-amber-500/30 bg-slate-950/90 p-2.5 text-xs text-amber-200 backdrop-blur-md shadow-lg pointer-events-none">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Layers className="size-3.5" />
              <span>Model Comparison</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
              {chapter.compareWith.contrast}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Unified Control Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/90 px-4 py-3 text-xs text-slate-300">
        {/* Left: Playback & Speed */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-white hover:bg-white/10 transition"
          >
            {isPlaying ? (
              <Pause className="size-3.5 text-cyan-400" />
            ) : (
              <Play className="size-3.5 text-emerald-400" />
            )}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="Replay from initial epoch"
            className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`rounded px-1.5 py-0.5 font-mono text-[11px] transition ${
                  speed === s
                    ? "bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Center: Model Highlights */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">
            Scientific Focus:
          </span>
          <span className="truncate max-w-sm text-slate-200">
            {chapter.visualHighlights[0] || chapter.summary}
          </span>
        </div>

        {/* Right: Chapter Switcher / Quick Skip */}
        <div className="flex items-center gap-2">
          {chapter.id > 1 && onJumpToChapter && (
            <button
              type="button"
              onClick={() => onJumpToChapter(chapter.id - 1)}
              className="text-[11px] text-slate-400 hover:text-white transition"
            >
              ← Prev
            </button>
          )}
          <span className="font-mono text-[11px] text-cyan-400">{chapter.id} / 26</span>
          {chapter.id < 26 && onJumpToChapter && (
            <button
              type="button"
              onClick={() => onJumpToChapter(chapter.id + 1)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-0.5"
            >
              <span>Next</span> →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// PARAMETER SCRUBBER BAR
// Contextual sliders for chapters with specific adjustable mathematical parameters
// -------------------------------------------------------------------------
function ParameterScrubberBar({
  modelType,
  customParam,
  setCustomParam,
  selectedBand,
  setSelectedBand,
}: {
  modelType: VisualizerModelType;
  customParam: number;
  setCustomParam: (n: number) => void;
  selectedBand: "optical" | "infrared" | "radio" | "xray";
  setSelectedBand: (b: "optical" | "infrared" | "radio" | "xray") => void;
}) {
  if (modelType === "multiwavelength_universe") {
    return (
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/90 px-3 py-1.5 backdrop-blur-md shadow-xl flex items-center gap-1 z-20">
        {(["optical", "infrared", "radio", "xray"] as const).map((band) => (
          <button
            key={band}
            type="button"
            onClick={() => setSelectedBand(band)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition ${
              selectedBand === band
                ? "bg-cyan-500 text-slate-950 shadow"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            {band}
          </button>
        ))}
      </div>
    );
  }

  // Model-specific sliders
  let label = "";
  const min = 0;
  const max = 100;
  let unit = "";

  if (modelType === "spherical_earth_eratosthenes") {
    label = "Solar Angle Separation (Syene ↔ Alexandria)";
    unit = `${((customParam / 100) * 14.4).toFixed(1)}° (Historical: 7.2°)`;
  } else if (modelType === "ptolemaic_epicycles") {
    label = "Epicycle Radius Ratio";
    unit = `${((customParam / 100) * 0.8 + 0.1).toFixed(2)} R`;
  } else if (modelType === "kepler_ellipses") {
    label = "Orbital Eccentricity (e)";
    unit = `${((customParam / 100) * 0.85).toFixed(2)}`;
  } else if (modelType === "newton_universal_gravity") {
    label = "Cannon Initial Velocity (v₀)";
    unit = `${((customParam / 100) * 12 + 2).toFixed(1)} km/s`;
  } else if (modelType === "einstein_spacetime_curvature") {
    label = "Central Mass Density Curvature";
    unit = `${((customParam / 100) * 10).toFixed(1)} M☉`;
  } else if (modelType === "hubble_redshift_expansion") {
    label = "Observer Distance Horizon (d)";
    unit = `${((customParam / 100) * 800 + 50).toFixed(0)} Mpc`;
  } else if (modelType === "dark_matter_cosmic_web") {
    label = "Dark Matter Halo Fraction";
    unit = `${customParam}% Halo Mass`;
  } else if (modelType === "dark_energy_acceleration") {
    label = "Cosmic Scale Time Progress";
    unit = `a(t) = ${((customParam / 100) * 1.5 + 0.2).toFixed(2)}`;
  } else {
    return null;
  }

  return (
    <div className="absolute top-3 right-3 max-w-[240px] rounded-xl border border-white/15 bg-slate-950/85 p-2.5 backdrop-blur-md shadow-xl text-xs z-20">
      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <span className="truncate">{label}</span>
        <span className="text-cyan-300 font-bold shrink-0">{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={customParam}
        onChange={(e) => setCustomParam(Number(e.target.value))}
        className="mt-2 w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
    </div>
  );
}

// -------------------------------------------------------------------------
// MODEL GRAPHIC DISPATCHER
// Routes the chapter modelType to its dedicated animated geometric engine
// -------------------------------------------------------------------------
function ModelGraphicDispatcher({
  modelType,
  time,
  showGuides,
  activeCompare,
  customParam,
  selectedBand,
}: {
  modelType: VisualizerModelType;
  time: number;
  showGuides: boolean;
  activeCompare: boolean;
  customParam: number;
  selectedBand: "optical" | "infrared" | "radio" | "xray";
}) {
  return (
    <svg
      viewBox="-400 -240 800 480"
      className="size-full overflow-hidden text-slate-200"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Gradients */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="marsGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="60%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bigBangGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.7" />
          <stop offset="80%" stopColor="#7c2d12" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blackHoleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="45%" stopColor="#050505" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="75%" stopColor="#d97706" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Starfield */}
      <BackgroundCosmicStars />

      {/* Render Specific Model */}
      {renderModel({
        modelType,
        time,
        showGuides,
        activeCompare,
        customParam,
        selectedBand,
      })}
    </svg>
  );
}

// -------------------------------------------------------------------------
// BACKGROUND STARFIELD
// -------------------------------------------------------------------------
function BackgroundCosmicStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 85 }, (_, i) => ({
      x: ((i * 197) % 780) - 390,
      y: ((i * 131) % 460) - 230,
      r: (i % 3) * 0.45 + 0.6,
      opacity: 0.25 + (i % 5) * 0.12,
    }));
  }, []);

  return (
    <g className="pointer-events-none select-none">
      {stars.map((s, idx) => (
        <circle key={idx} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.opacity} />
      ))}
    </g>
  );
}

// -------------------------------------------------------------------------
// RENDER MODEL ENGINE
// -------------------------------------------------------------------------
function renderModel({
  modelType,
  time,
  showGuides,
  activeCompare,
  customParam,
  selectedBand,
}: {
  modelType: VisualizerModelType;
  time: number;
  showGuides: boolean;
  activeCompare: boolean;
  customParam: number;
  selectedBand: "optical" | "infrared" | "radio" | "xray";
}) {
  switch (modelType) {
    // ---------------------------------------------------------------
    // 1. ANCIENT SKY DOME
    // ---------------------------------------------------------------
    case "ancient_sky_dome": {
      const sunAngle = (time * 0.4) % (Math.PI * 2);
      const sunX = Math.cos(sunAngle) * 260;
      const sunY = -Math.sin(sunAngle) * 160;
      const isDay = sunY < 10;
      const moonAngle = sunAngle + Math.PI * 0.8;
      const moonX = Math.cos(moonAngle) * 250;
      const moonY = -Math.sin(moonAngle) * 150;

      return (
        <g>
          {/* Ground Horizon Arc */}
          <ellipse cx={0} cy={140} rx={340} ry={60} fill="#0d1829" stroke="#1e293b" />
          <path d="M-340 140 Q 0 100 340 140 L 340 240 L -340 240 Z" fill="#09101c" />

          {/* Megalithic Standing Stones Silhouette */}
          <g fill="#040711">
            <rect x={-180} y={90} width={22} height={70} rx={3} />
            <rect x={-140} y={95} width={18} height={65} rx={3} />
            <rect x={-70} y={75} width={26} height={85} rx={4} />
            <rect x={-30} y={75} width={26} height={85} rx={4} />
            {/* Lintel */}
            <rect x={-80} y={65} width={86} height={16} rx={3} />
            <rect x={50} y={85} width={22} height={75} rx={3} />
            <rect x={140} y={90} width={24} height={70} rx={3} />
          </g>

          {/* Celestial Vault Dome */}
          <path
            d="M-300 130 A 300 240 0 0 1 300 130"
            fill="none"
            stroke="#38bdf8"
            strokeOpacity={showGuides ? 0.35 : 0.1}
            strokeDasharray={showGuides ? "4 4" : undefined}
          />

          {/* Solstice Sunrise Sightline Guide */}
          {showGuides && (
            <line
              x1={0}
              y1={130}
              x2={200}
              y2={0}
              stroke="#f59e0b"
              strokeOpacity={0.4}
              strokeDasharray="3 3"
            />
          )}

          {/* Sun Body */}
          {isDay && (
            <g transform={`translate(${sunX}, ${sunY})`}>
              <circle r={32} fill="url(#sunGlow)" filter="url(#softGlow)" />
              <circle r={14} fill="#fef08a" />
            </g>
          )}

          {/* Moon Body */}
          <g transform={`translate(${moonX}, ${moonY})`}>
            <circle r={10} fill="#e2e8f0" opacity={0.9} />
            <circle cx={4} cy={-2} r={8} fill="#05070f" />
          </g>

          {/* Constellation lines */}
          <g stroke="#93c5fd" strokeOpacity={0.4} strokeWidth={1}>
            <line x1={-180} y1={-90} x2={-130} y2={-120} />
            <line x1={-130} y1={-120} x2={-80} y2={-90} />
            <line x1={-80} y1={-90} x2={-40} y2={-110} />
            <circle cx={-180} cy={-90} r={2.5} fill="#fff" />
            <circle cx={-130} cy={-120} r={2.5} fill="#fff" />
            <circle cx={-80} cy={-90} r={2.5} fill="#fff" />
            <circle cx={-40} cy={-110} r={2.5} fill="#fff" />
          </g>

          <text
            x={0}
            y={185}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
            fontFamily="monospace"
          >
            Prehistoric Horizon: Cyclical Solar/Lunar Solstice Tracking
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 2. ANCIENT LAYERED COSMOLOGIES
    // ---------------------------------------------------------------
    case "ancient_layered_worlds": {
      return (
        <g>
          {/* Upper Celestial Waters & Divine Realm */}
          <path
            d="M-320 -150 Q 0 -210 320 -150"
            fill="none"
            stroke="#60a5fa"
            strokeWidth={2}
            strokeOpacity={0.6}
          />
          <text
            x={0}
            y={-175}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize={11}
            fontFamily="monospace"
          >
            Upper Celestial Vault (Anu / Nut's Sky Body)
          </text>

          {/* The Layered Celestial Tracks (Mesopotamian Paths: Enlil, Anu, Ea) */}
          {[-100, -50, 0].map((y, idx) => (
            <g key={idx}>
              <path
                d={`M-300 ${y} Q 0 ${y - 45} 300 ${y}`}
                fill="none"
                stroke="#38bdf8"
                strokeOpacity={showGuides ? 0.3 + idx * 0.1 : 0.15}
                strokeDasharray="4 4"
              />
              <circle
                cx={Math.cos(time * 0.6 + idx * 2) * 220}
                cy={y - 30 + Math.sin(time * 0.6 + idx * 2) * 15}
                r={6}
                fill={idx === 0 ? "#f59e0b" : idx === 1 ? "#38bdf8" : "#f43f5e"}
              />
            </g>
          ))}

          {/* Egyptian Solar Barque Journeying Across the Sky */}
          <g transform={`translate(${Math.cos(time * 0.3) * 180}, -110)`}>
            <path d="M-28 6 Q 0 16 28 6 Q 20 22 -20 22 Z" fill="#d97706" />
            <circle cx={0} cy={-2} r={10} fill="url(#sunGlow)" />
          </g>

          {/* Inhabited Terrestrial World */}
          <ellipse
            cx={0}
            cy={70}
            rx={260}
            ry={35}
            fill="#1e293b"
            stroke="#334155"
            strokeWidth={2}
          />
          <ellipse cx={0} cy={70} rx={180} ry={22} fill="#047857" opacity={0.8} />
          <text x={0} y={75} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight="bold">
            Inhabited Terrestrial Realm (Geb / Earth)
          </text>

          {/* Underworld / Abyss (Apsu) */}
          <path d="M-260 70 C -180 180, 180 180, 260 70" fill="#090d16" stroke="#1e293b" />
          <text
            x={0}
            y={145}
            textAnchor="middle"
            fill="#64748b"
            fontSize={11}
            fontFamily="monospace"
          >
            Primordial Abyss & Underworld Waters
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 3. FLAT DISK VS SPHERE
    // ---------------------------------------------------------------
    case "flat_disk_vs_sphere": {
      const showSphere = activeCompare || customParam > 50;

      if (!showSphere) {
        // Flat disk model demonstration
        return (
          <g>
            <ellipse
              cx={0}
              cy={40}
              rx={260}
              ry={45}
              fill="#0e3a5a"
              stroke="#38bdf8"
              strokeOpacity={0.6}
            />
            <ellipse cx={0} cy={40} rx={180} ry={30} fill="#15803d" />
            {/* Encircling Ocean River */}
            <text
              x={0}
              y={110}
              textAnchor="middle"
              fill="#38bdf8"
              fontSize={11}
              fontFamily="monospace"
            >
              Encircling Oceanus (Peripheral Abyss)
            </text>

            {/* Solid Sky Canopy */}
            <path
              d="M-260 40 A 260 200 0 0 1 260 40"
              fill="none"
              stroke="#93c5fd"
              strokeOpacity={0.5}
              strokeDasharray="4 4"
            />
            <circle cx={-180} cy={-40} r={16} fill="url(#sunGlow)" />
            <text
              x={0}
              y={160}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={11}
              fontFamily="monospace"
            >
              Inhabited Disk Hypothesis (Does not explain ship hull cut-off or eclipses)
            </text>
          </g>
        );
      }

      // Spherical Earth with Horizon Dip & Ship Disappearance
      const shipProg = (time * 0.15) % 1;
      const shipAngle = -Math.PI * 0.45 + shipProg * Math.PI * 0.5;
      const shipR = 150;
      const shipX = Math.cos(shipAngle) * shipR;
      const shipY = Math.sin(shipAngle) * shipR;

      return (
        <g>
          {/* Earth Sphere */}
          <circle cx={0} cy={80} r={150} fill="#1e3a8a" stroke="#60a5fa" strokeWidth={2} />
          {/* Continents arc */}
          <ellipse cx={-40} cy={20} rx={70} ry={40} fill="#047857" opacity={0.7} />
          <ellipse cx={50} cy={50} rx={60} ry={35} fill="#047857" opacity={0.7} />

          {/* Observer on Top */}
          <line x1={0} y1={-70} x2={0} y2={-90} stroke="#fde047" strokeWidth={2} />
          <circle cx={0} cy={-92} r={4} fill="#fde047" />

          {/* Tangent Sightline Horizon */}
          {showGuides && (
            <line
              x1={-260}
              y1={-70}
              x2={260}
              y2={-70}
              stroke="#38bdf8"
              strokeOpacity={0.4}
              strokeDasharray="4 4"
            />
          )}

          {/* Ship Sailing Over Curvature */}
          <g
            transform={`translate(${shipX}, ${shipY}) rotate(${(shipAngle * 180) / Math.PI + 90})`}
          >
            {/* Hull dips below line */}
            <path d="M-12 0 L12 0 L8 8 L-8 8 Z" fill="#d97706" />
            <line x1={0} y1={0} x2={0} y2={-16} stroke="#f8fafc" strokeWidth={2} />
            <polygon points="0,-14 10,-8 0,-2" fill="#e2e8f0" />
          </g>

          <text
            x={0}
            y={190}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            Spherical Curvature: Ships disappear hull-first below horizon
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 4. SPHERICAL EARTH & ERATOSTHENES
    // ---------------------------------------------------------------
    case "spherical_earth_eratosthenes": {
      const angleDeg = (customParam / 100) * 14.4; // 0 to 14.4 deg, centered on 7.2
      const angleRad = (angleDeg * Math.PI) / 180;
      const R = 140;

      // Alexandria and Syene positions on globe
      const syeneAngle = Math.PI * 0.5; // Directly beneath overhead sun
      const alexAngle = syeneAngle - angleRad;

      const alexX = Math.cos(alexAngle) * R;
      const alexY = -Math.sin(alexAngle) * R;
      const syeneX = Math.cos(syeneAngle) * R;
      const syeneY = -Math.sin(syeneAngle) * R;

      return (
        <g>
          {/* Earth Globe */}
          <circle cx={0} cy={40} r={R} fill="#172554" stroke="#38bdf8" strokeWidth={2} />
          {/* Latitude lines */}
          <ellipse cx={0} cy={40} rx={R} ry={35} fill="none" stroke="#60a5fa" strokeOpacity={0.3} />

          {/* Parallel Solar Rays */}
          {[-80, 0, 80].map((offset) => (
            <line
              key={offset}
              x1={offset}
              y1={-200}
              x2={offset}
              y2={-80}
              stroke="#fbbf24"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeDasharray="4 4"
            />
          ))}

          {/* Syene Pillar (No Shadow at Summer Solstice Noon) */}
          <line
            x1={syeneX}
            y1={syeneY + 40}
            x2={syeneX}
            y2={syeneY + 40 - 30}
            stroke="#f8fafc"
            strokeWidth={3}
          />
          <text
            x={syeneX + 10}
            y={syeneY + 40 - 15}
            fill="#fde047"
            fontSize={10}
            fontFamily="monospace"
          >
            Syene (Sun directly overhead)
          </text>

          {/* Alexandria Pillar (Casts Shadow) */}
          <line
            x1={alexX}
            y1={alexY + 40}
            x2={alexX + Math.cos(alexAngle) * 30}
            y2={alexY + 40 - Math.sin(alexAngle) * 30}
            stroke="#f8fafc"
            strokeWidth={3}
          />
          {/* Shadow angle arc */}
          {showGuides && (
            <g>
              <line
                x1={0}
                y1={40}
                x2={alexX}
                y2={alexY + 40}
                stroke="#38bdf8"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
              />
              <line
                x1={0}
                y1={40}
                x2={syeneX}
                y2={syeneY + 40}
                stroke="#38bdf8"
                strokeOpacity={0.5}
                strokeDasharray="3 3"
              />
            </g>
          )}

          <text
            x={alexX - 10}
            y={alexY + 40 - 35}
            textAnchor="end"
            fill="#38bdf8"
            fontSize={10}
            fontFamily="monospace"
          >
            Alexandria (Shadow angle θ = {angleDeg.toFixed(1)}°)
          </text>

          {/* Geometry Formula Box */}
          <rect
            x={-180}
            y={150}
            width={360}
            height={45}
            rx={8}
            fill="#090d16"
            stroke="#38bdf8"
            strokeOpacity={0.4}
          />
          <text x={0} y={170} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight="bold">
            Arc / Circumference = θ / 360° = 1 / 50th of a circle
          </text>
          <text
            x={0}
            y={185}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={10}
            fontFamily="monospace"
          >
            5,000 stadia × 50 = 250,000 stadia ≈ 40,000 km
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 5. GREEK HOMOCENTRIC SPHERES (EUDOXUS)
    // ---------------------------------------------------------------
    case "greek_homocentric_spheres": {
      const t = time * 0.7;
      // Hippopede curve simulation: combined rotation on inclined axes
      const R = 150;
      const pts = Array.from({ length: 120 }, (_, k) => {
        const theta = (k / 120) * Math.PI * 2;
        const x = Math.sin(theta) * 110;
        const y = Math.sin(theta) * Math.cos(theta) * 45;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");

      const planetX = Math.sin(t) * 110;
      const planetY = Math.sin(t) * Math.cos(t) * 45;

      return (
        <g>
          {/* Earth at the center */}
          <circle cx={0} cy={0} r={18} fill="url(#earthGlow)" stroke="#60a5fa" />
          <text
            x={0}
            y={32}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize={10}
            fontFamily="monospace"
          >
            Central Earth
          </text>

          {/* Concentric Spheres Ring */}
          {[80, 120, 160].map((r, idx) => (
            <ellipse
              key={r}
              cx={0}
              cy={0}
              rx={r}
              ry={r * 0.7}
              fill="none"
              stroke="#818cf8"
              strokeOpacity={0.25 + idx * 0.15}
              strokeWidth={1.5}
            />
          ))}

          {/* Hippopede figure-8 retrograde loop */}
          {showGuides && (
            <polyline
              points={pts}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
          )}

          {/* Orbiting Planet on Hippopede */}
          <g transform={`translate(${planetX}, ${planetY})`}>
            <circle r={8} fill="url(#marsGlow)" />
            <circle r={14} fill="none" stroke="#f43f5e" strokeOpacity={0.4} />
          </g>

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize={11}
            fontFamily="monospace"
          >
            Eudoxus' Hippopede: Nested Spheres generating Figure-8 Retrograde Loops
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 6. ARISTARCHUS HELIOCENTRIC PROPOSAL
    // ---------------------------------------------------------------
    case "aristarchus_heliocentric": {
      const earthAngle = time * 0.5;
      const earthR = 140;
      const earthX = Math.cos(earthAngle) * earthR;
      const earthY = Math.sin(earthAngle) * earthR * 0.6;

      return (
        <g>
          {/* Central Sun */}
          <circle cx={0} cy={0} r={36} fill="url(#sunGlow)" filter="url(#softGlow)" />
          <text x={0} y={50} textAnchor="middle" fill="#fde047" fontSize={11} fontWeight="bold">
            Sun at Center
          </text>

          {/* Earth's Orbit */}
          <ellipse
            cx={0}
            cy={0}
            rx={earthR}
            ry={earthR * 0.6}
            fill="none"
            stroke="#38bdf8"
            strokeOpacity={0.4}
          />

          {/* Earth moving and spinning */}
          <g transform={`translate(${earthX}, ${earthY})`}>
            <circle r={10} fill="url(#earthGlow)" />
            <line
              x1={-12}
              y1={0}
              x2={12}
              y2={0}
              stroke="#fff"
              strokeOpacity={0.6}
              transform={`rotate(${time * 180})`}
            />
          </g>

          {/* Distant fixed stars showing lack of parallax */}
          {showGuides && (
            <g stroke="#94a3b8" strokeOpacity={0.3} strokeDasharray="3 3">
              <line x1={earthX} y1={earthY} x2={-320} y2={-160} />
              <line x1={0} y1={0} x2={-320} y2={-160} />
              <circle cx={-320} cy={-160} r={3} fill="#fff" />
              <text x={-310} y={-170} fill="#cbd5e1" fontSize={10} fontFamily="monospace">
                Distant Star (Zero Measurable Parallax)
              </text>
            </g>
          )}

          <text
            x={0}
            y={175}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
            fontFamily="monospace"
          >
            Aristarchus (c. 270 BCE): Sun-centered cosmos rejected due to undetectable stellar
            parallax
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 7. PTOLEMY'S EPICYCLES & DEFERENT
    // ---------------------------------------------------------------
    case "ptolemaic_epicycles": {
      const deferentR = 150;
      const epicycleRatio = (customParam / 100) * 0.6 + 0.2; // 0.2 to 0.8
      const epicycleR = deferentR * epicycleRatio;

      const deferentAngle = time * 0.4;
      const epicycleAngle = -time * 1.6; // Counter-rotation creates retrograde loop

      const guideX = Math.cos(deferentAngle) * deferentR;
      const guideY = Math.sin(deferentAngle) * deferentR * 0.6;

      const planetX = guideX + Math.cos(epicycleAngle) * epicycleR;
      const planetY = guideY + Math.sin(epicycleAngle) * epicycleR * 0.6;

      // Trajectory trace of apparent motion
      const pathPts = Array.from({ length: 180 }, (_, k) => {
        const a = (k / 180) * Math.PI * 4;
        const gx = Math.cos(a * 0.25) * deferentR;
        const gy = Math.sin(a * 0.25) * deferentR * 0.6;
        const px = gx + Math.cos(-a) * epicycleR;
        const py = gy + Math.sin(-a) * epicycleR * 0.6;
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(" ");

      return (
        <g>
          {/* Stationary Earth off-center (Eccentric) */}
          <circle cx={-20} cy={0} r={14} fill="url(#earthGlow)" />
          <text
            x={-20}
            y={26}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize={10}
            fontFamily="monospace"
          >
            Earth (Eccentric)
          </text>

          {/* Equant Point */}
          {showGuides && (
            <g>
              <circle cx={20} cy={0} r={3} fill="#f59e0b" />
              <text
                x={20}
                y={-10}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize={9}
                fontFamily="monospace"
              >
                Equant
              </text>
            </g>
          )}

          {/* Large Deferent Circle */}
          <ellipse
            cx={0}
            cy={0}
            rx={deferentR}
            ry={deferentR * 0.6}
            fill="none"
            stroke="#64748b"
            strokeWidth={1.5}
            strokeOpacity={0.4}
          />

          {/* Looping Planet Path */}
          {showGuides && (
            <polyline
              points={pathPts}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeOpacity={0.5}
            />
          )}

          {/* Epicycle Guide Circle */}
          <ellipse
            cx={guideX}
            cy={guideY}
            rx={epicycleR}
            ry={epicycleR * 0.6}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />

          {/* Connecting Radius Line */}
          <line
            x1={guideX}
            y1={guideY}
            x2={planetX}
            y2={planetY}
            stroke="#f59e0b"
            strokeOpacity={0.6}
          />

          {/* Moving Planet (Mars) */}
          <g transform={`translate(${planetX}, ${planetY})`}>
            <circle r={8} fill="url(#marsGlow)" />
            <circle r={14} fill="none" stroke="#ef4444" strokeOpacity={0.4} />
          </g>

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize={11}
            fontFamily="monospace"
          >
            Ptolemy: Mars on an Epicycle revolving along the Deferent to produce Retrograde Motion
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 8. MEDIEVAL WORLD & TUSI COUPLE
    // ---------------------------------------------------------------
    case "medieval_tusi_couple": {
      const R = 110;
      const r = R / 2;
      const theta = time * 0.8;

      // Center of small circle revolves around (0,0) at radius r
      const smallCenterX = Math.cos(theta) * r;
      const smallCenterY = Math.sin(theta) * r;

      // Point on small circle rim rotates in opposite direction at twice angular speed
      // x = R * cos(theta), y = 0 (exact linear harmonic motion!)
      const linearX = R * Math.cos(theta);
      const linearY = 0;

      return (
        <g>
          {/* Large Fixed Base Circle (Radius R) */}
          <circle
            cx={0}
            cy={0}
            r={R}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeOpacity={0.5}
          />

          {/* Diameter track along which point oscillates */}
          <line
            x1={-R}
            y1={0}
            x2={R}
            y2={0}
            stroke="#94a3b8"
            strokeOpacity={0.4}
            strokeDasharray="4 4"
          />

          {/* Small Rolling Circle (Radius R/2) */}
          <circle
            cx={smallCenterX}
            cy={smallCenterY}
            r={r}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
          />

          {/* Center of small circle */}
          <circle cx={smallCenterX} cy={smallCenterY} r={3} fill="#f59e0b" />

          {/* Linear Oscillating Point */}
          <circle cx={linearX} cy={linearY} r={7} fill="#ef4444" filter="url(#softGlow)" />
          <line
            x1={smallCenterX}
            y1={smallCenterY}
            x2={linearX}
            y2={linearY}
            stroke="#ef4444"
            strokeWidth={1.5}
          />

          {/* Astrolabe degree markings around perimeter */}
          {Array.from({ length: 36 }, (_, idx) => {
            const a = (idx / 36) * Math.PI * 2;
            const x1 = Math.cos(a) * R;
            const y1 = Math.sin(a) * R;
            const x2 = Math.cos(a) * (R + (idx % 3 === 0 ? 8 : 4));
            const y2 = Math.sin(a) * (R + (idx % 3 === 0 ? 8 : 4));
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#38bdf8"
                strokeOpacity={0.5}
              />
            );
          })}

          <text x={0} y={-140} textAnchor="middle" fill="#38bdf8" fontSize={12} fontWeight="bold">
            Nasir al-Din al-Tusi's Mathematical Couple (Maragha Observatory, 1261 CE)
          </text>
          <text
            x={0}
            y={160}
            textAnchor="middle"
            fill="#fde047"
            fontSize={11}
            fontFamily="monospace"
          >
            Pure circular rotations produce exact linear harmonic oscillation
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 9. COPERNICAN HELIOCENTRIC SYSTEM
    // ---------------------------------------------------------------
    case "copernican_heliocentric": {
      const earthA = time * 0.7;
      const marsA = time * 0.37; // Slower outer orbit

      const earthR = 100;
      const marsR = 170;

      const earthX = Math.cos(earthA) * earthR;
      const earthY = Math.sin(earthA) * earthR * 0.6;

      const marsX = Math.cos(marsA) * marsR;
      const marsY = Math.sin(marsA) * marsR * 0.6;

      // Sightline projected against distant star background
      const dx = marsX - earthX;
      const dy = marsY - earthY;
      const projDist = 300;
      const projLen = Math.sqrt(dx * dx + dy * dy);
      const projX = earthX + (dx / projLen) * projDist;
      const projY = earthY + (dy / projLen) * projDist;

      return (
        <g>
          {/* Central Sun */}
          <circle cx={0} cy={0} r={28} fill="url(#sunGlow)" filter="url(#softGlow)" />
          <text x={0} y={42} textAnchor="middle" fill="#fde047" fontSize={11} fontWeight="bold">
            Sun
          </text>

          {/* Orbits */}
          <ellipse
            cx={0}
            cy={0}
            rx={earthR}
            ry={earthR * 0.6}
            fill="none"
            stroke="#38bdf8"
            strokeOpacity={0.4}
          />
          <ellipse
            cx={0}
            cy={0}
            rx={marsR}
            ry={marsR * 0.6}
            fill="none"
            stroke="#f87171"
            strokeOpacity={0.4}
          />

          {/* Earth */}
          <g transform={`translate(${earthX}, ${earthY})`}>
            <circle r={9} fill="url(#earthGlow)" />
          </g>

          {/* Mars */}
          <g transform={`translate(${marsX}, ${marsY})`}>
            <circle r={8} fill="url(#marsGlow)" />
          </g>

          {/* Sightline Projection */}
          {showGuides && (
            <g>
              <line
                x1={earthX}
                y1={earthY}
                x2={projX}
                y2={projY}
                stroke="#fde047"
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
              <circle cx={projX} cy={projY} r={5} fill="#fde047" />
              <text
                x={projX}
                y={projY - 10}
                textAnchor="middle"
                fill="#fde047"
                fontSize={9}
                fontFamily="monospace"
              >
                Apparent Position
              </text>
            </g>
          )}

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            Copernicus (1543): Faster Earth overtaking Mars creates retrograde perspective illusion
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 10. TYCHO BRAHE'S GEOHELIOCENTRIC SYSTEM
    // ---------------------------------------------------------------
    case "tycho_geoheliocentric": {
      const sunA = time * 0.5;
      const sunR = 110;
      const sunX = Math.cos(sunA) * sunR;
      const sunY = Math.sin(sunA) * sunR * 0.6;

      const planetA = time * 1.4;
      const planetR = 60;
      const planetX = sunX + Math.cos(planetA) * planetR;
      const planetY = sunY + Math.sin(planetA) * planetR * 0.6;

      return (
        <g>
          {/* Stationary Earth at center */}
          <circle cx={0} cy={0} r={16} fill="url(#earthGlow)" />
          <text
            x={0}
            y={30}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize={10}
            fontFamily="monospace"
          >
            Stationary Earth
          </text>

          {/* Sun's Orbit around Earth */}
          <ellipse
            cx={0}
            cy={0}
            rx={sunR}
            ry={sunR * 0.6}
            fill="none"
            stroke="#f59e0b"
            strokeOpacity={0.5}
            strokeDasharray="4 4"
          />

          {/* Orbiting Sun */}
          <g transform={`translate(${sunX}, ${sunY})`}>
            <circle r={22} fill="url(#sunGlow)" filter="url(#softGlow)" />
            {/* Planets orbiting the Sun */}
            <ellipse
              cx={0}
              cy={0}
              rx={planetR}
              ry={planetR * 0.6}
              fill="none"
              stroke="#ef4444"
              strokeOpacity={0.5}
            />
          </g>

          {/* Planet Orbiting Mobile Sun */}
          <g transform={`translate(${planetX}, ${planetY})`}>
            <circle r={6} fill="url(#marsGlow)" />
          </g>

          <text
            x={0}
            y={165}
            textAnchor="middle"
            fill="#fde047"
            fontSize={11}
            fontFamily="monospace"
          >
            Tychonic Model: Earth central, Sun orbits Earth, while planets orbit the moving Sun
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 11. KEPLER'S ELLIPTICAL ORBITS & SWEPT AREA
    // ---------------------------------------------------------------
    case "kepler_ellipses": {
      const ecc = (customParam / 100) * 0.7 + 0.1; // Eccentricity 0.1 to 0.8
      const a = 160; // Semi-major axis
      const b = a * Math.sqrt(1 - ecc * ecc); // Semi-minor axis
      const c = a * ecc; // Focus offset from center

      // Kepler's equation approximation for variable velocity
      const meanAnomaly = time * 0.8;
      // Approximate true anomaly nu
      const nu =
        meanAnomaly +
        2 * ecc * Math.sin(meanAnomaly) +
        1.25 * ecc * ecc * Math.sin(2 * meanAnomaly);

      // Distance from focus: r = a(1 - e^2) / (1 + e*cos(nu))
      const rOrb = (a * (1 - ecc * ecc)) / (1 + ecc * Math.cos(nu));
      const planetX = -c + rOrb * Math.cos(nu);
      const planetY = rOrb * Math.sin(nu) * (b / a);

      return (
        <g>
          {/* Ellipse Orbit */}
          <ellipse
            cx={-c}
            cy={0}
            rx={a}
            ry={b}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeOpacity={0.6}
          />

          {/* Sun at Focus 1 */}
          <g transform="translate(0, 0)">
            <circle r={24} fill="url(#sunGlow)" filter="url(#softGlow)" />
            <text x={0} y={36} textAnchor="middle" fill="#fde047" fontSize={10} fontWeight="bold">
              Sun (Focus 1)
            </text>
          </g>

          {/* Empty Focus 2 */}
          {showGuides && (
            <g transform={`translate(${-2 * c}, 0)`}>
              <circle r={3} fill="#94a3b8" />
              <text
                x={0}
                y={-8}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize={9}
                fontFamily="monospace"
              >
                Focus 2
              </text>
            </g>
          )}

          {/* Swept Area Sector (Kepler's Second Law) */}
          {showGuides && (
            <path
              d={`M0 0 L${planetX} ${planetY} A ${a} ${b} 0 0 1 ${planetX - 35 * Math.sin(nu)} ${planetY + 35 * Math.cos(nu)} Z`}
              fill="#38bdf8"
              fillOpacity={0.2}
            />
          )}

          {/* Planet */}
          <g transform={`translate(${planetX}, ${planetY})`}>
            <circle r={9} fill="url(#earthGlow)" />
          </g>

          <text x={0} y={155} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">
            Kepler's Laws: 1st (Ellipses, Sun at Focus) · 2nd (Equal Areas in Equal Times)
          </text>
          <text
            x={0}
            y={175}
            textAnchor="middle"
            fill="#fde047"
            fontSize={10}
            fontFamily="monospace"
          >
            Orbital Speed varies: Fastest at perihelion (closest), slowest at aphelion
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 12. GALILEO'S TELESCOPIC UNIVERSE
    // ---------------------------------------------------------------
    case "galileo_telescope": {
      // Split view: Jupiter's 4 Moons on left, Venus Phases on right
      return (
        <g>
          {/* Left Panel: Jupiter & 4 Galilean Moons */}
          <g transform="translate(-180, 0)">
            <circle r={28} fill="#eab308" opacity={0.9} />
            {/* Atmospheric stripes */}
            <path d="M-26 -6 Q 0 -12 26 -6" stroke="#ca8a04" strokeWidth={3} fill="none" />
            <path d="M-26 8 Q 0 4 26 8" stroke="#ca8a04" strokeWidth={3} fill="none" />
            <text x={0} y={45} textAnchor="middle" fill="#fde047" fontSize={11} fontWeight="bold">
              Jupiter & 4 Moons
            </text>

            {/* Galilean Moons Orbiting (Io, Europa, Ganymede, Callisto) */}
            {[
              { name: "Io", r: 50, speed: 2.2, color: "#fef08a" },
              { name: "Europa", r: 75, speed: 1.5, color: "#93c5fd" },
              { name: "Ganymede", r: 105, speed: 1.0, color: "#cbd5e1" },
              { name: "Callisto", r: 135, speed: 0.6, color: "#64748b" },
            ].map((m) => {
              const mx = Math.cos(time * m.speed) * m.r;
              return (
                <g key={m.name}>
                  <line
                    x1={-m.r}
                    y1={0}
                    x2={m.r}
                    y2={0}
                    stroke="#475569"
                    strokeDasharray="2 2"
                    strokeOpacity={0.4}
                  />
                  <circle cx={mx} cy={0} r={4} fill={m.color} />
                  <text
                    x={mx}
                    y={-8}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {m.name}
                  </text>
                </g>
              );
            })}
          </g>

          <line x1={0} y1={-180} x2={0} y2={180} stroke="#334155" strokeDasharray="4 4" />

          {/* Right Panel: Venus Phases */}
          <g transform="translate(180, 0)">
            <text x={0} y={-110} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">
              Venus Phases (Telescopic Proof)
            </text>
            <circle cx={0} cy={0} r={22} fill="url(#sunGlow)" />

            {/* Venus cycling phases around Sun */}
            {[-70, 0, 70].map((vx, idx) => {
              const vy = idx === 1 ? -60 : 40;
              return (
                <g key={idx} transform={`translate(${vx}, ${vy})`}>
                  <circle r={12} fill="#05070f" stroke="#38bdf8" strokeWidth={1} />
                  {/* Phase crescent */}
                  <path d="M0 -12 A 12 12 0 0 1 0 12 A 6 12 0 0 0 0 -12 Z" fill="#f8fafc" />
                </g>
              );
            })}
            <text
              x={0}
              y={110}
              textAnchor="middle"
              fill="#cbd5e1"
              fontSize={10}
              fontFamily="monospace"
            >
              Shows full phase cycle: Only possible if Venus orbits the Sun
            </text>
          </g>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 13. NEWTON'S UNIVERSAL GRAVITATION
    // ---------------------------------------------------------------
    case "newton_universal_gravity": {
      const v0Norm = customParam / 100; // 0 to 1
      const R_earth = 90;

      // Projectile trajectory from high mountain
      const mountainY = -R_earth;
      return (
        <g>
          {/* Earth Body */}
          <circle cx={0} cy={60} r={R_earth} fill="#1e3a8a" stroke="#60a5fa" strokeWidth={2} />
          {/* Continents */}
          <ellipse cx={-20} cy={40} rx={45} ry={25} fill="#047857" opacity={0.8} />

          {/* Newton's Cannon on Mountain Top */}
          <line
            x1={0}
            y1={60 - R_earth}
            x2={0}
            y2={60 - R_earth - 15}
            stroke="#d97706"
            strokeWidth={3}
          />
          <rect x={-4} y={60 - R_earth - 20} width={8} height={6} fill="#94a3b8" />

          {/* Trajectory comparison: Sub-orbital, Circular, Escape */}
          {/* Suborbital path */}
          <path
            d="M0 -45 Q 90 -40 75 35"
            fill="none"
            stroke="#f43f5e"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={v0Norm < 0.4 ? 1 : 0.3}
          />

          {/* Circular orbit (v = sqrt(GM/R)) */}
          <circle
            cx={0}
            cy={60}
            r={R_earth + 25}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            opacity={v0Norm >= 0.4 && v0Norm <= 0.7 ? 1 : 0.4}
          />

          {/* Escape hyperbola (v > sqrt(2)*v_c) */}
          <path
            d="M0 -45 Q 160 -45 280 -180"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2}
            opacity={v0Norm > 0.7 ? 1 : 0.3}
          />

          {/* Animated cannonball projectile */}
          <circle
            cx={Math.cos(time * 1.5) * (R_earth + 25)}
            cy={60 + Math.sin(time * 1.5) * (R_earth + 25)}
            r={5}
            fill="#fde047"
          />

          <text x={0} y={185} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">
            Newton's Orbital Cannon: Continuous free-fall unites falling apples with orbiting Moons
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 14. HERSCHEL'S MILKY WAY & BESSEL'S PARALLAX
    // ---------------------------------------------------------------
    case "herschel_bessel_milkyway": {
      return (
        <g>
          {/* Herschel's Historic Flattened Grindstone Star Cluster */}
          <g opacity={0.85}>
            {Array.from({ length: 90 }, (_, k) => {
              const theta = (k * 137.5 * Math.PI) / 180;
              const r = 20 + Math.sqrt(k) * 18;
              const x = Math.cos(theta) * r * 1.6;
              const y = Math.sin(theta) * r * 0.45;
              return <circle key={k} cx={x} cy={y - 40} r={1.2} fill="#cbd5e1" opacity={0.7} />;
            })}
          </g>

          <circle cx={-15} cy={-40} r={4} fill="#fde047" />
          <text
            x={-15}
            y={-52}
            textAnchor="middle"
            fill="#fde047"
            fontSize={9}
            fontFamily="monospace"
          >
            Sun (Herschel's Location)
          </text>

          {/* Bessel's Parallax Triangle at Bottom */}
          <g transform="translate(0, 100)">
            <ellipse
              cx={0}
              cy={30}
              rx={100}
              ry={25}
              fill="none"
              stroke="#38bdf8"
              strokeOpacity={0.4}
            />
            <circle cx={-80} cy={30} r={5} fill="#38bdf8" />
            <circle cx={80} cy={30} r={5} fill="#38bdf8" />
            <text
              x={0}
              y={50}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={9}
              fontFamily="monospace"
            >
              Earth Orbit Baseline (2 AU)
            </text>

            {/* Sightlines to 61 Cygni */}
            <line
              x1={-80}
              y1={30}
              x2={0}
              y2={-50}
              stroke="#f59e0b"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
            />
            <line
              x1={80}
              y1={30}
              x2={0}
              y2={-50}
              stroke="#f59e0b"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
            />
            <circle cx={0} cy={-50} r={5} fill="#f59e0b" />
            <text x={0} y={-60} textAnchor="middle" fill="#fde047" fontSize={10} fontWeight="bold">
              61 Cygni (Parallax p = 0.314'' → 10.3 ly)
            </text>
          </g>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 15. SHAPLEY–CURTIS DEBATE & ISLAND UNIVERSES
    // ---------------------------------------------------------------
    case "shapley_curtis_debate": {
      return (
        <g>
          {/* Milky Way Disk */}
          <ellipse
            cx={-130}
            cy={0}
            rx={120}
            ry={45}
            fill="#1e1b4b"
            stroke="#818cf8"
            strokeOpacity={0.5}
          />
          {/* Spiral arms stars */}
          <circle cx={-130} cy={0} r={16} fill="url(#sunGlow)" opacity={0.6} />
          <circle cx={-80} cy={5} r={3} fill="#fde047" />
          <text
            x={-80}
            y={-6}
            textAnchor="middle"
            fill="#fde047"
            fontSize={8}
            fontFamily="monospace"
          >
            Sun
          </text>
          <text x={-130} y={65} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight="bold">
            Milky Way Galaxy
          </text>

          {/* Andromeda Galaxy M31 (External Island Universe) */}
          <g transform="translate(160, -30) rotate(-25)">
            <ellipse
              cx={0}
              cy={0}
              rx={95}
              ry={35}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeOpacity={0.6}
            />
            <circle cx={0} cy={0} r={14} fill="url(#sunGlow)" opacity={0.7} />
            {/* Cepheid V1 pulsating */}
            <circle
              cx={45}
              cy={-10}
              r={4 + Math.sin(time * 3) * 1.5}
              fill="#ef4444"
              filter="url(#softGlow)"
            />
            <text
              x={45}
              y={-20}
              textAnchor="middle"
              fill="#f87171"
              fontSize={9}
              fontFamily="monospace"
            >
              Cepheid V1
            </text>
          </g>
          <text x={160} y={65} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">
            Andromeda Galaxy (2.5M ly away)
          </text>

          {/* Leavitt Period-Luminosity Distance Bridge */}
          <line
            x1={-30}
            y1={0}
            x2={80}
            y2={-20}
            stroke="#fde047"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <text
            x={25}
            y={-26}
            textAnchor="middle"
            fill="#fde047"
            fontSize={9}
            fontFamily="monospace"
          >
            2.5 Million Light-Years
          </text>

          <text
            x={0}
            y={165}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
            fontFamily="monospace"
          >
            1924: Hubble settles the debate using Cepheids, proving spiral nebulae are external
            galaxies
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 16. EINSTEIN'S SPACETIME CURVATURE
    // ---------------------------------------------------------------
    case "einstein_spacetime_curvature": {
      const massScale = (customParam / 100) * 80 + 30;

      // 4D Spacetime Curvature Grid Dip
      const gridLines = Array.from({ length: 15 }, (_, k) => {
        const y = -120 + k * 18;
        const d =
          `M -280 ${y} ` +
          Array.from({ length: 29 }, (_, j) => {
            const x = -280 + j * 20;
            const distSq = x * x + y * y;
            const dip = massScale * Math.exp(-distSq / 14000);
            return `L ${x} ${y + dip}`;
          }).join(" ");
        return d;
      });

      // Deflected Starlight Path
      const rayPath = `M -260 -70 Q 0 ${massScale * 0.4 - 50} 260 -70`;

      return (
        <g>
          {/* Spacetime Grid */}
          {gridLines.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke="#38bdf8"
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          ))}

          {/* Central Massive Body Warping Spacetime */}
          <circle cx={0} cy={massScale * 0.4} r={28} fill="url(#sunGlow)" filter="url(#softGlow)" />
          <text
            x={0}
            y={massScale * 0.4 + 44}
            textAnchor="middle"
            fill="#fde047"
            fontSize={11}
            fontWeight="bold"
          >
            Mass curves Spacetime
          </text>

          {/* Deflected Starlight Geodesic (1919 Eddington Test) */}
          {showGuides && (
            <g>
              <path
                d={rayPath}
                fill="none"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <text x={-200} y={-85} fill="#f43f5e" fontSize={9} fontFamily="monospace">
                Deflected Starlight (1.75'')
              </text>
            </g>
          )}

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            General Relativity: "Matter tells spacetime how to curve, spacetime tells matter how to
            move"
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 17. LEMAÎTRE & FRIEDMANN EXPANSION
    // ---------------------------------------------------------------
    case "lemaitre_friedmann_expansion": {
      // Dynamic metric grid stretching
      const scale = 0.6 + ((time * 0.25) % 1) * 0.8;

      return (
        <g>
          {/* Expanding Coordinate Grid */}
          {Array.from({ length: 9 }, (_, k) => {
            const pos = (-4 + k) * 45 * scale;
            return (
              <g key={k} stroke="#38bdf8" strokeOpacity={0.25} strokeWidth={1}>
                <line x1={pos} y1={-180} x2={pos} y2={180} />
                <line x1={-300} y1={pos} x2={300} y2={pos} />
              </g>
            );
          })}

          {/* Embedded Galaxies Moving Apart with Grid */}
          {[-2, -1, 0, 1, 2].map((gx) =>
            [-1, 0, 1].map((gy) => {
              const x = gx * 90 * scale;
              const y = gy * 70 * scale;
              return (
                <g key={`${gx}-${gy}`} transform={`translate(${x}, ${y})`}>
                  <ellipse rx={7} ry={3} fill="#cbd5e1" opacity={0.8} />
                  <circle r={2} fill="#38bdf8" />
                </g>
              );
            }),
          )}

          <text x={0} y={-140} textAnchor="middle" fill="#38bdf8" fontSize={12} fontWeight="bold">
            Cosmic Scale Factor a(t) = {scale.toFixed(2)}
          </text>
          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={11}
            fontFamily="monospace"
          >
            Space itself is stretching: No center, no external edge
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 18. HUBBLE'S REDSHIFT & EXPANSION LAW
    // ---------------------------------------------------------------
    case "hubble_redshift_expansion": {
      // Hubble Diagram (Velocity vs Distance) on left, Spectral Lines on right
      return (
        <g>
          {/* Left: Hubble Plot (v = H0 * d) */}
          <g transform="translate(-160, 20)">
            {/* Axes */}
            <line x1={-100} y1={80} x2={120} y2={80} stroke="#64748b" strokeWidth={1.5} />
            <line x1={-100} y1={80} x2={-100} y2={-120} stroke="#64748b" strokeWidth={1.5} />
            <text x={110} y={95} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              Distance (d)
            </text>
            <text x={-100} y={-130} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              Velocity (v)
            </text>

            {/* Regression Line */}
            <line x1={-100} y1={80} x2={100} y2={-100} stroke="#38bdf8" strokeWidth={2} />
            <text x={40} y={-60} fill="#38bdf8" fontSize={10} fontWeight="bold">
              v = H₀ · d
            </text>

            {/* Scatter Data Points */}
            {[
              [-60, 45],
              [-30, 15],
              [0, -10],
              [35, -45],
              [70, -75],
              [95, -95],
            ].map(([x, y], idx) => (
              <circle key={idx} cx={x} cy={y} r={3.5} fill="#fde047" />
            ))}
          </g>

          {/* Right: Spectral Redshift Absorption Lines */}
          <g transform="translate(150, 0)">
            <text x={0} y={-90} textAnchor="middle" fill="#38bdf8" fontSize={11} fontWeight="bold">
              Cosmological Redshift
            </text>

            {/* Rest Spectrum (Laboratory) */}
            <rect x={-120} y={-60} width={240} height={26} rx={4} fill="#1e293b" stroke="#475569" />
            <line x1={-50} y1={-60} x2={-50} y2={-34} stroke="#05070f" strokeWidth={2.5} />
            <line x1={-20} y1={-60} x2={-20} y2={-34} stroke="#05070f" strokeWidth={2.5} />
            <text x={-120} y={-66} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              Laboratory Rest Frame
            </text>

            {/* Distant Galaxy Spectrum (Redshifted) */}
            <rect x={-120} y={0} width={240} height={26} rx={4} fill="#1e293b" stroke="#475569" />
            <line x1={20} y1={0} x2={20} y2={26} stroke="#ef4444" strokeWidth={2.5} />
            <line x1={50} y1={0} x2={50} y2={26} stroke="#ef4444" strokeWidth={2.5} />
            <text x={-120} y={-6} fill="#f87171" fontSize={9} fontFamily="monospace">
              Distant Galaxy (z = 0.25) → Redshifted
            </text>
          </g>

          <text
            x={0}
            y={165}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize={11}
            fontFamily="monospace"
          >
            1929: Edwin Hubble confirms the linear relationship between distance and recession
            velocity
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 19. BIG BANG & NUCLEOSYNTHESIS
    // ---------------------------------------------------------------
    case "big_bang_nucleosynthesis": {
      return (
        <g>
          {/* Cosmic Timeline Horizon (Left: Early Dense, Right: Atomic) */}
          <path
            d="M-300 -120 Q -100 -50 300 -20 L 300 120 Q -100 50 -300 120 Z"
            fill="url(#bigBangGlow)"
            opacity={0.6}
          />

          {/* Primordial Nucleosynthesis Particles */}
          {Array.from({ length: 40 }, (_, k) => {
            const x = -260 + (k % 8) * 65;
            const y = -60 + (k % 5) * 30;
            const isHelium = k % 4 === 0;
            return (
              <g key={k} transform={`translate(${x}, ${y})`}>
                <circle r={isHelium ? 6 : 3} fill={isHelium ? "#38bdf8" : "#ef4444"} />
              </g>
            );
          })}

          <text
            x={-200}
            y={-140}
            textAnchor="middle"
            fill="#fde047"
            fontSize={10}
            fontFamily="monospace"
          >
            t &lt; 3 min: Quarks & Nucleons
          </text>
          <text
            x={0}
            y={-140}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={10}
            fontFamily="monospace"
          >
            t = 3 min: 75% H, 25% He Nucleosynthesis
          </text>
          <text
            x={200}
            y={-140}
            textAnchor="middle"
            fill="#a78bfa"
            fontSize={10}
            fontFamily="monospace"
          >
            t = 380,000 yr: Recombination
          </text>

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#fde047"
            fontSize={11}
            fontFamily="monospace"
          >
            The Big Bang is the expansion of space everywhere, predicting light element mass ratios
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 20. COSMIC MICROWAVE BACKGROUND (CMB)
    // ---------------------------------------------------------------
    case "cosmic_microwave_background": {
      // Mollweide Elliptical All-Sky Map
      return (
        <g>
          <ellipse
            cx={0}
            cy={0}
            rx={260}
            ry={130}
            fill="#0b0f19"
            stroke="#38bdf8"
            strokeWidth={1.5}
          />

          {/* Microkelvin temperature fluctuations */}
          {Array.from({ length: 110 }, (_, k) => {
            const theta = (k * 137.5 * Math.PI) / 180;
            const r = Math.sqrt(k / 110) * 120;
            const x = Math.cos(theta) * r * 2.0;
            const y = Math.sin(theta) * r * 0.95;
            const isCold = (k * 7) % 3 === 0;
            const isWarm = (k * 7) % 3 === 1;
            const color = isCold ? "#38bdf8" : isWarm ? "#f43f5e" : "#f59e0b";
            return (
              <circle
                key={k}
                cx={x}
                cy={y}
                r={10 + (k % 4) * 3}
                fill={color}
                opacity={0.35}
                filter="url(#softGlow)"
              />
            );
          })}

          <text x={0} y={-145} textAnchor="middle" fill="#38bdf8" fontSize={12} fontWeight="bold">
            Planck / WMAP All-Sky Cosmic Microwave Background Map
          </text>
          <text
            x={0}
            y={160}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize={11}
            fontFamily="monospace"
          >
            T = 2.7255 K · Primordial density ripples (ΔT/T ≈ 10⁻⁵) that seeded all cosmic structure
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 21. DARK MATTER & THE COSMIC WEB
    // ---------------------------------------------------------------
    case "dark_matter_cosmic_web": {
      const dmHalo = customParam / 100; // 0 to 1

      // Rotation curve comparison on left, Cosmic Web on right
      return (
        <g>
          {/* Left: Galaxy Rotation Curve */}
          <g transform="translate(-160, 20)">
            <line x1={-90} y1={70} x2={100} y2={70} stroke="#64748b" strokeWidth={1.5} />
            <line x1={-90} y1={70} x2={-90} y2={-90} stroke="#64748b" strokeWidth={1.5} />
            <text x={90} y={85} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              Radius (r)
            </text>
            <text x={-90} y={-100} fill="#94a3b8" fontSize={9} fontFamily="monospace">
              Velocity (v)
            </text>

            {/* Keplerian expected fall-off: v ∝ 1/sqrt(r) */}
            <path
              d="M-80 0 Q -20 20 90 60"
              fill="none"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <text x={50} y={45} fill="#64748b" fontSize={8} fontFamily="monospace">
              Expected (Keplerian)
            </text>

            {/* Flat Observed Rotation Curve (Vera Rubin) */}
            <path
              d={`M-80 0 Q -20 -15 90 ${-15 + (1 - dmHalo) * 60}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth={2.5}
            />
            <text x={30} y={-25} fill="#38bdf8" fontSize={9} fontWeight="bold">
              Observed Flat Curve
            </text>
          </g>

          {/* Right: 3D Cosmic Web Filaments */}
          <g transform="translate(160, 0)">
            {/* Filament bridges */}
            <path
              d="M-100 -80 Q 0 -20 100 -80"
              fill="none"
              stroke="#818cf8"
              strokeWidth={2}
              strokeOpacity={0.6}
            />
            <path
              d="M-100 80 Q 0 20 100 80"
              fill="none"
              stroke="#818cf8"
              strokeWidth={2}
              strokeOpacity={0.6}
            />
            <path
              d="M-100 -80 Q -40 0 -100 80"
              fill="none"
              stroke="#818cf8"
              strokeWidth={2}
              strokeOpacity={0.6}
            />
            <path
              d="M100 -80 Q 40 0 100 80"
              fill="none"
              stroke="#818cf8"
              strokeWidth={2}
              strokeOpacity={0.6}
            />

            {/* Galaxy Cluster Nodes */}
            {[
              [-100, -80],
              [100, -80],
              [-100, 80],
              [100, 80],
              [0, 0],
            ].map(([x, y], idx) => (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <circle r={12} fill="#38bdf8" opacity={0.3} filter="url(#softGlow)" />
                <circle r={4} fill="#fde047" />
              </g>
            ))}
            <text
              x={0}
              y={110}
              textAnchor="middle"
              fill="#818cf8"
              fontSize={10}
              fontFamily="monospace"
            >
              Dark Matter Filamentary Scaffolding
            </text>
          </g>

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            Vera Rubin: Galaxy rotation curves and gravitational lensing prove 85% of matter is
            non-luminous
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 22. ACCELERATING EXPANSION & DARK ENERGY
    // ---------------------------------------------------------------
    case "dark_energy_acceleration": {
      return (
        <g>
          {/* Supernova Expansion History Curves */}
          <line x1={-240} y1={90} x2={240} y2={90} stroke="#64748b" strokeWidth={1.5} />
          <line x1={-240} y1={90} x2={-240} y2={-130} stroke="#64748b" strokeWidth={1.5} />
          <text x={230} y={105} fill="#94a3b8" fontSize={9} fontFamily="monospace">
            Cosmic Time (t)
          </text>
          <text x={-240} y={-140} fill="#94a3b8" fontSize={9} fontFamily="monospace">
            Scale Factor a(t)
          </text>

          {/* Past Epoch: Deceleration */}
          <path
            d="M -240 90 Q -100 30 0 0"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="3 3"
          />

          {/* Accelerating Curve (Dark Energy Dominated) */}
          <path d="M 0 0 Q 120 -40 240 -120" fill="none" stroke="#f43f5e" strokeWidth={2.5} />
          <text x={180} y={-130} fill="#f43f5e" fontSize={11} fontWeight="bold">
            Accelerating (Dark Energy ~68%)
          </text>

          {/* Decelerating Curve (Matter only) */}
          <path
            d="M 0 0 Q 120 10 240 25"
            fill="none"
            stroke="#64748b"
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />
          <text x={220} y={40} fill="#64748b" fontSize={9} fontFamily="monospace">
            Matter Only (Decelerating)
          </text>

          {/* Transition Point (~5 Billion Years Ago) */}
          <circle cx={0} cy={0} r={5} fill="#fde047" />
          <text
            x={0}
            y={-15}
            textAnchor="middle"
            fill="#fde047"
            fontSize={9}
            fontFamily="monospace"
          >
            Transition ~5 Gyr ago
          </text>

          <text
            x={0}
            y={160}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize={11}
            fontFamily="monospace"
          >
            1998: Type Ia supernovae prove cosmic expansion is accelerating, propelled by dark
            energy
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 23. MODERN STANDARD MODEL (LAMBDA-CDM)
    // ---------------------------------------------------------------
    case "lcdm_standard_model": {
      // Concordance Cosmic Energy Budget Pie Chart
      const R = 110;
      // 68.3% Dark Energy, 26.8% Dark Matter, 4.9% Ordinary Atoms
      const aDE = 0.683 * Math.PI * 2;
      const aDM = 0.268 * Math.PI * 2;

      return (
        <g>
          {/* Pie Chart on left */}
          <g transform="translate(-140, 0)">
            {/* Dark Energy Sector: 68.3% */}
            <path
              d={`M0 0 L${R} 0 A ${R} ${R} 0 1 1 ${Math.cos(aDE) * R} ${Math.sin(aDE) * R} Z`}
              fill="#a855f7"
              opacity={0.85}
            />
            {/* Dark Matter Sector: 26.8% */}
            <path
              d={`M0 0 L${Math.cos(aDE) * R} ${Math.sin(aDE) * R} A ${R} ${R} 0 0 1 ${Math.cos(aDE + aDM) * R} ${Math.sin(aDE + aDM) * R} Z`}
              fill="#3b82f6"
              opacity={0.85}
            />
            {/* Ordinary Matter (Atoms): 4.9% */}
            <path
              d={`M0 0 L${Math.cos(aDE + aDM) * R} ${Math.sin(aDE + aDM) * R} A ${R} ${R} 0 0 1 ${R} 0 Z`}
              fill="#f59e0b"
              opacity={0.9}
            />
          </g>

          {/* Legend and Parameters Table on right */}
          <g transform="translate(60, -60)">
            <text x={0} y={-20} fill="#f8fafc" fontSize={13} fontWeight="bold">
              The Cosmic Inventory (Planck Legacy)
            </text>

            <g transform="translate(0, 10)">
              <rect width={14} height={14} rx={3} fill="#a855f7" />
              <text x={22} y={12} fill="#e2e8f0" fontSize={11}>
                Dark Energy (Λ): <tspan fontWeight="bold">68.3%</tspan>
              </text>
            </g>

            <g transform="translate(0, 35)">
              <rect width={14} height={14} rx={3} fill="#3b82f6" />
              <text x={22} y={12} fill="#e2e8f0" fontSize={11}>
                Cold Dark Matter (CDM): <tspan fontWeight="bold">26.8%</tspan>
              </text>
            </g>

            <g transform="translate(0, 60)">
              <rect width={14} height={14} rx={3} fill="#f59e0b" />
              <text x={22} y={12} fill="#e2e8f0" fontSize={11}>
                Ordinary Atoms (Baryons): <tspan fontWeight="bold">4.9%</tspan>
              </text>
            </g>

            {/* Cosmological Parameters */}
            <g transform="translate(0, 95)" className="font-mono text-[10px] text-slate-400">
              <text y={0}>• Cosmic Age: 13.797 ± 0.023 Gyr</text>
              <text y={18}>• Spatial Geometry: Flat (Ω_k = 0.0007)</text>
              <text y={36} fill="#f43f5e">
                • Hubble Tension: 67.4 (CMB) vs 73.0 (Local)
              </text>
            </g>
          </g>

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            The ΛCDM Standard Model: 95.1% of the universe consists of dark components
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 24. OBSERVABLE UNIVERSE & HORIZONS
    // ---------------------------------------------------------------
    case "observable_universe_horizon": {
      return (
        <g>
          {/* Outer Unobservable Physical Universe */}
          <rect
            x={-360}
            y={-200}
            width={720}
            height={400}
            fill="none"
            stroke="#334155"
            strokeDasharray="5 5"
            opacity={0.4}
          />
          <text
            x={0}
            y={-180}
            textAnchor="middle"
            fill="#64748b"
            fontSize={10}
            fontFamily="monospace"
          >
            Potentially Boundless / Infinite Physical Universe Beyond
          </text>

          {/* Observable Universe Particle Horizon Sphere */}
          <circle
            cx={0}
            cy={0}
            r={145}
            fill="#1e1b4b"
            fillOpacity={0.4}
            stroke="#38bdf8"
            strokeWidth={2}
          />
          {/* CMB Outer Surface */}
          <circle
            cx={0}
            cy={0}
            r={140}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            opacity={0.6}
          />

          {/* Central Observer (Milky Way) */}
          <circle cx={0} cy={0} r={8} fill="url(#earthGlow)" filter="url(#softGlow)" />
          <text x={0} y={24} textAnchor="middle" fill="#fde047" fontSize={10} fontWeight="bold">
            Observer (Earth)
          </text>

          {/* Horizon Radius Vector */}
          {showGuides && (
            <g>
              <line
                x1={0}
                y1={0}
                x2={145}
                y2={0}
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <text
                x={72}
                y={-8}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize={9}
                fontFamily="monospace"
              >
                R ≈ 46.5 Billion Light-Years
              </text>
            </g>
          )}

          <text
            x={0}
            y={170}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize={11}
            fontFamily="monospace"
          >
            The Observable Horizon is an optical light-travel limit (Diameter ~93 Gly), not a
            physical wall
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 25. MULTIWAVELENGTH UNIVERSE (JWST, ALMA, CHANDRA)
    // ---------------------------------------------------------------
    case "multiwavelength_universe": {
      // Color and visual response depending on selected band
      let primaryColor = "#38bdf8";
      let bandLabel = "Optical (Hubble & VLT)";
      let targetDesc = "Stellar photospheres, ionized gas, and visible galaxy spiral arms";

      if (selectedBand === "infrared") {
        primaryColor = "#f97316";
        bandLabel = "Infrared (JWST & Spitzer)";
        targetDesc = "Dust-penetrating early primordial galaxies at z > 13 and star nurseries";
      } else if (selectedBand === "radio") {
        primaryColor = "#eab308";
        bandLabel = "Radio & Submillimeter (ALMA & EHT)";
        targetDesc = "Event Horizon Telescope black hole shadow photon rings & cold molecular gas";
      } else if (selectedBand === "xray") {
        primaryColor = "#a855f7";
        bandLabel = "X-Ray & Gamma (Chandra & Fermi)";
        targetDesc =
          "Supermassive black hole accretion disks, supernova remnants & hot cluster plasma";
      }

      return (
        <g>
          {/* Multiwavelength Galaxy Target Simulation */}
          <g transform="translate(0, -10)">
            {/* Diffuse Gas Halo */}
            <circle r={120} fill={primaryColor} opacity={0.15} filter="url(#softGlow)" />
            {/* Spiral Structure */}
            <ellipse
              rx={90}
              ry={35}
              fill="none"
              stroke={primaryColor}
              strokeWidth={2}
              opacity={0.7}
            />
            <ellipse
              rx={60}
              ry={25}
              fill="none"
              stroke={primaryColor}
              strokeWidth={2}
              opacity={0.8}
            />
            {/* Core / Black Hole */}
            <circle r={12} fill="url(#blackHoleGlow)" />
          </g>

          <text
            x={0}
            y={90}
            textAnchor="middle"
            fill={primaryColor}
            fontSize={13}
            fontWeight="bold"
          >
            {bandLabel}
          </text>
          <text
            x={0}
            y={110}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize={11}
            fontFamily="monospace"
          >
            {targetDesc}
          </text>
          <text
            x={0}
            y={165}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={10}
            fontFamily="monospace"
          >
            Toggle electromagnetic bands above to reveal how different physical regimes emit
          </text>
        </g>
      );
    }

    // ---------------------------------------------------------------
    // 26. THE CURRENT FRONTIER: UNRESOLVED QUESTIONS
    // ---------------------------------------------------------------
    case "cosmic_frontier_unknowns": {
      return (
        <g>
          {/* Central Gateway */}
          <circle
            cx={0}
            cy={0}
            r={40}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <circle cx={0} cy={0} r={16} fill="url(#sunGlow)" opacity={0.8} />

          {/* Radiating Frontier Question Nodes */}
          {[
            {
              angle: -Math.PI * 0.75,
              title: "What is Dark Matter?",
              sub: "Axions, WIMPs, or Modified Gravity?",
            },
            {
              angle: -Math.PI * 0.25,
              title: "What is Dark Energy?",
              sub: "Cosmological Constant or Dynamic Field?",
            },
            {
              angle: 0,
              title: "The Hubble Tension",
              sub: "Early CMB vs Late Supernova Discrepancy",
            },
            {
              angle: Math.PI * 0.35,
              title: "What Happened at t = 0?",
              sub: "Quantum Singularity or Bounce?",
            },
            {
              angle: Math.PI * 0.75,
              title: "Baryon Asymmetry",
              sub: "Why is there matter over antimatter?",
            },
            {
              angle: Math.PI,
              title: "Topology of the Universe",
              sub: "Finite 3-Torus or Infinite Spacetime?",
            },
          ].map((q, idx) => {
            const x = Math.cos(q.angle) * 190;
            const y = Math.sin(q.angle) * 115;
            return (
              <g key={idx} transform={`translate(${x}, ${y})`}>
                <line
                  x1={0}
                  y1={0}
                  x2={-x * 0.45}
                  y2={-y * 0.45}
                  stroke="#38bdf8"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />
                <rect
                  x={-90}
                  y={-20}
                  width={180}
                  height={38}
                  rx={6}
                  fill="#090d16"
                  stroke="#38bdf8"
                  strokeOpacity={0.6}
                />
                <text
                  x={0}
                  y={-4}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize={10}
                  fontWeight="bold"
                >
                  {q.title}
                </text>
                <text
                  x={0}
                  y={10}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={8}
                  fontFamily="monospace"
                >
                  {q.sub}
                </text>
              </g>
            );
          })}

          <text x={0} y={170} textAnchor="middle" fill="#fde047" fontSize={11} fontWeight="bold">
            We Have Mapped an Observable Universe. We Have Not Answered Every Question.
          </text>
        </g>
      );
    }
  }
}
