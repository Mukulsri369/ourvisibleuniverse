import { CERTIFICATE_CONSTANTS } from "./certificate-types";
import type { CanonicalCertificate } from "./certificate-types";
export function generateOpenBadge3Metadata(cert: CanonicalCertificate) {
  return {
    "@context": [
      "https://www.w3.org/ns/credentials/v2",
      "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    ],
    id: `urn:uuid:${cert.id}`,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    issuer: {
      id: "https://ourvisibleuniverse.in/academy/issuer",
      type: ["Profile"],
      name: CERTIFICATE_CONSTANTS.ORGANIZATION,
      url: CERTIFICATE_CONSTANTS.OFFICIAL_DOMAIN,
      description: "Official astronomy education & observational astrophysics academy",
    },
    name: cert.achievementTitle,
    description: cert.certificateText,
    validFrom: `${cert.issueDate}T00:00:00Z`,
    credentialSubject: {
      id: `urn:student:${cert.studentPublicId}`,
      type: ["AchievementSubject"],
      name: cert.certificateName,
      achievement: {
        id: `https://ourvisibleuniverse.in/academy/courses/${cert.courseId}`,
        type: ["Achievement"],
        name: `${cert.courseTitle} Certification`,
        description:
          "Successful completion of all 24 interactive astronomy modules and scored >= 80% on the final examination.",
        criteria: {
          narrative:
            "Requirement: 24 verified modules across 6 celestial stages with >= 80% passing standard on comprehensive final exam.",
        },
        image: {
          id: "https://ourvisibleuniverse.in/assets/badges/cosmic-explorer.png",
          type: "Image",
        },
      },
    },
    evidence: [
      {
        type: ["Evidence"],
        narrative: `Completed comprehensive 20-question final exam with score of ${cert.finalScorePercentage.toFixed(1)}%.`,
        score: `${cert.finalScorePercentage.toFixed(1)}%`,
      },
    ],
  };
}
