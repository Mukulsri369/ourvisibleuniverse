/**
 * Centralized Verified Module Completion Engine
 * Server-authoritative evaluation enforcing strict educational requirements.
 * CRITICAL SECURITY INVARIANT: No student can achieve verified completion by clicking "Mark Complete".
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getModuleCompletionRule,
  type ModuleCompletionRule,
  type ActivityRequirement,
} from "./completion-rules";
import { validateActivityOutcomeServer } from "./activity-validator.server";
import { STAGE_BADGES } from "./stage-badges";

export interface RequirementItemStatus {
  id: string;
  category: "instructional" | "activity" | "assessment";
  title: string;
  description: string;
  isSatisfied: boolean;
  currentValue?: string | number;
  requiredValue?: string | number;
  accessibleAlternativeAvailable?: boolean;
}

export interface ModuleCompletionEvaluation {
  moduleId: string;
  moduleTitle: string;
  stageId: number;
  isVerifiedComplete: boolean;
  verifiedAt?: string;
  allCriteriaSatisfied: boolean;
  missingRequirements: string[];
  checklist: RequirementItemStatus[];
  recommendedAction: "continue_reading" | "complete_activity" | "take_assessment" | "certified";
  recommendedActionText: string;
}

/**
 * Evaluates whether a student has satisfied all pedagogical criteria for a module.
 * If all criteria are met, atomically issues official verified completion and checks stage badges.
 */
export async function evaluateModuleCompletionServer(
  userId: string,
  moduleId: string,
): Promise<ModuleCompletionEvaluation> {
  const formattedModId = moduleId.padStart(2, "0");
  const rule = getModuleCompletionRule(formattedModId);

  if (!rule) {
    throw new Error(`No completion rule registered for module ${formattedModId}`);
  }

  // Fetch all learner records for this module in parallel
  const [
    { data: existingCompletion },
    { data: lessonProgressRows },
    { data: activityEvidenceRows },
    { data: assessmentAttemptRows },
  ] = await Promise.all([
    supabaseAdmin
      .from("academy_verified_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", formattedModId)
      .maybeSingle(),
    supabaseAdmin
      .from("academy_lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", formattedModId),
    supabaseAdmin
      .from("academy_activity_evidence")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", formattedModId)
      .eq("verification_status", "verified"),
    supabaseAdmin
      .from("academy_assessment_attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("assessment_id", `quiz_module_${formattedModId}`)
      .order("percentage", { ascending: false }),
  ]);

  const checklist: RequirementItemStatus[] = [];
  const missingRequirements: string[] = [];

  // 1. Instructional Sections Evaluation
  // Check if student has recorded lesson progress (reading/scroll depth)
  const totalReadingTime = (lessonProgressRows || []).reduce(
    (acc, row) => acc + (row.time_spent_seconds || 0),
    0,
  );
  const maxScroll = Math.max(0, ...(lessonProgressRows || []).map((r) => r.scroll_depth_percent || 0));
  const instructionalSatisfied =
    (lessonProgressRows && lessonProgressRows.length > 0) ||
    totalReadingTime >= rule.minimumReadingSeconds ||
    maxScroll >= 50;

  checklist.push({
    id: "req_instructional",
    category: "instructional",
    title: "Lesson Exploration & Scientific Concepts",
    description: `Engage with key lesson concepts and instructional content (${rule.requiredSections.map((s) => s.title).join(", ")}).`,
    isSatisfied: instructionalSatisfied,
    currentValue: `${totalReadingTime}s engaged`,
    requiredValue: `${rule.minimumReadingSeconds}s minimum`,
  });

  if (!instructionalSatisfied) {
    missingRequirements.push("Review key lesson instructional sections");
  }

  // 2. Educational Activity & Challenge Telemetry Evaluation
  const qualifyingEvidenceIds: string[] = [];
  let allActivitiesSatisfied = true;

  for (const act of rule.requiredActivities) {
    // Check if there is verified evidence for this activity or its accessible alternative
    const matchingEvidence = (activityEvidenceRows || []).find(
      (ev) =>
        ev.activity_type === act.id ||
        ev.activity_type === act.validationKey ||
        (act.accessibleAlternativeId && ev.activity_type === act.accessibleAlternativeId),
    );

    const isSatisfied = Boolean(matchingEvidence);
    if (matchingEvidence) {
      qualifyingEvidenceIds.push(matchingEvidence.id);
    } else {
      allActivitiesSatisfied = false;
      missingRequirements.push(`Complete required activity: ${act.title}`);
    }

    checklist.push({
      id: act.id,
      category: "activity",
      title: act.title,
      description: `${act.description} Criteria: ${act.measurableCriteria}`,
      isSatisfied,
      currentValue: isSatisfied ? "Verified outcome recorded" : "Not yet completed",
      accessibleAlternativeAvailable: Boolean(act.accessibleAlternativeId),
    });
  }

  // 3. Knowledge Assessment Evaluation
  const bestAttempt = assessmentAttemptRows && assessmentAttemptRows.length > 0 ? assessmentAttemptRows[0] : null;
  const assessmentPassed = Boolean(bestAttempt && bestAttempt.percentage >= rule.passingScorePct);

  checklist.push({
    id: "req_assessment",
    category: "assessment",
    title: "Verified Knowledge Assessment",
    description: `Pass the authoritative module assessment with at least ${rule.passingScorePct}%.`,
    isSatisfied: assessmentPassed,
    currentValue: bestAttempt ? `${bestAttempt.percentage}%` : "No attempt submitted",
    requiredValue: `${rule.passingScorePct}% passing threshold`,
  });

  if (!assessmentPassed) {
    missingRequirements.push(
      `Pass the knowledge check with at least ${rule.passingScorePct}% (current best: ${
        bestAttempt ? bestAttempt.percentage + "%" : "none"
      })`,
    );
  }

  const allCriteriaSatisfied = instructionalSatisfied && allActivitiesSatisfied && assessmentPassed;
  let isVerifiedComplete = Boolean(existingCompletion);
  let verifiedAt = existingCompletion?.verified_at;

  // If all criteria satisfied and not already officially verified, execute privileged completion!
  if (allCriteriaSatisfied && !isVerifiedComplete) {
    const completionIdempotencyKey = `comp_${userId}_${formattedModId}`;

    const { error: compError } = await supabaseAdmin.from("academy_verified_completions").upsert(
      {
        user_id: userId,
        module_id: formattedModId,
        module_version: rule.ruleVersion,
        approved_rule_version: rule.ruleVersion,
        qualifying_assessment_attempt_id: bestAttempt?.id || null,
        qualifying_evidence_ids: qualifyingEvidenceIds,
        verified_at: new Date().toISOString(),
        idempotency_key: completionIdempotencyKey,
      },
      { onConflict: "user_id,module_id" },
    );

    if (!compError) {
      isVerifiedComplete = true;
      verifiedAt = new Date().toISOString();

      // Update module progress cache table to 100% completed
      await supabaseAdmin.from("academy_module_progress").upsert(
        {
          user_id: userId,
          module_id: formattedModId,
          status: "completed",
          percent: 100,
          verified_quiz_passed: true,
          completed_at: verifiedAt,
          updated_at: verifiedAt,
        },
        { onConflict: "user_id,module_id" },
      );

      // Check Stage Achievement (4 modules per stage)
      const stageId = rule.stageId;
      const startMod = (stageId - 1) * 4 + 1;
      const stageModIds = [0, 1, 2, 3].map((offset) => String(startMod + offset).padStart(2, "0"));

      const { data: stageCompletions } = await supabaseAdmin
        .from("academy_verified_completions")
        .select("module_id")
        .eq("user_id", userId)
        .in("module_id", stageModIds);

      if (stageCompletions && stageCompletions.length === 4) {
        const badgeInfo = STAGE_BADGES[stageId];
        if (badgeInfo) {
          await supabaseAdmin.from("academy_stage_achievements").upsert(
            {
              user_id: userId,
              stage_id: stageId,
              badge_id: badgeInfo.badgeId,
              stage_rule_version: "1.0.0",
              qualifying_module_ids: stageModIds,
              awarded_at: verifiedAt,
            },
            { onConflict: "user_id,stage_id" },
          );

          await supabaseAdmin.from("academy_stage_badges").upsert(
            {
              user_id: userId,
              stage_id: stageId,
              badge_id: badgeInfo.badgeId,
              awarded_at: verifiedAt,
            },
            { onConflict: "user_id,stage_id" },
          );
        }
      }

      // Check Course Certificate Eligibility (all 24 modules certified)
      const { count: totalVerifiedCount } = await supabaseAdmin
        .from("academy_verified_completions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (totalVerifiedCount && totalVerifiedCount >= 24) {
        await supabaseAdmin.from("academy_certificate_eligibility").upsert(
          {
            user_id: userId,
            course_id: "cosmic_journey",
            course_version: "1.0.0",
            all_stages_completed: true,
            eligible_at: verifiedAt,
            updated_at: verifiedAt,
          },
          { onConflict: "user_id,course_id,course_version" },
        );
      }

      // Audit Log
      await supabaseAdmin.from("academy_audit_log").insert({
        actor_id: userId,
        actor_role: "service_role",
        action: "verified_completion_awarded",
        entity_type: "academy_verified_completions",
        entity_id: formattedModId,
        new_state: {
          qualifying_attempt: bestAttempt?.id,
          qualifying_evidence: qualifyingEvidenceIds,
        },
        idempotency_key: completionIdempotencyKey,
      });
    }
  }

  // Determine recommended next action for learner
  let recommendedAction: ModuleCompletionEvaluation["recommendedAction"] = "continue_reading";
  let recommendedActionText = "Explore Lesson Concepts";

  if (isVerifiedComplete) {
    recommendedAction = "certified";
    recommendedActionText = "Module Certified";
  } else if (!instructionalSatisfied) {
    recommendedAction = "continue_reading";
    recommendedActionText = "Continue Learning Lesson";
  } else if (!allActivitiesSatisfied) {
    recommendedAction = "complete_activity";
    recommendedActionText = "Complete Required Activity";
  } else if (!assessmentPassed) {
    recommendedAction = "take_assessment";
    recommendedActionText = "Take Knowledge Check";
  }

  return {
    moduleId: formattedModId,
    moduleTitle: rule.title,
    stageId: rule.stageId,
    isVerifiedComplete,
    verifiedAt,
    allCriteriaSatisfied,
    missingRequirements,
    checklist,
    recommendedAction,
    recommendedActionText,
  };
}

/**
 * Submits an educational activity / simulation outcome for authoritative server validation.
 */
export async function recordValidatedActivityOutcomeServer(
  userId: string,
  moduleId: string,
  activityId: string,
  outcomePayload: Record<string, unknown>,
  isAccessibleAlternative: boolean = false,
) {
  const formattedModId = moduleId.padStart(2, "0");
  const rule = getModuleCompletionRule(formattedModId);

  if (!rule) {
    throw new Error(`Module ${formattedModId} completion rule not found`);
  }

  const activityReq = rule.requiredActivities.find(
    (a) => a.id === activityId || a.accessibleAlternativeId === activityId,
  );

  const validationKey = activityReq?.validationKey || activityId;

  // Validate telemetry outcome against true astronomical / physics criteria
  const validation = validateActivityOutcomeServer(
    validationKey,
    outcomePayload,
    isAccessibleAlternative,
  );

  if (!validation.isValid) {
    return {
      success: false,
      reason: validation.reason,
      metrics: validation.metrics,
      evaluation: await evaluateModuleCompletionServer(userId, formattedModId),
    };
  }

  // Insert validated evidence
  const { data: evidence, error: evError } = await supabaseAdmin
    .from("academy_activity_evidence")
    .insert({
      user_id: userId,
      module_id: formattedModId,
      activity_type: activityId,
      evidence_payload: {
        ...outcomePayload,
        validationReason: validation.reason,
        validatedAt: new Date().toISOString(),
        isAccessibleAlternative,
      } as any,
      client_timestamp: new Date().toISOString(),
      verification_status: "verified",
      verified_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (evError) {
    console.warn("Could not insert activity evidence:", evError.message);
  }

  // Re-evaluate module completion automatically
  const updatedEvaluation = await evaluateModuleCompletionServer(userId, formattedModId);

  return {
    success: true,
    reason: validation.reason,
    metrics: validation.metrics,
    evidenceId: evidence?.id,
    evaluation: updatedEvaluation,
  };
}
