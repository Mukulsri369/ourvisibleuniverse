import assert from "node:assert/strict";
import { test } from "node:test";
import type { UserProgress } from "../src/lib/academy/types";
import { clearCachedVerification, mergeCachedNavigation, progressStorageKey } from "../src/lib/academy/local-progress";

test("each signed-in account and anonymous practice have separate local progress keys", () => {
  assert.equal(new Set([progressStorageKey("account-a"), progressStorageKey("account-b"), progressStorageKey(null)]).size, 3);
  assert.notEqual(progressStorageKey(null), "cosmic_academy_user_progress_v1");
});

test("untrusted cache preserves navigation and practice without claiming official awards", () => {
  const cached: UserProgress = { selectedLevel: "explorer", moduleProgress: {
    "01": { status: "completed", percent: 100, lastOpenedAt: "2026-11-04", isVerified: true, verifiedAt: "old", qualifyingAttemptId: "old-attempt" },
  }, completedLessons: ["01-core"], quizScores: { practice: { score: 4, total: 5, attempts: 2, verified: true } },
    bookmarks: ["01"], lastOpenedModuleId: "01", achievements: ["welcome_explorer", "quiz_ace", "module_01_verified", "badge_stage_01_first_stargazer", "badge_stage_01_space_discoverer"],
    verifiedModules: ["01"], stageBadges: { 1: { badgeId: "badge_stage_01_first_stargazer", awardedAt: "old" } }, pendingOfflineCount: 1, lastUpdated: "old" };
  const original = structuredClone(cached), restored = clearCachedVerification(cached);
  assert.deepEqual(cached, original, "Hydration must not mutate the preserved original cache");
  assert.deepEqual(restored.bookmarks, ["01"]); assert.deepEqual(restored.completedLessons, ["01-core"]);
  assert.equal(restored.moduleProgress["01"].percent, 100); assert.equal(restored.quizScores.practice.score, 4);
  assert.equal(restored.quizScores.practice.verified, false); assert.equal(restored.moduleProgress["01"].isVerified, false);
  assert.equal(restored.moduleProgress["01"].verifiedAt, undefined); assert.equal(restored.moduleProgress["01"].qualifyingAttemptId, undefined);
  assert.deepEqual(restored.verifiedModules, []); assert.deepEqual(restored.stageBadges, {});
  assert.deepEqual(restored.achievements, ["welcome_explorer", "quiz_ace"]);
  const merged = mergeCachedNavigation(cached, { ...restored, bookmarks: ["02"], verifiedModules: ["24"],
    moduleProgress: { ...restored.moduleProgress, "24": { percent: 100, status: "completed", lastOpenedAt: "old", isVerified: true } } });
  assert.deepEqual(merged.bookmarks, ["02"]);
  assert.deepEqual(merged.verifiedModules, ["01"]);
  assert.equal(merged.moduleProgress["01"].isVerified, true);
  assert.equal(merged.moduleProgress["01"].qualifyingAttemptId, "old-attempt");
  assert.equal(merged.moduleProgress["24"].isVerified, false, "A cross-tab cache cannot add an official award");
});
