import assert from "node:assert/strict";
import { NAMED_STARS } from "../src/stars/data";
import { exoSystemFor } from "../src/stars/exosystems";
import { makeExoplanetMaps } from "../src/stars/exoplanet-maps";
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
for (const [kind, p] of samples) {
  const mode =
    kind === "Lava world"
      ? 2
      : kind === "Gas giant" || kind === "Hot Jupiter"
        ? 3
        : kind.includes("Neptune") || kind === "Ice giant"
          ? 4
          : kind === "Ocean world" || p.inHZ
            ? 1
            : 0;
  const maps = makeExoplanetMaps(p, 17, mode);
  for (const map of Object.values(maps)) {
    assert.equal(map.image.data.length, 512 * 256 * 4);
    assert(map.image.data.some((n: number) => n > 0));
    map.dispose();
  }
}
for (const obj of OBSERVED_OBJECTS)
  assert(Number.isFinite(objectVisitDistance(obj)) && objectVisitDistance(obj) > 0);
console.log(
  `Validated ${count} planets across ${samples.size} kinds and ${OBSERVED_OBJECTS.length} object framing distances.`,
);
