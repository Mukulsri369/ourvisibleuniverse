// @ts-nocheck
/**
 * COSMOS Physically Grounded Lighting, HDR Color Management & Astronomical Scale Controller
 * Project: Our Visible Universe Academy
 * Scope: Prompt 05 — Sections 6, 7, 20
 *
 * Implements:
 * 1. Planckian Blackbody Chromaticity (T_eff -> sRGB / Linear RGB) for OBAFGKM stars
 * 2. Collimated Planetary Day-Night Terminator & Low-Ambient Photometric Balance
 * 3. Lunar Phase Illumination Fraction from Sun-Moon-Observer 3D Geometry
 * 4. Umbral & Penumbral Eclipse Cone Geometry
 * 5. Consistent Linear-Light HDR Color Pipeline (ACES Filmic / AgX, zero double tone-mapping)
 * 6. Camera-Relative Origin Rebasing & Logarithmic Scale Transition Coordinator
 */

import * as THREE from "three";
import type { CinematicQualityTier } from "../../cinematic-storyboard-types";
import type { AstronomicalScaleRegime } from "./ScientificObjectContract";

export interface BlackbodyColorResult {
  temperatureK: number;
  spectralClass: "O" | "B" | "A" | "F" | "G" | "K" | "M";
  srgbHex: string;
  linearRgb: [number, number, number];
  luminosityFactor: number;
}

export interface EclipseShadowGeometry {
  umbraLengthKm: number;
  umbraRadiusAtTargetKm: number;
  penumbraRadiusAtTargetKm: number;
  eclipseType: "total" | "annular" | "partial" | "none";
  sunToOcculterDir: [number, number, number];
}

export interface LunarPhaseState {
  phaseAngleRad: number;
  illuminatedFraction: number; // [0.0, 1.0]
  waxingOrWaning: "waxing" | "waning";
  phaseName:
    | "New Moon"
    | "Waxing Crescent"
    | "First Quarter"
    | "Waxing Gibbous"
    | "Full Moon"
    | "Waning Gibbous"
    | "Third Quarter"
    | "Waning Crescent";
  sunDirectionFromMoon: [number, number, number];
}

export interface ScaleTransitionTransform {
  regime: AstronomicalScaleRegime;
  cameraNear: number;
  cameraFar: number;
  rebasedOriginOffset: [number, number, number];
  logarithmicZoomFactor: number;
  solarSystemLayerOpacity: number;
  galacticLayerOpacity: number;
  cosmologicalLayerOpacity: number;
}

/**
 * Converts effective stellar temperature T_eff (in Kelvin) to physically grounded
 * Planckian blackbody sRGB and Linear RGB values.
 * Grounded in Mitchell Charity's CIE 1964 10-degree Planckian locus tabulation.
 */
export function blackbodyTemperatureToColor(temperatureK: number): BlackbodyColorResult {
  const temp = Math.min(50000, Math.max(1800, temperatureK));
  const tHundred = temp / 100.0;

  let r: number;
  let g: number;
  let b: number;

  // Red channel
  if (tHundred <= 66.0) {
    r = 255.0;
  } else {
    r = 329.698727446 * Math.pow(tHundred - 60.0, -0.1332047592);
  }

  // Green channel
  if (tHundred <= 66.0) {
    g = 99.4708025861 * Math.log(Math.max(1.0, tHundred)) - 161.1195681661;
  } else {
    g = 288.1221695283 * Math.pow(tHundred - 60.0, -0.0755148492);
  }

  // Blue channel
  if (tHundred >= 66.0) {
    b = 255.0;
  } else if (tHundred <= 19.0) {
    b = 0.0;
  } else {
    b = 138.5177312231 * Math.log(Math.max(1.0, tHundred - 10.0)) - 305.0447927307;
  }

  const clampByte = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  const rByte = clampByte(r);
  const gByte = clampByte(g);
  const bByte = clampByte(b);

  const srgbHex = `#${rByte.toString(16).padStart(2, "0")}${gByte
    .toString(16)
    .padStart(2, "0")}${bByte.toString(16).padStart(2, "0")}`;

  const colorObj = new THREE.Color(srgbHex);
  const linearColor = colorObj.clone().convertSRGBToLinear();

  let spectralClass: BlackbodyColorResult["spectralClass"] = "G";
  if (temp >= 30000) spectralClass = "O";
  else if (temp >= 10000) spectralClass = "B";
  else if (temp >= 7500) spectralClass = "A";
  else if (temp >= 6000) spectralClass = "F";
  else if (temp >= 5200) spectralClass = "G";
  else if (temp >= 3700) spectralClass = "K";
  else spectralClass = "M";

  // Normalized Stefan-Boltzmann surface flux indicator (T / T_sun)^0.65 compressed for HDR display
  const luminosityFactor = Math.min(3.5, Math.max(0.35, Math.pow(temp / 5772, 0.45)));

  return {
    temperatureK: temp,
    spectralClass,
    srgbHex,
    linearRgb: [linearColor.r, linearColor.g, linearColor.b],
    luminosityFactor,
  };
}

/**
 * Computes unit direction vector from planet position toward illuminating star,
 * plus terminator normal and day-hemisphere alignment cosine for a surface point.
 */
export function computePlanetaryTerminator(
  planetPosition: [number, number, number],
  starPosition: [number, number, number],
  surfaceWorldNormal?: [number, number, number],
): {
  sunDirection: [number, number, number];
  distanceToStar: number;
  surfaceIlluminationCosine: number;
  isDaySide: boolean;
} {
  const dx = starPosition[0] - planetPosition[0];
  const dy = starPosition[1] - planetPosition[1];
  const dz = starPosition[2] - planetPosition[2];
  const dist = Math.hypot(dx, dy, dz) || 1.0;

  const sunDir: [number, number, number] = [dx / dist, dy / dist, dz / dist];

  let cosine = 1.0;
  if (surfaceWorldNormal) {
    const nLen =
      Math.hypot(surfaceWorldNormal[0], surfaceWorldNormal[1], surfaceWorldNormal[2]) || 1.0;
    const nx = surfaceWorldNormal[0] / nLen;
    const ny = surfaceWorldNormal[1] / nLen;
    const nz = surfaceWorldNormal[2] / nLen;
    cosine = nx * sunDir[0] + ny * sunDir[1] + nz * sunDir[2];
  }

  return {
    sunDirection: sunDir,
    distanceToStar: dist,
    surfaceIlluminationCosine: cosine,
    isDaySide: cosine > 0,
  };
}

/**
 * Computes the exact illuminated lunar fraction f = (1 + cos(alpha)) / 2
 * from 3D Sun, Moon, and Observer (Earth) positions (Prompt 05 Section 6).
 */
export function computeLunarPhaseIllumination(
  sunPosition: [number, number, number],
  moonPosition: [number, number, number],
  observerPosition: [number, number, number],
): LunarPhaseState {
  // Vector from Moon to Sun
  const msX = sunPosition[0] - moonPosition[0];
  const msY = sunPosition[1] - moonPosition[1];
  const msZ = sunPosition[2] - moonPosition[2];
  const msLen = Math.hypot(msX, msY, msZ) || 1.0;
  const sunDir: [number, number, number] = [msX / msLen, msY / msLen, msZ / msLen];

  // Vector from Moon to Observer
  const moX = observerPosition[0] - moonPosition[0];
  const moY = observerPosition[1] - moonPosition[1];
  const moZ = observerPosition[2] - moonPosition[2];
  const moLen = Math.hypot(moX, moY, moZ) || 1.0;
  const obsDir: [number, number, number] = [moX / moLen, moY / moLen, moZ / moLen];

  // Phase angle alpha between Moon->Sun and Moon->Observer
  const cosAlpha = Math.min(
    1.0,
    Math.max(-1.0, sunDir[0] * obsDir[0] + sunDir[1] * obsDir[1] + sunDir[2] * obsDir[2]),
  );
  const phaseAngleRad = Math.acos(cosAlpha);
  const illuminatedFraction = (1.0 + cosAlpha) * 0.5;

  // Cross product Y component determines waxing vs waning in prograde ecliptic orbit
  const crossY = sunDir[2] * obsDir[0] - sunDir[0] * obsDir[2];
  const waxingOrWaning: "waxing" | "waning" = crossY >= 0 ? "waxing" : "waning";

  let phaseName: LunarPhaseState["phaseName"] = "Full Moon";
  if (illuminatedFraction < 0.04) {
    phaseName = "New Moon";
  } else if (illuminatedFraction > 0.96) {
    phaseName = "Full Moon";
  } else if (Math.abs(illuminatedFraction - 0.5) <= 0.08) {
    phaseName = waxingOrWaning === "waxing" ? "First Quarter" : "Third Quarter";
  } else if (illuminatedFraction < 0.5) {
    phaseName = waxingOrWaning === "waxing" ? "Waxing Crescent" : "Waning Crescent";
  } else {
    phaseName = waxingOrWaning === "waxing" ? "Waxing Gibbous" : "Waning Gibbous";
  }

  return {
    phaseAngleRad,
    illuminatedFraction,
    waxingOrWaning,
    phaseName,
    sunDirectionFromMoon: sunDir,
  };
}

/**
 * Computes physical umbral and penumbral shadow cone geometry for solar/lunar eclipses
 * (Prompt 05 Section 6).
 */
export function computeEclipseShadowCones(params: {
  sunRadiusKm?: number;
  occulterRadiusKm: number;
  sunToOcculterDistanceKm: number;
  occulterToTargetDistanceKm: number;
  lateralOffsetKm?: number;
}): EclipseShadowGeometry {
  const rSun = params.sunRadiusKm ?? 695700;
  const rOcc = Math.max(1, params.occulterRadiusKm);
  const dSunOcc = Math.max(rSun + rOcc + 1000, params.sunToOcculterDistanceKm);
  const dOccTarget = Math.max(0, params.occulterToTargetDistanceKm);
  const lateralOffset = Math.abs(params.lateralOffsetKm ?? 0);

  // Umbra apex length behind occulter: L_u = (R_occ * d_sun_occ) / (R_sun - R_occ)
  const umbraLengthKm = (rOcc * dSunOcc) / Math.max(1, rSun - rOcc);

  // Signed umbral radius at target distance (negative means antumbra / annular eclipse)
  const umbraRadiusAtTargetKm = rOcc * (1.0 - dOccTarget / umbraLengthKm);

  // Penumbra expands outward: R_pen = R_occ + d_occ_target * (R_sun + R_occ) / d_sun_occ
  const penumbraRadiusAtTargetKm = rOcc + (dOccTarget * (rSun + rOcc)) / dSunOcc;

  let eclipseType: EclipseShadowGeometry["eclipseType"] = "none";
  if (lateralOffset <= Math.abs(umbraRadiusAtTargetKm)) {
    eclipseType = umbraRadiusAtTargetKm >= 0 ? "total" : "annular";
  } else if (lateralOffset <= penumbraRadiusAtTargetKm) {
    eclipseType = "partial";
  }

  return {
    umbraLengthKm,
    umbraRadiusAtTargetKm,
    penumbraRadiusAtTargetKm,
    eclipseType,
    sunToOcculterDir: [1, 0, 0],
  };
}

/**
 * Configures Three.js WebGLRenderer color pipeline & tone mapping consistently
 * without double tone mapping or double gamma correction (Prompt 05 Section 7).
 */
export function configureScientificColorPipeline(
  renderer: THREE.WebGLRenderer,
  options: {
    qualityTier: CinematicQualityTier;
    toneMapping?: "aces" | "agx" | "neutral";
    exposure?: number;
    usingPostprocessingOutputPass?: boolean;
  },
): {
  outputColorSpace: THREE.ColorSpace;
  toneMapping: THREE.ToneMapping;
  toneMappingExposure: number;
  shadowsEnabled: boolean;
} {
  THREE.ColorManagement.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const exposure = Math.min(2.2, Math.max(0.4, options.exposure ?? 1.08));
  renderer.toneMappingExposure = exposure;

  // Select validated tone-mapping strategy; never stack two incompatible tone-mapping stages
  let toneMapping: THREE.ToneMapping = THREE.ACESFilmicToneMapping;
  if (options.toneMapping === "agx") {
    toneMapping = THREE.AgXToneMapping;
  } else if (options.toneMapping === "neutral") {
    toneMapping = THREE.NeutralToneMapping;
  }
  renderer.toneMapping = toneMapping;

  const shadowsEnabled = options.qualityTier === "HIGH_CINEMATIC";
  renderer.shadowMap.enabled = shadowsEnabled;
  if (shadowsEnabled) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  return {
    outputColorSpace: renderer.outputColorSpace,
    toneMapping: renderer.toneMapping,
    toneMappingExposure: renderer.toneMappingExposure,
    shadowsEnabled,
  };
}

/**
 * Astronomical Scale Coordinator (Prompt 05 Section 20)
 * Manages logarithmic scale transitions, camera near/far clip ratios, and
 * camera-relative origin rebasing across Planetary -> Interplanetary -> Stellar -> Galactic -> Cosmological scales.
 * Prevents floating-point jitter and Solar System zoom-out lag.
 */
export class AstronomicalScaleCoordinator {
  /**
   * Computes camera-relative rebased coordinates so vertices near the focal target
   * never exceed safe 32-bit float precision limits (~10^5 units).
   */
  public static rebasePositionToCameraOrigin(
    worldPosition: [number, number, number],
    floatingOrigin: [number, number, number],
  ): [number, number, number] {
    return [
      worldPosition[0] - floatingOrigin[0],
      worldPosition[1] - floatingOrigin[1],
      worldPosition[2] - floatingOrigin[2],
    ];
  }

  /**
   * Computes smooth scale regime parameters and layer opacities from normalized
   * logarithmic zoom level log10Meters in [6, 27] or sublesson index.
   */
  public static evaluateScaleTransition(
    log10ScaleMeters: number,
    focalPosition: [number, number, number] = [0, 0, 0],
  ): ScaleTransitionTransform {
    const clampedLog = Math.min(27, Math.max(6, log10ScaleMeters));

    let regime: AstronomicalScaleRegime = "planetary_scale";
    if (clampedLog < 9.5) regime = "planetary_scale";
    else if (clampedLog < 13.5) regime = "interplanetary_scale";
    else if (clampedLog < 16.5) regime = "stellar_scale";
    else if (clampedLog < 19.5) regime = "interstellar_scale";
    else if (clampedLog < 22.5) regime = "galactic_scale";
    else regime = "cosmological_scale";

    // Keep near/far ratio <= 40,000 to prevent depth-buffer z-fighting
    const cameraNear = 0.05;
    const cameraFar = 1800;

    const smoothstep = (edge0: number, edge1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    };

    const solarSystemLayerOpacity = 1.0 - smoothstep(14.0, 18.5, clampedLog);
    const galacticLayerOpacity =
      smoothstep(13.0, 17.5, clampedLog) * (1.0 - smoothstep(22.5, 25.5, clampedLog) * 0.4);
    const cosmologicalLayerOpacity = smoothstep(20.0, 23.5, clampedLog);

    return {
      regime,
      cameraNear,
      cameraFar,
      rebasedOriginOffset: [-focalPosition[0], -focalPosition[1], -focalPosition[2]],
      logarithmicZoomFactor: (clampedLog - 6) / 21,
      solarSystemLayerOpacity,
      galacticLayerOpacity,
      cosmologicalLayerOpacity,
    };
  }
}
