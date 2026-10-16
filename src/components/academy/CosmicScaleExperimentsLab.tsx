import React, { useState, useEffect, useRef, useCallback } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  TRAVEL_VEHICLES,
  TRAVEL_DESTINATIONS,
  BASKETBALL_SOLAR_SYSTEM,
  DISTANCE_UNIT_CHALLENGES,
  TravelTimeVehicle,
  TravelDestination,
} from "@/lib/academy/lessons/module-03-cosmic-scale";
import {
  Sparkles,
  Zap,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Ruler,
  Car,
  Plane,
  Rocket,
  Sun,
  Globe,
  Footprints,
  Info,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CosmicScaleExperimentsLabProps {
  currentLevel: LearningLevel;
  onExperimentComplete?: (experimentId: string) => void;
}

export function CosmicScaleExperimentsLab({
  currentLevel,
  onExperimentComplete,
}: CosmicScaleExperimentsLabProps) {
  // Active experiment tab
  const [activeTab, setActiveTab] = useState<
    "size-compare" | "light-pulse" | "travel-time" | "basketball-scale" | "unit-matcher"
  >("size-compare");

  // Track completed experiments
  const [completedExperiments, setCompletedExperiments] = useState<Set<string>>(new Set());

  const markComplete = useCallback(
    (id: string) => {
      setCompletedExperiments((prev) => {
        if (!prev.has(id)) {
          const next = new Set(prev);
          next.add(id);
          if (onExperimentComplete) {
            onExperimentComplete(id);
          }
          return next;
        }
        return prev;
      });
    },
    [onExperimentComplete],
  );

  // ----------------------------------------------------
  // EXPERIMENT 1: EARTH vs JUPITER vs SUN COMPARATOR
  // ----------------------------------------------------
  const [sizeScaleMode, setSizeScaleMode] = useState<"true-scale" | "magnified">("true-scale");
  const [showEarthVolumePacking, setShowEarthVolumePacking] = useState<boolean>(false);

  // ----------------------------------------------------
  // EXPERIMENT 2: SPEED OF LIGHT PULSE SIMULATOR
  // ----------------------------------------------------
  const [selectedLightDest, setSelectedLightDest] = useState<TravelDestination>(
    TRAVEL_DESTINATIONS[0], // Moon
  );
  const [isLightPulsePlaying, setIsLightPulsePlaying] = useState<boolean>(false);
  const [pulseProgress, setPulseProgress] = useState<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLightPulsePlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let startTime: number | null = null;
    // Animation duration scaled: 1.28s for moon, capped between 2s and 6s for animation readability
    const simDurationMs = Math.min(Math.max(selectedLightDest.lightSeconds * 500, 1500), 5000);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / simDurationMs, 1);
      setPulseProgress(progress);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIsLightPulsePlaying(false);
        markComplete("light-pulse");
      }
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLightPulsePlaying, selectedLightDest, markComplete]);

  const handleStartLightPulse = () => {
    setPulseProgress(0);
    setIsLightPulsePlaying(true);
  };

  // ----------------------------------------------------
  // EXPERIMENT 3: TRAVEL TIME COMPARATOR (VEHICLES vs LIGHT)
  // ----------------------------------------------------
  const [selectedVehicle, setSelectedVehicle] = useState<TravelTimeVehicle>(
    TRAVEL_VEHICLES[1], // Highway car
  );
  const [selectedDest, setSelectedDest] = useState<TravelDestination>(
    TRAVEL_DESTINATIONS[0], // Moon
  );

  // Calculate precise travel time
  const calculatedTravelHours = selectedDest.distanceKm / selectedVehicle.speedKmh;
  const formattedTravelTime = (() => {
    if (calculatedTravelHours < 1) {
      return `${(calculatedTravelHours * 60).toFixed(1)} minutes`;
    }
    if (calculatedTravelHours < 48) {
      return `${calculatedTravelHours.toFixed(1)} hours`;
    }
    const days = calculatedTravelHours / 24;
    if (days < 60) {
      return `${days.toFixed(1)} days`;
    }
    const months = days / 30.44;
    if (months < 24) {
      return `${months.toFixed(1)} months (~${Math.round(days)} days)`;
    }
    const years = days / 365.25;
    if (years < 1000) {
      return `${years.toFixed(1)} years`;
    }
    if (years < 1_000_000) {
      return `${Math.round(years).toLocaleString()} years`;
    }
    return `${(years / 1_000_000).toFixed(1)} million years`;
  })();

  // ----------------------------------------------------
  // EXPERIMENT 4: BASKETBALL SOLAR SYSTEM
  // ----------------------------------------------------
  const [selectedBasketballPlanetIndex, setSelectedBasketballPlanetIndex] = useState<number>(3); // Earth
  const activeBasketballBody = BASKETBALL_SOLAR_SYSTEM[selectedBasketballPlanetIndex];

  // ----------------------------------------------------
  // EXPERIMENT 5: DISTANCE UNIT MATCHING CHALLENGE
  // ----------------------------------------------------
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const currentChallenge = DISTANCE_UNIT_CHALLENGES[challengeIndex];

  const handleSelectOption = (opt: string) => {
    if (selectedOption) return; // already answered this round
    setSelectedOption(opt);
    setShowExplanation(true);
    if (opt === currentChallenge.bestUnit) {
      setChallengeScore((prev) => prev + 1);
    }
  };

  const handleNextChallenge = () => {
    if (challengeIndex < DISTANCE_UNIT_CHALLENGES.length - 1) {
      setChallengeIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      markComplete("unit-matcher");
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs for the 5 experiments */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => {
            setActiveTab("size-compare");
            markComplete("size-compare");
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "size-compare"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sun className="size-3.5" />
          <span>1. Earth vs Jupiter vs Sun</span>
          {completedExperiments.has("size-compare") && (
            <CheckCircle2 className="size-3 text-cyan-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("light-pulse")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "light-pulse"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Zap className="size-3.5" />
          <span>2. Light-Travel Simulator</span>
          {completedExperiments.has("light-pulse") && (
            <CheckCircle2 className="size-3 text-amber-400" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("travel-time");
            markComplete("travel-time");
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "travel-time"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock className="size-3.5" />
          <span>3. Driving vs Rockets vs Light</span>
          {completedExperiments.has("travel-time") && (
            <CheckCircle2 className="size-3 text-indigo-400" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab("basketball-scale");
            markComplete("basketball-scale");
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "basketball-scale"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Footprints className="size-3.5" />
          <span>4. Basketball Sun Scale</span>
          {completedExperiments.has("basketball-scale") && (
            <CheckCircle2 className="size-3 text-rose-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("unit-matcher")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "unit-matcher"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>5. Distance Unit Game</span>
          {completedExperiments.has("unit-matcher") && (
            <CheckCircle2 className="size-3 text-emerald-400" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* EXPERIMENT 1: EARTH vs JUPITER vs SUN */}
      {/* ========================================================================= */}
      {activeTab === "size-compare" && (
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Experiment 1: Relative Size & Volume
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Comparing Earth, Jupiter and the Sun
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSizeScaleMode(sizeScaleMode === "true-scale" ? "magnified" : "true-scale")
                }
                className="text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/50"
              >
                {sizeScaleMode === "true-scale" ? "View Magnified Earth" : "View True 1:1 Scale"}
              </Button>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            School textbooks often squeeze Earth, Jupiter, and the Sun onto the same page
            side-by-side, misleading children into thinking Jupiter is just twice as big as Earth.
            In reality, size scales exponentially in three dimensions!
          </p>

          {/* Interactive Visual Comparison Stage */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-6 flex flex-col md:flex-row items-center justify-around gap-8 min-h-[300px]">
            {/* The Sun */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className="rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_50px_rgba(251,191,36,0.4)] flex items-center justify-center transition-all duration-500"
                style={{
                  width: sizeScaleMode === "true-scale" ? "240px" : "180px",
                  height: sizeScaleMode === "true-scale" ? "240px" : "180px",
                }}
              >
                <span className="text-xs font-mono font-bold text-amber-950 bg-amber-300/80 px-2 py-0.5 rounded shadow">
                  The Sun
                </span>
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-amber-300">The Sun</div>
                <div className="text-xs font-mono text-slate-400">1,392,700 km diameter</div>
                <div className="text-[11px] text-amber-200/80">109× Earth&apos;s diameter</div>
              </div>
            </div>

            {/* Jupiter */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className="rounded-full bg-gradient-to-tr from-amber-800 via-orange-400 to-amber-200 shadow-[0_0_20px_rgba(251,146,60,0.3)] flex items-center justify-center transition-all duration-500"
                style={{
                  width: sizeScaleMode === "true-scale" ? "24px" : "60px",
                  height: sizeScaleMode === "true-scale" ? "24px" : "60px",
                }}
              >
                {sizeScaleMode === "magnified" && (
                  <span className="text-[9px] font-mono font-bold text-amber-950">Jupiter</span>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-orange-400">Jupiter</div>
                <div className="text-xs font-mono text-slate-400">139,820 km diameter</div>
                <div className="text-[11px] text-orange-200/80">11× Earth&apos;s diameter</div>
              </div>
            </div>

            {/* Earth */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div
                className="rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all duration-500"
                style={{
                  width: sizeScaleMode === "true-scale" ? "3px" : "16px",
                  height: sizeScaleMode === "true-scale" ? "3px" : "16px",
                }}
              />
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-cyan-400">Earth</div>
                <div className="text-xs font-mono text-slate-400">12,742 km diameter</div>
                <div className="text-[11px] text-cyan-200/80">1× baseline unit</div>
              </div>
            </div>
          </div>

          {/* Volume Packing Calculator Toggle */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-cyan-400" />
                <span className="font-bold text-white text-sm">
                  Volume Packing: How Many Earths Fit Inside?
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowEarthVolumePacking(!showEarthVolumePacking)}
                className="text-xs text-cyan-300 hover:text-white"
              >
                {showEarthVolumePacking ? "Hide Packing Math" : "Show Packing Math"}
              </Button>
            </div>

            {showEarthVolumePacking && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300 border-t border-cyan-500/20">
                <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                  <div className="font-bold text-orange-400">Inside Jupiter:</div>
                  <div className="text-lg font-mono font-extrabold text-white">~1,321 Earths</div>
                  <p className="text-slate-400">
                    Volume scales with radius cubed: (11)^3 ≈ 1,331. If Jupiter were a hollow hollow
                    basketball, you could pour over 1,300 Earth marbles inside it!
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                  <div className="font-bold text-amber-400">Inside the Sun:</div>
                  <div className="text-lg font-mono font-extrabold text-white">
                    ~1,300,000 Earths
                  </div>
                  <p className="text-slate-400">
                    Volume ratio: (109.2)^3 ≈ 1,300,000. It takes more than one million Earths
                    packed tightly together to fill the volume of our Sun!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPERIMENT 2: SPEED OF LIGHT PULSE SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "light-pulse" && (
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                Experiment 2: Speed of Light Pulse
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Estimating Light-Travel Times Between Cosmic Worlds
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleStartLightPulse}
                disabled={isLightPulsePlaying}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                {isLightPulsePlaying ? (
                  <>
                    <Pause className="size-3.5 mr-1" /> Transmitting Pulse...
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 mr-1" /> Fire Light Beam (c)
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Light moves at the maximum speed possible in the universe:{" "}
            <strong className="text-white">299,792 km/s</strong> (about 300,000 km/s). Even at this
            staggering velocity, cosmic distances are so vast that light still takes noticeable time
            to travel between worlds.
          </p>

          {/* Destination Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {TRAVEL_DESTINATIONS.map((dest) => {
              const isSelected = selectedLightDest.id === dest.id;
              return (
                <button
                  key={dest.id}
                  onClick={() => {
                    setSelectedLightDest(dest);
                    setPulseProgress(0);
                    setIsLightPulsePlaying(false);
                  }}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-500/10 text-white font-semibold shadow-sm"
                      : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold truncate">{dest.name.split(" ")[0]}</div>
                  <div className="text-[10px] font-mono text-amber-400 mt-0.5 truncate">
                    {dest.lightTravelTime}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Animated Track Visualizer */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-6 space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Globe className="size-4" /> Earth (Origin)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Sun className="size-4" /> {selectedLightDest.name}
              </span>
            </div>

            {/* Track Line with Animated Photon Pulse */}
            <div className="relative h-12 bg-slate-900/80 rounded-xl border border-white/10 px-4 flex items-center">
              {/* Baseline Laser Track */}
              <div className="absolute inset-x-4 h-0.5 bg-slate-800" />

              {/* Progress Beam */}
              <div
                className="absolute left-4 h-1 bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-75"
                style={{ width: `calc(${pulseProgress * 100}% - 2rem)` }}
              />

              {/* Leading Photon Head */}
              <div
                className="absolute size-5 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_15px_#f59e0b] -translate-x-1/2 flex items-center justify-center transition-all duration-75"
                style={{ left: `calc(1rem + ${pulseProgress * 100}% * 0.92)` }}
              >
                <div className="size-1.5 rounded-full bg-amber-400 animate-ping" />
              </div>
            </div>

            {/* Calculations & Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
                <div className="text-[11px] font-mono text-slate-400">Total Distance:</div>
                <div className="text-sm font-mono font-bold text-white">
                  {selectedLightDest.formattedDistance}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
                <div className="text-[11px] font-mono text-slate-400">Light-Travel Time:</div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {selectedLightDest.lightTravelTime}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-white/5 space-y-0.5">
                <div className="text-[11px] font-mono text-slate-400">Calculation Formula:</div>
                <div className="text-xs font-mono text-cyan-300">
                  t = d / c = {selectedDest.distanceKm.toLocaleString()} km / 299,792 km/s
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPERIMENT 3: DRIVING vs SPACECRAFT vs LIGHT SPEED */}
      {/* ========================================================================= */}
      {activeTab === "travel-time" && (
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                Experiment 3: Travel Time Calculator
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Compare Driving, Spacecraft and Light-Speed Travel
              </h4>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Select a mode of transport and a cosmic destination to see transparent numerical
            calculations of how long the trip would take.
          </p>

          {/* Vehicle Selector */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase">1. Choose Vehicle:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {TRAVEL_VEHICLES.map((veh) => {
                const isSelected = selectedVehicle.id === veh.id;
                return (
                  <button
                    key={veh.id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`p-3 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500/10 text-white font-semibold shadow-sm"
                        : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xl mb-1 block">{veh.icon}</span>
                    <div className="font-bold truncate">{veh.name.split(" ")[0]}</div>
                    <div className="text-[10px] font-mono text-indigo-400 mt-0.5 truncate">
                      {veh.formattedSpeed}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination Selector */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase">2. Choose Destination:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {TRAVEL_DESTINATIONS.map((dest) => {
                const isSelected = selectedDest.id === dest.id;
                return (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedDest(dest)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-500/10 text-white font-semibold shadow-sm"
                        : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold truncate">{dest.name.split(" ")[0]}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      {dest.formattedDistance}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mathematical Calculation Showcase */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="text-xs font-mono text-slate-400">
                  Calculated Illustrative Travel Time:
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-0.5 font-mono">
                  {formattedTravelTime}
                </div>
              </div>

              <div className="text-right text-xs font-mono text-slate-400 space-y-1">
                <div>Distance: {selectedDest.distanceKm.toLocaleString()} km</div>
                <div>Speed: {selectedVehicle.speedKmh.toLocaleString()} km/h</div>
              </div>
            </div>

            {/* Transparent Step-by-Step Numerical Formula */}
            <div className="rounded-lg bg-slate-900 p-4 border border-white/5 space-y-2 text-xs font-mono">
              <div className="text-indigo-400 font-bold">Transparent Mathematical Formula:</div>
              <div className="text-slate-300">
                Time (hours) = Distance / Speed = {selectedDest.distanceKm.toLocaleString()} km ÷{" "}
                {selectedVehicle.speedKmh.toLocaleString()} km/h ={" "}
                <span className="text-white font-bold">
                  {calculatedTravelHours.toFixed(1)} hours
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">
                In days: {(calculatedTravelHours / 24).toFixed(1)} days | In years:{" "}
                {(calculatedTravelHours / (24 * 365.25)).toFixed(2)} years
              </div>
            </div>

            {/* CRITICAL PEDAGOGICAL CALLOUT: Distinguishing Illustrative Straight-Line from Real Trajectories */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-amber-200/90 text-xs leading-relaxed">
              <ShieldAlert className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">
                  Crucial Distinction: Illustrative Straight-Line Times vs Real Orbital
                  Trajectories:
                </strong>{" "}
                {selectedDest.trajectoryNote} In orbital mechanics (astrodynamics), planets move in
                Keplerian orbits around the Sun. Spacecraft never fly in a straight Euclidean line;
                they execute curved Hohmann transfer orbits or gravity-assist slingshots that add
                millions of kilometers to the total flight path.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPERIMENT 4: BASKETBALL SOLAR SYSTEM SCALE MODEL */}
      {/* ========================================================================= */}
      {activeTab === "basketball-scale" && (
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                Experiment 4: Physical Scale Model
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Scale the Sun to a Basketball (Walking the Solar System)
              </h4>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            If our mighty Sun (1,392,700 km wide) were shrunk down to a standard{" "}
            <strong className="text-white">24 cm basketball</strong> placed at the center of a
            school basketball court, what would the planets look like, and how far would you have to
            walk to visit them?
          </p>

          {/* Interactive Celestial Body Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5">
            {BASKETBALL_SOLAR_SYSTEM.map((body, idx) => {
              const isSelected = selectedBasketballPlanetIndex === idx;
              return (
                <button
                  key={body.name}
                  onClick={() => setSelectedBasketballPlanetIndex(idx)}
                  className={`p-2 rounded-lg border text-center text-xs transition-all ${
                    isSelected
                      ? "border-rose-400 bg-rose-500/20 text-white font-bold scale-105"
                      : "border-white/5 bg-slate-950/60 text-slate-400 hover:border-white/20 hover:text-slate-200"
                  }`}
                >
                  <div
                    className="size-3.5 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: body.colorHex }}
                  />
                  <div className="truncate text-[11px]">{body.name.split(" ")[0]}</div>
                </button>
              );
            })}
          </div>

          {/* Active Body Deep-Dive Card */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  className="size-16 rounded-full flex items-center justify-center font-bold text-slate-950 text-xs shadow-lg"
                  style={{ backgroundColor: activeBasketballBody.colorHex }}
                >
                  {activeBasketballBody.scaleDiameterMm >= 200 ? "🏀 24 cm" : "•"}
                </div>
                <div>
                  <h5 className="text-xl font-bold text-white">{activeBasketballBody.name}</h5>
                  <div className="text-xs font-mono text-rose-300 mt-0.5">
                    Real diameter: {activeBasketballBody.realDiameterKm.toLocaleString()} km
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">Scaled Walking Distance:</div>
                <div className="text-2xl font-mono font-extrabold text-white">
                  {activeBasketballBody.scaleDistanceMeters >= 1000
                    ? `${(activeBasketballBody.scaleDistanceMeters / 1000).toLocaleString()} km`
                    : `${activeBasketballBody.scaleDistanceMeters.toFixed(1)} meters`}
                </div>
              </div>
            </div>

            {/* Real-World Analogy & Walking Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                <div className="text-xs font-mono text-slate-400 uppercase">
                  Scaled Object Size:
                </div>
                <div className="text-base font-bold text-amber-300">
                  {activeBasketballBody.scaleObjectAnalogy}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Exact scaled diameter: {activeBasketballBody.scaleDiameterMm.toFixed(2)} mm
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 border border-white/5 space-y-1">
                <div className="text-xs font-mono text-slate-400 uppercase">
                  Where to Walk in Real Life:
                </div>
                <div className="text-base font-bold text-rose-300">
                  {activeBasketballBody.scaleDistanceAnalogy}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Real distance: {activeBasketballBody.realDistanceKm.toLocaleString()} km
                </div>
              </div>
            </div>

            {/* Mind-Blower for Proxima Centauri */}
            {activeBasketballBody.name.includes("Proxima") && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-200 leading-relaxed">
                <strong className="text-white">Mind-Blowing Realization:</strong> In this exact same
                basketball model, the closest neighbor star to our Sun (Proxima Centauri) is another
                small ball located <strong className="text-white">6,920 kilometers away</strong>—the
                distance from London to Chicago or New York to Berlin! Between the basketball Sun
                and that ball lies nothing but thousands of kilometers of empty space.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXPERIMENT 5: CELESTIAL DISTANCE UNIT MATCHING CHALLENGE */}
      {/* ========================================================================= */}
      {activeTab === "unit-matcher" && (
        <div className="rounded-xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Experiment 5: Unit Matching Challenge
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Match Cosmic Objects to the Most Reasonable Distance Unit
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">
                Score: {challengeScore} / {DISTANCE_UNIT_CHALLENGES.length}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Astronomers choose their units carefully so numbers stay manageable. Read the scenario
            below and pick the best measurement unit!
          </p>

          {/* Question Box */}
          <div className="rounded-xl border border-white/10 bg-slate-950 p-6 space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>
                Challenge {challengeIndex + 1} of {DISTANCE_UNIT_CHALLENGES.length}
              </span>
              <span>
                {Math.round(((challengeIndex + 1) / DISTANCE_UNIT_CHALLENGES.length) * 100)}%
                Complete
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/90 border border-white/10 text-base sm:text-lg font-bold text-white">
              {currentChallenge.scenario}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentChallenge.options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentChallenge.bestUnit;

                let btnStyle = "border-white/10 bg-slate-900 hover:border-white/20 text-slate-200";
                if (selectedOption) {
                  if (isCorrect) {
                    btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold";
                  } else if (isSelected) {
                    btnStyle = "border-rose-500 bg-rose-500/20 text-rose-200 line-through";
                  } else {
                    btnStyle = "opacity-40 border-white/5 bg-slate-950 text-slate-500";
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={!!selectedOption}
                    className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedOption && isCorrect && (
                      <CheckCircle2 className="size-4 text-emerald-400" />
                    )}
                    {selectedOption && isSelected && !isCorrect && (
                      <XCircle className="size-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Button */}
            {showExplanation && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Info className="size-4" />
                  <span>Scientific Explanation:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {currentChallenge.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleNextChallenge}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    {challengeIndex < DISTANCE_UNIT_CHALLENGES.length - 1
                      ? "Next Challenge →"
                      : "Finish Unit Game"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
