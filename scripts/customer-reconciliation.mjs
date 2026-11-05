// Parse data only. Never execute statements from an exported database.
import { createHash } from "node:crypto";
export function decodeCopyValue(value) {
  if (value === "\\N") return null;
  return value.replace(/\\([0-7]{1,3}|x[0-9a-fA-F]{1,2}|.)/g, (_match, escaped) => {
    if (/^[0-7]+$/.test(escaped)) return String.fromCharCode(parseInt(escaped, 8));
    if (/^x[0-9a-f]+$/i.test(escaped)) return String.fromCharCode(parseInt(escaped.slice(1), 16));
    return { t: "\t", n: "\n", r: "\r", b: "\b", f: "\f", v: "\v", "\\": "\\" }[escaped] ?? escaped;
  });
}
export function readCopyTables(sql) {
  const tables = new Map();
  let current;
  for (const line of sql.split(/\r?\n/)) {
    if (current) {
      if (line === "\\.") {
        current = undefined;
        continue;
      }
      const values = line.split("\t");
      if (values.length !== current.columns.length) throw new Error("Malformed COPY row");
      current.rows.push(
        Object.fromEntries(
          current.columns.map((column, index) => [column, decodeCopyValue(values[index])]),
        ),
      );
      continue;
    }
    const match = line.match(/^COPY ([\w".]+) \(([^)]+)\) FROM stdin;$/);
    if (match) {
      const name = match[1].replaceAll('"', "");
      if (tables.has(name)) throw new Error("Repeated COPY table");
      current = {
        columns: match[2].split(",").map((value) => value.trim().replaceAll('"', "")),
        rows: [],
      };
      tables.set(name, current);
    }
  }
  if (current) throw new Error("Truncated COPY data");
  return tables;
}
const normalizedEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");
function timestampKey(value) {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) return null;
  const fraction = String(value).match(/\.(\d+)(?=Z|[+-])/i)?.[1] ?? "";
  if (fraction.length > 6) return null;
  return (BigInt(milliseconds) * 1000n + BigInt(fraction.slice(3).padEnd(3, "0"))).toString();
}
const validId = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value ?? "");
const confirmed = (user) =>
  !!user.email_confirmed_at && Number.isFinite(Date.parse(user.email_confirmed_at));
export function reconciliationPlan(sql, targetUsers, targetPasses, now = new Date()) {
  const tables = readCopyTables(sql);
  const sourceUsers = tables.get("auth.users")?.rows;
  const sourcePasses = tables.get("public.access_passes")?.rows;
  if (!sourceUsers || !sourcePasses) throw new Error("Required source tables absent");
  const conflicts = [],
    mappings = [],
    seenEmails = new Set(),
    seenIds = new Set();
  const targetEmail = new Map(),
    targetId = new Map();
  for (const user of targetUsers) {
    const email = normalizedEmail(user.email);
    if (email && targetEmail.has(email)) throw new Error("Ambiguous target identity");
    if (email) targetEmail.set(email, user);
    targetId.set(user.id, user);
  }
  for (const user of sourceUsers) {
    const email = normalizedEmail(user.email),
      id = user.id;
    const conflict = (reason) => conflicts.push({ kind: "identity", sourceId: id, reason });
    if (!validId(id) || seenIds.has(id)) {
      conflict("invalid-or-duplicate-id");
      continue;
    }
    seenIds.add(id);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || seenEmails.has(email)) {
      conflict("missing-invalid-or-duplicate-email");
      continue;
    }
    seenEmails.add(email);
    if (user.deleted_at || user.is_anonymous === "t" || user.is_sso_user === "t") {
      conflict("deleted-anonymous-or-sso-requires-review");
      continue;
    }
    if (user.banned_until && Date.parse(user.banned_until) > now.getTime()) {
      conflict("source-account-is-banned");
      continue;
    }
    const sameId = targetId.get(id),
      sameEmail = targetEmail.get(email);
    if (sameId && normalizedEmail(sameId.email) !== email) {
      conflict("source-id-owned-by-different-target-email");
      continue;
    }
    const match = sameEmail ?? sameId;
    const resumableImport =
      match?.id === id &&
      match.app_metadata?.ovu_migration?.source === "ovu-lovable-cloud" &&
      match.app_metadata.ovu_migration.sourceUserId === id;
    if (match && !resumableImport && (!confirmed(user) || !confirmed(match))) {
      conflict("existing-match-not-verified-on-both-sides");
      continue;
    }
    mappings.push({
      sourceId: id,
      targetId: match?.id ?? id,
      email,
      sourceEmailConfirmed: confirmed(user),
      action: match ? "preserve-existing-account" : "create-original-id",
      hasPasswordHash: !!user.encrypted_password,
      sourceCreatedAt: user.created_at,
      targetAdministratorUnchanged: true,
    });
  }
  const mapped = new Map(mappings.map((row) => [row.sourceId, row])),
    seenReferences = new Set();
  const passes = [];
  for (const source of sourcePasses) {
    const conflict = (reason) => conflicts.push({ kind: "access", sourceId: source.id, reason });
    const owner = mapped.get(source.user_id);
    if (!owner) {
      conflict("missing-unambiguous-identity-mapping");
      continue;
    }
    if (!owner.sourceEmailConfirmed) {
      conflict("access-owner-email-unverified");
      continue;
    }
    const reference = `${source.environment}:${source.payment_session_id}`;
    if (
      !validId(source.id) ||
      !["sandbox", "live"].includes(source.environment) ||
      !["active", "expired", "refunded", "failed"].includes(source.status) ||
      ![30, 180, 365].includes(Number(source.access_days)) ||
      !source.payment_session_id ||
      seenReferences.has(reference) ||
      !["starts_at", "expires_at", "created_at", "updated_at"].every((key) =>
        Number.isFinite(Date.parse(source[key])),
      ) ||
      Date.parse(source.expires_at) <= Date.parse(source.starts_at)
    ) {
      conflict("invalid-or-duplicate-access-record");
      continue;
    }
    seenReferences.add(reference);
    const row = { ...source, user_id: owner.targetId, access_days: Number(source.access_days) };
    const existing = targetPasses.find(
      (pass) =>
        pass.id === row.id ||
        (pass.environment === row.environment &&
          pass.payment_session_id === row.payment_session_id),
    );
    if (existing) {
      const differs = Object.keys(row).some((key) =>
        key.endsWith("_at")
          ? timestampKey(existing[key]) !== timestampKey(row[key])
          : existing[key] !== row[key],
      );
      if (differs) {
        conflict("existing-target-access-record-differs");
        continue;
      }
    }
    passes.push({
      sourceId: source.id,
      targetUserId: owner.targetId,
      action: existing ? "preserve-identical-record" : "insert-exact-history",
      currentlyWithinPeriod:
        source.status === "active" &&
        Date.parse(source.starts_at) <= now.getTime() &&
        Date.parse(source.expires_at) > now.getTime(),
      record: row,
    });
  }
  const publicTables = [...tables]
    .filter(([name]) => name.startsWith("public."))
    .map(([name, value]) => ({ name, rows: value.rows.length }));
  const unhandledPublicTables = publicTables.filter(
    (table) => table.name !== "public.access_passes" && table.rows > 0,
  );
  return {
    mode: "read-only-dry-run",
    sourceSqlSha256: createHash("sha256").update(sql).digest("hex"),
    preparedAt: now.toISOString(),
    mappings,
    passes,
    conflicts,
    publicTables,
    unhandledPublicTables,
    summary: {
      sourceUsers: sourceUsers.length,
      existingTargetUsers: targetUsers.length,
      newAccounts: mappings.filter((row) => row.action === "create-original-id").length,
      preservedAccounts: mappings.filter((row) => row.action === "preserve-existing-account")
        .length,
      sourceAccessRecords: sourcePasses.length,
      liveAccessRecords: passes.filter((row) => row.record.environment === "live").length,
      sandboxAccessRecords: passes.filter((row) => row.record.environment === "sandbox").length,
      linkedLiveCustomers: new Set(
        passes.filter((row) => row.record.environment === "live").map((row) => row.targetUserId),
      ).size,
      withinPeriodLiveRecords: passes.filter(
        (row) => row.record.environment === "live" && row.currentlyWithinPeriod,
      ).length,
      conflicts: conflicts.length,
      unhandledPublicTables: unhandledPublicTables.length,
      sourceStorageObjects: tables.get("storage.objects")?.rows.length ?? 0,
      sourceStorageBuckets: tables.get("storage.buckets")?.rows.length ?? 0,
      writesPerformed: 0,
    },
  };
}
