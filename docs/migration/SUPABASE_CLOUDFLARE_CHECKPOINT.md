# OVU Supabase / Cloudflare checkpoint — 4 November 2026

## Scope and preserved history

The user canceled the Hostinger/MariaDB target and selected Supabase project
`pdvwkdggyyrfkoqrpbji` with Cloudflare hosting for OVU only. The Store is outside
the current scope. Do not change its code, data or services.

Development branch: `migration/supabase-cloudflare`, based on original
Supabase-compatible `origin/main` commit
`ba30dc9035a229eb475c5d36ec7ef1b6bf2db263`. The MariaDB migration branch and
its verified work remain preserved at `3d8be60`; applicable security and Academy
improvements still need reconciliation with PostgreSQL. This branch is not a
claim that all prior migration improvements have been ported.

## Verified preparation

- Read-only project inspection found 22 public tables, all with RLS enabled,
  28 policies, no authentication users and no storage buckets.
- `apply_access_purchase` execution is restricted to postgres/service_role.
- The target is missing the repository's subscription-administration table
  and functions. No schema changes or customer imports have been made.
- Separate public/server project keys are stored outside Git with Windows
  DPAPI encryption and restricted Windows file permissions.
- The independent Cloudflare Vite configuration builds both client and Worker
  outputs. Provider request-context boundaries were carried over from the
  previously verified voice implementation.
- Google sign-in now uses the Supabase SDK directly with PKCE, replacing the
  Lovable auth bridge and preview token storage broker.
- The user approved creation of the Google web client named
  **OVU Supabase Sign-in** with only this redirect URI:
  `https://pdvwkdggyyrfkoqrpbji.supabase.co/auth/v1/callback`.
  Creation was verified. Its credential backup is encrypted outside Git;
  no credential values belong in this document.

## Google setup status

The Google client is enabled but Google currently restricts OAuth access to
listed test users. The Supabase Google provider was disabled at inspection.
Its configuration form is open for the user's private entry and submission
of the newly created credentials. Provider enablement and an actual sign-in
must be verified afterward. Creation of the Google client alone does not
establish working Google authentication.

## Actual checks

- TypeScript: passed at this checkpoint.
- Independent Cloudflare client/Worker build: passed.
- Read-only target Supabase API/schema/auth-settings test: 1 passed.
- Auth navigation validation: passed.
- Voice validation: 61 checks passed on an idle retry. A run concurrent with
  the build failed its timing benchmark; thresholds were not changed.
- Built Cloudflare local preview: `/auth` returned HTTP 200 with HTML and the
  Google sign-in UI on `127.0.0.1:31751`.
- Scanned 618 generated build files for the actual server key, certificate
  signing secret and Google client secret: zero matches.

These checks do not establish complete browser, mobile, Google sign-in,
Academy, storage, payment or deployment compatibility.

## Remaining work and restrictions

1. Finish private Google provider configuration; verify callback allowlists,
   test-user eligibility and the actual local sign-in/session/logout flow.
2. Reconcile admin schema, atomic Academy assessment/certification and offline
   synchronization with the target PostgreSQL schema and authorization.
3. Replace remaining Lovable MCP runtime dependencies while preserving its
   authenticated per-user tools. The OVU embedded Store feed is still an
   external dependency; do not silently remove it or migrate the Store.
4. Address the dependency audit (18 findings: 15 moderate, 3 high), including
   the Lovable MCP dependency chain, before release.
5. Verify missing storage/data, certificate signing and historical certificate
   compatibility. No identities or entitlements have been reconciled/imported.
6. Complete real Worker browser/mobile/security testing and Cloudflare
   resource/plan assessment. Check generated assets for credential leakage.

Razorpay provider checkout/webhook testing remains deferred and explicitly
unverified. Production services, live payments, customer access, deployment,
hosting purchases, domains/DNS and Lovable cancellation remain unauthorized.

References: [Cloudflare TanStack Start guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/),
[Cloudflare local environment variables](https://developers.cloudflare.com/workers/local-development/environment-variables/).
