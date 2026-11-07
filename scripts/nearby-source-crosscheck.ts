import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { gunzipSync } from "node:zlib";
import { readVizierTSV, readFitsTable, numeric } from "./catalogue/source-readers.mjs";
import { icrsToGalactic } from "../src/lib/astronomy/coordinates";
import { parseSkyCoordinate, angularSeparationArcsec } from "../src/stars/galaxy-ingestion";
import manifest from "../src/stars/catalog-data/nearby-v2/source-manifest.json";
const directory = path.resolve(process.argv[2] || ".cache/nearby-catalogue-sources");
for (const file of manifest.rawFiles) {
  assert.equal(
    crypto
      .createHash("sha256")
      .update(fs.readFileSync(path.join(directory, file.file)))
      .digest("hex"),
    file.sha256,
    "Raw snapshot: " + file.file,
  );
}
const tdat = gunzipSync(fs.readFileSync(path.join(directory, "neargalcat.tdat.gz"))).toString();
const columns = tdat.match(/^line\[1\] = (.+)$/m)![1].split(" ");
const heasarc = tdat
  .split("<DATA>")[1]
  .split("<END>")[0]
  .trim()
  .split(/\r?\n/)
  .map((line) => Object.fromEntries(line.split("|").map((value, i) => [columns[i], value.trim()])));
assert.equal(heasarc.length, 869);
const vizier = readVizierTSV(path.join(directory, "ungc-catalog.tsv"));
let maxPositionArcsec = 0,
  maxGalacticArcsec = 0;
// The excluded HI cloud has different table labels, with identical coordinates/velocity.
for (const row of vizier) {
  const independent = heasarc.find(
    (r) => r.name === ({ "GBT 1355+5439": "LV J1354+5438" }[row.Name] ?? row.Name),
  );
  assert(independent, "Independent HEASARC row " + row.Name);
  const ra = parseSkyCoordinate(row.RAJ2000, true),
    dec = parseSkyCoordinate(row.DEJ2000);
  maxPositionArcsec = Math.max(
    maxPositionArcsec,
    angularSeparationArcsec({ ra, dec }, { ra: +independent.ra, dec: +independent.dec }),
  );
  const gal = icrsToGalactic(ra, dec);
  maxGalacticArcsec = Math.max(
    maxGalacticArcsec,
    angularSeparationArcsec(
      { ra: gal.l, dec: gal.b },
      { ra: +independent.lii, dec: +independent.bii },
    ),
  );
  assert.equal(numeric(row.Dist), numeric(independent.distance));
  assert.equal(row.f_Dist, independent.distance_method);
  assert.equal(numeric(row.HRV), numeric(independent.radial_velocity));
}
assert(maxPositionArcsec < 0.01);
assert(maxGalacticArcsec < 0.1);
const fits = readFitsTable(path.join(directory, "NearbyGalaxies_Jan2021_PUBLIC.fits"));
assert.equal(fits.length, 144);
assert(fits.some((r) => r.vh === 999));
assert.equal(numeric(""), null);
assert.equal(numeric("0"), 0);
console.log(
  JSON.stringify({
    result: "PASS",
    independentUngcRows: heasarc.length,
    localFitsRows: fits.length,
    maxPositionArcsec,
    maxGalacticArcsec,
    rawChecksums: "all verified",
  }),
);
