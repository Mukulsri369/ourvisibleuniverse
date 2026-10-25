/** Original cinematic sound design; not a recording of sound propagating through vacuum. */
export function descentSoundProfile(progress: number, radiusRs: number, angle: number) {
  const p = Math.max(0, Math.min(1, progress));
  const near = 1 / Math.max(1, radiusRs);
  return {
    volume: (0.085 + p * 0.065) * (1 - Math.min(1, Math.max(0, (p - 0.975) / 0.025))),
    bassHz: 38 + p * 19 + near * 8,
    flowHz: 130 + p * p * 1450 + near * 950,
    shimmerHz: 180 + p * p * 620,
    pan: Math.sin(angle) * 0.58,
    pulse: 0.82 + Math.sin(angle * 2) * 0.18,
  };
}
/** Shared by live playback and deterministic offline waveform verification. */
export function createDescentSoundGraph(ctx: BaseAudioContext) {
  const master = ctx.createGain(),
    limiter = ctx.createDynamicsCompressor();
  master.gain.value = 0;
  limiter.threshold.value = -16;
  limiter.knee.value = 18;
  limiter.ratio.value = 8;
  limiter.attack.value = 0.006;
  limiter.release.value = 0.25;
  master.connect(limiter).connect(ctx.destination);
  const bass = ctx.createOscillator(),
    sub = ctx.createOscillator(),
    shimmer = ctx.createOscillator();
  bass.type = sub.type = "sine";
  shimmer.type = "triangle";
  bass.frequency.value = 38;
  sub.frequency.value = 57;
  shimmer.frequency.value = 180;
  const low = ctx.createGain(),
    tone = ctx.createGain();
  low.gain.value = 0.3;
  tone.gain.value = 0.012;
  bass.connect(low);
  sub.connect(low);
  low.connect(master);
  shimmer.connect(tone).connect(master);
  const noise = ctx.createBufferSource(),
    buffer = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
  let seed = 9731;
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let pink = 0;
    for (let i = 0; i < data.length; i++) {
      seed = Math.imul(seed ^ (seed >>> 15), 2246822519);
      pink = pink * 0.92 + (((seed >>> 0) / 4294967296) * 2 - 1) * 0.08;
      data[i] = pink * 2.5;
    }
    // Seamless loop, with no click on the four-second wrap.
    const fade = Math.floor(ctx.sampleRate * 0.04);
    for (let i = 0; i < fade; i++) {
      data[i] *= i / fade;
      data[data.length - 1 - i] *= i / fade;
    }
  }
  noise.buffer = buffer;
  noise.loop = true;
  const flow = ctx.createBiquadFilter(),
    panner = ctx.createStereoPanner();
  flow.type = "bandpass";
  flow.frequency.value = 130;
  flow.Q.value = 0.65;
  const air = ctx.createGain();
  air.gain.value = 0.5;
  noise.connect(flow).connect(air).connect(panner).connect(master);

  const sources = [bass, sub, shimmer, noise];
  const nodes = [master, limiter, low, tone, flow, air, panner];
  sources.forEach((source) => source.start());
  return { master, bass, shimmer, flow, panner, toneGain: tone, sources, nodes };
}
class BlackHoleAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private bass: OscillatorNode | null = null;
  private shimmer: OscillatorNode | null = null;
  private flow: BiquadFilterNode | null = null;
  private panner: StereoPannerNode | null = null;
  private toneGain: GainNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private nodes: AudioNode[] = [];
  private release: ReturnType<typeof setTimeout> | null = null;
  private muted = false;
  get status() {
    return {
      state: this.context?.state ?? "uninitialized",
      active: this.sources.length > 0,
      muted: this.muted,
    };
  }
  setMuted(value: boolean) {
    this.muted = value;
    if (value) this.silence();
  }
  async start() {
    if (this.muted || typeof window === "undefined" || !window.AudioContext) return false;
    if (this.release) {
      clearTimeout(this.release);
      this.release = null;
    }
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      if (this.sources.length) return true;
      const graph = createDescentSoundGraph(this.context);
      this.master = graph.master;
      this.bass = graph.bass;
      this.shimmer = graph.shimmer;
      this.flow = graph.flow;
      this.panner = graph.panner;
      this.toneGain = graph.toneGain;
      this.sources = graph.sources;
      this.nodes = graph.nodes;
      return true;
    } catch {
      this.stop();
      return false;
    }
  }
  update(progress: number, radiusRs: number, angle: number, audible: boolean, returning = 1) {
    if (!this.context || !this.master) return;
    const p = descentSoundProfile(progress, radiusRs, angle),
      t = this.context.currentTime;
    this.master.gain.setTargetAtTime(audible && !this.muted ? p.volume * returning : 0, t, 0.1);
    this.bass?.frequency.setTargetAtTime(p.bassHz, t, 0.12);
    this.shimmer?.frequency.setTargetAtTime(p.shimmerHz, t, 0.12);
    this.flow?.frequency.setTargetAtTime(p.flowHz, t, 0.15);
    this.panner?.pan.setTargetAtTime(p.pan, t, 0.1);
    this.toneGain?.gain.setTargetAtTime(0.012 * p.pulse, t, 0.1);
  }
  silence() {
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.08);
  }
  stop() {
    this.silence();
    if (this.release) clearTimeout(this.release);
    this.release = setTimeout(() => {
      for (const source of this.sources) {
        try {
          source.stop();
          source.disconnect();
        } catch {
          /* already stopped */
        }
      }
      this.sources = [];
      this.nodes.forEach((node) => node.disconnect());
      this.nodes = [];
      this.master?.disconnect();
      this.master = null;
      this.release = null;
      void this.context?.suspend().catch(() => {});
    }, 500);
  }
}
export const blackHoleAudio = new BlackHoleAudio();
