import type { LessonModule, ScientificSource } from "../types";

export interface SolarParameter {
  label: string;
  value: string;
  earthRatio: string;
  source: string;
  notes: string;
}

export const SOURCED_SOLAR_PARAMETERS: SolarParameter[] = [
  {
    label: "Equatorial Radius",
    value: "696,340 km",
    earthRatio: "109.2 × Earth",
    source: "NASA Solar System Exploration / SDO",
    notes: "Measured from solar center to the optical photosphere (tau = 2/3).",
  },
  {
    label: "Total Mass",
    value: "1.9885 × 10³⁰ kg",
    earthRatio: "332,950 × Earth",
    source: "IAU Current Best Estimates",
    notes: "Accounts for approximately 99.86% of the entire Solar System mass.",
  },
  {
    label: "Total Luminosity",
    value: "3.828 × 10²⁶ Watts",
    earthRatio: "Continuous solar constant 1,361 W/m² at 1 AU",
    source: "SORCE / TSIS-1 Satellite Measurements",
    notes: "Total electromagnetic radiant energy produced per second by core fusion.",
  },
  {
    label: "Effective Photosphere Temperature",
    value: "5,772 Kelvin (~5,500 °C)",
    earthRatio: "19.4 × Earth surface mean",
    source: "NASA SDO / Standard Solar Model (BS2005)",
    notes: "Blackbody equivalent temperature radiating into outer space.",
  },
  {
    label: "Central Core Temperature",
    value: "15,700,000 Kelvin",
    earthRatio: "2,600 × Earth core temp",
    source: "Helioseismology & Bahcall Solar Models",
    notes: "Sufficient kinetic energy for protons to overcome electrostatic Coulomb barrier.",
  },
  {
    label: "Core Density",
    value: "150,000 kg/m³ (150 g/cm³)",
    earthRatio: "13.6 × Lead density (~27 × Earth mean density)",
    source: "Standard Solar Model",
    notes: "Extreme gravitational compression maintaining core hydrostatic equilibrium.",
  },
  {
    label: "Surface Gravity",
    value: "274.0 m/s²",
    earthRatio: "27.9 × Earth gravity (g)",
    source: "NASA Planetary Fact Sheet",
    notes: "A 70 kg human on the solar surface would weigh over 1,950 kg (4,300 lbs).",
  },
  {
    label: "Differential Rotation Period",
    value: "25.05 days (Equator) to 34.4 days (Poles)",
    earthRatio: "Differential fluid plasma rotation",
    source: "Helioseismic observations (SOHO / MDI, SDO / HMI)",
    notes: "Differential rotation twists magnetic field lines, driving the 11-year solar cycle.",
  },
  {
    label: "Age & Main-Sequence Lifespan",
    value: "4.60 billion years old (Lifespan ~10 billion years)",
    earthRatio: "Approximately halfway through main sequence",
    source: "Meteoritic isotopic dating & stellar evolutionary models",
    notes: "Will evolve into a red giant in ~5 billion years after core hydrogen exhaustion.",
  },
  {
    label: "Bulk Elemental Composition",
    value: "73.46% H, 24.85% He, 0.77% O, 0.29% C, 0.16% Fe, 0.12% Ne (by mass)",
    earthRatio: "Primordial cosmic abundance",
    source: "Asplund et al. (2009) Solar Chemical Composition",
    notes: "Photosphere spectroscopy matches pristine pre-solar interstellar nebula.",
  },
];

export interface SubLesson07 {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  content: {
    beginner: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    intermediate: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
    advanced: {
      summary: string;
      keyConcepts: string[];
      details: string[];
      didYouKnow: string;
    };
  };
}

export const MODULE_07_SUBLESSONS: SubLesson07[] = [
  {
    id: "07-01",
    number: 1,
    title: "1. The Sun is a Star",
    subtitle: "A spectral class G2V yellow dwarf in hydrostatic equilibrium",
    content: {
      beginner: {
        summary:
          "The Sun is not a special fiery ball—it is an ordinary, medium-sized star located at the center of our Solar System. It looks huge and blindingly bright to us only because it is so close compared to distant nighttime stars.",
        keyConcepts: [
          "The Sun contains 99.86% of all the matter in the entire Solar System.",
          "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
          "The Sun is a glowing sphere of hot charged gas called plasma, not burning wood or coal.",
        ],
        details: [
          "If the Sun were hollow, over 1.3 million Earths could fit inside it.",
          "Our Sun has been shining steadily for 4.6 billion years and has enough fuel for another 5 billion years.",
          "It holds all eight planets, dwarf planets, and billions of asteroids in stable orbits with its gravity.",
        ],
        didYouKnow:
          "If the Sun were the size of a standard basketball, Earth would be a tiny pinhead placed 26 meters (85 feet) away!",
      },
      intermediate: {
        summary:
          "Astrophysicists classify the Sun as a G2V main-sequence yellow dwarf star. It maintains a stable size through hydrostatic equilibrium: the inward crush of gravity is precisely balanced by the outward thermal radiation pressure generated by core fusion.",
        keyConcepts: [
          "Spectral Classification: G2V denotes surface temperature (~5,772 K) and luminosity class V (main-sequence dwarf).",
          "Hydrostatic Equilibrium: Gravity pulls inward, while gas pressure and radiation pressure push outward.",
          "Differential Rotation: The Sun is a fluid plasma, so its equator rotates in 25 days while poles take ~34 days.",
        ],
        details: [
          "Because the Sun is composed entirely of ionized plasma, it does not rotate as a rigid solid body. This differential rotation shears magnetic fields.",
          "The solar constant is approximately 1,361 Watts per square meter at 1 Astronomical Unit (Earth's average distance).",
          "Helioseismology uses acoustic sound waves trapped inside the Sun to probe its internal density and temperature profiles, similar to seismic waves probing Earth.",
        ],
        didYouKnow:
          "The Sun loses about 4.3 million metric tons of mass every single second as pure radiation energy, yet has lost less than 0.05% of its total mass over its entire 4.6 billion-year life!",
      },
      advanced: {
        summary:
          "The Sun's stability is governed by the stellar structure equations: conservation of mass, hydrostatic equilibrium dP/dr = -G·M(r)·ρ(r)/r², energy transport via radiation and convection, and the nuclear energy generation rate ε_pp.",
        keyConcepts: [
          "Equation of State: Highly ionized plasma treated accurately as an ideal gas P = (ρ/μ·m_u) k_B T with minor degenerate electron corrections in the dense core.",
          "Eddington Luminosity Limit: Outward radiation force on free electrons F_rad = (σ_T·L)/(4πr²c) remains far below gravitational pull, ensuring stability.",
          "Solar Metallicity Z ≈ 0.014: The abundance of elements heavier than helium dictates stellar opacity κ, which sets the boundary between radiative and convective zones.",
        ],
        details: [
          "The virial theorem dictates that half of the gravitational potential energy released during pre-main-sequence contraction went into heating the interior, while the other half was radiated away.",
          "Standard Solar Models (such as Bahcall-Pinsonneault BP2005) match helioseismic sound-speed profiles within 0.1% throughout the radiative interior.",
          "Solar neutrinos provide a real-time probe of core fusion rates, confirming that the core conditions calculated by theory match current real-world reactions.",
        ],
        didYouKnow:
          "The 'Solar Neutrino Problem' puzzled physicists for 30 years until Sudbury Neutrino Observatory proved in 2001 that neutrinos oscillate between electron, muon, and tau flavors en route to Earth, winning the 2015 Nobel Prize in Physics!",
      },
    },
  },
  {
    id: "07-02",
    number: 2,
    title: "2. Internal Structure of the Sun",
    subtitle: "Core, radiative zone, tachocline, and turbulent convective cells",
    content: {
      beginner: {
        summary:
          "Inside the Sun, temperatures and pressures are extreme. It is organized into distinct layers like an onion: the super-hot Core at the center, the Radiative Zone where light bounces for millennia, the Convection Zone where hot plasma boils upward, and the thin glowing surface.",
        keyConcepts: [
          "The Core is the nuclear furnace reaching an astonishing 15 million degrees Celsius.",
          "The Radiative Zone acts like a dense maze where light particles bounce around for over 100,000 years to escape.",
          "The Convection Zone works like a boiling pot of water, carrying heat up to the surface in giant plasma bubbles.",
        ],
        details: [
          "The Core extends from the center out to about 25% of the Sun's radius, but contains about half the Sun's mass.",
          "In the Convection Zone, plasma cools near the surface, turns darker, and sinks back down to be reheated.",
          "Each boiling bubble (granule) on the surface is roughly the size of Texas or the continent of Europe!",
        ],
        didYouKnow:
          "A photon of light created by nuclear fusion today will take over 100,000 years to reach the surface, but once it escapes into space, it reaches your eyes in just 8 minutes!",
      },
      intermediate: {
        summary:
          "The solar interior is partitioned into three concentric thermodynamic zones based on the dominant heat transport mechanism: the nuclear-generating core (0–0.25 R☉), the radiative zone (0.25–0.70 R☉), and the convective zone (0.70–1.00 R☉), separated by the shear boundary known as the tachocline.",
        keyConcepts: [
          "Radiative Diffusion: High opacity causes photons to undergo an endless Compton/Thomson scattering random walk with a mean free path of only ~0.1 to 1 millimeter.",
          "The Tachocline: A thin shear layer at ~0.70 R☉ where uniform solid-body core rotation transitions to differential rotation, serving as the generator for the solar magnetic field.",
          "Convective Instability: Triggered when the Schwarzschild criterion is met (dT/dr exceeds the adiabatic temperature gradient), as recombination of hydrogen and helium increases opacity.",
        ],
        details: [
          "Core density is roughly 150 times that of liquid water (150 g/cm³), under a central pressure exceeding 250 billion atmospheres.",
          "At the base of the convective zone, temperatures are ~2 million K; by the top of the photosphere, temperature has cooled to ~5,772 K.",
          "Granulation cells carry hot upwellings at velocities of 1 to 2 km/s, lasting about 8 to 20 minutes before dissolving.",
        ],
        didYouKnow:
          "The tachocline is only a few percent of the solar radius thick, yet it acts as the primary dynamo engine that creates the Sun's magnetic cycles and solar flares!",
      },
      advanced: {
        summary:
          "Energy transport follows the radiative transfer equation F = -(16σ T³)/(3 κ ρ) (dT/dr). When opacity κ rises sharply due to bound-free electron transitions in cooler outer regions, the radiative gradient becomes steeper than the adiabatic gradient ∇_rad > ∇_ad (Schwarzschild criterion), driving vigorous turbulent Rayleigh-Bénard convection.",
        keyConcepts: [
          "Kramer's Opacity Law: κ ∝ ρ T^(-3.5) explains why cooling outer layers become opaque to radiation, forcing convective turnover.",
          "Mixing Length Theory (MLT): Approximates turbulent energy transport using the ratio α = l_m / H_p (typically ~1.8 to 2.1 in standard solar calibration).",
          "Helioseismic Inversions: Rotational splitting of p-mode acoustic oscillations precisely constrains differential rotation Ω(r, θ) through the convection zone and tachocline.",
        ],
        details: [
          "Supergranulation: Larger convective patterns (~30,000 km across) persist for ~24 hours with horizontal flows of ~400 m/s, sweeping magnetic flux tubes to cell boundaries.",
          "Photon diffusion time: τ_diff ≈ (3 R²)/(c · l_mfp) yields between 100,000 and 170,000 years for radiant energy to diffuse from core to photosphere.",
          "The core's hydrogen mass fraction X has decreased from an initial 0.71 to ~0.34 today due to 4.6 Gyr of p-p chain burning.",
        ],
        didYouKnow:
          "The Sun's core does not generate energy intensely per unit volume: its power density is only ~276 Watts per cubic meter—similar to the heat output of a warm compost pile or a human metabolism! Its colossal power comes strictly from its vast volume.",
      },
    },
  },
  {
    id: "07-03",
    number: 3,
    title: "3. Nuclear Fusion",
    subtitle: "The proton-proton chain converting hydrogen into helium via E = mc²",
    content: {
      beginner: {
        summary:
          "The Sun does not burn oxygen like a campfire. Deep in its core, extreme heat and pressure force hydrogen atoms to slam together and fuse into helium atoms. In this process, a tiny bit of matter is converted into pure, brilliant energy.",
        keyConcepts: [
          "Fusion is the opposite of fission: instead of splitting heavy atoms, it unites lightweight atoms.",
          "Four hydrogen nuclei (protons) fuse together to produce one helium nucleus.",
          "The missing mass is transformed into radiant light and heat according to Einstein's famous equation: E = mc².",
        ],
        details: [
          "Protons normally repel each other because they both have positive electric charges. Only the Sun's 15-million-degree heat gives them enough speed to collide and stick together.",
          "Every second, the Sun fuses 600 million tons of hydrogen into 596 million tons of helium.",
          "The 4 million tons of 'missing' mass becomes the light and warmth that illuminates our entire solar system.",
        ],
        didYouKnow:
          "A single gram of hydrogen fused in the Sun's core releases as much energy as burning 20,000 liters of gasoline or 17 tons of coal!",
      },
      intermediate: {
        summary:
          "In stars with masses like the Sun (M ≤ 1.3 M☉), nuclear fusion proceeds primarily via the Proton-Proton (p-p) Chain reaction. Because like charges repel by Coulomb's law, fusion can only occur via quantum mechanical tunneling through the electrostatic barrier.",
        keyConcepts: [
          "Step 1: Two protons fuse: p + p → ²H (deuteron) + e⁺ (positron) + ν_e (electron neutrino). This weak force reaction is the bottleneck.",
          "Step 2: Deuteron quickly captures another proton: ²H + p → ³He (helium-3) + γ (gamma-ray photon).",
          "Step 3 (p-p I branch): Two ³He nuclei collide: ³He + ³He → ⁴He (helium-4) + 2p + 12.86 MeV.",
        ],
        details: [
          "Total net reaction: 4 ¹H → ⁴He + 2 e⁺ + 2 ν_e + 2 γ, releasing a net 26.73 MeV of energy.",
          "The mass of one ⁴He nucleus is 0.71% less than the combined rest mass of four free protons (mass defect Δm).",
          "Positrons immediately annihilate with ambient electrons (e⁺ + e⁻ → 2γ), producing two 511 keV gamma rays.",
        ],
        didYouKnow:
          "Because the first weak-force step (p + p → ²H) is extremely rare, an average individual proton in the solar core wanders for roughly 9 billion years before successfully fusing!",
      },
      advanced: {
        summary:
          "Core fusion requires quantum tunneling through the Coulomb barrier V_C = (e²)/(4πε₀ r). The Gamow peak defines the narrow energy window where Maxwell-Boltzmann velocity distribution and tunneling probability P ∝ exp(-b/E^(1/2)) overlap, maximizing the cross-section σ(E) = S(E)/E · exp(-2πη).",
        keyConcepts: [
          "p-p Branching Ratios: p-p I (85%), p-p II via ⁷Be (15%), and p-p III via ⁸B (0.02%).",
          "High-energy ⁸B neutrinos (up to 14 MeV) provided the critical signal detected by Super-Kamiokande and SNO.",
          "CNO Cycle: Accounts for only ~1% of solar luminosity, but dominates in stars with core temperatures T_c > 17 million K due to its steep temperature sensitivity ε_CNO ∝ T^17 compared to ε_pp ∝ T^4.",
        ],
        details: [
          "The nuclear reaction rate r_12 = n_1 n_2 ⟨σv⟩ provides negative feedback: if the core overheats, thermal expansion lowers density and temperature, stabilizing fusion output.",
          "Electron neutrinos escape the Sun unhindered in ~2.3 seconds, delivering real-time measurements of central nuclear reaction rates to subterranean detectors on Earth.",
          "Over 4.6 billion years, the accumulation of helium 'ash' in the core has increased core mean molecular weight μ, causing core contraction, higher core temperature, and a 30% increase in solar luminosity since the primordial era (the Faint Young Sun paradox).",
        ],
        didYouKnow:
          "About 65 billion solar neutrinos pass through every square centimeter of your body every second right now—even through the night side of Earth—without touching a single atom!",
      },
    },
  },
  {
    id: "07-04",
    number: 4,
    title: "4. Photosphere, Chromosphere and Corona",
    subtitle: "The visible surface and the mysterious million-degree outer atmosphere",
    content: {
      beginner: {
        summary:
          "The Sun has an atmosphere made of three main layers: the Photosphere (the glowing yellow surface we see), the Chromosphere (a thin reddish middle layer), and the Corona (a ghostly white halo that stretches millions of miles into space).",
        keyConcepts: [
          "The Photosphere is about 5,500 °C (5,772 K) and looks like a grainy, bubbling skin.",
          "The Chromosphere glows with a beautiful crimson-red light visible during total solar eclipses.",
          "The Corona is mysteriously super-hot—exceeding 1 to 3 million degrees Celsius—far hotter than the surface below it!",
        ],
        details: [
          "The Corona can normally be seen by human eyes only during the minutes of totality during a total solar eclipse, or with space telescopes using an artificial occulting disk called a coronagraph.",
          "Limb darkening makes the edges of the Sun look slightly dimmer and cooler than the center because we look through shallower, cooler gas at an angle.",
          "NASA's Parker Solar Probe has physically 'touched the Sun' by flying through the outer corona, collecting pristine samples of solar plasma.",
        ],
        didYouKnow:
          "The Corona being hundreds of times hotter than the surface below it is like moving further away from a campfire and feeling the air get scorching hot! Scientists call this the Coronal Heating Problem.",
      },
      intermediate: {
        summary:
          "The solar atmosphere exhibits an inverted temperature structure. The photosphere sits at optical depth τ ≈ 2/3 (effective temperature 5,772 K). Above the temperature minimum (~4,400 K), the chromosphere rises to ~25,000 K, followed by a steep transition region where temperature surges past 1,000,000 K into the highly ionized corona.",
        keyConcepts: [
          "Photospheric Granulation: Convection cells ~1,000 km across driven by upward hot plasma flows and cooler intergranular downflow lanes.",
          "Chromospheric Hydrogen-Alpha: The Balmer n=3 to n=2 transition at 656.28 nm gives the chromosphere its distinctive crimson hue.",
          "Coronal Heating Mechanisms: Driven by magnetic reconnection events (nanoflares) and dissipation of magnetohydrodynamic (MHD) Alfvén waves propagating up from convection.",
        ],
        details: [
          "In the corona, extreme ultraviolet and X-ray emission dominates because iron atoms are stripped of 13 to 15 electrons (Fe XIV, Fe XVI lines).",
          "Coronal loops outline closed magnetic field lines emerging from active bipolar sunspot regions, trapping multi-million-degree plasma.",
          "Coronal holes are regions where magnetic field lines open directly into interplanetary space, allowing plasma to freely escape as high-speed solar wind.",
        ],
        didYouKnow:
          "During the 1869 total solar eclipse, astronomers discovered a green emission line (530.3 nm) in the corona and thought they found a new element called 'Coronium'. In 1939, it was proven to be Fe XIV—iron stripped of 13 electrons, proving the corona's extreme temperature!",
      },
      advanced: {
        summary:
          "The transition region spans only ~100 km, across which thermal conduction from the corona balances radiative cooling from line emission. Plasma beta β = P_gas / (B² / 2μ₀) flips from β > 1 in the photosphere (gas dynamic dominance) to β ≪ 1 in the corona (magnetic field completely dictates plasma geometry and motion).",
        keyConcepts: [
          "Plasma β Transition: Governs how magnetic fields go from being pushed around by convective granules to rigidly channeling coronal loops.",
          "Alfvén Wave Dissipation: Torsional and shear waves with phase velocity v_A = B / √(μ₀ ρ) deposit energy through turbulent cascade and cyclotron resonance.",
          "Non-LTE (Local Thermodynamic Equilibrium): In the diffuse corona (n_e ~ 10⁸ cm⁻³), collision rates are insufficient to thermalize populations, requiring statistical radiative equilibrium.",
        ],
        details: [
          "Spicules: Supersonic jets of plasma (20–100 km/s) shot from chromospheric magnetic networks into the lower corona, replenishing mass loss.",
          "Parker Solar Probe data (SWEAP and FIELDS instruments) revealed 'switchbacks'—sudden S-shaped reversals in the magnetic field accompanied by localized plasma speed spikes.",
          "Solar Dynamics Observatory (SDO) uses the Atmospheric Imaging Assembly (AIA) to image 7 EUV bands simultaneously at 12-second cadence to map coronal thermal structures.",
        ],
        didYouKnow:
          "Parker Solar Probe reached a top speed of over 635,000 km/h (395,000 mph)—fast enough to fly from New York to Tokyo in under a minute—surviving temperatures near 1,400 °C behind an 11-cm thick carbon-composite shield!",
      },
    },
  },
  {
    id: "07-05",
    number: 5,
    title: "5. Sunspots and Magnetic Activity",
    subtitle: "The 11-year solar cycle, Babcock dynamo, and magnetic flux tubes",
    content: {
      beginner: {
        summary:
          "Sunspots look like dark freckles on the face of the Sun. They are not actually black—they are simply cooler regions (around 3,800 °C compared to the 5,500 °C surface) caused by powerful tangled magnetic fields that block heat from rising.",
        keyConcepts: [
          "Sunspots are regions where strong magnetic field bundles poke through the surface.",
          "They have a dark central core called the umbra and a lighter surrounding border called the penumbra.",
          "The number of sunspots increases and decreases on an 11-year schedule called the Solar Cycle.",
        ],
        details: [
          "If you could remove a sunspot from the Sun and put it in the night sky, it would glow brighter than the full Moon!",
          "Sunspots can grow larger than planet Earth and last from a few days to several weeks.",
          "Sunspot pairs act like giant north and south poles of a bar magnet embedded in the surface.",
        ],
        didYouKnow:
          "During the 'Maunder Minimum' between 1645 and 1715, almost no sunspots appeared for 70 years, coinciding with an unusually cold period in Europe known as the Little Ice Age!",
      },
      intermediate: {
        summary:
          "The 11-year sunspot cycle (part of a full 22-year Hale magnetic cycle) is driven by the solar dynamo. Differential rotation stretches poloidal magnetic field lines into a tight toroidal (east-west) orientation (the Omega effect), until magnetic buoyancy forces flux tubes to erupt through the photosphere.",
        keyConcepts: [
          "Babcock Dynamo Model: Explains how differential rotation (Ω-effect) and helical turbulence in convection (α-effect) regenerate magnetic dipoles.",
          "Hale's Polarity Law: Leading spots in bipolar pairs have opposite magnetic polarities in the Northern vs Southern hemispheres, and all polarities flip every 11 years.",
          "Spörer's Law: As the solar cycle progresses from minimum to maximum, sunspots emerge at high latitudes (~30°) and gradually drift toward the equator (~8°).",
        ],
        details: [
          "Magnetic fields inside sunspot umbrae reach 0.2 to 0.4 Tesla (2,000 to 4,000 Gauss)—thousands of times stronger than Earth's magnetic field (~0.5 Gauss).",
          "The strong vertical magnetic field suppresses convective upwelling of hot plasma, causing the local region to cool by ~1,500 K.",
          "The Solar Cycle is currently in Cycle 25, which began in December 2019 and is reaching its solar maximum.",
        ],
        didYouKnow:
          "Galileo Galilei's observations of sunspots in 1610 provided direct visual proof that the heavens were not immaculate, unblemished crystalline spheres, and proved that the Sun rotated on an axis!",
      },
      advanced: {
        summary:
          "Magnetohydrodynamics (MHD) governs sunspot physics through the induction equation ∂B/∂t = ∇ × (u × B) + η ∇²B. When the magnetic Reynolds number R_m ≫ 1, the magnetic flux is 'frozen' into the plasma (Alfvén's theorem), forcing magnetic field lines to twist with differential rotation Ω(r, θ).",
        keyConcepts: [
          "Zeeman Effect: Spectral lines like Fe I 630.2 nm split into polarized components under strong magnetic fields, allowing vector magnetographs like SDO/HMI to map B precisely.",
          "Magnetic Buoyancy (Parker Instability): Total pressure P_total = P_gas + B²/(2μ₀) must balance surrounding gas pressure, meaning internal gas density is lower, causing the flux tube to float upward.",
          "Penumbral Evershed Flow: Radial outward flow of gas along inclined penumbral magnetic filaments at speeds of 1 to 4 km/s.",
        ],
        details: [
          "The full solar magnetic cycle is 22 years (Hale cycle): after 11 years, the solar magnetic dipole flips (north magnetic pole becomes south), taking 22 years to complete a full magnetic configuration return.",
          "Sunspot active regions store free magnetic energy E_mag = ∫ (B² - B_pot²)/(2μ₀) dV that can be explosively released during solar flares and coronal mass ejections.",
          "Torsional oscillations—bands of slightly faster and slower rotation propagating from poles to equator—provide early predictors of upcoming cycle amplitude.",
        ],
        didYouKnow:
          "The highest sunspot count ever reliably recorded occurred in 1957 during Solar Cycle 19, coinciding with the launch of Sputnik and the International Geophysical Year!",
      },
    },
  },
  {
    id: "07-06",
    number: 6,
    title: "6. Solar Flares and Coronal Mass Ejections",
    subtitle: "Magnetic reconnection explosions and billion-ton plasma eruptions",
    content: {
      beginner: {
        summary:
          "When the Sun's twisted magnetic field lines get stretched too far, they can suddenly snap and reconnect like stretched rubber bands. This triggers a Solar Flare (an intense burst of light and X-rays) and a Coronal Mass Ejection (a giant cloud of billions of tons of electrified plasma shot into space).",
        keyConcepts: [
          "Solar Flares are sudden flashes of light, ultraviolet rays, and X-rays traveling at the speed of light.",
          "Coronal Mass Ejections (CMEs) are massive bubbles of gas and magnetic fields blasted outward at millions of miles per hour.",
          "Flares reach Earth in 8 minutes, while CME plasma clouds take 1 to 3 days to cross space.",
        ],
        details: [
          "Solar flares are classified by letter: B and C are small, M are medium, and X-class flares are giant explosions.",
          "A single major solar flare can release more energy in minutes than millions of hydrogen bombs detonated at once.",
          "When a CME is directed toward Earth, our planet's magnetic shield helps deflect it, but strong storms can cause disruptions.",
        ],
        didYouKnow:
          "In 1859, the most powerful solar storm in recorded history—the Carrington Event—caused telegraph wires to spark, shocking operators and setting paper on fire, while auroras were so bright people in Colorado thought it was dawn!",
      },
      intermediate: {
        summary:
          "Solar flares and CMEs are distinct manifestations of magnetic reconnection in the corona. Opposite-polarity magnetic field lines are forced together in current sheets, where resistivity causes them to break and cross-connect into a lower-energy topology, violently converting stored magnetic energy into thermal, kinetic, and particle acceleration energy.",
        keyConcepts: [
          "Magnetic Reconnection: The fundamental plasma process where topology changes, accelerating ions and electrons along field lines.",
          "Flare Emission Spectrum: Bremsstrahlung hard X-rays from accelerated electrons impacting the dense chromosphere, plus EUV and radio bursts.",
          "Coronal Mass Ejection (CME): Toroidal magnetic flux rope eruption that detaches and carries up to 10¹² kg of coronal plasma at speeds from 250 km/s to over 3,000 km/s.",
        ],
        details: [
          "Solar flare classification uses peak soft X-ray flux (1–8 Å) measured by GOES satellites: C (10⁻⁶ W/m²), M (10⁻⁵ W/m²), and X (10⁻⁴ W/m²), scaled logarithmically (e.g., X2 is twice as powerful as X1).",
          "Solar Energetic Particles (SEPs): Protons accelerated to relativistic velocities (> 0.5 c) in shock fronts arrive at Earth within 20 to 60 minutes.",
          "Halo CMEs: When a CME is directed straight at Earth, coronagraphs (like SOHO LASCO) observe an expanding 360-degree halo of plasma around the occulting disk.",
        ],
        didYouKnow:
          "In November 2003, during the 'Halloween Storms', an X-class flare was estimated at X28 to X45—so intense it completely saturated the sensors on the GOES satellite!",
      },
      advanced: {
        summary:
          "Sweet-Parker and Petschek reconnection models describe plasma inflow v_in ≈ v_A / √(S) into a diffusion region where the magnetic Reynolds number S = μ₀ L v_A / η is localized by kinetic micro-instabilities (such as plasmoid instability), facilitating rapid energy dissipation on timescales of seconds rather than weeks.",
        keyConcepts: [
          "Flux Rope Catastrophe: Loss of equilibrium in a force-free coronal magnetic flux rope (∇ × B = α B) driven by photospheric shearing motions and flux emergence.",
          "Type II and III Radio Bursts: Type III bursts trace relativistic electron beams streaming along open field lines; Type II bursts track MHD shock waves driven by supersonic CMEs.",
          "Interplanetary Coronal Mass Ejection (ICME): Structure consists of a leading forward shock, sheath of compressed solar wind, and a helical magnetic cloud with low proton temperature.",
        ],
        details: [
          "Chromospheric Neupert Effect: The time derivative of soft X-ray thermal emission matches the instantaneous hard X-ray non-thermal Bremsstrahlung profile.",
          "Coronal Dimming: Rapid drop in EUV intensity near the eruption site provides a direct measurement of the coronal plasma mass evacuated by the CME.",
          "Parker Solar Probe and Solar Orbiter perform multi-point in-situ sampling to resolve turbulence and ion-cyclotron wave dissipation directly inside reconnection exhausts.",
        ],
        didYouKnow:
          "A near-miss 'superstorm' on July 23, 2012 passed directly through the orbit of NASA's STEREO-A spacecraft with CME speeds over 2,500 km/s; had it hit Earth, economists estimate global economic damages would have exceeded $2 trillion!",
      },
    },
  },
  {
    id: "07-07",
    number: 7,
    title: "7. Solar Wind, Auroras and Space Weather",
    subtitle: "The heliosphere, geomagnetic storms, and shielding modern civilization",
    content: {
      beginner: {
        summary:
          "The Sun constantly blows a continuous stream of electrified particles into space called the Solar Wind. Earth is protected by its magnetic field, which channels these particles toward the North and South poles, creating the glowing Northern and Southern Lights (auroras).",
        keyConcepts: [
          "The Solar Wind travels at supersonic speeds between 1 and 2 million miles per hour.",
          "Earth's Magnetosphere is an invisible magnetic shield that deflects most solar wind particles safely around us.",
          "Auroras (Northern and Southern Lights) occur when solar particles collide with oxygen and nitrogen atoms in our upper atmosphere.",
        ],
        details: [
          "Green auroras come from solar particles striking oxygen atoms about 100 km (60 miles) up, while red auroras come from high-altitude oxygen above 200 km.",
          "Space weather can affect our technology: it can disrupt GPS signals, scramble radio communication, and create electric currents that trip power grids.",
          "Astronauts outside Earth's magnetic shield must seek shelter in heavily shielded compartments during major solar storms.",
        ],
        didYouKnow:
          "Auroras are not unique to Earth! Hubble and Juno have photographed massive, brilliant ultraviolet auroras at the poles of Jupiter and Saturn, powered by their immense magnetic fields.",
      },
      intermediate: {
        summary:
          "Space weather encompasses environmental conditions in space driven by the Sun that impact technology and human health. When a CME's magnetic field has a southward orientation (negative Bz), it directly merges with Earth's northward magnetic field at the dayside magnetopause, injecting energetic ions into the Van Allen radiation belts.",
        keyConcepts: [
          "Earth's Magnetosphere: Compressed to ~10 Earth radii on the dayside by dynamic pressure P_dyn = ρ v², stretching into a long magnetotail on the nightside.",
          "Magnetic Reconnection at Magnetopause: When interplanetary Bz is negative (southward), reconnection opens Earth's field lines, triggering geomagnetic storms.",
          "Space Weather Scales: NOAA categorizes Geomagnetic Storms (G1–G5), Solar Radiation Storms (S1–S5), and Radio Blackouts (R1–R5).",
        ],
        details: [
          "Geomagnetically Induced Currents (GIC): CME-driven fluctuations in Earth's magnetic field induce quasi-DC electric currents in long transmission lines and pipelines, saturating power transformers.",
          "In March 1989, a severe G5 geomagnetic storm collapsed the Hydro-Québec power grid in Canada within 90 seconds, leaving 6 million people without electricity for 9 hours.",
          "Atmospheric Drag: Geomagnetic storms heat and expand Earth's thermosphere, significantly increasing orbital decay rates for low Earth orbit satellites like Starlink.",
        ],
        didYouKnow:
          "In February 2022, a minor geomagnetic storm expanded Earth's thermosphere by 50%, increasing atmospheric drag and destroying 38 newly launched Starlink satellites before they could reach operational orbit!",
      },
      advanced: {
        summary:
          "The solar wind is described by Eugene Parker's hydrodynamic transonic solution: plasma accelerates through a sonic point from subsonic in the lower corona to supersonic speeds v_sw ≈ 400 km/s (slow wind from streamer belts) to 800 km/s (fast wind from polar coronal holes).",
        keyConcepts: [
          "Heliospheric Current Sheet (HCS): The Parker spiral magnetic topology creates a wavy rotating current sheet (the 'ballerina skirt') separating opposite magnetic polarities throughout the solar system.",
          "Dungey Cycle: Global magnetospheric convection cycle: dayside reconnection, transport of open field lines across polar caps into the lobes, and nightside tail reconnection injecting substorm particles.",
          "Ring Current & Dst Index: Energetic ions (10–300 keV) trapped in equatorial drift orbits produce a westward ring current, quantified by the Disturbance Storm-Time (Dst) index in nanoteslas.",
        ],
        details: [
          "Surface charging and internal dielectric discharge: Relativistic electrons (> 2 MeV) penetrate satellite chassis and build up charge in circuit boards until electrostatic breakdown sparks destroy onboard electronics.",
          "Single Event Upsets (SEU): Heavy cosmic ions or high-energy solar protons flip bits in satellite memory chips, requiring radiation-hardened microcontrollers and triple-modular redundancy.",
          "The Heliopause (~120 AU): The boundary where the solar wind dynamic pressure balances the local interstellar medium (LISM), crossed by Voyager 1 in 2012 and Voyager 2 in 2018.",
        ],
        didYouKnow:
          "During the May 10, 2024 G5 geomagnetic storm, auroras were photographed as far south as Florida, Hawaii, and Puerto Rico, and the Dst index dropped to -412 nT—the strongest storm since November 2003!",
      },
    },
  },
];

export const MODULE_07_SOURCES: ScientificSource[] = [
  {
    title: "NASA Solar Dynamics Observatory (SDO)",
    organization: "NASA Goddard Space Flight Center",
    url: "https://sdo.gsfc.nasa.gov/",
  },
  {
    title: "ESA / NASA Solar and Heliospheric Observatory (SOHO)",
    organization: "European Space Agency / NASA",
    url: "https://soho.nascom.nasa.gov/",
  },
  {
    title: "Parker Solar Probe Science Mission",
    organization: "NASA / Johns Hopkins Applied Physics Laboratory",
    url: "https://parkersolarprobe.jhuapl.edu/",
  },
  {
    title: "NOAA Space Weather Prediction Center (SWPC)",
    organization: "National Oceanic and Atmospheric Administration",
    url: "https://www.swpc.noaa.gov/",
  },
  {
    title: "Standard Solar Model (BS2005) & Helioseismic Inversions",
    organization: "Institute for Advanced Study (J. N. Bahcall) & Stanford SOHO Group",
    url: "https://www.ias.edu/sns/astrophysics/bahcall",
  },
];

export const MODULE_07_LESSON: LessonModule = {
  id: "07",
  title: "The Sun: Our Star",
  subtitle: "The nuclear fusion powerhouse that fuels life",
  description:
    "Peer inside the Sun's core, radiative zone, convection cells, and dynamic magnetic flares.",
  stageId: 2,
  difficultyLevels: ["Beginner", "Intermediate", "Advanced"],
  gradeLevelContent: {
    Beginner: {
      introHook:
        "Every ray of sunshine you feel on your skin began its journey deep inside a 15-million-degree nuclear furnace over 100,000 years ago. Welcome inside the magnificent star that gives Earth life!",
      keyTakeaways: [
        "The Sun is a medium-sized star made of glowing plasma that holds 99.86% of the Solar System's mass.",
        "Its core is powered by nuclear fusion, squishing hydrogen atoms into helium and releasing massive amounts of light and heat.",
        "Energy bounces through the Radiative Zone for over 100,000 years, then bubbles up through the Convective Zone like boiling soup.",
        "Sunspots are magnetic cool patches on the surface, and solar flares can blast clouds of plasma toward Earth, creating auroras.",
      ],
      interactivePrompt:
        "Rotate the 3D Sun, slice it open to inspect each internal layer, trigger nuclear fusion in the particle chamber, and protect your satellite from a solar flare!",
      quizQuestions: [
        {
          id: "q07_b1",
          question: "What is the Sun primarily composed of?",
          options: [
            "Solid rock and molten lava",
            "Super-hot electrified gas called plasma (mostly hydrogen and helium)",
            "Burning coal and oxygen",
            "Liquid metal and ice crystals",
          ],
          correctIndex: 1,
          explanation:
            "The Sun is composed of 73% hydrogen and 25% helium in an ionized state known as plasma.",
        },
        {
          id: "q07_b2",
          question: "How does the Sun produce its enormous light and heat?",
          options: [
            "Chemical burning of wood and oil",
            "Radioactive decay of heavy uranium rocks",
            "Nuclear fusion of hydrogen atoms into helium in its core",
            "Friction from spinning rapidly in space",
          ],
          correctIndex: 2,
          explanation:
            "Under the extreme heat and pressure of the solar core, hydrogen atoms fuse into helium, converting mass into energy.",
        },
        {
          id: "q07_b3",
          question: "Why do sunspots appear darker than the rest of the Sun's surface?",
          options: [
            "They are giant holes where the Sun has burned out",
            "They are cooler than the surrounding surface because magnetic fields block rising heat",
            "They are large shadow cast by orbiting asteroids",
            "They are made of black space soot",
          ],
          correctIndex: 1,
          explanation:
            "Sunspots are ~3,800 °C while the surrounding photosphere is ~5,500 °C; because they are cooler, they appear dark by contrast.",
        },
      ],
      funFacts: [
        "About 1.3 million Earths could fit inside the volume of the Sun!",
        "The Sun is so massive that it accounts for 99.86% of all the mass in the entire solar system.",
        "The Sun travels around the center of the Milky Way galaxy at 828,000 km/h, taking about 230 million years to complete one orbit (a Galactic Year).",
      ],
    },
    Intermediate: {
      introHook:
        "The Sun is a dynamic astrophysical plasma laboratory. Balanced by hydrostatic equilibrium and driven by differential rotation, its internal dynamo generates magnetic storms that ripple across 150 million kilometers to shape Earth's technological world.",
      keyTakeaways: [
        "The Sun is a spectral type G2V main-sequence dwarf star in hydrostatic equilibrium.",
        "The p-p chain fuses 600 million metric tons of hydrogen each second, losing 4.3 million tons of mass via Einstein's E = mc².",
        "The internal structure comprises the Core (0–0.25 R☉), Radiative Zone (0.25–0.70 R☉), Tachocline, Convective Zone (0.70–1.00 R☉), Photosphere, Chromosphere, and million-degree Corona.",
        "Coronal Mass Ejections (CMEs) with southward magnetic orientation (Bz < 0) reconnect with Earth's magnetosphere, driving geomagnetic storms and auroras.",
      ],
      interactivePrompt:
        "Explore the 3D Sun cutaway to compare temperatures and energy transport across layers. Step through the p-p chain reaction and simulate a CME space-weather impact on an orbiting spacecraft.",
      quizQuestions: [
        {
          id: "q07_i1",
          question:
            "Which layer of the Sun is responsible for generating the solar magnetic field through differential rotation?",
          options: [
            "The radiative zone",
            "The tachocline (shear layer between radiative and convective zones)",
            "The outer corona",
            "The solar wind boundary",
          ],
          correctIndex: 1,
          explanation:
            "The tachocline is the shear transition boundary at ~0.70 R☉ where solid-body rotation meets differential rotation, functioning as the solar dynamo engine.",
        },
        {
          id: "q07_i2",
          question: "Why does energy take over 100,000 years to travel through the radiative zone?",
          options: [
            "The speed of light is slowed to a crawl by gravity",
            "Photons undergo millions of random-walk absorption and scattering collisions with dense plasma particles",
            "The radiative zone is spinning backwards relative to the core",
            "Energy is trapped inside atomic nuclei and cannot move",
          ],
          correctIndex: 1,
          explanation:
            "Due to the extreme density, the mean free path of a photon is less than a millimeter, causing it to bounce in a random walk for 100,000 to 170,000 years before reaching the convective zone.",
        },
        {
          id: "q07_i3",
          question:
            "What orientation of the interplanetary magnetic field (Bz) allows a Coronal Mass Ejection to strongly drive geomagnetic storms on Earth?",
          options: [
            "Northward (positive Bz), pointing in the same direction as Earth's magnetic dipole",
            "Southward (negative Bz), opposing Earth's magnetic dipole and enabling magnetic reconnection",
            "Eastward, perpendicular to the ecliptic plane",
            "Zero magnetic field (neutral plasma only)",
          ],
          correctIndex: 1,
          explanation:
            "When the CME's magnetic field points southward (negative Bz), it directly opposes Earth's northward dipole field, allowing magnetic reconnection to open Earth's shield and inject plasma into the ring current.",
        },
      ],
      funFacts: [
        "The core temperature is 15.7 million Kelvin, but the outer corona heats back up to 1–3 million Kelvin—the famous 'Coronal Heating Problem'.",
        "During total solar eclipses, the Moon is 400 times smaller than the Sun, but is also 400 times closer, creating a near-perfect angular size match of ~0.5 degrees!",
        "Every second, the Sun emits 3.828 × 10²⁶ Joules of energy, equivalent to the detonation of approximately 91 billion megatons of TNT per second.",
      ],
    },
    Advanced: {
      introHook:
        "From quantum tunneling through the Coulomb barrier via the Gamow peak to magnetohydrodynamic reconnection in low-beta coronal current sheets, modern solar physics bridges subatomic nuclear interactions with astronomical plasma scales.",
      keyTakeaways: [
        "Proton fusion requires quantum mechanical tunneling through the Coulomb electrostatic barrier; reaction rates are dictated by the Gamow peak.",
        "Energy transport transitions from radiative diffusion to Rayleigh-Bénard convection when opacity κ triggers Schwarzschild convective instability (∇_rad > ∇_ad).",
        "The 11-year Schwabe and 22-year Hale magnetic cycles are driven by the Babcock-Leighton α-Ω kinematic dynamo.",
        "Spacecraft protection requires managing single-event upsets (SEU) from high-energy SEPs, electrostatic surface charging from relativistic electrons, and orbital drag from thermospheric Joule heating.",
      ],
      interactivePrompt:
        "Perform precision layer analysis with physical densities and temperatures. Experiment with the quantum Gamow tunneling model, toggle illustrative magnetic field line topologies, and command satellite mitigation during a simulated X-class flare.",
      quizQuestions: [
        {
          id: "q07_a1",
          question:
            "What physical phenomenon allows two positively charged protons to overcome their electrostatic Coulomb repulsion at 15.7 million K?",
          options: [
            "Classical thermal kinetic energy exceeding the 1 MeV Coulomb barrier",
            "Quantum mechanical tunneling through the potential barrier at the Gamow peak",
            "Magnetic pinch forces produced by the core dynamo",
            "Electron degeneracy pressure forcing protons together",
          ],
          correctIndex: 1,
          explanation:
            "Classical kinetic energy at 15.7 million K (~1.3 keV) is far below the ~1,000 keV Coulomb barrier; fusion occurs strictly via quantum mechanical tunneling through the barrier, maximized at the Gamow peak.",
        },
        {
          id: "q07_a2",
          question:
            "What condition dictates the transition from radiative energy transport to turbulent convection at ~0.71 R☉?",
          options: [
            "Plasma beta falls below unity (β < 1)",
            "The Schwarzschild criterion is met: the radiative temperature gradient exceeds the adiabatic gradient (∇_rad > ∇_ad) due to increased opacity",
            "Hydrogen becomes fully ionized and ceases to conduct radiation",
            "Nuclear reactions begin in the outer shell",
          ],
          correctIndex: 1,
          explanation:
            "As temperature drops to ~2 million K at 0.71 R☉, bound-free electron interactions increase opacity κ, causing the required radiative gradient to exceed the adiabatic gradient (∇_rad > ∇_ad), triggering convective instability.",
        },
        {
          id: "q07_a3",
          question:
            "Why is the plasma beta β = P_gas / (B² / 2μ₀) critical in understanding the solar atmosphere?",
          options: [
            "It measures the ratio of fusion energy to gravitational binding energy",
            "In the photosphere β > 1 (gas motions dominate magnetic fields), whereas in the corona β ≪ 1 (magnetic fields rigidly dictate plasma structure and dynamics)",
            "It indicates whether electron or proton conduction carries heat",
            "It sets the speed of sound relative to the speed of light",
          ],
          correctIndex: 1,
          explanation:
            "In the dense photosphere, β > 1 so convective gas motions drag magnetic field lines around. In the corona, β ≪ 1, so the magnetic field completely dominates, forcing plasma to flow strictly along coronal loops.",
        },
      ],
      funFacts: [
        "The core's volumetric power generation rate is only ~276 W/m³—lower than human metabolic heat production per unit volume (~1,000 W/m³)! The colossal solar luminosity arises solely from the core's enormous 3.5 × 10²⁶ m³ volume.",
        "Helioseismic acoustic p-modes vibrate through the Sun like a giant musical bell with a fundamental period of approximately 5 minutes.",
        "The Parker Solar Probe has confirmed magnetic 'switchbacks' in the inner heliosphere—rapid 180-degree kinks in the magnetic field lines that accelerate solar wind plasma streams.",
      ],
    },
  },
};

export const MODULE_07_QUIZ = MODULE_07_LESSON.gradeLevelContent.Intermediate.quizQuestions;
