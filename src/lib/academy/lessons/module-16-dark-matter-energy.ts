// @ts-nocheck -- loosely-typed educational content; runtime-validated by rendering.
import type { AdaptiveContent, KnowledgeCheckQuestion, ScientificSource } from "../types";

export interface SubLesson {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  readTimeMinutes: number;
  content: {
    explorer: AdaptiveContent;
    navigator: AdaptiveContent;
    astrophysicist: AdaptiveContent & { mathematics?: string };
  };
}

export const MODULE_16_SUBLESSONS: SubLesson[] = [
  {
    id: "sub-16-1-visible-invisible",
    order: 1,
    title: "Visible Matter & Invisible Mass",
    subtitle: "Counting stars and discovering a missing universe",
    readTimeMinutes: 3,
    content: {
      explorer: {
        lead: "When we look at the night sky, we see billions of shining stars, glowing gas clouds, and bright galaxies. But astronomers discovered a shocking secret: everything we can see with our eyes and telescopes is only a tiny fraction of what actually exists!",
        keyIdea:
          "Normal matter—atoms making up stars, planets, and humans—accounts for only about 5% of the total energy and mass of the universe.",
        explanation:
          "Imagine walking into a library where only 1 out of every 20 books is visible on the shelves, while 19 out of 20 books are completely invisible yet heavy enough to make the floor bend. That is what our universe is like! Stars and planets exert gravitational pulls, but astronomers noticed that galaxies were acting as though they held enormous amounts of extra, unseen mass.",
        activityPrompt:
          "In Lab A, toggle between 'Visible Matter Only' and 'With Dark Matter Halo' to see how unseen mass completely changes galaxy behavior.",
      },
      navigator: {
        lead: "Astrophysicists can estimate the mass of a galaxy in two independent ways: by adding up the light emitted by all its stars and gas (luminosity-to-mass), or by measuring how fast objects orbit around it using gravity. These two methods yield radically conflicting answers.",
        keyIdea:
          "The dynamical mass of spiral galaxies and galaxy clusters exceeds their luminous baryonic mass by a factor of 5 to 10.",
        explanation:
          "Astronomers calculate the 'mass-to-light ratio' (M/L) in solar units. For normal stellar populations, M/L is between 1 and 3. However, when measuring the gravitational forces required to hold outer stars in orbit, the required mass-to-light ratio jumps to 10–50 or higher! This discrepancy was the first red flag that invisible gravitational mass surrounds every major galaxy.",
        activityPrompt:
          "Examine the Mass Profile plot in Lab A to compare the plateauing visible mass with the continuously rising halo mass.",
      },
      astrophysicist: {
        lead: "Baryonic matter—protons, neutrons, and electrons formed during Big Bang nucleosynthesis (BBN)—is tightly constrained by the cosmic abundance of deuterium, helium-3, and lithium-7. The baryon density parameter is precisely $\\Omega_b h^2 \\approx 0.0224$, corresponding to $\\Omega_b \\approx 0.049$.",
        keyIdea:
          "The total matter density parameter $\\Omega_m \\approx 0.315$ requires that non-baryonic matter accounts for roughly 84% of all matter in the universe ($\\\\Omega_c / \\Omega_m \\approx 0.84$).",
        explanation:
          "Light-element synthesis in the first 20 minutes of the universe fixes the baryon-to-photon ratio $\\eta \\approx 6.1 \\times 10^{-10}$. If all missing gravitating mass were normal baryons (such as rogue planets or cold gas), nucleosynthesis reactions would have fused virtually all deuterium into helium-4. Because substantial primordial deuterium persists, the invisible mass must be non-baryonic—composed of particles that do not participate in strong nuclear or electromagnetic interactions.",
        mathematics:
          "\\text{Total Cosmic Density Budget: } \\Omega_{\\text{total}} = \\Omega_b (\\approx 4.9\\%) + \\Omega_c (\\approx 26.8\\%) + \\Omega_\\Lambda (\\approx 68.3\\%) \\approx 1.000 \\pm 0.002",
        activityPrompt:
          "Check the Cosmic Energy Budget breakdown in Lab C to verify the relative baryonic, dark matter, and dark energy fractions.",
      },
    },
  },
  {
    id: "sub-16-2-rotation-curves",
    order: 2,
    title: "Evidence from Galaxy Rotation Curves",
    subtitle: "Vera Rubin's landmark breakthrough at the edge of spiral disks",
    readTimeMinutes: 4,
    content: {
      explorer: {
        lead: "In our Solar System, planets far from the Sun travel much slower than inner planets: Mercury zips around in 88 days, while distant Neptune takes 165 years. Astronomers expected stars at the edge of galaxies to slow down too—but they don't!",
        keyIdea:
          "Instead of slowing down like planets around the Sun, stars at the outer rim of galaxies orbit just as fast as stars near the center.",
        explanation:
          "In the 1970s, pioneering astronomer Vera Rubin and Kent Ford measured the speeds of hydrogen gas clouds and stars orbiting far out in spiral galaxies like Andromeda. Instead of dropping off, the speed stayed flat! The only way those distant stars could stay bound without flying off into deep space was if the galaxy was embedded in a huge invisible cocoon of gravity.",
        activityPrompt:
          "In Lab A, observe how stars at the outer edge fly off or slow down when the Dark Matter Halo is turned off.",
      },
      navigator: {
        lead: "By Newton's law of universal gravitation and centripetal acceleration, an object in a circular orbit of radius $r$ around enclosed mass $M(r)$ moves at velocity $v = \\sqrt{G M(r) / r}$. Outside the visible light disk, $M(r)$ should become constant, predicting $v(r) \\propto r^{-1/2}$.",
        keyIdea:
          "Observations consistently show 'flat rotation curves' ($v(r) \\approx \\text{constant}$), requiring enclosed mass to increase linearly with radius: $M(r) \\propto r$.",
        explanation:
          "If the visible stars and gas (which fade exponentially beyond a few kiloparsecs) represented all the mass, the rotation curve would exhibit a 'Keplerian decline.' Rubin's spectrographic data revealed that orbital velocities remain constant ($200\\text{–}250\\text{ km/s}$) out to dozens of kiloparsecs, far beyond the optical disk. To produce $v(r) = \\text{const}$, the enclosed mass must satisfy $M(r) \\propto r$, requiring a dark matter density profile $\\rho(r) \\propto r^{-2}$.",
        activityPrompt:
          "Inspect the Vera Rubin observation points plotted against the theoretical Keplerian curve in Lab A.",
      },
      astrophysicist: {
        lead: "Modern rotation curve decomposition isolates three mass components: the central bulge, the exponential stellar disk, and the spherical dark matter halo. The observed velocity satisfies $v_{\\text{obs}}^2(r) = v_{\\text{bulge}}^2(r) + v_{\\text{disk}}^2(r) + v_{\\text{gas}}^2(r) + v_{\\text{halo}}^2(r)$.",
        keyIdea:
          "The Navarro-Frenk-White (NFW) profile derived from N-body cosmological simulations matches rotation curves across diverse morphological types.",
        explanation:
          "Cold Dark Matter (CDM) halos are well-modeled by the NFW density profile: $\\rho_{\\text{NFW}}(r) = \\frac{\\rho_0}{(r/r_s)(1 + r/r_s)^2}$, which transitions from an inner $\\rho \\propto r^{-1}$ cusp to an outer $\\rho \\propto r^{-3}$ decline. Integration yields an enclosed mass $M(r) = 4\\pi \\rho_0 r_s^3 [\\ln(1 + r/r_s) - \\frac{r/r_s}{1 + r/r_s}]$, producing flat circular velocity curves over intermediate radial scales ($r_s \\lesssim r \\lesssim r_{200}$).",
        mathematics:
          "v_c(r) = \\sqrt{\\frac{G M(r)}{r}} \\implies \\text{for } \\rho(r) = \\frac{v_0^2}{4\\pi G r^2} \\implies M(r) = \\frac{v_0^2 r}{G} \\implies v_c(r) = v_0 = \\text{const}",
        activityPrompt:
          "Tune the halo scale radius and halo central density in Lab A to fit real galaxy rotation curve data.",
      },
    },
  },
  {
    id: "sub-16-3-gravitational-lensing",
    order: 3,
    title: "Gravitational Lensing & The Bullet Cluster",
    subtitle: "Weighing invisible matter with bent light",
    readTimeMinutes: 4,
    content: {
      explorer: {
        lead: "Even though dark matter doesn't emit or reflect any light, Albert Einstein showed that all mass bends space! Light passing near a heavy invisible clump follows curved spacetime like a cosmic magnifying lens.",
        keyIdea:
          "Gravitational lenses bend and distort the light of distant galaxies behind them, allowing astronomers to directly map where unseen mass is hiding.",
        explanation:
          "When astronomers look at giant galaxy clusters with the Hubble and James Webb Space Telescopes, they see background galaxies stretched into arcs and rings. By measuring these warped light shapes, computers can reconstruct an exact 3D map of the mass that caused the bending—revealing that 85% of the cluster's mass is invisible dark matter!",
        activityPrompt:
          "Examine the Bullet Cluster map in the Landmark tab to see how dark matter separated cleanly from glowing gas.",
      },
      navigator: {
        lead: "The 'Bullet Cluster' (1E 0657-56) provides the most definitive empirical proof distinguishing dark matter particles from modified gravity theories like MOND.",
        keyIdea:
          "In a high-speed collision between two clusters, the stars passed through unimpeded, the gas collided and heated up in the center, but the gravitational lensing mass stayed with the collisionless dark matter on the outer flanks.",
        explanation:
          "Most normal baryonic matter in a galaxy cluster resides as hot X-ray gas, not stars. When two clusters collided, the gas clouds experienced fluid friction and drag, stalling in the collision zone. In contrast, gravitational lensing maps from Hubble proved that the dominant center of mass passed straight through without friction, centered on the collisionless galaxies. Modified gravity would expect the gravitational potential to center on the gas where the mass is; dark matter explains why the gravity centers on the collisionless halos.",
        activityPrompt:
          "Compare the X-ray baryonic emission overlay with the weak-lensing mass contours in the cluster view.",
      },
      astrophysicist: {
        lead: "Gravitational deflection of photons in general relativity is given by $\\hat{\\alpha} = \\frac{4GM}{c^2 b}$, exactly twice the Newtonian deflection angle. Weak and strong lensing permit non-parametric mass reconstruction via shear field mapping $\\gamma(\\theta)$.",
        keyIdea:
          "Weak lensing convergence $\\kappa(\\theta) = \\frac{\\Sigma(\\theta)}{\\Sigma_{\\text{crit}}}$ provides an absolute measurement of projected surface mass density $\\Sigma$, independent of mass-to-light ratio or dynamical equilibrium assumptions.",
        explanation:
          "The Bullet Cluster constrains the dark matter self-interaction cross-section to $\\sigma_{\\text{DM}} / m_{\\text{DM}} < 1.25\\text{ cm}^2/\\text{g}$ ($< 2\\times 10^{-24}\\text{ cm}^2/\\text{GeV}$). If dark matter particles interacted with each other via anything stronger than gravitational or sub-weak forces, the dark matter halos would have been decelerated and stripped during the collision just like the baryonic intracluster gas.",
        mathematics:
          "\\theta_E = \\sqrt{\\frac{4GM}{c^2} \\frac{D_{ls}}{D_l D_s}}, \\quad \\Sigma_{\\text{crit}} = \\frac{c^2}{4\\pi G} \\frac{D_s}{D_l D_{ls}}",
        activityPrompt:
          "Review the Bullet Cluster collision timeline and self-interaction limits in the Cosmic Landmarks section.",
      },
    },
  },
  {
    id: "sub-16-4-galaxy-clusters-mass",
    order: 4,
    title: "Galaxy Clusters & Fritz Zwicky",
    subtitle: "The 1933 discovery of missing mass via the Virial Theorem",
    readTimeMinutes: 3,
    content: {
      explorer: {
        lead: "Long before Vera Rubin studied spiral galaxies, a brilliant and eccentric Swiss astronomer named Fritz Zwicky was looking at the giant Coma Cluster of galaxies in 1933. He noticed something that made no sense!",
        keyIdea:
          "The galaxies in the Coma Cluster were zooming around so fast that they should have flown apart millions of years ago, unless held by unseen 'dunkle Materie' (dark matter).",
        explanation:
          "Zwicky measured the velocities of individual galaxies orbiting inside the Coma Cluster. Using physics principles, he calculated how much mass was needed to keep them bound by gravity. The answer was astonishing: the cluster needed over 100 times more mass than all the visible stars combined! He coined the German term 'dunkle Materie', becoming the first person to propose dark matter.",
        activityPrompt:
          "In the Virial Mass calculator, test how galaxy velocities determine the total gravitational binding mass.",
      },
      navigator: {
        lead: "Zwicky applied the Virial Theorem to the Coma Cluster: for a gravitationally bound, virialized system in equilibrium, the time-averaged kinetic energy $2\\langle K \\rangle$ plus potential energy $\\langle U \\rangle$ equals zero: $2K + U = 0$.",
        keyIdea:
          "Because kinetic energy depends on galaxy velocity dispersion ($K = \\frac{1}{2} M \\langle v^2 \\rangle$), measuring velocities reveals the total gravitational mass $M_{\\text{virial}} \\approx \\frac{R \\sigma_v^2}{G}$.",
        explanation:
          "Zwicky measured a line-of-sight velocity dispersion $\\sigma_v \\approx 1000\\text{ km/s}$ across a cluster radius of about $2\\text{ Mpc}$. The resulting virial mass was approximately $10^{15}\\,M_\\odot$. Dividing this by the optical light of all the member galaxies yielded a mass-to-light ratio exceeding 200! Although his early distance estimates were later refined, his core discovery was completely validated.",
        activityPrompt:
          "Compare the luminous stellar mass of the Coma Cluster with its virial mass in the Cluster comparison card.",
      },
      astrophysicist: {
        lead: "Modern cluster mass determinations synthesize three independent observational probes: galaxy kinematics (virial theorem), X-ray hydrostatic equilibrium of the intracluster medium (ICM), and gravitational lensing.",
        keyIdea:
          "All three independent methods agree: baryonic gas constitutes 12–15% of cluster mass, stars comprise 1–2%, and non-baryonic dark matter constitutes 83–86%.",
        explanation:
          "Assuming spherical hydrostatic equilibrium for the hot ($10^7\\text{–}10^8\\text{ K}$) ICM gas: $\\frac{dP}{dr} = -\\frac{G M(r) \\rho_{\\text{gas}}(r)}{r^2}$. Measuring the radial gas density $\\rho_{\\text{gas}}(r)$ from X-ray surface brightness and the temperature profile $T(r)$ from X-ray spectroscopy (via Chandra and XMM-Newton) yields the total enclosed gravitating mass $M(r) = -\\frac{k_B T(r) r}{G \\mu m_p} \\left[ \\frac{d\\ln \\rho}{d\\ln r} + \\frac{d\\ln T}{d\\ln r} \\right]$.",
        mathematics:
          "2\\langle K \\rangle + \\langle U \\rangle = 0 \\implies M_{\\text{dyn}} = \\frac{3 \\sigma_r^2 R_{\\text{vir}}}{G}",
        activityPrompt:
          "Verify the consistency between X-ray hydrostatic mass and weak lensing mass in the Cluster physics panel.",
      },
    },
  },
  {
    id: "sub-16-5-what-dark-matter-means",
    order: 5,
    title: "What Scientists Mean by 'Dark Matter'",
    subtitle: "Separating proven particle properties from popular myths",
    readTimeMinutes: 3,
    content: {
      explorer: {
        lead: "The word 'dark' sounds scary or mysterious, but to a physicist it just means 'transparent'! Dark matter does not glow, absorb, reflect, or block light at any wavelength.",
        keyIdea:
          "Dark matter is not black holes or dark clouds—it is most likely an undiscovered subatomic particle passing straight through Earth and your body right now!",
        explanation:
          "If a beam of light hits ordinary matter, the light reflects or gets absorbed. But light passes straight through dark matter without touching it. In fact, trillions of dark matter particles might be drifting through your room every second, completely harmless because they only interact through gravity and don't touch normal atoms.",
        activityPrompt:
          "Play the Cosmic Mythbuster Challenge to test your knowledge on what dark matter is and isn't.",
      },
      navigator: {
        lead: "Astronomers classify candidate dark matter models by their thermal velocities in the early universe: Cold Dark Matter (CDM), Warm Dark Matter (WDM), and Hot Dark Matter (HDM).",
        keyIdea:
          "Cold Dark Matter (slow-moving, non-relativistic particles) is required to reproduce the observed hierarchical 'bottom-up' structure formation of the universe.",
        explanation:
          "Hot Dark Matter (such as light neutrinos moving near light speed) would have smoothed out primordial density fluctuations through 'free streaming', erasing small structures and predicting that giant superclusters formed before individual galaxies. Because we observe small galaxies forming first at high redshift ($z > 10$), the dominant dark matter must be Cold (CDM). Leading particle candidates include WIMPs (Weakly Interacting Massive Particles) and ultralight Axions.",
        activityPrompt:
          "Examine the CDM vs WDM structure comparison in the Particle Candidate Matrix.",
      },
      astrophysicist: {
        lead: "The standard cosmological paradigm is $\\Lambda$CDM. The relic abundance of dark matter is explained naturally by thermal freeze-out in the early universe, often termed the 'WIMP miracle'.",
        keyIdea:
          "A particle with electroweak-scale mass ($m_\\chi \\sim 100\\text{ GeV}$) and weak interaction cross-section ($\\\\langle \\sigma v \\rangle \\sim 3 \\times 10^{-26}\\text{ cm}^3/\\text{s}$) naturally yields $\\Omega_c h^2 \\approx 0.12$.",
        explanation:
          "Despite decades of direct detection searches (e.g., LZ, XENONnT) and indirect searches (Fermi-LAT gamma-ray annihilation), standard WIMP parameter space is increasingly constrained. Alternative candidates gaining prominence include QCD axions ($m_a \\sim 10^{-6}\\text{–}10^{-3}\\text{ eV}$, detectable via microwave resonant cavities like ADMX), sterile neutrinos ($m_s \\sim \\text{keV}$), and primordial black holes (PBHs) in specific asteroid-mass windows.",
        mathematics:
          "\\Omega_\\chi h^2 \\approx \\frac{3 \\times 10^{-27}\\text{ cm}^3\\text{s}^{-1}}{\\langle \\sigma_{\\text{ann}} v \\rangle} \\approx 0.12",
        activityPrompt:
          "Check the direct detection exclusion limits plot in the Advanced Physics section.",
      },
    },
  },
  {
    id: "sub-16-6-measuring-expansion",
    order: 6,
    title: "How Cosmic Expansion is Measured",
    subtitle: "Hubble, redshifts, and Type Ia standard candles",
    readTimeMinutes: 4,
    content: {
      explorer: {
        lead: "In 1929, Edwin Hubble discovered that almost all distant galaxies are moving away from us. Even more surprising: galaxies twice as far away are receding twice as fast!",
        keyIdea:
          "The universe is not expanding into empty space; space itself is stretching, carrying galaxies along with it like raisins in rising bread.",
        explanation:
          "As light travels through expanding space over billions of years, its waves get stretched into longer, redder wavelengths. Astronomers call this 'cosmological redshift.' By measuring how much the light is stretched, we can tell how much space has expanded since that light left the galaxy.",
        activityPrompt:
          "In Lab B, scrub the Cosmic Timeline slider to see the cosmic grid stretch and galaxies move apart.",
      },
      navigator: {
        lead: "To determine if the cosmic expansion has been speeding up or slowing down over time, astronomers needed two measurements for very distant galaxies: their redshift ($z$) and their true physical distance ($d$).",
        keyIdea:
          "Type Ia supernovae act as 'standard candles' because their peak intrinsic luminosity is remarkably uniform across the universe.",
        explanation:
          "A Type Ia supernova occurs when a carbon-oxygen white dwarf accretes matter from a companion until it reaches the Chandrasekhar limit ($1.44\\,M_\\odot$) and explodes in a runaway thermonuclear detonation. Because the exploding mass is always the same, their peak brightness is consistent ($M_B \\approx -19.3$). By comparing how bright they look to how bright they actually are, astronomers calculate exact distances out to billions of light-years.",
        activityPrompt:
          "View the Hubble Diagram of Type Ia Supernovae in Lab B to see why distant supernovae appeared dimmer than expected.",
      },
      astrophysicist: {
        lead: "Cosmological redshift is related directly to the cosmic scale factor $a(t)$ at the moment of emission: $1 + z = \\frac{a(t_0)}{a(t_{\\text{emit}})} = \\frac{1}{a}$. Luminosity distance is defined as $d_L = \\sqrt{\\frac{L}{4\\pi F}} = (1 + z) \\frac{c}{H_0} \\int_0^z \\frac{dz'}{E(z')}$.",
        keyIdea:
          "The dimensionless expansion rate $E(z) = \\sqrt{\\Omega_m (1+z)^3 + \\Omega_r (1+z)^4 + \\Omega_k (1+z)^2 + \\Omega_\\Lambda}$ depends directly on the cosmic energy components.",
        explanation:
          "By fitting the distance modulus $\\mu(z) = m - M = 5\\log_{10}(d_L / 10\\text{ pc})$ across hundreds of high-redshift supernovae, cosmologists can map the expansion history $a(t)$ backward across billions of years and directly determine the cosmological parameters $\\Omega_m$ and $\\Omega_\\Lambda$.",
        mathematics:
          "\\mu(z) = 5 \\log_{10} \\left[ (1+z) \\int_0^z \\frac{c\\,dz'}{H_0 \\sqrt{\\Omega_m(1+z')^3 + \\Omega_\\Lambda}} \\right] + 25",
        activityPrompt:
          "Adjust $\\Omega_m$ and $\\Omega_\\Lambda$ in Lab B to observe the theoretical curves fit against the Supernova Cosmology Project data.",
      },
    },
  },
  {
    id: "sub-16-7-accelerated-expansion",
    order: 7,
    title: "Evidence for Accelerated Expansion",
    subtitle: "The 1998 Nobel Prize breakthrough that stunned physics",
    readTimeMinutes: 4,
    content: {
      explorer: {
        lead: "For decades, every scientist on Earth assumed that gravity would gradually slow down the expansion of the universe, just like a ball thrown upward slows down. But in 1998, two teams discovered the exact opposite!",
        keyIdea:
          "Instead of slowing down, the expansion of our universe is accelerating—speeding up faster and faster every second!",
        explanation:
          "Two competing teams of astronomers—the High-Z Supernova Search Team (led by Brian Schmidt and Adam Riess) and the Supernova Cosmology Project (led by Saul Perlmutter)—looked at distant exploding stars. To their astonishment, the supernovae were about 25% dimmer than predicted. They were farther away than possible in a decelerating universe, proving that cosmic expansion shifted into high gear roughly 5 billion years ago!",
        activityPrompt:
          "In Lab B, compare the decelerating Matter-Only model with the accelerating Dark Energy model.",
      },
      navigator: {
        lead: "The deceleration parameter $q = -\\frac{\\ddot{a} a}{\\dot{a}^2}$ quantifies whether expansion accelerates ($q < 0$) or decelerates ($q > 0$). In the standard Friedmann acceleration equation, ordinary matter produces deceleration, requiring a negative pressure component for acceleration.",
        keyIdea:
          "The 1998 supernova discoveries revealed $q_0 \\approx -0.55$, proving that cosmic expansion has been accelerating for the past $\\sim 5$ billion years.",
        explanation:
          "In General Relativity, pressure contributes to gravity: gravitational acceleration is driven by $\\rho + 3p/c^2$. Ordinary matter and radiation have positive pressure, creating attractive gravity that slows expansion. But if a mysterious energy has large negative pressure ($p < -\\frac{1}{3}\\rho c^2$), the term $\\rho + 3p/c^2$ becomes negative, generating a repulsive gravitational effect that accelerates cosmic expansion!",
        activityPrompt:
          "Switch between positive and negative pressure scenarios in Lab B to observe cosmic acceleration.",
      },
      astrophysicist: {
        lead: "The second Friedmann equation governs cosmic acceleration: $\\frac{\\ddot{a}}{a} = -\\frac{4\\pi G}{3}\\left(\\rho + \\frac{3p}{c^2}\\right) + \\frac{\\Lambda c^2}{3}$. For a fluid with equation of state $w = p/(\\rho c^2)$, acceleration requires $w < -1/3$.",
        keyIdea:
          "Cosmological measurements from Supernovae, CMB acoustic peaks (Planck), and Baryon Acoustic Oscillations (BAO) converge on $w = -1.028 \\pm 0.031$, remarkably consistent with a pure Cosmological Constant ($w = -1$).",
        explanation:
          "The cosmic transition from deceleration to acceleration occurred at redshift $z_{\\text{trans}} = \\left(\\frac{2\\Omega_\\Lambda}{\\Omega_m}\\right)^{1/3} - 1 \\approx 0.67$, corresponding to a lookback time of approximately 6.5 billion years ago. Before this epoch, matter density dominated ($\\rho_m \\propto a^{-3}$); as the universe expanded, matter diluted, allowing the constant dark energy density $\\rho_\\Lambda$ to take over.",
        mathematics:
          "\\ddot{a} > 0 \\iff w < -\\frac{1}{3}; \\quad z_{\\text{trans}} = \\left(\\frac{2\\Omega_\\Lambda}{\\Omega_m}\\right)^{1/3} - 1 \\approx 0.67",
        activityPrompt:
          "Identify the inflection point on the $a(t)$ scale factor curve in Lab B where the curve bends upward.",
      },
    },
  },
  {
    id: "sub-16-8-what-dark-energy-means",
    order: 8,
    title: "What Dark Energy Means in Modern Cosmology",
    subtitle: "The cosmological constant, vacuum energy, and the ultimate fate",
    readTimeMinutes: 3,
    content: {
      explorer: {
        lead: "Dark matter and dark energy sound similar, but they are complete opposites! Dark matter pulls things together with gravity, while dark energy stretches empty space apart.",
        keyIdea:
          "Dark energy is not a particle or a cloud—it is an invisible repulsive energy woven into the fabric of space itself.",
        explanation:
          "As the universe expands, matter gets diluted and spreads out thinner and thinner. But dark energy does not dilute! As space expands, more space is created, meaning the total amount of dark energy keeps growing. That is why dark energy now rules the universe, pushing distant galaxy clusters away from each other faster than ever.",
        activityPrompt:
          "Inspect the comparison table in Lab C highlighting the 5 key differences between Dark Matter and Dark Energy.",
      },
      navigator: {
        lead: "The simplest mathematical explanation for dark energy is Albert Einstein's 'Cosmological Constant' (denoted by the Greek letter $\\Lambda$, Lambda), which represents the inherent energy density of empty space.",
        keyIdea:
          "Quantum field theory predicts that even empty vacuum bubbles with virtual particle-antiparticle pairs, creating a non-zero vacuum energy density $\\rho_{\\text{vac}}$.",
        explanation:
          "In 1917, Einstein added $\\Lambda$ to his equations to hold the universe static against gravitational collapse. When Hubble discovered expansion, Einstein famously abandoned it. But in 1998, physicists realized $\\Lambda$ was real! However, there is a giant crisis: theoretical calculations of vacuum energy from quantum field theory are $10^{120}$ times larger than the observed value—the worst prediction in the history of physics!",
        activityPrompt:
          "Explore the 'Cosmological Constant Problem' in the open questions interactive chamber.",
      },
      astrophysicist: {
        lead: "In the stress-energy tensor $T_{\\mu\\nu}$, the cosmological constant manifests as an isotropic fluid with $T_{\\mu\\nu}^{\\Lambda} = -\\rho_\\Lambda g_{\\mu\\nu}$, yielding an equation of state parameter $w = \\frac{p_\\Lambda}{\\rho_\\Lambda c^2} \\equiv -1$.",
        keyIdea:
          "A constant vacuum energy density leads asymptotically to a de Sitter universe with exponential scale factor expansion: $a(t) \\propto e^{H_\\Lambda t}$, where $H_\\Lambda = \\sqrt{\\Lambda c^2 / 3}$.",
        explanation:
          "Under pure $\\Lambda$, the universe will enter an exponential freeze: within 100 billion years, all galaxies outside the gravitationally bound Local Group will cross our cosmological event horizon and become permanently unobservable. The temperature of the Cosmic Microwave Background will drop toward absolute zero, and cosmic structure formation will permanently cease.",
        mathematics:
          "\\rho_\\Lambda = \\frac{\\Lambda c^2}{8\\pi G} \\approx 5.96 \\times 10^{-27}\\text{ kg/m}^3 \\approx 3.35\\text{ GeV}/\\text{m}^3",
        activityPrompt:
          "Project the future cosmic scale factor out to 50 billion years in Lab B to see the exponential runaway expansion.",
      },
    },
  },
  {
    id: "sub-16-9-open-questions",
    order: 9,
    title: "Open Questions & Competing Models",
    subtitle: "What we know for certain vs what remains a cosmic mystery",
    readTimeMinutes: 4,
    content: {
      explorer: {
        lead: "Scientists are totally honest: we know dark matter and dark energy exist because of what they do, but we still don't know what they are made of! That makes them the most exciting mysteries in all of science.",
        keyIdea:
          "Whoever solves the true nature of dark matter and dark energy will almost certainly win the Nobel Prize in Physics.",
        explanation:
          "Could dark matter be a brand new family of particles? Could dark energy be a dynamic changing field called 'quintessence'? Or could our understanding of gravity need an upgrade at cosmic scales? Space telescopes like Euclid, the Roman Space Telescope, and the Vera C. Rubin Observatory in Chile are scanning the sky right now to find out!",
        activityPrompt:
          "Take the Knowledge Check quiz to earn your Dark Sector Cosmologist certificate!",
      },
      navigator: {
        lead: "Alternative hypotheses attempt to explain rotation curves without dark matter by modifying Newton's law of gravitation at tiny accelerations: Modified Newtonian Dynamics (MOND).",
        keyIdea:
          "While MOND can successfully fit many individual galaxy rotation curves without free parameters, it struggles to explain the Cosmic Microwave Background acoustic peaks and the Bullet Cluster offset.",
        explanation:
          "Proposed by Mordehai Milgrom in 1983, MOND posits that when gravitational acceleration drops below $a_0 \\approx 1.2 \\times 10^{-10}\\text{ m/s}^2$, the effective force scales as $\\sqrt{G M a_0}/r$ rather than $G M/r^2$. Relativistic extensions (like TeVeS) exist, but Cold Dark Matter remains the standard model because it simultaneously explains galaxy dynamics, cluster lensing, galaxy cluster mergers, large-scale filament structure, and the precision CMB angular power spectrum.",
        activityPrompt:
          "Review the head-to-head comparison between Particle Dark Matter and Modified Gravity.",
      },
      astrophysicist: {
        lead: "The modern cosmological frontier is defined by observational tensions, most notably the $5\\sigma$ 'Hubble Tension' between early-universe probes (Planck CMB: $H_0 = 67.4 \\pm 0.5\\text{ km/s/Mpc}$) and late-universe probes (SH0ES Supernovae: $H_0 = 73.04 \\pm 1.04\\text{ km/s/Mpc}$).",
        keyIdea:
          "Resolving the Hubble Tension and the $S_8$ cluster amplitude tension may require Early Dark Energy (EDE), decaying dark matter, or dynamical quintessence ($w(a) = w_0 + w_a(1-a)$).",
        explanation:
          "If the equation of state is dynamical ($w \\ne -1$), dark energy could dilute over time or become phantom ($w < -1$), which would lead to a catastrophic 'Big Rip' singularity in the distant future. The Dark Energy Spectroscopic Instrument (DESI) Year 1 results show intriguing preliminary hints of dynamical dark energy ($w_0 > -1, w_a < 0$), marking the vanguard of 21st-century cosmology.",
        mathematics:
          "w(z) = w_0 + w_a \\frac{z}{1+z}; \\quad H(z)^2 = H_0^2 [\\Omega_m(1+z)^3 + \\Omega_{\\text{DE}}(1+z)^{3(1+w_0+w_a)} e^{-3w_a z/(1+z)}]",
        activityPrompt:
          "Test dynamical dark energy parameter variations ($w_0, w_a$) in the Advanced Cosmology Playground.",
      },
    },
  },
];

// Typical spiral galaxy measured rotation curve data (based on NGC 3198 / Milky Way synthesis)
export interface RotationDataPoint {
  radiusKpc: number;
  vObs: number;
  vError: number;
  vVisible: number; // Gas + Disk + Bulge Newtonian prediction
}

export const GALAXY_ROTATION_DATA: RotationDataPoint[] = [
  { radiusKpc: 1.0, vObs: 145, vError: 8, vVisible: 140 },
  { radiusKpc: 2.5, vObs: 198, vError: 7, vVisible: 185 },
  { radiusKpc: 4.0, vObs: 215, vError: 6, vVisible: 195 },
  { radiusKpc: 6.0, vObs: 220, vError: 6, vVisible: 180 },
  { radiusKpc: 8.5, vObs: 222, vError: 5, vVisible: 165 }, // Solar radius in Milky Way
  { radiusKpc: 12.0, vObs: 221, vError: 6, vVisible: 140 },
  { radiusKpc: 16.0, vObs: 220, vError: 7, vVisible: 122 },
  { radiusKpc: 20.0, vObs: 218, vError: 8, vVisible: 108 },
  { radiusKpc: 25.0, vObs: 216, vError: 9, vVisible: 96 },
  { radiusKpc: 30.0, vObs: 215, vError: 11, vVisible: 87 },
];

export interface CosmologicalModel {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  omegaM: number;
  omegaLambda: number;
  w: number;
  color: string;
  fate: "Accelerating Freeze" | "Decelerating Expansion" | "Big Crunch" | "Big Rip" | "Coasting";
}

export const COSMOLOGICAL_MODELS: CosmologicalModel[] = [
  {
    id: "lcdm",
    name: "Standard Flat ΛCDM (Our Real Universe)",
    shortLabel: "ΛCDM (Real Universe)",
    description:
      "68.5% Dark Energy, 31.5% Matter. Decelerated for its first ~8.5 Gyr, then accelerated permanently.",
    omegaM: 0.315,
    omegaLambda: 0.685,
    w: -1.0,
    color: "#818cf8", // Indigo
    fate: "Accelerating Freeze",
  },
  {
    id: "matter_only",
    name: "Einstein-de Sitter (Matter-Only Universe)",
    shortLabel: "Matter-Only (Ωm=1, ΩΛ=0)",
    description:
      "100% Matter, 0% Dark Energy. Gravity continuously decelerates expansion forever without ever reversing.",
    omegaM: 1.0,
    omegaLambda: 0.0,
    w: 0.0,
    color: "#fbbf24", // Amber
    fate: "Decelerating Expansion",
  },
  {
    id: "closed_crunch",
    name: "High-Density Recollapsing (Closed Universe)",
    shortLabel: "Recollapsing (Big Crunch)",
    description:
      "Heavy matter density halts expansion; gravity reverses direction and crushes the cosmos back to a singularity.",
    omegaM: 2.0,
    omegaLambda: 0.0,
    w: 0.0,
    color: "#f87171", // Red
    fate: "Big Crunch",
  },
  {
    id: "empty_coasting",
    name: "Milne Empty Universe (Coasting)",
    shortLabel: "Empty Coasting (Ωm=0, ΩΛ=0)",
    description:
      "Zero gravity and zero dark energy. Space expands at a constant linear speed (a ∝ t).",
    omegaM: 0.0,
    omegaLambda: 0.0,
    w: 0.0,
    color: "#34d399", // Emerald
    fate: "Coasting",
  },
  {
    id: "phantom_rip",
    name: "Phantom Dark Energy (Runaway Expansion)",
    shortLabel: "Phantom Energy (Big Rip)",
    description:
      "Dark energy density increases over time (w = -1.2), eventually tearing apart galaxies, stars, planets, and atoms.",
    omegaM: 0.3,
    omegaLambda: 0.7,
    w: -1.2,
    color: "#e879f9", // Fuchsia
    fate: "Big Rip",
  },
];

export interface DarkSectorMyth {
  id: string;
  claim: string;
  isFact: boolean;
  verdict: "Scientific Fact" | "Cosmic Myth";
  explanation: string;
  evidence: string;
}

export const DARK_SECTOR_MYTHS: DarkSectorMyth[] = [
  {
    id: "myth-1-same-stuff",
    claim: "Dark Matter and Dark Energy are two names for the same invisible substance.",
    isFact: false,
    verdict: "Cosmic Myth",
    explanation:
      "Dark matter and dark energy are polar opposites! Dark matter has attractive gravity that pulls galaxies and clusters together. Dark energy is an repulsive property of space that drives the accelerated expansion of the entire universe.",
    evidence:
      "Dark matter clumps into halos and filaments; dark energy is completely homogeneous and smooth everywhere in the cosmos.",
  },
  {
    id: "myth-2-black-holes",
    claim: "Dark matter is just a huge swarm of undiscovered black holes and rogue planets.",
    isFact: false,
    verdict: "Cosmic Myth",
    explanation:
      "Astronomical surveys (such as MACHO and OGLE) used gravitational microlensing to search for rogue black holes and planets. They found that massive compact halo objects can account for at most a tiny fraction (< 1%) of the dark halo mass. Furthermore, Big Bang Nucleosynthesis strictly limits total baryonic matter to ~5%.",
    evidence:
      "The primordial abundance of deuterium and helium-3 proves that 84% of all mass in the cosmos is non-baryonic (not made of atoms).",
  },
  {
    id: "myth-3-rubin-rotation",
    claim:
      "Stars at the outer edge of spiral galaxies orbit just as fast as stars near the center.",
    isFact: true,
    verdict: "Scientific Fact",
    explanation:
      "Vera Rubin and Kent Ford's spectroscopic measurements confirmed that rotation curves are 'flat' out to dozens of kiloparsecs, directly proving the presence of an unseen extended mass distribution.",
    evidence:
      "Over 1,000 spiral galaxies observed over 50 years exhibit flat or rising rotation curves far beyond their optical disks.",
  },
  {
    id: "myth-4-pushing-wind",
    claim: "Dark energy pushes on galaxies like a physical wind or outward blast.",
    isFact: false,
    verdict: "Cosmic Myth",
    explanation:
      "Dark energy does not exert a directional force or wind. It is an intrinsic energy density of space that stretches the metric distance between gravitationally unbound objects over gigaparsec distances.",
    evidence:
      "Locally bound systems (atoms, planets, the Solar System, and the Milky Way) do not expand at all because their local electromagnetic and gravitational binding forces vastly exceed dark energy.",
  },
  {
    id: "myth-5-bullet-cluster",
    claim:
      "In colliding galaxy clusters, the dark matter passes straight through without colliding.",
    isFact: true,
    verdict: "Scientific Fact",
    explanation:
      "In the famous 'Bullet Cluster' collision, the hot baryonic gas collided and suffered drag, while gravitational lensing maps proved the dominant mass followed the collisionless galaxies right through.",
    evidence:
      "Chandra X-ray satellite images and Hubble weak lensing maps show a clear 8-sigma spatial separation between the baryonic gas and the gravitational mass center.",
  },
  {
    id: "myth-6-invented-excuse",
    claim:
      "Dark matter was invented by physicists as an excuse because Einstein's equations failed.",
    isFact: false,
    verdict: "Cosmic Myth",
    explanation:
      "Dark matter is supported by multiple completely independent lines of empirical evidence: galaxy rotation curves, cluster velocity dispersions, gravitational lensing, the Cosmic Microwave Background acoustic peak ratios, and cosmological structure formation simulations.",
    evidence:
      "Modifying gravity (like MOND) can tune rotation curves, but fails to explain the relative heights of the CMB acoustic peaks or the Bullet Cluster offset without invoking extra unseen particles.",
  },
];

export const MODULE_16_QUIZ: KnowledgeCheckQuestion[] = [
  {
    id: "q1",
    question:
      "What did Vera Rubin discover when measuring the orbital velocities of stars and gas in spiral galaxies?",
    options: [
      "Outer stars orbit much slower than inner stars, exactly as predicted by Kepler's laws",
      "Outer stars orbit just as fast as inner stars, forming a flat rotation curve",
      "Stars near the galactic center are ejected at relativistic velocities",
      "Galaxies are collapsing rapidly toward their supermassive black holes",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Rubin discovered that instead of exhibiting a Keplerian decline ($v \\propto r^{-1/2}$), galaxy rotation curves remain remarkably flat out to the observable edge, demonstrating that galaxies are embedded in massive dark matter halos.",
  },
  {
    id: "q2",
    question:
      "How did the 'Bullet Cluster' provide compelling observational proof of particle dark matter?",
    options: [
      "It showed dark matter emitting bright gamma-ray laser bursts",
      "The dark matter was crushed into a giant central black hole",
      "Gravitational lensing revealed the majority of the mass separated cleanly from the hot collided gas",
      "It proved that Newton's gravitational constant G changes with cosmic time",
    ],
    correctAnswerIndex: 2,
    explanation:
      "In the cluster collision, the normal baryonic gas (observed in X-rays) was slowed down by hydrodynamic drag. However, gravitational lensing showed that the mass passed straight through with the collisionless galaxies, proving mass was not concentrated where the gas was.",
  },
  {
    id: "q3",
    question:
      "What type of celestial object served as the 'standard candle' that revealed the accelerating expansion of the universe in 1998?",
    options: [
      "Cepheid variable stars in the Andromeda Galaxy",
      "Type Ia supernovae from exploding white dwarfs",
      "Gamma-ray bursts from hypernovae",
      "Pulsar radio beacons in globular clusters",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Type Ia supernovae have a consistent peak luminosity because they trigger near the Chandrasekhar mass limit. Measuring their apparent brightness versus redshift revealed that distant supernovae were fainter than expected in a decelerating universe, proving acceleration.",
  },
  {
    id: "q4",
    question:
      "What is the fundamental physical difference between Dark Matter and Dark Energy in modern cosmology?",
    options: [
      "Dark matter attracts and clumps gravitationally; dark energy causes repulsive cosmic metric expansion",
      "Dark matter is made of antimatter; dark energy is made of pure light",
      "Dark matter exists only inside black holes; dark energy exists only outside the observable universe",
      "They are identical substances operating at different temperatures",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Dark matter is an attractive, clustering gravitating component that accounts for ~26.8% of cosmic energy and holds structures together. Dark energy is a smooth negative-pressure component (~68.3%) that accelerates the metric expansion of space.",
  },
  {
    id: "q5",
    question:
      "According to the Planck satellite 2018 cosmic energy inventory, approximately what percentage of the universe is composed of normal baryonic matter (atoms)?",
    options: ["About 95%", "About 50%", "About 27%", "About 4.9%"],
    correctAnswerIndex: 3,
    explanation:
      "Normal baryonic matter—everything made of protons, neutrons, and electrons including all stars, planets, and living beings—constitutes only about 4.9% of the total cosmic energy budget. Dark matter makes up ~26.8%, and dark energy accounts for ~68.3%.",
  },
];

export const MODULE_16_DISCOVERY_FACTS = [
  {
    title: "Vera Rubin's Perseverance",
    detail:
      "Vera Rubin's seminal 1970 paper with Kent Ford analyzed 21 spiral galaxies. Facing early skepticism, she methodically documented flat rotation curves across dozens more galaxies until the astrophysical community recognized dark matter as undeniable.",
    year: "1970",
  },
  {
    title: "1998 Breakthrough of the Year",
    detail:
      "Science Magazine named the discovery of accelerating cosmic expansion the 'Breakthrough of the Year' in 1998. Saul Perlmutter, Brian Schmidt, and Adam Riess were awarded the 2011 Nobel Prize in Physics for this monumental finding.",
    year: "1998",
  },
  {
    title: "The Cosmological Constant Problem",
    detail:
      "If dark energy is quantum vacuum energy, standard quantum field theory predicts an energy density roughly 10¹²⁰ times greater than observed. Physicist Steven Weinberg called this 'the most bone-crushing mystery in modern fundamental physics.'",
    year: "Present",
  },
  {
    title: "Planck High-Precision Inventory",
    detail:
      "The European Space Agency's Planck mission mapped the Cosmic Microwave Background with sub-microkelvin precision, confirming that our universe is spatially flat (Ω_k = 0.0007 ± 0.0019) with 68.3% dark energy and 26.8% dark matter.",
    year: "2018",
  },
];

export const MODULE_16_SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    title: "Rubin & Ford (1970) Rotation of the Andromeda Nebula from a Spectroscopic Survey",
    organization: "Astrophysical Journal (ApJ 159, 379)",
    url: "https://ui.adsabs.harvard.edu/abs/1970ApJ...159..379R",
  },
  {
    title:
      "Perlmutter et al. (1999) Measurements of Omega and Lambda from 42 High-Redshift Supernovae",
    organization: "The Supernova Cosmology Project / Astrophysical Journal",
    url: "https://ui.adsabs.harvard.edu/abs/1999ApJ...517..565P",
  },
  {
    title:
      "Riess et al. (1998) Observational Evidence from Supernovae for an Accelerating Universe",
    organization: "High-Z Supernova Search Team / Astronomical Journal",
    url: "https://ui.adsabs.harvard.edu/abs/1998AJ....116.1009R",
  },
  {
    title:
      "Clowe et al. (2006) A Direct Empirical Proof of the Existence of Dark Matter (The Bullet Cluster)",
    organization: "Astrophysical Journal Letters (ApJL 648, L109)",
    url: "https://ui.adsabs.harvard.edu/abs/2006ApJ...648L.109C",
  },
  {
    title: "Planck Collaboration (2018) Planck 2018 Results. VI. Cosmological Parameters",
    organization: "Astronomy & Astrophysics (A&A 641, A6)",
    url: "https://www.aanda.org/articles/aa/full_html/2020/09/aa33880-18/aa33880-18.html",
  },
];
