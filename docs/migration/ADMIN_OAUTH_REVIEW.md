# New-project administrator and OAuth review — 4 November 2026

Status: local implementation verified; remote application and role/client creation pending specific approval. Target is only `pdvwkdggyyrfkoqrpbji`. Production and Store remain unchanged.

The owner confirmed the recent Google sign-in account as administrator. One verified Google identity was found; its identity is stored privately with Windows DPAPI, outside Git. It has not been promoted. Provisioning will merge the existing trusted `app_metadata` with `role: admin`, preserve the preceding metadata privately, and verify the exact selected identity again. It grants subscriber/certificate administration, not a paid pass.

## Reviewed changes

- `0006_independent_administration.sql`: repeatable audit table and subscriber RPCs; current trusted administrator role and verified email required. User-editable metadata/email alone do not grant authority. Manual grants are transactional, request-idempotent and environment-separated. No account, pass or certificate is created by the migration.
- `0007_scoped_oauth_access.sql`: restrictive authenticated policies prevent OAuth clients from reading or modifying private Academy/progress/pass tables. A narrowly scoped, own-user summary RPC returns only duration, start, expiry and status; payment/customer identifiers remain private. Existing first-party RLS continues to apply.
- Website function middleware verifies supplied tokens and rejects delegated OAuth tokens, including administrators' tokens. Certificate admin functions ignore body `adminToken` fields and require a session header. The internal authorization check rejects bare UUIDs/emails and verifies both JWT claims and current user authority.
- `scripts/admin-oauth-migration-bundle.mjs` produces the exact review transaction from migrations 0006/0007, with timeouts and before/after access/certificate integrity guards. No connection or remote execution occurs in this builder. Do not replay older migrations against the manually prepared target schema.
- Proposed public client: **OVU Local MCP QA**, only redirect `http://127.0.0.1:31752/callback`, Authorization Code + PKCE, no client secret. Dynamic registration remains off. Creation is pending approval. The local SDK QA runner does not register clients, stores tokens/verifiers only in memory, validates issuer/state, and never modifies access or makes payments. User consent remains a separate browser handoff.

## Verification and limitations

Eight isolated PostgreSQL/PGlite tests pass, including repeatability, current-role checks, nondelegation, retry safety, environment isolation, audit-failure rollback, integrity-guard rollback, and private table/summary boundaries. Fourteen MCP/runtime security tests and the original 34 certificate-admin checks pass; the latter use isolated synthetic fixtures. TypeScript passed. The native built Worker rejects a forged session with HTTP 401. All three rebuilt Worker session-boundary checks passed (forged header, body-only administrator UUID, body-only token), each HTTP 401. Existing Google account/session and no-pass status survived restart.

These are local PostgreSQL and workerd results, not hosted database concurrency or real OAuth exchange evidence. Actual client consent, token exchange and target RPC checks must run after approved installation/registration. Existing customer reconciliation, historical signing keys, full concurrent Academy issuance evidence, deferred Razorpay provider testing and approved Cloudflare staging remain open.

A private preflight snapshot records existing public policies, absence of the four new functions, zero current target access passes/certificates, and full-record integrity hashes. It is not an export or import of original customers. No historical data reconciliation is claimed.
