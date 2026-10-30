# Deployment runbook — not executable until approval gates pass

## Independent account and access checkpoint — 2026-10-30

Sign-in/registration, Google OAuth initiation, verification resend, password-reset controls, protected account identity, student profile/preference storage, guest progress sync, checkout/confirmation, the existing Razorpay webhook route, subscriber listing/grants and the new history/revoke/expiry controls now use the independent backend. Google/SMTP/Razorpay external provider workflows remain unverified without private configuration. The local outbox is explicitly restricted to loopback development outside every Git checkout.

The user approved removing only a fully refunded purchase's unused time. Migration 0003 records allocation provenance, original expiries and per-refund adjustments. Later duration grants/purchases shift earlier by unused time while retaining their duration; fixed administrator dates anchor their descendants. Already-consumed time is not deducted again. Concurrent/replayed refunds cannot repeat an adjustment. Legacy allocation version 0 records must be reconciled before production refund handling; the system rejects automatic changes rather than guessing dates.

Applied migration 0003 hit MariaDB's CHECK/SET NULL foreign-key restriction. The pending-migration repair verified all eight completed statements were unchanged, corrected only the unexecuted foreign-key declaration to restrictive deletion and resumed successfully. No completed migration or production database was edited.

Real MariaDB tests for student privacy/concurrency/persistence, subscriber authorization, private local mail and the approved refund allocation policy pass individually. The final combined backend suite passes all 27 tests with no skips; the latest official Node build and TypeScript checks pass. Browser review verified sign-in and reset navigation/layout. Administrator UI browser workflows and mobile/3D regression remain pending. The built Node app already passed a full process-restart session/profile/progress test, including real local email verification, password reset, reset-token replay denial and session revocation. The original OVU test:all command passed with its existing local in-memory fixtures; those tests are not MariaDB service proof.

The OVU export contains 71 identities and six access records (five live, one sandbox), all linked to identities, with unique Razorpay payment/order references. All live source records are unexpired at inspection; durations present are 30 and 365 days. Amounts/currencies are absent and will not be inferred from current prices. Working SQL extracts were encrypted with Windows DPAPI, round-trip verified and plaintext duplicates removed. Original downloaded archive and encrypted backup remain available privately. No customer account or entitlement has been imported or activated.

Still open: authoritative Academy assessment/completion/achievement/certificate persistence and APIs, scientific catalogue persistence, MCP OAuth/tool runtime replacement, full Store backend/UI/storage migration and original editor failures, account invitations/role-management UI, provider configuration/tests, legacy customer restoration approval, complete visual/mobile/3D workflows and final hosting compatibility. Lovable/Supabase runtime dependencies remain. Store export is blocked by its paused workspace; the user confirmed no existing Store backup. Production branches/services and hosting purchases remain outside this development checkpoint.


## Verified foundation checkpoint — 2026-10-29

This checkpoint supersedes the access-blocked baseline notes below. The migration is IN PROGRESS. Source release hashes are pinned; the actual deployed production commits remain unverified.

- Full local terminal, GitHub clone/fetch and MariaDB connections now work. Both app users authenticate to MariaDB 11.8.9 on port 3307 and have SELECT/INSERT/UPDATE/DELETE only on their exact escaped database grants. Cross-app/system access and runtime DDL are denied. Separate migrator accounts have applied the schemas. MySQL port 3306 is unchanged.
- Credentials remain Windows-DPAPI encrypted in a user-only directory outside both repositories. No customer records or credentials are committed.
- Reviewed MariaDB migrations and checksum/step ledgers are implemented. UTC is initialized on every physical connection. Application authorization must replace PostgreSQL RLS at each endpoint; schema creation alone does not provide that replacement.
- Better Auth 1.7.14 and mysql2 provide the independent authentication foundation. Main database tests verify registration, verification, login/logout, reset-token reuse denial, session revocation, role checks and CSRF. SMTP/OAuth delivery is not configured or externally verified.
- The main payment-access ledger passes real MariaDB concurrency, replay, ownership, amount/currency, expiry, audit and refund tests. Synthetic provider tests validate raw-body webhook HMAC, callback HMAC, order ownership, interrupted-checkout recovery and refund-first delivery. These are NOT Razorpay Test Mode transactions. Existing frontend/provider integrations still require replacement.
- Production records, domains, payment configurations and deployments remain unchanged. An authorized read-only OVU database export was created in Lovable storage. The browser download approval gate rejected automation; the user downloaded it manually. Its PostgreSQL archive header and SHA-256 were checked, and a DPAPI-encrypted copy round-tripped successfully outside Git. The official pg_restore 17.11 client parsed the archive and extracted all schema/data sections privately without executing SQL. FK/reference and table counts were inspected; a full disposable restore/import rehearsal remains pending. The export has only public.access_passes and no Academy application tables. Historical amounts/currencies are absent; do not invent them from current plan prices. Store project Cosmic Cart is paused for exhausted workspace credits; its database export is blocked. No top-up or reactivation was performed.
- Lovable/Supabase packages and runtime calls remain. Neither app meets completion criteria. No hosting purchase is recommended at this checkpoint.

Local foundation: install from package lock; supply server-only environment settings outside Git; use a dedicated *_migrator account for db:migrate; switch to DML-only *_app for runtime; npm run build:node and start:node with host-assigned PORT/NITRO_HOST. OVU_BACKEND=mariadb mounts the new backend, but existing frontend features are still provider-dependent: do not deploy this checkpoint as a completed migration. Confirm UTC, migration checksums, independent session/provider configuration and all workflows before any staging rollout.

## Original audit baseline


No hosting or production deployment has been performed.

## Gate A: local release candidate

Complete independent database/auth/storage/backend/payment implementations on migration branches. Pin dependency lockfiles, runtime and source commits. Run full original tests plus real MariaDB migrations/concurrency, isolation tests, Razorpay Test Mode, browser SSR/routes/mobile/3D/Academy/certificate/Store workflows and restart persistence. Scan built client/server output for provider calls and secrets. Verify content/media inventories and record measured memory/startup/request durations. Obtain a verified encrypted source/data/object backup and restore proof.

## Gate B: hosting purchase approval

Resolve every open item in HOSTINGER_COMPATIBILITY_REPORT.md, including actual annual total and renewal. Present the tested release, limitations and exact plan. STOP and request explicit purchase approval; never buy automatically.

## Gate C: approved isolated staging

After purchase and approval, configure separate runtime and migration DB users, per-app databases, Node version, host-assigned port, independent origins, TLS, secrets and durable storage/backups. Use provider-required DB prefixes. Install approved schemas and data only. Deploy to staging without DNS changes. Keep Razorpay test keys and webhook paths isolated from live. Run release acceptance against the real Hostinger environment, including storage across redeployment and restore. Verify scheduled bounded tasks and webhook retry handling.

## Gate D: separately approved cutover

Record old DNS/deployment/config state and rollback target. Arrange final exports plus a deliberate write/payment cutover window. Stop or queue old writes without losing captured payments, synchronize final deltas, reconcile Razorpay captured orders, and keep the old webhook route able to acknowledge/replay events until ownership transfers safely. Approve each production payment/config/data operation. Switch DNS only with separate approval after staging passes. Monitor authorization, checkout, entitlement, certificate, Store and 3D flows. Do not cancel Lovable after DNS alone.

## Post-cutover

Verify backups, restore drills, incident alerts, access expiry, payment reconciliation, user support and historical audit continuity. Retain an agreed observation period and explicit user approval before any Lovable cancellation. Exported customer records and secrets stay encrypted outside repositories throughout.

Local Test Mode setup: an optional private-entry helper is available in this task's outputs as Configure-OVU-TestPayments.ps1. It accepts only rzp_test_ key IDs and uses masked prompts plus Windows DPAPI XML outside Git. Syntax/static safety checks passed; an automated write/cleanup simulation was rejected by automatic approval review and was not run. Credential entry must be performed privately by the user. The local runner forces RAZORPAY_MODE=test and refuses non-test configuration.
