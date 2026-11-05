# OVU migration checklist — Supabase / Cloudflare

- [x] Preserve historical branches and production baseline.
- [x] Isolate OVU work on `migration/supabase-cloudflare`; leave the Store unchanged.
- [x] Verify real Supabase project connectivity and existing RLS/schema metadata.
- [x] Verify actual Google website sign-in, callback, session and no-pass protection.
- [x] Replace all former-vendor build/runtime packages and owned adapters.
- [x] Replace OVU's direct Store database dependency with its existing catalogue and links.
- [x] Retain all four MCP tools with official SDK protocol handling and per-user authorization.
- [x] Make certificate signing require a private key; correct the profile-table reference.
- [x] Pass local security/scientific checks and built Worker route/asset tests.
- [x] Measure assets, upload dry run and local startup; document actual Cloudflare limits/pricing.
- [x] Prepare deployment and rollback procedures.
- [x] Save approved local Supabase OAuth server/Site URL settings and verify discovery/signing compatibility; keep dynamic registration off.
- [x] Review OAuth token scope/RLS and verify real PKCE consent, four MCP tools and delegated-token restrictions.
- [x] Confirm intended administrator identity and locally verify reviewed admin/OAuth migration.
- [x] Apply approved schema, provision the confirmed administrator and register local QA client; verify both actual admin screens without entitlement changes.
- [ ] Reconcile historical certificate keys and all customer identities, entitlements and records.
- [x] Persist official assessment sessions/results in PostgreSQL; verify process/Worker restart, retries, grading and practice separation.
- [ ] Make module completion, progress and stage awards atomic and retry-safe.
- [ ] Make certificate issuance atomic under concurrency and complete offline-sync/business-workflow tests.
- [ ] Run actual Razorpay provider tests when authorized; currently deferred.
- [ ] Obtain staging approval; validate actual Cloudflare CPU/memory/startup and full hosted workflows.
- [ ] Obtain separate production cutover, live payment and DNS approvals.
- [ ] Obtain separate Lovable cancellation approval after production verification.

This is not a production-completion declaration. See `TEST_RESULTS.md` for tested behavior and limitations.

## Atomic Academy completion checkpoint

Migration 0009 is installed in the new OVU Supabase project. The exact transaction passed PostgreSQL rollback/integrity tests and preserved all nine preflight record digests on the target, including 24 existing unverified progress rows. No customer records, certificates or entitlements were imported or changed. The three new RPCs are executable only by the service role, not anon/authenticated callers.

Official module completion now atomically persists canonical completion, module progress, both badge representations, preliminary all-module eligibility and its audit record under the same user lock. Original instructional/activity/scoring rules are preserved. Durable grading remains a preceding recoverable transaction; retrying the saved result completes interrupted awards. Stage revalidation is transactional and fails closed on database/query errors; an outage cannot revoke badges by being mistaken for an empty module list. Previously earned badge dates are retained, and retries do not announce the same badge again.

Validated activities have content-bound event IDs and database uniqueness. Duplicate delivery returns the original record; changed content under the same ID is rejected. Reading updates use monotonic upserts and preserve omitted bookmarks. Legacy quiz compatibility remains practice-only. Anonymous practice never creates official completion, certificate eligibility or paid access. Offline retries require a positive persistence acknowledgement and preserve events appended during an in-flight flush.

Verification: 23 real PostgreSQL checks, eight offline/activity checks, 15 MCP/runtime security checks, five actual target read-only checks, TypeScript, Cloudflare build and deployment dry run passed. Existing suites passed: nine completion, eight achievement, 12 final-exam, 26 certificate-generation and 34 certificate-admin assertions (10 grouped contracts). Assertions were retained. Secret scan: zero private server/certificate-key matches across 626 generated build files and 968 repository files.

Actual built Worker + actual Supabase QA passed: cold restart, independent server grading, concurrent identical/conflicting submissions, immutable retries, raw snapshot/RPC denials, anonymous practice, four successful first-stage module assessments, four canonical completions and audits, one stage award in each representation, preserved award date on retry, monotonic reading/bookmarks, and no certificate eligibility or paid access from first-stage completion. The marked synthetic account and its rows were removed; preceding identities were preserved. The test initially called an unused tree-shaken achievement wrapper; it now calls the same progress endpoint as the rendered Academy, retaining the achievement assertions. A separately interrupted local run required recovery of its exact marked fixture; it was removed without changing original identities. Request bounds and safe stage logging were added; this is not a hosted performance measurement.

Still open: account-isolated offline queues and cross-tab/account transitions; stale local verified flags; atomic certificate issuance/reissue/revocation and private/public certificate access review; the complete 24-module official certificate journey; full browser/mobile/scientific workflows; historical data and identity/entitlement reconciliation; hosted Cloudflare startup/CPU/memory and staging. Actual Razorpay provider testing remains deferred and unverified. Store and live production remain untouched.

## Offline account safety checkpoint

Progress caches are separated by account and guest. The old shared cache remains available only as guest practice; its original data is retained. Cached official module flags, quiz verification and stage awards require a fresh authoritative read. Cross-tab navigation/bookmark updates preserve the current server-confirmed awards but cannot introduce new official awards. Successful canonical refreshes clear stale verification and display verified modules at 100%; outages do not supply an empty authoritative state. Account-transition generations discard stale in-flight responses.

New queued events retain their original owner. Synchronization uploads only matching-owner events; anonymous and legacy unowned events remain local and are never assigned to the next account. Reading and activity APIs compare the expected owner with the authenticated user before any write, covering token changes between queue selection and delivery. Guest practice remains usable locally and does not count as pending official synchronization. This does not backfill old anonymous work into official progress.

Verification: 12 focused queue/activity/cache checks, final TypeScript and Cloudflare build passed. Actual built Worker + actual Supabase QA passed both account-mismatch denials and all retained restart, concurrency, grading, activity deduplication, monotonic reading, stage award and no-paid-access checks. The disposable identity and its rows were removed; preceding identities were preserved. One prior local request timed out; the retained timeout evidence records cleanup success, and the same assertions passed on rerun without changing application behavior or the timeout. Credential scan found zero actual private server/certificate-key matches across 628 build files and 970 repository files.

Browser spot checks: signed-in Academy hydration/cloud sync, 390x844 mobile menu and no horizontal overflow, bookmark addition/reload persistence and restoration to its original zero-bookmark state. Temporary viewport override was reset. These are sampled UI checks, not complete offline network-failure, simultaneous multi-tab write-race, cross-account browser or full 3D regression certification.

Next release gates remain atomic certificate issuance/admin mutations, certificate download/public-data privacy, the full 24-module official certificate journey, simultaneous offline write durability and complete browser/mobile/scientific workflows, historical data reconciliation, and hosted Cloudflare validation. Provider payment testing remains deferred and unverified. Store and production remain untouched.
