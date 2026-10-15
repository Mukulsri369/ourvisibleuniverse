import type { LessonContract, QuizQuestion, ScientificSource, LearningLevel } from "../types";

export interface SourcedOrbitalParameter {
  label: string;
  value: string;
  scientificContext: string;
  source: string;
  equationOrRatio: string;
}

export const SOURCED_ORBITAL_PARAMETERS: SourcedOrbitalParameter[] = [
  {
    label: "Universal Gravitational Constant (G)",
    value: "6.67430(15) × 10⁻¹¹ m³·kg⁻¹·s⁻²",
    scientificContext:
      "Fundamental coupling constant determining gravitational attraction between massive bodies.",
    source: "CODATA 2018 Recommended Values / NIST",
    equationOrRatio: "F = G · (m₁ · m₂) / r²",
  },
  {
    label: "Standard Earth Gravitational Acceleration (g₀)",
    value: "9.80665 m/s²",
    scientificContext: "Nominal gravitational acceleration at sea level on Earth at 45° latitude.",
    source: "ISO 80000-3 / BIPM",
    equationOrRatio: "g = G · M_earth / R_earth²",
  },
  {
    label: "Low Earth Orbit (LEO) Orbital Velocity (ISS)",
    value: "7.66 km/s (27,600 km/h)",
    scientificContext:
      "Speed required to maintain circular free-fall at 408 km altitude with 92.68 min period.",
    source: "NASA ISS Ephemeris Data",
    equationOrRatio: "v_circ = √(GM / r)",
  },
  {
    label: "Geostationary Orbit (GEO) Altitude & Speed",
    value: "35,786 km altitude | 3.075 km/s speed",
    scientificContext:
      "Orbital period exactly matches Earth's sidereal rotation period (23h 56m 4s).",
    source: "ITU / NASA Goddard Space Flight Center",
    equationOrRatio: "r_geo = ∛(G · M · T² / 4π²)",
  },
  {
    label: "Earth Surface Escape Velocity (v_esc)",
    value: "11.186 km/s (40,270 km/h)",
    scientificContext:
      "Minimum ballistic velocity required to escape Earth's gravitational potential well to infinity without propulsion.",
    source: "NASA Planetary Fact Sheet",
    equationOrRatio: "v_esc = √(2GM / r) = √2 · v_circ",
  },
  {
    label: "Solar Escape Velocity from 1 AU",
    value: "42.1 km/s (151,600 km/h)",
    scientificContext:
      "Speed needed relative to the Sun to escape the Solar System entirely (achieved by Voyager 1 & 2 via planetary gravity assists).",
    source: "JPL Solar System Dynamics / Horizons",
    equationOrRatio: "v_esc,sun = √(2G · M_sun / 1 AU)",
  },
  {
    label: "Earth-Moon Barycenter Position",
    value: "4,671 km from Earth's center (inside Earth's mantle)",
    scientificContext:
      "Located approximately 1,700 km beneath Earth's surface (Earth's mean radius = 6,371 km).",
    source: "IAU / JPL DE440 Planetary Ephemeris",
    equationOrRatio: "R_bary = (M_moon · d) / (M_earth + M_moon)",
  },
  {
    label: "Sun-Jupiter Barycenter Position",
    value: "742,000 km from Sun's center (1.07 × R_sun)",
    scientificContext:
      "Lies approximately 46,000 km outside the visible solar photosphere, making the Sun wobble perceptibly to exoplanet hunters.",
    source: "NASA Exoplanet Exploration Program",
    equationOrRatio: "R_bary = (M_jup · a_jup) / (M_sun + M_jup)",
  },
  {
    label: "Kepler's Third Law Ratio (Solar System)",
    value: "1.000 yr² / AU³",
    scientificContext:
      "Ratio of orbital period squared to semi-major axis cubed is constant for all bodies orbiting the Sun.",
    source: "Johannes Kepler (Harmonices Mundi 1619) / NASA",
    equationOrRatio: "T² / a³ = 4π² / [G(M + m)] ≈ const",
  },
];

export interface SubLesson08 {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  content: {
    junior: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    explorer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    astronomer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
  };
}

export const MODULE_08_SUBLESSONS: SubLesson08[] = [
  {
    id: "08-01",
    number: 1,
    title: "1. What is Gravity?",
    subtitle: "The invisible universal pull that shapes the cosmos",
    content: {
      junior: {
        summary:
          "Gravity is an invisible pulling force that every object with mass exerts on every other object. The heavier an object is, the stronger its gravitational pull!",
        keyConcepts: [
          "Gravity keeps our feet planted on Earth and keeps the Moon circling our sky.",
          "Weight depends on gravity, but mass (the amount of matter inside you) never changes anywhere in the universe.",
          "In a vacuum with no air resistance, a heavy bowling ball and a light feather fall at the exact same rate.",
        ],
        details: [
          "On the Moon, where gravity is one-sixth of Earth's, you could leap six times higher while wearing a space suit.",
          "Sir Isaac Newton realized that the same force causing an apple to drop from a tree also keeps the Moon in orbit around Earth.",
          "The farther apart two objects move, the weaker the gravitational attraction between them becomes.",
        ],
        didYouKnow:
          "Astronauts aboard the International Space Station aren't in zero gravity—Earth's gravity at their altitude is still 90% as strong as on the ground! They float because they and the station are both falling together around Earth in perpetual free-fall.",
      },
      explorer: {
        summary:
          "Newton formulated the Universal Law of Gravitation: every particle in the cosmos attracts every other particle with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.",
        keyConcepts: [
          "Newton's Gravitational Law: F = G · (m₁ · m₂) / r².",
          "The Inverse-Square Law: doubling the separation distance between two planets reduces the gravitational force between them by a factor of 4 (2² = 4).",
          "Acceleration due to gravity at a planet's surface is g = G · M / R², completely independent of the mass of the falling object.",
        ],
        details: [
          "Gravitational field lines radiate symmetrically inward toward any spherical mass.",
          "Mass curves the surrounding space, which Isaac Newton modeled as an instantaneous force acting across empty space.",
          "Tides on Earth are caused by differential gravitational gradients: the side of Earth facing the Moon feels a stronger pull than the center, creating two oceanic bulges.",
        ],
        didYouKnow:
          "If you tripled the distance between Earth and the Sun, the gravitational pull between them would drop to 1/9th (3² = 9) of its current value!",
      },
      astronomer: {
        summary:
          "In classical Newtonian mechanics, gravity is a central, conservative inverse-square force governed by Poisson's equation ∇²Φ = 4πGρ. In Einstein's General Relativity (1915), gravity is not an attractive force at all, but the geometric curvature of 4D spacetime induced by the stress-energy tensor.",
        keyConcepts: [
          "Conservative Field: ∮ F · dr = 0; gravitational potential energy U(r) = -G·M·m / r.",
          "Equivalence Principle: inertial mass (m_i in F = m_i·a) is indistinguishable from gravitational mass (m_g in F = G·M·m_g / r²), proven to 1 part in 10¹⁵ by the MICROSCOPE satellite experiment.",
          "Newtonian limitations: predicts instantaneous propagation (infinite speed), which violates special relativity, and fails to explain Mercury's 43.1 arcsec/century anomalous perihelion precession.",
        ],
        details: [
          "In General Relativity, freely falling test particles follow geodesics—the straightest possible worldlines through curved Riemannian spacetime.",
          "Einstein field equations: G_μν = (8πG / c⁴) · T_μν, reducing to Newton's law in the weak-field, non-relativistic limit (v ≪ c, Φ / c² ≪ 1).",
          "Gravitational waves, confirmed by LIGO in 2015, propagate at precisely the speed of light c, carrying quadrupole perturbations in the spacetime metric.",
        ],
        didYouKnow:
          "Because gravity is purely attractive and cannot be shielded or neutralized by opposite charges (unlike electromagnetism), it completely dominates the large-scale structure and fate of the entire universe.",
      },
    },
  },
  {
    id: "08-02",
    number: 2,
    title: "2. Why Planets Orbit Stars",
    subtitle: "The cosmic balance between forward inertia and gravitational free-fall",
    content: {
      junior: {
        summary:
          "An orbit is not a state of floating—it is falling continuously around a curved object without ever hitting it! If you throw a ball sideways, it curves down. Throw it fast enough, and the Earth curves away beneath it at the exact same rate.",
        keyConcepts: [
          "Newton imagined a giant cannon atop a high mountain: fire a cannonball sideways fast enough, and it will circle the entire Earth without touching the ground.",
          "Forward speed + gravity's downward pull = an endless circular orbit.",
          "If a planet suddenly stopped moving forward, it would plunge directly straight into the Sun!",
        ],
        details: [
          "Earth travels at an astonishing 30 kilometers every second (107,000 km/h) around the Sun.",
          "Because space has virtually zero air resistance, there is no friction to slow the planets down, so their orbits continue for billions of years.",
          "Gravity acts like an invisible tether, like a ball on a string that you swing around your head.",
        ],
        didYouKnow:
          "If the Sun's gravity were magically switched off this instant, Earth wouldn't shoot backward—it would fly off in a straight line at 30 km/s along a tangent to its orbit, obeying Newton's first law of motion!",
      },
      explorer: {
        summary:
          "Orbital motion requires centripetal acceleration. Gravity provides the exact centripetal force required to continuously bend a body's velocity vector from a straight inertial path into a closed trajectory.",
        keyConcepts: [
          "Centripetal force equation: F_c = m · v² / r.",
          "Equating gravitational force to centripetal force: G · M · m / r² = m · v² / r, yielding v = √(GM / r).",
          "Tangential velocity: the direction of motion is always perpendicular (tangent) to the radius vector in a circular orbit.",
        ],
        details: [
          "Gravity does no work on a satellite in a circular orbit because force and displacement are always strictly perpendicular (W = F · d · cos(90°) = 0), keeping orbital speed constant.",
          "In an eccentric orbit, gravity does positive work as the body approaches periapsis (speeding it up) and negative work as it climbs to apoapsis (slowing it down).",
          "Spacecraft do not use engines to stay in orbit—once orbital insertion speed is attained, engines are shut off.",
        ],
        didYouKnow:
          "To stay in orbit just 400 km above Earth, a spacecraft must travel at 7.66 km/s. If it slows down by even 1%, its orbit drops closer to the atmosphere, where aerodynamic friction rapidly deorbits it.",
      },
      astronomer: {
        summary:
          "In classical orbital mechanics, motion under an inverse-square central force is governed by the two-body equation of motion: d²r/dt² = -μ/r³ · r, where μ = G(M + m) is the standard gravitational parameter. Angular momentum per unit mass h = r × v is rigorously conserved.",
        keyConcepts: [
          "Conservation of specific angular momentum: h = r · v_θ = r² · (dθ/dt) = constant.",
          "The Runge-Lenz-Laplace vector A = v × h - μ · (r / r) is an additional conserved quantity unique to 1/r² potentials, ensuring orbits close into fixed ellipses without precession in Newtonian physics.",
          "Effective potential: V_eff(r) = -μ/r + h² / (2r²), where the angular momentum centrifugal barrier prevents bodies with non-zero angular momentum from crashing into the central singularity.",
        ],
        details: [
          "Conic section polar equation: r(θ) = p / (1 + e · cos(θ - ω)), where p = h² / μ is the semi-latus rectum and e is orbital eccentricity.",
          "The vis-viva equation relates instant velocity v, radial distance r, and semi-major axis a: v² = μ · (2/r - 1/a).",
          "General relativistic correction introduces a -3μh² / (c² r⁴) term into the effective potential, breaking the closed ellipse and causing perihelion precession.",
        ],
        didYouKnow:
          "Newton spent years solving whether a spherically symmetric body pulls an external object as if all its mass were concentrated at an infinitesimal point at its center. His proof (the Shell Theorem) required him to invent integral calculus!",
      },
    },
  },
  {
    id: "08-03",
    number: 3,
    title: "3. Circular and Elliptical Orbits",
    subtitle: "Conic sections from perfect circles to stretched ellipses",
    content: {
      junior: {
        summary:
          "Most orbits in space are not perfect circles—they are slightly stretched ovals called ellipses! An ellipse has two focal points instead of one center, and the star sits at one of these foci.",
        keyConcepts: [
          "Eccentricity (e) measures how stretched out an orbit is: e = 0 is a perfect circle, while e close to 1 is an elongated oval.",
          "Perihelion (or periapsis) is the closest point to the star, where the planet moves fastest.",
          "Aphelion (or apoapsis) is the farthest point from the star, where the planet moves slowest.",
        ],
        details: [
          "Earth's orbit is nearly circular (e = 0.0167), so you barely notice the 5 million km difference between January and July.",
          "Comet Halley has a super-eccentric orbit (e = 0.967), taking it from inside Venus's orbit all the way past Neptune!",
          "Pluto's orbit is eccentric enough (e = 0.244) that it is sometimes closer to the Sun than Neptune is.",
        ],
        didYouKnow:
          "Earth is actually closest to the Sun (perihelion) in early January! Seasons on Earth are caused by our 23.4° axial tilt, not our orbital distance to the Sun.",
      },
      explorer: {
        summary:
          "All gravitational two-body orbits belong to the conic section family: circle (e = 0), ellipse (0 < e < 1), parabola (e = 1), and hyperbola (e > 1). Total mechanical energy dictates which conic geometry is traced.",
        keyConcepts: [
          "Semi-major axis (a): half the longest diameter of the ellipse; defines the overall size and orbital period.",
          "Semi-minor axis (b): b = a · √(1 - e²).",
          "Specific orbital energy: ε = -μ / (2a); negative for bound orbits (circles & ellipses), zero for parabolic escape, positive for hyperbolic flybys.",
        ],
        details: [
          "Distance at periapsis: r_p = a · (1 - e).",
          "Distance at apoapsis: r_a = a · (1 + e).",
          "Hohmann transfer orbit: an elliptical trajectory tangent to both the departure and destination circular orbits, representing the most fuel-efficient orbital transfer between two planets.",
        ],
        didYouKnow:
          "Interstellar object 'Oumuamua, discovered in 2017, had an orbital eccentricity of e = 1.20—proving definitively that it was on an unbound hyperbolic trajectory originating outside our Solar System!",
      },
      astronomer: {
        summary:
          "The geometry of Keplerian orbits is defined by the six classical orbital elements: semi-major axis (a), eccentricity (e), inclination (i), longitude of the ascending node (Ω), argument of periapsis (ω), and true anomaly (ν).",
        keyConcepts: [
          "Vis-viva equation: v² = GM · (2/r - 1/a). At periapsis v_p = √[μ/a · (1 + e)/(1 - e)]; at apoapsis v_a = √[μ/a · (1 - e)/(1 + e)].",
          "Specific orbital energy classification: ε < 0 (bound ellipse/circle), ε = 0 (parabolic escape, C_3 = 0), ε > 0 (hyperbolic trajectory with asymptotic excess velocity v_∞ = √2ε).",
          "True anomaly ν relates radial position directly: r(ν) = a(1 - e²) / (1 + e · cos ν). Mean anomaly M and eccentric anomaly E are solved via Kepler's transcendental equation: M = E - e · sin E.",
        ],
        details: [
          "The areal velocity dA/dt = 1/2 · r² · (dθ/dt) = h/2 remains strictly invariant along the entire ellipse, proving Kepler's Second Law mathematically.",
          "Orbital perturbations caused by oblateness (J₂ coefficient) cause nodal regression and apsidal precession, utilized intentionally by sun-synchronous Earth observation satellites.",
          "Lagrange planetary equations describe how non-Keplerian perturbing forces gradually alter the six orbital elements over millions of years.",
        ],
        didYouKnow:
          "Russian mathematician Konstantin Tsiolkovsky and German engineer Walter Hohmann independently derived that raising an orbit requires accelerating in the direction of motion (prograde), which paradoxically causes the spacecraft to take longer to complete an orbit!",
      },
    },
  },
  {
    id: "08-04",
    number: 4,
    title: "4. Orbital Velocity",
    subtitle: "How fast objects must fly to hold their altitude in space",
    content: {
      junior: {
        summary:
          "Orbital velocity is the precise speed an object must travel to remain in orbit around a star or planet. The closer you are to a massive star, the faster you must move to avoid falling in!",
        keyConcepts: [
          "Mercury, closest to the Sun, zips along at 47 km/s (170,000 km/h).",
          "Distant Neptune cruises leisurely at only 5.4 km/s.",
          "If you want to move into a lower orbit closer to Earth, you actually speed up; if you climb into a higher orbit, you slow down!",
        ],
        details: [
          "The International Space Station circles Earth once every 92 minutes at 7.66 km/s.",
          "Weather and communication satellites in high geostationary orbit move at 3.07 km/s so they stay parked over the exact same spot on Earth.",
          "If an orbiting satellite slows down even slightly, gravity pulls it closer, converting potential energy into kinetic speed.",
        ],
        didYouKnow:
          "In orbital mechanics, to catch up with a spacecraft ahead of you in the same orbit, you don't step on the gas—you fire your engines backward (retrograde)! This drops you into a lower, faster orbit, allowing you to overtake your target before boosting back up.",
      },
      explorer: {
        summary:
          "Circular orbital velocity depends strictly on the central body's mass and the orbital radius: v_circ = √(G · M / r). The mass of the orbiting satellite cancels out completely!",
        keyConcepts: [
          "Inverse square-root relation: orbital speed is inversely proportional to the square root of radius: v ∝ 1/√r.",
          "Quadrupling the orbital distance cuts orbital velocity exactly in half: √(1/4) = 1/2.",
          "Vis-viva equation in action: at any instantaneous distance r on an elliptical orbit with semi-major axis a, v = √[GM · (2/r - 1/a)].",
        ],
        details: [
          "A 1-gram pebble and a 420-ton space station share the exact same orbital speed at the same altitude.",
          "Delta-v (Δv): the change in velocity required to transition between different orbits, calculated using the Tsiolkovsky rocket equation: Δv = v_e · ln(m_initial / m_final).",
          "Low-thrust ion engines achieve large velocity changes over months by applying continuous micro-accelerations.",
        ],
        didYouKnow:
          "Geostationary orbit sits at 42,164 km from Earth's center (35,786 km above the surface). At this unique altitude, orbital period equals 23 hours, 56 minutes, and 4 seconds—Earth's sidereal day!",
      },
      astronomer: {
        summary:
          "Orbital velocity in arbitrary central potentials is derived by integrating the vis-viva equation: v(r) = √[2 · (ε - U(r)/m)]. For Newtonian 1/r gravitational potentials, bound orbital speeds are bounded between periapsis and apoapsis extrema.",
        keyConcepts: [
          "Vis-viva derivation: specific mechanical energy ε = v²/2 - μ/r = -μ / (2a). Solving for v yields v = √[μ · (2/r - 1/a)].",
          "Orbital velocity vectors: resolved into radial velocity v_r = (μ/h) · e · sin ν and transverse velocity v_θ = (μ/h) · (1 + e · cos ν).",
          "Characteristic energy C₃ = v_∞² = 2ε; launch vehicles are rated by their deliverable payload mass as a function of C₃ for interplanetary departure trajectories.",
        ],
        details: [
          "Gravity assist (slingshot maneuver): an elastic collision in the heliocentric frame where a spacecraft trades momentum with a moving planet, gaining up to 2 · v_planet in heliocentric velocity.",
          "Oberth effect: firing rocket engines at maximum orbital velocity (at periapsis) generates vastly greater orbital kinetic energy change: ΔE = v · Δv + (Δv)²/2.",
          "Relativistic orbital velocity near compact objects experiences frame-dragging (Lense-Thirring effect) and innermost stable circular orbit (ISCO) limits at r_ISCO = 6GM/c² for non-rotating Schwarzschild black holes.",
        ],
        didYouKnow:
          "NASA's Parker Solar Probe uses repeated Venus gravity assists to shed orbital angular momentum, dropping its perihelion to just 6.9 million km from the Sun, where it reaches a record heliocentric velocity of 192 km/s (692,000 km/h)—0.064% the speed of light!",
      },
    },
  },
  {
    id: "08-05",
    number: 5,
    title: "5. Newton's Laws of Motion",
    subtitle: "The foundational mechanics that govern spacecraft and celestial bodies",
    content: {
      junior: {
        summary:
          "Sir Isaac Newton published three fundamental laws in 1687 that explain how all things move—from kicked soccer balls to giant orbiting planets.",
        keyConcepts: [
          "1st Law (Inertia): An object at rest stays at rest, and an object in motion keeps moving in a straight line at constant speed unless pushed or pulled.",
          "2nd Law (F = m·a): Pushing a heavier object requires more force to accelerate it at the same rate.",
          "3rd Law (Action & Reaction): For every action, there is an equal and opposite reaction—which is exactly how rocket engines push spacecraft forward by blasting gas backward!",
        ],
        details: [
          "In the vacuum of space, once a space probe is fired on its journey, it needs no engines to keep moving—inertia carries it across billions of kilometers for free.",
          "When you jump off a small boat, you push the boat backward while the boat pushes you forward.",
          "Earth pulls on you with gravity, but you also pull on the entire Earth with the exact same gravitational force!",
        ],
        didYouKnow:
          "When an astronaut drops a wrench during a spacewalk, it doesn't float away or fall down to Earth—it stays right beside the astronaut at 27,600 km/h, because both have the same forward inertia!",
      },
      explorer: {
        summary:
          "Newton's three laws provide the exact mathematical framework for orbital dynamics when paired with his law of universal gravitation.",
        keyConcepts: [
          "Newton's Second Law as a differential equation: F = d(m·v)/dt = m · (dv/dt) = m · a.",
          "Universal mutual attraction: Earth pulls on the Moon with force F, and the Moon pulls back on Earth with the exact same force F (Newton's Third Law).",
          "Linear momentum conservation: p = m · v is conserved in isolated systems, governing rocket propulsion and planetary collisions.",
        ],
        details: [
          "Because Earth is 81 times more massive than the Moon, the Moon accelerates 81 times more than Earth in response to their mutual gravitational force (a = F/m).",
          "Centripetal acceleration a_c = v² / r is directed strictly toward the center of curvature.",
          "Tsiolkovsky's rocket equation is a direct integration of Newton's third law applied to continuous mass ejection.",
        ],
        didYouKnow:
          "Newton wrote his groundbreaking laws in his masterwork 'Philosophiae Naturalis Principia Mathematica' in Latin in 1687, solving problems that had puzzled astronomers for millennia.",
      },
      astronomer: {
        summary:
          "Newtonian mechanics can be formalized through Lagrangian and Hamiltonian mechanics, establishing that symmetries imply conservation laws (Noether's Theorem): spatial translation invariance yields momentum conservation, and rotational invariance yields angular momentum conservation.",
        keyConcepts: [
          "Lagrangian formulation: L = T - V; Euler-Lagrange equations d/dt (∂L/∂q̇_i) - ∂L/∂q_i = 0 yield identical equations of motion without needing constraint forces.",
          "Central force problem: Lagrangian L = 1/2 · m · (ṙ² + r²θ̇²) + G·M·m / r leads directly to two first integrals of motion: total energy E and angular momentum L_z.",
          "Newton's Third Law breakdown: in electrodynamics and relativistic gravity, action-at-a-distance is replaced by local field momentum, where the electromagnetic or gravitational field itself carries momentum.",
        ],
        details: [
          "Hamilton's equations: q̇ = ∂H/∂p, ṗ = -∂H/∂q formulate orbital mechanics as symplectic flows preserving phase space volume (Liouville's theorem), which is why symplectic numerical integrators like Velocity Verlet are vital.",
          "Non-inertial reference frames introduce fictitious inertial forces: centrifugal force (-m ω × (ω × r)) and Coriolis force (-2m ω × v), which dictate atmospheric cyclones and stability at Lagrange points.",
          "Tidal dissipation gradually transfers Earth's rotational angular momentum to the Moon's orbital angular momentum, lengthening Earth's day by 2.3 milliseconds/century and driving the Moon outward by 3.8 cm/year.",
        ],
        didYouKnow:
          "Newton delayed publishing his gravitational theory for nearly 20 years partly because he was troubled by the philosophical implication of 'action at a distance' through empty space—a dilemma resolved 230 years later by Einstein's metric tensor field!",
      },
    },
  },
  {
    id: "08-06",
    number: 6,
    title: "6. Kepler's Laws",
    subtitle: "The empirical mathematical rules discovered by Johannes Kepler",
    content: {
      junior: {
        summary:
          "Between 1609 and 1619, German astronomer Johannes Kepler discovered three golden mathematical rules that describe how every planet in our Solar System orbits the Sun.",
        keyConcepts: [
          "1st Law (Law of Ellipses): All planets move in elliptical orbits with the Sun located at one of the two foci.",
          "2nd Law (Law of Equal Areas): A planet speeds up when it is close to the Sun and slows down when it is far away, sweeping out equal slices of area in equal amounts of time.",
          "3rd Law (Law of Harmonies): Planets farther from the Sun take much longer to complete an orbit than planets closer in (T² = a³).",
        ],
        details: [
          "Kepler figured this out by painstakingly analyzing decades of ultra-precise naked-eye star sightings recorded by Danish astronomer Tycho Brahe.",
          "Before Kepler, ancient scholars believed planetary orbits had to be perfect circles because circles were considered 'divine'.",
          "Kepler's laws work everywhere in the universe: for moons orbiting Jupiter, satellites orbiting Earth, and exoplanets orbiting distant stars!",
        ],
        didYouKnow:
          "Because Mercury is close to the Sun, its year is just 88 Earth days. Distant Neptune takes 165 Earth years to orbit the Sun once—it has completed only one full orbit since its discovery in 1846!",
      },
      explorer: {
        summary:
          "Kepler's laws provided the empirical bedrock that proved Nicolaus Copernicus's heliocentric model and enabled Isaac Newton to formulate his inverse-square law of universal gravitation.",
        keyConcepts: [
          "Kepler's 1st Law: r = p / (1 + e · cos θ); planetary orbits are planar conic sections.",
          "Kepler's 2nd Law: dA/dt = 1/2 · r² · ω = constant; this is a direct physical consequence of conservation of angular momentum (L = m · r² · ω = const).",
          "Kepler's 3rd Law: T² / a³ = constant. In Solar System units (years and Astronomical Units AU): T² = a³.",
        ],
        details: [
          "If an asteroid is 4 AU from the Sun, its orbital period is T = √(4³) = √64 = 8 Earth years!",
          "If a planet takes 27 years to orbit the Sun, its average distance is a = ∛(27²) = ∛729 = 9 AU (roughly Saturn's distance).",
          "Newton generalized Kepler's third law to account for mutual masses: T² = [4π² / G(M₁ + M₂)] · a³.",
        ],
        didYouKnow:
          "When astronomers discover a new exoplanet with the Kepler or TESS space telescopes by measuring its orbital period T from transit dips, they immediately calculate its exact orbital distance a using Kepler's 3rd Law!",
      },
      astronomer: {
        summary:
          "Newton's mathematical derivation of Kepler's three laws from F = G M m / r² stands as one of the supreme triumphs in the history of theoretical physics, proving that central inverse-square forces uniquely generate planar conic trajectories.",
        keyConcepts: [
          "Derivation of 1st Law: substituting u = 1/r into the Binet equation d²u/dθ² + u = μ/h² yields u(θ) = μ/h² · [1 + e · cos(θ - ω)], the polar equation of an ellipse.",
          "Derivation of 2nd Law: torque τ = r × F = 0 because the force is central (parallel to r). Therefore dL/dt = 0, so specific angular momentum h = r² · θ̇ is constant, yielding constant areal velocity dA/dt = h/2.",
          "Derivation of 3rd Law: integrating dA/dt over an entire period T gives total ellipse area A = π · a · b. Since b = a · √(1 - e²) and h = √[μ · a · (1 - e²)], T = 2π a b / h = 2π · a^(3/2) / √μ, which squares to T² = (4π² / μ) · a³.",
        ],
        details: [
          "Modified Kepler's 3rd Law for binary star mass measurement: M₁ + M₂ = (4π² / G) · (a³ / T²), providing the primary method for weighing stars across astrophysics.",
          "Kepler's equation M = E - e · sin E has no closed-form algebraic solution for eccentric anomaly E; it must be solved iteratively via Newton-Raphson numerical methods in ephemeris software.",
          "Perturbed Keplerian elements: N-body gravitational interactions cause osculating Keplerian orbital elements to oscillate around mean secular values.",
        ],
        didYouKnow:
          "Kepler worked on the orbit of Mars for eight grueling years. An error of just 8 arcminutes (less than a third of the Moon's width) between circular theory and Tycho Brahe's observations forced him to abandon circles entirely and discover ellipses!",
      },
    },
  },
  {
    id: "08-07",
    number: 7,
    title: "7. Escape Velocity",
    subtitle: "Breaking free from a celestial body's gravitational grip",
    content: {
      junior: {
        summary:
          "Escape velocity is the speed you must reach to completely break free from a planet's gravitational pull and fly off into deep space without ever falling back.",
        keyConcepts: [
          "To escape Earth, a rocket must blast off at 11.2 kilometers per second—over 40,000 km/h (25,000 mph)!",
          "Smaller worlds have lower escape velocities: the Moon's escape velocity is just 2.4 km/s.",
          "Black holes are objects so dense that their escape velocity is greater than the speed of light, so not even light can escape!",
        ],
        details: [
          "You don't need to reach escape velocity if you have engines running constantly, but for a ballistic rocket that burns all its fuel early, 11.2 km/s is required.",
          "Gas molecules in an atmosphere also have thermal speeds; if a gas moves faster than escape velocity, it leaks into space (which is why the Moon has no atmosphere).",
          "Voyager 1 and 2, Pioneer 10 and 11, and New Horizons are the only five human-made spacecraft currently traveling fast enough to escape the Solar System forever.",
        ],
        didYouKnow:
          "On tiny asteroid Bennu (500 meters wide), escape velocity is a mere 20 centimeters per second (0.7 km/h)—you could jump off into outer space with your own legs!",
      },
      explorer: {
        summary:
          "Escape velocity occurs when an object's kinetic energy equals its gravitational potential binding energy: 1/2 · m · v_esc² = G · M · m / r. Solving for velocity yields v_esc = √(2 · G · M / r).",
        keyConcepts: [
          "Formula: v_esc = √(2GM / r) = √2 · v_circ ≈ 1.414 · v_circ.",
          "Escape velocity is exactly √2 (about 41.4%) faster than circular orbital velocity at the same altitude.",
          "Atmospheric retention: a planet retains a chemical element in its atmosphere if the gas's root-mean-square thermal velocity v_rms < 1/6 · v_esc.",
        ],
        details: [
          "Because Earth's escape velocity is 11.2 km/s, light gases like hydrogen (H₂) and helium (He) readily escape into space, while heavier gases like oxygen (O₂) and nitrogen (N₂) are securely retained.",
          "Gravitational potential well: escaping a planet is mathematically like rolling a marble up a steep funnel-shaped hill to reached flat plateau ground at infinity.",
          "Hyperbolic excess velocity: if a probe departs Earth with speed v > v_esc, its remaining speed far from Earth is v_∞ = √(v² - v_esc²).",
        ],
        didYouKnow:
          "To escape the Sun starting from Earth's orbital position (1 AU), a probe needs 42.1 km/s relative to the Sun. Because Earth is already traveling at 29.8 km/s, launching in Earth's direction of motion requires an extra boost of only 12.3 km/s!",
      },
      astronomer: {
        summary:
          "Escape velocity defines the parabolic threshold (parabolic trajectory e = 1) where specific orbital mechanical energy ε = 0. In General Relativity, setting v_esc = c yields the Schwarzschild event horizon radius r_s = 2GM / c².",
        keyConcepts: [
          "Energy balance: E_total = K + U = 1/2 · m · v² - G·M·m / r = 0 at the escape threshold.",
          "Event Horizon derivation: setting v_esc = c in the classical formula yields r_s = 2GM / c², identical to the exact General Relativistic Schwarzschild radius for a non-rotating black hole.",
          "Tisserand's parameter T_p ≈ a_p / a + 2 · √[(a/a_p)(1 - e²)] · cos i remains invariant during planetary flybys, constraining reachable post-encounter orbits.",
        ],
        details: [
          "Jeans escape: thermal atmospheric loss rate derived from Maxwell-Boltzmann velocity distribution tail exceeding v_esc.",
          "Non-thermal escape mechanisms: charge exchange, dissociative recombination, and solar wind sputtering stripped Mars of ~80% of its ancient atmosphere after its core dynamo collapsed.",
          "Gravitational redshift: photons escaping a deep potential well lose energy without changing speed, shifting to longer wavelengths: 1 + z = (1 - 2GM / rc²)^(-1/2).",
        ],
        didYouKnow:
          "If Earth were compressed into a black hole, its entire 6 × 10²⁴ kg mass would need to be squeezed into a sphere with a radius of just 9 millimeters—the size of a marble!",
      },
    },
  },
  {
    id: "08-08",
    number: 8,
    title: "8. Barycenters and Multiple-Body Systems",
    subtitle: "When worlds orbit each other: binary stars, chaotic orbits, and Lagrange points",
    content: {
      junior: {
        summary:
          "Planets don't orbit the exact center of a star—both the planet and the star orbit their shared center of mass, called the barycenter! Think of it like a parent swinging a small child around by their hands.",
        keyConcepts: [
          "The barycenter is the cosmic balance point where two or more bodies would balance on a giant imaginary seesaw.",
          "Jupiter is so massive that the Sun-Jupiter barycenter actually sits outside the surface of the Sun!",
          "More than half of the stars you see in the night sky are binary or triple systems with two or three stars dancing around each other.",
        ],
        details: [
          "As massive planets orbit, their gravitational tug makes their host stars wobble. Astronomers detect distant exoplanets by measuring this tiny stellar wobble!",
          "Pluto and its largest moon Charon orbit a barycenter point located out in the open space between them.",
          "The Earth-Moon barycenter is located 4,670 km from Earth's center—about 1,700 km beneath Earth's rocky surface.",
        ],
        didYouKnow:
          "Because the Sun wobbles around the changing Solar System barycenter (shifted by Jupiter, Saturn, Uranus, and Neptune), the Sun is sometimes moving toward distant stars and sometimes away, wobbling at a bicycle rider's speed (~13 m/s)!",
      },
      explorer: {
        summary:
          "In any gravitational system, the barycenter position R_cm = (∑ m_i · r_i) / (∑ m_i). When three or more massive bodies interact, orbits become non-linear and mathematically chaotic—the famous gravitational Three-Body Problem.",
        keyConcepts: [
          "Barycentric coordinate formula: for two bodies, r₁ = a · m₂ / (m₁ + m₂) and r₂ = a · m₁ / (m₁ + m₂).",
          "The Three-Body Problem: while two bodies have an exact closed mathematical solution, three or more bodies generally have no general closed-form analytical solution and must be simulated numerically.",
          "Lagrange Points (L1 to L5): five equilibrium positions in an orbital system where the gravitational pulls of two large bodies cancel the centrifugal force felt by a third tiny body.",
        ],
        details: [
          "L1, L2, and L3 lie along the line connecting the two masses. The James Webb Space Telescope (JWST) orbits around Sun-Earth L2, 1.5 million km behind Earth.",
          "L4 and L5 form equilateral triangles 60° ahead of and 60° behind the planet in its orbit. Jupiter has over 10,000 Trojan asteroids parked safely at its L4 and L5 points.",
          "Hill sphere: the gravitational sphere of influence of an astronomical body against tidal disruptions from a larger primary body: r_H ≈ a · ∛(m / 3M).",
        ],
        didYouKnow:
          "Poincaré's attempt to solve the three-body problem for King Oscar II of Sweden's science prize in 1887 led to the discovery of deterministic chaos and modern chaos theory: tiny differences in initial positions lead to wildly different orbital outcomes!",
      },
      astronomer: {
        summary:
          "Multi-body dynamics under Newtonian gravity are governed by the general N-body Hamiltonian H = ∑ (p_i² / 2m_i) - ∑_{i < j} G m_i m_j / |r_i - r_j|. Systems exhibit complex resonance phenomena, Kozai-Lidov oscillations, and orbital migration.",
        keyConcepts: [
          "Circular Restricted Three-Body Problem (CR3BP): assumes two primary masses m₁ and m₂ move in circular orbits around their barycenter while a massless third body moves in their joint gravitational field.",
          "Jacobi Energy Integral C_J = 2Ω(x, y, z) - v² is the sole conserved invariant in CR3BP, defining zero-velocity surfaces that establish forbidden zones for spacecraft or asteroids.",
          "Lyapunov time: the characteristic timescale on which an orbital system becomes unpredictable due to exponential divergence of nearby phase-space trajectories (Earth's orbital Lyapunov time is ~5 million years).",
        ],
        details: [
          "Kozai-Lidov mechanism: gravitational perturbations from a distant third body cause coupled periodic exchanges between an inner binary's orbital inclination and eccentricity while preserving √[1 - e²] · cos i.",
          "Symplectic integrators (e.g. Wisdom-Holman, Velocity Verlet, Hermite 4th-order) preserve the symplectic two-form ω = dq ∧ dp, ensuring bound energy errors without secular artificial drift.",
          "Nice Model of Solar System migration: early resonant interactions between Jupiter and Saturn triggered a chaotic reshuffling of Uranus and Neptune, scattering the Kuiper belt and driving the Late Heavy Bombardment.",
        ],
        didYouKnow:
          "In 1993, mathematicians Cristopher Moore and later Alain Chenciner & Richard Montgomery discovered a stable figure-8 periodic orbit where three equal-mass stars chase each other along a single infinity-shaped trajectory!",
      },
    },
  },
];

export const MODULE_08_SOURCES: ScientificSource[] = [
  {
    title: "Basics of Space Flight: Section 1 Environment & Orbital Mechanics",
    organization: "NASA",
    url: "https://science.nasa.gov/learn/basics-of-space-flight/",
    note: "Comprehensive mission flight dynamics guide maintained by NASA JPL.",
  },
  {
    title: "Kepler's Laws of Planetary Motion",
    organization: "NASA",
    url: "https://solarsystem.nasa.gov/resources/310/orbits-and-keplers-laws/",
    note: "Primary educational archive detailing Johannes Kepler's empirical derivation.",
  },
  {
    title: "Celestial Mechanics and Orbital Dynamics",
    organization: "ESA",
    url: "https://www.esa.int/Enabling_Support/Operations/Orbital_mechanics",
    note: "European Space Operations Centre (ESOC) orbital maneuvering foundations.",
  },
  {
    title: "CODATA Recommended Values of the Fundamental Physical Constants",
    organization: "Wikipedia",
    url: "https://physics.nist.gov/cuu/Constants/",
    note: "National Institute of Standards and Technology (NIST) precision reference for G.",
  },
];

export const MODULE_08_LESSON: LessonContract = {
  lessonId: "lesson_08_gravity_orbits",
  moduleId: "08",
  title: "Gravity, Orbits & Motion",
  objectives: [
    "Master Newton's Universal Law of Gravitation and inverse-square force behavior",
    "Discover how circular and elliptical orbits arise naturally from gravitational acceleration and velocity vectors",
    "Verify Kepler's three laws of planetary motion with interactive numerical measurements",
    "Simulate multi-body gravitational mechanics, barycenter motion, and the stable solar system challenge",
  ],
  visualizationType: "orbit-sim",
  interactions: [
    "Simulate true N-body Newtonian orbits using a symplectic Velocity Verlet numerical integrator",
    "Adjust body mass, initial positions, and velocity vectors to create stable orbits or escape trajectories",
    "Toggle real-time barycenter markers, velocity vectors, and gravitational force arrows",
    "Plot live kinetic vs potential energy conservation curves and Kepler's harmonic T² vs a³ graph",
    "Participate in the 'Build a Stable Solar System' challenge with multi-planet resonance monitoring",
  ],
  relatedConcepts: [
    "Universal Gravitation",
    "Centripetal Acceleration",
    "Escape Velocity",
    "Kepler's Laws",
    "Barycenter",
    "Symplectic Integration",
    "Relativistic Precession",
  ],
  completionCriteria:
    "Explore the 8 sublessons, configure a stable orbit in the 3D physics lab, complete the Stable Solar System challenge, and score at least 66% on the knowledge check.",
  scientificSources: MODULE_08_SOURCES,
  gradeLevelContent: {
    junior: {
      introHook:
        "Ever wondered why the Moon doesn't crash into Earth, or why astronauts float in the space station? Step into our orbital mechanics laboratory to launch your own planets, bend gravity, and discover the secrets of the cosmos!",
      coreConcepts: [
        "Gravity is the invisible force pulling all matter together.",
        "An orbit is continuous falling around a curved planet without touching it.",
        "Farther planets move slower and take much longer to circle the Sun.",
        "Rockets need to travel at 11.2 km/s (40,000 km/h) to completely escape Earth.",
      ],
      explanatoryText:
        "Gravity is the cosmic glue of our universe. Isaac Newton realized that the force pulling an apple down from a tree is the very same force holding the Moon in orbit. When you fire an object sideways at the right speed, gravity curves its fall to match the curvature of the Earth, creating a perpetual orbit!",
      mathExplanation:
        "Weight = Mass × Gravity (w = m · g). On Earth g = 9.8 m/s², while on the Moon g = 1.6 m/s².",
      funFacts: [
        "If you could dig a tunnel straight through the center of the Earth and jump in, gravity would pull you back and forth like a giant cosmic swing, taking about 42 minutes to reach the other side!",
        "Saturn has rings made of billions of icy particles, each one orbiting Saturn in its own tiny Keplerian orbit!",
        "The fastest human-made spacecraft, NASA's Parker Solar Probe, reached over 690,000 km/h by diving deep into the Sun's powerful gravitational field.",
      ],
      quizQuestions: [
        {
          id: "q08_j1",
          question:
            "Why does the International Space Station stay in orbit without falling to the ground?",
          options: [
            "There is zero gravity in space at that altitude",
            "It is moving forward so fast (27,600 km/h) that as gravity pulls it down, Earth curves away beneath it",
            "Giant rocket engines fire continuously to hold it up",
            "Earth's magnetic field repels it away",
          ],
          correctIndex: 1,
          explanation:
            "The space station is in perpetual free-fall! Its forward speed of 7.66 km/s curves its path to match Earth's spherical curvature, creating a closed circular orbit.",
        },
        {
          id: "q08_j2",
          question:
            "According to Kepler's laws, which planet takes the longest time to orbit the Sun?",
          options: [
            "Mercury (closest to the Sun)",
            "Earth (middle distance)",
            "Neptune (farthest from the Sun)",
            "All planets take the exact same time",
          ],
          correctIndex: 2,
          explanation:
            "Kepler's third law shows that planets farther from the Sun move slower and have much larger orbits. Neptune takes 165 Earth years to complete one orbit, while Mercury takes only 88 days!",
        },
        {
          id: "q08_j3",
          question:
            "What is the name for the balance point around which two astronomical bodies orbit each other?",
          options: ["Equator", "Barycenter", "Zenith", "Perigee"],
          correctIndex: 1,
          explanation:
            "The barycenter is the center of mass of two or more celestial bodies orbiting one another. Both bodies orbit this common shared point.",
        },
      ],
    },
    explorer: {
      introHook:
        "Newtonian mechanics revolutionized human understanding of the universe. In this orbital mechanics laboratory, you will use real gravitational equations to calculate orbital speeds, verify Kepler's laws, and manipulate multi-body systems in real-time.",
      coreConcepts: [
        "Newton's Universal Gravitation: F = G · (m₁ · m₂) / r² obeys the inverse-square law.",
        "Circular orbital velocity v = √(GM / r) depends only on central mass and orbital radius.",
        "Escape velocity v_esc = √(2GM / r) is exactly √2 times circular velocity.",
        "Kepler's 3rd Law T² / a³ = constant allows calculating unknown orbital distances and periods.",
      ],
      explanatoryText:
        "To place a satellite into orbit, centripetal force requirements must balance gravitational pull: m·v²/r = G·M·m/r². Notice that the satellite's mass m cancels out, meaning a tiny screw and a massive space station orbit with the exact same velocity at the same altitude. To transition between orbits, spacecraft execute orbital burns described by the vis-viva equation: v² = GM(2/r - 1/a).",
      mathExplanation:
        "F = G(m₁·m₂)/r² | v_circ = √(GM/r) | v_esc = √(2GM/r) | T² = (4π²/GM)·a³ | v² = GM(2/r - 1/a).",
      funFacts: [
        "The Sun-Jupiter barycenter is located 742,000 km from the Sun's center, which is roughly 46,000 km outside the Sun's visible surface—making the Sun execute a perceptible loop through space!",
        "The Apollo astronauts traveled to the Moon on a free-return trajectory: an ellipse shaped so that if the service module engine failed, the Moon's gravity would slingshot the spacecraft back to Earth for free.",
        "Pluto and Neptune are in a stable 3:2 orbital resonance: for every 3 times Neptune orbits the Sun, Pluto orbits exactly twice, ensuring they never collide even though Pluto's orbit crosses inside Neptune's distance.",
      ],
      quizQuestions: [
        {
          id: "q08_e1",
          question:
            "If you double the distance (r → 2r) between two gravitating planets, what happens to the gravitational force between them?",
          options: [
            "It drops to half (1/2)",
            "It drops to one-quarter (1/4)",
            "It stays the same",
            "It quadruples (4×)",
          ],
          correctIndex: 1,
          explanation:
            "Newton's law is an inverse-square law (F ∝ 1/r²). When r is doubled, the denominator becomes (2)², so the force drops to 1/4 of its initial value.",
        },
        {
          id: "q08_e2",
          question:
            "A spacecraft in low Earth orbit travels at 7.66 km/s. What minimum speed must it reach to escape Earth's gravitational pull entirely?",
          options: [
            "8.50 km/s",
            "11.19 km/s (√2 × circular speed)",
            "15.32 km/s (2× circular speed)",
            "30.00 km/s",
          ],
          correctIndex: 1,
          explanation:
            "Escape velocity is exactly √2 ≈ 1.414 times circular orbital velocity: 7.66 km/s × 1.414 = 10.83 km/s at LEO altitude (and 11.19 km/s at Earth's surface).",
        },
        {
          id: "q08_e3",
          question:
            "An asteroid has an average distance (semi-major axis) from the Sun of 4 AU. According to Kepler's third law (T² = a³ in Solar System units), what is its orbital period?",
          options: ["2 Earth years", "4 Earth years", "8 Earth years", "16 Earth years"],
          correctIndex: 2,
          explanation:
            "Applying T² = a³: T² = 4³ = 64. Taking the square root gives T = √64 = 8 Earth years.",
        },
      ],
    },
    astronomer: {
      introHook:
        "Welcome to advanced astrodynamics. Explore the mathematical formulation of N-body central force Hamiltonian mechanics, symplectic phase-space integrators, non-linear chaos at Lagrange equilibria, and the transition from Newtonian limits to General Relativistic spacetime geodesics.",
      coreConcepts: [
        "Two-body reduction and conservation of Runge-Lenz-Laplace vector A = v × h - μ(r/r).",
        "Symplectic Velocity Verlet numerical integration preserving energy and phase-space volume.",
        "Restricted Three-Body Problem (CR3BP), Jacobi integral, and Lagrange points L1–L5.",
        "Relativistic limits: Schwarzschild metric, ISCO, and 43.1 arcsec/century Mercury perihelion advance.",
      ],
      explanatoryText:
        "Under Newtonian gravity, the two-body problem is completely integrable due to the conservation of angular momentum h and the Laplace-Runge-Lenz vector A, which fixes the apsidal line. However, the general N-body problem (N ≥ 3) is analytically non-integrable. Numerical modeling requires symplectic algorithms that preserve the Poincaré-Cartan integral invariants without secular energy drift. For high-precision ephemerides, General Relativistic corrections must be incorporated: the Schwarzschild metric adds a -3GMh²/(c²r⁴) perturbation term to the effective radial potential, driving anomalous perihelion precession.",
      mathExplanation:
        "d²r/dt² = -∑ G m_j (r - r_j)/(|r - r_j|² + ε²)^(3/2) | ε = v²/2 - μ/r = -μ/(2a) | C_J = 2Ω - v² | r_s = 2GM/c² | Δω = 6πGM/(c²a(1-e²)).",
      funFacts: [
        "In 1915, Albert Einstein calculated the relativistic precession of Mercury's orbit using his new General Relativity equations, obtaining exactly the missing 43 arcseconds per century—a moment he described as giving him heart palpitations of sheer joy!",
        "The James Webb Space Telescope does not sit stationary at Sun-Earth L2; instead, it executes a complex 3D quasi-periodic halo orbit around the unstable L2 point using minor delta-v station-keeping maneuvers.",
        "The Three-Body Problem exhibits sensitive dependence on initial conditions: a variation of 1 millimeter in a planet's initial position can cause entire orbital reconfigurations after several Lyapunov times.",
      ],
      quizQuestions: [
        {
          id: "q08_a1",
          question:
            "Why are symplectic integrators (like Velocity Verlet) strictly preferred over standard Runge-Kutta or Euler methods for long-term orbital simulations?",
          options: [
            "They run 1,000 times faster on modern GPUs",
            "They preserve the symplectic two-form and phase-space volume (Liouville's theorem), preventing secular artificial energy drift over millions of orbital periods",
            "They completely eliminate gravitational softening requirements",
            "They incorporate General Relativity without additional equations",
          ],
          correctIndex: 1,
          explanation:
            "Standard Runge-Kutta methods dissipate or inject artificial energy over time, causing orbits to artificially spiral in or out. Symplectic integrators preserve the Hamiltonian phase-space structure, ensuring total energy oscillates strictly within bounded limits.",
        },
        {
          id: "q08_a2",
          question:
            "In the Circular Restricted Three-Body Problem (CR3BP), which five points represent gravitational-centrifugal equilibrium states?",
          options: [
            "Periapsis, Apoapsis, True Anomaly, Ascending Node, Descending Node",
            "Lagrange points L1, L2, L3 (collinear, unstable) and L4, L5 (equilateral, stable for mass ratio μ < 0.0385)",
            "Schwarzschild radius, Ergosphere, ISCO, Photon sphere, Singularity",
            "Tidal disruption radii for rocky, gaseous, icy, metallic, and carbonaceous bodies",
          ],
          correctIndex: 1,
          explanation:
            "Joseph-Louis Lagrange discovered the five equilibrium points in 1772. L1, L2, and L3 lie along the axis connecting the two bodies and are dynamically unstable; L4 and L5 form equilateral triangles and are linearly stable when the primary mass dominates (Gascheau criterion μ < 0.0385).",
        },
        {
          id: "q08_a3",
          question:
            "What physical mechanism in General Relativity causes Mercury's perihelion to precess by 43.1 arcseconds per century beyond Newtonian perturbations?",
          options: [
            "The Sun's coronal mass ejections striking Mercury's surface",
            "Spacetime curvature altering the effective potential by -3GMh²/(c²r⁴), breaking the closed ellipse symmetry guaranteed by the classical Runge-Lenz vector",
            "Gravitational wave emissions carrying orbital energy away into deep space",
            "Dark matter concentrated inside Mercury's orbital radius",
          ],
          correctIndex: 1,
          explanation:
            "In Newtonian mechanics, the 1/r potential uniquely conserves the Laplace-Runge-Lenz vector, forcing orbits to close perfectly. Einstein's spacetime curvature adds a non-inverse-square term (-3GMh²/c²r⁴) to the effective potential, causing the apsidal line to rotate forward with each revolution.",
        },
      ],
    },
  },
};
