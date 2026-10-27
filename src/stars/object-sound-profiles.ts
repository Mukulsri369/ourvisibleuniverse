import type { ObservedObject } from "./observed-objects";

export type SoundFamily =
  | "open"
  | "star"
  | "rock"
  | "atmosphere"
  | "plasma"
  | "nebula"
  | "galaxy"
  | "pulsar"
  | "remnant"
  | "black-hole"
  | "quasar"
  | "chirp";
export type SoundProfile = {
  id: string;
  name: string;
  family: SoundFamily;
  seed: number;
  fundamental: number;
  air: number;
  cutoff: number;
  drift: number;
  pulseHz?: number;
  measuredPeriod?: number;
  pulseDivisor?: number;
  explanation: string;
  source: string;
  sourceTitle: string;
};
const sources = {
  telescope: ["https://chandra.si.edu/sound/", "Chandra: translating observations into sound"],
  sun: ["https://www.nasa.gov/solar-system/sounds-of-the-sun/", "NASA: solar oscillations"],
  plasma: [
    "https://www.nasa.gov/solar-system/nasas-juno-spacecraft-hears-jupiters-moon/",
    "NASA: Juno radio and plasma waves",
  ],
  atmosphere: [
    "https://science.nasa.gov/mission/mars-2020-perseverance/sounds-of-mars/",
    "NASA: microphones on Mars",
  ],
  pulsar: ["https://xrtpub.harvard.edu/sound/vela.html", "Chandra: Vela pulse timing"],
  chirp: ["https://gwosc.org/audio/", "LIGO: gravitational-wave audio"],
} as const;
export function soundSeed(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function soundProfile(
  id: string,
  name: string,
  family: SoundFamily,
  detail = "",
): SoundProfile {
  const seed = soundSeed(id),
    n = (seed % 997) / 997;
  // Composition parameters, never presented as measured pitches.
  const settings: Record<SoundFamily, [number, number, number, number]> = {
    open: [49, 0.025, 550, 0.035],
    star: [98, 0.11, 1600, 0.09],
    rock: [65, 0.025, 650, 0.04],
    atmosphere: [73, 0.25, 1400, 0.14],
    plasma: [110, 0.18, 3200, 0.28],
    nebula: [130, 0.12, 2000, 0.055],
    galaxy: [82, 0.08, 2300, 0.025],
    pulsar: [146, 0.04, 2900, 0.04],
    remnant: [92, 0.14, 1800, 0.12],
    "black-hole": [43, 0.18, 900, 0.19],
    quasar: [58, 0.28, 2800, 0.31],
    chirp: [55, 0.015, 2600, 0.03],
  };
  const [base, air, cutoff, drift] = settings[family];
  const explanations: Record<SoundFamily, string> = {
    open: "A quiet, original listening bed for open space. The vacuum itself is silent.",
    star: "Resonant, slowly beating tones inspired by stellar oscillations. Pitches are composed, not measurements of this star.",
    rock: "Sparse mineral-like tones for an airless world. There is no airborne sound here; these tones are a designed interpretation.",
    atmosphere:
      "Layered wind inspired by atmospheric acoustics. This is an illustration, not a surface microphone recording.",
    plasma:
      "Sweeping whistles inspired by spacecraft radio and plasma-wave conversions. This is original synthesis, not a spacecraft recording.",
    nebula:
      "Gas-like textures and scattered stellar tones. Neither the timbre nor the pitches are a recording or a mapping of telescope pixels.",
    galaxy:
      "Overlapping stellar tones and soft dust textures. This is a composed galaxy soundscape, not measured galaxy audio.",
    pulsar:
      "A pulsed carrier using the catalogue rotation period where available. The carrier tone and surrounding atmosphere are designed.",
    remnant:
      "Evolving resonances inspired by remnant observations. This is a designed interpretation, not measured pressure waves.",
    "black-hole":
      "Low resonances and turbulent accretion textures. Dormant objects remain restrained. This is designed audio, not sound from an event horizon.",
    quasar:
      "Sweeping plasma over a deep accretion bed. A cinematic interpretation of an active nucleus, not a recording.",
    chirp:
      "A repeating model-inspired rising chirp. This illustrates inspiral qualitatively; it is not a LIGO strain recording or a reconstruction of this event.",
  };
  const key =
    family === "star"
      ? "sun"
      : family === "plasma"
        ? "plasma"
        : family === "atmosphere"
          ? "atmosphere"
          : family === "pulsar"
            ? "pulsar"
            : family === "chirp"
              ? "chirp"
              : "telescope";
  const [source, sourceTitle] = sources[key];
  return {
    id,
    name,
    family,
    seed,
    fundamental: base * 2 ** ((Math.floor(n * 7) - 3) / 12),
    air,
    cutoff: cutoff * (0.85 + n * 0.3),
    drift,
    explanation: explanations[family] + (detail ? " " + detail : ""),
    source,
    sourceTitle,
  };
}
export function observedSoundProfile(item: ObservedObject): SoundProfile {
  const c = item.compactPhysics;
  const family: SoundFamily =
    item.category === "Quasar"
      ? "quasar"
      : item.category === "Gravitational wave"
        ? "chirp"
        : item.category === "Black hole"
          ? "black-hole"
          : c?.pulsarSpinPeriodSec
            ? "pulsar"
            : item.nebulaClass || item.category === "Nebula"
              ? "nebula"
              : item.category === "Neutron star" || item.category === "Stellar remnant"
                ? "remnant"
                : "star";
  const p = soundProfile(item.id, item.name, family);
  if (c?.pulsarSpinPeriodSec && c.pulsarSpinPeriodSec > 0) {
    p.measuredPeriod = c.pulsarSpinPeriodSec;
    const hz = 1 / p.measuredPeriod;
    p.pulseDivisor = 2 ** Math.max(0, Math.ceil(Math.log2(hz / 32)));
    p.pulseHz = hz / p.pulseDivisor;
    p.explanation +=
      " Catalogue period: " +
      p.measuredPeriod +
      " s. Audible pulse: " +
      p.pulseHz.toFixed(3) +
      " Hz" +
      (p.pulseDivisor > 1 ? " (rate divided by " + p.pulseDivisor + ")" : " (original cadence)") +
      ". Spin timing is not a reconstruction of its radio waveform.";
  }
  if (family === "black-hole" && (!c?.hasAccretionDisk || c.accretionState === "quiescent")) {
    p.air *= 0.24;
    p.cutoff *= 0.65;
  }
  if (item.nebulaClass === "dark") {
    p.air *= 0.45;
    p.cutoff *= 0.5;
  }
  if (item.nebulaClass === "supernova_remnant") {
    p.drift *= 2;
    p.cutoff *= 1.3;
  }
  return p;
}
export function worldSoundProfile(name: string, kind = "") {
  const body = name.split(/[:·]/).at(-1)!.trim();
  const family: SoundFamily =
    /Jupiter|Saturn|Uranus|Neptune|Ganymede|Europa|Io|Enceladus|giant|Neptune/i.test(
      body + " " + kind,
    )
      ? "plasma"
      : /Earth|Venus|Mars|Titan|Ocean|Lava/i.test(body + " " + kind)
        ? "atmosphere"
        : "rock";
  return soundProfile(
    "world:" + name,
    name,
    family,
    kind ? "World class: " + kind + ". No measured exoplanet audio is implied." : "",
  );
}
