# OVU staging/deployment runbook

This is a prepared procedure, **not authorization to deploy**. Keep Lovable and production services running. The Store is out of scope.

1. Pin the reviewed commit on `migration/supabase-cloudflare`; preserve the production baseline and customer backup privately. Resolve the release gates in `CLOUDFLARE_READINESS_REPORT.md` before declaring complete migration.
2. Supply the approved project's public `VITE_SUPABASE_*` build variables through CI or an ignored local environment file. Never place server keys in `VITE_*`. The build guards the approved OVU project.
3. Run `npm ci`, `npm run test:mcp`, `npm run test:independence`, `npm run test:auth`, `npm test`, TypeScript and `npm run build`. Run `npm run test:preview` against the actual built Worker. Provider payment tests remain a separate authorization gate.
4. Run `wrangler deploy --dry-run --config dist/server/wrangler.json --outdir <private-evidence-directory>`. Scan client and server deployment artifacts for actual private credential values; never upload `.dev.vars`, `.env`, simulator state, customer exports or credential backups.
5. Configure the reviewed staging origin explicitly. Configure Worker secrets privately: server Supabase key, certificate signing key, approved Test Mode payment secrets when testing is authorized, and cron secrets only if a scheduled job is actually introduced. Public project key/URL and `PUBLIC_APP_ORIGIN` are ordinary bindings. No live payment keys are needed for current QA.
6. Review schema/RLS/admin privileges separately. Do not blindly apply the old admin migration or grant anyone access. The old customer backup must not be imported without approved identity/entitlement reconciliation.
7. Configure Supabase's Google redirects and optional MCP OAuth consent for the approved staging origin. Keep dynamic OAuth client registration disabled unless separately approved. Do not overwrite the live website's provider configuration.
8. Only after deployment approval, enable an approved staging route and deploy the **generated** `dist/server/wrangler.json` configuration. Keep production DNS unchanged. Validate platform startup, SSR/API routes, cookies/sessions, authorization, certificate signing, assets/mobile and resource consumption. Use a conservative CPU cost cap appropriate to the tested plan.
9. After separate payment-test approval, use Razorpay Test Mode to verify full checkout/webhook/idempotency/refund/recovery workflows. No successful build, fake request, or UI success state proves payment fulfillment.
10. Prepare final data synchronization and payment/write freeze/replay handling. Request separate approval for customer imports, live payment settings and DNS cutover. Lovable cancellation requires separate approval after production verification.

## Local private preview

`npm run preview` runs `scripts/preview.mjs`, which starts the built app in `workerd` on loopback. It accepts an allowlist of process environment bindings in memory and forces payment mode to `test`; it neither deploys nor creates remote resources. The workspace DPAPI wrapper can supply credentials without writing plaintext into source or build files. Do not use the legacy Nitro output directory.

## Existing certificates

New signing requires a private key of at least 32 characters. Do not replace an existing production key blindly. If earlier certificates were issued using the removed public fallback, identify them privately and obtain approval for reconciliation/reissue; never silently mark them secure or alter customer records.
