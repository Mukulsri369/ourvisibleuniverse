import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireIndependentAuth } from "@/backend/session-middleware";
const moduleStatusSchema = z
  .object({ moduleId: z.string().regex(/^(?:0?[1-9]|1[0-9]|2[0-4])$/) })
  .strict();
const activitySchema = moduleStatusSchema.extend({
  activityId: z.string().min(2).max(100),
  payload: z.record(z.string(), z.unknown()),
  isAccessibleAlternative: z.boolean().optional(),
  requestId: z.string().min(1).max(120).optional(),
});
export const getModuleCompletionStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => moduleStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const [{ getRequest }, { independentAuth }] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/backend/runtime.server"),
    ]);
    const session = await independentAuth().api.getSession({ headers: getRequest().headers });
    if (session?.user.emailVerified) {
      const { recheckCompletion } = await import("@/backend/academy-completion.server");
      return recheckCompletion(session.user, data.moduleId);
    }
    const [{ getModuleCompletionRule }, { evaluateCompletionCriteria }] = await Promise.all([
      import("./completion-rules"),
      import("./completion-criteria"),
    ]);
    const moduleId = data.moduleId.padStart(2, "0"),
      rule = getModuleCompletionRule(moduleId)!;
    const criteria = evaluateCompletionCriteria(rule, {});
    return {
      moduleId,
      moduleTitle: rule.title,
      stageId: rule.stageId,
      isVerifiedComplete: false,
      allCriteriaSatisfied: false,
      missingRequirements: criteria.missingRequirements,
      checklist: criteria.checklist,
      recommendedAction: criteria.recommendedAction,
      recommendedActionText: criteria.recommendedActionText,
    };
  });
export const submitActivityOutcome = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => activitySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { recordActivity } = await import("@/backend/academy-completion.server");
    return recordActivity(context.principal, data);
  });
export const recheckModuleCompletion = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => moduleStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { recheckCompletion } = await import("@/backend/academy-completion.server");
    return recheckCompletion(context.principal, data.moduleId);
  });
