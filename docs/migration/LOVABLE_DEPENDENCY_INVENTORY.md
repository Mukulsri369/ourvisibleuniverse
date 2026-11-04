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

MCP code has been replaced and tested. With explicit user approval on 4 November 2026, the new project's OAuth server was enabled at the local Site URL `http://127.0.0.1:31751`, consent path `/oauth/consent`, with dynamic registration off. Discovery now returns HTTP 200 and compatible ES256 signing keys. No client was registered or granted access. Real external-assistant authorization remains **unverified**; token-scope/RLS review and explicit client registration approval are still required. Ordinary Google website sign-in is a separate, verified flow.
