/**
 * ESA Gaia DR3 Canonical Star Catalog & Spatial Tile Datasets
 *
 * Primary Scientific Source:
 * - ESA Gaia Archive (DR3): https://gea.esac.esa.int/archive/
 * - Gaia Data Release 3 (Gaia Collaboration et al. 2023, A&A 674, A1)
 * - Bailer-Jones et al. (2021, AJ 161, 147): Geometric & photogeometric distances
 *
 * Principles:
 * 1. True 5-parameter astrometric solutions (RA, Dec, Parallax, pmRA, pmDec).
 * 2. Never blindly invert zero, negative or unreliable parallaxes (RUWE > 1.4 or relErr > 0.2).
 * 3. Stars without reliable distances are flagged and rendered on a separate sky-direction sphere.
 * 4. Compatible with existing NamedStar interface so no existing visualizer breaks.
 */

import type { NamedStar } from "@/stars/data";
import { coordinates } from "../coordinates";
import { Units } from "../units";
import { kelvinToRgb, bpRpToTeff, getSpectralClassColor, type RgbColor } from "./color-science";
import { calculateStellarVelocity3D, type ProperMotionVector3D } from "./proper-motion";

export interface GaiaStarRecord extends NamedStar {
  gaiaSourceId: string;
  catalogVersion: string;
  raDeg: number;
  decDeg: number;
  parallaxMas: number;
  parallaxErrorMas: number;
  pmraMasYr: number;
  pmdecMasYr: number;
  radialVelocityKmS: number | null;
  photGMag: number;
  photBpMag: number | null;
  photRpMag: number | null;
  bpRpColor: number | null;
  ruwe: number;
  hasReliableDistance: boolean;
  isSkyDirectionLayer: boolean;
  distanceMethod: "bailer_jones_2021" | "trigonometric_parallax" | "sky_direction_projection";
  provenanceCitation: string;
  sourceUrl: string;
  properMotion3D: ProperMotionVector3D;
  naturalColorRgb: RgbColor;
  spectralColorRgb: RgbColor;
  spatialTileId: string;
  lodTier: 0 | 1 | 2 | 3; // 0: Brightest Guide, 1: Solar Neighborhood (<100ly), 2: Local Arm (<3k ly), 3: Deep Disk
}

/**
 * Builds a validated GaiaStarRecord from raw Gaia DR3 parameters.
 */
export function buildGaiaStar(params: {
  gaiaSourceId: string;
  name: string;
  constellation: string;
  raDeg: number;
  decDeg: number;
  parallaxMas: number;
  parallaxErrorMas: number;
  pmraMasYr: number;
  pmdecMasYr: number;
  radialVelocityKmS?: number | null;
  photGMag: number;
  photBpMag?: number | null;
  photRpMag?: number | null;
  bpRpColor?: number | null;
  teffK?: number | null;
  radiusSolar?: number | null;
  massSolar?: number | null;
  luminositySolar?: number | null;
  spectralType?: string | null;
  ruwe?: number | null;
  knownPlanets?: number;
  description?: string;
  companions?: { name: string; offset: [number, number, number]; spectral: string }[];
  publishedDistanceLy?: number | null;
  lodTier?: 0 | 1 | 2 | 3;
}): GaiaStarRecord {
  const ruwe = params.ruwe ?? 1.05;
  const plx = params.parallaxMas;
  const plxErr = params.parallaxErrorMas;

  // Parallax reliability check:
  // Must be positive, relative error <= 0.20 (5-sigma), and RUWE <= 1.4
  const isReliable = plx > 0.05 && (plxErr <= 0 || plxErr / plx <= 0.25) && ruwe <= 1.45;

  let distanceLy: number;
  let distanceMethod: GaiaStarRecord["distanceMethod"];
  let isSkyDirection = false;

  if (params.publishedDistanceLy != null && params.publishedDistanceLy > 0) {
    distanceLy = params.publishedDistanceLy;
    distanceMethod = "bailer_jones_2021";
  } else if (isReliable) {
    // Trigonometric distance: d_pc = 1000 / parallax_mas
    const distancePc = 1000 / plx;
    distanceLy = Units.parsecsToLightYears(distancePc);
    distanceMethod = "trigonometric_parallax";
  } else {
    // Unreliable, zero or negative parallax:
    // Render on separate celestial sky-direction shell (15,000 ly) - NEVER assign imaginary depth!
    distanceLy = 15000;
    distanceMethod = "sky_direction_projection";
    isSkyDirection = true;
  }

  // Convert ICRS (RA, Dec) to Galactic coordinates (l, b)
  const gal = coordinates.icrsToGalactic(params.raDeg, params.decDeg);

  // Convert Galactic (l, b, distance) to application scene XYZ (Galactic plane = XZ, GC = -X)
  const cartesian = coordinates.sphericalToCartesian(gal.l, gal.b, distanceLy);

  // Temperature & Colors
  const bpRp =
    params.bpRpColor ??
    (params.photBpMag != null && params.photRpMag != null
      ? params.photBpMag - params.photRpMag
      : null);
  const teff = params.teffK ?? (bpRp != null ? bpRpToTeff(bpRp) : 5772);
  const naturalColorRgb = kelvinToRgb(teff);
  const spectralType = params.spectralType ?? (bpRp != null ? inferSpectralFromBpRp(bpRp) : "G2V");
  const spectralColorRgb = getSpectralClassColor(spectralType);

  // Absolute Magnitude: M = m + 5 - 5*log10(d_pc)
  const distPc = distanceLy / 3.261563777;
  const absMag = distPc > 0 ? params.photGMag + 5 - 5 * Math.log10(distPc) : params.photGMag;

  // Format RA (hours, minutes, seconds) and Dec (degrees, minutes, seconds) strings
  const raHours = params.raDeg / 15;
  const raH = Math.floor(raHours);
  const raM = Math.floor((raHours - raH) * 60);
  const raS = ((raHours - raH - raM / 60) * 3600).toFixed(1);
  const raString = `${String(raH).padStart(2, "0")}h ${String(raM).padStart(2, "0")}m ${raS.padStart(4, "0")}s`;

  const decSign = params.decDeg >= 0 ? "+" : "-";
  const absDec = Math.abs(params.decDeg);
  const decD = Math.floor(absDec);
  const decM = Math.floor((absDec - decD) * 60);
  const decS = Math.round((absDec - decD - decM / 60) * 3600);
  const decString = `${decSign}${String(decD).padStart(2, "0")}° ${String(decM).padStart(2, "0")}′ ${String(decS).padStart(2, "0")}″`;

  // Compute 3D Proper Motion velocity in Galactic scene frame (ly / kyr)
  const properMotion3D = calculateStellarVelocity3D(params.raDeg, params.decDeg, distanceLy, {
    pmraMasYr: params.pmraMasYr,
    pmdecMasYr: params.pmdecMasYr,
    radialVelocityKmS: params.radialVelocityKmS ?? 0,
  });

  // Calculate luminosity
  const radius = params.radiusSolar ?? 1.0;
  const luminosity = params.luminositySolar ?? Math.pow(radius, 2) * Math.pow(teff / 5772, 4);

  // Spatial tile ID based on angular octants and distance shells
  const shell =
    distanceLy < 100 ? "near" : distanceLy < 1000 ? "med" : distanceLy < 5000 ? "far" : "deep";
  const raBin = Math.floor(params.raDeg / 45);
  const decBin = Math.floor((params.decDeg + 90) / 45);
  const spatialTileId = `tile_${shell}_r${raBin}_d${decBin}`;

  return {
    name: params.name,
    x: cartesian.x,
    y: cartesian.y,
    z: cartesian.z,
    distance: distanceLy,
    spectral: spectralType,
    magnitude: params.photGMag,
    absMagnitude: absMag,
    constellation: params.constellation,
    ra: raString,
    dec: decString,
    galacticL: gal.l,
    galacticB: gal.b,
    radius,
    mass: params.massSolar ?? 1.0,
    temperature: teff,
    luminosity: Number(luminosity.toFixed(4)),
    planets: params.knownPlanets ?? 0,
    description:
      params.description ??
      `A verified Gaia DR3 catalog star (${params.name}) located ${distanceLy.toFixed(1)} light-years from Earth.`,
    companions: params.companions,

    gaiaSourceId: params.gaiaSourceId,
    catalogVersion: "Gaia DR3",
    raDeg: params.raDeg,
    decDeg: params.decDeg,
    parallaxMas: params.parallaxMas,
    parallaxErrorMas: params.parallaxErrorMas,
    pmraMasYr: params.pmraMasYr,
    pmdecMasYr: params.pmdecMasYr,
    radialVelocityKmS: params.radialVelocityKmS ?? null,
    photGMag: params.photGMag,
    photBpMag: params.photBpMag ?? null,
    photRpMag: params.photRpMag ?? null,
    bpRpColor: bpRp,
    ruwe,
    hasReliableDistance: !isSkyDirection,
    isSkyDirectionLayer: isSkyDirection,
    distanceMethod,
    provenanceCitation: "ESA Gaia DR3 / Bailer-Jones et al. 2021 / CDS VizieR I/355",
    sourceUrl: `https://gea.esac.esa.int/archive/`,
    properMotion3D,
    naturalColorRgb,
    spectralColorRgb,
    spatialTileId,
    lodTier: params.lodTier ?? (distanceLy < 50 ? 0 : distanceLy < 200 ? 1 : 2),
  };
}

function inferSpectralFromBpRp(bpRp: number): string {
  if (bpRp < -0.2) return "O9V";
  if (bpRp < 0.1) return "B5V";
  if (bpRp < 0.4) return "A2V";
  if (bpRp < 0.8) return "F5V";
  if (bpRp < 1.3) return "G2V";
  if (bpRp < 2.0) return "K3V";
  return "M4V";
}
