// @ts-nocheck
/**
 * COSMOS Scientific Planetary & Stellar Material Factory
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 8, 9, 10, 24, 25, 26
 *
 * Generates distinct, scientifically grounded materials and zero-404 procedural
 * albedo/cloud/ring textures for:
 * - Earth (continents, ocean specular, cloud layer, night-side city lights, Rayleigh limb)
 * - The Moon (cratered mare/highland regolith, directional phase shading, zero atmosphere)
 * - Mars (iron-oxide regolith, dark basaltic plains, polar cap, thin dusty atmosphere)
 * - Jupiter (zonal cloud belts, Great Red Spot anticyclone, oblate gas giant shading)
 * - Saturn (gold-cream banded atmosphere + A/B/C ring system with Cassini Division)
 * - Uranus & Neptune (methane-absorption cyan/azure atmospheres with limb haze)
 * - Europa / Icy Moons (high-albedo ice shell with tectonic lineae fractures)
 * - Main-Sequence, Giant, Supergiant, White Dwarf, and Neutron Stars
 *
 * Includes safe RGBA DataTexture fallback when running in Node/headless test environments.
 */

import * as THREE from "three";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import { blackbodyTemperatureToColor } from "./ScientificLightingController";
import { ScientificRenderingQualityAdapter } from "./ScientificRenderingQualityAdapter";
import { ScientificResourceManager } from "./ScientificResourceManager";

import {
  CosmosTextureVariantManager,
  type CelestialTextureSubjectId,
} from "../assets/CosmosTextureVariantManager";

export type PlanetaryBodyPresetId =
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

export interface PlanetaryVisualDescriptor {
  presetId: PlanetaryBodyPresetId;
  name: string;
  planetClassIndex: 0 | 1 | 2 | 3 | 4; // 0=Earth, 1=Airless Moon, 2=Mars, 3=Gas Giant, 4=Ice Giant
  baseColorHex: string;
  secondaryColorHex: string;
  roughness: number;
  metalness: number;
  oceanSpecularStrength: number;
  nightLightsStrength: number;
  hasAtmosphere: boolean;
  atmosphereRayleighHex: string;
  atmosphereMieHex: string;
  atmosphereOpticalDepth: number;
  atmosphereRadiusRatio: number; // R_atm / R_planet
  hasCloudLayer: boolean;
  hasRingSystem: boolean;
  ringInnerRadiusRatio?: number;
  ringOuterRadiusRatio?: number;
  axialTiltDeg: number;
  scientificNotes: string;
}

export const PLANETARY_VISUAL_PRESETS: Record<PlanetaryBodyPresetId, PlanetaryVisualDescriptor> = {
  earth: {
    presetId: "earth",
    name: "Earth (Terra)",
    planetClassIndex: 0,
    baseColorHex: "#0369a1",
    secondaryColorHex: "#15803d",
    roughness: 0.52,
    metalness: 0.08,
    oceanSpecularStrength: 0.65,
    nightLightsStrength: 0.75,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#38bdf8",
    atmosphereMieHex: "#fb923c",
    atmosphereOpticalDepth: 1.25,
    atmosphereRadiusRatio: 1.045,
    hasCloudLayer: true,
    hasRingSystem: false,
    axialTiltDeg: 23.44,
    scientificNotes:
      "Nitrogen-oxygen atmosphere (scale height H = 8.5 km) with Rayleigh lambda^-4 blue limb scattering, liquid H2O ocean specular glint, and terminator shading.",
  },
  moon: {
    presetId: "moon",
    name: "The Moon (Luna)",
    planetClassIndex: 1,
    baseColorHex: "#94a3b8",
    secondaryColorHex: "#475569",
    roughness: 0.92,
    metalness: 0.02,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: false, // Strictly airless per Section 8
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 1.54,
    scientificNotes:
      "Airless silicate regolith (Bond albedo 0.11) with anorthositic highlands, basaltic mare basins, sharp shadow terminators, and zero atmospheric limb glow.",
  },
  mars: {
    presetId: "mars",
    name: "Mars",
    planetClassIndex: 2,
    baseColorHex: "#c2410c",
    secondaryColorHex: "#7c2d12",
    roughness: 0.84,
    metalness: 0.04,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#fdba74",
    atmosphereMieHex: "#ea580c",
    atmosphereOpticalDepth: 0.35,
    atmosphereRadiusRatio: 1.028,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 25.19,
    scientificNotes:
      "Iron(III) oxide dust regolith with thin 6.1 mbar CO2 atmosphere (scale height H = 11.1 km) and suspended aerosol dust limb scattering.",
  },
  jupiter: {
    presetId: "jupiter",
    name: "Jupiter",
    planetClassIndex: 3,
    baseColorHex: "#d97706",
    secondaryColorHex: "#fef3c7",
    roughness: 0.62,
    metalness: 0.0,
    oceanSpecularStrength: 0.05,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#fde68a",
    atmosphereMieHex: "#f59e0b",
    atmosphereOpticalDepth: 0.65,
    atmosphereRadiusRatio: 1.025,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 3.13,
    scientificNotes:
      "Hydrogen-helium gas giant with alternating ammonia/ammonium hydrosulfide zonal cloud belts, bright zones, and anticyclonic Great Red Spot vortex.",
  },
  saturn: {
    presetId: "saturn",
    name: "Saturn",
    planetClassIndex: 3,
    baseColorHex: "#eab308",
    secondaryColorHex: "#fef08a",
    roughness: 0.66,
    metalness: 0.0,
    oceanSpecularStrength: 0.04,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#fef08a",
    atmosphereMieHex: "#ca8a04",
    atmosphereOpticalDepth: 0.55,
    atmosphereRadiusRatio: 1.025,
    hasCloudLayer: false,
    hasRingSystem: true,
    ringInnerRadiusRatio: 1.24,
    ringOuterRadiusRatio: 2.28,
    axialTiltDeg: 26.73,
    scientificNotes:
      "Oblate gas giant with high-albedo water-ice ring system (C, B, Cassini Division at 4:2 Mimas resonance, and A ring).",
  },
  uranus: {
    presetId: "uranus",
    name: "Uranus",
    planetClassIndex: 4,
    baseColorHex: "#67e8f9",
    secondaryColorHex: "#22d3ee",
    roughness: 0.58,
    metalness: 0.0,
    oceanSpecularStrength: 0.08,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#a5f3fc",
    atmosphereMieHex: "#06b6d4",
    atmosphereOpticalDepth: 0.72,
    atmosphereRadiusRatio: 1.03,
    hasCloudLayer: false,
    hasRingSystem: true,
    ringInnerRadiusRatio: 1.6,
    ringOuterRadiusRatio: 1.95,
    axialTiltDeg: 97.77,
    scientificNotes:
      "Ice giant with 97.77-degree extreme axial obliquity and red-light-absorbing atmospheric methane (CH4) haze.",
  },
  neptune: {
    presetId: "neptune",
    name: "Neptune",
    planetClassIndex: 4,
    baseColorHex: "#2563eb",
    secondaryColorHex: "#60a5fa",
    roughness: 0.54,
    metalness: 0.0,
    oceanSpecularStrength: 0.12,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#60a5fa",
    atmosphereMieHex: "#1d4ed8",
    atmosphereOpticalDepth: 0.85,
    atmosphereRadiusRatio: 1.032,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 28.32,
    scientificNotes:
      "Dynamic ice giant with supersonic zonal winds and high-altitude methane ice cirrus bands.",
  },
  europa: {
    presetId: "europa",
    name: "Europa (Galilean Icy Moon)",
    planetClassIndex: 1,
    baseColorHex: "#e2e8f0",
    secondaryColorHex: "#9a3412",
    roughness: 0.38,
    metalness: 0.05,
    oceanSpecularStrength: 0.25,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.1,
    scientificNotes:
      "Tectonically fractured water-ice crust overlying a tidally heated global subsurface liquid ocean.",
  },
  rocky_exoplanet: {
    presetId: "rocky_exoplanet",
    name: "Terrestrial Exoplanet",
    planetClassIndex: 2,
    baseColorHex: "#0ea5e9",
    secondaryColorHex: "#0f766e",
    roughness: 0.65,
    metalness: 0.08,
    oceanSpecularStrength: 0.35,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#38bdf8",
    atmosphereMieHex: "#14b8a6",
    atmosphereOpticalDepth: 0.9,
    atmosphereRadiusRatio: 1.035,
    hasCloudLayer: true,
    hasRingSystem: false,
    axialTiltDeg: 15.0,
    scientificNotes:
      "Speculative reconstruction of a temperate terrestrial exoplanet based on bulk density and equilibrium temperature.",
  },
  mercury: {
    presetId: "mercury",
    name: "Mercury",
    planetClassIndex: 1,
    baseColorHex: "#94a3b8",
    secondaryColorHex: "#475569",
    roughness: 0.9,
    metalness: 0.08,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.034,
    scientificNotes:
      "Airless iron-rich terrestrial planet with Caloris Basin impact plains and lobate compression scarps (NASA MESSENGER MDIS).",
  },
  venus: {
    presetId: "venus",
    name: "Venus",
    planetClassIndex: 2,
    baseColorHex: "#fde68a",
    secondaryColorHex: "#d97706",
    roughness: 0.55,
    metalness: 0.0,
    oceanSpecularStrength: 0.05,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#fef08a",
    atmosphereMieHex: "#f59e0b",
    atmosphereOpticalDepth: 1.45,
    atmosphereRadiusRatio: 1.055,
    hasCloudLayer: true,
    hasRingSystem: false,
    axialTiltDeg: 177.36,
    scientificNotes:
      "Super-rotating 92-bar CO2 atmosphere shrouded by reflective H2SO4 cloud decks (NASA Magellan / Akatsuki).",
  },
  pluto: {
    presetId: "pluto",
    name: "Pluto",
    planetClassIndex: 1,
    baseColorHex: "#d6d3d1",
    secondaryColorHex: "#78350f",
    roughness: 0.78,
    metalness: 0.02,
    oceanSpecularStrength: 0.08,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#7dd3fc",
    atmosphereMieHex: "#38bdf8",
    atmosphereOpticalDepth: 0.18,
    atmosphereRadiusRatio: 1.03,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 122.53,
    scientificNotes:
      "Kuiper Belt dwarf planet featuring Tombaugh Regio nitrogen-ice plains and dark Cthulhu tholin highlands (NASA New Horizons).",
  },
  ceres: {
    presetId: "ceres",
    name: "Ceres",
    planetClassIndex: 1,
    baseColorHex: "#78716c",
    secondaryColorHex: "#44403c",
    roughness: 0.92,
    metalness: 0.02,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 4.0,
    scientificNotes:
      "Main-belt dwarf planet with bright sodium-carbonate faculae in Occator Crater (NASA Dawn).",
  },
  io: {
    presetId: "io",
    name: "Io",
    planetClassIndex: 1,
    baseColorHex: "#facc15",
    secondaryColorHex: "#b91c1c",
    roughness: 0.82,
    metalness: 0.04,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.05,
    scientificNotes:
      "Tidally heated Galilean moon resurfaced by silicate and sulfur-allotrope volcanism (NASA Galileo / Juno).",
  },
  ganymede: {
    presetId: "ganymede",
    name: "Ganymede",
    planetClassIndex: 1,
    baseColorHex: "#a8a29e",
    secondaryColorHex: "#57534e",
    roughness: 0.76,
    metalness: 0.03,
    oceanSpecularStrength: 0.06,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.2,
    scientificNotes:
      "Largest Solar System moon with dark cratered terrain, bright grooved sulci, and an intrinsic dipole magnetosphere.",
  },
  callisto: {
    presetId: "callisto",
    name: "Callisto",
    planetClassIndex: 1,
    baseColorHex: "#78716c",
    secondaryColorHex: "#292524",
    roughness: 0.88,
    metalness: 0.02,
    oceanSpecularStrength: 0.0,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.2,
    scientificNotes:
      "Heavily cratered outer Galilean moon preserving the ancient Valhalla multi-ring impact basin.",
  },
  titan: {
    presetId: "titan",
    name: "Titan",
    planetClassIndex: 2,
    baseColorHex: "#f59e0b",
    secondaryColorHex: "#b45309",
    roughness: 0.62,
    metalness: 0.0,
    oceanSpecularStrength: 0.15,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#fb923c",
    atmosphereMieHex: "#d97706",
    atmosphereOpticalDepth: 1.35,
    atmosphereRadiusRatio: 1.06,
    hasCloudLayer: true,
    hasRingSystem: false,
    axialTiltDeg: 0.3,
    scientificNotes:
      "Saturnian moon with a 1.45-bar nitrogen-methane photochemical haze and polar liquid hydrocarbon seas (Cassini-Huygens).",
  },
  enceladus: {
    presetId: "enceladus",
    name: "Enceladus",
    planetClassIndex: 1,
    baseColorHex: "#f8fafc",
    secondaryColorHex: "#38bdf8",
    roughness: 0.32,
    metalness: 0.04,
    oceanSpecularStrength: 0.28,
    nightLightsStrength: 0.0,
    hasAtmosphere: false,
    atmosphereRayleighHex: "#000000",
    atmosphereMieHex: "#000000",
    atmosphereOpticalDepth: 0.0,
    atmosphereRadiusRatio: 1.0,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 0.0,
    scientificNotes:
      "High-albedo icy moon venting subsurface ocean H2O plumes from south-polar Tiger Stripes fractures (NASA Cassini).",
  },
  triton: {
    presetId: "triton",
    name: "Triton",
    planetClassIndex: 1,
    baseColorHex: "#e2e8f0",
    secondaryColorHex: "#fda4af",
    roughness: 0.55,
    metalness: 0.02,
    oceanSpecularStrength: 0.12,
    nightLightsStrength: 0.0,
    hasAtmosphere: true,
    atmosphereRayleighHex: "#bae6fd",
    atmosphereMieHex: "#93c5fd",
    atmosphereOpticalDepth: 0.12,
    atmosphereRadiusRatio: 1.02,
    hasCloudLayer: false,
    hasRingSystem: false,
    axialTiltDeg: 156.8,
    scientificNotes:
      "Retrograde captured Kuiper Belt moon of Neptune with cantaloupe terrain and nitrogen geysers (NASA Voyager 2).",
  },
};

/**
 * Deterministic 32-bit PRNG (Mulberry32) so procedural textures never flicker across mounts.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ScientificMaterialFactory {
  private static instance: ScientificMaterialFactory | null = null;
  private textureCache = new Map<string, THREE.DataTexture>();

  public static getInstance(): ScientificMaterialFactory {
    if (!this.instance) {
      this.instance = new ScientificMaterialFactory();
    }
    return this.instance;
  }

  public getPlanetaryPreset(presetId: PlanetaryBodyPresetId): PlanetaryVisualDescriptor {
    return PLANETARY_VISUAL_PRESETS[presetId] ?? PLANETARY_VISUAL_PRESETS.earth;
  }

  /**
   * Generates a cached, deterministic RGBA DataTexture for the given planetary body and quality tier.
   * Works identically in both browser WebGL and Node/headless validation suites with zero external 404s.
   */
  public getOrCreatePlanetaryAlbedoTexture(
    presetId: PlanetaryBodyPresetId,
    tier?: CinematicQualityTier,
  ): THREE.DataTexture {
    const adapted = ScientificRenderingQualityAdapter.resolveAdaptedParameters(tier);
    const width = adapted.proceduralTextureSize;
    const height = Math.max(64, Math.floor(width / 2));
    const cacheKey = `tex:planet:${presetId}:${width}x${height}`;

    const cached = this.textureCache.get(cacheKey);
    if (cached) return cached;

    const preset = this.getPlanetaryPreset(presetId);
    const baseCol = new THREE.Color(preset.baseColorHex);
    const secCol = new THREE.Color(preset.secondaryColorHex);
    const rng = mulberry32(presetId.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17));

    const data = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y++) {
      const v = y / height; // [0..1] pole to pole
      const lat = (v - 0.5) * Math.PI;
      const absLat = Math.abs(v - 0.5) * 2.0;

      for (let x = 0; x < width; x++) {
        const u = x / width;
        const lon = u * Math.PI * 2.0;
        const idx = (y * width + x) * 4;

        let r = baseCol.r;
        let g = baseCol.g;
        let b = baseCol.b;

        if (presetId === "earth") {
          // Polar ice caps
          if (absLat > 0.84) {
            r = 0.94;
            g = 0.97;
            b = 1.0;
          } else {
            // Harmonic continent mask
            const cont =
              Math.sin(lon * 2.0 + 0.5) * Math.cos(lat * 2.2) +
              0.5 * Math.sin(lon * 5.0 - lat * 3.0) +
              0.25 * Math.cos(lon * 9.0 + lat * 7.0);
            if (cont > 0.18) {
              // Landmass (forest green to arid tan)
              const arid = Math.max(0, Math.min(1, 1.0 - absLat * 2.2));
              r = secCol.r * (1 - arid * 0.3) + 0.55 * arid * 0.35;
              g = secCol.g * 0.95;
              b = secCol.b * 0.85;
            }
          }
        } else if (presetId === "moon") {
          // Basaltic mare basins + impact craters
          const mare =
            Math.sin(lon * 2.0) * Math.cos(lat * 1.8) + 0.4 * Math.cos(lon * 4.0 + lat * 3.0);
          const crater = (rng() - 0.5) * 0.12;
          const t = mare > 0.22 ? 0.72 : 0.2;
          r = THREE.MathUtils.lerp(baseCol.r, secCol.r, t) + crater;
          g = THREE.MathUtils.lerp(baseCol.g, secCol.g, t) + crater;
          b = THREE.MathUtils.lerp(baseCol.b, secCol.b, t) + crater;
        } else if (presetId === "mars") {
          if (absLat > 0.88) {
            // Polar CO2/H2O ice cap
            r = 0.95;
            g = 0.93;
            b = 0.9;
          } else {
            const darkPlains =
              Math.sin(lon * 3.0 + 1.1) * Math.cos(lat * 2.5) + 0.35 * Math.sin(lon * 7.0);
            const t = darkPlains > 0.25 ? 0.65 : 0.15;
            r = THREE.MathUtils.lerp(baseCol.r, secCol.r, t);
            g = THREE.MathUtils.lerp(baseCol.g, secCol.g, t);
            b = THREE.MathUtils.lerp(baseCol.b, secCol.b, t);
          }
        } else if (presetId === "jupiter" || presetId === "saturn") {
          // Zonal atmospheric bands + Great Red Spot on Jupiter at southern tropical latitude
          const bandFreq = presetId === "jupiter" ? 18.0 : 12.0;
          const wave = 0.5 + 0.5 * Math.sin(lat * bandFreq + Math.sin(lon * 4.0) * 0.25);
          r = THREE.MathUtils.lerp(baseCol.r, secCol.r, wave);
          g = THREE.MathUtils.lerp(baseCol.g, secCol.g, wave);
          b = THREE.MathUtils.lerp(baseCol.b, secCol.b, wave);

          if (presetId === "jupiter") {
            const grsDist = Math.hypot((u - 0.35) * 3.2, (v - 0.62) * 5.5);
            if (grsDist < 0.28) {
              const spotBlend = 1.0 - grsDist / 0.28;
              r = THREE.MathUtils.lerp(r, 0.88, spotBlend);
              g = THREE.MathUtils.lerp(g, 0.26, spotBlend);
              b = THREE.MathUtils.lerp(b, 0.14, spotBlend);
            }
          }
        } else if (presetId === "europa") {
          // Icy crust with tectonic lineae cracks
          const lineae = Math.abs(Math.sin(lon * 9.0 + lat * 7.0)) < 0.08 ? 0.75 : 0.0;
          r = THREE.MathUtils.lerp(baseCol.r, secCol.r, lineae);
          g = THREE.MathUtils.lerp(baseCol.g, secCol.g, lineae);
          b = THREE.MathUtils.lerp(baseCol.b, secCol.b, lineae);
        } else {
          // Uranus / Neptune / Exoplanet smooth banded gradient
          const band = 0.5 + 0.5 * Math.cos(lat * 8.0);
          r = THREE.MathUtils.lerp(baseCol.r, secCol.r, band * 0.45);
          g = THREE.MathUtils.lerp(baseCol.g, secCol.g, band * 0.45);
          b = THREE.MathUtils.lerp(baseCol.b, secCol.b, band * 0.45);
        }

        data[idx] = Math.min(255, Math.max(0, Math.round(r * 255)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(g * 255)));
        data[idx + 2] = Math.min(255, Math.max(0, Math.round(b * 255)));
        data[idx + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    ScientificResourceManager.getInstance().trackThreeObject(
      cacheKey,
      texture,
      true,
      width * height * 4,
    );
    return texture;
  }

  /**
   * Retrieves a linear-color-space tangent normal map for surface relief (Prompt 06 Section 12 & 16).
   */
  public getOrCreatePlanetaryNormalTexture(
    presetId: PlanetaryBodyPresetId,
    qualityTier: CinematicQualityTier = "HIGH_CINEMATIC",
  ): THREE.DataTexture | null {
    const bundle = CosmosTextureVariantManager.getInstance().getOrCreateTextureBundle(
      presetId as CelestialTextureSubjectId,
      qualityTier,
    );
    return bundle.normalMap;
  }

  /**
   * Generates a radial RGBA DataTexture for Saturn's A, B, and C rings including
   * the transparent Cassini Division at r ~ 0.68 of the ring span.
   */
  public getOrCreatePlanetaryRingTexture(): THREE.DataTexture {
    const cacheKey = "tex:saturn_rings:256x1";
    const cached = this.textureCache.get(cacheKey);
    if (cached) return cached;

    const width = 256;
    const data = new Uint8Array(width * 4);
    for (let x = 0; x < width; x++) {
      const t = x / width; // 0 = inner C ring, 1 = outer A ring
      const idx = x * 4;

      // Cassini Division gap around t in [0.64, 0.70]
      const inCassiniGap = t > 0.64 && t < 0.7;
      // Inner C ring is faint (t < 0.22), B ring is dense (0.22..0.64), A ring is moderate (0.70..0.98)
      let opacity = 0.0;
      if (inCassiniGap) {
        opacity = 0.06;
      } else if (t < 0.22) {
        opacity = 0.28;
      } else if (t <= 0.64) {
        opacity = 0.85 + 0.1 * Math.sin(t * 90.0);
      } else if (t < 0.98) {
        opacity = 0.65 + 0.08 * Math.cos(t * 70.0);
      }

      data[idx] = 238;
      data[idx + 1] = 216;
      data[idx + 2] = 168;
      data[idx + 3] = Math.min(255, Math.max(0, Math.round(opacity * 255)));
    }

    const texture = new THREE.DataTexture(data, width, 1, THREE.RGBAFormat);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    this.textureCache.set(cacheKey, texture);
    ScientificResourceManager.getInstance().trackThreeObject(cacheKey, texture, true, width * 4);
    return texture;
  }

  /**
   * Resolves temperature-informed stellar colors and limb-darkening parameters
   * for any effective temperature T_eff (Prompt 05 Section 10).
   */
  public resolveStellarParameters(temperatureK: number): {
    blackbodyHex: string;
    coronaHex: string;
    limbDarkeningU: number;
    granulationScale: number;
    spectralClass: string;
  } {
    const bb = blackbodyTemperatureToColor(temperatureK);
    // Cooler stars have stronger optical limb darkening (u ~ 0.72 for M/K, 0.56 for G, 0.35 for O/B)
    const limbDarkeningU =
      temperatureK > 15000 ? 0.34 : temperatureK > 7500 ? 0.45 : temperatureK > 5000 ? 0.56 : 0.72;
    const granulationScale = temperatureK < 4500 ? 8.0 : 14.0;
    const coronaHex =
      temperatureK >= 10000 ? "#60a5fa" : temperatureK >= 5000 ? "#f59e0b" : "#ea580c";

    return {
      blackbodyHex: bb.srgbHex,
      coronaHex,
      limbDarkeningU,
      granulationScale,
      spectralClass: bb.spectralClass,
    };
  }

  public clearCache(): void {
    for (const tex of this.textureCache.values()) {
      tex.dispose();
    }
    this.textureCache.clear();
  }
}
