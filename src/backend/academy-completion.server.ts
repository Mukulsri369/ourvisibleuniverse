import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { PoolConnection } from "mysql2/promise";
import { transaction } from "./db.server";
import type { Principal } from "./authorization.server";
import { lockLearner, academyAudit, stableHash } from "./academy-common.server";
import {
  evaluateCompletionCriteria,
  type ModuleCompletionEvaluation,
} from "../lib/academy/completion-criteria";
import { getModuleCompletionRule } from "../lib/academy/completion-rules";
import { validateActivityOutcomeServer } from "../lib/academy/activity-validator.server";
import { STAGE_BADGES } from "../lib/academy/stage-badges";

export const moduleInput = z
  .string()
  .regex(/^(?:0?[1-9]|1[0-9]|2[0-4])$/)
  .transform((v) => v.padStart(2, "0"));
export const activityInput = z
  .object({
    moduleId: moduleInput,
    activityId: z.string().min(2).max(100),
    payload: z
      .record(z.string(), z.unknown())
      .refine((v) => JSON.stringify(v).length <= 32768, "Evidence too large"),
    isAccessibleAlternative: z.boolean().optional(),
    requestId: z.string().min(1).max(120).optional(),
    clientTimestamp: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export async function syncAchievements(c: PoolConnection, userId: string) {
  const [verified]: any = await c.execute(
    "SELECT module_id FROM academy_verified_completions WHERE user_id=?",
    [userId],
  );
  const ids = new Set<string>(verified.map((r: any) => r.module_id));
  for (const badge of Object.values(STAGE_BADGES)) {
    if (badge.requiredModuleIds.every((id) => ids.has(id))) {
      const [existing]: any = await c.execute(
        "SELECT id FROM academy_stage_achievements WHERE user_id=? AND stage_id=?",
        [userId, badge.stageId],
      );
      await c.execute(
        `INSERT INTO academy_stage_achievements(user_id,stage_id,badge_id,stage_rule_version,qualifying_module_ids)
        VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE badge_id=VALUES(badge_id)`,
        [
          userId,
          badge.stageId,
          badge.badgeId,
          badge.version,
          JSON.stringify(badge.requiredModuleIds),
        ],
      );
      await c.execute(
        `INSERT INTO academy_stage_badges(user_id,stage_id,badge_id) VALUES(?,?,?)
        ON DUPLICATE KEY UPDATE badge_id=VALUES(badge_id)`,
        [userId, badge.stageId, badge.badgeId],
      );
      if (!existing.length)
        await academyAudit(c, userId, "stage_achievement_awarded", String(badge.stageId), {
          moduleIds: badge.requiredModuleIds,
        });
    } else {
      await c.execute("DELETE FROM academy_stage_achievements WHERE user_id=? AND stage_id=?", [
        userId,
        badge.stageId,
      ]);
      await c.execute("DELETE FROM academy_stage_badges WHERE user_id=? AND stage_id=?", [
        userId,
        badge.stageId,
      ]);
    }
  }
  const all = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0")).every((id) =>
    ids.has(id),
  );
  await c.execute(
    `INSERT INTO academy_certificate_eligibility(user_id,course_id,all_stages_completed)
    VALUES(?,'cosmic_journey',?) ON DUPLICATE KEY UPDATE all_stages_completed=VALUES(all_stages_completed),updated_at=CURRENT_TIMESTAMP(6)`,
    [userId, all],
  );
  return all;
}

/** Caller holds the learner row lock. All award writes share the caller's transaction. */
export async function evaluateCompletion(
  c: PoolConnection,
  userId: string,
  moduleId: string,
): Promise<ModuleCompletionEvaluation> {
  const id = moduleInput.parse(moduleId),
    rule = getModuleCompletionRule(id)!;
  const [completions]: any = await c.execute(
    "SELECT * FROM academy_verified_completions WHERE user_id=? AND module_id=?",
    [userId, id],
  );
  const [lessons]: any = await c.execute(
    "SELECT * FROM academy_lesson_progress WHERE user_id=? AND module_id=?",
    [userId, id],
  );
  const [evidence]: any = await c.execute(
    "SELECT * FROM academy_activity_evidence WHERE user_id=? AND module_id=? AND verification_status='verified'",
    [userId, id],
  );
  const [attempts]: any = await c.execute(
    `SELECT * FROM academy_assessment_attempts WHERE user_id=? AND assessment_id=? ORDER BY percentage DESC,submitted_at DESC`,
    [userId, `quiz_module_${id}`],
  );
  const criteria = evaluateCompletionCriteria(rule, {
    existingCompletion: completions[0],
    lessonProgressRows: lessons,
    activityEvidenceRows: evidence,
    assessmentAttemptRows: attempts,
  });
  let complete = completions[0];
  if (criteria.allCriteriaSatisfied && !complete) {
    await c.execute(
      `INSERT INTO academy_verified_completions(user_id,module_id,module_version,approved_rule_version,
      qualifying_assessment_attempt_id,qualifying_evidence_ids,idempotency_key) VALUES(?,?,?,?,?,?,?)`,
      [
        userId,
        id,
        rule.ruleVersion,
        rule.ruleVersion,
        criteria.bestAttempt.id,
        JSON.stringify(criteria.qualifyingEvidenceIds),
        `completion:${userId}:${id}:${rule.ruleVersion}`,
      ],
    );
    await c.execute(
      `INSERT INTO academy_module_progress(user_id,module_id,status,percent,verified_quiz_passed,completed_at)
      VALUES(?,?,'completed',100,true,CURRENT_TIMESTAMP(6)) ON DUPLICATE KEY UPDATE status='completed',percent=100,
      verified_quiz_passed=true,completed_at=COALESCE(completed_at,CURRENT_TIMESTAMP(6)),updated_at=CURRENT_TIMESTAMP(6)`,
      [userId, id],
    );
    await academyAudit(c, userId, "verified_completion_awarded", id, {
      attemptId: criteria.bestAttempt.id,
      evidenceIds: criteria.qualifyingEvidenceIds,
    });
    const [created]: any = await c.execute(
      "SELECT * FROM academy_verified_completions WHERE user_id=? AND module_id=?",
      [userId, id],
    );
    complete = created[0];
  }
  await syncAchievements(c, userId);
  return {
    moduleId: id,
    moduleTitle: rule.title,
    stageId: rule.stageId,
    isVerifiedComplete: Boolean(complete),
    ...(complete ? { verifiedAt: new Date(complete.verified_at).toISOString() } : {}),
    allCriteriaSatisfied: criteria.allCriteriaSatisfied,
    missingRequirements: criteria.missingRequirements,
    checklist: criteria.checklist,
    recommendedAction: complete ? "certified" : criteria.recommendedAction,
    recommendedActionText: complete ? "Module Certified" : criteria.recommendedActionText,
  };
}
export async function recheckCompletion(principal: Principal | null, moduleId: string) {
  return transaction(async (c) => evaluateCompletion(c, await lockLearner(c, principal), moduleId));
}
export async function recordActivity(principal: Principal | null, input: unknown) {
  const data = activityInput.parse(input),
    rule = getModuleCompletionRule(data.moduleId)!;
  const activity = rule.requiredActivities.find((a) =>
    [a.id, a.validationKey, a.accessibleAlternativeId].includes(data.activityId),
  );
  if (!activity) throw new Error("Activity does not belong to this module");
  const accessible = data.activityId === activity.accessibleAlternativeId;
  if (data.isAccessibleAlternative && !accessible)
    throw new Error("Accessible activity identifier required");
  const validation = validateActivityOutcomeServer(
    activity.validationKey,
    data.payload,
    accessible,
  );
  return transaction(async (c) => {
    const userId = await lockLearner(c, principal);
    const hash = stableHash({
      moduleId: data.moduleId,
      activityId: data.activityId,
      payload: data.payload,
      accessible,
    });
    const requestId = data.requestId ?? hash;
    const [prior]: any = await c.execute(
      "SELECT id,payload_hash FROM academy_activity_evidence WHERE user_id=? AND request_id=?",
      [userId, requestId],
    );
    if (prior.length && prior[0].payload_hash !== hash)
      throw new Error("Activity retry conflicts with recorded evidence");
    if (!validation.isValid)
      return {
        success: false,
        reason: validation.reason,
        metrics: validation.metrics,
        evaluation: await evaluateCompletion(c, userId, data.moduleId),
      };
    const id = prior[0]?.id ?? randomUUID();
    if (!prior.length)
      await c.execute(
        `INSERT INTO academy_activity_evidence(id,user_id,module_id,activity_type,evidence_payload,
      client_timestamp,verification_status,verified_at,request_id,payload_hash) VALUES(?,?,?,?,?,?,'verified',CURRENT_TIMESTAMP(6),?,?)`,
        [
          id,
          userId,
          data.moduleId,
          data.activityId,
          JSON.stringify({
            ...data.payload,
            validationReason: validation.reason,
            isAccessibleAlternative: accessible,
          }),
          data.clientTimestamp ? new Date(data.clientTimestamp) : new Date(),
          requestId,
          hash,
        ],
      );
    return {
      success: true,
      reason: validation.reason,
      metrics: validation.metrics,
      evidenceId: id,
      evaluation: await evaluateCompletion(c, userId, data.moduleId),
    };
  });
}
