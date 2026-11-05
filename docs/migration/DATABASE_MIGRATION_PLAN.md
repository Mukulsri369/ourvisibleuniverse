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

## Atomic Academy completion checkpoint

Migration 0009 is installed in the new OVU Supabase project. The exact transaction passed PostgreSQL rollback/integrity tests and preserved all nine preflight record digests on the target, including 24 existing unverified progress rows. No customer records, certificates or entitlements were imported or changed. The three new RPCs are executable only by the service role, not anon/authenticated callers.

Official module completion now atomically persists canonical completion, module progress, both badge representations, preliminary all-module eligibility and its audit record under the same user lock. Original instructional/activity/scoring rules are preserved. Durable grading remains a preceding recoverable transaction; retrying the saved result completes interrupted awards. Stage revalidation is transactional and fails closed on database/query errors; an outage cannot revoke badges by being mistaken for an empty module list. Previously earned badge dates are retained, and retries do not announce the same badge again.

Validated activities have content-bound event IDs and database uniqueness. Duplicate delivery returns the original record; changed content under the same ID is rejected. Reading updates use monotonic upserts and preserve omitted bookmarks. Legacy quiz compatibility remains practice-only. Anonymous practice never creates official completion, certificate eligibility or paid access. Offline retries require a positive persistence acknowledgement and preserve events appended during an in-flight flush.

Verification: 23 real PostgreSQL checks, eight offline/activity checks, 15 MCP/runtime security checks, five actual target read-only checks, TypeScript, Cloudflare build and deployment dry run passed. Existing suites passed: nine completion, eight achievement, 12 final-exam, 26 certificate-generation and 34 certificate-admin assertions (10 grouped contracts). Assertions were retained. Secret scan: zero private server/certificate-key matches across 626 generated build files and 968 repository files.

Actual built Worker + actual Supabase QA passed: cold restart, independent server grading, concurrent identical/conflicting submissions, immutable retries, raw snapshot/RPC denials, anonymous practice, four successful first-stage module assessments, four canonical completions and audits, one stage award in each representation, preserved award date on retry, monotonic reading/bookmarks, and no certificate eligibility or paid access from first-stage completion. The marked synthetic account and its rows were removed; preceding identities were preserved. The test initially called an unused tree-shaken achievement wrapper; it now calls the same progress endpoint as the rendered Academy, retaining the achievement assertions. A separately interrupted local run required recovery of its exact marked fixture; it was removed without changing original identities. Request bounds and safe stage logging were added; this is not a hosted performance measurement.

Still open: account-isolated offline queues and cross-tab/account transitions; stale local verified flags; atomic certificate issuance/reissue/revocation and private/public certificate access review; the complete 24-module official certificate journey; full browser/mobile/scientific workflows; historical data and identity/entitlement reconciliation; hosted Cloudflare startup/CPU/memory and staging. Actual Razorpay provider testing remains deferred and unverified. Store and live production remain untouched.
