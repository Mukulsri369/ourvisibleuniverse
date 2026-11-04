# OVU rollback

No production cutover or database migration was performed in this phase, so the live Lovable application remains the operational fallback.

- Preserve `origin/main` baseline `ba30dc9035a229eb475c5d36ec7ef1b6bf2db263`, migration checkpoint `399ab9d`, and historical `migration/mariadb-hostinger` head `3d8be60`.
- For local diagnosis, make a separate checkout/worktree at the desired preserved commit and stop the owned preview process. Do not hard-reset a dirty checkout, delete private backups or change the Store.
- Revert reviewed code commits with new revert commits if needed. Never force-push, rebase/amend published history or push this work directly to the Lovable-connected production branch.
- Preserve privately moved legacy environment files. Do not restore old-project variables into the new app indiscriminately; the build intentionally rejects a different Supabase project.
- After any future approved staging deployment, retain its preceding Worker version and the matching database migration state. A Worker rollback does not undo database writes, customer grants, certificates or payments.
- Before any future production cutover, maintain both environments and a payment-event replay/synchronization plan. Reverting DNS alone cannot recover transactions written to the new database. Obtain approval for every production rollback that changes domains, live payment endpoints or customer access.

Current Supabase Google configuration and the approved local redirect are intentionally retained. The user also explicitly approved OAuth-server enablement, consent `/oauth/consent`, dynamic registration off, and local Site URL `http://127.0.0.1:31751`; those settings are now saved and verified. The preceding Site URL was `http://localhost:3000` and OAuth server was off. Do not silently undo approved authentication settings or register/authorize clients during a code rollback; any authentication rollback is a separate configuration decision.

## Pending admin/OAuth candidate

Before approved application, preserve the private policy/function snapshot and the selected user's complete preceding app metadata. Apply only the generated 0006/0007 transaction; failure rolls back DDL and record hashes must remain unchanged. After application, verify hashes against the preflight and verify ordinary website access before testing a delegated client.

If a later rollback is required, first revoke/delete the test client's authorizations and disable that client; restore only the selected account's preceding trusted app metadata and refresh its sessions as appropriate. Do not broaden raw-table policies while a delegated client can still use tokens. Prefer retaining restrictive policies until the client/token revocation is verified. Restore function/policy definitions from the private preflight in a reviewed transaction. Never drop an audit table with records or delete customer, access or certificate data. Any remote security rollback needs the same explicit review as installation. Code rollback alone cannot undo roles or issued tokens.
