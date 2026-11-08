# Galaxy release — 8 November 2026

The owner explicitly requested: “push all the changes to git and make them live in my website as well.” This authorized the push and production deployment recorded here; it does not authorize later deployments or unrelated infrastructure/customer operations.

## Published source and destination

- Pushed `097b180..6636040` to `origin/migration/supabase-cloudflare` without rewriting history. Runtime source is **6636040**, including the dense-view code at **5a911d6**. The subsequent deployment-record commit changes documentation only.
- Deployed the existing Cloudflare Worker `ovu-supabase-staging` (its historical name also serves production), version **3fa153d6-5214-4fa4-9519-d70566eabb7a**, at **100%** traffic.
- Production: https://ourvisibleuniverse.in and https://www.ourvisibleuniverse.in.
- Includes the grouped M31 nuclear destination, 831-galaxy catalogue with 641 additions, morphology/appearance work, sparse mouse-input interpolation and deferred survey picking. See the existing expansion and motion reports for implementation, evidence and limitations.

## Verification performed

- Fresh normal client and Cloudflare Worker build from pushed source passed: client 20.61 seconds, Worker 25.54 seconds. Production-config dry run passed before deployment.
- Artifact/source scan checked 653 built files and 1,158 source files, finding zero matches for the private credential values supplied to the scan. This is a specific secret-value check, not a general security audit.
- Fresh Cloudflare API preflight verified the existing target, two custom domains, six public variables, five secret binding names and existing workers.dev state. The release config used these verified production settings, rather than the repository's preview defaults.
- Post-deployment API verification confirmed the new version at 100% and unchanged binding names/types and public values. Live Razorpay mode and enabled checkout were preserved. No secret rotation, payment, customer-access operation, DNS migration or domain replacement was performed.
- At **2026-11-08 04:31:05 UTC**, read-only HTTP checks returned 200 with HTML for `/`, `/universe`, `/pricing`, `/learn` and `/checkout` on both apex and www (10 checks). These HTTP results do not prove authenticated scene or payment-flow acceptance.
- The live scene asset `StarsApp-D9sXUgkD.js` matched the local build byte-for-byte: 2,556,916 bytes, SHA-256 `535a596f1eb56647c668bb966039f38e031e4158c46a0bb400f48240ed41f1ea`.
- Private build/deploy/preflight/verification evidence remains outside Git in the workspace evidence directory. No credentials or customer data were added to this record.

## Remaining limitations

Publication does not close authenticated full-app acceptance of the M31 nuclear destination, physical-phone testing, total GPU-memory measurement, broader performance acceptance, source-specific reuse-rights review or deferred scientific enrichment. Existing local/component measurements and their limitations remain as recorded in the linked handoff reports. No new payment was executed to verify checkout.

Future changes must begin from the current Git and production state. Do not repeat completed catalogue imports, migrations or historical customer campaigns.
