// @ts-nocheck
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CertificateTheme } from "./certificate-types";

async function resolveCertAuthenticatedUserId(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: userData } = await supabaseAdmin.auth.getUser(token);
      if (userData?.user?.id) {
        return userData.user.id;
      }
    }
  } catch {
    // Unauthenticated
  }

  return "";
}

/**
 * Server function to issue an authoritative certificate.
 * Enforces authentication and evaluates eligibility server-side.
 */
export const issueOfficialCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { userId?: string; level?: "junior" | "explorer" | "astronomer" } = {}) => input,
  )
  .handler(async ({ data }) => {
    const userId = await resolveCertAuthenticatedUserId();

    if (!userId) {
      throw new Error("Student authentication required to claim official verified certificate.");
    }

    const { issueOfficialCertificateServer } = await import("./certificate.server");
    return issueOfficialCertificateServer(userId, data?.level);
  });

/**
 * Retrieve active certificate for current user.
 */
export const getActiveCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: { userId?: string } = {}) => input)
  .handler(async () => {
    const userId = await resolveCertAuthenticatedUserId();

    if (!userId) return null;

    const { getStudentActiveCertificateServer } = await import("./certificate.server");
    return getStudentActiveCertificateServer(userId);
  });

/**
 * Public Verification Service.
 * Does not require authentication.
 */
export const verifyCertificatePublic = createServerFn({ method: "GET" })
  .inputValidator((input: { certificateId: string }) => input)
  .handler(async ({ data }) => {
    const { verifyCertificatePublicServer } = await import("./certificate.server");
    return verifyCertificatePublicServer(data.certificateId);
  });

/**
 * Generates and returns a base64-encoded PDF document for direct download or preview.
 */
export const generateCertificatePdfPayload = createServerFn({ method: "POST" })
  .inputValidator((input: { certificateNumber: string; theme?: CertificateTheme }) => input)
  .handler(async ({ data }) => {
    const { verifyCertificatePublicServer } = await import("./certificate.server");
    const { generateCertificatePdf } = await import("./certificate-pdf");
    const { getStudentActiveCertificateServer } = await import("./certificate.server");

    // Fetch full certificate details
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("certificate_number", data.certificateNumber)
      .maybeSingle();

    if (error || !row) {
      throw new Error("Certificate not found.");
    }

    const { LEARNING_LEVEL_LABELS, CERTIFICATE_CONSTANTS } = await import("./certificate-types");
    const { formatCertificateDate } = await import("./certificate.server");
    const level = row.learning_level as "junior" | "explorer" | "astronomer";

    const canonical = {
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
      status: row.status as "active" | "revoked" | "superseded",
      organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
      certificateText: CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT,
      disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
      metadata: row.metadata || {},
    };

    const pdfBytes = await generateCertificatePdf(canonical, {
      theme: data.theme || "cosmic_dark",
    });
    const base64 = Buffer.from(pdfBytes).toString("base64");

    return {
      certificateNumber: row.certificate_number,
      fileName: `Cosmic-Journey-Certificate-${row.certificate_number}.pdf`,
      base64,
    };
  });

async function extractAdminToken(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers?.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  } catch {
    // Unauthenticated
  }
  return "";
}

/**
 * Admin: List all certificates with filtering & pagination
 */
export const adminListCertificates = createServerFn({ method: "POST" })
  .inputValidator(
    (
      input: {
        search?: string;
        status?: "all" | "active" | "revoked" | "superseded";
        level?: "all" | "junior" | "explorer" | "astronomer";
        page?: number;
        pageSize?: number;
        adminToken?: string;
      } = {},
    ) => input,
  )
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminListCertificatesServer } = await import("./certificate.server");
    return adminListCertificatesServer(data, token);
  });

/**
 * Admin: Get certificate details, evidence, and audit trail
 */
export const adminGetCertificateDetails = createServerFn({ method: "POST" })
  .inputValidator((input: { certificateNumber: string; adminToken?: string }) => input)
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminGetCertificateDetailsServer } = await import("./certificate.server");
    return adminGetCertificateDetailsServer(data.certificateNumber, token);
  });

/**
 * Admin: Revoke a certificate with mandatory reason
 */
export const adminRevokeCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { certificateNumber: string; reason: string; adminToken?: string }) => input,
  )
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminRevokeCertificateServer } = await import("./certificate.server");
    return adminRevokeCertificateServer(data.certificateNumber, data.reason, token);
  });

/**
 * Admin: Correct certificate details
 */
export const adminCorrectCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      certificateNumber: string;
      reason: string;
      updatedCertificateName?: string;
      updatedLearningLevel?: "junior" | "explorer" | "astronomer";
      adminToken?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminCorrectCertificateServer } = await import("./certificate.server");
    return adminCorrectCertificateServer(
      data.certificateNumber,
      {
        updatedCertificateName: data.updatedCertificateName,
        updatedLearningLevel: data.updatedLearningLevel,
      },
      data.reason,
      token,
    );
  });

/**
 * Admin: Reissue certificate with historical supersession
 */
export const adminReissueCertificate = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      certificateNumber: string;
      reason: string;
      updatedCertificateName?: string;
      updatedLearningLevel?: "junior" | "explorer" | "astronomer";
      adminToken?: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminReissueCertificateServer } = await import("./certificate.server");
    return adminReissueCertificateServer(data.certificateNumber, data.reason, token, {
      updatedCertificateName: data.updatedCertificateName,
      updatedLearningLevel: data.updatedLearningLevel,
    });
  });

/**
 * Admin: Get certificate registry stats
 */
export const adminGetCertificateStats = createServerFn({ method: "POST" })
  .inputValidator((input: { adminToken?: string } = {}) => input)
  .handler(async ({ data }) => {
    const token = data?.adminToken || (await extractAdminToken());
    const { adminGetCertificateStatsServer } = await import("./certificate.server");
    return adminGetCertificateStatsServer(token);
  });

/**
 * Open Badges 3.0 / W3C Verifiable Credential standard metadata export
 */
export const getCertificateOpenBadgePayload = createServerFn({ method: "GET" })
  .inputValidator((input: { certificateNumber: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("academy_certificates")
      .select("*")
      .eq("certificate_number", data.certificateNumber.trim().toUpperCase())
      .maybeSingle();

    if (error || !row) {
      throw new Error("Certificate not found.");
    }

    const { LEARNING_LEVEL_LABELS, CERTIFICATE_CONSTANTS } = await import("./certificate-types");
    const { formatCertificateDate, generateOpenBadge3Metadata } =
      await import("./certificate.server");
    const level = (row.learning_level as "junior" | "explorer" | "astronomer") || "explorer";

    const canonical = {
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
      verificationUrl: `${CERTIFICATE_CONSTANTS.OFFICIAL_VERIFICATION_BASE_URL}/${encodeURIComponent(row.certificate_number)}`,
      status: row.status as "active" | "revoked" | "superseded",
      organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
      certificateText: CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT,
      disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
      metadata: row.metadata || {},
    };

    return generateOpenBadge3Metadata(canonical);
  });
