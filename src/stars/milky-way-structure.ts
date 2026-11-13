/**
 * MILKY WAY STRUCTURE
 *
 * In-plane structure of the Milky Way for its face-on reconstruction (galaxy-disk-layer.ts).
 * No image of the whole Galaxy exists. These are published fits to objects with measured
 * distances; everything between and beyond them, above all the far side of the Galactic
 * centre, is extrapolated and is a reconstruction, not a measurement.
 *
 * Spiral arms: Reid et al. 2019, ApJ 885, 131 (arXiv:1910.03357), Table 2. Log-periodic
 * spirals fitted to about 200 maser parallaxes of high-mass star-forming regions,
 *   ln(R / R_kink) = -(beta - beta_kink) tan(psi),
 * with one pitch angle psi on each side of a kink. beta is Galactocentric azimuth, "0 toward
 * the Sun and increasing in the direction of Galactic rotation". The fits assume R0 = 8.15 kpc;
 * radii are kept here as fractions of R0, so every arm keeps its observed direction from the Sun.
 * Reid et al. extend the arms into the fourth quadrant through the arm tangencies of Bronfman
 * et al. 2000 and assume that arms do not cross on the far side.
 *
 * Bar: half-length 5.0 ± 0.2 kpc at 28-33° to the Sun-centre line (Wegg, Gerhard & Portail
 * 2015, MNRAS 450, 4050); box/peanut bulge at 27 ± 2°, axis ratio 0.5 ± 0.05 seen from above
 * and 0.26 edge-on (Bland-Hawthorn & Gerhard 2016, ARA&A 54, 529, §4.2). The near end lies at
 * positive Galactic longitude. One angle inside both ranges is adopted for bulge and bar.
 */

const DEG = Math.PI / 180;
/** Reid et al. 2019 fit their arms with this distance to the Galactic centre (kpc). */
export const ARM_FIT_R0_KPC = 8.15;
export const KPC_LY = 3261.563777;

export const MILKY_WAY_BAR = {
  halfLengthKpc: 5.0,
  /** Galactocentric azimuth of the near end (radians): toward positive longitude. */
  angle: 28 * DEG,
  /** Box/peanut bulge axis ratios: in the plane and vertical (Bland-Hawthorn & Gerhard 2016). */
  bulgeAxes: [0.5, 0.26] as const,
};

/**
 * Gaussian 1-sigma arm width, w(R) = 336 + 36 (R[kpc] - 8.15) pc (Reid et al. 2019, §3), as
 * [constant, slope] in units of R0: w / R0 = constant + slope · R / R0.
 */
export const MILKY_WAY_ARM_WIDTH: readonly [number, number] = [
  (0.336 - 0.036 * ARM_FIT_R0_KPC) / ARM_FIT_R0_KPC,
  0.036,
];

export type MilkyWayArm = {
  name: string;
  /** Knots from the inner end outward: azimuth beta (radians, decreasing) and ln(R / R0). */
  knots: [number, number][];
  /** Relative strength in old-star light, and in young stars, gas and dust. */
  old: number;
  young: number;
};

/** One log-spiral step to azimuth `to` (degrees): by pitch angle (degrees) or to a radius (kpc). */
type Step = { to: number; pitch?: number; radius?: number };

function trace([beta, radius]: [number, number], steps: Step[]) {
  const knots: [number, number][] = [];
  for (const step of steps) {
    radius =
      step.radius ?? radius * Math.exp(-(step.to - beta) * DEG * Math.tan(step.pitch! * DEG));
    beta = step.to;
    knots.push([beta * DEG, Math.log(radius / ARM_FIT_R0_KPC)]);
  }
  return knots;
}

/** An arm through its kink [beta (deg), R (kpc)]: steps inward (beta rising), then outward. */
function arm(
  name: string,
  old: number,
  young: number,
  kink: [number, number],
  inward: Step[],
  outward: Step[],
): MilkyWayArm {
  return {
    name,
    old,
    young,
    knots: [
      ...trace(kink, inward).reverse(),
      [kink[0] * DEG, Math.log(kink[1] / ARM_FIT_R0_KPC)],
      ...trace(kink, outward),
    ],
  };
}

/**
 * Pitch angles, kinks and kink radii are Table 2 of Reid et al. 2019 (uncertainties in the
 * comments). Arm ends, joins and everything beyond the measured azimuths are reconstructions
 * that follow the paper's own description (§III.2). Strengths are display choices: Perseus
 * and Scutum-Centaurus have been thought to be the Galaxy's two dominant arms (Reid et al.,
 * citing Drimmel 2000 and Churchwell & Benjamin 2009), so they carry the old-star light,
 * while Perseus shows little high-mass star formation over most of its length and the Local
 * arm "very significant massive star formation".
 */
export const MILKY_WAY_ARMS: readonly MilkyWayArm[] = [
  // Norma: kink 18 ± 4°, 4.46 ± 0.19 kpc; psi 19.5 ± 5.1° inside it (from the near bar end),
  // -1.0 ± 3.3° outside, through its tangency at l = 327.5°. "Most likely the Norma arm wraps
  // around the far side of the Galactic center and becomes the Outer arm": that turn is joined
  // to the Outer arm's kink (18°, 12.24 ± 0.36 kpc; psi 3.0 ± 4.4° beyond it), not measured.
  arm(
    "Norma-Outer",
    0.45,
    0.85,
    [18, 4.46],
    [{ to: 56, pitch: 19.5 }],
    [
      { to: -57, pitch: -1.0 },
      { to: -342, radius: 12.24 },
      { to: -432, pitch: 3.0 },
    ],
  ),
  // Scutum-Centaurus: kink 23°, 4.91 ± 0.09 kpc; psi 12.1 ± 2.4° inside, 14.1 ± 1.7° outside.
  // It "may originate near beta ≈ 90°"; beyond the centre it passes the parallax source
  // G007.47+00.05 and returns as the Outer Scutum-Centaurus arm. It ends here before it would
  // cross the Carina arm near the disk edge.
  arm("Scutum-Centaurus", 1, 1, [23, 4.91], [{ to: 90, pitch: 12.1 }], [{ to: -230, pitch: 14.1 }]),
  // Sagittarius-Carina: kink 24 ± 2°, 6.04 ± 0.09 kpc; psi 1.0 ± 2.1° inside, 17.1 ± 1.6°
  // outside to its tangency near beta = -33°, then 10° "to match the CO (l-v) trace of the
  // Carina arm". Inward it is extended "to the Galactic bar near (-3,-3) kpc" by symmetry
  // with the Norma arm.
  arm(
    "Sagittarius-Carina",
    0.45,
    1,
    [24, 6.04],
    [
      { to: 180, pitch: 1.0 },
      { to: 225, radius: Math.hypot(3, 3) },
    ],
    [
      { to: -33, pitch: 17.1 },
      { to: -250, pitch: 10 },
    ],
  ),
  // Perseus: kink 40°, 8.87 ± 0.13 kpc; psi 8.7 ± 2.7° inside, 10.3 ± 1.4° outside. Inward it
  // "may originate near (X,Y) = (-3.5,-0.5) kpc" (beta ≈ 262°); outward it "appears to weaken
  // and possibly die out in the 3rd quadrant".
  arm("Perseus", 1, 0.6, [40, 8.87], [{ to: 262, pitch: 8.7 }], [{ to: -90, pitch: 10.3 }]),
  // Local arm: 8.26 ± 0.05 kpc at 9°, psi 11.4 ± 1.9°, traced from -8° to 34°: "an isolated
  // arm segment".
  arm("Local", 0.2, 0.8, [9, 8.26], [{ to: 34, pitch: 11.4 }], [{ to: -8, pitch: 11.4 }]),
  // 3-kpc arms: the near arm has three parallaxes (3.52 ± 0.26 kpc at 15°, psi -4.2 ± 3.8°);
  // the far arm is its counterpart beyond the centre (Dame & Thaddeus 2008, ApJ 683, L143).
  // Both belong to the bar. Their extent in azimuth is a reconstruction that reaches the near
  // arm's tangency at l = 337°.
  arm(
    "3-kpc (near)",
    0.15,
    0.25,
    [15, 3.52],
    [{ to: 75, pitch: -4.2 }],
    [{ to: -75, pitch: -4.2 }],
  ),
  arm(
    "3-kpc (far)",
    0.15,
    0.25,
    [195, 3.52],
    [{ to: 255, pitch: -4.2 }],
    [{ to: 105, pitch: -4.2 }],
  ),
];

/** R / R0 of an arm at azimuth beta (radians), or null outside its extent. */
export function armRadius(a: MilkyWayArm, beta: number) {
  for (let k = 0; k + 1 < a.knots.length; k++) {
    const [b0, r0] = a.knots[k],
      [b1, r1] = a.knots[k + 1];
    if (beta <= b0 && beta >= b1) return Math.exp(r0 + ((r1 - r0) * (b0 - beta)) / (b0 - b1));
  }
  return null;
}

/** Galactic longitude (degrees, 0-360) of a point at azimuth beta and radius R / R0. */
export function galacticLongitude(beta: number, radius: number) {
  const l = Math.atan2(radius * Math.sin(beta), 1 - radius * Math.cos(beta)) / DEG;
  return (l + 360) % 360;
}
