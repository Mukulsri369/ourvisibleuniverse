import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  PLANETARIUM_STARS,
  PLANETARIUM_CONSTELLATIONS,
  PLANETARIUM_PLANETS,
  PlanetariumStar,
  PlanetariumPlanet,
  PlanetariumConstellation,
} from "@/lib/academy/lessons/module-02-night-sky";
import {
  Compass,
  Eye,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  MapPin,
  Clock,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  VolumeX,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sky Dome Radius
const DOME_RADIUS = 50;

// Coordinate Conversion: (RA in hours, Dec in degrees, optional 3D distance in ly)
function getEquatorialVector(raHours: number, decDeg: number, distanceScale = 1): THREE.Vector3 {
  const raRad = (raHours * (Math.PI * 2)) / 24;
  const decRad = (decDeg * Math.PI) / 180;
  const r = DOME_RADIUS * distanceScale;

  // Celestial sphere coordinate mapping (Y is polar axis towards Polaris)
  const y = r * Math.sin(decRad);
  const cosDec = Math.cos(decRad);
  const x = r * cosDec * Math.sin(raRad);
  const z = r * cosDec * Math.cos(raRad);

  return new THREE.Vector3(x, y, z);
}

// Subtle procedural audio synthesizer
function playPlanetariumBeep(freq = 440, type: OscillatorType = "sine") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

interface VirtualPlanetarium3DProps {
  onSelectStar?: (star: PlanetariumStar) => void;
  selectedConstellationId?: string | null;
  onSelectConstellation?: (constellation: PlanetariumConstellation | null) => void;
  initialLatitude?: number;
  initialHour?: number;
  onExploreCompleted?: () => void;
}

export function VirtualPlanetarium3D({
  onSelectStar,
  selectedConstellationId,
  onSelectConstellation,
  initialLatitude = 45, // default 45°N mid-northern
  initialHour = 22, // 10:00 PM
  onExploreCompleted,
}: VirtualPlanetarium3DProps) {
  // Navigation & Observing Controls
  const [latitude, setLatitude] = useState(initialLatitude);
  const [timeHour, setTimeHour] = useState(initialHour);
  const [isPlayingTime, setIsPlayingTime] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1); // 1x, 3x, 5x
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showConstellationNames, setShowConstellationNames] = useState(true);
  const [showStarNames, setShowStarNames] = useState(true);
  const [highlightPolaris, setHighlightPolaris] = useState(false);
  const [bortleScale, setBortleScale] = useState<1 | 4 | 8>(1); // 1: Dark rural, 4: Suburban, 8: Urban city
  const [is3DDepthView, setIs3DDepthView] = useState(false); // Line-of-sight 3D depth breakdown
  const [showStarTrails, setShowStarTrails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Inspector and Dock State
  const [inspectedStar, setInspectedStar] = useState<PlanetariumStar | null>(null);
  const [inspectedPlanet, setInspectedPlanet] = useState<PlanetariumPlanet | null>(null);
  const [activeTab, setActiveTab] = useState<"sky" | "location" | "features" | "pollution">("sky");
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [hasInteractedCount, setHasInteractedCount] = useState(0);

  // Quick preset locations
  const PRESET_LOCATIONS = [
    {
      name: "North Pole",
      lat: 90,
      desc: "Polaris at Zenith (overhead), stars circle parallel to horizon",
    },
    {
      name: "London / Paris (50°N)",
      lat: 50,
      desc: "Mid-Northern, Big Dipper & Cassiopeia circumpolar",
    },
    {
      name: "New York / Madrid (40°N)",
      lat: 40,
      desc: "Orion high in southern winter sky, Polaris at 40°",
    },
    {
      name: "Equator (0°)",
      lat: 0,
      desc: "Polaris on Northern horizon, all 88 constellations visible over 1 year",
    },
    {
      name: "Sydney / S. America (-34°S)",
      lat: -34,
      desc: "Southern Cross & Pointers high, Polaris below horizon",
    },
    { name: "South Pole (-90°S)", lat: -90, desc: "South Celestial Pole directly overhead" },
  ];

  const handleSelectStarInternal = useCallback(
    (star: PlanetariumStar) => {
      setInspectedStar(star);
      setInspectedPlanet(null);
      if (soundEnabled) playPlanetariumBeep(520);
      onSelectStar?.(star);
      setHasInteractedCount((prev) => {
        const next = prev + 1;
        if (next >= 3) onExploreCompleted?.();
        return next;
      });
    },
    [soundEnabled, onSelectStar, onExploreCompleted],
  );

  const handleSelectPlanet = useCallback(
    (planet: PlanetariumPlanet) => {
      setInspectedPlanet(planet);
      setInspectedStar(null);
      if (soundEnabled) playPlanetariumBeep(660);
      setHasInteractedCount((prev) => prev + 1);
    },
    [soundEnabled],
  );

  return (
    <div className="relative w-full h-[620px] sm:h-[700px] rounded-3xl overflow-hidden border border-cyan-500/30 bg-black text-white select-none shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 1.2, 0.01], fov: 65, near: 0.1, far: 500 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <color
            attach="background"
            args={[bortleScale === 8 ? "#090d1a" : bortleScale === 4 ? "#040714" : "#01030a"]}
          />

          <PlanetariumScene
            latitude={latitude}
            timeHour={timeHour}
            isPlayingTime={isPlayingTime}
            timeSpeed={timeSpeed}
            setTimeHour={setTimeHour}
            showConstellationLines={showConstellationLines}
            showConstellationNames={showConstellationNames}
            showStarNames={showStarNames}
            highlightPolaris={highlightPolaris}
            bortleScale={bortleScale}
            is3DDepthView={is3DDepthView}
            showStarTrails={showStarTrails}
            selectedConstellationId={selectedConstellationId}
            onSelectStar={handleSelectStarInternal}
            onSelectPlanet={handleSelectPlanet}
          />
        </Canvas>
      </div>

      {/* Top Header Overlay Bar (HUD) */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/10 pointer-events-auto">
          <Sparkles className="size-4 text-cyan-400" />
          <div>
            <span className="text-xs font-mono font-bold text-white block">
              360° Virtual Planetarium
            </span>
            <span className="text-[10px] text-slate-400">
              Lat: {latitude >= 0 ? `${latitude}°N` : `${Math.abs(latitude)}°S`} • Time:{" "}
              {Math.floor(timeHour).toString().padStart(2, "0")}:00
            </span>
          </div>
        </div>

        {/* Quick controls: Sound, 3D Depth View toggle, Polaris Guide */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHighlightPolaris(!highlightPolaris)}
            className={`text-xs h-8 px-3 border transition-colors ${
              highlightPolaris
                ? "bg-amber-500/20 border-amber-400 text-amber-200"
                : "bg-slate-950/80 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <Compass className="size-3.5 mr-1.5 text-amber-400" />
            <span>{highlightPolaris ? "Polaris Guide ON" : "Find Polaris"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIs3DDepthView(!is3DDepthView);
              if (soundEnabled) playPlanetariumBeep(480);
            }}
            className={`text-xs h-8 px-3 border transition-colors ${
              is3DDepthView
                ? "bg-indigo-500/20 border-indigo-400 text-indigo-200"
                : "bg-slate-950/80 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <Layers className="size-3.5 mr-1.5 text-indigo-400" />
            <span>{is3DDepthView ? "3D True Depth" : "2D Sky Dome"}</span>
          </Button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="size-8 rounded-full border border-white/10 bg-slate-950/80 flex items-center justify-center text-slate-400 hover:text-white"
            title={soundEnabled ? "Mute sound" : "Enable audio"}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Center 3D Instruction Hint */}
      <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-10">
        <span className="text-[11px] text-slate-400 bg-slate-950/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
          {is3DDepthView
            ? "3D Depth Mode: Orbit around to see that constellation stars are NOT physically connected!"
            : "Click & drag inside dome to look around 360° • Click any star or planet to inspect"}
        </span>
      </div>

      {/* Selected Star Inspector Card (Floating bottom left/right) */}
      {inspectedStar && (
        <div className="absolute top-20 right-4 z-30 w-72 rounded-2xl border border-cyan-500/40 bg-slate-950/90 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: inspectedStar.colorHex }}
                />
                <h4 className="text-base font-bold text-white">{inspectedStar.name}</h4>
              </div>
              <p className="text-[11px] text-cyan-400 font-mono">
                {inspectedStar.bayer || inspectedStar.id} • {inspectedStar.constellation}
              </p>
            </div>
            <button
              onClick={() => setInspectedStar(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Brightness</span>
              <span className="font-mono font-bold text-amber-300">
                Mag {inspectedStar.magnitude}
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Distance</span>
              <span className="font-mono font-bold text-cyan-300">
                {inspectedStar.distanceLy} Light-Yrs
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Surface Temp</span>
              <span className="font-mono font-bold text-white">
                {inspectedStar.tempK.toLocaleString()} K
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Spectral Class</span>
              <span className="font-mono font-bold text-indigo-300">
                {inspectedStar.spectralType}
              </span>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2">
            {inspectedStar.description}
          </p>
        </div>
      )}

      {/* Selected Planet Inspector Card */}
      {inspectedPlanet && (
        <div className="absolute top-20 right-4 z-30 w-72 rounded-2xl border border-amber-500/40 bg-slate-950/90 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: inspectedPlanet.colorHex }}
                />
                <h4 className="text-base font-bold text-white">{inspectedPlanet.name}</h4>
              </div>
              <p className="text-[11px] text-amber-400 font-mono">
                Solar System Planet • Steady Light
              </p>
            </div>
            <button
              onClick={() => setInspectedPlanet(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Apparent Magnitude</span>
              <span className="font-mono font-bold text-amber-300">
                Mag {inspectedPlanet.magnitude}
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Twinkles?</span>
              <span className="font-mono font-bold text-emerald-400">NO (Steady disk)</span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Distance from Sun</span>
              <span className="font-mono font-bold text-cyan-300">
                {inspectedPlanet.distanceAU} AU
              </span>
            </div>
            <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2">
              <span className="text-slate-400 block text-[9px]">Physical Diameter</span>
              <span className="font-mono font-bold text-white">
                {inspectedPlanet.sizeKm.toLocaleString()} km
              </span>
            </div>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-2">
            {inspectedPlanet.notes}
          </p>
        </div>
      )}

      {/* Polaris Altitude Compass Callout */}
      {highlightPolaris && (
        <div className="absolute top-20 left-4 z-30 max-w-xs rounded-2xl border border-amber-500/40 bg-slate-950/90 backdrop-blur-xl p-3.5 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="size-4 text-amber-400" />
            <h5 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
              Polaris Altitude Law
            </h5>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {latitude >= 0 ? (
              <>
                Polaris sits at exactly{" "}
                <strong className="text-amber-300 font-mono">{latitude}°</strong> above your
                Northern horizon! For any northern observer,{" "}
                <span className="text-cyan-300">Altitude of Polaris = Your Latitude</span>.
              </>
            ) : (
              <>
                You are in the Southern Hemisphere ({latitude}°S). Polaris is below your horizon!
                Southern navigators use the{" "}
                <strong className="text-cyan-300">Southern Cross</strong> and pointer stars to
                locate True South.
              </>
            )}
          </p>
        </div>
      )}

      {/* Ergonomic Bottom Unified Control Dock (Zero Viewport Occlusion) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-4xl transition-all duration-300 ${
          isDockCollapsed ? "translate-y-[calc(100%-36px)]" : "translate-y-0"
        }`}
      >
        <div className="rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur-xl shadow-2xl p-3 sm:p-4 overflow-hidden">
          {/* Header tabs & Collapse Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setActiveTab("sky");
                  setIsDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "sky"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Clock className="size-3.5" />
                <span>Time & Rotation</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("location");
                  setIsDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "location"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MapPin className="size-3.5" />
                <span>Latitude & Presets</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("features");
                  setIsDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "features"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="size-3.5" />
                <span>Overlays & Stars</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("pollution");
                  setIsDockCollapsed(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "pollution"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sun className="size-3.5" />
                <span>Light Pollution</span>
              </button>
            </div>

            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/5 hover:bg-white/5"
            >
              {isDockCollapsed ? (
                <>
                  <ChevronUp className="size-3.5" />
                  <span className="hidden sm:inline">Show Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  <span className="hidden sm:inline">Hide Controls</span>
                </>
              )}
            </button>
          </div>

          {/* Tab 1: Time of Night & Apparent Sky Rotation */}
          {activeTab === "sky" && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex-1 w-full space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Local Observing Time</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {Math.floor(timeHour).toString().padStart(2, "0")}:
                    {Math.floor((timeHour % 1) * 60)
                      .toString()
                      .padStart(2, "0")}{" "}
                    (Night Sky)
                  </span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="30"
                  step="0.1"
                  value={timeHour < 18 ? timeHour + 24 : timeHour}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTimeHour(val >= 24 ? val - 24 : val);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>6:00 PM (Dusk)</span>
                  <span>Midnight</span>
                  <span>6:00 AM (Dawn)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => setIsPlayingTime(!isPlayingTime)}
                  className={`text-xs h-8 px-3 ${
                    isPlayingTime
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white"
                  }`}
                >
                  {isPlayingTime ? (
                    <Pause className="size-3 mr-1" />
                  ) : (
                    <Play className="size-3 mr-1" />
                  )}
                  <span>{isPlayingTime ? "Pause Rotation" : "Play Rotation"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStarTrails(!showStarTrails)}
                  className={`text-xs h-8 px-2.5 border ${
                    showStarTrails
                      ? "bg-purple-500/20 border-purple-400 text-purple-300"
                      : "border-white/10 text-slate-300"
                  }`}
                >
                  <span>Star Trails</span>
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Latitude & Location Presets */}
          {activeTab === "location" && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Observation Latitude</span>
                <span className="font-mono font-bold text-cyan-300">
                  {latitude === 0
                    ? "0° (Equator)"
                    : latitude > 0
                      ? `${latitude}°N (Northern)`
                      : `${Math.abs(latitude)}°S (Southern)`}
                </span>
              </div>

              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={latitude}
                onChange={(e) => setLatitude(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />

              {/* Preset location chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setLatitude(loc.lat);
                      if (soundEnabled) playPlanetariumBeep(440);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] border transition-all ${
                      latitude === loc.lat
                        ? "bg-cyan-500/25 border-cyan-400 text-white font-bold"
                        : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Overlays & Display Toggles */}
          {activeTab === "features" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={showConstellationLines}
                  onChange={(e) => setShowConstellationLines(e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                <span className="text-slate-200">Constellation Lines</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={showConstellationNames}
                  onChange={(e) => setShowConstellationNames(e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                <span className="text-slate-200">Constellation Names</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={showStarNames}
                  onChange={(e) => setShowStarNames(e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                <span className="text-slate-200">Key Star Labels</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={highlightPolaris}
                  onChange={(e) => setHighlightPolaris(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span className="text-amber-300 font-semibold">Pointer Line to Polaris</span>
              </label>
            </div>
          )}

          {/* Tab 4: Light Pollution & Bortle Simulator */}
          {activeTab === "pollution" && (
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Sky Quality (Bortle Dark-Sky Scale)</span>
                <span className="font-mono font-bold text-amber-300">
                  {bortleScale === 1
                    ? "Bortle 1: Pristine Dark Rural Sky (Limiting Mag 6.5)"
                    : bortleScale === 4
                      ? "Bortle 4: Suburban Sky (Limiting Mag 5.0)"
                      : "Bortle 8: Downtown City Sky (Limiting Mag 3.5)"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBortleScale(1)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    bortleScale === 1
                      ? "bg-cyan-500/20 border-cyan-400 text-white"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white text-xs">🌌 Dark Rural Sky</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Thousands of stars + Milky Way visible
                  </div>
                </button>

                <button
                  onClick={() => setBortleScale(4)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    bortleScale === 4
                      ? "bg-amber-500/20 border-amber-400 text-white"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white text-xs">🏡 Suburban Sky</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Faint stars washed out; constellations clear
                  </div>
                </button>

                <button
                  onClick={() => setBortleScale(8)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    bortleScale === 8
                      ? "bg-rose-500/20 border-rose-400 text-white"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="font-bold text-white text-xs">🏙️ Urban City Sky</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Only brightest beacons & planets visible
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Three.js Scene Sub-Components
// -------------------------------------------------------------

interface PlanetariumSceneProps {
  latitude: number;
  timeHour: number;
  isPlayingTime: boolean;
  timeSpeed: number;
  setTimeHour: React.Dispatch<React.SetStateAction<number>>;
  showConstellationLines: boolean;
  showConstellationNames: boolean;
  showStarNames: boolean;
  highlightPolaris: boolean;
  bortleScale: 1 | 4 | 8;
  is3DDepthView: boolean;
  showStarTrails: boolean;
  selectedConstellationId?: string | null;
  onSelectStar: (star: PlanetariumStar) => void;
  onSelectPlanet: (planet: PlanetariumPlanet) => void;
}

function PlanetariumScene({
  latitude,
  timeHour,
  isPlayingTime,
  timeSpeed,
  setTimeHour,
  showConstellationLines,
  showConstellationNames,
  showStarNames,
  highlightPolaris,
  bortleScale,
  is3DDepthView,
  showStarTrails,
  selectedConstellationId,
  onSelectStar,
  onSelectPlanet,
}: PlanetariumSceneProps) {
  const celestialGroupRef = useRef<THREE.Group>(null);
  const trailsMeshRef = useRef<THREE.LineSegments>(null);

  // Time rotation animation
  useFrame((_, delta) => {
    if (isPlayingTime) {
      setTimeHour((prev) => {
        const next = prev + delta * 0.4 * timeSpeed;
        return next >= 24 ? next - 24 : next;
      });
    }

    if (celestialGroupRef.current) {
      // Calculate hour angle in radians: 1 hour = 15 degrees = (15 * Math.PI) / 180
      const hourAngleRad = (timeHour * 15 * Math.PI) / 180;
      celestialGroupRef.current.rotation.y = -hourAngleRad;
    }
  });

  // Calculate latitude tilt matrix
  // At lat = 90 (North Pole), Celestial Pole is at Zenith (+Y)
  // At lat = 0 (Equator), Celestial Pole is at Horizon
  const latitudeTiltRad = ((90 - latitude) * Math.PI) / 180;

  // Background random stars generator (1,200 stars)
  const bgStarsBuffer = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseCol = new THREE.Color("#ffffff");
    const warmCol = new THREE.Color("#fed7aa");
    const blueCol = new THREE.Color("#93c5fd");

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = DOME_RADIUS * 0.98;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Color variation
      const col = i % 3 === 0 ? warmCol : i % 4 === 0 ? blueCol : baseCol;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    return { positions, colors };
  }, []);

  // Milky Way Band particle arch
  const milkyWayBuffer = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const mwColor = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const spread = (Math.random() - 0.5) * 5;
      const r = DOME_RADIUS * 0.96;

      // Incline galactic plane by 60°
      const x = r * Math.cos(t) + spread;
      const y = r * Math.sin(t) * 0.86 + spread * 0.5;
      const z = r * Math.sin(t) * 0.5 + spread;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = mwColor.r * (0.4 + Math.random() * 0.4);
      colors[i * 3 + 1] = mwColor.g * (0.4 + Math.random() * 0.4);
      colors[i * 3 + 2] = mwColor.b * (0.5 + Math.random() * 0.4);
    }
    return { positions, colors };
  }, []);

  // Compute constellation lines segments
  const constellationLinesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const starMap = new Map<string, PlanetariumStar>();
    PLANETARIUM_STARS.forEach((s) => starMap.set(s.id, s));

    PLANETARIUM_CONSTELLATIONS.forEach((c) => {
      c.lines.forEach(([s1Id, s2Id]) => {
        const s1 = starMap.get(s1Id);
        const s2 = starMap.get(s2Id);
        if (s1 && s2) {
          // If in 3D Depth mode, scale distance out by actual light-years
          const scale1 = is3DDepthView ? Math.min(1.8, Math.max(0.3, s1.distanceLy / 300)) : 1;
          const scale2 = is3DDepthView ? Math.min(1.8, Math.max(0.3, s2.distanceLy / 300)) : 1;
          points.push(getEquatorialVector(s1.raHours, s1.decDeg, scale1));
          points.push(getEquatorialVector(s2.raHours, s2.decDeg, scale2));
        }
      });
    });

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    return geom;
  }, [is3DDepthView]);

  // Pointer line from Merak & Dubhe to Polaris
  const polarisPointerLine = useMemo(() => {
    const merak = PLANETARIUM_STARS.find((s) => s.id === "merak");
    const dubhe = PLANETARIUM_STARS.find((s) => s.id === "dubhe");
    const polaris = PLANETARIUM_STARS.find((s) => s.id === "polaris");

    if (!merak || !dubhe || !polaris) return null;

    const vMerak = getEquatorialVector(merak.raHours, merak.decDeg);
    const vDubhe = getEquatorialVector(dubhe.raHours, dubhe.decDeg);
    const vPolaris = getEquatorialVector(polaris.raHours, polaris.decDeg);

    const geom = new THREE.BufferGeometry().setFromPoints([vMerak, vDubhe, vPolaris]);
    return geom;
  }, []);

  // Filter stars by light pollution (Bortle Scale limiting magnitude)
  // Bortle 1: limit 6.5
  // Bortle 4: limit 5.0
  // Bortle 8: limit 3.5
  const limitingMagnitude = bortleScale === 1 ? 6.5 : bortleScale === 4 ? 5.0 : 3.5;
  const visibleStars = PLANETARIUM_STARS.filter((s) => s.magnitude <= limitingMagnitude);

  return (
    <>
      {/* Camera Controller */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={0.1}
        maxDistance={is3DDepthView ? 120 : 1.5}
        rotateSpeed={-0.45}
        autoRotate={false}
      />

      {/* Horizon Ground Silhouette & Cardinal Compass Rose */}
      {!is3DDepthView && (
        <group position={[0, -0.4, 0]}>
          {/* Flat ground disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[DOME_RADIUS * 1.05, 64]} />
            <meshBasicMaterial color="#020617" side={THREE.DoubleSide} />
          </mesh>

          {/* Horizon Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[DOME_RADIUS * 0.99, DOME_RADIUS * 1.01, 64]} />
            <meshBasicMaterial
              color={bortleScale === 8 ? "#f97316" : bortleScale === 4 ? "#38bdf8" : "#0284c7"}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Cardinal Direction Markers */}
          {[
            { label: "N", angle: 0, color: "#f87171" },
            { label: "NE", angle: Math.PI / 4, color: "#94a3b8" },
            { label: "E", angle: Math.PI / 2, color: "#38bdf8" },
            { label: "SE", angle: (3 * Math.PI) / 4, color: "#94a3b8" },
            { label: "S", angle: Math.PI, color: "#38bdf8" },
            { label: "SW", angle: (5 * Math.PI) / 4, color: "#94a3b8" },
            { label: "W", angle: (3 * Math.PI) / 2, color: "#38bdf8" },
            { label: "NW", angle: (7 * Math.PI) / 4, color: "#94a3b8" },
          ].map((dir) => {
            const r = DOME_RADIUS * 0.94;
            const x = r * Math.sin(dir.angle);
            const z = -r * Math.cos(dir.angle);
            return (
              <group key={dir.label} position={[x, 0.2, z]}>
                <mesh>
                  <sphereGeometry args={[0.3, 16, 16]} />
                  <meshBasicMaterial color={dir.color} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* Tilted Celestial Sphere by Observer Latitude */}
      <group rotation={[latitudeTiltRad, 0, 0]}>
        {/* Diurnal Rotating Celestial Group */}
        <group ref={celestialGroupRef}>
          {/* Faint Background Star Field (Visible under Dark Sky) */}
          {bortleScale < 8 && (
            <points>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[bgStarsBuffer.positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[bgStarsBuffer.colors, 3]} />
              </bufferGeometry>
              <pointsMaterial
                size={bortleScale === 1 ? 0.35 : 0.2}
                vertexColors
                transparent
                opacity={bortleScale === 1 ? 0.8 : 0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </points>
          )}

          {/* Milky Way Faint Cosmic Dust Cloud (Dark Sky Only) */}
          {bortleScale === 1 && !is3DDepthView && (
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[milkyWayBuffer.positions, 3]}
                />
                <bufferAttribute attach="attributes-color" args={[milkyWayBuffer.colors, 3]} />
              </bufferGeometry>
              <pointsMaterial
                size={0.7}
                vertexColors
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </points>
          )}

          {/* Constellation Connecting Lines */}
          {showConstellationLines && (
            <lineSegments geometry={constellationLinesGeometry}>
              <lineBasicMaterial
                color={selectedConstellationId ? "#38bdf8" : "#0284c7"}
                transparent
                opacity={is3DDepthView ? 0.65 : 0.35}
                linewidth={1}
              />
            </lineSegments>
          )}

          {/* Polaris Pointer Line */}
          {highlightPolaris && polarisPointerLine && (
            <line geometry={polarisPointerLine}>
              <lineBasicMaterial color="#f59e0b" linewidth={2} />
            </line>
          )}

          {/* Prominent Named Catalog Stars */}
          {visibleStars.map((star) => {
            const distanceScale = is3DDepthView
              ? Math.min(1.8, Math.max(0.3, star.distanceLy / 300))
              : 1;
            const pos = getEquatorialVector(star.raHours, star.decDeg, distanceScale);
            // Magnitude sizing: Sirius (-1.46) is largest, 3.5 mag is small
            const size = Math.max(0.28, 0.85 - star.magnitude * 0.14);
            const isSelected = star.id === "polaris" && highlightPolaris;

            return (
              <group key={star.id} position={pos}>
                {/* Clickable Star Mesh */}
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStar(star);
                  }}
                >
                  <sphereGeometry args={[size, 16, 16]} />
                  <meshBasicMaterial color={star.colorHex} />
                </mesh>

                {/* Starlight Glow Halo */}
                <mesh scale={[size * 2.2, size * 2.2, size * 2.2]}>
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshBasicMaterial
                    color={star.colorHex}
                    transparent
                    opacity={isSelected ? 0.6 : 0.25}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>

                {/* Glowing ring if Polaris highlight active */}
                {isSelected && (
                  <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.5, 1.7, 32]} />
                    <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Planets in the Night Sky (Steady, non-scintillating disk) */}
          {PLANETARIUM_PLANETS.map((planet) => {
            const pos = getEquatorialVector(planet.raHours, planet.decDeg, 0.97);
            const size = 0.75 - planet.magnitude * 0.12;

            return (
              <group key={planet.id} position={pos}>
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlanet(planet);
                  }}
                >
                  <sphereGeometry args={[size, 20, 20]} />
                  <meshBasicMaterial color={planet.colorHex} />
                </mesh>
                {/* Steady non-twinkling subtle aura */}
                <mesh scale={[size * 1.8, size * 1.8, size * 1.8]}>
                  <sphereGeometry args={[1, 16, 16]} />
                  <meshBasicMaterial
                    color={planet.colorHex}
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
}
