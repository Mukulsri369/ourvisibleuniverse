import assert from "node:assert/strict";
import { test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  passwordRecoveryCallback,
  passwordRecoveryError,
  updateRecoveryPassword,
} from "../src/lib/password-recovery";
type Auth = SupabaseClient["auth"];
function fixture() {
  let current = "owner-a";
  const calls: string[] = [];
  const source = {
    getUser: async () => ({ data: { user: { id: current } }, error: null }),
    getSession: async () => ({
      data: {
        session: {
          user: { id: current },
          access_token: "synthetic-access",
          refresh_token: "synthetic-refresh",
        },
      },
      error: null,
    }),
  };
  const isolated = {
    setSession: async () => {
      calls.push("bind");
      return { data: { user: { id: "owner-a" } }, error: null };
    },
    getUser: async () => ({ data: { user: { id: "owner-a" } }, error: null }),
    updateUser: async () => {
      calls.push("update-owner-a");
      return { data: { user: { id: "owner-a" } }, error: null };
    },
  };
  return {
    source,
    isolated,
    calls,
    switchAccount: () => {
      current = "owner-b";
    },
  };
}
const auth = (value: unknown) => value as Auth;
test("recovery callbacks use the approved auth route on local and staging origins", () => {
  for (const origin of [
    "http://127.0.0.1:31751",
    "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev",
  ])
    assert.equal(passwordRecoveryCallback(origin), origin + "/auth-reset");
});
test("password validation preserves whitespace, checks confirmation and UTF-8 byte boundary", () => {
  assert.ok(passwordRecoveryError("short", "short"));
  assert.ok(passwordRecoveryError("long-enough-a", "long-enough-b"));
  assert.equal(passwordRecoveryError(" long-enough ", " long-enough "), null);
  assert.equal(passwordRecoveryError("x".repeat(72), "x".repeat(72)), null);
  assert.ok(passwordRecoveryError("é".repeat(37), "é".repeat(37)));
});
test("a verified recovery session updates the pinned identity using the normal Auth API", async () => {
  const f = fixture();
  await updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password");
  assert.deepEqual(f.calls, ["bind", "update-owner-a"]);
});
test("a different or signed-out identity cannot submit the old form", async () => {
  const f = fixture();
  f.switchAccount();
  await assert.rejects(
    updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password"),
  );
  assert.deepEqual(f.calls, []);
});
test("account change between identity verification and token snapshot fails closed", async () => {
  const f = fixture();
  const getUser = f.source.getUser;
  f.source.getUser = async () => {
    const result = await getUser();
    f.switchAccount();
    return result;
  };
  await assert.rejects(
    updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password"),
  );
  assert.deepEqual(f.calls, []);
});
test("an account change after binding never redirects the write to the new account", async () => {
  const f = fixture();
  const bind = f.isolated.setSession;
  f.isolated.setSession = async () => {
    const result = await bind();
    f.switchAccount();
    return result;
  };
  await updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password");
  assert.deepEqual(f.calls, ["bind", "update-owner-a"]);
});
test("invalid bound session and server verification denial cannot update a password", async () => {
  for (const method of ["setSession", "getUser"] as const) {
    const f = fixture();
    f.isolated[method] = async () => {
      if (method === "setSession") f.calls.push("bind");
      return { data: { user: { id: "owner-b" } }, error: null };
    };
    await assert.rejects(
      updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password"),
    );
    assert.deepEqual(f.calls, ["bind"]);
  }
});
test("provider password rejection is not reported as success", async () => {
  const f = fixture();
  f.isolated.updateUser = async () => {
    throw new Error("synthetic provider rejection");
  };
  await assert.rejects(
    updateRecoveryPassword(auth(f.source), auth(f.isolated), "owner-a", "synthetic-password"),
    /provider rejection/,
  );
});
