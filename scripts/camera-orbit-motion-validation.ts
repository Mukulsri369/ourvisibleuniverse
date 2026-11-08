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
    advanceCameraAngles(current, requested, 6.5, 1 / hz, input.consume(requested, current));
    assert(
      Math.abs(current.theta - requested.theta) / 0.8 < 0.025,
      `Manual response must stay below 25ms at ${hz}Hz`,
    );
    assert(
      current.theta >= requested.theta && current.phi <= requested.phi,
      "No extrapolation beyond the mouse target",
    );
    assert.equal(current.radius, 1e8, "Orbit input cannot change zoom");
  }

  // A final pre-release move survives release and settles promptly, without
  // snapping on pointerup or introducing unbounded angular inertia.
  requested.theta -= 0.01;
  requested.phi += 0.02;
  input.record(requested);
  assert(input.consume(requested, current), "The final pre-release move must be available");
  for (let frame = 0; frame < hz / 2; frame++) {
    advanceCameraAngles(current, requested, 6.5, 1 / hz, input.consume(requested, current));
  }
  assert.deepEqual(
    current,
    { radius: 1e8, ...requested },
    "Settling ends at the exact requested heading",
  );
  assert.equal(input.consume(requested, current), false, "No continuing post-release drift");

  const sparse = new ManualCameraRotation(),
    pose = { theta: 0, phi: 1 },
    goal = { theta: 0, phi: 1 };
  let packet = 0,
    held = 0;
  for (let frame = 1; frame <= hz; frame++) {
    const next = Math.floor((frame / hz) * 20);
    if (next !== packet) {
      packet = next;
      goal.theta = -packet * 0.02;
      sparse.record(goal);
    }
    const before = pose.theta;
    advanceCameraAngles(pose, goal, 6.5, 1 / hz, sparse.consume(goal, pose));
    if (frame > hz * 0.2 && pose.theta === before) held++;
  }
  assert.equal(held, 0, `${hz}Hz rendering must not hold still between 20Hz pointer packets`);
  const step = { theta: 0, phi: 1 },
    end = { theta: 1, phi: 1 };
  for (let frame = 0; frame < Math.ceil(hz * 0.065); frame++)
    advanceCameraAngles(step, end, 6.5, 1 / hz, true);
  assert(step.theta > 0.95 && step.theta <= 1, `Manual input reaches 95% within 70ms at ${hz}Hz`);
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
advanceCameraAngles(current, requested, 6.5, 1 / 60, input.consume(requested, current));
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
  "PASS: smooth 30/60/120-Hz orbit between sparse mouse packets, short settling, navigation ownership and drag click suppression",
);
