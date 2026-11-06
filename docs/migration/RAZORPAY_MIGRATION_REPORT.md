# Razorpay migration — 6 November 2026

## Current production state — 6 November 2026, DNS cutover completed

The owner explicitly approved replacement of the two backed-up A records. Only apex/www A records pointing to 185.158.133.1 were removed; triggers-only deployment successfully attached both hostnames to the existing OVU Worker. Cloudflare now lists four unchanged CNAME/TXT records and two managed Worker records. Both production domains serve the new application over HTTPS using owned Supabase. Store is unchanged; Lovable resources remain intact for rollback. Earlier approval-pending and unattached-domain statements below are historical.

**Checkout activation is currently blocked by Cloudflare's control-plane API returning HTTP 503, “no healthy upstream.”** Three final activation deployment attempts failed during their preliminary GET of the existing Worker service, before upload. The last independently verified active version remains b6e783bf-c8f7-46de-baff-9c5e803a9f4e, production origin/Live mode with new checkout held false. Do not report checkout enabled or the migration fully accepted. The prepared final configuration enables checkout only after the completed drain; retry the existing final deploy when the API recovers, then verify the actual deployed bindings/version before declaring activation. No keys were rotated and no provider charge/refund was made.

The old 600-second A-record TTL elapsed after the first proven domain attachment at 09:13:54 UTC. Post-drain source snapshot at 09:24:31 UTC contains 79 users/7 access records and the same data-only SQL SHA-256 b07d44b3a5189cad5d76e4d394ad67e33f76279a96dc637342dcf711c80a341a. Reconciliation: 79 preserved, zero new accounts/conflicts, zero writes. Target retains 80 users/8 access records including the previously approved recovery. Read-only provider audit at 09:24:16 UTC found the same 8 scoped paid/12 pending orders; the two source-only unmatched records are the already recovered purchase and the fully refunded excluded order. Target has 13 Live orders/1 transaction. Old Lovable aliases are not write-frozen; reconcile any later alias writes before retirement.

Production checks: nine public SSR routes returned 200, absent route 404, www 200, Vega catalogue search returned Vega, anonymous MCP 401, unsigned Live webhook 401, wrong-mode webhook 400. Workers hostname retains noindex; production has no global noindex header. Browser: homepage renders; anonymous 3D Atlas returns sign-in; subscriber admin exposes no customer records and offers sign-in; synthetic nonexistent certificate lookup returns not found; no captured browser console errors. A requested 390px viewport override still reported 1280px actual width: **production mobile verification is not established** by that attempt. Authenticated production Google/paid 3D journeys, actual new checkout/authentic Razorpay delivery, Gemini and human email recovery remain pending owner/provider testing. Existing staging and backend results remain historical evidence, not substitutes. Seven production-configuration/time-regression checks passed, zero failures/skips.

Rollback: retain the zone backup, encrypted source/target snapshots, recovery and pending-order journals. To revert routing, remove the two managed Worker domain attachments and restore only the two original A records/TTL 600; preserve target writes and reconcile them before any database rollback. Do not restore an old seven-pass snapshot over the approved recovery. No cancellation, purchase or Store migration was performed.


## Delivery visibility and timestamp correction

The correct merchant Owner session is authenticated and in Live mode. The existing webhook URL, Enabled state and four events are verified. Actual logs at `/app/developers/webhooks` show no requests in the past-three-hours range. The two additional purchases missing source pass history are about five days old, preceding webhook creation and the source snapshot; earlier post-snapshot chronology was incorrect. Three timestamp regression checks passed. No failed-delivery diagnosis follows from the empty recent window. The approved recovery remains correct and idempotent; the refunded purchase remains excluded from active access.

No new checkout/charge/refund or provider-origin test event was initiated. End-to-end checkout and authentic webhook delivery remain explicitly unverified for owner acceptance after cutover. Existing configuration and signed endpoint tests, actual provider-backed recovery and immutable legacy bindings support the authorized phased release without fabricating financial events or contacting Support.

## Legacy pending ownership registered; authentic delivery still unverified

All 12 scoped unpaid original orders now have durable ownership/price/currency in the owned project, after fresh provider GETs and source-to-target identity validation. Original creation times and historical provider prices are retained. No access was granted by registration; the actual retry inserted zero duplicates and preserved all eight existing passes. Unknown arbitrary merchant orders remain rejected by the ordinary runtime. Future eligible captures/recovery can use these fixed bindings without a runtime Lovable lookup.

The refreshed target snapshot contains 13 Live orders (12 pending plus the specifically approved recovery) and one transaction. Actual provider-backed recovery/replay is verified, but newly created owned-backend checkout and authentic provider webhook delivery remain distinct and unverified. The target had no provider webhook events in the captured data. The existing Razorpay delivery-log page requires renewed private sign-in; automatic default-Google authentication did not reach the merchant account. No merchant account was created, keys rotated or provider settings changed. Inspect logs before enabling production checkout; do not diagnose a specific webhook defect without evidence.

## Specifically approved purchase recovered

The owner reviewed and approved the identified unrefunded 30-day purchase. A narrowly scoped maintenance command re-fetched the original order/payment, checked the exact reviewed references, verified source-to-target identity mapping and current confirmed account, and validated the INR amount, plan, captured state and zero refunds before registering its original order. It then used the existing independent payment service's recovery path and atomic database capture function. No provider write/charge/refund or fabricated webhook was made.

Actual result: one active 30-day purchase record created; all seven preceding access rows preserved unchanged. Replaying recovery returned the same expiry and exactly one pass (`duplicate=true`). Twelve read-only provider requests, zero emails and zero role changes. The original order creation timestamp is retained; private approval/result evidence is encrypted outside Git. Twenty-seven scoped recovery/payment-service checks passed with zero failures/skips, including refusal of a different identity, plan, amount, currency, reference or refunded state and refusal to overwrite conflicting durable ownership.

This verifies actual provider-backed recovery and atomic access/replay on the owned database. It does not prove a newly created owned-backend checkout or authentic Razorpay-origin webhook delivery. The fully refunded unmatched order was not granted access. Twelve unpaid original orders still require controlled registration/transition before application cutover; no generic unknown-order acceptance was added. Earlier pending-approval paragraphs below are historical.

## Production preflight: verified history and unresolved later payments

All six imported Live access purchases now have independent authenticated, read-only provider verification: matching payment/order/owner/plan, amount/currency and captured state; zero refunds on those six. Minimized proof is encrypted outside Git. No provider financial action was performed.

A wider bounded, paginated read-only audit found 12 unpaid scoped OVU orders and two additional paid orders absent from the source snapshot (both predate that snapshot and webhook setup). One is fully refunded; one is an unrefunded captured 30-day purchase missing a pass in both source history and the current owned payment ledger. Owned Live order/transaction counts were independently verified as zero using successful Node API reads. Do not label these as purchases already handled by the new backend, or infer provider checkout/webhook acceptance from earlier owner reports. Source remains 79 users/seven passes.

A private per-account recovery review is prepared outside Git. Its proposal registers/reconciles the authentic existing purchase through the backend and applies the purchased 30 days using the established later-of-now/current-expiry rule, without another charge. The owner's per-identity/access-period confirmation is required before this access change. No customer pass, role, refund or financial transaction has been modified by this audit. Before application traffic moves, resolve this payment, preserve the refunded history without active access, and establish controlled handling of late captures for the 12 pending original orders. Never permit arbitrary unknown merchant orders to bypass durable ownership registration. See [PRODUCTION_CUTOVER.md](PRODUCTION_CUTOVER.md).

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

## Live staging setup authorized; merchant verification pending — 6 November 2026

The owner explicitly approved the exact additional Workers staging website, provision of the existing Live pair only to `ovu-supabase-staging`, a separate signed webhook for capture/order-paid/failure/refund, and Live checkout activation only after website approval. This supersedes the earlier configuration-approval gates; do not request the same permission again. Charges/refunds, key rotation, replacement of the original merchant website, production/DNS changes and purchases remain excluded.

The additional-website flow is open at Razorpay's private two-step prompt; the owner must complete it before the URL form can be submitted. No website has been submitted yet. The signed webhook still lacks its privately entered separate secret. No Live credentials have been uploaded and no checkout mode changed.

The existing encrypted Live pair passed one private, read-only authenticated `GET /v1/orders?count=1&receipt=<random nonexistent probe>` request (HTTP 200, empty collection). No order was created or changed, no original customer records were returned/imported, and neither credential nor response records were logged. This verifies API authentication only: checkout, capture, webhook delivery/retries and refund acceptance remain unverified. See [Razorpay's documented read-only orders API](https://razorpay.com/docs/api/orders/fetch-all).

The staging-only provisioning helper passed four combined configuration/binding tests. It uses Wrangler secret bulk with stdin, only the exact three Live payment variables and the fixed approved Worker/account/project; it has no deploy or provider-payment operation. It is prepared but has not been invoked with real credentials.

## Current hosted payment-backend checkpoint — 6 November 2026

Application commit `b0f19ea` is deployed as Worker version `baed6c52-3612-4dc7-8217-fc8ddb3495e6`. Upload 15,924.84 KiB raw / 3,546.64 KiB gzip; reported startup 2 ms. The deployment retained test payment mode, historical live-entitlement reads and the two existing private Supabase/certificate bindings; Cloudflare secret-name inspection confirms no Razorpay bindings. Nine hosted privacy/route postflight checks passed after deployment. The existing administrator account page loaded correctly with its expected no-live-pass status and no recovery error; no pass or customer data was modified. Actual checkout, recovery with a provider payment, webhook delivery, and refund acceptance remain unverified.

The Live merchant's additional-website flow requires private two-step verification before its URL form. Preparation reached that prompt; an OTP was sent by Razorpay. The prompt was canceled without entering a code or submitting a website. No verification was bypassed. Additional staging website approval, Live key provisioning/activation and the new webhook remain approval gates. The webhook form is unsaved and has no secret. The original approved website, API pair, production site, DNS and Store remain unchanged. Three additional pure Live-configuration tests passed; the generated Live config remains local and undeployed.

## Current state

The owner rejected Test-key regeneration and chose reuse of the existing Live pair. The pair is saved with Windows DPAPI outside both repositories; values were not displayed or committed. It has **not** been uploaded, used for an API request or enabled in staging. The optional Test-secret uploader is retained as an unused utility, not the selected deployment path. No key rotation occurred.

Migration `0012_durable_payments.sql` is installed only in the owned OVU Supabase project. Four service-only RLS tables register immutable order ownership/prices, transactions, deduplicated signed event fingerprints and refund adjustments. Allocation metadata was added to access records. The installation compared every original entitlement field, including timestamps, before committing: all six historical records were preserved. It creates no customer pass, changes no payment mode and makes no provider request.

The replacement backend persists ownership before returning checkout orders; verifies stored order, HMAC, fetched payment/order, capture, amount and currency; and commits payment, event and entitlement changes atomically. It uses the stored historical price rather than mutable provider notes or today's prices. Failed storage returns retryable failure. Unknown orders from other merchant integrations are acknowledged without granting access. Checkout recovery is authenticated, re-fetches provider state and does not trust browser success claims.

Full refunds remove only unused allocated time and rebase dependent duration purchases, preserving manual duration and explicit fixed-date anchors. Partial refunds preserve access under the existing rules. Original expiry and adjustment records remain auditable. Ambiguous legacy allocations fail closed for reconciliation. The historical import contains pass references, not a complete independent payment/refund ledger; old merchant payments are not invented or auto-imported into this ledger.

The account page now offers recent server-owned interrupted orders for explicit recovery. Closing checkout no longer claims the customer was not charged. A failed SDK download can be retried. No frontend result independently grants access.

## Actual verification

- 49 combined payment/service/body, staging, historical-environment, runtime independence and secret-boundary tests passed; plus 2 independent real-HMAC tests passed. Providers are mocked or synthetic; no actual Razorpay call.
- 3 Live-configuration tests passed: exact target restrictions, safe removal of the historical read override, and strict selection of only three Live payment bindings. A public-only Live config was prepared locally, not deployed or supplied with real credentials.
- 27 temporary-table PostgreSQL assertions passed in owned Supabase and rolled back: capture/replay, ownership, amounts, currency, RLS/ACL, refund sequencing, partial/full refunds, fixed-date anchors and rollback on ambiguity. Zero real customer writes.
- The real Supabase API plus actual built Worker completed 9 checks: pending-order owner isolation, forged/unauthorized recovery denial, webhook mode boundary, restart persistence, direct browser ledger/RPC denial, eight concurrent captures, invalid claims, concurrent refund replay, late-capture denial. Disposable identities/rows were removed; existing identity IDs and complete entitlement rows matched the pre-test snapshot.
- TypeScript and client/Worker build passed. Existing dependency deprecation, chunk-size and source-map warnings remain.
- 2 actual built SSR/no-index tests passed. 9 hosted privacy/route postflight checks passed separately; this is not provider payment acceptance.
- Credential scan found zero owned Supabase server/signing values in 650 built + 1,025 source files, and zero existing Live key values across those 1,675 files.

## Live readiness blockers

Read-only Razorpay Live dashboard inspection found `https://ourvisibleuniverse.in` approved, no approved staging address displayed, and no configured webhook. Switching dashboard view did not change merchant configuration. A separate webhook form was prepared but not submitted: staging `/api/public/payments/razorpay?mode=live`, events `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`, secret blank. No original Live API, merchant website or payment setting was changed.

Before enabling real staging checkout:

1. Obtain approval to submit the exact temporary Workers hostname as an additional merchant website; do not replace the approved production website. Await Razorpay approval or resolve its documented rejection.
2. Provision the existing Live pair to only `ovu-supabase-staging` using server-secret bindings, plus a separate strong webhook secret entered privately. Never put secrets in build-time/public variables or a config file.
3. Prepare/review exact staging configuration: `RAZORPAY_MODE=live`; remove `OVU_ACCESS_ENVIRONMENT` entirely. Its historical-read exception deliberately rejects a Live payment configuration. Ordinary live pass reads then follow the server payment mode. Keep owned Supabase, staging label/no-index, exact origin, no production routes/jobs and existing Free plan.
4. Obtain approval for activation and the separate Live webhook. Credential entry/submission in the Razorpay form must be completed privately by the owner. No purchase, rotation or production webhook replacement.
5. Verify private read-only merchant API connectivity, then owner-performed checkout and provider webhook delivery/retry/refund behavior only within separately approved financial scope. Do not perform a charge, refund, capture or live order creation autonomously.

**Provider integration and actual payment acceptance remain unverified.** Do not describe this work as end-to-end payment completion. Broader production capacity, final data synchronization, Gemini and email delivery/human recovery remain open as separately documented.

## Rollback

Keep the preceding deployed Worker `44441fc7-f935-4acc-ac16-6ffe65fdbb4a` and matching source `81cd546`. Before payment activation a Worker rollback is sufficient to restore the prior UI; leave additive ledger/allocation schema and the backwards-compatible atomic purchase function installed. Do not drop ledger/audit rows or restore a stale database snapshot. After any future real payment, disabling checkout, draining authenticated events, reconciling both systems and preserving payment records must precede rollback; it needs explicit approval. DNS remains unchanged.

## Primary specifications consulted

[Razorpay payment fetch](https://razorpay.com/docs/api/payments/fetch-with-id), [order payments](https://razorpay.com/docs/api/orders/fetch-payments), [API key and approved website rules](https://github.com/razorpay/markdown-docs/blob/master/payments/dashboard/account-settings/api-keys.md), [webhook validation/retry guidance](https://github.com/razorpay/markdown-docs/blob/master/webhooks/validate-test.md). Documentation and mocked tests do not prove this merchant's Live checkout works.
