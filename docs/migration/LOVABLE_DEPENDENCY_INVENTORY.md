# OVU dependency removal — 4 November 2026

Scope is OVU only. No Store repository, database, deployment or configuration was changed.

| Former dependency | Replacement and verification |
| --- | --- |
| `@lovable.dev/cloud-auth-js` | Supabase PKCE Google sign-in; actual user callback/session/reload verified at `399ab9d`. |
| `@lovable.dev/vite-tanstack-config` | Official Cloudflare Vite adapter is now the default build. `vite.cloudflare.config.ts` remains a compatibility alias. |
| Nitro adapter / Node emulation preview | Removed unused Nitro package. Preview runs the actual built Worker in local `workerd`, using Wrangler's programmatic local API. Private bindings are supplied in memory. |
| `@lovable.dev/mcp-js` | Official `@modelcontextprotocol/server` with a Cloudflare-compatible schema validator; four original tools retained. JOSE validates issuer, signature, expiry, audience, user role and OAuth client claim. |
| Generated MCP HTTP/metadata routes | Owned TanStack server handlers. Explicit origin checks; forwarded host/proto headers do not define discovery URLs. |
| `/.lovable/oauth/consent` | Compatibility redirect to independent `/oauth/consent`. The historical URL is not an outbound vendor dependency. |
| `window.__lovableEvents` | Local console error diagnostics; no vendor telemetry upload. |
| `LOVABLE_CRON_SECRET*` | `OVU_CRON_SECRET*`, retaining constant-time comparison and previous-secret rotation. No new scheduled job was enabled. |
| Direct Store Lovable REST request from OVU | Existing OVU repository recommendations and Store links retained; a visible notice identifies prices as a snapshot. OVU no longer queries the Store database. |
| Tracked old-project environment files | Preserved privately outside the repository and removed from this branch. `.env.example` contains placeholders; the build refuses a different project or a server key in the public-key slot. |

Automated checks find no former-vendor package paths or outbound runtime URLs in OVU source. Historical documentation, a compatibility route, and test origins can still mention the former platform without calling it. Existing Git history is preserved, not rewritten.

The production-only npm audit reports zero known findings. Fourteen moderate findings remain in development tooling; do not use audit's suggested incompatible downgrades or `--force` to conceal them.

Readiness fixes also eliminate the public certificate-signing fallback, user-editable admin role authority, default admin-email authority and non-test database emulation. The certificate fixture table was reconciled with the actual schema without weakening privacy assertions.

MCP code is replaced and actual local OAuth is verified. With explicit owner approval, the new project's OAuth server is enabled at local Site URL `http://127.0.0.1:31751`, consent `/oauth/consent`, dynamic registration off. The approved public loopback client was manually registered, the user granted consent, and actual PKCE exchange/all four tools passed. Restrictive PostgreSQL policies, a narrow own-user summary RPC and website session boundaries prevent delegated tokens from gaining raw profile/payment data or administrator authority. Ordinary Google website sign-in and both administrator screens are independently verified. Hosted Cloudflare staging remains unverified.

## Atomic Academy completion checkpoint

Migration 0009 is installed in the new OVU Supabase project. The exact transaction passed PostgreSQL rollback/integrity tests and preserved all nine preflight record digests on the target, including 24 existing unverified progress rows. No customer records, certificates or entitlements were imported or changed. The three new RPCs are executable only by the service role, not anon/authenticated callers.

Official module completion now atomically persists canonical completion, module progress, both badge representations, preliminary all-module eligibility and its audit record under the same user lock. Original instructional/activity/scoring rules are preserved. Durable grading remains a preceding recoverable transaction; retrying the saved result completes interrupted awards. Stage revalidation is transactional and fails closed on database/query errors; an outage cannot revoke badges by being mistaken for an empty module list. Previously earned badge dates are retained, and retries do not announce the same badge again.

Validated activities have content-bound event IDs and database uniqueness. Duplicate delivery returns the original record; changed content under the same ID is rejected. Reading updates use monotonic upserts and preserve omitted bookmarks. Legacy quiz compatibility remains practice-only. Anonymous practice never creates official completion, certificate eligibility or paid access. Offline retries require a positive persistence acknowledgement and preserve events appended during an in-flight flush.

Verification: 23 real PostgreSQL checks, eight offline/activity checks, 15 MCP/runtime security checks, five actual target read-only checks, TypeScript, Cloudflare build and deployment dry run passed. Existing suites passed: nine completion, eight achievement, 12 final-exam, 26 certificate-generation and 34 certificate-admin assertions (10 grouped contracts). Assertions were retained. Secret scan: zero private server/certificate-key matches across 626 generated build files and 968 repository files.

Actual built Worker + actual Supabase QA passed: cold restart, independent server grading, concurrent identical/conflicting submissions, immutable retries, raw snapshot/RPC denials, anonymous practice, four successful first-stage module assessments, four canonical completions and audits, one stage award in each representation, preserved award date on retry, monotonic reading/bookmarks, and no certificate eligibility or paid access from first-stage completion. The marked synthetic account and its rows were removed; preceding identities were preserved. The test initially called an unused tree-shaken achievement wrapper; it now calls the same progress endpoint as the rendered Academy, retaining the achievement assertions. A separately interrupted local run required recovery of its exact marked fixture; it was removed without changing original identities. Request bounds and safe stage logging were added; this is not a hosted performance measurement.

Still open: account-isolated offline queues and cross-tab/account transitions; stale local verified flags; atomic certificate issuance/reissue/revocation and private/public certificate access review; the complete 24-module official certificate journey; full browser/mobile/scientific workflows; historical data and identity/entitlement reconciliation; hosted Cloudflare startup/CPU/memory and staging. Actual Razorpay provider testing remains deferred and unverified. Store and live production remain untouched.
