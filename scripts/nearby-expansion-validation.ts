import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import * as THREE from "three";
import baseline from "../src/stars/catalog-data/nearby-v2/baseline-387de79.json";
import manifest from "../src/stars/catalog-data/nearby-v2/source-manifest.json";
import coverage from "../docs/nearby-galaxy-coverage.json";
import coordinateReferences from "../src/stars/catalog-data/nearby-v2/coordinate-references.json";
import identityHistory from "../src/stars/catalog-data/nearby-v2/identity-history.json";
import {
  OBSERVATIONAL_GALAXY_CATALOG as galaxies,
  getGalaxyByAnyName,
  searchObservationalAtlas,
} from "../src/stars/galaxy-catalog";
import { IMPORTED_GALAXIES } from "../src/stars/galaxy-catalogue-data";
import { NEARBY_SOURCE_CANDIDATES } from "../src/stars/galaxy-catalogue-sources";
import {
  galaxyIdentityKey,
  sourceIdentityKey,
  parseSkyCoordinate,
  angularSeparationArcsec,
  modulusError,
  ingestGalaxySources,
} from "../src/stars/galaxy-ingestion";
import { GALAXY_BY_NAME, gToXYZ, galaxyOrientation } from "../src/stars/galaxy-models";
import { galaxyPopulation } from "../src/stars/galaxy-populations";
import { createTargetFromGalaxy } from "../src/stars/universal-target-factory";
import { searchExplorer, galaxyEntries } from "../src/stars/exploration-catalog";
import { explorerGalaxy } from "../src/stars/exploration-galaxies";
import { useStore } from "../src/stars/store";
import { useExploration, galaxyContentsLoaded } from "../src/stars/exploration-scope";
import { filterNearbyGalaxies, formatGalaxyRedshift } from "../src/stars/galaxy-measurement-format";
import { GalaxySpatialIndex, resolvedGalaxyIndices } from "../src/stars/galaxy-spatial-index";
import {
  exploreGalaxyAssociation,
  navigateExplorationTarget,
} from "../src/stars/exploration-navigation";
const close = (a: number, b: number, tol = 1e-6) => assert(Math.abs(a - b) < tol, `${a} != ${b}`);
assert.equal(coverage.schemaVersion, 1);
assert.equal(
  crypto
    .createHash("sha256")
    .update(fs.readFileSync("src/stars/catalog-data/nearby-v2/" + coverage.identityHistory.file))
    .digest("hex"),
  coverage.identityHistory.sha256,
);
const retainedIdentity = identityHistory.identities[0],
  candidate = NEARBY_SOURCE_CANDIDATES.find((c) => retainedIdentity.names.includes(c.rowName))!;
const renamed = ingestGalaxySources(
  galaxies.filter((g) => baseline.galaxies.some((b) => b.id === g.id)),
  [
    {
      ...candidate,
      rowName: "renamed-identity-regression",
      name: "Renamed identity regression",
      aliases: [candidate.rowName],
    },
  ],
  identityHistory.identities,
);
assert.equal(
  renamed.added[0]?.id,
  retainedIdentity.id,
  "Canonical IDs must survive a preferred-name change",
);
for (const reference of coordinateReferences.galaxies) {
  const g = getGalaxyByAnyName(reference.name)!;
  assert(g);
  assert(angularSeparationArcsec({ ra: g.ra, dec: g.dec }, reference) < 0.01);
  assert(
    angularSeparationArcsec({ ra: g.l, dec: g.b }, { ra: reference.l, dec: reference.b }) < 0.1,
  );
}
for (const pair of coordinateReferences.pairs) {
  const a = getGalaxyByAnyName(pair.a)!,
    b = getGalaxyByAnyName(pair.b)!;
  const separation = gToXYZ(a.l, a.b, a.distance).distanceTo(gToXYZ(b.l, b.b, b.distance));
  assert(
    Math.abs(separation - pair.separationLy) / pair.separationLy < 1e-6,
    "Independent Cartesian separation " + pair.a + " / " + pair.b,
  );
}
assert.equal(coverage.decisions.length, NEARBY_SOURCE_CANDIDATES.length);
for (const source of manifest.sources) {
  assert.equal(
    coverage.decisions.filter((d) => d.sourceId === source.id).length,
    source.expectedRows,
  );
}
for (const file of [...manifest.inputs, ...coverage.chunks])
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync("src/stars/catalog-data/nearby-v2/" + file.file))
      .digest("hex"),
    file.sha256,
  );
assert.equal(galaxies.length, coverage.totalCount);
assert.equal(IMPORTED_GALAXIES.length, coverage.addedCount);
assert.equal(new Set(galaxies.map((g) => g.id)).size, galaxies.length);
assert.equal(new Set(galaxies.map((g) => g.name)).size, galaxies.length);
assert.deepEqual(
  IMPORTED_GALAXIES.map((g) => g.id),
  coverage.addedIds,
);
// Documented position corrections since the 387de79 baseline. Galactic l/b were
// inconsistent with the same records' ICRS RA/Dec; two RA/Dec pairs were also ~25–70″
// from SIMBAD/NED. Each is confirmed by the galaxy image's embedded AVM registration
// (docs/GALAXY_OBSERVED_IMAGES_20261108.md). Every other baseline value stays exact.
const DOCUMENTED_CORRECTIONS: Record<string, Record<string, number>> = {
  "NGC-4038-4039": { l: 286.959, b: 42.461 },
  "NGC-1300": { l: 208.164, b: -55.223 },
  "CARTWHEEL-GALAXY": { ra: 9.4214, dec: -33.7163, l: 326.306, b: -82.777 },
  "HOAGS-OBJECT": { ra: 229.31, dec: 21.5855, l: 31.518, b: 56.452 },
  "TADPOLE-GALAXY": { l: 85.756, b: 45.138 },
  "MAYALLS-OBJECT": { l: 174.186, b: 63.988 },
};
for (const old of baseline.galaxies) {
  const current = galaxies.find((g) => g.id === old.id)!;
  assert(current);
  for (const [k, value] of Object.entries(old)) {
    if (k === "aliases") {
      for (const alias of value as string[]) assert(current.aliases.includes(alias));
    } else
      assert.deepEqual(
        (current as unknown as Record<string, unknown>)[k],
        DOCUMENTED_CORRECTIONS[old.id]?.[k] ?? value,
        old.name + ": " + k,
      );
  }
}
for (const [a, b] of [
  ["NGC 00024", "NGC24"],
  ["Messier 031", "M31"],
  ["LEDA 002557", "PGC2557"],
  ["And XVIII", "Andromeda 18"],
  ["Boötes II", "Bootes2"],
  ["ESO410-G005", "ESO410-005"],
])
  assert.equal(galaxyIdentityKey(a), galaxyIdentityKey(b));
assert.equal(sourceIdentityKey("SagittariusdSph"), galaxyIdentityKey("Sagittarius Dwarf"));
assert.notEqual(galaxyIdentityKey("HIPASS J0607-34"), galaxyIdentityKey("HIPASS J0607+34"));
close(parseSkyCoordinate("-00:32:00"), -0.533333333333);
close(parseSkyCoordinate("00 00 00", true), 0);
for (const value of ["12:60:00", "bad", "90:00:01"]) assert.throws(() => parseSkyCoordinate(value));
assert.throws(() => parseSkyCoordinate("24:00:00", true));
close(modulusError(1, 5).minus, 0.9);
close(modulusError(1, 5).plus, 9);
assert.throws(() => modulusError(1, -1));
assert.equal(angularSeparationArcsec({ ra: 359.999, dec: 0 }, { ra: 0.001, dec: 0 }) > 7, true);
assert.deepEqual(gToXYZ(0, 0, 10).toArray(), [-10, 0, 0]);
close(gToXYZ(90, 0, 10).z, 10);
close(gToXYZ(0, 90, 10).y, 10);
// Independent HEASARC coordinates for a southern galaxy, not a round-trip assertion.
const ic3104 = getGalaxyByAnyName("IC3104")!;
const actual = gToXYZ(301.41404706, -16.9507729, 1).normalize();
const represented = gToXYZ(ic3104.l, ic3104.b, 1).normalize();
assert(actual.distanceTo(represented) < 0.005);
let unknown = 0;
for (const g of IMPORTED_GALAXIES) {
  const e = g.catalogueEvidence!,
    model = GALAXY_BY_NAME.get(g.name)!;
  assert(model && !model.system);
  assert(e && e.sourceUrl.startsWith("https://"));
  assert(e.references.every((r) => r.startsWith("https://")));
  assert(g.ra >= 0 && g.ra < 360 && g.dec >= -90 && g.dec <= 90);
  assert(g.distance > 0 && g.size > 0 && g.size < g.distance * 2);
  assert(gToXYZ(g.l, g.b, g.distance).toArray().every(Number.isFinite));
  close(galaxyOrientation(model).length(), 1);
  if (e.velocityKmS === undefined) {
    unknown++;
    assert.equal(g.redshift, undefined);
    assert.equal(createTargetFromGalaxy(g).redshift, undefined);
    assert.equal(formatGalaxyRedshift(g), "Not supplied");
  } else close(g.redshift!, e.velocityKmS / 299792.458);
  if (e.distanceBasis === "group-adoption") {
    assert.equal(g.independentDistanceLy, undefined);
  }
  if (!e.distanceErrorMpc) assert.equal(g.distanceUncertaintyLy, undefined);
  if (e.axisRatio === undefined)
    assert.equal(
      g.angularDiameterArcmin.minor,
      undefined,
      "Unknown flattening must remain unknown",
    );
  if (e.distanceErrorMpc) {
    assert(e.distanceErrorMpc.minus >= 0 && e.distanceErrorMpc.plus >= 0);
    assert(e.distanceErrorMpc.minus < e.distanceMpc);
  }
  for (const alias of [g.name, ...g.aliases]) {
    assert.equal(getGalaxyByAnyName(alias)?.id, g.id, alias);
    assert(
      searchExplorer(alias, null).some((d) => d.kind === "galaxy" && d.name === g.name),
      "Explorer alias: " + alias,
    );
  }
  const target = createTargetFromGalaxy(g);
  assert.deepEqual(target.citations, [...new Set([e.sourceUrl, ...e.references])]);
  if (e.sizeDefinition !== "Holmberg-B26.5") assert.equal(target.radiusKm, undefined);
  const descriptor = explorerGalaxy(g.name)!;
  assert(descriptor);
  useExploration.setState({ phase: "outside", galaxy: null, pending: null, queued: null });
  useStore.getState().setVisitGalaxy(descriptor);
  assert.equal(useStore.getState().visitGalaxy?.name, g.name);
  assert(!galaxyContentsLoaded(g.name));
  useExploration.setState({ phase: "inside", galaxy: g.name });
  assert(galaxyContentsLoaded(g.name));
  assert(galaxyEntries(g.name).every((d) => d.host === g.name));
  useExploration.setState({ phase: "outside", galaxy: null });
  assert(!galaxyContentsLoaded(g.name));
  if (/spheroidal|elliptical/i.test(g.type) && !/star-forming|Emission-line/.test(g.type)) {
    const p = galaxyPopulation(model);
    assert(p && p.hii === 0 && p.dust === 0);
  }
}
assert(unknown > 0, "Unknown velocities must be preserved, not zero-filled");
assert(
  searchObservationalAtlas({ hostGroup: "M31 subgroup" }).every(
    (g) => g.hostGroup === "M31 subgroup",
  ),
);
assert(
  searchObservationalAtlas({ constellation: "Virgo" }).every((g) =>
    g.constellation?.includes("Virgo"),
  ),
);
assert(
  searchObservationalAtlas({ observationSource: "UNGC 2013" }).every(
    (g) => g.catalogueEvidence?.sourceId === "ungc-2013",
  ),
);
assert.equal(searchObservationalAtlas({ query: "UGC 0012894" })[0]?.name, "UGC 12894");
assert(searchObservationalAtlas({ redshiftRange: "low" }).every((g) => g.redshift !== undefined));
assert(
  filterNearbyGalaxies(galaxies, { range: "11-30" }).every(
    (g) => g.catalogueEvidence?.distanceBasis !== "flow",
  ),
);
assert.equal(getGalaxyByAnyName("Andromeda XXXII")!.catalogueEvidence?.group?.name, "M31 subgroup");
assert(
  !IMPORTED_GALAXIES.some((g) =>
    /Segue ?3|Bol520|Willman1|Cetus2|HIZSS3/.test(g.catalogueEvidence!.rowName),
  ),
);
const regenerated = ingestGalaxySources(
  galaxies
    .filter((g) => baseline.galaxies.some((b) => b.id === g.id))
    .map((g) => ({ ...g, aliases: [...baseline.galaxies.find((b) => b.id === g.id)!.aliases] })),
  NEARBY_SOURCE_CANDIDATES,
);
const frozenRows = coverage.chunks.flatMap((chunk) =>
  JSON.parse(fs.readFileSync("src/stars/catalog-data/nearby-v2/" + chunk.file, "utf8")),
);
assert.equal(regenerated.added.length, frozenRows.length);
for (let i = 0; i < frozenRows.length; i++)
  assert.deepEqual(
    JSON.parse(JSON.stringify(regenerated.added[i])),
    frozenRows[i],
    "Deterministic raw import: " + frozenRows[i].id,
  );
// Synthetic stress data are confined to this test; never catalogue galaxies.
const items = Array.from({ length: 10000 }, (_, i) => ({
  position: new THREE.Vector3(((i % 100) - 50) * 1000, 0, -10000 - Math.floor(i / 100) * 1000),
  radius: 200,
}));
const index = new GalaxySpatialIndex(items);
const camera = new THREE.PerspectiveCamera(45, 1280 / 720, 1, 1e7);
camera.updateMatrixWorld();
assert(resolvedGalaxyIndices(index, camera, 720, 8).length <= 8);
assert(resolvedGalaxyIndices(index, camera, 844, 4, [9999]).includes(9999));
assert.equal(resolvedGalaxyIndices(index, camera, 720, 0).length, 0);
const f = new THREE.Frustum().setFromProjectionMatrix(
  new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
);
assert.deepEqual(
  index.query(f).sort((a, b) => a - b),
  items
    .map((_, i) => i)
    .filter((i) => f.intersectsSphere(new THREE.Sphere(items[i].position, items[i].radius))),
);
useExploration.setState({
  phase: "inside",
  galaxy: "Andromeda (M31)",
  pending: null,
  requestedGalaxyAssociation: null,
});
useStore.getState().setVisitGalaxy(explorerGalaxy("Andromeda (M31)")!);
exploreGalaxyAssociation("Virgo Cluster", [0, 54_000_000, 0]);
assert.equal(useExploration.getState().phase, "inside");
assert.equal(useExploration.getState().galaxy, "Andromeda (M31)");
const groupTarget = useExploration.getState().pending!;
assert.equal(groupTarget.kind, "space");
assert.equal(groupTarget.host, null);
assert.equal(useStore.getState().visitGalaxy?.name, "Andromeda (M31)");
useExploration.setState({ phase: "outside", galaxy: null });
navigateExplorationTarget(groupTarget);
assert.equal(
  useStore.getState().visitGalaxy,
  null,
  "A cluster must never become an individual galaxy visit",
);
assert.equal(useExploration.getState().requestedGalaxyAssociation, "Virgo Cluster");
useExploration.setState({ requestedGalaxyAssociation: null });
console.log(
  JSON.stringify({
    result:
      "PASS: versioned coverage, source checksums, preserved records, identity aliases, positions, uncertainties, honest unknowns, navigation ownership and bounded 10k stress index",
    baseline: baseline.count,
    added: IMPORTED_GALAXIES.length,
    total: galaxies.length,
    unknownVelocities: unknown,
  }),
);
