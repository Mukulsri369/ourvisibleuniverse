import type { ScientificSource } from "../types";

export interface BlackHolePreset {
  id: string;
  name: string;
  category: "stellar" | "intermediate" | "supermassive" | "ultramassive";
  massSolar: number;
  massLabel: string;
  distanceLy: string;
  location: string;
  hasAccretionDisk: boolean;
  diskColor: string;
  notes: string;
}

export const BLACK_HOLE_PRESETS: BlackHolePreset[] = [
  {
    id: "stellar_generic",
    name: "Stellar-Mass Black Hole",
    category: "stellar",
    massSolar: 10,
    massLabel: "10 M☉",
    distanceLy: "Typical (hypothetical local)",
    location: "Milky Way Stellar Disk",
    hasAccretionDisk: false,
    diskColor: "#f59e0b",
    notes:
      "Quiescent isolated black hole. Invisible in darkness except for subtle gravitational lensing of background stars.",
  },
  {
    id: "cygnus_x1",
    name: "Cygnus X-1",
    category: "stellar",
    massSolar: 21.2,
    massLabel: "21.2 M☉",
    distanceLy: "7,200 Light-Years",
    location: "Constellation Cygnus",
    hasAccretionDisk: true,
    diskColor: "#06b6d4",
    notes:
      "First confirmed stellar-mass black hole. Feeds from blue supergiant companion star HDE 226868 with X-ray emitting accretion disk.",
  },
  {
    id: "intermediate_hlx1",
    name: "Intermediate-Mass (HLX-1)",
    category: "intermediate",
    massSolar: 20000,
    massLabel: "20,000 M☉",
    distanceLy: "290 Million Light-Years",
    location: "Galaxy ESO 243-49",
    hasAccretionDisk: true,
    diskColor: "#a855f7",
    notes:
      "Rare intermediate-mass black hole bridge between stellar and galactic monsters, discovered via hyper-luminous X-ray flares.",
  },
  {
    id: "sagittarius_a",
    name: "Sagittarius A* (Milky Way)",
    category: "supermassive",
    massSolar: 4297000,
    massLabel: "4.3 Million M☉",
    distanceLy: "26,673 Light-Years",
    location: "Center of Milky Way",
    hasAccretionDisk: true,
    diskColor: "#f97316",
    notes:
      "Imaged by Event Horizon Telescope in 2022. Stars like S2 orbit it at 2.5% of light speed.",
  },
  {
    id: "m87_star",
    name: "M87* (Virgo A)",
    category: "ultramassive",
    massSolar: 6500000000,
    massLabel: "6.5 Billion M☉",
    distanceLy: "53.5 Million Light-Years",
    location: "Giant Elliptical Galaxy Messier 87",
    hasAccretionDisk: true,
    diskColor: "#ea580c",
    notes:
      "First black hole ever photographed (EHT 2019). Horizon is 128 AU wide—larger than Pluto's entire orbit—firing a 5,000-ly relativistic plasma jet.",
  },
];

export interface CompactObjectComparison {
  id: string;
  name: string;
  type: "White Dwarf" | "Neutron Star" | "Stellar Black Hole" | "Supermassive Black Hole";
  typicalMass: string;
  massSolarRange: [number, number];
  typicalRadius: string;
  densityKgM3: string;
  supportMechanism: string;
  surfaceEscapeVelocity: string;
  magneticFieldTesla: string;
  realWorldExample: string;
  analogy: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
}

export const COMPACT_OBJECTS: CompactObjectComparison[] = [
  {
    id: "white_dwarf",
    name: "White Dwarf",
    type: "White Dwarf",
    typicalMass: "0.6 – 1.2 M☉",
    massSolarRange: [0.6, 1.44],
    typicalRadius: "~6,000 km (Earth-sized)",
    densityKgM3: "10⁹ kg/m³ (1 ton per sugar cube)",
    supportMechanism: "Electron Degeneracy Pressure (Pauli exclusion principle)",
    surfaceEscapeVelocity: "~5,000 km/s (~1.7% c)",
    magneticFieldTesla: "10² – 10⁵ Tesla",
    realWorldExample: "Sirius B (companion to the brightest night star)",
    analogy: {
      junior:
        "A star crushed down until it is the size of planet Earth, glowing white-hot like an ember in a fireplace.",
      explorer:
        "The glowing carbon-oxygen core left behind when a Sun-like star sheds its outer gas layers into a planetary nebula.",
      astronomer:
        "Relativistic degenerate electron gas governed by Fermi-Dirac statistics, bound by the Chandrasekhar limiting mass of 1.44 M☉.",
    },
  },
  {
    id: "neutron_star",
    name: "Neutron Star (Pulsar)",
    type: "Neutron Star",
    typicalMass: "1.4 – 2.1 M☉",
    massSolarRange: [1.4, 2.17],
    typicalRadius: "~10 – 12 km (City-sized)",
    densityKgM3: "10¹⁷ – 10¹⁸ kg/m³ (All humanity in a thimble)",
    supportMechanism: "Neutron Degeneracy Pressure & Strong Force Repulsion",
    surfaceEscapeVelocity: "~150,000 – 200,000 km/s (~50% – 67% c)",
    magneticFieldTesla: "10⁸ – 10¹¹ Tesla (Magnetars up to 10¹² T)",
    realWorldExample: "Crab Nebula Pulsar (PSR B0531+21, spins 30 times/sec)",
    analogy: {
      junior:
        "A star squished into a ball so small it could fit inside your city, spinning like a runaway lighthouse!",
      explorer:
        "Formed in a supernova explosion when electrons and protons merge into pure neutrons, creating the densest solid object in the universe.",
      astronomer:
        "Relativistic nucleon matter bounded by the Tolman-Oppenheimer-Volkoff (TOV) limit (~2.17 M☉), with crustal superfluid neutron pairing.",
    },
  },
  {
    id: "stellar_black_hole",
    name: "Stellar Black Hole",
    type: "Stellar Black Hole",
    typicalMass: "5 – 50 M☉",
    massSolarRange: [5, 50],
    typicalRadius: "r_s ≈ 15 – 150 km",
    densityKgM3: "Infinite at central singularity (effective horizon density ~10¹⁶ kg/m³)",
    supportMechanism: "None known — complete gravitational collapse to singularity",
    surfaceEscapeVelocity: "c (Speed of light at Event Horizon)",
    magneticFieldTesla: "Induced by plasma accretion disk (up to 10⁸ T)",
    realWorldExample: "Cygnus X-1 (21.2 M☉) & GW150914 binary merger",
    analogy: {
      junior:
        "A place where so much star-stuff fell into one point that not even a beam of flashlight light can escape back out.",
      explorer:
        "When a massive star over 20 times the Sun's mass dies, gravity overpowers all atomic forces, punching a permanent one-way door into spacetime.",
      astronomer:
        "Kerr/Schwarzschild exact solution to Einstein field equations: spacetime manifold with timelike killing vector becoming spacelike across r = r_s.",
    },
  },
  {
    id: "supermassive_black_hole",
    name: "Supermassive Black Hole",
    type: "Supermassive Black Hole",
    typicalMass: "10⁶ – 10¹⁰ M☉",
    massSolarRange: [1000000, 10000000000],
    typicalRadius: "r_s ≈ 3 Million – 30 Billion km (AU to solar system scale)",
    densityKgM3: "Horizon average density can be lower than water (~1,000 kg/m³) due to r_s ∝ M!",
    supportMechanism: "None — central singularity",
    surfaceEscapeVelocity: "c at Event Horizon",
    magneticFieldTesla:
      "10⁻² – 10² Tesla (colossal magnetic flux tubes launching relativistic jets)",
    realWorldExample: "M87* (6.5 Billion M☉) & Sagittarius A* (4.3 Million M☉)",
    analogy: {
      junior:
        "A cosmic giant at the very center of a galaxy that holds millions of times the weight of our Sun, but stays hidden in the dark.",
      explorer:
        "Supermassive anchors at galaxy centers that grow by devouring gas and merging with other black holes over billions of years.",
      astronomer:
        "Galactic scale gravitational wells governing M-sigma galaxy bulge correlations, active galactic nuclei (AGN), and relativistic Blandford-Znajek jet extraction.",
    },
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

export const MODULE_14_SUBLESSONS: SubLesson[] = [
  {
    id: "massive-collapse",
    order: 1,
    title: "What Happens When Massive Stars Collapse?",
    subtitle: "The violent battle between gravity and atomic pressure",
    readTimeMinutes: 3,
    content: {
      junior: {
        lead: "Stars spend their lives pushing outward with heat, holding back the heavy squeeze of gravity.",
        keyIdea: "When fuel runs out, gravity wins instantly and crushes the star's center!",
        explanation:
          "Think of a star like a giant hot air balloon. As long as the burner is on, heat pushes the balloon open against the weight of the air. But when fuel runs out, the balloon deflates. In a massive star, this deflation happens in less than a single second, triggering a blast called a supernova!",
        activityPrompt:
          "Compare how different star cores balance gravity using the interactive density chart below.",
      },
      explorer: {
        lead: "For millions of years, hydrostatic equilibrium balances nuclear fusion against gravitational self-attraction.",
        keyIdea:
          "Once iron forms in the core, fusion stops producing energy. Core collapse becomes inevitable.",
        explanation:
          "Fusion can only produce energy up to iron (Fe-56). Fusing iron consumes energy instead of releasing it. When a star over 8 times the Sun's mass builds an iron core exceeding 1.44 solar masses, electron degeneracy pressure fails. The iron core collapses at 70,000 km/s—about a quarter the speed of light—rebounding as a Type II core-collapse supernova.",
        activityPrompt:
          "Use the object comparison tab to see why stars below 8 M☉ end as white dwarfs while heavier stars forge neutron stars and black holes.",
      },
      astronomer: {
        lead: "Core collapse represents catastrophic dynamical instability when adiabatic index Γ < 4/3.",
        keyIdea:
          "Photodisintegration and electron capture trigger runaway collapse of the degenerate iron-nickel core.",
        explanation:
          "When core temperature exceeds ~5×10⁹ K, energetic gamma photons induce photodisintegration: ⁵⁶Fe + γ → 13 ⁴He + 4n. Simultaneously, electron capture p + e⁻ → n + νₑ removes degenerate electron Fermi pressure. The core collapses until nuclear saturation density (~2.8×10¹⁴ g/cm³) is reached, where short-range nucleon-nucleon repulsion halts collapse, launching an outward shock wave aided by neutrino heating.",
        mathematics:
          "Relativistic stability criterion: Γ = (d ln P / d ln ρ) > 4/3 for stable equilibrium. Relativistic degenerate electrons have P ∝ ρ^(4/3), placing the core at neutral equilibrium where any energy loss triggers collapse.",
        activityPrompt:
          "Examine the Chandrasekhar limit and TOV threshold in the laboratory panel.",
      },
    },
  },
  {
    id: "white-dwarfs-vs-neutron-stars",
    order: 2,
    title: "White Dwarfs Versus Neutron Stars",
    subtitle: "Comparing city-sized atomic cores with Earth-sized glowing embers",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "Both are leftover stellar cores, but one is squished millions of times harder than the other!",
        keyIdea: "White dwarfs are Earth-sized; neutron stars are squished down to city size!",
        explanation:
          "Imagine taking our entire Earth and packing the mass of the Sun inside it—that is a white dwarf. Now imagine packing that same huge star into a ball no bigger than your city! In a neutron star, all the atoms got squeezed so tightly that electrons and protons got mashed into pure neutrons.",
        activityPrompt:
          "Click the White Dwarf vs Neutron Star toggle to see their sizes compared side-by-side.",
      },
      explorer: {
        lead: "The difference between a white dwarf and a neutron star is which subatomic particle holds back gravity.",
        keyIdea:
          "White dwarfs are held up by electron degeneracy (Chandrasekhar limit 1.44 M☉); neutron stars are supported by neutron degeneracy.",
        explanation:
          "Quantum mechanics forbids two identical fermions from occupying the same quantum state (Pauli Exclusion Principle). In a white dwarf, packed electrons resist compression. But if the core exceeds 1.44 M☉, gravity crushes electrons directly into atomic nuclei. Protons and electrons merge into neutrons, shrinking the object from 6,000 km to a 10 km radius sphere where density equals that of an atomic nucleus.",
        activityPrompt:
          "Notice that a single tablespoon of neutron star material would weigh over a billion tons on Earth!",
      },
      astronomer: {
        lead: "Compact stellar remnants represent zero-temperature degenerate Fermi gases governed by relativistic quantum mechanics.",
        keyIdea:
          "Equation of state transitions from ultra-relativistic degenerate electrons (P ∝ n_e^(4/3)) to degenerate neutron liquid with repulsive nuclear forces.",
        explanation:
          "Subrahmanyan Chandrasekhar derived the maximum stable mass of an electron-degenerate object: M_Ch ≈ 1.44 M☉. Beyond M_Ch, collapse proceeds to neutron drip and nuclear densities (ρ ~ 4×10¹⁴ g/cm³). The Tolman-Oppenheimer-Volkoff (TOV) equation of relativistic hydrostatic equilibrium sets the maximum neutron star mass between ~2.0 and 2.3 M☉, depending on the uncertain nuclear equation of state (EOS) at supranuclear densities.",
        mathematics:
          "TOV equation: dP/dr = - (G M(r) ρ / r²) [1 + P/(ρ c²)] [1 + 4π r³ P/(M(r) c²)] [1 - 2GM(r)/(r c²)]⁻¹. Notice the three general-relativistic correction terms that make gravity strictly stronger than Newtonian theory.",
        activityPrompt:
          "Inspect the surface gravity and escape velocity differences between White Dwarfs and Neutron Stars.",
      },
    },
  },
  {
    id: "what-is-a-black-hole",
    order: 3,
    title: "What Is a Black Hole?",
    subtitle: "When gravity overpowers every known force in the cosmos",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "A black hole is not an empty hole in space—it is a tremendous amount of matter squeezed into no space at all!",
        keyIdea:
          "Gravity becomes so intense that even the fastest thing in the universe—light—cannot escape.",
        explanation:
          "If you toss a ball upward, it falls back down. If you launch a rocket fast enough (11 km/s), it escapes Earth entirely. In a black hole, you would have to travel faster than 300,000 km per second (faster than light) to get away. Since nothing can travel faster than light, nothing can ever climb back out!",
        activityPrompt:
          "Move the Black Hole Mass slider and observe how the black circle grows larger with more mass.",
      },
      explorer: {
        lead: "A black hole forms when matter collapses past its Schwarzschild radius, creating an event horizon.",
        keyIdea:
          "Myth Debunked: Black holes are not cosmic vacuums! They do not pull harder than normal objects of the same mass.",
        explanation:
          "If our Sun were suddenly replaced by a 1-solar-mass black hole, Earth would NOT get sucked in! Earth would continue orbiting at 1 AU every 365 days exactly as it does now, because the gravitational mass at 150 million kilometers is identical. Only if you venture extremely close (inside a few kilometers) does the extreme concentrated curvature take over.",
        activityPrompt:
          "Toggle the 'Cosmic Vacuum Cleaner' myth panel to verify Newtonian gravity at orbital distances.",
      },
      astronomer: {
        lead: "In General Relativity, a black hole is a region of spacetime where causal geodesics cannot escape to asymptotic null infinity.",
        keyIdea:
          "The event horizon marks a null hypersurface where spacetime itself falls inward faster than c.",
        explanation:
          "According to Birkhoff's theorem, any spherically symmetric gravitational field in vacuum is static and described by the Schwarzschild metric, regardless of the nature of the central source. Outside r = r_s, the external geometry is identical to that of any spherical star of mass M. Only when matter collapses within r < r_s does the coordinate r become timelike (dr/dt must be negative), making convergence toward the central curvature singularity inevitable in finite proper time.",
        mathematics:
          "Schwarzschild metric in natural coordinates: ds² = -(1 - r_s/r) c² dt² + (1 - r_s/r)⁻¹ dr² + r² (dθ² + sin²θ dϕ²). As r → r_s, g_tt → 0 and g_rr → ∞ (coordinate singularity removable via Eddington-Finkelstein or Kruskal-Szekeres coordinates).",
        activityPrompt:
          "Examine the timelike-to-spacelike coordinate flip inside the event horizon.",
      },
    },
  },
  {
    id: "event-horizons",
    order: 4,
    title: "Event Horizons & Photon Spheres",
    subtitle: "The point of no return and the ring where light orbits in circles",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "The Event Horizon is the invisible boundary around a black hole—once you cross it, there is no turning back.",
        keyIdea:
          "It is not a solid wall or a physical shell; it is simply a boundary line in space.",
        explanation:
          "Think of canoeing down a river that gets faster and faster. If the water flows faster than you can paddle, you cannot paddle backward. The event horizon is where space itself flows inward at the speed of light!",
        activityPrompt:
          "Look at the circular glowing ring in the 3D viewer—that is light trapped in an orbit around the black hole!",
      },
      explorer: {
        lead: "The size of an event horizon depends purely on mass: roughly 3 kilometers per solar mass.",
        keyIdea:
          "Just outside the horizon at 1.5 times the Schwarzschild radius lies the Photon Sphere, where light orbits in circles.",
        explanation:
          "The Schwarzschild radius formula is r_s = 2GM / c². For the Earth to become a black hole, it would have to be squeezed to the size of a marble (9 millimeters). For the Sun, r_s is 2.95 km. At 1.5 r_s, gravity bends passing light rays into closed circular orbits. If an astronaut stood there with a flashlight, their beam could orbit the black hole and illuminate the back of their own helmet!",
        activityPrompt:
          "Use the radius scale gauge in the 3D lab to inspect the Event Horizon (1.0 r_s) and Photon Sphere (1.5 r_s).",
      },
      astronomer: {
        lead: "The apparent shadow of a black hole seen by distant observers is larger than the event horizon due to strong gravitational lensing.",
        keyIdea:
          "For a Schwarzschild black hole, the photon sphere sits at r_ph = 3GM/c² = 1.5 r_s, casting an apparent shadow of radius b_crit = √27 GM/c² ≈ 2.6 r_s.",
        explanation:
          "Any photon with impact parameter b < b_crit = 3√3 (GM/c²) will cross the photon sphere and be captured across the horizon. Photons with b ≈ b_crit execute multiple unstable orbits before escaping to infinity, forming the ultrathin bright photon ring observed by the Event Horizon Telescope (EHT). Inside the horizon, all future-directed light cones point toward r = 0.",
        mathematics:
          "Photon orbit equation from null geodesic Lagrangian: (dr/dλ)² + V_eff(r) = 0, where V_eff(r) = (L²/r²) (1 - 2GM/rc²). Setting dV/dr = 0 yields r_ph = 3GM/c².",
        activityPrompt:
          "Toggle the Gravitational Lensing overlay to see the critical impact parameter shadow boundary.",
      },
    },
  },
  {
    id: "accretion-disks",
    order: 5,
    title: "Accretion Disks & Relativistic Doppler Beaming",
    subtitle: "How matter heating up to millions of degrees makes black holes shine",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "Black holes are dark, but the gas swirling into them shines brighter than millions of normal stars!",
        keyIdea: "Friction makes the swirling gas red, orange, and white-hot before it falls in.",
        explanation:
          "When water drains down a bathtub sink, it spins around in a fast swirl. Gas falling toward a black hole does the same thing! Because it moves at nearly the speed of light, friction rubs the gas particles together until they heat up to millions of degrees and shine brightly.",
        activityPrompt:
          "Notice in the 3D simulation that the side of the disk rotating toward you looks brighter and bluer!",
      },
      explorer: {
        lead: "Accretion disks are the most efficient energy converters in the universe, converting up to 40% of rest mass into radiation.",
        keyIdea:
          "Relativistic Doppler beaming makes the side of the disk spinning toward us appear brighter, while the receding side is dimmed.",
        explanation:
          "Nuclear fusion inside stars converts less than 1% of matter into energy (E = mc²). But gas falling into a rotating black hole converts up to 42% of its mass into energetic X-rays and ultraviolet light. Furthermore, special relativity dictates that light emitted by matter moving toward the observer at relativistic speeds is beamed forward and blueshifted, explaining why the EHT images of M87* and Sgr A* are distinctly brighter on one crescent side.",
        activityPrompt:
          "Toggle the Accretion Disk on and off to understand that black holes with no gas around them are completely dark.",
      },
      astronomer: {
        lead: "Shakura-Sunyaev thin disk models describe geometrically thin, optically thick accretion flows governed by magnetorotational instability (MRI).",
        keyIdea:
          "The innermost edge of the disk terminates at the Innermost Stable Circular Orbit (ISCO): r_isco = 6 GM/c² = 3 r_s for a non-rotating Schwarzschild metric.",
        explanation:
          "Inside r_isco, stable circular orbits no longer exist; matter plunges dynamically into the horizon without radiating significant additional energy. Viscous dissipation within the disk produces an effective temperature profile T(r) ∝ (M · Ṁ / r³)¹/⁴. For spinning Kerr black holes with dimensionless spin parameter a* → 1, r_isco decreases from 6 GM/c² down to 1.0 GM/c² (retrograde orbits extend to 9 GM/c²), boosting radiative efficiency η from 5.7% up to 42.3%.",
        mathematics:
          "Doppler boosting factor: I_obs(ν_obs) = δ³ I_emit(ν_emit), where Doppler factor δ = 1 / [γ (1 - β cos θ)]. The fourth power of frequency shift dramatically amplifies approaching plasma.",
        activityPrompt: "Examine Doppler beaming and ISCO cutoff in the 3D Black Hole Laboratory.",
      },
    },
  },
  {
    id: "pulsars-and-magnetars",
    order: 6,
    title: "Pulsars & Magnetars",
    subtitle: "Rapidly spinning cosmic lighthouses and magnetic monsters",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "Pulsars are city-sized neutron stars spinning hundreds of times every single second!",
        keyIdea:
          "Like a giant lighthouse, they shoot beams of radio light from their magnetic poles.",
        explanation:
          "When an ice skater pulls their arms in tight, they spin much faster. When a giant star collapses into a tiny 10-mile ball, it spins at breathtaking speed! If its beam sweeps past Earth, radio telescopes hear a steady rhythmic pulse: beep... beep... beep!",
        activityPrompt:
          "Enter the Pulsar Simulator tab to see the magnetic lighthouse beam sweep across your screen.",
      },
      explorer: {
        lead: "Discovered by Jocelyn Bell Burnell in 1967, pulsars are spinning neutron stars with intense magnetic fields.",
        keyIdea:
          "Magnetars possess magnetic fields over a trillion times stronger than Earth's, capable of tearing atoms into needles.",
        explanation:
          "The magnetic axis of a pulsar is tilted relative to its rotation axis. Charged particles accelerate along magnetic field lines, shooting synchrotron radiation out of the magnetic poles. Because the star spins, these beams sweep through space like a lighthouse. Magnetars are an extreme subtype: their magnetic fields reach 10¹¹ Tesla. A crust rupture ('starquake') on a magnetar 50,000 light-years away (SGR 1806-20 in 2004) briefly blinded space satellite detectors across Earth!",
        activityPrompt:
          "Adjust the magnetic inclination angle to see when the beam strikes the observer's line of sight.",
      },
      astronomer: {
        lead: "Pulsar emission is coherent curvature radiation from electron-positron cascades in magnetospheric polar gap regions.",
        keyIdea:
          "Rotational kinetic energy loss Ė = I Ω Ω̇ powers the pulsar wind nebula and multi-wavelength pulsed emission.",
        explanation:
          "As the dipole field rotates with angular velocity Ω, an unipolar induction electric field E · B ≠ 0 extracts charged particles from the stellar crust. Pair production cascades (γ + B → e⁺ + e⁻) populate the magnetosphere up to the Goldreich-Julian charge density ρ_GJ ≈ - 2 (Ω · B) / c. Pulsar timing arrays monitor millisecond pulsars with nanosecond precision, turning networks of pulsars into a galaxy-sized gravitational-wave detector (NANOGrav).",
        mathematics:
          "Dipole spin-down formula: Ė = (2 / 3c³) |m̈|² = (8π⁴ / 3 c³) B_p² R⁶ / P⁴, where characteristic age τ = P / (2 Ṗ) and magnetic field B_p ≈ 3.2×10¹⁹ (P Ṗ)¹/² Gauss.",
        activityPrompt:
          "Check the pulse timing graph and auditory beep frequency in the Pulsar timing lab.",
      },
    },
  },
  {
    id: "supermassive-black-holes",
    order: 7,
    title: "Supermassive Black Holes",
    subtitle: "Millions to billions of solar masses anchoring the centers of galaxies",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "At the exact center of almost every big galaxy sits a colossal supermassive black hole.",
        keyIdea:
          "Our Milky Way has one named Sagittarius A*, holding the mass of over 4 million Suns!",
        explanation:
          "Astronomers spent 30 years tracking real stars orbiting around an invisible point in the center of our galaxy. The stars whipped around at crazy speeds, proving that something weighing 4 million Suns was packed into a tiny space. That earned the 2020 Nobel Prize in Physics!",
        activityPrompt:
          "Switch to the Sagittarius A* and M87* presets in the 3D viewer to see how their sizes compare.",
      },
      explorer: {
        lead: "Andrea Ghez and Reinhard Genzel tracked the S-stars around Sagittarius A*, confirming Einstein's predictions.",
        keyIdea:
          "In 2019, the Event Horizon Telescope created the first direct image of black hole shadow in galaxy M87*.",
        explanation:
          "Star S2 completes an elliptical orbit around Sagittarius A* every 16 years, reaching 2.5% of the speed of light at periastron. Its orbit demonstrates Schwarzschild precession (orbiting like a rosette petal), exactly matching General Relativity. In M87*, the black hole holds 6.5 billion solar masses. Its event horizon spans 38 billion kilometers across—larger than our entire solar system out to the Kuiper Belt!",
        activityPrompt:
          "Compare M87*'s 5,000-light-year relativistic jet with the scale of our Milky Way.",
      },
      astronomer: {
        lead: "Co-evolution of supermassive black holes (SMBHs) and host galaxies is quantified by the Magorrian relation and M-σ relation.",
        keyIdea:
          "Feedback from active galactic nuclei (AGN) regulates star formation throughout the entire galaxy host bulge.",
        explanation:
          "The stellar velocity dispersion σ of a galaxy bulge correlates tightly with black hole mass: M_BH ∝ σ^(4.4). This proves black hole growth and galaxy evolution are coupled via momentum-driven AGN feedback. Radio-loud AGN like M87 launch collimated relativistic plasma jets through the Blandford-Znajek mechanism, where frame-dragging in the Kerr ergosphere extracts rotational energy via magnetic field lines threading the horizon.",
        mathematics:
          "Eddington Luminosity limit: L_Edd = (4π G M m_p c) / σ_T ≈ 1.26×10³⁸ (M / M☉) erg/s. Accretion exceeding L_Edd is blown away by radiation pressure.",
        activityPrompt: "Inspect the Eddington accretion limits and relativistic jet collimation.",
      },
    },
  },
  {
    id: "gravitational-waves",
    order: 8,
    title: "Gravitational Waves",
    subtitle: "Ripples in the fabric of spacetime from colliding black holes",
    readTimeMinutes: 4,
    content: {
      junior: {
        lead: "When black holes crash into each other, they make ripples in space itself, like stones dropped in a calm pond!",
        keyIdea:
          "These ripples travel across the universe at the speed of light and can be detected on Earth.",
        explanation:
          "Imagine space is like a giant trampoline. If two bowling balls roll around each other faster and faster, they shake the trampoline fabric. In 2015, giant laser detectors called LIGO felt spacetime stretch and squeeze by less than the width of a single proton when two black holes merged 1.3 billion light-years away!",
        activityPrompt:
          "Open the Gravitational Wave tab to play the binary inspiral and watch the chirp waveform ramp up!",
      },
      explorer: {
        lead: "Predicted by Albert Einstein in 1916, gravitational waves were directly observed for the first time on September 14, 2015 (GW150914).",
        keyIdea:
          "As two black holes orbit closer, they radiate energy as gravitational waves, speeding up into a high-frequency 'chirp'.",
        explanation:
          "In GW150914, two black holes weighing 36 and 29 solar masses spiraled together and merged into a single 62-solar-mass black hole. Notice that 36 + 29 = 65, but the final mass was only 62! The missing 3 solar masses were converted in a fraction of a second entirely into pure gravitational-wave energy. At peak merger, the power output was greater than all the stars in the observable universe combined!",
        activityPrompt:
          "Watch the strain wave h(t) accelerate into a crescendo during the final milliseconds of inspiral.",
      },
      astronomer: {
        lead: "Gravitational radiation is transverse-traceless quadrupole metric perturbation h_ij propagating at c.",
        keyIdea:
          "Laser interferometers (LIGO, Virgo, KAGRA) measure differential strain ΔL / L ≈ h ~ 10⁻²¹ across 4-km Fabry-Pérot arms.",
        explanation:
          "In the quadrupole approximation, radiated power is P_GW = (G / 5 c⁵) ⟨...Q_ij ...Q^ij⟩. As orbit decays via gravitational radiation, orbital frequency increases according to df/dt = (96 / 5) π^(8/3) (G M_c / c³)^(5/3) f^(11/3), where M_c = (m₁ m₂)^(3/5) / (m₁ + m₂)^(1/5) is the chirp mass. This unique frequency-chirp rate enables direct measurement of system masses independent of distance, making binary mergers standard sirens for cosmic expansion.",
        mathematics:
          "Chirp mass relation: M_c = [ (5 / 96 π^(8/3)) f^(-11/3) (df/dt) ]^(3/5). Strain amplitude: h ~ (4 G M_c / c² D_L) (π G M_c f / c³)^(2/3).",
        activityPrompt:
          "Simulate compact binary chirp frequencies across varying companion masses.",
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

export const MODULE_14_QUIZ: QuizQuestion[] = [
  {
    id: "q1_vacuum_myth",
    question:
      "If our Sun were suddenly replaced by a 1-solar-mass black hole, what would happen to Earth's orbit?",
    options: [
      "Earth would be sucked into the black hole within hours",
      "Earth would continue its normal 365-day orbit at 1 AU unchanged",
      "Earth would be flung out into deep interstellar space",
      "Earth would instantly spiral into the photon sphere",
    ],
    correctIndex: 1,
    explanation:
      "Because the mass of the black hole (1 M☉) is identical to the mass of the Sun, the gravitational pull at 1 AU (150 million km) remains exactly the same under Newton's law and Birkhoff's theorem. Earth would freeze in darkness, but its orbit would not change!",
    sourceRef: "Birkhoff's Theorem & Newtonian Gravitation (Carroll, Spacetime and Geometry)",
  },
  {
    id: "q2_schwarzschild",
    question: "Roughly what is the Schwarzschild radius of a typical 10-solar-mass black hole?",
    options: [
      "About 300,000 kilometers",
      "About 30 kilometers",
      "About 3 meters",
      "About 3,000 kilometers",
    ],
    correctIndex: 1,
    explanation:
      "The Schwarzschild radius formula is r_s = 2GM/c² ≈ 2.95 km per solar mass. For 10 M☉, r_s ≈ 29.5 km (roughly 30 km)—about the width of a metropolitan city!",
    sourceRef: "Schwarzschild Metric Exact Solution (1916)",
  },
  {
    id: "q3_photon_sphere",
    question:
      "At what distance from a non-rotating black hole can light travel in an unstable circular orbit?",
    options: [
      "At 0.5 times the Schwarzschild radius (inside the horizon)",
      "At 1.0 times the Schwarzschild radius (on the event horizon)",
      "At 1.5 times the Schwarzschild radius (r = 3GM/c²)",
      "At 3.0 times the Schwarzschild radius (the ISCO)",
    ],
    correctIndex: 2,
    explanation:
      "For a Schwarzschild black hole, the photon sphere sits at r_ph = 1.5 r_s (or 3GM/c²). Photons entering this radius on tangent trajectories execute circular orbits around the hole before either falling in or escaping.",
    sourceRef: "General Relativity Null Geodesics (Misner, Thorne & Wheeler, Gravitation)",
  },
  {
    id: "q4_white_dwarf_limit",
    question:
      "What is the maximum mass a white dwarf can have before collapsing into a neutron star or black hole?",
    options: [
      "0.5 Solar Masses",
      "1.44 Solar Masses (The Chandrasekhar Limit)",
      "2.17 Solar Masses (The TOV Limit)",
      "3.0 Solar Masses",
    ],
    correctIndex: 1,
    explanation:
      "Subrahmanyan Chandrasekhar calculated in 1930 that electron degeneracy pressure cannot support a cold stellar remnant exceeding ~1.44 solar masses. Cores beyond this threshold collapse into neutron stars.",
    sourceRef: "Chandrasekhar, S. (1931), The Maximum Mass of Ideal White Dwarfs",
  },
  {
    id: "q5_pulsar_lighthouse",
    question: "Why do pulsars appear to 'pulse' regularly when observed by radio telescopes?",
    options: [
      "The star expands and contracts like a beating heart",
      "Its magnetic poles shoot beams that sweep across our line of sight as it rotates",
      "It periodically swallows companion asteroids",
      "The nuclear fusion inside flashes on and off",
    ],
    correctIndex: 1,
    explanation:
      "Pulsars do not expand or pulse physically; they rotate rapidly with their magnetic dipole axis misaligned with their rotation axis. Like a lighthouse beacon, their twin radiation beams sweep past Earth once per rotation.",
    sourceRef:
      "Bell Burnell, J. & Hewish, A. (1968), Observation of a Rapidly Pulsating Radio Source",
  },
  {
    id: "q6_doppler_beaming",
    question:
      "In the Event Horizon Telescope image of black hole M87*, why is one side of the glowing ring brighter than the other?",
    options: [
      "One side has more stars behind it",
      "The black hole has an uneven gravitational pull",
      "Relativistic Doppler beaming boosts light from plasma moving toward the observer",
      "The black hole is partially shadowed by the moon",
    ],
    correctIndex: 2,
    explanation:
      "Plasma in the accretion disk orbits at near-light speeds. Special relativity dictates that radiation emitted by matter moving toward the observer is focused forward and boosted in apparent brightness (Doppler beaming).",
    sourceRef:
      "Event Horizon Telescope Collaboration (2019), First M87 Event Horizon Results, ApJL",
  },
  {
    id: "q7_gravitational_waves_speed",
    question: "At what speed do gravitational waves travel through the vacuum of space?",
    options: [
      "At infinite instantaneous speed",
      "At the speed of light (c ≈ 300,000 km/s)",
      "At the speed of sound in dark matter",
      "Slower than light, roughly 10,000 km/s",
    ],
    correctIndex: 1,
    explanation:
      "Einstein's General Relativity predicts that gravitational waves propagate through spacetime at exactly the speed of light (c). This was experimentally verified in 2017 when GW170817 and its gamma-ray burst arrived within 1.7 seconds of each other after traveling 130 million light-years!",
    sourceRef:
      "LIGO Scientific Collaboration & Virgo Collaboration (2017), GW170817 Multi-messenger Observation",
  },
  {
    id: "q8_isolated_black_hole",
    question: "Do all black holes in space have bright, glowing accretion disks?",
    options: [
      "Yes, every black hole is always surrounded by a bright fiery disk",
      "No, only black holes actively feeding on nearby gas or companion stars have disks; isolated black holes are dark",
      "No, black holes only glow during full moons",
      "Yes, the Hawking radiation creates a thick visible disk",
    ],
    correctIndex: 1,
    explanation:
      "An accretion disk requires a fuel supply, such as gas drawn from a close binary companion star or a dense galactic cloud. An isolated stellar-mass black hole drifting in deep space has no fuel and is completely dark, detectable only by its gravitational lensing of background stars.",
    sourceRef: "Chandra X-ray Observatory Black Hole Accretion Diagnostics (NASA SAO)",
  },
];

export const MODULE_14_DISCOVERY_FACTS = [
  {
    title: "The Sound of Colliding Spacetime",
    fact: "In 2015, the LIGO detector recorded GW150914 as a rising audio tone—a chirp spanning 35 Hz to 250 Hz in just 0.2 seconds. During the peak merger, the two black holes radiated more power than all the stars in the visible universe combined.",
    tag: "LIGO / Gravitational Waves",
  },
  {
    title: "Earth as a Marble",
    fact: "To compress planet Earth into a black hole, you would have to squeeze its entire 6 sextillion metric tons into a sphere just 18 millimeters wide—smaller than a US nickel or marble!",
    tag: "Schwarzschild Scaling",
  },
  {
    title: "Fastest Spinning Pulsar",
    fact: "Pulsar PSR J1748-2446ad in globular cluster Terzan 5 spins 716 times per second. Its equator travels at 24% the speed of light—over 70,000 kilometers per second!",
    tag: "Neutron Star Physics",
  },
  {
    title: "Gravitational Time Dilation",
    fact: "If you hovered right outside the event horizon of a supermassive black hole for 1 hour, centuries or millennia could pass for your friends back on Earth due to intense gravitational time dilation.",
    tag: "General Relativity",
  },
  {
    title: "First Direct Image of M87*",
    fact: "The Event Horizon Telescope linked eight radio observatories around the globe (from Hawaii and Chile to the South Pole) to create a virtual Earth-sized telescope with enough resolving power to read a newspaper in Paris from New York.",
    tag: "EHT Collaboration",
  },
];
