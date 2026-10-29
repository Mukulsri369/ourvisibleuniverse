import { EXTRAGALACTIC_HII_TARGETS } from "./extragalactic-hii";
export type NebulaRoute = {
  title: string;
  points: [number, number, number][];
  focus: [number, number, number];
};
const route = (
  title: string,
  points: [number, number, number][],
  focus: [number, number, number] = [0, 0, 0],
): NebulaRoute => ({ title, points, focus });
// Camera paths follow the reconstructed morphology, not an image plane.
// Depth and unmeasured stars are illustrative; named anchors use the stellar catalogue.
export const NEBULA_ROUTES: Record<string, NebulaRoute> = {
  m42: route(
    "Through Orion’s wind-carved cavity",
    [
      [0.55, 0.15, 2.7],
      [0.25, 0.1, 0.8],
      [-0.12, 0.24, 0.42],
      [-0.22, 0.12, 0.05],
    ],
    [0.05, 0.1, 0.28],
  ),
  m16: route(
    "Between the pillars toward NGC 6611",
    [
      [0.55, 0.2, 2.6],
      [0.18, 0.3, 0.8],
      [0.1, 0.55, 0.4],
      [0.22, 0.6, 0.2],
    ],
    [0.05, 0.77, 0.32],
  ),
  carina: route(
    "Across Carina’s sculpted cloud walls",
    [
      [-0.8, 0.4, 2.5],
      [-0.35, 0.4, 0.65],
      [0.1, 0.68, 0.4],
      [0.35, 0.63, 0.1],
    ],
    [0.28, 0.48, 0.34],
  ),
  pleiades_nebula: route(
    "Starlight through the Pleiades’ reflection dust",
    [
      [1, 0.4, 2.8],
      [0.55, 0.15, 1.2],
      [0.22, 0.15, 0.5],
      [-0.15, -0.04, 0.1],
    ],
    [0.15, -0.12, 0.28],
  ),
  witch_head: route(
    "Along the Witch Head’s illuminated edge",
    [
      [-0.8, -0.7, 2.7],
      [-0.4, -0.3, 0.8],
      [0.1, 0.1, 0.45],
      [0.2, 0.5, 0.35],
    ],
    [0, 0.35, -0.2],
  ),
  horsehead: route(
    "Past the Horsehead’s silhouetted ridge",
    [
      [0.8, 0.6, 2.7],
      [0.55, 0.3, 0.7],
      [0.4, 0.25, 0.25],
      [0.15, 0.5, 0.2],
    ],
    [-0.05, 0.3, 0],
  ),
  barnard68: route(
    "At the edge of an opaque molecular cloud",
    [
      [-0.8, 0.5, 2.7],
      [-0.65, 0.3, 0.9],
      [-0.42, 0.2, 0.45],
      [-0.32, 0.35, 0.3],
    ],
    [-0.75, 0.4, -1.5],
  ),
  m57: route("Through the Ring’s hollow shell", [
    [0.4, 0.3, 2.7],
    [0.25, 0.1, 0.85],
    [0.1, 0, 0.32],
    [0.18, 0.1, 0.1],
  ]),
  helix: route("Into the Helix’s central cavity", [
    [-0.8, 0.3, 2.7],
    [-0.4, 0.2, 0.8],
    [-0.1, 0.05, 0.25],
    [0.2, 0.1, 0.05],
  ]),
  cats_eye: route("Across the Cat’s Eye’s nested shells", [
    [0.3, -0.7, 2.7],
    [0.1, -0.45, 0.8],
    [0.08, -0.15, 0.3],
    [-0.1, 0.08, 0.12],
  ]),
  butterfly: route(
    "Between the Butterfly’s bipolar lobes",
    [
      [0.8, 0.8, 2.7],
      [0.45, 0.65, 0.7],
      [0.25, 0.5, 0.2],
      [0.2, 0.32, 0.1],
    ],
    [0, 0.1, 0],
  ),
  m1: route(
    "Through the Crab’s expanding filaments",
    [
      [-0.8, 0.8, 2.7],
      [-0.35, 0.5, 0.75],
      [-0.14, 0.25, 0.3],
      [0.1, 0.1, 0.15],
    ],
    [0.02, 0.01, 0.04],
  ),
  veil: route(
    "Along the Veil’s folded shock front",
    [
      [-1, -0.3, 2.7],
      [-0.8, -0.2, 0.65],
      [-0.35, 0.1, 0.2],
      [0.45, 0.3, 0.05],
    ],
    [0.75, 0.45, 0.1],
  ),
  cas_a: route(
    "Inside Cassiopeia A’s ejecta shell",
    [
      [0.5, -0.5, 2.7],
      [0.25, -0.35, 0.75],
      [0.1, -0.2, 0.3],
      [-0.1, 0, 0.1],
    ],
    [0.1, 0.05, -0.15],
  ),
  rosette: route(
    "Into the Rosette’s stellar clearing",
    [
      [0.55, 0.3, 2.7],
      [0.35, 0.15, 0.8],
      [0.15, 0.12, 0.3],
      [-0.12, -0.08, 0.08],
    ],
    [0, 0, 0.05],
  ),
  tarantula: route(
    "Toward the heart of R136",
    [
      [-0.7, 0.7, 2.7],
      [-0.25, 0.4, 0.8],
      [0.05, 0.25, 0.35],
      [0.35, 0.22, 0.13],
    ],
    [0.17, 0.1, 0.2],
  ),
  m8: route(
    "Through the Lagoon toward Herschel 36",
    [
      [-0.9, 0.2, 2.7],
      [-0.35, 0.3, 0.8],
      [0.1, 0.2, 0.5],
      [0.48, 0.2, 0.18],
    ],
    [0.27, 0.16, 0.33],
  ),
  m20: route(
    "Between the Trifid’s dark lanes",
    [
      [-0.7, -0.6, 2.7],
      [-0.25, -0.3, 0.8],
      [-0.1, -0.1, 0.45],
      [0.15, -0.05, 0.13],
    ],
    [0, -0.17, 0.23],
  ),
  sn1987a: route("Through the remnant’s inclined rings", [
    [-0.5, 0.4, 2.7],
    [-0.3, 0.2, 0.9],
    [-0.12, 0.1, 0.35],
    [0.15, 0.1, 0.14],
  ]),
  "eta-car": route(
    "Around the Homunculus’s dusty waist",
    [
      [-0.8, 0.9, 2.7],
      [-0.45, 0.7, 0.9],
      [-0.2, 0.65, 0.45],
      [0.35, 0.55, 0.25],
    ],
    [0, 0.4, 0],
  ),
  wr104: route("Following the pinwheel’s winding dust", [
    [0.9, -0.5, 2.7],
    [0.65, -0.15, 0.6],
    [0.3, 0.2, 0.3],
    [0.1, 0.25, 0.15],
  ]),
};

Object.assign(
  NEBULA_ROUTES,
  Object.fromEntries(
    EXTRAGALACTIC_HII_TARGETS.map((t) => [
      t.id,
      {
        title: "Through " + t.name + "’s stellar nursery",
        points: [
          [-0.7, 0.35, 2.7],
          [-0.35, 0.25, 0.8],
          [-0.1, 0.12, 0.4],
          [0.2, 0.1, 0.12],
        ],
        focus: [0, 0.05, 0.1],
      },
    ]),
  ),
);
