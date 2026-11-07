import type { ObservationalGalaxy } from "./galaxy-catalog";
import { LIGHT_YEARS_PER_PARSEC } from "@/lib/astronomy/constants";
type NearbyGalaxyRow = Pick<ObservationalGalaxy, "distance" | "type"> &
  Partial<
    Pick<ObservationalGalaxy, "id" | "name" | "hostGroup" | "measurements" | "catalogueEvidence">
  >;
export function formatGalaxyRedshift(g: Pick<ObservationalGalaxy, "redshift">, digits = 5) {
  return g.redshift === undefined
    ? "Not supplied"
    : `${g.redshift.toFixed(digits)}${g.redshift < 0 ? " (blueshift)" : ""}`;
}
export function galaxyDistanceLabel(
  g: Pick<ObservationalGalaxy, "distance" | "catalogueEvidence">,
) {
  const evidence = g.catalogueEvidence;
  const mpc = g.distance / (1e6 * LIGHT_YEARS_PER_PARSEC);
  const error = evidence?.distanceErrorMpc;
  const uncertainty = error ? Math.max(error.minus, error.plus) : 0;
  const digits =
    uncertainty > 0
      ? Math.max(0, Math.min(6, 1 - Math.floor(Math.log10(uncertainty))))
      : mpc < 0.1
        ? 3
        : 2;
  return `${mpc.toFixed(digits)} Mpc${error ? ` (−${error.minus.toPrecision(2)}/+${error.plus.toPrecision(2)})` : evidence ? " (uncertainty not supplied)" : ""}`;
}
export function filterNearbyGalaxies<T extends NearbyGalaxyRow>(
  rows: readonly T[],
  options: { range?: string; type?: string; group?: string; featured?: boolean } = {},
) {
  const ranges: Record<string, [number, number]> = {
    "0-11": [0, 11],
    "11-30": [11, 30],
    "30-100": [30, 100],
  };
  const range = options.range ? ranges[options.range] : undefined;
  return rows
    .filter((g) => {
      const d = g.distance / (1e6 * LIGHT_YEARS_PER_PARSEC);
      if (range && (d < range[0] || d >= range[1])) return false;
      if (
        options.group &&
        options.group !== "all" &&
        (g.hostGroup ?? "unassigned") !== options.group
      )
        return false;
      if (options.featured && !(!g.measurements && !g.catalogueEvidence)) return false;
      if (options.type && options.type !== "all") {
        const t = g.type.toLowerCase();
        if (options.type === "dwarf" && !/dwarf|spheroidal/.test(t)) return false;
        if (options.type !== "dwarf" && !t.includes(options.type)) return false;
      }
      return true;
    })
    .slice()
    .sort(
      (a, b) =>
        a.distance - b.distance || (a.id ?? a.name ?? "").localeCompare(b.id ?? b.name ?? ""),
    );
}
