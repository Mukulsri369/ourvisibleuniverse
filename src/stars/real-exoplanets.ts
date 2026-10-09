/**
 * Real confirmed exoplanets for catalogue stars.
 * Values are the published orbital and physical parameters (semi-major axis
 * in AU, eccentricity, period in days, radius/mass in Earth units) from the
 * NASA Exoplanet Archive. Where only a minimum mass (m sin i) is known, the
 * radius is estimated from a mass–radius relation and marked approximate.
 * These are observations, not procedural models.
 */
export type RealPlanet = {
  name: string;
  aAU: number;
  e: number;
  periodDays: number;
  radiusEarth: number;
  massEarth: number;
  /** true when the radius is estimated from mass rather than measured */
  radiusEstimated?: boolean;
};

export const REAL_SYSTEMS: Record<string, RealPlanet[]> = {
  "Proxima Centauri": [
    { name: "Proxima Centauri d", aAU: 0.029, e: 0.04, periodDays: 5.12, radiusEarth: 0.81, massEarth: 0.26, radiusEstimated: true },
    { name: "Proxima Centauri b", aAU: 0.0486, e: 0.11, periodDays: 11.19, radiusEarth: 1.07, massEarth: 1.07, radiusEstimated: true },
    { name: "Proxima Centauri c", aAU: 1.489, e: 0.04, periodDays: 1928, radiusEarth: 3.0, massEarth: 7.0, radiusEstimated: true },
  ],
  "Barnard's Star": [
    { name: "Barnard's Star b", aAU: 0.0229, e: 0.03, periodDays: 3.15, radiusEarth: 0.7, massEarth: 0.26, radiusEstimated: true },
    { name: "Barnard's Star c", aAU: 0.0274, e: 0.03, periodDays: 4.12, radiusEarth: 0.73, massEarth: 0.31, radiusEstimated: true },
    { name: "Barnard's Star d", aAU: 0.0388, e: 0.03, periodDays: 6.74, radiusEarth: 0.74, massEarth: 0.32, radiusEstimated: true },
    { name: "Barnard's Star e", aAU: 0.0467, e: 0.03, periodDays: 9.37, radiusEarth: 0.66, massEarth: 0.19, radiusEstimated: true },
  ],
  "Ross 128": [
    { name: "Ross 128 b", aAU: 0.0496, e: 0.12, periodDays: 9.87, radiusEarth: 1.1, massEarth: 1.4, radiusEstimated: true },
  ],
  "Tau Ceti": [
    { name: "Tau Ceti g", aAU: 0.133, e: 0.06, periodDays: 20.0, radiusEarth: 1.2, massEarth: 1.75, radiusEstimated: true },
    { name: "Tau Ceti h", aAU: 0.243, e: 0.23, periodDays: 49.4, radiusEarth: 1.2, massEarth: 1.83, radiusEstimated: true },
    { name: "Tau Ceti e", aAU: 0.552, e: 0.18, periodDays: 162.9, radiusEarth: 1.6, massEarth: 3.93, radiusEstimated: true },
    { name: "Tau Ceti f", aAU: 1.35, e: 0.16, periodDays: 636.1, radiusEarth: 1.8, massEarth: 6.6, radiusEstimated: true },
  ],
  "TRAPPIST-1": [
    { name: "TRAPPIST-1 b", aAU: 0.01154, e: 0.006, periodDays: 1.511, radiusEarth: 1.116, massEarth: 1.374 },
    { name: "TRAPPIST-1 c", aAU: 0.0158, e: 0.007, periodDays: 2.422, radiusEarth: 1.097, massEarth: 1.308 },
    { name: "TRAPPIST-1 d", aAU: 0.02227, e: 0.008, periodDays: 4.05, radiusEarth: 0.788, massEarth: 0.388 },
    { name: "TRAPPIST-1 e", aAU: 0.02925, e: 0.005, periodDays: 6.1, radiusEarth: 0.92, massEarth: 0.692 },
    { name: "TRAPPIST-1 f", aAU: 0.03849, e: 0.01, periodDays: 9.207, radiusEarth: 1.045, massEarth: 1.039 },
    { name: "TRAPPIST-1 g", aAU: 0.04683, e: 0.002, periodDays: 12.354, radiusEarth: 1.129, massEarth: 1.321 },
    { name: "TRAPPIST-1 h", aAU: 0.06189, e: 0.006, periodDays: 18.768, radiusEarth: 0.775, massEarth: 0.326 },
  ],
  "Epsilon Eridani": [
    { name: "Epsilon Eridani b", aAU: 3.48, e: 0.07, periodDays: 2672, radiusEarth: 11.0, massEarth: 248, radiusEstimated: true },
  ],
  "Epsilon Indi": [
    { name: "Epsilon Indi Ab", aAU: 11.55, e: 0.4, periodDays: 17100, radiusEarth: 11.2, massEarth: 953, radiusEstimated: true },
  ],
  "Gliese 876": [
    { name: "Gliese 876 d", aAU: 0.0208, e: 0.05, periodDays: 1.938, radiusEarth: 1.6, massEarth: 6.83, radiusEstimated: true },
    { name: "Gliese 876 c", aAU: 0.1296, e: 0.256, periodDays: 30.09, radiusEarth: 12.4, massEarth: 227, radiusEstimated: true },
    { name: "Gliese 876 b", aAU: 0.2083, e: 0.032, periodDays: 61.12, radiusEarth: 13.0, massEarth: 714, radiusEstimated: true },
    { name: "Gliese 876 e", aAU: 0.3343, e: 0.055, periodDays: 124.3, radiusEarth: 8.9, massEarth: 46.8, radiusEstimated: true },
  ],
  "Gliese 581": [
    { name: "Gliese 581 e", aAU: 0.0282, e: 0.03, periodDays: 3.149, radiusEarth: 1.3, massEarth: 1.94, radiusEstimated: true },
    { name: "Gliese 581 b", aAU: 0.0406, e: 0.03, periodDays: 5.369, radiusEarth: 3.4, massEarth: 15.8, radiusEstimated: true },
    { name: "Gliese 581 c", aAU: 0.0721, e: 0.07, periodDays: 12.91, radiusEarth: 1.7, massEarth: 5.5, radiusEstimated: true },
    { name: "Gliese 581 d", aAU: 0.218, e: 0.38, periodDays: 66.7, radiusEarth: 2.1, massEarth: 6.1, radiusEstimated: true },
  ],
  "Gliese 667 C": [
    { name: "Gliese 667 Cb", aAU: 0.0504, e: 0.11, periodDays: 7.2, radiusEarth: 1.7, massEarth: 5.7, radiusEstimated: true },
    { name: "Gliese 667 Cc", aAU: 0.1251, e: 0.06, periodDays: 28.14, radiusEarth: 1.5, massEarth: 3.7, radiusEstimated: true },
  ],
  "51 Pegasi": [
    { name: "51 Pegasi b", aAU: 0.0527, e: 0.013, periodDays: 4.231, radiusEarth: 13.5, massEarth: 147, radiusEstimated: true },
  ],
  "HD 209458": [
    { name: "HD 209458 b", aAU: 0.0475, e: 0.0, periodDays: 3.525, radiusEarth: 15.5, massEarth: 220 },
  ],
  "Kepler-186": [
    { name: "Kepler-186 b", aAU: 0.0343, e: 0.04, periodDays: 3.887, radiusEarth: 1.07, massEarth: 1.24 },
    { name: "Kepler-186 c", aAU: 0.0451, e: 0.04, periodDays: 7.267, radiusEarth: 1.25, massEarth: 2.1 },
    { name: "Kepler-186 d", aAU: 0.0778, e: 0.04, periodDays: 13.34, radiusEarth: 1.4, massEarth: 2.5 },
    { name: "Kepler-186 e", aAU: 0.11, e: 0.04, periodDays: 22.41, radiusEarth: 1.55, massEarth: 3.4 },
    { name: "Kepler-186 f", aAU: 0.356, e: 0.04, periodDays: 129.9, radiusEarth: 1.17, massEarth: 1.44 },
  ],
  Fomalhaut: [
    { name: "Fomalhaut b", aAU: 115, e: 0.11, periodDays: 320000, radiusEarth: 12.0, massEarth: 660, radiusEstimated: true },
  ],
  Pollux: [
    { name: "Pollux b", aAU: 1.64, e: 0.02, periodDays: 589.6, radiusEarth: 11.5, massEarth: 890, radiusEstimated: true },
  ],
  "Wolf 1061": [
    { name: "Wolf 1061 b", aAU: 0.0375, e: 0.15, periodDays: 4.887, radiusEarth: 1.3, massEarth: 1.91, radiusEstimated: true },
    { name: "Wolf 1061 c", aAU: 0.089, e: 0.11, periodDays: 17.87, radiusEarth: 1.5, massEarth: 4.3, radiusEstimated: true },
    { name: "Wolf 1061 d", aAU: 0.204, e: 0.2, periodDays: 54.5, radiusEarth: 2.2, massEarth: 7.7, radiusEstimated: true },
  ],
  "Teegarden's Star": [
    { name: "Teegarden's Star b", aAU: 0.0252, e: 0.0, periodDays: 4.91, radiusEarth: 1.05, massEarth: 1.05, radiusEstimated: true },
    { name: "Teegarden's Star c", aAU: 0.0443, e: 0.0, periodDays: 11.41, radiusEarth: 1.11, massEarth: 1.11, radiusEstimated: true },
    { name: "Teegarden's Star d", aAU: 0.0791, e: 0.0, periodDays: 26.13, radiusEarth: 0.82, massEarth: 0.82, radiusEstimated: true },
  ],
  "Luyten's Star": [
    { name: "GJ 273 c", aAU: 0.0365, e: 0.17, periodDays: 4.72, radiusEarth: 1.06, massEarth: 1.18, radiusEstimated: true },
    { name: "GJ 273 b", aAU: 0.091, e: 0.1, periodDays: 18.65, radiusEarth: 1.5, massEarth: 2.89, radiusEstimated: true },
    { name: "GJ 273 e", aAU: 0.154, e: 0.12, periodDays: 38.0, radiusEarth: 1.3, massEarth: 2.4, radiusEstimated: true },
    { name: "GJ 273 d", aAU: 0.712, e: 0.27, periodDays: 414.0, radiusEarth: 2.5, massEarth: 10.8, radiusEstimated: true },
  ],
  "GJ 1061": [
    { name: "GJ 1061 b", aAU: 0.021, e: 0.0, periodDays: 3.204, radiusEarth: 1.03, massEarth: 1.37, radiusEstimated: true },
    { name: "GJ 1061 c", aAU: 0.035, e: 0.0, periodDays: 6.689, radiusEarth: 1.11, massEarth: 1.74, radiusEstimated: true },
    { name: "GJ 1061 d", aAU: 0.054, e: 0.0, periodDays: 13.03, radiusEarth: 1.16, massEarth: 2.68, radiusEstimated: true },
  ],
  "YZ Ceti": [
    { name: "YZ Ceti b", aAU: 0.016, e: 0.06, periodDays: 2.02, radiusEarth: 0.9, massEarth: 0.7, radiusEstimated: true },
    { name: "YZ Ceti c", aAU: 0.021, e: 0.04, periodDays: 3.06, radiusEarth: 1.0, massEarth: 1.14, radiusEstimated: true },
    { name: "YZ Ceti d", aAU: 0.029, e: 0.13, periodDays: 4.66, radiusEarth: 0.98, massEarth: 1.09, radiusEstimated: true },
  ],
  "Lalande 21185": [
    { name: "Lalande 21185 b", aAU: 0.0789, e: 0.12, periodDays: 12.95, radiusEarth: 1.35, massEarth: 2.99, radiusEstimated: true },
    { name: "Lalande 21185 c", aAU: 2.85, e: 0.15, periodDays: 3190, radiusEarth: 4.4, massEarth: 18.0, radiusEstimated: true },
  ],
  "Lacaille 9352": [
    { name: "GJ 887 b", aAU: 0.068, e: 0.09, periodDays: 9.26, radiusEarth: 1.8, massEarth: 4.2, radiusEstimated: true },
    { name: "GJ 887 c", aAU: 0.12, e: 0.22, periodDays: 21.79, radiusEarth: 2.4, massEarth: 7.6, radiusEstimated: true },
    { name: "GJ 887 d", aAU: 0.253, e: 0.3, periodDays: 50.9, radiusEarth: 1.2, massEarth: 2.3, radiusEstimated: true },
  ],
  "Groombridge 34 A": [
    { name: "GJ 15 A b", aAU: 0.0717, e: 0.09, periodDays: 11.44, radiusEarth: 1.5, massEarth: 3.03, radiusEstimated: true },
    { name: "GJ 15 A c", aAU: 0.284, e: 0.27, periodDays: 87.0, radiusEarth: 4.2, massEarth: 36.0, radiusEstimated: true },
  ],
  "Gliese 832": [
    { name: "Gliese 832 b", aAU: 3.53, e: 0.08, periodDays: 3603, radiusEarth: 11.3, massEarth: 210, radiusEstimated: true },
  ],
  "Gliese 687": [
    { name: "Gliese 687 b", aAU: 0.164, e: 0.17, periodDays: 38.14, radiusEarth: 4.0, massEarth: 18.4, radiusEstimated: true },
  ],
  "Gliese 674": [
    { name: "Gliese 674 b", aAU: 0.039, e: 0.2, periodDays: 4.694, radiusEarth: 3.0, massEarth: 11.1, radiusEstimated: true },
  ],
  "40 Eridani A": [
    { name: "40 Eridani A b", aAU: 0.224, e: 0.04, periodDays: 42.38, radiusEarth: 2.0, massEarth: 8.47, radiusEstimated: true },
  ],
  "82 Eridani": [
    { name: "82 Eridani b", aAU: 0.121, e: 0.05, periodDays: 18.31, radiusEarth: 1.35, massEarth: 2.7, radiusEstimated: true },
    { name: "82 Eridani c", aAU: 0.194, e: 0.09, periodDays: 37.0, radiusEarth: 1.45, massEarth: 3.6, radiusEstimated: true },
    { name: "82 Eridani d", aAU: 0.353, e: 0.12, periodDays: 90.3, radiusEarth: 1.55, massEarth: 4.8, radiusEstimated: true },
  ],
  "TZ Arietis": [
    { name: "Gliese 83.1 b", aAU: 0.88, e: 0.39, periodDays: 773, radiusEarth: 8.5, massEarth: 70.0, radiusEstimated: true },
  ],
  "Struve 2398 A": [
    { name: "Gliese 725 A b", aAU: 0.68, e: 0.1, periodDays: 447, radiusEarth: 3.4, massEarth: 11.7, radiusEstimated: true },
  ],
  "Groombridge 1618": [
    { name: "Groombridge 1618 b", aAU: 0.41, e: 0.28, periodDays: 122.9, radiusEarth: 1.2, massEarth: 3.7, radiusEstimated: true },
  ],
  "Wolf 359": [
    { name: "Wolf 359 c", aAU: 0.018, e: 0.15, periodDays: 2.687, radiusEarth: 1.4, massEarth: 3.8, radiusEstimated: true },
    { name: "Wolf 359 b", aAU: 2.69, e: 0.11, periodDays: 2939, radiusEarth: 4.1, massEarth: 43.9, radiusEstimated: true },
  ],
};
