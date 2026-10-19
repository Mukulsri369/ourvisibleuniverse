# COSMOS Cinematic Asset, Shader & Model Architecture Specification

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **System**: COSMOS Cinematic Learning System (Prompt 02 of 18 — Sections 14 & 15)
- **Scope**: Procedural vs. External Asset Strategy, Custom GLSL Shader Library, Geometry/Texture Budgets & Licensing

---

## 1. Asset Strategy: Procedural-First with Curated Scientific Geometry

To guarantee instant scene mounting ($<150\text{ ms}$), zero network stall on low-bandwidth connections, and deterministic parameter morphing across all 172 chapters, the COSMOS Cinematic System uses a **Procedural-First + Instanced GPU Buffer** architecture:

### 1.1 Existing Reusable 3D Assets & Shaders in Repository
| Asset / Shader Family | Existing Repository Source | Reused Across Modules |
| :--- | :--- | :--- |
| **Planckian Blackbody & Spectral Color Engine** | `src/stars/color-science.ts`, `src/stars/spectral.ts` | M02, M07, M09, M10, M11, M13, M20, M24 |
| **Volumetric FBM Emission & Extinction Shaders** | `src/stars/nebula-shaders.ts`, `src/components/academy/Nebula3DExplorer.tsx` | M10.1, M10.6–10.7, M11.1–11.6, M13.2, M17.4–17.6 |
| **Floating-Origin & 64-Bit Split Double Math** | `src/lib/astronomy/floating-origin.ts` (`Vector3D`, `splitDouble`) | M01, M03, M13, M15, M18 |
| **Continuous Screen-Space LOD Hysteresis** | `src/stars/lod/LODTransitionManager.ts` | M01, M03, M13, M15 |
| **HDR Bloom & Tone-Mapping Pipeline** | `src/stars/OpticsPostProcessing.tsx` (`UnrealBloomPass`, ACES/AgX) | All 24 Modules in `CosmosCinematicPlayer` |
| **Procedural Earth, Moon & Solar System Shaders** | `CosmicZoomVisualizer3D.tsx`, `SunEarthMoonSimulation3D.tsx`, `SolarSystemExplorer3D.tsx` | M01, M03, M05, M06, M19, M20, M22, M23 |
| **Solar Interior Cutaway & Magnetic Loop Rig** | `src/components/academy/SunSimulator3D.tsx` | M04.3, M07.1–07.7, M20.1 |
| **Symplectic Velocity-Verlet Orbital Integrator** | `src/components/academy/OrbitalMechanicsLab3D.tsx` | M06, M08.1–08.8, M12.3, M16.2, M22, M24 |
| **Relativistic Black Hole, Pulsar & GW Shaders** | `src/components/academy/BlackHoleVisualizer3D.tsx` | M10.8, M13.4, M14.1–14.8, M16.3, M20.6–20.7 |
| **Galactic Density-Wave & Merger Particle Engine** | `src/components/academy/GalaxyAssemblyLab3D.tsx`, `src/stars/galaxy-models.ts` | M01.5, M03.6, M13.1–13.6, M16.2, M20.3–20.5 |
| **Cosmic Web & Laniakea Watershed Streamlines** | `src/components/academy/CosmicStructureVisualizer3D.tsx`, `src/stars/LargeScaleStructure3D.tsx` | M01.6, M15.1–15.7, M16.4, M17.7–17.8, M18 |

---

## 2. New Shared Shader & Procedural Geometry Modules Required

To complete all 172 chapter storyboards without downloading bloated multi-megabyte textures, `CosmosVisualEffectsLibrary` will provide 8 shared GPU shader/geometry generators:

| Shader / Generator ID | Target Modules | Technical Specification | Memory Impact |
| :--- | :--- | :--- | :---: |
| **`RayleighAtmosphereSkyShader`** | M01.1, M02.1, M05.6, M21.4, M23.2 | Wavelength-dependent ($\lambda^{-4}$) optical depth & solar zenith angle sky dome + copper-red lunar eclipse refraction ring. | $< 0.2\text{ MB}$ |
| **`SphericalOctantCutawayShader`** | M06.2–06.4, M07.2, M10.4–10.5, M14.2, M23.6 | Fragment/vertex clipping plane with radial shell index lookup (Core, Radiative/Mantle, Crust/Ice Shell, Subsurface Ocean). | $< 0.5\text{ MB}$ |
| **`ElectromagneticWavePacketMesh`** | M04.1, M04.5–04.6, M18.4, M21.8 | Coupled orthogonal $\vec{E}$ and $\vec{B}$ parametric tube geometry + comoving scale-factor wavelength stretching $1+z = a_0/a_e$. | $< 0.4\text{ MB}$ |
| **`GravitationalLensingRingShader`** | M14.3–14.5, M16.3 | Post-process / billboard UV deflection $\vec{\theta} - \vec{\beta} = \theta_E^2 \frac{\vec{\theta}}{|\vec{\theta}|^2}$ generating Einstein rings, arcs, and Bullet Cluster shear. | $< 0.5\text{ MB}$ |
| **`ComovingLatticeAndExpansionHorn`** | M16.7–16.9, M17.1–17.8, M18.1–18.8, M20.8 | Instanced 3D elastic coordinate grid ($3\times 3\times 3$ to $5\times 5\times 5$) + parametric FLRW spacetime manifold $R(t) \propto a(t)$ for $w = -1, w < -1, w > -1$. | $< 0.8\text{ MB}$ |
| **`HistoricalArmillaryAndEpicycleRig`** | M19.1–19.6 | Procedural metallic-brass deferent, epicycle, equant, Tusi-couple, and Syene/Alexandria obelisk shadow geometry. | $< 0.6\text{ MB}$ |
| **`OpticalRayTracingBench3D`** | M21.1–21.8 | Dynamic collimated-to-focal ray bundle lines + Refractor lens, Newtonian/Cassegrain parabolic mirrors, JWST 18-hex segments, Wolter Type-I grazing shells, and 3D Airy PSF mesh. | $< 1.2\text{ MB}$ |
| **`SpacecraftProceduralAssemblies`** | M21.6, M22.1–22.8 | Clean, low-poly procedural/instanced R3F sub-assemblies for Sputnik 1, Vostok/Apollo CSM-LM, ISS, Perseverance + Sky Crane, Voyager 1/2, Hubble, JWST, and LISA triangle (upgraded from `SpaceMuseumLab.tsx`). | $< 2.5\text{ MB}$ |

---

## 3. Geometry, Texture & Memory Budgets

| Asset Class | High Quality (Desktop) | Balanced Quality (Tablet / Laptop) | Low-Power Quality (Mobile) | Compression & Disposal Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Primary Celestial Sphere** | $64 \times 64$ segments ($8,192$ tris) | $48 \times 48$ segments ($4,608$ tris) | $32 \times 32$ segments ($2,048$ tris) | Shared singleton `SphereGeometry` instances across scenes. |
| **Particle Cloud Count** | $8,000\text{–}15,000$ points | $4,000\text{–}6,000$ points | $1,500\text{–}2,500$ points | Pooled `Float32Array` attribute buffers; zero per-frame allocation. |
| **Procedural Canvas Textures** | $1024 \times 512\text{ px}$ | $512 \times 256\text{ px}$ | $256 \times 128\text{ px}$ | Cached in `CosmosCinematicAssetManager` LRU cache; `.dispose()` on eviction. |
| **Spacecraft / Instrument Assembly** | $\le 15,000$ tris | $\le 8,000$ tris | $\le 3,500$ tris | Instanced solar panels, mirror segments, and truss struts. |
| **Total Scene GPU Memory Cap** | **$\le 45\text{ MB}$** | **$\le 24\text{ MB}$** | **$\le 12\text{ MB}$** | Strictly enforced via `renderer.info.memory` telemetry. |

---

## 4. Licensing, Provenance & Attribution Policy

1. **Zero Copyleft / GPL Code**: As established in the Prompt 01 audit, no GPL-covered source code (e.g., Celestia) may ever be copied into the repository. All shaders and orbital/astrophysical solvers are clean-room TypeScript/GLSL implementations of published scientific equations.
2. **Astronomical Catalogs & Ephemerides**:
   - Star positions, magnitudes, and B-V colors derive from public-domain / open-science **ESA Hipparcos & Gaia DR3** catalogs (`docs/gaia-star-atlas-provenance.md`).
   - Planetary orbital elements derive from public-domain **NASA JPL Solar System Dynamics (SSD) / DE440** mean elements (`docs/solar-system-jpl-ephemeris-report.md`).
   - Cosmological parameters derive from **ESA Planck Collaboration (2018/2020)** public releases.
3. **NASA 3D Resources & Imagery Attribution**:
   - Any reference geometry or albedo maps derived from NASA 3D Resources / NASA SVS are public domain under 17 U.S.C. § 105 and are credited in each storyboard's `scientificReferences` array (e.g., *"Courtesy NASA/JPL-Caltech/STScI/GSFC"*).
