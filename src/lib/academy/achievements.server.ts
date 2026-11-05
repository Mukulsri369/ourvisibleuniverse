// @ts-nocheck
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { STAGE_BADGES, type StageBadgeDefinition } from "./stage-badges";

export interface StageAchievementStatus {
  stageId: number;
  badge: StageBadgeDefinition;
  isUnlocked: boolean;
  awardedAt: string | null;
  version: string;
  completedModuleIds: string[];
  missingModuleIds: string[];
  progressPercent: number; // 0, 25, 50, 75, 100
}

export interface AuthoritativeAchievementsPayload {
  userId: string;
  stages: Record<number, StageAchievementStatus>;
  totalEarnedCount: number;
  nextMilestone: StageAchievementStatus | null;
  allStagesUnlocked: boolean;
  totalVerifiedModules: number;
}

/**
 * Server-authoritative evaluator for Stage Achievements.
 * Rules enforced:
 * 1. Awards must be issued server-side only.
 * 2. All four stage modules must be verified in academy_verified_completions.
 * 3. Awards must be idempotent (onConflict user_id, stage_id).
 * 4. Students cannot self-award or modify achievements.
 * 5. Issuance date and achievement version (1.0.0) are stored.
 * 6. Already earned valid achievements preserve original awarded_at date.
 * 7. Invalidation or revocation of module completion removes/unlinks stage badge.
 */
export async function syncAndEvaluateStageAchievementsServer(
  userId: string,
): Promise<AuthoritativeAchievementsPayload> {
  if (!userId || userId.startsWith("anon_")) return buildAnonymousAchievementState(userId || "guest");
  const { data, error } = await supabaseAdmin.rpc("academy_sync_stage_achievements", {
    p_user_id: userId, p_badges: STAGE_BADGES,
  });
  if (error || !data) throw new Error("Achievement revalidation is unavailable. Existing awards have not been assumed revoked.");
  const verified = new Set<string>(data.verifiedModuleIds);
  const existing = new Map(data.achievements.map(row => [row.stageId, row]));
  const stages: Record<number, StageAchievementStatus> = {};
  let totalEarned = 0, nextMilestone: StageAchievementStatus | null = null;
  for (let stageId = 1; stageId <= 6; stageId++) {
    const badge = STAGE_BADGES[stageId], row = existing.get(stageId);
    const completed = badge.requiredModuleIds.filter(id => verified.has(id));
    const missing = badge.requiredModuleIds.filter(id => !verified.has(id));
    const unlocked = completed.length === 4 && Boolean(row);
    const status: StageAchievementStatus = { stageId, badge, isUnlocked: unlocked,
      awardedAt: unlocked ? row.awardedAt : null, version: row?.version || badge.version,
      completedModuleIds: completed, missingModuleIds: missing, progressPercent: Math.round(completed.length / 4 * 100) };
    stages[stageId] = status;
    if (unlocked) totalEarned++;
    else if (!nextMilestone) nextMilestone = status;
  }
  return { userId, stages, totalEarnedCount: totalEarned, nextMilestone,
    allStagesUnlocked: totalEarned === 6, totalVerifiedModules: verified.size };
}

/**
 * Builds safe anonymous / guest preview state for offline or logged-out students.
 */
function buildAnonymousAchievementState(guestId: string): AuthoritativeAchievementsPayload {
  const stagesResult: Record<number, StageAchievementStatus> = {};
  let nextMilestone: StageAchievementStatus | null = null;

  for (let s = 1; s <= 6; s++) {
    const badgeDef = STAGE_BADGES[s];
    const status: StageAchievementStatus = {
      stageId: s,
      badge: badgeDef,
      isUnlocked: false,
      awardedAt: null,
      version: badgeDef.version,
      completedModuleIds: [],
      missingModuleIds: [...badgeDef.requiredModuleIds],
      progressPercent: 0,
    };
    stagesResult[s] = status;
    if (!nextMilestone) {
      nextMilestone = status;
    }
  }

  return {
    userId: guestId,
    stages: stagesResult,
    totalEarnedCount: 0,
    nextMilestone,
    allStagesUnlocked: false,
    totalVerifiedModules: 0,
  };
}
