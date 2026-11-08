# Visual-fidelity, scientific-data and performance tooling — 8 November 2026

Advisory research for the owner's question: which Claude Code skills, plugins and GitHub repositories would help OVU reach higher-resolution, more realistic visuals backed by accurate scientific data, with smooth interaction, across all observed object classes (stars, planets, moons, nebulae, galaxies, quasars, black holes and so on).

**Status:** research and documentation only. No source code, catalogue, texture, dependency, configuration, Supabase, Cloudflare, payment or customer change was made. Nothing was installed into the owner's Claude Code. Nothing was deployed. Every recommendation below is a separate future task that needs its own acceptance criterion, measurement and (where applicable) explicit approval.

## 1. Repository facts behind the recommendations

Measured in a fresh clone of `migration/supabase-cloudflare` at `c1b1ab0` (clean, in sync with origin):

| Fact                       | Value                                                                                                                                                          | Why it matters                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Renderer                   | WebGL only. 0 files import `three/webgpu` or `three/tsl`; 31 files use `ShaderMaterial`; `logarithmicDepthBuffer` in 1 file                                    | A WebGPU move is a shader migration, not a one-line swap                              |
| Versions                   | `three` ^0.184.0 (npm latest 0.187.0), `@react-three/fiber` ^9.6.1 (latest stable 9.8.2; v10 is `10.0.0-alpha.6`), `@react-three/drei` ^10.7.7 (latest 10.7.9) | Minor upgrades are available; R3F v10 is not production-ready                         |
| Type checking              | 123 source files contain `@ts-nocheck`                                                                                                                         | `npx tsc --noEmit` does not cover most renderer code (already noted in AI_START_HERE) |
| Solar-system maps          | Planets 2048×1024, moons 1024×512 (Solar System Scope CC BY 4.0 and a USGS-derived mirror, per `public/textures/solar/CREDITS.md`)                             | The clearest "ultra HD" gap is planetary close-ups                                    |
| Deep-sky images            | 70 JPEGs under `public/textures` (167 MB on disk; `public/` is 212 MB). Largest is 9163×9163 (`witch_head.jpg`); several at about 4000²                        | JPEGs decode to uncompressed RGBA on the GPU                                          |
| Texture memory upper bound | 525 megapixels in total, or about 2.6 GiB if every JPEG were uploaded as RGBA8 with mipmaps                                                                    | An arithmetic ceiling, not a VRAM measurement; scenes load subsets                    |
| GPU-compressed textures    | `KTX2Loader` is used only in `src/lib/cosmos/cinematic/assets/CosmosAssetLoader.ts`                                                                            | The universe scene does not yet benefit from KTX2                                     |
| Performance evidence       | Handoff records about 21 FPS for the full-app desktop baseline, with separate higher isolated-component results                                                | Measurement must come before optimisation claims                                      |

## 2. Claude Code setup (owner's machine)

Tools only help Claude Code see, measure and look up information. Visual realism comes from sourced data, better assets and rendering work, each verified. None of these tools grants permission to deploy or change production.

### 2.1 Official marketplace plugins (`claude-plugins-official`, registered automatically)

Install with `/plugin install <name>@claude-plugins-official`. Names were checked against the marketplace catalogue on 8 November 2026.

| Plugin                                                  | Use for OVU                                                                                                                                      | Caution                                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chrome-devtools-mcp`                                   | Performance traces, long tasks, memory, network and source-mapped console errors on the local preview. This is the main tool for "lag-free" work | Use a fixed viewport, DPR and camera pose; keep the tab selected; don't build during traces                                                                         |
| `playwright`                                            | Scripted multi-viewport screenshots, visual-parity checks for asset changes, smoke tests behind sign-in on loopback                              | Emulated viewports are not physical phones                                                                                                                          |
| `context7`                                              | Up-to-date docs for three r18x, R3F 9, drei, TanStack Start and Wrangler                                                                         | Check results against the installed versions                                                                                                                        |
| `typescript-lsp`                                        | Navigating large TSX modules such as `Planets.tsx`, `UI.tsx` and `CameraRig.tsx`                                                                 | Gives limited help inside `@ts-nocheck` files                                                                                                                       |
| `skill-creator`                                         | Building the project skills in §2.4                                                                                                              | —                                                                                                                                                                   |
| `hookify`                                               | Turning project rules (no deploy, no force-push) into hooks                                                                                      | Hooks are guardrails, not a security boundary                                                                                                                       |
| `code-review`, `pr-review-toolkit`, `security-guidance` | Reviewing diffs that touch auth, paid access, Razorpay or Academy data                                                                           | —                                                                                                                                                                   |
| `claude-code-setup`                                     | Repository-specific suggestions for hooks, skills and subagents                                                                                  | Review its suggestions against AGENTS.md                                                                                                                            |
| `modern-web-guidance` (GoogleChrome, Apache-2.0)        | Current web-platform practice (loading, workers, images)                                                                                         | —                                                                                                                                                                   |
| `cloudflare` (cloudflare/skills)                        | Workers, Wrangler and web-performance knowledge                                                                                                  | Never deploy; `wrangler.jsonc` holds preview defaults                                                                                                               |
| `supabase`                                              | Optional schema/doc lookup only                                                                                                                  | If used: `--read-only --project-ref=pdvwkdggyyrfkoqrpbji`. Read-only mode covers database SQL tools; customer data stays private, so avoid querying customer tables |
| `frontend-design`                                       | Panel and HUD UI polish                                                                                                                          | Not a 3D-realism tool                                                                                                                                               |

None of the 317 official plugins or the 2,283 community-marketplace plugins targets three.js, WebGPU or astronomy (keyword scan, 8 November 2026).

### 2.2 Community skills (copy into `.claude/skills/` after review)

| Repository                       | Licence                   | Use                                                                                                                                                                                                                             |
| -------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudai-x/threejs-skills`       | MIT                       | 13 skills targeting three r186, updated 19 October 2026. The relevant ones are `threejs-performance`, `threejs-textures`, `threejs-asset-pipeline`, `threejs-shaders`, `threejs-postprocessing` and `threejs-react-three-fiber` |
| `dgreenheck/webgpu-claude-skill` | MIT (README, plugin.json) | WebGPU, TSL, compute and WGSL guidance for r183+. Load only when the WebGPU spike starts                                                                                                                                        |

Read each skill before installing it. Project rules in AGENTS.md take precedence over generic skill advice.

### 2.3 MCP servers outside the marketplace

- `chrome-devtools-mcp` and `@playwright/mcp` (both Apache-2.0) can also be added with `claude mcp add` if the plugin form is not used. Do not install both forms.
- Astronomy data: prefer `astroquery` (BSD-3) inside the existing frozen-input ingestion scripts, which keeps checksums and provenance. `SandyYuan/astro_mcp` has no licence file and suits personal exploration only. Never let an MCP query write catalogue data directly.

### 2.4 Project skills worth creating (proposal)

1. **ovu-object-intake**: the checklist for adding any object. It covers canonical identifier and aliases, frame and epoch, adopted values with uncertainty and citation, measured versus reconstruction labelling, image licence and credit, explicit host membership in `object-hosts.ts` (never inferred from distance), and the validation suites to run.
2. **ovu-asset-pipeline**: JPEG to KTX2 conversion (UASTC for hero images, ETC1S for bulk), mip generation, per-tier maximum sizes, credit-file updates, and byte and texture-memory budgets.
3. **ovu-perf-evidence**: how to capture comparable evidence. Use the explicit QA flag on loopback, matched camera, DPR and viewport, p95 frame time and `renderer.info`, and no concurrent builds. Record limits: emulation is not a physical device, and JS heap is not VRAM.

### 2.5 Guardrail settings (proposal; not added to the repository)

A committed `.claude/settings.json` could block accidental production actions. The patterns match on prefixes and can be bypassed, so the AGENTS.md approval rule still governs:

```json
{
  "permissions": {
    "deny": [
      "Bash(npx wrangler deploy*)",
      "Bash(wrangler deploy*)",
      "Bash(npx wrangler versions deploy*)",
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Read(./.dev.vars*)"
    ],
    "ask": ["Bash(git push*)", "Bash(npx wrangler*)"]
  }
}
```

## 3. Rendering libraries and techniques

| Repository / technique                                                                                                                                                | Licence                       | Role for OVU                                                                                                                                                                                                   | Notes                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mrdoob/three.js`, WebGPURenderer and TSL                                                                                                                             | MIT                           | Long-term renderer path. TSL compiles to WGSL or GLSL, and WebGPURenderer falls back to WebGL 2                                                                                                                | three.js says WebGLRenderer will get no larger new features. A migration means porting 31 `ShaderMaterial` users and the `EffectComposer`/`UnrealBloom` passes |
| Browser coverage for WebGPU                                                                                                                                           | —                             | Chrome/Edge 113+; Android Chrome 121+ (Android 12+, Qualcomm/ARM GPUs); Firefox 141 on Windows and 145 on Apple-silicon macOS Tahoe 26; Safari 26. Linux, Android Firefox and Intel Macs are still in progress | The WebGL path must keep working                                                                                                                               |
| `pmndrs/react-three-fiber`                                                                                                                                            | MIT                           | Stay on 9.x in production. A WebGPU spike can use the async `gl` factory                                                                                                                                       | v10 (WebGPU-first) is alpha                                                                                                                                    |
| `reversedDepthBuffer` (WebGLRenderer, `EXT_clip_control`)                                                                                                             | —                             | Possible replacement for the logarithmic depth buffer at astronomical scales                                                                                                                                   | Can't be combined with log depth; the option was renamed in r179; WebGPU support is unclear. Measure first                                                     |
| `KhronosGroup/KTX-Software`, `BinomialLLC/basis_universal`, `donmccurdy/glTF-Transform`                                                                               | Apache-2.0 / Apache-2.0 / MIT | Convert the 70 JPEGs to KTX2                                                                                                                                                                                   | KTX2 stays compressed in GPU memory, while JPEG, WebP and AVIF decompress fully. Needs `detectSupport(renderer)` and a self-hosted transcoder                  |
| `NASA-AMMOS/3DTilesRendererJS`                                                                                                                                        | Apache-2.0                    | Tiled terrain and imagery (XYZ/TMS/WMTS, Deep Zoom, quantized mesh; lunar and Mars examples; R3F bindings)                                                                                                     | Removes the single-texture ceiling for Moon, Mars and Earth close-ups                                                                                          |
| `takram-design-engineering/three-geospatial` (`@takram/three-atmosphere`)                                                                                             | MIT                           | Precomputed atmospheric scattering and clouds for Earth close-ups                                                                                                                                              | Check compatibility with the existing atmosphere shader before adopting                                                                                        |
| `gkjohnson/three-mesh-bvh`                                                                                                                                            | MIT                           | Fast spatial queries                                                                                                                                                                                           | Could restore cheap hover picking after the 42,541-source picker was deferred to clicks                                                                        |
| `pmndrs/postprocessing` / `@react-three/postprocessing`                                                                                                               | Zlib / MIT                    | WebGL path: merged effect passes instead of chained passes                                                                                                                                                     | WebGPU path uses three's node-based post-processing instead                                                                                                    |
| `stats-gl`, `utsuboco/r3f-perf`                                                                                                                                       | MIT                           | GPU and CPU timing panels, QA builds only                                                                                                                                                                      | Keep them out of the default build                                                                                                                             |
| `pmndrs/react-three-offscreen`                                                                                                                                        | MIT                           | Render in a worker through OffscreenCanvas to separate React UI work from the GPU loop                                                                                                                         | Spike only: DOM-dependent helpers and `Html` overlays do not run in workers                                                                                    |
| Black-hole references: `ebruneton/black_hole_shader`, `steeltroops-ai/blackhole-simulation`, rreusser's Kerr geodesics notebook (WebGPU, following James et al. 2015) | BSD-3 / MIT / page            | Techniques for replacing pre-rendered Kerr MP4s with real-time geodesic rendering                                                                                                                              | Use a spin parameter only where it has been measured; otherwise label the value as illustrative                                                                |
| Reference-only designs: Stellarium Web Engine (AGPL-3.0), Celestia (GPL-2.0), Aladin Lite (GPL-3.0), Gaia Sky (MPL-2.0), OpenSpace (MIT)                              | as listed                     | Multi-scale techniques, catalogue LOD and HiPS display                                                                                                                                                         | Do not copy copyleft code into paid OVU without legal review. OpenSpace is permissive with attribution                                                         |

## 4. Scientific data and imagery

| Domain                          | Source                                                                                                                                     | Current state (checked 8 November 2026)                                                                                                                                   | Integration note                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stars                           | Gaia DR3 (current), **Gaia DR4 on 2 December 2026**                                                                                        | DR4 covers 66 months of data, more than 140 tables and about 500 TB including epoch data. It is expected to bring the first large set of astrometric exoplanet candidates | Each release reprocesses everything, so source IDs need crossmatching. Preserve existing IDs and history; DR4 ingestion is a separate approved task after the release and its documentation |
| Solar-system positions          | JPL Horizons (already used by `test:jpl`), NAIF SPICE kernels                                                                              | —                                                                                                                                                                         | Precompute offline. **Don't ship TimeCraftJS**: its Caltech licence requires negotiated terms for commercial use. `webspice` 0.0.2 is an unofficial experimental port                       |
| Moon                            | NASA SVS CGI Moon Kit                                                                                                                      | Colour map up to a 16k TIFF; LOLA displacement at 64, 16 and 4 pixels per degree                                                                                          | SVS says the kit is tuned for appearance, not science, so label it. Use LROC/LOLA products for anything presented as measured                                                               |
| Planets and moons               | Solar System Scope (CC BY 4.0, current source); USGS Astrogeology and PDS mosaics (Galileo, Cassini, New Horizons, Dawn, MESSENGER)        | Solar System Scope notes some unmapped areas contain inferred terrain                                                                                                     | Verify each body's coverage gaps and resolution. Keep illustrative maps labelled until sourced maps replace them                                                                            |
| Galaxies, redshifts             | DESI DR1                                                                                                                                   | 18.7M redshifts: 13.1M galaxies, 1.6M quasars, 4M stars                                                                                                                   | Through Data Lab or SPARCL. A tiled point-cloud layer, not individual destinations                                                                                                          |
| Galaxy imaging                  | Euclid DR1                                                                                                                                 | Staged: DR1-Foundation in November 2026 (about 1,900 deg², images, catalogues, spectra); full DR1 expected mid-2027                                                       | Check reuse terms per product                                                                                                                                                               |
| Quasars                         | Milliquas v8 (final edition), DESI DR1                                                                                                     | 1,021,800 objects published up to 30 June 2023; DESI adds about 1.6M quasar spectra                                                                                       | Deduplicate across sources                                                                                                                                                                  |
| Black holes and compact objects | GWTC-4.0 (GWOSC), EHT images, Gaia BH1–3                                                                                                   | GWTC-4.0: 128 new O4a candidates, 218 cumulative with p_astro ≥ 0.5                                                                                                       | Gravitational-wave sky localisations are probability maps, not points                                                                                                                       |
| Exoplanets                      | NASA Exoplanet Archive TAP                                                                                                                 | 6,147 confirmed as of the archive's 12 March 2026 update; later weekly updates added more                                                                                 | Query at ingestion time and store the retrieval date. Never hard-code a total                                                                                                               |
| All-sky imagery                 | HiPS (HEALPix tiles that resolve progressively down to native pixels)                                                                      | Thousands of surveys, licensed individually                                                                                                                               | Build a HiPS tile layer in three.js rather than embedding GPL Aladin Lite. **DSS imagery prohibits commercial use without permission**                                                      |
| Telescope images                | ESA/Webb and ESA/Hubble (CC BY 4.0; no implied endorsement; logos restricted); NASA Webb/Hubble via STScI (public domain with credit); ESO | —                                                                                                                                                                         | Keep the existing `sources.json` and `CREDITS.md` pattern and finish the open source-rights review                                                                                          |
| 3D models                       | `nasa/NASA-3D-Resources`                                                                                                                   | Described as free and without copyright, subject to NASA usage guidelines                                                                                                 | Shape models are measured; surface colour often is not                                                                                                                                      |

## 5. What "a realistic copy of every observed object" can mean

- **Scale needs tiers.** Gaia DR4 alone covers billions of sources. OVU should keep three tiers:
  - Bespoke hero models, in the hundreds, sourced and labelled.
  - GPU-streamed catalogue fields with LOD, in the millions to billions.
  - An observed-imagery layer (HiPS or tiles) showing what telescopes actually recorded, at native resolution where the licence allows.
- **Depth is mostly unmeasured.** Nebula and galaxy images are 2D projections, so 3D structure is reconstruction unless spectroscopic or other studies measured it. Label it as AGENTS.md requires.
- **Resolution is limited by the source.** Upscaling, including AI upscaling, adds no observations. Avoid it, or label it.
- **Devices set the ceiling.** Mobile texture-size limits and VRAM still apply. Smoothness has to be measured per device class; no universal 60/120 FPS promise.

## 6. Suggested order of future tasks (each needs approval and measurement)

1. Owner installs the §2 tooling. The repository changes only if the owner approves committing `.claude/settings.json` or project skills.
2. Run an authenticated full-app performance trace at a fixed pose, viewport and DPR, recording frame-time distribution and `renderer.info.memory`. This also closes the pending M31 nuclear-destination acceptance.
3. Move textures to KTX2 with size tiers, checking visual parity with Playwright screenshots before and after.
4. Run a flag-gated reversed-depth experiment against the logarithmic depth buffer.
5. Upgrade planet and moon maps from primary sources; add tiled Moon and Mars close-ups with 3DTilesRendererJS.
6. Run a WebGPU/TSL spike on one isolated layer (for example a catalogue point field) with WebGL 2 fallback, then measure and decide.
7. Plan Gaia DR4 ingestion after 2 December 2026, with identifier crossmatching and no silent replacement of adopted values.
8. Research a real-time Kerr black hole to replace the pre-rendered MP4s, covering physics, licence and performance review.

## 7. Verification for this report

- Repository facts came from commands run in this checkout: git state, dependency listing, grep counts, JPEG header dimensions computed with a local script, and the credit and source files.
- Plugin names come from `anthropics/claude-plugins-official` `.claude-plugin/marketplace.json` (317 entries) and the community marketplace (2,283 entries), both cloned on 8 November 2026.
- Package versions come from `npm view <package> dist-tags` on 8 November 2026.
- Licences come from each repository's root licence file read on 8 November 2026. The exceptions are `stats-gl` (package.json) and `dgreenheck/webgpu-claude-skill` (README and plugin.json).
- Not done: no plugin installation, no builds or test suites (no code changed), no browser or device measurement, no production inspection.

## Sources

- Claude Code marketplaces: https://code.claude.com/docs/en/plugins/anthropic-marketplaces and https://github.com/anthropics/claude-plugins-official
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp; Playwright MCP: https://github.com/microsoft/playwright-mcp; Context7: https://github.com/upstash/context7
- three.js WebGPURenderer manual: https://threejs.org/manual/en/webgpurenderer
- WebGPU browser support: https://web.dev/blog/webgpu-supported-major-browsers
- R3F v10 alpha.6 notes: https://newreleases.io/project/npm/@react-three/fiber/release/10.0.0-alpha.6
- Reversed depth: https://github.com/mrdoob/three.js/pull/29445 and https://discourse.threejs.org/t/reversedepthbuffer-works-instead-of-reverseddepthbuffer/90954
- KTX2 workflow: https://github.com/KhronosGroup/KTX-Software/wiki
- 3DTilesRendererJS: https://github.com/NASA-AMMOS/3DTilesRendererJS
- Gaia DR4 date: https://www.cosmos.esa.int/web/gaia/news
- Euclid DR1 timeline: https://www.cosmos.esa.int/web/euclid/dr1-timeline
- DESI DR1: https://datalab.noirlab.edu/desi/ and https://arxiv.org/abs/2503.14745
- Milliquas v8: https://quasars.org/milliquas.htm
- GWTC-4.0: https://ligo.org/science-summaries/O4a_catalog_omnibus/
- NASA Exoplanet Archive news: https://vmexoweb2.ipac.caltech.edu/docs/exonews_archive.html
- CGI Moon Kit: https://svs.gsfc.nasa.gov/4720
- Aladin Lite (HiPS viewer, GPL-3.0): https://github.com/cds-astro/aladin-lite
- DSS copyright: https://gsss.stsci.edu/Acknowledgements/DSSCopyrights.htm
- ESA/Webb usage: https://esawebb.org/copyright
- TimeCraftJS licence: https://github.com/NASA-AMMOS/timecraftjs
- Supabase MCP options: https://github.com/supabase-community/supabase-mcp
