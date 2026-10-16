export interface CosmicStructureLandmark {
  id: string;
  name: string;
  category: "galaxy" | "group" | "cluster" | "supercluster" | "filament" | "void";
  categoryLabel: string;
  distanceLy: string;
  diameterLy: string;
  galaxyCount: string;
  totalMassSolar: string;
  isGravitationallyBound: boolean;
  boundStatusExplanation: string;
  description: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  keyFact: string;
  observationalSource: string;
}

export const COSMIC_LANDMARKS: CosmicStructureLandmark[] = [
  {
    id: "milky_way",
    name: "The Milky Way",
    category: "galaxy",
    categoryLabel: "Barred Spiral Galaxy (Our Home)",
    distanceLy: "0 Light-Years (Center: 26,700 ly)",
    diameterLy: "~100,000 Light-Years",
    galaxyCount: "1 Galaxy (~200–400 Billion Stars)",
    totalMassSolar: "~1.5 × 10¹² M☉ (with dark matter halo)",
    isGravitationallyBound: true,
    boundStatusExplanation:
      "Fully gravitationally bound: held together by self-gravity and its massive dark matter halo.",
    description: {
      junior:
        "Our home galaxy! A giant spinning pinwheel made of hundreds of billions of stars, planets, and our Sun.",
      explorer:
        "A barred spiral galaxy with our solar system located in the Orion-Cygnus Spur, orbiting the central supermassive black hole Sagittarius A*.",
      astronomer:
        "Stellar mass ~6×10¹⁰ M☉ embedded in a virialized dark matter halo with virial radius R_vir ≈ 200 kpc, governing flat circular velocity curve v_c ≈ 220 km/s.",
    },
    keyFact:
      "Our Sun takes roughly 230 million years to complete one galactic year orbiting the Milky Way center.",
    observationalSource: "Gaia DR3 / SDSS Milky Way Mapping",
  },
  {
    id: "local_group",
    name: "The Local Group",
    category: "group",
    categoryLabel: "Galaxy Group",
    distanceLy: "Centered on Milky Way & Andromeda",
    diameterLy: "~10 Million Light-Years (~3 Mpc)",
    galaxyCount: "80+ Galaxies (Dominated by Milky Way & Andromeda)",
    totalMassSolar: "~3 – 5 × 10¹² M☉",
    isGravitationallyBound: true,
    boundStatusExplanation:
      "Gravitationally bound: Milky Way and Andromeda are actively falling toward each other at 110 km/s.",
    description: {
      junior:
        "A neighborhood family of star cities. The two big sisters are our Milky Way and the Andromeda Galaxy!",
      explorer:
        "A gravitationally bound cluster of over 80 galaxies. The two heavyweights—Milky Way and Andromeda—will collide and merge into 'Milkomeda' in ~4.5 billion years.",
      astronomer:
        "A dynamically bound system decoupled from Hubble expansion. Andromeda (M31) has a blueshift of z = -0.001, closing in at ~110 km/s via mutual gravitational attraction.",
    },
    keyFact:
      "The vast majority of Local Group galaxies are dwarf galaxies orbiting the two giant spirals.",
    observationalSource: "Hubble Space Telescope / Local Group Census",
  },
  {
    id: "virgo_cluster",
    name: "Virgo Cluster",
    category: "cluster",
    categoryLabel: "Rich Galaxy Cluster",
    distanceLy: "~54 Million Light-Years (~16.5 Mpc)",
    diameterLy: "~15 Million Light-Years",
    galaxyCount: "~1,300 – 2,000 Galaxies",
    totalMassSolar: "~1.2 × 10¹⁵ M☉",
    isGravitationallyBound: true,
    boundStatusExplanation:
      "Fully gravitationally bound and virialized: galaxies orbit inside a shared deep gravitational potential well.",
    description: {
      junior:
        "A colossal metropolis of thousands of galaxies packed close together, glowing with hot gas!",
      explorer:
        "The heart of our local universe. Its immense gravity pulls on our Local Group, causing an inward flow known as the 'Virgo-centric Infall'.",
      astronomer:
        "A relaxed, virialized Abell-type cluster with velocity dispersion σ_v ≈ 750 km/s, filled with hot (10⁷–10⁸ K) X-ray emitting intracluster medium (ICM) and anchored by giant elliptical M87.",
    },
    keyFact:
      "The hot gas between galaxies in the Virgo Cluster contains more baryonic mass than all its stars and galaxies combined!",
    observationalSource: "Chandra X-ray Observatory / Virgo Cluster Survey",
  },
  {
    id: "coma_cluster",
    name: "Coma Cluster (Abell 1656)",
    category: "cluster",
    categoryLabel: "Dense Regular Galaxy Cluster",
    distanceLy: "~320 Million Light-Years (~99 Mpc)",
    diameterLy: "~20 Million Light-Years",
    galaxyCount: ">1,000 Giant Galaxies + 10,000+ Dwarfs",
    totalMassSolar: "~2 × 10¹⁵ M☉",
    isGravitationallyBound: true,
    boundStatusExplanation:
      "Gravitationally bound: where Fritz Zwicky in 1933 applied the Virial Theorem and discovered Dark Matter!",
    description: {
      junior:
        "A giant ball of thousands of star cities that helped scientists discover the invisible 'dark matter' of the universe.",
      explorer:
        "In 1933, Fritz Zwicky noticed galaxies in Coma were moving 10 times too fast for the visible stars to hold together. He concluded an invisible 'dunkle Materie' (dark matter) must provide the gravity.",
      astronomer:
        "Virial theorem application 2⟨K⟩ + ⟨U⟩ = 0 yields M_vir ≈ 5 R σ_v² / G. The observed velocity dispersion σ_v ≈ 1000 km/s exceeds visible mass support by a factor of ~50, providing the first historical evidence for non-baryonic dark matter halos.",
    },
    keyFact: "Over 90% of the Coma Cluster's mass consists of invisible dark matter.",
    observationalSource: "Fritz Zwicky (1933) / SDSS DR16 Spectroscopic Survey",
  },
  {
    id: "laniakea",
    name: "Laniakea Supercluster",
    category: "supercluster",
    categoryLabel: "Cosmic Basin of Attraction",
    distanceLy: "Spans from our location outward",
    diameterLy: "~520 Million Light-Years (~160 Mpc)",
    galaxyCount: "~100,000 Galaxies",
    totalMassSolar: "~10¹⁷ M☉",
    isGravitationallyBound: false,
    boundStatusExplanation:
      "NOT gravitationally bound! Dark energy accelerates cosmic expansion faster than gravity can hold Laniakea together. In the distant future, its outer clusters will drift apart forever.",
    description: {
      junior:
        "A super-giant cosmic country with 100,000 galaxies flowing along invisible rivers like water down a watershed.",
      explorer:
        "Mapped in 2014 using galaxy peculiar velocity streamlines. Galaxies inside flow toward a gravitational focal point called the Great Attractor. However, dark energy expansion will eventually tear it apart.",
      astronomer:
        "Defined as a watershed boundary of peculiar velocity fields v_pec = v_obs - H_0 d. Because the cosmic expansion parameter H(t) exceeds gravitational deceleration at scales > 50 Mpc, Laniakea is a kinematic basin of attraction, not a gravitationally bound virialized structure.",
    },
    keyFact:
      "Laniakea means 'Immeasurable Heaven' in Hawaiian, honoring Polynesian navigators who used stars to cross oceans.",
    observationalSource: "Tully et al. (Nature, 2014) Cosmicflows-2 Project",
  },
  {
    id: "bootes_void",
    name: "Boötes Void ('The Great Nothing')",
    category: "void",
    categoryLabel: "Supervoid",
    distanceLy: "~700 Million Light-Years",
    diameterLy: "~330 Million Light-Years (~100 Mpc)",
    galaxyCount: "~60 Known Galaxies (Expected ~2,000+)",
    totalMassSolar: "Underdense: <10% mean cosmic density",
    isGravitationallyBound: false,
    boundStatusExplanation:
      "Underdense bubble expanding faster than surrounding filaments due to lack of retarding gravity.",
    description: {
      junior:
        "A colossal empty bubble in space so huge that if the Milky Way were in the middle, we would have seen no other galaxies until the 1960s!",
      explorer:
        "One of the largest voids in the observable universe. Spanning over 330 million light-years, it contains almost no galaxies. Voids expand because their low mass exerts little gravity to slow down cosmic expansion.",
      astronomer:
        "Density contrast δ = (ρ - ρ̄) / ρ̄ ≈ -0.8. Underdense regions act as effective negative gravitational potentials, expelling matter along Zel'dovich pancake flows into surrounding bounding filaments.",
    },
    keyFact:
      "Astronomer Greg Aldering noted: 'If the Milky Way had been in the center of the Boötes void, we wouldn't have known there were other galaxies until the 1960s.'",
    observationalSource: "Kirshner et al. (1981) / 2dF Galaxy Redshift Survey",
  },
  {
    id: "cosmic_web",
    name: "The Cosmic Web & Filaments",
    category: "filament",
    categoryLabel: "Large-Scale Spacetime Skeleton",
    distanceLy: "Spans the entire Observable Universe",
    diameterLy: "Filaments: 100–300 Mly; Web: 93 Billion ly",
    galaxyCount: "Trillions of Galaxies",
    totalMassSolar: "~10²³ M☉ (Baryons + Cold Dark Matter)",
    isGravitationallyBound: false,
    boundStatusExplanation:
      "A network of dark matter filaments and nodes: nodes (clusters) are bound, but the global web expands with dark energy.",
    description: {
      junior:
        "A giant glowing cosmic spiderweb that connects all the star cities across the entire universe!",
      explorer:
        "The largest pattern in nature. Trillions of galaxies line up along long glowing bridges called filaments, surrounding empty dark bubbles called voids.",
      astronomer:
        "The outcome of anisotropic gravitational collapse described by the Zel'dovich approximation: 1D collapse creates 2D sheets (pancakes), 2D collapse forms 1D filaments, and 3D intersections form virialized cluster nodes.",
    },
    keyFact:
      "Over 85% of all matter in the cosmic web is invisible Cold Dark Matter that forms the gravitational scaffolding.",
    observationalSource: "Millennium Simulation / IllustrisTNG / SDSS 3D Galaxy Map",
  },
];

export interface SubLesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  content: {
    junior: {
      lead: string;
      keyIdea: string;
      explanation: string;
      activityPrompt: string;
    };
    explorer: {
      lead: string;
      keyIdea: string;
      explanation: string;
      activityPrompt: string;
    };
    astronomer: {
      lead: string;
      keyIdea: string;
      explanation: string;
      mathematics: string;
      activityPrompt: string;
    };
  };
}

export const MODULE_15_SUBLESSONS: SubLesson[] = [
  {
    id: "galaxies-not-isolated",
    order: 1,
    title: "Galaxies Do Not Exist in Isolation",
    subtitle: "From single star islands to cosmic social networks",
    readTimeMinutes: 3,
    content: {
      junior: {
        lead: "Just like people live in towns and cities, star cities like our Milky Way live together in big cosmic families!",
        keyIdea:
          "Gravity pulls neighboring galaxies together into pairs, groups, and giant clusters.",
        explanation:
          "When you look at photos of single galaxies, they seem all alone in deep darkness. But space is not an empty desert! Almost every galaxy has companions, sister galaxies, and tiny helper dwarf galaxies orbiting around it, held together by invisible gravitational bonds.",
        activityPrompt:
          "Use the Scale Zoom buttons in the 3D viewer to zoom from our Milky Way out into the Local Group.",
      },
      explorer: {
        lead: "The distribution of galaxies in space is non-random, organized into a hierarchical gravitational structure.",
        keyIdea:
          "Galaxies cluster together under mutual gravitational attraction, forming groups, rich clusters, and vast filaments.",
        explanation:
          "In the early 20th century, Edwin Hubble discovered that galaxies were distinct 'island universes'. But as sky surveys mapped tens of thousands of galaxies, astronomers realized galaxies are social: over 80% reside in groups or rich clusters. Gravity continually pulls galaxies toward each other, causing tidal interactions, gas stripping, and colossal mergers over billions of years.",
        activityPrompt:
          "Notice how our Milky Way is locked in a gravitational dance with the Andromeda Galaxy and Magellanic Clouds.",
      },
      astronomer: {
        lead: "Galactic spatial two-point correlation function ξ(r) = (r₀ / r)^γ quantifies the clustering of luminous cosmic tracers.",
        keyIdea:
          "Observed galaxy clustering power spectrum P(k) reflects the primordial Harrison-Zel'dovich matter fluctuations modulated by dark matter transfer functions.",
        explanation:
          "The power-law correlation ξ(r) ≈ (r / 5.4 h⁻¹ Mpc)⁻¹·⁸ demonstrates strong clustering up to ~10–20 Mpc. Galaxies trace underlying cold dark matter (CDM) halos with a scale-dependent bias parameter b = δ_gal / δ_matter. This gravitational clustering is seeded by primordial quantum fluctuations stretched during cosmic inflation.",
        mathematics:
          "Matter correlation function: ξ(r) = ⟨δ(x) δ(x + r)⟩ = (1 / 2π²) ∫ P(k) [sin(kr) / kr] k² dk. Luminous galaxy bias: P_g(k) = b² P_m(k).",
        activityPrompt:
          "Inspect the galaxy density comparison metrics between isolated voids and dense cluster cores.",
      },
    },
  },
  {
    id: "galaxy-groups",
    order: 2,
    title: "Galaxy Groups & The Local Group",
    subtitle: "Compact gravitational families of up to 50 galaxies",
    readTimeMinutes: 3,
    content: {
      junior: {
        lead: "A galaxy group is a small family of galaxies that travel together through the universe.",
        keyIdea:
          "Our Local Group has two big spirals (Milky Way & Andromeda) and over 80 smaller dwarf galaxies.",
        explanation:
          "Imagine a playground with two big kids and dozens of small puppies running around them. That is our Local Group! The Milky Way and Andromeda are the big galaxies, and small galaxies like the Magellanic Clouds orbit around them like moons.",
        activityPrompt:
          "Select 'The Local Group' in the landmark catalog to see how far our family spans in light-years.",
      },
      explorer: {
        lead: "Galaxy groups contain between a few and roughly 50 galaxies spanning 3 to 10 million light-years.",
        keyIdea:
          "The Local Group is gravitationally bound, overcoming the Hubble expansion of space locally.",
        explanation:
          "While the universe as a whole expands and distant galaxies fly apart, the gravity inside the Local Group is strong enough to halt expansion locally! Andromeda is not moving away from us; it is rushing toward the Milky Way at 110 kilometers per second. In 4.5 billion years, our two galaxies will collide and coalesce into a giant elliptical galaxy nicknamed 'Milkomeda'.",
        activityPrompt:
          "Switch between the Visible Matter and Dark Matter layers to see the halo holding the Local Group together.",
      },
      astronomer: {
        lead: "Galaxy groups are dynamic systems with virial masses M_vir ~ 10¹² – 10¹³ M☉ and velocity dispersions σ_v ~ 100 – 300 km/s.",
        keyIdea:
          "Dynamical friction (Chandrasekhar formula) drives rapid orbital decay and galaxy mergers in group environments.",
        explanation:
          "Because relative orbital velocities in groups are comparable to internal stellar velocity dispersions (v_rel ≈ σ), galaxy interactions are highly inelastic. Tidal tails, stellar streams, and gas stripping (e.g., the Magellanic Stream) illustrate ongoing accretion. Compact groups (like Stephan's Quintet or Hickson Compact Groups) exhibit severe dynamical friction that leads to 'fossil groups'—massive isolated ellipticals formed from merged group members.",
        mathematics:
          "Chandrasekhar dynamical friction force: F_df = - [4π G² M² ρ_bg ln(Λ) / v²] [erf(X) - (2X / √π) e^(-X²)], where X = v / (√2 σ).",
        activityPrompt:
          "Explore the compact group collision dynamics in the interactive laboratory.",
      },
    },
  },
  {
    id: "galaxy-clusters",
    order: 3,
    title: "Galaxy Clusters & Hot Intracluster Gas",
    subtitle: "The most massive gravitationally bound structures in the cosmos",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "Galaxy clusters are the biggest cities in the universe, packed with thousands of galaxies glowing with hot X-ray gas!",
        keyIdea: "They are held together by giant bubbles of invisible dark matter.",
        explanation:
          "A cluster is like a gigantic cosmic city with thousands of star islands swirling around each other. Between the galaxies floats super-hot gas at millions of degrees! Space telescopes like Chandra take X-ray pictures of this gas glowing brightly in the dark.",
        activityPrompt:
          "Click on the 'Virgo Cluster' in the 3D lab to inspect the hot gas and giant galaxy M87 at its center.",
      },
      explorer: {
        lead: "Galaxy clusters contain hundreds to thousands of galaxies, spanning 10 to 30 million light-years across.",
        keyIdea:
          "Cluster Mass Breakdown: ~85% Dark Matter, ~13% Hot Intracluster Gas, and only ~2% Stars & Galaxies!",
        explanation:
          "When astronomers add up everything in a cluster, stars and galaxies make up a tiny fraction of the total mass. The vast majority of normal matter exists as a diffuse, 10–100 million Kelvin plasma called the Intracluster Medium (ICM). Above all of that sits an enormous halo of dark matter whose gravity holds the cluster together against the thermal pressure of the gas.",
        activityPrompt:
          "Learn how Fritz Zwicky used the Coma Cluster in 1933 to first prove that Dark Matter exists.",
      },
      astronomer: {
        lead: "Galaxy clusters represent the largest virialized equilibrium structures in the universe (M ~ 10¹⁴ – 10¹⁵ M☉).",
        keyIdea:
          "Hydrostatic equilibrium of the Intracluster Medium (ICM) allows direct measurement of cluster total gravitational potential.",
        explanation:
          "The ICM emits thermal bremsstrahlung radiation in X-rays: ε_ff ∝ n_e n_i T^(1/2). Assuming spherical hydrostatic equilibrium, the total gravitational mass profile is M(<r) = - [k_B T(r) r / (G μ m_p)] [d ln ρ_gas / d ln r + d ln T / d ln r]. Strong and weak gravitational lensing independently confirm this mass profile, revealing that non-baryonic dark matter comprises ~85% of total cluster mass.",
        mathematics:
          "Hydrostatic cluster mass equation: dP_gas/dr = - G M(r) ρ_gas / r². Virial temperature: k_B T_vir ≈ (G M μ m_p) / (2 R_vir) ~ 2 – 10 keV.",
        activityPrompt:
          "Use the cluster mass calculator to compare visible baryonic mass with gravitational lensing mass.",
      },
    },
  },
  {
    id: "superclusters",
    order: 4,
    title: "Superclusters: Laniakea & Gravitational Limits",
    subtitle: "Why the largest named structures are NOT gravitationally bound",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "Superclusters are gigantic collections of clusters that stretch across hundreds of millions of light-years.",
        keyIdea:
          "Crucial Fact: Superclusters are so gigantic that gravity CANNOT hold them together against expanding space!",
        explanation:
          "Our Milky Way lives in a giant territory called Laniakea, which means 'Immeasurable Heaven'. But here is a big cosmic secret: Laniakea is NOT held together like a star or cluster! The mysterious dark energy pushing space apart is stronger than gravity at this scale, so Laniakea will slowly spread apart in the future.",
        activityPrompt:
          "Toggle the 'Gravitational Bound Status' badge on Laniakea to understand why superclusters will dissolve.",
      },
      explorer: {
        lead: "Superclusters span hundreds of millions of light-years, linking dozens of rich clusters and groups.",
        keyIdea:
          "Distinction: Clusters are gravitationally bound (virialized); Superclusters are NOT bound and will be torn apart by dark energy.",
        explanation:
          "A galaxy cluster is like a locked solar system where gravity has permanently won. But superclusters like Laniakea (520 million light-years wide) or the Shapley Supercluster are too vast. The Hubble expansion and accelerating dark energy (Lambda) exceed the escape velocity of the supercluster. Galaxies inside flow along streaming pathways today, but will never collapse into a single bound object.",
        activityPrompt:
          "Inspect the velocity streamline arrows showing galaxies flowing toward the Great Attractor.",
      },
      astronomer: {
        lead: "Superclusters are non-virialized overdensities still decoupling from—or being overwhelmed by—accelerating cosmic expansion.",
        keyIdea:
          "In a ΛCDM universe with Ω_m ≈ 0.31 and Ω_Λ ≈ 0.69, the turn-around radius marks the absolute upper boundary of bound structure.",
        explanation:
          "For any overdensity δ, physical turnaround from Hubble expansion occurs only if gravitational deceleration overcomes cosmological constant acceleration: (4/3) π G ρ̄ (1 + δ) r > (1/3) Λ c² r. Structures larger than r_turn ≈ 10–20 h⁻¹ Mpc cannot collapse before dark energy acceleration dominates. Laniakea (diameter ~160 Mpc) is a kinematic basin of attraction defined by zero-divergence velocity contours, not a virialized gravitational bound state.",
        mathematics:
          "Maximum turnaround radius: R_ta = [ 3 G M / (c² Λ) ]^(1/3) = [ G M / H_0² Ω_Λ ]^(1/3). Structures exceeding R_ta expand forever.",
        activityPrompt:
          "Check the turnaround radius derivation in the cosmological mathematics panel.",
      },
    },
  },
  {
    id: "cosmic-filaments",
    order: 5,
    title: "Cosmic Filaments & The Missing Baryons",
    subtitle: "Massive bridges of dark matter and gas connecting cluster cities",
    readTimeMinutes: 3,
    content: {
      junior: {
        lead: "Filaments are giant cosmic highways made of gas and dark matter where galaxies travel.",
        keyIdea: "They connect clusters together like glowing threads in a giant spiderweb.",
        explanation:
          "Think of clusters as big cities, and filaments as the busy interstate highways connecting them. Millions of galaxies ride along these gravitational bridges, falling toward the cluster centers where all the roads meet!",
        activityPrompt:
          "Look at the glowing threads connecting galaxy clusters in the 3D Cosmic Web view.",
      },
      explorer: {
        lead: "Filaments contain over 50% of all normal matter in the universe, hidden as warm-hot intergalactic gas.",
        keyIdea:
          "Astronomers solved the 'Missing Baryon Problem' by detecting the Warm-Hot Intergalactic Medium (WHIM) along filaments.",
        explanation:
          "For decades, counting all stars, gas, and dust in galaxies found less than half the normal matter predicted by the Big Bang. Where was the rest? Cosmological simulations predicted it was hiding inside cosmic filaments as the Warm-Hot Intergalactic Medium (WHIM)—gas at 100,000 to 10 million Kelvin. Recent X-ray and Fast Radio Burst (FRB) dispersion measurements confirmed the WHIM lines the cosmic filaments exactly as predicted!",
        activityPrompt:
          "Toggle the Warm-Hot Gas layer to reveal the invisible matter bridging the clusters.",
      },
      astronomer: {
        lead: "Filamentary morphology represents intermediate eigenvalue collapse in Zel'dovich gravitational deformation tensors.",
        keyIdea:
          "Warm-Hot Intergalactic Medium (WHIM) absorbs along O VII, O VIII, and Ne IX resonance lines and causes FRB plasma dispersion.",
        explanation:
          "Filaments have typical density contrasts δ ~ 5–30 and radii ~1–2 h⁻¹ Mpc. Matter streams along filament axes toward high-density cluster nodes. Shock heating during gravitational accretion heats diffuse hydrogen and helium to 10⁵–10⁷ K, rendering it invisible in optical emission but detectable via O VI/O VII absorption in quasar sightlines and dispersion measures (DM) of cosmological Fast Radio Bursts.",
        mathematics:
          "FRB dispersion measure: DM = ∫ n_e dl ∝ f_baryon ∫ [ (1 + z) / E(z) ] dz. This directly weighs the ionized WHIM inside filaments.",
        activityPrompt:
          "Analyze the simulated FRB dispersion measure across cosmic filaments in the laboratory.",
      },
    },
  },
  {
    id: "cosmic-voids",
    order: 6,
    title: "Cosmic Voids: The Great Empty Bubbles",
    subtitle: "Giant dark regions that dominate the volume of the universe",
    readTimeMinutes: 3,
    content: {
      junior: {
        lead: "Voids are colossal empty bubbles where almost no stars or galaxies exist at all!",
        keyIdea:
          "Voids take up most of the space in the universe—like giant holes in Swiss cheese.",
        explanation:
          "If the cosmic web is like Swiss cheese, galaxies and filaments are the cheese, and voids are the giant empty holes! In the Boötes Void, a space 330 million light-years wide contains only about 60 lonely galaxies. If Earth were inside, we would have seen only complete pitch darkness beyond our own galaxy!",
        activityPrompt:
          "Rotate the 3D model to peer inside the Boötes Void and observe how empty it is compared to clusters.",
      },
      explorer: {
        lead: "Cosmic voids are underdense regions spanning 50 to 500 million light-years, occupying ~80% of cosmic volume.",
        keyIdea:
          "Voids act like gravitational lenses in reverse: their low density pushes matter outward and speeds up cosmic expansion.",
        explanation:
          "Because voids have far less matter than average, their gravity is too weak to resist dark energy. In fact, matter actively drains out of voids into the surrounding filaments. This makes voids expand faster than average space, acting like giant diverging lenses in gravitational lensing surveys and pristine laboratories for testing dark energy.",
        activityPrompt:
          "Test the density gauge: compare voids (<10% average density) with rich clusters (1,000x average density).",
      },
      astronomer: {
        lead: "Cosmic voids are negative matter density perturbations (δ < 0) evolving via non-linear shell-crossing and void evacuation.",
        keyIdea:
          "Void abundance, profiles, and the Alcock-Paczynski void test provide high-precision constraints on dark energy equation of state w(z).",
        explanation:
          "In linear perturbation theory, an underdense region expands faster than the background Hubble flow: v_pec(r) = (1/3) H_0 f(Ω_m) |δ_void| r. Matter flows outward, leading to a steep density wall at the void boundary. Voids are pristine probes of modified gravity (e.g., f(R) chameleon screening mechanisms), because their deep underdensities unscreen fifth forces that are suppressed in dense halos.",
        mathematics:
          "Linear void expansion velocity: v_pec = (1/3) H r Ω_m^(0.55) |δ̄_void(r)|. Integrated Sachs-Wolfe (ISW) effect in voids produces cold spots on the CMB.",
        activityPrompt:
          "Calculate the underdensity parameter δ across different cosmic void diameters.",
      },
    },
  },
  {
    id: "structure-formation-gravity",
    order: 7,
    title: "Structure Formation Through Gravity",
    subtitle: "How 13.8 billion years of gravity wove the cosmic web",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "How did the universe build this giant web? Gravity pulled the tiny ripples from the Big Bang into star cities!",
        keyIdea:
          "Gravity is like an invisible sculptor that spent billions of years pulling matter into giant spiderwebs.",
        explanation:
          "Right after the Big Bang, matter was spread out almost completely smooth. But some spots were just a tiny bit thicker than others (1 part in 100,000). Gravity pulled more and more matter into those thick spots, building the first stars, then small galaxies, then big groups, and finally the cosmic web we see today!",
        activityPrompt:
          "Drag the Cosmic Timeline Slider to watch smooth gas evolve into the intricate web over 13.8 billion years.",
      },
      explorer: {
        lead: "The cosmic web grew through hierarchical 'bottom-up' assembly: small structures merged to create larger ones.",
        keyIdea:
          "Cold Dark Matter (CDM) formed the invisible skeleton first, into which normal hydrogen and helium gas fell.",
        explanation:
          "Because dark matter does not interact with light, it began collapsing under gravity long before normal baryonic matter could. Dark matter formed invisible clumps (halos) and long filaments. When the universe cooled, normal gas fell into these gravitational valleys, igniting the first stars and galaxies. Over billions of years, galaxies merged into groups, and groups fell into massive clusters.",
        activityPrompt:
          "Compare the Redshift z = 1100 (smooth CMB) with Redshift z = 0 (today's cosmic web).",
      },
      astronomer: {
        lead: "Structure formation is governed by the Jeans instability in an expanding Friedmann-Lemaître-Robertson-Walker (FLRW) metric.",
        keyIdea:
          "Linear perturbation growth δ̈ + 2H δ̇ = 4π G ρ̄ δ transitions into non-linear hierarchical halo collapse.",
        explanation:
          "In the standard ΛCDM paradigm, primordial Gaussian perturbations P(k) ∝ k^(n_s) with spectral index n_s ≈ 0.965 collapse hierarchically. The Press-Schechter formalism and Sheth-Tormen ellipsoidal collapse models predict the halo mass function dn/dM. Supercomputer simulations like Millennium, IllustrisTNG, and Dark Sky confirm that gravitational instability alone naturally produces the filamentary topology observed in redshift surveys.",
        mathematics:
          "Jeans critical wavelength in expanding medium: λ_J = c_s √(π / G ρ̄). Growth factor during matter domination: D(a) ∝ a(t) ∝ t^(2/3). Non-linear turnaround occurs at δ_lin ≈ 1.06, virialization at δ_lin ≈ 1.686.",
        activityPrompt:
          "Examine the Jeans mass and linear growth factor curves across cosmic expansion history.",
      },
    },
  },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
}

export const MODULE_15_QUIZ: QuizQuestion[] = [
  {
    id: "q1_supercluster_bound",
    question:
      "Is our Laniakea Supercluster gravitationally bound (meaning gravity will eventually pull it into a single giant structure)?",
    options: [
      "Yes, gravity will collapse all 100,000 galaxies into one huge galaxy",
      "No, dark energy accelerates cosmic expansion faster than gravity can hold it together; its outer clusters will drift apart forever",
      "Yes, because dark matter creates an impenetrable wall around it",
      "No, because supermassive black holes will swallow all the galaxies first",
    ],
    correctIndex: 1,
    explanation:
      "Unlike galaxy clusters which are gravitationally bound (virialized), superclusters like Laniakea span over 500 million light-years. At these colossal scales, dark energy expansion overcomes gravitational deceleration, ensuring that its member clusters will eventually drift apart forever.",
    sourceRef: "Tully et al. (Nature, 2014) The Laniakea Supercluster of Galaxies",
  },
  {
    id: "q2_zwicky_dark_matter",
    question:
      "How did astronomer Fritz Zwicky in 1933 first discover evidence for Dark Matter in the Coma Cluster?",
    options: [
      "He saw a dark shadow passing in front of the cluster",
      "He measured radio waves from colliding black holes",
      "He applied the Virial Theorem and discovered galaxies were moving 10 times too fast for visible mass to hold them together",
      "He counted the stars using the Hubble Space Telescope",
    ],
    correctIndex: 2,
    explanation:
      "Fritz Zwicky measured the velocity dispersion of galaxies in the Coma Cluster. Using the Virial Theorem, he found the galaxies were orbiting so rapidly (~1,000 km/s) that the cluster should fly apart unless held by ~50 times more mass than visible in shining stars—coining the term 'dunkle Materie' (dark matter).",
    sourceRef: "Zwicky, F. (1933), Die Rotverschiebung von extragalaktischen Nebeln",
  },
  {
    id: "q3_cluster_mass_split",
    question:
      "In a typical rich galaxy cluster, what makes up the largest percentage of the total mass?",
    options: [
      "Visible stars and galaxies (~85%)",
      "Dark Matter (~85%)",
      "Supermassive black holes (~85%)",
      "Planets and asteroids (~85%)",
    ],
    correctIndex: 1,
    explanation:
      "Roughly 85% of a galaxy cluster's total mass is Cold Dark Matter. The remaining ~15% of baryonic matter is mostly hot intracluster gas (~13%), with shining stars and galaxies making up only ~2% of the cluster's total mass!",
    sourceRef: "Chandra X-ray Observatory / Astrophysical Journal Cluster Gas Surveys",
  },
  {
    id: "q4_local_group_merger",
    question:
      "What is currently happening between our Milky Way and the Andromeda Galaxy inside the Local Group?",
    options: [
      "They are flying away from each other due to the Hubble expansion",
      "They are gravitationally bound and approaching each other at ~110 km/s, destined to merge in ~4.5 billion years",
      "They are in static equilibrium and will remain at fixed distance forever",
      "Andromeda has already merged with our central black hole",
    ],
    correctIndex: 1,
    explanation:
      "Inside the gravitationally bound Local Group, local gravity overpowers the Hubble expansion. Andromeda and the Milky Way are falling toward one another at ~110 km/s and will merge into an elliptical galaxy ('Milkomeda') in approximately 4.5 billion years.",
    sourceRef: "van der Marel et al. (ApJ, 2012) The M31 Velocity Vector and Milky Way Collision",
  },
  {
    id: "q5_bootes_void",
    question: "Why is the Boötes Void often called 'The Great Nothing'?",
    options: [
      "It is a supermassive black hole with zero volume",
      "It contains anti-matter that destroys any entering spaceship",
      "It is a 330-million-light-year void containing only ~60 galaxies where thousands would normally be expected",
      "It is a region where time stands completely still",
    ],
    correctIndex: 2,
    explanation:
      "Spanning ~330 million light-years in diameter, the Boötes Void contains only ~60 identified galaxies in a volume of space that would typically host several thousand galaxies, making it one of the largest and emptiest known supervoids in the universe.",
    sourceRef: "Kirshner et al. (1981) A Million Cubic Megaparsec Void in Boötes, ApJL",
  },
  {
    id: "q6_missing_baryons",
    question: "Where was the universe's 'missing normal matter' (baryons) discovered hiding?",
    options: [
      "Inside millions of tiny dwarf planets",
      "In the Warm-Hot Intergalactic Medium (WHIM) lining cosmic filaments",
      "Trapped inside stellar-mass black hole horizons",
      "It leaked out into a parallel dimension",
    ],
    correctIndex: 1,
    explanation:
      "Cosmologists detected the missing baryonic matter as the Warm-Hot Intergalactic Medium (WHIM)—million-degree diffuse plasma lining the cosmic web's filaments, confirmed via Fast Radio Burst dispersion and X-ray absorption lines.",
    sourceRef: "Macquart et al. (Nature, 2020) A census of baryons using fast radio bursts",
  },
  {
    id: "q7_cosmic_web_origin",
    question: "What seeded the filaments, clusters, and voids of the cosmic web?",
    options: [
      "Giant cosmic explosions caused by early black holes",
      "Tiny quantum fluctuations in the early universe, amplified by 13.8 billion years of gravity",
      "Centrifugal force from the spinning universe",
      "Collisions between multiple parallel universes",
    ],
    correctIndex: 1,
    explanation:
      "Tiny quantum density fluctuations in the primordial universe (imprinted during cosmic inflation and visible in the Cosmic Microwave Background as 1-part-in-100,000 variations) were stretched by expansion and amplified over 13.8 billion years of gravitational collapse into the cosmic web.",
    sourceRef: "Planck Collaboration (2018) Cosmological Parameters, A&A",
  },
  {
    id: "q8_cluster_vs_supercluster",
    question:
      "What is the primary scientific difference between a galaxy cluster and a supercluster?",
    options: [
      "A cluster is made of stars, while a supercluster is made of dark energy",
      "A cluster is gravitationally bound and virialized, while a supercluster is not bound and will expand apart",
      "A cluster has only spiral galaxies, while a supercluster has only elliptical galaxies",
      "There is no difference; the terms are exact synonyms",
    ],
    correctIndex: 1,
    explanation:
      "A galaxy cluster is gravitationally bound and virialized—its galaxies orbit a shared potential well. A supercluster (like Laniakea) is a larger grouping whose members are streaming along shared flowlines, but whose scale is too vast for gravity to hold it together against cosmic dark energy acceleration.",
    sourceRef: "Peebles, P.J.E. (Principles of Physical Cosmology, Princeton Univ. Press)",
  },
];

export const MODULE_15_DISCOVERY_FACTS = [
  {
    title: "Zwicky's 1933 Dark Matter Discovery",
    fact: "Swiss-American astrophysicist Fritz Zwicky used the 100-inch Hooker telescope at Mount Wilson to measure galaxy speeds in the Coma Cluster. Finding them moving at ~1,000 km/s, he deduced that 90% of the cluster's mass must be unseen 'dark matter'.",
    tag: "Historical Astrophysics",
  },
  {
    title: "Laniakea: Our Immeasurable Heaven",
    fact: "In 2014, a team led by R. Brent Tully mapped 8,000 galaxies' motion through space, identifying our home supercluster Laniakea spanning 520 million light-years with 100,000 galaxies flowing toward the Great Attractor.",
    tag: "Cosmic Cartography",
  },
  {
    title: "The Incredible Emptiness of Voids",
    fact: "Cosmic voids like Boötes or the Eridanus Supervoid make up roughly 80% of the observable universe's total volume, but contain less than 10% of its galaxies.",
    tag: "Cosmic Voids",
  },
  {
    title: "13.8-Billion-Year Gravity Sculpting",
    fact: "Supercomputer simulations like IllustrisTNG and the Millennium Simulation used millions of CPU hours to track billions of dark matter particles from the Big Bang to today, reproducing the exact filamentary cosmic web observed by the Sloan Digital Sky Survey.",
    tag: "Cosmological Simulations",
  },
  {
    title: "Virgo-Centric Infall",
    fact: "The immense gravitational pull of the Virgo Cluster (1.2 quadrillion solar masses) is pulling our entire Local Group inward at approximately 200 to 400 kilometers per second.",
    tag: "Local Universe Dynamics",
  },
];
