# Continue Our Visible Universe with any coding tool

This is the shared entry point for Claude Code, Codex and other coding assistants. Chat history and a model's personal memory are not the project record.

## Read in this order

1. Root `AGENTS.md`: lasting architecture, navigation, security and Git rules.
2. `docs/PROJECT_HANDOFF.md`: latest checkpoint, source versus deployment, outstanding work and relevant report links. Read its latest sections; earlier statements may be historical.
3. The request and implementation report for the task you will change. Read source code and tests to confirm the report before editing.
4. `package.json` and the relevant configuration. Verify available tooling and credentials without printing secrets.

Start with `git status --short --branch` and `git log -8 --oneline`. Check remote state before assuming local changes are pushed. Do not overwrite another tool's work or rewrite published history.

## Product and engineering approach

- OVU is an interactive astronomy observatory and learning Academy. Preserve React, Three.js/R3F, TanStack Start and the established visual/navigation systems. This is an existing repository, not a request to regenerate a replacement website.
- Hosting is Cloudflare Workers, with the owned Supabase project `pdvwkdggyyrfkoqrpbji`. Follow the handoff for the current public domain and deployed Worker version. The historical Worker name contains `staging` even when serving production.
- Public information stays searchable; the 3D experience requires authenticated active-pass access. Payments require server verification and idempotent access activation. Preserve customer accounts, entitlements, Academy progress and certificates.
- Scientific accuracy matters: cite sources, retain adopted values and uncertainty, distinguish measured observations from visual reconstructions, and never fabricate missing measurements or confirmed discoveries.
- Improve graphics and interaction with measured evidence. Distinguish isolated component tests, full-app tests, desktop browser viewport emulation and physical-device tests. Do not promise universal 60/120 FPS or literal telescope-resolution imagery from limited samples.
- Preserve explicit galaxy ownership and entry/exit rules. Avoid mounting every galaxy's detailed contents or adding expensive per-frame React updates, pointer scans or unnecessary GPU uploads.
- The Store is a separate scope. Do not resume its migration or repeat completed catalogue imports, infrastructure migrations or customer campaigns.
- User authorization applies to its stated task. Future deployments, provider/payment changes, customer operations, domain changes and service retirement need applicable explicit authorization; historical approval is not a general standing grant.

## Code map

| Area | Starting point |
| --- | --- |
| Routes and app shell | `src/routes/`, `src/server.ts` |
| 3D universe and galaxies | `src/stars/`; locate the relevant component before editing |
| Scientific catalogues | `src/lib/astronomy/`, `src/stars/catalog-data/` |
| Supabase integration | `src/integrations/supabase/` |
| Payment runtime | `src/lib/payment-runtime.server.ts`, `src/lib/razorpay.functions.ts`, `src/lib/razorpay.server.ts` |
| Academy and certificates | `src/lib/academy/`, `src/components/academy/` |
| Authenticated MCP | `src/lib/mcp/` |
| Regression tools | `scripts/`, commands in `package.json` |
| Detailed evidence and decisions | `docs/` and `docs/migration/` |

The repository's `wrangler.jsonc` uses preview defaults. Never deploy it directly to production. Use the documented production preparation flow, inspect current remote bindings and preserve existing secrets and domains. Private workspace helpers are outside Git and may be absent on another machine; do not synthesize credentials.

## Work and hand off

Define a concrete acceptance criterion, inspect the affected path, implement a focused change and run appropriate checks. Normal builds use `vite.cloudflare.config.ts` with the approved public Supabase build configuration; TypeScript is checked with `npx tsc --noEmit`. Select relevant `package.json` suites rather than running unrelated live integration/customer operations. Some renderer files have `@ts-nocheck`; a passing TypeScript check does not establish their runtime correctness.

After meaningful work, update `docs/PROJECT_HANDOFF.md` with: what changed and why, code/report paths, actual checks and failures, source commit, pushed state, deployed version if actually deployed, remaining limitations and the next concrete action. Keep historical reports, but put current facts first. Never label a prepared or attempted action as completed.

Use one active editor per checkout. For concurrent tools, give each a separate branch/worktree and a bounded task; review and integrate changes deliberately. Tell the next tool about any uncommitted files before switching. Keep secrets and customer exports outside Git and prompts.

## Starter prompt

> Continue Our Visible Universe in this repository. Read AGENTS.md, docs/AI_START_HERE.md and docs/PROJECT_HANDOFF.md, then the reports relevant to my task. Check the current branch, uncommitted changes and recent commits. Briefly state your understanding of the architecture, completed work, current limitations and the next task before editing. Preserve existing science, visual/navigation behavior, authentication, paid access and Academy data. Do not repeat completed migrations, imports or campaigns. Do not deploy or change production, payments, domains, customer access or services without my explicit approval. Task: [one concrete change and how I will judge it]. Update the handoff with actual verification and source/deployment status when finished.
