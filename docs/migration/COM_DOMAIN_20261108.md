# Primary .com domain — 8 November 2026

The owner requested connecting the newly purchased GoDaddy `ourvisibleuniverse.com` domain and explicitly chose `.com` as primary, with `.in` forwarding to it. This authorizes this domain transition, not unrelated future operations.

## Infrastructure and provider configuration

- Exported the original 14-record GoDaddy zone; the private backup is outside Git. Migrated website DNS to Cloudflare Free, retaining GoDaddy as registrar. No paid plan or domain transfer was purchased.
- Cloudflare zone `01f91c45478ed4ba88c77a1010976db5` is active in the existing hosting account. GoDaddy was updated from `ns35.domaincontrol.com` / `ns36.domaincontrol.com` to the assigned `candy.ns.cloudflare.com` / `sullivan.ns.cloudflare.com` pair.
- Preserved email CNAME, both DKIM aliases, both MX records with their priorities, SPF, DMARC, autodiscovery SRV and `_domainconnect`. The automatic scan missed the two DKIM aliases; both were restored manually, DNS-only. Service aliases were also kept DNS-only. No mailbox or email address was migrated.
- Replaced only the two parked apex A records and parked www CNAME in the new Cloudflare zone, then attached `ourvisibleuniverse.com` and `www.ourvisibleuniverse.com` to the existing `ovu-supabase-staging` Worker. Existing `.in` domains and the webhook Workers hostname remain.
- Both new hostnames returned the OVU site with HTTP 200 over validated HTTPS before primary-origin promotion.
- Owned Supabase Site URL is now `https://ourvisibleuniverse.com`; added apex/www `.com/auth**` callbacks, preserving all four pre-existing callbacks. Saved state was verified after reload. Provider callback still uses the same owned Supabase project; no OAuth credentials were rotated.
- The owner completed Razorpay's SMS verification. Read-only dashboard review subsequently confirmed `https://ourvisibleuniverse.com` **Approved**, alongside the existing `.in` and Workers hostnames. No payment, refund, order creation or key rotation was performed for this domain task.

## Application changes and acceptance

- Shared public origin drives organization metadata, certificate verification URLs/PDF label, share fallback and MCP purchase links. Historical credential issuer/course identifiers keep their original identities; no certificate record was rewritten.
- The Worker redirects ordinary GET/HEAD document requests from `.in`, www `.in` and www `.com` to the apex `.com`, preserving path and query. Activation requires the exact production stage and `.com` public-origin setting.
- Existing auth/recovery callbacks finish on their originating host; machine APIs, MCP, server functions, assets, non-GET methods and the signed webhook hostname retain their endpoints. This avoids moving in-progress PKCE/payment callbacks across origins. Browser sign-in storage is origin-specific; existing users may need to sign in on `.com` with their existing account.
- Focused redirects/MCP/password-recovery checks: 17 passed. Certificate generation contracts: 26 passed; verification/admin contracts: 34 passed, using isolated local fixtures. TypeScript and normal client/Worker build passed. No live customer write was used for these tests.
- New `CLAUDE.md` and `docs/AI_START_HERE.md` provide a shared onboarding entry point for other coding tools. Current status stays in the handoff rather than tool-specific chat memory.

## Publication checkpoint

Runtime source **445382d** was pushed to `origin/migration/supabase-cloudflare` and deployed to the same Worker as **2b85f0a4-a0cc-407d-8237-8e3560fc70b5**, serving **100%** of traffic. The preceding runtime version was `3fa153d6-5214-4fa4-9519-d70566eabb7a`. Subsequent documentation commits do not require rebuilding this runtime.

Fresh committed-source client/Worker builds passed in 16.00 / 21.78 seconds, followed by a production-config dry run. The artifact scan checked 655 built files and 1,165 source files, with zero matches for the private credential values supplied to the scan. All production binding names/types and values were preserved except the intentional `PUBLIC_APP_ORIGIN` change to `https://ourvisibleuniverse.com`. No existing secret value was read back, displayed or rotated.

At **2026-11-08 09:03:24 UTC**, 17 read-only HTTP checks passed: primary public/app/auth pages, route-and-query-preserving 308 redirects on all three aliases, retained `.in` auth/recovery routes and protected-resource metadata on both primary and legacy origins. The retained Workers auth hostname still returned 200 with noindex headers. HTTP 200 for protected shell routes does not establish authenticated access or a completed payment. Chrome also visibly followed `.in/` to `.com/` and rendered the homepage.

Live `StarsApp-C9xlAokU.js` matched the built scene byte-for-byte (2,556,916 bytes; SHA-256 `1bcb6c963607d199c48de2d66c14787ddbf15d101f9c18323dc902789a729345`). Public DNS separately returned the preserved MX priorities, SPF, DMARC, both DKIM aliases and the exact `0 0 443` email autodiscovery SRV value. This verifies records, not mail delivery. Private build/configuration/deployment evidence remains outside Git.

Scientific coverage, full authenticated M31 scene acceptance and physical-device performance gaps from the prior reports remain open. A domain transition does not close them.
