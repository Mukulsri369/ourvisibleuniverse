# OVU migration checklist — Supabase / Cloudflare

## Verified payment initialization fix — 6 November 2026

Version d11ae3b4-01dc-4ee9-8813-d398cae5c94c fixes a reproduced Cloudflare-specific Fetch redirect error in the Razorpay adapter. Workers does not support redirect error; manual mode now stops redirects and the existing non-2xx rejection fails safely. Thirty-two payment/security tests, TypeScript and production client/Worker builds passed. Deployed Live checkout remains enabled with the same five secret bindings.

Actual signed-in production browser verification: Pay ₹179 successfully opens Razorpay's contact-details/payment dialog. Exactly one new unpaid Live order was registered (14 Live orders total); transactions remain 1. No charge, refund or entitlement activation was performed. A completed payment and authentic webhook-driven access activation remain unverified. Earlier generic-unavailability status is resolved for order initialization. Details and provider documentation: PAYMENT_WORKER_REDIRECT_FIX.md.


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


## Live staging payment setup enabled — 6 November 2026

The user completed private webhook-secret entry. Razorpay's saved webhook is **Enabled** at the exact staging `/api/public/payments/razorpay?mode=live` endpoint, confirms that a secret was provided, and lists `payment.failed`, `payment.captured`, `order.paid`, `refund.processed`. Both original and staging websites remain approved. A private fingerprint comparison also confirmed that the provisioned Live Key ID matches the signed-in merchant; no key values were displayed.

Live checkout is now enabled under the recorded approval. Active Worker version **`7714f66b-0a87-4d6d-ac22-2569fc0cd0f0`**, application commit `73344ef`: `RAZORPAY_MODE=live`, `RAZORPAY_LIVE_CHECKOUT_ENABLED=true`, historical-read override absent, correct owned Supabase/staging origin and all five private bindings verified. Upload 15,925.06 KiB raw / 3,546.72 KiB gzip; reported startup 2 ms. The approved temporary Worker alone was deployed; original production, Store, DNS and billing were not changed.

After activation, nine hosted privacy/SSR checks passed. Two further actual webhook-boundary probes passed (Live invalid signature 401; wrong Test mode 400), without provider calls or customer writes. The previously recorded signed setup/replay/cleanup probe used the same application with checkout held off and does not represent Razorpay-origin event delivery. No agent-initiated payable order, charge, capture or refund was performed.

**Setup is ready for owner testing; end-to-end financial acceptance remains unverified.** Successful checkout, provider capture, authentic Razorpay-origin webhook delivery, paid-access activation and financial refund behavior still require the actual owner-performed workflow. Gemini, email delivery/human recovery, broader acceptance/capacity, complete historical financial reconciliation and final old-site data synchronization remain open before any production cutover. See [LIVE_PAYMENT_TEST_HANDOFF.md](LIVE_PAYMENT_TEST_HANDOFF.md). Earlier pending-activation entries below are historical.

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


## Password recovery follow-up — 5 November 2026

The missing recovery UI is implemented using Supabase PKCE and the normal Auth API, with an identity-pinned memory-only update client. Eight recovery tests, five actual disposable-account Supabase checks, existing auth navigation, and the combined 24-test security/recovery regression passed. The fixture was removed and existing identities preserved; no email was sent. Browser expired-link handling and actual 390×844 layout passed without entering a real password. Actual email delivery and a private human-completed recovery remain unverified. See [PASSWORD_RECOVERY_VERIFICATION.md](PASSWORD_RECOVERY_VERIFICATION.md). Gemini and Razorpay provider testing remain explicitly deferred.


## Current hosted staging checkpoint — 5 November 2026

OVU is deployed at https://ovu-supabase-staging.mukul-srivastava-025.workers.dev on the existing Workers Free plan. Active tested version: `e6abed40-270b-4c68-8547-828770f43554`; application build: `7f215f7`. Approved Supabase staging Site URL and auth redirect are saved; local auth redirect is retained. Actual hosted 24-module assessment/certificate API QA, Google sign-in, all four MCP tools, sampled admin/mobile/galaxy and paid-access-denial journeys passed. Seven staging checks, 21 security checks and TypeScript passed. Hosted retry testing does not constitute a forced platform restart.

Observed CPU P50 10.06 ms / P99 105 ms exceeds the nominal Free 10 ms budget despite zero observed resource errors; sustained production capacity is not verified. No purchase or upgrade occurred. Gemini and Razorpay provider testing are explicitly deferred and unverified. Email recovery, broader workflow testing and approved historical reconciliation remain outstanding. Production, Store, DNS, live payments and customer entitlements remain unchanged. See [HOSTED_STAGING_REPORT.md](HOSTED_STAGING_REPORT.md) for evidence and limits. Earlier checkpoint entries below describe historical state.


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
- [x] Make module completion, progress and stage awards atomic and retry-safe.
- [x] Make certificate issuance/admin changes atomic; verify complete official certification through actual built APIs.
- [x] Preserve offline events across concurrent browser tabs and isolate owners; verify anonymous practice through the real UI.
- [ ] Complete the full browser/network-fault/scientific workflow matrix and external email/Gemini provider validation.
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


## Profile privacy and navigation checkpoint

- [x] Owner-only raw profile reads; committed public IDs under concurrent initialization.
- [x] Account-bound monotonic navigation RPC preserving canonical awards; direct browser progress writes denied.
- [x] Stale guest-default profile editor fixed and verified on desktop/mobile without saving owner changes.
- [x] Record-preserving 0011 installed; PostgreSQL and actual Supabase/built Worker workflows passed.
- [ ] Hosted staging, historical reconciliation, complete scientific/browser and email-delivery validation.
- [ ] Actual Razorpay provider testing (deferred at user request).

## Explicit email verification deferral — 5 November 2026

The user explicitly chose to leave actual recovery email delivery and the human-completed password-reset workflow unverified for now. Do not repeat the recovery handoff request unless the user resumes this testing. Automated recovery/provider-token checks remain passed; they are not email-delivery verification. Gemini and Razorpay provider testing also remain explicitly deferred. This deferral does not mark production readiness complete or authorize production, DNS, billing, customer entitlement or Store changes.
