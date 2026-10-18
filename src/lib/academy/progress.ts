import { useEffect, useState, useCallback, useRef } from "react";
import type {
  Achievement,
  LearningLevel,
  ModuleStatus,
  UserProgress,
  ModuleProgressItem,
} from "./types";
import { supabase } from "@/integrations/supabase/client";
import {
  getAuthoritativeProgress,
  submitAssessmentForGrading,
  recordActivityEvidence as recordEvidenceRpc,
  recordLessonProgress,
} from "./learning.functions";
import { toast } from "sonner";

const STORAGE_KEY = "cosmic_academy_user_progress_v1";
const OFFLINE_QUEUE_KEY = "cosmic_academy_offline_queue_v1";

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
  {
    id: "black_hole_pioneer",
    title: "Extreme Relativist",
    description:
      "Mastered Schwarzschild radii, pulsar magnetic poles, and gravitational waves in the Extreme Objects Laboratory.",
    icon: "🕳️",
  },
  {
    id: "cosmic_web_cartographer",
    title: "Cosmic Web Cartographer",
    description:
      "Navigated from the Local Group through galaxy clusters, superclusters, and cosmic voids to map the large-scale scaffolding of the universe.",
    icon: "🕸️",
  },
  {
    id: "dark_sector_explorer",
    title: "Dark Sector Cosmologist",
    description:
      "Decoded galactic rotation curves, dark matter halo profiles, and cosmic expansion acceleration.",
    icon: "🔮",
  },
  {
    id: "cosmic_time_traveler",
    title: "Cosmic Chronologist",
    description:
      "Traced 13.8 billion years of cosmic evolution from the Big Bang through the CMB, Cosmic Dawn, and galaxy formation.",
    icon: "⏳",
  },
  {
    id: "cosmic_expansion_observer",
    title: "Cosmic Surveyor",
    description:
      "Mastered the Hubble–Lemaître Law, cosmological redshift wave-stretching, and cosmic horizons.",
    icon: "🔭",
  },
  {
    id: "cosmological_historian",
    title: "Cosmological Historian",
    description:
      "Explored how human cosmology evolved from geocentric epicycles to heliocentrism, universal gravitation, and the relativistic expanding cosmos.",
    icon: "📜",
  },
];

// Initialize all 24 modules with clean default states
function buildDefaultModuleProgress(): Record<string, ModuleProgressItem> {
  const result: Record<string, ModuleProgressItem> = {};
  for (let i = 1; i <= 24; i++) {
    const id = String(i).padStart(2, "0");
    result[id] = {
      status: "not_started",
      percent: 0,
      lastOpenedAt: "2026-01-01T00:00:00.000Z",
      isVerified: false,
      evidenceCount: 0,
    };
  }
  return result;
}

const DEFAULT_PROGRESS: UserProgress = {
  selectedLevel: "explorer",
  moduleProgress: buildDefaultModuleProgress(),
  completedLessons: [],
  quizScores: {},
  bookmarks: [],
  lastOpenedModuleId: "01",
  achievements: ["welcome_explorer"],
  verifiedModules: [],
  stageBadges: {},
  pendingOfflineCount: 0,
  lastUpdated: "2026-01-01T00:00:00.000Z",
};

function loadStoredProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    const defaults = buildDefaultModuleProgress();

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      moduleProgress: {
        ...defaults,
        ...(parsed.moduleProgress || {}),
      },
      achievements: Array.from(new Set([...(parsed.achievements || []), "welcome_explorer"])),
      verifiedModules: parsed.verifiedModules || [],
      stageBadges: parsed.stageBadges || {},
      pendingOfflineCount: getOfflineQueue().length,
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

interface OfflineAction {
  id: string;
  type: "activity_evidence" | "lesson_progress";
  payload: any;
  timestamp: string;
}

function getOfflineQueue(): OfflineAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQueue(queue: OfflineAction[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to save offline queue:", e);
  }
}

export function useAcademyProgress() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  // 1. Initial client-side hydration
  useEffect(() => {
    setProgress(loadStoredProgress());
  }, []);

  // 2. Multi-Tab Synchronization via Window Storage Event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const remoteProgress = JSON.parse(e.newValue);
          setProgress((prev) => ({
            ...prev,
            ...remoteProgress,
            moduleProgress: {
              ...prev.moduleProgress,
              ...(remoteProgress.moduleProgress || {}),
            },
          }));
        } catch {
          // ignore parse error
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // 3. Offline Queue Flush Handler
  const flushOfflineQueue = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const remaining: OfflineAction[] = [];
    for (const item of queue) {
      try {
        if (item.type === "activity_evidence") {
          await recordEvidenceRpc({ data: item.payload });
        } else if (item.type === "lesson_progress") {
          await recordLessonProgress({ data: item.payload });
        }
      } catch (err) {
        // Keep in queue for next retry if network failed
        remaining.push(item);
      }
    }

    saveOfflineQueue(remaining);
    setProgress((prev) => ({
      ...prev,
      pendingOfflineCount: remaining.length,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      toast.info("Connection restored. Synchronizing offline learning evidence...");
      void flushOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushOfflineQueue]);

  // 4. Authoritative Server State Sync
  const syncWithServer = useCallback(async () => {
    if (syncingRef.current || typeof window === "undefined" || !navigator.onLine) return;
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) return;

      syncingRef.current = true;
      setIsSyncing(true);

      const serverState = await getAuthoritativeProgress();
      if (serverState) {
        setProgress((prev) => {
          const updatedModules = { ...prev.moduleProgress };
          const verifiedList: string[] = [];

          // Merge verified completions (Authoritative State C)
          for (const [modId, comp] of Object.entries(serverState.verifiedCompletions)) {
            verifiedList.push(modId);
            updatedModules[modId] = {
              ...(updatedModules[modId] || { percent: 100, lastOpenedAt: comp.verifiedAt }),
              status: "completed",
              isVerified: true,
              verifiedAt: comp.verifiedAt,
              qualifyingAttemptId: comp.qualifyingAttemptId || undefined,
            };
          }

          // Merge activity evidence counts (Authoritative State B)
          for (const [modId, count] of Object.entries(serverState.activityEvidenceCount)) {
            if (updatedModules[modId]) {
              updatedModules[modId].evidenceCount = count;
            }
          }

          const stageBadgeIds = Object.values(serverState.stageAchievements || {}).map(
            (b: any) => b.badgeId,
          );
          const mergedAchievements = Array.from(
            new Set([...(prev.achievements || []), ...stageBadgeIds]),
          );

          const next: UserProgress = {
            ...prev,
            moduleProgress: updatedModules,
            verifiedModules: verifiedList,
            stageBadges: serverState.stageAchievements || {},
            achievements: mergedAchievements,
            lastUpdated: new Date().toISOString(),
          };

          saveStoredProgress(next);
          return next;
        });
      }
    } catch (err) {
      console.warn("Could not sync authoritative learning progress with server:", err);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  // Sync on initial login state and auth change
  useEffect(() => {
    void syncWithServer();
    let unsubscribe = () => {};
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          void syncWithServer();
          void flushOfflineQueue();
        }
      });
      if (sub?.subscription) {
        unsubscribe = () => sub.subscription.unsubscribe();
      }
    } catch (err) {
      console.warn("[Academy] Could not bind auth listener:", err);
    }
    return () => unsubscribe();
  }, [syncWithServer, flushOfflineQueue]);

  // 5. Change Learning Level (preserves all module progress & past records)
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

  // 6. Navigation Progress Update (State A: Unverified Reading / Scrolling)
  // CRITICAL: Does NOT directly set isVerified = true. Only updates reading percentage.
  const setModuleProgress = useCallback(
    (moduleId: string, percent: number, status?: ModuleStatus) => {
      const formattedModId = moduleId.padStart(2, "0");
      setProgress((prev) => {
        const current = prev.moduleProgress[formattedModId] || {
          status: "not_started",
          percent: 0,
          lastOpenedAt: new Date().toISOString(),
          isVerified: false,
          evidenceCount: 0,
        };

        const newPercent = Math.min(100, Math.max(current.percent, percent));
        const resolvedStatus: ModuleStatus =
          status ||
          (newPercent >= 100 ? "completed" : newPercent > 0 ? "in_progress" : "not_started");

        const next: UserProgress = {
          ...prev,
          lastOpenedModuleId: formattedModId,
          moduleProgress: {
            ...prev.moduleProgress,
            [formattedModId]: {
              ...current,
              status: resolvedStatus,
              percent: newPercent,
              lastOpenedAt: new Date().toISOString(),
            },
          },
          lastUpdated: new Date().toISOString(),
        };

        saveStoredProgress(next);
        return next;
      });

      // Send unverified reading telemetry to server in background
      if (typeof window !== "undefined" && navigator.onLine) {
        void recordLessonProgress({
          data: {
            moduleId: formattedModId,
            lessonId: `${formattedModId}-core`,
            scrollDepthPercent: percent,
            timeSpentSeconds: 60,
          },
        }).catch(() => {
          // Enqueue offline action if network failed
          const queue = getOfflineQueue();
          queue.push({
            id: `lp_${Date.now()}_${Math.random()}`,
            type: "lesson_progress",
            payload: {
              moduleId: formattedModId,
              lessonId: `${formattedModId}-core`,
              scrollDepthPercent: percent,
              timeSpentSeconds: 60,
            },
            timestamp: new Date().toISOString(),
          });
          saveOfflineQueue(queue);
        });
      }
    },
    [],
  );

  // 7. Authoritative Educational Activity Telemetry (State B)
  const logActivityEvidence = useCallback(
    async (moduleId: string, activityType: string, evidencePayload: Record<string, unknown>) => {
      const formattedModId = moduleId.padStart(2, "0");
      const clientTimestamp = new Date().toISOString();

      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          await recordEvidenceRpc({
            data: {
              moduleId: formattedModId,
              activityType,
              evidencePayload,
              clientTimestamp,
            },
          });

          setProgress((prev) => {
            const current = prev.moduleProgress[formattedModId];
            if (!current) return prev;
            const updated = {
              ...prev,
              moduleProgress: {
                ...prev.moduleProgress,
                [formattedModId]: {
                  ...current,
                  evidenceCount: (current.evidenceCount || 0) + 1,
                },
              },
            };
            saveStoredProgress(updated);
            return updated;
          });
          return true;
        } catch {
          // Fall through to offline queue
        }
      }

      // Offline queueing
      const queue = getOfflineQueue();
      queue.push({
        id: `ev_${Date.now()}_${Math.random()}`,
        type: "activity_evidence",
        payload: {
          moduleId: formattedModId,
          activityType,
          evidencePayload,
          clientTimestamp,
        },
        timestamp: clientTimestamp,
      });
      saveOfflineQueue(queue);

      setProgress((prev) => ({
        ...prev,
        pendingOfflineCount: queue.length,
      }));
      return false;
    },
    [],
  );

  // 8. Authoritative Server-Graded Assessment Submission (State C)
  // Grades against server question bank, requires >= 80%, and issues official verified completion.
  const submitAuthoritativeAssessment = useCallback(
    async (
      moduleId: string,
      answers: Record<number, number>,
      clientDurationSeconds?: number,
      idempotencyKey?: string,
    ) => {
      const formattedModId = moduleId.padStart(2, "0");
      const submissionKey =
        idempotencyKey ||
        `sub_${formattedModId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      try {
        const result = await submitAssessmentForGrading({
          data: {
            moduleId: formattedModId,
            answers: Object.fromEntries(
              Object.entries(answers).map(([k, v]) => [String(k), Number(v)]),
            ),
            clientDurationSeconds,
            idempotencyKey: submissionKey,
          },
        });

        // Update local state with authoritative server verdict
        setProgress((prev) => {
          const current = prev.moduleProgress[formattedModId] || {
            status: "not_started",
            percent: 0,
            lastOpenedAt: new Date().toISOString(),
            isVerified: false,
          };

          const newVerifiedList = result.passed
            ? Array.from(new Set([...prev.verifiedModules, formattedModId]))
            : prev.verifiedModules;

          const newAchievements = [...prev.achievements];
          if (result.passed && !newAchievements.includes(`module_${formattedModId}_verified`)) {
            newAchievements.push(`module_${formattedModId}_verified`);
          }

          const next: UserProgress = {
            ...prev,
            achievements: newAchievements,
            verifiedModules: newVerifiedList,
            quizScores: {
              ...prev.quizScores,
              [`module_${formattedModId}_quiz`]: {
                score: result.score,
                total: result.totalPoints,
                attempts: (prev.quizScores[`module_${formattedModId}_quiz`]?.attempts || 0) + 1,
                verified: result.passed,
              },
            },
            moduleProgress: {
              ...prev.moduleProgress,
              [formattedModId]: {
                ...current,
                status: result.passed ? "completed" : current.status,
                percent: result.passed ? 100 : current.percent,
                isVerified: result.passed ? true : current.isVerified,
                verifiedAt: result.passed ? new Date().toISOString() : current.verifiedAt,
                qualifyingAttemptId: result.attemptId,
              },
            },
            lastUpdated: new Date().toISOString(),
          };

          saveStoredProgress(next);
          return next;
        });

        if (result.passed) {
          toast.success(
            `Module ${formattedModId} Verified! Official score: ${result.percentage}% (${result.score}/${result.totalPoints})`,
          );
          if (result.newStageBadgeAwarded) {
            toast.success(`Stage Achievement Unlocked: ${result.newStageBadgeAwarded}!`);
          }
        } else {
          toast.error(
            `Score: ${result.percentage}%. 80% is required for official verification. Review concepts and try again!`,
          );
        }

        return result;
      } catch (err: any) {
        toast.error(err?.message || "Assessment grading failed. Please check your connection.");
        throw err;
      }
    },
    [],
  );

  // 9. Practice / Legacy Quiz Result (Client-side practice)
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
            verified: existing?.verified ?? false,
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
      `cosmic-academy-authoritative-progress-${progress.selectedLevel}.json`,
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
    isSyncing,
    pendingOfflineCount: progress.pendingOfflineCount,
    setLearningLevel,
    setModuleProgress,
    logActivityEvidence,
    submitAuthoritativeAssessment,
    syncWithServer,
    recordQuizResult,
    toggleBookmark,
    unlockAchievement,
    exportProgressJSON,
    resetProgress,
  };
}
