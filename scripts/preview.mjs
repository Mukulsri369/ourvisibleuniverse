// Run the real built Worker in local workerd; never deploy or create remote bindings.
import { unstable_dev } from "wrangler";
import { resolve, dirname } from "node:path";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
const root = resolve(import.meta.dirname, "..");
const config = resolve(root, "dist/server/wrangler.json");
let built;
try { built = JSON.parse(await readFile(config, "utf8")); }
catch { throw new Error("No Cloudflare build found. Run npm run build first."); }
const args = process.argv.slice(2);
const value = (flag, fallback) => { const i = args.indexOf(flag); return i < 0 ? fallback : args[i + 1]; };
const port = Number(value("--port", process.env.PORT || "31751"));
const host = value("--host", "127.0.0.1");
if (!Number.isInteger(port) || port < 1 || port > 65535 || !["127.0.0.1", "localhost"].includes(host)) throw new Error("Preview requires a valid port and loopback host.");
// Allow only this application's environment; secrets stay in memory, outside build artifacts.
const names = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "CERTIFICATE_SIGNING_SECRET", "RAZORPAY_MODE", "RAZORPAY_TEST_KEY_ID", "RAZORPAY_TEST_KEY_SECRET", "RAZORPAY_TEST_WEBHOOK_SECRET", "OVU_CRON_SECRET", "OVU_CRON_SECRET_PREVIOUS"];
const vars = Object.fromEntries(names.filter(name => process.env[name]).map(name => [name, process.env[name]]));
vars.RAZORPAY_MODE = "test";
vars.PUBLIC_APP_ORIGIN = `http://${host}:${port}`;
const worker = await unstable_dev(resolve(dirname(config), built.main), { config, ip: host, port, local: true, bundle: false, vars, persistTo: resolve(tmpdir(), "ovu-worker-preview", String(process.pid)), logLevel: "error", experimental: { disableExperimentalWarning: true, disableDevRegistry: true } });
console.log(`OVU built Worker ready at http://${host}:${worker.port}`);
let stopping = false;
async function stop() { if (stopping) return; stopping = true; await worker.stop(); process.exit(0); }
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
