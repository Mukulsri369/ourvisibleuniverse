import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface SpacecraftModel {
  id: string;
  name: string;
  missionName: string;
  operator: "NASA" | "ISRO" | "ESA" | "Roscosmos" | "International" | "CNSA";
  launchDate: string;
  destination:
    "Low Earth Orbit" | "Moon" | "Sun / L1" | "Mars" | "Outer Solar System" | "Deep Space / L2";
  status: "Active" | "Mission Completed" | "Interstellar Cruise";
  massKg: number;
  propulsionType: string;
  powerSource: string;
  primaryInstruments: string[];
  keyMilestones: string[];
  scientificAchievements: string[];
  approxDistanceKm: number; // Current or operational distance from Earth
  approxDistanceAU: number;
  radioLatencySec: number; // One-way light travel time in seconds
  speedKmS: number;
  description: string;
  technicalSpecs: {
    dimensions: string;
    launchVehicle: string;
    costOrBudget: string;
    orbitOrTrajectory: string;
  };
  components: {
    id: string;
    name: string;
    role: string;
    engineeringDetail: string;
  }[];
}

export interface SolarSystemMissionWaypoint {
  id: string;
  spacecraftId: string;
  spacecraftName: string;
  body:
    | "Earth"
    | "Moon"
    | "Sun"
    | "Venus"
    | "Mars"
    | "Jupiter"
    | "Saturn"
    | "Uranus"
    | "Neptune"
    | "Pluto"
    | "L1"
    | "L2"
    | "Interstellar";
  distanceAU: number;
  heliocentricRadiusAU: number;
  orbitalAngleDeg: number;
  year: number;
  event: string;
  isFlybyOrOrbiter:
    "Launch" | "Flyby" | "Orbit Insertion" | "Landing" | "Stationary Halo" | "Escape";
}

export const HISTORICAL_SPACECRAFT: SpacecraftModel[] = [
  {
    id: "sputnik-1",
    name: "Sputnik 1",
    missionName: "First Artificial Earth Satellite (PS-1)",
    operator: "Roscosmos",
    launchDate: "October 4, 1957",
    destination: "Low Earth Orbit",
    status: "Mission Completed",
    massKg: 83.6,
    propulsionType: "None (Inserted by modified R-7 ICBM booster)",
    powerSource: "Three silver-zinc chemical batteries (22-day operational life)",
    primaryInstruments: [
      "Two 1-watt radio transmitters broadcasting at 20.005 MHz and 40.002 MHz",
      "Internal temperature and nitrogen pressure barometric sensors",
    ],
    keyMilestones: [
      "Oct 4, 1957: Launched from Site No. 1 at Baikonur Cosmodrome aboard an R-7 rocket",
      "Oct 4 - 26, 1957: Broadcasted legendary 'beep-beep' radio beacon heard worldwide",
      "Jan 4, 1958: Re-entered Earth atmosphere after 1,440 orbits and 92 days",
    ],
    scientificAchievements: [
      "Proved artificial objects can achieve orbital velocity (~7.8 km/s) and maintain stable Earth orbit",
      "Provided first empirical density measurements of the upper thermosphere through orbital drag decay",
      "Pioneered radio ionospheric sounding by analyzing radio waves traveling through the ionosphere",
    ],
    approxDistanceKm: 577, // Apogee altitude
    approxDistanceAU: 0.0000038,
    radioLatencySec: 0.0019,
    speedKmS: 7.8,
    description:
      "A 58-centimeter polished aluminum sphere with four swept-back whip antennas that initiated the Space Age and changed human history forever.",
    technicalSpecs: {
      dimensions: "Diameter: 58 cm sphere, Antennas: 2.4 m to 2.9 m whip rods",
      launchVehicle: "Sputnik 8K71PS (modified R-7 Semyorka)",
      costOrBudget: "Soviet Strategic Defense / Academy of Sciences priority program",
      orbitOrTrajectory:
        "Elliptical Low Earth Orbit (Perigee: 215 km, Apogee: 939 km, Inclination: 65.1°)",
    },
    components: [
      {
        id: "sphere-hull",
        name: "Pressurized Hermetic Shell",
        role: "Structural containment & thermal radiator",
        engineeringDetail:
          "Two polished 2mm-thick AMG6T aluminum-magnesium hemispherical shells filled with pressurized dry nitrogen at 1.3 atmospheres.",
      },
      {
        id: "whip-antennas",
        name: "Resonant Whip Antennas",
        role: "Omnidirectional radio transmission",
        engineeringDetail:
          "Four 2.4m and 2.9m spring-loaded rods angled at 35° from the longitudinal axis to deliver uniform signal coverage irrespective of attitude tumble.",
      },
      {
        id: "radio-transmitter",
        name: "Dual Frequency Radio Beacon",
        role: "Telemetered audio beacon",
        engineeringDetail:
          "Vacuum-tube transmitters switching between 20.005 and 40.002 MHz, modulating pulse duration based on internal temperature and pressure.",
      },
      {
        id: "battery-block",
        name: "Silver-Zinc Power Pack",
        role: "Primary electrical power",
        engineeringDetail:
          "51 kg battery pack providing 22 days of continuous telemetry broadcast until chemical depletion.",
      },
    ],
  },
  {
    id: "vostok-1",
    name: "Vostok 1",
    missionName: "First Human Spaceflight",
    operator: "Roscosmos",
    launchDate: "April 12, 1961",
    destination: "Low Earth Orbit",
    status: "Mission Completed",
    massKg: 4725,
    propulsionType: "TDU-1 liquid bipropellant retro-rocket engine (15.8 kN thrust)",
    powerSource: "Chemical batteries (providing 10 days of electrical power)",
    primaryInstruments: [
      "Zarya radio communications system with voice telemetry",
      "Vzor optical orientation viewport for manual attitude alignment",
      "Cardiovascular and vestibular physiological telemetry monitoring suite",
    ],
    keyMilestones: [
      "April 12, 1961 06:07 UTC: Yuri Gagarin launches with legendary cry 'Poyekhali!' ('Let's go!')",
      "06:49 UTC: Reaches maximum orbital altitude of 327 km, entering Earth's night side over the Pacific",
      "07:55 UTC: Gagarin ejects at 7 km altitude, parachuting safely near Engels, Saratov Oblast after a 108-minute flight",
    ],
    scientificAchievements: [
      "Confirmed that the human body and mind can survive weightlessness, orbital acceleration, and extreme re-entry g-forces (up to 8g)",
      "Demonstrated spacecraft thermal protection via ablative heat shield during orbital atmospheric re-entry",
      "Validated automated orbital guidance, retro-burn deorbit sequence, and radio communication through the ionosphere",
    ],
    approxDistanceKm: 327,
    approxDistanceAU: 0.0000022,
    radioLatencySec: 0.0011,
    speedKmS: 7.79,
    description:
      "The spacecraft that carried 27-year-old cosmonaut Yuri Alekseyevich Gagarin into orbit, proving humanity could venture beyond our home planet.",
    technicalSpecs: {
      dimensions: "Length: 4.4 m, Diameter: 2.43 m spherical re-entry capsule",
      launchVehicle: "Vostok-K 8K72K (derived from R-7)",
      costOrBudget: "State Soviet Space Program Project Vostok",
      orbitOrTrajectory: "Low Earth Orbit (Perigee: 169 km, Apogee: 327 km, Period: 89.1 min)",
    },
    components: [
      {
        id: "descent-capsule",
        name: "Spherical Descent Module (Sharik)",
        role: "Crew pressure hull & ablative thermal protection",
        engineeringDetail:
          "2.3-meter sphere covered in asbestos-textolite ablative thermal shielding with self-orienting aerodynamic center of mass.",
      },
      {
        id: "ejection-seat",
        name: "Ejection Seat & Parachute Rig",
        role: "Crew egress & emergency escape",
        engineeringDetail:
          "Rocket-powered ejection seat enabling high-altitude pilot egress at 7,000 meters to avoid harsh ground impact shock.",
      },
      {
        id: "service-module",
        name: "Instrument-Service Module (Pribornyy Otsek)",
        role: "Life support, attitude control gas, & retro-rocket",
        engineeringDetail:
          "Biconical module carrying oxygen/nitrogen tanks, cold-gas thrusters, and TDU-1 retro-propulsion engine.",
      },
      {
        id: "vzor-sight",
        name: "Vzor Optical Drift Sight",
        role: "Visual manual navigation",
        engineeringDetail:
          "Concentric glass ring collimator mounted in the hull window permitting the cosmonaut to verify horizon alignment before retrofire.",
      },
    ],
  },
  {
    id: "apollo-11",
    name: "Apollo 11 (LM Eagle & CSM Columbia)",
    missionName: "First Crewed Lunar Landing",
    operator: "NASA",
    launchDate: "July 16, 1969",
    destination: "Moon",
    status: "Mission Completed",
    massKg: 43900, // Total translunar stack (CSM + LM)
    propulsionType:
      "Aerojet SPS engine (CSM, 91 kN) + TRW DPS throttleable descent engine (LM, 44 kN)",
    powerSource: "Hydrogen-oxygen fuel cells (CSM) & silver-zinc batteries (LM)",
    primaryInstruments: [
      "Early Apollo Scientific Experiments Package (EASEP)",
      "Passive Seismic Experiment Package (PSEP) measuring moonquakes and meteorite impacts",
      "Laser Ranging Retroreflector (LRRR) measuring Earth-Moon distance to millimeter precision",
      "Solar Wind Composition Experiment (aluminum foil foil sheet)",
    ],
    keyMilestones: [
      "July 16, 1969: Saturn V SA-506 launches from Kennedy Space Center Pad 39A",
      "July 19, 1969: Lunar Orbit Insertion (LOI) places stack into 110 x 314 km lunar orbit",
      "July 20, 1969 20:17 UTC: Lunar Module Eagle lands at Mare Tranquillitatis ('The Eagle has landed')",
      "July 21, 1969 02:56 UTC: Neil Armstrong steps onto the lunar surface ('One small step for man, one giant leap for mankind')",
      "July 24, 1969: Columbia splashes down safely in the Pacific Ocean after returning 21.55 kg of lunar samples",
    ],
    scientificAchievements: [
      "Returned 21.55 kg of pristine lunar basalts and breccias, dating the lunar surface to 3.6 - 3.9 billion years old",
      "Proved the Moon is devoid of liquid water and indigenous organic biology while preserving primitive solar system impact records",
      "Deployed the Laser Ranging Retroreflector which remains active over 50 years later, proving the Moon is receding from Earth at 3.8 cm/year",
    ],
    approxDistanceKm: 384400,
    approxDistanceAU: 0.00257,
    radioLatencySec: 1.28,
    speedKmS: 1.63, // Lunar orbit velocity
    description:
      "The historic expedition commanded by Neil Armstrong, Buzz Aldrin, and Michael Collins that fulfilled President Kennedy's national challenge to land humans on the Moon and return them safely.",
    technicalSpecs: {
      dimensions:
        "Saturn V Stack: 110.6 m tall; LM Eagle: Height 7.0 m, Span 9.4 m with landing gear",
      launchVehicle: "Saturn V (Three stages: S-IC with five F-1 engines, S-II, S-IVB)",
      costOrBudget: "$25.4 billion (1969 Apollo program total, ~$170B adjusted)",
      orbitOrTrajectory:
        "Translunar Injection (TLI), Lunar Orbit Insertion (LOI), Trans-Earth Injection (TEI)",
    },
    components: [
      {
        id: "lm-descent-stage",
        name: "Lunar Module Descent Stage",
        role: "Landing gear, surface base, & descent propulsion",
        engineeringDetail:
          "Throttleable bipropellant engine (Aerozine-50 and nitrogen tetroxide) with gold-aluminized Mylar thermal insulation blankets and 4 crushable aluminum honeycomb landing footpads.",
      },
      {
        id: "lm-ascent-stage",
        name: "Lunar Module Ascent Stage",
        role: "Pressurized crew cabin & ascent propulsion",
        engineeringDetail:
          "Hypergolic fixed-thrust 15.6 kN ascent engine designed with zero redundant valves for maximum reliability to lift astronauts back to lunar orbit.",
      },
      {
        id: "command-module",
        name: "Command Module (Columbia)",
        role: "Crew life quarters & atmospheric entry vehicle",
        engineeringDetail:
          "Conical pressure vessel with thick AVCOAT ablative heat shield designed to withstand 2,760°C during Mach 36 trans-lunar atmospheric entry.",
      },
      {
        id: "service-module",
        name: "Service Module",
        role: "Electrical power, oxygen/water supply, & Service Propulsion System",
        engineeringDetail:
          "Cylindrical hull housing 91 kN Service Propulsion System (SPS), three hydrogen-oxygen fuel cells, and high-gain steerable antenna array.",
      },
    ],
  },
  {
    id: "voyager-1",
    name: "Voyager 1",
    missionName: "Interstellar Mission & Outer Planets Grand Tour",
    operator: "NASA",
    launchDate: "September 5, 1977",
    destination: "Deep Space / L2",
    status: "Interstellar Cruise",
    massKg: 722,
    propulsionType: "Hydrazine monopropellant thrusters (MR-106, 0.9 N for attitude control)",
    powerSource: "Three Radioisotope Thermoelectric Generators (MHW-RTGs powered by Plutonium-238)",
    primaryInstruments: [
      "High Gain Antenna (3.7 m parabolic reflector)",
      "Triaxial Fluxgate Magnetometer on 13-meter deployable lattice boom",
      "Plasma Wave Subsystem (PWS) & Low-Energy Charged Particle (LECP) detectors",
      "Cosmic Ray Subsystem (CRS) measuring galactic cosmic rays",
      "Imaging Science Subsystem (cameras powered off in 1990 after 'Pale Blue Dot')",
    ],
    keyMilestones: [
      "March 5, 1979: Closest approach to Jupiter (349,000 km), discovering active volcanoes on Io and rings around Jupiter",
      "November 12, 1980: Flyby of Saturn and Titan, using Titan gravity to slingshot out of the ecliptic plane into interstellar trajectory",
      "February 14, 1990: Captured the iconic 'Pale Blue Dot' portrait of Earth from 6 billion km away",
      "August 25, 2012: Crossed the Heliopause at 121.6 AU, becoming the first human-made object to enter interstellar space",
      "Present: Cruising past 163 AU (>24.5 billion km) from Earth, still transmitting scientific data via NASA Deep Space Network",
    ],
    scientificAchievements: [
      "Discovered active volcanism on Jupiter's moon Io—the first proof of active volcanism beyond Earth",
      "Discovered intricate braided ringlets, spokes, and shepherd moons within Saturn's rings",
      "First direct in-situ measurements of interstellar plasma density (confirming theoretical jumps from 0.002 to 0.08 electrons/cm³)",
      "Carries the Golden Record containing sounds, greetings in 55 languages, and music of Earth as a cosmic time capsule",
    ],
    approxDistanceKm: 24500000000,
    approxDistanceAU: 163.8,
    radioLatencySec: 81700, // ~22.7 hours one way!
    speedKmS: 17.0, // Interstellar escape velocity
    description:
      "Humanity's most distant emissary, now traveling through the silent interstellar medium outside the Sun's magnetic bubble.",
    technicalSpecs: {
      dimensions: "Diameter: 3.7 m high-gain antenna; Magnetometer boom length: 13 m",
      launchVehicle: "Titan IIIE-Centaur",
      costOrBudget: "$865 million (original Voyager 1 & 2 mission lifecycle)",
      orbitOrTrajectory:
        "Hyperbolic Solar System escape trajectory (Asymptotic speed ~3.6 AU/year, inclination 35° north of ecliptic)",
    },
    components: [
      {
        id: "high-gain-antenna",
        name: "3.7-Meter Parabolic High Gain Antenna",
        role: "Deep space microwave telemetry & command link",
        engineeringDetail:
          "High-precision Cassegrain parabolic reflector focusing 8.4 GHz X-band and 2.3 GHz S-band signals to bridge billions of kilometers to the 70m DSN dishes.",
      },
      {
        id: "rtg-boom",
        name: "Radioisotope Thermoelectric Generators (RTG)",
        role: "Nuclear electrical power generator",
        engineeringDetail:
          "Three Multi-Hundred-Watt RTGs containing Plutonium-238 dioxide pellets whose radioactive decay heat produces electricity via silicon-germanium thermocouples.",
      },
      {
        id: "magnetometer-boom",
        name: "Deployable 13-Meter Magnetometer Boom",
        role: "Ultra-sensitive magnetic field sensing",
        engineeringDetail:
          "Lightweight fiberglass lattice boom extending sensitive fluxgate sensors far from the spacecraft bus's magnetic interference.",
      },
      {
        id: "golden-record",
        name: "The Golden Record",
        role: "Interstellar cultural time capsule",
        engineeringDetail:
          "12-inch gold-plated copper phonograph record encased in protective aluminum jacket with electroplated uranium-238 calibration clock.",
      },
    ],
  },
  {
    id: "hubble",
    name: "Hubble Space Telescope",
    missionName: "Great Observatories Orbital Telescope",
    operator: "NASA",
    launchDate: "April 24, 1990",
    destination: "Low Earth Orbit",
    status: "Active",
    massKg: 11110,
    propulsionType:
      "Reaction wheels and magnetic torquers (No onboard chemical propulsion to prevent optic contamination)",
    powerSource: "Twin deployable solar array wings generating ~2.8 kW + nickel-hydrogen batteries",
    primaryInstruments: [
      "Wide Field Camera 3 (WFC3, installed SM4 in 2009)",
      "Advanced Camera for Surveys (ACS, installed SM3B in 2002)",
      "Cosmic Origins Spectrograph (COS, installed SM4 in 2009)",
      "Space Telescope Imaging Spectrograph (STIS, installed SM2 in 1997)",
      "Fine Guidance Sensors (FGS) for micro-arcsecond astrometry",
    ],
    keyMilestones: [
      "April 24, 1990: Deployed from Space Shuttle Discovery (STS-31) into 540 km circular orbit",
      "Dec 1993: Servicing Mission 1 (STS-61) installs COSTAR corrective optics to repair primary mirror spherical aberration",
      "1995: Captures the landmark Hubble Deep Field (HDF), revealing thousands of galaxies in an empty patch of sky",
      "May 2009: Final Servicing Mission 4 (STS-125) upgrades instruments, gyroscopes, and batteries",
      "Present: Over 34 years in operation, surpassing 1.6 million scientific observations",
    ],
    scientificAchievements: [
      "Pinned down the Hubble Constant and age of the universe to 13.8 billion years",
      "Co-discovered the accelerating expansion of the universe driven by dark energy through distant Type Ia supernovae",
      "Observed the deep universe back to 500 million years after the Big Bang (Hubble Ultra Deep Field)",
      "Provided first atmospheric composition detection on an exoplanet (HD 209458 b sodium and water vapor)",
    ],
    approxDistanceKm: 535,
    approxDistanceAU: 0.0000036,
    radioLatencySec: 0.0018,
    speedKmS: 7.59,
    description:
      "The orbiting telescope that revolutionized modern astrophysics and became one of the most productive scientific instruments in human history.",
    technicalSpecs: {
      dimensions: "Length: 13.2 m, Maximum diameter: 4.2 m, Primary mirror diameter: 2.4 m",
      launchVehicle: "Space Shuttle Discovery (STS-31)",
      costOrBudget: "~$16 billion total lifetime cost",
      orbitOrTrajectory:
        "Low Earth Orbit (Altitude: ~535 km, Inclination: 28.5°, Period: 95.4 min)",
    },
    components: [
      {
        id: "primary-mirror",
        name: "2.4-Meter Ritchey-Chrétien Primary Mirror",
        role: "Primary light collector",
        engineeringDetail:
          "Ultra-low expansion Zerodur glass coated with 65nm pure aluminum and 25nm magnesium fluoride protective overcoat, figured to within 1/65th of a wavelength.",
      },
      {
        id: "aperture-door",
        name: "Motorized Aperture Door & Light Baffle",
        role: "Sunlight protection & stray light reduction",
        engineeringDetail:
          "Automated door that can slam shut in seconds if the telescope points within 45° of the Sun to protect sensitive focal plane detectors.",
      },
      {
        id: "solar-arrays",
        name: "Rigid Solar Array Wings",
        role: "Electrical power generation",
        engineeringDetail:
          "Third-generation rigid solar panels installed during SM3B producing 20% more power while eliminating thermal flutter vibrations.",
      },
      {
        id: "aft-shroud",
        name: "Aft Instrument Shroud",
        role: "Instrument bay & cryogenic thermal housing",
        engineeringDetail:
          "Houses 4 telephone-booth-sized axial science instrument bays with latching rails enabling Space Shuttle spacewalkers to swap detectors.",
      },
    ],
  },
  {
    id: "iss",
    name: "International Space Station (ISS)",
    missionName: "Continuously Inhabited Microgravity Orbital Laboratory",
    operator: "International",
    launchDate: "November 20, 1998",
    destination: "Low Earth Orbit",
    status: "Active",
    massKg: 444600,
    propulsionType:
      "Zvezda service module thrusters & visiting cargo resupply vehicles (Progress, Cygnus)",
    powerSource:
      "8 massive dual-panel photovoltaic solar array wings generating 120 kW electrical power",
    primaryInstruments: [
      "Alpha Magnetic Spectrometer (AMS-02) searching for dark matter and antimatter",
      "Cold Atom Lab (CAL) creating Bose-Einstein condensates at picokelvin temperatures",
      "NICER (Neutron star Interior Composition Explorer) X-ray timing pulsar explorer",
      "ECOSTRESS & GEDI Earth climate and forest canopy monitoring suites",
    ],
    keyMilestones: [
      "Nov 20, 1998: Zarya Functional Cargo Block launches aboard Russian Proton rocket",
      "Dec 4, 1998: Space Shuttle Endeavour mates Unity Node 1 to Zarya, beginning assembly",
      "Nov 2, 2000: Expedition 1 crew (Shepherd, Gidzenko, Krikalev) docks, beginning continuous human occupancy",
      "May 2020: Crew Dragon Demo-2 restores commercial crew launch capability to the station",
      "Present: Over 250 astronauts and cosmonauts from 21 nations have conducted >3,000 scientific investigations",
    ],
    scientificAchievements: [
      "Discovered how prolonged microgravity alters human genetics, eye structure (SANS), cardiovascular tone, and bone density",
      "Synthesized large, ultra-pure protein crystals for cancer, Alzheimer's, and muscular dystrophy therapeutic drug design",
      "Demonstrated 98% closed-loop ECLSS water recycling from sweat, breath, and urine for deep space exploration",
      "Validated automated orbital rendezvous, optical laser communications, and in-space 3D manufacturing",
    ],
    approxDistanceKm: 418,
    approxDistanceAU: 0.0000028,
    radioLatencySec: 0.0014,
    speedKmS: 7.66,
    description:
      "A football-field-sized marvel of international engineering where humanity has maintained continuous residency in space since November 2000.",
    technicalSpecs: {
      dimensions: "Length: 73 m, Truss Width: 109 m, Pressurized habitable volume: 916 m³",
      launchVehicle: "42 assembly flights across Space Shuttle, Proton-K, and Soyuz-U",
      costOrBudget: "$150+ billion cumulative international investment",
      orbitOrTrajectory:
        "Low Earth Orbit (Altitude: ~418 km, Inclination: 51.64°, Orbital period: 92.9 min)",
    },
    components: [
      {
        id: "integrated-truss",
        name: "Integrated Truss Structure (ITS)",
        role: "Backbone spine, power distribution, & thermal radiators",
        engineeringDetail:
          "108.5-meter aluminum and titanium truss supporting 4 giant Solar Array Wings, ammoniated cooling radiators, and the Mobile Servicing System rail.",
      },
      {
        id: "solar-wings",
        name: "Photovoltaic Solar Array Wings (SAW)",
        role: "Main electrical power",
        engineeringDetail:
          "Eight 35-meter wings with alpha and beta rotary joints tracking the Sun continuously, augmented by modern rollout solar arrays (iROSA).",
      },
      {
        id: "laboratory-modules",
        name: "Pressurized Habitation & Lab Modules",
        role: "Crew living quarters & scientific research racks",
        engineeringDetail:
          "Modules including Destiny (US), Columbus (ESA), Kibo (JAXA), Zvezda (Roscosmos), and Nauka equipped with International Standard Payload Racks.",
      },
      {
        id: "cupola",
        name: "Cupola Observation Dome",
        role: "Robotic arm control & Earth observation",
        engineeringDetail:
          "Seven-window observatory dome featuring a 80-centimeter central circular port—the largest window ever flown in space.",
      },
    ],
  },
  {
    id: "curiosity",
    name: "Curiosity (Mars Science Laboratory)",
    missionName: "Mars Science Laboratory (MSL)",
    operator: "NASA",
    launchDate: "November 26, 2011",
    destination: "Mars",
    status: "Active",
    massKg: 899,
    propulsionType: "None (6-wheel drive with individual brushless DC motors in each wheel hub)",
    powerSource:
      "Multi-Mission Radioisotope Thermoelectric Generator (MMRTG) with 4.8 kg Plutonium-238",
    primaryInstruments: [
      "Sample Analysis at Mars (SAM) mass spectrometer and gas chromatograph",
      "Chemistry and Mineralogy (CheMin) X-ray diffraction instrument",
      "ChemCam / SuperCam laser-induced breakdown spectroscopy (LIBS)",
      "Mast Camera (Mastcam) multispectral stereoscopic imaging system",
      "Radiation Assessment Detector (RAD) characterizing cosmic radiation",
    ],
    keyMilestones: [
      "Aug 6, 2012: Historic 'Sky Crane' touchdown inside Gale Crater",
      "March 2013: Drills Yellowknife Bay mudstone, discovering ancient habitable lake environment with neutral pH water",
      "2014 - Present: Scaling Mount Sharp (Aeolis Mons), climbing 5 km through stratified sedimentary geological epochs",
      "June 2018: Detects ancient preserved organic molecules and cyclical background methane plumes",
      "Present: Driven over 32 km on Mars across 12+ years of continuous robotic exploration",
    ],
    scientificAchievements: [
      "Demonstrated that ancient Mars had liquid freshwater lakes, nitrogen, carbon, oxygen, sulfur, and phosphorus capable of supporting microbial life",
      "Directly measured the surface cosmic radiation dosage on Mars, informing future human crewed expedition safety protocols",
      "Discovered hydrated clay minerals and boron compounds indicating ancient persistent groundwater systems",
    ],
    approxDistanceKm: 225000000,
    approxDistanceAU: 1.5,
    radioLatencySec: 750, // ~12.5 minutes one-way
    speedKmS: 0.00004, // Ground traverse ~0.14 km/h max
    description:
      "An SUV-sized nuclear-powered robotic laboratory climbing the central peak of Gale Crater to read Mars' ancient climate transition.",
    technicalSpecs: {
      dimensions: "Length: 3.0 m, Width: 2.7 m, Height: 2.2 m, Robotic arm reach: 2.1 m",
      launchVehicle: "Atlas V 541",
      costOrBudget: "$2.5 billion",
      orbitOrTrajectory:
        "Direct interplanetary Hohmann transfer, Guided atmospheric entry, Sky Crane touchdown",
    },
    components: [
      {
        id: "rocker-bogie",
        name: "Rocker-Bogie 6-Wheel Mobility System",
        role: "Rough terrain traversal without springs",
        engineeringDetail:
          "Differential rocker-bogie mechanical linkage maintaining all six cleated aluminum wheels on the ground over obstacles up to 65 cm high.",
      },
      {
        id: "mmrtg-nuclear",
        name: "MMRTG Nuclear Power Generator",
        role: "24/7 continuous electricity & winter thermal heating",
        engineeringDetail:
          "Converts heat from decaying Plutonium-238 into 110 watts of electricity while pumping heated coolant through the chassis to survive -90°C Martian nights.",
      },
      {
        id: "remote-sensing-mast",
        name: "Remote Sensing Mast & ChemCam Laser",
        role: "High-resolution stereo vision & laser rock zapping",
        engineeringDetail:
          "2.1m mast housing Mastcam stereo cameras and ChemCam's infrared pulsed laser which vaporizes rock targets up to 7 meters away.",
      },
      {
        id: "robotic-arm",
        name: "2-Meter Articulated Arm & Drill Turret",
        role: "Rock drilling, powder sieving, & microscopic imaging",
        engineeringDetail:
          "5-jointed arm bearing a 30 kg turret equipped with a percussive rotary drill, dust removal tool, and the MAHLI macroscopic imager.",
      },
    ],
  },
  {
    id: "perseverance",
    name: "Perseverance & Ingenuity",
    missionName: "Mars 2020 & Mars Helicopter",
    operator: "NASA",
    launchDate: "July 30, 2020",
    destination: "Mars",
    status: "Active",
    massKg: 1025,
    propulsionType:
      "6-wheel electric drive (Perseverance) + Counter-rotating carbon-fiber rotors at 2,400 RPM (Ingenuity)",
    powerSource: "MMRTG nuclear generator + Ingenuity lithium-ion solar-charged batteries",
    primaryInstruments: [
      "SuperCam Raman, LIBS, and visible/IR spectrometers with acoustic microphone",
      "PIXL (Planetary Instrument for X-ray Lithochemistry) micro-focus elemental sensor",
      "SHERLOC deep-UV fluorescence spectrometer seeking biosignatures",
      "MOXIE (Mars Oxygen ISRU Experiment) generating oxygen from atmospheric CO2",
      "RIMFAX ground-penetrating radar probing up to 10m into Martian bedrock",
    ],
    keyMilestones: [
      "Feb 18, 2021: Touchdown at Jezero Crater using Terrain-Relative Navigation",
      "April 19, 2021: Ingenuity completes first powered controlled flight on another world",
      "Sept 2021: Successfully drills and hermetically seals first Mars core sample into titanium cache tube",
      "2021 - 2024: Ingenuity executes 72 flights totaling over 128 minutes aloft, scouting traverse routes",
      "Present: Exploring ancient river delta deposits, caching pristine rock cores for future Mars Sample Return",
    ],
    scientificAchievements: [
      "Discovered carbonaceous matter and diverse organic compounds within river delta sedimentary rocks",
      "MOXIE successfully produced 122 grams of 98% pure breathable oxygen directly from Martian CO2",
      "Demonstrated aerial rotorcraft reconnaissance in a thin atmosphere having only 1% of Earth's density",
      "Cached 24+ hermetically sealed rock cores and atmospheric samples for retrieval to Earth laboratories",
    ],
    approxDistanceKm: 225000000,
    approxDistanceAU: 1.5,
    radioLatencySec: 750,
    speedKmS: 0.000042,
    description:
      "NASA's most advanced astrobiology rover, collecting core samples in an ancient river delta while proving powered flight on Mars with the Ingenuity scout helicopter.",
    technicalSpecs: {
      dimensions:
        "Length: 3.0 m, Width: 2.7 m, Height: 2.2 m; Ingenuity rotor span: 1.2 m, mass: 1.8 kg",
      launchVehicle: "Atlas V 541",
      costOrBudget: "$2.7 billion",
      orbitOrTrajectory:
        "Hohmann Transfer, Guided entry with Range Trigger & Terrain-Relative Navigation",
    },
    components: [
      {
        id: "sample-caching-system",
        name: "Adaptive Sample Caching System",
        role: "Robotic core extraction & hermetic sealing",
        engineeringDetail:
          "Complex internal robotic handling system containing 43 ultra-clean titanium sample collection tubes and an internal robotic arm to seal tubes without terrestrial contamination.",
      },
      {
        id: "ingenuity-helicopter",
        name: "Ingenuity Mars Helicopter",
        role: "Autonomous aerial scouting demonstrator",
        engineeringDetail:
          "1.8 kg autonomous drone with dual counter-rotating carbon-fiber composite rotor blades spinning at 2,400 RPM to generate lift in Mars' thin 6-mbar atmosphere.",
      },
      {
        id: "moxie-oxygen-generator",
        name: "MOXIE Oxygen In-Situ Generator",
        role: "ISRU propellant & life support generation",
        engineeringDetail:
          "Solid oxide electrolysis unit operating at 800°C that strips oxygen atoms from carbon dioxide molecules (2 CO2 → 2 CO + O2).",
      },
      {
        id: "pixl-sherloc-turret",
        name: "PIXL & SHERLOC Astrobiology Turret",
        role: "Microscale biosignature and mineral detection",
        engineeringDetail:
          "Robotic arm turret combining X-ray fluorescence mapping with deep-ultraviolet Raman laser spectroscopy to identify organic molecules down to sub-millimeter scales.",
      },
    ],
  },
  {
    id: "chandrayaan-3",
    name: "Chandrayaan-3 (Vikram & Pragyan)",
    missionName: "Third Indian Lunar Exploration Mission",
    operator: "ISRO",
    launchDate: "July 14, 2023",
    destination: "Moon",
    status: "Mission Completed",
    massKg: 3900, // Total launch mass: Propulsion module 2148 kg + Lander 1752 kg (with 26 kg rover)
    propulsionType:
      "4 throttleable 800 N bipropellant liquid engines (MMH/MON-3) + 8 attitude thrusters",
    powerSource: "Lander and rover deployable solar panels (Lander 738 W, Rover 50 W)",
    primaryInstruments: [
      "ChaSTE (Chandra's Surface Thermophysical Experiment) soil thermal probe",
      "ILSA (Instrument for Lunar Seismic Activity) ultra-sensitive MEMS seismometer",
      "LP (Langmuir Probe) measuring near-surface plasma density",
      "APXS (Alpha Particle X-ray Spectrometer) on Pragyan rover detecting elemental composition",
      "LIBS (Laser-Induced Breakdown Spectroscope) on Pragyan identifying regolith minerals",
      "SHAPE (Spectro-polarimetry of Habitable Planet Earth) on Propulsion Module",
    ],
    keyMilestones: [
      "July 14, 2023: Launched from Satish Dhawan Space Centre aboard LVM3-M4 rocket",
      "August 5, 2023: Lunar Orbit Insertion achieved after fuel-efficient Earth-bound orbit-raising maneuvers",
      "August 23, 2023 12:34 UTC: Historic soft landing near lunar South Pole (~69.37°S, 32.35°E, Shiv Shakti Point)",
      "August 24, 2023: Pragyan rover rolls down the lander ramp onto the lunar regolith",
      "Sept 4, 2023: Vikram completes successful 40-cm 'hop test', validating vertical take-off and re-landing for future sample returns",
    ],
    scientificAchievements: [
      "Made India the first nation in history to land near the lunar South Pole and the fourth nation to soft-land on the Moon",
      "Unambiguously confirmed the presence of Sulfur (S) on the lunar south polar surface via Pragyan LIBS laser spectroscopy",
      "Measured the first in-situ vertical thermal gradient of polar regolith: surface ~50°C dropping drastically to -10°C just 8 cm below the soil",
      "Recorded ambient lunar plasma density and detected minor moonquake tremors using ILSA's micro-machined seismometer",
    ],
    approxDistanceKm: 384400,
    approxDistanceAU: 0.00257,
    radioLatencySec: 1.28,
    speedKmS: 0.0,
    description:
      "ISRO's triumphant lunar south pole mission comprising the Vikram lander and Pragyan rover, unveiling polar regolith composition and thermal dynamics.",
    technicalSpecs: {
      dimensions: "Lander: 2.0 m x 2.0 m x 1.16 m; Rover: 91 cm x 75 cm x 39 cm, 6 wheels",
      launchVehicle: "LVM3-M4 (Launch Vehicle Mark-3, formerly GSLV Mk III)",
      costOrBudget:
        "₹615 crore (~$75 million USD)—celebrated worldwide for ultra-high capital efficiency",
      orbitOrTrajectory:
        "Earth-bound eccentric orbit raising with perigee burns, Lunar Transfer Trajectory, Lunar Orbit Insertion, De-boost & Autonomous Powered Descent",
    },
    components: [
      {
        id: "vikram-chassis",
        name: "Vikram Lander Structure & Legs",
        role: "Touchdown shock absorption & payload platform",
        engineeringDetail:
          "Reinforced titanium and carbon-fiber composite box chassis with wide-stance crash-absorbing aluminum honeycomb strut legs rated for up to 3 m/s vertical descent.",
      },
      {
        id: "throttleable-engines",
        name: "Throttleable 800 N Landing Engines",
        role: "Powered descent velocity braking & pitch control",
        engineeringDetail:
          "Four symmetrically mounted 800 N bipropellant engines throttleable down to 20% thrust, guided by laser and Doppler velocity radars during the terminal hover phase.",
      },
      {
        id: "pragyan-rover",
        name: "Pragyan 6-Wheeled Rover",
        role: "Autonomous polar surface prospecting",
        engineeringDetail:
          "26 kg solar-powered rover with rocker-bogie suspension, embossed wheels leaving the ISRO emblem and National Emblem on the regolith, carrying LIBS and APXS spectrometers.",
      },
      {
        id: "chaste-probe",
        name: "ChaSTE Thermal Depth Probe",
        role: "Subsurface regolith thermal profiling",
        engineeringDetail:
          "Motorized needle probe carrying 10 high-precision temperature sensors driven up to 10 centimeters deep into pristine lunar polar regolith.",
      },
    ],
  },
  {
    id: "aditya-l1",
    name: "Aditya-L1",
    missionName: "India's First Dedicated Solar Space Observatory",
    operator: "ISRO",
    launchDate: "September 2, 2023",
    destination: "Sun / L1",
    status: "Active",
    massKg: 1475,
    propulsionType: "Liquid Apogee Motor (LAM) 440 N + 8 reaction control thrusters",
    powerSource: "Twin deployable solar array wings generating ~1,120 W",
    primaryInstruments: [
      "VELC (Visible Emission Line Coronagraph) observing solar corona down to 1.05 solar radii",
      "SUIT (Solar Ultraviolet Imaging Telescope) full-disk 200-400 nm photosphere/chromosphere imager",
      "ASPEX (Aditya Solar wind Particle Experiment) measuring solar wind protons and alpha particles",
      "PAPA (Plasma Analyser Package for Aditya) assessing solar wind electron temperatures",
      "SoLEXS & HEL1OS solar X-ray spectrometers measuring solar flare dynamics",
      "MAG (Advanced Triaxial High-Resolution Digital Magnetometer) on a 6-meter boom",
    ],
    keyMilestones: [
      "Sept 2, 2023: Launched from Sriharikota aboard PSLV-C57 in XL configuration",
      "Sept 2 - 19, 2023: Conducted 5 Earth-bound orbital maneuvers to gain velocity for L1 transfer",
      "Jan 6, 2024: Successfully inserted into an elliptical halo orbit around the Sun-Earth L1 Lagrange point, 1.5 million km from Earth",
      "May 2024: Captured intense X-class solar flare storms and geomagnetic coronal mass ejections hitting Earth",
      "Present: Continuously observing the Sun without any eclipses or occultation 24/7",
    ],
    scientificAchievements: [
      "First Indian observatory placed at an interplanetary Lagrange point (Sun-Earth L1)",
      "Provides round-the-clock uninterrupted imaging of the solar corona, solving coronal heating mysteries (why the corona is millions of degrees hotter than the surface)",
      "Delivers space-weather early warning systems for satellite communication, GPS grids, and terrestrial electrical networks against violent Coronal Mass Ejections (CMEs)",
    ],
    approxDistanceKm: 1500000,
    approxDistanceAU: 0.01,
    radioLatencySec: 5.0,
    speedKmS: 0.2, // Relative to L1 halo stationkeeping
    description:
      "India's pioneering solar observatory positioned at the Sun-Earth L1 Lagrange point, providing an unocculted 24/7 view of solar flares and space weather.",
    technicalSpecs: {
      dimensions: "Spacecraft bus: 1.6 m x 1.6 m x 1.9 m; Magnetometer boom: 6 m deployed length",
      launchVehicle: "PSLV-C57 (Polar Satellite Launch Vehicle - XL variant)",
      costOrBudget: "₹400 crore (~$48 million USD)",
      orbitOrTrajectory:
        "Halo orbit around Sun-Earth L1 (semi-major axis ~200,000 km, orbital period ~178 days)",
    },
    components: [
      {
        id: "velc-coronagraph",
        name: "Visible Emission Line Coronagraph (VELC)",
        role: "Solar corona spectroscopy & CME monitoring",
        engineeringDetail:
          "Internally occulted reflecting coronagraph using super-polished mirrors to block the glaring solar disk and image the faint corona in 530.3 nm (Fe XIV) green emission lines.",
      },
      {
        id: "suit-telescope",
        name: "Solar Ultraviolet Imaging Telescope (SUIT)",
        role: "Photosphere and Chromosphere UV mapping",
        engineeringDetail:
          "Off-axis telescope capturing 11 narrow UV wavelength bands to track dynamic magnetic energy transfer from the photosphere up to the transition region.",
      },
      {
        id: "magnetometer-boom-aditya",
        name: "6-Meter Dual Fluxgate Magnetometer Boom",
        role: "Interplanetary magnetic field (IMF) measurement",
        engineeringDetail:
          "Carbon-fiber deployable boom placing sensitive magnetic sensors away from the spacecraft bus to detect subtle magnetic shifts preceding geomagnetic storms.",
      },
      {
        id: "solar-panels-aditya",
        name: "Sun-Oriented Deployable Solar Panels",
        role: "Primary electrical power",
        engineeringDetail:
          "Multi-junction Gallium Arsenide solar cells perpetually oriented towards the Sun with radiation-hardened bypass diodes.",
      },
    ],
  },
  {
    id: "jwst",
    name: "James Webb Space Telescope (JWST)",
    missionName: "Flagship Infrared Deep-Space Observatory",
    operator: "NASA",
    launchDate: "December 25, 2021",
    destination: "Deep Space / L2",
    status: "Active",
    massKg: 6161,
    propulsionType:
      "Hydrazine and dinitrogen tetroxide monopropellant thrusters (for L2 halo stationkeeping)",
    powerSource: "Deployable 2 kW solar array + cryogenic passive radiator cooling",
    primaryInstruments: [
      "NIRCam (Near-Infrared Camera, 0.6 - 5.0 µm)",
      "NIRSpec (Near-Infrared Spectrograph with 250,000 microshutters)",
      "MIRI (Mid-Infrared Instrument with helium closed-cycle cryocooler operating at 6.7 K)",
      "NIRISS (Near-Infrared Imager and Slitless Spectrograph) with FGS guidance",
    ],
    keyMilestones: [
      "Dec 25, 2021: Flawless launch aboard Ariane 5 from Kourou, French Guiana with pinpoint trajectory savings",
      "Jan 2022: Unfurled 5-layer tennis-court-sized Kapton sunshield and 18-segment gold primary mirror",
      "Jan 24, 2022: Arrived at Sun-Earth L2 Lagrange point (1.5 million km from Earth)",
      "July 12, 2022: President releases first full-color deep field (SMACS 0723 gravitational lens)",
      "Present: Discovered galaxies at redshift z > 14 (under 300 million years after Big Bang) and decoded atmospheres of rocky exoplanets",
    ],
    scientificAchievements: [
      "Observed the most distant known galaxies formed just 290 million years after the Big Bang (JADES-GS-z14-0)",
      "Detected carbon dioxide, water vapor, methane, and sulfur dioxide in the atmospheres of transiting exoplanets (WASP-39b, TRAPPIST-1 system)",
      "Pierced dense cosmic dust cocoons in the Carina and Orion nebulae to reveal previously invisible embryonic protostars",
      "Captured unprecedented infrared views of Jupiter's rings, Neptune's atmospheric storms, and Saturn's ring structure",
    ],
    approxDistanceKm: 1500000,
    approxDistanceAU: 0.01,
    radioLatencySec: 5.0,
    speedKmS: 0.25,
    description:
      "The premier astrophysics observatory in space: a 6.5-meter gold-beryllium folding telescope operating at 40 Kelvin behind a 5-layer sunshield at Sun-Earth L2.",
    technicalSpecs: {
      dimensions:
        "Primary mirror diameter: 6.5 m; Sunshield dimensions: 21.2 m x 14.2 m (tennis-court sized)",
      launchVehicle: "Ariane 5 ECA (Arianespace flight VA256)",
      costOrBudget: "$10 billion joint NASA/ESA/CSA international flagship",
      orbitOrTrajectory:
        "Lissajous / Halo orbit around the second Sun-Earth Lagrange point (L2) with ~6 month period",
    },
    components: [
      {
        id: "hexagonal-mirrors",
        name: "18 Hexagonal Gold-Coated Beryllium Mirrors",
        role: "Primary infrared light collection aperture",
        engineeringDetail:
          "18 ultra-lightweight optical segments made from cryogenic-stable beryllium coated with a 100nm layer of pure gold and 7 hexapod nano-actuators per segment aligned to 1/10,000th human hair width.",
      },
      {
        id: "kapton-sunshield",
        name: "5-Layer Kapton Sunshield",
        role: "Thermal protection & passive cryogenic cooling",
        engineeringDetail:
          "Five membrane layers of aluminum- and doped-silicon-coated polyimide (Kapton) that drop temperatures from +85°C on the sunlit bus side to -233°C (40 K) on the telescope side.",
      },
      {
        id: "secondary-mirror-tripod",
        name: "Secondary Mirror Support Struts",
        role: "Optical beam redirection into science instrument bay",
        engineeringDetail:
          "Three 7.6-meter hollow carbon-composite hinged booms that deployed in deep space to lock a 0.74m circular convex beryllium mirror precisely into the optical focus.",
      },
      {
        id: "miri-cryocooler",
        name: "MIRI Pulse-Tube Cryocooler",
        role: "Sub-Kelvin active cooling for mid-infrared detectors",
        engineeringDetail:
          "Closed-loop helium pulse-tube refrigerator that chills MIRI's arsenic-doped silicon detectors down to 6.7 Kelvin (-266.5°C) to eliminate thermal infrared glow.",
      },
    ],
  },
];

export const SOLAR_SYSTEM_WAYPOINTS: SolarSystemMissionWaypoint[] = [
  {
    id: "wp-sputnik",
    spacecraftId: "sputnik-1",
    spacecraftName: "Sputnik 1",
    body: "Earth",
    distanceAU: 0.0000038,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 15,
    year: 1957,
    event: "First artificial orbital flight in history (1,440 orbits around Earth)",
    isFlybyOrOrbiter: "Orbit Insertion",
  },
  {
    id: "wp-vostok",
    spacecraftId: "vostok-1",
    spacecraftName: "Vostok 1",
    body: "Earth",
    distanceAU: 0.0000022,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 45,
    year: 1961,
    event: "Yuri Gagarin completes the first human orbital flight (108 minutes)",
    isFlybyOrOrbiter: "Orbit Insertion",
  },
  {
    id: "wp-apollo-11",
    spacecraftId: "apollo-11",
    spacecraftName: "Apollo 11",
    body: "Moon",
    distanceAU: 0.00257,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 95,
    year: 1969,
    event: "First crewed lunar landing at Sea of Tranquility (Armstrong & Aldrin)",
    isFlybyOrOrbiter: "Landing",
  },
  {
    id: "wp-voyager-jupiter",
    spacecraftId: "voyager-1",
    spacecraftName: "Voyager 1",
    body: "Jupiter",
    distanceAU: 5.2,
    heliocentricRadiusAU: 5.2,
    orbitalAngleDeg: 140,
    year: 1979,
    event:
      "Jupiter flyby & gravity assist boost: discovers Io's active volcanoes and Jupiter's rings",
    isFlybyOrOrbiter: "Flyby",
  },
  {
    id: "wp-voyager-saturn",
    spacecraftId: "voyager-1",
    spacecraftName: "Voyager 1",
    body: "Saturn",
    distanceAU: 9.5,
    heliocentricRadiusAU: 9.5,
    orbitalAngleDeg: 195,
    year: 1980,
    event: "Saturn & Titan gravity slingshot out of the ecliptic plane toward interstellar space",
    isFlybyOrOrbiter: "Flyby",
  },
  {
    id: "wp-voyager-heliopause",
    spacecraftId: "voyager-1",
    spacecraftName: "Voyager 1",
    body: "Interstellar",
    distanceAU: 121.6,
    heliocentricRadiusAU: 121.6,
    orbitalAngleDeg: 230,
    year: 2012,
    event: "Crosses the heliopause into interstellar space at 121.6 AU from the Sun",
    isFlybyOrOrbiter: "Escape",
  },
  {
    id: "wp-hubble",
    spacecraftId: "hubble",
    spacecraftName: "Hubble Space Telescope",
    body: "Earth",
    distanceAU: 0.0000036,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 120,
    year: 1990,
    event: "Deployed in LEO at 540 km; serviced by 5 Space Shuttle astronaut crews",
    isFlybyOrOrbiter: "Orbit Insertion",
  },
  {
    id: "wp-iss",
    spacecraftId: "iss",
    spacecraftName: "International Space Station",
    body: "Earth",
    distanceAU: 0.0000028,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 180,
    year: 1998,
    event: "Assembly begins in LEO; continuously inhabited by humans since November 2000",
    isFlybyOrOrbiter: "Orbit Insertion",
  },
  {
    id: "wp-curiosity",
    spacecraftId: "curiosity",
    spacecraftName: "Curiosity Rover",
    body: "Mars",
    distanceAU: 1.52,
    heliocentricRadiusAU: 1.52,
    orbitalAngleDeg: 275,
    year: 2012,
    event: "Sky Crane landing in Gale Crater; confirms ancient habitable freshwater lake",
    isFlybyOrOrbiter: "Landing",
  },
  {
    id: "wp-perseverance",
    spacecraftId: "perseverance",
    spacecraftName: "Perseverance & Ingenuity",
    body: "Mars",
    distanceAU: 1.52,
    heliocentricRadiusAU: 1.52,
    orbitalAngleDeg: 290,
    year: 2021,
    event: "Terrain-relative landing in Jezero Crater delta; Ingenuity performs 72 flights",
    isFlybyOrOrbiter: "Landing",
  },
  {
    id: "wp-chandrayaan3",
    spacecraftId: "chandrayaan-3",
    spacecraftName: "Chandrayaan-3",
    body: "Moon",
    distanceAU: 0.00257,
    heliocentricRadiusAU: 1.0,
    orbitalAngleDeg: 105,
    year: 2023,
    event: "First historic landing near the Lunar South Pole (Shiv Shakti Point) on Aug 23, 2023",
    isFlybyOrOrbiter: "Landing",
  },
  {
    id: "wp-aditya-l1",
    spacecraftId: "aditya-l1",
    spacecraftName: "Aditya-L1",
    body: "L1",
    distanceAU: 0.01,
    heliocentricRadiusAU: 0.99,
    orbitalAngleDeg: 345,
    year: 2023,
    event: "Inserted into halo orbit at Sun-Earth L1 Lagrange point for 24/7 solar monitoring",
    isFlybyOrOrbiter: "Stationary Halo",
  },
  {
    id: "wp-jwst",
    spacecraftId: "jwst",
    spacecraftName: "James Webb Space Telescope",
    body: "L2",
    distanceAU: 0.01,
    heliocentricRadiusAU: 1.01,
    orbitalAngleDeg: 165,
    year: 2021,
    event: "Stationed in halo orbit at Sun-Earth L2 Lagrange point 1.5 million km from Earth",
    isFlybyOrOrbiter: "Stationary Halo",
  },
];

export const MODULE_22_SUBLESSONS: SubLesson[] = [
  {
    id: "sublesson-1-satellites",
    title: "The First Artificial Satellites",
    shortDescription: "Sputnik 1, Explorer 1, radiation belts, and the dawn of orbital mechanics.",
    durationMinutes: 18,
    order: 1,
    content: {
      Beginner: {
        title: "Beeping in the Dark: How Humanity Reached Orbit",
        summary:
          "On October 4, 1957, a polished metal sphere the size of a beach ball was launched into the sky, broadcasting a radio beep that proved human machines could orbit the Earth.",
        paragraphs: [
          "Before 1957, space travel belonged strictly to science fiction. Everything changed when the Soviet Union launched Sputnik 1. It orbited Earth once every 96 minutes, flying at 28,000 kilometers per hour. Anyone with an amateur ham radio could tune in to hear its distinctive radio pulses.",
          "Four months later, the United States answered with Explorer 1. Designed with instruments built by physicist James Van Allen, this slender satellite carried a Geiger counter. As it circled Earth, it discovered intense zones of trapped energetic particles held by Earth's magnetic field—now celebrated as the Van Allen Radiation Belts.",
          "To stay in orbit, an object does not escape gravity; instead, it falls perpetually around the Earth! The satellite's forward speed is so fast that as gravity pulls it downward, Earth's curved surface curves away beneath it at the exact same rate.",
        ],
        interactivePrompt:
          "Open the 3D Spacecraft Museum and inspect Sputnik 1's pressurized sphere and whip antennas.",
        didYouKnow:
          "Vanguard 1, launched in March 1958, is the oldest human-made object still in orbit today. It is expected to remain circling Earth for hundreds of years!",
      },
      Intermediate: {
        title: "Orbital Mechanics, Cold War Geopolitics, and Early Space Physics",
        summary:
          "The physics of orbital insertion, atmospheric drag measurement, and the unexpected discovery of Earth's magnetospheric radiation belts.",
        paragraphs: [
          "Placing an object into Low Earth Orbit requires reaching circular orbital velocity: v = sqrt(G * M_Earth / r), approximately 7.8 km/s (Mach 25) at 300 km altitude. Sergei Korolev's team modified the Soviet R-7 ICBM to launch Sputnik 1 (PS-1). The satellite carried no cameras, but by tracking the gradual decay of its orbital period across 92 days, atmospheric scientists accurately calculated the true aerodynamic density of Earth's thermosphere for the first time.",
          "When Explorer 1 launched on January 31, 1958 aboard a Juno I rocket, James Van Allen's team noticed that the Geiger-Müller counter clicked rapidly, then unexpectedly dropped to zero at high altitudes (above 2,000 km). Van Allen realized the detector was not detecting a void, but was being completely saturated by an intense flux of trapped protons and electrons. This marked the founding discovery of magnetospheric space physics.",
          "These early satellites also proved the value of solar photovoltaic power. While Sputnik's chemical batteries died after 22 days, Vanguard 1 carried small quartz-windowed silicon solar cells that powered its radio transmitter for over six continuous years.",
        ],
        interactivePrompt:
          "Explore the Compare Travel Distances tool to see how LEO at 400 km compares to the Van Allen Belts and geostationary orbit.",
        didYouKnow:
          "Sputnik 1's radio frequency (20.005 MHz) was chosen intentionally because it was close to standard frequencies monitored by amateur ham radio operators across the world, making the satellite impossible to deny.",
      },
      Advanced: {
        title: "Vis-Viva Formulations, Ionospheric Refraction, and Magnetospheric Trapping",
        summary:
          "Mathematical foundations of orbital velocity, atmospheric drag decay modeling, and adiabatic invariants of trapped radiation.",
        paragraphs: [
          "The orbital state of a satellite is governed by the vis-viva equation: v² = GM(2/r - 1/a). For Sputnik's initial orbit (perigee r_p = 6586 km, apogee r_a = 7309 km), the semi-major axis was a = 6947.5 km. The orbital energy per unit mass is epsilon = -GM/(2a). Upper atmospheric drag exerts a non-conservative force F_D = 0.5 * rho * v² * C_D * A, causing circularization of the orbit before catastrophic deceleration.",
          "The radio transmissions at 20.005 MHz and 40.002 MHz experienced dispersion and Doppler shifts as waves passed through ionospheric plasma. Because plasma frequency is f_p = sqrt(n_e * e² / (4 * pi² * epsilon_0 * m_e)), dual-frequency reception allowed scientists to invert Doppler records and solve for total electron content (TEC) across latitude belts.",
          "Explorer 1's discovery of the radiation belts validated Carl Størmer's theoretical calculations on charged particle trajectories in a dipole magnetic field. Charged particles undergo three distinct periodic motions: cyclotron gyration around field lines (first adiabatic invariant mu = p_perp² / (2mB)), bounce motion between magnetic mirror points (second invariant J = integral p_parallel ds), and azimuthal magnetic drift around Earth (third invariant Phi).",
        ],
        interactivePrompt:
          "Calculate the Tsiolkovsky delta-v needed to reach 7.8 km/s orbital velocity from Earth's surface in the Rocket Equation lab.",
        didYouKnow:
          "Explorer 1 also revealed the 'intermediate axis theorem' (the Tennis Racket theorem): because it was a long, slender cylinder spinning along its minor axis, internal flexure caused energy dissipation that caused it to unexpectedly tumble end-over-end in orbit!",
      },
    },
  },
  {
    id: "sublesson-2-human-spaceflight",
    title: "First Human Spaceflight",
    shortDescription:
      "Vostok 1, Mercury, spacewalks, and human physiological adaptation to microgravity.",
    durationMinutes: 20,
    order: 2,
    content: {
      Beginner: {
        title: "Humans in the Void: The Courage of the First Astronauts",
        summary:
          "On April 12, 1961, 27-year-old Yuri Gagarin became the first person to orbit Earth, answering whether humans could think, see, and survive in space.",
        paragraphs: [
          "Before the first human spaceflight, doctors and engineers worried that zero gravity might blind astronauts, make swallowing food impossible, or cause severe panic. Yuri Gagarin climbed into the spherical Vostok 1 capsule and spoke the cheerful word 'Poyekhali!' ('Let's go!') as his rocket roared into the sky.",
          "Gagarin completed a single 108-minute orbit around Earth. Looking through the porthole, he gazed down at the curved blue ribbon of our atmosphere. He ate food from a tube, scribbled notes in his logbook, and confirmed that human senses work normally in space.",
          "Less than a month later, Alan Shepard became the first American in space on Freedom 7, and in 1965, Soviet cosmonaut Alexey Leonov stepped outside his spacecraft to perform the very first spacewalk (EVA), tethered only by a safety line above the globe.",
        ],
        interactivePrompt:
          "Inspect the Vostok 1 spherical descent module and ejection seat mechanism in the 3D Spacecraft Museum.",
        didYouKnow:
          "Because the Vostok capsule landed with high velocity, Gagarin had to eject at 7,000 meters altitude and parachute to the ground separately from his capsule!",
      },
      Intermediate: {
        title: "Spacecraft Systems, Physiological Stress, and the Perils of EVA",
        summary:
          "Thermal protection systems, orbital rendezvous, microgravity adaptation, and the extreme physical dangers of early spacewalks.",
        paragraphs: [
          "Early human space capsules like Vostok, Mercury, and Gemini faced extreme engineering challenges. During re-entry, atmospheric compression generates temperatures exceeding 2,500°C. Vostok used a thick ablative coating of asbestos-impregnated resin, while NASA's Mercury capsules used beryllium and ablative fiberglass heat shields.",
          "When Alexey Leonov conducted the world's first Extravehicular Activity (EVA) on Voskhod 2 in March 1965, his spacesuit ballooned in the vacuum of space because the internal pressure (40 kPa) was much higher than the zero external pressure. His boots pulled off his feet and his gloves slipped off his fingers; to fit back into the 1-meter airlock, Leonov had to make the terrifying decision to bleed off oxygen pressure down to 27 kPa.",
          "In microgravity, human physiology immediately begins adapting: fluids shift from the lower limbs toward the chest and head ('puffy-face bird-leg syndrome'), vestibular sensors in the inner ear produce space motion sickness, and over weeks, bones lose ~1% of calcium per month unless countered by intense resistance exercise.",
        ],
        interactivePrompt:
          "Review the trajectory of Vostok 1 in the Solar System Mission Map to trace its 108-minute single-orbit path.",
        didYouKnow:
          "During Vostok 1's re-entry, the instrument module failed to detach cleanly, tethered by electrical cables that caused the capsule to gyrate violently until atmospheric heating burned through the cables!",
      },
      Advanced: {
        title: "Atmospheric Entry Aerodynamics, g-Load Tolerance, and Closed-Loop Life Support",
        summary:
          "Hypersonic ballistics, thermal ablation chemistry, and the cardiovascular hemodynamics of spaceflight.",
        paragraphs: [
          "Ablative heat shields protect human crews via endothermic pyrolysis: high-energy shock layer heat breaks chemical bonds in the resin matrix, creating volatile gases that blow outward through the boundary layer, carrying thermal energy away from the hull. Vostok was a pure sphere with a ballistic coefficient beta = m / (C_D * A); it generated zero aerodynamic lift (L/D = 0) and subjected Gagarin to deceleration peaks of 8 to 10 g.",
          "NASA's Gemini program introduced lifting re-entry bodies (L/D ~ 0.2) by offsetting the spacecraft's center of mass, allowing astronauts to bank the capsule to modulate drag and fly with lower g-loads to a targeted splashdown footprint. Gemini also mastered orbital mechanics: rendezvous between Gemini 6A and 7 proved that to catch an object in front of you in orbit, you must first fire your thrusters backward to drop to a lower, faster orbit!",
          "Modern spacecraft life support must maintain partial pressures of oxygen (pO2 ~ 21 kPa) and nitrogen (pN2 ~ 79 kPa) while scrubbing carbon dioxide (pCO2 < 0.4 kPa) using regenerable amine beds or lithium hydroxide canisters (2 LiOH + CO2 -> Li2CO3 + H2O), preventing hypercapnia and oxygen toxicity.",
        ],
        interactivePrompt:
          "Examine how human spaceflight delta-v budgets compare to robotic planetary missions in the Mission Planning tab.",
        didYouKnow:
          "Cosmonaut Valeri Polyakov holds the single continuous human spaceflight endurance record: 437 days and 18 hours aboard the Mir space station (1994–1995), proving humans can survive the transit duration of a journey to Mars.",
      },
    },
  },
  {
    id: "sublesson-3-moon-exploration",
    title: "Moon Exploration: Apollo to Artemis",
    shortDescription:
      "Saturn V, lunar module landings, regolith geology, and modern polar exploration.",
    durationMinutes: 22,
    order: 3,
    content: {
      Beginner: {
        title: "Stepping on Another World: The Giant Leap",
        summary:
          "Between 1969 and 1972, twelve human astronauts walked on the Moon, drove lunar rovers across dust plains, and returned ancient rocks that revealed the origin of both Earth and Moon.",
        paragraphs: [
          "The journey to the Moon required the most powerful rocket ever successfully flown: the 110-meter-tall Saturn V. It generated 34.5 million newtons of thrust—equivalent to the power of 160 million horsepower. Five massive F-1 rocket engines burned 15 tons of fuel per second at liftoff.",
          "On July 20, 1969, Neil Armstrong and Buzz Aldrin guided the Lunar Module Eagle to a soft landing in Mare Tranquillitatis. With only 25 seconds of descent fuel remaining, Armstrong set the craft down safely, announcing: 'Houston, Tranquility Base here. The Eagle has landed.'",
          "The Apollo astronauts collected 382 kilograms of lunar soil and rock samples. Scientists discovered that the Moon is made of the same materials as Earth's outer mantle, leading to the theory that the Moon was formed when a Mars-sized planet named Theia smashed into the infant Earth 4.5 billion years ago.",
        ],
        interactivePrompt:
          "Inspect the Apollo 11 Lunar Module and Command Module in the 3D Spacecraft Museum to see its gold foil insulation.",
        didYouKnow:
          "Footprints left by Apollo astronauts on the Moon will likely last for millions of years because there is no wind, rain, or liquid water to erode them—only slow micrometeorite bombardment!",
      },
      Intermediate: {
        title: "Translunar Trajectories, Lunar Architecture, and Sample Science",
        summary:
          "Translunar injection, the Lunar Module descent engine, anorthosite rocks, and the Artemis lunar exploration architecture.",
        paragraphs: [
          "Reaching the Moon requires Trans-Lunar Injection (TLI): an acceleration of ~3,050 m/s from Low Earth Orbit that stretches an elliptical orbit out to 384,400 km. NASA chose Lunar Orbit Rendezvous (LOR) architecture, championed by engineer John Houbolt. Instead of landing the entire massive command ship, a lightweight two-stage Lunar Module separated to land on the surface.",
          "The LM Descent Stage featured a revolutionary throttleable rocket engine designed by TRW, allowing Armstrong to hover, tilt, and scan for a safe boulder-free landing zone. When surface exploration ended, the Ascent Stage fired its hypergolic engine from the descent stage (which served as a launch pad) to rendezvous with Michael Collins orbiting above in Columbia.",
          "Modern exploration has shifted toward the Moon's South Pole. Missions like India's Chandrayaan-3 and NASA's Artemis program target polar craters where crater rims receive nearly continuous sunlight while deep crater interiors remain in permanent shadow at -240°C, harboring billions of tons of water ice.",
        ],
        interactivePrompt:
          "Compare the Apollo 11 mission path with Chandrayaan-3's fuel-saving spiral orbit-raising trajectory on the Mission Map.",
        didYouKnow:
          "Apollo 17 astronaut Harrison Schmitt—the first professional geologist to walk on the Moon—discovered strange orange soil in 1972. It turned out to be microscopic glass beads from an ancient explosive volcanic fire fountain 3.6 billion years ago!",
      },
      Advanced: {
        title: "Hyperbolic Insertion, Free-Return Trajectories, and Regolith Petrology",
        summary:
          "Patched conic approximations, the Jacobi constant in Earth-Moon restricted three-body problems, and anorthositic crust formation.",
        paragraphs: [
          "Translunar flight utilizes patched conic approximations: a geocentric Keplerian ellipse transitions into a selenocentric hyperbola at the lunar sphere of influence (radius r_SOI = d * (m_Moon / M_Earth)^(2/5) ~ 66,100 km). Apollo 8, 10, and 11 flew on 'free-return' trajectories: if the service propulsion engine failed, lunar gravity would naturally sling the spacecraft back onto a safe Earth atmospheric entry corridor without burning fuel (which saved the Apollo 13 crew after their oxygen tank exploded).",
          "Lunar regolith is formed by billions of years of impact comminution and agglutinate melting. Analysis of Apollo 15's 'Genesis Rock' (an anorthosite composed of >90% plagioclase feldspar) provided conclusive evidence for the Lunar Magma Ocean hypothesis: when the young Moon melted, low-density plagioclase crystals floated to the top to form the ancient bright lunar highlands.",
          "Artemis mission architecture utilizes a Near-Rectilinear Halo Orbit (NRHO) around the Earth-Moon L2 Lagrange point for the Lunar Gateway station. NRHOs avoid long lunar eclipses, provide continuous line-of-sight communication with Earth, and require less than 10 m/s of stationkeeping delta-v per year.",
        ],
        interactivePrompt:
          "Explore the Gravity Assist simulator to test how gravitational slingshots alter spacecraft trajectories around celestial bodies.",
        didYouKnow:
          "Lunar regolith consists of jagged, abrasive shards of silicate glass that smelled like spent gunpowder to astronauts inside the lunar module cabin and caused allergic reactions called 'lunar hay fever'.",
      },
    },
  },
  {
    id: "sublesson-4-space-stations",
    title: "Space Stations & Living in Orbit",
    shortDescription:
      "Salyut, Skylab, Mir, the International Space Station, and long-duration space habitation.",
    durationMinutes: 20,
    order: 4,
    content: {
      Beginner: {
        title: "Homes in the Sky: Living Continuously Off-Planet",
        summary:
          "The International Space Station is a football-field-sized laboratory orbiting 400 km above us, where international astronauts live and work every day.",
        paragraphs: [
          "Imagine looking out your bedroom window and watching sixteen sunrises and sixteen sunsets every twenty-four hours! That is daily life aboard the International Space Station (ISS). Traveling at 27,600 km/h, the station circles the globe every 92 minutes.",
          "The ISS is built of modules launched separately and assembled together in space like giant Lego blocks. It includes laboratories from the United States, Europe, Japan, and Russia, powered by massive solar array wings that reflect sunlight so brightly that the station is often visible as a bright moving star in the night sky.",
          "Living in weightlessness is exciting but challenging. Astronauts sleep inside vertical sleeping bags tethered to the wall, eat freeze-dried food, and drink recycled water. To prevent their muscles and bones from weakening, they exercise for two hours every single day on special treadmills and resistance machines.",
        ],
        interactivePrompt:
          "Inspect the 3D model of the International Space Station and locate the 8 giant solar wings and Cupola observation window.",
        didYouKnow:
          "Since November 2, 2000, human beings have lived continuously in space without a single day of vacancy—meaning anyone under 25 years old has never lived at a time when all humans were on Earth!",
      },
      Intermediate: {
        title: "Modular Orbital Architecture, Microgravity Science, and Life Support",
        summary:
          "The evolution from Salyut and Skylab to Mir, modular assembly in orbit, and closed-loop environmental control systems.",
        paragraphs: [
          "The first space stations were single-launch modules: the Soviet Salyut program (1971) and NASA's Skylab (1973), which converted a spent Saturn V upper stage into a three-story orbiting workshop. In 1986, the Soviet Union launched Mir, the first modular space station assembled over a decade from multiple docking nodes.",
          "The ISS represents history's most complex international peacetime scientific collaboration, built by 16 nations. Its Environmental Control and Life Support System (ECLSS) is a marvel of recycling engineering: the Water Recovery System reclaims 98% of all water from astronaut sweat, breath condensation, and urine through vacuum distillation and catalytic oxidation.",
          "Microgravity allows scientists to eliminate buoyancy-driven convection, hydrostatic pressure, and sedimentation. Crystals grown aboard the ISS—such as proteins associated with cancer tumors and Parkinson's disease—grow much larger and more structurally flawless than on Earth, enabling pharma teams to map their atomic structures with X-ray crystallography.",
        ],
        interactivePrompt:
          "Check the ISS specs in the 3D Spacecraft Museum to see its 444-tonne mass and 916 m³ pressurized volume.",
        didYouKnow:
          "The Alpha Magnetic Spectrometer (AMS-02) mounted on the ISS truss has measured over 220 billion cosmic ray events, searching for pristine antimatter (anti-helium) from the early universe!",
      },
      Advanced: {
        title: "Orbital Decay Aerodynamics, Sabatier Reactors, and Commercial Station Transitions",
        summary:
          "Atmospheric scale height decay, catalytic CO2 methanation, and the post-ISS commercial LEO economy.",
        paragraphs: [
          "Despite being 400 km above Earth, the ISS experiences atmospheric drag from residual neutral atomic oxygen. The station loses about 50 to 100 meters of altitude each day, requiring periodic re-boost burns by visiting cargo spacecraft (Progress, Cygnus) using v = sqrt(GM/r). During periods of high solar activity, solar extreme ultraviolet (EUV) radiation heats and expands the upper thermosphere, dramatically increasing drag.",
          "Modern station life support utilizes the Sabatier reaction: carbon dioxide scrubbed from cabin air is combined with hydrogen byproduct from water electrolysis over a nickel catalyst at 400°C: CO2 + 4 H2 -> CH4 + 2 H2O. The recovered water is recycled back into the electrolysis loop (2 H2O -> 2 H2 + O2), dramatically lowering the required resupply mass launched from Earth.",
          "As the ISS approaches its planned retirement in 2030, NASA and international partners are transitioning toward commercial low Earth orbit destinations (Axiom Space, Orbital Reef, Starlab). The 444-tonne ISS will undergo a controlled deorbit into Point Nemo in the South Pacific Ocean—the oceanic pole of inaccessibility—to ensure public safety.",
        ],
        interactivePrompt:
          "Use the Distance Comparison tool to contrast the 400 km orbit of the ISS with geostationary orbit and deep space.",
        didYouKnow:
          "Astronauts aboard the ISS experience about 89% of Earth's surface gravity! They float not because there is no gravity, but because they are in freefall around the curvature of the Earth.",
      },
    },
  },
  {
    id: "sublesson-5-mars-rovers",
    title: "Robotic Exploration of Mars",
    shortDescription:
      "From Mariner flybys and Viking landers to Curiosity, Perseverance, and the Ingenuity helicopter.",
    durationMinutes: 24,
    order: 5,
    content: {
      Beginner: {
        title: "Wheels on the Red Planet: The Robot Explorers of Mars",
        summary:
          "Humanity has sent robotic scouts across the solar system to drive across Mars, drill into red rocks, and search for ancient water and signs of past microbial life.",
        paragraphs: [
          "Mars is a cold, dry desert world with a thin carbon dioxide atmosphere and rusty orange dust. When NASA's Mariner 4 flew past Mars in 1965, its grainy photos revealed a cratered, desolate surface that shattered old myths about Martian civilizations.",
          "In 1997, the microwave-sized Sojourner rover became the first wheeled vehicle to drive on Mars, carried inside the Mars Pathfinder lander. It was followed in 2004 by twin golf-cart-sized rovers, Spirit and Opportunity. Expected to survive for just 90 days, Opportunity explored the plains of Mars for an astonishing 14 years!",
          "Today, nuclear-powered robotic laboratories like Curiosity and Perseverance are climbing mountains and exploring ancient river deltas. In 2021, Perseverance was joined by Ingenuity—a 1.8-kilogram helicopter that made history by achieving the very first powered flight on another planet!",
        ],
        interactivePrompt:
          "Open the 3D Spacecraft Museum to inspect Curiosity and Perseverance's rocker-bogie wheels and robotic arm drill.",
        didYouKnow:
          "Ingenuity was originally built as a 30-day technology experiment with five planned flights, but it was so reliable that it completed 72 flights over nearly three years across Mars!",
      },
      Intermediate: {
        title: "Astrobiology, Ancient Habitability, and the Evolution of Rover Engineering",
        summary:
          "Sky Crane landings, sedimentary geology, ancient freshwater lakes, and the search for biosignatures.",
        paragraphs: [
          "Landing a heavy rover on Mars is known as the 'Seven Minutes of Terror'. Because a radio signal takes up to 20 minutes to reach Earth, the landing sequence must be 100% autonomous. The spacecraft hits the upper atmosphere at 20,000 km/h, uses a supersonic parachute to slow down, and then fires retro-rockets on a 'Sky Crane' that lowers the rover on nylon bridles directly onto its wheels.",
          "In 2012, Curiosity landed in Gale Crater, a 154-km-wide impact basin. By drilling into fine-grained mudstones at Yellowknife Bay, Curiosity discovered that 3.5 billion years ago, Gale Crater held a persistent freshwater lake with neutral pH, low salinity, and essential bio-elements (carbon, hydrogen, oxygen, nitrogen, sulfur, and phosphorus)—proving Mars was once habitable for microbial life.",
          "Perseverance landed in Jezero Crater in 2021, targeting an ancient river delta where mud and sand were deposited. Equipped with deep-UV Raman spectroscopy (SHERLOC) and micro-X-ray fluorescence (PIXL), Perseverance drills core samples and hermetically seals them inside titanium tubes for a future Mars Sample Return mission.",
        ],
        interactivePrompt:
          "Try the 'Plan a Journey to Mars' challenge to calculate the 8.5-month Hohmann transfer duration and delta-v budget.",
        didYouKnow:
          "Perseverance carries an experiment named MOXIE that successfully inhaled Martian carbon dioxide and split it into carbon monoxide and breathable oxygen—a crucial technology for future human astronauts!",
      },
      Advanced: {
        title:
          "Atmospheric Entry Guidance, Rocker-Bogie Kinematics, and Diagenetic Organic Chemistry",
        summary:
          "Terrain-Relative Navigation, ballistic coefficient management, and preserved macromolecular kerogen signatures.",
        paragraphs: [
          "Mars EDL (Entry, Descent, and Landing) presents a unique challenge: the atmosphere is dense enough to generate extreme friction heating (requiring a PICA-X heat shield), yet too thin (scale height H ~ 11.1 km, surface pressure ~6 mbar) to slow down heavy payloads with parachutes alone. Perseverance pioneered Terrain-Relative Navigation (TRN): during parachute descent, downward cameras mapped surface terrain in real time, matching craters against onboard orbital maps to steer the retro-rocket pack away from boulder fields.",
          "The mobility system utilizes an un-sprung rocker-bogie kinematic linkage. The term 'rocker' refers to the larger front link, pivoted at the chassis via a differential gear; the 'bogie' is the smaller trailing rear link. This geometry mechanically guarantees that all six cleated aluminum wheels maintain ground contact with equalized normal force, allowing the rover to climb over obstacles larger than its wheel diameter without tipping.",
          "Sample Analysis at Mars (SAM) heated sedimentary samples to 850°C, detecting thiophenes, benzene, and aliphatic hydrocarbons preserved in 3.5-billion-year-old lacustrine mudstones. While non-biological abiotic sources (meteoritic infall, Fischer-Tropsch synthesis) can produce organic molecules, their preservation indicates that ancient biosignatures could survive deep underground shielded from ionizing cosmic rays.",
        ],
        interactivePrompt:
          "Review the Delta-V and Staging physics panel to understand why sending rovers to Mars requires multi-stage heavy rockets.",
        didYouKnow:
          "Opportunity rover discovered tiny, spherical hematite concretions nick-named 'blueberries' scattered across Meridiani Planum, providing the first mineralogical proof that liquid acidic groundwater once soaked Mars' rocks.",
      },
    },
  },
  {
    id: "sublesson-6-outer-probes",
    title: "Outer Solar System Probes & Interstellar Voyagers",
    shortDescription:
      "Voyagers, Pioneers, Galileo, Cassini, New Horizons, and crossing into the interstellar medium.",
    durationMinutes: 22,
    order: 6,
    content: {
      Beginner: {
        title: "Beyond the Asteroid Belt: The Great Journeys to the Outer Planets",
        summary:
          "Venture billions of kilometers from the Sun where giant planets reign, moons hide subsurface oceans, and humanity's farthest probes enter interstellar space.",
        paragraphs: [
          "Past Mars lies the Asteroid Belt and the immense outer solar system. Sunlight out here is faint and cold. Spacecraft cannot rely on solar panels; instead, they carry nuclear batteries called RTGs that convert heat from decaying plutonium into electricity.",
          "In 1977, NASA launched Voyager 1 and Voyager 2 to take advantage of a rare alignment of the outer planets that occurs only once every 175 years. This alignment allowed the probes to slingshot from Jupiter to Saturn, Uranus, and Neptune like cosmic pinballs without using extra fuel.",
          "Voyager 1 is now over 24 billion kilometers from Earth—the farthest human-made object ever created. Both Voyagers carry a Golden Record filled with greetings, animal calls, music from Bach to Chuck Berry, and pictures of life on Earth, floating forever in the galaxy.",
        ],
        interactivePrompt:
          "Inspect Voyager 1 in the 3D Spacecraft Museum and locate the 3.7-meter antenna and Golden Record.",
        didYouKnow:
          "It takes over 22 hours for a radio signal traveling at the speed of light to reach Voyager 1 and another 22 hours for its answer to arrive back at Earth!",
      },
      Intermediate: {
        title: "The Grand Tour, Tidal Heating, and Ocean Worlds",
        summary:
          "Gravity assists, volcanism on Io, subsurface oceans on Europa and Enceladus, and the Huygens landing on Titan.",
        paragraphs: [
          "The outer solar system probes revolutionized planetary science by revealing that cold, distant moons can be geologically alive. When Voyager 1 flew past Jupiter's moon Io in 1979, Linda Morabito noticed a giant umbrella-shaped plume erupting 300 km into space: Io has over 400 active volcanoes, heated by tidal friction as Jupiter and sister moons tug relentlessly on its interior.",
          "The Galileo mission at Jupiter (1995–2003) confirmed that Europa hides a global liquid saltwater ocean beneath its cracked ice shell containing twice as much water as all of Earth's oceans combined! Later, the Cassini-Huygens mission at Saturn (2004–2017) discovered active geysers shooting water vapor, salts, and simple organic molecules out of south polar fractures on tiny Enceladus.",
          "Cassini also released the European Huygens probe, which descended through the thick orange nitrogen atmosphere of Titan in 2005. Huygens revealed riverbeds, rounded pebble rocks, and liquid lakes made not of water, but of liquid methane and ethane at -180°C.",
        ],
        interactivePrompt:
          "Use the Gravity Assist Simulator to model how Voyager 1 used Jupiter's orbital momentum to slingshot toward interstellar space.",
        didYouKnow:
          "In 2015, NASA's New Horizons probe flew past Pluto after a 9.5-year journey, revealing a giant heart-shaped glacier of nitrogen ice named Tombaugh Regio and 3,000-meter-tall mountains of solid water ice!",
      },
      Advanced: {
        title: "Interstellar Crossing, Heliopause Physics, and Hyperbolic Escape Trajectories",
        summary:
          "The termination shock, cosmic ray modulation, interstellar magnetic alignment, and hyperbolic excess velocity.",
        paragraphs: [
          "The Sun's magnetic bubble—the heliosphere—inflates outward until its solar wind pressure balances the pressure of the interstellar medium. The solar wind decelerates from supersonic to subsonic speeds at the Termination Shock (~94 AU for Voyager 1), flows through the turbulent Heliosheath, and reaches the Heliopause at ~121.6 AU.",
          "On August 25, 2012, Voyager 1's cosmic ray detectors observed a sudden, historic inflection: solar wind energetic particles dropped by a factor of 1,000, while high-energy galactic cosmic rays jumped by 9%. Concurrently, plasma wave vibrations triggered by a solar flare revealed electron densities of 0.08 cm⁻³—characteristic of the dense, cold interstellar medium.",
          "To escape the Sun's gravitational well, a spacecraft must achieve hyperbolic excess velocity v_infinity = sqrt(v² - 2GM_Sun/r) > 0. Voyager 1 leaves our solar system at approximately 3.6 AU per year (17.0 km/s). Even at this tremendous speed, it will take roughly 40,000 years for Voyager 1 to pass within 1.6 light-years of the red dwarf star Gliese 445.",
        ],
        interactivePrompt:
          "Explore the Solar System Mission Map to follow the interstellar trajectories of Voyager 1 and New Horizons past the Kuiper Belt.",
        didYouKnow:
          "Plutonium-238 inside the Voyager RTGs decays with a half-life of 87.7 years. Every year, the generators lose about 4 watts of power, forcing NASA engineers to systematically turn off instruments and heaters to keep the spacecraft alive!",
      },
    },
  },
  {
    id: "sublesson-7-space-telescopes",
    title: "Space Telescopes: Eyes Beyond the Atmosphere",
    shortDescription:
      "Hubble, Kepler, Chandra, and the groundbreaking infrared vision of the James Webb Space Telescope.",
    durationMinutes: 20,
    order: 7,
    content: {
      Beginner: {
        title: "Windows into the Deep Universe: Telescopes in Space",
        summary:
          "Placing telescopes above Earth's murky, shifting atmosphere allows astronomers to capture razor-sharp views of distant galaxies and uncover the history of the cosmos.",
        paragraphs: [
          "Have you ever looked at stars on a summer night and noticed them twinkling? While pretty, that twinkle is caused by Earth's shifting, turbulent air blurring light before it reaches telescopes on the ground. Earth's atmosphere also blocks out most infrared, ultraviolet, and X-ray light.",
          "In 1990, the Hubble Space Telescope was launched into orbit. Operating high above the clouds, Hubble captured breathtaking photos of glowing gas nebulae, colliding galaxies, and ancient stars. When Hubble stared at a tiny, seemingly empty patch of black sky for 10 days, it revealed thousands of previously unknown galaxies stretching back toward the dawn of time!",
          "In 2021, the James Webb Space Telescope (JWST) launched. Webb is the largest telescope ever sent into space, featuring 18 hexagonal mirrors coated in pure gold and a sunshield the size of a tennis court to keep its instruments super-cold so it can see deep infrared heat from the very first stars.",
        ],
        interactivePrompt:
          "Inspect the 3D model of JWST to examine its 18 golden hexagonal mirrors and 5-layer silver sunshield.",
        didYouKnow:
          "The gold coating on all 18 of JWST's primary mirrors weighs only about 48 grams—roughly the same mass as a single golf ball—spread out into an ultra-thin layer just 100 nanometers thick!",
      },
      Intermediate: {
        title: "Atmospheric Windows, Cryogenic Cooling, and Sun-Earth Lagrange Points",
        summary:
          "The electromagnetic transmission of Earth's atmosphere, space shuttle servicing missions, and L2 halo orbits.",
        paragraphs: [
          "Earth's atmosphere acts as a protective shield, but for astronomers it acts like frosted glass. Visible light and radio waves pass through easily, but water vapor absorbs infrared, ozone blocks ultraviolet, and nitrogen absorbs X-rays and gamma rays. Space telescopes are essential for observing the multi-wavelength universe.",
          "Hubble was uniquely designed to be serviced in orbit by Space Shuttle astronauts. Between 1993 and 2009, astronauts completed five daring servicing missions to install corrective optics (fixing a 2-micrometer manufacturing flaw in its primary mirror), replace failing gyroscopes, and upgrade cameras with state-of-the-art detectors.",
          "Unlike Hubble, JWST orbits 1.5 million kilometers away at the second Sun-Earth Lagrange point (L2). Because warm objects glow in infrared light, JWST must operate at cryogenic temperatures (-233°C / 40 Kelvin). Its five-layer Kapton sunshield reflects heat from the Sun, Earth, and Moon, allowing JWST to peer through cosmic dust clouds and observe early galaxies whose light has been redshifted by cosmic expansion.",
        ],
        interactivePrompt:
          "Compare Hubble's low Earth orbit with JWST and Aditya-L1's Lagrange point orbits in the Mission Map.",
        didYouKnow:
          "NASA's Kepler space telescope stared at a single patch of 150,000 stars for over four years, watching for tiny dips in brightness as exoplanets transited in front of their stars, discovering over 2,700 confirmed alien worlds!",
      },
      Advanced: {
        title: "Diffraction Limits, Redshift Spectroscopy, and Lagrange Equilibrium Dynamics",
        summary:
          "Rayleigh resolution limits, multi-object spectroscopy with microshutters, and Lissajous orbit stationkeeping.",
        paragraphs: [
          "The angular resolution of a telescope is governed by the diffraction limit theta = 1.22 * lambda / D. Because JWST has an effective diameter D = 6.5 m, it achieves an angular resolution of ~0.07 arcseconds at 2 microns. For cosmological deep surveys, JWST observes galaxies at redshift z > 14 (observed wavelength lambda_obs = lambda_rest * (1 + z)). Neutral hydrogen's Lyman-alpha break (121.6 nm) is shifted into the near-infrared at 1.8 microns.",
          "JWST's NIRSpec instrument features a Microshutter Array containing 250,000 individually addressable magnetic shutters (each 100 x 200 microns wide). By opening only the shutters that align with target galaxies while closing the rest, NIRSpec can obtain simultaneous infrared spectra for up to 100 distant galaxies in a single observation, measuring their stellar masses, chemical metallicities, and star formation rates.",
          "Sun-Earth L2 is an unstable saddle point in the effective gravitational potential of the restricted three-body problem. Spacecraft do not sit stationary at L2; instead, they execute quasi-periodic Lissajous or Halo orbits around L2 with an orbital period of ~6 months, requiring small stationkeeping burns (~2 to 3 m/s per year) using monopropellant thrusters.",
        ],
        interactivePrompt:
          "Review the Spacecraft Specs for JWST to learn how its Mid-Infrared Instrument (MIRI) uses an active helium cryocooler.",
        didYouKnow:
          "Thanks to the pinpoint launch accuracy of the Ariane 5 rocket, JWST burned much less onboard fuel than anticipated during its cruise to L2, leaving enough propellant to support science operations for more than 20 years instead of the baseline 10!",
      },
    },
  },
  {
    id: "sublesson-8-future-planning",
    title: "Modern & Future Mission Planning",
    shortDescription:
      "Chandrayaan south pole missions, Aditya-L1 solar halo science, Artemis bases, and interstellar propulsion.",
    durationMinutes: 24,
    order: 8,
    content: {
      Beginner: {
        title: "The Next Frontier: Moon Bases, Sun Watchers, and Interplanetary Dreams",
        summary:
          "Space exploration has entered a vibrant new era led by international space agencies and innovative missions returning to the Moon, studying the Sun, and preparing for humans on Mars.",
        paragraphs: [
          "We are living in an exciting new golden age of space exploration! Today, nations like India, the United States, Europe, Japan, and China are launching bold missions to unmapped territories.",
          "In August 2023, India's Chandrayaan-3 achieved history by becoming the first spacecraft ever to land near the Moon's South Pole. Its Vikram lander and Pragyan rover explored the cold lunar regolith, detecting sulfur and proving that India could land with world-leading precision and affordability.",
          "Just days later, India launched Aditya-L1, a spacecraft that flew 1.5 million kilometers toward the Sun to sit at a special gravitational balance point called L1. There, it watches solar flares and giant magnetic storms 24 hours a day without ever being blocked by Earth's shadow.",
        ],
        interactivePrompt:
          "Explore the 3D models of Chandrayaan-3 and Aditya-L1 in the Spacecraft Museum to see their instruments and solar arrays.",
        didYouKnow:
          "NASA's Artemis program plans to land the first woman and the next man on the Moon, building a sustainable base camp at the lunar South Pole to prepare for the first crewed missions to Mars!",
      },
      Intermediate: {
        title: "Lunar South Pole Science, Space Weather Forecasting, and Planetary Defense",
        summary:
          "Volatiles in permanently shadowed craters, coronal mass ejection tracking, and kinetic asteroid redirection.",
        paragraphs: [
          "The Moon's South Pole is the world's most sought-after destination because of its unique topography. Impact craters like Shackleton and South Pole-Aitken basin have rims high enough to receive sunlight for up to 90% of the lunar year, while their deep crater floors have been plunged in permanent shadow for over two billion years. These cold traps maintain temperatures as low as 30 Kelvin (-243°C), harboring thick deposits of water ice that can be mined for rocket propellant (hydrogen and oxygen).",
          "Space weather has become critical to modern civilization. Coronal Mass Ejections (CMEs)—giant eruptions of magnetized plasma expelled from the Sun—can collide with Earth's magnetosphere, inducing geomagnetic currents that can overload electrical power grids, scramble GPS satellite navigation, and expose high-altitude airline passengers to radiation. Observatories like Aditya-L1 and SOHO at Sun-Earth L1 give Earth hours of advance warning.",
          "Planetary defense is also moving from theory to reality. In 2022, NASA's DART (Double Asteroid Redirection Test) mission deliberately slammed a 570-kg spacecraft into the asteroid moonlet Dimorphos at 22,500 km/h, altering its orbital period by 33 minutes and proving that humanity can deflect threatening asteroids.",
        ],
        interactivePrompt:
          "Try the 'Plan a Journey to Mars' mission planner to see the trade-offs between aerocapture and propulsive orbit insertion.",
        didYouKnow:
          "Chandrayaan-3's ChaSTE thermal probe discovered that while the top layer of lunar dust was warmed by the Sun to ~50°C, just 8 centimeters below the surface the temperature plunged to -10°C, proving lunar regolith is one of the most effective thermal insulators in the universe!",
      },
      Advanced: {
        title: "Orbital Transfers, Specific Impulse, and Advanced Interplanetary Propulsion",
        summary:
          "The Tsiolkovsky rocket equation, Hohmann transfer delta-v, nuclear thermal propulsion, and ion thruster mechanics.",
        paragraphs: [
          "Mission planners calculate the feasibility of any spaceflight using the delta-v (velocity increment) budget. For an interplanetary Hohmann transfer from Earth (radius r1 = 1 AU) to Mars (radius r2 = 1.524 AU), the transfer semi-major axis is a_t = (r1 + r2) / 2 = 1.262 AU. The velocity change required for Trans-Mars Injection (TMI) from Earth orbit is Delta-v1 = sqrt(mu_Sun/r1) * (sqrt(2*r2 / (r1 + r2)) - 1) approx 2.95 km/s excess velocity, requiring ~3.6 to 3.9 km/s from Low Earth Orbit.",
          "Chemical rocket engines are limited by the thermal energy stored in molecular chemical bonds: liquid hydrogen and oxygen (Hydrolox) achieve a maximum specific impulse I_sp approx 450 seconds (exhaust velocity v_e = I_sp * g0 approx 4,400 m/s). By the Tsiolkovsky equation, Delta-v = v_e * ln(m0 / mf); to achieve high delta-v, the initial mass must grow exponentially.",
          "To explore beyond Mars, advanced propulsion systems are necessary. Hall-effect electric ion thrusters accelerate xenon ions using electrostatic fields, reaching I_sp of 3,000 to 5,000 seconds with extremely low propellant consumption. Nuclear Thermal Propulsion (NTP)—which uses a fission reactor to heat liquid hydrogen to 2,700 K—delivers I_sp approx 900 seconds with high thrust, potentially cutting human transit times to Mars in half.",
        ],
        interactivePrompt:
          "Open the Delta-V and Staging Physics lab to test how engine I_sp and staging impact the payload mass fraction.",
        didYouKnow:
          "In October 2024, NASA launched Europa Clipper on a 2.9-billion-kilometer journey using Mars and Earth gravity assists to investigate whether Jupiter's icy moon Europa has conditions suitable for life in its vast subsurface ocean!",
      },
    },
  },
];

export const MODULE_22_QUIZ: QuizQuestion[] = [
  {
    id: "m22-q1",
    question:
      "Why was the discovery of the Van Allen Radiation Belts by Explorer 1 scientifically significant?",
    options: [
      "It showed that outer space is completely empty and sterile",
      "It proved that Earth's magnetic field traps high-energy charged particles from the solar wind and cosmic rays",
      "It proved that the Moon has an atmosphere of nitrogen gas",
      "It demonstrated that satellites cannot stay in orbit without chemical rocket motors firing continuously",
    ],
    correctIndex: 1,
    explanation:
      "James Van Allen's Geiger counter on Explorer 1 discovered toroidal zones of energetic protons and electrons trapped by Earth's geomagnetic dipole field, founding the field of magnetospheric space physics.",
    hint: "Think about how Earth's magnetic field interacts with charged particles emitted by the Sun.",
  },
  {
    id: "m22-q2",
    question:
      "What physical mechanism allows a spacecraft to gain speed during a gravitational slingshot (gravity assist)?",
    options: [
      "The spacecraft catches solar wind photons using its thermal radiator panels",
      "In the planet's reference frame, the spacecraft speed doubles during periapsis passage",
      "The spacecraft absorbs an infinitesimal fraction of the moving planet's heliocentric orbital momentum",
      "The planet's magnetic field repels the metallic spacecraft like a railgun",
    ],
    correctIndex: 2,
    explanation:
      "In the planet's reference frame, entry speed equals exit speed (the trajectory is simply bent). However, because the planet is moving rapidly around the Sun, vector addition in the Sun's heliocentric reference frame transfers orbital kinetic energy from the planet to the spacecraft.",
    hint: "Think about vector addition: what is the speed relative to the Sun when you add the planet's orbital velocity?",
  },
  {
    id: "m22-q3",
    question:
      "Why is the Lunar South Pole the primary target for modern lunar exploration missions like Chandrayaan-3 and Artemis?",
    options: [
      "The south pole is made entirely of solid iron and gold meteorites",
      "Deep permanently shadowed crater floors maintain temperatures cold enough to preserve billions of tons of water ice volatiles",
      "The south pole has gravity three times stronger than the lunar equator",
      "It is the only place on the Moon where standard GPS satellites work",
    ],
    correctIndex: 1,
    explanation:
      "Permanently Shadowed Regions (PSRs) at the lunar poles act as cryogenic cold traps at -240°C that have preserved volatile water ice deposits for billions of years, providing vital resources for life support and rocket fuel (hydrogen and oxygen).",
    hint: "Look for the answer related to water ice and permanently shadowed craters.",
  },
  {
    id: "m22-q4",
    question:
      "Why is the James Webb Space Telescope (JWST) placed at Sun-Earth L2 rather than in Low Earth Orbit like Hubble?",
    options: [
      "Low Earth Orbit does not have enough sunlight to charge solar batteries",
      "To observe faint infrared light, JWST must stay cryogenically cold (40 Kelvin) behind a sunshield shielded from Earth and Sun heat",
      "L2 is closer to Alpha Centauri than Earth orbit",
      "Radio signals from L2 travel faster than the speed of light",
    ],
    correctIndex: 1,
    explanation:
      "Because warm objects emit infrared radiation, JWST's mirrors and instruments would be blinded by Earth's thermal glow in LEO. At L2 (1.5 million km away), the Sun, Earth, and Moon stay permanently behind its 5-layer sunshield, allowing passive cryogenic cooling to 40 K.",
    hint: "Think about what kind of light JWST observes and what happens when warm objects radiate heat.",
  },
  {
    id: "m22-q5",
    question:
      "According to the Tsiolkovsky Rocket Equation (Delta-v = Isp * g0 * ln(m0 / mf)), how can an engineer increase the velocity change of a rocket?",
    options: [
      "By increasing the dry mass (mf) of the empty tanks and payload",
      "By using propellants with higher specific impulse (Isp) or increasing the mass ratio (m0 / mf)",
      "By painting the rocket in darker thermal absorption colors",
      "By reducing the exhaust velocity of the engine gases",
    ],
    correctIndex: 1,
    explanation:
      "Delta-v scales linearly with engine specific impulse (or exhaust velocity ve = Isp * g0) and logarithmically with the propellant mass fraction (m0 / mf). Higher Isp engines (such as hydrolox or ion thrusters) produce far greater velocity change per kilogram of fuel.",
    hint: "Look at the variables inside the equation: what makes the product Isp * g0 * ln(m0/mf) larger?",
  },
  {
    id: "m22-q6",
    question:
      "What historic achievement was demonstrated by the Ingenuity scout helicopter on Mars?",
    options: [
      "The first discovery of fossilized dinosaur bones on another planet",
      "The first powered, controlled aerodynamic flight of an aircraft in the thin atmosphere of another planet",
      "The first autonomous landing without a heat shield or parachute",
      "The first communication link with an alien civilization",
    ],
    correctIndex: 1,
    explanation:
      "Ingenuity proved that powered aerodynamic lift is possible in Mars' ultra-thin atmosphere (less than 1% of Earth's atmospheric density) using ultra-light carbon-fiber counter-rotating blades spinning at 2,400 RPM.",
    hint: "Think about what helicopters do and how thin Mars' atmosphere is compared to Earth.",
  },
];

export const MODULE_22_DISCOVERY_FACTS = [
  {
    fact: "Voyager 1 carries a Golden Record containing greetings in 55 human languages, 115 images, sounds of wind, thunder, and whales, and 90 minutes of music from around the world. It will remain readable for over one billion years as it drifts through interstellar space.",
    source: "NASA Jet Propulsion Laboratory (Voyager Interstellar Mission Archive)",
  },
  {
    fact: "Chandrayaan-3's Vikram lander and Pragyan rover achieved a lunar south pole soft landing on a budget of approximately ₹615 crore (~$75 million)—less than the production budget of major Hollywood space films like 'Interstellar' or 'Gravity'!",
    source: "Indian Space Research Organisation (ISRO Chandrayaan-3 Mission Briefing)",
  },
  {
    fact: "The Apollo 11 guidance computer (AGC) that navigated Neil Armstrong and Buzz Aldrin to the Moon had just 4 kilobytes of RAM and a 32-kilobyte ROM running at 1.024 MHz—millions of times less computing power than a modern basic smartwatch!",
    source: "MIT Instrumentation Laboratory Historical Archives",
  },
  {
    fact: "The International Space Station has traveled over 4.8 billion kilometers during its orbital lifetime—equivalent to flying from Earth to Neptune and back again—while traveling at 7.66 kilometers every single second.",
    source: "NASA ISS Trajectory & Orbital Operations Team",
  },
  {
    fact: "Because Mars has an elliptical orbit, the distance between Earth and Mars varies dramatically from a close approach of 54.6 million kilometers to over 401 million kilometers, creating optimal launch windows only once every 26 months (780 days).",
    source: "NASA Planetary Data System (Orbital Ephemerides & Synodic Periods)",
  },
  {
    fact: "The James Webb Space Telescope's 18 primary mirror segments are aligned with an accuracy better than 20 nanometers—roughly 1/5,000th the thickness of a single sheet of paper—using 126 miniature cryogenic computer-controlled actuators.",
    source: "NASA Goddard Space Flight Center (JWST Wavefront Sensing & Control)",
  },
  {
    fact: "During Apollo 13's harrowing mission in 1970, when an oxygen tank exploded 320,000 km from Earth, mission controllers used the Moon's gravity to swing the damaged spacecraft around the lunar far side on a 'free-return' trajectory without firing the broken main engine, saving the crew's lives.",
    source: "NASA Mission Operations Directorate (Apollo 13 Mission Report)",
  },
  {
    fact: "Aditya-L1's halo orbit around the Sun-Earth L1 Lagrange point is so stable that it requires less than 2 to 3 meters per second of velocity adjustment per year to maintain its stationkeeping, providing an unocculted view of the Sun 365 days a year.",
    source: "ISRO Telemetry, Tracking and Command Network (ISTRAC)",
  },
  {
    fact: "To survive the -90°C cold of Martian nights, the Curiosity and Perseverance rovers pump liquid Freon through internal tubes warmed by heat from decaying Plutonium-238 inside their nuclear generators—acting like a mechanical circulatory system.",
    source: "NASA JPL Mars Science Laboratory Engineering Team",
  },
  {
    fact: "New Horizons was launched from Earth at 16.26 km/s (58,536 km/h)—the fastest launch velocity of any spacecraft leaving Earth in history—reaching the Moon's orbit in just nine hours (compared to three days for Apollo 11)!",
    source: "Johns Hopkins Applied Physics Laboratory (New Horizons Mission History)",
  },
];

export const MODULE_22_SOURCES: ScientificSource[] = [
  {
    title: "NASA Planetary Missions Directory & Deep Space Network Operations",
    organization: "NASA",
    url: "https://science.nasa.gov/missions/",
    note: "Comprehensive flight records, trajectory data, and instrument specifications for Voyager, Apollo, Curiosity, and Perseverance.",
  },
  {
    title: "Chandrayaan-3 Lunar South Pole Landing & Science Instrumentation Archive",
    organization: "ISRO",
    url: "https://www.isro.gov.in/Chandrayaan3.html",
    note: "Primary telemetry, ChaSTE soil thermal profiles, ILSA seismometry, and Pragyan rover LIBS chemical discoveries.",
  },
  {
    title: "Aditya-L1 Solar Observatory Halo Orbit Science Documentation",
    organization: "ISRO",
    url: "https://www.isro.gov.in/Aditya_L1.html",
    note: "Sun-Earth L1 Lagrange insertion mechanics, VELC coronagraph, and SUIT ultraviolet solar flare observations.",
  },
  {
    title: "The James Webb Space Telescope Mission & Cryogenic Mirror Architecture",
    organization: "JWST",
    url: "https://webb.nasa.gov/",
    note: "L2 Halo orbit dynamics, 5-layer Kapton sunshield thermal models, and NIRCam/NIRSpec instrument performance.",
  },
  {
    title: "International Space Station Science Research & ECLSS Operations",
    organization: "NASA / ESA / JAXA",
    url: "https://www.nasa.gov/international-space-station/",
    note: "Continuous human habitation records, microgravity research yields, and regenerative closed-loop life support engineering.",
  },
  {
    title: "Voyager Interstellar Mission & Heliopause In-Situ Measurements",
    organization: "NASA",
    url: "https://voyager.jpl.nasa.gov/",
    note: "Direct in-situ plasma wave density observations, cosmic ray boundary crossings, and DSN telemetry links.",
  },
];
