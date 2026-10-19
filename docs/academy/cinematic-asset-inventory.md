# COSMOS Cinematic Scientific 3D Asset Inventory (Current-State & Upgraded Catalog)

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **Phase**: Prompt 06 — Section 3 (Complete Asset Inventory)

---

## 1. Repository Asset Audit (Pre-Upgrade Baseline vs. Prompt 06 Upgraded Library)

| Asset ID | Scientific Subject | Source Organization | Delivery Strategy | Optimized Format | Texture Variants | LOD Levels | Relevant Modules | License Status | Validation Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| `asset_planet_earth_reference_v2` | Earth (Terra) — Continents, Bathymetry, Clouds, VIIRS Night Lights, Rayleigh Limb | NASA GSFC / Visible Earth / NOAA | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 (`512x256`, `256x128`, `128x64`) | 4 (`LOD0`–`LOD3`) | M01–M06, M08, M19, M20, M22–M24 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_moon_luna_lroc_v2` | Earth's Moon (Luna) — LROC Albedo & LOLA Crater Relief | NASA GSFC / ASU LROC (SVS #4720) | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M03, M05, M06, M08, M22 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_mercury_v1` | Mercury — MESSENGER MDIS Global Mosaic & Caloris Relief | NASA / JHUAPL / CIW | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06, M08 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_venus_v1` | Venus — Sulfuric Acid Cloud Deck & Magellan Radar Relief | NASA JPL / Magellan | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06, M19, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_mars_viking_mola_v2` | Mars — Viking Color Mosaic & MGS MOLA Topographic Relief | NASA JPL / USGS / MOLA | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06, M08, M22, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_jupiter_cassini_juno_v2` | Jupiter — Cassini/Juno Zonal Belts & Great Red Spot | NASA / JPL-Caltech / SSI / SwRI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06, M08, M12, M22 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_saturn_cassini_v2` | Saturn — Cassini Atmosphere & A/B/C/F Rings (Cassini Division) | NASA / JPL-Caltech / SSI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06, M08, M22 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_uranus_voyager_v1` | Uranus — Methane-Band Ice Giant & $97.77^\circ$ Axial Obliquity | NASA / JPL-Caltech / STScI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_ETC1S_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_planet_neptune_voyager_v1` | Neptune — Azure Methane Ice Giant & High-Altitude Cirrus | NASA / JPL-Caltech / STScI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_ETC1S_FALLBACK_DATA_RGBA` | 3 | 4 | M01, M06 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_dwarf_pluto_new_horizons_v1` | Pluto — New Horizons Tombaugh Regio Nitrogen-Ice Heart | NASA / JHUAPL / SwRI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M06 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_moon_europa_galileo_v2` | Europa — Galileo Fractured Ice Shell & Subsurface Ocean Cutaway | NASA / JPL-Caltech / USGS | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M06, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_moon_io_galileo_v1` | Io — Galileo Sulfur Volcanism & Tidal Paterae | NASA / JPL-Caltech / USGS | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M06, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_moon_titan_cassini_v1` | Titan — Cassini Photochemical Haze & Hydrocarbon Seas | NASA / JPL-Caltech / ESA | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M06, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_moon_enceladus_cassini_v1` | Enceladus — High-Albedo Ice Shell, Tiger Stripes & Plumes | NASA / JPL-Caltech / SSI | `HYBRID_PROCEDURAL_SURFACE_MAPS` | `KTX2_UASTC_FALLBACK_DATA_RGBA` | 3 | 4 | M06, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_smallbody_asteroid_bennu_v1` | 101955 Bennu — OSIRIS-REx Non-Spherical Rubble-Pile Shape | NASA GSFC / Univ. of Arizona | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 4 | M06, M08, M22 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_spacecraft_jwst_v2` | James Webb Space Telescope — 18-Segment Gold Mirror & Sunshield | NASA GSFC / STScI / ESA / CSA | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 4 | M04, M11, M12, M17, M21–M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_spacecraft_hst_v2` | Hubble Space Telescope — 2.4m Ritchey-Chrétien LEO Observatory | NASA GSFC / STScI / ESA | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 4 | M11, M13, M19, M21, M22 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_spacecraft_voyager_v2` | Voyager 1/2 Interstellar Probe — 3.7m HGA Dish, RTG & Golden Record | NASA / JPL-Caltech | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 4 | M03, M06, M08, M22, M23 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_spacecraft_chandrayaan3_vikram_v2` | ISRO Chandrayaan-3 Vikram Lander & Pragyan Rover | ISRO Public Spec / First-Party | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 4 | M05, M22 | `CLEAN_ROOM_FIRST_PARTY` | **READY** |
| `asset_instrument_cassegrain_reflector_v1` | Cassegrain Reflecting Telescope Optical Cutaway & Ray Bench | First-Party Optical Physics Library | `AUTHENTIC_SCIENTIFIC_GLB_DERIVATIVE` | `GLB_2_0_MESHOPT` | 3 | 3 | M04, M19, M21 | `CLEAN_ROOM_FIRST_PARTY` | **READY** |
| `asset_star_spectral_photosphere_v2` | Planckian OBAFGKM Stellar Photosphere & Interior Cutaway Rig | NASA SDO / ESA Gaia DR3 Calibration | `PHYSICALLY_INFORMED_GLSL_SHADER` | `GLSL_PROCEDURAL_SHADER_RIG` | 3 | 4 | M01–M10, M12, M20, M24 | `PUBLIC_DOMAIN_NASA_17USC105` | **READY** |
| `asset_nebula_orion_m42_volumetric_v2` | Emission/Reflection/Dark Nebula Volumetric & Spectral Rig | NASA / ESA / CSA / STScI | `LABELED_VOLUMETRIC_RECONSTRUCTION` | `GLSL_PROCEDURAL_SHADER_RIG` | 3 | 3 | M10, M11, M13, M20, M21 | `CC_BY_4_0_ESA_WEBB` | **READY** |
| `asset_galaxy_catalog_particle_field_v2` | Milky Way, Andromeda & Cosmic Web GPU Particle Buffer | ESA Gaia DR3 / SDSS / 2MASS | `CATALOG_TYPED_PARTICLE_BUFFER` | `FLOAT32_TYPED_CATALOG_BUFFER` | 3 | 4 | M01, M03, M11, M13, M15–M20, M24 | `OPEN_SCIENCE_GAIA_HIPPARCOS` | **READY** |
| `asset_compact_blackhole_kerr_relativity_v2` | Schwarzschild/Kerr Black Hole, Photon Ring, Accretion Disk & Pulsar | EHT Collaboration / NASA GSFC Ref | `PHYSICALLY_INFORMED_GLSL_SHADER` | `GLSL_PROCEDURAL_SHADER_RIG` | 3 | 3 | M10, M13, M14, M16, M20, M24 | `CC_BY_4_0_ESO` | **READY** |

---

## 2. Pre-Upgrade Gaps Identified & Resolved in Prompt 06

1. **Missing Normal/Topographic Relief Maps**: Previously, planetary spheres relied on flat albedo maps without tangent-space normal maps. `CosmosTextureVariantManager` now generates linear-color-space (`THREE.NoColorSpace`) normal and roughness/specular maps from surface elevation fields.
2. **Incomplete Solar System Coverage**: Added dedicated source-calibrated presets and maps for Mercury, Venus, Pluto, Ceres, Io, Ganymede, Callisto, Titan, Enceladus, and Triton alongside Earth, Moon, Mars, Jupiter, Saturn, Uranus, and Neptune.
3. **Irregular Small Bodies**: Added non-spherical polyhedral rubble-pile asteroid rendering (`IrregularCelestialBodyRenderer.tsx` for 101955 Bennu) so asteroids are never forced into unrealistic smooth spheres.
4. **Node-Addressable Spacecraft & Telescope Cutaways**: Added `ScientificSpacecraftRenderer.tsx` and `ScientificTelescopeCutaway.tsx` with preserved named hierarchy nodes (`primary_mirror`, `secondary_mirror`, `sunshield`, `detector_focal_plane`, `optical_ray_path`) for COSMOS cue synchronization.
