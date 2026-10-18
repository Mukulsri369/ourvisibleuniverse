import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AuthoritativeAchievementsPayload } from "./achievements.server";

/**
 * Retrieves the student's authoritative stage achievements and badges.
 * Evaluated strictly server-side against academy_verified_completions.
 */
export const getAuthoritativeAchievements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuthoritativeAchievementsPayload> => {
    const { syncAndEvaluateStageAchievementsServer } = await import("./achievements.server");
    return syncAndEvaluateStageAchievementsServer(context.userId);
  });
