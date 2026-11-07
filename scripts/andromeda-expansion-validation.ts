import { matchesExplorerCategory } from "../src/stars/exploration-catalog";
import * as THREE from "three";
import assert from "node:assert/strict";
import {
  ANDROMEDA_OBJECTS,
  M31_TARGETS,
  M31_HOST,
  validateM31Coordinates,
} from "../src/stars/andromeda-catalog";
import { M31_PLANETS, M31_CENTER } from "../src/stars/andromeda-data";
import {
  OBSERVED_OBJECTS,
  objectPosition,
  objectVisitDistance,
} from "../src/stars/observed-objects";
import { objectHost } from "../src/stars/object-hosts";
import { galaxyEntries, searchExplorer } from "../src/stars/exploration-catalog";
import { useExploration } from "../src/stars/exploration-scope";
import { useStore } from "../src/stars/store";
import { navigateExplorationTarget } from "../src/stars/exploration-navigation";
import { createTargetFromObservedObject } from "../src/stars/universal-target-factory";
import { clusterPopulation, capClusterPointShader } from "../src/stars/andromeda-cluster-model";
const pointShader = { vertexShader: THREE.ShaderLib.points.vertexShader };
capClusterPointShader(pointShader);
assert(pointShader.vertexShader.includes("gl_PointSize = min(gl_PointSize, 8.0)"));
assert(
  pointShader.vertexShader.indexOf("gl_PointSize = min") >
    pointShader.vertexShader.indexOf("gl_PointSize *= ( scale"),
);
assert.throws(() => capClusterPointShader({ vertexShader: "unsupported" }));
assert.equal(new Set(OBSERVED_OBJECTS.map((o) => o.id)).size, OBSERVED_OBJECTS.length);
const aliases = new Map<string, string>();
for (const t of M31_TARGETS) {
  for (const name of [t.name, ...t.aliases]) {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    assert(!aliases.has(key) || aliases.get(key) === t.id, "Cross-identity alias collision");
    aliases.set(key, t.id);
    for (const other of OBSERVED_OBJECTS.filter((o) => o.id !== t.id))
      assert(
        ![other.name, ...other.aliases].some(
          (alias) => alias.toLowerCase().replace(/[^a-z0-9]/g, "") === key,
        ),
        "Alias duplicates an existing canonical object: " + name,
      );
  }
  const o = ANDROMEDA_OBJECTS.find((o) => o.id === t.id)!;
  assert.equal(objectHost(o.id), M31_HOST);
  assert.equal(OBSERVED_OBJECTS.filter((o) => o.id === t.id).length, 1);
  assert(t.ra >= 0 && t.ra < 360 && Math.abs(t.dec) <= 90);
  assert(objectPosition(o).every(Number.isFinite));
  assert(Math.hypot(...objectPosition(o).map((v, i) => v - M31_CENTER.toArray()[i])) < 170000);
  assert(objectVisitDistance(o) > 0);
  assert.equal(o.extentBasis, "illustrative");
  assert(o.visualNote.includes("unknown individual"));
  assert(o.source.startsWith("https://"));
  for (const alias of t.aliases) assert.equal(searchExplorer(alias, M31_HOST)[0]?.id, t.id, alias);
  const entry = galaxyEntries(M31_HOST).find((e) => e.id === t.id)!;
  assert(entry);
  assert(
    matchesExplorerCategory(
      entry,
      o.visual === "star" ? "star" : o.visual === "cluster" ? "cluster" : "object",
    ),
  );
  useExploration.setState({ phase: "outside", galaxy: null, pending: null });
  useStore.setState({ selectedObjectId: null });
  navigateExplorationTarget(entry);
  assert.equal(useStore.getState().selectedObjectId, null);
  assert.equal(useExploration.getState().pending?.id, t.id);
  useExploration.setState({ phase: "inside", galaxy: M31_HOST, pending: null });
  navigateExplorationTarget(entry);
  assert.equal(useStore.getState().selectedObjectId, t.id);
  assert(useStore.getState().flyTo);
  const detail = createTargetFromObservedObject(o);
  assert.equal(detail.parentName, M31_HOST);
  assert.equal(detail.radiusKm, undefined);
  assert.deepEqual(detail.citations, o.sourceReferences ?? [o.source]);
  assert(detail.telescopeObservations.includes(o.source));
  if (o.visual === "star") assert.equal(detail.type, "star");
  if (o.visual === "cluster") assert.equal(detail.type, "cluster");
}
assert.deepEqual(
  objectPosition(ANDROMEDA_OBJECTS.find((o) => o.id === "m31-nucleus")!),
  M31_CENTER.toArray(),
);
const af = ANDROMEDA_OBJECTS.find((o) => o.id === "m31-af-and")!;
assert(
  Math.abs(af.l - 121.3360948) < 0.001 && Math.abs(af.b + 21.6444453) < 0.001,
  "Independent SIMBAD Galactic coordinate anchor",
);
for (const bad of [
  [NaN, 0],
  [0, 91],
  [360, 0],
  [0, Infinity],
])
  assert.throws(() => validateM31Coordinates(...(bad as [number, number])));
for (const kind of ["globular", "association", "nuclear"] as const) {
  const a = clusterPopulation(kind),
    b = clusterPopulation(kind);
  assert.deepEqual(a, b);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(a.positions, 3));
  geometry.computeBoundingSphere();
  assert(geometry.boundingSphere!.radius > 0);
  const material = new THREE.PointsMaterial({ vertexColors: true, size: 1.6 });
  assert(material.size > 0);
  geometry.dispose();
  material.dispose();
  assert.equal(a.positions.length, 4800);
  assert([...a.positions].every(Number.isFinite));
  assert([...a.colors].every((n) => n >= 0 && n <= 1));
  for (let i = 0; i < a.positions.length; i += 3)
    assert(Math.hypot(...a.positions.slice(i, i + 3)) <= 0.481);
}
assert.notDeepEqual(
  clusterPopulation("globular").positions,
  clusterPopulation("association").positions,
);
assert.throws(() => clusterPopulation("globular", 100000));
const nuclearStars = ANDROMEDA_OBJECTS.find((o) => o.id === "m31-nuclear-stars")!;
assert.deepEqual(objectPosition(nuclearStars), M31_CENTER.toArray());
assert.equal(nuclearStars.compactPhysics, undefined);
assert.equal(createTargetFromObservedObject(nuclearStars).type, "cluster");
for (const aspect of [1280 / 720, 390 / 844]) {
  const limitingFov = Math.atan(Math.tan(Math.PI / 12) * Math.min(aspect, 1));
  assert(
    objectVisitDistance(nuclearStars, aspect) * Math.sin(limitingFov) >
      nuclearStars.diameterLy * 0.5,
  );
}
assert(objectVisitDistance(nuclearStars, 390 / 844) > objectVisitDistance(nuclearStars));
assert(nuclearStars.properties.some((p) => p.includes("component astrometry is not encoded")));
assert(nuclearStars.properties.some((p) => p.includes("not two additional black holes")));
assert.equal(searchExplorer("M31*", M31_HOST)[0]?.id, "m31-nucleus");
const nuclear = clusterPopulation("nuclear");
let blueCount = 0,
  warmCount = 0,
  warmX = 0;
for (let i = 0; i < nuclear.positions.length; i += 3) {
  const [x, y, z] = nuclear.positions.slice(i, i + 3);
  assert(Math.abs(y) < 0.024, "Nuclear population remains disk-like");
  if (nuclear.colors[i + 2] > nuclear.colors[i]) {
    blueCount++;
    assert(Math.hypot(x, z) < 0.048, "Blue population stays nested around the focus");
  } else {
    warmCount++;
    warmX += x;
  }
}
assert.equal(blueCount, 320);
assert.equal(warmCount, 1280);
assert(warmX / warmCount < -0.12, "Warm population is lopsided toward apocentre");
assert.equal(M31_PLANETS.length, 1);
assert.equal(M31_PLANETS[0].confirmed, false);
assert(M31_PLANETS[0].description.includes("hypothetical"));
console.log(
  JSON.stringify({
    newTargets: ANDROMEDA_OBJECTS.length,
    allObserved: OBSERVED_OBJECTS.length,
    m31ExplorerEntries: galaxyEntries(M31_HOST).length,
    result:
      "PASS: identity, aliases, host, coordinates, placement, gated navigation, details, populations and candidate regression",
  }),
);
