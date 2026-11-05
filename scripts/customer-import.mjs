import assert from "node:assert/strict";
import { readCopyTables, reconciliationPlan } from "./customer-reconciliation.mjs";

export function accountImportPayload(source, mapping, provenance) {
  assert.equal(mapping.action, "create-original-id");
  assert.equal(mapping.targetId, source.id);
  const passwordHash = source.encrypted_password;
  // Fail before writes if an unsupported legacy credential requires another migration method.
  if (passwordHash && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash))
    throw new Error("Unsupported source password hash");
  if (source.phone) throw new Error("Phone identities require explicit reconciliation");
  const original = source.raw_user_meta_data ? JSON.parse(source.raw_user_meta_data) : {};
  if (!original || typeof original !== "object" || Array.isArray(original))
    throw new Error("Invalid source profile metadata");
  const metadata = {};
  for (const key of ["name", "full_name", "avatar_url", "picture"]) {
    if (typeof original[key] === "string" && original[key].length <= 2048)
      metadata[key] = original[key];
  }
  return {
    id: source.id,
    email: mapping.email,
    email_confirm: mapping.sourceEmailConfirmed,
    ...(passwordHash ? { password_hash: passwordHash } : {}),
    user_metadata: metadata,
    app_metadata: {
      ovu_migration: {
        source: "ovu-lovable-cloud",
        sourceUserId: source.id,
        sourceCreatedAt: source.created_at,
        ...provenance,
      },
    },
  };
}

/** Append-only transfer. No existing account update/delete or purchase-activation RPC. */
export async function importCustomers({
  sql,
  expectedSqlSha256,
  sourceCapturedAt,
  runId,
  api,
  now = new Date(),
  progress = async () => {},
}) {
  const age = now.getTime() - Date.parse(sourceCapturedAt);
  assert.ok(
    Number.isFinite(age) && age >= -300000 && age <= 86400000,
    "A verified current source snapshot is required",
  );
  const beforeUsers = await api.listUsers(),
    beforePasses = await api.listPasses();
  assert.ok(!beforeUsers.some(user => ["ovu_import_read_fixture", "ovu_import_hash_fixture", "ovu_migration_fixture"].some(key => user.app_metadata?.[key])),
    "Wait for disposable QA fixture cleanup before importing customers");
  const plan = reconciliationPlan(sql, beforeUsers, beforePasses, now);
  assert.equal(plan.sourceSqlSha256, expectedSqlSha256, "Source changed since private review");
  assert.equal(plan.conflicts.length, 0, "Resolve identity/access conflicts before importing");
  assert.equal(
    plan.unhandledPublicTables.length,
    0,
    "Additional public data requires a migration mapping",
  );
  const sourceUsers = new Map(
    readCopyTables(sql)
      .get("auth.users")
      .rows.map((user) => [user.id, user]),
  );
  const provenance = { runId, sourceCapturedAt, sourceSqlSha256: expectedSqlSha256 };
  // Validate every account payload before creating the first account.
  const creations = plan.mappings
    .filter((row) => row.action === "create-original-id")
    .map((mapping) => ({
      mapping,
      payload: accountImportPayload(sourceUsers.get(mapping.sourceId), mapping, provenance),
    }));
  const summary = {
    sourceUsers: plan.summary.sourceUsers,
    accountsCreated: 0,
    existingAccountsPreserved: beforeUsers.length,
    supportedPasswordHashesTransferred: 0,
    historicalPassesInserted: 0,
    existingPassesPreserved: beforePasses.length,
    livePasses: plan.summary.liveAccessRecords,
    sandboxPasses: plan.summary.sandboxAccessRecords,
    userEmailsSent: 0,
    providerPayments: 0,
    existingAccountsUpdated: 0,
    recordsDeleted: 0,
    completed: false,
  };
  await progress({ stage: "validated-before-writes", ...summary });
  for (const { mapping, payload } of creations) {
    const created = await api.createUser(payload);
    assert.equal(created.id, mapping.targetId, "Auth API did not preserve the intended identity");
    assert.equal(created.email?.toLowerCase(), mapping.email);
    assert.equal(
      !!created.email_confirmed_at,
      mapping.sourceEmailConfirmed,
      "Email verification status changed",
    );
    assert.equal(created.role, "authenticated");
    assert.equal(created.app_metadata?.ovu_migration?.sourceUserId, mapping.sourceId);
    summary.accountsCreated++;
    if (payload.password_hash) summary.supportedPasswordHashesTransferred++;
    await progress({ stage: "creating-accounts", ...summary });
  }
  const insertRows = plan.passes
    .filter((row) => row.action === "insert-exact-history")
    .map((row) => row.record);
  if (insertRows.length) {
    // PostgREST bulk INSERT is one database transaction; no ignore/merge/upsert behavior.
    await api.insertPasses(insertRows);
    summary.historicalPassesInserted = insertRows.length;
  }
  const afterUsers = await api.listUsers(),
    afterPasses = await api.listPasses();
  const after = reconciliationPlan(sql, afterUsers, afterPasses, now);
  assert.equal(after.conflicts.length, 0);
  assert.equal(after.summary.newAccounts, 0);
  assert.ok(after.passes.every((row) => row.action === "preserve-identical-record"));
  for (const prior of beforeUsers) {
    const preserved = afterUsers.find((user) => user.id === prior.id);
    assert.ok(preserved);
    for (const key of ["email", "role", "email_confirmed_at", "app_metadata", "user_metadata"])
      assert.deepEqual(preserved[key], prior[key], "An existing identity was changed");
  }
  for (const prior of beforePasses)
    assert.deepEqual(
      afterPasses.find((row) => row.id === prior.id),
      prior,
      "Existing access history was changed",
    );
  summary.completed = true;
  await progress({ stage: "verified", ...summary });
  return {
    runId,
    sourceCapturedAt,
    sourceSqlSha256: expectedSqlSha256,
    summary,
    mappings: after.mappings,
    accessRecords: after.passes.map((row) => row.record),
  };
}
