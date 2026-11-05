import { reconciliationPlan, readCopyTables } from "./customer-reconciliation.mjs";
const target = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
async function main() {
  if (!process.argv.includes("--private-output"))
    throw new Error("Private output capture required");
  if (
    process.env.SUPABASE_URL !== target ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_")
  )
    throw new Error("Target configuration missing");
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const sql = Buffer.concat(chunks).toString("utf8");
  async function get(path) {
    const response = await fetch(target + path, {
      headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error("Target read rejected");
    return response.json();
  }
  const users = [];
  for (let page = 1; ; page++) {
    if (page > 100) throw new Error("Pagination bound exceeded");
    const result = await get(`/auth/v1/admin/users?page=${page}&per_page=1000`);
    users.push(...result.users);
    if (result.users.length < 1000) break;
  }
  if (users.some(user => ["ovu_import_read_fixture", "ovu_import_hash_fixture", "ovu_migration_fixture"].some(key => user.app_metadata?.[key])))
    throw new Error("Wait for disposable QA fixture cleanup before capturing a customer baseline");
  const passes = await get("/rest/v1/access_passes?select=*&limit=1000");
  if (passes.length >= 1000) throw new Error("Target pass pagination requires expansion");
  const plan = reconciliationPlan(sql, users, passes);
  // Captured only by the DPAPI wrapper, never printed to the chat or committed.
  plan.targetSnapshot = { users, passes };
  const tables = readCopyTables(sql);
  plan.storageObjects = tables.get("storage.objects")?.rows.map(row => ({ bucket: row.bucket_id, name: row.name })) ?? [];
  plan.summary.exportBackupObjects = plan.storageObjects.filter(row => /^database_export_\d{2}_\d{2}_\d{2}$/.test(row.bucket) && /^ourvisibleuniverse_\d{6}\.backup$/.test(row.name)).length;
  process.stdout.write(JSON.stringify(plan));
}
main().catch(() => {
  console.error(
    "Read-only customer reconciliation failed; no private values logged and no writes performed.",
  );
  process.exitCode = 1;
});
