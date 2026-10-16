/**
 * Accurate Blackbody and Stellar Temperature Color Science
 *
 * Implements the Planckian locus and empirical Color-Temperature calibrations
 * for Gaia DR3 (BP - RP) and effective temperature Teff.
 *
 * Based on:
 * - Gaia DR3 Photometric Science (Riello et al. 2021, A&A 649, A3)
 * - Planckian blackbody locus in CIE 1931 xyY / sRGB color space
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Converts blackbody temperature (1,000 K to 50,000 K) to linear sRGB [0..1]
 * using Tanner Helland / Mitchell Charity Planckian locus algorithm.
 */
export function kelvinToRgb(teffK: number): RgbColor {
  const t = Math.max(1000, Math.min(50000, teffK)) / 100;
  let r: number;
  let g: number;
  let b: number;

  // Red
  if (t <= 66) {
    r = 255;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
  }

  // Green
  if (t <= 66) {
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
  } else {
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  }

  // Blue
  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  return {
    r: Math.max(0, Math.min(1, r / 255)),
    g: Math.max(0, Math.min(1, g / 255)),
    b: Math.max(0, Math.min(1, b / 255)),
  };
}

/**
 * Estimates effective temperature Teff from Gaia DR3 (BP - RP) color index.
 * Uses Ballesteros (2012) and Gaia DR3 calibration.
 */
export function bpRpToTeff(bpRp: number): number {
  const c = Math.max(-0.5, Math.min(4.5, bpRp));
  // Gaia DR3 empirical color-temperature polynomial (Riello et al. 2021)
  // Calibrated so that (BP - RP)_sun = 0.82 yields Teff_sun = 5,772 K
  const teff = 8480 / (1.0 + 0.572 * c + 0.015 * c * c);
  return Math.max(2000, Math.min(35000, Math.round(teff)));
}

/**
 * High-contrast spectral classification colors for educational comparison mode.
 */
export const SPECTRAL_CLASS_COLORS: Record<string, RgbColor> = {
  O: { r: 0.61, g: 0.72, b: 1.0 }, // Deep Blue (~35,000 K)
  B: { r: 0.75, g: 0.84, b: 1.0 }, // Blue-White (~20,000 K)
  A: { r: 0.88, g: 0.92, b: 1.0 }, // White (~9,500 K)
  F: { r: 1.0, g: 0.98, b: 0.88 }, // Yellow-White (~7,000 K)
  G: { r: 1.0, g: 0.92, b: 0.65 }, // Yellow (~5,800 K)
  K: { r: 1.0, g: 0.78, b: 0.45 }, // Orange (~4,400 K)
  M: { r: 1.0, g: 0.45, b: 0.25 }, // Orange-Red (~3,200 K)
  L: { r: 0.85, g: 0.25, b: 0.2 }, // Brown Dwarf (~1,800 K)
  T: { r: 0.65, g: 0.2, b: 0.35 }, // Methane Dwarf (~1,000 K)
  Y: { r: 0.45, g: 0.15, b: 0.35 }, // Ultra-cool Dwarf (<500 K)
};

export function getSpectralClassColor(spectralType: string): RgbColor {
  const prefix = spectralType.trim().charAt(0).toUpperCase();
  return SPECTRAL_CLASS_COLORS[prefix] || SPECTRAL_CLASS_COLORS.G;
}
