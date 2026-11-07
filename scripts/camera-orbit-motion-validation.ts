import assert from "node:assert/strict";
import {
  advanceCameraAngles,
  ManualCameraRotation,
  PointerDragClickGuard,
} from "../src/stars/camera-orbit-motion";

for (const hz of [30, 60, 120]) {
  const input = new ManualCameraRotation();
  const current = { radius: 1e8, theta: 0, phi: 1 };
  const requested = { theta: 0, phi: 1 };
  for (let frame = 1; frame <= hz; frame++) {
    // Several mouse/touch events can arrive before a display frame. Only their
    // latest orientation needs to be presented; the handler need not render.
    for (let event = 1; event <= 4; event++) {
      requested.theta = (-(frame - 1 + event / 4) * 0.8) / hz;
      requested.phi = 1 + ((frame - 1 + event / 4) * 0.2) / hz;
      input.record(requested);
    }
    advanceCameraAngles(current, requested, 6.5, 1 / hz, input.consume(requested));
    assert.equal(current.theta, requested.theta, `Horizontal input must not trail at ${hz} Hz`);
    assert.equal(current.phi, requested.phi, `Vertical input must not trail at ${hz} Hz`);
    assert.equal(current.radius, 1e8, "Orbit input cannot change zoom");
  }

  // Pointerup may occur before the frame that consumes this final move. Pending
  // input survives release and is consumed exactly once, without a drifting tail.
  requested.theta -= 0.01;
  requested.phi += 0.02;
  input.record(requested);
  assert(input.consume(requested), "The final pre-release move must be available");
  advanceCameraAngles(current, requested, 6.5, 1 / hz, true);
  for (let frame = 0; frame < hz; frame++) {
    assert.equal(input.consume(requested), false);
    advanceCameraAngles(current, requested, 6.5, 1 / hz, false);
    assert.deepEqual(current, { radius: 1e8, ...requested }, "Release cannot introduce inertia");
  }
}

for (const response of [6.5, 12]) {
  const results = [];
  for (const hz of [30, 60, 120]) {
    const current = { theta: -1, phi: 0.2 };
    const requested = { theta: 2, phi: 2.8 };
    for (let frame = 0; frame < hz; frame++)
      advanceCameraAngles(current, requested, response, 1 / hz, false);
    assert(Math.abs(current.theta - (2 - 3 * Math.exp(-response))) < 1e-12);
    assert(Math.abs(current.phi - (2.8 - 2.6 * Math.exp(-response))) < 1e-12);
    results.push(current.theta);
  }
  assert(
    Math.max(...results) - Math.min(...results) < 1e-12,
    "Automated easing is frame independent",
  );
}

const input = new ManualCameraRotation();
const requested = { theta: 0.5, phi: 1.5 };
input.record(requested);
requested.theta = 2;
const current = { theta: 0, phi: 1 };
advanceCameraAngles(current, requested, 6.5, 1 / 60, input.consume(requested));
assert(current.theta > 0 && current.theta < requested.theta, "Explicit navigation retains easing");
const paused = { ...current };
advanceCameraAngles(current, requested, 6.5, -1, false);
assert.deepEqual(current, paused, "A nonpositive simulation step cannot advance automated motion");

const clicks = new PointerDragClickGuard();
clicks.begin(1, 100, 100);
clicks.move(1, 240, 180);
clicks.move(1, 100, 100);
clicks.end(1);
assert(
  clicks.consumeClick(),
  "A closed-loop orbit drag cannot select the galaxy under its end point",
);
assert.equal(clicks.consumeClick(), false, "Click suppression is consumed once");

clicks.begin(1, 100, 100);
clicks.move(1, 102, 101);
clicks.end(1);
assert.equal(clicks.consumeClick(), false, "A true click permits a small amount of pointer jitter");

clicks.begin(2, 100, 100);
for (const x of [102, 100, 102, 100]) clicks.move(2, x, 100);
clicks.end(2);
assert(clicks.consumeClick(), "Cumulative movement counts even when maximum displacement is small");

clicks.begin(3, 100, 100);
clicks.move(99, 1000, 1000);
clicks.end(3);
assert.equal(clicks.consumeClick(), false, "Another pointer cannot convert a click into a drag");

clicks.begin(4, 100, 100);
clicks.move(4, 200, 200);
clicks.cancel();
clicks.end(4);
assert.equal(clicks.consumeClick(), false, "Pointer cancellation clears stale suppression");
clicks.begin(5, 100, 100);
clicks.move(5, 200, 200);
clicks.end(5);
clicks.begin(6, 100, 100);
clicks.end(6);
assert.equal(clicks.consumeClick(), false, "A new true click clears an unconsumed prior drag");

clicks.begin(7, 100, 100);
clicks.begin(8, 110, 100);
clicks.end(7);
clicks.end(8);
assert(clicks.consumeClick(), "A two-finger gesture must not generate a galaxy selection");

console.log(
  "PASS: direct 30/60/120-Hz orbit, final pointer moves, eased navigation ownership and closed-loop drag click suppression",
);
