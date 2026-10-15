export interface CosmicConcept {
  id: string;
  title: string;
  gradeLevel: string; // e.g. "Grade 10–11 Physics & Astronomy"
  shortDefinition: string;
  simpleExplanation: string;
  physicsInsight: string;
  schoolCurriculumRelevance: string;
  nasaUrl: string;
  nasaLabel: string;
  wikipediaUrl: string;
  wikipediaLabel: string;
  keywords: string[];
}

export const COSMIC_CONCEPTS: Record<string, CosmicConcept> = {
  redshift: {
    id: "redshift",
    title: "Cosmological Redshift",
    gradeLevel: "Grade 10–11 Physics (Wave Optics & Astrophysics)",
    shortDefinition:
      "The lengthening of light wavelengths toward the red end of the spectrum as space itself stretches between distant galaxies.",
    simpleExplanation:
      "When a train moves away from you, its whistle sounds lower in pitch because the sound waves get stretched (the Doppler effect). Similarly, when light travels across expanding space from distant galaxies, the light waves get physically stretched into longer, redder wavelengths. Cosmological redshift is not galaxies merely speeding through fixed space—it is the fabric of space itself expanding while the light travels through it over millions or billions of years.",
    physicsInsight:
      "Redshift is denoted by z = (λ_observed - λ_emitted) / λ_emitted. For distant galaxies, z > 0 means the wavelength has stretched. Edwin Hubble combined redshift with distance measurements to formulate Hubble's Law: v = H₀ × d.",
    schoolCurriculumRelevance:
      "A core topic in high school electromagnetic spectrum units, Doppler effect modules, and introductory cosmology. Explains the primary observational proof that our universe has been expanding for 13.8 billion years.",
    nasaUrl: "https://science.nasa.gov/universe/exoplanets/what-is-redshift/",
    nasaLabel: "NASA Science: What is Redshift & How Webb Measures It",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Redshift",
    wikipediaLabel: "Wikipedia: Redshift in Astrophysics & Cosmology",
    keywords: ["redshift", "redshifted", "redshifts", "cosmological redshift", "spectral redshift"],
  },

  "cosmic-microwave-background": {
    id: "cosmic-microwave-background",
    title: "Cosmic Microwave Background (CMB)",
    gradeLevel: "Grade 10–11 Physics (Thermal Radiation & Cosmology)",
    shortDefinition:
      "The faint, ubiquitous thermal afterglow left behind from the hot, dense early universe, cooled down over 13.8 billion years to just 2.7 Kelvin.",
    simpleExplanation:
      "Roughly 380,000 years after the Big Bang, the universe cooled enough (to about 3,000 K) for electrons and protons to combine into neutral hydrogen atoms (called 'recombination'). Light, which had previously been trapped bouncing between charged particles, was suddenly free to travel through the universe. As space expanded over the last 13.8 billion years, those original orange/infrared light waves stretched into microwave frequencies, creating a nearly uniform glow in every single direction we point our antennas.",
    physicsInsight:
      "Follows an almost flawless blackbody radiation spectrum matching Planck's Law at T = 2.7255 K. Tiny temperature ripples (anisotropies of 1 part in 100,000) discovered by NASA's COBE, WMAP, and ESA's Planck satellites revealed the primordial seeds of all galaxies.",
    schoolCurriculumRelevance:
      "Illustrates blackbody radiation, thermodynamics of cooling gases, and electromagnetic radiation. Recognized as the definitive 'smoking gun' evidence that validated the Big Bang model over the Steady State theory.",
    nasaUrl: "https://science.nasa.gov/mission/cobe/",
    nasaLabel: "NASA Mission Archives: COBE & Cosmic Microwave Background",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cosmic_microwave_background",
    wikipediaLabel: "Wikipedia: Cosmic Microwave Background Radiation",
    keywords: [
      "cosmic microwave background",
      "cmb",
      "microwave background",
      "recombination",
      "penzias",
    ],
  },

  "dark-matter": {
    id: "dark-matter",
    title: "Dark Matter",
    gradeLevel: "Grade 10–11 Physics (Gravitation & Circular Motion)",
    shortDefinition:
      "An unseen form of matter that emits no light or radiation, detected solely by its immense gravitational pull on visible stars and galaxies.",
    simpleExplanation:
      "According to Newton's and Kepler's laws of gravity, stars on the outer rims of spiral galaxies should orbit much slower than stars near the center, just like Neptune orbits slower than Mercury. But astronomer Vera Rubin observed that outer stars orbit just as fast as inner ones. Galaxies should tear themselves apart unless there is a massive, invisible halo of matter holding them together. We call this mysterious substance dark matter.",
    physicsInsight:
      "Constitutes ~27% of the total energy-mass budget of the cosmos (and ~85% of all matter). Regular baryonic matter (atoms that make up stars, planets, and humans) accounts for only ~5%. Dark matter also bends light around galaxy clusters via gravitational lensing.",
    schoolCurriculumRelevance:
      "Direct application of orbital velocity formulas (v = √(GM/r)) and Keplerian rotation curves in gravitation chapters. Demonstrates how empirical observations challenge and refine scientific models.",
    nasaUrl: "https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-matter/",
    nasaLabel: "NASA Astrophysics: Focus on Dark Matter & Nancy Grace Roman",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Dark_matter",
    wikipediaLabel: "Wikipedia: Dark Matter & Galactic Rotation Curves",
    keywords: ["dark matter", "dark matter halo", "rubin", "rotation curve", "baryonic matter"],
  },

  "dark-energy": {
    id: "dark-energy",
    title: "Dark Energy",
    gradeLevel: "Grade 11–12 Physics (Modern Cosmology & General Relativity)",
    shortDefinition:
      "A mysterious repulsive energy permeating all space, driving the accelerated expansion of the universe against the pull of gravity.",
    simpleExplanation:
      "Until 1998, astronomers assumed that the mutual gravitational pull of all galaxies would gradually slow down cosmic expansion. But when teams measured distant Type Ia exploding stars ('standard candles'), they discovered the galaxies were farther away and dimmer than expected. The expansion is not slowing down—it is speeding up! Scientists named the unknown driving force 'dark energy.'",
    physicsInsight:
      "Accounts for approximately 68% of the universe. In Einstein's field equations, dark energy acts like a positive Cosmological Constant (Λ) with negative pressure, causing spacetime itself to accelerate outward.",
    schoolCurriculumRelevance:
      "Introduced in modern physics units as the 2011 Nobel Prize-winning discovery that revolutionized our understanding of the ultimate fate of the cosmos (the 'Big Freeze').",
    nasaUrl: "https://science.nasa.gov/universe/what-is-dark-energy/",
    nasaLabel: "NASA Science: What is Dark Energy? Exploring Cosmic Acceleration",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Dark_energy",
    wikipediaLabel: "Wikipedia: Dark Energy & Cosmological Constant",
    keywords: [
      "dark energy",
      "accelerated expansion",
      "cosmological constant",
      "type ia supernovae",
    ],
  },

  "gravitational-lensing": {
    id: "gravitational-lensing",
    title: "Gravitational Lensing",
    gradeLevel: "Grade 10–11 Physics (Optics & Einstein's Gravitation)",
    shortDefinition:
      "The bending of light from a distant star or galaxy as it passes through the warped spacetime created by a massive foreground object.",
    simpleExplanation:
      "Just as a glass optical lens bends light rays to form an image, a massive cosmic object like the Sun, a galaxy, or a galaxy cluster warps the surrounding space. When light from a background galaxy passes nearby, its path curves around the mass. From Earth, we see distorted arcs, multiple mirrored images, or even complete glowing rings ('Einstein rings').",
    physicsInsight:
      "Predicted by Albert Einstein in 1915 and famously verified by Arthur Eddington during the 1919 solar eclipse. Modern space telescopes like James Webb and Hubble use gravitational lensing as natural cosmic magnifying glasses to view the earliest stars in the universe.",
    schoolCurriculumRelevance:
      "Connects geometric optics (refraction, focal points, magnification) with modern gravitational physics. Excellent bridge between classical light rays and relativistic spacetime curvature.",
    nasaUrl: "https://science.nasa.gov/missions/hubble/gravitational-lensing/",
    nasaLabel: "NASA Hubble & Webb: Gravitational Lensing Explained",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Gravitational_lens",
    wikipediaLabel: "Wikipedia: Gravitational Lens & Einstein Rings",
    keywords: ["gravitational lensing", "gravitational lens", "einstein ring", "lensing"],
  },

  "spacetime-curvature": {
    id: "spacetime-curvature",
    title: "Spacetime Curvature & General Relativity",
    gradeLevel: "Grade 11 Physics (Mechanics & Gravitational Fields)",
    shortDefinition:
      "Einstein's theory that gravity is not a traditional pulling force, but the warping and curving of four-dimensional spacetime caused by mass and energy.",
    simpleExplanation:
      "Imagine placing a heavy bowling ball onto a stretched rubber trampoline. The ball creates a deep bowl-shaped dip in the fabric. If you roll a marble across the trampoline, the marble doesn't feel a magical invisible pull—it simply follows the curved slope formed by the bowling ball. Einstein showed that the Sun curves the space around it, and planets orbit by following natural straight lines ('geodesics') through that curved geometry.",
    physicsInsight:
      "Expressed in Einstein's Field Equations: G_μν + Λg_μν = (8πG/c⁴) T_μν. 'Spacetime tells matter how to move; matter tells spacetime how to curve' (John Archibald Wheeler).",
    schoolCurriculumRelevance:
      "Contrasts Newtonian universal gravitation (F = G m₁m₂/r²) with Einstein's geometric gravity. Explains the precession of Mercury's orbit and GPS satellite time adjustments.",
    nasaUrl: "https://science.nasa.gov/astrophysics/focus-areas/what-is-general-relativity/",
    nasaLabel: "NASA Science: What Is General Relativity?",
    wikipediaUrl: "https://en.wikipedia.org/wiki/General_relativity",
    wikipediaLabel: "Wikipedia: General Relativity & Curved Spacetime",
    keywords: [
      "spacetime",
      "curvature",
      "general relativity",
      "spacetime curvature",
      "warped space",
    ],
  },

  "epicycles-ptolemy": {
    id: "epicycles-ptolemy",
    title: "Epicycles & Deferents (Ptolemaic System)",
    gradeLevel: "Grade 9–10 Science (History of Scientific Models)",
    shortDefinition:
      "Geometric mini-circles rolling on larger circles invented by ancient Greek astronomers to explain why planets periodically appear to reverse direction in the night sky.",
    simpleExplanation:
      "If you watch Mars against the background stars over several months, it usually drifts eastward, but suddenly slows down, loops backward (retrograde motion), and then resumes moving forward. Because Ptolemy and Aristotle believed the Earth was immobile at the absolute center of the universe and that all heavenly motion must be perfect circles, Ptolemy proposed that planets travel on small spinning circles ('epicycles') whose centers travel along larger orbital circles ('deferents').",
    physicsInsight:
      "Although physically inaccurate, Ptolemy's Almagest (c. 150 CE) was a mathematical tour de force that successfully predicted planetary positions for over 1,400 years until Copernicus and Kepler showed that retrograde motion is an optical perspective effect from Earth overtaking outer planets.",
    schoolCurriculumRelevance:
      "A classic model in science curricula illustrating the scientific method: how humans construct mathematical models to match observations, and how models are eventually overturned by simpler, more comprehensive physical theories (heliocentrism).",
    nasaUrl: "https://science.nasa.gov/resource/retrograde-motion-of-mars/",
    nasaLabel: "NASA Science: The Retrograde Motion of Mars",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Deferent_and_epicycle",
    wikipediaLabel: "Wikipedia: Deferent and Epicycle in Ancient Astronomy",
    keywords: ["epicycle", "epicycles", "deferent", "ptolemaic", "retrograde"],
  },

  heliocentrism: {
    id: "heliocentrism",
    title: "Heliocentrism (Sun-Centered Universe)",
    gradeLevel: "Grade 9–11 Science (Planetary Motion & Gravitation)",
    shortDefinition:
      "The astronomical model placing the Sun at the center of the solar system, with Earth and other planets revolving around it.",
    simpleExplanation:
      "First suggested by Aristarchus of Samos (c. 270 BCE) and mathematically revived by Nicolaus Copernicus in 1543, heliocentrism replaced the Earth-centered (geocentric) view. In this model, retrograde motion is easily understood: Earth is simply orbiting on an inside track faster than Mars, so as we pass Mars, it appears to drift backward against the distant stars, just like a slower car appears to move backward when you pass it on a highway.",
    physicsInsight:
      "Later refined by Johannes Kepler (who showed orbits are ellipses, not perfect circles) and proven physically by Isaac Newton's law of universal gravitation, where the Sun's massive gravitational field anchors all planetary orbits.",
    schoolCurriculumRelevance:
      "Fundamental to all school science curricula worldwide. Marked the birth of the Scientific Revolution and taught students how changing reference frames simplifies complex physical phenomena.",
    nasaUrl: "https://solarsystem.nasa.gov/solar-system/our-solar-system/in-depth/",
    nasaLabel: "NASA Solar System: In-Depth Planetary Orbits",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Heliocentrism",
    wikipediaLabel: "Wikipedia: Heliocentrism & The Copernican Revolution",
    keywords: ["heliocentric", "heliocentrism", "copernican", "copernicus", "aristarchus"],
  },

  "eratosthenes-earth-radius": {
    id: "eratosthenes-earth-radius",
    title: "Eratosthenes' Measurement of Earth's Circumference",
    gradeLevel: "Grade 9–10 Mathematics & Physics (Geometry & Planetary Science)",
    shortDefinition:
      "The ancient Greek calculation of Earth's size using sunlight angles cast by vertical sticks in two Egyptian cities at noon on the summer solstice.",
    simpleExplanation:
      "Around 240 BCE in Alexandria, Egypt, the chief librarian Eratosthenes knew that in Syene (modern Aswan) at noon on the summer solstice, the Sun shone directly down a vertical well without casting a shadow (0° angle). At the exact same time in Alexandria, a vertical pillar cast a shadow measuring roughly 7.2° (which is 1/50th of a full 360° circle). Because the Sun is so far away that its incoming rays are parallel, the angle between the two cities relative to Earth's center had to be 7.2°. By measuring the physical distance between the cities (~5,000 stadia) and multiplying by 50, he calculated Earth's circumference to within ~2% of modern satellite measurements!",
    physicsInsight:
      "Formula: Arc length s = r × θ, or (Distance / Circumference) = (Angle / 360°). Shows how simple Euclidean geometry and empirical measurement can measure an entire planet without leaving home.",
    schoolCurriculumRelevance:
      "A staple of high school geometry and geography curricula. Demonstrates that ancient scholars knew Earth was a sphere over 2,200 years ago.",
    nasaUrl: "https://earthobservatory.nasa.gov/features/Milankovitch/milankovitch_2.php",
    nasaLabel: "NASA Earth Observatory: Earth Shape, Orbit & Tilt",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Eratosthenes#Measurement_of_Earth's_circumference",
    wikipediaLabel: "Wikipedia: Eratosthenes' Measurement of Earth's Circumference",
    keywords: [
      "eratosthenes",
      "circumference",
      "earth radius",
      "alexandria",
      "syene",
      "shadow angle",
    ],
  },

  "kepler-laws": {
    id: "kepler-laws",
    title: "Kepler's Three Laws of Planetary Motion",
    gradeLevel: "Grade 11 Physics (Gravitation & Orbital Mechanics)",
    shortDefinition:
      "The fundamental laws describing how planets travel in elliptical paths around the Sun, sweeping equal areas in equal times, with orbital periods tied to distance.",
    simpleExplanation:
      "1. Law of Ellipses: Every planet moves in an ellipse, with the Sun sitting at one of the two foci (not the exact center).\n2. Law of Equal Areas: A line connecting a planet and the Sun sweeps out equal areas during equal intervals of time. This means planets travel faster when closer to the Sun (perihelion) and slower when farther away (aphelion).\n3. Harmonic Law: The square of a planet's orbital period (T²) is directly proportional to the cube of its semi-major axis (r³), so T² ∝ r³.",
    physicsInsight:
      "Kepler's empirical laws were later derived mathematically from first principles by Isaac Newton combining his inverse-square law of universal gravitation with conservation of angular momentum (L = mvr sinθ = constant).",
    schoolCurriculumRelevance:
      "Found in every Grade 11 Physics curriculum (CBSE, ICSE, AP Physics 1/C, IB Physics). Crucial for calculating satellite orbits, space probe trajectories, and exoplanet distances.",
    nasaUrl: "https://science.nasa.gov/solar-system/keplers-laws/",
    nasaLabel: "NASA Solar System: Kepler's Laws of Planetary Motion",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Kepler%27s_laws_of_planetary_motion",
    wikipediaLabel: "Wikipedia: Kepler's Laws of Planetary Motion",
    keywords: [
      "kepler",
      "keplerian",
      "elliptical",
      "ellipse",
      "equal areas",
      "harmonic law",
      "perihelion",
    ],
  },

  "stellar-parallax": {
    id: "stellar-parallax",
    title: "Stellar Parallax & The Cosmic Distance Ladder",
    gradeLevel: "Grade 10–11 Physics (Optics, Trigonometry & Astronomy)",
    shortDefinition:
      "The apparent shift in a nearby star's position against distant background stars caused by Earth moving from one side of its orbit to the other.",
    simpleExplanation:
      "Hold your thumb up in front of your face and close your left eye, then switch and close your right eye. Your thumb appears to jump side-to-side against the distant wall. Earth does the same thing as it orbits the Sun: when we look at a nearby star in January and again in July (186 million miles away), the star shifts slightly against the background. Friedrich Bessel made the first verified measurement of stellar parallax in 1838 for star 61 Cygni, providing direct geometric proof that Earth orbits the Sun.",
    physicsInsight:
      "Distance in parsecs is d = 1 / p, where p is the parallax angle in arcseconds. One parsec equals approximately 3.26 light-years or 3.086 × 10¹⁶ meters. Modern missions like ESA's Gaia satellite measure parallax angles with micro-arcsecond precision.",
    schoolCurriculumRelevance:
      "Combines right-triangle trigonometry with distance measurement in astronomy. The foundational 'rung 1' of the cosmic distance ladder used to measure the size of the universe.",
    nasaUrl: "https://science.nasa.gov/mission/hubble/science/science-highlights/stellar-parallax/",
    nasaLabel: "NASA Hubble: Measuring Stellar Distances with Parallax",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Stellar_parallax",
    wikipediaLabel: "Wikipedia: Stellar Parallax & Cosmic Distances",
    keywords: ["parallax", "stellar parallax", "bessel", "arcsecond", "parsec"],
  },

  "big-bang-nucleosynthesis": {
    id: "big-bang-nucleosynthesis",
    title: "Big Bang Nucleosynthesis (Cosmic Element Creation)",
    gradeLevel: "Grade 10–11 Chemistry & Physics (Nuclear Physics & Early Universe)",
    shortDefinition:
      "The brief period in the first 3 to 20 minutes of the universe when the cosmos was hot and dense enough for nuclear fusion to forge the first light elements: hydrogen, helium, and trace lithium.",
    simpleExplanation:
      "In the first few minutes after the Big Bang, the entire universe was like the blazing core of a giant star—hot enough for protons and neutrons to fuse. By the time the temperature dropped below fusion levels, the universe had produced roughly 75% hydrogen and 25% helium-4 by mass, with tiny traces of deuterium and lithium. Heavy elements like carbon, oxygen, iron, and gold were forged billions of years later inside the cores of stars and supernova explosions.",
    physicsInsight:
      "The precisely observed 3:1 hydrogen-to-helium ratio across pristine gas clouds in the universe matches the nuclear physics predictions of the Big Bang to extraordinary accuracy, representing one of the major pillars of modern cosmology.",
    schoolCurriculumRelevance:
      "Connects nuclear fusion reactions (¹H + n → ²H, etc.) in high school chemistry and physics with the cosmological origin of the periodic table.",
    nasaUrl: "https://science.nasa.gov/universe/overview/origin-of-elements/",
    nasaLabel: "NASA Science: Where Do Chemical Elements Come From?",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Big_Bang_nucleosynthesis",
    wikipediaLabel: "Wikipedia: Big Bang Nucleosynthesis & Primordial Elements",
    keywords: ["nucleosynthesis", "fusion", "primordial", "helium", "hydrogen ratio"],
  },

  "cosmic-inflation": {
    id: "cosmic-inflation",
    title: "Cosmic Inflation",
    gradeLevel: "Grade 11–12 Physics (Modern Cosmology)",
    shortDefinition:
      "An ultra-rapid, exponential expansion of the universe during the first fraction of a second (10⁻³⁶ to 10⁻³² seconds) after the Big Bang.",
    simpleExplanation:
      "Standard Big Bang theory left two big puzzles: why is the universe so smooth and uniform in temperature everywhere (Horizon Problem), and why is space so geometrically flat (Flatness Problem)? In 1980, physicist Alan Guth proposed that when the universe was smaller than an atomic nucleus, it underwent an unimaginable burst of exponential growth, expanding by a factor of 10²⁶ or more. This stretch flattened space and smoothed out temperature variations across the cosmos.",
    physicsInsight:
      "Quantum fluctuations in the inflaton field were stretched to cosmic scales during inflation. These microscopic quantum ripples became the density seeds that eventually collapsed under gravity to form all the galaxies, stars, and planets we see today.",
    schoolCurriculumRelevance:
      "Explains quantum-to-macro transitions and why our universe is habitable with galaxy clusters instead of empty space or immediate black hole collapse.",
    nasaUrl: "https://science.nasa.gov/universe/the-big-bang/",
    nasaLabel: "NASA Science: Cosmic Inflation & The Big Bang",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Cosmic_inflation",
    wikipediaLabel: "Wikipedia: Cosmic Inflationary Theory",
    keywords: ["inflation", "cosmic inflation", "guth", "exponential expansion", "horizon problem"],
  },

  "james-webb-telescope": {
    id: "james-webb-telescope",
    title: "James Webb Space Telescope (JWST)",
    gradeLevel: "Grade 9–11 Physics (Infrared Optics & Modern Space Exploration)",
    shortDefinition:
      "NASA's premier infrared space observatory with a 6.5-meter golden mirror, orbiting at Lagrange Point 2 (L2) to observe the earliest stars and galaxies formed after the Big Bang.",
    simpleExplanation:
      "Because distant galaxies have had their light stretched (redshifted) by the expansion of the universe over 13 billion years, their ultraviolet and visible light has shifted into the infrared spectrum. The Hubble Space Telescope primarily sees visible and ultraviolet light. Webb was built with 18 gold-coated beryllium hexagonal mirror segments and ultra-cold cryocooled infrared cameras to pierce through cosmic dust and see the first generation of galaxies that formed when the universe was only a few hundred million years old.",
    physicsInsight:
      "Located 1.5 million kilometers (1 million miles) from Earth at the Sun-Earth L2 Lagrange point. Equipped with a five-layer tennis-court-sized sunshield that keeps its scientific instruments at -233°C (-388°F) to eliminate thermal infrared noise.",
    schoolCurriculumRelevance:
      "Prominently featured in current secondary school science curricula and competitive exams as the pinnacle of human engineering, optics, spectroscopy, and exoplanet atmospheric analysis.",
    nasaUrl: "https://webb.nasa.gov/",
    nasaLabel: "NASA Official: James Webb Space Telescope Mission Site",
    wikipediaUrl: "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope",
    wikipediaLabel: "Wikipedia: James Webb Space Telescope Specifications & Discoveries",
    keywords: ["webb", "jwst", "james webb", "infrared telescope", "lagrange point"],
  },
};

export function getConceptById(id: string): CosmicConcept | undefined {
  return COSMIC_CONCEPTS[id];
}

export function findMatchingConcept(text: string): CosmicConcept | undefined {
  const normalized = text.toLowerCase();
  for (const concept of Object.values(COSMIC_CONCEPTS)) {
    if (concept.keywords.some((k) => normalized.includes(k))) {
      return concept;
    }
  }
  return undefined;
}
