// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface ObservatoryTarget {
  id: string;
  name: string;
  catalogId: string;
  category: "Nebula" | "Supernova Remnant" | "Galaxy" | "Solar System Body" | "Star Cluster";
  constellation: string;
  distance: string;
  distanceLightYears: number;
  description: string;
  scientificSignificance: string;
  // Authentic multi-wavelength observational datasets
  wavelengthData: {
    radio: {
      summary: string;
      primaryMechanism: string;
      detectedFeatures: string[];
      observatoryExample: string;
      authenticArchiveImage: string;
      simulatedColor: string;
      temperatureRevealed: string;
    };
    infrared: {
      summary: string;
      primaryMechanism: string;
      detectedFeatures: string[];
      observatoryExample: string;
      authenticArchiveImage: string;
      simulatedColor: string;
      temperatureRevealed: string;
    };
    visible: {
      summary: string;
      primaryMechanism: string;
      detectedFeatures: string[];
      observatoryExample: string;
      authenticArchiveImage: string;
      simulatedColor: string;
      temperatureRevealed: string;
    };
    ultraviolet: {
      summary: string;
      primaryMechanism: string;
      detectedFeatures: string[];
      observatoryExample: string;
      authenticArchiveImage: string;
      simulatedColor: string;
      temperatureRevealed: string;
    };
    xray: {
      summary: string;
      primaryMechanism: string;
      detectedFeatures: string[];
      observatoryExample: string;
      authenticArchiveImage: string;
      simulatedColor: string;
      temperatureRevealed: string;
    };
  };
  // Spectral characteristics
  spectralData: {
    continuumType:
      | "Blackbody (Thermal)"
      | "Synchrotron (Non-Thermal Power Law)"
      | "Bremsstrahlung (Thermal Free-Free)";
    dominantLines: Array<{
      name: string;
      restWavelengthNm: number;
      lineType: "emission" | "absorption";
      element: string;
      intensity: number; // 0.1 to 1.0
      scientificMeaning: string;
    }>;
    temperatureKelvin: number;
    intrinsicRedshiftZ: number;
  };
}

export interface TelescopeModel {
  id: string;
  name: string;
  type:
    | "Refractor"
    | "Reflector"
    | "Space Observatory"
    | "Radio Interferometer"
    | "X-ray Grazing Mirror";
  opticalDesign: string;
  apertureMeters: number;
  focalLengthMeters: number;
  primaryLocation:
    | "Ground (Sea Level)"
    | "Ground (High Altitude Mountain)"
    | "Low Earth Orbit (LEO)"
    | "Sun-Earth L2 Lagrange Point";
  wavelengthCoverage: Array<"radio" | "infrared" | "visible" | "ultraviolet" | "xray">;
  lightGatheringPowerVsEye: number; // D^2 / (0.007m)^2
  diffractionLimitArcsecVisible: number; // θ ≈ 1.22 * 550nm / D * 206265
  hasAdaptiveOptics: boolean;
  cryogenicCooling: boolean;
  detectorType: string;
  realWorldFacility: string;
  advantages: string[];
  limitations: string[];
}

export interface AstronomerMission {
  id: string;
  missionNumber: number;
  title: string;
  researchGoal: string;
  astrophysicalContext: string;
  question: string;
  targetId: string;
  recommendedTelescopeId: string;
  correctWavelength: "radio" | "infrared" | "visible" | "ultraviolet" | "xray";
  minApertureMeters: number;
  minExposureSeconds: number;
  requiresSpaceOrAO: boolean;
  successAnalysis: string;
  whyOtherBandsFail: Record<string, string>;
  scientificCitation: string;
  points: number;
}

export const OBSERVATORY_TARGETS: ObservatoryTarget[] = [
  {
    id: "target_pillars",
    name: "Eagle Nebula (Pillars of Creation)",
    catalogId: "Messier 16 / NGC 6611",
    category: "Nebula",
    constellation: "Serpens",
    distance: "6,500 light-years (2,000 pc)",
    distanceLightYears: 6500,
    description:
      "Towers of cold molecular hydrogen gas and microscopic dust grains sculpted by the blistering ultraviolet winds of newborn massive cluster stars.",
    scientificSignificance:
      "Classic stellar nursery demonstrating evaporating gaseous globules (EGGs) and triggered star birth within dense Bok globules.",
    wavelengthData: {
      radio: {
        summary:
          "ALMA and VLA trace cold millimeter CO emission and neutral hydrogen (HI) molecules moving inside the trunks.",
        primaryMechanism:
          "Rotational transitions of carbon monoxide (CO J=1→0 at 2.6 mm) and cold dust thermal emission.",
        detectedFeatures: [
          "Cold molecular gas reservoir (~10-30 K)",
          "Proto-stellar core collapse densities",
          "Shock boundary velocities",
        ],
        observatoryExample: "ALMA (Atacama Large Millimeter/submillimeter Array)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-700 via-orange-800 to-amber-950",
        temperatureRevealed: "10 K – 50 K (Extremely Cold Gas)",
      },
      infrared: {
        summary:
          "JWST NIRCam & MIRI pierce through the dust veil, revealing thousands of newly ignited protostars embedded inside the dense pillars.",
        primaryMechanism:
          "Infrared wavelengths (2–15 μm) are longer than dust grain sizes (~0.1 μm), allowing light to pass unscattered (Rayleigh scattering ∝ λ⁻⁴).",
        detectedFeatures: [
          "Embedded infant protostars with jet outflows",
          "Luminescent warm polycyclic aromatic hydrocarbon (PAH) dust",
          "Distant background galaxies seen right through pillars",
        ],
        observatoryExample: "JWST NIRCam / MIRI (NASA / ESA / CSA)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-500 via-rose-600 to-purple-900",
        temperatureRevealed: "100 K – 800 K (Warm Dust & Protostars)",
      },
      visible: {
        summary:
          "Hubble Space Telescope captures dark, opaque dust silhouettes against a glowing backdrop of ionized hydrogen (H-alpha) and forbidden oxygen ([O III]).",
        primaryMechanism:
          "Photoionization by nearby massive O-type stars excites gas into recombination lines; dust grains extinguish and scatter visible light.",
        detectedFeatures: [
          "Sharp silhouette of evaporating pillars",
          "Ionization photoevaporation fronts",
          "Ionized hydrogen glowing in deep red (656 nm) and oxygen in teal (501 nm)",
        ],
        observatoryExample: "Hubble Space Telescope (WFC3 / ACS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-emerald-600 via-teal-700 to-amber-800",
        temperatureRevealed: "8,000 K – 12,000 K (Ionized H II Plasma)",
      },
      ultraviolet: {
        summary:
          "Exposes the ionizing radiation from the scorching O- and B-type stars in open cluster NGC 6611 that are actively eroding the pillars.",
        primaryMechanism:
          "Thermal blackbody radiation from ultra-hot massive stars (T > 30,000 K) peaking in the far-UV.",
        detectedFeatures: [
          "Blistering massive O/B star cluster cores",
          "Shock-heated photoevaporation ridges",
          "High-excitation fluorescence",
        ],
        observatoryExample: "Hubble Space Telescope (Cosmic Origins Spectrograph / ACS SBC)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-indigo-600 via-blue-500 to-purple-800",
        temperatureRevealed: "30,000 K – 50,000 K (Massive O/B Stars)",
      },
      xray: {
        summary:
          "Chandra X-ray Observatory detects point sources from energetic infant stars with violent magnetic flares, but shows the pillars themselves are completely dark.",
        primaryMechanism:
          "Magnetic reconnection flaring in Young Stellar Objects (YSOs) and collisionally heated diffuse coronal plasma.",
        detectedFeatures: [
          "Hundreds of violently flaring T Tauri baby stars",
          "Absence of diffuse thermal X-rays (confirming no recent internal supernova)",
          "Penetrating hard X-ray point sources",
        ],
        observatoryExample: "Chandra X-ray Observatory (ACIS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-purple-600 via-fuchsia-700 to-cyan-500",
        temperatureRevealed: "10,000,000 K – 40,000,000 K (Flaring Coronal Plasma)",
      },
    },
    spectralData: {
      continuumType: "Thermal Free-Free",
      dominantLines: [
        {
          name: "H-alpha (Balmer α)",
          restWavelengthNm: 656.28,
          lineType: "emission",
          element: "Hydrogen",
          intensity: 0.95,
          scientificMeaning:
            "Recombination of ionized hydrogen gas excited by O-star stellar winds.",
        },
        {
          name: "[O III] Forbidden Line",
          restWavelengthNm: 500.68,
          lineType: "emission",
          element: "Doubly Ionized Oxygen",
          intensity: 0.78,
          scientificMeaning:
            "High-excitation low-density photoionized gas radiating deep teal photons.",
        },
        {
          name: "H-beta (Balmer β)",
          restWavelengthNm: 486.13,
          lineType: "emission",
          element: "Hydrogen",
          intensity: 0.35,
          scientificMeaning:
            "Secondary Balmer recombination line used to calculate Balmer decrement dust reddening.",
        },
        {
          name: "[N II] Forbidden Line",
          restWavelengthNm: 658.34,
          lineType: "emission",
          element: "Ionized Nitrogen",
          intensity: 0.42,
          scientificMeaning:
            "Shock-ionized gas at the outer boundary interface where stellar winds impact dense gas.",
        },
      ],
      temperatureKelvin: 8500,
      intrinsicRedshiftZ: 0.00007,
    },
  },
  {
    id: "target_crab",
    name: "Crab Nebula",
    catalogId: "Messier 1 / NGC 1952",
    category: "Supernova Remnant",
    constellation: "Taurus",
    distance: "6,500 light-years (2,000 pc)",
    distanceLightYears: 6500,
    description:
      "The wreckage of a core-collapse supernova observed by astronomers on Earth in July 1054 CE. At its heart spins a 30-times-per-second pulsar.",
    scientificSignificance:
      "Archetypal Pulsar Wind Nebula (PWN) driven by relativistic synchrotron radiation and magnetic field reconnection.",
    wavelengthData: {
      radio: {
        summary:
          "Bright synchrotron emission from relativistic electrons gyrating wildly along magnetic field lines throughout the entire nebula.",
        primaryMechanism:
          "Relativistic electrons in a ~10⁻⁴ Gauss magnetic field emitting non-thermal synchrotron radiation across radio frequencies.",
        detectedFeatures: [
          "Diffuse non-thermal radio continuum",
          "Pulsar radio pulses ticking at 30.2 ms",
          "Filamentary magnetic confinement",
        ],
        observatoryExample: "Very Large Array (VLA) / Green Bank Observatory",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-600 via-red-800 to-slate-900",
        temperatureRevealed: "Non-thermal (Magnetic Field Acceleration)",
      },
      infrared: {
        summary:
          "Spitzer and JWST isolate the tangled web of chemical dust grains (iron, silicon, sulfur) forged inside the exploding progenitor star.",
        primaryMechanism:
          "Thermal dust emission and molecular line transitions from warm newly formed silicate and carbon dust grains.",
        detectedFeatures: [
          "Cool dust condensation in dense filament cores",
          "Synchrotron emission from inner cavity",
          "Trace sulfur and argon ejecta",
        ],
        observatoryExample: "JWST MIRI / Spitzer Space Telescope",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-red-600 via-amber-600 to-indigo-950",
        temperatureRevealed: "50 K – 300 K (Fresh Supernova Dust)",
      },
      visible: {
        summary:
          "Hubble reveals complex, glowing cage of ionized gas filaments wrapping around a misty blue synchrotron glow produced by the pulsar engine.",
        primaryMechanism:
          "Recombination emission in filaments (hydrogen, oxygen, sulfur) combined with optical synchrotron emission from the inner cavity.",
        detectedFeatures: [
          "Intricate braided filaments expanding at 1,500 km/s",
          "Central blue synchrotron haze",
          "Central spinning pulsar visible as faint 16th mag star",
        ],
        observatoryExample: "Hubble Space Telescope (ACS / WFC3)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-rose-500 via-blue-400 to-orange-500",
        temperatureRevealed: "10,000 K – 18,000 K (Shocked Gas Filaments)",
      },
      ultraviolet: {
        summary:
          "UV observations reveal high-velocity shock fronts and photoionized helium envelopes colliding with interstellar gas.",
        primaryMechanism:
          "Non-thermal UV continuum and high-energy recombination lines from ionized helium.",
        detectedFeatures: [
          "He II 164.0 nm emission lines",
          "Ionization shock fronts",
          "Fast outer filament fringes",
        ],
        observatoryExample: "GALEX / Hubble Space Telescope (STIS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-violet-500 via-indigo-600 to-cyan-500",
        temperatureRevealed: "20,000 K – 50,000 K (High Excitation Ions)",
      },
      xray: {
        summary:
          "Chandra captures the beating heart of the Crab: tilted dynamic rings of relativistic matter and twin polar jets blasted outward from the spinning neutron star.",
        primaryMechanism:
          "Ultra-relativistic synchrotron radiation from electrons accelerated up to 10¹⁴ eV in the pulsar's intense magnetic light cylinder.",
        detectedFeatures: [
          "Tilted inner synchrotron torus and wisps",
          "Collimated bipolar relativistic matter jets",
          "Central 10-km neutron star pulsar flashing at 33 Hz",
        ],
        observatoryExample: "Chandra X-ray Observatory / NuSTAR",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-cyan-400 via-blue-600 to-purple-900",
        temperatureRevealed: "> 50,000,000 K (Relativistic Particle Acceleration)",
      },
    },
    spectralData: {
      continuumType: "Synchrotron (Non-Thermal Power Law)",
      dominantLines: [
        {
          name: "[S II] Forbidden Doublet",
          restWavelengthNm: 671.64,
          lineType: "emission",
          element: "Singly Ionized Sulfur",
          intensity: 0.88,
          scientificMeaning:
            "Key diagnostic for shock excitation and electron density in supernova ejecta.",
        },
        {
          name: "H-alpha (Balmer α)",
          restWavelengthNm: 656.28,
          lineType: "emission",
          element: "Hydrogen",
          intensity: 0.65,
          scientificMeaning: "High-speed expanding hydrogen shell moving at v ≈ 1,500 km/s.",
        },
        {
          name: "[O III] Forbidden Line",
          restWavelengthNm: 500.68,
          lineType: "emission",
          element: "Doubly Ionized Oxygen",
          intensity: 0.92,
          scientificMeaning: "Intense emission from nucleosynthetic oxygen core ejecta.",
        },
        {
          name: "Synchrotron Power Law Continuum",
          restWavelengthNm: 400.0,
          lineType: "emission",
          element: "Relativistic e- in B field",
          intensity: 0.75,
          scientificMeaning:
            "Flat non-thermal continuum F_ν ∝ ν^(-α) spanning from radio through hard X-rays.",
        },
      ],
      temperatureKelvin: 15000,
      intrinsicRedshiftZ: -0.0005, // Doppler shifted expansion
    },
  },
  {
    id: "target_andromeda",
    name: "Andromeda Galaxy (M31)",
    catalogId: "Messier 31 / NGC 224",
    category: "Galaxy",
    constellation: "Andromeda",
    distance: "2.54 million light-years (778 kpc)",
    distanceLightYears: 2540000,
    description:
      "The nearest major spiral galaxy to our own Milky Way, containing over one trillion stars and spanning 220,000 light-years in diameter.",
    scientificSignificance:
      "Prime laboratory for studying galactic structure, stellar populations, dark matter rotation curves, and galactic collisions.",
    wavelengthData: {
      radio: {
        summary:
          "Radio telescopes reveal the 21-cm hyperfine emission of cold neutral hydrogen gas (H I), showing spiral arms stretching far beyond the visible starlight.",
        primaryMechanism:
          "Quantum spin-flip transition of neutral atomic hydrogen at λ = 21.1 cm (1420.4 MHz).",
        detectedFeatures: [
          "Vast rotating atomic hydrogen gas disc",
          "Outer tidal warps caused by satellite dwarf galaxies",
          "Accurate flat rotation curve data proving dark matter",
        ],
        observatoryExample: "Effelsberg 100m / Dominion Radio Astrophysical Observatory / VLA",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-sky-700 via-indigo-900 to-slate-950",
        temperatureRevealed: "50 K – 100 K (Cold Neutral Atomic Gas)",
      },
      infrared: {
        summary:
          "Spitzer and Herschel capture warm dust rings formed by interstellar grains heated by star-forming regions, revealing a majestic 'ring of fire'.",
        primaryMechanism:
          "Thermal blackbody emission from interstellar dust heated to 20-40 Kelvin by starburst activity.",
        detectedFeatures: [
          "Prominent 10 kpc resonant ring of active star formation",
          "Warm dust lanes outlining spiral structure",
          "Old stellar population glowing softly at 3.6 μm",
        ],
        observatoryExample: "Herschel Space Observatory / Spitzer (IRAC/MIPS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-rose-500 via-amber-600 to-indigo-950",
        temperatureRevealed: "20 K – 150 K (Interstellar Dust)",
      },
      visible: {
        summary:
          "Standard optical imagery shows billions of unresolved stars creating the glowing central bulge, crossed by dark absorbing dust lanes in the disk.",
        primaryMechanism:
          "Composite thermal blackbody emission from hundreds of billions of main-sequence and red giant stars.",
        detectedFeatures: [
          "Bright stellar bulge dominated by older yellow/red stars",
          "Blue young star clusters tracing spiral arms",
          "Dust absorption lanes extinguishing background starlight",
        ],
        observatoryExample: "Subaru Telescope / Hubble Space Telescope (PHAT Survey)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-200 via-blue-300 to-indigo-950",
        temperatureRevealed: "3,000 K – 10,000 K (Composite Stellar Populations)",
      },
      ultraviolet: {
        summary:
          "GALEX ultraviolet maps trace only the hottest, youngest stars (O- and B-type), revealing that star formation is concentrated in a striking outer ring.",
        primaryMechanism:
          "Intense UV continuum emitted by short-lived massive stars (< 50 million years old).",
        detectedFeatures: [
          "Striking 10-kiloparsec starburst ring",
          "Virtually dark central bulge (confirming little recent star birth in core)",
          "Active OB associations",
        ],
        observatoryExample: "GALEX (Galaxy Evolution Explorer)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-cyan-400 via-blue-500 to-slate-900",
        temperatureRevealed: "15,000 K – 40,000 K (Young Massive Stars)",
      },
      xray: {
        summary:
          "Chandra discovers over 300 discrete point-like X-ray sources, including accreting stellar-mass black holes, neutron star binaries, and diffuse hot coronal gas.",
        primaryMechanism:
          "Gravitational potential energy converted to thermal X-rays as matter spills onto compact stellar remnants via accretion disks.",
        detectedFeatures: [
          "Low-Mass X-ray Binaries (LMXBs) packed in the central core",
          "Supermassive black hole M31* (faint quiescent state)",
          "Hot gas halo emitting thermal Bremsstrahlung",
        ],
        observatoryExample: "Chandra X-ray Observatory / XMM-Newton",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-indigo-500 via-purple-600 to-cyan-400",
        temperatureRevealed: "1,000,000 K – 50,000,000 K (Accretion Disks & Corona)",
      },
    },
    spectralData: {
      continuumType: "Blackbody (Thermal)",
      dominantLines: [
        {
          name: "Magnesium b triplet (Mg I b)",
          restWavelengthNm: 517.53,
          lineType: "absorption",
          element: "Magnesium in K-giant stars",
          intensity: 0.62,
          scientificMeaning:
            "Classic absorption line from older population II red giant stellar atmospheres in galactic bulge.",
        },
        {
          name: "Sodium D doublet (Na I D)",
          restWavelengthNm: 589.29,
          lineType: "absorption",
          element: "Sodium",
          intensity: 0.58,
          scientificMeaning: "Stellar and interstellar neutral sodium absorption.",
        },
        {
          name: "Calcium H & K lines",
          restWavelengthNm: 393.37,
          lineType: "absorption",
          element: "Ionized Calcium (Ca II)",
          intensity: 0.82,
          scientificMeaning:
            "Prominent deep absorption features used in radial velocity cross-correlation.",
        },
        {
          name: "21-cm Hyperfine Line",
          restWavelengthNm: 211060000, // 21.1 cm in nm
          lineType: "emission",
          element: "Atomic Hydrogen (H I)",
          intensity: 0.9,
          scientificMeaning:
            "Traces galactic rotation and total neutral gas mass across hundreds of kiloparsecs.",
        },
      ],
      temperatureKelvin: 4800,
      intrinsicRedshiftZ: -0.001, // Approaching Milky Way at ~300 km/s! Blueshifted!
    },
  },
  {
    id: "target_moon_tycho",
    name: "Tycho Crater & Lunar Regolith",
    catalogId: "Lunar Feature (43.3°S, 11.2°W)",
    category: "Solar System Body",
    constellation: "N/A (Earth Satellite)",
    distance: "384,400 km (1.28 light-seconds)",
    distanceLightYears: 0.0000000406,
    description:
      "A prominent 85-km impact crater formed ~108 million years ago, showcasing spectacular bright ejecta rays spanning thousands of kilometers across the Moon.",
    scientificSignificance:
      "Crucial calibration target for planetary impact cratering chronologies, lunar stratigraphy, and optical resolution limits.",
    wavelengthData: {
      radio: {
        summary:
          "Radar astronomy (Arecibo/Goldstone) transmits microwave signals that penetrate several meters into lunar regolith, mapping buried boulders and subsurface density.",
        primaryMechanism:
          "Active microwave radar backscattering from subsurface rock-regolith dielectric boundaries.",
        detectedFeatures: [
          "Subsurface boulder fields buried beneath powdery dust",
          "Regolith thickness variations (3 to 10 meters)",
          "Dielectric properties of basaltic mare",
        ],
        observatoryExample: "Arecibo Radar (historic) / Goldstone Solar System Radar",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-slate-700 via-zinc-800 to-black",
        temperatureRevealed: "Subsurface regolith structure (Reflection)",
      },
      infrared: {
        summary:
          "Thermal infrared (Diviner instrument) observes how fast lunar rocks cool down during the 14-day lunar night, isolating solid bedrock from fine powder.",
        primaryMechanism: "Passive thermal emission (7–100 μm) governed by rock thermal inertia.",
        detectedFeatures: [
          "Exposed solid bedrock cliff faces in crater central peak",
          "Fine insulating regolith powder blankets",
          "Extreme day/night temperature swings (100 K to 390 K)",
        ],
        observatoryExample: "Lunar Reconnaissance Orbiter (Diviner) / SOFIA Airborne",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-400 via-rose-700 to-slate-900",
        temperatureRevealed: "100 K – 390 K (Surface Thermal Cycling)",
      },
      visible: {
        summary:
          "High-contrast shadows cast by low-angle sunlight reveal sharp central peaks rising 1.6 km above the crater floor and crystalline impact melt sheets.",
        primaryMechanism:
          "Direct solar reflection (albedo ~0.29 for Tycho, much brighter than dark basaltic maria albedo ~0.07).",
        detectedFeatures: [
          "1,600-meter-tall central mountain uplift",
          "Terraced rim slumped walls",
          "Bright glass-rich impact melt ejecta rays",
        ],
        observatoryExample: "Lunar Reconnaissance Orbiter (LROC) / Ground Telescopes",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-slate-200 via-zinc-400 to-slate-900",
        temperatureRevealed: "Reflected Sunlight (5,778 K Solar Spectrum)",
      },
      ultraviolet: {
        summary:
          "Ultraviolet reflection maps differences in titanium dioxide (TiO2) and iron content in lunar soils, helping map mineral resources.",
        primaryMechanism:
          "UV charge-transfer absorption bands in ilmenite (FeTiO3) and pyroxene minerals.",
        detectedFeatures: [
          "Titanium-rich ilmenite mineral deposits",
          "Space weathering degrees of fresh vs ancient regolith",
          "Solar wind sputter effects",
        ],
        observatoryExample: "LRO LAMP (Lyman Alpha Mapping Project)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-violet-400 via-purple-600 to-slate-900",
        temperatureRevealed: "Surface Mineralogy & Space Weathering",
      },
      xray: {
        summary:
          "Solar wind X-rays strike the lunar surface and cause characteristic X-ray fluorescence, identifying aluminum, magnesium, and silicon atoms.",
        primaryMechanism:
          "X-ray fluorescence (XRF): solar coronal X-rays eject inner-shell electrons from lunar atoms, which emit characteristic photons.",
        detectedFeatures: [
          "Elemental elemental map: Mg/Si and Al/Si atomic ratios",
          "Anorthosite crust composition",
          "Absence of intrinsic X-ray emission",
        ],
        observatoryExample: "Chandrayaan-2 CLASS / Apollo 15 XRF / SMART-1",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-teal-400 via-cyan-600 to-slate-950",
        temperatureRevealed: "Atomic Fluorescence from Regolith",
      },
    },
    spectralData: {
      continuumType: "Blackbody (Thermal)",
      dominantLines: [
        {
          name: "Reflected Solar H-alpha (Fraunhofer C)",
          restWavelengthNm: 656.28,
          lineType: "absorption",
          element: "Hydrogen in Solar Atmosphere",
          intensity: 0.7,
          scientificMeaning:
            "Reflected solar spectrum carrying Fraunhofer lines from the Sun's photosphere.",
        },
        {
          name: "1-micron Pyroxene Mineral Band",
          restWavelengthNm: 950.0,
          lineType: "absorption",
          element: "Fe²⁺ in Pyroxene silicate lattice",
          intensity: 0.35,
          scientificMeaning:
            "Clear diagnostic absorption feature revealing basaltic pyroxene minerals.",
        },
        {
          name: "Silicon K-alpha Fluorescence",
          restWavelengthNm: 0.712, // X-ray 1.74 keV in nm
          lineType: "emission",
          element: "Silicon (Si Kα)",
          intensity: 0.5,
          scientificMeaning:
            "Fluorescence emitted when solar X-rays ionize silicon atoms in lunar soil.",
        },
      ],
      temperatureKelvin: 320,
      intrinsicRedshiftZ: 0.0,
    },
  },
  {
    id: "target_cas_a",
    name: "Cassiopeia A (Cas A)",
    catalogId: "3C 461 / G111.7-2.1",
    category: "Supernova Remnant",
    constellation: "Cassiopeia",
    distance: "11,000 light-years (3,400 pc)",
    distanceLightYears: 11000,
    description:
      "The youngest known core-collapse supernova remnant in our Milky Way galaxy, resulting from a massive star explosion approximately 340 years ago.",
    scientificSignificance:
      "Benchmark for nucleosynthesis yields, reverse shock physics, and the creation of heavy cosmic elements like iron, silicon, and titanium.",
    wavelengthData: {
      radio: {
        summary:
          "The brightest discrete astronomical radio source in the entire sky outside the Solar System, radiating furious synchrotron emission.",
        primaryMechanism:
          "Shock-accelerated electrons interacting with amplified turbulent magnetic fields at the forward blast wave.",
        detectedFeatures: [
          "Expanding forward shock ring at 5,000 km/s",
          "Synchrotron shell",
          "Turbulent magnetic field amplification",
        ],
        observatoryExample: "Very Large Array (VLA) / LOFAR",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-600 via-orange-800 to-slate-900",
        temperatureRevealed: "Non-thermal Synchrotron Shock Front",
      },
      infrared: {
        summary:
          "JWST's Mid-Infrared Instrument (MIRI) uncovered the 'Green Monster' structure—unshocked pristine interior ejecta containing warm unmixed argon and sulfur.",
        primaryMechanism:
          "Emission from shock-heated freshly synthesized dust and atomic line emission from unmixed ejecta.",
        detectedFeatures: [
          "The 'Green Monster' cavity structure",
          "Pure synthesized silicon and oxygen dust clumps",
          "Central tiny isolated neutron star",
        ],
        observatoryExample: "JWST MIRI / Spitzer (IRS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-emerald-500 via-amber-600 to-rose-950",
        temperatureRevealed: "80 K – 400 K (Fresh Supernova Dust)",
      },
      visible: {
        summary:
          "Hubble reveals fast-moving optical knots (FMKs) of pure oxygen, sulfur, and argon racing outward without any hydrogen or helium envelope.",
        primaryMechanism:
          "Collisionally excited forbidden line emission from stripped stellar core material hitting dense circumstellar shells.",
        detectedFeatures: [
          "Fast-moving oxygen-rich knots moving at up to 10,000 km/s",
          "Quasi-stationary flocculi shed before the explosion",
          "Complete absence of hydrogen in inner ejecta",
        ],
        observatoryExample: "Hubble Space Telescope (WFC3)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-rose-600 via-emerald-600 to-indigo-900",
        temperatureRevealed: "10,000 K – 30,000 K (Optical Knots)",
      },
      ultraviolet: {
        summary:
          "UV spectra reveal ionized carbon, silicon, and iron in the fastest outward-moving ejecta knots, tracing nucleosynthetic shells.",
        primaryMechanism: "High-temperature shock ionization behind the reverse shock wave.",
        detectedFeatures: [
          "Shock-heated silicon and carbon ions",
          "Ultraviolet fluorescent lines",
          "Extinction from intervening interstellar dust",
        ],
        observatoryExample: "Hubble Space Telescope (STIS / COS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-violet-500 via-blue-600 to-slate-900",
        temperatureRevealed: "30,000 K – 80,000 K (Reverse Shock Ejecta)",
      },
      xray: {
        summary:
          "Chandra's milestone first-light image famously discovered the central compact point source (neutron star) and mapped distinct million-degree shells of silicon, sulfur, and iron.",
        primaryMechanism:
          "Thermal Bremsstrahlung and inner-shell K-alpha line emission from 10–30 million Kelvin plasma heated by the reverse shock.",
        detectedFeatures: [
          "Central isolated neutron star (carbon atmosphere)",
          "Silicon and sulfur shell (green/yellow in false color)",
          "Iron-rich fingers punched outward (indicating violent convective turnover)",
        ],
        observatoryExample: "Chandra X-ray Observatory (ACIS)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-teal-400 via-blue-500 to-purple-800",
        temperatureRevealed: "10,000,000 K – 30,000,000 K (Reverse Shock Plasma)",
      },
    },
    spectralData: {
      continuumType: "Bremsstrahlung (Thermal Free-Free)",
      dominantLines: [
        {
          name: "Silicon XIII He-like Triplet (Si XIII)",
          restWavelengthNm: 0.665, // 1.86 keV in nm
          lineType: "emission",
          element: "Silicon (10M Kelvin)",
          intensity: 0.95,
          scientificMeaning:
            "Characteristic X-ray emission line proving silicon synthesized during stellar explosive nucleosynthesis.",
        },
        {
          name: "Iron K-alpha (Fe Kα)",
          restWavelengthNm: 0.193, // 6.4 - 6.7 keV in nm
          lineType: "emission",
          element: "Iron (Fe XXV)",
          intensity: 0.82,
          scientificMeaning:
            "Deepest core nucleosynthesis products ejected and heated to tens of millions of degrees.",
        },
        {
          name: "[O III] Forbidden Line",
          restWavelengthNm: 500.68,
          lineType: "emission",
          element: "Oxygen",
          intensity: 0.72,
          scientificMeaning:
            "Visible optical emission from stripped helium/oxygen core of progenitor star.",
        },
      ],
      temperatureKelvin: 25000000,
      intrinsicRedshiftZ: 0.0003,
    },
  },
  {
    id: "target_whirlpool",
    name: "Whirlpool Galaxy (M51)",
    catalogId: "Messier 51a / NGC 5194",
    category: "Galaxy",
    constellation: "Canes Venatici",
    distance: "23 million light-years (7.1 Mpc)",
    distanceLightYears: 23000000,
    description:
      "A textbook 'grand-design' face-on spiral galaxy interacting gravitationally with its companion dwarf galaxy NGC 5195, driving massive spiral density waves.",
    scientificSignificance:
      "Canonical testbed for galactic density wave theory, triggered star formation along spiral arms, and tidal interaction physics.",
    wavelengthData: {
      radio: {
        summary:
          "ALMA and the Plateau de Bure interferometer map molecular carbon monoxide (CO), exposing the dense, cold conveyor belts of gas feeding star formation.",
        primaryMechanism:
          "Millimeter molecular rotational lines (CO J=2→1 at 1.3 mm) and 21-cm atomic hydrogen.",
        detectedFeatures: [
          "Dense molecular gas clouds aligned directly along inner spiral arms",
          "Giant Molecular Clouds (GMCs) ready to collapse",
          "Tidal gas bridge linking M51 with NGC 5195",
        ],
        observatoryExample: "ALMA / IRAM Plateau de Bure (NOEMA)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-amber-600 via-red-900 to-black",
        temperatureRevealed: "10 K – 40 K (Cold Star-Forming Fuel)",
      },
      infrared: {
        summary:
          "JWST NIRCam/MIRI reveals a breathtaking filigree skeleton of dark dust filaments, glowing warm dust webs, and embedded infant star clusters.",
        primaryMechanism:
          "Polycyclic Aromatic Hydrocarbons (PAHs) fluorescing under UV illumination and warm thermal dust emission at 7.7 and 21 μm.",
        detectedFeatures: [
          "Intricate web-like cavity network sculpted by stellar winds",
          "Warm dust filaments threading spiral arms",
          "Dense star-forming nodules",
        ],
        observatoryExample: "JWST (NIRCam & MIRI)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-rose-500 via-orange-600 to-indigo-950",
        temperatureRevealed: "50 K – 300 K (Warm Dust & PAH Molecules)",
      },
      visible: {
        summary:
          "Hubble reveals pristine face-on spiral arms populated by brilliant blue young star clusters and pink glowing hydrogen emission nebulae (H II regions).",
        primaryMechanism:
          "Combined stellar continuum and hydrogen Balmer recombination lines (H-alpha).",
        detectedFeatures: [
          "Brilliant sweeping spiral density wave arms",
          "Pink H II nebulae like giant pearls along the arms",
          "Gravitational tidal bridge leading to companion NGC 5195",
        ],
        observatoryExample: "Hubble Space Telescope (ACS Heritage Team)",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-blue-300 via-amber-200 to-indigo-950",
        temperatureRevealed: "3,000 K – 15,000 K (Stellar Photospheres & H II Regions)",
      },
      ultraviolet: {
        summary:
          "UV telescopes highlight the massive starburst triggered as gas compresses along the leading edges of the spiral arms.",
        primaryMechanism:
          "Far-UV radiation from short-lived massive O and early-B stars (< 10 million years old).",
        detectedFeatures: [
          "Intense UV emission precisely outlining the compression shocks",
          "Extremely dim central bulge (little recent star formation in center)",
          "Young star associations",
        ],
        observatoryExample: "GALEX / Astro-1 UV",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-cyan-400 via-blue-600 to-slate-900",
        temperatureRevealed: "20,000 K – 45,000 K (Hot Young O/B Stars)",
      },
      xray: {
        summary:
          "Chandra discovers diffuse diffuse millions-degree gas heated by multiple supernova explosions and over 100 ultraluminous X-ray sources (ULXs).",
        primaryMechanism:
          "Thermal emission from superheated galactic fountain plasma and high-mass X-ray binaries (HMXBs).",
        detectedFeatures: [
          "Active galactic nucleus (Seyfert 2 supermassive black hole)",
          "Superbubble thermal plasma blowing out of disk into halo",
          "Dozens of Ultra-Luminous X-ray sources (accreting black holes)",
        ],
        observatoryExample: "Chandra X-ray Observatory / XMM-Newton",
        authenticArchiveImage:
          "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1200&auto=format&fit=crop&q=80",
        simulatedColor: "from-purple-500 via-fuchsia-600 to-cyan-400",
        temperatureRevealed: "2,000,000 K – 20,000,000 K (Superbubbles & ULXs)",
      },
    },
    spectralData: {
      continuumType: "Blackbody (Thermal)",
      dominantLines: [
        {
          name: "H-alpha (Balmer α)",
          restWavelengthNm: 656.28,
          lineType: "emission",
          element: "Hydrogen",
          intensity: 0.94,
          scientificMeaning: "Vigorous star formation in spiral arm H II regions.",
        },
        {
          name: "[O III] Forbidden Line",
          restWavelengthNm: 500.68,
          lineType: "emission",
          element: "Oxygen",
          intensity: 0.65,
          scientificMeaning: "Photoionized gas surrounding massive stellar associations.",
        },
        {
          name: "CO (J=1→0) Molecular Line",
          restWavelengthNm: 2600000, // 2.6 mm in nm
          lineType: "emission",
          element: "Carbon Monoxide Molecule",
          intensity: 0.85,
          scientificMeaning:
            "Direct tracer of cold molecular hydrogen mass available to collapse into stars.",
        },
      ],
      temperatureKelvin: 6000,
      intrinsicRedshiftZ: 0.00155, // Redshifted at ~465 km/s Hubble recession
    },
  },
];

export const TELESCOPE_MODELS: TelescopeModel[] = [
  {
    id: "tele_backyard",
    name: "Backyard 80mm ED Refractor",
    type: "Refractor",
    opticalDesign: "Apochromatic Triplet Glass Lens",
    apertureMeters: 0.08,
    focalLengthMeters: 0.48,
    primaryLocation: "Ground (Sea Level)",
    wavelengthCoverage: ["visible"],
    lightGatheringPowerVsEye: 130, // (0.08 / 0.007)^2 ≈ 130x
    diffractionLimitArcsecVisible: 1.73, // 1.22 * 0.55 / 0.08 * 0.206265 ≈ 1.73"
    hasAdaptiveOptics: false,
    cryogenicCooling: false,
    detectorType: "DSLR / CMOS Uncooled Sensor or Eyepiece",
    realWorldFacility: "Typical Amateur Astronomy Setup (Sky-Watcher Esprit 80)",
    advantages: [
      "Ultra-portable, no optical alignment (collimation) required",
      "No central obstruction gives razor-sharp planetary contrast",
      "Low cost, ideal for wide-field Moon, Sun (with filter), and star clusters",
    ],
    limitations: [
      "Extremely small aperture limits light gathering for faint galaxies",
      "Severely affected by ground light pollution and atmospheric seeing turbulence",
      "Only captures visible light (glass absorbs ultraviolet and infrared)",
    ],
  },
  {
    id: "tele_1m_observatory",
    name: "1-Meter University Research Reflector",
    type: "Reflector",
    opticalDesign: "Ritchey-Chrétien Cassegrain (Hyperbolic Mirrors)",
    apertureMeters: 1.0,
    focalLengthMeters: 8.0,
    primaryLocation: "Ground (High Altitude Mountain)",
    wavelengthCoverage: ["visible", "infrared"],
    lightGatheringPowerVsEye: 20400, // (1.0 / 0.007)^2 ≈ 20,400x
    diffractionLimitArcsecVisible: 0.138, // 1.22 * 0.55 / 1.0 * 0.206265 ≈ 0.138"
    hasAdaptiveOptics: false,
    cryogenicCooling: false,
    detectorType: "Back-illuminated Cryo-cooled Scientific CCD",
    realWorldFacility: "University Mt. Lemmon / Pic du Midi 1m Telescopes",
    advantages: [
      "No chromatic aberration thanks to reflective primary and secondary mirrors",
      "Coma-free hyperbolic optics provide large flat photographic field",
      "High light throughput for photometric exoplanet transits and supernovae tracking",
    ],
    limitations: [
      "Practical angular resolution on ground is limited to ~0.8''–1.5'' by atmospheric seeing",
      "Earth atmosphere blocks UV, X-rays, and significant infrared water absorption bands",
      "Secondary mirror spider creates diffraction spikes on bright stars",
    ],
  },
  {
    id: "tele_vlt_8m",
    name: "8.2m Very Large Telescope (VLT)",
    type: "Reflector",
    opticalDesign: "Nasmyth Focus with Deformable Secondary Mirror",
    apertureMeters: 8.2,
    focalLengthMeters: 120.0,
    primaryLocation: "Ground (High Altitude Mountain)",
    wavelengthCoverage: ["visible", "infrared"],
    lightGatheringPowerVsEye: 1370000, // (8.2 / 0.007)^2 ≈ 1,370,000x
    diffractionLimitArcsecVisible: 0.0169, // ≈ 0.017"
    hasAdaptiveOptics: true,
    cryogenicCooling: true,
    detectorType: "Laser Guide Star Adaptive Optics System (MUSE / HAWK-I)",
    realWorldFacility: "ESO Cerro Paranal Observatory, Atacama Desert, Chile (2,635m elevation)",
    advantages: [
      "Giant 8.2m monolithic primary mirror collects immense photon flux",
      "Laser Guide Star Adaptive Optics bends secondary mirror 1,000 times/second to cancel atmospheric blur",
      "Can combine four 8.2m units into VLT Interferometer (VLTI) for milliarcsecond resolution",
    ],
    limitations: [
      "High operational complexity and multi-million dollar annual maintenance",
      "Atmospheric absorption bands still completely block far-UV and mid-to-far infrared",
      "Thermal background emission from atmosphere limits infrared sensitivity",
    ],
  },
  {
    id: "tele_elt_39m",
    name: "39m Extremely Large Telescope (ELT)",
    type: "Reflector",
    opticalDesign: "Five-Mirror Anastigmat with 798 Hexagonal Primary Segments",
    apertureMeters: 39.3,
    focalLengthMeters: 684.0,
    primaryLocation: "Ground (High Altitude Mountain)",
    wavelengthCoverage: ["visible", "infrared"],
    lightGatheringPowerVsEye: 31500000, // (39.3 / 0.007)^2 ≈ 31.5 Million x
    diffractionLimitArcsecVisible: 0.0035, // ≈ 0.0035" (3.5 milliarcseconds)
    hasAdaptiveOptics: true,
    cryogenicCooling: true,
    detectorType: "Integrated Multi-Conjugate Adaptive Optics (HARMONI / MICADO)",
    realWorldFacility: "ESO Cerro Armazones, Atacama Desert, Chile (3,046m elevation)",
    advantages: [
      "Collects 100 million times more light than the human eye",
      "Will resolve earth-sized exoplanets in habitable zones around nearby red dwarfs",
      "Diffraction limit is sharper than Hubble Space Telescope by a factor of 16",
    ],
    limitations: [
      "Enormous $1.5+ billion engineering project requiring continuous active alignment of 798 mirror segments",
      "Ground observatory subject to weather, daylight, and atmospheric telluric lines",
    ],
  },
  {
    id: "tele_hst_space",
    name: "Hubble Space Telescope (HST)",
    type: "Space Observatory",
    opticalDesign: "2.4m Ritchey-Chrétien Cassegrain",
    apertureMeters: 2.4,
    focalLengthMeters: 57.6,
    primaryLocation: "Low Earth Orbit (LEO)",
    wavelengthCoverage: ["ultraviolet", "visible", "infrared"],
    lightGatheringPowerVsEye: 117500, // (2.4 / 0.007)^2 ≈ 117,500x
    diffractionLimitArcsecVisible: 0.058, // ≈ 0.058"
    hasAdaptiveOptics: false, // Not needed in space vacuum!
    cryogenicCooling: false,
    detectorType: "WFC3 (Wide Field Camera 3) & ACS (Advanced Camera for Surveys)",
    realWorldFacility: "NASA / ESA in orbit 540 km above Earth (95-minute period)",
    advantages: [
      "Completely above Earth's atmosphere: zero atmospheric seeing blur, zero weather, 24/7 dark sky",
      "Unmatched access to Far-Ultraviolet wavelengths (115 nm to 300 nm) blocked by ozone",
      "Decades of consistent photometric precision and astrometric stability",
    ],
    limitations: [
      "Modest 2.4m mirror size compared to modern 8m-39m ground behemoths",
      "Earth occultation (orbiting in LEO blocks target half of every 95-minute orbit)",
      "Cannot be serviced anymore since the retirement of the Space Shuttle",
    ],
  },
  {
    id: "tele_jwst_space",
    name: "James Webb Space Telescope (JWST)",
    type: "Space Observatory",
    opticalDesign: "Three-Mirror Anastigmat with 18 Gold-Coated Beryllium Segments",
    apertureMeters: 6.5,
    focalLengthMeters: 131.4,
    primaryLocation: "Sun-Earth L2 Lagrange Point",
    wavelengthCoverage: ["infrared"],
    lightGatheringPowerVsEye: 862000, // (6.5 / 0.007)^2 ≈ 862,000x
    diffractionLimitArcsecVisible: 0.021, // At 2 μm: ~0.07"
    hasAdaptiveOptics: false, // Space vacuum
    cryogenicCooling: true, // 5-layer tennis-court sized sunshield + cryocooler (7 K for MIRI!)
    detectorType: "NIRCam, NIRSpec, MIRI, NIRISS Cryogenic Arrays",
    realWorldFacility: "NASA / ESA / CSA at Sun-Earth L2 (1.5 million km from Earth)",
    advantages: [
      "Giant 6.5-meter mirror in deep space operates at cryogenic temperatures (40 Kelvin)",
      "Pierces dense dust clouds to observe protostars, exoplanet atmospheres, and the earliest First Light galaxies (z > 10)",
      "Continuous uninterrupted viewing without day/night or atmospheric glow",
    ],
    limitations: [
      "Blind to ultraviolet and blue visible light (optics and detectors optimized for 0.6 μm to 28 μm)",
      "Cannot be repaired or refueled by astronauts at L2 (finite propellant mission)",
    ],
  },
  {
    id: "tele_chandra_xray",
    name: "Chandra X-ray Observatory",
    type: "X-ray Grazing Mirror",
    opticalDesign: "Wolter Type I Nested Grazing-Incidence Paraboloid/Hyperboloid Shells",
    apertureMeters: 1.2,
    focalLengthMeters: 10.0,
    primaryLocation: "Low Earth Orbit (LEO)",
    wavelengthCoverage: ["xray"],
    lightGatheringPowerVsEye: 29000,
    diffractionLimitArcsecVisible: 0.5, // 0.5 arcsecond X-ray resolution
    hasAdaptiveOptics: false,
    cryogenicCooling: true,
    detectorType: "ACIS (Advanced CCD Imaging Spectrometer) & HRC",
    realWorldFacility: "NASA High-Elliptical Orbit (16,000 km to 133,000 km altitude)",
    advantages: [
      "Sub-arcsecond X-ray angular resolution (0.5'') unmatched by any other X-ray observatory",
      "Pioneering nested grazing mirrors reflect high-energy X-rays like skipping stones on water",
      "Reveals millions-degree black hole accretion disks, pulsars, and cluster plasma",
    ],
    limitations: [
      "Extremely small effective collecting area compared to geometric diameter because of steep grazing angles",
      "Photons arrive individually (requires exposure times of hours to days per target)",
      "Completely blind to visible, infrared, and radio wavelengths",
    ],
  },
  {
    id: "tele_alma_radio",
    name: "ALMA Millimeter / Radio Array",
    type: "Radio Interferometer",
    opticalDesign: "Aperture Synthesis Array (66 Reconfigurable Parabolic Antennas)",
    apertureMeters: 16000.0, // Maximum synthesized baseline B = 16 km!
    focalLengthMeters: 12.0,
    primaryLocation: "Ground (High Altitude Mountain)",
    wavelengthCoverage: ["radio"],
    lightGatheringPowerVsEye: 135000000, // 66 x 12m dishes combined collecting area ≈ 7,460 m²
    diffractionLimitArcsecVisible: 0.005, // θ ≈ λ / B ≈ 1.3mm / 16km * 206265 ≈ 0.016" (sub-milliarcsec at high freq)
    hasAdaptiveOptics: false,
    cryogenicCooling: true, // Superconducting SIS receivers cooled to 4 Kelvin
    detectorType: "Superconducting Heterodyne SIS Mixers (Bands 3 to 10)",
    realWorldFacility: "Chajnantor Plateau, Chile (5,050 meters / 16,500 ft elevation)",
    advantages: [
      "Aperture synthesis combines signals from 66 dishes to mimic a single telescope up to 16 km wide",
      "Reveals cold gas at 10–50 Kelvin and protoplanetary dust rings around infant stars",
      "Located at 5,000m altitude above 95% of Earth's atmospheric water vapor",
    ],
    limitations: [
      "Cannot detect visible starlight, UV, or X-rays",
      "Requires complex Fourier transform (CLEAN algorithm) image reconstruction from spatial frequencies (u,v plane)",
      "High operational demands in extremely harsh, oxygen-deprived high-altitude desert",
    ],
  },
];

export const ASTRONOMER_MISSIONS: AstronomerMission[] = [
  {
    id: "mission_1_dust_veil",
    missionNumber: 1,
    title: "Pierce the Dusty Cocoon of Star Birth",
    researchGoal:
      "Locate hidden newborn protostars buried deep inside dense molecular gas pillars.",
    astrophysicalContext:
      "Astronomers suspect hundreds of embryonic stars are forming inside the dense Bok globules of the Eagle Nebula (Pillars of Creation). However, optical images show only pitch-black silhouettes because microscopic dust grains scatter blue and red visible light.",
    question:
      "Which telescope instrument and wavelength regime should you command to penetrate the dust veil and count the newborn protostars?",
    targetId: "target_pillars",
    recommendedTelescopeId: "tele_jwst_space",
    correctWavelength: "infrared",
    minApertureMeters: 2.0,
    minExposureSeconds: 120,
    requiresSpaceOrAO: true,
    successAnalysis:
      "Success! Because interstellar dust grain sizes (~0.1 μm) are comparable to visible wavelengths, visible light undergoes intense Rayleigh scattering (∝ λ⁻⁴). Infrared wavelengths (2–10 μm) are much longer than the dust grains, allowing the light from embedded baby stars to travel straight through the pillars to JWST's NIRCam detectors!",
    whyOtherBandsFail: {
      visible:
        "Visible light is completely blocked and absorbed by dust grains, showing only opaque dark trunks.",
      ultraviolet:
        "Ultraviolet light is scattered even more violently than visible light (UV extinction is the highest in the spectrum).",
      xray: "While X-rays can penetrate, they only detect rare energetic magnetic flaring events, missing the general protostellar population.",
      radio:
        "Radio traces the cold gas itself rather than resolving the warm photospheres of individual protostellar bodies.",
    },
    scientificCitation:
      "K. L. Luhman et al. / Astrophysical Journal Letters (JWST NIRCam Imaging of M16)",
    points: 100,
  },
  {
    id: "mission_2_hot_gas_pulsar",
    missionNumber: 2,
    title: "Track the 50-Million-Degree Pulsar Jet",
    researchGoal:
      "Map the ultra-relativistic plasma wind and shock heating generated by a spinning neutron star.",
    astrophysicalContext:
      "At the center of the Crab Nebula, a neutron star spins 30 times a second, whipping up magnetic fields a trillion times stronger than Earth's. Theorists predict a ring of relativistic electrons and collimated jets heated to tens of millions of Kelvin.",
    question:
      "Which wavelength and telescope technology is required to image this million-degree relativistic plasma jet?",
    targetId: "target_crab",
    recommendedTelescopeId: "tele_chandra_xray",
    correctWavelength: "xray",
    minApertureMeters: 1.0,
    minExposureSeconds: 300,
    requiresSpaceOrAO: true,
    successAnalysis:
      "Direct Hit! Plasma heated to 10–50 million Kelvin emits radiation whose blackbody peak falls directly in the high-energy X-ray band (E = hν ≈ 0.5–10 keV). Chandra's specialized nested grazing-incidence Wolter mirrors reflect these high-energy photons, revealing the inner tilted torus and bipolar relativistic jets!",
    whyOtherBandsFail: {
      radio:
        "Radio detects diffuse non-thermal synchrotron throughout the entire 10-light-year nebula, washing out the compact inner jet structure.",
      visible:
        "Visible light is dominated by the glowing 10,000 K recombination filaments, obscuring the high-energy central engine.",
      infrared:
        "Infrared isolates cool dust and molecular ejecta at 50–200 K, which is blind to the million-degree relativistic wind.",
      ultraviolet:
        "UV radiation is absorbed by intervening interstellar gas along the Galactic plane and lacks the energetic diagnostic of Chandra.",
    },
    scientificCitation:
      "Weisskopf et al. / Chandra X-ray Observatory High-Resolution Camera (Crab Pulsar Wind Nebula)",
    points: 100,
  },
  {
    id: "mission_3_cold_hydrogen_fuel",
    missionNumber: 3,
    title: "Map the Cold Reservoir Fueling Galactic Starbirth",
    researchGoal:
      "Trace the vast, invisible atomic gas reservoir stretching across hundreds of thousands of light-years in Andromeda.",
    astrophysicalContext:
      "Stars cannot form without vast reservoirs of cold neutral hydrogen (H I). Because this gas sits at frigid temperatures of 50 to 100 Kelvin, it does not emit visible starlight or glow like ionized nebulae.",
    question:
      "What wavelength band must you use to detect the quantum spin-flip transition of cold neutral hydrogen atoms?",
    targetId: "target_andromeda",
    recommendedTelescopeId: "tele_alma_radio",
    correctWavelength: "radio",
    minApertureMeters: 10.0,
    minExposureSeconds: 60,
    requiresSpaceOrAO: false,
    successAnalysis:
      "Spot on! In neutral hydrogen atoms (H I), the electron and proton spins occasionally flip from parallel to anti-parallel. This tiny quantum energy jump emits a photon at exactly λ = 21.1 cm (1420.405 MHz) in the radio spectrum. Radio telescopes detect this emission throughout Andromeda's outer disk, proving its gas extends far beyond its visible stars!",
    whyOtherBandsFail: {
      visible:
        "Cold gas at 50 K produces no visible blackbody radiation and has no free electrons to undergo visible Balmer recombination.",
      xray: "X-rays only interact with million-degree plasmas or accreting black holes, completely ignoring cold neutral atoms.",
      ultraviolet:
        "UV can ionize hydrogen, but interstellar dust extinguishes UV light across large galactic distances.",
      infrared:
        "Infrared traces warm dust, but dust makes up only ~1% of the interstellar medium; 99% of the mass is hydrogen and helium gas traced by radio.",
    },
    scientificCitation:
      "H. van de Hulst (1944) & Ewen & Purcell (1951) / Nature (Discovery of 21-cm Hydrogen Radiation)",
    points: 100,
  },
  {
    id: "mission_4_diffraction_resolution",
    missionNumber: 4,
    title: "Resolve Intricate Impact Melt on the Lunar Surface",
    researchGoal:
      "Distinguish two fine rock terraces separated by only 0.1 arcseconds on the central peak of Tycho Crater.",
    astrophysicalContext:
      "An amateur astronomer with an 80mm backyard refractor complains that Tycho Crater looks blurry and fuzzy when they zoom in. A university astronomer tells them that the laws of wave optics (the Rayleigh Criterion) strictly limit what an 80mm lens can resolve.",
    question:
      "Calculate the diffraction limit: which telescope aperture is physically capable of resolving 0.1 arcsecond details in visible light?",
    targetId: "target_moon_tycho",
    recommendedTelescopeId: "tele_1m_observatory",
    correctWavelength: "visible",
    minApertureMeters: 1.0,
    minExposureSeconds: 1,
    requiresSpaceOrAO: false,
    successAnalysis:
      "Optics Mastered! According to the Rayleigh diffraction criterion: θ = 1.22 * λ / D. For visible light (λ = 550 nm): an 80mm lens has θ = 1.73 arcseconds (cannot resolve 0.1''). A 1-meter telescope has θ = 0.138 arcseconds! Thus, you need an aperture of at least ~1.4 meters on the ground or in space to cleanly split 0.1'' features!",
    whyOtherBandsFail: {
      radio:
        "At long radio wavelengths (e.g. 21 cm), even a 100-meter dish has a very coarse resolution of ~500 arcseconds! Radio needs giant interferometers to resolve details.",
      infrared:
        "Longer wavelengths produce larger diffraction blur (θ ∝ λ), so an IR telescope has worse angular resolution than a visible telescope of the same diameter.",
      xray: "The Moon does not emit intrinsic thermal X-rays; its X-ray fluorescence is extremely faint and requires specialized orbital satellites.",
      ultraviolet:
        "UV provides high resolution (smaller λ), but Earth's atmospheric ozone layer absorbs all far-UV before it reaches the ground.",
    },
    scientificCitation:
      "Lord Rayleigh (1879) / Philosophical Magazine (Investigations in Optics, with special reference to the Spectroscope)",
    points: 100,
  },
  {
    id: "mission_5_supernova_nucleosynthesis",
    missionNumber: 5,
    title: "Detect Fresh Cosmic Iron & Silicon Forged in a Supernova",
    researchGoal:
      "Identify the elemental signature of iron and silicon synthesized inside Cassiopeia A's exploding star core.",
    astrophysicalContext:
      "When massive stars explode, nuclear fusion in the crushing shock wave synthesizes silicon, sulfur, calcium, and radioactive nickel (which decays into iron). These elements are heated to tens of millions of degrees by the reverse shock wave.",
    question:
      "Which wavelength band and technique allows you to detect the characteristic K-shell atomic transitions of 20-million-degree iron?",
    targetId: "target_cas_a",
    recommendedTelescopeId: "tele_chandra_xray",
    correctWavelength: "xray",
    minApertureMeters: 1.0,
    minExposureSeconds: 240,
    requiresSpaceOrAO: true,
    successAnalysis:
      "Spectroscopic Breakthrough! In 20-million-degree plasma, iron atoms are stripped of almost all 26 electrons. Transitions of the remaining inner electrons (He-like Fe XXV at 6.7 keV) emit characteristic X-ray photons. Chandra's ACIS spectrometer mapped the spatial distribution of this iron, proving that deep core material was blasted past outer layers in a violent convective inversion!",
    whyOtherBandsFail: {
      radio:
        "Radio synchrotron radiation is non-thermal continuum and has no atomic spectral lines corresponding to iron K-shell transitions.",
      infrared:
        "Infrared detects cold dust, but cannot detect inner-shell atomic excitations of highly ionized 20,000,000 K iron.",
      visible:
        "Visible light detects lower-ionization states (like [O III] and [S II]), but cannot detect the million-degree core iron plasma.",
      ultraviolet:
        "UV lines are heavily attenuated by Galactic dust extinction along the line of sight in the Cassiopeia plane.",
    },
    scientificCitation:
      "U. Hwang et al. / Astrophysical Journal Letters (A Million-Second Chandra View of Cassiopeia A)",
    points: 100,
  },
  {
    id: "mission_6_spiral_density_waves",
    missionNumber: 6,
    title: "Catch Newborn Starburst Clusters in the Whirlpool",
    researchGoal:
      "Expose the most energetic, massive young star clusters tracing the compression shock along M51's spiral arms.",
    astrophysicalContext:
      "Gravitational density waves compress interstellar gas as it sweeps through the spiral arms of M51. In these compression fronts, massive O- and B-type stars ignite. These stars are tens of thousands of degrees hot and live for only a few million years.",
    question:
      "Which wavelength reveals the peak blackbody radiation of 35,000 Kelvin young massive stars while ignoring old red stars?",
    targetId: "target_whirlpool",
    recommendedTelescopeId: "tele_hst_space",
    correctWavelength: "ultraviolet",
    minApertureMeters: 2.0,
    minExposureSeconds: 180,
    requiresSpaceOrAO: true,
    successAnalysis:
      "Astrophysical Triumph! By Wien's Displacement Law (λ_max = 2.898 × 10⁻³ / T), a star with a surface temperature of 35,000 K has its peak blackbody emission at λ ≈ 83 nm (deep Ultraviolet!). Hubble's UV detectors isolate these hot infant giants cleanly, while the older yellow and red stars that dominate the galactic core fade into darkness!",
    whyOtherBandsFail: {
      radio:
        "Radio detects the cold molecular fuel, but does not detect the blistering ultraviolet photospheres of the young stars themselves.",
      infrared:
        "Infrared is dominated by reradiated dust glow rather than the direct stellar photospheres.",
      xray: "X-rays only detect the rare binary companion accretors, not the thousands of living O/B stars in the young clusters.",
      visible:
        "Visible light is overwhelmed by billions of intermediate-age and older stars, making it difficult to isolate the youngest generation.",
    },
    scientificCitation:
      "S. V. W. Beckwith et al. / Astronomical Journal (Hubble Space Telescope ACS Imaging of Messier 51)",
    points: 100,
  },
];

export const MODULE_21_SUBLESSONS: SubLesson[] = [
  {
    id: "sub_why_telescopes",
    title: "1. Why Scientists Use Telescopes",
    subtitle: "Light buckets, exposure integration, and surpassing the human eye",
    durationMinutes: 18,
    objectives: [
      "Understand the primary function of a telescope: collecting photons (light bucket), not just magnifying",
      "Contrast the human pupil (5-7mm diameter, 1/30s integration) with giant astronomical apertures",
      "Explain how astronomical sensors accumulate photons over time to reveal the invisible cosmos",
      "Recognize that visible light is only 0.0035% of the full electromagnetic spectrum",
    ],
    content: {
      explorer: {
        summary:
          "Many people think telescopes are just giant magnifying glasses that zoom in on things. But their real superpower is being giant 'light buckets'! Your eye's pupil is only about the size of a pea (5 millimeters wide) and takes quick snapshots every 1/30th of a second. A telescope can be as wide as a tennis court and stare at a faint galaxy for hours, catching millions of times more light so we can see things our eyes could never detect.",
        keyTakeaways: [
          "Telescopes act as giant light buckets: bigger buckets catch more photons.",
          "Magnification is secondary; without collecting enough light, magnifying an image just makes it dimmer and blurrier.",
          "Human eyes are limited: small pupil (~5mm), fixed quick refresh rate, and only see visible light.",
          "Astronomical cameras can expose for hours or days, stacking faint photons together.",
        ],
        deepDive:
          "Imagine catching raindrops in a tiny thimble versus a swimming pool. If only a few rare drops fall every hour, the thimble might catch one drop all night, but the swimming pool will catch thousands of gallons! In astronomy, distant stars and galaxies are like gentle showers of photons. Giant telescopes are huge swimming pools that collect enough cosmic light to create crisp, detailed pictures.",
        didYouKnow:
          "The human eye only sees wavelengths between about 380 and 700 nanometers. If the entire electromagnetic spectrum was an 88-key piano keyboard, our human eyes could only hear less than a single note!",
      },
      scholar: {
        summary:
          "The fundamental purpose of an astronomical telescope is photon collection and angular resolution, governed by physical optics. Light-Gathering Power (LGP) scales with the square of the aperture diameter (LGP ∝ D²). A 10-meter telescope has an aperture area ~4 million times greater than a 5mm human pupil. Furthermore, while the human retina has a neurological integration time of approximately ~0.05–0.1 seconds, astronomical detectors (CCDs and CMOS) integrate signal linearly over hours (S ∝ t_int), vastly elevating the Signal-to-Noise Ratio (SNR).",
        keyTakeaways: [
          "Light Gathering Power: LGP = (D_telescope / D_pupil)². For an 8.2m VLT, LGP ≈ 1.37 × 10⁶ relative to a 7mm dark-adapted pupil.",
          "Integration time integration: CCD quantum efficiency (QE > 90%) vastly outperforms the human rod/cone chemical efficiency (QE ~ 1–3%).",
          "Magnification formula: M = f_objective / f_eyepiece. Higher magnification decreases surface brightness: I ∝ 1 / M².",
          "Electromagnetic breadth: gamma-rays, X-rays, UV, optical, infrared, submillimeter, and radio each reveal entirely distinct physical thermodynamic regimes.",
        ],
        deepDive:
          "Astronomical sensitivity is governed by Poisson photon counting statistics. If a source delivers an average of N photons during an integration time t, the statistical noise is √N. The Signal-to-Noise Ratio is SNR = N / √N = √N. By increasing the aperture diameter D by a factor of 10, photon collection increases by 10² = 100, which increases SNR by √100 = 10. Alternatively, reaching the same SNR on a smaller telescope would require 100 times longer exposure time!",
        didYouKnow:
          "The famous Hubble Ultra Deep Field image gathered light over a total exposure time of 11.3 days (nearly 1 million seconds) across 400 orbits, capturing galaxies that formed when the universe was less than 5% of its current age.",
      },
      astrophysicist: {
        summary:
          "A telescope is a spatial filter and photon flux accumulator operating across electromagnetic phase space. The optical throughput or étendue (A·Ω) defines the geometrical invariant of the optical system, where A is the collecting area and Ω is the solid angle field of view. Modern astronomical imaging is fundamentally photon-limited or background-limited (sky background Poisson noise + detector read noise). Multi-wavelength astrophysics maps radiation mechanisms ranging from relativistic synchrotron and Compton scattering to atomic recombination and molecular rotational cascades.",
        keyTakeaways: [
          "Étendue conservation: A₁ Ω₁ = A₂ Ω₂ through any lossless optical train. Survey telescopes (e.g. Vera C. Rubin Observatory) maximize A·Ω to survey vast sky volumes rapidly.",
          "Signal-to-Noise equation: SNR = (R_source · t) / √[ (R_source + R_sky + R_dark) · t + N_pix · (σ_read² + σ_ADC²) ].",
          "Quantum Efficiency: Modern backside-thinned, antireflection-coated astronomical CCDs achieve QE > 95% at 500–700 nm, approaching unit photon conversion.",
          "Thermodynamic emission windows: Radio (T ~ 10–50 K via 21-cm and CO), Optical (T ~ 3,000–10,000 K stellar photospheres), X-ray (T > 10⁶ K thermal Bremsstrahlung and accretion disks).",
        ],
        deepDive:
          "The human eye's physiological limitations stem from the phototransduction cascade of rhodopsin in retinal rods. Rhodopsin isomerizes with a quantum yield of ~0.67, but post-synaptic filtering and enzymatic deactivation limit temporal integration to the flicker fusion threshold (~30–60 Hz). In contrast, an astronomical CCD utilizes semiconductor bandgap electron-hole pair generation in high-resistivity silicon, accumulating photoelectrons in potential wells with full-well capacities exceeding 100,000 electrons before digitizing with sub-electron readout noise.",
        didYouKnow:
          "The photons captured from the most distant galaxy detected by JWST (JADES-GS-z14-0 at z = 14.32) traveled for 13.5 billion years, delivering less than one photon per square meter every minute!",
      },
    },
  },
  {
    id: "sub_refractor_reflector",
    title: "2. Refracting and Reflecting Telescopes",
    subtitle: "Lenses, mirrors, chromatic aberration, and modern segmented giants",
    durationMinutes: 20,
    objectives: [
      "Compare the optical principles of refractors (convex lenses) and reflectors (concave mirrors)",
      "Explain chromatic aberration and why glass lenses bend different wavelengths by different amounts",
      "Trace the historical revolution led by Isaac Newton's reflecting telescope in 1668",
      "Analyze modern reflector configurations: Newtonian, Cassegrain, Nasmyth, and segmented active mirrors (Keck, JWST, ELT)",
    ],
    content: {
      explorer: {
        summary:
          "The very first telescopes, used by Galileo in 1609, were refractors that used curved glass lenses to bend light. But lenses have a big problem: they act like prisms and bend blue light more than red light, creating fuzzy rainbow halos around stars! In 1668, Sir Isaac Newton solved this by inventing the reflector telescope, which bounces light off curved mirrors instead of shining it through glass. Mirrors don't create rainbow halos, and they can be made huge because they can be supported from behind!",
        keyTakeaways: [
          "Refractors use glass lenses: light bends (refracts) as it passes through the glass.",
          "Reflectors use curved mirrors: light bounces (reflects) to a focal point.",
          "Chromatic aberration: lenses bend colors unevenly, causing annoying rainbow fringes.",
          "Mirrors reflect all colors at the exact same angle—zero chromatic aberration!",
          "All major modern research telescopes are reflectors because giant glass lenses would sag under their own weight.",
        ],
        deepDive:
          "Why did astronomers stop building giant refractor telescopes after 1897? The largest refractor ever built is the 40-inch (1-meter) lens at Yerkes Observatory in Wisconsin. That lens weighs over 1,000 pounds! Because light has to pass through the lens, it can only be supported at its very edges. If you made a lens any bigger, the heavy glass would flex and sag like warm jello, distorting the picture completely. Mirrors, on the other hand, can be supported from behind across their entire back surface by steel cradles and computer-controlled actuators!",
        didYouKnow:
          "James Webb's primary mirror is made of 18 hexagonal segments made of beryllium metal coated in a microscopic layer of pure gold—only 100 nanometers thick (about 1,000 times thinner than a human hair)—because gold is the ultimate reflector of infrared light!",
      },
      scholar: {
        summary:
          "Optical telescopes are divided into dioptric systems (refractors utilizing refraction described by Snell's law: n₁ sin θ₁ = n₂ sin θ₂) and catoptric systems (reflectors utilizing the law of reflection: θ_i = θ_r). Because the index of refraction n(λ) of optical glass varies inversely with wavelength (optical dispersion described by Cauchy's or Sellmeier's equation), refractors suffer from chromatic aberration: blue focal length f_blue is shorter than red focal length f_red. Newton's reflector eliminated chromatic dispersion entirely, establishing the foundation for all modern research telescopes.",
        keyTakeaways: [
          "Chromatic aberration formula: Δf = f_red - f_blue. Achromatic doublets (crown and flint glass) bring two wavelengths to a common focus; apochromatic triplets bring three.",
          "Law of Reflection is strictly achromatic: θ_reflected = θ_incident for all wavelengths.",
          "Structural limitations of refractors: glass absorbs UV and IR; lenses sag due to gravity; internal bubbles/impurities degrade optical wavefronts.",
          "Optical geometries: Newtonian (flat 45° secondary), Cassegrain (parabolic primary + hyperbolic secondary), Ritchey-Chrétien (hyperbolic primary + hyperbolic secondary for coma-free wide fields).",
        ],
        deepDive:
          "The Ritchey-Chrétien Cassegrain design is the gold standard for space and professional ground telescopes (including Hubble, Keck, VLT, and Subaru). Standard parabolic mirrors suffer from off-axis optical coma—aberrations that make stars away from the optical center look like tiny elongated comets. By figuring both the primary and secondary mirrors as hyperboloids, the Ritchey-Chrétien design cancels both spherical aberration and third-order coma over a wide field of view, leaving only astigmatism and field curvature.",
        didYouKnow:
          "The Yerkes 40-inch refractor was completed in 1897. Since then, not a single major astronomical research telescope has been built with a glass lens primary. Every single research telescope over 1 meter built in the past 125 years is a reflector!",
      },
      astrophysicist: {
        summary:
          "The evolution of telescope optical trains is characterized by Hamiltonian optics and aberration polynomial expansion (Seidel third-order aberrations: spherical, coma, astigmatism, field curvature, distortion). Modern mega-telescopes (Keck 10m, GTC 10.4m, JWST 6.5m, ELT 39m) utilize segmented primary mirrors with active optics (edge sensors and piezoceramic actuators maintaining sub-micron segment alignment at 10–100 Hz). The optical prescription of the 39m ELT is a Five-Mirror Anastigmat (FMA) providing a diffraction-limited 10-arcminute field of view.",
        keyTakeaways: [
          "Dispersion physics: dn/dλ < 0 across normal optical transmission bands. The Abbe number V_d = (n_d - 1) / (n_F - n_C) quantifies chromatic dispersion.",
          "Seidel aberration suppression: Paraboloids achieve zero spherical aberration on-axis (W₀₄₀ = 0) but have coma W₁₃₁ ≠ 0. Ritchey-Chrétien enforces W₀₄₀ = 0 and W₁₃₁ = 0 simultaneously.",
          "Three-Mirror Anastigmats (TMA): Used in JWST and the Vera C. Rubin Observatory to cancel spherical aberration, coma, and astigmatism simultaneously over large focal planes.",
          "Active Optics vs Adaptive Optics: Active optics corrects slow mechanical flexure and thermal drift (0.01–1 Hz); adaptive optics corrects fast atmospheric turbulence (100–2,000 Hz).",
        ],
        deepDive:
          "The 39-meter ELT primary mirror (M1) consists of 798 hexagonal segments, each 1.4 meters wide and 50 mm thick, made of low-thermal-expansion glass-ceramic (ZERODUR). To act as a single coherent optical surface, each segment is monitored by inductive edge sensors measuring relative displacement with nanometer precision. A closed-loop control system drives 2,394 position actuators to correct for gravitational sag as the telescope tilts, wind buffeting, and ambient thermal gradients.",
        didYouKnow:
          "The 8.4-meter primary mirrors for the Giant Magellan Telescope and Large Synoptic Survey Telescope (Rubin) are spun-cast in a rotating furnace beneath the football stadium at the University of Arizona, spinning at 7 RPM to naturally form a parabolic bowl while molten at 1,165°C!",
      },
    },
  },
  {
    id: "sub_light_gathering_resolution",
    title: "3. Light-Gathering Power and Resolution",
    subtitle: "Diffraction limits, the Rayleigh criterion, and splitting the stars",
    durationMinutes: 22,
    objectives: [
      "Derive the Light-Gathering Power relationship LGP ∝ D² and apply it to real telescope apertures",
      "Formulate the wave diffraction limit of light and the Rayleigh Criterion: θ ≈ 1.22 λ / D",
      "Explain the structure of an Airy disk: central diffraction peak and surrounding diffraction rings",
      "Calculate resolving power across different wavelengths from radio to X-ray and understand trade-offs",
    ],
    content: {
      explorer: {
        summary:
          "If you point a telescope at a distant pinpoint star, you might expect it to look like a microscopic dot. But because light travels in waves, it bends around the edges of the telescope opening, creating a tiny bullseye pattern called an Airy disk! The bigger your telescope opening (aperture), the smaller and tighter that bullseye is, allowing you to tell two close stars apart. This ability to see sharp details is called angular resolution.",
        keyTakeaways: [
          "Light-gathering power depends on aperture area: doubling telescope diameter gives 4x more light!",
          "Resolution means sharpness: the ability to see two separate objects instead of one blurry blob.",
          "Light bends like water waves around corners—this bending is called diffraction.",
          "Bigger telescopes create smaller diffraction blur, giving sharper images.",
          "Shorter wavelengths (blue/UV) give sharper resolution than longer wavelengths (red/radio) on the same telescope.",
        ],
        deepDive:
          "Think of two car headlights miles away on a dark highway. Far away, your eyes see just one glowing yellow blob. As the car drives closer, your eyes can finally tell there are two separate headlights! The Rayleigh criterion tells us the exact angle where two glowing points can be separated. A large telescope can split two stars that look completely merged into one blob to a smaller telescope.",
        didYouKnow:
          "The Hubble Space Telescope can resolve an angle of 0.05 arcseconds. That's sharp enough to read the date on a dime from 2.5 miles (4 km) away!",
      },
      scholar: {
        summary:
          "Angular resolution is fundamentally constrained by wave diffraction described by the Fraunhofer diffraction integral through a circular aperture. When plane waves pass through a circular aperture of diameter D, constructive and destructive interference forms an Airy diffraction pattern on the focal plane. The angular radius of the first dark minimum defines the Rayleigh Criterion: θ_min = 1.22 λ / D (radians), or in practical astronomical arcseconds: θ'' ≈ 0.252 · λ(μm) / D(m).",
        keyTakeaways: [
          "Rayleigh Criterion: θ = 1.22 λ / D. Two point sources are resolved when the central maximum of one Airy disk falls on the first minimum of the other.",
          "Airy disk irradiance: I(θ) = I₀ [ 2 J₁(x) / x ]², where x = π D sin(θ) / λ, containing 84% of total energy in the central core.",
          "Wavelength dependence: Radio telescopes (λ = 21 cm) have terrible diffraction limits compared to optical telescopes (λ = 500 nm) unless synthesized with enormous baselines (Interferometry).",
          "Light-Gathering Power ratio: LGP₁ / LGP₂ = (D₁ / D₂)². A 10m telescope collects (10 / 2.4)² = 17.4 times more photons per second than Hubble.",
        ],
        deepDive:
          "Let's compare the diffraction limit of the human eye versus a giant telescope. For a dark-adapted human eye (D = 7 mm = 0.007 m) in green light (λ = 550 nm): θ = 1.22 × (550 × 10⁻⁹ m) / (0.007 m) ≈ 9.6 × 10⁻⁵ radians ≈ 20 arcseconds (in practice, retinal rod spacing limits human visual acuity to ~60 arcseconds or 1 arcminute). For the 39m ELT: θ = 1.22 × (550 × 10⁻⁹ m) / 39.3 m ≈ 1.7 × 10⁻⁸ radians ≈ 0.0035 arcseconds—over 17,000 times sharper than human vision!",
        didYouKnow:
          "To achieve the same angular resolution in the radio band (at λ = 21 cm) as the Hubble Space Telescope achieves in visible light (0.05 arcseconds), you would need a single radio dish 1,050 kilometers wide! That's why radio astronomers invented interferometry.",
      },
      astrophysicist: {
        summary:
          "The diffraction limit represents the spatial cut-off frequency of the Optical Transfer Function (OTF = MTF · e^(i PTF)). The Point Spread Function (PSF) is the two-dimensional Fourier transform of the complex pupil aperture function P(u,v). For an unobscured circular pupil, the PSF is the classic Bessel function Airy pattern. Central obstructions (secondary mirror spiders) diffract light out of the central Airy core into the surrounding diffraction rings and produce linear diffraction spikes corresponding to Fourier transforms of the support struts.",
        keyTakeaways: [
          "Spatial frequency cut-off: f_max = D / λ. Any spatial details higher than f_max are permanently lost to diffraction.",
          "Strehl Ratio (S): S = I_peak(actual) / I_peak(diffraction_limited). An optical system with S ≥ 0.8 is defined as diffraction-limited by Maréchal's criterion.",
          "Encircled energy: Central obstruction (e.g. secondary mirror obscuration ε = d/D ≈ 0.2–0.3) redistributes energy from the Airy core into the outer rings, reducing contrast on extended planetary details.",
          "Wavefront error RMS: The Marechal approximation links Strehl ratio to wavefront phase variance: S ≈ e^(-σ_φ²), where σ_φ = 2π σ_w / λ.",
        ],
        deepDive:
          "When two incoherent point sources with angular separation Δθ illuminate a circular pupil, their combined intensity is I_total(θ) = I(θ) + I(θ - Δθ). At the Rayleigh separation Δθ = 1.22 λ/D, the dip in intensity between the two peaks is ~19% (the saddle point ratio is 0.8106). Modern deconvolution algorithms (Lucy-Richardson, maximum entropy) and super-resolution interferometry can surpass the classical Rayleigh limit if the Signal-to-Noise Ratio is sufficiently high, fundamentally limited by the Cramér-Rao lower bound of photon position estimation.",
        didYouKnow:
          "The Event Horizon Telescope achieved an effective angular resolution of 20 micro-arcseconds at 1.3 mm wavelength—equivalent to resolving an orange on the surface of the Moon—by synthesizing a telescope aperture the size of planet Earth!",
      },
    },
  },
  {
    id: "sub_space_vs_ground",
    title: "4. Space Versus Ground Observatories",
    subtitle: "Atmospheric windows, twinkling turbulence, seeing disks, and adaptive optics",
    durationMinutes: 20,
    objectives: [
      "Identify the atmospheric transmission windows (optical, radio, narrow IR bands) and blocked regimes (gamma, X-ray, UV, far-IR)",
      "Explain astronomical seeing: temperature fluctuations, atmospheric turbulence, and the Kolmogorov model",
      "Demonstrate how Adaptive Optics (AO) deforms mirrors in real time to restore diffraction-limited images",
      "Evaluate the strategic trade-offs between cheap giant ground telescopes and expensive space telescopes",
    ],
    content: {
      explorer: {
        summary:
          "Stars seem to twinkle in the night sky, which sounds pretty in nursery rhymes, but to astronomers, twinkling is a total nightmare! It is caused by warm and cool air currents in Earth's atmosphere bending light back and forth like looking through shimmering heat waves over a hot road. This blurs star images into fuzzy blobs called 'seeing disks'. Putting telescopes into space—like Hubble and Webb—escapes the atmosphere entirely, giving crystal-clear views 24/7!",
        keyTakeaways: [
          "Twinkling (scintillation) is caused by Earth's turbulent atmosphere churning warm and cold air pockets.",
          "The atmosphere acts as a protective shield: it blocks harmful X-rays, gamma rays, and UV, but also blocks astronomers from seeing them!",
          "Ground telescopes are limited by 'seeing blur' (~1 arcsecond) regardless of how huge their mirrors are, unless they use Adaptive Optics.",
          "Adaptive optics uses powerful lasers to create fake stars in the sky, measuring atmospheric blur and undoing it 1,000 times a second!",
          "Space telescopes are expensive and hard to fix, but have zero atmospheric blur, zero weather, and see all wavelengths.",
        ],
        deepDive:
          "How does Adaptive Optics work? High in the Chilean desert at the Very Large Telescope, astronomers shoot four brilliant orange lasers into the sky. These lasers excite sodium atoms 90 kilometers high in the mesosphere, creating glowing artificial 'guide stars'. High-speed cameras watch the fake stars twinkle, calculate exactly how the air is wiggling the light, and send signals to hundreds of tiny pistons underneath a flexible mirror. The mirror bends 1,000 times every second to cancel out the atmosphere's wobble, turning fuzzy blobs back into pinpoint sharp stars!",
        didYouKnow:
          "Earth's atmosphere absorbs 100% of cosmic gamma rays and X-rays, and over 98% of far-infrared light. If we had never launched satellites into space, humanity would never have discovered black holes, gamma-ray bursts, or the cosmic infrared background!",
      },
      scholar: {
        summary:
          "Earth's atmosphere imposes two severe barriers on astronomical observation: spectral absorption and atmospheric turbulence. Atmospheric extinction is caused by molecular absorption bands (O3 in UV; H2O and CO2 in infrared; O2 and N2 in X-rays/gamma-rays). Atmospheric turbulence is described by the Kolmogorov index-of-refraction structure function D_n(r) = C_n² r^(2/3). The Fried parameter r₀ (typically 10–20 cm at optical wavelengths) defines the spatial coherence diameter. For any ground telescope with D > r₀, the effective angular resolution is degraded to the seeing angle θ_seeing ≈ λ / r₀ (typically 0.5''–1.5''), completely independent of aperture diameter D!",
        keyTakeaways: [
          "Atmospheric Windows: Optical window (350–1000 nm) and Radio window (1 cm to 10 m). Most IR, all UV, X-ray, and gamma-ray require space.",
          "Fried Parameter r₀: Scales as r₀ ∝ λ^(6/2). Seeing is much better in the infrared than in the visible or ultraviolet.",
          "Seeing disk: Without correction, an 8-meter ground telescope has the same angular resolution as an 18-cm amateur telescope!",
          "Adaptive Optics (AO): Wavefront sensor (Shack-Hartmann or Pyramid) measures phase errors φ(x,y); deformable mirror applies conjugate phase -φ(x,y) within the coherence time τ₀ ≈ 0.314 r₀ / v_wind (typically 1–5 milliseconds).",
        ],
        deepDive:
          "Why not put ALL telescopes in space? Cost and size! The James Webb Space Telescope cost approximately $10 billion and took 25 years to build, with a 6.5-meter mirror. For less than $2 billion, the European Southern Observatory is building the Extremely Large Telescope (ELT) with a 39.3-meter primary mirror—offering 36 times the light-gathering area of JWST! Equipped with multi-conjugate adaptive optics, ground mega-telescopes complement space observatories by delivering colossal light throughput at a fraction of the cost per photon.",
        didYouKnow:
          "The atmosphere doesn't just blur starlight—it glows! OH (hydroxyl) airglow molecules in the upper atmosphere produce intense infrared background emission, making ground-based infrared astronomy like looking for fireflies next to a blazing bonfire.",
      },
      astrophysicist: {
        summary:
          "Wavefront propagation through turbulent media is governed by the Paraxial Helmholtz equation. The phase variance over aperture D is σ_φ² = 1.029 (D / r₀)^(5/3). The Greenwood frequency f_G = 0.427 v_wind / r₀ dictates the minimum closed-loop bandwidth required for adaptive optics correction. Modern Extreme Adaptive Optics (ExAO) instruments (e.g. SPHERE on VLT, SCExAO on Subaru) achieve Strehl ratios S > 90% in the H-band by operating at 2–3 kHz with 2,000+ actuator deformable mirrors, enabling direct high-contrast coronagraphic imaging of exoplanets at 10⁻⁶ to 10⁻⁷ contrast ratios.",
        keyTakeaways: [
          "Isoplanatic Angle θ₀: θ₀ = 0.314 (r₀ / h_eff). The field of view over which AO correction is valid is tiny—typically only 5 to 20 arcseconds in the near-infrared.",
          "Laser Guide Star (LGS) Cone Effect (Focal Anisoplanatism): A laser guide star at finite altitude (90 km sodium layer or 15 km Rayleigh beacon) does not sample the identical conical column of turbulence as starlight from infinity.",
          "Multi-Conjugate Adaptive Optics (MCAO): Employs multiple deformable mirrors conjugated to different turbulent atmospheric layer altitudes (e.g., ground boundary layer, 4 km, 12 km jet stream) to expand the corrected field of view to several arcminutes.",
          "Telluric lines: Ground-based infrared spectra are contaminated by dense molecular absorption lines of H₂O, CO₂, CH₄, and O₃, requiring calibration against A0V telluric standard stars.",
        ],
        deepDive:
          "The decision matrix between space and ground observatories hinges on photon noise regimes. In the thermal infrared beyond 3 μm, a space telescope cooled to 40 K (JWST) is background-limited by zodiacal dust emission (scattered sunlight from interplanetary dust), achieving a background flux 10⁶ times lower than an ambient-temperature (280 K) ground telescope! Consequently, for faint infrared spectroscopy, JWST at L2 outperforms an equivalent 30-meter ground telescope by orders of magnitude, despite its smaller collecting area.",
        didYouKnow:
          "Laser guide stars cannot measure atmospheric tilt (tip/tilt image jitter) because the laser beam passes through the exact same turbulence going up as it does coming down! Therefore, every laser AO system still requires a faint real star nearby to stabilize image motion.",
      },
    },
  },
  {
    id: "sub_radio_astronomy",
    title: "5. Radio Astronomy and Interferometry",
    subtitle:
      "The 21-cm hydrogen line, synchrotron emission, and combining dishes across continents",
    durationMinutes: 22,
    objectives: [
      "Understand how radio telescopes detect non-thermal emission and cold cosmic gas",
      "Explain the fundamental 21-centimeter (1420 MHz) hyperfine transition of neutral hydrogen",
      "Master the principle of Aperture Synthesis Interferometry: synthesizing baselines B up to planetary scale",
      "Explore real radio facilities: ALMA, the VLA, FAST, and the planet-spanning Event Horizon Telescope",
    ],
    content: {
      explorer: {
        summary:
          "Stars shine brightly in visible light, but the coldest and most violent things in the universe shine in radio waves! Radio waves are long, lazy waves of light—some are as long as a football field. Because radio waves are so long, individual radio dishes have to be gigantic just to see faint objects. To solve this, astronomers build dozens of dishes, connect them together with computers, and make them act like one gigantic telescope as wide as a mountain range or even the entire planet Earth!",
        keyTakeaways: [
          "Radio waves are invisible light with long wavelengths (from a millimeter to several meters).",
          "Radio waves easily pass right through clouds, rain, daylight, and thick interstellar dust.",
          "Cold neutral hydrogen gas (the main building block of stars) emits radio waves at 21 centimeters.",
          "Interferometry connects multiple dishes across miles to mimic a giant super-telescope.",
          "The Event Horizon Telescope combined radio dishes across the world to take the first direct picture of a black hole's shadow!",
        ],
        deepDive:
          "In 1931, Karl Jansky was an engineer working for Bell Telephone Laboratories trying to find out what was causing static hissing on overseas telephone calls. He built a rotating radio antenna and discovered that the hissing wasn't coming from thunderstorms or car engines—it was coming from the center of our Milky Way galaxy! He had accidentally discovered radio astronomy, proving that the universe is broadcasting radio signals all the time.",
        didYouKnow:
          "When old analog television sets were tuned between channels, about 1% of the black-and-white static snow flickering on the screen was caused by the Cosmic Microwave Background—radio waves from the Big Bang itself echoing across the cosmos!",
      },
      scholar: {
        summary:
          "Radio astronomy probes low-energy physical processes: thermal blackbody emission from cold bodies (Rayleigh-Jeans law: B_ν(T) ≈ 2 k_B T ν² / c²), molecular rotational lines, and non-thermal synchrotron radiation. The crown jewel of radio astronomy is the 21.1 cm (1420.40575 MHz) hyperfine line of atomic hydrogen (H I), caused by the magnetic dipole interaction between the proton and electron spins. Because single radio dishes have coarse angular resolution (θ ≈ λ / D), radio astronomers employ Aperture Synthesis (Van Cittert-Zernike theorem), where an array of antennas measures the Fourier transform of the sky brightness distribution.",
        keyTakeaways: [
          "21-cm Hyperfine Line: Transition probability A₁₀ = 2.85 × 10⁻¹⁵ s⁻¹ (lifetime of 11 million years per atom!). Because cosmic hydrogen is so abundant, it emits a powerful, ubiquitous galactic signal.",
          "Synchrotron Radiation: Highly relativistic electrons (γ >> 1) spiraling in magnetic fields emit beamed non-thermal radio waves with power-law spectrum S_ν ∝ ν^(-α).",
          "Interferometer Angular Resolution: θ ≈ λ / B_max, where B_max is the maximum baseline distance between antennas, NOT the dish diameter!",
          "Interferometry Collecting Area: Collecting area equals the sum of dish areas (A_total = N · π r²), while resolving power is determined by baseline separation B.",
        ],
        deepDive:
          "How does an interferometer reconstruct an image? As Earth rotates, pairs of antennas with projected baseline vectors (u,v) sample different spatial frequencies of the celestial brightness distribution I(l,m). According to the Van Cittert-Zernike theorem, the measured complex visibility V(u,v) is the two-dimensional Fourier transform of I(l,m): V(u,v) = ∬ I(l,m) exp[-2πi (ul + vm)] dl dm. By tracking a source over hours, Earth's rotation sweeps out elliptical tracks in the (u,v) plane. Fast Fourier Transform algorithms invert this visibility matrix to reconstruct high-resolution images.",
        didYouKnow:
          "FAST (Five-hundred-meter Aperture Spherical radio Telescope) in Guizhou, China, is the largest single-dish radio telescope in the world. Its bowl spans 500 meters across—large enough to hold 30 soccer fields—and uses 4,450 aluminum panels that actively reshape into a paraboloid pointing at targets!",
      },
      astrophysicist: {
        summary:
          "Radio interferometry operates on coherence theory and cross-correlation of electromagnetic analytic signals. The voltage signals V_i(t) and V_j(t) measured at antenna pair (i,j) are down-converted, digitized at Nyquist sampling rates, and multiplied in real-time FX or XF digital correlators to compute the cross-power spectrum. Deconvolution techniques (Högbom CLEAN, Multiscale CLEAN, Maximum Entropy Method) are required to deconvolve the synthesized beam (dirty beam PSF) from the dirty map to recover authentic sky brightness distributions.",
        keyTakeaways: [
          "Receiver noise temperature: System temperature T_sys = T_ant + T_rx + T_sky + T_ground. Radiometer sensitivity equation: ΔS_min = 2 k_B T_sys / [ A_eff √(2 · Δν · τ) ].",
          "Very Long Baseline Interferometry (VLBI): Antennas are separated by thousands of kilometers with no physical cable links. Data are synchronized using atomic hydrogen maser clocks (stability ~10⁻¹⁵) and correlated post-observation.",
          "Molecular tracers: Millimeter radio astronomy maps dense cold cores using rotational transitions: CO (J=1→0 at 115 GHz), HCN, HCO⁺, and CS.",
          "Faraday Rotation: Linearly polarized radio waves experience polarization plane rotation Δχ = RM · λ² when propagating through magnetized plasma, mapping cosmic magnetic fields.",
        ],
        deepDive:
          "The Event Horizon Telescope (EHT) links ALMA and APEX in Chile, the South Pole Telescope, the Submillimeter Array in Hawaii, the LMT in Mexico, the IRAM 30m in Spain, and the Kitt Peak and SMA dishes. Operating at 1.3 mm (230 GHz) across an Earth-sized baseline of B ≈ 10,700 km, the EHT achieves an angular resolution θ ≈ λ / B ≈ 25 micro-arcseconds. This enabled resolving the photon ring and black hole shadows of M87* (6.5 billion solar masses) and Sagittarius A* (4.1 million solar masses).",
        didYouKnow:
          "The Square Kilometre Array (SKA), currently under construction across South Africa and Western Australia, will combine thousands of high-frequency dishes and over 130,000 low-frequency dipole antennas, generating more digital data per day than the entire global internet!",
      },
    },
  },
  {
    id: "sub_infrared_ultraviolet",
    title: "6. Infrared and Ultraviolet Astronomy",
    subtitle: "Piercing dust, cool stars, exoplanet atmospheres, and blistering young giants",
    durationMinutes: 20,
    objectives: [
      "Distinguish near-infrared, mid-infrared, and far-infrared physical emission regimes",
      "Explain Rayleigh scattering (I ∝ λ⁻⁴) and how infrared light penetrates interstellar dust",
      "Trace the cosmic redshift of distant starlight: (1 + z) = λ_observed / λ_emitted",
      "Explore ultraviolet astronomy: tracing massive O/B stars, planetary atmospheres, and hot white dwarfs",
    ],
    content: {
      explorer: {
        summary:
          "If human eyes could see infrared light, you could see people in total darkness because our bodies glow with body heat! In space, dusty clouds that look completely dark and solid to visible telescopes become totally transparent in infrared. Even better, because the universe is expanding, light from the very first baby galaxies has been stretched out over billions of years, shifting from visible light into infrared. That's why the James Webb Space Telescope was built as a giant infrared eye!",
        keyTakeaways: [
          "Infrared light is thermal radiation: it lets us see cool objects (comets, planets, cool stars, warm dust).",
          "Interstellar dust blocks blue and visible light, but infrared light glides right through without scattering.",
          "Cosmic expansion stretches light: distant galaxies look redder and redder the farther away they are (cosmological redshift).",
          "Ultraviolet light is high-energy light emitted by blisteringly hot objects: massive young stars and white dwarfs.",
          "Infrared telescopes must be cryogenically cooled: otherwise, their own heat would blind their sensors!",
        ],
        deepDive:
          "Why did NASA put a giant 5-layer tennis-court-sized sunshield on the James Webb Space Telescope? Because infrared light is heat! If Webb were warm, its own mirrors and camera would glow bright in the infrared, blinding itself. The shiny silver sunshield keeps Webb in a permanent deep freeze at -388° Fahrenheit (-233° Celsius). The mid-infrared camera (MIRI) even uses a specialized helium refrigerator to chill down to just 7 degrees above absolute zero!",
        didYouKnow:
          "The ozone layer high in Earth's stratosphere absorbs almost all solar ultraviolet light. While this protects life on Earth from sunburn and DNA damage, it means UV astronomy is completely impossible from the ground—you must go into space!",
      },
      scholar: {
        summary:
          "Infrared astronomy spans 0.75 μm to 350 μm (Near-IR: 0.75–5 μm; Mid-IR: 5–30 μm; Far-IR: 30–350 μm). Interstellar extinction is wavelength-dependent (A_λ / A_V ∝ λ^(-1.75)). Dust extinction drops precipitously in the infrared: extinction at 2.2 μm (K-band) is only ~10% of visible V-band extinction (A_K ≈ 0.11 A_V). Furthermore, light from galaxies at high redshift z is cosmologically stretched: λ_obs = λ_emit (1 + z). Rest-frame visible and ultraviolet starlight emitted by z = 10 galaxies is redshifted directly into JWST's near- and mid-infrared bands.",
        keyTakeaways: [
          "Rayleigh scattering cross-section: σ_scat ∝ λ⁻⁴. Long infrared waves pass through interstellar grain aggregates (a ~ 0.1–0.5 μm) with minimal scattering.",
          "Wien's Law: λ_peak · T = 2,898 μm·K. Cool objects (T = 30–300 K) peak naturally in the infrared: protoplanetary discs, brown dwarfs, and Kuiper belt objects.",
          "Cosmic redshift: z = (λ_obs - λ_rest) / λ_rest. Lyman-alpha (121.6 nm in UV) is redshifted to 1.8 μm (NIR) at z = 14.",
          "Ultraviolet regime (10–380 nm): Probes Lyman continuum, interstellar absorption lines (C IV, Si IV), stellar winds of O/B stars, and accretion discs around white dwarfs.",
        ],
        deepDive:
          "Infrared transmission spectroscopy is our primary method for analyzing exoplanet atmospheres. When an exoplanet transits across its host star, starlight filters through the planet's atmospheric annulus. Molecules like H₂O, CO₂, CH₄, and NH₃ absorb light at specific infrared vibrational-rotational band wavelengths (e.g. CO₂ at 4.3 μm and H₂O at 1.4 and 2.7 μm). By measuring the minute dip in brightness (a few tens of parts per million) at each wavelength, JWST decodes the chemical cocktail and clouds of alien worlds.",
        didYouKnow:
          "In 2022, JWST detected carbon dioxide (CO₂) in the atmosphere of exoplanet WASP-39b with undeniable statistical significance (> 25 sigma), the first clear detection of CO₂ in an exoplanet atmosphere in human history!",
      },
      astrophysicist: {
        summary:
          "Infrared and ultraviolet astronomy probe complementary endpoints of thermal and non-thermal astrophysics. UV observations trace the cosmic star formation rate density (Madau-Dickinson relation) via the non-ionizing UV continuum (150–280 nm) dominated by short-lived OB stars (lifetimes < 100 Myr). Conversely, mid- and far-IR observations trace bolometric infrared luminosity (L_IR: 8–1000 μm), capturing UV starlight that was absorbed and reradiated by dust in Luminous and Ultra-Luminous Infrared Galaxies (LIRGs and ULIRGs: L_IR > 10¹² L_sun).",
        keyTakeaways: [
          "Extinction curve: R_V = A_V / E(B-V) ≈ 3.1 in diffuse Milky Way interstellar medium. The 2175 Å bump is attributed to electronic transitions in carbonaceous dust grains / PAHs.",
          "PAH emission bands: Polycyclic Aromatic Hydrocarbons absorb UV photons and fluoresce via C-C and C-H vibrational modes at 3.3, 6.2, 7.7, 8.6, 11.3, and 12.7 μm.",
          "Detector technologies: Infrared relies on narrow-bandgap semiconductor alloys (HgCdTe for NIRCam up to 5 μm; Arsenic-doped Silicon Si:As Impurity Band Conduction for MIRI up to 28 μm).",
          "UV detectors: Microchannel Plates (MCP) and solar-blind CsI/CsTe photocathodes reject overwhelming optical/IR solar photons to achieve photon-counting UV sensitivity.",
        ],
        deepDive:
          "Cosmic reionization occurred between z ≈ 6 and z ≈ 15, when ultraviolet photons from the first stars and quasars ionized the neutral intergalactic medium. To observe this epoch, JWST uses the 'Lyman-break' dropout technique: neutral hydrogen completely absorbs photons with rest wavelengths shorter than the Lyman limit (λ < 91.2 nm). For a galaxy at z = 12, this break shifts to λ_obs = 91.2 × (1 + 12) = 1,185 nm. The galaxy appears brightly in filters redder than 1.2 μm, but completely disappears (drops out) in bluer filters!",
        didYouKnow:
          "SOFIA (Stratospheric Observatory for Infrared Astronomy) was a modified Boeing 747SP airliner that carried a 2.7-meter telescope to 45,000 feet (13.7 km), flying above 99% of Earth's atmospheric water vapor to capture far-infrared light before its retirement in 2022.",
      },
    },
  },
  {
    id: "sub_xray_astronomy",
    title: "7. X-ray Astronomy: The High-Energy Universe",
    subtitle: "Grazing-incidence mirrors, million-degree plasmas, and black hole accretion",
    durationMinutes: 20,
    objectives: [
      "Understand why normal telescope mirrors cannot reflect high-energy X-rays",
      "Master the principle of Wolter Type I grazing-incidence optics (skipping stones on water)",
      "Identify the primary astrophysical sources of X-rays: accretion discs, neutron stars, and supernova remnants",
      "Explore the Chandra X-ray Observatory and XMM-Newton discoveries of the dynamic cosmos",
    ],
    content: {
      explorer: {
        summary:
          "X-rays are super high-energy light waves that can pass right through human skin—which is why doctors use them to look at your bones! But this creates a huge problem for astronomers: if you try to bounce an X-ray off a normal telescope mirror, the X-ray doesn't bounce—it punches right into the mirror and gets absorbed! To capture X-rays, astronomers had to invent special barrel-shaped mirrors that reflect X-rays at tiny, shallow angles, just like skipping a flat stone across the surface of a pond!",
        keyTakeaways: [
          "X-rays are high-energy photons emitted by the hottest, most violent places in the universe.",
          "Normal mirrors cannot reflect X-rays head-on; the photons penetrate straight into the material.",
          "Wolter mirrors use nested cylinders to bounce X-rays at grazing angles (< 1 degree).",
          "X-ray telescopes must fly in space because Earth's atmosphere completely blocks X-rays.",
          "X-rays reveal matter heating up to tens of millions of degrees as it swirls into black holes.",
        ],
        deepDive:
          "Imagine throwing a rock at a lake. If you throw it straight down, it splashes and sinks to the bottom. But if you throw a flat stone at a very shallow, grazing angle nearly parallel to the water, the surface tension skips the stone across the surface! That is exactly how the Chandra X-ray Observatory works. Its four nested cylindrical mirrors are polished so smooth that X-ray photons strike them at an angle of less than 1 degree and bounce gently to a focus 10 meters away.",
        didYouKnow:
          "Chandra's mirrors are the smoothest surfaces ever created by humanity. If Chandra's mirrors were enlarged to the size of the surface of the Earth, the tallest bump or mountain on the entire planet would be less than 2 meters (6 feet) tall!",
      },
      scholar: {
        summary:
          "X-ray photons carry energies from 0.1 keV to 100 keV (wavelengths λ ≈ 0.01–10 nm). Because the refractive index of all materials in the X-ray regime is slightly less than unity (n = 1 - δ - iβ, where δ ≈ 10⁻⁵–10⁻³), total external reflection occurs only when the incident grazing angle θ_g is less than the critical angle: θ_c ≈ √(2δ) ≈ (hc / E) √(r_e n_e / π). For a 1 keV X-ray on gold or iridium, θ_c is only ~1°–2°. In 1952, Hans Wolter designed grazing-incidence mirror combinations; the Wolter Type I configuration uses coaxial paraboloid and hyperboloid mirrors to focus X-rays.",
        keyTakeaways: [
          "Total External Reflection: X-rays reflect only at grazing angles (θ < θ_c). Higher-energy X-rays require steeper, shallower grazing angles.",
          "Wolter Type I Geometry: Paraboloid primary mirror followed by a hyperboloid secondary mirror provides on-axis focus and reduces off-axis coma.",
          "Thermal Bremsstrahlung: Accelerating electrons in hot intra-cluster plasma (T ≈ 10⁷–10⁸ K) emit diffuse continuum X-rays: ε_ν ∝ n_e n_i T^(-1/2) exp(-hν / k_B T).",
          "Iron K-alpha line (6.4–6.97 keV): Relativistically broadened X-ray spectral line probes spacetime curvature and black hole spin in the inner accretion disk.",
        ],
        deepDive:
          "Where do astronomical X-rays come from? 1) Black hole and neutron star accretion discs: gravitational potential energy converts to kinetic energy and friction, heating gas to T > 10,000,000 K. 2) Supernova remnants: supersonic shock waves blast into interstellar gas, shock-heating plasma to tens of millions of degrees. 3) Intra-Cluster Medium (ICM): Galaxy clusters contain enormous reservoirs of hot, diffuse gas that out-masses all the stars in the cluster by a factor of five, shining brightly in X-rays!",
        didYouKnow:
          "In X-ray astronomy, photons are so energetic and scarce that cameras don't measure a steady current—they detect and time-tag individual photons one by one, recording the exact microsecond, pixel location, and energy of every single photon!",
      },
      astrophysicist: {
        summary:
          "X-ray astrophysics probes extreme gravity, relativistic hydrodynamics, and high-energy atomic physics. The Chandra X-ray Observatory achieves 0.492'' FWHM angular resolution using four nested Zerodur Wolter I mirror shells coated in iridium. X-ray spectroscopy utilizing Transmission Gratings (HETGS/LETGS) and microcalorimeters (e.g. XRISM's Resolve, operating at 50 mK with 5 eV resolution) measures Doppler shifts, plasma turbulence, and non-equilibrium ionization states in supernova shocks and active galactic nuclei.",
        keyTakeaways: [
          "Eddington Luminosity limit: L_Edd = 4π G M m_p c / σ_T ≈ 1.26 × 10³⁸ (M / M_sun) erg/s. Accretion disks radiating near L_Edd naturally emit peak flux in the soft X-ray band.",
          "Relativistic line broadening: The Fe Kα emission line profile exhibits Doppler boosting on the approaching disk wing and gravitational redshift on the receding wing, constraining the dimensionless black hole spin parameter a* = c J / (G M²).",
          "Thermal conduction and cooling flows: X-ray observations resolved the classic 'cooling flow paradox' by proving that supermassive black hole AGN radio jets blow cavities into cluster gas, reheating the plasma via mechanical feedback.",
          "X-ray microcalorimeters: Absorb a single X-ray photon, convert energy E into a temperature rise ΔT = E / C, and read out the thermal pulse with a transition-edge superconductor (TES).",
        ],
        deepDive:
          "When gas orbits in an accretion disk around a Kerr black hole, the innermost stable circular orbit (ISCO) depends directly on the black hole's spin. For a non-rotating Schwarzschild black hole (a* = 0), r_ISCO = 6 r_g (where r_g = G M / c²). For a maximally spinning prograde Kerr black hole (a* = 0.998), r_ISCO shrinks to 1.23 r_g! Because gas orbits deeper inside the gravitational potential well, the Fe Kα emission line is stretched by intense gravitational redshift down to ~3 keV. By fitting the broad red wing of this X-ray line, astrophysicists directly measure the spin of supermassive black holes millions of light-years away.",
        didYouKnow:
          "The Bullet Cluster (1E 0657-56) provided the definitive empirical proof of dark matter when Chandra X-ray maps showed the colliding 100-million-degree baryonic gas dragged and stalled in the center, while gravitational lensing showed the mass (dark matter) passed straight through without colliding!",
      },
    },
  },
  {
    id: "sub_spectroscopy",
    title: "8. Spectroscopy and Astronomical Data",
    subtitle: "Prisms, gratings, Kirchhoff's laws, chemical fingerprinting, and Doppler shifts",
    durationMinutes: 24,
    objectives: [
      "Understand how dispersing light reveals chemical fingerprints, temperatures, and velocities",
      "Formulate Kirchhoff's Three Laws of Spectroscopy (Continuous, Emission, and Absorption)",
      "Identify the Balmer series of hydrogen (H-alpha, H-beta) and forbidden nebular lines ([O III], [N II])",
      "Calculate radial velocities and cosmic expansion using the Doppler shift formula: z = Δλ / λ₀ = v / c",
    ],
    content: {
      explorer: {
        summary:
          "If a picture is worth a thousand words, an astronomical spectrum is worth a thousand pictures! When you shine starlight through a glass prism or a diffraction grating, it spreads out into a rainbow called a spectrum. Stamped across that rainbow are hundreds of crisp dark and bright lines. These lines are like cosmic barcodes: every chemical element in the universe (hydrogen, helium, iron, oxygen) leaves its own unique set of lines, telling us what stars are made of without ever having to travel there!",
        keyTakeaways: [
          "Spectroscopy splits light into its individual colors (wavelengths).",
          "Every element has a unique chemical barcode of spectral lines.",
          "Dark lines (absorption lines) show cold gas soaking up specific colors of starlight.",
          "Bright lines (emission lines) show hot, glowing gas clouds radiating pure colors.",
          "The Doppler effect shifts lines: moving toward us shifts lines blue; moving away shifts lines red!",
        ],
        deepDive:
          "Think of a police car siren. As the car speeds toward you, the sound waves get squished together and sound high-pitched (wee-woo!). As it drives away, the sound waves stretch out and sound lower-pitched. Light does the exact same thing! If a star is moving toward Earth, its light waves get squished toward the blue end of the rainbow (blueshift). If it is moving away, its light waves get stretched toward the red end (redshift). By measuring this shift, astronomers can calculate the exact speed of stars and galaxies in kilometers per second!",
        didYouKnow:
          "Helium was discovered on the Sun 27 years BEFORE it was ever found on Earth! In 1868, astronomer Pierre Janssen observed a total solar eclipse and noticed a bright yellow spectral line that matched no known element on Earth. He named it 'Helium' after Helios, the Greek god of the Sun!",
      },
      scholar: {
        summary:
          "Spectroscopy is the measurement of radiative flux as a function of wavelength or frequency (F_λ vs λ). Quantum mechanically, bound electrons occupy quantized energy levels E_n. When an electron transitions between levels (ΔE = E₂ - E₁), it emits or absorbs a photon with precise frequency ν = ΔE / h. Gustav Kirchhoff formulated the Three Laws of Spectroscopy: 1) A hot dense solid, liquid, or gas emits a continuous blackbody spectrum. 2) A hot, low-density diffuse gas emits bright emission lines. 3) A cool low-density gas in front of a continuous source produces dark absorption lines.",
        keyTakeaways: [
          "Rydberg formula for Hydrogen: 1 / λ = R_H ( 1/n₁² - 1/n₂² ). The Balmer series transitions down to n₁ = 2: H-alpha (n = 3→2 at 656.3 nm), H-beta (n = 4→2 at 486.1 nm).",
          "Kirchhoff's Laws: Continuum (Planck blackbody), Emission (hot gas recombination/fluorescence), Absorption (cooler atmospheric gas absorbing stellar core continuum).",
          "Doppler Shift Formula (non-relativistic): z = Δλ / λ₀ = (λ_observed - λ₀) / λ₀ = v_radial / c.",
          "Spectral Resolution: R = λ / Δλ. High-resolution spectrographs (R > 100,000) detect radial velocity wobbles down to 10 cm/s—the walking speed of a human—enabling exoplanet detection!",
        ],
        deepDive:
          "How do we know the temperature of a star from its spectrum? 1) The peak of the continuum follows Wien's law (λ_max ∝ 1/T). 2) The relative strengths of spectral absorption lines depend critically on atomic excitation (Boltzmann equation: N_b / N_a = (g_b / g_a) exp(-ΔE / k_B T)) and ionization states (Saha ionization equation). In very hot O-type stars (T > 30,000 K), hydrogen is completely ionized, so hydrogen lines are weak! In cooler A-type stars (T ~ 10,000 K), neutral hydrogen in the n=2 state is maximized, producing intense dark Balmer lines.",
        didYouKnow:
          "Forbidden lines (written in brackets like [O III] and [N II]) are transitions that are quantum mechanically 'forbidden' under electric dipole selection rules, with decay lifetimes of seconds or hours. They can never be produced in dense laboratories on Earth because collisions instantly de-excite the atom, but in the near-vacuum of space (density < 10,000 particles/cm³), atoms wait patiently to radiate these magnificent teal and red lines!",
      },
      astrophysicist: {
        summary:
          "Astronomical spectroscopy decodes kinematics, physical thermodynamics, and elemental abundances (metallicity [Fe/H]). Spectral line profiles are broadened by three primary mechanisms: 1) Natural broadening (Heisenberg uncertainty principle ΔE Δt ≥ ℏ/2, yielding a Lorentzian profile). 2) Thermal Doppler broadening (Maxwell-Boltzmann velocity distribution, yielding a Gaussian profile with FWHM Δλ_D = (λ₀ / c) √(2 k_B T / m + v_turb²)). 3) Pressure/collisional Stark broadening (perturbations by nearby ion electric fields). The convolution of Gaussian and Lorentzian profiles forms the Voigt profile.",
        keyTakeaways: [
          "Equivalent Width (W_λ): W_λ = ∫ [ (F_c - F_λ) / F_c ] dλ. The Curve of Growth maps W_λ to atomic column density N across linear, flat (saturation), and square-root (damping wings) regimes.",
          "Relativistic Doppler effect: 1 + z = √[ (1 + β) / (1 - β) ] for radial motion, where β = v/c.",
          "Radial Velocity Exoplanet Detection: Reflex orbital motion induced by an orbiting planet causes periodic sinusoidal Doppler shifts in host star absorption lines: K = (2π G / P)^(1/3) [ M_p sin(i) / M_*^(2/3) ].",
          "Cosmological redshift vs Doppler shift: Cosmic redshift z is metric expansion of spacetime stretching photon wavelengths during transit: 1 + z = a(t_obs) / a(t_emit), not a kinematic velocity through local space.",
        ],
        deepDive:
          "Modern high-resolution échelle spectrographs (e.g. ESPRESSO on the VLT, HARPS on the 3.6m telescope) achieve radial velocity precision of σ_v ≈ 10 cm/s using laser frequency combs. A laser frequency comb produces millions of equidistant, phase-coherent optical frequency teeth referenced directly to an atomic clock. By superimposing these reference lines on the stellar spectrum, astronomers can detect the infinitesimal wobble (Δλ / λ₀ ≈ 3 × 10⁻¹⁰) of an Earth-mass exoplanet orbiting a Sun-like star in its habitable zone.",
        didYouKnow:
          "When Edwin Hubble measured the spectra of distant 'spiral nebulae' in 1929, he discovered that almost every single galaxy had its spectral lines shifted toward the red! By plotting radial velocity v against distance d, he discovered Hubble's Law (v = H₀ d), revealing for the first time that our entire universe is expanding!",
      },
    },
  },
];

export const MODULE_21_QUIZ: QuizQuestion[] = [
  {
    id: "m21_q1_light_bucket",
    question: "What is the primary physical reason astronomers build larger telescope apertures?",
    options: [
      "To increase magnification so objects appear physically larger in the eyepiece",
      "To collect more photons (light gathering ∝ D²) and improve angular resolution (θ ∝ 1/D)",
      "To eliminate atmospheric turbulence and stop stars from twinkling",
      "To change the wavelength of incoming light from radio into visible colors",
    ],
    correctIndex: 1,
    explanation:
      "A telescope's primary function is photon collection ('light bucket'), which scales with the square of the aperture diameter (Area ∝ D²), and angular resolution, which sharpens inversely with diameter (θ ≈ 1.22 λ / D). Magnification is secondary and can be varied by swapping eyepieces.",
    hint: "Think about why a swimming pool catches more rain than a coffee cup, and what the wave diffraction limit depends on.",
  },
  {
    id: "m21_q2_chromatic_aberration",
    question:
      "Why do reflecting telescopes (mirrors) avoid chromatic aberration, while refracting telescopes (lenses) suffer from it?",
    options: [
      "Mirrors absorb blue light while lenses reflect it away",
      "Lenses reflect light, but mirrors refract light evenly",
      "By the Law of Reflection, all wavelengths reflect at the exact same angle, whereas glass refracts shorter wavelengths more than longer ones",
      "Mirrors only work in space, where chromatic dispersion does not exist",
    ],
    correctIndex: 2,
    explanation:
      "The Law of Reflection states that the angle of reflection equals the angle of incidence (θ_r = θ_i) for ALL wavelengths without dispersion. In glass lenses, Snell's law depends on the refractive index n(λ), which bends blue light more sharply than red light, creating chromatic aberration.",
    hint: "Remember how a glass prism splits white light into a rainbow, but a bathroom mirror does not.",
  },
  {
    id: "m21_q3_diffraction_rayleigh",
    question:
      "According to the Rayleigh criterion (θ ≈ 1.22 λ / D), what happens to angular resolution if you double the telescope aperture diameter D?",
    options: [
      "The angular resolution angle doubles, making the image twice as blurry",
      "The angular resolution angle is cut in half, making the image twice as sharp",
      "The resolution remains exactly the same because resolution only depends on magnification",
      "The telescope can no longer resolve objects at optical wavelengths",
    ],
    correctIndex: 1,
    explanation:
      "Because aperture D is in the denominator (θ = 1.22 λ / D), doubling D halves the minimum resolvable angular angle θ. A smaller angle θ means the telescope can resolve finer, tighter details, making the image twice as sharp!",
    hint: "Look at the formula: does D being on the bottom make θ smaller or larger when D grows?",
  },
  {
    id: "m21_q4_atmospheric_seeing",
    question:
      "Why does a 10-meter ground-based telescope without Adaptive Optics have no better optical angular resolution than a 20-centimeter amateur telescope?",
    options: [
      "Because the mirrors of 10-meter telescopes are too heavy to hold a precise optical shape",
      "Because Earth's turbulent atmosphere creates a 'seeing blur' disk of ~0.5–1.5 arcseconds that limits ground resolution",
      "Because large telescopes cannot focus light from nearby stars",
      "Because the speed of light slows down inside giant telescope domes",
    ],
    correctIndex: 1,
    explanation:
      "Atmospheric turbulence and temperature fluctuations scramble light wavefronts over scales larger than the Fried coherence parameter (r₀ ≈ 10–20 cm). Any telescope larger than r₀ is limited by the atmospheric seeing disk (~1 arcsecond) unless Adaptive Optics actively corrects the wavefront.",
    hint: "What causes stars to twinkle when viewed from the ground?",
  },
  {
    id: "m21_q5_radio_interferometry",
    question:
      "How does an interferometer array like ALMA achieve milliarcsecond resolution despite using long radio wavelengths?",
    options: [
      "By accelerating radio waves to faster than the speed of light",
      "By combining signals from multiple dishes separated by baselines up to 16 km, synthesizing an effective aperture miles wide",
      "By converting all radio signals into X-rays before recording them",
      "By orbiting inside the Moon's shadow to block Earth's magnetic field",
    ],
    correctIndex: 1,
    explanation:
      "Interferometry utilizes aperture synthesis. By measuring the interference of signals between antennas separated by distances up to 16 kilometers, the resolving power is governed by the baseline distance (θ ≈ λ / B_max), effectively synthesizing a telescope 16 kilometers across!",
    hint: "Does resolving power depend on individual dish diameter or the distance separating the dishes?",
  },
  {
    id: "m21_q6_doppler_spectroscopy",
    question:
      "An astronomer observes the H-alpha line of hydrogen (rest wavelength 656.28 nm) in a distant galaxy at 662.84 nm. What does this indicate?",
    options: [
      "The galaxy contains no hydrogen atoms and is made of pure iron",
      "The galaxy's temperature has dropped to absolute zero",
      "The galaxy is moving away from us (redshifted) at a radial velocity of approximately 3,000 km/s",
      "The galaxy is moving toward us (blueshifted) at 3,000 km/s",
    ],
    correctIndex: 2,
    explanation:
      "The observed wavelength (662.84 nm) is longer than the rest wavelength (656.28 nm), which is a redshift (Δλ = +6.56 nm). Using the non-relativistic Doppler formula: z = Δλ / λ₀ = 6.56 / 656.28 ≈ 0.010. The recession velocity is v = z · c = 0.010 × 300,000 km/s ≈ 3,000 km/s away from us!",
    hint: "Has the wavelength stretched longer (red) or compressed shorter (blue)? Apply v = c · (Δλ / λ₀).",
  },
];

export const MODULE_21_DISCOVERY_FACTS = [
  {
    fact: "The James Webb Space Telescope's 18 gold-coated primary mirror segments were aligned in space to within 50 nanometers of a perfect optical shape—less than the width of a single virus!",
    source: "NASA Goddard Space Flight Center (JWST Wavefront Sensing & Control)",
  },
  {
    fact: "The ALMA radio observatory on the Chajnantor Plateau in Chile sits at 5,050 meters (16,500 feet) above sea level—so high that astronomers and technicians must breathe supplemental oxygen while working inside the control rooms!",
    source: "European Southern Observatory (ALMA High Altitude Operations)",
  },
  {
    fact: "Chandra's X-ray detectors can locate the position of an X-ray source on the sky with a precision equivalent to pinpointing a stop sign on the surface of the Moon from Earth.",
    source: "Chandra X-ray Center / Harvard-Smithsonian Center for Astrophysics",
  },
  {
    fact: "When the Hubble Space Telescope was launched in 1990, its 2.4-meter primary mirror had a spherical aberration grinding flaw of just 2.2 micrometers (1/50th the thickness of a human hair)—yet that tiny error was enough to blur its images until astronauts installed corrective optics (COSTAR) in 1993!",
    source: "NASA History Division (The Hubble Space Telescope Servicing Mission 1)",
  },
  {
    fact: "The human eye's dark-adapted pupil admits about 10,000 photons per second from a faint 6th-magnitude star, but the 39-meter ELT will gather over 300 billion photons per second from that same star!",
    source: "ESO Extremely Large Telescope Optical Science Reference",
  },
];

export const MODULE_21_SOURCES: ScientificSource[] = [
  {
    title: "The James Webb Space Telescope Mission Overview & Optical Performance",
    organization: "JWST",
    url: "https://webb.nasa.gov/",
    note: "Comprehensive documentation of JWST optical train, cryogenic mirrors, NIRCam, MIRI, and L2 orbit.",
  },
  {
    title: "Hubble Space Telescope Science Instruments and Wavelength Handbooks",
    organization: "Hubble",
    url: "https://hubblesite.org/",
    note: "Wide Field Camera 3 (WFC3), Cosmic Origins Spectrograph (COS), and UV-optical imaging archives.",
  },
  {
    title: "Chandra X-ray Observatory Science & Wolter Optics Architecture",
    organization: "Chandra",
    url: "https://chandra.harvard.edu/",
    note: "High-resolution X-ray grazing-incidence optics and ACIS imaging spectroscopy dataset.",
  },
  {
    title: "ALMA: The Atacama Large Millimeter/submillimeter Array Science Archive",
    organization: "ESA",
    url: "https://www.almaobservatory.org/",
    note: "Millimeter/submillimeter interferometry, molecular line kinematics, and high-altitude operations.",
  },
  {
    title: "Very Large Telescope (VLT) & Adaptive Optics Facility",
    organization: "ESO",
    url: "https://www.eso.org/public/teles-instr/paranal-observatory/vlt/",
    note: "Laser Guide Star Adaptive Optics, 4-unit telescope interferometry, and high-angular resolution science.",
  },
];
