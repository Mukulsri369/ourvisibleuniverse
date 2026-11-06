# OVU verification — 4 November 2026

## Checkout activation completed — 6 November 2026, 09:36 UTC

Cloudflare's earlier API 503 blocker has cleared. The authorized final deployment succeeded: version **2fbe3dac-7c22-4227-b6cf-3690e22b929e**, verified as the latest deployment receiving 100% of traffic. Version inspection confirms production origin https://ourvisibleuniverse.in, owned Supabase pdvwkdggyyrfkoqrpbji, Live mode, and **RAZORPAY_LIVE_CHECKOUT_ENABLED=true**. All five exact existing secret binding names remain present; values were not displayed or rotated. Apex/www Custom Domains and the retained signed-webhook Workers hostname remain attached. Startup 2 ms; no plan purchase. Earlier checkout-held/blocker sections below are historical.

Post-activation: 12 production HTTP checks passed (both hosts' home, pricing, checkout, Academy and certificate pages; unsigned Live webhook 401; wrong-mode webhook 400). Browser checkout correctly requires sign-in, and the production passes page renders its original plans/prices. No charge, refund, customer-access change or original-service write was performed. Actual paid checkout, authentic provider event delivery and paid-access activation from a new purchase remain **unverified** until the owner completes a real transaction privately. Do not equate enabled configuration with end-to-end provider verification. Gemini, human email recovery and the other previously documented acceptance/capacity limitations remain pending. Store and Lovable resources remain unchanged.

The final configuration, deployed-version metadata and postflight results are retained outside Git under work/evidence/ovu-checkout-activation-*. No credentials, customer exports or private provider identifiers are included in this report. If checkout must be held again, redeploy the verified configuration with only its checkout flag false; retain the signed webhook/recovery services and all target data/journals.


## Current production state — 6 November 2026, DNS cutover completed

The owner explicitly approved replacement of the two backed-up A records. Only apex/www A records pointing to 185.158.133.1 were removed; triggers-only deployment successfully attached both hostnames to the existing OVU Worker. Cloudflare now lists four unchanged CNAME/TXT records and two managed Worker records. Both production domains serve the new application over HTTPS using owned Supabase. Store is unchanged; Lovable resources remain intact for rollback. Earlier approval-pending and unattached-domain statements below are historical.

**Checkout activation is currently blocked by Cloudflare's control-plane API returning HTTP 503, “no healthy upstream.”** Three final activation deployment attempts failed during their preliminary GET of the existing Worker service, before upload. The last independently verified active version remains b6e783bf-c8f7-46de-baff-9c5e803a9f4e, production origin/Live mode with new checkout held false. Do not report checkout enabled or the migration fully accepted. The prepared final configuration enables checkout only after the completed drain; retry the existing final deploy when the API recovers, then verify the actual deployed bindings/version before declaring activation. No keys were rotated and no provider charge/refund was made.

The old 600-second A-record TTL elapsed after the first proven domain attachment at 09:13:54 UTC. Post-drain source snapshot at 09:24:31 UTC contains 79 users/7 access records and the same data-only SQL SHA-256 b07d44b3a5189cad5d76e4d394ad67e33f76279a96dc637342dcf711c80a341a. Reconciliation: 79 preserved, zero new accounts/conflicts, zero writes. Target retains 80 users/8 access records including the previously approved recovery. Read-only provider audit at 09:24:16 UTC found the same 8 scoped paid/12 pending orders; the two source-only unmatched records are the already recovered purchase and the fully refunded excluded order. Target has 13 Live orders/1 transaction. Old Lovable aliases are not write-frozen; reconcile any later alias writes before retirement.

Production checks: nine public SSR routes returned 200, absent route 404, www 200, Vega catalogue search returned Vega, anonymous MCP 401, unsigned Live webhook 401, wrong-mode webhook 400. Workers hostname retains noindex; production has no global noindex header. Browser: homepage renders; anonymous 3D Atlas returns sign-in; subscriber admin exposes no customer records and offers sign-in; synthetic nonexistent certificate lookup returns not found; no captured browser console errors. A requested 390px viewport override still reported 1280px actual width: **production mobile verification is not established** by that attempt. Authenticated production Google/paid 3D journeys, actual new checkout/authentic Razorpay delivery, Gemini and human email recovery remain pending owner/provider testing. Existing staging and backend results remain historical evidence, not substitutes. Seven production-configuration/time-regression checks passed, zero failures/skips.

Rollback: retain the zone backup, encrypted source/target snapshots, recovery and pending-order journals. To revert routing, remove the two managed Worker domain attachments and restore only the two original A records/TTL 600; preserve target writes and reconcile them before any database rollback. Do not restore an old seven-pass snapshot over the approved recovery. No cancellation, purchase or Store migration was performed.


## Actual held upload and domain conflict — 6 November 2026

Worker upload passed: version `b6e783bf-c8f7-46de-baff-9c5e803a9f4e`, 15,925.26 KiB raw/3,546.81 KiB gzip, startup 1 ms; current production-origin/checkout-hold variables and five secret binding names independently verified. Domain triggers only partially updated: both CLI and actual dashboard Add Domain returned 100117 for the existing A records. Public NS uses Cloudflare; apex A still uses 185.158.133.1. No domain attachment, DNS deletion or complete application cutover is claimed. Triggers-only CLI dry run passed; two-record deletion confirmation awaits approval. Three timestamp regression tests passed in addition to the prior 47-check release set.

## Merchant delivery-log inspection and timestamp regression — 6 November 2026

Correct merchant Owner/Live session verified; exact existing enabled webhook/four events confirmed. Actual developer View logs reports no requests in its selected past-three-hours window. Numeric Unix creation-time checks place both unmatched purchases about five days before this inspection and before webhook setup. The earlier post-snapshot chronology was wrong, not a delivery failure. Three new tests passed for explicit-offset timestamps, UTC/IST equivalence, second boundaries and rejection of locale dates/Date-object/millisecond coercion. No financial provider write, replay or Support message occurred; real new-checkout/provider-origin delivery remains unverified.

Fresh 14:21:37 IST read-only snapshots and reconciliation: 79 source users/seven passes with unchanged data hash; zero missing accounts/conflicts. Encrypted target backup: 80 users/eight passes, 34 tables/281 rows; inventory/hash round-trip passed. Source/target prior snapshots retained, fresh plaintext downloads removed.

## Pending-order transition and production drain preparation — 6 November 2026

Forty-seven payment-service, scoped recovery, pending-registration, production/staging/Live-configuration checks passed with zero failures/skips. These include preserving historical provider prices, mapped ownership, optional absent/null currency-note compatibility with conflicting-currency denial, complete prevalidation before append, immutable binding refusal and no duplicate registration. Existing tests were retained. An initial real registration attempt stopped before writes at the optional note representation mismatch; it was corrected and tested rather than bypassed.

Actual MariaDB-free owned Supabase operation: 12 pending orders inserted; zero active-access grants/provider writes; eight existing passes unchanged. Actual rerun inserted zero, preserved 12 bindings and the same eight passes. Fresh source snapshot remains 79 users/seven passes with identical data hash; final read-only reconciliation has zero missing users/conflicts. Refreshed logical target backup covers 34 tables/281 rows, 80 users/eight passes and all recovery/registration changes; encryption/inventory integrity checks passed.

Production dry run passed (15,925.26 KiB raw/3,546.81 KiB gzip); all five existing private binding names verified without reading values. Drain-only config forces new checkout off; final activation still fails without verified drain. No production deployment occurred. Razorpay authentic webhook delivery remains unverified; delivery logs require the owner's renewed private merchant sign-in. Do not infer an actual provider delivery success or defect from local tests or provider-backed recovery.

## Approved 30-day recovery — 6 November 2026

Twenty-seven scoped legacy recovery and existing payment-service tests passed (zero failures/skips). Actual approved recovery revalidated the original provider references, owner, plan, INR amount, captured/refund state and mapped target identity before mutation, using only GET at Razorpay. The existing backend recovery/atomic capture created one 30-day pass, preserved all seven preceding pass rows and verified a repeated recovery returns one pass and the same expiry. Twelve provider reads; zero charges/refunds/provider writes, emails or role changes. Private approval/result journal is encrypted outside Git. No public recovery bypass or provider-origin webhook event was added/fabricated. Ordinary new-checkout/webhook acceptance remains distinct.

## Production auth, logical backup and financial preflight — 6 November 2026

Production Supabase Site URL and two additional return patterns persist after reload; the two preceding returns remain. Cloudflare overview now shows active zone; this does not mean the new application is attached to production domains.

Two backup query/integrity tests passed. Actual read-only backup capture: 28 public + six auth/storage tables, 266 rows, 80 users, seven passes, 18 functions/49 policies and schema metadata. Inventory/count validation and encrypted decrypt/hash round-trip passed; zero target storage objects. Plaintext download removed; private backup stays outside Git. Restore rehearsal not performed.

Twelve authenticated read-only provider GETs verified all six imported Live pass purchases and found no refunds on those six. A complete scoped order audit (one order page plus two payment-detail reads) found 12 unpaid orders and two additional paid orders absent from source history: one fully refunded, one unrefunded captured payment. Current owned-project Node API reads confirm zero Live orders and transactions. A first PowerShell API probe was rejected because its default user agent was classified as a browser; its empty output was not treated as evidence. The independent Node read then succeeded. The source remains 79 users/seven passes. No financial/customer writes were made by these audits; no new-backend provider checkout acceptance is claimed. A private recovery plan is prepared for owner confirmation, without exposing its customer identifiers in Git.

## Approved DNS delegation postflight — 6 November 2026

GoDaddy's saved state confirms the exact approved Cloudflare pair. Six authoritative DNS queries against `candy.ns.cloudflare.com` passed for apex/www A, `_domainconnect` CNAME, `_dmarc`, `_lovable` and `_lovable.www` TXT. Both A values remain the original origin. Cloudflare still reports registrar propagation pending; an immediate public-resolver NS check returned the old pair. No active-zone, production application routing or production-auth acceptance is claimed. Production auth settings are prepared but unsaved pending action-time confirmation. No code changed in this DNS step; the prior 20-test reconciliation run and TypeScript/build results are retained rather than rerun without cause.

## Fresh source delta and DNS inventory — 6 November 2026

Twenty source-query conversion, customer-import and reconciliation tests passed: zero failures/skips. Read-only source SQL verifies 79 users, seven access rows and only one public application table. The one-query scoped snapshot includes identities and MFA/passkey/storage metadata; raw data stays encrypted outside Git. Conversion preserves JSON/null/escapes and entitlement microseconds through the existing parser, and rejects mismatched source/incomplete inventory/unmapped data.

Actual approved delta import: one original-ID account created, one exact historical Live pass inserted; all 79 preceding target identities and six passes preserved. No existing account/access updates, deletions, emails or provider payments. Independent postflight reconciliation: 80 target identities, 79 source users represented, seven exact source passes, zero new/missing accounts/conflicts/unhandled public tables. This does not prove no later source writes or recover a complete historical financial ledger.

Actual GoDaddy zone export contains nine DNS records. DNSSEC is off and forwarding unset. Cloudflare's pending zone now preserves all six application record values; apex/www still point directly at the original origin with 600-second TTL. Nameserver change is prepared, not submitted. No production DNS or Worker deployment changed in this step.

## Production preparation — 6 November 2026

Fourteen focused production/staging/Live-configuration checks passed (zero failures/skips), including rejection of each missing cutover prerequisite, exact account/project/domain restrictions, retained payment settings and Workers-host noindex after promotion. TypeScript and the public-only client/Worker build passed; existing deprecation/chunk/sourcemap warnings remain. Credential scan found zero private Supabase/certificate values in 650 build files plus 1,035 source files. No actual credentials were written into the configuration or tests.

Read-only reconciliation against the verified 5 November source snapshot again found 78 source users represented in the 79-identity target, six source access records, zero conflicts/unhandled public tables and zero writes. Private identity/access evidence was saved encrypted outside Git. This verifies the previous import only: the source UI's later seventh access record is not yet reconciled, and no fresh complete source export or full target backup was verified in this step.

The owner reports successful application/payment acceptance. No agent-performed financial transaction or independent full provider ledger acceptance is claimed. Cloudflare Free onboarding reached DNS review; no production domain routing, nameserver change or application deployment occurred. Browser timeouts prevented the full registrar inventory and source-delta inspection; refresh requested. See [PRODUCTION_CUTOVER.md](PRODUCTION_CUTOVER.md).

## Live staging payment setup enabled — 6 November 2026

The user completed private webhook-secret entry. Razorpay's saved webhook is **Enabled** at the exact staging `/api/public/payments/razorpay?mode=live` endpoint, confirms that a secret was provided, and lists `payment.failed`, `payment.captured`, `order.paid`, `refund.processed`. Both original and staging websites remain approved. A private fingerprint comparison also confirmed that the provisioned Live Key ID matches the signed-in merchant; no key values were displayed.

Live checkout is now enabled under the recorded approval. Active Worker version **`7714f66b-0a87-4d6d-ac22-2569fc0cd0f0`**, application commit `73344ef`: `RAZORPAY_MODE=live`, `RAZORPAY_LIVE_CHECKOUT_ENABLED=true`, historical-read override absent, correct owned Supabase/staging origin and all five private bindings verified. Upload 15,925.06 KiB raw / 3,546.72 KiB gzip; reported startup 2 ms. The approved temporary Worker alone was deployed; original production, Store, DNS and billing were not changed.

After activation, nine hosted privacy/SSR checks passed. Two further actual webhook-boundary probes passed (Live invalid signature 401; wrong Test mode 400), without provider calls or customer writes. The previously recorded signed setup/replay/cleanup probe used the same application with checkout held off and does not represent Razorpay-origin event delivery. No agent-initiated payable order, charge, capture or refund was performed.

**Setup is ready for owner testing; end-to-end financial acceptance remains unverified.** Successful checkout, provider capture, authentic Razorpay-origin webhook delivery, paid-access activation and financial refund behavior still require the actual owner-performed workflow. Gemini, email delivery/human recovery, broader acceptance/capacity, complete historical financial reconciliation and final old-site data synchronization remain open before any production cutover. See [LIVE_PAYMENT_TEST_HANDOFF.md](LIVE_PAYMENT_TEST_HANDOFF.md). Earlier pending-activation entries below are historical.

## Approved staging website and signed Live endpoint — 6 November 2026

Razorpay's persisted dashboard now shows both the original `.in` domain and the exact Workers staging address as **Approved**. The owner created a dedicated reviewer login privately and submitted it to Razorpay. Independent verification found 79 identities (78 historical accounts plus this reviewer), a normal authenticated role, no administrator app role and zero access passes for the reviewer. No personal administrator login/password or API secret was supplied to the website-review form.

The approved original Live pair plus a distinct 256-bit webhook secret are now provisioned only to `ovu-supabase-staging`; both Supabase/certificate bindings were retained. The new secret is Windows-encrypted outside Git. Binding-only version `796ddbab-7a83-4fa9-9034-6c848d3159ed` was checked to retain test mode and historical Live entitlement reads before endpoint deployment.

Application commit `73344ef` adds an explicit server-only `RAZORPAY_LIVE_CHECKOUT_ENABLED` hold on new Live order creation. The configuration generator defaults it to false; activation requires both verified merchant approval and configured webhook. Capture verification, webhook handling and interrupted-payment recovery remain available during a checkout hold. Thirty-six payment tests, the amended eight-test gate/signature/config subset, TypeScript and client/Worker build passed. Scans found zero actual Live payment values across 1,683 files and zero Supabase server/signing values in 652 build + 1,031 source files at that snapshot.

Current endpoint deployment: `7004f3a3-0404-4ef9-8e97-4198b88af51b` (15,925.06 KiB raw / 3,546.72 KiB gzip, reported startup 2 ms). It uses `RAZORPAY_MODE=live`, removes the historical-read override, and keeps **new Live checkout disabled** with the explicit hold. Existing Live pass reads therefore follow the ordinary Live environment path. No custom domain routes, DNS or billing changes were made.

The actual hosted signed readiness probe passed: wrong mode 400, invalid HMAC 401, valid setup event 200, identical retry 200 and exactly one ignored setup event. That exact disposable setup record was removed and complete entitlement snapshots matched. It used `ovu.setup.check`, not a fabricated payment/refund, and made zero Razorpay API calls. This verifies the signed endpoint and storage/deduplication path; **it does not verify provider-origin webhook delivery or financial processing**.

The separate Razorpay webhook form has the exact Live endpoint and four events selected. The owner must privately paste its separate secret and click Create Webhook. The private helper is open with the encrypted secret masked; its value has not been inspected or displayed. Final webhook confirmation and checkout activation are pending that credential handoff. Charges/refunds remain unperformed; historical financial-ledger reconciliation and final old-site synchronization remain required before cutover.

## Current hosted payment-backend checkpoint — 6 November 2026

Application commit `b0f19ea` is deployed as Worker version `baed6c52-3612-4dc7-8217-fc8ddb3495e6`. Upload 15,924.84 KiB raw / 3,546.64 KiB gzip; reported startup 2 ms. The deployment retained test payment mode, historical live-entitlement reads and the two existing private Supabase/certificate bindings; Cloudflare secret-name inspection confirms no Razorpay bindings. Nine hosted privacy/route postflight checks passed after deployment. The existing administrator account page loaded correctly with its expected no-live-pass status and no recovery error; no pass or customer data was modified. Actual checkout, recovery with a provider payment, webhook delivery, and refund acceptance remain unverified.

The Live merchant's additional-website flow requires private two-step verification before its URL form. Preparation reached that prompt; an OTP was sent by Razorpay. The prompt was canceled without entering a code or submitting a website. No verification was bypassed. Additional staging website approval, Live key provisioning/activation and the new webhook remain approval gates. The webhook form is unsaved and has no secret. The original approved website, API pair, production site, DNS and Store remain unchanged. Three additional pure Live-configuration tests passed; the generated Live config remains local and undeployed.

## Payment backend verified; Live activation pending — 6 November 2026

The existing Live Razorpay pair is encrypted locally only; no upload, provider request, key rotation or checkout activation occurred. Migration 0012 is installed in the owned Supabase project with all six original entitlements preserved. 49 combined regressions, 2 real-HMAC unit tests, 27 rolled-back PostgreSQL assertions, 9 real Supabase/built-app checks (including restart and concurrent replay), TypeScript, build and 2 built SSR checks passed. Disposable fixtures were removed; existing customers and access records matched pre-test snapshots. Private-value artifact scans found zero matches. Provider payments remain unverified.

Read-only merchant inspection shows the original `.in` website approved and no configured Live webhook. The Workers staging address has not been approved; the separate webhook is unsaved. Live activation requires exact staging approval, private server bindings, `RAZORPAY_MODE=live` with the historical-read override removed, and approved webhook configuration. Production, Store, DNS, merchant configuration and billing are unchanged. See [RAZORPAY_MIGRATION_REPORT.md](RAZORPAY_MIGRATION_REPORT.md). Earlier Test-mode deferrals below are historical; the owner's current choice is reuse of the original Live pair without Test-key regeneration.

## Customer transfer completed — 5 November 2026

The authorized fresh snapshot (2026-11-05 14:15:21 UTC) is now imported into the owned Supabase project: 77 accounts created, one existing administrator account preserved (78 source users represented), nine supported password hashes transferred privately, and six exact historical access records inserted (five live / one sandbox). No existing accounts were patched/deleted and no emails/payments were sent. Repeat reconciliation finds zero missing accounts, zero access differences and zero conflicts.

Cloudflare staging version `44441fc7-f935-4acc-ac16-6ffe65fdbb4a` reads these live historical entitlements while payment mode remains test and payment keys remain absent. Its actual admin dashboard shows five live subscribers with active access. Anonymous data privacy, hosted authorization and route smoke checks passed. See [CUSTOMER_TRANSFER_RESULTS.md](CUSTOMER_TRANSFER_RESULTS.md) for actual evidence, source limitations, rollback and testing instructions.

Use the approved staging URL for owner testing. Original production/DNS/Store/live payment settings are unchanged. Later source writes are not automatically synchronized. Gemini, actual provider payments and email delivery/human recovery remain deferred; broader acceptance/capacity and final synchronization are still required before production cutover. Earlier no-import/no-authorization checkpoints below are historical.


## Latest staging deployment — 5 November 2026

Application commit `89fc844` is deployed as Worker version `f655e3f6-66cc-49c2-b2a6-9fc9ec303648` at https://ovu-supabase-staging.mukul-srivastava-025.workers.dev. Upload: 15,907.16 KiB raw / 3,541.03 KiB gzip; Cloudflare reported 1 ms startup. Both existing private server bindings were retained (names verified, no secret values read). Hosted recovery, expired-link handling, four SSR/no-index smoke routes and actual 390×844 recovery layout passed; no real password or email request was submitted. The earlier full 24-module hosted API and MCP runs are recorded separately and were not repeated for this auth UI change.

Eight recovery unit tests, five disposable-account provider recovery checks, 24 combined recovery/runtime/MCP regressions, seven staging checks, three actual-built authorization checks, auth navigation, TypeScript and build passed. The initial built-boundary rerun hit a stopped preview server; starting the actual built server and rerunning all three passed. Credential scan: zero private-value matches across 641 built and 999 source files at the scan snapshot.

Gemini and Razorpay provider testing remain explicitly deferred and unverified. Actual email delivery/human recovery, historical data reconciliation, broader browser/offline testing and sustained production CPU headroom remain open. Production, Store, DNS, live payments, customer entitlements and billing remain unchanged. See [PASSWORD_RECOVERY_VERIFICATION.md](PASSWORD_RECOVERY_VERIFICATION.md) and [HOSTED_STAGING_REPORT.md](HOSTED_STAGING_REPORT.md). Prior checkpoints below are historical.


## Password recovery follow-up — 5 November 2026

The missing recovery UI is implemented using Supabase PKCE and the normal Auth API, with an identity-pinned memory-only update client. Eight recovery tests, five actual disposable-account Supabase checks, existing auth navigation, and the combined 24-test security/recovery regression passed. The fixture was removed and existing identities preserved; no email was sent. Browser expired-link handling and actual 390×844 layout passed without entering a real password. Actual email delivery and a private human-completed recovery remain unverified. See [PASSWORD_RECOVERY_VERIFICATION.md](PASSWORD_RECOVERY_VERIFICATION.md). Gemini and Razorpay provider testing remain explicitly deferred.


## Initial hosted staging checkpoint — 5 November 2026

OVU is deployed at https://ovu-supabase-staging.mukul-srivastava-025.workers.dev on the existing Workers Free plan. Active tested version: `e6abed40-270b-4c68-8547-828770f43554`; application build: `7f215f7`. Approved Supabase staging Site URL and auth redirect are saved; local auth redirect is retained. Actual hosted 24-module assessment/certificate API QA, Google sign-in, all four MCP tools, sampled admin/mobile/galaxy and paid-access-denial journeys passed. Seven staging checks, 21 security checks and TypeScript passed. Hosted retry testing does not constitute a forced platform restart.

Observed CPU P50 10.06 ms / P99 105 ms exceeds the nominal Free 10 ms budget despite zero observed resource errors; sustained production capacity is not verified. No purchase or upgrade occurred. Gemini and Razorpay provider testing are explicitly deferred and unverified. Email recovery, broader workflow testing and approved historical reconciliation remain outstanding. Production, Store, DNS, live payments and customer entitlements remain unchanged. See [HOSTED_STAGING_REPORT.md](HOSTED_STAGING_REPORT.md) for evidence and limits. Earlier checkpoint entries below describe historical state.


## Executed checks

| Check | Actual result |
| --- | --- |
| TypeScript `tsc --noEmit` | Passed |
| Independent Cloudflare client/Worker build | Passed |
| MCP + runtime-independence tests | 12 passed, zero failures/skips |
| Existing certificate generation acceptance suite | 26 passed using explicitly isolated in-memory test fixtures and a synthetic signing key |
| Existing certificate verification/admin acceptance suite | 34 passed using explicitly isolated in-memory test fixtures; assertions retained |
| Original astronomy integrity/scale suite | 63 passed, zero failures |
| Original auth navigation suite | Passed, including local `127.0.0.1:31751` callbacks and blocked browser storage |
| Original built preview validation | Passed in native `workerd`: public routes, stylesheet MIME, HEAD, missing assets and rejected asset writes |
| Built Worker security HTTP checks | Passed: correct MCP metadata, ignored spoofed forwarding, unauthenticated 401, hostile Origin 403, catalogue API, invalid payment mode 400 |
| Deployment dry run | Passed without upload; size recorded in readiness report |
| Local startup check | Completed; 59.9 ms active CPU, not a platform certificate |
| Public dependency audit | Zero production findings; 14 moderate development findings retained openly |
| Build secret scan | Zero actual private credential matches; simulator `.wrangler` runtime state excluded |
| Browser homepage | Correct Unicode, existing catalogue/cards/links and snapshot notice; no captured console errors |
| Browser mobile 390×844 | No horizontal overflow, six visible cards, category filtering exercised; viewport restored |

The browser caught an intermediate text-encoding regression caused by a file edit. It was corrected before commit; the app was rebuilt and a UTF-8 regression assertion now covers the affected text/prices. The initial bad browser result is not counted as a pass.

The existing certificate-admin suite initially failed its minor-privacy assertion because its fixture still used the nonexistent `academy_student_profiles` name. Both production lookup and fixture/emulator now use `student_profiles`; the original privacy checks pass. The emulator is explicitly test-only. These 60 acceptance checks are not real-database concurrency or persistence evidence.

Certificate-admin authority now uses only trusted app metadata or explicitly configured server-side IDs/verified emails. User-editable metadata and old hardcoded default emails no longer grant admin authority. At that checkpoint no real role/access was modified. Subsequent hardening now rejects bare UUIDs as authentication entirely and ignores request-body admin tokens.

The final native preview was restarted after the release-candidate build. The original built preview suite passed again; the browser retained the signed-in account without an active paid pass. A Windows rebuild initially encountered locked simulator SQLite files; preview state now uses a per-process temporary directory outside the build output, and the clean rebuild passed. Neither the failed attempt nor test-only fixture runs are counted as platform/production success.

The MCP tests cover signed OAuth JWTs, missing client claims, incorrect roles/issuer/audience, expiration, forged tokens, all four original tools, input validation, scientific lookup results, per-caller token/user filtering, future-pass exclusion and rejection of legacy service-role keys. SDK-owned protocol validation remains enabled.

Google website sign-in was separately verified with the user's private account selection/consent: callback to Academy, signed-in account view, persistent session and stable student ID after reload, no paid pass and a blocked protected universe. The user subsequently reported Academy completion/certification/admin/offline checks working. That report is recorded as user testing rather than an agent-run production integration suite.

## Approved local OAuth configuration

Subsequent approved configuration check: **2 read-only project/OAuth-discovery tests passed**. OAuth discovery changed from `404 feature_disabled` to HTTP 200, with the correct issuer, same-project endpoints, S256 PKCE and ES256 signing keys. Saved dashboard settings persisted after reload: OAuth enabled, dynamic registration off, consent `/oauth/consent`, Site URL `http://127.0.0.1:31751`. The built consent page rejected a deliberately invalid authorization ID with “Authorization unavailable”; no client or authorization was created. Google remains enabled. These checks do not establish a successful real client consent/token exchange.

## Explicitly not verified

- Actual Razorpay Test Mode checkout, authentic webhook delivery, refunds and recovery against the provider; all remain deferred by the user.
- Cloudflare-hosted MCP client flow remains unverified; actual local consent/PKCE/tools and restrictions passed in the subsequent approved phase below.
- Platform-hosted Worker CPU/memory/startup, SSL and custom domains: no deployment authorized.
- Migration/reconciliation of existing customer identities, transactions, entitlements, storage or historical certificates.
- Customer history is not imported. Admin RPCs were subsequently installed and verified with explicit approval, as recorded below.
- Full automated browser regression for every 3D simulation and concurrent official Academy award/certificate issuance. Astronomy invariants and sampled UI checks do not substitute for those workflows.

Evidence logs and screenshots are kept in the workspace's private `work/evidence` and `outputs` directories, outside Git. Never publish raw credentials or customer exports as test evidence.

## Administrator and scoped OAuth candidate

Local candidate checks: 8 PostgreSQL tests passed, 14 MCP/runtime security tests passed, 34 existing certificate-admin checks passed, and TypeScript passed. The PostgreSQL suite exercises the exact generated review transaction twice and proves its integrity guard rolls back a deliberately injected record deletion. The native Worker rejected a forged website token with HTTP 401. These checks do not grant roles or create OAuth clients. Target installation, actual delegated token exchange and first-party administrator UI verification are pending action-time approval. See ADMIN_OAUTH_REVIEW.md.

Final rebuilt Worker checks: **3 session-boundary tests passed**: forged header, body-only administrator UUID, and body-only token all return HTTP 401. The first POST test attempt used plain JSON rather than TanStack's Seroval wire format and failed in deserialization (HTTP 500); the harness now uses the same Seroval serializer as TanStack, and the retained 401 assertions pass against actual handlers. No production behavior was weakened to accommodate that harness error. TypeScript and the final Cloudflare build passed; original subscription-admin PostgreSQL regression also passed. Browser `/account` retained the Google session, student ID and “No active pass” after restart.

## Approved target application and actual OAuth — latest verified phase

- Actual SQL transaction succeeded; separate target verification matched preflight access/certificate record counts and hashes. Four functions, 18 restrictive policies, audit RLS and zero audit rows verified.
- Confirmed Google owner promoted to trusted administrator with previous app metadata encrypted privately; unrelated metadata preserved. No access pass created.
- Actual built certificate registry and sandbox subscriber dashboard load successfully for that account and show empty records. No grant, revoke, correction or issuance was performed. The account had been visibly restricted before provisioning.
- Three actual read-only target project tests passed: existing schema/Google settings, installed audit schema plus anonymous RPC denials, OAuth discovery/JWKS. No purchase or mutation RPC invoked.
- User completed local client consent. Actual PKCE token exchange and all four MCP tools passed. Delegated token raw profile/pass reads return no rows, administrator RPC returns 403, and website admin function returns 403. Summary exposes only its four intended fields. No provider credentials configured or payment requests made.
- Initial OAuth QA failed due to reconnecting an already started SDK transport. The runner now uses a fresh connection after code exchange, preserves SDK discovery/issuer binding with PKCE state, and passes the retained assertions. Tokens and verifiers are memory-only; QA process stopped after evidence capture.

These results supersede earlier pending-administrator/local-OAuth notes above. They do not prove historical customer migration, official Academy restart/concurrency safety, actual provider payments or hosted Cloudflare behavior.

## Durable official assessment checkpoint

Migration 0008 is installed in the new project. The exact integrity-guarded transaction passed locally and on the target; existing attempts, eligibility and certificate hashes stayed unchanged. Canonical snapshots and the commit RPC deny anon/authenticated access; service execution is allowed.

**11 PostgreSQL tests passed**, including fresh-process final-exam recovery and 80% scoring, immutable retries, owner/level binding, outages without official fallback, independent SQL scoring, rollback, practice/historical provenance exclusion and database-free anonymous passing-practice retries. The production path was exercised using real PostgreSQL behind a test HTTP adapter; legacy synthetic acceptance fixtures remain explicitly isolated and do not substitute for those tests.

**Actual built Worker + actual Supabase QA passed**: disposable identity, official quiz start, cold Worker restart, server-side failed grading, same-result retry, changed-answer rejection, private snapshot/RPC denials, anonymous practice retry and anonymous official-start denial. No module award, certificate eligibility, certificate or paid access was granted. The owned fixture was removed, and preceding identities remained unchanged. An initial harness attempt lacked TanStack serialization context; the harness now uses the installed TanStack parser/serializer inside its required context. Application authorization was not weakened.

Current regressions: 12 original final-exam checks, 9 completion checks, 26 certificate-generation checks and 34 certificate-admin checks passed with assertions retained. The final-exam fixture script now explicitly selects the placeholder emulator so it cannot target real students. Four actual read-only project checks, 14 security tests and 3 built session-boundary tests passed. TypeScript and Cloudflare build passed; no hosted deployment or provider payment test is implied.

Atomic completion/progress/awards and concurrent certificate issuance remain open. The actual Supabase QA exercised a failing quiz, not a successful official 24-module/certificate journey. Scientific calculations and visual assets were not changed.

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


## Profile privacy and navigation checkpoint

Migration 0011 is installed in the new OVU Supabase project; all 12 pre/post record digests matched. Raw student profiles are owner-only, browser progress writes are denied and service-only navigation synchronization preserves canonical completion/date and monotonic reading without awarding official access. Login uses only account-owned caches and rejects stale identity responses. Concurrent profile creation returns one committed public ID; outages cannot fabricate persisted identities. The actual browser exposed a stale guest-default editor bug, now fixed by initializing the editor from the current profile when opened. No account settings were saved during UI QA.

Verification: eight new PostgreSQL checks, 19 runtime/offline/cache checks, eight original student checks, 63 astronomy checks and three built session-boundary checks passed. TypeScript and the final Worker build passed. Actual Supabase/built Worker QA passed the full 24-module official assessment/certificate/admin/privacy/restart journey plus profile creation/privacy/account-switch and canonical-navigation replay checks. Its marked synthetic identity and rows were removed; preceding identities were preserved. No paid pass or provider payment was created. Final deployment dry run passed without upload (15,894.03 KiB raw / 3,538.06 KiB gzip). Desktop/mobile editor fields match the persisted profile; 390×844 document overflow was false, viewport restored. Public galaxy rendering/selection worked; a legacy distance-unit abbreviation error was found separately.

See PROFILE_NAVIGATION_MIGRATION.md for contracts, evidence boundaries and rollback. Broad legacy SDK typing, complete browser/scientific and email-delivery checks, approved historical data reconciliation and hosted staging remain outstanding. Provider payments remain deferred/unverified. Store, production, live access, DNS, purchases, deployments and Lovable cancellation remain unchanged.


## Scientific UI and provider-readiness follow-up — 5 November 2026

Committed profile/navigation baseline: 21d96d7. The galaxy selector no longer drops the word Million and mislabels million-light-year values as ly: it now displays 2.537 Mly, 23 Mly, 29.3 Mly and 2.73 Mly, while retaining 163,000 ly for the LMC. Underlying distances, calculations and 3D models are unchanged. Actual catalogue selection and a visible 3D canvas passed in the rebuilt browser. The existing galaxy regression passed 63 catalogue approaches at four viewport sizes, 16 observed guide/portrait pairs and 42,541 survey records. TypeScript and the Worker build passed.

Anonymous browser QA used separate loopback origin 31753, with no account session: Module 01 cosmic zoom moved from Earth to the Earth–Moon view; four practice answers scored 100%; official mode required sign-in; the learning map retained zero verified modules/badges; the paid universe redirected to authentication. This sampled workflow does not claim all 24 modules were completed through browser controls. The full 24-module official journey is separately covered by the actual Supabase/built API test.

The original preview test passed all public routes, stylesheet MIME/HEAD, rejected asset writes and missing-asset checks. An initial run occurred while the build was replacing its output and correctly failed for missing build configuration; rerunning after build completion passed without changing any assertion or timeout. All 131 COSMOS foundation checks passed. Provider-backed Gemini chat/TTS/Live calls remain unverified; the local preview now accepts GEMINI_API_KEY as a private memory-only binding when explicitly configured, matching the existing server contract. No Gemini key was entered and no provider-backed request was intentionally invoked during these checks. Grounded/browser-speech fallbacks are not proof of working Gemini service.

Read-only Cloudflare CLI identity check: not authenticated. No login, upload, purchase, account setting, production/DNS/payment/customer-access change was performed. Hosted validation requires private Cloudflare authentication and separate staging-deployment approval. Email delivery/reset, external AI service checks, historical records/storage/signing-key reconciliation and actual payment-provider tests (deferred by user) remain release gates. Existing instructional placeholders, including the galaxy collision sandbox, were preserved and are not claimed to have been implemented by migration.


## Approved staging preparation checkpoint

Temporary staging deployment is approved, with no purchases or production/DNS/payment/customer-access changes. A separate staging-only configuration preparer and conditional no-index response boundary are implemented. Six unit/actual-built staging checks, TypeScript, build and the three existing forged-session boundary checks passed. The final dry run completed without upload: 15,894.70 KiB raw / 3,538.24 KiB gzip. Credential scan found zero actual private-value matches across 634 build files and 991 repository files. See CLOUDFLARE_STAGING_PREPARATION.md for exact scope, runtime contracts and handoff.

The official CLI login uses the installed Windows keyring adapter and limited account/user read, Worker-script write and log-read scopes. Authorization timed out before a code was received. The user must finish private Cloudflare sign-in, then a fresh authorization attempt can proceed. No hosted account/plan/origin verification, secret upload or deployment has occurred. Do not repeat the granted staging approval. Actual provider payments remain deferred and unverified; external AI/email and historical reconciliation remain outstanding.

## Additional anonymous browser QA

The actual built application was opened at the separate localhost origin, without the signed-in 127.0.0.1 or staging session. Module 13 practice accepted four answers and displayed 100% (4/4), explicitly describing practice as non-certifying. Its official assessment control requested a student account, and the verified checklist remained incomplete with no official attempt. Local exploration/navigation progress is not canonical certified completion. The anonymous sign-in screen displayed Forgot password; following it displayed the labeled email-request form. No email or password was submitted. The hosted owner still showed the same public student ID and CLOUD SYNC after the deployment. These are sampled browser checks, not a complete offline/network-fault matrix.

## Explicit email verification deferral — 5 November 2026

The user explicitly chose to leave actual recovery email delivery and the human-completed password-reset workflow unverified for now. Do not repeat the recovery handoff request unless the user resumes this testing. Automated recovery/provider-token checks remain passed; they are not email-delivery verification. Gemini and Razorpay provider testing also remain explicitly deferred. This deferral does not mark production readiness complete or authorize production, DNS, billing, customer entitlement or Store changes.
