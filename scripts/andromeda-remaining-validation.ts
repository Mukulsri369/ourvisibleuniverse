import assert from "node:assert/strict";
import * as THREE from "three";
import { contextualScaleIndicator } from "../src/stars/scale-context";
import { frameSummary } from "../src/stars/scene-qa-metrics";
import { makeGlowTexture } from "../src/stars/object-glow-texture";
import { resolveReferenceImageURL } from "../src/stars/local-scene-qa-flags";
import { M31_TARGETS, ANDROMEDA_OBJECTS } from "../src/stars/andromeda-catalog";
import { objectPosition } from "../src/stars/observed-objects";
import {
  M31_GAS_KINDS,
  M31_GAS_VERTEX,
  M31_GAS_FRAGMENT,
  M31_DISK_VERTEX,
  M31_DISK_FRAGMENT,
} from "../src/stars/AndromedaExtendedDetail";
import { createTargetFromObservedObject } from "../src/stars/universal-target-factory";
import {
  returnToGalaxyOverview,
  galaxyOverviewDistance,
} from "../src/stars/exploration-navigation";
import { galaxyEntries, matchesExplorerCategory } from "../src/stars/exploration-catalog";
import { useExploration } from "../src/stars/exploration-scope";
import { useBlackHoleJourney } from "../src/stars/black-hole-journey";
import { useNebulaJourney } from "../src/stars/nebula-journey";
import { useStore } from "../src/stars/store";

import { OBSERVED_VISUAL_PROFILES } from "../src/stars/observed-object-visuals";

for (const target of M31_TARGETS.filter((t) => t.model))
  assert.equal(OBSERVED_VISUAL_PROFILES[target.id].morphology, `m31-${target.model}`);

const original = {
  regimeName: "Solar System Scale",
  regimeSubtitle: "Heliocentric orbits",
  distanceLabel: "1 AU",
};
assert.equal(contextualScaleIndicator(original, "Milky Way", "inside", "Solar System"), original);
assert.equal(contextualScaleIndicator(original, "Andromeda (M31)", "outside", null), original);
const inside = contextualScaleIndicator(original, "Andromeda (M31)", "inside", "M31 PN1687");
assert.equal(inside.distanceLabel, "1 AU");
assert.equal(inside.regimeName, "Stellar System Scale");
assert.equal(inside.regimeSubtitle, "Andromeda (M31) · M31 PN1687");
assert(
  contextualScaleIndicator(original, "M33", "entering", null).regimeSubtitle.startsWith("M33"),
);
const sample = frameSummary([10, 10, 500], 520);
assert.equal(sample.p95FrameMs, 500);
assert.equal(sample.longestFrameMs, 500);
assert(Math.abs(sample.fps - 3000 / 520) < 1e-10); // Hitches are neither filtered nor hidden behind a 5-FPS floor.
assert.throws(() => frameSummary([], 100));
assert.throws(() => frameSummary([NaN], 100));
for (const factory of [
  () => {
    throw Error("canvas unavailable");
  },
  () => ({ getContext: () => null }) as unknown as HTMLCanvasElement,
]) {
  const texture = makeGlowTexture(factory) as THREE.DataTexture;
  assert.equal(texture.image.width, 64);
  assert.equal(texture.image.height, 64);
  assert(texture.image.data[(32 * 64 + 32) * 4 + 3] > texture.image.data[3]);
  texture.dispose();
}
const remote = "https://example.org/scientific-reference.png";
for (const qaBuild of [false, true])
  for (const hostname of ["localhost", "127.0.0.1", "ourvisibleuniverse.in"]) {
    const result = resolveReferenceImageURL(remote, { qaBuild, hostname, simulateFailure: true });
    assert.equal(
      result,
      qaBuild && hostname !== "ourvisibleuniverse.in" ? "/__local-qa/missing-nebula-image" : remote,
    );
    assert.equal(
      resolveReferenceImageURL(remote, { qaBuild, hostname, simulateFailure: false }),
      remote,
    );
  }
assert.equal(M31_TARGETS.length, 13);
const get = (id: string) => ANDROMEDA_OBJECTS.find((o) => o.id === id)!;
const sn = M31_TARGETS.find((t) => t.id === "m31-sn1885")!,
  nucleus = M31_TARGETS.find((t) => t.id === "m31-nucleus")!;
const xyzSN = new THREE.Vector3(...objectPosition(get(sn.id))),
  xyzNucleus = new THREE.Vector3(...objectPosition(get(nucleus.id)));
const rad = Math.PI / 180;
const angle = Math.acos(
  Math.sin(sn.dec * rad) * Math.sin(nucleus.dec * rad) +
    Math.cos(sn.dec * rad) * Math.cos(nucleus.dec * rad) * Math.cos((sn.ra - nucleus.ra) * rad),
);
const independentSeparation = 2 * 2537000 * Math.sin(angle / 2);
assert(Math.abs(xyzSN.distanceTo(xyzNucleus) - independentSeparation) < 0.01);
assert(xyzSN.distanceTo(xyzNucleus) > 170 && xyzSN.distanceTo(xyzNucleus) < 220);
assert(!get(sn.id).aliases.includes("M31N 1995-09b"));
assert(!M31_TARGETS.some((t) => t.aliases.includes("SDSO1")));
assert.equal(
  get("m31-d478").properties.some((p) => p.includes("not a measured cloud centroid")),
  true,
);
assert.equal(createTargetFromObservedObject(get("m31-ulx1")).type, "black_hole");
assert.equal(createTargetFromObservedObject(get("m31-ulx1")).massSolar, undefined);
assert.equal(createTargetFromObservedObject(get("m31-xb091d")).type, "pulsar");
const rows = galaxyEntries("Andromeda (M31)");
for (const [id, category] of [
  ["m31-pn1687", "nebula"],
  ["m31-sn1885", "remnant"],
  ["m31-xb091d", "remnant"],
  ["m31-ulx1", "black_hole"],
  ["m31-nucleus", "black_hole"],
])
  assert(
    matchesExplorerCategory(
      rows.find((r) => r.id === id)!,
      category,
    ),
  );
useExploration.setState({ phase: "inside", galaxy: "Andromeda (M31)" });
useStore.setState({ selectedObjectId: "m31-pn1687" });
useBlackHoleJourney.setState({ mode: "paused", id: "m31-nucleus" });
useNebulaJourney.setState({ mode: "paused", id: "m42" });
assert(returnToGalaxyOverview("Andromeda (M31)", 1280, 720));
assert.equal(useBlackHoleJourney.getState().mode, "idle");
assert.equal(useNebulaJourney.getState().mode, "idle");
assert.equal(useStore.getState().visitGalaxy!.view, undefined);
assert.equal(useStore.getState().visitGalaxy!.focus!.distance, useStore.getState().flyTo!.distance);
assert.equal(useStore.getState().selectedObjectId, null);
assert.equal(useExploration.getState().phase, "inside");
assert.equal(useExploration.getState().galaxy, "Andromeda (M31)");
assert(useStore.getState().flyTo!.distance > 200000);
assert(galaxyOverviewDistance(220000, 390, 844) > galaxyOverviewDistance(220000, 1280, 720));
const previous = useStore.getState().flyTo;
assert.equal(returnToGalaxyOverview("Milky Way"), false);
assert.equal(useStore.getState().flyTo, previous);
useExploration.setState({ phase: "outside", galaxy: null });
assert.equal(returnToGalaxyOverview("Andromeda (M31)"), false);
assert(M31_GAS_VERTEX.includes("#include <logdepthbuf_vertex>"));
assert(M31_GAS_FRAGMENT.includes("#include <logdepthbuf_fragment>"));
for (const pulsar of [0, 1]) {
  const material = new THREE.ShaderMaterial({
    vertexShader: M31_DISK_VERTEX,
    fragmentShader: M31_DISK_FRAGMENT,
    uniforms: { uPulsar: { value: pulsar } },
  });
  assert.equal(material.uniforms.uPulsar.value, pulsar);
  assert(M31_DISK_VERTEX.includes("#include <logdepthbuf_vertex>"));
  assert(M31_DISK_FRAGMENT.includes("#include <logdepthbuf_fragment>"));
  material.dispose();
}
for (const model of Object.keys(M31_GAS_KINDS)) {
  assert(M31_TARGETS.some((t) => t.model === model));
  const material = new THREE.ShaderMaterial({
    vertexShader: M31_GAS_VERTEX,
    fragmentShader: M31_GAS_FRAGMENT,
    uniforms: {
      uEye: { value: new THREE.Vector3() },
      uKind: { value: M31_GAS_KINDS[model as keyof typeof M31_GAS_KINDS] },
    },
  });
  assert(Number.isFinite(material.uniforms.uKind.value));
  material.dispose();
}
console.log(
  "PASS: contextual HUD, unbiased frame summaries, canvas failure fallback, production fault isolation, nuclear registration, compact-source uncertainty and gas material initialization",
);
