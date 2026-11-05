# OVU staging/deployment runbook

## Current hosted payment-backend checkpoint — 6 November 2026

Application commit `b0f19ea` is deployed as Worker version `baed6c52-3612-4dc7-8217-fc8ddb3495e6`. Upload 15,924.84 KiB raw / 3,546.64 KiB gzip; reported startup 2 ms. The deployment retained test payment mode, historical live-entitlement reads and the two existing private Supabase/certificate bindings; Cloudflare secret-name inspection confirms no Razorpay bindings. Nine hosted privacy/route postflight checks passed after deployment. The existing administrator account page loaded correctly with its expected no-live-pass status and no recovery error; no pass or customer data was modified. Actual checkout, recovery with a provider payment, webhook delivery, and refund acceptance remain unverified.

The Live merchant's additional-website flow requires private two-step verification before its URL form. Preparation reached that prompt; an OTP was sent by Razorpay. The prompt was canceled without entering a code or submitting a website. No verification was bypassed. Additional staging website approval, Live key provisioning/activation and the new webhook remain approval gates. The webhook form is unsaved and has no secret. The original approved website, API pair, production site, DNS and Store remain unchanged. Three additional pure Live-configuration tests passed; the generated Live config remains local and undeployed.

## Payment backend verified; Live activation pending — 6 November 2026

The existing Live Razorpay pair is encrypted locally only; no upload, provider request, key rotation or checkout activation occurred. Migration 0012 is installed in the owned Supabase project with all six original entitlements preserved. 49 combined regressions, 2 real-HMAC unit tests, 27 rolled-back PostgreSQL assertions, 9 real Supabase/built-app checks (including restart and concurrent replay), TypeScript, build and 2 built SSR checks passed. Disposable fixtures were removed; existing customers and access records matched pre-test snapshots. Private-value artifact scans found zero matches. Provider payments remain unverified.

Read-only merchant inspection shows the original `.in` website approved and no configured Live webhook. The Workers staging address has not been approved; the separate webhook is unsaved. Live activation requires exact staging approval, private server bindings, `RAZORPAY_MODE=live` with the historical-read override removed, and approved webhook configuration. Production, Store, DNS, merchant configuration and billing are unchanged. See [RAZORPAY_MIGRATION_REPORT.md](RAZORPAY_MIGRATION_REPORT.md). Earlier Test-mode deferrals below are historical; the owner's current choice is reuse of the original Live pair without Test-key regeneration.

## Customer transfer completed — 5 November 2026

The authorized fresh snapshot (2026-11-05 14:15:21 UTC) is now imported into the owned Supabase project: 77 accounts created, one existing administrator account preserved (78 source users represented), nine supported password hashes transferred privately, and six exact historical access records inserted (five live / one sandbox). No existing accounts were patched/deleted and no emails/payments were sent. Repeat reconciliation finds zero missing accounts, zero access differences and zero conflicts.

Cloudflare staging version `44441fc7-f935-4acc-ac16-6ffe65fdbb4a` reads these live historical entitlements while payment mode remains test and payment keys remain absent. Its actual admin dashboard shows five live subscribers with active access. Anonymous data privacy, hosted authorization and route smoke checks passed. See [CUSTOMER_TRANSFER_RESULTS.md](CUSTOMER_TRANSFER_RESULTS.md) for actual evidence, source limitations, rollback and testing instructions.

Use the approved staging URL for owner testing. Original production/DNS/Store/live payment settings are unchanged. Later source writes are not automatically synchronized. Gemini, actual provider payments and email delivery/human recovery remain deferred; broader acceptance/capacity and final synchronization are still required before production cutover. Earlier no-import/no-authorization checkpoints below are historical.


## Current hosted staging checkpoint — 5 November 2026

OVU is deployed at https://ovu-supabase-staging.mukul-srivastava-025.workers.dev on the existing Workers Free plan. Active tested version: `e6abed40-270b-4c68-8547-828770f43554`; application build: `7f215f7`. Approved Supabase staging Site URL and auth redirect are saved; local auth redirect is retained. Actual hosted 24-module assessment/certificate API QA, Google sign-in, all four MCP tools, sampled admin/mobile/galaxy and paid-access-denial journeys passed. Seven staging checks, 21 security checks and TypeScript passed. Hosted retry testing does not constitute a forced platform restart.

Observed CPU P50 10.06 ms / P99 105 ms exceeds the nominal Free 10 ms budget despite zero observed resource errors; sustained production capacity is not verified. No purchase or upgrade occurred. Gemini and Razorpay provider testing are explicitly deferred and unverified. Email recovery, broader workflow testing and approved historical reconciliation remain outstanding. Production, Store, DNS, live payments and customer entitlements remain unchanged. See [HOSTED_STAGING_REPORT.md](HOSTED_STAGING_REPORT.md) for evidence and limits. Earlier checkpoint entries below describe historical state.


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

## Reviewed local administrator/OAuth installation (approved and applied)

Use the generated transaction from `scripts/admin-oauth-migration-bundle.mjs`, containing only 0006/0007, after reviewing ADMIN_OAUTH_REVIEW.md and obtaining the specific database/role/client approval. Preserve the private preflight snapshot and selected account metadata. Verify target integrity hashes and first-party session/RPC behavior after application. Create only the approved public loopback client with dynamic registration off, then hand off actual consent to the user before running `scripts/mcp-oauth-local-qa.mjs --client-id <public-client-id>`. Tokens stay in process memory. Run `npm run test:admin-oauth-db`, `npm run test:independence`, `npm run test:mcp` and `npm run test:built-session` against the rebuilt local Worker. No payment or customer entitlement changes are part of this procedure.

The reviewed 0006/0007 transaction, confirmed owner role and public loopback client have now been applied with explicit user approval; real local OAuth and both admin screens pass. Do not re-provision or replay role updates. Preserve the pre-grant encrypted metadata backup and actual schema verification evidence. Hosted staging still requires its own approval and current release checks.

## Atomic Academy completion checkpoint

0009 is additive and already installed in the development target. Keep 0008/0009 together when validating a release. Save table hashes and function/policy definitions privately before applying to any other environment. No data backfill or customer import is included. For a local code rollback preserve schema/evidence; do not drop provenance columns, unique indexes or existing award records. Restore reviewed function definitions/policies transactionally only if necessary, retaining the restrictive client-evidence policy. Production rollback remains unused because no production cutover occurred. Full offline account isolation and atomic certificates are outstanding release gates.

## Atomic certificate and complete Academy API checkpoint

Keep 0010 with this application release. Save certificate/profile/assessment/access record hashes and prior function/policy/index definitions privately before applying elsewhere. Never drop existing certificates or remove the privacy restriction as a routine rollback. v2 records require v2 verification code; rolling code back to a v1-only verifier would invalidate their verification. Prefer restoring the last tested v2-capable build; preserve immutable historical rows, audit and lineage. Restore approved function definitions transactionally only when necessary. No production rollback or customer reissue has been performed.


## External provider and staging prerequisites

Cloudflare CLI was not authenticated at the 5 November follow-up; no login or deployment was attempted. Obtain the separately approved staging destination and complete private Cloudflare authentication before an upload. Recheck the account plan/limits before any recommendation or paid change. Supply GEMINI_API_KEY only as an approved private Worker secret if provider-backed COSMOS chat, Gemini TTS or Live sessions are required; never use a VITE variable. The loopback preview allowlist now accepts this binding in memory. No Gemini credential has been provisioned or live provider behavior verified. Validate email delivery/reset using an approved test recipient and sender configuration; do not infer email delivery from a generated development magic link. Preserve existing Google/admin/OAuth approvals and request only the exact new staging redirect/settings changes once its origin is known.
