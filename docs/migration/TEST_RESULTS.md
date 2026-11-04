# OVU verification — 4 November 2026

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

Certificate-admin authority now uses only trusted app metadata or explicitly configured server-side IDs/verified emails. User-editable metadata and old hardcoded default emails no longer grant admin authority. No real user's role/access was modified. The UUID lookup branch no longer misclassifies a UUID as a JWT merely because it is long.

The final native preview was restarted after the release-candidate build. The original built preview suite passed again; the browser retained the signed-in account without an active paid pass. A Windows rebuild initially encountered locked simulator SQLite files; preview state now uses a per-process temporary directory outside the build output, and the clean rebuild passed. Neither the failed attempt nor test-only fixture runs are counted as platform/production success.

The MCP tests cover signed OAuth JWTs, missing client claims, incorrect roles/issuer/audience, expiration, forged tokens, all four original tools, input validation, scientific lookup results, per-caller token/user filtering, future-pass exclusion and rejection of legacy service-role keys. SDK-owned protocol validation remains enabled.

Google website sign-in was separately verified with the user's private account selection/consent: callback to Academy, signed-in account view, persistent session and stable student ID after reload, no paid pass and a blocked protected universe. The user subsequently reported Academy completion/certification/admin/offline checks working. That report is recorded as user testing rather than an agent-run production integration suite.

## Approved local OAuth configuration

Subsequent approved configuration check: **2 read-only project/OAuth-discovery tests passed**. OAuth discovery changed from `404 feature_disabled` to HTTP 200, with the correct issuer, same-project endpoints, S256 PKCE and ES256 signing keys. Saved dashboard settings persisted after reload: OAuth enabled, dynamic registration off, consent `/oauth/consent`, Site URL `http://127.0.0.1:31751`. The built consent page rejected a deliberately invalid authorization ID with “Authorization unavailable”; no client or authorization was created. Google remains enabled. These checks do not establish a successful real client consent/token exchange.

## Explicitly not verified

- Actual Razorpay Test Mode checkout, authentic webhook delivery, refunds and recovery against the provider; all remain deferred by the user.
- Actual third-party MCP OAuth consent/client flow: discovery is verified, but no client was registered/authorized and no real code/token exchange was performed.
- Platform-hosted Worker CPU/memory/startup, SSL and custom domains: no deployment authorized.
- Migration/reconciliation of existing customer identities, transactions, entitlements, storage or historical certificates.
- Admin database RPCs absent from the target; database changes were not applied in this phase.
- Full automated browser regression for every 3D simulation and concurrent official Academy award/certificate issuance. Astronomy invariants and sampled UI checks do not substitute for those workflows.

Evidence logs and screenshots are kept in the workspace's private `work/evidence` and `outputs` directories, outside Git. Never publish raw credentials or customer exports as test evidence.
