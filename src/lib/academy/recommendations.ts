import { ACADEMY_MODULES } from "./registry";
import type { ModuleContract, UserProgress } from "./types";

export interface Recommendation {
  module: ModuleContract;
  reason: string;
  badge: string;
  priority: "primary" | "secondary";
}

export function getAdaptiveRecommendations(progress: UserProgress): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const module01Progress = progress.moduleProgress["01"]?.status;
  const module02Progress = progress.moduleProgress["02"]?.status;
  const module04Progress = progress.moduleProgress["04"]?.status;
  const module05Progress = progress.moduleProgress["05"]?.status;
  const module06Progress = progress.moduleProgress["06"]?.status;
  const module07Progress = progress.moduleProgress["07"]?.status;
  const module13Progress = progress.moduleProgress["13"]?.status;
  const module19Progress = progress.moduleProgress["19"]?.status;

  // 1. Core Progressive Track
  if (module01Progress !== "completed") {
    const mod01 = ACADEMY_MODULES.find((m) => m.id === "01");
    if (mod01) {
      recommendations.push({
        module: mod01,
        reason:
          module01Progress === "in_progress"
            ? "Continue your journey from home to the outer cosmic horizon."
            : "The essential starting point for all cosmic explorers.",
        badge: "Start Here",
        priority: "primary",
      });
    }
  } else if (module02Progress !== "completed") {
    const mod02 = ACADEMY_MODULES.find((m) => m.id === "02");
    if (mod02) {
      recommendations.push({
        module: mod02,
        reason:
          module02Progress === "in_progress"
            ? "Continue navigating the night sky in your 360° virtual planetarium dome."
            : "Now that you know your cosmic coordinates, look up to navigate the night sky, locate Polaris, and map the constellations.",
        badge: "Next Adventure",
        priority: "primary",
      });
    }
  } else if (module04Progress !== "completed") {
    const mod04 = ACADEMY_MODULES.find((m) => m.id === "04");
    if (mod04) {
      recommendations.push({
        module: mod04,
        reason:
          module04Progress === "in_progress"
            ? "Continue exploring how light bridges cosmic distances and peering into the past in the 3D Light-Travel simulation."
            : "Explore the cosmic speed limit (c = 300,000 km/s), electromagnetic spectra, and why telescopes are real time machines.",
        badge: "Recommended Next",
        priority: "primary",
      });
    }
  } else if (module05Progress !== "completed") {
    // Recommend Stage 2 Module 05: Earth, Moon & Eclipses
    const mod05 = ACADEMY_MODULES.find((m) => m.id === "05");
    if (mod05) {
      recommendations.push({
        module: mod05,
        reason:
          module05Progress === "in_progress"
            ? "Continue your 3D exploration of Earth's axial tilt, seasonal solstices, lunar phases, and eclipses."
            : "Explore Earth's 23.44° axial tilt, true day/night rotation, the 5.145° lunar orbit inclination, and eclipse geometry.",
        badge: "Stage 2 Gateway",
        priority: "primary",
      });
    }
  } else if (module06Progress !== "completed") {
    // Recommend Stage 2 Module 06: Explore the Solar System
    const mod06 = ACADEMY_MODULES.find((m) => m.id === "06");
    if (mod06) {
      recommendations.push({
        module: mod06,
        reason:
          module06Progress === "in_progress"
            ? "Continue your 3D exploration of orbital mechanics, the 8 planets, dwarf worlds, and planetary rings."
            : "Now that you understand our home world and Moon, venture outward to explore the 8 major planets, gas giants, and Kuiper belt!",
        badge: "Solar System Tour",
        priority: "primary",
      });
    }
  } else if (module07Progress !== "completed") {
    // Recommend Stage 2 Module 07: The Sun: Our Star
    const mod07 = ACADEMY_MODULES.find((m) => m.id === "07");
    if (mod07) {
      recommendations.push({
        module: mod07,
        reason:
          module07Progress === "in_progress"
            ? "Continue peering into the Sun's core, nuclear fusion reactor, and defending satellites against solar storms."
            : "Explore the nuclear fusion engine powering the solar system, peel open internal layers, and simulate solar storms.",
        badge: "Stellar Powerhouse",
        priority: "primary",
      });
    }
  }

  // 2. Recommend Module 13 (Galaxies)
  if (module13Progress !== "completed") {
    const mod13 = ACADEMY_MODULES.find((m) => m.id === "13");
    if (mod13) {
      recommendations.push({
        module: mod13,
        reason: "Explore spiral arms, galactic cores, and interactive 3D models of real galaxies.",
        badge: "Interactive 3D",
        priority: module01Progress === "completed" ? "primary" : "secondary",
      });
    }
  }

  // 3. Recommend Module 19 (Visible Universe History)
  if (module19Progress !== "completed") {
    const mod19 = ACADEMY_MODULES.find((m) => m.id === "19");
    if (mod19) {
      recommendations.push({
        module: mod19,
        reason: "Journey 13.8 billion years across cosmic history with real redshift timelines.",
        badge: "Cosmic Epochs",
        priority: "secondary",
      });
    }
  }

  // If user completed all available ready modules, recommend next upcoming stage
  if (recommendations.length === 0) {
    const nextComing = ACADEMY_MODULES.find((m) => m.id === "02") || ACADEMY_MODULES[0];
    recommendations.push({
      module: nextComing,
      reason: "You've mastered the foundation! Review and explore deeper celestial physics.",
      badge: "Mastery Review",
      priority: "primary",
    });
  }

  return recommendations;
}
