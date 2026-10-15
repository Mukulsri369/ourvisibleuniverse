import type { LessonModule, ScientificSource } from "../types";

export interface EvolutionStage {
  id: string;
  name: string;
  phaseNumber: number;
  timeRangeYears: string;
  coreProcess: string;
  temperatureK: number;
  radiusSolar: number;
  luminositySolar: number;
  visualType:
    | "cloud"
    | "protostar"
    | "main_sequence"
    | "red_giant"
    | "supergiant"
    | "nebula"
    | "supernova"
    | "white_dwarf"
    | "neutron_star"
    | "black_hole";
  colorHex: string;
  glowHex: string;
  internalLayers: {
    name: string;
    reaction: string;
    tempK: string;
    density: string;
    thicknessRatio: number; // 0 to 1
    color: string;
  }[];
  summary: string;
  scientificDetail: string;
}

export interface EvolutionaryTrack {
  id: string;
  name: string;
  initialMassSolar: number;
  spectralClassZAMS: string;
  totalLifespanYears: string;
  description: string;
  finalRemnant:
    | "White Dwarf"
    | "Neutron Star (Pulsar)"
    | "Stellar Black Hole"
    | "Helium White Dwarf (Theoretical)";
  remnantMassSolar: number;
  willSupernova: boolean;
  colorHex: string;
  stages: EvolutionStage[];
}

export const EVOLUTIONARY_TRACKS: EvolutionaryTrack[] = [
  // 1. Very Low Mass Star (Red Dwarf: 0.2 M☉)
  {
    id: "red_dwarf_02",
    name: "Low-Mass Red Dwarf (0.2 M☉)",
    initialMassSolar: 0.2,
    spectralClassZAMS: "M5V",
    totalLifespanYears: "~4 Trillion Years",
    description:
      "Fully convective star that circulates all its hydrogen into the core. Burns fuel with extraordinary frugality and never goes through a red giant phase.",
    finalRemnant: "Helium White Dwarf (Theoretical)",
    remnantMassSolar: 0.18,
    willSupernova: false,
    colorHex: "#FF5722",
    stages: [
      {
        id: "rd_cloud",
        name: "Diffuse Molecular Cloud",
        phaseNumber: 1,
        timeRangeYears: "Year 0",
        coreProcess: "Gravitational condensation of cold gas (H₂, He)",
        temperatureK: 20,
        radiusSolar: 10000,
        luminositySolar: 0.0001,
        visualType: "cloud",
        colorHex: "#475569",
        glowHex: "#1e293b",
        internalLayers: [
          {
            name: "Gas & Dust Envelope",
            reaction: "No fusion (Thermal cooling)",
            tempK: "10–30 K",
            density: "10⁴ molecules/cm³",
            thicknessRatio: 1.0,
            color: "#64748b",
          },
        ],
        summary:
          "A dense clump in a molecular cloud cools and begins to collapse under its own gravity.",
        scientificDetail:
          "Jeans criterion is satisfied when internal thermal pressure cannot resist self-gravitational pull.",
      },
      {
        id: "rd_protostar",
        name: "Low-Mass Protostar",
        phaseNumber: 2,
        timeRangeYears: "Year 100,000 – 10 Million",
        coreProcess: "Gravitational Kelvin-Helmholtz contraction",
        temperatureK: 2500,
        radiusSolar: 1.5,
        luminositySolar: 0.1,
        visualType: "protostar",
        colorHex: "#ea580c",
        glowHex: "#c2410c",
        internalLayers: [
          {
            name: "Collapsing Core",
            reaction: "Gravitational heating only",
            tempK: "1–5 Million K",
            density: "10 g/cm³",
            thicknessRatio: 0.3,
            color: "#f97316",
          },
          {
            name: "Convective Infalling Envelope",
            reaction: "Turbulent accretion",
            tempK: "3,000 K",
            density: "0.01 g/cm³",
            thicknessRatio: 0.7,
            color: "#7c2d12",
          },
        ],
        summary:
          "The clump condenses into an opaque glowing protostar, heating up as gravitational potential energy converts to thermal heat.",
        scientificDetail:
          "Descends along the Hayashi track as a fully convective sphere prior to reaching central ignition temperatures.",
      },
      {
        id: "rd_ms",
        name: "Convective Main Sequence",
        phaseNumber: 3,
        timeRangeYears: "10 Million – 4 Trillion Years",
        coreProcess: "Proton-proton (p-p) chain hydrogen fusion",
        temperatureK: 3100,
        radiusSolar: 0.22,
        luminositySolar: 0.003,
        visualType: "main_sequence",
        colorHex: "#ff7043",
        glowHex: "#d84315",
        internalLayers: [
          {
            name: "Fully Convective Hydrogen Core",
            reaction: "p-p Chain (4 ¹H → ⁴He + 2e⁺ + 2ν)",
            tempK: "8 Million K",
            density: "60 g/cm³",
            thicknessRatio: 0.45,
            color: "#ffab91",
          },
          {
            name: "Deep Convective Mantle",
            reaction: "Complete plasma circulation",
            tempK: "3,100 K",
            density: "10 g/cm³",
            thicknessRatio: 0.55,
            color: "#d84315",
          },
        ],
        summary:
          "The star stably fuses hydrogen into helium. Because it is completely convective, it circulates almost 100% of its hydrogen fuel through the core.",
        scientificDetail:
          "Radiation opacity is extremely high, driving turbulent Rayleigh-Bénard convection throughout the entire volume.",
      },
      {
        id: "rd_remnant",
        name: "Helium White Dwarf",
        phaseNumber: 4,
        timeRangeYears: "4+ Trillion Years into the Future",
        coreProcess: "No active fusion; supported by electron degeneracy pressure",
        temperatureK: 15000,
        radiusSolar: 0.015,
        luminositySolar: 0.001,
        visualType: "white_dwarf",
        colorHex: "#e0f2fe",
        glowHex: "#38bdf8",
        internalLayers: [
          {
            name: "Degenerate Helium Core",
            reaction: "None (Fermi-Dirac degenerate gas)",
            tempK: "10 Million K (Cooling)",
            density: "10⁶ g/cm³",
            thicknessRatio: 0.95,
            color: "#bae6fd",
          },
          {
            name: "Residual Atmosphere",
            reaction: "Radiative surface emission",
            tempK: "15,000 K",
            density: "0.1 g/cm³",
            thicknessRatio: 0.05,
            color: "#38bdf8",
          },
        ],
        summary:
          "Having consumed nearly all its hydrogen without ever expanding into a red giant, the star cools into a helium white dwarf.",
        scientificDetail:
          "No known helium white dwarfs exist through single-star evolution yet because the universe is only 13.8 billion years old!",
      },
    ],
  },

  // 2. Sun-Like Intermediate Star (1.0 M☉) - OUR SUN
  {
    id: "sun_like_10",
    name: "Sun-like Star (1.0 M☉) — The Sun's Destiny",
    initialMassSolar: 1.0,
    spectralClassZAMS: "G2V",
    totalLifespanYears: "~10 to 12 Billion Years",
    description:
      "The evolutionary trajectory of our home star. It will stably fuse hydrogen for 10 billion years, swell into a red giant, shed a planetary nebula, and leave an Earth-sized carbon-oxygen white dwarf. THE SUN WILL NEVER SUPERNOVA.",
    finalRemnant: "White Dwarf",
    remnantMassSolar: 0.55,
    willSupernova: false,
    colorHex: "#FFD54F",
    stages: [
      {
        id: "sun_cloud",
        name: "Giant Molecular Cloud & Bok Globule",
        phaseNumber: 1,
        timeRangeYears: "0 – 100,000 Years",
        coreProcess: "Jeans gravitational fragmentation and infalling clumps",
        temperatureK: 15,
        radiusSolar: 5000,
        luminositySolar: 0.001,
        visualType: "cloud",
        colorHex: "#334155",
        glowHex: "#0f172a",
        internalLayers: [
          {
            name: "Pre-stellar Core",
            reaction: "Sub-millimeter dust cooling",
            tempK: "15 K",
            density: "10⁵ particles/cm³",
            thicknessRatio: 0.25,
            color: "#475569",
          },
          {
            name: "Infalling Gas Envelope",
            reaction: "Gravitational compression",
            tempK: "25 K",
            density: "10³ particles/cm³",
            thicknessRatio: 0.75,
            color: "#1e293b",
          },
        ],
        summary:
          "A dense pocket in the Orion-like interstellar nursery begins gravitational collapse under self-gravity.",
        scientificDetail:
          "Shockwaves from a nearby ancestral supernova may have triggered the collapse of the pre-solar nebula.",
      },
      {
        id: "sun_protostar",
        name: "T Tauri Protostar with Protoplanetary Disk",
        phaseNumber: 2,
        timeRangeYears: "100,000 – 50 Million Years",
        coreProcess: "Kelvin-Helmholtz contraction; early deuterium fusion",
        temperatureK: 4000,
        radiusSolar: 2.5,
        luminositySolar: 3.0,
        visualType: "protostar",
        colorHex: "#f59e0b",
        glowHex: "#d97706",
        internalLayers: [
          {
            name: "Deuterium-Burning Core",
            reaction: "²H + ¹H → ³He + γ",
            tempK: "1–8 Million K",
            density: "20 g/cm³",
            thicknessRatio: 0.2,
            color: "#fbbf24",
          },
          {
            name: "Convective Envelope",
            reaction: "Violent magnetic churning",
            tempK: "4,000 K",
            density: "0.1 g/cm³",
            thicknessRatio: 0.8,
            color: "#b45309",
          },
        ],
        summary:
          "A glowing protostar surrounded by a swirling disk of gas and dust from which planets, asteroids, and moons condense.",
        scientificDetail:
          "Exhibits powerful T Tauri stellar winds, magnetic flares, and polar jets, blowing away leftover gas.",
      },
      {
        id: "sun_ms",
        name: "G2V Main Sequence (Present Sun)",
        phaseNumber: 3,
        timeRangeYears: "50 Million – 10 Billion Years (Current: 4.6 Gyr)",
        coreProcess: "p-p chain core hydrogen fusion in hydrostatic equilibrium",
        temperatureK: 5772,
        radiusSolar: 1.0,
        luminositySolar: 1.0,
        visualType: "main_sequence",
        colorHex: "#FFF3DC",
        glowHex: "#FFD080",
        internalLayers: [
          {
            name: "Thermonuclear Fusion Core",
            reaction: "4 ¹H → ⁴He + 2e⁺ + 2ν (600M tons/s)",
            tempK: "15.7 Million K",
            density: "150 g/cm³",
            thicknessRatio: 0.25,
            color: "#ffffff",
          },
          {
            name: "Radiative Zone",
            reaction: "Radiative photon diffusion (~100 kyr)",
            tempK: "7 → 2 Million K",
            density: "20 → 0.2 g/cm³",
            thicknessRatio: 0.45,
            color: "#f59e0b",
          },
          {
            name: "Convection Zone",
            reaction: "Plasma boiling cells (granulation)",
            tempK: "2 Million → 5,772 K",
            density: "0.2 → 10⁻⁷ g/cm³",
            thicknessRatio: 0.3,
            color: "#d97706",
          },
        ],
        summary:
          "Our Sun's current stable golden age. Hydrostatic equilibrium holds the star in exact balance for 10 billion years.",
        scientificDetail:
          "Core hydrogen mass fraction X drops from 0.73 down to 0.00 at the terminal-age main sequence (TAMS).",
      },
      {
        id: "sun_red_giant",
        name: "Red Giant Branch (RGB)",
        phaseNumber: 4,
        timeRangeYears: "~10.5 – 11.5 Billion Years",
        coreProcess: "Hydrogen-shell burning around an inert, degenerate helium core",
        temperatureK: 3500,
        radiusSolar: 220,
        luminositySolar: 2400,
        visualType: "red_giant",
        colorHex: "#ef4444",
        glowHex: "#b91c1c",
        internalLayers: [
          {
            name: "Inert Degenerate Helium Core",
            reaction: "No fusion (Gravitational contraction)",
            tempK: "50 Million K",
            density: "10⁶ g/cm³",
            thicknessRatio: 0.02,
            color: "#e2e8f0",
          },
          {
            name: "Hydrogen-Burning Shell",
            reaction: "Rapid CNO/p-p fusion shell",
            tempK: "20 Million K",
            density: "100 g/cm³",
            thicknessRatio: 0.03,
            color: "#facc15",
          },
          {
            name: "Bloated Convective Envelope",
            reaction: "Sub-atmospheric expansion",
            tempK: "3,500 K",
            density: "10⁻⁶ g/cm³",
            thicknessRatio: 0.95,
            color: "#dc2626",
          },
        ],
        summary:
          "Core runs out of hydrogen. Gravity crushes the helium core, heating a surrounding hydrogen shell that inflates the Sun past Mercury, Venus, and possibly Earth!",
        scientificDetail:
          "Ends when the degenerate helium core reaches 100 Million K, triggering an explosive runaway 'Helium Flash'.",
      },
      {
        id: "sun_hb",
        name: "Horizontal Branch & Helium Core Burning",
        phaseNumber: 5,
        timeRangeYears: "~11.5 – 11.6 Billion Years (~100 Million Years)",
        coreProcess: "Triple-alpha core helium fusion (3 ⁴He → ¹²C)",
        temperatureK: 4800,
        radiusSolar: 10,
        luminositySolar: 45,
        visualType: "red_giant",
        colorHex: "#fb923c",
        glowHex: "#ea580c",
        internalLayers: [
          {
            name: "Helium-Fusing Core",
            reaction: "Triple-Alpha: 3 ⁴He → ¹²C + γ",
            tempK: "100–120 Million K",
            density: "10⁴ g/cm³",
            thicknessRatio: 0.1,
            color: "#fef08a",
          },
          {
            name: "Hydrogen-Burning Shell",
            reaction: "Shell hydrogen fusion",
            tempK: "15 Million K",
            density: "10 g/cm³",
            thicknessRatio: 0.1,
            color: "#fde047",
          },
          {
            name: "Contracted Envelope",
            reaction: "Convective transport",
            tempK: "4,800 K",
            density: "10⁻⁴ g/cm³",
            thicknessRatio: 0.8,
            color: "#ea580c",
          },
        ],
        summary:
          "The helium core ignites stably. The Sun shrinks slightly to 10 solar radii and settles onto the Horizontal Branch for 100 million years.",
        scientificDetail: "Produces carbon and oxygen nuclei via ⁴He + ¹²C → ¹⁶O (alpha capture).",
      },
      {
        id: "sun_agb",
        name: "Asymptotic Giant Branch (AGB)",
        phaseNumber: 6,
        timeRangeYears: "~11.6 – 11.8 Billion Years (~20 Million Years)",
        coreProcess: "Inert Carbon-Oxygen core with double burning shells (He & H)",
        temperatureK: 3100,
        radiusSolar: 300,
        luminositySolar: 6000,
        visualType: "red_giant",
        colorHex: "#dc2626",
        glowHex: "#7f1d1d",
        internalLayers: [
          {
            name: "Inert Degenerate C-O Core",
            reaction: "No fusion (Insufficient mass for carbon ignition)",
            tempK: "200 Million K",
            density: "10⁷ g/cm³",
            thicknessRatio: 0.01,
            color: "#cbd5e1",
          },
          {
            name: "Helium-Burning Shell",
            reaction: "Periodic thermal helium pulses",
            tempK: "100 Million K",
            density: "10³ g/cm³",
            thicknessRatio: 0.02,
            color: "#fef08a",
          },
          {
            name: "Hydrogen-Burning Shell",
            reaction: "Hydrogen fusion shell",
            tempK: "25 Million K",
            density: "10 g/cm³",
            thicknessRatio: 0.02,
            color: "#fde047",
          },
          {
            name: "Pulsating Tenuous Envelope",
            reaction: "Episodic superwinds & dust formation",
            tempK: "3,100 K",
            density: "10⁻⁷ g/cm³",
            thicknessRatio: 0.95,
            color: "#991b1b",
          },
        ],
        summary:
          "Core helium is exhausted. The Sun inflates to its maximum size and begins violent thermal pulsations, losing mass at high rates.",
        scientificDetail:
          "Helium shell flashes drive dredge-up events, enriching the outer atmosphere with newly synthesized carbon and s-process elements.",
      },
      {
        id: "sun_nebula",
        name: "Planetary Nebula Ejection",
        phaseNumber: 7,
        timeRangeYears: "~11.8 Billion Years (Lasts ~20,000 Years)",
        coreProcess: "Stellar envelope detached; illuminated by UV photons from hot core",
        temperatureK: 100000,
        radiusSolar: 10000,
        luminositySolar: 1000,
        visualType: "nebula",
        colorHex: "#06b6d4",
        glowHex: "#3b82f6",
        internalLayers: [
          {
            name: "Exposed White Dwarf Core",
            reaction: "Ultra-hot degenerate core (UV source)",
            tempK: "100,000 K",
            density: "10⁶ g/cm³",
            thicknessRatio: 0.01,
            color: "#ffffff",
          },
          {
            name: "Expanding Fluorescent Gas Shell",
            reaction: "Photo-ionization of [O III], H-α, N II",
            tempK: "10,000 K",
            density: "10³ atoms/cm³",
            thicknessRatio: 0.99,
            color: "#06b6d4",
          },
        ],
        summary:
          "Gentle pulsating superwinds blow off the Sun's outer layers, forming a glowing, multicolored bubble of gas called a planetary nebula.",
        scientificDetail:
          "Has nothing to do with planets—18th century astronomers thought they resembled Uranus in early telescopes.",
      },
      {
        id: "sun_white_dwarf",
        name: "Carbon-Oxygen White Dwarf (Sirius B Twin)",
        phaseNumber: 8,
        timeRangeYears: "11.8 Billion – Trillions of Years",
        coreProcess: "No active fusion; supported forever by electron degeneracy pressure",
        temperatureK: 25000,
        radiusSolar: 0.009, // Earth size!
        luminositySolar: 0.02,
        visualType: "white_dwarf",
        colorHex: "#e0f2fe",
        glowHex: "#0284c7",
        internalLayers: [
          {
            name: "Crystalline Carbon-Oxygen Core",
            reaction: "Degenerate Fermi gas (Non-thermal pressure)",
            tempK: "30 Million K (Gradually cooling)",
            density: "2×10⁶ g/cm³",
            thicknessRatio: 0.98,
            color: "#f8fafc",
          },
          {
            name: "Thin Helium/Hydrogen Atmosphere",
            reaction: "Pure radiative cooling layer",
            tempK: "25,000 K",
            density: "100 g/cm³",
            thicknessRatio: 0.02,
            color: "#38bdf8",
          },
        ],
        summary:
          "The final remnant of our Sun: an Earth-sized cosmic diamond with half the Sun's mass. It will slowly cool over trillions of years into a theoretical black dwarf.",
        scientificDetail:
          "Fowler & Chandrasekhar equation of state: P ∝ ρ^(5/3). The Sun's 0.55 M☉ remnant is well below the 1.44 M☉ Chandrasekhar limit.",
      },
    ],
  },

  // 3. Massive Star (15 M☉) - SUPERNOVA TRAJECTORY
  {
    id: "massive_15",
    name: "Massive Star (15 M☉) — Supernova & Pulsar",
    initialMassSolar: 15.0,
    spectralClassZAMS: "B0V",
    totalLifespanYears: "~12 to 15 Million Years",
    description:
      "A blistering blue furnace that burns through its fuel in a mere flash of cosmic time. Fuses elements all the way to iron, detonates in a Type II core-collapse supernova, and leaves a spinning neutron star (pulsar).",
    finalRemnant: "Neutron Star (Pulsar)",
    remnantMassSolar: 1.4,
    willSupernova: true,
    colorHex: "#60A5FA",
    stages: [
      {
        id: "massive_cloud",
        name: "Turbulent Giant Molecular Core",
        phaseNumber: 1,
        timeRangeYears: "0 – 20,000 Years",
        coreProcess: "High-density supersonic turbulent collapse",
        temperatureK: 30,
        radiusSolar: 8000,
        luminositySolar: 0.1,
        visualType: "cloud",
        colorHex: "#1e293b",
        glowHex: "#0f172a",
        internalLayers: [
          {
            name: "Supersonic Accretion Core",
            reaction: "Rapid gravitational collapse",
            tempK: "50 K",
            density: "10⁷ particles/cm³",
            thicknessRatio: 0.3,
            color: "#334155",
          },
          {
            name: "Clumpy Molecular Cloud",
            reaction: "Turbulent fragmentation",
            tempK: "20 K",
            density: "10⁵ particles/cm³",
            thicknessRatio: 0.7,
            color: "#0f172a",
          },
        ],
        summary:
          "Dense molecular gas collapses rapidly under massive gravity in a star-forming stellar nursery.",
        scientificDetail:
          "High accretion rates (10⁻³ M☉/yr) overcome radiation pressure to form a high-mass protostar.",
      },
      {
        id: "massive_ms",
        name: "Luminous Blue Main Sequence (B0V)",
        phaseNumber: 2,
        timeRangeYears: "20,000 – 12 Million Years",
        coreProcess: "CNO cycle core hydrogen burning at ferocious rates",
        temperatureK: 31000,
        radiusSolar: 6.8,
        luminositySolar: 28000,
        visualType: "main_sequence",
        colorHex: "#93c5fd",
        glowHex: "#3b82f6",
        internalLayers: [
          {
            name: "Convective CNO Fusion Core",
            reaction: "CNO Cycle (¹²C, ¹³N, ¹⁵O catalyst)",
            tempK: "35 Million K",
            density: "10 g/cm³",
            thicknessRatio: 0.35,
            color: "#ffffff",
          },
          {
            name: "Radiative Envelope",
            reaction: "Electron Thomson scattering",
            tempK: "35M → 31,000 K",
            density: "5 → 10⁻⁴ g/cm³",
            thicknessRatio: 0.65,
            color: "#60a5fa",
          },
        ],
        summary:
          "Shines 28,000 times brighter than the Sun. The catalytic CNO cycle generates power scaling as T¹⁶, burning hydrogen in just 12 million years.",
        scientificDetail:
          "Driven by intense radiative stellar winds with mass-loss rates dM/dt ≈ 10⁻⁷ M☉/yr.",
      },
      {
        id: "massive_supergiant",
        name: "Red Supergiant (Betelgeuse Class)",
        phaseNumber: 3,
        timeRangeYears: "12 – 13.5 Million Years",
        coreProcess: "Core Helium burning (Triple-Alpha) with Hydrogen burning shell",
        temperatureK: 3600,
        radiusSolar: 750,
        luminositySolar: 100000,
        visualType: "supergiant",
        colorHex: "#ef4444",
        glowHex: "#991b1b",
        internalLayers: [
          {
            name: "Helium Core",
            reaction: "3 ⁴He → ¹²C + γ",
            tempK: "180 Million K",
            density: "10³ g/cm³",
            thicknessRatio: 0.05,
            color: "#fef08a",
          },
          {
            name: "Hydrogen-Burning Shell",
            reaction: "CNO cycle shell",
            tempK: "40 Million K",
            density: "10 g/cm³",
            thicknessRatio: 0.05,
            color: "#fde047",
          },
          {
            name: "Vast Convective Outer Envelope",
            reaction: "Gigantic convective supercells",
            tempK: "3,600 K",
            density: "10⁻⁸ g/cm³",
            thicknessRatio: 0.9,
            color: "#dc2626",
          },
        ],
        summary:
          "Swelled to an unimaginable size! If placed in our solar system, its churning surface would engulf the orbit of Jupiter.",
        scientificDetail:
          "Massive convective cells span hundreds of millions of kilometers across the photosphere.",
      },
      {
        id: "massive_onion",
        name: "Onion-Skin Advanced Burning Shells",
        phaseNumber: 4,
        timeRangeYears: "Last 1,000 Years down to the Final 24 Hours",
        coreProcess: "Successive nuclear burning shells: Carbon → Neon → Oxygen → Silicon → Iron",
        temperatureK: 3800,
        radiusSolar: 800,
        luminositySolar: 120000,
        visualType: "supergiant",
        colorHex: "#f97316",
        glowHex: "#c2410c",
        internalLayers: [
          {
            name: "Inert Iron-56 Core",
            reaction: "Endothermic! Fusion consumes energy",
            tempK: "3.5 Billion K",
            density: "10¹⁰ g/cm³",
            thicknessRatio: 0.01,
            color: "#475569",
          },
          {
            name: "Silicon Burning Shell",
            reaction: "²⁸Si + 7 ⁴He → ⁵⁶Ni (Lasts 1 day!)",
            tempK: "2.7 Billion K",
            density: "10⁷ g/cm³",
            thicknessRatio: 0.02,
            color: "#a855f7",
          },
          {
            name: "Oxygen Burning Shell",
            reaction: "¹⁶O + ¹⁶O → ²⁸Si + ⁴He (Lasts ~6 months)",
            tempK: "1.5 Billion K",
            density: "10⁶ g/cm³",
            thicknessRatio: 0.03,
            color: "#3b82f6",
          },
          {
            name: "Neon Burning Shell",
            reaction: "²⁰Ne photodisintegration (Lasts 1 year)",
            tempK: "1.2 Billion K",
            density: "10⁵ g/cm³",
            thicknessRatio: 0.03,
            color: "#06b6d4",
          },
          {
            name: "Carbon Burning Shell",
            reaction: "¹²C + ¹²C → ²⁰Ne + ⁴He (Lasts ~600 years)",
            tempK: "600 Million K",
            density: "10⁴ g/cm³",
            thicknessRatio: 0.04,
            color: "#22c55e",
          },
          {
            name: "Helium Burning Shell",
            reaction: "3 ⁴He → ¹²C (Lasts 500,000 years)",
            tempK: "200 Million K",
            density: "10² g/cm³",
            thicknessRatio: 0.07,
            color: "#eab308",
          },
          {
            name: "Hydrogen Burning Shell",
            reaction: "4 ¹H → ⁴He",
            tempK: "50 Million K",
            density: "1 g/cm³",
            thicknessRatio: 0.1,
            color: "#f97316",
          },
          {
            name: "Non-Burning Hydrogen Envelope",
            reaction: "Inert outer gas",
            tempK: "3,800 K",
            density: "10⁻⁸ g/cm³",
            thicknessRatio: 0.7,
            color: "#dc2626",
          },
        ],
        summary:
          "The interior forms an 'onion skin' of burning shells. The core builds up Iron-56. Because fusing iron absorbs energy instead of releasing it, the star's nuclear furnace suddenly shuts down!",
        scientificDetail:
          "Iron-56 and Nickel-62 have the highest nuclear binding energy per nucleon in the universe (8.8 MeV/nucleon). Fusion cannot extract any more energy.",
      },
      {
        id: "massive_supernova",
        name: "Type II Core-Collapse Supernova",
        phaseNumber: 5,
        timeRangeYears: "Seconds to Months (Peak: Days)",
        coreProcess: "Relativistic core collapse, electron capture, and shock breakout",
        temperatureK: 100000000,
        radiusSolar: 20000,
        luminositySolar: 5000000000, // 5 Billion Suns!
        visualType: "supernova",
        colorHex: "#ffffff",
        glowHex: "#38bdf8",
        internalLayers: [
          {
            name: "Collapsed Proto-Neutron Core",
            reaction: "p + e⁻ → n + ν_e (Neutronization)",
            tempK: "100 Billion K",
            density: "10¹⁴ g/cm³",
            thicknessRatio: 0.01,
            color: "#ffffff",
          },
          {
            name: "Outward Supersonic Shockwave",
            reaction: "r-process nucleosynthesis (Au, Pt, U)",
            tempK: "1 Billion K",
            density: "10⁴ g/cm³",
            thicknessRatio: 0.99,
            color: "#38bdf8",
          },
        ],
        summary:
          "Gravity crushes the iron core at 23% the speed of light. Electrons merge with protons to form neutrons, releasing 10⁵⁸ neutrinos that blast the outer star into space, outshining an entire galaxy!",
        scientificDetail:
          "E_total ≈ 10⁴⁶ Joules (99% carried by neutrinos, 1% kinetic energy of ejecta, 0.01% as visible light). Heavy elements like gold, platinum, and uranium are forged via rapid neutron capture (r-process).",
      },
      {
        id: "massive_remnant",
        name: "Neutron Star (Pulsar)",
        phaseNumber: 6,
        timeRangeYears: "Present into the Trillions of Years",
        coreProcess: "Supported by neutron degeneracy pressure & strong nuclear force",
        temperatureK: 1000000,
        radiusSolar: 0.000017, // ~12 km radius!
        luminositySolar: 0.01,
        visualType: "neutron_star",
        colorHex: "#67e8f9",
        glowHex: "#06b6d4",
        internalLayers: [
          {
            name: "Neutron Superfluid & Quark Core",
            reaction: "Degenerate neutron matter",
            tempK: "100 Million K (Core)",
            density: "10¹⁵ g/cm³",
            thicknessRatio: 0.9,
            color: "#cffafe",
          },
          {
            name: "Solid Iron/Crystalline Crust",
            reaction: "Magnetic dipole synchrotron jets",
            tempK: "1 Million K",
            density: "10¹¹ g/cm³",
            thicknessRatio: 0.1,
            color: "#06b6d4",
          },
        ],
        summary:
          "An entire solar mass squeezed into a sphere the size of a city (20 km diameter). Spinning hundreds of times per second, its magnetic beams sweep across space like a celestial lighthouse.",
        scientificDetail:
          "Density ≈ 3×10¹⁴ g/cm³ (a sugar cube weighs 400 million tons). Governed by the Tolman-Oppenheimer-Volkoff (TOV) equation.",
      },
    ],
  },

  // 4. Hyper-Massive Star (40+ M☉) - BLACK HOLE TRAJECTORY
  {
    id: "hyper_massive_40",
    name: "Hyper-Massive Star (40+ M☉) — Stellar Black Hole",
    initialMassSolar: 40.0,
    spectralClassZAMS: "O5V",
    totalLifespanYears: "~4 to 6 Million Years",
    description:
      "Extremely rare titan of the cosmos. Experiences colossal stellar wind mass loss, collapses directly or via hypernova, and tears spacetime to form a stellar-mass black hole.",
    finalRemnant: "Stellar Black Hole",
    remnantMassSolar: 12.0,
    willSupernova: true,
    colorHex: "#818CF8",
    stages: [
      {
        id: "hyper_cloud",
        name: "Dense Giant Cluster Cloud",
        phaseNumber: 1,
        timeRangeYears: "0 – 10,000 Years",
        coreProcess: "Extreme gravitational collapse in a massive cluster core",
        temperatureK: 40,
        radiusSolar: 10000,
        luminositySolar: 1.0,
        visualType: "cloud",
        colorHex: "#1e1b4b",
        glowHex: "#0f172a",
        internalLayers: [
          {
            name: "Hyper-Dense Clump",
            reaction: "Massive inflow collapse",
            tempK: "50 K",
            density: "10⁸ cm⁻³",
            thicknessRatio: 0.3,
            color: "#312e81",
          },
          {
            name: "Cluster Nursery",
            reaction: "Radiation-driven shock front",
            tempK: "30 K",
            density: "10⁶ cm⁻³",
            thicknessRatio: 0.7,
            color: "#0f172a",
          },
        ],
        summary: "Collapsing in the dense core of a star cluster like the Tarantula Nebula (R136).",
        scientificDetail:
          "Accretion overcomes massive radiative Eddington barrier via clumpy disk channels.",
      },
      {
        id: "hyper_ms",
        name: "O-Type Titan (O5V)",
        phaseNumber: 2,
        timeRangeYears: "10,000 – 4 Million Years",
        coreProcess: "Hyper-energetic CNO cycle near the Eddington Luminosity limit",
        temperatureK: 42000,
        radiusSolar: 14.0,
        luminositySolar: 350000,
        visualType: "main_sequence",
        colorHex: "#c7d2fe",
        glowHex: "#4f46e5",
        internalLayers: [
          {
            name: "Enormous CNO Core",
            reaction: "Near-Eddington fusion (T ≈ 45M K)",
            tempK: "45 Million K",
            density: "5 g/cm³",
            thicknessRatio: 0.5,
            color: "#ffffff",
          },
          {
            name: "Radiative Wind Envelope",
            reaction: "Radiative mass shedding (10⁻⁵ M☉/yr)",
            tempK: "42,000 K",
            density: "10⁻⁶ g/cm³",
            thicknessRatio: 0.5,
            color: "#818cf8",
          },
        ],
        summary:
          "Blazes with the light of 350,000 Suns. Radiation pressure is so intense it blows off entire atmospheres into interstellar space.",
        scientificDetail: "Lives for barely 4 million years before exhausting core hydrogen.",
      },
      {
        id: "hyper_wolf_rayet",
        name: "Luminous Blue Variable / Wolf-Rayet",
        phaseNumber: 3,
        timeRangeYears: "4 – 4.5 Million Years",
        coreProcess: "Exposed helium and nitrogen/carbon core with ferocious stellar winds",
        temperatureK: 50000,
        radiusSolar: 25.0,
        luminositySolar: 800000,
        visualType: "supergiant",
        colorHex: "#a78bfa",
        glowHex: "#7c3aed",
        internalLayers: [
          {
            name: "Helium/Carbon Core",
            reaction: "Triple-alpha & carbon burning",
            tempK: "300 Million K",
            density: "10⁴ g/cm³",
            thicknessRatio: 0.6,
            color: "#fef08a",
          },
          {
            name: "Stripped Wind Atmosphere",
            reaction: "Terminal velocities > 2,000 km/s",
            tempK: "50,000 K",
            density: "10⁻⁷ g/cm³",
            thicknessRatio: 0.4,
            color: "#a78bfa",
          },
        ],
        summary:
          "The star has stripped off its entire outer hydrogen envelope, exposing the churning helium and carbon nuclear core.",
        scientificDetail:
          "E.g., WR 102 or Eta Carinae. Massive mass-loss leaves a core too heavy for neutron degeneracy to support.",
      },
      {
        id: "hyper_hypernova",
        name: "Hypernova / Collapsar",
        phaseNumber: 4,
        timeRangeYears: "Milliseconds to Minutes",
        coreProcess: "Direct core collapse into a black hole with relativistic gamma-ray jets",
        temperatureK: 1000000000,
        radiusSolar: 10000,
        luminositySolar: 100000000000, // 100 Billion Suns!
        visualType: "supernova",
        colorHex: "#ffffff",
        glowHex: "#8b5cf6",
        internalLayers: [
          {
            name: "Forming Singularity",
            reaction: "Spacetime puncture",
            tempK: "Infinite",
            density: "Infinite",
            thicknessRatio: 0.01,
            color: "#000000",
          },
          {
            name: "Relativistic Polar Jets",
            reaction: "Long-duration Gamma-Ray Burst (GRB)",
            tempK: "10 Billion K",
            density: "10⁵ g/cm³",
            thicknessRatio: 0.99,
            color: "#8b5cf6",
          },
        ],
        summary:
          "The core collapses with such colossal mass that even neutron degeneracy cannot halt it. A black hole forms immediately, launching polar gamma-ray burst jets that punch through the star.",
        scientificDetail:
          "Collapsar model: Accretion disk around newborn black hole feeds relativistic MHD jets that drill out along rotational poles.",
      },
      {
        id: "hyper_black_hole",
        name: "Stellar-Mass Black Hole",
        phaseNumber: 5,
        timeRangeYears: "Trillions of Years (Hawking evaporation)",
        coreProcess: "Gravitational Singularity surrounded by an Event Horizon",
        temperatureK: 0.00000001, // Hawking temperature
        radiusSolar: 0.00005, // Event horizon radius ~35 km!
        luminositySolar: 0.000001,
        visualType: "black_hole",
        colorHex: "#000000",
        glowHex: "#7c3aed",
        internalLayers: [
          {
            name: "Central Singularity",
            reaction: "Zero volume, infinite density (General Relativity)",
            tempK: "N/A",
            density: "Infinite",
            thicknessRatio: 0.01,
            color: "#000000",
          },
          {
            name: "Event Horizon (Schwarzschild Radius)",
            reaction: "Escape velocity c = 300,000 km/s",
            tempK: "T_H ≈ 10⁻⁸ K",
            density: "N/A (Causal Boundary)",
            thicknessRatio: 0.1,
            color: "#000000",
          },
          {
            name: "X-ray Accretion Disk",
            reaction: "Gravitational friction & synchrotron radiation",
            tempK: "10 Million K",
            density: "10⁻² g/cm³",
            thicknessRatio: 0.89,
            color: "#7c3aed",
          },
        ],
        summary:
          "A bottomless pit in spacetime. Gravity is so extreme that not even light can escape from within the event horizon.",
        scientificDetail:
          "Schwarzschild radius R_s = 2GM/c² ≈ 2.95 km × (M / M☉). A 12 M☉ black hole has an event horizon radius of only ~35 km!",
      },
    ],
  },
];

export interface SubLesson10 {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  content: {
    junior: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    explorer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    astronomer: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
  };
}

export const MODULE_10_SUBLESSONS: SubLesson10[] = [
  {
    id: "10-01",
    number: 1,
    title: "1. Birth Inside a Molecular Cloud",
    subtitle: "Cold nebular nurseries, Jeans instability, and gravitational collapse",
    content: {
      junior: {
        summary:
          "Every star begins as a giant, dark, freezing-cold cloud of gas and dust floating in space! When a shockwave shakes the cloud, gravity starts pulling clumps of gas closer and closer together, like a snowball rolling down a hill.",
        keyConcepts: [
          "Stars are born inside cold, dark clouds called nebulae.",
          "Gravity pulls gas and dust together into tighter clumps.",
          "As the gas gets squeezed, it starts to heat up!",
        ],
        details: [
          "These stellar nurseries are freezing cold—about -250 degrees Celsius!",
          "Being super cold actually helps stars form, because cold gas doesn't push back as hard against gravity.",
          "Thousands of stars can be born inside a single giant cloud.",
        ],
        didYouKnow:
          "The famous 'Pillars of Creation' photographed by the James Webb Space Telescope are giant cosmic dust towers where baby stars are forming right now!",
      },
      explorer: {
        summary:
          "Stars form inside Giant Molecular Clouds (GMCs) composed mostly of molecular hydrogen (H₂) and helium at temperatures of 10 to 30 Kelvin. When a dense pocket exceeds the 'Jeans Mass', internal thermal gas pressure can no longer support the cloud against self-gravity, initiating collapse.",
        keyConcepts: [
          "Giant Molecular Clouds: Spans 100+ light-years with masses of 10⁴ to 10⁶ solar masses.",
          "Jeans Criterion: A cloud collapses when gravitational binding energy exceeds twice its internal thermal kinetic energy (2K + U < 0).",
          "Bok Globules: Dense, dark isolated nebular cores undergoing gravitational contraction.",
        ],
        details: [
          "External triggers like supernova shockwaves or spiral density waves in galaxies compress the gas, nudging it into collapse.",
          "Dust grains radiate away gravitational heat in the infrared, keeping the cloud cool so collapse can continue.",
          "As the cloud contracts, conservation of angular momentum spins it into a flattening disk.",
        ],
        didYouKnow:
          "Our entire Solar System—the Sun, Earth, oceans, and living creatures—was once a cold, dark molecular cloud about 4.6 billion years ago!",
      },
      astronomer: {
        summary:
          "Gravitational fragmentation is governed by the Jeans Mass formula: M_J ≈ (5 k T / G μ m_H)^(3/2) (3 / 4π ρ)^(1/2). As the cloud collapses and fragments isothermally, the Jeans mass decreases, producing a cluster of stellar-mass fragments governed by the Initial Mass Function (IMF, Salpeter power-law dN/dM ∝ M^(-2.35)).",
        keyConcepts: [
          "Virial Theorem: 2⟨K⟩ + ⟨Ω⟩ = 0 for stable systems. Collapse begins when |Ω| > 2K.",
          "Isothermal to Adiabatic Transition: Collapse remains isothermal as long as dust can radiate infrared photons; once opacity κ rises (optical depth τ > 1), gas traps heat and forms a hydrostatic core.",
          "Magnetic Braking & Ambipolar Diffusion: Magnetic fields thread the cloud, redistributing angular momentum outward through neutral-ion drift.",
        ],
        details: [
          "For typical GMC conditions (T = 10 K, n = 10⁴ cm⁻³), the initial Jeans mass is M_J ≈ 100–1,000 M☉, which fragments into stellar clumps of 0.1 to 50 M☉.",
          "The Salpeter IMF reveals that nature produces vastly more low-mass stars than massive stars: for every 20 M☉ O-star born, hundreds of red dwarfs are created.",
          "Observations in submillimeter wavelengths (ALMA) trace dust continuum emission and CO isotopologues (¹³CO, C¹⁸O) directly within active protostellar cores.",
        ],
        didYouKnow:
          "Without tiny interstellar dust grains (silicates and polycyclic aromatic hydrocarbons) to act as catalysts, hydrogen atoms in space could almost never pair up to form H₂ molecules!",
      },
    },
  },
  {
    id: "10-02",
    number: 2,
    title: "2. Protostars",
    subtitle: "Accretion disks, T Tauri winds, and the birth of a true star",
    content: {
      junior: {
        summary:
          "Before a star becomes a real star, it is called a 'protostar'—a baby star! It spins super fast and drinks up gas from a flat spinning pancake disk around it, while shooting giant laser-like jets of fire from its top and bottom.",
        keyConcepts: [
          "A baby star is called a protostar.",
          "It gathers matter from a flat spinning disk of gas and dust.",
          "Powerful jets shoot out from its poles into deep space.",
        ],
        details: [
          "Planets will eventually form out of the leftover dust in the spinning disk!",
          "A protostar is not doing nuclear fusion yet; it glows because it is being squeezed tightly by gravity.",
          "This baby stage lasts a few hundred thousand to a few million years.",
        ],
        didYouKnow:
          "Protostellar jets can shoot hot gas across space at over 1 million kilometers per hour, carving out glowing bubbles called Herbig-Haro objects!",
      },
      explorer: {
        summary:
          "A protostar is an early evolutionary phase where the central core is in hydrostatic equilibrium, but is still accreting mass from its surrounding circumstellar envelope. It is powered purely by gravitational Kelvin-Helmholtz contraction and early deuterium fusion.",
        keyConcepts: [
          "Accretion Disk: Angular momentum forces infalling gas into a flat circumstellar disk where planetesimals form.",
          "Bipolar Jets & Herbig-Haro Objects: Strong magnetic fields collimate escaping plasma into relativistic polar jets.",
          "T Tauri Phase: Pre-main-sequence stars with violent magnetic flare activity, high stellar winds, and rapid rotation.",
        ],
        details: [
          "Core temperature gradually rises from tens of thousands of Kelvin to millions of Kelvin.",
          "At about 1 Million Kelvin, trace deuterium (²H) fuses with protons, but this fuel is quickly exhausted.",
          "Once the core hits roughly 10 to 15 Million Kelvin, true hydrogen fusion ignites, radiation pressure pushes away the remaining accretion envelope, and a new star is born on the Zero-Age Main Sequence (ZAMS)!",
        ],
        didYouKnow:
          "If a collapsing clump has less than 0.08 times the mass of the Sun (about 80 Jupiter masses), its core never gets hot enough to ignite hydrogen fusion—it becomes a 'failed star' called a Brown Dwarf!",
      },
      astronomer: {
        summary:
          "Pre-main-sequence evolution proceeds along convective Hayashi tracks and radiative Henyey tracks on the H-R diagram. The Kelvin-Helmholtz timescale governs this phase: τ_KH = G M² / (R L). Hydrogen ignition halts contraction when nuclear energy generation ε_nuc matches surface bolometric luminosity L.",
        keyConcepts: [
          "Hayashi Limit: Convection enforces a maximum surface temperature boundary (T_eff ≈ 3,000–4,000 K); protostars drop vertically in luminosity at constant temperature.",
          "Henyey Track: Stars with M > 0.5 M☉ develop a radiative core, turning horizontally to the left on the H-R diagram toward higher surface temperatures.",
          "Brown Dwarf Threshold: Electron degeneracy pressure halts contraction before central temperature reaches T_crit ≈ 3×10⁶ K if M < 0.075–0.08 M☉ (for solar metallicity).",
        ],
        details: [
          "Magnetic disk-locking regulates protostellar rotation: magnetic field lines connect the protostar to the inner edge of the accretion disk, carrying away angular momentum.",
          "The solar nebula was swept clean of leftover hydrogen and helium gas when the young Sun entered its vigorous T Tauri wind phase approximately 4.56 billion years ago.",
          "Spectral energy distributions (SEDs) classify young stellar objects into Class 0, I, II (classical T Tauri), and III (weak-lined T Tauri) based on the infrared slope α_IR.",
        ],
        didYouKnow:
          "Astronomer Chushiro Hayashi proved mathematically that no star in hydrostatic equilibrium can exist to the right of the Hayashi track—the physics of molecular opacity makes that whole region forbidden!",
      },
    },
  },
  {
    id: "10-03",
    number: 3,
    title: "3. Main-Sequence Stars",
    subtitle: "Hydrostatic equilibrium, the mass-luminosity relation, and stellar lifespans",
    content: {
      junior: {
        summary:
          "The Main Sequence is the longest, happiest part of a star's life—its adult years! In this stage, the star is in a perfect tug-of-war: gravity tries to crush it inward, but the fierce heat from its nuclear core pushes right back outward, keeping the star perfectly round and steady.",
        keyConcepts: [
          "Stars spend about 90% of their lives on the Main Sequence.",
          "Gravity pulling in is perfectly balanced by heat pushing out.",
          "Our Sun is currently on the Main Sequence and has been for 4.6 billion years!",
        ],
        details: [
          "Every second, our Sun turns 600 million tons of hydrogen into helium.",
          "Heavy blue stars burn through their fuel super fast in just millions of years.",
          "Tiny red dwarf stars sip their fuel so slowly they can live for trillions of years!",
        ],
        didYouKnow:
          "Our Sun is about 4.6 billion years old, right in the middle of its 10-billion-year main-sequence life!",
      },
      explorer: {
        summary:
          "A star joins the Main Sequence when core hydrogen fusion stabilizes. It exists in hydrostatic equilibrium, where the inward force of gravity is balanced by outward thermal and radiation pressure. A star's birth mass is the single most important parameter determining its temperature, luminosity, and total lifespan.",
        keyConcepts: [
          "Hydrostatic Equilibrium: dP/dr = -G M ρ / r² maintains absolute structural stability.",
          "Energy Generation: Low-mass stars fuse via the proton-proton chain; massive stars fuse via the hotter CNO cycle.",
          "Mass-Luminosity Scaling: Luminosity scales steeply with mass: L ∝ M^(3.5).",
        ],
        details: [
          "A star with 10 times the Sun's mass produces over 3,000 times more light, meaning it burns its fuel 300 times faster!",
          "Main-sequence lifespan formula: Lifespan ≈ 10 billion years × (Mass / Sun Mass)^(-2.5).",
          "Low-mass red dwarfs will still be shining when all other stars in the universe have died.",
        ],
        didYouKnow:
          "While massive stars live glamorous, fast, short lives of only 10 to 30 million years, humble red dwarfs live so long that not a single red dwarf in the entire universe has died of old age yet!",
      },
      astronomer: {
        summary:
          "The main sequence is defined by core hydrogen burning in nuclear and thermal equilibrium. The Eddington standard model and homology relations demonstrate that luminosity scales as L ∝ M³ to M⁴, driven by opacity laws (Kramers' opacity κ ∝ ρ T^(-7/2) transitioning to electron scattering κ_es = constant). Lifespan τ_MS ≈ M / L ∝ M^(-2.5).",
        keyConcepts: [
          "Simplified Lifetime Relationship: τ_MS ≈ 10¹⁰ yr × (M / M☉)⁻².⁵. Limitation: fails for M < 0.4 M☉ (complete convection) and M > 20 M☉ (Eddington radiation pressure limit & strong stellar winds).",
          "Energy Transport Transition: Stars with M < 1.3 M☉ have radiative cores and convective envelopes; stars with M > 1.3 M☉ have convective cores (due to steep CNO temperature sensitivity) and radiative envelopes.",
          "Luminosity Drift: As hydrogen converts to helium, mean molecular weight μ increases from ~0.6 to ~1.3, requiring central temperature to rise (T_c ∝ μ) and causing the Sun to brighten by ~30% over its main-sequence life.",
        ],
        details: [
          "The Sun was ~30% dimmer when life first began on Earth 3.8 billion years ago—a paradox known as the Faint Young Sun Paradox, resolved by high early greenhouse gas concentrations (CO₂, CH₄).",
          "In approximately 1 billion years, the Sun's steadily increasing luminosity (+10% per Gyr) will trigger a moist greenhouse runaway on Earth, evaporating the oceans.",
          "ZAMS to TAMS: As core hydrogen fraction X_c drops to 0, the isothermal helium core reaches the Schönberg-Chandrasekhar mass limit (~8–10% of total mass), initiating core contraction.",
        ],
        didYouKnow:
          "Even though high-mass stars have 20 times more fuel than our Sun, they burn it at such an astronomical rate that their lifespans are shorter than the time it took dinosaurs to evolve on Earth!",
      },
    },
  },
  {
    id: "10-04",
    number: 4,
    title: "4. Stellar Aging",
    subtitle: "Core hydrogen exhaustion, subgiants, and the Schönberg-Chandrasekhar limit",
    content: {
      junior: {
        summary:
          "What happens when a star runs out of fuel in its engine? When the center runs out of hydrogen gas, gravity starts winning the tug-of-war! The core shrinks tightly, which paradoxically heats up the layers around it and causes the star's outer skin to swell up like a gigantic hot-air balloon.",
        keyConcepts: [
          "Aging begins when hydrogen in the core is completely used up.",
          "The star's core shrinks and gets hotter, while the outer layers expand and cool.",
          "The star turns into an orange subgiant on its way to becoming a giant.",
        ],
        details: [
          "Our Sun has enough hydrogen fuel in its core to keep going for another 5 billion years.",
          "When the core shrinks, it is made of pure helium 'ash' left behind by fusion.",
          "The expanding outer surface cools down, shifting from golden yellow to glowing orange-red.",
        ],
        didYouKnow:
          "When stars run out of core fuel, they don't fade away quietly—they actually swell up and become hundreds of times brighter than before!",
      },
      explorer: {
        summary:
          "When hydrogen in the core is exhausted, fusion ceases in the center. Without outward radiation pressure, the helium core contracts under gravity, converting gravitational potential energy into heat. This extreme heat ignites a 'shell' of hydrogen fusion just outside the core, driving rapid expansion of the outer envelope.",
        keyConcepts: [
          "Terminal Age Main Sequence (TAMS): Core hydrogen reaches zero percent.",
          "Hydrogen-Shell Burning: A thin shell surrounding the inert helium core fuses hydrogen at ferocious rates.",
          "Mirror Principle: As the core contracts, the envelope must expand enormously to maintain equilibrium.",
        ],
        details: [
          "The star leaves the main sequence and moves across the 'Subgiant Branch' on the H-R diagram.",
          "Because the outer envelope expands so dramatically, its surface area multiplies by thousands, but its surface temperature cools down.",
          "This is the beginning of the end of the star's life.",
        ],
        didYouKnow:
          "The Schönberg-Chandrasekhar limit says that an inert helium core can only support about 10% of the star's total weight before gravity inevitably crushes it!",
      },
      astronomer: {
        summary:
          "Core exhaustion triggers the Schönberg-Chandrasekhar instability: an isothermal, non-degenerate core cannot support more than q_SC = (M_c / M)_max ≈ 0.37 (μ_env / μ_core)² ≈ 0.08–0.10 of the star's total mass. Once exceeded, the core contracts on a thermal Kelvin-Helmholtz timescale, igniting hydrogen shell burning and ascending the Red Giant Branch (RGB).",
        keyConcepts: [
          "Schönberg-Chandrasekhar Limit: Non-degenerate isothermal cores collapse rapidly once helium core mass fraction exceeds ~8%.",
          "Mirror Principle: Governed by the stellar virial theorem; a contracting inner shell heats and expands the loosely bound outer envelope.",
          "First Dredge-Up: Deepening convective envelope reaches down into regions partially processed by the CNO cycle, bringing ¹⁴N and ¹³C to the surface and altering atmospheric isotopic ratios.",
        ],
        details: [
          "In low-mass stars (M < 2 M☉), the contracting helium core becomes degenerate (governed by quantum electron degeneracy pressure) before reaching helium ignition temperatures.",
          "In intermediate and massive stars (M > 2 M☉), the core does not become degenerate immediately; it heats smoothly to T ≈ 10⁸ K, avoiding the explosive helium flash.",
          "During the subgiant phase, the star's path on the H-R diagram moves nearly horizontally to the right at roughly constant luminosity.",
        ],
        didYouKnow:
          "Even though the outer envelope expands to hundreds of times its original radius, the central core shrinks to something smaller than the Earth, reaching densities of over 1 ton per cubic centimeter!",
      },
    },
  },
  {
    id: "10-05",
    number: 5,
    title: "5. Red Giants and Red Supergiants",
    subtitle: "The helium flash, triple-alpha fusion, and onion-skin nucleosynthesis",
    content: {
      junior: {
        summary:
          "Now the star is a RED GIANT! It is so enormous that our Sun will one day swallow Mercury, Venus, and possibly Earth! Inside its core, it gets so hot (100 million degrees) that helium atoms start smashing together to make carbon and oxygen.",
        keyConcepts: [
          "Red giants are gigantic dying stars with cool reddish surfaces.",
          "Our Sun will become a red giant in about 5 billion years.",
          "Massive stars become Red Supergiants wide enough to swallow Jupiter!",
        ],
        details: [
          "Even though the surface is cooler (red), the star is so huge that its total brightness is thousands of times greater than today.",
          "Inside massive stars, layers upon layers of different elements are created—carbon, oxygen, silicon, and iron!",
          "Every carbon atom in your DNA was forged inside an ancient red giant star.",
        ],
        didYouKnow:
          "Betelgeuse in the constellation Orion is a red supergiant so gigantic that if you put it at the center of our solar system, its surface would reach all the way to Jupiter!",
      },
      explorer: {
        summary:
          "In a Red Giant (for Sun-like stars) or Red Supergiant (for massive stars), extreme core contraction drives temperatures up to 100 Million Kelvin, igniting helium fusion via the Triple-Alpha Process (3 ⁴He → ¹²C). In Sun-like stars, electron degeneracy in the core causes this ignition to occur as an explosive 'Helium Flash'. Massive stars continue fusing heavier elements in concentric onion-like shells.",
        keyConcepts: [
          "Triple-Alpha Process: Three helium-4 nuclei fuse into one carbon-12 nucleus, followed by alpha capture to make oxygen-16.",
          "Helium Flash: In degenerate low-mass cores, temperature rises without pressure expansion, releasing explosive energy in minutes (contained inside the star).",
          "Onion-Skin Model: Massive stars develop concentric burning shells: Hydrogen → Helium → Carbon → Neon → Oxygen → Silicon → Iron.",
        ],
        details: [
          "After the helium flash, the star settles onto the 'Horizontal Branch', stably burning core helium for ~100 million years.",
          "When core helium is exhausted, the star ascends the 'Asymptotic Giant Branch' (AGB), experiencing violent thermal pulses.",
          "Massive stars (>8 solar masses) fuse through silicon in just days, building an iron-56 core at 3 billion Kelvin.",
        ],
        didYouKnow:
          "THE SUN WILL NEVER EXPLODE AS A SUPERNOVA! The Sun only has enough gravity to reach carbon and oxygen; it can never get hot enough to fuse carbon, so it will gently puff off its outer layers instead.",
      },
      astronomer: {
        summary:
          "Helium fusion proceeds via Hoyle's resonant state: ⁴He + ⁴He ⇌ ⁸Be, then ⁸Be + ⁴He → ¹²C* → ¹²C + γ. The reaction rate scales steeply as ε_3α ∝ ρ² T⁴⁰. In degenerate cores (P ∝ ρ^(5/3)), ∂P/∂T = 0, causing a thermal runaway (the Helium Flash) generating peak luminosities of ~10¹¹ L☉ inside the core before degeneracy is lifted. Massive stars avoid degeneracy and burn C, Ne, O, and Si shells up to the peak of the binding energy curve (⁵⁶Fe/⁵⁶Ni).",
        keyConcepts: [
          "Fred Hoyle Resonant Carbon State: In 1953, Fred Hoyle predicted an excited quantum 0⁺ energy state at 7.65 MeV in ¹²C, without which carbon could not form in the universe.",
          "AGB Thermal Pulses (TP-AGB): Helium-shell flashes induce thin-shell instabilities, driving episodic superwinds (mass loss ~10⁻⁴ M☉/yr) and s-process neutron capture.",
          "Silicon Burning & Photodisintegration: At T > 3×10⁹ K, intense gamma-ray photons knock alpha particles out of silicon nuclei, which then combine with remaining nuclei via an alpha-network up to iron-peak elements.",
        ],
        details: [
          "Nuclear Timescales for a 15 M☉ star: Hydrogen lasts ~12 Million years; Helium lasts ~1 Million years; Carbon lasts ~600 years; Neon lasts ~1 year; Oxygen lasts ~6 months; Silicon burning to iron lasts LESS THAN 24 HOURS!",
          "Iron-56 core has reached the maximum nuclear binding energy per nucleon (8.8 MeV). Fusion of iron is endothermic (consumes energy), destroying the star's pressure support.",
        ],
        didYouKnow:
          "Fred Hoyle deduced the existence of the resonant state in carbon solely from the fact that carbon-based humans exist to wonder about it—one of the most famous applications of anthropic reasoning in astrophysics!",
      },
    },
  },
  {
    id: "10-06",
    number: 6,
    title: "6. White Dwarfs",
    subtitle: "Planetary nebulae, electron degeneracy pressure, and the Chandrasekhar limit",
    content: {
      junior: {
        summary:
          "For stars like our Sun, death is gentle and beautiful! The star puffs its outer colorful gas layers into space like a giant glowing soap bubble, called a 'planetary nebula'. Left behind in the center is a tiny, blazing-hot, super-heavy corpse called a White Dwarf.",
        keyConcepts: [
          "Sun-like stars do not explode; they gently puff off their outer layers.",
          "The glowing gas bubble is called a Planetary Nebula.",
          "The tiny leftover core is a White Dwarf about the size of Earth!",
        ],
        details: [
          "A white dwarf is so heavy that a single teaspoon of its material weighs as much as an elephant or truck!",
          "It has no fuel left to burn; it just slowly cools down over trillions of years.",
          "Our Sun will become a white dwarf in about 5 to 6 billion years.",
        ],
        didYouKnow:
          "Inside a white dwarf, the carbon and oxygen atoms arrange themselves into a giant cosmic crystal—meaning old white dwarfs are essentially giant diamonds thousands of kilometers wide!",
      },
      explorer: {
        summary:
          "Stars with initial masses under ~8 solar masses cannot ignite carbon fusion. Thermal pulses on the Asymptotic Giant Branch blow away the entire outer envelope at 20 to 30 km/s, forming a glowing Planetary Nebula. The exposed core cools as a White Dwarf, supported against gravitational collapse entirely by quantum Electron Degeneracy Pressure.",
        keyConcepts: [
          "Planetary Nebula: Expanding envelope of gas ionized by ultraviolet radiation from the 100,000 K central star.",
          "Electron Degeneracy Pressure: Quantum mechanical Pauli Exclusion Principle prevents electrons from occupying the same state.",
          "Chandrasekhar Limit (1.44 M☉): The maximum mass an electron-degenerate white dwarf can support before collapsing.",
        ],
        details: [
          "White dwarfs have typical masses around 0.6 M☉ packed into a volume no larger than Earth (radius ~6,000 km).",
          "Because electron degeneracy is independent of temperature, a white dwarf does not shrink as it cools.",
          "Over trillions of years, it will slowly radiate its residual thermal heat until it becomes a cold, dark 'Black Dwarf'.",
        ],
        didYouKnow:
          "Subrahmanyan Chandrasekhar calculated the 1.44-solar-mass limit in 1930 on a steamship journey from India to England when he was only 19 years old!",
      },
      astronomer: {
        summary:
          "Planetary nebula ejection is driven by radiation pressure on dust grains during AGB thermal pulses. The leftover core is an electron-degenerate carbon-oxygen dwarf governed by relativistic Fermi-Dirac statistics: P_e = (1/3) ∫ [p² c² / √(p² c² + m_e² c⁴)] f(p) d³p. In the ultra-relativistic limit (p >> m_e c), P ∝ ρ^(4/3), leading to the finite mass limit M_Ch ≈ 1.44 M☉ (Chandrasekhar 1931).",
        keyConcepts: [
          "Mestel's Cooling Law: Luminosity decays over time as L ∝ t^(-7/2), governed by ion thermal energy and degenerate electron thermal conductivity.",
          "Coulomb Crystallization: When the plasma parameter Γ = (Z e)² / (a_i k T) exceeds 178, the degenerate carbon-oxygen ions freeze into a body-centered cubic (BCC) crystalline lattice.",
          "Inverted Mass-Radius Relation: R ∝ M^(-1/3). Heavier white dwarfs have stronger gravity and are physically smaller in diameter!",
        ],
        details: [
          "Type Ia Supernovae: If an accretion companion in a binary system pushes a white dwarf to M_Ch ≈ 1.44 M☉, carbon ignites in a thermonuclear runaway, completely destroying the white dwarf.",
          "Gaia DR3 white dwarf cooling tracks reveal distinct branches corresponding to hydrogen atmospheres (DA) versus helium atmospheres (DB).",
        ],
        didYouKnow:
          "In 2004, astronomers discovered that the white dwarf BPM 37093 in Centaurus has crystallized into a diamond core weighing 5 million trillion trillion pounds (10 billion trillion trillion carats)!",
      },
    },
  },
  {
    id: "10-07",
    number: 7,
    title: "7. Supernovae",
    subtitle: "Core collapse, neutrino bursts, shock breakout, and cosmic element forging",
    content: {
      junior: {
        summary:
          "For monster stars (at least 8 times heavier than our Sun), death is a titanic explosion called a SUPERNOVA! In less than a second, the star's core collapses, blasting the rest of the star across the universe with the brightness of 10 billion suns!",
        keyConcepts: [
          "Only massive stars explode in a core-collapse supernova.",
          "Our Sun is NOT massive enough to ever explode like this.",
          "A supernova outshines an entire galaxy of billions of stars!",
        ],
        details: [
          "The explosion blasts gold, silver, iron, and oxygen out into deep space.",
          "These scattered elements become part of new gas clouds that form future stars and planets.",
          "Without ancient supernovae explosions, our planet Earth and our bodies could not exist!",
        ],
        didYouKnow:
          "All the gold in jewelry, the iron in your blood, and the calcium in your bones came from exploding stars billions of years ago!",
      },
      explorer: {
        summary:
          "When a massive star (>8 M☉) builds an iron core exceeding the Chandrasekhar limit (1.44 M☉), electron degeneracy fails. The core collapses in a fraction of a second from 5,000 km to just 20 km. Electrons and protons merge into neutrons, creating a proto-neutron star and blasting out 10⁵⁸ neutrinos that drive a colossal Type II Supernova explosion.",
        keyConcepts: [
          "Core Collapse: Gravity collapses the iron core at 70,000 km/s (nearly 25% the speed of light!).",
          "Neutronization: Protons and electrons merge: p + e⁻ → n + ν_e, releasing an immense flash of neutrinos.",
          "r-Process Nucleosynthesis: Explosive rapid neutron capture creates elements heavier than iron, including gold, platinum, and uranium.",
        ],
        details: [
          "99% of a supernova's energy is carried away by invisible neutrinos; only 1% powers the physical explosion, and 0.01% produces visible light.",
          "In 1987, Supernova 1987A in the Large Magellanic Cloud allowed scientists on Earth to detect these neutrinos 3 hours before visible light broke through!",
          "The expanding debris cloud is called a Supernova Remnant (like the Crab Nebula).",
        ],
        didYouKnow:
          "Supernova 1054 was so intensely bright that Chinese and Native American astronomers recorded seeing it shine clearly in broad daylight for 23 straight days!",
      },
      astronomer: {
        summary:
          "Type II, Ib, and Ic supernovae occur via iron core photodisintegration: ⁵⁶Fe + γ → 13 ⁴He + 4 n - 124 MeV, followed by ⁴He + γ → 2 p + 2 n - 28.3 MeV. This endothermic catastrophe removes pressure support, initiating collapse at free-fall velocities. The core rebounds at nuclear saturation density (ρ_nuc ≈ 2.8×10¹⁴ g/cm³), launching an outward shockwave revived by neutrino heating (Bethe-Wilson delayed neutrino-driven mechanism).",
        keyConcepts: [
          "Photodisintegration & Electron Capture: Saps core thermal energy and drops electron fraction Y_e from ~0.42 to ~0.30.",
          "Core Bounce & Shock Stalling: Rebound shock stalls at r ≈ 150 km due to dissociation of iron nuclei (8.8 MeV per nucleon), requiring neutrino deposition in the gain region to revive.",
          "Total Energy Budget: E_bind ≈ 3 G M_NS² / (5 R_NS) ≈ 3×10⁵³ ergs (3×10⁴⁶ J). Neutrino luminosity during the first second exceeds the optical luminosity of the entire observable universe combined!",
        ],
        details: [
          "Classification: Type II exhibits prominent hydrogen Balmer lines in spectra; Type Ib lacks hydrogen but shows helium; Type Ic lacks both hydrogen and helium (stripped-envelope progenitor).",
          "Pair-Instability Supernovae: Stars with initial mass 140–260 M☉ produce high-energy gamma rays that convert into electron-positron pairs, dropping radiation pressure and completely destroying the star without leaving any remnant behind.",
        ],
        didYouKnow:
          "When Supernova 1987A occurred, Kamiokande II and IMB underground detectors recorded a total of 19 neutrinos—proving the core-collapse mechanism of astrophysics and earning Masatoshi Koshiba the 2002 Nobel Prize!",
      },
    },
  },
  {
    id: "10-08",
    number: 8,
    title: "8. Neutron Stars and Stellar Black Holes",
    subtitle: "Pulsars, magnetars, the TOV limit, and gravitational event horizons",
    content: {
      junior: {
        summary:
          "What is left behind after a massive star explodes? Either a Neutron Star (a city-sized super-magnet that spins hundreds of times every second) or a Black Hole (a place where gravity is so strong that not even light can ever escape)!",
        keyConcepts: [
          "Neutron stars pack an entire star into a sphere the size of a city (20 km across).",
          "Pulsars spin super fast and flash like cosmic lighthouses.",
          "The most massive stars collapse into Black Holes where gravity traps everything.",
        ],
        details: [
          "A single sugar cube of neutron star material would weigh as much as all of humanity combined!",
          "Neutron stars have magnetic fields trillions of times stronger than Earth's.",
          "At the edge of a black hole (the event horizon), time actually appears to stand still to an outside observer.",
        ],
        didYouKnow:
          "The fastest spinning known pulsar, PSR J1748-2446ad, spins around 716 times EVERY SECOND—its equator is moving at 24% the speed of light!",
      },
      explorer: {
        summary:
          "If the collapsing core of a supernova is between 1.4 and 2.16 solar masses, it is halted by Neutron Degeneracy Pressure, forming a Neutron Star. If the core mass exceeds the Tolman-Oppenheimer-Volkoff (TOV) limit (~2.16 to 3 M☉), gravity crushes matter into a gravitational singularity—a Stellar Black Hole.",
        keyConcepts: [
          "Neutron Degeneracy Pressure: Quantum force between neutrons prevents further collapse up to the TOV limit.",
          "Pulsars: Magnetized neutron stars with beaming radio/X-ray jets sweeping past Earth.",
          "Event Horizon: The point of no return where escape velocity equals the speed of light (c).",
          "Schwarzschild Radius: R_s = 2GM / c² (~3 km per solar mass).",
        ],
        details: [
          "Magnetars possess magnetic fields of 10¹⁵ Gauss, capable of wiping credit cards from hundreds of thousands of miles away.",
          "A 10-solar-mass black hole has an event horizon radius of only about 30 kilometers.",
          "Gravitational waves from colliding neutron stars (kilonovae) were directly detected by LIGO in 2017, proving where heavy elements like gold are created.",
        ],
        didYouKnow:
          "If you fell into a stellar-mass black hole feet first, gravity at your feet would be so much stronger than at your head that you would be stretched out like a noodle—a real scientific process astrophysicists call 'Spaghettification'!",
      },
      astronomer: {
        summary:
          "Neutron star structure is described by the Tolman-Oppenheimer-Volkoff relativistic hydrostatic equation: dP/dr = - (G M ρ / r²) [1 + P/(ρ c²)] [1 + 4π r³ P / (M c²)] [1 - 2GM / (r c²)]⁻¹. The maximum mass M_TOV ≈ 2.16 M☉ is governed by the nuclear equation of state at supranuclear densities. Beyond M_TOV, complete gravitational collapse produces a Kerr (rotating) or Schwarzschild (static) black hole characterized solely by mass M, spin J, and charge Q (No-Hair Theorem).",
        keyConcepts: [
          "TOV Limit: Relativistic limit analogous to the Chandrasekhar limit, incorporating nuclear repulsive forces at short range.",
          "Gravitational Redshift: Photons climbing out of the deep potential well lose energy: 1 + z = (1 - 2GM / r c²)⁻¹/².",
          "Innermost Stable Circular Orbit (ISCO): For a non-rotating black hole, ISCO = 3 R_s = 6 GM/c². Any matter crossing inside must plunge into the horizon.",
          "Accretion Physics: Matter in an accretion disk converts gravitational potential energy to radiation with up to 42% efficiency (for an extreme Kerr black hole), dwarfing the 0.7% efficiency of nuclear fusion.",
        ],
        details: [
          "LIGO/Virgo gravitational wave detections (e.g., GW150914, GW170817) have measured the merger of binary black holes and binary neutron stars, confirming general relativity in the strong-field dynamical regime.",
          "Hawking radiation dictates that black holes slowly evaporate over timescales τ_evap ≈ 10⁶⁷ yr × (M / M☉)³.",
        ],
        didYouKnow:
          "In 2019, the Event Horizon Telescope combined radio dishes around the entire planet to capture the first direct optical image of a black hole's photon ring and shadow in galaxy M87!",
      },
    },
  },
];

export interface DestinyChallenge {
  id: string;
  name: string;
  initialMass: number;
  initialMassLabel: string;
  spectralType: string;
  context: string;
  options: {
    label: string;
    remnant: string;
    willSupernova: boolean;
    fusesPastCarbon: boolean;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export const DESTINY_CHALLENGES: DestinyChallenge[] = [
  {
    id: "destiny_sun",
    name: "Our Sun (1.0 M☉)",
    initialMass: 1.0,
    initialMassLabel: "1.0 Solar Masses",
    spectralType: "G2V Yellow Dwarf",
    context: "A stable star with 1.0 solar mass currently in the middle of its main-sequence life.",
    options: [
      {
        label: "Red Giant → Planetary Nebula → Carbon-Oxygen White Dwarf",
        remnant: "White Dwarf (~0.55 M☉)",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: true,
        explanation:
          "Correct! The Sun lacks the mass to ignite carbon. It will expand into a red giant, shed its outer envelope as a planetary nebula, and leave an Earth-sized white dwarf. IT WILL NEVER EXPLODE AS A SUPERNOVA.",
      },
      {
        label: "Red Supergiant → Core-Collapse Supernova → Pulsar",
        remnant: "Neutron Star",
        willSupernova: true,
        fusesPastCarbon: true,
        isCorrect: false,
        explanation:
          "Incorrect. The Sun does NOT have enough mass (requires at least 8 M☉) to trigger a core-collapse supernova.",
      },
      {
        label: "Convective Red Dwarf → Helium White Dwarf without expanding",
        remnant: "Helium White Dwarf",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation:
          "Incorrect. The Sun is not fully convective; it will definitely expand into a Red Giant.",
      },
    ],
  },
  {
    id: "destiny_betelgeuse",
    name: "Betelgeuse Progenitor (18.0 M☉)",
    initialMass: 18.0,
    initialMassLabel: "18.0 Solar Masses",
    spectralType: "O9V Blue Star",
    context: "A massive, hot blue star born in the Orion molecular cloud.",
    options: [
      {
        label: "Red Giant → Planetary Nebula → Carbon-Oxygen White Dwarf",
        remnant: "White Dwarf",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation:
          "Incorrect. An 18 M☉ star easily exceeds the 8 M☉ threshold for core-collapse supernovae.",
      },
      {
        label: "Red Supergiant → Onion-Skin Burning → Type II Supernova → Neutron Star (Pulsar)",
        remnant: "Neutron Star (~1.5 M☉)",
        willSupernova: true,
        fusesPastCarbon: true,
        isCorrect: true,
        explanation:
          "Correct! With 18 M☉, it fuses elements through carbon, oxygen, and silicon down to iron. When the iron core collapses, it detonates in a Type II supernova leaving a rapidly spinning neutron star.",
      },
      {
        label: "Direct Collapse → Black Hole with zero supernova explosion",
        remnant: "Black Hole",
        willSupernova: false,
        fusesPastCarbon: true,
        isCorrect: false,
        explanation:
          "Incorrect. An 18 M☉ star produces a violent Type II supernova explosion and leaves a neutron star.",
      },
    ],
  },
  {
    id: "destiny_proxima",
    name: "Proxima Centauri Twin (0.15 M☉)",
    initialMass: 0.15,
    initialMassLabel: "0.15 Solar Masses",
    spectralType: "M5.5V Red Dwarf",
    context: "A tiny, dim red dwarf fusing hydrogen in its core.",
    options: [
      {
        label: "Fully Convective Dwarf → 4 Trillion Year Life → Helium White Dwarf",
        remnant: "Helium White Dwarf (~0.15 M☉)",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: true,
        explanation:
          "Correct! At 0.15 M☉, the star is fully convective from core to surface. It circulates almost 100% of its fuel, lives for trillions of years, and never undergoes a red giant expansion.",
      },
      {
        label: "Red Giant Expansion → Helium Flash → Planetary Nebula",
        remnant: "Carbon-Oxygen White Dwarf",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation:
          "Incorrect. Low-mass stars below ~0.3 M☉ never become red giants because they don't develop degenerate helium cores surrounded by hydrogen shells.",
      },
      {
        label: "Rapid Core Contraction → Type Ia Supernova",
        remnant: "None",
        willSupernova: true,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation: "Incorrect. Single stars never undergo Type Ia supernovae.",
      },
    ],
  },
  {
    id: "destiny_eta_carinae",
    name: "Eta Carinae Class Monster (60 M☉)",
    initialMass: 60.0,
    initialMassLabel: "60.0 Solar Masses",
    spectralType: "O3V Hypergiant",
    context: "A blistering hyper-massive star radiating over 1 million solar luminosities.",
    options: [
      {
        label: "Luminous Blue Variable / Wolf-Rayet → Hypernova → Stellar Black Hole",
        remnant: "Stellar Black Hole (>15 M☉)",
        willSupernova: true,
        fusesPastCarbon: true,
        isCorrect: true,
        explanation:
          "Correct! Extremely massive stars shed their envelopes as Wolf-Rayet stars and undergo core collapse where the iron core mass easily exceeds the TOV limit (~2.2 M☉), crushing into a stellar black hole.",
      },
      {
        label: "Standard Red Giant → Planetary Nebula → White Dwarf",
        remnant: "White Dwarf",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation: "Incorrect. A 60 M☉ star is vastly above the white dwarf mass boundary.",
      },
      {
        label: "Helium White Dwarf Remnant",
        remnant: "Helium White Dwarf",
        willSupernova: false,
        fusesPastCarbon: false,
        isCorrect: false,
        explanation: "Incorrect. Only very low-mass red dwarfs become helium white dwarfs.",
      },
    ],
  },
];

export const MODULE_10_SOURCES: ScientificSource[] = [
  {
    title: "NASA Astrophysics: How Do Stars Form, Live and Die?",
    organization: "NASA",
    url: "https://science.nasa.gov/astrophysics/focus-areas/how-do-stars-form-and-evolve/",
    note: "Comprehensive overview of stellar nucleosynthesis, core collapse, and evolutionary timescales.",
  },
  {
    title: "ESA Hubble & Webb: Supernovae & Stellar Remnants",
    organization: "ESA",
    url: "https://webbtelescope.org/science/stars-and-nebulae",
    note: "High-resolution observations of planetary nebulae, supernova remnants, and protostellar accretion disks.",
  },
  {
    title: "IAU Commission G2: Massive Stars & Supernova Progenitors",
    organization: "IAU",
    url: "https://www.iau.org/science/scientific_bodies/commissions/G2/",
    note: "Standards for stellar mass boundaries (0.08 M☉ brown dwarf limit, 8 M☉ supernova threshold, 1.44 M☉ Chandrasekhar mass).",
  },
  {
    title: "Chandra X-Ray Observatory: Neutron Stars, Pulsars and Black Holes",
    organization: "Chandra",
    url: "https://chandra.harvard.edu/xray_sources/neutron_stars.html",
    note: "Observational high-energy physics of degenerate cores, relativistic jets, and accretion disks.",
  },
];

export const MODULE_10_LESSON: LessonModule = {
  moduleId: "10",
  moduleName: "Birth, Life & Death of Stars",
  gradeLevelContent: {
    junior: {
      introHook:
        "Every star in the sky is born, lives a long life, and one day comes to an end! Did you know our Sun was born inside a cold cosmic dust cloud 4.6 billion years ago, and that one day it will gently puff off glowing gas bubbles? Let's travel through millions and billions of years to see how stars live and die!",
      coreConcepts: [
        "Stars are born inside giant, cold clouds of gas and dust called nebulae.",
        "A star's birth weight (its mass) decides its entire life story and how it will die.",
        "Sun-like stars swell up into red giants and gently shed colorful planetary nebulae, leaving a tiny white dwarf.",
        "Giant monster stars die in spectacular explosions called supernovae, leaving neutron stars or black holes!",
        "THE SUN WILL NEVER EXPLODE AS A SUPERNOVA.",
      ],
      explanatoryText:
        "Step into the Stellar Evolution Laboratory! Choose whether to follow a low-mass red dwarf, our own Sun, or a giant monster star. Move the timeline scrubber to watch stars grow from baby clouds to giant red balloons and beautiful cosmic remnants.",
      quizQuestions: [
        {
          id: "q10_j_1",
          question: "Where are all baby stars born?",
          options: [
            "Inside hot volcanoes",
            "Inside cold clouds of gas and dust in space",
            "Inside the Moon",
            "Inside glowing comets",
          ],
          correctIndex: 1,
          explanation:
            "Stars form inside giant cold molecular clouds where gravity pulls gas and dust together.",
          hint: "Think of giant cold cosmic clouds like the Pillars of Creation.",
        },
        {
          id: "q10_j_2",
          question: "Will our Sun ever explode in a violent core-collapse supernova?",
          options: [
            "Yes, tomorrow morning",
            "Yes, in about 1 million years",
            "NO! The Sun does not have enough mass to explode like a supernova",
            "Yes, all stars explode as supernovae",
          ],
          correctIndex: 2,
          explanation:
            "The Sun is not heavy enough to explode! Only stars at least 8 times heavier than our Sun explode in core-collapse supernovae. The Sun will gently puff off a planetary nebula instead.",
          hint: "Remember: only monster stars explode as supernovae.",
        },
        {
          id: "q10_j_3",
          question: "What tiny, Earth-sized dead star will be left behind after our Sun dies?",
          options: ["A black hole", "A White Dwarf", "A giant planet", "A neutron star"],
          correctIndex: 1,
          explanation:
            "The Sun will leave behind a glowing carbon-oxygen White Dwarf about the physical size of Earth.",
          hint: "It is white, hot, and about the size of our home planet.",
        },
      ],
      funFacts: [
        "Every single atom of iron in your blood and calcium in your teeth was created inside ancient dying stars that lived billions of years ago!",
        "A piece of a neutron star the size of a single sugar cube would weigh as much as an entire mountain or all the humans on Earth combined!",
      ],
    },
    explorer: {
      introHook:
        "A star's entire fate is sealed at the moment of its birth by one single property: its mass. High-mass stars live fast and die young in colossal supernova blasts, while low-mass stars burn their fuel with incredible frugality. In this laboratory, you control cosmic time to follow stellar evolutionary pathways from protostars to degenerate corpses.",
      coreConcepts: [
        "Gravitational collapse of molecular clouds triggers the T Tauri protostar phase before hydrogen core fusion ignites on the main sequence.",
        "The Sun's expected evolutionary track: G2V Main Sequence (10 Gyr) → Red Giant Branch → Helium Flash & Horizontal Branch → Asymptotic Giant Branch → Planetary Nebula → Carbon-Oxygen White Dwarf.",
        "The 8-Solar-Mass Threshold: Only stars with initial mass M > 8 M☉ fuse past carbon and oxygen to iron, culminating in a Type II core-collapse supernova.",
        "Stellar Remnants: White Dwarfs (held up by electron degeneracy, M < 1.44 M☉), Neutron Stars (neutron degeneracy, M < 2.16 M☉), and Black Holes.",
      ],
      explanatoryText:
        "Use the interactive timeline scrubber and cutaway layer visualizer to inspect how nuclear fusion changes from core hydrogen burning to multi-shell burning, and test your knowledge in the Stellar Destiny Challenge.",
      quizQuestions: [
        {
          id: "q10_e_1",
          question:
            "What fundamental property determines whether a star ends its life as a White Dwarf versus a Supernova?",
          options: [
            "Its distance from the center of the galaxy",
            "Its initial birth mass",
            "The number of planets orbiting it",
            "Its magnetic field strength at birth",
          ],
          correctIndex: 1,
          explanation:
            "Initial birth mass is the single most important parameter in stellar astrophysics: stars with M < 8 M☉ end as white dwarfs; stars with M > 8 M☉ end in supernovae.",
          hint: "How much matter the star was born with dictates its core temperature and gravitational pull.",
        },
        {
          id: "q10_e_2",
          question:
            "Why does nuclear fusion stop once an iron-56 core is created in a massive star?",
          options: [
            "Iron atoms are too small to undergo fusion",
            "Iron fusion absorbs energy (endothermic) instead of releasing it, destroying core pressure support",
            "The star cools down to zero degrees Kelvin",
            "Iron immediately turns into dark matter",
          ],
          correctIndex: 1,
          explanation:
            "Iron-56 has the highest binding energy per nucleon. Fusing iron consumes energy instead of releasing heat, causing immediate gravitational core collapse.",
          hint: "Think about whether fusing iron releases energy or consumes energy.",
        },
        {
          id: "q10_e_3",
          question: "What is the Chandrasekhar mass limit?",
          options: [
            "The minimum mass required for a protostar to ignite fusion (0.08 M☉)",
            "The maximum mass an electron-degenerate white dwarf can support (~1.44 M☉)",
            "The mass of the central supermassive black hole in the Milky Way",
            "The maximum mass of a red supergiant star",
          ],
          correctIndex: 1,
          explanation:
            "The Chandrasekhar limit (1.44 M☉) is the absolute maximum mass that electron degeneracy pressure can support against gravitational collapse.",
          hint: "Calculated by 19-year-old Subrahmanyan Chandrasekhar for white dwarfs.",
        },
        {
          id: "q10_e_4",
          question: "What is the expected sequence of our Sun's future evolution?",
          options: [
            "Main Sequence → Core-Collapse Supernova → Pulsar",
            "Main Sequence → Red Giant → Planetary Nebula → Carbon-Oxygen White Dwarf",
            "Main Sequence → Black Hole → Supernova",
            "Main Sequence → Red Dwarf → Brown Dwarf",
          ],
          correctIndex: 1,
          explanation:
            "Our Sun will expand into a Red Giant, shed a Planetary Nebula, and leave a White Dwarf. It will never supernova.",
          hint: "The Sun is an intermediate-mass star, not a massive supergiant.",
        },
      ],
      funFacts: [
        "During a core-collapse supernova, 99% of the gargantuan energy is carried away by invisible neutrinos. Only 0.01% escapes as the visible light we see across space!",
        "The Sun loses about 1 billion kilograms of mass every single second just through radiation and the solar wind!",
      ],
    },
    astronomer: {
      introHook:
        "Stellar evolution is a masterclass in nuclear physics, thermodynamics, and general relativity. From the Schönberg-Chandrasekhar limit and the triple-alpha reaction to iron photodisintegration and Tolman-Oppenheimer-Volkoff relativistic hydrostatic equilibrium, every stage is mathematically linked to the star's initial Zero-Age Main Sequence mass.",
      coreConcepts: [
        "The simplified stellar lifetime scaling relation: τ_MS ≈ 10¹⁰ yr × (M / M☉)⁻².⁵. Valid for 0.5 M☉ < M < 15 M☉; fails for low-mass convective dwarfs and radiation-dominated high-mass stars.",
        "Helium Flash vs Quiescent Ignition: Degenerate cores (M < 2 M☉) ignite via non-thermal runaway (∂P/∂T = 0); massive cores ignite helium quietly.",
        "Advanced Nucleosynthetic Shells: Progressive burning (C, Ne, O, Si) on accelerating timescales down to endothermic iron photodisintegration (⁵⁶Fe + γ → 13 ⁴He + 4n - 124 MeV).",
        "Compact Object Remnant Boundaries: White Dwarfs (M < M_Ch ≈ 1.44 M☉), Neutron Stars (M_Ch < M < M_TOV ≈ 2.16 M☉), and Stellar Black Holes (M > M_TOV).",
      ],
      explanatoryText:
        "Explore the quantitative cutaway models, compare two evolutionary tracks simultaneously, test the limits of the lifetime relationship, and master the Stellar Destiny Challenge.",
      quizQuestions: [
        {
          id: "q10_a_1",
          question:
            "Why does the simplified lifetime formula τ_MS ∝ M^(-2.5) fail for stars with initial mass M > 20 M☉?",
          options: [
            "At very high masses, radiation pressure dominates gas pressure, flattening the mass-luminosity relation to L ∝ M, and extreme mass loss reduces the stellar envelope",
            "Massive stars do not fuse hydrogen via the CNO cycle",
            "Massive stars have infinite lifespans due to relativistic time dilation",
            "Massive stars bypass the main sequence completely",
          ],
          correctIndex: 0,
          explanation:
            "In very massive stars near the Eddington limit, radiation pressure dominates gas pressure (β → 0), causing luminosity to scale linearly with mass (L ∝ M) rather than L ∝ M^3.5. Furthermore, massive stellar winds strip off large fractions of the star's mass.",
          hint: "Consider what happens to the mass-luminosity relation when radiation pressure approaches the Eddington limit.",
        },
        {
          id: "q10_a_2",
          question:
            "What physical process triggers the collapse of the iron-56 core in a Type II supernova progenitor?",
          options: [
            "Helium flash runaway in the envelope",
            "Endothermic photodisintegration of iron nuclei and electron capture onto protons, removing thermal and degeneracy pressure support",
            "Magnetic reconnection in the corona",
            "Sudden accretion of dark matter onto the core",
          ],
          correctIndex: 1,
          explanation:
            "At T > 3×10⁹ K, energetic gamma-ray photons photodisintegrate iron nuclei (consuming 124 MeV per reaction), while electron capture (p + e⁻ → n + ν_e) removes the degenerate electrons that supported the core, precipitating dynamic free-fall collapse.",
          hint: "High-energy gamma rays break apart iron nuclei, absorbing critical thermal energy.",
        },
        {
          id: "q10_a_3",
          question: "What is the Tolman-Oppenheimer-Volkoff (TOV) mass limit for neutron stars?",
          options: [
            "The maximum mass of a white dwarf (1.44 M☉)",
            "The maximum mass that neutron degeneracy pressure and strong nuclear force repulsion can support (~2.16 to 2.5 M☉)",
            "The minimum mass required for a black hole to form in the early universe (100 M☉)",
            "The mass of the proton-neutron mass difference",
          ],
          correctIndex: 1,
          explanation:
            "The TOV limit (~2.16 to 2.5 M☉, depending on the nuclear equation of state) is the relativistic upper bound for a cold, non-rotating neutron star. Beyond this mass, collapse to a black hole is inevitable.",
          hint: "It represents the neutron-star analogue of the Chandrasekhar limit.",
        },
        {
          id: "q10_a_4",
          question:
            "Why does the triple-alpha process exhibit such an extreme temperature sensitivity (ε_3α ∝ T⁴⁰)?",
          options: [
            "It requires three ⁴He nuclei to collide simultaneously in a single quantum state",
            "It proceeds through an unstable intermediate beryllium-8 state and relies on a quantum resonance state in carbon-12 (the Hoyle state)",
            "It occurs exclusively at absolute zero",
            "It is driven by cosmic ray bombardment",
          ],
          correctIndex: 1,
          explanation:
            "Beryllium-8 has a lifetime of only ~10⁻¹⁶ seconds. Resonant formation of excited carbon-12 (7.654 MeV Hoyle state) requires high thermal kinetic energies, resulting in an extraordinary T⁴⁰ temperature dependence.",
          hint: "The reaction depends on the short-lived ⁸Be nucleus and Fred Hoyle's predicted resonance level in ¹²C.",
        },
      ],
      funFacts: [
        "In a supernova core collapse, the density exceeds 2.8×10¹⁴ grams per cubic centimeter. At this density, the nuclei of heavy elements touch each other, and protons and electrons are forced to merge into a sea of neutrons!",
        "The first pulsar (PSR B1919+21) was discovered in 1967 by Jocelyn Bell Burnell. Its regular radio pulses of 1.337 seconds were so precise that astronomers initially labeled the signal 'LGM-1' for 'Little Green Men' before realizing it was a rotating neutron star!",
      ],
    },
  },
};
