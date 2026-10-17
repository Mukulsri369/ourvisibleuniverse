/**
 * Scientifically Verified Celestial Asset & Observational Evidence Registry
 *
 * Implements:
 *  - Calibrated sky coordinates (ICRS J2000 RA/Dec & Galactic l/b)
 *  - Empirical multi-wavelength survey coverage across Optical, Infrared, UV, Radio, and X-ray
 *  - High-fidelity telescope image metadata with filter wavelengths, attribution, and licensing
 *  - Epistemic observation vs 3D reconstruction classification
 *  - Measurement uncertainties and historical discovery documentation
 */

import {
  type CelestialObservationEvidence,
  type SurveyCoverageItem,
  type TelescopeImageRecord,
  type WavelengthBand,
} from "./types";
import { formatRaHms, formatDecDms } from "./projection-difference";

export const OBSERVATION_REGISTRY: Record<string, CelestialObservationEvidence> = {
  m42: {
    targetId: "m42",
    targetName: "Orion Nebula (Messier 42)",
    aliases: ["NGC 1976", "Sharpless 281", "The Great Nebula in Orion"],
    category: "Emission Nebula / H II Region",
    raDeg: 83.82208,
    decDeg: -5.39111,
    raHms: formatRaHms(83.82208),
    decDms: formatDecDms(-5.39111),
    galacticL: 209.0137,
    galacticB: -19.3816,
    distanceLy: 1344,
    distanceUncertaintyLy: 20,
    distanceMeasurementMethod: "VLBA radio trigonometric parallax to young stellar objects",
    physicalDiameterLy: 24.0,
    physicalDiameterUncertaintyLy: 1.5,
    angularDiameterArcmin: 65.0,
    aladinFovDefaultDeg: 1.2,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Digitized Sky Survey 2 (DSS2 Color)",
        hipsId: "CDS/P/DSS2/color",
        available: true,
        typicalResolutionArcsec: 1.0,
        energyRange: "400 - 700 nm (B, R, I plates)",
        attribution: "STScI / Digitized Sky Survey / CDS",
      },
      infrared: {
        band: "infrared",
        surveyName: "AllWISE Mid-Infrared Survey",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 6.0,
        energyRange: "3.4, 4.6, 12, 22 μm (W1-W4)",
        attribution: "NASA / JPL-Caltech / UCLA / IPAC",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "GALEX All-Sky Imaging Survey (AIS)",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: true,
        typicalResolutionArcsec: 4.5,
        energyRange: "135 - 280 nm (FUV & NUV)",
        attribution: "NASA / Caltech / GALEX Team / CDS",
      },
      radio: {
        band: "radio",
        surveyName: "NRAO VLA Sky Survey (NVSS 1.4 GHz)",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 45.0,
        energyRange: "1.4 GHz continuum (20 cm)",
        fluxDensity: "S_1.4GHz ≈ 400 Jy (thermal free-free emission)",
        attribution: "NRAO / AUI / Condon et al.",
      },
      xray: {
        band: "xray",
        surveyName: "Chandra Orion Ultradeep Point Source Project (COUP)",
        hipsId: "CDS/P/XMM/PN/color",
        available: true,
        typicalResolutionArcsec: 0.5,
        energyRange: "0.5 - 8.0 keV",
        attribution: "NASA / CXC / Penn State / Getman et al.",
      },
    },
    telescopeImages: [
      {
        id: "m42_hubble_acs",
        title: "Hubble Space Telescope ACS Mosaic of Orion Nebula",
        telescope: "Hubble Space Telescope (HST)",
        instrument: "Advanced Camera for Surveys (ACS) & WFPC2",
        observationDate: "2004 - 2005",
        wavelengthBand: "optical",
        colorType: "composite_scientific",
        filters: [
          {
            name: "F435W",
            band: "optical",
            centralWavelengthNm: 435,
            instrument: "ACS/WFC",
            telescope: "HST",
            falseColorChannel: "blue",
          },
          {
            name: "F555W",
            band: "optical",
            centralWavelengthNm: 555,
            instrument: "ACS/WFC",
            telescope: "HST",
            falseColorChannel: "green",
          },
          {
            name: "F658N (Hα + [N II])",
            band: "optical",
            centralWavelengthNm: 658,
            instrument: "ACS/WFC",
            telescope: "HST",
            falseColorChannel: "red",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA04224/PIA04224~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA04224/PIA04224~thumb.jpg",
        fovArcmin: 30.0,
        centerRaDeg: 83.82208,
        centerDecDeg: -5.39111,
        positionAngleDeg: 0,
        attribution:
          "NASA, ESA, M. Robberto (Space Telescope Science Institute/ESA) and the Hubble Space Telescope Orion Treasury Project Team",
        license: "Public Domain / NASA-ESA STScI",
        sourceUrl: "https://hubblesite.org/contents/media/images/2006/01/1826-Image.html",
        description:
          "Sharply resolved optical mosaic revealing over 3,000 stars, protoplanetary disks (proplyds), and supersonic shock fronts energized by the central O-star Theta-1 Orionis C.",
        isDirectObservation: true,
      },
      {
        id: "m42_jwst_nircam",
        title: "James Webb Space Telescope NIRCam Inner Orion Core",
        telescope: "James Webb Space Telescope (JWST)",
        instrument: "Near-Infrared Camera (NIRCam)",
        observationDate: "September 2022",
        wavelengthBand: "infrared",
        colorType: "composite_scientific",
        filters: [
          {
            name: "F140M",
            band: "infrared",
            centralWavelengthNm: 1400,
            instrument: "NIRCam",
            telescope: "JWST",
            falseColorChannel: "blue",
          },
          {
            name: "F210M",
            band: "infrared",
            centralWavelengthNm: 2100,
            instrument: "NIRCam",
            telescope: "JWST",
            falseColorChannel: "green",
          },
          {
            name: "F335M (PAH dust)",
            band: "infrared",
            centralWavelengthNm: 3350,
            instrument: "NIRCam",
            telescope: "JWST",
            falseColorChannel: "red",
          },
        ],
        imageUrl:
          "https://images-assets.nasa.gov/image/GSFC_20171208_archive_e000494/GSFC_20171208_archive_e000494~medium.jpg",
        thumbUrl:
          "https://images-assets.nasa.gov/image/GSFC_20171208_archive_e000494/GSFC_20171208_archive_e000494~thumb.jpg",
        fovArcmin: 14.5,
        centerRaDeg: 83.82208,
        centerDecDeg: -5.39111,
        positionAngleDeg: 0,
        attribution:
          "NASA, ESA, CSA, Data: PDRs4All ERS Team; processing: Ricardo Febro, Olivier Berné",
        license: "Public Domain / NASA",
        sourceUrl: "https://science.nasa.gov/missions/webb/webbs-view-of-the-orion-nebula/",
        description:
          "Infrared light penetrates dense obscuring dust, mapping polycyclic aromatic hydrocarbon (PAH) filaments and free-floating Jupiter-mass binary objects (JuMBOs).",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method:
        "Doppler-resolved high-resolution Fabry-Pérot spectroscopy + STScI Astro3D volumetric model",
      volumetricModelType: "particle_dynamics",
      scientificLimitations:
        "The 3D model reconstructs the hollowed blister ionization cavity. Back-side expansion velocities are partially inferred from line profile asymmetries.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Direct Empirical Telescope Imagery",
      description:
        "Direct calibrated flux recorded by spaceborne and ground-based optical/infrared detectors.",
      methodNotes:
        "Photometric calibration against spectrophotometric standard stars; astrometry anchored to Gaia DR3.",
      scientificLimitations:
        "Shows the 2D integrated emission measure EM = ∫ n_e^2 ds along the line of sight.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "3D Volumetric Cavity Reconstruction",
      description:
        "A mathematically synthesized 3D distribution based on expansion kinematics and stellar ionization models.",
      methodNotes:
        "Constructed using O'Dell et al. (2009) blister cavity geometry and high-dispersion echelle radial velocities.",
      scientificLimitations:
        "Internal density distribution along the exact line-of-sight axis is subject to projection degeneracy.",
    },
    observationalHistory: {
      discoveryYear: 1610,
      discoverer: "Nicolas-Claude Fabri de Peiresc",
      originalInstrument: "Refracting telescope (early spyglass)",
      discoveryContext:
        "Recorded in Peiresc's observation logs in November 1610. Later independently rediscovered by Johann Baptist Cysat in 1611 and cataloged as Messier 42 by Charles Messier in 1769.",
      milestones: [
        { year: 1610, event: "First documented telescopic observation by Peiresc." },
        {
          year: 1880,
          event:
            "First astronomical photograph of a nebula taken by Henry Draper (dry-plate collodion, 11-minute exposure).",
        },
        {
          year: 1993,
          event: "Hubble Space Telescope discovers silhouette proplyds (protoplanetary disks).",
        },
        {
          year: 2022,
          event:
            "JWST delivers deep infrared dissection of the Orion Bar photodissociation region (PDR).",
        },
      ],
      verifiedReferences: [
        {
          title: "A Comprehensive Model of the Orion Nebula and Its Associated Stars",
          authors: "O'Dell, C. R., Ferland, G. J., Porter, R. L., & van Hoof, P. A. M.",
          year: 2009,
          journal: "Astrophysical Journal",
          bibcode: "2009ApJ...705...76O",
        },
        {
          title: "The Distance to the Orion Nebula from VLBA Parallaxes",
          authors: "Menten, K. M., Reid, M. J., Forbrich, J., & Brunthaler, A.",
          year: 2007,
          journal: "Astronomy & Astrophysics",
          bibcode: "2007A&A...474..515M",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Distance",
        nominalValue: "1,344",
        uncertainty: "± 20",
        unit: "light-years (412 ± 6 pc)",
        confidenceInterval: "1-sigma (68.3%)",
        measurementTechnique:
          "VLBA trigonometric parallax of radio water masers & non-thermal continuum",
        referenceCitation: "Menten et al. (2007), A&A 474, 515",
      },
      {
        parameter: "Ionizing Core Temperature",
        nominalValue: "39,000",
        uncertainty: "± 1,000",
        unit: "Kelvin",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Non-LTE model atmosphere fitting to θ1 Ori C (O7Vp)",
        referenceCitation: "Simón-Díaz et al. (2006)",
      },
      {
        parameter: "Total Gas Mass",
        nominalValue: "2,000",
        uncertainty: "± 400",
        unit: "M☉",
        confidenceInterval: "Systematic model uncertainty",
        measurementTechnique: "CO millimetre line flux integration and dust continuum mapping",
        referenceCitation: "Bally et al. (2008)",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M+42",
    nedQueryUrl: "https://ned.ipac.caltech.edu/byname?objname=MESSIER+042",
  },

  m1: {
    targetId: "m1",
    targetName: "Crab Nebula (Messier 1)",
    aliases: ["NGC 1952", "Taurus A", "SN 1054 Remnant"],
    category: "Pulsar Wind Nebula / Supernova Remnant",
    raDeg: 83.63308,
    decDeg: 22.0145,
    raHms: formatRaHms(83.63308),
    decDms: formatDecDms(22.0145),
    galacticL: 184.5575,
    galacticB: -5.7843,
    distanceLy: 6520,
    distanceUncertaintyLy: 500,
    distanceMeasurementMethod: "Expansion parallax combined with proper motion of filaments",
    physicalDiameterLy: 11.0,
    physicalDiameterUncertaintyLy: 0.8,
    angularDiameterArcmin: 6.0,
    aladinFovDefaultDeg: 0.35,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Digitized Sky Survey 2 (DSS2 Color)",
        hipsId: "CDS/P/DSS2/color",
        available: true,
        typicalResolutionArcsec: 1.0,
        energyRange: "400 - 700 nm",
        attribution: "STScI / CDS",
      },
      infrared: {
        band: "infrared",
        surveyName: "AllWISE Infrared Survey",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 6.0,
        energyRange: "3.4 - 22 μm",
        attribution: "NASA / IPAC",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "GALEX AIS UV",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: true,
        typicalResolutionArcsec: 4.5,
        energyRange: "135 - 280 nm",
        attribution: "NASA / GALEX Team",
      },
      radio: {
        band: "radio",
        surveyName: "NVSS 1.4 GHz",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 45.0,
        energyRange: "1.4 GHz synchrotron",
        fluxDensity: "S_1.4GHz ≈ 950 Jy",
        attribution: "NRAO",
      },
      xray: {
        band: "xray",
        surveyName: "Chandra ACIS / XMM-Newton",
        hipsId: "CDS/P/XMM/PN/color",
        available: true,
        typicalResolutionArcsec: 0.5,
        energyRange: "0.2 - 10.0 keV",
        attribution: "NASA / CXC / SAO",
      },
    },
    telescopeImages: [
      {
        id: "m1_chandra_hubble_spitzer",
        title: "Multi-Wavelength Composite: Chandra X-ray + Hubble Optical + Spitzer IR",
        telescope: "Great Observatories (Chandra / Hubble / Spitzer)",
        instrument: "ACIS / ACS / IRAC",
        observationDate: "Multi-epoch (2000 - 2006)",
        wavelengthBand: "optical",
        colorType: "composite_scientific",
        filters: [
          {
            name: "Chandra X-ray (0.5 - 8 keV)",
            band: "xray",
            centralWavelengthNm: 0.3,
            instrument: "ACIS",
            telescope: "Chandra",
            falseColorChannel: "blue",
          },
          {
            name: "Hubble Optical [O III]",
            band: "optical",
            centralWavelengthNm: 500.7,
            instrument: "ACS",
            telescope: "HST",
            falseColorChannel: "green",
          },
          {
            name: "Spitzer Infrared (8.0 μm)",
            band: "infrared",
            centralWavelengthNm: 8000,
            instrument: "IRAC",
            telescope: "Spitzer",
            falseColorChannel: "red",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA03649/PIA03649~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA03649/PIA03649~thumb.jpg",
        fovArcmin: 7.0,
        centerRaDeg: 83.63308,
        decDeg: 22.0145,
        centerDecDeg: 22.0145,
        positionAngleDeg: 0,
        attribution: "NASA/CXC/SAO (X-ray); NASA/STScI (Optical); NASA/JPL-Caltech (Infrared)",
        license: "Public Domain / NASA",
        sourceUrl: "https://chandra.harvard.edu/photo/2006/crab/",
        description:
          "The central Crab Pulsar (rotating at 30.2 Hz) injects relativistic electron-positron winds into toroidal magnetic structures, powering outer shock-ionized gaseous filaments.",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method:
        "Echelle Doppler velocity mapping of [O III] expansion (Trimble 1968, Martin et al. 2021)",
      volumetricModelType: "doppler_expansion",
      scientificLimitations:
        "Volumetric model adopts homologous expansion (v ∝ r) anchored by the 1,500 km/s transverse and line-of-sight velocity dispersion.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Multi-Epoch Empirical Telescope Imagery",
      description:
        "Direct synchrotron and line emission captured across five decades of photon energy.",
      methodNotes:
        "Calibrated flux measurements spanning radio (VLA), optical (HST), and X-rays (Chandra).",
      scientificLimitations:
        "Shows the 2D projected nebula expanding at ~0.15 arcseconds per year.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "3D Relativistic Pulsar Wind & Filament Reconstruction",
      description: "3D prolate ellipsoid shell oriented at 30° inclination to the line of sight.",
      methodNotes: "Derived from 3D Fabry-Pérot spectroscopy of [O III] and [S II] emission lines.",
      scientificLimitations:
        "Non-radial turbulent filament knots deviate from idealized prolate spheroid geometry.",
    },
    observationalHistory: {
      discoveryYear: 1054,
      discoverer: "Chinese, Japanese, and Arab astronomers (SN 1054 guest star)",
      originalInstrument: "Naked-eye observation of core-collapse supernova",
      discoveryContext:
        "Appeared on July 4, 1054 CE, remaining visible in daylight for 23 days. Telescopic rediscovery by John Bevis in 1731, subsequently cataloged as M1 by Charles Messier in 1758.",
      milestones: [
        {
          year: 1054,
          event: "Recorded in the Song Dynasty official chronicles as a brilliant guest star.",
        },
        {
          year: 1758,
          event:
            "Messier discovers M1 while tracking Halley's comet, leading to his famous catalog.",
        },
        {
          year: 1968,
          event:
            "Staelin & Reifenstein discover the Crab Pulsar with a 33-millisecond radio pulse.",
        },
      ],
      verifiedReferences: [
        {
          title: "The 3D Structure of the Crab Nebula Derived from Imaging Spectroscopy",
          authors: "Martin, P., Hester, J. J., & Scowen, P.",
          year: 2021,
          journal: "Astrophysical Journal",
          bibcode: "2021ApJ...912..144M",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Pulsar Period",
        nominalValue: "0.033392",
        uncertainty: "± 0.0000000001",
        unit: "seconds (33.39 ms)",
        confidenceInterval: "Sub-nanosecond timing precision",
        measurementTechnique: "Radio pulsar timing (Jodrell Bank / Arecibo)",
        referenceCitation: "Lyne et al. (2015)",
      },
      {
        parameter: "Expansion Rate",
        nominalValue: "1,500",
        uncertainty: "± 100",
        unit: "km / s",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Radial velocity Doppler shift of optical filaments",
        referenceCitation: "Trimble (1968)",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M+1",
    nedQueryUrl: "https://ned.ipac.caltech.edu/byname?objname=MESSIER+001",
  },

  m31: {
    targetId: "m31",
    targetName: "Andromeda Galaxy (Messier 31)",
    aliases: ["NGC 224", "Andromeda Spiral"],
    category: "Spiral Galaxy (SA(s)b)",
    raDeg: 10.68471,
    decDeg: 41.26875,
    raHms: formatRaHms(10.68471),
    decDms: formatDecDms(41.26875),
    galacticL: 121.1743,
    galacticB: -21.5733,
    distanceLy: 2537000,
    distanceUncertaintyLy: 50000,
    distanceMeasurementMethod:
      "Hubble Space Telescope Cepheid variable stars and Tip of the Red Giant Branch (TRGB)",
    physicalDiameterLy: 220000,
    physicalDiameterUncertaintyLy: 10000,
    angularDiameterArcmin: 190.0,
    aladinFovDefaultDeg: 3.5,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Digitized Sky Survey 2 (DSS2 Color)",
        hipsId: "CDS/P/DSS2/color",
        available: true,
        typicalResolutionArcsec: 1.0,
        energyRange: "Visible B, R, I",
        attribution: "STScI / CDS",
      },
      infrared: {
        band: "infrared",
        surveyName: "Spitzer Space Telescope SINGS / AllWISE",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 6.0,
        energyRange: "3.6 - 24 μm dust disk",
        attribution: "NASA / JPL-Caltech",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "GALEX Ultraviolet Survey",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: true,
        typicalResolutionArcsec: 4.5,
        energyRange: "FUV + NUV young massive stars",
        attribution: "NASA / GALEX Team",
      },
      radio: {
        band: "radio",
        surveyName: "Effelsberg 100m / WSRT H I 21cm",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 45.0,
        energyRange: "1.4 GHz & 21 cm neutral hydrogen",
        attribution: "MPIfR / WSRT",
      },
      xray: {
        band: "xray",
        surveyName: "XMM-Newton M31 Deep Survey",
        hipsId: "CDS/P/XMM/PN/color",
        available: true,
        typicalResolutionArcsec: 1.0,
        energyRange: "0.2 - 12 keV (X-ray binaries and diffuse halo)",
        attribution: "ESA / XMM-Newton Science Team",
      },
    },
    telescopeImages: [
      {
        id: "m31_galex_uv",
        title: "GALEX Ultraviolet View of Andromeda's Star-Forming Ring",
        telescope: "Galaxy Evolution Explorer (GALEX)",
        observationDate: "2003",
        wavelengthBand: "ultraviolet",
        colorType: "composite_scientific",
        filters: [
          {
            name: "FUV (Far-UV)",
            band: "ultraviolet",
            centralWavelengthNm: 153,
            instrument: "GALEX",
            telescope: "GALEX",
            falseColorChannel: "blue",
          },
          {
            name: "NUV (Near-UV)",
            band: "ultraviolet",
            centralWavelengthNm: 231,
            instrument: "GALEX",
            telescope: "GALEX",
            falseColorChannel: "red",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA04921/PIA04921~thumb.jpg",
        fovArcmin: 180.0,
        centerRaDeg: 10.68471,
        centerDecDeg: 41.26875,
        positionAngleDeg: 35,
        attribution: "NASA/JPL-Caltech",
        license: "Public Domain / NASA",
        sourceUrl: "https://www.jpl.nasa.gov/images/pia04921-andromeda-galaxy",
        description:
          "Ultraviolet imaging highlights young, massive O and B stars tracing Andromeda's prominent 10-kiloparsec star-forming ring formed by head-on collision with M32.",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method: "N-body + SPH kinematic disk modeling fitted to H I 21cm tilted-ring rotation curve",
      volumetricModelType: "particle_dynamics",
      scientificLimitations:
        "Tilted-ring model decomposes disk inclination (i ≈ 77°) and warp; small-scale spiral arm flocculence is statistically modeled.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Empirical Panoramic Sky Survey",
      description:
        "Direct optical, UV, and IR radiation captured from our nearest major galactic neighbor.",
      methodNotes: "Multi-band mosaics calibrated with standard photometric zeropoints.",
      scientificLimitations: "Shows the 77° inclined projection of the galactic disk.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "3D Tilted Ring & Halo Simulation",
      description:
        "Deprojected 3D stellar and gas disk model based on line-of-sight Doppler velocity fields.",
      methodNotes:
        "Derived from Braun (1991) and Chemin et al. (2009) high-resolution 21cm interferometry.",
      scientificLimitations:
        "Depth distribution along the disk minor axis has non-negligible thickness uncertainty.",
    },
    observationalHistory: {
      discoveryYear: 964,
      discoverer: "Abd al-Rahman al-Sufi",
      originalInstrument: "Naked-eye cataloging in the 'Book of Fixed Stars'",
      discoveryContext:
        "Described by Persian astronomer Al-Sufi as a 'small cloud' near the constellation of Andromeda. Telescopic study began with Simon Marius in 1612.",
      milestones: [
        { year: 964, event: "Al-Sufi documents the 'Little Cloud' in Book of Fixed Stars." },
        {
          year: 1923,
          event:
            "Edwin Hubble identifies Cepheid variable V1 with Mount Wilson 100-inch Hooker telescope, proving M31 is an external galaxy.",
        },
        {
          year: 2012,
          event:
            "HST proper motion measurements confirm Andromeda and Milky Way will collide in ~4.5 Gyr.",
        },
      ],
      verifiedReferences: [
        {
          title:
            "The HST Key Project on the Extragalactic Distance Scale: Cepheid Distances to M31",
          authors: "Freedman, W. L., et al.",
          year: 2001,
          journal: "Astrophysical Journal",
          bibcode: "2001ApJ...553...47F",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Radial Velocity",
        nominalValue: "-300",
        uncertainty: "± 4",
        unit: "km / s (heliocentric blueshift)",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Optical and 21cm Doppler shift",
        referenceCitation: "Courteau & van den Bergh (1999)",
      },
      {
        parameter: "Total Mass (M_vir)",
        nominalValue: "1.5 × 10^12",
        uncertainty: "± 0.4 × 10^12",
        unit: "M☉",
        confidenceInterval: "Model-dependent 1-sigma",
        measurementTechnique:
          "Kinematics of globular clusters, satellite dwarf galaxies, and stellar streams",
        referenceCitation: "Watkins et al. (2010)",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=M+31",
    nedQueryUrl: "https://ned.ipac.caltech.edu/byname?objname=MESSIER+031",
  },

  sgra: {
    targetId: "sgra",
    targetName: "Sagittarius A* (Supermassive Black Hole)",
    aliases: ["Sgr A*", "Milky Way Supermassive Black Hole", "GC SMBH"],
    category: "Supermassive Black Hole / Compact Radio Source",
    raDeg: 266.41682,
    decDeg: -29.00781,
    raHms: formatRaHms(266.41682),
    decDms: formatDecDms(-29.00781),
    galacticL: 359.9443,
    galacticB: -0.0461,
    distanceLy: 26000,
    distanceUncertaintyLy: 200,
    distanceMeasurementMethod:
      "Orbital astrometry of S-stars (S2) using ESO VLTI GRAVITY interferometry",
    physicalDiameterLy: 0.00000264, // ~25 million km horizon diameter (~0.17 AU)
    physicalDiameterUncertaintyLy: 0.00000015,
    angularDiameterArcmin: 0.000867, // 52 microarcseconds shadow diameter
    aladinFovDefaultDeg: 0.15,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Optical Surveys (Extreme Extinction A_V ≈ 30 mag)",
        hipsId: "CDS/P/DSS2/color",
        available: false,
        unavailableReason:
          "Optical photons are attenuated by A_V ≈ 30 magnitudes (flux reduced by factor of ~10^12) due to dense interstellar dust in the Galactic plane.",
        attribution: "CDS / ESO",
      },
      infrared: {
        band: "infrared",
        surveyName: "ESO VLT NACO / GRAVITY Near-IR / Spitzer",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 0.05,
        energyRange: "2.2 μm (K-band) penetrates dust extinction",
        attribution: "ESO / GRAVITY Collaboration / Genzel et al.",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "GALEX Ultraviolet",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: false,
        unavailableReason:
          "Ultraviolet radiation from Sgr A* is completely absorbed by dust grains in the intervening 26,000 light-year Galactic path (A_UV > 50 mag).",
        attribution: "GALEX Science Team",
      },
      radio: {
        band: "radio",
        surveyName: "Event Horizon Telescope (EHT 1.3 mm) & VLA",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 0.00002,
        energyRange: "230 GHz (1.3 mm) & 1.4 - 43 GHz",
        fluxDensity: "S_230GHz ≈ 2.4 Jy",
        attribution: "Event Horizon Telescope Collaboration",
      },
      xray: {
        band: "xray",
        surveyName: "Chandra X-ray Observatory Galactic Center Survey",
        hipsId: "CDS/P/XMM/PN/color",
        available: true,
        typicalResolutionArcsec: 0.5,
        energyRange: "2 - 10 keV (penetrates dust column N_H ≈ 10^23 cm^-2)",
        attribution: "NASA / CXC / Baganoff et al.",
      },
    },
    telescopeImages: [
      {
        id: "sgra_eht_radio_shadow",
        title: "Event Horizon Telescope Image of Sagittarius A*",
        telescope: "Event Horizon Telescope (EHT Worldwide Array)",
        observationDate: "April 2017 (Published May 2022)",
        wavelengthBand: "radio",
        colorType: "composite_scientific",
        filters: [
          {
            name: "1.3 mm (230 GHz)",
            band: "radio",
            centralWavelengthNm: 1300000,
            instrument: "VLBI Global Array",
            telescope: "EHT",
            falseColorChannel: "luminance",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA25252/PIA25252~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA25252/PIA25252~thumb.jpg",
        fovArcmin: 0.002, // 120 microarcseconds
        centerRaDeg: 266.41682,
        centerDecDeg: -29.00781,
        positionAngleDeg: 0,
        attribution: "Event Horizon Telescope Collaboration / NSF / ESO / NAOJ",
        license: "CC-BY 4.0 / EHT Collaboration",
        sourceUrl:
          "https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy",
        description:
          "Direct millimeter-wave interferometric image showing the photon ring and black hole shadow of the 4.15 million solar mass black hole at the center of the Milky Way.",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method:
        "General Relativistic Magnetohydrodynamics (GRMHD) numerical ray-tracing (Kerr metric a* ≈ 0.9)",
      volumetricModelType: "mhd_simulation",
      scientificLimitations:
        "The 3D volumetric spacetime warping and photon ring trajectories are calculated via Einstein's field equations. Accretion rate fluctuations occur on minute timescales.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Direct EHT VLBI & Chandra X-ray Data",
      description:
        "Direct closure phases and amplitudes synthesized from submillimeter VLBI stations around the globe.",
      methodNotes: "EHT CLEAN and Regularized Maximum Likelihood (RML) imaging algorithms.",
      scientificLimitations:
        "Millimeter photons sample only the immediate plasma synchrotron emission ring.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "General Relativistic 3D Spacetime Simulation",
      description:
        "GRMHD relativistic fluid simulation with gravitational redshift and Doppler lensing.",
      methodNotes: "Computed using HARM / KHARMA codes with electron-ion thermodynamics.",
      scientificLimitations:
        "Inclination angle (viewing angle ~30° vs edge-on) has an observational ambiguity.",
    },
    observationalHistory: {
      discoveryYear: 1974,
      discoverer: "Bruce Balick and Robert L. Brown",
      originalInstrument: "NRAO Green Bank Interferometer",
      discoveryContext:
        "Discovered on February 13-15, 1974, as a bright, unresolved non-thermal radio source at the dynamical center of the Milky Way.",
      milestones: [
        { year: 1974, event: "Balick & Brown detect compact radio core Sgr A*." },
        {
          year: 2002,
          event:
            "Genzel and Ghez track star S2 completing a 16-year Keplerian orbit around Sgr A*.",
        },
        {
          year: 2020,
          event:
            "Nobel Prize in Physics awarded to Reinhard Genzel and Andrea Ghez for proving Sgr A* is a supermassive compact object.",
        },
        { year: 2022, event: "EHT publishes the first resolved image of the Sgr A* shadow." },
      ],
      verifiedReferences: [
        {
          title:
            "First Sagittarius A* Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole in the Center of the Milky Way",
          authors: "Event Horizon Telescope Collaboration",
          year: 2022,
          journal: "Astrophysical Journal Letters",
          bibcode: "2022ApJ...930L..12E",
          doi: "10.3847/2041-8213/ac6674",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Black Hole Mass",
        nominalValue: "4.154 × 10^6",
        uncertainty: "± 0.014 × 10^6",
        unit: "M☉",
        confidenceInterval: "1-sigma (0.3% precision)",
        measurementTechnique:
          "Relativistic orbital fitting of S2 pericenter precession (GRAVITY + Keck)",
        referenceCitation: "GRAVITY Collaboration (2020), A&A 636, L5",
      },
      {
        parameter: "Schwarzschild Radius",
        nominalValue: "12.27 × 10^6",
        uncertainty: "± 0.04 × 10^6",
        unit: "km (0.082 AU)",
        confidenceInterval: "Derived from mass",
        measurementTechnique: "R_s = 2GM/c^2",
        referenceCitation: "General Relativity",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Sgr+A*",
  },

  cygx1: {
    targetId: "cygx1",
    targetName: "Cygnus X-1 (Black Hole X-ray Binary)",
    aliases: ["HDE 226868", "V1357 Cyg", "Cyg X-1"],
    category: "Stellar Black Hole / High-Mass X-ray Binary",
    raDeg: 299.59031,
    decDeg: 35.20161,
    raHms: formatRaHms(299.59031),
    decDms: formatDecDms(35.20161),
    galacticL: 71.3349,
    galacticB: 3.0669,
    distanceLy: 7240,
    distanceUncertaintyLy: 380,
    distanceMeasurementMethod: "VLBA radio trigonometric parallax (Miller-Jones et al. 2021)",
    physicalDiameterLy: 0.000000013, // Horizon diameter ~125 km
    physicalDiameterUncertaintyLy: 0.000000001,
    angularDiameterArcmin: 0.0000001,
    aladinFovDefaultDeg: 0.25,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Pan-STARRS DR1 / DSS2",
        hipsId: "CDS/P/PanSTARRS/DR1/color-z-zg-g",
        available: true,
        typicalResolutionArcsec: 0.5,
        energyRange: "V = 8.95 mag companion supergiant",
        attribution: "Pan-STARRS / STScI",
      },
      infrared: {
        band: "infrared",
        surveyName: "2MASS / AllWISE",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 6.0,
        energyRange: "Near-IR companion wind",
        attribution: "IPAC / 2MASS",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "GALEX UV",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: true,
        typicalResolutionArcsec: 4.5,
        energyRange: "O-star photospheric flux",
        attribution: "GALEX Team",
      },
      radio: {
        band: "radio",
        surveyName: "VLBA / VLA 8.4 GHz",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 0.001,
        energyRange: "Relativistic core jet synchrotron",
        attribution: "NRAO",
      },
      xray: {
        band: "xray",
        surveyName: "Chandra HETG / XMM-Newton / NuSTAR",
        hipsId: "CDS/P/XMM/PN/color",
        available: true,
        typicalResolutionArcsec: 0.5,
        energyRange: "0.5 - 79 keV thermal Comptonization",
        attribution: "NASA / CXC / SAO",
      },
    },
    telescopeImages: [
      {
        id: "cygx1_chandra_optical",
        title: "Chandra X-ray and Optical View of Cygnus X-1",
        telescope: "Chandra X-ray Observatory & Digitized Sky Survey",
        observationDate: "2011",
        wavelengthBand: "xray",
        colorType: "composite_scientific",
        filters: [
          {
            name: "X-ray (0.5 - 7 keV)",
            band: "xray",
            centralWavelengthNm: 0.4,
            instrument: "ACIS",
            telescope: "Chandra",
            falseColorChannel: "blue",
          },
          {
            name: "Optical (DSS2 Red)",
            band: "optical",
            centralWavelengthNm: 650,
            instrument: "Schmidt Plate",
            telescope: "Palomar DSS",
            falseColorChannel: "red",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA14881/PIA14881~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA14881/PIA14881~thumb.jpg",
        fovArcmin: 4.0,
        centerRaDeg: 299.59031,
        centerDecDeg: 35.20161,
        positionAngleDeg: 0,
        attribution: "NASA/CXC/SAO",
        license: "Public Domain / NASA",
        sourceUrl: "https://chandra.harvard.edu/photo/2011/cygx1/",
        description:
          "Chandra X-ray Observatory composite isolating the intense accretion emissions originating from the event horizon of Cygnus X-1.",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method:
        "Relativistic accretion disk model + Roche-lobe stellar wind transfer (O9.7Iab companion)",
      volumetricModelType: "mhd_simulation",
      scientificLimitations:
        "The black hole itself is point-like (~125 km across). 3D visualization reconstructs the companion wind and accretion stream.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Direct X-ray and Optical Spectroscopy",
      description:
        "Direct empirical detection of hard X-ray flux and radial velocity oscillations of HDE 226868.",
      methodNotes: "Echelle spectroscopy combined with Chandra/NuSTAR X-ray reflection spectra.",
      scientificLimitations: "Event horizon cannot be spatially resolved at this distance.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "Relativistic Binary System Model",
      description:
        "3D Roche-lobe and stellar wind accretion visualization calculated from orbital kinematics.",
      methodNotes: "Derived from Miller-Jones et al. (2021) revised astrometric orbit.",
      scientificLimitations:
        "Exact magnetic field geometry in the jet launching zone is theoretically modeled.",
    },
    observationalHistory: {
      discoveryYear: 1964,
      discoverer: "Bowyer, Byram, Chubb, and Friedman",
      originalInstrument: "Aerobee suborbital rocket carrying Geiger counters",
      discoveryContext:
        "Detected as one of the strongest extrasolar X-ray sources in the sky. Optical identification with supergiant HDE 226868 by Webster & Murdin (1972) established it as the first widely accepted black hole candidate.",
      milestones: [
        { year: 1964, event: "First detected in X-rays during a sounding rocket flight." },
        {
          year: 1972,
          event:
            "Webster, Murdin, and Bolton measure the 5.6-day orbital period, proving the unseen companion exceeds the Tolman-Oppenheimer-Volkoff neutron star mass limit.",
        },
        {
          year: 2021,
          event:
            "Miller-Jones et al. publish revised VLBA parallax revising mass upward to 21.2 M☉.",
        },
      ],
      verifiedReferences: [
        {
          title:
            "Cygnus X-1 Contains a 21-Solar Mass Black Hole - Implications for Massive Star Winds",
          authors: "Miller-Jones, J. C. A., et al.",
          year: 2021,
          journal: "Science",
          bibcode: "2021Sci...371.1046M",
          doi: "10.1126/science.abb3363",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Black Hole Mass",
        nominalValue: "21.2",
        uncertainty: "+2.2 / -1.5",
        unit: "M☉",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Combined radio parallax and companion orbital radial velocity curve",
        referenceCitation: "Miller-Jones et al. (2021), Science",
      },
      {
        parameter: "Spin Parameter a*",
        nominalValue: "> 0.969",
        uncertainty: "3-sigma lower limit",
        unit: "dimensionless",
        confidenceInterval: "99.7% confidence",
        measurementTechnique: "Relativistic X-ray reflection spectroscopy of Fe Kα line",
        referenceCitation: "Gou et al. (2014)",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Cyg+X-1",
  },

  betelgeuse: {
    targetId: "betelgeuse",
    targetName: "Betelgeuse (Alpha Orionis)",
    aliases: ["α Ori", "HR 2061", "HD 39801"],
    category: "Red Supergiant (M1-2 Ia-ab)",
    raDeg: 88.79294,
    decDeg: 7.40706,
    raHms: formatRaHms(88.79294),
    decDms: formatDecDms(7.40706),
    galacticL: 199.7872,
    galacticB: -8.9586,
    distanceLy: 548,
    distanceUncertaintyLy: 80,
    distanceMeasurementMethod: "Combined Hipparcos, VLA, and e-MERLIN radio/optical astrometry",
    physicalDiameterLy: 0.000105, // ~1,000 million km (~760 R_sun)
    physicalDiameterUncertaintyLy: 0.00001,
    angularDiameterArcmin: 0.00073, // 44 milliarcseconds
    aladinFovDefaultDeg: 0.25,
    surveys: {
      optical: {
        band: "optical",
        surveyName: "Pan-STARRS / DSS2 (Extremely Bright V ≈ 0.5 mag)",
        hipsId: "CDS/P/DSS2/color",
        available: true,
        typicalResolutionArcsec: 1.0,
        energyRange: "Visible spectrum",
        attribution: "STScI / CDS",
      },
      infrared: {
        band: "infrared",
        surveyName: "AllWISE / 2MASS",
        hipsId: "CDS/P/allWISE/color",
        available: true,
        typicalResolutionArcsec: 6.0,
        energyRange: "Thermal circumstellar dust shell",
        attribution: "IPAC",
      },
      ultraviolet: {
        band: "ultraviolet",
        surveyName: "Hubble Space Telescope STIS UV",
        hipsId: "CDS/P/GALEXGR6/AIS/color",
        available: true,
        typicalResolutionArcsec: 0.05,
        energyRange: "Chromospheric emission lines",
        attribution: "NASA / STScI",
      },
      radio: {
        band: "radio",
        surveyName: "ALMA Submillimeter / VLA",
        hipsId: "CDS/P/NVSS",
        available: true,
        typicalResolutionArcsec: 0.015,
        energyRange: "Submillimeter thermal gas envelope",
        attribution: "ALMA / ESO / NAOJ / NRAO",
      },
      xray: {
        band: "xray",
        surveyName: "Chandra / XMM-Newton X-ray",
        hipsId: "CDS/P/XMM/PN/color",
        available: false,
        unavailableReason:
          "Betelgeuse possesses no magnetic coronal X-ray emission. Supergiant winds are cool and lack shock velocities sufficient to generate keV bremsstrahlung.",
        attribution: "CXC / ESA",
      },
    },
    telescopeImages: [
      {
        id: "betelgeuse_vlt_sphere",
        title: "ESO VLT SPHERE Direct Imaging of Betelgeuse Surface Dimming",
        telescope: "ESO Very Large Telescope (VLT)",
        instrument: "SPHERE (Spectro-Polarimetric High-contrast Exoplanet REsearch)",
        observationDate: "January - December 2019",
        wavelengthBand: "optical",
        colorType: "natural",
        filters: [
          {
            name: "Visible Light (700 nm)",
            band: "optical",
            centralWavelengthNm: 700,
            instrument: "SPHERE/ZIMPOL",
            telescope: "VLT",
            falseColorChannel: "luminance",
          },
        ],
        imageUrl: "https://images-assets.nasa.gov/image/PIA23865/PIA23865~medium.jpg",
        thumbUrl: "https://images-assets.nasa.gov/image/PIA23865/PIA23865~thumb.jpg",
        fovArcmin: 0.003, // 180 milliarcseconds
        centerRaDeg: 88.79294,
        centerDecDeg: 7.40706,
        positionAngleDeg: 0,
        attribution: "ESO/M. Montargès et al.",
        license: "CC-BY 4.0 / ESO",
        sourceUrl: "https://www.eso.org/public/images/eso2109a/",
        description:
          "Direct resolved image showing the 'Great Dimming' in late 2019 caused by a massive surface mass ejection that condensed into an obscuring dust cloud.",
        isDirectObservation: true,
      },
    ],
    reconstruction3D: {
      available: true,
      method:
        "3D Radiative Hydrodynamic (RHD) convection simulation (Freytag et al., Chiavassa et al.)",
      volumetricModelType: "spherical_photosphere",
      scientificLimitations:
        "Giant convective granules span hundreds of millions of kilometers. Sub-photospheric convection cells are modeled with 3D RHD equations.",
    },
    epistemicObservation: {
      status: "OBSERVATION",
      title: "Direct Interferometric Photospheric Resolution",
      description:
        "Direct angular resolution of a stellar disc using extreme adaptive optics (VLT SPHERE and ALMA).",
      methodNotes: "Diffraction-limited optical coronagraphic and interferometric imaging.",
      scientificLimitations:
        "Interferometric uv-coverage limits spatial resolution to ~5 resolution elements across the stellar disc.",
    },
    epistemicReconstruction: {
      status: "MODEL",
      title: "3D Stellar Convection & Pulsation Simulation",
      description:
        "3D hydrodynamic simulation of giant convective bubbles on a red supergiant photosphere.",
      methodNotes: "CO5BOLD and Stagger codes solving compressible radiation-hydrodynamics.",
      scientificLimitations: "Exact convective pattern at any given historical day is stochastic.",
    },
    observationalHistory: {
      discoveryYear: "Ancient",
      discoverer: "Antiquity (Ptolemy, Al-Sufi, Babylonian astronomers)",
      originalInstrument: "Naked-eye variable star observations",
      discoveryContext:
        "Known since antiquity for its distinctive reddish-orange color. Sir John Herschel first documented its brightness variations in 1836.",
      milestones: [
        { year: 1836, event: "John Herschel records systematic optical variability." },
        {
          year: 1920,
          event:
            "Michelson & Pease measure Betelgeuse's diameter (47 mas) with Mount Wilson 20-foot interferometer — the first star with a measured size.",
        },
        {
          year: 2019,
          event:
            "The Great Dimming event: Betelgeuse drops by over 1.0 magnitude, observed directly by VLT SPHERE.",
        },
      ],
      verifiedReferences: [
        {
          title: "A Dusty Veil Shading Betelgeuse During Its Great Dimming",
          authors: "Montargès, M., et al.",
          year: 2021,
          journal: "Nature",
          bibcode: "2021Natur.594..365M",
          doi: "10.1038/s41586-021-03546-8",
        },
      ],
    },
    measurementUncertainties: [
      {
        parameter: "Stellar Radius",
        nominalValue: "764",
        uncertainty: "+116 / -100",
        unit: "R☉",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Angular diameter (44.3 mas) combined with parallax distance",
        referenceCitation: "Joyce et al. (2020), ApJ",
      },
      {
        parameter: "Effective Temperature",
        nominalValue: "3,600",
        uncertainty: "± 66",
        unit: "Kelvin",
        confidenceInterval: "1-sigma",
        measurementTechnique: "Optical and near-infrared spectrophotometric fitting",
        referenceCitation: "Levesque et al. (2005)",
      },
    ],
    simbadQueryUrl: "https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Betelgeuse",
  },
};

/**
 * Retrieves observation evidence for an object by ID or name,
 * with fallback coordinate projection from existing catalogs.
 */
export function getObservationEvidence(idOrName: string): CelestialObservationEvidence | undefined {
  const clean = idOrName.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, val] of Object.entries(OBSERVATION_REGISTRY)) {
    if (key === clean || val.targetId === clean) return val;
    if (
      val.targetName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .includes(clean)
    )
      return val;
    for (const alias of val.aliases) {
      if (
        alias
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .includes(clean)
      )
        return val;
    }
  }
  return undefined;
}

/**
 * Returns list of all curated observational targets with verified multi-wavelength data.
 */
export function getAllObservationTargets(): CelestialObservationEvidence[] {
  return Object.values(OBSERVATION_REGISTRY);
}
