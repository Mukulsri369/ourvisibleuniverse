import type { LessonModule, ScientificSource } from "../types";

export interface EvolutionaryStage {
  id: string;
  name: string;
  phaseLabel: string;
  timeFraction: number; // 0.0 to 1.0 for scrubber
  typicalAgeMyr: number; // Age from time zero in millions of years
  ageDisplay: string;
  radiusSolar: number; // in R_sun
  surfaceTempK: number;
  luminositySolar: number; // in L_sun
  colorHex: string;
  glowColor: string;
  coreProcess: string;
  description: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  cutawayLayers: Array<{
    name: string;
    composition: string;
    reaction: string;
    temperatureK: string;
    thicknessPct: number;
    color: string;
  }>;
  visualType:
    | "cloud"
    | "protostar"
    | "main_sequence"
    | "giant"
    | "supergiant"
    | "planetary_nebula"
    | "supernova"
    | "white_dwarf"
    | "neutron_star"
    | "black_hole";
}

export interface StellarEvolutionTrack {
  id: string;
  name: string;
  initialMassSolar: number;
  spectralType: string;
  exampleStar: string;
  tagline: string;
  totalLifetimeMyr: number;
  lifetimeDisplay: string;
  finalRemnant: string;
  remnantMassSolar: number;
  stages: EvolutionaryStage[];
  fateSummary: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  nucleosynthesisYield: string[];
}

export const STELLAR_TRACKS: Record<string, StellarEvolutionTrack> = {
  low_mass: {
    id: "low_mass",
    name: "Red Dwarf Star (0.2 M☉)",
    initialMassSolar: 0.2,
    spectralType: "M5V",
    exampleStar: "Proxima Centauri / Barnard's Star",
    tagline: "Ultra-long-lived, fully convective faint red dwarf",
    totalLifetimeMyr: 1000000, // ~1,000,000 Myr = 1 Trillion years
    lifetimeDisplay: "1,000 – 5,000 Billion Years (1–5 Trillion Years)",
    finalRemnant: "Helium White Dwarf (theoretical)",
    remnantMassSolar: 0.2,
    stages: [
      {
        id: "lm_cloud",
        name: "Cold Molecular Cloud",
        phaseLabel: "Birth & Collapse",
        timeFraction: 0.0,
        typicalAgeMyr: 0,
        ageDisplay: "0 Myr",
        radiusSolar: 1000,
        surfaceTempK: 20,
        luminositySolar: 0.001,
        colorHex: "#3b82f6",
        glowColor: "rgba(59, 130, 246, 0.4)",
        coreProcess: "Jeans gravitational fragmentation in dense cold Bok globule",
        description: {
          junior:
            "A giant fluffy cloud of cold space dust and gas begins to pull together with gravity.",
          explorer:
            "A small fragment of a giant molecular cloud exceeds the Jeans mass and starts collapsing under its own gravity.",
          astronomer:
            "Isothermal gravitational contraction of an interstellar gas clump; dust grains radiate away gravitational potential energy as submillimeter infrared.",
        },
        cutawayLayers: [
          {
            name: "Gas Envelope",
            composition: "H2 (74%), He (24%), Dust (2%)",
            reaction: "None (Gravitational Free-Fall)",
            temperatureK: "10 – 30 K",
            thicknessPct: 100,
            color: "#1e3a8a",
          },
        ],
        visualType: "cloud",
      },
      {
        id: "lm_proto",
        name: "Low-Mass Protostar",
        phaseLabel: "Kelvin-Helmholtz Contraction",
        timeFraction: 0.05,
        typicalAgeMyr: 100,
        ageDisplay: "100 Myr",
        radiusSolar: 1.5,
        surfaceTempK: 2800,
        luminositySolar: 0.1,
        colorHex: "#f97316",
        glowColor: "rgba(249, 115, 22, 0.5)",
        coreProcess: "Gravitational heating and Deuterium burning",
        description: {
          junior: "The baby star heats up like a warm ember as space dust falls onto it.",
          explorer:
            "A baby star glows from compression heat as an accretion disk feeds it before core hydrogen fusion begins.",
          astronomer:
            "Convective Hayashi track contraction; central temperature climbs past 10^6 K, burning trace deuterium before reaching hydrogen ignition threshold.",
        },
        cutawayLayers: [
          {
            name: "Convective Core",
            composition: "Ionized H & He",
            reaction: "Deuterium fusion (trace)",
            temperatureK: "1.5 × 10^6 K",
            thicknessPct: 40,
            color: "#ea580c",
          },
          {
            name: "Outer Infalling Envelope",
            composition: "Molecular Gas & Dust",
            reaction: "Accretion shock",
            temperatureK: "3,000 K",
            thicknessPct: 60,
            color: "#c2410c",
          },
        ],
        visualType: "protostar",
      },
      {
        id: "lm_main",
        name: "Convective Main Sequence",
        phaseLabel: "Long-Lived Equilibrium",
        timeFraction: 0.5,
        typicalAgeMyr: 500000,
        ageDisplay: "500,000 Myr (500 Billion Years)",
        radiusSolar: 0.22,
        surfaceTempK: 3100,
        luminositySolar: 0.0015,
        colorHex: "#ef4444",
        glowColor: "rgba(239, 68, 68, 0.6)",
        coreProcess: "Proton-proton I chain with 100% convective fuel circulation",
        description: {
          junior:
            "A gentle red star burns its fuel so slowly that it will shine for trillions of years without running out!",
          explorer:
            "Because the whole star churns like boiling water, it uses almost 100% of its hydrogen fuel over trillions of years.",
          astronomer:
            "Fully convective interior maintains homogeneous elemental distribution, preventing an inert helium core from forming during main sequence lifetime.",
        },
        cutawayLayers: [
          {
            name: "Convective Core",
            composition: "H (60%) -> He (40%)",
            reaction: "p-p I Chain Fusion",
            temperatureK: "6.5 × 10^6 K",
            thicknessPct: 50,
            color: "#dc2626",
          },
          {
            name: "Convective Envelope",
            composition: "Hydrogen plasma",
            reaction: "Continuous turnover",
            temperatureK: "3,100 K",
            thicknessPct: 50,
            color: "#b91c1c",
          },
        ],
        visualType: "main_sequence",
      },
      {
        id: "lm_blue",
        name: "Helium Blue Dwarf (Hypothetical)",
        phaseLabel: "Late Fuel Exhaustion",
        timeFraction: 0.9,
        typicalAgeMyr: 1000000,
        ageDisplay: "1,000,000 Myr (1 Trillion Years)",
        radiusSolar: 0.15,
        surfaceTempK: 6000,
        luminositySolar: 0.005,
        colorHex: "#60a5fa",
        glowColor: "rgba(96, 165, 250, 0.6)",
        coreProcess: "Final hydrogen burning in pure helium-rich atmosphere",
        description: {
          junior:
            "At the very end of its long life, the star gets slightly hotter and bluer as its hydrogen runs low.",
          explorer:
            "As hydrogen runs out and helium dominates, the star contracts and warms up to become a temporary blue dwarf.",
          astronomer:
            "With mean molecular weight μ rising toward 1.34, radiative opacity drops, driving surface temperature up to ~6,000 K without swelling into a giant.",
        },
        cutawayLayers: [
          {
            name: "Helium Core",
            composition: "Nearly pure 4He",
            reaction: "Final p-p burning shell",
            temperatureK: "1.2 × 10^7 K",
            thicknessPct: 70,
            color: "#3b82f6",
          },
          {
            name: "Residual H Atmosphere",
            composition: "Hydrogen trace",
            reaction: "None",
            temperatureK: "6,000 K",
            thicknessPct: 30,
            color: "#1d4ed8",
          },
        ],
        visualType: "main_sequence",
      },
      {
        id: "lm_remnant",
        name: "Helium White Dwarf",
        phaseLabel: "Cold Degenerate Core",
        timeFraction: 1.0,
        typicalAgeMyr: 1200000,
        ageDisplay: ">1,200,000 Myr",
        radiusSolar: 0.015,
        surfaceTempK: 8000,
        luminositySolar: 0.0001,
        colorHex: "#e0f2fe",
        glowColor: "rgba(224, 242, 254, 0.5)",
        coreProcess: "None; electron degeneracy pressure balances gravity",
        description: {
          junior: "The star cools down forever as a tiny, dense crystal sphere in the dark.",
          explorer:
            "No explosion happens. The star simply shrinks into a quiet helium white dwarf that slowly cools off over cosmic time.",
          astronomer:
            "Direct contraction into an electron-degenerate Helium white dwarf with zero planetary nebula ejection and no core-collapse.",
        },
        cutawayLayers: [
          {
            name: "Degenerate Helium Core",
            composition: "Degenerate 4He + Electrons",
            reaction: "No fusion (Fermi Dirac degenerate gas)",
            temperatureK: "5 × 10^6 K (cooling)",
            thicknessPct: 90,
            color: "#7dd3fc",
          },
          {
            name: "Thin Atmosphere",
            composition: "He / trace H",
            reaction: "Blackbody emission",
            temperatureK: "8,000 K",
            thicknessPct: 10,
            color: "#bae6fd",
          },
        ],
        visualType: "white_dwarf",
      },
    ],
    fateSummary: {
      junior:
        "Red dwarfs live the longest of all stars. They never explode and never turn into red giants!",
      explorer:
        "Red dwarfs burn so slowly and circulate fuel so efficiently that not a single one has died since the universe began 13.8 billion years ago.",
      astronomer:
        "Sub-solar stars with M < 0.35 M☉ are fully convective throughout their main sequence, bypassing the red giant phase entirely and ending as helium white dwarfs.",
    },
    nucleosynthesisYield: ["Helium-4"],
  },

  sun_like: {
    id: "sun_like",
    name: "Sun-like Star (1.0 M☉)",
    initialMassSolar: 1.0,
    spectralType: "G2V",
    exampleStar: "The Sun / Alpha Centauri A",
    tagline: "Our star's true destiny: Red Giant, Helium Flash, and Planetary Nebula",
    totalLifetimeMyr: 11000, // ~11 Billion Years
    lifetimeDisplay: "10,000 – 12,000 Million Years (10–12 Billion Years)",
    finalRemnant: "Carbon-Oxygen White Dwarf & Planetary Nebula",
    remnantMassSolar: 0.55,
    stages: [
      {
        id: "sun_cloud",
        name: "Solar Molecular Cloud",
        phaseLabel: "Birth & Collapse",
        timeFraction: 0.0,
        typicalAgeMyr: 0,
        ageDisplay: "0 Myr",
        radiusSolar: 5000,
        surfaceTempK: 25,
        luminositySolar: 0.01,
        colorHex: "#60a5fa",
        glowColor: "rgba(96, 165, 250, 0.4)",
        coreProcess: "Jeans collapse in molecular gas clump triggered by nearby shockwave",
        description: {
          junior:
            "Our solar system started 4.6 billion years ago as a cold cloud of gas and stardust.",
          explorer:
            "A spinning cloud of hydrogen and cosmic dust collapses, flattening into a solar nebula with a central bulge.",
          astronomer:
            "Turbulent collapse in an interstellar molecular cloud core (T ~ 15 K) following Jeans instability criteria.",
        },
        cutawayLayers: [
          {
            name: "Collapsing Molecular Envelope",
            composition: "H2 (73%), He (25%), Metals (2%)",
            reaction: "Gravitational free fall",
            temperatureK: "15 – 50 K",
            thicknessPct: 100,
            color: "#1e40af",
          },
        ],
        visualType: "cloud",
      },
      {
        id: "sun_proto",
        name: "T Tauri Protostar",
        phaseLabel: "Pre-Main Sequence",
        timeFraction: 0.02,
        typicalAgeMyr: 50,
        ageDisplay: "50 Myr",
        radiusSolar: 2.2,
        surfaceTempK: 4400,
        luminositySolar: 3.5,
        colorHex: "#fb923c",
        glowColor: "rgba(251, 146, 60, 0.6)",
        coreProcess: "Kelvin-Helmholtz gravitational compression; clearing protoplanetary disk",
        description: {
          junior:
            "The young Sun was bright orange and blew violent winds that helped sculpt the newborn planets.",
          explorer:
            "A young protostar surrounded by a swirling disk of rocks and gas, shooting jets of matter into deep space.",
          astronomer:
            "Pre-main-sequence T Tauri stage with bipolar outflows and magnetospheric accretion shocks before core hydrogen ignition.",
        },
        cutawayLayers: [
          {
            name: "Radiative / Convective Core",
            composition: "Ionized gas",
            reaction: "Gravitational compression",
            temperatureK: "8 × 10^6 K",
            thicknessPct: 45,
            color: "#ea580c",
          },
          {
            name: "Accreting Envelope",
            composition: "Gas & Dust",
            reaction: "Strong stellar wind",
            temperatureK: "4,400 K",
            thicknessPct: 55,
            color: "#c2410c",
          },
        ],
        visualType: "protostar",
      },
      {
        id: "sun_main",
        name: "Main Sequence (Current Sun)",
        phaseLabel: "Hydrogen Core Fusion",
        timeFraction: 0.5,
        typicalAgeMyr: 4600,
        ageDisplay: "4,600 Myr (Current Age)",
        radiusSolar: 1.0,
        surfaceTempK: 5778,
        luminositySolar: 1.0,
        colorHex: "#fbbf24",
        glowColor: "rgba(251, 191, 36, 0.6)",
        coreProcess: "p-p I and p-p II chains fusing 600 million tons of H per second into He",
        description: {
          junior:
            "Right now, the Sun is in the prime of its life, shining warm yellow and keeping Earth alive.",
          explorer:
            "Hydrostatic balance: the inward crush of gravity exactly balances outward radiation pressure from nuclear fusion.",
          astronomer:
            "Stable core hydrogen fusion via the proton-proton chain at central density 150 g/cm³ and T_c = 1.57 × 10^7 K.",
        },
        cutawayLayers: [
          {
            name: "Fusion Core",
            composition: "H (35%) -> He (65% ash)",
            reaction: "p-p Chain (4 1H -> 4He + 26.7 MeV)",
            temperatureK: "1.57 × 10^7 K",
            thicknessPct: 25,
            color: "#f59e0b",
          },
          {
            name: "Radiative Zone",
            composition: "Ionized H & He",
            reaction: "Photon scattering (100,000 yr travel)",
            temperatureK: "7 × 10^6 K",
            thicknessPct: 45,
            color: "#d97706",
          },
          {
            name: "Convective Zone",
            composition: "Circulating plasma",
            reaction: "Thermal convection cells",
            temperatureK: "2 × 10^6 K to 5,778 K",
            thicknessPct: 30,
            color: "#b45309",
          },
        ],
        visualType: "main_sequence",
      },
      {
        id: "sun_red_giant",
        name: "Red Giant Branch (RGB)",
        phaseLabel: "Hydrogen Shell Burning",
        timeFraction: 0.85,
        typicalAgeMyr: 10500,
        ageDisplay: "10,500 Myr (+5.9 Gyr from today)",
        radiusSolar: 160.0,
        surfaceTempK: 3100,
        luminositySolar: 2200,
        colorHex: "#ef4444",
        glowColor: "rgba(239, 68, 68, 0.7)",
        coreProcess: "Inert degenerate Helium core surrounded by furiously burning Hydrogen shell",
        description: {
          junior:
            "The dying Sun swells so huge it engulfs Mercury and Venus, turning deep red and cool on its surface.",
          explorer:
            "With core hydrogen spent, the core shrinks while the outer envelope expands hundreds of times its normal size.",
          astronomer:
            "Core helium becomes electron-degenerate. The mirror principle expands the envelope to ~1.1 AU; luminosity climbs past 2,000 L☉.",
        },
        cutawayLayers: [
          {
            name: "Degenerate Helium Core",
            composition: "Pure 4He ash",
            reaction: "None (awaiting Helium Flash)",
            temperatureK: "1.0 × 10^8 K",
            thicknessPct: 15,
            color: "#dc2626",
          },
          {
            name: "Hydrogen Burning Shell",
            composition: "Hydrogen plasma",
            reaction: "Intense CNO / p-p shell fusion",
            temperatureK: "4 × 10^7 K",
            thicknessPct: 10,
            color: "#f87171",
          },
          {
            name: "Distended Convective Envelope",
            composition: "Low-density plasma",
            reaction: "Deep convective dredge-up",
            temperatureK: "3,100 K",
            thicknessPct: 75,
            color: "#991b1b",
          },
        ],
        visualType: "giant",
      },
      {
        id: "sun_helium_flash",
        name: "Helium Flash & Horizontal Branch",
        phaseLabel: "Helium Core Burning",
        timeFraction: 0.92,
        typicalAgeMyr: 10600,
        ageDisplay: "10,600 Myr",
        radiusSolar: 10.0,
        surfaceTempK: 4800,
        luminositySolar: 45,
        colorHex: "#f59e0b",
        glowColor: "rgba(245, 158, 11, 0.6)",
        coreProcess: "Triple-alpha process (3 4He -> 12C) burning stably in the core",
        description: {
          junior:
            "Helium ignites with a silent flash inside the core! The Sun shrinks back down and turns orange-yellow.",
          explorer:
            "Helium fuses into carbon via the triple-alpha process, stabilizing the star on the horizontal branch for ~100 million years.",
          astronomer:
            "Runaway thermal helium ignition under electron degeneracy (Helium Flash), lifting degeneracy and settling into stable horizontal branch helium burning.",
        },
        cutawayLayers: [
          {
            name: "Helium Fusing Core",
            composition: "He (40%) -> C & O (60%)",
            reaction: "Triple-Alpha (3 4He -> 12C)",
            temperatureK: "1.2 × 10^8 K",
            thicknessPct: 20,
            color: "#eab308",
          },
          {
            name: "Hydrogen Shell",
            composition: "Hydrogen",
            reaction: "Quiescent shell fusion",
            temperatureK: "3 × 10^7 K",
            thicknessPct: 15,
            color: "#facc15",
          },
          {
            name: "Stellar Envelope",
            composition: "Plasma",
            reaction: "Convective transport",
            temperatureK: "4,800 K",
            thicknessPct: 65,
            color: "#ca8a04",
          },
        ],
        visualType: "giant",
      },
      {
        id: "sun_planetary_nebula",
        name: "Planetary Nebula Ejection",
        phaseLabel: "Envelope Expulsion",
        timeFraction: 0.98,
        typicalAgeMyr: 10700,
        ageDisplay: "10,700 Myr",
        radiusSolar: 50000,
        surfaceTempK: 120000,
        luminositySolar: 4000,
        colorHex: "#06b6d4",
        glowColor: "rgba(6, 182, 212, 0.7)",
        coreProcess: "Thermal pulses eject outer envelope; central white dwarf ionizes glowing gas",
        description: {
          junior:
            "The Sun puffs off its colorful outer layers into a gorgeous glowing cosmic smoke ring like the Ring Nebula!",
          explorer:
            "Thermal pulses blow off the entire outer atmosphere, revealing a scorching central white dwarf that makes the gas glow emerald and cyan.",
          astronomer:
            "AGB superwind ejects ~0.4 M☉ of material at 20 km/s. The bare degenerate CO core (T_eff > 100,000 K) emits Lyman continuum UV, exciting [O III] and H-alpha emission lines.",
        },
        cutawayLayers: [
          {
            name: "Bare Degenerate Core",
            composition: "Carbon & Oxygen",
            reaction: "Fusion ceased",
            temperatureK: "1.2 × 10^5 K",
            thicknessPct: 5,
            color: "#38bdf8",
          },
          {
            name: "Expanding Nebular Shell",
            composition: "Ionized H, He, C, N, O",
            reaction: "Fluorescence ([O III] 5007 Å)",
            temperatureK: "10,000 K",
            thicknessPct: 95,
            color: "#0891b2",
          },
        ],
        visualType: "planetary_nebula",
      },
      {
        id: "sun_white_dwarf",
        name: "Carbon-Oxygen White Dwarf",
        phaseLabel: "Final Compact Remnant",
        timeFraction: 1.0,
        typicalAgeMyr: 12000,
        ageDisplay: ">12,000 Myr (Forever)",
        radiusSolar: 0.009, // Earth sized!
        surfaceTempK: 25000,
        luminositySolar: 0.001,
        colorHex: "#f0fdf4",
        glowColor: "rgba(240, 253, 244, 0.6)",
        coreProcess: "Electron degeneracy pressure balances gravity. No fusion.",
        description: {
          junior:
            "The remaining core is about the size of Earth but weighs as much as 200,000 Earths! It will slowly cool down forever.",
          explorer:
            "The Sun will NEVER explode as a supernova. It leaves behind an Earth-sized diamond-like white dwarf supported by quantum electron degeneracy.",
          astronomer:
            "Final cooling track of a ~0.55 M☉ carbon-oxygen white dwarf, supported by non-relativistic electron degeneracy pressure with ρ_c ~ 10^6 g/cm³.",
        },
        cutawayLayers: [
          {
            name: "Degenerate C-O Core",
            composition: "Carbon-12 & Oxygen-16",
            reaction: "No fusion (crystallizing into lattice)",
            temperatureK: "10^7 K (cooling)",
            thicknessPct: 95,
            color: "#e2e8f0",
          },
          {
            name: "Helium/Hydrogen Skin",
            composition: "Trace H/He atmosphere",
            reaction: "Pure thermal cooling",
            temperatureK: "25,000 K",
            thicknessPct: 5,
            color: "#f8fafc",
          },
        ],
        visualType: "white_dwarf",
      },
    ],
    fateSummary: {
      junior:
        "The Sun will become a Red Giant, puff off a beautiful Planetary Nebula, and end as an Earth-sized White Dwarf. It will NOT explode!",
      explorer:
        "Because the Sun has only 1.0 solar mass, its core will never get hot enough to fuse carbon. It will never become a supernova or black hole.",
      astronomer:
        "Stars with initial mass 0.8 < M < 8 M☉ shed their envelopes during the asymptotic giant branch (AGB) via thermal pulses and end as carbon-oxygen white dwarfs well below the Chandrasekhar limit of 1.44 M☉.",
    },
    nucleosynthesisYield: [
      "Helium-4",
      "Carbon-12",
      "Nitrogen-14",
      "Oxygen-16",
      "s-process elements (Barium, Lead)",
    ],
  },

  high_mass: {
    id: "high_mass",
    name: "Massive Star (15 M☉)",
    initialMassSolar: 15.0,
    spectralType: "B1V",
    exampleStar: "Spica / Rigel / Betelgeuse Progenitor",
    tagline: "Live fast, die young: Onion-skin fusion, Core Collapse Supernova & Pulsar",
    totalLifetimeMyr: 13.5, // ~13.5 Million Years!
    lifetimeDisplay: "12 – 15 Million Years",
    finalRemnant: "Neutron Star (Pulsar) & Supernova Remnant",
    remnantMassSolar: 1.4,
    stages: [
      {
        id: "hm_cloud",
        name: "Massive Giant Molecular Core",
        phaseLabel: "Rapid Collapse",
        timeFraction: 0.0,
        typicalAgeMyr: 0,
        ageDisplay: "0 Myr",
        radiusSolar: 10000,
        surfaceTempK: 30,
        luminositySolar: 10,
        colorHex: "#38bdf8",
        glowColor: "rgba(56, 189, 248, 0.4)",
        coreProcess: "High-density gravitational collapse in Orion-like giant molecular cloud",
        description: {
          junior: "A colossal, freezing cloud collapses quickly under intense gravitational pull.",
          explorer:
            "Huge reservoirs of gas crush together in just a few hundred thousand years to spawn an astronomical heavyweight.",
          astronomer:
            "Massive star formation triggered in turbulent OB associations; high accretion rates (>10^-4 M☉/yr) overcome severe radiation feedback.",
        },
        cutawayLayers: [
          {
            name: "Massive Infalling Cloud",
            composition: "H2, He, Dust grains",
            reaction: "Rapid dynamical collapse",
            temperatureK: "20 – 100 K",
            thicknessPct: 100,
            color: "#0369a1",
          },
        ],
        visualType: "cloud",
      },
      {
        id: "hm_main",
        name: "Blue-White Main Sequence",
        phaseLabel: "CNO Cycle Core Burning",
        timeFraction: 0.7,
        typicalAgeMyr: 10.0,
        ageDisplay: "10.0 Myr",
        radiusSolar: 6.8,
        surfaceTempK: 28000,
        luminositySolar: 28000,
        colorHex: "#93c5fd",
        glowColor: "rgba(147, 197, 253, 0.8)",
        coreProcess: "CNO cycle burning hydrogen at temperatures >30 million Kelvin",
        description: {
          junior:
            "A dazzling blue giant burns furiously hot and uses up its fuel hundreds of times faster than our Sun!",
          explorer:
            "Fusing hydrogen via the catalytic CNO cycle, the star shines 28,000 times brighter than the Sun and lives only 12 million years.",
          astronomer:
            "High core temperature (T_c ~ 3.5 × 10^7 K) makes CNO cycle dominate; radiation pressure contributes significantly to hydrostatic balance.",
        },
        cutawayLayers: [
          {
            name: "Convective CNO Core",
            composition: "H -> He via C-N-O catalysts",
            reaction: "CNO Cycle (12C, 13N, 13C, 14N, 15O)",
            temperatureK: "3.5 × 10^7 K",
            thicknessPct: 35,
            color: "#60a5fa",
          },
          {
            name: "Radiative Envelope",
            composition: "Ionized plasma",
            reaction: "Electron scattering opacity",
            temperatureK: "1.5 × 10^7 K",
            thicknessPct: 65,
            color: "#3b82f6",
          },
        ],
        visualType: "main_sequence",
      },
      {
        id: "hm_supergiant",
        name: "Red Supergiant (Onion-Skin)",
        phaseLabel: "Advanced Shell Burning",
        timeFraction: 0.95,
        typicalAgeMyr: 13.0,
        ageDisplay: "13.0 Myr",
        radiusSolar: 850.0, // Jupiter's orbit!
        surfaceTempK: 3500,
        luminositySolar: 100000,
        colorHex: "#dc2626",
        glowColor: "rgba(220, 38, 38, 0.8)",
        coreProcess: "Concentric fusion shells: H -> He -> C -> Ne -> O -> Si -> Fe core",
        description: {
          junior:
            "The star swells into a monster like Betelgeuse! Inside, it looks like an onion with layers cooking different elements.",
          explorer:
            "The core reaches billions of degrees, forging carbon, neon, oxygen, silicon, and finally an inert iron core.",
          astronomer:
            "Photodisintegration and alpha network burning. Silicon burns at T > 3 × 10^9 K in just 1 day, synthesizing an iron-group core with zero net fusion yield.",
        },
        cutawayLayers: [
          {
            name: "Iron-56 Core",
            composition: "56Fe, 56Ni (Nuclear dead-end)",
            reaction: "NO FUSION (Endothermic collapse)",
            temperatureK: "4.0 × 10^9 K",
            thicknessPct: 10,
            color: "#475569",
          },
          {
            name: "Silicon Shell",
            composition: "Silicon-28 -> Nickel-56",
            reaction: "Alpha network fusion (lasts 1 day!)",
            temperatureK: "3.0 × 10^9 K",
            thicknessPct: 10,
            color: "#a855f7",
          },
          {
            name: "Oxygen Shell",
            composition: "Oxygen-16 -> Silicon-28",
            reaction: "16O + 16O fusion (lasts 6 months)",
            temperatureK: "1.8 × 10^9 K",
            thicknessPct: 12,
            color: "#3b82f6",
          },
          {
            name: "Neon / Carbon Shells",
            composition: "Carbon-12 & Neon-20",
            reaction: "Carbon burning (lasts 600 years)",
            temperatureK: "8.0 × 10^8 K",
            thicknessPct: 15,
            color: "#22c55e",
          },
          {
            name: "Helium Shell",
            composition: "Helium-4 -> Carbon",
            reaction: "Triple-alpha (lasts 500,000 years)",
            temperatureK: "2.0 × 10^8 K",
            thicknessPct: 18,
            color: "#eab308",
          },
          {
            name: "Hydrogen Burning Shell",
            composition: "Hydrogen -> Helium",
            reaction: "CNO shell fusion",
            temperatureK: "5.0 × 10^7 K",
            thicknessPct: 15,
            color: "#f97316",
          },
          {
            name: "Massive Pulsating Envelope",
            composition: "Hydrogen gas",
            reaction: "Mass loss winds (10^-5 M☉/yr)",
            temperatureK: "3,500 K",
            thicknessPct: 20,
            color: "#b91c1c",
          },
        ],
        visualType: "supergiant",
      },
      {
        id: "hm_supernova",
        name: "Core-Collapse Supernova (Type II)",
        phaseLabel: "Catastrophic Explosion",
        timeFraction: 0.99,
        typicalAgeMyr: 13.5,
        ageDisplay: "13.5 Myr (Peak Day 20)",
        radiusSolar: 100000,
        surfaceTempK: 20000,
        luminositySolar: 5000000000, // 5 Billion L_sun!
        colorHex: "#facc15",
        glowColor: "rgba(250, 204, 21, 0.9)",
        coreProcess:
          "Electron capture, neutronization, neutrino shock breakout, r-process nucleosynthesis",
        description: {
          junior:
            "KABOOM! The core collapses in a fraction of a second and blows the whole star apart, outshining an entire galaxy!",
          explorer:
            "Iron cannot fuse. The core collapses into pure neutrons in milliseconds, rebounding a titanic shockwave that creates gold, silver, and platinum.",
          astronomer:
            "Core exceeds Chandrasekhar mass; e- + p -> n + nu_e collapse to nuclear density (3 × 10^14 g/cm³). Infalling shock rebounds with 10^51 ergs driven by neutrino heating.",
        },
        cutawayLayers: [
          {
            name: "Nascent Proto-Neutron Star",
            composition: "Ultra-dense nuclear matter",
            reaction: "Neutron degeneracy bounce",
            temperatureK: "10^11 K",
            thicknessPct: 5,
            color: "#f8fafc",
          },
          {
            name: "Supernova Shock Blast",
            composition: "Iron, Gold, Uranium, Oxygen",
            reaction: "Rapid neutron capture (r-process)",
            temperatureK: "10^9 K",
            thicknessPct: 95,
            color: "#f59e0b",
          },
        ],
        visualType: "supernova",
      },
      {
        id: "hm_remnant",
        name: "Neutron Star / Pulsar",
        phaseLabel: "Compact Extreme Remnant",
        timeFraction: 1.0,
        typicalAgeMyr: 14.0,
        ageDisplay: ">14 Myr (Remnant)",
        radiusSolar: 0.000015, // 10-12 km radius!
        surfaceTempK: 1000000,
        luminositySolar: 0.1,
        colorHex: "#38bdf8",
        glowColor: "rgba(56, 189, 248, 0.8)",
        coreProcess: "Neutron degeneracy pressure balances gravity. Spin period: 1 ms - 10 s.",
        description: {
          junior:
            "A city-sized ball of pure neutrons spins hundreds of times per second like a cosmic lighthouse!",
          explorer:
            "An entire sun crushed into a sphere just 20 kilometers wide, rotating blindingly fast with magnetic beams.",
          astronomer:
            "Neutron degeneracy pressure balances gravity up to the TOV limit (~2.1 M☉). Surface gravity g ~ 10^12 m/s²; magnetic field B ~ 10^12 Gauss driving synchrotron lighthouse pulses.",
        },
        cutawayLayers: [
          {
            name: "Liquid Neutron Core",
            composition: "Superfluid neutrons, superconducting protons",
            reaction: "Degeneracy pressure",
            temperatureK: "10^8 K (interior)",
            thicknessPct: 85,
            color: "#0284c7",
          },
          {
            name: "Iron-Rich Crystalline Crust",
            composition: "Ionized iron lattice + relativistic electron gas",
            reaction: "Magnetic crustal stress",
            temperatureK: "10^6 K",
            thicknessPct: 15,
            color: "#38bdf8",
          },
        ],
        visualType: "neutron_star",
      },
    ],
    fateSummary: {
      junior:
        "Massive stars live fast and die violently in spectacular supernovae, leaving behind super-dense spinning neutron stars!",
      explorer:
        "Stars over 8 solar masses forge elements all the way to iron, then collapse and blast the outer layers away in a core-collapse supernova.",
      astronomer:
        "Stars in the range 8 < M_init < 25 M☉ form iron cores that collapse dynamically once the Chandrasekhar mass is reached, leaving behind neutron star remnants.",
    },
    nucleosynthesisYield: [
      "Oxygen-16",
      "Neon-20",
      "Magnesium-24",
      "Silicon-28",
      "Sulfur-32",
      "Calcium-40",
      "Iron-56",
      "Gold-197 (r-process)",
      "Uranium-238 (r-process)",
    ],
  },

  ultra_massive: {
    id: "ultra_massive",
    name: "Hypergiant Star (40 M☉)",
    initialMassSolar: 40.0,
    spectralType: "O3V",
    exampleStar: "Eta Carinae / Cygnus X-1 Progenitor",
    tagline: "The extreme limit: violent mass loss, hypernova & stellar black hole",
    totalLifetimeMyr: 4.5,
    lifetimeDisplay: "3.5 – 5 Million Years",
    finalRemnant: "Stellar Black Hole & Glowing Accretion Disk",
    remnantMassSolar: 8.5,
    stages: [
      {
        id: "um_main",
        name: "Luminous Blue Hypergiant",
        phaseLabel: "Eddington Limit Main Sequence",
        timeFraction: 0.6,
        typicalAgeMyr: 2.5,
        ageDisplay: "2.5 Myr",
        radiusSolar: 18.0,
        surfaceTempK: 42000,
        luminositySolar: 500000,
        colorHex: "#818cf8",
        glowColor: "rgba(129, 140, 248, 0.9)",
        coreProcess: "Hyper-intense CNO burning near the Eddington luminosity limit",
        description: {
          junior:
            "An ultra-bright monster star shining half a million times brighter than our Sun!",
          explorer:
            "Shining near the physical limit of stability, violent radiation pressure blows away thick clouds of its own atmosphere.",
          astronomer:
            "Eddington luminosity limit L_edd = 4pi G M c / kappa. Radiation pressure drives massive line-driven stellar winds (>10^-5 M☉/yr).",
        },
        cutawayLayers: [
          {
            name: "Super-Massive CNO Core",
            composition: "Hydrogen converting at extreme rates",
            reaction: "CNO cycle at 5 × 10^7 K",
            temperatureK: "5.0 × 10^7 K",
            thicknessPct: 40,
            color: "#6366f1",
          },
          {
            name: "Radiative Wind Envelope",
            composition: "Ionized gas blown into space",
            reaction: "Radiation-driven mass loss",
            temperatureK: "42,000 K",
            thicknessPct: 60,
            color: "#4f46e5",
          },
        ],
        visualType: "main_sequence",
      },
      {
        id: "um_wr",
        name: "Wolf-Rayet Star",
        phaseLabel: "Stripped Core Phase",
        timeFraction: 0.9,
        typicalAgeMyr: 4.0,
        ageDisplay: "4.0 Myr",
        radiusSolar: 4.0,
        surfaceTempK: 80000,
        luminositySolar: 800000,
        colorHex: "#c084fc",
        glowColor: "rgba(192, 132, 252, 0.9)",
        coreProcess: "Exposed helium and carbon-oxygen core fusing furiously",
        description: {
          junior:
            "The star blew off all its outer hydrogen coat, exposing its blazing hot inner core!",
          explorer:
            "Its outer layers are completely stripped away, leaving a bare, ultra-hot core fusing carbon and oxygen.",
          astronomer:
            "WC/WO spectral sequence; intense carbon and oxygen emission lines reveal a stripped core shedding mass at >2,000 km/s.",
        },
        cutawayLayers: [
          {
            name: "Exposed He/C/O Core",
            composition: "Helium, Carbon, Oxygen",
            reaction: "Alpha fusion stages",
            temperatureK: "10^9 K",
            thicknessPct: 80,
            color: "#9333ea",
          },
          {
            name: "Supersonic Stellar Wind",
            composition: "Enriched C/O outflow",
            reaction: "Wind collision shocks",
            temperatureK: "80,000 K",
            thicknessPct: 20,
            color: "#7e22ce",
          },
        ],
        visualType: "supergiant",
      },
      {
        id: "um_collapse",
        name: "Collapsar / Hypernova",
        phaseLabel: "Total Gravitational Collapse",
        timeFraction: 0.98,
        typicalAgeMyr: 4.5,
        ageDisplay: "4.5 Myr",
        radiusSolar: 50000,
        surfaceTempK: 50000,
        luminositySolar: 10000000000,
        colorHex: "#e879f9",
        glowColor: "rgba(232, 121, 249, 1.0)",
        coreProcess: "Direct black hole formation with relativistic gamma-ray burst jets",
        description: {
          junior:
            "The core is so heavy that not even neutrons can stop gravity! It plunges straight into a black hole with a blast of gamma rays.",
          explorer:
            "The core exceeds the Tolman-Oppenheimer-Volkoff limit; gravity wins completely, tearing a bottomless hole in spacetime.",
          astronomer:
            "Core mass M_core > 3.0 M☉ exceeds the maximum neutron star TOV limit, causing prompt collapse into a Kerr black hole with relativistic collapsar jets.",
        },
        cutawayLayers: [
          {
            name: "Event Horizon Nucleus",
            composition: "Gravitational Singularity",
            reaction: "Spacetime curvature -> infalling matter",
            temperatureK: "N/A",
            thicknessPct: 5,
            color: "#0f172a",
          },
          {
            name: "Relativistic Relativistic Outflow",
            composition: "Disrupted star envelope",
            reaction: "Hypernova blast",
            temperatureK: "10^8 K",
            thicknessPct: 95,
            color: "#c026d3",
          },
        ],
        visualType: "supernova",
      },
      {
        id: "um_remnant",
        name: "Stellar Black Hole",
        phaseLabel: "Spacetime Singularity",
        timeFraction: 1.0,
        typicalAgeMyr: 5.0,
        ageDisplay: ">5.0 Myr (Eternal)",
        radiusSolar: 0.000036, // Schwarzschild radius R_s = 25 km!
        surfaceTempK: 0,
        luminositySolar: 0.0,
        colorHex: "#020617",
        glowColor: "rgba(168, 85, 247, 0.7)",
        coreProcess:
          "Infinite gravitational curvature inside event horizon; glowing accretion disk",
        description: {
          junior:
            "A place where gravity is so strong that even light cannot escape! It pulls gas into a bright spinning ring.",
          explorer:
            "A point of infinite density surrounded by an event horizon. Any matter falling in glows with X-rays before vanishing forever.",
          astronomer:
            "Kerr metric spinning black hole with Schwarzschild radius R_s = 2GM/c² ≈ 25 km for an 8.5 M☉ remnant, surrounded by a viscous Shakura-Sunyaev accretion disk.",
        },
        cutawayLayers: [
          {
            name: "Singularity & Event Horizon",
            composition: "Pure warped spacetime",
            reaction: "General Relativistic horizon",
            temperatureK: "Hawking temp ~ 10^-8 K",
            thicknessPct: 20,
            color: "#000000",
          },
          {
            name: "Photon Sphere & ISCO",
            composition: "Relativistic orbits",
            reaction: "Gravitational lensing photon ring",
            temperatureK: "10^7 K (X-rays)",
            thicknessPct: 30,
            color: "#7c3aed",
          },
          {
            name: "Viscous Accretion Disk",
            composition: "Ionized gas disk",
            reaction: "Magnetorotational instability dissipation",
            temperatureK: "10^5 – 10^7 K",
            thicknessPct: 50,
            color: "#9333ea",
          },
        ],
        visualType: "black_hole",
      },
    ],
    fateSummary: {
      junior:
        "The most massive stars live for only a blink of cosmic time and end as mysterious, powerful black holes!",
      explorer:
        "With masses over 25–30 solar masses, nothing in known physics can resist gravity. The core collapses completely into a stellar black hole.",
      astronomer:
        "Stars with initial masses M > 25–30 M☉ retain cores greater than the Tolman-Oppenheimer-Volkoff limit (M_TOV ≈ 2.1–2.3 M☉), culminating in direct or fallback black hole formation.",
    },
    nucleosynthesisYield: [
      "Carbon-12",
      "Oxygen-16",
      "Silicon-28",
      "Iron-56",
      "Heavy r-process nuclei",
    ],
  },
};

export interface StellarLifetimeFormula {
  formula: string;
  variableExplanations: Array<{ symbol: string; meaning: string; units: string }>;
  limitations: string[];
  sampleCalculations: Array<{
    mass: number;
    approxLifetimeMyr: number;
    detailedLifetimeMyr: number;
    reason: string;
  }>;
}

export const STELLAR_LIFETIME_DATA: StellarLifetimeFormula = {
  formula: "τ_MS ≈ 10 × (M / M_☉)^(-2.5) Gyr",
  variableExplanations: [
    { symbol: "τ_MS", meaning: "Main sequence lifetime of the star", units: "Gyr (Billion years)" },
    { symbol: "M", meaning: "Initial stellar mass", units: "Solar masses (M_☉)" },
    { symbol: "M_☉", meaning: "Mass of our Sun (1.989 × 10^30 kg)", units: "Reference unit (1.0)" },
    {
      symbol: "-2.5",
      meaning: "Exponent derived from fuel / luminosity: τ ∝ M / L, where L ∝ M^3.5",
      units: "Dimensionless",
    },
  ],
  limitations: [
    "Applies primarily to main-sequence stars between ~0.5 M_☉ and 10 M_☉ where the mass-luminosity relation L ∝ M^3.5 holds.",
    "Breaks down for very low-mass red dwarfs (<0.35 M_☉) because full convection cycles 100% of hydrogen fuel instead of the standard ~10% core limit, stretching lifetimes past 1,000 Gyr.",
    "Breaks down for very high-mass stars (>20 M_☉) where radiation pressure flattens the luminosity relation toward L ∝ M (Eddington limit), establishing a lifetime floor of ~3 to 4 million years.",
    "Does not account for substantial mass loss via stellar winds in massive stars, nor binary mass transfer.",
  ],
  sampleCalculations: [
    {
      mass: 0.5,
      approxLifetimeMyr: 56500,
      detailedLifetimeMyr: 70000,
      reason:
        "Small stars conserve fuel meticulously; lower central temperature slows p-p fusion rate drastically.",
    },
    {
      mass: 1.0,
      approxLifetimeMyr: 10000,
      detailedLifetimeMyr: 10000,
      reason: "Our Sun's baseline main sequence lifespan is approximately 10 billion years.",
    },
    {
      mass: 3.0,
      approxLifetimeMyr: 640,
      detailedLifetimeMyr: 500,
      reason:
        "Triple the mass, but shines 50 times brighter; burns out in hundreds of millions of years.",
    },
    {
      mass: 10.0,
      approxLifetimeMyr: 31.6,
      detailedLifetimeMyr: 25.0,
      reason:
        "Ten times solar mass burns out 300 times faster than the Sun due to CNO cycle burning.",
    },
    {
      mass: 40.0,
      approxLifetimeMyr: 1.0,
      detailedLifetimeMyr: 4.5,
      reason:
        "The simple formula underestimates lifetime here because Eddington radiation limit caps luminosity growth.",
    },
  ],
};

export interface OutcomeChallenge {
  id: string;
  starName: string;
  initialMass: number;
  spectralType: string;
  clues: string[];
  options: {
    remnant: string;
    deathMechanism: string;
    supernova: boolean;
  }[];
  correctIndex: number;
  scientificExplanation: string;
}

export const OUTCOME_CHALLENGES: OutcomeChallenge[] = [
  {
    id: "c1",
    starName: "Proxima Centauri",
    initialMass: 0.12,
    spectralType: "M5.5Ve Red Dwarf",
    clues: [
      "Mass is only 12% of the Sun",
      "Interior is completely convective from core to surface",
      "Core temperature is only ~4 million Kelvin",
    ],
    options: [
      {
        remnant: "Helium White Dwarf",
        deathMechanism: "Gradual cooling without explosion",
        supernova: false,
      },
      { remnant: "Neutron Star", deathMechanism: "Type II core collapse", supernova: true },
      { remnant: "Black Hole", deathMechanism: "Direct collapsar collapse", supernova: false },
    ],
    correctIndex: 0,
    scientificExplanation:
      "Stars with M < 0.35 M_☉ never reach helium ignition and cannot undergo core collapse. They simply deplete their hydrogen and contract into helium white dwarfs.",
  },
  {
    id: "c2",
    starName: "The Sun (Sol)",
    initialMass: 1.0,
    spectralType: "G2V Yellow Dwarf",
    clues: [
      "Currently burning hydrogen via the proton-proton chain",
      "Will swell into a red giant and undergo a helium flash",
      "Core mass never exceeds the 1.44 M_☉ Chandrasekhar limit",
    ],
    options: [
      {
        remnant: "Neutron Star (Pulsar)",
        deathMechanism: "Core-collapse supernova",
        supernova: true,
      },
      {
        remnant: "Carbon-Oxygen White Dwarf",
        deathMechanism: "Planetary nebula envelope ejection",
        supernova: false,
      },
      { remnant: "Iron Dwarf", deathMechanism: "Thermonuclear detonation", supernova: false },
    ],
    correctIndex: 1,
    scientificExplanation:
      "The Sun will NEVER explode as a supernova. Its core cannot reach the 600 million Kelvin required for carbon fusion, gently shedding its envelope as a planetary nebula.",
  },
  {
    id: "c3",
    starName: "Sirius A",
    initialMass: 2.06,
    spectralType: "A1V Blue-White Star",
    clues: [
      "Twice the mass of the Sun",
      "Main sequence lifetime is roughly 1 billion years",
      "Final core will be below 1.44 M_☉",
    ],
    options: [
      { remnant: "Stellar Black Hole", deathMechanism: "Hypernova blast", supernova: true },
      {
        remnant: "Massive Carbon-Oxygen White Dwarf",
        deathMechanism: "Asymptotic Giant Branch mass loss",
        supernova: false,
      },
      { remnant: "Pulsar", deathMechanism: "Core collapse shockwave", supernova: true },
    ],
    correctIndex: 1,
    scientificExplanation:
      "Stars between 0.8 and 8 M_☉ end their lives as white dwarfs. Sirius A's companion, Sirius B, was once a 5 M_☉ star and is now a famous 1.0 M_☉ white dwarf!",
  },
  {
    id: "c4",
    starName: "Betelgeuse Progenitor",
    initialMass: 16.5,
    spectralType: "Red Supergiant (M1-2 Ia-ab)",
    clues: [
      "Currently a pulsating red supergiant larger than Jupiter's orbit",
      "Building an iron-56 core through concentric fusion shells",
      "Initial mass far exceeds the 8 M_☉ threshold",
    ],
    options: [
      {
        remnant: "Planetary Nebula & White Dwarf",
        deathMechanism: "Gentle thermal pulsation",
        supernova: false,
      },
      {
        remnant: "Neutron Star (Pulsar)",
        deathMechanism: "Type II core-collapse supernova",
        supernova: true,
      },
      {
        remnant: "Total Disintegration (No Remnant)",
        deathMechanism: "Pair-instability explosion",
        supernova: true,
      },
    ],
    correctIndex: 1,
    scientificExplanation:
      "Betelgeuse will end in a catastrophic Type II core-collapse supernova. Its iron core will collapse into a neutron star while blowing the star's outer envelope across space.",
  },
  {
    id: "c5",
    starName: "Cygnus X-1 Progenitor",
    initialMass: 40.0,
    spectralType: "Extreme O-type Hypergiant",
    clues: [
      "Initial mass was ~40 times the Sun",
      "Core remnant exceeds the Tolman-Oppenheimer-Volkoff limit (>2.2 M_☉)",
      "High-energy X-ray source powered by accretion disk",
    ],
    options: [
      {
        remnant: "Helium White Dwarf",
        deathMechanism: "Cooling over trillions of years",
        supernova: false,
      },
      { remnant: "Neutron Star", deathMechanism: "Electron-capture supernova", supernova: true },
      {
        remnant: "Stellar-Mass Black Hole",
        deathMechanism: "Collapsar / Hypernova collapse",
        supernova: true,
      },
    ],
    correctIndex: 2,
    scientificExplanation:
      "When the degenerate core mass exceeds the Tolman-Oppenheimer-Volkoff limit of ~2.2 M_☉, neutron degeneracy pressure fails, forcing collapse into a stellar black hole.",
  },
];

export interface Module10Sublesson {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  summary: string;
  keyConcepts: {
    junior: string[];
    explorer: string[];
    astronomer: string[];
  };
  content: {
    junior: string;
    explorer: string;
    astronomer: string;
  };
  didYouKnow: string;
  interactiveLabHighlight: string;
}

export const MODULE_10_SUBLESSONS: Module10Sublesson[] = [
  {
    id: "sub-01",
    number: 1,
    title: "Birth Inside a Molecular Cloud",
    shortTitle: "Molecular Clouds",
    summary:
      "Cold, dense clouds of interstellar gas collapse under gravity to form stellar nurseries.",
    keyConcepts: {
      junior: [
        "Stars are born in huge clouds of cold gas and dust",
        "Gravity pulls the gas together into clumps",
        "Space telescopes like Webb see baby stars hiding inside dust",
      ],
      explorer: [
        "Giant Molecular Clouds (GMCs) are the coldest places in space (~10-20 K)",
        "Jeans instability determines when a gas clump will collapse under its own gravity",
        "One cloud can fragment into hundreds or thousands of sister stars",
      ],
      astronomer: [
        "Jeans Mass M_J ∝ (T^1.5) / (ρ^0.5); cold, dense regions collapse easiest",
        "Turbulent compression and magnetic support govern cloud fragmentation",
        "Dust grains re-radiate gravitational binding energy into far-infrared wavelengths",
      ],
    },
    content: {
      junior:
        "Stars are not born alone in empty space. They are born inside gigantic, freezing clouds of gas and space dust called 'stellar nurseries'. When gravity gently pulls clumps of this dust together, the clump gets heavier and pulls in even more gas, starting the journey of a new star!",
      explorer:
        "Every star begins inside a Giant Molecular Cloud (GMC)—sprawling regions spanning light-years with temperatures hovering just 10 to 30 degrees above absolute zero. Because the gas is cold, thermal pressure cannot resist gravity once the clump exceeds a critical mass called the Jeans Mass. The cloud breaks up into smaller pockets, each destined to collapse into an individual star system.",
      astronomer:
        "Star formation initiates when interstellar molecular gas cores satisfy the Jeans instability criterion: gravitational potential energy |Ω| exceeds twice the thermal kinetic energy 2K (Virial Theorem 2K + Ω < 0). Magnetic fields and supersonic turbulence initially cushion the cloud, but as ambipolar diffusion allows neutral gas to slip past ions, dense cores (n_H2 > 10^4 cm^-3) undergo dynamic gravitational collapse.",
    },
    didYouKnow:
      "The famous 'Pillars of Creation' in the Eagle Nebula are giant columns of cold hydrogen gas where new stars are actively condensing right now!",
    interactiveLabHighlight:
      "In the 3D Evolution Lab, watch the cold molecular cloud contract and spin into a dense glowing clump.",
  },
  {
    id: "sub-02",
    number: 2,
    title: "Protostars: The Igniting Core",
    shortTitle: "Protostars",
    summary:
      "A contracting embryonic star heats up by compression and clears its accretion disk with violent jets.",
    keyConcepts: {
      junior: [
        "A protostar is a baby star that has not yet ignited its main nuclear engine",
        "It glows from compression heat as gravity squeezes it",
        "Twin jets of gas shoot out from the north and south poles",
      ],
      explorer: [
        "Kelvin-Helmholtz contraction converts gravitational potential energy into thermal radiation",
        "Protoplanetary disks form around the protostar, building future planets",
        "The core must reach 10 million Kelvin before true hydrogen fusion ignites",
      ],
      astronomer: [
        "Hayashi track: fully convective protostars descend toward the main sequence at nearly constant T_eff",
        "Herbig-Haro (HH) objects mark shock fronts from collimated magnetocentrifugal bipolar jets",
        "Deuterium fusion ignites early at ~10^6 K, temporarily regulating core temperature before main-sequence zero-age (ZAMS).",
      ],
    },
    content: {
      junior:
        "Before a star becomes a real star, it is a 'protostar'—a baby star! It glows hot orange not from nuclear fusion yet, but because gravity is squeezing it so tightly. Twin laser-like jets of gas shoot out from its poles into deep space!",
      explorer:
        "As gas spirals inward from an accretion disk, conservation of angular momentum speeds up its rotation. The young star enters the T Tauri phase, blowing powerful stellar winds that clear away the surrounding dust. When the core temperature finally climbs past 10 million Kelvin, hydrogen nuclei slam together fast enough to overcome electrostatic repulsion, sparking nuclear fusion.",
      astronomer:
        "During the Kelvin-Helmholtz contraction phase, gravitational binding energy E_grav ≈ -3GM²/5R is radiated away at a rate L_KH = dE/dt. Protostellar disks channel material along magnetic field lines onto the stellar surface, while magnetocentrifugal forces drive collimated bipolar jets (Herbig-Haro flows). Reaching the Zero Age Main Sequence (ZAMS) marks the onset of steady hydrogen burning.",
    },
    didYouKnow:
      "Baby stars shoot collimated jets of plasma traveling at hundreds of kilometers per second into interstellar space, creating glowing nebulae called Herbig-Haro objects!",
    interactiveLabHighlight:
      "Observe the protostar's glowing equatorial accretion disk and perpendicular bipolar jets in the 3D lab.",
  },
  {
    id: "sub-03",
    number: 3,
    title: "Main-Sequence Stars: The Stable Balance",
    shortTitle: "Main Sequence",
    summary:
      "Stars spend 90% of their lives in hydrostatic equilibrium, stably fusing hydrogen into helium.",
    keyConcepts: {
      junior: [
        "Stars spend almost their whole lives on the 'Main Sequence'",
        "Gravity pulls inward, while heat and light push outward—making a perfect balance",
        "Our Sun is a happy main-sequence star today",
      ],
      explorer: [
        "Hydrostatic equilibrium maintains a constant size and temperature for millions or billions of years",
        "Stars like our Sun use the proton-proton chain; massive stars use the CNO cycle",
        "A star's initial mass dictates its brightness, surface temperature, and total lifespan",
      ],
      astronomer: [
        "Hydrostatic equilibrium equation: dP/dr = -G M(r) ρ(r) / r²",
        "Stellar thermostat: if the core compresses, fusion rate surges (∝ T^4 for p-p, ∝ T^17 for CNO), expanding and cooling the core back to balance",
        "Core hydrogen mass fraction X_c gradually decreases from ~0.74 to 0.00.",
      ],
    },
    content: {
      junior:
        "Think of a main-sequence star like a hot-air balloon in perfect balance. Gravity is constantly trying to crush the star, but the immense heat from nuclear fusion in the core pushes outward. As long as the star has hydrogen fuel, it stays steady and shines brightly!",
      explorer:
        "The main sequence is the longest and most stable phase of a star's life. Deep in the core, intense pressure and temperatures forge hydrogen into helium. This acts as an automated cosmic thermostat: if the core cools slightly, gravity compresses it, reheating the core and speeding up fusion until balance is restored.",
      astronomer:
        "The main sequence lifetime is governed by the mass-luminosity ratio: τ_MS ∝ M / L. For stars with M < 1.3 M_☉, the proton-proton chain dominates with an energy generation rate ε_pp ∝ ρ T^4. In stars with M > 1.3 M_☉, the carbon-nitrogen-oxygen (CNO) cycle takes over with extreme temperature sensitivity ε_CNO ∝ ρ T^17, resulting in a convective core and radiative envelope.",
    },
    didYouKnow:
      "Every second, our Sun converts 600 million tons of hydrogen into 596 million tons of helium. The missing 4 million tons of matter is turned directly into pure energy via E = mc²!",
    interactiveLabHighlight:
      "Toggle the 'Cutaway Internal Structure' view in the lab to see the core fusion zone and surrounding energy transport zones.",
  },
  {
    id: "sub-04",
    number: 4,
    title: "Stellar Aging: The Core Crisis",
    shortTitle: "Stellar Aging",
    summary:
      "When hydrogen in the core runs out, the core contracts while the outer atmosphere swells dramatically.",
    keyConcepts: {
      junior: [
        "When the core runs out of hydrogen fuel, the star gets restless",
        "The core shrinks down tight, but the outside puffs up huge",
        "The star cools on the outside and turns reddish",
      ],
      explorer: [
        "Helium 'ash' builds up in the core like fireplace ash, stopping central fusion",
        "Hydrogen shell burning ignites in a layer around the contracted core",
        "The 'mirror principle' causes the outer envelope to swell into a giant",
      ],
      astronomer: [
        "Schönberg-Chandrasekhar limit: an isothermal helium core cannot support more than ~10% of the star's total mass without collapsing",
        "Core contraction releases gravitational potential energy, heating the hydrogen-burning shell above it",
        "Stellar radius expands by factors of 100 to 1,000, entering the Subgiant and Red Giant branches.",
      ],
    },
    content: {
      junior:
        "What happens when a star's main fuel runs out? Deep inside, helium ash has piled up. Without heat pushing outward from the center, the core shrinks! But surprisingly, this causes the outside of the star to balloon outward into space, turning into a giant!",
      explorer:
        "When core hydrogen is exhausted, fusion ceases in the center. Gravity pulls the helium core tighter and hotter. This heats up a shell of unburned hydrogen just outside the core, igniting 'hydrogen shell burning'. Like a seesaw (the astrophysical 'mirror principle'), core contraction forces the star's outer layers to expand outward by hundreds of times, cooling the surface down to an orange-red glow.",
      astronomer:
        "As central hydrogen drops to zero, the core enters the isothermal phase until exceeding the Schönberg-Chandrasekhar mass limit (M_core / M_total ≈ 0.1). Core contraction raises central density and temperature, establishing an intense hydrogen-burning shell. According to the virial theorem, half the released gravitational energy heats the shell, which drives extreme radial expansion across the convective envelope.",
    },
    didYouKnow:
      "When our Sun enters this stage in about 5 billion years, its outer edge will swell past the orbits of Mercury and Venus, and may even reach Earth's orbit!",
    interactiveLabHighlight:
      "Scrub the timeline forward from 4,600 Myr to 10,000 Myr to watch the Sun's envelope swell into a Red Giant.",
  },
  {
    id: "sub-05",
    number: 5,
    title: "Red Giants & Red Supergiants",
    shortTitle: "Giants & Supergiants",
    summary:
      "Mass dictates whether a star experiences a Helium Flash (Sun-like) or builds multi-layer onion fusion shells (Massive).",
    keyConcepts: {
      junior: [
        "Sun-like stars become Red Giants; massive stars become colossal Red Supergiants",
        "Helium begins fusing into carbon in the core",
        "Supergiants are so big that thousands of Suns could fit inside!",
      ],
      explorer: [
        "Low-mass stars experience a runaway 'Helium Flash' in their degenerate core",
        "Massive stars (>8 M_☉) fuse heavier elements: carbon, neon, oxygen, silicon",
        "Supergiants build an 'onion-skin' core with iron at the very center",
      ],
      astronomer: [
        "Triple-alpha reaction: 3 4He -> 12C + 7.27 MeV at T ~ 10^8 K",
        "Electron-degenerate helium cores cannot expand to cool, causing a runaway thermonuclear flash until degeneracy is lifted",
        "Supergiants continue non-degenerate alpha capture up to the iron peak (56Fe / 56Ni), where binding energy per nucleon reaches its maximum.",
      ],
    },
    content: {
      junior:
        "Red giants are titans! A Sun-like star swells to over 100 times its normal size. Even bigger are Red Supergiants like Betelgeuse in Orion, which are so massive that if placed at the center of our solar system, they would swallow Jupiter!",
      explorer:
        "In a Sun-like star, the core compresses until electrons become quantum-mechanically degenerate. When temperature hits 100 million Kelvin, helium fusion ignites explosively in a 'Helium Flash' that lasts only minutes inside the core before settling onto the horizontal branch. Massive stars, on the other hand, never experience a flash; they smoothly ignite helium, carbon, neon, and oxygen, building concentric fusion shells like layers of an onion.",
      astronomer:
        "In low-mass stars (M < 2 M_☉), the core becomes degenerate (P ∝ ρ^(5/3)), decoupling pressure from temperature. When T_c reaches ~10^8 K, triple-alpha fusion unleashes enormous energy without expanding the core, producing the Helium Flash (~10^11 L_☉ for seconds, absorbed internally). In massive stars (M > 8 M_☉), temperatures exceed 3 × 10^9 K, enabling silicon burning into iron-group nuclei.",
    },
    didYouKnow:
      "The star Betelgeuse is so gigantic that its surface pulsates and bubbles with convective cells each larger than the entire orbit of Mars!",
    interactiveLabHighlight:
      "Compare the cutaway core of a Red Giant (Helium shell) against a Massive Supergiant (multi-layer onion skin).",
  },
  {
    id: "sub-06",
    number: 6,
    title: "White Dwarfs: The Peaceful Fate of Low-Mass Stars",
    shortTitle: "White Dwarfs",
    summary:
      "Stars under 8 solar masses puff off their envelopes as planetary nebulae and leave behind Earth-sized white dwarfs.",
    keyConcepts: {
      junior: [
        "The Sun will puff away its outer layers into a glowing ring called a planetary nebula",
        "The leftover core is an Earth-sized white dwarf",
        "A white dwarf is made of crushed carbon and oxygen and slowly cools down forever",
      ],
      explorer: [
        "Planetary nebulae have nothing to do with planets—early astronomers thought they looked round like Uranus",
        "Electron degeneracy pressure prevents gravity from crushing the white dwarf any further",
        "The Chandrasekhar limit: no white dwarf can weigh more than 1.44 times the Sun",
      ],
      astronomer: [
        "Pulsations on the Asymptotic Giant Branch (AGB) eject the envelope at 20-30 km/s via dust-driven superwinds",
        "Hot central core (T_eff > 100,000 K) emits ionizing UV photons creating fluorescent emission lines ([O III], H-alpha)",
        "Electron degeneracy equation of state P_e = (3 pi²)^(2/3) (hbar² / 5m_e) n_e^(5/3); Chandrasekhar mass limit M_Ch ≈ 1.44 M_☉.",
      ],
    },
    content: {
      junior:
        "Our Sun has a peaceful retirement planned! It will gently blow off its outer gas like a soap bubble, creating a glowing 'planetary nebula'. Inside will sit a tiny, ultra-dense white dwarf about the size of Earth, cooling down over billions of years.",
      explorer:
        "Low and intermediate-mass stars (under 8 solar masses) can never reach the 600 million Kelvin required to fuse carbon. Instead, thermal pulses on the Asymptotic Giant Branch lift the outer layers completely away into space. The remaining carbon-oxygen core is an Earth-sized white dwarf supported by quantum electron degeneracy pressure—a teaspoon of its matter would weigh over 5 tons!",
      astronomer:
        "During late AGB thermal pulses, helium shell flashes eject up to 40-50% of the star's mass. The bare degenerate core ionizes the expanding nebular gas, creating a classical planetary nebula with lifetimes of ~20,000 to 50,000 years. Subrahmanyan Chandrasekhar demonstrated in 1930 that relativistic electron degeneracy sets a hard upper limit of 1.44 M_☉, beyond which gravity overcomes electron degeneracy.",
    },
    didYouKnow:
      "A white dwarf is so dense that if you brought a single teaspoon of its material to Earth, it would weigh as much as an elephant or an SUV!",
    interactiveLabHighlight:
      "View the expanding planetary nebula bubble and inspect the Earth-sized degenerate core in the 3D viewer.",
  },
  {
    id: "sub-07",
    number: 7,
    title: "Supernovae: Cosmic Element Forges",
    shortTitle: "Supernovae",
    summary:
      "When an iron core collapses in a fraction of a second, a titanic shockwave blasts the star apart, forging heavy elements.",
    keyConcepts: {
      junior: [
        "When a massive star dies, it explodes in a colossal blast called a supernova",
        "The explosion shines brighter than billions of ordinary stars combined",
        "Every bit of gold and silver on Earth was created in exploding stars!",
      ],
      explorer: [
        "Iron cannot be fused to release energy; it absorbs energy instead, causing sudden core collapse",
        "In less than 1 second, the core collapses and rebounds, sending a catastrophic shockwave through the star",
        "Supernova nucleosynthesis creates gold, platinum, iodine, and uranium via rapid neutron capture",
      ],
      astronomer: [
        "Nuclear binding energy per nucleon peaks at Iron-56 and Nickel-62; fusion beyond iron is endothermic",
        "Photodisintegration (gamma + 56Fe -> 13 4He + 4n) and electron capture (e- + p -> n + nu_e) deplete core pressure support in milliseconds",
        "Core collapses at 25% the speed of light until reaching nuclear density (3 × 10^14 g/cm³); shock breakout unbinds the envelope with 10^51 ergs.",
      ],
    },
    content: {
      junior:
        "Supernovae are the most violent explosions in the cosmos! When an enormous star builds up an iron core, its engine shuts off. In less than a second, the entire star caves inward and explodes outward with the brightness of billions of suns!",
      explorer:
        "Iron is the nuclear graveyard of stars. Fusing iron does not produce energy—it steals energy. When a massive star's core turns to iron, pressure support vanishes in an instant. The core collapses from the size of the Earth to the size of a city in a quarter of a second! The collapsing layers bounce off the rigid nuclear core, unleashing a shockwave accompanied by a torrent of neutrinos that tears the star to pieces.",
      astronomer:
        "At T_core ~ 4 × 10^9 K, thermal photons photodisintegrate iron nuclei, while ultra-relativistic electrons are captured onto protons via inverse beta decay, releasing an immense pulse of electron neutrinos (E_nu ~ 10^58 ergs). The core collapse halts abruptly at nuclear saturation density via neutron degeneracy. The bounced hydrodynamic shock wave, revived by neutrino heating, expels the stellar mantle and drives rapid neutron capture (r-process) nucleosynthesis.",
    },
    didYouKnow:
      "Nearly every atom of iron in your blood, calcium in your bones, and gold in wedding rings was forged inside dying massive stars and supernovae billions of years ago!",
    interactiveLabHighlight:
      "Trigger the Type II supernova in the 3D lab to watch the core collapse and the radiant blast wave sweep outward.",
  },
  {
    id: "sub-08",
    number: 8,
    title: "Neutron Stars & Stellar Black Holes",
    shortTitle: "Extreme Remnants",
    summary:
      "The ultimate showdown between gravity and quantum degeneracy: city-sized pulsars or bottomless event horizons.",
    keyConcepts: {
      junior: [
        "A neutron star is a city-sized star made of pure neutrons that spins like a crazy lighthouse",
        "If the star was even heavier, gravity wins completely and makes a black hole!",
        "A black hole's gravity is so strong that not even light can escape",
      ],
      explorer: [
        "Neutron stars are supported by neutron degeneracy pressure; they spin hundreds of times per second (pulsars)",
        "The Tolman-Oppenheimer-Volkoff (TOV) limit is ~2.1-3 solar masses",
        "Exceeding the TOV limit results in total collapse into a singularity surrounded by an event horizon",
      ],
      astronomer: [
        "Neutron stars: ρ ~ 10^14 g/cm³, radius R ~ 10-12 km, surface gravity g ~ 10^12 m/s², magnetic fields B up to 10^15 G (magnetars)",
        "Pulsar emission originates from relativistic particle acceleration in magnetospheric polar cap gaps",
        "Stellar black holes: Kerr metric spacetime with event horizon radius R_s = 2GM/c² (Schwarzschild limit for non-rotating holes).",
      ],
    },
    content: {
      junior:
        "What is left after the explosion? If the star was large, its core becomes a 'neutron star'—a ball as wide as a city that weighs more than the Sun and spins hundreds of times per second, flashing beams like a lighthouse! If the star was truly giant, gravity crushes everything into a black hole—a bottomless pit where not even light can escape!",
      explorer:
        "Neutron stars represent matter pushed to the brink of physical law. Protons and electrons are squeezed into pure neutrons, creating a material so dense that a sugar-cube sized piece would weigh a billion tons on Earth. But if the collapsing core has more than ~2.2 times the mass of the Sun, even neutron degeneracy pressure fails. Nothing in the known universe can halt the collapse: gravity punches a hole in the fabric of spacetime, forming a black hole.",
      astronomer:
        "The Tolman-Oppenheimer-Volkoff limit (M_TOV ≈ 2.1–2.3 M☉) represents the maximum stable mass for a non-rotating neutron star governed by nuclear equations of state. Cores exceeding M_TOV undergo irreversible gravitational collapse to a spacetime singularity governed by General Relativity. Rotating Kerr black holes feature an ergosphere, an innermost stable circular orbit (ISCO), and an event horizon from which no causal information can escape.",
    },
    didYouKnow:
      "Some neutron stars spin over 700 times per second! Their surfaces move at a significant fraction of the speed of light.",
    interactiveLabHighlight:
      "Inspect the spinning lighthouse beams of a pulsar and the gravitational lensing photon ring of a stellar black hole.",
  },
];

export const MODULE_10_SOURCES: ScientificSource[] = [
  {
    title: "NASA Astrophysics: How Do Stars Form, Live, and Die?",
    organization: "NASA",
    url: "https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/",
  },
  {
    title: "ESA Hubble Science: Star Birth, Evolution, and Stellar Remnants",
    organization: "ESA",
    url: "https://hubblesite.org/science/stars-and-nebulae",
  },
  {
    title: "Chandra X-Ray Observatory: Supernovae, Pulsars & Stellar Black Holes",
    organization: "NASA Chandra",
    url: "https://chandra.harvard.edu/xray_sources/supernovas.html",
  },
  {
    title: "MESA: Modules for Experiments in Stellar Astrophysics",
    organization: "MESA Project",
    url: "https://docs.mesastar.org/",
  },
];

export const MODULE_10_LESSON: LessonModule = {
  id: "10",
  slug: "birth-life-and-death-of-stars",
  number: 10,
  title: "Birth, Life & Death of Stars",
  subtitle: "From molecular clouds to white dwarfs, supernovae, and remnants",
  description:
    "Follow the dramatic evolutionary trajectories determined purely by a star's initial birth mass, from gentle red dwarfs to colossal black holes.",
  stageId: 3,
  recommendedOrder: 10,
  difficultyLevels: ["Intermediate", "Advanced"],
  learningObjectives: [
    "Trace the life cycle of low-mass stars like our Sun up to planetary nebulae and white dwarfs",
    "Examine the core-collapse supernova process for massive stars (>8 solar masses)",
    "Explain why the Sun will NEVER explode as a supernova",
    "Understand the stellar lifetime relationship τ ∝ M^(-2.5) and its physical limitations",
    "Identify how compact remnants (white dwarfs, neutron stars, black holes) are supported against gravity",
  ],
  prerequisites: ["09"],
  route: "/learn?module=10",
  estimatedMinutes: 25,
  visualAssets: {
    iconName: "Zap",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  scientificSources: MODULE_10_SOURCES,
  status: "ready",
  version: "1.0.0",
};

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  level: "explorer" | "astronomer";
}

export const MODULE_10_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question:
      "What is the single most important parameter determining how a star will live and die?",
    options: [
      "Its distance from the galactic center",
      "Its initial stellar birth mass",
      "The number of planets orbiting it",
      "Its initial rotation speed",
    ],
    correctIndex: 1,
    explanation:
      "Initial stellar mass determines the core compression, temperature, fusion pathway, total lifespan, and final remnant fate.",
    level: "explorer",
  },
  {
    id: "q2",
    question: "Will our Sun ever explode as a core-collapse supernova?",
    options: [
      "Yes, in about 5 billion years",
      "Yes, when it collides with Andromeda",
      "No, its mass is too low to fuse carbon and cause core collapse",
      "No, because it has planets protecting it",
    ],
    correctIndex: 2,
    explanation:
      "Core-collapse supernovae require an initial mass of at least 8 solar masses. The Sun will gently eject a planetary nebula and leave a white dwarf.",
    level: "explorer",
  },
  {
    id: "q3",
    question: "What is a planetary nebula in modern astrophysics?",
    options: [
      "A dense disk of gas giving birth to new rocky planets",
      "The glowing outer atmosphere puffed away by a dying low-to-intermediate mass star",
      "A cloud of gas formed by colliding asteroids",
      "A small galaxy orbiting the Milky Way",
    ],
    correctIndex: 1,
    explanation:
      "Planetary nebulae are the expanding fluorescent outer gas shells shed by stars like the Sun on the asymptotic giant branch.",
    level: "explorer",
  },
  {
    id: "q4",
    question: "Why do massive stars live so much shorter lives than low-mass stars?",
    options: [
      "They have much less hydrogen to burn",
      "Their higher core temperatures drive fusion at extreme non-linear rates (e.g. CNO cycle ∝ T^17)",
      "They leak fuel out of their magnetic poles",
      "They are cooled down by solar winds",
    ],
    correctIndex: 1,
    explanation:
      "Although massive stars have more fuel, their extreme core temperatures drive fusion rates hundreds of thousands of times faster, consuming fuel in mere millions of years.",
    level: "astronomer",
  },
  {
    id: "q5",
    question: "What is the Chandrasekhar limit?",
    options: [
      "The maximum mass of a white dwarf (~1.44 M_☉) before electron degeneracy pressure fails",
      "The speed of light inside a star's core",
      "The minimum mass required for hydrogen fusion (0.08 M_☉)",
      "The distance at which tidal forces shred a planet",
    ],
    correctIndex: 0,
    explanation:
      "Subrahmanyan Chandrasekhar calculated that electron degeneracy pressure cannot support a white dwarf exceeding 1.44 solar masses.",
    level: "astronomer",
  },
  {
    id: "q6",
    question: "Why does nuclear fusion stop producing energy once the core turns into Iron-56?",
    options: [
      "Iron is completely non-reactive in space",
      "Iron-56 has the highest nuclear binding energy per nucleon; fusing it is endothermic (steals energy)",
      "Iron reflects all gamma ray photons back into the star",
      "Iron instantly turns into neutrinos",
    ],
    correctIndex: 1,
    explanation:
      "Iron-56 sits at the peak of the nuclear binding energy curve. Fusing elements heavier than iron absorbs energy rather than releasing it, leading to instant catastrophic collapse.",
    level: "astronomer",
  },
  {
    id: "q7",
    question:
      "What prevents gravity from crushing a neutron star into a black hole (as long as it remains below the TOV limit)?",
    options: [
      "Thermal gas pressure from burning hydrogen",
      "Centrifugal force from planetary orbits",
      "Neutron degeneracy pressure and repulsive strong nuclear force",
      "Magnetic levitation",
    ],
    correctIndex: 2,
    explanation:
      "Neutron degeneracy pressure (Pauli exclusion principle for neutrons) combined with the short-range repulsive nuclear force supports the star up to ~2.1-2.3 M_☉.",
    level: "astronomer",
  },
  {
    id: "q8",
    question:
      "Why does the simplified lifetime formula τ ∝ M^(-2.5) underestimate the lifespan of very low-mass red dwarfs?",
    options: [
      "Red dwarfs are fully convective and circulate nearly 100% of their hydrogen into the core, rather than just ~10%",
      "Red dwarfs absorb fuel from other stars",
      "Red dwarfs do not have gravity",
      "Red dwarfs fuse helium instead of hydrogen",
    ],
    correctIndex: 0,
    explanation:
      "Because red dwarfs (M < 0.35 M_☉) are completely convective, they continuously cycle fresh hydrogen from the envelope into the core, stretching lifetimes to trillions of years.",
    level: "astronomer",
  },
];
