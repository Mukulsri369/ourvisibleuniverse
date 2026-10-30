import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { PoolConnection } from "mysql2/promise";
import { database, transaction } from "./db.server";
import { requireAdmin, type Principal } from "./authorization.server";
import { json, lockLearner, academyAudit, stableHash } from "./academy-common.server";
import {
  CERTIFICATE_CONSTANTS as C,
  LEARNING_LEVEL_LABELS,
  type CanonicalCertificate,
  type CertificateVerificationResult,
} from "../lib/academy/certificate-types";
import { sanitizeStudentName } from "../lib/academy/student-types";

function signingSecret() {
  const key = process.env.CERTIFICATE_SIGNING_SECRET;
  if (!key || key.length < 32)
    throw new Error("Private certificate signing configuration required");
  return key;
}
const date = (value: any) => new Date(value).toISOString().slice(0, 10);
const formatted = (value: any) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
function digest(row: any) {
  return createHmac("sha256", signingSecret())
    .update(
      JSON.stringify([
        2,
        row.certificate_number,
        row.user_id,
        row.student_public_id,
        row.certificate_name,
        row.learning_level,
        row.course_id,
        row.course_version,
        Number(row.final_score_percentage).toFixed(2),
        date(row.issue_date),
      ]),
    )
    .digest("hex");
}
function validSignature(row: any) {
  if (row.signature_version !== 2 || !/^[a-f0-9]{64}$/.test(row.verification_hash)) return false;
  return timingSafeEqual(
    Buffer.from(digest(row), "hex"),
    Buffer.from(row.verification_hash, "hex"),
  );
}
export function canonicalCertificate(row: any): CanonicalCertificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    userId: row.user_id,
    studentPublicId: row.student_public_id,
    displayName: row.display_name,
    certificateName: row.certificate_name,
    learningLevel: row.learning_level,
    learningLevelLabel:
      LEARNING_LEVEL_LABELS[row.learning_level as keyof typeof LEARNING_LEVEL_LABELS],
    courseId: row.course_id,
    courseTitle: C.COURSE_TITLE,
    achievementTitle: C.ACHIEVEMENT_TITLE,
    courseVersion: row.course_version,
    curriculumVersion: row.curriculum_version,
    finalScorePercentage: Number(row.final_score_percentage),
    issueDate: date(row.issue_date),
    issueDateFormatted: formatted(row.issue_date),
    verificationHash: row.verification_hash,
    verificationUrl: `${C.OFFICIAL_VERIFICATION_BASE_URL}/${encodeURIComponent(row.certificate_number)}`,
    status: row.status,
    organization: C.ORGANIZATION,
    certificateText: C.CERTIFICATE_TEXT,
    disclaimer: C.DISCLAIMER,
    metadata: json(row.metadata),
  };
}

export async function certificateEligibility(c: PoolConnection, userId: string) {
  const [modules]: any = await c.execute(
    "SELECT module_id FROM academy_verified_completions WHERE user_id=? AND module_version='1.0.0'",
    [userId],
  );
  const ids = new Set(modules.map((r: any) => r.module_id));
  const all = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, "0")).every((id) =>
    ids.has(id),
  );
  const [exams]: any = await c.execute(
    `SELECT a.id,a.percentage,s.learning_level,s.submitted_at FROM academy_assessment_attempts a
    JOIN academy_assessment_sessions s ON s.recorded_attempt_id=a.id AND s.user_id=a.user_id
    WHERE a.user_id=? AND a.assessment_id='final_exam' AND a.passed=true AND a.percentage>=80
    AND a.total_points=20 AND s.mode='official' AND s.module_id='exam' AND s.course_version='1.0.0'
    AND s.submitted_at IS NOT NULL ORDER BY a.percentage DESC,s.submitted_at DESC LIMIT 1`,
    [userId],
  );
  return { eligible: all && exams.length === 1, allModules: all, exam: exams[0] ?? null };
}

/** Learner lock and caller transaction include grading, eligibility, issuance and audit. */
export async function issueCertificateInTransaction(
  c: PoolConnection,
  userId: string,
  reissue = false,
) {
  const [existing]: any = await c.execute(
    `SELECT * FROM academy_certificates WHERE user_id=? AND course_id=? AND course_version=?
    ORDER BY (status='active') DESC,created_at DESC LIMIT 1`,
    [userId, C.COURSE_ID, C.COURSE_VERSION],
  );
  if (existing[0]?.status === "active")
    return { success: true, certificate: canonicalCertificate(existing[0]), isExisting: true };
  // A fresh exam or repeated claim must never undo an administrator's revocation.
  if (existing.length && !reissue) return null;
  const eligibility = await certificateEligibility(c, userId);
  if (!eligibility.eligible)
    throw new Error(
      "Complete all 24 verified modules and pass the official final exam at 80% before certification",
    );
  const [profiles]: any = await c.execute("SELECT * FROM student_profiles WHERE user_id=?", [
    userId,
  ]);
  const profile = profiles[0];
  if (!profile) throw new Error("Complete your student profile before certification");
  const row: any = {
    certificate_number: `OVU-CERT-${new Date().getUTCFullYear()}-${randomBytes(12).toString("hex").toUpperCase().match(/.{4}/g)!.join("-")}`,
    user_id: userId,
    student_public_id: profile.student_public_id,
    display_name: sanitizeStudentName(profile.display_name, "Cosmic Explorer"),
    certificate_name: sanitizeStudentName(profile.certificate_name, "Cosmic Explorer"),
    learning_level: eligibility.exam.learning_level,
    course_id: C.COURSE_ID,
    course_version: C.COURSE_VERSION,
    curriculum_version: C.CURRICULUM_VERSION,
    final_score_percentage: eligibility.exam.percentage,
    issue_date: new Date(),
    signature_version: 2,
  };
  row.verification_hash = digest(row);
  await c.execute(
    `INSERT INTO academy_certificates(certificate_number,user_id,student_public_id,display_name,certificate_name,
    learning_level,course_id,course_version,curriculum_version,final_score_percentage,issue_date,verification_hash,signature_version,metadata)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,2,?)`,
    [
      row.certificate_number,
      userId,
      row.student_public_id,
      row.display_name,
      row.certificate_name,
      row.learning_level,
      row.course_id,
      row.course_version,
      row.curriculum_version,
      row.final_score_percentage,
      date(row.issue_date),
      row.verification_hash,
      JSON.stringify({
        qualifyingAttemptId: eligibility.exam.id,
        totalModulesCompleted: 24,
        passingThreshold: 80,
        signatureVersion: 2,
      }),
    ],
  );
  await academyAudit(c, userId, "certificate_issued", row.certificate_number, {
    attemptId: eligibility.exam.id,
    score: row.final_score_percentage,
  });
  const [created]: any = await c.execute(
    "SELECT * FROM academy_certificates WHERE certificate_number=?",
    [row.certificate_number],
  );
  return { success: true, certificate: canonicalCertificate(created[0]), isExisting: false };
}
export async function issueCertificate(principal: Principal | null) {
  return transaction(async (c) => {
    const result = await issueCertificateInTransaction(c, await lockLearner(c, principal));
    if (!result) throw new Error("Certificate requires administrator review before reissue");
    return result;
  });
}
export async function activeCertificate(principal: Principal | null) {
  return transaction(async (c) => {
    const userId = await lockLearner(c, principal);
    const [rows]: any = await c.execute(
      "SELECT * FROM academy_certificates WHERE user_id=? AND course_id=? AND course_version=? AND status='active'",
      [userId, C.COURSE_ID, C.COURSE_VERSION],
    );
    return rows.length ? canonicalCertificate(rows[0]) : null;
  });
}
export async function privateCertificate(principal: Principal | null, number: string) {
  const numberClean = z.string().trim().min(1).max(100).parse(number).toUpperCase();
  if (!principal?.emailVerified) throw new Error("Verified student account required");
  const [rows]: any = await database().execute(
    "SELECT * FROM academy_certificates WHERE certificate_number=?",
    [numberClean],
  );
  if (!rows.length) throw new Error("Certificate not found");
  if (rows[0].user_id !== principal.id) await requireAdmin(principal);
  if (rows[0].status !== "active" || !validSignature(rows[0]))
    throw new Error("Certificate is not active and verified");
  return canonicalCertificate(rows[0]);
}
export async function verifyCertificate(number: string): Promise<CertificateVerificationResult> {
  const cleaned = z.string().trim().min(1).max(100).parse(number).toUpperCase();
  const [rows]: any = await database().execute(
    `SELECT c.*,p.age_bracket,p.guardian_consent_status,p.profile_visibility
    FROM academy_certificates c LEFT JOIN student_profiles p ON p.user_id=c.user_id WHERE c.certificate_number=?`,
    [cleaned],
  );
  const row = rows[0];
  if (!row)
    return {
      isValid: false,
      certificateNumber: cleaned,
      status: "not_found",
      reason: "Certificate not found in the official registry",
    };
  const metadata = json(row.metadata);
  const base = {
    certificateNumber: cleaned,
    status: row.status,
    courseTitle: C.COURSE_TITLE,
    achievementTitle: C.ACHIEVEMENT_TITLE,
    courseVersion: row.course_version,
    organization: C.ORGANIZATION,
    issueDate: date(row.issue_date),
    issueDateFormatted: formatted(row.issue_date),
    verificationUrl: `${C.OFFICIAL_VERIFICATION_BASE_URL}/${encodeURIComponent(cleaned)}`,
    disclaimer: C.DISCLAIMER,
  };
  if (row.status !== "active")
    return {
      ...base,
      isValid: false,
      reason: `This certificate is ${row.status}`,
      ...(row.status === "superseded" ? { supersededBy: metadata.supersededBy } : {}),
      ...(row.revoked_at ? { revokedAt: new Date(row.revoked_at).toISOString() } : {}),
    };
  if (!validSignature(row))
    return { ...base, isValid: false, reason: "Certificate integrity could not be verified" };
  const minor = row.age_bracket !== "18_plus";
  const publicName =
    row.profile_visibility === "public" &&
    (!minor || row.guardian_consent_status === "guardian_consented");
  return {
    ...base,
    isValid: true,
    studentName: publicName
      ? sanitizeStudentName(row.certificate_name, "Verified Student")
      : "Verified Student",
    studentPublicId: row.student_public_id,
    learningLevel: row.learning_level,
    learningLevelLabel:
      LEARNING_LEVEL_LABELS[row.learning_level as keyof typeof LEARNING_LEVEL_LABELS],
    finalScorePercentage: Number(row.final_score_percentage),
    isMinorProtected: minor,
    verificationHash: row.verification_hash,
  };
}

export const certificateFilter = z
  .object({
    search: z.string().max(200).default(""),
    status: z.enum(["all", "active", "revoked", "superseded"]).default("all"),
    level: z.enum(["all", "junior", "explorer", "astronomer"]).default("all"),
    page: z.number().int().min(1).max(100000).default(1),
    pageSize: z.number().int().min(1).max(100).default(15),
  })
  .strict();
export const certificateChange = z
  .object({
    requestId: z.string().uuid(),
    certificateNumber: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .transform((v) => v.toUpperCase()),
    reason: z.string().trim().min(3).max(500),
    updatedCertificateName: z.string().trim().min(1).max(100).optional(),
    updatedLearningLevel: z.enum(["junior", "explorer", "astronomer"]).optional(),
  })
  .strict();
export async function listCertificates(principal: Principal | null, input: unknown) {
  await requireAdmin(principal);
  const f = certificateFilter.parse(input);
  const where =
    "(?='all' OR status=?) AND (?='all' OR learning_level=?) AND (INSTR(LOWER(certificate_number),LOWER(?))>0 OR INSTR(LOWER(certificate_name),LOWER(?))>0)";
  const args = [f.status, f.status, f.level, f.level, f.search, f.search];
  const [count]: any = await database().execute(
    "SELECT COUNT(*) AS n FROM academy_certificates WHERE " + where,
    args,
  );
  const [rows]: any = await database().execute(
    "SELECT * FROM academy_certificates WHERE " +
      where +
      " ORDER BY created_at DESC,id LIMIT ? OFFSET ?",
    [...args, f.pageSize, (f.page - 1) * f.pageSize],
  );
  return {
    records: rows.map((r: any) => ({
      ...canonicalCertificate(r),
      revocationReason: r.revocation_reason,
      revokedAt: r.revoked_at ? new Date(r.revoked_at).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
      updatedAt: new Date(r.updated_at).toISOString(),
      supersededBy: json(r.metadata).supersededBy,
      supersedes: json(r.metadata).supersedes,
    })),
    totalCount: Number(count[0].n),
    page: f.page,
    pageSize: f.pageSize,
    totalPages: Math.ceil(Number(count[0].n) / f.pageSize),
  };
}
export async function certificateDetails(principal: Principal | null, number: string) {
  await requireAdmin(principal);
  const [rows]: any = await database().execute(
    "SELECT * FROM academy_certificates WHERE certificate_number=?",
    [number.trim().toUpperCase()],
  );
  if (!rows.length) throw new Error("Certificate not found");
  const row = rows[0];
  const [completed]: any = await database().execute(
    "SELECT COUNT(*) AS n FROM academy_verified_completions WHERE user_id=?",
    [row.user_id],
  );
  const [attempts]: any = await database().execute(
    "SELECT id,percentage,passed,submitted_at FROM academy_assessment_attempts WHERE id=? AND user_id=?",
    [json(row.metadata).qualifyingAttemptId ?? "", row.user_id],
  );
  const [trail]: any = await database().execute(
    "SELECT * FROM academy_audit_log WHERE entity_id=? ORDER BY created_at,id",
    [row.certificate_number],
  );
  return {
    certificate: canonicalCertificate(row),
    assessmentEvidence: {
      totalModulesCompleted: Number(completed[0].n),
      finalExamScore: attempts[0]?.percentage ?? null,
      examPassed: Boolean(attempts[0]?.passed),
      attemptId: attempts[0]?.id ?? null,
      submittedAt: attempts[0]?.submitted_at ?? null,
      curriculumVersion: row.curriculum_version,
      courseVersion: row.course_version,
    },
    auditTrail: trail.map((r: any) => ({
      ...r,
      previous_state: json(r.previous_state),
      new_state: json(r.new_state),
    })),
  };
}
export async function certificateStats(principal: Principal | null) {
  await requireAdmin(principal);
  const [rows]: any = await database().execute(
    "SELECT status,learning_level,COUNT(*) AS n,SUM(final_score_percentage) AS scores FROM academy_certificates GROUP BY status,learning_level",
  );
  const result = {
    totalIssued: 0,
    activeCount: 0,
    revokedCount: 0,
    supersededCount: 0,
    averageScore: 0,
    passingRatePct: 100,
    levelBreakdown: { junior: 0, explorer: 0, astronomer: 0 },
  };
  let sum = 0;
  for (const r of rows) {
    const n = Number(r.n);
    result.totalIssued += n;
    sum += Number(r.scores);
    result.levelBreakdown[r.learning_level as keyof typeof result.levelBreakdown] += n;
    if (r.status === "active") result.activeCount += n;
    else if (r.status === "revoked") result.revokedCount += n;
    else result.supersededCount += n;
  }
  result.averageScore = result.totalIssued ? Math.round((sum / result.totalIssued) * 10) / 10 : 0;
  return result;
}
export async function changeCertificate(
  principal: Principal | null,
  operation: "revoke" | "correct" | "reissue",
  input: unknown,
) {
  const data = certificateChange.parse(input);
  if (!principal?.emailVerified) throw new Error("Administrator access required");
  await requireAdmin(principal);
  const [targets]: any = await database().execute(
    "SELECT user_id FROM academy_certificates WHERE certificate_number=?",
    [data.certificateNumber],
  );
  if (!targets.length) throw new Error("Certificate not found");
  return transaction(async (c) => {
    // Begin the consistent read only after acquiring the learner lock.

    await c.execute("SELECT id FROM auth_user WHERE id=? FOR UPDATE", [targets[0].user_id]);
    await requireAdmin(principal, c);
    const hash = stableHash({ operation, ...data });
    const [prior]: any = await c.execute(
      "SELECT * FROM academy_certificate_operations WHERE request_id=?",
      [data.requestId],
    );
    if (prior.length) {
      if (prior[0].actor_id !== principal.id || prior[0].payload_hash !== hash)
        throw new Error("Certificate operation retry conflicts");
      return json(prior[0].result);
    }
    const [rows]: any = await c.execute(
      "SELECT * FROM academy_certificates WHERE certificate_number=? FOR UPDATE",
      [data.certificateNumber],
    );
    const row = rows[0];
    let target = row;
    if (operation === "revoke") {
      if (row.status === "superseded") throw new Error("Revoke the current certificate instead");
      await c.execute(
        "UPDATE academy_certificates SET status='revoked',revocation_reason=?,revoked_at=COALESCE(revoked_at,CURRENT_TIMESTAMP(6)),updated_at=CURRENT_TIMESTAMP(6) WHERE id=?",
        [data.reason, row.id],
      );
    } else {
      if (operation === "correct" && row.status !== "active")
        throw new Error("Only active certificates can be corrected");
      if (operation === "reissue") {
        if (row.status === "superseded") throw new Error("Certificate was already superseded");
        await c.execute(
          "UPDATE academy_certificates SET status='superseded',updated_at=CURRENT_TIMESTAMP(6) WHERE id=?",
          [row.id],
        );
        const issued = await issueCertificateInTransaction(c, row.user_id, true);
        if (!issued || issued.isExisting)
          throw new Error("Another active certificate already exists");
        const [newRows]: any = await c.execute("SELECT * FROM academy_certificates WHERE id=?", [
          issued.certificate.id,
        ]);
        target = newRows[0];
        await c.execute("UPDATE academy_certificates SET metadata=? WHERE id=?", [
          JSON.stringify({ ...json(row.metadata), supersededBy: target.certificate_number }),
          row.id,
        ]);
        target.metadata = { ...json(target.metadata), supersedes: row.certificate_number };
      }
      target = {
        ...target,
        certificate_name: data.updatedCertificateName
          ? sanitizeStudentName(data.updatedCertificateName, "Cosmic Explorer")
          : target.certificate_name,
        learning_level: data.updatedLearningLevel ?? target.learning_level,
      };
      await c.execute(
        "UPDATE academy_certificates SET certificate_name=?,learning_level=?,verification_hash=?,signature_version=2,metadata=?,updated_at=CURRENT_TIMESTAMP(6) WHERE id=?",
        [
          target.certificate_name,
          target.learning_level,
          digest(target),
          JSON.stringify(json(target.metadata)),
          target.id,
        ],
      );
    }
    const [updated]: any = await c.execute("SELECT * FROM academy_certificates WHERE id=?", [
      target.id,
    ]);
    const result = {
      success: true,
      message: "Certificate " + operation + " completed",
      certificate: canonicalCertificate(updated[0]),
    };
    await academyAudit(
      c,
      principal.id,
      "certificate_" + operation,
      row.certificate_number,
      { reason: data.reason, certificate: result.certificate },
      canonicalCertificate(row),
      "admin",
    );
    await c.execute(
      "INSERT INTO academy_certificate_operations(request_id,actor_id,certificate_number,operation,payload_hash,result) VALUES(?,?,?,?,?,?)",
      [
        data.requestId,
        principal.id,
        data.certificateNumber,
        operation,
        hash,
        JSON.stringify(result),
      ],
    );
    return result;
  });
}
