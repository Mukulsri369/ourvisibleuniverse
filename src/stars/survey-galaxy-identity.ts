import { NEARBY_GALAXIES } from "./galaxy-catalog";
const radians = Math.PI / 180;
const references = NEARBY_GALAXIES.map((g) => {
  const l = g.l * radians,
    b = g.b * radians;
  return {
    name: g.name,
    x: Math.cos(b) * Math.cos(l),
    y: Math.cos(b) * Math.sin(l),
    z: Math.sin(b),
    velocity: g.radialVelocityKmS ?? g.redshift * 299792.458,
  };
});
/** Conservative positional/velocity coincidence: prefer the named, independently measured node.
 * Raw survey records remain intact; ambiguous neighbours outside these gates are retained. */
export function namedSurveyCounterpart(lDeg: number, bDeg: number, cz: number): string | null {
  const l = lDeg * radians,
    b = bDeg * radians,
    cosB = Math.cos(b),
    x = cosB * Math.cos(l),
    y = cosB * Math.sin(l),
    z = Math.sin(b);
  for (const g of references) {
    if (Math.abs(cz - g.velocity) > 60) continue;
    if (x * g.x + y * g.y + z * g.z > Math.cos(0.035 * radians)) return g.name;
  }
  return null;
}
