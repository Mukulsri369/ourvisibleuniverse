import React, { useState, useMemo } from "react";
import {
  Activity,
  Layers,
  Thermometer,
  Sparkles,
  Info,
  Scale,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransitAndRadialVelocityLabProps {
  onInteraction?: () => void;
}

export function TransitAndRadialVelocityLab({ onInteraction }: TransitAndRadialVelocityLabProps) {
  const [activeTab, setActiveTab] = useState<"transit" | "radial_velocity" | "habitability_myth">(
    "transit",
  );

  // -------------------------------------------------------------
  // Tab 1: Transit Depth & Geometric Probability Experiment
  // -------------------------------------------------------------
  const [targetPlanetCategory, setTargetPlanetCategory] = useState<
    "earth" | "super_earth" | "neptune" | "jupiter"
  >("earth");
  const [hostStarRadiusRsol, setHostStarRadiusRsol] = useState<number>(1.0);
  const [limbDarkeningActive, setLimbDarkeningActive] = useState<boolean>(true);

  const planetPresets = {
    earth: { name: "Earth-Twin", radiusRearth: 1.0, color: "#38bdf8", desc: "Small rocky world" },
    super_earth: {
      name: "Super-Earth",
      radiusRearth: 1.75,
      color: "#34d399",
      desc: "Large rocky / water world",
    },
    neptune: {
      name: "Neptune-Class",
      radiusRearth: 3.88,
      color: "#818cf8",
      desc: "Ice / gas dwarf",
    },
    jupiter: { name: "Hot Jupiter", radiusRearth: 11.2, color: "#f97316", desc: "Gas giant" },
  };

  const selectedPlanet = planetPresets[targetPlanetCategory];

  const { transitDepthPct, transitDepthPpm, transitProbPct } = useMemo(() => {
    // Radius ratio Rp / R*
    const rStarInEarthRadii = hostStarRadiusRsol * 109.2;
    const k = selectedPlanet.radiusRearth / rStarInEarthRadii;
    const depthFrac = Math.pow(k, 2);
    const depthPct = depthFrac * 100;
    const depthPpm = Math.round(depthPct * 10000);

    // Geometric probability at 1 AU (assuming a = 1.0 AU = 215 R_sun)
    const aInRsol = 215;
    const probPct = ((hostStarRadiusRsol + selectedPlanet.radiusRearth / 109.2) / aInRsol) * 100;

    return {
      transitDepthPct: depthPct,
      transitDepthPpm: depthPpm,
      transitProbPct: probPct,
    };
  }, [selectedPlanet, hostStarRadiusRsol]);

  // -------------------------------------------------------------
  // Tab 2: Radial Velocity (Stellar Wobble) Simulator
  // -------------------------------------------------------------
  const [rvPlanetMassMearth, setRvPlanetMassMearth] = useState<number>(317.8); // 1 Jupiter mass = 317.8 M_earth
  const [rvSemiMajorAxisAU, setRvSemiMajorAxisAU] = useState<number>(0.05); // 0.05 AU (Hot Jupiter)
  const [rvInclinationDeg, setRvInclinationDeg] = useState<number>(90);
  const [rvOrbitalPhase, setRvOrbitalPhase] = useState<number>(0);

  // K semi-amplitude calculation:
  // K approx 28.4 m/s * (Mp sin i / M_Jup) * (M* / M_sun)^(-0.5) * (a / 1 AU)^(-0.5)
  const { rvSemiAmpMs, rvCurrentVelocityMs, dopplerShiftNm } = useMemo(() => {
    const mpJup = rvPlanetMassMearth / 317.8;
    const incRad = (rvInclinationDeg * Math.PI) / 180;
    const k = 28.4 * mpJup * Math.sin(incRad) * Math.pow(rvSemiMajorAxisAU, -0.5);

    // Instantaneous radial velocity toward observer
    const vr = k * Math.sin(rvOrbitalPhase);
    // Doppler shift at 500 nm rest wavelength: delta_lambda = lambda_0 * (vr / c)
    // c = 3e8 m/s
    const dlambda = 500 * (vr / 3e8);

    return {
      rvSemiAmpMs: k,
      rvCurrentVelocityMs: vr,
      dopplerShiftNm: dlambda,
    };
  }, [rvPlanetMassMearth, rvSemiMajorAxisAU, rvInclinationDeg, rvOrbitalPhase]);

  // -------------------------------------------------------------
  // Tab 3: Habitable Zone vs Proof of Life Debunker
  // -------------------------------------------------------------
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<
    "venus" | "mars" | "trappist1e" | "gas_giant"
  >("venus");

  const caseStudies = {
    venus: {
      name: "Venus: Runaway Greenhouse Trap",
      verdict: "Inside Sun's Extended HZ, but 100% Lethal",
      surfaceTemp: "465°C (869°F)",
      surfacePressure: "92 atm (crushing CO2)",
      waterStatus: "Completely boiled away into space",
      takeaway:
        "Venus receives only 1.9x the solar flux of Earth. Without a geochemical carbon sink, water vapor triggered a runaway greenhouse effect, oceans evaporated, and UV radiation cleaved water molecules into hydrogen that permanently escaped into space. Proximity to the habitable zone does not guarantee liquid water!",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
    },
    mars: {
      name: "Mars: The Frozen Dynamo Collapse",
      verdict: "Inside Sun's Outer HZ, but Frigid & Airless",
      surfaceTemp: "-63°C (-81°F)",
      surfacePressure: "0.006 atm (below water triple point)",
      waterStatus: "Locked as subsurface permafrost & polar dry ice",
      takeaway:
        "Mars orbits at 1.52 AU, squarely inside the Sun's maximum greenhouse zone. However, because Mars is only 10% of Earth's mass, its molten iron core cooled rapidly, shutting down its global magnetic dynamo ~4 billion years ago. The unshielded solar wind stripped away 99% of its atmosphere, dropping pressure so low that pure liquid water boils into vapor immediately.",
      color: "from-rose-500/20 to-red-500/20 border-rose-500/30",
    },
    trappist1e: {
      name: "TRAPPIST-1e: The M-Dwarf Superflare Dilemma",
      verdict: "Prime HZ Orbit, but Tidally Locked & Irradiated",
      surfaceTemp: "-22°C (Equilibrium, requires atmosphere)",
      surfacePressure: "Currently under JWST investigation",
      waterStatus: "Possible ocean world if atmosphere survived",
      takeaway:
        "TRAPPIST-1e orbits inside the habitable zone of an M-dwarf star. However, it orbits at 0.029 AU and is synchronously tidally locked (permanent boiling daylight on one side, frozen eternal night on the other). Furthermore, M-dwarfs emit frequent superflares with 1,000x the X-ray/EUV radiation of the Sun, which could erode nascent atmospheres.",
      color: "from-sky-500/20 to-cyan-500/20 border-sky-500/30",
    },
    gas_giant: {
      name: "Kepler-1647b: Gas Giant in Habitable Zone",
      verdict: "Inside Habitable Zone, but NO Solid Surface",
      surfaceTemp: "-20°C (at upper cloud decks)",
      surfacePressure: "Thousands to millions of atmospheres in interior",
      waterStatus: "Water vapor clouds; no surface to pool liquid water",
      takeaway:
        "Thousands of exoplanets discovered in habitable zones are gas giants larger than Neptune or Saturn! These worlds have no solid ground for liquid oceans to collect upon. While hypothetical rocky moons orbiting such giants might be habitable, the planet itself cannot support terrestrial-style surface life.",
      color: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
    },
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Tab Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Detection Physics & Habitability Laboratory
          </h3>
          <p className="text-xs text-slate-300">
            Experiment with transit depth equations, radial velocity Doppler shifts, and the
            scientific limits of habitable zones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <Button
            size="sm"
            variant={activeTab === "transit" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("transit");
              if (onInteraction) onInteraction();
            }}
            className={`text-xs h-8 ${activeTab === "transit" ? "bg-cyan-600 text-white" : "text-slate-300"}`}
          >
            1. Transit Depth Lab
          </Button>
          <Button
            size="sm"
            variant={activeTab === "radial_velocity" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("radial_velocity");
              if (onInteraction) onInteraction();
            }}
            className={`text-xs h-8 ${activeTab === "radial_velocity" ? "bg-cyan-600 text-white" : "text-slate-300"}`}
          >
            2. Radial Velocity Wobble
          </Button>
          <Button
            size="sm"
            variant={activeTab === "habitability_myth" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("habitability_myth");
              if (onInteraction) onInteraction();
            }}
            className={`text-xs h-8 ${activeTab === "habitability_myth" ? "bg-cyan-600 text-white" : "text-slate-300"}`}
          >
            3. Habitable Zone Myth-Buster
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* TAB 1: Transit Depth & Formula Breakdown */}
      {/* -------------------------------------------------------- */}
      {activeTab === "transit" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              Planet Radius vs. Transit Depth (ΔF / F)
            </h4>
            <p className="text-xs text-slate-300">
              When a planet crosses the stellar disk, the fraction of starlight blocked is
              proportional to the squared ratio of planetary radius to stellar radius:
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 text-center font-mono text-cyan-300 text-sm">
              ΔF / F ≈ (R_planet / R_star)² = (Area_planet / Area_star)
            </div>

            {/* Planet Selection Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Select Exoplanet Category:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(planetPresets) as (keyof typeof planetPresets)[]).map((key) => {
                  const p = planetPresets[key];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setTargetPlanetCategory(key);
                        if (onInteraction) onInteraction();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        targetPlanetCategory === key
                          ? "bg-cyan-500/10 border-cyan-500 text-cyan-200"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.radiusRearth} R⊕
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Host Star Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Host Star Radius (R☉):</span>
                <span className="font-mono text-amber-300">{hostStarRadiusRsol.toFixed(2)} R☉</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.05"
                value={hostStarRadiusRsol}
                onChange={(e) => setHostStarRadiusRsol(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0.2 R☉ (Red Dwarf)</span>
                <span>1.0 R☉ (Sun)</span>
                <span>2.0 R☉ (F-dwarf/Subgiant)</span>
              </div>
            </div>

            {/* Limb Darkening Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Stellar Limb Darkening
                </span>
                <span className="text-[11px] text-slate-400">
                  Photosphere is dimmer at edges, rounding light curve base
                </span>
              </div>
              <button
                onClick={() => setLimbDarkeningActive(!limbDarkeningActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                  limbDarkeningActive
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400"
                }`}
              >
                {limbDarkeningActive ? "Enabled (Realistic)" : "Flat (Simplified)"}
              </button>
            </div>
          </div>

          {/* Right: Transit Visualizer & Math Breakdown */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Calculated Transit Signal</span>
                <span className="text-cyan-400 font-mono">{transitDepthPpm} PPM</span>
              </h5>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fractional Dip:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {transitDepthPct.toFixed(4)}%
                  </span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Geometric Probability:</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {transitProbPct.toFixed(2)}%
                    <span className="text-[10px] text-slate-400 ml-1">
                      (1 in {Math.round(100 / transitProbPct)})
                    </span>
                  </span>
                </div>
              </div>

              {/* Graphical Scale Comparison */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Cross-Section Scale (Planet Silhouette on Star Face):
                </span>
                <div className="relative h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Star circle */}
                  <div
                    className="rounded-full bg-amber-400/90 shadow-lg flex items-center justify-center relative"
                    style={{
                      width: `${Math.min(110, hostStarRadiusRsol * 60)}px`,
                      height: `${Math.min(110, hostStarRadiusRsol * 60)}px`,
                    }}
                  >
                    {/* Planet silhouette */}
                    <div
                      className="rounded-full bg-slate-950 border border-cyan-400"
                      style={{
                        width: `${Math.max(3, (selectedPlanet.radiusRearth / (hostStarRadiusRsol * 109.2)) * Math.min(110, hostStarRadiusRsol * 60) * 3)}px`,
                        height: `${Math.max(3, (selectedPlanet.radiusRearth / (hostStarRadiusRsol * 109.2)) * Math.min(110, hostStarRadiusRsol * 60) * 3)}px`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Scholar Limitations Box */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Advanced Learner Note & Stated Limitations:
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The formula <strong>ΔF / F ≈ (R_p / R_*)²</strong> assumes a uniform circular disk
                and an opaque, spherical planet. In real astrophysics, stellar limb darkening causes
                the center of the transit to be deeper than the edges. Furthermore, grazing transits
                (impact parameter b ≈ 1) create V-shaped rather than U-shaped dips, and planetary
                atmospheres cause wavelength-dependent transit depths.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 2: Radial Velocity (Stellar Wobble) Simulator */}
      {/* -------------------------------------------------------- */}
      {activeTab === "radial_velocity" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Doppler Reflex Motion (The Stellar Wobble)
              </h4>
              <p className="text-xs text-slate-300">
                A planet and its star both orbit their common center of mass (barycenter). As the
                host star wobbles toward Earth, its spectral lines shift blue; as it moves away,
                they shift red.
              </p>

              {/* Presets: Hot Jupiter vs Earth */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRvPlanetMassMearth(317.8);
                    setRvSemiMajorAxisAU(0.05);
                    if (onInteraction) onInteraction();
                  }}
                  className="text-xs h-7 border-slate-700 text-slate-200"
                >
                  Hot Jupiter (51 Pegasi b)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setRvPlanetMassMearth(1.0);
                    setRvSemiMajorAxisAU(1.0);
                    if (onInteraction) onInteraction();
                  }}
                  className="text-xs h-7 border-slate-700 text-slate-200"
                >
                  Earth-Sun Analog
                </Button>
              </div>

              {/* Sliders for RV */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Planet Mass (M⊕):</span>
                    <span className="font-mono text-cyan-300">
                      {rvPlanetMassMearth.toFixed(1)} M⊕ ({(rvPlanetMassMearth / 317.8).toFixed(2)}{" "}
                      M_Jup)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    step="5"
                    value={rvPlanetMassMearth}
                    onChange={(e) => setRvPlanetMassMearth(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Semi-Major Axis (a in AU):</span>
                    <span className="font-mono text-cyan-300">
                      {rvSemiMajorAxisAU.toFixed(3)} AU
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="1.5"
                    step="0.01"
                    value={rvSemiMajorAxisAU}
                    onChange={(e) => setRvSemiMajorAxisAU(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Orbit Orbital Phase Scrub:</span>
                    <span className="font-mono text-amber-300">
                      {((rvOrbitalPhase / (Math.PI * 2)) * 360).toFixed(0)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.PI * 2}
                    step="0.05"
                    value={rvOrbitalPhase}
                    onChange={(e) => setRvOrbitalPhase(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Right: Doppler Spectrum & Velocity Readout */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Velocity Semi-Amplitude (K)
                  </span>
                  <span className="font-mono text-sm font-bold text-amber-400">
                    K ≈{" "}
                    {rvSemiAmpMs >= 1
                      ? `${rvSemiAmpMs.toFixed(1)} m/s`
                      : `${(rvSemiAmpMs * 100).toFixed(1)} cm/s`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Line-of-Sight Velocity:</span>
                  <span
                    className={`font-bold ${
                      rvCurrentVelocityMs > 0.05
                        ? "text-rose-400"
                        : rvCurrentVelocityMs < -0.05
                          ? "text-cyan-400"
                          : "text-slate-200"
                    }`}
                  >
                    {rvCurrentVelocityMs > 0 ? "+" : ""}
                    {rvCurrentVelocityMs.toFixed(2)} m/s{" "}
                    {rvCurrentVelocityMs > 0
                      ? "(Redshift - Moving Away)"
                      : rvCurrentVelocityMs < 0
                        ? "(Blueshift - Approaching)"
                        : "(Quadrature)"}
                  </span>
                </div>

                {/* Simulated Spectrograph Absorption Line Shift */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span>Blueshift (Shorter λ)</span>
                    <span className="text-white">Rest Wavelength (500 nm)</span>
                    <span>Redshift (Longer λ)</span>
                  </div>

                  <div className="relative h-14 w-full rounded-xl overflow-hidden border border-slate-700 bg-gradient-to-r from-blue-600 via-green-500 via-yellow-400 to-red-600 flex items-center">
                    {/* Fixed rest absorption line marker */}
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-slate-900/60 z-10" />

                    {/* Doppler-shifted absorption doublet lines */}
                    <div
                      className="absolute top-0 bottom-0 flex gap-2 transition-transform duration-75 z-20"
                      style={{
                        left: `calc(50% + ${Math.max(-45, Math.min(45, (rvCurrentVelocityMs / Math.max(1, rvSemiAmpMs)) * 40))}%)`,
                      }}
                    >
                      <div className="w-[3px] h-full bg-slate-950 shadow-md" />
                      <div className="w-[2px] h-full bg-slate-950 shadow-md" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory Callout */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300">
                <span className="font-semibold text-white block mb-1">
                  Why Was 51 Pegasi b Discovered First?
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Hot Jupiters orbit so close to their host star that they induce enormous reflex
                  velocities of <strong>50 to 100 m/s</strong> (car highway speeds), easily
                  detectable by 1990s spectrographs. In contrast, finding an Earth twin requires
                  detecting a wobble of just <strong>0.09 m/s (9 cm/s)</strong>—the crawl of an
                  infant or a Galapagos tortoise!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB 3: Habitable Zone vs Proof of Life Debunker */}
      {/* -------------------------------------------------------- */}
      {activeTab === "habitability_myth" && (
        <div className="space-y-6">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              Critical Scientific Distinction: Habitable Zone ≠ Proof of Life
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In popular science, announcements often declare an exoplanet to be in the "Goldilocks
              Habitable Zone," leading people to believe alien life or oceans have been confirmed.
              In truth, the habitable zone is merely an orbital distance calculation based on
              stellar luminosity. Surface habitability depends on atmospheric composition, magnetic
              shielding, and stellar temperament.
            </p>

            {/* Case Study Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(caseStudies) as (keyof typeof caseStudies)[]).map((key) => {
                const cs = caseStudies[key];
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedCaseStudy(key);
                      if (onInteraction) onInteraction();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCaseStudy === key
                        ? "bg-slate-800 border-cyan-500 shadow-md"
                        : "bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{cs.name.split(":")[0]}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {cs.name.split(":")[1]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Case Study Detail Card */}
          {(() => {
            const cs = caseStudies[selectedCaseStudy];
            return (
              <div
                className={`p-5 rounded-2xl border bg-gradient-to-br ${cs.color} space-y-4 shadow-xl`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{cs.name}</h4>
                    <span className="text-xs font-mono text-cyan-300 font-semibold">
                      {cs.verdict}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">Surface Temperature:</span>
                    <span className="text-sm font-bold text-white font-mono">{cs.surfaceTemp}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">Atmospheric Pressure:</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {cs.surfacePressure}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">Liquid Water Status:</span>
                    <span className="text-sm font-bold text-white font-mono">{cs.waterStatus}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-white block mb-1">Astrophysical Analysis:</strong>
                  {cs.takeaway}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
