import test from "node:test";
import assert from "node:assert/strict";
import { razorpayRequest } from "../src/lib/razorpay.server";

test("Worker payment requests use manual redirects and reject redirected provider responses", async () => {
  const originalFetch = globalThis.fetch;
  const oldId = process.env.RAZORPAY_TEST_KEY_ID;
  const oldSecret = process.env.RAZORPAY_TEST_KEY_SECRET;
  process.env.RAZORPAY_TEST_KEY_ID = "rzp_test_synthetic";
  process.env.RAZORPAY_TEST_KEY_SECRET = "synthetic-only";
  let status = 200;
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    assert.equal(String(url), "https://api.razorpay.com/v1/orders");
    assert.equal(init?.redirect, "manual");
    return new Response(status === 200 ? '{"id":"synthetic_order"}' : "redirected", {
      status, headers: status === 200 ? {} : { Location: "https://untrusted.invalid/" },
    });
  };
  try {
    assert.deepEqual(await razorpayRequest("/orders", { method: "POST" }, "test"), { id: "synthetic_order" });
    for (status of [301, 302, 303, 307, 308]) {
      await assert.rejects(razorpayRequest("/orders", { method: "POST" }, "test"), new RegExp(`status ${status}`));
    }
    assert.equal(calls, 6);
  } finally {
    globalThis.fetch = originalFetch;
    if (oldId === undefined) delete process.env.RAZORPAY_TEST_KEY_ID; else process.env.RAZORPAY_TEST_KEY_ID = oldId;
    if (oldSecret === undefined) delete process.env.RAZORPAY_TEST_KEY_SECRET; else process.env.RAZORPAY_TEST_KEY_SECRET = oldSecret;
  }
});
