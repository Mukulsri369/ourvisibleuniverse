import assert from "node:assert/strict";
import * as THREE from "three";
import { icrsToGalactic, galacticToIcrs } from "../src/lib/astronomy/coordinates";
import { LIGHT_YEARS_PER_PARSEC } from "../src/lib/astronomy/constants";
import {
  OBSERVATIONAL_GALAXY_CATALOG as galaxies,
  getGalaxyByAnyName,
} from "../src/stars/galaxy-catalog";
import sings from "../src/stars/catalog-data/sings-galaxies.json";
import { LOCAL_DWARF_ROWS } from "../src/stars/catalog-data/local-dwarfs";
import { GALAXY_BY_NAME, galaxyOrientation, gToXYZ } from "../src/stars/galaxy-models";
import { galaxyPopulation } from "../src/stars/galaxy-populations";
import { EXTRAGALACTIC_HII_TARGETS, EXTRAGALACTIC_HII_IDS } from "../src/stars/extragalactic-hii";
import { OBSERVED_OBJECTS, OBJECT_BY_ID, objectPosition } from "../src/stars/observed-objects";
import { objectHost } from "../src/stars/object-hosts";
import { galaxyEntries, searchExplorer } from "../src/stars/exploration-catalog";
import {
  useExploration,
  galaxyContentsLoaded,
  requireGalaxy,
} from "../src/stars/exploration-scope";
import { NEBULA_ROUTES } from "../src/stars/nebula-journey-profiles";
import { NEBULA_SHAPES } from "../src/stars/nebula-structure";
import { OBSERVED_VISUAL_PROFILES } from "../src/stars/observed-object-visuals";
import {
  createTargetFromGalaxy,
  createTargetFromObservedObject,
} from "../src/stars/universal-target-factory";

const close = (a: number, b: number, e = 1e-6) => assert(Math.abs(a - b) < e, `${a} != ${b}`);
// Independent sky anchors catch mirrored-RA transforms, not just self-consistent round trips.
for (const [ra, dec, l, b] of [
  [10.684708, 41.26875, 121.174, -21.573],
  [149.860417, 30.746389, 196.9, 52.4],
  [266.4051, -28.936175, 0, 0],
]) {
  const p = icrsToGalactic(ra, dec),
    back = galacticToIcrs(p.l, p.b);
  close(back.ra, ra, 1e-6);
  close(back.dec, dec, 1e-6);
  close(Math.min(Math.abs(p.l - l), 360 - Math.abs(p.l - l)), 0, 0.06);
  close(p.b, b, 0.06);
}
assert.equal(galaxies.length, 190, "Review the declared coverage if source rows change");
assert.equal(new Set(galaxies.map((g) => g.id)).size, galaxies.length);
assert.equal(new Set(galaxies.map((g) => g.name)).size, galaxies.length);
for (const [name] of sings)
  assert(getGalaxyByAnyName(String(name)), "Missing SINGS identity " + name);
for (const [name] of LOCAL_DWARF_ROWS)
  assert(getGalaxyByAnyName(name), "Missing local dwarf " + name);
for (const alias of [
  "IC 342",
  "NGC 2146",
  "NGC 3077",
  "M74",
  "M95",
  "M99",
  "M89",
  "M90",
  "M58",
  "M63",
  "Bootes I",
  "DDO 210",
])
  assert(getGalaxyByAnyName(alias), alias);
const added = galaxies.filter((g) => g.measurements);
assert.equal(added.length, 126);
for (const g of added) {
  const m = g.measurements!,
    model = GALAXY_BY_NAME.get(g.name)!;
  assert(model && !model.system, "No fabricated planetary systems for " + g.name);
  assert([g.ra, g.dec, g.l, g.b, g.distance, g.size, g.redshift].every(Number.isFinite));
  assert(g.size > 0 && g.distance > g.size / 2);
  assert(m.major >= m.minor && m.minor > 0);
  assert(m.source.startsWith("https://") && m.distanceSource.startsWith("https://"));
  const sky = icrsToGalactic(g.ra, g.dec);
  close(sky.l, g.l);
  close(sky.b, g.b);
  close(g.distance / (LIGHT_YEARS_PER_PARSEC * 1e6), m.distanceMpc);
  close((2 * Math.atan(g.size / (2 * g.distance)) * 180 * 60) / Math.PI, m.major, 1e-6);
  close(g.redshift * 299792.458, m.velocity, 1e-8);
  assert(g.uncertaintyNotes?.includes("reconstructed"));
  close(galaxyOrientation(model).length(), 1, 1e-8);
  assert(galaxyEntries(g.name).every((e) => e.host === g.name));
  if (/spheroidal/i.test(g.type)) {
    const p = galaxyPopulation(model)!;
    assert(p && p.dust === 0 && p.hii === 0);
    assert.equal(p.axes[2], m.minor / m.major);
  }
  if (m.sizeDefinition === "half-light")
    assert.equal(createTargetFromGalaxy(g).radiusKm, undefined);
}
for (const name of ["NGC 855", "NGC 1482", "NGC 3265"]) {
  const p = galaxyPopulation(GALAXY_BY_NAME.get(name)!)!;
  assert(
    p.hii > 0 && p.dust > 0,
    "Do not erase observed star formation in an early-type host: " + name,
  );
}
// A measured position angle must be applied in the local sky plane, not around global axes.
const leo = getGalaxyByAnyName("Leo A")!,
  leoModel = GALAXY_BY_NAME.get(leo.name)!;
close(leo.ra, 149.86041666666668, 1e-6);
const major = new THREE.Vector3(1, 0, 0).applyQuaternion(galaxyOrientation(leoModel));
const near = icrsToGalactic(leo.ra, leo.dec + 1e-3);
const center = gToXYZ(leo.l, leo.b, 1);
const north = gToXYZ(near.l, near.b, 1).sub(center).normalize();
close(Math.abs(major.dot(north)), Math.abs(Math.cos((114 * Math.PI) / 180)), 0.002);
const existing = getGalaxyByAnyName("M31")!;
assert.equal(existing.distance, 2537000, "Do not overwrite established curated records");
assert.equal(getGalaxyByAnyName("M90")!.distanceTier, "virgo_cluster");
close(getGalaxyByAnyName("M90")!.distance, 59e6, 1e-6);
assert.equal(EXTRAGALACTIC_HII_TARGETS.length, 46);
for (const t of EXTRAGALACTIC_HII_TARGETS) {
  const o = OBJECT_BY_ID.get(t.id)!,
    host = getGalaxyByAnyName(t.host)!;
  assert(o && host);
  assert.equal(objectHost(t.id), t.host);
  assert(galaxyEntries(t.host).some((e) => e.id === t.id));
  assert(searchExplorer(t.name, null).some((e) => e.id === t.id && e.host === t.host));
  assert(!searchExplorer(t.name, "Milky Way").some((e) => e.id === t.id));
  assert(NEBULA_ROUTES[t.id] && OBSERVED_VISUAL_PROFILES[t.id] && NEBULA_SHAPES[t.id] >= 22);
  const expected = icrsToGalactic(t.ra, t.dec);
  close(o.l, expected.l);
  close(o.b, expected.b);
  const position = new THREE.Vector3(...objectPosition(o)),
    centre = gToXYZ(host.l, host.b, host.distance);
  assert(
    position.distanceTo(centre) < host.size * 2,
    "Hosted region outside its galaxy envelope: " + t.name,
  );
  assert.equal(o.distance, host.distance, "Unknown internal depth uses adopted host distance");
  if (!t.diameter)
    assert.equal(
      createTargetFromObservedObject(o).radiusKm,
      undefined,
      "Do not report viewing envelopes as measured radii",
    );
  useExploration.setState({ phase: "outside", galaxy: null, pending: null });
  assert(!galaxyContentsLoaded(t.host));
  assert(requireGalaxy({ id: t.id, name: t.name, kind: "object", host: t.host }));
  useExploration.setState({ phase: "inside", galaxy: t.host });
  assert(galaxyContentsLoaded(t.host));
  assert(!requireGalaxy({ id: t.id, name: t.name, kind: "object", host: t.host }));
  useExploration.setState({ phase: "outside", galaxy: null });
  assert(!galaxyContentsLoaded(t.host));
}
assert.equal(OBSERVED_OBJECTS.filter((o) => EXTRAGALACTIC_HII_IDS.has(o.id)).length, 46);
console.log(
  "PASS: 126 new galaxies, all 75 SINGS identities, 59 local dwarfs, 46 real H II targets, sky transforms, units, source provenance, unknown sizes and galaxy-scoped load/unload",
);
