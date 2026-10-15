import type { LearningLevel, LessonContract, QuizQuestion, ScientificSource } from "../types";

export interface PlanetariumStar {
  id: string;
  name: string;
  bayer?: string;
  constellation: string;
  raHours: number; // Right Ascension in hours (0 to 24)
  decDeg: number; // Declination in degrees (-90 to +90)
  magnitude: number; // Apparent visual magnitude (lower = brighter)
  distanceLy: number; // Distance from Earth in light-years
  spectralType: string;
  colorHex: string;
  tempK: number;
  description: string;
  isNavigationalMarker?: boolean;
}

export interface PlanetariumConstellation {
  id: string;
  name: string;
  latinName: string;
  hemisphere: "northern" | "southern" | "equatorial";
  season: "Winter" | "Spring" | "Summer" | "Autumn" | "Circumpolar";
  starIds: string[];
  lines: [string, string][]; // Pairs of star IDs to connect
  description: string;
  lore: string;
  centerRaHours: number;
  centerDecDeg: number;
}

export interface PlanetariumPlanet {
  id: string;
  name: string;
  raHours: number;
  decDeg: number;
  magnitude: number;
  colorHex: string;
  sizeKm: number;
  distanceAU: number;
  twinkles: boolean;
  notes: string;
}

export interface SubLesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
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

export const MODULE_02_SUBLESSONS: SubLesson[] = [
  {
    id: "lesson-1-why-stars-at-night",
    number: 1,
    title: "Why do we see stars at night?",
    subtitle: "The blinding glare of our home star and the cloak of night",
    description:
      "Understand why the stars are always above us—even during the daytime—and how Earth's atmosphere scatters sunlight.",
    content: {
      junior: {
        summary:
          "Stars don't go to sleep or turn off in the morning! They are shining in the sky all day long. But the Sun is so close and bright that it turns our sky brilliant blue, hiding the tiny twinkling stars until nighttime.",
        takeaway: "The stars are always there in the sky; daytime sunlight just hides them!",
        deepDive:
          "Earth is wrapped in a thick blanket of air. When the Sun shines, its bright white light bounces off the air particles in all directions. This scattering fills the entire sky with bright blue light. It's like trying to see a faint flashlight when someone points a giant stadium floodlight right into your eyes!",
        didYouKnow:
          "Astronauts on the Moon can see stars even in daytime because the Moon has no atmosphere to scatter sunlight into a blue sky!",
        mathOrAnalogy:
          "Imagine a glow-in-the-dark sticker on your bedroom wall. In a bright sunny room, you cannot see it glow. Turn the bedroom lights off, and it shines brightly!",
      },
      explorer: {
        summary:
          "Stars are visible only at night because Rayleigh scattering of solar photons in Earth's atmosphere washes out the faint point-source illumination of distant stars during the day.",
        takeaway:
          "Sunlight scatters through atmospheric gas molecules, creating an optical veil with a luminance of thousands of candelas per square meter.",
        deepDive:
          "The Sun is approximately 400,000 times brighter in apparent magnitude than the full Moon, and over 10 billion times brighter than Sirius. Sunlight enters our nitrogen-oxygen atmosphere and scatters inversely proportional to the fourth power of the wavelength (Rayleigh scattering: I ~ 1/λ^4). Shorter blue wavelengths scatter ten times more efficiently than red light, creating the luminous daytime sky dome. Only when our hemisphere rotates into Earth's shadow (night) does the atmospheric glow fade, allowing faint starlight to penetrate.",
        didYouKnow:
          "During a total solar eclipse, when the Moon completely blocks the Sun's disk for a few minutes, the brightest stars and planets pop into view in the middle of the day!",
        mathOrAnalogy:
          "The Sun has an apparent visual magnitude of -26.74, whereas Sirius (the brightest night star) is -1.46. Because the magnitude scale is logarithmic (each step of 5 magnitudes is a factor of 100 in brightness), the Sun appears roughly 13 billion times brighter to human eyes than Sirius.",
      },
      astronomer: {
        summary:
          "Daytime sky radiance (~2,000–5,000 cd/m²) drastically exceeds the human retinal contrast threshold needed to detect point-source stellar flux against diffuse atmospheric background.",
        takeaway:
          "Atmospheric sky brightness sets the limiting magnitude: ~-4.0 in full daylight down to +6.5 on pristine, moonless Bortle Class 1 rural nights.",
        deepDive:
          "Optical contrast is governed by Weber's law: C = (I_star - I_sky) / I_sky. For a typical first-magnitude star, the photon flux per unit solid angle is minute compared to the daylight scattered flux. Space-based observatories like the Hubble Space Telescope and James Webb Space Telescope bypass this limitation by orbiting above the atmospheric scattering column, enabling uninterrupted observations against a pitch-black cosmic backdrop 24/7.",
        didYouKnow:
          "High-elevation solar observatories and infrared telescopes can occasionally track Venus or Jupiter in broad daylight with optical filters, because planets reflect enough flux to exceed local background contrast when magnified.",
        mathOrAnalogy:
          "Rayleigh scattering cross-section: σ_R = (8π / 3) * (2π / λ)^4 * ((n^2 - 1) / (n^2 + 2))^2 * (1 / N). The λ^-4 dependency means 400 nm violet light scatters nearly 10 times more intensely than 700 nm deep-red light.",
      },
    },
  },
  {
    id: "lesson-2-what-are-constellations",
    number: 2,
    title: "What are constellations?",
    subtitle: "Line-of-sight illusions and the 88 official celestial boundaries",
    description:
      "Discover how human cultures drew mythological pictures in the stars and why constellations are optical projections rather than physical star clusters.",
    content: {
      junior: {
        summary:
          "Constellations are like giant connect-the-dot pictures in the sky! Ancient stargazers looked up and imagined heroes, dragons, hunters, and bears made from groups of bright stars.",
        takeaway:
          "Constellations are fun star patterns! The stars look close together, but in real space, some are close and some are millions of miles farther away.",
        deepDive:
          "If you look at the constellation Orion the Hunter, his shoulders, belt, and knees seem to form a picture. But if you flew in a rocket ship behind Orion, the pattern would completely disappear! Betelgeuse is over 600 light-years away, while Bellatrix is only 250 light-years away. They only look like a team because they line up from our seat on planet Earth.",
        didYouKnow:
          "There are exactly 88 official constellations recognized by astronomers today, covering every inch of the night sky like a giant jigsaw puzzle!",
        mathOrAnalogy:
          "Imagine standing in a city looking down a street. A streetlamp 50 meters away and an airplane 10 kilometers away in the sky might look side-by-side, even though one is vastly farther!",
      },
      explorer: {
        summary:
          "A constellation is an officially recognized region of the celestial sphere. Modern astronomy recognizes 88 contiguous constellations established by the International Astronomical Union (IAU) in 1928.",
        takeaway:
          "Constellations are 2D line-of-sight projections. The stars that compose them rarely have any physical gravitational relationship to each other.",
        deepDive:
          "Historically, Mesopotamian, Greek, Egyptian, Chinese, and Indigenous cultures developed distinct celestial maps. In 1928, Belgian astronomer Eugène Delporte defined the precise boundary lines along coordinates of Right Ascension and Declination for the 88 modern constellations. Any celestial object—such as a newly discovered supernova, asteroid, or exoplanet—is designated as lying within one specific constellation boundary (e.g., SN 1987A in the constellation Dorado).",
        didYouKnow:
          "The 'Big Dipper' is technically not a constellation! It is an 'asterism'—a recognizable pattern that forms just a part of the larger official constellation Ursa Major (The Great Bear).",
        mathOrAnalogy:
          "In the Big Dipper, Alkaid is 104 light-years away, while Dubhe is 123 light-years away, and Alioth is 83 light-years away. They appear equally bright only because the farther stars are intrinsically more luminous.",
      },
      astronomer: {
        summary:
          "Constellations serve as an internationally standardized celestial coordinate partitioning scheme (analogous to political boundaries on terrestrial maps) defined on the J2000.0 equatorial grid.",
        takeaway:
          "Star patterns are ephemeral over astronomical timescales; proper motion (secular stellar velocity vectors) will radically distort all 88 constellation shapes within 100,000 years.",
        deepDive:
          "Stars possess both radial velocity (v_r along our line of sight) and proper motion (μ in arcseconds per year across the celestial sphere). For example, Barnard's Star moves at 10.3 arcseconds per year. In 50,000 years, the handle of the Big Dipper will bend and Orion's belt will drift apart. Furthermore, Hipparcos and Gaia parallax measurements confirm that constellation stars span distinct spiral arm layers across thousands of parsecs.",
        didYouKnow:
          "Some asterisms, like the Ursa Major Moving Group, do share common kinematics and formation origins (~300 million years ago), but most constellations are chance line-of-sight alignments.",
        mathOrAnalogy:
          "Tangential velocity formula: v_t = 4.74 * μ * d (where v_t is in km/s, μ is proper motion in arcsec/yr, and d is distance in parsecs). Over millennia, this tangential velocity tears constellations apart.",
      },
    },
  },
  {
    id: "lesson-3-earths-rotation-moving-sky",
    number: 3,
    title: "Earth's rotation and the moving sky",
    subtitle: "Why the stars rise in the east and set in the west every night",
    description:
      "Explore the diurnal motion of the heavens caused by Earth's steady 1,670 km/h eastward spin on its rotational axis.",
    content: {
      junior: {
        summary:
          "Have you ever sat on a merry-go-round and watched the trees and playground spin past you? That is exactly what happens with the night sky! Earth is spinning like a giant merry-go-round, making the stars look like they are marching across the sky.",
        takeaway:
          "Stars don't actually fly across the sky each night—Earth spins from west to east under them!",
        deepDive:
          "Because Earth spins smoothly toward the East, everything in the sky—the Sun, the Moon, and the constellations—appears to rise in the East and set in the West. It takes about 24 hours for Earth to make one full turn, so tomorrow night at the same time, the stars will be right back in the same spots!",
        didYouKnow:
          "Because Earth also travels around the Sun, the stars rise about 4 minutes earlier every single night. That's why we see different constellations in summer than in winter!",
        mathOrAnalogy:
          "Imagine riding in a car with your eyes closed. The car is moving forward, but when you open your eyes, the road signs seem to be flying backward!",
      },
      explorer: {
        summary:
          "Diurnal motion is the apparent daily rotation of the celestial sphere from east to west, caused directly by Earth's axial rotation from west to east at an angular velocity of 15 degrees per hour.",
        takeaway:
          "Earth rotates 360 degrees in 23 hours, 56 minutes, and 4.09 seconds (one sidereal day). This 4-minute offset against the solar day shifts the constellations across seasons.",
        deepDive:
          "Because Earth rotates once every 24 hours (1,440 minutes), the sky appears to turn 360° / 24 = 15° every hour (or 1° every 4 minutes). If you spot the constellation Orion rising above the eastern horizon at 8:00 PM, by 2:00 AM (6 hours later) it will have rotated 90° across the southern sky toward the west. Because Earth simultaneously orbits the Sun, our nighttime vantage point peers in a slightly different direction each night, shifting seasonal constellations over 365 days.",
        didYouKnow:
          "A solar day (24h 00m) is longer than a sidereal day (23h 56m) because Earth has to spin an extra ~1 degree each day to bring the Sun back overhead after traveling along its orbit!",
        mathOrAnalogy:
          "At the equator, Earth's surface moves eastward at 465 meters per second (1,674 km/h), carrying you faster than the speed of sound while you sit quietly reading a book.",
      },
      astronomer: {
        summary:
          "Diurnal rotation maps equatorial coordinates (RA, Dec) onto the local horizon frame (Azimuth, Altitude) via the observer's Local Sidereal Time (LST = Greenwich Sidereal Time + East Longitude).",
        takeaway:
          "Hour Angle H = LST - α. As Earth rotates, H increases uniformly at the sidereal rate ω_e ≈ 7.2921 x 10^-5 rad/s.",
        deepDive:
          "The transformation from the equatorial frame to the topocentric horizon frame is given by spherical trigonometry: sin(alt) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(H), where φ is the observer's geographic latitude, δ is stellar declination, and H is the local hour angle. Azimuth is derived via cos(Az) = (sin(δ) - sin(φ)sin(alt)) / (cos(φ)cos(alt)). Modern computer-controlled equatorial and alt-azimuth telescope mounts rely on these exact matrix transformations in real time to counteract Earth's diurnal rotation.",
        didYouKnow:
          "Foucault's pendulum, first demonstrated in Paris in 1851, proved Earth's rotation without looking at the sky: the plane of swing precesses with a period of 24 hours / sin(latitude).",
        mathOrAnalogy:
          "The sidereal rotation rate: 360° / 86,164.09s = 0.004178°/sec. In 1 second of time, the celestial sphere sweeps 15 arcseconds of angle across the field of view.",
      },
    },
  },
  {
    id: "lesson-4-celestial-poles-star-trails",
    number: 4,
    title: "The celestial poles and apparent star trails",
    subtitle: "Polaris, circumpolar stars, and the pivot point of the heavens",
    description:
      "Witness how stars near the celestial poles circle endlessly without ever setting, and why Polaris is Earth's northern compass in the sky.",
    content: {
      junior: {
        summary:
          "If you point a camera at the northern sky and leave the shutter open all night, you will capture magical circles of light! All the stars trace circular paths around one special star that barely moves: Polaris, the North Star.",
        takeaway:
          "Polaris sits almost exactly above Earth's North Pole, so it stays fixed while all other stars spin around it!",
        deepDive:
          "Imagine spinning a basketball on your finger. The top tip of the ball doesn't move across the room—it just spins in place. Earth's North Pole points straight up into deep space right toward Polaris! That's why campers, sailors, and explorers have used Polaris to find North for thousands of years.",
        didYouKnow:
          "Polaris is not the brightest star in the sky! It is only the 48th brightest star, but it is famous because of its special parking spot right above Earth's axis.",
        mathOrAnalogy:
          "Look at the hub in the center of a bicycle wheel: the spokes and tire spin around fast, but the axle in the very middle stays put.",
      },
      explorer: {
        summary:
          "The Celestial Poles are the two imaginary points where Earth's axis of rotation intersects the celestial sphere. Stars within an angular distance of the pole less than the observer's latitude never dip below the horizon—they are circumpolar.",
        takeaway:
          "Polaris sits less than 0.7° from the North Celestial Pole (NCP). Its altitude above the northern horizon equals the observer's geographic latitude!",
        deepDive:
          "If you stand at the North Pole (Latitude 90°N), Polaris is directly overhead at your zenith (altitude 90°), and every visible star circles parallel to the horizon without rising or setting. If you stand at the Equator (Latitude 0°), Polaris sits right on the northern horizon, and stars rise vertically in the East and set vertically in the West. In the Southern Hemisphere, Polaris is invisible beneath the horizon; instead, southern stargazers look toward the South Celestial Pole (SCP) near the Southern Cross (Crux).",
        didYouKnow:
          "Due to Earth's 25,772-year axial precession (wobbling like a slowing spinning top), Polaris hasn't always been the North Star! 4,500 years ago, when the Egyptian Pyramids were built, the pole star was Thuban in Draco.",
        mathOrAnalogy:
          "If you are in London (51.5°N), Polaris is 51.5° above the northern horizon. If you are in Mumbai (19°N), Polaris sits low at 19°. You can measure your global latitude just with your fist and Polaris!",
      },
      astronomer: {
        summary:
          "Circumpolar condition: a star with declination δ is circumpolar for observer latitude φ if |δ| ≥ 90° - |φ| (with identical signs). Long-exposure astrophotography captures concentric arcs subtending θ = (15°/hour) * t.",
        takeaway:
          "Precession of the equinoxes shifts the Celestial Pole in a 23.5° radius circle around the Ecliptic Pole with a period of ~25,772 years.",
        deepDive:
          "Because the torque exerted by the Moon and Sun on Earth's equatorial bulge causes axial precession (lunisolar precession), the celestial coordinates of all stars undergo secular drift (~50.3 arcsec/year). Polaris will make its closest approach to the true North Celestial Pole around March 2100 (at a separation of 27 arcminutes 9 arcseconds), after which it will gradually drift away. Around 13,700 AD, the brilliant blue-white star Vega (Alpha Lyrae) will serve as our northern pole star.",
        didYouKnow:
          "There is no bright star marking the South Celestial Pole today! The nearest faint naked-eye star is Sigma Octantis, a dim 5.4-magnitude star barely visible to the unaided eye.",
        mathOrAnalogy:
          "Precession angular speed: dψ/dt ≈ 50.29 arcseconds per year. Over a human lifespan of 80 years, the celestial poles shift by over 1.1 degrees on the celestial sphere.",
      },
    },
  },
  {
    id: "lesson-5-planets-vs-stars",
    number: 5,
    title: "Planets versus stars",
    subtitle: "Twinkle versus steady disk, and the ancient wandering celestial wanderers",
    description:
      "Learn the foolproof tricks astronomers use to distinguish planets from stars with the naked eye: scintillation, color, and planetary drift.",
    content: {
      junior: {
        summary:
          "When you look up at night, some 'stars' are actually nearby planets like Jupiter, Mars, and Venus! You can tell them apart with a simple secret: stars twinkle, but planets shine with a steady, calm light.",
        takeaway:
          "Rule of thumb: Stars twinkle like tiny dancing dots; planets shine with a steady, quiet glow!",
        deepDive:
          "Stars are so far away that their light reaches us as an ultra-skinny ray of light. When that skinny beam passes through windy air above Earth, the air bends it back and forth, making it twinkle. But planets are much closer to us, so they look like tiny circular disks. Their wider beam of light shines through the wind without dancing around!",
        didYouKnow:
          "The word 'planet' comes from the ancient Greek word 'planetes', which literally means 'wanderer'! Ancient stargazers noticed that while stars stay locked in patterns, planets wander across the sky week by week.",
        mathOrAnalogy:
          "Look at a tiny pinhole of light through wavy water: it shakes wildly. Now look at a round dinner plate through wavy water: the plate stays steady and clear.",
      },
      explorer: {
        summary:
          "Planets can be distinguished from stars by three primary criteria: lack of atmospheric scintillation (twinkling), orbital motion along the ecliptic plane, and distinctive physical colors (e.g., Mars is red, Saturn is golden).",
        takeaway:
          "Planets subtend measurable angular diameters (10–50 arcseconds), whereas stars are unresolved sub-milliarcsecond point sources.",
        deepDive:
          "Earth's atmosphere consists of turbulent air pockets with varying temperatures and densities (refractive index variations). Because a star is light-years away, its angular size is less than 0.001 arcseconds—far smaller than an atmospheric turbulence cell (~10 cm). Consequently, the incoming wavefront is bent erratically, causing rapid intensity and color fluctuations (atmospheric scintillation). Conversely, planets like Jupiter subtend ~45 arcseconds; the light rays from different points of the planetary disk average out, canceling scintillation and producing a steady glow.",
        didYouKnow:
          "Planets always travel inside a narrow 16-degree band across the sky called the Zodiac, because all major planets orbit in nearly the same flat plane (the ecliptic) around the Sun!",
        mathOrAnalogy:
          "Mars takes 687 Earth days to orbit the Sun. If you sketch its position relative to the background constellation stars over a few months, you will see it crawl across the stars and even execute a loop (retrograde motion).",
      },
      astronomer: {
        summary:
          "The optical distinction arises from the coherence length of atmospheric turbulence (Fried parameter r_0, typically 5–20 cm in the visible spectrum) relative to the angular diameter of the source.",
        takeaway:
          "Apparent planetary magnitudes vary dramatically with synodic configuration: Mars swings from magnitude +1.8 at solar conjunction to a blazing -2.9 at close perihelic opposition.",
        deepDive:
          "The intensity variance of starlight scintillation is proportional to the Kolmogorov turbulence spectrum: σ_I^2 ~ C_n^2 * k^(7/6) * L^(11/6). Because a planetary disk acts as an incoherent extended source composed of thousands of uncorrelated isoplanatic patches, aperture synthesis over the disk suppresses high-frequency intensity modulation. Furthermore, the apparent retrograde motion of superior planets is a parallax effect caused by Earth's faster orbital velocity (29.8 km/s) overtaking the slower outer planet on the inside track.",
        didYouKnow:
          "Professional telescopes use adaptive optics (AO)—deformable mirrors flexing thousands of times per second guided by artificial laser guide stars—to cancel out scintillation completely.",
        mathOrAnalogy:
          "Angular resolution limit (diffraction limit): θ = 1.22 * λ / D. A human pupil (D = 6 mm) at 550 nm has a diffraction limit of ~23 arcseconds, which is why naked eyes see planets as steady disks but cannot resolve their moons.",
      },
    },
  },
  {
    id: "lesson-6-finding-directions-using-sky",
    number: 6,
    title: "Finding directions using the sky",
    subtitle: "Ancient navigation: pointer stars, the southern cross, and celestial compasses",
    description:
      "Master the timeless art of celestial navigation: using the Big Dipper pointer stars to locate True North, and the Southern Cross to locate True South.",
    content: {
      junior: {
        summary:
          "What if you were lost in a dark forest without a phone, battery, or compass? You could just look up at the night sky! The stars are the oldest, most reliable map ever made.",
        takeaway:
          "In the north, the two outer stars of the Big Dipper point like an arrow right to the North Star!",
        deepDive:
          "Find the Big Dipper spoon shape in the sky. Look at the two stars that make up the front wall of the spoon—their names are Merak and Dubhe. Draw an imaginary line through them and keep going about five times the distance between them. You will bump straight into Polaris, the North Star! Face Polaris, and you are looking True North. Your back is to the South, your right hand points East, and your left hand points West.",
        didYouKnow:
          "Polynesian wayfarers sailed thousands of miles across the open Pacific Ocean in wooden canoes using only the stars, ocean swells, and birds!",
        mathOrAnalogy:
          "Hold your fist out at arm's length against the sky. Your fist covers about 10 degrees. The distance between the pointer stars is about 5 degrees, and Polaris is five steps away!",
      },
      explorer: {
        summary:
          "Celestial navigation utilizes circumpolar asterisms as pointers: Dubhe and Merak in Ursa Major point to the North Celestial Pole, while Crux and the Pointers (Alpha & Beta Centauri) triangulate the South Celestial Pole.",
        takeaway:
          "The 'Pointer Stars' (Merak and Dubhe) point northward to Polaris. In the southern hemisphere, the long axis of the Southern Cross points 4.5 times its length toward True South.",
        deepDive:
          "To locate True South without a pole star: Locate the Southern Cross (Crux). Extend a line through its long axis (from Gacrux through Acrux) 4.5 times. Next, find the two brilliant Pointer Stars: Alpha and Beta Centauri (Hadar). Construct a perpendicular bisector halfway between them. The point where the Crux axis and this perpendicular bisector intersect marks the South Celestial Pole (SCP). Dropping a line vertically downward from this point to the horizon establishes True South.",
        didYouKnow:
          "Orion's Belt also serves as a celestial road sign: follow the three belt stars southeast to find Sirius (the brightest star), or follow them northwest to find Aldebaran and the Pleiades cluster!",
        mathOrAnalogy:
          "Polaris is accurate to within 0.7° of True Geographic North—far more accurate than a magnetic compass, which is distorted by local magnetic declination and metal deposits.",
      },
      astronomer: {
        summary:
          "Nautical astronomy determines the observer's geographic position (latitude φ, longitude λ) by measuring the altitudes of two or more celestial bodies with a marine sextant at precise Greenwich Mean Time (GMT).",
        takeaway:
          "Each sextant altitude measurement defines a Circle of Equal Altitude on Earth's surface with radius r = 90° - alt. The intersection of two circles yields the observer's fix.",
        deepDive:
          "Before GPS, the Sumner line and Marcq Saint-Hilaire intercept method were the gold standards of naval navigation. The navigator measures observed altitude H_o, computes expected altitude H_c for an assumed position using the spherical haversine formula, and derives the intercept: p = H_o - H_c (in nautical miles, where 1 arcminute = 1 NM). In the modern era, star trackers mounted on spacecraft (such as the Orion capsule and robotic interplanetary probes) continuously image constellation star fields, comparing them to onboard star catalogs to calculate 3-axis spacecraft attitude to sub-arcsecond precision.",
        didYouKnow:
          "The invention of the marine chronometer by John Harrison in 1761 solved the historic 'Longitude problem', allowing sailors to calculate their east-west position by comparing local solar noon to Greenwich time.",
        mathOrAnalogy:
          "Intercept calculation: 1 nautical mile = 1 minute of latitude arc = 1.852 km. An altitude measurement error of just 1 arcminute results in a 1-nautical-mile navigational position error.",
      },
    },
  },
];

export const PLANETARIUM_STARS: PlanetariumStar[] = [
  // Ursa Major (Big Dipper) & Ursa Minor
  {
    id: "polaris",
    name: "Polaris",
    bayer: "α UMi",
    constellation: "Ursa Minor",
    raHours: 2.53,
    decDeg: 89.26,
    magnitude: 1.98,
    distanceLy: 433,
    spectralType: "F7Ib",
    colorHex: "#fef9c3",
    tempK: 6015,
    description:
      "The North Star. Sits directly above Earth's rotational axis in the Northern Hemisphere.",
    isNavigationalMarker: true,
  },
  {
    id: "dubhe",
    name: "Dubhe",
    bayer: "α UMa",
    constellation: "Ursa Major",
    raHours: 11.06,
    decDeg: 61.75,
    magnitude: 1.79,
    distanceLy: 123,
    spectralType: "K0III",
    colorHex: "#fed7aa",
    tempK: 4500,
    description:
      "Pointer Star! Forms the outer lip of the Big Dipper spoon; points directly to Polaris.",
    isNavigationalMarker: true,
  },
  {
    id: "merak",
    name: "Merak",
    bayer: "β UMa",
    constellation: "Ursa Major",
    raHours: 11.03,
    decDeg: 56.38,
    magnitude: 2.37,
    distanceLy: 79,
    spectralType: "A1V",
    colorHex: "#e0f2fe",
    tempK: 9350,
    description: "Pointer Star! Connect Merak through Dubhe and extend 5x to locate Polaris.",
    isNavigationalMarker: true,
  },
  {
    id: "phecda",
    name: "Phecda",
    bayer: "γ UMa",
    constellation: "Ursa Major",
    raHours: 11.9,
    decDeg: 53.69,
    magnitude: 2.44,
    distanceLy: 83,
    spectralType: "A0V",
    colorHex: "#f0f9ff",
    tempK: 9500,
    description: "Inner bowl star of the Big Dipper.",
  },
  {
    id: "megrez",
    name: "Megrez",
    bayer: "δ UMa",
    constellation: "Ursa Major",
    raHours: 12.25,
    decDeg: 57.03,
    magnitude: 3.31,
    distanceLy: 80,
    spectralType: "A3V",
    colorHex: "#f0f9ff",
    tempK: 8600,
    description: "The hinge star connecting the bowl of the Big Dipper to its handle.",
  },
  {
    id: "alioth",
    name: "Alioth",
    bayer: "ε UMa",
    constellation: "Ursa Major",
    raHours: 12.9,
    decDeg: 55.96,
    magnitude: 1.77,
    distanceLy: 83,
    spectralType: "A1III",
    colorHex: "#e0f2fe",
    tempK: 9000,
    description: "The brightest star in Ursa Major, marking the first star of the handle.",
  },
  {
    id: "mizar",
    name: "Mizar",
    bayer: "ζ UMa",
    constellation: "Ursa Major",
    raHours: 13.4,
    decDeg: 54.92,
    magnitude: 2.23,
    distanceLy: 83,
    spectralType: "A2V",
    colorHex: "#e0f2fe",
    tempK: 9000,
    description:
      "Famous optical double star with Alcor; ancient warriors used it as an eyesight test!",
  },
  {
    id: "alkaid",
    name: "Alkaid",
    bayer: "η UMa",
    constellation: "Ursa Major",
    raHours: 13.79,
    decDeg: 49.31,
    magnitude: 1.86,
    distanceLy: 104,
    spectralType: "B3V",
    colorHex: "#bae6fd",
    tempK: 15500,
    description: "The tip of the Big Dipper handle, glowing hot blue-white.",
  },
  {
    id: "kochab",
    name: "Kochab",
    bayer: "β UMi",
    constellation: "Ursa Minor",
    raHours: 14.85,
    decDeg: 74.16,
    magnitude: 2.08,
    distanceLy: 131,
    spectralType: "K4III",
    colorHex: "#fed7aa",
    tempK: 4030,
    description: "Orange giant star in the Little Dipper bowl; former pole star around 1100 BC.",
  },

  // Orion & Neighbors
  {
    id: "betelgeuse",
    name: "Betelgeuse",
    bayer: "α Ori",
    constellation: "Orion",
    raHours: 5.92,
    decDeg: 7.41,
    magnitude: 0.5,
    distanceLy: 642,
    spectralType: "M1-2Ia-ab",
    colorHex: "#f87171",
    tempK: 3500,
    description:
      "Pulsating red supergiant marking Orion's right shoulder; destined to explode as a supernova.",
  },
  {
    id: "rigel",
    name: "Rigel",
    bayer: "β Ori",
    constellation: "Orion",
    raHours: 5.24,
    decDeg: -8.2,
    magnitude: 0.13,
    distanceLy: 860,
    spectralType: "B8Ia",
    colorHex: "#7dd3fc",
    tempK: 12100,
    description:
      "Luminous blue-white supergiant marking Orion's left foot; 40,000 times brighter than our Sun.",
  },
  {
    id: "bellatrix",
    name: "Bellatrix",
    bayer: "γ Ori",
    constellation: "Orion",
    raHours: 5.42,
    decDeg: 6.35,
    magnitude: 1.64,
    distanceLy: 250,
    spectralType: "B2III",
    colorHex: "#38bdf8",
    tempK: 22000,
    description: "The Amazon Star, marking Orion's left shoulder.",
  },
  {
    id: "saiph",
    name: "Saiph",
    bayer: "κ Ori",
    constellation: "Orion",
    raHours: 5.79,
    decDeg: -9.67,
    magnitude: 2.07,
    distanceLy: 650,
    spectralType: "B0.5Ia",
    colorHex: "#60a5fa",
    tempK: 26500,
    description: "Blue supergiant marking Orion's right knee.",
  },
  {
    id: "alnitak",
    name: "Alnitak",
    bayer: "ζ Ori",
    constellation: "Orion",
    raHours: 5.68,
    decDeg: -1.94,
    magnitude: 1.77,
    distanceLy: 1260,
    spectralType: "O9.5Ib",
    colorHex: "#93c5fd",
    tempK: 29500,
    description:
      "Eastern star of Orion's Belt; illuminates the famous Flame and Horsehead Nebulae.",
  },
  {
    id: "alnilam",
    name: "Alnilam",
    bayer: "ε Ori",
    constellation: "Orion",
    raHours: 5.6,
    decDeg: -1.2,
    magnitude: 1.69,
    distanceLy: 1340,
    spectralType: "B0Ia",
    colorHex: "#93c5fd",
    tempK: 27000,
    description: "Center jewel of Orion's Belt, over 500,000 times more luminous than our Sun.",
  },
  {
    id: "mintaka",
    name: "Mintaka",
    bayer: "δ Ori",
    constellation: "Orion",
    raHours: 5.53,
    decDeg: -0.3,
    magnitude: 2.23,
    distanceLy: 1200,
    spectralType: "O9.5II",
    colorHex: "#93c5fd",
    tempK: 29500,
    description: "Western star of Orion's Belt, sitting almost precisely on the Celestial Equator.",
  },

  // Major Navigation Beacons & Winter/Summer Triangles
  {
    id: "sirius",
    name: "Sirius",
    bayer: "α CMa",
    constellation: "Canis Major",
    raHours: 6.75,
    decDeg: -16.72,
    magnitude: -1.46,
    distanceLy: 8.6,
    spectralType: "A1V",
    colorHex: "#f0f9ff",
    tempK: 9940,
    description:
      "The Dog Star! Brightest star in the entire night sky, orbited by a white dwarf companion.",
    isNavigationalMarker: true,
  },
  {
    id: "procyon",
    name: "Procyon",
    bayer: "α CMi",
    constellation: "Canis Minor",
    raHours: 7.65,
    decDeg: 5.22,
    magnitude: 0.34,
    distanceLy: 11.5,
    spectralType: "F5IV-V",
    colorHex: "#fef08a",
    tempK: 6530,
    description: "Forms the Winter Triangle alongside Sirius and Betelgeuse.",
  },
  {
    id: "aldebaran",
    name: "Aldebaran",
    bayer: "α Tau",
    constellation: "Taurus",
    raHours: 4.6,
    decDeg: 16.51,
    magnitude: 0.85,
    distanceLy: 65,
    spectralType: "K5III",
    colorHex: "#fb923c",
    tempK: 3900,
    description: "The fiery red eye of Taurus the Bull; shines through the Hyades cluster.",
  },
  {
    id: "capella",
    name: "Capella",
    bayer: "α Aur",
    constellation: "Auriga",
    raHours: 5.28,
    decDeg: 46.0,
    magnitude: 0.08,
    distanceLy: 43,
    spectralType: "G3III",
    colorHex: "#fef08a",
    tempK: 5700,
    description: "Bright golden quadruple star system visible high in winter northern skies.",
  },
  {
    id: "vega",
    name: "Vega",
    bayer: "α Lyr",
    constellation: "Lyra",
    raHours: 18.62,
    decDeg: 38.78,
    magnitude: 0.03,
    distanceLy: 25,
    spectralType: "A0Va",
    colorHex: "#f8fafc",
    tempK: 9600,
    description: "The baseline zero-magnitude standard star; anchor of the Summer Triangle.",
  },
  {
    id: "deneb",
    name: "Deneb",
    bayer: "α Cyg",
    constellation: "Cygnus",
    raHours: 20.69,
    decDeg: 45.28,
    magnitude: 1.25,
    distanceLy: 2600,
    spectralType: "A2Ia",
    colorHex: "#ffffff",
    tempK: 8525,
    description: "Colossal white supergiant marking the tail of Cygnus the Swan.",
  },
  {
    id: "altair",
    name: "Altair",
    bayer: "α Aql",
    constellation: "Aquila",
    raHours: 19.84,
    decDeg: 8.87,
    magnitude: 0.77,
    distanceLy: 16.7,
    spectralType: "A7V",
    colorHex: "#f8fafc",
    tempK: 7700,
    description: "Fast-spinning flattened star completing the Summer Triangle with Vega and Deneb.",
  },

  // Cassiopeia
  {
    id: "schedar",
    name: "Schedar",
    bayer: "α Cas",
    constellation: "Cassiopeia",
    raHours: 0.68,
    decDeg: 56.54,
    magnitude: 2.24,
    distanceLy: 228,
    spectralType: "K0IIIa",
    colorHex: "#fed7aa",
    tempK: 4530,
    description: "Orange giant star in the famous 'W' shape of Cassiopeia.",
  },
  {
    id: "caph",
    name: "Caph",
    bayer: "β Cas",
    constellation: "Cassiopeia",
    raHours: 0.15,
    decDeg: 59.15,
    magnitude: 2.28,
    distanceLy: 54,
    spectralType: "F2III",
    colorHex: "#fef9c3",
    tempK: 7080,
    description: "Rightmost star of the Queen's Throne.",
  },
  {
    id: "gamma_cas",
    name: "Navi",
    bayer: "γ Cas",
    constellation: "Cassiopeia",
    raHours: 0.94,
    decDeg: 60.72,
    magnitude: 2.15,
    distanceLy: 550,
    spectralType: "B0.5IVe",
    colorHex: "#60a5fa",
    tempK: 25000,
    description: "The central point of the 'W'; energetic eruptive variable star with a gas disk.",
  },
  {
    id: "ruchbah",
    name: "Ruchbah",
    bayer: "δ Cas",
    constellation: "Cassiopeia",
    raHours: 1.43,
    decDeg: 60.23,
    magnitude: 2.68,
    distanceLy: 99,
    spectralType: "A5V",
    colorHex: "#f0f9ff",
    tempK: 8400,
    description: "Eclipsing binary star in the left segment of the 'W'.",
  },
  {
    id: "segin",
    name: "Segin",
    bayer: "ε Cas",
    constellation: "Cassiopeia",
    raHours: 1.9,
    decDeg: 63.67,
    magnitude: 3.35,
    distanceLy: 460,
    spectralType: "B3V",
    colorHex: "#93c5fd",
    tempK: 15170,
    description: "Left tip of the Cassiopeia 'W'.",
  },

  // Southern Hemisphere Beacons (Crux & Pointers)
  {
    id: "acrux",
    name: "Acrux",
    bayer: "α Cru",
    constellation: "Crux",
    raHours: 12.44,
    decDeg: -63.1,
    magnitude: 0.77,
    distanceLy: 320,
    spectralType: "B0.5IV",
    colorHex: "#38bdf8",
    tempK: 28000,
    description: "Southern Cross base star; points directly toward the South Celestial Pole.",
    isNavigationalMarker: true,
  },
  {
    id: "mimosa",
    name: "Mimosa",
    bayer: "β Cru",
    constellation: "Crux",
    raHours: 12.79,
    decDeg: -59.69,
    magnitude: 1.25,
    distanceLy: 280,
    spectralType: "B0.5III",
    colorHex: "#38bdf8",
    tempK: 27000,
    description: "Brilliant blue-white giant star on the eastern arm of the Southern Cross.",
  },
  {
    id: "gacrux",
    name: "Gacrux",
    bayer: "γ Cru",
    constellation: "Crux",
    raHours: 12.52,
    decDeg: -57.11,
    magnitude: 1.64,
    distanceLy: 88,
    spectralType: "M3.5III",
    colorHex: "#fb923c",
    tempK: 3625,
    description: "Top star of the Southern Cross; red giant providing vivid contrast with Acrux.",
    isNavigationalMarker: true,
  },
  {
    id: "delta_cru",
    name: "Imai",
    bayer: "δ Cru",
    constellation: "Crux",
    raHours: 12.25,
    decDeg: -58.75,
    magnitude: 2.79,
    distanceLy: 360,
    spectralType: "B2IV",
    colorHex: "#60a5fa",
    tempK: 20500,
    description: "Western arm star of the Southern Cross.",
  },
  {
    id: "alpha_cen",
    name: "Alpha Centauri (Rigil Kentaurus)",
    bayer: "α Cen",
    constellation: "Centaurus",
    raHours: 14.66,
    decDeg: -60.83,
    magnitude: -0.27,
    distanceLy: 4.37,
    spectralType: "G2V",
    colorHex: "#fef08a",
    tempK: 5790,
    description:
      "Our closest stellar neighbor! Serves as the Southern Pointer star alongside Hadar.",
    isNavigationalMarker: true,
  },
  {
    id: "hadar",
    name: "Hadar (Beta Centauri)",
    bayer: "β Cen",
    constellation: "Centaurus",
    raHours: 14.06,
    decDeg: -60.37,
    magnitude: 0.61,
    distanceLy: 390,
    spectralType: "B1III",
    colorHex: "#60a5fa",
    tempK: 25000,
    description: "Southern Pointer star; forms an arrow pointing directly to the Southern Cross.",
    isNavigationalMarker: true,
  },
  {
    id: "canopus",
    name: "Canopus",
    bayer: "α Car",
    constellation: "Carina",
    raHours: 6.4,
    decDeg: -52.7,
    magnitude: -0.74,
    distanceLy: 310,
    spectralType: "A9II",
    colorHex: "#fefce8",
    tempK: 7400,
    description:
      "Second brightest star in the entire night sky; primary navigational anchor for spacecraft.",
    isNavigationalMarker: true,
  },

  // Scorpius
  {
    id: "antares",
    name: "Antares",
    bayer: "α Sco",
    constellation: "Scorpius",
    raHours: 16.49,
    decDeg: -26.43,
    magnitude: 1.06,
    distanceLy: 550,
    spectralType: "M1.5Iab",
    colorHex: "#ef4444",
    tempK: 3500,
    description: "Heart of the Scorpion! Name means 'Rival of Mars' due to its ruby red hue.",
  },
  {
    id: "shaula",
    name: "Shaula",
    bayer: "λ Sco",
    constellation: "Scorpius",
    raHours: 17.56,
    decDeg: -37.1,
    magnitude: 1.62,
    distanceLy: 570,
    spectralType: "B2IV",
    colorHex: "#38bdf8",
    tempK: 25000,
    description: "The stinger star at the tip of the Scorpion's tail.",
  },
];

export const PLANETARIUM_CONSTELLATIONS: PlanetariumConstellation[] = [
  {
    id: "ursa-major",
    name: "Ursa Major",
    latinName: "The Great Bear (Big Dipper)",
    hemisphere: "northern",
    season: "Circumpolar",
    starIds: ["dubhe", "merak", "phecda", "megrez", "alioth", "mizar", "alkaid"],
    lines: [
      ["dubhe", "merak"],
      ["merak", "phecda"],
      ["phecda", "megrez"],
      ["megrez", "dubhe"],
      ["megrez", "alioth"],
      ["alioth", "mizar"],
      ["mizar", "alkaid"],
    ],
    description:
      "The most famous northern asterism. The two pointer stars (Merak and Dubhe) point in a straight line toward Polaris.",
    lore: "In Greek mythology, Zeus transformed the beautiful nymph Callisto into a great bear to protect her, placing her safely among the stars.",
    centerRaHours: 12.0,
    centerDecDeg: 55.0,
  },
  {
    id: "ursa-minor",
    name: "Ursa Minor",
    latinName: "The Little Bear (Little Dipper)",
    hemisphere: "northern",
    season: "Circumpolar",
    starIds: ["polaris", "kochab"],
    lines: [["polaris", "kochab"]],
    description:
      "Contains the North Star (Polaris) at the very tip of its handle. It hangs in the sky like a celestial ladle.",
    lore: "Represents Arcas, the son of Callisto, placed beside his mother in the heavens to guard the northern celestial pivot.",
    centerRaHours: 15.0,
    centerDecDeg: 78.0,
  },
  {
    id: "orion",
    name: "Orion",
    latinName: "The Hunter",
    hemisphere: "equatorial",
    season: "Winter",
    starIds: ["betelgeuse", "bellatrix", "rigel", "saiph", "alnitak", "alnilam", "mintaka"],
    lines: [
      ["betelgeuse", "bellatrix"],
      ["bellatrix", "mintaka"],
      ["mintaka", "alnilam"],
      ["alnilam", "alnitak"],
      ["alnitak", "betelgeuse"],
      ["alnitak", "saiph"],
      ["mintaka", "rigel"],
      ["saiph", "rigel"],
    ],
    description:
      "The master of the winter sky. Famous for its three-star belt, orange Betelgeuse shoulder, and ice-blue Rigel foot.",
    lore: "The mighty hunter Orion claimed he could defeat any beast on Earth, so Gaia dispatched Scorpius the Scorpion. They were placed on opposite sides of the sky so they never meet.",
    centerRaHours: 5.5,
    centerDecDeg: 0.0,
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    latinName: "The Queen",
    hemisphere: "northern",
    season: "Circumpolar",
    starIds: ["caph", "schedar", "gamma_cas", "ruchbah", "segin"],
    lines: [
      ["caph", "schedar"],
      ["schedar", "gamma_cas"],
      ["gamma_cas", "ruchbah"],
      ["ruchbah", "segin"],
    ],
    description:
      "A prominent 'W' or 'M' pattern opposite the Big Dipper across Polaris. A reliable navigational beacon when the Dipper is low.",
    lore: "Cassiopeia was the vain queen of Ethiopia whose boasts angered Poseidon. She circles the North Pole perpetually, half the time hanging upside down to teach humility.",
    centerRaHours: 1.0,
    centerDecDeg: 60.0,
  },
  {
    id: "crux",
    name: "Crux",
    latinName: "The Southern Cross",
    hemisphere: "southern",
    season: "Circumpolar",
    starIds: ["acrux", "mimosa", "gacrux", "delta_cru"],
    lines: [
      ["gacrux", "acrux"],
      ["mimosa", "delta_cru"],
    ],
    description:
      "The iconic emblem of the Southern Skies. Its longer vertical beam points 4.5 times toward the South Celestial Pole.",
    lore: "Featured on the national flags of Australia, New Zealand, Brazil, Samoa, and Papua New Guinea. Revered by Australian First Nations as the Mirrabooka or head of the Emu in the Sky.",
    centerRaHours: 12.5,
    centerDecDeg: -60.0,
  },
  {
    id: "centaurus",
    name: "Centaurus",
    latinName: "The Centaur",
    hemisphere: "southern",
    season: "Spring",
    starIds: ["alpha_cen", "hadar"],
    lines: [["alpha_cen", "hadar"]],
    description:
      "Home to the two brilliant Southern Pointers (Alpha & Beta Centauri), pointing travelers straight toward the Southern Cross.",
    lore: "Commemorates Chiron, the wisest and most compassionate of all centaurs, teacher to Achilles, Hercules, and Asclepius.",
    centerRaHours: 14.3,
    centerDecDeg: -60.5,
  },
  {
    id: "scorpius",
    name: "Scorpius",
    latinName: "The Scorpion",
    hemisphere: "southern",
    season: "Summer",
    starIds: ["antares", "shaula"],
    lines: [["antares", "shaula"]],
    description:
      "One of the few constellations that actually resembles its namesake, featuring the menacing hook tail and ruby red Antares heart.",
    lore: "The creature sent by Gaia to subdue Orion. When Scorpius rises in the East, Orion sets in the West, eternally chasing one another across the sky.",
    centerRaHours: 17.0,
    centerDecDeg: -30.0,
  },
];

export const PLANETARIUM_PLANETS: PlanetariumPlanet[] = [
  {
    id: "jupiter",
    name: "Jupiter",
    raHours: 3.8,
    decDeg: 19.2,
    magnitude: -2.4,
    colorHex: "#fef08a",
    sizeKm: 139820,
    distanceAU: 4.8,
    twinkles: false,
    notes:
      "Shines with a serene, unblinking cream-colored light. Through binoculars, you can spot its 4 Galilean moons!",
  },
  {
    id: "mars",
    name: "Mars",
    raHours: 7.2,
    decDeg: 23.5,
    magnitude: -1.1,
    colorHex: "#f87171",
    sizeKm: 6779,
    distanceAU: 1.1,
    twinkles: false,
    notes:
      "Distinguished by its amber-red hue. Rust (iron oxide) across its surface gives Mars its characteristic blood-orange glow.",
  },
  {
    id: "venus",
    name: "Venus",
    raHours: 1.5,
    decDeg: 9.8,
    magnitude: -4.3,
    colorHex: "#fefce8",
    sizeKm: 12104,
    distanceAU: 0.72,
    twinkles: false,
    notes:
      "The dazzling 'Evening Star' or 'Morning Star'. Its thick sulfurous clouds reflect 70% of sunlight, outshining every star in the sky.",
  },
  {
    id: "saturn",
    name: "Saturn",
    raHours: 23.1,
    decDeg: -7.5,
    magnitude: 0.6,
    colorHex: "#fde047",
    sizeKm: 116460,
    distanceAU: 9.6,
    twinkles: false,
    notes:
      "Warm golden light. Even a small 2-inch telescope reveals its breathtaking planetary ring system.",
  },
];

export const MODULE_02_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "Why can't we see stars during the daytime on Earth?",
    options: [
      "The stars turn off their light when the Sun rises",
      "Earth's atmosphere scatters sunlight into a bright blue sky that outshines the stars",
      "The stars travel to the other side of the universe during the day",
      "Clouds automatically cover the stars every morning",
    ],
    correctIndex: 1,
    explanation:
      "Rayleigh scattering of sunlight by Earth's atmosphere creates an optical blue veil thousands of times brighter than faint distant starlight.",
    hint: "Think about what happens to glow-in-the-dark stickers in a bright room.",
  },
  {
    id: "q2",
    question:
      "Are the stars that make up a constellation physically close to each other in 3D space?",
    options: [
      "Yes, they are all bound together by gravity at the exact same distance",
      "Yes, they formed from the same small nebula together",
      "No, they are at vastly different distances and only appear near each other from our line of sight on Earth",
      "No, constellations are painted on a solid dome surrounding Earth",
    ],
    correctIndex: 2,
    explanation:
      "Constellations are 2D line-of-sight optical projections. Stars in Orion range from 250 light-years (Bellatrix) to over 1,300 light-years (Alnilam) away from Earth.",
    hint: "Remember the streetlamp and airplane analogy.",
  },
  {
    id: "q3",
    question:
      "Why does Polaris (the North Star) appear to stand still while other stars rotate around it?",
    options: [
      "Polaris is the heaviest star in the Milky Way",
      "Polaris sits almost directly above Earth's northern axis of rotation",
      "Polaris orbits Earth in reverse to cancel out Earth's spin",
      "Polaris is only 1 light-year away from us",
    ],
    correctIndex: 1,
    explanation:
      "Polaris lies within 0.7 degrees of the North Celestial Pole—the imaginary projection of Earth's rotational axle into space.",
    hint: "Think of the axle in the center of a spinning bicycle wheel.",
  },
  {
    id: "q4",
    question: "How can you tell a planet apart from a star with the naked eye?",
    options: [
      "Planets are always green, while stars are purple",
      "Stars twinkle due to atmospheric turbulence; planets shine with a steady, unblinking light",
      "Planets are shaped like squares in the sky",
      "Stars are always much bigger than planets to the naked eye",
    ],
    correctIndex: 1,
    explanation:
      "Stars are sub-milliarcsecond point sources disrupted by turbulent air pockets (scintillation), while closer planets present a small disk whose light averages out the turbulence.",
    hint: "One twinkles like a tiny dancing pinhole, the other glows calmly.",
  },
  {
    id: "q5",
    question:
      "If you are in the Northern Hemisphere and find the Big Dipper, how do you locate Polaris?",
    options: [
      "Look at the handle and follow its curve backward into the Sun",
      "Connect the two outer bowl stars (Merak & Dubhe) and extend the line 5 times forward",
      "Polaris is always the brightest star inside the bowl",
      "Polaris is located at the center of Orion's Belt",
    ],
    correctIndex: 1,
    explanation:
      "The two outer bowl stars of Ursa Major (Merak and Dubhe) are called the 'Pointer Stars'. Drawing a straight line through them leads directly to Polaris.",
    hint: "The two stars on the wall of the spoon point like an arrow.",
  },
];

export const MODULE_02_SOURCES: ScientificSource[] = [
  {
    title: "International Astronomical Union (IAU) 88 Official Constellations",
    organization: "IAU",
    url: "https://www.iau.org/public/themes/constellations/",
    note: "Official celestial boundaries defined by Eugène Delporte in 1928.",
  },
  {
    title: "NASA Space Place: What Is a Constellation?",
    organization: "NASA",
    url: "https://spaceplace.nasa.gov/constellations/en/",
    note: "Curriculum-aligned explanations of line-of-sight stellar distances and asterisms.",
  },
  {
    title: "ESA Hipparcos & Gaia Star Catalogs",
    organization: "ESA",
    url: "https://www.cosmos.esa.int/web/gaia/data-release-3",
    note: "High-precision astrometric star coordinates, spectral classifications, and proper motions.",
  },
  {
    title: "NOIRLab Globe at Night Light Pollution Project",
    organization: "NASA",
    url: "https://www.globeatnight.org/",
    note: "Citizen-science observational data on night-sky brightness and Bortle classes.",
  },
];

export const MODULE_02_LESSON: LessonContract = {
  lessonId: "module-02-night-sky-full",
  moduleId: "02",
  title: "The Night Sky & Constellations",
  objectives: [
    "Navigate the celestial sphere and recognize major northern and southern constellations",
    "Understand diurnal motion, circumpolar stars, and why stars rotate around celestial poles",
    "Discover how line-of-sight 3D depth debunks the myth of physical constellation connections",
    "Distinguish twinkling stars from steady planets using optical physics principles",
    "Master celestial direction-finding with pointer stars (Polaris & Crux)",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Tonight, the universe is putting on the greatest light show on Earth! Step into your virtual planetarium dome, connect the dots of ancient heroes, and learn how the night sky points the way home.",
      coreConcepts: [
        "Daytime hides the stars with blue sky light",
        "Constellations are fun star patterns connecting distant worlds",
        "Earth spins like a merry-go-round, making stars rise and set",
        "Polaris is the steady North Star in the center of the wheel",
        "Stars twinkle like dancing dots; planets shine calm and steady",
      ],
      explanatoryText:
        "Every clear night, the sky turns into a gigantic open-air theater. When our part of Earth turns away from the Sun into shadow, the blinding blue sky fades away, revealing thousands of glittering diamonds. For thousands of years, kids and explorers looked up at these stars and created stories of brave hunters, soaring swans, and magical bears. Today, you will become a certified junior navigator!",
      quizQuestions: MODULE_02_QUIZ.slice(0, 3),
      funFacts: [
        "If you could turn off Earth's atmosphere for one second, the sky would turn jet-black and you would see the Sun and stars shining together!",
        "Polaris has guided lost ships across the oceans for more than two thousand years.",
        "The stars in the Big Dipper are traveling in different directions, so in 100,000 years, the spoon will look like an open box!",
      ],
    },
    explorer: {
      introHook:
        "Step inside a real-time astronomical planetarium dome. Control latitude from the Equator to the Arctic, speed up Earth's rotation to witness star trails, and discover how line-of-sight geometry creates the constellations.",
      coreConcepts: [
        "Rayleigh scattering washes out point-source stellar flux during the day",
        "The 88 IAU constellations are contiguous 2D coordinate boundaries, not physical clusters",
        "Diurnal motion causes 15° per hour apparent celestial rotation",
        "Polaris altitude matches observer latitude (φ) to within 0.7°",
        "Planets resist scintillation because their angular disk subtends multiple atmospheric cells",
        "Merak and Dubhe triangulate North; Crux triangulates South",
      ],
      explanatoryText:
        "The night sky is Earth's natural celestial laboratory. Because Earth rotates uniformly on its axis once every sidereal day (23h 56m 4s), the entire celestial sphere appears to revolve around the Celestial Poles. By choosing an observation latitude and shifting local time, we observe how circumpolar constellations like Ursa Major and Cassiopeia wheel around Polaris without ever setting for northern observers. Meanwhile, toggling from city lights to a rural dark sky demonstrates how artificial light pollution washes out the fainter 95% of visible stars.",
      quizQuestions: MODULE_02_QUIZ,
      funFacts: [
        "A light-year is 9.46 trillion kilometers! When you look at Deneb in Cygnus, you are seeing starlight that left the star 2,600 years ago during the rise of classical Greece.",
        "Under a Bortle Class 1 dark sky, the human eye can resolve roughly 2,500 individual stars, plus the glowing arch of the Milky Way. In a downtown city, light pollution cuts that down to fewer than 20 stars!",
        "Earth's axis wobbles in a 25,772-year circle called precession. In 12,000 years, the brilliant star Vega will take over from Polaris as our North Star.",
      ],
    },
    astronomer: {
      introHook:
        "Investigate the spherical trigonometry of the celestial sphere. Derive topocentric coordinates (Az, Alt) from equatorial right ascension and declination, model atmospheric seeing (scintillation), and analyze 3D stellar vectors across the Orion OB1 association.",
      coreConcepts: [
        "Spherical coordinate transformation: sin(alt) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(H)",
        "Fried parameter r_0 and wavefront phase variance in optical scintillation",
        "Lunisolar precession rate (dψ/dt ≈ 50.29″/yr) and epoch coordinate drift (J2000 vs B1950)",
        "Proper motion kinematics: v_t = 4.74 * μ * d across moving stellar associations",
        "Limiting magnitude and Bortle dark-sky scale modeling",
      ],
      explanatoryText:
        "Modern astrometry bridges classical horizon observation with high-precision astrophysics. By plotting astronomical Right Ascension and Declination onto a topocentric observer dome, students evaluate how observer latitude φ tilts the celestial equator and determines the circumpolar horizon cutoff: |δ| ≥ 90° - |φ|. In addition, interactive 3D perspective shifting decomposes the line-of-sight illusion of constellations, demonstrating that stellar asterisms are transient projected alignments of stars separated by hundreds of parsecs along radial distance vectors.",
      quizQuestions: MODULE_02_QUIZ,
      mathExplanation:
        "Diurnal rotation rate: ω = 2π / 86,164.09s = 7.2921 x 10^-5 rad/s (15.041°/hour). Local Sidereal Time: LST = GST + λ_E. Hour angle: H = LST - α.",
      funFacts: [
        "The Gaia satellite has mapped positions, parallaxes, and proper motions for over 1.8 billion stars with microarcsecond precision, proving that many constellation stars are passing each other like ships in the night.",
        "The twinkling frequency of stars typically peaks between 10 Hz and 100 Hz, matching the thermal eddy turnover time in the tropospheric boundary layer.",
      ],
    },
  },
  visualizationType: "cosmic-scale",
  interactions: [
    "360-degree virtual planetarium dome rotation and pitch",
    "Toggle constellation lines, boundaries, and mythological artwork",
    "Observer latitude slider from -90° (South Pole) to +90° (North Pole)",
    "Time-of-night slider and auto-play star trails animation",
    "Polaris & Celestial Pole highlighter with latitude compass readout",
    "Light pollution Bortle simulator (City vs Suburban vs Dark Rural)",
    "3D Line-of-sight perspective toggle breaking 2D constellation illusions",
    "Interactive Star Inspector with spectral color, magnitude, and distance",
    "Find the Constellation interactive game with Northern & Southern sky modes",
    "Accessible 2D planisphere star chart fallback",
  ],
  relatedConcepts: [
    "Celestial Sphere",
    "Right Ascension & Declination",
    "Diurnal Motion",
    "Circumpolar Stars",
    "Rayleigh Scattering",
    "Atmospheric Scintillation",
    "Light Pollution & Bortle Scale",
    "Precession of the Equinoxes",
  ],
  completionCriteria:
    "Explore the 360° virtual planetarium dome, inspect at least 3 stars, test the light pollution slider, and complete the night sky knowledge check.",
  scientificSources: MODULE_02_SOURCES,
};
