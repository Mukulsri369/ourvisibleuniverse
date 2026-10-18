import crypto from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { LearningLevel } from "./types";
import {
  type CanonicalCertificate,
  type CertificateVerificationResult,
  CERTIFICATE_CONSTANTS,
  LEARNING_LEVEL_LABELS,
} from "./certificate-types";
import { sanitizeStudentName } from "./student-types";

/**
 * Computes an HMAC-SHA256 verification digest to ensure the certificate
 * has not been tampered with or fabricated.
 */
export function computeCertificateHash(payload: {
  certificateNumber: string;
  userId: string;
  courseId: string;
  courseVersion: string;
  finalScorePercentage: number;
  issueDate: string;
}): string {
  const secret = process.env.CERTIFICATE_SIGNING_SECRET || "ovu_academy_verifiable_cert_v1";
  const canonicalString = [
    payload.certificateNumber,
    payload.userId,
    payload.courseId,
    payload.courseVersion,
    payload.finalScorePercentage.toFixed(2),
    payload.issueDate,
  ].join("|");

  return crypto.createHmac("sha256", secret).update(canonicalString).digest("hex");
}

/**
 * Generates a cryptographically random, high-entropy certificate public identifier.
 * Example format: OVU-CERT-2026-9F4B-A81E-3D2C
 */
export function generateUniqueCertificateNumber(): string {
  const year = new Date().getFullYear();
  const chunk1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const chunk2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const chunk3 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `OVU-CERT-${year}-${chunk1}-${chunk2}-${chunk3}`;
}

export function formatCertificateDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Authoritative Server-Side Certificate Issuance Transaction.
 * Strictly verifies all 5 eligibility requirements before issuing a certificate:
 * 1. Authenticated user ID.
 * 2. Verified completion of all 24 modules.
 * 3. Final examination score >= 80% (minimum 16/20).
 * 4. Course version matches curriculum version.
 * 5. Idempotent check: if an active certificate exists for this learner & course version,
 *    returns the existing active certificate instead of duplicating.
 */
export async function issueOfficialCertificateServer(
  userId: string,
  preferredLevel?: LearningLevel,
): Promise<{ success: boolean; certificate: CanonicalCertificate; isExisting: boolean }> {
  if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("Student authentication required to issue an official certificate.");
  }

  const courseId = CERTIFICATE_CONSTANTS.COURSE_ID;
  const courseVersion = CERTIFICATE_CONSTANTS.COURSE_VERSION;

  // 1. Idempotency Check: Look for existing active certificate for this learner & version
  try {
    const { data: existingCert } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("course_version", courseVersion)
      .eq("status", "active")
      .maybeSingle();

    if (existingCert) {
      const canonical = mapDatabaseRowToCanonicalCertificate(existingCert);
      return {
        success: true,
        certificate: canonical,
        isExisting: true,
      };
    }
  } catch (err: any) {
    console.warn("Error checking existing certificate in database:", err?.message || err);
  }

  // 2. Authoritative Eligibility Verification
  // Check academy_certificate_eligibility table
  let isEligible = false;
  let finalScore = 0;
  let verifiedLevel: LearningLevel = preferredLevel || "explorer";

  try {
    const { data: eligibility, error: elErr } = await supabaseAdmin
      .from("academy_certificate_eligibility")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("course_version", courseVersion)
      .maybeSingle();

    if (!elErr && eligibility) {
      if (
        eligibility.all_stages_completed &&
        eligibility.final_exam_passed &&
        (eligibility.final_exam_score_pct ?? 0) >= CERTIFICATE_CONSTANTS.PASSING_SCORE_THRESHOLD
      ) {
        isEligible = true;
        finalScore = eligibility.final_exam_score_pct;
      }
    }
  } catch (err) {
    console.warn("Eligibility lookup fallback check:", err);
  }

  // If eligibility record was not cached or db was partitioned, verify directly against module completions & attempts
  if (!isEligible) {
    // Check module completions count
    const { count: completedModuleCount } = await supabaseAdmin
      .from("academy_module_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_verified_complete", true);

    const hasAllModules =
      (completedModuleCount ?? 0) >= CERTIFICATE_CONSTANTS.TOTAL_MODULES_REQUIRED;

    // Check latest passed final exam attempt
    const { data: latestExam } = await supabaseAdmin
      .from("academy_assessment_attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("module_id", "exam")
      .eq("passed", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const examScore = latestExam?.percentage ?? 0;
    const examPassed =
      latestExam?.passed === true && examScore >= CERTIFICATE_CONSTANTS.PASSING_SCORE_THRESHOLD;

    if (hasAllModules && examPassed) {
      isEligible = true;
      finalScore = examScore;
      if (latestExam?.level) {
        verifiedLevel = latestExam.level as LearningLevel;
      }
    }
  }

  // Strictly reject ineligible requests
  if (!isEligible) {
    throw new Error(
      "Certificate issuance denied: You must complete all 24 modules and achieve at least 80% (16/20) on the Cosmic Explorer Final Knowledge Assessment.",
    );
  }

  // 3. Resolve Verified Student Identity
  let studentPublicId = "STU-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  let displayName = "Cosmic Explorer";
  let certificateName = "Cosmic Explorer";

  try {
    const { data: profile } = await supabaseAdmin
      .from("academy_student_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      studentPublicId = profile.student_public_id || studentPublicId;
      displayName = sanitizeStudentName(profile.display_name, "Cosmic Explorer");
      certificateName = sanitizeStudentName(profile.certificate_name, displayName);
      if (profile.selected_level) {
        verifiedLevel = profile.selected_level as LearningLevel;
      }
    }
  } catch (err) {
    console.warn("Profile fetch warning in certificate issuance:", err);
  }

  // 4. Generate Certificate Data
  const certificateNumber = generateUniqueCertificateNumber();
  const issueDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const verificationHash = computeCertificateHash({
    certificateNumber,
    userId,
    courseId,
    courseVersion,
    finalScorePercentage: finalScore,
    issueDate,
  });

  const metadata = {
    verifiedAt: new Date().toISOString(),
    totalModulesCompleted: 24,
    finalExamScore: finalScore,
    passingThreshold: CERTIFICATE_CONSTANTS.PASSING_SCORE_THRESHOLD,
    accreditationDisclaimerIncluded: true,
  };

  // 5. Atomic Insertion into Database
  const insertPayload = {
    certificate_number: certificateNumber,
    user_id: userId,
    student_public_id: studentPublicId,
    display_name: displayName,
    certificate_name: certificateName,
    learning_level: verifiedLevel,
    course_id: courseId,
    course_version: courseVersion,
    curriculum_version: CERTIFICATE_CONSTANTS.CURRICULUM_VERSION,
    final_score_percentage: finalScore,
    issue_date: issueDate,
    verification_hash: verificationHash,
    status: "active" as const,
    metadata,
  };

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("academy_certificates")
    .insert(insertPayload)
    .select()
    .single();

  if (insertError) {
    // If another concurrent request just inserted it, retrieve and return idempotently
    const { data: retryExisting } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("course_version", courseVersion)
      .eq("status", "active")
      .maybeSingle();

    if (retryExisting) {
      return {
        success: true,
        certificate: mapDatabaseRowToCanonicalCertificate(retryExisting),
        isExisting: true,
      };
    }

    throw new Error(`Failed to record certificate transaction: ${insertError.message}`);
  }

  const canonical = mapDatabaseRowToCanonicalCertificate(inserted);
  return {
    success: true,
    certificate: canonical,
    isExisting: false,
  };
}

/**
 * Public Certificate Verification Service.
 * Allows any device, employer, school, or QR code scanner to independently
 * verify the validity, authenticity, and non-tampered state of an issued certificate.
 */
export async function verifyCertificatePublicServer(
  certificateNumber: string,
): Promise<CertificateVerificationResult> {
  const cleanedId = (certificateNumber || "").trim().toUpperCase();

  if (!cleanedId) {
    return {
      isValid: false,
      certificateNumber: cleanedId,
      status: "not_found",
      reason: "No certificate identifier provided.",
    };
  }

  try {
    const { data: row, error } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("certificate_number", cleanedId)
      .maybeSingle();

    if (error || !row) {
      return {
        isValid: false,
        certificateNumber: cleanedId,
        status: "not_found",
        reason: "Certificate not found in the official registry. Please check the identifier.",
      };
    }

    if (row.status !== "active") {
      return {
        isValid: false,
        certificateNumber: cleanedId,
        status: row.status,
        reason: `Certificate status is '${row.status}'. ${row.revocation_reason ? `Reason: ${row.revocation_reason}` : ""}`,
      };
    }

    // Verify cryptographic signature / hash
    const expectedHash = computeCertificateHash({
      certificateNumber: row.certificate_number,
      userId: row.user_id,
      courseId: row.course_id,
      courseVersion: row.course_version,
      finalScorePercentage: row.final_score_percentage,
      issueDate: row.issue_date,
    });

    const isHashValid = expectedHash === row.verification_hash;

    const level = (row.learning_level as LearningLevel) || "explorer";

    return {
      isValid: isHashValid,
      certificateNumber: row.certificate_number,
      status: row.status,
      studentName: row.certificate_name || row.display_name,
      studentPublicId: row.student_public_id,
      courseTitle: CERTIFICATE_CONSTANTS.COURSE_TITLE,
      achievementTitle: CERTIFICATE_CONSTANTS.ACHIEVEMENT_TITLE,
      learningLevel: level,
      learningLevelLabel: LEARNING_LEVEL_LABELS[level] || "Space Explorer",
      finalScorePercentage: row.final_score_percentage,
      issueDate: row.issue_date,
      issueDateFormatted: formatCertificateDate(row.issue_date),
      courseVersion: row.course_version,
      organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
      verificationHash: row.verification_hash,
      verificationUrl: `${CERTIFICATE_CONSTANTS.VERIFICATION_BASE_URL}?id=${encodeURIComponent(row.certificate_number)}`,
      disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
      reason: isHashValid
        ? undefined
        : "Cryptographic signature mismatch. Record may have been modified.",
    };
  } catch (err: any) {
    return {
      isValid: false,
      certificateNumber: cleanedId,
      status: "not_found",
      reason: `Verification service error: ${err?.message || "Internal failure"}`,
    };
  }
}

/**
 * Retrieve a student's active certificate for Cosmic Journey if one exists.
 */
export async function getStudentActiveCertificateServer(
  userId: string,
): Promise<CanonicalCertificate | null> {
  if (!userId) return null;

  try {
    const { data: row } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", CERTIFICATE_CONSTANTS.COURSE_ID)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return null;
    return mapDatabaseRowToCanonicalCertificate(row);
  } catch (err) {
    console.warn("Could not fetch active certificate:", err);
    return null;
  }
}

function mapDatabaseRowToCanonicalCertificate(row: any): CanonicalCertificate {
  const level = (row.learning_level as LearningLevel) || "explorer";
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    userId: row.user_id,
    studentPublicId: row.student_public_id,
    displayName: row.display_name,
    certificateName: row.certificate_name,
    learningLevel: level,
    learningLevelLabel: LEARNING_LEVEL_LABELS[level] || "Space Explorer",
    courseId: row.course_id,
    courseTitle: CERTIFICATE_CONSTANTS.COURSE_TITLE,
    achievementTitle: CERTIFICATE_CONSTANTS.ACHIEVEMENT_TITLE,
    courseVersion: row.course_version,
    curriculumVersion: row.curriculum_version || "1.0.0",
    finalScorePercentage: row.final_score_percentage,
    issueDate: row.issue_date,
    issueDateFormatted: formatCertificateDate(row.issue_date),
    verificationHash: row.verification_hash,
    verificationUrl: `${CERTIFICATE_CONSTANTS.VERIFICATION_BASE_URL}?id=${encodeURIComponent(row.certificate_number)}`,
    status: row.status,
    organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
    certificateText: CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT,
    disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
    metadata: row.metadata || {},
  };
}
