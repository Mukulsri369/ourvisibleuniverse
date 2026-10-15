import React, { useState, useMemo } from "react";
import {
  Flame,
  Sun,
  Sparkles,
  Info,
  Sliders,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Planck blackbody distribution function
// B_lambda(T) in arbitrary normalized units for visualization
function planckDistribution(lambdaNm: number, tempK: number): number {
  const h = 6.626e-34; // Planck constant
  const c = 3.0e8; // speed of light
  const k = 1.38e-23; // Boltzmann constant
  const lambdaM = lambdaNm * 1e-9;

  const c1 = 2 * h * c * c;
  const c2 = (h * c) / (k * tempK);

  const exponent = c2 / lambdaM;
  if (exponent > 80) return 0; // prevent overflow

  const radiance = c1 / (Math.pow(lambdaM, 5) * (Math.exp(exponent) - 1));
  return radiance;
}

// Convert temperature in Kelvin to an accurate approximate sRGB blackbody color
// Based on Tanner Helland's algorithm calibrated to Planckian locus
function kelvinToRGB(tempK: number): { r: number; g: number; b: number; hex: string } {
  const temp = Math.max(1000, Math.min(40000, tempK)) / 100;

  let r = 0;
  let g = 0;
  let b = 0;

  // Red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  const red = Math.round(r);
  const green = Math.round(g);
  const blue = Math.round(b);
  const hex = `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  return { r: red, g: green, b: blue, hex };
}

// Map wavelength in nm to visible color for spectrum strip
function wavelengthToRGB(wavelength: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0.0;
    g = (wavelength - 440) / (490 - 440);
    b = 1.0;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1.0;
    g = -(wavelength - 645) / (645 - 580);
    b = 0.0;
  } else if (wavelength >= 645 && wavelength <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Intensity falloff at the eye sensitivity edges
  let factor = 0;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380);
  } else if (wavelength >= 420 && wavelength < 700) {
    factor = 1.0;
  } else if (wavelength >= 700 && wavelength <= 750) {
    factor = 0.3 + (0.7 * (750 - wavelength)) / (750 - 700);
  }

  const red = Math.round(r * factor * 255);
  const green = Math.round(g * factor * 255);
  const blue = Math.round(b * factor * 255);
  return `rgb(${red}, ${green}, ${blue})`;
}

// Major stellar absorption lines (Fraunhofer lines)
interface AbsorptionLine {
  id: string;
  name: string;
  wavelengthNm: number;
  species: string;
  minTempK: number;
  maxTempK: number;
  peakTempK: number;
  significance: string;
}

const STELLAR_ABSORPTION_LINES: AbsorptionLine[] = [
  {
    id: "h_alpha",
    name: "H-α (Hydrogen Balmer)",
    wavelengthNm: 656.3,
    species: "Neutral Hydrogen (n=3 → n=2)",
    minTempK: 4000,
    maxTempK: 20000,
    peakTempK: 9500,
    significance: "Crucial diagnostic for stellar activity, chromosphere, and A-type stars.",
  },
  {
    id: "h_beta",
    name: "H-β (Hydrogen Balmer)",
    wavelengthNm: 486.1,
    species: "Neutral Hydrogen (n=4 → n=2)",
    minTempK: 4500,
    maxTempK: 22000,
    peakTempK: 9500,
    significance: "Cyan-blue Balmer line, prominent in Sirius and Vega.",
  },
  {
    id: "h_gamma",
    name: "H-γ (Hydrogen Balmer)",
    wavelengthNm: 434.0,
    species: "Neutral Hydrogen (n=5 → n=2)",
    minTempK: 5000,
    maxTempK: 24000,
    peakTempK: 9500,
    significance: "Violet Balmer series line.",
  },
  {
    id: "he_i",
    name: "He I (Neutral Helium)",
    wavelengthNm: 587.6,
    species: "Neutral Helium",
    minTempK: 10000,
    maxTempK: 30000,
    peakTempK: 18000,
    significance: "Hallmark of hot B-type stars like Rigel and Spica.",
  },
  {
    id: "he_ii",
    name: "He II (Ionized Helium)",
    wavelengthNm: 468.6,
    species: "Singly Ionized Helium",
    minTempK: 28000,
    maxTempK: 50000,
    peakTempK: 40000,
    significance: "Present exclusively in ultra-hot O-type stars.",
  },
  {
    id: "ca_ii_k",
    name: "Ca II K (Ionized Calcium)",
    wavelengthNm: 393.4,
    species: "Singly Ionized Calcium",
    minTempK: 3500,
    maxTempK: 8000,
    peakTempK: 5500,
    significance: "Dominant in G and K stars like our Sun (Fraunhofer K line).",
  },
  {
    id: "ca_ii_h",
    name: "Ca II H (Ionized Calcium)",
    wavelengthNm: 396.8,
    species: "Singly Ionized Calcium",
    minTempK: 3500,
    maxTempK: 8000,
    peakTempK: 5500,
    significance: "Companion Fraunhofer H line in solar-type stars.",
  },
  {
    id: "na_d",
    name: "Na D (Sodium Doublet)",
    wavelengthNm: 589.3,
    species: "Neutral Sodium",
    minTempK: 2800,
    maxTempK: 6500,
    peakTempK: 4500,
    significance: "Strong yellow doublet in cool stars and interstellar gas.",
  },
];

export function BlackbodySpectraLab({ onInteracted }: { onInteracted?: () => void }) {
  const [temperature, setTemperature] = useState<number>(5772); // Default to Sun
  const [showFraunhoferLines, setShowFraunhoferLines] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>("sun");

  // Wien's Displacement Law: lambda_peak = 2.8977729e6 nm * K / T
  const peakWavelengthNm = useMemo(() => {
    return Math.round(2897772 / temperature);
  }, [temperature]);

  // Emitter color derived from blackbody temperature
  const blackbodyColor = useMemo(() => kelvinToRGB(temperature), [temperature]);

  // Spectral class classification
  const spectralClass = useMemo(() => {
    if (temperature >= 30000) return { class: "O", label: "Class O (Blazing Blue)" };
    if (temperature >= 10000) return { class: "B", label: "Class B (Deep Blue-White)" };
    if (temperature >= 7500) return { class: "A", label: "Class A (Pure White / Light Blue)" };
    if (temperature >= 6000) return { class: "F", label: "Class F (Yellow-White)" };
    if (temperature >= 5200) return { class: "G", label: "Class G (Solar Yellow-White)" };
    if (temperature >= 3700) return { class: "K", label: "Class K (Amber Orange)" };
    return { class: "M", label: "Class M (Cool Red-Orange)" };
  }, [temperature]);

  // Generate Planck curve points for SVG graph
  // X range: 100 nm to 2000 nm
  const curvePoints = useMemo(() => {
    const points: { x: number; y: number; lambda: number }[] = [];
    const minLambda = 100;
    const maxLambda = 1900;
    const steps = 180;

    // First find maximum value in this window for normalization
    let maxVal = 0;
    for (let i = 0; i <= steps; i++) {
      const lambda = minLambda + (i / steps) * (maxLambda - minLambda);
      const val = planckDistribution(lambda, temperature);
      if (val > maxVal) maxVal = val;
    }

    if (maxVal === 0) maxVal = 1;

    for (let i = 0; i <= steps; i++) {
      const lambda = minLambda + (i / steps) * (maxLambda - minLambda);
      const val = planckDistribution(lambda, temperature);
      // Normalized height: 0 (bottom) to 180 (top)
      const normalizedY = 190 - (val / maxVal) * 170;
      // Normalized X: 40 (left) to 660 (right)
      const normalizedX = 40 + (i / steps) * 620;
      points.push({ x: normalizedX, y: normalizedY, lambda });
    }

    return points;
  }, [temperature]);

  const pathD = useMemo(() => {
    if (curvePoints.length === 0) return "";
    return curvePoints.reduce((acc, pt, idx) => {
      return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, "");
  }, [curvePoints]);

  const handleSliderChange = (val: number) => {
    setTemperature(val);
    setSelectedPreset("custom");
    onInteracted?.();
  };

  const handlePresetSelect = (presetKey: string, temp: number) => {
    setTemperature(temp);
    setSelectedPreset(presetKey);
    onInteracted?.();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="size-4" />
            </span>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Spectroscopy & Thermodynamics Lab
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Blackbody Radiation & Stellar Spectra Explorer
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Adjust the surface temperature to see how Planck's law dictates peak emission, star
            color, and atomic absorption lines.
          </p>
        </div>

        {/* Quick Temperature Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: "proxima", label: "Proxima (3,042 K)", temp: 3042 },
            { key: "betelgeuse", label: "Betelgeuse (3,600 K)", temp: 3600 },
            { key: "sun", label: "The Sun (5,772 K)", temp: 5772 },
            { key: "sirius", label: "Sirius A (9,940 K)", temp: 9940 },
            { key: "spica", label: "Spica (25,300 K)", temp: 25300 },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handlePresetSelect(item.key, item.temp)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                selectedPreset === item.key
                  ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-slate-950 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Controls & Color Swatch Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temperature Slider Card */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="size-4 text-cyan-400" />
              Effective Temperature (T_eff)
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-2xl font-extrabold text-white">
                {temperature.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400">Kelvin</span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={2000}
              max={35000}
              step={100}
              value={temperature}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>2,000 K (Red Dwarfs)</span>
              <span>5,772 K (Our Sun)</span>
              <span>10,000 K (Vega)</span>
              <span>25,000 K (Blue Giants)</span>
              <span>35,000 K (Hot O-Stars)</span>
            </div>
          </div>

          {/* Wien's Law & Peak Wavelength Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">
                Spectral Class
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                Class {spectralClass.class}
              </span>
              <span className="text-[10px] text-slate-400 block">{spectralClass.label}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">
                Peak Wavelength (λ_peak)
              </span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {peakWavelengthNm} nm
              </span>
              <span className="text-[10px] text-slate-400 block">
                {peakWavelengthNm < 380
                  ? "Ultraviolet (UV)"
                  : peakWavelengthNm <= 750
                    ? "Visible Spectrum"
                    : "Infrared (IR)"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-0.5">
                Wien's Law Formula
              </span>
              <span className="font-mono text-xs text-slate-300">λ_max = 2.898×10⁶ / T</span>
              <span className="text-[10px] text-slate-400 block">Inversely proportional</span>
            </div>
          </div>
        </div>

        {/* Real Blackbody Emitted Color Swatch */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              True Blackbody Thermal Color
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculated via Planck's continuous spectral distribution without false-color
              enhancement.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Color Orb */}
            <div
              className="size-20 rounded-full border-2 border-white/20 shadow-lg flex-shrink-0 transition-colors duration-200"
              style={{
                backgroundColor: blackbodyColor.hex,
                boxShadow: `0 0 35px ${blackbodyColor.hex}88`,
              }}
            />
            <div className="space-y-1">
              <div className="font-mono font-bold text-white text-base">{blackbodyColor.hex}</div>
              <div className="text-[11px] text-slate-300 font-mono">
                R: {blackbodyColor.r} • G: {blackbodyColor.g} • B: {blackbodyColor.b}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white">
                {temperature < 3500
                  ? "Deep Red-Orange"
                  : temperature < 5000
                    ? "Warm Amber"
                    : temperature < 6500
                      ? "Pure Warm White"
                      : temperature < 9500
                        ? "Diamond White"
                        : "Vibrant Blue-White"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
            Notice: Stars are never green! A 5,700 K star peaking in green also emits red and blue
            light, mixing into white.
          </div>
        </div>
      </div>

      {/* 3. Interactive Planck Radiation Curve Graph */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="size-4 text-cyan-400" />
              Planck Spectral Radiance Distribution: B_λ(T)
            </h4>
            <p className="text-xs text-slate-400">
              Curve shows energy intensity emitted per wavelength. Shaded band highlights human
              visible light (380–750 nm).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="size-2 rounded-full bg-cyan-400" />
              λ_peak = {peakWavelengthNm} nm
            </span>
          </div>
        </div>

        {/* SVG Graph */}
        <div className="relative w-full h-[220px] overflow-hidden rounded-xl border border-white/5 bg-slate-900/60">
          <svg className="w-full h-full" viewBox="0 0 700 210" preserveAspectRatio="none">
            {/* Shaded Ultraviolet Region (100 to 380 nm) */}
            <rect x="40" y="10" width="100" height="180" fill="#9333ea" fillOpacity="0.08" />
            <text x="50" y="30" fill="#a855f7" fontSize="10" fontFamily="monospace">
              ULTRAVIOLET
            </text>

            {/* Shaded Visible Rainbow Band (380 to 750 nm) */}
            <defs>
              <linearGradient id="visibleRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="75%" stopColor="#eab308" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x="140" y="10" width="130" height="180" fill="url(#visibleRainbow)" />
            <text
              x="155"
              y="30"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              VISIBLE (380–750 nm)
            </text>

            {/* Shaded Infrared Region (750 to 2000 nm) */}
            <rect x="270" y="10" width="390" height="180" fill="#ef4444" fillOpacity="0.06" />
            <text x="300" y="30" fill="#f87171" fontSize="10" fontFamily="monospace">
              INFRARED (HEAT)
            </text>

            {/* Grid horizontal guidelines */}
            <line x1="40" y1="50" x2="660" y2="50" stroke="#ffffff15" strokeDasharray="4 4" />
            <line x1="40" y1="100" x2="660" y2="100" stroke="#ffffff15" strokeDasharray="4 4" />
            <line x1="40" y1="150" x2="660" y2="150" stroke="#ffffff15" strokeDasharray="4 4" />
            <line x1="40" y1="190" x2="660" y2="190" stroke="#ffffff30" />

            {/* Planck Radiance Curve */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke={blackbodyColor.hex}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}

            {/* Peak Wavelength Indicator Needle */}
            {peakWavelengthNm >= 100 && peakWavelengthNm <= 1900 && (
              <g>
                {(() => {
                  const xPos = 40 + ((peakWavelengthNm - 100) / (1900 - 100)) * 620;
                  return (
                    <>
                      <line
                        x1={xPos}
                        y1="10"
                        x2={xPos}
                        y2="190"
                        stroke="#00ffff"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      <circle cx={xPos} cy="20" r="4" fill="#00ffff" />
                      <text
                        x={xPos + 6}
                        y="24"
                        fill="#00ffff"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Peak: {peakWavelengthNm} nm
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Wavelength Axis Markers */}
            <text x="40" y="204" fill="#64748b" fontSize="9" fontFamily="monospace">
              100 nm
            </text>
            <text x="140" y="204" fill="#64748b" fontSize="9" fontFamily="monospace">
              380 nm
            </text>
            <text x="270" y="204" fill="#64748b" fontSize="9" fontFamily="monospace">
              750 nm
            </text>
            <text x="440" y="204" fill="#64748b" fontSize="9" fontFamily="monospace">
              1250 nm
            </text>
            <text x="630" y="204" fill="#64748b" fontSize="9" fontFamily="monospace">
              1900 nm
            </text>
          </svg>
        </div>
      </div>

      {/* 4. Stellar Absorption Spectrum (Fraunhofer Lines) */}
      <div className="rounded-2xl border border-white/10 bg-slate-950 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="size-4 text-emerald-400" />
              Observed Stellar Absorption Spectrum (Optical Fraunhofer Lines)
            </h4>
            <p className="text-xs text-slate-400">
              Photospheric gases absorb specific photon frequencies, leaving dark barcode absorption
              lines.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFraunhoferLines(!showFraunhoferLines)}
            className="border-white/10 text-xs text-slate-300"
          >
            {showFraunhoferLines ? "Hide Line Identifiers" : "Show Line Identifiers"}
          </Button>
        </div>

        {/* Rainbow Spectrum Strip with Absorption Dark Lines */}
        <div className="relative h-14 w-full rounded-xl overflow-hidden border border-white/20 shadow-inner">
          {/* Continuous Rainbow Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #4c1d95, #3b82f6 20%, #06b6d4 35%, #22c55e 50%, #eab308 70%, #f97316 85%, #dc2626 100%)",
            }}
          />

          {/* Fraunhofer Dark Absorption Lines */}
          {STELLAR_ABSORPTION_LINES.map((line) => {
            // Map 380-750 nm to 0% - 100%
            if (line.wavelengthNm < 380 || line.wavelengthNm > 750) return null;
            const leftPercent = ((line.wavelengthNm - 380) / (750 - 380)) * 100;

            // Calculate temperature-dependent intensity (Balmer peaks at ~9,500 K, Calcium at ~5,500 K, etc.)
            const tempDist = Math.abs(temperature - line.peakTempK);
            const isVisibleAtThisTemp =
              temperature >= line.minTempK && temperature <= line.maxTempK;
            const opacity = isVisibleAtThisTemp ? Math.max(0.35, 1 - tempDist / 12000) : 0.05;

            return (
              <div
                key={line.id}
                className="absolute top-0 bottom-0 w-1 bg-black group"
                style={{
                  left: `${leftPercent}%`,
                  opacity: opacity,
                  boxShadow: opacity > 0.4 ? "0 0 4px #000000" : "none",
                }}
              >
                {showFraunhoferLines && (
                  <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-slate-900 border border-white/20 text-[10px] text-white whitespace-nowrap z-30 shadow-xl">
                    <div className="font-bold text-amber-400">{line.name}</div>
                    <div className="text-slate-300">
                      {line.wavelengthNm} nm • {line.species}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spectrum line legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>380 nm (Violet)</span>
          <span className="text-amber-300">
            {temperature > 20000
              ? "He II lines active (Extremely Hot)"
              : temperature > 8000
                ? "Balmer Hydrogen lines (H-α, H-β) peak in intensity!"
                : temperature > 5000
                  ? "Ca II H & K lines dominant (Solar-type spectrum)"
                  : "Molecular TiO absorption bands active (Cool Red Dwarf)"}
          </span>
          <span>750 nm (Deep Red)</span>
        </div>
      </div>

      {/* 5. Educational Deep Dive Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Why No Green Stars? */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            Why Are There No Green Stars in the Sky?
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our Sun's Planck curve actually peaks in green light (~502 nm)! However, blackbody
            radiators emit a wide, continuous spectrum across all colors simultaneously. When green
            photons reach human eyes alongside equal amounts of red and blue photons, our brain's
            retinal cones perceive the combined mixture as{" "}
            <strong>pure white or warm yellow</strong>. To see green, a star would have to emit ONLY
            green light while blocking red and blue—which thermodynamics forbids!
          </p>
        </div>

        {/* Real Star Colors vs Astrophotography */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            Astronomical Photographs vs True Visible Color
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Many famous space images (like Hubble's <em>Pillars of Creation</em>) use the{" "}
            <strong>Hubble Palette (SHO)</strong>: invisible sulfur emission is mapped to red,
            hydrogen-alpha to green, and ionized oxygen to blue. While invaluable for analyzing
            chemical gas composition, this is artificial scientific coloring. Real stars observed
            through an eyepiece strictly follow the continuous blackbody colors shown above!
          </p>
        </div>
      </div>
    </div>
  );
}
