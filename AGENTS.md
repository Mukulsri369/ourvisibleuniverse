- Public information uses separate searchable TanStack routes, while the 3D experience lives at `/_authenticated/universe` behind an active-pass check, because public pages must stay crawlable without loading the scene.
- Razorpay access is granted only after server-side signature verification plus a server fetch confirming the captured payment, through the idempotent `apply_access_purchase` function, because browser checkout responses can be forged.
- Razorpay test vs live is selected by the server-only `RAZORPAY_MODE` secret, so switching to production needs no code change.
<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Sitemap galaxy visits use a galaxy-centered overview while scene clicks may focus a hosted star system, because the two actions have different framing goals.
- Planet visits follow the live body position and keep orbit/zoom active, because a moving planet otherwise drifts out of the close-up view.
- Local planetary systems use one uniform AU conversion for radii and orbital distances; a shared accumulated day clock drives astronomy-engine ephemerides and labelled satellite models, with body updates before the camera, because independent time/size boosts corrupt physical ratios.
- Opaque close-up shaders use modelViewMatrix and logarithmic-depth chunks, because world-space float projection and mismatched depth make distant exoplanets appear transparent.
- The MCP server (`src/lib/mcp/`, mounted at `/mcp`) requires OAuth sign-in and reads user data only through the caller's token, because pass records are private per user.
