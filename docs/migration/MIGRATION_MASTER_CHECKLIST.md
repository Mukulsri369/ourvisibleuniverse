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

## Atomic certificate and complete Academy API checkpoint

Migration 0010 is installed in the new OVU Supabase project. All 12 pre/post table digests matched; no identity, progress, payment, certificate or customer record was backfilled or changed by installation. A partial unique index enforces one active certificate per user/course/version. Service-only transactions lock the same learner key as grading/completion and recheck all 24 canonical module completions plus a durable official final assessment at >=80%. Cached eligibility, practice scores, preferred UI level and legacy navigation cannot qualify a new certificate. Issuance, correction, reissue and revocation persist their audit atomically; failures roll back and retries preserve identifiers/lineage without duplicate events. The private insertion helper denies direct execution even to the service role (its metadata can still appear in this project's OpenAPI).

New signatures use the established HMAC-SHA256 scheme with a versioned canonical payload binding certificate number, owner, course/version, score/date, recipient public ID/name/display name, level and curriculum version. Existing v1 signatures remain supported with their original key. Unknown signature versions fail closed. Keys stay in Worker memory and never enter SQL/build artifacts. A certificate uses its passed final-exam level, not a caller-selected preferred level; administrators retain explicit audited correction functionality.

Raw certificate SELECT now permits only the owning first-party account; public verification and opt-in exports use the application privacy boundary. Private/missing profiles receive a generic name. Public full-name export requires the existing explicit public visibility flag and, for minors, the configured guardian-consent flag. Owner/admin PDF and metadata export remain available; both PDF themes passed against built workerd. Missing profile storage fails closed for public exports. This respects configured consent state; it is not a new guardian-identity verification system. Public opt-in names reflect the issued certificate rather than an independently edited profile name.

Verification: 12 PostgreSQL certificate checks plus 16 MCP/runtime security checks passed, 23 existing durable assessment/completion PostgreSQL checks passed, all 26 original certificate-generation and 34 certificate-admin assertions passed, six actual target connection/schema/permission checks passed, and 63 astronomy integrity checks passed. TypeScript, Cloudflare build and deployment dry run passed. The original public-name fixture now explicitly opts an adult synthetic profile into sharing; its assertions were retained. A migration guard test initially found the profile primary-key mismatch (user_id versus id); it was fixed before target execution. No test was deleted or disabled.

Actual Supabase + built Worker QA passed the complete 24-module API journey: physical activity validation, official module scoring/completion, six badges, certificate denial before the final, the 20-question final at exactly 80%, four concurrent certificate claims returning one record/audit, private anonymous download denials, public opt-in metadata sharing, minor-name sharing denial without configured consent, both owner PDF themes, metadata export, cold restart/reclaim, non-admin denial, correction, reissue lineage/retry, revocation/retry and one audit per mutation. A temporary admin role was confined to the fresh marked synthetic fixture; removing it immediately denied a stale admin JWT. The synthetic account and all its rows were removed; the preceding identity list was preserved. No paid access or provider payment was created. This API journey does not substitute for a complete browser-by-browser 24-module interaction test.

Remaining work: simultaneous offline write durability, broader profile-data exposure/authorization review, complete browser/mobile/scientific workflows, comprehensive schema typings, account/email delivery checks, historical customer/storage/signing-key reconciliation and hosted Cloudflare validation. Actual Razorpay provider testing remains deferred and unverified. Store, live services, customer access, DNS, purchases and deployment remain untouched/unauthorized.

## Concurrent offline journal checkpoint

The real Academy now stores each pending reading/activity event independently instead of replacing a shared queue array. Acknowledgements remove only confirmed immutable events. Another tab's newly appended event survives a pending flush. Account separation and server content-bound idempotency remain unchanged. Legacy bytes are preserved; only positively acknowledged owned legacy entries receive tombstones. Anonymous/unowned records are never uploaded into a newly signed-in account. New events do not accumulate indefinite acknowledgement tombstones. Storage failures retain pending data and show a retry message rather than reporting persistence success.

Twenty focused queue/activity/cache/journal checks passed, including concurrent appends and flushes, delayed receipts, account-ID collisions, failed requests, quota failures, corrupt legacy data and conflicting immutable IDs. TypeScript and Cloudflare build passed. Three actual built website session-boundary tests still return 401 for forged/body-only authority. Credential scan found zero actual private values across 634 build files and 982 repository files at this checkpoint.

Two real browser tabs used the exact production journal and flush modules in a separate key-free loopback QA harness: both appends survived, a third event added during held receipts remained pending, simulated delivery failure retained it, reconnect acknowledged it, and one account could not clear another account's work. Synthetic events were removed, both QA tabs closed and their server stopped. The real rebuilt Academy also retained the signed-in owner, cloud-sync status and zero official awards. The harness deliberately does not claim a full 24-module offline browser journey or real network-fault testing of the product UI.

Preserve the verified certificate commit 591c39a and earlier checkpoints. Remaining technical work includes broader profile-data/legacy synchronization authorization review, complete browser/mobile/scientific and email-delivery checks, comprehensive schema typings and historical data reconciliation. Hosted Cloudflare validation/deployment requires separate approval. Razorpay provider testing remains deferred and unverified; production, Store and customer access remain unchanged.
