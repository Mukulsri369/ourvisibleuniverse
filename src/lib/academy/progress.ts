import { useEffect, useState, useCallback } from "react";
import type { Achievement, LearningLevel, ModuleStatus, UserProgress } from "./types";

const STORAGE_KEY = "cosmic_academy_user_progress_v1";

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: "welcome_explorer",
    title: "First Stargazer",
    description: "Began your journey into the Cosmic Learning Academy.",
    icon: "🌟",
  },
  {
    id: "module_01_complete",
    title: "Cosmic Citizen",
    description: "Learned your true celestial address in the universe.",
    icon: "🌍",
  },
  {
    id: "galaxy_voyager",
    title: "Galactic Navigator",
    description: "Explored spiral, elliptical, and deep sky galaxies.",
    icon: "🌀",
  },
  {
    id: "time_traveler",
    title: "Cosmic Historian",
    description: "Traveled 13.8 billion years across visible cosmic history.",
    icon: "⏳",
  },
  {
    id: "quiz_ace",
    title: "Master Cosmologist",
    description: "Scored 100% on a science knowledge check.",
    icon: "🏆",
  },
  {
    id: "curious_mind",
    title: "Curious Observer",
    description: "Tested a hands-on cosmic parameter experiment.",
    icon: "🔬",
  },
  {
    id: "module_02_complete",
    title: "Master Stargazer",
    description: "Mapped constellations and found Polaris in the virtual planetarium.",
    icon: "✨",
  },
  {
    id: "speed_of_light_master",
    title: "Speed of Light Master",
    description:
      "Mastered how light bridges cosmic distances and looked 13 billion years into the past.",
    icon: "⚡",
  },
  {
    id: "earth_moon_master",
    title: "Earth & Moon Master",
    description:
      "Mastered Earth's axial tilt, seasonal solstices, lunar phases, and eclipse geometry.",
    icon: "🌑",
  },
  {
    id: "stellar_astrophysicist",
    title: "Stellar Astrophysicist",
    description: "Decoded star spectra, blackbody radiation, and the Hertzsprung–Russell diagram.",
    icon: "🔥",
  },
  {
    id: "stellar_evolution_master",
    title: "Stellar Evolution Master",
    description:
      "Traced stellar lifecycles from molecular clouds to supernovae and black holes across cosmic time.",
    icon: "💥",
  },
  {
    id: "nebula_cluster_master",
    title: "Master of Nebulae & Clusters",
    description:
      "Explored volumetric gas, dust extinction, Jeans collapse, and the wonders of open and globular clusters.",
    icon: "🌌",
  },
];

const DEFAULT_PROGRESS: UserProgress = {
  selectedLevel: "explorer", // default Space Explorer (Classes 4-6)
  moduleProgress: {
    "01": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "02": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "04": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "05": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "06": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "07": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "08": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "09": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "10": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "11": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "13": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
    "19": { status: "not_started", percent: 0, lastOpenedAt: new Date().toISOString() },
  },
  completedLessons: [],
  quizScores: {},
  bookmarks: [],
  lastOpenedModuleId: "01",
  achievements: ["welcome_explorer"],
  lastUpdated: new Date().toISOString(),
};

function loadStoredProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      moduleProgress: {
        ...DEFAULT_PROGRESS.moduleProgress,
        ...(parsed.moduleProgress || {}),
      },
      achievements: Array.from(new Set([...(parsed.achievements || []), "welcome_explorer"])),
    };
  } catch (err) {
    console.error("Failed to parse academy progress from localStorage", err);
    return DEFAULT_PROGRESS;
  }
}

function saveStoredProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save academy progress to localStorage", err);
  }
}

export function useAcademyProgress() {
  // Always initialize with DEFAULT_PROGRESS during SSR and initial hydration
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    // Hydrate stored progress from localStorage after client mount
    setProgress(loadStoredProgress());
  }, []);

  const setLearningLevel = useCallback((level: LearningLevel) => {
    setProgress((prev) => {
      const next: UserProgress = {
        ...prev,
        selectedLevel: level,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredProgress(next);
      return next;
    });
  }, []);

  const setModuleProgress = useCallback(
    (moduleId: string, percent: number, status?: ModuleStatus) => {
      setProgress((prev) => {
        const current = prev.moduleProgress[moduleId] || {
          status: "not_started",
          percent: 0,
          lastOpenedAt: new Date().toISOString(),
        };
        const newPercent = Math.min(100, Math.max(current.percent, percent));
        const resolvedStatus: ModuleStatus =
          status ||
          (newPercent >= 100 ? "completed" : newPercent > 0 ? "in_progress" : "not_started");

        const newAchievements = [...prev.achievements];
        if (resolvedStatus === "completed") {
          if (moduleId === "01" && !newAchievements.includes("module_01_complete")) {
            newAchievements.push("module_01_complete");
          }
          if (moduleId === "02" && !newAchievements.includes("module_02_complete")) {
            newAchievements.push("module_02_complete");
          }
          if (moduleId === "04" && !newAchievements.includes("speed_of_light_master")) {
            newAchievements.push("speed_of_light_master");
          }
          if (moduleId === "05" && !newAchievements.includes("earth_moon_master")) {
            newAchievements.push("earth_moon_master");
          }
          if (moduleId === "09" && !newAchievements.includes("stellar_astrophysicist")) {
            newAchievements.push("stellar_astrophysicist");
          }
          if (moduleId === "10" && !newAchievements.includes("stellar_evolution_master")) {
            newAchievements.push("stellar_evolution_master");
          }
          if (moduleId === "11" && !newAchievements.includes("nebula_cluster_master")) {
            newAchievements.push("nebula_cluster_master");
          }
          if (moduleId === "13" && !newAchievements.includes("galaxy_voyager")) {
            newAchievements.push("galaxy_voyager");
          }
          if (moduleId === "19" && !newAchievements.includes("time_traveler")) {
            newAchievements.push("time_traveler");
          }
        }

        const next: UserProgress = {
          ...prev,
          lastOpenedModuleId: moduleId,
          achievements: newAchievements,
          moduleProgress: {
            ...prev.moduleProgress,
            [moduleId]: {
              status: resolvedStatus,
              percent: newPercent,
              lastOpenedAt: new Date().toISOString(),
              completedAt:
                resolvedStatus === "completed" ? new Date().toISOString() : current.completedAt,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
        saveStoredProgress(next);
        return next;
      });
    },
    [],
  );

  const recordQuizResult = useCallback((quizId: string, score: number, total: number) => {
    setProgress((prev) => {
      const existing = prev.quizScores[quizId];
      const attempts = (existing?.attempts || 0) + 1;
      const bestScore = existing ? Math.max(existing.score, score) : score;

      const newAchievements = [...prev.achievements];
      if (score === total && !newAchievements.includes("quiz_ace")) {
        newAchievements.push("quiz_ace");
      }

      const next: UserProgress = {
        ...prev,
        achievements: newAchievements,
        quizScores: {
          ...prev.quizScores,
          [quizId]: {
            score: bestScore,
            total,
            attempts,
          },
        },
        lastUpdated: new Date().toISOString(),
      };
      saveStoredProgress(next);
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((moduleId: string) => {
    setProgress((prev) => {
      const bookmarks = prev.bookmarks.includes(moduleId)
        ? prev.bookmarks.filter((id) => id !== moduleId)
        : [...prev.bookmarks, moduleId];
      const next: UserProgress = {
        ...prev,
        bookmarks,
        lastUpdated: new Date().toISOString(),
      };
      saveStoredProgress(next);
      return next;
    });
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setProgress((prev) => {
      if (prev.achievements.includes(achievementId)) return prev;
      const next: UserProgress = {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        lastUpdated: new Date().toISOString(),
      };
      saveStoredProgress(next);
      return next;
    });
  }, []);

  const exportProgressJSON = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `cosmic-academy-progress-${progress.selectedLevel}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [progress]);

  const resetProgress = useCallback(() => {
    saveStoredProgress(DEFAULT_PROGRESS);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return {
    progress,
    selectedLevel: progress.selectedLevel,
    setLearningLevel,
    setModuleProgress,
    recordQuizResult,
    toggleBookmark,
    unlockAchievement,
    exportProgressJSON,
    resetProgress,
  };
}
