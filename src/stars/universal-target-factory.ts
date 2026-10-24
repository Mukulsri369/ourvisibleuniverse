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
  const exoplanets = REAL_SYSTEMS[star.name] || [];
  const dist = star.distance ?? 0;
  const temp = star.temperature ?? 5778;

  return {
    id: `star_${star.name}`,
    name: star.name,
    type: "star",
    subtitle: `${star.spectral || "G2V"} Spectral Class · ${star.constellation || "Milky Way"}`,
    category: `Stellar System (${star.spectral || "G2V"})`,
    distanceLy: dist,
    apparentMagnitude: star.magnitude ?? (star as any).apparentMagnitude ?? 1.5,
    absoluteMagnitude: star.absMagnitude ?? (star as any).absoluteMagnitude ?? 4.0,
    radiusSolar: star.radius ?? 1,
    massSolar: star.mass ?? 1,
    temperatureK: temp,
    spectralType: star.spectral || "G2V",
    constellation: star.constellation || "Milky Way",
    ra: star.ra || "00h 00m",
    dec: star.dec || "+00° 00'",
    galacticL: star.galacticL ?? 0,
    galacticB: star.galacticB ?? 0,
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
        distance: `a = ${(e.aAU ?? 1).toFixed(3)} AU`,
      })),
    ],
    description: {
      explorer: `${star.name} is a shining star located ${dist.toFixed(1)} light-years away from Earth. Its surface temperature is ${temp.toLocaleString()} degrees Kelvin.`,
      standard: `${star.name} is a ${star.spectral || "G2V"}-type star in the constellation ${star.constellation || "Milky Way"} with a luminosity of ${star.luminosity ?? 1} times that of our Sun and a radius of ${star.radius ?? 1} solar radii.`,
      advanced: `Main-sequence/evolved stellar object with effective temperature Teff = ${temp} K, Planckian color coordinates, and astrometry confirmed by ESA Gaia DR3 parallax of ${dist > 0 ? (1000 / (dist / 3.26156)).toFixed(2) : "—"} mas.`,
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
  const dist = galaxy.distance ?? 0;
  const size = galaxy.size ?? 50000;
  const z = galaxy.redshift ?? 0;
  return {
    id: `galaxy_${galaxy.name}`,
    name: galaxy.name,
    type: "galaxy",
    subtitle: `${galaxy.morphologyClass || galaxy.type} · ${galaxy.hostGroup || "Local Group"}`,
    category: `Galaxy (${galaxy.morphologyClass || galaxy.type})`,
    distanceLy: dist,
    radiusKm: (size * 9.461e12) / 2,
    redshift: z,
    galacticL: galaxy.l,
    galacticB: galaxy.b,
    morphology: galaxy.morphologyClass || galaxy.type,
    parentName: galaxy.hostGroup || "Universe",
    parentType: "cluster",
    description: {
      explorer: `${galaxy.name} is a gigantic island of hundreds of billions of stars, gas, and dust traveling through the universe ${formatDistance(dist)} from us.`,
      standard: `${galaxy.name} is an extragalactic ${galaxy.morphologyClass || galaxy.type} system spanning roughly ${formatDistance(size)} across, cataloged by the NASA/IPAC Extragalactic Database.`,
      advanced: `Extragalactic system at cosmological redshift z = ${z.toFixed(5)} with angular diameter and inclination angles derived from NED isophotal surface photometry.`,
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
  const catLower = (obj.category || "").toLowerCase();
  const type: any =
    catLower.includes("black hole") || catLower.includes("gravitational")
      ? "black_hole"
      : catLower.includes("nebula") || catLower.includes("remnant")
        ? "nebula"
        : catLower.includes("quasar")
          ? "quasar"
          : catLower.includes("cluster")
            ? "cluster"
            : "pulsar";

  const sizeLy = obj.diameterLy ?? (obj as any).size ?? 1;
  const distLy = obj.distance ?? 0;

  return {
    id: `observed_${obj.id}`,
    name: obj.name,
    type,
    subtitle: `${obj.category} · ${obj.subtype}`,
    category: `${obj.category} (${obj.subtype})`,
    distanceLy: distLy,
    radiusKm: (sizeLy * 9.4607e12) / 2,
    massSolar: obj.compactPhysics?.massSolar,
    galacticL: obj.l,
    galacticB: obj.b,
    parentName: distLy > 200000 ? "Extragalactic Space" : "Milky Way",
    parentType: "galaxy",
    description: {
      explorer: `${obj.name} is an extraordinary deep-space landmark located ${formatDistance(distLy)} away. ${obj.description}`,
      standard: `${obj.name}${obj.aliases?.length ? ` (${obj.aliases.join(", ")})` : ""} is a ${obj.subtype.toLowerCase()} in the ${obj.category.toLowerCase()} category spanning ${formatDistance(sizeLy)} across.`,
      advanced: `Astrophysical high-energy compact or volumetric structure with emission profiles characterized by multi-wavelength space observatory datasets (${obj.observed}).`,
    },
    formationAndEvolution: `Formed through core-collapse supernova explosion, stellar death mass ejection, or supermassive black hole accretion in galactic nucleosynthesis.`,
    telescopeObservations: `Observed extensively across ${obj.observed || "multi-wavelength spectra"} (${obj.source || "NASA / ESA"}).`,
    isSimulatedOrModelled: true,
    modelledDetailsNote:
      obj.visualNote ||
      `Volumetric ray-marched shaders simulate gas emission lines (H-alpha, [O III]), dust extinction, and synchrotron relativistic geometries.`,
    citations: [
      obj.compactPhysics?.publishedCitation || obj.source || "NASA Astrophysics Data System (ADS)",
      "Chandra X-Ray Observatory & Hubble Space Telescope Archive",
      "Messier / New General Catalogue (NGC) Database",
    ],
    rawEntity: obj,
  };
}

function formatDistance(ly: number): string {
  if (typeof ly !== "number" || !Number.isFinite(ly)) return "Unknown";
  if (ly < 1e-8) return `${Math.max(1, Math.round(ly * 9.4607e12)).toLocaleString()} km`;
  if (ly < 0.01) return `${(ly * 63241).toFixed(2)} AU`;
  if (ly >= 1e9) return `${(ly / 1e9).toFixed(2)} billion light-years`;
  if (ly >= 1e6) return `${(ly / 1e6).toFixed(2)} million light-years`;
  if (ly >= 1e3) return `${(ly / 1e3).toFixed(1)}k light-years`;
  return `${ly.toFixed(1)} light-years`;
}

export function createTargetFromExoplanet(star: NamedStar, planet: any): UniversalTarget {
  const rEarth = planet.radiusEarth ?? 1;
  const mEarth = planet.massEarth ?? 1;
  const aAU = planet.aAU ?? 1;
  const pYears = planet.periodYears ?? 0.1;
  const teqK = planet.teqK ?? 288;
  const ecc = planet.e ?? 0;
  const dist = star.distance ?? 0;
  const radiusKm = rEarth * 6371;
  const periodDays = pYears * 365.25;
  return {
    id: `exo_${planet.name}`,
    name: planet.name,
    type: "exoplanet",
    subtitle: `${planet.kind || "Exoplanet"} · Host: ${star.name} (${star.spectral || "G2V"})`,
    category: `${planet.observed ? "Confirmed" : "Modelled"} ${planet.kind || "Exoplanet"}`,
    distanceLy: dist,
    radiusKm,
    radiusEarth: rEarth,
    massEarth: mEarth,
    temperatureK: teqK,
    ra: star.ra,
    dec: star.dec,
    galacticL: star.galacticL,
    galacticB: star.galacticB,
    parentName: star.name,
    parentType: "star",
    description: {
      explorer: `${planet.name} is a ${planet.kind?.toLowerCase() || "planet"} orbiting the star ${star.name}, located ${dist.toFixed(1)} light-years from Earth.`,
      standard: `${planet.name} orbits ${star.name} (${star.spectral || "G2V"}) at a semi-major axis of ${aAU.toFixed(4)} AU with an orbital period of ${periodDays < 365 ? `${periodDays.toFixed(2)} days` : `${pYears.toFixed(2)} years`} and an equilibrium temperature of ${Math.round(teqK)} K (ESI ${planet.esi?.toFixed(2) ?? "—"}).`,
      advanced: `${planet.observed ? "Confirmed NASA Exoplanet Archive" : "Keplerian synthetic"} planetary body with radius R = ${rEarth.toFixed(2)} R⊕, mass M = ${mEarth.toFixed(2)} M⊕, eccentricity e = ${ecc.toFixed(3)}, and ${planet.tidallyLocked ? "synchronous 1:1 spin-orbit tidal lock" : "free prograde rotation"}.`,
    },
    formationAndEvolution: `Accreted within the circumstellar protoplanetary disk of ${star.name} (${star.spectral || "G2V"}, T_eff = ${star.temperature ?? 5778} K) via core accretion and pebble drift${aAU < 0.1 ? ", followed by inward Type I/II disk migration into a close-in orbit" : ""}.`,
    telescopeObservations: planet.observed
      ? `Confirmed in the NASA Exoplanet Archive via precision radial-velocity spectroscopy, transit photometry (Kepler / TESS / JWST), direct coronagraphic imaging, or pulsar timing astrometry.`
      : `Modelled planetary companion synthesized from Kepler's Third Law and empirical mass-radius relations (Chen & Kipping 2017) around ${star.name}.`,
    isSimulatedOrModelled: !planet.observed,
    modelledDetailsNote: `Surface terrain, cloud decks, and Rayleigh/Mie atmospheric limb scattering are procedurally synthesized from equilibrium temperature (${Math.round(teqK)} K), stellar insolation, and bulk density.`,
    citations: [
      "NASA Exoplanet Science Institute (NExScI) Confirmed Planets Archive",
      "Chen & Kipping (2017) ApJ 834, 17 — Probabilistic Mass-Radius Forecasting",
      "Kopparapu et al. (2013) ApJ 765, 131 — Habitable Zones Around Main-Sequence Stars",
    ],
    rawEntity: { star, planet },
  };
}

