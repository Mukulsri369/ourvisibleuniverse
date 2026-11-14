# Nebula realism, interiors and faster entry — 14 November 2026

## Request

The owner reported that every nebula looked blurry and unrealistic when zoomed, that the interior view did not feel like being inside a real nebula, and that the "Enter in nebula" flight took too long.

## Causes found

- **Blur:** each nebula is baked once into a 128³ voxel grid (160³ on scientific_high), and the ray-marcher only read that grid. Close up, one voxel covers about 19 px and one ray step about 38 px of depth. The structure functions are smooth Gaussians, so nothing finer than a voxel could appear.
- **Haze and low contrast:** gas absorbed as strongly as it emitted (0.8 vs 0.8), so overlapping layers turned into opaque pastel fog. Dust was nearly black and translucent.
- **Dark interiors:** radiance was multiplied by 0.28 near the centre. H II models had no gas in the cluster's ionised volume, so the Orion and M16 end poses saw almost nothing.

## Changes (rendering only; no catalogue values, shapes or routes changed)

| Change                                                                                                                                                                                                                                    | File                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Sub-voxel detail: three zero-mean octaves (smoothed lattice lookups), each faded out once it is smaller than a pixel or 15% of the ray step. This avoids shimmer and depth aliasing.                                                      | `nebula-volume-shader.ts`                     |
| Erosion that carves thin outer gas most. Dust gets a noise-displaced level set, giving opaque bodies with hard silhouettes.                                                                                                               | `nebula-volume-shader.ts`                     |
| Adaptive stepping: long strides through empty space, short strides inside cloud material (step cap 1.25× `uSteps`).                                                                                                                       | `nebula-volume-shader.ts`                     |
| Emission/absorption split: ionised gas emits (0.8) but absorbs little (0.2). Gas emission scales with density (clamped ×0.3–×3), since recombination emissivity ∝ n². Dust extinction rises from 1.8 to 4.5, and star extinction matches. | `nebula-volume-shader.ts`, `NebulaStars.tsx`  |
| One shadow probe toward the illuminating cluster. Lit faces brighten and the shadowed side of dust darkens. A thin ionisation-front skin is added on lit dust (pillar rims, the Orion Bar).                                               | `nebula-volume-shader.ts`                     |
| Faint dust scattering of cluster light. Dark clouds are excluded.                                                                                                                                                                         | `nebula-radiance.ts`                          |
| Faint, turbulent ionised gas filling the volume around the cluster in H II regions (Strömgren volume). Without it, an interior view looks empty.                                                                                          | `nebula-medium.ts`                            |
| Interior dimming 0.28 → 0.85. Premultiplied output so emission adds light where gas barely occludes. ×1.18 saturation lift against layer averaging.                                                                                       | `nebula-volume-shader.ts`, `NebulaVolume.tsx` |
| Entry flight 48 s → 16 s (reduced motion 64 → 24 s). Return stays 4 s.                                                                                                                                                                    | `nebula-journey.ts`                           |

## Evidence

- Same-pose headless Edge captures on the AMD iGPU (1280×800, production optics). "Before" comes from a pinned control server (`ovu-nebula-control`, port 31758, `scripts/nearby-qa/nebula-control-config.mts`) serving the committed nebula files. Sheets: [nebula-lookdev-20261114/](nebula-lookdev-20261114/) (`front-a…d` all 22 volumes, `close`, `inside`).
- New QA page: `scripts/nearby-qa/nebula-views.html?n=<id>&v=front|close|inside` (inside reproduces the journey end state). Driver: `scripts/nearby-qa/nebula-capture.mjs` (`OVU_PERF=1` for frame times).
- All 22 volumes rendered with no shader or console errors.
- Frame times (mean over 8 s, vsync, same machine; before → after):

| Pose          | Before  | After   |
| ------------- | ------- | ------- |
| M16 close     | 24.0 ms | 33.8 ms |
| M42 interior  | 37.5 ms | 42.7 ms |
| M42 front     | 23.5 ms | 27.6 ms |
| Rosette close | 26.3 ms | 39.7 ms |
| M16 interior  | 30.9 ms | 38.8 ms |

This is a **1.15–1.5× higher GPU cost** on this integrated GPU. A first version cost 2.5–3.3×; it was cut back by reducing fetches and the step cap.

## Not established / limits

- Close-ups are crisper and more sculpted, but not photograph-sharp. The morphology is still a 128–160³ reconstruction of smooth shapes, and detail is procedural (illustrative, not observed).
- Barnard 68 is now almost fully black in the isolated view (opaque dust, no illuminator). Check it against the star field in the full scene.
- Not checked: the signed-in full app, the flight in motion (only the end-state poses), other GPUs, and phones.
