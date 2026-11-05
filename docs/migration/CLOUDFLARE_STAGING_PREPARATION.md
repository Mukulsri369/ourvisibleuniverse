# Approved staging preparation — 5 November 2026

The user explicitly approved temporary Cloudflare staging preparation and deployment, without purchases. No production domain, DNS, live payment, customer import/access or Lovable cancellation change is authorized. This approval persists; do not ask for it again.

The existing source `wrangler.jsonc` still disables `workers_dev` and preview URLs. `scripts/prepare-staging-config.mjs` prepares a separate ignored `dist/server/wrangler.staging.json` beside the generated build, preserving module/asset-relative paths. It performs no network or billing action. Before preparation, verify the intended account ID, existing plan and actual account subdomain.

The prepared configuration always uses `ovu-supabase-staging`, an exact HTTPS `ovu-supabase-staging.<account-subdomain>.workers.dev` origin, the owned Supabase project and test payment mode. It includes only explicit public/test bindings, no inherited secrets, production domain routes or scheduled jobs. A paid account receives a one-second request CPU cap; a free account retains platform limits. The script cannot purchase or upgrade a plan. Actual free-plan CPU suitability remains unproven. Check for an existing Worker of that name before upload; do not overwrite an unrelated app.

Example after actual account/plan/subdomain verification, through the existing private environment wrapper:

```text
node scripts/prepare-staging-config.mjs --account-id <verified-account-id> --origin https://ovu-supabase-staging.<verified-subdomain>.workers.dev --existing-plan free
```

The public publishable key comes from the existing wrapper environment. Never place private server/signing/Gemini/payment keys in command arguments, public configuration or Git. After authorization, private Worker bindings can be supplied through Wrangler's stdin-supported `secret bulk` flow, with exact staging Worker/account selection. No secrets have been uploaded.

`src/lib/deployment-headers.ts` adds `X-Robots-Tag: noindex, nofollow, noarchive` only to staging Worker responses. Ordinary local/production responses retain their original object/headers/stream. Status, cookies, redirects and body are preserved; existing route and asset handling remains intact. This is indexing control, not an authentication system. Static assets may be served directly by Cloudflare; no private files or customer exports belong in them.

Six staging checks passed: isolated configuration/permission boundaries and actual built SSR/no-index/404 handling. TypeScript and the Cloudflare build passed. The existing three real built-session tests still reject forged/body-only authority with HTTP 401. The full prior 24-module Supabase certification and sampled browser/mobile/science results remain recorded separately; these staging checks do not replace hosted validation.

The optional `@napi-rs/keyring@1.3.0` adapter was installed from npm globally with lifecycle scripts disabled so Wrangler can use Windows credential storage. Official login requested only `account:read`, `user:read`, `workers_scripts:write` and `workers_tail:read`; DNS-route/KV/storage-management scopes were omitted. The first secure authorization attempt timed out before a code was received. No Cloudflare authentication success, account/plan verification, upload, secret provisioning or deployment is claimed. The user has been asked to finish private sign-in; start a fresh authorization attempt when they confirm readiness. Do not inspect password fields while sign-in is pending.

After authentication, verify the account/plan/subdomain read-only, prepare/review the exact staging config and dry run, provision only staging bindings, deploy the approved temporary Worker, then test hosted startup/CPU/memory/SSR, sessions, authorization, certificates, mobile/scientific UI and logs. Exact new Supabase auth redirects/consent must be reviewed once the origin is known. Existing local Google/admin/OAuth setup is already approved and verified; preserve it. Actual Gemini/email behavior and historical data reconciliation remain outstanding. Razorpay provider tests remain deferred and unverified.
