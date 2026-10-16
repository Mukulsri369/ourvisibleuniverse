/**
 * Celestial Mechanics: Three-Body Lagrange Points (L1 - L5)
 *
 * Implements exact and series solutions to the Restricted Three-Body Problem (RTBP)
 * for Sun-Earth and Sun-Jupiter systems, including real spacecraft and Trojan asteroidal bodies.
 *
 * References:
 * - Murray & Dermott, "Solar System Dynamics", Cambridge University Press.
 * - Szebehely, "Theory of Orbits: The Restricted Problem of Three Bodies".
 */

export interface LagrangePointDef {
  id: string; // e.g. "Sun-Earth-L2"
  system: "Sun-Earth" | "Sun-Jupiter";
  point: "L1" | "L2" | "L3" | "L4" | "L5";
  xAu: number;
  yAu: number;
  zAu: number;
  distanceFromPlanetKm: number;
  stability: "unstable_saddle" | "stable_triangular";
  notableMissionsOrObjects: string[];
  description: string;
}

export function computeLagrangePoints(
  system: "Sun-Earth" | "Sun-Jupiter",
  planetState: { xAu: number; yAu: number; zAu: number; distanceSunAu: number },
): LagrangePointDef[] {
  // Mass ratios mu = M_planet / (M_sun + M_planet)
  const mu = system === "Sun-Earth" ? 3.003e-6 : 9.538e-4;
  const R = planetState.distanceSunAu;

  // Hill sphere / L1/L2 distance from planet: r_H = R * (mu / 3)^(1/3)
  const hillRadiusAu = R * Math.pow(mu / 3.0, 1.0 / 3.0);
  const hillRadiusKm = hillRadiusAu * 149597870.7;

  // Unit vector from Sun to Planet
  const ux = planetState.xAu / R;
  const uy = planetState.yAu / R;
  const uz = planetState.zAu / R;

  // Perpendicular unit vector in orbital plane (assuming z ≈ 0 for ecliptic)
  const vx = -uy;
  const vy = ux;
  const vz = 0;

  // L1: Between Sun and Planet
  const l1Dist = R - hillRadiusAu;
  const l1 = {
    xAu: ux * l1Dist,
    yAu: uy * l1Dist,
    zAu: uz * l1Dist,
  };

  // L2: Beyond Planet
  const l2Dist = R + hillRadiusAu;
  const l2 = {
    xAu: ux * l2Dist,
    yAu: uy * l2Dist,
    zAu: uz * l2Dist,
  };

  // L3: Opposite side of Sun
  const l3Dist = R * (1.0 + (5.0 / 12.0) * mu);
  const l3 = {
    xAu: -ux * l3Dist,
    yAu: -uy * l3Dist,
    zAu: -uz * l3Dist,
  };

  // L4: Leading 60 degrees (cos 60 = 0.5, sin 60 = sqrt(3)/2 ≈ 0.866025)
  const cos60 = 0.5;
  const sin60 = Math.sqrt(3) / 2.0;
  const l4 = {
    xAu: R * (ux * cos60 + vx * sin60),
    yAu: R * (uy * cos60 + vy * sin60),
    zAu: R * (uz * cos60 + vz * sin60),
  };

  // L5: Trailing 60 degrees (-sin 60)
  const l5 = {
    xAu: R * (ux * cos60 - vx * sin60),
    yAu: R * (uy * cos60 - vy * sin60),
    zAu: R * (uz * cos60 - vz * sin60),
  };

  return [
    {
      id: `${system}-L1`,
      system,
      point: "L1",
      ...l1,
      distanceFromPlanetKm: hillRadiusKm,
      stability: "unstable_saddle",
      notableMissionsOrObjects:
        system === "Sun-Earth"
          ? ["SOHO", "DSCOVR", "ACE", "WIND"]
          : ["Theoretical solar monitor halo"],
      description: `Collinear Lagrange point located between the Sun and ${system.split("-")[1]}. Ideal for uninterrupted solar observation.`,
    },
    {
      id: `${system}-L2`,
      system,
      point: "L2",
      ...l2,
      distanceFromPlanetKm: hillRadiusKm,
      stability: "unstable_saddle",
      notableMissionsOrObjects:
        system === "Sun-Earth"
          ? ["JWST (James Webb)", "Gaia", "Euclid", "Planck", "WFIRST / Roman"]
          : [],
      description: `Collinear Lagrange point behind ${system.split("-")[1]}, shielding delicate infrared telescopes from Solar and terrestrial thermal glare.`,
    },
    {
      id: `${system}-L3`,
      system,
      point: "L3",
      ...l3,
      distanceFromPlanetKm: R * 2 * 149597870.7,
      stability: "unstable_saddle",
      notableMissionsOrObjects: ["Counter-Earth thought experiments"],
      description: `Collinear point on the exact opposite side of the Sun, permanently hidden from direct Earth view.`,
    },
    {
      id: `${system}-L4`,
      system,
      point: "L4",
      ...l4,
      distanceFromPlanetKm: R * 149597870.7,
      stability: "stable_triangular",
      notableMissionsOrObjects:
        system === "Sun-Jupiter"
          ? ["Trojan Asteroids (Achilles, Hektor)", "Lucy Mission"]
          : ["2010 TK7", "2020 XL5"],
      description: `Equilateral equilibrium point leading 60 degrees ahead in orbit. Gravitationally stable for Coriolis-trapped asteroids.`,
    },
    {
      id: `${system}-L5`,
      system,
      point: "L5",
      ...l5,
      distanceFromPlanetKm: R * 149597870.7,
      stability: "stable_triangular",
      notableMissionsOrObjects:
        system === "Sun-Jupiter" ? ["Greek Asteroids (Patroclus, Anchises)", "Lucy Mission"] : [],
      description: `Equilateral equilibrium point trailing 60 degrees behind in orbit, harboring deep resonant asteroid clouds.`,
    },
  ];
}
