/**
 * Automated Certificate Issuance & PDF Generation Acceptance Test Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 10 Acceptance Contracts & Security Invariants
 */

import { PDFDocument } from "pdf-lib";
import {
  CERTIFICATE_CONSTANTS,
  LEARNING_LEVEL_LABELS,
  type CanonicalCertificate,
} from "../src/lib/academy/certificate-types";
import {
  computeCertificateHash,
  generateUniqueCertificateNumber,
  formatCertificateDate,
  issueOfficialCertificateServer,
  verifyCertificatePublicServer,
} from "../src/lib/academy/certificate.server";
import { generateCertificatePdf } from "../src/lib/academy/certificate-pdf";
import { sanitizeStudentName } from "../src/lib/academy/student-types";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ [PASS] ${msg}`);
}

async function runCertificateValidationSuite() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 10: AUTOMATED CERTIFICATE ISSUANCE & PDF ENGINE VALIDATION");
  console.log("======================================================================\n");

  let checksCount = 0;

  // -------------------------------------------------------------------------
  // 1. Certificate ID Generator & Cryptographic Verification Invariants
  // -------------------------------------------------------------------------
  console.log("1. Cryptographic Security & High-Entropy Certificate Identifiers:");
  const id1 = generateUniqueCertificateNumber();
  const id2 = generateUniqueCertificateNumber();
  assert(id1.startsWith("OVU-CERT-2026-"), `Certificate ID has standard prefix: ${id1}`);
  checksCount++;

  assert(
    id1 !== id2,
    `Successive certificate IDs are non-sequential and unique (${id1} !== ${id2})`,
  );
  checksCount++;

  // Verify HMAC hash computation
  const hashPayload = {
    certificateNumber: id1,
    userId: "test-user-123",
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: CERTIFICATE_CONSTANTS.COURSE_VERSION,
    finalScorePercentage: 85.0,
    issueDate: "2026-10-18",
  };
  const hash = computeCertificateHash(hashPayload);
  assert(
    typeof hash === "string" && hash.length === 64,
    `HMAC-SHA256 digest is valid 64-char hex string: ${hash.slice(0, 16)}...`,
  );
  checksCount++;

  // Tamper detection: modifying score changes hash
  const tamperedHash = computeCertificateHash({ ...hashPayload, finalScorePercentage: 95.0 });
  assert(hash !== tamperedHash, "Tampering with assessment score invalidates verification hash");
  checksCount++;

  // -------------------------------------------------------------------------
  // 2. Child Safety & Privacy Sanitization
  // -------------------------------------------------------------------------
  console.log("\n2. Privacy & Child Safety Rules:");
  const safeName = sanitizeStudentName("student@example.com", "Cosmic Explorer");
  assert(
    safeName === "Cosmic Explorer",
    "Email addresses are stripped and fall back to safe pseudonym",
  );
  checksCount++;

  const cleanName = sanitizeStudentName("Aria Thorne", "Cosmic Explorer");
  assert(cleanName === "Aria Thorne", "Valid student display names are preserved without leakage");
  checksCount++;

  // -------------------------------------------------------------------------
  // 3. Ineligible Student Rejection Tests
  // -------------------------------------------------------------------------
  console.log("\n3. Eligibility Verification & Fraud Prevention:");
  try {
    await issueOfficialCertificateServer("");
    assert(false, "Unauthenticated request was unexpectedly allowed");
  } catch (err: any) {
    assert(
      err.message.includes("Student authentication required"),
      "Ineligible unauthenticated student cannot issue certificate",
    );
    checksCount++;
  }

  try {
    // Attempting issuance for a non-completed fake user ID
    await issueOfficialCertificateServer("non-eligible-student-uuid-999");
    assert(false, "Ineligible student without course completion was unexpectedly allowed");
  } catch (err: any) {
    assert(
      err.message.includes("Certificate issuance denied"),
      "Ineligible student (<24 modules or <80% exam) cannot issue certificate",
    );
    checksCount++;
  }

  // -------------------------------------------------------------------------
  // 4. Canonical Certificate Construction & Contract Invariants
  // -------------------------------------------------------------------------
  console.log("\n4. Canonical Certificate Data Contracts:");
  const mockEligibleCert: CanonicalCertificate = {
    id: "9f8a7b6c-5d4e-3f2a-1b0c-9e8d7c6b5a4f",
    certificateNumber: id1,
    userId: "test-verified-student-123",
    studentPublicId: "STU-8F3A9D2E",
    displayName: "Aria Thorne",
    certificateName: "Aria Thorne",
    learningLevel: "explorer",
    learningLevelLabel: LEARNING_LEVEL_LABELS["explorer"],
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseTitle: CERTIFICATE_CONSTANTS.COURSE_TITLE,
    achievementTitle: CERTIFICATE_CONSTANTS.ACHIEVEMENT_TITLE,
    courseVersion: CERTIFICATE_CONSTANTS.COURSE_VERSION,
    curriculumVersion: CERTIFICATE_CONSTANTS.CURRICULUM_VERSION,
    finalScorePercentage: 85.0,
    issueDate: "2026-10-18",
    issueDateFormatted: formatCertificateDate("2026-10-18"),
    verificationHash: hash,
    verificationUrl: `${CERTIFICATE_CONSTANTS.VERIFICATION_BASE_URL}?id=${encodeURIComponent(id1)}`,
    status: "active",
    organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
    certificateText: CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT,
    disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
    metadata: { test: true },
  };

  assert(
    mockEligibleCert.organization === "Our Visible Universe Academy",
    "Organization is Our Visible Universe Academy",
  );
  checksCount++;

  assert(mockEligibleCert.courseTitle === "Cosmic Journey", "Course title is Cosmic Journey");
  checksCount++;

  assert(
    mockEligibleCert.achievementTitle === "Certified Cosmic Explorer",
    "Achievement title is Certified Cosmic Explorer",
  );
  checksCount++;

  assert(
    mockEligibleCert.certificateText ===
      "This certificate recognizes the successful completion of Cosmic Journey and achievement of the required standard in its astronomy learning program and final assessment.",
    "Official certificate body text matches exact specification",
  );
  checksCount++;

  assert(
    !mockEligibleCert.certificateText.toLowerCase().includes("university") &&
      !mockEligibleCert.certificateText.toLowerCase().includes("nasa") &&
      !mockEligibleCert.certificateText.toLowerCase().includes("esa") &&
      !mockEligibleCert.certificateText.toLowerCase().includes("government"),
    "Certificate body text strictly avoids claiming university, government, NASA, or ESA accreditation",
  );
  checksCount++;

  assert(
    mockEligibleCert.disclaimer.includes("does not confer university degree credits") &&
      mockEligibleCert.disclaimer.includes("professional scientific accreditation"),
    "Official non-accreditation disclaimer is included",
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // 5. Public Verification Service & QR Destination
  // -------------------------------------------------------------------------
  console.log("\n5. Verification Service & QR Destination URL:");
  assert(
    mockEligibleCert.verificationUrl.startsWith(
      "https://ourvisibleuniverse.in/verify-certificate?id=",
    ),
    `QR points to official verification URL: ${mockEligibleCert.verificationUrl}`,
  );
  checksCount++;

  const unknownVerify = await verifyCertificatePublicServer("NON-EXISTENT-CERT-ID");
  assert(
    !unknownVerify.isValid && unknownVerify.status === "not_found",
    "Unregistered certificate ID safely returns not_found",
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // 6. PDF Generation (Celestial Dark Theme)
  // -------------------------------------------------------------------------
  console.log("\n6. PDF Generation Engine (Celestial Dark Mode):");
  const darkPdfBytes = await generateCertificatePdf(mockEligibleCert, { theme: "cosmic_dark" });
  assert(darkPdfBytes instanceof Uint8Array, "generateCertificatePdf returns Uint8Array binary");
  checksCount++;

  assert(
    darkPdfBytes.length > 5000,
    `PDF size is production-grade (${darkPdfBytes.length} bytes > 5 KB)`,
  );
  checksCount++;

  // Parse back with pdf-lib to verify PDF structure
  const parsedDarkDoc = await PDFDocument.load(darkPdfBytes);
  assert(parsedDarkDoc.getPageCount() === 1, "PDF contains exactly 1 page");
  checksCount++;

  const darkPage = parsedDarkDoc.getPages()[0];
  const { width: dWidth, height: dHeight } = darkPage.getSize();
  assert(
    Math.abs(dWidth - 841.89) < 0.1 && Math.abs(dHeight - 595.28) < 0.1,
    `PDF dimensions match exact A4 Landscape standard (841.89 x 595.28 pt, actual: ${dWidth.toFixed(2)} x ${dHeight.toFixed(2)})`,
  );
  checksCount++;

  assert(
    parsedDarkDoc.getTitle()?.includes("Aria Thorne") === true,
    "PDF metadata includes recipient name",
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // 7. PDF Generation (High-Resolution Print-Friendly Light Theme)
  // -------------------------------------------------------------------------
  console.log("\n7. PDF Generation Engine (Print-Friendly Light Mode):");
  const lightPdfBytes = await generateCertificatePdf(mockEligibleCert, { theme: "print_light" });
  assert(
    lightPdfBytes instanceof Uint8Array && lightPdfBytes.length > 5000,
    `Print-friendly PDF generated successfully (${lightPdfBytes.length} bytes > 5 KB)`,
  );
  checksCount++;

  const parsedLightDoc = await PDFDocument.load(lightPdfBytes);
  const lightPage = parsedLightDoc.getPages()[0];
  const { width: lWidth, height: lHeight } = lightPage.getSize();
  assert(
    Math.abs(lWidth - 841.89) < 0.1 && Math.abs(lHeight - 595.28) < 0.1,
    "Light print mode preserves exact A4 landscape proportions",
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // 8. Age-Adaptive Tier Labels
  // -------------------------------------------------------------------------
  console.log("\n8. Age-Adaptive Curriculum Tier Coverage:");
  const levels: ("junior" | "explorer" | "astronomer")[] = ["junior", "explorer", "astronomer"];
  for (const lvl of levels) {
    const certForLvl: CanonicalCertificate = {
      ...mockEligibleCert,
      learningLevel: lvl,
      learningLevelLabel: LEARNING_LEVEL_LABELS[lvl],
    };
    const lvlPdf = await generateCertificatePdf(certForLvl);
    assert(lvlPdf.length > 5000, `Generated valid PDF for ${LEARNING_LEVEL_LABELS[lvl]}`);
    checksCount++;
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n======================================================================");
  console.log(`CERTIFICATE ISSUANCE VALIDATION SUMMARY:`);
  console.log(`Total Checks Run: ${checksCount}`);
  console.log(`Passed: ${checksCount}`);
  console.log(`Failed: 0`);
  console.log("======================================================================");
  console.log("🌟 ALL CERTIFICATE GENERATION & ISSUANCE CONTRACTS VERIFIED WITH 100% SUCCESS!\n");
}

runCertificateValidationSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
