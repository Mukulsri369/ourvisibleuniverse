# Claude Code project setup for OVU

This folder makes the same Claude Code tooling available on any machine or cloud session that opens this repository. It is development tooling only: nothing here is bundled into the site or deployed.

## What is configured

**Plugins** (`settings.json` → `enabledPlugins`, from the official `claude-plugins-official` marketplace). Claude Code offers to install them when you trust this folder.

| Plugin                | Purpose                                                                                             | Needs on the machine                              |
| --------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `chrome-devtools-mcp` | Performance traces, console, network, memory in a live Chrome (pinned `chrome-devtools-mcp@1.11.0`) | Node 20.19+ and Chrome                            |
| `playwright`          | Scripted screenshots and browser interaction (`@playwright/mcp`)                                    | Node; Playwright downloads a browser on first use |
| `context7`            | Current library documentation (hosted HTTP MCP, anonymous by default)                               | Internet access                                   |
| `typescript-lsp`      | Code navigation and diagnostics                                                                     | `npm i -g typescript typescript-language-server`  |
| `skill-creator`       | Creating and improving project skills                                                               | —                                                 |
| `code-review`         | On-demand review of a diff or PR                                                                    | —                                                 |

Deliberately not enabled:

- `cloudflare`: its bundled MCP server (`mcp.cloudflare.com`) can act on the Cloudflare account, which conflicts with the no-production-change rule.
- `supabase`: needs a personal access token and reaches the production database. If you ever need it, add it per-user with `--read-only --project-ref=…`.
- `security-guidance`: runs hooks and an LLM review on every turn.
- `pr-review-toolkit`: about 1,600 always-on tokens, overlapping `code-review`.
- `modern-web-guidance`: mostly unrelated to WebGL.
- `frontend-design`: UI restyling conflicts with preserving the existing visuals.

**Guardrails** (`settings.json` → `permissions`): Claude may not deploy with Wrangler or force-push, and must ask before any `git push` or other Wrangler command. These rules match on command patterns and can be bypassed, so the approval rules in `AGENTS.md` still govern.

**Skills** (`skills/`, loaded automatically):

| Skill                                                                                                                                                                                                       | Source                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ovu-object-intake`, `ovu-asset-pipeline`, `ovu-perf-evidence`                                                                                                                                              | Written for this repository                                                                                                                                                                                                                                                        |
| `threejs-performance`, `threejs-textures`, `threejs-asset-pipeline`, `threejs-shaders`, `threejs-postprocessing`, `threejs-react-three-fiber`, `threejs-interaction`, `threejs-loaders`, `threejs-geometry` | Copied unchanged from `cloudai-x/threejs-skills` at `0e181866f095b5f06d005133876e926515390d95` (MIT, `LICENSE.txt` in each folder)                                                                                                                                                 |
| `webgpu-threejs-tsl`                                                                                                                                                                                        | Copied unchanged from `dgreenheck/webgpu-claude-skill` at `af2319bd01bb7cc881267a9ef42cafdaf5e9029d` (MIT as declared upstream; see its `LICENSE.txt`)                                                                                                                             |
| `ovu-galaxy-realism`                                                                                                                                                                                        | Written for this repository (9 November 2026): galaxy look-dev loop, appearance physics with citations, rendering recipes mapped to the volume renderer                                                                                                                            |
| `shader-art-coding`                                                                                                                                                                                         | Copied unchanged from `gokayfem/shader-skills` at `a56e7738d3f22698e795f036b4919f0734ab621d` (MIT; `LICENSE.txt` and the upstream `CREDITS.md` are in the folder). Use its GLSL functions (noise, fBm, domain warp, volume, colour, tone maps), not its Shadertoy-only conventions |

`shader-art-coding` is written for Shadertoy (`mainImage`, no custom uniforms). OVU shaders are three.js `ShaderMaterial`s, so port only its library functions, rename them to avoid clashes with `galaxy-medium.ts` (`noise`, `cloud`, `ball`), and keep its credit comments; `ovu-galaxy-realism` gives the porting rules. Its `scripts/glsl_tools.py` is optional and was not run in the cloud session (blocked as downloaded code); review it before running locally.

The vendored three.js skills target three r186 and the WebGPU skill targets r183+, while this repository uses `three` ^0.184. Check version-specific advice against `node_modules/three` before relying on it. Project rules in `AGENTS.md` and the `ovu-*` skills take precedence over generic advice. To update a vendored skill, re-copy it from upstream at a new commit, review the diff, and update the commit hash here.

## Optional machine tools (not npm dependencies of the site)

| Tool                          | Used for                                                                                                                        | Install                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Playwright module             | The repository's browser scripts (`scripts/nearby-qa/browser-tools.mjs`, which launches system Chrome with `channel: "chrome"`) | `npm i playwright` in a folder outside the repository, then set `OVU_PLAYWRIGHT_MODULE=<folder>/node_modules/playwright/index.mjs` |
| KTX-Software (`ktx`, `toktx`) | KTX2 texture encoding (see `ovu-asset-pipeline`)                                                                                | Release installer or archive from https://github.com/KhronosGroup/KTX-Software/releases (4.4.2 verified)                           |
| `glslangValidator` (glslang)  | Offline GLSL compile checks for shader edits (used by `shader-art-coding`)                                                      | Ubuntu/Debian `apt-get install glslang-tools` (15.1.0 verified); Windows: the Vulkan SDK or a glslang release archive              |
| glTF-Transform CLI            | glTF inspection and optimisation                                                                                                | `npm i -g @gltf-transform/cli`                                                                                                     |
| TypeScript language server    | The `typescript-lsp` plugin                                                                                                     | `npm i -g typescript typescript-language-server`                                                                                   |

`npm ci` currently fails because `package-lock.json` is out of sync with `package.json` (missing `@emnapi/*` entries). Use `npm install` until the lockfile is regenerated in a dedicated, reviewed change.

The normal build (`npm run build:cloudflare`) deliberately refuses to run without the approved public Supabase build configuration (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`), which is kept outside Git. Never put a server or secret key in it. The isolated QA harness (`scripts/nearby-qa/vite.config.mts`, port 31755) does not need it.

## Browser-pane QA server

`launch.json` lets the Claude desktop app's Browser pane start the loopback QA server (`ovu-qa`, port 31755, `scripts/nearby-qa/vite.config.mts`). It serves the isolated QA pages only, never the authenticated app.

## Galaxy look-dev harness

`scripts/galaxy-lookdev/` renders one production galaxy volume at a fixed, north-up camera and writes it next to its registered telescope image with appearance indicators (`capture.mjs`). It is QA tooling on the loopback server only; see the `ovu-galaxy-realism` skill.

## Plugins reviewed for galaxy realism (9 November 2026)

The official marketplace (317 plugins) still has no three.js, shader or astronomy plugin, so no plugin was added. Closest candidates and why they were not enabled:

- `playground`: generic HTML parameter explorers; the look-dev page covers this.
- `frontend-design`, `superdesign`, `canva`, `adobe-for-creativity`: 2D UI and image tools, not real-time 3D.
- `unity` and `unreal-engine-skills-for-claude-code`: other engines.

Community skills reviewed and not vendored:

- `iart-ai/webgl-animation-skills` (MIT): overlaps the existing `threejs-*` skills.
- `viettranx/3dviz-pro-max` (MIT): 159 MB, and its astronomy material covers orbits and eclipses, not galaxy appearance.
- `beltoforion/Galaxy-Renderer-Typescript`: `package.json` says MIT but there is no licence file. Use it as a technique reference only.

## First run on a new machine

1. Open the repository in Claude Code and accept the trust prompt and plugin installation. Or run `claude plugin install <name>@claude-plugins-official --scope project` for each plugin listed above.
2. Run `/plugin` to confirm the six plugins are enabled, `/mcp` to confirm `chrome-devtools`, `playwright` and `context7` connect, and `/skills` to see the skills.
3. For TypeScript code intelligence: `npm i -g typescript typescript-language-server`.
