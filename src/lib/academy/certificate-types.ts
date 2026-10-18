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
  metadata?: Record<string, unknown>;
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
  VERIFICATION_BASE_URL: "https://ourvisibleuniverse.in/verify-certificate",
};

export const LEARNING_LEVEL_LABELS: Record<LearningLevel, string> = {
  junior: "Junior Explorer",
  explorer: "Space Explorer",
  astronomer: "Young Astronomer",
};
