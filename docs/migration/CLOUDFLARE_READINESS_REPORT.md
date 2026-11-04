# Cloudflare readiness — OVU only — 4 November 2026

The application builds with Cloudflare's official TanStack Start Vite integration and runs locally in `workerd`. Cloudflare **Workers with Static Assets** is the target, rather than a static-only Pages upload. React, Three.js, SSR, server functions, HTTP APIs and webhook routes remain in the application. Supabase supplies database/auth/storage services over HTTPS. No deployment has been performed.

## Measured local results

| Check | Result |
| --- | --- |
| Native Worker build and restart | Passed; no Lovable or Nitro build adapter |
| Wrangler deployment dry run | Passed, explicitly `--dry-run`; no upload |
| Worker upload size | 15,863.67 KiB uncompressed, 3,531.46 KiB gzip at the measured checkpoint; approximately 15.5 MiB |
| Static files | 249 |
| Largest static file | 18,385,556 bytes, existing black-hole MP4; no files above 25 MiB |
| Local startup profile | 59.9 ms active CPU; local measurement, not Cloudflare platform validation |
| Private build credential scan | Zero server-key, certificate-key or Google-secret matches across 624 build files; local simulator state excluded |
| Production dependency audit | Zero known vulnerabilities |
| Development dependency audit | 14 moderate findings, primarily ESLint/Drizzle tooling chains |

Sizes are measurements, not permission to upload. Minor subsequent source corrections can change exact byte counts; repeat the dry run for the approved release commit.

Cloudflare currently documents a 64 MiB uncompressed Worker limit, 128 MB memory, a one-second startup limit, and a 25 MiB individual static-file limit. The measured artifact sizes fit. Local startup profiling does not certify production startup or request CPU/memory. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

## Suitable plan and costs

**Workers Standard/Paid is the production candidate**, with a $5/month minimum ($60 for twelve months before tax), 10 million monthly Worker requests and 30 million CPU milliseconds included. Overage is $0.30 per million requests and $0.02 per million CPU milliseconds. Static-asset requests are free. Supabase, domains, third-party APIs and applicable taxes are separate. No purchase is authorized. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

Free Workers allows 100,000 daily requests and only 10 ms request CPU. We have not established that OVU's SSR, certificate generation or large scientific routes fit that CPU allowance. Do not promise a free production deployment based on a successful build or on the separate startup profile. Paid request CPU also needs staging measurement and a configured cost cap. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

Use Node 22.12+ or a supported newer LTS version for build tooling; local checks used Node 24.15. The deployed runtime is Workers with `nodejs_compat`, not a persistent Node process. No local filesystem database, persistent disk session or background daemon is required by the replacement adapter. Required Node crypto behavior is covered by local runtime/security checks. Heavy science assets stay in static assets; do not load the entire 3D scene into every SSR response.

## Remaining release gates

1. The user approved local OAuth configuration on 4 November 2026. Supabase's OAuth server is now enabled, consent uses `/oauth/consent`, the Site URL is `http://127.0.0.1:31751`, and dynamic client registration remains disabled. Discovery and compatible ES256 keys are verified. No client was registered or authorized. Review OAuth-token scope/RLS and privileged-API exposure before registering a client; actual MCP client consent/token/tool workflows still require separate verification.
2. Read-only schema discovery still lacks `access_admin_audit`, `is_subscription_admin`, `admin_list_subscribers` and `admin_grant_access`. The existing SQL migration grants admin authority using an owner email; review/approve the identity/authorization model before applying it. No access was granted in this phase.
3. Certificate profile queries were corrected to the actual `student_profiles` table. The previous public fallback signing key was removed. Provision the private signing secret as a Worker secret. Historical certificates signed with a different/fallback key need an approved reconciliation/reissue plan; do not silently reissue or revoke them.
   Certificate-admin roles must be assigned through trusted app metadata or explicitly approved server configuration; no user-editable role or default email grants access. Configure the approved administrator identity before testing privileged workflows. The built-in database emulator now refuses non-test execution.
4. The user reported successful Academy checks. This report does not equate that with newly verified atomic PostgreSQL award/certificate transactions, concurrent issuance or production data reconciliation.
5. Razorpay checkout and authentic provider webhooks remain deferred and unverified. Local invalid-request rejection does not verify provider payment processing.
6. Configure an approved staging origin, Worker secrets, Supabase redirects/consent, email delivery and any needed storage policies. Do not set live payment credentials during local QA.
7. Obtain explicit staging/deployment approval, then validate Cloudflare startup, CPU, memory, SSR, real browser sessions and operational logs on the platform. Production customer import, payment configuration and DNS cutover require separate approval.

`workers_dev` and `preview_urls` remain disabled in source configuration. No domain route, schedule, live webhook endpoint or Cloudflare account setting was changed.

References: [official TanStack Start adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/), [local secrets](https://developers.cloudflare.com/workers/vite-plugin/reference/secrets/), [Supabase OAuth server setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started).
