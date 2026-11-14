import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import {
  COSMIC_BENCHMARKS,
  surveyScenePosition,
} from "../src/lib/astronomy/cosmic-web/survey-catalogs";
import { gToXYZ } from "../src/stars/galaxy-models";
import { STRUCTURE_FIELDS } from "../src/stars/cosmic-structures/structure-fields.generated";

const LY_PER_MPC = 3.261563777e6;
const angleDeg = (a: number[], b: number[]) =>
  (Math.acos(
    Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / Math.hypot(...a) / Math.hypot(...b)),
  ) *
    180) /
  Math.PI;

function decode(id: keyof typeof STRUCTURE_FIELDS) {
  const f = STRUCTURE_FIELDS[id];
  const buf = fs.readFileSync("public" + f.file);
  const bytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return {
    f,
    bytes,
    pos: new Int16Array(bytes, f.offsets.position, f.galaxies * 3),
    normal: new Int8Array(bytes, f.offsets.normal, f.galaxies * 3),
    shape: new Uint8Array(bytes, f.offsets.shape, f.galaxies * 4),
    local: (i: number) =>
      [0, 1, 2].map(
        (k) =>
          (new Int16Array(bytes, f.offsets.position, f.galaxies * 3)[i * 3 + k] / 32767) *
          f.extentLy,
      ),
  };
}

test("every structure record agrees with itself and has a current survey field", () => {
  for (const b of COSMIC_BENCHMARKS) {
    // RA/Dec and Galactic l/b must describe the same direction (Virgo's once differed by 3.7°).
    const eq = surveyScenePosition(b.ra, b.dec, 1);
    const gal = gToXYZ(b.l, b.b, 1);
    assert.ok(angleDeg(eq, [gal.x, gal.y, gal.z]) < 0.1, `${b.id}: RA/Dec and l/b disagree`);
    const f = STRUCTURE_FIELDS[b.id as keyof typeof STRUCTURE_FIELDS];
    assert.ok(f, `${b.id}: no field; run npm run cosmic:build`);
    const centre = gToXYZ(b.l, b.b, b.distanceGlyPlanck * 1e9);
    assert.ok(
      Math.hypot(centre.x - f.centreLy[0], centre.y - f.centreLy[1], centre.z - f.centreLy[2]) <
        1000,
      `${b.id}: field built for an older record; run npm run cosmic:build`,
    );
  }
});

test("binary files match their manifests and decode to sane attributes", () => {
  for (const id of Object.keys(STRUCTURE_FIELDS) as (keyof typeof STRUCTURE_FIELDS)[]) {
    const { f, bytes, normal, shape } = decode(id);
    assert.equal(bytes.byteLength, f.bytes, id);
    assert.ok(f.galaxies >= 700, `${id}: only ${f.galaxies} galaxies`);
    for (let i = 0; i < f.galaxies; i += 97) {
      const len = Math.hypot(normal[i * 3], normal[i * 3 + 1], normal[i * 3 + 2]) / 127;
      assert.ok(Math.abs(len - 1) < 0.03, `${id}: normal ${i} not unit`);
      assert.ok(shape[i * 4] >= 12, `${id}: flattening ${i}`);
    }
    for (const c of f.components)
      assert.ok(
        c.position.every((v) => Math.abs(v) <= f.extentLy),
        `${id}: ${c.name} outside field`,
      );
    assert.ok(f.splats > 0 && f.splats <= 4000, `${id}: glow cells`);
  }
});

test("Virgo's main body sits at its measured SBF distance, not its redshift distance", () => {
  const { f, local } = decode("virgo_cluster");
  const m87 = surveyScenePosition(187.70593, 12.39112, 1);
  const distances: number[] = [];
  for (let i = 0; i < f.galaxies; i++) {
    const p = local(i).map((v, k) => v + f.centreLy[k]);
    const d = Math.hypot(...p);
    if (angleDeg(p, m87) < 6 && d < 80e6) distances.push(d / 1e6);
  }
  distances.sort((a, b) => a - b);
  const median = distances[Math.floor(distances.length / 2)];
  assert.ok(distances.length > 200, `only ${distances.length} Virgo members`);
  assert.ok(median > 50 && median < 57, `Virgo median distance ${median} Mly`);
  assert.ok(f.atlasDuplicates.includes("M87 (Virgo A)"), "M87 must be drawn once, by the atlas");
});

test("the Boötes Void is centred on Kirshner et al.'s position and is empty inside", () => {
  const b = COSMIC_BENCHMARKS.find((x) => x.id === "bootes_void")!;
  assert.ok(Math.abs(b.ra - 222.946) < 0.05 && Math.abs(b.dec - 45.796) < 0.05);
  const { f, local } = decode("bootes_void");
  let inner = 0,
    shell = 0;
  for (let i = 0; i < f.galaxies; i++) {
    const r = Math.hypot(...local(i)) / LY_PER_MPC;
    if (r < 30) inner++;
    else if (r >= 60 && r < 90) shell++;
  }
  const ratio = inner / 30 ** 3 / (shell / (90 ** 3 - 60 ** 3));
  assert.ok(ratio < 0.4, `void interior density is ${ratio.toFixed(2)} of its surroundings`);
});

test("rich clusters are compressed groups anchored to the atlas galaxy", () => {
  const coma = STRUCTURE_FIELDS.coma_cluster.richestGroups[0];
  assert.ok(coma.members >= 300, `Coma's richest group has ${coma.members} members`);
  assert.equal(coma.anchor, "Coma Cluster (NGC 4889)");
  assert.ok(Math.abs(coma.cz - 6925) < 400, `Coma group velocity ${coma.cz}`);
});
