---
name: ovu-asset-pipeline
description: Use when adding, replacing, resizing or compressing textures and reference images in Our Visible Universe (planet and moon maps, nebula and galaxy images), or when converting JPEG textures to KTX2. Covers source and licence records, size tiers, GPU-memory budgets, the loader changes required, and before/after visual-parity checks.
---

# OVU asset pipeline

The goal is sharper imagery with less GPU memory and fewer main-thread decode stalls, without changing what is scientifically shown. Every image keeps its source, credit and licence record.

## Current state (verify before relying on it)

- Textures live in `public/textures/solar/`, `public/textures/nebulae/` and `public/textures/galaxies/`, as JPEGs with `sources.json` or `CREDITS.md` beside them.
- Planet maps are 2048×1024 and moon maps 1024×512. The deep-sky images go up to 9163×9163.
- Loaders:
  - Solar bodies: `src/stars/solar-textures.ts` (`THREE.ImageLoader`, sRGB, mipmaps, anisotropy 4).
  - Nebula volumes: `src/stars/NebulaVolume.tsx` (`createImageBitmap`).
  - Reference metadata: `src/stars/nebula-references.ts` and `src/stars/galaxy-references.ts` (`url`, `width`, `height`, `credit`, `source`).
- `src/lib/cosmos/cinematic/assets/CosmosAssetLoader.ts` sets `KTX2Loader.setTranscoderPath("/decoders/basis/")`, but **`public/decoders/` does not exist in the repository**. Before any KTX2 asset ships, self-host the transcoder by copying `node_modules/three/examples/jsm/libs/basis/*` to `public/decoders/basis/`, or confirm the default behaviour of the installed three version. Call `detectSupport(renderer)` before loading.

## Budget arithmetic

- An uncompressed RGBA8 texture with mipmaps costs about `width × height × 4 × 1.33` bytes. A 4096×4096 JPEG is about 85 MiB on the GPU, whatever its file size.
- KTX2 transcodes to a GPU-native format and stays compressed:
  - UASTC goes to BC7 or ASTC 4×4 (about 1 byte per pixel). Use it for hero images and data maps.
  - ETC1S goes to formats such as BC1 or ETC1 (about 0.5 byte per pixel). Use it for bulk colour images.
- Measured on 8 November 2026 with KTX-Software 4.4.2 (`toktx --t2 --genmipmap --assign_oetf srgb`) on `public/textures/solar/moon.jpg` (2048×1024, 1.05 MB):
  - ETC1S (`--clevel 2 --qlevel 128`): 0.34 MB file.
  - UASTC with Zstandard level 18: 2.54 MB file.
  - UASTC can therefore _increase_ download size while cutting GPU memory; choose per asset and check visual quality.
- Read `renderer.capabilities.maxTextureSize` at runtime. Plan tiers, for example 2048 for phones, 4096 for desktop, and 8192 only for selected hero close-ups. Images larger than the limit must be downscaled or tiled; for planetary close-ups, tiled imagery through NASA-AMMOS 3DTilesRendererJS is preferred.

## Converting an image

1. Start from the original archive file (TIFF/PNG/JPEG), never from an already-compressed derivative. Record its URL in `sources.json` or `CREDITS.md`.
2. Encode with the installed KTX-Software tools (`ktx create` in recent releases, or `toktx`). Check `--help` for the exact flags of that version:
   - Colour maps: sRGB transfer function, mipmaps generated, Zstandard supercompression.
   - Normal, height or displacement maps: linear, UASTC only.
3. glTF models instead go through `npx @gltf-transform/cli` (`inspect`, then `optimize --texture-compress ktx2`).
4. Change the loader for that asset class (`KTX2Loader` instead of `ImageLoader` or `createImageBitmap`) and keep a JPEG fallback for devices without a supported transcode target.
5. Update the credit record: resizing, compression and colour changes must be noted. CC BY sources require this.

## Science and licensing rules

- Compression and resizing are not new data. Do not upscale, AI-enhance or "repair" observed imagery. If an illustrative map is used, label it.
- Keep labels for inferred or unmapped regions (the Solar System Scope maps contain some inferred terrain; several moons have only partial coverage).
- Licences:
  - ESA/Hubble and ESA/Webb: CC BY 4.0, no endorsement, no logos.
  - NASA/STScI: public domain with credit.
  - ESO and Solar System Scope: CC BY 4.0.
  - DSS: no commercial use without permission.
  - NASA SVS CGI Moon Kit: optimised for appearance, not science, so label it.

## Verification

- Take Playwright screenshots at the same pose, viewport and DPR before and after. Compare them, and attach paths or results to the report.
- Record `renderer.info.memory.textures` and the downloaded bytes before and after (see `ovu-perf-evidence`).
- `npm run build:cloudflare` must pass. Do not commit unused originals into `public/`, which ships to every visitor.
- Update the report and `docs/PROJECT_HANDOFF.md`. No deployment without the owner's explicit approval.
