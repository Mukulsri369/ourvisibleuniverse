## Academy lesson persistence checkpoint — 2026-10-30

Razorpay Test Mode credential entry and external payment testing are deferred at the user's request. Synthetic provider/HMAC tests passing does not verify the actual Razorpay checkout or webhook workflow. This remains a release gate.

Migration 0004 copies the original public course, version, 24 modules and core lesson definitions into MariaDB without customer records or changes to lesson content. Existing definitions are retained. Composite foreign keys prevent writing a lesson under a different module; negative reading duration is rejected. Its initial lesson INSERT SELECT encountered an ambiguous column reference; the audited pending repair verified all four executed statements unchanged, corrected only the unexecuted insert and resumed. Completed migration bytes are immutable.

Lesson saving now uses the independent verified cookie identity, bounded strict input, per-user locking, monotonic reading depth/time and intentional bookmark updates. The existing recordLessonProgress server function and /api/backend/academy/lessons use MariaDB. These are unverified reading signals, not certification evidence. No assessment pass, official completion, certificate or paid entitlement is created by reading telemetry. Other Academy assessment/completion/certificate paths and the progress hook still require migration; the Academy is not yet independently functional end to end.

Verification: all 30 backend tests pass with no skips, including curriculum coverage, concurrent lesson retries, private per-user reads, reconnect persistence, forged/invalid input denial and authenticated HTTP origin checks. Schema replay/checksum/Unicode/JSON/FK/UTC/rollback tests pass (4). The official Node build and TypeScript pass. The built-app full process-restart test passes (1), now verifying persisted lesson data in addition to authentication/profile/reset/session behavior. No production data or service changed.

# OVU migration master checklist

## Independent account and access checkpoint — 2026-10-30

Sign-in/registration, Google OAuth initiation, verification resend, password-reset controls, protected account identity, student profile/preference storage, guest progress sync, checkout/confirmation, the existing Razorpay webhook route, subscriber listing/grants and the new history/revoke/expiry controls now use the independent backend. Google/SMTP/Razorpay external provider workflows remain unverified without private configuration. The local outbox is explicitly restricted to loopback development outside every Git checkout.

The user approved removing only a fully refunded purchase's unused time. Migration 0003 records allocation provenance, original expiries and per-refund adjustments. Later duration grants/purchases shift earlier by unused time while retaining their duration; fixed administrator dates anchor their descendants. Already-consumed time is not deducted again. Concurrent/replayed refunds cannot repeat an adjustment. Legacy allocation version 0 records must be reconciled before production refund handling; the system rejects automatic changes rather than guessing dates.

Applied migration 0003 hit MariaDB's CHECK/SET NULL foreign-key restriction. The pending-migration repair verified all eight completed statements were unchanged, corrected only the unexecuted foreign-key declaration to restrictive deletion and resumed successfully. No completed migration or production database was edited.

Real MariaDB tests for student privacy/concurrency/persistence, subscriber authorization, private local mail and the approved refund allocation policy pass individually. The final combined backend suite passes all 27 tests with no skips; the latest official Node build and TypeScript checks pass. Browser review verified sign-in and reset navigation/layout. Administrator UI browser workflows and mobile/3D regression remain pending. The built Node app already passed a full process-restart session/profile/progress test, including real local email verification, password reset, reset-token replay denial and session revocation. The original OVU test:all command passed with its existing local in-memory fixtures; those tests are not MariaDB service proof.

The OVU export contains 71 identities and six access records (five live, one sandbox), all linked to identities, with unique Razorpay payment/order references. All live source records are unexpired at inspection; durations present are 30 and 365 days. Amounts/currencies are absent and will not be inferred from current prices. Working SQL extracts were encrypted with Windows DPAPI, round-trip verified and plaintext duplicates removed. Original downloaded archive and encrypted backup remain available privately. No customer account or entitlement has been imported or activated.

Still open: authoritative Academy assessment/completion/achievement/certificate persistence and APIs, scientific catalogue persistence, MCP OAuth/tool runtime replacement, full Store backend/UI/storage migration and original editor failures, account invitations/role-management UI, provider configuration/tests, legacy customer restoration approval, complete visual/mobile/3D workflows and final hosting compatibility. Lovable/Supabase runtime dependencies remain. Store export is blocked by its paused workspace; the user confirmed no existing Store backup. Production branches/services and hosting purchases remain outside this development checkpoint.


Updated 2026-10-29. Status: IN PROGRESS. Production cutover is not authorized.

## Completed and verified

- Both repositories are on isolated migration/mariadb-hostinger branches with original source and audit history preserved.
- Both local databases, four restricted account logins, effective privilege boundaries and UTF-8 configuration are verified.
- Main: Better Auth schema, 23 source application tables, payment ledger/locking/audit/identity-map tables applied through repeatable migrations. Store: auth schema, 11 original tables and added relationship/invariant tables applied.
- Main MariaDB tests: schema replay/checksum drift, Unicode/JSON/FKs, UTC pool initialization and transaction rollback (4 tests); authentication/reset/session/role/HTTPS checks (3); access/concurrency/refunds/admin/expiry (8); synthetic Razorpay provider/HMAC/recovery (4); cookie-authenticated HTTP authorization/audit (1).
- Main independent Node build passes. Built Node HTTP smoke passes homepage/science/learn/auth/catalog, /api/auth/get-session (200) and anonymous /api/backend/access denial (401). Existing realtime voice boundary validation passes all 61 checks. Main TypeScript passed with the payment endpoints.
- Store original provider and official Node builds pass. New outbound-retailer validation tests pass (4). Its original test suite remains failing: latest run 195 passed, 40 failed, 13 failing files out of 52. Missing peer dependency/import paths were repaired without removing assertions. Store typecheck also exposes existing source/test API mismatches; no release approval.
- Main downloaded backup has a valid PostgreSQL archive header, 356090 bytes, SHA-256 57ACA90478F0D22FD425A2D34213782EE710015682A929DA226FA031EAB68CA9. Encrypted copy and pg_restore schema/data extraction verified. No orphaned entitlement identities or duplicate payment references found. No customer import performed.

## Current work and blockers

1. Inspect the main export safely and reconcile deployed schema drift. Store data/storage export is blocked by the paused Lovable workspace; preserve current services and await an available backup or user-approved source access.
2. Finish backend/API replacements and connect existing UI to independent cookie authentication, payment/access APIs, Academy/certificates/catalog and Store persistence/storage. Provider runtime calls still exist.
3. Finish failed-attempt payment history, owner-controlled roles/invites, admin UI and reconciliation tools; do not grant real customer access without authorized identities/periods.
4. Repair original Store API/fixture/typecheck failures; retain all assertions and test budgets. Run complete local business/visual/mobile/3D workflows.
5. Configure test-only Razorpay, SMTP and Google OAuth privately when required. No real provider end-to-end workflow has passed yet.
6. Complete Hostinger measured compatibility and actual annual/renewal quote. Stop before any purchase, deployment, DNS/payment changes or Lovable cancellation for explicit approval.

Additional Store verification: independent authentication lifecycle/HTTPS tests pass (3); real Store schema replay/Unicode/UTC/category FK/editor JSON/same-page publication tests pass (2). These do not resolve the original editor suite/typecheck failures.

Migration portability: .gitattributes preserves the exact applied SQL bytes on Windows/Linux. Staged SQL blobs were compared byte-for-byte to the applied local files; checksums must never depend on Git line-ending conversion. No completed SQL statement or database ledger was rewritten.
