# COSMOS Scientific Visualization Standards & Epistemic Transparency

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Section 9)
- **Scope**: Mandatory Scientific Representation Declarations, Domain-Specific Accuracy Guardrails & Epistemic Labelling

---

## 1. The Four Mandatory Scientific Representation Categories

Every chapter storyboard (`ChapterStoryboard.scientificRepresentation`) and fullscreen HUD header must explicitly declare which of the four representation categories governs the active visualization:

| Category Code                            | Display Badge Label                | Definition & Epistemic Contract                                                                                                                                                                                                                                                                                                              | Representative Chapters                                                                                                                                          |
| :--------------------------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`OBSERVATION_BASED`**                  | `Observation-Based Data`           | Directly renders empirical astrometric, photometric, spectroscopic, or interferometric survey data (e.g., Hipparcos/Gaia star positions, Planck CMB map, EHT M87*/Sgr A* ring geometry, JPL DE440 ephemerides).                                                                                                                              | M02 (Constellations & Sky Dome), M04.5–04.6 (Fraunhofer Spectra), M14.5/14.7 (EHT Shadow), M17.4 (Planck CMB).                                                   |
| **`PHYSICS_BASED_SIMULATION`**           | `Physics-Based Simulation`         | Solves analytical or numerical physical equations in real time (e.g., Vis-viva orbital mechanics, Velocity-Verlet N-body integration, Planck blackbody radiation, Stefan-Boltzmann $L = 4\pi R^2\sigma T^4$, Friedmann expansion $a(t)$).                                                                                                    | M04.1–04.2 (Light Propagation), M08.1–08.8 (Kepler/Newton Orbits), M09.2–09.7 (Blackbody & H-R), M12.2–12.3 (Transit/RV), M18 (FLRW Expansion).                  |
| **`SCALE_ADJUSTED_EDUCATIONAL_MODEL`**   | `Scale-Adjusted Educational Model` | Preserves topological and causal physical relationships while intentionally exaggerating body radii relative to orbital distances (or compressing Gyr/Myr timescales into seconds) so objects remain simultaneously visible. **Must display live scale disclosure** (e.g., `Planet Radii Exaggerated 40x · One-Click True Scale Available`). | M01.3–01.4 (Earth-Moon & Solar System), M05.1–05.7 (Eclipses & Tides), M06.1–06.8 (Solar System Orrery), M22 (Mission Trajectories).                             |
| **`ARTISTIC_SCIENTIFIC_RECONSTRUCTION`** | `Scientific Reconstruction`        | Visualizes unresolved surfaces, subatomic/interior regimes, or deep-past/deep-future epochs bounded by peer-reviewed theoretical models (e.g., exoplanet surface climates, Quark-Gluon Plasma, Hawking evaporation in $10^{67}\text{ yr}$).                                                                                                  | M07.2–07.3 (Solar Core p-p Fusion), M12.1/12.4 (Exoplanet Surfaces), M17.2 (Quark-Gluon Plasma), M20.1–20.8 (Deep-Time Future), M23 (Protocells & Ocean Worlds). |

---

## 2. Domain-Specific Scientific Accuracy Guardrails (Mandatory)

1. **Black Holes & Relativistic Environments (Module 14)**:
   - Disclose that real-time WebGL gravitational lensing and Doppler-beamed accretion disk shaders (`BlackHoleVisualizer3D.tsx`) are **analytical general-relativistic approximations** of the Schwarzschild ($R_s = 2GM/c^2$, photon sphere $1.5\,R_s$, shadow radius $b_c = \frac{3\sqrt{3}}{2}R_s \approx 2.60\,R_s$, ISCO $3\,R_s$) and Kerr metrics, rather than full offline general-relativistic magnetohydrodynamic (GRMHD) radiative transfer.
   - Never depict a black hole as a "cosmic vacuum cleaner" that sucks in distant orbits; Chapter 14.3 explicitly demonstrates Birkhoff's theorem (replacing a $10\,M_\odot$ star with a $10\,M_\odot$ black hole leaves planetary orbits at $r \gg R_s$ unchanged).
2. **Big Bang & Metric Cosmic Expansion (Modules 17 & 18)**:
   - **Strictly Ban the "Explosion in Space" Misconception**: Never animate the Big Bang as a localized fireball exploding outward from a central point into pre-existing empty darkness.
   - Always visualize cosmic expansion via a **3D comoving coordinate lattice** stretching uniformly everywhere ($d_{\text{phys}}(t) = a(t)\chi$), and include the "Change Observer Galaxy" control (Chapter 18.1) proving that every comoving galaxy observes the exact same isotropic Hubble–Lemaître recession law.
   - Clearly demonstrate that gravitationally bound systems (atoms, planetary systems, galaxies, and the Local Group inside its $\sim 1\text{ Mpc}$ turnaround radius) decouple from the Hubble flow and **do not expand** (Chapter 18.8).
3. **Dark Matter & Dark Energy (Modules 13.5, 15, 16)**:
   - Never render Dark Matter as glowing purple smoke or opaque clouds that block starlight.
   - Always label Dark Matter halos (`NFW Density Profile`) and Cosmic Web potential wells as **invisible mass distributions inferred via gravitational effects** (flat galactic rotation curves $v(r) \approx \text{const}$, Coma Cluster virial velocity dispersion $\sigma_v$, and Bullet Cluster weak/strong gravitational lensing offset from Chandra X-ray gas).
4. **Stellar Colors & Effective Temperatures (Modules 07, 09, 10)**:
   - Represent stellar colors using calibrated Planckian blackbody chromaticities (`src/stars/color-science.ts`). Specifically note that our Sun ($T_{\text{eff}} = 5,772\text{ K}$) peaks in the green-yellow visible spectrum and appears **brilliant white** from space (appearing yellow/orange near Earth's horizon only due to atmospheric Rayleigh scattering).
5. **Exoplanets & Astrobiology (Modules 12 & 23)**:
   - Clearly separate **directly measured observables** (transit depth $\Delta F/F = (R_p/R_\star)^2$, orbital period $P$, radial-velocity semi-amplitude $K_\star \implies M_p\sin i$, transmission spectral troughs) from **model-dependent surface reconstructions**.
   - In Module 23 (Chapter 23.10), enforce the **Evidence Boundary**: clearly state that while organic molecules, habitable-zone exoplanets, and subsurface icy-moon oceans are verified facts, **zero confirmed extraterrestrial lifeforms, fossils, or technosignatures have been discovered to date**.
6. **Solar System & Eclipse Geometry (Modules 01, 03, 05, 06)**:
   - Whenever planetary or lunar radii are scaled up so students can see them on screen alongside their orbits, display the **Scale Mode Toggle (`Schematic Visibility Scale` $\leftrightarrow$ `True 1:1 Physical Scale`)** so students can experience the true emptiness of space ($d_{\text{Moon}} \approx 30\,D_\oplus$; $1\text{ AU} \approx 107\,D_\odot \approx 11,740\,D_\oplus$).
