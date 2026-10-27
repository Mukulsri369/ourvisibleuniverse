import { create } from "zustand";
import type { SoundProfile } from "./object-sound-profiles";

export type AudioMode = "cinematic" | "focus";
export const useObjectAudio = create<{
  volume: number;
  spatial: boolean;
  mode: AudioMode;
  status: "off" | "starting" | "playing" | "paused" | "blocked";
  profile: SoundProfile | null;
  set: (v: Partial<{ volume: number; spatial: boolean; mode: AudioMode }>) => void;
}>((set) => ({
  volume: 0.45,
  spatial: true,
  mode: "cinematic",
  status: "off",
  profile: null,
  set,
}));

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo));
function target(p: AudioParam, value: number, t: number, tau = 0.22) {
  p.setTargetAtTime(value, t, tau);
}

export function makeSoundNoise(ctx: BaseAudioContext) {
  // One shared, seamless stereo noise buffer per context; never fetch audio.
  const length = Math.floor(ctx.sampleRate * 6),
    b = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    let seed = 1789 + channel * 93,
      pink = 0;
    const data = b.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      pink = 0.97 * pink + 0.03 * (seed / 2147483648 - 1);
      data[i] = pink * 5 * Math.min(1, i / 2048, (length - i - 1) / 2048);
    }
  }
  return b;
}

export function createObjectVoice(
  ctx: BaseAudioContext,
  p: SoundProfile,
  noiseBuffer: AudioBuffer,
  output: AudioNode,
) {
  const nodes: AudioNode[] = [],
    sources: AudioScheduledSourceNode[] = [];
  const keep = <T extends AudioNode>(n: T): T => {
    nodes.push(n);
    return n;
  };
  const gain = (v: number) => {
    const n = keep(ctx.createGain());
    n.gain.value = v;
    return n;
  };
  const mix = gain(1),
    envelope = gain(0),
    body = gain(1),
    atmosphere = gain(p.air);
  const filter = keep(ctx.createBiquadFilter());
  filter.type = "lowpass";
  filter.Q.value = 0.45;
  filter.frequency.value = p.cutoff;
  const panner = keep(ctx.createStereoPanner());
  body.connect(mix);
  atmosphere.connect(mix);
  mix.connect(filter).connect(envelope).connect(panner).connect(output);
  const oscillator = (
    frequency: number,
    volume: number,
    destination: AudioNode | AudioParam,
    type: OscillatorType = "sine",
  ) => {
    const o = keep(ctx.createOscillator()),
      g = gain(volume);
    o.type = type;
    o.frequency.value = frequency;
    o.connect(g);
    if (destination instanceof AudioParam) g.connect(destination);
    else g.connect(destination);
    sources.push(o);
    o.start();
    return o;
  };
  // Each archetype has a different spectral balance and interval structure,
  // rather than pitching the same ambient drone up and down.
  const palettes = {
    open: [0.04, 0.025, 0.01, 2, 0.009, 0.4],
    star: [0.16, 0.1, 0.07, 3.002, 0.025, 1],
    rock: [0.025, 0.035, 0.035, 2.71, 0.09, 0.5],
    atmosphere: [0.045, 0.035, 0.015, 2.003, 0.009, 2.8],
    plasma: [0.08, 0.045, 0.055, 5.997, 0.03, 2.2],
    nebula: [0.045, 0.07, 0.08, 1.498, 0.045, 1.5],
    galaxy: [0.08, 0.06, 0.065, 1.25, 0.04, 1.1],
    pulsar: [0.035, 0.025, 0.02, 2, 0.008, 0.7],
    remnant: [0.1, 0.035, 0.08, 2.76, 0.045, 1.5],
    "black-hole": [0.24, 0.06, 0.02, 1.501, 0.008, 1.7],
    quasar: [0.13, 0.04, 0.045, 3.01, 0.025, 2.8],
    chirp: [0.018, 0.006, 0.004, 2, 0.002, 0.4],
  } satisfies Record<SoundProfile["family"], number[]>;
  const [subLevel, baseLevel, upperLevel, interval, sparkleLevel, airScale] = palettes[p.family];
  const low = oscillator(p.fundamental / 2, subLevel, body);
  oscillator(p.fundamental, baseLevel, body);
  const upper = oscillator(p.fundamental * interval, upperLevel, body);
  oscillator(p.drift, 3.5 + (p.seed % 8), upper.frequency);
  const noise = keep(ctx.createBufferSource());
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const band = keep(ctx.createBiquadFilter());
  band.type = "bandpass";
  band.frequency.value = p.cutoff * 0.5;
  band.Q.value = 0.7;
  noise.connect(band).connect(atmosphere);
  sources.push(noise);
  noise.start(0, (p.seed % 50) / 10);
  oscillator(p.drift * 0.71, p.cutoff * 0.18, band.frequency);
  const sparkle = gain(0.5);
  sparkle.connect(body);
  oscillator(
    p.fundamental * (p.family === "rock" ? 4.76 : p.family === "galaxy" ? 3 : 4),
    sparkleLevel,
    sparkle,
  );
  oscillator(0.13 + (p.seed % 11) * 0.014, 0.4, sparkle.gain);
  // A single quiet reflection lends depth without a convolution or feedback tail.
  const reflection = keep(ctx.createDelay(0.5)),
    reflectionLevel = gain(0.16);
  reflection.delayTime.value = 0.17 + (p.seed % 7) * 0.019;
  sparkle.connect(reflection).connect(reflectionLevel).connect(body);
  const pulse = gain(0);
  pulse.connect(mix);
  if (p.pulseHz) {
    // A positive cosine-like envelope repeats at the catalogue cadence.
    const pulseGate = gain(0.5);
    pulseGate.connect(pulse);
    oscillator(p.pulseHz, 0.5, pulseGate.gain);
    oscillator(420 + (p.seed % 300), 0.2, pulseGate);
  }
  const chirpGain = gain(0);
  chirpGain.connect(mix);
  const chirp = oscillator(45, 0.22, chirpGain);
  let nextChirp = ctx.currentTime + 1;
  let dead = false;
  return {
    profile: p,
    envelope,
    panner,
    nodes,
    sources,
    update(t: number, proximity: number, pan: number, travel: number, mode: AudioMode) {
      if (dead) return;
      const focused = mode === "focus";
      target(body.gain, focused ? (p.pulseHz || p.family === "chirp" ? 0.08 : 0.42) : 1, t);
      target(atmosphere.gain, p.air * airScale * (focused ? 0.16 : 1 + travel * 0.4), t);
      target(pulse.gain, focused ? 1 : 0.65, t);
      target(filter.frequency, p.cutoff * (0.65 + proximity * 0.55 + travel * 0.15), t, 0.4);
      target(panner.pan, clamp(pan, -0.75, 0.75), t, 0.32);
      target(low.detune, focused ? 0 : travel * 9, t, 0.5);
      // Same qualitative inspiral contour for all GW regions: never claim event data.
      if (p.family === "chirp" && t >= nextChirp) {
        chirp.frequency.cancelScheduledValues(t);
        chirpGain.gain.cancelScheduledValues(t);
        chirp.frequency.setValueAtTime(45, t);
        for (let i = 1; i <= 32; i++) {
          const u = i / 32;
          chirp.frequency.exponentialRampToValueAtTime(
            45 * Math.pow(1 - u * 0.9995, -0.375),
            t + u * 2.8,
          );
        }
        chirpGain.gain.setValueAtTime(0, t);
        chirpGain.gain.linearRampToValueAtTime(0.12, t + 1.9);
        chirpGain.gain.linearRampToValueAtTime(0.65, t + 2.76);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.95);
        nextChirp = t + 10;
      }
      // All voices are finite graphs; the modulation oscillators also get stopped.
    },
    release(at: number) {
      if (dead) return;
      dead = true;
      for (const source of sources) {
        try {
          source.stop(at);
        } catch {
          /* already stopped */
        }
      }
    },
    disconnect() {
      for (const source of sources) {
        try {
          source.stop();
        } catch {
          /* already stopped */
        }
      }
      for (const node of nodes) node.disconnect();
    },
  };
}
type Voice = ReturnType<typeof createObjectVoice>;

/** One lazy context, one active target, at most one retiring voice in normal use.
 * Audio runs on the browser audio thread, not in the scene render loop. */
class ObjectAudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private analyserNode: AnalyserNode | null = null;
  private voice: Voice | null = null;
  private retired: { voice: Voice; end: number }[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private enabled = false;
  private generation = 0;
  private profile: SoundProfile | null = null;
  private interaction = { proximity: 0.3, pan: 0, travel: 0 };
  get analyser() {
    return this.analyserNode;
  }
  get diagnostics() {
    return {
      state: this.ctx?.state ?? "uninitialized",
      voices: (this.voice ? 1 : 0) + this.retired.length,
      enabled: this.enabled,
    };
  }
  setProfile(p: SoundProfile) {
    if (p.id === this.profile?.id) return;
    this.profile = p;
    useObjectAudio.setState({ profile: p });
    if (this.enabled && this.ctx?.state === "running" && !this.retired.length) this.swap();
  }
  async start() {
    const generation = ++this.generation;
    this.enabled = true;
    useObjectAudio.setState({ status: "starting" });
    try {
      if (!this.ctx || this.ctx.state === "closed") {
        const Constructor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Constructor) throw new Error("Web Audio unavailable");
        const ctx = new Constructor({ latencyHint: "playback" });
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = 0;
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 25;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.knee.value = 16;
        compressor.ratio.value = 5;
        compressor.attack.value = 0.012;
        compressor.release.value = 0.3;
        this.analyserNode = ctx.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.analyserNode.smoothingTimeConstant = 0.85;
        this.master
          .connect(highpass)
          .connect(compressor)
          .connect(this.analyserNode)
          .connect(ctx.destination);
        this.noise = makeSoundNoise(ctx);
      }
      let resumeTimeout: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([
          this.ctx.resume(),
          new Promise<void>((_, reject) => {
            resumeTimeout = setTimeout(() => reject(new Error("Tap play to resume audio")), 1800);
          }),
        ]);
      } finally {
        clearTimeout(resumeTimeout);
      }
      if (!this.enabled || generation !== this.generation) return false;
      if (this.ctx.state !== "running") throw new Error("Playback needs a gesture");
      if (!this.voice) this.swap();
      this.timer ??= setInterval(() => this.tick(), 80);
      useObjectAudio.setState({ status: document.hidden ? "paused" : "playing" });
      this.tick();
      return true;
    } catch {
      if (generation === this.generation) {
        this.enabled = false;
        useObjectAudio.setState({ status: "blocked" });
      }
      return false;
    }
  }
  private swap() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise || !this.profile) return;
    // A pending selection waits for the previous fade: two graphs maximum.
    for (const r of this.retired) {
      r.voice.disconnect();
    }
    this.retired = [];
    if (this.voice) {
      const v = this.voice,
        t = ctx.currentTime;
      v.envelope.gain.cancelAndHoldAtTime(t);
      v.envelope.gain.linearRampToValueAtTime(0, t + 0.8);
      v.release(t + 0.85);
      this.retired.push({ voice: v, end: t + 0.9 });
    }
    this.voice = createObjectVoice(ctx, this.profile, this.noise, this.master);
    this.voice.envelope.gain.setValueAtTime(0, ctx.currentTime);
    this.voice.envelope.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
  }
  update(proximity: number, pan: number, travel: number) {
    this.interaction = {
      proximity: clamp(proximity, 0, 1),
      pan: clamp(pan, -1, 1),
      travel: clamp(travel, 0, 1),
    };
  }
  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const prefs = useObjectAudio.getState(),
      t = ctx.currentTime;
    target(
      this.master.gain,
      this.enabled && !document.hidden ? clamp(prefs.volume, 0, 1) * 0.42 : 0,
      t,
      0.18,
    );
    const { proximity, pan, travel } = this.interaction;
    this.voice?.update(t, proximity, prefs.spatial ? pan : 0, travel, prefs.mode);
    this.retired = this.retired.filter((r) => {
      if (t >= r.end) {
        r.voice.disconnect();
        return false;
      }
      return true;
    });
    if (
      this.enabled &&
      !this.retired.length &&
      this.profile &&
      this.voice?.profile.id !== this.profile.id
    )
      this.swap();
  }
  async visibility() {
    const ctx = this.ctx;
    if (!ctx || !this.enabled) return;
    if (document.hidden) {
      // Silence immediately before suspension, avoiding a suspended fade resuming loud.
      this.master!.gain.cancelScheduledValues(ctx.currentTime);
      this.master!.gain.value = 0;
      await ctx.suspend().catch(() => {});
      if (this.enabled && document.hidden && ctx === this.ctx)
        useObjectAudio.setState({ status: "paused" });
    } else {
      await this.start();
    }
  }
  stop() {
    this.enabled = false;
    this.generation++;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.cancelAndHoldAtTime(ctx.currentTime);
      target(this.master.gain, 0, ctx.currentTime, 0.055);
    }
    for (const r of this.retired) r.voice.release((ctx?.currentTime ?? 0) + 0.3);
    this.voice?.release((ctx?.currentTime ?? 0) + 0.3);
    const old = this.voice;
    this.voice = null;
    const retiring = this.retired;
    this.retired = [];
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const gen = this.generation;
    setTimeout(() => {
      old?.disconnect();
      retiring.forEach((r) => r.voice.disconnect());
      if (gen === this.generation && !this.enabled && ctx?.state !== "closed")
        void ctx?.suspend().catch(() => {});
    }, 350);
    if (useObjectAudio.getState().status !== "blocked") useObjectAudio.setState({ status: "off" });
  }
  dispose() {
    this.stop();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.noise = null;
    this.analyserNode = null;
    this.profile = null;
    if (ctx?.state !== "closed") void ctx?.close().catch(() => {});
  }
}
export const objectAudio = new ObjectAudioEngine();
