# GitHub → Lovable handoff

Repository: `Mukulsri369/ourvisibleuniverse`. This checkout uses `main`.
The repository's AGENTS.md identifies it as connected to Lovable. The current
Lovable account-side active branch and sync status have not been inspected.

## Sync and publish

1. In Lovable, Project settings → Git → GitHub must show this repository and
   `main` as the active sync branch. Confirm the sync card has no divergent
   Lovable-only edits before pushing.
2. Fetch the latest GitHub state and integrate concurrent commits with ordinary
   commits/merges. Do not force-push or rewrite published history.
3. Push the reviewed source, CSS, local texture assets, credits and dependency
   manifests to the synced branch. Local `.taste-skill/` QA files are ignored.
4. Check that Lovable's sync card shows the pushed commit. Code on another
   branch will not be pulled until it is merged or selected as the sync branch.
5. To update the hosted website, choose Publish → Publish changes. Git sync does
   not automatically publish a new live-site snapshot.

GitHub sync and publishing are separate actions; a code push does not publish the hosted website.

## Google sign-in

The application retains Lovable's generated OAuth integration and Supabase
session handling. The callback is derived from the current browser origin,
never a hard-coded localhost URL. Its safe `next` query parameter preserves
checkout/academy destinations through a full redirect. Browser storage is a
best-effort fallback, not a prerequisite. Both callback and stored return paths
are validated as local paths. Duplicate sign-in clicks are disabled while busy.

Before publishing, confirm in Lovable More → Users → Settings → Google that
Google sign-in is enabled. With Managed by Lovable, Lovable manages the provider
credentials and custom-domain redirects. With Your own credentials, select the
redirect URL for `ourvisibleuniverse.in` and make sure the exact callback URLs
shown by Lovable are authorized in Google Cloud. These are provider settings;
source-code changes cannot verify or repair them automatically.

Retain the existing backend configuration in Lovable, including
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and the server-side Supabase
configuration. Do not replace it with local test values or commit credentials.

## Validation

Run `npm run test:auth` and `npm run build` before pushing. The automated auth
checks cover return routes, external-redirect rejection, production/Lovable/
local origins, and unavailable sessionStorage. They do not impersonate a Google
account or prove provider configuration.

On the published custom domain, test Google sign-in from `/auth`,
`/auth?role=student`, and a checkout URL. Verify return destinations, refresh to
check session persistence, and sign out/sign in again. The active-pass check on
`/universe` must continue to apply after authentication.

Sources:
- https://docs.lovable.dev/integrations/github
- https://docs.lovable.dev/features/publish
- https://docs.lovable.dev/features/google-auth
