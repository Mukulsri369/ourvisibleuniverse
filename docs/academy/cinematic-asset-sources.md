# COSMOS Scientific Asset Sources & Provenance Reference

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **Phase**: Prompt 06 — Sections 4, 5, 7 (Authentic Astronomical Asset Sources & Selection Strategy)

---

## 1. Primary Scientific Sources Researched & Utilized

1. **NASA 3D Resources & Solar System Exploration (`https://science.nasa.gov/3d-resources/`)**:
   - Reference structural proportions, dimensions, and surface mosaics for **JWST**, **Hubble Space Telescope**, **Voyager 1/2**, **101955 Bennu** (OSIRIS-REx), **Mercury** (MESSENGER), **Venus** (Magellan), **Mars** (Viking/MOLA), **Jupiter** (Cassini/Juno), **Saturn** (Cassini), **Uranus**, **Neptune**, **Pluto** (New Horizons), and major moons (**Europa**, **Io**, **Titan**, **Enceladus**).
2. **NASA Scientific Visualization Studio (`https://svs.gsfc.nasa.gov/4720`)**:
   - Lunar Reconnaissance Orbiter (LROC WAC global albedo mosaic & LOLA laser altimetry elevation reference) for `asset_moon_luna_lroc_v2`.
3. **NASA Visible Earth (`https://visibleearth.nasa.gov/collection/1484/blue-marble`)**:
   - Blue Marble Next Generation, ETOPO1 bathymetry/topography, and Suomi NPP VIIRS night-time city lights reference for `asset_planet_earth_reference_v2`.
4. **ESA / Webb & Hubble (`https://esawebb.org/`)**:
   - Optical ($\text{H}\alpha\ 656.3\text{ nm}$, $[\text{O III}]\ 500.7\text{ nm}$) and near/mid-infrared (NIRCam/MIRI) spectral emission and dust extinction characteristics for `asset_nebula_orion_m42_volumetric_v2`.
5. **ESA Gaia Data Release 3 & Hipparcos (`https://www.cosmos.esa.int/web/gaia/dr3`)**:
   - Stellar astrometry, $G_{\text{BP}} - G_{\text{RP}}$ color temperatures, and galactic disk/bulge/halo population distributions for `asset_galaxy_catalog_particle_field_v2`.
6. **Event Horizon Telescope (EHT) Collaboration & ESO (`https://eventhorizontelescope.org/`)**:
   - M87* and Sgr A* horizon-scale shadow diameter ($d_{\text{sh}} = 3\sqrt{3}\,r_s$) and relativistic Doppler beaming asymmetry for `asset_compact_blackhole_kerr_relativity_v2`.

---

## 2. Asset Modality Selection Matrix (Section 5)

| Astronomical Category | Selected Modality | Engineering & Scientific Rationale |
| :--- | :--- | :--- |
| **Spacecraft & Observatories (JWST, HST, Voyager, Vikram)** | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | Preserves recognizable mission proportions (18 hexagonal segments, 5-layer Kapton sunshield, 3.7m parabolic dish) and named sub-assembly nodes for COSMOS highlights while keeping triangle counts $\le 9,420$. |
| **Telescope Optical Cutaways (Cassegrain, Refractor)** | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | Hierarchical cutaway geometry paired with live collimated-to-focal ray bundles (`primary_mirror` $\to$ `secondary_mirror` $\to$ `detector_focal_plane`). |
| **Planets & Major Moons (Mercury–Neptune, Luna, Europa)** | `HYBRID_PROCEDURAL_SURFACE_MAPS` | Multi-resolution (`HIGH`, `BALANCED`, `LOW_POWER`) seam-free equirectangular Albedo (`SRGBColorSpace`), Normal (`NoColorSpace`), and Specular/Roughness maps on shared LOD spheres. |
| **Stars & Stellar Interiors (OBAFGKM, Solar Dynamo)** | `PHYSICALLY_INFORMED_GLSL_SHADER` | Avoids static sphere meshes; renders live 3D time-evolving convection granules, Planckian blackbody locus chromaticity, Eddington limb darkening, and spherical octant interior cutaways. |
| **Galaxies & Star Clusters (Milky Way, M31, M13)** | `CATALOG_TYPED_PARTICLE_BUFFER` | Single-draw-call `Float32Array` GPU point buffers calibrated to Gaia/SDSS profiles, transitioning to Sérsic impostors below 12 screen pixels. |
| **Nebulae & Star-Forming Regions (M42, M16, M57, M1)** | `LABELED_VOLUMETRIC_RECONSTRUCTION` | Multi-shell raymarched FBM emission/reflection/extinction volume explicitly disclosed as a model-dependent 3D reconstruction of 2D telescopic plates. |
| **Black Holes & Pulsars (Schwarzschild/Kerr, Crab)** | `PHYSICALLY_INFORMED_GLSL_SHADER` | Analytical general-relativistic ISCO, photon sphere, gravitational redshift, Doppler beaming, and tilted-dipole lighthouse cone shaders. |
