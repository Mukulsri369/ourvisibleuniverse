export interface ChapterFaq {
  question: string;
  answer: string;
  curriculumHint?: string;
  relatedConceptId?: string;
}

export const CHAPTER_FAQS: Record<number, ChapterFaq[]> = {
  1: [
    {
      question:
        "Why did prehistoric humans spend so much effort building megaliths like Stonehenge?",
      answer:
        "Before clocks and written calendars existed, observing the positions of the Sun, Moon, and stars was essential for human survival. Megaliths acted as astronomical observatories and seasonal clocks to predict the summer and winter solstices, harvest cycles, and migratory patterns of animals.",
      curriculumHint:
        "Grade 10 Social Science & Physics: Early human technology and observational astronomy",
    },
    {
      question:
        "Did prehistoric people really understand that the Earth is a planet moving through space?",
      answer:
        "No. To ancient observers, the Earth felt immovable and flat underfoot, and the sky seemed like a protective dome or living realm where spirits, gods, and cosmic forces travelled.",
      curriculumHint: "Development of scientific inquiry from myth to empirical observation",
    },
  ],
  2: [
    {
      question:
        "Why did ancient Babylonians and Egyptians think the sky was a giant vault or arching goddess?",
      answer:
        "Ancient peoples reasoned directly from their daily sensory experience. Looking up in an open desert, the sky appears as a curved half-sphere arching from one horizon to the other. In Egyptian cosmology, the sky was personified as Nut, arched over the Earth god Geb.",
      curriculumHint: "Early observational astronomy and cultural worldview frameworks",
    },
    {
      question: "What was the most important scientific contribution of Babylonian astronomers?",
      answer:
        "They pioneered mathematical record-keeping and time division: our 360-degree circle, 60-minute hour, and 60-second minute come directly from Babylonian base-60 sexagesimal mathematics.",
      curriculumHint: "Grade 9–10 Geometry: Origin of 360° coordinate division and angle measures",
    },
  ],
  3: [
    {
      question: "When did educated humans realize that Earth was not flat?",
      answer:
        "By roughly 500–400 BCE, Greek philosophers like Pythagoras and Parmenides realized the Earth was spherical based on ships disappearing hull-first over the horizon, the circular shadow cast during lunar eclipses, and changing visibility of star constellations when traveling north or south.",
      curriculumHint:
        "Grade 9–10 Physics & Geography: Empirical evidence for Earth's spherical shape",
    },
    {
      question: "Why did Aristotle argue that the Earth must be a sphere?",
      answer:
        "Aristotle observed that during a lunar eclipse, the shadow of Earth on the Moon is always circular. Only a sphere casts a circular shadow at every possible orientation.",
      curriculumHint: "Ray optics, shadows, and spherical geometry",
    },
  ],
  4: [
    {
      question: "How did Eratosthenes calculate the size of Earth using just a shadow?",
      answer:
        "In Syene (Aswan), the Sun was directly overhead at noon on the summer solstice (0° shadow). In Alexandria, 5000 stadia to the north, a stick cast a 7.2° shadow (1/50th of a full 360° circle). Using simple alternating interior angles of parallel sun rays, he proved Earth's circumference was 50 × 5000 stadia (~40,000 km), accurate within 1–2%!",
      curriculumHint:
        "Grade 9–10 Mathematics: Alternate interior angles, parallel lines & arc length s = rθ",
      relatedConceptId: "eratosthenes-earth-radius",
    },
    {
      question: "Did Eratosthenes need satellite technology or telescopes to do this?",
      answer:
        "None at all! He used basic Euclidean geometry, parallel sun rays, a measured vertical gnomon (stick), and the travel distance between two cities.",
      curriculumHint: "Scientific methodology and mathematical power of geometric ratios",
      relatedConceptId: "eratosthenes-earth-radius",
    },
  ],
  5: [
    {
      question: "What were Eudoxus's 'homocentric crystalline spheres'?",
      answer:
        "Eudoxus imagined Earth at the center, surrounded by 27 nested, transparent crystal spheres turning inside one another on different axes to mimic the complex wandering paths of the planets.",
      curriculumHint: "Historical geometric models of planetary motion",
    },
    {
      question: "Why was circular motion considered sacred in ancient Greek physics?",
      answer:
        "Greek philosophy held that the celestial realm was eternal, divine, and uncorrupted, and therefore could only move in the 'most perfect and unceasing' geometrical shape: uniform circular motion.",
      curriculumHint: "Philosophical axioms vs empirical observation in the history of science",
    },
  ],
  6: [
    {
      question: "Why was Aristarchus of Samos's sun-centered idea rejected for 1,800 years?",
      answer:
        "Aristarchus (c. 270 BCE) suggested the Earth orbits the Sun, but contemporary Greeks argued: 'If Earth moves, why don't we feel the hurricane-force wind? And why don't we see the stars shift position (parallax)?' Because stars are millions of times farther away than Greeks imagined, stellar parallax was undetectable with the naked eye.",
      curriculumHint:
        "Grade 10 Physics: Relative motion, frames of reference, and stellar parallax",
      relatedConceptId: "stellar-parallax",
    },
    {
      question: "How did Aristarchus calculate that the Sun is much bigger than Earth?",
      answer:
        "By measuring the angle between the Sun and Moon when the Moon was exactly half illuminated (87°), he calculated using right-triangle trigonometry that the Sun was much farther and vastly larger than the Earth, leading him to conclude the larger body should be at the center.",
      curriculumHint: "Trigonometric ratios in astronomical distance estimation",
      relatedConceptId: "heliocentrism",
    },
  ],
  7: [
    {
      question: "What was an 'epicycle' and why did Ptolemy invent it?",
      answer:
        "An epicycle was a small circle whose center rotated along a larger circle ('deferent'). Ptolemy invented it to explain why planets like Mars appear to stop and move backward ('retrograde motion') in the sky while maintaining the assumption that Earth was stationary at the center.",
      curriculumHint: "Grade 10 Science: Planetary retrograde motion and geocentric models",
      relatedConceptId: "epicycles-ptolemy",
    },
    {
      question: "If Ptolemy's model was physically wrong, why did it survive for 1,400 years?",
      answer:
        "Because mathematically, epicycles were accurate enough to calculate planetary positions and eclipses for navigation and astrology, and no better predictive model existed until Kepler and Newton.",
      curriculumHint: "Models in physics: Predictive utility vs physical truth",
      relatedConceptId: "epicycles-ptolemy",
    },
  ],
  8: [
    {
      question: "What was the Tusi Couple invented by Islamic astronomers?",
      answer:
        "Nasir al-Din al-Tusi (1201–1274) proved that a small circle rolling inside a circle of twice its diameter produces straight-line back-and-forth motion. This solved a major flaw in Ptolemy's models and was later used by Copernicus.",
      curriculumHint: "Grade 10–11 Geometry: Cycloids and reciprocal circular-to-linear kinematics",
    },
    {
      question: "How did medieval global astronomers preserve and advance astronomy?",
      answer:
        "Scholars in Baghdad, Maragha, Cairo, and Samarkand translated Greek texts, corrected Ptolemy's calculations with precision observatories, and developed trigonometry and algebra necessary for the Scientific Revolution.",
      curriculumHint: "Historical development of trigonometry in spherical astronomy",
    },
  ],
  9: [
    {
      question: "How did Nicolaus Copernicus explain retrograde motion more simply than Ptolemy?",
      answer:
        "Copernicus realized that retrograde motion is simply an optical illusion caused by Earth overtaking outer planets on an inside orbital track, like a race car passing another car on a circular track.",
      curriculumHint: "Grade 10–11 Physics: Relative velocity and non-inertial reference frames",
      relatedConceptId: "heliocentrism",
    },
    {
      question: "Why did Copernicus still need small circles (epicycles) in his model?",
      answer:
        "Because he still believed planetary orbits were perfect circles. Since real orbits are ellipses, Copernicus had to keep small corrections to match real planetary speeds.",
      curriculumHint: "Transition from Copernican circles to Keplerian ellipses",
      relatedConceptId: "heliocentrism",
    },
  ],
  10: [
    {
      question: "What was Tycho Brahe's compromise 'geoheliocentric' model?",
      answer:
        "Tycho proposed that the Moon and Sun orbit the stationary Earth, but all other planets (Mercury, Venus, Mars, Jupiter, Saturn) orbit the moving Sun. This saved the stationary Earth while explaining planetary phases.",
      curriculumHint: "Scientific debate: Competing hypotheses during observational revolutions",
    },
    {
      question: "Why were Tycho Brahe's observations so important?",
      answer:
        "Tycho made the most precise naked-eye astronomical measurements in human history (accurate to 1–2 arcminutes) over decades, providing the crucial data Johannes Kepler used to discover elliptical orbits.",
      curriculumHint: "Importance of empirical measurement precision and error analysis in physics",
    },
  ],
  11: [
    {
      question: "Why was Kepler's First Law (elliptical orbits) such a radical breakthrough?",
      answer:
        "For 2,000 years, every astronomer assumed heavenly orbits had to be perfect circles. By proving that Mars moves in an ellipse with the Sun at one focus, Kepler shattered the circle dogma and matched reality perfectly.",
      curriculumHint: "Grade 11 Physics: Kepler's First Law and conic sections",
      relatedConceptId: "kepler-laws",
    },
    {
      question: "How does Kepler's Second Law explain why planets speed up near the Sun?",
      answer:
        "The Law of Equal Areas states a line from the Sun to a planet sweeps equal area in equal time. As a planet gets closer (perihelion), the radius shrinks, so it must travel faster along its orbit. This is directly explained by conservation of angular momentum (L = mvr).",
      curriculumHint: "Grade 11 Physics: Conservation of angular momentum in central force fields",
      relatedConceptId: "kepler-laws",
    },
    {
      question: "What is Kepler's Third Law formula and how do we use it?",
      answer:
        "T² ∝ r³ (the square of orbital period T is proportional to the cube of the average distance r). If a planet is 4 times farther from the Sun than Earth, its period is √(4³) = √64 = 8 Earth years!",
      curriculumHint: "Grade 11 Physics: Gravitation calculations and planetary orbital periods",
      relatedConceptId: "kepler-laws",
    },
  ],
  12: [
    {
      question:
        "What did Galileo see through his telescope that disproved the Earth-centered universe?",
      answer:
        "1. Four moons orbiting Jupiter (proving not everything revolves around Earth).\n2. Phases of Venus (crescent and gibbous phases that can only occur if Venus orbits the Sun).\n3. Craters on the Moon and spots on the Sun (proving heavenly bodies are imperfect physical objects, not immaculate spheres).",
      curriculumHint: "Grade 10 Physics: Optical instruments, telescopes, and observational proof",
    },
    {
      question: "Did Galileo invent the telescope?",
      answer:
        "No, Dutch lensmakers invented the spyglass around 1608, but Galileo was the first to substantially improve its optical magnification (up to 30x) and systematically aim it at the night sky for scientific discovery.",
      curriculumHint:
        "Refracting telescopes, convex lenses, and magnification formulas (m = fo / fe)",
    },
  ],
  13: [
    {
      question:
        "How did Isaac Newton explain why the Moon orbits Earth instead of falling straight down?",
      answer:
        "Newton realized the Moon IS constantly falling toward Earth, but because of its high sideways velocity, the Earth's surface curves away at the exact same rate! This is the fundamental principle of all satellite orbits.",
      curriculumHint:
        "Grade 11 Physics: Newton's cannon thought experiment, centripetal acceleration (v²/r = g)",
    },
    {
      question: "What is Newton's Law of Universal Gravitation formula?",
      answer:
        "F = G(m₁m₂) / r². Gravity is directly proportional to the product of masses and inversely proportional to the square of the distance between their centers. Double the distance, and gravity drops to 1/4th.",
      curriculumHint:
        "Grade 11 Physics: Universal Gravitation, inverse square law, and gravitational constant G",
    },
  ],
  14: [
    {
      question: "How did Friedrich Bessel finally measure the distance to a star in 1838?",
      answer:
        "He used stellar parallax: observing star 61 Cygni six months apart when Earth was on opposite sides of its orbit (300 million km apart). The tiny angular shift (0.314 arcseconds) proved geometrically that the star was ~10.3 light-years away.",
      curriculumHint: "Grade 10–11 Trigonometry: d = 1 / p (parsecs and arcseconds)",
      relatedConceptId: "stellar-parallax",
    },
    {
      question: "What is a 'parsec' and how many light-years is it?",
      answer:
        "A parsec ('parallax of one arcsecond') is the distance at which an object has a parallax angle of 1 arcsecond (1/3600 of a degree). 1 parsec ≈ 3.26 light-years ≈ 3.086 × 10¹⁶ meters.",
      curriculumHint: "Astronomical units of distance: AU, light-year, and parsec",
      relatedConceptId: "stellar-parallax",
    },
  ],
  15: [
    {
      question: "What was the famous Shapley-Curtis 'Great Debate' of 1920?",
      answer:
        "Harlow Shapley argued that the Milky Way was the entire universe and fuzzy spiral 'nebulae' were just clouds inside it. Heber Curtis argued that spiral nebulae were separate 'island universes' (entire galaxies) lying far beyond our Milky Way.",
      curriculumHint: "The expanding scale of human understanding: from solar system to galaxies",
    },
    {
      question: "How did Edwin Hubble settle the Great Debate in 1924?",
      answer:
        "Hubble used Henrietta Leavitt's period-luminosity relation for Cepheid variable stars in the Andromeda Nebula (M31) to prove it was roughly 2.5 million light-years away—far outside the Milky Way, confirming Andromeda is a separate galaxy.",
      curriculumHint:
        "Grade 11 Physics: Standard candles, Cepheid variables, and cosmic distance measurement",
    },
  ],
  16: [
    {
      question: "How does Einstein's General Relativity view gravity differently from Newton?",
      answer:
        "Newton viewed gravity as an invisible force pulling objects through flat, passive space. Einstein showed that space and time are woven into a four-dimensional fabric ('spacetime') that gets curved and warped by mass and energy. Objects simply follow straight paths ('geodesics') through curved space.",
      curriculumHint:
        "Grade 11–12 Physics: Comparison of classical Newtonian mechanics vs relativistic spacetime",
      relatedConceptId: "spacetime-curvature",
    },
    {
      question: "How was General Relativity experimentally tested and confirmed?",
      answer:
        "During the 1919 total solar eclipse, Sir Arthur Eddington photographed stars near the Sun. The Sun's gravity bent the starlight by 1.75 arcseconds, exactly matching Einstein's prediction and proving that mass curves spacetime.",
      curriculumHint:
        "Gravitational deflection of light and empirical testing of physical theories",
      relatedConceptId: "gravitational-lensing",
    },
  ],
  17: [
    {
      question: "Who first mathematically proposed that the universe is expanding?",
      answer:
        "Alexander Friedmann (1922) and Georges Lemaître (1927). Lemaître, a Belgian theoretical physicist and Catholic priest, used Einstein's equations to propose that an expanding universe originated from a 'primeval atom'—the first concept of the Big Bang.",
      curriculumHint:
        "Theoretical cosmology: Derivation of expanding spacetime from Einstein's Field Equations",
    },
    {
      question: "Why did Albert Einstein initially resist the idea of an expanding universe?",
      answer:
        "Einstein originally believed the universe was static and eternal. To prevent his equations from predicting expansion or collapse, he added a mathematical term called the 'Cosmological Constant' (Λ), which he later called his 'biggest blunder.'",
      curriculumHint:
        "Cosmological constant and scientific revisions based on observational evidence",
    },
  ],
  18: [
    {
      question: "What is cosmological redshift and how does it prove the universe is expanding?",
      answer:
        "As light travels from distant galaxies through expanding space, the wavelength of the light is physically stretched toward the red end of the spectrum (longer wavelengths). The farther the galaxy, the more space it traveled through, and the greater the redshift (z).",
      curriculumHint:
        "Grade 10–11 Physics: Wave mechanics, Doppler shift vs cosmological wavelength stretching (z = Δλ / λ)",
      relatedConceptId: "redshift",
    },
    {
      question: "What is Hubble's Law (v = H₀ × d)?",
      answer:
        "Recession velocity (v) equals Hubble's constant (H₀) times distance (d). Galaxies twice as far away move away from us twice as fast! This proves that space itself is expanding uniformly everywhere.",
      curriculumHint:
        "Grade 11 Physics: Linear proportionality and measuring the expansion rate of the cosmos",
      relatedConceptId: "redshift",
    },
    {
      question: "Does Hubble's Law mean Earth is the center of the universe?",
      answer:
        "No! Imagine baking a raisin bread dough. As the loaf rises, every single raisin sees every other raisin moving away from it. Every observer in any galaxy sees all other distant galaxies moving away at speeds proportional to distance.",
      curriculumHint:
        "Cosmological principle: The universe is homogeneous and isotropic on large scales",
      relatedConceptId: "redshift",
    },
  ],
  19: [
    {
      question: "What is Big Bang Nucleosynthesis (BBN)?",
      answer:
        "In the first 3 to 20 minutes after the Big Bang, the universe was hot and dense enough to fuse protons and neutrons into hydrogen (~75%), helium-4 (~25%), and small traces of deuterium and lithium.",
      curriculumHint:
        "Grade 11 Chemistry & Physics: Nuclear fusion, proton-neutron balance, and primordial abundance",
      relatedConceptId: "big-bang-nucleosynthesis",
    },
    {
      question: "Where did heavy elements like carbon, iron, and gold come from?",
      answer:
        "They did NOT come from the Big Bang! Carbon and oxygen were forged inside the thermonuclear cores of stars, while iron and gold were created in explosive supernovae and colliding neutron stars. As Carl Sagan said, 'We are made of starstuff.'",
      curriculumHint:
        "Grade 10–11 Chemistry: Stellar nucleosynthesis and origin of elements in the periodic table",
      relatedConceptId: "big-bang-nucleosynthesis",
    },
  ],
  20: [
    {
      question:
        "What is the Cosmic Microwave Background (CMB) and why is it called a 'baby picture' of the universe?",
      answer:
        "380,000 years after the Big Bang, the universe cooled to ~3,000 K, allowing electrons to bind to protons (recombination). Light was released and has traveled for 13.8 billion years, stretched by cosmic expansion into faint microwave radiation (2.7 Kelvin) coming from all directions.",
      curriculumHint:
        "Grade 11 Physics: Blackbody radiation (Wien's Displacement Law & Planck distribution)",
      relatedConceptId: "cosmic-microwave-background",
    },
    {
      question: "How was the CMB discovered by accident in 1965?",
      answer:
        "Arno Penzias and Robert Wilson were testing a sensitive microwave horn antenna at Bell Labs. They heard an persistent background hiss they couldn't eliminate (even after cleaning pigeon droppings from the antenna!). Nearby Princeton physicists realized they had detected the thermal glow of the Big Bang, earning them the 1978 Nobel Prize.",
      curriculumHint: "Experimental physics and observational serendipity",
      relatedConceptId: "cosmic-microwave-background",
    },
  ],
  21: [
    {
      question: "How did Vera Rubin prove that dark matter exists?",
      answer:
        "According to Kepler's and Newton's laws (v = √(GM/r)), stars on the outer edge of a galaxy should orbit much slower than inner stars. Vera Rubin measured galactic rotation curves and found that outer stars move just as fast as inner ones, proving an invisible halo of dark matter provides the missing mass.",
      curriculumHint:
        "Grade 11 Physics: Circular orbital velocity, Newton's law of gravitation, and rotation curves",
      relatedConceptId: "dark-matter",
    },
    {
      question: "Can we see dark matter directly?",
      answer:
        "No. Dark matter does not absorb, reflect, or emit electromagnetic radiation (light, X-rays, radio waves). We only detect it through its gravitational effects on visible stars, galaxies, and the bending of starlight (gravitational lensing).",
      curriculumHint: "Grade 11 Physics: Gravitational interaction vs electromagnetic forces",
      relatedConceptId: "dark-matter",
    },
  ],
  22: [
    {
      question: "What is dark energy and how is it different from dark matter?",
      answer:
        "Dark matter is an attractive gravitational force holding galaxies and clusters together (~27% of cosmos). Dark energy is a repulsive phenomenon stretching space and accelerating cosmic expansion (~68% of cosmos). Together, dark matter and dark energy make up 95% of our universe!",
      curriculumHint:
        "Grade 11 Physics: Attractive vs repulsive cosmic components and cosmic acceleration",
      relatedConceptId: "dark-energy",
    },
    {
      question: "How did astronomers discover that the expansion of the universe is accelerating?",
      answer:
        "In 1998, two independent teams observed distant Type Ia supernovae ('standard candles'). Because they appeared fainter than expected for their redshift, it proved the expansion of the universe has been speeding up over the last 5 billion years.",
      curriculumHint:
        "Grade 11 Physics: Inverse square law for light, apparent magnitude, and standard candles",
      relatedConceptId: "dark-energy",
    },
  ],
  23: [
    {
      question: "What is the Lambda-CDM (ΛCDM) Standard Model of Cosmology?",
      answer:
        "It is the prevailing mathematical model of the universe containing: Λ (Lambda = Dark Energy) and CDM (Cold Dark Matter), alongside ~5% ordinary baryonic matter (atoms, stars, people). It accurately predicts the CMB, galaxy formation, and cosmic acceleration.",
      curriculumHint:
        "Grade 11–12 Physics: Cosmological composition budget and energy density parameters",
      relatedConceptId: "dark-energy",
    },
    {
      question: "What is cosmic inflation in the early universe?",
      answer:
        "Alan Guth proposed that 10⁻³⁶ seconds after the Big Bang, the universe underwent exponential expansion by a factor of at least 10²⁶, explaining why the universe looks so smooth and flat today.",
      curriculumHint:
        "Grade 11–12 Modern Physics: Inflationary cosmology and quantum density fluctuations",
      relatedConceptId: "cosmic-inflation",
    },
  ],
  24: [
    {
      question:
        "If the universe is 13.8 billion years old, why is the observable universe 93 billion light-years across?",
      answer:
        "While light has traveled for 13.8 billion years, the fabric of space itself has been continuously expanding during that journey. A galaxy that emitted light 13.8 billion years ago has been carried away by expanding space to a present distance (proper distance) of approximately 46.5 billion light-years from us in every direction!",
      curriculumHint:
        "Grade 10–11 Physics: Light travel time vs comoving/proper distance in expanding metrics",
      relatedConceptId: "redshift",
    },
    {
      question: "What is the cosmic event horizon?",
      answer:
        "It is the boundary beyond which light emitted today will never reach us, because the expansion of space between us and distant galaxies will permanently outpace the speed of light.",
      curriculumHint: "Astrophysical horizons and the limits of observable space",
    },
  ],
  25: [
    {
      question:
        "Why does the James Webb Space Telescope (JWST) look at the universe in infrared light?",
      answer:
        "Because distant light from the earliest galaxies formed 13 billion years ago has been stretched (redshifted) by the expansion of the universe from visible and ultraviolet wavelengths into the infrared spectrum. Infrared also penetrates dense cosmic dust clouds.",
      curriculumHint:
        "Grade 10–11 Physics: Electromagnetic spectrum, infrared transmission, and cosmic redshift",
      relatedConceptId: "james-webb-telescope",
    },
    {
      question: "Why is JWST stationed 1.5 million kilometers away at Lagrange Point 2 (L2)?",
      answer:
        "At L2, Earth and the Sun stay aligned behind JWST's five-layer sunshield, keeping the scientific instruments cryogenic (-233°C / -388°F) so warm thermal heat from Earth or the Sun doesn't drown out faint infrared starlight.",
      curriculumHint:
        "Grade 11 Physics: Gravitational equilibrium points (Lagrange points) and cryogenic thermal shielding",
      relatedConceptId: "james-webb-telescope",
    },
  ],
  26: [
    {
      question: "What is the 'Hubble Tension' that cosmologists are trying to solve today?",
      answer:
        "When scientists measure the universe's expansion rate using the early universe CMB, they get ~67.4 km/s/Mpc. But when they measure nearby modern stars and supernovae, they get ~73.0 km/s/Mpc. This statistically significant difference suggests our current model might be missing new fundamental physics!",
      curriculumHint:
        "Grade 11–12 Physics: Modern research frontiers and scientific problem-solving",
      relatedConceptId: "redshift",
    },
    {
      question: "Can high school students contribute to cosmic discovery?",
      answer:
        "Yes! Today, citizen science projects like Galaxy Zoo and NASA Citizen Science allow students to analyze real data from Hubble, Webb, and sky surveys, classifying galaxies and discovering exoplanets and asteroids.",
      curriculumHint: "STEM opportunities: Citizen science and scientific exploration",
    },
  ],
};

export const CHAPTER_CONCEPT_IDS: Record<number, string[]> = {
  1: [],
  2: [],
  3: [],
  4: ["eratosthenes-earth-radius"],
  5: ["epicycles-ptolemy"],
  6: ["heliocentrism", "stellar-parallax"],
  7: ["epicycles-ptolemy"],
  8: [],
  9: ["heliocentrism"],
  10: ["heliocentrism"],
  11: ["kepler-laws"],
  12: ["heliocentrism"],
  13: ["spacetime-curvature", "kepler-laws"],
  14: ["stellar-parallax"],
  15: ["stellar-parallax", "redshift"],
  16: ["spacetime-curvature", "gravitational-lensing"],
  17: ["spacetime-curvature", "redshift"],
  18: ["redshift"],
  19: ["big-bang-nucleosynthesis"],
  20: ["cosmic-microwave-background", "redshift"],
  21: ["dark-matter", "gravitational-lensing"],
  22: ["dark-energy", "redshift"],
  23: ["dark-matter", "dark-energy", "cosmic-inflation"],
  24: ["redshift", "cosmic-microwave-background"],
  25: ["james-webb-telescope", "redshift"],
  26: ["dark-matter", "dark-energy", "redshift", "cosmic-inflation"],
};

export function getChapterFaqs(chapterId: number): ChapterFaq[] {
  return CHAPTER_FAQS[chapterId] || [];
}

export function getChapterConceptIds(chapterId: number): string[] {
  return CHAPTER_CONCEPT_IDS[chapterId] || [];
}
