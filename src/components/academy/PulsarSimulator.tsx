import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sparkles,
  Volume2,
  VolumeX,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PulsarSimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [spinRateHz, setSpinRateHz] = useState<number>(30); // 30 Hz (like Crab Pulsar)
  const [magneticTiltDeg, setMagneticTiltDeg] = useState<number>(45); // 45 degree tilt
  const [isMagnetarMode, setIsMagnetarMode] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [starquakeActive, setStarquakeActive] = useState<boolean>(false);

  // Audio oscillator for radio pulse sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const triggerPulseBeep = React.useCallback(() => {
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isMagnetarMode ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(isMagnetarMode ? 880 : 440, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [audioEnabled, isMagnetarMode]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let lastPulseAngle = -1;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Deep space backdrop
      ctx.fillStyle = "#030714";
      ctx.fillRect(0, 0, W, H);

      // Draw faint distant stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let i = 0; i < 40; i++) {
        const sx = (i * 1234.5) % W;
        const sy = (i * 5678.9) % H;
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      if (isPlaying) {
        // Advance angle by spin rate
        const dAngle = (spinRateHz * Math.PI * 2) / 60;
        angle = (angle + dAngle) % (Math.PI * 2);
      }

      // Check if lighthouse beam points towards observer (angle ~ pi/2)
      const beamAngleOffset = Math.sin(angle) * (magneticTiltDeg / 90);
      const isBeamHitting = Math.abs(beamAngleOffset) > 0.85;

      if (isBeamHitting && Math.floor(angle * 5) !== lastPulseAngle) {
        lastPulseAngle = Math.floor(angle * 5);
        setPulseCount((c) => c + 1);
        triggerPulseBeep();
      }

      // 1. Draw Magnetic Dipole Field Lines
      ctx.save();
      ctx.translate(cx, cy);
      const tiltRad = (magneticTiltDeg * Math.PI) / 180;
      ctx.rotate(tiltRad);

      const fieldColor = isMagnetarMode ? "rgba(244, 63, 94, 0.35)" : "rgba(56, 189, 248, 0.28)";

      ctx.strokeStyle = fieldColor;
      ctx.lineWidth = isMagnetarMode ? 2.5 : 1.5;

      for (let r = 50; r <= 160; r += 32) {
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.7, r * 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Twin Synchrotron Relativistic Beams (from magnetic poles)
      const beamGradN = ctx.createRadialGradient(0, -30, 5, 0, -180, 70);
      const beamColCore = isMagnetarMode ? "#f43f5e" : "#38bdf8";
      beamGradN.addColorStop(0, "#ffffff");
      beamGradN.addColorStop(0.3, beamColCore);
      beamGradN.addColorStop(1, "rgba(2, 6, 23, 0)");

      // North beam cone
      ctx.fillStyle = beamGradN;
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-55, -200);
      ctx.lineTo(55, -200);
      ctx.lineTo(10, -20);
      ctx.closePath();
      ctx.fill();

      // South beam cone
      const beamGradS = ctx.createRadialGradient(0, 30, 5, 0, 180, 70);
      beamGradS.addColorStop(0, "#ffffff");
      beamGradS.addColorStop(0.3, beamColCore);
      beamGradS.addColorStop(1, "rgba(2, 6, 23, 0)");

      ctx.fillStyle = beamGradS;
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(-55, 200);
      ctx.lineTo(55, 200);
      ctx.lineTo(10, 20);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // 3. Central Neutron Star (City-sized solid sphere)
      ctx.save();
      ctx.translate(cx, cy);

      // Starquake shockwave pulse
      if (starquakeActive) {
        ctx.beginPath();
        ctx.arc(0, 0, 55 + (Date.now() % 500) * 0.15, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(251, 146, 60, 0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Star outer glow
      const starGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 36);
      starGlow.addColorStop(0, "#ffffff");
      starGlow.addColorStop(0.4, isMagnetarMode ? "#fb7185" : "#7dd3fc");
      starGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = starGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      // Solid neutron crust
      ctx.fillStyle = isMagnetarMode ? "#e11d48" : "#0284c7";
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      // Rotation Axis Indicator line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(0, 90);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // 4. Observer Antenna Flash Signal indicator (Top-Right)
      ctx.fillStyle = isBeamHitting ? (isMagnetarMode ? "#f43f5e" : "#38bdf8") : "#1e293b";
      ctx.beginPath();
      ctx.arc(W - 40, 40, isBeamHitting ? 14 : 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isBeamHitting ? "#ffffff" : "#475569";
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    spinRateHz,
    magneticTiltDeg,
    isMagnetarMode,
    audioEnabled,
    starquakeActive,
    triggerPulseBeep,
  ]);

  const handleTriggerStarquake = () => {
    setStarquakeActive(true);
    triggerPulseBeep();
    setTimeout(() => setStarquakeActive(false), 1200);
  };

  return (
    <div className="rounded-3xl border border-sky-500/30 bg-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Interactive Lab • Lighthouse Mechanism
            </span>
            <span className="text-xs text-slate-400">Pulsar & Magnetar Simulator</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Cosmic Radio Lighthouse & Starquakes</span>
          </h3>
        </div>

        {/* Audio Toggle & Play/Pause */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`text-xs ${
              audioEnabled
                ? "border-sky-400 text-sky-300 bg-sky-950/40"
                : "border-white/10 text-slate-400"
            }`}
          >
            {audioEnabled ? (
              <Volume2 className="size-3.5 mr-1 text-sky-400" />
            ) : (
              <VolumeX className="size-3.5 mr-1" />
            )}
            <span>{audioEnabled ? "Audio On" : "Audio Muted"}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
          >
            {isPlaying ? <Pause className="size-3.5 mr-1" /> : <Play className="size-3.5 mr-1" />}
            <span>{isPlaying ? "Pause Spin" : "Resume"}</span>
          </Button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative rounded-2xl border border-white/10 bg-[#030714] mt-5 h-[340px] sm:h-[400px] w-full overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} width={640} height={400} className="w-full h-full object-contain" />

        {/* Real-Time Pulse Counter Badge */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-3 text-xs">
          <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">
            Earth Radio Receiver
          </span>
          <span className="text-base font-mono font-bold text-white">
            {pulseCount} pulses recorded
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Spin Rate: {spinRateHz} rotations/sec ({spinRateHz * 60} RPM)
          </span>
        </div>

        {/* Mode Label */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs">
          <span className="font-mono text-slate-300">
            Magnetic Field:{" "}
            <strong className={isMagnetarMode ? "text-rose-400" : "text-sky-300"}>
              {isMagnetarMode ? "10¹¹ Tesla (Magnetar)" : "10⁸ Tesla (Normal Pulsar)"}
            </strong>
          </span>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spin Rate Slider */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-white">Spin Frequency:</span>
            <span className="text-sky-400 font-mono">{spinRateHz} Hz</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            value={spinRateHz}
            onChange={(e) => setSpinRateHz(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 Hz (Slow)</span>
            <span>30 Hz (Crab)</span>
            <span>60 Hz (Millisecond)</span>
          </div>
        </div>

        {/* Magnetic Inclination Angle Slider */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-white">Magnetic Tilt Angle:</span>
            <span className="text-amber-400 font-mono">{magneticTiltDeg}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={magneticTiltDeg}
            onChange={(e) => setMagneticTiltDeg(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0° (Aligned)</span>
            <span>45° (Typical)</span>
            <span>90° (Orthogonal)</span>
          </div>
        </div>

        {/* Mode Switch: Pulsar vs Magnetar + Starquake Button */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Stellar Subtype:</span>
            <button
              onClick={() => setIsMagnetarMode(!isMagnetarMode)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                isMagnetarMode
                  ? "bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/40"
                  : "bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-900/40"
              }`}
            >
              {isMagnetarMode ? "Magnetar Mode" : "Standard Pulsar"}
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleTriggerStarquake}
            className="w-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs"
          >
            <Zap className="size-3.5 mr-1" />
            Trigger Starquake Flare!
          </Button>
        </div>
      </div>
    </div>
  );
}
