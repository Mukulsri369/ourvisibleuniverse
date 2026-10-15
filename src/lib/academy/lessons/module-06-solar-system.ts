import type { LessonContract, QuizQuestion, ScientificSource, LearningLevel } from "../types";

export interface SubLesson {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  content: Record<
    LearningLevel,
    {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    }
  >;
}

export interface PlanetaryData {
  name: string;
  category: "Terrestrial Planet" | "Gas Giant" | "Ice Giant" | "Dwarf Planet" | "Star";
  diameterKm: number;
  diameterEarthRatio: number;
  massKgExp: string; // e.g. "5.97 × 10^24"
  massEarthRatio: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  rotationNotes?: string;
  gravityMps2: number;
  gravityEarthRatio: number;
  meanTempC: number;
  tempRangeC: string;
  distanceAu: number;
  distanceMillionKm: number;
  moonsCount: number;
  hasRings: boolean;
  atmosphereMajor: string[];
  imagingType: "Illustrative 3D Rendering" | "Direct Spacecraft Photographic Mosaic";
  imagingNote: string;
  funFact: string;
}

export const PLANETARY_FACTS: Record<string, PlanetaryData> = {
  Sun: {
    name: "Sun",
    category: "Star",
    diameterKm: 1392700,
    diameterEarthRatio: 109.2,
    massKgExp: "1.989 × 10^30",
    massEarthRatio: 333000,
    orbitalPeriodDays: 8.4e7, // Galactic orbit ~230 Myr
    rotationPeriodHours: 609.6, // ~25.4 days at equator (differential)
    rotationNotes: "Differential rotation (25 days at equator, 35 days at poles)",
    gravityMps2: 274.0,
    gravityEarthRatio: 27.9,
    meanTempC: 5500, // Photosphere
    tempRangeC: "5,500°C (surface) to 15,000,000°C (core)",
    distanceAu: 0,
    distanceMillionKm: 0,
    moonsCount: 8, // 8 planets + dwarf planets
    hasRings: false,
    atmosphereMajor: ["73.4% Hydrogen", "24.8% Helium", "0.9% Oxygen/Carbon/Neon"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA SDO & SOHO multi-wavelength ultraviolet imagery",
    funFact: "The Sun accounts for 99.86% of all mass in the entire Solar System.",
  },
  Mercury: {
    name: "Mercury",
    category: "Terrestrial Planet",
    diameterKm: 4879,
    diameterEarthRatio: 0.383,
    massKgExp: "3.30 × 10^23",
    massEarthRatio: 0.055,
    orbitalPeriodDays: 87.97,
    rotationPeriodHours: 1407.6, // 58.65 days
    rotationNotes: "Spin-orbit resonance: 3 rotations for every 2 orbits around the Sun",
    gravityMps2: 3.7,
    gravityEarthRatio: 0.38,
    meanTempC: 167,
    tempRangeC: "-180°C (night) to +430°C (day)",
    distanceAu: 0.387,
    distanceMillionKm: 57.9,
    moonsCount: 0,
    hasRings: false,
    atmosphereMajor: ["Trace exosphere: Oxygen, Sodium, Hydrogen, Helium, Potassium"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA MESSENGER orbital photographic mosaic",
    funFact: "Mercury has water ice locked inside permanently shadowed polar craters.",
  },
  Venus: {
    name: "Venus",
    category: "Terrestrial Planet",
    diameterKm: 12104,
    diameterEarthRatio: 0.949,
    massKgExp: "4.87 × 10^24",
    massEarthRatio: 0.815,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5, // 243 days retrograde
    rotationNotes: "Slow retrograde spin: turns clockwise from above the north pole",
    gravityMps2: 8.87,
    gravityEarthRatio: 0.904,
    meanTempC: 464,
    tempRangeC: "460°C to 475°C (uniform greenhouse)",
    distanceAu: 0.723,
    distanceMillionKm: 108.2,
    moonsCount: 0,
    hasRings: false,
    atmosphereMajor: ["96.5% Carbon Dioxide", "3.5% Nitrogen", "Sulfuric acid cloud droplets"],
    imagingType: "Illustrative 3D Rendering",
    imagingNote:
      "Surface is an illustrative rendering derived from NASA Magellan synthetic aperture radar data. Real optical views show featureless yellowish clouds.",
    funFact:
      "Surface pressure on Venus is 92 times Earth's, equivalent to being 900 meters deep underwater.",
  },
  Earth: {
    name: "Earth",
    category: "Terrestrial Planet",
    diameterKm: 12742,
    diameterEarthRatio: 1.0,
    massKgExp: "5.97 × 10^24",
    massEarthRatio: 1.0,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.93,
    rotationNotes: "23.44° axial tilt produces our four seasons",
    gravityMps2: 9.81,
    gravityEarthRatio: 1.0,
    meanTempC: 15,
    tempRangeC: "-89°C to +57°C",
    distanceAu: 1.0,
    distanceMillionKm: 149.6,
    moonsCount: 1,
    hasRings: false,
    atmosphereMajor: ["78.08% Nitrogen", "20.95% Oxygen", "0.93% Argon", "0.04% Carbon Dioxide"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Blue Marble and DSCOVR EPIC genuine natural-color photographs",
    funFact: "Earth is the only planet not named after a Greek or Roman deity.",
  },
  Mars: {
    name: "Mars",
    category: "Terrestrial Planet",
    diameterKm: 6779,
    diameterEarthRatio: 0.532,
    massKgExp: "6.42 × 10^23",
    massEarthRatio: 0.107,
    orbitalPeriodDays: 686.98,
    rotationPeriodHours: 24.62,
    rotationNotes: "Similar day length to Earth (1 Sol = 24h 39m)",
    gravityMps2: 3.72,
    gravityEarthRatio: 0.379,
    meanTempC: -63,
    tempRangeC: "-140°C to +20°C",
    distanceAu: 1.524,
    distanceMillionKm: 227.9,
    moonsCount: 2,
    hasRings: false,
    atmosphereMajor: ["95.3% Carbon Dioxide", "2.6% Nitrogen", "1.9% Argon", "0.16% Oxygen"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Mars Reconnaissance Orbiter & Viking natural-color camera mosaics",
    funFact:
      "Olympus Mons on Mars is 21.9 km high — nearly three times the height of Mount Everest.",
  },
  Jupiter: {
    name: "Jupiter",
    category: "Gas Giant",
    diameterKm: 139820,
    diameterEarthRatio: 10.97,
    massKgExp: "1.90 × 10^27",
    massEarthRatio: 317.8,
    orbitalPeriodDays: 4332.59, // 11.86 years
    rotationPeriodHours: 9.93,
    rotationNotes: "Fastest spinning planet in the Solar System; strong equatorial bulge",
    gravityMps2: 24.79,
    gravityEarthRatio: 2.53,
    meanTempC: -110,
    tempRangeC: "-145°C (cloud tops) to ~24,000°C (core)",
    distanceAu: 5.204,
    distanceMillionKm: 778.6,
    moonsCount: 95,
    hasRings: true,
    atmosphereMajor: ["89.8% Hydrogen", "10.2% Helium", "Trace Methane, Ammonia, Water"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Juno & Cassini space probe true-color cloud mosaics",
    funFact:
      "Jupiter is so massive that the barycenter (center of mass) with the Sun actually sits outside the Sun's surface.",
  },
  Saturn: {
    name: "Saturn",
    category: "Gas Giant",
    diameterKm: 116460,
    diameterEarthRatio: 9.14,
    massKgExp: "5.68 × 10^26",
    massEarthRatio: 95.2,
    orbitalPeriodDays: 10759.22, // 29.45 years
    rotationPeriodHours: 10.7,
    rotationNotes: "Features a persistent hexagonal jet stream storm at its north pole",
    gravityMps2: 10.44,
    gravityEarthRatio: 1.06,
    meanTempC: -140,
    tempRangeC: "-178°C (cloud tops) to ~11,700°C (core)",
    distanceAu: 9.582,
    distanceMillionKm: 1433.5,
    moonsCount: 146,
    hasRings: true,
    atmosphereMajor: ["96.3% Hydrogen", "3.25% Helium", "Trace Methane, Ammonia"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Cassini orbiter natural-color wide-angle camera mosaics",
    funFact:
      "Saturn has an average density of 0.687 g/cm³ — less dense than water. It would float in a giant bathtub!",
  },
  Uranus: {
    name: "Uranus",
    category: "Ice Giant",
    diameterKm: 50724,
    diameterEarthRatio: 3.98,
    massKgExp: "8.68 × 10^25",
    massEarthRatio: 14.54,
    orbitalPeriodDays: 30685.4, // 84 years
    rotationPeriodHours: -17.24,
    rotationNotes: "Extreme 97.77° axial tilt — effectively rolls on its side along its orbit",
    gravityMps2: 8.69,
    gravityEarthRatio: 0.886,
    meanTempC: -195,
    tempRangeC: "-224°C (record cold atmosphere) to ~4,700°C (core)",
    distanceAu: 19.2,
    distanceMillionKm: 2872.5,
    moonsCount: 28,
    hasRings: true,
    atmosphereMajor: ["82.5% Hydrogen", "15.2% Helium", "2.3% Methane"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Voyager 2 encounter & Hubble Space Telescope optical imagery",
    funFact:
      "Because Uranus rolls on its side, each pole experiences 42 years of continuous sunlight followed by 42 years of darkness.",
  },
  Neptune: {
    name: "Neptune",
    category: "Ice Giant",
    diameterKm: 49244,
    diameterEarthRatio: 3.86,
    massKgExp: "1.02 × 10^26",
    massEarthRatio: 17.15,
    orbitalPeriodDays: 60189.0, // 164.8 years
    rotationPeriodHours: 16.11,
    rotationNotes:
      "First planet mathematically predicted by Le Verrier before observational discovery in 1846",
    gravityMps2: 11.15,
    gravityEarthRatio: 1.14,
    meanTempC: -201,
    tempRangeC: "-218°C (upper troposphere) to ~7,000°C (core)",
    distanceAu: 30.05,
    distanceMillionKm: 4495.1,
    moonsCount: 16,
    hasRings: true,
    atmosphereMajor: ["80.0% Hydrogen", "19.0% Helium", "1.5% Methane"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Voyager 2 flyby & JWST NIRCam infrared/optical composite",
    funFact:
      "Neptune experiences the fastest planetary winds in the Solar System, exceeding 2,100 km/h (1,300 mph) — supersonic speeds.",
  },
  Ceres: {
    name: "Ceres",
    category: "Dwarf Planet",
    diameterKm: 939,
    diameterEarthRatio: 0.074,
    massKgExp: "9.39 × 10^20",
    massEarthRatio: 0.00016,
    orbitalPeriodDays: 1682, // 4.6 years
    rotationPeriodHours: 9.07,
    rotationNotes: "Rotates rapidly in the main asteroid belt between Mars and Jupiter",
    gravityMps2: 0.28,
    gravityEarthRatio: 0.029,
    meanTempC: -106,
    tempRangeC: "-143°C to -38°C",
    distanceAu: 2.77,
    distanceMillionKm: 414.0,
    moonsCount: 0,
    hasRings: false,
    atmosphereMajor: ["Transient water-vapor exosphere driven by sublimation"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA Dawn spacecraft framing camera orbital mosaic",
    funFact: "Ceres contains about one-third of the total mass of the entire asteroid belt.",
  },
  Pluto: {
    name: "Pluto",
    category: "Dwarf Planet",
    diameterKm: 2376,
    diameterEarthRatio: 0.186,
    massKgExp: "1.30 × 10^22",
    massEarthRatio: 0.0022,
    orbitalPeriodDays: 90560, // 248 years
    rotationPeriodHours: -153.3, // 6.39 days retrograde
    rotationNotes: "Tidally locked to its giant moon Charon in a mutual binary orbit",
    gravityMps2: 0.62,
    gravityEarthRatio: 0.063,
    meanTempC: -229,
    tempRangeC: "-240°C to -218°C",
    distanceAu: 39.48,
    distanceMillionKm: 5906.4,
    moonsCount: 5,
    hasRings: false,
    atmosphereMajor: ["Nitrogen with traces of Methane and Carbon Monoxide"],
    imagingType: "Direct Spacecraft Photographic Mosaic",
    imagingNote: "NASA New Horizons flyby high-resolution LORRI/MVIC color mosaic",
    funFact:
      "Pluto has a giant heart-shaped nitrogen glacier called Sputnik Planitia with convective ice cells that renew the surface.",
  },
};

export const MODULE_06_SUBLESSONS: SubLesson[] = [
  {
    id: "sub-01",
    title: "1. How the Solar System Formed",
    subtitle: "The Solar Nebula hypothesis, gravitational collapse & the frost line",
    estimatedMinutes: 6,
    content: {
      junior: {
        summary:
          "About 4.6 billion years ago, a giant cloud of gas and dust spinning in deep space collapsed under its own gravity to make our Sun and planets!",
        keyConcepts: [
          "Spinning Nebula: Like spinning pizza dough that flattens out, the cloud flattened into a disk.",
          "The Sun's Birth: The hot, glowing center squeezed together to light up as our Sun.",
          "Building Planets: Bits of dust and rock bumped into each other like snowballs, growing bigger and bigger.",
        ],
        details: [
          "Close to the hot young Sun, only tough metals and rocks could stay solid. That is why the inner planets (Mercury, Venus, Earth, Mars) are rocky balls.",
          "Far away where it was freezing cold, water and gases froze into ice. That allowed giant worlds like Jupiter and Saturn to gather huge puffy coats of gas!",
        ],
        didYouKnow:
          "Almost all the dust and gas in our Solar System ended up inside the Sun — more than 99.8% of everything!",
      },
      explorer: {
        summary:
          "The Solar Nebula hypothesis explains why planets orbit in nearly the same flat plane (the ecliptic) and in the same counter-clockwise direction.",
        keyConcepts: [
          "Conservation of Angular Momentum: As the cloud contracted, it spun faster and flattened into a protoplanetary disk.",
          "The Frost Line (~2.7 AU): The critical boundary separating warm rocky planetesimals from volatile ice-rich accretions.",
          "Planetary Accretion: Microscopic grains collided to form kilometer-sized planetesimals, then protoplanets.",
        ],
        details: [
          "Inside the frost line (closer than 2.7 AU), thermal radiation prevented volatile compounds (water, ammonia, methane) from condensing into ices. Only refractory metals (iron, nickel) and silicate minerals survived, limiting terrestrial planets to smaller masses.",
          "Beyond the frost line, water ice was abundant (roughly 10 times more abundant than silicates). Massive icy cores grew to ~10 Earth masses rapidly, generating enough gravity to trigger runaway gas accretion from the surrounding nebula before the solar wind cleared it away.",
        ],
        didYouKnow:
          "A shockwave from a nearby dying supernova star likely triggered the gravitational collapse of our ancestral solar nebula.",
      },
      astronomer: {
        summary:
          "Core accretion and disk clearing models describe the timeline: nebular collapse at 4.567 Ga, rapid oligarchic planetesimal growth, and the Grand Tack orbital migrations.",
        keyConcepts: [
          "CAI Dating (4.567 Ga): Calcium-Aluminum-rich Inclusions in chondritic meteorites mark the precise birth of the Solar System.",
          "Frost Line Thermodynamics: Volatiles condense at $T \\approx 150-170\\text{ K}$, creating a steep surface mass density discontinuity.",
          "Runaway Gas Accretion: Once protoplanet cores reached the critical threshold ($M_{crit} \\approx 10-15 M_\\oplus$), gravitational collapse of the gaseous envelope outpaced cooling.",
        ],
        details: [
          "The Nice Model and Grand Tack hypothesis explain key solar system anomalies: why Mars is smaller than expected, the depleted mass of the asteroid belt, and the scattering of the Kuiper belt by resonant interactions with migrating Jupiter and Saturn.",
          "Within roughly 3 to 10 million years, radiation pressure and powerful stellar winds from the young T Tauri Sun swept the remaining gas disk away, freezing planetary masses in place.",
        ],
        didYouKnow:
          "Meteorites called carbonaceous chondrites have remained almost entirely unchanged for 4.567 billion years, serving as pristine cosmic time capsules.",
      },
    },
  },
  {
    id: "sub-02",
    title: "2. The Four Rocky Planets",
    subtitle: "Mercury, Venus, Earth, and Mars: Terrestrial geology & atmospheres",
    estimatedMinutes: 6,
    content: {
      junior: {
        summary:
          "The inner four worlds are made of hard rock and heavy metal with solid surfaces you could stand on if you had the right spacesuit!",
        keyConcepts: [
          "Mercury: Smallest, closest to the Sun, covered in craters, no air to breathe.",
          "Venus: Earth's 'evil twin', super hot greenhouse world wrapped in yellow clouds.",
          "Earth: The Goldilocks world — just right for blue oceans, air, and living things.",
          "Mars: The rusty Red Planet with giant volcanoes and ancient dry riverbeds.",
        ],
        details: [
          "Mercury gets burning hot on the side facing the Sun and freezing cold on the dark side because it has no blanket of air.",
          "Venus has a thick blanket of carbon dioxide that traps heat so well it is hotter than an oven day and night!",
          "Mars has two tiny lumpy potato-shaped moons named Phobos and Deimos.",
        ],
        didYouKnow:
          "If you weigh 100 kg on Earth, you would only weigh about 38 kg on Mars because Mars has much less gravity!",
      },
      explorer: {
        summary:
          "Terrestrial planets share layered structures: a metallic core, silicate mantle, and crust, but evolved dramatically different surface environments.",
        keyConcepts: [
          "Planetary Differentiation: Dense iron and nickel sank to cores while lighter silicate magma floated upward.",
          "Runaway Greenhouse vs. Stagnant Lid: Why Venus boiled its oceans away while Mars lost its internal dynamo and atmospheric shielding.",
          "Volcanism and Tectonics: Active plate tectonics on Earth versus gigantic static shield volcanoes like Olympus Mons on Mars.",
        ],
        details: [
          "Mercury's core occupies about 85% of its radius, indicating a violent giant impact in the early Solar System may have stripped away its outer silicate mantle.",
          "Earth's liquid iron-nickel outer core drives a convective geodynamo, producing a strong magnetosphere that deflects solar wind particles.",
          "Mars lost its global magnetic field as its smaller core cooled, allowing solar wind ions to strip away most of its atmospheric density over 3 billion years.",
        ],
        didYouKnow:
          "Valles Marineris on Mars is a canyon system over 4,000 km long and 7 km deep — four times deeper and ten times longer than the Grand Canyon!",
      },
      astronomer: {
        summary:
          "Comparative planetology examines mantle convection regimes, atmospheric scale heights ($H = k_B T / \\mu g$), and solar wind sputtering across the inner Solar System.",
        keyConcepts: [
          "Atmospheric Scale Heights: Earth ($H \\approx 8.5\\text{ km}$), Mars ($H \\approx 11.1\\text{ km}$), Venus ($H \\approx 15.9\\text{ km}$).",
          "Hydrodynamic Escape & Deuterium Ratios: The D/H ratio on Venus is 150 times higher than Earth's, proving it once lost an ocean's worth of water.",
          "Stagnant Lid Geodynamics: Without surface water hydration to lubricate faulting, Venus and Mars operate in stagnant lid regimes without plate tectonics.",
        ],
        details: [
          "Mercury's magnetic field is a dipolar dynamo despite its small size, maintained by thermoelectric feedback or light element crystallization in its molten core.",
          "Venusian surface age is uniformly young (~300–600 Ma), implying catastrophic global resurfacing events where basaltic lavas flood the crust when internal heat builds up.",
        ],
        didYouKnow:
          "The surface atmospheric pressure on Venus is 9.2 MPa (92 bar) — equal to the hydrostatic pressure at a depth of nearly one kilometer in Earth's ocean.",
      },
    },
  },
  {
    id: "sub-03",
    title: "3. Jupiter and Saturn: The Gas Giants",
    subtitle: "Hydrogen-helium giants, metallic hydrogen dynamos & majestic ring systems",
    estimatedMinutes: 6,
    content: {
      junior: {
        summary:
          "Jupiter and Saturn are the titans of our planetary family! They are gigantic swirling balls of gas with no solid ground to walk on.",
        keyConcepts: [
          "Super Sized: Over 1,300 Earths could fit inside giant Jupiter!",
          "Great Red Spot: A colossal hurricane storm on Jupiter that has been raging for hundreds of years.",
          "Saturn's Rings: Thousands of glittering ringlets made of chunks of sparkling water ice.",
        ],
        details: [
          "Jupiter has colourful striped cloud bands that zoom past each other in opposite directions.",
          "Saturn is the second biggest planet, but it is so light and fluffy with gas that it could float in water!",
          "Both giant planets have huge families of moons: Jupiter has 95 and Saturn has over 140!",
        ],
        didYouKnow:
          "Saturn's main rings are incredibly wide (nearly 280,000 km across) but remarkably thin — only about 10 to 30 meters thick!",
      },
      explorer: {
        summary:
          "Gas giants have no distinct solid surface; their hydrogen and helium atmospheres transition smoothly into supercritical fluids and exotic metallic hydrogen.",
        keyConcepts: [
          "Liquid Metallic Hydrogen: At extreme pressures (>100 GPa), hydrogen electrons delocalize, turning it into an electrically conductive liquid metal.",
          "Internal Heat Radiation: Both Jupiter and Saturn radiate nearly twice as much thermal energy as they receive from the Sun.",
          "Ring Dynamics & Roche Limit: Saturn's rings are held in place by shepherd moons and gravitational orbital resonances like the Cassini Division.",
        ],
        details: [
          "Jupiter's intense magnetic field is 20,000 times stronger than Earth's, generating deadly radiation belts that fry unshielded electronics.",
          "Saturn's north polar hexagon is a persistent six-sided jet stream storm with winds blowing at 320 km/h, large enough to fit four Earths inside.",
          "Helium rain: Within Saturn's cooler interior, helium condenses into immiscible droplets that rain downward through liquid hydrogen, releasing gravitational energy as heat.",
        ],
        didYouKnow:
          "The Great Red Spot is shrinking: it was once three times the diameter of Earth in the 19th century, but is now about 1.3 Earth diameters wide.",
      },
      astronomer: {
        summary:
          "High-pressure equation of state physics and Juno/Cassini gravity harmonics ($J_2, J_4, J_6$) reveal deep zonal winds and dilute fuzzy cores.",
        keyConcepts: [
          "Dilute / Fuzzy Core: Juno's gravity measurements demonstrate Jupiter lacks a sharp rock-ice core boundary; heavy elements are partially dissolved throughout the inner 50% radius.",
          "Cassini Division Mimas Resonance: Particles in the Cassini gap orbit twice for every single orbit of moon Mimas (2:1 Lindblad resonance), systematically clearing the gap.",
          "Ring Lifespan & 'Ring Rain': Ionized water molecules from Saturn's rings are drained into the atmosphere by magnetic fields, eroding the rings within ~100–300 million years.",
        ],
        details: [
          "Jupiter's zonal jet streams extend nearly 3,000 km deep below the cloud deck, containing about 1% of Jupiter's total planetary mass.",
          "Saturn's rings formed relatively recently—likely between 10 and 100 million years ago, when an icy comet or ancient moon was torn apart inside Saturn's Roche limit.",
        ],
        didYouKnow:
          "Jupiter's magnetosphere is the largest continuous structure in the Solar System; if visible to the naked eye from Earth, it would appear larger than the full Moon.",
      },
    },
  },
  {
    id: "sub-04",
    title: "4. Uranus and Neptune: The Ice Giants",
    subtitle: "Methane-rich blue worlds, extreme axial tilts & supersonic winds",
    estimatedMinutes: 5,
    content: {
      junior: {
        summary:
          "Far beyond Saturn lie Uranus and Neptune — beautiful blue ice giants that are freezing cold and filled with slushy deep oceans!",
        keyConcepts: [
          "Cool Cyan & Deep Azure: Methane gas in their skies absorbs red light, making them look gorgeous blue.",
          "Tilted World: Uranus is tipped all the way over on its side, rolling like a bowling ball around the Sun.",
          "Super Storms: Neptune has the wildest, fastest winds in the whole Solar System!",
        ],
        details: [
          "Uranus was the very first planet discovered using a telescope, found by astronomer William Herschel in 1781.",
          "Neptune is so far away that it takes more than 164 Earth years to complete just one orbit around the Sun!",
        ],
        didYouKnow:
          "Deep inside Uranus and Neptune, scientists believe the intense pressure squeezes carbon atoms into literal diamond rain!",
      },
      explorer: {
        summary:
          "Unlike Jupiter and Saturn, Uranus and Neptune are dominated by heavy volatile 'ices' (water, ammonia, methane) rather than pure hydrogen gas.",
        keyConcepts: [
          "Ice Giant Composition: ~65% water, ammonia, and methane mantle over a rocky iron core, with a relatively shallow hydrogen-helium-methane atmosphere.",
          "Off-Axis Magnetic Fields: The magnetic dipoles are tilted dramatically (59° on Uranus, 47° on Neptune) and offset from the planets' physical centers.",
          "Supersonic Jet Streams: Neptune's winds clock in at over 2,100 km/h despite receiving minimal solar thermal energy.",
        ],
        details: [
          "Uranus' 97.8° axial tilt was likely caused by a massive collision with an Earth-sized protoplanet during the late accretion era.",
          "Neptune radiates 2.6 times more internal heat than it receives from sunlight, powering violent atmospheric dynamics like the Great Dark Spot observed by Voyager 2.",
        ],
        didYouKnow:
          "Neptune was discovered through mathematics! Astronomers noticed Uranus was being pulled slightly off-course and calculated exactly where Neptune had to be.",
      },
      astronomer: {
        summary:
          "Thermodynamics of ionic and superionic water mantles explain the non-dipolar, non-axisymmetric magnetic fields of Uranus and Neptune.",
        keyConcepts: [
          "Superionic Water: Under multi-megabar pressures, oxygen forms a crystalline lattice while hydrogen protons flow freely, behaving simultaneously as solid and fluid conductor.",
          "Thin-Shell Dynamo: The magnetic field originates not in a central core, but in a thin, convecting outer ionic fluid shell.",
          "Uranian Heat Flux Anomaly: Unlike all other giant planets, Uranus has an internal heat flux near zero ($F_{int} / F_\\odot < 0.06$), possibly blocked by a compositional stratification layer.",
        ],
        details: [
          "Atmospheric methane photolysis produces acetylene, ethane, and diacetylene aerosols that contribute to high-altitude hazes and complex photochemical clouds.",
          "Both ice giants possess faint, narrow, dark ring systems dominated by radiation-processed organics with albedos as low as 0.03.",
        ],
        didYouKnow:
          "Voyager 2 is still the only spacecraft in human history to have ever visited Uranus (1986) and Neptune (1989).",
      },
    },
  },
  {
    id: "sub-05",
    title: "5. Dwarf Planets & Beyond",
    subtitle: "Pluto, Ceres, Eris, Haumea & Makemake: The 2006 IAU classification",
    estimatedMinutes: 5,
    content: {
      junior: {
        summary:
          "Dwarf planets are round worlds like planets, but they share their neighborhoods with lots of asteroids and icy space rocks!",
        keyConcepts: [
          "What Makes a Planet: To be an official planet, you must orbit the Sun, be round, and be the big boss of your orbit.",
          "Pluto's Heart: Pluto has a famous bright heart-shaped glacier of nitrogen ice named Tombaugh Regio.",
          "Ceres: The only dwarf planet living in the main asteroid belt, much closer to home than Pluto.",
        ],
        details: [
          "In 2006, scientists realized there were many worlds like Pluto in the distant Kuiper Belt, so they created the new category: 'Dwarf Planet'.",
          "Pluto and its moon Charon are like dance partners that always face each other as they circle.",
        ],
        didYouKnow:
          "Pluto has blue skies and red snow made of complex organic molecules called tholins!",
      },
      explorer: {
        summary:
          "The discovery of massive Kuiper belt objects like Eris forced astronomers to formalize the scientific definition of a planet.",
        keyConcepts: [
          "The Three 2006 IAU Planet Criteria: (1) Orbits the Sun, (2) Hydrostatic equilibrium (round shape), (3) Has 'cleared the neighborhood' around its orbit.",
          "Trans-Neptunian Objects (TNOs): Thousands of icy remnants in the Kuiper belt preserved in deep freeze from the solar nebula.",
          "Cryovolcanism on Ceres & Pluto: Cryolavas of salty brines and volatile nitrogen glaciers actively reshaping surfaces.",
        ],
        details: [
          "Ceres has bright spots in Occator Crater composed of sodium carbonate salts left behind by evaporated subsurface brines.",
          "Haumea spins so fast (one rotation every 3.9 hours) that centrifugal force has stretched it into an elongated triaxial ellipsoid like an American football.",
        ],
        didYouKnow:
          "Eris is 27% more massive than Pluto, which was the decisive factor that prompted the International Astronomical Union to reclassify Pluto in 2006.",
      },
      astronomer: {
        summary:
          "Dynamic clearance metrics (Stern-Levison parameter $\\Lambda$ and Soter planetary discriminant $\\mu$) mathematically distinguish true planets from dwarf worlds.",
        keyConcepts: [
          "Planetary Discriminant $\\mu$: $\\mu = M_{body} / M_{other}$. For Earth, $\\mu = 1.7 \\times 10^6$; for Jupiter, $\\mu = 6.25 \\times 10^5$; for Pluto, $\\mu = 0.077$.",
          "Sputnik Planitia Convection: Solid-state thermal convection cells in a 3-km-thick nitrogen ice sheet that overturn and resurface every 500,000 years.",
          "Orbital Resonances in the Kuiper Belt: Plutinos occupy the stable 3:2 mean-motion resonance with Neptune.",
        ],
        details: [
          "New Horizons showed Pluto exhibits active mountain ranges composed of water-ice bedrock (hard as granite at -230°C) floating atop denser nitrogen-methane glacial sheets.",
          "Eris and Makemake possess methane-dominated surfaces with remarkably high geometric albedos (>0.85) caused by seasonal atmospheric condensation.",
        ],
        didYouKnow:
          "Charon's diameter is over half the diameter of Pluto, placing the system barycenter in empty space outside Pluto itself — making it a true binary dwarf planet.",
      },
    },
  },
  {
    id: "sub-06",
    title: "6. Asteroids, Comets and Meteoroids",
    subtitle: "Pristine relics of accretion, Kirkwood gaps & planetary defense",
    estimatedMinutes: 5,
    content: {
      junior: {
        summary:
          "Asteroids are rocky leftovers from planet building, while comets are 'dirty snowballs' that grow spectacular glowing tails when they near the Sun!",
        keyConcepts: [
          "Asteroid Belt: A giant ring of rocky space boulders orbiting between Mars and Jupiter.",
          "Comet Tails: When ice warms up near the Sun, it shoots out gas and dust millions of kilometers long!",
          "Shooting Stars: Tiny specks of dust burning up harmlessly in Earth's atmosphere are called meteors.",
        ],
        details: [
          "A comet always has two tails: a blue ion tail pointing straight away from the Sun, and a curved whitish dust tail.",
          "If a space rock survives its fiery trip through the atmosphere and lands on the ground, it is called a meteorite.",
        ],
        didYouKnow:
          "Space is so empty that the distance between asteroids in the asteroid belt is typically over one million kilometers!",
      },
      explorer: {
        summary:
          "Small celestial bodies preserve the unaltered chemical composition of the primordial solar nebula and pose both hazards and resource opportunities.",
        keyConcepts: [
          "Taxonomic Classes: C-type (carbonaceous, ~75%), S-type (silicate/stony, ~17%), and M-type (metallic iron-nickel).",
          "Kirkwood Gaps: Depleted bands in the asteroid belt cleared by Jupiter's orbital resonances (e.g., 3:1, 5:2, 2:1).",
          "Comet Reservoirs: Kuiper Belt (short-period comets, <200 yr) and the spherical Oort Cloud (long-period comets, up to 100,000 AU).",
        ],
        details: [
          "NASA's DART mission in 2022 successfully altered the orbit of asteroid Dimorphos by kinetic impact, proving planetary defense capabilities.",
          "Cometary sublimating gases release volatile organic compounds and amino acid precursors, suggesting comets delivered water and prebiotic building blocks to early Earth.",
        ],
        didYouKnow:
          "Asteroid 16 Psyche is believed to be the exposed metallic iron-nickel core of a shattered protoplanet, containing metals worth trillions of dollars.",
      },
      astronomer: {
        summary:
          "Yarkovsky and YORP thermal recoil forces govern small body orbital evolution, while solar radiation pressure separates neutral dust from magnetic plasma tails.",
        keyConcepts: [
          "Yarkovsky Effect: Anisotropic thermal emission of absorbed sunlight exerts a photon recoil force that slowly migrates asteroid semi-major axes.",
          "Plasma Tail Dynamics: $H_2O^+$ and $CO^+$ ions are caught in the interplanetary magnetic field carried by the solar wind, accelerating to hundreds of km/s along anti-solar vectors.",
          "Rubblized Asteroid Rheology: Missions (OSIRIS-REx, Hayabusa2) confirmed Bennu and Ryugu are low-density ($<1.3\\text{ g/cm}^3$) granular aggregate 'rubble piles' held together by delicate van der Waals cohesion.",
        ],
        details: [
          "The Oort Cloud is estimated to hold $10^{12}$ icy bodies with a combined mass roughly equal to a few Earth masses, gently bound at the gravitational edge of the Sun's Hill sphere.",
          "Tisserand's parameter ($T_J$) mathematically classifies cometary versus asteroidal orbits based on their Jacobi energy relative to Jupiter.",
        ],
        didYouKnow:
          "In 2017, astronomers detected 1I/'Oumuamua — the first confirmed interstellar visitor passing through our Solar System from another star.",
      },
    },
  },
  {
    id: "sub-07",
    title: "7. Planetary Moons and Rings",
    subtitle: "Ocean worlds, cryovolcanism & the physics of tidal heating",
    estimatedMinutes: 6,
    content: {
      junior: {
        summary:
          "Our Solar System is packed with exotic moons that are even stranger than the planets they orbit — from volcanic hellscapes to hidden liquid oceans!",
        keyConcepts: [
          "Europa's Ocean: An icy moon hiding an ocean with more liquid water than all of Earth's oceans combined!",
          "Titan's Lakes: Saturn's giant moon Titan has rain, rivers, and lakes made of liquid methane.",
          "Io's Volcanoes: Jupiter's moon Io is covered in hundreds of sulfur-spewing volcanoes.",
        ],
        details: [
          "Enceladus, a small moon of Saturn, shoots huge geysers of warm saltwater snow directly into space from its south pole.",
          "Our own Moon is unusually large compared to Earth, helping keep our planet's tilt stable so we have reliable seasons.",
        ],
        didYouKnow:
          "Ganymede (orbiting Jupiter) and Titan (orbiting Saturn) are both bigger than the planet Mercury!",
      },
      explorer: {
        summary:
          "Moons in the outer Solar System are prime astrobiology targets, sustained by tidal friction rather than solar heating.",
        keyConcepts: [
          "Tidal Heating: Gravitational tug-of-war stretches and flexes moon interiors like kneading bread dough, creating immense frictional heat.",
          "Laplace Resonance: The 4:2:1 orbital resonance between Io, Europa, and Ganymede maintains their eccentricities and tidal heating.",
          "Cryovolcanism: Volcanoes that erupt liquid water, ammonia, and hydrocarbons instead of molten silicate rock.",
        ],
        details: [
          "Saturn's moon Enceladus feeds Saturn's diffuse E-ring with water ice ejected from its south polar 'tiger stripe' fractures.",
          "Neptune's moon Triton orbits backwards (retrograde) and is slowly spiraling inward; in ~3.6 billion years it will cross Neptune's Roche limit and shatter into a colossal new ring system.",
        ],
        didYouKnow:
          "Titan has a dense nitrogen atmosphere with 1.5 times Earth's surface pressure, and gravity so low you could strap on wings and fly like a bird!",
      },
      astronomer: {
        summary:
          "Geophysical models of ocean world habitability assess hydrothermal chimney serpentinization ($H_2$ production) and ice shell thickness.",
        keyConcepts: [
          "Tidal Dissipation Metric: Frictional power dissipated is proportional to $e^2 / Q$, generating hundreds of terawatts of geothermal heat in Io.",
          "Hydrothermal Vent Chemistry: Mass spectrometers on the Cassini spacecraft detected molecular hydrogen ($H_2$), methane, and complex macromolecular organics in Enceladus' plumes.",
          "Induced Magnetic Signatures: Europa creates an induced dipolar field in response to Jupiter's rotating magnetosphere, confirming a global saline subsurface conductor.",
        ],
        details: [
          "The Roche limit for a fluid satellite ($d_{Roche} \\approx 2.44 R (\\rho_M / \\rho_m)^{1/3}$) precisely demarcates where tidal tensile stresses exceed gravitational self-cohesion, governing the boundary between rings and accreting moons.",
          "Shepherd satellites (such as Prometheus and Pandora around Saturn's F ring) exchange orbital angular momentum with ring particles via spiral density waves.",
        ],
        didYouKnow:
          "Europa's ice crust is estimated to be 15–25 km thick, overlying a salty ocean roughly 100 km deep maintained by tidal dissipation.",
      },
    },
  },
  {
    id: "sub-08",
    title: "8. Comparing Planetary Environments",
    subtitle: "Insolation, surface gravities, atmospheric pressures & habitability",
    estimatedMinutes: 6,
    content: {
      junior: {
        summary:
          "By comparing planets side-by-side, we learn why Earth is so special and what extreme worlds exist throughout space!",
        keyConcepts: [
          "Solar Power: The closer a planet is to the Sun, the brighter and hotter the sunlight.",
          "Heavy or Light: Big planets pull with stronger gravity, while small worlds let you leap like a superhero.",
          "Air Pressure: From zero air on Mercury to crushing air on Venus.",
        ],
        details: [
          "Sunlight on Pluto is more than 1,000 times dimmer than on Earth, but still bright enough to read a book by!",
          "Earth sits right in the 'Habitable Zone' where water can exist as a refreshing liquid ocean.",
        ],
        didYouKnow:
          "Venus is actually hotter than Mercury, even though Mercury is much closer to the Sun, because Venus has an unstoppable runaway greenhouse effect!",
      },
      explorer: {
        summary:
          "Quantitative comparisons across the eight planets illustrate the inverse-square law of solar irradiance and the boundaries of habitability.",
        keyConcepts: [
          "Inverse-Square Law: Solar flux drops off with the square of distance: $S = S_0 / r^2$. At Jupiter (5.2 AU), solar energy is only 3.7% of Earth's.",
          "Surface Gravity ($g = GM/R^2$): Why Saturn has almost the same surface gravity as Earth (1.06 g) despite being 95 times more massive.",
          "Atmospheric Evolution: Primary nebular capture vs. secondary outgassing and cometary delivery.",
        ],
        details: [
          "Mercury's lack of atmosphere means daytime temperatures reach +430°C while nighttime plunges to -180°C — a 610°C daily swing!",
          "The Circumstellar Habitable Zone is defined by the range of distances where an Earth-mass planet with an active carbonate-silicate cycle can maintain liquid surface water.",
        ],
        didYouKnow:
          "Despite being 17 times more massive than Earth, Neptune's gravity at its cloud tops is only 14% higher than Earth's because its radius is four times larger.",
      },
      astronomer: {
        summary:
          "Radiative equilibrium temperatures ($T_{eq} = [L_\\odot (1-A) / 16 \\pi \\sigma r^2]^{1/4}$) and greenhouse warming metrics across planetary atmospheres.",
        keyConcepts: [
          "Bond Albedo & Effective Temperature: Earth ($A_B = 0.306$, $T_{eq} = 255\\text{ K}$, $\\Delta T_{gh} = 33\\text{ K}$); Venus ($A_B = 0.77$, $T_{eq} = 227\\text{ K}$, $\\Delta T_{gh} = 510\\text{ K}$).",
          "Carbonate-Silicate Thermostat: Long-term climate stabilization mechanism on Earth that failed on Venus (runaway greenhouse) and Mars (atmospheric freeze-out).",
          "Exoplanet Archetypes: The Solar System lacks two of the most common exoplanet types discovered across the Milky Way: 'Super-Earths' ($1.5–2.5 M_\\oplus$) and 'Sub-Neptunes'.",
        ],
        details: [
          "The greenhouse warming on Venus ($\\Delta T \\approx 510\\text{ K}$) is driven by pressure-broadened $CO_2$ absorption bands and dense sulfuric acid aerosol blankets.",
          "Planetary escape velocity ($v_{esc} = \\sqrt{2GM/R}$) compared against thermal velocity ($v_{th} = \\sqrt{3k_B T / m}$) determines Jeans atmospheric retention over billion-year epochs.",
        ],
        didYouKnow:
          "If Earth were moved to Venus's orbit, our oceans would evaporate, water vapor would saturate the stratosphere, and ultraviolet photolysis would permanently strip our water within a few hundred million years.",
      },
    },
  },
];

export const MODULE_06_QUIZ: Record<LearningLevel, QuizQuestion[]> = {
  junior: [
    {
      id: "q-j-01",
      question: "Which of these is the largest planet in our Solar System?",
      options: ["Mars", "Jupiter", "Saturn", "Earth"],
      correctIndex: 1,
      explanation:
        "Jupiter is the king of the planets! Over 1,300 Earths could fit inside giant Jupiter.",
    },
    {
      id: "q-j-02",
      question: "Why is Venus hotter than Mercury, even though Mercury is closer to the Sun?",
      options: [
        "Venus has a thick blanket of greenhouse gas that traps heat",
        "Venus is on fire with volcanoes",
        "Venus has two suns",
        "Mercury is made of ice",
      ],
      correctIndex: 0,
      explanation:
        "Venus has a super-thick carbon dioxide atmosphere that traps heat like a giant greenhouse, making it hotter than an oven!",
    },
    {
      id: "q-j-03",
      question: "What are Saturn's beautiful rings mostly made of?",
      options: [
        "Solid sheets of gold",
        "Chunks of water ice and rock",
        "Glowing laser light",
        "Gas clouds",
      ],
      correctIndex: 1,
      explanation:
        "Saturn's rings are made of billions of glittering chunks of water ice and rocky debris, ranging in size from tiny dust specks to house-sized boulders.",
    },
    {
      id: "q-j-04",
      question: "Which planet rotates on its side like a rolling bowling ball?",
      options: ["Neptune", "Mars", "Uranus", "Mercury"],
      correctIndex: 2,
      explanation:
        "Uranus has an extreme tilt of almost 98 degrees, so it rolls along its orbit on its side!",
    },
  ],
  explorer: [
    {
      id: "q-e-01",
      question: "What was the 'frost line' during the formation of the Solar System?",
      options: [
        "The boundary on Earth where glaciers begin",
        "The distance from the young Sun beyond which water and gases could freeze into solid ice (~2.7 AU)",
        "The edge of the Kuiper Belt",
        "The shadow behind Jupiter",
      ],
      correctIndex: 1,
      explanation:
        "The frost line (around 2.7 AU) separated the hot inner disk where only metals and rocks could condense from the cold outer disk where abundant ices allowed giant planets to form.",
    },
    {
      id: "q-e-02",
      question: "What drives the intense volcanic activity on Jupiter's moon Io?",
      options: [
        "Solar radiation warming its surface",
        "Nuclear fusion inside its core",
        "Gravitational tidal flexing and friction caused by Jupiter and nearby moons",
        "Impacts from passing comets",
      ],
      correctIndex: 2,
      explanation:
        "Io is constantly squeezed and stretched by the gravitational tug-of-war between Jupiter, Europa, and Ganymede (Laplace resonance), generating immense internal friction and heat.",
    },
    {
      id: "q-e-03",
      question:
        "Which of the following is NOT one of the 2006 IAU criteria for a full-fledged planet?",
      options: [
        "Must orbit the Sun",
        "Must have sufficient gravity to pull itself into a nearly round shape (hydrostatic equilibrium)",
        "Must have cleared the neighborhood around its orbit",
        "Must possess at least one natural moon",
      ],
      correctIndex: 3,
      explanation:
        "Having a moon is not a requirement! Mercury and Venus are full planets and have no moons at all.",
    },
    {
      id: "q-e-04",
      question: "What causes the gaps (such as the Cassini Division) in Saturn's rings?",
      options: [
        "High-velocity solar wind blasts",
        "Gravitational orbital resonances with moons orbiting outside or within the rings",
        "Dark dust that hides the ice particles",
        "The rings are melting away in those zones",
      ],
      correctIndex: 1,
      explanation:
        "The Cassini Division is cleared by a 2:1 orbital resonance with the moon Mimas, which tugs particles out of that orbit on every second pass.",
    },
  ],
  astronomer: [
    {
      id: "q-a-01",
      question:
        "Why does Saturn have a surface gravity ($10.44\\text{ m/s}^2$) so close to Earth's ($9.81\\text{ m/s}^2$), despite being 95 times more massive?",
      options: [
        "Saturn's rings cancel out its gravitational pull",
        "Surface gravity scales with $M / R^2$, and Saturn's radius is over 9 times larger than Earth's",
        "Saturn's fast rotation completely negates gravity",
        "Saturn is mostly empty space with no mass at all",
      ],
      correctIndex: 1,
      explanation:
        "Because $g = GM/R^2$, increasing the radius by a factor of 9.1 divides gravity by $9.1^2 \\approx 83$. Dividing 95.2 Earth masses by ~83 yields nearly identical surface gravity (~1.06 g).",
    },
    {
      id: "q-a-02",
      question:
        "What physical condition defines the Roche limit for a self-gravitating celestial body?",
      options: [
        "The point where orbital speed equals the speed of sound",
        "The orbital distance where the central body's tidal tensile stress exceeds the satellite's self-gravitational cohesion",
        "The minimum distance needed to sustain an atmosphere",
        "The boundary of the heliosphere",
      ],
      correctIndex: 1,
      explanation:
        "Inside the Roche limit ($d \\approx 2.44 R (\\rho_M/\\rho_m)^{1/3}$ for fluid bodies), tidal tensile forces overcome self-gravity, ripping moons into ring particles.",
    },
    {
      id: "q-a-03",
      question:
        "How do astronomers explain the anomalous, highly tilted non-axisymmetric magnetic fields of Uranus and Neptune?",
      options: [
        "They are generated by convective dynamo currents within an outer shell of superionic and ionic water, rather than a central metallic core",
        "They are permanent ferromagnets that have frozen over time",
        "They are induced entirely by the solar wind with no internal dynamo",
        "They are reflections of the interstellar magnetic field",
      ],
      correctIndex: 0,
      explanation:
        "High-pressure experiments show water becomes superionic and electrically conductive. The dynamos operate in thin outer convective fluid mantles rather than central iron cores, causing off-center multipolar fields.",
    },
    {
      id: "q-a-04",
      question:
        "According to the inverse-square law of solar radiation, what is the relative solar irradiance at Jupiter (5.2 AU) compared to Earth (1 AU)?",
      options: [
        "About 50% ($1/2$)",
        "About 19.2% ($1/5.2$)",
        "About 3.7% ($1/5.2^2$)",
        "About 0.7% ($1/5.2^3$)",
      ],
      correctIndex: 2,
      explanation:
        "Solar irradiance falls off as $1/r^2$. At $r = 5.2\\text{ AU}$, $I = 1 / (5.2)^2 = 1 / 27.04 \\approx 0.037$ (3.7% of solar flux received at Earth).",
    },
  ],
};

export const MODULE_06_SOURCES: ScientificSource[] = [
  {
    title: "NASA Planetary Fact Sheet — Metric",
    organization: "NASA",
    url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/",
    note: "Primary physical, orbital, and atmospheric data for all 8 planets and major dwarf planets.",
  },
  {
    title: "JPL Solar System Dynamics: Physical Parameters",
    organization: "NASA",
    url: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
    note: "Keplerian orbital elements, masses, and gravitational harmonics.",
  },
  {
    title: "IAU 2006 General Assembly: Definition of a Planet in the Solar System",
    organization: "IAU",
    url: "https://www.iau.org/news/pressreleases/detail/iau0603/",
    note: "Resolution B5 definition distinguishing planets, dwarf planets, and Small Solar System Bodies.",
  },
  {
    title: "Cassini-Huygens Mission to Saturn and Titan",
    organization: "NASA",
    url: "https://science.nasa.gov/mission/cassini/",
    note: "Ring dynamics, Roche limit calculations, and Enceladus plume spectrometry.",
  },
  {
    title: "Juno Mission to Jupiter",
    organization: "NASA",
    url: "https://www.nasa.gov/mission_pages/juno/main/index.html",
    note: "Gravitational field harmonics, interior structure, and magnetospheric dynamics.",
  },
];

export const MODULE_06_LESSON: LessonContract = {
  lessonId: "lesson-06-solar-system",
  moduleId: "06",
  title: "Explore the Solar System",
  objectives: [
    "Trace the gravitational collapse of the solar nebula and understand the frost line",
    "Compare terrestrial rocky planets with gas giants and ice giants using real physical parameters",
    "Explore planetary moons, ring systems, and the Roche limit",
    "Analyze dwarf planets and the 2006 IAU classification criteria",
    "Investigate the mechanics of orbital resonance (Io-Europa-Ganymede and Saturn's rings)",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Blast off on a grand cosmic tour of our home star system! From Mercury's scorched craters to Jupiter's giant storm and Saturn's glittering rings, discover the amazing worlds that orbit our Sun.",
      coreConcepts: [
        "The Sun is our warm star that holds the whole family together with gravity.",
        "The inner 4 worlds are rocky balls; the outer 4 worlds are gigantic puffy gas and ice giants.",
        "Dwarf planets like Pluto live in the cold outer fringes with lots of icy friends.",
      ],
      explanatoryText:
        "Every planet moves around the Sun in its own orbital path like a race track. The inner planets zip around fast, while the cold outer worlds take hundreds of years to finish one giant lap!",
      quizQuestions: MODULE_06_QUIZ.junior,
      funFacts: [
        "One year on Mercury is only 88 days long, but a single day lasts almost 59 Earth days!",
        "Saturn's rings are as wide as the distance from the Earth to the Moon, yet thinner than a football field!",
        "Olympus Mons on Mars is so huge that if you stood on its peak, its gentle slope would extend beyond the horizon!",
      ],
    },
    explorer: {
      introHook:
        "The Solar System is an intricate gravitational ballet shaped by the solar nebula's frost line, massive planetary migrations, and relentless tidal resonance.",
      coreConcepts: [
        "Planetary Accretion & Frost Line: Distance from the Sun determined whether worlds became dense rocky balls or gas-guzzling giants.",
        "Atmospheric Divergence: How magnetic dynamos, solar wind sputtering, and greenhouse effects created hellish Venus, habitable Earth, and frozen Mars.",
        "Tidal Heating & Ocean Worlds: Moons like Europa and Enceladus maintain liquid oceans through gravitational friction rather than sunlight.",
      ],
      explanatoryText:
        "Kepler's laws of planetary motion dictate that orbital speed decreases with distance ($T^2 \\propto a^3$). Mercury zips along at 47 km/s, while distant Neptune glides at just 5.4 km/s. Meanwhile, the Roche limit governs whether material accretes into spherical moons or is shredded into majestic ring systems.",
      quizQuestions: MODULE_06_QUIZ.explorer,
      funFacts: [
        "Venus has a backward (retrograde) spin so slow that its day (243 Earth days) is longer than its year (225 Earth days)!",
        "Jupiter's moon Io has over 400 active volcanoes that shoot sulfur plumes 500 km high into space.",
        "Neptune was discovered through pencil-and-paper mathematical calculations before anyone ever spotted it with a telescope.",
      ],
    },
    astronomer: {
      introHook:
        "Modern planetology unites high-pressure condensed matter physics, magnetohydrodynamics, and orbital perturbation mechanics to explain the architectures of our 8 planets, 5 dwarf planets, and millions of minor bodies.",
      coreConcepts: [
        "High-Pressure Interior Regimes: Metallic hydrogen in Jovian interiors and ionic/superionic fluid mantles in Uranus and Neptune.",
        "Tidal Dissipation & Laplace Resonances: Frictional heating maintaining subsurface oceans against outer Solar System cryogenic loss.",
        "Dynamic Neighborhood Clearance: Stern-Levison $\\Lambda$ parameter and Soter discriminant $\\mu$ providing quantitative planetary taxonomy.",
      ],
      explanatoryText:
        "By comparing planets quantitatively across solar flux ($1/r^2$), surface gravities ($GM/R^2$), and atmospheric scale heights ($k_B T / \\mu g$), learners develop predictive intuition for exoplanetary systems and the limits of terrestrial habitability.",
      quizQuestions: MODULE_06_QUIZ.astronomer,
      funFacts: [
        "Jupiter's center of mass with the Sun (barycenter) lies 1.07 solar radii from the Sun's center — 47,000 km above the Sun's visible photosphere.",
        "Pluto and Charon are mutually tidally locked: the same hemisphere of Pluto always faces the same hemisphere of Charon forever.",
        "Neptune's moon Triton is in a retrograde orbit inclined 157° to Neptune's equator, proving it was a captured Kuiper Belt object that destroyed Neptune's original moon system.",
      ],
    },
  },
  visualizationType: "orbit-sim",
  interactions: [
    "Navigate 3D Solar System with realistic Keplerian orbital parameters",
    "Toggle between True Relative Size vs Exaggerated Educational Scale",
    "Toggle between Astronomical AU Distance vs Logarithmic Spaced Orbits",
    "Compare any planet side-by-side with Earth scale",
    "Simulate Saturn's rings and tidal Roche limit destruction",
    "Investigate Jupiter's Galilean moons in 4:2:1 Laplace orbital resonance",
    "Play the interactive Solar System Scavenger Hunt",
  ],
  relatedConcepts: [
    "Kepler's Laws of Planetary Motion",
    "Roche Limit and Tidal Forces",
    "Laplace Orbital Resonance",
    "Protoplanetary Accretion & Frost Line",
    "Planetary Magnetospheres and Solar Wind",
  ],
  completionCriteria:
    "Complete the 8 Solar System lessons, test the 3D orbital simulation, conduct at least two planetary experiments, and achieve 75% or higher on the module knowledge check.",
  scientificSources: MODULE_06_SOURCES,
};
