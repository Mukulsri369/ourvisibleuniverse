import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function testPaymentSecretPayload(config, environment) {
  if (config.name !== "ovu-supabase-staging" || config.account_id !== "bd0819150e88cf64f97548038790d560" ||
    config.vars?.PUBLIC_APP_ORIGIN !== "https://ovu-supabase-staging.mukul-srivastava-025.workers.dev" ||
    config.vars?.SUPABASE_URL !== "https://pdvwkdggyyrfkoqrpbji.supabase.co" || config.vars?.RAZORPAY_MODE !== "test" ||
    config.workers_dev !== true || config.preview_urls !== false || config.routes?.length || config.route || config.triggers?.crons?.length)
    throw new Error("Test payment secrets are limited to the approved staging Worker");
  const { RAZORPAY_TEST_KEY_ID: id, RAZORPAY_TEST_KEY_SECRET: secret, RAZORPAY_TEST_WEBHOOK_SECRET: webhook } = environment;
  if (!/^rzp_test_[A-Za-z0-9]+$/.test(id ?? "") || typeof secret !== "string" || secret.length < 16 || secret.length > 256 || /\s/.test(secret) ||
    typeof webhook !== "string" || webhook.length < 32 || webhook.length > 256)
    throw new Error("Privately configure a valid Test Mode key pair and strong separate webhook secret");
  if (webhook === secret) throw new Error("Use a separate webhook secret, not the API secret");
  return { RAZORPAY_TEST_KEY_ID: id, RAZORPAY_TEST_KEY_SECRET: secret, RAZORPAY_TEST_WEBHOOK_SECRET: webhook };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve(import.meta.dirname, ".."), configPath = resolve(root, "dist/server/wrangler.staging.json");
  const payload = testPaymentSecretPayload(JSON.parse(await readFile(configPath, "utf8")), process.env);
  const child = spawn(process.execPath, [resolve(root, "node_modules/wrangler/bin/wrangler.js"), "secret", "bulk", "--config", configPath, "--name", "ovu-supabase-staging"],
    { cwd: root, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
  let output = "";
  child.stdout.on("data", data => { output += data; }); child.stderr.on("data", data => { output += data; });
  child.stdin.on("error", () => {}); child.stdin.end(JSON.stringify(payload));
  const status = await new Promise((done, reject) => { child.once("error", reject); child.once("close", done); });
  for (const value of Object.values(payload)) output = output.replaceAll(value, "[PRIVATE TEST VALUE REDACTED]");
  console.log(output);
  if (status !== 0) throw new Error("Cloudflare did not confirm Test payment secret provisioning");
  console.log("Three Test payment bindings configured on the approved staging Worker; no Live keys supplied.");
}
