import type { JSONValue } from "./json-values";
import type { LearningLevel } from "./types";

export type CertificateTheme = "cosmic_dark" | "print_light";

export interface CanonicalCertificate {
  id: string; // UUID in database
  certificateNumber: string; // e.g. OVU-CERT-2026-7A9B-4C2E
  userId: string;
  studentPublicId: string; // e.g. STU-9A4B2C8D
  displayName: string;
  certificateName: string;
  learningLevel: LearningLevel;
  learningLevelLabel: string;
  courseId: string;
  courseTitle: string;
  achievementTitle: string;
  courseVersion: string;
  curriculumVersion: string;
  finalScorePercentage: number;
  issueDate: string; // ISO date YYYY-MM-DD
  issueDateFormatted: string; // "October 18, 2026"
  verificationHash: string; // SHA-256 HMAC
  verificationUrl: string;
  status: "active" | "revoked" | "superseded";
  organization: string;
  certificateText: string;
  disclaimer: string;
  metadata?: Record<string, JSONValue>;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificateNumber: string;
  status: "active" | "revoked" | "superseded" | "not_found";
  studentName?: string;
  studentPublicId?: string;
  courseTitle?: string;
  achievementTitle?: string;
  learningLevel?: LearningLevel;
  learningLevelLabel?: string;
  finalScorePercentage?: number;
  issueDate?: string;
  issueDateFormatted?: string;
  courseVersion?: string;
  organization?: string;
  verificationHash?: string;
  verificationUrl?: string;
  disclaimer?: string;
  reason?: string;
  revocationReason?: string;
  revokedAt?: string;
  supersededBy?: string;
  supersedes?: string;
  isMinorProtected?: boolean;
}

export interface AdminCertificateRecord {
  id: string;
  certificateNumber: string;
  userId: string;
  studentPublicId: string;
  displayName: string;
  certificateName: string;
  learningLevel: LearningLevel;
  learningLevelLabel: string;
  courseId: string;
  courseTitle: string;
  courseVersion: string;
  finalScorePercentage: number;
  issueDate: string;
  issueDateFormatted: string;
  status: "active" | "revoked" | "superseded";
  revocationReason?: string | null;
  revokedAt?: string | null;
  supersededBy?: string | null;
  supersedes?: string | null;
  verificationHash: string;
  verificationUrl: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, JSONValue>;
  assessmentEvidence?: {
    totalModulesCompleted: number;
    finalExamScore: number;
    attemptId?: string;
    verifiedAt?: string;
  };
}

export interface AdminCertificateFilter {
  search?: string;
  status?: "all" | "active" | "revoked" | "superseded";
  level?: "all" | LearningLevel;
  page?: number;
  pageSize?: number;
}

export interface AdminCertificateStats {
  totalIssued: number;
  activeCount: number;
  revokedCount: number;
  supersededCount: number;
  averageScore: number;
  passingRatePct: number;
  levelBreakdown: Record<LearningLevel, number>;
}

export interface AdminRevokeInput {
  certificateNumber: string;
  reason: string;
}

export interface AdminCorrectInput {
  certificateNumber: string;
  updatedCertificateName?: string;
  updatedLearningLevel?: LearningLevel;
  reason: string;
}

export interface AdminReissueInput {
  certificateNumber: string;
  reason: string;
  updatedCertificateName?: string;
  updatedLearningLevel?: LearningLevel;
}

export interface OpenBadge3Payload {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
  ];
  id: string;
  type: ["VerifiableCredential", "OpenBadgeCredential"];
  issuer: {
    id: string;
    type: ["Profile"];
    name: string;
    url: string;
    description: string;
  };
  name: string;
  description: string;
  validFrom: string;
  credentialSubject: {
    id: string;
    type: ["AchievementSubject"];
    name?: string;
    achievement: {
      id: string;
      type: ["Achievement"];
      name: string;
      description: string;
      criteria: {
        narrative: string;
      };
      image?: {
        id: string;
        type: "Image";
      };
    };
  };
  evidence?: Array<{
    type: ["Evidence"];
    narrative: string;
    score?: string;
  }>;
}

export const CERTIFICATE_CONSTANTS = {
  ORGANIZATION: "Our Visible Universe Academy",
  COURSE_ID: "cosmic_journey",
  COURSE_TITLE: "Cosmic Journey",
  ACHIEVEMENT_TITLE: "Certified Cosmic Explorer",
  COURSE_VERSION: "1.0.0",
  CURRICULUM_VERSION: "1.0.0",
  PASSING_SCORE_THRESHOLD: 80.0,
  TOTAL_MODULES_REQUIRED: 24,
  CERTIFICATE_TEXT:
    "This certificate recognizes the successful completion of Cosmic Journey and achievement of the required standard in its astronomy learning program and final assessment.",
  DISCLAIMER:
    "This certificate is issued by Our Visible Universe Academy as an educational achievement credential. It does not confer university degree credits, government licensure, or professional scientific accreditation.",
  OFFICIAL_DOMAIN: "https://ourvisibleuniverse.in",
  PUBLIC_VERIFICATION_ROUTE: "/verify",
  VERIFICATION_BASE_URL: "https://ourvisibleuniverse.in/verify-certificate",
  OFFICIAL_VERIFICATION_BASE_URL: "https://ourvisibleuniverse.in/verify",
};

export const LEARNING_LEVEL_LABELS: Record<LearningLevel, string> = {
  junior: "Junior Explorer",
  explorer: "Space Explorer",
  astronomer: "Young Astronomer",
};
