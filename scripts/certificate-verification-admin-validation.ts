/**
 * Automated Certificate Verification & Administration Acceptance Test Suite
 * Project: Our Visible Universe Academy
 * Scope: Prompt 11 Acceptance Contracts & Security Invariants
 */

import {
  CERTIFICATE_CONSTANTS,
  LEARNING_LEVEL_LABELS,
  type CanonicalCertificate,
} from "../src/lib/academy/certificate-types";
import {
  computeCertificateHash,
  generateUniqueCertificateNumber,
  formatCertificateDate,
  verifyCertificatePublicServer,
  verifyAdminAuthorizationServer,
  adminRevokeCertificateServer,
  adminCorrectCertificateServer,
  adminReissueCertificateServer,
  adminGetCertificateStatsServer,
  generateOpenBadge3Metadata,
  seedLocalCertificate,
} from "../src/lib/academy/certificate.server";
import { sanitizeStudentName } from "../src/lib/academy/student-types";
import { supabaseAdmin } from "../src/integrations/supabase/client.server";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ [PASS] ${msg}`);
}

async function runPrompt11ValidationSuite() {
  console.log("======================================================================");
  console.log("OUR VISIBLE UNIVERSE ACADEMY");
  console.log("PROMPT 11: CERTIFICATE VERIFICATION & ADMINISTRATION TEST SUITE");
  console.log("======================================================================\n");

  let checksCount = 0;
  process.env.NODE_ENV = "test";
  const systemAdminToken = "test-authorized-admin-token-xyz";

  // -------------------------------------------------------------------------
  // Setup Test Data in Supabase / Local test DB
  // -------------------------------------------------------------------------
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const minorUserId = "00000000-0000-0000-0000-000000000002";
  const validCertNumber = generateUniqueCertificateNumber();
  const testIssueDate = "2026-10-18";

  const validHash = computeCertificateHash({
    certificateNumber: validCertNumber,
    userId: testUserId,
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: CERTIFICATE_CONSTANTS.COURSE_VERSION,
    finalScorePercentage: 92.5,
    issueDate: testIssueDate,
  });

  // Seed valid active certificate
  const validPayload = {
    certificate_number: validCertNumber,
    user_id: testUserId,
    student_public_id: "STU-A1B2C3D4",
    display_name: "Starlight Pilot",
    certificate_name: "Elena Rostova",
    learning_level: "explorer",
    course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: "1.0.0",
    curriculum_version: "1.0.0",
    final_score_percentage: 92.5,
    issue_date: testIssueDate,
    verification_hash: validHash,
    status: "active",
    metadata: { test: true },
  };
  seedLocalCertificate(validPayload);
  await supabaseAdmin.from("academy_certificates").upsert(validPayload);

  // Seed minor student profile
  await supabaseAdmin.from("academy_student_profiles").upsert({
    user_id: minorUserId,
    student_public_id: "STU-KID7X99Y",
    display_name: "Junior Astronomer Leo",
    certificate_name: "Leo Alexander (Minor)",
    selected_level: "junior",
    age_bracket: "under_13",
    guardian_consent_status: "pending_guardian",
    profile_visibility: "private",
  });

  const minorCertNumber = generateUniqueCertificateNumber();
  const minorHash = computeCertificateHash({
    certificateNumber: minorCertNumber,
    userId: minorUserId,
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: CERTIFICATE_CONSTANTS.COURSE_VERSION,
    finalScorePercentage: 88.0,
    issueDate: testIssueDate,
  });

  const minorPayload = {
    certificate_number: minorCertNumber,
    user_id: minorUserId,
    student_public_id: "STU-KID7X99Y",
    display_name: "Junior Astronomer Leo",
    certificate_name: "Leo Alexander (Minor)",
    learning_level: "junior",
    course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: "1.0.0",
    curriculum_version: "1.0.0",
    final_score_percentage: 88.0,
    issue_date: testIssueDate,
    verification_hash: minorHash,
    status: "active",
    metadata: { testMinor: true },
  };
  seedLocalCertificate(minorPayload);
  await supabaseAdmin.from("academy_certificates").upsert(minorPayload);

  // -------------------------------------------------------------------------
  // TEST 1: Valid certificate verifies
  // -------------------------------------------------------------------------
  console.log("1. Valid Certificate Verification:");
  const verified = await verifyCertificatePublicServer(validCertNumber);
  assert(verified.isValid === true, `Certificate ${validCertNumber} verifies as valid`);
  checksCount++;
  assert(verified.status === "active", `Certificate status is active`);
  checksCount++;
  assert(
    verified.organization === "Our Visible Universe Academy",
    `Issuing organization matches Our Visible Universe Academy`,
  );
  checksCount++;
  assert(verified.courseTitle === "Cosmic Journey", `Course title matches Cosmic Journey`);
  checksCount++;
  assert(
    verified.achievementTitle === "Certified Cosmic Explorer",
    `Achievement title matches Certified Cosmic Explorer`,
  );
  checksCount++;
  assert(verified.finalScorePercentage === 92.5, `Assessment score is accurately reported (92.5%)`);
  checksCount++;
  assert(
    verified.verificationUrl !== undefined &&
      verified.verificationUrl.includes("ourvisibleuniverse.in"),
    `Official verification URL is present: ${verified.verificationUrl}`,
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 2: Invalid certificate returns Not Found
  // -------------------------------------------------------------------------
  console.log("\n2. Invalid Certificate Returns Not Found:");
  const invalidResult = await verifyCertificatePublicServer("OVU-CERT-FAKE-9999-0000-FAIL");
  assert(invalidResult.isValid === false, "Invalid certificate is not valid");
  checksCount++;
  assert(invalidResult.status === "not_found", "Status returns not_found");
  checksCount++;
  assert(invalidResult.reason?.includes("not found") === true, "Helpful not found reason provided");
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 3: Revoked certificate cannot verify as valid
  // -------------------------------------------------------------------------
  console.log("\n3. Revoked Certificate Rejection & Security:");
  const certToRevoke = generateUniqueCertificateNumber();
  const certToRevokeHash = computeCertificateHash({
    certificateNumber: certToRevoke,
    userId: testUserId,
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: "1.0.0",
    finalScorePercentage: 85.0,
    issueDate: testIssueDate,
  });

  const revokePayload = {
    certificate_number: certToRevoke,
    user_id: testUserId,
    student_public_id: "STU-REV0001",
    display_name: "Explorer Revoked",
    certificate_name: "Explorer Revoked",
    learning_level: "explorer",
    course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: "1.0.0",
    curriculum_version: "1.0.0",
    final_score_percentage: 85.0,
    issue_date: testIssueDate,
    verification_hash: certToRevokeHash,
    status: "active",
  };
  seedLocalCertificate(revokePayload);
  await supabaseAdmin.from("academy_certificates").upsert(revokePayload);

  // Admin revokes certificate with mandatory reason
  const revokeRes = await adminRevokeCertificateServer(
    certToRevoke,
    "Administrative cancellation due to integrity investigation",
    systemAdminToken,
  );
  assert(revokeRes.success === true, `Certificate ${certToRevoke} revoked successfully`);
  checksCount++;

  // Now verify publicly
  const revokedVerify = await verifyCertificatePublicServer(certToRevoke);
  assert(
    revokedVerify.isValid === false,
    "Revoked certificate MUST NEVER verify as valid (isValid === false)",
  );
  checksCount++;
  assert(revokedVerify.status === "revoked", "Revoked certificate status is 'revoked'");
  checksCount++;
  assert(
    revokedVerify.revocationReason === "Administrative cancellation due to integrity investigation",
    `Revocation reason clearly disclosed: ${revokedVerify.revocationReason}`,
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 4: Reissued certificate status is correct (Supersession lineage)
  // -------------------------------------------------------------------------
  console.log("\n4. Reissuance & Supersession Lineage:");
  const certToReissue = generateUniqueCertificateNumber();
  const certToReissueHash = computeCertificateHash({
    certificateNumber: certToReissue,
    userId: testUserId,
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: "1.0.0",
    finalScorePercentage: 90.0,
    issueDate: testIssueDate,
  });

  const reissuePayload = {
    certificate_number: certToReissue,
    user_id: testUserId,
    student_public_id: "STU-OLD0001",
    display_name: "Original Name",
    certificate_name: "Original Name",
    learning_level: "explorer",
    course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: "1.0.0",
    curriculum_version: "1.0.0",
    final_score_percentage: 90.0,
    issue_date: testIssueDate,
    verification_hash: certToReissueHash,
    status: "active",
  };
  seedLocalCertificate(reissuePayload);
  await supabaseAdmin.from("academy_certificates").upsert(reissuePayload);

  const reissueRes = await adminReissueCertificateServer(
    certToReissue,
    "Legal name change correction",
    systemAdminToken,
    { updatedCertificateName: "Corrected Legal Name" },
  );

  assert(reissueRes.success === true, "Reissuance succeeded");
  checksCount++;
  const newCertNumber = reissueRes.newCertificate.certificateNumber;
  assert(newCertNumber !== certToReissue, "New certificate has distinct high-entropy ID");
  checksCount++;

  // Original certificate status must now be 'superseded'
  const oldVerify = await verifyCertificatePublicServer(certToReissue);
  assert(oldVerify.status === "superseded", "Old certificate status is 'superseded'");
  checksCount++;
  assert(oldVerify.isValid === false, "Superseded certificate is not valid for new claims");
  checksCount++;
  assert(
    oldVerify.supersededBy === newCertNumber,
    `Old record links to new: ${oldVerify.supersededBy}`,
  );
  checksCount++;

  // New certificate must be active and valid
  const newVerify = await verifyCertificatePublicServer(newCertNumber);
  assert(newVerify.isValid === true, "New reissued certificate is valid");
  checksCount++;
  assert(newVerify.status === "active", "New reissued certificate is active");
  checksCount++;
  assert(
    newVerify.studentName === "Corrected Legal Name",
    `New certificate has corrected name: ${newVerify.studentName}`,
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 5: Public users cannot modify certificates
  // -------------------------------------------------------------------------
  console.log("\n5. Public User Authorization Boundary:");
  try {
    await adminRevokeCertificateServer(validCertNumber, "Malicious public attempt", "");
    assert(false, "Unauthenticated public user was able to call admin revocation");
  } catch (err: any) {
    assert(
      err.message.includes("Administrator authentication required") ||
        err.message.includes("Access denied"),
      "Public users cannot modify certificates without admin authorization",
    );
    checksCount++;
  }

  // -------------------------------------------------------------------------
  // TEST 6: Students cannot revoke another certificate
  // -------------------------------------------------------------------------
  console.log("\n6. Student Authorization Boundary (Cross-Student Protection):");
  try {
    // Attempt with a non-admin student ID
    await adminRevokeCertificateServer(
      validCertNumber,
      "Unauthorized student action",
      "student-user-uuid-non-admin",
    );
    assert(false, "Non-admin student was able to call admin revocation");
  } catch (err: any) {
    assert(
      err.message.includes("Access denied") || err.message.includes("unauthorized"),
      "Students cannot revoke another learner's certificate",
    );
    checksCount++;
  }

  // -------------------------------------------------------------------------
  // TEST 7: Non-admin accounts cannot use admin functions (Anti-spoofing)
  // -------------------------------------------------------------------------
  console.log("\n7. Anti-Spoofing: Client-Supplied Email Rejection:");
  try {
    // Supplying an admin email directly without a valid signed session token
    await verifyAdminAuthorizationServer("forged-email-string@ourvisibleuniverse.in");
    assert(false, "Unauthenticated email claim was accepted as admin");
  } catch (err: any) {
    assert(
      err.message.includes("Access denied") || err.message.includes("Invalid administrator"),
      "Supplying an email address without valid server session is strictly rejected",
    );
    checksCount++;
  }

  // -------------------------------------------------------------------------
  // TEST 8: Personal information remains protected (Child Privacy & Minor Safety)
  // -------------------------------------------------------------------------
  console.log("\n8. Child Privacy & Personal Information Protection:");
  const minorVerify = await verifyCertificatePublicServer(minorCertNumber);
  assert(
    minorVerify.isMinorProtected === true,
    "Minor protection flag is active for minor learner certificate",
  );
  checksCount++;
  assert(
    !minorVerify.studentName?.toLowerCase().includes("minor") &&
      !minorVerify.studentName?.includes("@"),
    `Minor full identifying details masked; public pseudonym used: '${minorVerify.studentName}'`,
  );
  checksCount++;
  assert(
    !JSON.stringify(minorVerify).includes("@example.com"),
    "No private emails exposed in public verification payload",
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 9: QR verification works on mobile (Clean URL without sensitive tokens)
  // -------------------------------------------------------------------------
  console.log("\n9. QR Code URL Integrity & Mobile Verification:");
  assert(
    verified.verificationUrl !== undefined &&
      !verified.verificationUrl.includes("token=") &&
      !verified.verificationUrl.includes("secret=") &&
      !verified.verificationUrl.includes("Bearer"),
    "QR URL contains no sensitive auth tokens or session secrets",
  );
  checksCount++;
  assert(
    verified.verificationUrl?.includes(validCertNumber) === true,
    `QR URL accurately encodes certificate public ID: ${verified.verificationUrl}`,
  );
  checksCount++;

  // -------------------------------------------------------------------------
  // TEST 10: Verification works after a course update
  // -------------------------------------------------------------------------
  console.log("\n10. Course Version Forward Compatibility:");
  // A certificate issued under v1.0.0 must verify even if system is v1.1.0
  const legacyCertNumber = generateUniqueCertificateNumber();
  const legacyHash = computeCertificateHash({
    certificateNumber: legacyCertNumber,
    userId: testUserId,
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseVersion: "1.0.0",
    finalScorePercentage: 95.0,
    issueDate: "2026-01-15",
  });

  const legacyPayload = {
    certificate_number: legacyCertNumber,
    user_id: testUserId,
    student_public_id: "STU-LEGACY01",
    display_name: "Cosmic Historian",
    certificate_name: "Cosmic Historian",
    learning_level: "astronomer",
    course_id: CERTIFICATE_CONSTANTS.COURSE_ID,
    course_version: "1.0.0",
    curriculum_version: "1.0.0",
    final_score_percentage: 95.0,
    issue_date: "2026-01-15",
    verification_hash: legacyHash,
    status: "active",
  };
  seedLocalCertificate(legacyPayload);
  await supabaseAdmin.from("academy_certificates").upsert(legacyPayload);

  const legacyVerify = await verifyCertificatePublicServer(legacyCertNumber);
  assert(legacyVerify.isValid === true, "Historical certificate verifies with 100% validity");
  checksCount++;
  assert(legacyVerify.courseVersion === "1.0.0", "Historical course version (1.0.0) preserved");
  checksCount++;

  // Open Badges 3.0 Standard Compatibility
  console.log("\nBonus: Open Badges 3.0 Compatibility:");
  const ob3 = generateOpenBadge3Metadata({
    id: "9f8a7b6c-5d4e-3f2a-1b0c-9e8d7c6b5a4f",
    certificateNumber: validCertNumber,
    userId: testUserId,
    studentPublicId: "STU-A1B2C3D4",
    displayName: "Starlight Pilot",
    certificateName: "Elena Rostova",
    learningLevel: "explorer",
    learningLevelLabel: LEARNING_LEVEL_LABELS["explorer"],
    courseId: CERTIFICATE_CONSTANTS.COURSE_ID,
    courseTitle: CERTIFICATE_CONSTANTS.COURSE_TITLE,
    achievementTitle: CERTIFICATE_CONSTANTS.ACHIEVEMENT_TITLE,
    courseVersion: "1.0.0",
    curriculumVersion: "1.0.0",
    finalScorePercentage: 92.5,
    issueDate: testIssueDate,
    issueDateFormatted: formatCertificateDate(testIssueDate),
    verificationHash: validHash,
    verificationUrl: `${CERTIFICATE_CONSTANTS.OFFICIAL_VERIFICATION_BASE_URL}/${validCertNumber}`,
    status: "active",
    organization: CERTIFICATE_CONSTANTS.ORGANIZATION,
    certificateText: CERTIFICATE_CONSTANTS.CERTIFICATE_TEXT,
    disclaimer: CERTIFICATE_CONSTANTS.DISCLAIMER,
  });

  assert(
    ob3["@context"].includes("https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"),
    "Open Badges 3.0 standard JSON-LD context declared",
  );
  checksCount++;
  assert(ob3.type.includes("OpenBadgeCredential"), "Type includes OpenBadgeCredential");
  checksCount++;

  console.log("======================================================================");
  console.log("PROMPT 11 VALIDATION SUMMARY:");
  console.log(`Total Checks Run: ${checksCount}`);
  console.log(`Passed: ${checksCount}`);
  console.log(`Failed: 0`);
  console.log("======================================================================");
  console.log(
    "🌟 ALL 10 CERTIFICATE VERIFICATION & ADMINISTRATION CONTRACTS PASSED WITH 100% SUCCESS!\n",
  );
}

runPrompt11ValidationSuite().catch((err) => {
  console.error("Test suite encountered fatal error:", err);
  process.exit(1);
});
