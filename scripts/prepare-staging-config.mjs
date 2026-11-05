import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const stagingWorkerName = "ovu-supabase-staging";
const project = "https://pdvwkdggyyrfkoqrpbji.supabase.co";
/** Pure local preparation. It does not log in, upload, change billing or set secrets. */
export function stagingConfiguration(built, { accountId, origin, publishableKey, plan, readImportedLiveAccess = false }) {
  if (!/^[a-f0-9]{32}$/.test(accountId ?? "")) throw new Error("Verify the intended Cloudflare account ID first.");
  const url = new URL(origin);
  if (typeof readImportedLiveAccess !== "boolean") throw new Error("Historical entitlement read selection must be explicit");
  if (readImportedLiveAccess && url.origin !== "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev") throw new Error("Historical live-access reads are limited to the approved staging origin");
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash ||
    !/^ovu-supabase-staging\.[a-z0-9-]+\.workers\.dev$/.test(url.hostname)) throw new Error("Only the approved temporary staging Worker origin is allowed.");
  if (built.vars?.SUPABASE_URL !== project) throw new Error("Wrong Supabase project in build.");
  if (!publishableKey?.startsWith("sb_publishable_")) throw new Error("Supply the owned project's public publishable key privately through the existing wrapper.");
  if (!["free", "paid"].includes(plan)) throw new Error("Verify the existing account plan; this script cannot purchase or upgrade it.");
  if (built.routes?.length || built.route || built.triggers?.crons?.length) throw new Error("Do not inherit domain routes or scheduled jobs into staging.");
  return { ...built, name: stagingWorkerName, topLevelName: stagingWorkerName, account_id: accountId, workers_dev: true, preview_urls: false,
    routes: [], triggers: {}, limits: plan === "paid" ? { cpu_ms: 1000 } : undefined,
    vars: { SUPABASE_URL: project, SUPABASE_PUBLISHABLE_KEY: publishableKey,
      PUBLIC_APP_ORIGIN: url.origin, OVU_DEPLOYMENT_STAGE: "staging", RAZORPAY_MODE: "test",
      ...(readImportedLiveAccess ? { OVU_ACCESS_ENVIRONMENT: "live" } : {}) } };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const arg = flag => process.argv[process.argv.indexOf(flag) + 1];
  if (!["--account-id", "--origin", "--existing-plan"].every(flag => process.argv.includes(flag))) throw new Error("Provide verified --account-id, --origin and --existing-plan (free or paid). No remote changes are performed.");
  const file = resolve(import.meta.dirname, "../dist/server/wrangler.json");
  const built = JSON.parse(await readFile(file, "utf8"));
  const prepared = stagingConfiguration(built, { accountId: arg("--account-id"), origin: arg("--origin"),
    plan: arg("--existing-plan"), publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
    readImportedLiveAccess: process.argv.includes("--read-imported-live-access") });
  // Same directory keeps generated module/asset paths relative to the actual build.
  await writeFile(resolve(import.meta.dirname, "../dist/server/wrangler.staging.json"), JSON.stringify(prepared, null, 2));
  console.log("Prepared staging-only configuration locally; no upload, secrets or billing change performed.");
}
