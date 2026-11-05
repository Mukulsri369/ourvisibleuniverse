import crypto from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { certificateRowHash } from "./certificate-integrity.server";
import { sanitizeStudentName } from "./student-types";
import { CERTIFICATE_CONSTANTS } from "./certificate-types";
import type { LearningLevel } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";
// These additive RPCs precede regenerated dashboard types; runtime contracts are
// covered against PostgreSQL and the built application, not the fixture emulator.
const db = supabaseAdmin as unknown as SupabaseClient;

const number = () => `OVU-CERT-${new Date().getUTCFullYear()}-${crypto.randomBytes(6).toString("hex").toUpperCase().match(/.{4}/g)!.join("-")}`;
const signed = (row: Record<string, any>) => {
  row.metadata = { ...row.metadata, signatureVersion: 2 };
  row.verification_hash = certificateRowHash(row);
  return row;
};

export async function issueCertificateTransaction(userId: string) {
  const { data: context, error } = await db.rpc("academy_certificate_context", { p_user_id: userId });
  if (error || !context) throw new Error("Certificate issuance denied or qualification storage unavailable. All 24 verified modules and an official final score of at least 80% are required.");
  if (context.existing) return { certificate: context.existing, isExisting: true };
  const display = sanitizeStudentName(context.profile?.display_name, "Cosmic Explorer");
  const payload = signed({ certificate_number: number(), user_id: userId,
    student_public_id: context.profile?.student_public_id || "STU-" + crypto.randomBytes(4).toString("hex").toUpperCase(),
    display_name: display, certificate_name: sanitizeStudentName(context.profile?.certificate_name, display),
    learning_level: context.level, course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: CERTIFICATE_CONSTANTS.COURSE_VERSION, curriculum_version: CERTIFICATE_CONSTANTS.CURRICULUM_VERSION,
    final_score_percentage: context.score, issue_date: new Date().toISOString().slice(0, 10),
    metadata: { qualifyingAttemptId: context.attemptId, totalModulesCompleted: 24, passingThreshold: 80 },
  });
  const result = await db.rpc("academy_issue_certificate", { p_user_id: userId, p_attempt_id: context.attemptId, p_payload: payload });
  if (result.error || !result.data?.certificate) throw new Error("Certificate transaction was not confirmed. Retry; no issuance success is assumed.");
  return result.data as { certificate: Record<string, any>; isExisting: boolean };
}

export async function changeCertificateTransaction(actorId: string, certificateNumber: string, action: "revoke" | "correct" | "reissue",
  reason: string, updates: { updatedCertificateName?: string; updatedLearningLevel?: LearningLevel } = {}) {
  if (!reason?.trim() || reason.trim().length > 2000) throw new Error("A reason of 1–2000 characters is required.");
  const cleaned = certificateNumber.trim().toUpperCase();
  const { data: cert, error } = await db.from("academy_certificates").select("*").eq("certificate_number", cleaned).maybeSingle();
  if (error || !cert) throw new Error("Certificate not found or storage unavailable.");
  let payload = null;
  if (action !== "revoke") {
    const level = updates.updatedLearningLevel || cert.learning_level;
    if (!["junior", "explorer", "astronomer"].includes(level)) throw new Error("Invalid certificate learning level.");
    payload = signed({ certificate_number: action === "reissue" ? number() : cleaned, user_id: cert.user_id,
      student_public_id: cert.student_public_id, display_name: cert.display_name,
      certificate_name: sanitizeStudentName(updates.updatedCertificateName || cert.certificate_name, "Cosmic Explorer"),
      learning_level: level, course_id: cert.course_id, course_version: cert.course_version,
      curriculum_version: cert.curriculum_version, final_score_percentage: cert.final_score_percentage,
      issue_date: action === "reissue" ? new Date().toISOString().slice(0, 10) : cert.issue_date,
      metadata: { ...cert.metadata, ...(action === "reissue" ? { supersedes: cleaned } : {}) },
    });
  }
  const result = await db.rpc("academy_admin_certificate_change", { p_actor_id: actorId, p_number: cleaned,
    p_action: action, p_reason: reason.trim(), p_expected_updated_at: cert.updated_at, p_payload: payload });
  if (result.error || !result.data?.certificate) throw new Error("Certificate change was not confirmed. Reload and retry; no success is assumed.");
  return result.data as { certificate: Record<string, any>; isExisting: boolean };
}
