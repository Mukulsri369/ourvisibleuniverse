# PostgreSQL migration status and next transactions

The target is the new OVU Supabase project pdvwkdggyyrfkoqrpbji, used by local development. Store, Lovable production and historical customer exports are untouched.

## Applied

- 0006/0007: explicitly approved administrator/audit RPCs, restricted OAuth access and a narrow own-user summary. The confirmed Google administrator and public loopback QA client are provisioned; actual consent/tools/admin screens passed.
- 0008: durable official assessment sessions, private canonical snapshots, nullable attempt provenance (mode, level, course version, session ID), a unique session-to-attempt index, and a service-only grading transaction. Applied through the exact locally tested transaction with before/after integrity guards.

Official start persists the assigned questions before returning sanitized questions. Official submission recovers that snapshot by user/session/module/level, rather than reconstructing an exam from browser answer IDs. PostgreSQL independently scores the stored answers, enforces five real elapsed seconds, preserves module 70% and final-exam 80% thresholds, and requires the assigned 20 questions plus all 24 verified modules for the final exam. Attempt, immutable result and final eligibility commit together or roll back together. Identical answer retries return the stored result; changed answers cannot overwrite it, even with a different browser idempotency key.

No existing attempt was labeled official automatically. NULL provenance means historical reconciliation is still required. Practice attempts explicitly carry practice mode; official completion and canonical certificate fallback queries require official provenance. Anonymous practice makes no database UUID writes and cannot become certificate-eligible on replay. Existing certificate/signing history is not reconciled by these schema additions.

Canonical snapshots and the grading RPC have no anon/authenticated privileges; only the existing protected backend service principal can use them. No new person/app permission was granted by 0008. Existing target attempts, eligibility and certificate hashes matched before and after installation and after disposable QA cleanup.

## Executed evidence

- 11 real PostgreSQL tests, including a new Node process reading a prior process's session, 16/20 = 80%, replay isolation, wrong owner/level/session, outage rejection, private snapshots, grade validation and transactional rollback, practice provenance exclusion and anonymous passing-practice retries without database calls.
- Actual built workerd application with real Supabase: a marked disposable identity started an official quiz, the Worker stopped/restarted, then submission graded 0% despite a fabricated client score. Retry returned one original attempt; changed answers were rejected. Direct snapshot/grading requests were denied. Anonymous practice/retries worked and anonymous official start was denied.
- The disposable identity and its rows were removed only after verifying their exact run marker. The preceding account list was unchanged; no module completion, eligibility, certificate or paid pass was created.

## Remaining

1. Make verified module completion, progress, stage/legacy badge and audit updates a single retry-safe transaction, preserving the original lesson/activity rules.
2. Make certificate eligibility recheck and issuance atomic under concurrent requests, retaining revocation/reissue history and original privacy/scoring rules.
3. Audit and test offline synchronization against those authoritative boundaries. Reading/practice synchronization must never manufacture official completion or entitlements.
4. Reconcile approved historical identities, entitlements, transactions and signing keys; no original customer import has occurred.

Do not equate the applied empty schema or a failing-quiz integration test with a complete successful 24-module/certificate workflow. Hosted Cloudflare validation and deferred Razorpay provider tests remain separate release gates.
