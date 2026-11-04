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
- [ ] Reconcile process-memory official assessment sessions with durable PostgreSQL state, then prove restart/concurrency/atomic issuance beyond user-reported UI checks.
- [ ] Run actual Razorpay provider tests when authorized; currently deferred.
- [ ] Obtain staging approval; validate actual Cloudflare CPU/memory/startup and full hosted workflows.
- [ ] Obtain separate production cutover, live payment and DNS approvals.
- [ ] Obtain separate Lovable cancellation approval after production verification.

This is not a production-completion declaration. See `TEST_RESULTS.md` for tested behavior and limitations.
