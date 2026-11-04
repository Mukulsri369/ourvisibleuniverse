# OVU migration status — 4 November 2026

**OVU runs locally with the new Supabase project and independent Cloudflare Worker build. Production migration is not complete.** The Store remains unchanged.

Lovable runtime/build packages, telemetry and outbound OVU runtime endpoints were replaced on `migration/supabase-cloudflare`. The historical consent URL is only an owned compatibility redirect. Google sign-in, callback, session persistence and no-paid-pass protection have been verified. Original scientific data/calculations and the existing embedded recommendation catalogue remain preserved.

## Approved new-project changes completed

The owner explicitly approved the reviewed schema, selected administrator and local public OAuth client. Migrations 0006/0007 were applied as one transaction to `pdvwkdggyyrfkoqrpbji`: four admin/summary functions, the protected audit table and 18 restrictive OAuth policies are installed. The confirmed recent Google account received only the trusted administrator role; its preceding app metadata is encrypted privately, and unrelated metadata was preserved. No paid entitlement was granted.

Before/after record counts and full-record hashes match: zero access passes, zero certificates, zero administrative grants in the target. This proves preservation of current target records, not migration/reconciliation of original customers.

Actual built-app certificate registry and subscriber administration were verified through the Google session. The manually registered public **OVU Local MCP QA** client has only `http://127.0.0.1:31752/callback`. Dynamic registration remains off. The user completed consent. Actual PKCE exchange and all four tools passed; delegated tokens could not read raw private profiles/passes, invoke administrator RPCs, or use website server functions. The QA runner's initial transport-reuse failure was fixed with a fresh SDK connection; discovery/issuer state binding is retained. Tokens/verifiers stayed in memory and the QA process was stopped afterward.

## Verification and remaining work

Recorded local checks include 8 PostgreSQL transaction/authorization checks, 14 MCP/runtime security tests, 34 certificate-admin acceptance checks, 3 built Worker session-boundary tests and 3 actual read-only target-project checks. Earlier verified checks include 63 astronomy checks, 26 certificate-generation fixture checks, auth navigation, TypeScript, build, native route/asset checks and sampled browser/mobile behavior. Fixture results do not establish concurrent hosted Academy issuance.

Remaining work includes durable/atomic official Academy state across Worker restarts, full business/browser regression, historical certificate signing keys and approved customer/payment/entitlement reconciliation. The assessment source still contains process-memory final-exam sessions; successful UI testing does not establish restart safety. Do not declare deployment-ready until that is reconciled and tested against PostgreSQL. Razorpay provider testing remains deferred and unverified.

Cloudflare staging deployment, platform resource measurements, production data import, live payment configuration, DNS cutover and Lovable cancellation remain separately gated. No deployment, production change, hosting purchase or Store change was made. See TEST_RESULTS.md, ADMIN_OAUTH_REVIEW.md, CLOUDFLARE_READINESS_REPORT.md and the deployment/rollback runbooks.
