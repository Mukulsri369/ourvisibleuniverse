/**
 * Types & Domain Models for the Observational Evidence Layer
 * Combines 3D Celestial Position, Empirical Multi-Wavelength Telescope Imagery,
 * IVOA HiPS/FITS Sky Surveys, and Epistemic Reconstruction Validation.
 */

export type WavelengthBand = "optical" | "infrared" | "ultraviolet" | "radio" | "xray";

export interface FilterInfo {
  readonly name: string;
  readonly band: WavelengthBand;
  readonly centralWavelengthNm: number;
  readonly bandwidthNm?: number;
  readonly instrument: string;
  readonly telescope: string;
  readonly falseColorChannel?: "red" | "green" | "blue" | "monochrome" | "luminance";
}

export interface SurveyCoverageItem {
  readonly band: WavelengthBand;
  readonly surveyName: string;
  readonly hipsId: string; // IVOA HiPS Identifier hosted by CDS / NASA / ESO
  readonly available: boolean;
  readonly unavailableReason?: string;
  readonly typicalResolutionArcsec?: number;
  readonly energyRange?: string; // e.g. "0.5 - 7.0 keV" or "1.4 GHz"
  readonly fluxDensity?: string;
  readonly fitsCutoutUrl?: string;
  readonly attribution: string;
}

export interface TelescopeImageRecord {
  readonly id: string;
  readonly title: string;
  readonly telescope: string;
  readonly instrument?: string;
  readonly observationDate?: string;
  readonly wavelengthBand: WavelengthBand;
  readonly colorType: "natural" | "composite_scientific" | "narrowband_sho";
  readonly filters: FilterInfo[];
  readonly imageUrl: string;
  readonly thumbUrl?: string;
  readonly fitsUrl?: string;
  readonly fovArcmin: number;
  readonly centerRaDeg: number;
  readonly centerDecDeg: number;
  readonly positionAngleDeg: number;
  readonly attribution: string;
  readonly license: string; // e.g. "Public Domain (NASA/ESA)", "CC-BY 4.0 (ESO)"
  readonly sourceUrl: string;
  readonly description: string;
  readonly isDirectObservation: true;
}

export interface EpistemicStatus {
  readonly status: "OBSERVATION" | "MODEL" | "ILLUSTRATION";
  readonly title: string;
  readonly description: string;
  readonly methodNotes: string;
  readonly scientificLimitations: string;
}

export interface MeasurementUncertaintyRecord {
  readonly parameter: string;
  readonly nominalValue: string;
  readonly uncertainty: string;
  readonly unit: string;
  readonly confidenceInterval: string; // e.g. "1-sigma (68.3%)"
  readonly measurementTechnique: string;
  readonly referenceCitation: string;
}

export interface ObservationalHistory {
  readonly discoveryYear?: number | string;
  readonly discoverer?: string;
  readonly originalInstrument?: string;
  readonly discoveryContext: string;
  readonly milestones: Array<{
    readonly year: number | string;
    readonly event: string;
    readonly instrument?: string;
  }>;
  readonly verifiedReferences: Array<{
    readonly title: string;
    readonly authors: string;
    readonly year: number;
    readonly journal: string;
    readonly bibcode?: string;
    readonly doi?: string;
  }>;
}

export interface CelestialObservationEvidence {
  readonly targetId: string;
  readonly targetName: string;
  readonly aliases: string[];
  readonly category: string;
  readonly raDeg: number;
  readonly decDeg: number;
  readonly raHms: string;
  readonly decDms: string;
  readonly galacticL: number;
  readonly galacticB: number;
  readonly distanceLy: number;
  readonly distanceUncertaintyLy?: number;
  readonly distanceMeasurementMethod: string;
  readonly physicalDiameterLy?: number;
  readonly physicalDiameterUncertaintyLy?: number;
  readonly angularDiameterArcmin: number;

  readonly surveys: Record<WavelengthBand, SurveyCoverageItem>;
  readonly telescopeImages: TelescopeImageRecord[];

  readonly reconstruction3D: {
    readonly available: boolean;
    readonly method: string;
    readonly volumetricModelType:
      "particle_dynamics" | "doppler_expansion" | "mhd_simulation" | "spherical_photosphere";
    readonly scientificLimitations: string;
  };

  readonly epistemicObservation: EpistemicStatus;
  readonly epistemicReconstruction: EpistemicStatus;

  readonly observationalHistory: ObservationalHistory;
  readonly measurementUncertainties: MeasurementUncertaintyRecord[];

  readonly simbadQueryUrl: string;
  readonly nedQueryUrl?: string;
  readonly gaiaDr3SourceId?: string;
  readonly aladinFovDefaultDeg: number;
}
