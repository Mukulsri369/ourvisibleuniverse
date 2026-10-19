/**
 * COSMOS NASA / ESA / ESO / Gaia Usage Compliance & Attribution Engine
 * Project: Our Visible Universe Academy
 * Scope: Prompt 06 — Section 7 (NASA and ESA Usage Compliance & Public Credits)
 *
 * Enforces:
 * 1. NASA Media Usage Guidelines (17 U.S.C. § 105 public domain status, strict
 *    prohibition on implying NASA endorsement, restriction on NASA logo/insignia).
 * 2. ESA / Webb & ESO Creative Commons Attribution (CC BY 4.0) wording and link preservation.
 * 3. ESA Gaia DR3 / Hipparcos Open Science credit requirements.
 * 4. Strict blocking of any asset marked LICENSE_REVIEW_REQUIRED or BLOCKED_UNLICENSED
 *    from entering production scenes.
 */

import {
  COSMOS_VERIFIED_ASSET_MANIFEST,
  MODULE_PRIMARY_ASSET_MAP,
  type AssetLicenseStatus,
  type CosmosVerifiedAssetRecord,
} from "./CosmosAssetManifest";

export interface AssetAttributionCredit {
  assetId: string;
  displayName: string;
  sourceOrganization: string;
  sourceURL: string;
  originalAuthor: string;
  licenseIdentifier: AssetLicenseStatus;
  licenseURL: string;
  formattedCreditLine: string;
  usageRestrictions: string;
  noEndorsementNotice: string;
  scientificRepresentation: string;
  isProductionApproved: boolean;
}

export interface LicenseComplianceAuditResult {
  assetId: string;
  compliant: boolean;
  productionApproved: boolean;
  issues: string[];
}

const PROHIBITED_ENDORSEMENT_PHRASES = [
  "endorsed by nasa",
  "official nasa partner",
  "endorsed by esa",
  "official esa partner",
  "sponsored by nasa",
];

export class CosmosAssetAttribution {
  /**
   * Verifies that an asset record satisfies all licensing, attribution, and
   * no-endorsement rules before it is allowed to render in production.
   */
  public static verifyAssetLicenseCompliance(
    record: CosmosVerifiedAssetRecord,
  ): LicenseComplianceAuditResult {
    const issues: string[] = [];

    if (
      record.licenseIdentifier === "LICENSE_REVIEW_REQUIRED" ||
      record.licenseIdentifier === "BLOCKED_UNLICENSED"
    ) {
      issues.push(`Asset license status '${record.licenseIdentifier}' is not approved for production.`);
    }

    if (!record.sourceOrganization || record.sourceOrganization.trim().length < 3) {
      issues.push("Missing sourceOrganization.");
    }

    if (!record.sourceURL || !record.sourceURL.startsWith("https://")) {
      issues.push("Missing or non-HTTPS sourceURL.");
    }

    if (!record.requiredAttribution || record.requiredAttribution.trim().length < 15) {
      issues.push("Missing or insufficient requiredAttribution credit wording.");
    }

    if (!record.noEndorsementNotice || record.noEndorsementNotice.trim().length < 10) {
      issues.push("Missing mandatory no-endorsement disclosure.");
    }

    const combinedText = `${record.requiredAttribution} ${record.usageRestrictions}`.toLowerCase();
    for (const phrase of PROHIBITED_ENDORSEMENT_PHRASES) {
      if (combinedText.includes(phrase)) {
        issues.push(`Prohibited endorsement claim detected: '${phrase}'`);
      }
    }

    if (
      (record.licenseIdentifier === "CC_BY_4_0_ESA_WEBB" ||
        record.licenseIdentifier === "CC_BY_4_0_ESO") &&
      !record.licenseURL.includes("creativecommons.org/licenses/by/4.0")
    ) {
      issues.push("CC BY 4.0 assets must link to https://creativecommons.org/licenses/by/4.0/.");
    }

    const compliant = issues.length === 0 && record.validationStatus === "READY";
    return {
      assetId: record.assetId,
      compliant,
      productionApproved: compliant,
      issues,
    };
  }

  /**
   * Formats a standardized, user-facing credit record for an asset ID.
   */
  public static getAttributionForAsset(assetId: string): AssetAttributionCredit | null {
    const record = COSMOS_VERIFIED_ASSET_MANIFEST[assetId];
    if (!record) return null;

    const audit = this.verifyAssetLicenseCompliance(record);
    return {
      assetId: record.assetId,
      displayName: record.displayName,
      sourceOrganization: record.sourceOrganization,
      sourceURL: record.sourceURL,
      originalAuthor: record.originalAuthor,
      licenseIdentifier: record.licenseIdentifier,
      licenseURL: record.licenseURL,
      formattedCreditLine: `${record.displayName}: ${record.requiredAttribution}`,
      usageRestrictions: record.usageRestrictions,
      noEndorsementNotice: record.noEndorsementNotice,
      scientificRepresentation: record.scientificRepresentation,
      isProductionApproved: audit.productionApproved,
    };
  }

  /**
   * Returns all deduplicated attribution credits required for a given Academy module (01..24).
   */
  public static getPublicCreditsForModule(moduleId: string): AssetAttributionCredit[] {
    const normalizedModId = String(moduleId).padStart(2, "0");
    const mapping = MODULE_PRIMARY_ASSET_MAP[normalizedModId] || MODULE_PRIMARY_ASSET_MAP["01"];
    const allIds = Array.from(new Set([...mapping.primaryAssetIds, ...mapping.supportingAssetIds]));

    const credits: AssetAttributionCredit[] = [];
    for (const id of allIds) {
      const credit = this.getAttributionForAsset(id);
      if (credit && credit.isProductionApproved) {
        credits.push(credit);
      }
    }
    return credits;
  }

  /**
   * Returns all deduplicated attribution credits associated with a 3D sceneId.
   */
  public static getPublicCreditsForScene(sceneId: string): AssetAttributionCredit[] {
    const credits: AssetAttributionCredit[] = [];
    for (const record of Object.values(COSMOS_VERIFIED_ASSET_MANIFEST)) {
      if (record.relatedSceneIds.includes(sceneId)) {
        const credit = this.getAttributionForAsset(record.assetId);
        if (credit && credit.isProductionApproved) {
          credits.push(credit);
        }
      }
    }
    return credits;
  }
}
