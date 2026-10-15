export interface HistoricalSource {
  title: string;
  authorOrOrg: string;
  url: string;
  description: string;
}

export type VisualizerModelType =
  | "ancient_sky_dome"
  | "ancient_layered_worlds"
  | "flat_disk_vs_sphere"
  | "spherical_earth_eratosthenes"
  | "greek_homocentric_spheres"
  | "aristarchus_heliocentric"
  | "ptolemaic_epicycles"
  | "medieval_tusi_couple"
  | "copernican_heliocentric"
  | "tycho_geoheliocentric"
  | "kepler_ellipses"
  | "galileo_telescope"
  | "newton_universal_gravity"
  | "herschel_bessel_milkyway"
  | "shapley_curtis_debate"
  | "einstein_spacetime_curvature"
  | "lemaitre_friedmann_expansion"
  | "hubble_redshift_expansion"
  | "big_bang_nucleosynthesis"
  | "cosmic_microwave_background"
  | "dark_matter_cosmic_web"
  | "dark_energy_acceleration"
  | "lcdm_standard_model"
  | "observable_universe_horizon"
  | "multiwavelength_universe"
  | "cosmic_frontier_unknowns";

export interface HistoryChapter {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  period: string;
  yearDisplay: string;
  yearValue: number; // for numerical timeline sorting / progress
  era:
    | "Ancient & Prehistoric"
    | "Classical Antiquity"
    | "Medieval & Global Astronomy"
    | "Scientific Revolution"
    | "Stellar & Early Modern"
    | "Relativity & Galaxies"
    | "Cosmology & Big Bang"
    | "Contemporary Frontier";
  civilizations: string[];
  keyFigures: string[];
  modelType: VisualizerModelType;
  summary: string;
  historicalContext: string;
  theModel: string;
  supportingEvidence: string;
  limitations: string;
  whatChangedNext: string;
  accuracyNotes: string;
  sources: HistoricalSource[];
  compareWith?: {
    chapterId: number;
    title: string;
    contrast: string;
  };
  visualHighlights: string[];
}

export const HISTORY_CHAPTERS: HistoryChapter[] = [
  {
    id: 1,
    slug: "before-formal-astronomy",
    title: "Before Formal Astronomy",
    subtitle: "The Sky as a Living World of Meaning",
    period: "Prehistoric societies (c. 30,000–3000 BCE)",
    yearDisplay: "c. 30,000–3000 BCE",
    yearValue: -15000,
    era: "Ancient & Prehistoric",
    civilizations: [
      "Paleolithic hunter-gatherers",
      "Neolithic agrarian cultures",
      "Megalithic builders",
    ],
    keyFigures: ["Unknown prehistoric skywatchers", "Lascaux painters", "Stonehenge astronomers"],
    modelType: "ancient_sky_dome",
    summary:
      "Before writing existed, humans tracked celestial rhythms to navigate seasons, migrations, and sacred ceremonies, perceiving the cosmos as an enchanted, living canopy.",
    historicalContext:
      "For tens of thousands of years, survival depended on reading celestial cycles. Lunar markings carved on bones at Blanchard (c. 28,000 BCE), solstice alignments at Göbekli Tepe and Stonehenge, and constellations painted in Upper Paleolithic caves reflect profound observational patience without formal geometric theories.",
    theModel:
      "The night sky was perceived as an active vault overhead. The recurring paths of the Sun, Moon, and visible wandering stars marked cyclical time rather than passive mechanical orbits. Cosmological stories wove sky phenomena into community memory, ethics, and mythology.",
    supportingEvidence:
      "Astronomical alignments of megalithic stone circles (summer/winter solstices), consistent 29.5-day lunar calendar tallies on Upper Paleolithic artifacts, and agricultural cycles tightly synchronized with the heliacal rising of star groups like the Pleiades.",
    limitations:
      "No mathematical geometry or coordinate frameworks; observations were tied to local horizons and interpreted predominantly through mythological and ritual frameworks rather than predictive physical laws.",
    whatChangedNext:
      "The rise of river valley civilizations (Mesopotamia, the Nile, Indus, and Yellow River) brought written records, systematic numerical sky-diaries, and state-sponsored cosmological systems.",
    accuracyNotes:
      "Archaeologists caution against assuming a single universal prehistoric cosmology. Stonehenge and other megaliths demonstrate verified astronomical alignments, but specific theological beliefs of their builders remain prehistoric oral traditions.",
    sources: [
      {
        title: "Archaeoastronomy and the Roots of Science",
        authorOrOrg: "NASA Solar System Exploration",
        url: "https://science.nasa.gov/",
        description:
          "Overview of prehistoric astronomical tracking and solstice alignments across ancient cultures.",
      },
      {
        title: "Stonehenge Astronomical Alignments",
        authorOrOrg: "English Heritage & Royal Astronomical Society",
        url: "https://www.britannica.com/topic/Stonehenge",
        description:
          "Archaeological documentation of midsummer sunrise and midwinter sunset solstice axes at Stonehenge.",
      },
    ],
    visualHighlights: [
      "Diurnal sun arc over ancient megaliths",
      "Moon phase progression (crescent to full)",
      "Seasonal constellation wheel",
      "Horizon solstice alignment markers",
    ],
  },
  {
    id: 2,
    slug: "ancient-cosmologies-ordered-heavens",
    title: "Ancient Cosmologies",
    subtitle: "Ordered Heavens & Layered Worlds",
    period: "Ancient Near East, Egypt, India, and China (c. 3000–600 BCE)",
    yearDisplay: "c. 3000–600 BCE",
    yearValue: -1800,
    era: "Ancient & Prehistoric",
    civilizations: [
      "Mesopotamia (Sumer & Babylon)",
      "Ancient Egypt",
      "Vedic India",
      "Shang & Zhou China",
    ],
    keyFigures: [
      "Babylonian scribes (MUL.APIN authors)",
      "Egyptian temple astronomers",
      "Vedic Rishis",
      "Chinese imperial astrologers",
    ],
    modelType: "ancient_layered_worlds",
    summary:
      "Early urban civilizations developed sophisticated multi-layered cosmologies connecting the observed celestial paths with cosmic order, timekeeping, and state administration.",
    historicalContext:
      "Mesopotamian astronomers created the MUL.APIN star catalogues and 360-degree zodiac; Egyptian priests mapped decan stars to govern nocturnal hours; early Indian Vedic texts described Rta (cosmic rhythmic order); and Chinese observers documented eclipse omens and polar stars around the celestial pivot.",
    theModel:
      "A layered universe where distinct zones housed the underworld, the terrestrial inhabited world, and multiple heavenly tiers. In Mesopotamia, three celestial paths belonged to the gods Anu, Enlil, and Ea; in Egypt, the sky goddess Nut arched over the earth god Geb; in China, the Gaitian model described a canopy covering a square earth.",
    supportingEvidence:
      "Babylonian clay tablets documenting the 18-year Saros eclipse cycle and planetary synodic periods; Egyptian tomb ceilings featuring decanal star clocks; Chinese oracle bones recording supernovae and eclipses back to the 13th century BCE.",
    limitations:
      "These traditions retained layered theological architectures and did not employ 3D Euclidean spherical kinematics or attempt to explain planetary distances physically.",
    whatChangedNext:
      "Greek natural philosophers began asking whether celestial phenomena could be explained by underlying physical principles and pure geometric spheres without mythological intervention.",
    accuracyNotes:
      "Mesopotamian, Egyptian, Indian, and Chinese cosmological models were distinct, highly evolved intellectual frameworks with different mathematical methods, not interchangeable steps in a single ladder.",
    sources: [
      {
        title: "Babylonian Astronomy and Mathematics",
        authorOrOrg: "Encyclopaedia Britannica",
        url: "https://www.britannica.com/science/Babylonian-mathematics",
        description:
          "The mathematical records and planetary ephemerides of Mesopotamian astronomers.",
      },
      {
        title: "Ancient Egyptian Astronomy and Decans",
        authorOrOrg: "Metropolitan Museum & Griffith Observatory",
        url: "https://www.britannica.com/place/ancient-Egypt",
        description:
          "Star clocks, decans, and the cosmological vault in ancient Egyptian temple architecture.",
      },
    ],
    visualHighlights: [
      "Layered celestial realms with heavenly tiers",
      "Three Babylonian deity sky-paths (Enlil, Anu, Ea)",
      "Egyptian arched sky canopy and solar boat",
      "Zodiacal path of planets across the constellations",
    ],
  },
  {
    id: 3,
    slug: "the-flat-earth-idea",
    title: "The Inhabited Disk Idea",
    subtitle: "What Did Ancient Societies Actually Model?",
    period: "Early Antiquity & Premodern Reflections (c. 1200–500 BCE)",
    yearDisplay: "c. 1200–500 BCE",
    yearValue: -800,
    era: "Ancient & Prehistoric",
    civilizations: ["Early Mediterranean", "Homeric Greece", "Ancient Near East"],
    keyFigures: ["Homer", "Thales of Miletus (reconstructed)", "Anaximander"],
    modelType: "flat_disk_vs_sphere",
    summary:
      "While some early poetic traditions depicted the human realm as a disk floating on waters, it was never a universal consensus, and natural observations soon prompted spherical models.",
    historicalContext:
      "Poetic cosmologies in early Greece (Homer, Hesiod) depicted the inhabited earth surrounded by the River Oceanus. However, Anaximander proposed Earth was a cylinder floating freely in space without support, while Thales saw it floating on water. Soon, travelers and mariners noticed empirical discrepancies.",
    theModel:
      "A finite inhabited disk or circular landmass enclosed by an encircling ocean and surmounted by a sky dome. Celestial bodies rose from the eastern waters and set in the western abyss.",
    supportingEvidence:
      "Locally, over small distances (a few kilometers), Earth appears planar to human sight; the horizon seems circular; water in ponds rests flatly in gravity's local normal.",
    limitations:
      "Fails to explain why ships disappear hull-first over the horizon, why the altitude of Polaris changes when traveling north or south, and why Earth's shadow cast upon the Moon during an eclipse is invariably circular.",
    whatChangedNext:
      "Philosophers in Magna Graecia and Athens gathered empirical evidence that could only be satisfied if Earth was a physical sphere suspended in space.",
    accuracyNotes:
      "Historians of science emphasize that the 'Flat Earth myth'—the claim that medieval scholars thought Earth was flat until Columbus—is a 19th-century fabrication. Educated thinkers from Aristotle onward understood Earth was spherical.",
    sources: [
      {
        title: "The Myth of the Flat Earth",
        authorOrOrg: "Jeffrey Burton Russell (Univ. of California / History of Science Society)",
        url: "https://www.britannica.com/topic/flat-Earth",
        description:
          "Historical analysis demonstrating that educated Western thought from classical antiquity through the Middle Ages recognized Earth as a sphere.",
      },
    ],
    compareWith: {
      chapterId: 4,
      title: "The Spherical Earth",
      contrast:
        "Comparing a flat disk horizon cut-off with genuine spherical horizon dip and lunar eclipse curvature.",
    },
    visualHighlights: [
      "Local inhabited disk bounded by ocean",
      "Hull-first ship disappearance over curvature",
      "Changing star elevation with latitude",
      "Curved circular shadow on the eclipsed Moon",
    ],
  },
  {
    id: 4,
    slug: "the-spherical-earth",
    title: "The Spherical Earth",
    subtitle: "Geometry and Aristotle's Empirical Proofs",
    period: "Classical & Hellenistic Greece (c. 500–240 BCE)",
    yearDisplay: "c. 500–240 BCE",
    yearValue: -350,
    era: "Classical Antiquity",
    civilizations: ["Classical Greece", "Hellenistic Egypt (Alexandria)"],
    keyFigures: [
      "Pythagoras",
      "Parmenides",
      "Aristotle (384–322 BCE)",
      "Eratosthenes of Cyrene (c. 276–194 BCE)",
    ],
    modelType: "spherical_earth_eratosthenes",
    summary:
      "Greek thinkers proved Earth is a sphere through lunar eclipse shadows and stellar elevations, and Eratosthenes calculated its circumference with astonishing precision.",
    historicalContext:
      "In 'On the Heavens' (De Caelo, c. 350 BCE), Aristotle presented physical and observational proofs for a spherical Earth. In 240 BCE, Eratosthenes, head librarian of Alexandria, measured solar angles at Syene (Aswan) and Alexandria at noon on the summer solstice, calculating Earth's circumference to within ~1–2% of the true value.",
    theModel:
      "Earth is a spherical globe resting unsupported at the physical center of the universe, surrounded by nested concentric celestial spheres. Gravity pulls heavy elements toward the center of the sphere.",
    supportingEvidence:
      "1. Lunar eclipses always show a circular shadow regardless of Moon angle.\n2. Southern stars (like Canopus) become visible as one travels south, while northern stars sink.\n3. Ships sailing away disappear hull-first, masts last.\n4. Eratosthenes' solar shadow angle difference (7.2° = 1/50 of a circle) over 5,000 stadia.",
    limitations:
      "Assumed Earth was fixed and stationary at the center of the cosmos. Aristotelian physics could not conceive of an Earth moving through space without people and atmosphere flying off.",
    whatChangedNext:
      "Astronomers needed geometric models to explain the baffling irregular motions of planets, which periodically slowed, stopped, and moved backwards (retrograde motion).",
    accuracyNotes:
      "Eratosthenes measured the sun angle difference as 7°12' (1/50th of 360°). Depending on which Attic or Egyptian stadion he used (157.5m to 185m), his result was between 39,375 km and 46,620 km, remarkably close to Earth's equatorial circumference of 40,075 km.",
    sources: [
      {
        title: "Aristotle: On the Heavens (De Caelo)",
        authorOrOrg: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/aristotle-natphil/",
        description:
          "Aristotle's physical and observational proofs for the spherical shape of the Earth.",
      },
      {
        title: "Eratosthenes of Cyrene and the Measurement of the Earth",
        authorOrOrg: "MacTutor History of Mathematics",
        url: "https://www.britannica.com/biography/Eratosthenes",
        description:
          "Mathematical breakdown of Eratosthenes' solar shadow measurement between Syene and Alexandria.",
      },
    ],
    visualHighlights: [
      "Rotating 3D globe with geographic latitudes",
      "Lunar eclipse circular shadow projection",
      "Alexandria vs Syene vertical gnomon shadow angles (7.2°)",
      "Geometric arc ratio: 7.2° / 360° = distance / circumference",
    ],
  },
  {
    id: 5,
    slug: "early-greek-planetary-motion",
    title: "Homocentric Spheres",
    subtitle: "Eudoxus and the Geometry of Retrograde Motion",
    period: "Classical Greece (c. 400–330 BCE)",
    yearDisplay: "c. 380 BCE",
    yearValue: -380,
    era: "Classical Antiquity",
    civilizations: ["Classical Greece (Cnidus & Athens)"],
    keyFigures: ["Eudoxus of Cnidus (c. 390–337 BCE)", "Callippus", "Aristotle"],
    modelType: "greek_homocentric_spheres",
    summary:
      "Eudoxus introduced nested, concentric rotating spheres to explain the mysterious looping backward motions (retrograde loops) of the planets.",
    historicalContext:
      "Plato challenged Greek mathematicians: 'By the assumption of what uniform and orderly motions can the apparent motions of the planets be accounted for?' Eudoxus, an exceptional geometer, solved this with an ingenious mechanical arrangement of nested spheres rotating on tilted axes.",
    theModel:
      "Concentric homocentric crystal spheres, all sharing Earth as their common center. Each planet was carried by three or four nested spheres rotating with uniform speed on different axes. The combination of rotations traced a figure-eight path called the 'hippopede' (horse fetter), recreating apparent retrograde loops.",
    supportingEvidence:
      "Qualitatively accounted for the fact that planets stop and temporarily reverse direction against the background constellations of the zodiac.",
    limitations:
      "Because all spheres were strictly concentric with Earth, a planet's distance from Earth could never vary. Thus, Eudoxus could not explain why planets (especially Mars and Venus) appear noticeably brighter during retrograde motion, nor why solar eclipses are sometimes annular and sometimes total.",
    whatChangedNext:
      "Hellenistic astronomers realized planets must physically change their distance from Earth, leading to eccentric circles, epicycles, and radical heliocentric hypotheses.",
    accuracyNotes:
      "Eudoxus' model was purely mathematical, while Aristotle later treated the spheres as physical, mechanical crystalline shells, complicating the system into 55 interlocking spheres.",
    sources: [
      {
        title: "Eudoxus of Cnidus: Planetary Theory",
        authorOrOrg: "MacTutor History of Mathematics Archive",
        url: "https://www.britannica.com/biography/Eudoxus-of-Cnidus",
        description:
          "Geometric analysis of the nested homocentric spheres and the hippopede curve.",
      },
    ],
    visualHighlights: [
      "Concentric crystal spheres on tilted axes",
      "Hippopede (figure-eight) geometric curve",
      "Apparent planetary retrograde pause and reversal",
      "Central spherical Earth inside nested shells",
    ],
  },
  {
    id: 6,
    slug: "aristarchus-early-heliocentrism",
    title: "Aristarchus' Early Sun-Centred Cosmos",
    subtitle: "The Audacious Third-Century BCE Heliocentric Proposal",
    period: "Hellenistic Mediterranean (c. 270 BCE)",
    yearDisplay: "c. 270 BCE",
    yearValue: -270,
    era: "Classical Antiquity",
    civilizations: ["Hellenistic Greece & Alexandria"],
    keyFigures: [
      "Aristarchus of Samos (c. 310–230 BCE)",
      "Archimedes (The Sand Reckoner)",
      "Seleucus of Seleucia",
    ],
    modelType: "aristarchus_heliocentric",
    summary:
      "Eighteen centuries before Copernicus, Aristarchus proposed that the Sun, not Earth, rests at the center, with Earth both rotating daily and orbiting the Sun yearly.",
    historicalContext:
      "In 'On the Sizes and Distances of the Sun and Moon', Aristarchus calculated through lunar phase geometry that the Sun is vastly larger than Earth. Concluding it was illogical for a colossal Sun to orbit a tiny Earth, he formulated a complete heliocentric model, documented by Archimedes in 'The Sand Reckoner'.",
    theModel:
      "The Sun and fixed stars remain motionless; Earth rotates daily on its axis and orbits the Sun annually along a circular path. The fixed stars are at such an immense distance that Earth's orbit subtends no observable parallax angle.",
    supportingEvidence:
      "Geometric measurements showed the Sun was roughly 20 times farther than the Moon and vastly larger in physical volume (though his angular measurement error underestimated the true scale, his conceptual deduction held).",
    limitations:
      "Rejected by contemporary astronomers because Greek observers could detect no stellar parallax (the shift in apparent star positions as Earth moves). Without telescopes, stars appeared as points with zero measurable shift. Ancient physics also had no concept of inertia to explain why falling objects do not fly backward.",
    whatChangedNext:
      "Without observational evidence for stellar parallax, astronomers preferred mathematically refined Earth-centered models that accurately predicted planetary positions, culminating in Ptolemy.",
    accuracyNotes:
      "Archimedes explicitly confirms Aristarchus' hypothesis: 'Aristarchus of Samos brought out a book consisting of certain hypotheses... that the fixed stars and the Sun remain unmoved, that the Earth revolves about the Sun in the circumference of a circle.'",
    sources: [
      {
        title: "Aristarchus of Samos: The Ancient Copernicus",
        authorOrOrg: "NASA & Encyclopaedia Britannica",
        url: "https://www.britannica.com/biography/Aristarchus-of-Samos",
        description:
          "Documentation of Aristarchus' heliocentric model recorded in Archimedes' Sand Reckoner.",
      },
    ],
    compareWith: {
      chapterId: 7,
      title: "Ptolemy's Geocentric Universe",
      contrast: "Heliocentric simplicity vs the predictive mathematical epicycles of geocentrism.",
    },
    visualHighlights: [
      "Sun fixed at center with orbiting Earth and planets",
      "Daily axial spin of Earth",
      "Absence of naked-eye stellar parallax explained by stellar distance",
      "Comparison with stationary Earth model",
    ],
  },
  {
    id: 7,
    slug: "ptolemy-geocentric-universe",
    title: "Ptolemy's Geocentric Framework",
    subtitle: "Epicycles, Deferents, and 1,400 Years of Planetary Prediction",
    period: "Roman Egypt & Alexandria (c. 150 CE)",
    yearDisplay: "c. 150 CE",
    yearValue: 150,
    era: "Classical Antiquity",
    civilizations: ["Roman Empire", "Hellenistic Egypt"],
    keyFigures: ["Claudius Ptolemy (c. 100–170 CE)", "Hipparchus of Nicaea (predecessor)"],
    modelType: "ptolemaic_epicycles",
    summary:
      "Ptolemy assembled Greek mathematical astronomy into the Almagest, constructing a predictive geocentric system of epicycles and deferents that endured for fourteen centuries.",
    historicalContext:
      "Working in Roman Alexandria around 150 CE, Ptolemy synthesized five centuries of Babylonian observational data and Greek geometry into the 13-volume 'Mathematike Syntaxis' (later known by its Arabic title, 'Almagest', 'The Greatest').",
    theModel:
      "Earth rests stationary near the center of the cosmos. Each planet moves in a small circle called an **epicycle**, whose center revolves along a larger circle called the **deferent**. To match varying speeds, Ptolemy introduced the **eccentric** (off-center Earth) and the **equant** point (from which motion appears uniform).",
    supportingEvidence:
      "It accurately predicted the positions of the planets, Sun, and Moon, explained brightness variations during retrograde motion, and enabled reliable navigation, calendar calculation, and eclipse prediction.",
    limitations:
      "Geometrically complex and philosophically controversial; the equant violated the classical ideal of uniform circular motion around a real physical center. It required separate, uncoupled mathematical models for each planet.",
    whatChangedNext:
      "Over the Middle Ages, astronomers across Islamic observatories and European universities rigorously recalculated, criticized, and refined Ptolemy's parameters, setting the stage for Copernicus.",
    accuracyNotes:
      "Ptolemy did not invent epicycles (Apollonius and Hipparchus used them earlier), but he perfected the mathematical machinery and introduced the equant, achieving unprecedented predictive fidelity.",
    sources: [
      {
        title: "Ptolemy and the Almagest",
        authorOrOrg: "NASA History & Cambridge University",
        url: "https://www.britannica.com/biography/Ptolemy",
        description:
          "The mathematical architecture of deferents, epicycles, and the equant in Ptolemaic astronomy.",
      },
    ],
    visualHighlights: [
      "Large deferent circle with off-center Earth",
      "Epicycle revolving around deferent guide point",
      "Planet tracing a looping retrograde track",
      "Equant point demonstrating non-uniform angular speed",
    ],
  },
  {
    id: 8,
    slug: "astronomy-across-the-medieval-world",
    title: "Astronomy Across the Medieval World",
    subtitle: "Islamic Golden Age, Indian Mathematical Astronomy, and China",
    period: "8th to 15th Centuries CE",
    yearDisplay: "c. 800–1450 CE",
    yearValue: 1100,
    era: "Medieval & Global Astronomy",
    civilizations: [
      "Islamic Caliphates & Persian observatories",
      "Classical & Medieval India",
      "Imperial China",
      "Medieval Europe",
    ],
    keyFigures: [
      "Aryabhata (476–550 CE)",
      "Al-Battani (c. 858–929 CE)",
      "Ibn al-Haytham (Alhazen, 965–1040 CE)",
      "Al-Biruni (973–1050 CE)",
      "Nasir al-Din al-Tusi (1201–1274 CE)",
      "Ulugh Beg (1394–1449 CE)",
    ],
    modelType: "medieval_tusi_couple",
    summary:
      "Astronomers in Baghdad, Maragha, Samarkand, Ujjain, and Kaifeng revolutionized observational instruments, developed trigonometry, and critiqued Ptolemy with ingenious devices like the Tusi Couple.",
    historicalContext:
      "While Europe preserved texts in monasteries, the Islamic Golden Age established grand state observatories (Maragha, Samarkand). Ibn al-Haytham wrote 'Doubts on Ptolemy' (Al-Shukuk 'ala Batlamyus); Aryabhata in India proposed Earth's axial rotation and calculated $\\pi$; and Chinese astronomers catalogued the SN 1054 supernova (Crab Nebula).",
    theModel:
      "Mathematical models designed to eliminate Ptolemy's problematic equant while retaining physical realism. Nasir al-Din al-Tusi developed the **Tusi Couple**: a geometric device where a small circle rotates inside another twice its diameter, producing linear back-and-forth motion from pure circular rotations.",
    supportingEvidence:
      "Astronomers achieved sub-arcminute measurement precision with giant sextants, updated solar apogee drift (al-Battani), mapped over 1,000 stars with unprecedented precision (Ulugh Beg's Zij-i Sultani), and corrected Ptolemy's lunar distance errors.",
    limitations:
      "Most medieval astronomers remained committed to an Earth-centered physics, finding no observational evidence that the heavy Earth was hurtling through empty space.",
    whatChangedNext:
      "Nicolaus Copernicus incorporated mathematical devices directly adapted from the Maragha school (including the Tusi Couple and Urdi lemma) into his revolutionary Sun-centered model in 1543.",
    accuracyNotes:
      "Historians of science (such as Willy Hartner and George Saliba) demonstrated that Copernicus' diagrams of the lunar and planetary mechanisms in 'De revolutionibus' use identical lettering and geometry to Nasir al-Din al-Tusi's and Ibn al-Shatir's Arabic manuscripts.",
    sources: [
      {
        title: "Science and Technology in Medieval Islam",
        authorOrOrg: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/arabic-islamic-natural/",
        description:
          "The Maragha school of astronomy, Ibn al-Haytham, and the mathematical development of the Tusi couple.",
      },
      {
        title: "Aryabhata and Indian Mathematical Astronomy",
        authorOrOrg: "MacTutor History of Mathematics",
        url: "https://www.britannica.com/biography/Aryabhata-I",
        description:
          "Aryabhata's Aryabhatiya (499 CE), axial rotation of the Earth, and planetary ephemerides.",
      },
    ],
    visualHighlights: [
      "The Tusi Couple: small circle rolling inside large circle generating linear motion",
      "Global map of astronomical observatories (Maragha, Samarkand, Ujjain, Kaifeng)",
      "Elimination of Ptolemy's equant using double epicycles",
      "Sub-arcminute astrolabe and giant quadrant simulation",
    ],
  },
  {
    id: 9,
    slug: "copernicus-sun-centred-system",
    title: "Copernicus & the Sun-Centred System",
    subtitle: "The Mathematical Realignment of the Planets",
    period: "Renaissance Europe (1543)",
    yearDisplay: "1543 CE",
    yearValue: 1543,
    era: "Scientific Revolution",
    civilizations: ["Renaissance Poland & Europe"],
    keyFigures: ["Nicolaus Copernicus (1473–1543)", "Georg Joachim Rheticus"],
    modelType: "copernican_heliocentric",
    summary:
      "In De revolutionibus (1543), Copernicus placed the Sun near the center of the cosmos, showing that planetary retrograde motion is a natural optical illusion caused by Earth's orbital motion.",
    historicalContext:
      "Troubled by the equant's violation of uniform circular motion, Polish canon Nicolaus Copernicus worked for three decades on a mathematical alternative. Published on his deathbed in 1543, 'De revolutionibus orbium coelestium' reorganized the cosmos with mathematical elegance.",
    theModel:
      "The Sun is located at the center of the planetary orbits. Earth is simply the third planet, executing three motions: daily axial rotation, annual orbital revolution around the Sun, and axial precession. Planetary speeds decrease naturally with distance from the Sun.",
    supportingEvidence:
      "1. Naturally explained retrograde motion: when faster-moving Earth overtakes slower outer planets (Mars, Jupiter, Saturn), they appear to loop backward against distant stars.\n2. Deduced the true relative distances and periods of all planets for the first time.\n3. Explained why Mercury and Venus never stray far from the Sun in the sky.",
    limitations:
      "Still bound to the classical dogma that heavenly bodies must move in uniform circular paths, Copernicus was forced to retain small epicycles (48 in total) to match observations, and his predictions were initially no more accurate than Ptolemy's.",
    whatChangedNext:
      "Tycho Brahe gathered naked-eye observations an order of magnitude more precise, which Johannes Kepler used to shatter the dogma of circular orbits.",
    accuracyNotes:
      "Copernicus' system was not strictly heliocentric in the modern sense; the geometric center of his planetary circles was not the physical body of the Sun, but an empty point in space near the Sun.",
    sources: [
      {
        title: "Nicolaus Copernicus: De revolutionibus orbium coelestium",
        authorOrOrg: "Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/copernicus/",
        description:
          "Analysis of Copernicus' mathematical model, elimination of the equant, and retrograde motion.",
      },
    ],
    compareWith: {
      chapterId: 7,
      title: "Ptolemy's Geocentric Universe",
      contrast:
        "Comparing retrograde loops as complex epicycles (Ptolemy) vs natural perspective overtaking (Copernicus).",
    },
    visualHighlights: [
      "Sun at the planetary center with orbiting planets in sequence",
      "Earth overtaking Mars in its inner orbit",
      "Sightline projection against distant stellar backdrop tracing retrograde S-loop",
      "Planetary periods scaling outward: Mercury (88d) to Saturn (30y)",
    ],
  },
  {
    id: 10,
    slug: "tycho-brahe-competing-systems",
    title: "Tycho Brahe & the Hybrid Cosmos",
    subtitle: "Precision Observations and the Geoheliocentric Alternative",
    period: "Late 16th Century (c. 1572–1601)",
    yearDisplay: "c. 1588 CE",
    yearValue: 1588,
    era: "Scientific Revolution",
    civilizations: ["Denmark (Hven) & Holy Roman Empire (Prague)"],
    keyFigures: ["Tycho Brahe (1546–1601)", "Sophia Brahe"],
    modelType: "tycho_geoheliocentric",
    summary:
      "Tycho Brahe achieved unprecedented naked-eye observational precision and proposed an influential hybrid model: Earth remains stationary while planets orbit the Sun, which orbits Earth.",
    historicalContext:
      "From his state-of-the-art observatory Uraniborg on the island of Hven, Danish nobleman Tycho Brahe measured celestial positions with precision under 2 arcminutes. His discovery of the 1572 supernova and the 1577 comet proved that the heavens are not immutable crystalline spheres, but change and allow bodies to pass through them.",
    theModel:
      "The **Tychonic System**: Earth is stationary at the center, orbited by the Moon and the Sun. Meanwhile, all other planets (Mercury, Venus, Mars, Jupiter, Saturn) orbit the moving Sun. Mathematically, it is geometrically identical to the Copernican system for planetary positions, but avoids Earth's motion.",
    supportingEvidence:
      "1. Consistent with the stubborn failure to measure any stellar parallax with naked-eye instruments.\n2. Preserved the intuitive Aristotelian physics of a stationary Earth.\n3. Accounted for planetary brightness variations and retrograde loops identically to Copernicus.",
    limitations:
      "An awkward hybrid compromise: why should five planets be bound to the Sun while the Sun is bound to Earth? It could not provide a unified physical dynamical mechanism.",
    whatChangedNext:
      "On his deathbed in Prague, Tycho entrusted his priceless Mars observation notebooks to his young assistant, Johannes Kepler, who used them to uncover the true laws of planetary motion.",
    accuracyNotes:
      "Tycho calculated that if Copernicus were right and stars showed no parallax, the stars would have to be mind-bogglingly distant, and based on their apparent optical disk size, individual stars would need to be larger than Earth's entire orbit—an objection valid until the wave theory of light proved star disks are Airy diffraction patterns.",
    sources: [
      {
        title: "Tycho Brahe: Uraniborg and Geoheliocentrism",
        authorOrOrg: "NASA & Galileo Project",
        url: "https://www.britannica.com/biography/Tycho-Brahe-Danish-astronomer",
        description:
          "The observational achievements of Tycho Brahe and the geometry of the Tychonic planetary system.",
      },
    ],
    visualHighlights: [
      "Stationary Earth orbited by Moon and Sun",
      "Mercury, Venus, Mars, Jupiter orbiting the mobile Sun",
      "Interlocking orbital circles intersecting in space",
      "Geometric equivalence of apparent angles compared to Copernican model",
    ],
  },
  {
    id: 11,
    slug: "kepler-elliptical-orbits",
    title: "Kepler's Elliptical Orbits",
    subtitle: "The Three Laws that Unveiled Real Planetary Motion",
    period: "Early 17th Century (1609–1619)",
    yearDisplay: "1609–1619 CE",
    yearValue: 1609,
    era: "Scientific Revolution",
    civilizations: ["Holy Roman Empire (Prague & Linz)"],
    keyFigures: ["Johannes Kepler (1571–1630)"],
    modelType: "kepler_ellipses",
    summary:
      "By analyzing Tycho's Mars observations, Kepler broke the 2,000-year dogma of circular motion, proving planets move in ellipses with varying speeds governed by exact mathematical laws.",
    historicalContext:
      "Kepler spent eight years trying to fit Tycho's Mars data to circles. A discrepancy of just 8 arcminutes—an error impossible in Tycho's observations—forced Kepler to abandon circular orbits: 'If I had believed that we could ignore these eight minutes, I would have patched up my hypothesis... But since they could not be ignored, these eight minutes alone opened the way to a complete revolution in astronomy.'",
    theModel:
      "**Kepler's Three Laws**:\n1. **First Law (1609)**: Planets move in ellipses with the Sun at one focus.\n2. **Second Law (1609)**: A line connecting a planet to the Sun sweeps out equal areas in equal intervals of time (faster at perihelion, slower at aphelion).\n3. **Third Law (1619)**: The square of the orbital period ($P^2$) is directly proportional to the cube of the semi-major axis ($a^3$).",
    supportingEvidence:
      "Accurately predicted the 1631 transit of Mercury across the Sun (observed by Pierre Gassendi), proving planetary positions with tenfold greater precision than any prior table in human history.",
    limitations:
      "Kepler's laws described *how* planets move geometrically and kinematically, but could not explain *why*—what invisible physical force pulled them into ellipses and governed their speeds.",
    whatChangedNext:
      "Isaac Newton formulated universal gravitation, deriving all three of Kepler's empirical laws from a single inverse-square gravitational force.",
    accuracyNotes:
      "Kepler initially sought mystical geometric harmonies (the nested Platonic solids in 'Mysterium Cosmographicum'), but his intellectual honesty drove him to follow observational empirical data wherever it led, birthing modern astrophysics.",
    sources: [
      {
        title: "Kepler's Laws of Planetary Motion",
        authorOrOrg: "NASA Solar System Exploration",
        url: "https://science.nasa.gov/learn/basics-of-space-flight/chapter-4-mechanics/",
        description:
          "Official NASA guide to Kepler's three laws of orbital mechanics and elliptical orbital geometry.",
      },
    ],
    visualHighlights: [
      "Elliptical planetary orbit with eccentric focus",
      "Varying orbital velocity: speeding up at perihelion, slowing at aphelion",
      "Animated swept-area sector demonstration of Kepler's 2nd Law",
      "Orbital period scaling vs distance: P² ∝ a³",
    ],
  },
  {
    id: 12,
    slug: "galileo-telescopic-universe",
    title: "Galileo & the Telescopic Universe",
    subtitle: "New Moons, Venus Phases, and Empirical Shocks",
    period: "Early 17th Century (1609–1616)",
    yearDisplay: "1610 CE",
    yearValue: 1610,
    era: "Scientific Revolution",
    civilizations: ["Republic of Venice & Grand Duchy of Tuscany (Italy)"],
    keyFigures: ["Galileo Galilei (1564–1642)"],
    modelType: "galileo_telescope",
    summary:
      "Turning his improved spyglass to the heavens in 1609, Galileo shattered classical cosmology by discovering moons orbiting Jupiter, mountains on the Moon, and full phases of Venus.",
    historicalContext:
      "In Venice and Padua, Galileo improved Hans Lippershey's spyglass into a 20x astronomical telescope. In March 1610, he published 'Sidereus Nuncius' (The Starry Messenger), stunning the world with discoveries that directly contradicted Aristotelian dogma.",
    theModel:
      "Direct empirical revelations supporting the Copernican architecture:\n1. **Phases of Venus**: Venus displays a complete cycle of phases (crescent, gibbous, full) with size inversely proportional to illumination, impossible in Ptolemy's model and proving Venus circles the Sun.\n2. **Moons of Jupiter**: Four moons (Io, Europa, Ganymede, Callisto) clearly orbit Jupiter, proving Earth is not the sole center of all cosmic revolution.\n3. **Lunar mountains and sunspots**: Celestial bodies are not pristine, unblemished crystalline spheres, but geological worlds with rugged terrains.",
    supportingEvidence:
      "Direct optical observations witnessed through telescopes by astronomers across Europe, including Jesuit mathematicians at the Collegio Romano.",
    limitations:
      "Telescopic observations alone could not physically prove that Earth was in motion, nor explain why people did not feel the motion, leading to the Inquisition's 1633 trial of Galileo for defending Copernicanism.",
    whatChangedNext:
      "Galileo formulated the law of inertia and classical relativity in 'Dialogue Concerning the Two Chief World Systems' (1632), laying the foundation for Newton's synthesis.",
    accuracyNotes:
      "While Venus phases ruled out Ptolemy's pure geocentric model, they were compatible with Tycho Brahe's geoheliocentric system. Thus, Galileo's Venus observations proved heliocentrism over Ptolemy, but did not immediately rule out the Tychonic alternative until Newtonian physics triumphed.",
    sources: [
      {
        title: "The Galileo Project: Telescopic Discoveries",
        authorOrOrg: "Rice University / NASA",
        url: "https://www.britannica.com/biography/Galileo-Galilei",
        description:
          "Documentation of Galileo's Sidereus Nuncius observations: Jupiter's moons, Venus phases, and lunar craters.",
      },
    ],
    visualHighlights: [
      "Simulated historic 20x telescope eyepiece view",
      "Four Galilean moons orbiting Jupiter over successive nights",
      "Full sequence of Venus phases from crescent to gibbous",
      "Lunar terminator revealing shadow-casting mountains",
    ],
  },
  {
    id: 13,
    slug: "newton-universal-gravitation",
    title: "Newton's Universal Gravitation",
    subtitle: "One Law for the Apple and the Moon",
    period: "Late 17th Century (1687)",
    yearDisplay: "1687 CE",
    yearValue: 1687,
    era: "Scientific Revolution",
    civilizations: ["England & Western Europe"],
    keyFigures: ["Isaac Newton (1642–1727)", "Edmond Halley", "Robert Hooke"],
    modelType: "newton_universal_gravity",
    summary:
      "Newton's Principia (1687) united terrestrial physics and celestial motions under universal gravitation, demonstrating that falling apples and orbiting planets obey identical physical laws.",
    historicalContext:
      "Encouraged by Edmond Halley, Isaac Newton published 'Philosophiae Naturalis Principia Mathematica'. Newton formulated three laws of motion, invented calculus, and derived Kepler's orbital laws directly from an inverse-square gravitational attraction.",
    theModel:
      "Every mass in the universe attracts every other mass with a force directly proportional to the product of their masses and inversely proportional to the square of the distance between them:\n$$F = G \\frac{m_1 m_2}{r^2}$$\nPlanets orbit because they are in continuous free-fall around the Sun; their forward velocity keeps them from crashing inward.",
    supportingEvidence:
      "1. Mathematical derivation of all three Keplerian orbital laws.\n2. Explanation of ocean tides caused by gravitational pulls of Moon and Sun.\n3. Accurate prediction of the return of Halley's Comet in 1758.\n4. Discovery of Neptune in 1846 by Le Verrier and Adams through perturbations in Uranus' orbit.",
    limitations:
      "Newton could not explain *how* gravity acted instantaneously across empty space ('action at a distance'). Furthermore, precise 19th-century measurements revealed that Mercury's perihelion was precessing by an extra 43 arcseconds per century that Newton's equations could not account for.",
    whatChangedNext:
      "In 1915, Albert Einstein replaced gravitational force with the curvature of four-dimensional spacetime in General Relativity.",
    accuracyNotes:
      "Newton's famous cannon thought experiment illustrated the continuity between terrestrial projectiles and celestial satellites: firing a cannonball fast enough (~7.9 km/s on Earth) makes its trajectory curve at the same rate Earth curves beneath it, creating an artificial satellite.",
    sources: [
      {
        title: "Newton's Laws of Motion and Universal Gravitation",
        authorOrOrg: "NASA Glenn Research Center",
        url: "https://www.grc.nasa.gov/www/k-12/airplane/newton.html",
        description:
          "Official NASA guide to Newtonian gravitational physics, orbital velocity, and celestial mechanics.",
      },
    ],
    visualHighlights: [
      "Newton's orbital cannonball thought experiment",
      "Trajectory transition: suborbital arc to circular orbit to escape hyperbola",
      "Inverse-square gravitational force vectors (F ∝ 1/r²)",
      "Planetary orbital free-fall balance",
    ],
  },
  {
    id: 14,
    slug: "universe-expands-beyond-solar-system",
    title: "Beyond the Solar System",
    subtitle: "Mapping the Milky Way and the First Star Distances",
    period: "18th to mid-19th Century (1785–1838)",
    yearDisplay: "1785–1838 CE",
    yearValue: 1810,
    era: "Stellar & Early Modern",
    civilizations: ["Great Britain & Germany"],
    keyFigures: [
      "William Herschel (1738–1822)",
      "Caroline Herschel (1750–1848)",
      "Friedrich Bessel (1784–1846)",
      "Thomas Henderson",
      "Friedrich von Struve",
    ],
    modelType: "herschel_bessel_milkyway",
    summary:
      "William and Caroline Herschel star-gauged the Milky Way as a flattened stellar disk, and Friedrich Bessel measured the first stellar parallax in 1838, proving stars are suns light-years away.",
    historicalContext:
      "With colossal 20-foot and 40-foot reflecting telescopes, the Herschels counted stars along 683 sightlines, deducing that our galaxy is a flattened 'grindstone' of suns. In 1838, Bessel measured the minuscule parallax shift of 61 Cygni ($0.314''$), proving it lay 10.3 light-years away and finally verifying Aristarchus' missing parallax.",
    theModel:
      "The universe is not confined to the solar system. The Sun is one of millions of stars arranged in a flattened disk—the Milky Way. Interstellar space is vast, measured in trillions of kilometers (light-years).",
    supportingEvidence:
      "1. Stellar star-counts revealing the disk-like concentration of stars along the Milky Way band.\n2. Friedrich Bessel's measurement of 61 Cygni's trigonometric parallax (1838).\n3. Thomas Henderson's measurement of Alpha Centauri's parallax (1839).",
    limitations:
      "Because interstellar dust was unknown, Herschel's star counts were dimmed by obscuring dust clouds, leading him to wrongly place our Sun near the center of the Milky Way. Whether 'spiral nebulae' were within our galaxy or external 'island universes' remained unresolved.",
    whatChangedNext:
      "In 1920, the Great Debate erupted over whether the Milky Way encompassed the entire cosmos, until Edwin Hubble used Cepheid variables to prove spiral nebulae are distant external galaxies.",
    accuracyNotes:
      "Herschel's 'grindstone' model measured only about 8,000 light-years across. We now know interstellar dust extinction blinded early astronomers to 90% of the Milky Way, which is actually over 100,000 light-years in diameter.",
    sources: [
      {
        title: "William Herschel and the Construction of the Heavens",
        authorOrOrg: "Royal Astronomical Society & NASA ADS",
        url: "https://www.britannica.com/biography/William-Herschel",
        description:
          "The Herschel star gauges, the grindstone model of the Milky Way, and early galactic astronomy.",
      },
      {
        title: "Bessel and the Measurement of Stellar Parallax",
        authorOrOrg: "European Space Agency (ESA) Hipparcos Archive",
        url: "https://www.esa.int/",
        description:
          "The history of trigonometric stellar parallax from Bessel's 61 Cygni measurement to space astrometry.",
      },
    ],
    visualHighlights: [
      "Zoom out from the solar system to interstellar star clusters",
      "William Herschel's historical cross-section of the Milky Way",
      "Trigonometric stellar parallax angle triangle (Earth-Sun baseline)",
      "True interstellar distances revealed in light-years",
    ],
  },
  {
    id: 15,
    slug: "shapley-curtis-debate-scale-of-universe",
    title: "The Scale of the Universe",
    subtitle: "The 1920 Shapley–Curtis Debate and Island Universes",
    period: "Early 20th Century (1920–1924)",
    yearDisplay: "1920–1924 CE",
    yearValue: 1920,
    era: "Relativity & Galaxies",
    civilizations: ["United States (Smithsonian & Mount Wilson Observatory)"],
    keyFigures: [
      "Harlow Shapley (1885–1972)",
      "Heber Curtis (1872–1942)",
      "Henrietta Swan Leavitt (1868–1921)",
      "Edwin Hubble (1889–1953)",
    ],
    modelType: "shapley_curtis_debate",
    summary:
      "At the Smithsonian in 1920, astronomers debated whether the Milky Way is the whole universe or merely one island galaxy among millions; Hubble settled it with Cepheid variable stars in 1924.",
    historicalContext:
      "On April 26, 1920, Harlow Shapley argued the Milky Way was immense (300,000 light-years across) and contained all observed spiral nebulae. Heber Curtis countered that the Milky Way was smaller, and spiral nebulae like Andromeda were independent external galaxies ('island universes', an idea tracing back to Immanuel Kant).",
    theModel:
      "The cosmos contains billions of distinct, vast stellar systems (galaxies) separated by millions of light-years of intergalactic space. The Milky Way is merely one ordinary spiral galaxy in an ocean of galaxies.",
    supportingEvidence:
      "In October 1923, Edwin Hubble used the 100-inch Hooker Telescope at Mount Wilson to identify a Cepheid variable star (V1) in the Andromeda 'Nebula'. Applying Henrietta Leavitt's period-luminosity relation, Hubble calculated Andromeda was nearly 1 million light-years away (modern value: 2.5 million ly), far outside the Milky Way.",
    limitations:
      "Knowing galaxies were distant did not yet reveal whether the universe was static, eternal, expanding, or evolving over time.",
    whatChangedNext:
      "Astronomers measuring galaxy spectral lines discovered that almost all distant galaxies are redshifted and rushing away from us, revealing an expanding universe.",
    accuracyNotes:
      "Henrietta Swan Leavitt's 1912 discovery that brighter Cepheids pulse more slowly provided the essential 'standard candle' without which Hubble could never have measured extragalactic distances.",
    sources: [
      {
        title: "The Great Debate of 1920",
        authorOrOrg: "NASA Goddard Space Flight Center",
        url: "https://apod.nasa.gov/diamond_jubilee/debate20.html",
        description:
          "Official NASA archival transcription and analysis of the 1920 Shapley-Curtis debate on the scale of the universe.",
      },
      {
        title: "Hubble's Variable Star V1 in Andromeda",
        authorOrOrg: "NASA Hubble Site",
        url: "https://science.nasa.gov/mission/hubble/",
        description:
          "How Edwin Hubble's photograph of Cepheid V1 in M31 proved Andromeda is an independent galaxy.",
      },
    ],
    visualHighlights: [
      "The Great Debate: Shapley's single mega-galaxy vs Curtis' island universes",
      "Henrietta Leavitt's Cepheid variable period-luminosity pulsation curve",
      "Zoom from the Milky Way across intergalactic space to Andromeda (M31)",
      "The true scale of the cosmic neighborhood",
    ],
  },
  {
    id: 16,
    slug: "einstein-relativity-dynamical-universe",
    title: "Einstein's Curved Spacetime",
    subtitle: "General Relativity and the Fate of a Static Cosmos",
    period: "Early 20th Century (1915–1917)",
    yearDisplay: "1915–1917 CE",
    yearValue: 1915,
    era: "Relativity & Galaxies",
    civilizations: ["Germany & Switzerland"],
    keyFigures: ["Albert Einstein (1879–1955)", "Arthur Eddington", "Karl Schwarzschild"],
    modelType: "einstein_spacetime_curvature",
    summary:
      "Einstein revealed that gravity is not an invisible force, but the curvature of four-dimensional spacetime caused by mass and energy, transforming cosmology into an exact physical science.",
    historicalContext:
      "In November 1915, Albert Einstein published the field equations of General Relativity. In 1917, seeking to apply his equations to the entire universe, Einstein was troubled to find that gravity should cause all matter to collapse inward. Believing the cosmos was eternal and static, he introduced the **cosmological constant** ($\\Lambda$) to counteract gravity.",
    theModel:
      "Matter and energy tell spacetime how to curve; curved spacetime tells matter how to move ($G_{\\mu\\nu} + \\Lambda g_{\\mu\\nu} = \\frac{8\\pi G}{c^4} T_{\\mu\\nu}$). The universe is a continuous 4D geometric manifold whose global geometry is determined by its total density.",
    supportingEvidence:
      "1. Exactly explained Mercury's anomalous 43 arcsecond/century perihelion precession.\n2. Arthur Eddington's 1919 solar eclipse expedition confirmed that the Sun's mass bends starlight by exactly 1.75 arcseconds.\n3. Gravitational redshift of light confirmed in laboratory and stellar observations.",
    limitations:
      "Einstein's static model was unstable: the slightest perturbation would cause it to either rapidly expand or collapse. Einstein later called the cosmological constant his 'greatest blunder' when cosmic expansion was confirmed.",
    whatChangedNext:
      "Alexander Friedmann and Georges Lemaître realized that Einstein's unadulterated equations naturally predicted an expanding or contracting universe.",
    accuracyNotes:
      "Popular visual depictions often show spacetime as a rubber sheet bent downward by gravity; scientifically, curvature occurs in both space and time dimensions, and geodesics represent straight paths through curved 4D spacetime.",
    sources: [
      {
        title: "Einstein's General Relativity and Gravitational Physics",
        authorOrOrg: "NASA & Stanford Gravity Probe B",
        url: "https://www.britannica.com/science/general-relativity",
        description:
          "The foundations of general relativity, spacetime curvature, and the 1919 Eddington starlight deflection test.",
      },
    ],
    visualHighlights: [
      "4D spacetime curvature grid warping around mass",
      "Starlight bending around the Sun observed during a solar eclipse",
      "Planetary geodesic orbits following spacetime contours",
      "Einstein's static balance vs dynamic instability",
    ],
  },
  {
    id: 17,
    slug: "lemaitre-friedmann-expanding-universe",
    title: "Lemaître, Friedmann & the Expanding Universe",
    subtitle: "The Theoretical Discovery of Dynamic Space",
    period: "1920s (1922–1927)",
    yearDisplay: "1922–1927 CE",
    yearValue: 1925,
    era: "Cosmology & Big Bang",
    civilizations: ["Soviet Union (Saint Petersburg) & Belgium (Leuven)"],
    keyFigures: [
      "Alexander Friedmann (1888–1925)",
      "Georges Lemaître (1894–1966)",
      "Willem de Sitter",
    ],
    modelType: "lemaitre_friedmann_expansion",
    summary:
      "Friedmann and Lemaître solved Einstein's gravitational equations without a static fudge-factor, proving mathematically that space itself can expand, contract, or evolve from an initial point.",
    historicalContext:
      "In 1922, Russian mathematician Alexander Friedmann published non-static solutions to general relativity. In 1927, Belgian priest and theoretical physicist Georges Lemaître independently derived expanding universe solutions and proposed that the cosmos began in a primeval explosion—the 'primeval atom' (l'atome primitif).",
    theModel:
      "The universe is homogeneous and isotropic on large scales (the Cosmological Principle). The metric of space is dynamic: the physical distance between unaccelerated galaxies increases as the **cosmic scale factor** $a(t)$ grows over cosmic time. Space itself is stretching, not galaxies flying through static empty space.",
    supportingEvidence:
      "Provided the exact mathematical foundation needed to interpret the astronomical redshifts being observed by Vesto Slipher and Edwin Hubble.",
    limitations:
      "Initially dismissed by Einstein ('Your mathematics is correct, but your physics is abominable') until astronomical observational data forced the scientific community to accept expansion.",
    whatChangedNext:
      "Edwin Hubble and Milton Humason gathered the systematic observational data that proved cosmic expansion in 1929.",
    accuracyNotes:
      "In 2018, the International Astronomical Union (IAU) voted to officially rename the expansion law the **Hubble–Lemaître Law**, recognizing Georges Lemaître's 1927 publication where he calculated the expansion rate two years before Hubble.",
    sources: [
      {
        title: "IAU Resolution: Renaming Hubble Law to Hubble-Lemaître Law",
        authorOrOrg: "International Astronomical Union (IAU)",
        url: "https://www.iau.org/news/pressreleases/detail/iau1812/",
        description:
          "Official IAU documentation crediting Georges Lemaître's 1927 discovery of the expansion of the universe.",
      },
    ],
    visualHighlights: [
      "Dynamic coordinate grid expanding smoothly in all directions",
      "Cosmic scale factor a(t) stretching intergalactic space",
      "No central explosion: every galaxy sees other galaxies moving away",
      "Comparison of open, closed, and flat spacetime expansion curves",
    ],
  },
  {
    id: 18,
    slug: "hubble-observational-expansion",
    title: "Hubble & the Observational Expansion",
    subtitle: "Redshifts and the Hubble–Lemaître Law",
    period: "Late 1920s to early 1930s (1929–1931)",
    yearDisplay: "1929 CE",
    yearValue: 1929,
    era: "Cosmology & Big Bang",
    civilizations: ["United States (Mount Wilson Observatory)"],
    keyFigures: [
      "Edwin Hubble (1889–1953)",
      "Milton Humason (1891–1972)",
      "Vesto Slipher (1875–1969)",
      "Henrietta Leavitt",
    ],
    modelType: "hubble_redshift_expansion",
    summary:
      "In 1929, Hubble and Humason compared galaxy distances with spectral redshifts, discovering a linear velocity-distance relation: the farther away a galaxy is, the faster it recedes.",
    historicalContext:
      "Vesto Slipher at Lowell Observatory had measured Doppler spectral shifts in 41 nebulae, finding almost all were shifted toward the red (receding at hundreds of kilometers per second). Hubble and Humason measured their distances with the 100-inch telescope, plotting velocity against distance in 1929.",
    theModel:
      "**The Hubble–Lemaître Law**:\n$$v = H_0 \\cdot d$$\nRecession velocity ($v$) is directly proportional to proper distance ($d$), where $H_0$ is the Hubble constant. This is the observational signature of a uniformly expanding metric of space.",
    supportingEvidence:
      "Spectroscopic absorption lines (such as Hydrogen-alpha and Calcium H & K lines) systematically shifted toward longer, redder wavelengths for increasingly distant galaxies in every direction in the sky.",
    limitations:
      "Early distance calibration errors (confusing Type I and Type II Cepheids) led Hubble to estimate $H_0 \\approx 500$ km/s/Mpc, which implied an impossible cosmic age of only 2 billion years (younger than Earth's oldest rocks!). Subsequent calibration resolved this to ~70 km/s/Mpc.",
    whatChangedNext:
      "If the universe is expanding today, rewinding the cosmic clock leads backward in time to an epoch of extreme heat and density: the Big Bang.",
    accuracyNotes:
      "Cosmological redshift is not an ordinary Doppler shift from motion through space; it is caused by the wavelength of light stretching along with the metric expansion of space as the photon travels across intergalactic distances ($1+z = a_{\\text{now}} / a_{\\text{then}}$).",
    sources: [
      {
        title: "A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae",
        authorOrOrg: "Edwin Hubble (PNAS 1929) / NASA ADS",
        url: "https://science.nasa.gov/mission/hubble/",
        description:
          "The landmark 1929 paper establishing observational evidence for an expanding universe.",
      },
    ],
    visualHighlights: [
      "Interactive Hubble Law scatter plot (Recession Velocity vs Distance)",
      "Spectral absorption lines shifting from violet toward red with distance",
      "Doppler vs cosmological expansion wave stretching",
      "Linear regression slope demonstrating Hubble constant H₀",
    ],
  },
  {
    id: 19,
    slug: "the-big-bang-model",
    title: "The Big Bang Model",
    subtitle: "From a Primordial Hot Plasma to Matter and Stars",
    period: "Mid-20th Century (1940s–1950s)",
    yearDisplay: "1948 CE",
    yearValue: 1948,
    era: "Cosmology & Big Bang",
    civilizations: ["United States & International Astrophysics"],
    keyFigures: [
      "George Gamow (1904–1968)",
      "Ralph Alpher (1921–2007)",
      "Robert Herman (1914–1997)",
      "Fred Hoyle (who coined the term 'Big Bang')",
    ],
    modelType: "big_bang_nucleosynthesis",
    summary:
      "The Big Bang is not an explosion into pre-existing space, but the expansion of space itself from an initial hot, dense state, accurately predicting the primordial abundances of hydrogen and helium.",
    historicalContext:
      "In the famous 1948 $\\alpha\\beta\\gamma$ (Alpher-Bethe-Gamow) paper, George Gamow and Ralph Alpher applied nuclear physics to the early expanding universe, calculating the synthesis of light chemical elements during the first three minutes of cosmic time.",
    theModel:
      "The universe expanded and cooled from an initial ultra-hot, ultra-dense state roughly 13.8 billion years ago. Key milestones:\n1. **Planck & Inflationary epochs**: Space undergoes rapid expansion.\n2. **Big Bang Nucleosynthesis ($t \\approx 3$ minutes)**: Protons and neutrons fuse into light nuclei (~75% Hydrogen, ~25% Helium-4, traces of Deuterium and Lithium).\n3. **Recombination ($t \\approx 380,000$ years)**: Electrons bind with nuclei to form neutral atoms, letting photons fly free as the Cosmic Microwave Background.",
    supportingEvidence:
      "The observed cosmic primordial mass fractions—precisely ~75% Hydrogen and ~25% Helium in pristine gas clouds—cannot be produced by stars (which only fuse a few percent), exactly matching theoretical nucleosynthesis predictions.",
    limitations:
      "Competed bitterly with Fred Hoyle's Steady State model until 1965. Classical general relativity breaks down at $t=0$ in a gravitational singularity, indicating that a quantum theory of gravity is required to describe the initial instant.",
    whatChangedNext:
      "In 1965, the definitive predicted afterglow of the Big Bang—the Cosmic Microwave Background radiation—was discovered serendipitously.",
    accuracyNotes:
      "CRITICAL SCIENTIFIC CORRECTION: The Big Bang was NOT a localized bomb exploding outward from a center into surrounding empty darkness. It was the simultaneous expansion of all space everywhere, beginning from a state of nearly infinite temperature and density.",
    sources: [
      {
        title: "Big Bang Nucleosynthesis and Primordial Elements",
        authorOrOrg: "NASA WMAP Science Team",
        url: "https://map.gsfc.nasa.gov/universe/bb_elements.html",
        description:
          "Official NASA explanation of primordial nucleosynthesis, hydrogen-helium ratios, and the expanding early universe.",
      },
    ],
    visualHighlights: [
      "Cosmic timeline: hot quark-gluon plasma to atomic recombination",
      "Fusion of protons and neutrons into Helium nuclei at t = 3 minutes",
      "Photons decoupling from plasma as neutral atoms form (universe becomes transparent)",
      "Expansion of space everywhere without a single central blast point",
    ],
  },
  {
    id: 20,
    slug: "cosmic-microwave-background",
    title: "The Cosmic Microwave Background",
    subtitle: "The 380,000-Year-Old Afterglow of the Cosmos",
    period: "1965 to Present",
    yearDisplay: "1965 CE",
    yearValue: 1965,
    era: "Cosmology & Big Bang",
    civilizations: ["United States (Bell Labs, Princeton) & Space Agencies (NASA, ESA)"],
    keyFigures: [
      "Arno Penzias (1933–2024)",
      "Robert Wilson (b. 1936)",
      "Robert Dicke",
      "Jim Peebles (Nobel Prize 2019)",
      "John Mather & George Smoot (COBE Nobel 2006)",
    ],
    modelType: "cosmic_microwave_background",
    summary:
      "Discovered in 1965, the Cosmic Microwave Background is the cooled thermal remnant of the early universe, carrying microkelvin temperature ripples that seeded all galaxies.",
    historicalContext:
      "At Bell Laboratories in Holmdel, New Jersey, Arno Penzias and Robert Wilson tested a sensitive 20-foot horn antenna and detected an isotropic, persistent microwave hiss (at $\\lambda = 7.35$ cm) that came from all directions day and night. Princeton physicists confirmed it was the redshifted afterglow of the Big Bang, earning Penzias and Wilson the 1978 Nobel Prize.",
    theModel:
      'An almost perfectly uniform thermal blackbody radiation field at $T = 2.7255 \\text{ K}$ permeating all of space. Tiny temperature fluctuations ($"\\Delta T / T \\approx 10^{-5}"$) reveal density variations in the primordial plasma 380,000 years after the Big Bang, which gravity amplified into galaxies and cosmic filaments.',
    supportingEvidence:
      "1. COBE satellite (1992): Measured the most precise blackbody spectrum in physics history and detected primordial temperature ripples.\n2. WMAP (2003) and Planck (2013–2018): Mapped temperature and polarization fluctuations across the full sky, determining cosmic age ($13.797 \\pm 0.023$ Gyr) and composition.",
    limitations:
      "Raised deep questions: why is the CMB so uniform across regions that could never have communicated at the speed of light? (The Horizon Problem), prompting the theory of Cosmic Inflation.",
    whatChangedNext:
      "Measurements of the CMB acoustic peaks, combined with galaxy cluster surveys, proved that ordinary atoms make up less than 5% of the total energy density, with the rest dominated by dark matter and dark energy.",
    accuracyNotes:
      "The famous oval all-sky CMB maps are Mollweide projections of temperature variations measuring just microkelvins ($\\pm 200 \\,\\mu\\text{K}$) against a uniform 2.7255 K background, with the bright Milky Way foreground mathematically subtracted.",
    sources: [
      {
        title: "Planck Mission: Cosmic Microwave Background",
        authorOrOrg: "European Space Agency (ESA)",
        url: "https://www.esa.int/Science_Exploration/Space_Science/Planck_overview",
        description:
          "Official ESA documentation of the Planck satellite's full-sky CMB temperature and polarization survey.",
      },
      {
        title: "WMAP's Introduction to the CMB",
        authorOrOrg: "NASA Goddard Space Flight Center",
        url: "https://map.gsfc.nasa.gov/universe/bb_tests_cmb.html",
        description:
          "The physics of cosmic recombination, acoustic peaks, and the cosmic microwave background.",
      },
    ],
    visualHighlights: [
      "Mollweide full-sky projection of CMB acoustic fluctuations",
      "Cold blue and warm red temperature micro-ripples (ΔT/T ≈ 10⁻⁵)",
      "Perfect 2.7255 K Planck blackbody radiation curve",
      "Acoustic density wave seeds collapsing into first galaxies",
    ],
  },
  {
    id: 21,
    slug: "dark-matter-and-the-cosmic-web",
    title: "Dark Matter & the Cosmic Web",
    subtitle: "The Invisible Scaffolding of the Universe",
    period: "1930s to Present (Major consolidation 1970s–1980s)",
    yearDisplay: "1933–1980s CE",
    yearValue: 1975,
    era: "Cosmology & Big Bang",
    civilizations: ["United States, Switzerland, International"],
    keyFigures: [
      "Fritz Zwicky (1898–1974)",
      "Vera Rubin (1928–2016)",
      "Kent Ford",
      "Jeremiah Ostriker",
      "Carlos Frenk",
    ],
    modelType: "dark_matter_cosmic_web",
    summary:
      "Vera Rubin's galaxy rotation curves and gravitational lensing proved that 85% of cosmic matter is non-luminous 'dark matter', forming a vast filamentary web that guides galaxy formation.",
    historicalContext:
      "In 1933, Fritz Zwicky noticed galaxies in the Coma cluster were moving far too fast to be held by visible stars alone, coining the term 'dunkle Materie' (dark matter). In the 1970s, Vera Rubin and Kent Ford measured flat rotation curves in spiral galaxies: outer stars orbit just as fast as inner stars, proving a massive unseen halo surrounds every galaxy.",
    theModel:
      "Cold Dark Matter (CDM): non-baryonic, collisionless matter that interacts almost exclusively via gravity. Dark matter collapsed under gravity into a filamentary 'cosmic web' of sheets, filaments, and nodes, inside which ordinary gas cooled to ignite the first stars and galaxies.",
    supportingEvidence:
      "1. Flat galaxy rotation curves extending far beyond the visible starlight.\n2. Gravitational lensing: massive galaxy clusters bend background starlight, allowing astronomers to map dark matter distributions directly.\n3. The Bullet Cluster (1E 0657-56): during a collision between two clusters, hot gas collided and slowed, while dark matter passed straight through without friction, observed by Chandra X-ray and gravitational lensing.\n4. CMB acoustic power spectrum peak ratios.",
    limitations:
      "Despite extensive particle physics searches (LUX-ZEPLIN, XENONnT, CERN LHC), dark matter particles (WIMPs, axions, or sterile neutrinos) have not yet been directly detected in the laboratory.",
    whatChangedNext:
      "While dark matter was pulling galaxies together, astronomers in 1998 made a shocking discovery: the overall expansion of the universe is not slowing down—it is accelerating.",
    accuracyNotes:
      "Alternative theories such as MOND (Modified Newtonian Dynamics) attempt to explain flat rotation curves without dark matter by altering gravity at low accelerations, but struggle to reproduce the Bullet Cluster and the detailed CMB acoustic peaks.",
    sources: [
      {
        title: "Vera Rubin and the Discovery of Dark Matter",
        authorOrOrg: "NASA & American Museum of Natural History",
        url: "https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-matter",
        description:
          "Official NASA overview of dark matter evidence from rotation curves, gravitational lensing, and cosmic web simulations.",
      },
      {
        title: "The Bullet Cluster: Direct Proof of Dark Matter",
        authorOrOrg: "NASA Chandra X-Ray Observatory",
        url: "https://chandra.harvard.edu/press/06_releases/press_082106.html",
        description:
          "Observation of spatial separation between normal gas and dark matter in colliding galaxy clusters.",
      },
    ],
    visualHighlights: [
      "Galaxy rotation curve: Flat observed speed vs Keplerian falling curve",
      "3D filamentary cosmic web with galaxy cluster nodes and giant voids",
      "Gravitational lensing arc distorting background starlight",
      "Dark matter halo surrounding visible spiral galactic disk",
    ],
  },
  {
    id: 22,
    slug: "accelerating-expansion-and-dark-energy",
    title: "Accelerating Expansion & Dark Energy",
    subtitle: "The 1998 Supernova Revolution and the Repulsive Cosmos",
    period: "1998 to Present",
    yearDisplay: "1998 CE",
    yearValue: 1998,
    era: "Cosmology & Big Bang",
    civilizations: ["United States, Australia, International"],
    keyFigures: [
      "Saul Perlmutter (b. 1959)",
      "Brian Schmidt (b. 1967)",
      "Adam Riess (b. 1969)",
      "Supernova Cosmology Project & High-Z Supernova Search Team",
    ],
    modelType: "dark_energy_acceleration",
    summary:
      "In 1998, two rival teams measuring distant Type Ia supernovae discovered that cosmic expansion is speeding up, driven by a mysterious smooth repulsive pressure dubbed 'dark energy'.",
    historicalContext:
      "Cosmologists expected gravity to gradually slow the expansion of the universe. In 1998, the High-Z Supernova Team (led by Schmidt and Riess) and the Supernova Cosmology Project (led by Perlmutter) measured distances to distant Type Ia supernovae ('exploding white dwarf standard candles'). Both teams found the supernovae were ~20% fainter than expected—space had expanded faster than anticipated.",
    theModel:
      "Accelerating cosmic expansion driven by **Dark Energy**, which contributes approximately 68% of the universe's total energy density. The simplest mathematical representation is Einstein's reinstated **cosmological constant** ($\\Lambda$), representing a constant vacuum energy with negative pressure ($w = -1$).",
    supportingEvidence:
      '1. Independent Type Ia supernova surveys over redshifts $z = 0.1$ to $z > 1.5$.\n2. Baryon Acoustic Oscillations (BAO) measured by the Sloan Digital Sky Survey (SDSS) and DESI.\n3. The CMB acoustic peaks, which require a flat spatial universe ($"\\Omega_k \\approx 0"$) that cannot be accounted for by matter alone.\n4. Growth of large-scale cosmic structure.',
    limitations:
      "The physical nature of dark energy remains one of the greatest unsolved mysteries in all of science. Theoretical calculations of quantum vacuum energy yield a discrepancy of $\\sim 10^{120}$ ('the worst prediction in theoretical physics').",
    whatChangedNext:
      "The combination of dark energy, cold dark matter, and ordinary baryonic matter forged our current standard cosmological model: $\\Lambda$CDM.",
    accuracyNotes:
      "Dark energy does not overcome gravity within gravitationally bound systems (such as the solar system, Earth, or the Milky Way); its repulsive effect operates across cosmological scales where gravity between separated galaxy clusters is weak.",
    sources: [
      {
        title: "The Nobel Prize in Physics 2011: Accelerating Universe",
        authorOrOrg: "The Nobel Foundation",
        url: "https://www.nobelprize.org/prizes/physics/2011/press-release/",
        description:
          "Official Nobel citation and scientific background for the discovery of the accelerating expansion of the universe.",
      },
      {
        title: "Dark Energy and Dark Matter Overview",
        authorOrOrg: "NASA Science Astrophysics",
        url: "https://science.nasa.gov/astrophysics/focus-areas/what-is-dark-energy",
        description:
          "NASA's comprehensive guide to the evidence for dark energy and accelerating cosmic expansion.",
      },
    ],
    visualHighlights: [
      "Supernova Type Ia Hubble diagram showing acceleration curve",
      "Scale factor a(t) timeline: deceleration transitioning to acceleration ~5 Gyr ago",
      "Cosmic tug-of-war: gravitational matter pulling in vs dark energy pushing out",
      "Faintness of distant standard candle supernovae",
    ],
  },
  {
    id: 23,
    slug: "modern-standard-cosmological-model",
    title: "The Modern Standard Model (ΛCDM)",
    subtitle: "Precision Cosmology and the Concordance Universe",
    period: "Late 20th Century to Present (2000s–2020s)",
    yearDisplay: "21st Century",
    yearValue: 2020,
    era: "Contemporary Frontier",
    civilizations: ["Global Scientific Community (NASA, ESA, ESO, DESI, JWST)"],
    keyFigures: [
      "Jim Peebles",
      "Planck Science Collaboration",
      "Sloan Digital Sky Survey (SDSS)",
      "Dark Energy Spectroscopic Instrument (DESI)",
    ],
    modelType: "lcdm_standard_model",
    summary:
      "The Lambda-Cold Dark Matter (ΛCDM) model describes a 13.8-billion-year-old spatially flat universe consisting of 68.3% dark energy, 26.8% dark matter, and only 4.9% ordinary atoms.",
    historicalContext:
      "Over the past twenty-five years, data from space observatories (Hubble, WMAP, Planck, JWST) and ground surveys (SDSS, DES, DESI) converged on an extraordinarily consistent, parameter-constrained model of the cosmos.",
    theModel:
      "**The $\\Lambda$CDM Concordance Model**:\n- **Spacial Geometry**: Spatially flat ($\\Omega_k = 0.0007 \\pm 0.0019$).\n- **Cosmic Inventory** (Planck 2018):\n  - **Dark Energy ($\\Lambda$)**: **68.3%**\n  - **Cold Dark Matter (CDM)**: **26.8%**\n  - **Baryonic Matter (Atoms)**: **4.9%** (stars, planets, gas, humans)\n  - **Radiation & Neutrinos**: **< 0.1%**\n- **Age of the Universe**: **$13.797 \\pm 0.023$ billion years**.",
    supportingEvidence:
      "Precision alignment across multiple independent cosmic tests: the angular scale of CMB acoustic peaks, the distance scale of Type Ia supernovae, Big Bang nucleosynthesis light-element yields, and 3D baryon acoustic oscillation surveys mapping tens of millions of galaxies.",
    limitations:
      "The **Hubble Tension**: local measurements of the expansion rate using Cepheids and supernovae yield $H_0 \\approx 73.0 \\pm 1.0$ km/s/Mpc, while CMB measurements from the early universe predict $H_0 \\approx 67.4 \\pm 0.5$ km/s/Mpc. This $5\\sigma$ statistical discrepancy may point to new physics beyond $\\Lambda$CDM.",
    whatChangedNext:
      "Cosmologists must reconcile the finite observable universe accessible to our telescopes with the potentially boundless reality of the unobservable universe beyond.",
    accuracyNotes:
      "All quoted percentages are derived from the European Space Agency Planck Collaboration 2018 final legacy cosmological parameter releases and are consistent with modern astrophysics standards.",
    sources: [
      {
        title: "Planck 2018 Results: Cosmological Parameters",
        authorOrOrg: "Astronomy & Astrophysics / European Space Agency",
        url: "https://www.esa.int/Science_Exploration/Space_Science/Planck_overview",
        description:
          "Official published Planck legacy parameters: age 13.797 Gyr, 68.3% dark energy, 26.8% dark matter, 4.9% baryonic matter.",
      },
    ],
    visualHighlights: [
      "Interactive cosmic composition breakdown: 68.3% Dark Energy, 26.8% Dark Matter, 4.9% Atoms",
      "Cosmological parameter dashboard: H₀, Age, Flatness, Baryon density",
      "The Hubble Tension comparison: Early CMB (67.4) vs Late Local Ladder (73.0)",
      "3D galaxy distribution slice from modern cosmological surveys",
    ],
  },
  {
    id: 24,
    slug: "observable-universe-and-limits-of-observation",
    title: "The Observable Horizon",
    subtitle: "The Cosmic Boundary and the Limits of Sight",
    period: "Modern Cosmology",
    yearDisplay: "Present Day",
    yearValue: 2024,
    era: "Contemporary Frontier",
    civilizations: ["Global Astrophysics & Philosophy of Cosmology"],
    keyFigures: ["Cosmological Horizon Theorists", "Theoretical Cosmologists"],
    modelType: "observable_universe_horizon",
    summary:
      "Because the universe has a finite age of 13.8 billion years and light has a finite speed, we can only observe a finite bubble: the observable universe, currently ~93 billion light-years across.",
    historicalContext:
      "In an expanding universe, light emitted 13.8 billion years ago comes from matter that has since been carried much farther away by metric expansion. The particle horizon defines the boundary of the observable universe—the farthest distance from which light could have reached us since the Big Bang.",
    theModel:
      "The **Observable Universe** is a sphere centered on the observer with a comoving radius of approximately **46.5 billion light-years** (diameter: **~93 billion light-years**, or $\\sim 8.8 \\times 10^{26}$ meters), containing an estimated **2 trillion galaxies**.\n\n**CRITICAL SCIENTIFIC DISTINCTION**: The observable horizon is NOT a physical wall or the edge of all existence! It is simply an optical light-travel limit relative to Earth's vantage point. An observer located in a distant galaxy 40 billion light-years away sees their own 93-billion-light-year observable sphere overlapping with ours.",
    supportingEvidence:
      "Relativistic cosmological kinematics derived from general relativity and verified by the redshift of the cosmic microwave background ($z \\approx 1100$).",
    limitations:
      "We cannot receive electromagnetic signals from beyond the particle horizon. Whether the entire physical universe beyond our observable bubble is spatially finite (like a 3-torus) or mathematically infinite remains an open scientific question.",
    whatChangedNext:
      "To peer as close to the horizon as physically possible, astronomers built revolutionary space telescopes that see across all wavelengths of light.",
    accuracyNotes:
      "A common misconception is that the radius of the observable universe should be 13.8 billion light-years. Because space expanded during the 13.8 billion years the light was traveling, the original emitting gas is now located ~46.5 billion light-years away.",
    sources: [
      {
        title: "How Big is the Observable Universe?",
        authorOrOrg: "NASA & European Southern Observatory",
        url: "https://science.nasa.gov/universe/",
        description:
          "Scientific explanation of the 46.5 billion light-year comoving particle horizon and the expansion of the light cone.",
      },
    ],
    visualHighlights: [
      "Observer at center with 46.5 billion light-year comoving radius horizon",
      "Cosmic light cone stretching backward to the recombination boundary",
      "Overlapping observable bubbles for observers in different galaxies",
      "Finite observable horizon vs potentially infinite physical universe",
    ],
  },
  {
    id: 25,
    slug: "universe-through-modern-telescopes",
    title: "The Universe Through Modern Telescopes",
    subtitle: "From Hubble and JWST to Gravitational Waves",
    period: "1990 to Present",
    yearDisplay: "1990–Present",
    yearValue: 2025,
    era: "Contemporary Frontier",
    civilizations: ["International Alliances (NASA, ESA, CSA, ESO, LIGO-Virgo-KAGRA)"],
    keyFigures: [
      "Hubble Space Telescope team",
      "James Webb Space Telescope (JWST) team",
      "Event Horizon Telescope (EHT) collaboration",
      "LIGO-Virgo gravitational wave physicists",
    ],
    modelType: "multiwavelength_universe",
    summary:
      "By combining optical, infrared, radio, X-ray, and gravitational wave observatories, modern astrophysics perceives phenomena completely invisible to the human eye, from baby galaxies to black hole event horizons.",
    historicalContext:
      "For thousands of years, humans only observed a narrow sliver of visible light (400–700 nm). The 20th and 21st centuries opened the full electromagnetic spectrum: radio astronomy discovered pulsars; X-ray telescopes revealed black hole accretion disks; JWST pierced cosmic dust to detect galaxies just 300 million years after the Big Bang ($z > 14$); and LIGO detected gravitational waves from colliding black holes.",
    theModel:
      "The **Multiwavelength Universe**: physical processes emit across distinct energy bands:\n- **Radio / Submillimeter (ALMA, EHT)**: Cool molecular clouds, protostellar disks, black hole shadow imaging (M87*, Sgr A*).\n- **Infrared (JWST, Spitzer)**: Dust-obscured stellar nurseries, exoplanet atmospheres, high-redshift early galaxies.\n- **Optical (Hubble, VLT)**: Stellar photospheres, galactic structures, ionized nebulae.\n- **X-Ray & Gamma-Ray (Chandra, Fermi)**: Supernova remnants, neutron star accretion, supermassive black hole jets.\n- **Gravitational Waves (LIGO, Virgo)**: Pure spacetime ripples from black hole and neutron star mergers.",
    supportingEvidence:
      "Over 30 years of Hubble deep field surveys, the 2019 and 2022 Event Horizon Telescope images of black hole shadows, direct spectroscopy of exoplanet atmospheres (identifying carbon dioxide, methane, water vapor), and over 100 detected gravitational wave events.",
    limitations:
      "Telescopes can only observe photons and waves that have reached our instruments. Deep cosmological mysteries remain unresolved behind observational boundaries.",
    whatChangedNext:
      "These incredible observational tools have brought us face to face with the unresolved frontiers of 21st-century cosmology.",
    accuracyNotes:
      "Astronomy images from non-visible wavelengths (infrared, X-ray, radio) are translated into 'representative color' (chromatically ordered from lowest frequency to highest) so human eyes can interpret physical data.",
    sources: [
      {
        title: "NASA James Webb Space Telescope: Early Universe Observations",
        authorOrOrg: "NASA / ESA / CSA",
        url: "https://science.nasa.gov/mission/webb/",
        description:
          "Official JWST deep field discoveries, high-redshift early galaxies, and exoplanet transmission spectroscopy.",
      },
      {
        title: "Event Horizon Telescope: Imaging the Black Hole in M87 and Sgr A*",
        authorOrOrg: "Event Horizon Telescope Collaboration & NSF",
        url: "https://eventhorizontelescope.org/",
        description:
          "The global millimeter VLBI array that captured the first direct images of supermassive black hole shadows.",
      },
    ],
    visualHighlights: [
      "Interactive multiwavelength toggle: Optical vs Infrared vs Radio vs X-Ray",
      "JWST deep field peering at primordial galaxies at z > 13",
      "Event Horizon Telescope black hole shadow photon ring",
      "LIGO gravitational wave spacetime chirp ripple",
    ],
  },
  {
    id: 26,
    slug: "the-current-frontier",
    title: "The Current Frontier",
    subtitle: "What Humanity Still Does Not Know",
    period: "The Unresolved Horizon (Present & Future)",
    yearDisplay: "The Unresolved Horizon",
    yearValue: 2030,
    era: "Contemporary Frontier",
    civilizations: ["Global Humanity & Future Generations of Scientists"],
    keyFigures: ["Cosmologists", "Particle physicists", "You & the Next Generation of Explorers"],
    modelType: "cosmic_frontier_unknowns",
    summary:
      "Every cosmological model was a way of asking a better question. Today, cosmologists confront profound mysteries: What is dark energy? What is dark matter? What happened at the earliest accessible moment?",
    historicalContext:
      "Humanity has mapped the observable universe across 13.8 billion years, yet 95% of the cosmos remains composed of dark components whose fundamental microphysics is unknown. Scientific humility reminds us that our current standard model, like all models before it, is an evolving approximation of a richer reality.",
    theModel:
      "The Major Unresolved Questions of Modern Cosmology:\n1. **What is Dark Matter?** (A new supersymmetric particle, axions, primordial black holes, or modified gravity?)\n2. **What is Dark Energy?** (Einstein's vacuum cosmological constant, a dynamic quintessence scalar field, or a breakdown of general relativity on cosmic scales?)\n3. **The Hubble Tension**: Why do early-universe CMB measurements ($67.4 \\text{ km/s/Mpc}$) disagree with late-universe local distance ladders ($73.0 \\text{ km/s/Mpc}$)?\n4. **What Happened at $t = 0$?** (Did the universe emerge from a singularity, a quantum bounce, or a pre-existing eternal multiverse?)\n5. **Why is There Matter at All?** (Baryon asymmetry: why did the early universe produce more matter than antimatter instead of mutual annihilation?)\n6. **Is the Entire Universe Finite or Infinite?** (What is the global topology of spacetime beyond our observable horizon?)",
    supportingEvidence:
      "Active international experiments: the Dark Energy Spectroscopic Instrument (DESI), the Vera C. Rubin Observatory (LSST), the Nancy Grace Roman Space Telescope, the Euclid mission, and next-generation gravitational wave detectors (LISA).",
    limitations:
      "Direct empirical observation is constrained by the speed of light, cosmic horizons, and the Planck scale ($10^{-35} \\text{ m}$), requiring new mathematical frameworks uniting quantum mechanics with general relativity.",
    whatChangedNext:
      "The next chapter in cosmic history will be written by future observers and thinkers who dare to question today's assumptions.",
    accuracyNotes:
      "Science does not claim absolute finality; it constructs testable, empirically grounded models that are continuously refined, challenged, and transformed by new observations.",
    sources: [
      {
        title: "NASA Astrophysics Roadmap: Enduring Quests, Daring Visions",
        authorOrOrg: "NASA Astrophysics Division",
        url: "https://science.nasa.gov/astrophysics/",
        description:
          "NASA's strategic 30-year roadmap for addressing open cosmological questions: dark energy, cosmic dawn, and life in the universe.",
      },
      {
        title: "ESA Cosmic Vision: Unresolved Questions in Modern Cosmology",
        authorOrOrg: "European Space Agency",
        url: "https://www.esa.int/",
        description:
          "European Space Agency scientific framework targeting the nature of dark matter, dark energy, and fundamental physics.",
      },
    ],
    visualHighlights: [
      "Interactive map of open cosmological questions",
      "Cosmic web transitioning into the frontiers of human knowledge",
      "The Hubble tension discrepancy spotlight",
      "Direct invitations to explore Our Visible Universe 3D celestial engine",
    ],
  },
];
