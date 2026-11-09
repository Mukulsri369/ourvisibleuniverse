# Galaxy realism: tooling installed and baseline audit (2026-11-09)

Status: development tooling and documentation only. No runtime source, shader, catalogue, texture, dependency, Supabase, Cloudflare, payment or customer change. Nothing deployed.

## Request

The owner asked which skills and plugins are needed to make the 3D galaxy and planet models look realistic, and to install them. Planets are acceptable; galaxies "are not even close to looking realistic".

## Finding: the gap is domain knowledge and a feedback loop, not a plugin

- **Already installed** (8 November): six official plugins and thirteen skills. Generic three.js shader, post-processing, performance and texture knowledge was covered. See [`.claude/README.md`](../.claude/README.md).
- **Marketplace re-scan:** the official marketplace (317 plugins, cloned 9 November) still has no three.js, shader or astronomy plugin. No plugin was added. The reasons for each near-miss are in `.claude/README.md`.
- **What was missing:**
  1. A way to see a galaxy render beside its telescope image, at the same orientation, with numbers to track change.
  2. Astrophysical appearance knowledge: what makes a disk, bulge, arm, dust lane or HII region look real.
  3. Structured GLSL noise, volume and display-transform building blocks to replace the current white-noise structure.

## Installed

| Item                                                                   | Type                              | Purpose                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/ovu-galaxy-realism/`                                   | Project skill (new)               | Look-dev loop; appearance physics with literature citations; rendering recipes mapped to `galaxy-medium.ts`, `galaxy-volume-shader.ts`, `GalaxyRadiance.tsx` and `galaxy-star-data.ts`, with cost notes; morphology checklist; tests                                                                                                                  |
| `.claude/skills/shader-art-coding/`                                    | Vendored skill                    | `gokayfem/shader-skills` at `a56e7738d3f22698e795f036b4919f0734ab621d`, MIT, copied unchanged with `LICENSE.txt` and upstream `CREDITS.md`. Provides GLSL gradient/simplex noise, fBm, billow, turbulence, curl noise, volume integration, AgX/Neutral tone maps and Oklab. Original implementations credited to published sources; no Shadertoy code |
| `scripts/galaxy-lookdev/` (`index.html`, `lookdev.tsx`, `capture.mjs`) | QA harness (new)                  | Renders one production `GalaxyRadiance` volume at a repeatable north-up Earth, face-on or edge-on pose. Captures a sheet beside the AVM-rotated registered image and writes six rotation-invariant appearance indicators                                                                                                                              |
| `glslangValidator` 15.1.0                                              | Machine tool (cloud session only) | Offline GLSL compile checks. Install steps are in `.claude/README.md`                                                                                                                                                                                                                                                                                 |

Vetting:

- The vendored skill was scanned for network calls, shell pipes, credential handling and agent-directed instructions; none were found.
- Its optional `scripts/glsl_tools.py` only shells out to a local `glslangValidator`. It was not executed here, because the session's safety policy blocks running downloaded code. Review it before running it locally.
- Rejected candidates:
  - `iart-ai/webgl-animation-skills`: overlaps the existing three.js skills.
  - `viettranx/3dviz-pro-max`: 159 MB, and its astronomy material is not about galaxies.
  - `beltoforion/Galaxy-Renderer-Typescript`: no licence file; technique reference only.

## Baseline audit

Method:

- The loopback QA server ran the look-dev page in headless Chromium with SwiftShader at a 900×900 viewport, DPR 1 and the default `balanced` tier, with no optics pipeline.
- Each capture waited for the density cache (`uCacheFade` > 0.97), then 2.5 s.
- The camera looked from the Solar System's direction with celestial north up.
- The reference is each galaxy's registered image, rotated by its AVM `rotation`.
- These are appearance observations only: no performance claim, and no full-app, authenticated or physical-device check.

Indicators are shown as render / registered image. They were computed with the final definitions in `capture.mjs`, on 600-px render crops, through `--recompute`.

| Galaxy             | saturation    | colourGradient | darkLaneFraction | pinkFraction  | concentration | fineStructure |
| ------------------ | ------------- | -------------- | ---------------- | ------------- | ------------- | ------------- |
| `m51`              | 0.034 / 0.212 | 1.021 / 1.259  | 0.000 / 0.019    | 0.000 / 0.043 | 2.403 / 2.991 | 0.108 / 0.089 |
| `m81`              | 0.020 / 0.230 | 1.032 / 0.808  | 0.000 / 0.000    | 0.000 / 0.015 | 2.804 / 2.612 | 0.067 / 0.034 |
| `m104`             | 0.027 / 0.109 | 1.008 / 0.933  | 0.000 / 0.026    | 0.000 / 0.000 | 2.240 / 2.304 | 0.028 / 0.043 |
| `catalog-ngc-1300` | 0.034 / 0.226 | 1.044 / 1.438  | 0.000 / 0.010    | 0.000 / 0.008 | 2.591 / 2.656 | 0.079 / 0.076 |
| `m33`              | 0.025 / 0.167 | 1.016 / 1.119  | 0.000 / 0.002    | 0.000 / 0.065 | 2.478 / 2.726 | 0.093 / 0.129 |
| `m101`             | 0.028 / 0.165 | 1.020 / 1.198  | 0.000 / 0.049    | 0.000 / 0.004 | 2.182 / 2.733 | 0.175 / 0.131 |

How to read the indicators:

- **Discriminating:** saturation (renders are 4–12× greyer), `darkLaneFraction` (0 in every render) and `pinkFraction` (0 in every render).
- **`colourGradient`:** about 1.0 in every render, meaning there is no colour structure. The M81 and M104 references fall below 1 because their large yellow bulges fill the outer measurement annulus, while the saturated core reads white.
- **Not discriminating in this baseline:** `concentration` and `fineStructure`. They depend on crop, foreground stars and single-pixel grain, so read them only as before/after changes of the same render.

Sheets and per-galaxy JSON: [`galaxy-lookdev-baseline-20261109/`](galaxy-lookdev-baseline-20261109/). Each sheet places the render beside the registered image rotated north-up. Image credits are in `public/textures/galaxies/CREDITS.md` and `docs/galaxy-rendering.md`.

Observations:

- Renders are close to greyscale, with no yellow core against a blue disk.
- Arms are uniform-width, evenly bright tubes with a cloudy inter-arm haze.
- Bulges are small and faint.
- No dust lanes or HII knots are visible.
- M104's dust ring renders as a light grey band, not the dark brown silhouette against the bulge.
- M33 (flocculent, rich in HII regions) renders as a clean two-arm spiral.
- NGC 1300's bar is faint, with no dust lanes along it.
- The arm winding sense against the telescope images was not verified.
- The registered image layer already shows the real photograph from the Solar System's side for these 12 galaxies. The reconstruction is what visitors see off-axis, close up, on entry, and for every other model.

## Limitations

- The indicators compare frames with different crops, companions, foreground stars and stretches. They show the direction of change, not pass/fail values.
- Indicators depend on capture size. The table uses 600-px crops; a fresh 900-px capture of M51 with the final script gave saturation 0.041, concentration 1.92, `darkLaneFraction` 0.005 and `pinkFraction` 0.008. Compare future captures with captures of the same size.
- SwiftShader is a software WebGL implementation. Its precision and half-float filtering can differ from a GPU's, so confirm visual conclusions on a real GPU.
- The skill's causes for the grey look are partly hypotheses, and are marked as such in it.

## Next concrete action

Owner approval is needed for a runtime change. The order is in `ovu-galaxy-realism`, "Suggested order of work":

1. Structured noise.
2. Arm anatomy.
3. Bulge and disk profiles with separated colours.
4. Dust geometry and extinction colour.
5. The asinh exterior display transform.
6. HII and cluster point classes.

Each step comes with before and after look-dev sheets, the morphology checklist, the galaxy suites and a performance comparison on a real GPU.
