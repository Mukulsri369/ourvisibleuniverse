- Public information and account/payment pages use separate TanStack routes, while the 3D experience lives at `/universe` behind paid-access verification, because public content must remain searchable without loading the scene.
- Fixed-term access is granted only by verified payment notifications through an idempotent database function, because browser return pages are not proof of payment.
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
