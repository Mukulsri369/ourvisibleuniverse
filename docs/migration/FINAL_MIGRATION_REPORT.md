# OVU migration status — 4 November 2026

**Local dependency-removal and Cloudflare assessment phase completed; production migration is not complete.**

OVU builds and runs in native local `workerd` using the official Cloudflare adapter. All former-vendor runtime/build packages and outbound OVU runtime endpoints were replaced. Google website sign-in is verified. Original scientific data and calculations were preserved. The Store remains unchanged; OVU's existing recommendations and external Store links remain, with snapshot prices identified.

The recorded checks include 12 security tests, 63 astronomy checks, 26 certificate-generation and 34 certificate-admin acceptance checks, auth navigation, TypeScript, production build, native route/asset tests, sampled browser/mobile workflows, startup profiling and a deployment dry run. The certificate acceptance suites use isolated fixtures; they are not proof of real database transactions. Production dependency audit: zero known vulnerabilities. Development tooling: 14 moderate findings.

The replacement MCP endpoint and all four tools pass code/protocol/security checks. Actual external-client OAuth is still unverified because the new project's Supabase OAuth server is disabled. Enabling it and changing the new project's consent Site URL require explicit configuration approval. Dynamic registration remains disabled; no client was registered and no new external app was granted access.

Read-only discovery confirms the subscriber-admin table/RPCs remain absent. Certificate profile table references and unsafe admin/signing/test-emulator defaults were corrected in source. Approved admin provisioning, missing schema, atomic concurrency evidence, historical certificate keys and customer identity/entitlement/payment reconciliation remain release gates. No real account was granted paid access or an administrator role.

Razorpay provider tests remain deferred and unverified. No hosting purchase, deployment, production data change, live payment setting, DNS change or Lovable cancellation occurred.

See `CLOUDFLARE_READINESS_REPORT.md` for measured sizes, plan/limits and release conditions; `TEST_RESULTS.md` for actual evidence boundaries; and `DEPLOYMENT_RUNBOOK.md` / `ROLLBACK_PLAN.md` for the prepared next stages. Do not interpret this report's filename as authorization or confirmation of production cutover.
