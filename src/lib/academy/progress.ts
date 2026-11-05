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
import { flushAcknowledgedOfflineActions, isPersistedAcknowledgement } from "./offline-queue";
import { clearCachedVerification, isOfficialAchievement, mergeCachedNavigation, progressStorageKey } from "./local-progress";

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

function loadStoredProgress(ownerId: string | null = null): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    // The legacy shared cache is readable only as guest practice. Never assign
    // its awards or offline actions to a newly signed-in account.
    const raw = localStorage.getItem(progressStorageKey(ownerId)) ??
      (ownerId === null ? localStorage.getItem(STORAGE_KEY) : null);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    const defaults = buildDefaultModuleProgress();

    return clearCachedVerification({
      ...DEFAULT_PROGRESS,
      ...parsed,
      moduleProgress: {
        ...defaults,
        ...Object.fromEntries(Object.entries(parsed.moduleProgress || {}).map(([id, value]) => [id, {
          ...(value as ModuleProgressItem), isVerified: false, verifiedAt: undefined, qualifyingAttemptId: undefined,
        }])),
      },
      achievements: Array.from(new Set([...(parsed.achievements || []), "welcome_explorer"])),
      verifiedModules: [],
      stageBadges: {},
      quizScores: Object.fromEntries(Object.entries(parsed.quizScores || {}).map(([id, value]) => [id, {
        ...(value as UserProgress["quizScores"][string]), verified: false,
      }])),
      pendingOfflineCount: ownerId ? getOfflineQueue().filter(action => action.ownerId === ownerId).length : 0,
    });
  } catch (err) {
    console.error("Failed to parse academy progress from localStorage", err);
    return DEFAULT_PROGRESS;
  }
}

function saveStoredProgress(progress: UserProgress, ownerId: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(progressStorageKey(ownerId), JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save academy progress to localStorage", err);
  }
}

interface OfflineAction {
  id: string;
  type: "activity_evidence" | "lesson_progress";
  payload: any;
  timestamp: string;
  ownerId?: string | null;
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
  const ownerRef = useRef<string | null>(null);
  const syncSequenceRef = useRef(0);
  const persistProgress = useCallback((value: UserProgress) => saveStoredProgress(value, ownerRef.current), []);

  // 1. Initial client-side hydration
  useEffect(() => {
    setProgress(loadStoredProgress());
  }, []);

  // 2. Multi-Tab Synchronization via Window Storage Event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === progressStorageKey(ownerRef.current) && e.newValue) {
        try {
          const ownerId = ownerRef.current;
          const remoteProgress = loadStoredProgress(ownerId);
          setProgress(prev => ownerRef.current === ownerId ? mergeCachedNavigation(prev, remoteProgress) : prev);
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
    const { data } = await supabase.auth.getSession();
    const ownerId = data.session?.user.id;
    if (!ownerId) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const pendingOfflineCount = await flushAcknowledgedOfflineActions({
      ownerId,
      read: getOfflineQueue, write: saveOfflineQueue,
      send: async (item: OfflineAction) => item.type === "activity_evidence"
        ? recordEvidenceRpc({ data: { ...item.payload, expectedUserId: ownerId, clientEventId: item.payload.clientEventId || item.id } })
        : recordLessonProgress({ data: { ...item.payload, expectedUserId: ownerId } }),
    });
    if (ownerRef.current !== ownerId) return;
    setProgress((prev) => ({
      ...prev,
      pendingOfflineCount,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      if (!ownerRef.current) {
        toast.info("Guest practice stays on this device. Sign in to record new official learning activity.");
        return;
      }
      toast.info("Connection restored. Synchronizing offline learning evidence...");
      void flushOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flushOfflineQueue]);

  // 4. Authoritative Server State Sync
  const syncWithServer = useCallback(async () => {
    if (syncingRef.current || typeof window === "undefined" || !navigator.onLine) return;
    const sequence = ++syncSequenceRef.current;
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session) return;

      syncingRef.current = true;
      setIsSyncing(true);

      const serverState = await getAuthoritativeProgress();
      if (ownerRef.current !== userSession.session.user.id || syncSequenceRef.current !== sequence) return;
      if (serverState) {
        setProgress((prev) => {
          if (ownerRef.current !== userSession.session.user.id || syncSequenceRef.current !== sequence) return prev;
          // Only a successful authoritative read can invalidate cached official
          // flags. Network errors leave the current view unchanged.
          const updatedModules: Record<string, ModuleProgressItem> = Object.fromEntries(Object.entries(prev.moduleProgress).map(([id, item]) => [id, {
            ...item, isVerified: false, verifiedAt: undefined, qualifyingAttemptId: undefined,
          }]));
          const verifiedList: string[] = [];

          for (const [modId, reading] of Object.entries(serverState.unverifiedProgress || {})) {
            const current = updatedModules[modId];
            if (!current) continue;
            const percent = Math.min(100, Math.max(current.percent, reading.percent));
            updatedModules[modId] = { ...current, percent,
              status: percent >= 100 ? "completed" : percent > 0 ? "in_progress" : "not_started" };
          }

          // Merge verified completions (Authoritative State C)
          for (const [modId, comp] of Object.entries(serverState.verifiedCompletions)) {
            verifiedList.push(modId);
            updatedModules[modId] = {
              ...(updatedModules[modId] || { percent: 100, lastOpenedAt: comp.verifiedAt }),
              status: "completed",
              percent: 100,
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
            new Set([...(prev.achievements || []).filter(id => !isOfficialAchievement(id)), ...stageBadgeIds,
              ...verifiedList.map(id => `module_${id}_verified`)]),
          );

          const next: UserProgress = {
            ...prev,
            moduleProgress: updatedModules,
            verifiedModules: verifiedList,
            stageBadges: serverState.stageAchievements || {},
            achievements: mergedAchievements,
            lastUpdated: new Date().toISOString(),
          };

          persistProgress(next);
          return next;
        });
      }
    } catch (err) {
      console.warn("Could not sync authoritative learning progress with server:", err);
    } finally {
      if (syncSequenceRef.current === sequence) {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    }
  }, []);

  // Sync on initial login state and auth change
  useEffect(() => {
    let disposed = false;
    let authRevision = 0;
    const bindOwner = (ownerId: string | null) => {
      if (disposed) return;
      if (ownerRef.current !== ownerId) {
        ownerRef.current = ownerId;
        syncSequenceRef.current++;
        syncingRef.current = false;
        setIsSyncing(false);
        setProgress(loadStoredProgress(ownerId));
      }
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (authRevision !== 0) return;
      bindOwner(data.session?.user.id ?? null);
      if (!disposed) { void syncWithServer(); void flushOfflineQueue(); }
    });
    let unsubscribe = () => {};
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        authRevision++;
        bindOwner(session?.user.id ?? null);
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
    return () => { disposed = true; unsubscribe(); };
  }, [syncWithServer, flushOfflineQueue]);

  // 5. Change Learning Level (preserves all module progress & past records)
  const setLearningLevel = useCallback((level: LearningLevel) => {
    setProgress((prev) => {
      const next: UserProgress = {
        ...prev,
        selectedLevel: level,
        lastUpdated: new Date().toISOString(),
      };
      persistProgress(next);
      return next;
    });
  }, []);

  // 6. Navigation Progress Update (State A: Unverified Reading / Scrolling)
  // CRITICAL: Does NOT directly set isVerified = true. Only updates reading percentage.
  const setModuleProgress = useCallback(
    (moduleId: string, percent: number, status?: ModuleStatus) => {
      const ownerId = ownerRef.current;
      const formattedModId = moduleId.padStart(2, "0");
      setProgress((prev) => {
        if (ownerRef.current !== ownerId) return prev;
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

        persistProgress(next);
        return next;
      });

      // Persist offline reading locally and require a positive server acknowledgement.
      if (typeof window !== "undefined") {
        const payload = { moduleId: formattedModId, lessonId: formattedModId + "-core",
          scrollDepthPercent: percent, timeSpentSeconds: 60, ...(ownerId ? { expectedUserId: ownerId } : {}) };
        const enqueue = () => {
          const queue = getOfflineQueue();
          queue.push({ id: "lp_" + crypto.randomUUID(), type: "lesson_progress", payload, ownerId, timestamp: new Date().toISOString() });
          saveOfflineQueue(queue);
          if (ownerRef.current === ownerId)
            setProgress(previous => ({ ...previous, pendingOfflineCount: ownerId ? queue.filter(action => action.ownerId === ownerId).length : 0 }));
        };
        if (navigator.onLine && ownerId) {
          void recordLessonProgress({ data: payload }).then(saved => {
            if (!isPersistedAcknowledgement(saved)) throw new Error("Reading progress was not acknowledged");
          }).catch(enqueue);
        } else enqueue();
      }
    },
    [],
  );

  // 7. Authoritative Educational Activity Telemetry (State B)
  const logActivityEvidence = useCallback(
    async (moduleId: string, activityType: string, evidencePayload: Record<string, unknown>) => {
      const formattedModId = moduleId.padStart(2, "0");
      const clientTimestamp = new Date().toISOString();
      const clientEventId = "ev_" + crypto.randomUUID();
      const ownerId = ownerRef.current;

      if (typeof window !== "undefined" && navigator.onLine && ownerId) {
        try {
          const saved = await recordEvidenceRpc({
            data: {
              moduleId: formattedModId,
              activityType,
              evidencePayload,
              clientTimestamp,
              clientEventId,
              expectedUserId: ownerId,
            },
          });
          if (!isPersistedAcknowledgement(saved)) throw new Error("Activity evidence was not acknowledged");
          if (ownerRef.current !== ownerId) return true;

          setProgress((prev) => {
            if (ownerRef.current !== ownerId) return prev;
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
            persistProgress(updated);
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
        id: clientEventId,
        type: "activity_evidence",
        payload: {
          moduleId: formattedModId,
          activityType,
          evidencePayload,
          clientTimestamp,
          clientEventId,
        },
        timestamp: clientTimestamp,
        ownerId,
      });
      saveOfflineQueue(queue);

      setProgress((prev) => ({
        ...prev,
        pendingOfflineCount: ownerRef.current ? queue.filter(action => action.ownerId === ownerRef.current).length : 0,
      }));
      return false;
    },
    [],
  );

  // 8. Compatibility server-graded practice; official sessions use UnifiedAssessmentEngine.
  // Preserve the legacy 80% practice threshold without manufacturing official progress.
  const submitAuthoritativeAssessment = useCallback(
    async (
      moduleId: string,
      answers: Record<number, number>,
      clientDurationSeconds?: number,
      idempotencyKey?: string,
    ) => {
      const ownerId = ownerRef.current;
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
          if (ownerRef.current !== ownerId) return prev;
          const current = prev.moduleProgress[formattedModId] || {
            status: "not_started",
            percent: 0,
            lastOpenedAt: new Date().toISOString(),
            isVerified: false,
          };

          const newVerifiedList = result.verifiedCompletionAwarded
            ? Array.from(new Set([...prev.verifiedModules, formattedModId]))
            : prev.verifiedModules;

          const newAchievements = [...prev.achievements];
          if (result.verifiedCompletionAwarded && !newAchievements.includes(`module_${formattedModId}_verified`)) {
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
                verified: result.verifiedCompletionAwarded,
              },
            },
            moduleProgress: {
              ...prev.moduleProgress,
              [formattedModId]: {
                ...current,
                status: result.verifiedCompletionAwarded ? "completed" : current.status,
                percent: result.verifiedCompletionAwarded ? 100 : current.percent,
                isVerified: result.verifiedCompletionAwarded ? true : current.isVerified,
                verifiedAt: result.verifiedCompletionAwarded ? new Date().toISOString() : current.verifiedAt,
                qualifyingAttemptId: result.attemptId,
              },
            },
            lastUpdated: new Date().toISOString(),
          };

          persistProgress(next);
          return next;
        });

        if (result.verifiedCompletionAwarded) {
          toast.success(
            `Module ${formattedModId} Verified! Official score: ${result.percentage}% (${result.score}/${result.totalPoints})`,
          );
          if (result.newStageBadgeAwarded) {
            toast.success(`Stage Achievement Unlocked: ${result.newStageBadgeAwarded}!`);
          }
        } else {
          toast.info(`Practice score: ${result.percentage}%. Complete the online official assessment for verified module credit.`);
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
      persistProgress(next);
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
      persistProgress(next);
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
      persistProgress(next);
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
    persistProgress(DEFAULT_PROGRESS);
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
