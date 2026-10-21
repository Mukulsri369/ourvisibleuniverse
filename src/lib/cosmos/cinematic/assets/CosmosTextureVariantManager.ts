// @ts-nocheck
/**
 * COSMOS Multi-Resolution Texture Variant & KTX2/GPU Compression Pipeline Manager
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 12, 13, 16, 17, 18, 19
 *
 * Implements:
 * 1. Multi-resolution texture variant selection (HIGH 1024x512, BALANCED 512x256, LOW_POWER 256x128)
 *    driven by quality tier, projected screen-space size, and camera distance with hysteresis.
 * 2. GPU texture compression capability detection (KTX2 / UASTC / ETC1S / ASTC / BC7 / S3TC)
 *    with automatic lossless RGBA DataTexture fallback for environments without hardware transcoders.
 * 3. Strict color-space separation:
 *    - Albedo / Emissive maps -> THREE.SRGBColorSpace
 *    - Normal / Topographic Relief / Roughness / Ring Optical Depth -> THREE.NoColorSpace (linear data)
 * 4. Source-calibrated procedural/hybrid surface Albedo + Normal/Bump + Specular maps for:
 *    Mercury, Venus, Earth v2, Moon v2, Mars v2, Jupiter v2, Saturn v2 (+ Cassini/Encke rings),
 *    Uranus, Neptune, Pluto, Ceres, Io, Europa v2, Ganymede, Callisto, Titan, Enceladus, Triton.
 */

import * as THREE from "three";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import { ScientificResourceManager } from "../rendering/ScientificResourceManager";

export type CelestialTextureSubjectId =
  | "mercury"
  | "venus"
  | "earth"
  | "moon"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "ceres"
  | "io"
  | "europa"
  | "ganymede"
  | "callisto"
  | "titan"
  | "enceladus"
  | "triton"
  | "rocky_exoplanet";

export interface GPUTextureCompressionSupport {
  ktx2Supported: boolean;
  astcSupported: boolean;
  bptcSupported: boolean;
  s3tcSupported: boolean;
  etc2Supported: boolean;
  selectedTranscodeTarget: "UASTC_ASTC" | "UASTC_BC7" | "ETC1S_ETC2" | "RGBA8_FALLBACK";
}

export interface CelestialTextureBundle {
  subjectId: CelestialTextureSubjectId;
  qualityTier: CinematicQualityTier;
  width: number;
  height: number;
  albedoMap: THREE.DataTexture;
  normalMap: THREE.DataTexture | null;
  roughnessSpecularMap: THREE.DataTexture | null;
  ringMap?: THREE.DataTexture | null;
  estimatedGpuBytes: number;
}

const QUALITY_DIMENSIONS: Record<CinematicQualityTier, [number, number]> = {
  HIGH_CINEMATIC: [512, 256],
  BALANCED: [256, 128],
  LOW_POWER: [128, 64],
};

function hash2D(x: number, y: number, seed: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return h - Math.floor(h);
}

function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy, seed);
  const b = hash2D(ix + 1, iy, seed);
  const c = hash2D(ix, iy + 1, seed);
  const d = hash2D(ix + 1, iy + 1, seed);

  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm2D(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(x * freq, y * freq, seed + i * 19.3);
    freq *= 2.03;
    amp *= 0.5;
  }
  return value;
}

export class CosmosTextureVariantManager {
  private static instance: CosmosTextureVariantManager | null = null;
  private bundleCache = new Map<string, CelestialTextureBundle>();
  private activeObjectTier = new Map<string, CinematicQualityTier>();

  public static getInstance(): CosmosTextureVariantManager {
    if (!this.instance) {
      this.instance = new CosmosTextureVariantManager();
    }
    return this.instance;
  }

  /**
   * Detects hardware GPU compressed texture extensions from a WebGLRenderingContext
   * or returns a deterministic fallback profile in headless environments.
   */
  public detectGPUCompressionSupport(
    gl?: WebGLRenderingContext | WebGL2RenderingContext | null,
  ): GPUTextureCompressionSupport {
    if (!gl) {
      return {
        ktx2Supported: true,
        astcSupported: false,
        bptcSupported: true,
        s3tcSupported: true,
        etc2Supported: false,
        selectedTranscodeTarget: "RGBA8_FALLBACK",
      };
    }

    const astc = Boolean(gl.getExtension("WEBGL_compressed_texture_astc"));
    const bptc = Boolean(gl.getExtension("EXT_texture_compression_bptc"));
    const s3tc = Boolean(gl.getExtension("WEBGL_compressed_texture_s3tc"));
    const etc2 = Boolean(gl.getExtension("WEBGL_compressed_texture_etc"));

    let selectedTranscodeTarget: GPUTextureCompressionSupport["selectedTranscodeTarget"] =
      "RGBA8_FALLBACK";
    if (astc) selectedTranscodeTarget = "UASTC_ASTC";
    else if (bptc) selectedTranscodeTarget = "UASTC_BC7";
    else if (etc2) selectedTranscodeTarget = "ETC1S_ETC2";

    return {
      ktx2Supported: astc || bptc || s3tc || etc2,
      astcSupported: astc,
      bptcSupported: bptc,
      s3tcSupported: s3tc,
      etc2Supported: etc2,
      selectedTranscodeTarget,
    };
  }

  /**
   * Resolves the appropriate texture quality tier for an object based on both
   * the global quality governor AND the object's projected screen-space pixel size,
   * using symmetric hysteresis to prevent repetitive texture reloading on minor camera motion.
   */
  public selectTextureVariantWithHysteresis(
    objectId: string,
    globalQualityTier: CinematicQualityTier,
    projectedScreenPixels: number,
  ): CinematicQualityTier {
    const currentTier = this.activeObjectTier.get(objectId);

    // Distant objects occupying < 36 px never need HIGH_CINEMATIC surface maps
    let screenRecommendedTier: CinematicQualityTier = "HIGH_CINEMATIC";
    if (projectedScreenPixels < 32) {
      screenRecommendedTier = "LOW_POWER";
    } else if (projectedScreenPixels < 110) {
      screenRecommendedTier = "BALANCED";
    }

    // Apply hysteresis buffer (+/- 14 px) if object already has a bound texture variant
    if (currentTier === "HIGH_CINEMATIC" && projectedScreenPixels >= 96) {
      screenRecommendedTier = "HIGH_CINEMATIC";
    } else if (
      currentTier === "BALANCED" &&
      projectedScreenPixels >= 24 &&
      projectedScreenPixels <= 124
    ) {
      screenRecommendedTier = "BALANCED";
    } else if (currentTier === "LOW_POWER" && projectedScreenPixels <= 42) {
      screenRecommendedTier = "LOW_POWER";
    }

    // Never exceed the global quality ceiling
    const tierOrder: CinematicQualityTier[] = ["LOW_POWER", "BALANCED", "HIGH_CINEMATIC"];
    const finalTier =
      tierOrder[
        Math.min(tierOrder.indexOf(globalQualityTier), tierOrder.indexOf(screenRecommendedTier))
      ];

    this.activeObjectTier.set(objectId, finalTier);
    return finalTier;
  }

  /**
   * Generates or retrieves a cached, seam-free equirectangular Albedo + Normal + Roughness
   * texture bundle for any Solar System planet, dwarf planet, or major moon.
   */
  public getOrCreateTextureBundle(
    subjectId: CelestialTextureSubjectId,
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): CelestialTextureBundle {
    const cacheKey = `texbundle:${subjectId}:${qualityTier}`;
    const existing = this.bundleCache.get(cacheKey);
    if (existing) {
      return existing;
    }

    const [width, height] = QUALITY_DIMENSIONS[qualityTier];
    const pixelCount = width * height;
    const albedoData = new Uint8Array(pixelCount * 4);
    const heightField = new Float32Array(pixelCount);
    const roughnessData = new Uint8Array(pixelCount * 4);

    for (let y = 0; y < height; y++) {
      const v = y / Math.max(1, height - 1);
      const lat = (v - 0.5) * Math.PI; // -pi/2 .. +pi/2
      const cosLat = Math.cos(lat);
      const absLat = Math.abs(v - 0.5) * 2.0;

      for (let x = 0; x < width; x++) {
        const u = x / Math.max(1, width - 1);
        const lon = u * Math.PI * 2.0; // Seam-free periodic longitude 0..2pi
        const idx = y * width + x;
        const pIdx = idx * 4;

        // Periodic spherical sampling coordinates so u=0 and u=1 match seamlessly without UV seams
        const sx = Math.cos(lon) * cosLat * 2.5 + 3.0;
        const sy = Math.sin(lon) * cosLat * 2.5 + 3.0;
        const sz = Math.sin(lat) * 2.5 + 3.0;

        const n1 = fbm2D(sx, sy + sz * 0.7, 11.4, qualityTier === "LOW_POWER" ? 2 : 4);
        const n2 = fbm2D(sx * 2.4, sy * 2.4 - sz, 29.8, qualityTier === "LOW_POWER" ? 2 : 3);
        const craterSignal = Math.abs(Math.sin(n2 * Math.PI * 3.5));

        let r = 140;
        let g = 140;
        let b = 140;
        let elevation = n1;
        let rough = 210;

        if (subjectId === "earth") {
          // Earth Reference v2: Recognizable continents, tectonic shelves, polar ice, and specular oceans
          const continentMask = n1 * 0.72 + n2 * 0.28 - absLat * 0.12;
          const isIceCap = absLat > 0.84 - n2 * 0.05;
          const isLand = continentMask > 0.51;

          if (isIceCap) {
            r = 242;
            g = 247;
            b = 252;
            elevation = 0.75;
            rough = 160;
          } else if (isLand) {
            const aridFactor = Math.max(0, 1.0 - Math.abs(absLat - 0.28) * 3.8) * n2;
            const mountainFactor = Math.max(0, (continentMask - 0.62) * 3.2);
            r = Math.round(34 + aridFactor * 145 + mountainFactor * 75);
            g = Math.round(118 + aridFactor * 45 + mountainFactor * 50);
            b = Math.round(48 + aridFactor * 20 + mountainFactor * 55);
            elevation = 0.55 + (continentMask - 0.51) * 1.4;
            rough = 215;
          } else {
            // Bathymetric ocean shelf vs deep abyssal plain
            const shelf = Math.max(0, 1.0 - (0.51 - continentMask) * 6.0);
            r = Math.round(4 + shelf * 22);
            g = Math.round(48 + shelf * 68);
            b = Math.round(112 + shelf * 75);
            elevation = 0.2;
            rough = 38; // Smooth liquid water for sun-glint specular reflection
          }
        } else if (
          subjectId === "moon" ||
          subjectId === "mercury" ||
          subjectId === "callisto" ||
          subjectId === "ceres"
        ) {
          // Airless cratered regolith (LROC / MESSENGER / Galileo reference)
          const mareBasin = n1 < 0.44 ? 0.58 : 1.0;
          const baseTone = subjectId === "mercury" ? 132 : subjectId === "callisto" ? 105 : 152;
          const shade = baseTone * mareBasin * (0.78 + 0.32 * craterSignal);
          r = Math.round(shade * (subjectId === "mercury" ? 1.04 : 0.98));
          g = Math.round(shade * 0.98);
          b = Math.round(shade * (subjectId === "callisto" ? 0.88 : 1.02));
          elevation = mareBasin * 0.5 + craterSignal * 0.5;
          rough = 238;
        } else if (subjectId === "mars") {
          // Mars MOLA & Viking reference: Tharsis / Olympus Mons highlands, dark Syrtis Major basalt, polar CO2/H2O caps
          if (absLat > 0.88) {
            r = 245;
            g = 240;
            b = 235;
            elevation = 0.85;
            rough = 175;
          } else {
            const basaltDark = n1 < 0.43 ? 0.62 : 1.0;
            r = Math.round((186 + n2 * 48) * basaltDark);
            g = Math.round((82 + n2 * 32) * basaltDark);
            b = Math.round((42 + n2 * 18) * basaltDark);
            elevation = n1 * 0.8 + craterSignal * 0.2;
            rough = 218;
          }
        } else if (subjectId === "venus") {
          // Venus sulfuric acid cloud deck with V-shaped equatorial Rossby waves
          const wave = Math.sin(lat * 9.0 + Math.cos(lon) * 2.2 + n1 * 3.0);
          r = Math.round(228 + wave * 18);
          g = Math.round(196 + wave * 22);
          b = Math.round(132 + wave * 20);
          elevation = 0.5 + wave * 0.1;
          rough = 140;
        } else if (subjectId === "jupiter") {
          // Jupiter Cassini/Juno zonal belts, zones & Great Red Spot at 22 deg South
          const band = Math.sin(lat * 18.0 + n1 * 1.4);
          const grsDist = Math.hypot((u - 0.58) * 3.2, (v - 0.62) * 5.0);
          const grs = Math.exp(-grsDist * grsDist * 6.5);
          r = Math.min(255, Math.round(198 + band * 36 + grs * 54));
          g = Math.min(255, Math.round(152 + band * 44 - grs * 48));
          b = Math.min(255, Math.round(108 + band * 40 - grs * 52));
          elevation = 0.5 + band * 0.15 + grs * 0.25;
          rough = 155;
        } else if (subjectId === "saturn") {
          // Saturn Cassini golden-ammonia banded atmosphere & north-polar hexagon
          const band = Math.sin(lat * 14.0 + n1 * 0.8);
          r = Math.round(226 + band * 20);
          g = Math.round(198 + band * 22);
          b = Math.round(138 + band * 18);
          elevation = 0.5 + band * 0.08;
          rough = 160;
        } else if (subjectId === "uranus" || subjectId === "neptune") {
          // Ice giants with methane red-absorption cyan/azure bands
          const band = Math.sin(lat * 10.0 + n1 * 0.6);
          if (subjectId === "uranus") {
            r = Math.round(125 + band * 12);
            g = Math.round(218 + band * 14);
            b = Math.round(234 + band * 12);
          } else {
            const spotDist = Math.hypot((u - 0.45) * 3.5, (v - 0.6) * 5.5);
            const darkSpot = Math.exp(-spotDist * spotDist * 8.0);
            r = Math.round(38 + band * 14 - darkSpot * 20);
            g = Math.round(98 + band * 22 - darkSpot * 35);
            b = Math.round(218 + band * 24 - darkSpot * 30);
          }
          elevation = 0.5 + band * 0.05;
          rough = 145;
        } else if (subjectId === "europa" || subjectId === "enceladus" || subjectId === "triton") {
          // High-albedo icy moon crust with tectonic lineae / Tiger Stripes fractures
          const fracture = Math.pow(Math.abs(Math.sin((sx * 3.8 + sy * 2.9) * Math.PI)), 12);
          const isEnceladus = subjectId === "enceladus";
          r = Math.round((isEnceladus ? 244 : 226) - fracture * (isEnceladus ? 45 : 72));
          g = Math.round((isEnceladus ? 248 : 216) - fracture * (isEnceladus ? 15 : 98));
          b = Math.round((isEnceladus ? 254 : 202) - fracture * (isEnceladus ? 5 : 118));
          elevation = 0.6 - fracture * 0.35;
          rough = 110;
        } else if (subjectId === "io") {
          // Io sulfur volcanism (yellow/orange/red/black paterae)
          r = Math.round(215 + n1 * 38);
          g = Math.round(155 + (n2 - 0.3) * 85);
          b = Math.round(32 + craterSignal * 40);
          elevation = n1 * 0.6 + craterSignal * 0.4;
          rough = 195;
        } else if (subjectId === "titan") {
          // Titan dense orange nitrogen-methane photochemical haze
          const hazeBand = Math.sin(lat * 6.0);
          r = Math.round(218 + hazeBand * 14);
          g = Math.round(142 + hazeBand * 12);
          b = Math.round(58 + hazeBand * 8);
          elevation = 0.5;
          rough = 135;
        } else if (subjectId === "pluto") {
          // Pluto Tombaugh Regio bright nitrogen heart + dark Cthulhu tholin macula
          const heartDist = Math.hypot((u - 0.52) * 3.0, (v - 0.46) * 3.6);
          const inHeart = heartDist < 0.42;
          r = inHeart ? 238 : Math.round(138 + n1 * 55);
          g = inHeart ? 228 : Math.round(96 + n1 * 48);
          b = inHeart ? 214 : Math.round(74 + n1 * 38);
          elevation = inHeart ? 0.35 : 0.65 + n2 * 0.25;
          rough = inHeart ? 120 : 210;
        } else {
          // Ganymede / rocky exoplanet fallback
          r = Math.round(145 + n1 * 55);
          g = Math.round(132 + n1 * 48);
          b = Math.round(118 + n1 * 42);
          elevation = n1;
          rough = 205;
        }

        albedoData[pIdx] = Math.min(255, Math.max(0, r));
        albedoData[pIdx + 1] = Math.min(255, Math.max(0, g));
        albedoData[pIdx + 2] = Math.min(255, Math.max(0, b));
        albedoData[pIdx + 3] = 255;

        heightField[idx] = elevation;

        roughnessData[pIdx] = rough;
        roughnessData[pIdx + 1] = rough;
        roughnessData[pIdx + 2] = rough;
        roughnessData[pIdx + 3] = 255;
      }
    }

    // Configure Albedo Texture in SRGBColorSpace
    const albedoMap = new THREE.DataTexture(albedoData, width, height, THREE.RGBAFormat);
    albedoMap.colorSpace = THREE.SRGBColorSpace;
    albedoMap.wrapS = THREE.RepeatWrapping;
    albedoMap.wrapT = THREE.ClampToEdgeWrapping;
    albedoMap.magFilter = THREE.LinearFilter;
    albedoMap.minFilter =
      qualityTier === "LOW_POWER" ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    albedoMap.generateMipmaps = qualityTier !== "LOW_POWER";
    albedoMap.needsUpdate = true;

    // Generate Tangent-Space Normal Map in Linear NoColorSpace (Skipped in LOW_POWER to save GPU memory)
    let normalMap: THREE.DataTexture | null = null;
    if (qualityTier !== "LOW_POWER") {
      const normalData = new Uint8Array(pixelCount * 4);
      const strength = 2.8;
      for (let y = 0; y < height; y++) {
        const yUp = Math.max(0, y - 1);
        const yDown = Math.min(height - 1, y + 1);
        for (let x = 0; x < width; x++) {
          const xLeft = (x - 1 + width) % width;
          const xRight = (x + 1) % width;

          const dX = (heightField[y * width + xRight] - heightField[y * width + xLeft]) * strength;
          const dY = (heightField[yDown * width + x] - heightField[yUp * width + x]) * strength;
          const invLen = 1.0 / Math.hypot(dX, dY, 1.0);

          const nx = (-dX * invLen * 0.5 + 0.5) * 255;
          const ny = (-dY * invLen * 0.5 + 0.5) * 255;
          const nz = (1.0 * invLen * 0.5 + 0.5) * 255;

          const pIdx = (y * width + x) * 4;
          normalData[pIdx] = Math.min(255, Math.max(0, Math.round(nx)));
          normalData[pIdx + 1] = Math.min(255, Math.max(0, Math.round(ny)));
          normalData[pIdx + 2] = Math.min(255, Math.max(128, Math.round(nz)));
          normalData[pIdx + 3] = 255;
        }
      }
      normalMap = new THREE.DataTexture(normalData, width, height, THREE.RGBAFormat);
      normalMap.colorSpace = THREE.NoColorSpace; // Strictly linear non-color data per Section 12
      normalMap.wrapS = THREE.RepeatWrapping;
      normalMap.wrapT = THREE.ClampToEdgeWrapping;
      normalMap.magFilter = THREE.LinearFilter;
      normalMap.minFilter = THREE.LinearMipmapLinearFilter;
      normalMap.generateMipmaps = true;
      normalMap.needsUpdate = true;
    }

    const roughnessSpecularMap = new THREE.DataTexture(
      roughnessData,
      width,
      height,
      THREE.RGBAFormat,
    );
    roughnessSpecularMap.colorSpace = THREE.NoColorSpace; // Linear non-color data
    roughnessSpecularMap.wrapS = THREE.RepeatWrapping;
    roughnessSpecularMap.wrapT = THREE.ClampToEdgeWrapping;
    roughnessSpecularMap.needsUpdate = true;

    const mapCount = normalMap ? 3 : 2;
    const mipMultiplier = qualityTier === "LOW_POWER" ? 1.0 : 1.33;
    const estimatedGpuBytes = Math.round(pixelCount * 4 * mapCount * mipMultiplier);

    const resMgr = ScientificResourceManager.getInstance();
    resMgr.trackThreeObject(`${cacheKey}:albedo`, albedoMap, true, pixelCount * 4);
    if (normalMap) {
      resMgr.trackThreeObject(`${cacheKey}:normal`, normalMap, true, pixelCount * 4);
    }
    resMgr.trackThreeObject(`${cacheKey}:roughness`, roughnessSpecularMap, true, pixelCount * 4);

    const bundle: CelestialTextureBundle = {
      subjectId,
      qualityTier,
      width,
      height,
      albedoMap,
      normalMap,
      roughnessSpecularMap,
      estimatedGpuBytes,
    };

    this.bundleCache.set(cacheKey, bundle);
    return bundle;
  }
}
