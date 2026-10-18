/**
 * COSMOS Approved 3D Educational Tools Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 15 Context-Aware 3D AI Teaching
 *
 * Implements strict input validation, capability whitelisting,
 * epistemic classification, and security guardrails preventing unauthorized state modification.
 */

import {
  APPROVED_DEMONSTRATION_IDS,
  APPROVED_SCENE_IDS,
  COSMOS_FORBIDDEN_ACTIONS,
  type ApprovedDemonstrationId,
  type ApprovedSceneId,
  type CelestialObjectInfo,
  type Cosmos3DToolResult,
  type SimulationStateInfo,
  type StudentQuestionContext,
} from "./cosmos-types";
import { Cosmos3DAdapter } from "./Cosmos3DAdapter";
import { StudentQuestionContextManager } from "./StudentQuestionContext";
import { LessonContentProvider } from "./LessonContentProvider";

// Approved celestial object dictionary with empirically verified catalog physical data
export const APPROVED_CELESTIAL_CATALOG: Record<string, CelestialObjectInfo> = {
  Sun: {
    name: "Sun",
    type: "star",
    distanceFromObserver: "1.0 AU (149.6M km)",
    catalogReference: "IAU / NASA DE440",
    isModelAvailable: true,
    physicalProperties: {
      massKg: "1.9885e30",
      spectralClass: "G2V",
      radiusKm: 696340,
      surfaceTempK: 5778,
      luminosityWatts: "3.828e26",
    },
    scientificDescription:
      "G2V yellow dwarf main sequence star at the center of the Solar System.",
  },
  Mercury: {
    name: "Mercury",
    type: "planet",
    distanceFromObserver: "0.387 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 0.387,
      orbitalPeriodDays: 87.97,
      radiusKm: 2439.7,
      eccentricity: 0.2056,
    },
  },
  Venus: {
    name: "Venus",
    type: "planet",
    distanceFromObserver: "0.723 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 0.723,
      orbitalPeriodDays: 224.7,
      radiusKm: 6051.8,
      surfaceTempK: 737,
    },
  },
  Earth: {
    name: "Earth",
    type: "planet",
    distanceFromObserver: "1.000 AU",
    catalogReference: "NASA DE440 / IAU 2012",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 1.0,
      orbitalPeriodDays: 365.25,
      radiusKm: 6371.0,
      surfaceGravityMs2: 9.80665,
    },
  },
  Mars: {
    name: "Mars",
    type: "planet",
    distanceFromObserver: "1.524 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 1.524,
      orbitalPeriodDays: 686.98,
      radiusKm: 3389.5,
    },
  },
  Jupiter: {
    name: "Jupiter",
    type: "planet",
    distanceFromObserver: "5.204 AU",
    catalogReference: "NASA Planetary Fact Sheet / JPL Horizons",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 5.204,
      orbitalPeriodDays: 4332.59,
      radiusKm: 69911,
      massEarthMasses: 317.8,
      knownMoons: 95,
      hillSphereRadiusAu: 0.355, // ~53.1 million km
    },
    scientificDescription:
      "Largest planet in the Solar System. Its massive gravitational well creates a vast Hill sphere capturing numerous irregular satellites.",
  },
  Saturn: {
    name: "Saturn",
    type: "planet",
    distanceFromObserver: "9.582 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 9.582,
      orbitalPeriodDays: 10759.22,
      radiusKm: 58232,
      ringOuterRadiusKm: 136780,
    },
  },
  Uranus: {
    name: "Uranus",
    type: "planet",
    distanceFromObserver: "19.201 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 19.201,
      orbitalPeriodDays: 30685.4,
      radiusKm: 25362,
    },
  },
  Neptune: {
    name: "Neptune",
    type: "planet",
    distanceFromObserver: "30.070 AU",
    catalogReference: "NASA Planetary Fact Sheet",
    isModelAvailable: true,
    physicalProperties: {
      semiMajorAxisAu: 30.07,
      orbitalPeriodDays: 60189.0,
      radiusKm: 24622,
    },
  },
  "Sagittarius A*": {
    name: "Sagittarius A*",
    type: "black_hole",
    distanceFromObserver: "26,000 ly (7.97 kpc)",
    catalogReference: "Gravity Collaboration / EHT 2022",
    isModelAvailable: true,
    physicalProperties: {
      massSolarMasses: 4154000,
      schwarzschildRadiusKm: 12270000, // ~0.082 AU
      photonSphereRadiusKm: 18400000,
      spinParameterA: 0.9,
    },
    scientificDescription:
      "Supermassive black hole at the Galactic Centre of the Milky Way, imaged by the Event Horizon Telescope.",
  },
  "M87*": {
    name: "M87*",
    type: "black_hole",
    distanceFromObserver: "53.5 Mly (16.4 Mpc)",
    catalogReference: "EHT Collaboration 2019",
    isModelAvailable: true,
    physicalProperties: {
      massSolarMasses: 6500000000,
      schwarzschildRadiusKm: 19200000000,
      hasRelativisticJet: true,
      jetLengthLy: 5000,
    },
  },
  "Cygnus X-1": {
    name: "Cygnus X-1",
    type: "black_hole",
    distanceFromObserver: "7,300 ly (2.24 kpc)",
    catalogReference: "Miller-Jones et al. 2021 Science",
    isModelAvailable: true,
    physicalProperties: {
      massSolarMasses: 21.2,
      companionStar: "HDE 226868 (O9.7Iab)",
      orbitalPeriodDays: 5.6,
    },
  },
  "Milky Way": {
    name: "Milky Way",
    type: "galaxy",
    distanceFromObserver: "0 ly (Observer is inside)",
    catalogReference: "Bland-Hawthorn & Gerhard 2016",
    isModelAvailable: true,
    physicalProperties: {
      morphology: "SB(rs)bc",
      stellarMassSolarMasses: "6.08e10",
      diameterLy: 100000,
    },
  },
  Andromeda: {
    name: "Andromeda",
    type: "galaxy",
    distanceFromObserver: "2.537 Mly (778 kpc)",
    catalogReference: "Freedman et al. Cepheid Calibration",
    isModelAvailable: true,
    physicalProperties: {
      morphology: "SA(s)b",
      diameterLy: 152000,
      radialVelocityKmS: -301,
    },
  },
  Betelgeuse: {
    name: "Betelgeuse",
    type: "star",
    distanceFromObserver: "642.5 ly (197 pc)",
    catalogReference: "Harper et al. 2017 / Gaia DR3",
    isModelAvailable: true,
    physicalProperties: {
      spectralClass: "M1-M2Ia-ab",
      radiusSolarRadii: 764,
      massSolarMasses: 16.5,
      stage: "red_supergiant",
    },
  },
  "Proxima Centauri": {
    name: "Proxima Centauri",
    type: "star",
    distanceFromObserver: "4.2465 ly (1.302 pc)",
    catalogReference: "Gaia DR3 parallax 768.06 mas",
    isModelAvailable: true,
    physicalProperties: {
      spectralClass: "M5.5Ve",
      massSolarMasses: 0.122,
      radiusSolarRadii: 0.154,
    },
  },
};

export class Cosmos3DTools {
  private static adapter = Cosmos3DAdapter.getInstance();
  private static activeContext: StudentQuestionContext | null = null;

  public static setActiveLearningContext(context: StudentQuestionContext): void {
    this.activeContext = context;
  }

  // --------------------------------------------------------------------------
  // TOOL 1: getCurrentLearningContext()
  // --------------------------------------------------------------------------
  public static getCurrentLearningContext(): Cosmos3DToolResult<{
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonTitle: string;
    sublessonId?: string;
    scientificTopic: string;
    learningLevel: string;
    currentDisplayText: string;
    approvedObjectives: string[];
  }> {
    const ctx =
      this.activeContext ||
      StudentQuestionContextManager.buildContext({ moduleId: "01", learningLevel: "explorer" });

    return {
      success: true,
      data: {
        moduleId: ctx.moduleId,
        moduleTitle: ctx.moduleTitle,
        lessonId: ctx.lessonId,
        lessonTitle: ctx.lessonTitle,
        sublessonId: ctx.sublessonId,
        scientificTopic: ctx.scientificTopic,
        learningLevel: ctx.learningLevel,
        currentDisplayText: ctx.currentDisplayText,
        approvedObjectives: ctx.approvedLearningObjectives,
      },
      epistemicNote: "Reflects approved curriculum pedagogical context.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 2: getSelectedCelestialObject()
  // --------------------------------------------------------------------------
  public static getSelectedCelestialObject(): Cosmos3DToolResult<CelestialObjectInfo | null> {
    const fromScene = this.adapter.getSelectedCelestialObject();
    if (fromScene) {
      return {
        success: true,
        data: fromScene,
        epistemicNote: "Retrieved directly from active 3D visualization scene.",
      };
    }

    // Check highlighted object
    const highlighted = this.adapter.getHighlightedObject();
    if (highlighted && APPROVED_CELESTIAL_CATALOG[highlighted]) {
      return {
        success: true,
        data: APPROVED_CELESTIAL_CATALOG[highlighted],
        epistemicNote: "Currently highlighted celestial object.",
      };
    }

    // Fallback: Infer from current active topic or default to central body
    if (this.activeContext) {
      const topicLower = (
        this.activeContext.scientificTopic +
        " " +
        this.activeContext.currentDisplayText
      ).toLowerCase();
      for (const [name, info] of Object.entries(APPROVED_CELESTIAL_CATALOG)) {
        if (topicLower.includes(name.toLowerCase())) {
          return {
            success: true,
            data: info,
            epistemicNote: `Inferred relevant object '${name}' from lesson context.`,
          };
        }
      }
    }

    return {
      success: true,
      data: null,
      epistemicNote: "No specific celestial object is currently selected.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 3: getCurrentSimulationState()
  // --------------------------------------------------------------------------
  public static getCurrentSimulationState(): Cosmos3DToolResult<SimulationStateInfo> {
    const state = this.adapter.getCurrentSimulationState();
    return {
      success: true,
      data: state,
      epistemicNote: `Simulation classification: ${state.epistemicMode} (${state.scientificNotes})`,
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 4: navigateToLessonSection()
  // --------------------------------------------------------------------------
  public static navigateToLessonSection(params: {
    moduleId: string;
    lessonId?: string;
    sublessonId?: string;
  }): Cosmos3DToolResult {
    // 1. Strict input validation
    const num = parseInt(params.moduleId, 10);
    if (isNaN(num) || num < 1 || num > 24) {
      return {
        success: false,
        error: `Invalid moduleId "${params.moduleId}". Must be between 01 and 24.`,
      };
    }

    // 2. Authority Invariant: Navigation cannot award completion or bypass quizzes
    const targetModule = params.moduleId.padStart(2, "0");
    const segments = LessonContentProvider.getSegmentsForModule(targetModule, "explorer", "en");

    if (segments.length === 0) {
      return {
        success: false,
        error: `Module ${targetModule} content is not available.`,
      };
    }

    return {
      success: true,
      actionTaken: `Navigated curriculum reader to Module ${targetModule}.`,
      epistemicNote: "Curriculum navigation does not alter verified completion credentials.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 5: focusScientificObject()
  // --------------------------------------------------------------------------
  public static focusScientificObject(params: {
    targetName: string;
    durationMs?: number;
  }): Cosmos3DToolResult {
    const trimmed = (params.targetName || "").trim();
    if (!trimmed) {
      return { success: false, error: "targetName is required." };
    }

    // Check student manual camera interaction
    if (this.adapter.isUserControllingCamera()) {
      return {
        success: false,
        error: "Camera focus postponed: student is actively manipulating the camera.",
        actionTaken: "yielded_to_user",
      };
    }

    // Check catalog or known object
    const catalogEntry = APPROVED_CELESTIAL_CATALOG[trimmed];
    const duration = Math.min(Math.max(params.durationMs || 1200, 300), 4000);

    const executed = this.adapter.focusScientificObject(trimmed, duration);

    return {
      success: executed,
      actionTaken: `Smoothly framed ${trimmed} over ${duration}ms.`,
      data: catalogEntry || { name: trimmed, isModelAvailable: true },
      epistemicNote:
        catalogEntry?.scientificDescription ||
        `Framed object coordinates with smooth camera interpolation.`,
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 6: highlightScientificObject()
  // --------------------------------------------------------------------------
  public static highlightScientificObject(params: {
    targetName: string;
    highlightType?: "ring" | "glow" | "marker" | "orbit";
    durationMs?: number;
  }): Cosmos3DToolResult {
    const trimmed = (params.targetName || "").trim();
    if (!trimmed) {
      return { success: false, error: "targetName is required." };
    }

    const type = params.highlightType || "ring";
    const duration = Math.min(Math.max(params.durationMs || 4000, 1000), 10000);

    const executed = this.adapter.highlightScientificObject(trimmed, type, duration);

    return {
      success: executed,
      actionTaken: `Highlighted ${trimmed} with educational ${type} marker for ${duration}ms.`,
      epistemicNote:
        "Educational visual highlight applied without perturbing user camera orientation.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 7: showApprovedVisualization()
  // --------------------------------------------------------------------------
  public static showApprovedVisualization(params: {
    sceneId: string;
    targetObject?: string;
    educationalMode?: "standard" | "enhanced_scale" | "true_scale";
  }): Cosmos3DToolResult {
    if (!APPROVED_SCENE_IDS.includes(params.sceneId as ApprovedSceneId)) {
      return {
        success: false,
        error: `Invalid sceneId "${params.sceneId}". Must be one of: ${APPROVED_SCENE_IDS.join(", ")}`,
      };
    }

    this.adapter.setActiveScene(params.sceneId as ApprovedSceneId);

    if (params.targetObject) {
      this.adapter.focusScientificObject(params.targetObject);
    }

    return {
      success: true,
      actionTaken: `Switched active educational visualizer to "${params.sceneId}".`,
      epistemicNote:
        params.educationalMode === "true_scale"
          ? "Physically scaled 1:1 metric proportions active."
          : "Enhanced educational scale active for perceptual readability.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 8: playApprovedDemonstration()
  // --------------------------------------------------------------------------
  public static playApprovedDemonstration(params: {
    demonstrationId: string;
    parameters?: Record<string, any>;
  }): Cosmos3DToolResult {
    if (!APPROVED_DEMONSTRATION_IDS.includes(params.demonstrationId as ApprovedDemonstrationId)) {
      return {
        success: false,
        error: `Invalid demonstrationId "${params.demonstrationId}". Approved: ${APPROVED_DEMONSTRATION_IDS.join(", ")}`,
      };
    }

    const id = params.demonstrationId as ApprovedDemonstrationId;
    const executed = this.adapter.playApprovedDemonstration(id, params.parameters);

    const demonstrationExplanations: Record<ApprovedDemonstrationId, string> = {
      gravitational_lensing:
        "Demonstrates photon geodesic deflection around black hole event horizon (General Relativity Einstein ring & Doppler beaming).",
      kepler_second_law:
        "Demonstrates Kepler's second law: an imaginary line connecting a planet to the Sun sweeps out equal areas during equal intervals of time (dA/dt = const).",
      jupiter_moon_system:
        "Demonstrates Jupiter's gravitational dominance and orbital resonance of Io, Europa, and Ganymede (1:2:4 Laplace resonance).",
      stellar_collapse:
        "Demonstrates catastrophic core collapse when iron core exceeds the Chandrasekhar mass limit (1.44 Solar masses).",
      cosmic_expansion:
        "Demonstrates cosmological expansion of the metric of space: recession velocity v = H0 * d and cosmological redshift.",
      circular_orbit_balance:
        "Demonstrates stable circular orbital velocity balance: v_circ = √(GM / r).",
    };

    return {
      success: executed,
      actionTaken: `Activated demonstration: ${id}`,
      epistemicNote: demonstrationExplanations[id],
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 9: pauseSimulation()
  // --------------------------------------------------------------------------
  public static pauseSimulation(): Cosmos3DToolResult {
    const executed = this.adapter.pauseSimulation();
    return {
      success: executed,
      actionTaken: "Simulation clock paused.",
      epistemicNote: "Freeze-frame orbital inspection active.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 10: resumeSimulation()
  // --------------------------------------------------------------------------
  public static resumeSimulation(): Cosmos3DToolResult {
    const executed = this.adapter.resumeSimulation();
    return {
      success: executed,
      actionTaken: "Simulation clock resumed.",
      epistemicNote: "Dynamical time evolution active.",
    };
  }

  // --------------------------------------------------------------------------
  // TOOL 11: restorePreviousView()
  // --------------------------------------------------------------------------
  public static restorePreviousView(): Cosmos3DToolResult {
    const hasPrior = this.adapter.hasPreviousView();
    const executed = this.adapter.restorePreviousView();
    return {
      success: executed,
      actionTaken: hasPrior
        ? "Smoothly restored student's prior camera perspective."
        : "Reset camera to standard educational overview.",
      epistemicNote: "View history stack preserves student exploration orientation.",
    };
  }

  // --------------------------------------------------------------------------
  // SECURITY & CAPABILITY VALIDATION DISPATCHER
  // --------------------------------------------------------------------------
  public static executeToolCall(toolName: string, args: Record<string, any> = {}): Cosmos3DToolResult {
    // 1. Guard against unauthorized administrative actions
    for (const forbidden of COSMOS_FORBIDDEN_ACTIONS) {
      if (toolName.toLowerCase().includes(forbidden)) {
        return {
          success: false,
          error: `Execution blocked: ${forbidden} is an unauthorized administrative action.`,
        };
      }
    }

    switch (toolName) {
      case "getCurrentLearningContext":
        return this.getCurrentLearningContext();
      case "getSelectedCelestialObject":
        return this.getSelectedCelestialObject();
      case "getCurrentSimulationState":
        return this.getCurrentSimulationState();
      case "navigateToLessonSection":
        return this.navigateToLessonSection(args as any);
      case "focusScientificObject":
        return this.focusScientificObject(args as any);
      case "highlightScientificObject":
        return this.highlightScientificObject(args as any);
      case "showApprovedVisualization":
        return this.showApprovedVisualization(args as any);
      case "playApprovedDemonstration":
        return this.playApprovedDemonstration(args as any);
      case "pauseSimulation":
        return this.pauseSimulation();
      case "resumeSimulation":
        return this.resumeSimulation();
      case "restorePreviousView":
        return this.restorePreviousView();
      default:
        return {
          success: false,
          error: `Unrecognized or unapproved tool: "${toolName}".`,
        };
    }
  }
}
