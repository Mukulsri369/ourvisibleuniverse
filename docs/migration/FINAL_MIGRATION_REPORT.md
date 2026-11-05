# OVU migration status — 4 November 2026

**OVU runs locally with the new Supabase project and independent Cloudflare Worker build. Production migration is not complete.** The Store remains unchanged.

Lovable runtime/build packages, telemetry and outbound OVU runtime endpoints were replaced on `migration/supabase-cloudflare`. The historical consent URL is only an owned compatibility redirect. Google sign-in, callback, session persistence and no-paid-pass protection have been verified. Original scientific data/calculations and the existing embedded recommendation catalogue remain preserved.

## Approved new-project changes completed

The owner explicitly approved the reviewed schema, selected administrator and local public OAuth client. Migrations 0006/0007 were applied as one transaction to `pdvwkdggyyrfkoqrpbji`: four admin/summary functions, the protected audit table and 18 restrictive OAuth policies are installed. The confirmed recent Google account received only the trusted administrator role; its preceding app metadata is encrypted privately, and unrelated metadata was preserved. No paid entitlement was granted.

Before/after record counts and full-record hashes match: zero access passes, zero certificates, zero administrative grants in the target. This proves preservation of current target records, not migration/reconciliation of original customers.

Actual built-app certificate registry and subscriber administration were verified through the Google session. The manually registered public **OVU Local MCP QA** client has only `http://127.0.0.1:31752/callback`. Dynamic registration remains off. The user completed consent. Actual PKCE exchange and all four tools passed; delegated tokens could not read raw private profiles/passes, invoke administrator RPCs, or use website server functions. The QA runner's initial transport-reuse failure was fixed with a fresh SDK connection; discovery/issuer state binding is retained. Tokens/verifiers stayed in memory and the QA process was stopped afterward.

## Verification and remaining work

Recorded local checks include 8 PostgreSQL transaction/authorization checks, 14 MCP/runtime security tests, 34 certificate-admin acceptance checks, 3 built Worker session-boundary tests and 3 actual read-only target-project checks. Earlier verified checks include 63 astronomy checks, 26 certificate-generation fixture checks, auth navigation, TypeScript, build, native route/asset checks and sampled browser/mobile behavior. Fixture results do not establish concurrent hosted Academy issuance.

Remaining work includes atomic Academy module/progress/stage awards and certificate issuance, full business/browser regression, historical certificate signing keys and approved customer/payment/entitlement reconciliation. Official assessment sessions are now durable and verified across both a new Node process and a cold built Worker restart against Supabase. Atomic module/progress/award and certificate issuance transactions remain outstanding. Razorpay provider testing remains deferred and unverified.

Cloudflare staging deployment, platform resource measurements, production data import, live payment configuration, DNS cutover and Lovable cancellation remain separately gated. No deployment, production change, hosting purchase or Store change was made. See TEST_RESULTS.md, ADMIN_OAUTH_REVIEW.md, CLOUDFLARE_READINESS_REPORT.md and the deployment/rollback runbooks.

## Atomic Academy completion checkpoint

Migration 0009 is installed in the new OVU Supabase project. The exact transaction passed PostgreSQL rollback/integrity tests and preserved all nine preflight record digests on the target, including 24 existing unverified progress rows. No customer records, certificates or entitlements were imported or changed. The three new RPCs are executable only by the service role, not anon/authenticated callers.

Official module completion now atomically persists canonical completion, module progress, both badge representations, preliminary all-module eligibility and its audit record under the same user lock. Original instructional/activity/scoring rules are preserved. Durable grading remains a preceding recoverable transaction; retrying the saved result completes interrupted awards. Stage revalidation is transactional and fails closed on database/query errors; an outage cannot revoke badges by being mistaken for an empty module list. Previously earned badge dates are retained, and retries do not announce the same badge again.

Validated activities have content-bound event IDs and database uniqueness. Duplicate delivery returns the original record; changed content under the same ID is rejected. Reading updates use monotonic upserts and preserve omitted bookmarks. Legacy quiz compatibility remains practice-only. Anonymous practice never creates official completion, certificate eligibility or paid access. Offline retries require a positive persistence acknowledgement and preserve events appended during an in-flight flush.

Verification: 23 real PostgreSQL checks, eight offline/activity checks, 15 MCP/runtime security checks, five actual target read-only checks, TypeScript, Cloudflare build and deployment dry run passed. Existing suites passed: nine completion, eight achievement, 12 final-exam, 26 certificate-generation and 34 certificate-admin assertions (10 grouped contracts). Assertions were retained. Secret scan: zero private server/certificate-key matches across 626 generated build files and 968 repository files.

Actual built Worker + actual Supabase QA passed: cold restart, independent server grading, concurrent identical/conflicting submissions, immutable retries, raw snapshot/RPC denials, anonymous practice, four successful first-stage module assessments, four canonical completions and audits, one stage award in each representation, preserved award date on retry, monotonic reading/bookmarks, and no certificate eligibility or paid access from first-stage completion. The marked synthetic account and its rows were removed; preceding identities were preserved. The test initially called an unused tree-shaken achievement wrapper; it now calls the same progress endpoint as the rendered Academy, retaining the achievement assertions. A separately interrupted local run required recovery of its exact marked fixture; it was removed without changing original identities. Request bounds and safe stage logging were added; this is not a hosted performance measurement.

Still open: account-isolated offline queues and cross-tab/account transitions; stale local verified flags; atomic certificate issuance/reissue/revocation and private/public certificate access review; the complete 24-module official certificate journey; full browser/mobile/scientific workflows; historical data and identity/entitlement reconciliation; hosted Cloudflare startup/CPU/memory and staging. Actual Razorpay provider testing remains deferred and unverified. Store and live production remain untouched.
