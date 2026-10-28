import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
import { GALAXY_REFERENCES } from "./galaxy-references";
export type GalaxyLandmark = {
  id: string;
  name: string;
  local: [number, number, number];
  distance: number;
  note: string;
  source: string;
};
/** Observed structures are destinations; unseen depth is reconstructed, never a claimed catalogue position. */
export function galaxyLandmarks(model: GalaxyModel): GalaxyLandmark[] {
  const shape = galaxyStructure(model);
  const source =
    (shape.population?.source &&
    ![
      "https://academic.oup.com/mnras/article/532/4/4157/7718108",
      "https://www.eso.org/public/news/eso1603/",
    ].includes(shape.population.source)
      ? shape.population.source
      : undefined) ||
    GALAXY_REFERENCES[model.key]?.source ||
    "https://ned.ipac.caltech.edu/byname?objname=" + encodeURIComponent(model.name);
  const item = (
    id: string,
    name: string,
    local: [number, number, number],
    distance: number,
    note: string,
    url = source,
  ): GalaxyLandmark => ({ id, name, local, distance, note, source: url });
  if (shape.feature === 10)
    return [
      item(
        "outer-ring",
        "Outer star-forming ring",
        [0.76, 0.014, 0.18],
        0.15,
        "Observed collision ring; stellar associations and depth reconstructed.",
      ),
      item(
        "inner-ring",
        "Inner ring",
        [0.21, 0.012, 0],
        0.11,
        "Observed inner ring surrounding the nucleus.",
      ),
      item(
        "spokes",
        "Dusty spokes",
        [0.43, 0.012, 0.18],
        0.13,
        "Observed radial bridges; individual clouds are reconstructed.",
      ),
      item(
        "ulx-ring",
        "Cartwheel X-ray-source region",
        [0.24, 0.016, 0.73],
        0.12,
        "Observed outer-ring ULX population including N10. Regional view, not a resolved donor star.",
        "https://science.nasa.gov/photojournal/a-stellar-ripple/",
      ),
    ];
  if (shape.feature === 11)
    return [
      item(
        "blue-ring",
        "Young stellar ring",
        [0.7, 0.012, 0.17],
        0.14,
        "Observed blue stellar associations; their 3D positions are reconstructed.",
        "https://science.nasa.gov/missions/hubble/a-wheel-within-a-wheel/",
      ),
      item(
        "old-core",
        "Old central spheroid",
        [0.1, 0.09, 0],
        0.3,
        "Observed yellow central stellar population.",
      ),
      item(
        "gap",
        "Detached-ring gap",
        [0.4, 0.025, 0],
        0.22,
        "Low surface-brightness region between core and ring; no invented planets.",
      ),
    ];
  if (shape.feature === 15) {
    const url = "https://academic.oup.com/mnrasl/article/406/1/L90/1041392";
    return [
      item(
        "inner-bar",
        "Inner barred galaxy",
        [0.09, 0.012, 0.025],
        0.14,
        "Observed compact inner barred disk; unseen depth reconstructed.",
        url,
      ),
      item(
        "outer-arms",
        "Extended spiral disk",
        [-0.48, 0.02, 0.51],
        0.2,
        "Observed extremely faint outer structure, exposure enhanced for exploration.",
        url,
      ),
    ];
  }
  if (shape.feature === 12)
    return [
      item(
        "collision-ring",
        "Collision ring",
        [0.62, 0.018, 0],
        0.18,
        "Observed collisional structure; local depth reconstructed.",
      ),
      item(
        "companion",
        "Elongated companion",
        [0.8, 0.06, 0.1],
        0.23,
        "Observed companion represented by the same 3D stellar field.",
      ),
    ];
  if (shape.spheroid)
    return [
      item(
        "inner-stars",
        "Inner stellar population",
        [0.12, 0.08, 0.06],
        0.2,
        "Reconstructed local view of the observed spheroid.",
      ),
      item(
        "outer-stars",
        shape.population?.tail ? "Tidal stellar envelope" : "Outer stellar population",
        [0.55, 0.11, 0.18],
        0.2,
        "Representative stars in the observed extended population; no individual-star identifications.",
      ),
    ];
  if (shape.irregular) {
    const knot = shape.population?.knots[0];
    return [
      item(
        "associations",
        "Stellar associations",
        knot ? [knot[0], knot[1], knot[2]] : [0.19, 0.025, 0.12],
        0.15,
        "Observed irregular stellar population; association positions reconstructed.",
      ),
      item(
        "field-stars",
        "Diffuse stellar field",
        [-0.2, 0.035, 0.1],
        0.18,
        "Representative field stars; unobserved planetary systems are not invented.",
      ),
    ];
  }
  return [
    item(
      "inner-disk",
      model.barLength ? "Inner bar and disk" : "Inner stellar disk",
      [0.17, 0.018, 0.05],
      0.18,
      "Morphology-based local reconstruction of the observed galaxy.",
    ),
    item(
      "outer-disk",
      "Outer stellar disk",
      [0.52, 0.025, 0.25],
      0.2,
      "Reconstructed stellar neighborhood; individual stars and depths are illustrative.",
    ),
  ];
}
