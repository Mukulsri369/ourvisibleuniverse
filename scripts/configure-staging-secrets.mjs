import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Keys go to the approved staging Worker over stdin, never argv or plaintext files. */
export function stagingSecretPayload(config, environment) {
  if (config.name !== "ovu-supabase-staging" || config.account_id !== "bd0819150e88cf64f97548038790d560" ||
    config.vars?.PUBLIC_APP_ORIGIN !== "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev" ||
    config.vars?.SUPABASE_URL !== "https://pdvwkdggyyrfkoqrpbji.supabase.co" ||
    environment.SUPABASE_URL !== config.vars.SUPABASE_URL || config.vars.RAZORPAY_MODE !== "test" ||
    config.workers_dev !== true || config.preview_urls !== false || config.routes?.length) throw new Error("Refusing secrets outside the approved OVU staging destination.");
  if (!environment.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_secret_") || (environment.CERTIFICATE_SIGNING_SECRET?.length ?? 0) < 32)
    throw new Error("Required private staging bindings are unavailable.");
  return { SUPABASE_SERVICE_ROLE_KEY: environment.SUPABASE_SERVICE_ROLE_KEY,
    CERTIFICATE_SIGNING_SECRET: environment.CERTIFICATE_SIGNING_SECRET };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(import.meta.dirname, ".."), configPath = resolve(root, "dist/server/wrangler.staging.json");
  const payload = stagingSecretPayload(JSON.parse(await readFile(configPath, "utf8")), process.env);
  const child = spawn(process.execPath, [resolve(root, "node_modules/wrangler/bin/wrangler.js"), "secret", "bulk", "--config", configPath, "--name", "ovu-supabase-staging"],
    { cwd: root, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  let output = "";
  child.stdout.on("data", data => { output += data; }); child.stderr.on("data", data => { output += data; });
  child.stdin.on("error", () => {});
  child.stdin.end(JSON.stringify(payload));
  const status = await new Promise((done, reject) => { child.once("error", reject); child.once("close", done); });
  for (const value of Object.values(payload)) output = output.replaceAll(value, "[PRIVATE VALUE REDACTED]");
  console.log(output);
  if (status !== 0) throw new Error("Cloudflare did not confirm staging secret provisioning.");
  console.log("Staging-only private bindings provisioned through stdin; no payment keys supplied.");
}
