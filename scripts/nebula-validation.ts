import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import { NEBULA_REFERENCES } from "../src/stars/nebula-references";
import { NEBULA_SHAPES } from "../src/stars/nebula-structure";
function dimensions(buffer: Buffer) {
  let at = 2;
  assert.equal(buffer.readUInt16BE(0), 0xffd8);
  while (at < buffer.length) {
    if (buffer[at] !== 255) {
      at++;
      continue;
    }
    const marker = buffer[at + 1],
      length = buffer.readUInt16BE(at + 2);
    if ([192, 193, 194].includes(marker))
      return [buffer.readUInt16BE(at + 7), buffer.readUInt16BE(at + 5)];
    at += length + 2;
  }
  throw Error("Missing JPEG dimensions");
}
const objects = OBSERVED_OBJECTS.filter((o) => o.nebulaClass);
assert.equal(objects.length, 18, "Review coverage when adding a new nebula");
for (const item of objects) {
  const ref = NEBULA_REFERENCES[item.id];
  assert.ok(ref, "Missing observed reference: " + item.id);
  assert.ok(Number.isInteger(NEBULA_SHAPES[item.id]), "Missing structure: " + item.id);
  assert.ok(
    ["esahubble.org", "esawebb.org", "www.eso.org", "noirlab.edu", "www.jpl.nasa.gov"].includes(
      new URL(ref.source).hostname,
    ),
  );
  assert.ok(ref.credit.length > 2);
  const raw = readFileSync(new URL("../public" + ref.url, import.meta.url));
  assert.deepEqual(dimensions(raw), [ref.width, ref.height], "Native dimensions: " + item.id);
  assert.ok(Math.min(ref.width, ref.height) >= 1000);
}
assert.equal(
  new Set(objects.map((o) => NEBULA_SHAPES[o.id])).size,
  18,
  "Each catalogue nebula has a distinct structure",
);
assert.notEqual(NEBULA_SHAPES.m20, NEBULA_SHAPES.cats_eye, "Trifid is not a planetary shell");
assert.notEqual(
  NEBULA_SHAPES.veil,
  NEBULA_SHAPES.pleiades_nebula,
  "Shock filaments are not reflection dust",
);
console.log(
  "PASS: 18 nebula structures, image identities, source attribution and native JPEG resolutions",
);
