# OVU Supabase / Cloudflare checkpoint — 4 November 2026

## Subsequent verified dependency-removal phase

See `LOVABLE_DEPENDENCY_INVENTORY.md`, `TEST_RESULTS.md` and
`CLOUDFLARE_READINESS_REPORT.md` for the subsequent work. All remaining vendor
runtime/build packages have been replaced; the historical consent URL is only
a compatibility redirect. This older checkpoint's remaining-work list is
superseded by `MIGRATION_MASTER_CHECKLIST.md`. The user's successful Academy
UI testing is recorded separately from automated/backend evidence. Production
completion, external MCP OAuth, absent admin RPCs, historical records and actual
provider payment tests remain separate release gates.

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

The user privately saved the Google credentials in Supabase. Both the public
Auth settings API and dashboard now confirm Google is enabled. After the
user's explicit approval, the local redirect `http://127.0.0.1:31751/auth**`
was saved and verified; the default Site URL remains `http://localhost:3000`.
The actual built application button reaches Google's account chooser with
the correct client ID, Supabase callback and local Academy return destination.
The user completed account selection/consent and confirmed success. The browser
returned to `/learn`; fresh navigation to `/account` retained the signed-in
session and showed no active paid pass. The signed-in `/universe` route required
an active pass, including after a built-Worker restart. Google currently
restricts OAuth access to listed test users; no audience or publishing settings
were changed. Token refresh, logout and further authorization cases remain
to be tested.

## Actual checks

- TypeScript: passed at this checkpoint.
- Independent Cloudflare client/Worker build: passed.
- Read-only target Supabase API/schema/auth-settings test: 1 passed.
- Repeated read-only check after private configuration: 1 passed; Google
  provider enabled. The test never invokes payment-access RPCs or writes data.
- Auth navigation validation: passed.
- Voice validation: 61 checks passed on an idle retry. A run concurrent with
  the build failed its timing benchmark; thresholds were not changed.
- Built Cloudflare local preview: `/auth` returned HTTP 200 with HTML and the
  Google sign-in UI on `127.0.0.1:31751`.
- Scanned 618 generated build files for the actual server key, certificate
  signing secret and Google client secret: zero matches.
- Built browser Academy sign-in screen renders; no browser warning/error logs
  were reported before OAuth navigation. Google account chooser reached.
- Actual user-completed Google callback and signed-in account navigation pass.
  Initial browser integration exposed invalid API-key errors in student profile
  reads: the Worker middleware had only Node environment fallbacks. It now
  accepts the same Vite public project configuration as the browser SDK.
  The rebuilt Worker no longer logs those errors and loads a student profile;
  do not count the original fallback profile as successful persistence.
- A full reload retained both the signed-in session and the same student
  public ID after that fix. The account continued to show no active paid pass.
- Rebuilt client/Worker after middleware configuration fix: passed (45.84s
  client, 42.28s server). Built local application restarted successfully.
- Dependency lock comparison: 85 package paths added, one removed, zero
  pre-existing package versions changed. Most diff size is lock formatting.

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
