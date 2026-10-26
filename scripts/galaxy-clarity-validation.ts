import assert from "node:assert/strict";
import { interiorTravelScale, freeLookSpeed } from "../src/stars/free-look-input";
import { GALAXY_MODELS } from "../src/stars/galaxy-models";
import { makeGalaxyInteriorStars } from "../src/stars/galaxy-interior-stars";
import { NEARBY_GALAXIES } from "../src/stars/galaxy-catalog";
const model = GALAXY_MODELS.find((m) => m.key === "cena")!;
const catalogue = NEARBY_GALAXIES.find((m) => m.name === model.name)!;
assert.equal(model.morphology, "elliptical");
assert(Math.abs(model.diskRadius * 2 - catalogue.size) < 2);
const angular = catalogue.angularDiameterArcmin!.major;
assert(
  Math.abs(
    catalogue.size / (2 * catalogue.distance * Math.tan((angular * Math.PI) / 180 / 60 / 2)) - 1,
  ) < 0.001,
);
const geometry = makeGalaxyInteriorStars(model);
const p = geometry.getAttribute("position");
let x2 = 0,
  y2 = 0;
for (let i = 0; i < p.count; i++) {
  x2 += p.getX(i) ** 2;
  y2 += p.getY(i) ** 2;
}
assert(
  y2 / x2 > 0.25,
  "Centaurus A has a spheroidal stellar population rather than a thin spiral disk",
);
geometry.dispose();
for (const extent of [0.01, 1, 100, 50000, 1e8]) {
  for (const kind of ["galaxy", "nebula"] as const) {
    const ordinary = extent * 0.5,
      local = interiorTravelScale(kind, extent, ordinary);
    assert(local < ordinary / 20);
    assert(local > 0);
    assert.equal(
      interiorTravelScale(kind, extent, ordinary * 1000),
      local,
      "Travel stays bounded away from the entry anchor",
    );
    assert.equal(
      freeLookSpeed(local, 50, 2),
      2 * freeLookSpeed(local, 50, 1),
      "User movement-speed controls remain effective",
    );
    assert.equal(
      interiorTravelScale(kind, extent, extent * 0.00001),
      extent * 0.00001,
      "Fine local movement is not accelerated",
    );
  }
  assert.equal(
    interiorTravelScale(null, extent, extent * 0.5),
    extent * 0.5,
    "Normal free look is unchanged",
  );
}
console.log(
  "PASS: observed angular extent, spheroidal Centaurus A, bounded galaxy/nebula movement and preserved user controls",
);

const { namedSurveyCounterpart } = await import("../src/stars/survey-galaxy-identity");
assert.equal(
  namedSurveyCounterpart(catalogue.l, catalogue.b, catalogue.radialVelocityKmS!),
  catalogue.name,
);
assert.equal(
  namedSurveyCounterpart(catalogue.l, catalogue.b, 10000),
  null,
  "Different-redshift neighbours are retained",
);
assert.equal(
  namedSurveyCounterpart(catalogue.l + 0.3, catalogue.b, catalogue.radialVelocityKmS!),
  null,
  "Nearby but distinct sources are retained",
);

const exterior = makeGalaxyInteriorStars(model, 18000);
const interior = makeGalaxyInteriorStars(model, 100000);
for (let i = 0; i < 18000; i += 97) {
  for (let k = 0; k < 3; k++)
    assert.equal(
      exterior.getAttribute("position").array[i * 3 + k],
      interior.getAttribute("position").array[i * 3 + k],
      "Exterior stars retain their positions on entry",
    );
}
exterior.dispose();
interior.dispose();
