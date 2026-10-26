# Subscription administration, exoplanet stability and galaxy entry

## Hosted database setup

Apply **drizzle/migrations/0005_subscription_administration.sql** to the connected Supabase database using its SQL editor or normal migration process. Existing paid-access migrations 0000 and 0001 must already be installed. This workspace does not have database-management credentials, so the hosted migration has not been applied here. GitHub/Lovable source synchronization alone does not confirm that SQL migrations have run.

Sign in with the verified account **mukul.srivastava.025@gmail.com**, then open **/admin/subscribers**, or choose **Manage subscribers** from Account. An active paid pass is not required to administer subscriptions. The owner must have a verified email in Supabase Auth. A missing migration displays a setup state rather than showing fake subscriber data.

The panel lists subscribers, their effective access, expiry, duration and payment/admin source. Search, status filters, pagination, refresh, and Live/Sandbox selection are supported. It starts in the environment used by the server’s Razorpay configuration. Grant access to an existing, verified account for 30, 180 or 365 days. The recipient must sign in once first. Existing access time is extended; this does not charge or invite the user, mark a payment as captured, or grant an administrator role.

Authorization is checked in database functions using the authenticated user ID and verified Auth email. Client-editable profile metadata is not trusted. Subscriber records remain private under RLS. Grants use the same per-user/environment transaction lock and atomic activation function as verified purchases, with a separate admin identifier and audit record. A retried request cannot extend access twice. Effective active access is selected before historical expired/refunded records. The existing Razorpay signature and captured-payment checks remain required for purchases.

## Exoplanet camera

The simulation clock updates at priority -3, hosted systems at -2.5, exoplanets at -2, moons at -1.5, then the camera follows the current frame’s published coordinates. Late-mounted systems no longer leave the camera one frame behind moving planets. Navigation enlarges very distant hosted systems uniformly when needed to keep tiny bodies above Float64 world-coordinate rounding. Catalogue measurements are unchanged. Owned resources and published positions are released when leaving a hosted system.

## Galaxy passage

Selecting or clicking a galaxy frames its exterior and offers **Enter galaxy**. Exterior orbit zoom stops outside the core. Enter runs a continuous 44-second passage (60 seconds with reduced motion), progressively clears the dust and hands over to free look. Pause/resume and Exit galaxy remain available; Escape exits. Exit restores the original view. The existing free-look movement controls remain available inside.

A deterministic **100,000-star** population mounts only after entry and disposes when exit completes or another galaxy replaces it. Populations differ for disks, bars, rings, spheroids, irregular clumps and interacting tails. There is a small persistent local-background population rather than a permanently allocated 600,000-star Milky Way field. Dust absorbs blue light preferentially; old stars, blue young populations and ionized clouds retain different colours. Individual points and close-up grain render at native viewport resolution, with quality-tier and reveal-aware cloud sampling.

The interior offers a Places to visit panel with local stellar/halo views and the catalogue’s available stars, planets, moons and observed objects. Unknown internal objects are not invented. Modelled worlds and reconstructed views stay labelled. Unresolved survey sources also support click selection and entry; their direction and estimated distance are observational, while extent, orientation and morphology are explicitly illustrative. Survey picking runs on clicks, not pointer movement.

Selecting an object does not automatically open its right-hand information. Use its **Info** tab. Re-selecting a previously viewed object also starts closed. Nested nebula/black-hole controls and galaxy exit controls are separated.

## Scientific references

- [NASA galaxy types](https://science.nasa.gov/universe/galaxies/types/): morphology and differences between old spheroids and gas-rich disks.
- [Hubble’s galaxies](https://science.nasa.gov/mission/hubble/science/universe-uncovered/hubble-galaxies/): spiral star-forming regions and stellar populations.
- [Webb and Hubble’s NGC 3627](https://science.nasa.gov/asset/webb/webb-and-hubbles-views-of-spiral-galaxy-ngc-3627/): dust lanes and young stars.
- [Supabase database functions](https://supabase.com/docs/guides/database/functions) and [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): database-side authorization, restricted execution and fixed search paths.

These are morphology-based visual reconstructions, not measured 3D locations of all the displayed stars. High resolution and frame rate remain dependent on GPU, viewport and quality tier.

## Validation

- npm run test:galaxy-entry checks every supported morphology, 100,000 finite stellar samples, entry/return continuity, exterior core guard, free-look handoff, unresolved-source picking and hosted-world precision.
- npm run test:subscription-admin executes the actual migrations in an isolated PostgreSQL engine. Install its optional test engine with npm --prefix .taste-skill/sql-test install @electric-sql/pglite --no-save --ignore-scripts, or supply PGLITE_MODULE. It tests owner verification, forged metadata rejection, privacy, grant extension, idempotency, audit and environment isolation.
- Live browser camera regressions cover Proxima Centauri d, TRAPPIST-1 b, Kepler-186 b and 51 Pegasi b. Current-frame registry error was zero; maximum centering drift was below 0.000006 normalized screen units in the sampled runs.
- Galaxy browser checks cover explicit entry, 100,000 mounted stars, free-look handoff, destination panel, shader compilation and population removal after exit across representative morphologies.
- Admin presentation uses labelled isolated fixtures for desktop, tablet and mobile review. No fixture accounts or grants are sent to the live database.
