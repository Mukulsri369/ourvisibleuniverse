import assert from "node:assert/strict";
import { nearestOrbitAngle, stellarDisplayRadius } from "../src/stars/camera-navigation";
import { NAMED_STARS } from "../src/stars/data";
for (const current of [-10000, -Math.PI * 8, 0, Math.PI * 12, 10000])
  for (const target of [-2, 0, 2]) {
    const result = nearestOrbitAngle(current, target);
    assert.ok(Math.abs(result - current) <= Math.PI + 1e-9);
    assert.ok(Math.abs(Math.sin(result - target)) < 1e-9);
  }
for (const star of NAMED_STARS) {
  assert.ok(Number.isFinite(stellarDisplayRadius(star)));
  assert.ok(stellarDisplayRadius(star) > 0);
}
assert.equal(
  stellarDisplayRadius({ name: "invalid", radius: NaN }),
  stellarDisplayRadius({ name: "invalid", radius: 1 }),
);
console.log(
  `Camera angle and stellar framing checks passed for ${NAMED_STARS.length} sitemap stars.`,
);
