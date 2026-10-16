/**
 * Canonical Astronomical Schema, Ingestion Types, and Validation Contracts
 *
 * Implements strict scientific catalog normalization adhering to IAU, CDS/SIMBAD,
 * IVOA TAP standards, and Gaia DR3 / NASA Exoplanet Archive conventions.
 *
 * RULE: We never invent missing measurements; unmeasured fields remain null or undefined.
 */

import { z } from "zod";

// Astronomical Object Classifications
export const ObjectTypeSchema = z.enum([
  "star",
  "exoplanet",
  "galaxy",
  "nebula",
  "black_hole",
  "pulsar",
  "neutron_star",
  "quasar",
  "solar_system_body",
  "cluster",
  "supernova_remnant",
]);
export type ObjectType = z.infer<typeof ObjectTypeSchema>;

// Observational Status
export const ObservationStatusSchema = z.enum(["observational", "inferred", "simulated"]);
export type ObservationStatus = z.infer<typeof ObservationStatusSchema>;

// Distance Determination Method
export const DistanceMethodSchema = z.enum([
  "trigonometric_parallax",
  "cepheid_variable",
  "trgb", // Tip of the Red Giant Branch
  "type_ia_supernova",
  "surface_brightness_fluctuations",
  "photometric_parallax",
  "spectroscopic_parallax",
  "cosmological_redshift",
  "ephemeris_radar",
  "gravitational_microlensing",
  "orbital_dynamics",
]);
export type DistanceMethod = z.infer<typeof DistanceMethodSchema>;

// Coordinate Reference Frame
export const CoordinateFrameSchema = z.enum(["ICRS", "Galactic", "Ecliptic"]);
export type CoordinateFrame = z.infer<typeof CoordinateFrameSchema>;

// Reference Epoch
export const ReferenceEpochSchema = z.enum([
  "J2000.0",
  "J2015.5",
  "J2016.0",
  "B1950.0",
  "epoch_date",
]);
export type ReferenceEpoch = z.infer<typeof ReferenceEpochSchema>;

// Primary Source Catalogs
export const CatalogIdSchema = z.enum([
  "gaia_dr3",
  "nasa_exoplanet_archive",
  "simbad",
  "ned",
  "jpl_horizons",
  "atnf_pulsar",
  "open_supernova",
  "custom_scientific",
]);
export type CatalogId = z.infer<typeof CatalogIdSchema>;

// Keplerian / Planetary Orbital Elements Schema
export const OrbitalElementsSchema = z.object({
  semiMajorAxisAu: z.number().min(0).nullable().optional(),
  eccentricity: z.number().min(0).max(1).nullable().optional(),
  inclinationDeg: z.number().min(0).max(180).nullable().optional(),
  orbitalPeriodDays: z.number().positive().nullable().optional(),
  argumentOfPeriastronDeg: z.number().nullable().optional(),
  longitudeOfAscendingNodeDeg: z.number().nullable().optional(),
  timeOfPeriastronPassageJd: z.number().nullable().optional(),
  transitEpochBjd: z.number().nullable().optional(),
});
export type OrbitalElements = z.infer<typeof OrbitalElementsSchema>;

// Physical Properties Schema
export const PhysicalPropertiesSchema = z.object({
  massSolar: z.number().positive().nullable().optional(),
  massEarth: z.number().positive().nullable().optional(),
  radiusSolar: z.number().positive().nullable().optional(),
  radiusEarth: z.number().positive().nullable().optional(),
  radiusKm: z.number().positive().nullable().optional(),
  luminositySolar: z.number().positive().nullable().optional(),
  effectiveTemperatureK: z.number().positive().nullable().optional(),
  metallicityFeH: z.number().nullable().optional(),
  surfaceGravityLogG: z.number().nullable().optional(),
  spectralType: z.string().nullable().optional(),
  morphologicalClass: z.string().nullable().optional(),
  apparentMagnitudeV: z.number().nullable().optional(),
  absoluteMagnitudeV: z.number().nullable().optional(),
  gaiaGMag: z.number().nullable().optional(),
  gaiaBpRpColor: z.number().nullable().optional(),
  equilibriumTemperatureK: z.number().positive().nullable().optional(),
  insolationFluxEarth: z.number().positive().nullable().optional(),
  ageGyr: z.number().positive().nullable().optional(),
  spinPeriodSeconds: z.number().positive().nullable().optional(),
  magneticFieldGauss: z.number().positive().nullable().optional(),
});
export type PhysicalProperties = z.infer<typeof PhysicalPropertiesSchema>;

// Provenance & Source Metadata Schema
export const ProvenanceMetadataSchema = z.object({
  sourceCatalog: CatalogIdSchema,
  sourceId: z.string().min(1),
  sourceUrl: z.string().url().nullable().optional(),
  catalogVersion: z.string().min(1),
  retrievalTimestamp: z.string().datetime(),
  license: z.string().min(1),
  attribution: z.string().min(1),
  bibcode: z.string().nullable().optional(),
  doi: z.string().nullable().optional(),
});
export type ProvenanceMetadata = z.infer<typeof ProvenanceMetadataSchema>;

// Canonical Astronomical Object Schema
export const CanonicalAstronomicalObjectSchema = z.object({
  canonicalId: z.string().min(3),
  name: z.string().min(1),
  alternateNames: z.array(z.string()).default([]),
  objectType: ObjectTypeSchema,
  subtype: z.string().nullable().optional(),
  parentHostId: z.string().nullable().optional(),

  // Observational Status & Quality
  status: ObservationStatusSchema.default("observational"),
  classificationConfidence: z.number().min(0).max(1).default(1.0),
  dataQualityFlags: z.array(z.string()).default([]),

  // Coordinates
  raDeg: z.number().min(0).max(360),
  decDeg: z.number().min(-90).max(90),
  coordinateFrame: CoordinateFrameSchema.default("ICRS"),
  referenceEpoch: ReferenceEpochSchema.default("J2000.0"),

  // 3D Cartesian coordinates in Galactic frame (light-years, double precision)
  galacticCartesianLy: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),

  // Distance & Astrometric Measurements
  distanceLy: z.number().nonnegative(),
  distanceUncertaintyLy: z.number().nonnegative().nullable().optional(),
  distanceMethod: DistanceMethodSchema.nullable().optional(),
  parallaxMas: z.number().nullable().optional(),
  parallaxErrorMas: z.number().nonnegative().nullable().optional(),
  properMotionRaMasYr: z.number().nullable().optional(),
  properMotionDecMasYr: z.number().nullable().optional(),
  radialVelocityKmS: z.number().nullable().optional(),
  redshift: z.number().nullable().optional(),
  redshiftUncertainty: z.number().nonnegative().nullable().optional(),

  // Astrophysics & Orbitals
  physicalProperties: PhysicalPropertiesSchema.default({}),
  orbitalElements: OrbitalElementsSchema.nullable().optional(),

  // Spatial Partitioning
  spatialTileId: z.string().min(1),

  // Provenance
  provenance: ProvenanceMetadataSchema,
});
export type CanonicalAstronomicalObject = z.infer<typeof CanonicalAstronomicalObjectSchema>;

// Measurement record for conflicting or multi-catalog tracking
export interface CatalogMeasurement {
  id: string;
  canonicalId: string;
  catalogId: CatalogId;
  parameterName: string;
  parameterValue: unknown;
  uncertainty?: unknown;
  method?: string;
  bibcode?: string;
  citation?: string;
  retrievalTimestamp: string;
}

// Catalog Provider Information
export interface CatalogProviderInfo {
  id: CatalogId;
  name: string;
  provider: string;
  version: string;
  description: string;
  homepageUrl: string;
  tapEndpoint?: string;
  license: string;
  attribution: string;
  bibcode?: string;
}

// GPU Binary Tile Header
export interface BinaryTileHeader {
  magic: string; // 'AST1'
  version: number; // 1
  tileId: string;
  level: number;
  recordCount: number;
  byteLength: number;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

// Ingestion Pipeline Status
export interface IngestionBatchResult {
  batchId: string;
  catalogId: CatalogId;
  status: "staging" | "validating" | "published" | "failed" | "superseded";
  recordsProcessed: number;
  recordsValid: number;
  recordsCrossMatched: number;
  recordsPublished: number;
  errors: string[];
  durationMs: number;
  timestamp: string;
}
