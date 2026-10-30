## Atomic certification checkpoint — 30 October 2026

Migration 0006 is applied locally and replay/checksum tests pass. It adds evidence retry identifiers, one active certificate per learner/course version, signature versioning and audited certificate operation identities. Grading now commits official module completion, module progress, stage achievements, final eligibility and certificate issuance together. Existing completion criteria, 70% module passing and 80% final passing rules are retained. Practice never awards certification. Completion-status, activity submission and explicit completion recheck server functions now use independent cookie authentication/MariaDB; unauthenticated checklist requests expose only empty public criteria.

The full synthetic 24-module journey passes against MariaDB, including concurrent evidence/grading/claim requests, signing-failure rollback, reconnect persistence, name tamper detection, private student names by default, unauthorized PDF-data access denial, audited revocation/reissue and duplicate operation replay. New certificates require a private signing secret (no public fallback) and record signature version 2. The local runner generates/stores this key encrypted outside source. Existing production certificate compatibility still requires authoritative reconciliation; no legacy certificate or customer data was imported.

Verification: 34 combined backend tests pass with no skips; 4 schema/replay/Unicode/JSON/FK/UTC/rollback tests pass; TypeScript and official Node build pass. Built Node authentication/profile/lesson/reset/session workflow across process restart passes (1). Its first run encountered the existing authentication rate limit immediately after the combined suite; rerun after the limit expired passed without weakening the limiter. These checks are not a full Academy browser/certificate workflow test.

Still pending: connect assessment and certificate server functions/screens to the independent services; migrate anonymous practice using established session tooling; isolate offline queues and local progress by identity; replace remaining Academy provider paths and run browser/mobile/restart authorization workflows. Store work, Store backup, scientific catalogue/MCP runtime replacements, provider tests and Hostinger report remain open. Razorpay external testing is deferred at the user's request. Production and customer access remain unchanged.

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

# Test results

## Independent account and access checkpoint — 2026-10-30

Sign-in/registration, Google OAuth initiation, verification resend, password-reset controls, protected account identity, student profile/preference storage, guest progress sync, checkout/confirmation, the existing Razorpay webhook route, subscriber listing/grants and the new history/revoke/expiry controls now use the independent backend. Google/SMTP/Razorpay external provider workflows remain unverified without private configuration. The local outbox is explicitly restricted to loopback development outside every Git checkout.

The user approved removing only a fully refunded purchase's unused time. Migration 0003 records allocation provenance, original expiries and per-refund adjustments. Later duration grants/purchases shift earlier by unused time while retaining their duration; fixed administrator dates anchor their descendants. Already-consumed time is not deducted again. Concurrent/replayed refunds cannot repeat an adjustment. Legacy allocation version 0 records must be reconciled before production refund handling; the system rejects automatic changes rather than guessing dates.

Applied migration 0003 hit MariaDB's CHECK/SET NULL foreign-key restriction. The pending-migration repair verified all eight completed statements were unchanged, corrected only the unexecuted foreign-key declaration to restrictive deletion and resumed successfully. No completed migration or production database was edited.

Real MariaDB tests for student privacy/concurrency/persistence, subscriber authorization, private local mail and the approved refund allocation policy pass individually. The final combined backend suite passes all 27 tests with no skips; the latest official Node build and TypeScript checks pass. Browser review verified sign-in and reset navigation/layout. Administrator UI browser workflows and mobile/3D regression remain pending. The built Node app already passed a full process-restart session/profile/progress test, including real local email verification, password reset, reset-token replay denial and session revocation. The original OVU test:all command passed with its existing local in-memory fixtures; those tests are not MariaDB service proof.

The OVU export contains 71 identities and six access records (five live, one sandbox), all linked to identities, with unique Razorpay payment/order references. All live source records are unexpired at inspection; durations present are 30 and 365 days. Amounts/currencies are absent and will not be inferred from current prices. Working SQL extracts were encrypted with Windows DPAPI, round-trip verified and plaintext duplicates removed. Original downloaded archive and encrypted backup remain available privately. No customer account or entitlement has been imported or activated.

Still open: authoritative Academy assessment/completion/achievement/certificate persistence and APIs, scientific catalogue persistence, MCP OAuth/tool runtime replacement, full Store backend/UI/storage migration and original editor failures, account invitations/role-management UI, provider configuration/tests, legacy customer restoration approval, complete visual/mobile/3D workflows and final hosting compatibility. Lovable/Supabase runtime dependencies remain. Store export is blocked by its paused workspace; the user confirmed no existing Store backup. Production branches/services and hosting purchases remain outside this development checkpoint.


Updated 2026-10-29. Results below are local development evidence, not production migration proof.

| Check | Result | Limit |
|---|---|---|
| MariaDB 11.8.9, port 3307, both databases | PASS | Local only |
| Both runtime users, DML-only exact schema grants | PASS | Cross-app/system/DDL negative checks passed |
| Reviewed migration replay/checksum/Unicode/JSON/FK/UTC/rollback | PASS, 4 tests | Main; no production import |
| Better Auth lifecycle, reset, revocation, CSRF, HTTPS and roles | PASS, 3 tests | In-memory test mail transport; no SMTP/Google provider test |
| Durable entitlement/payment/admin/expiry transactions | PASS, 8 tests | Includes 20 concurrent retries and refund-first delivery |
| Razorpay provider boundary/HMAC/recovery | PASS, 4 tests | Synthetic provider; no external payment request |
| Independent authenticated HTTP API | PASS, 1 workflow | Real MariaDB and Better Auth handler; built Node auth/session/anonymous denial HTTP smoke also passes |
| OVU official Node build | PASS | Provider runtime calls still exist |
| OVU realtime voice validation | PASS, 61 checks | Server-only fallback import boundary repaired |
| OVU original build/test:all | PASS at baseline | Existing suite is not independent service proof |
| Store original provider build | PASS | Official independent Node build also passes |
| Store retailer URL/DNS/address/limit validation | PASS, 4 tests | Not yet wired into all scraper paths |
| Store original suite after dependency/import repair | FAIL | 195 passed / 40 failed; 13 failing files / 52. No skipped/deleted assertions |
| Store typecheck | FAIL | Existing editor/public types and legacy tests disagree; new fetch Response body typing fixed afterward |
| Downloaded OVU export integrity/encryption | PASS | Archive header/hash/DPAPI round-trip, pg_restore extraction and reference/count inspection; full restore rehearsal pending |
| Store production export | BLOCKED | Lovable workspace paused/out of credits; no billing action |
| Real Razorpay Test Mode, SMTP, Google OAuth | NOT RUN | Private test configuration required |
| Full UI, mobile, 3D, Academy, Store workflows | NOT COMPLETE | No claim of parity or runtime independence |
| Production data import, deployment, cutover | NOT RUN | Explicit approval gates remain |

Raw logs remain in work/evidence outside source commits. No real payment or production write was performed. Both package lockfiles are retained for reproducible installs. Earlier npm audit reported 8 OVU dependency vulnerabilities including existing Lovable MCP dependencies; removals/upgrades require tested replacements, not force-fix.

Additional Store checks: independent authentication lifecycle/HTTPS tests PASS (3); real Store schema replay/Unicode/UTC/category/editor invariants PASS (2). OVU latest combined independent backend suite: 16 passing tests with no skips.

Migration portability: .gitattributes preserves the exact applied SQL bytes on Windows/Linux. Staged SQL blobs were compared byte-for-byte to the applied local files; checksums must never depend on Git line-ending conversion. No completed SQL statement or database ledger was rewritten.

Latest evidence (2026-10-30): test:backend equivalent PASS 27/27; built Node restart/verification/reset/revocation/profile/progress workflow PASS 1/1. The refund policy suite passes five real-database workflows. No real provider checkout has been performed.
