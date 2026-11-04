# OVU rollback

No production cutover or database migration was performed in this phase, so the live Lovable application remains the operational fallback.

- Preserve `origin/main` baseline `ba30dc9035a229eb475c5d36ec7ef1b6bf2db263`, migration checkpoint `399ab9d`, and historical `migration/mariadb-hostinger` head `3d8be60`.
- For local diagnosis, make a separate checkout/worktree at the desired preserved commit and stop the owned preview process. Do not hard-reset a dirty checkout, delete private backups or change the Store.
- Revert reviewed code commits with new revert commits if needed. Never force-push, rebase/amend published history or push this work directly to the Lovable-connected production branch.
- Preserve privately moved legacy environment files. Do not restore old-project variables into the new app indiscriminately; the build intentionally rejects a different Supabase project.
- After any future approved staging deployment, retain its preceding Worker version and the matching database migration state. A Worker rollback does not undo database writes, customer grants, certificates or payments.
- Before any future production cutover, maintain both environments and a payment-event replay/synchronization plan. Reverting DNS alone cannot recover transactions written to the new database. Obtain approval for every production rollback that changes domains, live payment endpoints or customer access.

Current Supabase Google configuration and the approved local redirect are intentionally retained. OAuth-server enablement is a separate pending configuration decision, not something to silently toggle during rollback.
