import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export const MODULE_19_SUBLESSONS: SubLesson[] = [
  {
    id: "m19-l1",
    number: 1,
    title: "Diverse Early Ideas & The Myth of Universal Flat Earth",
    subtitle: "Mythological worldviews vs mathematical models across human cultures",
    content: {
      explorer: `
### How Did Ancient People See the Sky?

For thousands of years, people looked up at the stars and wondered: *What is this magnificent place we live in?*

A common modern myth is that "everyone in ancient times thought the Earth was flat." **That is historically false!**

* Different cultures held diverse, imaginative, and deeply practical views of the cosmos.
* In ancient Mesopotamia and Egypt, the sky was often envisioned as a protective vault or goddess (Nut) arched over the fertile land.
* In ancient China, early astronomers proposed several competing models: the *Gaitian* (canopy sky), the *Huntian* (celestial sphere like an egg containing the Earth as the yolk), and the *Xuanye* (infinite empty space with celestial bodies floating freely).
* Ancient cultures did not follow a single linear sequence of ideas, and many transitioned to spherical geometry over two thousand years ago!
      `,
      scholar: `
### Cultural Plurality & The Flat-Earth Fallacy

Historical cosmology was never a monolithic, unilinear progression from primitive flat-earth beliefs to modern science.

1. **Mythological & Functional Architectures**:
   Early cosmologies were deeply functional, serving calendar-keeping, agricultural coordination, and religious meaning. Babylonian scribes developed sophisticated numerical arithmetic (sexagesimal sky diaries) to predict eclipses with stunning precision without ever postulating geometric spatial orbits.
2. **Debunking the 'Flat Earth' Myth**:
   The widespread modern belief that medieval Europeans or educated classical thinkers thought the Earth was flat is an 18th-century historiographical fiction (popularized by Washington Irving and John William Draper). From Pythagoras (c. 500 BCE) and Aristotle (384–322 BCE) through medieval Islamic and Christian scholars, the spherical Earth was an undisputed academic fact taught in every university.
      `,
      astrophysicist: `
### Epistemological Evolution of Cosmological Frameworks

Ancient cosmological frameworks evolved through three distinct epistemological paradigms:
1. **Instrumental Positivism (Mesopotamian & Chinese tradition)**:
   Predicting astronomical coordinates solely through time-series periodicity and harmonic empirical arithmetic (e.g., Babylonian System A and B planetary theories).
2. **Geometric Deduction (Hellenic & Hellenistic tradition)**:
   Postulating underlying continuous geometric manifolds (two-sphere universe, celestial spheres, equants) to "save the phenomena" (*sōzein ta phainomena*).
3. **Physical Dynamics (Newtonian & Modern era)**:
   Unifying terrestrial and celestial mechanics under invariant differential conservation laws and spacetime geometries.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l2",
    number: 2,
    title: "Empirical Proofs of a Spherical Earth",
    subtitle: "Lunar eclipses, sailing ships, and Eratosthenes' shadow measurement",
    content: {
      explorer: `
### How Did We Prove Earth Is Round Without Rockets?

You don't need a space rocket to prove the Earth is round! Ancient Greek astronomers proved it over 2,200 years ago using three simple observations:

1. **Lunar Eclipses**: When the Earth passes between the Sun and the Moon, it casts a shadow on the Moon. That shadow is **always circular**, no matter where the eclipse happens! Only a sphere always casts a round shadow from every angle.
2. **Sailing Ships**: When a ship sails away toward the horizon, its hull disappears first, and its tallest mast disappears last. If the Earth were flat, the ship would just look smaller and smaller without sinking below the curve!
3. **Traveling North or South**: As travelers walked south toward Egypt, new constellations (like Canopus) rose above the southern horizon, while Polaris sank lower.

In 240 BCE, **Eratosthenes** measured the shadows in two Egyptian cities on the summer solstice and calculated the Earth's circumference to within a few percent of the true modern value!
      `,
      scholar: `
### Eratosthenes & The Geometry of the Spherical Earth

Around 240 BCE in Alexandria, Egypt, the mathematician and head librarian **Eratosthenes of Cyrene** conducted the first quantitative measurement of Earth's size.

**The Geometric Method**:
1. At noon on the Summer Solstice in Syene (modern Aswan), sunlight shone directly down a deep vertical well without casting a shadow (Sun directly overhead at zenith, angle $\\theta_1 = 0^\\circ$).
2. At the exact same date and time in Alexandria (due north), a vertical obelisk (*gnomon*) cast a shadow measuring an angle of $\\theta_2 \\approx 7.2^\\circ$ (or $\\frac{1}{50}$ of a full $360^\\circ$ circle).
3. Because the Sun is so far away that incoming rays are parallel, the interior angle subtended at Earth's center between Syene and Alexandria must equal $7.2^\\circ$.
4. The overland distance $s$ was paced out by professional surveyors (*bematists*) to be approximately $5,000$ stadia (~$800$ km).

$$\\frac{s}{C} = \\frac{\\theta}{360^\\circ} \\implies C = \\frac{360^\\circ}{7.2^\\circ} \\times 5,000 \\text{ stadia} = 50 \\times 5,000 = 250,000 \\text{ stadia} \\approx 39,375 \\text{ km}$$
The modern accepted equatorial circumference is **40,075 km**—an astonishing empirical achievement!
      `,
      astrophysicist: `
### Horizon Geometry, Angular Elevation & Curvature Radius

The mathematical proof of Earth's curvature follows from Euclidean differential geometry:

Let an observer stand at height $h$ above a sphere of radius $R$. The geometric distance to the visible horizon $d_h$ along the tangent line is:

$$d_h = \\sqrt{(R + h)^2 - R^2} = \\sqrt{2Rh + h^2} \\approx \\sqrt{2Rh}$$

The dip angle of the horizon below the local horizontal plane is:
$$\\gamma = \\arccos\\left( \\frac{R}{R + h} \\right) \\approx \\sqrt{\\frac{2h}{R}}$$

Furthermore, the latitudinal variation in the altitude angle $a_\\star$ of Polaris (or the celestial pole):
$$a_\\star = \\phi$$
Where $\\phi$ is the observer's geographic latitude. A continuous linear change $\\frac{da_\\star}{d s} = \\frac{1}{R}$ directly proves that Earth's meridian arc is circular with constant curvature radius $R$.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l3",
    number: 3,
    title: "Major Geocentric Models",
    subtitle: "From Aristotle's crystalline spheres to Ptolemy's epicycles and equants",
    content: {
      explorer: `
### Earth at the Center: Geocentrism

When you stand in a field, it feels like you are perfectly still while the Sun, Moon, and stars roll across the sky. For over a thousand years, the most popular scientific model placed Earth at the center of the universe.

* **Aristotle's Model (c. 350 BCE)**: He pictured the universe like a set of giant nested glass nesting spheres. Earth was in the center, and planets were carried on crystal spheres rotating forever.
* **The Problem of Retrograde Motion**: Sometimes, planets like Mars slow down, stop, and loop *backward* in the sky for a few weeks before continuing forward!
* **Ptolemy's Solution (c. 150 CE)**: Claudius Ptolemy invented **Epicycles**—wheels on wheels! He said planets orbit in small circles, while the center of that small circle orbits Earth.

This model was brilliant and could predict planetary positions accurately enough for sailors and astrologers for 1,400 years!
      `,
      scholar: `
### The Ptolemaic System: Epicycles, Deferents, and the Equant

Published in the *Almagest* (c. 150 CE) by **Claudius Ptolemy** of Alexandria, the geocentric mathematical model represented the peak of ancient mathematical astronomy.

Key Geometric Devices:
1. **The Deferent**: The large circular orbit centered near the Earth.
2. **The Epicycle**: A smaller circle whose center moves along the deferent. The planet rotates on the epicycle, neatly explaining apparent **retrograde motion** (when the planet's epicyclic vector opposes the deferent motion).
3. **The Eccentric**: Shifting the center of the deferent slightly away from Earth to account for the varying apparent speeds of the Sun and Moon.
4. **The Equant Point**: An off-center point from which the center of the epicycle appears to sweep out equal angles in equal times.

**Scientific Strengths**: Highly predictive; successfully calculated eclipses, occultations, and planetary positions.
**Scientific Limitations**: Artificially complex; lacked physical dynamical justification; violated pure uniform circular motion through the equant contrivance.
      `,
      astrophysicist: `
### Fourier-like Kinematics of Ptolemaic Planetary Motion

In modern vector mechanics, the Ptolemaic epicyclic model is mathematically equivalent to a truncated complex Fourier series expansion:

$$\\mathbf{r}(t) = \\mathbf{r}_0 + R_{\\text{def}} e^{i \\omega_{\\text{def}} t} + r_{\\text{epi}} e^{i \\omega_{\\text{epi}} t}$$

Where:
* $\\omega_{\\text{def}}$ is the deferent angular frequency (mean sidereal motion).
* $\\omega_{\\text{epi}}$ is the epicycle frequency (synodic frequency relative to the Sun).
* The equant point effectively introduces a non-linear phase modulation $\\theta(t) = \\omega t + 2e \\sin(\\omega t)$, which approximates Kepler's Second Law (equal areas in equal times) to first order in orbital eccentricity $e$!

While kinematically capable of reproducing observed heliocentric orbits with low eccentricity ($e < 0.1$), the model collapsed when applied to Mercury ($e = 0.206$) and failed to predict the large moon distance variations that its epicycle radius required.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l4",
    number: 4,
    title: "Global Astronomical Traditions",
    subtitle: "Indian, Islamic, and East Asian innovations across the medieval world",
    content: {
      explorer: `
### Astronomers Around the World

During the centuries when Europe was in the Middle Ages, astronomical knowledge flourished brilliantly in India, the Islamic world, China, and the Americas!

* **India (Aryabhata, 499 CE)**: The great mathematician Aryabhata proposed that the Earth **rotates on its own axis once a day**, explaining why stars appear to rise and set! He also explained that the Moon and planets shine by reflecting sunlight.
* **The Islamic Golden Age (8th–15th centuries)**: Astronomers built world-class observatories with massive instruments. **Al-Battani** calculated the length of the year to within 24 seconds! **Al-Biruni** devised a clever trigonometrical method to measure the Earth's radius using the dip of the horizon from a mountain.
* **The Maragha Observatory & The Tusi Couple (1247 CE)**: Nasir al-Din al-Tusi invented a mathematical device that turned circular motion into straight-line motion, fixing errors in Ptolemy's models. This exact mathematical diagram later appeared in the works of Copernicus!
      `,
      scholar: `
### Non-Western Astronomical Breakthroughs

The history of astronomy was a continuous global dialogue:

1. **Indian Astronomical Tradition**:
   - **Aryabhata (476–550 CE)**: Wrote the *Aryabhatiya*. Stated clearly: *"Just as a man in a boat going in one direction sees the stationary things on the bank moving in the opposite direction, so an observer on Earth sees the fixed stars moving due west."*
   - **Brahmagupta (598–668 CE)**: Formulated *guruktvākarṣaṇa* (gravitational attraction): *"Bodies fall towards the earth as it is in the nature of the earth to attract bodies."*
   - **Kerala School (Nilakantha Somayaji, 1500 CE)**: Developed a quasi-heliocentric model where planets orbit the Sun, which in turn orbits the Earth.

2. **Islamic Astronomy & The Maragha School**:
   - **Ibn al-Haytham (Alhazen, 965–1040 CE)**: Wrote *Doubts on Ptolemy* (*Al-Shukuk 'ala Batlamyus*), rejecting the equant as physically impossible.
   - **Nasir al-Din al-Tusi (1201–1274 CE)**: Developed the **Tusi Couple**, a 2D geometric construction in which a small circle rolls inside a circle twice its diameter, producing linear harmonic motion from circular motion.
   - **Ibn al-Shatir (1304–1375 CE)**: Chief astronomer of the Umayyad Mosque in Damascus; eliminated the equant using concentric epicycles, producing lunar and planetary models geometrically identical to Copernicus's 1543 models!
      `,
      astrophysicist: `
### Mathematical Formulation of the Tusi Couple & Coordinate Rotation

The Tusi couple resolves non-uniform motion while preserving uniform circular physics. Let a cylinder of radius $r$ roll without slipping inside a stationary cylinder of radius $R = 2r$.

The position vector of a point on the perimeter of the inner circle:
$$\\mathbf{r}(t) = r e^{i \\theta} + r e^{-i \\theta} = 2r \\cos(\\theta) \\hat{\\mathbf{x}}$$

This proves that pure uniform circular rotation generates rectilinear harmonic motion without requiring equant points or physical deformation.

Copernicus utilized this exact theorem in Book III, Chapter 4 of *De revolutionibus* (1543), copying the lettered diagram first drafted by Nasir al-Din al-Tusi in his *Tadhkira fi 'ilm al-hay'a* (1259 CE), illustrating the direct transmission of Islamic mathematics into Renaissance Europe.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l5",
    number: 5,
    title: "The Heliocentric Revolution",
    subtitle: "Aristarchus, Copernicus, and Tycho Brahe's hybrid geoheliocentric cosmos",
    content: {
      explorer: `
### Placing the Sun in the Center

Who first suggested that the Sun, not the Earth, sits at the center?

* **Aristarchus of Samos (c. 270 BCE)**: An ancient Greek thinker who realized the Sun was vastly larger than the Earth, and reasoned that it made more sense for the smaller Earth to orbit the giant Sun! But his idea was rejected because people argued: *"If Earth is flying through space, why don't we feel a giant wind, and why don't the stars shift positions?"*
* **Nicolaus Copernicus (1543)**: In Poland, Copernicus revived the heliocentric (Sun-centered) model. Placing the Sun in the center naturally explained retrograde motion: faster inner planets simply **overtake** slower outer planets on a racetrack!
* **Tycho Brahe (1588)**: The greatest naked-eye observer in history proposed a clever compromise: all the other planets orbit the Sun, but the Sun and Moon orbit the stationary Earth!
      `,
      scholar: `
### Copernicus, Retrograde Geometry, and the Tychonic Compromise

1. **Nicolaus Copernicus (1473–1543)**:
   Published *De revolutionibus orbium coelestium* on his deathbed in 1543.
   - Heliocentrism eliminated the need for giant epicycles to explain retrograde motion: retrograde loops are optical illusions caused by Earth overtaking outer planets.
   - Determined the true relative ordering and orbital distances of the planets from the Sun in Astronomical Units (AU).
   - *Limitation*: Copernicus still clung to perfect circles, forcing him to retain small epicycles to match observational data.

2. **The Stellar Parallax Objection**:
   If Earth moves across an orbit hundreds of millions of kilometers wide, nearby stars should visibly shift against distant stars (stellar parallax). Because ancient and Renaissance telescopes could detect no parallax, critics concluded either the Earth was stationary or the stars were unimaginably far away (which turned out to be true!).

3. **Tycho Brahe's Geoheliocentric Model**:
   Recognizing that parallax was unobserved with his 1-arcminute precision instruments, Tycho placed Earth stationary at the center, orbited by the Sun and Moon, while Mercury, Venus, Mars, Jupiter, and Saturn orbited the Sun. Mathematically, the Tychonic system is identical to the Copernican system for naked-eye planetary coordinates.
      `,
      astrophysicist: `
### Coordinate Transformation: Heliocentric to Geocentric Frame

Let $\\mathbf{r}_{\\text{planet}}(t)$ and $\\mathbf{r}_{\\text{Earth}}(t)$ be the heliocentric position vectors of a planet and the Earth.

The geocentric position observed from Earth is:
$$\\mathbf{r}_{\\text{obs}}(t) = \\mathbf{r}_{\\text{planet}}(t) - \\mathbf{r}_{\\text{Earth}}(t)$$

Differentiating with respect to time yields apparent velocity:
$$\\mathbf{v}_{\\text{obs}}(t) = \\mathbf{v}_{\\text{planet}}(t) - \\mathbf{v}_{\\text{Earth}}(t)$$

At opposition for an outer planet ($r_{\\text{planet}} > r_{\\text{Earth}}$):
$$v_{\\text{obs}} = \\omega_p r_p - \\omega_e r_e = \\sqrt{\\frac{GM_\\odot}{r_p}} - \\sqrt{\\frac{GM_\\odot}{r_e}} < 0$$

Because $\\omega_e > \\omega_p$, the relative apparent velocity becomes negative, generating apparent retrograde motion without requiring mechanical epicycles.

**Stellar Parallax Angle**:
$$\\pi = \\frac{1 \\text{ AU}}{d_\\star}$$
For the nearest star Proxima Centauri ($d \\approx 1.3$ pc), $\\pi = 0.77$ arcseconds—far below Tycho's naked-eye detection threshold of $\\sim 60$ arcseconds, completely resolving the parallax objection.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l6",
    number: 6,
    title: "The Telescopic & Mathematical Breakthrough",
    subtitle: "Galileo's telescope, Kepler's ellipses, and Newton's Universal Gravitation",
    content: {
      explorer: `
### Seeing Is Believing: Galileo, Kepler, and Newton

Between 1609 and 1687, the scientific revolution shattered the ancient cosmos through two breakthroughs: the telescope and calculus!

1. **Johannes Kepler (1609)**: Kepler discovered that planets do not move in perfect circles. They move in **ellipses** (stretched ovals), moving faster when closer to the Sun! This finally made heliocentric calculations 100 times more accurate than Ptolemy.
2. **Galileo Galilei (1610)**: Galileo turned a newly invented telescope to the sky and saw:
   - **Moons orbiting Jupiter**: proving Earth is not the center of all celestial motion!
   - **Phases of Venus**: Venus shows crescent and full phases, impossible in a geocentric model.
   - **Mountains on the Moon**: celestial bodies are rocky worlds, not pristine mythical crystal spheres.
3. **Isaac Newton (1687)**: Newton connected the falling apple to the orbiting Moon with one universal law: **Gravity**! The same force that drops an apple holds planets in their orbits.
      `,
      scholar: `
### Kepler's Laws, Galileo's Evidence, and Newton's Principia

1. **Kepler's Three Laws of Planetary Motion**:
   - **First Law (1609)**: Planets move in ellipses with the Sun at one focus.
   - **Second Law (1609)**: A line connecting the planet and the Sun sweeps out equal areas in equal times.
   - **Third Law (1619)**: The square of the orbital period $P$ is proportional to the cube of the semi-major axis $a$: $P^2 \\propto a^3$.

2. **Galilean Observational Disproof of Geocentrism**:
   - *Phases of Venus*: Ptolemaic geocentrism required Venus to remain between Earth and the Sun, predicting only crescent phases. Galileo observed a gibbous and full Venus, proving it orbits the Sun.
   - *The Medicean Stars*: Four moons orbiting Jupiter demonstrated secondary centers of gravity.

3. **Newtonian Synthesis (1687)**:
   In the *Principia Mathematica*, Sir Isaac Newton united terrestrial and celestial physics:
   $$F = G \\frac{m_1 m_2}{r^2}$$
   Gravity naturally derives all three of Kepler's empirical laws from first physical principles.
      `,
      astrophysicist: `
### Derivation of Keplerian Orbits from Newtonian Gravitation

In a two-body central gravitational potential $V(r) = -GM\\mu/r$, the conservation of energy and angular momentum $\\mathbf{L} = \\mu \\mathbf{r} \\times \\mathbf{v}$ yields:

$$\\frac{d^2 u}{d\\theta^2} + u = \\frac{GM\\mu^2}{L^2}, \\quad \\text{where } u \\equiv \\frac{1}{r}$$

The general solution is a conic section:
$$r(\\theta) = \\frac{p}{1 + e \\cos(\\theta - \\omega)}$$

Where:
* Semi-latus rectum $p = \\frac{L^2}{GM\\mu^2} = a(1 - e^2)$
* Orbital eccentricity $e = \\sqrt{1 + \\frac{2 E L^2}{\\mu (GM\\mu)^2}}$

For bound states ($E < 0$), $0 \\le e < 1$, proving Kepler's First Law.
Conservation of angular momentum $\\frac{dA}{dt} = \\frac{L}{2\\mu} = \\text{constant}$ yields Kepler's Second Law.
Integrating over one full orbit $T = \\frac{2\\pi a b}{L/\\mu}$ proves Kepler's Third Law:
$$T^2 = \\frac{4\\pi^2}{G(M_1 + M_2)} a^3$$
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l7",
    number: 7,
    title: "Mapping the Milky Way & The Great Debate",
    subtitle: "From stellar parallax and Herschel's grindstone to Hubble's island universes",
    content: {
      explorer: `
### Is Our Galaxy the Entire Universe?

For a long time, astronomers thought the Milky Way Galaxy was the whole universe!

* In 1785, **William and Caroline Herschel** counted stars in hundreds of sky directions, realizing the Milky Way was a flattened disc shaped like a giant grindstone.
* In 1838, **Friedrich Bessel** finally measured stellar parallax for star 61 Cygni, proving stars are trillions of miles away.
* **The Great Debate (1920)**: Harlow Shapley argued the Milky Way was immense and the fuzzy "spiral nebulae" were just gas clouds inside it. Heber Curtis argued they were separate, independent **Island Universes** (galaxies) far outside our own!
* **The Verdict (1923)**: **Edwin Hubble** used the 100-inch Hooker telescope to spot Cepheid variable stars in the Andromeda Nebula. He calculated its distance: over 2 million light-years away! Andromeda was a completely separate galaxy—our universe was suddenly billions of times larger than anyone imagined!
      `,
      scholar: `
### Stellar Parallax to the Island Universe Resolution

1. **Stellar Parallax (1838)**:
   Friedrich Bessel measured the annual parallax of 61 Cygni to be $\\pi = 0.31$ arcseconds, corresponding to a distance of ~10.3 light-years. This finally provided direct trigonometric proof of Earth's orbital motion.
2. **The Shapley–Curtis Debate (April 26, 1920)**:
   Held at the Smithsonian Museum of Natural History:
   - *Shapley*: Claimed the Milky Way was 100 kpc across; spiral nebulae were internal.
   - *Curtis*: Claimed the Milky Way was smaller (~10 kpc); spiral nebulae were external galaxies like our own.
3. **Hubble's Discovery (1923–1924)**:
   Using Henrietta Leavitt's Period-Luminosity relationship for Cepheids:
   $$M_V = -2.81 \\log_{10}(P_{\\text{days}}) - 1.43$$
   Hubble identified Cepheid variable V1 in Andromeda (M31), determining its distance exceeded $900$ kpc—vastly outside the Milky Way!
      `,
      astrophysicist: `
### Distance Modulus & The Cepheid Period-Luminosity Calibration

The distance modulus $\\mu$ relates apparent magnitude $m$, absolute magnitude $M$, and luminosity distance $d_L$ in parsecs:

$$\\mu \\equiv m - M = 5 \\log_{10}\\left( \\frac{d_L}{10 \\text{ pc}} \\right) = 5 \\log_{10}(d_L) - 5$$

Henrietta Swan Leavitt (1912) established that classical Cepheid variable pulsation periods $P$ correlate directly with intrinsic luminosity:

$$M_V = \\alpha \\log_{10}(P) + \\beta$$

When Hubble detected Cepheid V1 in M31 with a period of $P = 31.4$ days and mean apparent magnitude $m_V \\approx 18.5$:
$$\\mu \\approx 18.5 - (-5.2) = 23.7 \\implies d_L = 10^{(\\mu + 5)/5} \\approx 550 \\text{ kpc}$$

(Modern calibrated value with dust extinction: $d_{\\text{M31}} = 778 \\pm 17$ kpc). This confirmed that M31 is an autonomous, gravitationally bound stellar system, expanding the observable cosmic volume by orders of magnitude.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m19-l8",
    number: 8,
    title: "Modern Cosmology, Big Bang, Dark Sector & Space Observatories",
    subtitle: "From General Relativity and CMB discovery to the James Webb Space Telescope",
    content: {
      explorer: `
### Modern Cosmology: The Living Universe

In the last 100 years, human understanding of the universe has exploded!

* **Expanding Space (1927–1929)**: Georges Lemaître and Edwin Hubble showed galaxies are moving apart. The universe had a beginning: the Big Bang!
* **Echo of Creation (1965)**: Arno Penzias and Robert Wilson accidentally detected the Cosmic Microwave Background (CMB)—the 13.8-billion-year-old leftover heat from the early universe.
* **Invisible Mass (1970s)**: Vera Rubin discovered dark matter by measuring how fast galaxies spin.
* **Accelerating Expansion (1998)**: Astronomers studying exploding supernovae discovered that Dark Energy is speeding up the expansion of space!
* **Modern Space Observatories (Hubble & JWST)**: Today, space telescopes like the James Webb Space Telescope peer back over 13.5 billion years to photograph the very first galaxies ever formed.
      `,
      scholar: `
### The Concordance Model (ΛCDM) of Modern Cosmology

The modern scientific narrative:

1. **General Relativity & Expanding Universe**:
   Einstein (1915), Friedmann (1922), and Lemaître (1927) replaced static Euclidean space with dynamical expanding spacetime.
2. **Observational Foundations of the Big Bang**:
   - Hubble expansion of galaxies ($v = H_0 d$).
   - Big Bang Nucleosynthesis predicting primordial $75\\%\\text{ H}$ and $25\\%\\text{ He}$.
   - The Cosmic Microwave Background blackbody spectrum ($T = 2.7255$ K), mapped by COBE, WMAP, and Planck.
3. **The Dark Sector**:
   - *Dark Matter* (26.8%): Vera Rubin's flat rotation curves, gravitational lensing, and the Bullet Cluster.
   - *Dark Energy* (68.3%): Type Ia supernova accelerated expansion (Perlmutter, Riess, Schmidt, 1998).
4. **Great Space Observatories**:
   From Hubble and Chandra to the James Webb Space Telescope (JWST) detecting galaxies at $z > 14$ formed just 300 Myr after the Big Bang.
      `,
      astrophysicist: `
### Contemporary Cosmological Frontiers

The current standard $\\Lambda$CDM framework is parameterized by six independent parameters:
* Baryon density: $\\Omega_b h^2 = 0.02237 \\pm 0.00015$
* Cold dark matter density: $\\Omega_c h^2 = 0.1200 \\pm 0.0012$
* Acoustic angular scale: $100 \\theta_\\ast = 1.04092 \\pm 0.00031$
* Optical depth to reionization: $\\tau = 0.054 \\pm 0.007$
* Scalar spectral index: $n_s = 0.9649 \\pm 0.0042$
* Amplitude of curvature perturbations: $\\ln(10^{10} A_s) = 3.044 \\pm 0.014$

**Open Frontiers**:
1. *The Hubble Tension*: $5\\sigma$ discrepancy between early-time CMB ($H_0 = 67.4$) and late-time distance ladder ($H_0 = 73.0$).
2. *Nature of Dark Matter*: WIMPs, axions, or sterile neutrinos vs modified gravity.
3. *Cosmological Constant Problem*: Why $\\rho_\\Lambda$ is $\\sim 120$ orders of magnitude smaller than quantum field theory vacuum energy predictions.
      `,
    },
    readingTimeMinutes: 5,
  },
];

export const MODULE_19_QUIZ: QuizQuestion[] = [
  {
    id: "m19-q1",
    question: "Which of the following is true regarding historical beliefs about Earth's shape?",
    options: [
      "Every ancient culture believed the Earth was flat until Columbus sailed in 1492",
      "Educated Greek and medieval scholars widely knew and proved Earth was spherical over 2,000 years ago",
      "The spherical Earth was only discovered with the invention of the telescope in 1609",
      "Ancient Indian astronomers believed Earth was supported on the back of giant turtles",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Educated scholars from ancient Greece (Pythagoras, Aristotle, Eratosthenes) through the Islamic Golden Age and medieval Europe recognized Earth's sphericity based on lunar eclipse shadows, ship horizons, and pole star elevations.",
    difficulty: "beginner",
  },
  {
    id: "m19-q2",
    question: "How did Eratosthenes calculate the circumference of the Earth around 240 BCE?",
    options: [
      "He sailed all the way around the continent of Africa",
      "He compared the shadow angles of sunlight in Alexandria and Syene at the summer solstice",
      "He used an ancient telescope to measure the Moon's orbital diameter",
      "He measured the speed of sound between mountain peaks",
    ],
    correctAnswerIndex: 1,
    explanation:
      "By measuring the 7.2-degree shadow angle in Alexandria when the Sun was directly overhead in Syene, Eratosthenes determined that the overland distance represented 1/50th of Earth's total circumference.",
    difficulty: "intermediate",
  },
  {
    id: "m19-q3",
    question:
      "What geometric innovation did Ptolemy use to explain apparent retrograde motion in a geocentric universe?",
    options: [
      "Parabolic cometary orbits",
      "Epicycles (small circular orbits whose centers move along a larger deferent circle)",
      "Gravitational deflection from dark matter",
      "Relativistic frame dragging",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Ptolemy's system used epicycles (wheels upon wheels) moving along deferent circles to reproduce the apparent backward loops of planets while maintaining a stationary Earth at the center.",
    difficulty: "intermediate",
  },
  {
    id: "m19-q4",
    question:
      "What did Galileo observe with his telescope that directly contradicted Ptolemaic geocentrism?",
    options: [
      "The full range of phases of Venus and four moons orbiting Jupiter",
      "Distant galaxies colliding at Cosmic Noon",
      "The Cosmic Microwave Background radiation",
      "Gravitational waves rippling through spacetime",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Galileo observed that Venus showed crescent, gibbous, and full phases (proving it orbits the Sun) and discovered four moons orbiting Jupiter (proving secondary centers of motion exist in the cosmos).",
    difficulty: "intermediate",
  },
  {
    id: "m19-q5",
    question:
      "What was the significance of the 13th-century Islamic innovation known as the Tusi Couple?",
    options: [
      "It proved the existence of black holes",
      "It converted circular motion into linear harmonic motion, resolving flaws in Ptolemy and later appearing in Copernicus's work",
      "It proved that light travels at a finite speed",
      "It established the law of universal gravitation",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Invented by Persian astronomer Nasir al-Din al-Tusi at the Maragha Observatory in 1247, the Tusi Couple produced rectilinear motion from two rotating circles, eliminating Ptolemy's equant. Copernicus used the exact same mathematical device in 1543.",
    difficulty: "advanced",
  },
  {
    id: "m19-q6",
    question: "How did Edwin Hubble resolve the 1920 'Great Debate' regarding spiral nebulae?",
    options: [
      "He detected Cepheid variable stars in the Andromeda Nebula, proving it lay far outside the Milky Way as an independent galaxy",
      "He proved that the Milky Way fills the entire infinite universe",
      "He measured the 21 cm radio emissions of neutral hydrogen",
      "He photographed an exoplanet orbiting Proxima Centauri",
    ],
    correctAnswerIndex: 0,
    explanation:
      "In 1923, Hubble discovered Cepheid variable V1 in the Andromeda Nebula. Using Henrietta Leavitt's period-luminosity relation, he calculated that Andromeda was hundreds of thousands of light-years away, confirming the 'island universe' hypothesis.",
    difficulty: "advanced",
  },
];

export const MODULE_19_DISCOVERY_FACTS = [
  {
    title: "The Word 'Planet' Means 'Wanderer'",
    text: "Ancient Greek astronomers noticed five bright stars that did not stay fixed in constellations: Mercury, Venus, Mars, Jupiter, and Saturn. They called them 'planētai', meaning 'wanderers'.",
    icon: "Orbit",
  },
  {
    title: "Aristarchus Proposed Heliocentrism in 270 BCE",
    text: "Over 1,700 years before Copernicus, Aristarchus of Samos calculated that the Sun was vastly larger than Earth, arguing it was illogical for the massive Sun to orbit the tiny Earth!",
    icon: "Sparkles",
  },
  {
    title: "Al-Biruni Calculated Earth's Radius from a Mountain",
    text: "Around 1020 CE in modern Pakistan, Islamic polymath Al-Biruni climbed a mountain, measured the angle of the dip of the horizon with an astrolabe, and computed the Earth's radius to within 1% of modern satellite measurements!",
    icon: "Compass",
  },
  {
    title: "Copernicus Waited Until His Deathbed",
    text: "Nicolaus Copernicus feared ridicule and controversy for proposing that the Earth moved. The very first printed copy of his revolutionary book arrived on the day he died: May 24, 1543.",
    icon: "BookOpen",
  },
];

export const MODULE_19_SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    title: "Almagest (Syntaxis Mathematica)",
    organization: "Claudius Ptolemy (c. 150 CE) / Translated by G. J. Toomer",
    url: "https://archive.org/details/ptolemysalmagest00ptol",
  },
  {
    title: "On the Revolutions of the Heavenly Spheres (De revolutionibus orbium coelestium)",
    organization: "Nicolaus Copernicus (1543) / Johannes Petreius",
    url: "https://www.loc.gov/item/49039755/",
  },
  {
    title: "The Starry Messenger (Sidereus Nuncius)",
    organization: "Galileo Galilei (1610) / Venice",
    url: "https://www.loc.gov/item/45041006/",
  },
  {
    title: "The Scale of the Universe (The Shapley–Curtis Debate)",
    organization: "Bulletin of the National Research Council (1921, Vol. 2, Pt. 3)",
    url: "https://apod.nasa.gov/diamond_jubilee/debate20.html",
  },
  {
    title: "Cepheids in Spiral Nebulae (Andromeda Discovery)",
    organization: "Edwin Hubble (1925) / The Observatory (48, 139)",
    url: "https://ui.adsabs.harvard.edu/abs/1925Obs....48..139H",
  },
];
