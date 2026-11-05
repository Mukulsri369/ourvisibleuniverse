# Cloudflare readiness — OVU only — 4 November 2026

The application builds with Cloudflare's official TanStack Start Vite integration and runs locally in `workerd`. Cloudflare **Workers with Static Assets** is the target, rather than a static-only Pages upload. React, Three.js, SSR, server functions, HTTP APIs and webhook routes remain in the application. Supabase supplies database/auth/storage services over HTTPS. No deployment has been performed.

## Measured local results

| Check | Result |
| --- | --- |
| Native Worker build and restart | Passed; no Lovable or Nitro build adapter |
| Wrangler deployment dry run | Passed, explicitly `--dry-run`; no upload |
| Worker upload size | 15,889.66 KiB uncompressed, 3,536.45 KiB gzip at the measured checkpoint; approximately 15.5 MiB |
| Static files | 249 |
| Largest static file | 18,385,556 bytes, existing black-hole MP4; no files above 25 MiB |
| Local startup profile | 59.9 ms active CPU; local measurement, not Cloudflare platform validation |
| Private build credential scan | Zero actual server-key/certificate-key matches across 626 build files and 968 repository files; local simulator state excluded; prior Google-secret scan remains recorded at its earlier checkpoint |
| Production dependency audit | Zero known vulnerabilities |
| Development dependency audit | 14 moderate findings, primarily ESLint/Drizzle tooling chains |

Sizes are measurements, not permission to upload. Minor subsequent source corrections can change exact byte counts; repeat the dry run for the approved release commit.

Cloudflare currently documents a 64 MiB uncompressed Worker limit, 128 MB memory, a one-second startup limit, and a 25 MiB individual static-file limit. The measured artifact sizes fit. Local startup profiling does not certify production startup or request CPU/memory. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

## Suitable plan and costs

**Workers Standard/Paid is the production candidate**, with a $5/month minimum ($60 for twelve months before tax), 10 million monthly Worker requests and 30 million CPU milliseconds included. Overage is $0.30 per million requests and $0.02 per million CPU milliseconds. Static-asset requests are free. Supabase, domains, third-party APIs and applicable taxes are separate. No purchase is authorized. [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

Free Workers allows 100,000 daily requests and only 10 ms request CPU. We have not established that OVU's SSR, certificate generation or large scientific routes fit that CPU allowance. Do not promise a free production deployment based on a successful build or on the separate startup profile. Paid request CPU also needs staging measurement and a configured cost cap. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

Use Node 22.12+ or a supported newer LTS version for build tooling; local checks used Node 24.15. The deployed runtime is Workers with `nodejs_compat`, not a persistent Node process. No local filesystem database, persistent disk session or background daemon is required by the replacement adapter. Required Node crypto behavior is covered by local runtime/security checks. Heavy science assets stay in static assets; do not load the entire 3D scene into every SSR response.

## Remaining release gates

1. **Verified locally and against the new project:** approved OAuth settings, public manually registered loopback client, actual user consent/PKCE exchange and all four MCP tools. Delegated tokens are denied private raw tables, admin RPCs and website server functions. Dynamic registration remains disabled. Cloudflare-hosted client configuration is still a separate staging task.
2. **Installed and verified after explicit approval:** admin audit table, four admin/summary functions, 18 restrictive policies, confirmed Google owner role, actual certificate/subscriber screens. Existing target access/certificate hashes match preflight. No pass or customer import was created.
3. Certificate profile queries were corrected to the actual `student_profiles` table. The previous public fallback signing key was removed. Provision the private signing secret as a Worker secret. Historical certificates signed with a different/fallback key need an approved reconciliation/reissue plan; do not silently reissue or revoke them.
   Certificate-admin roles use trusted app metadata or explicitly approved server configuration; no user-editable role or default email grants access. Preserve the already approved administrator identity. The built-in database emulator refuses non-test execution.
4. Atomic assessments, completion/progress/badges, certificate issuance/admin transactions, privacy and retries now pass PostgreSQL and the actual Supabase/built Worker 24-module certification journey. Concurrent offline events and sampled real browser/mobile/anonymous practice flows pass. A complete browser/network-fault/scientific matrix and historical data reconciliation remain outstanding.
5. Razorpay checkout and authentic provider webhooks remain deferred and unverified. Local invalid-request rejection does not verify provider payment processing.
6. Configure an approved staging origin, Worker secrets, Supabase redirects/consent, email delivery and any needed storage policies. Do not set live payment credentials during local QA.
7. Obtain explicit staging/deployment approval, then validate Cloudflare startup, CPU, memory, SSR, real browser sessions and operational logs on the platform. Production customer import, payment configuration and DNS cutover require separate approval.

`workers_dev` and `preview_urls` remain disabled in source configuration. No domain route, schedule, live webhook endpoint or Cloudflare account setting was changed.

References: [official TanStack Start adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/), [local secrets](https://developers.cloudflare.com/workers/vite-plugin/reference/secrets/), [Supabase OAuth server setup](https://supabase.com/docs/guides/auth/oauth-server/getting-started).

Official assessment sessions/results now use PostgreSQL; fresh-process and actual built Worker/Supabase cold-restart tests pass. Anonymous practice remains nonauthoritative and cannot grant certification. Atomic completion/progress/stage awards now pass real PostgreSQL and actual built Worker/Supabase first-stage QA. Concurrent certificate issuance, complete official certification and offline account isolation remain release gates.

Official Cloudflare documentation was rechecked on 5 November 2026: TanStack Start adapter, 64 MiB uncompressed Worker limit (no compressed-size limit), 128 MB isolate memory, one-second startup, 25 MiB asset limit, and Workers Paid minimum/usage pricing remain as stated above. The latest dry run performed no upload; local bundle size is not platform CPU/memory proof.

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

Certificate-phase artifact scan: zero actual private server/certificate-key matches across 634 build files and 979 repository files. Latest dry run performed no upload. Hosted startup/CPU/memory remain unverified.


## Profile privacy and navigation checkpoint

Migration 0011 is installed in the new OVU Supabase project; all 12 pre/post record digests matched. Raw student profiles are owner-only, browser progress writes are denied and service-only navigation synchronization preserves canonical completion/date and monotonic reading without awarding official access. Login uses only account-owned caches and rejects stale identity responses. Concurrent profile creation returns one committed public ID; outages cannot fabricate persisted identities. The actual browser exposed a stale guest-default editor bug, now fixed by initializing the editor from the current profile when opened. No account settings were saved during UI QA.

Verification: eight new PostgreSQL checks, 19 runtime/offline/cache checks, eight original student checks, 63 astronomy checks and three built session-boundary checks passed. TypeScript and the final Worker build passed. Actual Supabase/built Worker QA passed the full 24-module official assessment/certificate/admin/privacy/restart journey plus profile creation/privacy/account-switch and canonical-navigation replay checks. Its marked synthetic identity and rows were removed; preceding identities were preserved. No paid pass or provider payment was created. Final deployment dry run passed without upload (15,894.03 KiB raw / 3,538.06 KiB gzip). Desktop/mobile editor fields match the persisted profile; 390×844 document overflow was false, viewport restored. Public galaxy rendering/selection worked; a legacy distance-unit abbreviation error was found separately.

See PROFILE_NAVIGATION_MIGRATION.md for contracts, evidence boundaries and rollback. Broad legacy SDK typing, complete browser/scientific and email-delivery checks, approved historical data reconciliation and hosted staging remain outstanding. Provider payments remain deferred/unverified. Store, production, live access, DNS, purchases, deployments and Lovable cancellation remain unchanged.


## Scientific UI and provider-readiness follow-up — 5 November 2026

Committed profile/navigation baseline: 21d96d7. The galaxy selector no longer drops the word Million and mislabels million-light-year values as ly: it now displays 2.537 Mly, 23 Mly, 29.3 Mly and 2.73 Mly, while retaining 163,000 ly for the LMC. Underlying distances, calculations and 3D models are unchanged. Actual catalogue selection and a visible 3D canvas passed in the rebuilt browser. The existing galaxy regression passed 63 catalogue approaches at four viewport sizes, 16 observed guide/portrait pairs and 42,541 survey records. TypeScript and the Worker build passed.

Anonymous browser QA used separate loopback origin 31753, with no account session: Module 01 cosmic zoom moved from Earth to the Earth–Moon view; four practice answers scored 100%; official mode required sign-in; the learning map retained zero verified modules/badges; the paid universe redirected to authentication. This sampled workflow does not claim all 24 modules were completed through browser controls. The full 24-module official journey is separately covered by the actual Supabase/built API test.

The original preview test passed all public routes, stylesheet MIME/HEAD, rejected asset writes and missing-asset checks. An initial run occurred while the build was replacing its output and correctly failed for missing build configuration; rerunning after build completion passed without changing any assertion or timeout. All 131 COSMOS foundation checks passed. Provider-backed Gemini chat/TTS/Live calls remain unverified; the local preview now accepts GEMINI_API_KEY as a private memory-only binding when explicitly configured, matching the existing server contract. No Gemini key was entered and no provider-backed request was intentionally invoked during these checks. Grounded/browser-speech fallbacks are not proof of working Gemini service.

Read-only Cloudflare CLI identity check: not authenticated. No login, upload, purchase, account setting, production/DNS/payment/customer-access change was performed. Hosted validation requires private Cloudflare authentication and separate staging-deployment approval. Email delivery/reset, external AI service checks, historical records/storage/signing-key reconciliation and actual payment-provider tests (deferred by user) remain release gates. Existing instructional placeholders, including the galaxy collision sandbox, were preserved and are not claimed to have been implemented by migration.
