import assert from "node:assert/strict";
import { NEARBY_GALAXIES } from "../src/stars/galaxy-catalog";
import { GALAXY_BY_NAME, GALAXY_MODELS } from "../src/stars/galaxy-models";
import {
  catalogueAppearance,
  catalogueMorphologyMode,
} from "../src/stars/galaxy-overview-appearance";
import { catalogueShape } from "../src/stars/galaxy-catalogue-shader";

const recordByName = new Map(NEARBY_GALAXIES.map((record) => [record.name, record]));
let sourceProfiles = 0,
  guideProfiles = 0;
for (const model of GALAXY_MODELS) {
  const record = recordByName.get(model.name);
  const before = JSON.stringify(model);
  const profile = catalogueAppearance(model, record);
  assert.deepEqual(
    profile,
    catalogueAppearance(model, record),
    `${model.name}: deterministic profile`,
  );
  for (const value of [
    ...profile.oldColor,
    ...profile.youngColor,
    ...profile.parameters,
    ...profile.features,
  ]) {
    assert(Number.isFinite(value), `${model.name}: finite GPU attribute`);
  }
  assert(profile.oldColor.every((value) => value >= 0 && value <= 1));
  assert(profile.youngColor.every((value) => value >= 0 && value <= 1));
  assert.equal(
    catalogueShape(model)[0],
    model.diskRadius,
    `${model.name}: physical radius unchanged`,
  );
  if (model.projectedAxisRatio !== undefined) {
    assert.equal(catalogueShape(model)[2], Math.max(0.06, Math.min(1, model.projectedAxisRatio)));
  }
  if (record?.catalogueEvidence) {
    assert.equal(profile.structureBasis, "source-catalogue morphology");
    sourceProfiles++;
  }
  if (profile.colorBasis === "observatory-guide reconstruction") {
    assert(profile.source?.startsWith("https://"), `${model.name}: published guide required`);
    guideProfiles++;
  }
  if (!(Number.isFinite(record?.photometry?.B) && Number.isFinite(record?.photometry?.V))) {
    assert.equal(profile.integratedColorIndexBV, undefined, `${model.name}: no invented B-V`);
  }
  assert.equal(JSON.stringify(model), before, `${model.name}: never mutate the adopted model`);
}
assert.equal(sourceProfiles, 641, "All sourced additions receive an explicit morphology profile");
assert(guideProfiles >= 15, "Existing individual observatory guides are retained");

const model = (name: string) => {
  const found = GALAXY_BY_NAME.get(name);
  assert(found, name);
  return found;
};
const hoag = model("Hoag's Object"),
  ring = catalogueAppearance(hoag);
assert.equal(catalogueMorphologyMode(hoag), 7);
assert(ring.features[0] > 0.3 && ring.features[0] < 1, "Hoag has an outer ring and a central gap");
assert(ring.youngColor[2] > ring.youngColor[0], "Blue ring population");
assert(ring.oldColor[0] > ring.oldColor[2], "Warm central population");

const m87 = catalogueAppearance(model("M87 (Virgo A)"));
assert.equal(m87.parameters[1], 0, "Passive M87 receives no spiral dust");
assert.equal(m87.features[2], 0, "Passive M87 receives no star-forming knots");
const sculptorDwarf = catalogueAppearance(model("Sculptor Dwarf"));
assert.equal(sculptorDwarf.parameters[1], 0, "Diffuse spheroidal dwarf receives no gas nebula");
assert.equal(sculptorDwarf.features[2], 0);
assert.equal(
  catalogueAppearance(model("Centaurus A (NGC 5128)")).features[3],
  3,
  "Observed dust-lane exception",
);
assert.equal(
  catalogueAppearance(model("M82 (Cigar Galaxy)")).features[3],
  1,
  "M82's published hydrogen plumes",
);
assert.equal(
  catalogueMorphologyMode(model("M82 (Cigar Galaxy)")),
  10,
  "Disk starburst remains a disk, not a spheroid",
);
assert.equal(
  catalogueMorphologyMode({ ...model("Triangulum (M33)"), morphology: "flocculent" }),
  8,
  "Flocculent rendering contract remains distinct",
);
assert.equal(catalogueMorphologyMode(model("NGC 1300")), 1);
assert(catalogueAppearance(model("NGC 1300")).features[1] > 0, "NGC 1300 has a stellar bar");

const m33 = model("Triangulum (M33)"),
  record = recordByName.get(m33.name)!;
const measured = catalogueAppearance(m33, record);
assert.equal(measured.integratedColorIndexBV, record.photometry!.B - record.photometry!.V);
assert.deepEqual(
  measured.oldColor,
  catalogueAppearance(m33).oldColor,
  "Two integrated bands never masquerade as a resolved RGB map",
);
const fresh = catalogueAppearance(m33);
fresh.oldColor[0] = 0;
assert.notEqual(
  catalogueAppearance(m33).oldColor[0],
  0,
  "Profiles never share mutable palette arrays",
);
console.log(
  `Overview appearance validated: ${GALAXY_MODELS.length} models, ${sourceProfiles} source profiles, ${guideProfiles} observatory-guide profiles.`,
);
