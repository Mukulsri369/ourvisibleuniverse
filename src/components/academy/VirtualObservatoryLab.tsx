import React, { useState, useMemo, useRef, useEffect } from "react";
import type { LearningLevel } from "@/lib/academy/types";
import {
  OBSERVATORY_TARGETS,
  TELESCOPE_MODELS,
  ASTRONOMER_MISSIONS,
  type ObservatoryTarget,
  type TelescopeModel,
  type AstronomerMission,
} from "@/lib/academy/lessons/module-21-telescopes";
import {
  Search,
  Eye,
  Sliders,
  Sparkles,
  Award,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Maximize2,
  Layers,
  Radio,
  Flame,
  Sun,
  Activity,
  Compass,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VirtualObservatoryLabProps {
  learningLevel: LearningLevel;
  onCompleteLab?: () => void;
}

type LabTab = "observatory" | "comparison" | "spectrograph" | "game" | "optical_calc";
type WavelengthBand = "radio" | "infrared" | "visible" | "ultraviolet" | "xray";

export const VirtualObservatoryLab: React.FC<VirtualObservatoryLabProps> = ({
  learningLevel,
  onCompleteLab,
}) => {
  const [activeTab, setActiveTab] = useState<LabTab>("observatory");

  // Selected Target & Telescope
  const [selectedTargetId, setSelectedTargetId] = useState<string>("target_pillars");
  const [selectedTelescopeId, setSelectedTelescopeId] = useState<string>("tele_hst_space");
  const [selectedWavelength, setSelectedWavelength] = useState<
    "radio" | "infrared" | "visible" | "ultraviolet" | "xray"
  >("visible");

  // Interactive Optical & Detector Controls
  const [apertureScale, setApertureScale] = useState<number>(2.4); // meters
  const [exposureSeconds, setExposureSeconds] = useState<number>(180); // seconds
  const [magnification, setMagnification] = useState<number>(100); // zoom
  const [seeingActive, setSeeingActive] = useState<boolean>(true); // Ground atmospheric seeing
  const [adaptiveOpticsActive, setAdaptiveOpticsActive] = useState<boolean>(false);
  const [coolingActive, setCoolingActive] = useState<boolean>(true); // Sensor cryogenic cooling
  const [displayMode, setDisplayMode] = useState<"authentic" | "simulated">("authentic");

  // Image Comparison Mode
  const [compareBandLeft, setCompareBandLeft] = useState<
    "radio" | "infrared" | "visible" | "ultraviolet" | "xray"
  >("visible");
  const [compareBandRight, setCompareBandRight] = useState<
    "radio" | "infrared" | "visible" | "ultraviolet" | "xray"
  >("infrared");
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // percentage 0-100

  // Spectrograph Interactive State
  const [dopplerVelocityKms, setDopplerVelocityKms] = useState<number>(0);
  const [selectedSpectralLine, setSelectedSpectralLine] = useState<string | null>(null);

  // "Become an Astronomer" Game State
  const [currentMissionIndex, setCurrentMissionIndex] = useState<number>(0);
  const [gameSelectedTelescope, setGameSelectedTelescope] = useState<string>("");
  const [gameSelectedWavelength, setGameSelectedWavelength] = useState<string>("");
  const [gameExposure, setGameExposure] = useState<number>(60);
  const [missionSubmitted, setMissionSubmitted] = useState<boolean>(false);
  const [missionSuccess, setMissionSuccess] = useState<boolean | null>(null);
  const [gameScore, setGameScore] = useState<number>(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  // Get active target and telescope object
  const activeTarget: ObservatoryTarget = useMemo(() => {
    return OBSERVATORY_TARGETS.find((t) => t.id === selectedTargetId) || OBSERVATORY_TARGETS[0];
  }, [selectedTargetId]);

  const activeTelescope: TelescopeModel = useMemo(() => {
    return TELESCOPE_MODELS.find((t) => t.id === selectedTelescopeId) || TELESCOPE_MODELS[0];
  }, [selectedTelescopeId]);

  // Optical Calculations
  const calculations = useMemo(() => {
    const D = apertureScale;
    // Light Gathering Power relative to 7mm human eye
    const humanEyeAperture = 0.007; // 7mm
    const lgp = Math.round(Math.pow(D / humanEyeAperture, 2));

    // Wavelength in nanometers for calculation
    const wavelengthMap: Record<string, number> = {
      radio: 210000000, // 21 cm
      infrared: 2000, // 2 μm
      visible: 550, // 550 nm
      ultraviolet: 200, // 200 nm
      xray: 1, // 1 nm
    };
    const lambdaNm = wavelengthMap[selectedWavelength] || 550;
    const lambdaMeters = lambdaNm * 1e-9;

    // Theoretical diffraction limit: θ = 1.22 * λ / D in radians -> arcseconds
    const thetaRadians = (1.22 * lambdaMeters) / D;
    const thetaArcsec = thetaRadians * 206265;

    // Atmospheric seeing: if ground and no AO, seeing is ~1.0 arcsec (or worse at low altitude)
    const isGround = activeTelescope.primaryLocation.includes("Ground");
    let effectiveResolutionArcsec = thetaArcsec;
    let seeingBlurApplied = false;

    if (isGround && seeingActive && !adaptiveOpticsActive) {
      effectiveResolutionArcsec = Math.max(thetaArcsec, 1.1); // ~1.1 arcsec seeing disk
      seeingBlurApplied = true;
    } else if (isGround && adaptiveOpticsActive) {
      // AO corrects partially down to near diffraction limit + residual error
      effectiveResolutionArcsec = Math.max(thetaArcsec, 0.05);
    }

    // Signal-to-Noise Ratio (SNR) estimation based on aperture & exposure
    // Signal ∝ D^2 * t; Noise ∝ sqrt(Signal + Background + DarkNoise + ReadNoise)
    const rawSignal = Math.pow(D, 2) * exposureSeconds * 12;
    const darkNoise = coolingActive ? 2 : 80;
    const readNoise = 15;
    const skyBackground = isGround ? 30 * exposureSeconds : 2 * exposureSeconds;
    const totalNoise = Math.sqrt(rawSignal + skyBackground + darkNoise + readNoise);
    const snr = Math.min(999, Math.round(rawSignal / Math.max(1, totalNoise)));

    return {
      lightGatheringPower: lgp,
      diffractionLimitArcsec: thetaArcsec,
      effectiveResolutionArcsec,
      seeingBlurApplied,
      snr,
      lambdaNm,
    };
  }, [
    apertureScale,
    selectedWavelength,
    activeTelescope,
    seeingActive,
    adaptiveOpticsActive,
    exposureSeconds,
    coolingActive,
  ]);

  // Update default aperture when telescope changes
  const handleSelectTelescope = (id: string) => {
    setSelectedTelescopeId(id);
    const tel = TELESCOPE_MODELS.find((t) => t.id === id);
    if (tel) {
      setApertureScale(tel.apertureMeters);
      if (tel.hasAdaptiveOptics) {
        setAdaptiveOpticsActive(true);
      } else {
        setAdaptiveOpticsActive(false);
      }
      // If telescope has specific coverage, switch to supported wavelength
      if (!tel.wavelengthCoverage.includes(selectedWavelength)) {
        setSelectedWavelength(tel.wavelengthCoverage[0]);
      }
    }
  };

  // Game Mission Logic
  const currentMission = ASTRONOMER_MISSIONS[currentMissionIndex];

  const handleRunMissionTest = () => {
    setMissionSubmitted(true);
    const targetMatch = activeTarget.id === currentMission.targetId;
    const bandMatch = gameSelectedWavelength === currentMission.correctWavelength;
    const tel = TELESCOPE_MODELS.find((t) => t.id === gameSelectedTelescope);
    const apertureAdequate = tel ? tel.apertureMeters >= currentMission.minApertureMeters : false;
    const exposureAdequate = gameExposure >= currentMission.minExposureSeconds;

    const isSuccess = targetMatch && bandMatch && apertureAdequate && exposureAdequate;
    setMissionSuccess(isSuccess);

    if (isSuccess && !completedMissions.includes(currentMission.id)) {
      setGameScore((prev) => prev + currentMission.points);
      setCompletedMissions((prev) => [...prev, currentMission.id]);
    }
  };

  const handleNextMission = () => {
    if (currentMissionIndex < ASTRONOMER_MISSIONS.length - 1) {
      const nextIdx = currentMissionIndex + 1;
      setCurrentMissionIndex(nextIdx);
      const nextM = ASTRONOMER_MISSIONS[nextIdx];
      setSelectedTargetId(nextM.targetId);
      setMissionSubmitted(false);
      setMissionSuccess(null);
      setGameSelectedTelescope("");
      setGameSelectedWavelength("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              Virtual Astronomy Observatory
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Interactive Lab
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Multi-Wavelength Aperture Synthesis, Optical Physics & Spectral Analysis
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab("observatory")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "observatory"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Observatory
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "comparison"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wavelength Split
          </button>
          <button
            onClick={() => setActiveTab("spectrograph")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "spectrograph"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Spectrograph
          </button>
          <button
            onClick={() => setActiveTab("game")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "game"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-amber-300 hover:bg-slate-800/60"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Astronomer Game
            {completedMissions.length > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded-full">
                {completedMissions.length}/{ASTRONOMER_MISSIONS.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("optical_calc")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "optical_calc"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Optics Sandbox
          </button>
        </div>
      </div>

      {/* Target Selector Banner across all tabs */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Select Astronomical Target:
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {activeTarget.catalogId} • {activeTarget.distance} ({activeTarget.constellation})
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {OBSERVATORY_TARGETS.map((target) => (
            <button
              key={target.id}
              onClick={() => setSelectedTargetId(target.id)}
              className={`p-2 rounded-lg text-left border transition-all text-xs ${
                selectedTargetId === target.id
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-sm"
                  : "bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold truncate">{target.name}</div>
              <div className="text-[10px] text-slate-500 truncate">{target.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: MAIN OBSERVATORY INTERFACE */}
      {activeTab === "observatory" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer Window (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl aspect-[16/11]">
              {/* Authentic Image vs Simulated Shader Display */}
              <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden">
                <img
                  src={activeTarget.wavelengthData[selectedWavelength].authenticArchiveImage}
                  alt={`${activeTarget.name} in ${selectedWavelength}`}
                  className="w-full h-full object-cover transition-all duration-700"
                  style={{
                    filter: `
                      brightness(${Math.min(1.8, Math.max(0.3, exposureSeconds / 150))})
                      contrast(${1.0 + (calculations.snr > 50 ? 0.2 : -0.2)})
                      blur(${
                        calculations.seeingBlurApplied
                          ? "2.8px"
                          : calculations.effectiveResolutionArcsec > 0.5
                            ? "1.2px"
                            : "0px"
                      })
                    `,
                    transform: `scale(${1 + (magnification - 20) / 400})`,
                  }}
                />

                {/* Simulated Poisson Shot Noise Overlay for Short Exposures */}
                {exposureSeconds < 60 && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                    style={{
                      backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)`,
                      backgroundSize: `${Math.max(2, Math.round(60 / exposureSeconds))}px ${Math.max(
                        2,
                        Math.round(60 / exposureSeconds),
                      )}px`,
                    }}
                  />
                )}

                {/* False-color wavelength tint filter overlay */}
                <div
                  className={`absolute inset-0 mix-blend-color opacity-50 bg-gradient-to-tr ${activeTarget.wavelengthData[selectedWavelength].simulatedColor}`}
                />

                {/* Reticle / Crosshair Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <div className="w-24 h-24 border border-dashed border-emerald-400 rounded-full" />
                  <div className="absolute w-36 h-[1px] bg-emerald-400" />
                  <div className="absolute h-36 w-[1px] bg-emerald-400" />
                </div>
              </div>

              {/* Top Status HUD Bar */}
              <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE FEED: {selectedWavelength.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeTarget.wavelengthData[selectedWavelength].observatoryExample}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                      displayMode === "authentic"
                        ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    }`}
                  >
                    {displayMode === "authentic" ? "AUTHENTIC ARCHIVE" : "OPTICAL MODEL"}
                  </span>
                </div>
              </div>

              {/* Bottom Telemetry HUD */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between text-[11px] text-slate-300 font-mono gap-2">
                <div className="flex items-center gap-3">
                  <span>Aperture: {apertureScale.toFixed(2)}m</span>
                  <span>Exp: {exposureSeconds}s</span>
                  <span>Mag: {magnification}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    Diffraction θ:{" "}
                    {calculations.diffractionLimitArcsec < 0.01
                      ? `${(calculations.diffractionLimitArcsec * 1000).toFixed(1)} mas`
                      : `${calculations.diffractionLimitArcsec.toFixed(3)}"`}
                  </span>
                  <span
                    className={
                      calculations.snr > 40 ? "text-emerald-400 font-semibold" : "text-amber-400"
                    }
                  >
                    SNR: {calculations.snr}
                  </span>
                </div>
              </div>
            </div>

            {/* Scientific explanation banner for the selected wavelength */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  What this wavelength reveals ({selectedWavelength.toUpperCase()}):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Temp: {activeTarget.wavelengthData[selectedWavelength].temperatureRevealed}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeTarget.wavelengthData[selectedWavelength].summary}
              </p>
              <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center gap-1.5">
                <span className="text-slate-500">Physical Mechanism:</span>
                <span>{activeTarget.wavelengthData[selectedWavelength].primaryMechanism}</span>
              </div>
            </div>
          </div>

          {/* Control Console (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* 1. Telescope Model Selector */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Select Telescope Instrument:
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">{activeTelescope.type}</span>
              </div>
              <select
                value={selectedTelescopeId}
                onChange={(e) => handleSelectTelescope(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {TELESCOPE_MODELS.map((tel) => (
                  <option key={tel.id} value={tel.id}>
                    {tel.name} ({tel.apertureMeters}m • {tel.primaryLocation})
                  </option>
                ))}
              </select>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-slate-300 font-medium">
                    {activeTelescope.primaryLocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Light Gathering Power:</span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {activeTelescope.lightGatheringPowerVsEye.toLocaleString()}× human eye
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Adaptive Optics:</span>
                  <span
                    className={
                      activeTelescope.hasAdaptiveOptics
                        ? "text-emerald-400 font-medium"
                        : "text-slate-500"
                    }
                  >
                    {activeTelescope.hasAdaptiveOptics ? "Yes (Laser Guide Star)" : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Wavelength Band Selector */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Observation Wavelength Band:
              </h3>
              <div className="grid grid-cols-5 gap-1.5">
                {(["radio", "infrared", "visible", "ultraviolet", "xray"] as const).map((band) => {
                  const isSupported = activeTelescope.wavelengthCoverage.includes(band);
                  return (
                    <button
                      key={band}
                      onClick={() => setSelectedWavelength(band)}
                      disabled={!isSupported}
                      className={`py-2 px-1 rounded-lg text-center font-medium text-xs transition-all flex flex-col items-center gap-0.5 ${
                        selectedWavelength === band
                          ? "bg-emerald-600 text-white font-bold shadow-md border border-emerald-400"
                          : isSupported
                            ? "bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
                            : "bg-slate-950/40 text-slate-600 border border-slate-900 cursor-not-allowed opacity-40"
                      }`}
                    >
                      <span className="capitalize">{band}</span>
                      {!isSupported && (
                        <span className="text-[8px] text-red-400 uppercase">Blocked</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!activeTelescope.wavelengthCoverage.includes(selectedWavelength) && (
                <div className="text-[11px] text-amber-400 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    This telescope's optics cannot detect {selectedWavelength}. Switch to a space or
                    specialized observatory!
                  </span>
                </div>
              )}
            </div>

            {/* 3. Physical Parameters Sliders */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Detector & Optical Controls:
              </h3>

              {/* Exposure Integration Time */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Exposure Integration Time:</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {exposureSeconds >= 60
                      ? `${(exposureSeconds / 60).toFixed(1)} min (${exposureSeconds}s)`
                      : `${exposureSeconds}s`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="600"
                  step="5"
                  value={exposureSeconds}
                  onChange={(e) => setExposureSeconds(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1s (High Shot Noise)</span>
                  <span>10 min (Deep Signal / High SNR)</span>
                </div>
              </div>

              {/* Magnification */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Magnification / Focal Zoom:</span>
                  <span className="font-mono text-emerald-400 font-medium">{magnification}×</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="10"
                  value={magnification}
                  onChange={(e) => setMagnification(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Atmosphere & Noise Toggles */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Atmospheric Seeing Blur (~1.1"):</span>
                  <button
                    onClick={() => setSeeingActive(!seeingActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                      seeingActive
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {seeingActive ? "Active (Blur)" : "Vacuum / Off"}
                  </button>
                </div>

                {activeTelescope.hasAdaptiveOptics && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Laser Guide Star Adaptive Optics:</span>
                    <button
                      onClick={() => setAdaptiveOpticsActive(!adaptiveOpticsActive)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                        adaptiveOpticsActive
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {adaptiveOpticsActive ? "AO Engaged (1,000 Hz)" : "AO Disabled"}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Cryogenic Detector Cooling:</span>
                  <button
                    onClick={() => setCoolingActive(!coolingActive)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                      coolingActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {coolingActive ? "Cryo 40K (Low Dark)" : "Ambient (Thermal Noise)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAVELENGTH SPLIT-SCREEN COMPARISON */}
      {activeTab === "comparison" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Interactive Multi-Wavelength Split Slider
                </h3>
                <p className="text-xs text-slate-400">
                  Drag the slider to wipe between two distinct wavelengths and compare physical
                  features directly.
                </p>
              </div>

              {/* Band Selectors */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Left:</span>
                  <select
                    value={compareBandLeft}
                    onChange={(e) => setCompareBandLeft(e.target.value as WavelengthBand)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize font-medium"
                  >
                    <option value="radio">Radio</option>
                    <option value="infrared">Infrared</option>
                    <option value="visible">Visible</option>
                    <option value="ultraviolet">Ultraviolet</option>
                    <option value="xray">X-ray</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Right:</span>
                  <select
                    value={compareBandRight}
                    onChange={(e) => setCompareBandRight(e.target.value as WavelengthBand)}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 capitalize font-medium"
                  >
                    <option value="radio">Radio</option>
                    <option value="infrared">Infrared</option>
                    <option value="visible">Visible</option>
                    <option value="ultraviolet">Ultraviolet</option>
                    <option value="xray">X-ray</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Split Image Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-[16/9] select-none">
              {/* Right Image (Background) */}
              <img
                src={activeTarget.wavelengthData[compareBandRight].authenticArchiveImage}
                alt={`${activeTarget.name} in ${compareBandRight}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className={`absolute inset-0 mix-blend-color opacity-50 bg-gradient-to-tr ${activeTarget.wavelengthData[compareBandRight].simulatedColor}`}
              />

              {/* Left Image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${splitSliderPos}%` }}
              >
                <img
                  src={activeTarget.wavelengthData[compareBandLeft].authenticArchiveImage}
                  alt={`${activeTarget.name} in ${compareBandLeft}`}
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: "100%", height: "100%" }}
                />
                <div
                  className={`absolute inset-0 mix-blend-color opacity-50 bg-gradient-to-tr ${activeTarget.wavelengthData[compareBandLeft].simulatedColor}`}
                />
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] cursor-ew-resize flex items-center justify-center pointer-events-none"
                style={{ left: `${splitSliderPos}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg">
                  ⇄
                </div>
              </div>

              {/* Interactive Range Input overlaying entire box */}
              <input
                type="range"
                min="0"
                max="100"
                value={splitSliderPos}
                onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
              />

              {/* Floating Labels */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none bg-black/75 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {compareBandLeft.toUpperCase()} (
                {activeTarget.wavelengthData[compareBandLeft].temperatureRevealed})
              </div>
              <div className="absolute top-4 right-4 z-20 pointer-events-none bg-black/75 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-white font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {compareBandRight.toUpperCase()} (
                {activeTarget.wavelengthData[compareBandRight].temperatureRevealed})
              </div>
            </div>

            {/* Comparison Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-cyan-300 capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  {compareBandLeft} Observations
                </div>
                <p className="text-slate-300">
                  {activeTarget.wavelengthData[compareBandLeft].summary}
                </p>
                <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                  {activeTarget.wavelengthData[compareBandLeft].detectedFeatures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-rose-300 capitalize flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  {compareBandRight} Observations
                </div>
                <p className="text-slate-300">
                  {activeTarget.wavelengthData[compareBandRight].summary}
                </p>
                <ul className="text-slate-400 space-y-0.5 list-disc list-inside">
                  {activeTarget.wavelengthData[compareBandRight].detectedFeatures.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULATED SPECTRAL ANALYSIS */}
      {activeTab === "spectrograph" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Astronomical Spectrograph: Chemical Barcoding & Radial Velocity
                </h3>
                <p className="text-xs text-slate-400">
                  Disperse starlight into emission and absorption lines to decode elemental
                  composition, temperature, and Doppler shifts.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Target Continuum:</span>
                <span className="text-emerald-400 font-semibold">
                  {activeTarget.spectralData.continuumType}
                </span>
              </div>
            </div>

            {/* Interactive Doppler Shift Slider */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                  Doppler Radial Velocity Simulation:
                </span>
                <div className="flex items-center gap-3 font-mono">
                  <span
                    className={
                      dopplerVelocityKms < 0
                        ? "text-blue-400 font-bold"
                        : dopplerVelocityKms > 0
                          ? "text-rose-400 font-bold"
                          : "text-slate-300"
                    }
                  >
                    v = {dopplerVelocityKms > 0 ? `+${dopplerVelocityKms}` : dopplerVelocityKms}{" "}
                    km/s (
                    {dopplerVelocityKms < 0
                      ? "Blueshift"
                      : dopplerVelocityKms > 0
                        ? "Redshift"
                        : "Rest Frame"}
                    )
                  </span>
                  <span className="text-slate-400">
                    z = {(dopplerVelocityKms / 299792).toFixed(5)}
                  </span>
                  <button
                    onClick={() => setDopplerVelocityKms(0)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Reset v=0
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-3000"
                max="3000"
                step="50"
                value={dopplerVelocityKms}
                onChange={(e) => setDopplerVelocityKms(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-3,000 km/s (Approaching / Blueshift)</span>
                <span>Rest Frame (0 km/s)</span>
                <span>+3,000 km/s (Receding / Redshift)</span>
              </div>
            </div>

            {/* Rainbow Spectrum Visualizer Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black p-4 space-y-2">
              <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                <span>Near-UV (380 nm)</span>
                <span>Visible Optical Continuum</span>
                <span>Near-IR (720 nm)</span>
              </div>

              {/* Optical Rainbow Bar with Overlaid Spectral Lines */}
              <div className="relative h-16 w-full rounded-lg overflow-hidden shadow-inner bg-gradient-to-r from-violet-600 via-blue-500 via-cyan-400 via-emerald-400 via-yellow-400 via-orange-500 to-rose-600">
                {/* Overlaid Spectral Lines */}
                {activeTarget.spectralData.dominantLines
                  .filter((l) => l.restWavelengthNm >= 380 && l.restWavelengthNm <= 720)
                  .map((line, idx) => {
                    // Calculate Doppler shifted wavelength
                    const shiftedWavelength =
                      line.restWavelengthNm * (1 + dopplerVelocityKms / 299792);
                    // Map 380nm - 720nm to 0% - 100%
                    const percent = ((shiftedWavelength - 380) / (720 - 380)) * 100;

                    if (percent < 0 || percent > 100) return null;

                    const isSelected = selectedSpectralLine === line.name;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedSpectralLine(line.name)}
                        className={`absolute inset-y-0 cursor-pointer group transition-all ${
                          line.lineType === "emission"
                            ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                            : "bg-black shadow-[0_0_4px_rgba(0,0,0,0.8)]"
                        }`}
                        style={{
                          left: `${percent}%`,
                          width: isSelected ? "4px" : "2.5px",
                        }}
                      >
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg border border-slate-700 whitespace-nowrap font-mono pointer-events-none">
                          {line.name} ({line.element}) - {shiftedWavelength.toFixed(1)} nm
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Simulated Spectral Intensity Graph (Flux vs Wavelength) */}
              <div className="h-32 w-full bg-slate-950 rounded-lg border border-slate-800/80 p-2 relative flex items-end">
                <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-mono">
                  Relative Flux F_λ
                </div>

                {/* SVG Line Graph */}
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 500 100"
                >
                  {/* Baseline continuous curve */}
                  <path
                    d="M 0 65 Q 150 45, 250 50 T 500 70"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Spectral Emission / Absorption Peaks */}
                  {activeTarget.spectralData.dominantLines
                    .filter((l) => l.restWavelengthNm >= 380 && l.restWavelengthNm <= 720)
                    .map((line, idx) => {
                      const shiftedWavelength =
                        line.restWavelengthNm * (1 + dopplerVelocityKms / 299792);
                      const x = ((shiftedWavelength - 380) / (720 - 380)) * 500;
                      if (x < 0 || x > 500) return null;

                      const isEmission = line.lineType === "emission";
                      const peakHeight = line.intensity * 45;
                      const yPeak = isEmission ? 55 - peakHeight : 55 + peakHeight;

                      return (
                        <g key={idx}>
                          <path
                            d={`M ${x - 6} 55 Q ${x} ${yPeak}, ${x + 6} 55`}
                            fill={isEmission ? "rgba(52, 211, 153, 0.2)" : "rgba(239, 68, 68, 0.2)"}
                            stroke={isEmission ? "#10b981" : "#ef4444"}
                            strokeWidth="2"
                          />
                          <text
                            x={x}
                            y={isEmission ? yPeak - 4 : yPeak + 12}
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="8"
                            fontFamily="monospace"
                          >
                            {line.element.split(" ")[0]}
                          </text>
                        </g>
                      );
                    })}
                </svg>
              </div>
            </div>

            {/* Identified Spectral Lines List */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-300">
                Identified Spectral Transitions in {activeTarget.name}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activeTarget.spectralData.dominantLines.map((line, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedSpectralLine(line.name)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedSpectralLine === line.name
                        ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono mb-1">
                      <span className="font-semibold text-emerald-400">{line.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          line.lineType === "emission"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {line.lineType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Element: <span className="text-slate-200">{line.element}</span> (λ₀ ={" "}
                      {line.restWavelengthNm > 1000000
                        ? `${(line.restWavelengthNm / 1e7).toFixed(1)} cm`
                        : `${line.restWavelengthNm.toFixed(2)} nm`}
                      )
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 italic">
                      {line.scientificMeaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: "BECOME AN ASTRONOMER" RESEARCH MISSIONS GAME */}
      {activeTab === "game" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-5">
            {/* Mission Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  #{currentMission.missionNumber}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{currentMission.title}</h3>
                  <p className="text-xs text-amber-300 font-medium">
                    Goal: {currentMission.researchGoal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Score:</span>
                <span className="text-amber-400 font-bold text-sm">{gameScore} pts</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-medium">
                  {completedMissions.length}/{ASTRONOMER_MISSIONS.length} Solved
                </span>
              </div>
            </div>

            {/* Mission Briefing */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2.5">
              <div className="font-semibold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                Scientific Challenge:
              </div>
              <p className="text-slate-300 leading-relaxed">
                {currentMission.astrophysicalContext}
              </p>
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-amber-200 font-medium">
                {currentMission.question}
              </div>
            </div>

            {/* Mission Command Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* 1. Telescope Choice */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  1. Select Observatory:
                </label>
                <select
                  value={gameSelectedTelescope}
                  onChange={(e) => setGameSelectedTelescope(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-500"
                >
                  <option value="">-- Choose Instrument --</option>
                  {TELESCOPE_MODELS.map((tel) => (
                    <option key={tel.id} value={tel.id}>
                      {tel.name} ({tel.apertureMeters}m)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Wavelength Choice */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  2. Select Wavelength Band:
                </label>
                <select
                  value={gameSelectedWavelength}
                  onChange={(e) => setGameSelectedWavelength(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 capitalize focus:border-amber-500"
                >
                  <option value="">-- Choose Wavelength --</option>
                  <option value="radio">Radio (21-cm / Millimeter)</option>
                  <option value="infrared">Infrared (Warm Dust & Protostars)</option>
                  <option value="visible">Visible Optical (Starlight)</option>
                  <option value="ultraviolet">Ultraviolet (Hot Massive Stars)</option>
                  <option value="xray">X-ray (Million-Degree Plasma)</option>
                </select>
              </div>

              {/* 3. Integration Exposure */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-slate-300 font-semibold">3. Exposure Time:</label>
                  <span className="font-mono text-amber-400 font-semibold">
                    {gameExposure} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="360"
                  step="10"
                  value={gameExposure}
                  onChange={(e) => setGameExposure(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer mt-3"
                />
              </div>
            </div>

            {/* Test Observation Execution Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRunMissionTest}
                disabled={!gameSelectedTelescope || !gameSelectedWavelength}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                Execute Scientific Observation
              </button>

              {missionSuccess && currentMissionIndex < ASTRONOMER_MISSIONS.length - 1 && (
                <button
                  onClick={handleNextMission}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2"
                >
                  Next Mission
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mission Outcome Feedback Banner */}
            {missionSubmitted && missionSuccess !== null && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 transition-all ${
                  missionSuccess
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {missionSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Observation Succeeded! (+{currentMission.points} Points)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Observation Failed to Solve the Science Question</span>
                    </>
                  )}
                </div>

                <p className="leading-relaxed">
                  {missionSuccess
                    ? currentMission.successAnalysis
                    : currentMission.whyOtherBandsFail[gameSelectedWavelength] ||
                      "The chosen telescope aperture or exposure time did not gather sufficient photons or angular resolution to resolve the target feature. Try choosing a wavelength that matches the physical temperature of the target!"}
                </p>

                <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                  Scientific Reference: {currentMission.scientificCitation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: OPTICAL CALCULATOR & RAYLEIGH SANDBOX */}
      {activeTab === "optical_calc" && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Optical Physics & Rayleigh Diffraction Criterion Sandbox
              </h3>
              <p className="text-xs text-slate-400">
                Explore the mathematical relationship between aperture diameter, wavelength, Airy
                disk diffraction, and light-gathering power.
              </p>
            </div>

            {/* Mathematical Formulas Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-semibold">1. Rayleigh Criterion:</div>
                <div className="text-slate-200 text-sm">θ = 1.22 · λ / D</div>
                <div className="text-[11px] text-slate-400">
                  Resolving limit (rad): angular radius of first dark Airy minimum
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-semibold">2. Light-Gathering Power:</div>
                <div className="text-slate-200 text-sm">LGP = (D / D_eye)²</div>
                <div className="text-[11px] text-slate-400">
                  Area ratio relative to dark-adapted human pupil (7mm)
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-purple-400 font-semibold">3. Signal-to-Noise Ratio:</div>
                <div className="text-slate-200 text-sm">SNR ∝ (S · t) / √Total Noise</div>
                <div className="text-[11px] text-slate-400">
                  Governed by Poisson photon counting statistics
                </div>
              </div>
            </div>

            {/* Interactive Sandbox Slider */}
            <div className="space-y-2 p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Adjust Aperture Diameter (D):</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {apertureScale.toFixed(2)} meters
                </span>
              </div>
              <input
                type="range"
                min="0.08"
                max="40"
                step="0.1"
                value={apertureScale}
                onChange={(e) => setApertureScale(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.08m (Backyard Refractor)</span>
                <span>2.4m (Hubble)</span>
                <span>6.5m (JWST)</span>
                <span>10m (Keck)</span>
                <span>39.3m (ELT)</span>
              </div>
            </div>

            {/* Calculated Values Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Light Gathering Power:</div>
                <div className="text-emerald-400 font-bold text-base mt-1">
                  {calculations.lightGatheringPower.toLocaleString()}×
                </div>
                <div className="text-[10px] text-slate-500">vs 7mm human eye</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Visible Diffraction Limit (θ):</div>
                <div className="text-cyan-400 font-bold text-base mt-1">
                  {calculations.diffractionLimitArcsec < 0.01
                    ? `${(calculations.diffractionLimitArcsec * 1000).toFixed(2)} mas`
                    : `${calculations.diffractionLimitArcsec.toFixed(3)}"`}
                </div>
                <div className="text-[10px] text-slate-500">at λ = 550 nm</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Radio Diffraction Limit (21cm):</div>
                <div className="text-amber-400 font-bold text-base mt-1">
                  {(((1.22 * 0.211) / apertureScale) * 206265).toFixed(1)}"
                </div>
                <div className="text-[10px] text-slate-500">at λ = 21.1 cm</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Ground Seeing Without AO:</div>
                <div className="text-rose-400 font-bold text-base mt-1">~1.1" disk</div>
                <div className="text-[10px] text-slate-500">limits ground mirrors</div>
              </div>
            </div>

            {/* Simulated Airy Disk Graphic */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <span className="text-xs font-semibold text-slate-300">
                Simulated Point Spread Function (Airy Disk Diffraction Pattern):
              </span>
              <div className="w-32 h-32 rounded-full border border-slate-800 flex items-center justify-center relative bg-black shadow-inner">
                {/* Secondary Diffraction Rings */}
                <div
                  className="rounded-full border border-emerald-500/20 absolute"
                  style={{
                    width: `${Math.max(16, Math.min(120, 280 / apertureScale))}px`,
                    height: `${Math.max(16, Math.min(120, 280 / apertureScale))}px`,
                  }}
                />
                <div
                  className="rounded-full border border-emerald-500/40 absolute"
                  style={{
                    width: `${Math.max(10, Math.min(80, 180 / apertureScale))}px`,
                    height: `${Math.max(10, Math.min(80, 180 / apertureScale))}px`,
                  }}
                />
                {/* Central Airy Core */}
                <div
                  className="rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                  style={{
                    width: `${Math.max(4, Math.min(40, 80 / apertureScale))}px`,
                    height: `${Math.max(4, Math.min(40, 80 / apertureScale))}px`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center max-w-md">
                As aperture increases, the central Airy core contracts tightly, enabling the
                telescope to split close binary stars and reveal razor-sharp detail.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
