import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const moduleStatusSchema = z.object({
  moduleId: z.string().min(1).max(20),
});

const submitActivitySchema = z.object({
  moduleId: z.string().min(1).max(20),
  activityId: z.string().min(2).max(100),
  payload: z.record(z.string(), z.unknown()),
  isAccessibleAlternative: z.boolean().optional(),
});

/**
 * Retrieves the authoritative completion status & requirement checklist for a module.
 */
export const getModuleCompletionStatus = createServerFn({ method: "POST" })
  .validator((input) => moduleStatusSchema.parse(input))
  .handler(async ({ data }) => {
    let userId = "";

    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    } catch {
      // Unauthenticated
    }

    if (!userId) {
      userId = `anon_${Math.random().toString(36).substring(2, 9)}`;
    }

    const { evaluateModuleCompletionServer } = await import("./completion.server");
    return evaluateModuleCompletionServer(userId, data.moduleId);
  });

/**
 * Submits an educational simulation or lab outcome for server-side physical validation.
 */
export const submitActivityOutcome = createServerFn({ method: "POST" })
  .validator((input) => submitActivitySchema.parse(input))
  .handler(async ({ data }) => {
    let userId = "";

    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    } catch {
      // Unauthenticated
    }

    if (!userId) {
      userId = `anon_${Math.random().toString(36).substring(2, 9)}`;
    }

    const { recordValidatedActivityOutcomeServer } = await import("./completion.server");
    return recordValidatedActivityOutcomeServer(
      userId,
      data.moduleId,
      data.activityId,
      data.payload,
      data.isAccessibleAlternative,
    );
  });

/**
 * Explicit re-evaluation trigger after finishing a lesson or assessment.
 */
export const recheckModuleCompletion = createServerFn({ method: "POST" })
  .validator((input) => moduleStatusSchema.parse(input))
  .handler(async ({ data }) => {
    let userId = "";

    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    } catch {
      // Unauthenticated
    }

    if (!userId) {
      throw new Error("Student authentication required to record verified module completion.");
    }

    const { evaluateModuleCompletionServer } = await import("./completion.server");
    return evaluateModuleCompletionServer(userId, data.moduleId);
  });
