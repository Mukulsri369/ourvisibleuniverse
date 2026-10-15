import type { ModuleContract, QuizQuestion, ScientificSource } from "../types";

export interface GalaxySublesson {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  summary: string;
  status: "complete" | "in_development";
  developmentNote?: string;
  keyConcepts: {
    junior: string[];
    explorer: string[];
    astronomer: string[];
  };
  content: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  mathOrPhysicsDeepDive?: {
    title: string;
    description: string;
    formula?: string;
  };
  didYouKnow: string;
  observationalFocus: string;
  nasaSourceUrl: string;
  wikiSourceUrl: string;
}

export const MODULE_13_SOURCES: ScientificSource[] = [
  {
    title: "NASA Astrophysics: Galaxies and the Cosmic Web",
    organization: "NASA",
    url: "https://science.nasa.gov/astrophysics/focus-areas/what-are-galaxies/",
  },
  {
    title: "Hubble's Tuning Fork & Morphological Classification of Galaxies",
    organization: "NASA",
    url: "https://science.nasa.gov/mission/hubble/science/science-highlights/galaxies/",
  },
  {
    title: "ESA Gaia Mission: Mapping 1.8 Billion Stars in the Milky Way",
    organization: "ESA",
    url: "https://www.cosmos.esa.int/web/gaia/dr3",
  },
  {
    title: "Event Horizon Telescope: Imaging Sagittarius A* at Galactic Center",
    organization: "NASA",
    url: "https://eventhorizontelescope.org/",
  },
  {
    title: "Galaxy Morphological Classification",
    organization: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Galaxy_morphological_classification",
  },
];

export const MODULE_13_SUBLESSONS: GalaxySublesson[] = [
  {
    id: "13-1-morphology",
    number: 1,
    title: "Galaxy Morphologies & The Hubble Tuning Fork",
    shortTitle: "Galaxy Taxonomy",
    summary:
      "Edwin Hubble classified galaxies into spiral, barred spiral, elliptical, and irregular systems based on their visible structural geometry.",
    status: "complete",
    keyConcepts: {
      junior: [
        "Galaxies are giant island cities of billions of stars",
        "Some look like spinning pinwheels (spirals), some look like smooth footballs (ellipticals)",
        "Edwin Hubble sorted galaxies into shapes like a musical tuning fork",
      ],
      explorer: [
        "Spiral galaxies (S) have flat rotating disks, spiral arms, and gas rich in new star birth",
        "Barred spirals (SB) feature a central elongated bar of stars funneled toward the nucleus",
        "Elliptical galaxies (E0–E7) contain older stars with little cold gas or ongoing star formation",
        "Irregular galaxies (Irr) lack symmetric shape, often distorted by gravitational encounters",
      ],
      astronomer: [
        "Hubble sequence: E0 (spherical) to E7 (flattened) transitioning via S0 lenticulars into Sa/Sb/Sc and SBa/SBb/SBc branches",
        "De Vaucouleurs revised Hubble-Sandage system adds inner rings (r/s) and luminosity classes",
        "Color-Magnitude Bimodal Distribution: 'blue cloud' (actively star-forming spirals) vs. 'red sequence' (quenched ellipticals)",
      ],
    },
    content: {
      junior:
        "Imagine a giant swirling city in space made of hundreds of billions of stars, planets, and glowing clouds! These are galaxies. In the 1920s, astronomer Edwin Hubble noticed that galaxies come in distinct cosmic shapes. Some are gorgeous spinning pinwheels called spirals, some look like smooth glowing eggs called ellipticals, and some are playful chaotic splashes called irregular galaxies!",
      explorer:
        "Galaxies are the fundamental building blocks of the visible universe. In 1926, Edwin Hubble created the 'Tuning Fork Diagram' to classify them: Ellipticals (E0 to E7) have smooth starlight with ancient Population II stars and very little dust. Spirals (Sa, Sb, Sc) have luminous disks with active star formation in sweeping arms. Barred spirals (like our own Milky Way!) possess a central bar of stars that funnels gas directly into the core.",
      astronomer:
        "The Hubble sequence organizes galaxies by bulge-to-disk ratio, spiral arm pitch angle, and degree of arm resolution. While originally misconstrued as an evolutionary sequence from 'early-type' (ellipticals) to 'late-type' (spirals), modern astrophysics demonstrates hierarchical assembly: gas-rich disk mergers and galactic cannibalism typically transform star-forming spirals into pressure-supported, quenched ellipticals along the red sequence.",
    },
    mathOrPhysicsDeepDive: {
      title: "Surface Brightness Profiles: Sersic Law vs. Exponential Disk",
      description:
        "Elliptical galaxies and bulges follow the de Vaucouleurs profile I(R) = I_e * exp(-7.67 * ((R/R_e)^(1/4) - 1)), whereas galactic disks follow an exponential decay I(R) = I_0 * exp(-R / R_d).",
      formula:
        "I(R) = I_e \\cdot \\exp\\left[-b_n \\left(\\left(\\frac{R}{R_e}\\right)^{1/n} - 1\\right)\\right]",
    },
    didYouKnow:
      "Edwin Hubble used Cepheid variable stars in the Andromeda Galaxy (M31) in 1923 to prove it was a separate 'island universe' millions of light-years away, ending the Great Debate!",
    observationalFocus:
      "Compare Andromeda (Barred Spiral SA(s)b) and the Sombrero Galaxy (SA(s)a) in the 3D model above to see how bulge size and disk tilt change their appearance.",
    nasaSourceUrl: "https://science.nasa.gov/mission/hubble/science/science-highlights/galaxies/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Hubble_sequence",
  },
  {
    id: "13-2-milky-way-anatomy",
    number: 2,
    title: "Anatomy of the Milky Way & Spiral Arms",
    shortTitle: "Milky Way Anatomy",
    summary:
      "Our home galaxy is a barred spiral spanning 100,000 light-years, consisting of a thin disk, thick disk, central bar, bulge, and massive stellar halo.",
    status: "complete",
    keyConcepts: {
      junior: [
        "We live inside the Milky Way galaxy, about halfway out from the bright center",
        "Our galaxy has a bright central bar and four main spiral arms",
        "It takes our Sun about 230 million years to make one single trip around the galaxy",
      ],
      explorer: [
        "The Milky Way is an SBbc barred spiral spanning ~100,000 light-years across",
        "Our Solar System is situated in the Orion-Cygnus Arm spur, ~26,700 light-years from the center",
        "Spiral arms are not rigid structures like fan blades; they are density waves compressing gas",
        "The galaxy has a thin disk (young stars, gas), thick disk (older stars), and spherical halo (globular clusters)",
      ],
      astronomer: [
        "Lin-Shu Density Wave Theory: stars and gas enter and exit gravitational density waves, causing shock compression and triggering star formation",
        "Stellar population kinematics: thin disk scale height z_0 ~ 300 pc, thick disk z_0 ~ 1,000 pc",
        "Galactic rotation velocity at Solar Circle: V_0 ≈ 220–240 km/s at R_0 ≈ 8.2 kpc, giving a Galactic Year of ~225–250 Myr",
      ],
    },
    content: {
      junior:
        "Every single star you can see with your naked eyes in the night sky belongs to our home galaxy, the Milky Way! If you could look down on it from space, you would see a magnificent spinning pinwheel of 100 to 400 billion stars. Our Sun is located in a cozy outer arm called the Orion Spur, circling the galaxy once every 230 million years!",
      explorer:
        "Because we live inside the Milky Way, we see it as a luminous milky band of starlight stretching across dark night skies. Infrared observatories like Spitzer and Gaia have mapped its true shape: a central bar of stars ~27,000 light-years long feeding two major spiral arms (Scutum-Centaurus and Perseus) and several minor arms. The spiral arms are dynamic density waves—cosmic traffic jams where gas clouds get squeezed and ignite into thousands of bright blue new stars.",
      astronomer:
        "The Milky Way's stellar disk exhibits structural and chemical stratification: the young, metal-rich Population I thin disk contains cold molecular clouds (CO, H I) with ongoing star formation rate ~1–2 M☉/yr. The older, metal-poor thick disk and stellar halo preserve fossils from early accretion mergers (such as the Gaia-Enceladus sausage merger ~10 Gyr ago). Gaia DR3 astrometry confirms a pronounced warp in the outer H I disk driven by tidal torque from the Magellanic Clouds.",
    },
    mathOrPhysicsDeepDive: {
      title: "Oort Constants & Galactic Differential Rotation",
      description:
        "Differential rotation in the Galactic disk is quantified via Oort constants A and B, where A = -1/2 * R_0 * (dV/dR)_0 and B = -1/2 * (R_0 * (dV/dR)_0 + 2*V_0/R_0).",
      formula: "A - B = \\frac{V_0}{R_0} \\approx 28 \\text{ km/s/kpc}",
    },
    didYouKnow:
      "Since dinosaurs first appeared on Earth ~230 million years ago, the Solar System has completed exactly ONE full orbit around the center of the Milky Way!",
    observationalFocus:
      "Notice how the particle simulation depicts the central golden bulge of older stars surrounded by the cooler cyan and blue spiral arms.",
    nasaSourceUrl: "https://science.nasa.gov/mission/hubble/science/science-highlights/milky-way/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Milky_Way",
  },
  {
    id: "13-3-local-group",
    number: 3,
    title: "Our Local Group: Andromeda, Triangulum & Satellite Dwarfs",
    shortTitle: "The Local Group",
    summary:
      "A gravitationally bound cluster of more than 80 galaxies dominated by the Milky Way and Andromeda, hurtling toward a titanic merger.",
    status: "complete",
    keyConcepts: {
      junior: [
        "The Milky Way lives with a cosmic family of neighbor galaxies called the Local Group",
        "Andromeda is our biggest neighbor galaxy, containing roughly one trillion stars",
        "Andromeda is rushing toward us right now and will merge with our galaxy in 4.5 billion years!",
      ],
      explorer: [
        "The Local Group spans approximately 10 million light-years in diameter",
        "Two dominant giants: Andromeda (M31) and the Milky Way; third largest is Triangulum (M33)",
        "Over 80 dwarf galaxies orbit as satellites, including the Large and Small Magellanic Clouds",
        "Andromeda approaches at 110 km/s; when they merge, stars will pass safely without colliding",
      ],
      astronomer: [
        "Local Group barycenter lies between M31 and the Milky Way; total dynamical mass M_tot ≈ (2–3) × 10^12 M☉",
        "Peculiar velocity vector: Andromeda exhibits a radial blue-shift of v_rad ≈ -301 km/s (-110 km/s relative to Galactic Center)",
        "Tidal streaming & galactic cannibalism: Sagittarius Dwarf Spheroidal and Magellanic Stream demonstrate active ongoing disruption",
      ],
    },
    content: {
      junior:
        "Galaxies are not scattered randomly in space—they live in cosmic neighborhoods! Our neighborhood is called the Local Group. Our closest big sister is the Andromeda Galaxy. Even though it is 2.5 million light-years away, it is so gigantic and bright that on a dark night you can see it with your own eyes without a telescope as a soft glowing smudge in the constellation Andromeda!",
      explorer:
        "The Local Group is dominated by two heavyweight spiral galaxies: Andromeda (M31), harboring ~1 trillion stars, and our Milky Way (~200–400 billion stars). The third-largest is the Triangulum Galaxy (M33). Surrounding these giants are dozens of smaller dwarf satellite galaxies. Gravitational attraction is pulling Andromeda and the Milky Way together at 110 kilometers per second. In about 4.5 billion years, they will gracefully merge to create a giant elliptical galaxy astronomers call 'Milkomeda'.",
      astronomer:
        "Hubble Space Telescope proper-motion measurements (Sohn et al. 2012) resolved the transverse velocity of M31, confirming a direct, head-on collision trajectory rather than a glancing flyby. Because interstellar distances between individual stars are vast (the average stellar separation is ~4 light-years), the probability of two stars physically colliding is nearly zero. However, giant interstellar gas clouds will collide violently, triggering a colossal starburst phase and eventually relaxing into a triaxial giant elliptical galaxy.",
    },
    mathOrPhysicsDeepDive: {
      title: "Timing Argument & Local Group Mass",
      description:
        "Using Keplerian two-body mechanics for an expanding and turnaround trajectory over cosmic time t_0 = 13.8 Gyr, the total mass of the Milky Way + Andromeda system is determined directly from separation and approach velocity.",
      formula:
        "M_{\\text{tot}} = \\frac{\\eta - \\sin\\eta}{(1 - \\cos\\eta)^3} \\frac{r^3}{G t^2}",
    },
    didYouKnow:
      "When the Milky Way and Andromeda merge in 4.5 billion years, our Sun will likely be kicked into a distant orbit in the outer halo, but Earth will remain unharmed!",
    observationalFocus:
      "Select 'Andromeda Galaxy' in the catalog list to see its vast particle disk and warm central nucleus.",
    nasaSourceUrl:
      "https://science.nasa.gov/mission/hubble/science/science-highlights/hubble-views-the-andromeda-galaxy/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Local_Group",
  },
  {
    id: "13-4-galactic-cores",
    number: 4,
    title: "Supermassive Black Holes & Active Galactic Nuclei (AGN)",
    shortTitle: "Galactic Cores & SMBHs",
    summary:
      "Virtually every massive galaxy harbors a central supermassive black hole containing millions to billions of solar masses, dictating galaxy growth via feedback.",
    status: "complete",
    keyConcepts: {
      junior: [
        "In the very heart of almost every big galaxy sits a supermassive black hole",
        "Our galaxy's black hole is called Sagittarius A*, weighing as much as 4 million Suns",
        "Even though it's super heavy, it is tiny compared to the whole galaxy",
      ],
      explorer: [
        "Sagittarius A* (Sgr A*) is located at the center of the Milky Way, ~26,700 light-years away",
        "Supermassive black holes (SMBHs) range from millions to tens of billions of solar masses",
        "Active Galactic Nuclei (AGN) and Quasars occur when gas falls into an SMBH accretion disk, shining brighter than 1,000 whole galaxies",
        "In 2022, the Event Horizon Telescope captured the historic first direct radio image of Sgr A*",
      ],
      astronomer: [
        "M-sigma relation: tight empirical correlation M_BH ∝ sigma^4.4 between SMBH mass and stellar velocity dispersion of the host galaxy bulge",
        "Eddington luminosity limit L_Edd = (4 pi G M m_p c) / sigma_T governs the maximum accretion rate supported by radiation pressure",
        "AGN feedback modes: 'quasar mode' (radiative winds clearing gas) and 'radio mode' (relativistic plasma jets heating the intracluster medium, quenching star formation)",
      ],
    },
    content: {
      junior:
        "What keeps the center of a galaxy anchored? Deep in the very center sits a cosmic titan: a supermassive black hole! At the center of our Milky Way is Sagittarius A* (pronounced 'Sagittarius A-star'). It has the mass of over 4 million Suns crammed into a space smaller than the orbit of Mercury! In 2020, astronomers won the Nobel Prize in Physics for tracking stars orbiting this invisible anchor.",
      explorer:
        "For decades, astronomers watched stars near the center of the Milky Way whip around an invisible point at speeds over 5,000 kilometers per second. By measuring the orbit of the star 'S2', they proved an object with 4.15 million times the mass of our Sun is concentrated there. When black holes actively feed on surrounding gas and dust, friction heats the accretion disk to millions of degrees, creating blinding beacons known as Quasars that can be seen across the entire observable universe.",
      astronomer:
        "The co-evolution of supermassive black holes and host galaxies is demonstrated by the Magorrian relation and the M-sigma relation, proving that central black holes grow concurrently with their host bulges. The Event Horizon Telescope (EHT) mm-VLBI array resolved the shadow of Sgr A* with an angular diameter of 51.8 microarcseconds, consistent with Kerr metric general relativistic frame-dragging predictions for a rotating black hole.",
    },
    mathOrPhysicsDeepDive: {
      title: "Schwarzschild Radius of Sagittarius A*",
      description:
        "For Sgr A* with mass M ≈ 4.15 × 10^6 M☉, the event horizon radius is R_s = 2GM/c² ≈ 1.23 × 10^7 km (about 0.08 AU or ~17.7 solar radii).",
      formula: "R_s = \\frac{2GM}{c^2} \\approx 1.23 \\times 10^{10} \\text{ meters}",
    },
    didYouKnow:
      "The supermassive black hole at the center of the giant elliptical galaxy M87 weighs a staggering 6.5 BILLION times more than our Sun—large enough to swallow our entire solar system!",
    observationalFocus:
      "Look at the brilliant central sphere in each 3D galaxy model representing the luminous, densely packed galactic nucleus where the central black hole resides.",
    nasaSourceUrl: "https://science.nasa.gov/universe/black-holes/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Supermassive_black_hole",
  },
  {
    id: "13-5-dark-matter",
    number: 5,
    title: "Galactic Rotation Curves & Dark Matter Halos",
    shortTitle: "Rotation & Dark Matter",
    summary:
      "Vera Rubin's measurements of flat galaxy rotation curves revealed that visible stars make up only a fraction of a galaxy's mass—the rest is invisible dark matter.",
    status: "complete",
    keyConcepts: {
      junior: [
        "Stars on the outer edges of galaxies are moving much faster than scientists expected",
        "Something invisible is holding them with extra gravity so they don't fly off into space!",
        "Astronomers call this mysterious invisible glue 'dark matter'",
      ],
      explorer: [
        "According to Kepler's laws, outer planets move slower because they are far from the central mass",
        "In galaxies, Vera Rubin discovered that outer stars orbit just as fast as inner stars (flat rotation curve)",
        "This proves that galaxies are embedded in giant, invisible spheres called dark matter halos",
        "Dark matter makes up roughly 85% of all matter in the universe, yet emits no light",
      ],
      astronomer: [
        "Expected Keplerian decline: v(r) ∝ r^(-1/2) outside the luminous disk; observed: v(r) ≈ const out to tens of kpc",
        "Enclosed mass M(r) = (v^2 * r) / G implies mass increases linearly with radius: M(r) ∝ r, requiring an extended dark halo",
        "Navarro-Frenk-White (NFW) density profile: rho(r) = rho_0 / [ (r/r_s) * (1 + r/r_s)^2 ] derived from cosmological cold dark matter (CDM) N-body simulations",
      ],
    },
    content: {
      junior:
        "Think about our solar system: Mercury zips around the Sun in just 88 days, while distant Neptune takes 165 whole years! You would expect stars on the outer edge of a galaxy to move much slower than stars near the center. But in the 1970s, astronomer Vera Rubin made a shocking discovery: the outer stars are racing around just as fast as the inner stars! Something invisible is holding the galaxy together like cosmic superhero glue. We call it dark matter!",
      explorer:
        "When astrophysicists measured the orbital velocities of hydrogen gas in spiral galaxies using radio telescopes (the 21-cm line), they expected the rotation speed to drop off with distance. Instead, the rotation curves stayed completely flat! If only visible stars and gas existed, galaxies would tear themselves apart and fling their stars into intergalactic space. To stay bound, each galaxy must be enveloped in a colossal, spherical 'dark matter halo' containing 5 to 10 times more mass than all the visible stars combined.",
      astronomer:
        "Flat rotation curves provide compelling empirical evidence for non-baryonic dark matter on galactic scales. Alternative hypotheses such as Modified Newtonian Dynamics (MOND) attempt to alter the acceleration law a = sqrt(a_0 * g_N) at low accelerations (a < 1.2 × 10^-10 m/s^2), but struggle to explain gravitational lensing offsets in colliding clusters like the Bullet Cluster (1E 0657-558) and cosmological CMB acoustic peak ratios.",
    },
    mathOrPhysicsDeepDive: {
      title: "Enclosed Dynamical Mass Calculation",
      description:
        "For a star orbiting at radius r with velocity v in circular orbit, equating gravitational force to centripetal acceleration yields the enclosed mass:",
      formula: "M(r) = \\frac{v^2 \\cdot r}{G}",
    },
    didYouKnow:
      "Vera Rubin's groundbreaking discovery of flat rotation curves in the 1970s revolutionized cosmology, proving that everything we can see with our eyes accounts for less than 15% of the universe's matter!",
    observationalFocus:
      "Notice how the procedural particles in the 3D model maintain a coordinated rotational swirl without flying apart, illustrating gravitational stabilization.",
    nasaSourceUrl: "https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Galaxy_rotation_curve",
  },
  {
    id: "13-6-galaxy-collisions",
    number: 6,
    title: "Galaxy Collisions & Starburst Dynamics",
    shortTitle: "Colliding Galaxies",
    summary:
      "When galaxies collide, their stars pass safely by one another while interstellar gas clouds smash together, sparking frantic waves of star formation.",
    status: "complete",
    keyConcepts: {
      junior: [
        "Galaxies can collide and merge together like giant cosmic dancers",
        "Even though galaxies collide, stars rarely ever hit each other because space is so big!",
        "The collision squeezes gas clouds, lighting up millions of bright new baby stars",
      ],
      explorer: [
        "Galactic interactions stretch out long tidal tails of stars and gas light-years long",
        "The Whirlpool Galaxy (M51) is currently interacting with companion galaxy NGC 5195",
        "Collisions compress molecular clouds, causing a 'starburst' where stars form at 100x normal rates",
        "Colliding spiral galaxies eventually settle into a single smooth elliptical galaxy",
      ],
      astronomer: [
        "Dynamical friction (Chandrasekhar formula) decelerates interacting galactic cores, causing orbital decay and merger",
        "Tidal forces strip outer stars into tidal streams while tidal torques drive gas inward toward the nuclei, triggering starbursts and luminous infrared galaxies (LIRGs / ULIRGs)",
        "Morphological transformation: Toomre merger hypothesis demonstrates that collision of equal-mass spirals produces an r^(1/4) elliptical galaxy remnant",
      ],
    },
    content: {
      junior:
        "What happens when two galaxies crash into each other? It sounds like a giant explosion, but it is actually a slow, beautiful cosmic dance that takes hundreds of millions of years! Because stars are separated by light-years of empty space, individual stars almost never hit each other. Instead, their gravity pulls out long sparkling streams of stars called tidal tails!",
      explorer:
        "The Whirlpool Galaxy (M51) gives us a ringside seat to a galaxy collision. Its smaller neighbor, NGC 5195, has passed through M51's disk, and its gravitational pull has pumped energy into M51's spiral arms, triggering a starburst of bright pink and blue star clusters. In the Antennae Galaxies (NGC 4038/4039), two spirals have collided so violently that huge arcs of stars have been slung into space like the antennae of an insect.",
      astronomer:
        "Galaxy mergers are the principal mechanism of hierarchical galaxy evolution in lambda-CDM cosmology. Major mergers (mass ratio > 1:4) destroy coherent stellar disks via gravitational tidal torquing and violent relaxation, ejecting tidal tails while concentrating cold gas into central sub-kiloparsec regions. This drives intense nuclear starbursts with star formation rates exceeding 100 M☉/yr and feeds rapid supermassive black hole growth until AGN radiative feedback exhausts the gas reservoir.",
    },
    mathOrPhysicsDeepDive: {
      title: "Chandrasekhar Dynamical Friction",
      description:
        "A massive body of mass M moving through a sea of stars of velocity dispersion sigma experiences a drag deceleration F_df due to the gravitational wake formed behind it.",
      formula:
        "F_{\\text{df}} = -\\frac{4\\pi G^2 M^2 \\rho \\ln\\Lambda}{v^2} \\left[\\text{erf}(X) - \\frac{2X}{\\sqrt{\\pi}} e^{-X^2}\\right]",
    },
    didYouKnow:
      "The distance between stars is so enormous that when the Milky Way and Andromeda collide with a combined trillion stars, the chance of any two individual stars physically colliding is less than one in a billion!",
    observationalFocus:
      "Select the 'Whirlpool Galaxy' in the catalog list to view its grand-design spiral arms, driven by interaction with its companion NGC 5195.",
    nasaSourceUrl: "https://science.nasa.gov/missions/hubble/hubble-views-the-whirlpool-galaxy/",
    wikiSourceUrl: "https://en.wikipedia.org/wiki/Interacting_galaxy",
  },
];

export const MODULE_13_QUIZ_QUESTIONS: Record<
  "junior" | "explorer" | "astronomer",
  QuizQuestion[]
> = {
  junior: [
    {
      id: "q-jr-1",
      question: "What is a galaxy made of?",
      options: [
        "Just one single gigantic star",
        "Billions of stars, planets, gas clouds, and dark matter held together by gravity",
        "Solid rock and ice floating in space",
        "A huge cloud of burning fire",
      ],
      correctIndex: 1,
      explanation:
        "A galaxy is a colossal celestial system containing tens to hundreds of billions of stars, planets, gas, and dark matter held together by gravity!",
    },
    {
      id: "q-jr-2",
      question: "What is the name of our home galaxy?",
      options: ["Andromeda", "The Milky Way", "The Solar System", "Orion"],
      correctIndex: 1,
      explanation:
        "We live inside the Milky Way Galaxy! All the stars you can see at night belong to our Milky Way.",
    },
    {
      id: "q-jr-3",
      question: "What sits at the very center of the Milky Way galaxy?",
      options: [
        "A supermassive black hole called Sagittarius A*",
        "A giant planet made of diamond",
        "A huge mirror reflecting starlight",
        "Nothing, it is completely empty",
      ],
      correctIndex: 0,
      explanation:
        "At the center of our galaxy sits Sagittarius A*, a supermassive black hole with the mass of over 4 million Suns!",
    },
  ],
  explorer: [
    {
      id: "q-ex-1",
      question:
        "According to Hubble's morphological classification, which type of galaxy has a flat rotating disk with sweeping arms of new star formation?",
      options: ["Elliptical (E)", "Spiral (S / SB)", "Irregular (Irr)", "Globular Cluster"],
      correctIndex: 1,
      explanation:
        "Spiral galaxies have flat disks containing interstellar gas and dust where new stars form along sweeping spiral arms.",
    },
    {
      id: "q-ex-2",
      question: "What did astronomer Vera Rubin discover when measuring galaxy rotation curves?",
      options: [
        "Galaxies are spinning backward compared to their stars",
        "Outer stars orbit just as fast as inner stars, proving the existence of invisible dark matter",
        "Galaxies stop spinning when they reach 10 billion years of age",
        "Black holes push stars away into empty space",
      ],
      correctIndex: 1,
      explanation:
        "Vera Rubin showed that orbital speeds remain flat at large distances instead of declining, proving galaxies are surrounded by massive invisible dark matter halos.",
    },
    {
      id: "q-ex-3",
      question:
        "When the Milky Way and Andromeda galaxies merge in about 4.5 billion years, why won't stars smash into each other?",
      options: [
        "Stars are shielded by magnetic armor",
        "Interstellar space between stars is so vast that individual stars almost never collide",
        "The gravity pushes stars in opposite directions",
        "Andromeda is made of antimatter and will evaporate",
      ],
      correctIndex: 1,
      explanation:
        "Because stars are separated by trillions of kilometers of empty space, galaxies pass through each other like clouds of smoke, and stars rarely ever physically touch.",
    },
    {
      id: "q-ex-4",
      question:
        "What type of galaxy is the Large Magellanic Cloud (LMC), visible from Earth's Southern Hemisphere?",
      options: ["Giant Elliptical", "Irregular Satellite Galaxy", "Quasar", "Planetary Nebula"],
      correctIndex: 1,
      explanation:
        "The Large Magellanic Cloud is an irregular satellite galaxy gravitationally bound to our Milky Way at a distance of ~163,000 light-years.",
    },
  ],
  astronomer: [
    {
      id: "q-ast-1",
      question:
        "In spiral density wave theory (Lin & Shu), what physical phenomenon best explains why spiral arms remain stable over cosmic time without winding up tightly?",
      options: [
        "Arms are rigid structures rotating with constant angular velocity",
        "Arms are rotating gravitational potential waves; stars and gas pass through them like cars through a traffic jam",
        "Magnetic field flux tubes physically bind the stars together",
        "Relativistic jets from the central black hole illuminate specific radial tracks",
      ],
      correctIndex: 1,
      explanation:
        "Density wave theory solves the 'winding problem' by treating spiral arms as quasi-stationary density waves through which material enters, undergoes shock compression triggering starbursts, and exits.",
    },
    {
      id: "q-ast-2",
      question:
        "The M-sigma (M_BH - sigma) relation describes an empirical correlation between supermassive black hole mass and which galactic property?",
      options: [
        "The total optical luminosity of the spiral disk",
        "The stellar velocity dispersion of the host galaxy bulge (sigma)",
        "The metallicity of Population II stars in the halo",
        "The angular momentum vector of the satellite dwarfs",
      ],
      correctIndex: 1,
      explanation:
        "The M-sigma relation establishes that M_BH is proportional to sigma^4 to sigma^5, demonstrating co-evolution and self-regulated AGN feedback between the black hole and host bulge.",
    },
    {
      id: "q-ast-3",
      question:
        "If a spiral galaxy's rotation velocity v remains constant out to radius r, how does the enclosed dynamical mass M(r) scale with radius?",
      options: [
        "M(r) is constant (Keplerian)",
        "M(r) scales linearly with radius: M(r) ∝ r",
        "M(r) scales with the cube of radius: M(r) ∝ r^3",
        "M(r) decays as r^(-1/2)",
      ],
      correctIndex: 1,
      explanation:
        "From circular orbital equilibrium v^2 = G*M(r)/r, if v is constant, M(r) = (v^2 * r) / G, which increases linearly with r, requiring an extended dark matter halo.",
    },
    {
      id: "q-ast-4",
      question:
        "What is the morphological classification of the Sombrero Galaxy (M104) in the Hubble sequence?",
      options: [
        "E0 Spherical Elliptical",
        "SA(s)a Spiral with prominent bulge and absorption dust lane",
        "Irr I Irregular",
        "SBc Open Barred Spiral",
      ],
      correctIndex: 1,
      explanation:
        "M104 is an SA(s)a early-type unbarred spiral galaxy characterized by a colossal central stellar bulge and a conspicuous rim-like absorption dust lane.",
    },
  ],
};

export const PREREQUISITE_MODULE_IDS = ["03", "08", "09"];

export const NEXT_RECOMMENDED_MODULE = {
  id: "14",
  title: "Black Holes & Neutron Stars",
  subtitle: "Event horizons, gravitational lensing, and relativistic jets",
  stageId: 4,
  reason:
    "Now that you understand galactic structures and central supermassive black holes, delve deep into the relativistic physics of event horizons, pulsars, and spacetime curvature!",
};
