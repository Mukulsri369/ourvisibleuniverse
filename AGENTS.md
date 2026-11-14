- For continuation status, read `docs/AI_START_HERE.md`, then `docs/PROJECT_HANDOFF.md` and its linked task/report files. Verify the checkout against that dated checkpoint, distinguish pushed source from deployed code, and update the handoff after meaningful work. Historical migration documents are not evidence of the current host or permission to repeat completed operations.

- Public information uses separate searchable TanStack routes, while the 3D experience lives at `/_authenticated/universe` behind an active-pass check, because public pages must stay crawlable without loading the scene.
- Razorpay access is granted only after server-side signature verification plus a server fetch confirming the captured payment, through the idempotent `apply_access_purchase` function, because browser checkout responses can be forged.
- Razorpay test vs live is selected by the server-only `RAZORPAY_MODE` secret, so switching to production needs no code change.

- Never force-push or rebase/amend/squash pushed commits, because the published history is the project record.

- Sitemap galaxy visits use a galaxy-centered overview while scene clicks may focus a hosted star system, because the two actions have different framing goals.
- Planet visits follow the live body position and keep orbit/zoom active, because a moving planet otherwise drifts out of the close-up view.
- The MCP server (`src/lib/mcp/`, mounted at `/mcp`) requires OAuth sign-in and reads user data only through the caller's token, because pass records are private per user.

- Galaxy exploration starts outside the Milky Way. Object navigation must respect `requireGalaxy` and explicit host membership in `object-hosts.ts`; never infer membership from distance. Mount named contents only during that galaxy’s entering/inside phases, and execute queued object visits only after entry completes. Cross-galaxy requests require exit, preview and explicit visit.
