# Completed customer snapshot transfer — 5 November 2026

The user explicitly authorized moving existing OVU users and purchased access into the owned Supabase project and testing the Cloudflare application. This transfer has now run successfully. It is not a production DNS cutover or permission to change live payment settings, purchase hosting, touch the Store or cancel Lovable.

## Source and backup protection

The owner completed private Lovable sign-in. The original OVU database export controls generated the fresh November 5 archive, downloaded through the browser to `Downloads/ourvisibleuniverse_261105.backup.zip`. The ZIP contains exactly the expected PostgreSQL custom archive. Its capture time is **2026-11-05 14:15:21 UTC**. The archive, schema/data extracts, target preflight snapshots, detailed identity mapping and import result are encrypted with Windows DPAPI outside Git. The October 29 backup remains preserved. No export SQL was executed on either project.

The fresh source contained 78 auth users, six public access records, zero Supabase MFA factors and zero passkey credentials. The only populated public data table in this export was `access_passes`; there were no historical Academy progress/certificate rows to import from this database. The one storage object was the earlier credential-bearing database export in an export bucket. It is preserved privately rather than published into application storage. Two export buckets are not missing application assets.

## Actual writes and postflight

| Check | Verified result |
| --- | --- |
| Source users represented in target | 78 |
| New accounts created | 77, retaining original source IDs |
| Existing new-project account preserved | 1; its verified-email mapping retains its target ID, credentials and administrator metadata |
| Supported existing password hashes transferred | 9, through the official Auth Admin API; no plaintext passwords requested |
| Historical access records inserted | 6, with exact original IDs, references, status, environment and UTC microsecond timestamps; owner ID remapped only where required |
| Live records/customers | 5 records for 5 distinct customers, within their original periods at verification |
| Sandbox records | 1, retained separately |
| Existing accounts updated/deleted | 0 / 0 |
| Emails/provider payments sent | 0 / 0 |
| Repeat dry-run creations/conflicts | 0 / 0 |
| Other populated public tables unhandled | 0 in this source snapshot |

All source accounts map without conflicts after import, and every source access row matches the target. The importer did not call purchase activation, invent payments, extend expiry from migration day, silently confirm unconfirmed accounts, overwrite existing credentials or copy old administrator claims. Original sessions, refresh tokens, one-time tokens and provider secrets were not imported. Source account creation dates are retained in trusted provenance; Auth API-created records naturally have their new-project creation timestamps.

Supported password-hash import was first tested with disposable accounts against the actual Supabase API: preserved original-ID login passed, unconfirmed-account login remained denied, and profile admin claims were not imported. Those fixtures were removed before the customer baseline. This does not mean every customer's password or Google login has been exercised. Verified Google emails use Supabase's supported automatic identity linking on first sign-in; the old provider identity records remain in the private archive, without restoring stale tokens. The user's existing Google/admin session still works.

## Hosted application

URL: https://ovu-supabase-staging.mukul-srivastava-025.workers.dev

Active Worker version: `44441fc7-f935-4acc-ac16-6ffe65fdbb4a`. Application code is committed at `81cd546`; `3ec254d` adds the import-only MFA/passkey safeguard. Cloudflare reported 15,908.22 KiB raw / 3,541.57 KiB gzip and 2 ms startup. Existing Workers Free plan is unchanged; sustained CPU suitability remains unverified as previously documented.

The explicit server-only historical-access read override is active on this exact staging origin and owned project. Website access checks, the subscriber dashboard default and MCP pass summary now read live historical entitlements, while **Razorpay mode remains test and no provider payment keys are provisioned**. Both private server/signing binding names remain present. The real hosted subscriber dashboard, using the preserved administrator session, displayed **5 live subscribers and 5 with active access**. No manual grant/revoke action was performed.

The administrator's original entitlement was sandbox-only. Importing historical data does not create a live pass for that account or bypass the paid 3D gate. For paid 3D acceptance testing, use a migrated account with a valid live pass; any additional temporary/manual grant needs its own authorization.

## Verification and practical limits

- 21 reconciliation/import/environment tests passed, including resumability, stale snapshot rejection, microsecond expiry differences, no role escalation, unconfirmed preservation and MFA/passkey fail-closed handling.
- 24 security/MCP/staging configuration checks passed; TypeScript, Worker build and credential scan passed. Scan snapshot: 642 build files / 1,010 source files, zero actual private-key matches.
- Actual built Worker + Supabase disposable QA verified default sandbox isolation, live historical access without payment keys, original expiry and another-user denial. After one unclassified initial failure, both the instrumented rerun and a separate repeat passed; the initial failure was not hidden or described as a diagnosed fix. Fixtures were removed and preceding users/access rows preserved.
- Three actual provider-backed Auth import checks passed without email/payment side effects.
- Three forged/body-only administrator authorization tests passed against the newly deployed hosted Worker.
- Nine postflight checks passed: anonymous access/profile queries returned no records, anonymous Auth administration was denied, and six hosted HTML routes retained HTTP 200/no-index/no resource-error shells. The first profile probe used the wrong primary-key column and was corrected to `user_id` before the successful rerun. HTML shells are not proof of authenticated paid-scene rendering.
- Browser acceptance verified preserved administrator session, Live environment and five customer rows. Customer PII is omitted from Git and public screenshots; only a header/counts screenshot is shared. Prior Academy/3D/mobile results remain separately recorded, not falsely rerun for every imported identity.

The original site is still writable. Users, renewals, refunds and progress written there **after 14:15:21 UTC** are not automatically synchronized. A final reconciliation/payment-write plan is required before any future domain cutover. The archive contains access references, not a complete independent Razorpay transaction/refund ledger; no broader financial-history migration is claimed. Original browser-only learning state absent from the database is not reconstructed or promoted into official certification.

Actual Razorpay checkout/webhook/refund provider testing, Gemini provider sessions and email delivery/human recovery remain explicitly deferred and unverified. Broader offline/browser/scientific acceptance and sustained capacity remain open. The owner may now test the staging URL; this report does not declare production migration complete.

## Rollback

Preserve the imported customer records and encrypted mapping. An application-only staging rollback can use prior Worker `f655e3f6-66cc-49c2-b2a6-9fc9ec303648`, but it restores the old sandbox read behavior. Never delete customer accounts/access as an automatic rollback, revert security migrations, discard signing material or overwrite the original live database. Any customer-data rollback needs a reviewed reconciliation and explicit approval.

Final repository privacy scan checked 906 text files against the nine actual source password hashes and 76 private customer email fingerprints, excluding the two already-public owner/business contact addresses. Zero private matches were found. All detailed customer data and mappings remain encrypted outside Git.
