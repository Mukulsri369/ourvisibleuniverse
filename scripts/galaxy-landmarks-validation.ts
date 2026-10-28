import assert from "node:assert/strict";
import { GALAXY_MODELS } from "../src/stars/galaxy-models";
import { galaxyLandmarks } from "../src/stars/galaxy-landmarks";
import { galaxyStructure } from "../src/stars/galaxy-structure";
import { makeGalaxyStarData } from "../src/stars/galaxy-star-data";
import { M31_PLANETS } from "../src/stars/andromeda-data";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import { readFileSync } from "node:fs";
for (const model of GALAXY_MODELS) {
  const sites = galaxyLandmarks(model);
  assert(sites.length >= 2, model.name);
  assert.equal(new Set(sites.map((s) => s.id)).size, sites.length);
  for (const site of sites) {
    assert(site.local.every(Number.isFinite));
    assert(site.local.every((v) => Math.abs(v) < 1.35));
    assert(site.distance > 0);
    assert(new URL(site.source).protocol === "https:");
  }
  for (const p of model.system?.planets ?? []) {
    assert(p.confirmed, "Unobserved world " + p.name);
    assert.equal(p.moons?.length ?? 0, 0);
  }
  assert(!/Hoag Ring OB|GC-42|AGN-Rim|GC-Sgr|Cen A HST/.test(model.system?.star.name ?? ""));
}
assert(M31_PLANETS.every((p) => p.confirmed && !p.moons?.length));
const get = (name: string) => GALAXY_MODELS.find((m) => m.name === name)!;
for (const name of ["Cartwheel Galaxy", "Hoag's Object", "Malin 1"]) {
  const data = makeGalaxyStarData(get(name), 100000);
  assert.equal(data.positions.length, 300000);
  const seen = new Uint8Array(100000);
  assert.equal(data.indices?.length, 100000);
  for (const i of data.indices!) {
    assert.equal(seen[i], 0);
    seen[i] = 1;
  }
  assert(
    seen.every((v) => v === 1),
    "GPU ordering must retain every star exactly once",
  );
  let gap = 0,
    core = 0,
    outer = 0,
    vertical = 0;
  for (let i = 0; i < 100000; i++) {
    const r = Math.hypot(data.positions[i * 3], data.positions[i * 3 + 2]);
    if (r > 0.34 && r < 0.55) gap++;
    if (r < 0.22) core++;
    if (r > 0.6) outer++;
    vertical += data.positions[i * 3 + 1] ** 2;
  }
  assert(vertical > 0, name + " must have real depth");
  if (name === "Hoag's Object") {
    assert(gap < 10000, "Hoag gap must stay sparse");
    assert(core > 5000 && outer > 50000);
  }
  if (name === "Malin 1") assert(outer > 20000, "Malin must retain extended disk");
}
const host = get("3C 273 (Quasar Host)"),
  quasar = OBSERVED_OBJECTS.find((o) => o.id === "3c273")!;
assert.equal(host.l, quasar.l);
assert.equal(host.b, quasar.b);
assert.equal(host.distance, quasar.distance);
const fragment = readFileSync("src/stars/galaxy-volume-shader.ts", "utf8");
const field = readFileSync("src/stars/GalaxyInteriorField.tsx", "utf8");
assert(
  !fragment.includes("uRotationRate/max(r"),
  "Density pattern must not wind into concentric rings",
);
assert(!field.includes("uRotation/max(radius"), "Stars must remain aligned with pattern");
assert.equal(galaxyStructure(get("Malin 1")).feature, 15);
console.log(
  "PASS: every named galaxy has sourced structural visits; rings have distinct depth/populations; extended Malin disk; quasar-host alignment; no invented hosted worlds/moons",
);
