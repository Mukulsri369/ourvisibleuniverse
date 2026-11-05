# Authorized OVU customer transfer — 5 November 2026

Scope: append existing OVU users and exact historical access records to the owned Supabase project `pdvwkdggyyrfkoqrpbji`; make the approved Cloudflare staging app ready for owner testing. No production DNS, live provider settings, Store change, purchase or cancellation is included. Do not ask for the same customer-transfer authorization again.

## Verified current source

The owner signed into the original OVU project in the in-app browser. Its existing database export controls generated `database_export_05_11_26/ourvisibleuniverse_261105.backup` (372 KB). The browser downloaded it to Downloads as `ourvisibleuniverse_261105.backup.zip`, a ZIP containing exactly the expected PostgreSQL custom archive. The verified archive creation timestamp is November 5 at 14:15:21 UTC, PostgreSQL 17.11, pg_dump 18.6, custom archive format 1.16. No schema/data restore commands were executed against any database. `pg_restore` extracted schema and data to memory only; encrypted DPAPI copies are outside Git alongside the preserved October archive.

The fresh source has 78 users, versus 71 in the older snapshot. Current read-only reconciliation found 77 original-ID creations and one verified-email mapping preserving the existing new-project administrator. Six access records map without conflicts: five live records for five distinct customers and one sandbox record. There are no other populated public tables in this source export. No historical Academy progress/certificates absent from that source can be claimed migrated. Inventory storage object rows and other data separately before declaring the whole historical transfer complete.

## Implementation safeguards

- `customer-reconciliation.mjs` parses PostgreSQL COPY as data, never executes exported SQL, rejects malformed/truncated rows, and reports identity/access conflicts and unhandled public tables.
- The private preflight captures the target Auth Admin user metadata and current access rows encrypted outside Git before import. It contains the SQL content digest and per-user mappings. Public reports contain only aggregate counts.
- `customer-import.mjs` requires a current verified snapshot and matching content digest, checks all account payloads before the first write, and creates only missing original IDs. Existing accounts are never patched or deleted. Source-created dates are retained in trusted migration provenance. Old admin claims are not copied; profile metadata is limited to display names/avatar fields.
- Confirmed and unconfirmed source states are preserved. Supported bcrypt hashes are passed privately to the official Auth Admin API; no plaintext customer passwords are requested. Tokens, sessions, OAuth secrets and recovery codes are not imported. Existing new-project credentials/admin metadata remain intact.
- Original purchase IDs, references, environment, status and microsecond timestamps are retained. Missing passes are inserted in one PostgREST transaction; no purchase activation RPC, upsert, expiry extension or fabricated captured-payment ledger is used.
- Trusted original-ID import provenance makes partial runs resumable without overwriting existing credentials or promoting unconfirmed accounts. On error preserve imported records/evidence and reconcile; never automatically delete customers to simulate rollback.
- The apply entry point requires explicit import/private-output flags, the exact owned project, current snapshot time and a matching digest. Only private wrappers capture its detailed output. Progress evidence contains aggregate counts only.

## Access reads and provider isolation

The ordinary application retains its original test/sandbox and live-mode defaults. An explicit `OVU_ACCESS_ENVIRONMENT=live` read override is accepted only for the exact approved staging origin, owned project, staging deployment label and Razorpay test mode. The website, subscriber dashboard default and MCP pass summary share that server-only selector. This reads existing live entitlements; it neither creates a pass nor changes checkout/webhook mode. Staging preparation activates it only with `--read-imported-live-access`. Never relabel source live purchases as sandbox or provision live keys to enable testing.

## Verification before real writes

Nine reconciliation tests and eight append-only/idempotency/recovery tests passed, plus three environment-isolation checks. The 24-check security/MCP/staging regression, TypeScript, Worker build and private-value scan passed. Actual built Worker/Supabase QA with disposable identities verified default sandbox isolation, live-history reads with payment keys absent, exact expiry and another-user denial; fixtures and prior records were preserved. One initial attempt failed before classification was instrumented; the diagnostic rerun passed, so it is recorded rather than described as a diagnosed code fix.

Actual Supabase Auth API QA also passed original-ID bcrypt-hash import/login, unconfirmed-account login denial and rejection of imported profile admin claims. Its two marked accounts were removed and preceding identities preserved. bcryptjs is a pinned-lockfile development-only dependency for generating synthetic test hashes; the application does not hash customer passwords itself. No emails or provider payments were sent.

## Execution and postflight

Run the private DPAPI preflight against the November 5 source, retain its encrypted target snapshot, then execute the tested apply entry point through the private wrapper. Verify source-to-target identity mapping, existing owner metadata, exact access records and a zero-write repeat dry run. Record actual counts only after success. Install the approved staging read override and deploy the verified application branch to the existing Worker. Preserve its private bindings and test hosted auth/admin/access behavior. Customer sign-in and provider linking still require real user testing; do not claim password or Google sign-in was exercised for every customer.

Supabase automatically links a verified OAuth email to an existing eligible same-email account; do not copy stale provider tokens. The original provider identity records remain in the encrypted archive. [Identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser).

Historical transfer is a snapshot while the original site remains writable. A final write/payment synchronization is required before any later DNS cutover. Actual Razorpay provider tests, Gemini provider tests and email delivery/human recovery remain explicitly deferred and unverified.

The fresh storage inventory contains one object, matching the original OVU database export filename inside a database-export bucket. It is a credential-bearing backup artifact, not an application asset. Both source archives are retained encrypted locally; do not publish or copy these backups into application/public storage. The target preflight was recaptured after disposable QA cleanup and contains only the existing administrator and zero access rows. An earlier comparison taken while QA fixtures were active is superseded; the preflight and importer now reject active disposable fixtures.
