export type NebulaAnchor = { name: string; position: [number, number, number]; power: number };
export type NebulaStellarProfile = {
  cluster?: { center: [number, number, number]; spread: [number, number, number]; count: number };
  anchors: NebulaAnchor[];
  field: number;
};
// Cluster membership and illuminating sources are observed; these local offsets
// and unresolved members reconstruct depth, not a new astrometric catalogue.
const anchor = (name: string, position: [number, number, number], power = 2): NebulaAnchor => ({
  name,
  position,
  power,
});
export const NEBULA_STELLAR_PROFILES: Record<string, NebulaStellarProfile> = {
  m42: {
    cluster: { center: [0, 0.1, 0.25], spread: [0.35, 0.3, 0.3], count: 900 },
    anchors: [
      anchor("Theta1 Ori A", [-0.07, 0.13, 0.28]),
      anchor("Theta1 Ori B", [0.07, 0.15, 0.26], 1.5),
      anchor("Theta1 Ori C", [0.03, 0.04, 0.31], 3),
      anchor("Theta1 Ori D", [-0.07, 0.02, 0.23], 1.8),
    ],
    field: 500,
  },
  m16: {
    cluster: { center: [0.05, 0.77, 0.32], spread: [0.5, 0.19, 0.4], count: 700 },
    anchors: [],
    field: 500,
  },
  carina: {
    cluster: { center: [0.28, 0.48, 0.34], spread: [0.55, 0.28, 0.48], count: 950 },
    anchors: [],
    field: 550,
  },
  pleiades_nebula: {
    cluster: { center: [0, 0, 0.1], spread: [0.52, 0.42, 0.45], count: 500 },
    anchors: [
      anchor("Alcyone", [0.15, -0.12, 0.28], 3),
      anchor("Atlas", [0.53, -0.08, 0.02]),
      anchor("Electra", [-0.36, -0.19, 0.31]),
      anchor("Maia", [-0.1, 0.26, 0.12]),
      anchor("Merope", [-0.13, -0.31, 0.22]),
      anchor("Taygeta", [-0.19, 0.42, -0.04]),
      anchor("Pleione", [0.56, 0.02, 0.1], 1.2),
    ],
    field: 500,
  },
  witch_head: { anchors: [], field: 650 },
  horsehead: { anchors: [], field: 650 },
  barnard68: { anchors: [], field: 900 },
  m57: { anchors: [anchor("M57 central white dwarf", [0, 0, 0], 1.5)], field: 480 },
  helix: { anchors: [anchor("WD 2226-210", [0, 0, 0], 1.5)], field: 650 },
  cats_eye: { anchors: [anchor("NGC 6543 central star", [0, 0, 0], 2)], field: 430 },
  butterfly: { anchors: [anchor("NGC 6302 obscured central star", [0, 0, 0], 1)], field: 500 },
  m1: { anchors: [anchor("Crab pulsar", [0.02, 0.01, 0.04], 0.5)], field: 480 },
  veil: { anchors: [], field: 900 },
  cas_a: { anchors: [], field: 650 },
  rosette: {
    cluster: { center: [0, 0, 0.05], spread: [0.27, 0.29, 0.3], count: 600 },
    anchors: [],
    field: 650,
  },
  tarantula: {
    cluster: { center: [0.17, 0.1, 0.2], spread: [0.15, 0.17, 0.22], count: 1100 },
    anchors: [anchor("R136 cluster core", [0.17, 0.1, 0.2], 3)],
    field: 650,
  },
  m8: {
    cluster: { center: [0.4, 0.04, 0.24], spread: [0.3, 0.35, 0.35], count: 700 },
    anchors: [anchor("Herschel 36", [0.27, 0.16, 0.33], 2.5)],
    field: 500,
  },
  m20: {
    cluster: { center: [0, -0.17, 0.2], spread: [0.17, 0.18, 0.22], count: 220 },
    anchors: [anchor("HD 164492", [0, -0.17, 0.23], 2.8)],
    field: 550,
  },
  sn1987a: { anchors: [], field: 700 },
  "eta-car": { anchors: [], field: 450 },
  wr104: { anchors: [], field: 400 },
};
