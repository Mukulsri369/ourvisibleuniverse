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
  if (!userId || userId.startsWith("anon_")) {
    return buildAnonymousAchievementState(userId || "guest");
  }

  // 1. Fetch all authoritative verified completions for this student
  const { data: verifiedRows, error: verifiedErr } = await supabaseAdmin
    .from("academy_verified_completions")
    .select("module_id, verified_at")
    .eq("user_id", userId);

  if (verifiedErr) {
    console.error("Error fetching verified completions for achievements:", verifiedErr.message);
  }

  const verifiedModuleSet = new Set((verifiedRows || []).map((r) => r.module_id));

  // 2. Fetch existing stage achievement rows
  const { data: existingAchievements, error: achErr } = await supabaseAdmin
    .from("academy_stage_achievements")
    .select("stage_id, badge_id, awarded_at, stage_rule_version")
    .eq("user_id", userId);

  if (achErr) {
    console.error("Error fetching existing stage achievements:", achErr.message);
  }

  const existingMap = new Map<number, { badge_id: string; awarded_at: string; version: string }>();
  for (const row of existingAchievements || []) {
    existingMap.set(row.stage_id, {
      badge_id: row.badge_id,
      awarded_at: row.awarded_at,
      version: row.stage_rule_version || "1.0.0",
    });
  }

  const stagesResult: Record<number, StageAchievementStatus> = {};
  let totalEarned = 0;
  let nextMilestone: StageAchievementStatus | null = null;

  for (let s = 1; s <= 6; s++) {
    const badgeDef = STAGE_BADGES[s];
    const required = badgeDef.requiredModuleIds;
    const completed = required.filter((id) => verifiedModuleSet.has(id));
    const missing = required.filter((id) => !verifiedModuleSet.has(id));
    const isEligible = completed.length === 4;

    let awardedAt: string | null = null;
    let version = badgeDef.version;

    if (isEligible) {
      const existing = existingMap.get(s);
      // Preserve already earned date or use current timestamp
      awardedAt = existing?.awarded_at || new Date().toISOString();
      version = existing?.version || badgeDef.version;

      // Idempotently upsert server-side award
      await supabaseAdmin.from("academy_stage_achievements").upsert(
        {
          user_id: userId,
          stage_id: s,
          badge_id: badgeDef.badgeId,
          stage_rule_version: version,
          qualifying_module_ids: required,
          awarded_at: awardedAt,
        },
        { onConflict: "user_id,stage_id" },
      );

      await supabaseAdmin.from("academy_stage_badges").upsert(
        {
          user_id: userId,
          stage_id: s,
          badge_id: badgeDef.badgeId,
          awarded_at: awardedAt,
        },
        { onConflict: "user_id,stage_id" },
      );

      totalEarned++;
    } else {
      // If student previously had a badge record, but now has < 4 verified modules (revoked/invalidated)
      if (existingMap.has(s)) {
        console.warn(
          `[ACHIEVEMENT REVALIDATION] Stage ${s} missing required modules for user ${userId}. Revoking unearned badge.`,
        );
        await supabaseAdmin
          .from("academy_stage_achievements")
          .delete()
          .eq("user_id", userId)
          .eq("stage_id", s);

        await supabaseAdmin
          .from("academy_stage_badges")
          .delete()
          .eq("user_id", userId)
          .eq("stage_id", s);
      }
    }

    const status: StageAchievementStatus = {
      stageId: s,
      badge: badgeDef,
      isUnlocked: isEligible,
      awardedAt,
      version,
      completedModuleIds: completed,
      missingModuleIds: missing,
      progressPercent: Math.round((completed.length / 4) * 100),
    };

    stagesResult[s] = status;

    if (!isEligible && !nextMilestone) {
      nextMilestone = status;
    }
  }

  return {
    userId,
    stages: stagesResult,
    totalEarnedCount: totalEarned,
    nextMilestone,
    allStagesUnlocked: totalEarned === 6,
    totalVerifiedModules: verifiedModuleSet.size,
  };
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
