import assert from "node:assert/strict";
import { test } from "node:test";
import { getAccessEnvironment } from "../src/lib/access-environment.server";
import { stagingConfiguration } from "./prepare-staging-config.mjs";
const environment = {
  OVU_ACCESS_ENVIRONMENT: "live",
  OVU_DEPLOYMENT_STAGE: "staging",
  RAZORPAY_MODE: "test",
  PUBLIC_APP_ORIGIN: "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev",
  SUPABASE_URL: "https://pdvwkdggyyrfkoqrpbji.supabase.co",
};
test("ordinary payment/access isolation is preserved without an import-read override", () => {
  assert.equal(getAccessEnvironment({}), "sandbox");
  assert.equal(getAccessEnvironment({ RAZORPAY_MODE: "test" }), "sandbox");
  assert.equal(getAccessEnvironment({ RAZORPAY_MODE: "live" }), "live");
});
test("only exact approved staging can read historical live entitlements while payment mode remains test", () => {
  assert.equal(getAccessEnvironment(environment), "live");
  assert.equal(environment.RAZORPAY_MODE, "test");
  for (const key of Object.keys(environment))
    assert.throws(() => getAccessEnvironment({ ...environment, [key]: "wrong" }));
  assert.throws(() => getAccessEnvironment({ ...environment, OVU_DEPLOYMENT_STAGE: "production" }));
});
test("configuration opt-in does not copy provider keys, change payment mode or add domain routes", () => {
  const built = {
    main: "index.js",
    vars: {
      SUPABASE_URL: environment.SUPABASE_URL,
      RAZORPAY_LIVE_KEY_SECRET: "synthetic-never-copy",
    },
  };
  const options = {
    accountId: "bd0819150e88cf64f97548038790d560",
    origin: environment.PUBLIC_APP_ORIGIN,
    publishableKey: "sb_publishable_synthetic",
    plan: "free",
  };
  assert.equal(stagingConfiguration(built, options).vars.OVU_ACCESS_ENVIRONMENT, undefined);
  const result = stagingConfiguration(built, { ...options, readImportedLiveAccess: true });
  assert.equal(result.vars.OVU_ACCESS_ENVIRONMENT, "live");
  assert.equal(result.vars.RAZORPAY_MODE, "test");
  assert.equal(result.vars.RAZORPAY_LIVE_KEY_SECRET, undefined);
  assert.deepEqual(result.routes, []);
  assert.throws(() => stagingConfiguration(built, { ...options, readImportedLiveAccess: "true" }));
  assert.throws(() =>
    stagingConfiguration(built, {
      ...options,
      readImportedLiveAccess: true,
      origin: "https://ovu-supabase-staging.other.workers.dev",
    }),
  );
});
