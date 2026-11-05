# OVU hosted staging — 5 November 2026

Staging: https://ovu-supabase-staging.mukul-srivastava-025.workers.dev

OVU is deployed to the separately approved `ovu-supabase-staging` Worker using the owned Supabase project `pdvwkdggyyrfkoqrpbji`. The account was verified as Workers Free with no pre-existing applications. No plan was purchased/upgraded. Production domains, DNS, Lovable hosting, live payments, Store and existing customer access remain unchanged. Cloudflare calls the new Worker's default environment “Production”; this is not a cutover of the existing production website.

## Deployment and secrets

- Application build: commit `7f215f7`; later changes in this checkpoint are operational/test/report changes, not a different application bundle.
- Uploaded version: `26e36932-cd28-4129-a311-221e2226415b`.
- Active version after private binding provisioning: `e6abed40-270b-4c68-8547-828770f43554`.
- Actual upload: 15,894.70 KiB uncompressed / 3,538.24 KiB gzip; Cloudflare reported 3 ms startup. Assets uploaded successfully.
- The generated staging config preserves module/asset paths, enables only the dedicated workers.dev endpoint, adds no production routes or schedules, and forces test payment mode.
- Only `SUPABASE_SERVICE_ROLE_KEY` and `CERTIFICATE_SIGNING_SECRET` were provisioned, through Wrangler stdin from the existing private environment wrapper. No plaintext secret file, credential argument, payment key or Gemini key was uploaded. CLI authorization uses encrypted credential storage with a Windows Credential Manager key.
- `configure-staging-secrets.mjs` refuses a different account, Worker, origin, Supabase project, live payment mode or production routes; its payload contains exactly the two required bindings. Tests cover these boundaries.

## Authentication configuration

The user separately approved both changes at action time. The owned Supabase Site URL is now the exact staging origin. Its redirect allowlist contains the staging origin plus `/auth**` and retains the existing `http://127.0.0.1:31751/auth**` entry. Both settings persisted after reload. Google client credentials/callback configuration and the approved administrator role were not changed.

Actual Google sign-in returned to the hosted Academy with the same previously confirmed public student ID and cloud-synced profile. Both admin screens loaded; the subscriber screen remained in Sandbox with zero subscribers. The owner's zero official awards and lack of a pass remained intact. Direct paid-universe navigation displayed the active-pass requirement. No real account settings or entitlements were saved by browser QA.

## Actual hosted verification

The actual Supabase/hosted Worker test passed profile initialization races, raw-profile privacy, account-switch denial, browser progress/RPC denial, monotonic navigation and canonical completion preservation. It then passed all 24 validated module activities and official quizzes, six badges, pre-final certificate denial, the 20-question final at exactly 80%, concurrent one-certificate issuance, private/public/minor sharing rules, owner PDF export in both themes, Open Badges export, certificate retry, non-admin denial and audited correction/reissue/revocation retries. Removing the disposable fixture's temporary admin role denied its stale token. The marked synthetic identity and its records were removed; preceding identities were preserved. No paid pass or provider payment was created.

Hosted retry verification is not a forced Cloudflare restart test. Its report explicitly sets `builtWorkerColdRestart` and `certificateRestartRecovery` to false; prior local cold-restart checks remain separately verified. No test assertion was removed or relaxed to get a hosted pass.

The existing approved public OAuth client completed PKCE against the hosted MCP endpoint and passed all four tools: `search_catalog`, `get_catalog_entry`, `list_access_plans` and `get_my_access`. Its delegated token was denied raw private tables, admin APIs and website server functions. No new client, admin grant or paid entitlement was created; existing consent was reused. Tokens/verifiers stayed in memory and the loopback test server was stopped after evidence capture.

Real browser checks passed hosted Google callback/session, Academy hydration, both admin screens, the no-pass gate, the galaxy canvas and catalogue selection with correct Mly units, and the profile editor at an actual 390×844 viewport with no horizontal document overflow. The editor was canceled without saving and the viewport reset. These are sampled browser journeys, not a complete 24-module browser interaction or offline network-fault matrix.

Seven staging configuration/actual-built checks, 21 security/MCP/runtime checks and final TypeScript passed. The local build/dry run remained successful. Initial hosted HTML routes returned 200 with staging no-index headers. A small additional test sent ten anonymous Academy GETs, five concurrently: all ten returned 200 and no resource-limit errors. It is not a capacity/load certification.

## Actual resource findings

Cloudflare's Last 24 hours / All deployed versions view reported 245 invocations at the initial snapshot, zero errors, zero CPU-limit errors and zero memory-limit errors. Displayed CPU quantiles were P50 10.06 ms, P90 34.54 ms, P99 105 ms and P999 136 ms. Memory quantiles were P50 49.9 MB and P99/P999 55.42 MB. These are dashboard statistics for the observed QA period, not a promised production maximum.

Workers Free's nominal HTTP CPU budget is 10 ms; Cloudflare documents some burst flexibility. Successful functional tests and zero observed errors therefore do not certify sustained production headroom. The observed CPU tail exceeds that nominal budget. Continue staging on the existing Free plan; consider targeted optimization or Workers Paid only after a separate decision, with no automatic upgrade. Paid currently has a $5/month minimum plus applicable usage; Supabase, providers and taxes are separate. [Limits](https://developers.cloudflare.com/workers/platform/limits/), [pricing](https://developers.cloudflare.com/workers/platform/pricing/).

## Remaining gates

- Razorpay provider checkout/webhook/refund testing remains deferred and unverified at the user's request; no live payment changes.
- Gemini provider chat/TTS/Live remains unconfigured and unverified, explicitly deferred again by the user. Foundation/fallback checks are not provider verification.
- Actual email delivery/password recovery and any private sender/provider configuration remain unverified.
- Historical identity, access, transaction/storage and signing-key reconciliation requires a current source snapshot and approved mappings before import or restoration. See `HISTORICAL_RECONCILIATION_REVIEW.md`.
- Full browser/offline/scientific/paid-atlas and sustained capacity testing remain incomplete; no full paid-atlas browser rendering was enabled by granting a real user access.
- Production deployment/domain cutover, live payment configuration, customer import/access changes and Lovable cancellation still require their separate approvals. Staging approval does not authorize them.

Private evidence and screenshots are outside Git. No customer export, OAuth token, private key or secret value is in this report.
