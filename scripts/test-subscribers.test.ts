import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test, after } from "node:test";
import { database, closeDatabase } from "../src/backend/db.server";
import {
  grantByEmail,
  readSubscribers,
  subscriptionAdminStatus,
} from "../src/backend/subscribers.server";
import type { Principal } from "../src/backend/authorization.server";

assert.equal(process.env.DB_HOST, "127.0.0.1");
assert.equal(process.env.DB_PORT, "3307");
assert.equal(process.env.DB_NAME, "ovu_main");
const users: string[] = [];
async function user(): Promise<Principal> {
  const id = randomUUID();
  users.push(id);
  const email = id + "@example.test";
  await database().execute(
    "INSERT INTO auth_user(id,name,email,emailVerified) VALUES(?,?,?,true)",
    [id, "Synthetic Subscriber Test", email],
  );
  return { id, email, emailVerified: true };
}
after(async () => {
  for (const id of users) {
    await database().execute("DELETE FROM admin_access_changes WHERE user_id=? OR actor_id=?", [
      id,
      id,
    ]);
    await database().execute("UPDATE access_passes SET parent_pass_id=NULL WHERE user_id=?", [id]);
    await database().execute("DELETE FROM access_passes WHERE user_id=?", [id]);
    await database().execute("DELETE FROM entitlement_locks WHERE user_id=?", [id]);
  }
  for (const id of users) await database().execute("DELETE FROM auth_user WHERE id=?", [id]);
  await closeDatabase();
});
test("subscriber listing and email grants require verified roles and preserve idempotency and search boundaries", async () => {
  const admin = await user(),
    member = await user();
  assert.equal(await subscriptionAdminStatus(member), false);
  await assert.rejects(readSubscribers(member, { environment: "sandbox" }), /Administrator/);
  await database().execute("INSERT INTO app_roles(user_id,role) VALUES(?,?)", [admin.id, "admin"]);
  assert.equal(await subscriptionAdminStatus(admin), true);
  const input = {
    email: member.email.toUpperCase(),
    days: 30,
    environment: "sandbox",
    reason: "Synthetic subscriber migration test",
    requestId: randomUUID(),
  };
  const first = await grantByEmail(admin, input);
  assert.deepEqual(await grantByEmail(admin, input), first);
  const result = await readSubscribers(admin, { environment: "sandbox", search: member.id });
  assert.equal(result.total, 1);
  assert.equal(result.users[0].user_id, member.id);
  assert.equal(result.users[0].has_access, true);
  assert.equal(result.users[0].source, "Admin grant");
  assert.equal((await readSubscribers(admin, { environment: "live", search: member.id })).total, 0);
  assert.equal(
    (await readSubscribers(admin, { environment: "sandbox", search: "%' OR 1=1 --" })).total,
    0,
  );
  await assert.rejects(
    grantByEmail(admin, {
      ...input,
      requestId: randomUUID(),
      email: randomUUID() + "@example.test",
    }),
    /verify their email/,
  );
  await database().execute(
    "UPDATE access_passes SET expires_at=TIMESTAMPADD(SECOND,-1,CURRENT_TIMESTAMP(6)) WHERE user_id=?",
    [member.id],
  );
  const expired = await readSubscribers(admin, {
    environment: "sandbox",
    search: member.id,
    status: "expired",
  });
  assert.equal(expired.total, 1);
  assert.equal(expired.users[0].has_access, false);
  assert.equal(
    (await readSubscribers(admin, { environment: "sandbox", search: member.id, status: "active" }))
      .total,
    0,
  );
  await database().execute("DELETE FROM app_roles WHERE user_id=?", [admin.id]);
  await assert.rejects(readSubscribers(admin, { environment: "sandbox" }), /Administrator/);
});
