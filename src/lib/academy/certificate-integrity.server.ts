import crypto from "node:crypto";
import { requireCertificateSigningSecret } from "./certificate-signing.server";

export interface CertificateHashPayload {
  certificateNumber: string; userId: string; courseId: string; courseVersion: string;
  finalScorePercentage: number; issueDate: string | Date;
  identity?: { studentPublicId: string; certificateName: string; displayName: string; learningLevel: string; curriculumVersion: string };
}

export function certificateHash(payload: CertificateHashPayload): string {
  const core = [payload.certificateNumber, payload.userId, payload.courseId, payload.courseVersion,
    Number(payload.finalScorePercentage).toFixed(2), (payload.issueDate instanceof Date ? payload.issueDate.toISOString() : payload.issueDate).slice(0, 10)];
  // Preserve historical v1 signatures. Newly issued/corrected records bind the
  // recipient name, public ID and qualification level as well as the score.
  const canonical = payload.identity ? JSON.stringify(["OVU-CERT-v2", ...core,
    payload.identity.studentPublicId, payload.identity.certificateName, payload.identity.displayName,
    payload.identity.learningLevel, payload.identity.curriculumVersion]) : core.join("|");
  return crypto.createHmac("sha256", requireCertificateSigningSecret()).update(canonical).digest("hex");
}

export function certificateRowHash(row: Record<string, any>) {
  return certificateHash({ certificateNumber: row.certificate_number, userId: row.user_id,
    courseId: row.course_id, courseVersion: row.course_version, finalScorePercentage: row.final_score_percentage,
    issueDate: row.issue_date, ...(row.metadata?.signatureVersion === 2 ? { identity: {
      studentPublicId: row.student_public_id, certificateName: row.certificate_name, displayName: row.display_name,
      learningLevel: row.learning_level, curriculumVersion: row.curriculum_version,
    } } : {}) });
}

export function certificateHashMatches(row: Record<string, any>) {
  const actual = row.verification_hash;
  if (![undefined, 1, 2].includes(row.metadata?.signatureVersion)) return false;
  if (typeof actual !== "string" || !/^[a-f0-9]{64}$/.test(actual)) return false;
  return crypto.timingSafeEqual(Buffer.from(certificateRowHash(row), "hex"), Buffer.from(actual, "hex"));
}
