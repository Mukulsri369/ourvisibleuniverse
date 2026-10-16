import type { SubLesson, QuizQuestion, ScientificSource } from "../types";

export interface GalaxyDataPoint {
  id: string;
  name: string;
  distanceMpc: number; // Proper distance today in Mpc
  distanceGly: number; // Distance in Billion Light-Years
  redshiftZ: number;
  recessionVelocityKmS: number; // km/s
  apparentMagnitude: number;
  type: "local_group" | "nearby_cluster" | "intermediate_cluster" | "high_z_galaxy" | "ultra_deep";
  isGravitationallyBound: boolean;
  notes: string;
}

export const REAL_GALAXY_DATASETS: GalaxyDataPoint[] = [
  {
    id: "andromeda",
    name: "Andromeda Galaxy (M31)",
    distanceMpc: 0.77,
    distanceGly: 0.0025,
    redshiftZ: -0.001,
    recessionVelocityKmS: -301, // Blueshifted! Moving towards Milky Way
    apparentMagnitude: 3.44,
    type: "local_group",
    isGravitationallyBound: true,
    notes:
      "Gravitationally bound to the Milky Way inside the Local Group. Negative velocity (blueshift) due to mutual gravitational pull, proving bound systems do not expand with the Hubble flow.",
  },
  {
    id: "triangulum",
    name: "Triangulum Galaxy (M33)",
    distanceMpc: 0.86,
    distanceGly: 0.0028,
    redshiftZ: -0.0006,
    recessionVelocityKmS: -179,
    apparentMagnitude: 5.72,
    type: "local_group",
    isGravitationallyBound: true,
    notes: "Bound member of the Local Group; orbital motion dominates over cosmic expansion.",
  },
  {
    id: "virgo_m87",
    name: "Virgo Cluster (Messier 87)",
    distanceMpc: 16.5,
    distanceGly: 0.054,
    redshiftZ: 0.0044,
    recessionVelocityKmS: 1307,
    apparentMagnitude: 9.59,
    type: "nearby_cluster",
    isGravitationallyBound: false,
    notes:
      "Unbound from Local Group; classic Hubble flow demonstrator with supermassive black hole imaged by the Event Horizon Telescope.",
  },
  {
    id: "fornax_cluster",
    name: "Fornax Cluster (NGC 1365)",
    distanceMpc: 19.0,
    distanceGly: 0.062,
    redshiftZ: 0.0055,
    recessionVelocityKmS: 1636,
    apparentMagnitude: 10.3,
    type: "nearby_cluster",
    isGravitationallyBound: false,
    notes:
      "Second richest galaxy cluster within 20 Mpc, confirming linear velocity-distance relation.",
  },
  {
    id: "coma_cluster",
    name: "Coma Cluster (NGC 4889)",
    distanceMpc: 99.0,
    distanceGly: 0.323,
    redshiftZ: 0.0231,
    recessionVelocityKmS: 6925,
    apparentMagnitude: 12.6,
    type: "intermediate_cluster",
    isGravitationallyBound: false,
    notes:
      "Dense cluster studied by Fritz Zwicky; recession velocity precisely matches v = H0 * d with H0 ≈ 70 km/s/Mpc.",
  },
  {
    id: "hercules_cluster",
    name: "Hercules Supercluster",
    distanceMpc: 153.0,
    distanceGly: 0.5,
    redshiftZ: 0.036,
    recessionVelocityKmS: 10800,
    apparentMagnitude: 14.1,
    type: "intermediate_cluster",
    isGravitationallyBound: false,
    notes:
      "Massive supercluster showing clean cosmic Hubble expansion free from local peculiar velocities.",
  },
  {
    id: "quasar_3c273",
    name: "Quasar 3C 273",
    distanceMpc: 749.0,
    distanceGly: 2.44,
    redshiftZ: 0.158,
    recessionVelocityKmS: 47400,
    apparentMagnitude: 12.9,
    type: "high_z_galaxy",
    isGravitationallyBound: false,
    notes:
      "First identified quasar (Maarten Schmidt, 1963). High cosmological redshift proved quasars lie at cosmological distances.",
  },
  {
    id: "cosmic_noon_galaxy",
    name: "COSMOS-AzTEC-1 (Cosmic Noon)",
    distanceMpc: 3950.0,
    distanceGly: 12.88,
    redshiftZ: 4.34,
    recessionVelocityKmS: 278000,
    apparentMagnitude: 23.5,
    type: "ultra_deep",
    isGravitationallyBound: false,
    notes:
      "Extreme starburst galaxy at high redshift where relativistic and cosmological expansion equations must be used instead of simple linear v = H0 * d.",
  },
  {
    id: "jwst_jades_z14",
    name: "JADES-GS-z14-0 (JWST Record)",
    distanceMpc: 10200.0,
    distanceGly: 33.2,
    redshiftZ: 14.32,
    recessionVelocityKmS: 298000,
    apparentMagnitude: 28.6,
    type: "ultra_deep",
    isGravitationallyBound: false,
    notes:
      "Observed by JWST at z = 14.32. Wavelengths of light emitted in the ultraviolet (Lyman-alpha) stretched by a factor of 15.32 into the infrared!",
  },
];

export const MODULE_18_SUBLESSONS: SubLesson[] = [
  {
    id: "m18-l1",
    number: 1,
    title: "What Does Cosmic Expansion Mean?",
    subtitle: "The metric expansion of space vs motion through space",
    content: {
      explorer: `
### What Is Expanding?

When astronomers say the universe is expanding, it is natural to imagine galaxies zooming like rocket ships through empty space.

**That is completely wrong!**

* **Galaxies are not flying through space; space itself is stretching between them.**
* Imagine baking a loaf of raisin bread. As the dough rises in the oven, the raisins move further apart from each other.
* The raisins aren't walking through the dough. The dough itself is growing everywhere!
* In our universe, space is the dough, and distant galaxies are the raisins.

Crucially: **There is no center to the expansion.** From the viewpoint of *any* raisin in the dough, all the other raisins appear to be moving away from it. If you lived in the Andromeda Galaxy, or a galaxy 10 billion light-years away, you would see the exact same thing we do!
      `,
      scholar: `
### Metric Expansion of Space

The foundational insight of modern physical cosmology is that **space is dynamical**, not a static Euclidean container.

Under Albert Einstein's General Relativity, the metric tensor $g_{\\mu\\nu}$ defines distances between spacetime coordinates:

$$ds^2 = -c^2 dt^2 + a^2(t) \\left[ dr^2 + r^2 d\\Omega^2 \\right]$$

Key Distinctions:
1. **Comoving Coordinates ($r$ or $\\chi$)**: Grid points that remain fixed for objects moving solely with the cosmic expansion flow.
2. **Proper Physical Distance ($d_{\\text{proper}}$)**: The instantaneous physical distance measured with a hypothetical giant ruler at cosmic time $t$:
   $$d_{\\text{proper}}(t) = a(t) \\cdot \\chi$$
3. **No External Medium**: Space is not expanding "into" pre-existing void. Spacetime constitutes the entire manifold of physical existence.
4. **No Center and No Edge**: Every comoving observer perceives all other comoving observers receding isotropically.
      `,
      astrophysicist: `
### FLRW Kinematics & Hubble Flow

In a spatially flat Friedmann-Lemaître-Robertson-Walker (FLRW) universe ($k=0$):

$$ds^2 = -c^2 dt^2 + a^2(t) \\delta_{ij} dx^i dx^j$$

Differentiating physical separation $r(t) = a(t) x$ with respect to proper cosmic time $t$:

$$\\dot{r}(t) = \\dot{a}(t) x + a(t) \\dot{x} = \\frac{\\dot{a}(t)}{a(t)} r(t) + v_{\\text{pec}} = H(t) r(t) + v_{\\text{pec}}$$

Here:
* $H(t) \\equiv \\frac{\\dot{a}}{a}$ is the time-dependent **Hubble expansion parameter**.
* $v_{\\text{rec}} = H(t) r(t)$ is the **recession velocity** generated entirely by the metric stretching of the spatial manifold.
* $v_{\\text{pec}} = a(t) \\dot{x}$ is the **peculiar velocity**, which represents genuine kinematic motion through local comoving space caused by local gravitational gradients (e.g., Virgo cluster infall).

Because recession velocity is the stretching rate of spacetime itself, it is **not bounded by the speed of light $c$** in special relativity. Objects beyond the Hubble distance $d_H = c/H_0 \\approx 4.4$ Gpc recede with $\\dot{r} > c$, consistent with General Relativity because no information propagates locally faster than $c$.
      `,
    },
    readingTimeMinutes: 4,
  },
  {
    id: "m18-l2",
    number: 2,
    title: "How Galaxy Distances Change",
    subtitle: "Comoving coordinates, proper distances, and the cosmic grid",
    content: {
      explorer: `
### The Cosmic Grid: Stretching Without Walking

Imagine drawing dots on a rubber balloon with a pen. You label dot A, dot B, and dot C.
* The distance between dot A and dot B is 2 inches.
* The distance between dot A and dot C is 4 inches.

Now, blow air into the balloon until its surface doubles in size:
* The distance between A and B becomes 4 inches (it grew by 2 inches).
* The distance between A and C becomes 8 inches (it grew by 4 inches!).

Notice something amazing: **Dot C moved away twice as fast as Dot B, simply because it was twice as far away to begin with!**

This simple geometry is why distant galaxies appear to recede faster than closer galaxies. The more space there is between two objects, the more space there is that expands every second!
      `,
      scholar: `
### Coordinate Separation vs Proper Separation

Astronomers separate the cosmic expansion into two distinct distance concepts:

1. **Comoving Distance ($\\chi$)**:
   The distance between two galaxies measured on a coordinate grid that expands along with the universe. Unless galaxies experience local gravitational pulls, their comoving coordinates do not change over time.
2. **Proper Physical Distance ($d(t)$)**:
   The physical distance between two objects at a specific cosmic moment $t$:
   $$d(t) = a(t) \\cdot \\chi$$

If the cosmic scale factor $a(t)$ doubles from $0.5$ to $1.0$:
* A galaxy with comoving distance $\\chi = 100$ Mpc moved from proper distance $50$ Mpc to $100$ Mpc.
* A galaxy with comoving distance $\\chi = 500$ Mpc moved from proper distance $250$ Mpc to $500$ Mpc.

The recession rate is strictly linear with proper distance:
$$\\Delta d = d(t_2) - d(t_1) = [a(t_2) - a(t_1)] \\cdot \\chi = \\frac{\\Delta a}{a} \\cdot d$$
      `,
      astrophysicist: `
### Metric Geodesics and Conformal Mapping

Under conformal time transformation $d\\eta \\equiv dt / a(t)$, the FLRW metric transforms conformally into Minkowski spacetime:

$$ds^2 = a^2(\\eta) \\left[ -c^2 d\\eta^2 + d\\chi^2 + S_k^2(\\chi) d\\Omega^2 \\right]$$

Null geodesics ($ds^2 = 0$) for radial light travel satisfy:
$$d\\chi = -c \\, d\\eta = -\\frac{c \\, dt}{a(t)}$$

Integrating from emission at cosmic time $t_e$ to observation today at $t_0$:
$$\\chi(z) = c \\int_{t_e}^{t_0} \\frac{dt}{a(t)} = c \\int_0^z \\frac{dz'}{H(z')}$$

This comoving distance $\\chi(z)$ forms the fundamental backbone for calculating all observational cosmological metrics:
* **Luminosity Distance**: $d_L(z) = (1+z) \\chi(z)$ (for standard candles like Type Ia supernovae)
* **Angular Diameter Distance**: $d_A(z) = \\frac{\\chi(z)}{1+z} = \\frac{d_L(z)}{(1+z)^2}$ (for standard rulers like the CMB acoustic peak and BAO)
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l3",
    number: 3,
    title: "The Hubble–Lemaître Relationship",
    subtitle: "From Georges Lemaître and Edwin Hubble to the modern Hubble Constant H₀",
    content: {
      explorer: `
### The Law of Cosmic Motion

In the late 1920s, Belgian astronomer-priest Georges Lemaître and American astronomer Edwin Hubble made one of the greatest discoveries in human history:

**Distant galaxies are moving away from us with speeds proportional to their distance!**

This is known as the **Hubble–Lemaître Law**:
$$\\text{Speed} = H_0 \\times \\text{Distance}$$

* $H_0$ is called the **Hubble Constant**.
* It tells us the current expansion rate of space.
* Today, astronomers measure $H_0 \\approx 70\\text{ km/s per Megaparsec}$.
* That means for every **1 Megaparsec** (about 3.26 million light-years) you look deeper into space, galaxies recede an extra **70 kilometers every second**!
      `,
      scholar: `
### Formulating the Hubble–Lemaître Law

The linear expansion law observed at low redshifts ($z \\ll 1$):

$$v = H_0 \\cdot d$$

Where:
* $v$ is the apparent recession velocity (measured via spectral line shift: $v \\approx c \\cdot z$).
* $d$ is the proper distance to the galaxy in Megaparsecs (Mpc).
* $H_0$ is the Hubble parameter today, with SI dimensions of inverse time:
  $$H_0 \\approx 70 \\text{ km s}^{-1} \\text{ Mpc}^{-1} \\approx 2.27 \\times 10^{-18} \\text{ s}^{-1}$$

**The Hubble Time**:
Taking the inverse of the Hubble constant gives a characteristic estimate of the cosmic expansion age:
$$t_H \\equiv \\frac{1}{H_0} = \\frac{1}{2.27 \\times 10^{-18} \\text{ s}^{-1}} \\approx 4.40 \\times 10^{17} \\text{ s} \\approx 14.0 \\text{ Billion Years}$$
This remarkably close approximation was the first mathematical clue to the 13.8-billion-year age of the universe!
      `,
      astrophysicist: `
### The Friedmann Equation and the Hubble Tension

The time evolution of the Hubble parameter $H(z)$ is governed by the First Friedmann Equation:

$$H^2(z) = H_0^2 \\left[ \\Omega_{r,0}(1+z)^4 + \\Omega_{m,0}(1+z)^3 + \\Omega_{k,0}(1+z)^2 + \\Omega_{\\Lambda,0} \\right]$$

In the concordant $\\Lambda$CDM model ($\\\\Omega_{m,0} \\approx 0.315$, $\\Omega_{\\Lambda,0} \\approx 0.685$, $\\Omega_{k,0} = 0$):
$$H(z) = H_0 \\sqrt{\\Omega_{m,0}(1+z)^3 + \\Omega_{\\Lambda,0}}$$

**The Modern Hubble Tension**:
A profound frontier in modern physics:
* **Early Universe (CMB / Planck 2018)**: Sound horizon calibration at recombination predicts $H_0 = 67.4 \\pm 0.5 \\text{ km s}^{-1} \\text{ Mpc}^{-1}$.
* **Late Universe (SH0ES / Cepheid-SN Ia distance ladder)**: Direct distance measurements yield $H_0 = 73.04 \\pm 1.04 \\text{ km s}^{-1} \\text{ Mpc}^{-1}$.
The statistical discrepancy exceeds $5\\sigma$, suggesting possible new physics beyond the Standard Model (e.g., early dark energy or neutrino interactions).
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l4",
    number: 4,
    title: "Cosmological Redshift",
    subtitle: "Stretching of light waves in transit vs the Doppler effect",
    content: {
      explorer: `
### Why Distant Light Turns Red

When we look at light from distant galaxies, their spectral absorption lines are shifted toward the red end of the spectrum.

Why does this happen?
* Imagine drawing a small wiggly wave on an unstretched rubber band.
* As you pull both ends of the rubber band, **the wave stretches out!** The distance between each wave crest gets longer.
* In physics, longer light waves mean **redder light**!

This is called **Cosmological Redshift ($z$)**.
* It is **not** a Doppler shift from a galaxy zooming through space like a speeding police car.
* The galaxy was practically sitting still in its own corner of space when it emitted the light!
* While the light spent billions of years traveling through space to reach our telescopes, **the space underneath the light beam stretched**, stretching the light wave along with it!
      `,
      scholar: `
### Cosmological Redshift vs Kinematic Doppler

Redshift is defined quantitatively by the fractional change in wavelength:

$$z \\equiv \\frac{\\lambda_{\\text{observed}} - \\lambda_{\\text{emitted}}}{\\lambda_{\\text{emitted}}} = \\frac{\\Delta \\lambda}{\\lambda}$$

**The Fundamental Metric Redshift Equation**:
Because light waves travel along null geodesics in FLRW spacetime, the observed wavelength is directly proportional to the cosmic scale factor $a(t)$:

$$1 + z = \\frac{\\lambda_{\\text{observed}}}{\\lambda_{\\text{emitted}}} = \\frac{a(t_{\\text{observed}})}{a(t_{\\text{emitted}})} = \\frac{1}{a(t_{\\text{emitted}})}$$

Crucial physical distinctions:
* **Cosmological Redshift**: Cumulative stretching of photon wavelength by expanding metric during propagation. Energy is lost from individual photons because $E = hc/\\lambda$.
* **Doppler Redshift**: Kinematic effect caused by relative velocity between source and observer at emission/detection in flat spacetime.
* **Gravitational Redshift**: Loss of photon energy as it climbs out of a static gravitational potential well $\\Delta \\Phi$.
      `,
      astrophysicist: `
### Relativistic Derivation & Photon Momentum Loss

Let an electromagnetic wave be described by null wavevector $k^\\mu = (\\omega/c, \\mathbf{k})$ with $k_\\mu k^\\mu = 0$.

In FLRW spacetime with metric $g_{\\mu\\nu} = \\text{diag}(-1, a^2, a^2, a^2)$, the geodesic equation for photons is:
$$\\frac{dk^\\mu}{d\\lambda} + \\Gamma^\\mu_{\\alpha\\beta} k^\\alpha k^\\beta = 0$$

For the temporal component $\\mu = 0$, the Christoffel symbol is $\\Gamma^0_{ij} = a \\dot{a} \\delta_{ij}$. Substituting:
$$\\frac{d\\omega}{dt} + \\frac{\\dot{a}}{a} \\omega = 0 \\implies \\frac{\\dot{\\omega}}{\\omega} = -\\frac{\\dot{a}}{a} \\implies \\omega(t) \\cdot a(t) = \\text{constant}$$

Since photon wavelength is $\\lambda = \\frac{2\\pi c}{\\omega}$:
$$\\lambda(t) \\propto a(t) \\implies \\frac{\\lambda(t_0)}{\\lambda(t_e)} = \\frac{a(t_0)}{a(t_e)} = 1 + z$$

Energy conservation: Photons do not conserve energy in an expanding universe because the metric is time-dependent (Noether's theorem requires continuous time translation symmetry for energy conservation; expanding spacetime breaks this symmetry).
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l5",
    number: 5,
    title: "The Scale Factor a(t)",
    subtitle: "The cosmic ruler normalized across time",
    content: {
      explorer: `
### The Cosmic Ruler: Scale Factor a(t)

To describe how big the universe is at any point in history, cosmologists use a single number called the **Scale Factor**, written as **$a(t)$**.

* By definition, **today's scale factor is $a = 1.0$**.
* When the universe was half its current size, **$a = 0.5$**.
* When the universe was one-tenth its current size, **$a = 0.1$**.
* In the distant future, when space doubles again, **$a = 2.0$**.

Whenever you see a galaxy at redshift $z = 1$, you know instantly that its light was emitted when space was:
$$a = \\frac{1}{1 + z} = \\frac{1}{1 + 1} = 0.5$$
Space was exactly half as big as it is today!
      `,
      scholar: `
### Mathematical Behavior of the Scale Factor

The scale factor $a(t)$ is dimensionless and relates proper physical separation $r(t)$ to fixed comoving coordinate separation $\\chi$:

$$r(t) = a(t) \\cdot \\chi, \\quad \\text{normalized to } a(t_0) = 1$$

Evolution through cosmic epochs:
1. **Radiation Dominated ($t < 50,000$ yr)**:
   Energy density $\\rho_r \\propto a^{-4}$. Solving Friedmann equation yields:
   $$a(t) \\propto t^{1/2}$$
2. **Matter Dominated ($50,000\\text{ yr} < t < 9\\text{ Gyr}$)**:
   Energy density $\\rho_m \\propto a^{-3}$. Solving Friedmann equation yields:
   $$a(t) \\propto t^{2/3}$$
3. **Dark Energy Dominated ($t > 9\\text{ Gyr}$)**:
   Energy density $\\rho_\\Lambda = \\text{const}$. Solving Friedmann equation yields exponential acceleration:
   $$a(t) \\propto \\exp(H_\\Lambda t), \\quad \\text{where } H_\\Lambda = H_0 \\sqrt{\\Omega_\\Lambda}$$
      `,
      astrophysicist: `
### Deceleration Parameter and Transition Redshift

The acceleration of the scale factor is characterized by the dimensionless deceleration parameter $q(t)$:

$$q(t) \\equiv -\\frac{\\ddot{a} a}{\\dot{a}^2} = -\\frac{\\ddot{a}}{a H^2}$$

From the Second Friedmann (Acceleration) Equation:
$$\\frac{\\ddot{a}}{a} = -\\frac{4\\pi G}{3} \\sum_i (\\rho_i + 3p_i / c^2) = -\\frac{H_0^2}{2} \\left[ \\Omega_{m,0} a^{-3} - 2\\Omega_{\\Lambda,0} \\right]$$

Thus:
$$q(a) = \\frac{1}{2} \\frac{\\Omega_{m,0} a^{-3} - 2\\Omega_{\\Lambda,0}}{\\Omega_{m,0} a^{-3} + \\Omega_{\\Lambda,0}}$$

The universe transitioned from deceleration ($q > 0$) to acceleration ($q < 0$) at $\\ddot{a} = 0$:
$$a_{\\text{trans}} = \\left( \\frac{\\Omega_{m,0}}{2\\Omega_{\\Lambda,0}} \\right)^{1/3} = \\left( \\frac{0.315}{2 \\times 0.685} \\right)^{1/3} \\approx 0.612$$

Converting to redshift:
$$z_{\\text{trans}} = \\frac{1}{a_{\\text{trans}}} - 1 = \\frac{1}{0.612} - 1 \\approx 0.63$$
This cosmic transition occurred roughly 6.5 billion years ago, verified by Type Ia supernovae!
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l6",
    number: 6,
    title: "Lookback Time & Cosmic Horizon",
    subtitle: "Looking back across billions of years of cosmic history",
    content: {
      explorer: `
### Telescopes Are Real-Life Time Machines

Because light travels at a finite speed ($300,000$ kilometers per second), looking out into deep space is literally looking backward in time!

* The Moon: You see it as it was **1.3 seconds ago**.
* The Sun: You see it as it was **8.3 minutes ago**.
* Andromeda Galaxy: You see it as it was **2.5 million years ago**.
* Distant JWST Galaxy ($z = 14$): You see it as it was **13.5 billion years ago**!

The time light took to travel from the galaxy to our telescope is called **Lookback Time**. When we observe the earliest galaxies, we are seeing cosmic baby pictures from when the universe was in its infancy!
      `,
      scholar: `
### Calculating Lookback Time

The lookback time $t_L(z)$ is the difference between the age of the universe today ($t_0$) and the cosmic time ($t_e$) when the observed light was emitted:

$$t_L(z) = t_0 - t_e = \\int_{t_e}^{t_0} dt = \\int_0^z \\frac{dz'}{(1+z') H(z')}$$

In a flat $\\Lambda$CDM universe:
$$t_L(z) = \\frac{1}{H_0} \\int_0^z \\frac{dz'}{(1+z') \\sqrt{\\Omega_{m,0}(1+z')^3 + \\Omega_{\\Lambda,0}}}$$

Representative Lookback Times (with $H_0 = 67.4$, $\\Omega_m = 0.315$):
* $z = 0.1$: $t_L = 1.34$ Gyr (recent cosmic history)
* $z = 1.0$: $t_L = 7.91$ Gyr (more than half the age of the universe)
* $z = 2.0$: $t_L = 10.48$ Gyr (Cosmic Noon starburst peak)
* $z = 10.0$: $t_L = 13.31$ Gyr (Cosmic Dawn, first stars)
* $z = 1090$: $t_L = 13.78$ Gyr (CMB decoupling, $380,000$ yr after Big Bang)
      `,
      astrophysicist: `
### Conformal Time & Analytical Lookback Solutions

In matter-plus-lambda cosmological models, the Friedmann differential equation admits an exact analytical solution for cosmic age $t(a)$:

$$t(a) = \\frac{2}{3 H_0 \\sqrt{\\Omega_{\\Lambda,0}}} \\ln\\left[ \\left( \\frac{a}{a_{\\text{eq}}} \\right)^{3/2} + \\sqrt{1 + \\left( \\frac{a}{a_{\\text{eq}}} \\right)^3} \\right]$$

Where $a_{\\text{eq}} \\equiv (\\Omega_{m,0}/\\Omega_{\\Lambda,0})^{1/3} \\approx 0.772$.

Evaluating at $a = 1$:
$$t_0 = \\frac{2}{3(67.4) \\sqrt{0.685}} \\ln\\left[ \\sqrt{\\frac{0.685}{0.315}} + \\sqrt{1 + \\frac{0.685}{0.315}} \\right] \\approx 13.79 \\text{ Gyr}$$

Lookback time is simply $t_L(z) = t(1) - t(1/(1+z))$. Because $dt/dz \\propto (1+z)^{-5/2}$ at high $z$, the vast majority of redshift increments ($z = 3$ to $z = 1000$) represent only the first ~2 billion years of cosmic history!
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l7",
    number: 7,
    title: "Observable-Universe Horizons",
    subtitle: "The particle horizon vs the myth of the 'edge of the universe'",
    content: {
      explorer: `
### Is There an Edge to the Universe?

Many people hear that the observable universe is **93 billion light-years across** and imagine there is a giant brick wall or an empty black cliff at the edge.

**There is no physical edge!**

* The **Observable Universe** is simply the bubble of space from which light has had time to travel to us since the Big Bang 13.8 billion years ago.
* Think of being in a ship in the middle of a foggy ocean. You can only see 1 mile in every direction because of the fog.
* Does the ocean end 1 mile away? Of course not! If you sail 1 mile, you just see another 1 mile of ocean.
* The universe extends vastly—and perhaps infinitely—far beyond what we can observe!
      `,
      scholar: `
### Three Crucial Cosmological Horizons

Physicists define three distinct boundaries in expanding spacetime:

1. **The Particle Horizon ($d_{\\text{particle}} \\approx 46.5$ Billion Light-Years / $14.3$ Gpc)**:
   The maximum proper distance from which particles could have emitted photons that have reached us today. Although the universe is 13.8 Gyr old, cosmic expansion has carried those emission points out to a proper radius of $46.5$ Gly today ($93$ Gly diameter).
2. **The Hubble Radius ($d_H = c/H_0 \\approx 14.4$ Billion Light-Years / $4.4$ Gpc)**:
   The distance where proper recession velocity equals the speed of light: $v_{\\text{rec}} = H_0 d_H = c$. Photons emitted outside this radius can still reach us if the expansion decelerates or if the Hubble radius grows.
3. **The Event Horizon ($d_{\\text{event}} \\approx 17.4$ Billion Light-Years / $5.3$ Gpc)**:
   Because Dark Energy causes accelerated expansion, signals emitted **today** from beyond this boundary can *never* reach us in the infinite future.
      `,
      astrophysicist: `
### Conformal Horizon Formulation & Causality

The comoving particle horizon $\\chi_{\\text{ph}}$ represents the maximum conformal time since $t=0$:

$$\\chi_{\\text{ph}}(t) = \\int_0^t \\frac{c \\, dt'}{a(t')} = \\eta(t) - \\eta(0)$$

The proper particle horizon distance today is:
$$d_{\\text{ph}}(t_0) = a(t_0) \\chi_{\\text{ph}}(t_0) = c \\int_0^\\infty \\frac{dz'}{H(z')}$$

Evaluating numerically for Planck $\\Lambda$CDM parameters gives $d_{\\text{ph}} = 14.26$ Gpc $\\approx 46.5$ billion light-years.

The comoving cosmic event horizon is:
$$\\chi_{\\text{event}}(t) = \\int_t^\\infty \\frac{c \\, dt'}{a(t')} = \\eta(\\infty) - \\eta(t)$$

Because dark energy drives asymptotic de Sitter expansion ($a(t) \\propto e^{H_\\infty t}$), the integral converges:
$$d_{\\text{event}}(t_0) = c \\int_{t_0}^\\infty \\frac{dt'}{a(t')} = c \\int_0^1 \\frac{da'}{a'^2 H(a')} \\approx 5.34 \\text{ Gpc} \\approx 17.4 \\text{ Gly}$$
This proves that 97% of the galaxies currently inside our observable universe have already permanently crossed our future event horizon!
      `,
    },
    readingTimeMinutes: 5,
  },
  {
    id: "m18-l8",
    number: 8,
    title: "Expansion vs Gravitationally Bound Systems",
    subtitle: "Why atoms, people, solar systems, and galaxies DO NOT expand",
    content: {
      explorer: `
### Why Aren't You Expanding?

If space is expanding everywhere, why aren't you getting taller? Why doesn't the Earth grow bigger, and why doesn't the Moon drift away from Earth?

* **Because electromagnetic and gravitational binding forces hold objects tightly together!**
* Imagine walking backward on a treadmill. Space is the treadmill trying to pull things apart.
* But inside an atom, electrical forces holding electrons to protons are **trillions of times stronger** than the tiny tug of cosmic expansion!
* Inside the Solar System and the Milky Way Galaxy, gravity is overwhelming: it completely overcomes cosmic expansion.
* **Only giant empty voids between unbound galaxy clusters expand.**
      `,
      scholar: `
### The Hierarchy of Binding Forces

Cosmic expansion is governed by the metric acceleration term $\\sim H_0^2 r$.

Let's compare the inward gravitational or electromagnetic acceleration $a_{\\text{bind}}$ to the outward expansion acceleration $a_{\\text{exp}} = H_0^2 r$:

1. **Inside an Atom ($r \\sim 10^{-10}$ m)**:
   Electrostatic acceleration $a_{\\text{EM}} \\sim 10^{22} \\text{ m/s}^2$ vs $a_{\\text{exp}} \\sim 10^{-45} \\text{ m/s}^2$. Expansion is weaker by **67 orders of magnitude**!
2. **The Solar System ($r \\sim 1\\text{ AU} \\sim 1.5 \\times 10^{11}$ m)**:
   Solar gravitational acceleration $a_{\\text{grav}} \\sim 6 \\times 10^{-3} \\text{ m/s}^2$ vs $a_{\\text{exp}} \\sim 10^{-24} \\text{ m/s}^2$. Expansion is weaker by **21 orders of magnitude**!
3. **The Milky Way ($r \\sim 15$ kpc)**:
   Local galactic gravity holds stars into stable orbits.
4. **The Local Group (Milky Way + Andromeda)**:
   Mutual gravity pulls Andromeda toward us at $300$ km/s. They will collide and merge in ~4.5 billion years, completely defying cosmic expansion!

**Conclusion**: Structures decoupled from expansion when they collapsed under gravity (virialization).
      `,
      astrophysicist: `
### Virial Equilibrium, Birkhoff's Theorem & The McVittie Metric

In general relativity, Birkhoff's theorem states that any spherically symmetric gravitational field in empty space is static and described by the Schwarzschild metric, regardless of the cosmological expansion outside.

The modified geodesic equation for a test particle orbiting mass $M$ in an expanding background:

$$\\ddot{\\mathbf{r}} = -\\frac{GM}{r^3} \\mathbf{r} + \\left( \\frac{\\ddot{a}}{a} \\right) \\mathbf{r} = -\\frac{GM}{r^3} \\mathbf{r} - q H^2 \\mathbf{r}$$

For a bound orbit (mean radius $r_0$):
* Orbital frequency $\\omega^2 = GM/r_0^3$.
* The cosmological perturbation produces a fractional radius shift:
  $$\\frac{\\Delta r}{r_0} \\approx \\frac{q H^2}{\\omega^2} = \\frac{q H^2 r_0^3}{GM}$$

For Earth's orbit around the Sun:
$$\\frac{\\Delta r}{r_0} \\sim 10^{-30}$$
This tiny static polarization shift does not grow over time. Once an overdensity decouples and virializes ($2K + U = 0$), cosmic expansion has zero cumulative effect on its internal structure.
      `,
    },
    readingTimeMinutes: 5,
  },
];

export const MODULE_18_QUIZ: QuizQuestion[] = [
  {
    id: "m18-q1",
    question: "What is physically happening when distant galaxies appear to recede from us?",
    options: [
      "Galaxies are propelled through stationary space by a central explosion",
      "Space itself is stretching between unbound galaxies, increasing their separation",
      "Our solar system is falling into a giant black hole at the center of the universe",
      "Telescope mirrors distort light over long travel times",
    ],
    correctAnswerIndex: 1,
    explanation:
      "General relativity shows that cosmic expansion is the metric stretching of spacetime itself between unbound galaxy clusters, not physical motion through pre-existing space.",
    difficulty: "beginner",
  },
  {
    id: "m18-q2",
    question: "Why do Andromeda and the Milky Way move toward each other instead of flying apart?",
    options: [
      "Because cosmic expansion only started yesterday",
      "Because their mutual gravitational binding force vastly overpowers the weak cosmic expansion tug",
      "Because dark energy pushes galaxies together inside the Local Group",
      "Because Andromeda is moving faster than the speed of light",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Gravitationally bound systems (atoms, solar systems, galaxies, and the Local Group) have collapsed and virialized. Their internal binding forces exceed the cosmological expansion acceleration by tens of orders of magnitude.",
    difficulty: "intermediate",
  },
  {
    id: "m18-q3",
    question: "How does Cosmological Redshift differ from the classic Doppler effect?",
    options: [
      "Doppler shift only applies to sound, whereas redshift applies to light",
      "Cosmological redshift is the metric stretching of photon wavelengths in transit through expanding space, whereas Doppler shift is caused by motion through space",
      "There is no difference; they are mathematically identical in every way",
      "Cosmological redshift only turns light blue instead of red",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Cosmological redshift (1 + z = a_obs / a_emit) occurs because spacetime stretches while the photon is in flight, stretching the wave crests. Doppler shift is caused by local velocity through space.",
    difficulty: "intermediate",
  },
  {
    id: "m18-q4",
    question:
      "If a distant galaxy is observed at redshift z = 1, what was the cosmic scale factor a(t) when that light was emitted?",
    options: [
      "a = 2.0 (the universe was twice as large)",
      "a = 0.5 (the universe was half its present size)",
      "a = 0.1 (the universe was one-tenth its size)",
      "a = 0.0 (the moment of the Big Bang)",
    ],
    correctAnswerIndex: 1,
    explanation:
      "The relationship between scale factor and redshift is a = 1 / (1 + z). For z = 1, a = 1 / (1 + 1) = 0.5, meaning space was exactly half its current size when the light was emitted.",
    difficulty: "intermediate",
  },
  {
    id: "m18-q5",
    question:
      "Why is the observable universe horizon (~46.5 billion light-years radius) NOT the edge of all existence?",
    options: [
      "Because space has a brick wall at the end of the galaxy distribution",
      "It is merely our observational boundary set by the finite speed of light and the 13.8 Gyr age of the universe; space continues beyond it",
      "Because light bends into a circle and brings us back to where we started",
      "Because beyond 46.5 billion light-years, time runs backward",
    ],
    correctAnswerIndex: 1,
    explanation:
      "The particle horizon is an observational horizon, not a physical barrier. Observers stationed 40 billion light-years away see their own 46.5-billion-light-year bubble centered on them, with space continuing smoothly.",
    difficulty: "advanced",
  },
  {
    id: "m18-q6",
    question: "What does the Hubble Constant H₀ = 70 km/s/Mpc tell us?",
    options: [
      "Every galaxy moves at 70 km/s regardless of its position",
      "For every 1 Megaparsec (~3.26 million light-years) of distance, galaxies recede an additional 70 km/s faster",
      "The universe will stop expanding in 70 million years",
      "Light slows down by 70 km/s every Megaparsec",
    ],
    correctAnswerIndex: 1,
    explanation:
      "The Hubble constant H_0 quantifies the expansion rate per unit distance: recession velocity v increases linearly by ~70 km/s for every Megaparsec deeper into space.",
    difficulty: "beginner",
  },
];

export const MODULE_18_DISCOVERY_FACTS = [
  {
    title: "Galaxies Can Recede Faster Than Light",
    text: "According to General Relativity, galaxies beyond the Hubble radius (~14.4 billion light-years) are receding from us faster than the speed of light! This does not violate Einstein's speed limit because space itself is expanding, rather than objects traveling through space.",
    icon: "Zap",
  },
  {
    title: "Georges Lemaître Discovered It First",
    text: "While Edwin Hubble published data in 1929, Belgian physicist and Catholic priest Georges Lemaître derived the expansion of space from Einstein's equations and published the velocity-distance relation two years earlier in 1927. The law was officially renamed the Hubble–Lemaître Law in 2018.",
    icon: "Award",
  },
  {
    title: "Photons Literally Lose Energy in Flight",
    text: "As light travels through expanding space, its wavelength stretches: E = hc/λ. The energy lost by cosmological redshift does not get transferred to dust or friction—it is lost because time-translation symmetry does not hold in an expanding metric!",
    icon: "TrendingUp",
  },
  {
    title: "The Ultimate Cosmic Solitude",
    text: "In roughly 100 billion years, dark energy will have pushed all galaxies outside the Local Group beyond our cosmological event horizon. Future astronomers born in our galaxy will look into deep space and see complete blackness outside the Milky Way-Andromeda merger!",
    icon: "Moon",
  },
];

export const MODULE_18_SCIENTIFIC_SOURCES: ScientificSource[] = [
  {
    title: "A Relation between Distance and Radial Velocity among Extra-Galactic Nebulae",
    organization: "Hubble (1929) / Proceedings of the National Academy of Sciences (PNAS 15, 168)",
    url: "https://www.pnas.org/doi/10.1073/pnas.15.3.168",
  },
  {
    title: "Un Univers homogène de masse constante et de rayon croissant (The Expanding Universe)",
    organization: "Lemaître (1927) / Annales de la Société Scientifique de Bruxelles (47, 49)",
    url: "https://ui.adsabs.harvard.edu/abs/1927ASSB...47...49L",
  },
  {
    title:
      "Final Results from the Hubble Space Telescope Key Project to Measure the Hubble Constant",
    organization: "Freedman et al. (2001) / Astrophysical Journal (ApJ 553, 47)",
    url: "https://ui.adsabs.harvard.edu/abs/2001ApJ...553...47F",
  },
  {
    title:
      "A Comprehensive Measurement of the Local Value of the Hubble Constant with 1 km/s/Mpc Precision (SH0ES)",
    organization: "Riess et al. (2022) / Astrophysical Journal Letters (ApJL 934, L7)",
    url: "https://ui.adsabs.harvard.edu/abs/2022ApJ...934L...7R",
  },
  {
    title: "The Pantheon+ Analysis: Cosmological Constraints",
    organization: "Brout et al. (2022) / Astrophysical Journal (ApJ 938, 110)",
    url: "https://ui.adsabs.harvard.edu/abs/2022ApJ...938..110B",
  },
];
