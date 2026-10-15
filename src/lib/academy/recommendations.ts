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
  const module13Progress = progress.moduleProgress["13"]?.status;
  const module19Progress = progress.moduleProgress["19"]?.status;

  // 1. If Module 01 not completed
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
    // When Module 01 is completed and 02 is not, recommend The Night Sky!
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
  } else {
    // When Module 02 is completed, recommend Module 03: Cosmic Distances & Scale!
    const mod03 = ACADEMY_MODULES.find((m) => m.id === "03");
    if (mod03) {
      recommendations.push({
        module: mod03,
        reason:
          "Now that you can read the night sky, plunge into the mind-bending gulfs of empty space: Astronomical Units, light-years, and parsecs.",
        badge: "Next Step: Scale",
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
