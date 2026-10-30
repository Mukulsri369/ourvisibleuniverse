import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireIndependentAuth } from "@/backend/session-middleware";
const reference = z.object({ certificateNumber: z.string().trim().min(1).max(100) });
const change = reference.extend({
  requestId: z.string().uuid(),
  reason: z.string().trim().min(3).max(500),
  updatedCertificateName: z.string().trim().min(1).max(100).optional(),
  updatedLearningLevel: z.enum(["junior", "explorer", "astronomer"]).optional(),
});
export const issueOfficialCertificate = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator(
    (input: { userId?: string; level?: "junior" | "explorer" | "astronomer" } = {}) => input,
  )
  .handler(async ({ context }) => {
    const { issueCertificate } = await import("@/backend/academy-certificates.server");
    return issueCertificate(context.principal);
  });
export const getActiveCertificate = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .inputValidator((input: { userId?: string } = {}) => input)
  .handler(async ({ context }) => {
    const { activeCertificate } = await import("@/backend/academy-certificates.server");
    return activeCertificate(context.principal);
  });
export const verifyCertificatePublic = createServerFn({ method: "GET" })
  .inputValidator((input: { certificateId: string }) =>
    z.object({ certificateId: z.string().trim().min(1).max(100) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyCertificate } = await import("@/backend/academy-certificates.server");
    return verifyCertificate(data.certificateId);
  });
export const generateCertificatePdfPayload = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) =>
    reference.extend({ theme: z.enum(["cosmic_dark", "print_light"]).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { privateCertificate } = await import("@/backend/academy-certificates.server");
    const { generateCertificatePdf } = await import("./certificate-pdf");
    const certificate = await privateCertificate(context.principal, data.certificateNumber);
    const bytes = await generateCertificatePdf(certificate, { theme: data.theme ?? "cosmic_dark" });
    return {
      certificateNumber: certificate.certificateNumber,
      fileName: "Cosmic-Journey-Certificate-" + certificate.certificateNumber + ".pdf",
      base64: Buffer.from(bytes).toString("base64"),
    };
  });
export const adminListCertificates = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator(
    (
      input: {
        search?: string;
        status?: "all" | "active" | "revoked" | "superseded";
        level?: "all" | "junior" | "explorer" | "astronomer";
        page?: number;
        pageSize?: number;
      } = {},
    ) => input,
  )
  .handler(async ({ data, context }) => {
    const { listCertificates } = await import("@/backend/academy-certificates.server");
    return listCertificates(context.principal, data);
  });
export const adminGetCertificateDetails = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => reference.parse(input))
  .handler(async ({ data, context }) => {
    const { certificateDetails } = await import("@/backend/academy-certificates.server");
    return certificateDetails(context.principal, data.certificateNumber);
  });
export const adminGetCertificateStats = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input: Record<string, never> = {}) => input)
  .handler(async ({ context }) => {
    const { certificateStats } = await import("@/backend/academy-certificates.server");
    return certificateStats(context.principal);
  });
export const adminRevokeCertificate = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => change.parse(input))
  .handler(async ({ data, context }) => {
    const { changeCertificate } = await import("@/backend/academy-certificates.server");
    return changeCertificate(context.principal, "revoke", data);
  });
export const adminCorrectCertificate = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => change.parse(input))
  .handler(async ({ data, context }) => {
    const { changeCertificate } = await import("@/backend/academy-certificates.server");
    return changeCertificate(context.principal, "correct", data);
  });
export const adminReissueCertificate = createServerFn({ method: "POST" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => change.parse(input))
  .handler(async ({ data, context }) => {
    const { changeCertificate } = await import("@/backend/academy-certificates.server");
    return changeCertificate(context.principal, "reissue", data);
  });
export const getCertificateOpenBadgePayload = createServerFn({ method: "GET" })
  .middleware([requireIndependentAuth])
  .inputValidator((input) => reference.parse(input))
  .handler(async ({ data, context }) => {
    const { privateCertificate } = await import("@/backend/academy-certificates.server");
    const { generateOpenBadge3Metadata } = await import("./open-badge");
    return generateOpenBadge3Metadata(
      await privateCertificate(context.principal, data.certificateNumber),
    );
  });
