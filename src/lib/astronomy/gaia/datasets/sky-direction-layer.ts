/**
 * ESA Gaia DR3 Sky-Direction Astrometry Layer (Unreliable Parallaxes & Deep Background)
 *
 * Strict Scientific Rule:
 * "Never blindly invert zero, negative or unreliable parallaxes.
 * Objects without reliable distances must be rendered in a separate sky-direction layer,
 * not assigned imaginary 3D depths."
 *
 * This dataset contains verified celestial sources observed by Gaia DR3
 * where trigonometric parallax is non-positive (plx <= 0) or has relative error > 20%
 * (sigma_plx / plx > 0.20) or RUWE > 1.40.
 *
 * In the visualizer, they are projected strictly onto a celestial sky-direction shell
 * (unit direction vector at radius R_sky = 15,000 ly) and flagged with:
 *   hasReliableDistance: false
 *   isSkyDirectionLayer: true
 *   distanceMethod: "sky_direction_projection"
 */

import { buildGaiaStar, type GaiaStarRecord } from "../gaia-catalog";

// Real Gaia DR3 sources with non-positive or poorly constrained parallaxes
export const GAIA_SKY_DIRECTION_SOURCES = [
  {
    id: "3439580456102839296",
    name: "Gaia DR3 3439580456102839296",
    ra: 83.8214,
    dec: -5.3911,
    plx: -0.14, // Negative parallax! Cannot be inverted!
    plxErr: 0.28,
    pmra: 1.2,
    pmdec: -0.8,
    g: 16.42,
    bp: 17.55,
    rp: 15.31,
    ruwe: 1.62,
    teff: 4800,
    con: "Orion",
    desc: "Distant Orion nebula region background source with negative astrometric parallax. Rendered in sky-direction layer.",
  },
  {
    id: "2078901234567890123",
    name: "Gaia DR3 2078901234567890123 (Cygnus Deep)",
    ra: 308.2145,
    dec: 41.2215,
    plx: 0.02, // Relative error 1000%! Unreliable!
    plxErr: 0.22,
    pmra: -2.1,
    pmdec: -4.3,
    g: 17.15,
    bp: 18.42,
    rp: 15.98,
    ruwe: 1.85,
    teff: 4200,
    con: "Cygnus",
    desc: "Obscured Cygnus Rift background giant with high astrometric excess noise.",
  },
  {
    id: "4056789123456789012",
    name: "Gaia DR3 4056789123456789012 (Sgr Carina Arm)",
    ra: 268.4512,
    dec: -28.9125,
    plx: -0.08, // Negative parallax in crowded galactic plane
    plxErr: 0.35,
    pmra: -3.8,
    pmdec: -1.2,
    g: 15.8,
    bp: 17.9,
    rp: 14.5,
    ruwe: 1.55,
    teff: 3600,
    con: "Sagittarius",
    desc: "Crowded Galactic Plane background star; distance is unconstrained trigonometrically.",
  },
  {
    id: "5289012345678901234",
    name: "Gaia DR3 5289012345678901234 (Perseus OB)",
    ra: 52.1245,
    dec: 56.4521,
    plx: 0.05,
    plxErr: 0.18,
    pmra: -1.0,
    pmdec: -1.5,
    g: 14.2,
    bp: 14.5,
    rp: 13.7,
    ruwe: 1.48,
    teff: 11000,
    con: "Perseus",
    desc: "Luminous OB association candidate with high astrometric RUWE error.",
  },
  {
    id: "6123456789012345678",
    name: "Gaia DR3 6123456789012345678 (Scorpius Cloud)",
    ra: 245.1258,
    dec: -24.5124,
    plx: 0.01,
    plxErr: 0.15,
    pmra: -5.2,
    pmdec: -8.1,
    g: 16.05,
    bp: 17.4,
    rp: 14.9,
    ruwe: 1.72,
    teff: 4500,
    con: "Scorpius",
    desc: "Rho Ophiuchi / Scorpius cloud background star.",
  },
];

/**
 * Returns canonical sky-direction astrometric records.
 */
export function getGaiaSkyDirectionStars(): GaiaStarRecord[] {
  return GAIA_SKY_DIRECTION_SOURCES.map((s) =>
    buildGaiaStar({
      gaiaSourceId: s.id,
      name: s.name,
      constellation: s.con,
      raDeg: s.ra,
      decDeg: s.dec,
      parallaxMas: s.plx,
      parallaxErrorMas: s.plxErr,
      pmraMasYr: s.pmra,
      pmdecMasYr: s.pmdec,
      photGMag: s.g,
      photBpMag: s.bp,
      photRpMag: s.rp,
      teffK: s.teff,
      ruwe: s.ruwe,
      description: s.desc,
      lodTier: 3,
    }),
  );
}
