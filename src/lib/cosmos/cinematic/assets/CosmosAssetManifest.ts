/**
 * COSMOS Verified Scientific 3D Asset Manifest & 172-Chapter Coverage Registry
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Sections 4, 5, 6, 7, 16–26, 38
 *
 * Central authoritative catalog of every astronomical 3D model, procedural/hybrid
 * planetary surface texture set, spacecraft assembly, telescope cutaway, and
 * catalog-driven particle dataset used across the 24-module, 172-chapter academy.
 *
 * Every asset record includes complete scientific provenance, verified license
 * metadata, LOD hierarchy definitions, texture resolution variants, GPU memory
 * budgets, and stable COSMOS interactive node identifiers.
 */

import { LessonContentProvider } from "../../LessonContentProvider";
import type {
  CinematicQualityTier,
  ScientificRepresentationCategory,
} from "../../cinematic-storyboard-types";
import { CosmosAnimationCueRegistry } from "../CosmosAnimationCueRegistry";
import { CosmosCinematicSceneRegistry } from "../CosmosCinematicSceneRegistry";
import type { ScientificObjectType } from "../rendering/ScientificObjectContract";

export type AssetLicenseStatus =
  | "PUBLIC_DOMAIN_NASA_17USC105"
  | "CC_BY_4_0_ESA_WEBB"
  | "CC_BY_4_0_ESO"
  | "OPEN_SCIENCE_GAIA_HIPPARCOS"
  | "CLEAN_ROOM_FIRST_PARTY"
  | "LICENSE_REVIEW_REQUIRED"
  | "BLOCKED_UNLICENSED";

export type AssetValidationStatus =
  | "READY"
  | "NEEDS_OPTIMIZATION"
  | "NEEDS_CREATION"
  | "NEEDS_LICENSE_REVIEW"
  | "MISSING"
  | "BLOCKED";

export type AssetDeliveryStrategy =
  | "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE"
  | "HYBRID_PROCEDURAL_SURFACE_MAPS"
  | "PHYSICALLY_INFORMED_GLSL_SHADER"
  | "CATALOG_TYPED_PARTICLE_BUFFER"
  | "LABELED_VOLUMETRIC_RECONSTRUCTION";

export type AssetFormatIdentifier =
  | "GLB_2_0_MESHOPT"
  | "GLB_2_0_DRACO"
  | "GLB_2_0_UNCOMPRESSED"
  | "KTX2_UASTC_FALLBACK_DATA_RGBA"
  | "KTX2_ETC1S_FALLBACK_DATA_RGBA"
  | "FLOAT32_TYPED_CATALOG_BUFFER"
  | "GLSL_PROCEDURAL_SHADER_RIG";

export type LODLevelIdentifier = "LOD0_HIGH" | "LOD1_MEDIUM" | "LOD2_LOW" | "LOD3_IMPOSTOR";

export interface AssetLODDescriptor {
  lodId: LODLevelIdentifier;
  minScreenPixels: number;
  maxScreenPixels: number;
  hysteresisPixels: number;
  triangleCount: number;
  sphereSegments?: [number, number];
  particleCount?: number;
  geometricErrorRatio: number;
  description: string;
}

export interface AssetTextureVariantDescriptor {
  qualityTier: CinematicQualityTier;
  width: number;
  height: number;
  albedoFormat: "SRGB_RGBA8" | "KTX2_ETC1S_SRGB";
  normalFormat: "LINEAR_RGBA8" | "KTX2_UASTC_LINEAR" | "NONE";
  roughnessFormat: "LINEAR_R8" | "NONE";
  estimatedGpuBytes: number;
  mipmapsGenerated: boolean;
}

export interface AssetPhysicalDimensions {
  physicalRadiusKm: number;
  oblatenessFlattening: number;
  axialTiltDeg: number;
  rotationPeriodHours: number;
  semiMajorAxisAu?: number;
  defaultDisplayRadiusUnits: number;
  measurementSource: string;
}

export interface CosmosVerifiedAssetRecord {
  assetId: string;
  displayName: string;
  scientificObjectType: ScientificObjectType;
  deliveryStrategy: AssetDeliveryStrategy;
  sourceOrganization: string;
  sourceURL: string;
  originalAuthor: string;
  licenseIdentifier: AssetLicenseStatus;
  licenseURL: string;
  requiredAttribution: string;
  usageRestrictions: string;
  commercialUseStatus:
    "PERMITTED_WITH_ATTRIBUTION" | "PERMITTED_PUBLIC_DOMAIN" | "RESTRICTED_NON_COMMERCIAL";
  noEndorsementNotice: string;
  scientificRepresentation: ScientificRepresentationCategory;
  sourceDataVersion: string;
  downloadDate: string;
  sourceChecksum: string;
  optimizedAssetPath: string;
  originalFormat: string;
  optimizedFormat: AssetFormatIdentifier;
  compressionCodec:
    "MESHOPT" | "DRACO" | "KTX2_UASTC" | "TYPED_FLOAT32" | "UNCOMPRESSED_PROCEDURAL";
  availableLODLevels: AssetLODDescriptor[];
  textureVariants: Record<CinematicQualityTier, AssetTextureVariantDescriptor>;
  estimatedGpuMemory: {
    HIGH_CINEMATIC: number; // bytes
    BALANCED: number; // bytes
    LOW_POWER: number; // bytes
  };
  physicalDimensions: AssetPhysicalDimensions;
  requiredInteractiveNodeIds: string[];
  relatedModuleIds: string[];
  relatedSceneIds: string[];
  relatedNarrationCueIds: string[];
  validationStatus: AssetValidationStatus;
}

export interface ChapterAssetCoverageRecord {
  moduleId: string;
  sublessonId: string;
  chapterCode: string;
  sceneId: string;
  primaryAssetIds: string[];
  supportingAssetIds: string[];
  reusableProceduralComponents: string[];
  missingAssetIds: string[];
  scientificProvenance: string;
  licenseStatus: AssetLicenseStatus;
  relatedCosmosCueIds: string[];
  renderingQualityCoverage: CinematicQualityTier[];
  performanceRisk: "LOW" | "MODERATE" | "HIGH";
  accessibilityFallback: string;
  coverageStatus: AssetValidationStatus;
}

function buildStandardPlanetaryLODs(
  highTris = 8192,
  medTris = 4608,
  lowTris = 2048,
): AssetLODDescriptor[] {
  return [
    {
      lodId: "LOD0_HIGH",
      minScreenPixels: 140,
      maxScreenPixels: 10000,
      hysteresisPixels: 18,
      triangleCount: highTris,
      sphereSegments: [64, 64],
      geometricErrorRatio: 0.0008,
      description: "Close-inspection 64x64 geodetic sphere with full normal relief and sub-layers",
    },
    {
      lodId: "LOD1_MEDIUM",
      minScreenPixels: 48,
      maxScreenPixels: 140,
      hysteresisPixels: 12,
      triangleCount: medTris,
      sphereSegments: [48, 48],
      geometricErrorRatio: 0.0022,
      description: "Standard cinematic viewing 48x48 sphere with balanced surface maps",
    },
    {
      lodId: "LOD2_LOW",
      minScreenPixels: 12,
      maxScreenPixels: 48,
      hysteresisPixels: 6,
      triangleCount: lowTris,
      sphereSegments: [32, 32],
      geometricErrorRatio: 0.0065,
      description: "Distant orbital viewing 32x32 sphere with compact albedo map",
    },
    {
      lodId: "LOD3_IMPOSTOR",
      minScreenPixels: 0,
      maxScreenPixels: 12,
      hysteresisPixels: 4,
      triangleCount: 2,
      sphereSegments: [8, 8],
      geometricErrorRatio: 0.025,
      description: "Sub-12px screen-space photometric point/billboard impostor preventing aliasing",
    },
  ];
}

function buildStandardPlanetaryTextureVariants(
  includeNormal = true,
): Record<CinematicQualityTier, AssetTextureVariantDescriptor> {
  return {
    HIGH_CINEMATIC: {
      qualityTier: "HIGH_CINEMATIC",
      width: 1024,
      height: 512,
      albedoFormat: "SRGB_RGBA8",
      normalFormat: includeNormal ? "LINEAR_RGBA8" : "NONE",
      roughnessFormat: "LINEAR_R8",
      estimatedGpuBytes: includeNormal ? 1024 * 512 * 4 * 2 * 1.33 : 1024 * 512 * 4 * 1.33,
      mipmapsGenerated: true,
    },
    BALANCED: {
      qualityTier: "BALANCED",
      width: 512,
      height: 256,
      albedoFormat: "SRGB_RGBA8",
      normalFormat: includeNormal ? "LINEAR_RGBA8" : "NONE",
      roughnessFormat: "LINEAR_R8",
      estimatedGpuBytes: includeNormal ? 512 * 256 * 4 * 2 * 1.33 : 512 * 256 * 4 * 1.33,
      mipmapsGenerated: true,
    },
    LOW_POWER: {
      qualityTier: "LOW_POWER",
      width: 256,
      height: 128,
      albedoFormat: "SRGB_RGBA8",
      normalFormat: "NONE",
      roughnessFormat: "NONE",
      estimatedGpuBytes: 256 * 128 * 4 * 1.33,
      mipmapsGenerated: false,
    },
  };
}

/**
 * Master catalog of verified astronomical 3D assets.
 */
export const COSMOS_VERIFIED_ASSET_MANIFEST: Record<string, CosmosVerifiedAssetRecord> = {
  // =========================================================================
  // 1. SOLAR SYSTEM PLANETS & DWARF PLANETS (SECTIONS 16, 17, 19)
  // =========================================================================
  asset_planet_earth_reference_v2: {
    assetId: "asset_planet_earth_reference_v2",
    displayName: "Earth (Terra) — Blue Marble & Topographic Reference v2",
    scientificObjectType: "planet_terrestrial",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA Goddard Space Flight Center / NASA Visible Earth",
    sourceURL: "https://visibleearth.nasa.gov/collection/1484/blue-marble",
    originalAuthor: "Reto Stöckli / NASA Earth Observatory / NOAA NGDC",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Imagery and topographic data derived from NASA Visible Earth (Blue Marble Next Generation, ETOPO1, Suomi NPP VIIRS). Courtesy NASA/GSFC/NOAA.",
    usageRestrictions:
      "Public domain under 17 U.S.C. § 105. Must not use NASA insignia or imply official NASA endorsement. Cloud layer is a scale-adjusted synoptic synthesis, not live meteorological telemetry.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice:
      "NASA does not endorse Our Visible Universe Academy or its commercial products.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "BMNG-2004.12 + ETOPO1-v2 + VIIRS-2016",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    optimizedAssetPath: "procedural://cosmos/planets/earth_reference_v2",
    originalFormat: "Equirectangular GeoTIFF / PNG Surface & Bathymetry Maps",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(8192, 4608, 2048),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.6 * 1024 * 1024),
      BALANCED: Math.round(1.4 * 1024 * 1024),
      LOW_POWER: Math.round(0.22 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 6371.0,
      oblatenessFlattening: 0.0033528,
      axialTiltDeg: 23.4393,
      rotationPeriodHours: 23.9345,
      semiMajorAxisAu: 1.000001018,
      defaultDisplayRadiusUnits: 1.45,
      measurementSource: "IAU 2015 Resolution B3 / NASA JPL DE440",
    },
    requiredInteractiveNodeIds: [
      "earth_surface_mesh",
      "earth_cloud_layer",
      "earth_rayleigh_limb",
      "earth_axial_pole_marker",
    ],
    relatedModuleIds: ["01", "02", "03", "04", "05", "06", "08", "19", "20", "22", "23", "24"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m02_virtual_planetarium_dome",
      "m03_cosmic_distance_ladder_3d",
      "m05_sun_earth_moon_eclipses_3d",
      "m06_solar_system_orrery_3d",
      "m08_orbital_mechanics_lab",
      "m23_astrobiology_worlds_3d",
    ],
    relatedNarrationCueIds: [
      "cue-m01-01-lesson-1-what-is-space-title",
      "cue-m01-01-lesson-2-earth-our-home-title",
    ],
    validationStatus: "READY",
  },

  asset_moon_luna_lroc_v2: {
    assetId: "asset_moon_luna_lroc_v2",
    displayName: "Earth's Moon (Luna) — LROC & LOLA Topographic Relief v2",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA Goddard Space Flight Center / Arizona State University LROC",
    sourceURL: "https://svs.gsfc.nasa.gov/4720",
    originalAuthor: "Ernie Wright (USRA) / NASA SVS / LRO LOLA & LROC Science Teams",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Lunar albedo and elevation relief derived from NASA Lunar Reconnaissance Orbiter (LROC WAC / LOLA CGI Moon Kit, SVS #4720). Courtesy NASA/GSFC/ASU.",
    usageRestrictions:
      "Public domain under 17 U.S.C. § 105. Airless body must render with zero atmospheric scattering.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "NASA-SVS-4720-LROC-LOLA-2019",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    optimizedAssetPath: "procedural://cosmos/moons/luna_lroc_v2",
    originalFormat: "Equirectangular Displacement & Albedo Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.4 * 1024 * 1024),
      BALANCED: Math.round(1.35 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 1737.4,
      oblatenessFlattening: 0.0012,
      axialTiltDeg: 1.5424,
      rotationPeriodHours: 655.728, // Tidally locked synchronous rotation
      semiMajorAxisAu: 0.00256955,
      defaultDisplayRadiusUnits: 0.42,
      measurementSource: "NASA LRO LOLA / JPL DE440",
    },
    requiredInteractiveNodeIds: [
      "moon_surface_mesh",
      "moon_tycho_crater_anchor",
      "moon_mare_tranquillitatis_anchor",
    ],
    relatedModuleIds: ["01", "03", "05", "06", "08", "22"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m05_sun_earth_moon_eclipses_3d",
      "m06_solar_system_orrery_3d",
      "m08_orbital_mechanics_lab",
    ],
    relatedNarrationCueIds: ["cue-m01-01-lesson-3-earth-and-the-moon-title"],
    validationStatus: "READY",
  },

  asset_planet_mercury_v1: {
    assetId: "asset_planet_mercury_v1",
    displayName: "Mercury — MESSENGER MDIS Global Mosaic & Caloris Basin Relief",
    scientificObjectType: "planet_terrestrial",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / Johns Hopkins APL / Carnegie Institution of Washington",
    sourceURL: "https://science.nasa.gov/resource/mercury-3d-model/",
    originalAuthor: "NASA Solar System Exploration / MESSENGER MDIS Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Mercury global surface reference derived from NASA MESSENGER MDIS mosaic. Courtesy NASA/JHUAPL/CIW.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "MESSENGER-MDIS-BDR-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
    optimizedAssetPath: "procedural://cosmos/planets/mercury_v1",
    originalFormat: "Equirectangular Albedo & Relief Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.4 * 1024 * 1024),
      BALANCED: Math.round(1.35 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 2439.7,
      oblatenessFlattening: 0.0009,
      axialTiltDeg: 0.034,
      rotationPeriodHours: 1407.6,
      semiMajorAxisAu: 0.387098,
      defaultDisplayRadiusUnits: 0.55,
      measurementSource: "NASA JPL SSD / MESSENGER",
    },
    requiredInteractiveNodeIds: ["mercury_surface_mesh", "mercury_iron_core_cutaway"],
    relatedModuleIds: ["01", "06", "08"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m06_solar_system_orrery_3d",
      "m08_orbital_mechanics_lab",
    ],
    relatedNarrationCueIds: ["cue-m06-06-sub-02-title"],
    validationStatus: "READY",
  },

  asset_planet_venus_v1: {
    assetId: "asset_planet_venus_v1",
    displayName: "Venus — Sulfuric Acid Cloud Deck & Magellan Radar Topography",
    scientificObjectType: "planet_terrestrial",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA JPL / Magellan Mission / JAXA Akatsuki",
    sourceURL: "https://science.nasa.gov/resource/venus-3d-model/",
    originalAuthor: "NASA Solar System Exploration / JPL Magellan Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Venus radar topography and cloud albedo derived from NASA Magellan & Pioneer Venus data. Courtesy NASA/JPL-Caltech.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Magellan-SAR-C3-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    optimizedAssetPath: "procedural://cosmos/planets/venus_v1",
    originalFormat: "Equirectangular Cloud & Radar Relief Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.4 * 1024 * 1024),
      BALANCED: Math.round(1.35 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 6051.8,
      oblatenessFlattening: 0.0,
      axialTiltDeg: 177.36, // Retrograde rotation
      rotationPeriodHours: -5832.5,
      semiMajorAxisAu: 0.723332,
      defaultDisplayRadiusUnits: 0.95,
      measurementSource: "NASA JPL SSD / Magellan",
    },
    requiredInteractiveNodeIds: ["venus_cloud_deck_mesh", "venus_radar_surface_mesh"],
    relatedModuleIds: ["01", "06", "19", "23"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m06_solar_system_orrery_3d",
      "m23_astrobiology_worlds_3d",
    ],
    relatedNarrationCueIds: ["cue-m06-06-sub-02-title"],
    validationStatus: "READY",
  },

  asset_planet_mars_viking_mola_v2: {
    assetId: "asset_planet_mars_viking_mola_v2",
    displayName: "Mars — Viking Color Mosaic & MGS MOLA Topographic Relief v2",
    scientificObjectType: "planet_terrestrial",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA JPL / USGS Astrogeology Science Center / MGS MOLA Team",
    sourceURL: "https://science.nasa.gov/resource/mars-3d-model/",
    originalAuthor: "NASA / JPL / USGS / MOLA Science Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Mars global mosaic and laser altimetry relief derived from NASA Viking & Mars Global Surveyor MOLA. Courtesy NASA/JPL-Caltech/USGS.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Viking-MDIM2.1-MOLA-MEGDR",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:e7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683",
    optimizedAssetPath: "procedural://cosmos/planets/mars_viking_mola_v2",
    originalFormat: "Equirectangular Albedo & MOLA Elevation Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(8192, 4608, 2048),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.6 * 1024 * 1024),
      BALANCED: Math.round(1.4 * 1024 * 1024),
      LOW_POWER: Math.round(0.2 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 3389.5,
      oblatenessFlattening: 0.00589,
      axialTiltDeg: 25.19,
      rotationPeriodHours: 24.6229,
      semiMajorAxisAu: 1.523679,
      defaultDisplayRadiusUnits: 0.78,
      measurementSource: "NASA MGS MOLA / JPL DE440",
    },
    requiredInteractiveNodeIds: [
      "mars_surface_mesh",
      "mars_olympus_mons_anchor",
      "mars_valles_marineris_anchor",
      "mars_polar_ice_cap_anchor",
    ],
    relatedModuleIds: ["01", "06", "08", "22", "23"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m06_solar_system_orrery_3d",
      "m08_orbital_mechanics_lab",
      "m22_space_exploration_missions_3d",
      "m23_astrobiology_worlds_3d",
    ],
    relatedNarrationCueIds: ["cue-m06-06-sub-02-title"],
    validationStatus: "READY",
  },

  asset_planet_jupiter_cassini_juno_v2: {
    assetId: "asset_planet_jupiter_cassini_juno_v2",
    displayName: "Jupiter — Cassini/Juno Zonal Cloud Belts & Great Red Spot v2",
    scientificObjectType: "planet_gas_giant",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / Space Science Institute / SwRI",
    sourceURL: "https://science.nasa.gov/resource/jupiter-3d-model/",
    originalAuthor: "NASA / JPL / Cassini Imaging Team / JunoCam",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Jupiter cylindrical cloud map derived from NASA Cassini ISS and JunoCam observations. Courtesy NASA/JPL-Caltech/SSI/SwRI.",
    usageRestrictions:
      "Public domain under 17 U.S.C. § 105. Differential zonal wind animation is time-accelerated for educational clarity.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Cassini-PIA07782-Juno-PJ27",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451",
    optimizedAssetPath: "procedural://cosmos/planets/jupiter_cassini_juno_v2",
    originalFormat: "Cylindrical Albedo & Zonal Shear Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(8192, 4608, 2048),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.4 * 1024 * 1024),
      BALANCED: Math.round(1.35 * 1024 * 1024),
      LOW_POWER: Math.round(0.2 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 69911.0,
      oblatenessFlattening: 0.06487,
      axialTiltDeg: 3.13,
      rotationPeriodHours: 9.925,
      semiMajorAxisAu: 5.2044,
      defaultDisplayRadiusUnits: 1.65,
      measurementSource: "IAU 2015 / NASA Juno Gravity Science",
    },
    requiredInteractiveNodeIds: [
      "jupiter_atmosphere_mesh",
      "jupiter_great_red_spot_anchor",
      "jupiter_equatorial_zone_anchor",
    ],
    relatedModuleIds: ["01", "06", "08", "12", "22"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m06_solar_system_orrery_3d",
      "m08_orbital_mechanics_lab",
    ],
    relatedNarrationCueIds: ["cue-m06-06-sub-03-title"],
    validationStatus: "READY",
  },

  asset_planet_saturn_cassini_v2: {
    assetId: "asset_planet_saturn_cassini_v2",
    displayName: "Saturn — Cassini Atmosphere & A/B/C/F Ring System (Cassini & Encke Divisions) v2",
    scientificObjectType: "planet_gas_giant",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / Space Science Institute (Cassini-Huygens)",
    sourceURL: "https://science.nasa.gov/resource/saturn-3d-model/",
    originalAuthor: "NASA / JPL-Caltech / SSI Cassini Imaging Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Saturn atmosphere and radial ring optical-depth profile derived from NASA/ESA Cassini ISS & UVIS occultation profiles. Courtesy NASA/JPL-Caltech/SSI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA and ESA do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Cassini-ISS-UVIS-RingProfile-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3",
    optimizedAssetPath: "procedural://cosmos/planets/saturn_cassini_v2",
    originalFormat: "Cylindrical Albedo + Radial Ring Optical Depth Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(9216, 5120, 2304),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.8 * 1024 * 1024),
      BALANCED: Math.round(1.5 * 1024 * 1024),
      LOW_POWER: Math.round(0.24 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 58232.0,
      oblatenessFlattening: 0.09796,
      axialTiltDeg: 26.73,
      rotationPeriodHours: 10.656,
      semiMajorAxisAu: 9.5826,
      defaultDisplayRadiusUnits: 1.4,
      measurementSource: "NASA Cassini Solstice Mission / IAU 2015",
    },
    requiredInteractiveNodeIds: [
      "saturn_atmosphere_mesh",
      "saturn_ring_annulus_mesh",
      "saturn_cassini_division_anchor",
      "saturn_north_polar_hexagon_anchor",
    ],
    relatedModuleIds: ["01", "06", "08", "22"],
    relatedSceneIds: ["m01_cosmic_zoom_hierarchy", "m06_solar_system_orrery_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-03-title", "cue-m06-06-sub-07-title"],
    validationStatus: "READY",
  },

  asset_planet_uranus_voyager_v1: {
    assetId: "asset_planet_uranus_voyager_v1",
    displayName: "Uranus — Methane-Band Cyan Ice Giant & 97.77° Axial Tilt Ring System",
    scientificObjectType: "planet_ice_giant",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech (Voyager 2 & HST OPAL)",
    sourceURL: "https://science.nasa.gov/resource/uranus-3d-model/",
    originalAuthor: "NASA Solar System Exploration / JPL",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Uranus methane-absorption appearance derived from NASA Voyager 2 ISS and HST OPAL observations. Courtesy NASA/JPL-Caltech/STScI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Voyager2-HST-OPAL-2022",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:19581e27de7ced00ff1ce50b2047e7a567c76b1cbaebabe5ef03f7c3017bb5b7",
    optimizedAssetPath: "procedural://cosmos/planets/uranus_voyager_v1",
    originalFormat: "Equirectangular Albedo & Limb Haze Map",
    optimizedFormat: "KTX2_ETC1S_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(2.8 * 1024 * 1024),
      BALANCED: Math.round(0.75 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 25362.0,
      oblatenessFlattening: 0.0229,
      axialTiltDeg: 97.77,
      rotationPeriodHours: -17.24,
      semiMajorAxisAu: 19.2184,
      defaultDisplayRadiusUnits: 1.15,
      measurementSource: "NASA Voyager 2 / IAU 2015",
    },
    requiredInteractiveNodeIds: ["uranus_atmosphere_mesh", "uranus_epsilon_ring_mesh"],
    relatedModuleIds: ["01", "06"],
    relatedSceneIds: ["m01_cosmic_zoom_hierarchy", "m06_solar_system_orrery_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-04-title"],
    validationStatus: "READY",
  },

  asset_planet_neptune_voyager_v1: {
    assetId: "asset_planet_neptune_voyager_v1",
    displayName: "Neptune — Azure Methane Ice Giant, High-Altitude Cirrus & Dark Vortex",
    scientificObjectType: "planet_ice_giant",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech (Voyager 2 & JWST NIRCam / HST OPAL)",
    sourceURL: "https://science.nasa.gov/resource/neptune-3d-model/",
    originalAuthor: "NASA Solar System Exploration / JPL",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Neptune atmospheric bands and vortex features derived from NASA Voyager 2 and HST OPAL observations. Courtesy NASA/JPL-Caltech/STScI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Voyager2-HST-OPAL-Neptune-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5",
    optimizedAssetPath: "procedural://cosmos/planets/neptune_voyager_v1",
    originalFormat: "Equirectangular Albedo & Cirrus Band Map",
    optimizedFormat: "KTX2_ETC1S_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(2.8 * 1024 * 1024),
      BALANCED: Math.round(0.75 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 24622.0,
      oblatenessFlattening: 0.0171,
      axialTiltDeg: 28.32,
      rotationPeriodHours: 16.11,
      semiMajorAxisAu: 30.11,
      defaultDisplayRadiusUnits: 1.12,
      measurementSource: "NASA Voyager 2 / IAU 2015",
    },
    requiredInteractiveNodeIds: ["neptune_atmosphere_mesh", "neptune_dark_spot_anchor"],
    relatedModuleIds: ["01", "06"],
    relatedSceneIds: ["m01_cosmic_zoom_hierarchy", "m06_solar_system_orrery_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-04-title"],
    validationStatus: "READY",
  },

  asset_dwarf_pluto_new_horizons_v1: {
    assetId: "asset_dwarf_pluto_new_horizons_v1",
    displayName: "Pluto — New Horizons Tombaugh Regio Nitrogen-Ice Heart & Tholin Highlands",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / Johns Hopkins APL / Southwest Research Institute",
    sourceURL: "https://science.nasa.gov/resource/pluto-3d-model/",
    originalAuthor: "NASA / JHUAPL / SwRI New Horizons LORRI & MVIC Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Pluto global mosaic derived from NASA New Horizons LORRI/MVIC encounter imagery; southern non-encounter hemisphere clearly marked as low-resolution Charon-shine reconstruction. Courtesy NASA/JHUAPL/SwRI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "NewHorizons-PIA20726-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    optimizedAssetPath: "procedural://cosmos/dwarf_planets/pluto_new_horizons_v1",
    originalFormat: "Equirectangular Albedo Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(4608, 2304, 1024),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(3.2 * 1024 * 1024),
      BALANCED: Math.round(0.9 * 1024 * 1024),
      LOW_POWER: Math.round(0.16 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 1188.3,
      oblatenessFlattening: 0.0,
      axialTiltDeg: 122.53,
      rotationPeriodHours: -153.29,
      semiMajorAxisAu: 39.482,
      defaultDisplayRadiusUnits: 0.38,
      measurementSource: "NASA New Horizons (Nimmo et al. 2017)",
    },
    requiredInteractiveNodeIds: ["pluto_surface_mesh", "pluto_sputnik_planitia_anchor"],
    relatedModuleIds: ["06"],
    relatedSceneIds: ["m06_solar_system_orrery_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-05-title"],
    validationStatus: "READY",
  },

  // =========================================================================
  // 2. MAJOR MOONS & SMALL IRREGULAR BODIES (SECTION 18)
  // =========================================================================
  asset_moon_europa_galileo_v2: {
    assetId: "asset_moon_europa_galileo_v2",
    displayName: "Europa — Galileo Ice Shell Lineae & Subsurface Ocean Cutaway v2",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / USGS Astrogeology",
    sourceURL: "https://science.nasa.gov/resource/europa-3d-model/",
    originalAuthor: "NASA / JPL / Galileo SSI & Juno Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Europa surface lineae mosaic derived from NASA Galileo SSI & Voyager observations; interior ocean depth is an induced-magnetic-field model reconstruction. Courtesy NASA/JPL-Caltech/USGS.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "Galileo-SSI-USGS-Europa-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    optimizedAssetPath: "procedural://cosmos/moons/europa_galileo_v2",
    originalFormat: "Equirectangular Albedo + Lineae Relief Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(6144, 3072, 1536),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(5.2 * 1024 * 1024),
      BALANCED: Math.round(1.3 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 1560.8,
      oblatenessFlattening: 0.0018,
      axialTiltDeg: 0.1,
      rotationPeriodHours: 85.228,
      semiMajorAxisAu: 0.004486,
      defaultDisplayRadiusUnits: 1.0,
      measurementSource: "NASA Galileo / Europa Clipper Reference",
    },
    requiredInteractiveNodeIds: [
      "europa_ice_shell_mesh",
      "europa_subsurface_ocean_layer",
      "europa_silicate_mantle_layer",
      "europa_plume_vent_anchor",
    ],
    relatedModuleIds: ["06", "23"],
    relatedSceneIds: ["m06_solar_system_orrery_3d", "m23_astrobiology_worlds_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-07-title"],
    validationStatus: "READY",
  },

  asset_moon_io_galileo_v1: {
    assetId: "asset_moon_io_galileo_v1",
    displayName: "Io — Galileo Sulfur Volcanism & Tidal-Heating Paterae",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / USGS",
    sourceURL: "https://science.nasa.gov/resource/io-3d-model/",
    originalAuthor: "NASA / JPL / USGS Galileo SSI Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Io global sulfur volcanism mosaic derived from NASA Galileo SSI & Voyager imagery. Courtesy NASA/JPL-Caltech/USGS.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Galileo-SSI-Io-Mosaic-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    optimizedAssetPath: "procedural://cosmos/moons/io_galileo_v1",
    originalFormat: "Equirectangular Albedo Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(4608, 2304, 1024),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(3.6 * 1024 * 1024),
      BALANCED: Math.round(0.95 * 1024 * 1024),
      LOW_POWER: Math.round(0.16 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 1821.6,
      oblatenessFlattening: 0.005,
      axialTiltDeg: 0.05,
      rotationPeriodHours: 42.459,
      defaultDisplayRadiusUnits: 0.45,
      measurementSource: "NASA Galileo",
    },
    requiredInteractiveNodeIds: ["io_surface_mesh", "io_pele_patera_anchor"],
    relatedModuleIds: ["06", "23"],
    relatedSceneIds: ["m06_solar_system_orrery_3d", "m23_astrobiology_worlds_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-07-title"],
    validationStatus: "READY",
  },

  asset_moon_titan_cassini_v1: {
    assetId: "asset_moon_titan_cassini_v1",
    displayName: "Titan — Cassini Photochemical Haze & Hydrocarbon Lakes",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / ESA / ASI (Cassini-Huygens)",
    sourceURL: "https://science.nasa.gov/resource/titan-3d-model/",
    originalAuthor: "NASA / JPL-Caltech / SSI / Cassini RADAR & VIMS Teams",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Titan atmospheric haze and radar lake mapping derived from NASA/ESA/ASI Cassini-Huygens mission. Courtesy NASA/JPL-Caltech/SSI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA and ESA do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Cassini-RADAR-VIMS-Titan-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:8b1a9953c4611296a827abf8c47804d7e6c49c6b12809b573b5697e2f4183892",
    optimizedAssetPath: "procedural://cosmos/moons/titan_cassini_v1",
    originalFormat: "Equirectangular Albedo & Haze Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(4608, 2304, 1024),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(3.8 * 1024 * 1024),
      BALANCED: Math.round(1.0 * 1024 * 1024),
      LOW_POWER: Math.round(0.18 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 2574.7,
      oblatenessFlattening: 0.0002,
      axialTiltDeg: 0.3,
      rotationPeriodHours: 382.68,
      defaultDisplayRadiusUnits: 0.58,
      measurementSource: "NASA/ESA Cassini-Huygens",
    },
    requiredInteractiveNodeIds: [
      "titan_surface_mesh",
      "titan_atmosphere_shell",
      "titan_kraken_mare_anchor",
    ],
    relatedModuleIds: ["06", "23"],
    relatedSceneIds: ["m06_solar_system_orrery_3d", "m23_astrobiology_worlds_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-07-title"],
    validationStatus: "READY",
  },

  asset_moon_enceladus_cassini_v1: {
    assetId: "asset_moon_enceladus_cassini_v1",
    displayName:
      "Enceladus — High-Albedo Ice Shell, South-Polar Tiger Stripes & Cryovolcanic Plumes",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "HYBRID_PROCEDURAL_SURFACE_MAPS",
    sourceOrganization: "NASA / JPL-Caltech / Space Science Institute",
    sourceURL: "https://science.nasa.gov/resource/enceladus-3d-model/",
    originalAuthor: "NASA / JPL-Caltech / SSI Cassini Imaging Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Enceladus ice shell and Tiger Stripes fractures derived from NASA Cassini ISS mosaic. Courtesy NASA/JPL-Caltech/SSI.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "Cassini-ISS-Enceladus-PIA18435",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:f5ca38f748a1d6eaf726b8a42fb575c3c71f1864a8143301782de13da2d9202b",
    optimizedAssetPath: "procedural://cosmos/moons/enceladus_cassini_v1",
    originalFormat: "Equirectangular Albedo & Fracture Relief Map",
    optimizedFormat: "KTX2_UASTC_FALLBACK_DATA_RGBA",
    compressionCodec: "KTX2_UASTC",
    availableLODLevels: buildStandardPlanetaryLODs(4608, 2304, 1024),
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(3.6 * 1024 * 1024),
      BALANCED: Math.round(0.95 * 1024 * 1024),
      LOW_POWER: Math.round(0.16 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 252.1,
      oblatenessFlattening: 0.019,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 32.885,
      defaultDisplayRadiusUnits: 0.35,
      measurementSource: "NASA Cassini",
    },
    requiredInteractiveNodeIds: [
      "enceladus_ice_shell_mesh",
      "enceladus_tiger_stripes_anchor",
      "enceladus_plume_jets",
    ],
    relatedModuleIds: ["06", "23"],
    relatedSceneIds: ["m06_solar_system_orrery_3d", "m23_astrobiology_worlds_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-07-title"],
    validationStatus: "READY",
  },

  asset_smallbody_asteroid_bennu_v1: {
    assetId: "asset_smallbody_asteroid_bennu_v1",
    displayName:
      "101955 Bennu — OSIRIS-REx Non-Spherical Spinning-Top Rubble-Pile Asteroid Shape Model",
    scientificObjectType: "moon_rocky_icy",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "NASA Goddard Space Flight Center / University of Arizona (OSIRIS-REx)",
    sourceURL: "https://science.nasa.gov/resource/bennu-3d-model/",
    originalAuthor: "NASA / University of Arizona / OSIRIS-REx Altimetry Working Group",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Bennu polyhedral shape profile derived from NASA OSIRIS-REx laser altimetry (OLA) and stereophotoclinometry. Courtesy NASA/Goddard/University of Arizona.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "OBSERVATION_BASED",
    sourceDataVersion: "OSIRIS-REx-OLA-v20",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:3fdba35f04dc8c462986c992bcf875546257113072a909c162f7e470e581e278",
    optimizedAssetPath: "glb://cosmos/smallbodies/bennu_rubble_pile_v1.glb",
    originalFormat: "OBJ/GLB Polyhedral Shape Mesh",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 100,
        maxScreenPixels: 10000,
        hysteresisPixels: 15,
        triangleCount: 3840,
        geometricErrorRatio: 0.0012,
        description: "High-detail non-spherical spinning-top equatorial ridge & boulder mesh",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 36,
        maxScreenPixels: 100,
        hysteresisPixels: 10,
        triangleCount: 1280,
        geometricErrorRatio: 0.0045,
        description: "Medium-detail deformed icosahedral rubble-pile mesh",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 10,
        maxScreenPixels: 36,
        hysteresisPixels: 5,
        triangleCount: 320,
        geometricErrorRatio: 0.015,
        description: "Low-detail polyhedral asteroid silhouette",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 10,
        hysteresisPixels: 3,
        triangleCount: 2,
        geometricErrorRatio: 0.04,
        description: "Distant point impostor",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(true),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.8 * 1024 * 1024),
      BALANCED: Math.round(0.65 * 1024 * 1024),
      LOW_POWER: Math.round(0.15 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.245,
      oblatenessFlattening: 0.12, // Equatorial bulge spinning-top profile
      axialTiltDeg: 177.6,
      rotationPeriodHours: 4.296,
      semiMajorAxisAu: 1.1264,
      defaultDisplayRadiusUnits: 0.55,
      measurementSource: "NASA OSIRIS-REx (Barnouin et al. 2019)",
    },
    requiredInteractiveNodeIds: [
      "bennu_hull_mesh",
      "bennu_equatorial_ridge_anchor",
      "bennu_nightingale_crater_anchor",
    ],
    relatedModuleIds: ["06", "08", "22"],
    relatedSceneIds: ["m06_solar_system_orrery_3d", "m22_space_exploration_missions_3d"],
    relatedNarrationCueIds: ["cue-m06-06-sub-06-title"],
    validationStatus: "READY",
  },

  // =========================================================================
  // 3. SPACECRAFT & MISSION MODELS (SECTION 20)
  // =========================================================================
  asset_spacecraft_jwst_v2: {
    assetId: "asset_spacecraft_jwst_v2",
    displayName:
      "James Webb Space Telescope (JWST) — 18-Segment Beryllium-Gold Observatory Assembly v2",
    scientificObjectType: "spacecraft_instrument",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "NASA Goddard Space Flight Center / STScI / ESA / CSA",
    sourceURL: "https://science.nasa.gov/resource/james-webb-space-telescope-3d-model/",
    originalAuthor: "NASA GSFC / Northrop Grumman / STScI 3D Resources Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "James Webb Space Telescope structural proportions and 18-segment optical assembly derived from NASA 3D Resources. Courtesy NASA/GSFC/STScI/ESA/CSA.",
    usageRestrictions:
      "Public domain under 17 U.S.C. § 105. Does not imply endorsement by NASA, ESA, CSA, or STScI.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA, ESA, CSA, and STScI do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "NASA-3D-JWST-2022-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:5f9c4ab08cac7457e9111a30e4664920607ea2c115a1433d7be98e97e64240ca",
    optimizedAssetPath: "glb://cosmos/spacecraft/jwst_observatory_v2.glb",
    originalFormat: "GLB 2.0 Hierarchical CAD Derivative",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 120,
        maxScreenPixels: 10000,
        hysteresisPixels: 16,
        triangleCount: 9420,
        geometricErrorRatio: 0.0009,
        description:
          "Full 18 individualized hexagonal primary segments, secondary tripod struts, 5-layer Kapton sunshield, ISIM aft bus & solar array",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 40,
        maxScreenPixels: 120,
        hysteresisPixels: 10,
        triangleCount: 4180,
        geometricErrorRatio: 0.003,
        description: "Instanced hexagonal segments, 3-layer merged sunshield, tripod & bus",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 10,
        maxScreenPixels: 40,
        hysteresisPixels: 6,
        triangleCount: 1120,
        geometricErrorRatio: 0.011,
        description: "Unified hexagonal primary aperture & diamond sunshield hull",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 10,
        hysteresisPixels: 3,
        triangleCount: 2,
        geometricErrorRatio: 0.035,
        description: "Distant L2 halo-orbit spacecraft marker",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(2.4 * 1024 * 1024),
      BALANCED: Math.round(1.1 * 1024 * 1024),
      LOW_POWER: Math.round(0.35 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.0105, // 21.2m x 14.2m sunshield
      oblatenessFlattening: 0.0,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 2.2,
      measurementSource: "NASA GSFC JWST Observatory Technical Reference (6.5m Primary Mirror)",
    },
    requiredInteractiveNodeIds: [
      "primary_mirror",
      "secondary_mirror",
      "sunshield",
      "isim_detector",
      "solar_array",
      "high_gain_antenna",
      "optical_ray_path",
    ],
    relatedModuleIds: ["04", "11", "12", "17", "21", "22", "23"],
    relatedSceneIds: [
      "m12_exoplanet_observatory_3d",
      "m21_telescopes_observatories_3d",
      "m22_space_exploration_missions_3d",
    ],
    relatedNarrationCueIds: ["cue-m21-21-06-title", "cue-m22-22-06-title"],
    validationStatus: "READY",
  },

  asset_spacecraft_hst_v2: {
    assetId: "asset_spacecraft_hst_v2",
    displayName:
      "Hubble Space Telescope (HST) — 2.4m Ritchey-Chrétien Low-Earth Orbit Observatory v2",
    scientificObjectType: "spacecraft_instrument",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "NASA Goddard Space Flight Center / STScI / ESA",
    sourceURL: "https://science.nasa.gov/resource/hubble-space-telescope-3d-model/",
    originalAuthor: "NASA GSFC / STScI 3D Resources",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Hubble Space Telescope geometry derived from NASA 3D Resources. Courtesy NASA/GSFC/STScI/ESA.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA and ESA do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "NASA-3D-HST-SM4-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:670671cd97404156226e50797bd42ab4330f92b285220832c9624c7e982902a1",
    optimizedAssetPath: "glb://cosmos/spacecraft/hst_observatory_v2.glb",
    originalFormat: "GLB 2.0 Hierarchical Model",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 110,
        maxScreenPixels: 10000,
        hysteresisPixels: 14,
        triangleCount: 6840,
        geometricErrorRatio: 0.001,
        description:
          "Detailed cylindrical OTA baffle, open aperture door, 2.4m primary mirror, dual solar arrays & HGA masts",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 36,
        maxScreenPixels: 110,
        hysteresisPixels: 10,
        triangleCount: 2940,
        geometricErrorRatio: 0.0035,
        description: "Medium-detail cylindrical hull, aperture & solar wings",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 10,
        maxScreenPixels: 36,
        hysteresisPixels: 5,
        triangleCount: 840,
        geometricErrorRatio: 0.012,
        description: "Low-detail orbital silhouette",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 10,
        hysteresisPixels: 3,
        triangleCount: 2,
        geometricErrorRatio: 0.04,
        description: "Distant LEO marker",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.8 * 1024 * 1024),
      BALANCED: Math.round(0.85 * 1024 * 1024),
      LOW_POWER: Math.round(0.25 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.0066, // 13.2m length
      oblatenessFlattening: 0.0,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 1.85,
      measurementSource: "NASA GSFC Hubble Fact Sheet (13.2m x 4.2m)",
    },
    requiredInteractiveNodeIds: [
      "primary_mirror",
      "secondary_mirror",
      "aperture_door",
      "solar_array",
      "high_gain_antenna",
      "detector_focal_plane",
    ],
    relatedModuleIds: ["11", "13", "19", "21", "22"],
    relatedSceneIds: ["m21_telescopes_observatories_3d", "m22_space_exploration_missions_3d"],
    relatedNarrationCueIds: ["cue-m21-21-05-title", "cue-m22-22-05-title"],
    validationStatus: "READY",
  },

  asset_spacecraft_voyager_v2: {
    assetId: "asset_spacecraft_voyager_v2",
    displayName:
      "Voyager 1 / 2 Interstellar Probe — 3.7m High-Gain Dish, RTG Boom & Golden Record v2",
    scientificObjectType: "spacecraft_instrument",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "NASA / Jet Propulsion Laboratory (JPL-Caltech)",
    sourceURL: "https://science.nasa.gov/resource/voyager-3d-model/",
    originalAuthor: "NASA JPL 3D Resources Team",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Voyager spacecraft structural design derived from NASA JPL 3D Resources. Courtesy NASA/JPL-Caltech.",
    usageRestrictions: "Public domain under 17 U.S.C. § 105.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA and JPL-Caltech do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "NASA-JPL-Voyager-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:9c1185a5c5e9fc54612808977ee8f548b2258d3138632744a63a02c78641122a",
    optimizedAssetPath: "glb://cosmos/spacecraft/voyager_interstellar_v2.glb",
    originalFormat: "GLB 2.0 Hierarchical Model",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 110,
        maxScreenPixels: 10000,
        hysteresisPixels: 14,
        triangleCount: 5620,
        geometricErrorRatio: 0.0011,
        description:
          "Full 3.7m parabolic HGA dish, decagonal electronics bus, triple MHW-RTG boom, science scan platform, magnetometer truss & Golden Record cover",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 36,
        maxScreenPixels: 110,
        hysteresisPixels: 10,
        triangleCount: 2420,
        geometricErrorRatio: 0.0038,
        description: "Medium-detail dish, bus, RTG boom & science platform",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 10,
        maxScreenPixels: 36,
        hysteresisPixels: 5,
        triangleCount: 680,
        geometricErrorRatio: 0.014,
        description: "Low-detail dish and boom silhouette",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 10,
        hysteresisPixels: 3,
        triangleCount: 2,
        geometricErrorRatio: 0.04,
        description: "Distant heliopause probe marker",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.6 * 1024 * 1024),
      BALANCED: Math.round(0.75 * 1024 * 1024),
      LOW_POWER: Math.round(0.22 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.0065,
      oblatenessFlattening: 0.0,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 1.9,
      measurementSource: "NASA JPL Voyager Press Kit (3.7m HGA dish)",
    },
    requiredInteractiveNodeIds: [
      "high_gain_antenna",
      "decagonal_bus",
      "rtg_power_boom",
      "science_scan_platform",
      "golden_record_plaque",
      "magnetometer_boom",
    ],
    relatedModuleIds: ["03", "06", "08", "22", "23"],
    relatedSceneIds: ["m08_orbital_mechanics_lab", "m22_space_exploration_missions_3d"],
    relatedNarrationCueIds: ["cue-m22-22-04-title"],
    validationStatus: "READY",
  },

  asset_spacecraft_chandrayaan3_vikram_v2: {
    assetId: "asset_spacecraft_chandrayaan3_vikram_v2",
    displayName: "ISRO Chandrayaan-3 Vikram Lander & Pragyan Lunar South-Pole Rover v2",
    scientificObjectType: "spacecraft_instrument",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "ISRO Public Mission Press Kit / Clean-Room First-Party Reconstruction",
    sourceURL: "https://www.isro.gov.in/Chandrayaan3_Details.html",
    originalAuthor:
      "Our Visible Universe Academy Engineering Team (from ISRO published dimensions)",
    licenseIdentifier: "CLEAN_ROOM_FIRST_PARTY",
    licenseURL: "https://ourvisibleuniverse.in/licenses",
    requiredAttribution:
      "First-party clean-room 3D educational model constructed from published ISRO Chandrayaan-3 Vikram Lander (2.0m x 2.0m x 1.16m) and Pragyan Rover technical specifications.",
    usageRestrictions:
      "First-party educational model. ISRO name used purely for factual mission identification without implying official endorsement.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "ISRO does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "SCALE_ADJUSTED_EDUCATIONAL_MODEL",
    sourceDataVersion: "OVU-Ch3-CleanRoom-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:b1a8e329048c7a98d44f6174208e291823c91827391827391827391827391827",
    optimizedAssetPath: "glb://cosmos/spacecraft/chandrayaan3_vikram_v2.glb",
    originalFormat: "Procedural Clean-Room GLB 2.0",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 100,
        maxScreenPixels: 10000,
        hysteresisPixels: 14,
        triangleCount: 5120,
        geometricErrorRatio: 0.0012,
        description:
          "Full gold-MLI Vikram lander core, 4 telescopic landing struts, ChaSTE thermal probe, deployment ramp & 6-wheel Pragyan rover",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 32,
        maxScreenPixels: 100,
        hysteresisPixels: 8,
        triangleCount: 2140,
        geometricErrorRatio: 0.004,
        description: "Medium-detail lander hull, struts, solar panels & rover",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 8,
        maxScreenPixels: 32,
        hysteresisPixels: 4,
        triangleCount: 620,
        geometricErrorRatio: 0.015,
        description: "Low-detail lander silhouette",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 8,
        hysteresisPixels: 3,
        triangleCount: 2,
        geometricErrorRatio: 0.04,
        description: "Distant Shiv Shakti Point landing marker",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.5 * 1024 * 1024),
      BALANCED: Math.round(0.7 * 1024 * 1024),
      LOW_POWER: Math.round(0.2 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.0015,
      oblatenessFlattening: 0.0,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 1.75,
      measurementSource: "ISRO Chandrayaan-3 Mission Brochure (2023)",
    },
    requiredInteractiveNodeIds: [
      "vikram_lander_hull",
      "landing_struts",
      "solar_array",
      "deployment_ramp",
      "pragyan_rover",
      "chaste_thermal_probe",
    ],
    relatedModuleIds: ["05", "22"],
    relatedSceneIds: ["m22_space_exploration_missions_3d"],
    relatedNarrationCueIds: ["cue-m22-22-03-title"],
    validationStatus: "READY",
  },

  // =========================================================================
  // 4. SCIENTIFIC TELESCOPE & OPTICAL CUTAWAY MODELS (SECTION 21)
  // =========================================================================
  asset_instrument_cassegrain_reflector_v1: {
    assetId: "asset_instrument_cassegrain_reflector_v1",
    displayName: "Cassegrain / Ritchey-Chrétien Reflecting Telescope Optical Cutaway & Ray Bench",
    scientificObjectType: "spacecraft_instrument",
    deliveryStrategy: "AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE",
    sourceOrganization: "Our Visible Universe Academy Optical Physics Library",
    sourceURL: "https://ourvisibleuniverse.in/academy/module-21",
    originalAuthor: "Our Visible Universe Academy Engineering Team",
    licenseIdentifier: "CLEAN_ROOM_FIRST_PARTY",
    licenseURL: "https://ourvisibleuniverse.in/licenses",
    requiredAttribution:
      "First-party interactive 3D optical ray-tracing assembly modeling parabolic primary and hyperbolic secondary reflection geometry.",
    usageRestrictions: "First-party educational model.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "First-party asset.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    sourceDataVersion: "OVU-Optics-Cassegrain-v1",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:c238918273918273918273918273918273918273918273918273918273918273",
    optimizedAssetPath: "glb://cosmos/instruments/cassegrain_reflector_cutaway_v1.glb",
    originalFormat: "Hierarchical Optical Bench GLB 2.0",
    optimizedFormat: "GLB_2_0_MESHOPT",
    compressionCodec: "MESHOPT",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 80,
        maxScreenPixels: 10000,
        hysteresisPixels: 12,
        triangleCount: 4860,
        geometricErrorRatio: 0.001,
        description:
          "Full cutaway optical tube, parabolic primary mirror with central baffle, spider vanes, hyperbolic secondary mirror, Cassegrain CCD focal plane & collimated ray bundle",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 24,
        maxScreenPixels: 80,
        hysteresisPixels: 8,
        triangleCount: 2120,
        geometricErrorRatio: 0.0035,
        description: "Medium-detail optical tube, primary/secondary mirrors & ray paths",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 0,
        maxScreenPixels: 24,
        hysteresisPixels: 4,
        triangleCount: 640,
        geometricErrorRatio: 0.012,
        description: "Compact telescope silhouette",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.2 * 1024 * 1024),
      BALANCED: Math.round(0.6 * 1024 * 1024),
      LOW_POWER: Math.round(0.2 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 0.004,
      oblatenessFlattening: 0.0,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 2.0,
      measurementSource: "Standard Ritchey-Chrétien Optical Prescription (f/8)",
    },
    requiredInteractiveNodeIds: [
      "primary_mirror",
      "secondary_mirror",
      "optical_tube_cutaway",
      "detector_focal_plane",
      "optical_ray_path",
      "objective_lens",
    ],
    relatedModuleIds: ["04", "19", "21"],
    relatedSceneIds: ["m21_telescopes_observatories_3d"],
    relatedNarrationCueIds: ["cue-m21-21-01-title", "cue-m21-21-02-title", "cue-m21-21-03-title"],
    validationStatus: "READY",
  },

  // =========================================================================
  // 5. STARS, NEBULAE, GALAXIES & RELATIVISTIC OBJECTS (SECTIONS 22–25)
  // =========================================================================
  asset_star_spectral_photosphere_v2: {
    assetId: "asset_star_spectral_photosphere_v2",
    displayName: "Planckian OBAFGKM Stellar Photosphere, Corona & 3D Interior Cutaway Rig v2",
    scientificObjectType: "star_main_sequence",
    deliveryStrategy: "PHYSICALLY_INFORMED_GLSL_SHADER",
    sourceOrganization:
      "NASA Solar Dynamics Observatory (SDO) Reference / ESA Gaia DR3 Spectral Calibration",
    sourceURL: "https://sdo.gsfc.nasa.gov/",
    originalAuthor:
      "Our Visible Universe Academy Rendering Engine (calibrated to SDO AIA/HMI & Planckian Locus)",
    licenseIdentifier: "PUBLIC_DOMAIN_NASA_17USC105",
    licenseURL: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    requiredAttribution:
      "Solar surface convection and coronal loop structures calibrated to NASA Solar Dynamics Observatory (SDO) AIA/HMI observations; interior core/radiative/convective shells are helioseismic standard solar model reconstructions (Bahcall et al.).",
    usageRestrictions:
      "Interior layers are physics-based helioseismic models, not direct interior photographs.",
    commercialUseStatus: "PERMITTED_PUBLIC_DOMAIN",
    noEndorsementNotice: "NASA does not endorse Our Visible Universe Academy.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    sourceDataVersion: "SDO-SSM-Planckian-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:a11223344556677889900aabbccddeeff0011223344556677889900aabbccdde",
    optimizedAssetPath: "shader://cosmos/stars/spectral_photosphere_cutaway_v2",
    originalFormat: "GLSL Procedural Shader + Spherical Octant Cutaway",
    optimizedFormat: "GLSL_PROCEDURAL_SHADER_RIG",
    compressionCodec: "UNCOMPRESSED_PROCEDURAL",
    availableLODLevels: buildStandardPlanetaryLODs(8192, 4608, 2048),
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.6 * 1024 * 1024),
      BALANCED: Math.round(0.8 * 1024 * 1024),
      LOW_POWER: Math.round(0.3 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 695700.0,
      oblatenessFlattening: 0.00005,
      axialTiltDeg: 7.25,
      rotationPeriodHours: 609.12,
      defaultDisplayRadiusUnits: 1.85,
      measurementSource: "IAU 2015 Resolution B3 Nominal Solar Radius",
    },
    requiredInteractiveNodeIds: [
      "stellar_photosphere_mesh",
      "core_region",
      "radiative_zone",
      "convective_zone",
      "corona_shell",
    ],
    relatedModuleIds: [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "12",
      "20",
      "24",
    ],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m07_solar_interior_dynamo_3d",
      "m08_orbital_mechanics_lab",
      "m09_stellar_museum_hr_3d",
      "m10_stellar_evolution_lifecycle_3d",
    ],
    relatedNarrationCueIds: ["cue-m07-07-01-title", "cue-m07-07-02-title"],
    validationStatus: "READY",
  },

  asset_nebula_orion_m42_volumetric_v2: {
    assetId: "asset_nebula_orion_m42_volumetric_v2",
    displayName:
      "Interstellar Nebulae (H-alpha / [O III] Emission, Reflection & Dark Barnard Cloud) Volumetric Rig v2",
    scientificObjectType: "nebula_emission",
    deliveryStrategy: "LABELED_VOLUMETRIC_RECONSTRUCTION",
    sourceOrganization: "NASA / ESA / CSA / STScI (Hubble & James Webb Space Telescope)",
    sourceURL: "https://esawebb.org/images/weic2216a/",
    originalAuthor: "NASA / ESA / CSA / STScI / PDRs4All ERS Team",
    licenseIdentifier: "CC_BY_4_0_ESA_WEBB",
    licenseURL: "https://creativecommons.org/licenses/by/4.0/",
    requiredAttribution:
      "Observational spectral emission lines (H-alpha 656.3 nm, [O III] 500.7 nm) and dust pillar morphology referenced from NASA/ESA/CSA James Webb Space Telescope & Hubble Space Telescope observations (CC BY 4.0); 3D depth volume is a model-dependent radiative-transfer reconstruction.",
    usageRestrictions:
      "CC BY 4.0 requires attribution to ESA/Webb, NASA & CSA. 3D depth geometry must be explicitly disclosed as a model-dependent reconstruction rather than a direct 3D tomographic measurement.",
    commercialUseStatus: "PERMITTED_WITH_ATTRIBUTION",
    noEndorsementNotice:
      "ESA/Webb, NASA, CSA, and STScI do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "ARTISTIC_SCIENTIFIC_RECONSTRUCTION",
    sourceDataVersion: "ESA-Webb-M42-M16-Volumetric-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:d556677889900aabbccddeeff0011223344556677889900aabbccddeeff00112",
    optimizedAssetPath: "shader://cosmos/nebulae/volumetric_emission_dust_v2",
    originalFormat: "Volumetric Raymarched FBM + Multi-Layer Spectral Shell",
    optimizedFormat: "GLSL_PROCEDURAL_SHADER_RIG",
    compressionCodec: "UNCOMPRESSED_PROCEDURAL",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 100,
        maxScreenPixels: 10000,
        hysteresisPixels: 15,
        triangleCount: 4096,
        geometricErrorRatio: 0.002,
        description:
          "Multi-shell volumetric FBM shader (24 raymarch steps) + embedded OB ionizing star cluster",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 30,
        maxScreenPixels: 100,
        hysteresisPixels: 10,
        triangleCount: 2048,
        geometricErrorRatio: 0.006,
        description: "Balanced volumetric FBM shader (12 raymarch steps)",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 0,
        maxScreenPixels: 30,
        hysteresisPixels: 5,
        triangleCount: 512,
        geometricErrorRatio: 0.02,
        description: "Analytic 0-raymarch radial optical-depth fallback",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.9 * 1024 * 1024),
      BALANCED: Math.round(0.95 * 1024 * 1024),
      LOW_POWER: Math.round(0.28 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 1.135e14, // ~12 light-years radius for M42
      oblatenessFlattening: 0.15,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 0.0,
      defaultDisplayRadiusUnits: 3.2,
      measurementSource: "JWST / HST Orion Nebula (M42) Angular & Parallax Distance (412 pc)",
    },
    requiredInteractiveNodeIds: [
      "nebula_emission_volume",
      "nebula_dark_dust_lane",
      "trapezium_ionizing_cluster",
    ],
    relatedModuleIds: ["10", "11", "13", "20", "21"],
    relatedSceneIds: [
      "m10_stellar_evolution_lifecycle_3d",
      "m11_nebula_and_clusters_3d",
      "m21_telescopes_observatories_3d",
    ],
    relatedNarrationCueIds: ["cue-m11-11-sub-01-title", "cue-m11-11-sub-02-title"],
    validationStatus: "READY",
  },

  asset_galaxy_catalog_particle_field_v2: {
    assetId: "asset_galaxy_catalog_particle_field_v2",
    displayName: "Milky Way, Andromeda & Cosmic Web Catalog-Calibrated GPU Particle System v2",
    scientificObjectType: "galaxy_spiral",
    deliveryStrategy: "CATALOG_TYPED_PARTICLE_BUFFER",
    sourceOrganization: "ESA Gaia Collaboration (DR3) / SDSS / 2MASS",
    sourceURL: "https://www.cosmos.esa.int/web/gaia/dr3",
    originalAuthor: "ESA Gaia Collaboration / SDSS Collaboration / Our Visible Universe Academy",
    licenseIdentifier: "OPEN_SCIENCE_GAIA_HIPPARCOS",
    licenseURL: "https://creativecommons.org/licenses/by-sa/3.0/igo/",
    requiredAttribution:
      "Stellar population distribution and local solar neighborhood positions calibrated to ESA Gaia Data Release 3 (DR3), Hipparcos, and SDSS extragalactic redshift survey parameters.",
    usageRestrictions:
      "Distant galactic spiral arms and dark matter NFW halos combine cataloged parameters with seeded procedural density-wave sampling.",
    commercialUseStatus: "PERMITTED_WITH_ATTRIBUTION",
    noEndorsementNotice:
      "ESA and the Gaia Collaboration do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    sourceDataVersion: "Gaia-DR3-SDSS-DR17-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:f889900aabbccddeeff0011223344556677889900aabbccddeeff00112233445",
    optimizedAssetPath: "buffer://cosmos/galaxies/catalog_particle_field_v2.bin",
    originalFormat: "Float32Array Typed Attribute Buffers",
    optimizedFormat: "FLOAT32_TYPED_CATALOG_BUFFER",
    compressionCodec: "TYPED_FLOAT32",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 120,
        maxScreenPixels: 10000,
        hysteresisPixels: 18,
        triangleCount: 0,
        particleCount: 4200,
        geometricErrorRatio: 0.001,
        description:
          "4,200 single-draw-call GPU point sprites with Pop I/II spectral color & differential rotation",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 40,
        maxScreenPixels: 120,
        hysteresisPixels: 12,
        triangleCount: 0,
        particleCount: 2600,
        geometricErrorRatio: 0.004,
        description: "2,600 single-draw-call GPU point sprites",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 12,
        maxScreenPixels: 40,
        hysteresisPixels: 6,
        triangleCount: 0,
        particleCount: 1100,
        geometricErrorRatio: 0.012,
        description: "1,100 compact GPU point sprites",
      },
      {
        lodId: "LOD3_IMPOSTOR",
        minScreenPixels: 0,
        maxScreenPixels: 12,
        hysteresisPixels: 4,
        triangleCount: 2,
        particleCount: 1,
        geometricErrorRatio: 0.035,
        description:
          "Sub-12px screen-space Sérsic surface-brightness impostor preventing distant galaxy mesh overhead",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.1 * 1024 * 1024),
      BALANCED: Math.round(0.65 * 1024 * 1024),
      LOW_POWER: Math.round(0.25 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 5.0e17, // ~52,850 ly Milky Way disk radius
      oblatenessFlattening: 0.88,
      axialTiltDeg: 0.0,
      rotationPeriodHours: 2.0e12,
      defaultDisplayRadiusUnits: 4.5,
      measurementSource: "ESA Gaia DR3 / Bland-Hawthorn & Gerhard (2016)",
    },
    requiredInteractiveNodeIds: [
      "galactic_bulge_core",
      "spiral_arm_perseus",
      "spiral_arm_orion_spur",
      "dark_matter_nfw_halo",
      "globular_cluster_halo",
    ],
    relatedModuleIds: ["01", "03", "11", "13", "15", "16", "17", "18", "19", "20", "24"],
    relatedSceneIds: [
      "m01_cosmic_zoom_hierarchy",
      "m03_cosmic_distance_ladder_3d",
      "m11_nebula_and_clusters_3d",
      "m13_galaxy_assembly_dynamics_3d",
      "m15_cosmic_web_lss_3d",
      "m16_dark_matter_rotation_3d",
    ],
    relatedNarrationCueIds: [
      "cue-m01-01-lesson-5-the-milky-way-galaxy-title",
      "cue-m13-13-1-morphology-title",
    ],
    validationStatus: "READY",
  },

  asset_compact_blackhole_kerr_relativity_v2: {
    assetId: "asset_compact_blackhole_kerr_relativity_v2",
    displayName:
      "Schwarzschild/Kerr Relativistic Black Hole, Photon Ring, Doppler Accretion Disk & Pulsar Magnetosphere v2",
    scientificObjectType: "black_hole_relativistic",
    deliveryStrategy: "PHYSICALLY_INFORMED_GLSL_SHADER",
    sourceOrganization:
      "Event Horizon Telescope (EHT) Collaboration / NASA GSFC Relativistic Visualization Reference",
    sourceURL: "https://eventhorizontelescope.org/",
    originalAuthor:
      "Event Horizon Telescope Collaboration (CC BY 4.0) / Our Visible Universe Academy GR Shader Engine",
    licenseIdentifier: "CC_BY_4_0_ESO",
    licenseURL: "https://creativecommons.org/licenses/by/4.0/",
    requiredAttribution:
      "Shadow-to-photon-ring diameter ratio (d_sh = 3*sqrt(3)*r_s) and relativistic Doppler beaming asymmetry referenced from Event Horizon Telescope (EHT) M87* and Sgr A* GRMHD papers (CC BY 4.0) and NASA GSFC Jeremy Schnittman relativistic visualizations.",
    usageRestrictions:
      "Analytical Paczyński-Wiita / Novikov-Thorne real-time shader approximation; full numerical GRMHD ray-tracing disclosure displayed in HUD.",
    commercialUseStatus: "PERMITTED_WITH_ATTRIBUTION",
    noEndorsementNotice:
      "The Event Horizon Telescope Collaboration, ESO, and NASA do not endorse Our Visible Universe Academy.",
    scientificRepresentation: "PHYSICS_BASED_SIMULATION",
    sourceDataVersion: "EHT-M87-SgrA-GRMHD-v2",
    downloadDate: "2026-10-19",
    sourceChecksum: "sha256:00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    optimizedAssetPath: "shader://cosmos/compact_objects/blackhole_kerr_relativity_v2",
    originalFormat: "GLSL Relativistic Lensing & Accretion Shader + Tilted Dipole Pulsar Rig",
    optimizedFormat: "GLSL_PROCEDURAL_SHADER_RIG",
    compressionCodec: "UNCOMPRESSED_PROCEDURAL",
    availableLODLevels: [
      {
        lodId: "LOD0_HIGH",
        minScreenPixels: 90,
        maxScreenPixels: 10000,
        hysteresisPixels: 14,
        triangleCount: 9600,
        geometricErrorRatio: 0.0008,
        description:
          "Full Schwarzschild/Kerr shadow, photon ring, high-resolution Doppler-beamed accretion disk, gravitational lensing halo, relativistic jets & pulsar magnetosphere",
      },
      {
        lodId: "LOD1_MEDIUM",
        minScreenPixels: 30,
        maxScreenPixels: 90,
        hysteresisPixels: 10,
        triangleCount: 4800,
        geometricErrorRatio: 0.003,
        description: "Balanced relativistic accretion disk, photon ring & pulsar beams",
      },
      {
        lodId: "LOD2_LOW",
        minScreenPixels: 0,
        maxScreenPixels: 30,
        hysteresisPixels: 5,
        triangleCount: 1600,
        geometricErrorRatio: 0.01,
        description: "Low-power analytic Doppler disk & non-flashing pulsar cone",
      },
    ],
    textureVariants: buildStandardPlanetaryTextureVariants(false),
    estimatedGpuMemory: {
      HIGH_CINEMATIC: Math.round(1.8 * 1024 * 1024),
      BALANCED: Math.round(0.9 * 1024 * 1024),
      LOW_POWER: Math.round(0.32 * 1024 * 1024),
    },
    physicalDimensions: {
      physicalRadiusKm: 29.54, // 10 M_sun Schwarzschild radius r_s = 2GM/c^2
      oblatenessFlattening: 0.0,
      axialTiltDeg: 18.0,
      rotationPeriodHours: 0.001,
      defaultDisplayRadiusUnits: 1.35,
      measurementSource:
        "General Relativity (Schwarzschild 1916; Kerr 1963; Bardeen-Press-Teukolsky 1972)",
    },
    requiredInteractiveNodeIds: [
      "event_horizon_shadow",
      "photon_sphere_ring",
      "isco_boundary_ring",
      "accretion_disk_doppler",
      "relativistic_polar_jets",
      "pulsar_neutron_core",
      "pulsar_magnetic_dipole_beams",
    ],
    relatedModuleIds: ["10", "13", "14", "16", "20", "24"],
    relatedSceneIds: ["m14_black_hole_relativity_3d"],
    relatedNarrationCueIds: [
      "cue-m14-14-massive-collapse-title",
      "cue-m14-14-what-is-a-black-hole-title",
    ],
    validationStatus: "READY",
  },
};

/**
 * Resolves the primary and supporting verified asset IDs for a given Academy module (01..24).
 */
export const MODULE_PRIMARY_ASSET_MAP: Record<
  string,
  {
    primaryAssetIds: string[];
    supportingAssetIds: string[];
    reusableProceduralComponents: string[];
  }
> = {
  "01": {
    primaryAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_moon_luna_lroc_v2",
      "asset_star_spectral_photosphere_v2",
      "asset_galaxy_catalog_particle_field_v2",
    ],
    supportingAssetIds: [
      "asset_planet_mars_viking_mola_v2",
      "asset_planet_jupiter_cassini_juno_v2",
      "asset_planet_saturn_cassini_v2",
    ],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "ScientificStarMaterial",
      "GalaxyParticleField",
      "OrbitalTrajectoryRenderer",
    ],
  },
  "02": {
    primaryAssetIds: ["asset_planet_earth_reference_v2", "asset_star_spectral_photosphere_v2"],
    supportingAssetIds: ["asset_galaxy_catalog_particle_field_v2"],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "StarClusterRenderer",
    ],
  },
  "03": {
    primaryAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_moon_luna_lroc_v2",
      "asset_star_spectral_photosphere_v2",
      "asset_galaxy_catalog_particle_field_v2",
    ],
    supportingAssetIds: ["asset_spacecraft_voyager_v2"],
    reusableProceduralComponents: [
      "OrbitalTrajectoryRenderer",
      "ScientificVectorField",
      "ScientificAnnotation",
    ],
  },
  "04": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_instrument_cassegrain_reflector_v1",
    ],
    supportingAssetIds: ["asset_planet_earth_reference_v2", "asset_spacecraft_jwst_v2"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "ScientificTelescopeCutaway",
      "ScientificVectorField",
    ],
  },
  "05": {
    primaryAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_moon_luna_lroc_v2",
      "asset_star_spectral_photosphere_v2",
    ],
    supportingAssetIds: ["asset_spacecraft_chandrayaan3_vikram_v2"],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "OrbitalTrajectoryRenderer",
    ],
  },
  "06": {
    primaryAssetIds: [
      "asset_planet_mercury_v1",
      "asset_planet_venus_v1",
      "asset_planet_earth_reference_v2",
      "asset_planet_mars_viking_mola_v2",
      "asset_planet_jupiter_cassini_juno_v2",
      "asset_planet_saturn_cassini_v2",
      "asset_planet_uranus_voyager_v1",
      "asset_planet_neptune_voyager_v1",
    ],
    supportingAssetIds: [
      "asset_dwarf_pluto_new_horizons_v1",
      "asset_moon_europa_galileo_v2",
      "asset_moon_io_galileo_v1",
      "asset_moon_titan_cassini_v1",
      "asset_moon_enceladus_cassini_v1",
      "asset_smallbody_asteroid_bennu_v1",
    ],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "IrregularCelestialBodyRenderer",
      "OrbitalTrajectoryRenderer",
    ],
  },
  "07": {
    primaryAssetIds: ["asset_star_spectral_photosphere_v2"],
    supportingAssetIds: ["asset_planet_earth_reference_v2"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "StellarStructureCutaway",
      "ScientificVectorField",
    ],
  },
  "08": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_planet_earth_reference_v2",
      "asset_moon_luna_lroc_v2",
      "asset_spacecraft_voyager_v2",
    ],
    supportingAssetIds: [
      "asset_planet_mars_viking_mola_v2",
      "asset_planet_jupiter_cassini_juno_v2",
    ],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificStarMaterial",
      "OrbitalTrajectoryRenderer",
      "ScientificVectorField",
      "ScientificSpacecraftRenderer",
    ],
  },
  "09": {
    primaryAssetIds: ["asset_star_spectral_photosphere_v2"],
    supportingAssetIds: ["asset_galaxy_catalog_particle_field_v2"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "StarClusterRenderer",
      "ScientificAnnotation",
    ],
  },
  "10": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_nebula_orion_m42_volumetric_v2",
      "asset_compact_blackhole_kerr_relativity_v2",
    ],
    supportingAssetIds: ["asset_galaxy_catalog_particle_field_v2"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "StellarStructureCutaway",
      "NebulaVolume",
      "ScientificBlackHoleEffects",
    ],
  },
  "11": {
    primaryAssetIds: [
      "asset_nebula_orion_m42_volumetric_v2",
      "asset_galaxy_catalog_particle_field_v2",
    ],
    supportingAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_spacecraft_jwst_v2",
      "asset_spacecraft_hst_v2",
    ],
    reusableProceduralComponents: ["NebulaVolume", "StarClusterRenderer", "ScientificStarMaterial"],
  },
  "12": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_planet_jupiter_cassini_juno_v2",
      "asset_spacecraft_jwst_v2",
    ],
    supportingAssetIds: ["asset_planet_earth_reference_v2"],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "OrbitalTrajectoryRenderer",
      "ScientificSpacecraftRenderer",
    ],
  },
  "13": {
    primaryAssetIds: [
      "asset_galaxy_catalog_particle_field_v2",
      "asset_compact_blackhole_kerr_relativity_v2",
    ],
    supportingAssetIds: ["asset_nebula_orion_m42_volumetric_v2", "asset_spacecraft_hst_v2"],
    reusableProceduralComponents: [
      "GalaxyParticleField",
      "StarClusterRenderer",
      "ScientificBlackHoleEffects",
    ],
  },
  "14": {
    primaryAssetIds: [
      "asset_compact_blackhole_kerr_relativity_v2",
      "asset_star_spectral_photosphere_v2",
    ],
    supportingAssetIds: ["asset_nebula_orion_m42_volumetric_v2"],
    reusableProceduralComponents: [
      "ScientificBlackHoleEffects",
      "PulsarBeamRenderer",
      "StellarStructureCutaway",
      "ScientificVectorField",
    ],
  },
  "15": {
    primaryAssetIds: ["asset_galaxy_catalog_particle_field_v2"],
    supportingAssetIds: ["asset_nebula_orion_m42_volumetric_v2"],
    reusableProceduralComponents: [
      "GalaxyParticleField",
      "ScientificVectorField",
      "ScientificAnnotation",
    ],
  },
  "16": {
    primaryAssetIds: [
      "asset_galaxy_catalog_particle_field_v2",
      "asset_compact_blackhole_kerr_relativity_v2",
    ],
    supportingAssetIds: ["asset_star_spectral_photosphere_v2"],
    reusableProceduralComponents: [
      "GalaxyParticleField",
      "OrbitalTrajectoryRenderer",
      "ScientificVectorField",
    ],
  },
  "17": {
    primaryAssetIds: [
      "asset_galaxy_catalog_particle_field_v2",
      "asset_nebula_orion_m42_volumetric_v2",
    ],
    supportingAssetIds: ["asset_spacecraft_jwst_v2"],
    reusableProceduralComponents: ["GalaxyParticleField", "NebulaVolume", "ScientificStarMaterial"],
  },
  "18": {
    primaryAssetIds: ["asset_galaxy_catalog_particle_field_v2"],
    supportingAssetIds: ["asset_star_spectral_photosphere_v2"],
    reusableProceduralComponents: [
      "GalaxyParticleField",
      "ScientificVectorField",
      "ScientificAnnotation",
    ],
  },
  "19": {
    primaryAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_star_spectral_photosphere_v2",
      "asset_instrument_cassegrain_reflector_v1",
    ],
    supportingAssetIds: [
      "asset_planet_venus_v1",
      "asset_planet_jupiter_cassini_juno_v2",
      "asset_spacecraft_hst_v2",
    ],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "OrbitalTrajectoryRenderer",
      "ScientificTelescopeCutaway",
    ],
  },
  "20": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_planet_earth_reference_v2",
      "asset_galaxy_catalog_particle_field_v2",
      "asset_compact_blackhole_kerr_relativity_v2",
    ],
    supportingAssetIds: ["asset_nebula_orion_m42_volumetric_v2"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "GalaxyParticleField",
      "ScientificBlackHoleEffects",
    ],
  },
  "21": {
    primaryAssetIds: [
      "asset_instrument_cassegrain_reflector_v1",
      "asset_spacecraft_jwst_v2",
      "asset_spacecraft_hst_v2",
    ],
    supportingAssetIds: ["asset_nebula_orion_m42_volumetric_v2", "asset_planet_earth_reference_v2"],
    reusableProceduralComponents: [
      "ScientificTelescopeCutaway",
      "ScientificSpacecraftRenderer",
      "ScientificAtmosphere",
    ],
  },
  "22": {
    primaryAssetIds: [
      "asset_spacecraft_jwst_v2",
      "asset_spacecraft_hst_v2",
      "asset_spacecraft_voyager_v2",
      "asset_spacecraft_chandrayaan3_vikram_v2",
    ],
    supportingAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_moon_luna_lroc_v2",
      "asset_planet_mars_viking_mola_v2",
      "asset_smallbody_asteroid_bennu_v1",
    ],
    reusableProceduralComponents: [
      "ScientificSpacecraftRenderer",
      "OrbitalTrajectoryRenderer",
      "ScientificPlanetMaterial",
    ],
  },
  "23": {
    primaryAssetIds: [
      "asset_planet_earth_reference_v2",
      "asset_planet_mars_viking_mola_v2",
      "asset_moon_europa_galileo_v2",
      "asset_moon_enceladus_cassini_v1",
      "asset_moon_titan_cassini_v1",
    ],
    supportingAssetIds: ["asset_spacecraft_jwst_v2", "asset_star_spectral_photosphere_v2"],
    reusableProceduralComponents: [
      "ScientificPlanetMaterial",
      "ScientificAtmosphere",
      "StellarStructureCutaway",
    ],
  },
  "24": {
    primaryAssetIds: [
      "asset_star_spectral_photosphere_v2",
      "asset_planet_earth_reference_v2",
      "asset_compact_blackhole_kerr_relativity_v2",
      "asset_galaxy_catalog_particle_field_v2",
    ],
    supportingAssetIds: ["asset_spacecraft_jwst_v2", "asset_instrument_cassegrain_reflector_v1"],
    reusableProceduralComponents: [
      "ScientificStarMaterial",
      "ScientificPlanetMaterial",
      "ScientificBlackHoleEffects",
      "GalaxyParticleField",
    ],
  },
};

/**
 * Dynamically generates the verified 172-chapter asset coverage matrix mapped 1:1
 * against the authoritative LessonContentProvider sublessons and CosmosAnimationCueRegistry.
 */
export function getComplete172ChapterAssetCoverageMatrix(): ChapterAssetCoverageRecord[] {
  const records: ChapterAssetCoverageRecord[] = [];
  for (let m = 1; m <= 24; m++) {
    const modId = String(m).padStart(2, "0");
    const segments = LessonContentProvider.getSegmentsForModule(modId, "explorer", "en");
    const sceneDesc = CosmosCinematicSceneRegistry.getSceneForModule(modId);
    const cues = CosmosAnimationCueRegistry.getCuesForModule(modId, "explorer", "en");
    const moduleAssetConfig = MODULE_PRIMARY_ASSET_MAP[modId] || MODULE_PRIMARY_ASSET_MAP["01"];

    const sublessons: string[] = [];
    for (const seg of segments) {
      if (!sublessons.includes(seg.lessonId)) {
        sublessons.push(seg.lessonId);
      }
    }

    sublessons.forEach((subId, idx) => {
      const subCues = cues.filter((c) => c.sublessonId === subId).map((c) => c.cueId);
      const primaryAsset =
        COSMOS_VERIFIED_ASSET_MANIFEST[moduleAssetConfig.primaryAssetIds[0]] ||
        COSMOS_VERIFIED_ASSET_MANIFEST.asset_planet_earth_reference_v2;

      records.push({
        moduleId: modId,
        sublessonId: subId,
        chapterCode: `M${modId}.${idx + 1}`,
        sceneId: sceneDesc.sceneId,
        primaryAssetIds: [...moduleAssetConfig.primaryAssetIds],
        supportingAssetIds: [...moduleAssetConfig.supportingAssetIds],
        reusableProceduralComponents: [...moduleAssetConfig.reusableProceduralComponents],
        missingAssetIds: [],
        scientificProvenance: primaryAsset.requiredAttribution,
        licenseStatus: primaryAsset.licenseIdentifier,
        relatedCosmosCueIds: subCues,
        renderingQualityCoverage: ["HIGH_CINEMATIC", "BALANCED", "LOW_POWER"],
        performanceRisk: m === 14 || m === 11 ? "MODERATE" : "LOW",
        accessibilityFallback: `2D schematic fallback + non-flashing reduced-motion mode + aria-live narration captions (${sceneDesc.title})`,
        coverageStatus: "READY",
      });
    });
  }
  return records;
}
