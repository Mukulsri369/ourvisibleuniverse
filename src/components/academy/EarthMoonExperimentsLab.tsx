import React, { useState, useMemo } from "react";
import {
  LUNAR_PHASES,
  EARTH_SEASONAL_POINTS,
  type LunarPhaseInfo,
  type EarthSeasonalPoint,
} from "@/lib/academy/lessons/module-05-earth-moon";
import { Button } from "@/components/ui/button";
import {
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Globe,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Layers,
  Activity,
  Maximize2,
} from "lucide-react";

export function EarthMoonExperimentsLab({
  onCompletedExperiment,
}: {
  onCompletedExperiment?: (expId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "phase_predictor" | "daylight_latitude" | "seasons_tilt" | "eclipse_tilt" | "sidereal_synodic"
  >("phase_predictor");

  // Track interactions
  const handleInteract = (expId: string) => {
    onCompletedExperiment?.(expId);
  };

  // ----------------------------------------------------
  // EXPERIMENT 1 STATE: LUNAR PHASE PREDICTOR
  // ----------------------------------------------------
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(1); // Waxing crescent
  const [userGuessPhaseIndex, setUserGuessPhaseIndex] = useState<number | null>(null);
  const [isGuessSubmitted, setIsGuessSubmitted] = useState(false);

  const activePhase = LUNAR_PHASES[currentPhaseIndex];
  const expectedNextPhaseIndex = (currentPhaseIndex + 1) % LUNAR_PHASES.length;
  const expectedNextPhase = LUNAR_PHASES[expectedNextPhaseIndex];

  const handlePhaseGuess = (index: number) => {
    if (isGuessSubmitted) return;
    setUserGuessPhaseIndex(index);
    setIsGuessSubmitted(true);
    handleInteract("phase_predictor");
  };

  const handleNextPhaseStep = () => {
    setCurrentPhaseIndex((prev) => (prev + 1) % LUNAR_PHASES.length);
    setUserGuessPhaseIndex(null);
    setIsGuessSubmitted(false);
  };

  // ----------------------------------------------------
  // EXPERIMENT 2 STATE: DAYLIGHT & LATITUDE EXPLORER
  // ----------------------------------------------------
  const [selectedLatitude, setSelectedLatitude] = useState(40); // 40° N (e.g. New York / Madrid / Beijing)
  const [selectedSeason, setSelectedSeason] = useState<"june" | "december" | "equinox">("june");

  // Calculate daylight hours based on solar declination and latitude
  const daylightCalculation = useMemo(() => {
    const latRad = (selectedLatitude * Math.PI) / 180;
    // Declination: June = +23.44°, Dec = -23.44°, Equinox = 0°
    const declinationDeg =
      selectedSeason === "june" ? 23.44 : selectedSeason === "december" ? -23.44 : 0.0;
    const declRad = (declinationDeg * Math.PI) / 180;

    // Hour angle at sunrise/sunset: cos(omega) = -tan(phi) * tan(delta)
    const tanProd = Math.tan(latRad) * Math.tan(declRad);

    let daylightHours = 12.0;
    let isPolarDay = false;
    let isPolarNight = false;

    if (tanProd >= 1.0) {
      // Polar night (Sun never rises)
      daylightHours = 0.0;
      isPolarNight = true;
    } else if (tanProd <= -1.0) {
      // Midnight sun / polar day (Sun never sets)
      daylightHours = 24.0;
      isPolarDay = true;
    } else {
      const omega = Math.acos(-tanProd);
      daylightHours = (2 * omega * (180 / Math.PI)) / 15.0; // 15° per hour
    }

    // Solar noon elevation angle: h = 90° - |phi - delta|
    const noonElevation = Math.max(0, 90 - Math.abs(selectedLatitude - declinationDeg));

    return {
      hours: daylightHours.toFixed(1),
      noonElevation: noonElevation.toFixed(1),
      declinationDeg,
      isPolarDay,
      isPolarNight,
    };
  }, [selectedLatitude, selectedSeason]);

  // ----------------------------------------------------
  // EXPERIMENT 3 STATE: SUMMER VS WINTER INSOLATION
  // ----------------------------------------------------
  const [insolationHemisphere, setInsolationHemisphere] = useState<"north" | "south">("north");
  const [insolationMonth, setInsolationMonth] = useState<"june" | "december">("june");

  // ----------------------------------------------------
  // EXPERIMENT 4 STATE: MOON ORBITAL INCLINATION & ECLIPSES
  // ----------------------------------------------------
  const [lunarOrbitTiltDeg, setLunarOrbitTiltDeg] = useState(5.15); // Default 5.145°

  const eclipseProbability = useMemo(() => {
    // If tilt = 0°, eclipse happens EVERY month (100%)
    // If tilt = 5.15°, eclipses only occur when alignment passes node (~2 solar & 2 lunar per year, ~15%)
    if (lunarOrbitTiltDeg <= 0.5) {
      return {
        annualSolarEclipses: 12,
        annualLunarEclipses: 12,
        status: "Eclipses Every Single Month!",
        explanation:
          "With zero tilt, the Moon passes directly through the ecliptic plane on every orbit, producing 12 solar eclipses and 12 lunar eclipses every year!",
        color: "text-amber-400 bg-amber-950/40 border-amber-500/40",
      };
    }
    if (lunarOrbitTiltDeg <= 2.5) {
      return {
        annualSolarEclipses: 6,
        annualLunarEclipses: 6,
        status: "Frequent Eclipses (~6 per year)",
        explanation:
          "With a low tilt, the Moon's shadow cone frequently intersects Earth during syzygy.",
        color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/40",
      };
    }
    return {
      annualSolarEclipses: "2 to 5",
      annualLunarEclipses: "2 to 3",
      status: "Real Earth Physics: Rare Eclipses (~2 to 5 per year)",
      explanation:
        "Because the Moon is tilted by 5.145°, its shadow passes safely above the North Pole or below the South Pole during most New Moons. Eclipses can only occur during 'eclipse seasons' when the Moon crosses the ecliptic at a node!",
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/40",
    };
  }, [lunarOrbitTiltDeg]);

  // ----------------------------------------------------
  // EXPERIMENT 5 STATE: SIDEREAL VS SYNODIC LUNAR MONTH
  // ----------------------------------------------------
  const [simMonthProgress, setSimMonthProgress] = useState(27.32); // days

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* Header and Sub-Tab Navigation */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <Sliders className="size-3.5" />
              <span>Interactive Astrodynamics & Orbital Laboratory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              5 Hands-On Earth & Moon Experiments
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Directly Manipulate Physics Parameters
          </span>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: "phase_predictor", label: "1. Lunar Phase Predictor", icon: Moon },
            { id: "daylight_latitude", label: "2. Daylight & Latitude", icon: Sun },
            { id: "seasons_tilt", label: "3. Summer vs. Winter Tilt", icon: Globe },
            { id: "eclipse_tilt", label: "4. Orbital Inclination & Eclipses", icon: Compass },
            { id: "sidereal_synodic", label: "5. Sidereal vs. Synodic Month", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  handleInteract(tab.id);
                }}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                    : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                <span className="text-xs font-bold leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= EXPERIMENT 1: LUNAR PHASE PREDICTOR ================= */}
      {activeTab === "phase_predictor" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Predict the Next Lunar Phase in Sequence</span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                29.53-Day Cycle
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Observe the current phase of the Moon. Based on the counter-clockwise orbital motion
              of the Moon around Earth, predict which phase comes next!
            </p>
          </div>

          {/* Current Phase Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{activePhase.symbol}</span>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                  Current Moon Phase in Sky:
                </span>
                <h4 className="text-2xl font-extrabold text-white">{activePhase.name}</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  {activePhase.earthSkyAppearance} •{" "}
                  <span className="text-amber-300 font-mono font-bold">
                    {activePhase.illuminationPct}% Illuminated
                  </span>
                </p>
              </div>
            </div>

            <Button
              onClick={handleNextPhaseStep}
              size="sm"
              variant="outline"
              className="border-white/20 text-white shrink-0 hover:bg-white/10"
            >
              Advance to Next Phase <ArrowRight className="size-4 ml-1.5" />
            </Button>
          </div>

          {/* Interactive Prediction Question */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 space-y-4">
            <span className="text-xs font-mono font-bold uppercase text-slate-400 block">
              Which phase will the Moon transition into next?
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LUNAR_PHASES.map((phase, idx) => {
                const isSelected = userGuessPhaseIndex === idx;
                const isCorrect = idx === expectedNextPhaseIndex;
                let btnStyle = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10";

                if (isGuessSubmitted) {
                  if (isCorrect) {
                    btnStyle =
                      "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold ring-2 ring-emerald-400";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 border-rose-400 text-rose-200 font-bold";
                  }
                }

                return (
                  <button
                    key={phase.id}
                    onClick={() => handlePhaseGuess(idx)}
                    disabled={isGuessSubmitted}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${btnStyle}`}
                  >
                    <span className="text-2xl">{phase.symbol}</span>
                    <span className="text-xs font-bold leading-tight">{phase.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Prediction Feedback Card */}
            {isGuessSubmitted && (
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                  userGuessPhaseIndex === expectedNextPhaseIndex
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/30 border-rose-500/40 text-rose-200"
                }`}
              >
                {userGuessPhaseIndex === expectedNextPhaseIndex ? (
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block text-sm mb-0.5">
                    {userGuessPhaseIndex === expectedNextPhaseIndex
                      ? "Correct! You Know Your Lunar Orbit!"
                      : `Not quite! The correct next phase is ${expectedNextPhase.name}.`}
                  </span>
                  <p className="text-slate-300">
                    As the Moon orbits counter-clockwise around Earth, sunlight illuminates more of
                    the side facing Earth during waxing, and less during waning.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 2: DAYLIGHT & LATITUDE ================= */}
      {activeTab === "daylight_latitude" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Daylight Hours & Sun Elevation by Earth Latitude</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Drag your latitude position on Earth from the Equator (0°) to the Arctic Pole (90° N).
              Notice how Earth&apos;s 23.44° tilt causes extreme day length swings at high
              latitudes!
            </p>
          </div>

          {/* Controls: Season selector & Latitude Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-900/60 border border-white/10">
            {/* Season Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 block uppercase">
                Choose Orbital Position (Season):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "june", label: "June Solstice", sub: "North Tilts Toward Sun" },
                  { id: "equinox", label: "Equinox (Mar/Sep)", sub: "Equal Day & Night" },
                  { id: "december", label: "Dec Solstice", sub: "North Tilts Away" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSeason(s.id as typeof selectedSeason);
                      handleInteract("daylight_latitude");
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedSeason === s.id
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-xs font-bold">{s.label}</span>
                    <span className="block text-[10px] opacity-80 mt-0.5">{s.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Latitude Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">Earth Latitude (φ):</span>
                <span className="text-cyan-400 font-bold font-mono text-sm">
                  {selectedLatitude > 0
                    ? `${selectedLatitude}° North`
                    : selectedLatitude < 0
                      ? `${Math.abs(selectedLatitude)}° South`
                      : "0° (Equator)"}
                </span>
              </div>
              <input
                type="range"
                min={-90}
                max={90}
                value={selectedLatitude}
                onChange={(e) => {
                  setSelectedLatitude(Number(e.target.value));
                  handleInteract("daylight_latitude");
                }}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>90° S (South Pole)</span>
                <span>0° (Equator)</span>
                <span>90° N (North Pole)</span>
              </div>
            </div>
          </div>

          {/* Results Readout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block font-bold">
                Daily Daylight Duration
              </span>
              <div className="text-2xl font-mono font-extrabold text-white">
                {daylightCalculation.isPolarDay
                  ? "24.0 Hours (Midnight Sun!)"
                  : daylightCalculation.isPolarNight
                    ? "0.0 Hours (Polar Night)"
                    : `${daylightCalculation.hours} Hours`}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Time Sun is above local horizon
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 block font-bold">
                Solar Noon Sun Elevation
              </span>
              <div className="text-2xl font-mono font-extrabold text-white">
                {daylightCalculation.noonElevation}° Above Horizon
              </div>
              <span className="text-[11px] text-slate-400 block">Peak angle at solar midday</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1">
              <span className="text-[10px] font-mono uppercase text-indigo-400 block font-bold">
                Subsolar Declination (δ)
              </span>
              <div className="text-2xl font-mono font-extrabold text-white">
                {daylightCalculation.declinationDeg}°
              </div>
              <span className="text-[11px] text-slate-400 block">
                Latitude where Sun is directly overhead
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 3: SUMMER VS. WINTER TILT ================= */}
      {activeTab === "seasons_tilt" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Compare Summer vs. Winter Illumination: Axial Tilt vs. Distance</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Bust the famous astronomy misconception! Learn why Earth is actually closest to the
              Sun in January, proving that axial tilt alone drives seasonal temperatures.
            </p>
          </div>

          {/* Month Selector Pills */}
          <div className="flex gap-3">
            {[
              {
                id: "june",
                name: "June Solstice (Earth is Farther: 152M km)",
                north: "North Summer",
                south: "South Winter",
              },
              {
                id: "december",
                name: "December Solstice (Earth is Closer: 147M km!)",
                north: "North Winter",
                south: "South Summer",
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setInsolationMonth(m.id as typeof insolationMonth);
                  handleInteract("seasons_tilt");
                }}
                className={`px-4 py-3 rounded-2xl border text-left transition-all ${
                  insolationMonth === m.id
                    ? "bg-cyan-500/20 border-cyan-400 text-white font-bold ring-1 ring-cyan-400 shadow-lg"
                    : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-bold text-white">{m.name}</div>
                <div className="text-[10px] font-mono text-cyan-300 mt-0.5">
                  {m.north} • {m.south}
                </div>
              </button>
            ))}
          </div>

          {/* Solar Beam Spreading & Insolation Diagram Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-900 to-purple-950/30 border border-cyan-500/30 space-y-4">
            <h4 className="text-base font-bold text-white">
              Why Does Tilt Matter More Than Distance? Lambert&apos;s Cosine Law
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-200">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-amber-300 block text-sm">
                  ☀️ Summer: Direct, Steep Rays
                </span>
                <p className="leading-relaxed text-slate-300">
                  Sunlight strikes the ground nearly perpendicular (high elevation angle). The solar
                  beam concentrates into a tight circle, delivering maximum thermal energy per
                  square meter ($W/m^2$).
                </p>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded">
                  Beam Spreading Factor: ~1.0x (Maximum Heat Density)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-blue-300 block text-sm">
                  ❄️ Winter: Oblique, Spreading Rays
                </span>
                <p className="leading-relaxed text-slate-300">
                  Sunlight strikes at a shallow angle. The exact same solar beam spreads out across
                  more than double the ground area, diluting the warmth while photons travel through
                  more atmosphere.
                </p>
                <div className="text-xs font-mono text-amber-400 bg-amber-950/40 p-2 rounded">
                  Beam Spreading Factor: ~2.4x (Diluted Heat Density)
                </div>
              </div>
            </div>

            {/* Distance Reality Check */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
              <Sparkles className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-0.5">
                  The Orbital Distance Proof:
                </span>
                At perihelion in January, Earth is 147 million km from the Sun. At aphelion in July,
                Earth is 152 million km away. Earth is 5 million km CLOSER during the freezing
                January blizzard season in New York and Paris!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 4: ORBITAL INCLINATION & ECLIPSES ================= */}
      {activeTab === "eclipse_tilt" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Why Eclipses Do Not Occur Every Month: 5.145° Orbital Inclination</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Adjust the tilt of the Moon&apos;s orbit relative to the ecliptic plane. Discover why
              eclipses require alignment with the &quot;Line of Nodes&quot;.
            </p>
          </div>

          {/* Tilt Slider */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Moon Orbital Tilt:</span>
              <span className="text-cyan-400 font-bold font-mono text-base">
                {lunarOrbitTiltDeg.toFixed(2)}°
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={lunarOrbitTiltDeg}
              onChange={(e) => {
                setLunarOrbitTiltDeg(Number(e.target.value));
                handleInteract("eclipse_tilt");
              }}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>0° (Flat Coplanar - Monthly Eclipses)</span>
              <span className="text-emerald-400 font-bold">5.145° (Real Earth Nature)</span>
              <span>10° (High Tilt - Extremely Rare)</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLunarOrbitTiltDeg(0.0)}
                className="text-xs border-white/10 text-slate-300"
              >
                Set to 0° (Hypothetical Flat)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setLunarOrbitTiltDeg(5.15)}
                className="text-xs border-cyan-500/40 text-cyan-300"
              >
                Reset to Real 5.145°
              </Button>
            </div>
          </div>

          {/* Physical Consequence Card */}
          <div className={`p-6 rounded-2xl border space-y-3 ${eclipseProbability.color}`}>
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span>{eclipseProbability.status}</span>
              <span>
                Solar: {eclipseProbability.annualSolarEclipses} / year • Lunar:{" "}
                {eclipseProbability.annualLunarEclipses} / year
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {eclipseProbability.explanation}
            </p>
          </div>
        </div>
      )}

      {/* ================= EXPERIMENT 5: SIDEREAL VS SYNODIC LUNAR MONTH ================= */}
      {activeTab === "sidereal_synodic" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Sidereal (27.32d) vs. Synodic (29.53d) Lunar Month</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Extra 2.2 Days
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Why does it take 29.5 days to cycle through all phases even though the Moon orbits
              Earth in 27.3 days? Understand the moving coordinate frame of Earth&apos;s orbit!
            </p>
          </div>

          {/* Interactive Comparison Timeline */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-cyan-400 block">
                  1. Sidereal Lunar Month (27.32 Days)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The time required for the Moon to complete a 360° revolution relative to the
                  distant, fixed background stars.
                </p>
                <span className="text-xs font-mono text-cyan-200 font-bold block">
                  Angle = Exactly 360°
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 block">
                  2. Synodic Lunar Month (29.53 Days)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The time required to cycle from New Moon to the next New Moon. Because Earth moved
                  forward by ~27° in its orbit around the Sun, the Moon must travel for an extra 2.2
                  days to catch up!
                </p>
                <span className="text-xs font-mono text-amber-200 font-bold block">
                  Angle = 360° + ~27° = 387°!
                </span>
              </div>
            </div>

            {/* Mathematical Derivation Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-300 space-y-1">
              <span className="text-cyan-400 font-bold block">Fundamental Synodic Relation:</span>
              <p>1 / P_syn = 1 / P_sid - 1 / P_Earth</p>
              <p>1 / 29.5306 = 1 / 27.3217 - 1 / 365.2563</p>
              <p className="text-[11px] text-slate-400 pt-1">
                The exact same orbital mathematics explains the synodic periods of Mars, Jupiter,
                and all other planets across the Solar System!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
