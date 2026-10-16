import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface CosmicEpoch {
  id: string;
  name: string;
  subtitle: string;
  timeLabel: string;
  timeSeconds: number; // in seconds (e.g. 1e-43 up to 4.35e17 for 13.8 Gyr)
  timeGyr: number; // in Gyr (0 to 13.8)
  redshift: number; // z
  scaleFactor: number; // a
  temperatureKelvin: number; // T
  energyEv: string; // e.g. "10^19 GeV", "1 GeV", "0.3 eV", "2.35 meV"
  scientificConfidence: "speculative" | "theoretical" | "established" | "precision_empirical";
  confidenceExplanation: string;
  summary: string;
  details: {
    explorer: string;
    scholar: string;
    astrophysicist: string;
  };
  dominantComponent: "Quantum Vacuum" | "Radiation" | "Matter" | "Dark Energy";
  densityFluctuations: string;
  visualTheme: {
    background: string;
    glowColor: string;
    description: string;
    icon: string;
  };
}

export const COSMIC_EPOCHS: CosmicEpoch[] = [
  {
    id: "planck",
    name: "Planck & Inflation Epoch",
    subtitle: "The Quantum Frontier & Hyper-Expansion",
    timeLabel: "t < 10⁻³² seconds",
    timeSeconds: 1e-36,
    timeGyr: 0,
    redshift: 1e28,
    scaleFactor: 1e-28,
    temperatureKelvin: 1e28,
    energyEv: "10¹⁶ – 10¹⁹ GeV",
    scientificConfidence: "speculative",
    confidenceExplanation:
      "Speculative frontier: Requires a currently untested theory of Quantum Gravity (combining General Relativity with Quantum Mechanics). Supported indirectly by CMB spatial flatness and primordial perturbation spectrum.",
    summary:
      "Space underwent hyper-exponential inflation, stretching quantum fluctuations across light-years to become the seeds of all future cosmic structures.",
    details: {
      explorer:
        "At the very beginning, all space was unimaginably hot and packed together. In a tiny fraction of a blink, space expanded faster than light, smoothing everything out and planting tiny quantum seeds that would later grow into galaxies!",
      scholar:
        "During Cosmic Inflation (postulated by Alan Guth and Andrei Linde), an inflaton scalar field drove exponential metric expansion (scale factor grew by a factor of > 10²⁶). This resolves the Horizon Problem (why opposite sides of the universe have the same temperature) and the Flatness Problem (why spatial curvature is zero).",
      astrophysicist:
        "Inflation stretches primordial vacuum quantum fluctuations of the metric and scalar field. When modes exit the Hubble horizon during quasi-de Sitter expansion, they freeze out as scale-invariant curvature perturbations (spectral index n_s ≈ 0.965, measured by Planck). Reheating then dumped inflaton energy into relativistic Standard Model particles.",
    },
    dominantComponent: "Quantum Vacuum",
    densityFluctuations:
      "Quantum zero-point fluctuations stretched across cosmological horizons (δρ/ρ ~ 10⁻⁵)",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #ffffff 0%, #a855f7 35%, #1e1b4b 70%, #030712 100%)",
      glowColor: "#c084fc",
      description:
        "Blinding violet-white quantum vacuum energy bursting with horizon-scale metric stretching.",
      icon: "Zap",
    },
  },
  {
    id: "quark_gluon",
    name: "Quark-Gluon Plasma",
    subtitle: "The Primordial Particle Broth",
    timeLabel: "t ~ 10⁻¹⁰ to 10⁻⁶ seconds",
    timeSeconds: 1e-6,
    timeGyr: 0,
    redshift: 1e12,
    scaleFactor: 1e-12,
    temperatureKelvin: 1e12,
    energyEv: "~150 MeV to 100 GeV",
    scientificConfidence: "theoretical",
    confidenceExplanation:
      "Grounded in Quantum Chromodynamics (QCD) and confirmed experimentally in particle collisions at CERN's Large Hadron Collider (LHC) and Brookhaven's RHIC, recreating quark-gluon plasma conditions.",
    summary:
      "Quarks and gluons roamed freely in a blistering liquid plasma before temperatures dropped enough for strong nuclear forces to bind them into protons and neutrons.",
    details: {
      explorer:
        "The universe was so intensely hot that protons and neutrons couldn't hold together yet! Quarks and gluons zoomed around in a soup of pure particle energy.",
      scholar:
        "As the universe cooled below ~150–200 MeV (the QCD transition temperature), color confinement took hold. Quarks combined into hadrons (protons, neutrons, mesons). Slight baryon asymmetry (roughly 1 extra quark per 1 billion antiquark pairs) survived matter-antimatter annihilation, leaving behind all the matter we see today.",
      astrophysicist:
        "Electroweak symmetry breaking occurred at T ~ 100 GeV (Higgs vacuum expectation value established). At the QCD phase transition, chiral symmetry broke and asymptotic freedom transitioned to hadronic confinement. Neutrinos decoupled at t ≈ 1 second (T ≈ 1 MeV, 10¹⁰ K), creating the Cosmic Neutrino Background (CνB).",
    },
    dominantComponent: "Radiation",
    densityFluctuations:
      "Relativistic acoustic sound waves oscillating in the relativistic plasma fluid",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #f59e0b 0%, #dc2626 40%, #450a0a 80%, #020617 100%)",
      glowColor: "#ef4444",
      description:
        "Blazing crimson-amber plasma with relativistic quarks and leptons colliding furiously.",
      icon: "Flame",
    },
  },
  {
    id: "bbn",
    name: "Big Bang Nucleosynthesis (BBN)",
    subtitle: "Forging the Light Chemical Elements",
    timeLabel: "t = 3 to 20 minutes",
    timeSeconds: 1200,
    timeGyr: 0.00000004,
    redshift: 3e8,
    scaleFactor: 3.3e-9,
    temperatureKelvin: 1e9,
    energyEv: "~0.1 MeV",
    scientificConfidence: "precision_empirical",
    confidenceExplanation:
      "Rigorous observational pillar: Observed primordial abundances of Hydrogen (~75%), Helium-4 (~25%), Deuterium (~2.5×10⁻⁵), and Lithium-7 match theoretical nuclear reaction networks across nine orders of magnitude.",
    summary:
      "The entire universe acted as a thermonuclear fusion reactor, synthesizing all the primordial hydrogen and helium in existence before space expanded too quickly to form heavier elements.",
    details: {
      explorer:
        "For just 17 short minutes, the entire universe was hot like the center of the Sun! Protons fused together to build the first light atomic nuclei: mostly hydrogen and helium.",
      scholar:
        "Between t ≈ 3 and 20 minutes, nuclear fusion occurred. High-energy photons delayed fusion until the 'deuterium bottleneck' broke around T ≈ 0.8 × 10⁹ K. Free neutrons rapidly fused into Deuterium, Helium-3, and exceptionally stable Helium-4. Because there are no stable mass-5 or mass-8 nuclei, and the universe was expanding and cooling rapidly, fusion halted before carbon or oxygen could form.",
      astrophysicist:
        "The neutron-to-proton ratio froze out at T ≈ 0.8 MeV when weak interaction rates (n + ν_e ↔ p + e⁻) fell below the Hubble expansion rate (freeze-out value n/p ≈ 1/6, decaying to ~1/7 before BBN). Almost all neutrons incorporated into ⁴He, yielding a primordial mass fraction Y_p = 2n/(n+p) ≈ 2(1/7)/(1 + 1/7) ≈ 0.25 (25%). Deuterium abundance serves as a pristine cosmic 'baryometer', constraining the baryon-to-photon ratio η ≈ 6.1 × 10⁻¹⁰.",
    },
    dominantComponent: "Radiation",
    densityFluctuations:
      "Acoustic oscillations propagating at c_s = c / √3 in the photon-baryon plasma",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #fbbf24 0%, #ea580c 45%, #7c2d12 85%, #020617 100%)",
      glowColor: "#f59e0b",
      description: "Glowing nuclear fusion furnace forging hydrogen, deuterium, and helium nuclei.",
      icon: "Atom",
    },
  },
  {
    id: "recombination",
    name: "Recombination & Cosmic Microwave Background",
    subtitle: "The Fog Clears & Primordial Light Breaks Free",
    timeLabel: "t ≈ 380,000 years",
    timeSeconds: 1.2e13,
    timeGyr: 0.00038,
    redshift: 1090,
    scaleFactor: 0.000917,
    temperatureKelvin: 2970,
    energyEv: "0.26 eV",
    scientificConfidence: "precision_empirical",
    confidenceExplanation:
      "Highest-precision measurement in cosmology: Confirmed by COBE (perfect blackbody spectrum), WMAP, and Planck satellite maps measuring temperature fluctuations ΔT/T to parts per million.",
    summary:
      "Electrons joined nuclei to form neutral atoms. Photons stopped scattering off free electrons and streamed freely across the cosmos, producing the Cosmic Microwave Background (CMB) snapshot.",
    details: {
      explorer:
        "Before this moment, space was like a thick glowing white fog. When it cooled to about 3,000 K (about as warm as a gentle incandescent light bulb), electrons snapped into atoms. Instantly, the cosmic fog vanished and light was set free to travel forever!",
      scholar:
        "At redshift z ≈ 1100, the ambient photon energy dropped low enough that neutral hydrogen atoms formed without being instantly ionized (Recombination). The Thomson scattering optical depth dropped to near zero (Photon Decoupling). The 'surface of last scattering' represents the oldest electromagnetic photograph of the cosmos, visible today redshifted into microwaves at T_0 = 2.7255 K.",
      astrophysicist:
        "The ionization fraction x_e dropped according to the Peebles three-level atom model (direct 2p→1s Lyman-α photons were trapped, making the two-photon 2s→1s decay rate the bottleneck). Baryon acoustic oscillations (BAO) imprinted a characteristic sound horizon scale r_s ≈ 147 Mpc into both the CMB angular power spectrum and modern galaxy clustering.",
    },
    dominantComponent: "Matter",
    densityFluctuations:
      "Acoustic peaks frozen into photon-baryon plasma (ΔT/T ≈ 10⁻⁵, sound horizon ~147 Mpc)",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #fef08a 0%, #f97316 35%, #064e3b 70%, #020617 100%)",
      glowColor: "#fb923c",
      description:
        "Golden last scattering surface revealing delicate acoustic temperature ripples.",
      icon: "Radio",
    },
  },
  {
    id: "dark_ages",
    name: "The Cosmic Dark Ages",
    subtitle: "A Silent Universe of Growing Shadows",
    timeLabel: "t ≈ 380,000 yr to 150 Million yr",
    timeSeconds: 4.7e15,
    timeGyr: 0.1,
    redshift: 50,
    scaleFactor: 0.0196,
    temperatureKelvin: 139,
    energyEv: "12 meV",
    scientificConfidence: "established",
    confidenceExplanation:
      "Standard cosmological physics: Dark matter halos grew via Jeans instability. Currently probed by 21 cm radio interferometers (LOFAR, HERA, EDGES, Square Kilometre Array) measuring neutral hydrogen spin temperature.",
    summary:
      "No stars or galaxies existed yet. The universe was dark, transparent, and filled with neutral hydrogen gas, while invisible dark matter halos silently gathered under gravity.",
    details: {
      explorer:
        "After the Big Bang's first light faded into invisible infrared, complete darkness fell across space for over a hundred million years. No stars had turned on yet. But in the dark, invisible dark matter was gathering like cosmic pillows!",
      scholar:
        "Because photons had decoupled and cooled, space was inky black. Baryonic matter cooled faster than CMB radiation (T_gas ∝ (1+z)² while T_CMB ∝ (1+z)). The only electromagnetic radiation emitted was the faint 21 cm (1420 MHz) hyperfine spin-flip line of neutral atomic hydrogen. Meanwhile, dark matter halos grew via hierarchical gravitational collapse.",
      astrophysicist:
        "Linear perturbation theory governed structure formation: density contrast grew as δ ∝ a(t) during the matter-dominated era. Overdense regions exceeded the critical collapse threshold δ_c ≈ 1.686 and virialized into dark matter mini-halos of mass 10⁵–10⁶ M_sun, cooling via molecular hydrogen (H₂) rotational transitions to prepare for the first star ignition.",
    },
    dominantComponent: "Matter",
    densityFluctuations: "Dark matter mini-halos collapsing hierarchically; linear growth δ ∝ a",
    visualTheme: {
      background: "radial-gradient(circle at center, #0f172a 0%, #030712 60%, #000000 100%)",
      glowColor: "#38bdf8",
      description:
        "Pitch black cosmos filled with invisible filamentary dark matter web and faint 21cm ripples.",
      icon: "Moon",
    },
  },
  {
    id: "cosmic_dawn",
    name: "Cosmic Dawn & Reionization",
    subtitle: "The First Stars & Galaxies Ignite",
    timeLabel: "t ≈ 150 Million yr to 1 Billion yr",
    timeSeconds: 2.2e16,
    timeGyr: 0.7,
    redshift: 8,
    scaleFactor: 0.111,
    temperatureKelvin: 24.5,
    energyEv: "2.1 meV",
    scientificConfidence: "precision_empirical",
    confidenceExplanation:
      "Dramatically illuminated by the James Webb Space Telescope (JWST), discovering confirmed primordial galaxies at z > 14 (e.g. JADES-GS-z14-0) and measuring the Gunn-Peterson trough in high-z quasar spectra.",
    summary:
      "Pristine, supermassive Population III stars ignited, pouring out intense ultraviolet radiation that carved growing bubbles of ionized plasma and brought the Dark Ages to an end.",
    details: {
      explorer:
        "Suddenly, giant pristine monster stars burst to life! They shone with fierce blue-white light, melting the neutral hydrogen fog around them like light bulbs turning on in a dark forest.",
      scholar:
        "The first stars (Population III) formed from zero-metallicity gas (only H and He), requiring masses of 100 to 300+ solar masses to overcome inefficient molecular hydrogen cooling. Their energetic ionizing ultraviolet photons (E > 13.6 eV) formed Strömgren spheres of ionized hydrogen (H II). These ionized bubbles overlapped, completing Cosmic Reionization by z ≈ 6 (t ≈ 1 billion years).",
      astrophysicist:
        "The Gunn-Peterson optical depth τ_GP ∝ n_H I drops sharply at z ≈ 5.8, indicating the intergalactic medium (IGM) became completely re-ionized. JWST deep NIRCam/NIRSpec observations reveal compact, high-luminosity star-forming galaxies (M_UV ≈ -21) already enriched with oxygen and carbon at z ≈ 12–14, prompting revised models of early dark matter halo gas accretion efficiency.",
    },
    dominantComponent: "Matter",
    densityFluctuations: "Expanding H II ionization bubbles; first protogalactic clumps merging",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #38bdf8 0%, #1e1b4b 45%, #09090b 85%, #000000 100%)",
      glowColor: "#06b6d4",
      description:
        "Brilliant cyan star clusters carving transparent glowing ionization cavities in dark gas.",
      icon: "Sparkles",
    },
  },
  {
    id: "cosmic_noon",
    name: "Cosmic Noon & Galaxy Assembly",
    subtitle: "Peak Star Formation & Giant Black Holes",
    timeLabel: "t ≈ 2 to 4 Billion years",
    timeSeconds: 9.5e16,
    timeGyr: 3.0,
    redshift: 2.1,
    scaleFactor: 0.322,
    temperatureKelvin: 8.45,
    energyEv: "0.73 meV",
    scientificConfidence: "precision_empirical",
    confidenceExplanation:
      "Verified by multi-wavelength deep field surveys (Hubble, ALMA, Chandra, JWST) measuring the cosmic star formation rate density (Madau-Dickinson relation).",
    summary:
      "The universe reached its most frantic era of star formation. Galaxies collided, central supermassive black holes gorged on gas to become luminous quasars, and chemical elements filled space.",
    details: {
      explorer:
        "This was the golden age of baby stars! Galaxies were crashing into each other, creating massive fireworks of star births. Supermassive black holes ate huge banquets of gas and beamed like giant cosmic lighthouses.",
      scholar:
        "Around 10 billion years ago (redshift z ≈ 2), the cosmic star-formation rate density peaked at roughly ten times its present-day value (the Madau-Dickinson peak). Cold gas streams fed rapidly growing disk galaxies. Feedback from supernovae and active galactic nuclei (AGN) began blowing out hot gas, regulating and eventually quenching star formation in massive elliptical galaxies.",
      astrophysicist:
        "Co-evolution of galaxies and supermassive black holes established the Magorrian relation (M_BH ∝ M_bulge). Hierarchical assembly drove morphology: clumpy turbulent disks with high velocity dispersion (σ ≈ 50 km/s) merged into grand-design spirals and massive triaxial ellipticals. Stellar nucleosynthesis heavily enriched the interstellar medium with metals (Z ~ Z_⊙).",
    },
    dominantComponent: "Matter",
    densityFluctuations: "Dense galaxy clusters forming; massive filamentary gas accretion",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #ec4899 0%, #8b5cf6 40%, #1e1b4b 80%, #020617 100%)",
      glowColor: "#ec4899",
      description:
        "Fierce magenta and violet starburst galaxies colliding with active quasar jets.",
      icon: "Orbit",
    },
  },
  {
    id: "modern_universe",
    name: "The Modern Universe",
    subtitle: "Dark Energy Dominance & Cosmic Web Maturity",
    timeLabel: "t = 13.8 Billion years (Today)",
    timeSeconds: 4.35e17,
    timeGyr: 13.8,
    redshift: 0.0,
    scaleFactor: 1.0,
    temperatureKelvin: 2.7255,
    energyEv: "0.235 meV",
    scientificConfidence: "precision_empirical",
    confidenceExplanation:
      "Our direct home epoch: Characterized by precision measurements from Gaia, SDSS, Planck, HST, JWST, and terrestrial telescopes.",
    summary:
      "A vast, quiet universe dominated by dark energy, where galaxies are organized into an intricate cosmic web of filaments and voids, and planets orbit stable stars.",
    details: {
      explorer:
        "Today, the universe is 13.8 billion years old! The ancient Big Bang glow has cooled down to just 2.7 degrees above absolute zero. Galaxies have settled into beautiful spirals and ellipticals, and life thrives around our middle-aged Sun.",
      scholar:
        "At the present epoch (t = 13.8 Gyr), dark energy makes up 68.3% of the cosmic energy density, matter comprises 31.7% (of which only 4.9% is normal atoms, and 26.8% is cold dark matter), and radiation is a negligible 0.008%. Dark energy began accelerating cosmic expansion around z ≈ 0.4 (t ≈ 9 Gyr ago). Gravitational structure formation has largely frozen out on the largest scales.",
      astrophysicist:
        "In the concordant ΛCDM framework, the universe has entered a de Sitter-like asymptotic expansion phase with H(t) → H_∞ ≈ H_0 √Ω_Λ ≈ 57 km/s/Mpc. Virialized structures (like the Local Group) remain gravitationally bound, but unbound distant superclusters and filaments are accelerating away past our cosmic event horizon.",
    },
    dominantComponent: "Dark Energy",
    densityFluctuations:
      "Fully non-linear cosmic web: dense virialized clusters (δ > 200) and Boötes-scale voids (δ < -0.9)",
    visualTheme: {
      background:
        "radial-gradient(circle at center, #6366f1 0%, #1e1b4b 45%, #0f172a 80%, #020617 100%)",
      glowColor: "#818cf8",
      description:
        "Vast dark web of luminous galaxy strands, quiet voids, and gentle 2.7K microwave background.",
      icon: "Compass",
    },
  },
];

export const MODULE_17_SUBLESSONS: SubLesson[] = [
  {
    id: "m17-l1",
    number: 1,
    title: "What the Big Bang Model Describes",
    subtitle: "Expansion of space itself, not an explosion in empty space",
    content: {
      explorer: `
### What Was the Big Bang?

The biggest misconception in all of science is imagining the Big Bang as a giant bomb exploding into empty black space.

**There was no pre-existing empty space, and there was no explosion!**

Instead:
* **Space itself began expanding everywhere at the same time.**
* Think of space as the rubber of an uninflated balloon covered in painted dots (galaxies). As you blow into the balloon, every dot moves away from every other dot.
* The dots aren't traveling through rubber; the rubber between them is simply stretching!

Because space expands everywhere, **the universe has no center and no outer edge.** If you stood in a distant galaxy 10 billion light-years away, you would see all other galaxies rushing away from you, exactly like we do from Earth!
      `,
      scholar: `
### The Metric Expansion of Space

The Big Bang is not an explosion of matter into pre-existing space. It is the **metric expansion of spacetime itself**, described by Albert Einstein's General Relativity and Alexander Friedmann's cosmological solutions.

$$ds^2 = -c^2 dt^2 + a^2(t) \\left[ \\frac{dr^2}{1 - k r^2} + r^2 (d\\theta^2 + \\sin^2\\theta d\\phi^2) \\right]$$

Key scientific principles:
1. **The Cosmological Principle**: On scales larger than ~300 million light-years, the universe is both **homogeneous** (the same density everywhere) and **isotropic** (the same in every direction).
2. **No Central Point**: There is no special origin coordinate $(0,0,0)$. Every comoving observer sees all other comoving observers receding according to the Hubble–Lemaître Law: $v = H_0 \\cdot d$.
3. **Not an Explosion in Void**: Asking "what did the universe expand into?" assumes space existed outside the universe. General Relativity shows spacetime is the stage itself; space expands within its own geometry.
4. **Limits of the Model**: The Big Bang model does not describe a magical single point of creation from t=0. It describes how our universe expanded and cooled from an unimaginably hot, dense early state.
      `,
      astrophysicist: `
### FLRW Metric, Comoving Coordinates & Coordinate Invariance

The standard cosmological model rests on the Friedmann-Lemaître-Robertson-Walker (FLRW) metric:

$$ds^2 = -c^2 dt^2 + a^2(t) \\gamma_{ij} dx^i dx^j$$

Where:
* $a(t)$ is the dimensionless cosmic scale factor (normalized to $a(t_0) = 1$ today).
* $x^i$ are comoving coordinates that remain constant for particles moving solely with the cosmic Hubble flow.
* Physical proper separation between two comoving galaxies is $r_{\\text{proper}}(t) = a(t) \\cdot r_{\\text{comoving}}$.

Differentiating with respect to cosmic time $t$:
$$\\dot{r}_{\\text{proper}} = \\dot{a} r_{\\text{comoving}} = \\frac{\\dot{a}}{a} r_{\\text{proper}} = H(t) r_{\\text{proper}}$$

This reveals the Hubble expansion rate $H(t) \\equiv \\frac{\\dot{a}}{a}$. Redshift is caused by cosmological wavelength stretching, not kinematic Doppler velocity:

$$1 + z = \\frac{\\lambda_{\\text{obs}}}{\\lambda_{\\text{emit}}} = \\frac{a(t_{\\text{obs}})}{a(t_{\\text{emit}})}$$

The classical $t = 0$ singularity is an artifact of applying classical General Relativity where quantum gravitational effects (at the Planck density $\\rho_{\\text{Planck}} = c^5 / (\\hbar G^2) \\sim 10^{96} \\text{ kg/m}^3$) must dominate.
      `,
    },
    readingTimeMinutes: 4,
  },
  {
    id: "m17-l2",
    number: 2,
    title: "The Early Hot, Dense Universe",
    subtitle: "From Planck time and Inflation to Quark-Gluon Plasma",
    content: {
      explorer: `
### The Sizzling Cosmic Nursery

Imagine squeezing all the matter of two trillion galaxies into a space smaller than the head of a pin!

During the first seconds of the universe:
* **Unbelievable Heat**: The temperature exceeded trillions of degrees.
* **Pure Energy**: Light was so powerful that pairs of matter and antimatter particles popped into existence from pure energy ($E = mc^2$) and annihilated back into light.
* **Inflationary Leap**: In a tiny split-second ($10^{-36}$ seconds), space stretched faster than light, ironing out any wrinkles.
* **Quark Soup**: Quarks—the building blocks of protons and neutrons—swam freely in a boiling soup called Quark-Gluon Plasma.
      `,
      scholar: `
### Chronology of the First Second

As the universe expanded, its temperature fell inversely with the scale factor: $T(t) \\propto 1/a(t)$.

1. **Planck Epoch ($t < 10^{-43}$ s, $T > 10^{32}$ K)**:
   All four fundamental forces (gravity, strong, weak, electromagnetic) were unified. General relativity breaks down.
2. **Grand Unification & Cosmic Inflation ($t \\sim 10^{-36}$ s, $T \\sim 10^{28}$ K)**:
   The strong nuclear force decoupled. A false vacuum state generated negative pressure, driving exponential inflation.
3. **Electroweak Transition ($t \\sim 10^{-11}$ s, $T \\sim 10^{15}$ K)**:
   The Higgs field acquired a non-zero vacuum expectation value. The electromagnetic and weak forces split. Particles acquired rest mass.
4. **Quark-Hadron Transition ($t \\sim 10^{-5}$ s, $T \\sim 10^{12}$ K)**:
   Quarks bound into protons and neutrons. Matter-antimatter annihilation occurred; the tiny Sakharov-condition asymmetry left 1 excess baryon per $10^9$ photons.
      `,
      astrophysicist: `
### Thermodynamics of the Relativistic Early Universe

In the radiation-dominated era, the energy density is governed by the Stefan-Boltzmann law for relativistic species:

$$\\rho_r(T) = g_*(T) \\frac{\\pi^2}{30} \\frac{k_B^4}{\\hbar^3 c^3} T^4$$

Where $g_*(T)$ is the effective number of relativistic degrees of freedom:
* At $T > 300$ GeV (Standard Model complete): $g_* = 106.75$
* Below electroweak breaking: $g_* \\approx 86.25$
* After QCD confinement ($T < 150$ MeV): $g_* = 17.25$
* Below electron-positron annihilation ($T < 0.5$ MeV): $g_* = 3.36$ (photons + 3 neutrino species)

Friedmann's equation during radiation domination:
$$H^2(t) = \\left( \\frac{\\dot{a}}{a} \\right)^2 = \\frac{8\\pi G}{3} \\rho_r \\implies a(t) \\propto t^{1/2}$$

Integrating yields the direct relation between cosmic time and temperature:
$$t \\approx \\frac{2.42}{\\sqrt{g_*}} \\left( \\frac{1 \\text{ MeV}}{k_B T} \\right)^2 \\text{ seconds}$$
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m17-l3",
    number: 3,
    title: "Formation of Light Atomic Nuclei",
    subtitle: "Big Bang Nucleosynthesis (BBN): The 20-minute cosmic furnace",
    content: {
      explorer: `
### The First 20 Minutes: Cooking the Elements

Where did the atoms inside our bodies come from?
* Heavy atoms like gold, iron, and carbon were made inside dying stars billions of years later.
* But **every single hydrogen atom in the water you drink was forged in the first 20 minutes of the Big Bang!**

Between 3 and 20 minutes after the Big Bang, the universe was like the core of an enormous star. Protons and neutrons crashed together, building:
1. **Hydrogen** (~75% of all cosmic mass)
2. **Helium** (~25% of cosmic mass)
3. Tiny pinches of **Deuterium** (heavy hydrogen) and **Lithium**.

Then the universe expanded and cooled too quickly for larger atoms to form. The recipe was frozen for the next 150 million years!
      `,
      scholar: `
### Big Bang Nucleosynthesis (BBN)

BBN is one of the three foundational observational pillars of cosmology (alongside galaxy redshifts and the CMB).

1. **Neutron-to-Proton Freeze-out**:
   At $T > 1$ MeV ($t < 1$ s), weak nuclear reactions kept neutrons and protons in thermal equilibrium:
   $$n + \\nu_e \\longleftrightarrow p + e^- \\quad \\text{and} \\quad n + e^+ \\longleftrightarrow p + \\bar{\\nu}_e$$
   When the weak interaction rate fell below the Hubble expansion rate $H(t)$, the ratio froze at:
   $$\\frac{n}{p} = \\exp\\left(-\\frac{(m_n - m_p) c^2}{k_B T_{\\text{freeze}}}\\right) \\approx \\exp\\left(-\\frac{1.293 \\text{ MeV}}{0.8 \\text{ MeV}}\\right) \\approx \\frac{1}{6}$$

2. **The Deuterium Bottleneck**:
   Free neutrons began decaying (half-life $\\tau \\approx 880$ s), dropping $n/p$ to $\\sim 1/7$. Deuterium ($^2\\text{H}$) has a binding energy of only 2.22 MeV; high-energy photons destroyed it immediately until $T$ dropped to $0.8 \\times 10^9$ K ($t \\approx 3$ minutes).

3. **Synthesis of $^4\\text{He}$**:
   Once deuterium survived, nuclear reactions rapidly chained:
   $$p + n \\to \\,^2\\text{H} + \\gamma, \\quad ^2\\text{H} + p \\to \\,^3\\text{He} + \\gamma, \\quad ^3\\text{He} + ^3\\text{He} \\to \\,^4\\text{He} + 2p$$
   Because Helium-4 ($^4\\text{He}$) is exceptionally tightly bound (28.3 MeV), virtually all available neutrons ended up in $^4\\text{He}$.
      `,
      astrophysicist: `
### The Primordial Helium Mass Fraction & The Baryometer

Let the neutron-to-proton ratio at BBN onset be $f \\equiv n/p \\approx 1/7$. Every two neutrons combine with two protons to form one $^4\\text{He}$ nucleus of mass 4:

$$Y_p \\equiv \\frac{M_{\\text{He}}}{M_{\\text{total}}} = \\frac{4 \\cdot (n / 2)}{n + p} = \\frac{2n}{n + p} = \\frac{2(n/p)}{1 + (n/p)} = \\frac{2(1/7)}{1 + 1/7} = \\frac{2/7}{8/7} = 0.25$$

This analytical result predicts that **25% of the baryonic mass of the universe is $^4\\text{He}$ and 75% is $^1\\text{H}$**, matching spectroscopic measurements in pristine metal-poor H II regions ($Y_p = 0.245 \\pm 0.003$).

**The Deuterium Baryometer**:
Unlike helium, deuterium burning is incomplete; residual deuterium abundance is exquisitely sensitive to the cosmic baryon-to-photon ratio:
$$\\eta \\equiv \\frac{n_b}{n_\\gamma} = (6.12 \\pm 0.04) \\times 10^{-10}$$

Measuring the D/H ratio in high-redshift Lyman-limit quasar absorption systems ($(\\text{D/H}) = (2.54 \\pm 0.04) \\times 10^{-5}$) determines the cosmic baryon density:
$$\\Omega_b h^2 = 0.02237 \\pm 0.00015$$
This independent measurement matches the Planck CMB acoustic peak determination with stunning precision!
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m17-l4",
    number: 4,
    title: "Formation of Atoms & The Cosmic Microwave Background",
    subtitle: "Recombination, photon decoupling, and the oldest light in the cosmos",
    content: {
      explorer: `
### The Day the Cosmic Fog Cleared

For 380,000 years after the Big Bang, space was a glowing, blinding orange-white fog.

Why couldn't light travel?
* Free electrons acted like tiny pinballs, bouncing light in every direction so it couldn't travel in a straight line.
* But when the universe cooled down to **3,000 Kelvin**, something magical happened: atomic nuclei captured the flying electrons to form neutral hydrogen atoms!
* This event is called **Recombination**.

With electrons locked inside atoms, light suddenly had an open highway. Photons zoomed freely into space. Today, 13.8 billion years later, that ancient baby photo of the universe has cooled and stretched into microwaves—we call it the **Cosmic Microwave Background (CMB)**!
      `,
      scholar: `
### Recombination & Last Scattering ($z \\approx 1100$)

When the universe was roughly 380,000 years old ($z = 1090$, $T = 2970$ K):

1. **Recombination**:
   Protons captured electrons to form neutral atomic hydrogen ($p + e^- \\to \\text{H} + \\gamma$).
2. **Photon Decoupling**:
   The cross-section for Thomson scattering off neutral hydrogen is orders of magnitude smaller than off free electrons:
   $$\\sigma_{\\text{Rayleigh}} \\ll \\sigma_T = 6.65 \\times 10^{-29} \\text{ m}^2$$
   The photon mean free path $\\lambda_{\\text{mfp}} = 1 / (n_e \\sigma_T)$ grew from light-years to larger than the visible horizon.
3. **The Surface of Last Scattering**:
   The photons released at this moment have traveled unimpeded for 13.8 billion years.
4. **Cosmic Redshift of CMB**:
   The radiation cooled as space stretched:
   $$T(z) = T_0 (1 + z) \\implies T_0 = \\frac{2970 \\text{ K}}{1 + 1090} = 2.7255 \\text{ K}$$
      `,
      astrophysicist: `
### The Peebles Recombination Kinetics & CMB Anisotropies

Direct radiative recombination to the ground state ($n=1$) produces a photon with energy $\\ge 13.6$ eV, which immediately re-ionizes an adjacent hydrogen atom. Recombination must proceed through excited states ($n \\ge 2$).

The bottleneck is the escape of Lyman-$\\alpha$ photons via cosmological redshift or the two-photon transition rate from the $2s \\to 1s$ state (decay rate $\\Lambda_{2s \\to 1s} \\approx 8.22 \\text{ s}^{-1}$).

The CMB angular temperature power spectrum is expanded into spherical harmonics:
$$\\frac{\\Delta T}{T}(\\theta, \\phi) = \\sum_{\\ell=2}^{\\infty} \\sum_{m=-\\ell}^{\\ell} a_{\\ell m} Y_{\\ell m}(\\theta, \\phi), \\quad C_\\ell \\equiv \\langle |a_{\\ell m}|^2 \\rangle$$

* **First Acoustic Peak ($\\ell \\approx 220$)**: Corresponds to the maximum compression of the fundamental acoustic mode inside the sound horizon $r_s \\approx 147$ Mpc at decoupling. Its angular size $\\theta_s = r_s / D_A(z)$ proves the universe has flat spatial geometry ($\\\\Omega_k = 0.0007 \\pm 0.0019$).
* **Second Peak ($\\ell \\approx 540$)**: Rarefaction peak, sensitive to the baryon-to-photon ratio.
* **Third Peak ($\\ell \\approx 800$)**: Second compression peak, measures the cold dark matter density $\\Omega_c h^2$.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m17-l5",
    number: 5,
    title: "The Cosmic Dark Ages",
    subtitle: "A silent universe illuminated only by 21 cm hydrogen ripples",
    content: {
      explorer: `
### The Long Cosmic Night

After the bright glow of the CMB faded into invisible infrared, total darkness blanketed the universe for over 100 million years.

* **No stars existed.**
* **No galaxies shone.**
* There were no planets, no black holes, and no fires. Just silent clouds of hydrogen and helium gas drifting in blackness.

Yet, this was when the seeds of the universe were growing! Invisible dark matter was pulling gas together with gravity, setting the stage for the first stars to ignite.
      `,
      scholar: `
### Physics of the Dark Ages ($z \\sim 1100$ to $z \\sim 20$)

During the Dark Ages:
1. **Gas Cooling**: The primordial gas decoupled thermally from the radiation field at $z \\sim 150$. After this, the gas temperature cooled adiabatically as $T_{\\text{gas}} \\propto (1+z)^2$, dropping faster than the CMB temperature $T_{\\text{CMB}} \\propto (1+z)$.
2. **The 21 cm Hydrogen Line**:
   The spin-flip hyperfine transition of neutral hydrogen ($F = 1 \\to 0$, wavelength 21.1 cm, frequency 1420.4 MHz) allows astronomers to observe this era. Depending on the spin temperature $T_s$ relative to $T_{\\text{CMB}}$, hydrogen absorbs or emits 21 cm radio waves.
3. **Hierarchical Growth**:
   Dark matter mini-halos of mass $10^5$ to $10^6 M_\\odot$ grew by gravitational instability, pulling neutral gas into deep gravitational potential wells.
      `,
      astrophysicist: `
### 21 cm Brightness Temperature & Mini-Halo Jeans Collapse

The differential 21 cm brightness temperature against the CMB is:
$$\\delta T_b \\approx 27 x_{\\text{HI}} \\left( \\frac{1+z}{10} \\right)^{1/2} \\left( 1 - \\frac{T_{\\text{CMB}}}{T_s} \\right) \\left( \\frac{\\Omega_b h^2}{0.023} \\right) \\left( \\frac{0.15}{\\Omega_m h^2} \\right)^{1/2} \\text{ mK}$$

The spin temperature $T_s$ is coupled to $T_{\\text{gas}}$ via the Wouthuysen-Field effect (resonant Lyman-$\\alpha$ photon scattering) and atomic collisions.

Gas inside dark matter halos can only collapse if its mass exceeds the Jeans mass:
$$M_J = \\frac{\\pi}{6} \\rho \\left( \\frac{\\pi c_s^2}{G \\rho} \\right)^{3/2} \\propto T^{3/2} \\rho^{-1/2}$$

Because primordial gas lacked carbon and oxygen, it could not cool via atomic fine-structure lines. It relied entirely on trace molecular hydrogen ($\\\\text{H}_2$), which can only cool gas down to $\\sim 200$ K (its lowest rotational excitation state), setting the stage for exceptionally massive first stars.
      `,
    },
    readingTimeMinutes: 4,
  },
  {
    id: "m17-l6",
    number: 6,
    title: "The First Stars & Galaxies",
    subtitle: "Cosmic Dawn, Population III monsters, and the Reionization of the universe",
    content: {
      explorer: `
### The First Dawn of Starlight

Roughly 150 million years after the Big Bang, the first stars ignited—and they were unlike anything in the modern sky!

* **Monster Stars (Population III)**:
  Made of pure hydrogen and helium with zero metal impurities, these stars were **100 to 300 times more massive than our Sun** and millions of times brighter!
* **Short, Spectacular Lives**:
  Because they burned their fuel so fast, they lived only a few million years before detonating as hypernovae, blasting out the first carbon, oxygen, and iron into the universe.
* **Melting the Fog (Reionization)**:
  Their ultraviolet rays carved giant transparent bubbles through the dark gas. As billions of stars joined together, their bubbles overlapped until all intergalactic space became transparent again!
      `,
      scholar: `
### Cosmic Dawn to Reionization ($z \\approx 20 \\to 6$)

1. **Population III Stellar Characteristics**:
   Lacking metals, primordial gas clouds had high Jeans masses ($M_J \\sim 100\\text{--}1000 M_\\odot$). Pop III stars had surface temperatures exceeding $10^5$ K, emitting copious amounts of hydrogen-ionizing photons ($h\\nu > 13.6$ eV).
2. **Cosmic Reionization**:
   UV photons formed expanding ionized hydrogen (H II) regions. By $z \\approx 6$ (roughly 1 billion years after the Big Bang), the neutral fraction of the intergalactic medium fell below $10^{-4}$.
3. **JWST Discoveries**:
   The James Webb Space Telescope has revolutionized this epoch, detecting luminous galaxies at $z > 14$ (e.g., JADES-GS-z14-0 at $z = 14.32$, seen just 290 million years after the Big Bang).
      `,
      astrophysicist: `
### Gunn-Peterson Trough & Reionization Bubble Overlap

The neutral hydrogen optical depth for resonant Lyman-$\\alpha$ scattering is:
$$\\tau_{\\text{GP}} = \\frac{\\pi e^2}{m_e c} f_{\\alpha} \\lambda_{\\alpha} H^{-1}(z) n_{\\text{HI}} \\approx 1.8 \\times 10^5 h^{-1} \\left( \\frac{\\Omega_m}{0.3} \\right)^{-1/2} \\left( \\frac{1+z}{7} \\right)^{3/2} x_{\\text{HI}}$$

Even a tiny neutral hydrogen fraction $x_{\\text{HI}} \\sim 10^{-4}$ produces complete absorption ($\\\\tau_{\\text{GP}} \\gg 1$), forming the **Gunn-Peterson trough** observed in high-$z$ Sloan quasar spectra. The disappearance of this trough at $z \\lesssim 5.8$ marks the end of reionization.

The optical depth to electron scattering measured by the Planck satellite:
$$\\tau_e = \\int_0^{z_{\\text{rec}}} c \\, dt \\, n_e(z) \\sigma_T = 0.054 \\pm 0.007$$
This constrains the midpoint of reionization to $z_{\\text{reion}} = 7.7 \\pm 0.7$.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m17-l7",
    number: 7,
    title: "Galaxy Evolution Over Billions of Years",
    subtitle: "Cosmic Noon, hierarchical mergers, and the Hubble sequence",
    content: {
      explorer: `
### The Wild Youth of Galaxies

Galaxies were not born in neat spiral shapes like the Milky Way today.

* Early galaxies seen by the Hubble and Webb telescopes look like **clumpy, jagged blobs and glowing train wrecks!**
* They collided constantly, cannibalizing smaller galaxies and fueling giant starbursts.
* **Cosmic Noon** (about 10 billion years ago): The universe was making stars 10 times faster than it does today!
* Over billions of years, collisions settled down. Gravity flattened spinning gas clouds into elegant spiral disks and puffed giant mergers into smooth elliptical galaxies.
      `,
      scholar: `
### Galaxy Assembly & The Madau-Dickinson Curve

1. **Cosmic Noon ($z \\sim 1.5\\text{--}2.5$, $t \\sim 2\\text{--}4$ Gyr)**:
   The star formation rate density ($\\rho_{\\text{SFR}}$) of the universe peaked around $z \\approx 1.9$ at $\\sim 0.1 M_\\odot \\text{ yr}^{-1} \\text{ Mpc}^{-3}$ (ten times the modern value).
2. **Supermassive Black Hole Co-Evolution**:
   Quasar activity also peaked at Cosmic Noon. Feedback from relativistic jets and radiation pressure (AGN feedback) heated surrounding gas, preventing it from cooling and quenching star formation.
3. **Hierarchical Galaxy Growth**:
   Small dwarf galaxies merged into larger structures. Infalling cold gas streams sustained disks, while major galaxy mergers destroyed disk order, forming spheroidal elliptical galaxies.
      `,
      astrophysicist: `
### The Madau & Dickinson Cosmic Star Formation History

The empirical cosmic star formation rate density $\\psi(z)$ as a function of redshift is parameterized by:

$$\\psi(z) = 0.015 \\frac{(1+z)^{2.7}}{1 + \\left( \\frac{1+z}{2.9} \\right)^{5.6}} \\, M_\\odot \\text{ yr}^{-1} \\text{ Mpc}^{-3}$$

Key evolutionary drivers:
* **Gas Depletion & Quenching**: Halo mass growth above the critical shock-heating threshold ($M_{\\text{halo}} > 10^{12} M_\\odot$) generates stable virial shocks that prevent cold gas streams from reaching the galaxy disk.
* **Chemical Enrichment**: Stellar nucleosynthesis enriched the interstellar medium from $Z \\approx 0$ to supersolar metallicity ($Z > 0.02$), forming terrestrial planets.
* **Morphological Settling**: The fraction of thin, kinematically cold disks increased steadily from $z \\sim 1$ to $z = 0$.
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m17-l8",
    number: 8,
    title: "The Modern Universe & Beyond",
    subtitle: "Accelerating expansion, cosmic destiny, and our place in time",
    content: {
      explorer: `
### Our Modern Cosmic Home

Today, the universe is **13.8 billion years old.**

What does our modern universe look like?
* **A Mature Web**: Billions of galaxies are laced across cosmic filaments separated by vast, nearly empty voids.
* **Gentle Warmth**: The Big Bang's ancient light is now just 2.7 degrees above absolute zero.
* **Our Sun**: Born 4.6 billion years ago in a quiet corner of the Milky Way, rich in the metals of past generations of stars, allowing rocky Earth and life to flourish!
* **A New Driver**: About 5 billion years ago, Dark Energy overtook gravity. The universe is now expanding faster and faster into the future.
      `,
      scholar: `
### The $\\Lambda$CDM Modern Era ($z = 0$)

The modern universe is described by the precision Concordance Model ($\\\\Lambda$CDM):
* **Cosmic Energy Budget**:
  - Dark Energy ($\\\\Omega_\\Lambda$): $68.3\\%$
  - Cold Dark Matter ($\\\\Omega_c$): $26.8\\%$
  - Baryonic Matter (Atoms) ($\\\\Omega_b$): $4.9\\%$
  - Photons & Neutrinos: $< 0.1\\%$
* **Accelerated Expansion**:
  Around $z \\approx 0.4$ ($t \\approx 9$ Gyr), the matter density $\\rho_m \\propto a^{-3}$ dropped below the constant vacuum dark energy density $\\rho_\\Lambda$. The cosmic deceleration parameter $q = \\Omega_m/2 - \\Omega_\\Lambda$ flipped from positive (decelerating) to negative (accelerating).
* **Cosmic Horizon**:
  In distant futures, galaxies outside the gravitationally bound Local Group will cross our cosmological event horizon and become permanently unreachable.
      `,
      astrophysicist: `
### Asymptotic de Sitter Future & Cosmological Parameter Summary

Modern precision cosmological parameters from Planck 2018 + BAO + SNe Ia:
* Hubble constant: $H_0 = 67.4 \\pm 0.5 \\text{ km s}^{-1} \\text{ Mpc}^{-1}$
* Age of the universe: $t_0 = 13.787 \\pm 0.020 \\text{ Gyr}$
* Curvature parameter: $\\Omega_k = 0.0007 \\pm 0.0019$ (consistent with exact spatial flatness)
* Sound horizon at decoupling: $r_s = 147.09 \\pm 0.26 \\text{ Mpc}$

As $t \\to \\infty$, the scale factor approaches pure exponential de Sitter expansion:
$$a(t) \\propto \\exp(H_\\Lambda t), \\quad H_\\Lambda = \\sqrt{\\frac{\\Lambda c^2}{3}} = H_0 \\sqrt{\\Omega_\\Lambda} \\approx 56 \\text{ km s}^{-1} \\text{ Mpc}^{-1}$$

The cosmological event horizon radius freezes at $d_{\\text{event}} = c / H_\\Lambda \\approx 5.3$ Gpc (17.4 billion light-years), setting the ultimate limit on how far our signals can ever propagate.
      `,
    },
    readingTimeMinutes: 5,
  },
];

export const MODULE_17_QUIZ: QuizQuestion[] = [
  {
    id: "m17-q1",
    question:
      "What is the most accurate description of the Big Bang according to modern cosmology?",
    options: [
      "A gigantic explosion of rocks and stars from a single point into pre-existing empty space",
      "The rapid expansion of spacetime itself everywhere, without an explosion or a central point",
      "Two ancient supermassive black holes colliding to create light and atoms",
      "A chemical chain reaction in a pre-existing vacuum cloud",
    ],
    correctAnswerIndex: 1,
    explanation:
      "General relativity shows that the Big Bang was not an explosion of matter into pre-existing empty space, but the expansion of space itself everywhere at once.",
    difficulty: "beginner",
  },
  {
    id: "m17-q2",
    question:
      "Which light elements were synthesized during Big Bang Nucleosynthesis (BBN) in the first 20 minutes?",
    options: [
      "Carbon, Nitrogen, Oxygen, and Iron",
      "Only pure neutrons and positrons",
      "Hydrogen-1 (~75%), Helium-4 (~25%), with traces of Deuterium, Helium-3, and Lithium-7",
      "Uranium, Gold, and Platinum",
    ],
    correctAnswerIndex: 2,
    explanation:
      "Because the universe expanded and cooled quickly and lacked stable mass-5 and mass-8 nuclei, fusion stopped after forging Hydrogen, Helium-4, and tiny traces of Deuterium and Lithium-7. Heavier elements had to wait for stars.",
    difficulty: "intermediate",
  },
  {
    id: "m17-q3",
    question:
      "What caused the universe to suddenly become transparent at t ≈ 380,000 years (Recombination)?",
    options: [
      "The first stars ignited and burned away the dust clouds",
      "Dark energy pushed all the matter into black holes",
      "Free electrons combined with atomic nuclei to form neutral atoms, letting photons travel unimpeded",
      "The speed of light suddenly increased by a factor of one thousand",
    ],
    correctAnswerIndex: 2,
    explanation:
      "Before recombination, free electrons scattered photons continuously via Thomson scattering. When temperature dropped to ~3,000 K, electrons bound to protons to form neutral hydrogen, allowing photons to stream freely as the CMB.",
    difficulty: "intermediate",
  },
  {
    id: "m17-q4",
    question:
      "Why is the Cosmic Microwave Background (CMB) observed today at ~2.73 K instead of its original ~3,000 K emission temperature?",
    options: [
      "Photons lost their energy colliding with interstellar dust",
      "The metric expansion of space stretched the photons' wavelengths by a factor of (1 + z) ≈ 1100",
      "Nuclear reactions absorbed the excess heat over billions of years",
      "Dark matter cooled the universe like a cosmic refrigerator",
    ],
    correctAnswerIndex: 1,
    explanation:
      "As space expanded, the wavelengths of the primordial photons stretched proportionally to the scale factor: T(z) = T_0 * (1 + z). With z ≈ 1090, the initial 2970 K radiation has cooled to 2.7255 K.",
    difficulty: "intermediate",
  },
  {
    id: "m17-q5",
    question: "What marked the end of the Cosmic Dark Ages during the epoch of Reionization?",
    options: [
      "The formation of the Solar System and the Earth",
      "Population III stars and the first proto-galaxies emitting ultraviolet light that re-ionized intergalactic hydrogen",
      "The collapse of the entire universe into a single supermassive black hole",
      "The discovery of fire by early humans",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Massive, metal-free Population III stars and the earliest galaxies poured out energetic UV radiation (>13.6 eV), ionizing hydrogen gas and making the universe transparent to optical light.",
    difficulty: "intermediate",
  },
  {
    id: "m17-q6",
    question: "When did the universe reach 'Cosmic Noon'—the peak of star formation activity?",
    options: [
      "During the first 3 minutes of the Big Bang",
      "At redshift z ≈ 2 (roughly 10 billion years ago, when the universe was 2 to 4 billion years old)",
      "Yesterday, when the James Webb Space Telescope launched",
      "It has not happened yet; it will happen in 50 billion years",
    ],
    correctAnswerIndex: 1,
    explanation:
      "The cosmic star formation rate density peaked around z ≈ 2 (Cosmic Noon), when galaxy collisions and cold gas streams fueled star birth at ten times the modern rate.",
    difficulty: "advanced",
  },
];

export const MODULE_17_DISCOVERY_FACTS = [
  {
    title: "1% of Old TV Static Came from the Big Bang",
    text: "Before digital television, if you tuned an analog cathode-ray TV between channels, about 1% of the dancing black-and-white static snow was caused by your antenna catching primordial photons from the Cosmic Microwave Background!",
    icon: "Tv",
  },
  {
    title: "You Drink 13.8-Billion-Year-Old Atoms",
    text: "Water is H₂O. The two hydrogen atoms in every single water molecule in your body were created in the first 20 minutes of the Big Bang. They have existed for 13.8 billion years without ever decaying!",
    icon: "Droplets",
  },
  {
    title: "The Most Perfect Blackbody in Nature",
    text: "NASA's COBE satellite measured the Cosmic Microwave Background spectrum in 1990. The data points matched theoretical blackbody radiation so perfectly that the error bars were narrower than the thickness of the printed line on the graph!",
    icon: "ShieldCheck",
  },
  {
    title: "There Is No 'Edge' to Space",
    text: "If you could instantly travel 100 billion light-years in any direction, you would still find yourself in the middle of galaxies, filaments, and voids. Space either loops back on itself like a higher-dimensional sphere, or it extends infinitely!",
    icon: "Globe",
  },
];

export const MODULE_17_SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    title: "Planck 2018 Results. VI. Cosmological Parameters",
    organization: "Planck Collaboration / Astronomy & Astrophysics (A&A 641, A6)",
    url: "https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html",
  },
  {
    title: "A Measurement of Excess Antenna Temperature at 4080 Mc/s (CMB Discovery)",
    organization: "Penzias & Wilson (1965) / Astrophysical Journal (ApJ 142, 419)",
    url: "https://ui.adsabs.harvard.edu/abs/1965ApJ...142..419P",
  },
  {
    title: "The Cosmic History of Star Formation (Madau & Dickinson Review)",
    organization: "Annual Review of Astronomy and Astrophysics (ARAA 52, 415)",
    url: "https://ui.adsabs.harvard.edu/abs/2014ARA%26A..52..415M",
  },
  {
    title: "The Origin of Chemical Elements (Alpher, Bethe, Gamow / αβγ Paper)",
    organization: "Physical Review (Phys. Rev. 73, 803)",
    url: "https://journals.aps.org/pr/abstract/10.1103/PhysRev.73.803",
  },
  {
    title: "A Candidate z = 14.32 Galaxy Confirmed by JWST NIRSpec (JADES-GS-z14-0)",
    organization: "Carniani et al. (2024) / Nature / arXiv:2405.18485",
    url: "https://arxiv.org/abs/2405.18485",
  },
];
