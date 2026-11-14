import assert from "node:assert/strict";
import { test } from "node:test";
import { objectCatalogueSheets } from "./object-catalogue-rows";

test("the downloadable catalogue files known objects under the right category", () => {
  const sheets = new Map(objectCatalogueSheets().map((s) => [s.name, s.rows.map((r) => r[0])]));
  const has = (sheet: string, name: string) =>
    assert.ok(sheets.get(sheet)?.includes(name), `${name} in ${sheet}`);
  has("Solar System", "Earth");
  has("Stars", "Betelgeuse");
  has("Exoplanets", "Proxima Centauri d");
  has("Galaxies", "Andromeda (M31)");
  has("Nebulae", "Orion Nebula (M42)");
  has("Black Holes", "Sagittarius A*");
  has("Neutron Stars & Remnants", "Crab Pulsar");
  has("Cosmic Structures", "Virgo Cluster");
  const all = sheets.get("All Objects")!;
  assert.equal(
    all.length,
    [...sheets].filter(([n]) => n !== "All Objects").reduce((n, [, rows]) => n + rows.length, 0),
  );
});
