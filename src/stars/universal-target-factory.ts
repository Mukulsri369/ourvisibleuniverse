// @ts-nocheck
import { type UniversalTarget } from "./store";
import { PLANETS, AU } from "./Planets";
import { NAMED_STARS, type NamedStar } from "./data";
import { OBSERVED_OBJECTS, type ObservedObject } from "./observed-objects";
import { OBSERVATIONAL_GALAXY_CATALOG, type ObservationalGalaxy } from "./galaxy-catalog";
import { JPL_PLANETS_PHYSICAL } from "@/lib/astronomy/jpl/planetary-physical-data";
import { REAL_SYSTEMS } from "./real-exoplanets";

export function createTargetFromPlanet(
  planetName: string,
  moonName?: string,
): UniversalTarget | null {
  const planet = PLANETS.find((p) => p.name === planetName);
  if (!planet) return null;

  const moon = moonName ? planet.moons?.find((m) => m.name === moonName) : undefined;
  const phys = JPL_PLANETS_PHYSICAL[planet.name];
  const moonPhys = phys?.moons.find((m) => m.name === moonName);

  if (moon) {
    const parentDistLy = (planet.a / AU) * 1.58125e-5;
    return {
      id: `moon_${moon.name}`,
      name: moon.name,
      type: "moon",
      subtitle: `Natural satellite of ${planet.name}`,
      category: "Natural Satellite",
      distanceLy: parentDistLy,
      radiusKm: moonPhys?.radiusKm || moon.size * 2500,
      radiusEarth: (moonPhys?.radiusKm || moon.size * 2500) / 6371,
      parentName: planet.name,
      parentType: "planet",
      description: {
        explorer: `${moon.name} is a natural moon orbiting ${planet.name}. It travels around its parent planet in an orbit shaped by gravity.`,
        standard: `${moon.name} is a major satellite of ${planet.name} at a semi-major axis of ${(moon.distance * 1000).toLocaleString()} km with a synchronous orbital period.`,
        advanced: `Tidally locked natural satellite in Laplace/mean-motion resonance with parent ${planet.name}. Surface geology and tidal dissipation driven by gravitational torque.`,
      },
      formationAndEvolution: `Formed either through primordial accretion in the circumplanetary disk of ${planet.name} or captured via three-body gravitational interaction during early solar system migration.`,
      telescopeObservations: `Observed by NASA Galileo, Cassini-Huygens, New Horizons, Voyager missions, and Earth-based radar interferometry.`,
      isSimulatedOrModelled: true,
      modelledDetailsNote: `Surface textures are reconstructed from NASA/JPL mission flyby imagery and digital elevation maps.`,
      citations: [
        "NASA Jet Propulsion Laboratory DE440 Planetary Ephemerides",
        "IAU Working Group on Cartographic Coordinates and Rotational Elements",
        "Cassini-Huygens / Galileo Mission Science Archive",
      ],
      rawEntity: moon,
    };
  }

  const pDistLy = (planet.a / AU) * 1.58125e-5;
  const radiusKm = phys?.radiusKm || 6371;

  return {
    id: `planet_${planet.name}`,
    name: planet.name,
    type: "planet",
    subtitle: `${phys?.type || "Major"} planet in the Solar System`,
    category: "Solar System World",
    distanceLy: pDistLy,
    radiusKm,
    radiusEarth: radiusKm / 6371,
    massEarth: phys?.massEarth || 1,
    temperatureK: phys?.temperatureK || 288,
    parentName: "Sun",
    parentType: "star",
    children: (planet.moons || []).map((m) => ({
      id: `moon_${m.name}`,
      name: m.name,
      type: "moon",
      distance: `${(m.distance * 1000).toLocaleString()} km`,
    })),
    description: {
      explorer: `${planet.name} is one of the eight major planets traveling around the Sun in our Solar System.`,
      standard: `${planet.name} orbits the Sun at an average distance of ${(planet.a / AU).toFixed(2)} AU (${(planet.a * 149.6).toFixed(1)} million km) with an orbital period of ${planet.period} Earth years.`,
      advanced: `Hydrostatic equilibrium planetary body orbiting at semi-major axis a = ${(planet.a / AU).toFixed(4)} AU with eccentricity e = ${phys?.eccentricity ?? 0.0167}. Atmosphere exhibits distinct Rayleigh scattering and terminator extinction.`,
    },
    formationAndEvolution: `Accreted ~4.567 billion years ago from the protoplanetary gas and dust disk surrounding the young proto-Sun, undergoing core differentiation and subsequent planetary migration.`,
    telescopeObservations: `Tracked from antiquity and mapped in detail by NASA, ESA, JAXA, and ISRO interplanetary orbiters, landers, and space telescopes.`,
    isSimulatedOrModelled: true,
    modelledDetailsNote: `Surface terrain and atmospheric scattering models use NASA DE440 ephemerides combined with physical Rayleigh and Mie phase functions.`,
    citations: [
      "NASA JPL Solar System Dynamics DE440/LE440",
      "NASA Planetary Data System (PDS)",
      "IAU Commission 16 Physical Study of Planets and Satellites",
    ],
    rawEntity: planet,
  };
}

export function createTargetFromStar(star: NamedStar): UniversalTarget {
  const gaiaStar = (star as any).gaiaSourceId ? (star as any) : null;
  const exoplanets = REAL_SYSTEMS[star.name] || [];

  return {
    id: `star_${star.name}`,
    name: star.name,
    type: "star",
    subtitle: `${star.spectral} Spectral Class · ${star.constellation || "Milky Way"}`,
    category: `Stellar System (${star.spectral})`,
    distanceLy: star.distance,
    apparentMagnitude: (star as any).apparentMagnitude ?? 1.5,
    absoluteMagnitude: (star as any).absoluteMagnitude ?? 4.0,
    radiusSolar: star.radius,
    temperatureK: star.temperature,
    spectralType: star.spectral,
    constellation: star.constellation,
    ra: star.ra,
    dec: star.dec,
    galacticL: star.galacticL,
    galacticB: star.galacticB,
    parentName: "Milky Way",
    parentType: "galaxy",
    children: [
      ...(star.companions || []).map((c) => ({
        id: `comp_${c.name}`,
        name: c.name,
        type: "star" as const,
        distance: `Binary companion (${c.spectral})`,
      })),
      ...exoplanets.map((e) => ({
        id: `exo_${e.name}`,
        name: e.name,
        type: "exoplanet" as const,
        distance: `a = ${e.aAU.toFixed(3)} AU`,
      })),
    ],
    description: {
      explorer: `${star.name} is a shining star located ${star.distance.toFixed(1)} light-years away from Earth. Its surface temperature is ${star.temperature.toLocaleString()} degrees Kelvin.`,
      standard: `${star.name} is a ${star.spectral}-type star in the constellation ${star.constellation || "Milky Way"} with a luminosity of ${star.luminosity} times that of our Sun and a radius of ${star.radius} solar radii.`,
      advanced: `Main-sequence/evolved stellar object with effective temperature Teff = ${star.temperature} K, Planckian color coordinates, and astrometry confirmed by ESA Gaia DR3 parallax of ${(1000 / (star.distance / 3.26156)).toFixed(2)} mas.`,
    },
    formationAndEvolution: `Formed within a molecular gas cloud collapse in the galactic thin disk through gravitational fragmentation and Jeans instability, producing thermonuclear hydrogen fusion in its stellar core.`,
    telescopeObservations: `Astrometrically cataloged by ESA Gaia DR3, Hipparcos, and monitored across optical, infrared, and ultraviolet wavelengths by ground-based and orbital observatories.`,
    isSimulatedOrModelled: false,
    citations: [
      "ESA Gaia DR3 Catalog (Gaia Collaboration 2022)",
      "Bailer-Jones et al. (2021) Geometric Distances from Gaia EDR3",
      "SIMBAD Astronomical Database (CDS Strasbourg)",
    ],
    rawEntity: star,
  };
}

export function createTargetFromGalaxy(galaxy: ObservationalGalaxy): UniversalTarget {
  return {
    id: `galaxy_${galaxy.name}`,
    name: galaxy.name,
    type: "galaxy",
    subtitle: `${galaxy.morphologyClass || galaxy.type} · ${galaxy.hostGroup || "Local Group"}`,
    category: `Galaxy (${galaxy.morphologyClass || galaxy.type})`,
    distanceLy: galaxy.distance,
    radiusKm: (galaxy.size * 9.461e12) / 2,
    redshift: galaxy.redshift,
    morphology: galaxy.morphologyClass || galaxy.type,
    parentName: galaxy.hostGroup || "Universe",
    parentType: "cluster",
    description: {
      explorer: `${galaxy.name} is a gigantic island of hundreds of billions of stars, gas, and dust traveling through the universe ${formatDistance(galaxy.distance)} from us.`,
      standard: `${galaxy.name} is an extragalactic ${galaxy.morphologyClass || galaxy.type} system spanning roughly ${formatDistance(galaxy.size)} across, cataloged by the NASA/IPAC Extragalactic Database.`,
      advanced: `Extragalactic system at cosmological redshift z = ${galaxy.redshift.toFixed(5)} with angular diameter and inclination angles derived from NED isophotal surface photometry.`,
    },
    formationAndEvolution: `Assembled hierarchically through cold dark matter halo mergers, gas cooling, and primordial accretion shocks since the cosmic dawn epoch (z > 6).`,
    telescopeObservations: `Observed by NASA Hubble Space Telescope, James Webb Space Telescope (JWST), Spitzer, and ground-based multi-wavelength survey arrays.`,
    isSimulatedOrModelled: true,
    modelledDetailsNote: `Internal 3D stellar density distribution and spiral arm structures are reconstructed using measured inclination and position angles with empirical exponential disk profiles.`,
    citations: [
      "NASA/IPAC Extragalactic Database (NED)",
      "Freedman et al. Local Group Distance Scales",
      "Third Reference Catalogue of Bright Galaxies (RC3)",
    ],
    rawEntity: galaxy,
  };
}

export function createTargetFromObservedObject(obj: ObservedObject): UniversalTarget {
  const type: any =
    obj.category === "Black Hole"
      ? "black_hole"
      : obj.category === "Nebula"
        ? "nebula"
        : obj.category === "Quasar"
          ? "quasar"
          : "pulsar";

  return {
    id: `observed_${obj.id}`,
    name: obj.name,
    type,
    subtitle: `${obj.category} · ${obj.subtype}`,
    category: `${obj.category} (${obj.subtype})`,
    distanceLy: obj.distance,
    parentName: "Milky Way",
    parentType: "galaxy",
    description: {
      explorer: `${obj.name} is an extraordinary deep-space landmark located ${formatDistance(obj.distance)} away. ${obj.description}`,
      standard: `${obj.name} (${obj.aliases.join(", ")}) is a ${obj.subtype.toLowerCase()} in the ${obj.category.toLowerCase()} category spanning ${formatDistance(obj.size)} across.`,
      advanced: `Astrophysical high-energy compact or volumetric structure with emission profiles characterized by multi-wavelength space observatory datasets.`,
    },
    formationAndEvolution: `Formed through core-collapse supernova explosion, stellar death mass ejection, or supermassive black hole accretion in galactic nucleosynthesis.`,
    telescopeObservations: `Observed extensively across radio, optical, X-ray, and gamma-ray spectra by Chandra, Hubble, JWST, VLA, and Event Horizon Telescope.`,
    isSimulatedOrModelled: true,
    modelledDetailsNote: `Volumetric ray-marched shaders simulate gas emission lines (H-alpha, [O III]), dust extinction, and synchrotron relativistic geometries.`,
    citations: [
      "NASA Astrophysics Data System (ADS)",
      "Chandra X-Ray Observatory Science Archive",
      "Messier / New General Catalogue (NGC) Database",
    ],
    rawEntity: obj,
  };
}

function formatDistance(ly: number): string {
  if (ly < 0.0001) return `${(ly * 63241).toFixed(2)} AU`;
  if (ly >= 1e9) return `${(ly / 1e9).toFixed(2)} billion light-years`;
  if (ly >= 1e6) return `${(ly / 1e6).toFixed(2)} million light-years`;
  if (ly >= 1e3) return `${(ly / 1e3).toFixed(1)}k light-years`;
  return `${ly.toFixed(1)} light-years`;
}
