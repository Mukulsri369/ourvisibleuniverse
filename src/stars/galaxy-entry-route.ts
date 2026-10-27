import type { GalaxyModel } from "./galaxy-models";
import { galaxyStructure } from "./galaxy-structure";
type Point = [number, number, number];
/** End in the populated outer disk/ring, never in a ring galaxy's empty central gap. */
export function galaxyEntryRoute(model: GalaxyModel): { points: Point[]; focus: Point } {
  const s = galaxyStructure(model);
  let a = 0.36;
  for (const c of model.name) a += c.charCodeAt(0) * 0.003;
  const sign = Math.sin(a) > 0 ? 1 : -1;
  const radius =
    model.morphology === "ring" ? s.ringRadius : s.spheroid ? 0.54 : s.irregular ? 0.43 : 0.56;
  const height = s.spheroid ? 0.12 : s.irregular ? 0.045 : s.feature === 1 ? 0.1 : 0.018;
  const end: Point = [Math.cos(a) * radius, height, Math.sin(a) * radius];
  return {
    points: [
      [1.4, 0.7, 1.6 * sign],
      [Math.cos(a - 0.35) * 1.05, 0.2, Math.sin(a - 0.35) * 1.05],
      [
        Math.cos(a - 0.1) * Math.max(0.72, radius + 0.08),
        height + 0.04,
        Math.sin(a - 0.1) * Math.max(0.72, radius + 0.08),
      ],
      end,
    ],
    focus: [-end[0] * 0.65, height * 0.5, -end[2] * 0.65],
  };
}
