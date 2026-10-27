import assert from "node:assert/strict";
import { OBSERVED_OBJECTS } from "../src/stars/observed-objects";
import {
  observedSoundProfile,
  worldSoundProfile,
  soundProfile,
} from "../src/stars/object-sound-profiles";

for (const item of OBSERVED_OBJECTS) {
  const profile = observedSoundProfile(item);
  assert.equal(profile.id, item.id);
  assert.deepEqual(profile, observedSoundProfile(item), "deterministic identity: " + item.id);
  assert(profile.explanation.length > 30 && profile.source.startsWith("https://"));
  for (const value of [profile.fundamental, profile.cutoff, profile.air, profile.drift])
    assert(Number.isFinite(value) && value > 0);
  if (profile.pulseHz) {
    assert.equal(profile.measuredPeriod, item.compactPhysics!.pulsarSpinPeriodSec);
    assert(profile.pulseHz > 0 && profile.pulseHz <= 32);
    assert(Math.abs(profile.pulseHz * profile.pulseDivisor! * profile.measuredPeriod! - 1) < 1e-10);
  } else assert.equal(profile.measuredPeriod, undefined, "no invented spin: " + item.id);
}
const byId = (id: string) => observedSoundProfile(OBSERVED_OBJECTS.find((o) => o.id === id)!);
assert.equal(byId("ton618").family, "quasar");
assert.equal(byId("vela").pulseHz, 1 / 0.08933);
assert.equal(byId("rx-j1856").measuredPeriod, undefined);
assert(byId("gaiabh1").air < byId("cygx1").air);
assert.equal(worldSoundProfile("Earth · Moon").family, "rock");
assert.equal(worldSoundProfile("Saturn · Titan").family, "atmosphere");
assert.equal(worldSoundProfile("Jupiter · Ganymede").family, "plasma");
assert.equal(worldSoundProfile("Proxima b", "Rocky world").family, "rock");
assert.equal(worldSoundProfile("Kepler b", "Hot Jupiter").family, "plasma");
assert.notEqual(soundProfile("a", "A", "galaxy").seed, soundProfile("b", "B", "galaxy").seed);
console.log(
  "PASS: all " +
    OBSERVED_OBJECTS.length +
    " observed objects, measured timing, source labels, deterministic sound identities, airless moons, atmospheric and plasma worlds.",
);
