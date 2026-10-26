import { GALAXY_BY_NAME, type GalaxyModel } from "./galaxy-models";
import { MILKY_WAY_APPEARANCE, ANDROMEDA_APPEARANCE } from "./GalaxyRadiance";
import type { VisitGalaxy } from "./store";
export function galaxyAppearance(g: VisitGalaxy): GalaxyModel {
  if (g.name === "Milky Way") return MILKY_WAY_APPEARANCE;
  if (g.name === "Andromeda (M31)") return ANDROMEDA_APPEARANCE;
  const known = GALAXY_BY_NAME.get(g.name);
  if (known) return known;
  let seed = 0;
  for (const c of g.name) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const distance = Math.max(1, Math.hypot(g.x, g.y, g.z)),
    radius = Math.max(1000, g.size * 0.5);
  const type = g.type.toLowerCase(),
    old = /elliptical|lenticular/.test(type);
  const morphology: GalaxyModel["morphology"] = /elliptical/.test(type)
    ? "elliptical"
    : /lenticular/.test(type)
      ? "lenticular"
      : /ring/.test(type)
        ? "ring"
        : /interact|merg/.test(type)
          ? "interacting"
          : /barred/.test(type)
            ? "barred"
            : /spiral/.test(type)
              ? "spiral"
              : "irregular";
  return {
    key: "selected-" + seed,
    name: g.name,
    type: g.type,
    morphology,
    l: ((Math.atan2(g.z, -g.x) * 180) / Math.PI + 360) % 360,
    b: (Math.asin(g.y / distance) * 180) / Math.PI,
    distance,
    inclination: /edge/.test(type) ? 84 : 42,
    posAngle: seed % 180,
    diskRadius: radius,
    bulgeRadius: radius * (old ? 0.45 : 0.12),
    haloRadius: radius * 1.3,
    arms: 2 + (seed % 3),
    pitchDeg: 14 + (seed % 9),
    barLength: morphology === "barred" ? radius * 0.4 : 0,
    density: 0.2,
    youngColor: [0.57, 0.76, 1],
    oldColor: old ? [1, 0.85, 0.65] : [1, 0.8, 0.56],
    coreColor: "rgba(255,225,185,1)",
    rotPeriod: 800,
    dustLanes: !old,
    description:
      "Morphology-based reconstruction of an unresolved catalogue galaxy; individual stellar positions are illustrative.",
  };
}
