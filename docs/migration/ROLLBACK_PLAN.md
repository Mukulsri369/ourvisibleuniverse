# OVU rollback

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
