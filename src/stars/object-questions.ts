import type { ObservedObject } from "./observed-objects";

export type ObjectQuestion = { q: string; a: string };

// Category-level explainers: the questions people most often ask about each
// class of object. Answers stay within mainstream, well-established astronomy.
const BY_CATEGORY: Record<string, ObjectQuestion[]> = {
  Quasar: [
    {
      q: "How does a quasar form?",
      a: "A quasar switches on when large amounts of gas fall toward a supermassive black hole at the centre of a galaxy. The gas cannot fall straight in — it carries angular momentum, so it settles into a flat, fast-spinning accretion disk. Friction and magnetic stresses inside that disk heat the gas to hundreds of thousands of degrees, and it radiates so fiercely that the small central region outshines all the hundreds of billions of stars in the host galaxy. Galaxy collisions and mergers are the usual way to funnel enough gas inward, which is why quasars were far more common when the Universe was young and galaxies crowded together more often.",
    },
    {
      q: "Why is a quasar so bright if a black hole traps light?",
      a: "The light does not come from inside the black hole. It comes from the gas outside the event horizon. As matter spirals inward it loses gravitational energy, and infall around a black hole is the most efficient energy release known in nature — up to roughly 10 to 30 percent of the mass falling in is converted to radiation, compared with under 1 percent for nuclear fusion in stars. So a modest amount of swallowed gas each year produces an enormous, steady blaze.",
    },
    {
      q: "What are the jets shooting out of a quasar?",
      a: "Magnetic field lines threading the spinning disk and the rotating black hole get wound up into a tight helix. That twisted magnetic structure launches a narrow beam of charged particles along the spin axis at close to the speed of light. These jets can stay collimated for hundreds of thousands of light-years, far beyond the host galaxy, and they glow in radio waves because electrons spiral around the magnetic field.",
    },
    {
      q: "How far away are quasars, and are we seeing the past?",
      a: "Quasars are typically billions of light-years away, so we always see them as they were billions of years ago. Their light is also stretched by the expansion of space, which is measured as redshift; the higher the redshift, the earlier in cosmic history the light left the object.",
    },
    {
      q: "Could a quasar ever be dangerous to Earth?",
      a: "Not at these distances. Quasars are extraordinarily luminous but extremely remote, so the energy reaching Earth is tiny. A quasar would only matter to life if it were within our own galaxy and beaming directly at us, and there is no such object anywhere near us.",
    },
    {
      q: "Do quasars ever switch off?",
      a: "Yes. A quasar burns only while fuel keeps arriving. Once the surrounding gas is used up or blown away by the radiation and jets, the nucleus dims and the galaxy becomes quiet — leaving a dormant supermassive black hole. Most large galaxies today, including the Milky Way, host such a sleeping giant.",
    },
  ],
  "Neutron star": [
    {
      q: "How does a neutron star form?",
      a: "When a star far heavier than the Sun exhausts its nuclear fuel, its iron core can no longer support itself and collapses in less than a second. Protons and electrons are crushed together into neutrons, and the collapse halts abruptly when the neutrons resist further compression. The rebound and the flood of neutrinos blow off the outer layers as a supernova, leaving behind a city-sized sphere of neutrons holding more mass than the Sun.",
    },
    {
      q: "Why do neutron stars spin so fast?",
      a: "Conservation of angular momentum. The original stellar core was hundreds of thousands of kilometres wide and turned slowly; when it shrinks to about 20 kilometres across, it must spin much faster, exactly as a skater speeds up by pulling their arms in. Young neutron stars can rotate dozens of times a second, and some recycled ones hundreds of times a second.",
    },
    {
      q: "What makes a pulsar pulse?",
      a: "A pulsar is a neutron star with an intense magnetic field whose magnetic axis is tilted away from its rotation axis. Radiation streams out along the magnetic poles in two narrow beams. As the star spins, those beams sweep across space like a lighthouse, and if one crosses Earth we register a sharp pulse every rotation. The star itself shines steadily — it is the geometry that blinks.",
    },
    {
      q: "How dense is neutron-star matter?",
      a: "A sugar-cube-sized piece would weigh about a billion tonnes on Earth. The density matches that inside an atomic nucleus, which is why neutron stars are sometimes described as a single gigantic nucleus held together by gravity rather than by nuclear forces alone.",
    },
    {
      q: "What is a magnetar?",
      a: "A magnetar is a young neutron star with a magnetic field up to a thousand times stronger than a normal pulsar's — the strongest magnetism known in the Universe. Stresses in that field can crack the star's rigid crust, releasing sudden bursts of X-rays and gamma rays that can be detected across the galaxy.",
    },
    {
      q: "What happens if you add too much mass to a neutron star?",
      a: "Beyond a limit of roughly two to two and a half solar masses, neutron pressure loses the fight against gravity and the star collapses into a black hole. Neutron stars in close binaries can also spiral together and merge, which produces gravitational waves and forges heavy elements such as gold and platinum.",
    },
  ],
  "Black hole": [
    {
      q: "How does a black hole form?",
      a: "Stellar-mass black holes form when a very massive star runs out of fuel and its core collapses past the neutron-star limit, so nothing can stop the compression. Supermassive black holes, millions to billions of times the Sun's mass, grew instead over cosmic time through a mixture of steady gas accretion and the merging of smaller black holes as their host galaxies collided.",
    },
    {
      q: "What exactly is the event horizon?",
      a: "It is not a surface but a boundary in spacetime: the distance from the centre at which escape would require travelling faster than light. Anything that crosses it, including light, cannot come back out. From far away the horizon simply looks like a dark sphere, the black hole's shadow.",
    },
    {
      q: "If black holes are black, how do we see them?",
      a: "We see their effects. Gas falling in forms a superheated disk that glows in X-rays; stars near the centre of our galaxy are seen whipping around an invisible mass; light passing close by is bent into a bright ring. The Event Horizon Telescope imaged that glowing ring around the shadows of M87* and Sagittarius A*.",
    },
    {
      q: "Would a black hole suck in the Solar System?",
      a: "No. Gravity depends on mass and distance, not on being a black hole. If the Sun were magically replaced by a black hole of the same mass, the planets would keep their present orbits — it would just be very dark. Objects only fall in if they pass extremely close.",
    },
    {
      q: "What happens to something falling in?",
      a: "Approaching a stellar-mass black hole, the difference in gravity between head and feet stretches matter apart, an effect nicknamed spaghettification. To a distant observer the falling object appears to slow down and redden as it nears the horizon, never quite seeming to cross it, because time itself runs slower there in the intense gravitational field.",
    },
    {
      q: "Do black holes last forever?",
      a: "Theory predicts they slowly evaporate through Hawking radiation, a quantum effect at the horizon. The process is fantastically slow: a stellar-mass black hole would need far longer than the current age of the Universe to fade, so no evaporation has ever been observed.",
    },
  ],
  "Stellar remnant": [
    {
      q: "What is a stellar remnant?",
      a: "It is whatever a star leaves behind when it stops fusing. Low- and medium-mass stars like the Sun end as white dwarfs — hot, Earth-sized cinders. Heavier stars explode and leave a neutron star or a black hole, surrounded for thousands of years by an expanding cloud of debris called a supernova remnant.",
    },
    {
      q: "How does a supernova remnant form and evolve?",
      a: "The explosion drives material outward at thousands of kilometres per second. That shock sweeps up surrounding interstellar gas, heats it to millions of degrees so it glows in X-rays, and gradually slows over tens of thousands of years until the shell dissolves into the general interstellar medium — seeding it with the heavy elements the star made.",
    },
    {
      q: "What holds up a white dwarf if fusion has stopped?",
      a: "Electron degeneracy pressure, a quantum rule that forbids electrons from occupying the same state. It supports the star without any heat source, which is why a white dwarf can simply sit and cool for billions of years. Above about 1.4 solar masses even this fails, and the star detonates or collapses.",
    },
    {
      q: "Why do these remnants matter for us?",
      a: "Almost every atom heavier than helium in your body was assembled inside stars and scattered by their deaths. Supernova remnants are the delivery mechanism, enriching the clouds from which later stars and planets — including the Sun and Earth — condensed.",
    },
    {
      q: "Do remnants still produce light and particles?",
      a: "Yes. Shock fronts accelerate particles to near light speed, producing cosmic rays and synchrotron radio emission, while a central neutron star can energise the whole nebula for millennia. That is why many remnants remain bright across radio, optical and X-ray wavelengths long after the explosion.",
    },
  ],
  "Unusual star": [
    {
      q: "What makes this kind of star unusual?",
      a: "Most stars sit quietly on the main sequence, fusing hydrogen at a steady rate for billions of years. Unusual stars are ones caught in a short, violent or extreme phase — enormously swollen, losing mass in gales of gas, shedding shells of dust, or locked in a tight partnership with another star. Those stages last a tiny fraction of a stellar lifetime, which is why so few examples are known.",
    },
    {
      q: "How do stars become so enormous?",
      a: "When the hydrogen in the core runs out, the core contracts and heats while the outer envelope expands and cools dramatically. A star of ten or twenty solar masses can swell until it would swallow the orbits of the inner planets, becoming a red supergiant with a surface cool enough to look orange-red despite its huge luminosity.",
    },
    {
      q: "Why do massive stars lose so much mass?",
      a: "Their radiation is so intense that it physically pushes on the outer layers, driving winds that can strip solar masses of material away over just a few hundred thousand years. Pulsations and eruptions add to the loss, wrapping the star in the shells and nebulae we observe around it.",
    },
    {
      q: "How will a star like this end?",
      a: "Massive examples end as core-collapse supernovae, leaving a neutron star or a black hole. Lower-mass giants puff their envelopes off gently and settle into white dwarfs. The dividing line lies near eight solar masses at birth.",
    },
    {
      q: "How do astronomers measure a star they cannot resolve?",
      a: "By combining several independent clues: the spectrum reveals temperature and composition, parallax gives distance, brightness plus distance gives true luminosity, and interferometry or eclipses can give an actual angular size. Combining these yields radius, mass and age without ever seeing a surface in detail.",
    },
  ],
  Supergiant: [
    {
      q: "What is a supergiant star?",
      a: "A supergiant is among the largest and most luminous stars known, typically born with more than ten times the Sun's mass. After the core hydrogen is exhausted, the envelope expands enormously — hundreds to over a thousand times the Sun's radius — while the core burns through heavier and heavier elements in ever shorter stages.",
    },
    {
      q: "How does a supergiant form?",
      a: "It begins as a very massive, hot, blue main-sequence star inside a dense molecular cloud. Such stars burn their fuel recklessly fast, and within a few million years the core changes force the outer layers to swell. Depending on how much mass the winds strip away, the star can appear as a blue, yellow or red supergiant, sometimes shifting between them.",
    },
    {
      q: "Why do supergiants live such short lives?",
      a: "Luminosity rises steeply with mass, so a star twenty times heavier than the Sun radiates tens of thousands of times more energy and consumes its fuel in a few million years rather than ten billion. Everything about them — birth, evolution and death — happens on a cosmically brief timescale.",
    },
    {
      q: "What happens when a supergiant dies?",
      a: "The core builds up iron, which cannot release energy by fusion. Support vanishes, the core collapses in under a second, and the rebounding shock plus a torrent of neutrinos blows the star apart as a supernova. What remains is a neutron star or, for the heaviest cases, a black hole.",
    },
    {
      q: "Would a nearby supernova threaten Earth?",
      a: "Only within roughly 30 light-years would a supernova seriously damage Earth's ozone layer. Known supergiant candidates are hundreds of light-years away, so an explosion would be a spectacular sight — visible in daylight for weeks — without endangering the planet.",
    },
  ],
  "Variable star": [
    {
      q: "Why does a variable star change brightness?",
      a: "There are two families of reasons. Intrinsic variables physically pulsate: the star's outer layers trap radiation, expand, cool, become transparent again and fall back, repeating like a slow heartbeat. Extrinsic variables do not actually change — something blocks them, such as a companion star eclipsing them or dust passing across the line of sight.",
    },
    {
      q: "How does a pulsating star form and become variable?",
      a: "Pulsation is a phase, not a birth property. As a star evolves off the main sequence, its internal structure passes through a zone — the instability strip — where partially ionised helium acts like a valve, alternately absorbing and releasing radiation. Stars entering that region begin to pulsate, and they stop again once they evolve past it.",
    },
    {
      q: "Why are variable stars so useful to astronomers?",
      a: "For Cepheid variables the pulsation period is tightly linked to true luminosity. Measure how long a cycle takes, and you know the star's real brightness; compare that with how bright it looks, and you get its distance. This relation calibrated the distance scale of the Universe and underpinned the discovery of cosmic expansion.",
    },
    {
      q: "Can the changes be seen without a telescope?",
      a: "Sometimes. Some variables swing by several magnitudes and visibly appear and disappear to the unaided eye over weeks or months, while others vary by a fraction of a percent and need precise photometry to detect at all.",
    },
    {
      q: "Does variability mean the star is dying?",
      a: "Not necessarily, but it usually means the star is in an unsettled stage — either very young and still contracting, or evolved and adjusting its structure after leaving the main sequence. Steady middle-aged stars like the Sun vary only slightly.",
    },
  ],
  "Dwarf star": [
    {
      q: "What counts as a dwarf star?",
      a: "The word covers several very different objects: red dwarfs, small cool stars fusing hydrogen slowly; white dwarfs, the exposed cores left behind by dead Sun-like stars; and brown dwarfs, which never became massive enough to sustain hydrogen fusion at all. What they share is small size compared with giants.",
    },
    {
      q: "How does a white dwarf form?",
      a: "A star of up to about eight solar masses eventually ejects its outer envelope, briefly lighting it up as a planetary nebula. The exposed core — mostly carbon and oxygen, roughly Earth-sized but holding a large fraction of a solar mass — is a white dwarf. With no fuel left, it simply radiates its stored heat away over billions of years.",
    },
    {
      q: "Why do red dwarfs live so long?",
      a: "They are frugal. A low-mass star has weak gravity, a cooler core and therefore a very slow fusion rate, and convection keeps mixing fresh hydrogen into the burning region. Such stars can shine for hundreds of billions of years, far longer than the present age of the Universe, so no red dwarf has ever died of old age.",
    },
    {
      q: "What is a brown dwarf, exactly?",
      a: "An object between roughly 13 and 80 Jupiter masses — too heavy to be a planet, too light to fuse ordinary hydrogen. It can briefly burn deuterium, then cools steadily, becoming ever fainter and redder over billions of years. The nearest ones are cool enough for clouds of dust and even water to condense in their atmospheres.",
    },
    {
      q: "Can dwarf stars host habitable planets?",
      a: "Red dwarfs commonly have rocky planets, and several lie in the temperature range where liquid water is possible. The complication is that such planets must orbit very close, exposing them to strong flares and tidal locking, so whether they can keep an atmosphere is one of the biggest open questions in the field.",
    },
  ],
};

// Extra questions tied to the individual object, layered on top of the class
// explainer so each entry reaches at least five.
const BY_ID: Record<string, ObjectQuestion[]> = {
  "3c273": [
    {
      q: "Why is 3C 273 historically important?",
      a: "In 1963 Maarten Schmidt realised its baffling spectrum was ordinary hydrogen shifted far to the red, meaning the object lay billions of light-years away yet appeared star-like and brilliant. That single measurement created the concept of the quasar and, with it, the idea that supermassive black holes power galactic nuclei.",
    },
  ],
  "3c279": [
    {
      q: "What is a blazar, and why does 3C 279 flare so fast?",
      a: "A blazar is a quasar whose jet points nearly straight at us. Because the emitting plasma is racing toward Earth at almost light speed, its light is beamed and time-compressed, so changes that take weeks at the source appear to happen in hours. This is also why parts of the jet look as though they travel faster than light, an illusion of geometry called apparent superluminal motion.",
    },
  ],
  mrk231: [
    {
      q: "Why does Markarian 231 look like a wrecked galaxy?",
      a: "It is the aftermath of a merger between two galaxies. The collision drove huge quantities of gas into the centre, igniting both a fierce burst of star formation and the quasar itself, while leaving the disturbed tails and dust lanes visible around it.",
    },
  ],
  ton618: [
    {
      q: "How can a black hole get to tens of billions of solar masses?",
      a: "Through sustained feeding in the richest environments of the early Universe plus repeated mergers with other supermassive black holes. Objects like TON 618 sit at the extreme upper end of what accretion and merging can build, and their sheer mass is inferred from the enormous velocity width of gas orbiting near them.",
    },
  ],
  "crab-pulsar": [
    {
      q: "Is the Crab Pulsar connected to the supernova seen in 1054?",
      a: "Yes. Chinese and Japanese astronomers recorded a new star bright enough to see in daylight in July 1054. The pulsar is the collapsed core of that exploded star, and the surrounding nebula is its expanding debris, still visibly growing today.",
    },
  ],
  vela: [
    {
      q: "What is a pulsar glitch?",
      a: "Occasionally a pulsar's rotation speeds up abruptly instead of slowing. The favoured explanation is that a superfluid interior, spinning faster than the crust, suddenly transfers angular momentum outward. Vela is the classic glitching pulsar and has given the best evidence that neutron-star interiors are superfluid.",
    },
  ],
  b1919: [
    {
      q: "Why was the first pulsar nicknamed LGM-1?",
      a: "When Jocelyn Bell Burnell found the impossibly regular 1.34-second signal in 1967, no natural source was known to keep such precise time, so the team half-jokingly labelled it LGM-1 for 'little green men'. Finding a second, unrelated source elsewhere in the sky quickly ruled out an artificial origin.",
    },
  ],
  sgr1806: [
    {
      q: "What happened during the 2004 giant flare?",
      a: "A starquake released more energy in a fraction of a second than the Sun emits in 150,000 years. Even from 50,000 light-years away the gamma-ray pulse measurably ionised Earth's upper atmosphere — the brightest extrasolar event ever recorded in gamma rays.",
    },
  ],
  j0348: [
    {
      q: "Why do astronomers study this particular binary?",
      a: "Its combination of a very massive neutron star and a white-dwarf companion in a tight two-hour orbit makes it a precision laboratory for gravity. The orbit shrinks exactly as Einstein's general relativity predicts through gravitational-wave emission, ruling out many alternative theories.",
    },
  ],
  "sgr-a": [
    {
      q: "How do we know something invisible sits at the galactic centre?",
      a: "For decades astronomers tracked individual stars orbiting the centre of the Milky Way. One, S2, completes an orbit in about 16 years, swinging around an unseen mass of roughly four million Suns packed inside a region smaller than our Solar System. Nothing but a black hole can be that compact.",
    },
  ],
  m87star: [
    {
      q: "What was actually photographed in the first black-hole image?",
      a: "Not the hole itself, but the glowing ring of hot gas whose light is bent around it, encircling a dark central shadow about two and a half times the size of the event horizon. The image was assembled by linking radio telescopes across Earth into one planet-sized instrument.",
    },
  ],
  cygx1: [
    {
      q: "How was Cygnus X-1 identified as a black hole?",
      a: "A bright blue supergiant was seen orbiting an unseen companion far too massive to be a neutron star, and X-rays flickering on millisecond timescales showed the emitting region was tiny. It became the first widely accepted black-hole candidate — and the subject of a famous bet between Stephen Hawking and Kip Thorne.",
    },
  ],
  gw150914: [
    {
      q: "What are gravitational waves?",
      a: "Ripples in spacetime itself, produced when massive objects accelerate violently. As they pass, they stretch space in one direction and squeeze it in the other. LIGO detected the 2015 signal as a change in the length of a four-kilometre laser arm smaller than a thousandth of a proton's width.",
    },
    {
      q: "What happened in the final moments of this merger?",
      a: "Two black holes of about 36 and 29 solar masses spiralled together and merged in a fifth of a second, radiating roughly three solar masses of energy as gravitational waves — briefly outpowering all the light from every star in the observable Universe.",
    },
  ],
  siriusb: [
    {
      q: "How was Sirius B discovered before it was ever seen?",
      a: "In 1844 Friedrich Bessel noticed Sirius wobbling against the background stars and deduced an unseen companion. It was finally glimpsed in 1862 and later understood to be a white dwarf: about the size of Earth yet nearly as massive as the Sun.",
    },
  ],
  sn1987a: [
    {
      q: "Why was SN 1987A such an important supernova?",
      a: "It was the closest supernova in nearly four centuries and the first from which neutrinos were detected — a burst arriving hours before the light, confirming the theory that core collapse releases most of its energy as neutrinos. Its progenitor star had also been photographed beforehand, a unique check on stellar-evolution models.",
    },
    {
      q: "Where are the famous rings from?",
      a: "They are gas shed by the star tens of thousands of years before it exploded, now lit up as the blast wave slams into them. The collisions have been brightening and evolving in Hubble images for decades.",
    },
  ],
  betelgeuse: [
    {
      q: "Will Betelgeuse explode soon, and what will we see?",
      a: "It will go supernova, but 'soon' in stellar terms means anywhere within the next hundred thousand years. From about 550 light-years away the explosion would shine roughly as brightly as a half Moon, be visible in daylight for weeks, and pose no danger to Earth.",
    },
    {
      q: "What caused the Great Dimming of 2019 and 2020?",
      a: "Betelgeuse faded to about a third of its usual brightness. Observations showed it had ejected a huge cloud of gas that cooled into dust, partly veiling the southern half of the star — a dust screen, not an imminent explosion.",
    },
  ],
  "eta-car": [
    {
      q: "What was the Great Eruption of the 1840s?",
      a: "Eta Carinae brightened until it was the second-brightest star in the sky, expelled around ten solar masses of material, and somehow survived. That ejecta forms the two-lobed Homunculus Nebula still expanding around it today.",
    },
  ],
  uyscuti: [
    {
      q: "How can a star be over a thousand times wider than the Sun?",
      a: "Its outer envelope is extraordinarily tenuous — thinner than laboratory vacuum in places — so it can extend enormously while holding relatively little mass there. The 'surface' is simply where the gas becomes opaque, and for such stars that boundary is fuzzy and pulsating.",
    },
  ],
  wr104: [
    {
      q: "Why does WR 104 look like a pinwheel?",
      a: "Two massive stars orbit each other, and their colliding winds compress gas into dust exactly where they meet. As the pair revolves, that dust production point sweeps around, laying down a spiral trail like water from a rotating sprinkler.",
    },
  ],
  vycma: [
    {
      q: "Why is VY Canis Majoris surrounded by so much dust?",
      a: "It is a hypergiant in a violently unstable phase, ejecting material in irregular outbursts rather than a smooth wind. The expelled gas condenses into dust knots and arcs, which is why images show a lopsided, clumpy shroud rather than a neat shell.",
    },
  ],
  rigel: [
    {
      q: "Why is Rigel blue while Betelgeuse is red?",
      a: "Colour tracks surface temperature. Rigel's surface is around 12,000 degrees, hot enough to radiate mostly in blue light, whereas Betelgeuse sits near 3,500 degrees and glows red. Both are supergiants; they simply sit at different stages and masses.",
    },
  ],
  antares: [
    {
      q: "How big is Antares compared with our Solar System?",
      a: "If placed where the Sun is, its surface would extend past the orbit of Mars. It is also losing mass steadily, wrapping itself and its hot blue companion in a faint nebula of expelled gas.",
    },
  ],
  r136a1: [
    {
      q: "Is there an upper limit to how massive a star can be?",
      a: "Theory suggests radiation pressure blows away extra material above roughly 150 to 300 solar masses. R136a1 sits near that ceiling, which makes it a key test of how the most extreme stars form — probably through the merging of very massive stars in a dense young cluster.",
    },
  ],
  polaris: [
    {
      q: "Why is Polaris the North Star, and will it always be?",
      a: "It happens to lie almost exactly above Earth's rotational axis, so it barely moves in the sky. But Earth's axis wobbles over a 26,000-year cycle, so the title passes between stars — Thuban held it in ancient Egypt, and Vega will hold it in roughly 12,000 years.",
    },
  ],
  mira: [
    {
      q: "Why does Mira have a tail?",
      a: "It is racing through the interstellar medium at over 100 kilometres per second while shedding material. The gas it loses is swept behind it, forming a comet-like tail thirteen light-years long, discovered in ultraviolet light by the GALEX satellite.",
    },
  ],
  ttauri: [
    {
      q: "What is a T Tauri star?",
      a: "A star still in the making. It has formed from a collapsing cloud but has not yet started hydrogen fusion, shining instead from gravitational contraction. Such stars are wrapped in leftover disks of gas and dust — the material from which planets form — and vary irregularly as that material falls in.",
    },
  ],
  tabby: [
    {
      q: "Why did people suggest an alien megastructure around Tabby's Star?",
      a: "Its brightness dips were deep, irregular and unlike any planet transit, prompting speculation about an artificial structure. Follow-up showed the dimming is stronger in blue light than red, which means small dust particles are responsible — probably from a disintegrating body or an uneven dust cloud, not engineering.",
    },
  ],
  algol: [
    {
      q: "Why does Algol wink every few days?",
      a: "It is an eclipsing binary. Every 2.87 days the dimmer companion passes in front of the brighter star, cutting its light by about 70 percent for a few hours. Ancient names for it, such as the 'demon star', suggest the variation was noticed long before it was explained.",
    },
  ],
  proxima: [
    {
      q: "Could Proxima Centauri's planets be habitable?",
      a: "Proxima b orbits in the zone where liquid water could exist, but the star unleashes powerful flares that may strip a planetary atmosphere, and the planet is probably tidally locked with one permanent day side. Habitability therefore depends on whether such a world can hold on to its air — currently unknown.",
    },
  ],
  luhman16: [
    {
      q: "What is the weather like on a brown dwarf?",
      a: "Surprisingly dynamic. Brightness variations from Luhman 16 have been mapped into cloud patterns of hot silicate and iron condensates breaking apart and reforming, with winds reorganising the atmosphere over hours — the closest thing to studying weather on an object outside the Solar System.",
    },
  ],
  vanmaanen: [
    {
      q: "Why is a lone white dwarf interesting?",
      a: "Because its atmosphere should be pure hydrogen or helium, yet heavier elements are detected. Those metals sink out of sight within days, so their presence means the star is currently swallowing rocky debris — direct evidence that a planetary system once orbited it and left remains behind.",
    },
  ],
  methuselah: [
    {
      q: "How can a star seem older than the Universe?",
      a: "Early age estimates exceeded the cosmic age, which signalled measurement error rather than a paradox. Improved parallax from Hipparcos and Hubble revised the distance and the modelling, bringing the age to roughly 12 to 14 billion years with an uncertainty large enough to sit comfortably inside cosmic history.",
    },
  ],
  regulus: [
    {
      q: "Why is Regulus not a sphere?",
      a: "It spins near the speed at which it would tear itself apart, completing a rotation in under a day. Centrifugal force bulges the equator by roughly a third more than the polar radius, and the flattened star is hotter and brighter at the poles than at the equator.",
    },
  ],
};

export function questionsFor(item: ObservedObject): ObjectQuestion[] {
  const specific = BY_ID[item.id] ?? [];
  const general = BY_CATEGORY[item.category] ?? [];
  return [...specific, ...general];
}
