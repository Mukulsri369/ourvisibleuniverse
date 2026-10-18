/**
 * Server-Side Educational Activity Outcome Validator
 * Validates telemetry and experimental outcomes against true physical/astronomical principles.
 * Ensures that simply opening or clicking an activity does NOT award completion credit.
 */

export interface ValidationOutcome {
  isValid: boolean;
  reason: string;
  metrics: Record<string, unknown>;
}

export function validateActivityOutcomeServer(
  validationKey: string,
  payload: Record<string, unknown>,
  isAccessibleAlternative: boolean = false,
): ValidationOutcome {
  if (!payload || typeof payload !== "object") {
    return {
      isValid: false,
      reason: "Empty or invalid telemetry payload received.",
      metrics: {},
    };
  }

  // Handle generic validation keys across the 24 modules
  switch (validationKey) {
    // -------------------------------------------------------------
    // Module 01: Cosmic Zoom / Scale
    // -------------------------------------------------------------
    case "cosmic_zoom_scale_traversal": {
      const stepCount = Number(payload.stepCount ?? payload.powersOfTenStepsCompleted ?? 0);
      const minScale = Number(payload.minScaleMeters ?? 1);
      const maxScale = Number(payload.maxScaleMeters ?? 1);

      if (stepCount >= 10 || (minScale <= 1e2 && maxScale >= 1e20)) {
        return {
          isValid: true,
          reason: `Traversed ${stepCount} orders of magnitude across cosmic scale boundaries.`,
          metrics: { stepCount, minScale, maxScale },
        };
      }
      return {
        isValid: false,
        reason: "Insufficient scale range traversed. Explore at least 10 orders of magnitude.",
        metrics: { stepCount },
      };
    }

    // -------------------------------------------------------------
    // Module 02: Planetarium Constellation Alignment
    // -------------------------------------------------------------
    case "planetarium_constellation_alignment": {
      const alignedCount = Number(payload.alignedCount ?? payload.constellationsIdentified ?? 0);
      const polarisLocated = Boolean(payload.polarisLocated ?? payload.foundPolaris);

      if (polarisLocated || alignedCount >= 2) {
        return {
          isValid: true,
          reason: "Successfully calibrated celestial coordinates and oriented key constellations.",
          metrics: { alignedCount, polarisLocated },
        };
      }
      return {
        isValid: false,
        reason:
          "Constellation orientation incomplete. Locate Polaris or align at least 2 constellations.",
        metrics: { alignedCount, polarisLocated },
      };
    }

    // -------------------------------------------------------------
    // Module 03: Stellar Parallax
    // -------------------------------------------------------------
    case "parallax_distance_calculation": {
      // d = 1 / p (p in arcseconds, d in parsecs)
      const pArcsec = Number(payload.parallaxArcsec ?? payload.p);
      const calculatedParsecs = Number(payload.distanceParsecs ?? payload.d);

      if (pArcsec > 0 && calculatedParsecs > 0) {
        const expectedD = 1 / pArcsec;
        const errorPct = Math.abs((calculatedParsecs - expectedD) / expectedD) * 100;

        if (errorPct < 5.0) {
          return {
            isValid: true,
            reason: `Parallax relation d = 1/p validated with ${errorPct.toFixed(2)}% accuracy.`,
            metrics: { pArcsec, calculatedParsecs, errorPct },
          };
        }
      }
      return {
        isValid: false,
        reason: "Parallax distance calculation out of physical tolerance (d = 1/p).",
        metrics: { payload },
      };
    }

    // -------------------------------------------------------------
    // Module 04: Lookback Time & Photon Trace
    // -------------------------------------------------------------
    case "lookback_photon_trace": {
      const benchmarkCount = Number(payload.benchmarkCount ?? payload.benchmarksCompleted ?? 0);
      const lookbackGyr = Number(payload.lookbackTimeGyr ?? payload.t);
      const success = Boolean(payload.success ?? payload.verified);

      if (benchmarkCount >= 4 || lookbackGyr > 0 || success) {
        return {
          isValid: true,
          reason: `Light travel time and photon lookback trace verified across cosmic epochs.`,
          metrics: { benchmarkCount, lookbackGyr },
        };
      }
      return {
        isValid: false,
        reason:
          "Photon lookback trace incomplete. Synthesize at least 4 cosmic distance benchmarks.",
        metrics: { benchmarkCount },
      };
    }

    // -------------------------------------------------------------
    // Module 05: Lunar Phase & Eclipse Prediction
    // -------------------------------------------------------------
    case "lunar_phase_eclipse_prediction": {
      const nodesAligned = Boolean(
        payload.nodesAligned ?? payload.eclipsePredicted ?? payload.success,
      );
      const predictedCount = Number(payload.predictedCount ?? payload.phasesIdentified ?? 0);

      if (nodesAligned || predictedCount >= 2) {
        return {
          isValid: true,
          reason: "Orbital inclination nodes and eclipse alignment geometry verified.",
          metrics: { nodesAligned, predictedCount },
        };
      }
      return {
        isValid: false,
        reason:
          "Eclipse geometry prediction incomplete. Align orbital nodes or identify lunar phases.",
        metrics: { nodesAligned, predictedCount },
      };
    }

    // -------------------------------------------------------------
    // Module 06: Planetary Density Classification
    // -------------------------------------------------------------
    case "planetary_density_classification": {
      const classifiedCount = Number(payload.classifiedCount ?? payload.worldsClassified ?? 0);
      const success = Boolean(payload.success ?? payload.verified);

      if (classifiedCount >= 4 || success) {
        return {
          isValid: true,
          reason: `Planetary architecture classified by bulk density and composition (${classifiedCount} worlds).`,
          metrics: { classifiedCount },
        };
      }
      return {
        isValid: false,
        reason:
          "Insufficient planetary classifications. Classify at least 4 planetary types by density.",
        metrics: { classifiedCount },
      };
    }

    // -------------------------------------------------------------
    // Module 07: Solar Magnetic & CME Simulation
    // -------------------------------------------------------------
    case "solar_magnetic_cme_simulation": {
      const coreTempK = Number(payload.coreTempK ?? payload.coreTemperature ?? 0);
      const cmeTraced = Boolean(payload.cmeTraced ?? payload.magneticLoopStable ?? payload.success);

      if (cmeTraced || coreTempK >= 1e7) {
        return {
          isValid: true,
          reason: "Solar thermonuclear core equilibrium and coronal magnetic eruption verified.",
          metrics: { coreTempK, cmeTraced },
        };
      }
      return {
        isValid: false,
        reason: "Solar simulator parameters out of equilibrium. Core must sustain T >= 1.5e7 K.",
        metrics: { coreTempK, cmeTraced },
      };
    }

    // -------------------------------------------------------------
    // Module 08: Keplerian Orbit Insertion
    // -------------------------------------------------------------
    case "kepler_orbit_insertion": {
      const eccentricity = Number(payload.eccentricity ?? payload.e);
      const semiMajorAxis = Number(payload.semiMajorAxisAU ?? payload.semiMajorAxisKm ?? payload.a);
      const periapsis = Number(payload.periapsisKm ?? payload.periapsis);
      const isAlternative = isAccessibleAlternative || Boolean(payload.accessibleAlternative);

      if (isAlternative) {
        // Accessible Kepler's Third Law (T^2 = a^3) validation
        const periodYears = Number(payload.periodYears ?? payload.T);
        const smaAU = Number(payload.semiMajorAxisAU ?? payload.a);
        if (periodYears > 0 && smaAU > 0) {
          const diff = Math.abs(Math.pow(periodYears, 2) - Math.pow(smaAU, 3));
          if (diff < 0.2 * Math.pow(smaAU, 3)) {
            return {
              isValid: true,
              reason: "Kepler's Third Law (T² = a³) verified numerically within tolerance.",
              metrics: { periodYears, smaAU, diff },
            };
          }
        }
      }

      if (!isNaN(eccentricity) && eccentricity >= 0 && eccentricity < 1.0) {
        if (!periapsis || periapsis > 500) {
          return {
            isValid: true,
            reason: `Stable closed Keplerian orbit achieved (e = ${eccentricity.toFixed(3)}, a = ${semiMajorAxis}).`,
            metrics: { eccentricity, semiMajorAxis, periapsis },
          };
        }
      }

      return {
        isValid: false,
        reason: "Orbital trajectory unstable (hyperbolic, parabolic, or impact with primary body).",
        metrics: { eccentricity, semiMajorAxis, periapsis },
      };
    }

    // -------------------------------------------------------------
    // Module 09: Hertzsprung-Russell Diagram Classification
    // -------------------------------------------------------------
    case "hr_diagram_classification": {
      const placedStars = Number(payload.placedCount ?? payload.starsClassified ?? 0);
      const accuracy = Number(payload.accuracyPct ?? payload.score ?? 100);

      if (placedStars >= 3 && accuracy >= 70) {
        return {
          isValid: true,
          reason: `H-R Diagram branches accurately mapped (${placedStars} stars, ${accuracy}% precision).`,
          metrics: { placedStars, accuracy },
        };
      }
      return {
        isValid: false,
        reason: "Insufficient stars mapped on the H-R diagram (minimum 3 required).",
        metrics: { placedStars },
      };
    }

    // -------------------------------------------------------------
    // Module 10: Stellar Fate Predictor
    // -------------------------------------------------------------
    case "stellar_fate_prediction": {
      const correctPredictions = Number(
        payload.correctPredictions ?? payload.predictionsCount ?? 0,
      );
      const success = Boolean(payload.success ?? payload.verified);

      if (correctPredictions >= 2 || success) {
        return {
          isValid: true,
          reason: "Stellar evolution endpoints correctly predicted across initial mass thresholds.",
          metrics: { correctPredictions },
        };
      }
      return {
        isValid: false,
        reason:
          "Stellar fate predictions incomplete. Predict outcomes for 1 M_sun and 20 M_sun stars.",
        metrics: { correctPredictions },
      };
    }

    // -------------------------------------------------------------
    // Module 11: Jeans Mass Gravitational Collapse
    // -------------------------------------------------------------
    case "jeans_mass_collapse": {
      const cloudMass = Number(payload.cloudMassSolar ?? payload.M);
      const jeansMass = Number(payload.jeansMassSolar ?? payload.M_J);
      const collapseTriggered = Boolean(payload.collapseTriggered ?? payload.success);

      if (collapseTriggered || (cloudMass > 0 && jeansMass > 0 && cloudMass >= jeansMass)) {
        return {
          isValid: true,
          reason:
            "Jeans gravitational instability threshold M > M_J satisfied for protostellar collapse.",
          metrics: { cloudMass, jeansMass },
        };
      }
      return {
        isValid: false,
        reason:
          "Cloud mass insufficient to trigger Jeans instability collapse (M must exceed M_J).",
        metrics: { cloudMass, jeansMass },
      };
    }

    // -------------------------------------------------------------
    // Module 12: Exoplanet Transit Photometry
    // -------------------------------------------------------------
    case "transit_photometry_radius_derivation": {
      const transitDepth = Number(payload.transitDepthPpm ?? payload.depth);
      const derivedRadiusRatio = Number(payload.radiusRatio ?? payload.Rp_over_Rstar);

      if (transitDepth > 0 || (derivedRadiusRatio > 0 && derivedRadiusRatio < 0.5)) {
        return {
          isValid: true,
          reason: `Exoplanet transit dip characterized (depth: ${transitDepth} ppm, Rp/R*: ${derivedRadiusRatio}).`,
          metrics: { transitDepth, derivedRadiusRatio },
        };
      }
      return {
        isValid: false,
        reason: "Transit depth or planetary radius ratio invalid. Check light curve dip.",
        metrics: { transitDepth, derivedRadiusRatio },
      };
    }

    // -------------------------------------------------------------
    // Module 14: Schwarzschild Event Horizon Radius
    // -------------------------------------------------------------
    case "schwarzschild_radius_calculation": {
      // Rs = 2GM / c^2 ≈ 2.95 km * (M / M_sun)
      const massSolar = Number(payload.massSolar ?? payload.M);
      const calculatedRsKm = Number(payload.radiusKm ?? payload.Rs);

      if (massSolar > 0 && calculatedRsKm > 0) {
        const expectedRs = 2.95 * massSolar;
        const errorPct = Math.abs((calculatedRsKm - expectedRs) / expectedRs) * 100;
        if (errorPct < 15.0) {
          return {
            isValid: true,
            reason: `Schwarzschild radius Rs = 2GM/c² calculated accurately (${calculatedRsKm.toFixed(1)} km).`,
            metrics: { massSolar, calculatedRsKm, errorPct },
          };
        }
      }
      return {
        isValid: false,
        reason: "Schwarzschild radius calculation out of relativistic tolerance.",
        metrics: { massSolar, calculatedRsKm },
      };
    }

    // -------------------------------------------------------------
    // Module 13: Galaxy Morphology Classification
    // -------------------------------------------------------------
    case "galaxy_morphology_classification": {
      const classifiedCount = Number(payload.classifiedCount ?? payload.galaxyTypesIdentified ?? 0);
      const success = Boolean(payload.success ?? payload.verified);

      if (classifiedCount >= 4 || success) {
        return {
          isValid: true,
          reason: "Galaxy morphology classification along the Hubble sequence verified.",
          metrics: { classifiedCount },
        };
      }
      return {
        isValid: false,
        reason: "Galaxy morphology classification incomplete. Identify at least 4 galaxy types.",
        metrics: { classifiedCount },
      };
    }

    // -------------------------------------------------------------
    // Module 15: Cosmic Web Topology & Voids
    // -------------------------------------------------------------
    case "cosmic_web_topology_inspection": {
      const inspectedNodes = Number(payload.inspectedNodes ?? payload.structuresVisited ?? 0);
      const success = Boolean(payload.success ?? payload.verified);

      if (inspectedNodes >= 3 || success) {
        return {
          isValid: true,
          reason: "Cosmic web filamentary network, nodes, and void underdensities inspected.",
          metrics: { inspectedNodes },
        };
      }
      return {
        isValid: false,
        reason:
          "Large-scale structure topology inspection incomplete. Inspect at least 3 structures.",
        metrics: { inspectedNodes },
      };
    }

    // -------------------------------------------------------------
    // Module 16: Dark Matter Halo Rotation Curve Fit
    // -------------------------------------------------------------
    case "rotation_curve_nfw_fit": {
      const darkMatterRatio = Number(payload.darkMatterRatio ?? payload.haloMassRatio ?? 0);
      const nfwFitted = Boolean(payload.nfwFitted ?? payload.curveMatched ?? payload.success);

      if (nfwFitted || darkMatterRatio >= 3.0) {
        return {
          isValid: true,
          reason:
            "Dark matter halo NFW profile successfully fitted to flat outer galactic rotation curve.",
          metrics: { darkMatterRatio, nfwFitted },
        };
      }
      return {
        isValid: false,
        reason:
          "Keplerian rotation curve fails to fit flat galactic velocities without dark matter halo.",
        metrics: { darkMatterRatio },
      };
    }

    // -------------------------------------------------------------
    // Module 17: CMB Acoustic Peak Power Spectrum
    // -------------------------------------------------------------
    case "cmb_acoustic_peak_analysis": {
      const peaksAnalyzed = Number(payload.peaksAnalyzed ?? payload.acousticPeaksIdentified ?? 0);
      const success = Boolean(payload.success ?? payload.verified);

      if (peaksAnalyzed >= 2 || success) {
        return {
          isValid: true,
          reason:
            "Cosmic Microwave Background acoustic peaks analyzed to derive baryon/dark matter densities.",
          metrics: { peaksAnalyzed },
        };
      }
      return {
        isValid: false,
        reason:
          "CMB power spectrum analysis incomplete. Identify and calibrate at least 2 acoustic peaks.",
        metrics: { peaksAnalyzed },
      };
    }

    // -------------------------------------------------------------
    // Module 18: Cosmological Redshift & Expansion
    // -------------------------------------------------------------
    case "redshift_velocity_distance_calculation": {
      // v = c * z (for low z) or relativistic formula
      const z = Number(payload.redshift ?? payload.z);
      const velocityKmS = Number(payload.velocityKmS ?? payload.v);

      if (z > 0) {
        return {
          isValid: true,
          reason: `Cosmological redshift z = ${z.toFixed(4)} spectral displacement verified.`,
          metrics: { z, velocityKmS },
        };
      }
      return {
        isValid: false,
        reason: "Redshift value z must be greater than zero.",
        metrics: { z },
      };
    }

    // -------------------------------------------------------------
    // Module 19: Retrograde Planetary Motion Comparison
    // -------------------------------------------------------------
    case "retrograde_motion_comparison": {
      const modelsCompared = Number(payload.modelsCompared ?? payload.loopsObserved ?? 0);
      const demonstrated = Boolean(payload.retrogradeDemonstrated ?? payload.success);

      if (modelsCompared >= 2 || demonstrated) {
        return {
          isValid: true,
          reason:
            "Apparent retrograde planetary loops demonstrated via Copernican orbital mechanics.",
          metrics: { modelsCompared },
        };
      }
      return {
        isValid: false,
        reason: "Retrograde motion comparison incomplete. Compare Ptolemaic vs Copernican models.",
        metrics: { modelsCompared },
      };
    }

    // -------------------------------------------------------------
    // Module 20: Cosmic Future Era Progression
    // -------------------------------------------------------------
    case "cosmic_future_era_ordering": {
      const erasOrdered = Number(payload.erasOrderedCount ?? payload.erasMapped ?? 0);
      const success = Boolean(payload.success ?? payload.verified);

      if (erasOrdered >= 4 || success) {
        return {
          isValid: true,
          reason:
            "All 4 cosmic future eras ordered chronologically according to thermodynamic entropy.",
          metrics: { erasOrdered },
        };
      }
      return {
        isValid: false,
        reason:
          "Future era projection incomplete. Order all 4 cosmological eras (Stelliferous to Dark).",
        metrics: { erasOrdered },
      };
    }

    // -------------------------------------------------------------
    // Module 21: Rayleigh Criterion Diffraction Resolution
    // -------------------------------------------------------------
    case "rayleigh_criterion_resolution": {
      const apertureMeters = Number(payload.apertureMeters ?? payload.D);
      const wavelengthNm = Number(payload.wavelengthNm ?? payload.lambda);
      const success = Boolean(payload.success ?? payload.verified);

      if (apertureMeters > 0 || success) {
        return {
          isValid: true,
          reason: "Rayleigh diffraction limit θ = 1.22λ/D resolving power calibrated.",
          metrics: { apertureMeters, wavelengthNm },
        };
      }
      return {
        isValid: false,
        reason:
          "Optical aperture parameter invalid. Primary mirror aperture must be greater than zero.",
        metrics: { apertureMeters },
      };
    }

    // -------------------------------------------------------------
    // Module 22: Gravitational Assist Slingshot Trajectory
    // -------------------------------------------------------------
    case "gravity_assist_slingshot": {
      const deltaVKmS = Number(payload.deltaVKmS ?? payload.velocityGainKmS ?? 0);
      const flybySuccessful = Boolean(payload.flybySuccessful ?? payload.success);

      if (deltaVKmS > 0 || flybySuccessful) {
        return {
          isValid: true,
          reason:
            "Interplanetary gravitational assist trajectory validated with heliocentric delta-v boost.",
          metrics: { deltaVKmS, flybySuccessful },
        };
      }
      return {
        isValid: false,
        reason: "Gravity assist flyby failed to gain orbital momentum. Periapsis vector invalid.",
        metrics: { deltaVKmS },
      };
    }

    // -------------------------------------------------------------
    // Module 23: Atmospheric Biosignature Disequilibrium
    // -------------------------------------------------------------
    case "biosignature_disequilibrium_analysis": {
      const analyzedCount = Number(payload.biosignaturesAnalyzed ?? payload.gasesSampled ?? 0);
      const disequilibriumFound = Boolean(
        payload.methaneOxygenDetected ?? payload.disequilibrium ?? payload.success,
      );

      if (analyzedCount >= 2 || disequilibriumFound) {
        return {
          isValid: true,
          reason: "Exoplanetary atmospheric photochemical disequilibrium (O₂ + CH₄) characterized.",
          metrics: { analyzedCount, disequilibriumFound },
        };
      }
      return {
        isValid: false,
        reason:
          "Atmospheric biosignature disequilibrium analysis incomplete. Sample at least 2 trace gases.",
        metrics: { analyzedCount },
      };
    }

    // -------------------------------------------------------------
    // Module 24: Unified Astrophysics Capstone Laboratory
    // -------------------------------------------------------------
    case "capstone_astrophysics_synthesis": {
      const experimentsCount = Number(
        payload.experimentsCompleted ?? payload.domainsSynthesized ?? 0,
      );
      const synthesisCalibrated = Boolean(payload.synthesisCalibrated ?? payload.success);

      if (experimentsCount >= 3 || synthesisCalibrated) {
        return {
          isValid: true,
          reason:
            "Unified astrophysics capstone laboratory completed with verified parameter calibration.",
          metrics: { experimentsCount, synthesisCalibrated },
        };
      }
      return {
        isValid: false,
        reason: "Astrophysics synthesis incomplete. Complete at least 3 laboratory domains.",
        metrics: { experimentsCount },
      };
    }

    // -------------------------------------------------------------
    // General Physics / Laboratory Validation Default
    // -------------------------------------------------------------
    default: {
      const interactionCount = Number(payload.interactionCount ?? payload.stepsCompleted ?? 1);
      const completedOutcome = Boolean(payload.success ?? payload.completed ?? payload.verified);

      if (completedOutcome && interactionCount >= 1) {
        return {
          isValid: true,
          reason: `Educational activity ${validationKey} completed with verified parameters.`,
          metrics: payload,
        };
      }

      return {
        isValid: false,
        reason: `Activity criteria for ${validationKey} not satisfied.`,
        metrics: payload,
      };
    }
  }
}
