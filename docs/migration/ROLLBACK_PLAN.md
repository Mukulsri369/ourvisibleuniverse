# OVU rollback

## Current production state — 6 November 2026, DNS cutover completed

The owner explicitly approved replacement of the two backed-up A records. Only apex/www A records pointing to 185.158.133.1 were removed; triggers-only deployment successfully attached both hostnames to the existing OVU Worker. Cloudflare now lists four unchanged CNAME/TXT records and two managed Worker records. Both production domains serve the new application over HTTPS using owned Supabase. Store is unchanged; Lovable resources remain intact for rollback. Earlier approval-pending and unattached-domain statements below are historical.

**Checkout activation is currently blocked by Cloudflare's control-plane API returning HTTP 503, “no healthy upstream.”** Three final activation deployment attempts failed during their preliminary GET of the existing Worker service, before upload. The last independently verified active version remains b6e783bf-c8f7-46de-baff-9c5e803a9f4e, production origin/Live mode with new checkout held false. Do not report checkout enabled or the migration fully accepted. The prepared final configuration enables checkout only after the completed drain; retry the existing final deploy when the API recovers, then verify the actual deployed bindings/version before declaring activation. No keys were rotated and no provider charge/refund was made.

The old 600-second A-record TTL elapsed after the first proven domain attachment at 09:13:54 UTC. Post-drain source snapshot at 09:24:31 UTC contains 79 users/7 access records and the same data-only SQL SHA-256 b07d44b3a5189cad5d76e4d394ad67e33f76279a96dc637342dcf711c80a341a. Reconciliation: 79 preserved, zero new accounts/conflicts, zero writes. Target retains 80 users/8 access records including the previously approved recovery. Read-only provider audit at 09:24:16 UTC found the same 8 scoped paid/12 pending orders; the two source-only unmatched records are the already recovered purchase and the fully refunded excluded order. Target has 13 Live orders/1 transaction. Old Lovable aliases are not write-frozen; reconcile any later alias writes before retirement.

Production checks: nine public SSR routes returned 200, absent route 404, www 200, Vega catalogue search returned Vega, anonymous MCP 401, unsigned Live webhook 401, wrong-mode webhook 400. Workers hostname retains noindex; production has no global noindex header. Browser: homepage renders; anonymous 3D Atlas returns sign-in; subscriber admin exposes no customer records and offers sign-in; synthetic nonexistent certificate lookup returns not found; no captured browser console errors. A requested 390px viewport override still reported 1280px actual width: **production mobile verification is not established** by that attempt. Authenticated production Google/paid 3D journeys, actual new checkout/authentic Razorpay delivery, Gemini and human email recovery remain pending owner/provider testing. Existing staging and backend results remain historical evidence, not substitutes. Seven production-configuration/time-regression checks passed, zero failures/skips.

Rollback: retain the zone backup, encrypted source/target snapshots, recovery and pending-order journals. To revert routing, remove the two managed Worker domain attachments and restore only the two original A records/TTL 600; preserve target writes and reconcile them before any database rollback. Do not restore an old seven-pass snapshot over the approved recovery. No cancellation, purchase or Store migration was performed.


## Held domain-attachment checkpoint — 6 November 2026

Current Worker version is `b6e783bf-c8f7-46de-baff-9c5e803a9f4e` with new checkout held; the primary apex/www still point at the original `185.158.133.1` because domain attachment was rejected (100117). The two A records (TTL 600) are backed up and selected but not deleted. After the approved routing-record removal, if managed domain attachment fails, restore those exact two A records promptly and verify DNS/SSL; leave the four CNAME/TXT records and all databases unchanged. Do not revert customer data to the old seven-row source snapshot: the owned target now includes the specifically approved recovery and durable legacy-order ownership. The prior tested Worker `7714f66b-0a87-4d6d-ac22-2569fc0cd0f0` remains a code/variable rollback reference, not a database restore instruction. See [PRODUCTION_CUTOVER.md](PRODUCTION_CUTOVER.md).

## Live checkout hold — 6 November 2026

Live staging checkout is enabled at version `7714f66b-0a87-4d6d-ac22-2569fc0cd0f0`. Prefer the explicit Live checkout hold over a mode rollback: keep Live event verification/recovery and all ledger records intact. See [LIVE_PAYMENT_TEST_HANDOFF.md](LIVE_PAYMENT_TEST_HANDOFF.md) for exact held-config commands and financial rollback limits. DNS and original production remain unchanged.


## Payment backend verified; Live activation pending — 6 November 2026

The existing Live Razorpay pair is encrypted locally only; no upload, provider request, key rotation or checkout activation occurred. Migration 0012 is installed in the owned Supabase project with all six original entitlements preserved. 49 combined regressions, 2 real-HMAC unit tests, 27 rolled-back PostgreSQL assertions, 9 real Supabase/built-app checks (including restart and concurrent replay), TypeScript, build and 2 built SSR checks passed. Disposable fixtures were removed; existing customers and access records matched pre-test snapshots. Private-value artifact scans found zero matches. Provider payments remain unverified.

Read-only merchant inspection shows the original `.in` website approved and no configured Live webhook. The Workers staging address has not been approved; the separate webhook is unsaved. Live activation requires exact staging approval, private server bindings, `RAZORPAY_MODE=live` with the historical-read override removed, and approved webhook configuration. Production, Store, DNS, merchant configuration and billing are unchanged. See [RAZORPAY_MIGRATION_REPORT.md](RAZORPAY_MIGRATION_REPORT.md). Earlier Test-mode deferrals below are historical; the owner's current choice is reuse of the original Live pair without Test-key regeneration.

No production cutover was performed; the live Lovable application remains the operational fallback. The explicitly approved new-project admin/OAuth schema and selected Google administrator role are now applied. Preserve their private preflight and pre-role metadata backups; a code revert alone does not reverse those changes.

- Preserve `origin/main` baseline `ba30dc9035a229eb475c5d36ec7ef1b6bf2db263`, migration checkpoint `399ab9d`, and historical `migration/mariadb-hostinger` head `3d8be60`.
- For local diagnosis, make a separate checkout/worktree at the desired preserved commit and stop the owned preview process. Do not hard-reset a dirty checkout, delete private backups or change the Store.
- Revert reviewed code commits with new revert commits if needed. Never force-push, rebase/amend published history or push this work directly to the Lovable-connected production branch.
- Preserve privately moved legacy environment files. Do not restore old-project variables into the new app indiscriminately; the build intentionally rejects a different Supabase project.
- After any future approved staging deployment, retain its preceding Worker version and the matching database migration state. A Worker rollback does not undo database writes, customer grants, certificates or payments.
- Before any future production cutover, maintain both environments and a payment-event replay/synchronization plan. Reverting DNS alone cannot recover transactions written to the new database. Obtain approval for every production rollback that changes domains, live payment endpoints or customer access.

Current Supabase Google configuration and the approved local redirect are intentionally retained. The user also explicitly approved OAuth-server enablement, consent `/oauth/consent`, dynamic registration off, and local Site URL `http://127.0.0.1:31751`; those settings are now saved and verified. The preceding Site URL was `http://localhost:3000` and OAuth server was off. Do not silently undo approved authentication settings or register/authorize clients during a code rollback; any authentication rollback is a separate configuration decision.

## Approved new-project admin/OAuth changes

Before approved application, preserve the private policy/function snapshot and the selected user's complete preceding app metadata. Apply only the generated 0006/0007 transaction; failure rolls back DDL and record hashes must remain unchanged. After application, verify hashes against the preflight and verify ordinary website access before testing a delegated client.

If a later rollback is required, first revoke/delete the test client's authorizations and disable that client; restore only the selected account's preceding trusted app metadata and refresh its sessions as appropriate. Do not broaden raw-table policies while a delegated client can still use tokens. Prefer retaining restrictive policies until the client/token revocation is verified. Restore function/policy definitions from the private preflight in a reviewed transaction. Never drop an audit table with records or delete customer, access or certificate data. Any remote security rollback needs the same explicit review as installation. Code rollback alone cannot undo roles or issued tokens.

## Durable assessment schema

0008 was applied only to the new project with attempt/eligibility/certificate integrity guards. Preserve the private Academy preflight and verification evidence. Prefer a corrective forward migration; never drop snapshots, attempts or provenance after users create records. If official grading must be suspended, fail closed and retain sessions/results for recovery. Reverting to the old unclassified practice/official query behavior could incorrectly count practice passes; do not perform that rollback. Customer reconciliation and historical signing keys remain separate approvals.

## Atomic Academy completion checkpoint

0009 is additive and already installed in the development target. Keep 0008/0009 together when validating a release. Save table hashes and function/policy definitions privately before applying to any other environment. No data backfill or customer import is included. For a local code rollback preserve schema/evidence; do not drop provenance columns, unique indexes or existing award records. Restore reviewed function definitions/policies transactionally only if necessary, retaining the restrictive client-evidence policy. Production rollback remains unused because no production cutover occurred. Full offline account isolation and atomic certificates are outstanding release gates.

## Atomic certificate and complete Academy API checkpoint

Keep 0010 with this application release. Save certificate/profile/assessment/access record hashes and prior function/policy/index definitions privately before applying elsewhere. Never drop existing certificates or remove the privacy restriction as a routine rollback. v2 records require v2 verification code; rolling code back to a v1-only verifier would invalidate their verification. Prefer restoring the last tested v2-capable build; preserve immutable historical rows, audit and lineage. Restore approved function definitions transactionally only when necessary. No production rollback or customer reissue has been performed.

## Tested staging rollback — 5 November 2026

Known tested staging version: `e6abed40-270b-4c68-8547-828770f43554` (includes the two private server bindings). Initial version `26e36932-cd28-4129-a311-221e2226415b` lacks those bindings and is not the recovery target. If staging needs application rollback, use Wrangler rollback against the dedicated `ovu-supabase-staging` configuration and that tested version. Preserve Supabase privacy/authorization migrations and issued certificate signing material. Do not change production or revert database protections as part of staging rollback. No rollback was executed.

Recovery UI deployment: active version `f655e3f6-66cc-49c2-b2a6-9fc9ec303648`, application `89fc844`. For a recovery-UI regression, the preceding fully tested application version `e6abed40-270b-4c68-8547-828770f43554` remains the staging rollback target. No rollback performed.

## Customer snapshot transfer — active staging

Active Worker: `44441fc7-f935-4acc-ac16-6ffe65fdbb4a`. New target now contains real migrated users and access history. Preserve all customer records and the encrypted import mapping; never use disposable-fixture cleanup or a database reset against them. Application-only rollback to `f655e3f6-66cc-49c2-b2a6-9fc9ec303648` restores prior sandbox read behavior; it does not undo the customer transfer. Any data rollback requires separate explicit approval and reconciliation. Original production remains available and unchanged; final source-write synchronization is still required before DNS cutover.
