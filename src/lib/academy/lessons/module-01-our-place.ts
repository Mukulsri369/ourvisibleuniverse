import type { LearningLevel, LessonContract, QuizQuestion, ScientificSource } from "../types";

export interface SubLesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  zoomLayerIndex: number;
  content: Record<
    LearningLevel,
    {
      summary: string;
      takeaway: string;
      deepDive: string;
      didYouKnow: string;
      mathOrAnalogy: string;
    }
  >;
}

export const MODULE_01_SUBLESSONS: SubLesson[] = [
  {
    id: "lesson-1-what-is-space",
    number: 1,
    title: "What is space?",
    subtitle: "The great cosmic expanse beyond Earth's atmosphere",
    description:
      "Explore the vacuum, gravity, radiation, and the invisible fabric connecting everything in the universe.",
    zoomLayerIndex: 0,
    content: {
      junior: {
        summary:
          "Space is the enormous, quiet ocean where the Moon, planets, and stars float. Unlike Earth, space has no air to breathe and no blue sky!",
        takeaway: "Space begins about 100 kilometers above our heads, where Earth's air ends.",
        deepDive:
          "Because there is no air in space, sound cannot travel. If a giant spaceship exploded right next to you, you wouldn't hear a peep! But astronauts can still talk using radio waves, which travel through empty space like light.",
        didYouKnow:
          "Astronauts grow up to 2 inches taller in space because gravity isn't squishing their spines!",
        mathOrAnalogy:
          "If Earth were an apple, our whole atmosphere of air would be as thin as the apple's peel.",
      },
      explorer: {
        summary:
          "Space is an almost perfect vacuum containing sparse particles of hydrogen, electromagnetic radiation, magnetic fields, and cosmic rays.",
        takeaway:
          "The Kármán line (100 km altitude) marks the boundary between aeronautics and astronautics.",
        deepDive:
          "We call space a 'vacuum' because there is almost no matter there. On Earth at sea level, one cubic centimeter of air contains 25 quintillion gas molecules. In deep interstellar space, a cubic centimeter may contain only one solitary hydrogen atom! However, space is not truly empty: it is permeated by gravitational fields and cosmic microwave radiation.",
        didYouKnow:
          "Even in the coldest voids of deep space, the temperature is 2.7 Kelvin (-270.45°C), warmed slightly by the echo of the Big Bang.",
        mathOrAnalogy:
          "At the speed of a jet airliner (900 km/h), flying straight up to the edge of space takes less than 7 minutes.",
      },
      astronomer: {
        summary:
          "Space is a dynamic four-dimensional spacetime continuum shaped by mass and energy according to Einstein's general relativity.",
        takeaway:
          "Vacuum density is dominated by dark energy (~68%) and dark matter (~27%), with baryonic matter accounting for only ~5%.",
        deepDive:
          "Quantum field theory shows that the classical vacuum does not exist. Even at absolute zero in empty space, quantum fluctuations constantly produce virtual particle-antiparticle pairs that annihilate in fractions of a femtosecond (the Casimir effect). Furthermore, space itself is metric: it can bend, compress near massive bodies, and expand over cosmic epochs.",
        didYouKnow:
          "The cosmological vacuum has an estimated dark energy density of approximately 6 x 10^-27 kg/m^3 (equivalent to about 6 protons per cubic meter).",
        mathOrAnalogy:
          "General relativity field equations: G_μν + Λ g_μν = (8πG / c^4) T_μν dictate how matter-energy curves the geometry of spacetime.",
      },
    },
  },
  {
    id: "lesson-2-earth-our-home",
    number: 2,
    title: "Earth: our home in space",
    subtitle: "A dynamic terrestrial biosphere sheltered by an iron dynamo",
    description:
      "Investigate why Earth is uniquely suited for life: liquid oceans, tectonic activity, and a protective magnetosphere.",
    zoomLayerIndex: 0,
    content: {
      junior: {
        summary:
          "Earth is our home planet! It is the only world in the solar system known to have liquid water oceans, fresh air to breathe, and millions of plants and animals.",
        takeaway: "Earth is just the right distance from the Sun—not too hot and not too cold!",
        deepDive:
          "Earth spins around like a giant top once every 24 hours to give us day and night. It also has a warm blanket of air called the atmosphere that keeps us cozy and protects us from falling meteorites.",
        didYouKnow:
          "Earth's oceans cover over 70% of its surface—that's why astronauts call it the 'Blue Marble'!",
        mathOrAnalogy:
          "Earth spins at its equator at over 1,600 kilometers per hour, yet we don't feel dizzy because the air and everything on Earth moves along with us smoothly.",
      },
      explorer: {
        summary:
          "Earth is the fifth-largest planet in the Solar System and the densest major body, orbiting in the Sun's circumstellar habitable zone.",
        takeaway:
          "A molten swirling iron-nickel outer core generates a protective magnetic shield that deflects deadly solar wind particles.",
        deepDive:
          "Earth's atmosphere is composed of 78% nitrogen, 21% oxygen, and 1% argon and trace gases like carbon dioxide and water vapor. Its geodynamo generates a magnetic dipole field extending tens of thousands of kilometers into space. When energetic solar flare particles hit this magnetic shield, they are guided toward the poles, igniting colorful auroras (Northern and Southern Lights).",
        didYouKnow:
          "Earth is the only rocky planet in the Solar System with active plate tectonics, recycling carbon and stabilizing our climate for billions of years.",
        mathOrAnalogy:
          "Mean equatorial radius = 6,378 km. Orbital velocity around the Sun = 29.78 km/s (over 107,000 km/h!).",
      },
      astronomer: {
        summary:
          "Earth is an oblate spheroid in a low-eccentricity heliocentric orbit (e = 0.0167) stabilized by an unusually massive satellite (the Moon).",
        takeaway:
          "The carbonate-silicate geochemical cycle acts as a planetary thermostat over megayear timescales.",
        deepDive:
          "Earth's rotational axis is tilted at 23.44°, inducing periodic seasonal insolation variations. Unlike Mars, whose obliquity fluctuates chaotically by tens of degrees over millions of years, Earth's axial tilt is dynamically stabilized by the gravitational torque of our large Moon. This rotational stability prevented catastrophic climate swings, allowing complex multicellular life to flourish.",
        didYouKnow:
          "Earth's escape velocity from the surface is 11.186 km/s (40,270 km/h). Any rocket escaping Earth must attain this kinetic threshold.",
        mathOrAnalogy:
          "Mass = 5.972 x 10^24 kg. Surface gravity g = 9.80665 m/s^2. Solar constant at 1 AU = 1361 W/m^2.",
      },
    },
  },
  {
    id: "lesson-3-earth-and-the-moon",
    number: 3,
    title: "Earth and the Moon",
    subtitle: "A double-world system bound by gravitational tides",
    description:
      "Understand the true scale of the Earth-Moon system, synchronous tidal locking, and celestial eclipses.",
    zoomLayerIndex: 1,
    content: {
      junior: {
        summary:
          "The Moon is Earth's closest neighbor in space. It doesn't make its own light; it shines like a giant mirror reflecting sunlight back to us!",
        takeaway: "The Moon takes about 27 days to travel once around Earth.",
        deepDive:
          "Because the Moon spins at the exact same speed that it travels around Earth, we always see the exact same face of the Moon! The other side is called the 'far side' of the Moon.",
        didYouKnow:
          "All thirty planets in our solar system could easily fit side-by-side in the space between Earth and the Moon!",
        mathOrAnalogy:
          "The Moon is 384,400 kilometers away. If you could drive a car to the Moon at highway speed without stopping, it would take about 5 months!",
      },
      explorer: {
        summary:
          "The Moon is Earth's only natural satellite, with a diameter of 3,474 km (roughly 27% of Earth's diameter) orbiting at an average semi-major axis of 384,400 km.",
        takeaway:
          "Gravitational tides have tidally locked the Moon into synchronous rotation: orbital period = rotational period (27.32 days).",
        deepDive:
          "The Giant Impact Hypothesis (Theia impact) posits that ~4.5 billion years ago, a Mars-sized protoplanet collided with the infant Earth. The vaporized debris formed an accretion ring around Earth that quickly coalesced into the Moon. Gravitational tidal friction gradually transfers angular momentum from Earth's rotation to the Moon's orbit, causing the Moon to recede from Earth at approximately 3.8 centimeters per year.",
        didYouKnow:
          "By an incredible cosmic coincidence, the Sun is 400 times wider than the Moon, but also 400 times farther away—making them appear almost identical in angular size (0.5°) in Earth's sky, enabling total solar eclipses!",
        mathOrAnalogy:
          "Moon mass = 7.342 x 10^22 kg (1/81 of Earth's mass). Surface gravity is 1.62 m/s^2 (about 1/6 of Earth's gravity).",
      },
      astronomer: {
        summary:
          "The Earth-Moon barycenter lies 4,671 km from Earth's center (inside Earth's mantle at ~73% of Earth's radius).",
        takeaway:
          "Orbital inclination of 5.145° to the ecliptic plane prevents solar and lunar eclipses from occurring every single month.",
        deepDive:
          "Eclipses only occur when the Moon is near the intersection points of its orbital plane and the ecliptic—known as the ascending and descending nodes. The regression of these orbital nodes completes a cycle every 18.61 years (the Saros cycle), governing global eclipse predictability. The Moon's lack of atmosphere results in surface temperature extremes from 120°C in direct sunlight to -130°C in lunar night (and -246°C in permanently shadowed craters at the south pole).",
        didYouKnow:
          "Apollo laser ranging retroreflectors left on the lunar surface still allow Earth observatories to measure the Earth-Moon distance with sub-centimeter laser precision.",
        mathOrAnalogy:
          "Lunar perigee is 362,600 km; apogee is 405,400 km (orbital eccentricity e = 0.0549).",
      },
    },
  },
  {
    id: "lesson-4-our-solar-system",
    number: 4,
    title: "Our Solar System",
    subtitle: "Eight planets, hundreds of moons, and trillions of icy comets orbiting the Sun",
    description:
      "Explore the Sun's gravitational dominion spanning from the scorched plains of Mercury out to the Oort Cloud.",
    zoomLayerIndex: 2,
    content: {
      junior: {
        summary:
          "Our Solar System is a giant cosmic family! In the center sits our superstar, the Sun, with eight unique planets circling around it like a carousel.",
        takeaway:
          "The four inner planets are rocky, while the four outer planets are gigantic gas and ice worlds!",
        deepDive:
          "Mercury, Venus, Earth, and Mars are made of solid rock and metal. Then comes giant Jupiter (large enough to swallow 1,300 Earths!) and Saturn with its dazzling icy rings. Furthest out are Uranus and Neptune, cold worlds of swirling blue slush and winds.",
        didYouKnow:
          "Jupiter has a giant red storm that has been spinning for hundreds of years—and the storm is bigger than planet Earth!",
        mathOrAnalogy:
          "If the Sun were the size of a front door, Earth would be the size of a small coin, and Jupiter would be the size of a baseball.",
      },
      explorer: {
        summary:
          "Formed 4.6 billion years ago from a collapsing molecular cloud, our Solar System contains 99.86% of its mass concentrated in the Sun.",
        takeaway:
          "Planetary distances are measured in Astronomical Units (AU), where 1 AU = 149.6 million km (mean Earth-Sun distance).",
        deepDive:
          "Between Mars (1.5 AU) and Jupiter (5.2 AU) lies the Main Asteroid Belt, containing millions of rocky fragments that failed to coalesce into a planet due to Jupiter's gravitational disruptions. Beyond Neptune (30 AU) lies the Kuiper Belt of icy dwarf worlds including Pluto, Haumea, and Makemake. Enclosing the entire system is the spherical Oort Cloud, extending up to 100,000 AU (~1.5 light-years) into interstellar space.",
        didYouKnow:
          "Light takes about 8 minutes to travel 1 AU to Earth, 43 minutes to reach Jupiter, and over 4 hours to reach Neptune.",
        mathOrAnalogy:
          "The Sun's mass is 1.989 x 10^30 kg—over 333,000 times the mass of Earth. It fuses 600 million metric tons of hydrogen into helium every second.",
      },
      astronomer: {
        summary:
          "The solar heliosphere is carved out by the supersonic solar wind expanding against the interstellar medium, terminating at the heliopause (~120 AU).",
        takeaway:
          "Planetary orbital motions closely follow Kepler's Three Laws and are dynamically ordered by mean-motion resonances.",
        deepDive:
          "The protoplanetary disk underwent fractional condensation: inside the 'frost line' (at ~2.7 AU), volatile compounds like water, ammonia, and methane could not condense as ice, restricting terrestrial planets to refractory silicates and metals. Outside the frost line, abundant ices allowed rapid accretion of massive 10-Earth-mass cores that triggered runaway gravitational capture of nebular hydrogen and helium gas.",
        didYouKnow:
          "Voyager 1 officially crossed the heliopause into pristine interstellar space in August 2012 at a distance of 121.6 AU from the Sun.",
        mathOrAnalogy:
          "Kepler's Third Law: P^2 = a^3 (where P is orbital period in Earth years, and a is semi-major axis in AU). For Jupiter: (11.86)^2 ≈ (5.20)^3 ≈ 140.7.",
      },
    },
  },
  {
    id: "lesson-5-the-milky-way-galaxy",
    number: 5,
    title: "The Milky Way Galaxy",
    subtitle: "Our barred spiral star city holding 100 to 400 billion stars",
    description:
      "Navigate through stellar discs, spiral arms, and the central supermassive black hole Sagittarius A*.",
    zoomLayerIndex: 4,
    content: {
      junior: {
        summary:
          "The Milky Way is our gigantic city of stars! When you look up on a very dark night in the country, you can see a glowing misty river across the sky—that is the edge of our galaxy.",
        takeaway: "Our Sun is just one little star among hundreds of billions in the Milky Way!",
        deepDive:
          "The Milky Way looks like an enormous spinning pinwheel with beautiful curling arms made of glowing stars, gas, and dust. Our Solar System lives in one of the peaceful side arms called the Orion Arm.",
        didYouKnow:
          "If you could count one star every single second without stopping to sleep, it would take you over 3,000 years to count the stars in our galaxy!",
        mathOrAnalogy:
          "Our galaxy is so gigantic that a beam of light traveling at top speed takes 100,000 years to cross from one side to the other.",
      },
      explorer: {
        summary:
          "The Milky Way is a barred spiral galaxy (Hubble type SBbc) with an estimated stellar disk diameter of 100,000 to 120,000 light-years.",
        takeaway:
          "Our Sun is located roughly 26,000 light-years from the galactic center, orbiting inside the Orion-Cygnus spiral arm.",
        deepDive:
          "At the exact gravitational center of our galaxy lies Sagittarius A* (pronounced 'Sagittarius A-star'), a supermassive black hole with a mass of 4.15 million times our Sun. Our Solar System hurtles around the galactic core at approximately 220 km/s (800,000 km/h). Even at this staggering velocity, it takes our Sun about 230 million Earth years to complete one single revolution—an astronomical duration known as a 'Cosmic Year'.",
        didYouKnow:
          "The last time our Solar System was in this exact position in the Milky Way, the earliest dinosaurs were just beginning to evolve on Earth during the Triassic period!",
        mathOrAnalogy:
          "Galactic disk thickness is roughly 1,000 light-years in the stellar disk, bulging to over 10,000 light-years in the central core.",
      },
      astronomer: {
        summary:
          "The Milky Way comprises a thin disk, thick disk, central bar/bulge, and an extended dark matter halo with a virial mass of ~1.15 x 10^12 M_sun.",
        takeaway:
          "Flat stellar rotation curves (v ~ 220 km/s out to tens of kiloparsecs) provided key observational evidence for dark matter halos.",
        deepDive:
          "Spiral arms are not rigid structures of stars rotating together like bicycle spokes—if they were, the 'winding problem' would wrap them into tightly wound curls in a few rotations. Instead, spiral arms are density waves: gravitational compression waves rippling through the interstellar medium that compress molecular clouds and trigger vigorous new star formation (Pop I stars) along the wave crests.",
        didYouKnow:
          "The Event Horizon Telescope (EHT) collaboration released the first direct radio silhouette image of Sagittarius A* in May 2022, confirming general relativistic photon orbits around a 4-million-solar-mass black hole.",
        mathOrAnalogy:
          "Oort constants (A ≈ +14.8 km/s/kpc, B ≈ -12.4 km/s/kpc) describe local differential galactic rotation measured by stellar proper motions.",
      },
    },
  },
  {
    id: "lesson-6-other-galaxies-and-universe",
    number: 6,
    title: "Other galaxies and the observable universe",
    subtitle: "From the Local Group to the cosmic web and cosmological horizon",
    description:
      "Understand the cosmic web, Laniakea, and the critical distinction between the observable bubble and the entire universe.",
    zoomLayerIndex: 6,
    content: {
      junior: {
        summary:
          "Our Milky Way is not alone! There are trillions of other galaxies across space. Some are round like giant eggs, and others are majestic spirals with sparkling blue arms.",
        takeaway:
          "The observable universe is the part of space we can see because its light has had time to reach our telescopes!",
        deepDive:
          "Because light takes time to travel through space, when we look at distant galaxies with telescopes like Hubble and James Webb, we are seeing them as they looked billions of years ago! It is just like looking back into a magical cosmic time machine.",
        didYouKnow:
          "Our closest big neighbor galaxy, Andromeda, is slowly moving toward us! But don't worry: our galaxies won't meet for about 4.5 billion years.",
        mathOrAnalogy:
          "If you look up at night and hold a grain of sand at arm's length against the sky, that tiny speck covers over 10,000 distant galaxies!",
      },
      explorer: {
        summary:
          "Galaxies group together into clusters and vast filaments called the Cosmic Web, separated by enormous empty cosmic voids.",
        takeaway:
          "CRITICAL CONCEPT: The observable universe is NOT the whole universe—it is only the sphere from which light has had time to reach us since the Big Bang (13.8 billion years ago).",
        deepDive:
          "Because space has been continuously expanding since the Big Bang 13.8 billion years ago, the matter that emitted the ancient light we see today has moved further away. Therefore, the comoving radius of the observable universe is currently about 46.5 billion light-years (a full diameter of 93 billion light-years!). Beyond our observable horizon, the universe likely continues indefinitely—perhaps even infinitely—filled with countless more galaxies that we simply cannot see yet because their light hasn't reached Earth.",
        didYouKnow:
          "Our galaxy belongs to the Local Group (with Andromeda and 80+ satellite galaxies), which is part of the enormous Laniakea Supercluster spanning 520 million light-years.",
        mathOrAnalogy:
          "There are an estimated 2 trillion (2 x 10^12) galaxies in the observable universe, containing more stars than all the grains of sand on all the beaches on Earth combined!",
      },
      astronomer: {
        summary:
          "The cosmological particle horizon delineates the causal boundary of the observable universe, governed by the FLRW metric and universal expansion.",
        takeaway:
          "The comoving particle horizon is r_p = c ∫_0^t dt' / a(t') ≈ 46.5 billion light-years (14.2 Gpc), corresponding to a comoving volume of ~3.6 x 10^80 m^3.",
        deepDive:
          "Cosmological redshift z = (λ_obs - λ_emit) / λ_emit is not a Doppler shift through static space; it is metric expansion stretching photon wavelengths during propagation. The cosmic web consists of gravitationally bound nodes (galaxy clusters), 1D filaments, 2D sheets, and vast underdense voids (e.g., Boötes Void, spanning ~330 million light-years across). Inflationary cosmology implies the total spatial geometry of the universe is extremely flat (Ω_k ≈ 0), suggesting the entire universe beyond our Hubble bubble may be physically infinite.",
        didYouKnow:
          "The Cosmic Microwave Background (CMB) radiation was emitted at redshift z ≈ 1100 during the recombination era, only 380,000 years after the Big Bang, when the universe cooled to ~3,000 Kelvin.",
        mathOrAnalogy:
          "Hubble's Law: v = H_0 * d (where H_0 ≈ 67.4 km/s/Mpc from Planck CMB measurements, and ~73 km/s/Mpc from Cepheid/Type Ia supernova distance ladders).",
      },
    },
  },
];

export interface ZoomLayer {
  index: number;
  name: string;
  tag: string;
  symbol: string;
  scaleLabel: string;
  logScaleMeters: number; // log10(meters)
  cameraDistance: number;
  description: string;
  earthLocationNote: string;
  schematicNotice: string;
  selectableObjects: {
    id: string;
    name: string;
    type: "Planet" | "Moon" | "Star" | "System" | "Galaxy" | "Cluster" | "Horizon";
    size: string;
    distanceFromEarth: string;
    info: string;
  }[];
}

export const COSMIC_ZOOM_LAYERS: ZoomLayer[] = [
  {
    index: 0,
    name: "Earth & Low Orbit",
    tag: "Home Biosphere",
    symbol: "🌍",
    scaleLabel: "12,742 km (10^7 m)",
    logScaleMeters: 7.1,
    cameraDistance: 3.2,
    description:
      "Our blue terrestrial world with nitrogen-oxygen atmosphere, liquid oceans, and continents.",
    earthLocationNote: "You are standing right here on the surface of Planet Earth!",
    schematicNotice: "Realistic planetary geometry and atmospheric illumination.",
    selectableObjects: [
      {
        id: "earth_body",
        name: "Planet Earth",
        type: "Planet",
        size: "12,742 km diameter",
        distanceFromEarth: "0 km (Surface)",
        info: "Terrestrial rocky planet with active plate tectonics, liquid water, and a protective magnetosphere.",
      },
      {
        id: "atmosphere_shell",
        name: "Earth's Atmosphere",
        type: "System",
        size: "100 km (Kármán Line)",
        distanceFromEarth: "0 to 100 km altitude",
        info: "78% Nitrogen, 21% Oxygen blanket filtering UV rays and burning incoming meteoroids.",
      },
      {
        id: "iss_orbit",
        name: "International Space Station Orbit",
        type: "System",
        size: "108 meters across",
        distanceFromEarth: "408 km altitude",
        info: "Crewed microgravity research laboratory orbiting Earth once every 92 minutes at 27,600 km/h.",
      },
    ],
  },
  {
    index: 1,
    name: "Earth & The Moon Orbit",
    tag: "Double World",
    symbol: "🌕",
    scaleLabel: "384,400 km (10^8 m)",
    logScaleMeters: 8.6,
    cameraDistance: 6.5,
    description:
      "The Earth-Moon gravitational dance. The Moon is tidally locked in synchronous orbit.",
    earthLocationNote: "Earth is the large blue sphere anchored at the center of the lunar orbit.",
    schematicNotice:
      "Distance compressed by 4x for simultaneous visibility of both bodies on screen.",
    selectableObjects: [
      {
        id: "moon_body",
        name: "The Moon",
        type: "Moon",
        size: "3,474 km diameter (27% of Earth)",
        distanceFromEarth: "384,400 km (1.28 light-seconds)",
        info: "Earth's only natural satellite, formed from the collision with protoplanet Theia 4.5 billion years ago.",
      },
      {
        id: "lunar_orbit_ring",
        name: "Lunar Orbit Ellipse",
        type: "System",
        size: "768,800 km major axis",
        distanceFromEarth: "363,000 to 405,000 km",
        info: "Slightly eccentric orbit (e = 0.055) inclined 5.1° to the ecliptic plane, causing periodic eclipse seasons.",
      },
    ],
  },
  {
    index: 2,
    name: "Our Solar System",
    tag: "Planetary Family",
    symbol: "🪐",
    scaleLabel: "100 AU (1.5 x 10^10 km)",
    logScaleMeters: 13.2,
    cameraDistance: 12.0,
    description:
      "The Sun holding eight major planets, asteroid belts, and icy Kuiper Belt objects.",
    earthLocationNote:
      "Earth is the 3rd blue planet orbiting at exactly 1.0 AU (150 million km) from the Sun.",
    schematicNotice:
      "Planetary sizes magnified relative to their orbits so all 8 worlds remain visible.",
    selectableObjects: [
      {
        id: "sun_star",
        name: "The Sun",
        type: "Star",
        size: "1,392,700 km diameter (109 Earths)",
        distanceFromEarth: "149.6 million km (1.0 AU / 8.3 light-minutes)",
        info: "G-type main-sequence star (G2V) containing 99.86% of the total mass of the Solar System.",
      },
      {
        id: "earth_orbit",
        name: "Earth & Orbit",
        type: "Planet",
        size: "12,742 km",
        distanceFromEarth: "Home world (1.0 AU from Sun)",
        info: "Orbiting in the circumstellar habitable zone with circular speed ~30 km/s.",
      },
      {
        id: "jupiter_planet",
        name: "Jupiter",
        type: "Planet",
        size: "139,820 km diameter (11 Earths)",
        distanceFromEarth: "588 to 968 million km (5.2 AU)",
        info: "Gas giant with 95 moons, a powerful magnetosphere, and the iconic Great Red Spot.",
      },
      {
        id: "kuiper_belt",
        name: "Kuiper Belt",
        type: "System",
        size: "30 to 55 AU",
        distanceFromEarth: "4.5 to 8.2 billion km",
        info: "Ring of icy bodies, comets, and dwarf planets including Pluto, Haumea, and Makemake.",
      },
    ],
  },
  {
    index: 3,
    name: "Local Stellar Neighborhood",
    tag: "Interstellar Bubble",
    symbol: "✨",
    scaleLabel: "50 Light-Years (10^17 m)",
    logScaleMeters: 17.7,
    cameraDistance: 18.0,
    description:
      "The sun surrounded by neighboring stars: Alpha Centauri, Sirius, Vega, and Procyon.",
    earthLocationNote:
      "Earth is orbiting our yellow dwarf star right in the center of the local bubble!",
    schematicNotice: "Stellar point markers enhanced with spectral colors (O, B, A, F, G, K, M).",
    selectableObjects: [
      {
        id: "solar_system_star",
        name: "Our Solar System (The Sun)",
        type: "Star",
        size: "1 Solar Radius",
        distanceFromEarth: "Center of Local Bubble",
        info: "Our yellow host star traveling at 220 km/s through the Local Interstellar Cloud.",
      },
      {
        id: "alpha_centauri",
        name: "Alpha Centauri Triple System",
        type: "System",
        size: "Rigil Kentaurus, Toliman & Proxima",
        distanceFromEarth: "4.24 light-years (40 trillion km)",
        info: "Our closest stellar neighbors. Red dwarf Proxima Centauri hosts habitable-zone exoplanet Proxima b.",
      },
      {
        id: "sirius_star",
        name: "Sirius (The Dog Star)",
        type: "Star",
        size: "1.7 Solar Radii (Sirius A & B)",
        distanceFromEarth: "8.6 light-years",
        info: "The brightest star in Earth's night sky, a binary system of an A-type star and white dwarf.",
      },
    ],
  },
  {
    index: 4,
    name: "The Milky Way Galaxy",
    tag: "Host Star City",
    symbol: "🌀",
    scaleLabel: "100,000 Light-Years (10^21 m)",
    logScaleMeters: 20.8,
    cameraDistance: 25.0,
    description:
      "Barred spiral galaxy with 100 to 400 billion stars rotating around Sagittarius A*.",
    earthLocationNote:
      "Look at the Orion-Cygnus spur! We are 26,000 light-years out from the center.",
    schematicNotice:
      "Galactic disk rotation and stellar arms rendered with density wave approximations.",
    selectableObjects: [
      {
        id: "sun_orion_spur",
        name: "Our Sun's Position (Orion Spur)",
        type: "Star",
        size: "1 Solar System Point",
        distanceFromEarth: "26,000 light-years from Galactic Center",
        info: "Nestled quietly between the Perseus and Sagittarius arms, taking 230 million years per orbit.",
      },
      {
        id: "sagittarius_a_star",
        name: "Sagittarius A* (Supermassive Black Hole)",
        type: "Star",
        size: "4.15 million solar masses",
        distanceFromEarth: "26,673 light-years",
        info: "The gravitational anchor of our galaxy with an event horizon ~24 million km wide.",
      },
      {
        id: "spiral_arms",
        name: "Galactic Spiral Arms",
        type: "Galaxy",
        size: "100,000 ly disk diameter",
        distanceFromEarth: "Encompassing the galaxy",
        info: "Major spiral arms: Scutum-Centaurus, Perseus, Sagittarius, and Norma, harboring active stellar nurseries.",
      },
    ],
  },
  {
    index: 5,
    name: "The Local Group & Clusters",
    tag: "Galactic Neighborhood",
    symbol: "🌌",
    scaleLabel: "10 Million Light-Years (10^23 m)",
    logScaleMeters: 23.0,
    cameraDistance: 32.0,
    description: "Over 80 gravitationally bound galaxies dominated by the Milky Way and Andromeda.",
    earthLocationNote: "Earth is inside the Milky Way galaxy, one of the two giant spiral anchors.",
    schematicNotice:
      "Galaxies rendered with exaggerated halos for clear spatial relationship mapping.",
    selectableObjects: [
      {
        id: "milky_way_obj",
        name: "Milky Way Galaxy",
        type: "Galaxy",
        size: "100,000 light-years across",
        distanceFromEarth: "We are inside it!",
        info: "Second largest galaxy in the Local Group, mass ~1.15 x 10^12 solar masses including dark matter.",
      },
      {
        id: "andromeda_m31",
        name: "Andromeda Galaxy (M31)",
        type: "Galaxy",
        size: "220,000 light-years across (1 Trillion stars)",
        distanceFromEarth: "2.537 million light-years",
        info: "Our largest sister galaxy, approaching the Milky Way at 110 km/s. In 4.5 billion years, our two galaxies will merge into 'Milkomeda'.",
      },
      {
        id: "triangulum_m33",
        name: "Triangulum Galaxy (M33)",
        type: "Galaxy",
        size: "60,000 light-years across",
        distanceFromEarth: "2.73 million light-years",
        info: "Third largest Local Group galaxy, an active spiral with intense starburst regions.",
      },
    ],
  },
  {
    index: 6,
    name: "The Observable Universe",
    tag: "Cosmological Horizon",
    symbol: "🔮",
    scaleLabel: "93 Billion Light-Years (10^26 m)",
    logScaleMeters: 26.9,
    cameraDistance: 42.0,
    description:
      "The cosmic web of billions of galaxies out to the Cosmic Microwave Background particle horizon.",
    earthLocationNote:
      "By observational definition, Earth is at the exact center of our own observable bubble!",
    schematicNotice:
      "Particle horizon boundary represents the distance light has traveled since the Big Bang.",
    selectableObjects: [
      {
        id: "laniakea_supercluster",
        name: "Laniakea Supercluster",
        type: "Cluster",
        size: "520 million light-years across",
        distanceFromEarth: "Our local cosmic watershed",
        info: "Gravitational basin of 100,000 galaxies flowing toward the Great Attractor.",
      },
      {
        id: "cosmic_web_filaments",
        name: "Cosmic Web Filaments & Voids",
        type: "System",
        size: "Billions of light-years",
        distanceFromEarth: "Spans all deep space",
        info: "Dark matter scaffolding directing galaxy distribution around colossal voids like the Boötes Void.",
      },
      {
        id: "cmb_horizon",
        name: "Observable Particle Horizon (CMB)",
        type: "Horizon",
        size: "93 billion light-years diameter (46.5 Gly radius)",
        distanceFromEarth: "46.5 billion light-years comoving distance",
        info: "The boundary beyond which ancient light has not yet had time to reach Earth. Space continues beyond it!",
      },
    ],
  },
];

// Interactive Activity 1: Rebuild the Cosmic Hierarchy Cards
export interface HierarchyCard {
  id: string;
  correctRank: number; // 1 to 6 (smallest to largest)
  title: string;
  scaleText: string;
  icon: string;
  hint: string;
}

export const HIERARCHY_CARDS: HierarchyCard[] = [
  {
    id: "card_earth",
    correctRank: 1,
    title: "1. Planet Earth",
    scaleText: "12,742 km",
    icon: "🌍",
    hint: "Our home planet where humans and living biospheres thrive.",
  },
  {
    id: "card_moon_sys",
    correctRank: 2,
    title: "2. Earth-Moon System",
    scaleText: "384,400 km",
    icon: "🌕",
    hint: "Earth and its gravitational satellite locked in synchronous orbit.",
  },
  {
    id: "card_solar_sys",
    correctRank: 3,
    title: "3. The Solar System",
    scaleText: "100 AU (~15 Billion km)",
    icon: "🪐",
    hint: "The Sun and all 8 orbiting planets and dwarf worlds.",
  },
  {
    id: "card_local_stars",
    correctRank: 4,
    title: "4. Local Stellar Neighborhood",
    scaleText: "50 Light-Years",
    icon: "✨",
    hint: "The cluster of nearby stars like Alpha Centauri, Sirius, and Vega.",
  },
  {
    id: "card_milky_way",
    correctRank: 5,
    title: "5. Milky Way Galaxy",
    scaleText: "100,000 Light-Years",
    icon: "🌀",
    hint: "Our island star city containing over 100 billion stars.",
  },
  {
    id: "card_observable_uni",
    correctRank: 6,
    title: "6. The Observable Universe",
    scaleText: "93 Billion Light-Years",
    icon: "🔮",
    hint: "The complete cosmic horizon from which light has reached us.",
  },
];

// Interactive Activity 2: Celestial Taxonomy Classification Challenge
export interface TaxonomyItem {
  id: string;
  name: string;
  category: "Planet/Moon" | "Star" | "Star System" | "Galaxy";
  icon: string;
  hint: string;
  explanation: string;
}

export const TAXONOMY_CHALLENGE_ITEMS: TaxonomyItem[] = [
  {
    id: "tax_jupiter",
    name: "Jupiter",
    category: "Planet/Moon",
    icon: "🪐",
    hint: "It orbits a star and does not produce nuclear fusion in its core.",
    explanation: "Correct! Jupiter is a gas giant planet, the largest planet in our Solar System.",
  },
  {
    id: "tax_sun",
    name: "The Sun",
    category: "Star",
    icon: "☀️",
    hint: "It fuses hydrogen into helium in its core and gives off its own light.",
    explanation: "Correct! The Sun is our central G-type main-sequence star.",
  },
  {
    id: "tax_solar_sys",
    name: "The Solar System",
    category: "Star System",
    icon: "🌐",
    hint: "A star together with all the planets, asteroids, and comets gravitationally bound to it.",
    explanation:
      "Spot on! A star system consists of one or more stars and the bodies orbiting them.",
  },
  {
    id: "tax_andromeda",
    name: "Andromeda (M31)",
    category: "Galaxy",
    icon: "🌀",
    hint: "A gargantuan congregation of hundreds of billions of stars, gas, and dark matter.",
    explanation: "Awesome! Andromeda is a spiral galaxy containing roughly 1 trillion stars.",
  },
  {
    id: "tax_titan",
    name: "Titan (Orbiting Saturn)",
    category: "Planet/Moon",
    icon: "🌑",
    hint: "It orbits a planet rather than orbiting the Sun directly.",
    explanation: "Exact! Titan is a natural satellite (moon), larger than planet Mercury.",
  },
  {
    id: "tax_betelgeuse",
    name: "Betelgeuse",
    category: "Star",
    icon: "🔴",
    hint: "A red supergiant in Orion that shines fiercely on its own.",
    explanation:
      "Correct! Betelgeuse is a massive red supergiant star nearing the end of its life.",
  },
  {
    id: "tax_alpha_centauri",
    name: "Alpha Centauri",
    category: "Star System",
    icon: "✨",
    hint: "A gravitationally bound trio of three stars (A, B, and Proxima).",
    explanation: "Spot on! Alpha Centauri is a triple star system 4.24 light-years away.",
  },
  {
    id: "tax_triangulum",
    name: "Triangulum (M33)",
    category: "Galaxy",
    icon: "🌌",
    hint: "A collection of 40 billion stars bound together in the Local Group.",
    explanation: "Correct! Triangulum is the third-largest spiral galaxy in our Local Group.",
  },
];

export const MODULE_01_LESSON: LessonContract = {
  lessonId: "lesson-01-cosmic-address",
  moduleId: "01",
  title: "Our Place in the Universe",
  objectives: [
    "Navigate the 6-tier hierarchical cosmic address of humanity",
    "Experience the cinematic 3D zoom from Earth out to the Observable Universe",
    "Understand why the observable universe is an observational boundary, not the entire cosmos",
    "Classify planets, moons, stars, star systems, and galaxies",
  ],
  visualizationType: "cosmic-scale",
  interactions: [
    "Signature 3D cosmic zoom controller with 7 continuous scale layers",
    "Where is Earth pinpoint locator reticle",
    "Rebuild the cosmic hierarchy sequencer",
    "Celestial taxonomy classification challenge",
    "Speed of light delay laboratory",
  ],
  completionCriteria:
    "Complete the 3D cosmic zoom, solve both interactive challenges, and achieve at least 70% on the science knowledge check.",
  scientificSources: [
    {
      title: "NASA Solar System Exploration: Our Cosmic Address",
      organization: "NASA",
      url: "https://science.nasa.gov/solar-system/",
      note: "Standard astronomical hierarchical classification from planetary bodies to superclusters.",
    },
    {
      title: "The Scale of the Observable Universe",
      organization: "ESA",
      url: "https://www.cosmos.esa.int/",
      note: "Cosmological distance ladders and observable particle horizons.",
    },
    {
      title: "Observable Universe",
      organization: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/Observable_universe",
      note: "Comprehensive overview of comoving distance and cosmic web structures.",
    },
  ],
  relatedConcepts: [
    "Vacuum of Space",
    "Earth-Moon System",
    "Solar System (AU)",
    "Milky Way Galaxy (Light-Year)",
    "Observable Universe vs Entire Universe",
    "Speed of Light Travel Time",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Have you ever wondered what your address looks like if a friendly alien wants to send you a postcard from outer space?",
      coreConcepts: [
        "Earth is our home planet orbiting the Sun.",
        "The Sun is just one star among hundreds of billions in our star city, the Milky Way.",
        "Space is gigantic, and our planet is a precious blue jewel floating safely in it!",
      ],
      explanatoryText:
        "When you write a letter to a friend, you write your room, your house number, your street, and your city. But what if we zoom all the way up into the clouds and into space? Your city is on planet Earth! Earth is the 3rd planet spinning around the Sun. Together with Mars, Jupiter, and Saturn, we make up the Solar System. And guess what? Our Solar System lives inside an enormous swirling city of stars called the Milky Way galaxy!",
      mathExplanation:
        "Earth is about 12,740 kilometers across. If Earth were the size of a marble, the Sun would be a giant exercise ball 100 meters away!",
      quizQuestions: [
        {
          id: "q-jr-1",
          question: "What is the name of our home planet in space?",
          options: ["Mars", "Earth", "Jupiter", "Venus"],
          correctIndex: 1,
          explanation:
            "That's right! We all live together on planet Earth, the wonderful blue planet with oceans and air.",
        },
        {
          id: "q-jr-2",
          question: "Which star does planet Earth travel around?",
          options: ["Polaris (The North Star)", "The Sun", "Betelgeuse", "Sirius"],
          correctIndex: 1,
          explanation:
            "Spot on! The Sun is our very own star that gives us daylight, warm weather, and energy to grow plants.",
        },
        {
          id: "q-jr-3",
          question: "What do we call our giant city of stars?",
          options: ["The Milky Way", "The Solar Train", "The Starlight Room", "The Moon Base"],
          correctIndex: 0,
          explanation:
            "Fantastic! The Milky Way is a majestic spiral galaxy containing over 100 billion stars, including our Sun.",
        },
        {
          id: "q-jr-4",
          question: "Is the part of space we can see the entire universe?",
          options: [
            "No, we can only see the part whose light has reached us!",
            "Yes, there is nothing outside what we can see",
            "No, space ends right past the Moon",
            "Yes, space is only 100 miles wide",
          ],
          correctIndex: 0,
          explanation:
            "Wonderful! The observable universe is just the region whose light has had time to travel to our eyes since the universe began.",
        },
      ],
      funFacts: [
        "Light travels so fast it could circle Earth 7 times in a single second!",
        "It takes 8 minutes for sunlight to travel from the Sun to your eyes on Earth.",
        "If you held a grain of sand at arm's length against the sky, that tiny patch holds thousands of distant galaxies!",
      ],
    },
    explorer: {
      introHook:
        "If you had to send your cosmic coordinates to a deep-space probe, what would your full universal address be?",
      coreConcepts: [
        "Cosmic Address Hierarchy: Earth -> Moon System -> Solar System -> Orion Spur -> Milky Way Galaxy -> Local Group -> Laniakea -> Observable Universe.",
        "The Observable Universe has a comoving diameter of ~93 billion light-years, but space likely continues far beyond this horizon.",
        "Light travels at a finite velocity (c = 300,000 km/s), turning deep-space telescopes into cosmic time machines.",
      ],
      explanatoryText:
        "To pinpoint any location in the vast cosmos, astronomers use an 8-level hierarchical address. Earth is a terrestrial rocky planet situated 1 Astronomical Unit (150 million km) from the Sun. Our solar system lies along the inner edge of the Orion-Cygnus spiral arm, approximately 26,000 light-years from the supermassive black hole at the center of the Milky Way. Our galaxy belongs to the Local Group—a gravitational neighborhood of about 80 galaxies—which in turn forms part of the gargantuan Laniakea Supercluster spanning 520 million light-years.",
      depthNotes:
        "IMPORTANT: The observable universe is NOT the whole universe. It is merely the spherical region centered on Earth from which electromagnetic radiation has had time to reach us since the Big Bang 13.8 billion years ago. Because the metric expansion of space has carried the original emission points farther away, its current radius is ~46.5 billion light-years.",
      mathExplanation:
        "1 Astronomical Unit (AU) = 1.496 x 10^8 km. 1 Light-Year = 9.46 x 10^12 km. The observable universe has a diameter of roughly 93 billion light-years.",
      quizQuestions: [
        {
          id: "q-ex-1",
          question: "In which spiral arm of the Milky Way galaxy does our Solar System reside?",
          options: ["Perseus Arm", "Scutum-Centaurus Arm", "Orion-Cygnus Arm", "Norma Arm"],
          correctIndex: 2,
          explanation:
            "Correct! Our Sun and all its planets orbit inside the Orion-Cygnus spur, nestled between the Sagittarius and Perseus arms.",
        },
        {
          id: "q-ex-2",
          question: "What does the term 'Observable Universe' specifically mean in astronomy?",
          options: [
            "The physical edge where empty space stops completely",
            "The sphere of space from which light has had time to reach us since the Big Bang",
            "Only the stars visible to the unaided human eye at night",
            "The region of space explored by human astronauts",
          ],
          correctIndex: 1,
          explanation:
            "Spot on! Because light travels at finite speed and the universe has a finite age (13.8 billion years), there is a cosmic horizon beyond which light has not yet reached us. Space itself continues beyond it!",
        },
        {
          id: "q-ex-3",
          question:
            "What massive supercluster contains our Local Group and over 100,000 other galaxies?",
          options: [
            "Laniakea Supercluster",
            "Coma Cluster",
            "Bootes Void",
            "Perseus-Pisces Supercluster",
          ],
          correctIndex: 0,
          explanation:
            "Awesome! Laniakea (meaning 'immense heaven' in Hawaiian) was mapped in 2014 by tracing gravitational velocity flows.",
        },
        {
          id: "q-ex-4",
          question: "How long does it take for light from the Sun to reach Earth?",
          options: ["1.3 seconds", "8.3 minutes", "4.2 hours", "1 year"],
          correctIndex: 1,
          explanation:
            "Correct! At 300,000 km/s across 150 million kilometers (1 AU), sunlight takes approximately 8 minutes and 20 seconds to reach Earth.",
        },
      ],
      funFacts: [
        "The last time our Solar System was in this exact spot in the Milky Way, early dinosaurs were just beginning to walk on Earth!",
        "Voyager 1, traveling at 61,000 km/h since 1977, is still less than 1 light-day away from Earth.",
        "The observable universe contains an estimated 2 trillion galaxies.",
      ],
    },
    astronomer: {
      introHook:
        "How do cosmologists bridge 41 orders of physical magnitude from the subatomic Planck scale to the 93-billion-light-year cosmological particle horizon?",
      coreConcepts: [
        "Metric scaling across logarithmic decades (10^7 m planetary diameter to 10^26 m cosmological horizon).",
        "Gravitational binding thresholds: from gravitationally bound structures (Local Group) to Hubble-flow-dominated isotropic expansion.",
        "The Cosmological Particle Horizon: r_p = c ∫ dt/a(t), distinguishing causal observational bounds from spatial topology.",
      ],
      explanatoryText:
        "Our location in the universe can be formally defined across fundamental cosmological structures. Earth (radius ~6,371 km) is gravitationally bound in a heliocentric orbit (semi-major axis ~1.000 AU, eccentricity 0.0167). The Sun orbits Sagittarius A* at ~8.2 kpc with a circular velocity of ~220 km/s. The Milky Way (baryonic mass ~10^11 M_sun, halo mass ~10^12 M_sun) is virialized within the Local Group (diameter ~3 Mpc). Beyond the Local Group, universal metric expansion (H0 ~ 70 km/s/Mpc) overcomes local gravitation, driving structures toward the cosmic filamentary web with a particle horizon currently measured at comoving radius R ~ 46.5 billion light-years.",
      depthNotes:
        "The Great Attractor, located in the direction of Centaurus, pulls both the Milky Way and surrounding galaxies toward a gravitational basin of attraction at the core of the Laniakea Supercluster. Cosmic inflation predicts that the unobservable global universe is at least 10^23 times larger than our observable particle horizon, and potentially spatially infinite.",
      mathExplanation:
        "Logarithmic scale comparison: Earth diameter ~1.27 x 10^7 m. Solar System to Kuiper Belt ~1.5 x 10^13 m (100 AU). Milky Way diameter ~1.0 x 10^21 m (100 kly). Observable universe horizon ~8.8 x 10^26 m (93 Gly). Dynamic span: ~10^20 spatial scale factors.",
      quizQuestions: [
        {
          id: "q-ast-1",
          question:
            "At what structural scale does gravitational binding give way to metric spacetime expansion (Hubble flow)?",
          options: [
            "Within planetary star systems (<0.1 pc)",
            "Between stars in galactic disks (<10 kpc)",
            "Beyond galaxy groups and clusters (>3 to 5 Mpc)",
            "Only at the edge of the observable horizon (>10 Gpc)",
          ],
          correctIndex: 2,
          explanation:
            "Precisely! Within galaxy clusters and groups (like the Local Group), local gravity easily overcomes the cosmic expansion. Metric expansion dominates at scales exceeding ~3–5 Mpc.",
        },
        {
          id: "q-ast-2",
          question:
            "Why is the comoving diameter of the observable universe ~93 billion light-years if the universe is only 13.8 billion years old?",
          options: [
            "Because light traveled faster in the past",
            "Because space itself has expanded continuously while the light was traveling",
            "Because the measurement includes parallel universes",
            "Because gravity bends all light beams into circular loops",
          ],
          correctIndex: 1,
          explanation:
            "Exact! The metric expansion of space has stretched the distance between Earth and the distant matter that emitted that early light, bringing the current comoving radius to ~46.5 Gly and diameter to ~93 Gly.",
        },
        {
          id: "q-ast-3",
          question:
            "What gravitational anomaly acts as the gravitational basin of attraction for the Laniakea Supercluster?",
          options: [
            "The Boötes Void",
            "The Great Attractor / Norma Cluster",
            "Sagittarius A*",
            "The Crab Pulsar",
          ],
          correctIndex: 1,
          explanation:
            "Spot on! The Great Attractor is a gravitational focal point in the direction of Hydra and Centaurus toward which our galaxy and thousands of others are streaming at ~600 km/s.",
        },
      ],
      funFacts: [
        "Due to cosmic expansion, the light emitted by the most distant observable galaxies was emitted when those galaxies were only a few billion light-years away from our proto-Milky Way.",
        "Over 99.999999999999% of the volume of the observable universe is absolute vacuum.",
        "The Cosmic Microwave Background confirms our peculiar motion through space is 369 km/s relative to the cosmic rest frame.",
      ],
    },
  },
};
