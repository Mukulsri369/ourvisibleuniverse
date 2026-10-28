import { NEARBY_GALAXIES } from "./galaxy-catalog";
import { gToXYZ } from "./galaxy-models";
import { OBSERVED_OBJECTS, objectPosition } from "./observed-objects";
import { EXTRA_HOSTS, MILKY_WAY } from "./object-hosts";
import { SGR_A_DISTANCE_LY } from "@/lib/astronomy/galactic-scene";
import type { VisitGalaxy } from "./store";
export type ExplorerGalaxy = VisitGalaxy & { note?: string; source?: string; unresolved?: boolean };
export const HOME_GALAXY: ExplorerGalaxy = {
  name: MILKY_WAY,
  x: -SGR_A_DISTANCE_LY,
  y: 0,
  z: 0,
  size: 100000,
  distance: SGR_A_DISTANCE_LY,
  type: "Barred spiral",
  view: "overview",
};
export const EXPLORER_GALAXIES: ExplorerGalaxy[] = [
  HOME_GALAXY,
  ...NEARBY_GALAXIES.filter((g) => !/galaxy cluster|supercluster|cosmic web/i.test(g.type)).map(
    (g) => {
      const p = gToXYZ(g.l, g.b, g.distance);
      return {
        name: g.name,
        x: p.x,
        y: p.y,
        z: p.z,
        size: g.size,
        distance: g.distance,
        type: g.type,
        view: "overview" as const,
      };
    },
  ),
  ...Object.entries(EXTRA_HOSTS)
    .filter(([, g]) => !NEARBY_GALAXIES.some((n) => n.name === g.name))
    .map(([id, g]) => {
      const o = OBSERVED_OBJECTS.find((o) => o.id === id)!;
      const [x, y, z] = objectPosition(o);
      return {
        name: g.name,
        x,
        y,
        z,
        size: Math.max(100000, Math.min(200000, o.diameterLy * 2)),
        distance: o.distance,
        type: g.type,
        view: "overview" as const,
        note: g.unresolved
          ? "Host structure is unresolved in this catalogue. The envelope is illustrative; use the known quasar destination."
          : "Host association is observed. The overview envelope and framing extent are illustrative.",
        unresolved: g.unresolved,
        source: g.source,
      };
    }),
];
export function explorerGalaxy(name: string) {
  return EXPLORER_GALAXIES.find((g) => g.name === name);
}
