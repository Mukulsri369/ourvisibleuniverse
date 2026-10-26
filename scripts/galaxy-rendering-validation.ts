import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GALAXY_MODELS, galaxyCenter } from "../src/stars/galaxy-models";
import { GALAXY_REFERENCES } from "../src/stars/galaxy-references";
import { lodManager } from "../src/stars/lod/LODTransitionManager";
// A complete approach and retreat must never lose both representations.
for (const model of GALAXY_MODELS) {
  const center = galaxyCenter(model);
  assert(center.toArray().every(Number.isFinite));
  for (const height of [480, 800, 1440, 2160]) {
    const camera = new THREE.PerspectiveCamera(45, 1.6, 0.001, 1e12);
    let prior = 0;
    for (let step = 0; step <= 160; step++) {
      const distance = model.diskRadius * Math.exp(7 - step * 0.055);
      camera.position.copy(center).add(new THREE.Vector3(0, 0, distance));
      const lod = lodManager.evaluate(
        model.key,
        camera,
        center,
        { objectRadiusLy: model.diskRadius, enterHighDetailPixels: 45, exitHighDetailPixels: 22 },
        height,
      );
      assert(Math.abs(lod.alphaFar + lod.alphaNear - 1) < 1e-12, model.name + " dark handover");
      assert(lod.alphaNear >= prior - 1e-10, model.name + " non-monotonic approach");
      prior = lod.alphaNear;
    }
    assert(prior > 0.99, model.name + " detail did not resolve");
  }
}
function jpegDimensions(bytes: Buffer) {
  for (let i = 2; i < bytes.length - 9;) {
    if (bytes[i] !== 255) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 192 || marker === 194)
      return [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)];
    const length = bytes.readUInt16BE(i + 2);
    assert(length >= 2);
    i += 2 + length;
  }
  throw Error("Invalid JPEG");
}
assert.equal(Object.keys(GALAXY_REFERENCES).length, 16);
for (const ref of Object.values(GALAXY_REFERENCES)) {
  assert.deepEqual(jpegDimensions(readFileSync("public" + ref.url)), [ref.width, ref.height]);
  const preview = jpegDimensions(
    readFileSync("public" + ref.url.replace("/galaxies/", "/galaxies/previews/")),
  );
  assert(
    Math.abs(preview[0] / preview[1] - ref.width / ref.height) < 0.01,
    "Portrait aspect changed",
  );
  assert(["esahubble.org", "esawebb.org", "www.eso.org"].includes(new URL(ref.source).hostname));
}
const buffer = readFileSync("public/data/2mrs-galaxies.bin");
assert.equal(buffer.length, 42541 * 12);
for (let i = 0; i < buffer.length; i += 12) {
  const l = buffer.readFloatLE(i),
    b = buffer.readFloatLE(i + 4),
    cz = buffer.readFloatLE(i + 8);
  assert(l >= 0 && l <= 360 && b >= -90 && b <= 90 && cz > 1500 && Number.isFinite(cz));
}
console.log(
  "PASS: 63 catalogue approaches at four viewport sizes; 16 observed guide/portrait pairs; 42,541 valid survey records.",
);
