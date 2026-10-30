import type { ModuleCompletionRule } from "./completion-rules";

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

export interface LearnerModuleRecords {
  existingCompletion?: any;
  lessonProgressRows?: any[];
  activityEvidenceRows?: any[];
  assessmentAttemptRows?: any[];
}

export function evaluateCompletionCriteria(
  rule: ModuleCompletionRule,
  records: LearnerModuleRecords,
) {
  const {
    existingCompletion,
    lessonProgressRows = [],
    activityEvidenceRows = [],
    assessmentAttemptRows = [],
  } = records;

  const checklist: RequirementItemStatus[] = [];
  const missingRequirements: string[] = [];

  // 1. Instructional Sections Evaluation
  const totalReadingTime = lessonProgressRows.reduce(
    (acc, row) => acc + (row.time_spent_seconds || 0),
    0,
  );
  const maxScroll = Math.max(0, ...lessonProgressRows.map((r) => r.scroll_depth_percent || 0));
  const instructionalSatisfied =
    lessonProgressRows.length > 0 ||
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
    const matchingEvidence = activityEvidenceRows.find(
      (ev) =>
        ev.activity_type === act.id ||
        ev.activity_type === act.validationKey ||
        (act.accessibleAlternativeId && ev.activity_type === act.accessibleAlternativeId),
    );

    const isSatisfied = Boolean(matchingEvidence);
    if (matchingEvidence) {
      qualifyingEvidenceIds.push(matchingEvidence.id || "ev_verified");
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
  const bestAttempt = assessmentAttemptRows.length > 0 ? assessmentAttemptRows[0] : null;
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

  let recommendedAction: ModuleCompletionEvaluation["recommendedAction"] = "continue_reading";
  let recommendedActionText = "Explore Lesson Concepts";

  if (existingCompletion) {
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
    allCriteriaSatisfied,
    missingRequirements,
    checklist,
    recommendedAction,
    recommendedActionText,
    qualifyingEvidenceIds,
    bestAttempt,
  };
}
