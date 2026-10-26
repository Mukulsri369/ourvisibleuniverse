import * as THREE from "three";
import { ECLIPTIC_TO_SCENE } from "./solar-galactic-motion";
import { jplEphemerisManager } from "@/lib/astronomy/jpl/ephemeris-cache";
/**
 * NASA JPL Horizons Solar System Controller & Ephemeris Dashboard
 *
 * Implements:
 * 1. Astronomical Date Selection & Historical/Future Landmark Quick-Jumps.
 * 2. Time scrubbing, playback controls, and simulation speed multipliers.
 * 3. Model selector (JPL DE440 vs Analytical) with documented accuracy limits.
 * 4. Educational layer toggles (Velocity Vectors, Lagrange Points, Barycenter, Distance Ruler, Resonances).
 * 5. Planet visibility magnification slider (scaled discs preserving exact orbits).
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store";
import {
  getSimulationDate,
  getSimulationJd,
  setSimulationDate,
  stepSimulationDays,
  toggleSimPaused,
  getSimPaused,
  setTimeMultiplier,
  getTimeMultiplier,
  getGalacticTimeYears,
  getGalacticTimeScale,
  setGalacticTimeScale,
} from "./sim-clock";
import { JPL_BENCHMARK_DATES } from "@/lib/astronomy/jpl/horizons-ephemeris";
import { SOLAR_SYSTEM_RESONANCES } from "@/lib/astronomy/jpl/orbital-resonances";

export function SolarSystemController({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentJd, setCurrentJd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(1);
  const [galacticScale, setGalacticScale] = useState(getGalacticTimeScale);
  const [galacticEpoch, setGalacticEpoch] = useState(getGalacticTimeYears);
  const [earthPlaneAngle, setEarthPlaneAngle] = useState(60.19);
  const [customDateInput, setCustomDateInput] = useState("");
  const [showResonanceModal, setShowResonanceModal] = useState(false);

  const showOrbits = useStore((s) => s.showOrbits);
  const toggleOrbits = useStore((s) => s.toggleOrbits);
  const showVelocityVectors = useStore((s) => s.showVelocityVectors);
  const toggleVelocityVectors = useStore((s) => s.toggleVelocityVectors);
  const showLagrangePoints = useStore((s) => s.showLagrangePoints);
  const toggleLagrangePoints = useStore((s) => s.toggleLagrangePoints);
  const showBarycenterMarkers = useStore((s) => s.showBarycenterMarkers);
  const toggleBarycenterMarkers = useStore((s) => s.toggleBarycenterMarkers);
  const showInterplanetaryDistances = useStore((s) => s.showInterplanetaryDistances);
  const toggleInterplanetaryDistances = useStore((s) => s.toggleInterplanetaryDistances);
  const distanceTargetPlanet = useStore((s) => s.distanceTargetPlanet);
  const setDistanceTargetPlanet = useStore((s) => s.setDistanceTargetPlanet);
  const showResonanceOverlay = useStore((s) => s.showResonanceOverlay);
  const toggleResonanceOverlay = useStore((s) => s.toggleResonanceOverlay);
  const planetVisibilityMagnification = useStore((s) => s.planetVisibilityMagnification);
  const setPlanetVisibilityMagnification = useStore((s) => s.setPlanetVisibilityMagnification);
  const showGalacticDrift = useStore((s) => s.showGalacticDrift);
  const toggleGalacticDrift = useStore((s) => s.toggleGalacticDrift);
  const ephemerisModel = useStore((s) => s.ephemerisModel);
  const setEphemerisModel = useStore((s) => s.setEphemerisModel);

  // Poll live simulation time for display
  useEffect(() => {
    const interval = setInterval(() => {
      const d = getSimulationDate();
      setCurrentDateStr(d.toISOString().slice(0, 10));
      setCurrentJd(getSimulationJd());
      setIsPaused(getSimPaused());
      setSelectedSpeed(getTimeMultiplier());
      setGalacticScale(getGalacticTimeScale());
      setGalacticEpoch(getGalacticTimeYears());
      const earth = jplEphemerisManager.getPlanetState("Earth", getSimulationJd());
      const pole = new THREE.Vector3(earth.xAu, earth.zAu, earth.yAu)
        .cross(new THREE.Vector3(earth.vxKmS, earth.vzKmS, earth.vyKmS))
        .transformDirection(ECLIPTIC_TO_SCENE);
      setEarthPlaneAngle(THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.abs(pole.y)))));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleApplyDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDateInput) return;
    const parsed = new Date(customDateInput);
    if (!isNaN(parsed.getTime())) {
      setSimulationDate(parsed);
    }
  };

  const handleSpeedChange = (mult: number) => {
    setTimeMultiplier(mult);
    setSelectedSpeed(mult);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="fixed left-4 top-16 z-40 max-h-[85vh] w-[420px] overflow-y-auto rounded-2xl border border-white/15 bg-black/85 p-6 text-white shadow-2xl backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-medium tracking-wide text-white">NASA JPL Horizons Engine</h3>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                DE440/DE441 Barycentric Ephemerides & Dynamics
              </p>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Current Simulation Epoch Display */}
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/50">Astronomical Date (UTC)</span>
              <span className="font-mono font-medium text-emerald-300">{currentDateStr}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-white/50">Julian Date (TDB)</span>
              <span className="font-mono text-[11px] text-white/80">{currentJd.toFixed(3)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-white/50">Ephemeris Precision</span>
              <span className="font-mono text-[10px] text-cyan-300">
                {ephemerisModel === "horizons_de440"
                  ? "JPL DE440 (±0.003 AU)"
                  : "Keplerian Analytical"}
              </span>
            </div>
          </div>

          {/* Time Controls */}
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">
              Time Controls
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => stepSimulationDays(-1)}
                title="Step backward 1 day"
                className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                -1 Day
              </button>
              <button
                onClick={() => {
                  const p = toggleSimPaused();
                  setIsPaused(p);
                }}
                className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition ${
                  isPaused
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                    : "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                }`}
              >
                {isPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <button
                onClick={() => stepSimulationDays(1)}
                title="Step forward 1 day"
                className="flex-1 rounded-lg border border-white/15 bg-white/5 py-1.5 text-xs text-white/80 hover:bg-white/15"
              >
                +1 Day
              </button>
            </div>

            {/* Simulation Speed Presets */}
            <div className="mt-2 grid grid-cols-4 gap-1.5 text-[11px]">
              {[
                { label: "1× Real", mult: 0.086 },
                { label: "1 d/s", mult: 1.0 },
                { label: "7 d/s", mult: 7.0 },
                { label: "30 d/s", mult: 30.0 },
                { label: "1 yr/s", mult: 365.25 },
                { label: "5 yr/s", mult: 1826.0 },
                { label: "Reverse", mult: -30.0 },
                { label: "Fast Rev", mult: -365.25 },
              ].map((sp) => (
                <button
                  key={sp.label}
                  onClick={() => handleSpeedChange(sp.mult)}
                  className={`rounded-lg border px-2 py-1 text-center transition ${
                    Math.abs(selectedSpeed - sp.mult) < 0.1
                      ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Historical & Future Landmark Quick-Jumps */}
          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">
              Historical & Mission Landmarks
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSimulationDate(new Date())}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">Today (Current)</div>
                <div className="text-[10px] text-white/40">Present real-time positions</div>
              </button>
              <button
                onClick={() => setSimulationDate("2000-01-01T12:00:00Z")}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">J2000.0 Epoch</div>
                <div className="text-[10px] text-white/40">Standard celestial origin</div>
              </button>
              <button
                onClick={() => setSimulationDate("1969-07-20T20:17:00Z")}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">Apollo 11 (1969)</div>
                <div className="text-[10px] text-white/40">First human lunar landing</div>
              </button>
              <button
                onClick={() => setSimulationDate("1989-08-25T04:00:00Z")}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">Voyager 2 Neptune</div>
                <div className="text-[10px] text-white/40">Historic ice giant flyby</div>
              </button>
              <button
                onClick={() => setSimulationDate("2020-12-21T18:22:00Z")}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">Great Conjunction</div>
                <div className="text-[10px] text-white/40">Jupiter–Saturn 0.1° close pass</div>
              </button>
              <button
                onClick={() => setSimulationDate("2015-07-14T11:49:00Z")}
                className="rounded-lg border border-white/15 bg-white/5 p-2 text-left hover:bg-white/15"
              >
                <div className="font-medium text-white/90">New Horizons Pluto</div>
                <div className="text-[10px] text-white/40">Historic Kuiper Belt encounter</div>
              </button>
            </div>

            {/* Custom Date Input Form */}
            <form onSubmit={handleApplyDate} className="mt-3 flex gap-2">
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => setCustomDateInput(e.target.value)}
                className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="rounded-lg border border-emerald-400/50 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/30"
              >
                Go
              </button>
            </form>
          </div>

          {/* Educational Layer Toggles */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="text-[11px] uppercase tracking-wider text-white/50 mb-2">
              Scientific Overlays & Dynamics
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs cursor-pointer">
                <span className="text-white/80">Keplerian 3D Orbit Paths</span>
                <input
                  type="checkbox"
                  checked={showOrbits}
                  onChange={toggleOrbits}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white/80">Velocity Vectors (v in km/s)</span>
                  <div className="text-[10px] text-white/40">Instantaneous orbital speeds</div>
                </div>
                <input
                  type="checkbox"
                  checked={showVelocityVectors}
                  onChange={toggleVelocityVectors}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white/80">Three-Body Lagrange Points (L1–L5)</span>
                  <div className="text-[10px] text-white/40">JWST, SOHO, & Jupiter Trojans</div>
                </div>
                <input
                  type="checkbox"
                  checked={showLagrangePoints}
                  onChange={toggleLagrangePoints}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white/80">Solar System Barycenter (SSB)</span>
                  <div className="text-[10px] text-white/40">Sun's 2 solar radii wobble loop</div>
                </div>
                <input
                  type="checkbox"
                  checked={showBarycenterMarkers}
                  onChange={toggleBarycenterMarkers}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white/80">Interplanetary Distance Ruler</span>
                  <div className="text-[10px] text-white/40">
                    Earth to target body & light travel time
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showInterplanetaryDistances}
                  onChange={toggleInterplanetaryDistances}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>

              {showInterplanetaryDistances && (
                <div className="flex items-center gap-2 pl-4 py-1 text-xs">
                  <span className="text-white/50 text-[11px]">Ruler Target:</span>
                  <select
                    value={distanceTargetPlanet}
                    onChange={(e) => setDistanceTargetPlanet(e.target.value)}
                    className="rounded border border-white/15 bg-black px-2 py-1 text-xs text-white/90 outline-none"
                  >
                    {[
                      "Mercury",
                      "Venus",
                      "Mars",
                      "Jupiter",
                      "Saturn",
                      "Uranus",
                      "Neptune",
                      "Pluto",
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="flex items-center justify-between text-xs cursor-pointer">
                <div>
                  <span className="text-white/80">Galactic Drift Model</span>
                  <div className="text-[10px] text-white/40">
                    Galactic orbit with radial and vertical motion
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showGalacticDrift}
                  onChange={toggleGalacticDrift}
                  className="rounded border-white/20 bg-white/10 text-emerald-500 accent-emerald-500"
                />
              </label>
            </div>
          </div>

          <section className="mt-5 border-t border-white/10 pt-4" aria-label="Galactic motion">
            <label className="block text-xs text-white/80">
              Galactic time acceleration
              <select
                value={galacticScale}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setGalacticTimeScale(value);
                  setGalacticScale(value);
                }}
                className="mt-2 min-h-11 w-full rounded-lg border border-white/15 bg-black px-3 text-white"
              >
                {[1, 1000, 100000, 1000000, 10000000, 100000000].map((value) => (
                  <option key={value} value={value}>
                    {value === 1
                      ? "Physical · same time as planets"
                      : value.toLocaleString() + "× · Galactic orbit only"}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-[11px] leading-relaxed text-white/60">
              Galactic epoch: {(galacticEpoch / 1e6).toFixed(4)} Myr from J2000.
              {Math.abs(galacticEpoch) >= 5e8
                ? " Model boundary reached; reverse time to return."
                : ""}{" "}
              The Sun follows an approximate orbit in a smooth Galactic potential. The J2000
              ecliptic is tilted about 60.2° to the Galactic plane; it does not turn with the travel
              direction.
            </p>
            <p className="mt-2 text-[11px] text-white/70">
              Earth’s orbital plane to Galactic plane: {earthPlaneAngle.toFixed(3)}°
              <span className="block text-[10px] text-white/40">
                At the planetary date; includes the existing secular orbital-element model.
              </span>
            </p>
            <p className="mt-2 text-[10px] leading-relaxed text-white/40">
              Acceleration changes the Galactic clock only. Planetary dates, orbits and sizes retain
              their existing controls. The model covers ±500 Myr and omits spiral-arm encounters,
              Galactic evolution and long-term planetary-plane evolution. Astronomical date
              selection resets both clocks.
            </p>
          </section>

          {/* Planet Visibility Magnification */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-white/80">Planet Visibility Magnification</span>
              <span className="font-mono text-cyan-300">
                {planetVisibilityMagnification.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min={1.0}
              max={8.0}
              step={0.5}
              value={planetVisibilityMagnification}
              onChange={(e) => setPlanetVisibilityMagnification(parseFloat(e.target.value))}
              className="mt-2 w-full accent-emerald-400"
            />
            <div className="text-[10px] text-white/40 mt-1">
              Magnifies planetary discs for orbital viewing while preserving exact Keplerian
              positions.
            </div>
          </div>

          {/* Orbital Resonances Info Button */}
          <div className="mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setShowResonanceModal(true)}
              className="w-full rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
            >
              🪐 View Orbital Resonances (Laplace 4:2:1 & Pluto)
            </button>
          </div>

          {/* Citation & Provenance Footer */}
          <div className="mt-5 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-white/40">
            Authoritative Data: NASA JPL Horizons On-Line Ephemeris System (DE440/DE441) · Standish
            (1992, 2020) · IAU WGCCRE (2018).
          </div>
        </motion.div>
      )}

      {/* Resonance Details Modal */}
      {showResonanceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setShowResonanceModal(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/20 bg-neutral-950 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-light text-white">Solar System Orbital Resonances</h3>
              <button
                onClick={() => setShowResonanceModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/60 hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {SOLAR_SYSTEM_RESONANCES.map((res) => (
                <div key={res.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-medium text-emerald-300">{res.name}</h4>
                    <span className="font-mono text-xs rounded bg-white/10 px-2 py-0.5 text-white/80">
                      {res.ratio}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-white/50">Bodies: {res.bodies.join(", ")}</div>
                  <div className="mt-2 text-xs leading-relaxed text-white/70">
                    <span className="font-medium text-white/90">Mechanism:</span>{" "}
                    {res.physicsMechanism}
                  </div>
                  <div className="mt-1.5 text-xs leading-relaxed text-white/60">
                    <span className="font-medium text-white/80">Consequences:</span>{" "}
                    {res.consequences}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
