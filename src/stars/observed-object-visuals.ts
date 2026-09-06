export type ObservedMorphology =
  | "filament-remnant"
  | "orion-cloud"
  | "pillars"
  | "helix-ring"
  | "barrel-ring"
  | "veil-arcs"
  | "cosmic-cliffs"
  | "hourglass"
  | "nested-shells"
  | "butterfly"
  | "quasar-jet"
  | "blazar"
  | "disturbed-quasar"
  | "unresolved-quasar"
  | "pulsar-torus"
  | "radio-pulsar"
  | "magnetar"
  | "neutron-binary"
  | "eht-ring"
  | "eht-jet"
  | "xray-binary"
  | "merger"
  | "white-dwarf"
  | "triple-ring"
  | "red-supergiant"
  | "homunculus"
  | "dusty-supergiant"
  | "pinwheel";

export type ObservedVisualProfile = {
  morphology: ObservedMorphology;
  seed: number;
  tilt: [number, number, number];
  stretch?: [number, number, number];
  particleCount?: number;
  filamentCount?: number;
  spin?: number;
  pulsePeriod?: number;
  beamTilt?: number;
  jetLength?: number;
};

const p = (profile: ObservedVisualProfile) => profile;

// Morphologies follow the canonical NASA/ESA/ESO observatory views referenced
// by each catalog record. They are visual interpretations of multiwavelength
// data, not claims that false-color structures are visible to the naked eye.
export const OBSERVED_VISUAL_PROFILES: Record<string, ObservedVisualProfile> = {
  m1: p({
    morphology: "filament-remnant",
    seed: 1054,
    tilt: [0.12, 0.35, -0.2],
    stretch: [1, 0.72, 0.82],
    particleCount: 4200,
    filamentCount: 34,
  }),
  m42: p({
    morphology: "orion-cloud",
    seed: 1976,
    tilt: [-0.3, 0.2, 0.15],
    stretch: [1.25, 0.7, 0.9],
    particleCount: 5200,
  }),
  m16: p({
    morphology: "pillars",
    seed: 6611,
    tilt: [0.08, -0.3, -0.12],
    stretch: [0.9, 1.2, 0.75],
    particleCount: 4300,
  }),
  helix: p({
    morphology: "helix-ring",
    seed: 7293,
    tilt: [0.72, 0.1, 0.3],
    stretch: [1, 0.78, 1],
    particleCount: 4600,
    filamentCount: 72,
  }),
  m57: p({
    morphology: "barrel-ring",
    seed: 6720,
    tilt: [0.38, 0.16, -0.12],
    stretch: [0.9, 1.08, 0.9],
    particleCount: 4200,
  }),
  veil: p({
    morphology: "veil-arcs",
    seed: 6960,
    tilt: [0.28, -0.25, 0.55],
    stretch: [1, 0.9, 0.75],
    particleCount: 5000,
    filamentCount: 42,
  }),
  carina: p({
    morphology: "cosmic-cliffs",
    seed: 3372,
    tilt: [-0.15, 0.4, -0.08],
    stretch: [1.35, 0.75, 0.8],
    particleCount: 5600,
  }),
  boomerang: p({
    morphology: "hourglass",
    seed: 3034,
    tilt: [0.18, 0.4, -0.3],
    stretch: [0.72, 1.4, 0.72],
    particleCount: 4000,
  }),
  "cats-eye": p({
    morphology: "nested-shells",
    seed: 6543,
    tilt: [0.45, 0.15, 0.12],
    stretch: [1, 0.86, 0.92],
    particleCount: 4500,
  }),
  butterfly: p({
    morphology: "butterfly",
    seed: 6302,
    tilt: [0.12, -0.2, 0.45],
    stretch: [1.2, 0.8, 0.65],
    particleCount: 4600,
  }),
  "3c273": p({
    morphology: "quasar-jet",
    seed: 3273,
    tilt: [0.2, -0.4, 0.18],
    spin: 0.28,
    jetLength: 1.8,
  }),
  "3c279": p({
    morphology: "blazar",
    seed: 3279,
    tilt: [0.04, 0.04, 0],
    spin: 0.42,
    jetLength: 1.4,
  }),
  mrk231: p({
    morphology: "disturbed-quasar",
    seed: 231,
    tilt: [0.52, -0.15, 0.22],
    spin: 0.2,
    jetLength: 0.75,
    particleCount: 2600,
  }),
  ton618: p({ morphology: "unresolved-quasar", seed: 618, tilt: [0.35, 0.1, 0.1], spin: 0.18 }),
  "crab-pulsar": p({
    morphology: "pulsar-torus",
    seed: 5331,
    tilt: [0.45, 0.2, 0.28],
    spin: 4.8,
    pulsePeriod: 0.033,
    beamTilt: 0.45,
  }),
  vela: p({
    morphology: "pulsar-torus",
    seed: 8334,
    tilt: [0.25, -0.25, 0.4],
    spin: 3.2,
    pulsePeriod: 0.089,
    beamTilt: 0.38,
  }),
  b1919: p({
    morphology: "radio-pulsar",
    seed: 1919,
    tilt: [0.18, 0.1, -0.2],
    spin: 0.85,
    pulsePeriod: 1.337,
    beamTilt: 0.52,
  }),
  sgr1806: p({
    morphology: "magnetar",
    seed: 1806,
    tilt: [0.25, 0.3, 0.15],
    spin: 1.25,
    pulsePeriod: 7.56,
    beamTilt: 0.7,
  }),
  j0348: p({
    morphology: "neutron-binary",
    seed: 348,
    tilt: [0.5, 0.1, 0.3],
    spin: 1.5,
    pulsePeriod: 0.039,
    beamTilt: 0.4,
  }),
  "sgr-a": p({ morphology: "eht-ring", seed: 415, tilt: [0.92, 0.12, 0.18], spin: 0.42 }),
  m87star: p({
    morphology: "eht-jet",
    seed: 875,
    tilt: [0.95, -0.18, 0.2],
    spin: 0.16,
    jetLength: 2.4,
  }),
  cygx1: p({
    morphology: "xray-binary",
    seed: 21,
    tilt: [0.62, 0.25, -0.18],
    spin: 0.75,
    jetLength: 0.8,
  }),
  gw150914: p({ morphology: "merger", seed: 150914, tilt: [0.35, 0.25, 0.2], spin: 0.7 }),
  siriusb: p({ morphology: "white-dwarf", seed: 642166, tilt: [0, 0, 0], spin: 0.03 }),
  sn1987a: p({
    morphology: "triple-ring",
    seed: 1987,
    tilt: [0.85, 0.05, 0.15],
    stretch: [1, 0.8, 1],
    particleCount: 3600,
  }),
  betelgeuse: p({ morphology: "red-supergiant", seed: 1998, tilt: [0.15, 0.1, 0], spin: 0.025 }),
  "eta-car": p({
    morphology: "homunculus",
    seed: 1843,
    tilt: [0.12, 0.28, -0.35],
    stretch: [0.78, 1.3, 0.72],
    particleCount: 4400,
  }),
  uyscuti: p({
    morphology: "dusty-supergiant",
    seed: 5055,
    tilt: [0.1, 0.05, 0.1],
    spin: 0.018,
    particleCount: 1800,
  }),
  wr104: p({
    morphology: "pinwheel",
    seed: 104,
    tilt: [0.65, 0.2, -0.15],
    spin: 0.22,
    particleCount: 2600,
  }),
};
