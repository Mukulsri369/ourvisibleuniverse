import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store";
import { Eye, Sparkles, Sliders, ShieldCheck, Activity } from "lucide-react";

export function OpticsControlModal() {
  const open = useStore((s) => s.opticsModalOpen);
  const setOpen = useStore((s) => s.setOpticsModalOpen);
  const setBenchmarkOpen = useStore((s) => s.setBenchmarkModalOpen);

  const opticsPreset = useStore((s) => s.opticsPreset);
  const setOpticsPreset = useStore((s) => s.setOpticsPreset);

  const observerMode = useStore((s) => s.observerMode);
  const setObserverMode = useStore((s) => s.setObserverMode);

  const bloomEnabled = useStore((s) => s.bloomEnabled);
  const toggleBloom = useStore((s) => s.toggleBloom);
  const bloomStrength = useStore((s) => s.bloomStrength);
  const setBloomStrength = useStore((s) => s.setBloomStrength);
  const bloomRadius = useStore((s) => s.bloomRadius);
  const setBloomRadius = useStore((s) => s.setBloomRadius);
  const bloomThreshold = useStore((s) => s.bloomThreshold);
  const setBloomThreshold = useStore((s) => s.setBloomThreshold);

  const autoGalaxyExposure = useStore((s) => s.autoGalaxyExposure);
  const setAutoGalaxyExposure = useStore((s) => s.setAutoGalaxyExposure);
  const exposure = useStore((s) => s.exposure);
  const sceneBrightness = useStore((s) => s.sceneBrightness);
  const setSceneBrightness = useStore((s) => s.setSceneBrightness);
  const setExposure = useStore((s) => s.setExposure);

  const toneMapping = useStore((s) => s.toneMappingAlgorithm);
  const setToneMapping = useStore((s) => s.setToneMappingAlgorithm);

  const diffractionSpikes = useStore((s) => s.diffractionSpikesEnabled);
  const toggleDiffractionSpikes = useStore((s) => s.toggleDiffractionSpikes);

  const scintillation = useStore((s) => s.atmosphericScintillation);
  const setScintillation = useStore((s) => s.setAtmosphericScintillation);

  const stats = useStore((s) => s.performanceStats);

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
        onClick={() => setOpen(false)}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-white/15 bg-neutral-950/95 p-6 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-wide text-white">
                  Astrophysical Optics & Shaders
                </h2>
                <p className="text-xs text-white/50">
                  Calibrated photometric rendering, tone mapping & observer modes
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 space-y-6">
            <label className="flex items-start gap-3 rounded-lg border border-white/10 p-3 text-sm">
              <input
                type="checkbox"
                checked={autoGalaxyExposure}
                onChange={(e) => setAutoGalaxyExposure(e.target.checked)}
                className="mt-1 accent-cyan-400"
              />
              <span>
                Adaptive galaxy exposure
                <span className="mt-1 block text-xs text-white/50">
                  Smoothly balances galaxy fields, dust lanes and bright cores. Your manual settings
                  remain the baseline.
                </span>
              </span>
            </label>
            {/* 1. Scientific vs Cinematic Preset */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Visual Preset
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOpticsPreset("scientific")}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
                    opticsPreset === "scientific"
                      ? "border-cyan-400 bg-cyan-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Scientific Mode</span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    Observation-derived color, calibrated Pogson brightness, zero fake space haze
                  </p>
                </button>

                <button
                  onClick={() => setOpticsPreset("cinematic")}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
                    opticsPreset === "cinematic"
                      ? "border-amber-400 bg-amber-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Cinematic Mode</span>
                  </div>
                  <p className="text-[10px] text-white/50">
                    Expanded dynamic range, enhanced nebula contrast, warm tone curves
                  </p>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 flex items-center justify-between rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-[11px]">
                <span className="text-white/60">Active Profile:</span>
                {opticsPreset === "scientific" ? (
                  <span className="font-medium text-cyan-400">
                    Physically Calibrated (Strict Observation)
                  </span>
                ) : (
                  <span className="font-medium text-amber-300">
                    Enhanced Dynamic Range (Cinematic Active)
                  </span>
                )}
              </div>
            </div>

            {/* 2. Observer Mode: Vacuum vs Atmosphere */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Observer Mode
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setObserverMode("vacuum")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    observerMode === "vacuum"
                      ? "border-cyan-400 bg-cyan-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  <Eye className="h-4 w-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="font-medium">Empty Space (Vacuum)</div>
                    <div className="text-[10px] text-white/50">
                      Steady photometric flux (0 twinkling)
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setObserverMode("atmosphere")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    observerMode === "atmosphere"
                      ? "border-emerald-400 bg-emerald-500/15 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-medium">Atmospheric Mode</div>
                    <div className="text-[10px] text-white/50">Ground airmass scintillation</div>
                  </div>
                </button>
              </div>

              {observerMode === "atmosphere" && (
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Scintillation Intensity</span>
                    <span className="font-mono text-emerald-400">
                      {Math.round(scintillation * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.9"
                    step="0.05"
                    value={scintillation}
                    onChange={(e) => setScintillation(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-emerald-400"
                  />
                  <p className="mt-1 text-[10px] text-white/45">
                    Modulates stellar optical path refraction matching Earth surface telescope
                    observations.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Tone Mapping & Exposure */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Optics & Color Management
              </label>
              <div className="my-4 space-y-3 rounded-lg border border-white/10 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      useStore.setState({
                        opticsPreset: "scientific",
                        exposure: 0.045,
                        sceneBrightness: 0.65,
                        bloomStrength: 0.04,
                        bloomRadius: 0.18,
                        bloomThreshold: 1.1,
                        toneMappingAlgorithm: "agx",
                      })
                    }
                    className="min-h-11 rounded border border-sky-300/30 px-3 text-xs text-sky-200 hover:bg-sky-300/10"
                  >
                    Low glare
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      useStore.setState({
                        opticsPreset: "scientific",
                        exposure: 0.1,
                        sceneBrightness: 1,
                        bloomStrength: 0.1,
                        bloomRadius: 0.28,
                        bloomThreshold: 0.82,
                        toneMappingAlgorithm: "neutral",
                        bloomEnabled: true,
                      })
                    }
                    className="min-h-11 rounded border border-white/20 px-3 text-xs text-white/75 hover:bg-white/5"
                  >
                    Restore default
                  </button>
                </div>
                <label className="block text-xs text-white/70" htmlFor="scene-brightness">
                  Brightness{" "}
                  <span className="float-right font-mono text-sky-200">
                    {Math.round(sceneBrightness * 100)}%
                  </span>
                </label>
                <input
                  id="scene-brightness"
                  type="range"
                  min={-4}
                  max={1}
                  step={0.025}
                  value={Math.log2(sceneBrightness)}
                  onChange={(e) => setSceneBrightness(2 ** Number(e.target.value))}
                  className="w-full accent-sky-300"
                />
              </div>

              <div className="mt-2.5 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Tone Mapping Algorithm</span>
                    <span className="font-mono text-cyan-400 uppercase">{toneMapping}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-xs">
                    {(["aces", "agx", "neutral", "reinhard"] as const).map((algo) => (
                      <button
                        key={algo}
                        onClick={() => setToneMapping(algo)}
                        className={`rounded border py-1.5 text-[11px] font-medium uppercase transition ${
                          toneMapping === algo
                            ? "border-cyan-400 bg-cyan-500/20 text-white"
                            : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08]"
                        }`}
                      >
                        {algo}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Exposure</span>
                    <span className="font-mono text-cyan-400">
                      {exposure < 0.1 ? exposure.toFixed(3) : exposure.toFixed(2)}×
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setExposure(exposure / Math.pow(2, 0.25))}
                      className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                      title="Reduce exposure by one-quarter stop"
                    >
                      −¼ stop
                    </button>
                    <input
                      type="range"
                      aria-label="Exposure"
                      min={Math.log2(0.001)}
                      max={Math.log2(2.5)}
                      step={0.025}
                      value={Math.log2(exposure)}
                      onChange={(e) => setExposure(2 ** Number(e.target.value))}
                      className="flex-1 accent-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setExposure(exposure * Math.pow(2, 0.25))}
                      className="px-2 py-1 text-[10px] font-mono rounded bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
                      title="Increase exposure by one-quarter stop"
                    >
                      +¼ stop
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[
                      { label: "Ultra Low (0.01)", val: 0.01 },
                      { label: "Deep Sky (0.05)", val: 0.05 },
                      { label: "Default (0.10)", val: 0.1 },
                      { label: "0.25", val: 0.25 },
                      { label: "0.50", val: 0.5 },
                      { label: "1.00", val: 1 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setExposure(p.val)}
                        className={`px-2 py-0.5 text-[10px] rounded transition ${
                          Math.abs(exposure - p.val) < 0.008
                            ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diffraction Spikes */}
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div>
                    <div className="text-xs font-medium text-white">Stellar Diffraction Spikes</div>
                    <div className="text-[10px] text-white/50">
                      Secondary mirror spider vane diffraction on high-luminosity stars
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={diffractionSpikes}
                    onChange={toggleDiffractionSpikes}
                    className="h-4 w-4 accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* 4. HDR Bloom Pipeline */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  HDR Bloom Pass
                </label>
                <button
                  onClick={toggleBloom}
                  className={`rounded px-2.5 py-0.5 text-[11px] font-medium transition ${
                    bloomEnabled
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {bloomEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {bloomEnabled && (
                <div className="mt-3 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Bloom Strength</span>
                      <span className="font-mono text-cyan-400">{bloomStrength.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.5"
                      step="0.02"
                      value={bloomStrength}
                      onChange={(e) => setBloomStrength(parseFloat(e.target.value))}
                      className="mt-1.5 w-full accent-cyan-400"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {[
                        { label: "0.00", val: 0 },
                        { label: "0.10 (Default)", val: 0.1 },
                        { label: "0.30", val: 0.3 },
                        { label: "0.80", val: 0.8 },
                      ].map((b) => (
                        <button
                          key={b.val}
                          type="button"
                          onClick={() => setBloomStrength(b.val)}
                          className={`px-2 py-0.5 text-[10px] rounded transition ${
                            Math.abs(bloomStrength - b.val) < 0.02
                              ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/50"
                              : "bg-white/5 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Bloom Radius</span>
                      <span className="font-mono text-cyan-400">{bloomRadius.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.85"
                      step="0.05"
                      value={bloomRadius}
                      onChange={(e) => setBloomRadius(parseFloat(e.target.value))}
                      className="mt-1.5 w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">Bloom Threshold (Airy Disc Core)</span>
                      <span className="font-mono text-cyan-400">{bloomThreshold.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.95"
                      step="0.02"
                      value={bloomThreshold}
                      onChange={(e) => setBloomThreshold(parseFloat(e.target.value))}
                      className="mt-1.5 w-full accent-cyan-400"
                    />
                    <p className="mt-1 text-[10px] text-white/40">
                      Higher threshold prevents diffuse empty space from glowing, confining bloom to
                      true stellar cores.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Performance Bar & Benchmarks Button */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/60 p-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-white/70">Live FPS:</span>
                <span className="font-mono text-sm font-semibold text-emerald-400">
                  {stats.fps} FPS
                </span>
                <span className="ml-2 text-[10px] text-white/40">
                  ({stats.drawCalls} calls • {(stats.pointsCount / 1000).toFixed(0)}k pts)
                </span>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setBenchmarkOpen(true);
                }}
                className="rounded border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
              >
                Benchmark Specs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
