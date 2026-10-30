## Durable assessment foundation — 2026-10-30

Migration 0005 adds private server-issued question snapshots, learner ownership, expiry, submission fingerprints, saved verdicts and links to scored attempts. The internal service reuses the canonical question banks and preserves the 70% module / 80% final thresholds and final 20-question stage blueprint. It rechecks database verification and all 24 official completions before an official final exam begins or is graded. Elapsed time is measured from the database-issued start, not accepted from the browser. Concurrent retries return one durable JSON verdict; changed answers or submission keys are rejected. Practice attempt IDs are segregated from official quiz IDs so the existing completion reader cannot treat practice as qualifying.

This is an internal, tested foundation. It is deliberately NOT connected to the assessment UI/server functions yet: transactional completion, achievement and certificate integration must be completed first. It grants no completion, badge or certificate. Anonymous practice remains on the existing implementation until its guest-session replacement is ready. Other provider-dependent Academy paths remain open.

All 33 combined real-MariaDB backend tests pass with no skips. Assessment tests cover all 24 modules at all three levels, sanitized client questions, reconnect persistence, ten concurrent retries, owner/context checks, server timing, expiry, conflicting retries and final-exam eligibility/blueprint. The first test run caught differing undefined properties between initial and persisted responses; verdict serialization was corrected and the unchanged assertions pass. Schema replay/checksum/Unicode/JSON/FK/UTC/rollback tests pass (4) after migration 0005. TypeScript passes. The last official Node build and built-process-restart test passed with the lesson API; the new assessment service is internal and not bundled into a public route yet.

Next: connect durable grading to atomic completion/achievement/certificate issuance, replace all Academy bearer/provider access and guest offline synchronization safely, then finish Store persistence and its original failing editor tests. Actual Razorpay Test Mode testing is deferred at the user's request and remains a release gate. Store backup remains unavailable because Lovable paused its workspace. No hosting purchase, production data import or production service change is authorized.

# Migration progress report — INCOMPLETE

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

This is a progress checkpoint, not a final completion report. Phase 1 is verified; source audit and branch protection are complete; schemas and main backend foundations are implemented and tested. UI/API replacement, Store test repair, full regression, external test-provider workflows, data reconciliation and final hosting compatibility remain open.

## Original audit baseline


This file is intentionally a progress record, not a completion certificate.

Completed: local MariaDB connection/database creation; pinned GitHub migration branches; isolated source preservation; file/dependency/schema-object inventories; focused auth/payment/storage/Store security review; original OVU build/auth/test:all baselines; preliminary independent architecture, data/rollback/deployment and Hostinger research.

Pending verification: four restricted local accounts and grants. Their credentials have been generated privately and encrypted outside the repositories; DBeaver provisioning was attempted but successful account creation was not confirmed. Terminal tests are blocked by socket permission error 10013.

Not completed: independent application/runtime/auth/MariaDB/storage implementations, production exports or customer imports, Store baseline/workflow validation, actual Razorpay Test Mode, full browser/visual/3D/mobile acceptance, exact annual Hostinger quote and real deployment compatibility. No customer accounts were manually granted access and no live payment was made.

Current blocker: restricted tool-session network/process access prevents direct Git downloads and terminal local MariaDB connections. User action requested: enable full access for this migration session. After access returns, verify the local accounts before further schema work, finish Store dependency baseline, and proceed through the checklist. External email/OAuth/Razorpay test setup and approved production export will require private user authentication when reached.

Production state: unchanged. Existing Lovable sites remain live. No hosting purchased, DNS changed, production databases modified, live payment settings changed or subscription cancelled.
