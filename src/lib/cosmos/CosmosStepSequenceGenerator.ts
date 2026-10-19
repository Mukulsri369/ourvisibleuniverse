/**
 * COSMOS Step Sequence Generator
 * Project: Our Visible Universe Academy
 * Scope: Phase 1 Structured Learning Sequence (Part 4) & Pedagogical Flow (Part 12)
 *
 * Transforms approved curriculum content across any of the 24 modules into
 * an ordered, strictly-typed sequence of LearningSteps with pedagogical transitions.
 */

import type { LearningLevel } from "../academy/types";
import { LessonContentProvider } from "./LessonContentProvider";
import type { NarrationSegment } from "./cosmos-types";
import type {
  LearningStep,
  LearningStepType,
  StepRecoveryBehavior,
} from "./learning-director-types";

export class CosmosStepSequenceGenerator {
  /**
   * Generates the complete ordered LearningStep sequence for a module.
   */
  public static generateModuleSequence(moduleId: string, level: LearningLevel): LearningStep[] {
    const meta = LessonContentProvider.getModuleMetadata(moduleId);
    const moduleTitle = meta ? meta.title : `Module ${moduleId}`;
    const segments = LessonContentProvider.getSegmentsForModule(moduleId, level, "en");

    // Group segments by sublesson and section
    const groupedByLesson = new Map<string, NarrationSegment[]>();
    segments.forEach((seg) => {
      const list = groupedByLesson.get(seg.lessonId) || [];
      list.push(seg);
      groupedByLesson.set(seg.lessonId, list);
    });

    const steps: LearningStep[] = [];
    let stepCounter = 1;

    // 1. Initial Module Introduction Step
    const introStepId = `step_${moduleId}_intro`;
    const introSegments = segments.filter((s) => s.sectionId === "title" || s.sequenceNumber <= 2);

    steps.push({
      stepId: introStepId,
      moduleId,
      lessonId: "module-intro",
      sectionId: "overview",
      sublessonIndex: 0,
      stepType: "TRANSITION",
      title: `Welcome to ${moduleTitle}`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-hero`,
      narrationSegmentIds: introSegments.map((s) => s.segmentId),
      requiresStudentInput: false,
      completionCondition: { type: "narration_finished" },
      recoveryBehavior: "resume_current",
      stepStatus: "pending",
      pedagogicalTransitionText: `Welcome to ${moduleTitle}. In this journey, we will explore the fundamental physics and wonders of the universe.`,
    });

    // 2. Sublesson Steps
    let sublessonIndex = 0;
    for (const [lessonId, lessonSegments] of groupedByLesson.entries()) {
      sublessonIndex++;
      const firstSegment = lessonSegments[0];
      const lessonTitle = firstSegment
        ? this.formatLessonTitle(firstSegment.displayText)
        : `Lesson ${sublessonIndex}`;

      // Group sublesson segments into logical steps: Overview / Deep Dive / Analogies
      const sectionMap = new Map<string, NarrationSegment[]>();
      lessonSegments.forEach((seg) => {
        const list = sectionMap.get(seg.sectionId) || [];
        list.push(seg);
        sectionMap.set(seg.sectionId, list);
      });

      for (const [sectionId, secSegments] of sectionMap.entries()) {
        const stepId = `step_${moduleId}_${lessonId}_${sectionId}_${stepCounter++}`;
        const stepType: LearningStepType =
          sectionId === "title" || sectionId === "takeaway"
            ? "LESSON"
            : sectionId === "deepDive" || sectionId === "mathOrAnalogy"
              ? "EXPLANATION"
              : sectionId === "didYouKnow"
                ? "REVIEW"
                : "LESSON";

        const targetComponentId = `m${moduleId}-sec-${sectionId}`;
        const visRef = secSegments.find((s) => s.visualizationReference)?.visualizationReference;

        steps.push({
          stepId,
          moduleId,
          lessonId,
          sectionId,
          sublessonIndex: sublessonIndex - 1,
          stepType,
          title: `${lessonTitle} — ${this.formatSectionTitle(sectionId)}`,
          learningLevel: level,
          targetComponentId,
          narrationSegmentIds: secSegments.map((s) => s.segmentId),
          requiresStudentInput: false,
          completionCondition: { type: "narration_finished" },
          recoveryBehavior: "resume_current",
          stepStatus: "pending",
          pedagogicalTransitionText: this.buildPedagogicalTransition(moduleId, lessonId, sectionId),
          visualizationRef: visRef,
        });
      }

      // Add interactive visual simulation anchor step for the primary sublesson across all 24 modules
      if (sublessonIndex === 1) {
        const primaryVisRef = lessonSegments.find(
          (s) => s.visualizationReference,
        )?.visualizationReference;
        steps.push({
          stepId: `step_${moduleId}_${lessonId}_vis_${stepCounter++}`,
          moduleId,
          lessonId,
          sectionId: "simulation",
          sublessonIndex: sublessonIndex - 1,
          stepType: "VISUALIZATION",
          title: `${moduleTitle} — Interactive Simulation Observation`,
          learningLevel: level,
          targetComponentId: `module-${moduleId}-visualizer`,
          narrationSegmentIds: [],
          requiresStudentInput: false,
          completionCondition: { type: "student_acknowledged", minElapsedSeconds: 3 },
          recoveryBehavior: "resume_current",
          stepStatus: "pending",
          pedagogicalTransitionText: this.buildSimulationTransition(moduleId),
          visualizationRef: primaryVisRef,
        });
      }
    }

    // 3. Activity Step Contract (Phase 2 & 3 Universal Activity Integration)
    steps.push({
      stepId: `step_${moduleId}_activity`,
      moduleId,
      lessonId: "module-activities",
      sectionId: "interactive-lab",
      stepType: "ACTIVITY",
      title: `${moduleTitle} — Interactive Laboratory Activity`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-activities`,
      narrationSegmentIds: [],
      requiresStudentInput: true, // Invariant: Cannot skip unresolved student input
      completionCondition: { type: "activity_outcome_submitted" },
      recoveryBehavior: "wait_for_input",
      stepStatus: "pending",
      pedagogicalTransitionText:
        "Now apply your understanding directly in the interactive laboratory.",
    });

    // 4. Knowledge Check Quiz Step Contract (Phase 2 & 3 Official Assessment Integration)
    steps.push({
      stepId: `step_${moduleId}_quiz`,
      moduleId,
      lessonId: "module-quiz",
      sectionId: "knowledge-check",
      stepType: "KNOWLEDGE_CHECK",
      title: `${moduleTitle} — Knowledge Assessment`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-quiz`,
      narrationSegmentIds: [],
      requiresStudentInput: true, // Invariant: Cannot skip unresolved student input
      completionCondition: { type: "quiz_passed", requiredScorePercent: 70 },
      recoveryBehavior: "wait_for_input",
      stepStatus: "pending",
      pedagogicalTransitionText:
        "Test your cosmic mastery with the scientific knowledge assessment.",
    });

    // 5. Completion Review & Autonomous Journey Continuation Step
    steps.push({
      stepId: `step_${moduleId}_completion`,
      moduleId,
      lessonId: "module-completion",
      sectionId: "completion-check",
      stepType: "COMPLETION_CHECK",
      title: `${moduleTitle} — Verification & Next Journey`,
      learningLevel: level,
      targetComponentId: `module-${moduleId}-checklist`,
      narrationSegmentIds: [],
      requiresStudentInput: false,
      completionCondition: { type: "student_acknowledged" },
      recoveryBehavior: "resume_current",
      stepStatus: "pending",
      pedagogicalTransitionText:
        "Congratulations on reaching the module milestone. Let us verify your completion, review your stage achievement progress, and prepare for the next frontier.",
    });

    // Link nextStepId pointers
    for (let i = 0; i < steps.length; i++) {
      if (i < steps.length - 1) {
        steps[i].nextStepId = steps[i + 1].stepId;
      }
    }

    return steps;
  }

  private static formatLessonTitle(text: string): string {
    const clean = (text || "").replace(/^[0-9]+[.\-\s]+/, "").trim();
    if (clean.length > 40) return clean.slice(0, 37) + "...";
    return clean || "Lesson";
  }

  private static formatSectionTitle(sectionId: string): string {
    const base = sectionId.replace(/-\d+$/, "");
    switch (base) {
      case "title":
        return "Core Concept";
      case "summary":
      case "lead":
      case "keyIdea":
        return "Conceptual Overview";
      case "takeaway":
        return "Key Takeaway";
      case "deepDive":
      case "explanation":
        return "In-Depth Astrophysics";
      case "mathOrAnalogy":
      case "mathematics":
        return "Mathematical Model & Analogy";
      case "didYouKnow":
        return "Observational Discovery";
      case "activityPrompt":
        return "Experimental Inquiry";
      default:
        return base.charAt(0).toUpperCase() + base.slice(1);
    }
  }

  private static buildSimulationTransition(moduleId: string): string {
    const simTransitions: Record<string, string> = {
      "01": "Observe how physical scale expands by powers of ten across the cosmic hierarchy.",
      "02": "Explore the 360-degree celestial sphere and observe how constellations rotate around the celestial pole.",
      "03": "Calibrate the astronomical distance ladder from Astronomical Units to megaparsecs.",
      "04": "Watch electromagnetic pulses travel at finite speed across interplanetary and interstellar space.",
      "05": "Observe how Earth's 23.5-degree axial tilt and lunar orbital geometry create seasons and eclipses.",
      "06": "Compare the terrestrial inner worlds and outer gas and ice giants in our 3D Solar System explorer.",
      "07": "Inspect the solar photosphere, corona, and magnetic sunspot cycles in real time.",
      "08": "Observe how gravitational forces and velocity vectors shape Keplerian orbital trajectories.",
      "09": "Analyze stellar blackbody spectra and plot stars across the Hertzsprung-Russell diagram.",
      "10": "Trace the thermonuclear lifecycle of low-mass and high-mass stars from main sequence to remnant.",
      "11": "Fly through glowing H-II emission nebulae where Jeans instability triggers protostellar collapse.",
      "12": "Detect distant exoplanets by measuring transit light-curve dips and Doppler radial velocity shifts.",
      "13": "Inspect spiral arms, central bulges, and Hubble tuning-fork classifications in 3D.",
      "14": "Observe relativistic gravitational lensing and photon rings near the Schwarzschild event horizon.",
      "15": "Navigate the filaments, galaxy clusters, and supervoids of the large-scale Cosmic Web.",
      "16": "Compare flat galactic rotation curves and cosmological expansion models driven by dark matter and dark energy.",
      "17": "Examine Cosmic Microwave Background temperature anisotropies from the infant universe.",
      "18": "Observe how expanding spacetime stretches light wavelengths into cosmological redshift.",
      "19": "Compare historical geocentric epicycles with heliocentric Keplerian and relativistic models.",
      "20": "Project cosmic evolution billions of years forward through the Stelliferous and Black Hole eras.",
      "21": "Calibrate multi-wavelength telescope optics across radio, infrared, optical, and X-ray bands.",
      "22": "Plot interplanetary Hohmann transfer trajectories and gravity-assist maneuvers.",
      "23": "Evaluate circumstellar habitable zones and atmospheric biosignature spectra.",
      "24": "Synthesize multi-domain astrophysical equations inside the capstone Cosmic Physics Laboratory.",
    };
    return (
      simTransitions[moduleId] ||
      "Observe how physical principles govern this visual model in real time."
    );
  }

  private static buildPedagogicalTransition(
    moduleId: string,
    lessonId: string,
    sectionId: string,
  ): string {
    const base = sectionId.replace(/-\d+$/, "");
    if (moduleId === "08") {
      if (base === "mathOrAnalogy" || base === "mathematics") {
        return "Now that we've seen how gravity shapes planetary motion, let's investigate why orbital speed changes with distance.";
      }
      return "Next, let us analyze Kepler's mathematical formulation of celestial dynamics.";
    }
    if (moduleId === "14") {
      if (base === "deepDive" || base === "explanation") {
        return "Let us now probe deep into the curvature of spacetime near the event horizon.";
      }
      return "Next, we observe how extreme gravity bends and focuses cosmic light rays.";
    }
    if (moduleId === "01") {
      if (base === "deepDive" || base === "explanation") {
        return "Let's zoom out to understand how Earth fits into the grand cosmic hierarchy.";
      }
    }

    const stageTransitions: Record<string, string> = {
      "02": "Let us connect these star patterns to Earth's rotation and celestial coordinates.",
      "03": "Let us examine how astronomers measure vast cosmic distances without leaving Earth.",
      "04": "Because light travels at a finite speed, looking deeper into space means looking further back in time.",
      "05": "Let us see how the gravitational dance of the Sun, Earth, and Moon governs our calendar and tides.",
      "06": "Let us compare the geology and atmospheres of our planetary neighbors.",
      "07": "Let us trace energy transport from the Sun's thermonuclear core to solar weather at Earth.",
      "09": "Let us decode starlight to reveal a star's surface temperature, composition, and luminosity.",
      "10": "Let us follow how initial stellar mass dictates a star's ultimate fate.",
      "11": "Let us explore how interstellar gas and dust recycle stellar ashes into new planetary systems.",
      "12": "Let us examine the precision techniques astronomers use to discover worlds around other stars.",
      "13": "Let us explore how billions of stars, gas reservoirs, and dark matter halos assemble into galaxies.",
      "15": "Let us zoom out to the largest coherent structures in the observable universe.",
      "16": "Let us investigate the gravitational and cosmological evidence for the invisible 95% of the cosmos.",
      "17": "Let us trace the thermal history of the universe back to its earliest observable epoch.",
      "18": "Let us examine how Hubble's law and spacetime metric expansion govern the cosmos.",
      "19": "Let us trace how observational evidence transformed humanity's model of the universe.",
      "20": "Let us apply thermodynamics and cosmology to forecast the long-term destiny of the universe.",
      "21": "Let us see how modern observatories collect photons across the entire electromagnetic spectrum.",
      "22": "Let us analyze the propulsion physics and orbital mechanics of robotic and crewed spaceflight.",
      "23": "Let us combine planetary science, chemistry, and biology to search for life beyond Earth.",
      "24": "Let us integrate all six stages of astrophysics into quantitative laboratory experiments.",
    };

    return stageTransitions[moduleId] || "Let us continue to the next scientific insight.";
  }
}

