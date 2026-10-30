import { createServerFn } from "@tanstack/react-start";
import { requireAcademySession, requireIndependentAuth } from "@/backend/session-middleware";
import { storedAssessmentStartInput, storedAssessmentSubmitInput } from "./assessment-inputs";
export const startAssessmentAttempt = createServerFn({ method: "POST" })
  .middleware([requireAcademySession])
  .inputValidator((input) => storedAssessmentStartInput.parse(input))
  .handler(async ({ data, context }) => {
    const { startStoredAssessment } = await import("@/backend/academy-assessments.server");
    return startStoredAssessment(context.principal, data);
  });
export const submitAssessmentAttempt = createServerFn({ method: "POST" })
  .middleware([requireAcademySession])
  .inputValidator((input) => storedAssessmentSubmitInput.parse(input))
  .handler(async ({ data, context }) => {
    const { gradeStoredAssessment } = await import("@/backend/academy-assessments.server");
    return gradeStoredAssessment(context.principal, data);
  });
export const getFinalExamEligibility = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input: { userId?: string } = {}) => input)
  .handler(async ({ context }) => {
    const { database } = await import("@/backend/db.server");
    const [rows]: any = await database().execute(
      "SELECT module_id FROM academy_verified_completions WHERE user_id=? AND module_version='1.0.0'",
      [context.userId],
    );
    const ids = rows.map((r: any) => r.module_id);
    const { getModuleCompletionRule } = await import("./completion-rules");
    const missingModules = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0"))
      .filter((id) => !ids.includes(id))
      .map((id) => ({
        id,
        title: getModuleCompletionRule(id)!.title,
        stageId: getModuleCompletionRule(id)!.stageId,
      }));
    return {
      isEligible: missingModules.length === 0,
      totalVerified: 24 - missingModules.length,
      requiredTotal: 24,
      missingModules,
      verifiedModuleIds: ids,
      courseId: "cosmic_journey",
      courseVersion: "1.0.0",
    };
  });
export const claimOfficialCertificate = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input: { courseVersion?: string; userId?: string } = {}) => input)
  .handler(async ({ context }) => {
    const { issueCertificate } = await import("@/backend/academy-certificates.server");
    const result = await issueCertificate(context.principal);
    return {
      eligible: true,
      scorePercentage: result.certificate.finalScorePercentage,
      eligibleAt: result.certificate.issueDate,
      courseId: result.certificate.courseId,
      courseVersion: result.certificate.courseVersion,
    };
  });
