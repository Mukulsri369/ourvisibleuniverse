import assert from "node:assert/strict";
import { GALAXY_POPULATIONS } from "../src/stars/galaxy-populations";
import { GALAXY_BY_NAME } from "../src/stars/galaxy-models";
import { makeGalaxyStarData } from "../src/stars/galaxy-star-data";
const signatures = new Set<string>();
for (const [name, pop] of Object.entries(GALAXY_POPULATIONS)) {
  const model = GALAXY_BY_NAME.get(name);
  assert(model, name + " model exists");
  signatures.add(
    JSON.stringify([pop.axes, pop.core, pop.continuum, pop.hotFraction, pop.dust, pop.knots]),
  );
  const small = makeGalaxyStarData(model, 4096),
    large = makeGalaxyStarData(model, 12000);
  for (const attribute of Object.values(large))
    assert(attribute.every(Number.isFinite), name + " finite population");
  assert(
    large.positions.some((v, i) => i % 3 === 1 && Math.abs(v) > 0.01),
    name + " has depth",
  );
  for (let i = 0; i < small.positions.length; i += 97)
    assert.equal(
      small.positions[i],
      large.positions[i],
      name + " star positions do not jump on entry",
    );
}
assert.equal(
  signatures.size,
  Object.keys(GALAXY_POPULATIONS).length,
  "Each affected galaxy has a distinct structural profile",
);
const extent = (name: string) => {
  const p = makeGalaxyStarData(GALAXY_BY_NAME.get(name)!, 12000).positions;
  let sum = 0;
  for (let i = 0; i < p.length; i++) sum += p[i] * p[i];
  return sum / (p.length / 3);
};
assert(extent("Sextans Dwarf") > extent("M32") * 3, "Sextans is extended while M32 is compact");
assert(
  GALAXY_POPULATIONS["IC 1613"].dust < 0.05 && GALAXY_POPULATIONS["IC 10"].dust > 0.5,
  "Dust-free irregular differs from dusty starburst",
);
assert.equal(GALAXY_POPULATIONS["Fornax Dwarf"].knots.length, 5);
console.log(
  "PASS:",
  signatures.size,
  "distinct 3D galaxy populations, finite data, stable entry prefixes, diffuse/compact contrast, dust and cluster distinctions",
);
