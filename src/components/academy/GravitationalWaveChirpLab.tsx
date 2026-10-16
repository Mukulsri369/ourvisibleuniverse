import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Activity,
  Layers,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BinaryPreset {
  id: string;
  name: string;
  m1: number;
  m2: number;
  finalMass: number;
  radiatedMass: number;
  description: string;
}

const BINARY_PRESETS: BinaryPreset[] = [
  {
    id: "gw150914",
    name: "GW150914 (First Discovery)",
    m1: 36,
    m2: 29,
    finalMass: 62,
    radiatedMass: 3.0,
    description:
      "First direct detection on Sept 14, 2015. Three solar masses converted to pure gravitational radiation in 0.2 seconds!",
  },
  {
    id: "gw170817",
    name: "GW170817 (Binary Neutron Stars)",
    m1: 1.46,
    m2: 1.27,
    finalMass: 2.7,
    radiatedMass: 0.03,
    description:
      "Two neutron stars colliding, producing gravitational waves and a kilonova flash of gold, platinum, and gamma rays.",
  },
  {
    id: "gw190521",
    name: "GW190521 (Heavyweight Merger)",
    m1: 85,
    m2: 66,
    finalMass: 142,
    radiatedMass: 8.0,
    description:
      "Forged the first confirmed intermediate-mass black hole (142 M☉), radiating 8 solar masses of energy across 17 billion light-years.",
  },
];

export function GravitationalWaveChirpLab() {
  const [selectedPreset, setSelectedPreset] = useState<BinaryPreset>(BINARY_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressTime, setProgressTime] = useState<number>(0); // 0 to 1
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [hasMerged, setHasMerged] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Chirp Mass calculation: M_c = (m1 * m2)^(3/5) / (m1 + m2)^(1/5)
  const m1 = selectedPreset.m1;
  const m2 = selectedPreset.m2;
  const chirpMass = Math.pow(m1 * m2, 3 / 5) / Math.pow(m1 + m2, 1 / 5);

  // Audio chirp player
  const startAudioChirp = () => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        )();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      stopAudioChirp();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(35, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch {
      // Audio context policy
    }
  };

  const stopAudioChirp = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {
        // Oscillator may already be stopped
      }
      oscRef.current = null;
    }
  };

  // Timer loop for simulation progress (0 to 1 over ~5 seconds)
  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (isPlaying) {
        setProgressTime((prev) => {
          const next = prev + dt * 0.22;
          if (next >= 1) {
            setHasMerged(true);
            stopAudioChirp();
            return 1;
          }
          // Frequency modulation for audio
          if (audioCtxRef.current && oscRef.current) {
            const currentFreq = 35 + Math.pow(next, 3) * 260;
            oscRef.current.frequency.setValueAtTime(currentFreq, audioCtxRef.current.currentTime);
          }
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleRestart = () => {
    setProgressTime(0);
    setHasMerged(false);
    setIsPlaying(true);
    startAudioChirp();
  };

  // Render Inspiral Orbit View
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    // Spacetime grid distortion
    ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = 1;
    const gridSize = 24;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Orbital radius contracts as time progresses: r ∝ (1 - t)^(1/4)
    const currentSeparation = Math.max(12, (1 - Math.pow(progressTime, 1.8)) * 140);
    const orbitAngle = progressTime * 28 * Math.PI;

    // Center of mass offsets (m1 * r1 = m2 * r2)
    const totalMass = m1 + m2;
    const r1 = currentSeparation * (m2 / totalMass);
    const r2 = currentSeparation * (m1 / totalMass);

    const x1 = cx + Math.cos(orbitAngle) * r1;
    const y1 = cy + Math.sin(orbitAngle) * r1;

    const x2 = cx - Math.cos(orbitAngle) * r2;
    const y2 = cy - Math.sin(orbitAngle) * r2;

    // Gravitational wave ripples propagating outwards
    const waveCount = 5;
    for (let w = 0; w < waveCount; w++) {
      const waveRadius = currentSeparation + ((w * 35 + progressTime * 120) % 160);
      const alpha = Math.max(0, 0.45 - waveRadius / 200);
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Body 1
    const radius1 = Math.max(6, Math.min(18, Math.sqrt(m1) * 2.2));
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(x1, y1, radius1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Body 2
    const radius2 = Math.max(6, Math.min(18, Math.sqrt(m2) * 2.2));
    ctx.fillStyle = "#c084fc";
    ctx.beginPath();
    ctx.arc(x2, y2, radius2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // If merged: draw final merged horizon and ringdown burst
    if (hasMerged) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 38, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [progressTime, hasMerged, m1, m2]);

  // Render Gravitational Wave Strain Waveform h(t)
  useEffect(() => {
    const canvas = waveformRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030714";
    ctx.fillRect(0, 0, W, H);

    // Baseline axis
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();

    // Draw real-time rising chirp strain wave
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const maxPoints = Math.floor(W * progressTime);
    for (let x = 0; x <= maxPoints; x++) {
      const t = x / W; // 0 to 1
      // Frequency ramps up: f(t) ~ (1 - t)^(-3/8)
      const freq = 4 + Math.pow(t, 2.5) * 38;
      // Amplitude ramps up: A(t) ~ (1 - t)^(-1/4)
      const amp = Math.min(midY - 10, 6 + Math.pow(t, 2) * (midY - 14));
      const y = midY + Math.sin(t * freq * Math.PI * 2) * amp;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Ringdown decay after merger
    if (progressTime >= 0.98) {
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = maxPoints; x < Math.min(W, maxPoints + 40); x++) {
        const decay = Math.exp(-(x - maxPoints) * 0.15);
        const y = midY + Math.sin((x - maxPoints) * 0.8) * 20 * decay;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [progressTime]);

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Signature Lab • Spacetime Ripples
            </span>
            <span className="text-xs text-slate-400">Gravitational-Wave Chirp Simulator</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Binary Inspiral & LIGO Chirp Waveform</span>
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`text-xs ${
              audioEnabled
                ? "border-indigo-400 text-indigo-300 bg-indigo-950/40"
                : "border-white/10 text-slate-400"
            }`}
          >
            {audioEnabled ? (
              <Volume2 className="size-3.5 mr-1 text-indigo-400" />
            ) : (
              <VolumeX className="size-3.5 mr-1" />
            )}
            <span>{audioEnabled ? "Audio Chirp On" : "Audio Muted"}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleRestart}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
          >
            <RotateCcw className="size-3.5 mr-1" />
            <span>Replay Inspiral</span>
          </Button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {BINARY_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedPreset(p);
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedPreset.id === p.id
                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/50"
                : "bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Two Canvas Stages: Inspiral Orbit + Chirp Waveform */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Inspiral Orbit Canvas */}
        <div className="relative rounded-2xl border border-white/10 bg-[#020617] h-[280px] w-full overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={420}
            height={280}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-slate-300">
            <span>Inspiral Stage: </span>
            <strong className="text-cyan-400 font-mono">
              {hasMerged ? "MERGER FLASH" : `${Math.floor(progressTime * 100)}% orbital decay`}
            </strong>
          </div>
        </div>

        {/* Right: Strain Waveform h(t) */}
        <div className="relative rounded-2xl border border-white/10 bg-[#030714] h-[280px] w-full overflow-hidden flex items-center justify-center">
          <canvas
            ref={waveformRef}
            width={420}
            height={280}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-slate-300">
            <span>Gravitational Strain: </span>
            <strong className="text-amber-400 font-mono">h(t) Chirp Waveform</strong>
          </div>
          <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-mono">
            Frequency: 35 Hz → 250 Hz Peak
          </div>
        </div>
      </div>

      {/* Mass & Energy Balance Card */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Primary Mass (m1):</span>
          <span className="text-base font-mono font-bold text-cyan-300">
            {selectedPreset.m1} M☉
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Secondary Mass (m2):</span>
          <span className="text-base font-mono font-bold text-purple-300">
            {selectedPreset.m2} M☉
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Chirp Mass (M_c):</span>
          <span className="text-base font-mono font-bold text-amber-300">
            {chirpMass.toFixed(1)} M☉
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block">Radiated as GW Energy:</span>
          <span className="text-base font-mono font-bold text-rose-400">
            {selectedPreset.radiatedMass} M☉ c²
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400 italic">{selectedPreset.description}</p>
    </div>
  );
}
