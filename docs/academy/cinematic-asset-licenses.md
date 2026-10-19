# COSMOS Asset Licensing, Attribution & No-Endorsement Compliance

- **Project**: Our Visible Universe Academy (`https://ourvisibleuniverse.in`)
- **Phase**: Prompt 06 — Section 7 (NASA and ESA Usage Compliance)
- **Runtime Enforcement**: `src/lib/cosmos/cinematic/assets/CosmosAssetAttribution.ts`
- **Public UI Disclosure**: `CosmosCinematicOverlay.tsx` (`data-testid="cinematic-asset-credits-toggle"`)

---

## 1. Mandatory Licensing & Compliance Rules Enforced in Code

1. **NASA Media Usage Guidelines (17 U.S.C. § 105)**:
   - Government-produced NASA imagery, 3D models, and planetary maps are in the public domain unless third-party copyright is noted.
   - **Strict No-Endorsement Rule**: Every NASA-sourced asset record in `COSMOS_VERIFIED_ASSET_MANIFEST` carries an explicit `noEndorsementNotice` (*"NASA does not endorse Our Visible Universe Academy or its commercial products"*).
   - **Logo/Insignia Restriction**: Official NASA "Meatball", "Worm", or mission patch insignia are never used as branding or commercial endorsement badges.
2. **ESA / Webb & ESO Creative Commons Attribution 4.0 International (`CC BY 4.0`)**:
   - All ESA/Webb and ESO observational references link directly to `https://creativecommons.org/licenses/by/4.0/`, credit all contributing agencies (`NASA, ESA, CSA, STScI` or `EHT Collaboration / ESO`), and state whether a 3D volumetric or shader adaptation was made.
3. **ESA Gaia DR3 & Hipparcos Open Science Catalogs**:
   - Credited under `CC BY-SA 3.0 IGO` / ESA Gaia Collaboration open-data terms.
4. **Zero Unlicensed / Unverified Third-Party Assets**:
   - `CosmosAssetAttribution.verifyAssetLicenseCompliance()` and `CosmosCinematicAssetManager.loadAsset()` automatically reject any asset marked `LICENSE_REVIEW_REQUIRED` or `BLOCKED_UNLICENSED`.

---

## 2. Public Credits Table (All 19 Production Asset Families)

| Asset ID | License Identifier | Required Attribution Credit Wording | No-Endorsement Disclosure |
| :--- | :--- | :--- | :--- |
| `asset_planet_earth_reference_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Imagery and topographic data derived from NASA Visible Earth (Blue Marble Next Generation, ETOPO1, Suomi NPP VIIRS). Courtesy NASA/GSFC/NOAA. | NASA does not endorse Our Visible Universe Academy or its commercial products. |
| `asset_moon_luna_lroc_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Lunar albedo and elevation relief derived from NASA Lunar Reconnaissance Orbiter (LROC WAC / LOLA CGI Moon Kit, SVS #4720). Courtesy NASA/GSFC/ASU. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_mercury_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Mercury global surface reference derived from NASA MESSENGER MDIS mosaic. Courtesy NASA/JHUAPL/CIW. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_venus_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Venus radar topography and cloud albedo derived from NASA Magellan & Pioneer Venus data. Courtesy NASA/JPL-Caltech. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_mars_viking_mola_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Mars global mosaic and laser altimetry relief derived from NASA Viking & Mars Global Surveyor MOLA. Courtesy NASA/JPL-Caltech/USGS. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_jupiter_cassini_juno_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Jupiter cylindrical cloud map derived from NASA Cassini ISS and JunoCam observations. Courtesy NASA/JPL-Caltech/SSI/SwRI. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_saturn_cassini_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Saturn atmosphere and radial ring optical-depth profile derived from NASA/ESA Cassini ISS & UVIS occultation profiles. Courtesy NASA/JPL-Caltech/SSI. | NASA and ESA do not endorse Our Visible Universe Academy. |
| `asset_planet_uranus_voyager_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Uranus methane-absorption appearance derived from NASA Voyager 2 ISS and HST OPAL observations. Courtesy NASA/JPL-Caltech/STScI. | NASA does not endorse Our Visible Universe Academy. |
| `asset_planet_neptune_voyager_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Neptune atmospheric bands and vortex features derived from NASA Voyager 2 and HST OPAL observations. Courtesy NASA/JPL-Caltech/STScI. | NASA does not endorse Our Visible Universe Academy. |
| `asset_dwarf_pluto_new_horizons_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Pluto global mosaic derived from NASA New Horizons LORRI/MVIC encounter imagery. Courtesy NASA/JHUAPL/SwRI. | NASA does not endorse Our Visible Universe Academy. |
| `asset_moon_europa_galileo_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Europa surface lineae mosaic derived from NASA Galileo SSI & Voyager observations. Courtesy NASA/JPL-Caltech/USGS. | NASA does not endorse Our Visible Universe Academy. |
| `asset_moon_io_galileo_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Io global sulfur volcanism mosaic derived from NASA Galileo SSI & Voyager imagery. Courtesy NASA/JPL-Caltech/USGS. | NASA does not endorse Our Visible Universe Academy. |
| `asset_moon_titan_cassini_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Titan atmospheric haze and radar lake mapping derived from NASA/ESA/ASI Cassini-Huygens mission. Courtesy NASA/JPL-Caltech/SSI. | NASA and ESA do not endorse Our Visible Universe Academy. |
| `asset_moon_enceladus_cassini_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Enceladus ice shell and Tiger Stripes fractures derived from NASA Cassini ISS mosaic. Courtesy NASA/JPL-Caltech/SSI. | NASA does not endorse Our Visible Universe Academy. |
| `asset_smallbody_asteroid_bennu_v1` | `PUBLIC_DOMAIN_NASA_17USC105` | Bennu polyhedral shape profile derived from NASA OSIRIS-REx laser altimetry (OLA). Courtesy NASA/Goddard/University of Arizona. | NASA does not endorse Our Visible Universe Academy. |
| `asset_spacecraft_jwst_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | James Webb Space Telescope structural proportions and 18-segment optical assembly derived from NASA 3D Resources. Courtesy NASA/GSFC/STScI/ESA/CSA. | NASA, ESA, CSA, and STScI do not endorse Our Visible Universe Academy. |
| `asset_spacecraft_hst_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Hubble Space Telescope geometry derived from NASA 3D Resources. Courtesy NASA/GSFC/STScI/ESA. | NASA and ESA do not endorse Our Visible Universe Academy. |
| `asset_spacecraft_voyager_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Voyager spacecraft structural design derived from NASA JPL 3D Resources. Courtesy NASA/JPL-Caltech. | NASA and JPL-Caltech do not endorse Our Visible Universe Academy. |
| `asset_spacecraft_chandrayaan3_vikram_v2` | `CLEAN_ROOM_FIRST_PARTY` | First-party clean-room 3D educational model constructed from published ISRO Chandrayaan-3 Vikram Lander and Pragyan Rover dimensions. | ISRO does not endorse Our Visible Universe Academy. |
| `asset_instrument_cassegrain_reflector_v1` | `CLEAN_ROOM_FIRST_PARTY` | First-party interactive 3D optical ray-tracing assembly modeling parabolic primary and hyperbolic secondary reflection geometry. | First-party asset. |
| `asset_star_spectral_photosphere_v2` | `PUBLIC_DOMAIN_NASA_17USC105` | Solar surface convection and coronal loop structures calibrated to NASA SDO AIA/HMI; interior shells from Standard Solar Model. | NASA does not endorse Our Visible Universe Academy. |
| `asset_nebula_orion_m42_volumetric_v2` | `CC_BY_4_0_ESA_WEBB` | Observational spectral emission lines and dust pillar morphology referenced from NASA/ESA/CSA JWST & HST (CC BY 4.0); 3D volume is a model reconstruction. | ESA/Webb, NASA, CSA, and STScI do not endorse Our Visible Universe Academy. |
| `asset_galaxy_catalog_particle_field_v2` | `OPEN_SCIENCE_GAIA_HIPPARCOS` | Stellar population distribution calibrated to ESA Gaia DR3, Hipparcos, and SDSS extragalactic redshift survey parameters. | ESA and the Gaia Collaboration do not endorse Our Visible Universe Academy. |
| `asset_compact_blackhole_kerr_relativity_v2` | `CC_BY_4_0_ESO` | Shadow-to-photon-ring ratio and Doppler beaming referenced from Event Horizon Telescope (EHT) M87* and Sgr A* papers (CC BY 4.0). | The Event Horizon Telescope Collaboration, ESO, and NASA do not endorse Our Visible Universe Academy. |
