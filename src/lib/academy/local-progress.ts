import type { UserProgress } from "./types";
import { STAGE_BADGES } from "./stage-badges";

export function progressStorageKey(ownerId: string | null) {
  return "cosmic_academy_user_progress_v1:" + (ownerId ?? "guest");
}

export function isOfficialAchievement(id: string) {
  return /^module_\d+_verified$/.test(id) || Object.values(STAGE_BADGES).some(
    badge => badge.badgeId === id || badge.legacyBadgeIds?.includes(id),
  );
}

/** Local navigation/practice survives; official claims require a fresh server read. */
export function clearCachedVerification(progress: UserProgress): UserProgress {
  return { ...progress,
    moduleProgress: Object.fromEntries(Object.entries(progress.moduleProgress).map(([id, item]) => [id, {
      ...item, isVerified: false, verifiedAt: undefined, qualifyingAttemptId: undefined,
    }])),
    quizScores: Object.fromEntries(Object.entries(progress.quizScores).map(([id, score]) => [id, { ...score, verified: false }])),
    achievements: progress.achievements.filter(id => !isOfficialAchievement(id)),
    verifiedModules: [], stageBadges: {},
  };
}

/** Another tab may update navigation, but only the server changes verified state. */
export function mergeCachedNavigation(current: UserProgress, cached: UserProgress): UserProgress {
  const safe = clearCachedVerification(cached);
  return { ...current, ...safe, verifiedModules: current.verifiedModules, stageBadges: current.stageBadges,
    achievements: [...new Set([...safe.achievements, ...current.achievements.filter(isOfficialAchievement)])],
    moduleProgress: Object.fromEntries(Object.entries({ ...current.moduleProgress, ...safe.moduleProgress }).map(([id, item]) => {
      const verified = current.moduleProgress[id];
      return [id, { ...item, isVerified: verified?.isVerified ?? false, verifiedAt: verified?.verifiedAt,
        qualifyingAttemptId: verified?.qualifyingAttemptId,
        ...(verified?.isVerified ? { status: "completed", percent: 100 } : {}) }];
    })),
  };
}
