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
