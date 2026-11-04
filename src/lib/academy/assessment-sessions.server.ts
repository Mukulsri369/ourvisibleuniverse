import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssessmentResult, CanonicalAssessmentQuestion } from "./assessment-types";
import type { LearningLevel } from "./types";

export interface OfficialSession {
  id: string;
  user_id: string;
  module_id: string;
  learning_level: LearningLevel;
  question_snapshot: CanonicalAssessmentQuestion[];
  started_at: string;
  result_payload: AssessmentResult | null;
}

/** A new repository instance has no process-local attempt state. */
export function createOfficialAssessmentSessions(client: SupabaseClient) {
  return {
    async start(input: Omit<OfficialSession, "started_at" | "result_payload">) {
      const { data, error } = await client.from("academy_assessment_sessions").insert(input).select("started_at").single();
      if (error || !data?.started_at) throw new Error("Official assessment could not be saved. Please retry when the service is available.");
      return data.started_at as string;
    },
    async load(id: string, userId: string, moduleId: string, level: LearningLevel): Promise<OfficialSession> {
      const { data, error } = await client.from("academy_assessment_sessions").select("*")
        .eq("id", id).eq("user_id", userId).eq("module_id", moduleId).eq("learning_level", level).maybeSingle();
      if (error) throw new Error("Official assessment storage is unavailable. Please retry.");
      if (!data) throw new Error("Attempt ownership mismatch or official session missing.");
      return data as OfficialSession;
    },
    async previouslySeen(userId: string, level: LearningLevel): Promise<string[]> {
      const { data, error } = await client.from("academy_assessment_sessions").select("question_snapshot")
        .eq("user_id", userId).eq("module_id", "exam").eq("learning_level", level).order("started_at", { ascending: false }).limit(100);
      if (error) throw new Error("Official assessment history is unavailable. Please retry.");
      return [...new Set((data ?? []).flatMap(row => (row.question_snapshot as CanonicalAssessmentQuestion[]).map(question => question.id)))];
    },
    async commit(id: string, userId: string, answers: Record<string, number | number[]>, result: AssessmentResult | null): Promise<AssessmentResult> {
      const { data, error } = await client.rpc("academy_commit_official_attempt", {
        p_session_id: id, p_user_id: userId, p_answers: answers, p_result: result,
      });
      if (error || !data) throw new Error("Official assessment was not confirmed. Retry the same answers; no official success is assumed.");
      return data as AssessmentResult;
    },
  };
}

// Legacy acceptance fixtures use the explicit placeholder emulator; a real target
// always exercises durable storage, even if NODE_ENV happens to be test.
export function usesIsolatedAcademyFixtures() {
  return process.env.NODE_ENV === "test" && process.env.SUPABASE_URL === "https://placeholder-project.supabase.co";
}
