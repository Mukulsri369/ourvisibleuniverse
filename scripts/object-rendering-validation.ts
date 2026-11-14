import assert from "node:assert/strict";
import fs from "node:fs";
import { NAMED_STARS } from "../src/stars/data";
import { exoSystemFor } from "../src/stars/exosystems";
import { exoAppearance, planck600 } from "../src/stars/exoplanet-appearance";
import { OBSERVED_OBJECTS, objectVisitDistance } from "../src/stars/observed-objects";
const samples = new Map();
let count = 0;
for (const star of NAMED_STARS) {
  if (star.name === "Sun") continue;
  for (const p of exoSystemFor(star).planets) {
    count++;
    assert(p.radiusEarth > 0 && p.aAU > 0 && p.periodYears > 0);
    if (!samples.has(p.kind)) samples.set(p.kind, p);
  }
}
const real = new Map<string, ReturnType<typeof exoAppearance>>();
for (const star of NAMED_STARS) {
  if (star.name === "Sun") continue;
  for (const p of exoSystemFor(star).planets) {
    const look = exoAppearance(p, star, 17);
    assert(look.light.r > 0 && Number.isFinite(look.emissionScale) && look.tSub > 0, p.name);
    if (p.observed) {
      real.set(p.name, look);
      assert(!look.rings, `${p.name}: no rings are known around real planets`);
    }
  }
}
const get = (name: string) => {
  const look = real.get(name);
  assert(look, name);
  return look;
};
// Measured hot-Jupiter albedos are low; HD 209458 b must not render as a bright cream giant.
assert(
  get("HD 209458 b").label.startsWith("Sudarsky IV") ||
    get("HD 209458 b").label.startsWith("Sudarsky V"),
);
assert(get("HD 209458 b").zone.r < 0.1);
// Directly imaged HR 8799 planets glow from their own heat, so their clouds are hot-class.
assert.equal(get("HR 8799 c").tInt, 1100);
assert(get("HR 8799 c").label.startsWith("Sudarsky IV"));
// An M-dwarf host lights its planets red; a Sun-like host does not.
assert(get("Proxima Centauri b").light.r > 1.5 * get("Proxima Centauri b").light.b);
assert(get("Kepler-452 b").light.b > 0.6);
// Lava worlds: the substellar surface is hot enough to glow visibly.
const janssen = get("55 Cancri e (Janssen)");
assert.equal(janssen.mode, 2);
assert(janssen.tSub > 2000 && planck600(janssen.tSub) * janssen.emissionScale > 0.01);
// Solar System moons must publish their position after their planet (-1) and before
// CameraRig (0); a moon updated later is followed a frame late and shakes close up.
const planets = fs.readFileSync("src/stars/Planets.tsx", "utf8");
const moonBody = planets.slice(
  planets.indexOf("function Moon("),
  planets.indexOf("export function Planets("),
);
const moonPriority = Number(/\}, (-?[\d.]+)\);\s+return \(/.exec(moonBody)?.[1]);
assert(moonPriority > -1 && moonPriority < 0, `Moon useFrame priority ${moonPriority}`);
for (const obj of OBSERVED_OBJECTS)
  assert(Number.isFinite(objectVisitDistance(obj)) && objectVisitDistance(obj) > 0);
console.log(
  `Validated ${count} planets across ${samples.size} kinds (${real.size} real appearances) and ${OBSERVED_OBJECTS.length} object framing distances.`,
);
