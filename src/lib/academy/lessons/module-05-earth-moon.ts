import type { LearningLevel, LessonContract, QuizQuestion, ScientificSource } from "../types";

export interface LunarPhaseInfo {
  id: string;
  name: string;
  phaseAngleDeg: number; // 0 to 360 degrees (0 = New Moon, 180 = Full Moon)
  illuminationPct: number; // 0 to 100%
  riseTime: string;
  setTime: string;
  description: string;
  earthSkyAppearance: string;
  symbol: string;
}

export interface EarthSeasonalPoint {
  id: string;
  name: string;
  dayOfYearApprox: number;
  dateStr: string;
  subsolarLatitude: string;
  northernHemisphereSeason: string;
  southernHemisphereSeason: string;
  dayLengthEquatorHours: number;
  dayLengthNorthPoleHours: number;
  dayLengthSouthPoleHours: number;
  description: string;
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

export const LUNAR_PHASES: LunarPhaseInfo[] = [
  {
    id: "new_moon",
    name: "New Moon",
    phaseAngleDeg: 0,
    illuminationPct: 0,
    riseTime: "Sunrise (~6:00 AM)",
    setTime: "Sunset (~6:00 PM)",
    description:
      "The Moon is positioned directly between Earth and the Sun. Its sunlit hemisphere faces entirely away from Earth, making it invisible against the bright daytime sky.",
    earthSkyAppearance: "Invisible in the glare of the Sun (except during a solar eclipse!)",
    symbol: "🌑",
  },
  {
    id: "waxing_crescent",
    name: "Waxing Crescent",
    phaseAngleDeg: 45,
    illuminationPct: 15,
    riseTime: "Mid-morning (~9:00 AM)",
    setTime: "Mid-evening (~9:00 PM)",
    description:
      "As the Moon travels eastward in its orbit, a thin sliver of illuminated surface turns toward Earth. The glowing horns (cusps) point away from the setting Sun.",
    earthSkyAppearance:
      "A delicate silver crescent visible low in the western sky just after sunset.",
    symbol: "🌒",
  },
  {
    id: "first_quarter",
    name: "First Quarter",
    phaseAngleDeg: 90,
    illuminationPct: 50,
    riseTime: "Noon (~12:00 PM)",
    setTime: "Midnight (~12:00 AM)",
    description:
      "The Moon has traversed one-quarter of its orbit around Earth. Half of the visible disk is illuminated by sunlight and half is in shadow (quadrature).",
    earthSkyAppearance: "High in the southern sky at sunset; sets around midnight.",
    symbol: "🌓",
  },
  {
    id: "waxing_gibbous",
    name: "Waxing Gibbous",
    phaseAngleDeg: 135,
    illuminationPct: 85,
    riseTime: "Mid-afternoon (~3:00 PM)",
    setTime: "Late night (~3:00 AM)",
    description:
      "More than half the visible lunar disk shines brightly. 'Waxing' means growing larger each night as it approaches opposite alignment with the Sun.",
    earthSkyAppearance: "Dominates the eastern sky in twilight and shines for most of the night.",
    symbol: "🌔",
  },
  {
    id: "full_moon",
    name: "Full Moon",
    phaseAngleDeg: 180,
    illuminationPct: 100,
    riseTime: "Sunset (~6:00 PM)",
    setTime: "Sunrise (~6:00 AM)",
    description:
      "Earth sits between the Sun and Moon (syzygy). The entire day-side hemisphere of the Moon faces Earth, reflecting bright sunlight all through the night.",
    earthSkyAppearance:
      "Rises in the east exactly as the Sun sets in the west; stays visible all night long.",
    symbol: "🌕",
  },
  {
    id: "waning_gibbous",
    name: "Waning Gibbous",
    phaseAngleDeg: 225,
    illuminationPct: 85,
    riseTime: "Late evening (~9:00 PM)",
    setTime: "Mid-morning (~9:00 AM)",
    description:
      "The sunlit fraction begins to shrink ('wane') as the Moon moves toward the dawn side of Earth's orbit.",
    earthSkyAppearance: "Rises after sunset and lingers into early morning daylight.",
    symbol: "🌖",
  },
  {
    id: "third_quarter",
    name: "Third (Last) Quarter",
    phaseAngleDeg: 270,
    illuminationPct: 50,
    riseTime: "Midnight (~12:00 AM)",
    setTime: "Noon (~12:00 PM)",
    description:
      "The Moon has completed three-quarters of its orbit. The opposite half of the lunar disk is now sunlit, facing into the direction of Earth's orbital travel.",
    earthSkyAppearance: "Rises around midnight; stands high overhead at dawn.",
    symbol: "🌗",
  },
  {
    id: "waning_crescent",
    name: "Waning Crescent",
    phaseAngleDeg: 315,
    illuminationPct: 15,
    riseTime: "Pre-dawn (~3:00 AM)",
    setTime: "Mid-afternoon (~3:00 PM)",
    description:
      "A slim crescent visible in the eastern twilight before sunrise. The unlit portions often glow faintly with 'earthshine'—sunlight reflected off Earth onto the Moon.",
    earthSkyAppearance: "A fingernail crescent greeting the sunrise in the morning eastern sky.",
    symbol: "🌘",
  },
];

export const EARTH_SEASONAL_POINTS: EarthSeasonalPoint[] = [
  {
    id: "june_solstice",
    name: "June Solstice (Summer in North / Winter in South)",
    dayOfYearApprox: 172,
    dateStr: "June 20–22",
    subsolarLatitude: "23.44° North (Tropic of Cancer)",
    northernHemisphereSeason: "Summer (Longest day, Sun highest in sky)",
    southernHemisphereSeason: "Winter (Shortest day, Sun lowest in sky)",
    dayLengthEquatorHours: 12.0,
    dayLengthNorthPoleHours: 24.0, // Midnight sun
    dayLengthSouthPoleHours: 0.0, // Polar night
    description:
      "Earth's North Pole is tilted directly toward the Sun by 23.44°. Sunlight strikes the Northern Hemisphere steeply, concentrating solar energy and creating long daylight hours.",
  },
  {
    id: "september_equinox",
    name: "September Equinox (Autumn in North / Spring in South)",
    dayOfYearApprox: 265,
    dateStr: "September 21–23",
    subsolarLatitude: "0° (Equator)",
    northernHemisphereSeason: "Autumn (Equinox: equal day and night)",
    southernHemisphereSeason: "Spring (Equinox: equal day and night)",
    dayLengthEquatorHours: 12.0,
    dayLengthNorthPoleHours: 12.0,
    dayLengthSouthPoleHours: 12.0,
    description:
      "Neither pole is tilted toward or away from the Sun. Sunlight strikes perpendicular to Earth's equator, giving virtually every point on Earth exactly 12 hours of day and 12 hours of night.",
  },
  {
    id: "december_solstice",
    name: "December Solstice (Winter in North / Summer in South)",
    dayOfYearApprox: 355,
    dateStr: "December 21–22",
    subsolarLatitude: "23.44° South (Tropic of Capricorn)",
    northernHemisphereSeason: "Winter (Shortest day, Sun lowest in sky)",
    southernHemisphereSeason: "Summer (Longest day, Sun highest in sky)",
    dayLengthEquatorHours: 12.0,
    dayLengthNorthPoleHours: 0.0, // Polar night
    dayLengthSouthPoleHours: 24.0, // Midnight sun
    description:
      "Earth's South Pole is tilted directly toward the Sun by 23.44°. The Southern Hemisphere receives intense, direct sunlight while the Northern Hemisphere receives shallow, spread-out rays.",
  },
  {
    id: "march_equinox",
    name: "March Equinox (Spring in North / Autumn in South)",
    dayOfYearApprox: 80,
    dateStr: "March 20–21",
    subsolarLatitude: "0° (Equator)",
    northernHemisphereSeason: "Spring (Equinox: equal day and night)",
    southernHemisphereSeason: "Autumn (Equinox: equal day and night)",
    dayLengthEquatorHours: 12.0,
    dayLengthNorthPoleHours: 12.0,
    dayLengthSouthPoleHours: 12.0,
    description:
      "The subsolar point crosses the equator moving northward. Day and night are balanced worldwide as Earth continues its annual orbital loop.",
  },
];

export const MODULE_05_SUBLESSONS: SubLesson[] = [
  {
    id: "lesson-1-earth-rotates-day-night",
    number: 1,
    title: "Earth rotates: day and night",
    subtitle: "24-hour planetary spin on an invisible axis",
    description:
      "Discover how Earth's eastward axial rotation creates the illusion of the Sun moving across the sky, driving our daily cycle of daylight and darkness.",
    content: {
      junior: {
        summary:
          "Earth is like a giant spinning carousel! It spins around and around once every 24 hours. When your hometown faces the bright Sun, you enjoy daytime. When your town spins away into the dark, you get bedtime and night!",
        takeaway: "Day and night happen because our planet Earth spins around like a top.",
        deepDive:
          "It feels like you are sitting completely still, but Earth is actually spinning at over 1,600 kilometers per hour at the equator! Because you, the air, trees, and buildings are all spinning together at the exact same smooth speed, you don't feel dizzy at all.",
        didYouKnow:
          "If Earth stopped spinning, one side of our world would be in permanent boiling desert daylight, and the other side would freeze in eternal frozen night!",
        mathOrAnalogy:
          "Hold a flashlight in a dark room and spin a ball slowly. Only half the ball is lit up at any moment. That lit-up half is daytime!",
      },
      explorer: {
        summary:
          "Earth rotates eastward (counter-clockwise when viewed looking down at the North Pole) on its polar axis once every 23 hours, 56 minutes, and 4 seconds (a sidereal day). Because Earth simultaneously orbits the Sun, it takes exactly 24 hours for the Sun to return to the same meridian (a solar day).",
        takeaway:
          "Earth's rotation eastward makes the Sun, Moon, and stars appear to rise in the east and set in the west.",
        deepDive:
          "The dividing line between the sunlit day side and dark night side of Earth is called the 'terminator'. As the planet rotates eastward, the terminator sweeps smoothly across continents at speeds ranging from ~1,670 km/h at the equator to zero right at the geographic poles.",
        didYouKnow:
          "Because Earth spins on its axis, centrifugal force causes our planet to bulge slightly at the equator! Earth is not a perfect sphere, but an 'oblate spheroid'—its equatorial radius is 21 km wider than its polar radius.",
        mathOrAnalogy:
          "Rotational speed at latitude θ: v = 1,674 × cos(θ) km/h. At the equator (0°), you travel at 1,674 km/h. At latitude 60° (like Oslo or Anchorage), you spin at 837 km/h!",
      },
      astronomer: {
        summary:
          "Axial rotation is governed by conservation of angular momentum from the primordial solar nebula accretion disk. Earth's rotational period is steadily decelerating by ~1.7 to 2.3 milliseconds per century due to lunar tidal friction.",
        takeaway:
          "The solar day (24h 00m 00s) exceeds the sidereal day (23h 56m 04.09s) by ~3 minutes 56 seconds because Earth must rotate an extra ~0.986° to realign with the Sun after advancing in its orbit.",
        deepDive:
          "Foucault pendulums physically prove Earth's rotation in an inertial reference frame without looking at the sky. The plane of oscillation of the pendulum precesses at an angular rate ω = 15° · sin(latitude) per hour. At the North Pole, it makes a full 360° circle in 24 hours; at the equator (latitude 0°), the plane does not precess at all.",
        didYouKnow:
          "Around 620 million years ago, a day on Earth was only about 21.9 hours long, and a year had over 400 days! Lunar tidal dissipation has been transferring Earth's rotational angular momentum into the Moon's orbit for 4.5 billion years.",
        mathOrAnalogy:
          "Angular velocity: ω_Earth = 2π / 86,164.1 s ≈ 7.2921 × 10⁻⁵ rad/s. Equatorial centrifugal acceleration a_c = ω²·R_eq ≈ 0.0339 m/s² reduces effective surface gravity at the equator by ~0.35%.",
      },
    },
  },
  {
    id: "lesson-2-earths-orbit-and-seasons",
    number: 2,
    title: "Earth's orbit and the seasons",
    subtitle: "Why 23.44° axial tilt—not distance—rules our seasons",
    description:
      "Bust the most common myth in astronomy: Earth's varying distance to the Sun does NOT cause the seasons. Axial tilt controls solar angle and daylight duration.",
    content: {
      junior: {
        summary:
          "Why is summer hot and winter cold? Earth does not stand straight up—it tilts like a leaning tower! When your part of Earth tilts toward the Sun, you get hot summer days. When your part tilts away, you get cold snowy winter!",
        takeaway: "Earth's tilt causes the seasons, NOT how close we are to the Sun!",
        deepDive:
          "Did you know? In July, Earth is actually at its furthest point from the Sun in the whole year! Yet July is the hottest month of summer in places like the United States, Europe, and Asia. That proves being closer to the Sun isn't what makes summer hot!",
        didYouKnow:
          "While children in New York are building snowmen in December, kids in Australia and South Africa are swimming at the beach on Christmas in blazing summer sun!",
        mathOrAnalogy:
          "Hold a flashlight straight down at a piece of paper: the circle of light is small and super bright. Now tilt the flashlight: the light spreads out wide and becomes dimmer. Direct rays are hot; tilted rays are weak!",
      },
      explorer: {
        summary:
          "Earth's rotational axis is tilted by 23.44° relative to the perpendicular of its orbital plane (the ecliptic). Throughout its 365.25-day orbit, this tilt remains fixed in space, pointing toward the star Polaris (axial parallelism).",
        takeaway:
          "Seasons result from two factors caused by tilt: (1) Sun angle (direct vs. oblique rays) and (2) Day length (longer daylight delivers more solar energy).",
        deepDive:
          "Earth's orbit is nearly circular, with an eccentricity of only e = 0.0167. At perihelion (early January), Earth is 147.1 million km from the Sun. At aphelion (early July), it is 152.1 million km away—a minor 3.3% distance variation. This causes only a ~6.7% difference in solar irradiance, vastly overshadowed by the geometric impact of the 23.44° axial tilt.",
        didYouKnow:
          "Above the Arctic Circle (66.5° N), the Sun does not set at all during the June solstice (the famous 'Midnight Sun')! Six months later in December, the Sun does not rise above the horizon for weeks ('Polar Night').",
        mathOrAnalogy:
          "Solar beam spreading: Sunlight striking the ground at an angle θ spreads over an area A = A₀ / sin(θ). In summer (θ = 70°), energy is concentrated. In winter (θ = 25°), the exact same beam spreads over more than double the ground area!",
      },
      astronomer: {
        summary:
          "Solar insolation is governed by Lambert's cosine law: I = S₀ · (d₀/d)² · cos(θ_z), where θ_z is the solar zenith angle, S₀ ≈ 1361 W/m² is the solar constant, and d is instantaneous heliocentric distance.",
        takeaway:
          "The subsolar declination angle oscillates sinusoidally between +23.44° (Tropic of Cancer) and -23.44° (Tropic of Capricorn) via δ_☉ ≈ 23.44° · sin[2π(N - 80)/365.25].",
        deepDive:
          "The Milankovitch cycles describe long-term variations in Earth's orbital geometry that trigger ice ages: (1) Eccentricity varies between 0.000055 and 0.0679 over ~100,000-year periods, (2) Obliquity (axial tilt) oscillates between 22.1° and 24.5° over ~41,000 years, and (3) Axial precession shifts the direction of the rotational axis in a 25,772-year circle.",
        didYouKnow:
          "Uranus has an extreme axial tilt of 97.8°—it orbits the Sun spinning virtually on its side! Each pole experiences 42 continuous years of uninterrupted sunlight followed by 42 years of continuous darkness.",
        mathOrAnalogy:
          "Daily top-of-atmosphere insolation integral: Q = (S₀/π)·(d₀/d)²·[h₀·sin(φ)·sin(δ) + cos(φ)·cos(δ)·sin(h₀)], where h₀ is the sunset hour angle arccos(-tan φ · tan δ).",
      },
    },
  },
  {
    id: "lesson-3-why-the-moon-changes-appearance",
    number: 3,
    title: "Why the Moon changes appearance",
    subtitle: "Half illuminated, changing perspectives from Earth",
    description:
      "Understand why the Moon looks different every night. The Moon does not produce its own light—it reflects sunlight as it orbits around Earth.",
    content: {
      junior: {
        summary:
          "The Moon doesn't have a giant lightbulb inside it! It shines only because it acts like a giant dusty mirror reflecting sunlight. Just like Earth, half the Moon is always bright day, and half is dark night.",
        takeaway:
          "The Moon is always half-lit by the Sun. We just see different angles of that lit half as the Moon travels around us!",
        deepDive:
          "Imagine walking in a circle around an apple while someone shines a flashlight on one side of the apple. As you walk, you see a sliver of light, then half the apple lit, then the whole face lit, then back to a sliver! The apple didn't change—your viewing angle changed.",
        didYouKnow:
          "Moon dust (lunar regolith) is actually very dark—about the color of worn asphalt on a highway! It only looks brilliant white in the sky because the rest of space is pitch black.",
        mathOrAnalogy:
          "The Moon's albedo (reflectivity) is only ~0.12. That means it absorbs 88% of sunlight and bounces back only 12%!",
      },
      explorer: {
        summary:
          "At all times, exactly 50% of the Moon's spherical surface is illuminated by the Sun (except during rare lunar eclipses). The changing phases we see from Earth are purely geometric: they represent the fraction of that illuminated hemisphere visible from our vantage point.",
        takeaway:
          "Lunar phases are NOT caused by Earth's shadow! (Earth's shadow only touches the Moon during a lunar eclipse once or twice a year).",
        deepDive:
          "Because the Moon orbits Earth once every ~29.5 days relative to the Sun, the angle between the Sun, Earth, and Moon (the phase angle α) continuously increases. The illuminated fraction k of the visible disk is given by the elegant formula: k = (1 + cos α) / 2. When α = 180° (Full Moon), k = 1.0 (100%). When α = 0° (New Moon), k = 0.0 (0%).",
        didYouKnow:
          "The Moon is in 'tidal locking' (synchronous rotation) with Earth. It rotates on its own axis in exactly the same time it takes to orbit Earth (27.3 days). This is why Earthlings always see the same face—humanity never saw the lunar farside until Soviet spacecraft Luna 3 photographed it in 1959!",
        mathOrAnalogy:
          "Illuminated fraction equation: k = (1 - cos θ) / 2 where θ is the elongation angle between Sun and Moon as seen from Earth. At First Quarter (θ = 90°), cos(90°) = 0, so k = 0.50 (exactly half lit).",
      },
      astronomer: {
        summary:
          "Phase geometry is defined by the lunar phase angle α (the angle Sun-Moon-Earth). The phase function exhibits non-Lambertian backscattering due to the porous microscopic structure of lunar regolith, causing the dramatic 'opposition surge'.",
        takeaway:
          "A Full Moon is roughly 12 to 14 times brighter than a First Quarter Moon, despite having only twice the illuminated surface area, because shadows inside microscopic dust pits vanish at zero phase angle.",
        deepDive:
          "The Hapke scattering model quantitatively explains the lunar photometric curve. Coherent backscatter and shadow hiding at small phase angles (<5°) produce a non-linear brightness spike known as the opposition effect. Furthermore, the Moon's orbit is elliptical (eccentricity e = 0.0549), causing its apparent angular diameter to vary between 29.3 arcminutes at apogee (406,700 km) and 34.1 arcminutes at perigee (356,400 km)—a 14% size difference that produces 'Supermoons'.",
        didYouKnow:
          "Because of orbital eccentricity and tilt, the Moon appears to nod slightly up-and-down and wobble side-to-side—an effect called 'lunar libration'. Over time, observers on Earth can actually see 59% of the lunar surface rather than just 50%!",
        mathOrAnalogy:
          "Apparent lunar magnitude: m_V = -12.74 + 0.026·|α| + 4.0×10⁻⁹·α⁴. At Full Moon (α ≈ 0°), m_V ≈ -12.7. At Quarter Moon (α = 90°), m_V ≈ -10.0 (over 10 times dimmer!).",
      },
    },
  },
  {
    id: "lesson-4-lunar-phases",
    number: 4,
    title: "Lunar phases: from New Moon to Full Moon",
    subtitle: "The 8 distinct stages of the 29.53-day synodic cycle",
    description:
      "Follow the complete lunar cycle step-by-step: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Third Quarter, and Waning Crescent.",
    content: {
      junior: {
        summary:
          "The Moon follows a beautiful 8-step dance every month! It starts dark as a New Moon, grows into a thin smile (Waxing Crescent), reaches half-face (First Quarter), balloons into a fat football (Waxing Gibbous), shines bright as a Full Moon, and then shrinks all the way back!",
        takeaway:
          "'Waxing' means growing bigger (right side lit); 'Waning' means shrinking smaller (left side lit).",
        deepDive:
          "A handy trick to remember: in the Northern Hemisphere, when the illuminated Moon looks like the letter 'D', it is growing (Waxing / Developing). When it looks like the letter 'C', it is shrinking (Waning / Closing down)!",
        didYouKnow:
          "The word 'month' comes from the ancient word 'moon-th'! Almost all ancient human calendars were based on counting the 29.5 days between one New Moon and the next.",
        mathOrAnalogy:
          "The lunar cycle takes about 29 and a half days. That is almost 4 whole weeks of changing night sky views!",
      },
      explorer: {
        summary:
          "The 8 canonical lunar phases repeat every 29.53 days (the synodic month). Waxing phases show sunlight on the eastern limb (western side of Moon as seen from Earth, appearing on the right in the Northern Hemisphere).",
        takeaway:
          "Key phases: New Moon (0°), Waxing Crescent (45°), First Quarter (90°), Waxing Gibbous (135°), Full Moon (180°), Waning Gibbous (225°), Third Quarter (270°), Waning Crescent (315°).",
        deepDive:
          "Rise and set times are locked directly to the lunar phase! Because the Moon moves ~12.2° eastward each day relative to the Sun, it rises about 50 minutes later every single day. A First Quarter Moon always rises around noon and sets at midnight. A Full Moon always rises at sunset and sets at sunrise.",
        didYouKnow:
          "When the Moon is a thin crescent, you can often see the dark rest of the Moon glowing with an eerie ghostly gray light. Leonardo da Vinci first correctly explained this in the 1500s: it is 'earthshine'—sunlight reflecting off Earth's oceans and clouds onto the Moon!",
        mathOrAnalogy:
          "Daily lunar lag: 24 hours ÷ 29.53 days ≈ 48.8 minutes per day. If the Moon rises at 8:00 PM tonight, tomorrow it will rise around 8:49 PM.",
      },
      astronomer: {
        summary:
          "The synodic month ($P_\\text{syn} = 29.53059\\text{ days}$) differs from the sidereal month ($P_\\text{sid} = 27.32166\\text{ days}$) because Earth orbits the Sun while the Moon orbits Earth.",
        takeaway:
          "Fundamental orbital relationship: $1/P_\\text{syn} = 1/P_\\text{sid} - 1/P_\\text{Earth}$. The Moon must travel an extra $26.9^\\circ$ ($~2.21\\text{ days}$) along its orbit to realign with the Sun.",
        deepDive:
          "In 27.32 days, the Moon completes a full 360° revolution relative to the distant stars (the sidereal period). However, during those 27.3 days, Earth has advanced by ~27° in its orbit around the Sun (360° × 27.3 / 365.25). Therefore, for the Moon to reach the same geometric alignment with the Sun (New Moon to New Moon), it must travel for an extra 2.21 days to catch up. This fundamental distinction between sidereal and synodic reference frames applies to all moons and planetary synodic periods across the solar system.",
        didYouKnow:
          "The anomalistic month (perigee to perigee) is 27.55 days, and the draconic month (node to node) is 27.21 days. The beat frequencies of these three distinct lunar cycles govern the Saros eclipse prediction cycle!",
        mathOrAnalogy:
          "Phase angle calculation: $\\alpha(t) = \\omega_\\text{syn} \\cdot t = (2\\pi / 29.53059) \\cdot t$. Illuminated fraction $k = (1 + \\cos\\alpha)/2$. At $t = 7.38\\text{ days}$ (First Quarter), $\\alpha = \\pi/2$, $k = 0.50$.",
      },
    },
  },
  {
    id: "lesson-5-solar-eclipses",
    number: 5,
    title: "Solar eclipses: when the Moon blocks the Sun",
    subtitle: "Umbra, penumbra, and the cosmic coincidence of totality",
    description:
      "Examine what happens when the Moon casts its shadow onto Earth during a New Moon: total, partial, and annular solar eclipses.",
    content: {
      junior: {
        summary:
          "A solar eclipse is one of nature's greatest wonders! During daytime, the Moon passes directly between Earth and the Sun. The Moon's dark shadow falls onto Earth, turning daylight into twilight and revealing sparkling stars at noon!",
        takeaway:
          "In a solar eclipse, the Moon covers the Sun and casts a shadow on Earth. (Order: Sun → Moon → Earth).",
        deepDive:
          "Never look directly at the Sun without special certified eclipse glasses! Even when 99% of the Sun is covered, the remaining sliver of solar rays can damage your eyes in a fraction of a second.",
        didYouKnow:
          "The Sun is 400 times wider than the Moon, but the Sun is also 400 times farther away! Because of this incredible coincidence, both look almost the exact same size in our sky (half a degree wide)!",
        mathOrAnalogy:
          "Hold a coin at arm's length. A tiny nickel can easily block out a giant car parked across the street if you hold it at just the right distance from your eye!",
      },
      explorer: {
        summary:
          "A solar eclipse occurs only at New Moon when the Moon passes through the ecliptic plane (at a node). The Moon casts a two-part shadow into space: the dark inner 'umbra' and the lighter outer 'penumbra'.",
        takeaway:
          "Total solar eclipse: observer is in the umbra (Sun 100% blocked, solar corona visible). Partial eclipse: observer is in the penumbra. Annular eclipse: Moon is near apogee, leaving a 'ring of fire'.",
        deepDive:
          "The Moon's umbra shadow cone tapers to a narrow tip that barely reaches Earth's surface, creating a totality path only ~100 to 250 kilometers wide. Observers in this path experience up to 7.5 minutes of daytime darkness, an eerie 10°F temperature drop, strange 360° sunset colors around the horizon, and the emergence of the ethereal pearly-white solar corona.",
        didYouKnow:
          "Because tidal friction is slowly boosting the Moon into a higher orbit (~3.8 cm per year), in about 600 million years the Moon will be too far away to ever completely cover the Sun. Total solar eclipses will cease to exist on Earth!",
        mathOrAnalogy:
          "Umbra speed across Earth: Because the Moon orbits eastward at ~1.0 km/s while Earth rotates eastward, the umbral shadow races across Earth's surface at over 1,700 to 8,000 km/h (Mach 1.5 to Mach 7)!",
      },
      astronomer: {
        summary:
          "Angular diameter ratio: $\\theta_\\text{Moon} / \\theta_\\text{Sun} = (R_\\text{Moon}/d_\\text{Moon}) / (R_\\text{Sun}/d_\\text{Sun}) \\approx 0.98$ to $1.06$. Totality requires an eclipse magnitude $M \\ge 1.000$ and alignment within the ecliptic limit.",
        takeaway:
          "Solar eclipses proved Einstein's General Theory of Relativity in 1919 when Sir Arthur Eddington photographed starlight deflected by the Sun's gravitational field during totality.",
        deepDive:
          "The geometry of the shadow cone is derived from similar triangles: the umbra length $L_u = R_M \\cdot d_M / (R_S - R_M) \\approx 374,000\\text{ km}$. Because the Moon's distance fluctuates between $356,400\\text{ km}$ (perigee) and $406,700\\text{ km}$ (apogee), $L_u$ is often shorter than the Earth-Moon distance. When Earth is beyond the umbral vertex, an 'antumbra' is formed, producing an annular eclipse where the apparent photosphere forms a bright annulus around the lunar silhouette.",
        didYouKnow:
          "Baily's beads and the Diamond Ring effect occur during the final seconds before totality when the last beams of sunlight shine through deep topographical valleys and craters along the lunar limb.",
        mathOrAnalogy:
          "Einstein gravitational deflection angle verified during 1919 solar eclipse: $\\Delta\\phi = 4GM / (c^2 b) = 1.75$ arcseconds at the solar limb ($b = R_\\odot$).",
      },
    },
  },
  {
    id: "lesson-6-lunar-eclipses",
    number: 6,
    title: "Lunar eclipses: Earth's shadow on the Moon",
    subtitle: "Why the Moon turns blood-red during totality",
    description:
      "Explore what happens when Earth passes directly between the Sun and Moon: penumbral, partial, and blood-red total lunar eclipses.",
    content: {
      junior: {
        summary:
          "In a lunar eclipse, Earth steps between the Sun and the Moon! Earth's giant shadow sweeps across the Moon, turning its bright white face into a dramatic glowing copper-red 'Blood Moon'.",
        takeaway:
          "In a lunar eclipse, Earth blocks sunlight from reaching the Moon. (Order: Sun → Earth → Moon).",
        deepDive:
          "Why does the Moon turn red instead of going completely black? Because Earth has an atmosphere! Sunlight filters through all the sunrises and sunsets happening around the rim of Earth at that exact moment. That sunset light bends through our air and shines onto the Moon!",
        didYouKnow:
          "Unlike a solar eclipse (which you can only see from a narrow strip of land), a lunar eclipse can be seen safely by everyone on the entire nighttime half of Earth at the same time!",
        mathOrAnalogy:
          "If you stood on the Moon during a total lunar eclipse, you would look up and see Earth blocking the Sun, surrounded by a glowing fiery red ring: every sunrise and sunset on Earth happening all at once!",
      },
      explorer: {
        summary:
          "A lunar eclipse happens only at Full Moon when the Moon passes through Earth's shadow. Earth is much larger than the Moon, so its umbra shadow cone is about 1.4 million km long and ~9,200 km wide at lunar orbit—nearly three times the Moon's diameter!",
        takeaway:
          "Rayleigh scattering in Earth's atmosphere filters out blue light and bends reddish light into the shadow cone, painting the eclipsed Moon a deep copper-red color.",
        deepDive:
          "A total lunar eclipse can last over 1 hour and 40 minutes in totality (much longer than a solar eclipse's brief few minutes) because Earth's shadow is colossal compared to the Moon. Lunar eclipses are completely safe to view with the naked eye, binoculars, or telescopes without any filters.",
        didYouKnow:
          "In 1504, Christopher Columbus was stranded in Jamaica and used his German astronomical almanac to predict a total lunar eclipse, frightening the local indigenous chiefs into giving his starving crew food and supplies!",
        mathOrAnalogy:
          "Danjon Scale: Astronomers rate the darkness of a lunar eclipse from L = 0 (very dark eclipse, almost invisible) to L = 4 (bright copper-red or orange eclipse) depending on volcanic dust and cloud cover in Earth's atmosphere.",
      },
      astronomer: {
        summary:
          "Refraction through the terrestrial atmospheric ring is described by Snell's law: $\\delta \\approx 2 \\int (n-1) / n \\cdot (r_0 / r) dr$. Photons passing through the troposphere and stratosphere undergo Rayleigh scattering (cross-section $\\sigma_R \\propto \\lambda^{-4}$), leaving only long-wavelength red photons ($\\lambda > 650\\text{ nm}$) to illuminate the lunar surface.",
        takeaway:
          "Lunar eclipse photometry serves as a direct proxy for transiting exoplanet transmission spectroscopy, allowing astronomers to test atmospheric biosignature detection techniques.",
        deepDive:
          "Earth's shadow is enlarged by approximately 2% beyond simple geometric ray tracing due to the aerosol and ozone extinction layer in the upper atmosphere. The umbra radius at lunar distance: $r_u = R_E - d_M \\cdot (R_S - R_E) / d_S \\approx 4,600\\text{ km}$. Because the Moon's radius is $1,737\\text{ km}$, the ratio $r_u / R_M \\approx 2.65$, allowing totality to endure up to 107 minutes when the Moon passes centrally through the umbra.",
        didYouKnow:
          "During totality, the lunar surface temperature plummets from +130°C (+266°F) in direct sunlight down to -100°C (-148°F) in less than an hour! This severe thermal shock causes lunar rocks to fracture and shed micro-dust.",
        mathOrAnalogy:
          "Atmospheric refraction angle $\\theta_\\text{refr} \\approx 1.14^\\circ$, sufficient to bend red sunlight past the 0.5° solar diameter disk and deep into the central umbral shadow.",
      },
    },
  },
  {
    id: "lesson-7-tides-and-gravity",
    number: 7,
    title: "Tides and gravitational interactions",
    subtitle: "Differential gravity, tidal bulges, and spring vs. neap tides",
    description:
      "Learn how the gravitational pull of the Moon and Sun stretches Earth's oceans into two opposing tidal bulges, creating daily high and low tides.",
    content: {
      junior: {
        summary:
          "Have you ever noticed the ocean water rising up the beach and then sliding back down hours later? That is the Moon's gravity tugging on our water! The Moon pulls the ocean toward itself, creating giant water bulges called tides.",
        takeaway:
          "Tides are caused by the Moon's gravity pulling on Earth's oceans. High tide happens twice every day!",
        deepDive:
          "Why are there two high tides a day instead of just one? Because the Moon pulls hardest on the ocean nearest to it, pulls the solid Earth a medium amount, and pulls the ocean on the far side the least! That leaves two bulges: one facing the Moon, and one on the opposite side!",
        didYouKnow:
          "In the Bay of Fundy in Canada, the difference between low tide and high tide can be over 16 meters (53 feet)—as tall as a four-story building!",
        mathOrAnalogy:
          "Earth spins inside these two water bulges like a dancer spinning inside a loose hula-hoop. As your beach rotates through a bulge, you experience high tide!",
      },
      explorer: {
        summary:
          "Tides are caused by differential gravity (tidal forces). The gravitational force decreases with distance ($F \\propto 1/d^2$), so the Moon pulls the near side of Earth stronger than Earth's center, and pulls Earth's center stronger than the far side.",
        takeaway:
          "Spring tides (highest high tides) occur when Sun and Moon align at New and Full Moon. Neap tides (weakest tides) occur when Moon is at 90° right angles (First and Third Quarter).",
        deepDive:
          "Even though the Sun is 27 million times more massive than the Moon, the Moon's tidal force on Earth is 2.2 times STRONGER than the Sun's! This is because tidal force falls off with the CUBE of distance ($1/d^3$) rather than the square ($1/d^2$). Because the Moon is 400 times closer than the Sun, its proximity gives it dominant tidal influence.",
        didYouKnow:
          "Tides don't just affect water—they affect solid rock too! Earth's rocky crust actually rises and falls by up to 30 centimeters (1 foot) twice every day under the Moon's tidal pull ('Earth tides').",
        mathOrAnalogy:
          "Tidal cycle timing: Because the Moon advances in its orbit while Earth rotates, the high-tide cycle repeats every 12 hours and 25 minutes (two high tides every 24 hours 50 minutes).",
      },
      astronomer: {
        summary:
          "The tidal acceleration tensor is the spatial derivative of the gravitational field: $a_\\text{tidal} = -\\nabla(\\nabla\\Phi) \\approx \\frac{2 G M R_E}{d^3}$. Because it scales with $d^{-3}$, the ratio of lunar to solar tidal force is: $(M_M / M_S) \\cdot (d_S / d_M)^3 \\approx 2.18$.",
        takeaway:
          "Tidal friction exerts a braking torque on Earth's rotation: $\\tau = -\\frac{3}{2} k_2 \\frac{G M_M^2 R_E^5}{d^6} \\sin(2\\delta)$, transferring rotational energy into lunar orbital expansion ($+3.82\\text{ cm/year}$).",
        deepDive:
          "Because of ocean friction against shallow sea floors (like the Bering Sea), Earth's tidal water bulges are carried ahead of the Earth-Moon line by an angle $\\delta \\approx 2.9^\\circ$. The gravitational attraction of this offset bulge pulls the Moon forward along its orbit, accelerating it into a higher, wider orbit while simultaneously exerting a decelerating drag torque on Earth's spin. Eventually (in ~50 billion years, ignoring solar evolution), Earth and Moon would achieve mutual tidal locking, with both bodies permanently presenting the same face to each other.",
        didYouKnow:
          "Jupiter's volcanic moon Io experiences tidal flexing so extreme from Jupiter and neighboring moons that its rocky interior is heated to molten lava, making it the most volcanically active body in the solar system!",
        mathOrAnalogy:
          "Tidal height potential in equilibrium theory: $\\zeta = \\frac{3}{4} \\frac{M_M}{M_E} \\frac{R_E^4}{d^3} (3 \\cos^2\\psi - 1) \\approx 0.54\\text{ meters}$ for the lunar component.",
      },
    },
  },
];

export const MODULE_05_QUIZ: QuizQuestion[] = [
  {
    id: "m5_q1",
    question: "What is the primary cause of seasons on planet Earth?",
    options: [
      "Earth's 23.44° axial tilt as it orbits the Sun",
      "Earth getting significantly closer to the Sun in summer",
      "Solar flares heating up Earth's atmosphere",
      "The Moon casting shadows on different continents",
    ],
    correctIndex: 0,
    explanation:
      "Earth's seasons are caused by its 23.44° axial tilt. When a hemisphere tilts toward the Sun, it receives steeper, more concentrated sunlight and longer daylight hours. Earth is actually furthest from the Sun in July during Northern Hemisphere summer!",
    hint: "Think about why Australia has summer in December while North America has winter.",
  },
  {
    id: "m5_q2",
    question: "Why does the Moon exhibit changing phases from New Moon to Full Moon?",
    options: [
      "Earth's shadow falls onto the Moon at different angles every night",
      "Clouds in space periodically cover parts of the lunar surface",
      "As the Moon orbits Earth, we see different proportions of its sunlit half",
      "The Moon's internal nuclear glow turns on and off each week",
    ],
    correctIndex: 2,
    explanation:
      "Half of the Moon is always lit by the Sun. As the Moon travels around Earth, our angle of view changes, revealing anywhere from 0% (New Moon) to 100% (Full Moon) of that illuminated half. Earth's shadow is only involved during a lunar eclipse!",
    hint: "Remember: half the Moon is always lit. What changes is our viewpoint from Earth.",
  },
  {
    id: "m5_q3",
    question: "Why don't solar and lunar eclipses occur every single month?",
    options: [
      "The Moon's orbit is tilted by about 5.145° relative to Earth's orbital plane",
      "The Moon moves too fast for shadows to form every month",
      "The Sun's gravity bends light away from Earth most months",
      "Eclipses only occur during leap years",
    ],
    correctIndex: 0,
    explanation:
      "The Moon's orbital plane is tilted by ~5.145° relative to the ecliptic (Earth's orbital plane). During most New and Full Moons, the Moon passes slightly above or below the Sun-Earth alignment. Eclipses can only occur when the Moon is crossing the ecliptic plane at a 'node'.",
    hint: "Think about orbital inclination and why the shadows usually miss above or below.",
  },
  {
    id: "m5_q4",
    question:
      "Why is a synodic lunar month (~29.5 days) longer than a sidereal month (~27.3 days)?",
    options: [
      "The Moon slows down when it gets closer to Earth",
      "Because Earth moved forward in its orbit, the Moon must travel an extra ~2.2 days to realign with the Sun",
      "Leap seconds accumulate over the month",
      "Tidal friction pushes the Moon backward during Full Moon",
    ],
    correctIndex: 1,
    explanation:
      "A sidereal month (27.32 days) is a 360° orbit relative to distant stars. But because Earth moved ~27° around the Sun during that time, the Moon must travel an extra 2.2 days (~27°) to realign with the Sun and complete a full cycle of phases (synodic month = 29.53 days).",
    hint: "Remember that Earth is also moving around the Sun while the Moon orbits Earth.",
  },
  {
    id: "m5_q5",
    question: "Why does the Moon have a stronger tidal effect on Earth's oceans than the Sun?",
    options: [
      "The Moon is made of denser rock than the Sun",
      "The Moon has stronger magnetic fields than the Sun",
      "Tidal forces fall off with the cube of distance (1/d³), so the Moon's proximity outweighs the Sun's greater mass",
      "The Sun only exerts gravity on solid ground, not liquid water",
    ],
    correctIndex: 2,
    explanation:
      "Differential tidal gravitational force scales with 1/d³ (inverse cube of distance). Even though the Sun is 27 million times more massive than the Moon, the Moon is ~400 times closer, making its tidal gravitational stretch ~2.2 times stronger than the Sun's!",
    hint: "Recall the difference between standard gravity (1/d²) and differential tidal force (1/d³).",
  },
];

export const LUNAR_PHASE_CHALLENGES = [
  {
    id: "challenge_1",
    scenario:
      "Tonight in the sky, you observe a First Quarter Moon (50% illuminated on the right side).",
    question: "What lunar phase will grace the sky in roughly one week (~7.4 days from now)?",
    correctOptionId: "full_moon",
    options: [
      {
        id: "waxing_crescent",
        label: "Waxing Crescent",
        feedback: "Waxing Crescent happens BEFORE First Quarter, not after.",
      },
      {
        id: "full_moon",
        label: "Full Moon (100% lit)",
        feedback:
          "Correct! One quarter of a 29.5-day cycle (~7.4 days) brings the Moon from First Quarter to Full Moon.",
        isCorrect: true,
      },
      {
        id: "new_moon",
        label: "New Moon (0% lit)",
        feedback: "Too far! New Moon is about 3 weeks away.",
      },
      {
        id: "third_quarter",
        label: "Third Quarter",
        feedback: "Third Quarter is two weeks away, opposite First Quarter.",
      },
    ],
    astronomicalFact:
      "In one week, the Moon travels ~90° further in its orbit, bringing it directly opposite the Sun.",
  },
  {
    id: "challenge_2",
    scenario: "You are planning to watch a Total Solar Eclipse with your astronomy club.",
    question: "During which lunar phase is a solar eclipse physically possible?",
    correctOptionId: "new_moon",
    options: [
      {
        id: "full_moon",
        label: "Full Moon",
        feedback:
          "At Full Moon, Earth is between the Sun and Moon, which can only produce a lunar eclipse!",
      },
      {
        id: "first_quarter",
        label: "First Quarter",
        feedback: "At First Quarter, the Moon is 90° away from the Sun in the sky.",
      },
      {
        id: "new_moon",
        label: "New Moon",
        feedback:
          "Correct! The Moon must pass between the Sun and Earth to cast its shadow onto Earth.",
        isCorrect: true,
      },
      {
        id: "any_phase",
        label: "Any phase of the Moon",
        feedback: "Incorrect. The geometry requires Sun → Moon → Earth alignment.",
      },
    ],
    astronomicalFact:
      "A solar eclipse requires syzygy at New Moon, plus alignment with the lunar orbital node.",
  },
  {
    id: "challenge_3",
    scenario:
      "A fishing boat captain notices the highest 'Spring Tides' of the month with maximum tidal range.",
    question: "Which lunar alignments create these extreme Spring Tides?",
    correctOptionId: "new_or_full",
    options: [
      {
        id: "first_or_third",
        label: "First Quarter and Third Quarter Moons",
        feedback:
          "That produces Neap Tides (weakest tides) because Sun and Moon pull at 90° right angles.",
      },
      {
        id: "new_or_full",
        label: "New Moon and Full Moon (Syzygy)",
        feedback:
          "Spot on! The gravitational pulls of the Sun and Moon align along the same axis, reinforcing each other.",
        isCorrect: true,
      },
      {
        id: "only_spring_season",
        label: "Only during the spring season in April",
        feedback:
          "'Spring tide' comes from the German 'springen' (to leap up), not the spring season!",
      },
      {
        id: "crescent_phases",
        label: "Crescent moons only",
        feedback: "Crescents produce intermediate tidal ranges.",
      },
    ],
    astronomicalFact:
      "Spring tides happen twice every synodic month when solar and lunar tidal bulges constructively interfere.",
  },
  {
    id: "challenge_4",
    scenario: "An astronaut on the Moon looks back at Earth during a Total Lunar Eclipse.",
    question: "What does the astronaut on the Moon witness in the sky?",
    correctOptionId: "solar_eclipse_by_earth",
    options: [
      {
        id: "earth_disappears",
        label: "Earth vanishes completely",
        feedback: "Earth is huge in the lunar sky (nearly 2° across) and does not vanish.",
      },
      {
        id: "solar_eclipse_by_earth",
        label:
          "A solar eclipse where Earth completely blocks the Sun with a glowing red atmospheric ring",
        feedback:
          "Brilliant! From the Moon, a lunar eclipse is actually a solar eclipse caused by Earth!",
        isCorrect: true,
      },
      {
        id: "moon_quakes",
        label: "The Sun getting twice as bright",
        feedback: "The Sun is completely blocked by Earth's silhouette.",
      },
      {
        id: "ocean_reflection",
        label: "Bright blue sunlight reflecting off Earth's oceans",
        feedback: "Earth's night side is facing the Moon, ringed by sunset reds.",
      },
    ],
    astronomicalFact:
      "The astronaut sees all sunrises and sunsets around Earth's rim forming a fiery red ring of light.",
  },
  {
    id: "challenge_5",
    scenario: "Why doesn't the Moon's shadow hit Earth every single month at New Moon?",
    question: "What geometric property prevents monthly solar eclipses?",
    correctOptionId: "orbital_inclination",
    options: [
      {
        id: "orbital_inclination",
        label: "The Moon's orbit is tilted by 5.145° to Earth's orbital plane",
        feedback:
          "Perfect! The Moon's shadow usually passes safely above the North Pole or below the South Pole.",
        isCorrect: true,
      },
      {
        id: "speed_variation",
        label: "The Moon orbits too fast for shadows to form",
        feedback: "Shadows travel instantaneously at the speed of light!",
      },
      {
        id: "earth_flat",
        label: "Earth's atmosphere absorbs the shadow",
        feedback: "Shadows are an absence of light, not something absorbed by air.",
      },
      {
        id: "sun_movement",
        label: "The Sun moves up and down each month",
        feedback: "The ecliptic plane is fixed; it's the Moon's 5.145° tilt that matters.",
      },
    ],
    astronomicalFact:
      "Eclipses can only occur during an 'eclipse season' (~every 173.3 days) when the line of nodes points toward the Sun.",
  },
];

export const MODULE_05_SOURCES: ScientificSource[] = [
  {
    title: "NASA Science: Eclipses & Lunar Phases",
    organization: "NASA",
    url: "https://science.nasa.gov/eclipses/",
    note: "Official NASA guide to solar and lunar eclipses, umbra geometry, and viewing safety.",
  },
  {
    title: "NASA Moon: Lunar Phases & Libration",
    organization: "NASA",
    url: "https://moon.nasa.gov/moon-in-motion/moon-phases/",
    note: "Detailed ephemeris data for synodic phases, libration, and tidal locking.",
  },
  {
    title: "NOAA: What Causes Tides?",
    organization: "NASA",
    url: "https://oceanservice.noaa.gov/education/tutorial_tides/tides01_intro.html",
    note: "Comprehensive oceanographic explanation of differential gravitational forces and spring/neap tides.",
  },
  {
    title: "Earth's Seasons & Axial Obliquity",
    organization: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Effect_of_sun_angle_on_climate",
    note: "Mathematical derivation of Lambert's cosine law, subsolar latitude, and beam spreading.",
  },
  {
    title: "IAU: Standards for Astronomical Time & Ephemerides",
    organization: "IAU",
    url: "https://www.iau.org/public/themes/measuring/",
    note: "Official astronomical constants for sidereal vs synodic month durations.",
  },
];

export const MODULE_05_LESSON: LessonContract = {
  lessonId: "module-05-earth-moon",
  moduleId: "05",
  title: "Earth, Moon & Eclipses",
  objectives: [
    "Demonstrate how Earth's 24-hour axial rotation produces day and night while its 23.44° axial tilt drives the seasons",
    "Explain why lunar phases result from changing geometric viewing angles of the Moon's sunlit hemisphere, not Earth's shadow",
    "Model the 5.145° orbital inclination of the Moon and explain why eclipses do not occur every month",
    "Distinguish between total, partial, and annular solar eclipses and explain why totality is a cosmic coincidence",
    "Derive the difference between the 27.32-day sidereal month and the 29.53-day synodic month",
    "Analyze differential gravitational forces causing twice-daily ocean tides and spring vs. neap tidal extremes",
  ],
  gradeLevelContent: {
    junior: {
      introHook:
        "Have you ever wondered why the Moon changes from a tiny silver smile into a giant glowing silver ball? Or why summer is hot and winter is cold? Step into our 3D cosmic simulator to take control of the Sun, Earth, and Moon!",
      coreConcepts: [
        "Earth rotates once every 24 hours, turning your town toward the Sun for day and away for night.",
        "Seasons happen because Earth leans like a tower (axial tilt), NOT because of distance to the Sun.",
        "The Moon reflects sunlight. We see different shapes because the Moon travels in a circle around us.",
        "A solar eclipse happens when the Moon blocks the Sun; a lunar eclipse happens when Earth shadows the Moon.",
      ],
      explanatoryText:
        "Think of Earth and the Moon like two dancers dancing around a bright campfire (the Sun). Earth spins around like a top while dancing, creating day and night. The Moon dances in a circle around Earth, showing us different slices of its glowing face. When they line up in a straight line, we get breathtaking eclipses!",
      funFacts: [
        "Earth is actually closest to the Sun in January during the freezing Northern Hemisphere winter!",
        "The Sun is 400 times wider than the Moon, but also 400 times farther away, making them look the same size!",
        "The Moon's gravity makes Earth's oceans bulge out like two giant water wings, creating high tides twice a day!",
      ],
      quizQuestions: MODULE_05_QUIZ.slice(0, 3),
    },
    explorer: {
      introHook:
        "Earth and the Moon form an intimate gravitational binary system. Unravel the geometric choreography of Earth's 23.44° axial tilt, the Moon's 5.145° orbital incline, and the difference between sidereal and synodic lunar months.",
      coreConcepts: [
        "Earth rotates eastward every 23h 56m (sidereal) and 24h 00m (solar day).",
        "Axial tilt (23.44°) controls solar elevation and day length; orbital distance variation (3.3%) has minimal impact.",
        "The Moon's 8 phases repeat every 29.53 days as the illuminated fraction k = (1 + cos α)/2 changes.",
        "Eclipses occur only during eclipse seasons when the Moon crosses the ecliptic plane at an orbital node.",
        "Differential tidal gravity scales with 1/d³, making the Moon's tidal pull 2.2 times stronger than the Sun's.",
      ],
      explanatoryText:
        "Seasons, lunar phases, and eclipses are three of the most frequently misunderstood topics in astronomy. By interacting directly with a physics-driven 3D model, you can observe that the Moon is ALWAYS half-illuminated by the Sun, that Earth's shadow never causes routine lunar phases, and that eclipses require precise line-of-node syzygy alignment.",
      depthNotes:
        "The Moon is in synchronous rotation (tidal locking), rotating on its axis in 27.32 days—the exact same duration as its orbit. As a result, humanity only ever sees the nearside from Earth.",
      mathExplanation:
        "Synodic vs. Sidereal equation: 1/T_syn = 1/T_sid - 1/T_Earth. 1/29.5306 = 1/27.3217 - 1/365.256. The Moon needs an extra 2.2 days to travel the extra 27° to realign with the Sun.",
      funFacts: [
        "During a total lunar eclipse, the Moon turns blood-red because Earth's atmosphere bends red light from all worldwide sunrises and sunsets into the shadow cone!",
        "Tidal friction is causing Earth's rotation to slow down by ~2 milliseconds per century, and the Moon is spiraling outward by 3.8 cm per year.",
        "In about 600 million years, the Moon will have moved too far away to ever produce a total solar eclipse.",
      ],
      quizQuestions: MODULE_05_QUIZ.slice(0, 4),
    },
    astronomer: {
      introHook:
        "Explore astrodynamical mechanics: Euler angle rotations, Lambertian insolation, Saros eclipse cycles, line of nodes precession (18.6-year nodal cycle), and the differential gravitational tensor driving ocean and solid-body Earth tides.",
      coreConcepts: [
        "Insolation follows Lambert's cosine law: I = S₀ · (d₀/d)² · cos θ_z with subsolar declination δ_☉ = 23.44° · sin[2π(N-80)/365.25].",
        "The Moon's orbital plane is inclined at 5.145° to the ecliptic, with nodal precession completing a retrograde cycle every 18.61 years.",
        "Syzygy at or near a node produces eclipses within the solar ecliptic limit (15.5°–18.5°) and lunar ecliptic limit (9.5°–12.2°).",
        "Synodic month (29.53059 d), sidereal month (27.32166 d), anomalistic month (27.55455 d), and draconic month (27.21222 d) synthesize the Saros cycle (6,585.32 days).",
        "Tidal acceleration tensor a_tidal ∝ G·M·R / d³ generates quadrupole bulges with phase lag δ ≈ 2.9° due to oceanic dissipation.",
      ],
      explanatoryText:
        "The Sun-Earth-Moon three-body system provides an exquisite laboratory for gravitational perturbation theory. Secular perturbations cause the lunar line of apsides to rotate prograde every 8.85 years and the line of nodes to regress westward every 18.61 years. Understanding these cycles allows precise eclipse prediction across millennia without empirical fitting.",
      depthNotes:
        "The Saros period (223 synodic months = 242 draconic months = 239 anomalistic months = 6585.321 days ≈ 18 years 11.3 days) guarantees that nearly identical eclipses recur with similar geometry, displaced by 120° westward on Earth due to the fractional 0.321 day (7.7 hours).",
      mathExplanation:
        "Differential tidal acceleration: a_t = (2 G M R_E / d³) · [3 cos²(ψ) - 1]. Ratio of lunar to solar tide: (M_M / M_S) · (d_S / d_M)³ = (7.35×10²² / 1.99×10³⁰) · (1.496×10⁸ / 3.844×10⁵)³ ≈ 2.18.",
      funFacts: [
        "Earth's solid rock crust flexes by up to 30 cm twice a day in response to lunar tides, stressing fault lines and slightly triggering micro-seismic events.",
        "Solar eclipses enabled the discovery of helium in 1868 (via solar prominence emission spectroscopy) and confirmed general relativity in 1919 (via gravitational light deflection).",
      ],
      quizQuestions: MODULE_05_QUIZ,
    },
  },
  visualizationType: "orbit-sim",
  interactions: [
    "3D real-time controllable Sun-Earth-Moon orbital engine",
    "Free camera navigation + viewpoints from Earth, Moon, Sun, and Top-down ecliptic plane",
    "Interactive toggles for orbit paths, celestial labels, axial tilt vector (23.44°), and umbra/penumbra shadow cones",
    "Time controls: pause, play, reverse, sim speed (0.25x to 30x), +1 day advance, and +1 lunar cycle advance",
    "Live lunar phase angle readout and illuminated fraction calculation",
    "Interactive lunar phase predictor challenge",
    "Earth daylight & seasonal latitude explorer comparing summer vs. winter insolation",
    "Moon orbital inclination slider (0° to 10°) demonstrating why eclipses do not occur monthly",
    "Node alignment and eclipse geometry sandbox",
  ],
  relatedConcepts: [
    "Axial Tilt & Obliquity (23.44°)",
    "Day & Night Rotation (24h)",
    "Insolation & Lambert's Cosine Law",
    "Lunar Phases & Phase Angle",
    "Tidal Locking & Synchronous Orbit",
    "Orbital Inclination (5.145°)",
    "Line of Nodes & Syzygy",
    "Total, Partial & Annular Solar Eclipses",
    "Total & Partial Lunar Eclipses",
    "Sidereal vs. Synodic Lunar Month",
    "Differential Gravity & Ocean Tides",
    "Spring & Neap Tides",
  ],
  completionCriteria:
    "Explore the 3D Sun-Earth-Moon simulation, test the seasonal and eclipse inclination experiments, complete the Lunar Phase Challenge, and score at least 80% on the Knowledge Check.",
  scientificSources: MODULE_05_SOURCES,
};
