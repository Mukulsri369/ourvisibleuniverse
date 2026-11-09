# OVU continuation handoff — 8 November 2026

Read this first in a new chat. This is a dated development checkpoint, not a live infrastructure/customer query. Check the current checkout and actual deployed version before acting. Do not repeat completed migrations or one-time customer campaigns from historical prompts.

## 9 November — galaxies rebuilt in 3D from every angle (latest checkpoint)

- **What and why:** the owner reported that the twelve galaxies given telescope photographs looked right only from the front; from the side and back the old generic volume remained (a grey streak edge-on, the same noise spiral for every galaxy, M82 as a fog box). Disk galaxies now render as **face-on maps × analytic vertical profiles** (sech² old disk, young/dust layers at ~½ and ionised gas at ~¼ of its scale height, thick disk, flaring, flattened bulge), following radiative-transfer models of nearby spirals (De Looze et al. 2014; Xilouris et al. 1999; de Grijs 1998; Kregel et al. 2002). Report: [galaxy 3D reconstruction](GALAXY_3D_RECONSTRUCTION_20261109.md).
- **Coverage:**
  - Seven disk-registered photographs (M51, M81, M101, M33, NGC 1300, Cartwheel, Hoag's Object) supply their own in-plane structure: stars inpainted, dust measured, bulges and NGC 5195 extruded as round spheroids, disk deprojected through the photograph's registration.
  - Antennae, Tadpole and Stephan's Quintet are built from their photographed components (foreground NGC 7320 excluded). M82 is a dusty starburst disk with a biconical H-alpha wind; M104 a procedural Sombrero.
  - All other disk galaxies (214 disk-layer models in total, including Andromeda) bake a procedural face-on map. The Milky Way, ellipticals, dwarfs, irregulars, Cen A, the Magellanic Clouds, Mayall's Object and Malin 1 keep the existing cached volume.
- **Behaviour changes:** photograph-registered disks no longer rotate their pattern (they stay aligned with the photograph). Their front view reproduces the photograph's display values, so the photo/model cross-fade is nearly seamless. New derived assets: `public/textures/galaxies/derived/` (about 8 MB, loaded only for the selected galaxy). Credits updated.
- **Code:** `src/stars/galaxy-disk-layer.ts` (new), `galaxy-volume-shader.ts` (`GALAXY_DISK_FRAGMENT`), `GalaxyRadiance.tsx`, `GalaxyInteriorField.tsx`, `galaxy-structure.ts`, `catalog-data/galaxy-disk-maps.json`; tools `scripts/derive-galaxy-disk-maps.ts` (`npm run derive:galaxy-disk-maps`), `scripts/galaxy-disk-layer-validation.ts` (`npm run test:galaxy-disk-layer`), multi-angle QA page `scripts/nearby-qa/galaxy-views.html` with `scripts/galaxy-views-capture.mjs`.
- **Checks actually run:**
  - `npx tsc --noEmit` exit 0; ESLint on changed files: 0 errors (two pre-existing react-refresh warnings in `GalaxyRadiance.tsx`, two in the QA page).
  - New `npm run test:galaxy-disk-layer` passed (registration correlation of each derived disk with its photograph 0.80–0.99; profile normalisation; selection; no rotation for registered disks).
  - Passed: `test:galaxies`, `test:galaxy-clarity`, `test:galaxy-observed`, `test:galaxy-landmarks`, `test:galaxy-populations`, `test:galaxy-entry`, `test:galaxy-explorer`, `test:galaxy-empty-space`, `test:scene-depth`, `test:rendering`, `test:visual`, `test:3d`, `test:navigation`, `test:solar-controls`, `test:exploration-camera`.
  - Visual: before/after screenshots from fixed poses (front/Earth, oblique, edge, back, top) in the new QA page, headless Chromium with SwiftShader; appearance only, no frame-rate claim.
  - `npm run build:cloudflare` with the CI workflow's placeholder public key (`sb_publishable_ci_build_only`, as `.github/workflows/branch-preview.yml` does) built successfully; the 31 derived files ship under `textures/galaxies/derived/`. That local `dist/` was deleted afterwards and nothing was deployed.
- **Not established:** GPU frame time on real hardware (cloud renderer is SwiftShader; screenshots only), an authenticated full-app run, a build with the approved public Supabase configuration, physical devices. Interior travel (entering a galaxy) was not re-verified visually.
- **Source and deployment status:** commits on `migration/supabase-cloudflare` after `bafc5a4`, created in a cloud session and pushed to origin at the owner's standing instruction for this task. **Not deployed**; production remains as last recorded and was not inspected. Pushing triggers the per-branch preview workflow, which builds and uploads only if its secrets are configured.
- **Next concrete action:** review on the per-branch preview or locally (`node node_modules/vite/bin/vite.js --config scripts/nearby-qa/vite.config.mts`, then `/scripts/nearby-qa/galaxy-views.html?g=m51&v=back`). Then measure GPU cost per `ovu-perf-evidence` on a real GPU (the disk ray marcher adds texture reads per step; the 3D density cache is skipped for disk-layer galaxies, which saves about 87 MB of VRAM per selected galaxy). Candidates after that: a measured-structure Milky Way exterior, Antennae tidal tails, and smoother elliptical profiles.

## 9 November — galaxy-realism tooling and baseline audit (tooling only; not deployed)

- **What and why:** the owner asked for the skills and plugins needed to make galaxies look realistic (planets are acceptable) and to install them. A re-scan of the official marketplace (317 plugins) again found no three.js, shader or astronomy plugin, so no plugin was added. The real gaps were a render-against-telescope feedback loop, galaxy appearance knowledge and structured GLSL building blocks. Details: [galaxy realism tooling report](GALAXY_REALISM_TOOLING_20261109.md).
- **Added:**
  - New project skill `.claude/skills/ovu-galaxy-realism/`: look-dev loop, cited appearance physics, recipes mapped to `galaxy-medium.ts`, `galaxy-volume-shader.ts`, `GalaxyRadiance.tsx` and `galaxy-star-data.ts`, the morphology checklist and tests.
  - Vendored MIT skill `.claude/skills/shader-art-coding/` from `gokayfem/shader-skills@a56e773`, unchanged, with its licence and credits.
  - New QA harness `scripts/galaxy-lookdev/`: an isolated production volume at a north-up Earth, face-on or edge-on pose. `capture.mjs` writes a side-by-side sheet against the AVM-rotated registered image, plus six appearance indicators.
  - `.claude/README.md` updated with the new skills, `glslangValidator` and the reasons for not adding plugins.
- **Baseline finding:** off-axis, close-up, on entry and for all models without a registered image, the reconstructions are nearly grey: saturation 0.02–0.03, against 0.11–0.23 in the telescope images. Arms are uniform tubes and bulges are weak, with no dust lanes or HII knots. M104's dust ring renders light instead of dark, and M33 renders as a two-arm spiral rather than a flocculent one. Indicators and suspected causes are in the report and skill.
- **Checks actually run:**
  - The look-dev page type-checks (temporary tsconfig) and ESLint reports 0 errors (1 existing-style Fast Refresh warning).
  - `capture.mjs` passes `node --check`, and Prettier was applied to the new files.
  - `claude plugin validate .claude/skills` passed.
  - Six baseline captures (M51, M81, M104, NGC 1300, M33, M101) were run in headless Chromium with SwiftShader, plus `--recompute`, and a fresh end-to-end M51 capture with the final script. The "before" sheets and JSON are in [`galaxy-lookdev-baseline-20261109/`](galaxy-lookdev-baseline-20261109/). They are appearance-only, with no performance claim.
  - Not run: the galaxy test suites and build, because no runtime source changed. No full-app, authenticated or physical-device checks.
- **Machine-local (cloud session only, not in Git):** `glslang-tools` 15.1.0 via apt. The vendored `glsl_tools.py` was not executed, because the session policy blocks running downloaded code.
- **Source and deployment status:** committed and pushed to `origin/migration/supabase-cloudflare` from a cloud session. No runtime change and **nothing deployed**. Production remains as last recorded (Worker `515c5b59-f82b-4adc-8ded-b838faa23f14`) and was not inspected.
- **Next concrete action:** with owner approval, start the redesign in the skill's "Suggested order of work", beginning with structured noise and arm anatomy in `galaxy-medium.ts`. Each step needs before and after look-dev sheets, the morphology checklist, the galaxy suites and a real-GPU performance comparison.

## 9 November — per-branch preview workflow added (setup pending)

- **What and why:** the owner wants to test Claude's changes on a hosted URL before merging them into `migration/supabase-cloudflare`. New `.github/workflows/branch-preview.yml` builds every pushed branch (type check and `build:cloudflare`). It then uploads the build as a preview version of the separate, non-production Worker `ovu-supabase-preview`, with a per-branch alias URL (`https://<branch-slug>-ovu-supabase-preview.<account>.workers.dev`). The URL appears in the run summary.
- **Safety:** the workflow patches only the generated `dist/server/wrangler.json`, forcing `RAZORPAY_MODE=test` and `OVU_DEPLOYMENT_STAGE=staging` (noindex headers). It refuses to upload if the Worker name or mode differ. It never deploys the production Worker or changes domains or secrets. If `ovu-supabase-preview` does not yet exist, its first run runs `wrangler deploy` on that preview Worker only.
- **Owner setup still required:** add the GitHub secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit) and `CLOUDFLARE_ACCOUNT_ID`, and the variable `VITE_SUPABASE_PUBLISHABLE_KEY`. Until then the job builds only and prints a notice. For sign-in on preview URLs, add `https://*-ovu-supabase-preview.mukul-srivastava-025.workers.dev/**` to the Supabase Auth redirect URLs.
- **Limitations:** previews use the single production Supabase project, so sign-ins and Academy progress there are real. With test mode, imported live passes read as sandbox, so the 3D Atlas needs a sandbox (test-payment) pass. MCP is not allowed on preview origins. `npm ci` still fails on the out-of-sync lockfile; the workflow uses `npm install --no-save`.
- **Checks run:** `npx tsc --noEmit` exit 0; `build:cloudflare` succeeded locally with a placeholder public key; YAML parsed; the `jq` patch and branch-slug logic were run locally. The workflow itself has not run on GitHub yet, and nothing was uploaded to Cloudflare.

## 9 November — latest GitHub galaxy-image changes deployed

The owner explicitly requested publishing the changes pushed from Claude Code. Source **84bf05a** (including runtime **55c7d2c**) on `origin/migration/supabase-cloudflare` was built locally with the approved public Supabase configuration and deployed to the existing production Worker as **515c5b59-f82b-4adc-8ded-b838faa23f14**, receiving **100%** of traffic. This supersedes the pending-deployment statements below. Primary site: https://ourvisibleuniverse.com.

TypeScript, observed-image validation, galaxy-entry and navigation-flight checks, normal client/Worker build, credential scan and production dry run passed. Fresh before/after checks confirmed existing bindings and all four attached domains were preserved. Fifteen read-only HTTP checks passed for public/app/auth shells, MCP metadata and alias redirects. The live scene bundle and all twelve registered galaxy images matched the local build byte-for-byte. See [release record](migration/GALAXY_IMAGES_RELEASE_20261109.md).

This deployment did not run authenticated full-scene visual acceptance or physical-device performance tests, and does not close the earlier scientific/acceptance gaps. The previously documented catalogue floating-point failures remain recorded; they were not changed or rerun for this release. No customer, payment or database operation was performed.

Latest release: **https://ourvisibleuniverse.com is now primary**, as explicitly authorized by the owner. Runtime source **445382d** was pushed to `origin/migration/supabase-cloudflare` and deployed as Worker **2b85f0a4-a0cc-407d-8237-8e3560fc70b5**, receiving 100% of traffic. Ordinary `.in`, www `.in` and www `.com` requests redirect to apex `.com`, preserving path/query; old auth and machine endpoints are retained. Validated HTTPS, public pages, callbacks, redirects, MCP metadata, retained webhook hostname and the byte-matched live galaxy asset passed checks. Cloudflare zone is active; email DNS was preserved and publicly verified; Supabase Site URL/callbacks were saved; Razorpay shows `.com` Approved. No payment or customer-data mutation was performed for this transition. See [domain release](migration/COM_DOMAIN_20261108.md) and [shared onboarding guide](AI_START_HERE.md). New `CLAUDE.md` imports the shared rules. Earlier `.in`-primary and pending-publication statements below are historical.

Latest release: on 8 November the owner explicitly requested pushing all changes and making them live. Source through **6636040** was pushed to `origin/migration/supabase-cloudflare` and deployed to the existing production Worker as **3fa153d6-5214-4fa4-9519-d70566eabb7a**, serving 100% of traffic. See [release verification](migration/GALAXY_RELEASE_20261108.md). Both domains passed read-only page checks and the live scene asset matched the release build byte-for-byte. Production bindings were preserved. Earlier local-only/not-deployed statements below are historical checkpoints, superseded by this release.

The dense-view follow-up fixes stepped mouse input and unnecessary drag/wheel survey scans; it supersedes the earlier direct-pointer response. The nearby release remains at 831 catalogue galaxies / 641 additions. The grouped M31 P1/P2/P3 destination remains at 14/124/18 counts, with authenticated full-scene acceptance still pending. Publication does not close the documented scientific, source-rights or device/performance acceptance gaps.

## 8–9 November — registered telescope images for selected galaxies (latest checkpoint; local commit only)

- **What and why:** the owner asked for the Milky Way and nearby galaxies to look realistic, like Hubble and Webb releases. Twelve galaxies now show their published Hubble, Webb or VST image when selected and viewed from the Solar System's side (M81, M51, M101, M104, M82, Antennae, Tadpole, Cartwheel, Hoag's Object, NGC 1300, Stephan's Quintet, M33). The image fades to the 3D reconstruction off-axis, close up and on entry. Method, sources, limitations and next steps: [observed-image report](GALAXY_OBSERVED_IMAGES_20261108.md).
- **Scientific corrections made alongside:**
  - Curated galaxies were oriented without their sky position (M51 appeared 88.7° inclined from Earth instead of 22°). 78 models now use the measured on-sky orientation.
  - Ten reconstructions carried rounded positions, up to 4 disk radii from their catalogue body. Models now take the catalogue position.
  - Catalogue positions corrected with evidence: Cartwheel, Hoag's Object, NGC 1300, Antennae, Tadpole, Mayall's Object. Nine further l/b-vs-RA/Dec disagreements are flagged, not changed.
- **Behaviour changes to know about:** overview framing of galaxies beyond 1 Mly now looks from the Solar System's side (satellites keep the old framing after the LMC view broke in QA). Synthetic bloom is off while a registered image is shown. The QA page accepts `?optics=1` to add the production optics pipeline.
- **Checks actually run:**
  - `npx tsc --noEmit` exit 0. ESLint on changed files: 0 errors, 4 existing-style warnings.
  - New `npm run test:galaxy-observed` passed.
  - Passed: `test`, `test:catalog`, `test:consistency`, `test:extragalactic`, `test:compact`, `test:nebulae`, `test:black-holes`, `test:galaxies`, `test:scene-depth`, `test:galaxy-clarity`, `test:solar-galactic-motion`, `test:galaxy-entry`, `test:navigation`, `test:galaxy-populations`, `test:galaxy-landmarks`, `test:galaxy-empty-space`, `test:galaxy-explorer`, `test:exploration-camera`, `test:nearby-catalog`, `test:rendering`, `test:visual`, `test:3d`, `test:cosmic-web`, `test:lss`, `test:evolution`, `test:qa`, and the Andromeda expansion/remaining, galaxy-experience, overview-appearance and rendering-performance scripts.
  - `test:nearby-expansion` and `test:nearby-regressions` fail, identically on a clean worktree of `53369a0`: a last-digit floating-point difference in the `mcconnachie-2021-andromeda20` raw import. Pre-existing and unrelated.
  - Visual: loopback QA in headless Chrome with SwiftShader, with and without `?optics=1`. Screenshots only; no performance claim.
  - Not run: the production app, authenticated full-scene checks, `build:cloudflare` (needs the approved public Supabase config), academy/auth/payment suites (untouched areas).
- **Source and deployment status:** one local commit after `53369a0` on `migration/supabase-cloudflare`, created in a cloud session. On 9 November, at the owner's request, `55c7d2c` (with `38c5333` and `53369a0`) was **pushed** to `origin/migration/supabase-cloudflare`. **Not deployed**: the build needs the approved public Supabase config and Cloudflare login, neither available in the cloud session; the owner must build and deploy locally. Production remains as last recorded and was not inspected.
- **Next concrete action:** apply and review the patch, run the app locally and look at M81, M51, M104 and M33 from the overview. Then: LMC and SMC images (framing and a frame window are needed; registration data is in the report), Centaurus A, a high-resolution registered Andromeda image (must be supplied by the owner), and the Milky Way exterior reconstruction.

## 8 November — Claude Code project tooling installed (configuration only)

- **What and why:** the owner asked to install the tooling recommended in the [visual-fidelity tooling report](VISUAL_FIDELITY_TOOLING_20261108.md) for the next improvement work. It is installed as committed project configuration, so local Claude Code and cloud sessions get the same setup. See [`.claude/README.md`](../.claude/README.md).
- **Plugins:** `.claude/settings.json` enables six `claude-plugins-official` plugins at project scope, written by `claude plugin install … --scope project`:
  - `chrome-devtools-mcp`, `playwright`, `context7`, `typescript-lsp`, `skill-creator`, `code-review`.
  - It also declares the marketplace under `extraKnownMarketplaces`.
- **Plugins left out:**
  - `cloudflare`: its bundled account-level MCP server (`mcp.cloudflare.com`) can build and deploy.
  - `supabase`: needs a token and reaches the production database.
  - `security-guidance`: runs hooks and an LLM review on every turn.
  - `pr-review-toolkit`: about 1,600 always-on tokens.
  - `modern-web-guidance` and `frontend-design`: low relevance.
- **Guardrails** (also in `settings.json`):
  - Deny: Wrangler deploy, version deploy and secret commands; force-push; reading `.dev.vars*`, `.env.local*` and `.env.production*`.
  - Ask first: any `git push`, rebase, amend, `reset --hard`, other Wrangler commands and Supabase CLI.
  - These are pattern rules, not a security boundary; AGENTS.md approvals still govern.
- **Skills in `.claude/skills/`:**
  - Three new OVU skills (`ovu-object-intake`, `ovu-asset-pipeline`, `ovu-perf-evidence`) built from the repository's actual files, scripts and rules.
  - Nine MIT three.js skills copied unchanged from `cloudai-x/threejs-skills@0e18186` (they target three r186).
  - The MIT `webgpu-threejs-tsl` skill from `dgreenheck/webgpu-claude-skill@af2319b`.
  - Licence files are kept in each vendored folder. The vendored files were scanned for shell pipes, remote scripts and agent-directed instructions; none were found.
- **Findings for future tasks (not fixed here):**
  - `npm ci` fails because `package-lock.json` is out of sync with `package.json` (missing `@emnapi/*`). `npm install` works, and the lockfile was restored unchanged.
  - `CosmosAssetLoader` points KTX2 at `/decoders/basis/`, but `public/decoders/` does not exist.
  - `src/lib/astronomy/observation/aladin-service.ts` loads GPL-3.0 Aladin Lite at runtime and offers the CDS **DSS Color** HiPS, among other surveys. DSS prohibits commercial use without permission, so this belongs in the owner's source-rights review. It is not legal advice.
- **Checks actually run:**
  - `claude plugin list` shows the six project plugins, and `claude plugin validate .claude/skills` passed.
  - `settings.json` parses as JSON. `npx tsc --noEmit` exited 0 on the unchanged source.
  - The isolated loopback QA page (`scripts/nearby-qa/navigation.html`, port 31755) loaded through Playwright 1.65.0 and system Chrome with no console errors. The cloud renderer was SwiftShader, so it is valid for screenshots only, not performance.
  - KTX-Software 4.4.2 encoded `moon.jpg` (1.05 MB) to KTX2 in `/tmp`: ETC1S 0.34 MB, UASTC 2.54 MB, 12 mip levels.
  - `npm run build:cloudflare` was **not** completed: it correctly refuses to run without the approved public Supabase build configuration, which is absent from Git and was not synthesised.
  - The QA server was stopped.
- **Machine-local installs (cloud workspace only; not in Git):** npm dependencies, global `typescript`, `typescript-language-server`, `@gltf-transform/cli`, the KTX-Software 4.4.2 tools and a Playwright module outside the repository. Your Windows machine needs the steps in `.claude/README.md`.
- **Source and deployment status:** a configuration and documentation commit follows `38c5333`, both created in a cloud session with read-only GitHub access. **Not pushed and not deployed.** Production remains as last recorded (Worker `2b85f0a4-a0cc-407d-8237-8e3560fc70b5`, source `445382d`) and was not freshly inspected.
- **Next concrete action:**
  - Push or apply the commits, then open the repository in Claude Code and accept the plugin and trust prompts.
  - First improvement task: an authenticated full-app performance trace with `chrome-devtools-mcp`, then KTX2 conversion following `ovu-asset-pipeline` (including self-hosting the Basis transcoder).
  - Each task needs its own approval; deployment needs explicit authorisation.

## 8 November — visual-fidelity tooling research (documentation only)

- **What and why:** the owner asked which Claude Code skills, plugins and GitHub repositories would help OVU reach higher-resolution, realistic and scientifically sourced visuals with smooth interaction across all observed object classes. The answer is in the [visual-fidelity tooling report](VISUAL_FIDELITY_TOOLING_20261108.md). This was research only. No source, catalogue, texture, dependency, configuration, Supabase, Cloudflare, payment, DNS or customer change was made, and nothing was installed into the owner's Claude Code.
- **Checkout verified:** a fresh cloud clone of `migration/supabase-cloudflare`, clean and level with origin at `c1b1ab0` before this commit. The owner's Windows workspace was not visible from this session, including any uncommitted files, the private helpers and the loopback 31755 preview.
- **Recorded findings:**
  - The renderer is WebGL-only (no `three/webgpu` or `three/tsl` imports).
  - Planet maps are 2048×1024 and moon maps 1024×512.
  - The 70 JPEG textures total 525 megapixels, about 2.6 GiB if all were uploaded uncompressed. That is an upper bound, not a VRAM measurement.
  - KTX2 is used only in the cinematic loader; 123 files use `@ts-nocheck`.
  - Upstream: three 0.187.0; R3F 9.8.2 stable, with v10 still alpha. Gaia DR4 is due 2 December 2026, and Euclid DR1-Foundation is due in November 2026.
  - Licence cautions: TimeCraftJS needs Caltech negotiation for commercial use. Aladin Lite (GPL-3.0) and Stellarium Web Engine (AGPL-3.0) are reference-only for paid OVU. DSS imagery prohibits commercial use without permission.
- **Checks actually run:**
  - Git branch, status and log inspection.
  - Dependency and grep counts, and a JPEG header dimension scan.
  - A parse of the official and community plugin catalogues, and npm dist-tags.
  - Licence-file reads, plus a `git ls-remote` check that every cited GitHub repository resolves.
  - Not run: build, TypeScript, lint or test suites (no code changed); browser, device or production inspection.
- **Source and deployment status:** one documentation-only commit on top of `c1b1ab0`, containing the report and this section, created in a cloud session with read-only GitHub access. **Not pushed and not deployed.** Production remains as last recorded (Worker `2b85f0a4-a0cc-407d-8237-8e3560fc70b5`, source `445382d`) and was not freshly inspected.
- **Next concrete action:**
  - Optional: the owner installs the report's §2 tooling locally.
  - First measured task: an authenticated full-app performance trace at a fixed pose, viewport and DPR. This also closes the pending M31 nuclear-destination acceptance.
  - Then: the KTX2 texture-pipeline task.
  - Each task needs its own approval, and deployment still needs explicit authorisation.

## Current scope and architecture

- Repository: https://github.com/Mukulsri369/ourvisibleuniverse
- Working branch: `migration/supabase-cloudflare`. Preserve published history; do not force push or rewrite pushed commits. Do not assume it is merged into `main`.
- The owner abandoned Hostinger/MariaDB. OVU uses Cloudflare Workers and owned Supabase project `pdvwkdggyyrfkoqrpbji` (https://pdvwkdggyyrfkoqrpbji.supabase.co).
- Production: https://ourvisibleuniverse.com (primary). Existing `.in` and both www aliases remain attached, with ordinary page requests forwarded to apex `.com`. Current runtime source is `445382d`, including the previously published Andromeda, nearby-galaxy and motion changes. See the latest release record above.
- Preserve React/Three.js/R3F, the existing TanStack architecture, Academy, authentication, paid-access enforcement and server-verified Razorpay purchases. Inspect current code/configuration rather than trusting older generic architecture documents.
- The Store is outside the current scope. Do not resume its migration or reopen its backup discussion without a new request.
- Earlier approvals covered specific historical operations, not permission to repeat grants, imports, emails, charges, refunds or infrastructure changes.

## Completed and published earlier

- OVU moved to Cloudflare and owned Supabase. Historical customer transfer, Google sign-in, Academy/admin and payment work have dated records in `docs/migration/`.
- The owner subsequently reported a successful real Live payment. Distinguish that report from a newly executed provider/webhook/refund audit. Do not restore obsolete checkout-held/Test-mode settings from earlier checkpoints.
- Startup toolbar visibility, galactic travel speed `3090` and seven days per real second were published. Historical source: `cfcf1cb`; Worker version: `d367a27f-8be5-4390-bad9-b9beaef31b05`. See [startup defaults](migration/UNIVERSE_STARTUP_DEFAULTS_20261106.md). The 8 November release supersedes that version.
- A specifically authorized seven-day gift was applied to the fixed cohort of 82 accounts on 6 November. See [campaign record](migration/SEVEN_DAY_PROMOTION_20261106.md). That count is historical, not today's user/access count. Do not apply the campaign again or infer permission to send another email.
- Keep former service resources and backups until separately authorized for retirement. Deployment does not prove old subscriptions/resources were cancelled.

## Historical source checkpoint — subsequently deployed on 8 November

- `89fa2bc`: first sourced Andromeda batch, pushed.
- `bf947ab`: seven further destinations, rendering/navigation fixes, tests and measured QA, pushed to `origin/migration/supabase-cloudflare`. Working tree was clean at that checkpoint.
- Combined expansion: 13 new canonical M31 objects, 123 global observed objects and 17 M31 explorer destinations, preserving the four original entries.
- Added M31-V1, AE And, AF And, NGC 206, Mayall II/G1, M31*, BA 1-465, PN1687, SN 1885A remnant, D478, M31N 2008-12a, XB091D and M31 ULX-1.
- Implemented alias/host reconciliation, filters, sourced details/dossiers, uncertainty labels, contextual scale captions, same-host Galaxy overview and selected-only models.
- Fixed catalogue/nucleus scene registration, logarithmic gas depth/compositing, compact disk shading and overview focus/FOV. No confirmed M31 planet was invented; PA-99-N2 remains an unconfirmed educational exhibit.
- Original specification: [Andromeda request](ANDROMEDA_EXPANSION_REQUEST.md).
- Sources, implementation and deferrals: [expansion report](ANDROMEDA_EXPANSION_REPORT.md).
- Actual numeric evidence: [performance samples](andromeda-performance-results.json).

## Executed verification

- Ten passing suites: `andromeda-expansion-validation`, `andromeda-remaining-validation`, `galaxy-explorer-validation`, `galaxy-entry-validation`, `galaxy-experience-validation`, `galaxy-landmarks-validation`, `nebula-validation`, `compact-objects-validation`, `black-hole-validation`, `astronomy-validation` (63/63 astronomy checks).
- TypeScript, affected-source ESLint/formatting and final normal client/Cloudflare Worker build passed. No tests were skipped, deleted or weakened.
- Built-browser review exercised all seven additional models, aliases/filters, entry/exit/re-entry, sources/dossiers, responsive controls and final overview framing. Final normal-build check captured no error-level console messages.
- Mobile checks used a 390×844 desktop-browser viewport, not a physical phone. A local QA build forced Orion's image to 404 and verified that its procedural volume survived.
- Desktop baseline: 21.33/21.55 FPS; expanded: 21.20/21.23. Mobile viewport expanded: 42.69/39.71; contemporary baseline control: 42.15, versus 46.96 earlier. Draw calls/points matched; geometry attributes increased 32,448 bytes. These are limited observations, not a zero-regression or 60-FPS guarantee.
- Inactive-tab samples near 1 Hz were explicitly excluded. QA instrumentation requires an explicit build flag and loopback host; the final normal build disables it.

## Still deferred or unverified

The entire original prompt is not signed off. The prior curated expansion and its recorded QA are complete; the new nuclear destination still needs authenticated app-level visual acceptance, broader performance optimization remains open, and scientific coverage/property enrichment is partial. An exhaustive M31 census is not required by the original specification.

1. Reconcile further red supergiants, PHAT/PHAST clusters, compact-source candidates and nuclear P1/P2 structures individually. Verify canonical identifiers/aliases, membership, coordinate frame/epoch, measured properties and uncertainty before adding them. Do not pad the catalogue or duplicate sources.
2. Broader performance optimization remains. The desktop baseline itself is around 21 FPS; the expansion did not establish a general performance fix. Preserve scientific/visual behavior and use measurements.
3. Physical-phone testing, total GPU-memory measurement and exhaustive provider-outage/leak testing are not established. JS heap/geometry bytes are not total VRAM.
4. Gemini-backed features and human-completed email recovery were previously left unverified by the owner. Other migration acceptance/reconciliation limitations remain in their reports; Andromeda QA did not re-audit them.
5. The owner authorized publication of all pending changes on 8 November, and this release includes `bf947ab`. Future production changes still need applicable explicit approval. Deployment does not substitute for pending scientific development or acceptance.

## How to resume safely

- Check `git status --short --branch` and recent commits first. Preserve newer work: this handoff may be older than the checkout. Its own documentation commit is later than `bf947ab`.
- For Andromeda work, compare the original request, report and real code. Implement scientifically defensible additions in focused batches, run relevant checks, and record actual results/deferrals.
- Use `vite.cloudflare.config.ts`. In this Windows workspace the secure helper `../../run-ovu-supabase.ps1`, evidence in `../../evidence/`, and private configuration are outside Git. A fresh clone will not have them. Check availability; never synthesize credentials or pretend a cloud environment can access the owner's local database.
- The earlier checkpoint left a preview at http://127.0.0.1:31751/universe; the continuation's QA servers were subsequently stopped. Start a fresh preview and verify which build it serves. Reacquire browser/tool handles; old session identifiers are not durable. Keep the tab selected, match camera/DPR/viewport and avoid running builds during frame measurements.
- Keep passwords, API secrets, private keys, private links and customer exports out of chat/Git. Private evidence stays outside the source repository.
- This handoff does not authorize production deployments, domain/DNS changes, purchases, payment/provider changes, customer access/import operations or Lovable cancellation. Obtain the applicable explicit approval for a new consequential action. Do not rerun live financial tests without authorization.
- Update this handoff and relevant reports after meaningful work, including commits, source/deployment distinction, executed checks and next actions. Never mark an unexecuted check as passed.

## Suggested first message in a new chat

> Continue OVU in this repository on migration/supabase-cloudflare. Read AGENTS.md and docs/PROJECT_HANDOFF.md first, then docs/ANDROMEDA_EXPANSION_REQUEST.md and docs/ANDROMEDA_EXPANSION_REPORT.md. Preserve completed work including 89fa2bc and bf947ab, and inspect newer commits before editing. Continue deferred development with actual verification; do not repeat completed migrations or campaigns. Do not deploy or change production, payments, customer access, domains or services without my explicit approval.

## 7 November continuation after 097b180 — local nuclear-structure batch

- Preserved `89fa2bc`, `bf947ab` and the clean `097b180` checkpoint. Added one grouped nuclear stellar-structure destination, `m31-nuclear-stars` (P1/P2/P3), distinct from the existing M31* black hole. Current source counts: 14 expansion records, 124 global observed objects, 18 M31 explorer destinations.
- Added sourced membership/coordinate/uncertainty disclosures and alias search, an asymmetric warm plus nested blue selected-only population, color-preserving brightness and portrait-aware visit framing. Approximate nuclear centre reused; no component astrometry, measured diameter, extra black hole or measured orbital elements invented.
- Full details and executed checks: final continuation section in [expansion report](ANDROMEDA_EXPANSION_REPORT.md). Earlier P1/P2 deferral is now partially addressed by a grouped illustrative stellar exhibit; resolved astrometry and fitted dynamics remain deferred.
- Local-only source changes at this checkpoint: not pushed, not deployed. No production, customer-access, payment, DNS or infrastructure changes. The previously documented production Worker version has not been freshly inspected.
- Built application reached its normal sign-in screen on loopback 31752; the new destination still needs authenticated built-app visual acceptance. Isolated shared-geometry/material WebGL checks passed at desktop and 390x844, with no captured error-level console logs; these do not establish React-scene/navigation acceptance, physical-phone performance, VRAM or general FPS improvement.
- Resume with the current Git state and newest commits. Do not repeat the earlier expansion/QA or historical migration/campaign operations. Next: authenticated local acceptance of this batch, then individually sourced survey candidates and measured performance work. Deployment still requires the owner's explicit approval.
- Local implementation checkpoint: `6a8f2f2`; working branch is ahead of origin, with no push. All recorded final source checks passed. QA servers were stopped. Rebuilding replaced asset hashes beneath the earlier running previews, so start a fresh Worker preview for pending authenticated acceptance; see the report's cleanup caveats and isolated-harness warning.

## Prompt-accuracy audit follow-up

The full nine-phase request was compared with current source and evidence; see the final audit section of the expansion report. Both Andromeda suites passed again. Do not equate curated coverage with an exhaustive-census obligation, or isolated GPU QA with authenticated full-scene acceptance. Current app-level QA/performance/scientific-enrichment gaps remain open; physical-device/VRAM/exhaustive-outage checks are additional confidence work. Passing TypeScript does not type-check the existing `@ts-nocheck` renderer module. No fresh production inspection, push or deployment was performed.

## Nearby galaxy expansion — local release v1

- Source implementation: **7c23c53**, local only on migration/supabase-cloudflare. No push or deployment. See [master report](NEARBY_GALAXY_EXPANSION_MASTER_REPORT.md), [original request](NEARBY_GALAXY_EXPANSION_REQUEST.md), [coverage](nearby-galaxy-coverage.json) and [source manifest](../src/stars/catalog-data/nearby-v2/source-manifest.json). Do not repeat this import or the earlier Andromeda/customer work.
- Inventory: **190 → 831 catalogue galaxies**, including 606 UNGC-2013 additions and 35 from the January-2021 author dwarf compilation. The Milky Way remains separately represented. The 46 H II destinations and M31 14/124/18 counts are unchanged. These are historical source editions retrieved in 2026, not a 2026 measurement census.
- Preserved existing IDs/adopted observations. Added source rows, citations, method/error/missing-value handling, alias reconciliation, persistent identity history, 64-record chunks and deterministic ingestion/checksums. Processed 1,013 rows; 150 deferred. New distances: 476 individual-indicator estimates and 165 group adoptions; 426 lack supplied distance errors, 97 lack radial velocity and 3 lack axis ratio. No nearby flow distance, guessed zero velocity/error or fabricated galaxy position was added.
- One shared morphology-aware, camera-relative distant field replaces per-object preview geometry. Catalogue previews are capped at 8 desktop/4 mobile; selected/active detail remains gated. Existing M31/Milky Way/curated models, explicit hosts, entry/exit and queued visits remain. The synthetic 10k visibility-index test is not a real 10k catalogue or GPU validation.
- Existing explorer now has nearest-first discovery, distance/type/association/featured filters, alias search and object-specific Science details. Cluster labels show actual explicitly assigned atlas member counts and open member discovery as spatial organisations; they no longer create single-galaxy cluster visits. Inside-galaxy requests retain the explicit exit step.
- Corrected an older definitive M31 merger caption using the linked 2025 Hubble/Gaia study. NED lookup uses the current documented OverviewOfObject/VOTable API and labels its local fallback honestly. The live browser check used that fallback; successful live browser retrieval remains unverified. Rendering has no runtime NED dependency.
- Final verification: **21 regression suites**, TypeScript, affected-source ESLint, deterministic --check regeneration and normal client/Cloudflare Worker build passed. [Browser evidence](nearby-galaxy-browser-results.json) covers real explorer/CameraRig entry, exit and re-entry at desktop and 390×844, plus cluster/host gating and NED outage handling. [Built smoke](nearby-galaxy-built-smoke.json) reached the expected anonymous sign-in guard with no page errors. Isolated test scripts are not production routes.
- Raw performance: [baseline](nearby-galaxy-baseline-performance.json), [expanded](nearby-galaxy-expanded-performance.json), [startup](nearby-galaxy-startup-comparison.json) and [visibility](nearby-galaxy-visibility.json). Desktop 100-Mpc-scale component test: 31.9 → 117.2 FPS; 175 → 2 calls. Geometry attribute arrays at startup: 26.79 → 0.974 MB. Final mobile inside-MW sample fell 70.6 → 68.4 FPS; do not claim universal zero regression. These are isolated actual components, not authenticated full-app or physical-phone results, and JS heap/geometry bytes are not total VRAM.
- No new data beyond 30 Mpc; existing later-distance records remain. Newer satellite/classification research, deferrals, optional property enrichment, photometric calibration, additional featured models and broader source subsets remain. Resolve source-specific reuse rights before publication where no blanket permission was established. No source-completeness claim.
- Earlier pending authenticated built-app acceptance of the M31 nuclear destination is still pending. Physical-device, total-VRAM, exhaustive outage/leak and full-app performance claims are not established. No production, customer, payment, DNS or service changes were made; the historical production version has not been freshly inspected.
- Resume with the current Git state and this report. Frozen-input validation: npm run test:nearby-expansion; npm run ingest:nearby-catalog -- --check. Raw sources live in ignored .cache/nearby-catalogue-sources; source refresh commands and optional Playwright harness setup are in the report. A new source edition requires review; preserve IDs/history and do not silently replace measurements or admit all candidates.
- Cleanup complete: loopback QA servers on 31755/31756/31757 stopped; detached baseline worktree and its dependency junction removed. Scratch files were preserved in the current chat work folder. Raw source cache and ignored screenshot evidence remain available locally. Source working tree is ready for this documentation checkpoint; no push/deployment occurred.

## 8 November — galaxy mouse-orbit and appearance refinement

- Continued the owner's report of lag while rotating a wide galaxy view. See [motion/appearance report](GALAXY_MOTION_REPORT_20261108.md) and [observatory references](GALAXY_OVERVIEW_APPEARANCE_20261107.md). No catalogue import, Andromeda destination work or historical migration/customer operation was repeated.
- Local source checkpoint: **f29fe43**, not pushed or deployed. After preview cleanup, the final desktop-wide comparison measured 67.3 → 103.6 FPS and 33.2 → 16.7 ms p95; the raw original/updated checks are linked in the report. This is a local component comparison, not full-app or universal hardware acceptance.
- Direct frame-sampled mouse/touch angles remove the artificial orbit filter delay; zoom, automated flights, keyboard control and explicit galaxy ownership remain. Pointer travel prevents closed-loop drags from becoming clicks. Real batched-marker clicking still works.
- Hover picking pauses during a pressed-pointer move, preview membership stays stable during drags, and unchanged mask buffers are not uploaded. Distant selected detail follows screen-size LOD; explicit entry retains its full population. Tiny 2MRS profiles and catalogue overview shading avoid unnecessary raymarch work.
- All 830 batched models get deterministic morphology profiles; 17 have individual NASA/ESA/ESO guide cues. Softer exterior stars, colour-preserving volume exposure and physical-resolution point sizing improve appearance. Missing RGB/depth/association astrometry remains reconstruction. All scientific records, adopted measurements and the 831 / 641 / 14 / 124 / 18 counts remain unchanged.
- Passed focused orbit/click tests at 30/60/120 Hz, existing navigation/ownership suites, rendering/experience/clarity/population suites, frozen-input regeneration, TypeScript, affected-source ESLint and the normal client/Cloudflare Worker build. The six-case high-DPI shader/visual check passed at DPR 1.5; real desktop/mobile-viewport navigation, entry/exit/re-entry, host gating and NED fallback checks passed. These are isolated actual components, not authenticated full-app or physical-phone acceptance.
- Raw drag samples vary with host load. The report retains initial, contemporaneous-control and updated samples, including worse near-view tail timing in a later sample. Do not claim universally smooth 60/120 FPS, literal 4K telescope imagery, zero regression or total-VRAM measurement. The angular-response regression is separately verified in the browser.
- Closed three duplicate preview tabs, refreshed the remaining right-pane preview on Hoag's Object, and made the local QA root safe to reuse on hot refresh. Loopback 31755 is intentionally left running for review; it is an isolated local QA page, not a production route.
- No push, deployment, production, customer/access, payment, DNS or service change. The earlier authenticated M31 nuclear-destination acceptance and source-rights review remain pending. Continue from the current Git state and this report; do not repeat completed imports/tests without a changed code path or unresolved concern.

## 8 November — dense-view input follow-up

- Local source checkpoint **5a911d6**; normal client/Cloudflare Worker build passed. No push or deployment. The following evidence supersedes the earlier manual-pointer behavior without redoing the catalogue/appearance expansion.
- The owner repeated the lag report with a screenshot of the Milky Way zoomed out into the dense nearby field. See [follow-up report](DENSE_ORBIT_SMOOTHNESS_20261108.md). The earlier high FPS check did not establish smooth input presentation: direct pointer snapping held heading between packets. The controlled 20 Hz test held 83.3% of frames before; after short render-time interpolation it held 0%, with prompt settling and no continuing drift. This supersedes `f29fe43`'s direct manual-angle behavior; automated flights, zoom and ownership rules remain.
- Deferred the 42,541-source picker until genuine clicks. Real browser instrumentation recorded 85,048 position reads per drag and 42,524 per wheel event before, and zero for both afterward. True source clicks still select the correct source and now perform one scan. No galaxy, measurement, appearance, geometry or catalogue source changed.
- Actual right-pane 678×615/DPR1 dense-view drags at 35 Mly measured 120.0/120.3 FPS, p95 10.7/9.9 ms and 0/72 + 0/113 frames over 33.4 ms after loading. These are limited native-automation samples, not a universal GPU/physical-device guarantee. The report retains separate lower headless samples and explains why average FPS alone is insufficient.
- Orbit/click, sparse-input, survey-event, camera/navigation/ownership, real entry/exit/re-entry, TypeScript and affected lint checks passed. Final normal build status is recorded in the follow-up report. The QA-only `?motion=1` panel measures frames and offers reproducible zoom presets; it was hidden after testing. One dense-view preview remains open on loopback 31755.
- Local only; no push, deployment, production, customer, payment, DNS or service changes. Earlier authenticated M31 full-app acceptance remains pending. Do not repeat the import, appearance research or historical campaigns.
