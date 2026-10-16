/**
 * Solar System Orbital Resonances & Dynamical Couplings
 *
 * Grounded in:
 * - Laplace, P. S., "Traité de mécanique céleste"
 * - Peale, S. J., "Orbital Resonances in the Solar System", Annu. Rev. Astron. Astrophys. (1976)
 * - Malhotra, R., "The Origin of Pluto's Orbit: Implications for the Solar System Beyond Neptune" (1995)
 */

export interface ResonanceSystemDef {
  id: string;
  name: string;
  bodies: string[];
  ratio: string; // e.g. "4 : 2 : 1" or "3 : 2"
  type: "mean_motion" | "spin_orbit" | "secular";
  physicsMechanism: string;
  consequences: string;
}

export const SOLAR_SYSTEM_RESONANCES: ResonanceSystemDef[] = [
  {
    id: "galilean_laplace",
    name: "Galilean Laplace Resonance",
    bodies: ["Io", "Europa", "Ganymede"],
    ratio: "4 : 2 : 1",
    type: "mean_motion",
    physicsMechanism:
      "Exact 3-body mean-motion coupling: n_Io - 3*n_Europa + 2*n_Ganymede = 0. The three moons never align on the same side of Jupiter simultaneously.",
    consequences:
      "Forces sustained orbital eccentricities against tidal circularization, powering continuous tidal friction heating that sustains Io's 400+ active volcanoes and Europa's global subsurface liquid ocean.",
  },
  {
    id: "neptune_pluto",
    name: "Neptune–Pluto 3:2 Orbital Resonance",
    bodies: ["Neptune", "Pluto"],
    ratio: "3 : 2",
    type: "mean_motion",
    physicsMechanism:
      "Pluto completes exactly 2 orbits around the Sun for every 3 orbits of Neptune (orbital periods ~248 yr vs ~165 yr).",
    consequences:
      "The resonance angle librates around 180°, ensuring that whenever Pluto is at perihelion (inside Neptune's orbital distance), Neptune is always over 50 degrees away along its orbit, guaranteeing mutual gravitational stability for billions of years.",
  },
  {
    id: "mercury_spin_orbit",
    name: "Mercury 3:2 Spin–Orbit Resonance",
    bodies: ["Mercury"],
    ratio: "3 : 2",
    type: "spin_orbit",
    physicsMechanism:
      "Mercury rotates exactly 3 times on its axis (58.646 Earth days) for every 2 orbital revolutions around the Sun (87.969 Earth days).",
    consequences:
      "A single solar day on Mercury (sunrise to sunrise) lasts exactly 2 Mercury years (176 Earth days). Tidal torque at perihelion stabilizes the rotation rate.",
  },
  {
    id: "saturn_mimas_tethys",
    name: "Mimas–Tethys 2:1 Inclination Resonance",
    bodies: ["Mimas", "Tethys"],
    ratio: "2 : 1",
    type: "mean_motion",
    physicsMechanism:
      "Mimas completes 2 orbits for every 1 orbit of Tethys, librating with an inclination-resonance argument.",
    consequences:
      "Excites the inclination of Mimas's orbit to 1.57 degrees relative to Saturn's ring plane.",
  },
  {
    id: "saturn_enceladus_dione",
    name: "Enceladus–Dione 2:1 Eccentricity Resonance",
    bodies: ["Enceladus", "Dione"],
    ratio: "2 : 1",
    type: "mean_motion",
    physicsMechanism:
      "Enceladus orbits Saturn twice for every orbit of Dione (periods 1.37 d vs 2.74 d).",
    consequences:
      "Maintains Enceladus's orbital eccentricity (e = 0.0047), supplying the tidal flexing energy that keeps its southern cryovolcanic ocean warm and erupting.",
  },
];
