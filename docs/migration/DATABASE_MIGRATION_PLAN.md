## Durable assessment foundation — 2026-10-30

Migration 0005 adds private server-issued question snapshots, learner ownership, expiry, submission fingerprints, saved verdicts and links to scored attempts. The internal service reuses the canonical question banks and preserves the 70% module / 80% final thresholds and final 20-question stage blueprint. It rechecks database verification and all 24 official completions before an official final exam begins or is graded. Elapsed time is measured from the database-issued start, not accepted from the browser. Concurrent retries return one durable JSON verdict; changed answers or submission keys are rejected. Practice attempt IDs are segregated from official quiz IDs so the existing completion reader cannot treat practice as qualifying.

This is an internal, tested foundation. It is deliberately NOT connected to the assessment UI/server functions yet: transactional completion, achievement and certificate integration must be completed first. It grants no completion, badge or certificate. Anonymous practice remains on the existing implementation until its guest-session replacement is ready. Other provider-dependent Academy paths remain open.

All 33 combined real-MariaDB backend tests pass with no skips. Assessment tests cover all 24 modules at all three levels, sanitized client questions, reconnect persistence, ten concurrent retries, owner/context checks, server timing, expiry, conflicting retries and final-exam eligibility/blueprint. The first test run caught differing undefined properties between initial and persisted responses; verdict serialization was corrected and the unchanged assertions pass. Schema replay/checksum/Unicode/JSON/FK/UTC/rollback tests pass (4) after migration 0005. TypeScript passes. The last official Node build and built-process-restart test passed with the lesson API; the new assessment service is internal and not bundled into a public route yet.

Next: connect durable grading to atomic completion/achievement/certificate issuance, replace all Academy bearer/provider access and guest offline synchronization safely, then finish Store persistence and its original failing editor tests. Actual Razorpay Test Mode testing is deferred at the user's request and remains a release gate. Store backup remains unavailable because Lovable paused its workspace. No hosting purchase, production data import or production service change is authorized.

## Academy lesson persistence checkpoint — 2026-10-30

Razorpay Test Mode credential entry and external payment testing are deferred at the user's request. Synthetic provider/HMAC tests passing does not verify the actual Razorpay checkout or webhook workflow. This remains a release gate.

Migration 0004 copies the original public course, version, 24 modules and core lesson definitions into MariaDB without customer records or changes to lesson content. Existing definitions are retained. Composite foreign keys prevent writing a lesson under a different module; negative reading duration is rejected. Its initial lesson INSERT SELECT encountered an ambiguous column reference; the audited pending repair verified all four executed statements unchanged, corrected only the unexecuted insert and resumed. Completed migration bytes are immutable.

Lesson saving now uses the independent verified cookie identity, bounded strict input, per-user locking, monotonic reading depth/time and intentional bookmark updates. The existing recordLessonProgress server function and /api/backend/academy/lessons use MariaDB. These are unverified reading signals, not certification evidence. No assessment pass, official completion, certificate or paid entitlement is created by reading telemetry. Other Academy assessment/completion/certificate paths and the progress hook still require migration; the Academy is not yet independently functional end to end.

Verification: all 30 backend tests pass with no skips, including curriculum coverage, concurrent lesson retries, private per-user reads, reconnect persistence, forged/invalid input denial and authenticated HTTP origin checks. Schema replay/checksum/Unicode/JSON/FK/UTC/rollback tests pass (4). The official Node build and TypeScript pass. The built-app full process-restart test passes (1), now verifying persisted lesson data in addition to authentication/profile/reset/session behavior. No production data or service changed.

# MariaDB migration plan

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

Current implementation: mariadb/migrations/0000_auth.sql is generated from the pinned auth library and reviewed for MariaDB. Main 0001 translates source tables; 0002 adds durable access/payment/admin bookkeeping. Store 0001 translates original tables, and 0002 adds category relations, affiliate locks, editor relationship constraints and audit support. MariaDB DDL implicitly commits: schema_migration_steps tracks completed statements and checksums. A real Store generation error was repaired before completion only after verifying the nine executed statements were identical; schema_migration_repairs audits this. Completed migrations reject changes. Runtime stored procedures/triggers/RLS still require endpoint-specific transactional replacements. Store draft base-version deletion uses RESTRICT for immutable versions rather than invalid partial SET NULL on a nonnullable composite relationship. The deployed OVU panel lists access_passes with six rows, unlike the broader source schema; inspect the export before assuming Academy records exist or are absent.

## Original audit baseline


Status: schema conversion NOT executed. Local databases exist; they contain no approved production import.

## Schema sources and mapping

Use DATABASE_OBJECT_INVENTORY.json together with every PostgreSQL migration. drizzle/schema.ts is intentionally empty. Include runtime-referenced Academy profile/certificate/completion tables even where generated Supabase types and migrations disagree; reconcile a read-only approved production schema export before import.

| PostgreSQL feature | MariaDB replacement and required verification |
|---|---|
| UUID and auth.users FK | Preserve UUID text IDs using CHAR(36) with binary/ASCII equality, or proven consistent binary UUID encoding; map to independent identity IDs without losing legacy linkage |
| timestamptz | DATETIME(6), UTC connection/session and application conversion; preserve original instants and access boundaries |
| jsonb | JSON with validation and explicit indexing strategy; verify JSON null, SQL NULL, booleans, numbers and ordering |
| text/uuid arrays | Ordered child tables where referential integrity matters; product category join table with position and legacy first-category compatibility |
| numeric/scientific data | Preserve exact precision/range, units and null semantics; use explicit DECIMAL or DOUBLE based on original fields; validate catalog sample tolerances |
| RLS/auth.uid/service_role | Server-owned sessions, ownership predicates, explicit roles, public projections and cross-user negative tests |
| PL/pgSQL RPC/SECURITY DEFINER | Parameterized server transactions with least-privilege connections; no raw privileged browser queries |
| advisory locks | InnoDB row lock on a durable user/environment entitlement aggregate; deterministic lock order and bounded deadlock retry |
| partial indexes/JSON operators | Explicit generated columns/normalized tables and tested equivalent unique constraints/filters |
| update/validation triggers | Preserve invariants transactionally; do not rely on frontend validation or case-insensitive collations for opaque affiliate URLs |
| NOTIFY PostgREST | Remove provider schema-cache notifications once server APIs own queries |

## Atomic purchase invariant

Preserve original 30/180/365-day behavior and sandbox/live separation. Verify Razorpay before any write. In one transaction lock the user's entitlement aggregate; check the unique (environment,payment_id) ledger again under lock; reject conflicting ownership/order/amount/currency; compute base=max(now, maximum eligible active expiry); insert payment/access records and commit exactly once. Concurrent different purchases extend access serially. Callback and webhook replay must return the same result without double extension. Rolled-back transactions must leave no active access. Define refund effects at the purchase level so unrelated grants/purchases survive.

## Store invariants

Migrate live/trashed/draft status behavior, effective affiliate-link duplicate prevention, category reference validation/order, slug uniqueness, public visibility, private settings, ordered image/video media and best-effort outbound logs. Preserve page-version immutability, draft revision compare-and-swap, publication audit and restore-as-new-version behavior from 0010_storefront_page_persistence.sql. Avoid a direct text replacement of PostgreSQL SQL.

## Migration runner

Create separate numbered MariaDB migrations with checksums and a schema_migrations ledger per database; take a migration lock, validate the current version and stop on drift. MariaDB DDL implicitly commits, so transactional wrapping alone cannot make DDL atomic: use explicit resumable steps and validated postconditions. Use migrator accounts only during upgrades; runtime app users receive DML only. Test empty install, repeat run, interrupted resume, rollback/restore and idempotent approved data import. No DROP-based rollback on production data.

## Data preservation gate

Privately export auth identity mappings, access passes, payment/order IDs, admin audit, student profiles/progress/completions, certificates/signing versions, Store tables and storage manifests. Keep encrypted dumps outside repositories and outputs. Verify row counts, monetary totals, identifiers, expiry instants, object checksums and FK integrity in a disposable restored copy. Export schema drift must be reconciled before writing an import. Accounts may be recreated for 4–6 users, but entitlements and historical records must remain traceable through legacy IDs. Manual grants require approved users and periods.

Migration portability: .gitattributes preserves the exact applied SQL bytes on Windows/Linux. Staged SQL blobs were compared byte-for-byte to the applied local files; checksums must never depend on Git line-ending conversion. No completed SQL statement or database ledger was rewritten.
