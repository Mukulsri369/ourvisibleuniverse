import React, { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  Radio,
  Sun,
  Activity,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Zap,
  Cpu,
  Flame,
  Award,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpaceWeatherActivityProps {
  onActivityCompleted?: () => void;
}

type MissionPhase = "briefing" | "phase1_flare" | "phase2_protons" | "phase3_cme" | "debrief";

export function SpaceWeatherActivity({ onActivityCompleted }: SpaceWeatherActivityProps) {
  const [phase, setPhase] = useState<MissionPhase>("briefing");

  // Satellite Telemetry State
  const [starTrackerShuttered, setStarTrackerShuttered] = useState(false);
  const [panelsEdgeOn, setPanelsEdgeOn] = useState(false);
  const [safeModeEngaged, setSafeModeEngaged] = useState(false);
  const [orbitBoostActive, setOrbitBoostActive] = useState(false);
  const [chargeDissipatorActive, setChargeDissipatorActive] = useState(false);

  // Status Metrics (0 - 100)
  const [satelliteHealth, setSatelliteHealth] = useState(100);
  const [memoryIntegrity, setMemoryIntegrity] = useState(100);
  const [solarPanelHealth, setSolarPanelHealth] = useState(100);
  const [orbitAltitudeKm, setOrbitAltitudeKm] = useState(550); // Low Earth Orbit 550 km

  // Countdown timer for phases
  const [timeLeftSec, setTimeLeftSec] = useState(25);
  const [timerRunning, setTimerRunning] = useState(false);

  // Score
  const [missionScore, setMissionScore] = useState(0);

  // Reset simulation
  const handleReset = () => {
    setPhase("briefing");
    setStarTrackerShuttered(false);
    setPanelsEdgeOn(false);
    setSafeModeEngaged(false);
    setOrbitBoostActive(false);
    setChargeDissipatorActive(false);
    setSatelliteHealth(100);
    setMemoryIntegrity(100);
    setSolarPanelHealth(100);
    setOrbitAltitudeKm(550);
    setTimeLeftSec(25);
    setTimerRunning(false);
    setMissionScore(0);
  };

  const handleStartMission = () => {
    setPhase("phase1_flare");
    setTimeLeftSec(20);
    setTimerRunning(true);
  };

  // Phase transition and damage resolution
  useEffect(() => {
    if (!timerRunning) return;

    if (timeLeftSec <= 0) {
      if (phase === "phase1_flare") {
        // Evaluate Phase 1: X-ray flare impact
        if (!starTrackerShuttered) {
          setSatelliteHealth((h) => Math.max(20, h - 25));
        }
        setPhase("phase2_protons");
        setTimeLeftSec(22);
      } else if (phase === "phase2_protons") {
        // Evaluate Phase 2: Relativistic protons impact
        let penalty = 0;
        if (!panelsEdgeOn) {
          setSolarPanelHealth((p) => Math.max(30, p - 35));
          penalty += 20;
        }
        if (!safeModeEngaged) {
          setMemoryIntegrity((m) => Math.max(20, m - 40));
          penalty += 25;
        }
        setSatelliteHealth((h) => Math.max(10, h - penalty));
        setPhase("phase3_cme");
        setTimeLeftSec(25);
      } else if (phase === "phase3_cme") {
        // Evaluate Phase 3: CME shock & thermospheric drag
        let penalty = 0;
        if (!orbitBoostActive) {
          setOrbitAltitudeKm(470); // 80 km orbital decay from expanded thermosphere drag
          penalty += 25;
        }
        if (!chargeDissipatorActive) {
          penalty += 20;
        }
        const finalHealth = Math.max(5, satelliteHealth - penalty);
        setSatelliteHealth(finalHealth);
        setPhase("debrief");
        setTimerRunning(false);

        // Compute final score
        const score = Math.round(
          finalHealth * 0.4 + memoryIntegrity * 0.3 + solarPanelHealth * 0.3,
        );
        setMissionScore(score);

        if (score >= 65 && onActivityCompleted) {
          onActivityCompleted();
        }
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSec((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [
    timerRunning,
    timeLeftSec,
    phase,
    starTrackerShuttered,
    panelsEdgeOn,
    safeModeEngaged,
    orbitBoostActive,
    chargeDissipatorActive,
    satelliteHealth,
    memoryIntegrity,
    solarPanelHealth,
    onActivityCompleted,
  ]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* 1. MISSION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold uppercase flex items-center gap-1.5">
              <AlertTriangle className="size-3" /> Space Weather Mission Control
            </span>
            <span className="text-xs text-slate-400">Target: Aegis-1 Orbital Observatory</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">Protect the Satellite Challenge</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            A massive X-class solar flare and coronal mass ejection have just erupted from the Sun.
            Command your spacecraft through three distinct waves of solar radiation!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {phase !== "briefing" && phase !== "debrief" && (
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">Time to Next Wave</span>
              <span className="text-2xl font-mono font-bold text-amber-400">{timeLeftSec}s</span>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
          >
            <RotateCcw className="size-3.5 mr-1" /> Reset Sim
          </Button>
        </div>
      </div>

      {/* 2. SATELLITE TELEMETRY STATUS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 block">Overall Hull Integrity</span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-lg font-mono font-bold ${
                satelliteHealth > 70
                  ? "text-emerald-400"
                  : satelliteHealth > 40
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {satelliteHealth}%
            </span>
            <span className="text-[10px] text-slate-500">Nominal &gt; 80%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                satelliteHealth > 70
                  ? "bg-emerald-500"
                  : satelliteHealth > 40
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${satelliteHealth}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 block">Flight Memory Integrity</span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-lg font-mono font-bold ${
                memoryIntegrity > 70
                  ? "text-cyan-400"
                  : memoryIntegrity > 40
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            >
              {memoryIntegrity}%
            </span>
            <span className="text-[10px] text-slate-500">Bit-flip protection</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                memoryIntegrity > 70 ? "bg-cyan-500" : "bg-red-500"
              }`}
              style={{ width: `${memoryIntegrity}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 block">Solar Array Efficiency</span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-lg font-mono font-bold ${
                solarPanelHealth > 70 ? "text-amber-400" : "text-red-400"
              }`}
            >
              {solarPanelHealth}%
            </span>
            <span className="text-[10px] text-slate-500">Power Output</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                solarPanelHealth > 70 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${solarPanelHealth}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
          <span className="text-xs text-slate-400 block">Orbit Altitude (LEO)</span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-lg font-mono font-bold ${
                orbitAltitudeKm >= 520 ? "text-purple-400" : "text-red-400"
              }`}
            >
              {orbitAltitudeKm} km
            </span>
            <span className="text-[10px] text-slate-500">Target: 550 km</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                orbitAltitudeKm >= 520 ? "bg-purple-500" : "bg-red-500"
              }`}
              style={{ width: `${(orbitAltitudeKm / 600) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. MISSION STAGE CARDS */}
      {phase === "briefing" && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-amber-950/30 border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Info className="size-5" />
            <h4 className="text-base font-bold text-white">
              Mission Briefing: Solar Storm Inbound
            </h4>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            NASA Solar Dynamics Observatory (SDO) has detected an extreme{" "}
            <strong>X9.3 Flare</strong> from Active Region AR3664. Space weather unfolds across
            three distinct arrival phases based on physical propagation speeds:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-amber-300 block">Phase 1: Speed of Light (c)</span>
              <p className="text-slate-400">
                Arrives in <strong>8.3 minutes</strong>. Extreme ultraviolet & soft X-rays blind
                optical star trackers and disrupt high-frequency radio.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-red-300 block">
                Phase 2: Relativistic Protons (SEPs)
              </span>
              <p className="text-slate-400">
                Arrives in <strong>30–60 minutes</strong>. Relativistic protons bombard solar arrays
                and trigger bit flips (SEUs) in computer memory.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <span className="font-bold text-purple-300 block">Phase 3: CME Plasma Shock</span>
              <p className="text-slate-400">
                Arrives in <strong>18–36 hours</strong>. Billions of tons of magnetized plasma heat
                Earth's thermosphere, creating atmospheric drag and electrostatic charging.
              </p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleStartMission}
            className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-black font-extrabold shadow-lg shadow-amber-500/20"
          >
            <span>Acknowledge Warning & Begin Defense Operation</span>
            <ChevronRight className="size-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* PHASE 1: X-RAY FLARE */}
      {phase === "phase1_flare" && (
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-amber-400 animate-pulse" />
              <h4 className="text-base font-bold text-white">
                Phase 1: X-Ray Flare Arrival (R3 Strong Radio Blackout)
              </h4>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Speed: c (300,000 km/s)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Blinding X-ray and EUV radiation is currently flooding the satellite. The star trackers
            are in danger of permanent sensor damage and orientation loss!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <span className="font-bold text-white text-sm block">
                Optical Star Tracker Protective Shutter
              </span>
              <span className="text-xs text-slate-400">
                Close mechanical iris to protect CMOS optical sensors from blinding X-ray flux.
              </span>
            </div>

            <Button
              size="sm"
              onClick={() => setStarTrackerShuttered((prev) => !prev)}
              className={
                starTrackerShuttered
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  : "bg-red-600 hover:bg-red-500 text-white font-bold"
              }
            >
              {starTrackerShuttered ? (
                <>
                  <CheckCircle2 className="size-4 mr-1.5" /> Shutter CLOSED (Protected)
                </>
              ) : (
                <>
                  <AlertTriangle className="size-4 mr-1.5" /> Shutter OPEN (Vulnerable!)
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 2: RELATIVISTIC PROTON STORM */}
      {phase === "phase2_protons" && (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-red-400 animate-pulse" />
              <h4 className="text-base font-bold text-white">
                Phase 2: Solar Energetic Protons (S4 Severe Radiation Storm)
              </h4>
            </div>
            <span className="text-xs font-mono text-red-300 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
              Energy: &gt; 100 MeV Ions
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            High-energy protons are penetrating the spacecraft chassis! You must protect the solar
            arrays from crystal degradation and safeguard onboard flight computers from bit flips.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="font-bold text-white text-sm block">
                  Solar Array Edge-On Orientation
                </span>
                <span className="text-xs text-slate-400">
                  Rotate solar arrays edge-on to the incoming solar wind, reducing exposed surface
                  area by 85%.
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setPanelsEdgeOn((prev) => !prev)}
                className={
                  panelsEdgeOn
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    : "bg-amber-600 hover:bg-amber-500 text-white font-bold"
                }
              >
                {panelsEdgeOn ? "Array Edge-On (Safe)" : "Face-On (Degrading!)"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="font-bold text-white text-sm block">
                  Onboard Payload Safe Mode (SEU Isolation)
                </span>
                <span className="text-xs text-slate-400">
                  De-energize non-essential SRAM memory banks to prevent catastrophic latch-ups and
                  corrupted telemetry.
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setSafeModeEngaged((prev) => !prev)}
                className={
                  safeModeEngaged
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    : "bg-red-600 hover:bg-red-500 text-white font-bold"
                }
              >
                {safeModeEngaged ? "Safe Mode ACTIVE" : "Normal Mode (Exposed!)"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: CME PLASMA SHOCK & DRAG */}
      {phase === "phase3_cme" && (
        <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-purple-400 animate-pulse" />
              <h4 className="text-base font-bold text-white">
                Phase 3: CME Shock Arrival (G5 Extreme Geomagnetic Storm)
              </h4>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
              Bz: -24 nT (Southward Reconnection)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The coronal mass ejection has slammed into Earth's magnetosphere! Severe Joule heating
            is expanding Earth's upper atmosphere, causing rapid orbital decay and electrostatic
            charge accumulation.
          </p>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="font-bold text-white text-sm block">
                  Station-Keeping Altitude Boost
                </span>
                <span className="text-xs text-slate-400">
                  Fire hydrazine thrusters to counteract thermospheric drag and prevent orbit decay.
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setOrbitBoostActive((prev) => !prev)}
                className={
                  orbitBoostActive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    : "bg-red-600 hover:bg-red-500 text-white font-bold"
                }
              >
                {orbitBoostActive ? "Thrusters FIRING (Boosted)" : "Thrusters IDLE (Decaying!)"}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="font-bold text-white text-sm block">
                  Active Surface Electrostatic Discharge
                </span>
                <span className="text-xs text-slate-400">
                  Bleed off thousands of volts of differential dielectric charging before an arc
                  sparks across the avionics.
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => setChargeDissipatorActive((prev) => !prev)}
                className={
                  chargeDissipatorActive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    : "bg-amber-600 hover:bg-amber-500 text-white font-bold"
                }
              >
                {chargeDissipatorActive ? "Grounding ACTIVE" : "Grounding OFF"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEBRIEF & MISSION RESULTS */}
      {phase === "debrief" && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Award className="size-6" />
            <h4 className="text-xl font-bold text-white">Space Weather Mission Debrief</h4>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Mission Resilience Score
              </span>
              <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                {missionScore} / 100
              </div>
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                missionScore >= 80
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : missionScore >= 60
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {missionScore >= 80
                ? "Flawless Spacecraft Defense"
                : missionScore >= 60
                  ? "Mission Qualified (Minor Degradation)"
                  : "Critical Failures Encountered"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {missionScore >= 80
              ? "Outstanding command! By shuttering the star tracker, canting solar arrays edge-on, entering safe mode, and firing station-keeping thrusters, Aegis-1 survived an extreme G5 solar superstorm with minimal degradation."
              : "Aegis-1 survived the event, but took damage from unprotected subsystems during peak radiation waves. Real satellite controllers balance continuous science data collection with aggressive storm defense protocols."}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              <RotateCcw className="size-3.5 mr-1" /> Replay Defense Scenario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
