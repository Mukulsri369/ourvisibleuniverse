# Historical records: review before import

## Customer transfer completed — 5 November 2026

The authorized fresh snapshot (2026-11-05 14:15:21 UTC) is now imported into the owned Supabase project: 77 accounts created, one existing administrator account preserved (78 source users represented), nine supported password hashes transferred privately, and six exact historical access records inserted (five live / one sandbox). No existing accounts were patched/deleted and no emails/payments were sent. Repeat reconciliation finds zero missing accounts, zero access differences and zero conflicts.

Cloudflare staging version `44441fc7-f935-4acc-ac16-6ffe65fdbb4a` reads these live historical entitlements while payment mode remains test and payment keys remain absent. Its actual admin dashboard shows five live subscribers with active access. Anonymous data privacy, hosted authorization and route smoke checks passed. See [CUSTOMER_TRANSFER_RESULTS.md](CUSTOMER_TRANSFER_RESULTS.md) for actual evidence, source limitations, rollback and testing instructions.

Use the approved staging URL for owner testing. Original production/DNS/Store/live payment settings are unchanged. Later source writes are not automatically synchronized. Gemini, actual provider payments and email delivery/human recovery remain deferred; broader acceptance/capacity and final synchronization are still required before production cutover. Earlier no-import/no-authorization checkpoints below are historical.


## Current authorization and read-only comparison

The user now explicitly authorizes transferring existing OVU users and their legitimate purchased access into the owned Supabase project, then testing the Cloudflare application. The prior statements below that import was not authorized describe the earlier checkpoint. Do not ask for that same general transfer authorization again. Production DNS, live payment settings and Lovable cancellation are not part of this authorization; use the approved staging URL for initial testing.

The actual read-only comparison of the October 29 archive with the owned target found 71 source users and one target user: 70 original-ID account creations and one verified-email mapping preserving the existing administrator account. Six historical access records map without identity/reference conflicts: five live records belonging to five distinct users, and one sandbox record. All five live records are within their archived periods as of this comparison. No target users, access records or roles were written. The private per-user plan is encrypted with Windows DPAPI outside Git; customer email addresses, payment references and password hashes are not in these documents.

Nine reconciliation tests passed. They cover COPY escaping/nulls/truncation, identity collisions and verification, preserving existing accounts without copying admin claims, banned/deleted/SSO quarantine, exact reference/date preservation, duplicate import detection, expired/sandbox isolation and detecting newly available public tables. Exported SQL is parsed as data and never executed.

The user has been asked for a fresh OVU-only archive because the available archive is from October 29 and the old live site remains writable. Accounts, passwords, bans, purchases, refunds and expiry may have changed since that snapshot. A zero-conflict comparison against an older snapshot is not a verified current transfer. Fresh data must be inventoried and compared before writes; any newly discovered Academy or storage data needs its own mapping rather than silently dropping it.

Keep original access dates and references; do not call `apply_access_purchase` to recreate old purchases, extend them from today or relabel live history as sandbox. Existing staging currently reads sandbox access because Razorpay mode is test. Before customer paid-content testing, separate the server's historical live-entitlement read selection from provider payment mode; do not configure live keys or change payment settings. Actual Razorpay provider, Gemini provider and human email-recovery tests remain deferred.

For account creation, the installed official Supabase Admin API supports original IDs and `password_hash`, allowing supported source password hashes to be preserved privately without plaintext passwords. Existing verified target accounts must retain their credentials, metadata, admin roles and new-project records. Do not restore old sessions, refresh tokens, one-time tokens or provider secrets. Google identities require verified-email linking and actual provider sign-in verification; creating an email identity alone does not prove every customer's Google login. [Official Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser), [auth migration guidance](https://supabase.com/kb/troubleshooting/migrating-auth-users-between-projects).

## Earlier archive review

The existing verified October 29 OVU archive and extracted schema/data are preserved encrypted outside Git. This review uses its already-generated private inventory; no production database was queried or changed and no customer was imported or activated.

The inventory records 38 COPY tables and 692 rows, including 71 auth users, 72 identities and six `public.access_passes` records. Five access records are in the live environment and one is sandbox. All six had the stored status `active` in that archive, all link to an original user and all have unique access references. Stored status is not evidence that the access period remains valid now; expiry, refunds and purchases since the snapshot must be reconciled as of cutover.

The archive's public data inventory contains only `access_passes`; it is not a complete independent payment-transaction ledger. Storage inventory reports one bucket and zero object rows in that snapshot. Do not infer that there have been no subsequent uploads or Academy/certificate records. The current new project and successful synthetic tests do not demonstrate migration of historical data.

Before any import or manual restoration:

1. Obtain and verify a fresh read-only source snapshot, plus authoritative historical payment/refund references where needed. Preserve the original archive; never overwrite it. Preserve the live website while writes and payments continue.
2. Review original identity-to-new-auth-user mappings privately. Require verified identity and explicit owner approval for the exact users and entitlement periods. A shared display name or unverified email is insufficient. Preserve the already approved administrator; do not copy old roles indiscriminately.
3. Retain original purchase/order/payment references, dates, environments, source and expiry. Separate historical records from a new manual restoration grant, and do not misrepresent a grant as a new captured payment. Keep sandbox data distinct from live data. Do not infer captured amount/currency/refund history from an access status alone.
4. Do not import old refresh tokens, sessions, one-time tokens or provider credentials. Recreated accounts can sign in through the new owned authentication service. Keep the original ID-to-new-ID mapping private for record ownership and audit.
5. Validate any historical official Academy evidence and certificate/signing-key continuity before granting verified progress or reissuing certificates. Do not promote anonymous practice or local-cache claims into official provenance. Missing records need documented recovery decisions, not invented data.
6. Review a repeatable dry-run diff, counts, duplicate references, ownership/FKs, UTC expiry calculations and rollback before requesting import approval. Use an import-run identifier and preserve original fields for reconciliation. Secrets and customer exports stay outside Git.
7. For final cutover, agree on a payment/write freeze or replay/synchronization procedure so payments and new writes are not lost between the final snapshot and DNS switch. DNS, webhook, production deployment and cancellation approvals remain separate.

The existing archive is a protection/reconciliation input, not authorization to restore its five live access records. No current customer, exact access period or production data import has been approved in this checkpoint. Staging QA affected only explicitly marked disposable fixtures, which were removed.
