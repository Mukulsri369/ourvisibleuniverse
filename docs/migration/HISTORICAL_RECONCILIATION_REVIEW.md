# Historical records: review before import

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
